# Paraphrase Mode

Translate Mode turns an English article into French. Paraphrase Mode never leaves French: on a
French page it replaces the hardest wordings with simpler French ones, and asks the reader to
recover what was simplified away.

```
page:     "Le mécanisme sert à [aider] le processus."
asks:     Quelle formulation d'origine a été simplifiée ici ?
choices:  faciliter · entraver · prolonger          (all French)
accepts:  faciliter                                  (the exact page span)
```

It is for a reader who already follows French prose and trips on individual wordings — the case
Translate Mode structurally cannot cover, because there is no English left to hide.

---

## What a teammate needs to know first

**Four existing files were touched, additively. No existing function body was modified.**

| File | Change |
| --- | --- |
| `src/entrypoints/background.ts` | +6 lines: one import, one `registerParaphraseBridge()` call |
| `src/entrypoints/popup/App.tsx` | +11/−1: a `lens` state and a render branch inside the Session panel |
| `src/entrypoints/popup/popup.css` | +304 lines appended; no rule above is edited |
| `server/index.ts` | +11 lines: mounts `createParaphraseRouter` on the existing app |

**The shipped manifest is byte-identical.** No new permission, no `content_scripts` entry, no
`web_accessible_resources`. The new content script is `registration: "runtime"` with no `matches`,
exactly like `eclipse.content.ts`, and the paraphrase endpoint shares the one loopback host.

Everything else is new files under `src/domain/`, `src/content/paraphrase/`, `src/paraphrase/`,
`src/storage/`, `src/provider/`, `server/paraphrase/` and `tests/`.

---

## Why it uses ports instead of `runtime.sendMessage`

This is the one design decision worth reading before changing anything.

Both runtimes can be present in one document — a content script cannot be uninstalled once injected
— and the Translate Mode runtime answers **every** message, including shapes it does not recognise,
with `MESSAGE_UNSUPPORTED`. On a shared `onMessage` channel it would therefore reliably win the race
for every Paraphrase message and reply on behalf of a runtime that was never addressed. Listener
ordering cannot be fixed from this side of the boundary.

`runtime.onConnect` is addressed rather than broadcast, and the Translate Mode runtime registers no
`onConnect` handler at all. So:

```
popup ──runtime.connect("eclipse-paraphrase-popup")──▶ background bridge
                                                            │
tab runtime ◀──tabs.connect("eclipse-paraphrase-tab")───────┤
            └──runtime.connect(same name) on reconnect ─────▶
```

One bidirectional port per tab carries activation down and generation/answers back up. Either side
may open it, which is what lets a session survive a service-worker restart. `src/domain/messages.ts`
needed no changes at all.

---

## The two cores

### Core #1 — adaptive complexity (`src/domain/complexity.ts`)

Two numbers, deliberately separate:

```
center — belief about the learner's reading level. Moves slowly, on evidence.
reach  — how far above center Eclipse is currently daring to aim. One step per answer.
```

```
predicted = sigmoid((center − complexity) · 5)
delta     = outcome − predicted
center   += (delta ≥ 0 ? 0.12 : 0.18) · delta        clamped 0…1
reach    += ±0.05                                     clamped −0.15…0.15
target    = center + reach
```

Collapsing them into one number would make every lucky probe permanently raise the estimate of the
learner's level — a ratchet, not an oscillation, and the exact frustration the brief asks Eclipse to
avoid. The fall rate exceeds the rise rate on purpose: aiming slightly low costs one easy item,
aiming high costs the will to keep reading.

`tests/unit/complexity.test.ts > the four rounds from the brief` walks the specification's worked
example. If the constants are ever retuned, that test is the one that says whether the product still
behaves as promised.

### Core #2 — contextual awareness (`src/domain/paraphrase-profile.ts`)

A lightweight persistent profile, in its own store under its own `frp:` namespace:

- **band** — where the learner reads, and where Eclipse is probing.
- **registers** — per-category counts (academic, formal, idiom, technical, literary, everyday),
  Laplace-smoothed so an unseen category sits at 0.5 rather than at an extreme. The two weakest go
  to the model as `focusRegisters`.
- **concepts** — every wording met, and whether it is owed a reappearance.

A miss always re-owes a wording. Two consecutive recoveries retire it. That state machine is what
produces the brief's fourth round.

---

## How an item is chosen

```
score = 0.40 · proximity     (closeness to the target complexity)
      + 0.30 · owed          (1.0 for a wording previously missed)
      + 0.20 · confidence
      + 0.10 · salience
```

