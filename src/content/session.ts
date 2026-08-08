/**
 * The Eclipse content-script session.
 *
 * Owns article analysis, trap selection, DOM mutation and restoration,
 * challenge interaction state, and — uniquely in the extension — writing answer
 * outcomes to the learner profile.
 *
 * Activation is all-or-nothing. If anything fails partway through placing
 * tokens, every token already inserted is taken back out before the failure is
 * returned, so the page is never left half-transformed.
 */

import { createInteractionId } from '../domain/ids';
import { failure, success, type Failure, type Result } from '../domain/errors';
import type { ActivatedData, DeactivatedData } from '../domain/messages';
import { normalizedVisibleText } from '../domain/normalize';
import { recordAnswer } from '../domain/mastery';
import { isDue, currentIntervalDays } from '../domain/scheduling';
import { DEFAULT_SELECTION_LIMITS } from '../domain/selection';
import type { LearnerProfile } from '../domain/profile';
import { isCorrectChoice, type ContextTrap, type GeneratedTrapCandidate } from '../domain/trap';
import {
  collectEligibleBlocks,
  findArticleRoot,
  isArticleEligible,
  resolveRange,
  splitSentences,
  type EligibleBlock,
} from './article';
import { InvalidationWatcher, TokenRegistry } from './dom-tokens';
import { planPlacements, type GeneratedSentenceTarget, type Placement } from './place-traps';
import { OverlayStore } from './overlay-store';
import type { StorageArea } from '../storage/area';
import {
  hasInteraction,
  loadProfile,
  rememberInteraction,
  saveProfile,
} from '../storage/profile-store';

export interface SessionHost {
  /** Mount the overlay UI. Returns a teardown function. */
  mountOverlay(store: OverlayStore, callbacks: OverlayCallbacks): () => void;
  /** Inject the token stylesheet into the host document. Returns a teardown. */
  installTokenStyles(doc: Document): () => void;
  /** Storage area for the learner profile. */
  readonly storage: StorageArea;
  /** Called when the host page invalidates Eclipse's DOM. */
  onInvalidated?(): void;
  /**
   * Ask the background worker for generated traps. Optional: when absent, or
   * when it fails for any reason, the catalog traps already on the page stand.
   */
  requestGeneratedTraps?(
    sessionId: string,
    sentences: ProviderSentence[],
  ): Promise<Result<GeneratedTrapCandidate[]>>;
}

export interface ProviderSentence {
  readonly id: string;
  readonly text: string;
}

/** Mirrors the provider client's limits so the two cannot drift apart. */
const MAX_PROVIDER_SENTENCES = 8;
const MAX_PROVIDER_SENTENCE_LENGTH = 300;
const MAX_CONCURRENT_PROVIDER_REQUESTS = 2;

export interface OverlayCallbacks {
  onAnswer(trapId: string, choice: string): void;
  onClose(): void;
}

interface ActiveState {
  readonly sessionId: string;
  readonly root: Element;
  readonly registry: TokenRegistry;
  readonly watcher: InvalidationWatcher;
  readonly traps: Map<string, ContextTrap>;
  readonly teardown: (() => void)[];
  /** Interaction id per trap, minted when the challenge first opens. */
  readonly interactions: Map<string, string>;
  /** Trap ids already answered in this session. */
  readonly answered: Set<string>;
  /** The blocks scanned at activation, for optional provider augmentation. */
  invalidated: boolean;
}

interface PreparedProviderRequest {
  readonly sentences: ProviderSentence[];
  readonly targets: GeneratedSentenceTarget[];
}

/**
 * Select sentences round-robin across blocks so one long paragraph cannot
 * crowd out the rest of the article. Every sentence overlaps at least one text
 * node Eclipse is permitted to replace.
 */
function prepareProviderRequests(blocks: readonly EligibleBlock[]): PreparedProviderRequest[] {
  const queues = blocks.map((block) => ({
    block,
    sentences: splitSentences(block.text, block.key).filter((sentence) => {
      if (sentence.text.length > MAX_PROVIDER_SENTENCE_LENGTH) return false;
      return block.nodes.some((node) => {
        const nodeEnd = node.offset + node.length;
        return node.offset < sentence.end && nodeEnd > sentence.start;
      });
    }),
  }));

  const sentences: ProviderSentence[] = [];
  const targets: GeneratedSentenceTarget[] = [];
  let sentenceIndex = 0;

  while (sentenceIndex < DEFAULT_SELECTION_LIMITS.maxTrapsPerBlock) {
    let added = false;
    for (const queue of queues) {
      const sentence = queue.sentences[sentenceIndex];
      if (!sentence) continue;

      const id = `s${sentences.length}`;
      sentences.push({ id, text: sentence.text });
      targets.push({ sentenceId: id, block: queue.block, sentence });
      added = true;
    }
    if (!added) break;
    sentenceIndex += 1;
  }

  const requests: PreparedProviderRequest[] = [];
  for (let start = 0; start < sentences.length; start += MAX_PROVIDER_SENTENCES) {
    requests.push({
      sentences: sentences.slice(start, start + MAX_PROVIDER_SENTENCES),
      targets: targets.slice(start, start + MAX_PROVIDER_SENTENCES),
    });
  }
  return requests;
}

