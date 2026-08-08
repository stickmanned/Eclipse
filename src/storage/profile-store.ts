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
  learnerProfileSchema,
  PROFILE_SCHEMA_VERSION,
  type LearnerProfile,
} from '../domain/profile';
import { failure, success, type Result } from '../domain/errors';
import { guarded, type StorageArea } from './area';
import { INTERACTIONS_KEY, PROFILE_KEY } from './keys';

/** How many interaction ids to remember for duplicate suppression. */
export const INTERACTION_LOG_LIMIT = 200;

export interface LoadProfileResult {
  readonly profile: LearnerProfile;
  /** True when nothing was stored yet and a fresh profile was returned. */
  readonly created: boolean;
}

/**
 * Read the profile.
 *
 * Missing data yields a fresh profile. Corrupt or newer-than-supported data
 * yields `PROFILE_INCOMPATIBLE` and is left untouched on disk.
 */
export async function loadProfile(area: StorageArea): Promise<Result<LoadProfileResult>> {
  const read = await guarded(() => area.get(PROFILE_KEY));
  if (!read.ok) return read;

  const raw = read.data;
  if (raw === undefined || raw === null) {
    return success({ profile: createEmptyProfile(), created: true });
  }

  const version = (raw as { schemaVersion?: unknown }).schemaVersion;
  if (typeof version === 'number' && version > PROFILE_SCHEMA_VERSION) {
    return failure(
      'PROFILE_INCOMPATIBLE',
      `Saved learning data uses schema version ${version}; this build supports ${PROFILE_SCHEMA_VERSION}.`,
    );
  }

  const parsed = learnerProfileSchema.safeParse(raw);
  if (!parsed.success) {
    return failure(
      'PROFILE_INCOMPATIBLE',
      'Saved learning data did not match the expected shape and was left untouched.',
    );
  }

  return success({ profile: parsed.data as LearnerProfile, created: false });
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
