/**
 * State shared between the session engine and the React overlay.
 *
 * A tiny external store rather than lifting state into React: the session
 * engine is the thing that owns the DOM and the profile writes, and it needs to
 * drive the overlay without the overlay owning it.
 */

import type { MoonPhase } from '../domain/profile';
import type { ContextTrap } from '../domain/trap';

/** How the answer's persistence went. Drives Truth Card states 4 and 5. */
export type PersistState = 'pending' | 'saved' | 'error';

export interface ResultView {
  readonly trap: ContextTrap;
  readonly interactionId: string;
  readonly selected: string;
  readonly correct: boolean;
  readonly previousPhase: MoonPhase;
  readonly phase: MoonPhase;
  readonly persist: PersistState;
  readonly persistMessage: string | null;
  /** Copy describing when this concept comes back. */
  readonly reviewNote: string | null;
}

export type OverlayState =
  | { readonly kind: 'closed' }
  | { readonly kind: 'question'; readonly trap: ContextTrap; readonly interactionId: string }
  | { readonly kind: 'result'; readonly result: ResultView };

export type OverlayListener = () => void;

export class OverlayStore {
  private state: OverlayState = { kind: 'closed' };
  private readonly listeners = new Set<OverlayListener>();

  getSnapshot = (): OverlayState => this.state;

  subscribe = (listener: OverlayListener): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  set(next: OverlayState): void {
    this.state = next;
    for (const listener of this.listeners) listener();
  }

  close(): void {
    this.set({ kind: 'closed' });
  }
}
