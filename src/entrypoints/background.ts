/**
 * Background service worker.
 *
 * Owns: popup requests, tab validation, the single active session, runtime
 * injection of the Eclipse content script, the optional provider permission and
 * network call, and session replacement across tabs.
 *
 * Does NOT own: answer outcomes. Those have exactly one writer, the content
 * script, which is what removes the popup/background/content race entirely.
 */

import { browser, type Browser } from 'wxt/browser';
import { createSessionId } from '../domain/ids';
import { failure, success, type Result } from '../domain/errors';
import {
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
import { checkProviderHealth } from '../provider/client';
import { clearProviderCache } from '../storage/provider-cache';

/** Built bundle path of the runtime-injected content script. */
const CONTENT_SCRIPT_FILE = '/content-scripts/eclipse.js' as const;

/**
 * The optional provider is only ever offered when a server origin was compiled
 * in. There is no field anywhere in the UI that lets a page or a user point
 * Eclipse at an arbitrary host.
 */
const PROVIDER_CONFIGURED = PROVIDER_ORIGIN.length > 0;

const HOST_PATTERN_RE =
  /^(\*|[a-z][a-z0-9+.-]*):\/\/(\*|(?:\*\.)?[^/:]+)(?::(\*|\d+))?\/.*$/i;

/**
 * Whether a required host-permission pattern grants access to everything a
 * narrower target pattern would. A required pattern with no port (e.g.
 * `http://localhost/*`) matches every port for that host, which is exactly
 * what WXT's dev server injects — so it silently covers the provider's
 * `http://localhost:8787/*` even though the strings never match exactly.
 */
function hostPatternCovers(requiredPattern: string, targetPattern: string): boolean {
  const required = HOST_PATTERN_RE.exec(requiredPattern);
  const target = HOST_PATTERN_RE.exec(targetPattern);
  if (!required || !target) return false;
  const [, requiredScheme, requiredHost, requiredPort] = required;
  const [, targetScheme, targetHost, targetPort] = target;
  if (requiredScheme !== '*' && requiredScheme !== targetScheme) return false;
  if (requiredHost !== '*' && requiredHost !== targetHost) return false;
  if (requiredPort == null || requiredPort === '*') return true;
  return requiredPort === targetPort;
}

export default defineBackground(() => {
  const local = chromeArea(browser.storage.local);
  const session = chromeArea(browser.storage.session);

  browser.runtime.onMessage.addListener((raw, sender, sendResponse) => {
    const message = parseMessage(raw);
    if (!message) {
      sendResponse(failure('UNKNOWN_ERROR', 'Unrecognised message.'));
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
        return doSaveCalibration(message.globalAbility);
      case 'SET_PROVIDER':
        return doSetProvider(message.enabled);
      case 'GENERATE_TRAPS':
        return doGenerateTraps(message.sessionId, message.sentences, sender);
      // PING / ACTIVATE / DEACTIVATE are addressed to the content script. The
      // worker never answers them.
      default:
        return failure('UNKNOWN_ERROR', `The background worker does not handle ${message.type}.`);
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

    const providerSettings = await readProviderSettings(local);
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
      providerEnabled: providerSettings.enabled,
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
        activeTabId: active?.tabId ?? null,
        activeSessionId: active?.sessionId ?? null,
        activeHere: active?.tabId === tab?.id,
        page,
        calibrationCompleted: false,
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
          enabled: providerSettings.enabled,
          permissionGranted: await hasProviderPermission(),
          lastError: providerSettings.lastError,
        },
        profileError: loaded.error.message,
      });
    }

    const profile = loaded.data.profile;
    const summary = summarizeMastery(profile, now);

    return success({
      activeTabId: active?.tabId ?? null,
      activeSessionId: active?.sessionId ?? null,
      activeHere: active !== null && active.tabId === tab?.id,
      page,
      calibrationCompleted: profile.calibrationCompleted,
      globalAbility: profile.globalAbility,
      phase: summary.overallPhase,
      summary,
      provider: {
        configured: PROVIDER_CONFIGURED,
        enabled: providerSettings.enabled,
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

  async function doSaveCalibration(globalAbility: number): Promise<Result<SaveCalibrationData>> {
    const loaded = await loadProfile(local);
    if (!loaded.ok) return loaded;

    const saved = await saveProfile(local, {
      ...loaded.data.profile,
      calibrationCompleted: true,
      globalAbility,
    });
    if (!saved.ok) return saved;
    return success({ globalAbility });
  }

  // -------------------------------------------------------------------------
  // Optional provider
  // -------------------------------------------------------------------------

  /**
   * Persist the optional-provider toggle.
   *
   * The permission prompt itself belongs to the popup — `permissions.request`
   * needs a user gesture — so by the time this runs the grant has either
   * happened or been refused. Enabling without the grant is refused here rather
   * than stored and discovered later.
   */
  async function doSetProvider(enabled: boolean): Promise<Result<SetProviderData>> {
    if (!PROVIDER_CONFIGURED) return failure('PROVIDER_DISABLED');

    const granted = await hasProviderPermission();
    if (enabled && !granted) {
      await writeProviderSettings(local, {
        enabled: false,
        lastError: 'Permission for the local generation API was not granted.',
      });
      return failure('PROVIDER_PERMISSION_DENIED');
    }

    if (!enabled && granted && !(await revokeProviderPermission())) {
      return failure(
        'PROVIDER_PERMISSION_DENIED',
        'The optional local-server permission could not be removed.',
      );
    }

    if (enabled) {
      const health = await checkProviderHealth();
      if (!health.ok) {
        await revokeProviderPermission();
        await writeProviderSettings(local, {
          enabled: false,
          lastError: health.error.message,
        });
        return health;
      }
    }

    const written = await writeProviderSettings(local, { enabled, lastError: null });
    if (!written.ok) return written;
    return success({ enabled, permissionGranted: granted });
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
      // The origin can be covered by a required host permission instead of the
      // optional one we manage: the E2E manifest grants it outright, and WXT's
      // dev server injects its own `http://<host>/*` (no port, matches every
      // port) so the popup can reach the Vite dev server. Either way it's not
      // ours to revoke, and `permissions.remove` would just fail.
      const required: string[] = browser.runtime.getManifest().host_permissions ?? [];
      if (required.some((pattern: string) => hostPatternCovers(pattern, PROVIDER_PERMISSION_PATTERN))) {
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
    sentences: { id: string; text: string }[],
    sender: Browser.runtime.MessageSender,
  ): Promise<Result<GenerateTrapsData>> {
    // Only the content script of the tab that owns the session may ask.
    const active = await readActiveSession(session);
    if (!isGenerationAuthorized(active, sender.tab?.id, sessionId)) {
      return failure('SESSION_REPLACED', 'This tab does not own the active Eclipse session.');
    }

    const settings = await readProviderSettings(local);
    if (!settings.enabled) return failure('PROVIDER_DISABLED');

    if (!(await hasProviderPermission())) {
      await writeProviderSettings(local, {
        enabled: false,
        lastError: 'Permission for the local generation API is not granted.',
      });
      return failure('PROVIDER_PERMISSION_DENIED');
    }

    const result = await generateWithCache(sentences, local);
    await writeProviderSettings(local, {
      enabled: settings.enabled,
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
