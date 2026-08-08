/**
 * The service worker. Everything that decides anything lives here.
 *
 * It owns the word list, the learner's record, the difficulty dials and the
 * model key. The page never sees any of it — the content script only receives
 * finished sentences and sends back what the reader typed.
 *
 * Remember that this worker is shut down after about thirty seconds idle, so
 * every piece of state is read from IndexedDB on wake and written back after
 * each screen.
 */

import { LearnerStore, dayNumber } from "../engine/store.js";
import { planScreen } from "../engine/picker.js";
import { updateDials, limitsFor, type Intensity } from "../engine/balance.js";
import { markAnswer } from "../engine/score.js";
import { getWord } from "../engine/words.js";
import { buildRequests } from "./prompt.js";
import { rewrite, DEFAULT_MODEL } from "./model.js";
import * as db from "./db.js";
import type { FromWorker, RenderSentence, Status, ToWorker } from "../shared/messages.js";

// ---------------------------------------------------------------------------
// Settings, kept in chrome.storage so the options page can edit them.
// ---------------------------------------------------------------------------

interface Settings {
  apiKey: string;
  model: string;
  /** Sites the reader has switched on. Off everywhere by default. */
  enabledHosts: string[];
  hskLevel: number;
  /** How much Mandarin the reader wants on screen. A ceiling, not a target. */
  intensity: Intensity;
}

const DEFAULTS: Settings = {
  apiKey: "",
  model: DEFAULT_MODEL,
  enabledHosts: [],
  hskLevel: 1,
  intensity: "normal",
};

async function settings(): Promise<Settings> {
  return { ...DEFAULTS, ...(await chrome.storage.local.get(DEFAULTS)) } as Settings;
}

/**
 * Sites Eclipse must never touch, whatever the reader has switched on.
 *
 * Page text is sent to someone else's server. That is fine on a news article
 * and absolutely not fine on a bank statement or a private inbox. This list
 * cannot be turned off from the interface on purpose.
 */
const NEVER = [
  "bank", "chase.", "paypal", "wellsfargo", "hsbc", "barclays", "revolut", "monzo",
  "mail.google", "outlook.", "proton.me", "icloud.com",
  "health", "nhs.uk", "mychart",
  "accounts.google", "login.", "signin.", "auth.",
  "localhost", "127.0.0.1", "chrome.google.com", "chromewebstore.google.com",
];

function blocked(host: string): boolean {
  const h = host.toLowerCase();
  return NEVER.some((bad) => h.includes(bad));
}

// ---------------------------------------------------------------------------
// The learner's record. Loaded once per wake, written back debounced.
// ---------------------------------------------------------------------------

let store: LearnerStore | undefined;
let saveTimer: ReturnType<typeof setTimeout> | undefined;
let lastError: string | undefined;
let answeredToday = 0;
let correctToday = 0;
let todayIs = dayNumber();

async function getStore(): Promise<LearnerStore> {
  if (store) return store;

  const bytes = await db.loadState();
  if (bytes) {
    try {
      store = LearnerStore.fromBytes(new Uint8Array(bytes));
    } catch {
      // A record we cannot read is not worth crashing over. The answer log
      // survives regardless, which is the part that actually matters.
      store = undefined;
    }
  }

  if (!store) {
    const { hskLevel } = await settings();
    store = LearnerStore.fromHskLevel(hskLevel);
  }

  // Time has passed since we last saw this reader. We know less than we did.
  store.catchUp();
  return store;
}

function saveSoon(): void {
  if (saveTimer) return;
  saveTimer = setTimeout(() => {
    saveTimer = undefined;
    if (store) void db.saveState(store.toBytes());
  }, 3000);
}

function rollDayIfNeeded(): void {
  const now = dayNumber();
  if (now !== todayIs) {
    todayIs = now;
    answeredToday = 0;
    correctToday = 0;
  }
}

// ---------------------------------------------------------------------------
// Planning a screen.
// ---------------------------------------------------------------------------

/** Answers the reader typed that we could not match, waiting to be asked about. */
const pendingSwaps = new Map<number, { accepted: string[]; shownAs: string; host: string }>();

