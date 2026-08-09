/**
 * Core #1 — adaptive complexity, and Core #2's ranking half.
 *
 * The goal is not a fixed target but a moving one: track where the learner's
 * comfort actually sits and keep probing just above it. Two numbers do that
 * work, and separating them is the whole design.
 *
 *   center — belief about the learner's reading level. Moves slowly, on
 *            evidence, and is what "the learner's level" means everywhere else.
 *   reach  — how far above center Eclipse is currently daring to aim. Moves
 *            fast, one step per answer, and is allowed to go negative.
 *
 * A single number cannot express "I think you read at 0.62 and I am currently
 * testing 0.72". Collapsing them would mean every probe above the learner's
 * level permanently raised the estimate of that level, so two lucky answers
 * would strand someone far above where they can read — which is the exact
 * frustration the brief asks Eclipse to avoid. Keeping them apart is what makes
 * the movement an oscillation rather than a ratchet.
 *
 * `center` is updated with the same predicted-minus-observed rule Translate
 * Mode uses for mastery, so the two modes disagree about what they measure but
 * not about how evidence is weighed.
 */

import { PARAPHRASE_REGISTERS, type ParaphraseRegister } from './paraphrase';
import type { DelfLevel } from './delf';

export interface ComplexityBand {
  /** 0–1. Where Eclipse believes the learner reads comfortably. */
  readonly center: number;
  /** −REACH_LIMIT–REACH_LIMIT. How far above center the next item aims. */
  readonly reach: number;
}

/**
 * How sharply a gap between center and item complexity turns into a predicted
 * outcome. At 5, an item one tenth above the learner's center is predicted
 * correct about 38% of the time — steep enough that the band moves on real
 * evidence, shallow enough that one answer never swings it.
 */
export const PREDICTION_SLOPE = 5;

/**
 * Asymmetric on purpose. Eclipse backs off faster than it pushes, because the
 * cost of the two mistakes is not symmetric: aiming slightly low costs a
 * learner one easy item, aiming high costs them the will to keep reading.
 */
export const RISE_RATE = 0.12;
export const FALL_RATE = 0.18;

/** One answer's worth of ambition, and the ceiling on it. */
export const REACH_STEP = 0.05;
export const REACH_LIMIT = 0.15;

/** Half-width of the complexity window sent to the model. */
export const BAND_HALF_WIDTH = 0.12;

/**
 * Asking to have something paraphrased is evidence, just weaker than a wrong
 * answer: the learner may have been unsure, or merely curious. A quarter of a
 * miss is enough to bend the curve over a reading session without letting one
 * idle click undo a page of correct answers.
 */
export const MANUAL_REQUEST_WEIGHT = 0.25;

export const DEFAULT_BAND: ComplexityBand = { center: 0.55, reach: 0 };

function clamp(value: number, minimum: number, maximum: number): number {
  if (Number.isNaN(value)) return minimum;
  return Math.min(maximum, Math.max(minimum, value));
}

function clamp01(value: number): number {
  return clamp(value, 0, 1);
}

function sigmoid(value: number): number {
  return 1 / (1 + Math.exp(-value));
}

/**
 * Where a learner starts before Paraphrase Mode has seen a single answer.
 *
 * The DELF lens is the only prior Eclipse already holds, so it seeds the band
 * rather than starting everyone at the midpoint. A1/A2 seeds sit deliberately
 * low: the mode assumes a reader who can already follow French prose, and
 * someone who cannot is better served by a first page of easy items than by
 * being told the mode is not for them.
 */
export function seedBandForDelf(level: DelfLevel): ComplexityBand {
  const center = { A1: 0.3, A2: 0.42, B1: 0.55, B2: 0.7 }[level];
  return { center, reach: 0 };
}

/** Chance the learner recovers an original span of this complexity. */
export function predictRecall(band: ComplexityBand, complexity: number): number {
  return sigmoid((band.center - complexity) * PREDICTION_SLOPE);
}

/** The complexity Eclipse is aiming at for the next item. */
export function targetComplexity(band: ComplexityBand): number {
  return clamp01(band.center + band.reach);
}

/** The window handed to the model. Items outside it are dropped before ranking. */
export function bandWindow(band: ComplexityBand): readonly [number, number] {
  const target = targetComplexity(band);
  return [clamp01(target - BAND_HALF_WIDTH), clamp01(target + BAND_HALF_WIDTH)];
}

export type BandDirection = 'raised' | 'lowered' | 'held';

export interface BandUpdate {
  readonly band: ComplexityBand;
  readonly previous: ComplexityBand;
  /** Which way `center` moved. Drives the one line of copy on the reveal card. */
  readonly direction: BandDirection;
  /** What Eclipse expected before it saw the answer. Kept for the stats view. */
  readonly predicted: number;
}

