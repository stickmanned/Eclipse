/**
 * Learner profile: the only durable record Eclipse keeps, held in
 * `chrome.storage.local` and never sent anywhere.
 */

import { z } from 'zod';
import { CONCEPT_ID_PATTERN, type ConceptId } from './trap';
import { DELF_LEVELS, type DelfLevel } from './delf';

export const PROFILE_SCHEMA_VERSION = 1;

/** Most concept records retained. Oldest-updated entries are evicted first. */
export const MAX_CONCEPT_RECORDS = 500;

/** Length of the rolling outcome window kept on the profile. */
export const RECENT_OUTCOMES_LIMIT = 5;

export const MOON_PHASES = ['new_moon', 'crescent', 'half', 'full'] as const;
export type MoonPhase = (typeof MOON_PHASES)[number];

export type DueState =
  { kind: 'none' } | { kind: 'next_occurrence' } | { kind: 'timestamp'; at: string };

export interface ConceptMastery {
  /** -2 through 2. Higher means the learner reads this concept reliably. */
  score: number;
  phase: MoonPhase;
  attempts: number;
  correct: number;
  due: DueState;
  /** ISO-8601. Also the anchor used to derive the current review interval. */
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
}

const isoDate = z.string().refine((value) => !Number.isNaN(Date.parse(value)), {
  message: 'must be an ISO-8601 timestamp',
});

export const dueStateSchema: z.ZodType<DueState> = z.union([
  z.object({ kind: z.literal('none') }),
  z.object({ kind: z.literal('next_occurrence') }),
  z.object({ kind: z.literal('timestamp'), at: isoDate }),
]);

export const conceptMasterySchema = z.object({
  score: z.number().min(-2).max(2),
  phase: z.enum(MOON_PHASES),
  attempts: z.number().int().min(0),
  correct: z.number().int().min(0),
  due: dueStateSchema,
  updatedAt: isoDate,
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
});

/** A brand-new profile. Calibration has not run; ability sits at the midpoint. */
export function createEmptyProfile(): LearnerProfile {
  return {
    schemaVersion: PROFILE_SCHEMA_VERSION,
    sourceLocale: 'en',
    targetLocale: 'fr-FR',
    calibrationCompleted: false,
    delfLevel: 'B1',
    globalAbility: 0,
    mastery: {},
    recentOutcomes: [],
  };
}

/** Mastery for a concept the learner has never met. */
export function emptyMastery(now: Date): ConceptMastery {
  return {
    score: 0,
    phase: 'new_moon',
    attempts: 0,
    correct: 0,
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
  byPhase: Record<MoonPhase, number>;
  /** The learner's overall phase, derived from their strongest sustained work. */
  overallPhase: MoonPhase;
}

export function summarizeMastery(profile: LearnerProfile, now: Date): MasterySummary {
  const byPhase: Record<MoonPhase, number> = {
    new_moon: 0,
    crescent: 0,
    half: 0,
    full: 0,
  };

  let attempts = 0;
  let correct = 0;
  let due = 0;
  const records = Object.values(profile.mastery);

  for (const record of records) {
    byPhase[record.phase] += 1;
    attempts += record.attempts;
    correct += record.correct;
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
 * The single phase shown in the popup. It reflects the median concept rather
 * than the best one, so the moon does not jump to full after a single win.
 */
function overallPhaseFrom(byPhase: Record<MoonPhase, number>, total: number): MoonPhase {
  if (total === 0) return 'new_moon';
  const ordered: MoonPhase[] = ['full', 'half', 'crescent', 'new_moon'];
  let seen = 0;
  for (const phase of ordered) {
    seen += byPhase[phase];
    if (seen * 2 >= total) return phase;
  }
  return 'new_moon';
}
