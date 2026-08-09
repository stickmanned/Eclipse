/**
 * Whether the optional generation API is switched on.
 *
 * Off by default and off after a reset. The origin is a build-time constant,
 * not user input, so there is no way for a page to point Eclipse at a server of
 * its choosing.
 */

import { z } from 'zod';
import { guarded, type StorageArea } from './area';
import { PROVIDER_SETTINGS_KEY } from './keys';
import type { Result } from '../domain/errors';
import { success } from '../domain/errors';

/** The only origin Eclipse will ever contact, and only when explicitly enabled. */
export const PROVIDER_ORIGIN = 'http://localhost:8787';
export const PROVIDER_ENDPOINT = `${PROVIDER_ORIGIN}/api/context-traps`;
export const PROVIDER_HEALTH_ENDPOINT = `${PROVIDER_ORIGIN}/health`;
export const PROVIDER_PERMISSION_PATTERN = 'http://localhost:8787/*';
export const PROVIDER_MODEL = 'gemini-3.5-flash-lite';

/**
 * Client-side ceiling on how long activation will wait for generated traps.
 * Must exceed the server's own budget (DEFAULT_SERVER_TIMEOUT_MS in
 * server/app.ts) so the client is never the one that gives up first — a race
 * that used to abort in-flight requests the server would otherwise have
 * finished, which is wasted work, not saved time.
 */
export const PROVIDER_TIMEOUT_MS = 9000;

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
  enabled: false,
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
