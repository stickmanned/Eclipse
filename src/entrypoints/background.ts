/**
 * Background service worker.
 *
 * Owns: popup requests, tab validation, the single active session, runtime
 * injection of the Eclipse content script, the level-matched generation call,
 * and session replacement across tabs.
 *
 * Does NOT own: answer outcomes. Those have exactly one writer, the content
 * script, which is what removes the popup/background/content race entirely.
 */

import { browser, type Browser } from 'wxt/browser';
import { createSessionId } from '../domain/ids';
import { failure, success, type Result } from '../domain/errors';
import {
  MESSAGE_CONTRACT_VERSION,
  describeRejectedMessage,
  parseMessage,
  type ActivatedData,
  type DeactivatedData,
  type EclipseMessage,
  type GenerateTrapsData,
  type PongData,
  type ResetProfileData,
  type SaveCalibrationData,
  type SetProviderData,
  type SessionStartedData,
  type SessionStoppedData,
  type StatusData,
} from '../domain/messages';
import { classifyUrl } from '../domain/url-support';
import { summarizeMastery } from '../domain/profile';
import { abilityForDelfLevel, type DelfLevel } from '../domain/delf';
import { chromeArea } from '../storage/area';
import { loadProfile, resetProfile, saveProfile } from '../storage/profile-store';
import {
  clearActiveSession,
  isGenerationAuthorized,
  readActiveSession,
  writeActiveSession,
} from '../storage/session-store';
import {
  PROVIDER_ORIGIN,
  PROVIDER_PERMISSION_PATTERN,
  clearProviderSettings,
  readProviderSettings,
  writeProviderSettings,
} from '../storage/provider-settings';
import { generateWithCache } from '../provider/generate-with-cache';
import { clearProviderCache } from '../storage/provider-cache';

/** Built bundle path of the runtime-injected content script. */
const CONTENT_SCRIPT_FILE = '/content-scripts/eclipse.js' as const;

/**
 * The provider origin is compiled in. There is no field anywhere in the UI
 * that lets a page or a user point Eclipse at an arbitrary host.
 */
const PROVIDER_CONFIGURED = PROVIDER_ORIGIN.length > 0;

