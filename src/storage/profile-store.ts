/**
 * Learner profile persistence.
 *
 * Two rules govern this file:
 *
 * 1. A profile that fails validation is never silently replaced. Eclipse
 *    reports `PROFILE_INCOMPATIBLE` and leaves the bytes alone, so a schema bug
 *    in a future version cannot quietly delete somebody's progress.
 * 2. Answer outcomes are idempotent by `interactionId`. The ids live in their
 *    own bounded key rather than on the profile, because the profile's rolling
 *    outcome window is only five deep and a duplicate can arrive later than
 *    that.
 */

import {
  createEmptyProfile,
  dueStateSchema,
  learnerProfileSchema,
  MOON_PHASES,
  PROFILE_SCHEMA_VERSION,
  type LearnerProfile,
} from '../domain/profile';
import { recordAnswer, type RecordAnswerInput, type RecordAnswerResult } from '../domain/mastery';
import { failure, success, type Result } from '../domain/errors';
import { guarded, type StorageArea } from './area';
import { INTERACTIONS_KEY, PROFILE_KEY } from './keys';
import { MAX_REVIEW_INTERVAL_DAYS, MS_PER_DAY, migratedFsrsCard } from '../domain/scheduling';
import { backfillActivity, backfillStreak } from '../domain/stats';
import { DELF_LEVELS } from '../domain/delf';
import { CONCEPT_ID_PATTERN } from '../domain/trap';
import { z } from 'zod';

/** How many interaction ids to remember for duplicate suppression. */
export const INTERACTION_LOG_LIMIT = 200;

export interface LoadProfileResult {
  readonly profile: LearnerProfile;
  /** True when nothing was stored yet and a fresh profile was returned. */
  readonly created: boolean;
  /** True when a compatible older profile was upgraded in memory. */
  readonly migrated: boolean;
}

const legacyIsoDate = z.string().refine((value) => !Number.isNaN(Date.parse(value)));
const legacyDisplaySchema = z
  .object({
    targetSurface: z.string().trim().min(1).max(120),
    englishMeaning: z.string().trim().min(1).max(240),
    kind: z.enum(['word', 'phrase']),
  })
  .optional();
const learnerProfileSchemaV1 = z.object({
  schemaVersion: z.literal(1),
  sourceLocale: z.literal('en'),
  targetLocale: z.literal('fr-FR'),
  calibrationCompleted: z.boolean(),
  delfLevel: z.enum(DELF_LEVELS).default('B1'),
  globalAbility: z.number().min(-1).max(1),
  mastery: z.record(
    z.string().regex(CONCEPT_ID_PATTERN),
    z.object({
      score: z.number().min(-2).max(2),
      phase: z.enum(MOON_PHASES),
      attempts: z.number().int().min(0),
      correct: z.number().int().min(0),
      due: dueStateSchema,
      updatedAt: legacyIsoDate,
      display: legacyDisplaySchema,
    }),
  ),
  recentOutcomes: z.array(
    z.object({
      interactionId: z.string().min(1).max(120),
      conceptId: z.string().regex(CONCEPT_ID_PATTERN),
      correct: z.boolean(),
      at: legacyIsoDate,
    }),
  ),
});

const learnerProfileSchemaV2 = learnerProfileSchema
  .omit({ schemaVersion: true, activity: true, streak: true })
  .extend({ schemaVersion: z.literal(2) });
type LearnerProfileV2 = z.infer<typeof learnerProfileSchemaV2>;
const learnerProfileSchemaV3 = learnerProfileSchema
  .omit({ schemaVersion: true, streak: true })
  .extend({ schemaVersion: z.literal(3) });
type LearnerProfileV3 = z.infer<typeof learnerProfileSchemaV3>;

