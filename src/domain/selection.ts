/**
 * Choosing which candidate traps actually get rendered.
 *
 * Scoring follows the plan:
 *
 * ```
 * selectionScore = 0.40 * uncertainty
 *                + 0.30 * duePriority
 *                + 0.20 * contextQuality
 *                + 0.10 * salience
 * ```
 *
 * On top of the score, due concepts form a hard priority tier. The plan asks
 * that Eclipse prefer traps the learner has a 65–80% chance of reading
 * correctly, *and* that a due concept override that preference — a tier is the
 * only way to guarantee the second without tuning weights until it happens to
 * work. That is what makes the Demo A → Demo B transfer deterministic.
 */

import { duePriority, isDue } from './scheduling';
import type { ConceptMastery } from './profile';
import { predictCorrect } from './scoring';

export const WEIGHT_UNCERTAINTY = 0.4;
export const WEIGHT_DUE_PRIORITY = 0.3;
export const WEIGHT_CONTEXT_QUALITY = 0.2;
export const WEIGHT_SALIENCE = 0.1;

/** The band the plan asks Eclipse to aim for when nothing is due. */
export const TARGET_BAND_MIN = 0.65;
export const TARGET_BAND_MAX = 0.8;
export const TARGET_BAND_BONUS = 0.15;

export interface SelectionCandidate {
  /** Stable identity, used for the final deterministic tie-break. */
  readonly trapId: string;
  readonly conceptId: string;
  /** Index of the containing block in document order. */
  readonly domOrder: number;
  /** Identity of the block, so at most one trap lands per paragraph. */
  readonly blockKey: string;
  /** Identity of the sentence, so two traps never share a sentence. */
  readonly sentenceKey: string;
  /** Character range within the flattened block text, for overlap rejection. */
  readonly rangeStart: number;
  readonly rangeEnd: number;
  readonly difficulty: number;
  /** 0..1, from the catalog or validated provider output. */
  readonly contextQuality: number;
  /** 0..1, body text over captions and list fragments. */
  readonly salience: number;
}

export interface ScoredCandidate extends SelectionCandidate {
  readonly predictedCorrect: number;
  readonly uncertainty: number;
  readonly duePriority: number;
  readonly inTargetBand: boolean;
  readonly due: boolean;
  readonly selectionScore: number;
}

export interface SelectionContext {
  readonly globalAbility: number;
  readonly mastery: Readonly<Record<string, ConceptMastery>>;
  readonly now: Date;
}

/** Peaks at 1 when the learner is a coin-flip, falls to 0 at certainty. */
export function uncertaintyOf(predicted: number): number {
  return 1 - 2 * Math.abs(predicted - 0.5);
}

export function scoreCandidate(
  candidate: SelectionCandidate,
  context: SelectionContext,
): ScoredCandidate {
  const mastery = context.mastery[candidate.conceptId];
  const conceptScore = mastery?.score ?? 0;
  const predicted = predictCorrect(context.globalAbility, conceptScore, candidate.difficulty);
  const uncertainty = uncertaintyOf(predicted);
  const due = duePriority(mastery, context.now);
  const inTargetBand = predicted >= TARGET_BAND_MIN && predicted <= TARGET_BAND_MAX;

  const selectionScore =
    WEIGHT_UNCERTAINTY * uncertainty +
    WEIGHT_DUE_PRIORITY * due +
    WEIGHT_CONTEXT_QUALITY * clamp01(candidate.contextQuality) +
    WEIGHT_SALIENCE * clamp01(candidate.salience) +
    (inTargetBand ? TARGET_BAND_BONUS : 0);

  return {
    ...candidate,
    predictedCorrect: predicted,
    uncertainty,
    duePriority: due,
    inTargetBand,
    due: isDue(mastery, context.now),
    selectionScore,
  };
}

function clamp01(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

/**
 * Ranking order: due concepts first, then selection score, then document
 * order, then trap id. The last two keys make the result stable across runs,
 * which is what lets the E2E suite assert on specific traps.
 */
export function compareCandidates(a: ScoredCandidate, b: ScoredCandidate): number {
  if (a.due !== b.due) return a.due ? -1 : 1;
  if (a.selectionScore !== b.selectionScore) return b.selectionScore - a.selectionScore;
  if (a.domOrder !== b.domOrder) return a.domOrder - b.domOrder;
  return a.trapId < b.trapId ? -1 : a.trapId > b.trapId ? 1 : 0;
}

export interface SelectionLimits {
  /** Hard ceiling on rendered traps. */
  readonly maxTraps: number;
  /** Floor below which activation reports NO_ELIGIBLE_TRAPS. */
  readonly minTraps: number;
  /** Share of eligible words that may be replaced. */
  readonly maxDensity: number;
  /** Total eligible words in the article, used with `maxDensity`. */
  readonly eligibleWordCount: number;
}

export const DEFAULT_SELECTION_LIMITS = {
  maxTraps: 4,
  minTraps: 2,
  maxDensity: 0.03,
} as const;

/**
 * Apply the placement rules to a ranked list.
 *
 * - at most `maxTraps`
 * - at most one per block
 * - never two in one sentence
 * - never two overlapping source ranges
 * - never two traps for the same concept
 * - never more than `maxDensity` of eligible words
 */
export function selectCandidates(
  candidates: readonly SelectionCandidate[],
  context: SelectionContext,
  limits: SelectionLimits,
): ScoredCandidate[] {
  const ranked = candidates.map((candidate) => scoreCandidate(candidate, context));
  ranked.sort(compareCandidates);

  const densityCap = Math.floor(limits.eligibleWordCount * limits.maxDensity);
  const cap = Math.max(0, Math.min(limits.maxTraps, densityCap));

  const chosen: ScoredCandidate[] = [];
  const usedBlocks = new Set<string>();
  const usedSentences = new Set<string>();
  const usedConcepts = new Set<string>();

  for (const candidate of ranked) {
    if (chosen.length >= cap) break;
    if (usedBlocks.has(candidate.blockKey)) continue;
    if (usedSentences.has(candidate.sentenceKey)) continue;
    if (usedConcepts.has(candidate.conceptId)) continue;
    if (overlapsChosen(candidate, chosen)) continue;

    chosen.push(candidate);
    usedBlocks.add(candidate.blockKey);
    usedSentences.add(candidate.sentenceKey);
    usedConcepts.add(candidate.conceptId);
  }

  return chosen;
}

function overlapsChosen(
  candidate: SelectionCandidate,
  chosen: readonly SelectionCandidate[],
): boolean {
  return chosen.some(
    (other) =>
      other.blockKey === candidate.blockKey &&
      candidate.rangeStart < other.rangeEnd &&
      other.rangeStart < candidate.rangeEnd,
  );
}
