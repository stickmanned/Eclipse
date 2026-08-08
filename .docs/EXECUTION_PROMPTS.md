# Execution Prompts — Eclipse: Context Traps Reliability Fix

## Global execution rules (apply to every goal)

- Use `stacked-prs`; each implementation PR is based on the preceding stack branch until that base merges.
- Use Conventional Commits, atomic commits, no attribution, and independently reviewable PRs.
- Run the mandatory pre-implementation design gate before creating product-code branches or changing product code.
- The committed plan/prompt files are authoritative. The local ignored history ledger is evidence; rebuild it from committed artifacts, merged PRs, CI, and current code when absent.
- A material plan change must update the current milestone and every affected future milestone before implementation. Rebuild the DAG and release trains after the update.
- A docs-only reconciliation PR is required for a material revision. It must be reviewed, green, and externally merged before code begins.
- A shared mismatch in a proposed parallel wave blocks product-code work in every affected lane. Do not continue scaffolding, partial implementation, or isolated ledger writes while reconciliation is pending.
- `GO` only makes the milestone stack merge-eligible. Release preparation remains deferred until every milestone in the unversioned train is externally merged.
- Never commit, print, log, store, test-fixture, or package a real Gemini key. Real-provider verification reads `GEMINI_API_KEY` only from a gitignored local environment and records only content-free pass/fail evidence.
- Automated tests use the fake provider or a mocked native SDK. Do not spend Gemini quota in CI or ordinary PR verification.
- Preserve the production manifest contract: `activeTab`, `scripting`, `storage`, optional `http://localhost:8787/*`, and no broad/remote host access.
- Do not create a version bump, changelog, tag, deployment, publication, or Chrome Web Store submission. The target is `unversioned` and publication is not requested.

### M1 — Native Gemini provider and secure configuration

