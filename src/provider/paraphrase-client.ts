/**
 * Client for the loopback paraphrase generation API.
 *
 * Same posture as `client.ts`: hard timeout, one automatic recovery attempt,
 * credentials never attached, and nothing the server returns is trusted until
 * it has passed the same validation an item would need to be written by hand.
 *
 * What leaves the browser: French sentences from the page, in batches of at
 * most eight, plus the learner's current complexity window and the short list
 * of wordings they have previously missed. Never the page address, never the
 * profile itself, never answer history.
 *
 * The reinforcement list is the one thing here that is derived from learner
 * history, and it is deliberately narrow: bare French wordings the learner
 * already failed, with no timestamps, no counts and no ordering that could
 * reconstruct a session.
 */

import { LOCAL_API_MESSAGE, failure, success, type Result } from '../domain/errors';
import { collapseWhitespace } from '../domain/normalize';
import {
  validateParaphraseItem,
  type GeneratedParaphraseCandidate,
  type ParaphraseRegister,
} from '../domain/paraphrase';
import {
  PROVIDER_ORIGIN,
  PROVIDER_MAX_ATTEMPTS,
  PROVIDER_MAX_SENTENCES,
  PROVIDER_MAX_SENTENCE_LENGTH,
  PROVIDER_TIMEOUT_MS,
} from '../storage/provider-settings';
import type { StorageArea } from '../storage/area';
import {
  getCachedParaphrasesBatch,
  paraphraseCacheScope,
  setCachedParaphrasesBatch,
} from '../storage/paraphrase-cache';

export const PARAPHRASE_ENDPOINT = `${PROVIDER_ORIGIN}/api/paraphrase`;

export interface ParaphraseSentence {
  readonly id: string;
  readonly text: string;
}

export interface ParaphraseRequestContext {
  /** Complexity Eclipse is aiming at, and the window it will accept. */
  readonly target: number;
  readonly window: readonly [number, number];
  readonly focusRegisters: readonly ParaphraseRegister[];
  /** Bare wordings the learner previously missed. Bounded and unordered by date. */
  readonly reinforce: readonly string[];
}

export interface FetchParaphrasesOptions {
  readonly endpoint?: string;
  readonly timeoutMs?: number;
  readonly fetchImpl?: typeof fetch;
  readonly maxAttempts?: number;
  readonly retryDelayMs?: number;
}

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

function isRetryableStatus(status: number): boolean {
  return status === 429 || status === 500 || status === 502 || status === 503 || status === 504;
}

async function waitBeforeRetry(
  options: FetchParaphrasesOptions,
  seed: string,
  attempt: number,
): Promise<void> {
  const configured = options.retryDelayMs;
  const stableJitter = Array.from(seed).reduce((sum, char) => sum + char.charCodeAt(0), 0) % 200;
  const delayMs = configured ?? 300 * 2 ** attempt + stableJitter;
  if (delayMs <= 0) return;
  await new Promise<void>((resolve) => setTimeout(resolve, delayMs));
}

interface RequestBody {
  readonly locale: 'fr-FR';
  readonly mode: 'auto' | 'manual';
  readonly complexity: { readonly target: number; readonly min: number; readonly max: number };
  readonly focusRegisters: readonly ParaphraseRegister[];
  readonly reinforce: readonly string[];
  readonly sentences: readonly ParaphraseSentence[];
  readonly selection?: string;
}

/**
 * One POST, with retry, returning only items that pass full validation and are
 * bound to a sentence that was actually submitted.
 */
