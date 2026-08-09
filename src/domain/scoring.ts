/**
 * Calibration and mastery arithmetic.
 *
 * The model is deliberately small: one global ability term, one per-concept
 * score, and one difficulty term per trap. Everything is a pure function of its
 * inputs plus an explicit `now`, so every threshold in the plan is directly
 * testable.
 */

import type { ConceptMastery, LearnerProfile, MoonPhase } from './profile';

export const CONCEPT_SCORE_MIN = -2;
export const CONCEPT_SCORE_MAX = 2;
export const GLOBAL_ABILITY_MIN = -1;
export const GLOBAL_ABILITY_MAX = 1;

/** Learning rates from the plan. */
export const CONCEPT_LEARNING_RATE = 0.6;
export const GLOBAL_LEARNING_RATE = 0.1;

export function clamp(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min;
  return Math.min(max, Math.max(min, value));
}

export function sigmoid(value: number): number {
  return 1 / (1 + Math.exp(-value));
}

/** Map a 0..1 difficulty onto the logit scale the model works in. */
export function difficultyLogit(difficulty: number): number {
  return (clamp(difficulty, 0, 1) - 0.5) * 2;
}

/**
 * Probability the learner reads this trap correctly.
 *
 * `sigmoid(globalAbility + conceptScore - difficultyLogit)`
 */
export function predictCorrect(
  globalAbility: number,
  conceptScore: number,
  difficulty: number,
): number {
  return sigmoid(globalAbility + conceptScore - difficultyLogit(difficulty));
}

/** Number of questions in the A1–B2 reading diagnostic. */
export const CALIBRATION_QUESTION_COUNT = 8;

/**
 * Spread a raw diagnostic score across the adaptive model's -1..1 range.
 * Learner-facing DELF assignment uses the explicit bands in `calibration.ts`.
 */
export function calibrationAbility(correctAnswers: number): number {
  const bounded = clamp(correctAnswers, 0, CALIBRATION_QUESTION_COUNT);
  const midpoint = CALIBRATION_QUESTION_COUNT / 2;
  return clamp((bounded - midpoint) / midpoint, GLOBAL_ABILITY_MIN, GLOBAL_ABILITY_MAX);
}

export interface MasteryUpdateInput {
  readonly globalAbility: number;
  readonly conceptScore: number;
  readonly difficulty: number;
  readonly correct: boolean;
}

export interface MasteryUpdateResult {
  readonly predictedCorrect: number;
  readonly delta: number;
  readonly conceptScore: number;
  readonly globalAbility: number;
}

/**
 * One answer's effect on the model.
 *
 * ```
 * delta         = outcome - predictedCorrect
 * conceptScore += 0.6 * delta   (clamped to -2..2)
 * globalAbility += 0.1 * delta  (clamped to -1..1)
 * ```
 */
export function applyAnswer(input: MasteryUpdateInput): MasteryUpdateResult {
  const predicted = predictCorrect(input.globalAbility, input.conceptScore, input.difficulty);
  const outcome = input.correct ? 1 : 0;
  const delta = outcome - predicted;

  return {
    predictedCorrect: predicted,
    delta,
    conceptScore: clamp(
      input.conceptScore + CONCEPT_LEARNING_RATE * delta,
      CONCEPT_SCORE_MIN,
      CONCEPT_SCORE_MAX,
    ),
    globalAbility: clamp(
      input.globalAbility + GLOBAL_LEARNING_RATE * delta,
      GLOBAL_ABILITY_MIN,
      GLOBAL_ABILITY_MAX,
    ),
  };
}

/** Thresholds for the moon imagery. */
export const PHASE_CRESCENT_MIN = -0.5;
export const PHASE_HALF_MIN = 0.5;
export const PHASE_FULL_MIN = 1.25;
export const PHASE_FULL_MIN_ATTEMPTS = 3;
export const PHASE_FULL_MIN_CORRECT = 2;

/**
 * Moon phase for a concept.
 *
 * - `new_moon` — below -0.5, or never attempted
 * - `crescent` — -0.5 up to but not including 0.5
 * - `half`     — 0.5 up to but not including 1.25
 * - `full`     — 1.25 or higher, with at least 3 attempts and 2 correct
 *
 * A score high enough for `full` but without the evidence behind it reports
 * `half`. One lucky guess never fills the moon.
 */
export function phaseFor(score: number, attempts: number, correct: number): MoonPhase {
  if (attempts <= 0) return 'new_moon';
  if (score < PHASE_CRESCENT_MIN) return 'new_moon';
  if (score >= PHASE_FULL_MIN) {
    return attempts >= PHASE_FULL_MIN_ATTEMPTS && correct >= PHASE_FULL_MIN_CORRECT
      ? 'full'
      : 'half';
  }
  if (score >= PHASE_HALF_MIN) return 'half';
  return 'crescent';
}

export function phaseForMastery(mastery: ConceptMastery): MoonPhase {
  return phaseFor(mastery.score, mastery.attempts, mastery.correct);
}

/** Ability used when a concept has never been seen. */
export function conceptScoreOf(profile: LearnerProfile, conceptId: string): number {
  return profile.mastery[conceptId]?.score ?? 0;
}
