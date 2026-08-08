/**
 * Choosing where the traps go.
 *
 * Pure with respect to the DOM: it reads the collected blocks and returns a
 * ranked, rule-checked placement plan. Nothing here mutates the page — that is
 * `TokenRegistry`'s job — which is what makes the whole selection path
 * testable without a browser.
 */

import { FRENCH_CATALOG } from '../catalog/french-catalog';
import type { CatalogEntry } from '../catalog/types';
import { buildTrapFromMatch, matchEntryInSentence } from '../catalog/build-trap';
import { createTrapId } from '../domain/ids';
import { collapseWhitespace, findWordMatches } from '../domain/normalize';
import {
  DEFAULT_SELECTION_LIMITS,
  selectCandidates,
  type SelectionCandidate,
  type SelectionContext,
  type ScoredCandidate,
} from '../domain/selection';
import { validateTrap, type ContextTrap, type GeneratedTrapCandidate } from '../domain/trap';
import {
  countEligibleWords,
  resolveRange,
  splitSentences,
  type EligibleBlock,
  type SentenceRef,
} from './article';

export interface PlacementCandidate {
  readonly selection: SelectionCandidate;
  readonly block: EligibleBlock;
  readonly sentence: SentenceRef;
  readonly trap: ContextTrap;
  /** Offsets within the block's flattened text. */
  readonly blockStart: number;
  readonly blockEnd: number;
}

export interface Placement {
  readonly trap: ContextTrap;
  readonly block: EligibleBlock;
  readonly blockStart: number;
  readonly blockEnd: number;
  readonly scored: ScoredCandidate;
}

/**
 * Every catalog entry that legitimately matches somewhere in the article.
 *
 * A candidate survives only if the source span sits entirely inside one text
 * node Eclipse is allowed to modify. Spans that would cross an inline element
 * (a link, an emphasis tag) are dropped rather than spliced.
 */
export function collectCandidates(
  blocks: readonly EligibleBlock[],
  catalog: readonly CatalogEntry[] = FRENCH_CATALOG,
): PlacementCandidate[] {
  const candidates: PlacementCandidate[] = [];

  for (const block of blocks) {
    const sentences = splitSentences(block.text, block.key);

    for (const sentence of sentences) {
      for (const entry of catalog) {
        const entryMatch = matchEntryInSentence(entry, sentence.text);
        if (!entryMatch) continue;

        const blockStart = sentence.start + entryMatch.match.start;
        const blockEnd = sentence.start + entryMatch.match.end;
        if (!resolveRange(block, blockStart, blockEnd)) continue;

        const trapId = createTrapId(entry.conceptId, block.index, blockStart);
        const built = buildTrapFromMatch(entryMatch, sentence.text, trapId);
        if (!built.ok) continue;

        candidates.push({
          block,
          sentence,
          trap: built.data,
          blockStart,
          blockEnd,
          selection: {
            trapId,
            conceptId: entry.conceptId,
            domOrder: block.index,
            blockKey: block.key,
            sentenceKey: sentence.key,
            rangeStart: blockStart,
            rangeEnd: blockEnd,
            difficulty: entry.difficulty,
            contextQuality: entry.contextQuality,
            salience: block.salience,
          },
        });
      }
    }
  }

  return candidates;
}

export interface PlanOptions {
  readonly maxTraps?: number;
  readonly generatedCandidates?: readonly GeneratedTrapCandidate[];
  readonly generatedTargets?: readonly GeneratedSentenceTarget[];
}

/** The DOM location corresponding to one submitted provider sentence. */
export interface GeneratedSentenceTarget {
  readonly sentenceId: string;
  readonly block: EligibleBlock;
  readonly sentence: SentenceRef;
}

/**
 * Bind validated provider output back to submitted, replaceable DOM ranges.
 * The envelope sentence id is authoritative; trap ids are opaque.
 */
export function collectGeneratedCandidates(
  candidates: readonly GeneratedTrapCandidate[],
  targets: readonly GeneratedSentenceTarget[],
): PlacementCandidate[] {
  const bySentenceId = new Map(targets.map((target) => [target.sentenceId, target]));
  const placements: PlacementCandidate[] = [];

  for (const candidate of candidates) {
    const target = bySentenceId.get(candidate.sentenceId);
    if (!target) continue;

    const validated = validateTrap(candidate.trap, { untrusted: true });
    if (!validated.ok || validated.data.provider !== 'gemini') continue;
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

    placements.push({
      block: target.block,
      sentence: target.sentence,
      trap: validated.data,
      blockStart,
      blockEnd,
      selection: {
        trapId: validated.data.id,
        conceptId: validated.data.conceptId,
        domOrder: target.block.index,
        blockKey: target.block.key,
        sentenceKey: target.sentence.key,
        rangeStart: blockStart,
        rangeEnd: blockEnd,
        difficulty: validated.data.difficulty,
        contextQuality: validated.data.confidence,
        salience: target.block.salience,
      },
    });
  }

  return placements;
}

/**
 * Rank the candidates, apply the placement rules, and build a validated trap
 * for each survivor. A candidate whose trap fails validation is dropped and the
 * next-best one is not promoted in its place — the ranking stays honest, and a
 * broken catalog entry shows up as a missing trap rather than a reshuffle.
 */
export function planPlacements(
  blocks: readonly EligibleBlock[],
  context: SelectionContext,
  options: PlanOptions = {},
): Placement[] {
  const candidates = [
    ...collectCandidates(blocks),
    ...collectGeneratedCandidates(
      options.generatedCandidates ?? [],
      options.generatedTargets ?? [],
    ),
  ];
  if (candidates.length === 0) return [];

  const byId = new Map(candidates.map((candidate) => [candidate.selection.trapId, candidate]));

  const chosen = selectCandidates(
    candidates.map((candidate) => candidate.selection),
    context,
    {
      maxTraps: options.maxTraps ?? DEFAULT_SELECTION_LIMITS.maxTraps,
      maxTrapsPerBlock: DEFAULT_SELECTION_LIMITS.maxTrapsPerBlock,
      minTraps: DEFAULT_SELECTION_LIMITS.minTraps,
      maxDensity: DEFAULT_SELECTION_LIMITS.maxDensity,
      eligibleWordCount: countEligibleWords(blocks),
    },
  );

  const placements: Placement[] = [];
  for (const scored of chosen) {
    const candidate = byId.get(scored.trapId);
    if (!candidate) continue;

    placements.push({
      trap: candidate.trap,
      block: candidate.block,
      blockStart: candidate.blockStart,
      blockEnd: candidate.blockEnd,
      scored,
    });
  }

  // Insert back-to-front within a block so earlier offsets stay valid. Blocks
  // hold at most one trap today, but the ordering costs nothing and removes a
  // whole class of future bug.
  placements.sort((a, b) => {
    if (a.block.index !== b.block.index) return a.block.index - b.block.index;
    return b.blockStart - a.blockStart;
  });

  return placements;
}
