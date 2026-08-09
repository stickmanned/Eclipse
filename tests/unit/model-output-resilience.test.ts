/**
 * Yield and cost of one generation batch.
 *
 * These pin the three behaviours that made long articles slow. Measured
 * against the real provider, a typical eight-sentence batch produced seven or
 * eight good learning items on the first call — and then returned nothing,
 * because one item with a spaced slug failed the whole-array schema, the
 * "every sentence must be covered" bar triggered a repair call, and a
 * malformed repair discarded the good first attempt on its way out.
 */

import { describe, expect, it, vi } from 'vitest';
import { geminiProvider, repairThreshold, type GeminiClient } from '../../server/providers/gemini';
import { parseModelOutput, toContextTraps, type ContextTrapsRequest } from '../../server/schema';

function sentence(index: number): { id: string; text: string } {
  return {
    id: `s${index}`,
    text: `The library lets neighbors borrow book number ${index} for two weeks.`,
  };
}

function requestOf(count: number): ContextTrapsRequest {
  return {
    sourceLocale: 'en',
    targetLocale: 'fr-FR',
    delfLevel: 'B1',
    sentences: Array.from({ length: count }, (_unused, index) => sentence(index)),
  };
}

function item(index: number, overrides: Record<string, unknown> = {}) {
  return {
    sentenceId: `s${index}`,
    conceptSlug: `emprunter-${index}`,
    englishSense: `borrow-${index}`,
    type: 'vocabulary',
    exactSourceText: 'borrow',
    targetSurface: 'emprunter',
    choices: ['borrow', 'buy', 'sell'],
    acceptedChoice: 'borrow',
    clueSpan: 'for two weeks',
    explanation: 'emprunter means to borrow.',
    distractorExplanation: 'To buy is acheter.',
    difficulty: 0.4,
    confidence: 0.95,
    ...overrides,
  };
}

function clientReturning(...responses: string[]): GeminiClient & { calls: () => number } {
  let call = 0;
  const create = vi.fn(async () => {
    const raw = responses[Math.min(call, responses.length - 1)];
    call += 1;
    return { output_text: raw };
  });
  return { interactions: { create }, calls: () => create.mock.calls.length };
}

describe('parseModelOutput', () => {
  it('drops only the malformed item, not the whole batch', () => {
    const parsed = parseModelOutput({
      traps: [item(0), { ...item(1), difficulty: 5 }, item(2)],
    });

    expect(parsed).not.toBeNull();
    expect(parsed?.output.traps).toHaveLength(2);
    expect(parsed?.droppedItems).toBe(1);
    expect(parsed?.output.traps.map((trap) => trap.sentenceId)).toEqual(['s0', 's2']);
  });

  it('conforms a spaced slug to the documented hyphen form', () => {
    // The exact shape the live model returns under load.
    const parsed = parseModelOutput({
      traps: [item(0, { englishSense: 'pointed out', conceptSlug: 'Faire Remarquer' })],
    });

    expect(parsed?.droppedItems).toBe(0);
    expect(parsed?.output.traps[0]?.englishSense).toBe('pointed-out');
    expect(parsed?.output.traps[0]?.conceptSlug).toBe('faire-remarquer');
  });

  it('still rejects a slug field with nothing slug-like in it', () => {
    const parsed = parseModelOutput({ traps: [item(0, { englishSense: '!!! ???' })] });
    expect(parsed?.output.traps).toHaveLength(0);
    expect(parsed?.droppedItems).toBe(1);
  });

  it('returns null only when the envelope itself is unusable', () => {
    expect(parseModelOutput({ traps: 'not an array' })).toBeNull();
    expect(parseModelOutput(null)).toBeNull();
    expect(parseModelOutput({ traps: [] })?.output.traps).toEqual([]);
  });

  it('keeps every per-item rule the whole-array schema enforced', () => {
    const rejected = [
      item(0, { choices: ['only', 'two'] }),
      item(0, { confidence: 1.5 }),
      item(0, { targetSurface: '' }),
      item(0, { type: 'not-a-type' }),
      item(0, { explanation: 'x'.repeat(301) }),
    ];
    for (const bad of rejected) {
      expect(parseModelOutput({ traps: [bad] })?.output.traps, JSON.stringify(bad)).toHaveLength(0);
    }
  });
});

describe('repairThreshold', () => {
  it('accepts a batch that covers most of its sentences', () => {
    expect(repairThreshold(8)).toBeLessThanOrEqual(7);
    expect(repairThreshold(1)).toBe(1);
  });
});

describe('the repair attempt', () => {
  const request = requestOf(8);
  const goodBatch = JSON.stringify({
    traps: Array.from({ length: 7 }, (_unused, index) => item(index)),
  });

  it('does not fire when the first attempt already covers most sentences', async () => {
    const client = clientReturning(goodBatch);
    const provider = geminiProvider({ apiKey: 'test', client });

    const outcome = await provider.generate(request, new AbortController().signal);

    expect(outcome.kind).toBe('ok');
    // The regression: 7-of-8 used to buy a second full model call.
    expect(client.calls()).toBe(1);
  });

  it('never discards a good first attempt when the repair comes back malformed', async () => {
    const request2 = requestOf(4);
    // Two usable items out of four is below the bar, so repair fires...
    const thin = JSON.stringify({ traps: [item(0), item(1)] });
    const client = clientReturning(thin, 'this is not json at all');
    const provider = geminiProvider({ apiKey: 'test', client });

    const outcome = await provider.generate(request2, new AbortController().signal);

    expect(client.calls()).toBe(2);
    // ...and the good first attempt still ships. This returned `invalid` before.
    expect(outcome.kind).toBe('ok');
    if (outcome.kind === 'ok') {
      expect(toContextTraps(outcome.output, request2).candidates).toHaveLength(2);
    }
  });

  it('keeps the better of the two attempts', async () => {
    const request2 = requestOf(4);
    const thin = JSON.stringify({ traps: [item(0)] });
    const fuller = JSON.stringify({ traps: [item(0), item(1), item(2), item(3)] });
    const client = clientReturning(thin, fuller);
    const provider = geminiProvider({ apiKey: 'test', client });

    const outcome = await provider.generate(request2, new AbortController().signal);

    expect(outcome.kind).toBe('ok');
    if (outcome.kind === 'ok') {
      expect(toContextTraps(outcome.output, request2).candidates).toHaveLength(4);
    }
  });

  it('still reports invalid when neither attempt yields anything usable', async () => {
    const client = clientReturning('not json', 'also not json');
    const provider = geminiProvider({ apiKey: 'test', client });

    const outcome = await provider.generate(requestOf(2), new AbortController().signal);

    expect(outcome.kind).toBe('invalid');
  });

  it('ships a batch whose only flaw is one malformed item, in one call', async () => {
    // The measured live failure, end to end: eight items, one spaced slug.
    const raw = JSON.stringify({
      traps: [
        ...Array.from({ length: 7 }, (_unused, index) => item(index)),
        item(7, { englishSense: 'pointed out' }),
      ],
    });
    const client = clientReturning(raw);
    const provider = geminiProvider({ apiKey: 'test', client });

    const outcome = await provider.generate(request, new AbortController().signal);

    expect(outcome.kind).toBe('ok');
    expect(client.calls()).toBe(1);
    if (outcome.kind === 'ok') {
      expect(toContextTraps(outcome.output, request).candidates).toHaveLength(8);
    }
  });
});
