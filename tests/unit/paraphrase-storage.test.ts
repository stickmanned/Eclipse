/**
 * Paraphrase Mode storage.
 *
 * Two guarantees are worth a test each, because breaking either is silent:
 *
 * - page text never lands in `storage.local`. The cache stores a template and
 *   rebinds the sentence on read, so a learner's browsing does not accumulate
 *   in extension storage.
 * - a profile that fails validation is reported, never overwritten. A schema
 *   bug in a later version must not be able to delete somebody's history.
 */

import { describe, expect, it } from 'vitest';
import { memoryArea } from '@/storage/area';
import {
  PARAPHRASE_CACHE_LIMIT,
  clearParaphraseCache,
  getCachedParaphrasesBatch,
  paraphraseCacheScope,
  paraphraseCacheSize,
  setCachedParaphrasesBatch,
} from '@/storage/paraphrase-cache';
import {
  PARAPHRASE_PROFILE_KEY,
  loadParaphraseProfile,
  loadSeededParaphraseProfile,
  resetParaphraseProfile,
  saveParaphraseProfile,
} from '@/storage/paraphrase-store';
import {
  applyParaphraseAnswer,
  createEmptyParaphraseProfile,
} from '@/domain/paraphrase-profile';
import { seedBandForDelf } from '@/domain/complexity';
import type { ParaphraseConceptId } from '@/domain/paraphrase';
import { facilitateItem, SENTENCES } from '../fixtures/paraphrase';

const NOW = new Date('2026-08-09T10:00:00.000Z');
const SCOPE = paraphraseCacheScope(0.6);

describe('the generation cache', () => {
  it('round-trips an item and rebinds it to the sentence', async () => {
    const area = memoryArea();
    const item = facilitateItem();

    await setCachedParaphrasesBatch(area, [{ sentence: item.sentence, items: [item] }], NOW, SCOPE);
    const hits = await getCachedParaphrasesBatch(area, [item.sentence], NOW, SCOPE);

    expect(hits.get(item.sentence)?.[0]?.exactSourceText).toBe('faciliter');
    expect(hits.get(item.sentence)?.[0]?.sentence).toBe(item.sentence);
  });

  it('never writes the submitted sentence', async () => {
    const area = memoryArea();
    const item = facilitateItem();
    await setCachedParaphrasesBatch(area, [{ sentence: item.sentence, items: [item] }], NOW, SCOPE);

    const raw = JSON.stringify(await area.get('eclipse:paraphrase-cache:v1'));
    expect(raw).not.toContain(SENTENCES.mechanism);
    // The exercise's own short spans do remain — the original wording and the
    // clue quoted from the sentence are what the item *is*. This is the same
    // trade Translate Mode's cache makes, and it is the reason the guarantee is
    // "not the sentence" rather than "no page text at all".
    expect(raw).toContain('faciliter');
    expect(raw).toContain(item.clueSpan);
  });

  it('keeps different complexity bands apart', async () => {
    const area = memoryArea();
    const item = facilitateItem();
    await setCachedParaphrasesBatch(area, [{ sentence: item.sentence, items: [item] }], NOW, SCOPE);

    const other = await getCachedParaphrasesBatch(
      area,
      [item.sentence],
      NOW,
      paraphraseCacheScope(0.9),
    );
    expect(other.size).toBe(0);
  });

  it('buckets nearby targets together so the cache can actually hit', () => {
    expect(paraphraseCacheScope(0.62)).toBe(paraphraseCacheScope(0.58));
    expect(paraphraseCacheScope(0.62)).not.toBe(paraphraseCacheScope(0.72));
  });

  it('re-validates on read, so a laxer old entry cannot bypass current rules', async () => {
    const area = memoryArea();
    const item = facilitateItem();
    await setCachedParaphrasesBatch(area, [{ sentence: item.sentence, items: [item] }], NOW, SCOPE);

    // Corrupt the stored template the way a future schema change might.
    const cache = (await area.get('eclipse:paraphrase-cache:v1')) as Record<
      string,
      { items: Record<string, unknown>[] }
    >;
    for (const entry of Object.values(cache)) {
      for (const template of entry.items) template.confidence = 0.1;
    }
    await area.set('eclipse:paraphrase-cache:v1', cache);

    const hits = await getCachedParaphrasesBatch(area, [item.sentence], NOW, SCOPE);
    expect(hits.size).toBe(0);
  });

  it('is bounded, evicting the least recently used first', async () => {
    const area = memoryArea();
    const item = facilitateItem();

    for (let index = 0; index < PARAPHRASE_CACHE_LIMIT + 10; index += 1) {
      const sentence = `Le dispositif numéro ${index} sert avant tout à faciliter la coordination.`;
      await setCachedParaphrasesBatch(
        area,
        [{ sentence, items: [{ ...item, sentence, clueSpan: 'la coordination' }] }],
        new Date(NOW.getTime() + index * 1000),
        SCOPE,
      );
    }

    expect(await paraphraseCacheSize(area)).toBeLessThanOrEqual(PARAPHRASE_CACHE_LIMIT);
  });

  it('clears completely on request', async () => {
    const area = memoryArea();
    const item = facilitateItem();
    await setCachedParaphrasesBatch(area, [{ sentence: item.sentence, items: [item] }], NOW, SCOPE);
    await clearParaphraseCache(area);
    expect(await paraphraseCacheSize(area)).toBe(0);
  });
});