export interface BandOutcome {
  readonly complexity: number;
  /** Fully correct, fully wrong, or a fractional signal from a manual request. */
  readonly outcome: number;
  /**
   * Whether this outcome should move ambition as well as belief. A manual
   * request lowers the reach but must not push it negative on its own — the
   * learner asked a question, they did not fail a test.
   */
  readonly adjustsReach: boolean;
}

/**
 * Fold one outcome into the band.
 *
 * `center` moves on the residual between what Eclipse predicted and what
 * happened, so an easy item answered correctly barely moves it while a hard one
 * answered correctly moves it a lot. `reach` moves by a fixed step, because
 * ambition is a decision rather than a measurement.
 */
export function applyOutcome(band: ComplexityBand, event: BandOutcome): BandUpdate {
  const complexity = clamp01(event.complexity);
  const outcome = clamp01(event.outcome);
  const predicted = predictRecall(band, complexity);
  const delta = outcome - predicted;
  const rate = delta >= 0 ? RISE_RATE : FALL_RATE;
  const center = clamp01(band.center + rate * delta);

  let reach = band.reach;
  if (event.adjustsReach) {
    reach =
      outcome >= 0.5
        ? clamp(band.reach + REACH_STEP, -REACH_LIMIT, REACH_LIMIT)
        : clamp(Math.min(band.reach, 0) - REACH_STEP, -REACH_LIMIT, REACH_LIMIT);
  } else if (band.reach > 0) {
    // A manual request retires ambition without punishing it.
    reach = 0;
  }

  const moved = center - band.center;
  const direction: BandDirection =
    Math.abs(moved) < 0.001 ? 'held' : moved > 0 ? 'raised' : 'lowered';

  return { band: { center, reach }, previous: band, direction, predicted };
}

/** A correct or incorrect answer to a placed item. */
export function applyAnswer(
  band: ComplexityBand,
  complexity: number,
  correct: boolean,
): BandUpdate {
  return applyOutcome(band, { complexity, outcome: correct ? 1 : 0, adjustsReach: true });
}

/** The learner selected text and asked for it to be simplified. */
export function applyManualRequest(band: ComplexityBand, complexity: number): BandUpdate {
  return applyOutcome(band, {
    complexity,
    outcome: MANUAL_REQUEST_WEIGHT,
    adjustsReach: false,
  });
}

// ---------------------------------------------------------------------------
// Core #2 — which categories to spend the page's budget on
// ---------------------------------------------------------------------------

export interface RegisterStat {
  readonly attempts: number;
  readonly correct: number;
}

export type RegisterStats = Readonly<Record<ParaphraseRegister, RegisterStat>>;

export function emptyRegisterStats(): Record<ParaphraseRegister, RegisterStat> {
  return Object.fromEntries(
    PARAPHRASE_REGISTERS.map((register) => [register, { attempts: 0, correct: 0 }]),
  ) as Record<ParaphraseRegister, RegisterStat>;
}

/**
 * Laplace-smoothed success rate.
 *
 * A register the learner has never met scores exactly 0.5, which keeps it in
 * the middle of the ranking instead of at one extreme. Without the prior, a
 * single wrong answer in a category would pin it at 0.0 and monopolise every
 * subsequent page — the profile is meant to be a lightweight tendency, not a
 * verdict from one data point.
 */
export function registerStrength(stat: RegisterStat): number {
  return (stat.correct + 1) / (stat.attempts + 2);
}

/**
 * Registers ordered weakest first — the categories worth spending this page on.
 *
 * Ties break alphabetically so the same profile always produces the same
 * priority list, which is what lets the prompt and the tests be asserted on.
 */
export function weakestRegisters(stats: RegisterStats, limit = 2): ParaphraseRegister[] {
  return [...PARAPHRASE_REGISTERS]
    .sort((left, right) => {
      const byStrength = registerStrength(stats[left]) - registerStrength(stats[right]);
      if (Math.abs(byStrength) > 1e-9) return byStrength;
      return left < right ? -1 : 1;
    })
    .slice(0, Math.max(0, limit));
}

/** One line of French copy describing where the band currently sits. */
export function describeBand(band: ComplexityBand): string {
  const target = targetComplexity(band);
  if (target < 0.35) return 'Eclipse vise des tournures courantes.';
  if (target < 0.55) return 'Eclipse vise un vocabulaire usuel un peu relevé.';
  if (target < 0.75) return 'Eclipse vise des tournures soutenues.';
  return 'Eclipse vise des tournures savantes et abstraites.';
}

/** The reveal card's one line about what just changed. */
export function describeDirection(direction: BandDirection): string {
  switch (direction) {
    case 'raised':
      return 'Eclipse monte d’un cran : les prochaines tournures seront plus exigeantes.';
    case 'lowered':
      return 'Eclipse redescend d’un cran pour consolider avant de repartir.';
    default:
      return 'Eclipse garde le même niveau pour l’instant.';
  }
}
