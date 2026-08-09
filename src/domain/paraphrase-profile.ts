/**
 * The Paraphrase Mode learner profile.
 *
 * Deliberately lightweight — Core #2 asks for "a lightweight, persistent
 * profile of the user's vocabulary range", not a second copy of the mastery
 * engine. Three things are kept and nothing else:
 *
 *   band      where the learner reads, and how far above that Eclipse is aiming
 *   registers which categories of difficulty they actually struggle with
 *   concepts  the specific wordings they have missed, so those come back
 *
 * Stored under its own key, in its own namespace (`frp:`), with its own schema
 * version. It never reads or writes the Translate Mode profile, so a bug on
 * either side cannot corrupt the other's history.
 *
 * Everything here is pure. Storage IO lives in `src/storage/paraphrase-store.ts`
 * and the single-writer rule is enforced by the background bridge, exactly as
 * `RECORD_ANSWER` is for Translate Mode.
 */

import { z } from 'zod';
import {
  DEFAULT_BAND,
  applyAnswer,
  applyManualRequest,
  emptyRegisterStats,
  registerStrength,
  seedBandForDelf,
  targetComplexity,
  bandWindow,
  weakestRegisters,
  type BandDirection,
  type ComplexityBand,
  type RegisterStat,
} from './complexity';
import {
  PARAPHRASE_CONCEPT_ID_PATTERN,
  PARAPHRASE_REGISTERS,
  type ParaphraseConceptId,
  type ParaphraseRegister,
} from './paraphrase';
import type { DelfLevel } from './delf';

export const PARAPHRASE_PROFILE_VERSION = 1;

/** Most concept records retained. Oldest-updated *known* records evict first. */
export const MAX_PARAPHRASE_CONCEPTS = 400;
/** Rolling outcome window used for the popup's trend line. */
export const RECENT_OUTCOME_LIMIT = 20;
/** Interaction ids retained for idempotency, mirroring Translate Mode's log. */
export const INTERACTION_LOG_LIMIT = 200;

/**
 * `unknown` is the only state that earns a place on a later page. A learner who
 * has answered a wording correctly twice running does not need to meet it
 * again; a learner who missed it once does, and soon.
 */
export const CONCEPT_STATES = ['unknown', 'learning', 'known'] as const;
export type ParaphraseConceptState = (typeof CONCEPT_STATES)[number];

/** Consecutive correct recalls that retire a wording. */
export const RETIRE_AFTER_CONSECUTIVE_CORRECT = 2;

export interface ParaphraseConceptRecord {
  /** The hard original wording, as it appeared on the page. */
  original: string;
  /** The simplification Eclipse showed in its place. */
  simplified: string;
  register: ParaphraseRegister;
  complexity: number;
  attempts: number;
  correct: number;
  consecutiveCorrect: number;
  state: ParaphraseConceptState;
  /** Whether this wording is owed a reappearance. */
  due: 'none' | 'next_occurrence';
  /** Times the learner asked for this wording to be simplified. */
  manualRequests: number;
  firstSeenAt: string;
  updatedAt: string;
}

export interface RecentOutcome {
  complexity: number;
  correct: boolean;
  at: string;
}

export interface ParaphraseProfile {
  schemaVersion: typeof PARAPHRASE_PROFILE_VERSION;
  locale: 'fr-FR';
  /** True once the band has been seeded from a DELF level or an answer. */
  seeded: boolean;
  band: ComplexityBand;
  registers: Record<ParaphraseRegister, RegisterStat>;
  concepts: Record<string, ParaphraseConceptRecord>;
  recent: RecentOutcome[];
  totals: {
    answered: number;
    correct: number;
    manualRequests: number;
  };
  /** Bounded log of applied interaction ids. Duplicated messages are no-ops. */
  interactions: string[];
  updatedAt: string;
}

const isoDate = z.string().refine((value) => !Number.isNaN(Date.parse(value)), {
  message: 'must be an ISO-8601 timestamp',
});

const bandSchema = z.object({
  center: z.number().min(0).max(1),
  reach: z.number().min(-1).max(1),
});

const registerStatSchema = z.object({
  attempts: z.number().int().min(0),
  correct: z.number().int().min(0),
});

const conceptRecordSchema = z.object({
  original: z.string().min(1).max(200),
  simplified: z.string().min(1).max(200),
  register: z.enum(PARAPHRASE_REGISTERS),
  complexity: z.number().min(0).max(1),
  attempts: z.number().int().min(0),
  correct: z.number().int().min(0),
  consecutiveCorrect: z.number().int().min(0),
  state: z.enum(CONCEPT_STATES),
  due: z.enum(['none', 'next_occurrence']),
  manualRequests: z.number().int().min(0),
  firstSeenAt: isoDate,
  updatedAt: isoDate,
});

