/**
 * Core #1 — balancing.
 *
 * A person who balances well is not a person who never leans. They are a
 * person who corrects fast. Eclipse will guess the wrong level. That is fine
 * and expected. What matters is that it notices and corrects within a page or
 * two.
 *
 * Two dials, both moved by the same rule.
 */

export const TARGET_ACCURACY = 0.85;

/**
 * Why 85 and not higher or lower.
 *
 *   100%  they get everything right and learn nothing new
 *    50%  half the page is wrong and they close the tab
 *    85%  hard enough to teach, easy enough to keep reading
 *
 * Treat this as a setting, not a law. Once there is a real answer log, check
 * it against how long people actually keep reading.
 */

/**
 * The normal correction, used in both directions.
 *
 * Found by sweeping bench/tune.ts across four random learners, not by guessing.
 * A strong gain like this is only safe because MAX_STEP below bounds how far
 * one page can move the dial. Without that bound the same value oscillates
 * between the limits.
 */
const CLIMB = 0.7;

/**
 * The hard correction, used only when the learner is genuinely struggling.
 *
 * A balancing person does not throw their weight around for every small
 * wobble. They make small corrections constantly and a big one only when they
 * have actually leaned too far. Applying the hard gain to every dip below
 * target has a nasty side effect: with a gain that is three times stronger in
 * one direction, the loop cannot settle *on* the target at all. It settles
 * wherever the two pulls cancel, which is well above it — measured at 93%
 * against an 85% target, meaning a learner who is never challenged.
 *
 * So the extra push is reserved for a real miss.
 */
const FALL = 1.5;

/** How far below target counts as leaning too far, rather than a wobble. */
const LEANING_TOO_FAR = 0.15;

/**
 * The most the density dial may move in one step.
 *
 * Without this the loop tears itself apart. A page where the learner gets half
 * the blanks wrong produces an error of -0.35, and multiplying that by the
 * hard gain moves the dial further than its entire useful range in one go.
 * The result is a dial that slams between its limits page after page, which
 * is the opposite of balancing.
 *
 * A person keeping their balance cannot move infinitely fast either. Their
 * correction is quick, but it is still bounded. So is this one.
 */
const MAX_STEP = 0.08;

/** Fraction of a sentence we are willing to swap. */
const MIN_DENSITY = 0.05;
const MAX_DENSITY = 0.6;

/**
 * Never show more than two words the learner has never seen, on one screen.
 *
 * This single cap does more for how the product feels than any amount of
 * tuning. Look at Round 3 of the original example: exactly one unknown word,
 * 蓝. Everything else was known or guessable from context. That is what makes
 * it feel like reading instead of studying.
 */
const MAX_NEW = 2;

/** A brand new word is a big event, so this dial climbs in small steps. */
const NEW_CLIMB_CAP = 0.34;
/** But it can drop by a whole word at once. Falling fast is the point. */
const NEW_FALL_CAP = 1.0;

export interface Dials {
  density: number;
  newBudget: number;
}

export interface BatchResult {
  /** How many blanks the learner filled in. */
  answered: number;
  /** How many they got right. */
  correct: number;
}

/**
 * The numbers above, in a form the tuning sweep can change.
 * Nothing in the extension should pass this — it exists so bench/tune.ts can
 * search for better values instead of us guessing them one at a time.
 */
export interface Tuning {
  climb: number;
  fall: number;
  leaningTooFar: number;
  maxStep: number;
  target: number;
}

export const DEFAULT_TUNING: Tuning = {
  climb: CLIMB,
  fall: FALL,
  leaningTooFar: LEANING_TOO_FAR,
  maxStep: MAX_STEP,
  target: TARGET_ACCURACY,
};

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/**
 * Move the dials after a batch of answers.
 *
 * Returns new dials; it does not change the ones passed in.
 */
export function updateDials(dials: Dials, batch: BatchResult, tuning = DEFAULT_TUNING): Dials {
  // No answers means no information. A learner who reads without clicking is
  // allowed, but they tell us nothing, so we hold still.
  if (batch.answered === 0) return { ...dials };

  const accuracy = batch.correct / batch.answered;
  const error = accuracy - tuning.target;

  // Three right out of three is 100%, but it is also almost no evidence.
  // Weight the correction by how much we actually saw, so a tiny sample
  // cannot throw the difficulty across the room.
  //
  // Ten, not five. A screen often yields only three or four answers, and at
  // that size one wrong answer moves the measured accuracy by twenty five
  // points. Reacting fully to that makes the difficulty jump around between
  // pages, which reads as the app being erratic rather than responsive.
  const confidence = Math.min(1, batch.answered / 10);

  const struggling = error < -tuning.leaningTooFar;
  const gain = (struggling ? tuning.fall : tuning.climb) * confidence;

  const move = clamp(gain * error, -tuning.maxStep, tuning.maxStep);
  const density = clamp(dials.density + move, MIN_DENSITY, MAX_DENSITY);

  // The new-word dial moves on the same signal but on a much shorter leash.
  const step = clamp((gain * error) / 4, -NEW_FALL_CAP, NEW_CLIMB_CAP);
  const newBudget = clamp(dials.newBudget + step, 0, MAX_NEW);

  return { density, newBudget };
}

/**
 * How many never-seen words we will allow on this screen.
 * The dial is a smooth number so it can drift; the answer must be whole words.
 */
export function newWordsAllowed(dials: Dials): number {
  return Math.floor(dials.newBudget);
}

/**
 * How hard the words themselves should be, as a chance the learner knows them.
 *
 * Swapping *more* words only goes so far. A strong reader on a simple page
 * runs out of words worth swapping: the density dial pins at its maximum and
 * the page is still too easy. Turning the dial further does nothing, because
 * there is nothing left to turn.
 *
 * So once density is high, we stop asking for more words and start asking for
 * harder ones. At the bottom of the range we look for words the learner almost
 * certainly knows; at the top, words they may well miss.
 *
 * This is the same idea as leaning further to hold a balance: when one
 * correction runs out of room, you use the other.
 */
export function targetKnown(dials: Dials): number {
  const saturation = (dials.density - MIN_DENSITY) / (MAX_DENSITY - MIN_DENSITY);
  return 0.95 - 0.3 * Math.min(1, Math.max(0, saturation));
}

/**
 * How many swaps to aim for in a stretch of text with this many candidates.
 *
 * Zero is a valid answer for one sentence. Forcing at least one swap per
 * sentence sounds harmless, but it means every density below about 0.25
 * produces exactly the same page, so half the dial's range does nothing and
 * the balance loop cannot find the easy end. A screen as a whole always gets
 * at least one swap; an individual sentence does not have to.
 */
export function swapTarget(dials: Dials, candidateCount: number): number {
  if (candidateCount === 0) return 0;
  return clamp(Math.round(candidateCount * dials.density), 0, candidateCount);
}

/** A description of the current setting, for the popup. */
export function describe(dials: Dials): string {
  const pct = Math.round(dials.density * 100);
  const fresh = newWordsAllowed(dials);
  return `${pct}% swapped, ${fresh} new word${fresh === 1 ? "" : "s"} per screen`;
}
