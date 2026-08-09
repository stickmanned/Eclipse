/**
 * State shared between the paraphrase session engine and its React overlay.
 *
 * A tiny external store rather than lifting state into React, for the same
 * reason `overlay-store.ts` is one: the session engine owns the DOM and the
 * profile writes, and it needs to drive the overlay without the overlay owning
 * it.
 *
 * The modal and the floating "simplify this" affordance live in one snapshot
 * object rather than two stores. `useSyncExternalStore` compares snapshots by
 * identity, so two stores would mean two subscriptions and two re-render paths
 * for a UI that is always consistent by construction — the affordance is
 * dismissed the moment a card opens.
 */

import type { BandDirection } from '../../domain/complexity';
import type { ParaphraseConceptState } from '../../domain/paraphrase-profile';
import type { ParaphraseItem } from '../../domain/paraphrase';

/** How the answer's persistence went. */
export type PersistState = 'pending' | 'saved' | 'error';

export interface ParaphraseResultView {
  readonly item: ParaphraseItem;
  readonly interactionId: string;
  readonly selected: string;
  readonly correct: boolean;
  /** Which way the complexity band moved because of this answer. */
  readonly direction: BandDirection;
  readonly target: number;
  readonly previousTarget: number;
  readonly conceptState: ParaphraseConceptState;
  /** True when this wording is owed a reappearance on a later page. */
  readonly owed: boolean;
  readonly persist: PersistState;
  readonly persistMessage: string | null;
}

export interface ManualResultView {
  readonly item: ParaphraseItem;
  readonly interactionId: string;
  readonly persist: PersistState;
  readonly persistMessage: string | null;
}

export type ParaphraseView =
  | { readonly kind: 'closed' }
  | { readonly kind: 'question'; readonly item: ParaphraseItem; readonly interactionId: string }
  | { readonly kind: 'result'; readonly result: ParaphraseResultView }
  | { readonly kind: 'manual-loading'; readonly selection: string }
  | { readonly kind: 'manual'; readonly result: ManualResultView }
  | { readonly kind: 'error'; readonly message: string };

/** The floating affordance shown beside a live text selection. */
export interface SelectionPrompt {
  readonly text: string;
  /** Viewport coordinates of the selection's bounding box. */
  readonly top: number;
  readonly left: number;
  readonly width: number;
  readonly height: number;
}

export interface ParaphraseOverlaySnapshot {
  readonly view: ParaphraseView;
  readonly prompt: SelectionPrompt | null;
}

const CLOSED: ParaphraseOverlaySnapshot = { view: { kind: 'closed' }, prompt: null };

export type OverlayListener = () => void;

export class ParaphraseOverlayStore {
  private snapshot: ParaphraseOverlaySnapshot = CLOSED;
  private readonly listeners = new Set<OverlayListener>();

  getSnapshot = (): ParaphraseOverlaySnapshot => this.snapshot;

  subscribe = (listener: OverlayListener): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  /** Open or replace the modal. Any live selection affordance is dismissed. */
  setView(view: ParaphraseView): void {
    this.publish({ view, prompt: null });
  }

  /** Offer to simplify the current selection. Ignored while a card is open. */
  setPrompt(prompt: SelectionPrompt | null): void {
    if (prompt && this.snapshot.view.kind !== 'closed') return;
    if (prompt === null && this.snapshot.prompt === null) return;
    this.publish({ view: this.snapshot.view, prompt });
  }

  close(): void {
    this.publish(CLOSED);
  }

  private publish(next: ParaphraseOverlaySnapshot): void {
    this.snapshot = next;
    for (const listener of this.listeners) listener();
  }
}
