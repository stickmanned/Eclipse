import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { memoryArea, type StorageArea } from '@/storage/area';
import { ContentSession, type SessionHost } from '@/content/session';
import type { OverlayStore } from '@/content/overlay-store';
import type { OverlayCallbacks } from '@/content/session';

// Resolved from the project root rather than `import.meta.url`: under happy-dom
// the global URL is the DOM one, which refuses a file: scheme.
const DEMO_DIR = join(process.cwd(), 'demo');

export function loadDemo(name: 'demo-a.html' | 'demo-b.html'): string {
  return readFileSync(join(DEMO_DIR, name), 'utf8');
}

/** Replace the current document with the given HTML. */
export function renderHtml(html: string): Document {
  document.documentElement.innerHTML = html
    .replace(/^[\s\S]*?<html[^>]*>/i, '')
    .replace(/<\/html>[\s\S]*$/i, '');
  return document;
}

export function renderBody(bodyHtml: string): Document {
  document.documentElement.innerHTML = `<head></head><body>${bodyHtml}</body>`;
  return document;
}

export interface TestHost extends SessionHost {
  readonly mounts: { store: OverlayStore; callbacks: OverlayCallbacks }[];
  readonly styleInstalls: number;
  invalidations: number;
}

/**
 * A session host that records what the UI layer was asked to do without
 * rendering React. The DOM suite is about text nodes and restoration, not about
 * the overlay's markup.
 */
export function testHost(storage: StorageArea = memoryArea()): TestHost {
  const mounts: { store: OverlayStore; callbacks: OverlayCallbacks }[] = [];
  const host = {
    storage,
    mounts,
    styleInstalls: 0,
    invalidations: 0,
    mountOverlay(store: OverlayStore, callbacks: OverlayCallbacks) {
      mounts.push({ store, callbacks });
      return () => {
        const index = mounts.findIndex((entry) => entry.store === store);
        if (index >= 0) mounts.splice(index, 1);
      };
    },
    installTokenStyles(doc: Document) {
      const style = doc.createElement('style');
      style.setAttribute('data-eclipse-test-styles', '');
      (doc.head ?? doc.documentElement).append(style);
      host.styleInstalls += 1;
      return () => style.remove();
    },
    onInvalidated() {
      host.invalidations += 1;
    },
  };
  return host as TestHost;
}

export function newSession(storage?: StorageArea): {
  session: ContentSession;
  host: TestHost;
} {
  const host = testHost(storage);
  return { session: new ContentSession(document, host), host };
}

/** Wait for pending microtasks and MutationObserver callbacks. */
export async function flush(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 0));
}
