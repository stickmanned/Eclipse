# Eclipse — French Reading

**Eclipse turns any English article into DELF-matched French practice. AI highlights useful vocabulary and complete phrases, then asks a contextual translation question for each one.**

A Chrome extension for English speakers learning French. On first run, take an eight-question comprehension diagnostic or select a DELF level you already know (A1–B2). Activate Eclipse on an article and its AI reading lens replaces level-appropriate English words and phrases with French. Select one to answer a translation question; the Truth Card then shows the translation, contextual clue, and explanation.

Get one wrong and it comes back — on the next page where it legitimately fits.

---

## The eclipse is the interaction, not the branding

1. The familiar English meaning is **hidden**.
2. A French word takes its place.
3. You **predict** what it means from the sentence around it.
4. The Truth Card **uncovers the evidence**.
5. Your moon phase moves as the concept becomes reliable.

---

## Quick start

```bash
npm ci
npm run build
```

Then load it:

1. Open `chrome://extensions`
2. Turn on **Developer mode**
3. **Load unpacked** → select `.output/chrome-mv3`

Start the demo articles in a second terminal:

```bash
npm run demo
```

Open <http://127.0.0.1:4321/demo-a.html>, click the Eclipse toolbar icon, and press **Start Eclipse**.

There is no account or extension-side API key. Start the loopback AI service with `npm run api`; the key stays in that local Node process.

---

## The 90-second demo

See [`docs/DEMO_SCRIPT.md`](docs/DEMO_SCRIPT.md) for the full script. The short version:

1. **Demo A** → Start Eclipse. Four gold French words appear in the article.
2. Select **`attendre`** and answer **hope** (wrong on purpose).
3. The Truth Card shows the clue — _"for the bus"_ — and says the concept comes back at its next appearance.
4. **End Eclipse.** The article returns to exactly the text it had before.
5. **Demo B** → Start Eclipse. `attendre` is now placed on the page, because you owe it.

On a fresh profile, Demo B does **not** show `attendre` — four other concepts outrank it. That contrast is the point: the second page changed because of what you got wrong on the first.

---

## Commands

| Command                | What it does                                    |
| ---------------------- | ----------------------------------------------- |
| `npm run dev`          | WXT dev server with hot reload                  |
| `npm run build`        | Production build into `.output/chrome-mv3`      |
| `npm run zip`          | Packaged extension zip                          |
| `npm run demo`         | Serve the two demo articles on `127.0.0.1:4321` |
| `npm run api`          | Local AI generation API on `127.0.0.1:8787`     |
| `npm run typecheck`    | `tsc --noEmit`                                  |
| `npm run lint`         | ESLint                                          |
| `npm run format:check` | Prettier, check only                            |
| `npm test`             | Unit, DOM and API suites (Vitest)               |
| `npm run test:e2e`     | Browser end-to-end (Playwright, real Chrome)    |
| `npm run check`        | typecheck → lint → format → tests → build       |

`npm run test:e2e` builds what it needs and starts the demo server itself.

---

## Architecture

Full detail in [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md). The shape:

```
popup  ──START_SESSION──▶  background worker  ──PING / ACTIVATE──▶  content runtime
  ▲                              │                                       │
  └────────GET_STATUS────────────┘                                       ▼
                                                    article → learning items → DOM → Truth Card
                                                                          │
                                                                          ▼
                                                                 chrome.storage.local
```

Three ownership rules do most of the work:

- **The background worker** owns tab validation, the single active session, runtime injection, the AI request, and the serialized learner-history writer.
- **The content script** owns the article DOM and sends contextual answer outcomes to that writer.
- **The popup** owns presentation and active-recall practice. Practice answers and the DELF diagnostic also go through the worker, so there is still exactly one durable write seam.

### Narrow host permissions

Eclipse ships with `activeTab`, `scripting`, `storage`, and one required loopback host: `http://localhost:8787/*` for AI vocabulary generation. There is no broad article host permission, no `content_scripts` entry, and no `web_accessible_resources`.

That is possible because the content script is declared with `registration: "runtime"` and **no `matches`**, so WXT emits the bundle without adding a host permission. The worker injects it with `chrome.scripting.executeScript` on your click, under `activeTab`. The overlay stylesheet is passed to `createShadowRootUi` as a string rather than imported, which is what keeps `web_accessible_resources` empty too.

The trade-off is stated plainly: **activation is manual on every page.** `activeTab` is temporary by design, so Eclipse cannot — and does not claim to — transform pages automatically after you navigate.

---

## How a learning item is chosen

```
selectionScore = 0.40 · uncertainty      (highest near a 50% chance of being right)
               + 0.30 · duePriority      (1.0 for "you got this wrong")
               + 0.20 · contextQuality   (how well the sentence pins the meaning down)
               + 0.10 · salience         (body prose over list fragments)
```

Due concepts form a hard priority tier above the score, which is what makes the Demo A → Demo B transfer deterministic rather than lucky.

Before ranking, items outside the selected DELF difficulty window are removed. Placement rules then allow up to two items per paragraph and 120 per page, never two in a sentence, never overlapping ranges, and never more than 8% of eligible words. Ties break by score, then document order, then item id.

### Mastery

