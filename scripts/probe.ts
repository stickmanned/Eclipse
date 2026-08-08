/**
 * Phase 0 probe. Answers the questions we guessed at while planning, before
 * we build anything on top of the guesses.
 *
 *   1. Does the key work?
 *   2. Does `response_format` reach the upstream model? The Hack Club docs do
 *      not list it, but OpenAI and Anthropic models are on the proxy, so it
 *      may pass through. If it works, we can drop the line parser.
 *   3. Which candidate models are fast enough, and do they write natural
 *      Mandarin when told exactly which words to use?
 *   4. What do the rate limit headers actually say?
 *
 * Set your key first. Any of these work:
 *   echo "HCAI_KEY=..." > .env
 *   $env:HCAI_KEY="..."
 *
 * Run: npm run probe
 */

import { loadKey } from "./key.js";

const BASE = "https://ai.hackclub.com/proxy/v1";
const KEY = loadKey();

/** Models worth testing. Chinese-strong small ones, plus a quality reference. */
const CANDIDATES = [
  "google/gemini-3.5-flash-lite",
  "qwen/qwen3.7-flash",
  "deepseek/deepseek-v4-flash-0731",
  "z-ai/glm-5.2",
  "inclusionai/ling-3.0-flash",
  "tencent/hy3",
  "google/gemini-3.6-flash",
  "anthropic/claude-sonnet-5",
];

interface CallResult {
  ok: boolean;
  status: number;
  text: string;
  ms: number;
  headers: Record<string, string>;
  error?: string;
}

async function call(body: unknown): Promise<CallResult> {
  const started = Date.now();
  try {
    const res = await fetch(`${BASE}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const ms = Date.now() - started;
    const raw = await res.text();

    const headers: Record<string, string> = {};
    res.headers.forEach((v, k) => {
      if (/rate|limit|remain|reset|retry/i.test(k)) headers[k] = v;
    });

    let text = raw;
    try {
      const json = JSON.parse(raw);
      text = json?.choices?.[0]?.message?.content ?? json?.error?.message ?? raw;
    } catch {
      /* keep the raw body so we can see what broke */
    }

    return { ok: res.ok, status: res.status, text, ms, headers };
  } catch (err) {
    return {
      ok: false,
      status: 0,
      text: "",
      ms: Date.now() - started,
      headers: {},
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

// ---------------------------------------------------------------------------
// The real task, so latency numbers mean something. Code has already chosen
// the words; the model only has to write the sentence.
// ---------------------------------------------------------------------------

const REWRITE_PROMPT = `You mix Mandarin into English sentences for a learner.

Rules:
1. Replace ONLY the meanings listed under ALLOWED. Use the exact Mandarin given.
2. Leave every other English word untouched, in its original order.
3. The result must read naturally. Replace a whole phrase if a single word
   would produce broken grammar. Adjust nearby English words if grammar needs it.
4. Output format, nothing else:
S| <the mixed sentence>
A| <mandarin> | <the English it replaced> | <accepted answers, comma separated>

ALLOWED:
- 有 = have / owns
- 一 + 个 = one / a
- 蓝色 = blue
- 苹果 = apple

SENTENCE:
Bob owns a blue apple, the apple is magical.`;

// ---------------------------------------------------------------------------

async function probeAuthAndModels() {
  console.log("=".repeat(72));
  console.log("1. Key and model list");
  console.log("=".repeat(72));

  const res = await fetch(`${BASE}/models`, {
    headers: { Authorization: `Bearer ${KEY}` },
  });
  console.log(`GET /models -> ${res.status} ${res.statusText}`);
  if (!res.ok) {
    console.log("Key rejected. Stopping.");
    process.exit(1);
  }
  const json = (await res.json()) as { data?: { id: string }[] };
  const ids = (json.data ?? []).map((m) => m.id);
  console.log(`${ids.length} models available`);
  const missing = CANDIDATES.filter((c) => !ids.includes(c));
  if (missing.length) console.log(`WARNING: not on the proxy: ${missing.join(", ")}`);
  console.log("");
}

async function probeStructuredOutput() {
  console.log("=".repeat(72));
  console.log("2. Does response_format pass through? (undocumented — worth knowing)");
  console.log("=".repeat(72));

  for (const model of ["openai/gpt-5.6-sol", "anthropic/claude-sonnet-5"]) {
    const r = await call({
      model,
      messages: [{ role: "user", content: 'Return the number 7 as {"n": 7}.' }],
      max_tokens: 64,
      temperature: 0,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "answer",
          strict: true,
          schema: {
            type: "object",
            properties: { n: { type: "integer" } },
            required: ["n"],
            additionalProperties: false,
          },
        },
      },
    });

    const verdict = !r.ok
      ? `REJECTED (${r.status}) — use the line parser`
      : /^\s*\{/.test(r.text)
        ? "ACCEPTED and returned JSON — we can drop the line parser"
        : "accepted but did not return JSON — treat as unsupported";
    console.log(`  ${model.padEnd(28)} ${verdict}`);
    if (!r.ok) console.log(`      ${r.text.slice(0, 160)}`);
  }
  console.log("");
}

async function probeRewrite() {
  console.log("=".repeat(72));
  console.log("3. Rewrite quality and latency (temperature 0.2)");
  console.log("=".repeat(72));

  for (const model of CANDIDATES) {
    const r = await call({
      model,
      messages: [{ role: "user", content: REWRITE_PROMPT }],
      temperature: 0.2,
      max_tokens: 400,
    });

    if (!r.ok) {
      console.log(`\n  ${model}\n    FAILED ${r.status} ${r.error ?? r.text.slice(0, 160)}`);
      continue;
    }

    // The three checks the extension will run for real.
    const sLine = r.text.match(/^S\|\s*(.+)$/m)?.[1]?.trim() ?? "";
    const aLines = [...r.text.matchAll(/^A\|/gm)].length;
    const usedAllowed = ["有", "蓝色", "苹果"].filter((w) => sLine.includes(w)).length;
    const keptEnglish = ["Bob", "magical"].every((w) => sLine.includes(w));

    console.log(`\n  ${model}   ${r.ms} ms`);
    console.log(`    ${sLine || "(no S| line — parser would reject this)"}`);
    console.log(
      `    format ${sLine ? "ok" : "BAD"} | ${aLines} A-lines | ` +
        `${usedAllowed}/3 allowed words | English kept: ${keptEnglish ? "yes" : "NO"}`,
    );
    if (Object.keys(r.headers).length) {
      console.log(`    headers: ${JSON.stringify(r.headers)}`);
    }
  }
  console.log("");
}

async function main() {
  await probeAuthAndModels();
  await probeStructuredOutput();
  await probeRewrite();

  console.log("=".repeat(72));
  console.log("Read the sentences above by hand. The question is not whether the");
  console.log("format parsed — it is whether the Mandarin reads naturally.");
  console.log("Watch for 蓝 苹果 (word-for-word, wrong) vs 蓝色的苹果 (natural).");
  console.log("=".repeat(72));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
