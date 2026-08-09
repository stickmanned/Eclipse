/**
 * The Paraphrase Mode profile.
 *
 * Two properties are load-bearing and each has a test that would fail loudly if
 * it regressed: a missed wording is owed a reappearance until it has been
 * recovered twice running, and an interaction id is applied exactly once.
 */

import { describe, expect, it } from 'vitest';
import {
  MAX_PARAPHRASE_CONCEPTS,
  RETIRE_AFTER_CONSECUTIVE_CORRECT,
  applyParaphraseAnswer,
  applyParaphraseManualRequest,
  createEmptyParaphraseProfile,
  dueConcepts,
  prune,
  seedProfile,
  summarizeParaphraseProfile,
  type ParaphraseConceptRecord,
  type ParaphraseProfile,
} from '@/domain/paraphrase-profile';
import { seedBandForDelf } from '@/domain/complexity';
import type { ParaphraseConceptId } from '@/domain/paraphrase';

const AMBIGU = 'frp:ambigu:flou' as ParaphraseConceptId;
const FACILITER = 'frp:faciliter:aider' as ParaphraseConceptId;

function answer(
  profile: ParaphraseProfile,
  correct: boolean,
  overrides: { conceptId?: ParaphraseConceptId; interactionId?: string; complexity?: number } = {},
) {
  return applyParaphraseAnswer(profile, {
    interactionId: overrides.interactionId ?? `int_${Math.random().toString(36).slice(2)}`,
    conceptId: overrides.conceptId ?? AMBIGU,
    original: 'Le caractère ambigu',
    simplified: 'Le flou',
    register: 'academic',
    complexity: overrides.complexity ?? 0.78,
    correct,
    now: new Date('2026-08-09T10:00:00.000Z'),
  });
}

describe('seeding', () => {
  it('takes the band from the DELF lens exactly once', () => {
    const fresh = createEmptyParaphraseProfile();
    const seeded = seedProfile(fresh, 'B2');
    expect(seeded.seeded).toBe(true);
    expect(seeded.band).toEqual(seedBandForDelf('B2'));

    // A later re-seed must not discard measured evidence with a guess taken
    // from a different mode's diagnostic.
    const worked = answer(seeded, false).profile;
    expect(seedProfile(worked, 'A1')).toBe(worked);
  });
});

describe('the state machine behind "it comes back"', () => {
  it('owes a wording the learner missed', () => {
    const result = answer(createEmptyParaphraseProfile(), false);
    expect(result.record.state).toBe('unknown');
    expect(result.record.due).toBe('next_occurrence');
    expect(dueConcepts(result.profile).map((entry) => entry.conceptId)).toEqual([AMBIGU]);
  });

  it('keeps owing it after a single recovery', () => {
    let profile = answer(createEmptyParaphraseProfile(), false).profile;
    const second = answer(profile, true);
    profile = second.profile;

    expect(second.record.state).toBe('learning');
    expect(second.record.due).toBe('next_occurrence');
    expect(dueConcepts(profile)).toHaveLength(1);
  });

  it('retires it only after two consecutive recoveries', () => {
    let profile = answer(createEmptyParaphraseProfile(), false).profile;
    for (let index = 0; index < RETIRE_AFTER_CONSECUTIVE_CORRECT; index += 1) {
      profile = answer(profile, true).profile;
    }
    const record = profile.concepts[AMBIGU];
    expect(record?.state).toBe('known');
    expect(record?.due).toBe('none');
    expect(dueConcepts(profile)).toHaveLength(0);
  });

  it('re-owes a retired wording the moment it is missed again', () => {
    let profile = createEmptyParaphraseProfile();
    for (let index = 0; index < RETIRE_AFTER_CONSECUTIVE_CORRECT; index += 1) {
      profile = answer(profile, true).profile;
    }
    expect(profile.concepts[AMBIGU]?.state).toBe('known');

    const missed = answer(profile, false);
    expect(missed.record.state).toBe('unknown');
    expect(missed.record.due).toBe('next_occurrence');
    expect(missed.record.consecutiveCorrect).toBe(0);
  });
});

