/** Eclipse popup: a compact celestial instrument for reading and mastery. */

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
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
  type RecordAnswerData,
  type StatusData,
} from '../../domain/messages';
import { STALE_WORKER_MESSAGE, type Result } from '../../domain/errors';
import { unsupportedReasonText } from '../../domain/url-support';
import { Moon, PHASE_DESCRIPTION, PHASE_LABEL } from '../../content/ui/Moon';
import { OrbitLogo } from '../../content/ui/OrbitLogo';
import { OrbitRing } from '../../content/ui/OrbitRing';
import { LEARNING_PHASES, type LearningPhase, type VocabularyItem } from '../../domain/profile';
import { createInteractionId } from '../../domain/ids';
import {
  buildPracticeQueue,
  isPracticeAnswerCorrect,
  isVocabularyDue,
} from '../../domain/practice';
import {
  sevenDayAnswerDelta,
  successRate,
  summarizeActivityRange,
  type LearningStatsSnapshot,
} from '../../domain/stats';
import { LensSwitch, ParaphraseView, type Lens } from './ParaphraseView';

type Phase = 'loading' | 'onboarding' | 'ready' | 'activating' | 'active';
type PopupTab = 'session' | 'vocabulary' | 'stats' | 'settings';

const TABS: readonly { id: PopupTab; label: string }[] = [
  { id: 'session', label: 'Session' },
  { id: 'vocabulary', label: 'Vocab' },
  { id: 'stats', label: 'Stats' },
  { id: 'settings', label: 'Settings' },
];

const PHASE_ORDER: readonly LearningPhase[] = LEARNING_PHASES;

const CELESTIAL_STARS = [
  { left: '7%', top: '8%', size: 2, delay: '-1.4s', duration: '4.8s' },
  { left: '10%', top: '80%', size: 2, delay: '-2.2s', duration: '4.1s' },
  { left: '14%', top: '56%', size: 3, delay: '-0.5s', duration: '5.3s' },
  { left: '18%', top: '39%', size: 1, delay: '-3.1s', duration: '5.6s' },
  { left: '22%', top: '9%', size: 1, delay: '-3.7s', duration: '4.5s' },
  { left: '26%', top: '83%', size: 1, delay: '-1.1s', duration: '3.9s' },
  { left: '29%', top: '18%', size: 2, delay: '-0.8s', duration: '6.2s' },
  { left: '35%', top: '33%', size: 2, delay: '-2.6s', duration: '4.3s' },
  { left: '39%', top: '66%', size: 1, delay: '-4.6s', duration: '5.2s' },
  { left: '44%', top: '91%', size: 3, delay: '-3.4s', duration: '5.7s' },
  { left: '51%', top: '11%', size: 1, delay: '-2.4s', duration: '4.4s' },
  { left: '54%', top: '63%', size: 2, delay: '-1.7s', duration: '4.9s' },
  { left: '59%', top: '48%', size: 2, delay: '-5.2s', duration: '6.8s' },
  { left: '63%', top: '82%', size: 1, delay: '-0.3s', duration: '3.8s' },
  { left: '69%', top: '28%', size: 1, delay: '-1.9s', duration: '5.9s' },
  { left: '72%', top: '8%', size: 3, delay: '-4.1s', duration: '5.5s' },
  { left: '77%', top: '73%', size: 2, delay: '-3.8s', duration: '6.4s' },
  { left: '82%', top: '45%', size: 2, delay: '-2.1s', duration: '4.6s' },
  { left: '88%', top: '15%', size: 2, delay: '-0.4s', duration: '5.1s' },
  { left: '90%', top: '88%', size: 1, delay: '-3.9s', duration: '4.2s' },
  { left: '94%', top: '56%', size: 1, delay: '-2.9s', duration: '4.7s' },
  { left: '97%', top: '34%', size: 2, delay: '-1.3s', duration: '5.4s' },
] as const;

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

function isStaleWorker(result: Result<unknown>): boolean {
  return !result.ok && result.error.code === 'MESSAGE_UNSUPPORTED';
}

export function App() {
  const [status, setStatus] = useState<StatusData | null>(null);
  const [phase, setPhase] = useState<Phase>('loading');
  const [activeTab, setActiveTab] = useState<PopupTab>('session');
  const [error, setError] = useState<string | null>(null);
  const [stale, setStale] = useState(false);
  const [confirmingReset, setConfirmingReset] = useState(false);
  const [pendingPracticeLaunch, setPendingPracticeLaunch] = useState(false);
  const [lens, setLens] = useState<Lens>('translate');

  const refresh = useCallback(async () => {
    const result = await send<StatusData>({ type: 'GET_STATUS' });
    if (!result.ok || !result.data) {
      if (isStaleWorker(result)) setStale(true);
      setError(!result.ok ? result.error.message : 'Could not load status.');
      setPhase('ready');
      return;
    }

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
      setActiveTab('session');
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
    setActiveTab('session');
    await refresh();
  }, [refresh]);

  const onPracticeAnswer = useCallback(
    async (item: VocabularyItem, correct: boolean): Promise<RecordAnswerData | null> => {
      setError(null);
      const result = await send<RecordAnswerData>({
        type: 'RECORD_ANSWER',
        interactionId: createInteractionId(),
        conceptId: item.conceptId as `fr:${string}`,
        difficulty: 0.5,
        correct,
        assisted: false,
        mode: 'typed-meaning',
        display: {
          targetSurface: item.targetSurface,
          englishMeaning: item.englishMeaning,
          kind: item.kind,
        },
      });
      if (!result.ok) {
        if (isStaleWorker(result)) setStale(true);
        setError(result.error.message);
        return null;
      }
      await refresh();
      return result.data;
    },
    [refresh],
  );

  const openPractice = useCallback(() => {
    setPendingPracticeLaunch(true);
    setActiveTab('vocabulary');
  }, []);

  const consumePracticeLaunch = useCallback(() => {
    setPendingPracticeLaunch(false);
  }, []);

  if (phase === 'loading') {
    return (
      <PopupShell status={status}>
        <div className="popup-loading" role="status">
          <span className="loading-orbit" aria-hidden="true" />
          <p>Aligning your reading lens…</p>
        </div>
      </PopupShell>
    );
  }

  if (phase === 'onboarding') {
    return (
      <PopupShell status={status}>
        <Notices status={status} stale={stale} error={error} />
        <LevelOnboarding currentLevel={status?.delfLevel} onDone={onLevelDone} />
      </PopupShell>
    );
  }

  return (
    <PopupShell status={status}>
      <TabBar active={activeTab} onChange={setActiveTab} />
      <Notices status={status} stale={stale} error={error} />

      <section
        className="popup-panel"
        id={`eclipse-panel-${activeTab}`}
        role="tabpanel"
        aria-labelledby={`eclipse-tab-${activeTab}`}
      >
        {activeTab === 'session' && (
          <>
            <LensSwitch value={lens} onChange={setLens} />
            {lens === 'translate' ? (
              <SessionView status={status} phase={phase} onStart={onStart} onStop={onStop} />
            ) : (
              <ParaphraseView status={status} />
            )}
          </>
        )}
        {activeTab === 'vocabulary' && (
          <VocabularyView
            items={status?.vocabulary ?? []}
            onPracticeAnswer={onPracticeAnswer}
            autoStart={pendingPracticeLaunch}
            onAutoStartConsumed={consumePracticeLaunch}
          />
        )}
        {activeTab === 'stats' && (
          <StatsView
            status={status}
            onPractice={openPractice}
            onRead={() => setActiveTab('session')}
          />
        )}
        {activeTab === 'settings' && (
          <SettingsView
            status={status}
            confirmingReset={confirmingReset}
            onRequestReset={() => setConfirmingReset(true)}
            onCancelReset={() => setConfirmingReset(false)}
            onReset={onReset}
            onRecalibrate={phase === 'ready' ? () => setPhase('onboarding') : undefined}
          />
        )}
      </section>
    </PopupShell>
  );
}

