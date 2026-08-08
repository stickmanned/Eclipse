# Architecture

## The shape of the thing

```
┌──────────────┐   START_SESSION / STOP_SESSION   ┌────────────────────┐
│    Popup     │ ───────────────────────────────▶ │  Background worker │
│  (React)     │ ◀─────────── GET_STATUS ───────  │  (service worker)  │
└──────────────┘                                  └─────────┬──────────┘
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
                                              │  answer persistence  ◀──── the only writer
                                              └────────────┬───────────────┘
                                                           │
                                                           ▼
                                                 chrome.storage.local
                                                 (learner profile)
```

## Ownership boundaries

Three rules, and most of the concurrency problems in an extension of this shape disappear.

### The background worker owns coordination

Popup requests, tab validation, the single active session, runtime injection, session replacement across tabs, and the optional provider permission and network call.

It holds session state in `chrome.storage.session`, so a service-worker restart does not lose track of which tab is running Eclipse, and closing the browser clears it.

### The content script owns the page — and answer outcomes

Article analysis, trap selection, every DOM mutation, restoration, challenge interaction, and writing answers to the learner profile.

**Answer outcomes have exactly one writer.** This is the single most load-bearing decision in the design. If the popup and the worker could also write mastery, then a duplicate answer message, a session replacement mid-answer, and a popup refresh would all be racing the same record. With one writer, the only remaining hazard is a duplicated message to that writer — and that is handled by `interactionId` idempotency, which is a much smaller problem.

### The popup owns presentation

It reads status and sends intents. It never writes learner history. Calibration is the interesting case: it _produces_ a `globalAbility`, so it routes through `SAVE_CALIBRATION` rather than reaching into storage. That message is the one addition to the plan's eight, and it exists specifically to keep this boundary intact.

## Why Eclipse needs no host permissions

The shipped manifest is:

```json
{
  "permissions": ["activeTab", "scripting", "storage"],
  "optional_host_permissions": ["http://localhost:8787/*"]
}
```

No `host_permissions`. No `content_scripts`. No `web_accessible_resources`.

Three things make that possible:

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

2–4 per page · one per block · never two in a sentence · never overlapping ranges · never the same concept twice · never more than 3% of eligible words.

## Mastery and scheduling

```
predicted      = sigmoid(globalAbility + conceptScore − (difficulty − 0.5) · 2)
delta          = outcome − predicted
conceptScore  += 0.6 · delta          clamped −2 … 2
globalAbility += 0.1 · delta          clamped −1 … 1
```

Moon phases are thresholds on `conceptScore`, with one extra condition: **full** requires 1.25+ _and_ at least three attempts _and_ at least two correct. A high score without the evidence behind it reports **half**. One lucky guess never fills the moon.

The review ladder is 1 day → 3 days → 7 days. The current rung is **derived, not stored**: `ConceptMastery` records when it was scheduled (`updatedAt`) and when it comes back (`due.at`), and the gap between them is the interval that was last granted. That keeps the persisted shape exactly as specified with no hidden bookkeeping field.

## Storage

| Key                            | Area      | Contents                                                   |
| ------------------------------ | --------- | ---------------------------------------------------------- |
| `eclipse:profile:v1`           | `local`   | The learner profile                                        |
| `eclipse:interactions:v1`      | `local`   | Last 200 interaction ids, for idempotency                  |
| `eclipse:provider-cache:v1`    | `local`   | Up to 100 sentence-free templates, keyed by scoped SHA-256 |
| `eclipse:provider-settings:v1` | `local`   | The optional-provider toggle                               |
| `eclipse:session:v1`           | `session` | The single active session                                  |

Two policies worth calling out:

- **A profile that fails validation is never silently replaced.** Eclipse reports `PROFILE_INCOMPATIBLE` and leaves the bytes untouched, so a schema bug in a future version cannot quietly delete someone's progress. Resetting is an explicit, confirmed user action.
- **The provider cache never stores the full submitted sentence.** Keys are SHA-256 digests scoped to locale, model, prompt, and schema revisions. Cached templates retain the short source/clue fields needed for the exercise, are rebound to the current sentence, and are re-validated on read, so an older or laxer entry cannot bypass current validation.

## Failure vocabulary

Every boundary returns `{ok: true, data}` or `{ok: false, error: {code, message, recoverable}}`. Nothing throws across a message boundary.

`UNSUPPORTED_URL` · `NO_ARTICLE` · `NO_ELIGIBLE_TRAPS` · `CONTENT_SCRIPT_UNAVAILABLE` · `SESSION_REPLACED` · `DOM_INVALIDATED` · `STORAGE_ERROR` · `PROFILE_INCOMPATIBLE` · `PROVIDER_DISABLED` · `PROVIDER_PERMISSION_DENIED` · `PROVIDER_UNAVAILABLE` · `PROVIDER_TIMEOUT` · `PROVIDER_INVALID_RESPONSE` · `UNKNOWN_ERROR`

## Text handling

Two rules:

1. **Stored and rendered French is always NFC.** `bibliothèque` keeps its accents; `l’école` keeps U+2019. Nothing is transliterated, and validation _rejects_ non-NFC input rather than repairing it.
2. **Comparison is permissive in exactly one respect:** a straight apostrophe and a curly one compare equal. Accents are never folded, because `a`/`à` and `ou`/`où` are different words.

Matching never rewrites the haystack. Offsets from `findWordMatches` map straight onto live DOM text nodes, so re-normalising the input would silently shift every one of them. English source spans are ASCII, which is what makes that safe.

## Trust boundaries

| Source          | Trust         | Treatment                                                                                                          |
| --------------- | ------------- | ------------------------------------------------------------------------------------------------------------------ |
| Bundled catalog | Curated       | Still validated, so a bad edit fails in CI rather than shipping                                                    |
| Page text       | **Untrusted** | Read-only input to matching. Never evaluated, never sent anywhere except the optional provider's sentence list     |
| Provider output | **Untrusted** | Validated against the same rules as the catalog, plus instruction-shaped-text detection and a 0.8 confidence floor |
| Messages        | Untrusted     | Parsed with a Zod discriminated union; unknown shapes rejected, never coerced                                      |

All rendering goes through React text nodes or `textContent`. There is no `innerHTML` and no `dangerouslySetInnerHTML` anywhere in the codebase.