function migrateProfileV1(raw: z.infer<typeof learnerProfileSchemaV1>): LearnerProfileV2 {
  const mastery = Object.fromEntries(
    Object.entries(raw.mastery).map(([conceptId, legacy]) => {
      let intervalDays = 0;
      let due = legacy.due;

      if (legacy.due.kind === 'timestamp') {
        const scheduledAt = Date.parse(legacy.updatedAt);
        const dueAt = Date.parse(legacy.due.at);
        intervalDays = Math.min(
          MAX_REVIEW_INTERVAL_DAYS,
          Math.max(0, Math.round((dueAt - scheduledAt) / MS_PER_DAY)),
        );
      } else if (legacy.due.kind === 'none' && legacy.attempts > 0 && legacy.correct > 0) {
        // v1 accidentally stopped scheduling a first correct answer. Put it on
        // the first rung, anchored to its original answer rather than load time.
        intervalDays = 1;
        due = {
          kind: 'timestamp' as const,
          at: new Date(Date.parse(legacy.updatedAt) + MS_PER_DAY).toISOString(),
        };
      }

      const lapses = Math.max(0, legacy.attempts - legacy.correct);
      const updatedAt = new Date(legacy.updatedAt);

      return [
        conceptId,
        {
          score: legacy.score,
          phase: legacy.phase === 'new_moon' ? 'crescent' : legacy.phase,
          attempts: legacy.attempts,
          correct: legacy.correct,
          intervalDays,
          unassistedCorrect: legacy.phase === 'full' ? 3 : legacy.phase === 'half' ? 1 : 0,
          lapses,
          fsrsCard: migratedFsrsCard(updatedAt, due, intervalDays, legacy.attempts, lapses),
          firstAnsweredAt: legacy.updatedAt,
          successfulReviewDays: [],
          contextFingerprints: [],
          reviewEvents: [],
          legacyPhase: undefined,
          due,
          updatedAt: legacy.updatedAt,
          display: legacy.display,
        },
      ];
    }),
  );

  return {
    schemaVersion: 2,
    sourceLocale: 'en',
    targetLocale: 'fr-FR',
    calibrationCompleted: raw.calibrationCompleted,
    delfLevel: raw.delfLevel,
    globalAbility: raw.globalAbility,
    mastery,
    recentOutcomes: raw.recentOutcomes.slice(-5).map((outcome) => ({
      ...outcome,
      conceptId: outcome.conceptId as `fr:${string}`,
    })),
  };
}

function migrateProfileV2(raw: LearnerProfileV2, now: Date): LearnerProfileV3 {
  return {
    ...raw,
    schemaVersion: 3,
    activity: backfillActivity(
      Object.values(raw.mastery).flatMap((record) => record.reviewEvents),
      now,
    ),
  } as LearnerProfileV3;
}

function migrateProfileV3(raw: LearnerProfileV3): LearnerProfile {
  return {
    ...raw,
    schemaVersion: PROFILE_SCHEMA_VERSION,
    streak: backfillStreak(raw.activity.days),
  } as LearnerProfile;
}

/** Seed v2 profiles produced by the older legacy-label migration. */
function seedLegacyPracticeCounts(profile: LearnerProfile): LearnerProfile | null {
  let migrated = false;
  const mastery = Object.fromEntries(
    Object.entries(profile.mastery).map(([conceptId, record]) => {
      if (!record.legacyPhase) return [conceptId, record];
      migrated = true;
      const minimum = record.phase === 'full' ? 3 : record.phase === 'half' ? 1 : 0;
      return [
        conceptId,
        {
          ...record,
          unassistedCorrect: Math.max(record.unassistedCorrect, minimum),
          legacyPhase: undefined,
        },
      ];
    }),
  );
  return migrated ? { ...profile, mastery } : null;
}

/**
 * Read the profile.
 *
 * Missing data yields a fresh profile. Corrupt or newer-than-supported data
 * yields `PROFILE_INCOMPATIBLE` and is left untouched on disk.
 */
