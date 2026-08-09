import { describe, expect, it } from 'vitest';
import {
  TARGET_BAND_MAX,
  TARGET_BAND_MIN,
  WEIGHT_CONTEXT_QUALITY,
  WEIGHT_DUE_PRIORITY,
  WEIGHT_SALIENCE,
  WEIGHT_UNCERTAINTY,
  compareCandidates,
  scoreCandidate,
  selectCandidates,
  uncertaintyOf,
  type SelectionCandidate,
  type SelectionContext,
} from '@/domain/selection';
import { emptyMastery, type ConceptMastery } from '@/domain/profile';

const NOW = new Date('2026-03-01T12:00:00.000Z');

function candidate(overrides: Partial<SelectionCandidate> = {}): SelectionCandidate {
  return {
    trapId: 'fr:attendre:wait@0:10',
    conceptId: 'fr:attendre:wait',
    domOrder: 0,
    blockKey: 'block:0',
    sentenceKey: 'block:0#0',
    rangeStart: 10,
    rangeEnd: 14,
    difficulty: 0.5,
    contextQuality: 0.9,
    salience: 1,
    ...overrides,
  };
}

function context(mastery: Record<string, ConceptMastery> = {}): SelectionContext {
  return { globalAbility: 0, mastery, now: NOW };
}

function masteryRecord(overrides: Partial<ConceptMastery> = {}): ConceptMastery {
  return {
    ...emptyMastery(NOW),
    attempts: 1,
    correct: 0,
    ...overrides,
  };
}

const LIMITS = {
  maxTraps: 4,
  maxTrapsPerBlock: 2,
  minTraps: 2,
  maxDensity: 0.08,
  eligibleWordCount: 1000,
};

describe('the weights match the plan', () => {
  it('is 0.40 / 0.30 / 0.20 / 0.10', () => {
    expect(WEIGHT_UNCERTAINTY).toBe(0.4);
    expect(WEIGHT_DUE_PRIORITY).toBe(0.3);
    expect(WEIGHT_CONTEXT_QUALITY).toBe(0.2);
    expect(WEIGHT_SALIENCE).toBe(0.1);
    expect(
      WEIGHT_UNCERTAINTY + WEIGHT_DUE_PRIORITY + WEIGHT_CONTEXT_QUALITY + WEIGHT_SALIENCE,
    ).toBeCloseTo(1, 10);
  });
});

describe('uncertainty', () => {
  it('peaks at a coin flip and falls to zero at certainty', () => {
    expect(uncertaintyOf(0.5)).toBe(1);
    expect(uncertaintyOf(0)).toBe(0);
    expect(uncertaintyOf(1)).toBe(0);
    expect(uncertaintyOf(0.75)).toBeCloseTo(0.5, 10);
  });
});

describe('scoring', () => {
  it('rewards a candidate in the 65–80% band', () => {
    const scored = scoreCandidate(candidate({ difficulty: 0.5 }), context());
    // ability 0, concept 0, difficulty 0.5 => exactly 0.5, outside the band.
    expect(scored.predictedCorrect).toBeCloseTo(0.5, 10);
    expect(scored.inTargetBand).toBe(false);

    const easier = scoreCandidate(
      candidate({ difficulty: 0.1 }),
      context({ 'fr:attendre:wait': masteryRecord({ score: 0.5 }) }),
    );
    expect(easier.predictedCorrect).toBeGreaterThanOrEqual(TARGET_BAND_MIN);
    expect(easier.predictedCorrect).toBeLessThanOrEqual(TARGET_BAND_MAX);
    expect(easier.inTargetBand).toBe(true);
  });

  it('marks a next_occurrence concept as due with top priority', () => {
    const scored = scoreCandidate(
      candidate(),
      context({ 'fr:attendre:wait': masteryRecord({ due: { kind: 'next_occurrence' } }) }),
    );
    expect(scored.due).toBe(true);
    expect(scored.duePriority).toBe(1);
  });
});

