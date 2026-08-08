/**
 * Entry point for `npm run api`.
 *
 * Reads configuration from the environment, binds to loopback only, and starts
 * with the provider disabled unless one has been explicitly configured. Missing
 * configuration is a normal, supported state — the endpoint answers 503 and
 * Eclipse carries on with the catalog.
 */

import { createApp, DEFAULT_SERVER_TIMEOUT_MS } from './app';
import { loadLocalEnvironment, resolveOrigins, resolveProvider } from './config';

loadLocalEnvironment();

const PORT = Number(process.env.ECLIPSE_API_PORT ?? 8787);
const HOST = '127.0.0.1';

const provider = resolveProvider();
const allowedOrigins = resolveOrigins();

const app = createApp({
  provider,
  allowedOrigins,
  timeoutMs: DEFAULT_SERVER_TIMEOUT_MS,
});

app.listen(PORT, HOST, () => {
  console.log(`Eclipse generation API on http://${HOST}:${PORT}`);
  console.log(`  provider: ${provider?.name ?? 'disabled (catalog-only)'}`);
  console.log(`  model: ${provider?.model ?? 'none'}`);
  console.log(
    `  allowed origins: ${allowedOrigins.length > 0 ? allowedOrigins.join(', ') : 'none'}`,
  );
  console.log('  no sentence text or generated content is ever logged');
});
