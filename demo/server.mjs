/**
 * Static server for the two demo articles.
 *
 * Deliberately dependency-free and loopback-only. It serves exactly the files
 * in this directory and nothing else — no directory traversal, no upward paths.
 */

import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(new URL('.', import.meta.url)));
const PORT = Number(process.env.ECLIPSE_DEMO_PORT ?? 4321);
const HOST = '127.0.0.1';

const CONTENT_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
};

function resolveRequestPath(urlPath) {
  const decoded = decodeURIComponent(urlPath.split('?')[0] ?? '/');
  const relative = normalize(decoded).replace(/^(\.\.[/\\])+/, '');
  const target = join(ROOT, relative === '/' ? 'index.html' : relative);
  // Refuse anything that escaped the demo directory.
  return target.startsWith(ROOT) ? target : null;
}

const server = createServer(async (request, response) => {
  const target = resolveRequestPath(request.url ?? '/');

  if (!target) {
    response.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Forbidden');
    return;
  }

  try {
    const info = await stat(target);
    const file = info.isDirectory() ? join(target, 'index.html') : target;
    const body = await readFile(file);
    response.writeHead(200, {
      'Content-Type': CONTENT_TYPES[extname(file)] ?? 'application/octet-stream',
      'Cache-Control': 'no-store',
    });
    response.end(body);
  } catch {
    response.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    response.end('<h1>404</h1><p><a href="/">Demo index</a></p>');
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Eclipse demo pages at http://${HOST}:${PORT}/`);
  console.log(`  Demo A  http://${HOST}:${PORT}/demo-a.html`);
  console.log(`  Demo B  http://${HOST}:${PORT}/demo-b.html`);
});
