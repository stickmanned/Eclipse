import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    // happy-dom gives real text-node splitting, TreeWalker and MutationObserver,
    // which is the whole point of the DOM suite.
    environment: 'happy-dom',
    include: ['tests/unit/**/*.test.ts', 'tests/dom/**/*.test.{ts,tsx}', 'tests/api/**/*.test.ts'],
    globals: false,
    restoreMocks: true,
  },
});