export const paraphraseProfileSchema = z.object({
  schemaVersion: z.literal(PARAPHRASE_PROFILE_VERSION),
  locale: z.literal('fr-FR'),
  seeded: z.boolean(),
  band: bandSchema,
  /**
   * Keyed by a plain string, not by the register enum.
   *
   * `z.record` over an enum is exhaustive: every member must be present or the
   * whole object fails. That would make adding a seventh register a breaking
   * change — every profile written by an earlier build would come back
   * `PROFILE_INCOMPATIBLE`, and a learner would be told their data is corrupt
   * because Eclipse learned a new word for "idiom". The load path fills any
   * missing register and drops any it does not recognise.
   */
  registers: z.record(z.string(), registerStatSchema),
  concepts: z.record(z.string().regex(PARAPHRASE_CONCEPT_ID_PATTERN), conceptRecordSchema),
  recent: z
    .array(z.object({ complexity: z.number().min(0).max(1), correct: z.boolean(), at: isoDate }))
    .max(RECENT_OUTCOME_LIMIT),
  totals: z.object({
    answered: z.number().int().min(0),
    correct: z.number().int().min(0),
    manualRequests: z.number().int().min(0),
  }),
  interactions: z.array(z.string().min(1).max(120)).max(INTERACTION_LOG_LIMIT),
  updatedAt: isoDate,
});

export function createEmptyParaphraseProfile(now = new Date()): ParaphraseProfile {
  return {
    schemaVersion: PARAPHRASE_PROFILE_VERSION,
    locale: 'fr-FR',
    seeded: false,
    band: DEFAULT_BAND,
    registers: emptyRegisterStats(),
    concepts: {},
    recent: [],
    totals: { answered: 0, correct: 0, manualRequests: 0 },
    interactions: [],
    updatedAt: now.toISOString(),
  };
}

/**
 * Seed the band from the learner's DELF lens, once.
 *
 * Idempotent by design: re-seeding after real answers would throw away
 * everything Paraphrase Mode had measured and replace it with a guess derived
 * from a different mode's diagnostic.
 */
export function seedProfile(
  profile: ParaphraseProfile,
  delfLevel: DelfLevel,
  now = new Date(),
): ParaphraseProfile {
  if (profile.seeded) return profile;
  return {
    ...profile,
    seeded: true,
    band: seedBandForDelf(delfLevel),
    updatedAt: now.toISOString(),
  };
}

export interface ParaphraseAnswerInput {
  readonly interactionId: string;
  readonly conceptId: ParaphraseConceptId;
  readonly original: string;
  readonly simplified: string;
  readonly register: ParaphraseRegister;
  readonly complexity: number;
  readonly correct: boolean;
  readonly now?: Date;
}

export interface ParaphraseAnswerResult {
  readonly profile: ParaphraseProfile;
  /** False when the interaction id had already been applied. */
  readonly applied: boolean;
  readonly direction: BandDirection;
  readonly previousBand: ComplexityBand;
  readonly record: ParaphraseConceptRecord;
}

/**
 * Fold one answered item into the profile.
 *
 * Idempotent on `interactionId`, for the same reason Translate Mode is: a
 * retried message must not count twice, and the guard has to survive a reload,
 * so it lives in the persisted profile rather than in memory.
 */
export function applyParaphraseAnswer(
  profile: ParaphraseProfile,
  input: ParaphraseAnswerInput,
): ParaphraseAnswerResult {
  const now = input.now ?? new Date();
  const timestamp = now.toISOString();
  const existing = profile.concepts[input.conceptId];

  if (profile.interactions.includes(input.interactionId)) {
    return {
      profile,
      applied: false,
      direction: 'held',
      previousBand: profile.band,
      record: existing ?? newRecord(input, timestamp),
    };
  }

  const update = applyAnswer(profile.band, input.complexity, input.correct);
  const record = advance(existing ?? newRecord(input, timestamp), input, timestamp);
  const registerStat = profile.registers[input.register] ?? { attempts: 0, correct: 0 };

  const next: ParaphraseProfile = {
    ...profile,
    seeded: true,
    band: update.band,
    registers: {
      ...profile.registers,
      [input.register]: {
        attempts: registerStat.attempts + 1,
        correct: registerStat.correct + (input.correct ? 1 : 0),
      },
    },
    concepts: prune({ ...profile.concepts, [input.conceptId]: record }),
    recent: [
      ...profile.recent,
      { complexity: input.complexity, correct: input.correct, at: timestamp },
    ].slice(-RECENT_OUTCOME_LIMIT),
    totals: {
      ...profile.totals,
      answered: profile.totals.answered + 1,
      correct: profile.totals.correct + (input.correct ? 1 : 0),
    },
    interactions: [...profile.interactions, input.interactionId].slice(-INTERACTION_LOG_LIMIT),
    updatedAt: timestamp,
  };

  return {
    profile: next,
    applied: true,
    direction: update.direction,
    previousBand: update.previous,
    record,
  };
}