describe('idempotency', () => {
  it('applies one interaction id exactly once', () => {
    const first = answer(createEmptyParaphraseProfile(), true, { interactionId: 'int_same' });
    expect(first.applied).toBe(true);

    const replay = applyParaphraseAnswer(first.profile, {
      interactionId: 'int_same',
      conceptId: AMBIGU,
      original: 'Le caractère ambigu',
      simplified: 'Le flou',
      register: 'academic',
      complexity: 0.78,
      correct: true,
    });

    expect(replay.applied).toBe(false);
    expect(replay.profile).toBe(first.profile);
    expect(replay.profile.totals.answered).toBe(1);
    expect(replay.profile.band).toEqual(first.profile.band);
  });
});

describe('manual requests', () => {
  it('owe the wording without counting as an attempt', () => {
    const result = applyParaphraseManualRequest(createEmptyParaphraseProfile(), {
      interactionId: 'int_manual',
      conceptId: FACILITER,
      original: 'faciliter',
      simplified: 'aider',
      register: 'formal',
      complexity: 0.55,
    });

    expect(result.applied).toBe(true);
    expect(result.record.due).toBe('next_occurrence');
    expect(result.record.manualRequests).toBe(1);
    expect(result.profile.totals.answered).toBe(0);
    expect(result.profile.totals.manualRequests).toBe(1);
    // A category the learner asked about is not a category they failed.
    expect(result.profile.registers.formal).toEqual({ attempts: 0, correct: 0 });
  });
});

describe('register counters', () => {
  it('accumulate per category', () => {
    let profile = answer(createEmptyParaphraseProfile(), true).profile;
    profile = answer(profile, false, { conceptId: FACILITER }).profile;
    expect(profile.registers.academic).toEqual({ attempts: 2, correct: 1 });
  });
});

describe('pruning', () => {
  it('evicts retired wordings before owed ones', () => {
    const concepts: Record<string, ParaphraseConceptRecord> = {};
    const base: Omit<ParaphraseConceptRecord, 'state' | 'due'> = {
      original: 'x',
      simplified: 'y',
      register: 'formal',
      complexity: 0.5,
      attempts: 1,
      correct: 1,
      consecutiveCorrect: 0,
      manualRequests: 0,
      firstSeenAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };

    // The owed record is the oldest, so recency alone would evict it first.
    concepts['frp:owed:one'] = { ...base, state: 'unknown', due: 'next_occurrence' };
    for (let index = 0; index < MAX_PARAPHRASE_CONCEPTS; index += 1) {
      concepts[`frp:known-${index}:x`] = {
        ...base,
        state: 'known',
        due: 'none',
        updatedAt: `2026-06-${String((index % 28) + 1).padStart(2, '0')}T00:00:00.000Z`,
      };
    }

    const pruned = prune(concepts);
    expect(Object.keys(pruned)).toHaveLength(MAX_PARAPHRASE_CONCEPTS);
    expect(pruned['frp:owed:one']).toBeDefined();
  });
});

describe('the snapshot handed to the popup', () => {
  it('reports counts, focus registers and owed rows without raw history', () => {
    let profile = answer(createEmptyParaphraseProfile(), false).profile;
    profile = answer(profile, true, { conceptId: FACILITER }).profile;

    const snapshot = summarizeParaphraseProfile(profile);
    expect(snapshot.answered).toBe(2);
    expect(snapshot.correct).toBe(1);
    expect(snapshot.tracked).toBe(2);
    expect(snapshot.dueCount).toBe(2);
    expect(snapshot.window[0]).toBeLessThanOrEqual(snapshot.target);
    expect(snapshot.window[1]).toBeGreaterThanOrEqual(snapshot.target);
    expect(snapshot.review.length).toBeGreaterThan(0);
    expect(snapshot.review[0]).toHaveProperty('original');

    // The popup never receives the interaction log or per-answer history.
    expect(snapshot).not.toHaveProperty('interactions');
    expect(snapshot).not.toHaveProperty('recent');
  });

  it('reports no trend until there is enough evidence for one', () => {
    let profile = createEmptyParaphraseProfile();
    for (let index = 0; index < 4; index += 1) profile = answer(profile, true).profile;
    expect(summarizeParaphraseProfile(profile).trend).toBe(0);

    for (let index = 0; index < 4; index += 1) profile = answer(profile, false).profile;
    expect(summarizeParaphraseProfile(profile).trend).toBeLessThan(0);
  });
});