Two rules sit above the score, both borrowed from Translate Mode:

- **Owed wordings form a hard tier.** A weighted preference makes reappearance likely; a tier makes
  it certain, and only the second is worth printing in the UI.
- **Owed wordings bypass the complexity window.** A wording is owed precisely because it was too
  hard, so the miss will usually have pushed the band below it. Filtering first would guarantee that
  the items most worth repeating can never come back.

Placement rules: up to 60 per page · two per block · never two in a sentence · never overlapping
ranges · never the same wording twice · never more than **6%** of eligible words. The density ceiling
is lower than Translate Mode's 8% because a paraphrase covers a clause where a translation covers a
word.

---

## Manual selection

Selecting 3–160 characters of article prose raises a floating **Simplifier cette formulation**
affordance. The selection must occur exactly once in its sentence — otherwise the server cannot bind
the item to an unambiguous span, and the offer simply does not appear.

Asking is not failing. A manual request never counts as an attempt and never pushes ambition
negative; it nudges the band down by a quarter of a miss and marks the wording owed.

---

## Ownership and storage

| Key | Area | Contents |
| --- | --- | --- |
| `eclipse:paraphrase-profile:v1` | `local` | Band, register counts, concept records, interaction log |
| `eclipse:paraphrase-cache:v1` | `local` | Up to 100 sentence-free templates, keyed by scoped SHA-256 |
| `eclipse:paraphrase-session:v1` | `session` | The single active paraphrase session |

The cache scope includes the complexity bucket: an item generated for a learner aiming at 0.4 is not
a valid exercise for one aiming at 0.8, so replaying it across bands would defeat the adaptive
mechanism. The full submitted sentence is stripped before writing and rebound on read; the short
spans the exercise is made of — the original wording and the clue — necessarily remain, exactly as
Translate Mode's cache retains its source and clue fields.

Answers have exactly one writer, the background bridge, behind a serialized queue and idempotent on
`interactionId`. A profile that fails validation is reported as `PROFILE_INCOMPATIBLE`, never
overwritten.

The register map is stored keyed by plain string rather than by the register enum. `z.record` over an
enum is exhaustive, so adding a seventh category would otherwise make every existing profile
unreadable — a learner told their data is corrupt because Eclipse learned a new word for "idiom".

---

## Deliberate limitations

- **The two lenses will not share a tab.** Starting Paraphrase Mode where Translate Mode is running
  is refused, and the popup offers to end that session through its own `STOP_SESSION` message rather
  than reaching into its state. A page carrying gold substitutions *and* periwinkle simplifications
  is not two features; it is a page whose original text the reader cannot reconstruct.
- **The mode assumes a reader who already follows French prose.** The band is seeded from the DELF
  lens, but at A1 an all-French exercise has limited value.
- **Provider errors are reported in the paraphrase session record**, not in
  `eclipse:provider-settings:v1`. Writing there would surface Paraphrase failures in the Translate
  Mode AI beacon, which is state this mode does not own.

---

## Running it

```bash
npm run api          # serves /api/context-traps and /api/paraphrase on 8787
npm run demo         # http://127.0.0.1:4321/paraphrase-fr.html
npm run build        # emits content-scripts/paraphrase.js alongside eclipse.js
```

Open the French demo page, click the Eclipse toolbar icon, switch the lens to **Paraphrase**, and
press **Start Paraphrase**.

`GET /api/paraphrase/health` reports whether a provider is configured, without exposing the key.

---

## Tests

| Suite | What it covers |
| --- | --- |
| `tests/unit/complexity.test.ts` | The four rounds from the brief, oscillation bounds, register ranking |
| `tests/unit/paraphrase-validation.test.ts` | The item contract, including every way a choice set can leak the answer |
| `tests/unit/paraphrase-profile.test.ts` | The owed-wording state machine, idempotency, pruning |
| `tests/unit/paraphrase-storage.test.ts` | Cache scoping and revalidation, profile-incompatible policy |
| `tests/unit/paraphrase-port-rpc.test.ts` | Correlation, timeouts, disconnect — every request settles |
| `tests/dom/paraphrase-place.test.ts` | DOM binding, the window filter, and the owed bypass |
| `tests/dom/paraphrase-session.test.ts` | Activation, restoration, answering, manual selection |
| `tests/api/paraphrase.test.ts` | The endpoint, the second validation pass, and the logging policy |