export async function loadProfile(
  area: StorageArea,
  now = new Date(),
): Promise<Result<LoadProfileResult>> {
  const read = await guarded(() => area.get(PROFILE_KEY));
  if (!read.ok) return read;

  const raw = read.data;
  if (raw === undefined || raw === null) {
    return success({ profile: createEmptyProfile(now), created: true, migrated: false });
  }

  const version = (raw as { schemaVersion?: unknown }).schemaVersion;
  if (typeof version === 'number' && version > PROFILE_SCHEMA_VERSION) {
    return failure(
      'PROFILE_INCOMPATIBLE',
      `Saved learning data uses schema version ${version}; this build supports ${PROFILE_SCHEMA_VERSION}.`,
    );
  }

  if (version === 1) {
    const legacy = learnerProfileSchemaV1.safeParse(raw);
    if (!legacy.success) {
      return failure(
        'PROFILE_INCOMPATIBLE',
        'Saved learning data did not match the expected shape and was left untouched.',
      );
    }
    const profile = migrateProfileV3(migrateProfileV2(migrateProfileV1(legacy.data), now));
    const written = await guarded(() => area.set(PROFILE_KEY, profile));
    if (!written.ok) return written;
    return success({ profile, created: false, migrated: true });
  }

  if (version === 2) {
    const legacy = learnerProfileSchemaV2.safeParse(raw);
    if (!legacy.success) {
      return failure(
        'PROFILE_INCOMPATIBLE',
        'Saved learning data did not match the expected shape and was left untouched.',
      );
    }
    const profile = migrateProfileV3(migrateProfileV2(legacy.data, now));
    const written = await guarded(() => area.set(PROFILE_KEY, profile));
    if (!written.ok) return written;
    return success({ profile, created: false, migrated: true });
  }

  if (version === 3) {
    const legacy = learnerProfileSchemaV3.safeParse(raw);
    if (!legacy.success) {
      return failure(
        'PROFILE_INCOMPATIBLE',
        'Saved learning data did not match the expected shape and was left untouched.',
      );
    }
    const profile = migrateProfileV3(legacy.data);
    const written = await guarded(() => area.set(PROFILE_KEY, profile));
    if (!written.ok) return written;
    return success({ profile, created: false, migrated: true });
  }

  const parsed = learnerProfileSchema.safeParse(raw);
  if (!parsed.success) {
    return failure(
      'PROFILE_INCOMPATIBLE',
      'Saved learning data did not match the expected shape and was left untouched.',
    );
  }

  const profile = parsed.data as LearnerProfile;
  const migrated = seedLegacyPracticeCounts(profile);
  if (migrated) {
    const written = await guarded(() => area.set(PROFILE_KEY, migrated));
    if (!written.ok) return written;
    return success({ profile: migrated, created: false, migrated: true });
  }

  return success({ profile, created: false, migrated: false });
}

/** Write the profile, validating it on the way out. */
export async function saveProfile(
  area: StorageArea,
  profile: LearnerProfile,
): Promise<Result<LearnerProfile>> {
  const parsed = learnerProfileSchema.safeParse(profile);
  if (!parsed.success) {
    return failure('STORAGE_ERROR', 'Refusing to persist an invalid learner profile.');
  }

  const written = await guarded(() => area.set(PROFILE_KEY, parsed.data));
  if (!written.ok) return written;
  return success(profile);
}

/**
 * The durable answer-write seam shared by contextual and popup practice.
 * Callers provide one answer; profile loading, duplicate suppression, mastery
 * folding, validation, and interaction logging stay local to this module.
 */
export async function persistAnswer(
  area: StorageArea,
  input: Omit<RecordAnswerInput, 'profile'>,
): Promise<Result<RecordAnswerResult>> {
  const loaded = await loadProfile(area);
  if (!loaded.ok) return loaded;

  const profile = loaded.data.profile;
  const existing = profile.mastery[input.conceptId];
  if (await hasInteraction(area, input.interactionId)) {
    if (!existing) {
      return failure('STORAGE_ERROR', 'The recorded answer no longer has a mastery record.');
    }
    return success({
      profile,
      mastery: existing,
      previousPhase: existing.phase,
      phase: existing.phase,
      predictedCorrect: 0,
      applied: false,
    });
  }

  const updated = recordAnswer({ ...input, profile });
  const saved = await saveProfile(area, updated.profile);
  if (!saved.ok) return saved;

  const remembered = await rememberInteraction(area, input.interactionId);
  if (!remembered.ok) return remembered;
  return success(updated);
}

/** Remove the profile and every interaction id. The next read creates a fresh profile. */
export async function resetProfile(area: StorageArea): Promise<Result<LearnerProfile>> {
  const profile = createEmptyProfile();
  const written = await guarded(async () => {
    await area.remove(PROFILE_KEY);
    await area.remove(INTERACTIONS_KEY);
  });
  if (!written.ok) return written;
  return success(profile);
}

// ---------------------------------------------------------------------------
// Interaction log
// ---------------------------------------------------------------------------

async function readInteractionLog(area: StorageArea): Promise<string[]> {
  const read = await guarded(() => area.get(INTERACTIONS_KEY));
  if (!read.ok || !Array.isArray(read.data)) return [];
  return read.data.filter((value): value is string => typeof value === 'string');
}

/** True when this interaction has already been folded into the profile. */
export async function hasInteraction(area: StorageArea, interactionId: string): Promise<boolean> {
  const log = await readInteractionLog(area);
  return log.includes(interactionId);
}

/** Record an interaction id, trimming the log to its bound. */
export async function rememberInteraction(
  area: StorageArea,
  interactionId: string,
): Promise<Result<void>> {
  const log = await readInteractionLog(area);
  if (log.includes(interactionId)) return success(undefined);
  const next = [...log, interactionId].slice(-INTERACTION_LOG_LIMIT);
  return guarded(() => area.set(INTERACTIONS_KEY, next));
}
