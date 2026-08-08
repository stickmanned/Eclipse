/**
 * Everything Eclipse remembers about one learner.
 *
 * There are about 11,000 words worth teaching. That means the whole record
 * for one person is about 150 KB. At that size a database costs more than it
 * gives, so this is five flat arrays in memory, saved as one lump of bytes.
 *
 * Look up a word's state by using its ID as the array index. No index, no
 * query, no lookup logic at all.
 */

import { fsrs, createEmptyCard, Rating, State, type Card, type FSRS } from "ts-fsrs";
import { WORD_COUNT, type WordId } from "./words.js";
import { Ability, difficultyOf, PRIOR_SIGMA } from "./ability.js";

/** Day number since 1970-01-01. Whole days are enough for a memory model. */
export function dayNumber(at: Date = new Date()): number {
  return Math.floor(at.getTime() / 86_400_000);
}

function dayToDate(day: number): Date {
  return new Date(day * 86_400_000);
}

/**
 * A word shown and scrolled past without a click is very weak evidence.
 * We treat it as a fractional observation rather than a real answer.
 */
const GLANCE_WEIGHT = 0.06;

const MAGIC = 0x45434c32; // "ECL2" — layout changed when ability became Bayesian
const HEADER_FLOATS = 4; // mu, sigma, density, newBudget

export class LearnerStore {
  readonly n: number;

  /** Times the word appeared on a page, clicked or not. */
  readonly shown: Uint16Array;
  /** Times the learner clicked it and typed something. */
  readonly asked: Uint16Array;
  /** Times they got it right. */
  readonly right: Uint16Array;

  /** FSRS: how slowly this word fades for this person. */
  readonly stability: Float32Array;
  /** FSRS: how hard this word is for this person. */
  readonly difficulty: Float32Array;
  /** Day of the last answer. 0 means never answered. */
  readonly lastDay: Uint32Array;

  /**
   * What we believe about this learner's level, and how sure we are.
   *
   * This is what makes Eclipse useful on the very first page, before it knows
   * anything about them — and, just as importantly, what stops it pretending
   * to know more than it does.
   */
  readonly ability: Ability;

  /** How much of a sentence to swap. See balance.ts. */
  density: number;
  /** How many never-seen words we allow on one screen. See balance.ts. */
  newBudget: number;

  private readonly f: FSRS;

  private constructor(n: number, ability: Ability) {
    this.n = n;
    this.shown = new Uint16Array(n);
    this.asked = new Uint16Array(n);
    this.right = new Uint16Array(n);
    this.stability = new Float32Array(n);
    this.difficulty = new Float32Array(n);
    this.lastDay = new Uint32Array(n);
    this.ability = ability;
    this.density = 0.15;
    this.newBudget = 1;
    this.f = fsrs();
  }

  /**
   * A learner we know nothing about yet.
   *
   * Note what this means now: not "assume they are a beginner" but "we have no
   * idea, and we know we have no idea". The selector reads that and goes
   * looking for the answer instead of guessing.
   */
  static fresh(n = WORD_COUNT): LearnerStore {
    return new LearnerStore(n, new Ability());
  }

  /**
   * A learner who told us their HSK level. Four seconds of their time buys
   * most of what a Duolingo import would have given us.
   *
   * We take it as a starting belief, not as fact, and stay fairly unsure —
   * people are poor judges of their own level in both directions.
   */
  static fromHskLevel(level: number, n = WORD_COUNT): LearnerStore {
    const APPROX_RANK_BY_LEVEL = [50, 300, 700, 1200, 1900, 2900, 4300, 7000];
    const idx = Math.max(0, Math.min(7, Math.round(level)));
    return new LearnerStore(n, new Ability(difficultyOf(APPROX_RANK_BY_LEVEL[idx]!), 1.4));
  }

  /** Only for tests and simulations that want to start from a known belief. */
  static atLevel(rank: number, sigma = PRIOR_SIGMA, n = WORD_COUNT): LearnerStore {
    return new LearnerStore(n, new Ability(difficultyOf(rank), sigma));
  }

  // -------------------------------------------------------------------------
  // Reading
  // -------------------------------------------------------------------------

  /** Has this word ever been answered? */
  hasHistory(id: WordId): boolean {
    return this.asked[id]! > 0;
  }

  /**
   * The chance this person knows this word right now, from 0 to 1.
   *
   * With no history we guess from their level: words easier than reachRank are
   * probably known, words harder are probably not. With history we ask FSRS
   * how much of the memory is left after the time that has passed.
   */
  probKnows(id: WordId, today = dayNumber()): number {
    // An ID past the end of the word list has no history by definition. Guard
    // it rather than reading undefined out of the array and crashing later in
    // the FSRS card, where the cause would be much harder to see.
    if (id < 0 || id >= this.n) return this.prior(id);
    if (this.asked[id]! === 0) return this.prior(id);
    const r = this.f.get_retrievability(this.toCard(id, today), dayToDate(today), false);
    return Number.isFinite(r) ? (r as number) : this.prior(id);
  }

