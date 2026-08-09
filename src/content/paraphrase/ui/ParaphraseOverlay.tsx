/**
 * The on-page paraphrase card.
 *
 * Six states, all reachable:
 *   1. the question — which wording was simplified away?
 *   2. a correct result
 *   3. an incorrect result
 *   4. a learner-requested simplification (no question: they asked, so they are
 *      told, and the request itself is the signal Eclipse learns from)
 *   5. waiting on the model
 *   6. a recoverable failure
 *
 * Plus the floating affordance that offers to simplify a live text selection.
 *
 * Accessibility is enforced here rather than left to convention, on the same
 * terms as the Translate Mode card: modal dialog with a focus trap, Escape
 * closes without answering, focus returns to the token that opened it, results
 * are announced through `aria-live`, and nothing depends on colour — every
 * choice carries a glyph and a word too.
 *
 * Interface copy is English while the reading material itself stays French.
 */

import { useCallback, useEffect, useRef, useSyncExternalStore } from 'react';
import type { ManualResultView, ParaphraseOverlayStore, ParaphraseResultView } from '../store';
import {
  REGISTER_LABEL,
  paraphraseItemKind,
  primaryParaphraseDistractor,
  type ParaphraseItem,
} from '../../../domain/paraphrase';
import { describeDirection } from '../../../domain/complexity';
import { speakFrench } from '../../ui/speak-french';

const CHOICE_KEYS = ['1', '2', '3'] as const;

const FOCUSABLE =
  'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

export interface ParaphraseOverlayCallbacks {
  readonly onAnswer: (itemId: string, choice: string) => void;
  readonly onClose: () => void;
  /** The learner accepted the floating offer to simplify their selection. */
  readonly onSimplifySelection: (text: string) => void;
  readonly onDismissPrompt: () => void;
}

interface OverlayProps extends ParaphraseOverlayCallbacks {
  readonly store: ParaphraseOverlayStore;
}

export function ParaphraseOverlay({
  store,
  onAnswer,
  onClose,
  onSimplifySelection,
  onDismissPrompt,
}: OverlayProps) {
  const { view, prompt } = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getSnapshot,
  );

  if (view.kind === 'closed') {
    if (!prompt) return null;
    return (
      <div className="ep-root" data-mode="prompt">
        <button
          type="button"
          className="ep-prompt"
          data-eclipse-paraphrase-prompt
          style={{
            top: Math.max(8, prompt.top - 44),
            left: Math.max(8, prompt.left),
          }}
          onClick={() => onSimplifySelection(prompt.text)}
          onBlur={onDismissPrompt}
        >
          <span className="ep-prompt-glyph" aria-hidden="true">
            ◐
          </span>
          Simplify this wording
        </button>
      </div>
    );
  }

  if (view.kind === 'question') {
    const choices = orderedChoices(view.item, view.interactionId);
    return (
      <Dialog
        onClose={onClose}
        onChoiceShortcut={(index) => {
          const choice = choices[index];
          if (choice) onAnswer(view.item.id, choice);
        }}
      >
        <QuestionView
          item={view.item}
          interactionId={view.interactionId}
          onAnswer={onAnswer}
          onClose={onClose}
        />
      </Dialog>
    );
  }

  if (view.kind === 'result') {
    return (
      <Dialog onClose={onClose}>
        <ResultCard result={view.result} onClose={onClose} />
      </Dialog>
    );
  }

  if (view.kind === 'manual-loading') {
    return (
      <Dialog onClose={onClose}>
        <header className="ep-header">
          <p className="ep-eyebrow">On-demand paraphrase</p>
          <CloseButton onClose={onClose} />
        </header>
        <div className="ep-spinner" role="status">
          <span aria-hidden="true" />
          <p id="ep-title">Eclipse is simplifying “{truncate(view.selection, 80)}”…</p>
        </div>
      </Dialog>
    );
  }

  if (view.kind === 'manual') {
    return (
      <Dialog onClose={onClose}>
        <ManualCard result={view.result} onClose={onClose} />
      </Dialog>
    );
  }

  return (
    <Dialog onClose={onClose}>
      <header className="ep-header">
        <p className="ep-eyebrow">Paraphrase</p>
        <CloseButton onClose={onClose} />
      </header>
      <p className="ep-verdict" data-correct="false" id="ep-title">
        <span className="ep-verdict-glyph" aria-hidden="true">
          !
        </span>
        Unable to simplify right now
      </p>
      <p className="ep-note" data-tone="error" role="alert">
        {view.message}
      </p>
      <div className="ep-actions">
        <button type="button" className="ep-primary" onClick={onClose}>
          Continue reading
        </button>
      </div>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Modal shell
// ---------------------------------------------------------------------------

interface DialogProps {
  readonly children: React.ReactNode;
  readonly onClose: () => void;
  readonly onChoiceShortcut?: (index: number) => void;
}

function Dialog({ children, onClose, onChoiceShortcut }: DialogProps) {
  const cardRef = useRef<HTMLDivElement>(null);

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
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;

      const root = card.getRootNode() as ShadowRoot | Document;
      const current = root.activeElement;

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
    <div className="ep-root" onKeyDown={onKeyDown}>
      <div className="ep-scrim" onClick={onClose} aria-hidden="true" />
      <div
        className="ep-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ep-title"
        tabIndex={-1}
        ref={cardRef}
      >
        {children}
      </div>
    </div>
  );
}

