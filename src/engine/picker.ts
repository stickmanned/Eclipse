/**
 * Choosing what to swap.
 *
 * This is the deterministic half of Eclipse, and the reason the product stays
 * predictable. Code decides *which* words get swapped and *how many*. The
 * model only decides *how to word it*. If the model picked the difficulty, it
 * could get ambitious on its own and there would be no way to test the
 * learning behaviour without paying for it.
 */

import {
  getWord,
  isRealPhrase,
  lookupEnglish,
  normalizeEnglish,
  swappability,
  swappableAlone,
  type WordId,
} from "./words.js";
import { dayNumber, type LearnerStore } from "./store.js";
import { newWordsAllowed, swapTarget, targetKnown, type Dials } from "./balance.js";

/** Below this chance of knowing it, a word counts against the new-word budget. */
const RISKY_BELOW = 0.5;

/** Longest phrase we try to match, in English words. */
const MAX_SPAN = 3;

export interface Candidate {
  /** Character offsets into the sentence. */
  start: number;
  end: number;
  /** The English text this would replace. */
  english: string;
  wordId: WordId;
  mandarin: string;
  pinyin: string;
  /** English answers we will accept. */
  accepted: string[];
  /** Chance the learner already knows it. */
  known: number;
  /** True when it counts against the new-word budget. */
  risky: boolean;
  score: number;
}

export interface Plan {
  text: string;
  swaps: Candidate[];
}

