/**
 * Learner profile: the only durable record Eclipse keeps, held in
 * `chrome.storage.local` and never sent anywhere.
 */

import { z } from 'zod';
import { CONCEPT_ID_PATTERN, type ConceptId } from './trap';
import { DELF_LEVELS, type DelfLevel } from './delf';
import { retrievabilityOf } from './scheduling';

export const PROFILE_SCHEMA_VERSION = 4;

/** Most concept records retained. Oldest-updated entries are evicted first. */
export const MAX_CONCEPT_RECORDS = 500;

/** Length of the rolling outcome window kept on the profile. */
export const RECENT_OUTCOMES_LIMIT = 5;
export const REVIEW_EVENT_LIMIT = 40;
export const SUCCESSFUL_REVIEW_DAY_LIMIT = 366;
export const CONTEXT_FINGERPRINT_LIMIT = 80;
export const ACTIVITY_DAY_LIMIT = 30;

export const MOON_PHASES = ['new_moon', 'crescent', 'half', 'full'] as const;
export type MoonPhase = (typeof MOON_PHASES)[number];
export const LEARNING_PHASES = ['crescent', 'half', 'full'] as const;
export type LearningPhase = (typeof LEARNING_PHASES)[number];

export type DueState =
  { kind: 'none' } | { kind: 'next_occurrence' } | { kind: 'timestamp'; at: string };

/** JSON-safe subset of the pinned ts-fsrs Card. */
export interface FsrsCardState {
  due: string;
  stability: number;
  difficulty: number;
  elapsedDays: number;
  scheduledDays: number;
  learningSteps: number;
  reps: number;
  lapses: number;
  state: 0 | 1 | 2 | 3;
  lastReview?: string;
}

export type ReviewMode = 'context-choice' | 'typed-meaning' | 'bare-recall';
export type SchedulerRating = 'again' | 'hard' | 'good';

export interface ReviewEvent {
  interactionId: string;
  reviewedAt: string;
  correct: boolean;
  assisted: boolean;
  mode: ReviewMode;
  scheduled: boolean;
  schedulerRating: SchedulerRating;
  contextFingerprint?: string;
}

export interface DailyLearningActivity {
  /** Local device calendar date in YYYY-MM-DD form. */
  date: string;
  contextAttempts: number;
  contextCorrect: number;
  recallAttempts: number;
  recallCorrect: number;
}

export interface ActivityHistory {
  /** Activity is known to be complete only from this instant onward. */
  completeSince: string;
  /** Sparse, chronological activity buckets from the last 30 calendar days. */
  days: DailyLearningActivity[];
}

export interface LearningStreak {
  /** Consecutive local calendar days with a correct contextual answer. */
  count: number;
  /** Most recent qualifying local device date, stored as YYYY-MM-DD. */
  lastExtendedDate?: string;
}

export interface ConceptMastery {
  /** -2 through 2. Higher means the learner reads this concept reliably. */
  score: number;
  /** Learner-facing strength. Attempted concepts always start at Crescent. */
  phase: LearningPhase;
  attempts: number;
  correct: number;
  /** Current durable review interval. Early practice never increases it. */
  intervalDays: number;
  /** Correct typed-meaning practices; 1 earns Half Moon and 3 earn Full Moon. */
  unassistedCorrect: number;
  /** Incorrect recalls. Kept for relearning and future scheduler tuning. */
  lapses: number;
  fsrsCard: FsrsCardState;
  firstAnsweredAt: string;
  /** UTC calendar days with a qualifying unassisted recall. */
  successfulReviewDays: string[];
  /** Bounded distinct hashes retained even after individual events are pruned. */
  contextFingerprints: string[];
  /** Bounded evidence/history for phase gates and future migrations. */
  reviewEvents: ReviewEvent[];
  /** Migrated v1 label; cleared and revalidated on the next answer. */
  legacyPhase?: boolean;
  due: DueState;
  /** ISO-8601 timestamp of the most recent answer. */
  updatedAt: string;
  /** Last validated learner-facing copy for the vocabulary deck. */
  display?: VocabularyDisplay;
}

