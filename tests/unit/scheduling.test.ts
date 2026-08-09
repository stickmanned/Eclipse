import { describe, expect, it } from 'vitest';
import { emptyMastery, type ConceptMastery, type DueState } from '@/domain/profile';
import {
  DUE_PRIORITY_NEXT_OCCURRENCE,
  FSRS_DESIRED_RETENTION,
  MS_PER_DAY,
  currentIntervalDays,
  duePriority,
  isDue,
  scheduleAnswer,
} from '@/domain/scheduling';

const NOW = new Date('2026-03-01T12:00:00.000Z');

function daysFromNow(days: number): string {
  return new Date(NOW.getTime() + days * MS_PER_DAY).toISOString();
}

function mastery(due: DueState): ConceptMastery {
  return { ...emptyMastery(NOW), attempts: 1, due };
}

function afterAnswer(correct: boolean, assisted: boolean, now = NOW): ConceptMastery {
  const scheduled = scheduleAnswer(undefined, correct, assisted, now);
  return {
    ...emptyMastery(now),
    attempts: 1,
    correct: correct ? 1 : 0,
    lapses: correct ? 0 : 1,
    intervalDays: scheduled.intervalDays,
    fsrsCard: scheduled.fsrsCard,
    due: scheduled.due,
  };
}

describe('FSRS policy', () => {
  it('pins the desired retention at 90%', () => {
    expect(FSRS_DESIRED_RETENTION).toBe(0.9);
  });

  it('schedules even a correct first contextual answer', () => {
    const decision = scheduleAnswer(undefined, true, true, NOW);
    expect(decision.rating).toBe('hard');
    expect(decision.scheduled).toBe(true);
    expect(decision.creditedRecall).toBe(false);
    expect(decision.due.kind).toBe('timestamp');
    expect(decision.intervalDays).toBeGreaterThanOrEqual(1);
  });

  it('places a miss into the correction queue and preserves scheduler state', () => {
    const decision = scheduleAnswer(undefined, false, true, NOW);
    expect(decision.rating).toBe('again');
    expect(decision.due).toEqual({ kind: 'next_occurrence' });
    expect(decision.fsrsCard.reps).toBe(1);
    expect(decision.fsrsCard.lapses).toBe(0);
  });

  it('credits an unassisted scheduled retrieval', () => {
    const failed = afterAnswer(false, true);
    const correction = scheduleAnswer(failed, true, false, new Date(NOW.getTime() + 60_000));
    expect(correction.rating).toBe('good');
    expect(correction.scheduled).toBe(true);
    expect(correction.creditedRecall).toBe(true);
    expect(correction.due.kind).toBe('timestamp');
  });

  it('records early success without extending the schedule', () => {
    const learned = afterAnswer(true, false);
    const early = scheduleAnswer(learned, true, false, new Date(NOW.getTime() + 60_000));
    expect(early.scheduled).toBe(false);
    expect(early.creditedRecall).toBe(false);
    expect(early.due).toEqual(learned.due);
    expect(early.fsrsCard).toEqual(learned.fsrsCard);
  });

  it('turns an early failure into relearning debt', () => {
    const learned = afterAnswer(true, false);
    const lapse = scheduleAnswer(learned, false, false, new Date(NOW.getTime() + 60_000));
    expect(lapse.scheduled).toBe(false);
    expect(lapse.due).toEqual({ kind: 'next_occurrence' });
    expect(lapse.fsrsCard.lapses).toBeGreaterThanOrEqual(1);
  });
});

describe('isDue', () => {
  it('recognizes correction, arrived, future, and absent debt', () => {
    expect(isDue(mastery({ kind: 'next_occurrence' }), NOW)).toBe(true);
    expect(isDue(mastery({ kind: 'timestamp', at: daysFromNow(-1) }), NOW)).toBe(true);
    expect(isDue(mastery({ kind: 'timestamp', at: NOW.toISOString() }), NOW)).toBe(true);
    expect(isDue(mastery({ kind: 'timestamp', at: daysFromNow(1) }), NOW)).toBe(false);
    expect(isDue(mastery({ kind: 'none' }), NOW)).toBe(false);
    expect(isDue(undefined, NOW)).toBe(false);
  });

  it('reads the persisted interval rather than reverse-engineering timestamps', () => {
    expect(currentIntervalDays({ ...mastery({ kind: 'none' }), intervalDays: 14 })).toBe(14);
  });
});

describe('duePriority', () => {
  it('puts correction debt ahead of scheduled reviews', () => {
    const correction = duePriority(mastery({ kind: 'next_occurrence' }), NOW);
    const learned = afterAnswer(true, false);
    const overdue = duePriority(
      { ...learned, due: { kind: 'timestamp', at: daysFromNow(-2) } },
      NOW,
    );
    expect(correction).toBe(DUE_PRIORITY_NEXT_OCCURRENCE);
    expect(overdue).toBeGreaterThan(0);
    expect(overdue).toBeLessThan(correction);
  });

  it('gives no selection weight to a review that is not due', () => {
    expect(duePriority(mastery({ kind: 'none' }), NOW)).toBe(0);
    expect(duePriority(mastery({ kind: 'timestamp', at: daysFromNow(1) }), NOW)).toBe(0);
    expect(duePriority(undefined, NOW)).toBe(0);
  });
});
