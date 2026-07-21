# Active Build

## Active initiative
Cooperative Markets foundation on Dispatch OS. The full Specification Program (Vols
I–X) is reconciled/adopted; forward work is BUILD.

## Roadmap / knowledge-encoding sprints (Vol XI+)
Plan of record: `DISPATCH_OS_REMAINING_ROADMAP.md` — Sprints 1–10 encode business
knowledge (ontology, truth models, rule/workflow/agent/connector/KPI/knowledge-pack
libraries, reports, institution graph). **Vertical scope: the finance / VC / CU / fintech /
innovation stack (ADR-0015); Hospitality descoped.** **Sprint 1 = Volume XI Canonical
Ontology (ADR-0014), COMPLETE:** framework (`core/registry/ontology.ts`) + **8 packs /
181 objects, closed graph (0 unresolved, 0 collisions), strict `tsc` clean** — Credit Union
(`ontology/credit_union.json`, 13), Lending & Deposits (`ontology/lending_deposits.json`, 30),
Capital Markets & Institutions (`ontology/capital_markets.json`, 54), Innovation Ecosystem
(`ontology/innovation_ecosystem.json`, 16), Compliance (`ontology/compliance.json`, 19),
Regulation (`ontology/regulation.json`, 15), Technology/Vendor (`ontology/technology_vendor.json`,
24), AI (`ontology/ai.json`, 10). Closed-graph check: `scripts/ontology-check.mjs`. All
ADR-0015 in-scope domains authored — no ontology packs remain for Sprint 1. Substrate done:
Object Registry index (`0017`) + the 341-class FS catalog + loader + `financial_services`
base package. Next roadmap sprints (truth models, rule/workflow/agent/KPI/knowledge-pack
libraries) hang off this ontology spine.

## Current context pack
`docs/context/packs/cooperative-markets-foundation.md`

## Done
1. Core contracts + migrations `0011`–`0015` (Truth, Relationships, Intelligence,
   Profile, DKR registry) — applied to Supabase.
1c. Constitution V1 adopted (ADR-0008); Art. 18 routing ladder amended to the
    canonical 9-rung (ADR-0011).
1e/1f. Vols 3/8/9 (ADR-0009), 5/6/10 (ADR-0010) reconciled — stub pass.
1g. Kernel Volume II adopted (ADR-0011): RFC-2000..2015; unified event bus +
    cost/usage ledger; portable identity (RFC-2002).
1h. **Volumes III–VII authored specs adopted (ADR-0012)** — real specs supersede the
    stubs; the whole program is reconciled. "Fact" = projection over verified tiers
    (multi-source materialized fact store on the roadmap).
1i. **`0016_market_rls.sql` written** — RLS for the plane-aware + registry-ops tables
    (Constitution Art. 20/23; ADR-0004). *Bryan: paste into Supabase to apply.*
1j. **Volumes VIII–X adopted (ADR-0013)** — Execution Engine (NEW), Connector Registry,
    Object Registry; numbering reconciled (VIII/IX/X); Object Registry = storage-dynamic
    identity index over typed tables (ADR-0004 kept). Whole program now reconciled.

## Immediate next (build)
**DONE (burns 1–2 this session):**
- **Cooperative Markets cartridge** (`cartridges/cooperative_markets/cartridge.ts`) — first
  product vertical: full config-as-data `PackagedConfiguration` on the FS base + Volume XI
  ontology (10 entities, 11 ladder workflows, rules/generationRules, inference metrics,
  outcomes, agent instructions, reports, dashboards, knowledge). Registered; `tsc` clean.
- **Operating-loop seed** (`seed.ts`) — Summit Ridge FCU × Halcyon Pay: 5300 intake → dry-run
  agent flag → match proposal → human-approved scoped pilot → evidence/decision/approval →
  metrics/outcomes/dashboard. Wired into the cartridge `seed`; `tsc` clean vs real record types.
