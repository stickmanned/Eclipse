/**
 * When a concept comes back.
 *
 * - Answer it wrong and it becomes due at its next eligible occurrence, on any
 *   page, immediately.
 * - Answer it right while it was due and it moves onto the review ladder:
 *   one day, then three, then seven, then seven from there on.
 * - Answer it wrong again at any rung and it drops back to next-occurrence.
 *
 * The current rung is derived rather than stored. `ConceptMastery` records
 * `updatedAt` (when it was scheduled) and `due.at` (when it comes back), and
 * the gap between them is the interval that was last granted. That keeps the
 * persisted shape exactly as specified with no hidden bookkeeping field.
 */

import type { ConceptMastery, DueState } from './profile';

export const MS_PER_DAY = 86_400_000;

/** Review intervals in days, in order. */
export const REVIEW_LADDER = [1, 3, 7] as const;

/** The rung the ladder stays on once it is reached. */
export const MAX_REVIEW_INTERVAL_DAYS = 7;

export function daysToMs(days: number): number {
  return days * MS_PER_DAY;
}

/**
 * The interval, in days, that produced the concept's current `due` timestamp.
 * Returns 0 when the concept is not on the ladder.
 */
export function currentIntervalDays(mastery: ConceptMastery): number {
  if (mastery.due.kind !== 'timestamp') return 0;
  const scheduledAt = Date.parse(mastery.updatedAt);
  const dueAt = Date.parse(mastery.due.at);
  if (Number.isNaN(scheduledAt) || Number.isNaN(dueAt)) return 0;
  const days = (dueAt - scheduledAt) / MS_PER_DAY;
  if (days <= 0) return 0;
  return days;
}

/** The next rung up from `previousDays`. */
export function nextIntervalDays(previousDays: number): number {
  for (const rung of REVIEW_LADDER) {
    // A little tolerance so clock skew or a rounded timestamp cannot skip a rung.
    if (previousDays < rung - 0.01) return rung;
  }
  return MAX_REVIEW_INTERVAL_DAYS;
}

/** True when the concept is asking to be shown again. */
export function isDue(mastery: ConceptMastery | undefined, now: Date): boolean {
  if (!mastery) return false;
  if (mastery.due.kind === 'next_occurrence') return true;
  if (mastery.due.kind === 'timestamp') return Date.parse(mastery.due.at) <= now.getTime();
  return false;
}

/**
 * Selection weight for a due concept.
 *
 * `next_occurrence` is the strongest signal (the learner got it wrong and has
 * not yet fixed it). A timestamped review is strong once it is overdue and
 * fades the further in the future it sits, reaching zero a full ladder-length
 * away.
 */
export const DUE_PRIORITY_NEXT_OCCURRENCE = 1;
export const DUE_PRIORITY_OVERDUE = 0.8;
const DUE_HORIZON_DAYS = 7;

export function duePriority(mastery: ConceptMastery | undefined, now: Date): number {
  if (!mastery) return 0;
  if (mastery.due.kind === 'none') return 0;
  if (mastery.due.kind === 'next_occurrence') return DUE_PRIORITY_NEXT_OCCURRENCE;

  const dueAt = Date.parse(mastery.due.at);
  if (Number.isNaN(dueAt)) return 0;
  const daysUntil = (dueAt - now.getTime()) / MS_PER_DAY;
  if (daysUntil <= 0) return DUE_PRIORITY_OVERDUE;
  return Math.max(0, DUE_PRIORITY_OVERDUE * (1 - daysUntil / DUE_HORIZON_DAYS));
}

/**
 * The `due` state a concept takes after an answer.
 *
 * `wasDue` distinguishes "correct while under review" (advance the ladder)
 * from "correct on a concept that was not being reviewed" (nothing owed).
 */
export function nextDueState(
  previous: ConceptMastery | undefined,
  correct: boolean,
  wasDue: boolean,
  now: Date,
): DueState {
  if (!correct) return { kind: 'next_occurrence' };

  if (!wasDue) {
    // Answered correctly without owing a review: clear any outstanding debt.
    return { kind: 'none' };
  }

  const previousDays = previous ? currentIntervalDays(previous) : 0;
  const days = nextIntervalDays(previousDays);
  return { kind: 'timestamp', at: new Date(now.getTime() + daysToMs(days)).toISOString() };
}
