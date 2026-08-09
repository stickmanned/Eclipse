/**
 * Health state for the always-on generation API.
 *
 * `enabled` remains in the stored shape for backwards compatibility, but the
 * product no longer exposes or honours an off switch. The origin is a
 * build-time constant, not user input.
 */

import { z } from 'zod';
import { guarded, type StorageArea } from './area';
import { PROVIDER_SETTINGS_KEY } from './keys';
import type { Result } from '../domain/errors';
import { success } from '../domain/errors';

/** The only origin Eclipse will ever contact. */
export const PROVIDER_ORIGIN = 'http://localhost:8787';
export const PROVIDER_ENDPOINT = `${PROVIDER_ORIGIN}/api/context-traps`;
export const PROVIDER_HEALTH_ENDPOINT = `${PROVIDER_ORIGIN}/health`;
export const PROVIDER_PERMISSION_PATTERN = 'http://localhost:8787/*';
export const PROVIDER_MODEL = 'gemini-3.5-flash-lite';

/** Client-side ceiling for one generation attempt. Gemini commonly needs 5–12 seconds. */
export const PROVIDER_TIMEOUT_MS = 20_000;

/** Health checks should still fail quickly when the local server is not running. */
export const PROVIDER_HEALTH_TIMEOUT_MS = 3_000;

/** One initial generation attempt plus one automatic recovery attempt. */
export const PROVIDER_MAX_ATTEMPTS = 2;

/** Maximum sentences sent in one request. */
export const PROVIDER_MAX_SENTENCES = 8;

/** Maximum characters per sentence sent. */
export const PROVIDER_MAX_SENTENCE_LENGTH = 300;

export const providerSettingsSchema = z.object({
  enabled: z.boolean(),
  lastError: z.string().nullable(),
});

export type ProviderSettings = z.infer<typeof providerSettingsSchema>;

export const DEFAULT_PROVIDER_SETTINGS: ProviderSettings = {
  enabled: true,
  lastError: null,
};

export async function readProviderSettings(area: StorageArea): Promise<ProviderSettings> {
  const read = await guarded(() => area.get(PROVIDER_SETTINGS_KEY));
  if (!read.ok) return DEFAULT_PROVIDER_SETTINGS;
  const parsed = providerSettingsSchema.safeParse(read.data);
  return parsed.success ? parsed.data : DEFAULT_PROVIDER_SETTINGS;
}

export async function writeProviderSettings(
  area: StorageArea,
  settings: ProviderSettings,
): Promise<Result<ProviderSettings>> {
  const written = await guarded(() => area.set(PROVIDER_SETTINGS_KEY, settings));
  if (!written.ok) return written;
  return success(settings);
}

export async function clearProviderSettings(area: StorageArea): Promise<Result<void>> {
  return guarded(() => area.remove(PROVIDER_SETTINGS_KEY));
}
