import { describe, expect, it, vi } from 'vitest';
import { checkProviderHealth } from '@/provider/client';

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
