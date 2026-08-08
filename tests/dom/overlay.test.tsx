/**
 * The challenge overlay: its five states and its accessibility contract.
 *
 * Rendered with the real React runtime into a real container, because the
 * things worth testing here — focus, roles, live regions, whether correctness
 * survives without colour — are all DOM facts.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createRoot, type Root } from 'react-dom/client';
import { act } from 'react';
import { ChallengeOverlay } from '@/content/ui/ChallengeOverlay';
import { OverlayStore, type ResultView } from '@/content/overlay-store';
import { validTrap } from '../fixtures/traps';

let container: HTMLElement;
let root: Root;
let store: OverlayStore;
const onAnswer = vi.fn();
const onClose = vi.fn();

function render() {
  act(() => {
    root.render(<ChallengeOverlay store={store} onAnswer={onAnswer} onClose={onClose} />);
  });
}

function set(state: Parameters<OverlayStore['set']>[0]) {
  act(() => {
    store.set(state);
  });
}

function result(overrides: Partial<ResultView> = {}): ResultView {
  return {
    trap: validTrap(),
    interactionId: 'int_1',
    selected: 'wait',
    correct: true,
    previousPhase: 'new_moon',
    phase: 'crescent',
    persist: 'saved',
    persistMessage: null,
    reviewNote: 'Saved. Nothing owed on this one.',
    ...overrides,
  };
}

function choiceButtons(): HTMLButtonElement[] {
  return Array.from(container.querySelectorAll<HTMLButtonElement>('.eclipse-choice'));
}

beforeEach(() => {
  document.body.innerHTML = '';
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
  store = new OverlayStore();
  onAnswer.mockReset();
  onClose.mockReset();
  render();
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

describe('closed', () => {
  it('renders nothing', () => {
    expect(container.innerHTML).toBe('');
  });
});

describe('state 1 — the question', () => {
  beforeEach(() => {
    set({ kind: 'question', trap: validTrap(), interactionId: 'int_1' });
  });

  it('is a labelled modal dialog', () => {
    const dialog = container.querySelector('[role="dialog"]');
    expect(dialog).not.toBeNull();
    expect(dialog?.getAttribute('aria-modal')).toBe('true');
    expect(dialog?.getAttribute('aria-labelledby')).toBe('eclipse-title');
    expect(container.querySelector('#eclipse-title')?.textContent).toBe('attendre');
  });

  it('shows the fixed language pair', () => {
    expect(container.querySelector('.eclipse-eyebrow')?.textContent).toBe('English → French');
  });

  it('marks the French surface with lang="fr-FR"', () => {
    expect(container.querySelector('#eclipse-title')?.getAttribute('lang')).toBe('fr-FR');
  });

  it('offers exactly three choices as real buttons', () => {
    const choices = choiceButtons();
    expect(choices).toHaveLength(3);
    for (const choice of choices) {
      expect(choice.tagName).toBe('BUTTON');
      expect(choice.getAttribute('type')).toBe('button');
    }
    expect(choices.map((c) => c.textContent)).toEqual(['1wait', '2hope', '3hear']);
  });

  it('shows the sentence with the French surface in place of the English span', () => {
    const sentence = container.querySelector('.eclipse-sentence');
    expect(sentence?.textContent).toContain('We had to ');
    expect(sentence?.querySelector('mark')?.textContent).toBe('attendre');
    expect(sentence?.textContent).not.toContain('to wait for');
  });

  it('reports the chosen meaning back to the session', () => {
    choiceButtons()[1]!.click();
    expect(onAnswer).toHaveBeenCalledWith('fr:attendre:wait@0:10', 'hope');
  });

  it('moves focus into the card on open', () => {
    expect(container.contains(document.activeElement)).toBe(true);
  });

  it('closes on Escape without submitting', () => {
    const dialog = container.querySelector('.eclipse-root')!;
    dialog.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }),
    );
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onAnswer).not.toHaveBeenCalled();
  });

  it('offers a close control that does not submit', () => {
    const close = container.querySelector<HTMLButtonElement>('[data-eclipse-close]');
    expect(close?.getAttribute('aria-label')).toMatch(/without answering/i);
    close!.click();
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onAnswer).not.toHaveBeenCalled();
  });

  it('closes when the scrim is clicked', () => {
    container.querySelector<HTMLElement>('.eclipse-scrim')!.click();
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

describe('state 2 — correct', () => {
  beforeEach(() => {
    set({ kind: 'result', result: result({ correct: true }) });
  });

  it('states the verdict in words as well as colour', () => {
    const verdict = container.querySelector('.eclipse-verdict');
    expect(verdict?.textContent).toContain('Correct');
    expect(verdict?.getAttribute('data-correct')).toBe('true');
    // A glyph too, so the meaning survives greyscale and colour blindness.
    expect(verdict?.querySelector('.eclipse-verdict-glyph')?.textContent).toBe('✓');
  });

  it('announces the outcome through a live region', () => {
    const live = container.querySelector('[aria-live="polite"]');
    expect(live?.getAttribute('role')).toBe('status');
    expect(live?.textContent).toContain('Correct');
    expect(live?.textContent).toContain('attendre');
    expect(live?.textContent).toContain('wait');
  });

  it('reveals the meaning, the clue, the reason and the distractor', () => {
    const text = container.textContent ?? '';
    expect(text).toContain('Means here');
    expect(text).toContain('The clue');
    expect(container.querySelector('.eclipse-clue')?.textContent).toBe('for the bus');
    expect(text).toContain('attendre is to wait for something.');
    expect(text).toContain('Why not “hope”');
    expect(text).toContain('hope is esperer');
  });

  it('marks each choice with a glyph and a word, not colour alone', () => {
    const choices = choiceButtons();
    const correct = choices.find((c) => c.getAttribute('data-state') === 'correct');
    expect(correct?.textContent).toContain('✓');
    expect(correct?.textContent).toContain('Correct');
    for (const choice of choices) expect(choice.disabled).toBe(true);
  });

  it('shows the updated moon phase with its name in text', () => {
    const phase = container.querySelector('.eclipse-phase');
    expect(phase?.textContent).toContain('Crescent');
    expect(phase?.querySelector('svg')?.getAttribute('aria-label')).toMatch(/Crescent/);
  });
});

describe('state 3 — incorrect', () => {
  beforeEach(() => {
    set({ kind: 'result', result: result({ correct: false, selected: 'hope' }) });
  });

  it('says so in words and marks both the answer and the truth', () => {
    expect(container.querySelector('.eclipse-verdict')?.textContent).toContain('Not this time');
    expect(container.querySelector('.eclipse-verdict-glyph')?.textContent).toBe('✕');

    const choices = choiceButtons();
    const chosen = choices.find((c) => c.textContent?.includes('hope'));
    const truth = choices.find((c) => c.textContent?.includes('wait'));
    expect(chosen?.getAttribute('data-state')).toBe('incorrect');
    expect(chosen?.textContent).toContain('Your answer');
    expect(truth?.getAttribute('data-state')).toBe('correct');
  });

  it('announces what was chosen and what was right', () => {
    const live = container.querySelector('[aria-live="polite"]');
    expect(live?.textContent).toContain('Incorrect');
    expect(live?.textContent).toContain('You chose hope');
    expect(live?.textContent).toContain('means wait here');
  });
});

describe('state 4 — persisted, review scheduled', () => {
  it('says when the concept comes back', () => {
    set({
      kind: 'result',
      result: result({ reviewNote: 'Saved. Review scheduled in 3 days.' }),
    });
    expect(container.querySelector('.eclipse-note')?.textContent).toBe(
      'Saved. Review scheduled in 3 days.',
    );
  });

  it('shows a pending state while the write is in flight', () => {
    set({ kind: 'result', result: result({ persist: 'pending' }) });
    expect(container.querySelector('.eclipse-note')?.textContent).toMatch(/Saving/);
  });
});

describe('state 5 — recoverable storage failure', () => {
  beforeEach(() => {
    set({
      kind: 'result',
      result: result({ persist: 'error', persistMessage: 'Your progress could not be saved.' }),
    });
  });

  it('is flagged as an error but still shows the answer', () => {
    const note = container.querySelector('.eclipse-note');
    expect(note?.getAttribute('data-tone')).toBe('error');
    expect(note?.textContent).toContain('could not be saved');
    expect(note?.textContent).toContain('still');
    expect(container.querySelector('.eclipse-verdict')?.textContent).toContain('Correct');
  });
});

describe('focus trap', () => {
  it('wraps from the last focusable element back to the first', () => {
    set({ kind: 'question', trap: validTrap(), interactionId: 'int_1' });

    const focusable = Array.from(container.querySelectorAll<HTMLElement>('button:not([disabled])'));
    expect(focusable.length).toBeGreaterThan(1);

    const last = focusable[focusable.length - 1]!;
    last.focus();
    expect(document.activeElement).toBe(last);

    container
      .querySelector('.eclipse-root')!
      .dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true }));
    expect(document.activeElement).toBe(focusable[0]);
  });

  it('wraps backwards from the first element to the last', () => {
    set({ kind: 'question', trap: validTrap(), interactionId: 'int_1' });
    const focusable = Array.from(container.querySelectorAll<HTMLElement>('button:not([disabled])'));
    const first = focusable[0]!;
    first.focus();

    container.querySelector('.eclipse-root')!.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Tab',
        shiftKey: true,
        bubbles: true,
        cancelable: true,
      }),
    );
    expect(document.activeElement).toBe(focusable[focusable.length - 1]);
  });
});

describe('no HTML from trap content ever becomes markup', () => {
  it('renders angle brackets as text', () => {
    // Validation rejects this upstream; this proves the renderer is safe even so.
    const hostile = validTrap({ explanation: 'plain text' });
    set({ kind: 'result', result: result({ trap: hostile }) });
    expect(container.querySelector('script')).toBeNull();
    expect(container.querySelector('img')).toBeNull();
  });
});
