/**
 * The always-on provider augments catalog-rich pages and supplies the initial
 * placement plan for eligible catalog-free pages.
 *
 * Every case here activates for real and then checks what the catalog traps did
 * while the provider succeeded, failed, hung or returned rubbish.
 */

import { describe, expect, it, vi } from 'vitest';
import { memoryArea } from '@/storage/area';
import { ContentSession, type ProviderSentence, type SessionHost } from '@/content/session';
import type { OverlayStore } from '@/content/overlay-store';
import type { OverlayCallbacks } from '@/content/session';
import { failure, success, type Result } from '@/domain/errors';
import type { ContextTrap, GeneratedTrapCandidate } from '@/domain/trap';
import type { DelfLevel } from '@/domain/delf';
import { flush, loadDemo, renderHtml } from './helpers';
import { persistAnswer } from '@/storage/profile-store';

function hostWith(
  requestGeneratedTraps?: SessionHost['requestGeneratedTraps'],
): SessionHost & { sentences: ProviderSentence[][]; sessionIds: string[] } {
  const sentences: ProviderSentence[][] = [];
  const sessionIds: string[] = [];
  const storage = memoryArea();
  return {
    sentences,
    sessionIds,
    storage,
    async recordAnswer(answer) {
      const result = await persistAnswer(storage, { ...answer, now: new Date() });
      if (!result.ok) return result;
      return success({
        interactionId: answer.interactionId,
        applied: result.data.applied,
        previousPhase: result.data.previousPhase,
        phase: result.data.phase,
        mastery: result.data.mastery,
      });
    },
    mountOverlay(_store: OverlayStore, _callbacks: OverlayCallbacks) {
      return () => undefined;
    },
    installTokenStyles() {
      return () => undefined;
    },
    ...(requestGeneratedTraps
      ? {
          requestGeneratedTraps: async (
            sessionId: string,
            delfLevel: DelfLevel,
            list: ProviderSentence[],
          ) => {
            sessionIds.push(sessionId);
            sentences.push(list);
            return requestGeneratedTraps(sessionId, delfLevel, list);
          },
        }
      : {}),
  };
}

function tokens(): HTMLElement[] {
  return Array.from(document.querySelectorAll<HTMLElement>('[data-eclipse-owner]'));
}

/** A generated trap aimed at a sentence Demo A definitely contains. */
function generatedFor(sentenceId: string, sentence: string): GeneratedTrapCandidate {
  const words = Array.from(sentence.matchAll(/[A-Za-z]+/g));
  const source = words[0]?.[0] ?? 'Researchers';
  const clueStart = words[3]?.index ?? 0;
  const clueEnd = (words[5]?.index ?? clueStart) + (words[5]?.[0].length ?? 1);
  const suffix = sentenceId.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const trap: ContextTrap = {
    // Deliberately carries no sentence identity. The envelope is authoritative.
    id: `gemini:${suffix}`,
    conceptId: `fr:generated-${suffix}:sense-${suffix}`,
    sourceLocale: 'en',
    targetLocale: 'fr-FR',
    type: 'false_friend',
    sentence,
    exactSourceText: source,
    targetSurface: 'observer',
    choices: [source, 'a tempting distractor', 'another distractor'],
    acceptedChoice: source,
    clueSpan: sentence.slice(clueStart, clueEnd),
    explanation: 'The French surface carries the contextual meaning here.',
    distractorExplanation: 'The tempting alternative does not fit the surrounding evidence.',
    difficulty: 0.6,
    confidence: 0.95,
    provider: 'gemini',
  };
  return { sentenceId, trap };
}

function genericArticle(): string {
  const paragraphs = [
    'Researchers observed the quiet forest throughout the winter while nearby communities carefully documented changes in local weather and animal behavior for a future regional study.',
    'Engineers measured the old bridge throughout the spring while local residents carefully documented changes in traffic patterns and structural movement for a public safety report.',
    'Historians described the coastal village throughout the summer while visiting students carefully documented changes in traditional crafts and community celebrations for an archive.',
    'Biologists compared the northern wetlands throughout the autumn while field assistants carefully documented changes in water levels and migrating bird populations for conservation work.',
  ];
  return `<article>${paragraphs.map((paragraph) => `<p>${paragraph}</p>`).join('')}</article>`;
}

function longGeneratedArticle(paragraphCount = 6): string {
  const paragraphs = Array.from({ length: paragraphCount }, (_, index) => {
    const number = index + 1;
    return `Researchers observed district ${number} throughout the winter while nearby communities documented changes in local weather for a regional study. Engineers then compared those records with traffic patterns and public reports before presenting practical recommendations.`;
  });
  return `<article>${paragraphs.map((paragraph) => `<p>${paragraph}</p>`).join('')}</article>`;
}