export interface VocabularyDisplay {
  targetSurface: string;
  englishMeaning: string;
  kind: 'word' | 'phrase';
}

export interface VocabularyItem extends VocabularyDisplay {
  conceptId: string;
  phase: LearningPhase;
  attempts: number;
  correct: number;
  intervalDays: number;
  unassistedCorrect: number;
  lapses: number;
  stability: number;
  retrievability: number;
  successfulReviewDays: string[];
  /** Distinct privacy-preserving article contexts seen for this concept. */
  contextCount: number;
  /** Retained for message compatibility; simplified mastery never dims. */
  memoryDimmed: boolean;
  /** A pre-v2 Half/Full label awaiting evidence-based revalidation. */
  legacyPhase?: boolean;
  due: DueState;
  updatedAt: string;
}

export interface AnswerOutcome {
  interactionId: string;
  conceptId: ConceptId;
  correct: boolean;
  at: string;
}

export interface LearnerProfile {
  schemaVersion: typeof PROFILE_SCHEMA_VERSION;
  sourceLocale: 'en';
  targetLocale: 'fr-FR';
  calibrationCompleted: boolean;
  /** Stable learner-selected or diagnostic-assigned reading lens. */
  delfLevel: DelfLevel;
  /** -1 through 1. */
  globalAbility: number;
  mastery: Record<string, ConceptMastery>;
  recentOutcomes: AnswerOutcome[];
  activity: ActivityHistory;
  streak: LearningStreak;
}

const isoDate = z.string().refine((value) => !Number.isNaN(Date.parse(value)), {
  message: 'must be an ISO-8601 timestamp',
});

export const dueStateSchema: z.ZodType<DueState> = z.union([
  z.object({ kind: z.literal('none') }),
  z.object({ kind: z.literal('next_occurrence') }),
  z.object({ kind: z.literal('timestamp'), at: isoDate }),
]);

export const fsrsCardStateSchema: z.ZodType<FsrsCardState> = z.object({
  due: isoDate,
  stability: z.number().min(0),
  difficulty: z.number().min(0).max(10),
  elapsedDays: z.number().min(0),
  scheduledDays: z.number().min(0),
  learningSteps: z.number().min(0),
  reps: z.number().int().min(0),
  lapses: z.number().int().min(0),
  state: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)]),
  lastReview: isoDate.optional(),
});

export const reviewEventSchema: z.ZodType<ReviewEvent> = z.object({
  interactionId: z.string().min(1).max(120),
  reviewedAt: isoDate,
  correct: z.boolean(),
  assisted: z.boolean(),
  mode: z.enum(['context-choice', 'typed-meaning', 'bare-recall']),
  scheduled: z.boolean(),
  schedulerRating: z.enum(['again', 'hard', 'good']),
  contextFingerprint: z.string().min(1).max(120).optional(),
});

export const dailyLearningActivitySchema: z.ZodType<DailyLearningActivity> = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  contextAttempts: z.number().int().min(0),
  contextCorrect: z.number().int().min(0),
  recallAttempts: z.number().int().min(0),
  recallCorrect: z.number().int().min(0),
});

export const activityHistorySchema: z.ZodType<ActivityHistory> = z.object({
  completeSince: isoDate,
  days: z.array(dailyLearningActivitySchema).max(ACTIVITY_DAY_LIMIT),
});

export const learningStreakSchema: z.ZodType<LearningStreak> = z.object({
  count: z.number().int().min(0),
  lastExtendedDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
});

