# Development Plan History — Local Evidence Only

This file is local, append-only design evidence. It is intentionally gitignored and is not authoritative. `.docs/DEVELOPMENT_PLAN.md` and `.docs/EXECUTION_PROMPTS.md` are the committed authoritative plan contracts. If this ledger is absent, reconstruct relevant evidence from those committed artifacts, merged PRs, CI, verification output, and the current codebase.

## 2026-08-08 — PLAN-001 — Corrective replanning

| Field | Evidence |
| --- | --- |
| Milestone | Plan creation covering M1–M4 |
| Decision | `DESIGN GO — PLAN REVISION: PLAN-001` for planning only; implementation still requires each milestone’s pre-implementation gate. |
| Trigger | User reported that ordinary pages return `No French context traps fit this article yet` and that AI-generated traps are not operational; requested Gemini 3.5 Flash-Lite. |
| Evidence | Source brief; current repository; successful `npm run check` (276 tests plus build); successful `npm run test:e2e` (33 passed, 1 screenshot test skipped); current session/provider/cache/allowlist code; current official Google model, structured-output, key-security, and logging/storage documentation. |
| Findings | Activation returns before AI when catalog placement count is zero; generated requests can race active-session persistence; provider remains OpenAI-specific; documented `.env` is not loaded; default allowlist omits the extension origin; runtime does not use provider cache; provider candidates are coupled to trap ID parsing and first-sentence harvesting; existing tests assert the reported failure. |
| Authoritative sections changed | Initial creation of all sections in `.docs/DEVELOPMENT_PLAN.md` and all milestone goals in `.docs/EXECUTION_PROMPTS.md`. |
| Downstream impact | Establishes M1 → M2 → M3 → M4 and one unversioned release train. |
| Implementation authorization | None. Run the named milestone design gate before any product-code branch or change. |

## 2026-08-08 — M1-GATE-001 — Native Gemini provider design gate

| Field | Evidence |
| --- | --- |
| Milestone | M1 — Native Gemini provider and secure configuration |
| Decision | `DESIGN GO — PLAN REVISION: none` |
| Trigger | User authorized implementation of the corrective plan. |
| Evidence | Authoritative M1 plan/prompt; current OpenAI adapter, server schema/config, provider settings, package scripts, manifest and tests; successful baseline `npm run check` and `npm run test:e2e`; current official Gemini 3.5 Flash-Lite, structured-output, API-key, error, and storage/logging documentation. |
| Findings | Model `gemini-3.5-flash-lite` is GA; native `@google/genai` supports structured JSON and request-level `store: false`; Generate Content matches Eclipse’s stateless single-request provider contract; the backend proxy and exact-origin policy remain valid. Existing dirty state is the user-owned uncommitted extension baseline, so no branch/PR stack is created or baseline committed implicitly. |
| Authoritative sections changed | none |
| Downstream impact | M2, M3, and M4 retain their current contracts and remain blocked until M1 verification passes. |
| Implementation authorization | Authorized locally against the inspected authoritative revision; stack publication remains deferred pending a user-approved baseline. |

## 2026-08-08 — LEDGER-ORDER-001 — Physical ordering note

M2/M3 entries written during this continuous local run appear earlier in the file than predecessor exit entries because a patch matched an earlier repeated table row. The evidence is append-only from this note forward; authoritative milestone order remains M1 → M2 → M3 → M4.

## 2026-08-08 — M3-EXIT-001 — Provider cache/setup/recovery verified

| Field | Evidence |
| --- | --- |
| Milestone | M3 — Provider cache, setup, and recovery UX |
| Result | Complete locally, subject to the isolated reset E2E/human review gate in M4. |
| Implementation | Integrated cache-aware generation with miss-only requests and deterministic caller order; replaced non-cryptographic keys with versioned SHA-256 scope; stripped sentences before storage and rebound/revalidated on read; added exact permission revocation, full namespaced reset, actionable exact-origin popup setup copy, and corrected privacy documentation. |
| Verification | Cache hit/miss/network-failure call-count tests, raw-sentence absence, scope invalidation, poisoned-cache revalidation, 100-entry eviction, provider-settings/profile reset, DOM provider regression, typecheck, lint, formatting, all 292 Vitest tests, and production WXT build pass. `npm run check` exited 0. |
| Downstream impact | M4 is unblocked for fake-provider browser coverage, isolated reset verification, packaging, and live-smoke evidence. |

## 2026-08-08 — M4-GATE-001 — Full regression and delivery design gate

| Field | Evidence |
| --- | --- |
| Milestone | M4 — Full regression, live smoke, and delivery hardening |
| Decision | `DESIGN GO — PLAN REVISION: none` |
| Trigger | M3 implementation and automated quality gate completed locally. |
| Evidence | Authoritative M4 plan/prompt; all M1–M3 diffs and verification; Playwright fixtures/specs, demo server/pages, WXT production/E2E manifests, popup/reset flows, API fake provider, package scripts, README/architecture/privacy/limitations, and current official Gemini model/key/data documentation already reviewed in M1. |
| Findings | Existing real-Chrome tests cover the offline product but still assert catalog-free failure and do not run a fake provider. A test-only loopback permission and exact dynamic extension-origin fake server can cover provider-backed activation/cache/late/failure without changing the production manifest. Reset verification must remain confined to Playwright's temporary browser profile and enumerate the exact keys before execution. Live Gemini remains a manual credential/quota gate and no credential may be copied into repository artifacts. |
| Authoritative sections changed | none |
| Downstream impact | No future milestone. Release preparation remains blocked until automated E2E/package audits and the manual live-provider gate are resolved. |
| Implementation authorization | Authorized for local fake-provider tests, packaging, and non-secret audits; no publication. |