async function post(
  body: RequestBody,
  options: FetchParaphrasesOptions,
): Promise<Result<GeneratedParaphraseCandidate[]>> {
  const endpoint = options.endpoint ?? PARAPHRASE_ENDPOINT;
  const timeoutMs = options.timeoutMs ?? PROVIDER_TIMEOUT_MS;
  const doFetch = options.fetchImpl ?? globalThis.fetch;

  if (typeof doFetch !== 'function') {
    return failure('PROVIDER_UNAVAILABLE', 'No fetch implementation is available.');
  }
  if (body.sentences.length === 0) return success([]);

  const maxAttempts = Math.max(1, Math.min(3, options.maxAttempts ?? PROVIDER_MAX_ATTEMPTS));
  const seed = body.sentences[0]?.id ?? '';
  let lastFailure: Result<GeneratedParaphraseCandidate[]> = failure('PROVIDER_UNAVAILABLE');

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    let response: Response;
    try {
      response = await doFetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal,
        credentials: 'omit',
        cache: 'no-store',
      });
    } catch (cause) {
      const aborted = cause instanceof Error && cause.name === 'AbortError';
      lastFailure = failure(
        aborted ? 'PROVIDER_TIMEOUT' : 'PROVIDER_UNAVAILABLE',
        aborted
          ? `The paraphrase API did not answer within ${timeoutMs}ms after automatic recovery.`
          : LOCAL_API_MESSAGE,
      );
      clearTimeout(timer);
      if (attempt + 1 < maxAttempts) {
        await waitBeforeRetry(options, seed, attempt);
        continue;
      }
      return lastFailure;
    }
    clearTimeout(timer);

    if (!response.ok) {
      lastFailure = failure(
        codeForStatus(response.status),
        `Paraphrase API returned ${response.status} after automatic recovery.`,
      );
      if (attempt + 1 < maxAttempts && isRetryableStatus(response.status)) {
        await waitBeforeRetry(options, seed, attempt);
        continue;
      }
      return lastFailure;
    }

    let payload: unknown;
    try {
      payload = await response.json();
    } catch {
      lastFailure = failure(
        'PROVIDER_INVALID_RESPONSE',
        'Paraphrase API returned malformed JSON after automatic recovery.',
      );
      if (attempt + 1 < maxAttempts) {
        await waitBeforeRetry(options, seed, attempt);
        continue;
      }
      return lastFailure;
    }

    const raw = (payload as { candidates?: unknown }).candidates;
    if (!Array.isArray(raw)) {
      lastFailure = failure(
        'PROVIDER_INVALID_RESPONSE',
        'Paraphrase API response had no candidates array after automatic recovery.',
      );
      if (attempt + 1 < maxAttempts) {
        await waitBeforeRetry(options, seed, attempt);
        continue;
      }
      return lastFailure;
    }

    const byId = new Map(body.sentences.map((sentence) => [sentence.id, sentence.text]));
    const accepted: GeneratedParaphraseCandidate[] = [];

    for (const candidate of raw.slice(0, PROVIDER_MAX_SENTENCES)) {
      if (typeof candidate !== 'object' || candidate === null) continue;
      const sentenceId = (candidate as { sentenceId?: unknown }).sentenceId;
      if (typeof sentenceId !== 'string') continue;
      const sentence = byId.get(sentenceId);
      if (sentence === undefined) continue;

      const validated = validateParaphraseItem((candidate as { item?: unknown }).item);
      if (!validated.ok) continue;
      // A model cannot invent a sentence or attach an item to text we never
      // sent: the item's sentence must be the one submitted under that id.
      if (collapseWhitespace(validated.data.sentence) !== collapseWhitespace(sentence)) continue;

      accepted.push({ sentenceId, item: validated.data });
    }

    return success(accepted);
  }

  return lastFailure;
}

/** Ask for one automatic item per usable sentence. */
export async function fetchParaphrases(
  sentences: readonly ParaphraseSentence[],
  context: ParaphraseRequestContext,
  options: FetchParaphrasesOptions = {},
): Promise<Result<GeneratedParaphraseCandidate[]>> {
  return post(
    {
      locale: 'fr-FR',
      mode: 'auto',
      complexity: { target: context.target, min: context.window[0], max: context.window[1] },
      focusRegisters: context.focusRegisters,
      reinforce: context.reinforce,
      sentences: sentences.slice(0, PROVIDER_MAX_SENTENCES).map((sentence) => ({
        id: sentence.id,
        text: sentence.text.slice(0, PROVIDER_MAX_SENTENCE_LENGTH),
      })),
    },
    options,
  );
}

