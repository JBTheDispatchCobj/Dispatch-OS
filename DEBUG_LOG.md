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

## Wave 4 — Auric distribution + hardening (2026-07-21, COMPLETE — Sprint I closed)

- **[RESOLVED] `brief` channel now carries a delivery.** The pipeline renders a `brief` **channel-lens**
  variant (appended LAST so the pre-existing market/role variant ids stay byte-identical). A `channel` lens is
  dropped by `buildFeed` (`matchesContext`), so the ranked feed is unchanged, but `distribute()` filters by
  `v.channel` so the brief variant lands on the `brief` channel — an approved publication now delivers **5
  across 3 channels** (brief/market_feed public, terminal_feed network). Verified by the debug-loop EDITORIAL
  step + `tests/distribution.test.mjs`.
- **[RESOLVED] Engine unit tests + CI.** `tests/*.test.mjs` (92 tests) wired into the debug loop (TESTS step)
  + GitHub Actions (`.github/workflows/ci.yml`). Mutation-tested for teeth: breaking the editorial gate → 2
  failures; breaking approved-evidence-only → caught by `tests/ic_memo_approved_only.test.mjs` (added after the
  first probe found the original citation/excluded assertions did NOT cover the COVERAGE path).
- **[RESOLVED] Registry resolver + merge guards.** `is_identifier` on `ExternalId` (default true — a
  non-identifying shared external id like `{system:"state"}` no longer proposes a spurious duplicate) +
  `applyMerge` liveness (contradictory re-merge into a different survivor throws) + `ultimateSurvivor`
  transitive-survivor resolution (with a cycle guard). Covered by `tests/registry_guards.test.mjs`. This burns
  down the Wave-3 "[NON-BLOCKING / DEFERRED] Object Registry resolver + merge lack defensive guards" item.
- **[RESOLVED] FinCEN object.** Added `financial_services:regulation:fincen` to the 341-class catalog and
  repointed the compliance ontology's SAR + CTR `filed_with_regulator` targets from `state_regulators` to it.
  Closed graph holds (181 objects, 0 unresolved). Burns down the Wave-0 "[DEFERRED] No FinCEN object" item.
- **[was NON-BLOCKING → FIXED] Router confidence-escalation floating-point drift.** `route()` computed
  `steps = ceil(shortfall / 0.2)`; a "round" shortfall like `0.9 - 0.3 = 0.6000000000000001` ceils to 4 rungs
  instead of the intended 3. **Fix:** `ceil(shortfall / 0.2 - 1e-9)`. Deterministic; the router unit tests
  (0.1→1 rung, 0.8→4 rungs) still hold. (Found by the unit-test agent.)
- **[DEFERRED] Distribution not yet surfaced → RESOLVED.** `/distribution` (`app/distribution/page.tsx` +
  `components/terminal/DistributionView.tsx`) renders the HELD-vs-APPROVED gate story + every delivery's
  lineage. Observability likewise surfaced at `/observability`.
- **[NON-BLOCKING] Allocation LP-identity reason label.** `allocation.ts:122` — for an LP missing BOTH KYC
  and KYB, the reason is always `kyc_incomplete` (the `kyb_incomplete` arm of the ternary is unreachable inside
  `!kycOk`). Harmless (identity is correctly gated; only the label is imprecise). Action: report both missing
  identity docs, or the kind-appropriate one. Left untouched to avoid churn on a heavily-tested engine.
- **[NON-BLOCKING] Transitive re-merge conservatively throws.** Re-applying `applyMerge(A,B)` AFTER A has
  itself been merged into C resolves the survivor to C and the liveness guard throws (B still points at A).
  This is intentional-conservative: it refuses an ambiguous re-merge rather than silently forking/flattening
  the append-only lineage. Real-world merges are single-level today (the DATA step + tests exercise only direct
  merges). Action (post 0016+0017): if path-compression is wanted, treat B→A→C as consistent and no-op.
- **[DEFERRED] FR per-rule SourceDocument attribution (carried from Wave 3).** Amendment truth objects still
  cite the eCFR bulk corpus `source_document_id`, not a per-FR-rule SourceDocument (full FR provenance is
  retained in `provenance_metadata` + `claimant_ref`, so nothing is lost — the indexed chain is imprecise).
  Cheap-but-not-trivial (touches provenance + would shift byte output); deferred to the real FR connector.
- **[DEFERRED] Volume XI label collision (carried).** Doc reconciliation pending Bryan folding his
  Institutional Intelligence Library into the docs set; not a code change.
- **[NON-BLOCKING] Per-delivery visibility is the channel default.** `distribute()` sets each delivery's
  visibility from its `ChannelSpec` (terminal_feed→network, market_feed/brief→public). A future policy step could
  narrow an individual variant below its channel default (the Wave-1 per-variant-visibility carry-over). No leak
  today — deliveries restate the IO refs exactly and only publish on the approved editorial path.
