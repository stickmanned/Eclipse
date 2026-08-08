import { describe, expect, it } from "vitest";

import { getWord, lookupEnglish, swappability, WORD_COUNT } from "./words.js";
import { lemmaCandidates } from "./lemma.js";
import { LearnerStore, dayNumber } from "./store.js";
import { Ability, difficultyOf } from "./ability.js";
import {
  updateDials,
  newWordsAllowed,
  targetKnown,
  limitsFor,
  INTENSITY,
  type Dials,
  DEFAULT_TUNING,
  TARGET_ACCURACY,
} from "./balance.js";
import { markAnswer } from "./score.js";
import { findCandidates, planSentence, planScreen } from "./picker.js";

const EXAMPLE = "Bob owns a blue apple, the apple is magical.";

describe("word list", () => {
  it("is sorted so that a low ID means a common word", () => {
    expect(WORD_COUNT).toBeGreaterThan(10_000);
    // 的 是 不 are the most common words in Mandarin, so they must be near 0.
    for (const w of ["的", "是", "不", "我"]) {
      const id = lookupEnglish(getWord(0).meanings[0]!) && findId(w);
      expect(id).toBeLessThan(50);
    }
    // 苹果 (apple) is an everyday word but far less common than 的.
    expect(findId("苹果")).toBeGreaterThan(1000);
  });

  it("picks the dominant reading, not the first one alphabetically", () => {
    // The source lists forms alphabetically, which puts 说 = shuì ("persuade")
    // before 说 = shuō ("to speak"). A learner must see shuō.
    expect(getWord(findId("说")).pinyin).toBe("shuō");
    expect(getWord(findId("要")).pinyin).toBe("yào");
    expect(getWord(findId("个")).pinyin).toBe("gè");
  });

  it("splits packed glosses so all the synonyms survive", () => {
    // The source stores "to speak; to talk; to say" as one string.
    const m = getWord(findId("说")).meanings;
    expect(m).toContain("speak");
    expect(m).toContain("talk");
    expect(m).toContain("say");
  });

  it("marks particles as words we must never swap", () => {
    expect(swappability(findId("的"))).toBe(0); // structural particle
    expect(swappability(findId("苹果"))).toBe(2); // noun
    expect(swappability(findId("吃"))).toBe(2); // verb
  });

  it("prefers the common word when a rare one claims the same gloss", () => {
    // 一连 (rank ~9300, "in a row") lists "running" as a meaning. Taking the
    // exact match first would hand that to a learner instead of 走 (rank 84).
    const [best] = lookupEnglish("running");
    expect(best).toBeLessThan(1000);
  });
});

describe("lemmas", () => {
  it("finds the dictionary form of inflected words", () => {
    expect(lemmaCandidates("owns")).toContain("own");
    expect(lemmaCandidates("studies")).toContain("study");
    expect(lemmaCandidates("stopped")).toContain("stop");
    expect(lemmaCandidates("making")).toContain("make");
    expect(lemmaCandidates("is")).toContain("be");
    expect(lemmaCandidates("ate")).toContain("eat");
    expect(lemmaCandidates("children")).toContain("child");
    expect(lemmaCandidates("happily")).toContain("happy");
  });

  it("does not strip the s from words that are not plural", () => {
    expect(lemmaCandidates("bus")).not.toContain("bu");
    expect(lemmaCandidates("class")).not.toContain("clas");
  });

  it("lets the dictionary find inflected words on a real page", () => {
    for (const w of ["owns", "apples", "eats", "studied", "bigger", "children"]) {
      expect(lookupEnglish(w).length, `no match for "${w}"`).toBeGreaterThan(0);
    }
  });
});

