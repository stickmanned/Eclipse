/**
 * Deterministic in-process provider used by the API test suite.
 *
 * No API key, no network. It recognises the same handful of English spans the
 * catalog does, which is enough to exercise every response path without ever
 * calling a real model.
 */

import type { ContextTrapsRequest } from '../schema';
import type { ProviderOutcome, TrapProvider } from './types';

interface FakeRule {
  readonly source: string;
  readonly slug: string;
  readonly sense: string;
  readonly type: 'polysemy' | 'idiom' | 'false_friend';
  readonly surface: string;
  readonly choices: [string, string, string];
  readonly clue: string;
  readonly explanation: string;
  readonly distractorExplanation: string;
}

const RULES: readonly FakeRule[] = [
  {
    source: 'currently',
    slug: 'actuellement',
    sense: 'currently',
    type: 'false_friend',
    surface: 'actuellement',
    choices: ['currently', 'actually', 'eventually'],
    clue: 'will reopen',
    explanation: 'actuellement means currently, at this moment.',
    distractorExplanation: 'actually looks identical but corrects a misunderstanding.',
  },
  {
    source: 'library',
    slug: 'bibliotheque',
    sense: 'library',
    type: 'false_friend',
    surface: 'bibliothèque',
    choices: ['library', 'bookstore', 'stationery shop'],
    clue: 'borrow',
    explanation: 'bibliothèque is a library, a place that lends.',
    distractorExplanation: 'bookstore is librairie, where money changes hands.',
  },
];

/** Behaviour switches the API tests use to drive the failure paths. */
export interface FakeProviderOptions {
  readonly mode?: 'ok' | 'timeout' | 'unavailable' | 'invalid';
  /** Raw output to return instead of the generated one. For malformed cases. */
  readonly override?: unknown;
}

export function fakeProvider(options: FakeProviderOptions = {}): TrapProvider {
  return {
    name: 'fake',
    model: 'fake',
    async generate(request: ContextTrapsRequest, signal: AbortSignal): Promise<ProviderOutcome> {
      if (signal.aborted) return { kind: 'timeout' };

      switch (options.mode) {
        case 'timeout':
          return { kind: 'timeout' };
        case 'unavailable':
          return { kind: 'unavailable', detail: 'fake provider is unavailable' };
        case 'invalid':
          return { kind: 'invalid', detail: 'fake provider returned nonsense' };
        default:
          break;
      }

      if (options.override !== undefined) {
        return { kind: 'ok', output: options.override as never };
      }

      const traps = [];
      for (const sentence of request.sentences) {
        const rule = RULES.find((candidate) =>
          new RegExp(`\\b${candidate.source}\\b`, 'i').test(sentence.text),
        );
        if (!rule) continue;
        traps.push({
          sentenceId: sentence.id,
          conceptSlug: rule.slug,
          englishSense: rule.sense,
          type: rule.type,
          exactSourceText: rule.source,
          targetSurface: rule.surface,
          choices: [...rule.choices],
          acceptedChoice: rule.choices[0],
          clueSpan: rule.clue,
          explanation: rule.explanation,
          distractorExplanation: rule.distractorExplanation,
          difficulty: 0.5,
          confidence: 0.9,
        });
      }

      return { kind: 'ok', output: { traps } };
    },
  };
}
