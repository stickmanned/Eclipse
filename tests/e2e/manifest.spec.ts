/**
 * Permission audit of the SHIPPED build.
 *
 * The rest of the E2E suite runs against `.output-e2e`, which adds only the two
 * loopback demo host in addition to the production AI service host. This file
 * reads the real `.output/chrome-mv3/manifest.json` from disk and audits that
 * narrow permission boundary.
 */

import { existsSync } from 'node:fs';
import { PRODUCTION_MANIFEST_PATH, expect, readProductionManifest, test } from './fixtures';

test.describe('the shipped manifest', () => {
  test('asks for exactly three capabilities and one loopback AI host', () => {
    expect(existsSync(PRODUCTION_MANIFEST_PATH), 'run "npm run build" first').toBe(true);
    const manifest = readProductionManifest();

    expect((manifest.permissions as string[]).slice().sort()).toEqual([
      'activeTab',
      'scripting',
      'storage',
    ]);

    expect(manifest.host_permissions).toEqual(['http://localhost:8787/*']);
    expect(manifest.optional_permissions).toBeUndefined();
    expect(manifest.optional_host_permissions).toBeUndefined();

    // No declarative content scripts and nothing exposed to pages.
    expect(manifest.content_scripts).toBeUndefined();
    expect(manifest.web_accessible_resources).toBeUndefined();

    expect(manifest.manifest_version).toBe(3);
    expect(manifest.minimum_chrome_version).toBe('120');
  });

  test('never requests a forbidden permission', () => {
    const manifest = readProductionManifest();
    const serialized = JSON.stringify(manifest);

    for (const banned of [
      '<all_urls>',
      '"tabs"',
      '"history"',
      '"cookies"',
      '"unlimitedStorage"',
      '"webRequest"',
      '"declarativeNetRequest"',
      '"management"',
      '"downloads"',
      '"bookmarks"',
    ]) {
      expect(serialized.includes(banned), `manifest contains ${banned}`).toBe(false);
    }
  });

  test('carries no secrets', () => {
    const serialized = JSON.stringify(readProductionManifest());
    for (const secret of ['OPENAI', 'api_key', 'apiKey', 'AIza', 'sk-', 'AQ.']) {
      expect(serialized.includes(secret), `manifest contains ${secret}`).toBe(false);
    }
  });
});
