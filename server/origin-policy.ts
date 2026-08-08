/** Origin authorization for the loopback-only generation API. */

/**
 * Opt in to any valid Chrome extension ID without accepting web-origin
 * wildcards. Unpacked builds can receive a different ID when their load path
 * changes, so tying the local API to one historical ID is brittle.
 */
export const ANY_CHROME_EXTENSION_ORIGIN = 'chrome-extension://*';

const CHROME_EXTENSION_ORIGIN = /^chrome-extension:\/\/[a-p]{32}$/;

export function isAllowedOrigin(
  origin: string | undefined,
  allowedOrigins: readonly string[],
): boolean {
  // A same-process request (Supertest or curl without Origin) is not a browser
  // page. Browsers always send an Origin for the extension's POST request.
  if (origin === undefined) return true;
  if (allowedOrigins.includes(origin)) return true;
  return (
    allowedOrigins.includes(ANY_CHROME_EXTENSION_ORIGIN) && CHROME_EXTENSION_ORIGIN.test(origin)
  );
}
