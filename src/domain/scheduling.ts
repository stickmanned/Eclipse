/**
 * Eclipse's local FSRS scheduling adapter.
 *
 * The pinned library owns memory difficulty, stability, retrievability, and
 * interval selection. Eclipse owns two policies around it: an incorrect answer
 * is immediately available in the correction queue, and an early voluntary
 * correct answer is recorded but does not advance the card.
 */

import { createEmptyCard, fsrs, Rating, type Card, type CardInput, type Grade } from 'ts-fsrs';
import type { ConceptMastery, DueState, FsrsCardState, SchedulerRating } from './profile';

export const MS_PER_DAY = 86_400_000;
export const FSRS_DESIRED_RETENTION = 0.9;
export const MAX_REVIEW_INTERVAL_DAYS = 365;

const scheduler = fsrs({
  request_retention: FSRS_DESIRED_RETENTION,
  maximum_interval: MAX_REVIEW_INTERVAL_DAYS,
  enable_fuzz: false,
  enable_short_term: false,
  learning_steps: [],
  relearning_steps: [],
});

export function daysToMs(days: number): number {
  return days * MS_PER_DAY;
}

export function serializeFsrsCard(card: Card): FsrsCardState {
  return {
    due: card.due.toISOString(),
    stability: card.stability,
    difficulty: card.difficulty,
    elapsedDays: card.elapsed_days,
    scheduledDays: card.scheduled_days,
    learningSteps: card.learning_steps,
    reps: card.reps,
    lapses: card.lapses,
    state: card.state,
    lastReview: card.last_review?.toISOString(),
  };
}

function deserializeFsrsCard(card: FsrsCardState): CardInput {
  return {
    due: card.due,
    stability: card.stability,
    difficulty: card.difficulty,
    elapsed_days: card.elapsedDays,
    scheduled_days: card.scheduledDays,
    learning_steps: card.learningSteps,
    reps: card.reps,
    lapses: card.lapses,
    state: card.state,
    last_review: card.lastReview,
  };
}

export function emptyFsrsCard(now: Date): FsrsCardState {
  return serializeFsrsCard(createEmptyCard(now));
}

/** Build a conservative reviewed card while migrating aggregate v1 history. */
export function migratedFsrsCard(
  updatedAt: Date,
  due: DueState,
  intervalDays: number,
  attempts: number,
  lapses: number,
): FsrsCardState {
  const card = emptyFsrsCard(updatedAt);
  return {
    ...card,
    due:
      due.kind === 'timestamp'
        ? due.at
        : new Date(updatedAt.getTime() + Math.max(1, intervalDays) * MS_PER_DAY).toISOString(),
    stability: intervalDays,
    scheduledDays: intervalDays,
    reps: attempts,
    lapses,
    state: attempts > 0 ? 2 : 0,
    lastReview: attempts > 0 ? updatedAt.toISOString() : undefined,
  };
}

export function currentIntervalDays(mastery: ConceptMastery): number {
  return mastery.intervalDays;
}

/** True when the concept is asking to be shown again. */
export function isDue(mastery: ConceptMastery | undefined, now: Date): boolean {
  if (!mastery) return false;
  if (mastery.due.kind === 'next_occurrence') return true;
  if (mastery.due.kind === 'timestamp') return Date.parse(mastery.due.at) <= now.getTime();
  return false;
}

export function retrievabilityOf(mastery: ConceptMastery | undefined, now: Date): number {
  if (!mastery || mastery.fsrsCard.reps === 0) return 0;
  return scheduler.get_retrievability(deserializeFsrsCard(mastery.fsrsCard), now, false);
}

/** Selection weight for an item that is actually due now. */
export const DUE_PRIORITY_NEXT_OCCURRENCE = 1;
export const DUE_PRIORITY_OVERDUE = 0.8;

export function duePriority(mastery: ConceptMastery | undefined, now: Date): number {
  if (!mastery || !isDue(mastery, now)) return 0;
  if (mastery.due.kind === 'next_occurrence') return DUE_PRIORITY_NEXT_OCCURRENCE;
  const retrievability = retrievabilityOf(mastery, now);
  return Math.min(0.95, DUE_PRIORITY_OVERDUE + Math.max(0, 0.9 - retrievability));
}

export interface ScheduleDecision {
  readonly due: DueState;
  readonly intervalDays: number;
  readonly fsrsCard: FsrsCardState;
  readonly creditedRecall: boolean;
  readonly scheduled: boolean;
  readonly rating: SchedulerRating;
}

function outcomeRating(
  correct: boolean,
  assisted: boolean,
): {
  grade: Grade;
  label: SchedulerRating;
} {
  if (!correct) return { grade: Rating.Again, label: 'again' };
  if (assisted) return { grade: Rating.Hard, label: 'hard' };
  return { grade: Rating.Good, label: 'good' };
}

/** Apply one objective answer to the scheduler. */
export function scheduleAnswer(
  previous: ConceptMastery | undefined,
  correct: boolean,
  assisted: boolean,
  now: Date,
): ScheduleDecision {
  const rating = outcomeRating(correct, assisted);
  const scheduled = !previous || previous.due.kind === 'none' || isDue(previous, now);

  // Early correct practice is useful feedback but not evidence for a longer
  // interval. Early failure is real evidence and must enter relearning.
  if (previous && correct && !scheduled) {
    return {
      due: previous.due,
      intervalDays: previous.intervalDays,
      fsrsCard: previous.fsrsCard,
      creditedRecall: false,
      scheduled: false,
      rating: rating.label,
    };
  }

  const card = previous
    ? deserializeFsrsCard(previous.fsrsCard)
    : deserializeFsrsCard(emptyFsrsCard(now));
  const next = scheduler.next(card, now, rating.grade).card;
  const fsrsCard = serializeFsrsCard(next);

  return {
    due: correct ? { kind: 'timestamp', at: fsrsCard.due } : { kind: 'next_occurrence' },
    intervalDays: fsrsCard.scheduledDays,
    fsrsCard,
    creditedRecall: correct && !assisted && scheduled,
    scheduled,
    rating: rating.label,
  };
}
