# Session Handoff — OLYMPIC SPRINT II · WAVE 3 COMPLETE (Kernel request envelope + contracts/API, ~47%)

## Where we are
Platform build **~47%**. **Sprint II is OPEN** (target ~55%). Migrations `0016`+`0017` are **applied** in
Supabase (the full `0001`–`0017` chain is live). Wave 3 stood up the RFC-2001/2014 seam: a typed **request
envelope** + a **service-contracts/API layer** the surfaces call THROUGH, with **authorize-FIRST** routing
through the permission engine and the ad-hoc `canReview` retired at the call sites. All checks green in-cloud:
`node scripts/debug-loop.mjs` **ALL GREEN (11/11)**, `npx tsc --noEmit` clean, `npm run build` exit 0,
`npm test` **182/182**.

## Wave 3 completed this session (kernel envelope + contracts, authorize-first)
Additive new files in `core/` + the sanctioned call-site wiring at the surfaces; the engines are UNCHANGED:
- **`core/kernel/envelope.ts`** — typed **RequestEnvelope** `{ principal, correlation_id, plane, occurred_at,
  request_id, idempotency_key? }`. Pure/deterministic: `makeEnvelope` copies + freezes and mints NOTHING
  (caller injects ids/timestamps); `deriveEnvelope` keeps the parent `correlation_id` for a child sub-step,
  fresh injected `request_id`; `envelopeActor` for provenance.
- **`core/kernel/contracts.ts`** — the **service contracts**. `authorizeThrough(env, action, resource)` is THE
  authorization call: `service` bypasses (like RLS); domain verbs review/approve/promote/decide map to the
  permission engine's `app_has_role` predicate against a verb-specific role set (review = owner/admin/reviewer;
  approve = owner/admin; promote = owner/admin/operator); plain verbs pass straight to `authorize()`.
  `guard(env, action, resource, delegate)` authorizes FIRST — on deny returns a typed **Refusal** carrying the
  machine-readable engine `reason` and the delegate NEVER runs; on allow runs it exactly once. Generic — no
  vertical noun. Exposes `REVIEW_ROLES/APPROVE_ROLES/PROMOTE_ROLES`, `refusalFrom`, `isRefused`,
  `tenantResource/planeResource`, and the `ReviewService/ProposalService/ApprovalService` contract shapes.
- **`core/auth/principal.ts`** — maps the demo `SessionUser` → a `Principal` (+ `sessionEnvelope`), so the
  surfaces authorize through the engine with NO backend. When real auth lands, only this mapping changes.
- **`core/auth/session.ts::canReview`** — RETIRED to a back-compat shim whose boolean now COMES FROM the engine
  (`writeTenantDecision(..., REVIEW_ROLES)`), not an ad-hoc OR.
- **`app/contracts.ts`** (surface adapter) + **`app/actions.ts`** + **`components/ReviewQueue.tsx`** — the
  human-gate actions (review sign-off, decide/promote a proposal, decide an approval, review evidence) now route
  THROUGH the contract (authorize-FIRST → the existing `store` mutation). Demo session = owner ⇒ always ALLOWS,
  so surfaces behave as before; a non-authorized principal gets a typed refusal.
- **`cartridges/cooperative_markets/deal_service.ts`** — **DealService** wraps the UNCHANGED `runDealPipeline`:
  authorize "promote" FIRST, then seed the RunContext from the envelope (`ctx.runId = env.correlation_id`) so
  every KernelEvent + CostEntry correlates to the request. Human gates (ICApproval + EditorialDisposition) stay.
- **`scripts/debug-loop.mjs`** — new **CONTRACTS** step (now 11 steps): envelope pure+derives · authorize-FIRST
  (deny→refusal, delegate un-run) · review/approve/promote truth table · service bypass · canReview shim =
  engine · deal run correlates to the envelope.
- **`tests/{envelope,contracts}.test.mjs`** — +20 tests (→ 182), mutation-probed for teeth.
- **Governance flipped:** BUILD_PROGRESS recomputed (~44% → ~47%); CURRENT_STATE / ACTIVE_BUILD / DEBUG_LOG updated.

## Validation
- **`node scripts/debug-loop.mjs` → ALL GREEN (11/11)**: TYPECHECK · ONTOLOGY · CARTRIDGE · ENGINE · PIPELINE ·
  DATA · EDITORIAL · PERMISSIONS · PROFILES · **CONTRACTS** · **TESTS (182/182)**.
