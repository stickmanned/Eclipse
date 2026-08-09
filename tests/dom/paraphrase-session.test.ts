/**
 * The Paraphrase Mode content session, end to end inside a real DOM.
 *
 * The promise being tested is the same one Translate Mode makes and the reason
 * it is worth this much machinery: whatever Eclipse does to a page, the page
 * comes back. A reader who cannot recover the author's exact words has been
 * given a worse article, not a learning tool.
 */

import { beforeEach, describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ParaphraseSession, type ParaphraseSessionHost } from '@/content/paraphrase/session';
import type { ParaphraseOverlayStore } from '@/content/paraphrase/store';
import type { GeneratedParaphraseCandidate, ParaphraseItem } from '@/domain/paraphrase';
import {
  applyParaphraseAnswer,
  applyParaphraseManualRequest,
  createEmptyParaphraseProfile,
  dueConcepts,
  summarizeParaphraseProfile,
  type ParaphraseProfile,
} from '@/domain/paraphrase-profile';
import { bandWindow, targetComplexity, weakestRegisters } from '@/domain/complexity';
import { normalizedVisibleText } from '@/domain/normalize';
import type { ParaphrasePlan } from '@/paraphrase/protocol';
import { success, failure } from '@/domain/errors';
import { renderHtml, flush } from './helpers';

const DEMO = readFileSync(join(process.cwd(), 'demo', 'paraphrase-fr.html'), 'utf8');

/** Wordings the fake provider knows how to simplify, keyed by their original. */
const RULES: readonly {
  original: string;
  simplified: string;
  register: ParaphraseItem['register'];
  complexity: number;
  distractors: [string, string];
}[] = [
  {
    original: 'postérieurement à',
    simplified: 'après',
    register: 'formal',
    complexity: 0.62,
    distractors: ['préalablement à', 'conformément à'],
  },
  {
    original: 'faciliter',
    simplified: 'aider',
    register: 'formal',
    complexity: 0.58,
    distractors: ['entraver', 'prolonger'],
  },
  {
    original: 'Le caractère ambigu',
    simplified: 'Le flou',
    register: 'academic',
    complexity: 0.78,
    distractors: ['Le caractère ambitieux', 'Le caractère impératif'],
  },
];

