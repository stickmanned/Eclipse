/**
 * Turning a catalog entry plus a real sentence into a validated `ContextTrap`.
 *
 * A match is only honest when the sentence carries the evidence the Truth Card
 * is going to quote. That is what `requiredAny` / `requiredAll` / `forbidden`
 * and the clue candidates enforce here: no clue in the sentence means no trap,
 * rather than a trap with a hand-waving explanation.
 */

import type { CatalogEntry } from './types';
import {
  collapseWhitespace,
  containsFolded,
  findWordMatches,
  type TextMatch,
} from '../domain/normalize';
import { validateTrap, type ContextTrap } from '../domain/trap';
import type { Result } from '../domain/errors';

/** Catalog traps are curated, so their confidence is definitional. */
export const CATALOG_CONFIDENCE = 1;

export interface EntryMatch {
  readonly entry: CatalogEntry;
  /** Offsets into the sentence. */
  readonly match: TextMatch;
  /** The clue, quoted exactly as the sentence wrote it. */
  readonly clueSpan: string;
}

function anyPresent(sentence: string, terms: readonly string[] | undefined): boolean {
  if (!terms || terms.length === 0) return true;
  return terms.some((term) => containsFolded(sentence, term));
}

function allPresent(sentence: string, terms: readonly string[] | undefined): boolean {
  if (!terms || terms.length === 0) return true;
  return terms.every((term) => containsFolded(sentence, term));
}

function nonePresent(sentence: string, terms: readonly string[] | undefined): boolean {
  if (!terms || terms.length === 0) return true;
  return terms.every((term) => !containsFolded(sentence, term));
}

/**
 * Does this entry apply to this sentence?
 *
 * Requires the source span to occur exactly once, the context gates to pass,
 * and at least one clue candidate to be quotable without overlapping the span
 * that is about to be replaced.
 */
export function matchEntryInSentence(entry: CatalogEntry, sentence: string): EntryMatch | null {
  if (!anyPresent(sentence, entry.requiredAny)) return null;
  if (!allPresent(sentence, entry.requiredAll)) return null;
  if (!nonePresent(sentence, entry.forbidden)) return null;

  const matches = findWordMatches(sentence, entry.exactSourceText);
  if (matches.length !== 1) return null;
  const match = matches[0];
  if (!match) return null;

  for (const candidate of entry.clueCandidates) {
    const found = findWordMatches(sentence, candidate)[0];
    if (!found) continue;
    // The clue has to be evidence *outside* the hidden span, or it gives the
    // answer away and teaches nothing.
    if (found.start < match.end && match.start < found.end) continue;
    return { entry, match, clueSpan: found.text };
  }

  return null;
}

/**
 * Build the trap for a match. The result is run through `validateTrap`, so a
 * malformed catalog edit fails at the point of use and in CI rather than
 * reaching the DOM.
 */
export function buildTrapFromMatch(
  match: EntryMatch,
  sentence: string,
  trapId: string,
): Result<ContextTrap> {
  const { entry } = match;

  // Page text arrives with the source file's line breaks and indentation in it.
  // The DOM replacement is driven by offsets, not by these strings, so
  // collapsing them here only affects what the Truth Card displays — and a clue
  // quoted back with six spaces in the middle of it reads as a bug.
  return validateTrap(
    {
      id: trapId,
      conceptId: entry.conceptId,
      sourceLocale: 'en',
      targetLocale: 'fr-FR',
      type: entry.type,
      sentence: collapseWhitespace(sentence),
      exactSourceText: collapseWhitespace(match.match.text),
      targetSurface: entry.targetSurface,
      choices: [entry.choices[0], entry.choices[1], entry.choices[2]],
      acceptedChoice: entry.acceptedChoice,
      clueSpan: collapseWhitespace(match.clueSpan),
      explanation: entry.explanation,
      distractorExplanation: entry.distractorExplanation,
      difficulty: entry.difficulty,
      confidence: CATALOG_CONFIDENCE,
      provider: 'catalog',
    },
    { untrusted: false },
  );
}
