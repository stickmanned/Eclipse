# Architecture

## The shape of the thing

```
┌──────────────┐   START_SESSION / STOP_SESSION   ┌────────────────────┐
│    Popup     │ ───────────────────────────────▶ │  Background worker │
│  (React)     │ ◀─────────── GET_STATUS ───────  │  (service worker)  │
└──────┬───────┘                                  └─────────┬──────────┘
       │  RECORD_ANSWER (typed practice)                     │
       └────────────────────────────────────────────────────▶│
       │                                                    │
       │  SAVE_CALIBRATION / RESET_PROFILE                  │  PING
       └────────────────────────────────────────────────────┤  scripting.executeScript
                                                            │  ACTIVATE / DEACTIVATE
                                                            ▼
                                              ┌───────────────────────────┐
                                              │   Content runtime          │
                                              │   (injected on demand)     │
                                              │                            │
                                              │  article detection         │
                                              │  candidate matching        │
                                              │  selection scoring         │
                                              │  DOM ownership + restore   │
                                              │  ShadowRoot challenge UI   │
                                              │  contextual answers       │
                                              └────────────┬───────────────┘
                                                           │ RECORD_ANSWER
                                                           ▼
                                              background serialized writer
                                                           │
                                                           ▼
                                                 chrome.storage.local
                                                 (learner profile)
```

## Ownership boundaries

Three rules, and most of the concurrency problems in an extension of this shape disappear.

### The background worker owns coordination

Popup requests, tab validation, the single active session, runtime injection, session replacement across tabs, the always-on loopback provider network call, and answer persistence.

It holds session state in `chrome.storage.session`, so a service-worker restart does not lose track of which tab is running Eclipse, and closing the browser clears it. Contextual and practice answers both enter one serialized `RECORD_ANSWER` queue; profile loading, duplicate suppression, mastery folding, validation, and interaction logging all happen behind that seam.

### The content script owns the page

Article analysis, trap selection, every DOM mutation, restoration, and contextual challenge interaction.

**Answer outcomes have exactly one writer.** This is the single most load-bearing decision in the design. The content runtime and popup can both originate answers, but neither mutates the profile. If each surface wrote mastery directly, a duplicate message, session replacement, practice answer, and popup refresh could race the same record. The background queue leaves only duplicated messages, handled by persisted `interactionId` idempotency.

### The popup owns presentation

It reads status and sends intents. `GET_STATUS` includes a zero-filled, bounded thirty-day activity snapshot and the current streak count; raw review events stay worker-owned. Its French-to-English typed practice sends `RECORD_ANSWER`; it never reaches into storage. DELF setup similarly routes through `SAVE_CALIBRATION` rather than mutating the profile.

## Why Eclipse needs no article host permissions

The shipped manifest is:

```json
{
  "permissions": ["activeTab", "scripting", "storage"],
  "host_permissions": ["http://localhost:8787/*"]
}
```

One required loopback AI host, but no article hosts, `content_scripts`, or `web_accessible_resources`.

Three things keep article access narrow:

1. **The content script is declared `registration: "runtime"` with no `matches`.** WXT adds a runtime-registered script's `matches` to `host_permissions`; with no `matches` there is nothing to add. The bundle is still emitted at `content-scripts/eclipse.js`.
2. **The worker injects it with `chrome.scripting.executeScript` on the user's click**, under the temporary `activeTab` grant.
3. **The overlay stylesheet is passed to `createShadowRootUi` as a string** rather than imported as CSS. An imported stylesheet with `cssInjectionMode: "ui"` would be fetched at runtime and would need a `web_accessible_resources` entry; a string needs nothing.

The cost is stated plainly in the README and the popup: **activation is manual on every page.** `activeTab` is temporary by design. Eclipse does not promise automatic transformation after navigation, because it could not keep that promise without asking for access to every site you visit.

## The DOM contract

Eclipse makes a narrow promise and keeps it, rather than a broad one it would have to break.

**What it does:**

- Replaces an exact character range inside a **single** text node. A span that would cross an inline element — a link, an `<em>` — is dropped, not spliced.
- Inserts a real `<button type="button">` tagged with owner, session, trap and concept ids.
- Records the original text and the immediate parent for every token.
- On deactivation: unwraps each connected token, restores its recorded text, and normalises **only** that token's immediate parent.

**What it explicitly does not do:**

- It does not snapshot your page's HTML and rebuild it. There is no `innerHTML` anywhere in the restoration path.
- It does not promise byte-identical `innerHTML` afterwards. Splitting and rejoining text nodes legitimately changes node boundaries.