## 2026-08-08 — M2-EXIT-001 — Coverage-first activation verified

| Field | Evidence |
| --- | --- |
| Milestone | M2 — Coverage-first activation pipeline |
| Result | Complete locally. |
| Implementation | Added pending/active session ownership and exact tab/session generation authorization; explicit `{ sentenceId, trap }` envelopes across API, client, messages, and DOM placement; round-robin multi-sentence harvesting; pre-mutation Gemini fallback when catalog output is below two; merged scoring/placement with current density, block, sentence, concept, and range rules; cancellation of replaced pending activations; opaque trap IDs. |
| Verification | Catalog-free activation test proves zero DOM mutation while awaiting and 2–4 traps after valid provider output; catalog-fast, provider failure/throw, unknown sentence, late result, max-four, restoration, session-store migration/auth, API, typecheck, lint, formatting, all 287 Vitest tests, and production WXT build pass. `npm run check` exited 0. |
| Downstream impact | M3 is unblocked. M4 remains dependent on M3. |

## 2026-08-08 — M3-GATE-001 — Provider cache/setup/recovery design gate

| Field | Evidence |
| --- | --- |
| Milestone | M3 — Provider cache, setup, and recovery UX |
| Decision | `DESIGN GO — PLAN REVISION: none` |
| Trigger | M2 completed locally with `npm run check` green. |
| Evidence | Authoritative M3 plan/prompt; current provider cache/settings, background generation/reset, popup toggle/status, storage keys/profile reset, privacy documentation, M1/M2 contracts and verification. |
| Findings | The cache is still unused, uses a non-cryptographic hash, and would retain a trap's raw `sentence` field during real use despite documentation. Its key lacks model/prompt/schema identity, reset leaves it behind, and partial cache/network behavior has no seam test. The approved versioned SHA-256 key, sentence-free cached template with rebind/revalidation, background orchestration, exact reset, and actionable popup copy directly address these gaps. |
| Authoritative sections changed | none |
| Downstream impact | M4 retains its current contract and remains blocked until M3 verification passes. |
| Implementation authorization | Authorized locally against the inspected authoritative revision; stack publication remains deferred pending a user-approved baseline. |

## 2026-08-08 — M1-EXIT-001 — Native Gemini provider verified

| Field | Evidence |
| --- | --- |
| Milestone | M1 — Native Gemini provider and secure configuration |
| Result | Complete locally. |
| Implementation | Replaced the OpenAI adapter and dependency with `@google/genai` 2.16.0 and model `gemini-3.5-flash-lite`; added strict native structured output through the Interactions API with `store: false`; added `.env` loading, exact-origin validation, model-aware health output, Gemini provider tags, and safe example configuration. |
| Verification | Mocked native-provider contract tests, server-config tests, 30 API tests, DOM provider regression, typecheck, lint, formatting, all 282 Vitest tests, and the production WXT build pass. `npm run check` exited 0. |
| Sensitive data | No live credential was written to tracked files, tests, logs, or build output. |
| Downstream impact | M2 is unblocked. M3 and M4 remain dependent on M2. |

## 2026-08-08 — M2-GATE-001 — Coverage-first activation design gate

| Field | Evidence |
| --- | --- |
| Milestone | M2 — Coverage-first activation pipeline |
| Decision | `DESIGN GO — PLAN REVISION: none` |
| Trigger | M1 completed locally with `npm run check` green. |
| Evidence | Authoritative M2 plan/prompt; current `ContentSession`, article harvesting, selection/placement, content/background messaging, active-session store, provider client, DOM fixtures, and M1 contracts/verification. |
| Findings | The reported failure is reproduced by the pre-provider zero-placement return. Generation is currently fire-and-forget only after catalog success, sentence identity is parsed from a trap ID, only the first sentence per free block is harvested, and the active-session record is written after `ACTIVATE`, so a fallback request can be rejected during activation. The approved pending/active authorization, explicit candidate envelope, representative harvesting, and pre-mutation merged plan directly address these defects without changing permissions or exclusions. |
| Authoritative sections changed | none |
| Downstream impact | M3 and M4 retain their current contracts and remain blocked until M2 verification passes. |
| Implementation authorization | Authorized locally against the inspected authoritative revision; stack publication remains deferred pending a user-approved baseline. |

## 2026-08-08 — M4-AUTOMATION-001 — Delivery automation complete; live gate pending

| Field | Evidence |
| --- | --- |
| Milestone | M4 — Full regression, live smoke, and delivery hardening |
| Automated result | Complete locally. `npm run check`, `npm run test:e2e`, and `npm run zip` exit 0; 294 Vitest tests and 35 Playwright scenarios pass, with one opt-in screenshot scenario skipped. |
| Browser evidence | Real Chromium covers catalog-free fake-provider activation, a zero-network cache hit, empty/invalid/timeout safety, offline catalog flow, session replacement, restoration, accessibility, exact isolated reset, and the production manifest audit. |
| Delivery evidence | Production zip contains 11 extension files; source, bundle, and archive secret scans pass; manifest has exactly `activeTab`, `scripting`, `storage`, optional `http://localhost:8787/*`, and no required host access. |
| Live credential gate | Not run: `.env` is absent and the chat-exposed credential was intentionally not copied into files or commands. `docs/LIVE_GEMINI_SMOKE.md` contains the bounded checklist for a rotated/restricted key. |
| Verdict | `NO-GO — RELEASE: unversioned — REASON: manual live Gemini authentication/quota/model smoke and external review/merge gates remain outstanding.` |
