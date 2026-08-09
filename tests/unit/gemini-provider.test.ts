import { describe, expect, it } from 'vitest';
import {
  geminiProvider,
  type GeminiClient,
  type GeminiInteractionRequest,
  type GeminiRequestOptions,
} from '../../server/providers/gemini';
import type { ContextTrapsRequest } from '../../server/schema';

const REQUEST: ContextTrapsRequest = {
  sourceLocale: 'en',
  targetLocale: 'fr-FR',
  delfLevel: 'B1',
  sentences: [
    {
      id: 'sentence-1',
      text: 'The library lets neighbors borrow books for two weeks.',
    },
  ],
};

const VALID_OUTPUT = {
  traps: [
    {
      sentenceId: 'sentence-1',
      conceptSlug: 'bibliotheque',
      englishSense: 'library',
      type: 'false_friend',
      exactSourceText: 'library',
      targetSurface: 'bibliothèque',
      choices: ['library', 'bookstore', 'stationery shop'],
      acceptedChoice: 'library',
      clueSpan: 'borrow books',
      explanation: 'bibliothèque means library.',
      distractorExplanation: 'A bookstore is une librairie.',
      difficulty: 0.35,
      confidence: 0.95,
    },
  ],
};

const TWO_SENTENCE_REQUEST: ContextTrapsRequest = {
  ...REQUEST,
  sentences: [
    ...REQUEST.sentences,
    {
      id: 'sentence-2',
      text: 'The museum is currently closed while workers repair the entrance.',
    },
  ],
};

const TWO_TRAP_OUTPUT = {
  traps: [
    ...VALID_OUTPUT.traps,
    {
      sentenceId: 'sentence-2',
      conceptSlug: 'actuellement',
      englishSense: 'currently',
      type: 'false_friend',
      exactSourceText: 'currently',
      targetSurface: 'actuellement',
      choices: ['currently', 'actually', 'possibly'],
      acceptedChoice: 'currently',
      clueSpan: 'workers repair the entrance',
      explanation: 'actuellement means currently.',
      distractorExplanation: 'Actually is en fait, not actuellement.',
      difficulty: 0.35,
      confidence: 0.95,
    },
  ],
};

function clientReturning(text: string): {
  client: GeminiClient;
  requests: Array<{ request: GeminiInteractionRequest; options?: GeminiRequestOptions }>;
} {
  const requests: Array<{ request: GeminiInteractionRequest; options?: GeminiRequestOptions }> = [];
  return {
    requests,
    client: {
      interactions: {
        async create(request, options) {
          requests.push({ request, options });
          return { output_text: text };
        },
      },
    },
  };
}

function clientReturningSequence(texts: readonly string[]): {
  client: GeminiClient;
  requests: Array<{ request: GeminiInteractionRequest; options?: GeminiRequestOptions }>;
} {
  const requests: Array<{ request: GeminiInteractionRequest; options?: GeminiRequestOptions }> = [];
  return {
    requests,
    client: {
      interactions: {
        async create(request, options) {
          requests.push({ request, options });
          return { output_text: texts[requests.length - 1] };
        },
      },
    },
  };
}

