/**
 * What we ask the model to do, and the shape we demand back.
 *
 * The model's job is deliberately small. Code has already chosen every word to
 * swap and how many. All that is left is writing one sentence so it reads
 * well. Small jobs fail less.
 */

import type { Candidate } from "../engine/picker.js";

export interface SwapRequest {
  /** Index of the sentence, so a reply can be matched back to its DOM node. */
  i: number;
  text: string;
  /** English span -> exact Mandarin word. Chosen by code, not by the model. */
  replace: { en: string; zh: string }[];
}

export interface SwapReply {
  /** The mixed sentence. */
  text: string;
  /** Which replacements were actually used, and what they replaced. */
  used: { zh: string; en: string }[];
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
 *
 * We ask for delimited lines here, not a JSON schema, even though this proxy
 * accepts `response_format: json_schema`. Forcing schema-constrained decoding
 * on `google/gemini-3.5-flash-lite` is a known trigger for a token-repetition
 * loop documented across Google's own AI developer forum and multiple
 * inference-engine bug trackers (vLLM, Ollama) for this model family — the
 * grammar mask narrows token choice at every step, and once the model's
 * distribution degenerates toward one token the grammar has no way to reject
 * it, so it repeats until it happens to recover or runs out of tokens.
 * Reported fixes there converge on one thing: drop the schema. Free-form
 * lines avoid the trigger entirely, and cost fewer tokens besides.
 *
 * One sentence per request now (batching was retired), so there is nothing
 * left to disambiguate — no index in the prompt or the reply, just the
 * sentence and its swaps.
 */
export const SYSTEM_PROMPT = `You mix Mandarin words into an English sentence for someone learning Mandarin.

You get a sentence and a list of replacements. Each gives an English word or
phrase and the exact Mandarin word to use in its place.

Rules:
1. Use every replacement, UNLESS the Mandarin word given does not fit what the
   sentence actually means. In that case leave that one out. A wrong word is
   much worse than a missing one.
2. Use the exact Mandarin word given. Never substitute a different word.
3. Leave every other English word alone, in its original order. Never translate
   the whole sentence. Most of it must stay English.
4. You MAY add small Mandarin grammar words the sentence needs to read
   correctly, such as 的, 了, 一个, 是. These are glue, not replacements, and you
   do not report them. Without them the result reads like broken Chinese:
     wrong:  Bob 有 一个 蓝色 苹果
     right:  Bob 有一个蓝色的苹果
5. Keep the original punctuation and capitalisation of the English parts.
6. Always put a space between an English word and a Mandarin word or phrase
   next to it, on both sides. Never let them touch directly:
     wrong:  particular有 long / 是the answer
     right:  particular 有 long / 是 the answer

Output format, nothing else:
<the mixed sentence>
A| <the Mandarin word you used> | <the English it replaced>

One line for the sentence, first. One A| line under it per replacement you
actually used — omit the line entirely for any you left out under rule 1. No
other text: no commentary, no markdown, no code fences, no blank lines.`;

/** Turn planned swaps into one request per sentence. */
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

export function userMessage(request: SwapRequest): string {
  return request.text + "\n" + request.replace.map((x) => `    ${x.en} -> ${x.zh}`).join("\n");
}

const A_LINE = /^A\|\s*([^|]+?)\s*\|\s*(.+)$/;

/** Parse one sentence's delimited-line reply. */
export function parseReply(content: string): SwapReply {
  const used: { zh: string; en: string }[] = [];
  let text = "";

  for (const line of content.split(/\r?\n/)) {
    const a = line.match(A_LINE);
    if (a) {
      used.push({ zh: a[1]!.trim(), en: a[2]!.trim() });
      continue;
    }
    if (!text && line.trim()) text = line.trim();
  }

  return { text, used };
}
