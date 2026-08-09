/**
 * Playwright fixtures for driving the extension.
 *
 * Each test gets a fresh persistent Chrome profile with the E2E build loaded
 * unpacked, so nothing leaks between scenarios.
 *
 * Sessions are driven from a `driver` page: the extension's own popup document
 * opened in a **background** tab. Three constraints force this shape, all of
 * them properties of Chrome rather than of Eclipse:
 *
 *  - `chrome.runtime.sendMessage` does not deliver to the sender's own context,
 *    so the service worker cannot message itself.
 *  - A popup opened by an automation driver is an ordinary tab, so if it is the
 *    *active* tab it becomes its own `tabs.query({active: true})` result and
 *    Eclipse would target the popup instead of the article.
 *  - `activeTab` is granted by a real toolbar click, which no driver can make —
 *    hence the narrow loopback host permission in the E2E build (see
 *    wxt.config.ts).
 *
 * Keeping the driver in a background tab satisfies all three: the message is
 * byte-identical to the one the Start button sends, and the worker resolves the
 * article as the active tab. Popup *rendering* is covered separately, against
 * the real popup page.
 */

import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import type { Server } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  test as base,
  chromium,
  type BrowserContext,
  type Page,
  type Worker,
} from '@playwright/test';
import { createApp } from '../../server/app';
import type { ContextTrapsRequest, ModelOutput } from '../../server/schema';
import type { ProviderOutcome, TrapProvider } from '../../server/providers/types';

/** The build under test: production code plus one loopback host permission. */
export const EXTENSION_PATH = join(process.cwd(), '.output-e2e', 'chrome-mv3');

/** The real shipped build. Audited, never loaded. */
export const PRODUCTION_MANIFEST_PATH = join(
  process.cwd(),
  '.output',
  'chrome-mv3',
  'manifest.json',
);

export const DEMO_A = 'http://127.0.0.1:4321/demo-a.html';
export const DEMO_B = 'http://127.0.0.1:4321/demo-b.html';

/** Fixtures that live for the whole worker: one browser, one extension. */
export interface EclipseWorkerFixtures {
  /**
   * The persistent Chrome running the extension. Playwright's own `context` is
   * a test-scoped built-in and cannot be redefined at worker scope, so this
   * carries the real one and `context` is aliased to it below.
   */
  extensionContext: BrowserContext;
  extensionId: string;
  serviceWorker: Worker;
  providerServer: ProviderServer;
}

export interface ProviderServer {
  requestCount(): number;
  setMode(mode: ProviderServerMode): void;
}

export type ProviderServerMode =
  | 'ok'
  | 'zero'
  | 'invalid'
  | 'timeout'
  | 'rate-limited-once'
  | 'unavailable-once'
  | 'invalid-once'
  | 'timeout-once';

/** Fixtures rebuilt for every test. */
export interface EclipseFixtures {
  /** Clears all extension state. Runs automatically before each test. */
  cleanProfile: void;
  /** An extension page kept in a background tab, used to send real messages. */
  driver: Page;
  popup: Page;
}

