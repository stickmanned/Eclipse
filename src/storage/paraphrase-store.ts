/**
 * Paraphrase Mode profile persistence.
 *
 * Same two rules as `profile-store.ts`, for the same reasons:
 *
 * 1. A profile that fails validation is never silently replaced. Eclipse
 *    reports `PROFILE_INCOMPATIBLE` and leaves the bytes alone, so a schema bug
 *    in a later version cannot quietly delete a learner's vocabulary range.
 * 2. Answers are idempotent by `interactionId`.
 *
 * The one deliberate divergence: the interaction log lives *on* the paraphrase
 * profile rather than in its own key. Translate Mode splits them because its
 * rolling outcome window is only five deep, so a duplicate can arrive after the
 * evidence of the original has already been pruned. Paraphrase Mode keeps a
 * 200-entry log against a 400-record concept map in one document, so a second
 * key would buy nothing and add a second failure mode to every write.
 */

import type { z } from 'zod';
import { failure, success, type Result } from '../domain/errors';
import { guarded, type StorageArea } from './area';
import {
  createEmptyParaphraseProfile,
  paraphraseProfileSchema,
  seedProfile,
  type ParaphraseProfile,
} from '../domain/paraphrase-profile';
import { emptyRegisterStats } from '../domain/complexity';
import { PARAPHRASE_REGISTERS } from '../domain/paraphrase';
import type { DelfLevel } from '../domain/delf';

export const PARAPHRASE_PROFILE_KEY = 'eclipse:paraphrase-profile:v1';

export interface LoadParaphraseProfileResult {
  readonly profile: ParaphraseProfile;
  /** True when nothing was stored yet and a fresh profile was returned. */
  readonly created: boolean;
}

/**
 * Read the profile.
 *
 * Missing is normal and yields an empty profile. Present-but-invalid is not:
 * it is reported, not overwritten. The caller decides whether to tell the
 * learner to reset, exactly as Translate Mode does.
 */
export async function loadParaphraseProfile(
  area: StorageArea,
  now = new Date(),
): Promise<Result<LoadParaphraseProfileResult>> {
  const read = await guarded(() => area.get(PARAPHRASE_PROFILE_KEY));
  if (!read.ok) return read;

  if (read.data === undefined || read.data === null) {
    return success({ profile: createEmptyParaphraseProfile(now), created: true });
  }

  const parsed = paraphraseProfileSchema.safeParse(read.data);
  if (!parsed.success) {
    return failure(
      'PROFILE_INCOMPATIBLE',
      'Saved Paraphrase Mode data could not be read. Reset Paraphrase Mode in Settings to start fresh.',
    );
  }

  // The stored register map is keyed loosely so a future seventh category
  // cannot make every existing profile unreadable. Normalising it here — fill
  // what is missing, drop what is unrecognised — means the ranking maths
  // downstream never has to defend against a partial record.
  const registers = emptyRegisterStats();
  for (const register of PARAPHRASE_REGISTERS) {
    const stored = parsed.data.registers[register];
    if (stored) registers[register] = stored;
  }

  return success({
    profile: { ...(parsed.data as ParaphraseProfile), registers },
    created: false,
  });
}

export async function saveParaphraseProfile(
  area: StorageArea,
  profile: ParaphraseProfile,
): Promise<Result<ParaphraseProfile>> {
  const validated = paraphraseProfileSchema.safeParse(profile);
  if (!validated.success) {
    // Refuse to write something we could not read back. A profile that fails
    // its own schema on the way out becomes PROFILE_INCOMPATIBLE forever on the
    // way in, and the learner has no way to tell that from data loss.
    const detail = validated.error.issues
      .map((issue) => `${issue.path.join('.') || '(root)'}: ${issue.message}`)
      .join('; ');
    return failure('STORAGE_ERROR', `Refusing to write an invalid paraphrase profile: ${detail}`);
  }

  const written = await guarded(() => area.set(PARAPHRASE_PROFILE_KEY, profile));
  if (!written.ok) return written;
  return success(profile);
}

/**
 * Load, seeding the band from the DELF lens on first use.
 *
 * The seed is written back immediately so the popup and the page agree about
 * where the learner starts even before their first answer.
 */
export async function loadSeededParaphraseProfile(
  area: StorageArea,
  delfLevel: DelfLevel,
  now = new Date(),
): Promise<Result<ParaphraseProfile>> {
  const loaded = await loadParaphraseProfile(area, now);
  if (!loaded.ok) return loaded;

  const seeded = seedProfile(loaded.data.profile, delfLevel, now);
  if (seeded === loaded.data.profile && !loaded.data.created) return success(seeded);

  const saved = await saveParaphraseProfile(area, seeded);
  if (!saved.ok) return saved;
  return success(seeded);
}

export async function resetParaphraseProfile(
  area: StorageArea,
  now = new Date(),
): Promise<Result<ParaphraseProfile>> {
  const fresh = createEmptyParaphraseProfile(now);
  const written = await guarded(() => area.set(PARAPHRASE_PROFILE_KEY, fresh));
  if (!written.ok) return written;
  return success(fresh);
}

/** Exported for tests: the exact stored shape. */
export type StoredParaphraseProfile = z.infer<typeof paraphraseProfileSchema>;
