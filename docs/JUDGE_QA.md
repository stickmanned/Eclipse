# Judge Q&A

Short, honest answers. Where a limitation exists, say it.

---

**Was the Demo B result staged?**

No, and you can check it. Reset all Eclipse data and start Eclipse on Demo B first — `attendre` will not be there. On a fresh profile, four other concepts outrank it. It appears only after you answer it wrong on Demo A. The behaviour is driven by a `due` flag on the concept and a hard priority tier in selection, and it is asserted in both `tests/dom/transfer.test.ts` and the E2E suite.

---

**Why does it need a click on every page? Every other extension just works.**

Because every other extension asked for `host_permissions` on every site you visit. Eclipse ships with `activeTab`, which grants access to one tab, temporarily, after you invoke it — and to nothing else. There is no `host_permissions` in the manifest at all.

That is the trade, and it is deliberate: standing access to the whole web is a very large ask for a vocabulary exercise. One click is the price of not making it.

---

**How do you avoid breaking pages?**

Three things.

First, scope: Eclipse only reads text inside `p`, `li` and `blockquote`, and skips anything under a link, button, form field, `code`, `pre`, `nav`, `header`, `footer`, `aside`, `[contenteditable]` or `[aria-hidden]`. Text under a link still counts toward the sentence it quotes, but is never replaced.

Second, precision: it replaces an exact character range inside a _single_ text node. A match that would cross an inline element is dropped rather than spliced.

Third, restoration: it records the original text and puts it back, normalising only the token's immediate parent. There is no HTML snapshot and no `innerHTML` anywhere in that path. If the page rewrites a branch Eclipse owns, it stops immediately and reports `DOM_INVALIDATED` rather than trying to repair anything.

---

**So it does restore the page exactly?**

It restores the **normalized visible text** exactly — captured before the first mutation, compared after the last restoration, asserted in two test suites. It does not promise byte-identical `innerHTML`, because splitting and rejoining text nodes changes node boundaries. The honest version of that guarantee is the one we make.

---

**Is there an LLM in this?**

Not in the path you just saw. The demo, the transfer, and the Truth Cards all run from a curated catalog that ships inside the extension. Disconnect the network and everything still works.

There is an _optional_ local server that proposes additional traps with Gemini 3.5 Flash-Lite. It is off by default, has a four-second client timeout, and validates output against the same rules the catalog passes before anything renders. Catalog-rich pages never wait for it. When an eligible page has fewer than two catalog traps, enabled AI gets one bounded attempt to supply the initial exercise; failure leaves the page untouched and returns an actionable popup error.

---

**What stops a malicious page from injecting content through your AI feature?**

Layered. The prompt states that page sentences are untrusted data and must never be followed as instructions. But the prompt is not the defence — the validator is. Everything the model returns is checked for markup, event handlers, URLs, Markdown links, template syntax, control and bidi characters, and instruction-shaped phrasing; it must clear a 0.8 confidence floor; and each trap must bind to a sentence the client actually sent.

`tests/api/context-traps.test.ts` includes a case where the model _complies_ with an injected instruction. The trap is dropped. The prompt failing is a scenario we test, not one we hope against.

---

**What data leaves my machine?**

With AI traps off — the default — nothing at all. No network requests are made.

With them on: at most eight sentences of article text go to a server on `localhost:8787` that you run yourself, and that server sends those sentences to Google Gemini. Never the page URL, profile, or answer history. The cache key is a scoped SHA-256 digest and the cached template omits the full sentence, though it retains the short source and clue spans required to replay the exercise. The server logs event names, counts, and durations only; a test searches captured logs for submitted/generated content.

---

**Is the moon a proficiency score?**

No, and we are careful not to imply it. It is a study signal over a dozen curated concepts in a short session. Full moon requires a score of 1.25 or higher **plus** at least three attempts and two correct — a single lucky guess never fills it. No CEFR mapping, no level claim.

---

**Why French, and why these words?**

One pair, done properly. The catalog is built around the three ways a French word actually ambushes an English reader: false friends (`actuellement` is not "actually"), polysemy (`appel` is a call, except in a courtroom), and idioms that do not decompose (`avoir le cafard`). Every entry carries required context, forbidden context, and a clue that must be quotable from the sentence — so `appel` only becomes a trap when a lawyer and a verdict are present, and never when something merely "has wide appeal".

---

**Why does one word appear on Demo A but not on Demo B for a new user?**

Selection maximises uncertainty — it prefers the item you are least sure about. `attendre` is the easiest of the candidates, so when five concepts compete for four slots on a fresh profile, it loses. Once you owe it, it takes a hard priority tier and always wins. That is the mechanism the demo is showing you.

---

**What did you cut?**

Automatic transformation, a chatbot, text-to-speech, accounts and sync, analytics, more language pairs, full-page translation, and a separate dashboard. The optional provider was the designated first cut if the schedule slipped; it survived because the core gates went green first, which was the condition for starting it.

---

**How much of this is tested?**

294 unit, DOM and API tests, plus 35 browser end-to-end scenarios against a real Chrome with the extension loaded. `npm run check` runs typecheck, lint, format, tests and the production build.

One thing worth knowing: `activeTab` is granted by a real toolbar click, which no automation driver can produce. The E2E suite therefore uses a separate build with only the demo and fake-provider loopback hosts required; another test reads the **shipped** manifest from disk to prove required host access is absent. That is written down in `docs/KNOWN_LIMITATIONS.md` rather than left for you to find.

---

**What would you do next?**

Widen the catalog — coverage is the honest ceiling on usefulness right now, and it is limited by curation rather than by anything architectural. After that, a review view for concepts that are due but have not appeared on any page recently, since the current design can only surface a concept when an article happens to contain it.