describe("ability — what we believe about the learner", () => {
  it("says it does not know, rather than guessing, about a stranger", () => {
    const stranger = new Ability();
    const known = new Ability(difficultyOf(800), 0.3);

    // Faced with a hard word, someone we have never met should produce an
    // answer near a coin flip. Confidence has to be earned.
    const pStranger = stranger.pCorrect(difficultyOf(3000));
    const pKnown = known.pCorrect(difficultyOf(3000));
    expect(Math.abs(pStranger - 0.5)).toBeLessThan(Math.abs(pKnown - 0.5));
  });

  it("moves toward the evidence", () => {
    const up = new Ability(difficultyOf(1000), 1.0);
    for (let i = 0; i < 8; i++) up.observe(difficultyOf(3000), true);
    expect(up.level()).toBeGreaterThan(1000);

    const down = new Ability(difficultyOf(1000), 1.0);
    for (let i = 0; i < 8; i++) down.observe(difficultyOf(200), false);
    expect(down.level()).toBeLessThan(1000);
  });

  it("gets more sure as consistent answers come in", () => {
    const a = new Ability(difficultyOf(800), 1.5);
    const before = a.sigma;
    // Answers that match what we already expect: easy right, hard wrong.
    for (let i = 0; i < 10; i++) {
      a.observe(difficultyOf(100), true);
      a.observe(difficultyOf(6000), false);
    }
    expect(a.sigma).toBeLessThan(before);
  });

  it("gets less sure when the learner really shocks it", () => {
    const a = new Ability(difficultyOf(100), 0.3);
    const before = a.sigma;
    // We were almost certain they could not do this. They did it.
    a.observe(difficultyOf(11_000), true);
    expect(a.sigma).toBeGreaterThan(before);
  });

  it("is not shocked by an ordinary wrong answer", () => {
    // Eclipse aims at words with about an 85% chance, so roughly one in seven
    // is wrong by design. Treating those as shocks means uncertainty never
    // falls and the selector explores forever.
    const a = new Ability(difficultyOf(800), 0.4);
    const before = a.sigma;
    a.observe(difficultyOf(800), false);
    expect(a.sigma).toBeLessThanOrEqual(before);
  });

  it("loosens its belief while nobody is watching", () => {
    const a = new Ability(difficultyOf(800), 0.4);
    const before = a.sigma;
    a.drift(60);
    expect(a.sigma).toBeGreaterThan(before);
  });

  it("explores when unsure and settles when confident", () => {
    expect(new Ability(0, 2.2).explorationWeight()).toBeGreaterThan(0.35);
    expect(new Ability(0, 0.25).explorationWeight()).toBeLessThan(0.15);
  });

  it("wants to ask about words it cannot predict", () => {
    const a = new Ability(difficultyOf(800), 0.5);
    // A coin flip word teaches more than one they certainly know.
    expect(a.information(difficultyOf(800))).toBeGreaterThan(a.information(difficultyOf(5)));
    expect(a.information(difficultyOf(800))).toBeGreaterThan(a.information(difficultyOf(50_000)));
  });

  it("reports a range rather than a false precision", () => {
    const [lo, hi] = new Ability(difficultyOf(800), 1.0).levelRange();
    expect(lo).toBeLessThan(800);
    expect(hi).toBeGreaterThan(800);
  });
});

