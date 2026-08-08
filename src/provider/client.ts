/**
 * Client for the optional local generation API.
 *
 * Everything about this path is designed to be skippable. It runs only when the
 * user has switched it on, it has a hard timeout, it never retries during
 * activation, and any failure at all leaves the catalog traps exactly as they
 * were.
 *
 * What leaves the browser: at most eight sentences of article text. Never the
 * page URL, never the learner profile, never answer history, never anything
 * else from the page.
 */

import { failure, success, type Result } from '../domain/errors';
import { collapseWhitespace } from '../domain/normalize';
import { validateTrap, type GeneratedTrapCandidate } from '../domain/trap';
import {
  PROVIDER_ENDPOINT,
  PROVIDER_HEALTH_ENDPOINT,
  PROVIDER_MAX_SENTENCES,
  PROVIDER_MAX_SENTENCE_LENGTH,
  PROVIDER_MODEL,
  PROVIDER_TIMEOUT_MS,
} from '../storage/provider-settings';

export interface ProviderSentence {
  readonly id: string;
  readonly text: string;
}

/** Status codes the server uses, mapped onto Eclipse's error vocabulary. */
function codeForStatus(status: number) {
  switch (status) {
    case 403:
      return 'PROVIDER_PERMISSION_DENIED' as const;
    case 429:
    case 503:
      return 'PROVIDER_UNAVAILABLE' as const;
    case 504:
      return 'PROVIDER_TIMEOUT' as const;
    case 502:
    case 400:
      return 'PROVIDER_INVALID_RESPONSE' as const;
    default:
      return 'PROVIDER_UNAVAILABLE' as const;
  }
}

export interface FetchTrapsOptions {
  readonly endpoint?: string;
  readonly timeoutMs?: number;
  readonly fetchImpl?: typeof fetch;
}

export interface ProviderHealth {
  readonly provider: 'gemini';
  readonly model: typeof PROVIDER_MODEL;
}

/** Verify the local server before persisting the AI-enabled setting. */
export async function checkProviderHealth(
  options: FetchTrapsOptions = {},
): Promise<Result<ProviderHealth>> {
  const doFetch = options.fetchImpl ?? globalThis.fetch;
  if (typeof doFetch !== 'function') return failure('PROVIDER_UNAVAILABLE');

  const controller = new AbortController();
  const timeoutMs = options.timeoutMs ?? PROVIDER_TIMEOUT_MS;
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let response: Response;
  try {
    response = await doFetch(PROVIDER_HEALTH_ENDPOINT, {
      method: 'GET',
      signal: controller.signal,
      credentials: 'omit',
      cache: 'no-store',
    });
  } catch (cause) {
    const aborted = cause instanceof Error && cause.name === 'AbortError';
    return failure(aborted ? 'PROVIDER_TIMEOUT' : 'PROVIDER_UNAVAILABLE');
  } finally {
    clearTimeout(timer);
  }

  if (!response.ok) return failure('PROVIDER_UNAVAILABLE');

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    return failure('PROVIDER_INVALID_RESPONSE');
  }

  const health = body as { ok?: unknown; provider?: unknown; model?: unknown };
  if (health.ok !== true || health.provider !== 'gemini' || health.model !== PROVIDER_MODEL) {
    return failure(
      'PROVIDER_DISABLED',
      `Start the local Gemini server with model ${PROVIDER_MODEL}, then try again.`,
    );
  }

  return success({ provider: 'gemini', model: PROVIDER_MODEL });
}

/**
 * Ask the local API for traps over the given sentences.
 *
 * Returns validated, sentence-bound candidates only. Anything the server sends that does not pass
 * the same validation the catalog passes is discarded — an invalid model
 * response can never reach the DOM.
 */
export async function fetchGeneratedTraps(
  sentences: readonly ProviderSentence[],
  options: FetchTrapsOptions = {},
): Promise<Result<GeneratedTrapCandidate[]>> {
  const endpoint = options.endpoint ?? PROVIDER_ENDPOINT;
  const timeoutMs = options.timeoutMs ?? PROVIDER_TIMEOUT_MS;
  const doFetch = options.fetchImpl ?? globalThis.fetch;

  if (typeof doFetch !== 'function') {
    return failure('PROVIDER_UNAVAILABLE', 'No fetch implementation is available.');
  }

  const payload = {
    sourceLocale: 'en' as const,
    targetLocale: 'fr-FR' as const,
    sentences: sentences.slice(0, PROVIDER_MAX_SENTENCES).map((sentence) => ({
      id: sentence.id,
      text: sentence.text.slice(0, PROVIDER_MAX_SENTENCE_LENGTH),
    })),
  };

  if (payload.sentences.length === 0) return success([]);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let response: Response;
  try {
    response = await doFetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
      // Never attach cookies or credentials to a generation call.
      credentials: 'omit',
      cache: 'no-store',
    });
  } catch (cause) {
    const aborted = cause instanceof Error && cause.name === 'AbortError';
    return failure(
      aborted ? 'PROVIDER_TIMEOUT' : 'PROVIDER_UNAVAILABLE',
      aborted
        ? `The generation API did not answer within ${timeoutMs}ms.`
        : 'The generation API could not be reached.',
    );
  } finally {
    clearTimeout(timer);
  }

  if (!response.ok) {
    return failure(codeForStatus(response.status), `Generation API returned ${response.status}.`);
  }

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    return failure('PROVIDER_INVALID_RESPONSE', 'Generation API returned malformed JSON.');
  }

  const candidates = (body as { candidates?: unknown }).candidates;
  if (!Array.isArray(candidates)) {
    return failure('PROVIDER_INVALID_RESPONSE', 'Generation API response had no candidates array.');
  }

  const sentencesById = new Map(payload.sentences.map((sentence) => [sentence.id, sentence.text]));
  const accepted: GeneratedTrapCandidate[] = [];
  for (const candidate of candidates.slice(0, PROVIDER_MAX_SENTENCES)) {
    if (typeof candidate !== 'object' || candidate === null) continue;
    const sentenceId = (candidate as { sentenceId?: unknown }).sentenceId;
    if (typeof sentenceId !== 'string') continue;
    const sentence = sentencesById.get(sentenceId);
    if (sentence === undefined) continue;

    const validated = validateTrap((candidate as { trap?: unknown }).trap, { untrusted: true });
    if (!validated.ok) continue;
    if (collapseWhitespace(validated.data.sentence) !== collapseWhitespace(sentence)) continue;

    accepted.push({ sentenceId, trap: validated.data });
  }

  return success(accepted);
}
