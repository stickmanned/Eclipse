/**
 * The proof that Core #1 works.
 *
 * A fake learner reads 200 pages. We know exactly what this fake learner
 * knows, because we invented them. Eclipse does not. The question is whether
 * Eclipse can find their level from nothing, hold it, and then catch up when
 * their level suddenly changes.
 *
 * This runs with no browser and no model. If balancing does not work here, it
 * will not work in Chrome either, and no amount of prompt writing will fix it.
 *
 * Run: npm run sim
 */

import { LearnerStore, dayNumber } from "../src/engine/store.js";
import { planScreen } from "../src/engine/picker.js";
import { updateDials, newWordsAllowed, TARGET_ACCURACY } from "../src/engine/balance.js";
import { CORPUS } from "./corpus.js";

// ---------------------------------------------------------------------------
// The fake learner.
// ---------------------------------------------------------------------------

/** Even a word you know well gets typed wrong sometimes. */
const SLIP_RATE = 0.05;
/** Context helps. Sometimes you guess a word you have never seen. */
const GUESS_RATE = 0.1;
/** Chance of remembering a word for good after meeting it once. */
const LEARN_RATE = 0.35;
/** How sharp the edge of their vocabulary is. */
const TRUE_SPREAD = 250;

class FakeLearner {
  private readonly learned = new Set<number>();

  constructor(
    public trueRank: number,
    private readonly random: () => number,
  ) {}

  /** Do they really know this word, right now? */
  private knows(id: number): boolean {
    if (this.learned.has(id)) return true;
    const p = 1 / (1 + Math.exp(-(this.trueRank - id) / TRUE_SPREAD));
    return this.random() < p;
  }

  /** What happens when Eclipse shows them a blank. */
  answer(id: number): boolean {
    const knew = this.knows(id);
    const correct = knew ? this.random() > SLIP_RATE : this.random() < GUESS_RATE;

    // Meeting a word teaches it, sometimes. This is the product working.
    if (!knew && this.random() < LEARN_RATE) this.learned.add(id);
    return correct;
  }

  /** Only a fraction of blanks get clicked. Most readers keep reading. */
  willClick(clickRate: number): boolean {
    return this.random() < clickRate;
  }

  /**
   * The learner's real level right now, including everything Eclipse has
   * taught them.
   *
   * This matters. The fake learner genuinely learns, so after two hundred
   * pages their level is far above the number they started at. Judging the
   * estimate against the starting number would mark a correct estimate wrong.
   */
  effectiveLevel(): number {
    let lo = 0;
    let hi = 11_000;
    for (let i = 0; i < 20; i++) {
      const mid = Math.floor((lo + hi) / 2);
      const p = this.learned.has(mid)
        ? 1
        : 1 / (1 + Math.exp(-(this.trueRank - mid) / TRUE_SPREAD));
      if (p > 0.5) lo = mid;
      else hi = mid;
    }
    return lo + this.learned.size;
  }
}

