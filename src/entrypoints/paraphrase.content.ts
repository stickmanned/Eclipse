/**
 * The Paraphrase Mode runtime, injected on demand.
 *
 * Declared with `registration: "runtime"` and no `matches`, exactly like the
 * Translate Mode runtime, so WXT emits the bundle without a `content_scripts`
 * manifest entry and without adding any host permission. The background worker
 * injects it with `chrome.scripting.executeScript` under `activeTab`.
 *
 * It communicates over a named port rather than `runtime.sendMessage`. Both
 * runtimes can be present in one document — Translate Mode's cannot be
 * uninstalled once injected — and its listener answers *every* message,
 * including shapes it does not recognise. On a shared `onMessage` channel it
 * would therefore win the race for every Paraphrase message and reply
 * `MESSAGE_UNSUPPORTED` on behalf of a runtime that was never addressed. A port
 * is addressed rather than broadcast, so the two modes coexist without either
 * knowing the other exists.
 *
 * Either side may open the port. That matters after a service-worker restart:
 * the background's port dies with the worker, and a learner mid-page would
 * otherwise have no way to save the next answer. `ensureChannel` reconnects
 * from this side on the next request instead.
 */

import { browser } from 'wxt/browser';
import { createRoot, type Root } from 'react-dom/client';
import { createElement } from 'react';
import { ParaphraseOverlay } from '../content/paraphrase/ui/ParaphraseOverlay';
import { PARAPHRASE_OVERLAY_CSS, PARAPHRASE_TOKEN_CSS } from '../content/paraphrase/ui/theme';
import {
  ParaphraseSession,
  type ParaphraseManualRecordInput,
  type ParaphraseOverlayCallbacks,
  type ParaphraseRecordInput,
} from '../content/paraphrase/session';
import type { ParaphraseOverlayStore } from '../content/paraphrase/store';
import { PortRpc, type PortLike } from '../paraphrase/port-rpc';
import {
  TAB_PORT,
  tabRequestSchema,
  type ActivatedData,
  type DeactivatedData,
  type GeneratedData,
  type HelloData,
  type ParaphraseSentence,
  type RecordedData,
  type SimplifiedSelectionData,
} from '../paraphrase/protocol';
import { failure, success, type Result } from '../domain/errors';
import { validateParaphraseItem, type GeneratedParaphraseCandidate } from '../domain/paraphrase';

const TOKEN_STYLE_ID = 'eclipse-paraphrase-token-styles';

/** Generation legitimately takes tens of seconds; a card answer must not. */
const GENERATION_TIMEOUT_MS = 90_000;
const RECORD_TIMEOUT_MS = 15_000;