```text
/goal Deliver milestone M1 (Native Gemini provider and secure configuration) from DEVELOPMENT_PLAN.md as a reviewed stack of PRs.

CONTEXT: DEVELOPMENT_PLAN.md §6 M1 + §1 source-map rows for generated traps, incomplete provider setup, current verification, and Gemini documentation + source brief lines 516–581, 682–703, 798–815, 881–892. Preconditions: none. Repo: Node.js 22, npm lockfile, strict TypeScript, WXT/React MV3, Zod, Express, Vitest, Playwright, ESLint, Prettier; current `npm run check` and `npm run test:e2e` are green, but the server is OpenAI-specific and the documented `.env` is not loaded.
OBJECTIVE: Replace the optional server’s OpenAI-specific path with a native, server-only Gemini 3.5 Flash-Lite provider. Success requires model `gemini-3.5-flash-lite`, native structured output, `store: false`, no tools or deprecated sampling fields, exact-origin allowlisting, typed provider failures, an actually loaded and validated local environment, explicit sentence references, fake/mocked automated coverage, and zero credential exposure.
RELEASE TRAIN: target=unversioned; included milestones=M1, M2, M3, M4; preparation trigger=all included milestones externally merged; required artifacts=none; release verification=from merged release head run `npm ci`, `npm run check`, `npm run test:e2e`, `npm run zip`, M4 live/manual checklist, manifest audit, and archive secret scan with every gate passing; publication=not requested.

PRE-IMPLEMENTATION DESIGN GATE:
1. Read this milestone, its source-map rows, current prompt, and `.docs/DEVELOPMENT_PLAN_HISTORY.md` when present.
2. Inspect the current codebase plus merged predecessor diffs, merged predecessor PR outcomes, CI/check evidence, and predecessor verification output. Re-check current official Gemini model, JavaScript SDK, structured-output, API-key, errors, and logging/storage documentation.
3. Revalidate objective, native SDK/API choice, model ID, structured response contract, explicit sentence identity, environment loading, exact origins, provider errors, security/privacy, dependencies, acceptance, verification, risks, release train, and dependent milestones M2, M3, and M4.
4. Append one ledger entry: timestamp, milestone, decision, trigger, evidence, plan/prompt sections changed, downstream impact, and implementation authorization.
5. If no material mismatch exists, report `DESIGN GO — PLAN REVISION: none`; this authorizes implementation.
6. If a mismatch exists, update both authoritative artifacts for M1 and every affected future milestone, append the revision ID, and report `DESIGN GO — PLAN REVISION: <entry IDs>`. This records a completed diagnosis but blocks product-code work until the reconciliation prerequisite merges.
7. If validity cannot be established, report `DESIGN NO-GO — REASON: <evidence>` and stop. After a reconciliation PR merges, repeat this gate and require `DESIGN GO — PLAN REVISION: none` before implementation.

RECONCILIATION RULE: A material revision opens `docs(plan): reconcile M1 design` as a docs-only prerequisite PR. It contains no product code, must be reviewed, green, and externally merged before any code PR, and must not be folded into an implementation PR.

PLANNED STACK (refine only to keep PRs reviewable):
0. Conditional prerequisite `docs(plan): reconcile M1 design` — scope: authoritative plan/prompt updates only; gate: reviewed, green, and merged before the implementation stack.
1. PR-1 `refactor(provider): define Gemini generation contract` — scope: provider-neutral interfaces, `provider: "gemini"`, explicit sentence-reference envelope, server/client schemas, safe conversion, cache compatibility; commits: contract/schema change, fixture/test migration; verification: `npx vitest run tests/api/context-traps.test.ts tests/unit/trap-validation.test.ts`.
2. PR-2 `feat(provider): add native Gemini Flash-Lite adapter` — scope: pinned `@google/genai` dependency, model `gemini-3.5-flash-lite`, native structured output, `store: false`, no tools, error mapping, fake/mocked SDK tests; commits: dependency/adapter, failure and safety tests; verification: focused API tests plus package dependency assertion.
3. PR-3 `fix(config): load and validate local provider setup` — scope: `.env` loading, placeholders, startup/health diagnostics, exact extension-origin allowlist, no-secret logging and docs limited to setup contract; commits: config parser/startup, origin/secret regression tests; verification: `npm run check`, fake API health check, and tracked-secret scan.

CONSTRAINTS: use the native official Google SDK v2-or-newer stable release pinned exactly at implementation; do not use OpenAI compatibility; do not add remote Gemini host permissions to the extension; do not expose a key to browser code or messages; no model fallback; page text is untrusted; output must pass the existing strict validation; no scope leakage; minimal dependencies; repo style; no version/changelog updates before the release-train trigger.
VERIFICATION (must pass): `npx vitest run tests/api/context-traps.test.ts tests/unit/trap-validation.test.ts`; `npm run check`; `node -e "const p=require('./package.json'); if(!p.dependencies?.['@google/genai'] || p.dependencies?.openai || p.devDependencies?.openai) process.exit(1)"`; `git grep -nE 'GEMINI_API_KEY=[^[:space:]]+' -- ':!.env.example' ':!.docs/*'` produces no matches; fake-configured `/health` reports provider/model/configuration without a key or content. Capture exit codes and assertions.
REVIEW:
Per PR:
- Scope matches its purpose; contracts match the reconciled plan; behavior is meaningfully tested.
- Failures are loud; security, data safety, and rollback requirements are addressed where relevant.
- History is atomic, conventional, attribution-free, and free of unrelated formatting churn.
- PR-specific verification output is captured.
Whole stack:
- Bases form one valid stack; cumulative acceptance and integration hold; CI is green; no regression coverage is removed without replacement.
- The docs-only root, when present, is reviewed and green before dependent code PRs.
- Confirm provider calls are server-only, the key is absent everywhere material, exact origins fail closed, structured output is validated twice, and current official Gemini behavior matches implementation.
- Report PR URLs, bases, verification, risks, manual gates, and review completion.
FINAL VERDICTS:
- Report the design verdict before the merge verdict.
- Then report exactly one merge verdict: `GO — RELEASE: unversioned — RELEASE PREP: pending` or `NO-GO — RELEASE: unversioned — REASON: <blocking gate>`.
- `GO` requires `DESIGN GO`, every PR correctly based/reviewed/green, local verification, and full milestone acceptance. `NO-GO` applies to pending or failed checks, incomplete review, scope drift, ambiguous readiness, manual gates, or unresolved release target.
NEXT STEPS: (required after either merge verdict; concrete, ordered, and evidence-backed)
1. Current milestone: `<merge the reviewed M1 stack | already merged | stop on NO-GO>`.
2. Release: `<deferred until M1, M2, M3, and M4 merge | blocked with reason>`.
3. Next milestone: `<M2 after M1 is externally merged and its contract/verification evidence is available | none — reason>`.
4. For `NO-GO`: `<specific remediation and exact retry gate>`; otherwise `not applicable`.
- On `GO`, steps 1–3 are mandatory. On `NO-GO`, steps 1–4 are mandatory; never advance a dependent milestone.
- Render the literal heading `NEXT STEPS:`. A prose follow-up or JSON `next_steps` key is insufficient.
- Never infer a milestone, remediation, version/changelog artifact, tag, or publication action.
DONE: design verdict with evidence; when authorized, a reviewed stack with a release-aware merge verdict and the required next-steps list.
```

