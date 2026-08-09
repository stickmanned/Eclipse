/**
 * The Paraphrase Mode content-script session.
 *
 * Owns article analysis, item selection, DOM mutation and restoration, the
 * challenge card, and the manual-selection affordance. Profile writes cross one
 * host seam owned by the background worker — the same single-writer rule
 * Translate Mode applies to mastery, and for the same reason: two surfaces can
 * originate an outcome, but only one of them may persist it.
 *
 * Activation is all-or-nothing. If anything fails partway through placing
 * tokens, every token already inserted comes back out before the failure is
 * returned, so the page is never left half-simplified — which would be worse
 * than not running at all, because the reader would have no way to tell which
 * sentences were the author's.
 */

import { createInteractionId } from '../../domain/ids';
import { failure, success, type Failure, type Result } from '../../domain/errors';
import { collapseWhitespace, normalizedVisibleText } from '../../domain/normalize';
import {
  isCorrectParaphraseChoice,
  type GeneratedParaphraseCandidate,
  type ParaphraseItem,
} from '../../domain/paraphrase';
import {
  collectEligibleBlocks,
  countEligibleWords,
  findArticleRoot,
  isArticleEligible,
  resolveRange,
  splitSentences,
  type EligibleBlock,
} from '../article';
import { ParaphraseInvalidationWatcher, ParaphraseTokenRegistry } from './tokens';
import {
  PARAPHRASE_LIMITS,
  collectParaphraseCandidates,
  planParaphrases,
  type ParaphrasePlacement,
  type ParaphraseSentenceTarget,
} from './place';
import { ParaphraseOverlayStore } from './store';
import type {
  ActivatedData,
  DeactivatedData,
  ParaphrasePlan,
  ParaphraseSentence,
  RecordedData,
} from '../../paraphrase/protocol';

/** Mirrors the client's limits so the two cannot drift apart. */
const MAX_SENTENCES_PER_BATCH = 8;
const MAX_SENTENCE_LENGTH = 300;
/**
 * Three in flight, for the reason measured in `src/content/session.ts`: the
 * binding constraint is the upstream per-minute quota, not concurrency, and
 * four batches at a time buys seconds by losing items.
 */
const MAX_CONCURRENT_BATCHES = 3;

/** Bounds on what the learner may ask to have simplified by hand. */
const MIN_SELECTION_LENGTH = 3;
const MAX_SELECTION_LENGTH = 160;

export interface ParaphraseRecordInput {
  readonly interactionId: string;
  readonly conceptId: string;
  readonly original: string;
  readonly simplified: string;
  readonly register: ParaphraseItem['register'];
  readonly complexity: number;
  readonly correct: boolean;
}

export interface ParaphraseManualRecordInput {
  readonly interactionId: string;
  readonly conceptId: string;
  readonly original: string;
  readonly simplified: string;
  readonly register: ParaphraseItem['register'];
  readonly complexity: number;
}

export interface ParaphraseOverlayCallbacks {
  onAnswer(itemId: string, choice: string): void;
  onClose(): void;
  onSimplifySelection(text: string): void;
  onDismissPrompt(): void;
}

export interface ParaphraseSessionHost {
  mountOverlay(store: ParaphraseOverlayStore, callbacks: ParaphraseOverlayCallbacks): () => void;
  installTokenStyles(doc: Document): () => void;
  requestGeneration(
    sessionId: string,
    sentences: readonly ParaphraseSentence[],
  ): Promise<Result<GeneratedParaphraseCandidate[]>>;
  requestSelectionParaphrase(
    sessionId: string,
    sentence: string,
    selection: string,
  ): Promise<Result<ParaphraseItem>>;
  recordAnswer(sessionId: string, input: ParaphraseRecordInput): Promise<Result<RecordedData>>;
  recordManual(
    sessionId: string,
    input: ParaphraseManualRecordInput,
  ): Promise<Result<RecordedData>>;
  onInvalidated?(): void;
}