describe("learner store", () => {
  it("guesses from the level when it has no history", () => {
    const s = LearnerStore.atLevel(1200, 0.5);
    // An easy word is probably known, a hard one probably not.
    expect(s.probKnows(50)).toBeGreaterThan(0.85);
    expect(s.probKnows(10_000)).toBeLessThan(0.15);
  });

  it("treats a word seen but not clicked as almost no evidence", () => {
    const clicked = LearnerStore.atLevel(500);
    const glanced = LearnerStore.atLevel(500);
    clicked.answer(4000, true);
    glanced.glanced(4000);

    // Silence is not the same as understanding. One click must count for far
    // more than one scroll past.
    const moved = (s: typeof clicked) => Math.abs(s.ability.mu - LearnerStore.atLevel(500).ability.mu);
    expect(moved(glanced)).toBeLessThan(moved(clicked) / 3);
    expect(glanced.hasHistory(4000)).toBe(false);
  });

  it("becomes less sure after a long gap", () => {
    const s = LearnerStore.atLevel(800, 0.4);
    const today = dayNumber();
    s.catchUp(today);
    const before = s.ability.sigma;
    s.catchUp(today + 90);
    expect(s.ability.sigma).toBeGreaterThan(before);
  });

  it("forgets a word as time passes", () => {
    const s = LearnerStore.fresh();
    const today = dayNumber();
    s.answer(500, true, today);
    expect(s.probKnows(500, today)).toBeGreaterThan(0.9);
    expect(s.probKnows(500, today + 60)).toBeLessThan(s.probKnows(500, today + 1));
  });

  it("survives being saved and loaded", () => {
    const before = LearnerStore.fromHskLevel(4);
    before.answer(120, true);
    before.answer(3000, false);
    before.glanced(700);
    before.density = 0.37;
    before.newBudget = 1.5;

    const after = LearnerStore.fromBytes(before.toBytes());

    expect(after.n).toBe(before.n);
    expect(after.ability.mu).toBeCloseTo(before.ability.mu, 3);
    expect(after.ability.sigma).toBeCloseTo(before.ability.sigma, 3);
    expect(after.density).toBeCloseTo(0.37, 5);
    expect(after.newBudget).toBeCloseTo(1.5, 5);
    expect(after.asked[120]).toBe(1);
    expect(after.right[120]).toBe(1);
    expect(after.right[3000]).toBe(0);
    expect(after.shown[700]).toBe(1);
    expect(after.probKnows(120)).toBeCloseTo(before.probKnows(120), 5);
  });

  it("stays small enough to keep in memory", () => {
    expect(LearnerStore.fresh().byteSize()).toBeLessThan(300_000);
  });
});