export const test = base.extend<EclipseFixtures, EclipseWorkerFixtures>({
  /**
   * One browser per worker, not one per test.
   *
   * Launching a fresh persistent Chrome for each of thirty-odd tests was slow
   * and, in the tail of a run, flaky: launches gradually crept past the test
   * timeout. Isolation is preserved by `cleanProfile` below, which wipes
   * everything Eclipse persists between tests — which is the state that
   * actually matters here.
   */
  extensionContext: [
    // eslint-disable-next-line no-empty-pattern -- Playwright requires the fixture-arg object form.
    async ({}, use) => {
      if (!existsSync(EXTENSION_PATH)) {
        throw new Error(
          `E2E build not found at ${EXTENSION_PATH}. Run "npm run build:e2e" first, or just "npm run test:e2e".`,
        );
      }

      const userDataDir = mkdtempSync(join(tmpdir(), 'eclipse-e2e-'));
      const context = await chromium.launchPersistentContext(userDataDir, {
        channel: 'chromium',
        args: [
          `--disable-extensions-except=${EXTENSION_PATH}`,
          `--load-extension=${EXTENSION_PATH}`,
          '--no-first-run',
          '--no-default-browser-check',
        ],
      });

      await use(context);
      await context.close();
      rmSync(userDataDir, { recursive: true, force: true });
    },
    { scope: 'worker' },
  ],

  /** Test-scoped alias so specs can keep using the familiar `context`. */
  context: async ({ extensionContext }, use) => {
    await use(extensionContext);
  },

  serviceWorker: [
    async ({ extensionContext }, use) => {
      let [worker] = extensionContext.serviceWorkers();
      worker ??= await extensionContext.waitForEvent('serviceworker');
      await use(worker);
    },
    { scope: 'worker' },
  ],

  extensionId: [
    async ({ serviceWorker }, use) => {
      await use(new URL(serviceWorker.url()).host);
    },
    { scope: 'worker' },
  ],

  providerServer: [
    async ({ extensionId }, use) => {
      let requests = 0;
      let mode: ProviderServerMode = 'ok';
      let modeAttempts = 0;
      let rateLimitAttempts = 0;
      const provider: TrapProvider = {
        name: 'gemini',
        model: 'gemini-3.5-flash-lite',
        async generate(
          request: ContextTrapsRequest,
          signal: AbortSignal,
        ): Promise<ProviderOutcome> {
          requests += 1;
          modeAttempts += 1;
          if (mode === 'zero') return { kind: 'ok', output: { traps: [] } };
          if (mode === 'unavailable-once' && modeAttempts === 1) {
            return { kind: 'unavailable', detail: 'fake transient outage' };
          }
          if (mode === 'invalid' || (mode === 'invalid-once' && modeAttempts === 1)) {
            return { kind: 'invalid', detail: 'fake invalid output' };
          }
          if (mode === 'timeout' || (mode === 'timeout-once' && modeAttempts === 1)) {
            await new Promise<void>((resolve) => {
              if (signal.aborted) resolve();
              else signal.addEventListener('abort', () => resolve(), { once: true });
            });
            return { kind: 'timeout' };
          }
          return { kind: 'ok', output: genericModelOutput(request) };
        },
      };
      const app = createApp({
        provider,
        allowedOrigins: [`chrome-extension://${extensionId}`],
        log: () => undefined,
        timeoutMs: 150,
        rateLimiter: {
          take() {
            if (mode !== 'rate-limited-once') return true;
            rateLimitAttempts += 1;
            return rateLimitAttempts > 1;
          },
          reset() {
            rateLimitAttempts = 0;
          },
        },
      });
      // The fake provider must own the same port the extension is compiled to
      // call. A real `npm run api` on that port turns into a cascade of
      // unrelated-looking assertion failures, so name the collision here.
      const server = await new Promise<Server>((resolve, reject) => {
        const listening = app.listen(8787, '127.0.0.1', () => resolve(listening));
        listening.on('error', (cause: NodeJS.ErrnoException) => {
          reject(
            cause.code === 'EADDRINUSE'
              ? new Error(
                  'Port 8787 is already in use, so the fake generation API cannot start. ' +
                    'Stop "npm run api" (or whatever holds the port) and run the E2E suite again.',
                )
              : cause,
          );
        });
      });

      await use({
        requestCount: () => requests,
        setMode(nextMode) {
          mode = nextMode;
          modeAttempts = 0;
          rateLimitAttempts = 0;
        },
      });
      if (!server.listening) return;
      await new Promise<void>((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
      });
    },
    { scope: 'worker', auto: true },
  ],

  /**
   * A clean slate between tests: every key Eclipse writes is cleared, any live
   * session is dropped, and every tab but one is closed. This is what makes a
   * shared browser behave like a fresh install for each test.
   */
  cleanProfile: [
    async ({ extensionContext, serviceWorker }, use) => {
      await resetExtensionState(extensionContext, serviceWorker);
      await use();
      await resetExtensionState(extensionContext, serviceWorker);
    },
    { auto: true },
  ],

  driver: async ({ context, extensionId, cleanProfile }, use) => {
    void cleanProfile;
    const page = await context.newPage();
    await page.goto(`chrome-extension://${extensionId}/popup.html`);
    await use(page);
    await page.close();
  },

  popup: async ({ context, extensionId, cleanProfile }, use) => {
    void cleanProfile;
    const page = await context.newPage();
    await page.goto(`chrome-extension://${extensionId}/popup.html`);
    await use(page);
    await page.close();
  },
});

