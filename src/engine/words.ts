/**
 * The shared word list. Same for every user. Loaded once, never changed.
 *
 * A word's ID is its position in the frequency order. ID 0 is the most common
 * word in Mandarin. So the ID is also the difficulty: a low ID is an easy word.
 * "Find easy words this person does not know" is a scan from 0 upward.
 */

import { WORDS_PACKED } from "../data/words.js";
import { lemmaCandidates } from "./lemma.js";

export type WordId = number;

export interface Word {
  id: WordId;
  simplified: string;
  pinyin: string;
  /** 1-7, or 0 if the word is not on an HSK list. */
  hsk: number;
  pos: string;
  /** English answers we will accept, best first. */
  meanings: string[];
}

// ---------------------------------------------------------------------------
// Parse once, on first use.
//
// The data arrives as one big string: one line per word, tabs between fields.
// We unpack it into parallel arrays rather than objects, because 11,000 small
// objects cost far more memory than five arrays and buy nothing.
// ---------------------------------------------------------------------------

const simplified: string[] = [];
const pinyin: string[] = [];
const hsk: number[] = [];
const pos: string[] = [];
const meanings: string[][] = [];

/**
 * English phrase -> the Mandarin words that can mean it.
 *
 * `at` is where this English meaning sits in that word's own list of meanings.
 * It matters more than frequency. 地方 is a common word that lists "room"
 * somewhere far down its meanings, but it really means "place"; 房间 is rarer
 * and means "room" first. Sorting by frequency alone hands the learner 地方
 * and teaches them the wrong thing.
 */
interface Sense {
  id: WordId;
  at: number;
}

const index = new Map<string, Sense[]>();

for (const line of WORDS_PACKED.split("\n")) {
  const f = line.split("\t");
  const id = simplified.length;

  simplified.push(f[0]!);
  pinyin.push(f[1] ?? "");
  hsk.push(Number(f[2]) || 0);
  pos.push(f[3] ?? "");

  const m = (f[4] ?? "").split("|").filter(Boolean);
  meanings.push(m);

  // Build the English index as we go, recording how central this meaning is
  // to each word. We walk in frequency order, so ties break toward the more
  // common word without any extra work.
  for (let at = 0; at < m.length; at++) {
    const bucket = index.get(m[at]!);
    if (bucket === undefined) index.set(m[at]!, [{ id, at }]);
    else bucket.push({ id, at });
  }
}

export const WORD_COUNT = simplified.length;

export function getWord(id: WordId): Word {
  if (id < 0 || id >= WORD_COUNT) throw new RangeError(`no word with id ${id} (have ${WORD_COUNT})`);
  return {
    id,
    simplified: simplified[id]!,
    pinyin: pinyin[id]!,
    hsk: hsk[id]!,
    pos: pos[id]!,
    meanings: meanings[id]!,
  };
}

export function meaningsOf(id: WordId): readonly string[] {
  return meanings[id] ?? [];
}

/**
 * How good a swap target is this word?
 *
 * Content words carry meaning a learner can guess from context. Particles and
 * conjunctions do not — swapping 的 or 了 into an English sentence teaches
 * nothing and makes the sentence unreadable. This is why the top 20 words by
 * frequency are mostly *bad* first choices, even though they are the easiest.
 *
 * Codes are the standard PKU tagset used by the source data.
 *
 *   2  noun, verb, adjective, number, classifier, time, place  — swap these
 *   1  adverb, pronoun, attributive, locative                  — sometimes
 *   0  particle, conjunction, preposition, interjection, affix — never
 */
const POS_TIER: Record<string, 0 | 1 | 2> = {
  n: 2, v: 2, a: 2, vn: 2, an: 2, nz: 2, ns: 2, nr: 2, nt: 2,
  t: 2, s: 2, m: 2, q: 2, mq: 2, qt: 2, qv: 2,
  d: 1, ad: 1, b: 1, r: 1, f: 1, z: 1, l: 1,
  u: 0, y: 0, e: 0, o: 0, c: 0, cc: 0, p: 0, k: 0, h: 0,
  g: 0, Mg: 0, Rg: 0, tg: 0,
};

