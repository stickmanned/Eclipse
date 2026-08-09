/**
 * DOM ownership for Paraphrase Mode.
 *
 * The contract is exactly the one `dom-tokens.ts` makes for Translate Mode, and
 * for the same reasons: replace an exact range inside a single text node, tag
 * every inserted node with owner/session/item ids, restore the recorded text on
 * teardown, and stop touching a branch the page has rewritten rather than
 * trying to repair it.
 *
 * What differs is the owner value. Both registries key their "is the page
 * clean?" check off `data-eclipse-owner`, so if the two modes shared a value,
 * each one's teardown would look at the other's live tokens and conclude it had
 * failed to restore the page. A distinct value keeps them mutually invisible —
 * and, usefully, `EXCLUDED_ANCESTOR_SELECTOR` matches on the attribute's
 * presence rather than its value, so neither mode will ever place a token
 * inside the other's.
 */

import { normalizedVisibleText } from '../../domain/normalize';
import { paraphraseItemKind, type ParaphraseItem } from '../../domain/paraphrase';

export const OWNER_ATTRIBUTE = 'data-eclipse-owner';
export const OWNER_VALUE = 'eclipse-paraphrase';
export const SESSION_ATTRIBUTE = 'data-eclipse-paraphrase-session';
export const ITEM_ATTRIBUTE = 'data-eclipse-paraphrase';
export const CONCEPT_ATTRIBUTE = 'data-eclipse-paraphrase-concept';
export const REGISTER_ATTRIBUTE = 'data-eclipse-register';
export const SOURCE_ATTRIBUTE = 'data-eclipse-paraphrase-source';
export const TOKEN_CLASS = 'eclipse-paraphrase-token';

export interface OwnedParaphraseToken {
  readonly itemId: string;
  readonly conceptId: string;
  readonly sessionId: string;
  readonly button: HTMLButtonElement;
  /** Exactly the original text that was removed, ready to be put back. */
  readonly originalText: string;
  readonly parent: Node;
}

export interface RestoreReport {
  readonly restoredCount: number;
  readonly clean: boolean;
  readonly textVerified: boolean;
}

export class ParaphraseTokenRegistry {
  private readonly tokens = new Map<string, OwnedParaphraseToken>();
  private invalidated = false;

  constructor(
    readonly sessionId: string,
    private readonly root: Element,
    /** Normalized visible text captured before anything was inserted. */
    private readonly textSnapshot: string,
  ) {}

  get size(): number {
    return this.tokens.size;
  }

  get isInvalidated(): boolean {
    return this.invalidated;
  }

  markInvalidated(): void {
    this.invalidated = true;
  }

  list(): OwnedParaphraseToken[] {
    return Array.from(this.tokens.values());
  }

  get(itemId: string): OwnedParaphraseToken | undefined {
    return this.tokens.get(itemId);
  }

  /**
   * Replace `[start, end)` of `node` with the simplified wording.
   *
   * Splitting rather than rewriting preserves the characters on either side
   * untouched, which is what makes restoration exact rather than approximate.
   */
  insert(
    node: Text,
    start: number,
    end: number,
    item: ParaphraseItem,
  ): OwnedParaphraseToken | null {
    if (this.invalidated) return null;
    if (start < 0 || end > node.data.length || start >= end) return null;
    const parent = node.parentNode;
    if (!parent) return null;

    node.splitText(end);
    const target = node.splitText(start);
    const originalText = target.data;

    const button = createParaphraseButton(node.ownerDocument, item, this.sessionId);
    parent.replaceChild(button, target);

    const token: OwnedParaphraseToken = {
      itemId: item.id,
      conceptId: item.conceptId,
      sessionId: this.sessionId,
      button,
      originalText,
      parent,
    };
    this.tokens.set(item.id, token);
    return token;
  }

