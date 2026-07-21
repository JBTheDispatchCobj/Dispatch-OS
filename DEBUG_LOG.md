# Debug Log — running notes (fix blockers now, circle back on the rest)

Convention: **[BLOCKER]** stops production → fix immediately · **[NON-BLOCKING]** works, revisit
when convenient · **[DEFERRED]** intentional, needs a decision/later phase. Run the review harness
any time with `node scripts/debug-loop.mjs` (after `npm install`).

## Open

- **[NON-BLOCKING] Debug harness needs a full checkout to be all-green.** `scripts/debug-loop.mjs`
  TYPECHECK + ENGINE steps require `node_modules` + a local `typescript` dep. Verified in-cloud on a
  partial checkout: ONTOLOGY ✓, CARTRIDGE ✓; code proven green via a consolidated `tsc` over all 18
  session files (exit 0) + a live P1→P2→P3 run. Action: run `npm install` then the harness on the
  Mac / in CI for the real all-green.
- **[DEFERRED] No FinCEN object in the 341-class catalog.** SAR/CTR filing endpoints reference
  `regulation:state_regulators` with a note. Action: consider adding `financial_services:regulation:
  fincen` to the catalog (additive) and repointing SAR/CTR.
- **[DEFERRED] Volume XI label collision.** Bryan's Institutional Intelligence Library labels its
  agent volume "Volume XI — Agent Intelligence"; the repo uses **Volume XI = Canonical Ontology**
  (ADR-0014). Reconcile when the library is folded into the docs set.
- **[DEFERRED] Deal-engine inputs are passed-in / fixtures.** P1 scores + P2 diligence evidence come
  from caller-supplied sourced inputs, not yet derived from live ingestion or the truth store. That
  derivation is the "live intake path" task (before/with P4).
- **[DEFERRED] Investment vehicle TBD (ADR-0016).** P4 settlement `fund`/`spv` adapters wait on
  Bryan's vehicle decision; `advisory`/`syndication` adapters are buildable now (vehicle-agnostic).
- **[DEFERRED] Migrations `0016` + `0017` pending Supabase apply.** Blocks the Object Registry
  service (RFC-2003) + live RLS/identity enforcement. Bryan-only.

## Wave 1 — Orchestration spine (2026-07-21)

- **[was BLOCKER → FIXED] Human gate was decorative.** The first cut of `pipeline.ts`
  routed the IC memo with `needs_regulated_conclusion` (router returns `escalate_to_human`),
  but the flag only added a cost entry — the pipeline auto-advanced to allocate/settle/publish
  on the DRAFT memo. That is an autonomous decision on a regulated/financial conclusion (violates
  DOCTRINE/ADR-0005). **Fix:** `ICApproval` is now a caller-supplied INPUT on `DealRunInput`
  (disposition + human `by` + `decision_ref`); GATE 2 halts the run `awaiting_approval` (or
  `declined`) and allocates/settles/publishes NOTHING unless a human disposition is `approved`.
  On approval the IO's `top_tier` becomes `human_approved_conclusion` and the decision_ref enters
  the evidence set. Proven in the debug loop: unapproved golden input → `awaiting_approval`, no
  downstream events; approved → settled. (Found by the Wave-1 adversarial verification fleet.)
- **[was NON-BLOCKING → FIXED] IO ref-partition conflation.** IO `fact_refs` had been built from
  memo-local `ev:*` handles (so claim-tier evidence masqueraded as fact) and `inference_refs` from
  raw score inputs. **Fix:** `partitionRefs()` buckets the real truth-object ids (memo `source_ref`,
  the 5300 filing, score lineage, the human decision) by tier prefix (`claim:`→claim_refs,
  `inference:`/`inf:`→inference_refs, else fact_refs); `claim_refs` is now populated and passed to
  `assembleIO`.
- **[DEFERRED] Per-variant visibility override.** Role-lens variants (CEO/CRO/CFO) inherit the IO's
  `network` visibility from the Auric engine (`renderVariant` copies `io.visibility`). Publication
  now only happens on the APPROVED path (so nothing unapproved is ever published), but a future
  engine enhancement should let a Terminal-channel role variant carry a narrower visibility than the
  market IO. Wave 2/4; engine-side, additive. No truth leak today (variants restate the IO's refs
  exactly — no superset).
- **[NON-BLOCKING] `node file.ts` alias resolution.** Node 22 strips TS types natively but does not
  read tsconfig `paths`, so bare `node scripts/pipeline-demo.ts` needs `@/*` mapped at runtime.
  `scripts/alias-hook.mjs` (a resolve hook, registered before the dynamic import) handles it; it is a
  scripts/ runtime shim only, never imported by `app/` or `core/`, and does not affect `next build`.
  Also: the pipeline avoids TS parameter-properties/enums (erasable-only) so type-stripping runs it.

## Notes / design choices (not issues)

- Opportunity Score uses a **geometric mean** of strategic × regulatory × timing (keeps 0–100 scale
  while letting any weak dimension sink the pairing) — VC_DEAL_ENGINE_SPEC §5.
- Local validation uses a **faithful `SeedBundle` shim** for `@/core/data/store` (the real store
  pulls the whole engine cone, irrelevant to type-checking config/engine literals). The full-app
  `tsc` in the harness is the real gate; the shim never ships.

## Monster batch (2026-07-20)

- **[NON-BLOCKING] 7 new subsystem modules are not yet wired into a running pipeline.** kernel
  (event_bus, cost_ledger), truth (confidence), harness (router), auric (engine), settlement,
  ingest_call_report — all strict-`tsc` clean and integration-clean (25-file consolidated
  typecheck exit 0), but they're libraries, not a running system. Wiring = Sprint Wave 1
  (`docs/00_governance/SPRINT_PLAN.md`).
- **[NON-BLOCKING] `terminal_demo.html` is a static mock**, not the Next.js Terminal. Real UI =
  Sprint Wave 2.

## Resolved

- **[was risk] Parallel-agent integration.** 6 agents wrote 7 modules concurrently; verified they
  compile TOGETHER (not just individually) via a consolidated strict `tsc` over all 25 session
  files → exit 0. No cross-module type drift. (2026-07-20)

- **[was BLOCKER] Debug harness false-green.** The ENGINE step was async but not awaited, so its
  assertions ran after the summary and never gated the result. Fixed: `step()` awaits async checks;
  re-verified the engine invariants actually assert. (2026-07-20)
- **[was BUG] `MetricType "opportunity"` invalid** in the cartridge (it's a `RuleType`, not a
  `MetricType`). Fixed → `operational`. (2026-07-20)
