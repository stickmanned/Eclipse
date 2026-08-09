/**
 * The loopback learning-item generation API.
 *
 * Eclipse uses this server for broad, level-matched vocabulary coverage. The
 * bundled catalog remains a safe fallback when a page happens to match it.
 *
 * Logging policy, enforced by a test: event names, durations, counts and error
 * codes only. A submitted sentence or a generated French surface never reaches
 * a log line.
 */

import express, { type Express, type Request, type Response } from 'express';
import { MAX_BODY_BYTES, requestSchema, toContextTraps } from './schema';
import { createRateLimiter, type RateLimiter } from './rate-limit';
import type { TrapProvider } from './providers/types';
import { isAllowedOrigin } from './origin-policy';

export interface AppOptions {
  /** Absent means the endpoint answers 503 PROVIDER_DISABLED. */
  readonly provider?: TrapProvider | undefined;
  /** Exact origins, or the Chrome-extension-scoped wildcard, allowed to call the endpoint. */
  readonly allowedOrigins: readonly string[];
  /** Server-side ceiling on a provider call. */
  readonly timeoutMs?: number;
  readonly rateLimiter?: RateLimiter;
  readonly log?: (line: string) => void;
  readonly now?: () => number;
}

export const DEFAULT_SERVER_TIMEOUT_MS = 18_000;

export function createApp(options: AppOptions): Express {
  const app = express();
  const limiter = options.rateLimiter ?? createRateLimiter();
  const timeoutMs = options.timeoutMs ?? DEFAULT_SERVER_TIMEOUT_MS;
  const log = options.log ?? ((line: string) => console.log(line));
  const now = options.now ?? (() => Date.now());

  app.disable('x-powered-by');
  app.use(express.json({ limit: MAX_BODY_BYTES, strict: true }));

  app.get('/health', (_request, response) => {
    response.json({
      ok: true,
      provider: options.provider?.name ?? null,
      model: options.provider?.model ?? null,
    });
  });

  app.post('/api/context-traps', (request, response) => {
    void handleContextTraps(request, response);
  });

  // Body-parser failures (oversized or malformed JSON) become typed 400s.
  app.use(
    (
      error: unknown,
      _request: Request,
      response: Response,
      next: (error?: unknown) => void,
    ): void => {
      if (response.headersSent) {
        next(error);
        return;
      }
      const status = (error as { status?: number } | null)?.status;
      if (status === 413) {
        log('event=request_rejected reason=payload_too_large');
        fail(response, 400, 'PROVIDER_INVALID_RESPONSE', 'Request body is too large.');
        return;
      }
      if (status === 400 || error instanceof SyntaxError) {
        log('event=request_rejected reason=malformed_json');
        fail(response, 400, 'PROVIDER_INVALID_RESPONSE', 'Request body is not valid JSON.');
        return;
      }
      next(error);
    },
  );

  async function handleContextTraps(request: Request, response: Response): Promise<void> {
    const startedAt = now();

    // --- origin allowlist ---------------------------------------------------
    const origin = request.get('origin');
    if (!isAllowedOrigin(origin, options.allowedOrigins)) {
      log('event=request_rejected reason=origin_not_allowed');
      fail(response, 403, 'PROVIDER_PERMISSION_DENIED', 'Origin is not allowed.');
      return;
    }

    // --- rate limit ---------------------------------------------------------
    if (!limiter.take(origin ?? 'no-origin', now())) {
      log('event=request_rejected reason=rate_limited');
      fail(response, 429, 'PROVIDER_UNAVAILABLE', 'Too many requests. Try again shortly.');
      return;
    }

    // --- request shape ------------------------------------------------------
    const parsed = requestSchema.safeParse(request.body);
    if (!parsed.success) {
      log('event=request_rejected reason=schema');
      fail(response, 400, 'PROVIDER_INVALID_RESPONSE', 'Request did not match the schema.');
      return;
    }

    // --- provider availability ---------------------------------------------
    if (!options.provider) {
      log('event=request_rejected reason=provider_disabled');
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
      log('event=provider_error reason=threw');
      fail(response, 503, 'PROVIDER_UNAVAILABLE', 'The generation provider failed.');
      return;
    } finally {
      clearTimeout(timer);
    }

    switch (outcome.kind) {
      case 'disabled':
        log('event=provider_disabled');
        fail(response, 503, 'PROVIDER_DISABLED', 'No generation provider is configured.');
        return;
      case 'timeout':
        log(`event=provider_timeout duration_ms=${now() - startedAt}`);
        fail(response, 504, 'PROVIDER_TIMEOUT', 'The generation provider timed out.');
        return;
      case 'unavailable':
        log('event=provider_unavailable');
        fail(response, 503, 'PROVIDER_UNAVAILABLE', 'The generation provider is unavailable.');
        return;
      case 'invalid':
        log('event=provider_invalid_output');
        fail(response, 502, 'PROVIDER_INVALID_RESPONSE', 'The provider returned invalid output.');
        return;
      case 'ok':
        break;
    }

    // --- second validation pass, on the model's own output ------------------
    const { candidates, rejected } = toContextTraps(outcome.output, parsed.data);

    log(
      `event=traps_generated sentences=${parsed.data.sentences.length} ` +
        `accepted=${candidates.length} rejected=${rejected.length} duration_ms=${now() - startedAt}`,
    );

    response.status(200).json({ candidates });
  }

  return app;
}

function fail(response: Response, status: number, code: string, message: string): void {
  response.status(status).json({
    ok: false,
    error: { code, message, recoverable: status !== 500 },
  });
}
