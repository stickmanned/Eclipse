/**
 * Configuration for the paraphrase endpoint.
 *
 * Reads the same environment variables as `server/config.ts` so one `.env`
 * configures both endpoints, and returns `undefined` rather than throwing when
 * nothing is configured — a missing key is a normal, supported state in which
 * the endpoint answers 503 and Paraphrase Mode reports that the AI service is
 * not available.
 */

import {
  PARAPHRASE_MODEL,
  paraphraseGeminiProvider,
  type ParaphraseGeminiOptions,
  type ParaphraseProvider,
} from './gemini';

export type Environment = Readonly<Record<string, string | undefined>>;
export type ParaphraseProviderFactory = (options: ParaphraseGeminiOptions) => ParaphraseProvider;

export function resolveParaphraseProvider(
  env: Environment = process.env,
  createGemini: ParaphraseProviderFactory = paraphraseGeminiProvider,
): ParaphraseProvider | undefined {
  const apiKey = env.GEMINI_API_KEY?.trim();
  const mode = env.ECLIPSE_PROVIDER?.trim() || (apiKey ? 'gemini' : 'disabled');

  if (mode !== 'gemini' || !apiKey) return undefined;

  return createGemini({
    apiKey,
    model: env.GEMINI_MODEL?.trim() || PARAPHRASE_MODEL,
  });
}
