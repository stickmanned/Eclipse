/**
 * Unicode handling for French target text and English source matching.
 *
 * Two rules drive everything here:
 *
 * 1. Stored and rendered French text is always NFC. `bibliotheque` with an
 *    accent keeps its accent; an elided article keeps its apostrophe. Nothing
 *    is ever transliterated.
 * 2. Comparison is permissive in exactly one respect - a straight apostrophe
 *    and a curly apostrophe are treated as the same character. Accents are
 *    never folded away, because `a`/`a-grave` and `ou`/`ou-grave` are
 *    different words.
 *
 * Every non-ASCII code point in this module is written as an escape so that a
 * stray editor normalisation cannot silently change matching behaviour.
 */

/** Apostrophe-like code points that should compare equal to U+0027. */
const APOSTROPHE_VARIANTS = /[‘’‛ʼʹ′`´]/g;

/** Whitespace, including NBSP and the narrow NBSP French uses before `?`/`!`/`:`. */
const WHITESPACE = /[\s   ]+/g;

/** Space-like code points accepted between the words of a multiword match. */
const SPACE_CLASS = '[\\s\\u00A0\\u202F\\u2009]';

/** Apostrophe code points accepted while matching. */
const APOSTROPHE_CLASS = "['\\u2018\\u2019\\u02BC]";

/** Canonical NFC form. Every French string entering storage or the DOM goes through this. */
export function toNfc(value: string): string {
  return value.normalize('NFC');
}

/** Replace curly/typographic apostrophes with the straight ASCII one. Matching only. */
export function normalizeApostrophes(value: string): string {
  return value.replace(APOSTROPHE_VARIANTS, "'");
}

/** Collapse every run of whitespace to a single space and trim the ends. */
export function collapseWhitespace(value: string): string {
  return value.replace(WHITESPACE, ' ').trim();
}

/**
 * Comparison form: NFC, straight apostrophes, collapsed whitespace, lowercased.
 * Accents and diacritics are deliberately preserved.
 */
export function foldForComparison(value: string): string {
  return collapseWhitespace(normalizeApostrophes(toNfc(value))).toLowerCase();
}

/** True when two strings are equal under {@link foldForComparison}. */
export function looseEquals(a: string, b: string): boolean {
  return foldForComparison(a) === foldForComparison(b);
}

/**
 * Normalised visible text used to prove a page was restored. Deactivation
 * compares this against the pre-activation snapshot; it intentionally ignores
 * whitespace shape, because splitting and re-joining text nodes legitimately
 * changes where the browser reports line breaks.
 */
export function normalizedVisibleText(root: { textContent: string | null }): string {
  return collapseWhitespace(toNfc(root.textContent ?? ''));
}

/**
 * Characters permitted in a rendered French surface form: letters, combining
 * marks, spaces, apostrophes and hyphens. No digits, no other punctuation, no
 * markup. Must start and end with a letter.
 */
const FRENCH_SURFACE = new RegExp(
  '^[\\p{L}\\p{M}](?:[\\p{L}\\p{M}\\u0020\\u00A0\\u202F\\u2009\\u0027\\u2018\\u2019\\u002D]*[\\p{L}\\p{M}])?$',
  'u',
);

/** Longest surface Eclipse will render inline. Keeps a trap from eating a paragraph. */
export const MAX_SURFACE_LENGTH = 64;

export function isValidFrenchSurface(value: string): boolean {
  if (value.length === 0 || value.length > MAX_SURFACE_LENGTH) return false;
  // Must already be NFC - validation never silently rewrites stored text.
  if (toNfc(value) !== value) return false;
  // No leading, trailing or doubled whitespace.
  if (collapseWhitespace(value) !== value) return false;
  return FRENCH_SURFACE.test(value);
}

export interface TextMatch {
  start: number;
  end: number;
  text: string;
}

function isWordChar(ch: string | undefined): boolean {
  if (ch === undefined) return false;
  return /[\p{L}\p{M}\p{N}]/u.test(ch);
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Every word-boundary-aware occurrence of `needle` in `haystack`, returned as
 * offsets into the ORIGINAL (NFC) string.
 *
 * Matching is case-insensitive and apostrophe-insensitive. A single space in
 * the needle matches any run of whitespace, so a phrase that wraps across a
 * newline in the HTML source still matches. Folding can change string length,
 * so the scan never folds the haystack up front - offsets stay trustworthy.
 *
 * The haystack is used exactly as given, including its normalization form.
 * Callers map these offsets straight back into live DOM text nodes, so
 * rewriting the haystack here would silently shift every offset. English source
 * spans are ASCII, which is why this is safe.
 */
export function findWordMatches(haystack: string, needle: string): TextMatch[] {
  const foldedNeedle = foldForComparison(needle);
  if (foldedNeedle.length === 0) return [];

  const pattern = foldedNeedle
    .split(' ')
    .map((token) => escapeRegExp(token).replace(/'/g, APOSTROPHE_CLASS))
    .join(`${SPACE_CLASS}+`);

  const regex = new RegExp(pattern, 'giu');
  const source = haystack;
  const matches: TextMatch[] = [];

  for (const found of source.matchAll(regex)) {
    const start = found.index;
    if (typeof start !== 'number') continue;
    const matched = found[0];
    const end = start + matched.length;
    if (isWordChar(source[start - 1])) continue;
    if (isWordChar(source[end])) continue;
    matches.push({ start, end, text: matched });
  }

  return matches;
}

/** Number of word-boundary occurrences of `needle` in `haystack`. */
export function countWordMatches(haystack: string, needle: string): number {
  return findWordMatches(haystack, needle).length;
}

/** True when `needle` occurs at least once, ignoring case and apostrophe shape. */
export function containsFolded(haystack: string, needle: string): boolean {
  return foldForComparison(haystack).includes(foldForComparison(needle));
}
