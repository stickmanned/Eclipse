/**
 * Cache for generated paraphrase items.
 *
 * Mirrors `provider-cache.ts` — bounded, hashed keys, sentence stripped before
 * writing, re-validated on read so an entry written by a laxer build can never
 * bypass current validation — with two differences that matter:
 *
 * 1. Its own key and its own lock. Sharing the Translate Mode cache's lock
 *    would serialise the two modes' generation batches against each other for
 *    no reason; they never run at the same time today, and if they ever do,
 *    they should not queue behind one another.
 * 2. The cache scope includes the complexity bucket. An item generated for a
 *    learner aiming at 0.4 is not a valid answer for one aiming at 0.8 — same
 *    sentence, different exercise — so replaying it across bands would quietly
 *    defeat the whole adaptive mechanism.
 */

import { guarded, type StorageArea } from './area';
import { success, type Result } from '../domain/errors';
import { validateParaphraseItem, type ParaphraseItem } from '../domain/paraphrase';

export const PARAPHRASE_CACHE_KEY = 'eclipse:paraphrase-cache:v1';
export const PARAPHRASE_CACHE_LIMIT = 100;
export const PARAPHRASE_CACHE_BASE_SCOPE = 'mode=paraphrase|locale=fr-FR|prompt=v1|schema=v1';

/**
 * Bucket the target complexity to one decimal.
 *
 * Keying on the raw float would make every cache entry a miss, because the band
 * moves by a fraction after every answer. A tenth is coarse enough to hit and
 * fine enough that two buckets never describe the same exercise.
 */
export function paraphraseCacheScope(target: number): string {
  const bucket = Math.round(Math.min(1, Math.max(0, target)) * 10) / 10;
  return `${PARAPHRASE_CACHE_BASE_SCOPE}|band=${bucket.toFixed(1)}`;
}

interface CacheEntry {
  accessedAt: number;
  items: unknown[];
}

type CacheShape = Record<string, CacheEntry>;

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

export async function paraphraseCacheKey(sentence: string, scope: string): Promise<string> {
  const bytes = new TextEncoder().encode(`${scope}\0${sentence}`);
  const digest = await globalThis.crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function readCache(area: StorageArea): Promise<CacheShape> {
  const read = await guarded(() => area.get(PARAPHRASE_CACHE_KEY));
  if (!read.ok || typeof read.data !== 'object' || read.data === null) return {};
  return read.data as CacheShape;
}

/** Look up a whole batch under one lock, one read and one write. */
export async function getCachedParaphrasesBatch(
  area: StorageArea,
  sentences: readonly string[],
  now: Date,
  scope: string,
): Promise<Map<string, ParaphraseItem[]>> {
  if (sentences.length === 0) return new Map();

  const keys = await Promise.all(sentences.map((sentence) => paraphraseCacheKey(sentence, scope)));

  return withCacheLock(area, async () => {
    const cache = await readCache(area);
    const hits = new Map<string, ParaphraseItem[]>();
    let touched = false;

    for (const [index, sentence] of sentences.entries()) {
      const key = keys[index];
      if (key === undefined) continue;
      const entry = cache[key];
      if (!entry) continue;

      const items = revalidate(entry, sentence);
      if (items.length === 0) continue;

      hits.set(sentence, items);
      entry.accessedAt = now.getTime();
      touched = true;
    }

    if (touched) await guarded(() => area.set(PARAPHRASE_CACHE_KEY, cache));
    return hits;
  });
}

export async function setCachedParaphrasesBatch(
  area: StorageArea,
  entries: readonly { readonly sentence: string; readonly items: readonly ParaphraseItem[] }[],
  now: Date,
  scope: string,
): Promise<Result<void>> {
  const writable: { key: string; templates: Partial<ParaphraseItem>[] }[] = [];

  for (const entry of entries) {
    const templates = templatesFor(entry.sentence, entry.items);
    if (templates.length === 0) continue;
    writable.push({ key: await paraphraseCacheKey(entry.sentence, scope), templates });
  }
  if (writable.length === 0) return success(undefined);

  return withCacheLock(area, async () => {
    const cache = await readCache(area);
    for (const { key, templates } of writable) {
      cache[key] = { accessedAt: now.getTime(), items: templates };
    }
    return guarded(() => area.set(PARAPHRASE_CACHE_KEY, evict(cache)));
  });
}

/** Re-validate stored templates against the sentence they are replayed on. */
function revalidate(entry: CacheEntry, sentence: string): ParaphraseItem[] {
  const items: ParaphraseItem[] = [];
  for (const candidate of entry.items) {
    if (typeof candidate !== 'object' || candidate === null) continue;
    const validated = validateParaphraseItem({ ...candidate, sentence });
    if (validated.ok) items.push(validated.data);
  }
  return items;
}

/** Validated, sentence-free templates ready to store. */
function templatesFor(
  sentence: string,
  items: readonly ParaphraseItem[],
): Partial<ParaphraseItem>[] {
  const templates: Partial<ParaphraseItem>[] = [];
  for (const item of items) {
    const validated = validateParaphraseItem({ ...item, sentence });
    if (!validated.ok) continue;
    const template: Partial<ParaphraseItem> = { ...validated.data };
    // The full submitted sentence is stripped and rebound on read, so a
    // learner's reading does not accumulate in extension storage. The short
    // spans the exercise itself is made of — the original wording and the clue
    // quoted from the sentence — necessarily remain, exactly as Translate
    // Mode's cache retains its source and clue fields.
    delete template.sentence;
    templates.push(template);
  }
  return templates;
}

function evict(cache: CacheShape): CacheShape {
  const entries = Object.entries(cache);
  if (entries.length <= PARAPHRASE_CACHE_LIMIT) return cache;

  entries.sort((a, b) => {
    const byAccess = b[1].accessedAt - a[1].accessedAt;
    if (byAccess !== 0) return byAccess;
    return a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0;
  });
  return Object.fromEntries(entries.slice(0, PARAPHRASE_CACHE_LIMIT));
}

export async function clearParaphraseCache(area: StorageArea): Promise<Result<void>> {
  return withCacheLock(area, () => guarded(() => area.remove(PARAPHRASE_CACHE_KEY)));
}

/** Entry count, for tests and the popup's storage disclosure. */
export async function paraphraseCacheSize(area: StorageArea): Promise<number> {
  return withCacheLock(area, async () => Object.keys(await readCache(area)).length);
}