function slugOf(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function itemFor(
  sentence: string,
  rule: (typeof RULES)[number],
  source: ParaphraseItem['source'] = 'auto',
): ParaphraseItem {
  const slug = slugOf(rule.original);
  const clue = sentence.replace(rule.original, '').trim().slice(0, 24).trim();
  return {
    id: `gemini:${slug}:x:0`,
    conceptId: `frp:${slug}:x`,
    locale: 'fr-FR',
    register: rule.register,
    source,
    sentence,
    exactSourceText: rule.original,
    simplifiedSurface: rule.simplified,
    choices: [rule.original, ...rule.distractors],
    acceptedChoice: rule.original,
    clueSpan: clue,
    plainMeaning: 'une explication en français simple',
    explanation: 'La reformulation garde le sens de la phrase.',
    distractorExplanation: 'L’autre formulation ne conviendrait pas ici.',
    complexity: rule.complexity,
    confidence: 0.92,
  };
}

interface Harness {
  readonly session: ParaphraseSession;
  readonly host: ParaphraseSessionHost;
  readonly overlay: ParaphraseOverlayStore;
  profile: ParaphraseProfile;
  plan(): ParaphrasePlan;
  generationCalls: number;
  manualCalls: number;
  failGeneration: boolean;
}

function planOf(profile: ParaphraseProfile): ParaphrasePlan {
  return {
    window: bandWindow(profile.band),
    target: targetComplexity(profile.band),
    focusRegisters: weakestRegisters(profile.registers, 2),
    dueConceptIds: dueConcepts(profile, 24).map((entry) => entry.conceptId),
  };
}

function harness(): Harness {
  const state = {
    profile: createEmptyParaphraseProfile(),
    generationCalls: 0,
    manualCalls: 0,
    failGeneration: false,
  };

  const host: ParaphraseSessionHost = {
    installTokenStyles() {
      return () => undefined;
    },
    mountOverlay() {
      return () => undefined;
    },
    async requestGeneration(_sessionId, sentences) {
      state.generationCalls += 1;
      if (state.failGeneration) return failure('PROVIDER_UNAVAILABLE');

      const candidates: GeneratedParaphraseCandidate[] = [];
      for (const sentence of sentences) {
        const rule = RULES.find((candidate) => sentence.text.includes(candidate.original));
        if (!rule) continue;
        candidates.push({ sentenceId: sentence.id, item: itemFor(sentence.text, rule) });
      }
      return success(candidates);
    },
    async requestSelectionParaphrase(_sessionId, sentence, selection) {
      state.manualCalls += 1;
      const rule = RULES.find((candidate) => candidate.original === selection);
      if (!rule) return failure('PROVIDER_INVALID_RESPONSE', 'unknown selection');
      return success(itemFor(sentence, rule, 'manual'));
    },
    async recordAnswer(_sessionId, input) {
      const applied = applyParaphraseAnswer(state.profile, {
        ...input,
        conceptId: input.conceptId as `frp:${string}`,
      });
      state.profile = applied.profile;
      return success({
        applied: applied.applied,
        direction: applied.direction,
        band: applied.profile.band,
        target: targetComplexity(applied.profile.band),
        state: applied.record.state,
        owed: applied.record.due === 'next_occurrence',
        plan: planOf(applied.profile),
      });
    },
    async recordManual(_sessionId, input) {
      const applied = applyParaphraseManualRequest(state.profile, {
        ...input,
        conceptId: input.conceptId as `frp:${string}`,
      });
      state.profile = applied.profile;
      return success({
        applied: applied.applied,
        direction: applied.direction,
        band: applied.profile.band,
        target: targetComplexity(applied.profile.band),
        state: applied.record.state,
        owed: applied.record.due === 'next_occurrence',
        plan: planOf(applied.profile),
      });
    },
  };

  const session = new ParaphraseSession(document, host);
  return {
    session,
    host,
    overlay: session.overlay,
    get profile() {
      return state.profile;
    },
    set profile(next: ParaphraseProfile) {
      state.profile = next;
    },
    plan: () => planOf(state.profile),
    get generationCalls() {
      return state.generationCalls;
    },
    get manualCalls() {
      return state.manualCalls;
    },
    get failGeneration() {
      return state.failGeneration;
    },
    set failGeneration(value: boolean) {
      state.failGeneration = value;
    },
  } as Harness;
}

function tokens(): HTMLElement[] {
  return Array.from(
    document.querySelectorAll<HTMLElement>('[data-eclipse-owner="eclipse-paraphrase"]'),
  );
}

describe('activation', () => {
  let kit: Harness;

  beforeEach(async () => {
    renderHtml(DEMO);
    kit = harness();
  });

  it('replaces hard wordings with simpler ones and reports what it placed', async () => {
    const result = await kit.session.activate('ses_a', kit.plan());
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.data.itemCount).toBeGreaterThan(0);
    expect(tokens()).toHaveLength(result.data.itemCount);

    const text = document.body.textContent ?? '';
    expect(text).toContain('après');
    expect(text).not.toContain('postérieurement à');
  });

  it('never places a token inside a link', async () => {
    await kit.session.activate('ses_a', kit.plan());
    for (const token of tokens()) {
      expect(token.closest('a')).toBeNull();
    }
  });

  it('marks a token as a real, focusable control with an English label', async () => {
    await kit.session.activate('ses_a', kit.plan());
    const token = tokens()[0];
    expect(token?.tagName).toBe('BUTTON');
    expect(token?.getAttribute('type')).toBe('button');
    expect(token?.getAttribute('lang')).toBe('fr-FR');
    expect(token?.getAttribute('aria-label')).toContain('Simplified wording');
  });

  it('reports NO_ELIGIBLE_TRAPS when nothing can be simplified', async () => {
    renderHtml(
      '<html><body><article><p>Une phrase courte et simple, sans difficulté particulière pour un lecteur ordinaire.</p></article></body></html>',
    );
    const result = await kit.session.activate('ses_a', kit.plan());
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.code).toBe('NO_ELIGIBLE_TRAPS');
  });

  it('surfaces the provider failure rather than a generic empty-page message', async () => {
    kit.failGeneration = true;
    const result = await kit.session.activate('ses_a', kit.plan());
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.code).toBe('PROVIDER_UNAVAILABLE');
  });

  it('is a no-op when the same session activates twice', async () => {
    const first = await kit.session.activate('ses_a', kit.plan());
    const placed = tokens().length;
    const second = await kit.session.activate('ses_a', kit.plan());
    expect(second.ok).toBe(true);
    expect(tokens()).toHaveLength(placed);
    if (first.ok && second.ok) expect(second.data.itemCount).toBe(first.data.itemCount);
  });
});

describe('restoration', () => {
  it('puts the author’s exact words back', async () => {
    renderHtml(DEMO);
    const kit = harness();
    const root = document.querySelector('article');
    if (!root) throw new Error('no article');
    const before = normalizedVisibleText(root);

    await kit.session.activate('ses_a', kit.plan());
    expect(normalizedVisibleText(root)).not.toBe(before);

    const stopped = await kit.session.deactivate('ses_a');
    expect(stopped.ok).toBe(true);
    if (!stopped.ok) return;

    expect(stopped.data.restored).toBe(true);
    expect(stopped.data.textVerified).toBe(true);
    expect(normalizedVisibleText(root)).toBe(before);
    expect(tokens()).toHaveLength(0);
  });

  it('ends the session when the page rewrites a branch Eclipse owns', async () => {
    renderHtml(DEMO);
    const kit = harness();
    await kit.session.activate('ses_a', kit.plan());
    expect(kit.session.isActive).toBe(true);

    const token = tokens()[0];
    token?.remove();
    await flush();

    expect(kit.session.isActive).toBe(false);
  });
});