- **Auric executive-lens slice** (`auric_lens.ts` + `auric_lens_demo.html`) — one public
  IntelligenceObject + a Relationship + three ContentVariants (base/CEO/CLO) sharing identical
  `source_refs`. The CEO≠CLO thesis, proven and rendered for the Alloya demo. `tsc` clean.

- **VC Deal Engine spec** (ADR-0016 + `docs/03_subsystems/VC_DEAL_ENGINE_SPEC.md`) — the
  monetization arm: vehicle-agnostic, advisory/syndication-first (fund/SPV as pluggable
  settlement adapters, vehicle TBD per Bryan); subscribers = CUs/FIs + LPs. Grounded in Bryan's
  Institutional Intelligence Library (FinTech Evaluation Framework, readiness triad, Deal
  Pipeline, IC/DD objects). Maps entirely to the existing ontology + cartridge — no core churn.

- **VC Deal Engine P1 — intake + scoring (DONE).** `cartridges/cooperative_markets/deal_engine.ts`
  — vehicle-agnostic, deterministic scoring (Innovation / Startup Readiness / Institution
  Readiness / Dispatch Readiness / Opportunity), every score a sourced inference with per-factor
  lineage; compliance-gated, human-gated recommendation. `scripts/deal-engine-demo.ts` runs it;
  strict `tsc` clean; deterministic; both ADVANCE and BLOCKED paths verified.

- **VC Deal Engine P2 — diligence + IC memo (DONE).** `ic_memo.ts` — emits
  `investment_committee_memo` from **approved evidence only**, DD-coverage-gated, role-lensed
  (CEO/CRO/CFO), recommendation a `draft` proposal. `scripts/ic-memo-demo.ts` runs it.
- **VC Deal Engine P3 — allocation + subscriber tiers (DONE).** `allocation.ts` — routes an
  approved deal to CU + LP subscribers through sanctions/KYC-KYB/accreditation gates, pro-rata to
  capacity, emitting `participation`/`:syndication` allocations + the `deal_flow_access` outcome;
  allocation is a proposal, settlement is P4. `scripts/allocation-demo.ts` runs it.
- **Debug-loop harness (DONE).** `scripts/debug-loop.mjs` — the review surface (no UI yet):
  full-app typecheck + ontology closed-graph + cartridge canonical-map + an engine smoke that
  transpiles + executes P1/P2/P3. Single PASS/FAIL; run → fix → re-run. Validated: consolidated
  `tsc` over all 18 session files exit 0; the P1→P2→P3 chain executes correctly + deterministic.

- **MONSTER BATCH (DONE) — 7 subsystem modules via a parallel agent fleet.** `core/kernel/
  {event_bus,cost_ledger}.ts`, `core/truth/confidence.ts`, `core/harness/router.ts`,
  `core/auric/engine.ts`, `cartridges/cooperative_markets/{settlement.ts (P4), ingest_call_report.ts}`
  — all strict-`tsc` clean together (25-file consolidated check, exit 0). Plus `terminal_demo.html`
  (product surface) + `docs/00_governance/SPRINT_PLAN.md` + `SPRINT_KICKOFF_PROMPT.md`.

## NOW: the Olympic Sprint (see `docs/00_governance/SPRINT_PLAN.md`)
The work is the **sprint**, not another one-off burn — a multi-agent blaze that wires the built
modules into a **running, demoable vertical slice + real Terminal UI**, debug loop gating each wave.
Waves: 1 spine · 2 Terminal UI · 3 live data + services · 4 Auric distribution + hardening.

- **✅ WAVE 1 — Orchestration spine (DONE, 2026-07-21).** `cartridges/cooperative_markets/pipeline.ts`
  (`runDealPipeline`) chains ingest(5300) → score → IC memo → allocate → settle → assembleIO →
  renderVariants → buildFeed into a deterministic `DealRun`, routing every stage through the harness
  and emitting kernel events + cost entries. **Real human gate** on the regulated conclusion
  (`ICApproval` input; unapproved → `awaiting_approval`, publishes nothing; approved → settled).
  `scripts/pipeline-demo.ts` + `pipeline_fixtures.ts` + `scripts/alias-hook.mjs`; debug loop extended
  with a PIPELINE step. **`node scripts/debug-loop.mjs` ALL GREEN (5/5)**, full-app `tsc` clean.
  Adversarially verified (one blocker — decorative gate — found + fixed before commit).
