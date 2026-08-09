/**
 * The on-page challenge and Truth Card.
 *
 * Five states, all reachable and all tested:
 *   1. the question
 *   2. a correct result
 *   3. an incorrect result
 *   4. persisted, with the review schedule stated
 *   5. a recoverable storage failure — the answer still reads, it just did not save
 *
 * Accessibility rules enforced here rather than left to convention: the card is
 * a modal dialog with a focus trap, Escape closes without submitting, focus
 * returns to the token that opened it, and the result is announced through an
 * `aria-live` region. Nothing depends on colour: each choice carries a glyph
 * and a word as well.
 */

import { useCallback, useEffect, useRef, useSyncExternalStore } from 'react';
import type { OverlayStore, ResultView } from '../overlay-store';
import type { ContextTrap } from '../../domain/trap';
import { learningItemKind, primaryDistractor } from '../../domain/trap';
import { delfLevelForDifficulty } from '../../domain/delf';
import { Moon, PHASE_DESCRIPTION, PHASE_LABEL } from './Moon';
import { speakFrench } from './speak-french';

const CHOICE_KEYS = ['1', '2', '3'] as const;

export interface OverlayCallbacks {
  readonly onAnswer: (trapId: string, choice: string) => void;
  readonly onClose: () => void;
}

interface OverlayProps extends OverlayCallbacks {
  readonly store: OverlayStore;
}

export function ChallengeOverlay({ store, onAnswer, onClose }: OverlayProps) {
  const state = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);

  if (state.kind === 'closed') return null;

  if (state.kind === 'question') {
    const choices = orderedChoices(state.trap, state.interactionId);
    return (
      <Dialog
        onClose={onClose}
        labelledBy="eclipse-title"
        onChoiceShortcut={(index) => {
          const choice = choices[index];
          if (choice) onAnswer(state.trap.id, choice);
        }}
      >
        <QuestionView
          trap={state.trap}
          interactionId={state.interactionId}
          onAnswer={onAnswer}
          onClose={onClose}
        />
      </Dialog>
    );
  }

  return (
    <Dialog onClose={onClose} labelledBy="eclipse-title">
      <TruthCard result={state.result} onClose={onClose} />
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Modal shell
// ---------------------------------------------------------------------------

interface DialogProps {
  readonly children: React.ReactNode;
  readonly onClose: () => void;
  readonly labelledBy: string;
  readonly onChoiceShortcut?: (index: number) => void;
}

function Dialog({ children, onClose, labelledBy, onChoiceShortcut }: DialogProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  // Move focus into the card on open, and keep it there.
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    const first = card.querySelector<HTMLElement>(FOCUSABLE);
    (first ?? card).focus();
  }, []);

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        onClose();
        return;
      }
      if (
        onChoiceShortcut &&
        !event.altKey &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.shiftKey &&
        !event.repeat &&
        /^[1-3]$/.test(event.key)
      ) {
        event.preventDefault();
        event.stopPropagation();
        onChoiceShortcut(Number(event.key) - 1);
        return;
      }
      if (event.key !== 'Tab') return;

      const card = cardRef.current;
      if (!card) return;
      const focusable = Array.from(card.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (element) => !element.hasAttribute('disabled'),
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;

      const active = card.getRootNode() as ShadowRoot | Document;
      const current = active.activeElement;

      if (event.shiftKey && current === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && current === last) {
        event.preventDefault();
        first.focus();
      }
    },
    [onChoiceShortcut, onClose],
  );

  return (
    <div className="eclipse-root" onKeyDown={onKeyDown}>
      <div className="eclipse-scrim" onClick={onClose} aria-hidden="true" />
      <div
        className="eclipse-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
        ref={cardRef}
      >
        {children}
      </div>
    </div>
  );
}

const FOCUSABLE =
  'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

// ---------------------------------------------------------------------------
// State 1 — the question
// ---------------------------------------------------------------------------

interface QuestionProps {
  readonly trap: ContextTrap;
  readonly interactionId: string;
  readonly onAnswer: (trapId: string, choice: string) => void;
  readonly onClose: () => void;
}

