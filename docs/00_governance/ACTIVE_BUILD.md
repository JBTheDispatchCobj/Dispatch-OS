# Active Build

## Active initiative
Cooperative Markets foundation on Dispatch OS. The full Specification Program (Vols
I–X) is reconciled/adopted; forward work is BUILD.

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
1. **Canonical Entity Model + entity resolution (RFC-3002 / kernel Object Registry).**
   The highest-leverage bridge item: `entities` canonical naming + `entity_aliases` +
   external ids + dedup/merge/split; **relax `entities.workspace_id` to nullable + add
   `plane`/`visibility`** (mirrors `0011` sources; additive) so canonical shared-market
   entities exist. Unblocks truth graph, profiles, and the coop-markets cartridge.
2. **Identity & Tenancy (RFC-2002)** — `identities`/`memberships` (title + function
   category + org-defined open role) + permissions engine; RLS hardening on `0016`.
3. Cooperative Markets cartridge (`cartridges/cooperative_markets/`) — first cartridge.

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
