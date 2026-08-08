/**
 * Talking to the model.
 *
 * Everything here was decided by measurement, in scripts/probe.ts,
 * scripts/latency.ts and bench/run.ts. The notes say which.
 */

import { SYSTEM_PROMPT, userMessage, parseReply, type SwapReply, type SwapRequest } from "./prompt.js";
import { checkReply } from "./validate.js";

const BASE = "https://ai.hackclub.com/proxy/v1";

/**
 * Chosen by bake-off, not by reputation.
 *
 * It was fastest, ten to thirty times cheaper than anything else that worked,
 * and it applied the most swaps. Every model that beat it on writing quality
 * was a reasoning model, which is the wrong tool here: code has already made
 * every decision, so thinking about it is pure waste. One of them cost about
 * twenty cents a page.
 */
export const DEFAULT_MODEL = "google/gemini-3.5-flash-lite";

export interface ModelResult {
  replies: Map<number, { text: string; swaps: { zh: string; en: string }[] }>;
  ms: number;
  cost: number;
  error?: string;
}

interface OneResult {
  reply?: SwapReply;
  cost: number;
  error?: string;
}

async function rewriteOne(key: string, request: SwapRequest, model: string): Promise<OneResult> {
  let res: Response;
  try {
    res = await fetch(`${BASE}/chat/completions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userMessage(request) },
        ],
        temperature: 0.2,

        // frequency_penalty helps with garden-variety repetition in normal
        // decoding. It does NOT fix the schema-locked repetition loop this
        // codebase used to hit — that is why we don't force a schema in the
        // first place. See the comment on SYSTEM_PROMPT in prompt.ts.
        frequency_penalty: 0.4,

        // One sentence in, one sentence out. Generous but bounded.
        max_tokens: Math.min(1000, request.text.length * 2 + 200),

        provider: { sort: "latency" },
      }),
    });
  } catch (err) {
    return { cost: 0, error: err instanceof Error ? err.message : String(err) };
  }

  const raw = await res.text();
  if (!res.ok) {
    return {
      cost: 0,
      error:
        res.status === 429
          ? "Rate limited — 750 requests per 30 minutes. Slow down or wait."
          : `HTTP ${res.status}. ${raw.slice(0, 120)}`,
    };
  }

  let body: { choices?: { message?: { content?: string } }[]; usage?: { cost?: number } };
  try {
    body = JSON.parse(raw);
  } catch {
    return { cost: 0, error: "the provider did not return JSON" };
  }

  const cost = body.usage?.cost ?? 0;
  const content = body.choices?.[0]?.message?.content;
  if (!content) return { cost, error: "the model returned nothing" };

  return { reply: parseReply(content), cost };
}

/**
 * Each sentence gets its own request, in flight together rather than folded
 * into one shared completion. Batching cost less and used less of the rate
 * limit — see git history for that version — but this is what was asked for.
 */
export async function rewrite(
  key: string,
  requests: SwapRequest[],
  model = DEFAULT_MODEL,
): Promise<ModelResult> {
  const started = Date.now();
  const out: ModelResult = { replies: new Map(), ms: 0, cost: 0 };
  if (requests.length === 0) return out;

  const results = await Promise.all(requests.map((r) => rewriteOne(key, r, model)));

  for (let idx = 0; idx < requests.length; idx++) {
    const request = requests[idx]!;
    const result = results[idx]!;
    out.cost += result.cost;

    if (result.error) {
      out.error = result.error;
      continue;
    }
    if (!result.reply) continue;

    const checked = checkReply(request, result.reply);

    // A sentence that fails the checks is simply left in English. The reader
    // sees a normal page and notices nothing. Showing a mangled sentence
    // instead would be worse than doing nothing at all.
    if (checked.ok) out.replies.set(request.i, { text: result.reply.text, swaps: checked.swaps });
  }

  out.ms = Date.now() - started;
  return out;
}
