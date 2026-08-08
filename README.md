# Eclipse

A Chrome extension that swaps words on the pages you already read, at the level
you can handle. You learn a little on every page and never open a study app.

English speaker learning Mandarin. Phases 0 and 1 are built and tested.

---

## Where the project is

| Phase | What | State |
|---|---|---|
| 0 | Word list built from open data | done |
| 0 | Hack Club AI probed; model chosen | done |
| 1 | The engine: word store, memory, picker, dials, marking | done, 39 tests pass |
| 1 | Bayesian ability model + uncertainty-aware selector | done |
| 1 | Balance loop proved by simulation | done, 11 checks pass |
| 5 | Model bake-off | done — `google/gemini-3.5-flash-lite` |
| 2 | Extension shell — worker, content script, options, popup | done |
| 3 | Live text on real pages | done, needs testing in Chrome |
| 4 | Engine joined to the model | done, verified end to end |

---

## Load it in Chrome

```bash
npm install
```

```bash
npm run build
```

Then in Chrome:

1. Go to `chrome://extensions` and switch on **Developer mode**.
2. **Load unpacked**, and choose the `dist` folder.
3. Open Eclipse's **Settings** and paste your Hack Club API key. Set your HSK level.
4. Open an ordinary article — Wikipedia is a good first try.
5. Click the Eclipse toolbar button and **Turn on for this site**.
6. Mandarin words appear. Click one, type what you think it means, press enter.

`npm run watch` rebuilds on save. Chrome still needs the reload button on the
extensions page to pick up a change.

**It is off on every site until you switch it on**, and it refuses outright on
banking, email, health and sign-in pages. That refusal is not a setting.

### Changing how much Mandarin you get

**Settings → How much Mandarin per screen.** Gentle, Normal or Intense.

| | most of a sentence swapped | unfamiliar words per screen |
|---|---|---|
| Gentle | 25% | 1 |
| Normal | 60% | 2 |
| Intense | 80% | 3 |

It is a **ceiling, not a target**. The balance loop still works out how much
this particular page can carry and stays under your choice. There is no way to
ask for an exact number of words, and that is deliberate: how many a page can
carry depends on how many of them you happen to know, which changes page by
page and week by week.

Two hard limits ignore the setting entirely — 85% density and 3 unfamiliar
words. Past those it stops being reading.

To change the presets themselves, edit `INTENSITY` in
`src/engine/balance.ts`. To change how much page is processed per request,
edit `visibleTextNodes(12)` in `src/content/index.ts`.

### What one screen costs

Measured end to end with `npx tsx scripts/smoke.ts`: five sentences, six words
swapped, **2.0 seconds and $0.00115**.

---

## Try the engine on its own

Nothing here needs a browser or a network.

```bash
npm install
```

Run the tests:

```bash
npm test
```

Watch the balance loop find a learner's level from nothing:

```bash
npm run sim
```

Search for better dial settings:

```bash
npm run tune
```

Rebuild the word list from source (needs network once):

```bash
npm run build:words
```

---

## Talking to the model

Put your key in `.env` or `.env.local` (both gitignored, both names accepted):

```bash
echo "HCAI_KEY=your_key_here" > .env
```

Probe the provider, then run the bake-off:

```bash
npm run probe
```

```bash
npx tsx bench/run.ts
```

### What the probe found

**Hack Club AI is an OpenRouter proxy.** That is not documented, but the error
shape and the usage fields give it away, and it means OpenRouter's routing
options work.

| finding | why it matters |
|---|---|
| real rate limit is **750 per 30 minutes** | 25 a minute, not the 450 the docs state |
| `response_format` with a JSON schema **works** | no line parser needed |
| `provider: {sort: "latency"}` | **1423ms to 729ms**, roughly twice as fast |
| `reasoning: {enabled: false}` is refused | *"Reasoning is mandatory for this endpoint"* |
| prompt 34 to 4038 tokens costs 723ms to 809ms | **input is nearly free, so batch hard** |

### Choosing the model

Reasoning models are the wrong tool here. Code has already made every
decision; the model only writes one sentence. Thinking about it is pure waste:

| model | reasoning tokens | time | cost per page |
|---|---|---|---|
| `google/gemini-3.5-flash-lite` | **0** | 2.7s | **$0.0032** |
| `meta/muse-spark-1.2` | 2746 | 11.8s | $0.0312 |
| `anthropic/claude-sonnet-5` | 231 | 16.5s | $0.0528 |
| `openai/gpt-5.6-sol` | 1189 | 12.2s | $0.1029 |
| `google/gemini-3.6-flash` | 1226 | 6.5s | $0.19 |

`google/gemini-3.5-flash-lite` wins on every axis at once: fastest, cheapest by
ten to thirty times, and it applied the most swaps (34 of 35).

### Keeping it fast

For a realistic eight sentence screen:

