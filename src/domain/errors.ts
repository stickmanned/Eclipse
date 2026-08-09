/**
 * Typed failure vocabulary shared by the popup, background worker, content
 * runtime and the loopback generation API.
 *
 * Every boundary in Eclipse returns a `Result`, never a thrown value. Callers
 * branch on `ok` and, when it is `false`, on `error.code`.
 */

export const ERROR_CODES = [
  'UNSUPPORTED_URL',
  'NO_ARTICLE',
  'NO_ELIGIBLE_TRAPS',
  'CONTENT_SCRIPT_UNAVAILABLE',
  'SESSION_REPLACED',
  'DOM_INVALIDATED',
  'STORAGE_ERROR',
  'PROFILE_INCOMPATIBLE',
  'PROVIDER_DISABLED',
  'PROVIDER_PERMISSION_DENIED',
  'PROVIDER_UNAVAILABLE',
  'PROVIDER_TIMEOUT',
  'PROVIDER_INVALID_RESPONSE',
  'MESSAGE_UNSUPPORTED',
  'UNKNOWN_ERROR',
] as const;

export type ErrorCode = (typeof ERROR_CODES)[number];

/**
 * The one thing a learner can actually do about a message the extension does
 * not understand. Chrome keeps a previously registered service worker alive
 * across a rebuild, so a freshly built popup can end up talking to a worker
 * compiled from older source; reloading the extension re-registers both halves
 * from the same build.
 */
/**
 * Eclipse's AI generation runs on a server the learner starts themselves, so
 * "unreachable" has exactly one common cause and exactly one fix. Saying only
 * that the API could not be reached leaves someone guessing between a stopped
 * process, a missing key and a broken network; naming the command does not.
 */
export const LOCAL_API_MESSAGE =
  'Eclipse could not reach its local AI service on http://localhost:8787. Start it with "npm run api" in the Eclipse project, then press Start Eclipse again.';

export const STALE_WORKER_MESSAGE =
  'Eclipse is still finishing an update, so its background worker did not understand that request. Reload Eclipse to finish updating.';

export interface EclipseFailureDetail {
  code: ErrorCode;
  message: string;
  recoverable: boolean;
}

export type Success<T> = { ok: true; data: T };

export type Failure = { ok: false; error: EclipseFailureDetail };

export type Result<T> = Success<T> | Failure;

/**
 * Whether a code describes a condition the user can act on without reloading
 * the extension. Recoverable failures are surfaced as inline popup status;
 * unrecoverable ones end the session.
 */
const RECOVERABLE_BY_DEFAULT: Readonly<Record<ErrorCode, boolean>> = {
  UNSUPPORTED_URL: true,
  NO_ARTICLE: true,
  NO_ELIGIBLE_TRAPS: true,
  CONTENT_SCRIPT_UNAVAILABLE: true,
  SESSION_REPLACED: true,
  DOM_INVALIDATED: false,
  STORAGE_ERROR: true,
  PROFILE_INCOMPATIBLE: false,
  PROVIDER_DISABLED: true,
  PROVIDER_PERMISSION_DENIED: true,
  PROVIDER_UNAVAILABLE: true,
  PROVIDER_TIMEOUT: true,
  PROVIDER_INVALID_RESPONSE: true,
  MESSAGE_UNSUPPORTED: true,
  UNKNOWN_ERROR: false,
};

/** Human-readable default copy. Callers may override with something specific. */
const DEFAULT_MESSAGE: Readonly<Record<ErrorCode, string>> = {
  UNSUPPORTED_URL: 'Eclipse only runs on regular http(s) web pages.',
  NO_ARTICLE: 'No readable article was found on this page.',
  NO_ELIGIBLE_TRAPS:
    'Eclipse could not prepare level-matched French vocabulary for this article. Check that the AI service is running, then retry.',
  CONTENT_SCRIPT_UNAVAILABLE: 'Eclipse could not attach to this tab. Reload the page and retry.',
  SESSION_REPLACED: 'Eclipse moved to another tab.',
  DOM_INVALIDATED: 'The page changed underneath Eclipse, so the session was ended safely.',
  STORAGE_ERROR: 'Your progress could not be saved.',
  PROFILE_INCOMPATIBLE: 'Saved learning data was written by a newer version of Eclipse.',
  PROVIDER_DISABLED: 'The AI vocabulary service is not configured.',
  PROVIDER_PERMISSION_DENIED: 'Permission for the local generation API was not granted.',
  PROVIDER_UNAVAILABLE: LOCAL_API_MESSAGE,
  PROVIDER_TIMEOUT: 'The local generation API took too long.',
  PROVIDER_INVALID_RESPONSE: 'The local generation API returned something Eclipse cannot trust.',
  MESSAGE_UNSUPPORTED: STALE_WORKER_MESSAGE,
  UNKNOWN_ERROR: 'Something unexpected happened.',
};

export function success<T>(data: T): Success<T> {
  return { ok: true, data };
}

export function failure(code: ErrorCode, message?: string, recoverable?: boolean): Failure {
  return {
    ok: false,
    error: {
      code,
      message: message ?? DEFAULT_MESSAGE[code],
      recoverable: recoverable ?? RECOVERABLE_BY_DEFAULT[code],
    },
  };
}

/** An error carrying an Eclipse code, for the few places a throw is natural. */
export class EclipseError extends Error {
  readonly code: ErrorCode;
  readonly recoverable: boolean;

  constructor(code: ErrorCode, message?: string, recoverable?: boolean) {
    super(message ?? DEFAULT_MESSAGE[code]);
    this.name = 'EclipseError';
    this.code = code;
    this.recoverable = recoverable ?? RECOVERABLE_BY_DEFAULT[code];
  }

  toFailure(): Failure {
    return failure(this.code, this.message, this.recoverable);
  }
}

export function isErrorCode(value: unknown): value is ErrorCode {
  return typeof value === 'string' && (ERROR_CODES as readonly string[]).includes(value);
}

/** Normalise anything caught in a `catch` into a `Failure`. */
export function toFailure(cause: unknown, fallback: ErrorCode = 'UNKNOWN_ERROR'): Failure {
  if (cause instanceof EclipseError) return cause.toFailure();
  if (cause instanceof Error) return failure(fallback, cause.message);
  return failure(fallback);
}
