/**
 * The Gemini provider's own outcome classification, independent of the router.
 *
 * Uses the `client` seam on `paraphraseGeminiProvider` so these run without a
 * real API key, driving the provider with canned `output_text` strings the way
 * the real SDK would deliver them.
 */

import { describe, expect, it } from 'vitest';
import { paraphraseGeminiProvider } from '../../server/paraphrase/gemini';
import type { ParaphraseGeminiClient } from '../../server/paraphrase/gemini';
import type { ParaphraseRequest } from '../../server/paraphrase/schema';

const REQUEST: ParaphraseRequest = {
  locale: 'fr-FR',
  mode: 'auto',
  complexity: { target: 0.9, min: 0.85, max: 1 },
  focusRegisters: [],
  reinforce: [],
  sentences: [{ id: 's1', text: 'Le chat est noir.' }],
};

/** A well-formed item that validates against `REQUEST`'s one sentence. */
const ITEM = {
  sentenceId: 's1',
  conceptSlug: 'noir',
  senseSlug: 'sombre',
  register: 'everyday',
  exactSourceText: 'noir',
  simplifiedSurface: 'sombre',
  choices: ['noir', 'clair', 'vif'],
  acceptedChoice: 'noir',
  clueSpan: 'Le chat est',
  plainMeaning: 'de couleur très foncée',
  explanation: 'Noir désigne ici la couleur du chat.',
  distractorExplanation: 'Clair désignerait une couleur opposée.',
  complexity: 0.3,
  confidence: 0.95,
};

function clientReturning(...outputs: readonly string[]): ParaphraseGeminiClient {
  let call = 0;
  return {
    interactions: {
      async create() {
        const output_text = outputs[Math.min(call, outputs.length - 1)];
        call += 1;
        return { output_text };
      },
    },
  };
}

describe('the model declining to simplify anything', () => {
  it('is an ok result with no candidates once both attempts come back empty', async () => {
    const provider = paraphraseGeminiProvider({
      apiKey: 'test',
      client: clientReturning(JSON.stringify({ items: [] }), JSON.stringify({ items: [] })),
    });

    const outcome = await provider.generate(REQUEST, new AbortController().signal);

    expect(outcome.kind).toBe('ok');
    if (outcome.kind === 'ok') expect(outcome.output.items).toEqual([]);
  });

  it('still spends the repair attempt on a clean empty first response', async () => {
    // A clean "nothing here" on attempt one is not shipped immediately — the
    // repair attempt gets the same chance to find something it would get after
    // any other unsatisfying first attempt.
    let calls = 0;
    const provider = paraphraseGeminiProvider({
      apiKey: 'test',
      client: {
        interactions: {
          async create() {
            calls += 1;
            return { output_text: JSON.stringify({ items: [] }) };
          },
        },
      },
    });

    await provider.generate(REQUEST, new AbortController().signal);
    expect(calls).toBe(2);
  });

  it('lets the repair attempt rescue a clean empty first response', async () => {
    const provider = paraphraseGeminiProvider({
      apiKey: 'test',
      client: clientReturning(JSON.stringify({ items: [] }), JSON.stringify({ items: [ITEM] })),
    });

    const outcome = await provider.generate(REQUEST, new AbortController().signal);

    expect(outcome.kind).toBe('ok');
    if (outcome.kind === 'ok') expect(outcome.output.items).toHaveLength(1);
  });
});

describe('the model actually misbehaving', () => {
  it('is still invalid when the response cannot be parsed at all', async () => {
    const provider = paraphraseGeminiProvider({
      apiKey: 'test',
      client: clientReturning('not json', 'still not json'),
    });

    const outcome = await provider.generate(REQUEST, new AbortController().signal);
    expect(outcome.kind).toBe('invalid');
  });

  it('is invalid, not a clean empty, when every item was malformed and dropped', async () => {
    // An envelope that parses but whose only item fails item-level validation
    // ends up with an empty `items` array too — that must not be confused with
    // the model correctly reporting nothing to simplify.
    const garbage = JSON.stringify({ items: [{ sentenceId: 's1', complexity: 'very hard' }] });
    const provider = paraphraseGeminiProvider({
      apiKey: 'test',
      client: clientReturning(garbage, garbage),
    });

    const outcome = await provider.generate(REQUEST, new AbortController().signal);
    expect(outcome.kind).toBe('invalid');
  });
});
