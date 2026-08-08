/**
 * Applying an answer to the learner profile.
 *
 * This is the single place where scoring, phase and scheduling meet. The
 * content script is the only caller — see docs/ARCHITECTURE.md on why answer
 * outcomes have exactly one writer.
 */

import {
  RECENT_OUTCOMES_LIMIT,
  emptyMastery,
  pruneMastery,
  type AnswerOutcome,
  type ConceptMastery,
  type LearnerProfile,
  type MoonPhase,
} from './profile';
import { applyAnswer, phaseFor } from './scoring';
import { isDue, nextDueState } from './scheduling';
import type { ConceptId } from './trap';

export interface RecordAnswerInput {
  readonly profile: LearnerProfile;
  readonly interactionId: string;
  readonly conceptId: ConceptId;
  readonly difficulty: number;
  readonly correct: boolean;
  readonly now: Date;
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
  const { profile, interactionId, conceptId, difficulty, correct, now } = input;

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
  const wasDue = isDue(existing, now);

  const update = applyAnswer({
    globalAbility: profile.globalAbility,
    conceptScore: base.score,
    difficulty,
    correct,
  });

  const attempts = base.attempts + 1;
  const correctCount = base.correct + (correct ? 1 : 0);

  const mastery: ConceptMastery = {
    score: update.conceptScore,
    phase: phaseFor(update.conceptScore, attempts, correctCount),
    attempts,
    correct: correctCount,
    due: nextDueState(existing, correct, wasDue, now),
    updatedAt: now.toISOString(),
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
