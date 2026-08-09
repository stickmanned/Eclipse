import { describe, expect, it } from 'vitest';
import { memoryArea } from '@/storage/area';
import {
  PROVIDER_CACHE_LIMIT,
  cacheKeyFor,
  clearProviderCache,
  getCachedTraps,
  providerCacheSize,
  setCachedTraps,
} from '@/storage/provider-cache';
import { PROVIDER_CACHE_KEY } from '@/storage/keys';
import { generatedTrap } from '../fixtures/traps';

const NOW = new Date('2026-03-01T12:00:00.000Z');
const LATER = new Date(NOW.getTime() + 60_000);
const sentence = (suffix = '') =>
  `We had to wait for the bus for nearly an hour${suffix ? `, ${suffix}` : ''}.`;

describe('cache keys', () => {
  it('are stable, sentence-specific SHA-256 values', async () => {
    const first = await cacheKeyFor('a sentence');
    expect(first).toBe(await cacheKeyFor('a sentence'));
    expect(first).not.toBe(await cacheKeyFor('another sentence'));
    expect(first).toMatch(/^[a-f0-9]{64}$/);
  });

  it('invalidates entries when the generation contract changes', async () => {
    const area = memoryArea();
    await setCachedTraps(area, sentence(), [generatedTrap()], NOW, 'contract-v1');
    expect(await getCachedTraps(area, sentence(), NOW, 'contract-v1')).not.toBeNull();
    expect(await getCachedTraps(area, sentence(), NOW, 'contract-v2')).toBeNull();
  });

  it('never store the sentence itself', async () => {
    const area = memoryArea();
    const secret = 'The museum is currently closed and will reopen next Monday.';
    await setCachedTraps(
      area,
      secret,
      [
        generatedTrap({
          sentence: secret,
          exactSourceText: 'currently',
          choices: ['currently', 'previously', 'eventually'],
          acceptedChoice: 'currently',
          clueSpan: 'reopen next Monday',
        }),
      ],
      NOW,
    );
    const stored = JSON.stringify(await area.get(PROVIDER_CACHE_KEY));
    expect(stored.includes(secret)).toBe(false);
    expect(stored.includes('museum')).toBe(false);
  });
});

describe('round trip', () => {
  it('stores and retrieves validated traps', async () => {
    const area = memoryArea();
    await setCachedTraps(area, sentence(), [generatedTrap()], NOW);
    const found = await getCachedTraps(area, sentence(), LATER);
    expect(found).not.toBeNull();
    expect(found?.[0]?.conceptId).toBe('fr:attendre:wait');
    expect(found?.[0]?.sentence).toBe(sentence());
  });

  it('returns null for a miss', async () => {
    expect(await getCachedTraps(memoryArea(), 'nothing here', NOW)).toBeNull();
  });

  it('re-validates on read, so a laxer old cache cannot bypass validation', async () => {
    const area = memoryArea();
    // Write a trap directly that would fail current validation.
    await area.set(PROVIDER_CACHE_KEY, {
      [await cacheKeyFor(sentence('poisoned'))]: {
        accessedAt: NOW.getTime(),
        traps: [{ ...generatedTrap(), targetSurface: '<img src=x onerror=alert(1)>' }],
      },
    });
    expect(await getCachedTraps(area, sentence('poisoned'), NOW)).toBeNull();
  });

  it('drops a cached trap whose confidence is below the generated floor', async () => {
    const area = memoryArea();
    await area.set(PROVIDER_CACHE_KEY, {
      [await cacheKeyFor(sentence('weak'))]: {
        accessedAt: NOW.getTime(),
        traps: [{ ...generatedTrap(), confidence: 0.5 }],
      },
    });
    expect(await getCachedTraps(area, sentence('weak'), NOW)).toBeNull();
  });

  it('preserves entries written concurrently by provider batches', async () => {
    const area = memoryArea();
    const first = sentence('first batch');
    const second = sentence('second batch');

    await Promise.all([
      setCachedTraps(area, first, [generatedTrap({ sentence: first })], NOW),
      setCachedTraps(area, second, [generatedTrap({ sentence: second })], NOW),
    ]);

    expect(await getCachedTraps(area, first, LATER)).not.toBeNull();
    expect(await getCachedTraps(area, second, LATER)).not.toBeNull();
  });
});

describe('eviction', () => {
  it(`keeps at most ${PROVIDER_CACHE_LIMIT} entries, dropping the oldest access first`, async () => {
    const area = memoryArea();

    for (let i = 0; i < PROVIDER_CACHE_LIMIT; i += 1) {
      await setCachedTraps(
        area,
        sentence(`entry ${i}`),
        [generatedTrap()],
        new Date(NOW.getTime() + i),
      );
    }
    const size = await providerCacheSize(area);
    expect(size.ok && size.data).toBe(PROVIDER_CACHE_LIMIT);

    // Touch the oldest entry so it is no longer the least recently accessed.
    await getCachedTraps(area, sentence('entry 0'), new Date(NOW.getTime() + 10_000));

    await setCachedTraps(
      area,
      sentence('one too many'),
      [generatedTrap()],
      new Date(NOW.getTime() + 20_000),
    );

    const after = await providerCacheSize(area);
    expect(after.ok && after.data).toBe(PROVIDER_CACHE_LIMIT);
    expect(await getCachedTraps(area, sentence('one too many'), NOW)).not.toBeNull();
    // The touched entry survived; the never-touched second-oldest did not.
    expect(await getCachedTraps(area, sentence('entry 0'), NOW)).not.toBeNull();
    expect(await getCachedTraps(area, sentence('entry 1'), NOW)).toBeNull();
  });

  it('can be cleared', async () => {
    const area = memoryArea();
    await setCachedTraps(area, sentence(), [generatedTrap()], NOW);
    await clearProviderCache(area);
    const size = await providerCacheSize(area);
    expect(size.ok && size.data).toBe(0);
  });
});
