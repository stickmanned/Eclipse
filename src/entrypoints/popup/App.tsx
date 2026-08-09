/**
 * Eclipse popup: DELF diagnostic, reading-lens controls, session commands, and
 * compact mastery status. Learner history remains worker-owned; the popup only
 * sends explicit intents.
 */

import { useCallback, useEffect, useState } from 'react';
import { browser } from 'wxt/browser';
import {
  CALIBRATION_QUESTIONS,
  DIAGNOSTIC_SKILL_LABEL,
  scoreCalibration,
  type DiagnosticSkill,
} from '../../domain/calibration';
import { DELF_LEVEL_COPY, DELF_LEVELS, type DelfLevel } from '../../domain/delf';
import {
  MESSAGE_CONTRACT_VERSION,
  type EclipseMessage,
  type StatusData,
} from '../../domain/messages';
import { STALE_WORKER_MESSAGE, type Result } from '../../domain/errors';
import { unsupportedReasonText } from '../../domain/url-support';
import { Moon, PHASE_DESCRIPTION, PHASE_LABEL } from '../../content/ui/Moon';

type Phase = 'loading' | 'onboarding' | 'ready' | 'activating' | 'active';

function staleWorkerFailure(detail?: string): Result<never> {
  return {
    ok: false,
    error: {
      code: 'MESSAGE_UNSUPPORTED',
      message: detail ? `${STALE_WORKER_MESSAGE} (${detail})` : STALE_WORKER_MESSAGE,
      recoverable: true,
    },
  };
}

/**
 * A worker that never answers and a worker that answers "I don't understand"
 * are the same problem wearing two hats: the popup bundle and the service
 * worker came from different builds. Both resolve to one actionable failure so
 * the learner is never shown a bare Chrome runtime string.
 */
async function send<T>(message: EclipseMessage): Promise<Result<T>> {
  try {
    const response: unknown = await browser.runtime.sendMessage(message);
    if (response && typeof response === 'object' && 'ok' in response) {
      return response as Result<T>;
    }
    return staleWorkerFailure(`${message.type} went unanswered`);
  } catch (cause) {
    const detail = cause instanceof Error ? cause.message : 'Could not reach Eclipse.';
    return staleWorkerFailure(detail);
  }
}

/** True once the popup knows it is talking to a worker from another build. */
function isStaleWorker(result: Result<unknown>): boolean {
  return !result.ok && result.error.code === 'MESSAGE_UNSUPPORTED';
}

