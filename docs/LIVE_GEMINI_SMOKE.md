# Live Gemini smoke test

Use this only with a newly rotated/restricted Gemini key. Never paste the key into source, a test command, a browser field, or a captured log.

## Setup

1. Run `cp .env.example .env`.
2. In `.env`, set `GEMINI_API_KEY` locally and keep `GEMINI_MODEL=gemini-3.5-flash-lite`.
3. Run `npm run build` and load `.output/chrome-mv3` at `chrome://extensions`.
4. Set `ECLIPSE_ALLOWED_ORIGINS=chrome-extension://*` in `.env`. This scoped value accepts only well-formed Chrome extension origins; broad web wildcards remain invalid. Pin one exact `chrome-extension://<id>` instead when stable-ID isolation is required.
5. Run `npm run api`. Startup must report provider `gemini` and model `gemini-3.5-flash-lite`.
6. Check `http://127.0.0.1:8787/health`. It must return the provider/model and no credential.

## Browser checks

1. Open the popup, choose a DELF level, and confirm that it reports **AI vocabulary is always on**. There must be no AI toggle.
2. Start Eclipse on `demo/no-traps.html` and on a second eligible English article with no catalog matches.
3. Each substantial paragraph should receive up to two French words or complete phrases at the selected level, subject to sentence quality and the 8% density ceiling. Complete both kinds of challenge and verify their Truth Cards.
4. A transient 429, 5xx, timeout, network interruption, or malformed response should be retried once by the same Start action; only a repeated failure should appear in the popup.
5. End each session and verify the article's normalized visible text is restored.
6. Repeat the first page. The second activation must use the cache and must not create a second generation log entry for the same sentences.
7. Stop the server and try an uncached catalog-free article. Eclipse must show a recoverable local-server error and leave the page unchanged.

## Privacy and release checks

- Server logs contain event names, counts, durations, model ID, and error codes only—no submitted or generated text.
- `chrome.storage.local` contains no full submitted sentence and no credential.
- `.env`, the key, and article sentences are absent from the production bundle and zip.
- Record only pass/fail, error codes, and counts. Do not record the key or submitted sentences.

The release gate is blocked if authentication, quota, model access, validation, restoration, or either secret scan fails.
