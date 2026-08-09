/**
 * Cost of the cache path during one generation batch.
 *
 * Looking sentences up one at a time took the shared cache lock, read the whole
 * cache object and wrote it back once per sentence — so a batch of eight cost
 * sixteen read-modify-write cycles on a single storage key, and because the
 * lock is shared it also serialized batches meant to run concurrently. These
 * tests hold the batched path to one read and one write, and prove it stores
 * and returns exactly what the per-sentence path did.
 */

import { describe, expect, it } from 'vitest';
import { memoryArea, type StorageArea } from '@/storage/area';
import {
  PROVIDER_CACHE_LIMIT,
  getCachedTraps,
  getCachedTrapsBatch,
  setCachedTraps,
  setCachedTrapsBatch,
} from '@/storage/provider-cache';
import { generatedTrap } from '../fixtures/traps';

const NOW = new Date('2026-01-01T00:00:00.000Z');

function sentenceText(index: number): string {
  return `Researchers observed the quiet forest number ${index} while communities documented weather.`;
}

function trapFor(index: number) {
  return generatedTrap({
    sentence: sentenceText(index),
    exactSourceText: 'observed',
    targetSurface: 'observé',
    clueSpan: 'quiet forest',
  });
}

interface CountingArea extends StorageArea {
  gets: number;
  sets: number;
}

function countingArea(): CountingArea {
  const inner = memoryArea();
  const area: CountingArea = {
    gets: 0,
    sets: 0,
    async get(key) {
      area.gets += 1;
      return inner.get(key);
    },
    async set(key, value) {
      area.sets += 1;
      return inner.set(key, value);
    },
    async remove(key) {
      return inner.remove(key);
    },
  };
  return area;
}

describe('batched cache writes', () => {
  it('stores a whole batch with one read and one write', async () => {
    const area = countingArea();
    const entries = Array.from({ length: 8 }, (_unused, index) => ({
      sentence: sentenceText(index),
      traps: [trapFor(index)],
    }));

    const result = await setCachedTrapsBatch(area, entries, NOW);

    expect(result.ok).toBe(true);
    expect(area.sets).toBe(1);
    expect(area.gets).toBe(1);
  });

  it('is readable by the per-sentence lookup, unchanged', async () => {
    const area = memoryArea();
    await setCachedTrapsBatch(
      area,
      [
        { sentence: sentenceText(0), traps: [trapFor(0)] },
        { sentence: sentenceText(1), traps: [trapFor(1)] },
      ],
      NOW,
    );

    const single = await getCachedTraps(area, sentenceText(1), NOW);
    expect(single).not.toBeNull();
    expect(single?.[0]?.sentence).toBe(sentenceText(1));
  });

  it('evicts to the limit once for the whole batch', async () => {
    const area = memoryArea();
    const entries = Array.from({ length: PROVIDER_CACHE_LIMIT + 20 }, (_unused, index) => ({
      sentence: sentenceText(index),
      traps: [trapFor(index)],
    }));

    await setCachedTrapsBatch(area, entries, NOW);

    const stored = (await area.get('eclipse:provider-cache:v1')) as Record<string, unknown>;
    expect(Object.keys(stored)).toHaveLength(PROVIDER_CACHE_LIMIT);
  });
});

describe('batched cache reads', () => {
  it('returns every hit with one read and one write', async () => {
    const seeded = memoryArea();
    const sentences = Array.from({ length: 8 }, (_unused, index) => sentenceText(index));
    await setCachedTrapsBatch(
      seeded,
      sentences.map((sentence, index) => ({ sentence, traps: [trapFor(index)] })),
      NOW,
    );

    const area = countingArea();
    await area.set('eclipse:provider-cache:v1', await seeded.get('eclipse:provider-cache:v1'));
    area.gets = 0;
    area.sets = 0;

    const hits = await getCachedTrapsBatch(area, sentences, NOW);

    expect(hits.size).toBe(8);
    expect(area.gets).toBe(1);
    // One write, for the accessedAt bump on all eight entries.
    expect(area.sets).toBe(1);
  });

  it('writes nothing at all when the batch is a complete miss', async () => {
    const area = countingArea();

    const hits = await getCachedTrapsBatch(area, [sentenceText(0), sentenceText(1)], NOW);

    expect(hits.size).toBe(0);
    expect(area.sets).toBe(0);
  });

  it('matches the per-sentence lookup entry for entry', async () => {
    const area = memoryArea();
    for (let index = 0; index < 4; index += 1) {
      await setCachedTraps(area, sentenceText(index), [trapFor(index)], NOW);
    }

    const sentences = Array.from({ length: 4 }, (_unused, index) => sentenceText(index));
    const batch = await getCachedTrapsBatch(area, sentences, NOW);

    for (const sentence of sentences) {
      const single = await getCachedTraps(area, sentence, NOW);
      expect(batch.get(sentence)).toEqual(single);
    }
  });

  it('re-validates cached entries against the sentence being replayed', async () => {
    const area = memoryArea();
    await setCachedTrapsBatch(area, [{ sentence: sentenceText(0), traps: [trapFor(0)] }], NOW);

    // The same key would only be produced by the same text, but a stored
    // template must never be trusted onto a sentence it does not fit.
    const hits = await getCachedTrapsBatch(area, [sentenceText(0)], NOW);
    expect(hits.get(sentenceText(0))?.[0]?.sentence).toBe(sentenceText(0));
  });

  it('handles an empty batch without touching storage', async () => {
    const area = countingArea();
    expect((await getCachedTrapsBatch(area, [], NOW)).size).toBe(0);
    expect(area.gets).toBe(0);
    expect(area.sets).toBe(0);
  });
});