/**
 * Paraphrase exactly what the learner selected.
 *
 * The selection is authoritative here in a way it never is for automatic
 * items: the learner pointed at this span, so the model is told to simplify it
 * rather than to choose something in the sentence it finds more interesting.
 */
export async function fetchSelectionParaphrase(
  sentence: string,
  selection: string,
  context: ParaphraseRequestContext,
  options: FetchParaphrasesOptions = {},
): Promise<Result<GeneratedParaphraseCandidate[]>> {
  return post(
    {
      locale: 'fr-FR',
      mode: 'manual',
      complexity: { target: context.target, min: 0, max: 1 },
      focusRegisters: context.focusRegisters,
      reinforce: context.reinforce,
      sentences: [{ id: 'sel', text: sentence.slice(0, PROVIDER_MAX_SENTENCE_LENGTH) }],
      selection: selection.slice(0, 160),
    },
    options,
  );
}

export type ParaphraseFetcher = (
  sentences: readonly ParaphraseSentence[],
  context: ParaphraseRequestContext,
) => Promise<Result<GeneratedParaphraseCandidate[]>>;

/**
 * Cache-aware generation.
 *
 * Identical in shape to `generate-with-cache.ts`: one batched lookup, one
 * batched write, and a cache hit that survives a provider outage. A partial
 * result beats a typed failure whenever anything at all was cached, because a
 * page with three paraphrases is useful and a page with an error banner is not.
 */
export async function generateParaphrasesWithCache(
  sentences: readonly ParaphraseSentence[],
  context: ParaphraseRequestContext,
  area: StorageArea,
  fetcher: ParaphraseFetcher = fetchParaphrases,
  now: () => Date = () => new Date(),
): Promise<Result<GeneratedParaphraseCandidate[]>> {
  const scope = paraphraseCacheScope(context.target);
  const bySentenceId = new Map<string, GeneratedParaphraseCandidate[]>();
  const misses: ParaphraseSentence[] = [];

  const hits = await getCachedParaphrasesBatch(
    area,
    sentences.map((sentence) => sentence.text),
    now(),
    scope,
  );

  for (const sentence of sentences) {
    const cached = hits.get(sentence.text);
    if (!cached) {
      misses.push(sentence);
      continue;
    }
    bySentenceId.set(
      sentence.id,
      cached.map((item) => ({ sentenceId: sentence.id, item })),
    );
  }

  if (misses.length === 0) return success(inCallerOrder(sentences, bySentenceId));

  const fetched = await fetcher(misses, context);
  if (!fetched.ok) {
    const cachedOnly = inCallerOrder(sentences, bySentenceId);
    return cachedOnly.length > 0 ? success(cachedOnly) : fetched;
  }

  const missedIds = new Set(misses.map((sentence) => sentence.id));
  for (const candidate of fetched.data) {
    if (!missedIds.has(candidate.sentenceId)) continue;
    const current = bySentenceId.get(candidate.sentenceId) ?? [];
    current.push(candidate);
    bySentenceId.set(candidate.sentenceId, current);
  }

  const toStore: { sentence: string; items: GeneratedParaphraseCandidate['item'][] }[] = [];
  for (const sentence of misses) {
    const generated = bySentenceId.get(sentence.id) ?? [];
    if (generated.length === 0) continue;
    toStore.push({ sentence: sentence.text, items: generated.map((entry) => entry.item) });
  }
  await setCachedParaphrasesBatch(area, toStore, now(), scope);

  return success(inCallerOrder(sentences, bySentenceId));
}

function inCallerOrder(
  sentences: readonly ParaphraseSentence[],
  bySentenceId: ReadonlyMap<string, readonly GeneratedParaphraseCandidate[]>,
): GeneratedParaphraseCandidate[] {
  return sentences.flatMap((sentence) => [...(bySentenceId.get(sentence.id) ?? [])]);
}
