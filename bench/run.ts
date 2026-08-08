/**
 * The bake-off. Picks the model by measuring, not by guessing.
 *
 * Every model gets exactly the same input: the same sentences, with the same
 * words already chosen by the engine. The only thing that varies is the model.
 *
 * Run: npx tsx bench/run.ts [--models a,b,c] [--sentences 12]
 */

import { writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { loadKey } from "../scripts/key.js";
import { LearnerStore } from "../src/engine/store.js";
import { planScreen } from "../src/engine/picker.js";
import {
  SYSTEM_PROMPT,
  REPLY_SCHEMA,
  buildRequests,
  userMessage,
  type SwapReply,
  type SwapRequest,
} from "../src/background/prompt.js";
import { checkReply, looksWordForWord } from "../src/background/validate.js";
import { CORPUS } from "./corpus.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const BASE = "https://ai.hackclub.com/proxy/v1";
const KEY = loadKey();

/**
 * Candidates.
 *
 * Reasoning models are excluded on purpose. The probe measured them spending
 * 900 to 2000 tokens thinking about a job where code has already made every
 * decision. One of them cost nine tenths of a cent for a single sentence,
 * which works out to about twenty cents a page. Thinking is waste here.
 */
const DEFAULT_MODELS = [
  "google/gemini-3.5-flash-lite",
  "inclusionai/ling-3.0-flash",
  "inclusionai/ling-3.0-tiny:free",
  "meta/muse-spark-1.2",
  "poolside/laguna-xs-2.1:free",
  "openai/gpt-5.6-sol",
  "anthropic/claude-opus-5-fast",
  "anthropic/claude-sonnet-5",
];

const arg = (name: string) => {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
};

const MODELS = arg("models")?.split(",") ?? DEFAULT_MODELS;
const SENTENCE_COUNT = Number(arg("sentences") ?? 12);
const TEMPERATURE = Number(arg("temperature") ?? 0.2);

// ---------------------------------------------------------------------------
// Build one fixed set of work, so every model is asked the same thing.
// ---------------------------------------------------------------------------

function buildWork(): SwapRequest[] {
  const store = LearnerStore.fromHskLevel(4);
  const sentences = CORPUS.slice(0, SENTENCE_COUNT);
  const plans = planScreen(sentences, store, { density: 0.5, newBudget: 2 });
  return buildRequests(plans);
}

// ---------------------------------------------------------------------------

interface Score {
  model: string;
  ok: boolean;
  ms: number;
  cost: number;
  reasoningTokens: number;
  outputTokens: number;
  /** Sentences that passed every check, out of those we asked for. */
  valid: number;
  asked: number;
  /** Swaps actually rendered, out of those requested. */
  swapsUsed: number;
  swapsAsked: number;
  skipped: number;
  wordForWord: number;
  problems: string[];
  samples: string[];
  error?: string;
}

async function score(model: string, work: SwapRequest[]): Promise<Score> {
  const base: Score = {
    model, ok: false, ms: 0, cost: 0, reasoningTokens: 0, outputTokens: 0,
    valid: 0, asked: work.length, swapsUsed: 0,
    swapsAsked: work.reduce((s, w) => s + w.replace.length, 0),
    skipped: 0, wordForWord: 0, problems: [], samples: [],
  };

  const started = Date.now();
  let res: Response;
  try {
    res = await fetch(`${BASE}/chat/completions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userMessage(work) },
        ],
        temperature: TEMPERATURE,
        // Generous. The probe showed a tight cap silently truncates, which
        // looks exactly like a format failure and hides the real cause.
        max_tokens: 4000,
        response_format: {
          type: "json_schema",
          json_schema: { name: "eclipse_swaps", strict: true, schema: REPLY_SCHEMA },
        },
      }),
    });
  } catch (err) {
    return { ...base, ms: Date.now() - started, error: String(err) };
  }

  base.ms = Date.now() - started;
  const raw = await res.text();
  if (!res.ok) return { ...base, error: `HTTP ${res.status}: ${raw.slice(0, 200)}` };

  let body: any;
  try {
    body = JSON.parse(raw);
  } catch {
    return { ...base, error: "response was not JSON" };
  }

  base.cost = body?.usage?.cost ?? 0;
  base.reasoningTokens = body?.usage?.completion_tokens_details?.reasoning_tokens ?? 0;
  base.outputTokens = body?.usage?.completion_tokens ?? 0;

  const content = body?.choices?.[0]?.message?.content;
  if (!content) {
    return { ...base, error: `empty content (finish: ${body?.choices?.[0]?.finish_reason})` };
  }

  let parsed: { sentences?: SwapReply[] };
  try {
    parsed = JSON.parse(content);
  } catch {
    return { ...base, error: `content was not JSON: ${String(content).slice(0, 120)}` };
  }

  const byIndex = new Map((parsed.sentences ?? []).map((s) => [s.i, s]));

  for (const request of work) {
    const reply = byIndex.get(request.i);
    if (!reply) {
      base.problems.push(`[${request.i}] no reply`);
      continue;
    }

    const checked = checkReply(request, reply);
    base.skipped += reply.skipped?.length ?? 0;

    if (checked.ok) {
      base.valid++;
      base.swapsUsed += checked.swaps.length;
      if (looksWordForWord(reply.text)) base.wordForWord++;
      if (base.samples.length < 3) base.samples.push(reply.text);
    } else {
      base.problems.push(`[${request.i}] ${checked.problems.join("; ")}`);
    }
  }

  base.ok = base.valid > 0;
  return base;
}

// ---------------------------------------------------------------------------

async function main() {
  const work = buildWork();

  console.log("");
  console.log("=".repeat(94));
  console.log(`Eclipse model bake-off — ${work.length} sentences, temperature ${TEMPERATURE}`);
  console.log("Same sentences and same chosen words for every model.");
  console.log("=".repeat(94));
  console.log("");
  console.log("What the engine asked for:");
  for (const w of work.slice(0, 3)) {
    console.log(`  [${w.i}] ${w.text}`);
    console.log(`        ${w.replace.map((r) => `${r.en}->${r.zh}`).join("  ")}`);
  }
  console.log(`  ... and ${Math.max(0, work.length - 3)} more`);
  console.log("");

  const results: Score[] = [];
  for (const model of MODELS) {
    process.stdout.write(`  ${model.padEnd(32)} `);
    const s = await score(model, work);
    results.push(s);
    if (s.error) console.log(`FAILED — ${s.error.slice(0, 60)}`);
    else console.log(`${s.valid}/${s.asked} valid, ${(s.ms / 1000).toFixed(1)}s, $${s.cost.toFixed(5)}`);
  }

  // -------------------------------------------------------------------------
  console.log("");
  console.log("=".repeat(94));
  console.log("model                            valid  swaps   think   time    cost/page  natural");
  console.log("-".repeat(94));

  const usable = results.filter((r) => !r.error).sort((a, b) => {
    const rate = (x: Score) => x.valid / Math.max(1, x.asked);
    return rate(b) - rate(a) || a.cost - b.cost;
  });

  for (const r of usable) {
    // A real page holds far more than our sample, so scale the cost up to
    // something that means something.
    const costPerPage = (r.cost / Math.max(1, r.asked)) * 20;
    const natural = r.valid ? `${r.valid - r.wordForWord}/${r.valid}` : "-";
    console.log(
      `${r.model.padEnd(32)} ${String(r.valid).padStart(2)}/${String(r.asked).padEnd(3)} ` +
        `${String(r.swapsUsed).padStart(2)}/${String(r.swapsAsked).padEnd(4)} ` +
        `${String(r.reasoningTokens).padStart(5)}  ${(r.ms / 1000).toFixed(1)}s   ` +
        `$${costPerPage.toFixed(4)}    ${natural}`,
    );
  }

  for (const r of results.filter((x) => x.error)) {
    console.log(`${r.model.padEnd(32)} FAILED — ${r.error!.slice(0, 50)}`);
  }

  console.log("");
  console.log("  valid    sentences that passed every check");
  console.log("  swaps    words actually swapped, out of those the engine asked for");
  console.log("  think    reasoning tokens — wasted on this job, code already decided");
  console.log("  natural  sentences that did NOT read as word for word substitution");
  console.log("");

  // -------------------------------------------------------------------------
  console.log("=".repeat(94));
  console.log("Sentences, to read by hand. The format passing is not the point.");
  console.log("=".repeat(94));
  for (const r of usable.slice(0, 5)) {
    console.log(`\n  ${r.model}`);
    for (const s of r.samples) console.log(`    ${s}`);
    if (r.problems.length) console.log(`    problems: ${r.problems.slice(0, 2).join(" | ")}`);
  }

  const report = [
    `# Model bake-off`,
    ``,
    `${work.length} sentences, temperature ${TEMPERATURE}, run ${new Date().toISOString()}.`,
    `Every model got the same sentences with the same words already chosen by the engine.`,
    ``,
    `| model | valid | swaps used | reasoning tokens | time | cost/page | natural |`,
    `|---|---|---|---|---|---|---|`,
    ...usable.map((r) => {
      const costPerPage = (r.cost / Math.max(1, r.asked)) * 20;
      return `| \`${r.model}\` | ${r.valid}/${r.asked} | ${r.swapsUsed}/${r.swapsAsked} | ${r.reasoningTokens} | ${(r.ms / 1000).toFixed(1)}s | $${costPerPage.toFixed(4)} | ${r.valid - r.wordForWord}/${r.valid} |`;
    }),
    ...results.filter((r) => r.error).map((r) => `| \`${r.model}\` | FAILED | ${r.error} | | | | |`),
    ``,
    `## Sentences`,
    ...usable.flatMap((r) => [``, `**${r.model}**`, ``, ...r.samples.map((s) => `- ${s}`)]),
  ].join("\n");

  writeFileSync(join(ROOT, "bench", "report.md"), report);
  console.log("\nWritten to bench/report.md\n");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
