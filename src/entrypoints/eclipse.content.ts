/**
 * The Eclipse runtime, injected on demand.
 *
 * Declared with `registration: "runtime"` and no `matches`, so WXT emits the
 * bundle without adding a `content_scripts` manifest entry and without adding
 * any host permission. The background worker injects it with
 * `chrome.scripting.executeScript` under `activeTab`, which is the only reason
 * Eclipse needs no broad host access at all.
 */

import { browser } from 'wxt/browser';
import { createRoot, type Root } from 'react-dom/client';
import { createElement } from 'react';
import { ChallengeOverlay } from '../content/ui/ChallengeOverlay';
import { OVERLAY_CSS, TOKEN_CSS } from '../content/ui/theme';
import { ContentSession, type OverlayCallbacks } from '../content/session';
import type { OverlayStore } from '../content/overlay-store';
import { chromeArea } from '../storage/area';
import { failure, success, type Result } from '../domain/errors';
import type { GeneratedTrapCandidate } from '../domain/trap';
import { parseMessage } from '../domain/messages';

const TOKEN_STYLE_ID = 'eclipse-token-styles';

export default defineContentScript({
  registration: 'runtime',
  runAt: 'document_idle',
  cssInjectionMode: 'manual',
  allFrames: false,

  async main(ctx) {
    // Guard against a double injection racing the PING check.
    const marker = '__eclipseRuntimeInstalled';
    const globalRef = globalThis as unknown as Record<string, unknown>;
    if (globalRef[marker] === true) return;
    globalRef[marker] = true;

    const session = new ContentSession(document, {
      storage: chromeArea(browser.storage.local),

      installTokenStyles(doc) {
        if (doc.getElementById(TOKEN_STYLE_ID)) return () => undefined;
        const style = doc.createElement('style');
        style.id = TOKEN_STYLE_ID;
        style.textContent = TOKEN_CSS;
        (doc.head ?? doc.documentElement).append(style);
        return () => style.remove();
      },

      mountOverlay(store: OverlayStore, callbacks: OverlayCallbacks) {
        let root: Root | null = null;

        // The CSS is handed over as a string rather than imported, which keeps
        // `cssInjectionMode` off "ui" and therefore keeps the manifest free of
        // any web_accessible_resources entry.
        const uiPromise = createShadowRootUi(ctx, {
          name: 'eclipse-challenge',
          position: 'overlay',
          anchor: 'body',
          append: 'last',
          mode: 'open',
          inheritStyles: false,
          isolateEvents: true,
          css: OVERLAY_CSS,
          onMount(container) {
            root = createRoot(container);
            root.render(createElement(ChallengeOverlay, { store, ...callbacks }));
            return root;
          },
          onRemove(mounted) {
            mounted?.unmount();
            root = null;
          },
        }).then((ui) => {
          ui.mount();
          return ui;
        });

        return () => {
          void uiPromise.then((ui) => ui.remove()).catch(() => undefined);
        };
      },

      onInvalidated() {
        // The page rewrote a branch Eclipse owned. Nothing to repair — the
        // session is already tearing itself down.
      },

      /**
       * The content script never talks to the network. It asks the background
       * worker, which owns the optional permission and the fetch.
       */
      async requestGeneratedTraps(sessionId, sentences) {
        try {
          const response: unknown = await browser.runtime.sendMessage({
            type: 'GENERATE_TRAPS',
            sessionId,
            sentences: [...sentences],
          });
          if (response && typeof response === 'object' && 'ok' in response) {
            const result = response as Result<{ candidates: GeneratedTrapCandidate[] }>;
            return result.ok ? success(result.data.candidates) : result;
          }
          return failure('PROVIDER_UNAVAILABLE', 'No response from the background worker.');
        } catch {
          return failure('PROVIDER_UNAVAILABLE');
        }
      },
    });

    browser.runtime.onMessage.addListener((raw, _sender, sendResponse) => {
      const message = parseMessage(raw);
      if (!message) {
        sendResponse(failure('UNKNOWN_ERROR', 'Unrecognised message.'));
        return false;
      }

      switch (message.type) {
        case 'PING':
          sendResponse(
            success({ runtime: 'eclipse-content' as const, sessionId: session.sessionId }),
          );
          return false;

        case 'ACTIVATE':
          session
            .activate(message.sessionId, message.providerEnabled)
            .then(sendResponse)
            .catch((cause: unknown) => {
              const detail = cause instanceof Error ? cause.message : 'Activation failed.';
              sendResponse(failure('UNKNOWN_ERROR', detail));
            });
          return true;

        case 'DEACTIVATE':
          session
            .deactivate(message.sessionId)
            .then(sendResponse)
            .catch((cause: unknown) => {
              const detail = cause instanceof Error ? cause.message : 'Deactivation failed.';
              sendResponse(failure('UNKNOWN_ERROR', detail));
            });
          return true;

        default:
          sendResponse(
            failure('UNKNOWN_ERROR', `The Eclipse runtime does not handle ${message.type}.`),
          );
          return false;
      }
    });

    // If the document goes away underneath us, put the page back first.
    ctx.onInvalidated(() => {
      void session.deactivate();
    });
  },
});
