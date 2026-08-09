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

type Phase = 'loading' | 'onboarding' | 'ready' | 'activating' | 'active';
type PopupTab = 'session' | 'vocabulary' | 'stats' | 'settings';

const TABS: readonly { id: PopupTab; label: string }[] = [
  { id: 'session', label: 'Session' },
  { id: 'vocabulary', label: 'Vocab' },
  { id: 'stats', label: 'Stats' },
  { id: 'settings', label: 'Settings' },
];

const PHASE_ORDER: readonly LearningPhase[] = LEARNING_PHASES;

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
          <SessionView status={status} phase={phase} onStart={onStart} onStop={onStop} />
        )}
        {activeTab === 'vocabulary' && (
          <VocabularyView items={status?.vocabulary ?? []} onPracticeAnswer={onPracticeAnswer} />
        )}
        {activeTab === 'stats' && (
          <StatsView
            status={status}
            onRecalibrate={phase === 'ready' ? () => setPhase('onboarding') : undefined}
          />
        )}
        {activeTab === 'settings' && (
          <SettingsView
            status={status}
            confirmingReset={confirmingReset}
            onRequestReset={() => setConfirmingReset(true)}
            onCancelReset={() => setConfirmingReset(false)}
            onReset={onReset}
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
      <div className="cosmic-atmosphere" aria-hidden="true">
        <span />
        <span />
      </div>
      <Header status={status} />
      {children}
    </main>
  );
}

function Header({ status }: { readonly status: StatusData | null }) {
  const aiReady = Boolean(status?.provider.enabled && status.provider.permissionGranted);
  return (
    <header className="popup-header">
      <div className="brand-orbit" aria-hidden="true">
        <Moon phase={status?.phase ?? 'crescent'} size={30} />
      </div>
      <div className="brand-copy">
        <p className="brand-kicker">Context becomes fluency</p>
        <h1 className="popup-title">Eclipse</h1>
      </div>
      <div
        className="ai-beacon"
        data-ready={String(aiReady)}
        aria-label={aiReady ? 'AI ready' : 'AI needs attention'}
      >
        <span aria-hidden="true" />
        AI
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
}: {
  readonly items: readonly VocabularyItem[];
  readonly onPracticeAnswer: (
    item: VocabularyItem,
    correct: boolean,
  ) => Promise<RecordAnswerData | null>;
}) {
  const [query, setQuery] = useState('');
  const [phase, setPhase] = useState<LearningPhase | 'all'>('all');
  const [practiceIds, setPracticeIds] = useState<string[]>([]);
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

function StatsView({
  status,
  onRecalibrate,
}: {
  readonly status: StatusData | null;
  readonly onRecalibrate?: () => void;
}) {
  const summary = status?.summary;
  const score = accuracy(summary?.correct ?? 0, summary?.attempts ?? 0);
  const phase = status?.phase ?? 'new_moon';
  const total = summary?.tracked ?? 0;

  return (
    <div className="view-stack stats-view">
      <ViewHeading
        eyebrow="Your reading orbit"
        title="Stats & moon"
        copy="Progress built from contextual answers"
      />

      {total === 0 ? (
        <EmptyState
          title="Your first word is waiting."
          copy="Start an Eclipse session and answer a highlighted word to begin your mastery orbit."
        />
      ) : (
        <section className="mastery-orbit-card">
          <div
            className="mastery-orbit"
            style={{ '--orbit-progress': `${score * 3.6}deg` } as React.CSSProperties}
          >
            <Moon phase={phase} size={74} />
            <span>{score}%</span>
          </div>
          <div>
            <p className="card-label">Overall phase</p>
            <h3>{PHASE_LABEL[phase]}</h3>
            <p>{PHASE_DESCRIPTION[phase]}.</p>
          </div>
        </section>
      )}

      <ul className="metric-grid" aria-label="Learning statistics">
        <li>
          <span>Answers</span>
          <strong>{summary?.attempts ?? 0}</strong>
        </li>
        <li>
          <span>Correct</span>
          <strong>{summary?.correct ?? 0}</strong>
        </li>
        <li>
          <span>Due</span>
          <strong>{summary?.due ?? 0}</strong>
        </li>
        <li>
          <span>DELF lens</span>
          <strong>{status?.delfLevel ?? 'B1'}</strong>
        </li>
      </ul>

      {total > 0 && (
        <section className="phase-distribution" aria-labelledby="phase-distribution-title">
          <div className="section-heading">
            <h3 id="phase-distribution-title">Mastery constellation</h3>
            <span>{total} total</span>
          </div>
          {PHASE_ORDER.map((value) => {
            const count = summary?.byPhase[value] ?? 0;
            const width = total === 0 ? 0 : (count / total) * 100;
            return (
              <div className="phase-bar" key={value}>
                <span>{PHASE_LABEL[value]}</span>
                <div>
                  <i style={{ width: `${width}%` }} />
                </div>
                <strong>{count}</strong>
              </div>
            );
          })}
        </section>
      )}

      <button
        type="button"
        className="secondary-action"
        onClick={onRecalibrate}
        disabled={!onRecalibrate}
      >
        {onRecalibrate ? 'Recalibrate DELF lens' : 'End the session to recalibrate'}
      </button>
    </div>
  );
}

function SettingsView({
  status,
  confirmingReset,
  onRequestReset,
  onCancelReset,
  onReset,
}: {
  readonly status: StatusData | null;
  readonly confirmingReset: boolean;
  readonly onRequestReset: () => void;
  readonly onCancelReset: () => void;
  readonly onReset: () => void;
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