function PopupShell({
  status,
  children,
}: {
  readonly status: StatusData | null;
  readonly children: React.ReactNode;
}) {
  return (
    <main className="popup">
      <CelestialBackdrop />
      <Header status={status} />
      {children}
    </main>
  );
}

function CelestialBackdrop() {
  return (
    <div className="cosmic-atmosphere" aria-hidden="true">
      <div className="cosmic-motion">
        {CELESTIAL_STARS.map((star) => (
          <span
            className="celestial-star"
            key={`${star.left}-${star.top}`}
            style={{
              left: star.left,
              top: star.top,
              width: star.size,
              height: star.size,
              animationDelay: star.delay,
              animationDuration: star.duration,
            }}
          />
        ))}
        <span className="shooting-star shooting-star--one" />
        <span className="shooting-star shooting-star--two" />
        <span className="shooting-star shooting-star--three" />
        <span className="cosmic-orbit cosmic-orbit--gold">
          <span className="orbiting-planet orbiting-planet--gold" />
        </span>
        <span className="cosmic-orbit cosmic-orbit--violet">
          <span className="orbiting-planet orbiting-planet--violet" />
        </span>
        <span className="cosmic-orbit cosmic-orbit--teal">
          <span className="orbiting-planet orbiting-planet--teal" />
        </span>
      </div>
    </div>
  );
}

function Header({ status }: { readonly status: StatusData | null }) {
  const aiReady = Boolean(status?.provider.enabled && status.provider.permissionGranted);
  const streak = status?.stats.currentStreak ?? 0;
  return (
    <header className="popup-header">
      <div className="brand-orbit" aria-hidden="true">
        <span className="brand-eclipse" />
        <span className="brand-moon-orbit">
          <span className="brand-moon" />
        </span>
      </div>
      <div className="brand-copy">
        <p className="brand-kicker">Context becomes fluency</p>
        <h1 className="popup-title">Eclipse</h1>
      </div>
      <div className="header-status">
        <div className="streak-indicator" aria-label={`${streak} day learning streak`}>
          <span aria-hidden="true">🔥</span>
          <strong>{streak}</strong>
          <span>day streak</span>
        </div>
        <div
          className="ai-beacon"
          data-ready={String(aiReady)}
          aria-label={aiReady ? 'AI ready' : 'AI needs attention'}
        >
          <span aria-hidden="true" />
          AI
        </div>
      </div>
    </header>
  );
}