describe("balance", () => {
  const start = { density: 0.3, newBudget: 1 };

  it("makes the page harder when the learner is doing too well", () => {
    const after = updateDials(start, { answered: 10, correct: 10 });
    expect(after.density).toBeGreaterThan(start.density);
  });

  it("makes the page easier when the learner is struggling", () => {
    const after = updateDials(start, { answered: 10, correct: 3 });
    expect(after.density).toBeLessThan(start.density);
  });

  // The step cap binds at ordinary error sizes, which is what keeps the loop
  // steady. To see the gain shape underneath it, these use a loose cap.
  const loose = { ...DEFAULT_TUNING, maxStep: 10 };

  it("pushes harder when the learner is really struggling than when they wobble", () => {
    const wobble = updateDials(start, { answered: 20, correct: 16 }, loose); // 80%, a dip
    const struggle = updateDials(start, { answered: 20, correct: 10 }, loose); // 50%, too far

    const perPoint = (after: { density: number }, accuracy: number) =>
      (start.density - after.density) / (TARGET_ACCURACY - accuracy);

    // This is the whole idea of Core #1: small corrections constantly, a big
    // one only when they have actually leaned too far.
    expect(perPoint(struggle, 0.5)).toBeGreaterThan(perPoint(wobble, 0.8));
  });

  it("never moves the dial further than one step, however bad the page", () => {
    const disaster = updateDials(start, { answered: 20, correct: 0 });
    expect(start.density - disaster.density).toBeLessThanOrEqual(DEFAULT_TUNING.maxStep + 1e-9);

    // Without this bound the same gain slams the dial between its limits page
    // after page, which is the opposite of balancing.
    const perfect = updateDials(start, { answered: 20, correct: 20 });
    expect(perfect.density - start.density).toBeLessThanOrEqual(DEFAULT_TUNING.maxStep + 1e-9);
  });

  it("ignores a batch with no answers", () => {
    expect(updateDials(start, { answered: 0, correct: 0 })).toEqual(start);
  });

  it("trusts a big batch more than a tiny one", () => {
    const tiny = updateDials(start, { answered: 1, correct: 0 }, loose);
    const big = updateDials(start, { answered: 20, correct: 0 }, loose);
    expect(start.density - big.density).toBeGreaterThan(start.density - tiny.density);
  });

  it("never allows more than two unseen words on a screen", () => {
    let d = { density: 0.3, newBudget: 2 };
    for (let i = 0; i < 50; i++) d = updateDials(d, { answered: 10, correct: 10 });
    expect(newWordsAllowed(d)).toBeLessThanOrEqual(2);
    expect(d.density).toBeLessThanOrEqual(0.6);
  });

  it("hunts harder words once swapping more of them runs out of room", () => {
    // A strong reader on a simple page pins the density dial at its maximum
    // and the page is still too easy. The only lever left is word difficulty.
    const easy = targetKnown({ density: 0.05, newBudget: 0 });
    const hard = targetKnown({ density: 0.6, newBudget: 2 });
    expect(easy).toBeGreaterThan(hard);
    expect(hard).toBeGreaterThan(0.5);
  });

  it("obeys a ceiling the reader sets, however well they do", () => {
    // Gentle means gentle. Twenty perfect pages must not push it past the cap.
    let d = { density: 0.3, newBudget: 1, ...limitsFor("gentle") };
    for (let i = 0; i < 40; i++) d = updateDials(d, { answered: 10, correct: 10 });

    expect(d.density).toBeLessThanOrEqual(INTENSITY.gentle.maxDensity + 1e-9);
    expect(newWordsAllowed(d)).toBeLessThanOrEqual(INTENSITY.gentle.maxNew);

    // And the ceiling must survive being passed through the loop, or it would
    // quietly go back to the default on the second page.
    expect(d.maxDensity).toBe(INTENSITY.gentle.maxDensity);
  });

  it("still balances underneath the ceiling rather than pinning to it", () => {
    // A struggling reader on "intense" must still get an easier page.
    let d = { density: 0.7, newBudget: 3, ...limitsFor("intense") };
    for (let i = 0; i < 10; i++) d = updateDials(d, { answered: 10, correct: 3 });
    expect(d.density).toBeLessThan(0.7);
  });

  it("keeps the reader's choice inside limits the design can defend", () => {
    // Even "intense" cannot turn the page fully Mandarin.
    let d: Dials = { density: 0.5, newBudget: 2, maxDensity: 5, maxNew: 99 };
    for (let i = 0; i < 60; i++) d = updateDials(d, { answered: 10, correct: 10 });
    expect(d.density).toBeLessThanOrEqual(0.85);
    expect(newWordsAllowed(d)).toBeLessThanOrEqual(3);
  });

  it("never drops to zero swaps", () => {
    let d = { density: 0.3, newBudget: 2 };
    for (let i = 0; i < 50; i++) d = updateDials(d, { answered: 10, correct: 0 });
    expect(d.density).toBeGreaterThan(0);
    expect(newWordsAllowed(d)).toBe(0);
  });
});

describe("marking answers", () => {
  const apple = ["apple"];

  it("accepts the right answer", () => {
    expect(markAnswer("apple", apple).verdict).toBe("right");
    expect(markAnswer("  Apple  ", apple).verdict).toBe("right");
  });

  it("accepts any of the meanings we know", () => {
    const speak = ["speak", "talk", "say"];
    for (const g of ["speak", "talk", "say", "to say"]) {
      expect(markAnswer(g, speak).verdict, g).toBe("right");
    }
  });

  it("forgives a small spelling mistake on a long word", () => {
    const m = markAnswer("aple", apple);
    expect(m.verdict).toBe("right");
    expect(m.typo).toBe(true);
  });

  it("does not forgive a one letter change on a short word", () => {
    // "cat" and "car" are one letter apart and mean different things.
    expect(markAnswer("car", ["cat"]).verdict).toBe("wrong");
  });

  it("accepts the head word of a longer meaning", () => {
    expect(markAnswer("aunt", ["maternal aunt"]).verdict).toBe("right");
  });

  it("flags a real word we do not recognise, but not gibberish", () => {
    expect(markAnswer("fruit", apple).worthAsking).toBe(true);
    expect(markAnswer("xqzk", apple).worthAsking).toBe(false);
  });

  it("reports an empty answer separately from a wrong one", () => {
    expect(markAnswer("   ", apple).verdict).toBe("empty");
  });
});