- **▶ WAVE 2 — Terminal UI (NEXT).** Replace `terminal_demo.html` with the real Next.js product
  surface reading `runDealPipeline` output: runtime shell + nav; opportunity feed with the
  executive-lens toggle (CEO/CRO/CFO) over `buildFeed`; institution/deal scorecards (P1); IC memo
  view (P2); allocation (P3); portfolio/monitoring (P4). New files under `app/terminal/*`. Gate:
  `npm run build` (Next) + debug-loop green.
- Waves 3–4: live NCUA ingestion at scale + kernel/truth services (post `0016`/`0017`); Auric
  distribution + tests/CI/observability. Debug cadence: log to `DEBUG_LOG.md`, fix blockers,
  `node scripts/debug-loop.mjs` green at each wave gate.
2. **Live intake path** — call-report/startup ingestion so the loop runs on real data, not the
   seed (a real connector over the `ncua_call_reports` / `startup_intake` source types).
3. **Canonical Entity Model + entity resolution (RFC-3002)** and **Identity & Tenancy
   (RFC-2002)** — gated on Bryan applying `0016` + `0017`; then the Object Registry service
   populates `object_match_candidates` + applies merges.

**Also open (Bryan's library):** fold the Institutional Intelligence Library
("fintech venture vendor side," ~22k lines) into the docs set + cross-check vs the ontology;
reconcile its "Volume XI — Agent Intelligence" label against the repo's Volume XI = Canonical
Ontology (ADR-0014).

**Bryan-only (unblock me):** apply `0016` + `0017` in Supabase; `git push`; VC/Alloya legal.

## Kernel build backlog — Volume II (ADR-0011)
Spec: `volumes/kernel/`. Additive-forward.
1. Identity & Tenancy (RFC-2002) + permission engine + RLS — HIGH.
2. Unified event spine + correlation IDs, then bus/DLQ/replay (RFC-2004) — HIGH.
3. Cost + Usage Ledger (RFC-2008) — HIGH.
4. Object Registry runtime service + entity resolution (RFC-2003) — HIGH (= Immediate #1).
5. `contracts/` layer + kernel API + request envelope (RFC-2001/2014) — HIGH.
6. Audit projection (RFC-2007); 7. Memory Service (RFC-2012); 8. Model/Prompt/Policy/
   Eval registries (RFC-2009/2013 — kernel side only); 9. Cartridge/connector runtime
   (RFC-2010/2011); 10. Acceptance/QA harness (RFC-2015).
Deferred adjudication: workflow lifecycle canonicalization (RFC-2005 vs 2001).

## Volume build backlog — III–VII (ADR-0012)
- **Vol III Knowledge Graph & Truth** (`volumes/knowledge_graph/`):
  - Confidence Engine (RFC-3008): decay/propagation/outcome-feedback over the scalar
    `confidence` column — HIGH.
  - Evidence-object + chain-of-custody (RFC-3009) — MED.
  - Graph Assembly + Query engines + KG APIs (RFC-3010/3011/3014, greenfield; KG API
    is a facet of the kernel API, not a parallel stack) — HIGH.
  - Profile Assembly Engine + lenses/health (RFC-3012) — MED/HIGH.
  - Public/private: ownership dimension + sharing/promotion workflow; RFC-3013
    per-scope "graphs" are logical views over the unified tables (not physical) — MED.
  - "Fact" projection over verified tiers; roadmap: multi-source materialized fact
    store (ADR-0012) — MED (roadmap).
  - Disambiguate "Context Pack" (execution context-pack vs governance pack).
- **Vol IV Agent Harness** (`volumes/agent_harness/`, ~greenfield): task classifier,
  execution planner/DAG, context-pack builder, tool router, multi-agent runtime,
  execution engine, evaluation engine, escalation framework, recovery, harness APIs.
  Kernel-side (Model Router/Prompt Registry/cost ledger) filed under kernel #3/#8, not
  here. Reconcile harness ladder → canonical 9-rung; keep 3-value RiskLevel (revisit).
- **Vol V Cooperative Markets** (`volumes/cooperative_markets/`) — first-cartridge list:
  author the `cooperative_markets` PackagedConfiguration + 9 cartridge entities
  (credit_union, call_report, executive [= PersonalProfile ext], innovation_company,
  cuso, fund, investment, regulation, product) + **add reserved `:vendor` entity**;
  call-report/regulatory ingestion (evidence+source+lineage, never conclusions in
  weights); matching/pilot/partnership/investment/monitoring as workflows on the
  relationship stage ladder; opportunity/readiness/scoring as Calculations + IO kinds.
- **Vol VI The Auric Engine** (`volumes/auric_engine/`) — publication engine: IO
  intake/assembly; lens renderer + generator; editorial verification gate; distribution
  + channel breadth; engagement→knowledge feedback loop; fair-use guardrails; IO
  versioning. No conflicts (ADR-0012).
- **Vol VII Terminal** (`volumes/terminal/`, greenfield UI/runtime): terminal runtime +
  window/layout; command palette; navigation + universal search; notification center;
  task center; dashboard runtime; collaboration; offline/sync (needs write-path ADR).
  Rename the UI "Workspace" concept (collides with the durable tenant Workspace);
  Object Explorer = projection, not a universal `objects` table; all Terminal tables in
  a `terminal/` layer, never `core/`.

## Volume build backlog — VIII–X (ADR-0013; numbering reconciled)
- **Vol VIII Execution Engine** (`volumes/execution_engine/`, NEW coordination tier above
  the Harness) — file only the delta; consume kernel RFC-2005/2004 + Harness RFC-4009/4012/
  2013: `OperationalPlan` graph (renamed from ExecutionPlan to avoid the Vol IV collision);
  org scheduler (windows/queues/resource alloc); human-agent collaboration + responsibility
  matrix + handoffs; compensation/rollback (saga); live monitoring (health/bottleneck/
  forecast); multi-party/committee approval + delegation; scorecards; automation governance.
  Route Security + constitutional Policy hierarchy to the kernel. **Prereq ADRs:** rename
  OperationalPlan; the level-stratified workflow-lifecycle registry (closes ADR-0011 deferral).
- **Vol IX Connector Registry** (`volumes/connector_registry/`) — registry/manifest/trust/
  discovery/**Connector SDK** layer; runtime is kernel RFC-2011. Gaps = ADR-0009 connector
  items (typed Connector Output Contract, parser contract, change_event, quality_report,
  failure semantics, connector_health, coverage matrix, qualify ~93 placeholders) + SDK.
- **Vol X Object Registry** (`volumes/object_registry/`) — the canonical **identity index**
  over the typed plane-aware tables (ADR-0004 preserved), **storage-dynamic** per
  object_class (+ `plane` on the index). Unify entity resolution (RFC-3002 model + RFC-2003
  service; RFC-10004/9008 defer). Per-instance versioning; object APIs/SDK; object telemetry;
  semantic search. Verticals stay `cartridge_entity`; trust on assertions/sources, not identity.

## Other volume gaps
Cartridge SDK (old committed Vol 10) folded into kernel #9 (Cartridge Runtime, RFC-2010).

## Explicitly deferred
Final UI polish; securities execution mechanics; production fund/SPV administration;
full multimedia rendering; paid billing implementation.

## Spec errata (fix in source docs, non-blocking)
Vols 6 & 7 internal RFC-map inconsistencies (overview vs body numbering). Earlier stub
boilerplate errata per ADR-0009/0010.
