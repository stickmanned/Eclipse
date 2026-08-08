/**
 * `page.evaluate` / `worker.evaluate` callbacks are type-checked here but run in
 * the browser, where `chrome` is a global. WXT's typings describe it.
 */
import type { browser } from 'wxt/browser';

declare global {
  const chrome: typeof browser;
}

export {};