function genericModelOutput(request: ContextTrapsRequest): ModelOutput {
  const wordSurfaces = [
    'observer',
    'mesurer',
    'décrire',
    'comparer',
    'étudier',
    'noter',
    'suivre',
    'tester',
  ];
  const phraseSurfaces = [
    'tout au long de',
    'à proximité de',
    'mettre en évidence',
    'tenir compte de',
  ];
  const difficulty = { A1: 0.2, A2: 0.4, B1: 0.6, B2: 0.82 }[request.delfLevel];
  return {
    traps: request.sentences.flatMap((sentence, index) => {
      const words = Array.from(sentence.text.matchAll(/[A-Za-z]+/g));
      const wordSource = words.find(
        (word) =>
          word[0].length >= 5 &&
          words.filter((candidate) => candidate[0].toLowerCase() === word[0].toLowerCase())
            .length === 1,
      );
      const pairStart = words.findIndex((word, wordIndex) => {
        const next = words[wordIndex + 1];
        return word[0].length >= 4 && Boolean(next && next[0].length >= 4);
      });
      const firstPhraseWord = pairStart >= 0 ? words[pairStart] : undefined;
      const lastPhraseWord = pairStart >= 0 ? words[pairStart + 1] : undefined;
      const phraseSource =
        firstPhraseWord?.index !== undefined && lastPhraseWord?.index !== undefined
          ? sentence.text.slice(
              firstPhraseWord.index,
              lastPhraseWord.index + lastPhraseWord[0].length,
            )
          : null;
      const usePhrase = index % 2 === 1 && phraseSource !== null;
      const exactSourceText = usePhrase ? phraseSource : wordSource?.[0];
      const clue = words.find(
        (word) =>
          !exactSourceText?.includes(word[0]) &&
          word[0].length >= 4 &&
          word[0].toLowerCase() !== wordSource?.[0].toLowerCase(),
      );
      if (!exactSourceText || !clue) return [];

      return [
        {
          sentenceId: sentence.id,
          conceptSlug: `generated-${sentence.id}`,
          englishSense: `context-${sentence.id}`,
          type: usePhrase ? ('phrase' as const) : ('vocabulary' as const),
          exactSourceText,
          targetSurface: usePhrase
            ? (phraseSurfaces[index % phraseSurfaces.length] ?? 'tout au long de')
            : (wordSurfaces[index % wordSurfaces.length] ?? 'observer'),
          choices: usePhrase
            ? [exactSourceText, 'only its first word', 'an unrelated expression']
            : [exactSourceText, 'a tempting distractor', 'another distractor'],
          acceptedChoice: exactSourceText,
          clueSpan: clue[0],
          explanation: 'The French surface expresses the meaning selected by this context.',
          distractorExplanation: 'The alternative meaning does not fit the surrounding evidence.',
          difficulty,
          confidence: 0.95,
        },
      ];
    }),
  };
}

async function resetExtensionState(context: BrowserContext, worker: Worker): Promise<void> {
  // Open a blank page we own FIRST, then close everything else.
  //
  // Two things this buys. A persistent context dies if its last page closes, so
  // something must survive — and it must be a page this helper created, never a
  // fixture's. Reusing "whichever page happens to be first" once navigated a
  // live popup to about:blank, which is a blank screen and a very confusing
  // timeout rather than an obvious failure.
  const keeper = await context.newPage();
  await keeper.goto('about:blank').catch(() => undefined);

  for (const page of context.pages()) {
    if (page === keeper) continue;
    await page.close().catch(() => undefined);
  }

  await context.unrouteAll({ behavior: 'ignoreErrors' }).catch(() => undefined);

  await worker
    .evaluate(async () => {
      await chrome.storage.local.clear();
      await chrome.storage.session.clear();
    })
    .catch(() => undefined);
}

export const expect = test.expect;