  /**
   * The guess for a word we have never asked about: does someone at this
   * learner's level usually know a word this common?
   */
  private prior(id: WordId): number {
    return this.ability.pCorrect(difficultyOf(id));
  }

  /** How much would asking this word tell us about the learner? */
  information(id: WordId): number {
    return this.ability.information(difficultyOf(id));
  }

  /** Words answered wrong, or faded enough to be worth showing again. */
  isDue(id: WordId, today = dayNumber(), threshold = 0.9): boolean {
    return this.asked[id]! > 0 && this.probKnows(id, today) < threshold;
  }

  /**
   * Is this word waiting to be shown again after a miss?
   *
   * FSRS cannot answer this. Right after any answer, right or wrong, FSRS says
   * the memory is perfectly fresh — which is true, and useless. FSRS schedules
   * in days. What we need here is "bring it back in the next five minutes",
   * which is Round 4 of the original example: the learner missed 蓝, so 蓝
   * comes back on the next page.
   *
   * So this is a separate, short queue, and it is deliberately not clever.
   */
  needsRedo(id: WordId): boolean {
    return this.redo.includes(id);
  }

  /** How many screens a missed word waits before it must reappear. */
  static readonly REDO_AFTER_SCREENS = 3;

  /** Missed words, oldest first. Kept short on purpose. */
  private redo: WordId[] = [];

  /** Call once per screen. Retires anything that has had its chance. */
  screenDone(showed: readonly WordId[]): void {
    this.redo = this.redo.filter((id) => !showed.includes(id));
    if (this.redo.length > 12) this.redo = this.redo.slice(-12);
  }

  redoQueue(): readonly WordId[] {
    return this.redo;
  }

  // -------------------------------------------------------------------------
  // Writing
  // -------------------------------------------------------------------------

  /**
   * The learner clicked a word and typed an answer. This is strong evidence.
   */
  answer(id: WordId, correct: boolean, today = dayNumber()): void {
    // Read the current card before touching the counters. toCard decides
    // between "never answered" and "answered before" by looking at asked[id],
    // so bumping the counter first makes a brand new word look like a review
    // with zero stability, and FSRS returns NaN for that.
    const card = this.toCard(id, today);
    const next = this.f.next(card, dayToDate(today), correct ? Rating.Good : Rating.Again).card;

    const isFirstAnswer = this.asked[id]! === 0;
    this.asked[id]!++;
    if (correct) this.right[id]!++;

    this.stability[id] = next.stability;
    this.difficulty[id] = next.difficulty;
    this.lastDay[id] = today;

    // Missed it? Then it comes back within the next few screens.
    if (!correct) {
      if (!this.redo.includes(id)) this.redo.push(id);
    } else {
      this.redo = this.redo.filter((x) => x !== id);
    }

    // Fold the answer into what we believe about their level — but only the
    // FIRST time we ask about a word.
    //
    // Item response theory assumes each item is a separate piece of evidence.
    // A word the learner has already answered five times is not five
    // independent facts about their vocabulary; it is one fact, counted five
    // times. Feeding every repeat in ratchets the estimate upward, because
    // Eclipse keeps bringing back words they got right. Measured on two
    // hundred simulated pages this pushed the level estimate to roughly two
    // and a half times the truth.
    //
    // After the first answer, the word belongs to FSRS. That is the right
    // split: the ability model asks "is this word in their vocabulary?", and
    // memory asks "can they retrieve it today?".
    if (isFirstAnswer) this.ability.observe(difficultyOf(id), correct);
  }

  /**
   * The word was on screen and the learner scrolled past without clicking.
   *
   * Clicking is optional in this product, so most words end up here. Treat it
   * as very weak evidence and never feed it to FSRS. If we counted silence as
   * knowledge, the difficulty would climb away from the learner and never
   * come back.
   */
  glanced(id: WordId, _today = dayNumber()): void {
    if (this.shown[id]! < 0xffff) this.shown[id]!++;

    // And that is all we do with it.
    //
    // The first version treated a glance as a small fraction of a correct
    // answer. That looked reasonable and was badly wrong. Most words are never
    // clicked, so glances outnumber real answers several times over, and each
    // one pushed the level estimate up. Across two hundred simulated pages the
    // estimate drifted to five times the learner's real level.
    //
    // Silence is not understanding. It usually means the reader was reading.
  }

