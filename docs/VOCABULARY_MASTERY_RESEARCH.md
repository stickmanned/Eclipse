# Vocabulary mastery system: research and implementation brief

> **Product decision override — 2026-08-09:** This document preserves the research record, but its evidence-gate and Full-Moon maintenance requirements are no longer the shipped contract. Eclipse now uses the intentionally simple rule requested after evaluation: one correct typed practice earns Half Moon; three total earn Full Moon; Full Moon never re-enters Practice weakest. The UI shows an exact count out of three rather than a percentage. See `README.md` and `docs/ARCHITECTURE.md` for the current implementation.

**Prepared:** 2026-08-08  
**Scope:** The Vocab tab, concept scheduling, review selection, error recovery, and the learner-facing moon phases. This document does not change Eclipse's DELF lens or make the moon a proficiency score.

**Screenshot interpretation:** the circled near-dark disk is the current **New Moon** filter; the solid gold disk at the far right is Full Moon. This brief removes New Moon and retains Full Moon as the requested mastery endpoint. Removing Full Moon would conflict with “Full Moon = mastered.”

## Recommendation in one paragraph

Remove **New Moon** from the learner-facing vocabulary model. An unanswered item is not yet in the learner's deck; an answered item starts at **Crescent**, even after an incorrect answer. Every tracked item must enter a review schedule after its first answer. Use a maintained FSRS scheduler with a 90% desired-retention default, while keeping Eclipse's moon phases as stricter evidence gates layered over the scheduler. Recognition questions may introduce a concept, but only unassisted retrievals separated across days can move it to Half Moon or Full Moon. An error must produce immediate corrective feedback, one delayed correction opportunity, and a new interday review; it must never disappear merely because the same word does not occur on the next article. Full Moon means “durable for Eclipse's reading goal, and maintained,” not permanently learned.

## Evidence labels

- **Documented fact** means the linked first-party product documentation, primary study, meta-analysis, or systematic review states the claim.
- **Eclipse requirement** means a product decision inferred from that evidence and Eclipse's current reading-focused, local-first design. The research does not validate Eclipse's exact moon thresholds.
- **Heuristic** means an intentionally testable starting value where the evidence does not provide a universal number.

This distinction matters. For example, Duolingo reported that its half-life model improved prediction and engagement; that is not evidence that Eclipse can promise a particular learning gain. Quizlet's historical “two correct answers” rule documents a product mechanic, not a scientifically established definition of mastery.

## What the reference products actually document

