/**
 * What we ask the model to do, and the shape we demand back.
 *
 * The model's job is deliberately small. Code has already chosen every word to
 * swap and how many. All that is left is writing one sentence so it reads
 * well. Small jobs fail less.
 */

import type { Candidate } from "../engine/picker.js";

export interface SwapRequest {
  /** Index of the sentence, so answers can be matched to questions. */
  i: number;
  text: string;
  /** English span -> exact Mandarin word. Chosen by code, not by the model. */
  replace: { en: string; zh: string }[];
}

export interface SwapReply {
  i: number;
  /** The mixed sentence. */
  text: string;
  /** Which replacements were actually used, and what they replaced. */
  used: { zh: string; en: string }[];
  /** Replacements left out because they would have changed the meaning. */
  skipped?: string[];
}

/**
 * The instructions.
 *
 * Two lines here were written after watching real models get it wrong.
 *
 * Rule 4 exists because every model tested, including the most expensive one,
 * produced "Bob 有 一个 蓝色 苹果" — a word for word swap that no native
 * speaker would write. They followed "use exactly these words" so literally
 * that they refused to add 的. Saying the glue is allowed fixes it.
 *
 * Rule 1 exists because a bilingual dictionary is noisy. One English word maps
 * to several Mandarin words with different senses, and code cannot tell which
 * one fits a sentence it has not read. The model has read it, so the model
 * gets a veto. A skipped swap is a normal outcome, not a failure.
 */
export const SYSTEM_PROMPT = `You mix Mandarin words into English sentences for someone learning Mandarin.

For each sentence you get a list of replacements. Each gives an English word or
phrase and the exact Mandarin word to use in its place.

Rules:
1. Use every replacement, UNLESS the Mandarin word given does not fit what the
   sentence actually means. In that case leave that one out and list it under
   "skipped". A wrong word is much worse than a missing one.
2. Use the exact Mandarin word given. Never substitute a different word.
3. Leave every other English word alone, in its original order. Never translate
   the whole sentence. Most of it must stay English.
4. You MAY add small Mandarin grammar words the sentence needs to read
   correctly, such as 的, 了, 一个, 是. These are glue, not replacements, and you
   do not list them. Without them the result reads like broken Chinese:
     wrong:  Bob 有 一个 蓝色 苹果
     right:  Bob 有一个蓝色的苹果
5. Keep the original punctuation and capitalisation of the English parts.`;

/** The shape we demand back. Structured output is supported, so we use it. */
export const REPLY_SCHEMA = {
  type: "object",
  properties: {
    sentences: {
      type: "array",
      items: {
        type: "object",
        properties: {
          i: { type: "integer", description: "the index you were given" },
          text: { type: "string", description: "the mixed sentence" },
          used: {
            type: "array",
            items: {
              type: "object",
              properties: {
                zh: { type: "string", description: "the Mandarin word you used" },
                en: { type: "string", description: "the English words it replaced" },
              },
              required: ["zh", "en"],
              additionalProperties: false,
            },
          },
          skipped: {
            type: "array",
            items: { type: "string" },
            description: "Mandarin words you left out because they did not fit",
          },
        },
        required: ["i", "text", "used", "skipped"],
        additionalProperties: false,
      },
    },
  },
  required: ["sentences"],
  additionalProperties: false,
} as const;

/** Turn planned swaps into the request body for one screenful. */
export function buildRequests(
  plans: readonly { text: string; swaps: readonly Candidate[] }[],
): SwapRequest[] {
  return plans
    .map((plan, i) => ({
      i,
      text: plan.text,
      replace: plan.swaps.map((s) => ({ en: s.english, zh: s.mandarin })),
    }))
    .filter((r) => r.replace.length > 0);
}

export function userMessage(requests: readonly SwapRequest[]): string {
  return requests
    .map(
      (r) =>
        `[${r.i}] ${r.text}\n` +
        r.replace.map((x) => `    ${x.en} -> ${x.zh}`).join("\n"),
    )
    .join("\n\n");
}
