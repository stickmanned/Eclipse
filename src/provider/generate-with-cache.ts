/** Cache-aware orchestration for the optional provider request. */

import { success, type Result } from '../domain/errors';
import type { GeneratedTrapCandidate } from '../domain/trap';
import type { StorageArea } from '../storage/area';
import { getCachedTraps, setCachedTraps } from '../storage/provider-cache';
import { fetchGeneratedTraps, type ProviderSentence } from './client';

export type GeneratedTrapFetcher = (
  sentences: readonly ProviderSentence[],
) => Promise<Result<GeneratedTrapCandidate[]>>;

export async function generateWithCache(
  sentences: readonly ProviderSentence[],
  area: StorageArea,
  fetcher: GeneratedTrapFetcher = fetchGeneratedTraps,
  now: () => Date = () => new Date(),
): Promise<Result<GeneratedTrapCandidate[]>> {
  const bySentenceId = new Map<string, GeneratedTrapCandidate[]>();
  const misses: ProviderSentence[] = [];

  for (const sentence of sentences) {
    const cached = await getCachedTraps(area, sentence.text, now());
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

  const fetched = await fetcher(misses);
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

  for (const sentence of misses) {
    const generated = bySentenceId.get(sentence.id) ?? [];
    if (generated.length === 0) continue;
    await setCachedTraps(
      area,
      sentence.text,
      generated.map((candidate) => candidate.trap),
      now(),
    );
  }

  return success(inCallerOrder(sentences, bySentenceId));
}

function inCallerOrder(
  sentences: readonly ProviderSentence[],
  bySentenceId: ReadonlyMap<string, readonly GeneratedTrapCandidate[]>,
): GeneratedTrapCandidate[] {
  return sentences.flatMap((sentence) => [...(bySentenceId.get(sentence.id) ?? [])]);
}