  /**
   * Put every original wording back.
   *
   * Tokens the page has already detached are skipped rather than forced — if
   * the host removed the branch, the host's version of that text is the truth.
   */
  restoreAll(): RestoreReport {
    const parentsToNormalize = new Set<Node>();
    let restoredCount = 0;

    for (const token of this.tokens.values()) {
      const { button, originalText } = token;
      const parent = button.parentNode;
      if (!button.isConnected || !parent) continue;

      const replacement = button.ownerDocument.createTextNode(originalText);
      parent.replaceChild(replacement, button);
      parentsToNormalize.add(parent);
      restoredCount += 1;
    }

    for (const parent of parentsToNormalize) {
      if (typeof (parent as Element).normalize === 'function') {
        (parent as Element).normalize();
      }
    }

    this.tokens.clear();

    const clean = findParaphraseNodes(this.root.ownerDocument).length === 0;
    const textVerified = normalizedVisibleText(this.root) === this.textSnapshot;

    return { restoredCount, clean, textVerified };
  }

  /** Roll back a partially applied activation. */
  rollback(): void {
    this.restoreAll();
  }
}

/**
 * The inline token.
 *
 * A real `<button type="button">` so it is focusable, activates on Enter and
 * Space, and is announced as a control. The accessible name states plainly that
 * the text shown is a simplification — a screen-reader user must not be left
 * believing they are reading the page's own words.
 */
export function createParaphraseButton(
  doc: Document,
  item: ParaphraseItem,
  sessionId: string,
): HTMLButtonElement {
  const button = doc.createElement('button');
  button.type = 'button';
  button.className = TOKEN_CLASS;
  button.setAttribute(OWNER_ATTRIBUTE, OWNER_VALUE);
  button.setAttribute(SESSION_ATTRIBUTE, sessionId);
  button.setAttribute(ITEM_ATTRIBUTE, item.id);
  button.setAttribute(CONCEPT_ATTRIBUTE, item.conceptId);
  button.setAttribute(REGISTER_ATTRIBUTE, item.register);
  button.setAttribute(SOURCE_ATTRIBUTE, item.source);
  button.setAttribute('lang', 'fr-FR');
  button.setAttribute(
    'aria-label',
    `Simplified wording: ${item.simplifiedSurface}. Activate to reveal the original ${
      paraphraseItemKind(item) === 'phrase' ? 'phrase' : 'wording'
    }.`,
  );
  // textContent, never innerHTML. The French surface is data, not markup.
  button.textContent = item.simplifiedSurface;
  return button;
}

/** Every Paraphrase-owned element currently in the document. */
export function findParaphraseNodes(doc: Document): Element[] {
  return Array.from(doc.querySelectorAll(`[${OWNER_ATTRIBUTE}="${OWNER_VALUE}"]`));
}

/**
 * Watch for the host page detaching or reparenting an owned token.
 *
 * Eclipse's own mutations run inside `suppress`, so they never trip the
 * observer. Anything else that disconnects a token means the page rewrote the
 * branch underneath us and the session can no longer be trusted.
 */
export class ParaphraseInvalidationWatcher {
  private observer: MutationObserver | null = null;
  private suppressed = 0;

  constructor(
    private readonly registry: ParaphraseTokenRegistry,
    private readonly onInvalidated: () => void,
  ) {}

  start(root: Node): void {
    const view = (root.ownerDocument ?? (root as Document)).defaultView;
    if (!view || typeof view.MutationObserver !== 'function') return;

    this.observer = new view.MutationObserver(() => {
      if (this.suppressed > 0) return;
      if (this.registry.isInvalidated) return;
      const detached = this.registry.list().some((token) => !token.button.isConnected);
      if (detached) {
        this.registry.markInvalidated();
        this.onInvalidated();
      }
    });
    this.observer.observe(root, { childList: true, subtree: true });
  }

  stop(): void {
    this.observer?.disconnect();
    this.observer = null;
  }

  suppress<T>(work: () => T): T {
    this.suppressed += 1;
    try {
      return work();
    } finally {
      this.observer?.takeRecords();
      this.suppressed -= 1;
    }
  }
}