interface ActiveState {
  readonly sessionId: string;
  readonly root: Element;
  readonly blocks: readonly EligibleBlock[];
  readonly registry: ParaphraseTokenRegistry;
  readonly watcher: ParaphraseInvalidationWatcher;
  readonly items: Map<string, ParaphraseItem>;
  readonly teardown: (() => void)[];
  readonly interactions: Map<string, string>;
  plan: ParaphrasePlan;
  invalidated: boolean;
}

interface PreparedBatch {
  readonly sentences: ParaphraseSentence[];
  readonly targets: ParaphraseSentenceTarget[];
}

/**
 * Select sentences round-robin across blocks so one long paragraph cannot crowd
 * out the rest of the article, and paragraphs get their turn before list
 * fragments and generic wrappers.
 */
export function prepareBatches(blocks: readonly EligibleBlock[]): PreparedBatch[] {
  const queues = blocks.map((block) => ({
    block,
    sentences: splitSentences(block.text, block.key).filter((sentence) => {
      if (sentence.text.length > MAX_SENTENCE_LENGTH) return false;
      return block.nodes.some((node) => {
        const nodeEnd = node.offset + node.length;
        return node.offset < sentence.end && nodeEnd > sentence.start;
      });
    }),
  }));

  const sentences: ParaphraseSentence[] = [];
  const targets: ParaphraseSentenceTarget[] = [];

  const append = (selected: typeof queues): void => {
    let index = 0;
    while (
      index < PARAPHRASE_LIMITS.maxItemsPerBlock &&
      sentences.length < PARAPHRASE_LIMITS.maxItems
    ) {
      let added = false;
      for (const queue of selected) {
        if (sentences.length >= PARAPHRASE_LIMITS.maxItems) break;
        const sentence = queue.sentences[index];
        if (!sentence) continue;
        const id = `s${sentences.length}`;
        sentences.push({ id, text: sentence.text });
        targets.push({ sentenceId: id, block: queue.block, sentence });
        added = true;
      }
      if (!added) break;
      index += 1;
    }
  };

  const isProse = (block: EligibleBlock): boolean =>
    block.element.tagName === 'P' || block.element.tagName === 'BLOCKQUOTE';
  append(queues.filter(({ block }) => isProse(block)));
  append(queues.filter(({ block }) => !isProse(block)));

  const batches: PreparedBatch[] = [];
  for (let start = 0; start < sentences.length; start += MAX_SENTENCES_PER_BATCH) {
    batches.push({
      sentences: sentences.slice(start, start + MAX_SENTENCES_PER_BATCH),
      targets: targets.slice(start, start + MAX_SENTENCES_PER_BATCH),
    });
  }
  return batches;
}

interface BatchResult {
  readonly candidates: GeneratedParaphraseCandidate[];
  readonly targets: ParaphraseSentenceTarget[];
  readonly failure: Failure | null;
}

export class ParaphraseSession {
  private active: ActiveState | null = null;
  private pendingActivation: { readonly sessionId: string; readonly token: symbol } | null = null;
  private lastOpenedItemId: string | null = null;
  /**
   * Captured when the affordance appears, not when it is clicked. Clicking the
   * button collapses the page selection, so reading it back at click time would
   * reliably find nothing.
   */
  private pendingSelection: { readonly sentence: string; readonly selection: string } | null = null;

  readonly overlay = new ParaphraseOverlayStore();

  constructor(
    private readonly doc: Document,
    private readonly host: ParaphraseSessionHost,
  ) {}

  get sessionId(): string | null {
    return this.active?.sessionId ?? null;
  }

  get isActive(): boolean {
    return this.active !== null;
  }

  /** Item ids currently placed. Test and debug affordance. */
  get placedItemIds(): string[] {
    return this.active ? Array.from(this.active.items.keys()) : [];
  }

  // -------------------------------------------------------------------------
  // Activation
  // -------------------------------------------------------------------------