export const conceptMasterySchema = z.object({
  score: z.number().min(-2).max(2),
  phase: z.enum(LEARNING_PHASES),
  attempts: z.number().int().min(0),
  correct: z.number().int().min(0),
  intervalDays: z.number().min(0).max(365),
  unassistedCorrect: z.number().int().min(0),
  lapses: z.number().int().min(0),
  fsrsCard: fsrsCardStateSchema,
  firstAnsweredAt: isoDate,
  successfulReviewDays: z
    .array(z.string().regex(/^\d{4}-\d{2}-\d{2}$/))
    .max(SUCCESSFUL_REVIEW_DAY_LIMIT),
  contextFingerprints: z.array(z.string().min(1).max(120)).max(CONTEXT_FINGERPRINT_LIMIT),
  reviewEvents: z.array(reviewEventSchema).max(REVIEW_EVENT_LIMIT),
  legacyPhase: z.boolean().optional(),
  due: dueStateSchema,
  updatedAt: isoDate,
  display: z
    .object({
      targetSurface: z.string().trim().min(1).max(120),
      englishMeaning: z.string().trim().min(1).max(240),
      kind: z.enum(['word', 'phrase']),
    })
    .optional(),
});

export const answerOutcomeSchema = z.object({
  interactionId: z.string().min(1).max(120),
  conceptId: z.string().regex(CONCEPT_ID_PATTERN),
  correct: z.boolean(),
  at: isoDate,
});

export const learnerProfileSchema = z.object({
  schemaVersion: z.literal(PROFILE_SCHEMA_VERSION),
  sourceLocale: z.literal('en'),
  targetLocale: z.literal('fr-FR'),
  calibrationCompleted: z.boolean(),
  // Profiles written before DELF lenses existed safely resume at B1. Keeping
  // the same schema version avoids treating valid learner history as corrupt.
  delfLevel: z.enum(DELF_LEVELS).default('B1'),
  globalAbility: z.number().min(-1).max(1),
  mastery: z.record(z.string().regex(CONCEPT_ID_PATTERN), conceptMasterySchema),
  recentOutcomes: z.array(answerOutcomeSchema).max(RECENT_OUTCOMES_LIMIT),
  activity: activityHistorySchema,
  streak: learningStreakSchema,
});

/** A brand-new profile. Calibration has not run; ability sits at the midpoint. */
export function createEmptyProfile(now = new Date()): LearnerProfile {
  return {
    schemaVersion: PROFILE_SCHEMA_VERSION,
    sourceLocale: 'en',
    targetLocale: 'fr-FR',
    calibrationCompleted: false,
    delfLevel: 'B1',
    globalAbility: 0,
    mastery: {},
    recentOutcomes: [],
    activity: {
      completeSince: now.toISOString(),
      days: [],
    },
    streak: { count: 0 },
  };
}

/** Mastery for a concept the learner has never met. */
export function emptyMastery(now: Date): ConceptMastery {
  return {
    score: 0,
    phase: 'crescent',
    attempts: 0,
    correct: 0,
    intervalDays: 0,
    unassistedCorrect: 0,
    lapses: 0,
    fsrsCard: {
      due: now.toISOString(),
      stability: 0,
      difficulty: 0,
      elapsedDays: 0,
      scheduledDays: 0,
      learningSteps: 0,
      reps: 0,
      lapses: 0,
      state: 0,
    },
    firstAnsweredAt: now.toISOString(),
    successfulReviewDays: [],
    contextFingerprints: [],
    reviewEvents: [],
    due: { kind: 'none' },
    updatedAt: now.toISOString(),
  };
}

export function getMastery(profile: LearnerProfile, conceptId: string): ConceptMastery | undefined {
  return profile.mastery[conceptId];
}

/**
 * Trim the mastery map to {@link MAX_CONCEPT_RECORDS}, dropping the least
 * recently updated records first. Ties break on concept id so the result is
 * deterministic.
 */
export function pruneMastery(
  mastery: Record<string, ConceptMastery>,
  limit = MAX_CONCEPT_RECORDS,
): Record<string, ConceptMastery> {
  const entries = Object.entries(mastery);
  if (entries.length <= limit) return mastery;

  entries.sort((a, b) => {
    const byDate = Date.parse(b[1].updatedAt) - Date.parse(a[1].updatedAt);
    if (byDate !== 0) return byDate;
    return a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0;
  });

  return Object.fromEntries(entries.slice(0, limit));
}

