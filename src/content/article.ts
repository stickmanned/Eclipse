/**
 * Finding the readable article and the text Eclipse is allowed to touch.
 *
 * The rules here are conservative by design. Anything Eclipse is unsure about
 * is skipped: links, controls, code, chrome, hidden content, editable regions.
 * A missed trap costs nothing; a trap inside a link breaks the page.
 */

import { collapseWhitespace } from '../domain/normalize';

/** Blocks Eclipse will read text out of. */
export const ELIGIBLE_BLOCK_SELECTOR = 'p, li, blockquote, section, div';

/**
 * Ancestors that disqualify a text node. Links and buttons are excluded
 * because a trap inside one would hijack a click the page owns; code and
 * `pre` because their text is not prose; nav/header/footer/aside because they
 * are page chrome, not the article.
 */
export const EXCLUDED_ANCESTOR_SELECTOR = [
  'script',
  'style',
  'code',
  'pre',
  'kbd',
  'samp',
  'input',
  'textarea',
  'select',
  'form',
  'button',
  'a',
  'nav',
  'header',
  'footer',
  'aside',
  'figcaption',
  'table',
  '[contenteditable]',
  '[contenteditable="true"]',
  '[aria-hidden="true"]',
  '[hidden]',
  '[data-eclipse-owner]',
].join(',');

export const MIN_READABLE_CHARACTERS = 20;
export const MIN_ELIGIBLE_BLOCKS = 1;
export const MAX_TEXT_NODES = 5_000;
export const MAX_SCANNED_CHARACTERS = 100_000;

/**
 * Subtrees that are never article prose. Link labels are deliberately absent:
 * they help preserve the sentence a reader sees even though Eclipse will not
 * replace text inside the link itself.
 */
const NON_PROSE_ANCESTOR_SELECTOR = [
  'script',
  'style',
  'code',
  'pre',
  'kbd',
  'samp',
  'input',
  'textarea',
  'select',
  'form',
  'button',
  'nav',
  'header',
  'footer',
  'aside',
  'figcaption',
  'table',
  '[contenteditable]',
  '[contenteditable="true"]',
  '[aria-hidden="true"]',
  '[hidden]',
].join(',');

/** Salience by block type: body prose outranks list fragments. */
const SALIENCE_BY_TAG: Readonly<Record<string, number>> = {
  P: 1,
  BLOCKQUOTE: 0.8,
  SECTION: 0.75,
  DIV: 0.7,
  LI: 0.6,
};

export interface EligibleTextNode {
  readonly node: Text;
  /** Offset of this node's text within the flattened block text. */
  readonly offset: number;
  readonly length: number;
}

export interface EligibleBlock {
  readonly element: Element;
  /** Document order among eligible blocks. */
  readonly index: number;
  /**
   * Every text node in the block, concatenated in document order — including
   * text Eclipse may not replace, such as link labels. Sentences are read from
   * this so a quoted sentence is the one the reader actually sees.
   *
   * Never re-normalized: offsets here map directly onto live DOM text nodes.
   */
  readonly text: string;
  /** Only the nodes Eclipse is permitted to modify. */
  readonly nodes: readonly EligibleTextNode[];
  /** Character count across `nodes`, used for the density ceiling. */
  readonly eligibleCharacters: number;
  readonly salience: number;
  /** Stable key so two traps never land in the same block. */
  readonly key: string;
}

function isVisible(element: Element): boolean {
  if (element.hasAttribute('hidden')) return false;
  if (element.getAttribute('aria-hidden') === 'true') return false;

  const view = element.ownerDocument.defaultView;
  if (!view || typeof view.getComputedStyle !== 'function') return true;

  let current: Element | null = element;
  let depth = 0;
  while (current && depth < 40) {
    const style = view.getComputedStyle(current);
    if (style.display === 'none' || style.visibility === 'hidden') return false;
    current = current.parentElement;
    depth += 1;
  }
  return true;
}

/** True when the node sits under something Eclipse must not modify. */
export function hasExcludedAncestor(node: Node, root: Element): boolean {
  let current: Element | null =
    node.nodeType === Node.ELEMENT_NODE ? (node as Element) : node.parentElement;

  while (current) {
    if (current.matches(EXCLUDED_ANCESTOR_SELECTOR)) return true;
    if (current === root) break;
    current = current.parentElement;
  }
  return false;
}