async function planFor(sentences: string[], host: string): Promise<FromWorker> {
  const config = await settings();

  if (blocked(host)) return { type: "plan:off", reason: "Eclipse never runs on this kind of site." };
  if (!config.enabledHosts.includes(host)) return { type: "plan:off", reason: "not switched on here" };
  if (!config.apiKey) return { type: "plan:off", reason: "no API key — open the options page" };

  const s = await getStore();
  const dials = {
    density: s.density,
    newBudget: s.newBudget,
    ...limitsFor(config.intensity),
  };
  const plans = planScreen(sentences, s, dials);

  // What we can answer from the cache is free, and scrolling back over a page
  // we have already paid for must stay free.
  const out: RenderSentence[] = [];
  const needed: typeof plans = [];
  const neededIndex: number[] = [];

  for (let i = 0; i < plans.length; i++) {
    const plan = plans[i]!;
    if (plan.swaps.length === 0) continue;

    const key = db.cacheKey(plan.text, plan.swaps.map((x) => x.wordId));
    const hit = (await db.cacheGet(key)) as RenderSentence | undefined;
    if (hit) {
      out.push({ ...hit, i });
      continue;
    }
    needed.push(plan);
    neededIndex.push(i);
  }

  if (needed.length > 0) {
    const requests = buildRequests(needed);
    const result = await rewrite(config.apiKey, requests, config.model);
    lastError = result.error;

    for (const [requestIndex, reply] of result.replies) {
      const plan = needed[requestIndex];
      if (!plan) continue;

      const swaps = reply.swaps
        .map((sw) => {
          const chosen = plan.swaps.find((c) => c.mandarin === sw.zh);
          if (!chosen) return undefined;
          const word = getWord(chosen.wordId);
          return {
            zh: sw.zh,
            en: sw.en,
            wordId: chosen.wordId,
            pinyin: word.pinyin,
            // The dictionary meanings plus the English the model actually
            // replaced. That second part matters: 有 is glossed "have", but if
            // it stood in for "owns" then "owns" has to count as right.
            accepted: [...new Set([...word.meanings, sw.en.toLowerCase()])],
          };
        })
        .filter((x): x is NonNullable<typeof x> => x !== undefined);

      if (swaps.length === 0) continue;

      const rendered: RenderSentence = { i: neededIndex[requestIndex]!, text: reply.text, swaps };
      out.push(rendered);
      void db.cachePut(db.cacheKey(plan.text, plan.swaps.map((x) => x.wordId)), rendered);
    }
  }

  for (const sentence of out) {
    for (const sw of sentence.swaps) {
      const s2 = await getStore();
      s2.markShown(sw.wordId);
      pendingSwaps.set(sw.wordId, { accepted: sw.accepted, shownAs: sw.zh, host });
    }
  }

  saveSoon();
  return { type: "plan:ok", sentences: out };
}

// ---------------------------------------------------------------------------
// Marking an answer. No model call — the reader must see the result at once.
// ---------------------------------------------------------------------------

async function answerFor(wordId: number, typed: string): Promise<FromWorker> {
  rollDayIfNeeded();
  const s = await getStore();
  const pending = pendingSwaps.get(wordId);
  const word = getWord(wordId);
  const accepted = pending?.accepted ?? word.meanings;

  const marked = markAnswer(typed, accepted);
  const correct = marked.verdict === "right";

  if (marked.verdict !== "empty") {
    s.answer(wordId, correct);
    answeredToday++;
    if (correct) correctToday++;

    void db.appendLog({
      ts: Date.now(),
      wordId,
      shownAs: pending?.shownAs ?? word.simplified,
      typed,
      correct,
      host: pending?.host ?? "",
    });

    const { intensity } = await settings();
    const next = updateDials(
      { density: s.density, newBudget: s.newBudget, ...limitsFor(intensity) },
      { answered: answeredToday, correct: correctToday },
    );
    s.density = next.density;
    s.newBudget = next.newBudget;
    saveSoon();
  }

  return {
    type: "answer:ok",
    correct,
    answer: `${word.simplified} (${word.pinyin}) — ${word.meanings.slice(0, 3).join(", ")}`,
    typo: marked.typo,
  };
}

// ---------------------------------------------------------------------------

async function statusFor(host?: string): Promise<Status> {
  const config = await settings();
  const s = await getStore();
  let met = 0;
  for (let i = 0; i < s.n; i++) if (s.asked[i]! > 0) met++;

  return {
    enabledHere: host ? config.enabledHosts.includes(host) && !blocked(host) : false,
    hasKey: config.apiKey.length > 0,
    answeredToday,
    correctToday,
    level: s.ability.level(),
    levelRange: s.ability.levelRange(),
    wordsMet: met,
    density: s.density,
    newBudget: s.newBudget,
    intensity: config.intensity,
    lastError,
  };
}

// ---------------------------------------------------------------------------

chrome.runtime.onMessage.addListener((msg: ToWorker, _sender, reply) => {
  (async (): Promise<FromWorker> => {
    switch (msg.type) {
      case "plan":
        return await planFor(msg.sentences, msg.host);

      case "answer":
        return await answerFor(msg.wordId, msg.typed);

      case "glanced": {
        const s = await getStore();
        for (const id of msg.wordIds) s.glanced(id);
        saveSoon();
        return { type: "ok" };
      }

      case "status":
        return { type: "status:ok", status: await statusFor(msg.host) };

      case "forget": {
        await db.clearAll();
        store = undefined;
        pendingSwaps.clear();
        answeredToday = 0;
        correctToday = 0;
        return { type: "ok" };
      }

      case "setEnabled": {
        const config = await settings();
        const hosts = new Set(config.enabledHosts);
        if (msg.on) hosts.add(msg.host);
        else hosts.delete(msg.host);
        await chrome.storage.local.set({ enabledHosts: [...hosts] });
        return { type: "ok" };
      }

      default:
        return { type: "error", message: "unknown message" };
    }
  })()
    .then(reply)
    .catch((err: unknown) =>
      reply({ type: "error", message: err instanceof Error ? err.message : String(err) }),
    );

  return true; // we will answer later
});