const WORD_RE = /[A-Za-z][A-Za-z'’-]*/g;

interface Token {
  text: string;
  start: number;
  end: number;
}

function tokenize(text: string): Token[] {
  const out: Token[] = [];
  for (const m of text.matchAll(WORD_RE)) {
    out.push({ text: m[0], start: m.index, end: m.index + m[0].length });
  }
  return out;
}

/**
 * Find every English span in the sentence that we have a Mandarin word for.
 *
 * Longer spans are tried first and win. This matters more than it looks:
 * swapping word for word is what produces "Bob 有 一个 蓝 苹果", which no
 * native speaker would write. Matching "a blue apple" as one unit lets the
 * model return 一个蓝色的苹果 and keep the sentence readable.
 */
export function findCandidates(
  text: string,
  store: LearnerStore,
  today = dayNumber(),
  aim = 0.75,
): Candidate[] {
  const tokens = tokenize(text);
  const taken = new Set<number>(); // token indexes already used by a longer span
  const found: Candidate[] = [];

  for (let span = MAX_SPAN; span >= 1; span--) {
    for (let i = 0; i + span <= tokens.length; i++) {
      let overlaps = false;
      for (let k = i; k < i + span; k++) if (taken.has(k)) overlaps = true;
      if (overlaps) continue;

      const first = tokens[i]!;
      const last = tokens[i + span - 1]!;
      const english = text.slice(first.start, last.end);

      // "a blue" is not a phrase, it is "blue" with an article stuck to it.
      // Letting it through would swallow the article and win the phrase bonus.
      if (!isRealPhrase(english, span)) continue;
      if (span === 1 && !swappableAlone(english)) continue;

      const ids = lookupEnglish(english);
      if (ids.length === 0) continue;

      // Prefer the most common Mandarin word for this meaning that is also a
      // sensible thing to swap. Particles and conjunctions are never sensible:
      // putting 的 or 了 in the middle of an English sentence teaches nothing.
      const id = ids.find((c) => swappability(c) === 2) ?? ids.find((c) => swappability(c) === 1);
      if (id === undefined) continue;

      const word = getWord(id);
      const known = store.probKnows(id, today);

      found.push({
        start: first.start,
        end: last.end,
        english,
        wordId: id,
        mandarin: word.simplified,
        pinyin: word.pinyin,
        accepted: word.meanings,
        known,
        // A word waiting for a correction is not a new word. The budget exists
        // to limit how much is unfamiliar on screen, and this one is already
        // familiar — they met it and got it wrong. Blocking it here would
        // stop the one thing that fixes the mistake.
        risky: known < RISKY_BELOW && !store.needsRedo(id),
        score: scoreCandidate(id, known, span, store, aim),
      });

      for (let k = i; k < i + span; k++) taken.add(k);
    }
  }

  return found.sort((a, b) => a.start - b.start);
}

/**
 * How much is this swap worth?
 *
 * Two different things can make a word worth showing, and which one matters
 * depends entirely on how well we know the learner.
 *
 *   **Flow** — the word sits where they will probably, but not certainly, get
 *   it right. This is what makes reading feel good, and it is what we want
 *   once we understand someone.
 *
 *   **Information** — the word is one whose outcome we genuinely cannot
 *   predict. Its answer tells us the most about their level. This is what we
 *   want when we have just met them, or when they have surprised us.
 *
 * A system that only chases flow never finds out it is wrong: it settles into
 * a comfortable guess and stays there. A system that only chases information
 * feels like a test. So the two are mixed, and the mix is set by how unsure we
 * currently are — which the ability model already tracks.
 *
 * This is the same balancing idea one level up. When you do not know where the
 * centre is, you move to find it. Once you know, you hold it.
 */
function scoreCandidate(
  id: WordId,
  known: number,
  span: number,
  store: LearnerStore,
  aim: number,
): number {
  // Flow: peaks at the aim, falls off in both directions.
  const flow = Math.max(0, 1 - Math.abs(known - aim) / Math.max(aim, 1 - aim));

  // Information: peaks where the outcome is a coin flip. Scaled so the best
  // possible item scores about 1, the same range as flow.
  const info = store.information(id) / 0.2025; // SLOPE² × 0.25

  const explore = store.ability.explorationWeight();
  let s = explore * Math.min(1, info) + (1 - explore) * flow;

  // A word they have answered before and that has faded is worth showing.
  if (store.hasHistory(id)) {
    s += 0.5;
    const missRate = 1 - store.right[id]! / Math.max(1, store.asked[id]!);
    s += missRate * 0.6;
  }

  // A word they just missed jumps the queue outright. This is Round 4 of the
  // original example: they called 蓝 "red", so 蓝 comes back on the next page
  // while the correction is still fresh. Nothing else should outrank that.
  if (store.needsRedo(id)) s += 3;

  // Nouns, verbs and adjectives read better mid-sentence than adverbs.
  s += swappability(id) === 2 ? 0.25 : 0;

  // A two or three word phrase gives the model room to produce natural
  // grammar, so nudge those up.
  s += (span - 1) * 0.15;

  return s;
}

/**
 * Decide the final set of swaps for one sentence.
 *
 * Two rules do most of the work here:
 *   - the density dial sets how many swaps to make
 *   - the new-word cap sets how many of them may be words the learner
 *     probably does not know
 */
export function planSentence(
  text: string,
  store: LearnerStore,
  dials: Dials,
  today = dayNumber(),
): Plan {
  const candidates = findCandidates(text, store, today, targetKnown(dials));
  if (candidates.length === 0) return { text, swaps: [] };

  const want = swapTarget(dials, candidates.length);
  const riskyAllowed = newWordsAllowed(dials);

  const safe = candidates.filter((c) => !c.risky).sort((a, b) => b.score - a.score);
  // Among risky words, introduce the easiest one first. The easiest unknown
  // word is the one most likely to be guessable from the sentence around it.
  const risky = candidates.filter((c) => c.risky).sort((a, b) => a.wordId - b.wordId);

  // A word that appears twice in one sentence gets swapped once. Showing the
  // same blank twice in a row is not practice, it is just clutter — and the
  // second copy would eat another slot from the new-word budget for nothing.
  const used = new Set<WordId>();
  const chosen: Candidate[] = [];

  const take = (c: Candidate) => {
    if (used.has(c.wordId)) return false;
    used.add(c.wordId);
    chosen.push(c);
    return true;
  };

  let riskyTaken = 0;
  for (const c of risky) {
    if (chosen.length >= want || riskyTaken >= riskyAllowed) break;
    if (take(c)) riskyTaken++;
  }
  for (const c of safe) {
    if (chosen.length >= want) break;
    take(c);
  }

  // Back into reading order, so the model gets them the way they appear.
  chosen.sort((a, b) => a.start - b.start);
  return { text, swaps: chosen };
}

/**
 * Plan a whole screenful at once.
 *
 * The new-word budget is per screen, not per sentence. Two unknown words in
 * one paragraph is the limit however they are spread out.
 */
export function planScreen(
  sentences: readonly string[],
  store: LearnerStore,
  dials: Dials,
  today = dayNumber(),
): Plan[] {
  let riskyLeft = newWordsAllowed(dials);
  const seenThisScreen = new Set<WordId>();
  const out: Plan[] = [];

  for (const text of sentences) {
    const plan = planSentence(text, store, { ...dials, newBudget: riskyLeft }, today);

    // Do not teach the same word twice on one screen. Repeating it is not
    // practice, it is just clutter.
    plan.swaps = plan.swaps.filter((s) => {
      if (seenThisScreen.has(s.wordId)) return false;
      seenThisScreen.add(s.wordId);
      return true;
    });

    riskyLeft -= plan.swaps.filter((s) => s.risky).length;
    if (riskyLeft < 0) riskyLeft = 0;
    out.push(plan);
  }

  // A single sentence may end up with nothing swapped, which is fine. A whole
  // screen with nothing swapped is not — the learner would see a plain page
  // and think Eclipse had stopped working. Put back the single best swap.
  if (out.every((p) => p.swaps.length === 0)) {
    let best: Candidate | undefined;
    let bestPlan: Plan | undefined;
    for (const plan of out) {
      for (const c of findCandidates(plan.text, store, today, targetKnown(dials))) {
        if (c.risky) continue;
        if (!best || c.score > best.score) {
          best = c;
          bestPlan = plan;
        }
      }
    }
    if (best && bestPlan) bestPlan.swaps = [best];
  }

  return out;
}

export { normalizeEnglish };