function TabBar({
  active,
  onChange,
}: {
  readonly active: PopupTab;
  readonly onChange: (tab: PopupTab) => void;
}) {
  function onKeyDown(event: React.KeyboardEvent<HTMLButtonElement>, index: number) {
    let next = index;
    if (event.key === 'ArrowRight') next = (index + 1) % TABS.length;
    else if (event.key === 'ArrowLeft') next = (index - 1 + TABS.length) % TABS.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = TABS.length - 1;
    else return;

    event.preventDefault();
    const tab = TABS[next]!;
    onChange(tab.id);
    document.getElementById(`eclipse-tab-${tab.id}`)?.focus();
  }

  return (
    <nav className="popup-tabs" role="tablist" aria-label="Eclipse views">
      {TABS.map((tab, index) => (
        <button
          type="button"
          role="tab"
          id={`eclipse-tab-${tab.id}`}
          aria-controls={`eclipse-panel-${tab.id}`}
          aria-selected={active === tab.id}
          tabIndex={active === tab.id ? 0 : -1}
          data-tab={tab.id}
          key={tab.id}
          onClick={() => onChange(tab.id)}
          onKeyDown={(event) => onKeyDown(event, index)}
        >
          <TabGlyph tab={tab.id} />
          <span>{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}

function TabGlyph({ tab }: { readonly tab: PopupTab }) {
  const paths: Record<PopupTab, React.ReactNode> = {
    session: <path d="M5 12h14M12 5v14M8 8l8 8M16 8l-8 8" />,
    vocabulary: (
      <path d="M5 5.5h5.5A2.5 2.5 0 0 1 13 8v11H7a2 2 0 0 1-2-2V5.5Zm14 0h-5.5A2.5 2.5 0 0 0 11 8v11h6a2 2 0 0 0 2-2V5.5Z" />
    ),
    stats: <path d="M5 18V11m5 7V7m5 11v-4m4 4V4" />,
    settings: (
      <path d="M12 8.5A3.5 3.5 0 1 0 12 15.5 3.5 3.5 0 0 0 12 8.5Zm0-5v2m0 13v2m8.5-8.5h-2m-13 0h-2m14.5-6-1.4 1.4M7.4 16.6 6 18m12 0-1.4-1.4M7.4 7.4 6 6" />
    ),
  };
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      {paths[tab]}
    </svg>
  );
}

function Notices({
  status,
  stale,
  error,
}: {
  readonly status: StatusData | null;
  readonly stale: boolean;
  readonly error: string | null;
}) {
  return (
    <div className="popup-notices" aria-live="polite">
      {stale && <StaleWorkerNotice />}
      {status && !status.page.supported && (
        <p className="popup-status">{unsupportedReasonText(status.page)}</p>
      )}
      {status?.profileError && (
        <p className="popup-status" data-tone="error">
          {status.profileError} Reset Eclipse data in Settings to start fresh.
        </p>
      )}
      {error && !stale && (
        <p className="popup-status" data-tone="error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

function StaleWorkerNotice() {
  return (
    <div className="popup-status" data-tone="error" role="alert">
      <p>{STALE_WORKER_MESSAGE}</p>
      <button type="button" className="text-action" onClick={() => browser.runtime.reload()}>
        Reload Eclipse
      </button>
    </div>
  );
}

function SessionView({
  status,
  phase,
  onStart,
  onStop,
}: {
  readonly status: StatusData | null;
  readonly phase: Phase;
  readonly onStart: () => void;
  readonly onStop: () => void;
}) {
  const active = phase === 'active';
  const supported = status?.page.supported ?? false;
  const level = status?.delfLevel ?? 'B1';
  const copy = DELF_LEVEL_COPY[level] ?? DELF_LEVEL_COPY.B1;
  const summary = status?.summary;

  return (
    <div className="view-stack session-view">
      <section className="session-hero" data-active={String(active)}>
        <div className="session-orbit" aria-hidden="true">
          {(summary?.tracked ?? 0) > 0 ? (
            <>
              <OrbitRing layer="back" />
              <span className="session-orbit-moon">
                <Moon phase={status?.phase ?? 'crescent'} size={76} />
              </span>
              <OrbitRing layer="front" />
            </>
          ) : (
            <OrbitLogo size={88} />
          )}
        </div>
        <div className="session-copy">
          <p className="view-eyebrow">{active ? 'Lens active' : 'Ready to translate context'}</p>
          <h2>{active ? 'Your article is eclipsed.' : 'Read the web in French.'}</h2>
          <p>
            {active
              ? `Gold-marked vocabulary is tuned to DELF ${level}.`
              : 'Turn useful English words into contextual French challenges.'}
          </p>
        </div>
      </section>

      <button
        type="button"
        className="primary-action"
        data-variant={active ? 'stop' : 'start'}
        onClick={active ? onStop : onStart}
        disabled={!active && (!supported || phase === 'activating')}
      >
        <span>
          {phase === 'activating'
            ? 'Mapping this article…'
            : active
              ? 'End Eclipse'
              : 'Start Eclipse'}
        </span>
        <kbd aria-hidden="true">↵</kbd>
      </button>

      {status?.activeSessionId && !status.activeHere && (
        <p className="inline-note">A lens is active in another tab. Starting here will move it.</p>
      )}

      <section className="instrument-card lens-card" aria-label={`DELF ${level} reading lens`}>
        <div className="level-seal">{level}</div>
        <div>
          <p className="card-label">Current lens</p>
          <h3>{copy.label}</h3>
          <p>{copy.description}</p>
        </div>
      </section>

      <ul className="metric-strip" aria-label="Mastery summary">
        <li>
          <strong>{summary?.tracked ?? 0}</strong>
          <span>tracked</span>
        </li>
        <li>
          <strong>{summary?.due ?? 0}</strong>
          <span>due now</span>
        </li>
        <li>
          <strong>{accuracy(summary?.correct ?? 0, summary?.attempts ?? 0)}%</strong>
          <span>accuracy</span>
        </li>
      </ul>
    </div>
  );
}

function VocabularyView({
  items,
  onPracticeAnswer,
  autoStart,
  onAutoStartConsumed,
}: {
  readonly items: readonly VocabularyItem[];
  readonly onPracticeAnswer: (
    item: VocabularyItem,
    correct: boolean,
  ) => Promise<RecordAnswerData | null>;
  readonly autoStart: boolean;
  readonly onAutoStartConsumed: () => void;
}) {
  const [query, setQuery] = useState('');
  const [phase, setPhase] = useState<LearningPhase | 'all'>('all');
  const [practiceIds, setPracticeIds] = useState<string[]>(() =>
    autoStart ? buildPracticeQueue(items, new Date()).map((item) => item.conceptId) : [],
  );
  const [practiceIndex, setPracticeIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [graded, setGraded] = useState<boolean | null>(null);
  const [savingPractice, setSavingPractice] = useState(false);
  const [practiceFailures, setPracticeFailures] = useState<Record<string, number>>({});
  const [practiceResult, setPracticeResult] = useState<RecordAnswerData | null>(null);
  const normalized = query.trim().toLocaleLowerCase();
  const practiceEligibleCount = items.filter((item) => item.phase !== 'full').length;
  const dueCount = items.filter(
    (item) => item.phase !== 'full' && isVocabularyDue(item, new Date()),
  ).length;
  const practiceItem = items.find((item) => item.conceptId === practiceIds[practiceIndex]);
  const filtered = items.filter((item) => {
    const matchesPhase = phase === 'all' || item.phase === phase;
    const text = `${item.targetSurface} ${item.englishMeaning}`.toLocaleLowerCase();
    return matchesPhase && text.includes(normalized);
  });

  useEffect(() => {
    if (autoStart) onAutoStartConsumed();
  }, [autoStart, onAutoStartConsumed]);

  function startPractice(firstConceptId?: string) {
    const queue = buildPracticeQueue(items, new Date()).map((item) => item.conceptId);
    setPracticeIds(
      firstConceptId
        ? [firstConceptId, ...queue.filter((conceptId) => conceptId !== firstConceptId)]
        : queue,
    );
    setPracticeIndex(0);
    setRevealed(false);
    setGraded(null);
    setPracticeResult(null);
    setPracticeFailures({});
  }

  function closePractice() {
    setPracticeIds([]);
    setPracticeIndex(0);
    setRevealed(false);
    setGraded(null);
    setPracticeResult(null);
  }

  async function gradePractice(correct: boolean) {
    if (!practiceItem || savingPractice) return;
    setSavingPractice(true);
    const saved = await onPracticeAnswer(practiceItem, correct);
    setSavingPractice(false);
    if (!saved) return;
    if (!correct) {
      const failures = practiceFailures[practiceItem.conceptId] ?? 0;
      if (failures < 1) {
        setPracticeIds((ids) => [...ids, practiceItem.conceptId]);
        setPracticeFailures((counts) => ({
          ...counts,
          [practiceItem.conceptId]: failures + 1,
        }));
      }
    }
    setPracticeResult(saved);
    setGraded(correct);
  }

  function nextPracticeItem() {
    if (practiceIndex + 1 >= practiceIds.length) {
      closePractice();
      return;
    }
    setPracticeIndex((index) => index + 1);
    setRevealed(false);
    setGraded(null);
    setPracticeResult(null);
  }

  return (
    <div className="view-stack vocabulary-view">
      <ViewHeading
        eyebrow="Your lunar lexicon"
        title="Vocabulary deck"
        copy={`${items.length} contextual ${items.length === 1 ? 'item' : 'items'} tracked`}
      />

      {practiceItem ? (
        <PracticeCard
          key={`${practiceItem.conceptId}:${practiceIndex}`}
          item={practiceItem}
          index={practiceIndex}
          total={practiceIds.length}
          revealed={revealed}
          graded={graded}
          result={practiceResult}
          saving={savingPractice}
          onReveal={() => setRevealed(true)}
          onGrade={gradePractice}
          onNext={nextPracticeItem}
          onClose={closePractice}
        />
      ) : (
        <section className="practice-launch" aria-labelledby="practice-launch-title">
          <div>
            <p className="card-label">Active recall</p>
            <h3 id="practice-launch-title">
              {practiceEligibleCount === 0 && items.length > 0
                ? 'All words mastered'
                : dueCount > 0
                  ? `${dueCount} ${dueCount === 1 ? 'item' : 'items'} ready`
                  : 'Keep your orbit strong'}
            </h3>
            <p>
              {practiceEligibleCount === 0 && items.length > 0
                ? 'Full Moon words have left Practice weakest.'
                : dueCount > 0
                  ? 'Review due and missed vocabulary first.'
                  : 'Practice the words that need the most strengthening.'}
            </p>
          </div>
          <button
            type="button"
            className="secondary-action practice-action"
            onClick={() => startPractice()}
            disabled={practiceEligibleCount === 0}
          >
            {practiceEligibleCount === 0 && items.length > 0
              ? 'Mastered'
              : dueCount > 0
                ? 'Review now'
                : 'Practice weakest'}
          </button>
        </section>
      )}

      <ol className="phase-guide" aria-label="Vocabulary mastery stages">
        {PHASE_ORDER.map((value) => (
          <li key={value}>
            <Moon phase={value} size={18} />
            <span>
              <strong>{PHASE_LABEL[value]}</strong>
              {PHASE_DESCRIPTION[value]}
            </span>
          </li>
        ))}
      </ol>

      <label className="search-field">
        <span className="visually-hidden">Search vocabulary</span>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="11" cy="11" r="6" />
          <path d="m16 16 4 4" />
        </svg>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search French or English"
          type="search"
        />
      </label>

      <div className="phase-filters" aria-label="Filter by learning stage">
        <button type="button" aria-pressed={phase === 'all'} onClick={() => setPhase('all')}>
          All
        </button>
        {PHASE_ORDER.map((value) => (
          <button
            key={value}
            type="button"
            aria-pressed={phase === value}
            onClick={() => setPhase(value)}
            title={PHASE_LABEL[value]}
          >
            <Moon phase={value} size={17} />
            <span className="visually-hidden">
              {PHASE_LABEL[value]}, {items.filter((item) => item.phase === value).length} items
            </span>
            <span className="filter-count" aria-hidden="true">
              {items.filter((item) => item.phase === value).length}
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title={items.length === 0 ? 'Your first word is waiting.' : 'No vocabulary matches.'}
          copy={
            items.length === 0
              ? 'Start a session and answer a highlighted challenge to begin your deck.'
              : 'Try another search or learning stage.'
          }
        />
      ) : (
        <div className="vocabulary-groups">
          {PHASE_ORDER.map((groupPhase) => {
            const group = filtered.filter((item) => item.phase === groupPhase);
            if (group.length === 0) return null;
            return (
              <section
                className="vocabulary-group"
                key={groupPhase}
                aria-labelledby={`phase-${groupPhase}`}
              >
                <div className="group-heading">
                  <Moon phase={groupPhase} size={21} />
                  <h3 id={`phase-${groupPhase}`}>{PHASE_LABEL[groupPhase]}</h3>
                  <span>{group.length}</span>
                </div>
                <ul className="vocabulary-list">
                  {group.map((item) => (
                    <VocabularyRow
                      item={item}
                      key={item.conceptId}
                      onPractice={() => startPractice(item.conceptId)}
                    />
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

function VocabularyRow({
  item,
  onPractice,
}: {
  readonly item: VocabularyItem;
  readonly onPractice: () => void;
}) {
  const due = item.phase !== 'full' && isVocabularyDue(item, new Date());
  const practiceWins = Math.min(3, item.unassistedCorrect);
  return (
    <li className="vocabulary-row">
      <div className="vocabulary-copy">
        <ScrollingFrenchSurface text={item.targetSurface} scroll={item.kind === 'phrase'} />
        <span>{item.englishMeaning}</span>
        <span className="review-timing">{reviewTiming(item)}</span>
        <span className="review-evidence">
          {practiceWins} of 3 correct typed practices
          {item.contextCount > 0
            ? ` · ${item.contextCount} ${item.contextCount === 1 ? 'context' : 'contexts'}`
            : ''}
        </span>
      </div>
      <div className="vocabulary-meta">
        {due && <span className="due-badge">Practice now</span>}
        <span>{practiceWins}/3</span>
        <button
          type="button"
          className="row-practice"
          onClick={onPractice}
          aria-label={`Practice ${item.targetSurface}`}
        >
          Practice
        </button>
      </div>
    </li>
  );
}

function ScrollingFrenchSurface({
  text,
  scroll,
}: {
  readonly text: string;
  readonly scroll: boolean;
}) {
  const viewportRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLSpanElement>(null);
  const [overflow, setOverflow] = useState(0);

  useLayoutEffect(() => {
    if (!scroll) return;
    const viewport = viewportRef.current;
    const content = contentRef.current;
    if (!viewport || !content) return;

    const measure = () => setOverflow(Math.max(0, content.scrollWidth - viewport.clientWidth));
    measure();
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure);
    observer?.observe(viewport);
    observer?.observe(content);
    window.addEventListener('resize', measure);
    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [scroll, text]);

  const style = { '--phrase-shift': `${overflow}px` } as React.CSSProperties;
  return (
    <strong
      ref={viewportRef}
      className={scroll ? 'vocabulary-surface phrase-scroll' : 'vocabulary-surface'}
      data-scrolling={String(scroll && overflow > 0)}
      lang="fr-FR"
      style={style}
      tabIndex={scroll && overflow > 0 ? 0 : undefined}
      title={scroll ? text : undefined}
    >
      <span ref={contentRef}>{text}</span>
    </strong>
  );
}

function PracticeCard({
  item,
  index,
  total,
  revealed,
  graded,
  result,
  saving,
  onReveal,
  onGrade,
  onNext,
  onClose,
}: {
  readonly item: VocabularyItem;
  readonly index: number;
  readonly total: number;
  readonly revealed: boolean;
  readonly graded: boolean | null;
  readonly result: RecordAnswerData | null;
  readonly saving: boolean;
  readonly onReveal: () => void;
  readonly onGrade: (correct: boolean) => void;
  readonly onNext: () => void;
  readonly onClose: () => void;
}) {
  const [answer, setAnswer] = useState('');

  function submitAnswer(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving || graded !== null) return;
    onReveal();
    onGrade(isPracticeAnswerCorrect(answer, item.englishMeaning));
  }

  function giveUp() {
    if (saving || graded !== null) return;
    onReveal();
    onGrade(false);
  }

  return (
    <section className="practice-card" aria-labelledby="practice-title">
      <header>
        <div>
          <p className="card-label">
            Active recall · {index + 1} of {total}
          </p>
          <h3 id="practice-title">Say it before you reveal it.</h3>
        </div>
        <button type="button" className="text-action" onClick={onClose}>
          Close
        </button>
      </header>
      <div className="practice-prompt">
        <span>Type the English meaning</span>
        <strong lang="fr-FR">{item.targetSurface}</strong>
      </div>
      {!revealed ? (
        <form className="practice-answer" onSubmit={submitAnswer}>
          <label>
            <span className="visually-hidden">English meaning for {item.targetSurface}</span>
            <input
              value={answer}
              onChange={(event) => setAnswer(event.target.value)}
              placeholder="Type from memory"
              autoFocus
              autoComplete="off"
            />
          </label>
          <div>
            <button type="button" className="text-action" onClick={giveUp} disabled={saving}>
              I don't know
            </button>
            <button type="submit" className="primary-action" disabled={!answer.trim() || saving}>
              <span>{saving ? 'Checking…' : 'Check answer'}</span>
              <kbd aria-hidden="true">↵</kbd>
            </button>
          </div>
        </form>
      ) : (
        <div className="practice-reveal" aria-live="polite">
          <span>Answer</span>
          <strong lang="en">{item.englishMeaning}</strong>
          {graded !== null && (
            <div className="practice-saved" data-correct={String(graded)}>
              <p>{practiceVerdict(graded, result)}</p>
              <button type="button" className="secondary-action" onClick={onNext}>
                {index + 1 >= total ? 'Finish practice' : 'Next word'}
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function practiceVerdict(correct: boolean, result: RecordAnswerData | null): string {
  if (!result) return correct ? 'Correct — saving practice…' : 'Saving this for relearning…';
  if (!correct) {
    return result.phase === 'full'
      ? 'Full Moon stays mastered; this miss does not erase your wins.'
      : 'Not lost — this one is queued for relearning.';
  }
  const wins = Math.min(3, result.mastery.unassistedCorrect);
  if (result.phase === 'full') return 'Full Moon — mastered with 3 correct typed practices.';
  return `Half Moon — ${wins} of 3 correct typed practices.`;
}

function reviewTiming(item: VocabularyItem): string {
  if (item.phase === 'full') return 'Mastered · no longer in Practice weakest';
  if (item.due.kind === 'next_occurrence') return 'Missed · ready for relearning';
  if (item.due.kind === 'none') return 'Ready to enter review';
  const remaining = Date.parse(item.due.at) - Date.now();
  if (remaining <= -86_400_000) {
    const days = Math.floor(Math.abs(remaining) / 86_400_000);
    return `Review overdue by ${days} ${days === 1 ? 'day' : 'days'}`;
  }
  if (remaining <= 0) return 'Scheduled review is due';
  const hours = Math.ceil(remaining / 3_600_000);
  if (hours < 24) return `Review in ${hours} ${hours === 1 ? 'hour' : 'hours'}`;
  const days = Math.ceil(hours / 24);
  return `Review in ${days} ${days === 1 ? 'day' : 'days'}`;
}

type StatsPeriod = 7 | 30;

function StatsView({
  status,
  onPractice,
  onRead,
}: {
  readonly status: StatusData | null;
  readonly onPractice: () => void;
  readonly onRead: () => void;
}) {
  const [period, setPeriod] = useState<StatsPeriod>(7);
  const summary = status?.summary;
  const total = summary?.tracked ?? 0;
  const eligible = status?.vocabulary.filter((item) => item.phase !== 'full').length ?? 0;
  const days = status?.stats?.days ?? [];
  const visibleDays = days.slice(-period);
  const range = summarizeActivityRange(visibleDays);
  const streak = status?.stats.currentStreak ?? 0;
  const delta = period === 7 && status?.stats ? sevenDayAnswerDelta(status.stats) : null;
  const incomplete = Boolean(
    status?.stats &&
    visibleDays[0] &&
    Date.parse(status.stats.completeSince) > localDateFromKey(visibleDays[0].date).getTime(),
  );
  const actionLabel =
    (summary?.due ?? 0) > 0
      ? 'Review now'
      : eligible > 0
        ? 'Practice weakest'
        : 'Read another article';
  const onAction = eligible > 0 ? onPractice : onRead;

  return (
    <div className="view-stack stats-view">
      <div className="stats-title-row">
        <ViewHeading
          eyebrow="Your reading orbit"
          title="Learning momentum"
          copy="Recent practice, recall, and current mastery"
        />
        {total > 0 && <PeriodToggle value={period} onChange={setPeriod} />}
      </div>

      {total === 0 ? (
        <div className="stats-empty-state">
          <EmptyState
            title="Your first word is waiting."
            copy="Start an Eclipse session and answer a highlighted word to begin your mastery orbit."
          />
          <button type="button" className="primary-action compact-action" onClick={onRead}>
            Read another article
          </button>
        </div>
      ) : (
        <>
          <section className="momentum-card" aria-label={`${period}-day learning momentum`}>
            <div className="momentum-metrics">
              <div>
                <span>Answers</span>
                <strong>{range.answers}</strong>
                <small>
                  {period === 7
                    ? delta === null
                      ? 'Building your baseline'
                      : `${delta >= 0 ? '+' : '−'}${Math.abs(delta)} vs previous week`
                    : `${period}-day window`}
                </small>
              </div>
              <div>
                <span>Current streak</span>
                <strong className="momentum-streak">
                  <span aria-hidden="true">🔥</span>
                  {streak}
                </strong>
                <small>day streak</small>
              </div>
            </div>
            <div className="stats-action-row">
              <div>
                <strong>{summary?.due ?? 0}</strong>
                <span>due now</span>
              </div>
              <button type="button" className="secondary-action" onClick={onAction}>
                {actionLabel}
              </button>
            </div>
          </section>

          <ActivityChart days={visibleDays} period={period} />

          {incomplete && status?.stats && (
            <p className="history-baseline">
              Complete tracking since {formatTimestampDate(status.stats.completeSince)}
            </p>
          )}

          <ModeSuccess summary={range} />
          <MasteryDistribution
            total={total}
            byPhase={summary?.byPhase ?? { crescent: 0, half: 0, full: 0 }}
          />
          <StatsInterpretation
            period={period}
            range={range}
            delta={delta}
            streak={streak}
            total={total}
            byPhase={summary?.byPhase ?? { crescent: 0, half: 0, full: 0 }}
          />
        </>
      )}
    </div>
  );
}

function PeriodToggle({
  value,
  onChange,
}: {
  readonly value: StatsPeriod;
  readonly onChange: (period: StatsPeriod) => void;
}) {
  return (
    <div className="period-toggle" role="group" aria-label="Activity period">
      {([7, 30] as const).map((period) => (
        <button
          type="button"
          key={period}
          aria-pressed={value === period}
          onClick={() => onChange(period)}
        >
          {period} days
        </button>
      ))}
    </div>
  );
}

function ActivityChart({
  days,
  period,
}: {
  readonly days: LearningStatsSnapshot['days'];
  readonly period: StatsPeriod;
}) {
  const [selectedIndex, setSelectedIndex] = useState(Math.max(0, days.length - 1));
  const firstDate = days[0]?.date;
  const lastDate = days.at(-1)?.date;

  useEffect(() => {
    setSelectedIndex(Math.max(0, days.length - 1));
  }, [firstDate, lastDate, days.length]);

  const totals = days.map((day) => day.contextAttempts + day.recallAttempts);
  const periodEmpty = totals.every((answers) => answers === 0);
  const maximum = Math.max(1, ...totals);
  const selected = days[selectedIndex] ?? days.at(-1);
  const selectedAnswers = selected ? selected.contextAttempts + selected.recallAttempts : 0;
  const selectedCorrect = selected ? selected.contextCorrect + selected.recallCorrect : 0;

  function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    let next = selectedIndex;
    if (event.key === 'ArrowLeft') next = Math.max(0, selectedIndex - 1);
    else if (event.key === 'ArrowRight') next = Math.min(days.length - 1, selectedIndex + 1);
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = Math.max(0, days.length - 1);
    else return;
    event.preventDefault();
    setSelectedIndex(next);
  }

  return (
    <figure className="activity-card" aria-labelledby="activity-chart-title">
      <figcaption className="section-heading">
        <h3 id="activity-chart-title">Answers per day</h3>
        <span>{period}-day view</span>
      </figcaption>
      <div
        className="activity-chart"
        role="group"
        tabIndex={0}
        aria-label={`Answers per day for the last ${period} days. Use left and right arrow keys to inspect a day.`}
        aria-describedby="activity-day-readout"
        onKeyDown={onKeyDown}
      >
        <div className="activity-bars" aria-hidden="true">
          {days.map((day, index) => {
            const answers = totals[index] ?? 0;
            const height = answers === 0 ? 0 : Math.max(8, (answers / maximum) * 100);
            return (
              <span
                key={day.date}
                data-selected={String(index === selectedIndex)}
                data-empty={String(answers === 0)}
                style={{ '--activity-height': `${height}%` } as React.CSSProperties}
                onPointerEnter={() => setSelectedIndex(index)}
              >
                <i />
              </span>
            );
          })}
        </div>
        <div className="activity-axis" aria-hidden="true">
          <span>{firstDate ? formatActivityDate(firstDate) : '—'}</span>
          <span>{lastDate ? formatActivityDate(lastDate) : '—'}</span>
        </div>
      </div>
      <p id="activity-day-readout" className="activity-readout" aria-live="polite">
        {periodEmpty
          ? `No answers in this ${period}-day period yet.`
          : selected
            ? selectedAnswers === 0
              ? `${formatActivityDate(selected.date)} · No answers`
              : `${formatActivityDate(selected.date)} · ${selectedAnswers} ${selectedAnswers === 1 ? 'answer' : 'answers'} · ${selectedCorrect} correct`
            : 'No answers in this period yet.'}
      </p>
      <ol className="visually-hidden">
        {days.map((day) => {
          const answers = day.contextAttempts + day.recallAttempts;
          const correct = day.contextCorrect + day.recallCorrect;
          return (
            <li key={day.date}>
              {formatActivityDate(day.date)}: {answers} answers, {correct} correct
            </li>
          );
        })}
      </ol>
    </figure>
  );
}

function ModeSuccess({ summary }: { readonly summary: ReturnType<typeof summarizeActivityRange> }) {
  const modes = [
    {
      id: 'context',
      label: 'Context success',
      attempts: summary.contextAttempts,
      correct: summary.contextCorrect,
    },
    {
      id: 'recall',
      label: 'Recall success',
      attempts: summary.recallAttempts,
      correct: summary.recallCorrect,
    },
  ] as const;

  return (
    <section className="mode-success-grid" aria-label="Success by answer mode">
      {modes.map((mode) => {
        const rate = successRate(mode.correct, mode.attempts);
        return (
          <div key={mode.id} data-mode={mode.id}>
            <span>{mode.label}</span>
            <strong>{rate === null ? '—' : `${rate}%`}</strong>
            <div
              className="success-meter"
              role="img"
              aria-label={
                rate === null
                  ? `${mode.label}: no attempts in this period`
                  : `${mode.label}: ${rate} percent`
              }
            >
              <i style={{ width: `${rate ?? 0}%` }} />
            </div>
            <small>
              {mode.attempts === 0
                ? `No ${mode.id} answers yet`
                : `${mode.correct}/${mode.attempts} correct`}
            </small>
          </div>
        );
      })}
    </section>
  );
}

function MasteryDistribution({
  total,
  byPhase,
}: {
  readonly total: number;
  readonly byPhase: Record<LearningPhase, number>;
}) {
  return (
    <section className="mastery-distribution" aria-labelledby="mastery-distribution-title">
      <div className="section-heading">
        <h3 id="mastery-distribution-title">Current mastery</h3>
        <span>
          {byPhase.full}/{total} mastered
        </span>
      </div>
      <div
        className="mastery-track"
        role="img"
        aria-label={`${byPhase.crescent} learning, ${byPhase.half} building, ${byPhase.full} mastered`}
      >
        {PHASE_ORDER.map((phase) => (
          <i
            key={phase}
            data-phase={phase}
            style={{ width: `${total === 0 ? 0 : (byPhase[phase] / total) * 100}%` }}
          />
        ))}
      </div>
      <ul className="mastery-legend">
        {PHASE_ORDER.map((phase) => (
          <li key={phase} data-phase={phase}>
            <span aria-hidden="true" />
            <strong>{byPhase[phase]}</strong> {PHASE_LABEL[phase]}
          </li>
        ))}
      </ul>
    </section>
  );
}

function StatsInterpretation({
  period,
  range,
  delta,
  streak,
  total,
  byPhase,
}: {
  readonly period: StatsPeriod;
  readonly range: ReturnType<typeof summarizeActivityRange>;
  readonly delta: number | null;
  readonly streak: number;
  readonly total: number;
  readonly byPhase: Record<LearningPhase, number>;
}) {
  const contextRate = successRate(range.contextCorrect, range.contextAttempts);
  const recallRate = successRate(range.recallCorrect, range.recallAttempts);
  const insights = [
    momentumInsight(period, range.answers, streak, delta),
    modeInsight(contextRate, recallRate),
    masteryInsight(total, byPhase),
  ];

  return (
    <section className="stats-interpretation" aria-labelledby="stats-interpretation-title">
      <div className="section-heading">
        <h3 id="stats-interpretation-title">What the data says</h3>
        <span>{period}-day signals</span>
      </div>
      <ul>
        {insights.map((insight) => (
          <li key={insight.label} data-signal={insight.signal}>
            <span>{insight.label}</span>
            <strong>{insight.title}</strong>
            <p>{insight.copy}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

interface StatsInsight {
  readonly label: string;
  readonly title: string;
  readonly copy: string;
  readonly signal: 'momentum' | 'mode' | 'mastery';
}

function momentumInsight(
  period: StatsPeriod,
  answers: number,
  streak: number,
  delta: number | null,
): StatsInsight {
  if (answers === 0) {
    return {
      label: 'Momentum',
      title: 'Ready for a fresh start',
      copy: `No answers landed in this ${period}-day window. One short review will restart the trend.`,
      signal: 'momentum',
    };
  }
  if (period === 7 && delta !== null) {
    if (delta > 0) {
      return {
        label: 'Momentum',
        title: 'Momentum is rising',
        copy: `${delta} more ${delta === 1 ? 'answer' : 'answers'} than the previous week.`,
        signal: 'momentum',
      };
    }
    if (delta < 0) {
      return {
        label: 'Momentum',
        title: 'Momentum eased',
        copy: `${Math.abs(delta)} fewer ${Math.abs(delta) === 1 ? 'answer' : 'answers'} than the previous week. A short review can close the gap.`,
        signal: 'momentum',
      };
    }
    return {
      label: 'Momentum',
      title: 'Momentum is steady',
      copy: `You matched the previous week with ${answers} ${answers === 1 ? 'answer' : 'answers'}.`,
      signal: 'momentum',
    };
  }
  return {
    label: 'Daily streak',
    title: streak > 0 ? `${streak}-day streak in motion` : 'Start a daily streak',
    copy:
      streak > 0
        ? 'Answer one highlighted word correctly today to keep the flame going.'
        : 'One correct highlighted word starts a new streak.',
    signal: 'momentum',
  };
}

function modeInsight(contextRate: number | null, recallRate: number | null): StatsInsight {
  if (contextRate === null && recallRate === null) {
    return {
      label: 'Skill balance',
      title: 'More evidence needed',
      copy: 'Answer in context and complete typed recall to compare recognition with memory.',
      signal: 'mode',
    };
  }
  if (contextRate === null) {
    return {
      label: 'Skill balance',
      title: 'Context needs a first sample',
      copy: `Typed recall is at ${recallRate}%; answer a contextual prompt to complete the comparison.`,
      signal: 'mode',
    };
  }
  if (recallRate === null) {
    return {
      label: 'Skill balance',
      title: 'Recall needs a first sample',
      copy: `Context recognition is at ${contextRate}%; practice a typed meaning to measure recall.`,
      signal: 'mode',
    };
  }

  const gap = Math.abs(contextRate - recallRate);
  if (gap <= 5) {
    return {
      label: 'Skill balance',
      title: 'Recognition and recall are balanced',
      copy: `The two modes are within ${gap} percentage ${gap === 1 ? 'point' : 'points'} of each other.`,
      signal: 'mode',
    };
  }
  if (contextRate > recallRate) {
    return {
      label: 'Skill balance',
      title: 'Recall is the next opportunity',
      copy: `Context recognition leads typed recall by ${gap} percentage points. Practice weakest to close the gap.`,
      signal: 'mode',
    };
  }
  return {
    label: 'Skill balance',
    title: 'Recall is transferring well',
    copy: `Typed recall leads context recognition by ${gap} percentage points.`,
    signal: 'mode',
  };
}

function masteryInsight(total: number, byPhase: Record<LearningPhase, number>): StatsInsight {
  if (byPhase.full === total) {
    return {
      label: 'Mastery',
      title: 'Everything tracked is mastered',
      copy: `${total} ${total === 1 ? 'word has' : 'words have'} reached Full Moon. Read another article to expand the deck.`,
      signal: 'mastery',
    };
  }
  if (byPhase.half > 0) {
    return {
      label: 'Mastery',
      title: `${byPhase.half} ${byPhase.half === 1 ? 'word is' : 'words are'} close to mastery`,
      copy: `Building words are closest to Full Moon; ${total - byPhase.full} ${total - byPhase.full === 1 ? 'word is' : 'words are'} still developing.`,
      signal: 'mastery',
    };
  }
  return {
    label: 'Mastery',
    title: byPhase.full > 0 ? 'Mastery is taking hold' : 'Mastery is just beginning',
    copy: `${byPhase.full} mastered; ${total - byPhase.full} still developing through recall.`,
    signal: 'mastery',
  };
}

function localDateFromKey(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year ?? 0, (month ?? 1) - 1, day ?? 1);
}

function formatActivityDate(value: string): string {
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(
    localDateFromKey(value),
  );
}

function formatTimestampDate(value: string): string {
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(
    new Date(value),
  );
}

function SettingsView({
  status,
  confirmingReset,
  onRequestReset,
  onCancelReset,
  onReset,
  onRecalibrate,
}: {
  readonly status: StatusData | null;
  readonly confirmingReset: boolean;
  readonly onRequestReset: () => void;
  readonly onCancelReset: () => void;
  readonly onReset: () => void;
  readonly onRecalibrate?: () => void;
}) {
  const providerReady = Boolean(status?.provider.configured && status.provider.permissionGranted);
  return (
    <div className="view-stack settings-view">
      <ViewHeading
        eyebrow="Local by design"
        title="Settings & AI"
        copy="Your lens, provider, and privacy controls"
      />

      <section className="provider-card" data-ready={String(providerReady)}>
        <div className="provider-heading">
          <span className="provider-signal" aria-hidden="true" />
          <div>
            <p className="card-label">Ambient AI</p>
            <h3>{providerReady ? 'Ready' : 'Needs attention'}</h3>
          </div>
          <span className="provider-chip">Gemini</span>
        </div>
        <p>
          Eclipse sends article sentences—not page addresses or learning history—to your local
          generation service.
        </p>
        {status?.provider.lastError && (
          <p className="provider-error" role="status">
            {status.provider.lastError}
          </p>
        )}
      </section>

      <section className="lens-settings" aria-labelledby="lens-settings-title">
        <div className="level-seal">{status?.delfLevel ?? 'B1'}</div>
        <div>
          <p className="card-label">Reading lens</p>
          <h3 id="lens-settings-title">DELF {status?.delfLevel ?? 'B1'}</h3>
          <p>Re-run the diagnostic or choose another level.</p>
        </div>
        <button
          type="button"
          className="secondary-action"
          onClick={onRecalibrate}
          disabled={!onRecalibrate}
        >
          {onRecalibrate ? 'Recalibrate' : 'End session first'}
        </button>
      </section>

      <section className="settings-list" aria-label="Extension information">
        <div>
          <span>Message contract</span>
          <strong>v{status?.contractVersion ?? MESSAGE_CONTRACT_VERSION}</strong>
        </div>
        <div>
          <span>Learning data</span>
          <strong>On this device</strong>
        </div>
        <div>
          <span>Telemetry</span>
          <strong>None</strong>
        </div>
      </section>

      <details className="privacy-disclosure">
        <summary>Privacy details</summary>
        <ul>
          <li>No account, sign-in, analytics, or browsing-history collection.</li>
          <li>Eclipse reads a page only while a session is running.</li>
          <li>Your DELF level and selected sentences reach the local AI service.</li>
          <li>Progress and page addresses stay in this browser.</li>
        </ul>
      </details>

      <section className="danger-zone">
        <div>
          <p className="card-label">Fresh start</p>
          <h3>Reset learning data</h3>
          <p>Erase mastery, diagnostic, and cached vocabulary.</p>
        </div>
        {confirmingReset ? (
          <div className="confirmation-actions">
            <button type="button" className="danger-action" onClick={onReset}>
              Yes, erase everything
            </button>
            <button type="button" className="text-action" onClick={onCancelReset}>
              Cancel
            </button>
          </div>
        ) : (
          <button type="button" className="secondary-action" onClick={onRequestReset}>
            Reset all Eclipse data
          </button>
        )}
      </section>
    </div>
  );
}

function ViewHeading({
  eyebrow,
  title,
  copy,
}: {
  readonly eyebrow: string;
  readonly title: string;
  readonly copy: string;
}) {
  return (
    <header className="view-heading">
      <p className="view-eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      <p>{copy}</p>
    </header>
  );
}

function EmptyState({ title, copy }: { readonly title: string; readonly copy: string }) {
  return (
    <div className="empty-state">
      <span className="empty-eclipse" aria-hidden="true" />
      <h3>{title}</h3>
      <p>{copy}</p>
    </div>
  );
}

function accuracy(correct: number, attempts: number): number {
  return attempts === 0 ? 0 : Math.round((correct / attempts) * 100);
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
  if (takingDiagnostic)
    return <Diagnostic onDone={onDone} onChooseLevel={() => setTakingDiagnostic(false)} />;

  return (
    <section className="onboarding" aria-labelledby="level-title">
      <div className="onboarding-eclipse" aria-hidden="true">
        <span />
      </div>
      <p className="view-eyebrow">Calibrate your orbit</p>
      <h2 id="level-title">Set your DELF level</h2>
      <p className="onboarding-copy">
        Eclipse tunes every French word and phrase to the reading challenge that will move you
        forward.
      </p>

      <button
        type="button"
        className="primary-action diagnostic-cta"
        onClick={() => setTakingDiagnostic(true)}
      >
        <span>
          Take the comprehension diagnostic<small>8 questions · about 4 minutes</small>
        </span>
        <kbd aria-hidden="true">→</kbd>
      </button>

      <div className="setup-divider">
        <span>Or choose your current level</span>
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
        const copy = DELF_LEVEL_COPY[level] ?? DELF_LEVEL_COPY.B1;
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
    const copy = DELF_LEVEL_COPY[result.delfLevel] ?? DELF_LEVEL_COPY.B1;
    return (
      <section className="diagnostic-result" aria-labelledby="diagnostic-result-title">
        <p className="view-eyebrow">Diagnostic complete</p>
        <div className="diagnostic-result-hero">
          <div className="diagnostic-level">{result.delfLevel}</div>
          <div>
            <h2 id="diagnostic-result-title">Your reading lens</h2>
            <p>
              {result.correctAnswers} of {CALIBRATION_QUESTIONS.length} correct · {copy.label}
            </p>
          </div>
        </div>
        <p className="onboarding-copy">{copy.description}</p>
        <ul className="diagnostic-breakdown" aria-label="Comprehension skill breakdown">
          {(
            Object.entries(result.bySkill) as [
              DiagnosticSkill,
              { correct: number; total: number },
            ][]
          ).map(([skill, score]) => (
            <li key={skill}>
              <div>
                <span>{DIAGNOSTIC_SKILL_LABEL[skill]}</span>
                <i>
                  <b style={{ width: `${(score.correct / score.total) * 100}%` }} />
                </i>
              </div>
              <strong>
                {score.correct}/{score.total}
              </strong>
            </li>
          ))}
        </ul>
        <button
          type="button"
          className="primary-action"
          onClick={() => onDone(result.delfLevel, result.correctAnswers, 'diagnostic')}
        >
          <span>Use DELF {result.delfLevel}</span>
          <kbd aria-hidden="true">→</kbd>
        </button>
        <button type="button" className="text-action diagnostic-alt" onClick={onChooseLevel}>
          Choose a different level
        </button>
      </section>
    );
  }

  const isCorrect = selected === question.acceptedChoice;
  const progress = ((answers.length + (selected ? 1 : 0)) / CALIBRATION_QUESTIONS.length) * 100;
  return (
    <section className="diagnostic" aria-labelledby="diagnostic-question">
      <div className="diagnostic-progress-row">
        <p>
          DELF {question.level} · {answers.length + 1} / {CALIBRATION_QUESTIONS.length}
        </p>
        <button type="button" className="text-action" onClick={onChooseLevel}>
          Exit
        </button>
      </div>
      <div
        className="diagnostic-progress"
        aria-label={`Question ${answers.length + 1} of ${CALIBRATION_QUESTIONS.length}`}
      >
        <span style={{ width: `${progress}%` }} />
      </div>
      <div className="diagnostic-steps" aria-hidden="true">
        {CALIBRATION_QUESTIONS.map((item, index) => (
          <i
            key={item.id}
            data-state={
              index < answers.length ? 'done' : index === answers.length ? 'current' : 'next'
            }
          />
        ))}
      </div>
      <blockquote className="cal-passage" lang="fr-FR">
        {question.passage}
      </blockquote>
      <p className="cal-prompt" id="diagnostic-question">
        {question.prompt}
      </p>
      <ul className="cal-choices">
        {question.choices.map((choice, index) => {
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
                <kbd aria-hidden="true">{String.fromCharCode(65 + index)}</kbd>
                <span>{choice}</span>
                {state === 'correct' && <b aria-hidden="true">✓</b>}
                {state === 'incorrect' && <b aria-hidden="true">✕</b>}
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
            className="primary-action"
            onClick={() => {
              setAnswers((current) => [...current, selected]);
              setSelected(null);
            }}
          >
            <span>
              {answers.length + 1 === CALIBRATION_QUESTIONS.length
                ? 'See my result'
                : 'Next question'}
            </span>
            <kbd aria-hidden="true">→</kbd>
          </button>
        </div>
      )}
    </section>
  );
}
