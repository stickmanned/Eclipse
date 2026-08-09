# Prompt Lab: Evidence-based vocabulary mastery

## Objective

Implement and verify a durable vocabulary-learning system in Eclipse that moves every attempted
word or phrase from **Crescent (learning)** through **Half moon (strengthening)** to **Full moon
(mastered)** using retrieval practice over expanding time intervals.

Target model: Codex / GPT-5 class coding agent working in the existing Eclipse repository.

## Success criteria

- The vocabulary deck has only All, Crescent, Half moon, and Full moon filters. Unseen concepts do
  not appear in the deck.
- A correct first encounter and an incorrect first encounter both create a future learning path.
- A missed item is prioritized for immediate relearning; a corrected item then returns on an
  expanding schedule.
- Same-day or early repetition can provide practice but cannot manufacture Full moon mastery.
- Full moon requires successful recall over multiple scheduled intervals and at least a 30-day
  interval; one lucky answer cannot produce mastery.
- A lapse removes Full moon status and shortens the next interval without erasing all historical
  evidence.
- Due and weak items are prioritized in contextual selection and in a learner-started practice flow.
- Existing profile data is migrated conservatively and invalid/newer data remains untouched.
- Scheduling and phase decisions are pure, deterministic, and covered at interval boundaries,
  duplicate answers, early reviews, lapses, and migration.
- The popup explains the phases, shows actionable review timing, and remains keyboard/screen-reader
  usable at the extension's existing dimensions.

## Current prompt analysis

- **Strengths:** identifies the broken phase, defines the Crescent-to-Full metaphor, calls out
  first-answer errors, and asks for evidence from successful products.
- **Weaknesses:** “world leading” is not measurable; “Full Moon” appears to refer to the circled
  unseen/new-moon filter; practice location, mastery evidence, decay, migration, and verification
  are unspecified.
- **Missing:** a definition of mastery, a policy for early reviews and lapses, a durable scheduling
  record, an explicit practice surface, source-quality rules, and edge-case tests.

## Variants

### Variant A — Direct baseline

```text
Improve Eclipse's vocabulary deck. Remove the unseen/new-moon filter. Build a progression from
Crescent (learning) to Half moon (strengthening) to Full moon (mastered). Prioritize words the
learner misses and keep reviewing all learned words until they are mastered. Research Duolingo,
Quizlet, Anki/FSRS, and learning science, implement the result in the current repository, and run
the relevant tests.
```

**Hypothesis:** a capable coding model can infer the feature from a concise goal.

**Risk:** it may equate attempts with mastery, omit persistence migration, or build only visual
filters without a working review loop.

### Variant B — Evidence-gated

This changes one variable from A: every learning decision must be tied to evidence.

```text
Improve Eclipse's vocabulary deck. Remove the unseen/new-moon filter. Build a progression from
Crescent (learning) to Half moon (strengthening) to Full moon (mastered). Prioritize words the
learner misses and keep reviewing all learned words until they are mastered.

Before implementation, research primary sources from Duolingo, Quizlet, Anki/FSRS, and peer-
reviewed learning science. For each adopted mechanic, record the source-backed principle and the
specific Eclipse behavior it justifies. Do not copy proprietary algorithms or claim evidence that
the source does not establish. Implement the result and run the relevant tests.
```

**Hypothesis:** a source-to-requirement gate prevents arbitrary thresholds and product imitation.

**Risk:** evidence can remain a report while the implementation still lacks explicit acceptance
criteria.

### Variant C — Verification contract (selected)

This changes one variable from B: it adds an executable behavior contract.

