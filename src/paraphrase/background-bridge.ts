/**
 * Paraphrase Mode's half of the background worker.
 *
 * Registered from the background entrypoint and owns, for this mode only, what
 * `background.ts` owns for Translate Mode: tab validation, the single active
 * session, runtime injection, the generation call, and the serialized profile
 * writer. Nothing here reads or writes Translate Mode's session, profile or
 * provider settings — the two modes share a worker, not state.
 *
 * One deliberate refusal: Paraphrase Mode will not start in a tab that already
 * has a Translate Mode session running. Both modes replace spans of the same
 * article, and a page carrying gold French substitutions *and* periwinkle
 * simplifications is not two features, it is an unreadable page whose original
 * text the reader can no longer reconstruct. The popup offers to end the other
 * session first rather than doing it silently.
 */

import { browser, type Browser } from 'wxt/browser';
import { z } from 'zod';
import { createSessionId } from '../domain/ids';
import { failure, success, type Result } from '../domain/errors';
import { classifyUrl } from '../domain/url-support';
import { chromeArea, guarded, type StorageArea } from '../storage/area';
import { loadProfile } from '../storage/profile-store';
import { readActiveSession } from '../storage/session-store';
import { PROVIDER_ORIGIN, PROVIDER_PERMISSION_PATTERN } from '../storage/provider-settings';
import {
  loadParaphraseProfile,
  loadSeededParaphraseProfile,
  resetParaphraseProfile,
  saveParaphraseProfile,
} from '../storage/paraphrase-store';
import { clearParaphraseCache } from '../storage/paraphrase-cache';
import {
  applyParaphraseAnswer,
  applyParaphraseManualRequest,
  dueConcepts,
  summarizeParaphraseProfile,
  type ParaphraseProfile,
} from '../domain/paraphrase-profile';
import { bandWindow, targetComplexity, weakestRegisters } from '../domain/complexity';
import type { ParaphraseConceptId } from '../domain/paraphrase';
import {
  fetchSelectionParaphrase,
  generateParaphrasesWithCache,
} from '../provider/paraphrase-client';
import { PortRpc, type PortLike } from './port-rpc';
import {
  PARAPHRASE_CONTENT_SCRIPT,
  PARAPHRASE_CONTRACT_VERSION,
  POPUP_PORT,
  TAB_PORT,
  popupRequestSchema,
  runtimeRequestSchema,
  type ActivatedData,
  type GeneratedData,
  type HelloData,
  type ParaphrasePlan,
  type ParaphraseStatusData,
  type RecordedData,
  type SimplifiedSelectionData,
  type StartedData,
  type StoppedData,
} from './protocol';

const PARAPHRASE_SESSION_KEY = 'eclipse:paraphrase-session:v1';

/** How long the worker waits for a runtime to say hello before injecting it. */
const HELLO_TIMEOUT_MS = 1_500;
/** Server-bound work; the client has its own, shorter, per-attempt timeout. */
const GENERATION_TIMEOUT_MS = 90_000;

const PROVIDER_CONFIGURED = PROVIDER_ORIGIN.length > 0;

const sessionRecordSchema = z.object({
  sessionId: z.string().min(1),
  tabId: z.number().int(),
  startedAt: z.string(),
  phase: z.enum(['pending', 'active']),
  itemCount: z.number().int().min(0),
  lastError: z.string().nullable(),
});

type SessionRecord = z.infer<typeof sessionRecordSchema>;

/**
 * Wire Paraphrase Mode into the background worker.
 *
 * Safe to call once, from `defineBackground`. Everything it registers is
 * additive: a `runtime.onConnect` listener the rest of the extension does not
 * use, and two tab listeners scoped to this mode's own session key.
 */
