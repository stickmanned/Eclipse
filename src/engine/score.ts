/**
 * Marking what the learner typed.
 *
 * This runs in code, never through the model. The learner presses enter and
 * must see the result at once. A network round trip here would make the whole
 * product feel slow, and it would burn the request budget on the one job that
 * does not need a model.
 */

import { normalizeEnglish } from "./words.js";

export type Verdict = "right" | "wrong" | "empty";

export interface Marked {
  verdict: Verdict;
  /** The accepted answer that matched, if one did. */
  matched?: string;
  /** True when we let a small spelling mistake through. */
  typo: boolean;
  /**
   * True when nothing matched but the answer looks like a real attempt.
   * These go into the next batched model call to ask whether the learner gave
   * a valid synonym we do not have in the dictionary. If the model says yes,
   * the score is corrected afterwards.
   */
  worthAsking: boolean;
}

/** Edit distance, but it stops as soon as it passes the limit we care about. */
function withinEditDistance(a: string, b: string, limit: number): boolean {
  if (Math.abs(a.length - b.length) > limit) return false;
  if (a === b) return true;

  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const row = [i];
    let best = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      const v = Math.min(prev[j]! + 1, row[j - 1]! + 1, prev[j - 1]! + cost);
      row.push(v);
      if (v < best) best = v;
    }
    if (best > limit) return false; // no cell in this row can lead anywhere good
    prev = row;
  }
  return prev[b.length]! <= limit;
}

/**
 * Mark one answer against the meanings we accept for that word.
 *
 * We are generous on purpose. The goal is to find out whether the learner
 * understood the word, not whether they can spell. Being strict here would
 * push the measured accuracy below the real accuracy, and the balance loop
 * would then make the page easier than it needs to be.
 */
export function markAnswer(typed: string, accepted: readonly string[]): Marked {
  const guess = normalizeEnglish(typed);
  if (!guess) return { verdict: "empty", typo: false, worthAsking: false };

  const options = accepted.map(normalizeEnglish).filter(Boolean);

  for (const option of options) {
    if (guess === option) return { verdict: "right", matched: option, typo: false, worthAsking: false };
  }

  // A one-word answer inside a multi-word meaning still counts.
  // "apple" against "red apple" is understanding, not a miss.
  for (const option of options) {
    const parts = option.split(" ");
    if (parts.length > 1 && parts.includes(guess) && guess.length >= 3) {
      return { verdict: "right", matched: option, typo: false, worthAsking: false };
    }
  }

  // Let small spelling mistakes through, but only on words long enough that
  // one letter cannot turn them into a different word. "cat" and "car" are one
  // letter apart and mean different things; "aple" and "apple" do not.
  for (const option of options) {
    if (option.length >= 4 && withinEditDistance(guess, option, 1)) {
      return { verdict: "right", matched: option, typo: true, worthAsking: false };
    }
  }

  return {
    verdict: "wrong",
    typo: false,
    // Gibberish is not worth a model call. A real English word might be a
    // synonym the dictionary is missing, so that one is worth asking about.
    // Every English word has a vowel, and "xqzk" does not.
    worthAsking:
      /^[a-z][a-z\s'-]{2,}$/.test(guess) &&
      guess.split(" ").length <= 3 &&
      guess.split(" ").every((w) => /[aeiouy]/.test(w)),
  };
}