export function swappability(id: WordId): 0 | 1 | 2 {
  return POS_TIER[pos[id]!] ?? 1;
}

/**
 * Which Mandarin words mean this English word or phrase?
 * Already sorted so the most common Mandarin word comes first.
 * Returns an empty array when we have no translation.
 *
 * Web pages say "owns" and "apples"; the dictionary says "own" and "apple".
 * So when the surface form misses we try its base forms. Without this step we
 * miss most verbs and most plurals, and pages come out nearly empty.
 */
export function lookupEnglish(phrase: string): readonly WordId[] {
  const key = normalizeEnglish(phrase);
  const words = key.split(" ");

  // Gather hits from the word as written and from its base forms, then keep
  // the most common Mandarin word among them.
  //
  // Taking the exact match first looks safer but is not. Rare words claim
  // common English glosses: "running" is listed as a meaning of 一连 (rank
  // 9311, "in a row"), so an exact-first rule hands a learner a rare word
  // when 走 (rank 84) was sitting right there. Frequency is the better tie
  // breaker, because a low rank is exactly what makes a word worth teaching.
  const hits = new Map<WordId, number>();

  const collect = (k: string) => {
    for (const sense of index.get(k) ?? []) {
      const seen = hits.get(sense.id);
      if (seen === undefined || sense.at < seen) hits.set(sense.id, sense.at);
    }
  };

  collect(key);

  if (words.length === 1) {
    for (const base of lemmaCandidates(key)) collect(base);
  } else {
    // In a phrase the head word carries the inflection: "blue apples" is
    // still "blue apple". Rewrite the last word only.
    const head = words[words.length - 1]!;
    for (const base of lemmaCandidates(head)) {
      collect([...words.slice(0, -1), base].join(" "));
    }
  }

  // Central meaning first, then the more common word. Getting this order the
  // wrong way round is how a learner ends up being taught that 地方 means
  // "room" or that 叫 means "by".
  return [...hits.entries()]
    .sort((a, b) => a[1] - b[1] || a[0] - b[0])
    .slice(0, 4)
    .map(([id]) => id);
}

/**
 * English words we never swap on their own.
 *
 * Two kinds, for the same reason.
 *
 * Articles carry no meaning to learn, and swapping one alone reads badly:
 * "the" becomes 这, which actually means "this".
 *
 * Prepositions are worse. They almost never map one to one between languages,
 * so the dictionary match is close to random — the bake-off caught the engine
 * offering 叫 ("to call") as the translation of "by". A learner who trusts
 * that has learned something false, which is worse than learning nothing.
 *
 * Both are still fair game inside a longer span, where "a blue apple" can
 * become 一个蓝色的苹果 and the article is carried along by the phrase.
 */
const NEVER_ALONE = new Set([
  "a", "an", "the", "of", "to", "it", "its", "s",
  "by", "in", "on", "at", "for", "with", "from", "as", "into", "about",
  "and", "or", "but", "so", "than", "that", "this", "there", "then",
]);

export function swappableAlone(phrase: string): boolean {
  return !NEVER_ALONE.has(normalizeEnglish(phrase));
}

/**
 * Does this phrase survive normalization as a real multi-word phrase?
 *
 * "a blue" normalizes to "blue", so treating it as a two-word span would
 * swallow the article into the swap and beat the plain word "blue" on the
 * phrase bonus. That is a false match, not a phrase.
 */
export function isRealPhrase(phrase: string, tokenCount: number): boolean {
  if (tokenCount === 1) return true;
  return normalizeEnglish(phrase).split(" ").length >= 2;
}

/**
 * Put an English phrase into the same shape the word list was built with, so
 * lookups match. Kept in one place because the build script, the index, and
 * answer marking must all agree.
 */
export function normalizeEnglish(phrase: string): string {
  return phrase
    .toLowerCase()
    .replace(/[^a-z0-9\s'-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^to\s+/, "")
    .replace(/^(a|an|the)\s+/, "");
}