  async activate(sessionId: string, plan: ParaphrasePlan): Promise<Result<ActivatedData>> {
    if (this.active?.sessionId === sessionId) return success(this.describe(this.active));
    if (this.active) await this.deactivate(this.active.sessionId);

    const token = Symbol(sessionId);
    this.pendingActivation = { sessionId, token };

    const root = findArticleRoot(this.doc);
    if (!root) return this.fail(token, 'NO_ARTICLE');

    const blocks = collectEligibleBlocks(root);
    if (!isArticleEligible(blocks)) return this.fail(token, 'NO_ARTICLE');

    const generated = await this.requestBatches(sessionId, blocks);
    if (!this.isCurrent(token)) return failure('SESSION_REPLACED');

    const candidates = collectParaphraseCandidates(generated.candidates, generated.targets);
    const placements = planParaphrases(candidates, plan, {
      eligibleWordCount: countEligibleWords(blocks),
    });

    if (placements.length < PARAPHRASE_LIMITS.minItems) {
      this.finish(token);
      // A provider failure is the more actionable explanation whenever there is
      // one: "no French wording to simplify here" and "the AI service is not
      // running" are different problems with different fixes.
      return generated.failure ?? failure('NO_ELIGIBLE_TRAPS');
    }

    // Snapshot before the first mutation. This is what deactivation checks.
    const snapshot = normalizedVisibleText(root);
    const registry = new ParaphraseTokenRegistry(sessionId, root, snapshot);
    const watcher = new ParaphraseInvalidationWatcher(registry, () => this.handleInvalidation());

    const items = new Map<string, ParaphraseItem>();
    const inserted = watcher.suppress(() => this.insertAll(registry, placements, items, plan));

    if (!inserted.ok) {
      watcher.suppress(() => registry.rollback());
      this.finish(token);
      return inserted;
    }

    const teardown: (() => void)[] = [];
    teardown.push(this.host.installTokenStyles(this.doc));
    teardown.push(
      this.host.mountOverlay(this.overlay, {
        onAnswer: (itemId, choice) => void this.submitAnswer(itemId, choice),
        onClose: () => this.closeCard(),
        onSimplifySelection: () => void this.simplifyPendingSelection(),
        onDismissPrompt: () => this.overlay.setPrompt(null),
      }),
    );

    const state: ActiveState = {
      sessionId,
      root,
      blocks,
      registry,
      watcher,
      items,
      teardown,
      interactions: new Map(),
      plan,
      invalidated: false,
    };
    this.active = state;
    this.finish(token);

    this.doc.addEventListener('click', this.onDocumentClick, true);
    this.doc.addEventListener('mouseup', this.onSelectionSettled, true);
    this.doc.addEventListener('keyup', this.onSelectionSettled, true);
    this.doc.addEventListener('scroll', this.onScroll, true);
    watcher.start(this.doc.documentElement);

    return success(this.describe(state));
  }

  private insertAll(
    registry: ParaphraseTokenRegistry,
    placements: readonly ParaphrasePlacement[],
    items: Map<string, ParaphraseItem>,
    plan: ParaphrasePlan,
  ): Result<number> {
    const owed = new Set(plan.dueConceptIds);
    for (const placement of placements) {
      const range = resolveRange(placement.block, placement.blockStart, placement.blockEnd);
      if (!range) {
        return failure(
          'DOM_INVALIDATED',
          'A paraphrase range no longer resolves to one text node.',
        );
      }
      const token = registry.insert(range.node, range.start, range.end, placement.item);
      if (!token) {
        return failure('DOM_INVALIDATED', 'A paraphrase could not be inserted into the article.');
      }
      if (owed.has(placement.item.conceptId)) token.button.setAttribute('data-owed', 'true');
      items.set(placement.item.id, placement.item);
    }
    return success(items.size);
  }