export interface ParaphraseManualInput {
  readonly interactionId: string;
  readonly conceptId: ParaphraseConceptId;
  readonly original: string;
  readonly simplified: string;
  readonly register: ParaphraseRegister;
  readonly complexity: number;
  readonly now?: Date;
}

/**
 * Fold a learner-requested paraphrase into the profile.
 *
 * Asking is not failing, so this never touches `answered`/`correct` and never
 * pushes ambition negative. What it does do is mark the wording owed — someone
 * who had to ask what a phrase meant should meet it again — and bend the band
 * down by a fraction of a miss.
 */
export function applyParaphraseManualRequest(
  profile: ParaphraseProfile,
  input: ParaphraseManualInput,
): ParaphraseAnswerResult {
  const now = input.now ?? new Date();
  const timestamp = now.toISOString();
  const existing = profile.concepts[input.conceptId];

  if (profile.interactions.includes(input.interactionId)) {
    return {
      profile,
      applied: false,
      direction: 'held',
      previousBand: profile.band,
      record: existing ?? newRecord(input, timestamp),
    };
  }

  const update = applyManualRequest(profile.band, input.complexity);
  const base = existing ?? newRecord(input, timestamp);
  const record: ParaphraseConceptRecord = {
    ...base,
    original: input.original,
    simplified: input.simplified,
    register: input.register,
    complexity: input.complexity,
    manualRequests: base.manualRequests + 1,
    consecutiveCorrect: 0,
    state: base.state === 'known' ? 'learning' : 'unknown',
    due: 'next_occurrence',
    updatedAt: timestamp,
  };

  const registerStat = profile.registers[input.register] ?? { attempts: 0, correct: 0 };

  return {
    profile: {
      ...profile,
      seeded: true,
      band: update.band,
      // A request is a sighting of the category, not an attempt at it: it says
      // "this register is worth spending budget on" without pretending the
      // learner was tested. Counting it as an attempt with no correct answer
      // would let idle curiosity look identical to repeated failure.
      registers: {
        ...profile.registers,
        [input.register]: registerStat,
      },
      concepts: prune({ ...profile.concepts, [input.conceptId]: record }),
      totals: { ...profile.totals, manualRequests: profile.totals.manualRequests + 1 },
      interactions: [...profile.interactions, input.interactionId].slice(-INTERACTION_LOG_LIMIT),
      updatedAt: timestamp,
    },
    applied: true,
    direction: update.direction,
    previousBand: update.previous,
    record,
  };
}

function newRecord(
  input: {
    original: string;
    simplified: string;
    register: ParaphraseRegister;
    complexity: number;
  },
  timestamp: string,
): ParaphraseConceptRecord {
  return {
    original: input.original,
    simplified: input.simplified,
    register: input.register,
    complexity: input.complexity,
    attempts: 0,
    correct: 0,
    consecutiveCorrect: 0,
    state: 'unknown',
    due: 'none',
    manualRequests: 0,
    firstSeenAt: timestamp,
    updatedAt: timestamp,
  };
}

/**
 * The state machine behind "it comes back".
 *
 * A miss always re-owes the wording, however well it had been going. Two
 * consecutive recalls retire it. One recall in between leaves it `learning` and
 * still owed, which is what produces the spec's fourth round: a wording the
 * learner failed keeps reappearing until they have recovered it twice running.
 */
function advance(
  record: ParaphraseConceptRecord,
  input: ParaphraseAnswerInput,
  timestamp: string,
): ParaphraseConceptRecord {
  const consecutiveCorrect = input.correct ? record.consecutiveCorrect + 1 : 0;
  const retired = consecutiveCorrect >= RETIRE_AFTER_CONSECUTIVE_CORRECT;

  return {
    ...record,
    original: input.original,
    simplified: input.simplified,
    register: input.register,
    complexity: input.complexity,
    attempts: record.attempts + 1,
    correct: record.correct + (input.correct ? 1 : 0),
    consecutiveCorrect,
    state: retired ? 'known' : input.correct ? 'learning' : 'unknown',
    due: retired ? 'none' : 'next_occurrence',
    updatedAt: timestamp,
  };
}

/**
 * Trim to {@link MAX_PARAPHRASE_CONCEPTS}.
 *
 * Retired wordings go first regardless of age. Evicting by recency alone would
 * drop exactly the records the mode exists to keep — the ones the learner
 * missed — while preserving wordings they have already proven twice.
 */