### M2 — Coverage-first activation pipeline

```text
/goal Deliver milestone M2 (Coverage-first activation pipeline) from DEVELOPMENT_PLAN.md as a reviewed stack of PRs.

CONTEXT: DEVELOPMENT_PLAN.md §6 M2 + §1 source-map rows for the premature no-trap return, provider/session race, narrow catalog, and article harvesting + source brief lines 39–60, 352–448, 516–581, 622–680, 765–797, 816–832. Preconditions: M1 externally merged. Repo: Node.js 22/npm, strict TypeScript, WXT/React MV3, Vitest DOM suites, Playwright; M1 supplies the reconciled Gemini candidate/error contract and secure server setup.
OBJECTIVE: Make AI capable of supplying the initial 2–4 traps for an eligible catalog-free article. Success requires a pending/active session authorization keyed by sender tab and exact session ID, representative replaceable sentence harvesting, explicit sentence binding, provider invocation before the final no-candidate result when fewer than two catalog traps exist, one globally validated/scored placement plan, no partial DOM on failure, and unchanged catalog-fast/offline/restoration behavior.
RELEASE TRAIN: target=unversioned; included milestones=M1, M2, M3, M4; preparation trigger=all included milestones externally merged; required artifacts=none; release verification=from merged release head run `npm ci`, `npm run check`, `npm run test:e2e`, `npm run zip`, M4 live/manual checklist, manifest audit, and archive secret scan with every gate passing; publication=not requested.

PRE-IMPLEMENTATION DESIGN GATE:
1. Read this milestone, its source-map rows, current prompt, and `.docs/DEVELOPMENT_PLAN_HISTORY.md` when present.
2. Inspect the current codebase plus merged M1 diffs, merged M1 PR outcomes, CI/check evidence, and M1 verification output.
3. Revalidate objective, interfaces, pending/active session lifecycle, sender/session authorization, activation timing, article-root scoring, sentence selection, candidate identity, merged selection, DOM rollback/restoration, errors, dependencies, acceptance, verification, risks, release train, and dependent milestones M3 and M4.
4. Append one ledger entry: timestamp, milestone, decision, trigger, evidence, plan/prompt sections changed, downstream impact, and implementation authorization.
5. If no material mismatch exists, report `DESIGN GO — PLAN REVISION: none`; this authorizes implementation.
6. If a mismatch exists, update both authoritative artifacts for M2 and every affected future milestone, append the revision ID, and report `DESIGN GO — PLAN REVISION: <entry IDs>`. This records a completed diagnosis but blocks product-code work until the reconciliation prerequisite merges.
7. If validity cannot be established, report `DESIGN NO-GO — REASON: <evidence>` and stop. After a reconciliation PR merges, repeat this gate and require `DESIGN GO — PLAN REVISION: none` before implementation.

RECONCILIATION RULE: A material revision opens `docs(plan): reconcile M2 design` as a docs-only prerequisite PR. It contains no product code, must be reviewed, green, and externally merged before any code PR, and must not be folded into an implementation PR.

PLANNED STACK (refine only to keep PRs reviewable):
0. Conditional prerequisite `docs(plan): reconcile M2 design` — scope: authoritative plan/prompt updates only; gate: reviewed, green, and merged before the implementation stack.
1. PR-1 `fix(session): authorize pending provider activation` — scope: pending/active session record or equivalent state machine, exact sender tab plus session ID checks, replacement/failure cleanup, late-response rejection; commits: lifecycle contract, race/replacement tests; verification: focused background/runtime integration tests and `npm run check`.
2. PR-2 `feat(content): harvest representative article sentences` — scope: eligible-root scoring, diverse replaceable sentence selection across blocks, explicit sentence references, ordinary article fixtures, preservation of excluded ancestors/range rules; commits: selector/extractor, DOM fixtures/tests; verification: `npx vitest run tests/dom/article.test.ts tests/dom/provider-augmentation.test.ts`.
3. PR-3 `fix(content): merge Gemini fallback before no-trap result` — scope: provider-aware activation timing, catalog/Gemini merged candidates, one global selection/placement plan, below-two fallback, honest typed empty/failure states, no pre-plan DOM mutation; commits: pipeline, regression/error/restoration tests; verification: all focused M2 suites and `npm run check`.

CONSTRAINTS: provider off means no network; catalog pages with at least two placements do not wait for AI; a below-two fallback is bounded by current request/timeout limits and has no automatic retry; never parse sentence identity from a trap ID; never accept a result for a different tab/session/sentence; plan before DOM mutation; preserve one-per-block/sentence/concept, density, max-four, exact source/clue validation, due priority, and rollback; no broad permissions or dynamic-feed support; no scope leakage; minimal dependencies; repo style; no version/changelog updates before the release-train trigger.
VERIFICATION (must pass): `npx vitest run tests/dom/article.test.ts tests/dom/provider-augmentation.test.ts tests/dom/session.test.ts tests/dom/transfer.test.ts tests/unit/selection.test.ts`; `npm run check`; minimum manual check on a catalog-free local fixture with fake AI showing 2–4 tokens and exact normalized visible-text restoration after End Eclipse. Capture the provider call count, trap count, typed failures, DOM owner-node count, and exit codes.
REVIEW:
Per PR:
- Scope matches its purpose; contracts match the reconciled plan; behavior is meaningfully tested.
- Failures are loud; security, data safety, and rollback requirements are addressed where relevant.
- History is atomic, conventional, attribution-free, and free of unrelated formatting churn.
- PR-specific verification output is captured.
Whole stack:
- Bases form one valid stack; cumulative acceptance and integration hold; CI is green; no regression coverage is removed without replacement.
- The docs-only root, when present, is reviewed and green before dependent code PRs.
- Confirm the reported zero-catalog bug is now a passing fake-provider scenario, the current race is impossible, slow/late/failing AI leaves no partial DOM, and catalog/offline behavior remains green.
- Report PR URLs, bases, verification, risks, manual gates, and review completion.
FINAL VERDICTS:
- Report the design verdict before the merge verdict.
- Then report exactly one merge verdict: `GO — RELEASE: unversioned — RELEASE PREP: pending` or `NO-GO — RELEASE: unversioned — REASON: <blocking gate>`.
- `GO` requires `DESIGN GO`, every PR correctly based/reviewed/green, local verification, and full milestone acceptance. `NO-GO` applies to pending or failed checks, incomplete review, scope drift, ambiguous readiness, manual gates, or unresolved release target.
NEXT STEPS: (required after either merge verdict; concrete, ordered, and evidence-backed)
1. Current milestone: `<merge the reviewed M2 stack | already merged | stop on NO-GO>`.
2. Release: `<deferred until M1, M2, M3, and M4 merge | blocked with reason>`.
3. Next milestone: `<M3 after M2 is externally merged and M1/M2 contracts plus verification evidence are available | none — reason>`.
4. For `NO-GO`: `<specific remediation and exact retry gate>`; otherwise `not applicable`.
- On `GO`, steps 1–3 are mandatory. On `NO-GO`, steps 1–4 are mandatory; never advance a dependent milestone.
- Render the literal heading `NEXT STEPS:`. A prose follow-up or JSON `next_steps` key is insufficient.
- Never infer a milestone, remediation, version/changelog artifact, tag, or publication action.
DONE: design verdict with evidence; when authorized, a reviewed stack with a release-aware merge verdict and the required next-steps list.
```