export function readProductionManifest(): Record<string, unknown> {
  return JSON.parse(readFileSync(PRODUCTION_MANIFEST_PATH, 'utf8')) as Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Driving the extension
// ---------------------------------------------------------------------------

interface Failure {
  ok: false;
  error: { code: string; message: string; recoverable: boolean };
}
interface Success<T> {
  ok: true;
  data: T;
}
export type Result<T> = Success<T> | Failure;

/**
 * Send a message to the background worker exactly as the popup would.
 *
 * `driver` must be an extension page in a BACKGROUND tab, so that the worker's
 * own `tabs.query({active: true, currentWindow: true})` resolves to the article
 * rather than to the driver.
 */
export async function send<T>(driver: Page, message: Record<string, unknown>): Promise<Result<T>> {
  return driver.evaluate(
    async (payload) => (await chrome.runtime.sendMessage(payload)) as never,
    message,
  ) as Promise<Result<T>>;
}

/** Resolve a tab id by URL, from an extension page that can see tabs. */
export async function tabIdFor(driver: Page, url: string): Promise<number> {
  const id = await driver.evaluate(async (target) => {
    const [tab] = await chrome.tabs.query({ url: target });
    return tab?.id ?? null;
  }, url);
  if (id === null) throw new Error(`No tab found for ${url}`);
  return id;
}

/** Send straight to a tab's content runtime, the way the worker does. */
export async function sendToTab<T>(
  driver: Page,
  tabId: number,
  message: Record<string, unknown>,
): Promise<Result<T>> {
  return driver.evaluate(
    async ({ id, payload }) => (await chrome.tabs.sendMessage(id, payload)) as never,
    { id: tabId, payload: message },
  ) as Promise<Result<T>>;
}

/** Mark calibration complete without going through the popup UI. */
export async function skipCalibration(
  driver: Page,
  delfLevel: 'A1' | 'A2' | 'B1' | 'B2' = 'B1',
): Promise<void> {
  await send(driver, {
    type: 'SAVE_CALIBRATION',
    delfLevel,
    correctAnswers: 0,
    method: 'self_selected',
  });
}

/** Bring `page` to front — making the driver a background tab — and start on it. */
export async function startEclipse(
  driver: Page,
  page: Page,
  delfLevel: 'A1' | 'A2' | 'B1' | 'B2' = 'B1',
): Promise<Result<{ sessionId: string; tabId: number; trapCount: number }>> {
  await skipCalibration(driver, delfLevel);
  await page.bringToFront();
  return send(driver, { type: 'START_SESSION' });
}

export async function stopEclipse(driver: Page): Promise<Result<{ restored: boolean }>> {
  return send(driver, { type: 'STOP_SESSION' });
}

/**
 * Skip calibration in a real popup page.
 *
 * The popup renders "Loading…" until its first `GET_STATUS` resolves. Checking
 * for the Skip button before that settles is a race: the check returns false,
 * the click never happens, and the helper then waits for a Start button that
 * calibration is never going to show. So wait for the popup to reach *either*
 * terminal state first.
 */
export async function skipCalibrationInPopup(popup: Page): Promise<void> {
  const chooseB1 = popup.getByRole('button', { name: /B1 Navigate/ });
  const ready = popup.getByRole('button', { name: /Start Eclipse|End Eclipse/ });

  await expect(chooseB1.or(ready).first()).toBeVisible();
  if (await chooseB1.isVisible()) await chooseB1.click();
  await expect(ready).toBeVisible();
}

/** Every Eclipse token currently on the page. */
export function tokens(page: Page) {
  return page.locator('button[data-eclipse-owner="eclipse"]');
}

/** The challenge dialog, inside the ShadowRoot overlay. */
export function card(page: Page) {
  return page.locator('eclipse-challenge').locator('[role="dialog"]');
}

/** Normalised visible text of the article, for restoration comparison. */
export async function articleText(page: Page): Promise<string> {
  return page.evaluate(() => {
    const root =
      document.querySelector('article') ?? document.querySelector('main') ?? document.body;
    return (root.textContent ?? '').replace(/\s+/g, ' ').trim();
  });
}

/** The stored learner profile, read through the worker. */
export async function readProfile(worker: Worker): Promise<Record<string, unknown> | undefined> {
  return worker.evaluate(async () => {
    const stored = await chrome.storage.local.get('eclipse:profile:v1');
    return stored['eclipse:profile:v1'] as never;
  });
}
