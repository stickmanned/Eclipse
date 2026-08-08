/** Validated, side-effect-free configuration for the localhost API. */

import { geminiProvider, GEMINI_MODEL, type GeminiProviderOptions } from './providers/gemini';
import type { TrapProvider } from './providers/types';
import { ANY_CHROME_EXTENSION_ORIGIN } from './origin-policy';

export type Environment = Readonly<Record<string, string | undefined>>;
export type GeminiProviderFactory = (options: GeminiProviderOptions) => TrapProvider;

/**
 * Load a local `.env` for `npm run api`. Missing files are expected; malformed
 * or unreadable files still fail startup instead of being silently ignored.
 */
export function loadLocalEnvironment(path = '.env'): void {
  try {
    process.loadEnvFile(path);
  } catch (cause) {
    if ((cause as NodeJS.ErrnoException | null)?.code !== 'ENOENT') throw cause;
  }
}

export function resolveProvider(
  env: Environment = process.env,
  createGemini: GeminiProviderFactory = geminiProvider,
): TrapProvider | undefined {
  const apiKey = env.GEMINI_API_KEY?.trim();
  const mode = env.ECLIPSE_PROVIDER?.trim() || (apiKey ? 'gemini' : 'disabled');

  if (mode !== 'gemini' || !apiKey) return undefined;

  return createGemini({
    apiKey,
    model: env.GEMINI_MODEL?.trim() || GEMINI_MODEL,
  });
}

/**
 * Parse the origin allowlist. Web origins and concrete Chrome extension IDs
 * remain exact. The one supported wildcard is scoped to valid Chrome extension
 * IDs, which keeps rebuilt unpacked copies from breaking on an ID change.
 */
export function resolveOrigins(env: Environment = process.env): string[] {
  const candidates = (env.ECLIPSE_ALLOWED_ORIGINS ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  return candidates.filter((origin) => {
    if (origin === ANY_CHROME_EXTENSION_ORIGIN) return true;
    if (origin.includes('*')) return false;
    if (/^chrome-extension:\/\/[a-p]{32}$/.test(origin)) return true;
    try {
      const parsed = new URL(origin);
      if (!['http:', 'https:'].includes(parsed.protocol)) return false;
      if (parsed.username || parsed.password || parsed.search || parsed.hash) return false;
      return parsed.pathname === '/' && parsed.origin !== 'null';
    } catch {
      return false;
    }
  });
}