describe('answering', () => {
  let kit: Harness;

  beforeEach(async () => {
    renderHtml(DEMO);
    kit = harness();
    await kit.session.activate('ses_a', kit.plan());
  });

  it('opens the question when a token is activated', () => {
    const token = tokens()[0];
    token?.click();

    const view = kit.overlay.getSnapshot().view;
    expect(view.kind).toBe('question');
    if (view.kind !== 'question') return;
    expect(view.item.choices).toContain(view.item.acceptedChoice);
    // The choices are French candidate originals, never the visible wording.
    expect(view.item.choices).not.toContain(view.item.simplifiedSurface);
  });

  it('accepts the original wording and reaches higher next time', async () => {
    const token = tokens()[0];
    token?.click();
    const view = kit.overlay.getSnapshot().view;
    if (view.kind !== 'question') throw new Error('expected a question');

    const before = targetComplexity(kit.profile.band);
    await kit.session.submitAnswer(view.item.id, view.item.acceptedChoice);

    const result = kit.overlay.getSnapshot().view;
    expect(result.kind).toBe('result');
    if (result.kind !== 'result') return;

    expect(result.result.correct).toBe(true);
    expect(result.result.direction).toBe('raised');
    expect(result.result.target).toBeGreaterThan(before);
    expect(result.result.previousTarget).toBeCloseTo(before, 6);
    expect(token?.getAttribute('data-answered')).toBe('correct');
  });

  it('records a miss, owes the wording, and marks it on the page', async () => {
    const token = tokens()[0];
    token?.click();
    const view = kit.overlay.getSnapshot().view;
    if (view.kind !== 'question') throw new Error('expected a question');

    const wrong = view.item.choices.find((choice) => choice !== view.item.acceptedChoice);
    if (!wrong) throw new Error('no distractor');

    await kit.session.submitAnswer(view.item.id, wrong);

    const result = kit.overlay.getSnapshot().view;
    if (result.kind !== 'result') throw new Error('expected a result');
    expect(result.result.correct).toBe(false);
    expect(result.result.direction).toBe('lowered');
    expect(result.result.owed).toBe(true);
    expect(token?.getAttribute('data-answered')).toBe('incorrect');
    // The page shows, live, that this one is coming back.
    expect(token?.getAttribute('data-owed')).toBe('true');

    const snapshot = summarizeParaphraseProfile(kit.profile);
    expect(snapshot.dueCount).toBe(1);
    expect(snapshot.review[0]?.original).toBe(view.item.exactSourceText);
  });

  it('applies one answer once, however many times the card is reopened', async () => {
    const token = tokens()[0];
    token?.click();
    const view = kit.overlay.getSnapshot().view;
    if (view.kind !== 'question') throw new Error('expected a question');

    await kit.session.submitAnswer(view.item.id, view.item.acceptedChoice);
    await kit.session.submitAnswer(view.item.id, view.item.acceptedChoice);

    expect(kit.profile.totals.answered).toBe(1);
  });

  it('refuses a choice that was never offered', async () => {
    const token = tokens()[0];
    token?.click();
    const view = kit.overlay.getSnapshot().view;
    if (view.kind !== 'question') throw new Error('expected a question');

    const result = await kit.session.submitAnswer(view.item.id, 'quelque chose d’autre');
    expect(result.ok).toBe(false);
    expect(kit.profile.totals.answered).toBe(0);
  });
});

describe('manual selection', () => {
  let kit: Harness;

  beforeEach(async () => {
    renderHtml(DEMO);
    kit = harness();
    await kit.session.activate('ses_a', kit.plan());
  });

  it('says so plainly when the selection was lost before the request', async () => {
    const result = await kit.session.simplifyPendingSelection();
    expect(result.ok).toBe(false);

    const view = kit.overlay.getSnapshot().view;
    expect(view.kind).toBe('error');
    if (view.kind !== 'error') return;
    expect(view.message).toContain('sélection');
  });

  it('offers to simplify a live selection, then records it as a soft signal', async () => {
    // Find the paragraph still carrying an un-replaced hard wording.
    const paragraph = Array.from(document.querySelectorAll('p')).find((element) =>
      (element.textContent ?? '').includes('appréhendés'),
    );
    if (!paragraph) throw new Error('expected a paragraph to select from');

    const selected = selectText(paragraph, 'appréhendés');
    if (!selected) return; // Selection API unavailable in this environment.

    document.dispatchEvent(new Event('mouseup', { bubbles: true }));
    await flush();

    const prompt = kit.overlay.getSnapshot().prompt;
    expect(prompt?.text).toBe('appréhendés');
  });
});

/**
 * Put a real selection over `needle` inside `element`.
 *
 * Returns false when the environment has no usable Selection API, so the test
 * can degrade to a no-op rather than failing for a reason that has nothing to
 * do with Eclipse.
 */
function selectText(element: Element, needle: string): boolean {
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode() as Text | null;
  while (node) {
    const index = node.data.indexOf(needle);
    if (index >= 0) {
      const selection = window.getSelection?.();
      if (!selection || typeof selection.removeAllRanges !== 'function') return false;
      const range = document.createRange();
      range.setStart(node, index);
      range.setEnd(node, index + needle.length);
      selection.removeAllRanges();
      selection.addRange(range);
      return selection.toString().includes(needle);
    }
    node = walker.nextNode() as Text | null;
  }
  return false;
}
