/**
 * Checking the model's answer before it ever reaches the page.
 *
 * A sentence left in plain English is invisible — the reader simply sees a
 * normal page. A mangled sentence is worse than doing nothing, because it
 * teaches the wrong thing and looks broken. So anything that fails here is
 * thrown away rather than shown.
 */

import type { SwapReply, SwapRequest } from "./prompt.js";

export interface Checked {
  ok: boolean;
  /** Why it failed, for the bake-off report and for debugging. */
  problems: string[];
  /** Swaps that passed every check. Safe to render. */
  swaps: { zh: string; en: string }[];
}

const WORD_RE = /[A-Za-z][A-Za-z'’-]*/g;
const words = (s: string) => [...s.matchAll(WORD_RE)].map((m) => m[0].toLowerCase());

export function checkReply(request: SwapRequest, reply: SwapReply): Checked {
  const problems: string[] = [];
  const allowed = new Map(request.replace.map((r) => [r.zh, r.en]));

  if (!reply.text?.trim()) problems.push("no sentence returned");

  const text = reply.text ?? "";
  const swaps: { zh: string; en: string }[] = [];

  for (const used of reply.used ?? []) {
    // Rule 2: the model may only use the words we approved. Anything else is
    // the model choosing difficulty for itself, which is the one thing the
    // whole design exists to prevent.
    if (!allowed.has(used.zh)) {
      problems.push(`used ${used.zh}, which was not offered`);
      continue;
    }
    if (!text.includes(used.zh)) {
      problems.push(`claims to have used ${used.zh} but it is not in the sentence`);
      continue;
    }
    swaps.push(used);
  }

  // Rule 3: every English word we did not ask to replace must still be there,
  // in the same order. This catches the worst failure — the model quietly
  // translating or rewriting the whole sentence.
  const replacedSpans = swaps.map((s) => allowed.get(s.zh)!);
  let remaining = request.text;
  for (const span of replacedSpans) {
    remaining = remaining.replace(span, " ");
  }

  const expected = words(remaining);
  const got = words(text);
  let at = 0;
  const missing: string[] = [];
  for (const w of expected) {
    const found = got.indexOf(w, at);
    if (found === -1) missing.push(w);
    else at = found + 1;
  }

  if (missing.length) {
    problems.push(`English lost or reordered: ${missing.slice(0, 5).join(", ")}`);
  }

  // Rule 6: an English word glued directly to a Mandarin word with no space
  // reads as one broken word ("particular有") and the word-order check above
  // cannot see it, since it only checks that English words are present, not
  // that they are cleanly separated from the Chinese run next to them.
  if (JAMMED_RE.test(text)) {
    problems.push("English and Mandarin are jammed together with no space");
  }

  // A reply that runs away repeating itself ("...portion.组 the edible
  // portion.组 the edible portion...") is a known failure mode under a forced
  // JSON schema. The word-order check above cannot catch it: repeating a
  // required word only adds extra matches, it never removes one.
  if (text.length > request.text.length * MAX_GROWTH) {
    problems.push("reply is far longer than the sentence sent, likely a repetition loop");
  }

  // A reply that used nothing is not an error, but there is nothing to show.
  return { ok: problems.length === 0 && swaps.length > 0, problems, swaps };
}

const JAMMED_RE = /[A-Za-z][一-鿿]|[一-鿿][A-Za-z]/;
const MAX_GROWTH = 3;

/**
 * Does the sentence read like natural Mandarin, or like word for word
 * substitution?
 *
 * This is a hint for the bake-off report, not a pass or fail. Real Mandarin
 * runs characters together; a word for word swap leaves each Mandarin word
 * marooned between spaces. Counting Mandarin runs that are separated by
 * spaces is a rough but useful signal.
 */
export function looksWordForWord(text: string): boolean {
  const runs = text.match(/[一-鿿]+/g) ?? [];
  if (runs.length < 2) return false;
  const spaced = text.match(/[一-鿿]+\s+[一-鿿]+/g) ?? [];
  return spaced.length > 0;
}
