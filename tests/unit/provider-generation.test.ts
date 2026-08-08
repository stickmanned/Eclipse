import { describe, expect, it, vi } from 'vitest';
import { failure, success } from '@/domain/errors';
import type { GeneratedTrapCandidate } from '@/domain/trap';
import { generateWithCache } from '@/provider/generate-with-cache';
import { memoryArea } from '@/storage/area';
import { PROVIDER_CACHE_KEY } from '@/storage/keys';
import { generatedTrap } from '../fixtures/traps';

const first = {
  id: 's0',
  text: 'We had to wait for the bus for nearly an hour, according to the morning report.',
};
const second = {
  id: 's1',
  text: 'Visitors wait for the bus near the station while the evening service is prepared.',
};

function candidate(sentence: typeof first): GeneratedTrapCandidate {
  return {
    sentenceId: sentence.id,
    trap: generatedTrap({
      id: `gemini:${sentence.id}`,
      sentence: sentence.text,
      clueSpan: 'for the bus',
    }),
  };
}

describe('generation cache orchestration', () => {
  it('writes a sentence-free miss and reuses it without another request', async () => {
    const area = memoryArea();
    const fetcher = vi.fn(async () => success([candidate(first)]));

    const initial = await generateWithCache([first], area, fetcher);
    expect(initial.ok).toBe(true);
    expect(fetcher).toHaveBeenCalledTimes(1);

    const stored = JSON.stringify(await area.get(PROVIDER_CACHE_KEY));
    expect(stored).not.toContain(first.text);
    expect(stored).not.toContain('morning report');

    const cached = await generateWithCache(
      [first],
      area,
      vi.fn(async () => failure('PROVIDER_UNAVAILABLE')),
    );
    expect(cached.ok).toBe(true);
    if (cached.ok) {
      expect(cached.data).toHaveLength(1);
      expect(cached.data[0]?.sentenceId).toBe('s0');
      expect(cached.data[0]?.trap.sentence).toBe(first.text);
    }
  });

  it('requests only cache misses and preserves caller order', async () => {
    const area = memoryArea();
    await generateWithCache([first], area, async () => success([candidate(first)]));

    const fetcher = vi.fn(async (sentences: readonly (typeof first)[]) => {
      expect(sentences).toEqual([second]);
      return success([candidate(second)]);
    });
    const result = await generateWithCache([first, second], area, fetcher);

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.map((item) => item.sentenceId)).toEqual(['s0', 's1']);
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it('returns validated cache hits when a request for other misses fails', async () => {
    const area = memoryArea();
    await generateWithCache([first], area, async () => success([candidate(first)]));

    const result = await generateWithCache([first, second], area, async () =>
      failure('PROVIDER_TIMEOUT'),
    );

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.map((item) => item.sentenceId)).toEqual(['s0']);
  });
});
