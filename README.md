# Eclipse — Context Traps

**Eclipse turns any English article into a French context exercise. It hides the familiar meaning, asks you to infer the truth from context, and reveals the evidence behind the answer.**

A Chrome extension for English speakers learning French. Activate it on an article and Eclipse covers two to four English words with their French equivalents. Select one and you get three possible meanings. Answer, and a Truth Card shows you the correct meaning, the exact phrase in the sentence that settles it, why it means that, and why the tempting alternative is wrong.

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

There is no account, no key, and no network call. Eclipse works fully offline.

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

| Command                | What it does                                      |
| ---------------------- | ------------------------------------------------- |
| `npm run dev`          | WXT dev server with hot reload                    |
| `npm run build`        | Production build into `.output/chrome-mv3`        |
| `npm run zip`          | Packaged extension zip                            |
| `npm run demo`         | Serve the two demo articles on `127.0.0.1:4321`   |
| `npm run api`          | Optional local generation API on `127.0.0.1:8787` |
| `npm run typecheck`    | `tsc --noEmit`                                    |
| `npm run lint`         | ESLint                                            |
| `npm run format:check` | Prettier, check only                              |
| `npm test`             | Unit, DOM and API suites (Vitest)                 |
| `npm run test:e2e`     | Browser end-to-end (Playwright, real Chrome)      |
| `npm run check`        | typecheck → lint → format → tests → build         |

`npm run test:e2e` builds what it needs and starts the demo server itself.

---

## Architecture

Full detail in [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md). The shape:

```
popup  ──START_SESSION──▶  background worker  ──PING / ACTIVATE──▶  content runtime
  ▲                              │                                       │
  └────────GET_STATUS────────────┘                                       ▼
                                                          article → traps → DOM → Truth Card
                                                                          │
                                                                          ▼
                                                                 chrome.storage.local
```

Three ownership rules do most of the work:

- **The background worker** owns tab validation, the single active session, runtime injection, and the optional network call.
- **The content script** owns the DOM, and is the **only** writer of answer outcomes. That single-writer rule removes the popup/background/content race entirely.
- **The popup** owns presentation and commands. It never writes learner history — even calibration goes through the worker.

### Why no host permissions

Eclipse ships with `activeTab`, `scripting` and `storage`, and nothing else. There is no `content_scripts` entry in the manifest and no `web_accessible_resources`.

That is possible because the content script is declared with `registration: "runtime"` and **no `matches`**, so WXT emits the bundle without adding a host permission. The worker injects it with `chrome.scripting.executeScript` on your click, under `activeTab`. The overlay stylesheet is passed to `createShadowRootUi` as a string rather than imported, which is what keeps `web_accessible_resources` empty too.

The trade-off is stated plainly: **activation is manual on every page.** `activeTab` is temporary by design, so Eclipse cannot — and does not claim to — transform pages automatically after you navigate.

---

## How a trap is chosen

```
selectionScore = 0.40 · uncertainty      (highest near a 50% chance of being right)
               + 0.30 · duePriority      (1.0 for "you got this wrong")
               + 0.20 · contextQuality   (how well the sentence pins the meaning down)
               + 0.10 · salience         (body prose over list fragments)
```

Due concepts form a hard priority tier above the score, which is what makes the Demo A → Demo B transfer deterministic rather than lucky.

Placement rules: 2–4 traps per page, at most one per paragraph, never two in a sentence, never overlapping ranges, never more than 3% of eligible words. Ties break by score, then document order, then trap id — so the same article always yields the same traps, which is what lets the E2E suite assert on specific words.

### Mastery

```
predicted      = sigmoid(globalAbility + conceptScore − (difficulty − 0.5) · 2)
delta          = outcome − predicted
conceptScore  += 0.6 · delta          clamped to −2 … 2
globalAbility += 0.1 · delta          clamped to −1 … 1
```

Moon phases: **new moon** below −0.5 or unattempted · **crescent** −0.5 to 0.49 · **half** 0.5 to 1.24 · **full** 1.25+ _with at least three attempts and two correct_. A single lucky guess never fills the moon.

