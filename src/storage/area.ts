/**
 * A minimal storage-area interface.
 *
 * The rest of the storage layer talks to this rather than to the extension
 * storage API directly, so unit tests can drive it with an in-memory area and so a failing
 * write surfaces as `STORAGE_ERROR` rather than an unhandled rejection.
 */

import type { Browser } from 'wxt/browser';
import { failure, success, type Result } from '../domain/errors';

export interface StorageArea {
  get(key: string): Promise<unknown>;
  set(key: string, value: unknown): Promise<void>;
  remove(key: string): Promise<void>;
}

/** Wraps a `browser.storage` area. */
export function chromeArea(area: Browser.storage.StorageArea): StorageArea {
  return {
    async get(key) {
      const result = await area.get(key);
      return result[key];
    },
    async set(key, value) {
      await area.set({ [key]: value });
    },
    async remove(key) {
      await area.remove(key);
    },
  };
}

/** In-memory area for tests and for the rare case where storage is missing. */
export function memoryArea(initial: Record<string, unknown> = {}): StorageArea {
  const store = new Map<string, unknown>(Object.entries(initial));
  return {
    async get(key) {
      return store.get(key);
    },
    async set(key, value) {
      store.set(key, structuredClone(value));
    },
    async remove(key) {
      store.delete(key);
    },
  };
}

/** Run a storage operation, converting any throw into a typed `STORAGE_ERROR`. */
export async function guarded<T>(work: () => Promise<T>): Promise<Result<T>> {
  try {
    return success(await work());
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : 'storage operation failed';
    return failure('STORAGE_ERROR', message);
  }
}
