/**
 * Cache for AI-generated learning items.
 *
 * Bounded at 100 entries with oldest-access eviction, so a long session cannot
 * grow storage without limit. Keys are hashes of the sentence text — the
 * sentence itself is never stored, which keeps page content out of
 * `storage.local` when the provider is in use.
 */

import { guarded, type StorageArea } from './area';
import { PROVIDER_CACHE_KEY } from './keys';
import { validateTrap, type ContextTrap } from '../domain/trap';
import { PROVIDER_MODEL } from './provider-settings';
import type { Result } from '../domain/errors';
import { success } from '../domain/errors';

export const PROVIDER_CACHE_LIMIT = 100;
export const PROVIDER_CACHE_SCOPE = `source=en|target=fr-FR|provider=gemini|model=${PROVIDER_MODEL}|prompt=v3|schema=v3`;

interface CacheEntry {
  /** Millisecond timestamp of the most recent read or write. */
  accessedAt: number;
  traps: unknown[];
}

type CacheShape = Record<string, CacheEntry>;

/** Serialize read-modify-write operations per storage area. */
const cacheQueues = new WeakMap<StorageArea, Promise<void>>();

async function withCacheLock<T>(area: StorageArea, work: () => Promise<T>): Promise<T> {
  const previous = cacheQueues.get(area) ?? Promise.resolve();
  let release = (): void => undefined;
  const current = new Promise<void>((resolve) => {
    release = resolve;
  });
  const tail = previous.catch(() => undefined).then(() => current);
  cacheQueues.set(area, tail);

  await previous.catch(() => undefined);
  try {
    return await work();
  } finally {
    release();
    if (cacheQueues.get(area) === tail) cacheQueues.delete(area);
  }
}

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
  return withCacheLock(area, async () => {
    const cache = await readCache(area);
    const key = await cacheKeyFor(sentence, scope);
    const entry = cache[key];
    if (!entry) return null;

    const traps = revalidate(entry, sentence);
    if (traps.length === 0) return null;

    entry.accessedAt = now.getTime();
    await guarded(() => area.set(PROVIDER_CACHE_KEY, cache));
    return traps;
  });
}

/**
 * Look up a whole batch under a single lock.
 *
 * The per-sentence entry point below takes the shared cache lock, reads the
 * entire cache object and writes it back just to touch `accessedAt`. Calling it
 * in a loop turned one activation into hundreds of serialized read-modify-write
 * cycles on one storage key — and because the lock is shared, it also
 * serialized generation batches that were meant to run concurrently. This does
 * the same work with one lock, one read and one write.
 */
export async function getCachedTrapsBatch(
  area: StorageArea,
  sentences: readonly string[],
  now: Date,
  scope = PROVIDER_CACHE_SCOPE,
): Promise<Map<string, ContextTrap[]>> {
  if (sentences.length === 0) return new Map();

  const keys = await Promise.all(sentences.map((sentence) => cacheKeyFor(sentence, scope)));

  return withCacheLock(area, async () => {
    const cache = await readCache(area);
    const hits = new Map<string, ContextTrap[]>();
    let touched = false;

    for (const [index, sentence] of sentences.entries()) {
      const key = keys[index];
      if (key === undefined) continue;
      const entry = cache[key];
      if (!entry) continue;

      const traps = revalidate(entry, sentence);
      if (traps.length === 0) continue;

      hits.set(sentence, traps);
      entry.accessedAt = now.getTime();
      touched = true;
    }

    if (touched) await guarded(() => area.set(PROVIDER_CACHE_KEY, cache));
    return hits;
  });
}

/** Store a whole batch under a single lock, evicting once at the end. */
export async function setCachedTrapsBatch(
  area: StorageArea,
  entries: readonly { readonly sentence: string; readonly traps: readonly ContextTrap[] }[],
  now: Date,
  scope = PROVIDER_CACHE_SCOPE,
): Promise<Result<void>> {
  const writable: { key: string; templates: Partial<ContextTrap>[] }[] = [];

  for (const entry of entries) {
    const templates = templatesFor(entry.sentence, entry.traps);
    if (templates.length === 0) continue;
    writable.push({ key: await cacheKeyFor(entry.sentence, scope), templates });
  }
  if (writable.length === 0) return success(undefined);

  return withCacheLock(area, async () => {
    const cache = await readCache(area);
    for (const { key, templates } of writable) {
      cache[key] = { accessedAt: now.getTime(), traps: templates };
    }
    return guarded(() => area.set(PROVIDER_CACHE_KEY, evict(cache)));
  });
}

/** Re-validate stored templates against the sentence they are being replayed on. */
function revalidate(entry: CacheEntry, sentence: string): ContextTrap[] {
  const traps: ContextTrap[] = [];
  for (const candidate of entry.traps) {
    if (typeof candidate !== 'object' || candidate === null) continue;
    const validated = validateTrap({ ...candidate, sentence }, { untrusted: true });
    if (validated.ok) traps.push(validated.data);
  }
  return traps;
}

/** Validated, sentence-free templates ready to store. */
function templatesFor(sentence: string, traps: readonly ContextTrap[]): Partial<ContextTrap>[] {
  const templates: Partial<ContextTrap>[] = [];
  for (const trap of traps) {
    const validated = validateTrap({ ...trap, sentence }, { untrusted: true });
    if (!validated.ok) continue;
    const template: Partial<ContextTrap> = { ...validated.data };
    delete template.sentence;
    templates.push(template);
  }
  return templates;
}

/** Keep the most recently accessed entries, oldest-access evicted first. */
function evict(cache: CacheShape): CacheShape {
  const entries = Object.entries(cache);
  if (entries.length <= PROVIDER_CACHE_LIMIT) return cache;

  entries.sort((a, b) => {
    const byAccess = b[1].accessedAt - a[1].accessedAt;
    if (byAccess !== 0) return byAccess;
    return a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0;
  });
  return Object.fromEntries(entries.slice(0, PROVIDER_CACHE_LIMIT));
}

/** Store traps for a sentence, evicting the least recently accessed entries. */
export async function setCachedTraps(
  area: StorageArea,
  sentence: string,
  traps: readonly ContextTrap[],
  now: Date,
  scope = PROVIDER_CACHE_SCOPE,
): Promise<Result<void>> {
  return setCachedTrapsBatch(area, [{ sentence, traps }], now, scope);
}

export async function clearProviderCache(area: StorageArea): Promise<Result<void>> {
  return withCacheLock(area, () => guarded(() => area.remove(PROVIDER_CACHE_KEY)));
}

/** Entry count, for tests and the popup's storage disclosure. */
export async function providerCacheSize(area: StorageArea): Promise<Result<number>> {
  return withCacheLock(area, async () => {
    const cache = await readCache(area);
    return success(Object.keys(cache).length);
  });
}
