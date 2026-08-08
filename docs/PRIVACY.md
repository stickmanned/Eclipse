# Privacy

Eclipse is a study tool. It does not need to know who you are, and it is built so that it cannot find out.

## What Eclipse stores locally

Eclipse uses four keys in `chrome.storage.local` and one short-lived key in `chrome.storage.session`:

| Key                            | What it holds                                                                                                   |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------- |
| `eclipse:profile:v1`           | Your learner profile: per-concept scores, attempt counts, moon phases, review dates, and the last five outcomes |
| `eclipse:interactions:v1`      | The last 200 answer ids, so a repeated message cannot count twice                                               |
| `eclipse:provider-cache:v1`    | Optional-provider templates without the full sentence, keyed by a versioned SHA-256 digest                      |
| `eclipse:provider-settings:v1` | Whether you switched AI traps on                                                                                |
| `eclipse:session:v1`           | Which tab has a session open. In `storage.session`, so it disappears when the browser closes                    |

The profile stores **concept identifiers** like `fr:attendre:wait` — not page text, not URLs, not sentences.

## What Eclipse does not do

- **No account, no sign-in, no identifier.** There is no user id, device id, or install id anywhere in the code. Session and interaction ids are random, local, and thrown away.
- **No analytics. No telemetry. No crash reporting.** There is no measurement code of any kind.
- **No browsing history.** Eclipse never reads history, never enumerates your tabs, and never records the addresses of pages you visit. It does not hold the `tabs` or `history` permission.
- **No URL, title, or full article sentence is stored.** The optional cache retains the validated trap fields needed to replay an exercise, including its short source and clue spans, but strips the full sentence before writing.
- **No analytics or advertising third parties.** When AI is enabled, the local server sends selected sentences to Google Gemini solely to generate traps, as described below.

## What Eclipse can see, and when

Eclipse holds `activeTab`, which grants access to **one tab, temporarily, after you invoke the extension** — and to nothing else. It does not hold `host_permissions`, so it has no standing access to any site.

Concretely: until you press **Start Eclipse** on a page, the extension cannot read that page at all. When you press **End Eclipse**, or navigate, or close the tab, that access ends.

This is why activation is manual on every page. It is a deliberate trade: broad automatic behaviour would require permission to read every site you visit, and that is not a reasonable price for a vocabulary exercise.

## Network access

**With AI traps off — the default — Eclipse makes no network requests at all.** You can verify this: disconnect from the network entirely and the complete flow still works, because the French catalog ships inside the extension.

The optional generation API is the only network path, and it is off until you switch it on. Even then:

- The **only** origin Eclipse will contact is `http://localhost:8787`, a server you run yourself. The origin is a build-time constant. There is no setting, and no message a page could send, that points Eclipse at a different host.
- The permission for it is `optional_host_permissions` and is requested at the moment you enable the feature — never at install.
- What is sent: **at most eight sentences of article text.** That is all.
- What is never sent: the page URL, the page title, your learner profile, your answer history, your ability score, any identifier, or any content beyond those sentences.
- The request carries `credentials: 'omit'` and `cache: 'no-store'`.

Catalog-rich pages still activate immediately if the server is absent, slow, denied, or invalid. A catalog-free page waits for one bounded request and otherwise returns a typed, recoverable error without changing the page.

## The local generation server

If you run `npm run api`, that server is yours and runs on loopback. Its policy:

- It validates every request and enforces an explicit origin allowlist.
- It rate-limits to 30 requests per minute.
- It calls Gemini 3.5 Flash-Lite with `store: false` and no tools. This disables stored Interactions API records for the request; it is not a blanket promise about all provider processing or retention. Google's applicable data handling depends on the account, billing status, and current terms. Review [Google's Gemini API data-use documentation](https://ai.google.dev/gemini-api/terms) before enabling AI.
- **It logs event names, counts, durations and error codes only.** No sentence text, no generated French, no origin. `tests/api/context-traps.test.ts` asserts this by driving several request paths and searching the captured log for the content that passed through.
- Your API key lives in `.env`, which is gitignored, and is read only by that server. **No key exists anywhere in the extension.**

## Erasing your data

The popup has **Reset all Eclipse data**. It asks for confirmation, ends any running session, removes the optional localhost permission, and clears the profile, interaction log, provider cache, provider setting, and session record. Removing the extension removes everything as well.

## Verifying these claims

You do not have to take this on trust:

```bash
npm run build
cat .output/chrome-mv3/manifest.json
```

You should see exactly:

```json
"permissions": ["activeTab", "scripting", "storage"],
"optional_host_permissions": ["http://localhost:8787/*"]
```

and no `host_permissions`, no `content_scripts`, no `web_accessible_resources`. `tests/e2e/manifest.spec.ts` asserts this against the shipped artifact on every run, including the absence of `tabs`, `history`, `cookies` and `<all_urls>`.

To check the no-network claim, turn off your network adapter and run the demo. Everything works.
