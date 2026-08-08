import { describe, expect, it, vi } from 'vitest';
import type { TrapProvider } from '../../server/providers/types';
import { resolveOrigins, resolveProvider } from '../../server/config';

describe('server configuration', () => {
  it('creates the Gemini provider with the configured key and model', () => {
    const provider: TrapProvider = {
      name: 'gemini',
      model: 'gemini-3.5-flash-lite',
      generate: vi.fn(),
    };
    const create = vi.fn(() => provider);

    expect(
      resolveProvider(
        {
          ECLIPSE_PROVIDER: 'gemini',
          GEMINI_API_KEY: 'test-key',
          GEMINI_MODEL: 'gemini-3.5-flash-lite',
        },
        create,
      ),
    ).toBe(provider);
    expect(create).toHaveBeenCalledWith({
      apiKey: 'test-key',
      model: 'gemini-3.5-flash-lite',
    });
  });

  it('stays disabled when Gemini has no key', () => {
    expect(resolveProvider({ ECLIPSE_PROVIDER: 'gemini' })).toBeUndefined();
  });

  it('accepts exact origins and the Chrome-extension-scoped wildcard only', () => {
    expect(
      resolveOrigins({
        ECLIPSE_ALLOWED_ORIGINS:
          'chrome-extension://abcdefghijklmnopabcdefghijklmnop, chrome-extension://*, http://localhost:4321, *, https://*',
      }),
    ).toEqual([
      'chrome-extension://abcdefghijklmnopabcdefghijklmnop',
      'chrome-extension://*',
      'http://localhost:4321',
    ]);
  });
});