export function App() {
  const [status, setStatus] = useState<StatusData | null>(null);
  const [phase, setPhase] = useState<Phase>('loading');
  const [error, setError] = useState<string | null>(null);
  const [stale, setStale] = useState(false);
  const [confirmingReset, setConfirmingReset] = useState(false);

  const refresh = useCallback(async () => {
    const result = await send<StatusData>({ type: 'GET_STATUS' });
    if (!result.ok || !result.data) {
      if (isStaleWorker(result)) setStale(true);
      setError(!result.ok ? result.error.message : 'Could not load status.');
      setPhase('ready');
      return;
    }
    // A worker built from older source answers GET_STATUS fine and only fails
    // later, on the first message whose shape moved. Catch it here instead.
    if (result.data.contractVersion !== MESSAGE_CONTRACT_VERSION) setStale(true);
    setStatus(result.data);
    setPhase(
      !result.data.calibrationCompleted
        ? 'onboarding'
        : result.data.activeHere
          ? 'active'
          : 'ready',
    );
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const onLevelDone = useCallback(
    async (
      delfLevel: DelfLevel,
      correctAnswers: number,
      method: 'diagnostic' | 'self_selected',
    ) => {
      setError(null);
      const saved = await send({
        type: 'SAVE_CALIBRATION',
        delfLevel,
        correctAnswers,
        method,
      });
      if (!saved.ok) {
        if (isStaleWorker(saved)) setStale(true);
        setError(saved.error.message);
      }
      await refresh();
    },
    [refresh],
  );

  const onStart = useCallback(async () => {
    setError(null);
    setPhase('activating');
    const result = await send({ type: 'START_SESSION' });
    if (!result.ok) {
      if (isStaleWorker(result)) setStale(true);
      setError(result.error.message);
      setPhase('ready');
      return;
    }
    await refresh();
  }, [refresh]);

  const onStop = useCallback(async () => {
    setError(null);
    const result = await send({ type: 'STOP_SESSION' });
    if (!result.ok) {
      if (isStaleWorker(result)) setStale(true);
      setError(result.error.message);
    }
    await refresh();
  }, [refresh]);

  const onReset = useCallback(async () => {
    const result = await send({ type: 'RESET_PROFILE', confirmed: true });
    if (!result.ok) {
      if (isStaleWorker(result)) setStale(true);
      setError(result.error.message);
    }
    setConfirmingReset(false);
    await refresh();
  }, [refresh]);

  if (phase === 'loading') {
    return (
      <main className="popup">
        <Header />
        <p className="popup-status">Loading your reading lens…</p>
      </main>
    );
  }

  if (phase === 'onboarding') {
    return (
      <main className="popup">
        <Header />
        {stale && <StaleWorkerNotice />}
        {error && !stale && (
          <p className="popup-status" data-tone="error" role="alert">
            {error}
          </p>
        )}
        <LevelOnboarding currentLevel={status?.delfLevel} onDone={onLevelDone} />
      </main>
    );
  }

  const supported = status?.page.supported ?? false;

  return (
    <main className="popup">
      <Header />

      {stale && <StaleWorkerNotice />}

      {status && !supported && <p className="popup-status">{unsupportedReasonText(status.page)}</p>}

      {status?.profileError && (
        <p className="popup-status" data-tone="error">
          {status.profileError} Reset Eclipse data below to start fresh.
        </p>
      )}

      {error && !stale && (
        <p className="popup-status" data-tone="error" role="alert">
          {error}
        </p>
      )}

      {phase === 'active' && (
        <p className="popup-status" data-tone="active">
          Eclipse is matching this article to DELF {status?.delfLevel}. Select any gold French word
          or phrase to answer its translation question.
        </p>
      )}

      <div className="popup-section">
        {phase === 'active' ? (
          <button type="button" className="popup-primary" data-variant="stop" onClick={onStop}>
            End Eclipse
          </button>
        ) : (
          <button
            type="button"
            className="popup-primary"
            onClick={onStart}
            disabled={!supported || phase === 'activating'}
          >
            {phase === 'activating' ? 'Preparing your article…' : 'Start Eclipse'}
          </button>
        )}
      </div>

      {status && (
        <MasteryPanel
          status={status}
          onChangeLevel={phase === 'ready' ? () => setPhase('onboarding') : undefined}
        />
      )}

      {status && <AiStatus status={status} />}
      <PrivacyDisclosure />

      <div className="popup-footer">
        {confirmingReset ? (
          <>
            <button type="button" className="popup-secondary" data-tone="danger" onClick={onReset}>
              Yes, erase everything
            </button>
            <button
              type="button"
              className="popup-secondary"
              onClick={() => setConfirmingReset(false)}
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            type="button"
            className="popup-secondary"
            onClick={() => setConfirmingReset(true)}
          >
            Reset all Eclipse data
          </button>
        )}
      </div>
    </main>
  );
}

/**
 * Shown when the popup and the service worker came from different builds. The
 * button is the entire fix: `runtime.reload()` re-registers both halves from
 * the build currently on disk.
 */
function StaleWorkerNotice() {
  return (
    <div className="popup-status" data-tone="error" role="alert">
      <p>{STALE_WORKER_MESSAGE}</p>
      <button
        type="button"
        className="popup-text-button"
        onClick={() => {
          browser.runtime.reload();
        }}
      >
        Reload Eclipse
      </button>
    </div>
  );
}

function Header() {
  return (
    <header className="popup-header">
      <Moon phase="crescent" size={26} />
      <div>
        <h1 className="popup-title">Eclipse</h1>
        <p className="popup-pair">Articles → French mastery</p>
      </div>
    </header>
  );
}

function MasteryPanel({
  status,
  onChangeLevel,
}: {
  readonly status: StatusData;
  readonly onChangeLevel?: () => void;
}) {
  const { summary, delfLevel } = status;
  const levelCopy = (delfLevel && DELF_LEVEL_COPY[delfLevel]) || DELF_LEVEL_COPY.B1;
  const phase = status.phase || 'new_moon';
  const counts = summary || {
    tracked: 0,
    attempts: 0,
    correct: 0,
    due: 0,
    byPhase: { new_moon: 0, crescent: 0, half: 0, full: 0 },
    overallPhase: 'new_moon',
  };

  return (
    <section className="popup-section" aria-label="Your French reading profile">
      <div className="popup-lens">
        <div className="popup-level-mark" aria-label={`DELF ${delfLevel || 'B1'}`}>
          {delfLevel || 'B1'}
        </div>
        <div>
          <p className="popup-lens-title">{levelCopy.label} lens</p>
          <p className="popup-lens-copy">{levelCopy.description}</p>
        </div>
        {onChangeLevel && (
          <button type="button" className="popup-text-button" onClick={onChangeLevel}>
            Change
          </button>
        )}
      </div>

      <div className="popup-mastery">
        <Moon phase={phase} size={30} />
        <p className="popup-mastery-text">
          <span className="popup-mastery-phase">{PHASE_LABEL[phase] || 'New moon'}</span>
          {PHASE_DESCRIPTION[phase] || 'not met yet'}
        </p>
      </div>
      <ul className="popup-counts">
        <li>
          <strong>{counts.tracked}</strong>items
        </li>
        <li>
          <strong>
            {counts.correct}/{counts.attempts}
          </strong>
          correct
        </li>
        <li>
          <strong>{counts.due}</strong>due
        </li>
      </ul>
    </section>
  );
}

function AiStatus({ status }: { readonly status: StatusData }) {
  return (
    <section className="popup-ai" aria-label="AI vocabulary generation">
      <div className="popup-ai-heading">
        <span className="popup-ai-signal" aria-hidden="true" />
        <strong>AI vocabulary is always on</strong>
      </div>
      <p>
        Eclipse automatically finds useful words and complete phrases at DELF{' '}
        {status?.delfLevel || 'B1'}.
      </p>
      {status?.provider?.lastError && (
        <p className="popup-ai-error" role="status">
          Last AI attempt: {status.provider.lastError}
        </p>
      )}
    </section>
  );
}

function PrivacyDisclosure() {
  return (
    <details className="popup-disclosure">
      <summary>Privacy</summary>
      <p>Everything Eclipse learns about you stays in this browser.</p>
      <ul>
        <li>No account, sign-in, analytics, or telemetry.</li>
        <li>Page addresses and browsing history are never collected.</li>
        <li>Eclipse reads a page only while a session is running on it.</li>
        <li>
          Article sentences and your selected DELF level are sent to your local AI service; your
          progress and page address are not sent.
        </li>
      </ul>
    </details>
  );
}

interface LevelOnboardingProps {
  readonly currentLevel?: DelfLevel;
  readonly onDone: (
    level: DelfLevel,
    correctAnswers: number,
    method: 'diagnostic' | 'self_selected',
  ) => void;
}

function LevelOnboarding({ currentLevel, onDone }: LevelOnboardingProps) {
  const [takingDiagnostic, setTakingDiagnostic] = useState(false);

  if (takingDiagnostic) {
    return <Diagnostic onDone={onDone} onChooseLevel={() => setTakingDiagnostic(false)} />;
  }

  return (
    <section aria-labelledby="level-title">
      <p className="setup-eyebrow">Your reading lens</p>
      <h2 className="setup-title" id="level-title">
        Set your DELF level
      </h2>
      <p className="setup-copy">
        Eclipse uses your level to choose the vocabulary and phrases worth highlighting—not merely
        unusual context traps.
      </p>

      <button
        type="button"
        className="popup-primary diagnostic-cta"
        onClick={() => setTakingDiagnostic(true)}
      >
        Take the comprehension diagnostic
        <span>8 questions · about 4 minutes</span>
      </button>

      <div className="setup-divider">
        <span>Already know your level?</span>
      </div>

      <DelfPicker
        currentLevel={currentLevel}
        onSelect={(level) => onDone(level, 0, 'self_selected')}
      />
    </section>
  );
}

function DelfPicker({
  currentLevel,
  onSelect,
}: {
  readonly currentLevel?: DelfLevel;
  readonly onSelect: (level: DelfLevel) => void;
}) {
  return (
    <ul className="level-grid" aria-label="Choose your DELF level">
      {DELF_LEVELS.map((level) => {
        const copy = DELF_LEVEL_COPY[level] || DELF_LEVEL_COPY.B1;
        return (
          <li key={level}>
            <button
              type="button"
              className="level-choice"
              data-current={String(level === currentLevel)}
              onClick={() => onSelect(level)}
            >
              <strong>{level}</strong>
              <span>{copy.label}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function Diagnostic({
  onDone,
  onChooseLevel,
}: {
  readonly onDone: LevelOnboardingProps['onDone'];
  readonly onChooseLevel: () => void;
}) {
  const [answers, setAnswers] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const question = CALIBRATION_QUESTIONS[answers.length];

  if (!question) {
    const result = scoreCalibration(answers);
    const levelCopy = DELF_LEVEL_COPY[result.delfLevel] || DELF_LEVEL_COPY.B1;
    return (
      <section aria-labelledby="diagnostic-result-title">
        <p className="setup-eyebrow">Diagnostic complete</p>
        <div className="diagnostic-result-hero">
          <div className="diagnostic-level">{result.delfLevel}</div>
          <div>
            <h2 id="diagnostic-result-title">Your reading lens</h2>
            <p>
              {result.correctAnswers} of {CALIBRATION_QUESTIONS.length} correct · {levelCopy.label}
            </p>
          </div>
        </div>
        <p className="setup-copy">{levelCopy.description}</p>

        <ul className="diagnostic-breakdown" aria-label="Comprehension skill breakdown">
          {(
            Object.entries(result.bySkill) as [
              DiagnosticSkill,
              { correct: number; total: number },
            ][]
          ).map(([skill, score]) => (
            <li key={skill}>
              <span>{DIAGNOSTIC_SKILL_LABEL[skill]}</span>
              <strong>
                {score.correct}/{score.total}
              </strong>
            </li>
          ))}
        </ul>

        <button
          type="button"
          className="popup-primary"
          onClick={() => onDone(result.delfLevel, result.correctAnswers, 'diagnostic')}
        >
          Use DELF {result.delfLevel}
        </button>
        <button type="button" className="popup-text-button diagnostic-alt" onClick={onChooseLevel}>
          Choose a different level
        </button>
      </section>
    );
  }

  const isCorrect = selected === question.acceptedChoice;
  const progress = ((answers.length + (selected ? 1 : 0)) / CALIBRATION_QUESTIONS.length) * 100;

  return (
    <section aria-labelledby="diagnostic-question">
      <div className="diagnostic-progress-row">
        <p className="cal-progress">
          DELF {question.level} · Question {answers.length + 1} of {CALIBRATION_QUESTIONS.length}
        </p>
        <button type="button" className="popup-text-button" onClick={onChooseLevel}>
          Exit
        </button>
      </div>
      <div className="diagnostic-progress" aria-hidden="true">
        <span style={{ width: `${progress}%` }} />
      </div>

      <blockquote className="cal-passage" lang="fr-FR">
        {question.passage}
      </blockquote>
      <p className="cal-prompt" id="diagnostic-question">
        {question.prompt}
      </p>
      <ul className="cal-choices">
        {question.choices.map((choice) => {
          const state = selected
            ? choice === question.acceptedChoice
              ? 'correct'
              : choice === selected
                ? 'incorrect'
                : undefined
            : undefined;
          return (
            <li key={choice}>
              <button
                type="button"
                className="cal-choice"
                data-state={state}
                disabled={selected !== null}
                onClick={() => setSelected(choice)}
              >
                {choice}
                {state === 'correct' && <span aria-hidden="true">✓</span>}
                {state === 'incorrect' && <span aria-hidden="true">✕</span>}
              </button>
            </li>
          );
        })}
      </ul>

      {selected && (
        <div className="diagnostic-feedback" data-correct={String(isCorrect)} role="status">
          <strong>{isCorrect ? 'Correct' : 'Not quite'}</strong>
          <p>{question.note}</p>
          <button
            type="button"
            className="popup-primary"
            onClick={() => {
              setAnswers((current) => [...current, selected]);
              setSelected(null);
            }}
          >
            {answers.length + 1 === CALIBRATION_QUESTIONS.length
              ? 'See my result'
              : 'Next question'}
          </button>
        </div>
      )}
    </section>
  );
}
