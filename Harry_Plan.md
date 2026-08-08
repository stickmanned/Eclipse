# Eclipse, Harry's plan. Please note that this is a distinct copy of a plan so treat this as a new plan instead of conflicting with existing

## Context

You want a Chrome extension. It changes words on the pages you already read. It swaps English words for Mandarin words. It swaps only the words you can handle right now. You learn a little on every page, and you never open a study app.

Two ideas drive the design.

**Balance.** A person who balances well is not a person who never leans. They are a person who corrects fast. The extension will guess wrong about your level. That is fine. It must notice and correct within one or two pages.

**Context injection.** Do not start from zero every time. Keep a record of the words you know. Use it to make the first guess close.

Right now `Eclipse_Local/` is empty. The GitHub repo `stickmanned/Eclipse` has only a README. This is a fresh build.

**Decisions you made:** Chrome extension. A few weeks of work. Your own Hack Club key, local dev only.

---

## What we build

One extension. English speaker learning Mandarin. Loaded unpacked in Chrome, in developer mode.

The user reads a normal page. Some words are Mandarin. The Mandarin words glow in the Eclipse colour. The user clicks one. A small box opens. The user types what they think it means. The box says right or wrong. The page keeps its shape.

---

## The core split: what code decides, what the model decides

This is the most important choice in the plan.

**Code decides difficulty.** Code picks which words to swap. Code counts right and wrong. Code moves the dials.

**The model decides wording.** The model takes a sentence and a short list of approved words. It writes the mixed sentence so it reads well.

Why split it this way:

1. Difficulty stays steady. The model cannot decide to get ambitious on its own.
2. You can test the difficulty rules without spending money or waiting on the network.
3. The model's job is small. Small jobs fail less.
4. You can check the model's answer. If it uses a word you did not approve, you throw the answer away.

---

## Part A — The word store

### How big is this really

Check the size before you choose a tool.

- Mandarin words worth teaching: about 20,000. The top 20,000 words cover almost all everyday text.
- HSK 3.0 has 11,092 words in total.
- A learner has history on a few thousand words at most.

So the whole record for one user is under half a megabyte.

**That means no database engine is needed for the fast path.** Vector stores, graph stores, and SQL all cost more than they give at this size. They start to pay off about a thousand times higher. Keep the data in plain arrays in memory. Save it as one lump of bytes.

### The shared part (same for every user)

Build this once, offline. Ship it inside the extension.

Give every Mandarin word a number. Sort the words by how often they appear. The most common word is 0. The next is 1. **The number is also the difficulty.** A low number is an easy word.

That one trick removes most of the work. "Give me easy words the user does not know" becomes a scan from 0 upward. No index. No query language.

Files to build:

- `data/words.bin` — one record per word: the characters, pinyin, HSK level, part of speech.
- `data/en2zh.bin` — English word to a list of Mandarin word numbers.

Sources, all open licence:

- [CC-CEDICT](https://www.mdbg.net/chinese/dictionary?page=cc-cedict) — 124,727 entries, English glosses, CC BY-SA 4.0.
- [SUBTLEX-CH](http://openlexicon.fr/datasets-info/SUBTLEX-CH/README-subtlex-ch.html) — word frequency from 33.5M words of film subtitles. Use this for the sort order. Subtitle frequency matches daily speech better than book frequency.
- [complete-hsk-vocabulary](https://github.com/drkameleon/complete-hsk-vocabulary) — HSK 2.0 and 3.0 levels as JSON.

The build script `data/build-wordlist.ts` joins these three and writes the two binary files. Run it by hand. Commit the output.

### The per-user part

Four arrays. Each one is indexed by the word number.

| Array | Type | Size | Holds |
|---|---|---|---|
| `seen` | `Uint8Array` | 20 KB | 0 means never shown. |
| `stability` | `Float32Array` | 80 KB | How slowly this word fades. |
| `difficulty` | `Float32Array` | 80 KB | How hard this word is for this person. |
| `lastSeen` | `Uint32Array` | 80 KB | Day number of the last review. |

Total: 260 KB. Read a value in one step. No lookup logic at all.

Use dense arrays over all 20,000 words, not a sparse map. Dense wastes about 200 KB and removes a whole class of bugs. Take that trade.

Save the four arrays as one blob in IndexedDB. Write no more than once every 5 seconds. Also write when the tab closes.

### One number that does most of the work

Store `reachRank`. It is one integer. It means: *this person reliably knows words down to about this position in the frequency list.*

When you have no record for a word, guess from `reachRank`:

```
P(knows the word) = sigmoid((reachRank - rank) / spread)
```

This is why the extension is useful on the very first page, before it knows anything about you. It is the cheapest form of context injection, and it is stronger than any per-word data you have on day one.

### The answer log

Keep a second store. Append one row per answer. Never edit it. Never delete it.

```
{ ts, wordId, shownAs, userTyped, correct, pageHash }
```

The four arrays are a summary you can throw away. The log is the truth. When you change how memory works, replay the log and rebuild the arrays. Without this you cannot improve the model later, because the data is already gone.

### Importing from Duolingo — read this before you build it

**The unofficial Duolingo API stopped working in February 2023.** The Python and Java libraries are unmaintained. Do not build against it.

Use these instead:

1. **Self-report.** In the options page: "About what HSK level are you?" That sets `reachRank` directly. Takes the user four seconds and gets you 80% of the value.
2. **Official data export.** Duolingo lets a user download their own data from account settings. The user drops that file into the options page. Read the word list out of it.

Both are honest, both work today, and neither can break when a private endpoint changes.

---

## Part B — The balance loop

### The target

Aim for **about 85% correct**.

Not 100%. If the user gets everything right they learn nothing new.
Not 50%. If half is wrong they close the tab.

Treat 85 as a setting, not a law. Test other values later.

### Two dials

**Density** — how much of a sentence gets swapped. A number from 0 to 1.

**Reach** — how far past known words we go. This controls brand-new words.

### The correction rule

After each batch of answers:

```
error = accuracy_this_batch - 0.85

if error > 0:  density += SLOW * error      # doing well, climb gently
if error < 0:  density += FAST * error      # struggling, drop hard
```

`FAST` is about three times `SLOW`. Fall quickly, climb slowly. That is what good balance looks like: the correction is fast, the drift is slow.

Move `reach` by at most one word per page. A new word is a big event.

### The rule that matters more than the dials

**Never show more than two words the user has never seen, on one screen.**

Look at Round 3 in your example. Exactly one unknown word, 蓝. Everything else was known or guessable. That cap does more for the feel of the product than any tuning.

### After a wrong answer

Two things happen.

1. Show the right answer straight away, in the box.
2. Put the word in a short queue. It must come back within the next one to three pages.

That is Round 4 in your example. Long-term scheduling is a different job: use [FSRS](https://github.com/open-spaced-repetition/free-spaced-repetition-scheduler) through the `ts-fsrs` package. FSRS handles days and weeks. The short queue handles the next five minutes. You need both.

### What counts as evidence

Be strict here, or the numbers lie.

| What happened | What it means |
|---|---|
| User clicked and typed | Strong. Feed it to FSRS. |
| User clicked, got it wrong | Strong. Feed it to FSRS. |
| Word shown, user scrolled past, no click | Weak. Log it. Nudge `reachRank` only. Do not feed FSRS. |

Clicking is optional in this product. Most words will never be clicked. If you treat "not clicked" as "knows it", the difficulty will run away upward.

---

## Part C — The extension

### The pieces

Chrome Manifest V3. Four parts.

| Part | Job |
|---|---|
| **Service worker** (`src/background/`) | Owns the word store. Owns the dials. Makes all model calls. Holds the API key. |
| **Content script** (`src/content/`) | Reads text on the page. Asks the worker what to swap. Swaps it. Handles clicks. |
| **Options page** (`src/options/`) | API key. Language pair. HSK self-report. Duolingo file import. Site blocklist. |
| **Popup** (`src/popup/`) | On/off for this site. Today's count. Current difficulty. |

The service worker makes the network calls, not the content script. This avoids cross-origin problems and keeps your key out of the page.

### How to change text without breaking the page

This is the part that will eat your time. Be specific about it.

**Do not** set `textContent` on existing nodes. React and similar frameworks will overwrite you, and you lose the original text.

**Do** this:

1. Walk the page with a `TreeWalker` over text nodes. Only inside `p, li, h1–h6, td, blockquote, figcaption`. Skip `script`, `style`, `code`, `pre`, `input`, `textarea`, anything `contenteditable`, and anything inside `[aria-hidden]`.
2. Only process text that is on screen or near it. Use an `IntersectionObserver`. This keeps the page fast and protects your request budget.
3. Split the text node. Put a custom element in the middle:
   `<eclipse-word data-en="a blue apple">一个蓝色的苹果</eclipse-word>`
   Register it with `customElements.define`. The click handler lives on the element. The answer box lives in the element's shadow root, so page CSS cannot break it.
4. Watch for the page rewriting itself with a `MutationObserver`. Ignore changes you caused yourself. Wait 200 ms after the page settles, then re-apply from cache. Re-applying from cache is free.
5. To turn it off: read `data-en` back out and put the English text back.

### Permissions

Ask for `<all_urls>` in the manifest, but keep the extension **off by default on every site**. The user turns it on per site from the popup.

Ship a blocklist that cannot be turned off: banking, email, health, and anything with a password field on screen. Page text goes to a third-party model. That must never happen quietly on someone's bank page.

---

## Part D — The model call

### Provider

Hack Club AI. OpenAI-compatible.

- Base URL: `https://ai.hackclub.com/proxy/v1`
- Header: `Authorization: Bearer YOUR_KEY`
- Endpoint: `POST /chat/completions`

**Limits you must design around:**

- **450 requests per 30 minutes.** That is 15 per minute. One request per sentence will not work.
- **Teens 18 and under only. No resale. No proxying one key to many users.** This build is local dev with your key. It cannot ship to other people as-is. Keep the provider behind one small interface so swapping it later is a one-file change.
- Supported settings: `temperature` (0–2), `top_p`, `max_tokens`, `stream`. That is all the docs list.
- **`response_format` and tool calling are not documented.** Assume they do not work.

### Staying inside 15 requests per minute

1. **Batch.** One request per screenful of text, not per sentence.
2. **Cache.** Key on `hash(sentence + the word numbers you chose)`. Scroll back up: free. Revisit the page: free. Store the cache in IndexedDB.
3. **Show English first.** Render the page immediately. Swap words in as answers arrive. Never make the user wait to read.

### Output format

No JSON schema is available, so do not ask for JSON. Ask for lines. Lines break in fewer ways and cost fewer tokens.

```
#1
S| Bob owns 一个 blue apple, the apple is magical.
A| 一个 | a blue apple -> partial | one, a, an
```

One `S|` line per sentence. One `A|` line per swap: the Mandarin, the English it replaced, then the answers you will accept.

### Check every answer before you use it

Run these in code. All must pass.

1. Every Mandarin word in an `A|` line is in the list you approved.
2. Every English word you did not ask to swap still appears, in the same order.
3. The count of `S|` lines matches the count of sentences you sent.

If a check fails: retry once. If it fails again: **leave the sentence in plain English.**

A sentence left alone is invisible. A broken sentence is worse than doing nothing.

### Marking the user's typed answer

Do this in code. No model call. The user must see the result the instant they press enter.

Accept if, after lowercasing and trimming: it matches an accepted answer, or matches a CC-CEDICT gloss, or is within one character of either (only for words of four letters or more).

When nothing matches, mark it wrong but queue it. Send unmatched answers to the model in the *next* batch, as an extra question. If the model says the user was right, correct the score then. The user sees an instant answer and a rare, pleasant "actually, that counts too."

---

## Part E — Pick the model by measuring, not guessing

You asked to tune beyond prompting. Here is what is actually available.

**`temperature`** — use 0.2 for rewriting. Test 0.0, 0.2, 0.5.
**`top_p`** — leave at 1.0. Tuning two randomness knobs at once makes results impossible to read.
**`max_tokens`** — cap tight, about twice the input length. Stops rambling. Cuts latency.
**`model`** — this is the real knob. It matters far more than the other three.

### Real models on the list today

Chinese-strong and fast: `qwen/qwen3.7-flash`, `deepseek/deepseek-v4-flash-0731`, `z-ai/glm-5.2`, `moonshotai/kimi-k3`, `tencent/hy3`, `inclusionai/ling-3.0-flash`
Cheap and fast: `google/gemini-3.5-flash-lite`, `google/gemini-3.6-flash`
Quality reference: `anthropic/claude-sonnet-5`

### The bake-off

Build `bench/`. It runs outside the browser, from Node.

1. `bench/sentences.json` — 50 fixed English sentences. Mix news, blog, docs, and dialogue.
2. For each, a fixed set of words to swap. Same input for every model.
3. Run every candidate model, at three temperatures.
4. **Score by machine:** validator pass rate, required words present, untouched English preserved, latency, output tokens.
5. **Score by hand:** does the mixed sentence read naturally? Use `anthropic/claude-sonnet-5` output as the reference. Then find the cheapest model that matches it.

Also run one five-minute probe first: send a request with `response_format: {"type":"json_schema", ...}` and see whether the proxy passes it through to the upstream model. The docs do not mention it, but OpenAI and Anthropic models are on the list, so it may work anyway. If it does, parsing gets much simpler. Find out before you build the line parser.

---

## A problem in the example, and the fix

Round 3 in your brief gives: *Bob 有 一个 蓝 苹果.*

That is not natural Mandarin. A native speaker writes 一个蓝色的苹果. Swapping one English word for one Mandarin word does not survive contact with real grammar.

**Fix:** swap **spans**, not words. "a blue apple" becomes "一个蓝色的苹果" as one unit. The model chooses where the clean seams are and reports them back. Code sets the budget; the model finds the seams.

The user still feels like words are being swapped one at a time. That feeling is right and worth keeping. The implementation underneath must work on phrases.

---

## Build order

**Phase 0 — Prove the pieces (1–2 days)**
Call Hack Club AI from a Node script. Probe `response_format`. Confirm the rate limit. Build `data/build-wordlist.ts` and produce `words.bin` and `en2zh.bin`.

**Phase 1 — The engine alone (3–4 days)**
`src/engine/`. Pure TypeScript. No browser APIs. Word store, FSRS wrapper, word picker, the two dials, answer marking. Unit tests. Write a fake learner who knows the top N words, and run 200 simulated pages. Watch the dials settle near 85%. **Do this before touching Chrome.** If balance does not work here, it will not work in a browser either.

**Phase 2 — Extension shell (2–3 days)**
Manifest, service worker, content script, options page, popup. Swap one hardcoded word on one page. Prove the message passing and the storage.

**Phase 3 — Live text (4–5 days)**
TreeWalker, IntersectionObserver, the `<eclipse-word>` element, the shadow-root answer box, MutationObserver re-apply, the off switch. Test on Wikipedia, a React news site, and an infinite-scroll feed.

**Phase 4 — Join them (2–3 days)**
Engine into the service worker. Batching, caching, validation, retry, fallback to plain English.

**Phase 5 — Bake-off and tune (2–3 days)**
Run `bench/`. Pick a model. Then use your own answer log to check whether 85% is the right target.

---

## Things that will bite

| Problem | What to do |
|---|---|
| The service worker sleeps after ~30 seconds idle | Never keep state only in memory. Write to IndexedDB. Read it back on wake. |
| React re-renders wipe your spans | MutationObserver, ignore your own changes, re-apply from cache. |
| 15 requests per minute | Batch by screen. Cache hard. Show English first. |
| Page text goes to a third party | Off by default per site. A blocklist that cannot be turned off. Say this plainly in the options page. |
| Hack Club is 18-and-under, no resale | Fine for local dev. Keep the provider behind one interface so it can be swapped. |
| The user never clicks anything | That is allowed. It just means slower learning. Do not treat silence as knowledge. |

---

## Files to create

```
Eclipse_Local/
  manifest.json                  Manifest V3
  package.json  tsconfig.json  vite.config.ts
  data/
    build-wordlist.ts            offline; joins CC-CEDICT + SUBTLEX-CH + HSK
    words.bin  en2zh.bin         committed output
  src/
    engine/                      pure TS, no browser APIs
      store.ts                   the four typed arrays, load and save
      memory.ts                  ts-fsrs wrapper
      picker.ts                  chooses which spans to swap
      balance.ts                 density and reach
      score.ts                   marks a typed answer
    background/
      index.ts                   service worker
      model.ts                   Hack Club client, validator, retry, cache
      prompt.ts
    content/
      index.ts  scan.ts  eclipse-word.ts
    options/    popup/
  bench/
    sentences.json  run.ts  report.md
```

---

## How to check it works

**Engine, without a browser.**
`npm test`. Then run the simulation: a fake learner who knows the top 800 words, 200 pages. Plot accuracy per page. It must rise and settle near 85%, not swing. Then flip the fake learner to knowing 3,000 words mid-run. The dials must catch up within about three pages. **That single test is the proof that Core #1 works.**

**Model, without a browser.**
`npx tsx bench/run.ts`. Read `bench/report.md`. Validator pass rate must be above 95% on your chosen model.

**Extension, by hand.**
1. Load unpacked in Chrome from `chrome://extensions`.
2. Paste your Hack Club key in the options page. Set HSK level to 1.
3. Open a Wikipedia article. Turn Eclipse on from the popup.
4. Check: the English shows straight away, then Mandarin words fade in. Never a blank page.
5. Click a Mandarin word. Type "one". The box says right.
6. Answer four in a row wrong on purpose. The next page must be visibly easier.
7. Turn it off from the popup. The page must go back to plain English, with nothing left over.
8. Open a React news site and an infinite-scroll feed. Scroll fast. Nothing may flicker or duplicate.
9. Open a site on the blocklist. Eclipse must stay off, and no request may leave the browser. Check the Network tab.