**What it verifies:** normalized visible text of the article root, captured before the first mutation and compared after the last restoration. That is the guarantee that is actually meaningful to a reader, and it is the one that is tested.

### Invalidation

A `MutationObserver` watches for owned tokens becoming disconnected. Eclipse's own mutations run inside a `suppress()` wrapper that drains pending records, so they never trip it.

If the host page removes or reparents a branch Eclipse owns, the session is marked invalidated, mutation stops immediately, and `DOM_INVALIDATED` is reported. Eclipse does not try to repair a page it did not build.

## Selecting traps

```
selectionScore = 0.40 · uncertainty
               + 0.30 · duePriority
               + 0.20 · contextQuality
               + 0.10 · salience
               + 0.15 if predicted correctness is in the 65–80% band
```

`uncertainty` peaks at 1 when the learner is a coin-flip and falls to 0 at certainty. `duePriority` is 1 for a concept answered wrong, decaying for timestamped reviews. `salience` is 1.0 for `<p>`, 0.8 for `<blockquote>`, 0.6 for `<li>`.

**Due concepts form a hard tier above the score.** The plan asks Eclipse to prefer the 65–80% band _and_ to let a due concept override that preference. A tier is the only way to guarantee the second; tuning weights until it usually happens is not a guarantee. This is what makes the Demo A → Demo B transfer deterministic rather than lucky.

Ties break by score, then document order, then trap id — so the same article always produces the same traps, which is what lets the E2E suite assert on specific words.

### Placement rules

up to 120 per page · up to two per block · never two in a sentence · never overlapping ranges · never the same concept twice · never more than 8% of eligible words.

## Mastery and scheduling

```
predicted      = sigmoid(globalAbility + conceptScore − (difficulty − 0.5) · 2)
delta          = outcome − predicted
conceptScore  += 0.6 · delta          clamped −2 … 2
globalAbility += 0.1 · delta          clamped −1 … 1
```

The score still tunes article selection, but it no longer defines mastery. Attempted concepts have exactly three learner-facing phases:

- **Crescent — Learning:** the first contextual answer, correct or wrong.
- **Half Moon — Building:** at least one correct typed French-to-English practice.
- **Full Moon — Mastered:** three correct typed French-to-English practices in total.

Contextual multiple choice is marked `assisted`, so it can introduce and reinforce a word but cannot promote it. Typed successes are monotonic: a miss schedules one correction but does not remove an earned success. The UI displays the exact count out of three, never a percentage. Privacy-preserving context fingerprints remain available for selection; raw article sentences and URLs are not stored.

Scheduling is owned by the exact-pinned `ts-fsrs` package with a 0.90 desired-retention policy and a 365-day cap, but it no longer defines the visible moon. Every first answer is still scheduled and incorrect answers enter a same-session correction state. Full Moon is terminal for **Practice weakest**: due dates never dim or re-enqueue it. Schema-v1 Half/Full records are seeded with the minimum matching typed-practice count so an upgrade cannot erase visible mastery.

## Storage

| Key                            | Area      | Contents                                                   |
| ------------------------------ | --------- | ---------------------------------------------------------- |
| `eclipse:profile:v1`           | `local`   | Mastery, 30-day activity history, and the daily streak     |
| `eclipse:interactions:v1`      | `local`   | Last 200 interaction ids, for idempotency                  |
| `eclipse:provider-cache:v1`    | `local`   | Up to 100 sentence-free templates, keyed by scoped SHA-256 |
| `eclipse:provider-settings:v1` | `local`   | AI readiness and the most recent service error             |
| `eclipse:session:v1`           | `session` | The single active session                                  |

Two policies worth calling out:

- **A profile that fails validation is never silently replaced.** Eclipse reports `PROFILE_INCOMPATIBLE` and leaves the bytes untouched, so a schema bug in a future version cannot quietly delete someone's progress. Resetting is an explicit, confirmed user action.
- **Activity is aggregated at the answer writer.** Each applied interaction increments one local-calendar bucket; replayed interaction ids cannot double-count it. A v2 profile backfills whatever its retained review events can prove and marks only post-migration history as complete.
- **The streak is durable beyond the chart window.** One correct contextual answer extends it once per local calendar date. Additional answers that day, recall practice, incorrect answers, and replayed interaction ids do not extend it. It remains live through the following day and resets after one complete missed day.
- **The provider cache never stores the full submitted sentence.** Keys are SHA-256 digests scoped to locale, model, prompt, and schema revisions. Cached templates retain the short source/clue fields needed for the exercise, are rebound to the current sentence, and are re-validated on read, so an older or laxer entry cannot bypass current validation.

