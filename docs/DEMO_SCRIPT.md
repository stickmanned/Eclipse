# Demo script — 60 to 90 seconds

## Before you start

```bash
npm ci
npm run build
npm run demo          # leave running
```

Load `.output/chrome-mv3` at `chrome://extensions` with Developer mode on. Pin the Eclipse icon to the toolbar.

**Reset to a clean state**: open the popup → _Reset all Eclipse data_ → _Yes, erase everything_. You should land on **Question 1 of 3**.

Have two tabs open and ready:

1. <http://127.0.0.1:4321/demo-a.html>
2. <http://127.0.0.1:4321/demo-b.html>

Do not open developer tools. Do not edit stored data. The demo is the product.

---

## The script

### 0:00 — The pitch (10s)

> "Eclipse turns any English article into a French context exercise. It hides the familiar meaning, makes you infer the truth from context, and then shows you the evidence."

### 0:10 — Calibration (10s)

Click the Eclipse icon. Three questions, ascending.

> "Three questions to find your level. You can skip it."

Answer **hello**, then **a library**, then **he feels gloomy**.

> "That last one is the whole idea in miniature — _cafard_ really does mean cockroach, but _avoir le cafard_ means you feel low. The literal reading is the trap."

### 0:20 — Activate Demo A (10s)

On the Demo A tab, click Eclipse → **Start Eclipse**.

Four gold French words appear inside the article.

> "Four words in this article are now French. Notice what didn't change — the navigation, the links, the code block, the newsletter form, the sidebar. Eclipse only touches body prose it can hand back."

### 0:30 — Answer wrong, on purpose (20s)

Click **`attendre`**.

> "Three possible meanings. I'll take the tempting one."

Choose **hope**.

The Truth Card opens.

> "Wrong — and here's why. It means _wait_. The clue is right there in the sentence: **for the bus**. You wait _for_ something. _Hope_ is _espérer_, which is an inner state, not something with an object."

Point at the moon and the note.

> "The moon tracks this concept, and Eclipse says exactly when it's coming back: **at its next appearance**."

Click **Keep reading**.

### 0:50 — Give the page back (10s)

Open the popup → **End Eclipse**.

> "And the article is back. Eclipse doesn't snapshot your page and rebuild it — it replaces exact text ranges and puts them back."

### 1:00 — The payoff (20s)

Switch to Demo B. Click Eclipse → **Start Eclipse**.

> "Different article. And there's _**attendre**_ — because I got it wrong, and this page has a legitimate second occurrence of it."

Click it. Answer **wait**, correctly this time.

> "Correct. New clue — **outside the theater** — same concept, different evidence. And now it's scheduled: review in one day."

### 1:20 — Close (10s)

> "Everything you just saw runs offline. No account, no key, no analytics. Three permissions: activeTab, scripting, storage. Nothing in the manifest gives Eclipse standing access to any site."

---

## The one thing to make sure lands

**On a fresh profile, Demo B does not show `attendre`.** Four other concepts outrank it.

It appears on Demo B _only because you got it wrong on Demo A_. If a judge asks whether that was staged, offer to reset the data and start Eclipse on Demo B first — it will not be there.

That contrast is the demo. Everything else is context.

---

## If something goes wrong

| Symptom                    | Do this                                                                                       |
| -------------------------- | --------------------------------------------------------------------------------------------- |
| Start button greyed out    | You're on a `chrome://` or extension page. Switch to the demo tab.                            |
| No tokens appear           | The page was loaded before the extension. Reload and press Start again.                       |
| Popup shows an error       | Read it aloud — the failure states are part of the product. Then End Eclipse and start again. |
| Demo server not responding | `npm run demo` in a spare terminal.                                                           |
| Everything is on fire      | Play the backup recording.                                                                    |

## Backup recording checklist

Record before the event, in this order, and keep the file on the presenting machine:

- [ ] `chrome://extensions` showing Eclipse loaded, with the manifest's permission list visible
- [ ] Calibration, all three questions
- [ ] Demo A activation, all four tokens visible in the article
- [ ] `attendre` answered **wrong**, full Truth Card readable for at least four seconds
- [ ] End Eclipse, article visibly restored
- [ ] Demo B activation with `attendre` present
- [ ] `attendre` answered **right**, review-in-one-day note visible
- [ ] Network disconnected, Demo A activation still working
- [ ] Popup privacy disclosure expanded

Keep it under two minutes. Silent is fine; you will be talking over it.

## Judge Q&A

See [`JUDGE_QA.md`](JUDGE_QA.md).