export default defineContentScript({
  registration: 'runtime',
  runAt: 'document_idle',
  cssInjectionMode: 'manual',
  allFrames: false,

  async main(ctx) {
    // Guard against a double injection racing the presence check.
    const marker = '__eclipseParaphraseInstalled';
    const globalRef = globalThis as unknown as Record<string, unknown>;
    if (globalRef[marker] === true) return;
    globalRef[marker] = true;

    let channel: PortRpc | null = null;

    /** The live channel to the worker, opening one from this side if needed. */
    function ensureChannel(): PortRpc {
      if (channel && !channel.isClosed) return channel;
      const port = browser.runtime.connect({ name: TAB_PORT });
      channel = attach(port);
      return channel;
    }

    async function ask<T>(payload: unknown, timeoutMs?: number): Promise<Result<T>> {
      try {
        return await ensureChannel().request<T>(payload, timeoutMs);
      } catch (cause) {
        const detail = cause instanceof Error ? cause.message : 'the channel is unavailable';
        return failure('CONTENT_SCRIPT_UNAVAILABLE', detail);
      }
    }

    const session = new ParaphraseSession(document, {
      installTokenStyles(doc) {
        if (doc.getElementById(TOKEN_STYLE_ID)) return () => undefined;
        const style = doc.createElement('style');
        style.id = TOKEN_STYLE_ID;
        style.textContent = PARAPHRASE_TOKEN_CSS;
        (doc.head ?? doc.documentElement).append(style);
        return () => style.remove();
      },

      mountOverlay(store: ParaphraseOverlayStore, callbacks: ParaphraseOverlayCallbacks) {
        let root: Root | null = null;

        // The CSS is handed over as a string rather than imported, which keeps
        // `cssInjectionMode` off "ui" and therefore keeps the manifest free of
        // any web_accessible_resources entry.
        const uiPromise = createShadowRootUi(ctx, {
          name: 'eclipse-paraphrase',
          position: 'overlay',
          anchor: 'body',
          append: 'last',
          mode: 'open',
          inheritStyles: false,
          isolateEvents: true,
          css: PARAPHRASE_OVERLAY_CSS,
          onMount(container) {
            root = createRoot(container);
            root.render(createElement(ParaphraseOverlay, { store, ...callbacks }));
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

      /**
       * The runtime never talks to the network. It asks the background worker,
       * which owns the loopback permission, the profile and the fetch.
       */
      async requestGeneration(sessionId: string, sentences: readonly ParaphraseSentence[]) {
        const answered = await ask<GeneratedData>(
          { type: 'GENERATE', sessionId, sentences: [...sentences] },
          GENERATION_TIMEOUT_MS,
        );
        if (!answered.ok) return answered;

        // Validate again on arrival. The worker already did, but this side is
        // the one that puts text into the page, and the boundary between them
        // is a message channel like any other.
        const candidates: GeneratedParaphraseCandidate[] = [];
        for (const candidate of answered.data.candidates) {
          const validated = validateParaphraseItem(candidate.item);
          if (!validated.ok) continue;
          candidates.push({ sentenceId: candidate.sentenceId, item: validated.data });
        }
        return success(candidates);
      },

      async requestSelectionParaphrase(sessionId: string, sentence: string, selection: string) {
        const answered = await ask<SimplifiedSelectionData>(
          { type: 'SIMPLIFY_SELECTION', sessionId, sentence, selection },
          GENERATION_TIMEOUT_MS,
        );
        if (!answered.ok) return answered;
        const validated = validateParaphraseItem(answered.data.item);
        if (!validated.ok) return validated;
        return success(validated.data);
      },

      async recordAnswer(sessionId: string, input: ParaphraseRecordInput) {
        return ask<RecordedData>({ type: 'RECORD', sessionId, ...input }, RECORD_TIMEOUT_MS);
      },

      async recordManual(sessionId: string, input: ParaphraseManualRecordInput) {
        return ask<RecordedData>({ type: 'RECORD_MANUAL', sessionId, ...input }, RECORD_TIMEOUT_MS);
      },

      onInvalidated() {
        // The page rewrote a branch Eclipse owned. Nothing to repair — the
        // session is already tearing itself down.
      },
    });

    /** Wrap a port and serve the requests the worker sends down it. */
    function attach(port: PortLike): PortRpc {
      const rpc = new PortRpc(port);
      rpc.serve(async (payload) => {
        const parsed = tabRequestSchema.safeParse(payload);
        if (!parsed.success) {
          return failure(
            'MESSAGE_UNSUPPORTED',
            'The Eclipse paraphrase runtime rejected a request.',
          );
        }

        switch (parsed.data.type) {
          case 'HELLO':
            return success<HelloData>({
              runtime: 'eclipse-paraphrase',
              sessionId: session.sessionId,
            });
          case 'ACTIVATE':
            return session.activate(parsed.data.sessionId, parsed.data.plan) as Promise<
              Result<ActivatedData>
            >;
          case 'DEACTIVATE':
            return session.deactivate(parsed.data.sessionId) as Promise<Result<DeactivatedData>>;
        }
      });
      return rpc;
    }

    browser.runtime.onConnect.addListener((port) => {
      if (port.name !== TAB_PORT) return;
      channel = attach(port);
    });

    // If the document goes away underneath us, put the page back first.
    ctx.onInvalidated(() => {
      void session.deactivate();
    });
  },
});