function CloseButton({ onClose }: { readonly onClose: () => void }) {
  return (
    <button
      type="button"
      className="ep-close"
      data-eclipse-paraphrase-close
      aria-label="Close without answering"
      onClick={onClose}
    >
      <span aria-hidden="true">✕</span>
    </button>
  );
}

function RegisterBadge({ item }: { readonly item: ParaphraseItem }) {
  return (
    <span className="ep-badge">
      <span aria-hidden="true">◐</span>
      {REGISTER_LABEL[item.register]}
    </span>
  );
}

// ---------------------------------------------------------------------------
// State 1 — the question
// ---------------------------------------------------------------------------

interface QuestionProps {
  readonly item: ParaphraseItem;
  readonly interactionId: string;
  readonly onAnswer: (itemId: string, choice: string) => void;
  readonly onClose: () => void;
}

function QuestionView({ item, interactionId, onAnswer, onClose }: QuestionProps) {
  const choices = orderedChoices(item, interactionId);
  const kind = paraphraseItemKind(item);

  return (
    <>
      <header className="ep-header">
        <div>
          <p className="ep-eyebrow">Paraphrase</p>
          <RegisterBadge item={item} />
        </div>
        <CloseButton onClose={onClose} />
      </header>

      <p className="ep-label">What you’re reading</p>
      <p className="ep-shown" lang="fr-FR" id="ep-title">
        {item.simplifiedSurface}
      </p>
      <p className="ep-question">
        Which original {kind === 'phrase' ? 'phrase' : 'wording'} was simplified here?
      </p>

      <SentenceWithSimplification item={item} />

      <p className="ep-clue">
        Clue in the sentence: <b>“{item.clueSpan}”</b>
      </p>

      <ul className="ep-choices">
        {choices.map((choice, index) => (
          <li key={choice}>
            <button
              type="button"
              className="ep-choice"
              lang="fr-FR"
              onClick={() => onAnswer(item.id, choice)}
              data-eclipse-paraphrase-choice={choice}
            >
              <span className="ep-choice-key" aria-hidden="true">
                {CHOICE_KEYS[index]}
              </span>
              <span>{choice}</span>
            </button>
          </li>
        ))}
      </ul>

      <div className="ep-shortcuts" aria-hidden="true">
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

/** The sentence as the reader currently sees it: simplification highlighted. */
function SentenceWithSimplification({ item }: { readonly item: ParaphraseItem }) {
  const index = item.sentence.indexOf(item.exactSourceText);
  if (index < 0) {
    return (
      <p className="ep-sentence" lang="fr-FR">
        {item.sentence}
      </p>
    );
  }
  return (
    <p className="ep-sentence" lang="fr-FR">
      {item.sentence.slice(0, index)}
      <mark>{item.simplifiedSurface}</mark>
      {item.sentence.slice(index + item.exactSourceText.length)}
    </p>
  );
}

/** The sentence as the author wrote it: original wording highlighted. */
function SentenceWithOriginal({ item }: { readonly item: ParaphraseItem }) {
  const index = item.sentence.indexOf(item.exactSourceText);
  if (index < 0) {
    return (
      <p className="ep-sentence" lang="fr-FR">
        {item.sentence}
      </p>
    );
  }
  return (
    <p className="ep-sentence" lang="fr-FR">
      {item.sentence.slice(0, index)}
      <mark>{item.exactSourceText}</mark>
      {item.sentence.slice(index + item.exactSourceText.length)}
    </p>
  );
}

function WordingPair({ item }: { readonly item: ParaphraseItem }) {
  return (
    <div className="ep-pair">
      <div>
        <p className="ep-label">Original wording</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <p className="ep-original" lang="fr-FR">
            {item.exactSourceText}
          </p>
          <button
            type="button"
            className="ep-close"
            aria-label={`Listen to “${item.exactSourceText}”`}
            onClick={() => speakFrench(item.exactSourceText)}
          >
            <span aria-hidden="true">🔊</span>
          </button>
        </div>
      </div>
      <span className="ep-arrow" aria-hidden="true">
        →
      </span>
      <div>
        <p className="ep-label">Simplified version</p>
        <p className="ep-simple" lang="fr-FR">
          {item.simplifiedSurface}
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// States 2–3 — the result
// ---------------------------------------------------------------------------

function ResultCard({
  result,
  onClose,
}: {
  readonly result: ParaphraseResultView;
  readonly onClose: () => void;
}) {
  const { item, interactionId, correct, selected } = result;
  const distractor = primaryParaphraseDistractor(item);
  const choices = orderedChoices(item, interactionId);

  return (
    <>
      <header className="ep-header">
        <div>
          <p className="ep-eyebrow">Paraphrase</p>
          <RegisterBadge item={item} />
        </div>
      </header>

      <p className="ep-verdict" data-correct={String(correct)} id="ep-title">
        <span className="ep-verdict-glyph" aria-hidden="true">
          {correct ? '✓' : '✕'}
        </span>
        {correct ? 'Correct' : 'Not quite'}
      </p>

      {/* The only announcement. Phrased so it stands alone out of context. */}
      <p className="ep-visually-hidden" role="status" aria-live="polite">
        {correct
          ? `Correct. The original wording was “${item.exactSourceText},” which means ${item.plainMeaning}`
          : `Incorrect. You chose “${selected}.” The original wording was “${item.exactSourceText},” which means ${item.plainMeaning}`}
      </p>

      <WordingPair item={item} />
      <SentenceWithOriginal item={item} />

      <ul className="ep-choices" aria-label="Your answer">
        {choices.map((choice) => {
          const state =
            choice === item.acceptedChoice
              ? 'correct'
              : choice === selected
                ? 'incorrect'
                : undefined;
          return (
            <li key={choice}>
              <button
                type="button"
                className="ep-choice"
                lang="fr-FR"
                data-eclipse-paraphrase-choice={choice}
                data-state={state}
                disabled
              >
                <span className="ep-choice-key" aria-hidden="true">
                  {state === 'correct' ? '✓' : state === 'incorrect' ? '✕' : ''}
                </span>
                <span>{choice}</span>
                {state && (
                  <span className="ep-choice-mark">
                    {state === 'correct'
                      ? choice === selected
                        ? 'Correct — your answer'
                        : 'Correct answer'
                      : 'Your answer'}
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>

      <div className="ep-sections">
        <div className="ep-section" data-kind="meaning">
          <p className="ep-label">In plain language</p>
          <p className="ep-body" lang="fr-FR">
            {item.plainMeaning}
          </p>
        </div>
        <div className="ep-section">
          <p className="ep-label">Why the simplification works</p>
          <p className="ep-body" lang="fr-FR">
            {item.explanation}
          </p>
        </div>
        <div className="ep-section">
          <p className="ep-label">Why not “{distractor}”</p>
          <p className="ep-body" lang="fr-FR">
            {item.distractorExplanation}
          </p>
        </div>
      </div>

      <BandPanel
        target={result.target}
        previousTarget={result.previousTarget}
        note={describeDirection(result.direction)}
      />

      {result.owed && (
        <p className="ep-note">
          Eclipse will revisit this wording on a future page where it fits naturally.
        </p>
      )}

      <PersistNote persist={result.persist} message={result.persistMessage} />

      <div className="ep-actions">
        <button type="button" className="ep-primary" onClick={onClose}>
          Continue reading
        </button>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// State 4 — a learner-requested simplification
// ---------------------------------------------------------------------------

function ManualCard({
  result,
  onClose,
}: {
  readonly result: ManualResultView;
  readonly onClose: () => void;
}) {
  const { item } = result;
  return (
    <>
      <header className="ep-header">
        <div>
          <p className="ep-eyebrow">On-demand paraphrase</p>
          <RegisterBadge item={item} />
        </div>
        <CloseButton onClose={onClose} />
      </header>

      <p className="ep-visually-hidden" role="status" aria-live="polite">
        {`“${item.exactSourceText}” can be said more simply as “${item.simplifiedSurface}.” ${item.plainMeaning}`}
      </p>

      <p className="ep-label" id="ep-title">
        Your simplified selection
      </p>
      <WordingPair item={item} />
      <SentenceWithOriginal item={item} />

      <div className="ep-sections">
        <div className="ep-section" data-kind="meaning">
          <p className="ep-label">In plain language</p>
          <p className="ep-body" lang="fr-FR">
            {item.plainMeaning}
          </p>
        </div>
        <div className="ep-section">
          <p className="ep-label">Why the simplification works</p>
          <p className="ep-body" lang="fr-FR">
            {item.explanation}
          </p>
        </div>
      </div>

      <p className="ep-note">
        Eclipse has noted that this wording gave you pause and will show it again later.
      </p>

      <PersistNote persist={result.persist} message={result.persistMessage} />

      <div className="ep-actions">
        <button type="button" className="ep-primary" onClick={onClose}>
          Continue reading
        </button>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Shared pieces
// ---------------------------------------------------------------------------

/**
 * Where Eclipse is aiming, and where it was aiming a moment ago.
 *
 * The ghost mark is the point: without it the meter is a number nobody can read
 * a change out of, and the adaptive behaviour the mode is built on stays
 * invisible to the person it is adapting to.
 */
function BandPanel({
  target,
  previousTarget,
  note,
}: {
  readonly target: number;
  readonly previousTarget: number;
  readonly note: string;
}) {
  const percent = Math.round(clamp01(target) * 100);
  const ghost = Math.round(clamp01(previousTarget) * 100);
  return (
    <div className="ep-band">
      <div
        className="ep-meter"
        role="img"
        aria-label={`Eclipse’s target level: ${percent} out of 100, compared with ${ghost} before this answer.`}
      >
        <span className="ep-meter-fill" style={{ width: `${percent}%` }} />
        <span className="ep-meter-ghost" style={{ left: `calc(${ghost}% - 1px)` }} />
      </div>
      <p className="ep-band-text">{note}</p>
    </div>
  );
}

function PersistNote({
  persist,
  message,
}: {
  readonly persist: 'pending' | 'saved' | 'error';
  readonly message: string | null;
}) {
  if (persist === 'error') {
    return (
      <p className="ep-note" data-tone="error">
        {message ?? 'Your progress could not be saved.'} Your answer above still counts — Eclipse
        will try again next time.
      </p>
    );
  }
  if (persist === 'pending') return <p className="ep-note">Saving…</p>;
  return null;
}

function clamp01(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

function truncate(value: string, max: number): string {
  return value.length <= max ? value : `${value.slice(0, max - 1)}…`;
}

const CHOICE_PERMUTATIONS = [
  [0, 1, 2],
  [0, 2, 1],
  [1, 0, 2],
  [1, 2, 0],
  [2, 0, 1],
  [2, 1, 0],
] as const;

/**
 * Stable per interaction, varied across interactions, independent of render
 * timing. Deriving it from the interaction id rather than from a random seed is
 * what stops the order changing underneath a learner on re-render — and what
 * keeps the result card's list in the same order as the question's.
 */
function orderedChoices(item: ParaphraseItem, interactionId: string): ParaphraseItem['choices'] {
  let hash = 0x811c9dc5;
  const key = `${interactionId}:${item.id}`;
  for (let index = 0; index < key.length; index += 1) {
    hash ^= key.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  const permutation = CHOICE_PERMUTATIONS[(hash >>> 0) % CHOICE_PERMUTATIONS.length]!;
  return [item.choices[permutation[0]], item.choices[permutation[1]], item.choices[permutation[2]]];
}