### M3 — Provider cache, setup, and recovery UX

```text
/goal Deliver milestone M3 (Provider cache, setup, and recovery UX) from DEVELOPMENT_PLAN.md as a reviewed stack of PRs.

CONTEXT: DEVELOPMENT_PLAN.md §6 M3 + §1 source-map rows for unused provider cache, incomplete reset, provider setup, permissions, popup, and privacy + source brief lines 275–309, 491–581, 648–680, 682–703, 782–815, 881–892. Preconditions: M1 and M2 externally merged. Repo: Node.js 22/npm, strict TypeScript, WXT/React MV3, Chrome storage/permissions, Vitest/Playwright; M1/M2 supply native Gemini generation and provider-aware activation.
OBJECTIVE: Integrate the bounded hash-keyed cache and give users an accessible, truthful setup/recovery experience. Success requires cache identity scoped by locale/model/prompt-schema revision, revalidation and current-sentence rebinding, no stored sentence text, exact optional permission behavior, actionable content-free status, and a confirmed reset that clears every documented Eclipse key and restores an active page.
RELEASE TRAIN: target=unversioned; included milestones=M1, M2, M3, M4; preparation trigger=all included milestones externally merged; required artifacts=none; release verification=from merged release head run `npm ci`, `npm run check`, `npm run test:e2e`, `npm run zip`, M4 live/manual checklist, manifest audit, and archive secret scan with every gate passing; publication=not requested.

PRE-IMPLEMENTATION DESIGN GATE:
1. Read this milestone, its source-map rows, current prompt, and `.docs/DEVELOPMENT_PLAN_HISTORY.md` when present.
2. Inspect the current codebase plus merged M1/M2 diffs, merged predecessor PR outcomes, CI/check evidence, and predecessor verification output.
3. Revalidate objective, runtime cache insertion point, cache identity/migration/revalidation, provider readiness contract, popup states and accessibility, exact optional permission behavior, reset key inventory and restoration order, privacy claims, dependencies, acceptance, verification, risks, release train, and dependent milestone M4.
4. Append one ledger entry: timestamp, milestone, decision, trigger, evidence, plan/prompt sections changed, downstream impact, and implementation authorization.
5. If no material mismatch exists, report `DESIGN GO — PLAN REVISION: none`; this authorizes implementation.
6. If a mismatch exists, update both authoritative artifacts for M3 and every affected future milestone, append the revision ID, and report `DESIGN GO — PLAN REVISION: <entry IDs>`. This records a completed diagnosis but blocks product-code work until the reconciliation prerequisite merges.
7. If validity cannot be established, report `DESIGN NO-GO — REASON: <evidence>` and stop. After a reconciliation PR merges, repeat this gate and require `DESIGN GO — PLAN REVISION: none` before implementation.

RECONCILIATION RULE: A material revision opens `docs(plan): reconcile M3 design` as a docs-only prerequisite PR. It contains no product code, must be reviewed, green, and externally merged before any code PR, and must not be folded into an implementation PR.

PLANNED STACK (refine only to keep PRs reviewable):
0. Conditional prerequisite `docs(plan): reconcile M3 design` — scope: authoritative plan/prompt updates only; gate: reviewed, green, and merged before the implementation stack.
1. PR-1 `feat(provider): integrate versioned trap cache` — scope: runtime reads/writes, locale/model/prompt-schema cache identity, revalidation/rebinding, incompatible entry miss, deterministic 100-entry LRU, no sentence storage; commits: cache contract/migration, runtime integration/tests; verification: provider-cache and provider-augmentation suites.
2. PR-2 `feat(popup): expose Gemini readiness and fallback states` — scope: health/readiness messages, setup required/permission denied/unavailable/generating/fallback/error/ready UI, exact-origin guidance, disable/revoke flow, accessibility/privacy copy; commits: message/status contract, popup behavior/tests; verification: DOM/popup tests and fake-provider E2E.
3. PR-3 `fix(storage): make confirmed reset complete` — scope: end/restore active session, clear profile/interactions/provider settings/provider cache/session, cancel no-op, return to calibration; commits: atomic reset behavior, exact-key/destructive-flow tests; verification: reset unit/DOM/E2E plus `npm run check`.

CONSTRAINTS: cache only validated provider output keyed by a non-reversible sentence hash plus generation contract; never store raw sentence/prompt/response; do not let cached provider IDs bypass current sentence binding; no silent network retries; no key entry UI; statuses contain no page/model content; disabling revokes optional localhost access; reset is the only destructive path and requires confirmation; no scope leakage; minimal dependencies; repo style; no version/changelog updates before the release-train trigger.
HUMAN REVIEW GATE: Do not merge or run destructive paths unattended until a human reviews dry-run output, rollback notes, and audit/tombstone logging. For Eclipse reset, the review must confirm the exact namespaced keys removed, active-page restoration before deletion, cancel as a no-op, and that tests use isolated extension storage rather than a real user profile.
VERIFICATION (must pass): `npx vitest run tests/unit/provider-cache.test.ts tests/unit/profile-store.test.ts tests/dom/provider-augmentation.test.ts tests/dom/overlay.test.tsx`; `npm run check`; `npm run test:e2e` for fake-provider permission/cache/reset flows; storage assertions prove the submitted sentence substring and API credential are absent before and after cache use; human review gate evidence is attached. Capture exit codes, cache call counts/size, permission state, exact reset key set, DOM restoration, and accessibility assertions.
REVIEW:
Per PR:
- Scope matches its purpose; contracts match the reconciled plan; behavior is meaningfully tested.
- Failures are loud; security, data safety, and rollback requirements are addressed where relevant.
- History is atomic, conventional, attribution-free, and free of unrelated formatting churn.
- PR-specific verification output is captured.
Whole stack:
- Bases form one valid stack; cumulative acceptance and integration hold; CI is green; no regression coverage is removed without replacement.
- The docs-only root, when present, is reviewed and green before dependent code PRs.
- Confirm a second identical request is a cache hit, incompatible/unsafe data misses, storage contains no content, status copy is truthful/actionable, optional permission is exact, and reset satisfies the human gate.
- Report PR URLs, bases, verification, risks, manual gates, and review completion.
FINAL VERDICTS:
- Report the design verdict before the merge verdict.
- Then report exactly one merge verdict: `GO — RELEASE: unversioned — RELEASE PREP: pending` or `NO-GO — RELEASE: unversioned — REASON: <blocking gate>`.
- `GO` requires `DESIGN GO`, every PR correctly based/reviewed/green, local verification, full milestone acceptance, and the human review gate. `NO-GO` applies to pending or failed checks, incomplete review, scope drift, ambiguous readiness, manual gates, or unresolved release target.
NEXT STEPS: (required after either merge verdict; concrete, ordered, and evidence-backed)
1. Current milestone: `<merge the reviewed M3 stack | already merged | stop on NO-GO>`.
2. Release: `<deferred until M1, M2, M3, and M4 merge | blocked with reason>`.
3. Next milestone: `<M4 after M3 is externally merged and all predecessor contracts/verification/human-gate evidence are available | none — reason>`.
4. For `NO-GO`: `<specific remediation and exact retry gate>`; otherwise `not applicable`.
- On `GO`, steps 1–3 are mandatory. On `NO-GO`, steps 1–4 are mandatory; never advance a dependent milestone.
- Render the literal heading `NEXT STEPS:`. A prose follow-up or JSON `next_steps` key is insufficient.
- Never infer a milestone, remediation, version/changelog artifact, tag, or publication action.
DONE: design verdict with evidence; when authorized, a reviewed stack with a release-aware merge verdict and the required next-steps list.
```