  /** Collect generation batches before the one atomic DOM placement pass. */
  private async requestBatches(
    sessionId: string,
    blocks: readonly EligibleBlock[],
  ): Promise<BatchResult> {
    const prepared = prepareBatches(blocks);
    if (prepared.length === 0) return { candidates: [], targets: [], failure: null };

    const results: Array<Result<GeneratedParaphraseCandidate[]> | undefined> = new Array(
      prepared.length,
    );
    let next = 0;
    const worker = async (): Promise<void> => {
      while (next < prepared.length) {
        const index = next;
        next += 1;
        const batch = prepared[index];
        if (!batch) continue;
        try {
          results[index] = await this.host.requestGeneration(sessionId, batch.sentences);
        } catch {
          results[index] = failure('PROVIDER_UNAVAILABLE');
        }
      }
    };

    await Promise.all(
      Array.from({ length: Math.min(MAX_CONCURRENT_BATCHES, prepared.length) }, () => worker()),
    );

    const candidates: GeneratedParaphraseCandidate[] = [];
    const targets: ParaphraseSentenceTarget[] = [];
    let lastFailure: Failure | null = null;
    for (const [index, result] of results.entries()) {
      const batch = prepared[index];
      if (!batch || !result) continue;
      if (!result.ok) {
        lastFailure = result;
        continue;
      }
      candidates.push(...result.data);
      targets.push(...batch.targets);
    }
    return { candidates, targets, failure: lastFailure };
  }

  private isCurrent(token: symbol): boolean {
    return this.pendingActivation?.token === token;
  }

  private finish(token: symbol): void {
    if (this.pendingActivation?.token === token) this.pendingActivation = null;
  }

  private fail(token: symbol, code: 'NO_ARTICLE' | 'NO_ELIGIBLE_TRAPS'): Result<ActivatedData> {
    this.finish(token);
    return failure(code);
  }

  private describe(state: ActiveState): ActivatedData {
    return {
      sessionId: state.sessionId,
      itemCount: state.items.size,
      conceptIds: Array.from(state.items.values()).map((item) => item.conceptId),
    };
  }

  // -------------------------------------------------------------------------
  // Deactivation
  // -------------------------------------------------------------------------

  async deactivate(sessionId?: string): Promise<Result<DeactivatedData>> {
    const pending = this.pendingActivation;
    if (pending && (!sessionId || sessionId === pending.sessionId)) this.pendingActivation = null;

    const state = this.active;
    if (!state) return success({ restored: false, textVerified: true });
    if (sessionId && sessionId !== state.sessionId) {
      return failure('SESSION_REPLACED', 'That paraphrase session is no longer the active one.');
    }

    // Stop watching before restoring, so Eclipse's own removals are not read as
    // the page invalidating us.
    state.watcher.stop();
    this.doc.removeEventListener('click', this.onDocumentClick, true);
    this.doc.removeEventListener('mouseup', this.onSelectionSettled, true);
    this.doc.removeEventListener('keyup', this.onSelectionSettled, true);
    this.doc.removeEventListener('scroll', this.onScroll, true);
    this.overlay.close();
    this.pendingSelection = null;

    for (const teardown of state.teardown) {
      try {
        teardown();
      } catch {
        // A teardown that throws must not block the rest of the restore.
      }
    }

    const report = state.registry.restoreAll();
    this.active = null;

    return success({ restored: report.restoredCount > 0, textVerified: report.textVerified });
  }

  private handleInvalidation(): void {
    const state = this.active;
    if (!state || state.invalidated) return;
    state.invalidated = true;
    this.host.onInvalidated?.();
    void this.deactivate(state.sessionId);
  }

  // -------------------------------------------------------------------------
  // The card
  // -------------------------------------------------------------------------

  /**
   * Captured on the document in the capture phase so a host page that stops
   * propagation on its own container cannot swallow the token's activation.
   * Keyboard activation of a `<button>` produces a click too, so Enter and
   * Space arrive here as well.
   */
  private readonly onDocumentClick = (event: Event): void => {
    const state = this.active;
    if (!state) return;

    const target = event.target;
    if (!(target instanceof Element)) return;
    const token = target.closest<HTMLElement>('[data-eclipse-paraphrase]');
    if (!token) return;

    const itemId = token.getAttribute('data-eclipse-paraphrase');
    if (!itemId) return;
    const item = state.items.get(itemId);
    if (!item) return;

    event.preventDefault();
    event.stopPropagation();
    this.openCard(item);
  };

