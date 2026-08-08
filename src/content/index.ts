/**
 * The part that runs inside the page.
 *
 * It is deliberately thin: find readable text, ask the worker what to swap,
 * draw the result, and put it back on request. It makes no decisions about
 * difficulty and holds no state worth losing.
 *
 * The hard part is not choosing words. It is changing a live page without
 * breaking it.
 */

import { defineEclipseWord, TAG, type EclipseWord } from "./eclipse-word.js";
import { send, type RenderSentence } from "../shared/messages.js";

const HOST = location.hostname;

/** Only real prose. Not menus, not code, not form fields. */
const CONTAINERS = "p, li, h1, h2, h3, h4, h5, h6, blockquote, td, dd, figcaption";
const SKIP = new Set(["SCRIPT", "STYLE", "CODE", "PRE", "TEXTAREA", "INPUT", "SELECT", "NOSCRIPT", "KBD", "SAMP"]);

/** Text nodes we have already dealt with, so we never do one twice. */
const done = new WeakSet<Text>();
let enabled = false;
let working = false;

// ---------------------------------------------------------------------------
// Finding text
// ---------------------------------------------------------------------------

function usable(node: Text): boolean {
  if (done.has(node)) return false;
  const text = node.nodeValue ?? "";
  if (text.trim().length < 24) return false;
  if (!/[a-z]{3}/i.test(text)) return false;

  let el = node.parentElement;
  while (el) {
    if (SKIP.has(el.tagName)) return false;
    if (el.isContentEditable) return false;
    if (el.getAttribute("aria-hidden") === "true") return false;
    if (el.tagName === TAG.toUpperCase()) return false;
    el = el.parentElement;
  }
  return node.parentElement?.closest(CONTAINERS) !== null;
}

/**
 * Text nodes that are on screen or nearly on screen.
 *
 * This is not only about speed. The request budget is 750 per thirty minutes,
 * and a long article has hundreds of paragraphs. Doing the whole document on
 * load would spend the budget on text nobody scrolled to.
 */
function visibleTextNodes(limit: number): Text[] {
  const out: Text[] = [];
  const margin = window.innerHeight;
  if (!document.body) return out;
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);

  for (let n = walker.nextNode(); n && out.length < limit; n = walker.nextNode()) {
    const node = n as Text;
    if (!usable(node)) continue;

    const range = document.createRange();
    range.selectNodeContents(node);
    const rect = range.getBoundingClientRect();
    if (rect.height === 0) continue;
    if (rect.bottom < -margin || rect.top > window.innerHeight + margin) continue;

    out.push(node);
  }
  return out;
}

/**
 * The longest stretch of text we will hand over in one go.
 *
 * Not a cost limit — input tokens are nearly free on this provider. It is a
 * safety limit: `draw` replaces the whole text node with what comes back, so
 * whatever we send has to be the whole node. Skipping the giant ones is
 * simpler and safer than splitting them and stitching the pieces together.
 */
const MAX_NODE_LENGTH = 600;

// ---------------------------------------------------------------------------
// Drawing
// ---------------------------------------------------------------------------

/**
 * Replace a text node with the mixed version.
 *
 * We never write over an existing node's text. We build a fresh set of nodes
 * and swap them in, keeping the original English on each element. Frameworks
 * that redraw will simply wipe our elements, which is fine — they can be put
 * back from the cache for free.
 */
function draw(node: Text, sentence: RenderSentence): void {
  const parent = node.parentNode;
  if (!parent) return;

  const fragment = document.createDocumentFragment();
  let rest = sentence.text;

  // Walk the swaps in the order they appear in the finished sentence.
  const ordered = [...sentence.swaps].sort((a, b) => rest.indexOf(a.zh) - rest.indexOf(b.zh));

  for (const swap of ordered) {
    const at = rest.indexOf(swap.zh);
    if (at === -1) continue;

    if (at > 0) fragment.append(document.createTextNode(rest.slice(0, at)));

    const el = document.createElement(TAG) as EclipseWord;
    // The Mandarin goes in as real text, so the page still reads as text.
    // The element only styles it.
    el.textContent = swap.zh;
    el.setAttribute("zh", swap.zh);
    el.setAttribute("en", swap.en);
    el.setAttribute("pinyin", swap.pinyin);
    el.setAttribute("word-id", String(swap.wordId));
    fragment.append(el);

    rest = rest.slice(at + swap.zh.length);
  }

  if (rest) fragment.append(document.createTextNode(rest));

  done.add(node);
  parent.replaceChild(fragment, node);
}

// ---------------------------------------------------------------------------

async function pass(): Promise<void> {
  if (!enabled || working) return;
  working = true;

  try {
    // One screenful at a time. Input tokens are almost free on this provider,
    // so a whole screen in one request costs barely more than one sentence.
    const nodes = visibleTextNodes(12);
    if (nodes.length === 0) return;

    const sentences: string[] = [];
    const owner: Text[] = [];
    for (const node of nodes) {
      const text = (node.nodeValue ?? "").trim();

      // Send the whole node, never a part of it. An earlier version sent only
      // the first sentence of a paragraph and then replaced the entire node
      // with what came back, which quietly deleted the rest of the paragraph.
      if (!text || text.length > MAX_NODE_LENGTH) {
        done.add(node);
        continue;
      }
      sentences.push(text);
      owner.push(node);
    }
    if (sentences.length === 0) return;

    const reply = await send({ type: "plan", sentences, host: HOST });

    if (reply.type === "plan:off") {
      enabled = false;
      return;
    }
    if (reply.type !== "plan:ok") return;

    for (const sentence of reply.sentences) {
      const node = owner[sentence.i];
      if (node?.isConnected) draw(node, sentence);
    }
    // Anything the worker did not send back is settled: never look at it again.
    for (const node of owner) done.add(node);
  } finally {
    working = false;
  }
}

function removeAll(): void {
  for (const el of [...document.querySelectorAll(TAG)] as EclipseWord[]) {
    el.replaceWith(el.restore());
  }
}

// ---------------------------------------------------------------------------
// Reacting to the page moving underneath us
// ---------------------------------------------------------------------------

let settle: ReturnType<typeof setTimeout> | undefined;
function nudge(): void {
  clearTimeout(settle);
  settle = setTimeout(() => void pass(), 250);
}

function start(): void {
  defineEclipseWord();
  if (!document.body) {
    document.addEventListener("DOMContentLoaded", () => start(), { once: true });
    return;
  }
  enabled = true;
  void pass();

  window.addEventListener("scroll", nudge, { passive: true });
  window.addEventListener("resize", nudge, { passive: true });

  // Pages redraw themselves constantly. Watch for it, but ignore the changes
  // we caused ourselves, or we would loop forever.
  new MutationObserver((records) => {
    if (!enabled) return;
    const ours = records.every((r) =>
      [...r.addedNodes, ...r.removedNodes].every(
        (n) => n.nodeName === TAG.toUpperCase() || n.parentElement?.tagName === TAG.toUpperCase(),
      ),
    );
    if (!ours) nudge();
  }).observe(document.body, { childList: true, subtree: true });
}

chrome.runtime.onMessage.addListener((msg: { type: string; on?: boolean }) => {
  if (msg.type !== "eclipse:toggle") return;
  if (msg.on) start();
  else {
    enabled = false;
    removeAll();
  }
});

// Only wake up if this site is already switched on.
void send({ type: "status", host: HOST }).then((reply) => {
  if (reply.type === "status:ok" && reply.status.enabledHere && reply.status.hasKey) start();
});
