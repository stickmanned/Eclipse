/**
 * In-memory rate limiting.
 *
 * Deliberately process-local and unpersisted: this server is a localhost
 * developer convenience, not shared infrastructure. The limit exists so a
 * runaway loop cannot burn an API budget, not to defend a public endpoint.
 */

export interface RateLimiter {
  /** True when the caller is within budget. Consumes one unit when it is. */
  take(key: string, now: number): boolean;
  reset(): void;
}

export const RATE_LIMIT_PER_MINUTE = 60;
export const RATE_WINDOW_MS = 60_000;

export function createRateLimiter(
  limit = RATE_LIMIT_PER_MINUTE,
  windowMs = RATE_WINDOW_MS,
): RateLimiter {
  const hits = new Map<string, number[]>();

  return {
    take(key, now) {
      const window = (hits.get(key) ?? []).filter((at) => now - at < windowMs);
      if (window.length >= limit) {
        hits.set(key, window);
        return false;
      }
      window.push(now);
      hits.set(key, window);
      return true;
    },
    reset() {
      hits.clear();
    },
  };
}
