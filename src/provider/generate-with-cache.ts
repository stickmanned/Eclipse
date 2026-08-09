/** Cache-aware orchestration for level-matched AI learning items. */

import { success, type Result } from '../domain/errors';
import type { GeneratedTrapCandidate } from '../domain/trap';
import type { StorageArea } from '../storage/area';
import {
  getCachedTrapsBatch,
  PROVIDER_CACHE_SCOPE,
  setCachedTrapsBatch,
} from '../storage/provider-cache';
import { fetchGeneratedTraps, type ProviderSentence } from './client';
import type { DelfLevel } from '../domain/delf';

export type GeneratedTrapFetcher = (
  sentences: readonly ProviderSentence[],
  delfLevel: DelfLevel,
) => Promise<Result<GeneratedTrapCandidate[]>>;

export async function generateWithCache(
  sentences: readonly ProviderSentence[],
  delfLevel: DelfLevel,
  area: StorageArea,
  fetcher: GeneratedTrapFetcher = fetchGeneratedTraps,
  now: () => Date = () => new Date(),
): Promise<Result<GeneratedTrapCandidate[]>> {
  const cacheScope = `${PROVIDER_CACHE_SCOPE}|delf=${delfLevel}`;
  const bySentenceId = new Map<string, GeneratedTrapCandidate[]>();
  const misses: ProviderSentence[] = [];

  // One lookup for the batch. Looking each sentence up separately took the
  // shared cache lock once per sentence, which serialized batches that were
  // supposed to be running concurrently.
  const hits = await getCachedTrapsBatch(
    area,
    sentences.map((sentence) => sentence.text),
    now(),
    cacheScope,
  );

  for (const sentence of sentences) {
    const cached = hits.get(sentence.text);
    if (!cached) {
      misses.push(sentence);
      continue;
    }
    bySentenceId.set(
      sentence.id,
      cached.map((trap) => ({ sentenceId: sentence.id, trap })),
    );
  }

  if (misses.length === 0) return success(inCallerOrder(sentences, bySentenceId));

  const fetched = await fetcher(misses, delfLevel);
  if (!fetched.ok) {
    const hits = inCallerOrder(sentences, bySentenceId);
    return hits.length > 0 ? success(hits) : fetched;
  }

  const missedIds = new Set(misses.map((sentence) => sentence.id));
  for (const candidate of fetched.data) {
    if (!missedIds.has(candidate.sentenceId)) continue;
    const current = bySentenceId.get(candidate.sentenceId) ?? [];
    current.push(candidate);
    bySentenceId.set(candidate.sentenceId, current);
  }

  const toStore: { sentence: string; traps: GeneratedTrapCandidate['trap'][] }[] = [];
  for (const sentence of misses) {
    const generated = bySentenceId.get(sentence.id) ?? [];
    if (generated.length === 0) continue;
    toStore.push({
      sentence: sentence.text,
      traps: generated.map((candidate) => candidate.trap),
    });
  }
  await setCachedTrapsBatch(area, toStore, now(), cacheScope);

  return success(inCallerOrder(sentences, bySentenceId));
}

function inCallerOrder(
  sentences: readonly ProviderSentence[],
  bySentenceId: ReadonlyMap<string, readonly GeneratedTrapCandidate[]>,
): GeneratedTrapCandidate[] {
  return sentences.flatMap((sentence) => [...(bySentenceId.get(sentence.id) ?? [])]);
}