/** Counts used by the popup's compact mastery summary. */
export interface MasterySummary {
  tracked: number;
  attempts: number;
  correct: number;
  due: number;
  byPhase: Record<LearningPhase, number>;
  /** The learner's overall phase, derived from their strongest sustained work. */
  overallPhase: MoonPhase;
}

export function summarizeMastery(profile: LearnerProfile, now: Date): MasterySummary {
  const byPhase: Record<LearningPhase, number> = {
    crescent: 0,
    half: 0,
    full: 0,
  };

  let attempts = 0;
  let correct = 0;
  let due = 0;
  const records = Object.values(profile.mastery);

  for (const record of records) {
    byPhase[displayedPhase(record, now)] += 1;
    attempts += record.attempts;
    correct += record.correct;
    if (record.phase === 'full') continue;
    if (record.due.kind === 'next_occurrence') due += 1;
    else if (record.due.kind === 'timestamp' && Date.parse(record.due.at) <= now.getTime())
      due += 1;
  }

  return {
    tracked: records.length,
    attempts,
    correct,
    due,
    byPhase,
    overallPhase: overallPhaseFrom(byPhase, records.length),
  };
}

/**
 * Bounded learner-facing vocabulary rows for the popup.
 *
 * Records created before display metadata existed remain useful: the stable
 * concept id supplies a plain fallback until the learner sees the item again.
 */
export function vocabularyItems(profile: LearnerProfile, now = new Date()): VocabularyItem[] {
  return Object.entries(profile.mastery)
    .map(([conceptId, mastery]) => {
      const [, surface = conceptId, meaning = 'Meaning unavailable'] = conceptId.split(':');
      const phase = displayedPhase(mastery, now);
      const retrievability = retrievabilityOf(mastery, now);
      return {
        conceptId,
        targetSurface: mastery.display?.targetSurface ?? surface.replaceAll('-', ' '),
        englishMeaning: mastery.display?.englishMeaning ?? meaning.replaceAll('-', ' '),
        kind: mastery.display?.kind ?? 'word',
        phase,
        attempts: mastery.attempts,
        correct: mastery.correct,
        intervalDays: mastery.intervalDays,
        unassistedCorrect: mastery.unassistedCorrect,
        lapses: mastery.lapses,
        stability: mastery.fsrsCard.stability,
        retrievability,
        successfulReviewDays: mastery.successfulReviewDays,
        contextCount: mastery.contextFingerprints.length,
        memoryDimmed: false,
        legacyPhase: mastery.legacyPhase,
        due: mastery.due,
        updatedAt: mastery.updatedAt,
      } satisfies VocabularyItem;
    })
    .sort((left, right) => {
      const phaseOrder: Record<LearningPhase, number> = {
        crescent: 0,
        half: 1,
        full: 2,
      };
      const byPhase = phaseOrder[left.phase] - phaseOrder[right.phase];
      if (byPhase !== 0) return byPhase;
      const byUpdated = Date.parse(right.updatedAt) - Date.parse(left.updatedAt);
      if (byUpdated !== 0) return byUpdated;
      return left.targetSurface.localeCompare(right.targetSurface, 'fr');
    });
}

function displayedPhase(mastery: ConceptMastery, now: Date): LearningPhase {
  void now;
  return mastery.phase;
}

/**
 * The single phase shown in the popup. It reflects the median concept rather
 * than the best one, so the moon does not jump to full after a single win.
 */
function overallPhaseFrom(byPhase: Record<LearningPhase, number>, total: number): MoonPhase {
  if (total === 0) return 'new_moon';
  const ordered: LearningPhase[] = ['full', 'half', 'crescent'];
  let seen = 0;
  for (const phase of ordered) {
    seen += byPhase[phase];
    if (seen * 2 >= total) return phase;
  }
  return 'crescent';
}