- **`npx tsc --noEmit` → 0 errors.**  **`npm run build` → exit 0** (all surfaces prerender).
- **Adversarially verified** — a 4-lens fleet (correctness/edge · truth-doctrine · purity/determinism ·
  test-teeth). **0 blockers.** Fixed before commit: **evidence review** now actually routes through the contract
  (it was calling the store directly while the adapter header claimed otherwise); 2 test-teeth gaps closed
  (`deriveEnvelope` idempotency-key threading; the `agent:` actor branch). Doctrine + purity found nothing. All in
  `DEBUG_LOG.md` (Sprint II Wave 3 section), incl. the **[DEFERRED]** note that demo-session authorization is a
  tautology by construction (no real membership backend yet — the engine still has teeth against
  reviewer/operator/outsider/agent principals in the tests + debug step).

## State of the world
- **GitHub:** the Wave-2 commit was `cacaccf` (last pushed). **This Wave-3 commit is pending** (command below).
- **Supabase:** `0001`–`0017` **applied**. No schema change this wave (envelope/contracts are in-process).

## Next: SPRINT II — Wave 4 (see `SPRINT_II_WAVE4_KICKOFF_PROMPT.md`)
Paste `SPRINT_II_WAVE4_KICKOFF_PROMPT.md` as the first message of the new chat. Remaining Sprint II scope:
wire the **Supabase registry adapter** onto a real `@supabase/supabase-js` client on a **serialized write-chain**
+ the matured **entity-resolution / match-candidate** pipeline + profile **PERSISTENCE** (moves truth 40→45,
kernel 46→55). Respect the DEFERRED resolver note (a re-proposal must not clobber a reviewed candidate's status).

## Bryan-only (route around; don't block)
- `git push` (command below).
- **Decide the investment vehicle** (fund / per-deal SPV / both) — unblocks P4 fund/spv settlement.
- VC/Alloya legal + entity.

## Exact next command (Bryan, Mac terminal)
The Dispatch cloud sandbox cannot `git commit`/`git push` (its git VM blocks `.git` writes and has no identity).
The Wave-3 files were staged onto your disk as `_wave3_sprint2_incoming.tgz` in the repo root. Run this in your
Mac terminal — it clears the git lock + strays, EXTRACTS the tarball over the repo, removes the staging tarballs,
`git status` to confirm no lost updates, then commits + pushes:
```
cd ~/Downloads/Dispatch_OS_Cooperative_Markets_Repo && rm -f .git/index.lock && rm -rf _to_delete && rm -f _cloudsync_in.tgz _cloudsync_out.tgz _wave1_sprint2_incoming.tgz _wave2_sprint2_incoming.tgz && tar xzf _wave3_sprint2_incoming.tgz && rm -f _wave3_sprint2_incoming.tgz && git status && git add -A && git commit -m "Olympic Sprint II Wave 3 — Kernel request envelope + contracts/API layer (RFC-2001/2014), ~47%: core/kernel/envelope.ts (typed RequestEnvelope; pure, mints nothing; deriveEnvelope keeps the chain correlation id) + core/kernel/contracts.ts (service contracts the surfaces call THROUGH: authorizeThrough maps review/approve/promote/decide to the permission engine's app_has_role predicate; guard authorizes FIRST and on deny returns a typed Refusal carrying the machine-readable reason while the delegate never runs) + core/auth/principal.ts (demo session -> Principal) + app/contracts.ts (surface adapter) + cartridges/cooperative_markets/deal_service.ts (DealService wraps the UNCHANGED runDealPipeline: authorize promote FIRST, seed ctx.runId from the envelope so the run correlates). Retired core/auth/session::canReview at the call sites; canReview is a shim whose boolean now comes from the engine. Human gates (ICApproval + EditorialDisposition) untouched. debug-loop ALL GREEN (11/11, new CONTRACTS step); tsc clean; npm run build exit 0; 182/182 unit tests (+20). Adversarially verified (4-lens fleet, 0 blockers; evidence-review wiring gap + 2 test-teeth gaps fixed). kernel 34->46, harness 18->22, tests 49->51." && git push
```
Always `git status` first (the command above does) to confirm no lost updates before you commit. (`tar xzf` runs
in your native terminal, so it overwrites the changed files in place — the cloud mount can't.)