interface ProviderBatchResult {
  readonly candidates: GeneratedTrapCandidate[];
  readonly targets: GeneratedSentenceTarget[];
  readonly failure: Failure | null;
}

export class ContentSession {
  private active: ActiveState | null = null;
  private pendingActivation: { readonly sessionId: string; readonly token: symbol } | null = null;
  readonly overlay = new OverlayStore();

  constructor(
    private readonly doc: Document,
    private readonly host: SessionHost,
  ) {}

  get sessionId(): string | null {
    return this.active?.sessionId ?? null;
  }

  get isActive(): boolean {
    return this.active !== null;
  }

  /** Trap ids currently placed. Test and debug affordance. */
  get placedTrapIds(): string[] {
    return this.active ? Array.from(this.active.traps.keys()) : [];
  }

  // -------------------------------------------------------------------------
  // Activation
  // -------------------------------------------------------------------------

  async activate(sessionId: string, providerEnabled = false): Promise<Result<ActivatedData>> {
    // Re-activating the same session is a no-op, not a second set of tokens.
    if (this.active?.sessionId === sessionId) {
      return success(this.describe(this.active));
    }
    if (this.active) {
      await this.deactivate(this.active.sessionId);
    }

    const activationToken = Symbol(sessionId);
    this.pendingActivation = { sessionId, token: activationToken };

    const root = findArticleRoot(this.doc);
    if (!root) return this.activationFailure(activationToken, 'NO_ARTICLE');

    const blocks = collectEligibleBlocks(root);
    if (!isArticleEligible(blocks)) return this.activationFailure(activationToken, 'NO_ARTICLE');

    const loaded = await loadProfile(this.host.storage);
    if (!this.isCurrentActivation(activationToken)) return failure('SESSION_REPLACED');
    if (!loaded.ok) {
      this.finishActivation(activationToken);
      return loaded;
    }
    const profile = loaded.data.profile;

    const selectionContext = {
      globalAbility: profile.globalAbility,
      mastery: profile.mastery,
      now: new Date(),
    };

    let placements = planPlacements(blocks, selectionContext);

    if (providerEnabled && this.host.requestGeneratedTraps) {
      const generated = await this.requestProviderBatches(sessionId, blocks);
      if (!this.isCurrentActivation(activationToken)) return failure('SESSION_REPLACED');

      if (generated.candidates.length > 0) {
        placements = planPlacements(blocks, selectionContext, {
          generatedCandidates: generated.candidates,
          generatedTargets: generated.targets,
        });
      } else if (placements.length < DEFAULT_SELECTION_LIMITS.minTraps && generated.failure) {
        this.finishActivation(activationToken);
        return generated.failure;
      }
    }

    if (placements.length < DEFAULT_SELECTION_LIMITS.minTraps) {
      return this.activationFailure(activationToken, 'NO_ELIGIBLE_TRAPS');
    }

    // Snapshot before the first mutation. This is what deactivation checks.
    const snapshot = normalizedVisibleText(root);
    const registry = new TokenRegistry(sessionId, root, snapshot);
    const watcher = new InvalidationWatcher(registry, () => this.handleInvalidation());

    const traps = new Map<string, ContextTrap>();
    const inserted = watcher.suppress(() => this.insertAll(registry, placements, traps));

    if (!inserted.ok) {
      watcher.suppress(() => registry.rollback());
      this.finishActivation(activationToken);
      return inserted;
    }

    const teardown: (() => void)[] = [];
    teardown.push(this.host.installTokenStyles(this.doc));
    teardown.push(
      this.host.mountOverlay(this.overlay, {
        onAnswer: (trapId, choice) => void this.submitAnswer(trapId, choice),
        onClose: () => this.closeChallenge(),
      }),
    );

    const state: ActiveState = {
      sessionId,
      root,
      registry,
      watcher,
      traps,
      teardown,
      interactions: new Map(),
      answered: new Set(),
      invalidated: false,
    };
    this.active = state;
    this.finishActivation(activationToken);

    this.doc.addEventListener('click', this.onDocumentClick, true);
    watcher.start(this.doc.documentElement);

    return success(this.describe(state));
  }

