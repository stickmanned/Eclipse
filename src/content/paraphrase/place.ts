/**
 * Choosing which paraphrases actually reach the page.
 *
 * Pure with respect to the DOM: reads the collected blocks and returns a
 * ranked, rule-checked plan. Nothing here mutates anything, which is what makes
 * the whole selection path testable without a browser.
 *
 * ```
 * score = 0.40 · proximity     (how close this item sits to the target complexity)
 *       + 0.30 · owed          (1.0 for a wording the learner previously missed)
 *       + 0.20 · confidence
 *       + 0.10 · salience      (body prose over list fragments)
 * ```
 *
 * Two rules on top of the score, both borrowed from Translate Mode because the
 * reasoning transfers exactly:
 *
 * - **Owed wordings form a hard tier above the score.** The brief's fourth
 *   round requires that a wording the learner failed comes back. A weighted
 *   preference makes that likely; a tier makes it certain, and only the second
 *   is a promise worth printing in the UI.
 * - **Owed wordings also bypass the complexity window.** A wording is owed
 *   precisely because it was too hard, so the miss will usually have pushed the
 *   band below it. Filtering on the window first would quietly guarantee that
 *   the items most worth repeating are the ones that can never reappear.
 */

import { createTrapId } from '../../domain/ids';
import { collapseWhitespace, findWordMatches } from '../../domain/normalize';
import {
  validateParaphraseItem,
  type GeneratedParaphraseCandidate,
  type ParaphraseItem,
} from '../../domain/paraphrase';
import { resolveRange, type EligibleBlock, type SentenceRef } from '../article';

export const WEIGHT_PROXIMITY = 0.4;
export const WEIGHT_OWED = 0.3;
export const WEIGHT_CONFIDENCE = 0.2;
export const WEIGHT_SALIENCE = 0.1;

export const PARAPHRASE_LIMITS = {
  /** Hard ceiling on rendered paraphrases. */
  maxItems: 60,
  /** Per-paragraph ceiling; distinct sentences and non-overlap still apply. */
  maxItemsPerBlock: 2,
  /** Floor below which activation reports NO_ELIGIBLE_TRAPS. */
  minItems: 1,
  /**
   * Share of eligible words that may be replaced. Lower than Translate Mode's
   * 8% because a paraphrase legitimately covers a clause rather than a word:
   * the same percentage of *items* rewrites noticeably more of the page.
   */
  maxDensity: 0.06,
} as const;

/** The DOM location corresponding to one submitted sentence. */
export interface ParaphraseSentenceTarget {
  readonly sentenceId: string;
  readonly block: EligibleBlock;
  readonly sentence: SentenceRef;
}

export interface ParaphrasePlacementCandidate {
  readonly item: ParaphraseItem;
  readonly block: EligibleBlock;
  readonly sentence: SentenceRef;
  /** Offsets within the block's flattened text. */
  readonly blockStart: number;
  readonly blockEnd: number;
}

export interface ScoredParaphrase extends ParaphrasePlacementCandidate {
  readonly owed: boolean;
  readonly proximity: number;
  readonly score: number;
}

export interface ParaphraseSelectionContext {
  readonly target: number;
  readonly window: readonly [number, number];
  /** Concept ids the learner owes a reappearance. */
  readonly dueConceptIds: readonly string[];
}

/**
 * Bind validated generated items back to submitted, replaceable DOM ranges.
 *
 * The envelope sentence id is authoritative; item ids are opaque. An item whose
 * original span cannot be located exactly once inside the sentence it claims,
 * or whose range would cross an inline element, is dropped rather than spliced.
 */
export function collectParaphraseCandidates(
  candidates: readonly GeneratedParaphraseCandidate[],
  targets: readonly ParaphraseSentenceTarget[],
): ParaphrasePlacementCandidate[] {
  const bySentenceId = new Map(targets.map((target) => [target.sentenceId, target]));
  const placements: ParaphrasePlacementCandidate[] = [];

  for (const candidate of candidates) {
    const target = bySentenceId.get(candidate.sentenceId);
    if (!target) continue;

    const validated = validateParaphraseItem(candidate.item);
    if (!validated.ok) continue;
    if (collapseWhitespace(validated.data.sentence) !== collapseWhitespace(target.sentence.text)) {
      continue;
    }

    const matches = findWordMatches(target.sentence.text, validated.data.exactSourceText);
    if (matches.length !== 1) continue;
    const match = matches[0];
    if (!match) continue;

    const blockStart = target.sentence.start + match.start;
    const blockEnd = target.sentence.start + match.end;
    if (!resolveRange(target.block, blockStart, blockEnd)) continue;

    // Re-key the id to where it landed, so two runs over the same article
    // produce the same ids and the tie-break stays stable.
    placements.push({
      item: {
        ...validated.data,
        id: createTrapId(validated.data.conceptId, target.block.index, blockStart),
      },
      block: target.block,
      sentence: target.sentence,
      blockStart,
      blockEnd,
    });
  }

  return placements;
}

