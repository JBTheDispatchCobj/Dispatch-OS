# Session Handoff — OLYMPIC SPRINT II · WAVE 2 COMPLETE (Confidence engine → LIVE profile assembly + query, ~44%)

## Where we are
Platform build **~44%**. **Sprint II is OPEN** (target ~55%). Migrations `0016`+`0017` are **applied** in
Supabase (the full `0001`–`0017` chain is live). Wave 2 turned the profile layer from a fixed-confidence snapshot
into a **live, decaying, outcome-aware projection with a real query surface** — the Confidence Engine now DRIVES
assembly. All checks green in-cloud:
`node scripts/debug-loop.mjs` **ALL GREEN (10/10)**, `npx tsc --noEmit` clean, `npm run build` exit 0,
`npm test` **162/162**.

## Wave 2 completed this session (confidence-driven live assembly + query)
New files (additive, new-files-only, pure/deterministic, no vertical nouns in `core/`):
- **`core/profile/freshness.ts`** — per-truth-tier half-life POLICY (durable→volatile: human_approved 10y …
  dispatch_inference 90d) + deterministic `ageDaysBetween` (future/bad dates → 0) + `assessFreshness`
  (freshness = `decay(1, age, halfLife)` — the same engine curve) + `freshnessBand` (fresh/aging/stale).
- **`core/profile/assemble_live.ts`** — ADDITIVE wrapper over the unchanged `assembleProfile`: outcome-feedback
  (`reinforce` over `OutcomeEvent[]`, in order) THEN freshness decay (inside `combineSources`).
  `LiveAssembledProfile` = base profile + `as_of` + per-field `field_freshness` + an `outcome_adjustments` audit
  surface that persists the **outcome evidence source_refs** (lineage).
- **`core/profile/query.ts`** — deterministic, generic filter/rank/lookup over assembled profiles: subject_type /
  confidence / tier-floor (via `TIER_RANK`) / completeness / health / field predicate (exists/eq/gte/gt/lte/lt;
  numeric + numeric-string, blank-safe) / combined confidence+freshness floor; rank with total-order id tiebreak
  + direction-aware sinking of field-less profiles; `lookupField`; explainable `applied`.
- **`cartridges/cooperative_markets/profiles_live.ts`** (+ `scripts/profile-query-demo.ts`) — live
  regulation-environment profile over the REAL 675-section 12 CFR corpus (counts aged from the eCFR issue date) +
  live institution profiles over the 5300 batch (ratios aged from the reporting quarter-end; optional
  per-charter/-ratio outcomes) → `buildLiveProfiles` feeds `queryProfiles`. Institution figures remain LABELED
  FIXTURES; the regulatory corpus is REAL at scale; the ENGINE is real either way.
- **`scripts/debug-loop.mjs`** — new **PROFILES** step (now 10 steps): live decay + outcome-feedback + query +
  the freshness→`min_field_confidence` composition end-to-end, all deterministic.
- **`tests/{profile_freshness,assemble_live,profile_query,profiles_live}.test.mjs`** — +39 tests (→ 162),
  mutation-probed for teeth.
- **Governance flipped:** BUILD_PROGRESS recomputed (~41% → ~44%); CURRENT_STATE / ACTIVE_BUILD / DEBUG_LOG updated.

## Validation
- **`node scripts/debug-loop.mjs` → ALL GREEN (10/10)**: TYPECHECK · ONTOLOGY (181/0/0) · CARTRIDGE · ENGINE ·
  PIPELINE · DATA · EDITORIAL · PERMISSIONS · **PROFILES** (live decay + outcome-feedback + query, deterministic) ·
  **TESTS (162/162)**.
