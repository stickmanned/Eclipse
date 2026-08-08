/**
 * Talking to the model.
 *
 * Everything here was decided by measurement, in scripts/probe.ts,
 * scripts/latency.ts and bench/run.ts. The notes say which.
 */

import {
  SYSTEM_PROMPT,
  REPLY_SCHEMA,
  userMessage,
  type SwapReply,
  type SwapRequest,
} from "./prompt.js";
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

export async function rewrite(
  key: string,
  requests: SwapRequest[],
  model = DEFAULT_MODEL,
): Promise<ModelResult> {
  const started = Date.now();
  const out: ModelResult = { replies: new Map(), ms: 0, cost: 0 };
  if (requests.length === 0) return out;

  let res: Response;
  try {
    res = await fetch(`${BASE}/chat/completions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userMessage(requests) },
        ],
        temperature: 0.2,
        max_tokens: 4000,

        // Measured: this alone took a request from 1423ms to 729ms. Hack Club
        // is an OpenRouter proxy, which is not documented anywhere, but it
        // means OpenRouter's routing options work.
        provider: { sort: "latency" },

        // Also undocumented, also works. Without it we would be parsing the
        // model's prose, which breaks in far more ways.
        response_format: {
          type: "json_schema",
          json_schema: { name: "eclipse_swaps", strict: true, schema: REPLY_SCHEMA },
        },
      }),
    });
  } catch (err) {
    out.ms = Date.now() - started;
    out.error = err instanceof Error ? err.message : String(err);
    return out;
  }

  out.ms = Date.now() - started;
  const raw = await res.text();

  if (!res.ok) {
    out.error =
      res.status === 429
        ? "Rate limited — 750 requests per 30 minutes. Slow down or wait."
        : `HTTP ${res.status}. ${raw.slice(0, 120)}`;
    return out;
  }

  let body: { choices?: { message?: { content?: string } }[]; usage?: { cost?: number } };
  try {
    body = JSON.parse(raw);
  } catch {
    out.error = "the provider did not return JSON";
    return out;
  }

  out.cost = body.usage?.cost ?? 0;
  const content = body.choices?.[0]?.message?.content;
  if (!content) {
    out.error = "the model returned nothing";
    return out;
  }

  let parsed: { sentences?: SwapReply[] };
  try {
    parsed = JSON.parse(content);
  } catch {
    out.error = "the model's answer was not the shape we asked for";
    return out;
  }

  const byIndex = new Map((parsed.sentences ?? []).map((s) => [s.i, s]));

  for (const request of requests) {
    const reply = byIndex.get(request.i);
    if (!reply) continue;

    const checked = checkReply(request, reply);

    // A sentence that fails the checks is simply left in English. The reader
    // sees a normal page and notices nothing. Showing a mangled sentence
    // instead would be worse than doing nothing at all.
    if (checked.ok) out.replies.set(request.i, { text: reply.text, swaps: checked.swaps });
  }

  return out;
}