| Source                                                                                                                                                                  | Documented fact                                                                                                                                                                                                                                            | Useful lesson for Eclipse                                                                                                                               | Limit                                                                                                                                  |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| [Duolingo: spaced repetition](https://blog.duolingo.com/spaced-repetition-for-learning/)                                                                                | Personalized practice uses spacing and accuracy; mistakes are reviewed; harder concepts return sooner; practice becomes more widely spaced as knowledge strengthens.                                                                                       | Correct and incorrect first attempts both need a future schedule. Errors should be prioritized, not merely counted.                                     | This is first-party product explanation, not a controlled efficacy result for the exact feature.                                       |
| [Duolingo: strength meters and half-life regression](https://blog.duolingo.com/how-we-learn-how-you-learn/) and the [ACL paper](https://aclanthology.org/P16-1174/)     | Duolingo modeled word recall from time and learner/item history. The 2016 paper reported substantially lower recall-prediction error than its tested baselines and an engagement lift in an operational study.                                             | Model memory per concept and let predicted recall decay with elapsed time. Do not treat lifetime accuracy as current mastery.                           | The reported operational outcome was engagement, not a direct vocabulary-retention effect. Eclipse lacks Duolingo-scale training data. |
| [Quizlet Learn help](https://help.quizlet.com/hc/en-us/articles/360030986971-Studying-with-Learn) and [Quizlet study modes](https://quizlet.com/ca/features/studymodes) | Learn creates a personalized path based on the goal and familiarity and uses progressively harder questions.                                                                                                                                               | Use recognition as scaffolding, then require recall. Focus a session on material the learner still needs.                                               | The public pages do not disclose the current scheduler or validate a specific mastery threshold.                                       |
| [Quizlet's 2021 product guide](https://quizlet.com/blog/a-beginners-guide-to-quizlet)                                                                                   | At that time, Learn moved a term from remaining to familiar after a correct response and to known well after a second correct response in the session.                                                                                                     | Visible buckets and quick progress feedback are legible.                                                                                                | This is dated product behavior. Two same-session successes must not mean Full Moon in Eclipse.                                         |
| [Anki manual: FSRS and deck options](https://docs.ankiweb.net/deck-options.html)                                                                                        | FSRS represents recall as a probability, uses 90% desired retention by default, adapts intervals from review history, treats forgotten and recalled responses differently, and recommends few same-day learning/relearning steps.                          | Use an explicit memory scheduler; map forgotten answers to `Again`, recalled answers to `Good`; avoid drilling the same item repeatedly in one sitting. | The default is a workload/retention trade-off, not a universal optimum. Parameter optimization needs substantial review history.       |
| [FSRS algorithm documentation](https://github.com/open-spaced-repetition/awesome-fsrs/wiki/The-Algorithm)                                                               | FSRS separates **difficulty**, **stability**, and **retrievability**. Stability is the interval at which predicted recall is 90%; retrievability declines with elapsed time; a lapse computes a reduced post-lapse stability rather than deleting history. | Keep scheduling state separate from the moon label. Let Full Moon become due and let lapses weaken it without erasing all evidence.                     | The formulas and defaults evolve. Pin a maintained implementation instead of copying a wiki formula.                                   |
| [Open Spaced Repetition's TypeScript implementation](https://github.com/open-spaced-repetition/ts-fsrs)                                                                 | `ts-fsrs` provides the scheduler and review-log transitions in TypeScript; its optimizer is separate.                                                                                                                                                      | It fits Eclipse's TypeScript/Node 22 stack. Pin the exact package version and persist the review events needed to replay/migrate state.                 | Library adoption still requires compatibility, bundle-size, and deterministic-test checks.                                             |

## Learning-science findings

### Retrieval, not repeated exposure, is the durable event

**Documented fact.** A meta-analysis of testing versus equal-duration restudy found a medium retrieval-practice benefit (`g = 0.50`) and larger benefits for initial recall tests than for recognition tests ([Rowland, 2014](https://pubmed.ncbi.nlm.nih.gov/25150680/), [DOI](https://doi.org/10.1037/a0037559)). In foreign-language paired-associate learning, continuing to retrieve items after the first successful recall improved delayed retention, while continued study did not ([Karpicke & Roediger, 2008](https://doi.org/10.1126/science.1152408)).

**Eclipse requirement.** The existing three-choice contextual question is a useful first contact, but repeated multiple choice alone must never produce Full Moon. Half and Full require an unassisted response in which the answer is not visible. For Eclipse's reading goal, the default retrieval direction is French word/phrase to English meaning. Productive English-to-French recall can be an optional stretch mode, not a reading-mastery gate.

### Space reviews; do not equate cramming with mastery

**Documented fact.** The major distributed-practice meta-analysis covered 317 experiments and found that the best gap depends on the desired retention interval: longer retention targets generally require longer study gaps ([Cepeda et al., 2006](https://pubmed.ncbi.nlm.nih.gov/16719566/), [DOI](https://doi.org/10.1037/0033-2909.132.3.354)). A second-language meta-analysis synthesized 98 effects from 48 experiments, found a medium-to-large spacing effect, and found no statistically reliable advantage for expanding over equal schedules ([Kim & Webb, 2022](https://doi.org/10.1111/lang.12479)). A vocabulary experiment with Japanese-English pairs likewise found that spacing became more beneficial with more practice and longer retention intervals ([Pavlik & Anderson, 2005](https://pubmed.ncbi.nlm.nih.gov/21702785/), [DOI](https://doi.org/10.1207/s15516709cog0000_14)).

**Eclipse requirement.** A phase promotion must depend on successful reviews on different calendar days, not an attempt count or streak from one session. Scheduling should target recall probability instead of hard-coding 1/3/7 days as a scientific optimum.

### Correct errors, then require successful retrieval again later

**Documented fact.** In a Luganda-English vocabulary experiment, supplying the correct answer after an incorrect response substantially improved one-week retention relative to no feedback ([Pashler et al., 2005](https://doi.org/10.1037/0278-7393.31.1.3)). Corrective feedback also improves retention by correcting erroneous responses and improved retention for correct but low-confidence responses in two experiments ([Butler, Karpicke, & Roediger, 2008](https://learninglab.psych.purdue.edu/downloads/2008/2008_Butler_Karpicke_Roediger_JEPLMC.pdf), [DOI](https://doi.org/10.1037/0278-7393.34.4.918)). Successive relearning combines retrieval to a correct criterion with correct retrieval again in later spaced sessions; a research review concludes that the spaced relearning sessions are the active durable component ([Rawson & Dunlosky, 2022](https://journals.sagepub.com/doi/10.1177/09637214221100484)).

**Documented caution.** A systematic review of second-language corrective-feedback timing found no single conclusive best timing across modalities and study designs ([Xu & Zeng, 2023](https://pmc.ncbi.nlm.nih.gov/articles/PMC9995700/), [DOI](https://doi.org/10.3389/fpsyg.2023.1026174)).

**Eclipse requirement.** Give the correct meaning and explanation immediately after an error because the Truth Card already has that job. Re-test once after intervening items to establish a corrected response, then require recall again on a later day. The exact “three to five intervening items” rule below is a UX heuristic, not a claimed cognitive optimum.

### Make retrieval effortful only when success remains plausible

**Documented fact.** The retrieval-practice meta-analysis supports effortful processing, but the benefit depends on retrieval being successful or unsuccessful attempts being repaired with feedback. Reviews of desirable difficulty also warn that conditions that improve immediate performance can differ from those that produce durable learning ([Soderstrom & Bjork, 2015](https://doi.org/10.1177/1745691615569000)). A recent foreign-vocabulary experiment found that first-round retrieval success strongly predicted later retention and that productive retrieval was harder; it used feedback and later relearning rounds ([Serfaty, 2026](https://pubmed.ncbi.nlm.nih.gov/40388156/), [DOI](https://doi.org/10.1037/xlm0001491)). This was a 50-person nonword study, so it does not establish a universal exercise sequence.

**Eclipse requirement.** Scaffold a struggling Crescent item with choices or a clue after failure, then return to unassisted recall. Do not make “harder” synonymous with obscure distractors, exact wording, or trick questions. Difficulty should come from retrieving the meaning after spacing and in a fresh valid context.

### Do not overclaim interleaving for word pairs

**Documented fact.** A meta-analysis found that interleaving effects depend strongly on material. It found benefits for visual category learning, no clear benefit for expository texts, and negative average effects for word materials (`g = -0.39`) ([Brunmair & Richter, 2019](https://pubmed.ncbi.nlm.nih.gov/31556629/), [DOI](https://doi.org/10.1037/bul0000209)). A second-language vocabulary experiment also found that learning semantically clustered words together impaired acquisition compared with unrelated sets ([Tinkham, 1993](<https://doi.org/10.1016/0346-251X(93)90027-E>)). The Anki manual separately warns that a consistent card order can make answers guessable from order and weaken memories ([Anki display-order documentation](https://docs.ankiweb.net/deck-options.html#display-order)).

**Eclipse requirement.** Randomize review order enough to remove positional clues and avoid immediate repeats, but do not market this as a proven “interleaving effect” for vocabulary. Prefer multiple legitimate contexts because that tests meaning beyond one sentence; treat the exact context-diversity gate as an Eclipse policy to evaluate.

## The Eclipse Lunar Mastery System

### 1. Learner-facing phases

There are exactly three learner-facing phases.

| Phase                            | Learner meaning                                                    | Minimum promotion evidence                                                                                                                                                                                                   | Scheduling meaning                                                                                    |
| -------------------------------- | ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| **Crescent — Learning**          | “I have met this word or phrase and am starting to understand it.” | Created on the first submitted answer, whether correct or incorrect. No promotion is possible from same-session corrections alone.                                                                                           | New, recently failed, assisted, or not yet proven across days. Reviews are close together.            |
| **Half Moon — Building**         | “I can retrieve this meaning, but it is not durable yet.”          | At least **2 unassisted correct retrievals**, on **2 distinct calendar days**, with no unresolved lapse; scheduler stability at least **3 days**.                                                                            | Continue expanding intervals and prefer a new valid context.                                          |
| **Full Moon — Mastered for now** | “I have recalled this reliably across time, not just once.”        | At least **4 unassisted correct retrievals**, on **3 distinct calendar days**, spanning at least **7 days**; at least the last **2 scheduled reviews** correct without assistance; scheduler stability at least **14 days**. | Maintenance continues. A Full Moon item can become due, dim, or lapse. It is not permanently retired. |

All numeric gates in this table are **Eclipse heuristics**. They are deliberately stricter than “two correct in one session,” cheap enough to reach, and testable using delayed-recall outcomes. They should be configuration constants with named tests, not scattered literals.

Additional rules:

1. Multiple-choice success counts as a correct attempt and Crescent evidence, but not as an **unassisted retrieval** for Half or Full.
2. A response after a hint, reveal, or corrective feedback is `assisted`; it satisfies the current learning step but not a promotion gate.
3. A context fingerprint is a privacy-preserving hash of the normalized prompt sentence plus concept id. Persist the fingerprint, never the raw article sentence. Context diversity is tracked and preferred, but it is not a hard phase gate when Eclipse has no second valid context.
4. If a dedicated review has no sentence context, give it a stable `bare-recall` mode id. Bare recalls still count when they are unassisted and occur on scheduled, distinct days; future real article encounters add contextual evidence.
5. Empty profiles have no overall moon. Show an onboarding empty state, not New Moon.

### 2. Scheduling engine

**Documented fact.** In a semester-long foreign-language field study, a time-matched personalized review schedule improved retention relative to massed practice and uniform spacing ([Lindsey et al., 2014](https://doi.org/10.1177/0956797613504302)). This supports adaptive review in context, but it does not independently validate FSRS or Eclipse's thresholds.

**Preferred implementation:** adopt a version-pinned `ts-fsrs` scheduler, using default parameters until enough local history exists and a desired retention of **0.90**. Do not implement parameter optimization in the first release; Anki's documentation notes that useful fitting needs substantial review history. Keep all processing local.

Map objective outcomes conservatively:

| Eclipse outcome                                                            | FSRS rating                                              | Reason                                                                                             |
| -------------------------------------------------------------------------- | -------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Incorrect, blank, timed out, answer revealed, or only correct after reveal | `Again`                                                  | The learner did not retrieve the answer. Anki explicitly treats `Hard` as recalled, not forgotten. |
| Correct without assistance                                                 | `Good`                                                   | It is an observed successful retrieval.                                                            |
| Correct with a non-answer hint                                             | `Hard` only if the answer itself was genuinely retrieved | Hints must be typed, so answer-revealing hints still map to `Again`.                               |
| Fast answer                                                                | Still `Good`                                             | Do not infer `Easy` from speed; response time is noisy and the learner did not self-rate ease.     |

Required scheduling behavior:

1. **Every first answer schedules another encounter.** The current behavior where a correct, not-yet-due item can become `due: none` must be removed.
2. **After an error:** show feedback immediately; put the concept in a correction queue behind three to five other items (or at session end); after a corrected response, schedule the next interday review. If no correction is completed, it remains due.
3. **Do not loop failures.** After two incorrect attempts in one session, stop showing that item for the session and schedule the next review no later than the next day. More same-day repetitions do not count toward phase promotion.
4. **A lapse preserves history.** Record the lapse, reduce stability through the scheduler, clear the current success streak, and enter relearning. Do not delete prior dates, contexts, or lifetime counts.
5. **Due is independent of page availability.** A due concept remains in the practice queue if it does not legitimately occur in the current article. Never force a semantically invalid replacement to satisfy a due date.
6. **Maintenance has no terminal state.** Full Moon items remain scheduled. “Mastered” changes the interval and session frequency; it does not set `due: none` forever.
7. **Deterministic fallback only:** if FSRS integration is deferred, expand the existing ladder to `1, 3, 7, 14, 30, 60, 120` days, advance only after an unassisted correct scheduled review, and reset the next interday interval to one day after a lapse. Label this an interim policy, not an optimal schedule.

### 3. Decay and lapse behavior

**Documented fact.** Successive relearning across sessions outperformed single-session learning in controlled studies ([Rawson et al., 2018](https://doi.org/10.1037/xap0000146)). Apparently forgotten second-language words can also be relearned and retained more efficiently than genuinely new words, evidence that a lapse does not erase the original learning trace ([de Bot, Martens, & Stoessel, 2004](https://doi.org/10.1177/13670069040080031101)).

The scheduler's memory state and the moon phase answer different questions:

- **Retrievability** answers “How likely is recall now?” and decays continuously with time.
- **Stability** answers “How long can this memory remain reliable?” and changes after reviews.
- **Moon phase** answers “What durable evidence has Eclipse observed?”

Learner-facing phase behavior:

| Event                                                                                       | Phase effect                                   | UX copy                                                               |
| ------------------------------------------------------------------------------------------- | ---------------------------------------------- | --------------------------------------------------------------------- |
| Full Moon becomes due but is not badly overdue                                              | Keep Full; add `Due now`                       | “Mastered — time for a maintenance check.”                            |
| Full Moon retrievability falls below 0.80 before review                                     | Temporarily display Half with `Review overdue` | “Your moon has dimmed. One recall can strengthen it.”                 |
| Full Moon lapse                                                                             | Drop to Half, enter relearning                 | “Not lost — this one needs rebuilding.”                               |
| Half Moon lapse                                                                             | Drop to Crescent                               | “Back in learning. We’ll bring it back soon.”                         |
| Two consecutive interday lapses at any phase                                                | Crescent and flag as difficult                 | Offer a clue or recognition scaffold before the next unassisted test. |
| Correct maintenance review after a time-based dim, with Full evidence gates still satisfied | Restore Full                                   | “Full Moon restored.”                                                 |

The 0.80 display threshold is a **heuristic hysteresis threshold**. It prevents the UI from flickering at the 0.90 scheduling boundary and must be evaluated. A lapse, not elapsed time alone, is the stronger evidence for demotion.

### 4. Exercise progression

| Stage                     | Default exercise                                                                         | What counts toward promotion                                                                        |
| ------------------------- | ---------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| First article encounter   | Existing contextual three-choice interpretation                                          | Creates Crescent and schedules review; correct does not count as unassisted recall.                 |
| Crescent correction       | Same meaning with changed order; clue or choices allowed                                 | Learning criterion only; not Half/Full evidence.                                                    |
| Crescent scheduled review | French word/phrase → typed English meaning, with the answer hidden                       | Unassisted correct counts. If it fails, show immediate Truth Card feedback and re-enter correction. |
| Half review               | Typed meaning in a different valid article context when available; otherwise bare recall | Unassisted correct counts; new context fingerprint preferred.                                       |
| Full maintenance          | Typed meaning, ideally in a fresh legitimate context                                     | Preserves or restores Full.                                                                         |
| Optional stretch          | English meaning → typed French, or phrase completion                                     | Show separately as productive practice. Do not redefine Eclipse's reading-mastery claim.            |

Typed English answers need deterministic accepted aliases and normalization for case, surrounding whitespace, and ordinary punctuation. A semantically broader but wrong answer must not be accepted merely because it is related. Do not add opaque LLM grading to the mastery boundary without a validated rubric and fallback.

### 5. Practice-session selection

Use lexicographic tiers before any weighted score:

1. **Correction queue** whose minimum within-session gap has elapsed.
2. **Overdue reviews**, ordered by lowest retrievability, then oldest due time.
3. **Due reviews** at or below the desired-retention boundary.
4. **Difficult Crescent/Half items** that are near due, to fill a short session.
5. **Full maintenance items** only when due or when the learner explicitly chooses Full Moon practice.

Session rules:

- Default goal: 10 items or about five minutes; show the due count before starting.
- When enough due items exist, at least 80% of the session is due/relearning material. The remainder may be near-due weak material for variety.
- Do not show the same concept twice without at least three intervening concepts when the pool permits.
- Randomize within equal-priority tiers with a seeded shuffle so tests remain deterministic and order cannot become a cue.
- Prefer a context fingerprint the learner has not answered before; never sacrifice grammatical or semantic validity to get novelty.
- The article-placement engine keeps its current hard priority for due concepts that genuinely fit. The dedicated practice queue covers due concepts absent from the page.
- A user may practice any phase manually, but early voluntary practice must not advance an interday evidence gate or create a longer interval than a scheduled successful review.

### 6. Vocab-tab UX requirements

1. Remove the **New Moon** filter and all learner-facing New Moon copy/icons.
2. Keep filters: **All**, **Crescent**, **Half Moon**, **Full Moon**. Show a count on each.
3. Add a primary action: **Practice due · N**. Disable it with “Nothing due — next review in …” rather than an empty error panel.
4. Each vocabulary row shows:
   - French surface and English meaning;
   - current phase name and icon;
   - `Due now`, `Overdue`, or `Next review in …`;
   - a compact evidence line such as `2 successful recalls · 2 days · 2 contexts`, omitting the context segment when unavailable;
   - a `Practice` action.
5. Sort All by: overdue/due first, Crescent, Half, Full; within a phase, lowest retrievability first.
6. A wrong answer says what the item means **here**, why the selected distractor does not fit, and exactly when/where it will return.
7. A promotion message names the evidence: “Half Moon — recalled on two different days.” Full Moon copy must include “Mastered for now” and its next maintenance date.
8. The empty deck says: “Your first word is waiting. Start an Eclipse session and answer a highlighted word.” Do not render a moon phase for zero tracked concepts.
9. Colour is never the only state signal. Keep the written phase, verdict, due label, and accessible name alongside the moon icon.

### 7. Storage and migration requirements

The current aggregate record (`score`, counts, one due state) is insufficient for spaced evidence gates and scheduler replay. Move to a versioned event-backed model.

```ts
interface ReviewEvent {
  interactionId: string;
  conceptId: string;
  reviewedAt: string;
  correct: boolean;
  assisted: boolean;
  mode: 'context-choice' | 'typed-meaning' | 'bare-recall' | 'productive-stretch';
  contextFingerprint?: string;
  schedulerRating: 'again' | 'hard' | 'good';
  scheduled: boolean;
}

interface ConceptLearningState {
  phase: 'crescent' | 'half' | 'full';
  fsrsCard: unknown; // Replace with the pinned library's serializable card type.
  attempts: number;
  correct: number;
  unassistedCorrect: number;
  lapseCount: number;
  consecutiveInterdayLapses: number;
  firstAnsweredAt: string;
  lastReviewedAt: string;
  successfulReviewDays: string[];
  contextFingerprints: string[];
  display: VocabularyDisplay;
}
```

Implementation rules:

- Keep review events bounded but sufficient for replay and phase evidence. If an event log is capped, persist the derived distinct-day/context summaries before pruning.
- Preserve the existing interaction-id idempotency rule and single answer writer.
- Never persist a raw article sentence or page URL for this feature. Hash normalized context locally.
- Migration maps every attempted `new_moon` record to Crescent. Existing Crescent/Half/Full records keep their visible phase initially, but a Full record without the new evidence should be marked `legacyFull: true` and revalidated at its next scheduled review rather than silently erased.
- A profile with no submitted answer has no concept record. Do not seed unattempted vocabulary merely to populate a moon bucket.
- Scheduler/library upgrades require an explicit profile schema migration and golden review-history tests.

## Acceptance tests

1. First incorrect contextual answer creates Crescent, persists feedback metadata, and queues a correction plus an interday review.
2. First correct contextual answer creates Crescent and a due review; it never becomes unscheduled.
3. Repeating multiple-choice answers in one session cannot promote an item to Half or Full.
4. Two qualifying unassisted correct recalls on distinct days promote Crescent to Half when the stability gate is met; a bare-recall prompt does not block promotion.
5. Four qualifying recalls across the Full evidence window promote to Full; one lucky answer cannot.
6. A due Full item remains Full with `Due now`; a sufficiently overdue item visibly dims; a correct maintenance recall restores it.
7. A Full lapse becomes Half and relearning-due while retaining lifetime history.
8. A wrong item absent from the next article remains due and appears in **Practice due**.
9. No selection path inserts a due concept into a sentence where its validated trap does not fit.
10. Two failures in one session end the loop and schedule later review.
11. New Moon does not appear in filters, summaries, empty states, accessibility labels, or migrated attempted items.
12. Raw article sentences and URLs are absent from the profile and review log.
13. Replaying the same interaction id does not change counts, phase, FSRS card state, or due date.
14. Seeded session ordering is deterministic in tests but varies across real sessions.

## How to tell whether the system works

Do not optimize for clicks, total attempts, or session completion and call that learning. Evaluate delayed retrieval.

Primary local metrics:

- scheduled-review recall rate, overall and by phase;
- 7-day and 30-day unassisted recall for items promoted to Half/Full;
- lapse rate after Full Moon;
- median reviews and learner minutes required to reach Full;
- calibration error between predicted retrievability bands and observed recall;
- proportion of initially wrong items later recalled unassisted after 1, 7, and 30 days;
- recognition-to-recall transfer: contextual multiple-choice correct followed by typed recall correct.

Guardrails:

- daily review load and backlog size;
- abandonment after repeated errors;
- percentage of answers graded through aliases versus exact meaning;
- promotion reversals caused by time decay versus actual lapse;
- accessibility regressions in keyboard, screen-reader, contrast, and reduced-motion tests.

Run the first release as a local or opt-in evaluation if Eclipse retains its no-analytics policy. The scheduler can expose aggregate, on-device calibration to the learner without transmitting review content.

## Claims Eclipse can and cannot make

Safe product description:

> Eclipse uses active recall, corrective feedback, and spaced reviews to help you build and maintain vocabulary. Moon phases show the strength of the evidence Eclipse has observed for each word or phrase.

Avoid:

- “Scientifically proven to master vocabulary.”
- “Full Moon means permanent fluency.”
- “Our exact 90% setting is optimal for everyone.”
- “Interleaving words always improves learning.”
- “Duolingo/Quizlet mechanics prove Eclipse's learning outcomes.”

## Source list

### First-party product and algorithm documentation

- Duolingo, [What Is Spaced Repetition, and Why Is It Good for Learning?](https://blog.duolingo.com/spaced-repetition-for-learning/)
- Duolingo, [How We Learn How You Learn](https://blog.duolingo.com/how-we-learn-how-you-learn/)
- Settles & Meeder, [A Trainable Spaced Repetition Model for Language Learning](https://aclanthology.org/P16-1174/) (ACL 2016, DOI `10.18653/v1/P16-1174`)
- Quizlet, [Studying with Learn](https://help.quizlet.com/hc/en-us/articles/360030986971-Studying-with-Learn)
- Quizlet, [Study Modes](https://quizlet.com/ca/features/studymodes)
- Quizlet, [A Beginner's Guide to Quizlet](https://quizlet.com/blog/a-beginners-guide-to-quizlet) (dated mechanics, 2021)
- Anki, [Deck Options and FSRS](https://docs.ankiweb.net/deck-options.html)
- Open Spaced Repetition, [FSRS Algorithm](https://github.com/open-spaced-repetition/awesome-fsrs/wiki/The-Algorithm)
- Open Spaced Repetition, [`ts-fsrs`](https://github.com/open-spaced-repetition/ts-fsrs)

### Research papers and reviews

- Rowland (2014), [The effect of testing versus restudy on retention](https://pubmed.ncbi.nlm.nih.gov/25150680/) ([DOI](https://doi.org/10.1037/a0037559))
- Karpicke & Roediger (2008), [Repeated retrieval during learning is the key to long-term retention](https://doi.org/10.1126/science.1152408)
- Cepeda et al. (2006), [Distributed practice in verbal recall tasks](https://pubmed.ncbi.nlm.nih.gov/16719566/) ([DOI](https://doi.org/10.1037/0033-2909.132.3.354))
- Kim & Webb (2022), [The effects of spaced practice on second-language learning](https://doi.org/10.1111/lang.12479)
- Pavlik & Anderson (2005), [Practice and forgetting effects on vocabulary memory](https://pubmed.ncbi.nlm.nih.gov/21702785/) ([DOI](https://doi.org/10.1207/s15516709cog0000_14))
- Pashler et al. (2005), [When does feedback facilitate learning of words?](https://doi.org/10.1037/0278-7393.31.1.3)
- Butler, Karpicke, & Roediger (2008), [Feedback increases retention of low-confidence correct responses](https://learninglab.psych.purdue.edu/downloads/2008/2008_Butler_Karpicke_Roediger_JEPLMC.pdf) ([DOI](https://doi.org/10.1037/0278-7393.34.4.918))
- Rawson & Dunlosky (2022), [Successive Relearning](https://journals.sagepub.com/doi/10.1177/09637214221100484)
- Rawson et al. (2018), [Investigating and explaining the effects of successive relearning](https://doi.org/10.1037/xap0000146)
- Xu & Zeng (2023), [Corrective feedback timing in second-language learning](https://pmc.ncbi.nlm.nih.gov/articles/PMC9995700/) ([DOI](https://doi.org/10.3389/fpsyg.2023.1026174))
- Brunmair & Richter (2019), [Similarity matters: a meta-analysis of interleaved learning](https://pubmed.ncbi.nlm.nih.gov/31556629/) ([DOI](https://doi.org/10.1037/bul0000209))
- Tinkham (1993), [The effect of semantic clustering on second-language vocabulary learning](<https://doi.org/10.1016/0346-251X(93)90027-E>)
- Soderstrom & Bjork (2015), [Learning versus performance](https://doi.org/10.1177/1745691615569000)
- Lindsey et al. (2014), [Improving students' long-term knowledge retention through personalized review](https://doi.org/10.1177/0956797613504302)
- de Bot, Martens, & Stoessel (2004), [Finding residual lexical knowledge](https://doi.org/10.1177/13670069040080031101)
- Serfaty (2026), [Desirable difficulties in relearning retrievals for foreign-language vocabulary](https://pubmed.ncbi.nlm.nih.gov/40388156/) ([DOI](https://doi.org/10.1037/xlm0001491))