```text
Implement an evidence-based vocabulary mastery system in the existing Eclipse repository.

Research first:
- Use official Duolingo, Quizlet, and Anki/FSRS documentation plus primary or authoritative
  peer-reviewed learning research.
- Distinguish documented mechanics from Eclipse-specific design inferences.
- Save a concise cited research note in the repository.

Implement:
- Remove the unseen/new-moon vocabulary filter and group. Attempted items begin at Crescent.
- Keep three learner-facing stages: Crescent (learning), Half moon (strengthening), Full moon
  (mastered).
- Schedule every first answer. A miss is due at the next practice opportunity; a subsequent
  correct recall begins an expanding interval ladder.
- Count only on-time scheduled recall toward interval advancement. Early practice may expose a
  lapse but must not accelerate mastery.
- Require repeated scheduled successes and a 30-day-or-longer interval for Full moon.
- On a lapse, prioritize immediate relearning and shorten the interval enough to remove Full moon
  while retaining lifetime attempts/history.
- Add an in-popup active-recall practice flow ordered by due status and weakness. It must work with
  a one-item deck and reveal corrective feedback before self-grading.
- Keep mastery arithmetic/scheduling behind a small pure interface. Preserve single-writer answer
  persistence and interaction-id idempotency.
- Migrate existing compatible progress conservatively; never silently replace corrupt or newer
  profiles.
- Show phase meaning, progress, and next-review timing accessibly in the existing Eclipse design.

Verify at minimum:
1. First correct answer schedules review and stays Crescent.
2. First wrong answer is immediately due and its correction starts relearning.
3. Early repeated correct answers do not advance intervals or reach Full moon.
4. Due successes expand intervals through Crescent, Half moon, and Full moon.
5. A Full moon lapse downgrades and becomes immediately due.
6. Duplicate interaction ids apply once.
7. Legacy new-moon mastery migrates to Crescent without losing attempts/display data.
8. The popup exposes only three phase filters and practice works for due, weak, empty, and
   single-item decks.

Run focused tests while iterating, then typecheck, lint, formatting, the full test suite, build, and
browser-level verification. Preserve unrelated working-tree changes.
```

**Hypothesis:** explicit invariants and edge cases prevent a visually complete but pedagogically
shallow implementation.

**Risk:** the larger prompt can over-constrain implementation details; keep thresholds in one
domain module so evidence or product feedback can tune them later.

## Evaluation rubric

| Criterion                | Weight | Score 3 means                                                               |
| ------------------------ | -----: | --------------------------------------------------------------------------- |
| Learning correctness     |    30% | Spacing, retrieval, early-review, lapse, and mastery invariants all hold    |
| Functional completeness  |    25% | Contextual scheduling, popup practice, migration, and UI all work           |
| Data safety              |    15% | Compatible history migrates; duplicates/races/corrupt data are safe         |
| Test quality             |    15% | Deterministic boundary and integration tests cover the contract             |
| Evidence grounding       |    10% | Adopted mechanics trace to primary/official sources without overclaiming    |
| UX clarity/accessibility |     5% | Status and next action are understandable and keyboard/screen-reader usable |

Passing threshold: weighted score at least 85%, with no score below 2 for learning correctness,
functional completeness, or data safety.

## Test cases

| #   | Input/state                                          | Expected behavior                                                       | Primary criterion |
| --- | ---------------------------------------------------- | ----------------------------------------------------------------------- | ----------------- |
| 1   | Empty profile                                        | No deck rows; no unseen phase filter; practice has a useful empty state | UX/completeness   |
| 2   | New item answered wrong, then right                  | Immediate relearning debt, corrective feedback, then first interval     | Correctness       |
| 3   | New item answered correctly several times before due | Attempts update, interval and phase do not advance early                | Correctness       |
| 4   | Correct reviews exactly at each due boundary         | Expanding intervals; Half and Full only at evidence gates               | Correctness       |
| 5   | Full item answered wrong                             | Full removed, item due now, shortened relearning interval retained      | Correctness       |
| 6   | Same interaction delivered twice                     | Exactly one profile mutation                                            | Data safety       |
| 7   | Valid schema-v1 record including new_moon/display    | Migrates to current schema and Crescent without data loss               | Data safety       |
| 8   | Corrupt or future-version profile                    | Error reported; stored bytes untouched                                  | Data safety       |
| 9   | One tracked item                                     | Active-recall reveal/self-grade practice remains usable                 | Completeness      |
| 10  | Search plus each phase filter                        | Correct rows/groups and actionable empty-state copy                     | UX/completeness   |

## Failure modes to monitor

- **Attempt-count mastery:** detected when same-day answers can produce Full moon.
- **Dead-end correct answers:** detected when a first correct answer has no due timestamp.
- **Cosmetic-only fix:** detected when the filter disappears but scheduling remains unchanged.
- **Practice race:** detected by concurrent/duplicate answer tests at the persistence seam.
- **Destructive migration:** detected when v1 or corrupt raw storage is overwritten on load.
- **False precision:** detected when the UI claims a recall probability the model does not compute.
- **Punitive lapse:** detected when lifetime evidence is erased rather than interval/phase reduced.

## Selection note

Variant C is the working prompt because this is a stateful code-generation task with subtle logic
errors as its dominant risk. The implementation tests, not prompt prose, determine success.