export default defineBackground(() => {
  const local = chromeArea(browser.storage.local);
  const session = chromeArea(browser.storage.session);

  browser.runtime.onMessage.addListener((raw, sender, sendResponse) => {
    const message = parseMessage(raw);

    // Never leave the channel dangling. A dropped message resolves the sender's
    // promise with `undefined`, which reaches the learner as an error they can
    // neither understand nor act on — the exact failure mode a stale worker
    // produces after a rebuild. Answer with a typed, actionable failure instead.
    if (!message) {
      sendResponse(failure('MESSAGE_UNSUPPORTED', describeRejectedMessage(raw)));
      return false;
    }

    handleMessage(message, sender)
      .then(sendResponse)
      .catch((cause: unknown) => {
        const detail = cause instanceof Error ? cause.message : 'Background handler failed.';
        sendResponse(failure('UNKNOWN_ERROR', detail));
      });

    // Keep the message channel open for the async reply.
    return true;
  });

  // A closed tab must not leave a session pinned.
  browser.tabs.onRemoved.addListener((tabId) => {
    void (async () => {
      const active = await readActiveSession(session);
      if (active?.tabId === tabId) await clearActiveSession(session);
    })();
  });

  // Navigating away tears the runtime down with the document; drop the record.
  browser.tabs.onUpdated.addListener((tabId, changeInfo) => {
    if (changeInfo.status !== 'loading') return;
    void (async () => {
      const active = await readActiveSession(session);
      if (active?.tabId === tabId) await clearActiveSession(session);
    })();
  });

  async function handleMessage(
    message: EclipseMessage,
    sender: Browser.runtime.MessageSender,
  ): Promise<unknown> {
    switch (message.type) {
      case 'START_SESSION':
        return startSession();
      case 'STOP_SESSION':
        return stopSession();
      case 'GET_STATUS':
        return getStatus();
      case 'RESET_PROFILE':
        return doResetProfile(message.confirmed);
      case 'SAVE_CALIBRATION':
        return doSaveCalibration(message.delfLevel);
      case 'SET_PROVIDER':
        return doSetProvider(message.enabled);
      case 'GENERATE_TRAPS':
        return doGenerateTraps(message.sessionId, message.delfLevel, message.sentences, sender);
      // PING / ACTIVATE / DEACTIVATE are addressed to the content script and
      // arrive there by `tabs.sendMessage`, so the worker only ever sees one if
      // a peer is out of step. Say so rather than going quiet.
      default:
        return failure(
          'MESSAGE_UNSUPPORTED',
          `The background worker does not handle ${message.type}.`,
        );
    }
  }

  // -------------------------------------------------------------------------
  // Sessions
  // -------------------------------------------------------------------------

  async function startSession(): Promise<Result<SessionStartedData>> {
    const tab = await activeTab();
    if (!tab || typeof tab.id !== 'number') {
      return failure('UNSUPPORTED_URL', 'No active tab to run Eclipse in.');
    }

    const support = classifyUrl(tab.url);
    if (!support.supported) {
      return failure('UNSUPPORTED_URL');
    }

    const tabId = tab.id;

    // One session at a time. Replacing means tearing the old one down first;
    // if that tab has gone away, the stale record is simply cleared.
    const existing = await readActiveSession(session);
    if (existing && existing.tabId !== tabId) {
      await sendToTab(existing.tabId, { type: 'DEACTIVATE', reason: 'replaced' });
      await clearActiveSession(session);
    }

    const ready = await ensureRuntime(tabId);
    if (!ready.ok) return ready;

    const providerEnabled = PROVIDER_CONFIGURED && (await hasProviderPermission());
    const sessionId = createSessionId();

    // The content runtime may need generation to finish ACTIVATE. Persist the
    // exact pending owner first so that request is authorized, then promote it
    // only after activation succeeds.
    const pending = await writeActiveSession(session, {
      sessionId,
      tabId,
      startedAt: new Date().toISOString(),
      phase: 'pending',
    });
    if (!pending.ok) return pending;

    const activated = await sendToTab<ActivatedData>(tabId, {
      type: 'ACTIVATE',
      sessionId,
      providerEnabled,
    });

    if (!activated.ok) {
      await clearSessionIfMatches(sessionId);
      return activated;
    }

    const promoted = await writeActiveSession(session, {
      sessionId,
      tabId,
      startedAt: pending.data.startedAt,
      phase: 'active',
    });
    if (!promoted.ok) {
      await sendToTab(tabId, { type: 'DEACTIVATE', sessionId, reason: 'reset' });
      await clearSessionIfMatches(sessionId);
      return promoted;
    }

    // All generation batches have settled before ACTIVATE succeeds. Clear a
    // stale per-batch error so a successful first click never leaves the popup
    // claiming that the provider failed.
    if (providerEnabled) {
      await writeProviderSettings(local, { enabled: true, lastError: null });
    }

    return success({ sessionId, tabId, trapCount: activated.data.trapCount });
  }

  async function stopSession(): Promise<Result<SessionStoppedData>> {
    const active = await readActiveSession(session);
    if (!active) return success({ restored: false });

    const stopped = await sendToTab<DeactivatedData>(active.tabId, {
      type: 'DEACTIVATE',
      sessionId: active.sessionId,
      reason: 'user',
    });

    await clearActiveSession(session);

    if (!stopped.ok) {
      // The tab is gone or the runtime never attached. The session record is
      // cleared either way, so the popup returns to Ready rather than sticking.
      return success({ restored: false });
    }
    return success({ restored: stopped.data.restored });
  }

  /**
   * PING first, inject only if nobody answers. This is what keeps repeated
   * activation from stacking runtimes in one tab.
   */
  async function ensureRuntime(tabId: number): Promise<Result<PongData>> {
    const pong = await sendToTab<PongData>(tabId, { type: 'PING' });
    if (pong.ok) return pong;

    try {
      await browser.scripting.executeScript({
        target: { tabId },
        files: [CONTENT_SCRIPT_FILE],
      });
    } catch (cause) {
      const detail = cause instanceof Error ? cause.message : 'injection failed';
      return failure('CONTENT_SCRIPT_UNAVAILABLE', detail);
    }

    const retry = await sendToTab<PongData>(tabId, { type: 'PING' });
    if (!retry.ok) return failure('CONTENT_SCRIPT_UNAVAILABLE');
    return retry;
  }

  // -------------------------------------------------------------------------
  // Status
  // -------------------------------------------------------------------------

  async function getStatus(): Promise<Result<StatusData>> {
    const tab = await activeTab();
    const page = classifyUrl(tab?.url);
    const active = await readActiveSession(session);
    const providerSettings = await readProviderSettings(local);
    const now = new Date();

    const loaded = await loadProfile(local);
    if (!loaded.ok) {
      return success({
        contractVersion: MESSAGE_CONTRACT_VERSION,
        activeTabId: active?.tabId ?? null,
        activeSessionId: active?.sessionId ?? null,
        activeHere: active?.tabId === tab?.id,
        page,
        calibrationCompleted: false,
        delfLevel: 'B1',
        globalAbility: 0,
        phase: 'new_moon',
        summary: {
          tracked: 0,
          attempts: 0,
          correct: 0,
          due: 0,
          byPhase: { new_moon: 0, crescent: 0, half: 0, full: 0 },
          overallPhase: 'new_moon',
        },
        provider: {
          configured: PROVIDER_CONFIGURED,
          enabled: PROVIDER_CONFIGURED,
          permissionGranted: await hasProviderPermission(),
          lastError: providerSettings.lastError,
        },
        profileError: loaded.error.message,
      });
    }

    const profile = loaded.data.profile;
    const summary = summarizeMastery(profile, now);

    return success({
      contractVersion: MESSAGE_CONTRACT_VERSION,
      activeTabId: active?.tabId ?? null,
      activeSessionId: active?.sessionId ?? null,
      activeHere: active !== null && active.tabId === tab?.id,
      page,
      calibrationCompleted: profile.calibrationCompleted,
      delfLevel: profile.delfLevel,
      globalAbility: profile.globalAbility,
      phase: summary.overallPhase,
      summary,
      provider: {
        configured: PROVIDER_CONFIGURED,
        enabled: PROVIDER_CONFIGURED,
        permissionGranted: await hasProviderPermission(),
        lastError: providerSettings.lastError,
      },
      profileError: null,
    });
  }

  // -------------------------------------------------------------------------
  // Profile commands from the popup
  // -------------------------------------------------------------------------

  async function doResetProfile(confirmed: boolean): Promise<Result<ResetProfileData>> {
    if (!confirmed) {
      return failure('UNKNOWN_ERROR', 'Reset requires confirmation.');
    }

    const active = await readActiveSession(session);
    if (active) {
      await sendToTab(active.tabId, { type: 'DEACTIVATE', reason: 'reset' });
      await clearActiveSession(session);
    }

    const reset = await resetProfile(local);
    if (!reset.ok) return reset;

    const cacheReset = await clearProviderCache(local);
    if (!cacheReset.ok) return cacheReset;

    const settingsReset = await clearProviderSettings(local);
    if (!settingsReset.ok) return settingsReset;
    if (!(await revokeProviderPermission())) return failure('PROVIDER_PERMISSION_DENIED');
    return success({ reset: true });
  }

  async function doSaveCalibration(delfLevel: DelfLevel): Promise<Result<SaveCalibrationData>> {
    const loaded = await loadProfile(local);
    if (!loaded.ok) return loaded;

    const globalAbility = abilityForDelfLevel(delfLevel);

    const saved = await saveProfile(local, {
      ...loaded.data.profile,
      calibrationCompleted: true,
      delfLevel,
      globalAbility,
    });
    if (!saved.ok) return saved;
    return success({ globalAbility, delfLevel });
  }

  // -------------------------------------------------------------------------
  // Always-on provider
  // -------------------------------------------------------------------------

  /**
   * Legacy message compatibility. AI generation is always enabled, so an old
   * popup asking to disable it receives the actual, unchanged state.
   */
  async function doSetProvider(_enabled: boolean): Promise<Result<SetProviderData>> {
    if (!PROVIDER_CONFIGURED) return failure('PROVIDER_DISABLED');

    const granted = await hasProviderPermission();
    if (!granted) {
      await writeProviderSettings(local, {
        enabled: true,
        lastError: 'Permission for the local generation API was not granted.',
      });
      return failure('PROVIDER_PERMISSION_DENIED');
    }

    const written = await writeProviderSettings(local, { enabled: true, lastError: null });
    if (!written.ok) return written;
    return success({ enabled: true, permissionGranted: granted });
  }

  async function hasProviderPermission(): Promise<boolean> {
    if (!PROVIDER_CONFIGURED) return false;
    try {
      return await browser.permissions.contains({ origins: [PROVIDER_PERMISSION_PATTERN] });
    } catch {
      return false;
    }
  }

  async function revokeProviderPermission(): Promise<boolean> {
    if (!PROVIDER_CONFIGURED) return true;
    try {
      // The loopback origin is a required, non-removable permission. Keep this
      // branch for older development builds that still stored it as optional.
      if (browser.runtime.getManifest().host_permissions?.includes(PROVIDER_PERMISSION_PATTERN)) {
        return true;
      }
      if (!(await hasProviderPermission())) return true;
      return await browser.permissions.remove({ origins: [PROVIDER_PERMISSION_PATTERN] });
    } catch {
      return false;
    }
  }

  async function doGenerateTraps(
    sessionId: string,
    delfLevel: DelfLevel,
    sentences: { id: string; text: string }[],
    sender: Browser.runtime.MessageSender,
  ): Promise<Result<GenerateTrapsData>> {
    // Only the content script of the tab that owns the session may ask.
    const active = await readActiveSession(session);
    if (!isGenerationAuthorized(active, sender.tab?.id, sessionId)) {
      return failure('SESSION_REPLACED', 'This tab does not own the active Eclipse session.');
    }

    if (!(await hasProviderPermission())) {
      await writeProviderSettings(local, {
        enabled: true,
        lastError: 'Permission for the local generation API is not granted.',
      });
      return failure('PROVIDER_PERMISSION_DENIED');
    }

    const result = await generateWithCache(sentences, delfLevel, local);
    await writeProviderSettings(local, {
      enabled: true,
      lastError: result.ok ? null : result.error.message,
    });

    if (!result.ok) return result;
    return success({ candidates: result.data });
  }

  // -------------------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------------------

  async function activeTab(): Promise<Browser.tabs.Tab | undefined> {
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
    return tab;
  }

  async function clearSessionIfMatches(sessionId: string): Promise<void> {
    const current = await readActiveSession(session);
    if (current?.sessionId === sessionId) await clearActiveSession(session);
  }

  /**
   * Send to a tab and turn "no receiver" into a typed failure. `sendMessage`
   * rejects when nothing is listening, which is the normal case before the
   * runtime is injected — not an error worth logging.
   */
  async function sendToTab<T>(tabId: number, message: EclipseMessage): Promise<Result<T>> {
    try {
      const response: unknown = await browser.tabs.sendMessage(tabId, message);
      if (response && typeof response === 'object' && 'ok' in response) {
        return response as Result<T>;
      }
      return failure('CONTENT_SCRIPT_UNAVAILABLE', 'The Eclipse runtime returned nothing.');
    } catch {
      return failure('CONTENT_SCRIPT_UNAVAILABLE');
    }
  }
});
