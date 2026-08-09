/**
 * The Paraphrase lens in the popup.
 *
 * Self-contained on purpose: it opens its own port to the background bridge,
 * owns its own status and its own errors, and imports nothing from `App.tsx`.
 * That keeps the hook into the existing popup down to a switch and a render
 * branch, and it means a failure in this mode surfaces here rather than in the
 * shared notices strip that Translate Mode owns.
 *
 * The popup stays English while the on-page card is entirely French. That split
 * is deliberate: the card is the reading experience and must not break the
 * learner out of French, while the dashboard is where an English-speaking
 * learner reasons about their own progress.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { browser } from 'wxt/browser';
import { PortRpc } from '../../paraphrase/port-rpc';
import {
  PARAPHRASE_CONTRACT_VERSION,
  POPUP_PORT,
  type ParaphraseStatusData,
  type StartedData,
} from '../../paraphrase/protocol';
import type { ParaphraseSnapshot } from '../../domain/paraphrase-profile';
import type { ParaphraseRegister } from '../../domain/paraphrase';
import { STALE_WORKER_MESSAGE, type Result } from '../../domain/errors';
import { unsupportedReasonText } from '../../domain/url-support';
import type { StatusData } from '../../domain/messages';

export type Lens = 'translate' | 'paraphrase';

/** English register names. The French ones belong on the page, not here. */
const REGISTER_EN: Readonly<Record<ParaphraseRegister, string>> = {
  academic: 'Academic',
  formal: 'Formal',
  idiom: 'Idiom',
  technical: 'Technical',
  literary: 'Literary',
  everyday: 'Everyday',
};

export function LensSwitch({
  value,
  onChange,
}: {
  readonly value: Lens;
  readonly onChange: (lens: Lens) => void;
}) {
  const lenses: readonly { id: Lens; label: string; hint: string }[] = [
    { id: 'translate', label: 'Translate', hint: 'English article → French vocabulary' },
    { id: 'paraphrase', label: 'Paraphrase', hint: 'French article → simpler French' },
  ];

  return (
    <div className="lens-switch" role="radiogroup" aria-label="Reading lens">
      {lenses.map((lens) => (
        <button
          type="button"
          role="radio"
          key={lens.id}
          data-lens={lens.id}
          aria-checked={value === lens.id}
          title={lens.hint}
          onClick={() => onChange(lens.id)}
        >
          <span className="lens-glyph" aria-hidden="true">
            {lens.id === 'translate' ? '◑' : '◐'}
          </span>
          {lens.label}
        </button>
      ))}
    </div>
  );
}

type Phase = 'loading' | 'ready' | 'starting' | 'active';