- **[DEFERRED] Distribution not yet surfaced in the Terminal.** `core/auric/distribution.ts` runs + is gated in
  the debug loop, but no UI renders the channel deliveries. A channel/distribution Terminal surface is a Wave-4
  continuation item.

## Wave 3 — Live data + kernel/truth services (2026-07-21)

- **[was ENV RISK → RESOLVED] JSON import under bare-Node type-stripping.** `ingest_regulations.ts`
  originally `import`ed the 2.7 MB corpus JSON at module top level; the debug loop imports the module
  under Node native type-stripping, where a bare `import x from "*.json"` throws (missing import
  attribute). **Fix:** split the loader into `ingest_regulations_data.ts` (static JSON import — Next/webpack
  inlines it) so the pure ingestion module stays side-effect-free; the debug loop reads the JSON via `fs`
  and passes parsed records in. tsc + build + debug-loop all green after the split.
- **[was WEAK-GATE → FIXED] DATA-INTEGRITY step had too many construction-identity asserts.** The Wave-3
  adversarial fleet flagged that several DATA-step assertions restated module constants and no source count
  was pinned, so silent source-corpus shrinkage could pass green. **Fix:** pinned the source shape
  (`records.length === 675`, `amendments.length === 10`), added a unique-truth-object-id check, a
  one-object-per-source-record check, and an **independent ratio oracle** (raw 5300 figures worked out
  longhand vs the assembled profile — a real cross-check, not `computeCallReportFacts` compared to itself).
  Re-ran: ALL GREEN (6/6).
- **[NON-BLOCKING] FR-amendment truth objects cite the eCFR-corpus SourceDocument, not a per-rule one.**
  Amendment observations/claims set `source_document_ids: [ctx.source_document_id]` (the eCFR bulk corpus),
  though the governing Federal Register rule is their real raw source. Full FR provenance is retained in
  `provenance_metadata` (`fr_url` / `fr_document_number` / `fr_citation` / `fr_rule_title`) and the claim's
  `claimant_ref`, so nothing is lost — but the indexed `source_document_ids` chain is imprecise. Action:
  when the real FR connector lands, emit a dedicated `source_documents` row per FR rule XML (`fr_rules/*.xml`)
  and repoint. Additive.
- **[NON-BLOCKING / DEFERRED] Object Registry resolver + merge lack defensive guards (behind the seam).**
  (a) `resolve()` trusts every `external_id` to be a true identifier — a shared *non-identifying* external id
  (e.g. `{system:"state"}`) would propose a spurious candidate. (b) `applyMerge()` has no liveness guard:
  contradictory caller merges (re-merge to a different survivor; merge into an already-merged object) can make
  the append-only lineage self-inconsistent. Neither affects the gate or the `/market` surface (the batch uses
  `ncua_charter` as the sole external id, and the service is exercised only with well-formed merges). Action:
  add an `is_identifier` flag on external-id systems + transitive-survivor resolution + already-merged guards
  when the service is wired to live persistence (post `0016`+`0017`, RFC-2003). Registry runs in-memory until then.
- **[DEFERRED] Institution 5300 batch is a labeled fixture batch, not real filings.** The real NCUA data
  present is regulatory, not per-institution 5300 financials, and none were fabricated/fetched.
  `batch_fixtures.ts` is explicitly labeled illustrative. The real per-CU 5300 connector (bulk NCUA Call
  Report data → institution profiles at scale) is a Sprint-III / Bryan-only connector task. The regulatory
  ingestion IS real and at scale (675 + 10).

## Wave 2 — Terminal UI (2026-07-21)

- **[was BUG → FIXED] IO `relevance` is `Record<string, unknown>`.** The Terminal view-model read
  `run.io.relevance?.score` / `.evidence_count`, which typed as `unknown` and failed the Next build's
  TypeScript pass. **Fix:** coerce with `typeof x === "number" ? x : fallback` in `app/terminal/page.tsx`.
  (Caught by `npm run build`'s type step, not `tsc --noEmit` alone — both are now part of the Wave 2 gate.)
- **[NON-BLOCKING] Terminal reads the golden fixture, not persisted/live data.** `app/terminal/page.tsx`
  runs `runDealPipeline(halcyonSummitRun())` server-side each render. Live NCUA data at scale +
  persistence is Wave 3 (gated on `0016`/`0017` for the registry service).
- **[DEFERRED] Per-variant visibility (carried from Wave 1).** Role-lens variants still inherit the IO's
  `network` visibility; the Terminal renders them on the `terminal_feed` channel, which is correct for
  the institution surface, but the engine-level per-variant visibility override remains a Wave 2/4 item.

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
