/**
 * Identifier generation.
 *
 * `sessionId` is minted per activation; `interactionId` per answer. Both are
 * random and local — they are never sent anywhere and are not stable across
 * installs, so they cannot identify a user.
 */

const ID_ALPHABET = 'abcdefghijklmnopqrstuvwxyz0123456789';

function randomToken(length: number): string {
  const bytes = new Uint8Array(length);
  globalThis.crypto.getRandomValues(bytes);
  let out = '';
  for (const byte of bytes) {
    out += ID_ALPHABET[byte % ID_ALPHABET.length];
  }
  return out;
}

export function createSessionId(): string {
  return `ses_${randomToken(16)}`;
}

export function createInteractionId(): string {
  return `int_${randomToken(16)}`;
}

/**
 * Deterministic id for a placed trap: concept plus where it landed. Two runs
 * over the same article produce the same ids, which is what keeps the E2E
 * assertions and the selection tie-break stable.
 */
export function createTrapId(conceptId: string, blockIndex: number, offset: number): string {
  return `${conceptId}@${blockIndex}:${offset}`;
}

/** A short, stable, non-cryptographic hash. Used for cache keys only. */
export function stableHash(value: string): string {
  let h1 = 0x811c9dc5;
  let h2 = 0x01000193;
  for (let i = 0; i < value.length; i += 1) {
    const code = value.charCodeAt(i);
    h1 = Math.imul(h1 ^ code, 0x01000193);
    h2 = Math.imul(h2 + code, 0x85ebca6b) ^ (h2 >>> 13);
  }
  const a = (h1 >>> 0).toString(36);
  const b = (h2 >>> 0).toString(36);
  return `${a}${b}`;
}