  private insertAll(
    registry: TokenRegistry,
    placements: readonly Placement[],
    traps: Map<string, ContextTrap>,
  ): Result<number> {
    for (const placement of placements) {
      const range = resolveRange(placement.block, placement.blockStart, placement.blockEnd);
      if (!range) {
        return failure('DOM_INVALIDATED', 'A trap range no longer resolves to a single text node.');
      }
      const token = registry.insert(range.node, range.start, range.end, placement.trap);
      if (!token) {
        return failure('DOM_INVALIDATED', 'A trap could not be inserted into the article.');
      }
      traps.set(placement.trap.id, placement.trap);
    }
    return success(traps.size);
  }

  /** Collect provider batches before the one atomic DOM placement pass. */
  private async requestProviderBatches(
    sessionId: string,
    blocks: readonly EligibleBlock[],
  ): Promise<ProviderBatchResult> {
    const request = this.host.requestGeneratedTraps;
    if (!request) return { candidates: [], targets: [], failure: null };

    const prepared = prepareProviderRequests(blocks);
    if (prepared.length === 0) return { candidates: [], targets: [], failure: null };

    const results: Array<Result<GeneratedTrapCandidate[]> | undefined> = new Array(
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
          results[index] = await request(sessionId, batch.sentences);
        } catch {
          results[index] = failure('PROVIDER_UNAVAILABLE');
        }
      }
    };

    await Promise.all(
      Array.from(
        { length: Math.min(MAX_CONCURRENT_PROVIDER_REQUESTS, prepared.length) },
        () => worker(),
      ),
    );

    const candidates: GeneratedTrapCandidate[] = [];
    const targets: GeneratedSentenceTarget[] = [];
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

  private isCurrentActivation(token: symbol): boolean {
    return this.pendingActivation?.token === token;
  }

  private finishActivation(token: symbol): void {
    if (this.pendingActivation?.token === token) this.pendingActivation = null;
  }

  private activationFailure(
    token: symbol,
    code: 'NO_ARTICLE' | 'NO_ELIGIBLE_TRAPS',
  ): Result<ActivatedData> {
    this.finishActivation(token);
    return failure(code);
  }

  private describe(state: ActiveState): ActivatedData {
    return {
      sessionId: state.sessionId,
      trapCount: state.traps.size,
      conceptIds: Array.from(state.traps.values()).map((trap) => trap.conceptId),
    };
  }

  // -------------------------------------------------------------------------
  // Deactivation
  // -------------------------------------------------------------------------

  async deactivate(sessionId?: string): Promise<Result<DeactivatedData>> {
    const pending = this.pendingActivation;
    if (pending && (!sessionId || sessionId === pending.sessionId)) {
      this.pendingActivation = null;
    }
    const state = this.active;
    if (!state) return success({ restored: false, textVerified: true });
    if (sessionId && sessionId !== state.sessionId) {
      return failure('SESSION_REPLACED', 'That session is no longer the active one.');
    }

    // Stop watching before restoring, so Eclipse's own removals are not read as
    // the page invalidating us.
    state.watcher.stop();
    this.doc.removeEventListener('click', this.onDocumentClick, true);
    this.overlay.close();

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
  // Challenge interaction
  // -------------------------------------------------------------------------

  /**
   * Captured on the document in the capture phase so a host page that stops
   * propagation on its own container cannot swallow the token's activation.
   * Keyboard activation of a `<button>` produces a click event too, so Enter
   * and Space arrive here as well.
   */
  private readonly onDocumentClick = (event: Event): void => {
    const state = this.active;
    if (!state) return;

    const target = event.target;
    if (!(target instanceof Element)) return;
    const token = target.closest<HTMLElement>('[data-eclipse-trap]');
    if (!token) return;

    const trapId = token.getAttribute('data-eclipse-trap');
    if (!trapId) return;
    const trap = state.traps.get(trapId);
    if (!trap) return;

    event.preventDefault();
    event.stopPropagation();
    this.openChallenge(trap);
  };

  openChallenge(trap: ContextTrap): void {
    const state = this.active;
    if (!state) return;

    let interactionId = state.interactions.get(trap.id);
    if (!interactionId) {
      interactionId = createInteractionId();
      state.interactions.set(trap.id, interactionId);
    }

    this.lastOpenedTrapId = trap.id;
    this.overlay.set({ kind: 'question', trap, interactionId });
  }

  closeChallenge(): void {
    this.overlay.close();
    this.returnFocusToToken();
  }

  private returnFocusToToken(): void {
    const state = this.active;
    const snapshot = this.overlay.getSnapshot();
    if (!state) return;

    const trapId =
      snapshot.kind === 'question'
        ? snapshot.trap.id
        : snapshot.kind === 'result'
          ? snapshot.result.trap.id
          : this.lastOpenedTrapId;

    if (!trapId) return;
    const token = state.registry.get(trapId)?.button;
    if (token?.isConnected) token.focus();
  }

  private lastOpenedTrapId: string | null = null;

  /**
   * Record an answer.
   *
   * The mastery update is applied exactly once per interaction id, guarded by a
   * persisted log rather than in-memory state so a reload between the answer and
   * a retried message cannot double-count it.
   */
  async submitAnswer(trapId: string, choice: string): Promise<Result<void>> {
    const state = this.active;
    if (!state) return failure('SESSION_REPLACED');

    const trap = state.traps.get(trapId);
    if (!trap) return failure('DOM_INVALIDATED', 'That challenge is no longer on the page.');
    if (!trap.choices.includes(choice)) {
      return failure('UNKNOWN_ERROR', 'That is not one of the offered meanings.');
    }

    const interactionId = state.interactions.get(trapId) ?? createInteractionId();
    state.interactions.set(trapId, interactionId);
    this.lastOpenedTrapId = trapId;

    const correct = isCorrectChoice(trap, choice);
    const token = state.registry.get(trapId)?.button;
    if (token) token.setAttribute('data-answered', correct ? 'correct' : 'incorrect');

    // Show the verdict immediately; persistence resolves into the same card.
    const loaded = await loadProfile(this.host.storage);
    if (!loaded.ok) {
      this.overlay.set({
        kind: 'result',
        result: {
          trap,
          interactionId,
          selected: choice,
          correct,
          previousPhase: 'new_moon',
          phase: 'new_moon',
          persist: 'error',
          persistMessage: loaded.error.message,
          reviewNote: null,
        },
      });
      return loaded;
    }

    const profile = loaded.data.profile;
    const alreadyRecorded =
      state.answered.has(trapId) || (await hasInteraction(this.host.storage, interactionId));

    if (alreadyRecorded) {
      // A replayed answer shows the same card and changes nothing.
      const existing = profile.mastery[trap.conceptId];
      this.overlay.set({
        kind: 'result',
        result: {
          trap,
          interactionId,
          selected: choice,
          correct,
          previousPhase: existing?.phase ?? 'new_moon',
          phase: existing?.phase ?? 'new_moon',
          persist: 'saved',
          persistMessage: null,
          reviewNote: reviewNoteFor(profile, trap, correct),
        },
      });
      return success(undefined);
    }

    const updated = recordAnswer({
      profile,
      interactionId,
      conceptId: trap.conceptId,
      difficulty: trap.difficulty,
      correct,
      now: new Date(),
    });

    const saved = await saveProfile(this.host.storage, updated.profile);
    if (!saved.ok) {
      this.overlay.set({
        kind: 'result',
        result: {
          trap,
          interactionId,
          selected: choice,
          correct,
          previousPhase: updated.previousPhase,
          phase: updated.phase,
          persist: 'error',
          persistMessage: saved.error.message,
          reviewNote: null,
        },
      });
      return saved;
    }

    await rememberInteraction(this.host.storage, interactionId);
    state.answered.add(trapId);

    this.overlay.set({
      kind: 'result',
      result: {
        trap,
        interactionId,
        selected: choice,
        correct,
        previousPhase: updated.previousPhase,
        phase: updated.phase,
        persist: 'saved',
        persistMessage: null,
        reviewNote: reviewNoteFor(updated.profile, trap, correct),
      },
    });

    return success(undefined);
  }
}

/** Truth Card state 4: say plainly when this concept comes back. */
function reviewNoteFor(profile: LearnerProfile, trap: ContextTrap, correct: boolean): string {
  const mastery = profile.mastery[trap.conceptId];
  if (!mastery) return 'Progress saved.';

  if (mastery.due.kind === 'next_occurrence') {
    return correct
      ? 'Saved. This one comes back at its next appearance.'
      : 'Saved. This one comes back the next time it appears on any page.';
  }

  if (mastery.due.kind === 'timestamp') {
    const days = Math.round(currentIntervalDays(mastery));
    if (days <= 0) return 'Saved. Review scheduled.';
    return `Saved. Review scheduled in ${days} ${days === 1 ? 'day' : 'days'}.`;
  }

  return 'Saved. Nothing owed on this one.';
}

/** Exported for tests: is this concept currently asking to be shown? */
export { isDue };
export type { EligibleBlock };