| setup | total | first byte |
|---|---|---|
| schema echo, default routing | 1688ms | |
| latency routing, return only the edits | **1221ms** | |
| the same, streaming | 1243ms | **552ms** |

Three things do the work. Route for latency. Return only the *edits* rather
than echoing each sentence back, since the code already has the sentence.
Stream, so the first swap lands in about half a second while the English is
already on screen.

---

## How it works

### The split that matters

**Code decides difficulty.** Which words get swapped, how many, and whether an
answer was right.

**The model decides wording.** It takes a sentence and a short list of approved
words and writes the mixed sentence so it reads well.

The model never chooses the difficulty. That is what keeps the product steady,
and it is why the whole learning loop can be tested with no network at all.

### The word store

There are 11,245 words worth teaching, so one learner's whole record is about
190 KB. At that size a database costs more than it gives. This is five flat
arrays in memory, saved as one lump of bytes.

Every word's ID is its position in frequency order. ID 0 is the most common word
in Mandarin. **So the ID is also the difficulty**, and "find easy words this
person does not know" becomes a scan from 0 upward. No index, no query language.


### What we believe about the learner

Not a number — a distribution. Item response theory with a Gaussian belief:

```
ability      theta ~ N(mu, sigma)
difficulty   b = log(frequency rank + 1)
P(correct)   sigmoid(0.9 * (theta - b))
```

Difficulty is the *log* of the rank because vocabulary works that way: the gap
between rank 10 and rank 100 is a real jump, the gap between 9000 and 9090 is
nothing.

Tracking how *unsure* we are is what the old single number could not do, and
three useful behaviours fall out of it for free:

- A stranger produces predictions near a coin flip. Confidence has to be earned.
- Uncertainty grows while nobody is watching, so someone who studied elsewhere
  for a month is an open question again.
- A genuine shock widens the belief, which makes the selector go and find out.
  That is the honest version of "correct quickly when you have leaned too far",
  and it replaced a hand-tuned rule.

### Choosing what to ask

Two things can make a word worth showing, and which one matters depends on how
well we know the learner.

**Flow** — they will probably, but not certainly, get it right. This is what
makes reading feel good.

**Information** — we genuinely cannot predict the outcome. Its answer tells us
the most about their level.

A system that only chases flow never finds out it is wrong. One that only
chases information feels like an exam. So the two are mixed, and uncertainty
sets the mix. Flow always keeps at least half the vote — the reader is reading
a web page, not sitting a test.

### The balance loop

A person who balances well is not a person who never leans. They are a person
who corrects fast.

Two dials, both moved by the same rule after each screen:

- **density** — how much of a sentence gets swapped
- **new word budget** — how many never-seen words may appear on one screen, capped at 2

Target accuracy is 85%. At 100% you learn nothing; at 50% you close the tab.

Measured over 200 simulated pages, starting from no knowledge of the learner:

```
accuracy held             86.9%   (target 85%)
page to page swing        19.5 points
Brier score               0.127   (below 0.13 beats guessing the average,
                                   so the probabilities carry real information)
level found               1231    (real 807, told nothing at the start)
level after the learner
jumped 800 -> 3000        2580    (real 3034, tracked within a few percent)
recovery to target        3 pages
beginner accuracy         81.3%
```

The Brier score is the check that matters for a model that reports
probabilities. A sensible-looking point estimate proves nothing; what matters
is whether "85%" happens 85% of the time.

### Is the Bayesian model actually better? Not measurably.

`npm run ablate` runs three versions against identical learners on identical
seeds, changing only how much of the ability model is switched on.

| variant | accuracy | swing | Brier | level error | recovery |
|---|---|---|---|---|---|
| A point estimate (the older design) | 0.852 | 0.202 | 0.142 | **0.236** | **6.1** |
| B uncertainty tracked, not used | 0.839 | 0.250 | 0.154 | 0.622 | 6.5 |
| C uncertainty used to seek information | **0.862** | 0.209 | **0.133** | 0.395 | 11.0 |

Two things here are real. **B is worse than both** — tracking uncertainty
without using it to choose questions is strictly harmful. And **A finds the
level more precisely and recovers about twice as fast**, because exploring
means asking questions whose answers you cannot predict, which by definition
pulls accuracy away from the target.

Everything else is noise. Sweeping the exploration budget gave 0.862, then
0.849, then 0.868 — no trend. A page yields only three to six answers, so
per-page accuracy is quantised and eight seeds cannot separate these.

So the Bayesian version is kept for reasons the simulation cannot test, not
because it wins on the numbers:

- it needs no invented starting level for someone it has never met
- it loosens its belief over a gap, so returning after a month is handled
- it can report a range instead of a false precision

Anyone claiming it is the better system on this evidence would be overstating
it. The level-accuracy regression is a real open cost.

---

## Decisions that changed during the build

The approved plan said some things that turned out to be wrong once the code
existed. These are the changes and the reasons.