/** Same sequence every run, so a change in the numbers means a change in code. */
function seededRandom(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

// ---------------------------------------------------------------------------

interface PageResult {
  page: number;
  answered: number;
  correct: number;
  accuracy: number;
  density: number;
  newBudget: number;
  reachRank: number;
  sigma: number;
  effectiveLevel: number;
  /** Squared error of every prediction made this page. Lower is better. */
  brier: number;
  trueRank: number;
  swaps: number;
}

interface Options {
  pages: number;
  startingLevel: number;
  jumpAt?: number;
  jumpTo?: number;
  clickRate: number;
  seed: number;
}

function run(opts: Options): PageResult[] {
  const random = seededRandom(opts.seed);
  const learner = new FakeLearner(opts.startingLevel, random);

  // Eclipse starts knowing nothing at all about this person.
  const store = LearnerStore.fresh();
  const results: PageResult[] = [];
  const today = dayNumber();

  for (let page = 1; page <= opts.pages; page++) {
    if (opts.jumpAt && page === opts.jumpAt) learner.trueRank = opts.jumpTo!;

    // A screenful: five sentences taken from the corpus.
    const screen: string[] = [];
    for (let i = 0; i < 5; i++) {
      screen.push(CORPUS[Math.floor(random() * CORPUS.length)]!);
    }

    const dials = { density: store.density, newBudget: store.newBudget };
    const plans = planScreen(screen, store, dials, today);
    const swaps = plans.flatMap((p) => p.swaps);

    let answered = 0;
    let correct = 0;
    let brierSum = 0;
    const shown: number[] = [];

    for (const swap of swaps) {
      shown.push(swap.wordId);
      store.markShown(swap.wordId);

      if (!learner.willClick(opts.clickRate)) {
        store.glanced(swap.wordId, today);
        continue;
      }

      // Score the prediction BEFORE the answer updates the belief.
      const predicted = store.probKnows(swap.wordId, today);
      const right = learner.answer(swap.wordId);
      brierSum += (predicted - (right ? 1 : 0)) ** 2;

      store.answer(swap.wordId, right, today);
      answered++;
      if (right) correct++;
    }

    store.screenDone(shown);

    const next = updateDials(dials, { answered, correct });
    store.density = next.density;
    store.newBudget = next.newBudget;

    results.push({
      page,
      answered,
      correct,
      accuracy: answered ? correct / answered : Number.NaN,
      density: next.density,
      newBudget: next.newBudget,
      reachRank: store.ability.level(),
      sigma: store.ability.sigma,
      effectiveLevel: learner.effectiveLevel(),
      brier: answered ? brierSum / answered : Number.NaN,
      trueRank: learner.trueRank,
      swaps: swaps.length,
    });
  }

  return results;
}

// ---------------------------------------------------------------------------
// Reporting
// ---------------------------------------------------------------------------

function mean(xs: number[]): number {
  const ok = xs.filter(Number.isFinite);
  return ok.length ? ok.reduce((a, b) => a + b, 0) / ok.length : Number.NaN;
}

/** One bar per row of pages, so the shape is visible in a terminal. */
function chart(results: PageResult[], groupSize: number): void {
  const WIDTH = 44;
  console.log(
    `  pages      accuracy${" ".repeat(WIDTH - 8)} density  new  level est/real  unsure`,
  );

  for (let i = 0; i < results.length; i += groupSize) {
    const group = results.slice(i, i + groupSize);
    const acc = mean(group.map((r) => r.accuracy));
    const filled = Math.round((Number.isFinite(acc) ? acc : 0) * WIDTH);

    const bar = "█".repeat(filled) + "·".repeat(WIDTH - filled);
    // Mark where the 85% target sits, so drift is obvious at a glance.
    const targetAt = Math.round(TARGET_ACCURACY * WIDTH);
    const withTarget = bar.slice(0, targetAt) + "|" + bar.slice(targetAt + 1);

    const last = group[group.length - 1]!;
    console.log(
      `  ${String(i + 1).padStart(3)}-${String(i + group.length).padEnd(4)} ` +
        `${withTarget} ${(Number.isFinite(acc) ? acc : 0).toFixed(2)}  ` +
        `${last.density.toFixed(2)}  ${newWordsAllowed(last)}   ` +
        `${Math.round(last.reachRank).toString().padStart(6)}/${String(last.effectiveLevel).padEnd(6)} ${last.sigma.toFixed(2)}`,
    );
  }
}

function check(label: string, pass: boolean, detail: string): boolean {
  console.log(`  ${pass ? "PASS" : "FAIL"}  ${label.padEnd(46)} ${detail}`);
  return pass;
}

// ---------------------------------------------------------------------------

function main() {
  let allPassed = true;

  console.log("");
  console.log("=".repeat(96));
  console.log("Eclipse balance loop — 200 pages, learner level jumps at page 101");
  console.log("=".repeat(96));
  console.log("");

  const results = run({
    pages: 200,
    startingLevel: 800,
    jumpAt: 101,
    jumpTo: 3000,
    clickRate: 0.6,
    seed: 12345,
  });

  chart(results, 10);

  // -------------------------------------------------------------------------
  console.log("");
  console.log("Settling — does it find a level it was never told?");
  console.log("");

  const settled = results.slice(60, 100).map((r) => r.accuracy);
  const settledAcc = mean(settled);
  allPassed =
    check(
      "holds accuracy near the 85% target",
      Math.abs(settledAcc - TARGET_ACCURACY) < 0.07,
      `${(settledAcc * 100).toFixed(1)}% over pages 61-100`,
    ) && allPassed;

  // The estimate must track the learner's level *as it is now*, not as it was
  // at the start. The fake learner keeps learning, so those are very different
  // numbers by page 100.
  const estimate = mean(results.slice(60, 100).map((r) => r.reachRank));
  const realLevel = mean(results.slice(60, 100).map((r) => r.effectiveLevel));
  allPassed =
    check(
      "level estimate tracks the learner as they improve",
      estimate > realLevel / 3 && estimate < realLevel * 3,
      `estimated ${Math.round(estimate)}, real ${Math.round(realLevel)}`,
    ) && allPassed;

  // The real test of a model that reports probabilities is not whether its
  // point estimate looks sensible. It is whether the numbers mean anything:
  // when it says 85%, does that happen 85% of the time?
  //
  // A Brier score is the mean squared error of every prediction. Always
  // guessing the base rate scores about 0.13 on a page tuned to 85%, so
  // anything below that is genuinely informative.
  const brier = mean(results.slice(60, 100).map((r) => r.brier));
  allPassed =
    check(
      "its probabilities mean something (Brier score)",
      brier < 0.13,
      `${brier.toFixed(3)} — below 0.13 beats always guessing the average`,
    ) && allPassed;

  // Steadiness matters as much as the average. A loop that swings between 60%
  // and 100% averages 80% and feels awful to use.
  const swing = Math.sqrt(mean(settled.map((a) => (a - settledAcc) ** 2)));
  allPassed =
    check(
      "stays steady instead of swinging",
      swing < 0.2,
      `page to page spread ${(swing * 100).toFixed(1)} points`,
    ) && allPassed;

  // -------------------------------------------------------------------------
  console.log("");
  console.log("Recovery — the learner suddenly improves. Does it notice?");
  console.log("");

  const before = mean(results.slice(90, 100).map((r) => r.density));
  const after = mean(results.slice(190, 200).map((r) => r.density));
  allPassed =
    check(
      "makes pages harder once the learner improves",
      after > before,
      `density ${before.toFixed(2)} -> ${after.toFixed(2)}`,
    ) && allPassed;

  const estAfter = mean(results.slice(190, 200).map((r) => r.reachRank));
  allPassed =
    check(
      "level estimate follows the jump",
      estAfter > estimate * 1.5,
      `${Math.round(estimate)} -> ${Math.round(estAfter)} (real 800 -> 3000)`,
    ) && allPassed;

  // How long until it is back on target after the jump?
  let recovered = -1;
  for (let i = 101; i < results.length - 4; i++) {
    const window = mean(results.slice(i, i + 5).map((r) => r.accuracy));
    if (Math.abs(window - TARGET_ACCURACY) < 0.07) {
      recovered = i - 100;
      break;
    }
  }
  allPassed =
    check(
      "gets back on target quickly",
      recovered >= 0 && recovered <= 20,
      recovered < 0 ? "never recovered" : `${recovered} pages`,
    ) && allPassed;

  // -------------------------------------------------------------------------
  console.log("");
  console.log("Other readers");
  console.log("");

  // Someone who never clicks anything. Allowed. It must not drift into chaos.
  const quiet = run({ pages: 100, startingLevel: 800, clickRate: 0, seed: 777 });
  const quietLast = quiet[quiet.length - 1]!;
  allPassed =
    check(
      "a reader who never clicks does not break it",
      quietLast.density > 0 && quietLast.density <= 0.6 && quietLast.swaps > 0,
      `density held at ${quietLast.density.toFixed(2)}, still swapping ${quietLast.swaps} words`,
    ) && allPassed;

  // A complete beginner. The new-word cap should keep the page readable.
  const beginner = run({ pages: 60, startingLevel: 0, clickRate: 0.8, seed: 999 });
  const worstNew = Math.max(...beginner.map((r) => newWordsAllowed(r)));
  allPassed =
    check(
      "never puts more than two unseen words on a screen",
      worstNew <= 2,
      `worst case ${worstNew}`,
    ) && allPassed;

  const beginnerAcc = mean(beginner.slice(30).map((r) => r.accuracy));
  allPassed =
    check(
      "a complete beginner is not drowned",
      beginnerAcc > 0.5,
      `${(beginnerAcc * 100).toFixed(1)}% accuracy after 30 pages`,
    ) && allPassed;

  // An advanced reader should get a much denser page than a beginner.
  const advanced = run({ pages: 60, startingLevel: 6000, clickRate: 0.8, seed: 555 });
  const advDensity = mean(advanced.slice(30).map((r) => r.density));
  const begDensity = mean(beginner.slice(30).map((r) => r.density));
  allPassed =
    check(
      "an advanced reader gets a denser page than a beginner",
      advDensity > begDensity,
      `${begDensity.toFixed(2)} for the beginner, ${advDensity.toFixed(2)} for the advanced reader`,
    ) && allPassed;

  console.log("");
  console.log("=".repeat(96));
  console.log(allPassed ? "All checks passed." : "Some checks failed — see above.");
  console.log("=".repeat(96));
  console.log("");

  process.exit(allPassed ? 0 : 1);
}

main();
