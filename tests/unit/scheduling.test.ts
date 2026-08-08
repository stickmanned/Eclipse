import { describe, expect, it } from 'vitest';
import {
  DUE_PRIORITY_NEXT_OCCURRENCE,
  DUE_PRIORITY_OVERDUE,
  MS_PER_DAY,
  currentIntervalDays,
  duePriority,
  isDue,
  nextDueState,
  nextIntervalDays,
} from '@/domain/scheduling';
import type { ConceptMastery, DueState } from '@/domain/profile';

const NOW = new Date('2026-03-01T12:00:00.000Z');

function mastery(due: DueState, updatedAt = NOW.toISOString()): ConceptMastery {
  return { score: 0, phase: 'crescent', attempts: 1, correct: 0, due, updatedAt };
}

function daysFromNow(days: number): string {
  return new Date(NOW.getTime() + days * MS_PER_DAY).toISOString();
}

describe('isDue', () => {
  it('is true for next_occurrence', () => {
    expect(isDue(mastery({ kind: 'next_occurrence' }), NOW)).toBe(true);
  });

  it('is false for none', () => {
    expect(isDue(mastery({ kind: 'none' }), NOW)).toBe(false);
  });

  it('is true for a timestamp that has arrived', () => {
    expect(isDue(mastery({ kind: 'timestamp', at: daysFromNow(-1) }), NOW)).toBe(true);
    expect(isDue(mastery({ kind: 'timestamp', at: NOW.toISOString() }), NOW)).toBe(true);
  });

  it('is false for a timestamp in the future', () => {
    expect(isDue(mastery({ kind: 'timestamp', at: daysFromNow(1) }), NOW)).toBe(false);
  });

  it('is false for an unseen concept', () => {
    expect(isDue(undefined, NOW)).toBe(false);
  });
});

describe('the review ladder', () => {
  it('sends an incorrect answer back to next_occurrence', () => {
    expect(nextDueState(undefined, false, false, NOW)).toEqual({ kind: 'next_occurrence' });
    expect(
      nextDueState(mastery({ kind: 'timestamp', at: daysFromNow(-1) }), false, true, NOW),
    ).toEqual({ kind: 'next_occurrence' });
  });

  it('schedules one day for the first correct answer after being due', () => {
    const due = mastery({ kind: 'next_occurrence' });
    const next = nextDueState(due, true, true, NOW);
    expect(next).toEqual({ kind: 'timestamp', at: daysFromNow(1) });
  });

  it('advances one day to three, then three to seven', () => {
    const afterOne = mastery({ kind: 'timestamp', at: daysFromNow(1) }, NOW.toISOString());
    expect(nextDueState(afterOne, true, true, NOW)).toEqual({
      kind: 'timestamp',
      at: daysFromNow(3),
    });

    const afterThree = mastery(
      { kind: 'timestamp', at: new Date(NOW.getTime() + 3 * MS_PER_DAY).toISOString() },
      NOW.toISOString(),
    );
    expect(nextDueState(afterThree, true, true, NOW)).toEqual({
      kind: 'timestamp',
      at: daysFromNow(7),
    });
  });

  it('stays at seven days thereafter', () => {
    const afterSeven = mastery({ kind: 'timestamp', at: daysFromNow(7) }, NOW.toISOString());
    expect(nextDueState(afterSeven, true, true, NOW)).toEqual({
      kind: 'timestamp',
      at: daysFromNow(7),
    });
  });

  it('drops back to next_occurrence from any rung on a wrong answer', () => {
    const afterSeven = mastery({ kind: 'timestamp', at: daysFromNow(7) });
    expect(nextDueState(afterSeven, false, true, NOW)).toEqual({ kind: 'next_occurrence' });
  });

  it('owes nothing when a concept is answered correctly while not due', () => {
    expect(nextDueState(mastery({ kind: 'none' }), true, false, NOW)).toEqual({ kind: 'none' });
  });

  it('derives the current interval from updatedAt and due.at', () => {
    const record = mastery({ kind: 'timestamp', at: daysFromNow(3) }, NOW.toISOString());
    expect(currentIntervalDays(record)).toBeCloseTo(3, 6);
    expect(currentIntervalDays(mastery({ kind: 'next_occurrence' }))).toBe(0);
    expect(currentIntervalDays(mastery({ kind: 'none' }))).toBe(0);
  });

  it('does not skip a rung on a slightly rounded timestamp', () => {
    expect(nextIntervalDays(0)).toBe(1);
    expect(nextIntervalDays(0.999)).toBe(3);
    expect(nextIntervalDays(1)).toBe(3);
    expect(nextIntervalDays(2.995)).toBe(7);
    expect(nextIntervalDays(3)).toBe(7);
    expect(nextIntervalDays(7)).toBe(7);
    expect(nextIntervalDays(30)).toBe(7);
  });
});

describe('duePriority', () => {
  it('gives next_occurrence the top weight', () => {
    expect(duePriority(mastery({ kind: 'next_occurrence' }), NOW)).toBe(
      DUE_PRIORITY_NEXT_OCCURRENCE,
    );
  });

  it('gives nothing to a concept with no debt', () => {
    expect(duePriority(mastery({ kind: 'none' }), NOW)).toBe(0);
    expect(duePriority(undefined, NOW)).toBe(0);
  });

  it('gives an overdue review a strong but lower weight', () => {
    const priority = duePriority(mastery({ kind: 'timestamp', at: daysFromNow(-2) }), NOW);
    expect(priority).toBe(DUE_PRIORITY_OVERDUE);
    expect(priority).toBeLessThan(DUE_PRIORITY_NEXT_OCCURRENCE);
  });

  it('decays as a scheduled review recedes into the future', () => {
    const soon = duePriority(mastery({ kind: 'timestamp', at: daysFromNow(1) }), NOW);
    const later = duePriority(mastery({ kind: 'timestamp', at: daysFromNow(5) }), NOW);
    expect(soon).toBeGreaterThan(later);
    expect(later).toBeGreaterThan(0);
    expect(duePriority(mastery({ kind: 'timestamp', at: daysFromNow(7) }), NOW)).toBe(0);
  });
});