export function registerParaphraseBridge(): void {
  const local = chromeArea(browser.storage.local);
  const sessionArea = chromeArea(browser.storage.session);

  /** Every write to the paraphrase profile goes through here, in order. */
  let writeQueue: Promise<void> = Promise.resolve();
  const popups = new Set<PortRpc>();
  const tabChannels = new Map<number, PortRpc>();

  // -------------------------------------------------------------------------
  // Session record
  // -------------------------------------------------------------------------

  async function readSession(): Promise<SessionRecord | null> {
    const read = await guarded(() => sessionArea.get(PARAPHRASE_SESSION_KEY));
    if (!read.ok) return null;
    const parsed = sessionRecordSchema.safeParse(read.data);
    return parsed.success ? parsed.data : null;
  }

  async function writeSession(record: SessionRecord): Promise<Result<SessionRecord>> {
    const written = await guarded(() => sessionArea.set(PARAPHRASE_SESSION_KEY, record));
    if (!written.ok) return written;
    return success(record);
  }

  async function clearSession(): Promise<void> {
    await guarded(() => sessionArea.remove(PARAPHRASE_SESSION_KEY));
  }

  async function clearSessionIfMatches(sessionId: string): Promise<void> {
    const current = await readSession();
    if (current?.sessionId === sessionId) await clearSession();
  }

  async function noteError(message: string | null): Promise<void> {
    const current = await readSession();
    if (!current) return;
    await writeSession({ ...current, lastError: message });
  }

  // -------------------------------------------------------------------------
  // Channels
  // -------------------------------------------------------------------------

  function attachTab(tabId: number, port: PortLike): PortRpc {
    const rpc = new PortRpc(port);
    rpc.serve((payload) => handleRuntimeRequest(tabId, payload));
    tabChannels.set(tabId, rpc);
    return rpc;
  }

  /** An open channel to the tab, or a failure if nothing is listening there. */
  async function channelFor(tabId: number): Promise<Result<PortRpc>> {
    const existing = tabChannels.get(tabId);
    if (existing && !existing.isClosed) return success(existing);

    let port: Browser.runtime.Port;
    try {
      port = browser.tabs.connect(tabId, { name: TAB_PORT });
    } catch (cause) {
      const detail = cause instanceof Error ? cause.message : 'the tab refused a connection';
      return failure('CONTENT_SCRIPT_UNAVAILABLE', detail);
    }

    // `connect` never rejects: on a tab with no runtime yet — the normal case
    // on the very first activation, before injection — the port simply fires
    // `onDisconnect` with `runtime.lastError` set. `PortRpc` already turns that
    // into a typed failure below; this listener's only job is to read the
    // error so Chrome does not log it as unchecked.
    port.onDisconnect.addListener(() => {
      void browser.runtime.lastError;
    });

    const rpc = attachTab(tabId, port);
    const hello = await rpc.request<HelloData>({ type: 'HELLO' }, HELLO_TIMEOUT_MS);
    if (hello.ok) return success(rpc);

    rpc.disconnect();
    tabChannels.delete(tabId);
    return failure('CONTENT_SCRIPT_UNAVAILABLE');
  }

  /**
   * Connect first, inject only if nobody answers. This is what keeps repeated
   * activation from stacking runtimes in one tab.
   */
  async function ensureRuntime(tabId: number): Promise<Result<PortRpc>> {
    const first = await channelFor(tabId);
    if (first.ok) return first;

    try {
      await browser.scripting.executeScript({
        target: { tabId },
        files: [PARAPHRASE_CONTENT_SCRIPT],
      });
    } catch (cause) {
      const detail = cause instanceof Error ? cause.message : 'injection failed';
      return failure('CONTENT_SCRIPT_UNAVAILABLE', detail);
    }

    return channelFor(tabId);
  }

  browser.runtime.onConnect.addListener((port) => {
    if (port.name === POPUP_PORT) {
      const rpc = new PortRpc(port);
      rpc.serve(handlePopupRequest);
      popups.add(rpc);
      port.onDisconnect.addListener(() => popups.delete(rpc));
      return;
    }

    // A runtime reconnecting after the worker was torn down. It knows which tab
    // it is; the worker learns that from the sender rather than from the page.
    if (port.name === TAB_PORT) {
      const tabId = port.sender?.tab?.id;
      if (typeof tabId !== 'number') {
        port.disconnect();
        return;
      }
      const rpc = attachTab(tabId, port);
      port.onDisconnect.addListener(() => {
        if (tabChannels.get(tabId) === rpc) tabChannels.delete(tabId);
      });
    }
  });

  // A closed tab must not leave a session pinned.
  browser.tabs.onRemoved.addListener((tabId) => {
    void (async () => {
      tabChannels.delete(tabId);
      const active = await readSession();
      if (active?.tabId === tabId) await clearSession();
    })();
  });

  // Navigating away tears the runtime down with the document; drop the record.
  browser.tabs.onUpdated.addListener((tabId, changeInfo) => {
    if (changeInfo.status !== 'loading') return;
    void (async () => {
      tabChannels.delete(tabId);
      const active = await readSession();
      if (active?.tabId === tabId) await clearSession();
    })();
  });

  // -------------------------------------------------------------------------
  // Profile access
  // -------------------------------------------------------------------------

  /** The learner's Translate Mode DELF lens, read-only, used only as a seed. */
  async function delfLevel(): Promise<'A1' | 'A2' | 'B1' | 'B2'> {
    const loaded = await loadProfile(local);
    return loaded.ok ? loaded.data.profile.delfLevel : 'B1';
  }

  function planFor(profile: ParaphraseProfile): ParaphrasePlan {
    return {
      window: bandWindow(profile.band),
      target: targetComplexity(profile.band),
      focusRegisters: weakestRegisters(profile.registers, 2),
      dueConceptIds: dueConcepts(profile, 24).map((entry) => entry.conceptId),
    };
  }

  async function currentProfile(): Promise<Result<ParaphraseProfile>> {
    return loadSeededParaphraseProfile(local, await delfLevel());
  }

  function pushSnapshot(profile: ParaphraseProfile): void {
    if (popups.size === 0) return;
    const snapshot = summarizeParaphraseProfile(profile);
    for (const popup of popups) popup.emit({ type: 'SNAPSHOT', snapshot });
  }

  /**
   * Serialize profile writes.
   *
   * Two answers can legitimately be in flight — a fast reader clicking a second
   * token before the first round-trip lands — and a read-modify-write race on
   * one storage key silently drops one of them. This is the same seam
   * `RECORD_ANSWER` uses, for the same reason.
   */
  function enqueue<T>(work: () => Promise<Result<T>>): Promise<Result<T>> {
    const pending = writeQueue.then(work);
    writeQueue = pending.then(
      () => undefined,
      () => undefined,
    );
    return pending;
  }

  async function hasProviderPermission(): Promise<boolean> {
    if (!PROVIDER_CONFIGURED) return false;
    try {
      return await browser.permissions.contains({ origins: [PROVIDER_PERMISSION_PATTERN] });
    } catch {
      return false;
    }
  }

  // -------------------------------------------------------------------------
  // Popup requests
  // -------------------------------------------------------------------------

  async function handlePopupRequest(payload: unknown): Promise<Result<unknown>> {
    const parsed = popupRequestSchema.safeParse(payload);
    if (!parsed.success) {
      return failure('MESSAGE_UNSUPPORTED', 'Paraphrase Mode did not understand that request.');
    }

    switch (parsed.data.type) {
      case 'STATUS':
        return status();
      case 'START':
        return start();
      case 'STOP':
        return stop();
      case 'RESET':
        return reset(parsed.data.confirmed);
    }
  }

  async function status(): Promise<Result<ParaphraseStatusData>> {
    const tab = await activeTab();
    const active = await readSession();
    const level = await delfLevel();
    const loaded = await loadParaphraseProfile(local);
    const translate = await readActiveSession(sessionArea);

    if (!loaded.ok) return loaded;

    return success({
      contractVersion: PARAPHRASE_CONTRACT_VERSION,
      activeTabId: active?.tabId ?? null,
      activeSessionId: active?.sessionId ?? null,
      activeHere: active !== null && active.tabId === tab?.id,
      translateActiveHere: translate !== null && translate.tabId === tab?.id,
      page: classifyUrl(tab?.url),
      delfLevel: level,
      snapshot: summarizeParaphraseProfile(loaded.data.profile),
      itemCount: active?.itemCount ?? 0,
      provider: {
        configured: PROVIDER_CONFIGURED,
        permissionGranted: await hasProviderPermission(),
        lastError: active?.lastError ?? null,
      },
    });
  }

  async function start(): Promise<Result<StartedData>> {
    const tab = await activeTab();
    if (!tab || typeof tab.id !== 'number') {
      return failure('UNSUPPORTED_URL', 'No active tab to run Paraphrase Mode in.');
    }
    if (!classifyUrl(tab.url).supported) return failure('UNSUPPORTED_URL');

    const tabId = tab.id;

    // Refuse rather than silently ending someone else's session. See the file
    // header: two lenses on one article is not a feature.
    const translate = await readActiveSession(sessionArea);
    if (translate && translate.tabId === tabId) {
      return failure(
        'SESSION_REPLACED',
        'Translate Mode is running on this page. End it before starting Paraphrase Mode.',
      );
    }

    // One paraphrase session at a time, across all tabs.
    const existing = await readSession();
    if (existing && existing.tabId !== tabId) {
      const other = await channelFor(existing.tabId);
      if (other.ok) await other.data.request({ type: 'DEACTIVATE' });
      await clearSession();
    }

    const profile = await currentProfile();
    if (!profile.ok) return profile;

    const runtime = await ensureRuntime(tabId);
    if (!runtime.ok) return runtime;

    const sessionId = createSessionId();
    const startedAt = new Date().toISOString();

    // Persist the pending owner first, so the runtime's generation requests are
    // authorized while activation is still in flight, then promote it.
    const pending = await writeSession({
      sessionId,
      tabId,
      startedAt,
      phase: 'pending',
      itemCount: 0,
      lastError: null,
    });
    if (!pending.ok) return pending;

    const activated = await runtime.data.request<ActivatedData>(
      { type: 'ACTIVATE', sessionId, plan: planFor(profile.data) },
      GENERATION_TIMEOUT_MS,
    );

    if (!activated.ok) {
      await clearSessionIfMatches(sessionId);
      return activated;
    }

    const promoted = await writeSession({
      sessionId,
      tabId,
      startedAt,
      phase: 'active',
      itemCount: activated.data.itemCount,
      lastError: null,
    });
    if (!promoted.ok) {
      await runtime.data.request({ type: 'DEACTIVATE', sessionId });
      await clearSessionIfMatches(sessionId);
      return promoted;
    }

    return success({ sessionId, tabId, itemCount: activated.data.itemCount });
  }

  async function stop(): Promise<Result<StoppedData>> {
    const active = await readSession();
    if (!active) return success({ restored: false });

    const channel = await channelFor(active.tabId);
    await clearSession();
    if (!channel.ok) return success({ restored: false });

    const stopped = await channel.data.request<{ restored: boolean }>({
      type: 'DEACTIVATE',
      sessionId: active.sessionId,
    });
    return success({ restored: stopped.ok ? stopped.data.restored : false });
  }

  async function reset(confirmed: boolean): Promise<Result<{ reset: true }>> {
    if (!confirmed) return failure('UNKNOWN_ERROR', 'Reset requires confirmation.');

    await stop();
    const fresh = await resetParaphraseProfile(local);
    if (!fresh.ok) return fresh;
    const cache = await clearParaphraseCache(local);
    if (!cache.ok) return cache;

    pushSnapshot(fresh.data);
    return success({ reset: true });
  }

  // -------------------------------------------------------------------------
  // Runtime requests
  // -------------------------------------------------------------------------

  async function authorize(tabId: number, sessionId: string): Promise<Result<SessionRecord>> {
    const active = await readSession();
    if (!active || active.tabId !== tabId || active.sessionId !== sessionId) {
      return failure('SESSION_REPLACED', 'This tab does not own the active Paraphrase session.');
    }
    return success(active);
  }

  async function handleRuntimeRequest(tabId: number, payload: unknown): Promise<Result<unknown>> {
    const parsed = runtimeRequestSchema.safeParse(payload);
    if (!parsed.success) {
      return failure('MESSAGE_UNSUPPORTED', 'Paraphrase Mode did not understand that request.');
    }
    const request = parsed.data;

    const authorized = await authorize(tabId, request.sessionId);
    if (!authorized.ok) return authorized;

    switch (request.type) {
      case 'GENERATE':
        return generate(request.sentences);
      case 'SIMPLIFY_SELECTION':
        return simplify(request.sentence, request.selection);
      case 'RECORD':
        return enqueue(() =>
          record({
            interactionId: request.interactionId,
            conceptId: request.conceptId as ParaphraseConceptId,
            original: request.original,
            simplified: request.simplified,
            register: request.register,
            complexity: request.complexity,
            correct: request.correct,
          }),
        );
      case 'RECORD_MANUAL':
        return enqueue(() =>
          record({
            interactionId: request.interactionId,
            conceptId: request.conceptId as ParaphraseConceptId,
            original: request.original,
            simplified: request.simplified,
            register: request.register,
            complexity: request.complexity,
            correct: null,
          }),
        );
    }
  }

  async function generationContext(profile: ParaphraseProfile) {
    return {
      target: targetComplexity(profile.band),
      window: bandWindow(profile.band),
      focusRegisters: weakestRegisters(profile.registers, 2),
      // Bare wordings only. No counts, no dates, nothing that could be used to
      // reconstruct when or how often the learner failed.
      reinforce: dueConcepts(profile, 12).map((entry) => entry.record.original),
    };
  }

  async function generate(
    sentences: readonly { id: string; text: string }[],
  ): Promise<Result<GeneratedData>> {
    if (!(await hasProviderPermission())) {
      await noteError('Permission for the local generation API is not granted.');
      return failure('PROVIDER_PERMISSION_DENIED');
    }

    const profile = await currentProfile();
    if (!profile.ok) return profile;

    const generated = await generateParaphrasesWithCache(
      sentences,
      await generationContext(profile.data),
      local,
    );
    await noteError(generated.ok ? null : generated.error.message);
    if (!generated.ok) return generated;

    return success({ candidates: generated.data });
  }

  async function simplify(
    sentence: string,
    selection: string,
  ): Promise<Result<SimplifiedSelectionData>> {
    if (!(await hasProviderPermission())) {
      await noteError('Permission for the local generation API is not granted.');
      return failure('PROVIDER_PERMISSION_DENIED');
    }

    const profile = await currentProfile();
    if (!profile.ok) return profile;

    const generated = await fetchSelectionParaphrase(
      sentence,
      selection,
      await generationContext(profile.data),
    );
    await noteError(generated.ok ? null : generated.error.message);
    if (!generated.ok) return generated;

    const first = generated.data[0];
    if (!first) {
      return failure(
        'PROVIDER_INVALID_RESPONSE',
        'Eclipse n’a pas pu simplifier cette sélection. Essayez un passage un peu plus long.',
      );
    }
    return success({ item: first.item });
  }

  interface RecordInput {
    readonly interactionId: string;
    readonly conceptId: ParaphraseConceptId;
    readonly original: string;
    readonly simplified: string;
    readonly register: ParaphraseProfile['concepts'][string]['register'];
    readonly complexity: number;
    /** `null` means the learner asked for this rather than answering it. */
    readonly correct: boolean | null;
  }

  async function record(input: RecordInput): Promise<Result<RecordedData>> {
    const loaded = await currentProfile();
    if (!loaded.ok) return loaded;

    const applied =
      input.correct === null
        ? applyParaphraseManualRequest(loaded.data, input)
        : applyParaphraseAnswer(loaded.data, { ...input, correct: input.correct });

    if (applied.applied) {
      const saved = await saveParaphraseProfile(local, applied.profile);
      if (!saved.ok) return saved;
    }

    pushSnapshot(applied.profile);

    return success({
      applied: applied.applied,
      direction: applied.direction,
      band: applied.profile.band,
      target: targetComplexity(applied.profile.band),
      state: applied.record.state,
      owed: applied.record.due === 'next_occurrence',
      plan: planFor(applied.profile),
    });
  }

  async function activeTab(): Promise<Browser.tabs.Tab | undefined> {
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
    return tab;
  }
}

/** Exported for tests: the storage key this mode owns in `storage.session`. */
export { PARAPHRASE_SESSION_KEY };
export type { SessionRecord };

/** Exported for tests: read a paraphrase session record from any area. */
export async function readParaphraseSession(area: StorageArea): Promise<SessionRecord | null> {
  const read = await guarded(() => area.get(PARAPHRASE_SESSION_KEY));
  if (!read.ok) return null;
  const parsed = sessionRecordSchema.safeParse(read.data);
  return parsed.success ? parsed.data : null;
}
