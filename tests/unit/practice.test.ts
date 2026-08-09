import { describe, expect, it } from 'vitest';
import {
  buildPracticeQueue,
  isPracticeAnswerCorrect,
  normalizePracticeAnswer,
} from '@/domain/practice';
import type { LearningPhase, VocabularyItem } from '@/domain/profile';

const NOW = new Date('2026-03-08T12:00:00.000Z');

function item(
  conceptId: string,
  phase: LearningPhase,
  overrides: Partial<VocabularyItem> = {},
): VocabularyItem {
  return {
    conceptId,
    targetSurface: conceptId.split(':')[1] ?? conceptId,
    englishMeaning: conceptId.split(':')[2] ?? 'meaning',
    kind: 'word',
    phase,
    attempts: 1,
    correct: 1,
    intervalDays: 2,
    unassistedCorrect: 0,
    lapses: 0,
    stability: 1,
    retrievability: 0.9,
    successfulReviewDays: [],
    contextCount: 0,
    memoryDimmed: false,
    due: { kind: 'timestamp', at: '2026-03-10T12:00:00.000Z' },
    updatedAt: '2026-03-01T12:00:00.000Z',
    ...overrides,
  };
}

describe('typed answer checking', () => {
  it('normalizes case, whitespace, punctuation, and apostrophes', () => {
    expect(normalizePracticeAnswer('  DON’T   WAIT! ')).toBe("don't wait");
  });

  it('accepts authored aliases and ordinary infinitive/article variation', () => {
    expect(isPracticeAnswerCorrect('to wait', 'wait')).toBe(true);
    expect(isPracticeAnswerCorrect('a library', 'library')).toBe(true);
    expect(isPracticeAnswerCorrect('delay', 'wait / delay')).toBe(true);
    expect(isPracticeAnswerCorrect('set up', 'set up (a system)')).toBe(true);
  });

  it('does not use fuzzy spelling to turn a different word into success', () => {
    expect(isPracticeAnswerCorrect('weight', 'wait')).toBe(false);
    expect(isPracticeAnswerCorrect('', 'wait')).toBe(false);
  });
});

describe('practice queue', () => {
  it('puts failed correction debt before overdue and future learning items', () => {
    const correction = item('fr:attendre:wait', 'crescent', {
      correct: 0,
      lapses: 1,
      due: { kind: 'next_occurrence' },
    });
    const overdue = item('fr:appel:appeal', 'half', {
      due: { kind: 'timestamp', at: '2026-03-07T12:00:00.000Z' },
    });
    const future = item('fr:journee:day', 'crescent');

    expect(
      buildPracticeQueue([future, overdue, correction], NOW).map((entry) => entry.conceptId),
    ).toEqual([correction.conceptId, overdue.conceptId, future.conceptId]);
  });

  it('never puts Full Moon items back into Practice weakest', () => {
    const dueFull = item('fr:pourtant:however', 'full', {
      due: { kind: 'timestamp', at: NOW.toISOString() },
    });
    const futureFull = item('fr:enjeu:stake', 'full');
    const learning = item('fr:attendre:wait', 'crescent');

    expect(
      buildPracticeQueue([futureFull, learning, dueFull], NOW).map((entry) => entry.conceptId),
    ).toEqual([learning.conceptId]);
    expect(buildPracticeQueue([futureFull, dueFull], NOW)).toEqual([]);
  });

  it('orders equally due reviews by lowest current retrievability', () => {
    const stronger = item('fr:fort:strong', 'half', {
      retrievability: 0.78,
      due: { kind: 'timestamp', at: '2026-03-07T12:00:00.000Z' },
    });
    const weaker = item('fr:faible:weak', 'half', {
      retrievability: 0.42,
      due: { kind: 'timestamp', at: '2026-03-07T12:00:00.000Z' },
    });
    expect(buildPracticeQueue([stronger, weaker], NOW).map((entry) => entry.conceptId)).toEqual([
      weaker.conceptId,
      stronger.conceptId,
    ]);
  });

  it('remains deterministic and bounded', () => {
    const items = Array.from({ length: 12 }, (_, index) =>
      item(`fr:item${index}:meaning${index}`, 'crescent'),
    );
    expect(buildPracticeQueue(items, NOW, 3)).toEqual(buildPracticeQueue(items, NOW, 3));
    expect(buildPracticeQueue(items, NOW, 3)).toHaveLength(3);
    expect(buildPracticeQueue(items, NOW, 0)).toEqual([]);
  });
});
