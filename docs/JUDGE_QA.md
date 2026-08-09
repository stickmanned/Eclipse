# Judge Q&A

Short, honest answers. Where a limitation exists, say it.

---

**Was the Demo B result staged?**

No, and you can check it. Reset all Eclipse data and start Eclipse on Demo B first — `attendre` will not be there. On a fresh profile, four other concepts outrank it. It appears only after you answer it wrong on Demo A. The behaviour is driven by a `due` flag on the concept and a hard priority tier in selection, and it is asserted in both `tests/dom/transfer.test.ts` and the E2E suite.

---

**Why does it need a click on every page? Every other extension just works.**

Because every other extension asked for `host_permissions` on every site you visit. Eclipse ships with `activeTab`, which grants access to one article tab temporarily after you invoke it. Its only standing host permission is `localhost:8787` for the AI service; there is no broad access to article sites.

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

Yes. AI is the main coverage path: a local server proposes level-matched vocabulary and complete phrases with Gemini 3.5 Flash-Lite. It has a 20-second client timeout and an 18-second server timeout per attempt, retries one transient browser/API failure plus one transient Gemini overload, and validates output against the same rules as the bundled fallback catalog before anything renders. Generation runs in bounded batches before one atomic placement pass; failure leaves a catalog-free page untouched and returns an actionable popup error.

---

**What stops a malicious page from injecting content through your AI feature?**

Layered. The prompt states that page sentences are untrusted data and must never be followed as instructions. But the prompt is not the defence — the validator is. Everything the model returns is checked for markup, event handlers, URLs, Markdown links, template syntax, control and bidi characters, and instruction-shaped phrasing; it must clear a 0.8 confidence floor; and each trap must bind to a sentence the client actually sent.

`tests/api/context-traps.test.ts` includes a case where the model _complies_ with an injected instruction. The trap is dropped. The prompt failing is a scenario we test, not one we hope against.

---

**What data leaves my machine?**

Article text and the selected DELF level go in batches of at most eight sentences to a server on `localhost:8787` that you run yourself, and that server sends them to Google Gemini. Never the page URL, mastery records, or answer history. The cache key is a level-scoped SHA-256 digest and the cached template omits the full sentence, though it retains the short source and clue spans required to replay the exercise. The server logs event names, counts, and durations only; a test searches captured logs for submitted/generated content.

---

**Is the moon a proficiency score?**

No. The moon is item-mastery progress. DELF A1–B2 is a separate reading lens chosen directly or estimated by the eight-question diagnostic; that diagnostic is a practical starting point, not an official exam or certificate. Full moon still requires sustained evidence, so a single lucky guess never fills it.

---

**Why French, and why these words?**

One pair, done properly. AI selects ordinary high-value words, complete phrases, connectors, idioms, false friends, and polysemous vocabulary at the learner's DELF level. Every item still carries an exact source span and a clue quotable from the sentence, and every generated field passes strict validation before placement.

---

**Why does one word appear on Demo A but not on Demo B for a new user?**

Selection maximises uncertainty — it prefers the item you are least sure about. `attendre` is the easiest of the candidates, so when five concepts compete for four slots on a fresh profile, it loses. Once you owe it, it takes a hard priority tier and always wins. That is the mechanism the demo is showing you.

---

**What did you cut?**

Automatic transformation, a chatbot, text-to-speech, accounts and sync, analytics, more language pairs, full-page translation, and a separate dashboard.

---

**How much of this is tested?**

294 unit, DOM and API tests, plus 35 browser end-to-end scenarios against a real Chrome with the extension loaded. `npm run check` runs typecheck, lint, format, tests and the production build.

One thing worth knowing: `activeTab` is granted by a real toolbar click, which no automation driver can produce. The E2E suite therefore uses a separate build with only the demo and fake-provider loopback hosts required; another test reads the **shipped** manifest from disk to prove required host access is absent. That is written down in `docs/KNOWN_LIMITATIONS.md` rather than left for you to find.

---

**What would you do next?**

Widen the catalog — coverage is the honest ceiling on usefulness right now, and it is limited by curation rather than by anything architectural. After that, a review view for concepts that are due but have not appeared on any page recently, since the current design can only surface a concept when an article happens to contain it.