describe('ranking', () => {
  it('puts due concepts ahead of everything else', () => {
    const due = scoreCandidate(
      candidate({ trapId: 'b', conceptId: 'fr:attendre:wait', domOrder: 9 }),
      context({ 'fr:attendre:wait': masteryRecord({ due: { kind: 'next_occurrence' } }) }),
    );
    const notDue = scoreCandidate(
      candidate({ trapId: 'a', conceptId: 'fr:appel:appeal', domOrder: 0 }),
      context(),
    );
    expect([notDue, due].sort(compareCandidates)[0]?.trapId).toBe('b');
  });

  it('breaks ties by document order, then trap id', () => {
    const first = scoreCandidate(candidate({ trapId: 'z', domOrder: 0 }), context());
    const second = scoreCandidate(
      candidate({ trapId: 'a', domOrder: 1, conceptId: 'fr:attendre:wait' }),
      context(),
    );
    expect([second, first].sort(compareCandidates).map((c) => c.trapId)).toEqual(['z', 'a']);

    const sameOrderA = scoreCandidate(candidate({ trapId: 'aaa' }), context());
    const sameOrderB = scoreCandidate(candidate({ trapId: 'bbb' }), context());
    expect([sameOrderB, sameOrderA].sort(compareCandidates).map((c) => c.trapId)).toEqual([
      'aaa',
      'bbb',
    ]);
  });

  it('is stable across repeated runs', () => {
    const candidates = [
      candidate({ trapId: 'a', conceptId: 'fr:appel:appeal', domOrder: 2, blockKey: 'block:2' }),
      candidate({ trapId: 'b', conceptId: 'fr:attendre:wait', domOrder: 0, blockKey: 'block:0' }),
      candidate({
        trapId: 'c',
        conceptId: 'fr:actuellement:currently',
        domOrder: 1,
        blockKey: 'block:1',
      }),
    ];
    const first = selectCandidates(candidates, context(), LIMITS).map((c) => c.trapId);
    const second = selectCandidates(candidates, context(), LIMITS).map((c) => c.trapId);
    expect(first).toEqual(second);
  });
});

describe('placement rules', () => {
  const spread = [
    candidate({
      trapId: 'a',
      conceptId: 'fr:attendre:wait',
      domOrder: 0,
      blockKey: 'block:0',
      sentenceKey: 'block:0#0',
    }),
    candidate({
      trapId: 'b',
      conceptId: 'fr:appel:appeal',
      domOrder: 1,
      blockKey: 'block:1',
      sentenceKey: 'block:1#0',
    }),
    candidate({
      trapId: 'c',
      conceptId: 'fr:actuellement:currently',
      domOrder: 2,
      blockKey: 'block:2',
      sentenceKey: 'block:2#0',
    }),
    candidate({
      trapId: 'd',
      conceptId: 'fr:journee:day',
      domOrder: 3,
      blockKey: 'block:3',
      sentenceKey: 'block:3#0',
    }),
    candidate({
      trapId: 'e',
      conceptId: 'fr:rester:stay',
      domOrder: 4,
      blockKey: 'block:4',
      sentenceKey: 'block:4#0',
    }),
  ];

  it('never renders more than four traps', () => {
    expect(selectCandidates(spread, context(), LIMITS)).toHaveLength(4);
  });

  it('places at most two traps per block', () => {
    const sameBlock = [
      candidate({ trapId: 'a', conceptId: 'fr:attendre:wait', sentenceKey: 'block:0#0' }),
      candidate({
        trapId: 'b',
        conceptId: 'fr:appel:appeal',
        sentenceKey: 'block:0#1',
        rangeStart: 40,
        rangeEnd: 46,
      }),
      candidate({
        trapId: 'c',
        conceptId: 'fr:actuellement:currently',
        sentenceKey: 'block:0#2',
        rangeStart: 70,
        rangeEnd: 78,
      }),
    ];
    expect(selectCandidates(sameBlock, context(), LIMITS)).toHaveLength(2);
  });

  it('never places two traps in one sentence', () => {
    const sameSentence = [
      candidate({ trapId: 'a', conceptId: 'fr:attendre:wait', blockKey: 'block:0' }),
      candidate({
        trapId: 'b',
        conceptId: 'fr:appel:appeal',
        blockKey: 'block:1',
        sentenceKey: 'block:0#0',
        rangeStart: 40,
        rangeEnd: 46,
      }),
    ];
    expect(selectCandidates(sameSentence, context(), LIMITS)).toHaveLength(1);
  });

  it('rejects overlapping source ranges', () => {
    const overlapping = [
      candidate({ trapId: 'a', conceptId: 'fr:attendre:wait', rangeStart: 10, rangeEnd: 20 }),
      candidate({
        trapId: 'b',
        conceptId: 'fr:appel:appeal',
        blockKey: 'block:0',
        sentenceKey: 'block:0#1',
        rangeStart: 15,
        rangeEnd: 25,
      }),
    ];
    expect(selectCandidates(overlapping, context(), LIMITS)).toHaveLength(1);
  });

  it('never repeats a concept on one page', () => {
    const repeated = [
      candidate({ trapId: 'a', domOrder: 0, blockKey: 'block:0', sentenceKey: 'block:0#0' }),
      candidate({ trapId: 'b', domOrder: 1, blockKey: 'block:1', sentenceKey: 'block:1#0' }),
    ];
    expect(selectCandidates(repeated, context(), LIMITS)).toHaveLength(1);
  });

  it('honours the configured density ceiling', () => {
    // 66 eligible words => floor(66 * 0.03) = 1 trap.
    const limited = { ...LIMITS, maxDensity: 0.03, eligibleWordCount: 66 };
    expect(selectCandidates(spread, context(), limited)).toHaveLength(1);

    // 33 eligible words => floor(0.99) = 0 traps.
    expect(
      selectCandidates(spread, context(), {
        ...LIMITS,
        maxDensity: 0.03,
        eligibleWordCount: 33,
      }),
    ).toHaveLength(0);
  });
});

