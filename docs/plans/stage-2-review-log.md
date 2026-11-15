# Plan review log: Atlas Stage 2 (data layer)

- Date: 2026-11-15
- Roles:
  - Host/planner: Claude Code (Opus 5.5).
  - Plan reviewer: Codex CLI 0.169.0 (CLI default model).
  - Builder: Claude.
  - Final inspector: a fresh Codex session.
- Plan: `PLAN.md`
- Limits: max plan-review rounds 5; inspection on.
- Branch `stage-2-data`, base `781b23b`.
- Authorization: Jonathan said "avanza con la siguiente fase" (plan + build Stage 2). No push without asking.

## Round 1: Codex (gpt-6.1-sol, read-only)

- Result: `scratchpad/s2-review-r1/claudex-in0m5skx/result.json`
- Plan SHA `addf9e88…`
- **Verdict: REVISE**, with 4 findings: R1 high (profile self-promotion), R2 high (backdated sent_at), R3 medium (cross-owner links), R4 medium (deviation fraction vs percent).
- Dispositions: all 4 accepted; plan revised (marked "Rev 1"). Feedback file: `scratchpad/s2-feedback-r1.md`.

## Round 2: Codex (resumed session)

- Result file: `scratchpad/s2-review-r2/claudex-zju7o1g9/result.json`
- Plan SHA: `b602ae54…`
- **Verdict: REVISE.** R1, R2 and R4 are resolved and R3 is substantially resolved. One new finding: R5 (medium), the alert table has no mission_id, so the mission-based policy and trigger would fail.
- Disposition: R5 accepted, and the plan is revised (sections marked "Rev 2").

## Round 3: Codex (resumed session)

- Result: `scratchpad/s2-review-r3/claudex-oa1cnpps/result.json`
- Plan SHA: `29e8e896…`
- **Verdict: APPROVED** with 0 findings. R5 is resolved, and the fixes for R1–R4 are still in place.
- Limitation noted by the reviewer: the plan only; implementation and the catalog content have not been reviewed yet.

## Build (host: Claude)

- Base commit: `781b23b`, branch `stage-2-data`.
- Author of all changes: Claude (Opus 5.5).
- Proof run by the host:
  - `npm run lint`: exit 0.
  - `npm run typecheck`: exit 0.
  - `npm test`: 61/61 tests pass in 6 files: rules, schema, RLS, seed, navigation and env.
  - `npm run build`: exit 0.
  - `npm run db:generate-history` run twice gives the same MD5 (`0f70e026…`). The test also checks that the committed file equals the generator output.
- PGlite summary of the generated data:
  - 73 check-ups: 71 completed and 2 abandoned.
  - 573 measurements, 12 alerts (1 red radiation alert and 1 active sleep trend alert), 74 messages (1 still in transit) and 7 baselines (n = 10).
- Deviations from the plan:
  - The local loader lives in `scripts/db/local-db.ts`; the tests and the generator share it.
  - The history refers to indicators by `code` through a subselect, because catalog UUIDs are random in each database.
  - The CLI script is `.mts` (ESM, to allow top-level await).
  - 13 articles, against "≈12" in the plan.
  - The test regex accepts "Documents 0X" as well as "Document 0X".

## Inspection 1: fresh Codex session

- Result file: `scratchpad/s2-inspect-1/claudex-_ahwgbm7/result.json`
- Session: `01a1df37-90d4-…`
- **Verdict: REVISE** with 3 findings:

| Finding | Problem | Fix (all accepted) |
|---|---|---|
| R1 medium | A recipient could change a message's `id` | Column grant `update (read_at)`. The trigger now compares the whole row except `read_at` |
| R2 medium | A calculated baseline was accepted with fewer than 5 samples | `CHECK (source <> 'calculated' or sample_count >= 5)`. Covers insert and update by the surgeon |
| R3 medium | The README promised `supabase db reset` without a config | CLI shortcut removed. SQL Editor is the only path documented as verified |

- PLAN.md: the superseded passages are now marked "Inspection fix".
- Tests added:
  - the recipient cannot change a message `id`;
  - a calculated baseline with n=0 is rejected (insert and update);
  - a manual baseline with n=0 is allowed;
  - immutability is checked at both layers (grant and trigger).