**The word data ships as one string in a `.ts` file, not as `.bin` or `.json`.**
A JSON module with 17,000 keys makes loaders try to create a named export per
key, and it breaks. A single string constant is something every tool already
handles, and parsing it costs a few milliseconds at startup.

**There is no separate English index file.** It is fully derivable from the
meanings in the word list, so it is built on load. That removed 400 KB and a
file that could have fallen out of step with the other one.

**An English lemmatizer was needed and was not in the plan.** Dictionaries store
"have" and "apple"; real pages say "has" and "apples". Without this step
Eclipse misses most verbs and most plurals, and pages come out nearly empty.
See `src/engine/lemma.ts`.

**There is a third lever, derived rather than stored.** Swapping *more* words
runs out of room: a strong reader on a simple page pins density at maximum and
the page is still too easy. So once density is high, the picker starts hunting
*harder* words instead of more of them. See `targetKnown` in `balance.ts`.

**A glance is not evidence.** The first version treated a word shown and
scrolled past as a small fraction of a correct answer. Most words are never
clicked, so glances outnumber real answers several times over, and each one
pushed the level estimate up. Across 200 simulated pages the estimate drifted
to five times the learner's real level. Silence usually just means the reader
was reading.

**Only the first answer on a word counts toward ability.** Item response theory
assumes each item is separate evidence. A word answered five times is one fact
counted five times, and since Eclipse deliberately brings back words the
learner got right, feeding every repeat in ratchets the estimate upward — it
measured 2.5 times the truth. After the first answer a word belongs to FSRS.
The split is clean: ability asks *is this word in their vocabulary*, memory
asks *can they retrieve it today*.

**Prepositions are never swapped alone.** The bake-off caught the engine
offering 叫 ("to call") as the translation of "by". Prepositions almost never
map one to one between languages, so the dictionary match is close to random.
A learner who trusts that has learned something false, which is worse than
learning nothing.

**Word sense beats word frequency.** Sorting candidates by frequency alone
taught that 地方 means "room" — it is a common word that lists "room" far down
its meanings, but it really means "place". Ranking by how central the meaning
is to the word, and only then by frequency, gives 房间. Same fix gives 门 for
"door" and 信 for "letter".

**The dials have a speed limit, and the hard correction is reserved for real
trouble.** The plan said "fall three times faster than you climb". Built that
way, the loop cannot settle *on* its target at all — it settles wherever the two
pulls cancel, measured at 93% against an 85% target, meaning a learner who is
never challenged. Worse, a large gain with no bound on step size makes the dial
slam between its limits page after page. The fix was to bound the step and use
the hard gain only when the learner is genuinely struggling rather than for
every wobble. Values came from `npm run tune`, not from guessing.

---

## Layout

```
data/build-wordlist.ts     offline; builds the word list from open sources
src/data/words.ts          generated; 11,245 words, 601 KB
src/engine/
  ability.ts               Bayesian level estimate, uncertainty, information
  words.ts                 word list access, English index, lemma-aware lookup
  lemma.ts                 English inflection back to dictionary form
  store.ts                 the five arrays, FSRS memory, save and load
  balance.ts               the dials and the correction rule
  picker.ts                chooses which spans to swap
  score.ts                 marks what the learner typed
  engine.test.ts           48 tests
src/background/
  prompt.ts                what we ask the model, and the schema we demand back
  validate.ts              checks the answer before it can reach the page
bench/
  corpus.ts                40 ordinary English sentences
  simulate.ts              the proof that the balance loop works
  tune.ts                  searches for dial settings
  run.ts                   the model bake-off
  ablate.ts                does the Bayesian machinery earn its place?
scripts/
  probe.ts                 Phase 0 questions about Hack Club AI
  latency.ts               what actually makes a request slow
  smoke.ts                 the whole pipeline end to end, without Chrome
  key.ts                   finds your API key
src/content/
  index.ts                 finds text, asks the worker, draws the result
  eclipse-word.ts          one swapped word and its answer box
src/options/  src/popup/   settings and the toolbar panel
public/manifest.json       Manifest V3
build.mjs                  esbuild; `npm run build` -> dist/
```

---

## Sources

- Word list: [complete-hsk-vocabulary](https://github.com/drkameleon/complete-hsk-vocabulary) (CC BY-SA 4.0), which joins HSK levels, [SUBTLEX-CH](http://openlexicon.fr/datasets-info/SUBTLEX-CH/README-subtlex-ch.html) frequency and [CC-CEDICT](https://www.mdbg.net/chinese/dictionary?page=cc-cedict) glosses
- Memory model: [FSRS](https://github.com/open-spaced-repetition/free-spaced-repetition-scheduler) via `ts-fsrs`
- Model provider: [Hack Club AI](https://docs.ai.hackclub.com/) — free, but teens 18 and under only, no resale, and one key may not be shared across users. Local development only. The provider sits behind one small interface so it can be swapped.