export function ParaphraseView({ status }: { readonly status: StatusData | null }) {
  const rpc = useRef<PortRpc | null>(null);
  const [data, setData] = useState<ParaphraseStatusData | null>(null);
  const [phase, setPhase] = useState<Phase>('loading');
  const [error, setError] = useState<string | null>(null);
  const [stale, setStale] = useState(false);
  const [confirmingReset, setConfirmingReset] = useState(false);

  const ask = useCallback(async <T,>(payload: unknown): Promise<Result<T>> => {
    const channel = rpc.current;
    if (!channel || channel.isClosed) {
      return {
        ok: false,
        error: { code: 'MESSAGE_UNSUPPORTED', message: STALE_WORKER_MESSAGE, recoverable: true },
      };
    }
    return channel.request<T>(payload);
  }, []);

  const refresh = useCallback(async () => {
    const result = await ask<ParaphraseStatusData>({ type: 'STATUS' });
    if (!result.ok) {
      setError(result.error.message);
      setPhase('ready');
      return;
    }
    if (result.data.contractVersion !== PARAPHRASE_CONTRACT_VERSION) setStale(true);
    setData(result.data);
    setPhase(result.data.activeHere ? 'active' : 'ready');
  }, [ask]);

  const refreshRef = useRef(refresh);
  refreshRef.current = refresh;

  useEffect(() => {
    const port = browser.runtime.connect({ name: POPUP_PORT });
    const channel = new PortRpc(port);
    rpc.current = channel;

    // The page pushes a snapshot after every answer, so the dashboard stays
    // live while the learner reads instead of going stale behind them.
    const stop = channel.onEvent((payload) => {
      const event = payload as { type?: unknown; snapshot?: ParaphraseSnapshot };
      if (event?.type !== 'SNAPSHOT' || !event.snapshot) return;
      const snapshot = event.snapshot;
      setData((current) => (current ? { ...current, snapshot } : current));
    });

    void refreshRef.current();
    return () => {
      stop();
      channel.disconnect();
      rpc.current = null;
    };
    // One port for the popup's whole lifetime. `refresh` is reached through a
    // ref so a new callback identity cannot tear the connection down and open
    // a second one underneath a learner mid-session.
  }, []);

  const onStart = useCallback(async () => {
    setError(null);
    setPhase('starting');
    const started = await ask<StartedData>({ type: 'START' });
    if (!started.ok) {
      setError(started.error.message);
      setPhase('ready');
      return;
    }
    await refresh();
  }, [ask, refresh]);

  const onStop = useCallback(async () => {
    setError(null);
    const stopped = await ask({ type: 'STOP' });
    if (!stopped.ok) setError(stopped.error.message);
    await refresh();
  }, [ask, refresh]);

  /**
   * End the Translate session through its own documented message, rather than
   * reaching into its state. Paraphrase Mode never writes another mode's
   * session record.
   */
  const onEndTranslate = useCallback(async () => {
    setError(null);
    try {
      await browser.runtime.sendMessage({ type: 'STOP_SESSION' });
    } catch {
      setError('Could not reach Eclipse to end the Translate session.');
    }
    await refresh();
  }, [refresh]);

  const onReset = useCallback(async () => {
    setConfirmingReset(false);
    const reset = await ask({ type: 'RESET', confirmed: true });
    if (!reset.ok) setError(reset.error.message);
    await refresh();
  }, [ask, refresh]);

  if (phase === 'loading') {
    return (
      <div className="view-stack">
        <div className="popup-loading" role="status">
          <span className="loading-orbit" aria-hidden="true" />
          <p>Reading your comfort zone…</p>
        </div>
      </div>
    );
  }

  const snapshot = data?.snapshot;
  const active = phase === 'active';
  const supported = data?.page.supported ?? status?.page.supported ?? false;
  const blocked = data?.translateActiveHere ?? false;

  return (
    <div className="view-stack paraphrase-view">
      {stale && (
        <p className="popup-status" data-tone="error" role="alert">
          {STALE_WORKER_MESSAGE}
        </p>
      )}
      {data && !data.page.supported && (
        <p className="popup-status">{unsupportedReasonText(data.page)}</p>
      )}
      {error && (
        <p className="popup-status" data-tone="error" role="alert">
          {error}
        </p>
      )}

      <section className="session-hero paraphrase-hero" data-active={String(active)}>
        <div className="pm-dial" aria-hidden="true">
          <span className="pm-dial-ring" />
          <strong>{Math.round((snapshot?.target ?? 0.55) * 100)}</strong>
          <span className="pm-dial-unit">level</span>
        </div>
        <div className="session-copy">
          <p className="view-eyebrow">{active ? 'Penumbra active' : 'Ready to simplify'}</p>
          <h2>{active ? 'This page reads at your level.' : 'Read French, met at your level.'}</h2>
          <p>
            {active
              ? 'Dashed wordings were made simpler. Select one to recover the original.'
              : 'Eclipse rewrites the hardest wordings on a French page into French you already read.'}
          </p>
        </div>
      </section>

      {blocked ? (
        <>
          <p className="inline-note">
            Translate Mode is running on this tab. The two lenses cannot share one article.
          </p>
          <button type="button" className="primary-action" onClick={() => void onEndTranslate()}>
            <span>End Translate session</span>
          </button>
        </>
      ) : (
        <button
          type="button"
          className="primary-action"
          data-variant={active ? 'stop' : 'start'}
          onClick={() => void (active ? onStop() : onStart())}
          disabled={!active && (!supported || phase === 'starting')}
        >
          <span>
            {phase === 'starting'
              ? 'Reading this article…'
              : active
                ? 'End Paraphrase'
                : 'Start Paraphrase'}
          </span>
          <kbd aria-hidden="true">↵</kbd>
        </button>
      )}

      {data?.activeSessionId && !data.activeHere && (
        <p className="inline-note">
          A paraphrase lens is active in another tab. Starting here will move it.
        </p>
      )}

      <ComfortCard snapshot={snapshot} />
      <RegisterCard snapshot={snapshot} />
      <ReviewCard snapshot={snapshot} />

      <section className="instrument-card">
        <div>
          <p className="card-label">Paraphrase data</p>
          <p>
            Your comfort zone, category tendencies and owed wordings live on this device only, in a
            store separate from your Translate Mode progress.
          </p>
          {confirmingReset ? (
            <div className="confirmation-actions">
              <button type="button" className="danger-action" onClick={() => void onReset()}>
                Yes, erase Paraphrase data
              </button>
              <button
                type="button"
                className="text-action"
                onClick={() => setConfirmingReset(false)}
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="secondary-action"
              onClick={() => setConfirmingReset(true)}
            >
              Reset Paraphrase data
            </button>
          )}
        </div>
      </section>
    </div>
  );
}

/**
 * Where the band sits and where it is currently probing.
 *
 * The window is drawn, not just described, because "adaptive" is a claim the
 * learner has no way to check otherwise — and a claim they cannot check is one
 * they are entitled to disbelieve.
 */
