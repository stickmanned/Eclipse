/**
 * The popup.
 *
 * Presentation and commands only. It reads status from the background worker
 * and sends it intents; it never writes the learner profile itself. Calibration
 * answers are scored here and the resulting ability is persisted through
 * `SAVE_CALIBRATION`, so the single-writer rule holds for history too.
 *
 * States: first-run calibration, ready, activating, active, recoverable error,
 * unsupported page.
 */

import { useCallback, useEffect, useState } from 'react';
import { browser } from 'wxt/browser';
import {
  CALIBRATION_QUESTIONS,
  scoreCalibration,
  skippedCalibration,
} from '../../domain/calibration';
import type { EclipseMessage, StatusData } from '../../domain/messages';
import type { Result } from '../../domain/errors';
import { unsupportedReasonText } from '../../domain/url-support';
import { PROVIDER_PERMISSION_PATTERN } from '../../storage/provider-settings';
import { Moon, PHASE_DESCRIPTION, PHASE_LABEL } from '../../content/ui/Moon';

type Phase = 'loading' | 'calibration' | 'ready' | 'activating' | 'active';

async function send<T>(message: EclipseMessage): Promise<Result<T>> {
  try {
    const response: unknown = await browser.runtime.sendMessage(message);
    if (response && typeof response === 'object' && 'ok' in response) {
      return response as Result<T>;
    }
    return {
      ok: false,
      error: {
        code: 'UNKNOWN_ERROR',
        message: 'The background worker did not answer.',
        recoverable: true,
      },
    };
  } catch (cause) {
    return {
      ok: false,
      error: {
        code: 'UNKNOWN_ERROR',
        message: cause instanceof Error ? cause.message : 'Could not reach Eclipse.',
        recoverable: true,
      },
    };
  }
}

