# Known limitations

Stated up front. Every one of these is a deliberate boundary rather than something discovered late, and each has a reason attached.

## Activation is manual on every page

Eclipse does not transform pages automatically after you navigate, and it never will while it holds only `activeTab`.

`activeTab` grants access to one tab, temporarily, after you invoke the extension. That grant does not survive navigation and does not extend to other tabs. Making Eclipse automatic would mean asking for `host_permissions` on every site you visit — a very large ask for a vocabulary exercise, and one that would be dishonest to make quietly.

So: one click per page. The popup and the README both say so rather than implying otherwise.

## Restoration is guaranteed at the level of visible text

When you end a session, Eclipse guarantees that the **normalized visible text** of the article matches what it was before activation. It is captured before the first mutation and compared after the last restoration, and both the DOM suite and the E2E suite assert it.

It does **not** guarantee byte-identical `innerHTML`. Eclipse splits text nodes to insert a token and rejoins them on the way out, which legitimately changes where node boundaries fall. Whitespace either side of a replaced span is preserved exactly, because Eclipse only ever touches the matched range.

The alternative — snapshotting your page's HTML and writing it back — would break every page with live state, and would be a much larger thing to get wrong. There is no `innerHTML` anywhere in the restoration path.

## If the page rewrites a branch Eclipse owns, the session ends

A `MutationObserver` watches for owned tokens becoming disconnected. If the host page removes or reparents one, Eclipse marks the session invalid, stops mutating immediately, and reports `DOM_INVALIDATED`.

It does not attempt repair. Reconstructing a page Eclipse did not build is exactly the kind of ambitious recovery that turns a cosmetic problem into a broken page.

## Content added after activation is not transformed

Eclipse scans once, at activation. Lazily-loaded paragraphs, infinite feeds and content injected by the page afterwards are left alone. Press Start again to pick up what is now on screen.

## Where Eclipse does not run

- **PDFs** — not HTML documents.
- **iframes** — never traversed, so embedded articles are skipped.
- **The host page's shadow roots** — never traversed.
- **`file://`, `chrome://`, extension pages, and anything non-HTTP(S)** — the popup says which, and disables Start.
- **Pages under 500 readable characters or with fewer than three eligible blocks** — reported as `NO_ARTICLE`.

## AI is required to widen coverage beyond the catalog

Twelve curated French concepts ship in the box. In catalog-only mode, an article containing none of them reports `NO_ELIGIBLE_TRAPS`. When AI traps are enabled, Eclipse can ask the local Gemini-backed server for validated replacements instead; provider failure still leaves the page unchanged.

The optional generation API widens coverage, but it is off by default. When enabled on a page with fewer than two catalog matches, that activation waits for one bounded AI attempt. Offline catalog pages remain independent of it.

## Catalog French surfaces are curated; AI surfaces are strictly validated

Eclipse does not algorithmically conjugate catalog entries. Every catalog surface — including inflected ones like `avait le cafard` — is written out as the exact form that fits its sentence pattern. Optional Gemini candidates may generate a surface, but it must pass the same locale, NFC, character, accent, confidence, and safety validation before placement.

A consequence: a replacement is a _learning device_, not a claim of grammaticality. "We had to **attendre** for the bus" is not a sentence in either language. It is an English sentence with one word hidden behind its French equivalent, which is the exercise.

## The moon is not a proficiency score

Phases reflect performance on a handful of curated concepts in a short session. They are a study aid and a progress signal. Eclipse never calls them a level, never maps them to CEFR, and never claims to measure French ability.

## Selection prefers difficulty, which can surprise you

Scoring maximises uncertainty, so it favours the item you are least sure about. A concept you find easy can be crowded out by harder ones when more candidates match than there are slots — this is why a fresh profile sees no `attendre` on Demo B. Once a concept is due, it takes a hard priority tier and always wins.

## Testing note: `activeTab` cannot be automated

`activeTab` is granted by a real click on the browser toolbar, which is outside the page and therefore outside what any automation driver can reach. An automated Chrome never receives that grant, so `tab.url` stays redacted and `scripting.executeScript` is refused.

The E2E suite therefore runs against a build that adds two test-only loopback permissions: the demo origin (`http://127.0.0.1:4321/*`) and fake generation API (`http://localhost:8787/*`). It is built to a separate output directory and all product code is identical. `tests/e2e/manifest.spec.ts` reads the real shipped manifest from disk and asserts that required host access is absent, along with `tabs`, `history`, `cookies` and `<all_urls>`.

The suite also shares one browser across tests rather than launching a fresh Chrome for each, resetting every key Eclipse writes between them. Thirty-odd sequential launches were slow and, in the tail of a run, unreliable; the state that actually needs isolating is the extension's storage, and that is cleared explicitly.

For the same reason, sessions in the E2E suite are started by sending the real `START_SESSION` message from an extension page held in a **background** tab, rather than by clicking Start in a popup — a popup opened by a driver is an ordinary tab, and if it were the active one it would target itself. Keeping it in the background makes the worker resolve the article correctly, which is also what lets the suite drive the popup's real Start/End buttons and assert its Active state. The message sent is identical to the button's; the worker, injection path, content runtime and DOM work are all exercised for real.

## Not built, on purpose

Automatic transformation · a chatbot · text-to-speech or pronunciation scoring · accounts or cloud sync · analytics · more language pairs · full-page translation · a separate dashboard · an authoritative proficiency score · any required network access.