describe('DELF reading lens', () => {
  const levels = [
    candidate({
      trapId: 'a1',
      conceptId: 'fr:facile:easy',
      difficulty: 0.2,
      blockKey: 'block:a1',
      sentenceKey: 'block:a1#0',
    }),
    candidate({
      trapId: 'a2',
      conceptId: 'fr:frequent:common',
      difficulty: 0.4,
      blockKey: 'block:a2',
      sentenceKey: 'block:a2#0',
    }),
    candidate({
      trapId: 'b1',
      conceptId: 'fr:nuance:nuance',
      difficulty: 0.6,
      blockKey: 'block:b1',
      sentenceKey: 'block:b1#0',
    }),
    candidate({
      trapId: 'b2',
      conceptId: 'fr:abstrait:abstract',
      difficulty: 0.9,
      blockKey: 'block:b2',
      sentenceKey: 'block:b2#0',
    }),
  ];

  it('keeps A1 highlights strictly within A1 range (0-0.29)', () => {
    const chosen = selectCandidates(levels, { ...context(), delfLevel: 'A1' }, LIMITS);
    expect(chosen.map((item) => item.trapId)).toEqual(['a1']);
    expect(chosen.map((item) => item.trapId)).not.toContain('a2');
    expect(chosen.map((item) => item.trapId)).not.toContain('b1');
    expect(chosen.map((item) => item.trapId)).not.toContain('b2');
  });

  it('keeps B1 highlights strictly within B1 range (0.50-0.69)', () => {
    const chosen = selectCandidates(levels, { ...context(), delfLevel: 'B1' }, LIMITS);
    expect(chosen.map((item) => item.trapId)).toEqual(['b1']);
    expect(chosen.map((item) => item.trapId)).not.toContain('a1');
    expect(chosen.map((item) => item.trapId)).not.toContain('a2');
    expect(chosen.map((item) => item.trapId)).not.toContain('b2');
  });

  it('keeps B2 highlights strictly within B2 range (0.70-1.00)', () => {
    const chosen = selectCandidates(levels, { ...context(), delfLevel: 'B2' }, LIMITS);
    expect(chosen.map((item) => item.trapId)).toEqual(['b2']);
    expect(chosen.map((item) => item.trapId)).not.toContain('a1');
    expect(chosen.map((item) => item.trapId)).not.toContain('a2');
    expect(chosen.map((item) => item.trapId)).not.toContain('b1');
  });
});

describe('due override', () => {
  it('promotes a due concept over a better-scoring fresh one', () => {
    const freshHighScore = candidate({
      trapId: 'fresh',
      conceptId: 'fr:appel:appeal',
      contextQuality: 1,
      salience: 1,
      difficulty: 0.5,
      domOrder: 0,
      blockKey: 'block:0',
      sentenceKey: 'block:0#0',
    });
    const dueLowScore = candidate({
      trapId: 'due',
      conceptId: 'fr:attendre:wait',
      contextQuality: 0.1,
      salience: 0.1,
      difficulty: 0.1,
      domOrder: 5,
      blockKey: 'block:5',
      sentenceKey: 'block:5#0',
    });

    const withDue = context({
      'fr:attendre:wait': masteryRecord({ score: -0.3, due: { kind: 'next_occurrence' } }),
    });

    const chosen = selectCandidates([freshHighScore, dueLowScore], withDue, {
      ...LIMITS,
      maxTraps: 1,
      maxTrapsPerBlock: 2,
    });
    expect(chosen.map((c) => c.trapId)).toEqual(['due']);
  });
});