export function App() {
  const [status, setStatus] = useState<StatusData | null>(null);
  const [phase, setPhase] = useState<Phase>('loading');
  const [error, setError] = useState<string | null>(null);
  const [retryWithProvider, setRetryWithProvider] = useState(false);
  const [confirmingReset, setConfirmingReset] = useState(false);

  const refresh = useCallback(async () => {
    const result = await send<StatusData>({ type: 'GET_STATUS' });
    if (!result.ok) {
      setError(result.error.message);
      setPhase('ready');
      return;
    }
    setStatus(result.data);
    setPhase(
      !result.data.calibrationCompleted
        ? 'calibration'
        : result.data.activeHere
          ? 'active'
          : 'ready',
    );
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const onCalibrationDone = useCallback(
    async (globalAbility: number, correctAnswers: number, skipped: boolean) => {
      const saved = await send({
        type: 'SAVE_CALIBRATION',
        globalAbility,
        correctAnswers,
        skipped,
      });
      if (!saved.ok) setError(saved.error.message);
      await refresh();
    },
    [refresh],
  );

  const onStart = useCallback(async () => {
    setError(null);
    setRetryWithProvider(false);
    setPhase('activating');
    const result = await send({ type: 'START_SESSION' });
    if (!result.ok) {
      const needsProvider =
        result.error.code === 'NO_ELIGIBLE_TRAPS' &&
        Boolean(status?.provider.configured) &&
        !status?.provider.enabled;
      setRetryWithProvider(needsProvider);
      setError(
        needsProvider
          ? 'This article needs AI-generated traps. Enable AI below and Eclipse will retry.'
          : result.error.message,
      );
      setPhase('ready');
      return;
    }
    await refresh();
  }, [refresh, status?.provider.configured, status?.provider.enabled]);

  const onStop = useCallback(async () => {
    setError(null);
    const result = await send({ type: 'STOP_SESSION' });
    if (!result.ok) setError(result.error.message);
    await refresh();
  }, [refresh]);

  const onReset = useCallback(async () => {
    const result = await send({ type: 'RESET_PROFILE', confirmed: true });
    if (!result.ok) setError(result.error.message);
    setConfirmingReset(false);
    await refresh();
  }, [refresh]);

  if (phase === 'loading') {
    return (
      <main className="popup">
        <Header />
        <p className="popup-status">Loading…</p>
      </main>
    );
  }

  if (phase === 'calibration') {
    return (
      <main className="popup">
        <Header />
        <Calibration onDone={onCalibrationDone} />
      </main>
    );
  }

  const supported = status?.page.supported ?? false;

  return (
    <main className="popup">
      <Header />

      {status && !supported && <p className="popup-status">{unsupportedReasonText(status.page)}</p>}

      {status?.profileError && (
        <p className="popup-status" data-tone="error">
          {status.profileError} Reset Eclipse data below to start fresh.
        </p>
      )}

      {error && (
        <p className="popup-status" data-tone="error" role="alert">
          {error}
        </p>
      )}

      {phase === 'active' && (
        <p className="popup-status" data-tone="active">
          Eclipse is running on this page. Select a gold French word to take its challenge.
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
            {phase === 'activating' ? 'Starting…' : 'Start Eclipse'}
          </button>
        )}
      </div>

      {status && <MasteryPanel status={status} />}

      {status?.provider.configured && (
        <ProviderToggle
          status={status}
          onChanged={refresh}
          retryAfterEnable={retryWithProvider}
          onEnabled={onStart}
        />
      )}

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

function Header() {
  return (
    <header className="popup-header">
      <Moon phase="crescent" size={26} />
      <div>
        <h1 className="popup-title">Eclipse</h1>
        <p className="popup-pair">English → French</p>
      </div>
    </header>
  );
}

function MasteryPanel({ status }: { readonly status: StatusData }) {
  const { summary } = status;
  return (
    <section className="popup-section" aria-label="Your progress">
      <div className="popup-mastery">
        <Moon phase={status.phase} size={32} />
        <p className="popup-mastery-text">
          <span className="popup-mastery-phase">{PHASE_LABEL[status.phase]}</span>
          {PHASE_DESCRIPTION[status.phase]}
        </p>
      </div>
      <ul className="popup-counts">
        <li>
          <strong>{summary.tracked}</strong>concepts
        </li>
        <li>
          <strong>
            {summary.correct}/{summary.attempts}
          </strong>
          correct
        </li>
        <li>
          <strong>{summary.due}</strong>due
        </li>
      </ul>
    </section>
  );
}

/**
 * The optional-provider opt-in.
 *
 * `permissions.request` must run in a user gesture inside an extension page, so
 * the prompt belongs here — but the resulting setting is the background
 * worker's to persist, which is what `SET_PROVIDER` is for. Turning it off
 * revokes the host permission too, so the network path is removed rather than
 * merely disabled.
 */
function ProviderToggle({
  status,
  onChanged,
  retryAfterEnable,
  onEnabled,
}: {
  readonly status: StatusData;
  readonly onChanged: () => Promise<void>;
  readonly retryAfterEnable: boolean;
  readonly onEnabled: () => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const [toggleError, setToggleError] = useState<string | null>(null);
  const extensionOrigin = `chrome-extension://${browser.runtime.id}`;

  const toggle = useCallback(async () => {
    setBusy(true);
    setToggleError(null);
    try {
      if (status.provider.enabled) {
        const result = await send({ type: 'SET_PROVIDER', enabled: false });
        if (!result.ok) setToggleError(result.error.message);
      } else {
        const alreadyGranted = await browser.permissions.contains({
          origins: [PROVIDER_PERMISSION_PATTERN],
        });
        const granted =
          alreadyGranted ||
          (await browser.permissions.request({
            origins: [PROVIDER_PERMISSION_PATTERN],
          }));
        if (!granted) {
          setToggleError('Permission was not granted, so AI traps remain off.');
          return;
        }
        const result = await send({ type: 'SET_PROVIDER', enabled: true });
        if (!result.ok) {
          setToggleError(result.error.message);
          await onChanged();
          return;
        }
        await onChanged();
        if (retryAfterEnable) await onEnabled();
        return;
      }
      await onChanged();
    } finally {
      setBusy(false);
    }
  }, [onChanged, onEnabled, retryAfterEnable, status.provider.enabled]);

  return (
    <section className="popup-section" aria-label="AI-generated traps">
      <button
        type="button"
        className="popup-secondary"
        style={{ width: '100%' }}
        onClick={() => void toggle()}
        disabled={busy}
        aria-pressed={status.provider.enabled}
      >
        {retryAfterEnable && !status.provider.enabled ? (
          <>Enable AI-generated traps &amp; retry</>
        ) : (
          <>
            AI-generated traps: <strong>{status.provider.enabled ? 'on' : 'off'}</strong>
          </>
        )}
      </button>
      <p className="popup-disclosure">
        {toggleError
          ? toggleError
          : status.provider.enabled
            ? 'Eclipse may send up to eight sentences to your local server. Never the page address or your progress.'
            : `Off. Eclipse makes no network requests at all. To enable AI, run npm run api and allow ${extensionOrigin} in ECLIPSE_ALLOWED_ORIGINS.`}
        {status.provider.lastError ? ` — ${status.provider.lastError}` : ''}
      </p>
    </section>
  );
}

function PrivacyDisclosure() {
  return (
    <details className="popup-disclosure">
      <summary>Privacy</summary>
      <p>Everything Eclipse learns about you stays in this browser.</p>
      <ul>
        <li>No account, no sign-in, no identifier.</li>
        <li>No analytics and no telemetry of any kind.</li>
        <li>Page addresses and browsing history are never collected.</li>
        <li>Eclipse reads a page only while you have a session running on it.</li>
        <li>With AI traps off — the default — Eclipse makes no network requests at all.</li>
      </ul>
    </details>
  );
}

interface CalibrationProps {
  readonly onDone: (globalAbility: number, correctAnswers: number, skipped: boolean) => void;
}

function Calibration({ onDone }: CalibrationProps) {
  const [answers, setAnswers] = useState<string[]>([]);
  const index = answers.length;
  const question = CALIBRATION_QUESTIONS[index];

  useEffect(() => {
    if (index < CALIBRATION_QUESTIONS.length) return;
    const result = scoreCalibration(answers);
    onDone(result.globalAbility, result.correctAnswers, false);
  }, [answers, index, onDone]);

  if (!question) {
    return <p className="popup-status">Setting your starting point…</p>;
  }

  return (
    <section aria-label="Quick calibration">
      <p className="cal-progress">
        Question {index + 1} of {CALIBRATION_QUESTIONS.length}
      </p>
      <p className="cal-surface" lang="fr-FR">
        {question.targetSurface}
      </p>
      <p className="cal-prompt">{question.prompt}</p>
      <ul className="cal-choices">
        {question.choices.map((choice) => (
          <li key={choice}>
            <button
              type="button"
              className="cal-choice"
              onClick={() => setAnswers((current) => [...current, choice])}
            >
              {choice}
            </button>
          </li>
        ))}
      </ul>
      <div className="popup-footer">
        <button
          type="button"
          className="popup-secondary"
          onClick={() => {
            const skipped = skippedCalibration();
            onDone(skipped.globalAbility, skipped.correctAnswers, true);
          }}
        >
          Skip — start at the middle
        </button>
      </div>
    </section>
  );
}