- Proof after the fixes: lint 0, typecheck 0, 63/63 tests, build 0. The history MD5 has not changed.
- Next: fresh inspection (round 2/2).

## Inspection 2: fresh Codex session (budget 2/2 used)

- Result file: `scratchpad/s2-inspect-2/claudex-itugg7h8/result.json`
- Session: `01a1df3a-…`
- **Verdict: REVISE.** The 3 findings from inspection 1 are no longer reported. 2 new findings:

| Finding | Problem | Fix |
|---|---|---|
| R1 medium | An existing link could be bypassed by changing a measurement's indicator or an alert's owner | Accepted. Identity columns are immutable on UPDATE (per-table trigger branches, all roles) and the UPDATE grants are column-limited |
| R2 medium | The catalog had "repeat after 5/30 minutes" timings and positioning protocols that the sources do not support | Accepted. Timings and protocols removed; texts limited to "repeat/follow up" (RN-08), report or escalate, and documented countermeasures (journaling, relaxation time, resistance exercise, shelter) |

- Tests added: an astronaut cannot re-point a measurement's indicator, a surgeon cannot change an alert's owner, and both are rejected at the grant layer and at the trigger layer.
- Proof: lint 0, typecheck 0, 65/65 tests, build 0. The history MD5 has not changed.
- **These final fixes have NOT been independently inspected.** The inspection budget (2) is exhausted, so it is the user's decision whether to fund a third inspection.
- User (Jonathan) chose Option A: fund a 3rd fresh inspection of the final fixes, then commit and push.

## Inspection 3 (user-funded, fresh Codex session)

- Result file: `scratchpad/s2-inspect-3/claudex-ca2eic3r/result.json`
- Session: `01a1df3f-…`
- **Verdict: REVISE**, 2 findings:

| Finding | Problem | Disposition and fix |
|---|---|---|
| R1 (medium) | The surgeon had full UPDATE on `indicator`, so it could change the classification and the scientific content | Accepted. Column grants now cover only thresholds/actions (`indicator`) and `current_phase`/`delay_seconds`/`demo_factor` (`mission`) |
| R2 (medium) | A privileged reassignment of a profile's mission would expose that profile's history | Accepted. Trigger `profile_mission_locked` blocks a mission change once the profile has any activity |

- Tests added:
  - surgeon threshold edit is allowed;
  - surgeon cannot change classification, source or instructions;
  - privileged mission reassignment of a profile with history is rejected.
- Proof:
  - lint and typecheck exit 0;
  - 67/67 tests pass;
  - build exit 0;
  - history MD5 unchanged.
- Next step: inspection 4 on the final state before commit and push, per the user's intent ("review, then commit and push").

## Inspection 4 (fresh Codex session)

- Result: `scratchpad/s2-inspect-4/claudex-66znkx44/result.json`
- Session `01a1df42-…`
- **Verdict: REVISE**, with 2 findings:
  - R1 (medium): direct inserts could store physically impossible values (RN-07 was enforced only in TypeScript).
  - R2 (medium): surgeons could save inconsistent threshold orders.
- User decision (Jonathan): **option A**. Fix both, then commit and push, with the final fix recorded as **not independently inspected**.
- Fixes:
  - R1: the measurement trigger now validates RN-07, requiring a finite value within the range for `number`/`scale` indicators.
  - R2: CHECKs added: `alert_min <= normal_min`, `alert_max >= normal_max`, `yellow <= red` deviation.
  - Tests: impossible value and NaN rejected on direct insert; unordered threshold updates rejected.
- Proof: lint 0, typecheck 0, 68/68 tests, build 0. History MD5 unchanged.
- **Unreviewed:** the inspection-4 fixes above (user accepted).

## Summary of Stage 2 reviews

| Review | Rounds | Result |
|---|---|---|
| Plan review | 3 | REVISE, REVISE, APPROVED |
| Code inspection | 4 | 4× REVISE, 9 findings in total, all accepted and fixed |

The last fix batch has not been inspected.