/** 1 at the target, falling to 0 at the edge of the window and beyond. */
export function proximityTo(complexity: number, context: ParaphraseSelectionContext): number {
  const halfWidth = Math.max(
    0.01,
    Math.max(context.window[1] - context.target, context.target - context.window[0]),
  );
  return Math.max(0, 1 - Math.abs(complexity - context.target) / halfWidth);
}

export function scoreParaphrase(
  candidate: ParaphrasePlacementCandidate,
  context: ParaphraseSelectionContext,
  owedConcepts: ReadonlySet<string>,
): ScoredParaphrase {
  const owed = owedConcepts.has(candidate.item.conceptId);
  const proximity = proximityTo(candidate.item.complexity, context);

  return {
    ...candidate,
    owed,
    proximity,
    score:
      WEIGHT_PROXIMITY * proximity +
      WEIGHT_OWED * (owed ? 1 : 0) +
      WEIGHT_CONFIDENCE * clamp01(candidate.item.confidence) +
      WEIGHT_SALIENCE * clamp01(candidate.block.salience),
  };
}

function clamp01(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

/**
 * Ranking order: owed first, then score, then document order, then item id.
 * The last two keys make the result stable across runs.
 */
export function compareParaphrases(a: ScoredParaphrase, b: ScoredParaphrase): number {
  if (a.owed !== b.owed) return a.owed ? -1 : 1;
  if (a.score !== b.score) return b.score - a.score;
  if (a.block.index !== b.block.index) return a.block.index - b.block.index;
  return a.item.id < b.item.id ? -1 : a.item.id > b.item.id ? 1 : 0;
}

export interface ParaphrasePlacement {
  readonly item: ParaphraseItem;
  readonly block: EligibleBlock;
  readonly blockStart: number;
  readonly blockEnd: number;
  readonly scored: ScoredParaphrase;
}

export interface PlanParaphraseOptions {
  readonly eligibleWordCount: number;
  readonly maxItems?: number;
}

/**
 * Rank the candidates and apply the placement rules.
 *
 * up to `maxItems` per page · up to two per block · never two in one sentence ·
 * never overlapping ranges · never the same wording twice · never more than
 * `maxDensity` of eligible words.
 */
export function planParaphrases(
  candidates: readonly ParaphrasePlacementCandidate[],
  context: ParaphraseSelectionContext,
  options: PlanParaphraseOptions,
): ParaphrasePlacement[] {
  if (candidates.length === 0) return [];

  const owedConcepts = new Set(context.dueConceptIds);
  const [windowMin, windowMax] = context.window;

  const eligible = candidates.filter((candidate) => {
    if (owedConcepts.has(candidate.item.conceptId)) return true;
    return candidate.item.complexity >= windowMin && candidate.item.complexity <= windowMax;
  });

  const ranked = eligible.map((candidate) => scoreParaphrase(candidate, context, owedConcepts));
  ranked.sort(compareParaphrases);

  const densityCap = Math.floor(options.eligibleWordCount * PARAPHRASE_LIMITS.maxDensity);
  const cap = Math.max(0, Math.min(options.maxItems ?? PARAPHRASE_LIMITS.maxItems, densityCap));

  const chosen: ScoredParaphrase[] = [];
  const blockCounts = new Map<string, number>();
  const usedSentences = new Set<string>();
  const usedConcepts = new Set<string>();

  for (const candidate of ranked) {
    if (chosen.length >= cap) break;
    if ((blockCounts.get(candidate.block.key) ?? 0) >= PARAPHRASE_LIMITS.maxItemsPerBlock) continue;
    if (usedSentences.has(candidate.sentence.key)) continue;
    if (usedConcepts.has(candidate.item.conceptId)) continue;
    if (overlapsChosen(candidate, chosen)) continue;

    chosen.push(candidate);
    blockCounts.set(candidate.block.key, (blockCounts.get(candidate.block.key) ?? 0) + 1);
    usedSentences.add(candidate.sentence.key);
    usedConcepts.add(candidate.item.conceptId);
  }

  const placements = chosen.map((scored) => ({
    item: scored.item,
    block: scored.block,
    blockStart: scored.blockStart,
    blockEnd: scored.blockEnd,
    scored,
  }));

  // Insert back-to-front within a block so earlier offsets stay valid once a
  // replacement changes the node's length.
  placements.sort((a, b) => {
    if (a.block.index !== b.block.index) return a.block.index - b.block.index;
    return b.blockStart - a.blockStart;
  });

  return placements;
}

function overlapsChosen(
  candidate: ParaphrasePlacementCandidate,
  chosen: readonly ParaphrasePlacementCandidate[],
): boolean {
  return chosen.some(
    (other) =>
      other.block.key === candidate.block.key &&
      candidate.blockStart < other.blockEnd &&
      other.blockStart < candidate.blockEnd,
  );
}