describe('the profile store', () => {
  it('returns a fresh profile when nothing is stored', async () => {
    const loaded = await loadParaphraseProfile(memoryArea(), NOW);
    expect(loaded.ok).toBe(true);
    if (!loaded.ok) return;
    expect(loaded.data.created).toBe(true);
    expect(loaded.data.profile.seeded).toBe(false);
  });

  it('round-trips a profile with history', async () => {
    const area = memoryArea();
    const worked = applyParaphraseAnswer(createEmptyParaphraseProfile(NOW), {
      interactionId: 'int_1',
      conceptId: 'frp:faciliter:aider' as ParaphraseConceptId,
      original: 'faciliter',
      simplified: 'aider',
      register: 'formal',
      complexity: 0.58,
      correct: false,
      now: NOW,
    }).profile;

    expect((await saveParaphraseProfile(area, worked)).ok).toBe(true);
    const loaded = await loadParaphraseProfile(area, NOW);
    expect(loaded.ok).toBe(true);
    if (!loaded.ok) return;
    expect(loaded.data.created).toBe(false);
    expect(loaded.data.profile.concepts['frp:faciliter:aider']?.due).toBe('next_occurrence');
  });

  it('reports an unreadable profile without touching the bytes', async () => {
    const corrupt = { schemaVersion: 99, nonsense: true };
    const area = memoryArea({ [PARAPHRASE_PROFILE_KEY]: corrupt });

    const loaded = await loadParaphraseProfile(area, NOW);
    expect(loaded.ok).toBe(false);
    if (loaded.ok) return;
    expect(loaded.error.code).toBe('PROFILE_INCOMPATIBLE');
    expect(await area.get(PARAPHRASE_PROFILE_KEY)).toEqual(corrupt);
  });

  it('refuses to write something it could not read back', async () => {
    const area = memoryArea();
    const broken = { ...createEmptyParaphraseProfile(NOW), band: { center: 4, reach: 0 } };
    const written = await saveParaphraseProfile(area, broken);

    expect(written.ok).toBe(false);
    if (written.ok) return;
    expect(written.error.code).toBe('STORAGE_ERROR');
    expect(await area.get(PARAPHRASE_PROFILE_KEY)).toBeUndefined();
  });

  it('seeds the band from the DELF lens exactly once', async () => {
    const area = memoryArea();
    const first = await loadSeededParaphraseProfile(area, 'B2', NOW);
    expect(first.ok).toBe(true);
    if (!first.ok) return;
    expect(first.data.band).toEqual(seedBandForDelf('B2'));

    // A later load with a different lens must not overwrite measured evidence.
    const second = await loadSeededParaphraseProfile(area, 'A1', NOW);
    expect(second.ok).toBe(true);
    if (!second.ok) return;
    expect(second.data.band).toEqual(seedBandForDelf('B2'));
  });

  it('fills in a register the stored profile predates', async () => {
    const area = memoryArea();
    const stored = createEmptyParaphraseProfile(NOW);
    const withGap = { ...stored, registers: { formal: { attempts: 1, correct: 1 } } };
    await area.set(PARAPHRASE_PROFILE_KEY, withGap);

    const loaded = await loadParaphraseProfile(area, NOW);
    expect(loaded.ok).toBe(true);
    if (!loaded.ok) return;
    expect(loaded.data.profile.registers.idiom).toEqual({ attempts: 0, correct: 0 });
    expect(loaded.data.profile.registers.formal).toEqual({ attempts: 1, correct: 1 });
  });

  it('resets to an empty profile', async () => {
    const area = memoryArea();
    await saveParaphraseProfile(area, createEmptyParaphraseProfile(NOW));
    const reset = await resetParaphraseProfile(area, NOW);
    expect(reset.ok).toBe(true);
    if (!reset.ok) return;
    expect(reset.data.concepts).toEqual({});
    expect(reset.data.totals.answered).toBe(0);
  });
});
