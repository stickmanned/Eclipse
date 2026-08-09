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
    return (
      <Dialog onClose={onClose} labelledBy="eclipse-title">
        <QuestionView trap={state.trap} onAnswer={onAnswer} onClose={onClose} />
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
}

function Dialog({ children, onClose, labelledBy }: DialogProps) {
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
    [onClose],
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
  readonly onAnswer: (trapId: string, choice: string) => void;
  readonly onClose: () => void;
}

function QuestionView({ trap, onAnswer, onClose }: QuestionProps) {
  const kind = learningItemKind(trap);
  const delfLevel = delfLevelForDifficulty(trap.difficulty);
  return (
    <>
      <header className="eclipse-header">
        <p className="eclipse-eyebrow">
          French {kind} <span aria-hidden="true">·</span> DELF {delfLevel}
        </p>
        <CloseButton onClose={onClose} />
      </header>

      <p className="eclipse-surface" lang="fr-FR" id="eclipse-title">
        {trap.targetSurface}
      </p>
      <p className="eclipse-question">
        What does this {kind === 'phrase' ? 'whole phrase' : 'word'} mean here?
      </p>

      <Sentence trap={trap} />

      <ul className="eclipse-choices">
        {trap.choices.map((choice, index) => (
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
  const { trap, correct, selected } = result;
  const distractor = primaryDistractor(trap);
  const kind = learningItemKind(trap);

  return (
    <>
      <header className="eclipse-header">
        <p className="eclipse-eyebrow">
          {kind === 'phrase' ? 'Phrase translation' : 'Translation'}{' '}
          <span aria-hidden="true">·</span> DELF {delfLevelForDifficulty(trap.difficulty)}
        </p>
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

      <p className="eclipse-surface" lang="fr-FR">
        {trap.targetSurface}
      </p>

      <div className="eclipse-section">
        <p className="eclipse-section-label">English translation</p>
        <p className="eclipse-section-body">{trap.acceptedChoice}</p>
      </div>

      <div className="eclipse-section">
        <p className="eclipse-section-label">The clue</p>
        <p className="eclipse-section-body">
          <span className="eclipse-clue">{trap.clueSpan}</span>
        </p>
      </div>

      <div className="eclipse-section">
        <p className="eclipse-section-label">Why</p>
        <p className="eclipse-section-body">{trap.explanation}</p>
      </div>

      <div className="eclipse-section">
        <p className="eclipse-section-label">Why not “{distractor}”</p>
        <p className="eclipse-section-body">{trap.distractorExplanation}</p>
      </div>

      <ul className="eclipse-choices" aria-label="Your answer">
        {trap.choices.map((choice) => {
          const state =
            choice === trap.acceptedChoice
              ? 'correct'
              : choice === selected
                ? 'incorrect'
                : undefined;
          return (
            <li key={choice}>
              <button type="button" className="eclipse-choice" data-state={state} disabled>
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