  /**
   * Time has passed since we last saw this learner. They may have studied
   * elsewhere, or forgotten things. Either way we know less than we did.
   */
  catchUp(today = dayNumber()): void {
    const last = this.lastActiveDay;
    if (last > 0 && today > last) this.ability.drift(today - last);
    this.lastActiveDay = today;
  }

  private lastActiveDay = 0;

  /** Count a word as shown, whether or not it is later clicked. */
  markShown(id: WordId): void {
    if (this.shown[id]! < 0xffff) this.shown[id]!++;
  }

  // -------------------------------------------------------------------------
  // FSRS bridge
  // -------------------------------------------------------------------------

  private toCard(id: WordId, today: number): Card {
    // A card the learner has never answered starts today, not at the epoch.
    // Dating it 1970 makes FSRS see a twenty thousand day gap and return NaN,
    // which then poisons every score that depends on it.
    if (this.asked[id]! === 0) return createEmptyCard(dayToDate(today));

    const last = dayToDate(this.lastDay[id]!);
    return {
      due: last,
      stability: this.stability[id]!,
      difficulty: this.difficulty[id]!,
      elapsed_days: 0,
      scheduled_days: 0,
      reps: this.asked[id]!,
      lapses: this.asked[id]! - this.right[id]!,
      state: State.Review,
      last_review: last,
    };
  }

  // -------------------------------------------------------------------------
  // Saving. One lump of bytes, written to IndexedDB.
  // -------------------------------------------------------------------------

  /**
   * Pack everything into one lump of bytes for IndexedDB.
   *
   * The four-byte arrays go first and the two-byte ones after. That order is
   * not cosmetic: the word count is odd, so a Uint16 array of it ends on an
   * offset that is not a multiple of four, and Float32Array refuses to start
   * there. Putting the wide arrays first keeps every one of them aligned.
   */
  toBytes(): Uint8Array {
    const HEAD = 8 + HEADER_FLOATS * 4;
    const wide = [this.stability, this.difficulty, this.lastDay];
    const narrow = [this.shown, this.asked, this.right];

    const total =
      HEAD +
      wide.reduce((s, a) => s + a.byteLength, 0) +
      narrow.reduce((s, a) => s + a.byteLength, 0) +
      4 + this.redo.length * 4;

    const out = new Uint8Array(total);
    const view = new DataView(out.buffer);

    view.setUint32(0, MAGIC, true);
    view.setUint32(4, this.n, true);
    const header = [this.ability.mu, this.ability.sigma, this.density, this.newBudget];
    for (const [i, v] of header.entries()) view.setFloat32(8 + i * 4, v, true);

    let at = HEAD;
    for (const a of [...wide, ...narrow]) {
      out.set(new Uint8Array(a.buffer, a.byteOffset, a.byteLength), at);
      at += a.byteLength;
    }

    // The redo queue is short and its length varies, so it goes last and we
    // write it through a DataView, which does not care about alignment.
    view.setUint32(at, this.redo.length, true);
    at += 4;
    for (const id of this.redo) {
      view.setUint32(at, id, true);
      at += 4;
    }

    return out;
  }

  static fromBytes(bytes: Uint8Array): LearnerStore {
    // Copy into a fresh buffer. Bytes handed back by IndexedDB may sit at any
    // offset, and a typed array refuses to start on the wrong boundary.
    const copy = bytes.slice();
    const buf = copy.buffer;
    const view = new DataView(buf);
    if (view.getUint32(0, true) !== MAGIC) throw new Error("not an Eclipse store");

    const n = view.getUint32(4, true);
    const s = new LearnerStore(n, new Ability(view.getFloat32(8, true), view.getFloat32(12, true)));
    s.density = view.getFloat32(16, true);
    s.newBudget = view.getFloat32(20, true);

    let at = 8 + HEADER_FLOATS * 4;
    s.stability.set(new Float32Array(buf, at, n)); at += n * 4;
    s.difficulty.set(new Float32Array(buf, at, n)); at += n * 4;
    s.lastDay.set(new Uint32Array(buf, at, n)); at += n * 4;
    s.shown.set(new Uint16Array(buf, at, n)); at += n * 2;
    s.asked.set(new Uint16Array(buf, at, n)); at += n * 2;
    s.right.set(new Uint16Array(buf, at, n)); at += n * 2;

    if (at + 4 <= copy.byteLength) {
      const count = view.getUint32(at, true);
      at += 4;
      for (let i = 0; i < count && at + 4 <= copy.byteLength; i++, at += 4) {
        s.redo.push(view.getUint32(at, true));
      }
    }

    return s;
  }

  /** Rough size on disk, for the options page. */
  byteSize(): number {
    return 8 + HEADER_FLOATS * 4 + this.n * (4 + 4 + 4 + 2 + 2 + 2) + 4 + this.redo.length * 4;
  }
}