function QuestionView({ trap, interactionId, onAnswer, onClose }: QuestionProps) {
  const kind = learningItemKind(trap);
  const delfLevel = delfLevelForDifficulty(trap.difficulty);
  const choices = orderedChoices(trap, interactionId);
  return (
    <>
      <header className="eclipse-header">
        <div className="eclipse-command">
          <span className="eclipse-command-orbit" aria-hidden="true" />
          <p className="eclipse-eyebrow">
            French {kind} <span aria-hidden="true">·</span> DELF {delfLevel}
          </p>
        </div>
        <CloseButton onClose={onClose} />
      </header>

      <SurfaceWord text={trap.targetSurface} id="eclipse-title" />
      <p className="eclipse-question">
        What does this {kind === 'phrase' ? 'whole phrase' : 'word'} mean here?
      </p>

      <Sentence trap={trap} />

      <ul className="eclipse-choices">
        {choices.map((choice, index) => (
          <li key={choice}>
            <button
              type="button"
              className="eclipse-choice"
              onClick={() => onAnswer(trap.id, choice)}
              data-eclipse-choice={choice}
            >
              <span className="eclipse-choice-key" aria-hidden="true">
                {CHOICE_KEYS[index]}
              </span>
              <span>{choice}</span>
            </button>
          </li>
        ))}
      </ul>
      <div className="eclipse-shortcuts" aria-hidden="true">
        <span>
          <kbd>1–3</kbd> answer
        </span>
        <span>
          <kbd>esc</kbd> close
        </span>
      </div>
    </>
  );
}

/**
 * The sentence with the French surface highlighted in place, so the learner
 * reads the trap in its context rather than as a flashcard.
 */
function Sentence({ trap }: { readonly trap: ContextTrap }) {
  const index = trap.sentence.indexOf(trap.exactSourceText);
  if (index < 0) {
    return (
      <p className="eclipse-sentence" lang="en">
        {trap.sentence}
      </p>
    );
  }

  const before = trap.sentence.slice(0, index);
  const after = trap.sentence.slice(index + trap.exactSourceText.length);

  return (
    <p className="eclipse-sentence" lang="en">
      {before}
      <mark lang="fr-FR">{trap.targetSurface}</mark>
      {after}
    </p>
  );
}

/** The French word or phrase, paired with a button to hear it spoken aloud. */
function SurfaceWord({ text, id }: { readonly text: string; readonly id?: string }) {
  return (
    <div className="eclipse-surface-row">
      <p className="eclipse-surface" lang="fr-FR" id={id}>
        {text}
      </p>
      <button
        type="button"
        className="eclipse-speak"
        aria-label={`Listen to "${text}" in French`}
        onClick={() => speakFrench(text)}
      >
        <span aria-hidden="true">🔊</span>
      </button>
    </div>
  );
}

function CloseButton({ onClose }: { readonly onClose: () => void }) {
  // The shell owns Escape; this is the pointer affordance for the same action.
  return (
    <button
      type="button"
      className="eclipse-close"
      data-eclipse-close
      aria-label="Close challenge without answering"
      onClick={onClose}
    >
      <span aria-hidden="true">✕</span>
    </button>
  );
}

// ---------------------------------------------------------------------------
// States 2–5 — the Truth Card
// ---------------------------------------------------------------------------

interface TruthCardProps {
  readonly result: ResultView;
  readonly onClose: () => void;
}