/** The nearest `p` / `li` / `blockquote` ancestor, or null. */
function nearestBlock(node: Node, root: Element): Element | null {
  let current: Element | null = node.parentElement;
  while (current) {
    if (current.matches(ELIGIBLE_BLOCK_SELECTOR)) return current;
    if (current === root) return null;
    current = current.parentElement;
  }
  return null;
}

function readableLength(element: Element): number {
  return collapseWhitespace(element.textContent ?? '').length;
}

/**
 * Article container, in the order the plan specifies: a visible `<article>`,
 * then a visible `<main>`, then the largest visible container of paragraphs.
 */
export function findArticleRoot(doc: Document): Element | null {
  const article = Array.from(doc.querySelectorAll('article')).find(
    (element) => isVisible(element) && readableLength(element) >= MIN_READABLE_CHARACTERS,
  );
  if (article) return article;

  const main = Array.from(doc.querySelectorAll('main')).find(
    (element) => isVisible(element) && readableLength(element) >= MIN_READABLE_CHARACTERS,
  );
  if (main) return main;

  const paragraphContainer = largestParagraphContainer(doc);
  if (paragraphContainer) return paragraphContainer;

  const body = doc.body;
  if (!body || !isVisible(body)) return null;
  return isArticleEligible(collectEligibleBlocks(body)) ? body : null;
}

/**
 * Fallback: the element with the most readable paragraph text. Scores each
 * candidate by the text under it and keeps the deepest of the top scorers, so
 * Eclipse lands on the content wrapper rather than `<body>`.
 */
function largestParagraphContainer(doc: Document): Element | null {
  const paragraphs = Array.from(doc.querySelectorAll('p')).filter((p) => isVisible(p));
  if (paragraphs.length < MIN_ELIGIBLE_BLOCKS) return null;

  const scores = new Map<Element, number>();
  for (const paragraph of paragraphs) {
    const length = readableLength(paragraph);
    let parent: Element | null = paragraph.parentElement;
    let depth = 0;
    while (parent && depth < 8) {
      scores.set(parent, (scores.get(parent) ?? 0) + length);
      parent = parent.parentElement;
      depth += 1;
    }
  }

  let best: Element | null = null;
  let bestScore = 0;
  let bestDepth = -1;
  for (const [element, score] of scores) {
    if (score < MIN_READABLE_CHARACTERS) continue;
    const depth = depthOf(element);
    if (score > bestScore || (score === bestScore && depth > bestDepth)) {
      best = element;
      bestScore = score;
      bestDepth = depth;
    }
  }
  return best;
}

function depthOf(element: Element): number {
  let depth = 0;
  let current: Element | null = element.parentElement;
  while (current) {
    depth += 1;
    current = current.parentElement;
  }
  return depth;
}

/**
 * Collect the eligible blocks under `root`.
 *
 * Walks text nodes once, applying the node cap and character budget as it goes.
 * Only text nodes whose nearest block is `p`/`li`/`blockquote` and which have
 * no excluded ancestor survive.
 */
export function collectEligibleBlocks(root: Element): EligibleBlock[] {
  const doc = root.ownerDocument;
  const walker = doc.createTreeWalker(root, NodeFilter.SHOW_TEXT);

  interface Bucket {
    nodes: EligibleTextNode[];
    text: string;
    eligibleCharacters: number;
  }

  const byBlock = new Map<Element, Bucket>();
  const blockVisibility = new Map<Element, boolean>();
  let visitedNodes = 0;
  let scannedCharacters = 0;

  let current = walker.nextNode();
  while (current) {
    const textNode = current as Text;
    current = walker.nextNode();

    const data = textNode.data;
    if (data.length === 0) continue;

    const block = nearestBlock(textNode, root);
    if (!block) continue;
    if (textNode.parentElement?.closest(NON_PROSE_ANCESTOR_SELECTOR)) continue;

    let visible = blockVisibility.get(block);
    if (visible === undefined) {
      visible = isVisible(block);
      blockVisibility.set(block, visible);
    }
    if (!visible) continue;

    if (visitedNodes >= MAX_TEXT_NODES) break;
    if (scannedCharacters + data.length > MAX_SCANNED_CHARACTERS) break;
    visitedNodes += 1;
    scannedCharacters += data.length;

    let bucket = byBlock.get(block);
    if (!bucket) {
      bucket = { nodes: [], text: '', eligibleCharacters: 0 };
      byBlock.set(block, bucket);
    }

    // Text under a link, control or code span still counts toward the block's
    // sentences — it just cannot be replaced.
    const replaceable = !hasExcludedAncestor(textNode, root) && data.trim().length > 0;
    if (replaceable) {
      bucket.nodes.push({ node: textNode, offset: bucket.text.length, length: data.length });
      bucket.eligibleCharacters += data.length;
    }
    bucket.text += data;
  }

  const blocks: EligibleBlock[] = [];
  let index = 0;
  for (const [element, bucket] of byBlock) {
    if (bucket.nodes.length === 0) continue;
    if (collapseWhitespace(bucket.text).length === 0) continue;
    blocks.push({
      element,
      index,
      text: bucket.text,
      nodes: bucket.nodes,
      eligibleCharacters: bucket.eligibleCharacters,
      salience: SALIENCE_BY_TAG[element.tagName] ?? 0.5,
      key: `block:${index}`,
    });
    index += 1;
  }

  return blocks;
}

