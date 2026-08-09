/**
 * DOM ownership: inserting Eclipse tokens and taking them back out.
 *
 * The contract Eclipse makes to the page is narrow and keepable:
 *
 * - it only ever replaces an exact text range inside a single text node;
 * - every node it inserts is tagged with owner, session and trap ids;
 * - deactivation restores the recorded source text and normalises only the
 *   immediate parent of each token;
 * - if the page moves or removes a token, Eclipse stops touching that branch
 *   and reports `DOM_INVALIDATED` instead of trying to rebuild anything.
 *
 * There is no HTML snapshot anywhere in this file. Eclipse never reconstructs a
 * page it did not build.
 */

import { normalizedVisibleText } from '../domain/normalize';
import { learningItemKind, type ContextTrap } from '../domain/trap';

export const OWNER_ATTRIBUTE = 'data-eclipse-owner';
export const OWNER_VALUE = 'eclipse';
export const SESSION_ATTRIBUTE = 'data-eclipse-session';
export const TRAP_ATTRIBUTE = 'data-eclipse-trap';
export const CONCEPT_ATTRIBUTE = 'data-eclipse-concept';
export const ITEM_KIND_ATTRIBUTE = 'data-eclipse-kind';
export const TOKEN_CLASS = 'eclipse-token';

export interface OwnedToken {
  readonly trapId: string;
  readonly conceptId: string;
  readonly sessionId: string;
  readonly button: HTMLButtonElement;
  /** Exactly the text that was removed, ready to be put back. */
  readonly originalText: string;
  /** The node the token was inserted into. Used for the narrow normalize. */
  readonly parent: Node;
}

export interface RestoreReport {
  readonly restoredCount: number;
  /** True when no Eclipse-owned node remained in the document. */
  readonly clean: boolean;
  /** True when normalized visible text matched the pre-activation snapshot. */
  readonly textVerified: boolean;
}

/**
 * Tracks every node Eclipse put into the page for one session.
 */
export class TokenRegistry {
  private readonly tokens = new Map<string, OwnedToken>();
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

  list(): OwnedToken[] {
    return Array.from(this.tokens.values());
  }

  get(trapId: string): OwnedToken | undefined {
    return this.tokens.get(trapId);
  }

  /**
   * Replace `[start, end)` of `node` with an Eclipse token.
   *
   * Splitting rather than rewriting the node is what preserves the whitespace
   * on either side: the characters outside the range are never touched.
   */
  insert(node: Text, start: number, end: number, trap: ContextTrap): OwnedToken | null {
    if (this.invalidated) return null;
    if (start < 0 || end > node.data.length || start >= end) return null;
    const parent = node.parentNode;
    if (!parent) return null;

    // splitText twice leaves `target` holding exactly the matched range.
    node.splitText(end);
    const target = node.splitText(start);
    const originalText = target.data;

    const button = createTokenButton(node.ownerDocument, trap, this.sessionId);
    parent.replaceChild(button, target);

    const token: OwnedToken = {
      trapId: trap.id,
      conceptId: trap.conceptId,
      sessionId: this.sessionId,
      button,
      originalText,
      parent,
    };
    this.tokens.set(trap.id, token);
    return token;
  }

  /**
   * Put every token back.
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

    // Only the immediate parents. Normalizing the whole article would merge
    // text nodes the page created for its own reasons.
    for (const parent of parentsToNormalize) {
      if (typeof (parent as Element).normalize === 'function') {
        (parent as Element).normalize();
      }
    }

    this.tokens.clear();

    const clean = findOwnedNodes(this.root.ownerDocument).length === 0;
    const textVerified = normalizedVisibleText(this.root) === this.textSnapshot;

    return { restoredCount, clean, textVerified };
  }

  /** Roll back a partially applied activation. Used when placement fails midway. */
  rollback(): void {
    this.restoreAll();
  }
}

/**
 * Build the inline token.
 *
 * A real `<button type="button">` — not a styled span — so it is focusable,
 * activates on Enter and Space, and is announced as a control. The accessible
 * name says what it is and what selecting it does.
 */
export function createTokenButton(
  doc: Document,
  trap: ContextTrap,
  sessionId: string,
): HTMLButtonElement {
  const button = doc.createElement('button');
  button.type = 'button';
  button.className = TOKEN_CLASS;
  button.setAttribute(OWNER_ATTRIBUTE, OWNER_VALUE);
  button.setAttribute(SESSION_ATTRIBUTE, sessionId);
  button.setAttribute(TRAP_ATTRIBUTE, trap.id);
  button.setAttribute(CONCEPT_ATTRIBUTE, trap.conceptId);
  const kind = learningItemKind(trap);
  button.setAttribute(ITEM_KIND_ATTRIBUTE, kind);
  button.setAttribute('lang', 'fr-FR');
  button.setAttribute(
    'aria-label',
    `French ${kind}: ${trap.targetSurface}. Activate to answer a translation question.`,
  );
  // textContent, never innerHTML. The French surface is data, not markup.
  button.textContent = trap.targetSurface;
  return button;
}

/** Every Eclipse-owned element currently in the document. */
export function findOwnedNodes(doc: Document): Element[] {
  return Array.from(doc.querySelectorAll(`[${OWNER_ATTRIBUTE}="${OWNER_VALUE}"]`));
}

/**
 * Watch for the host page detaching or reparenting an owned token.
 *
 * Eclipse's own mutations run inside `suppress`, so they never trip the
 * observer. Anything else that disconnects a token means the page rewrote the
 * branch underneath us and the session can no longer be trusted.
 */
export class InvalidationWatcher {
  private observer: MutationObserver | null = null;
  private suppressed = 0;

  constructor(
    private readonly registry: TokenRegistry,
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

  /** Run Eclipse's own DOM work without the observer reacting to it. */
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