- **`npx tsc --noEmit` → 0 errors.**  **`npm run build` → exit 0** (all surfaces prerender).
- **Adversarially verified** — a 4-lens skeptic fleet (truth-doctrine · purity/determinism · correctness/edge ·
  test-teeth). **0 blockers.** Fixed before commit: outcome-evidence lineage now persisted (`outcome_source_refs`);
  3 query coercion/ordering edge cases hardened (numeric-string thresholds; blank-string ≠ 0; field-less profiles
  sink in both sort directions); 3 mutation-survivor test gaps closed (all rank_by branches; outcome
  ORDER-dependence pinned to 0.48≠0.52; freshness→query composed end-to-end). Purity found nothing. All in `DEBUG_LOG.md`.

## State of the world
- **GitHub:** the Wave-1 commit was `e8cb0d0` (last pushed). **This Wave-2 commit is pending** (command below).
- **Supabase:** `0001`–`0017` **applied**. Profiles are computed live but NOT yet persisted; a persisted profile
  store + matured entity resolution lands with the Supabase registry-client wave (moves truth 40→45).

## Next: SPRINT II — Wave 3 (see `SPRINT_II_WAVE3_KICKOFF_PROMPT.md`)
Paste `SPRINT_II_WAVE3_KICKOFF_PROMPT.md` as the first message of the new chat. Remaining Sprint II scope:
the **kernel request envelope + contracts/API layer (RFC-2001/2014)** (a typed envelope + service contracts the
surfaces call THROUGH — and route authorization through `core/kernel/permissions::authorize`, retiring
`core/auth/session::canReview` at the call sites); then **wire the Supabase registry adapter onto a real client**
on a serialized write-chain + the matured entity-resolution/match-candidate pipeline + profile PERSISTENCE.

## Bryan-only (route around; don't block)
- `git push` (command below).
- **Decide the investment vehicle** (fund / per-deal SPV / both) — unblocks P4 fund/spv settlement.
- VC/Alloya legal + entity.

## Exact next command (Bryan, Mac terminal)
The Dispatch cloud sandbox cannot `git commit`/`git push` (its git VM blocks `.git` writes and has no identity).
The Wave-2 files were staged onto your disk as `_wave2_sprint2_incoming.tgz` in the repo root. Run this in your
Mac terminal — it clears the git lock + strays, EXTRACTS the tarball over the repo, removes the staging tarballs,
`git status` to confirm no lost updates, then commits + pushes:
```
cd ~/Downloads/Dispatch_OS_Cooperative_Markets_Repo && rm -f .git/index.lock && rm -rf _to_delete && rm -f _cloudsync_in.tgz _cloudsync_out.tgz _wave1_sprint2_incoming.tgz && tar xzf _wave2_sprint2_incoming.tgz && rm -f _wave2_sprint2_incoming.tgz && git status && git add -A && git commit -m "Olympic Sprint II Wave 2 — Confidence engine drives LIVE profile assembly + a query surface (~44%): core/profile/freshness.ts (per-tier half-life policy → decay driver) + core/profile/assemble_live.ts (additive wrapper over assembleProfile: reinforce outcome-feedback THEN freshness decay; LiveAssembledProfile carries as_of + field_freshness + outcome-evidence lineage) + core/profile/query.ts (deterministic generic filter/rank/lookup: tier-floor/field-predicate/confidence+freshness floor; total-order id tiebreak; direction-aware field-less sinking) + cartridges/cooperative_markets/profiles_live.ts (live regulation-environment profile over the REAL 675-section corpus + live institution profiles over the 5300 batch) + scripts/profile-query-demo.ts. debug-loop ALL GREEN (10/10, new PROFILES step); tsc clean; npm run build exit 0; 162/162 unit tests (+39). Adversarially verified (4-lens fleet, 0 blockers; outcome-evidence lineage + 3 query edge cases + 3 test-teeth gaps fixed). truth 22→40, cartridge 75→77, tests 46→49." && git push
```
Always `git status` first (the command above does) to confirm no lost updates before you commit. (`tar xzf` runs
in your native terminal, so it overwrites the changed files in place — the cloud mount can't.)