### M4 — Full regression, live smoke, and delivery hardening

```text
/goal Deliver milestone M4 (Full regression, live smoke, and delivery hardening) from DEVELOPMENT_PLAN.md as a reviewed stack of PRs.

CONTEXT: DEVELOPMENT_PLAN.md §6 M4 + every §1 source-map row + source brief lines 3–100, 101–581, 705–855, 858–908. Preconditions: M1, M2, and M3 externally merged. Repo: Node.js 22/npm, strict TypeScript, WXT/React MV3, Express, native Gemini SDK, Vitest, Playwright, deterministic demos, docs and zip workflow; predecessors supply the corrected product path.
OBJECTIVE: Prove the full original feature set and corrected Gemini path in browser automation plus one bounded live-provider smoke. Success requires fake-provider E2E for a catalog-free article and all provider failures, regression of every learner/DOM/privacy/accessibility/session feature, accurate Gemini documentation, a passing live run with model `gemini-3.5-flash-lite`, and a secret-free production release preparation contract.
RELEASE TRAIN: target=unversioned; included milestones=M1, M2, M3, M4; preparation trigger=all included milestones externally merged; required artifacts=none; release verification=from merged release head run `npm ci`, `npm run check`, `npm run test:e2e`, `npm run zip`, live/manual checklist, manifest audit, and archive secret scan with every gate passing; publication=not requested.

PRE-IMPLEMENTATION DESIGN GATE:
1. Read this milestone, all source-map rows, current prompt, and `.docs/DEVELOPMENT_PLAN_HISTORY.md` when present.
2. Inspect the current codebase plus merged M1–M3 diffs, merged predecessor PR outcomes, CI/check evidence, predecessor verification output, M3 human-gate evidence, production manifest/zip conventions, and current official Gemini model/key/data documentation.
3. Revalidate objective, complete capability-to-test traceability, fake-provider browser architecture, live-smoke scope and cost/privacy, docs claims, manifest/package audits, release train, acceptance, verification, and risks. Review M1–M3 if any provider/model/privacy/permission contract changed.
4. Append one ledger entry: timestamp, milestone, decision, trigger, evidence, plan/prompt sections changed, downstream impact, and implementation authorization.
5. If no material mismatch exists, report `DESIGN GO — PLAN REVISION: none`; this authorizes implementation.
6. If a mismatch exists, update both authoritative artifacts for M4 and every affected future milestone, append the revision ID, and report `DESIGN GO — PLAN REVISION: <entry IDs>`. If predecessor contracts are affected, update those sections too. This records a completed diagnosis but blocks product-code work until the reconciliation prerequisite merges.
7. If validity cannot be established, report `DESIGN NO-GO — REASON: <evidence>` and stop. After a reconciliation PR merges, repeat this gate and require `DESIGN GO — PLAN REVISION: none` before implementation.

RECONCILIATION RULE: A material revision opens `docs(plan): reconcile M4 design` as a docs-only prerequisite PR. It contains no product code, must be reviewed, green, and externally merged before any code PR, and must not be folded into an implementation PR.

PLANNED STACK (refine only to keep PRs reviewable):
0. Conditional prerequisite `docs(plan): reconcile M4 design` — scope: authoritative plan/prompt updates only; gate: reviewed, green, and merged before the implementation stack.
1. PR-1 `test(e2e): prove Gemini-backed generic article flow` — scope: browser-controlled fake API, catalog-free fixture, permission/setup, initial fallback, cache, auth/timeout/invalid/zero/late failure, restoration, manifest and no-content assertions; commits: harness/fixtures, E2E matrix; verification: focused Playwright project then `npm run test:e2e`.
2. PR-2 `docs(release): reconcile Gemini setup and acceptance` — scope: source-to-test matrix, README, architecture, privacy, limitations, troubleshooting, demo/judge material, live-smoke and release-head package audit instructions; commits: truthful Gemini docs, acceptance/release checklist; verification: `npm run check`, full E2E, link/content review, live smoke, manifest and secret scans.

CONSTRAINTS: CI and PR automation stay keyless/fake; live Gemini uses a supplied-or-rotated restricted key only from gitignored `.env`, sends only bounded non-sensitive test article sentences, and records no content; do not weaken failure gates to make live smoke pass; do not publish; keep screenshots optional unless required by an existing test; preserve explicit product exclusions; no scope leakage; minimal dependencies; repo style; no version/changelog updates.
VERIFICATION (must pass): before merge, `npm ci`, `npm run check`, and `npm run test:e2e`; manually start the local API from gitignored config, verify `/health` reports `gemini` and `gemini-3.5-flash-lite` without a key, enable AI through the popup, and obtain 2–4 validated traps on at least two catalog-free eligible English articles; inspect browser/server logs and extension storage for absence of content/key; after M1–M4 are externally merged, run `npm ci`, `npm run check`, `npm run test:e2e`, `npm run zip`, `unzip -l .output/eclipse-context-traps-0.1.0-chrome.zip`, production manifest audit, and `git grep -nE 'GEMINI_API_KEY=[^[:space:]]+' -- ':!.env.example' ':!.docs/*'`. Every automated command exits 0; every manual check passes. A live auth/quota/model failure is NO-GO evidence, not a waiver.
REVIEW:
Per PR:
- Scope matches its purpose; contracts match the reconciled plan; behavior is meaningfully tested.
- Failures are loud; security, data safety, and rollback requirements are addressed where relevant.
- History is atomic, conventional, attribution-free, and free of unrelated formatting churn.
- PR-specific verification output is captured.
Whole stack:
- Bases form one valid stack; cumulative acceptance and integration hold; CI is green; no regression coverage is removed without replacement.
- The docs-only root, when present, is reviewed and green before dependent code PRs.
- Audit traceability for calibration/skip, 2–4 placement, question/Truth Card, moon/mastery/due transfer, duplicate answers, reset, accessibility, DOM restoration/invalidation, sessions/restart, provider setup/cache/failures, privacy, permissions, French NFC, offline catalog use, docs, and packaging.
- Confirm official Gemini docs still support the exact model and request contract, live evidence is content-free, and release preparation remains deferred until M4 externally merges.
- Report PR URLs, bases, verification, risks, manual gates, and review completion.
FINAL VERDICTS:
- Report the design verdict before the merge verdict.
- Then report exactly one merge verdict: `GO — RELEASE: unversioned — RELEASE PREP: pending` or `NO-GO — RELEASE: unversioned — REASON: <blocking gate>`.
- `GO` requires `DESIGN GO`, every PR correctly based/reviewed/green, local verification, full milestone acceptance, current official model/API confirmation, and the live-provider smoke. `NO-GO` applies to pending or failed checks, incomplete review, scope drift, ambiguous readiness, manual gates, live auth/quota/model failure, secret/privacy uncertainty, or unresolved release target.
NEXT STEPS: (required after either merge verdict; concrete, ordered, and evidence-backed)
1. Current milestone: `<merge the reviewed M4 stack | already merged | stop on NO-GO>`.
2. Release: `<after M1–M4 are externally merged, begin the single declared unversioned release preparation and run every release-head gate | blocked with reason>`.
3. Next milestone: `none — M4 completes the planned implementation DAG; only the declared unversioned release preparation remains`.
4. For `NO-GO`: `<specific remediation and exact retry gate>`; otherwise `not applicable`.
- On `GO`, steps 1–3 are mandatory. On `NO-GO`, steps 1–4 are mandatory; never begin release preparation before the stack and every predecessor milestone are externally merged.
- Render the literal heading `NEXT STEPS:`. A prose follow-up or JSON `next_steps` key is insufficient.
- Never infer a milestone, remediation, version/changelog artifact, tag, or publication action.
DONE: design verdict with evidence; when authorized, a reviewed stack with a release-aware merge verdict and the required next-steps list.
```