```
predicted      = sigmoid(globalAbility + conceptScore − (difficulty − 0.5) · 2)
delta          = outcome − predicted
conceptScore  += 0.6 · delta          clamped to −2 … 2
globalAbility += 0.1 · delta          clamped to −1 … 1
```

The Vocabulary deck has three learner phases. Every answered item begins at **Crescent — Learning**. The first correct typed practice moves it to **Half Moon — Building**; the third correct typed practice moves it to **Full Moon — Mastered**. Multiple choice can introduce a word but cannot promote it. Incorrect typed answers enter one same-session correction, but they do not erase successful-practice credit.

The deck shows the exact count (`0/3`, `1/3`, `2/3`, `3/3`) rather than a synthetic percentage. Full Moon items leave **Practice weakest** permanently, while a learner can still launch one manually from its row. Review scheduling remains stored separately for future study features and never dims or re-enqueues a Full Moon item.

---

## Privacy

Everything is in [`docs/PRIVACY.md`](docs/PRIVACY.md). The summary:

- No account, no sign-in, no identifier of any kind.
- No analytics, no telemetry, no crash reporting.
- Page addresses and browsing history are never collected or sent.
- Eclipse reads a page only while you have a session running on it.
- Learning data lives in `chrome.storage.local` on your machine and is erasable from the popup.
- Article sentences and the selected DELF level are sent only to the loopback AI service while a session starts; the page address and answer history are not sent.

---

## The AI generation API

AI generation is always on. The bundled French catalog remains a validated fallback, while the provider broadens each article to ordinary high-value vocabulary and whole phrases matched to the learner's DELF level. Eclipse awaits bounded generation batches before one atomic placement pass.

```bash
cp .env.example .env      # then set ECLIPSE_PROVIDER and a key
npm run api
```

Set `ECLIPSE_ALLOWED_ORIGINS=chrome-extension://*` in `.env`. This is a scoped rule that accepts only well-formed 32-letter Chrome extension origins, so unpacked builds keep working if Chrome assigns a different ID; broad web wildcards remain invalid. You can replace it with one exact `chrome-extension://<id>` origin if you prefer to pin a single installed copy. The server's `/health` response reports the active provider and model without exposing the key.

The extension sends article text in batches of at most eight sentences. Never the page URL, never your profile, never your answer history. The server:

- validates the request with Zod, enforces an origin allowlist, and rate-limits to 60/minute;
- retries one transient browser/API failure and one transient upstream Gemini overload, while keeping permission and request-shape failures immediate;
- uses the native Google Gen AI SDK with Gemini 3.5 Flash-Lite, strict structured output, `store: false`, and no tools;
- tells the model that page sentences are **untrusted data, not instructions**;
- validates the model's output again — against the same rules the catalog passes — before returning it;
- logs event names, counts, durations and error codes only. Never a sentence, never a generated surface. There is a test that asserts this;
- caches validated templates under versioned SHA-256 keys and strips the article sentence before writing to extension storage.

The extension never contacts Google directly. The API key exists only in the local Node server's environment, and the server binds to loopback.

Before release, complete the key-safe [live Gemini smoke checklist](docs/LIVE_GEMINI_SMOKE.md).

> **Note on the plan's supplied key.** The development plan for this project contained a live Gemini API key in plain text. It was not committed anywhere in this repository and should be treated as compromised and rotated. The `.env.example` here documents where a key goes; `.env` is gitignored.

---

## Tests

| Suite             | Count     | What it covers                                                                                                                        |
| ----------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Vitest            | 319       | DELF diagnostics and filtering, vocabulary/phrase validation, DOM restoration, provider/API boundaries, caching, scoring, and storage |
| Playwright/Chrome | 40 active | Complete extension flows, always-on AI, phrase questions, accessibility, failure recovery, manifest safety, and three article shapes  |
| Visual capture    | 1 opt-in  | DELF setup, article highlighting, question, Truth Card, and active popup states                                                       |

```bash
npm run check && npm run test:e2e
```

---

## Known limitations

Stated up front rather than discovered — see [`docs/KNOWN_LIMITATIONS.md`](docs/KNOWN_LIMITATIONS.md).

The most important ones:

- **Activation is manual on every page.** Eclipse has no standing permission to read article sites; its only required host is the loopback AI service.
- **Restoration is guaranteed at the level of normalized visible text**, not byte-identical `innerHTML`. Eclipse splits and rejoins text nodes; it never snapshots and rebuilds your page.
- **AI surfaces are strictly validated.** A small exact-form catalog remains as a resilient fallback; generated words and phrases must pass the same locale, NFC, safety, confidence, and sentence-binding checks.
- **No PDF, iframe, shadow-DOM or infinite-feed support.** Content added after activation is not transformed.
- The moon phase is a study aid, **not a proficiency score**, and is not presented as one.

---

## Repository layout

```
src/domain/     schemas, messages, scoring, scheduling, selection, normalization, safety
src/catalog/    the deterministic French catalog and its trap builder
src/content/    article detection, matching, DOM ownership, ShadowRoot UI
src/storage/    profile migration, provider cache, session state
src/provider/   always-on loopback generation client
src/entrypoints/ background worker, popup, runtime-injected content script
server/         local generation API
demo/           two deterministic demo articles and a static server
tests/          unit, dom, api, e2e, fixtures
docs/           architecture, privacy, demo script, judge Q&A, limitations
```

## Licence

MIT — see [LICENSE](LICENSE).