function TruthCard({ result, onClose }: TruthCardProps) {
  const { trap, interactionId, correct, selected } = result;
  const distractor = primaryDistractor(trap);
  const kind = learningItemKind(trap);
  const choices = orderedChoices(trap, interactionId);

  return (
    <>
      <header className="eclipse-header">
        <div className="eclipse-command">
          <span className="eclipse-command-orbit" aria-hidden="true" />
          <p className="eclipse-eyebrow">
            {kind === 'phrase' ? 'Phrase translation' : 'Translation'}{' '}
            <span aria-hidden="true">·</span> DELF {delfLevelForDifficulty(trap.difficulty)}
          </p>
        </div>
      </header>

      <p className="eclipse-verdict" data-correct={String(correct)} id="eclipse-title">
        <span className="eclipse-verdict-glyph" aria-hidden="true">
          {correct ? '✓' : '✕'}
        </span>
        {correct ? 'Correct' : 'Not this time'}
      </p>

      {/* The only announcement. Phrased so it stands alone out of context. */}
      <p className="eclipse-visually-hidden" role="status" aria-live="polite">
        {correct
          ? `Correct. ${trap.targetSurface} means ${trap.acceptedChoice} here.`
          : `Incorrect. You chose ${selected}. ${trap.targetSurface} means ${trap.acceptedChoice} here.`}
      </p>

      <div className="eclipse-translation-pair">
        <div>
          <p className="eclipse-section-label">French</p>
          <SurfaceWord text={trap.targetSurface} />
        </div>
        <span className="eclipse-translation-arrow" aria-hidden="true">
          →
        </span>
        <div>
          <p className="eclipse-section-label">English translation</p>
          <p className="eclipse-translation">{trap.acceptedChoice}</p>
        </div>
      </div>

      <div className="eclipse-reason-grid">
        <div className="eclipse-section" data-kind="why">
          <p className="eclipse-section-label">Why it fits</p>
          <p className="eclipse-section-body">{trap.explanation}</p>
        </div>

        <div className="eclipse-section" data-kind="why-not">
          <p className="eclipse-section-label">Why not “{distractor}”</p>
          <p className="eclipse-section-body">{trap.distractorExplanation}</p>
        </div>
      </div>

      <ul className="eclipse-choices" aria-label="Your answer">
        {choices.map((choice) => {
          const state =
            choice === trap.acceptedChoice
              ? 'correct'
              : choice === selected
                ? 'incorrect'
                : undefined;
          return (
            <li key={choice}>
              <button
                type="button"
                className="eclipse-choice"
                data-eclipse-choice={choice}
                data-state={state}
                disabled
              >
                <span className="eclipse-choice-key" aria-hidden="true">
                  {state === 'correct' ? '✓' : state === 'incorrect' ? '✕' : ''}
                </span>
                <span>{choice}</span>
                {state && (
                  <span className="eclipse-choice-mark">{markFor(state, choice === selected)}</span>
                )}
              </button>
            </li>
          );
        })}
      </ul>

      <PhasePanel result={result} />
      <PersistNote result={result} />

      <div className="eclipse-actions">
        <button type="button" className="eclipse-primary" onClick={onClose}>
          Keep reading
        </button>
      </div>
    </>
  );
}

const CHOICE_PERMUTATIONS = [
  [0, 1, 2],
  [0, 2, 1],
  [1, 0, 2],
  [1, 2, 0],
  [2, 0, 1],
  [2, 1, 0],
] as const;

/** Stable per interaction, varied across interactions, and independent of render timing. */
function orderedChoices(trap: ContextTrap, interactionId: string): ContextTrap['choices'] {
  let hash = 0x811c9dc5;
  const key = `${interactionId}:${trap.id}`;
  for (let index = 0; index < key.length; index += 1) {
    hash ^= key.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }

  const permutation = CHOICE_PERMUTATIONS[(hash >>> 0) % CHOICE_PERMUTATIONS.length]!;
  return [trap.choices[permutation[0]], trap.choices[permutation[1]], trap.choices[permutation[2]]];
}

function markFor(state: 'correct' | 'incorrect', wasSelected: boolean): string {
  if (state === 'correct') return wasSelected ? 'Correct — your answer' : 'Correct answer';
  return 'Your answer';
}

function PhasePanel({ result }: { readonly result: ResultView }) {
  const moved = result.phase !== result.previousPhase;
  return (
    <div className="eclipse-phase">
      <Moon phase={result.phase} />
      <p className="eclipse-phase-text">
        {moved ? (
          <>
            This concept moved to{' '}
            <span className="eclipse-phase-name">{PHASE_LABEL[result.phase]}</span> —{' '}
            {PHASE_DESCRIPTION[result.phase]}.
          </>
        ) : (
          <>
            Still <span className="eclipse-phase-name">{PHASE_LABEL[result.phase]}</span> —{' '}
            {PHASE_DESCRIPTION[result.phase]}.
          </>
        )}
      </p>
    </div>
  );
}

/** Truth Card states 4 and 5. */
function PersistNote({ result }: { readonly result: ResultView }) {
  if (result.persist === 'error') {
    return (
      <p className="eclipse-note" data-tone="error">
        {result.persistMessage ?? 'Your progress could not be saved.'} The answer above still stands
        — Eclipse will try again on your next answer.
      </p>
    );
  }

  if (result.persist === 'pending') {
    return <p className="eclipse-note">Saving your progress…</p>;
  }

  return <p className="eclipse-note">{result.reviewNote ?? 'Progress saved.'}</p>;
}