function ComfortCard({ snapshot }: { readonly snapshot: ParaphraseSnapshot | undefined }) {
  const center = snapshot?.center ?? 0.55;
  const target = snapshot?.target ?? center;
  const [low, high] = snapshot?.window ?? [center - 0.12, center + 0.12];
  const answered = snapshot?.answered ?? 0;
  const correct = snapshot?.correct ?? 0;
  const trend = snapshot?.trend ?? 0;

  return (
    <section className="instrument-card pm-card" aria-label="Complexity comfort zone">
      <p className="card-label">Comfort zone</p>
      <div className="pm-track">
        <span
          className="pm-window"
          style={{ left: `${low * 100}%`, width: `${Math.max(0, high - low) * 100}%` }}
        />
        <span
          className="pm-center"
          style={{ left: `${center * 100}%` }}
          title="Your reading level"
        />
        <span
          className="pm-target"
          style={{ left: `${target * 100}%` }}
          title="Currently aiming at"
        />
      </div>
      <div className="pm-track-legend" aria-hidden="true">
        <span>everyday</span>
        <span>formal</span>
        <span>academic</span>
      </div>
      <p className="pm-read">
        {bandLabel(target)}{' '}
        {target > center + 0.005
          ? 'Eclipse is reaching above your level to find your ceiling.'
          : target < center - 0.005
            ? 'Eclipse has stepped back a notch to rebuild confidence.'
            : 'Eclipse is holding at your level.'}
      </p>
      <ul className="metric-strip" aria-label="Paraphrase activity">
        <li>
          <strong>{answered}</strong>
          <span>answered</span>
        </li>
        <li>
          <strong>{answered > 0 ? Math.round((correct / answered) * 100) : 0}%</strong>
          <span>recovered</span>
        </li>
        <li>
          <strong>{snapshot?.dueCount ?? 0}</strong>
          <span>owed</span>
        </li>
      </ul>
      {answered >= 6 && (
        <p className="inline-note">
          {trend > 0.05
            ? 'You are recovering more originals lately than earlier in the window.'
            : trend < -0.05
              ? 'Recent items are catching you out more often — Eclipse is easing off.'
              : 'Your recent accuracy is steady.'}
        </p>
      )}
    </section>
  );
}

/** Core #2, made visible: which kinds of difficulty this learner struggles with. */
function RegisterCard({ snapshot }: { readonly snapshot: ParaphraseSnapshot | undefined }) {
  if (!snapshot || snapshot.registers.every((row) => row.attempts === 0)) {
    return (
      <section className="instrument-card pm-card">
        <p className="card-label">Vocabulary range</p>
        <p>
          Answer a few paraphrases and Eclipse will start prioritising the categories that actually
          slow you down — academic jargon and idiom behave nothing alike.
        </p>
      </section>
    );
  }

  const focus = new Set(snapshot.focusRegisters);
  const rows = [...snapshot.registers].sort((left, right) => left.strength - right.strength);

  return (
    <section className="instrument-card pm-card" aria-label="Vocabulary range by category">
      <p className="card-label">Vocabulary range</p>
      <ul className="pm-registers">
        {rows.map((row) => (
          <li key={row.register} data-focus={String(focus.has(row.register))}>
            <span className="pm-register-name">{REGISTER_EN[row.register]}</span>
            <span className="pm-bar" aria-hidden="true">
              <span style={{ width: `${Math.round(row.strength * 100)}%` }} />
            </span>
            <span className="pm-register-count">
              {row.attempts === 0 ? '—' : `${row.correct}/${row.attempts}`}
            </span>
          </li>
        ))}
      </ul>
      <p className="inline-note">
        Highlighted categories get first call on the next page you read.
      </p>
    </section>
  );
}

/** The wordings Eclipse owes the learner a second meeting with. */
function ReviewCard({ snapshot }: { readonly snapshot: ParaphraseSnapshot | undefined }) {
  const review = snapshot?.review ?? [];
  if (review.length === 0) return null;

  return (
    <section className="instrument-card pm-card" aria-label="Wordings that will return">
      <p className="card-label">Coming back</p>
      <ul className="pm-review">
        {review.map((row) => (
          <li key={row.conceptId}>
            <span className="pm-review-original" lang="fr-FR">
              {row.original}
            </span>
            <span className="pm-review-arrow" aria-hidden="true">
              →
            </span>
            <span className="pm-review-simple" lang="fr-FR">
              {row.simplified}
            </span>
          </li>
        ))}
      </ul>
      <p className="inline-note">
        These appear again on a later page — wherever they legitimately fit.
      </p>
    </section>
  );
}

function bandLabel(target: number): string {
  if (target < 0.35) return 'Aiming at everyday French.';
  if (target < 0.55) return 'Aiming at slightly elevated vocabulary.';
  if (target < 0.75) return 'Aiming at formal, elevated phrasing.';
  return 'Aiming at academic and abstract phrasing.';
}
