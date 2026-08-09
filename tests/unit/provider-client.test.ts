import { describe, expect, it, vi } from 'vitest';
import { checkProviderHealth, fetchGeneratedTraps } from '@/provider/client';
import { PROVIDER_ORIGIN, PROVIDER_TIMEOUT_MS } from '@/storage/provider-settings';
import { LOCAL_API_MESSAGE } from '@/domain/errors';
import { generatedTrap } from '../fixtures/traps';
import { DEFAULT_SERVER_TIMEOUT_MS } from '../../server/app';
import { RATE_LIMIT_PER_MINUTE } from '../../server/rate-limit';

const SENTENCE = 'Researchers observed the quiet forest while communities documented weather.';
const PROVIDER_SENTENCES = [{ id: 's0', text: SENTENCE }];

function successfulResponse(): Response {
  return Response.json({
    candidates: [
      {
        sentenceId: 's0',
        trap: generatedTrap({
          sentence: SENTENCE,
          exactSourceText: 'observed',
          targetSurface: 'observé',
          choices: ['observed', 'ignored', 'missed'],
          acceptedChoice: 'observed',
          clueSpan: 'quiet forest',
        }),
      },
    ],
  });
}

describe('local provider readiness', () => {
  it('accepts the configured Gemini model without exposing configuration details', async () => {
    const fetchImpl = vi.fn(async () =>
      Response.json({
        ok: true,
        provider: 'gemini',
        model: 'gemini-3.5-flash-lite',
      }),
    );

    const result = await checkProviderHealth({ fetchImpl });

    expect(result.ok).toBe(true);
    expect(fetchImpl).toHaveBeenCalledOnce();
  });

  it('rejects a disabled or wrong-model server', async () => {
    for (const body of [
      { ok: true, provider: null, model: null },
      { ok: true, provider: 'gemini', model: 'another-model' },
    ]) {
      const result = await checkProviderHealth({ fetchImpl: async () => Response.json(body) });
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error.code).toBe('PROVIDER_DISABLED');
    }
  });
});

describe('generation recovery', () => {
  it('allows enough time for a normal live Gemini response', () => {
    expect(PROVIDER_TIMEOUT_MS).toBeGreaterThanOrEqual(20_000);
    expect(DEFAULT_SERVER_TIMEOUT_MS).toBeGreaterThanOrEqual(18_000);
    expect(PROVIDER_TIMEOUT_MS).toBeGreaterThan(DEFAULT_SERVER_TIMEOUT_MS);
  });

  it('budgets enough local requests for two worst-case long-article attempts', () => {
    expect(RATE_LIMIT_PER_MINUTE).toBeGreaterThanOrEqual(60);
  });

  for (const status of [429, 500, 502, 503, 504]) {
    it(`retries a transient ${status} once`, async () => {
      const fetchImpl = vi
        .fn<typeof fetch>()
        .mockResolvedValueOnce(new Response(null, { status }))
        .mockResolvedValueOnce(successfulResponse());

      const result = await fetchGeneratedTraps(PROVIDER_SENTENCES, 'B1', {
        fetchImpl,
        retryDelayMs: 0,
      });

      expect(result.ok).toBe(true);
      expect(fetchImpl).toHaveBeenCalledTimes(2);
    });
  }

  it('retries one client timeout and succeeds on the same click', async () => {
    const fetchImpl = vi.fn<typeof fetch>(async (_input, init) => {
      if (fetchImpl.mock.calls.length === 1) {
        return new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener(
            'abort',
            () => reject(new DOMException('Aborted', 'AbortError')),
            { once: true },
          );
        });
      }
      return successfulResponse();
    });

    const result = await fetchGeneratedTraps(PROVIDER_SENTENCES, 'B1', {
      fetchImpl,
      timeoutMs: 5,
      retryDelayMs: 0,
    });

    expect(result.ok).toBe(true);
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it('retries a temporary network failure and malformed success body', async () => {
    for (const firstFailure of [
      () => Promise.reject<Response>(new TypeError('connection reset')),
      () => Promise.resolve(new Response('not json', { status: 200 })),
    ]) {
      const fetchImpl = vi
        .fn<typeof fetch>()
        .mockImplementationOnce(firstFailure)
        .mockResolvedValueOnce(successfulResponse());

      const result = await fetchGeneratedTraps(PROVIDER_SENTENCES, 'B1', {
        fetchImpl,
        retryDelayMs: 0,
      });

      expect(result.ok).toBe(true);
      expect(fetchImpl).toHaveBeenCalledTimes(2);
    }
  });

  it('does not retry a permission-denied 403', async () => {
    const fetchImpl = vi.fn<typeof fetch>(async () => new Response(null, { status: 403 }));

    const result = await fetchGeneratedTraps(PROVIDER_SENTENCES, 'B1', {
      fetchImpl,
      retryDelayMs: 0,
    });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('PROVIDER_PERMISSION_DENIED');
    expect(fetchImpl).toHaveBeenCalledOnce();
  });

  it('tells the learner how to start the API when nothing is listening on it', async () => {
    // What a stopped `npm run api` looks like from inside the worker: fetch
    // rejects before any response exists. The old copy said only that the API
    // "could not be reached", which named no cause and no fix.
    const fetchImpl = vi.fn<typeof fetch>(() => Promise.reject(new TypeError('Failed to fetch')));

    const result = await fetchGeneratedTraps(PROVIDER_SENTENCES, 'B1', {
      fetchImpl,
      retryDelayMs: 0,
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe('PROVIDER_UNAVAILABLE');
      expect(result.error.recoverable).toBe(true);
      expect(result.error.message).toBe(LOCAL_API_MESSAGE);
      expect(result.error.message).toContain('npm run api');
      expect(result.error.message).toContain(PROVIDER_ORIGIN);
    }
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it('keeps timeouts distinct from an API that is not running', async () => {
    const fetchImpl = vi.fn<typeof fetch>(() => {
      const aborted = new Error('aborted');
      aborted.name = 'AbortError';
      return Promise.reject(aborted);
    });

    const result = await fetchGeneratedTraps(PROVIDER_SENTENCES, 'B1', {
      fetchImpl,
      retryDelayMs: 0,
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe('PROVIDER_TIMEOUT');
      expect(result.error.message).not.toContain('npm run api');
    }
  });

  it('stops after one recovery attempt when a transient error persists', async () => {
    const fetchImpl = vi.fn<typeof fetch>(async () => new Response(null, { status: 429 }));

    const result = await fetchGeneratedTraps(PROVIDER_SENTENCES, 'B1', {
      fetchImpl,
      retryDelayMs: 0,
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe('PROVIDER_UNAVAILABLE');
      expect(result.error.message).toContain('after automatic recovery');
    }
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });
});