Review ladder: wrong → next occurrence · first correct while due → 1 day → 3 days → 7 days. Wrong at any rung drops straight back to next occurrence.

---

## Privacy

Everything is in [`docs/PRIVACY.md`](docs/PRIVACY.md). The summary:

- No account, no sign-in, no identifier of any kind.
- No analytics, no telemetry, no crash reporting.
- Page addresses and browsing history are never collected or sent.
- Eclipse reads a page only while you have a session running on it.
- Learning data lives in `chrome.storage.local` on your machine and is erasable from the popup.
- **With AI traps off — the default — Eclipse makes no network requests at all.**

---

## The optional generation API

The bundled French catalog remains the offline path. The optional provider is **off by default**. Catalog matches still activate immediately; on an eligible article with too few catalog matches, enabled AI may be awaited briefly so it can supply the initial exercise.

```bash
cp .env.example .env      # then set ECLIPSE_PROVIDER and a key
npm run api
```

Set `ECLIPSE_ALLOWED_ORIGINS=chrome-extension://*` in `.env`. This is a scoped rule that accepts only well-formed 32-letter Chrome extension origins, so unpacked builds keep working if Chrome assigns a different ID; broad web wildcards remain invalid. You can replace it with one exact `chrome-extension://<id>` origin if you prefer to pin a single installed copy. The server's `/health` response reports the active provider and model without exposing the key.

Turn it on from the popup: the toggle requests the optional host permission at that moment, and turning it off revokes the permission rather than merely disabling the feature. It sends at most eight sentences of article text, and only sentences. Never the page URL, never your profile, never your answer history. The server:

- validates the request with Zod, enforces an origin allowlist, and rate-limits to 30/minute;
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

| Suite | Count | What it covers                                                                                                                                                                                                               |
| ----- | ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Unit  | 163   | Unicode/NFC, apostrophes, trap validation, native Gemini/config/readiness contracts, calibration, mastery, scheduling, selection, scoped cache/rebinding, reset, session authorization, and idempotency                      |
| DOM   | 101   | Article detection, exclusions, placement/density, catalog-free AI fallback, explicit sentence binding, restoration, invalidation, Demo A → Demo B transfer, Truth Card states, focus trap and live regions                   |
| API   | 30    | Valid response, missing provider, bad origin, oversized payload, rate limiting, timeout, invalid JSON, wrong locale, missing accents, duplicate choices, HTML and script content, prompt injection, and a log-leak assertion |
| E2E   | 35    | Offline/core flows plus fake-provider activation, cache, failure and reset scenarios in real Chrome; production manifest and secret audits                                                                                   |

```bash
npm run check && npm run test:e2e
```

---

## Known limitations

Stated up front rather than discovered — see [`docs/KNOWN_LIMITATIONS.md`](docs/KNOWN_LIMITATIONS.md).

The most important ones:

- **Activation is manual on every page.** A consequence of asking for no host permissions.
- **Restoration is guaranteed at the level of normalized visible text**, not byte-identical `innerHTML`. Eclipse splits and rejoins text nodes; it never snapshots and rebuilds your page.
- **French surfaces are curated, not generated.** Eclipse does not conjugate. `avait le cafard` is written out in the catalog as that exact inflected form.
- **No PDF, iframe, shadow-DOM or infinite-feed support.** Content added after activation is not transformed.
- The moon phase is a study aid, **not a proficiency score**, and is not presented as one.

---

## Repository layout

```
src/domain/     schemas, messages, scoring, scheduling, selection, normalization, safety
src/catalog/    the deterministic French catalog and its trap builder
src/content/    article detection, matching, DOM ownership, ShadowRoot UI
src/storage/    profile migration, provider cache, session state
src/provider/   optional generation client
src/entrypoints/ background worker, popup, runtime-injected content script
server/         optional local generation API
demo/           two deterministic demo articles and a static server
tests/          unit, dom, api, e2e, fixtures
docs/           architecture, privacy, demo script, judge Q&A, limitations
```

## Licence

MIT — see [LICENSE](LICENSE).