/** Total replaceable words, used for the replacement-density ceiling. */
export function countEligibleWords(blocks: readonly EligibleBlock[]): number {
  let total = 0;
  for (const block of blocks) {
    for (const node of block.nodes) {
      const words = collapseWhitespace(node.node.data);
      if (words.length === 0) continue;
      total += words.split(' ').length;
    }
  }
  return total;
}

/** Whether the article is substantial enough to be worth transforming. */
export function isArticleEligible(blocks: readonly EligibleBlock[]): boolean {
  if (blocks.length < MIN_ELIGIBLE_BLOCKS) return false;
  const characters = blocks.reduce((sum, block) => sum + collapseWhitespace(block.text).length, 0);
  return characters >= MIN_READABLE_CHARACTERS;
}

/**
 * Locate the eligible text node containing `[start, end)` within a block.
 * Returns null when the range crosses a node boundary or touches text Eclipse
 * may not modify — Eclipse never splices across inline elements.
 */
export function resolveRange(
  block: EligibleBlock,
  start: number,
  end: number,
): { node: Text; start: number; end: number } | null {
  for (const candidate of block.nodes) {
    const nodeStart = candidate.offset;
    const nodeEnd = candidate.offset + candidate.length;
    if (start >= nodeStart && end <= nodeEnd) {
      return { node: candidate.node, start: start - nodeStart, end: end - nodeStart };
    }
  }
  return null;
}

export interface SentenceRef {
  readonly text: string;
  /** Offset of the sentence within the block's flattened text. */
  readonly start: number;
  readonly end: number;
  readonly key: string;
}

/**
 * Split a block into sentences. Deliberately simple: split after `.`/`!`/`?`
 * followed by whitespace and an opening character, with a short guard list for
 * common abbreviations. Deterministic beats clever here — the E2E suite
 * asserts on the sentences this produces.
 */
const ABBREVIATIONS = ['mr.', 'mrs.', 'ms.', 'dr.', 'prof.', 'st.', 'no.', 'vs.', 'e.g.', 'i.e.'];

export function splitSentences(blockText: string, blockKey: string): SentenceRef[] {
  const sentences: SentenceRef[] = [];
  const boundary = /[.!?]["')\]]?\s+/g;

  let start = 0;
  let index = 0;
  for (const match of blockText.matchAll(boundary)) {
    const matchIndex = match.index;
    if (typeof matchIndex !== 'number') continue;
    const end = matchIndex + match[0].length;

    const candidate = blockText.slice(start, end);
    const trimmedLower = candidate.trimEnd().toLowerCase();
    if (ABBREVIATIONS.some((abbr) => trimmedLower.endsWith(abbr))) continue;

    const sentence = makeSentence(blockText, start, end, blockKey, index);
    if (sentence) {
      sentences.push(sentence);
      index += 1;
    }
    start = end;
  }

  const tail = makeSentence(blockText, start, blockText.length, blockKey, index);
  if (tail) sentences.push(tail);

  return sentences;
}

function makeSentence(
  blockText: string,
  rawStart: number,
  rawEnd: number,
  blockKey: string,
  index: number,
): SentenceRef | null {
  const raw = blockText.slice(rawStart, rawEnd);
  const text = raw.trim();
  if (text.length === 0) return null;
  const leading = raw.length - raw.trimStart().length;
  const start = rawStart + leading;
  return { text, start, end: start + text.length, key: `${blockKey}#${index}` };
}
