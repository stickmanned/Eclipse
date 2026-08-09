/**
 * Applying an answer to the learner profile.
 *
 * This is the single place where scoring, phase and scheduling meet. The
 * background worker is the durable writer — see docs/ARCHITECTURE.md on why
 * answer outcomes have exactly one persistence seam.
 */

import {
  RECENT_OUTCOMES_LIMIT,
  REVIEW_EVENT_LIMIT,
  SUCCESSFUL_REVIEW_DAY_LIMIT,
  CONTEXT_FINGERPRINT_LIMIT,
  emptyMastery,
  pruneMastery,
  type AnswerOutcome,
  type ConceptMastery,
  type LearnerProfile,
  type MoonPhase,
  type ReviewMode,
  type ReviewEvent,
  type VocabularyDisplay,
} from './profile';
import { applyAnswer, phaseFor } from './scoring';
import { scheduleAnswer } from './scheduling';
import type { ConceptId } from './trap';

export interface RecordAnswerInput {
  readonly profile: LearnerProfile;
  readonly interactionId: string;
  readonly conceptId: ConceptId;
  readonly difficulty: number;
  readonly correct: boolean;
  readonly now: Date;
  readonly display?: VocabularyDisplay;
  readonly assisted: boolean;
  readonly mode: ReviewMode;
  readonly contextFingerprint?: string;
}

export interface RecordAnswerResult {
  readonly profile: LearnerProfile;
  readonly mastery: ConceptMastery;
  readonly previousPhase: MoonPhase;
  readonly phase: MoonPhase;
  readonly predictedCorrect: number;
  /** False when this interaction id had already been applied. */
  readonly applied: boolean;
}

/**
 * Fold one answer into the profile.
 *
 * Idempotent by `interactionId`: replaying the same answer returns the profile
 * unchanged with `applied: false`. The caller is responsible for persisting the
 * interaction id alongside the profile (see storage/interaction-log.ts) so the
 * guarantee survives a reload; `recentOutcomes` alone is only five deep.
 */
export function recordAnswer(input: RecordAnswerInput): RecordAnswerResult {
  const {
    profile,
    interactionId,
    conceptId,
    difficulty,
    correct,
    now,
    display,
    assisted,
    mode,
    contextFingerprint,
  } = input;

  const existing = profile.mastery[conceptId];
  const previousPhase = existing?.phase ?? 'new_moon';

  const alreadyApplied = profile.recentOutcomes.some(
    (outcome) => outcome.interactionId === interactionId,
  );
  if (alreadyApplied) {
    return {
      profile,
      mastery: existing ?? emptyMastery(now),
      previousPhase,
      phase: previousPhase,
      predictedCorrect: 0,
      applied: false,
    };
  }

  const base = existing ?? emptyMastery(now);
  const update = applyAnswer({
    globalAbility: profile.globalAbility,
    conceptScore: base.score,
    difficulty,
    correct,
  });

  const attempts = base.attempts + 1;
  const correctCount = base.correct + (correct ? 1 : 0);
  const schedule = scheduleAnswer(existing, correct, assisted, now);
  // v1 Half/Full records predate the typed-practice counter. Seed their
  // minimum earned count once so an upgrade never erases visible mastery.
  const legacyFloor = base.legacyPhase
    ? base.phase === 'full'
      ? 3
      : base.phase === 'half'
        ? 1
        : 0
    : 0;
  const typedPracticeCorrect = correct && !assisted && mode === 'typed-meaning';
  const unassistedCorrect =
    Math.max(base.unassistedCorrect, legacyFloor) + (typedPracticeCorrect ? 1 : 0);
  const reviewDay = now.toISOString().slice(0, 10);
  const successfulReviewDays = schedule.creditedRecall
    ? [...new Set([...base.successfulReviewDays, reviewDay])].slice(-SUCCESSFUL_REVIEW_DAY_LIMIT)
    : base.successfulReviewDays;
  const contextFingerprints = contextFingerprint
    ? [...new Set([...base.contextFingerprints, contextFingerprint])].slice(
        -CONTEXT_FINGERPRINT_LIMIT,
      )
    : base.contextFingerprints;
  const event: ReviewEvent = {
    interactionId,
    reviewedAt: now.toISOString(),
    correct,
    assisted,
    mode,
    scheduled: schedule.scheduled,
    schedulerRating: schedule.rating,
    contextFingerprint,
  };
  const reviewEvents = [...base.reviewEvents, event].slice(-REVIEW_EVENT_LIMIT);
  // Recognition introduces the item at Crescent. Only correct typed practice
  // advances the monotonic learner-facing mastery count.
  const phase = phaseFor(unassistedCorrect);

  const mastery: ConceptMastery = {
    score: update.conceptScore,
    phase,
    attempts,
    correct: correctCount,
    intervalDays: schedule.intervalDays,
    unassistedCorrect,
    lapses: base.lapses + (correct ? 0 : 1),
    fsrsCard: schedule.fsrsCard,
    firstAnsweredAt: existing?.firstAnsweredAt ?? now.toISOString(),
    successfulReviewDays,
    contextFingerprints,
    reviewEvents,
    legacyPhase: undefined,
    due: schedule.due,
    updatedAt: now.toISOString(),
    display: display ?? existing?.display,
  };

  const outcome: AnswerOutcome = {
    interactionId,
    conceptId,
    correct,
    at: now.toISOString(),
  };

  const nextProfile: LearnerProfile = {
    ...profile,
    globalAbility: update.globalAbility,
    mastery: pruneMastery({ ...profile.mastery, [conceptId]: mastery }),
    recentOutcomes: [...profile.recentOutcomes, outcome].slice(-RECENT_OUTCOMES_LIMIT),
  };

  return {
    profile: nextProfile,
    mastery,
    previousPhase,
    phase: mastery.phase,
    predictedCorrect: update.predictedCorrect,
    applied: true,
  };
}