export function prune(
  concepts: Record<string, ParaphraseConceptRecord>,
  limit = MAX_PARAPHRASE_CONCEPTS,
): Record<string, ParaphraseConceptRecord> {
  const entries = Object.entries(concepts);
  if (entries.length <= limit) return concepts;

  const keepOrder: Record<ParaphraseConceptState, number> = { unknown: 0, learning: 1, known: 2 };
  entries.sort((a, b) => {
    const byState = keepOrder[a[1].state] - keepOrder[b[1].state];
    if (byState !== 0) return byState;
    const byDate = Date.parse(b[1].updatedAt) - Date.parse(a[1].updatedAt);
    if (byDate !== 0) return byDate;
    return a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0;
  });

  return Object.fromEntries(entries.slice(0, limit));
}

/**
 * Wordings owed a reappearance, hardest-missed first.
 *
 * Sent to the model as reinforcement hints and used locally as a hard priority
 * tier, exactly like Translate Mode's due concepts — the same reason applies:
 * a preference that usually happens is not a guarantee, and a tier is.
 */
export function dueConcepts(
  profile: ParaphraseProfile,
  limit = 12,
): { conceptId: string; record: ParaphraseConceptRecord }[] {
  return Object.entries(profile.concepts)
    .filter(([, record]) => record.due === 'next_occurrence')
    .sort((a, b) => {
      const byState = (a[1].state === 'unknown' ? 0 : 1) - (b[1].state === 'unknown' ? 0 : 1);
      if (byState !== 0) return byState;
      const byDate = Date.parse(b[1].updatedAt) - Date.parse(a[1].updatedAt);
      if (byDate !== 0) return byDate;
      return a[0] < b[0] ? -1 : 1;
    })
    .slice(0, Math.max(0, limit))
    .map(([conceptId, record]) => ({ conceptId, record }));
}

export interface RegisterSnapshot {
  register: ParaphraseRegister;
  label: string;
  attempts: number;
  correct: number;
  /** Laplace-smoothed success rate, 0–1. */
  strength: number;
}

export interface ParaphraseSnapshot {
  seeded: boolean;
  center: number;
  reach: number;
  target: number;
  window: [number, number];
  answered: number;
  correct: number;
  manualRequests: number;
  tracked: number;
  byState: Record<ParaphraseConceptState, number>;
  dueCount: number;
  focusRegisters: ParaphraseRegister[];
  registers: RegisterSnapshot[];
  /** −1..1. Recent direction of travel, for the popup's one-line read. */
  trend: number;
  /** Bounded, learner-facing rows for the popup's review list. */
  review: {
    conceptId: string;
    original: string;
    simplified: string;
    register: ParaphraseRegister;
  }[];
  updatedAt: string;
}

/**
 * Bounded, presentation-ready view of the profile.
 *
 * The popup never receives raw concept records or the interaction log, for the
 * same reason it never receives raw review history in Translate Mode: the
 * writer owns the durable shape, every surface downstream gets an aggregate.
 */
export function summarizeParaphraseProfile(profile: ParaphraseProfile): ParaphraseSnapshot {
  const byState: Record<ParaphraseConceptState, number> = { unknown: 0, learning: 0, known: 0 };
  let dueCount = 0;
  for (const record of Object.values(profile.concepts)) {
    byState[record.state] += 1;
    if (record.due === 'next_occurrence') dueCount += 1;
  }

  const [windowMin, windowMax] = bandWindow(profile.band);

  return {
    seeded: profile.seeded,
    center: profile.band.center,
    reach: profile.band.reach,
    target: targetComplexity(profile.band),
    window: [windowMin, windowMax],
    answered: profile.totals.answered,
    correct: profile.totals.correct,
    manualRequests: profile.totals.manualRequests,
    tracked: Object.keys(profile.concepts).length,
    byState,
    dueCount,
    focusRegisters: weakestRegisters(profile.registers, 2),
    registers: PARAPHRASE_REGISTERS.map((register) => {
      const stat = profile.registers[register] ?? { attempts: 0, correct: 0 };
      return {
        register,
        label: register,
        attempts: stat.attempts,
        correct: stat.correct,
        strength: registerStrength(stat),
      };
    }),
    trend: trendOf(profile.recent),
    review: dueConcepts(profile, 8).map(({ conceptId, record }) => ({
      conceptId,
      original: record.original,
      simplified: record.simplified,
      register: record.register,
    })),
    updatedAt: profile.updatedAt,
  };
}

/**
 * Direction of travel over the rolling window: the newer half's accuracy minus
 * the older half's. Zero until there are enough answers for the comparison to
 * mean anything, so the popup never reports a trend from two data points.
 */
function trendOf(recent: readonly RecentOutcome[]): number {
  if (recent.length < 6) return 0;
  const split = Math.floor(recent.length / 2);
  const older = recent.slice(0, split);
  const newer = recent.slice(split);
  const rate = (window: readonly RecentOutcome[]): number =>
    window.filter((entry) => entry.correct).length / window.length;
  return Number((rate(newer) - rate(older)).toFixed(3));
}