  openCard(item: ParaphraseItem): void {
    const state = this.active;
    if (!state) return;

    let interactionId = state.interactions.get(item.id);
    if (!interactionId) {
      interactionId = createInteractionId();
      state.interactions.set(item.id, interactionId);
    }

    this.lastOpenedItemId = item.id;
    this.overlay.setView({ kind: 'question', item, interactionId });
  }

  closeCard(): void {
    this.overlay.close();
    this.returnFocusToToken();
  }

  private returnFocusToToken(): void {
    const state = this.active;
    if (!state || !this.lastOpenedItemId) return;
    const token = state.registry.get(this.lastOpenedItemId)?.button;
    if (token?.isConnected) token.focus();
  }

  /**
   * Record an answer.
   *
   * The profile update is applied exactly once per interaction id, guarded by a
   * persisted log in the background worker rather than in-memory state here, so
   * a reload between the answer and a retried message cannot double-count it.
   */
  async submitAnswer(itemId: string, choice: string): Promise<Result<void>> {
    const state = this.active;
    if (!state) return failure('SESSION_REPLACED');

    const item = state.items.get(itemId);
    if (!item) return failure('DOM_INVALIDATED', 'That paraphrase is no longer on the page.');
    if (!item.choices.includes(choice)) {
      return failure('UNKNOWN_ERROR', 'That is not one of the offered wordings.');
    }

    const interactionId = state.interactions.get(itemId) ?? createInteractionId();
    state.interactions.set(itemId, interactionId);
    this.lastOpenedItemId = itemId;

    const correct = isCorrectParaphraseChoice(item, choice);
    const token = state.registry.get(itemId)?.button;
    if (token) token.setAttribute('data-answered', correct ? 'correct' : 'incorrect');

    const previousTarget = state.plan.target;
    const recorded = await this.host.recordAnswer(state.sessionId, {
      interactionId,
      conceptId: item.conceptId,
      original: item.exactSourceText,
      simplified: item.simplifiedSurface,
      register: item.register,
      complexity: item.complexity,
      correct,
    });

    if (!recorded.ok) {
      this.overlay.setView({
        kind: 'result',
        result: {
          item,
          interactionId,
          selected: choice,
          correct,
          direction: 'held',
          target: previousTarget,
          previousTarget,
          conceptState: correct ? 'learning' : 'unknown',
          owed: !correct,
          persist: 'error',
          persistMessage: recorded.error.message,
        },
      });
      return recorded;
    }

    state.plan = recorded.data.plan;
    this.refreshOwedMarks(state);

    this.overlay.setView({
      kind: 'result',
      result: {
        item,
        interactionId,
        selected: choice,
        correct,
        direction: recorded.data.direction,
        target: recorded.data.target,
        previousTarget,
        conceptState: recorded.data.state,
        owed: recorded.data.owed,
        persist: 'saved',
        persistMessage: null,
      },
    });

    return success(undefined);
  }

  /** Keep the page's "you owe this one" marks in step with the profile. */
  private refreshOwedMarks(state: ActiveState): void {
    const owed = new Set(state.plan.dueConceptIds);
    state.watcher.suppress(() => {
      for (const token of state.registry.list()) {
        if (owed.has(token.conceptId)) token.button.setAttribute('data-owed', 'true');
        else token.button.removeAttribute('data-owed');
      }
    });
  }

  // -------------------------------------------------------------------------
  // Manual selection
  // -------------------------------------------------------------------------

  private readonly onScroll = (): void => {
    // A pill anchored to viewport coordinates is wrong the instant the page
    // moves. Dismissing beats chasing the selection on every scroll frame.
    if (this.overlay.getSnapshot().prompt) this.overlay.setPrompt(null);
  };

  private readonly onSelectionSettled = (): void => {
    const state = this.active;
    if (!state) return;
    if (this.overlay.getSnapshot().view.kind !== 'closed') return;

    const view = this.doc.defaultView;
    const selection = view?.getSelection?.();
    if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
      this.pendingSelection = null;
      this.overlay.setPrompt(null);
      return;
    }

