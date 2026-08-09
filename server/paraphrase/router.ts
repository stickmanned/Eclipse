/**
 * The loopback paraphrase endpoint, as a mountable Express router.
 *
 * A router rather than a second app, because Paraphrase Mode is a mode of the
 * same product on the same loopback port: a second server would mean a second
 * host permission in the manifest, and the narrow permission story is one of
 * the load-bearing claims Eclipse makes about itself.
 *
 * Logging policy, enforced by a test: event names, durations, counts and error
 * codes only. A submitted sentence or a generated French wording never reaches
 * a log line.
 */

import express, { Router, type Request, type Response } from 'express';
import { isAllowedOrigin } from '../origin-policy';
import { createRateLimiter, type RateLimiter } from '../rate-limit';
import { MAX_BODY_BYTES, paraphraseRequestSchema, toParaphraseItems } from './schema';
import type { ParaphraseProvider } from './gemini';

export interface ParaphraseRouterOptions {
  /** Absent means the endpoint answers 503 PROVIDER_DISABLED. */
  readonly provider?: ParaphraseProvider | undefined;
  /** Exact origins, or the Chrome-extension-scoped wildcard. */
  readonly allowedOrigins: readonly string[];
  readonly timeoutMs?: number;
  readonly rateLimiter?: RateLimiter;
  readonly log?: (line: string) => void;
  readonly now?: () => number;
}

/**
 * Longer than the Translate Mode ceiling.
 *
 * A paraphrase item asks the model for strictly more per sentence: a
 * substitutable French replacement that stays grammatical in place, two
 * distractors of matched register, and three French explanations. Reusing the
 * 18s budget turned a working batch into a timeout often enough to matter.
 */
export const DEFAULT_PARAPHRASE_TIMEOUT_MS = 25_000;

export function createParaphraseRouter(options: ParaphraseRouterOptions): Router {
  const router = Router();
  const limiter = options.rateLimiter ?? createRateLimiter();
  const timeoutMs = options.timeoutMs ?? DEFAULT_PARAPHRASE_TIMEOUT_MS;
  const log = options.log ?? ((line: string) => console.log(line));
  const now = options.now ?? (() => Date.now());

  // Harmless when the host app already parsed the body — body-parser marks the
  // request and returns early — and required when this router is mounted alone.
  router.use(express.json({ limit: MAX_BODY_BYTES, strict: true }));

  router.get('/api/paraphrase/health', (_request, response) => {
    response.json({
      ok: true,
      mode: 'paraphrase',
      provider: options.provider?.name ?? null,
      model: options.provider?.model ?? null,
    });
  });

  router.post('/api/paraphrase', (request, response) => {
    void handle(request, response);
  });

  async function handle(request: Request, response: Response): Promise<void> {
    const startedAt = now();

    const origin = request.get('origin');
    if (!isAllowedOrigin(origin, options.allowedOrigins)) {
      log('event=paraphrase_rejected reason=origin_not_allowed');
      fail(response, 403, 'PROVIDER_PERMISSION_DENIED', 'Origin is not allowed.');
      return;
    }

    if (!limiter.take(origin ?? 'no-origin', now())) {
      log('event=paraphrase_rejected reason=rate_limited');
      fail(response, 429, 'PROVIDER_UNAVAILABLE', 'Too many requests. Try again shortly.');
      return;
    }

    const parsed = paraphraseRequestSchema.safeParse(request.body);
    if (!parsed.success) {
      log('event=paraphrase_rejected reason=schema');
      fail(response, 400, 'PROVIDER_INVALID_RESPONSE', 'Request did not match the schema.');
      return;
    }

    if (!options.provider) {
      log('event=paraphrase_rejected reason=provider_disabled');
      fail(response, 503, 'PROVIDER_DISABLED', 'No generation provider is configured.');
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    let outcome;
    try {
      outcome = await options.provider.generate(parsed.data, controller.signal);
    } catch {
      clearTimeout(timer);
      log('event=paraphrase_provider_error reason=threw');
      fail(response, 503, 'PROVIDER_UNAVAILABLE', 'The generation provider failed.');
      return;
    } finally {
      clearTimeout(timer);
    }

    switch (outcome.kind) {
      case 'disabled':
        log('event=paraphrase_provider_disabled');
        fail(response, 503, 'PROVIDER_DISABLED', 'No generation provider is configured.');
        return;
      case 'timeout':
        log(`event=paraphrase_provider_timeout duration_ms=${now() - startedAt}`);
        fail(response, 504, 'PROVIDER_TIMEOUT', 'The generation provider timed out.');
        return;
      case 'unavailable':
        log('event=paraphrase_provider_unavailable');
        fail(response, 503, 'PROVIDER_UNAVAILABLE', 'The generation provider is unavailable.');
        return;
      case 'invalid':
        log('event=paraphrase_provider_invalid_output');
        fail(response, 502, 'PROVIDER_INVALID_RESPONSE', 'The provider returned invalid output.');
        return;
      case 'ok':
        break;
    }

    // --- second validation pass, on the model's own output ------------------
    const { candidates, rejected } = toParaphraseItems(outcome.output, parsed.data);

    log(
      `event=paraphrases_generated mode=${parsed.data.mode} ` +
        `sentences=${parsed.data.sentences.length} accepted=${candidates.length} ` +
        `rejected=${rejected.length} duration_ms=${now() - startedAt}`,
    );

    response.status(200).json({ candidates });
  }

  return router;
}

function fail(response: Response, status: number, code: string, message: string): void {
  response.status(status).json({
    ok: false,
    error: { code, message, recoverable: status !== 500 },
  });
}
