/**
 * Cache for optional provider results.
 *
 * Bounded at 100 entries with oldest-access eviction, so a long session cannot
 * grow storage without limit. Keys are hashes of the sentence text — the
 * sentence itself is never stored, which keeps page content out of
 * `storage.local` even when the optional provider is in use.
 */

import { guarded, type StorageArea } from './area';
import { PROVIDER_CACHE_KEY } from './keys';
import { validateTrap, type ContextTrap } from '../domain/trap';
import { PROVIDER_MODEL } from './provider-settings';
import type { Result } from '../domain/errors';
import { success } from '../domain/errors';

export const PROVIDER_CACHE_LIMIT = 100;
export const PROVIDER_CACHE_SCOPE = `source=en|target=fr-FR|provider=gemini|model=${PROVIDER_MODEL}|prompt=v1|schema=v1`;

interface CacheEntry {
  /** Millisecond timestamp of the most recent read or write. */
  accessedAt: number;
  traps: unknown[];
}

type CacheShape = Record<string, CacheEntry>;

export async function cacheKeyFor(sentence: string, scope = PROVIDER_CACHE_SCOPE): Promise<string> {
  const bytes = new TextEncoder().encode(`${scope}\0${sentence}`);
  const digest = await globalThis.crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function readCache(area: StorageArea): Promise<CacheShape> {
  const read = await guarded(() => area.get(PROVIDER_CACHE_KEY));
  if (!read.ok || typeof read.data !== 'object' || read.data === null) return {};
  return read.data as CacheShape;
}

/**
 * Look up cached traps for a sentence. Entries are re-validated on read, so a
 * cache written by an older, laxer build can never bypass current validation.
 */
export async function getCachedTraps(
  area: StorageArea,
  sentence: string,
  now: Date,
  scope = PROVIDER_CACHE_SCOPE,
): Promise<ContextTrap[] | null> {
  const cache = await readCache(area);
  const key = await cacheKeyFor(sentence, scope);
  const entry = cache[key];
  if (!entry) return null;

  const traps: ContextTrap[] = [];
  for (const candidate of entry.traps) {
    if (typeof candidate !== 'object' || candidate === null) continue;
    const validated = validateTrap({ ...candidate, sentence }, { untrusted: true });
    if (validated.ok) traps.push(validated.data);
  }
  if (traps.length === 0) return null;

  entry.accessedAt = now.getTime();
  await guarded(() => area.set(PROVIDER_CACHE_KEY, cache));
  return traps;
}

/** Store traps for a sentence, evicting the least recently accessed entries. */
export async function setCachedTraps(
  area: StorageArea,
  sentence: string,
  traps: readonly ContextTrap[],
  now: Date,
  scope = PROVIDER_CACHE_SCOPE,
): Promise<Result<void>> {
  const templates: Partial<ContextTrap>[] = [];
  for (const trap of traps) {
    const validated = validateTrap({ ...trap, sentence }, { untrusted: true });
    if (!validated.ok) continue;
    const template: Partial<ContextTrap> = { ...validated.data };
    delete template.sentence;
    templates.push(template);
  }
  if (templates.length === 0) return success(undefined);

  const cache = await readCache(area);
  const key = await cacheKeyFor(sentence, scope);
  cache[key] = {
    accessedAt: now.getTime(),
    traps: templates,
  };

  const entries = Object.entries(cache);
  if (entries.length > PROVIDER_CACHE_LIMIT) {
    entries.sort((a, b) => {
      const byAccess = b[1].accessedAt - a[1].accessedAt;
      if (byAccess !== 0) return byAccess;
      return a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0;
    });
    const kept = Object.fromEntries(entries.slice(0, PROVIDER_CACHE_LIMIT));
    return guarded(() => area.set(PROVIDER_CACHE_KEY, kept));
  }

  return guarded(() => area.set(PROVIDER_CACHE_KEY, cache));
}

export async function clearProviderCache(area: StorageArea): Promise<Result<void>> {
  return guarded(() => area.remove(PROVIDER_CACHE_KEY));
}

/** Entry count, for tests and the popup's storage disclosure. */
export async function providerCacheSize(area: StorageArea): Promise<Result<number>> {
  const cache = await readCache(area);
  return success(Object.keys(cache).length);
}