## Failure vocabulary

Every boundary returns `{ok: true, data}` or `{ok: false, error: {code, message, recoverable}}`. Nothing throws across a message boundary, and no listener ever drops a message: an unparseable or unhandled request is answered with `MESSAGE_UNSUPPORTED` rather than left to resolve as `undefined`.

`UNSUPPORTED_URL` · `NO_ARTICLE` · `NO_ELIGIBLE_TRAPS` · `CONTENT_SCRIPT_UNAVAILABLE` · `SESSION_REPLACED` · `DOM_INVALIDATED` · `STORAGE_ERROR` · `PROFILE_INCOMPATIBLE` · `PROVIDER_DISABLED` · `PROVIDER_PERMISSION_DENIED` · `PROVIDER_UNAVAILABLE` · `PROVIDER_TIMEOUT` · `PROVIDER_INVALID_RESPONSE` · `MESSAGE_UNSUPPORTED` · `UNKNOWN_ERROR`

### Version skew between the popup and the worker

Chrome can keep a previously registered service worker alive across a rebuild, so a popup compiled from new source may talk to a worker compiled from old source. `MESSAGE_CONTRACT_VERSION` in `src/domain/messages.ts` is compiled into both halves and reported by `GET_STATUS`; when the popup sees a value other than its own — or no value at all, which is what a pre-v2 worker returns — it shows a Reload Eclipse notice instead of failing later on the first message whose payload moved. Bump the constant whenever a payload changes shape in a way an older peer cannot parse.

## Text handling

Two rules:

1. **Stored and rendered French is always NFC.** `bibliothèque` keeps its accents; `l’école` keeps U+2019. Nothing is transliterated, and validation _rejects_ non-NFC input rather than repairing it.
2. **Comparison is permissive in exactly one respect:** a straight apostrophe and a curly one compare equal. Accents are never folded, because `a`/`à` and `ou`/`où` are different words.

Matching never rewrites the haystack. Offsets from `findWordMatches` map straight onto live DOM text nodes, so re-normalising the input would silently shift every one of them. English source spans are ASCII, which is what makes that safe.

## Trust boundaries

| Source          | Trust         | Treatment                                                                                                                       |
| --------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Bundled catalog | Curated       | Still validated, so a bad edit fails in CI rather than shipping                                                                 |
| Page text       | **Untrusted** | Read-only input to matching. Never evaluated; eligible sentence batches go only to the loopback provider                        |
| Provider output | **Untrusted** | Validated item by item against the same rules as the catalog, plus instruction-shaped-text detection and a 0.8 confidence floor |
| Messages        | Untrusted     | Parsed with a Zod discriminated union; unknown shapes rejected, never coerced                                                   |

All rendering goes through React text nodes or `textContent`. There is no `innerHTML` and no `dangerouslySetInnerHTML` anywhere in the codebase.

Validating provider output **item by item** is a cost decision, not a trust decision: every item still faces exactly the schema it always did. What changed is the blast radius. One item with a spaced slug used to fail `z.array(...)`, discard the seven good learning items beside it, and buy a second model call that often came back worse — measured live, a batch spent 8.3s to return nothing that a 4.4s call had already produced correctly.

## Generation cost

One "Start Eclipse" on a long article fans out to up to fifteen batches of eight sentences. Three properties keep that from being a long wait, all of them measured against the real provider rather than reasoned about:

- **A second model call has to earn itself.** The repair attempt fires only when the first response covers less than `repairThreshold` of its sentences. Demanding full coverage fired it on roughly five batches in six and did not improve the result.
- **A bad repair can never cost a good first attempt.** Every failure path inside the attempt loop continues rather than returning, and the batch ships whichever attempt produced the most usable items.
- **Cache lookups are per batch, not per sentence.** `getCachedTrapsBatch` / `setCachedTrapsBatch` take the shared cache lock once. The per-sentence entry points remain for single lookups; calling them in a loop re-serializes batches that are supposed to run concurrently.

Concurrency is capped at three in-flight batches. The binding constraint is the upstream per-minute quota, not instantaneous concurrency: a single wave of six succeeds, but ten batches sustained at four in flight exhausts the quota, the automatic retry hits the same wall, and the article loses nearly half its learning items to buy six seconds.
