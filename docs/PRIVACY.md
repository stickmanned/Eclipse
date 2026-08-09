# Privacy

Eclipse is a study tool. It does not need to know who you are, and it is built so that it cannot find out.

## What Eclipse stores locally

Eclipse uses four keys in `chrome.storage.local` and one short-lived key in `chrome.storage.session`:

| Key                            | What it holds                                                                                                                 |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| `eclipse:profile:v1`           | Your learner profile: per-concept scores, FSRS memory state, moon phases, bounded review evidence, and the last five outcomes |
| `eclipse:interactions:v1`      | The last 200 answer ids, so a repeated message cannot count twice                                                             |
| `eclipse:provider-cache:v1`    | AI learning-item templates without the full sentence, keyed by a versioned SHA-256 digest                                     |
| `eclipse:provider-settings:v1` | The most recent AI service error, if any                                                                                      |
| `eclipse:session:v1`           | Which tab has a session open. In `storage.session`, so it disappears when the browser closes                                  |

The profile stores **concept identifiers** like `fr:attendre:wait` and SHA-256 context fingerprints — not page text, not URLs, not sentences. A fingerprint lets Eclipse distinguish repeated contexts for learning evidence without putting the source sentence in the profile.

## What Eclipse does not do

- **No account, no sign-in, no identifier.** There is no user id, device id, or install id anywhere in the code. Session and interaction ids are random, local, and thrown away.
- **No analytics. No telemetry. No crash reporting.** There is no measurement code of any kind.
- **No browsing history.** Eclipse never reads history, never enumerates your tabs, and never records the addresses of pages you visit. It does not hold the `tabs` or `history` permission.
- **No URL, title, or full article sentence is stored.** The cache retains the validated learning-item fields needed to replay an exercise, including its short source and clue spans, but strips the full sentence before writing.
- **No analytics or advertising third parties.** The local server sends selected sentences and the DELF level to Google Gemini solely to generate vocabulary practice, as described below.

## What Eclipse can see, and when

Eclipse holds `activeTab`, which grants access to **one tab, temporarily, after you invoke the extension**. Its only standing host permission is the loopback AI service at `http://localhost:8787/*`; it has no standing access to article sites.

Concretely: until you press **Start Eclipse** on a page, the extension cannot read that page at all. When you press **End Eclipse**, or navigate, or close the tab, that access ends.

This is why activation is manual on every page. It is a deliberate trade: broad automatic behaviour would require permission to read every site you visit, and that is not a reasonable price for a vocabulary exercise.

## Network access

The AI generation API is always on while Eclipse prepares an article. It is the extension's only network path:

- The **only** origin Eclipse will contact is `http://localhost:8787`, a server you run yourself. The origin is a build-time constant. There is no setting, and no message a page could send, that points Eclipse at a different host.
- The permission is the single required `host_permissions` entry in the manifest. It covers loopback only.
- What is sent: **article text in batches of at most eight sentences and the selected DELF level.**
- What is never sent: the page URL, the page title, your mastery records, your answer history, your adaptive ability score, any identifier, or any content beyond those sentences.
- The request carries `credentials: 'omit'` and `cache: 'no-store'`.

Activation waits for bounded generation batches and performs one atomic placement pass. A failed batch cannot insert partial output; catalog matches still remain available, and a catalog-free page returns a typed, recoverable error without changing the page when generation produces nothing usable.

## The local generation server

If you run `npm run api`, that server is yours and runs on loopback. Its policy:

- It validates every request and enforces an explicit origin allowlist.
- It rate-limits to 60 requests per minute, enough for two maximum-size long-article attempts while retaining runaway-loop protection.
- It calls Gemini 3.5 Flash-Lite with `store: false` and no tools. This disables stored Interactions API records for the request; it is not a blanket promise about all provider processing or retention. Google's applicable data handling depends on the account, billing status, and current terms. Review [Google's Gemini API data-use documentation](https://ai.google.dev/gemini-api/terms) before enabling AI.
- **It logs event names, counts, durations and error codes only.** No sentence text, no generated French, no origin. `tests/api/context-traps.test.ts` asserts this by driving several request paths and searching the captured log for the content that passed through.
- Your API key lives in `.env`, which is gitignored, and is read only by that server. **No key exists anywhere in the extension.**

## Erasing your data

The popup has **Reset all Eclipse data**. It asks for confirmation, ends any running session, and clears the profile, interaction log, provider cache, provider status, and session record. Removing the extension removes everything as well.

## Verifying these claims

You do not have to take this on trust:

```bash
npm run build
cat .output/chrome-mv3/manifest.json
```

You should see exactly:

```json
"permissions": ["activeTab", "scripting", "storage"],
"host_permissions": ["http://localhost:8787/*"]
```

and no `optional_host_permissions`, no broad web hosts, no `content_scripts`, and no `web_accessible_resources`. `tests/e2e/manifest.spec.ts` asserts this against the shipped artifact on every run, including the absence of `tabs`, `history`, `cookies` and `<all_urls>`.