describe("picking what to swap", () => {
  it("never swaps an article on its own", () => {
    const s = LearnerStore.fromHskLevel(4);
    for (const c of findCandidates(EXAMPLE, s)) {
      expect(["a", "the", "an"]).not.toContain(c.english.toLowerCase());
    }
  });

  it("respects the new word cap", () => {
    const s = LearnerStore.fromHskLevel(1); // almost everything is unknown
    for (const budget of [0, 1, 2]) {
      const plan = planSentence(EXAMPLE, s, { density: 1, newBudget: budget });
      expect(plan.swaps.filter((x) => x.risky).length).toBeLessThanOrEqual(budget);
    }
  });

  it("does not swap the same word twice in one sentence", () => {
    const s = LearnerStore.fromHskLevel(4);
    const plan = planSentence(EXAMPLE, s, { density: 1, newBudget: 2 });
    const ids = plan.swaps.map((x) => x.wordId);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("swaps more as the density dial rises", () => {
    const s = LearnerStore.fromHskLevel(5);
    const low = planSentence(EXAMPLE, s, { density: 0.1, newBudget: 1 }).swaps.length;
    const high = planSentence(EXAMPLE, s, { density: 0.9, newBudget: 1 }).swaps.length;
    expect(high).toBeGreaterThan(low);
  });

  it("spends the new word budget across a whole screen, not per sentence", () => {
    const s = LearnerStore.fromHskLevel(1);
    const screen = [
      "The apple is red.",
      "A magical book appeared.",
      "She wrote a long letter.",
      "They ate dinner together.",
    ];
    const plans = planScreen(screen, s, { density: 1, newBudget: 2 });
    const risky = plans.flatMap((p) => p.swaps).filter((x) => x.risky);
    expect(risky.length).toBeLessThanOrEqual(2);
  });

  it("does not teach the same word twice on one screen", () => {
    const s = LearnerStore.fromHskLevel(5);
    const plans = planScreen(["The apple is red.", "I ate the apple."], s, {
      density: 1,
      newBudget: 2,
    });
    const ids = plans.flatMap((p) => p.swaps).map((x) => x.wordId);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("brings back a word the learner got wrong", () => {
    const s = LearnerStore.fromHskLevel(5);
    const appleId = findId("苹果");
    const before = planSentence(EXAMPLE, s, { density: 0.2, newBudget: 0 });

    s.answer(appleId, false); // they missed it
    const after = planSentence(EXAMPLE, s, { density: 0.2, newBudget: 0 });

    expect(after.swaps.some((x) => x.wordId === appleId)).toBe(true);
    expect(before.swaps.length).toBeGreaterThan(0);
  });

  it("returns nothing for text with no translatable words", () => {
    const s = LearnerStore.fromHskLevel(3);
    expect(planSentence("Zzz qqq xyzzy.", s, { density: 1, newBudget: 2 }).swaps).toHaveLength(0);
  });

  it("keeps swap positions inside the sentence and never overlapping", () => {
    const s = LearnerStore.fromHskLevel(6);
    const plan = planSentence(EXAMPLE, s, { density: 1, newBudget: 2 });
    let lastEnd = -1;
    for (const sw of plan.swaps) {
      expect(sw.start).toBeGreaterThanOrEqual(lastEnd);
      expect(sw.end).toBeLessThanOrEqual(EXAMPLE.length);
      expect(EXAMPLE.slice(sw.start, sw.end)).toBe(sw.english);
      lastEnd = sw.end;
    }
  });
});

/** Find a word's ID by its characters. Only used by tests. */
function findId(simplified: string): number {
  for (let i = 0; i < WORD_COUNT; i++) if (getWord(i).simplified === simplified) return i;
  throw new Error(`${simplified} is not in the word list`);
}