    const text = collapseWhitespace(selection.toString());
    if (text.length < MIN_SELECTION_LENGTH || text.length > MAX_SELECTION_LENGTH) {
      this.pendingSelection = null;
      this.overlay.setPrompt(null);
      return;
    }

    const anchor = selection.anchorNode;
    if (
      !anchor ||
      !state.root.contains(anchor.nodeType === 1 ? anchor : (anchor.parentNode as Node))
    ) {
      this.pendingSelection = null;
      this.overlay.setPrompt(null);
      return;
    }

    const context = this.findSelectionContext(state, anchor, text);
    if (!context) {
      this.pendingSelection = null;
      this.overlay.setPrompt(null);
      return;
    }

    this.pendingSelection = context;
    const rect = selection.getRangeAt(0).getBoundingClientRect();
    this.overlay.setPrompt({
      text,
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
    });
  };

  /**
   * Find the sentence the selection sits in.
   *
   * The selection has to occur exactly once in the sentence Eclipse sends,
   * because that is the only way the server can bind an item back to a span
   * without guessing which occurrence was meant. A common word selected out of
   * a sentence that repeats it has no unambiguous answer, so the affordance
   * simply does not appear — a missing offer costs nothing, a paraphrase
   * attached to the wrong half of a sentence costs trust.
   */
  private findSelectionContext(
    state: ActiveState,
    anchor: Node,
    text: string,
  ): { sentence: string; selection: string } | null {
    const element = anchor.nodeType === 1 ? (anchor as Element) : anchor.parentElement;
    if (!element) return null;

    const block = state.blocks.find((candidate) => candidate.element.contains(element));
    if (!block) return null;

    for (const sentence of splitSentences(block.text, block.key)) {
      if (sentence.text.length > MAX_SENTENCE_LENGTH) continue;
      const occurrences = countOccurrences(sentence.text, text);
      if (occurrences === 1) return { sentence: sentence.text, selection: text };
    }
    return null;
  }

  /** The learner accepted the floating offer. */
  async simplifyPendingSelection(): Promise<Result<void>> {
    const state = this.active;
    const pending = this.pendingSelection;
    if (!state) return failure('SESSION_REPLACED');
    if (!pending) {
      this.overlay.setView({ kind: 'error', message: SELECTION_LOST });
      return failure('UNKNOWN_ERROR', SELECTION_LOST);
    }

    this.pendingSelection = null;
    this.overlay.setView({ kind: 'manual-loading', selection: pending.selection });

    const generated = await this.host.requestSelectionParaphrase(
      state.sessionId,
      pending.sentence,
      pending.selection,
    );
    if (!this.active || this.active.sessionId !== state.sessionId)
      return failure('SESSION_REPLACED');

    if (!generated.ok) {
      this.overlay.setView({ kind: 'error', message: generated.error.message });
      return generated;
    }

    const item = generated.data;
    const interactionId = createInteractionId();

    const recorded = await this.host.recordManual(state.sessionId, {
      interactionId,
      conceptId: item.conceptId,
      original: item.exactSourceText,
      simplified: item.simplifiedSurface,
      register: item.register,
      complexity: item.complexity,
    });

    if (recorded.ok) {
      state.plan = recorded.data.plan;
      this.refreshOwedMarks(state);
    }

    this.overlay.setView({
      kind: 'manual',
      result: {
        item,
        interactionId,
        persist: recorded.ok ? 'saved' : 'error',
        persistMessage: recorded.ok ? null : recorded.error.message,
      },
    });

    return success(undefined);
  }
}

/** Word-boundary-free count: the learner selected exact characters. */
function countOccurrences(haystack: string, needle: string): number {
  if (needle.length === 0) return 0;
  let count = 0;
  let index = haystack.indexOf(needle);
  while (index !== -1) {
    count += 1;
    index = haystack.indexOf(needle, index + needle.length);
  }
  return count;
}

const SELECTION_LOST = 'La sélection a été perdue. Sélectionnez à nouveau le passage à simplifier.';
