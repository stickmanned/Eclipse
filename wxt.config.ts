import { defineConfig } from 'wxt';

/**
 * Permission policy (see docs/PRIVACY.md):
 *
 * - `activeTab`  — temporary access to the tab the user clicked Eclipse on.
 * - `scripting`  — inject the Eclipse runtime on demand (never declaratively).
 * - `storage`    — learner profile in `storage.local`, session state in `storage.session`.
 *
 * `optional_host_permissions` holds the local generation API only. It is requested
 * at the moment the user enables AI-generated traps and never before.
 *
 * The Eclipse content script is declared with `registration: "runtime"` and no
 * `matches`, so WXT emits it as a bundle file without adding any host permission
 * and without a `content_scripts` manifest entry.
 *
 * ---
 *
 * E2E variant (`ECLIPSE_E2E=true`)
 *
 * `activeTab` is granted by a real click on the toolbar button. No automation
 * driver can produce that click — browser chrome is outside the page — so an
 * automated Chrome never gets the grant, which means `tab.url` stays redacted
 * and `scripting.executeScript` is refused. That is a property of `activeTab`,
 * not a bug in Eclipse.
 *
 * So the E2E build adds two narrow loopback host permissions: the demo pages
 * and the fake generation API. It writes to a separate output directory. Everything else —
 * every line of product code, the content script, the worker, the popup — is
 * byte-identical. `tests/e2e/manifest.spec.ts` audits the real production
 * manifest from disk and asserts this permission is absent from it.
 */
const isE2E = process.env.ECLIPSE_E2E === 'true';

const E2E_DEMO_ORIGIN = 'http://127.0.0.1:4321/*';
const PROVIDER_ORIGIN = 'http://localhost:8787/*';

export default defineConfig({
  srcDir: 'src',
  modules: ['@wxt-dev/module-react'],
  outDir: isE2E ? '.output-e2e' : '.output',
  manifest: {
    name: isE2E ? 'Eclipse — Context Traps (E2E)' : 'Eclipse — Context Traps',
    description:
      'Turn any English article into a French context exercise. Hide the familiar meaning, infer the truth from context, reveal the evidence.',
    permissions: ['activeTab', 'scripting', 'storage'],
    ...(isE2E
      ? { host_permissions: [E2E_DEMO_ORIGIN, PROVIDER_ORIGIN] }
      : { optional_host_permissions: [PROVIDER_ORIGIN] }),
    minimum_chrome_version: '120',
  },
  hooks: {
    /**
     * Eclipse registers no declarative content scripts, so WXT emits an empty
     * `content_scripts: []`. Dropping it keeps the shipped manifest an exact,
     * auditable statement of what the extension asks for.
     */
    'build:manifestGenerated'(_wxt, manifest) {
      if (Array.isArray(manifest.content_scripts) && manifest.content_scripts.length === 0) {
        delete manifest.content_scripts;
      }
    },
  },
});