describe('Gemini provider boundary', () => {
  it('uses Gemini 3.5 Flash-Lite with structured output and request storage disabled', async () => {
    const { client, requests } = clientReturning(JSON.stringify(VALID_OUTPUT));
    const provider = geminiProvider({
      apiKey: 'test-key',
      model: 'gemini-3.5-flash-lite',
      client,
      retryDelayMs: 0,
    });

    const outcome = await provider.generate(REQUEST, new AbortController().signal);

    expect(outcome).toEqual({ kind: 'ok', output: VALID_OUTPUT });
    expect(provider.name).toBe('gemini');
    expect(provider.model).toBe('gemini-3.5-flash-lite');
    expect(requests).toHaveLength(1);

    const sent = requests[0]!;
    expect(sent.request.model).toBe('gemini-3.5-flash-lite');
    expect(sent.request.input).toContain('The library lets neighbors borrow books for two weeks.');
    expect(sent.request.store).toBe(false);
    expect(sent.request.response_format).toMatchObject({
      type: 'text',
      mime_type: 'application/json',
    });
    expect(sent.request.response_format.schema).toBeDefined();
    expect(sent.request.system_instruction).toContain('UNTRUSTED DATA');
    expect(sent.request.system_instruction).toMatch(
      /acceptedChoice must equal\s+exactSourceText exactly/,
    );
    expect(sent.request.system_instruction).toContain('faire face à');
    expect(sent.options?.fetchOptions?.signal).toBeInstanceOf(AbortSignal);
    expect(sent.request).not.toHaveProperty('tools');
    expect(sent.request).not.toHaveProperty('generation_config');
  });

  it('rejects output that is not valid JSON', async () => {
    const { client } = clientReturning('not json');
    const provider = geminiProvider({ apiKey: 'test-key', model: 'gemini-3.5-flash-lite', client });

    await expect(provider.generate(REQUEST, new AbortController().signal)).resolves.toEqual({
      kind: 'invalid',
      detail: 'provider returned non-JSON output',
    });
  });

  it('repairs a transient non-JSON structured response before returning 502', async () => {
    const { client, requests } = clientReturningSequence([
      'temporarily malformed',
      JSON.stringify(VALID_OUTPUT),
    ]);
    const provider = geminiProvider({ apiKey: 'test-key', client });

    await expect(provider.generate(REQUEST, new AbortController().signal)).resolves.toEqual({
      kind: 'ok',
      output: VALID_OUTPUT,
    });
    expect(requests).toHaveLength(2);
    expect(requests[1]?.request.system_instruction).toContain('REPAIR ATTEMPT');
  });

  it('makes one bounded repair attempt when usable prose produces no traps', async () => {
    const { client, requests } = clientReturningSequence([
      JSON.stringify({ traps: [] }),
      JSON.stringify(TWO_TRAP_OUTPUT),
    ]);
    const provider = geminiProvider({
      apiKey: 'test-key',
      model: 'gemini-3.5-flash-lite',
      client,
      retryDelayMs: 0,
    });

    await expect(
      provider.generate(TWO_SENTENCE_REQUEST, new AbortController().signal),
    ).resolves.toEqual({ kind: 'ok', output: TWO_TRAP_OUTPUT });
    expect(requests).toHaveLength(2);
    expect(requests[1]?.request.system_instruction).toContain('REPAIR ATTEMPT');
  });

  it('retries one transient 503 before reporting the provider unavailable', async () => {
    const requests: GeminiInteractionRequest[] = [];
    const client: GeminiClient = {
      interactions: {
        async create(request) {
          requests.push(request);
          if (requests.length === 1) throw Object.assign(new Error('overloaded'), { status: 503 });
          return { output_text: JSON.stringify(VALID_OUTPUT) };
        },
      },
    };
    const provider = geminiProvider({
      apiKey: 'test-key',
      model: 'gemini-3.5-flash-lite',
      client,
      retryDelayMs: 0,
    });

    await expect(provider.generate(REQUEST, new AbortController().signal)).resolves.toEqual({
      kind: 'ok',
      output: VALID_OUTPUT,
    });
    expect(requests).toHaveLength(2);
  });

  it('does not retry a non-transient 403', async () => {
    let requests = 0;
    const client: GeminiClient = {
      interactions: {
        async create() {
          requests += 1;
          throw Object.assign(new Error('forbidden'), { status: 403 });
        },
      },
    };
    const provider = geminiProvider({ apiKey: 'test-key', client });

    await expect(provider.generate(REQUEST, new AbortController().signal)).resolves.toEqual({
      kind: 'unavailable',
      detail: 'gemini_status_403',
    });
    expect(requests).toBe(1);
  });

  it('reports an aborted request as a timeout', async () => {
    const controller = new AbortController();
    controller.abort();
    const { client } = clientReturning(JSON.stringify(VALID_OUTPUT));
    const provider = geminiProvider({ apiKey: 'test-key', model: 'gemini-3.5-flash-lite', client });

    await expect(provider.generate(REQUEST, controller.signal)).resolves.toEqual({
      kind: 'timeout',
    });
  });
});