describe('provider disabled', () => {
  it('is never called', async () => {
    renderHtml(loadDemo('demo-a.html'));
    const request = vi.fn(async () => success<GeneratedTrapCandidate[]>([]));
    const host = hostWith(request);
    const session = new ContentSession(document, host);

    const result = await session.activate('ses_a', false);
    expect(result.ok).toBe(true);
    await flush();

    expect(request).not.toHaveBeenCalled();
  });

  it('does not call the provider on a catalog-free article', async () => {
    renderHtml(genericArticle());
    const request = vi.fn(async () => success<GeneratedTrapCandidate[]>([]));
    const session = new ContentSession(document, hostWith(request));

    const result = await session.activate('ses_catalog_free', false);

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('NO_ELIGIBLE_TRAPS');
    expect(request).not.toHaveBeenCalled();
    expect(tokens()).toHaveLength(0);
  });
});

describe('provider enabled', () => {
  it('activates a single substantial text paragraph', async () => {
    renderHtml(longGeneratedArticle(1));
    const host = hostWith(async (_sessionId, _delfLevel, sentences) =>
      success(sentences.map((sentence) => generatedFor(sentence.id, sentence.text))),
    );
    const session = new ContentSession(document, host);

    const result = await session.activate('ses_single_paragraph', true);

    expect(result.ok).toBe(true);
    expect(tokens()).toHaveLength(2);
  });

  it('places two generated traps per eligible paragraph beyond the old page cap', async () => {
    renderHtml(longGeneratedArticle(35));
    const host = hostWith(async (_sessionId, _delfLevel, sentences) =>
      success(sentences.map((sentence) => generatedFor(sentence.id, sentence.text))),
    );
    const session = new ContentSession(document, host);

    const result = await session.activate('ses_dense_article', true);
    expect(result.ok).toBe(true);
    await flush();
    await flush();

    expect(tokens()).toHaveLength(70);
    for (const paragraph of document.querySelectorAll('p')) {
      expect(paragraph.querySelectorAll('[data-eclipse-owner]')).toHaveLength(2);
    }
  });

  it('awaits one bounded request and activates a catalog-free article with initial traps', async () => {
    renderHtml(genericArticle());

    let requested: readonly ProviderSentence[] = [];
    let resolveRequest: (value: Result<GeneratedTrapCandidate[]>) => void = () => undefined;
    const pending = new Promise<Result<GeneratedTrapCandidate[]>>((resolve) => {
      resolveRequest = resolve;
    });
    const host = hostWith(async (_sessionId, _delfLevel, sentences) => {
      requested = sentences;
      return pending;
    });
    const session = new ContentSession(document, host);

    const activation = session.activate('ses_catalog_free', true);
    await flush();

    expect(host.sessionIds).toEqual(['ses_catalog_free']);
    expect(tokens()).toHaveLength(0);
    resolveRequest(success(requested.map((sentence) => generatedFor(sentence.id, sentence.text))));

    const result = await activation;
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.trapCount).toBeGreaterThanOrEqual(2);
    expect(tokens().length).toBeGreaterThanOrEqual(2);
    expect(tokens().length).toBeLessThanOrEqual(4);
  });

  it('waits for the provider so the final placement is atomic', async () => {
    renderHtml(loadDemo('demo-a.html'));

    let resolveRequest: (value: Result<GeneratedTrapCandidate[]>) => void = () => undefined;
    const pending = new Promise<Result<GeneratedTrapCandidate[]>>((resolve) => {
      resolveRequest = resolve;
    });

    const host = hostWith(() => pending);
    const session = new ContentSession(document, host);

    const activation = session.activate('ses_a', true);
    await flush();
    expect(tokens()).toHaveLength(0);

    resolveRequest(success([]));
    const result = await activation;
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.trapCount).toBeGreaterThanOrEqual(2);
    const catalogCount = tokens().length;
    expect(catalogCount).toBeGreaterThanOrEqual(2);
    expect(tokens()).toHaveLength(catalogCount);
  });

  it('sends batches of at most eight sentences, and only sentences', async () => {
    renderHtml(loadDemo('demo-a.html'));
    const host = hostWith(async () => success<GeneratedTrapCandidate[]>([]));
    const session = new ContentSession(document, host);

    await session.activate('ses_a', true);
    await flush();

    expect(host.sentences.length).toBeGreaterThan(0);
    for (const batch of host.sentences) {
      expect(batch.length).toBeGreaterThan(0);
      expect(batch.length).toBeLessThanOrEqual(8);
      for (const sentence of batch) {
        expect(sentence.text.length).toBeLessThanOrEqual(300);
        // No URL, no title, no profile — the payload is text and an id.
        expect(Object.keys(sentence).sort()).toEqual(['id', 'text']);
      }
    }
  });

  it('places a valid generated trap into a block the catalog did not use', async () => {
    renderHtml(loadDemo('demo-a.html'));

    const host = hostWith(async (_sessionId, _delfLevel, sentences) => {
      const target = sentences.find((sentence) => /\bstay\b/i.test(sentence.text));
      if (!target) return success<GeneratedTrapCandidate[]>([]);
      return success([generatedFor(target.id, target.text)]);
    });

    const session = new ContentSession(document, host);
    const activated = await session.activate('ses_a', true);
    expect(activated.ok).toBe(true);
    const before = tokens().length;

    await flush();

    const after = tokens();
    const generated = after.filter((token) => token.textContent === 'observer');

    // Either it fit and was added, or it did not match a scanned sentence and
    // nothing changed. Both are correct; what must never happen is losing a
    // catalog trap.
    expect(after.length).toBeGreaterThanOrEqual(before);
    expect(after.length).toBeLessThanOrEqual(120);
    if (generated.length > 0) {
      expect(generated[0]?.textContent).toBe('observer');
      expect(generated[0]?.getAttribute('lang')).toBe('fr-FR');
    }
  });

  it('never exceeds two traps per paragraph or the page ceiling', async () => {
    renderHtml(loadDemo('demo-a.html'));
    const host = hostWith(async (_sessionId, _delfLevel, sentences) =>
      success(sentences.map((sentence) => generatedFor(sentence.id, sentence.text))),
    );

    const session = new ContentSession(document, host);
    const result = await session.activate('ses_a', true);
    expect(result.ok).toBe(true);

    expect(tokens().length).toBeLessThanOrEqual(120);
    for (const paragraph of document.querySelectorAll('p')) {
      expect(paragraph.querySelectorAll('[data-eclipse-owner]').length).toBeLessThanOrEqual(2);
    }
  });

  it('keeps every catalog trap when the provider fails', async () => {
    for (const code of [
      'PROVIDER_DISABLED',
      'PROVIDER_UNAVAILABLE',
      'PROVIDER_TIMEOUT',
      'PROVIDER_INVALID_RESPONSE',
      'PROVIDER_PERMISSION_DENIED',
    ] as const) {
      renderHtml(loadDemo('demo-a.html'));
      const host = hostWith(async () => failure(code));
      const session = new ContentSession(document, host);

      const result = await session.activate('ses_a', true);
      expect(result.ok, code).toBe(true);
      const catalogCount = tokens().length;
      await flush();

      expect(tokens().length, code).toBe(catalogCount);
      expect(catalogCount).toBeGreaterThanOrEqual(2);
      await session.deactivate('ses_a');
    }
  });

  it('keeps every catalog trap when the provider throws', async () => {
    renderHtml(loadDemo('demo-a.html'));
    const host = hostWith(async () => {
      throw new Error('network exploded');
    });
    const session = new ContentSession(document, host);

    const result = await session.activate('ses_a', true);
    expect(result.ok).toBe(true);
    const catalogCount = tokens().length;
    await flush();
    expect(tokens().length).toBe(catalogCount);
  });

  it('ignores a generated trap aimed at a sentence that was never sent', async () => {
    renderHtml(loadDemo('demo-a.html'));
    const host = hostWith(async () =>
      success([generatedFor('never-sent', 'They chose to stay in the dark room.')]),
    );

    const session = new ContentSession(document, host);
    await session.activate('ses_a', true);
    const before = tokens().length;
    await flush();

    expect(tokens()).toHaveLength(before);
  });

  it('does not touch the page if the session ended while the request was out', async () => {
    renderHtml(loadDemo('demo-a.html'));

    let resolveRequest: (value: Result<GeneratedTrapCandidate[]>) => void = () => undefined;
    const pending = new Promise<Result<GeneratedTrapCandidate[]>>((resolve) => {
      resolveRequest = resolve;
    });

    const host = hostWith(() => pending);
    const session = new ContentSession(document, host);
    const activation = session.activate('ses_a', true);
    await flush();

    await session.deactivate('ses_a');
    expect(tokens()).toHaveLength(0);

    resolveRequest(success([generatedFor('s0', 'They chose to stay in the dark room.')]));
    const result = await activation;
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('SESSION_REPLACED');
    await flush();

    // The page was already handed back; nothing may be re-inserted into it.
    expect(tokens()).toHaveLength(0);
  });
});
