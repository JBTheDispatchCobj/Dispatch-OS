# Current State

## Running now (Olympic Sprint — Sprint I CLOSED at Wave 4, ~38%, 2026-07-21)
The first product vertical **RUNS end-to-end.** `cartridges/cooperative_markets/pipeline.ts`
(`runDealPipeline`) chains **ingest(5300) → score → IC memo → allocate → settle → assembleIO →
renderVariants → buildFeed** into one deterministic `DealRun`: every stage is routed through the
harness, emits a correlated `KernelEvent`, and records a `CostEntry`. The **human gate is real** —
a regulated conclusion (the IC memo) may not allocate/settle/publish until a caller-supplied
`ICApproval` disposes it `approved`; otherwise the run halts `awaiting_approval` (proven: unapproved
golden input publishes nothing; approved → settled, IO lifted to `human_approved_conclusion`).
`node scripts/pipeline-demo.ts` runs Halcyon × Summit end-to-end; the debug loop gained a PIPELINE
step and is **ALL GREEN (5/5)** with full-app `tsc` clean.

**Wave 2 (DONE):** the real **Terminal UI** is live at `/terminal` (`app/terminal/page.tsx` +
`components/terminal/TerminalView.tsx`) — it renders the live `runDealPipeline` output as a product
surface: harness stage rail with the human gate, institution + deal scorecards, the CEO/CRO/CFO
executive-lens toggle over `buildFeed`, IC memo, allocation, settlement/monitoring, and the kernel
spine.

**Wave 3 (DONE, 2026-07-21):** the vertical now runs on **REAL data at scale** + the first kernel/truth
services. The data staged in `docs/04_sources/ncua/` is real NCUA **regulatory** text (675 in-force 12
CFR sections + 10 pending amendments), **not** 5300 financials, so "live NCUA data at scale" was executed
honestly against it. `cartridges/cooperative_markets/ingest_regulations.ts` ingests the real corpus into
sourced, **bi-temporal** truth objects (in-force → `public_fact` at the issue date; pending full-text →
future-dated observations; amendatory **instructions** → claims **held pending human merge**, never
auto-applied). `core/profile/assemble.ts` is the **Profile Assembly Engine (RFC-3012)** — generic/core,
rolling sourced fields up through the confidence engine into a profile with confidence/top_tier/lineage/
completeness/health. `cartridges/cooperative_markets/ingest_batch.ts` runs the **5300 batch path** → facts
(`deterministic_calculation`, each citing its filing) + an assembled institution profile each, over a
clearly-labeled fixture batch (real per-CU 5300 connector deferred). `core/registry/service.ts` is the
**Object Registry service (RFC-2003)** + entity resolution behind a persistence seam (in-memory now;
duplicates **proposed, never auto-merged**; live persistence gated on `0016`+`0017`). A second Terminal
surface, **`/market`**, renders the institution-profile list + the real regulatory environment + the
registry status. The debug loop gained a **DATA-INTEGRITY** step (pinned source counts + an independent
ratio oracle + profile→source reconciliation). Gate: `npm run build` exit 0 (`/market` prerenders) +
debug-loop **ALL GREEN (6/6)** + `tsc` clean.

**Wave 4 (DONE, 2026-07-21) — Sprint I closed (~38%):** the **Auric distribution + editorial verification
gate** (`core/auric/distribution.ts`) publishes an IO's rendered variants to channels (brief / market-feed /
terminal-feed) ONLY on an approved HUMAN `EditorialDisposition` (a second human gate, distinct from the IC
deal gate; held/rejected/absent → nothing published; deliveries carry the editorial `decision_ref` +
`approved_by` and restate the IO refs exactly). Wave 4 then HARDENED the whole vertical:
- **Engine unit-test suite** — `tests/*.test.mjs` (**92 tests**) over deal_engine / ic_memo (approved-
  evidence-only, proven to gate COVERAGE) / allocation / settlement / auric engine + distribution /
  confidence / profile-assemble / ingest_regulations / registry-service / harness-router — each self-registers
  the `@/*` alias hook + dynamically imports its target (native TS type-stripping, no build step). Wired into
  the debug loop as a **TESTS** step and into **GitHub Actions CI** (`.github/workflows/ci.yml`) as the commit
  gate (debug loop + `next build` on every push/PR).
- **Observability** — `core/kernel/observability.ts` (pure, generic): cost dashboard (by category/
  correlation/label) + event replay over the kernel's append-only log + `runHealth`; surfaced at
  **`/observability`**.
- **Distribution Terminal surface** — **`/distribution`** renders the HELD-vs-APPROVED editorial-gate story
  and every channel delivery with its lineage, restated refs, and visibility. The **`brief` channel** now
  carries a delivery (a channel-lens variant), so an approved publication delivers **5 across 3 channels**.
- **Cleanup** — registry `is_identifier` + merge-liveness/transitive-survivor guards; a router confidence-
  escalation floating-point fix; a **FinCEN** regulation object (SAR/CTR repointed; closed graph holds).
Gate: debug loop **ALL GREEN (8/8)** (adds **TESTS 92/92**) + `tsc` clean + `npm run build` exit 0. There are
now four real Terminal surfaces: `/terminal`, `/market`, `/distribution`, `/observability`. Adversarially
verified (3 workstream agents + an independent verifier; no blockers; one test-coverage gap surfaced by the
verifier was closed with a mutation-proven test).

## Running now (Olympic Sprint II — Wave 1, ~41%, 2026-07-21)
**Sprint II opened (Kernel & Truth platform, target ~55%).** Migrations `0016`+`0017` are now **applied**
(Bryan, 2026-07-21) — the Object Registry live-persistence path is UNBLOCKED. Wave 1 built the deterministic
**Identity & Tenancy + permission substrate (RFC-2002)** and the **live-persistence adapter** for the registry
seam:
- **`core/kernel/identity.ts`** — portable cross-org identity: a `Principal` holds membership across many
  orgs/workspaces with a per-workspace `role`; `isMember`/`roleIn`/`hasRole`/`actorString` are the in-process
  mirror of `auth.uid()`/`app_is_member`/`app_has_role`. Pure/deterministic, generic (no vertical nouns).
- **`core/kernel/permissions.ts`** — a deterministic, plane+visibility-aware authorization core that is a
  FAITHFUL, line-for-line mirror of the `0016`/`0017` RLS predicates (`app_can_read_plane`,
  `app_can_write_tenant`, `app_can_admin_object`) — so a surface gets the SAME answer in-process as RLS gives
  at the database boundary. Service-role bypass modeled explicitly (shared-market ingestion). Every decision
  carries a machine-readable `reason` (lineage, not a bare boolean). The load-bearing invariant is reproduced:
  a **shared-market registry merge is governable by NO authenticated user — only the platform service role**.
- **`core/registry/supabase-store.ts`** — a Supabase adapter implementing the EXISTING `RegistryPersistencePort`
  seam against the `0017` tables (`object_registry`/`object_match_candidates`/`object_merges`), hybrid
  hydrate/write-through (mirrors `core/data/supabase-adapter.ts`), with PURE row mappers + the same deterministic
  id→uuid bridge. **Default stays in-memory** (`registryStore()` → InMemory unless a client is supplied) so the
  gate is green with no creds; no change to `ObjectRegistryService`.
Gate: **debug-loop ALL GREEN (9/9)** (adds a **PERMISSIONS** step asserting authz == the RLS truth table) +
`tsc` clean + `npm run build` exit 0 + **123 unit tests** (was 92; +31 across identity/permissions/adapter).
Adversarially verified. Registry persistence stays in-memory by default behind the seam; the Supabase adapter
drops in when a client is configured.

## Existing foundation
- Next.js app; Supabase/Postgres adapter + migrations (`0001`–`0017` **applied 2026-07-21**;
  the full `0001`–`0017` chain is live — all 14 registry-table RLS policies confirmed).
- Org/workspace scaffolding; generic (now plane-aware) entities; work items, evidence,
  proposals, approvals, reports, metrics, outcomes; rules; agent runs; widgets.
- Wealth, field-service, and (generic, non-vertical) hospitality example cartridges,
  **plus a `financial_services` base package installing 341 canonical object classes as
  entity_types** (config-as-data: `core/registry/data/financial_services_objects.json` +
  `core/registry/objects.ts`).
- **First product vertical: the `cooperative_markets` cartridge**
  (`cartridges/cooperative_markets/cartridge.ts`) — a full config-as-data
  `PackagedConfiguration` on the FS base + Volume XI ontology: 10 vertical entities (9 +
  reserved vendor) mapped to canonical `schema_ref`s; 11 workflows on the discovery→…→
  investment ladder + call-report ingestion + regulatory-impact review; rules/generationRules,
  evidence/approval, metrics (sourced inferences), outcomes, agent instructions, reports,
  dashboards, knowledge. Registered; strict `tsc` clean. It is the installed product
  *definition* — no ingestion/seed/engine/UI runs the loop yet.
- **Vertical scope (ADR-0015):** the finance / VC / CU / fintech / innovation stack.
  Hospitality descoped as a product vertical.

## Governance
- **Dispatch Constitution V1** (Volume I); Art. 18 routing ladder amended to the
  canonical 9-rung (V1.1 erratum, ADR-0011).
- **Specification Program fully reconciled/adopted (Vols I–X).** Authored specs of
  record: Kernel Vol II (`volumes/kernel/`, RFC-2000..2015) and Vols III–VII
  (`volumes/{knowledge_graph,agent_harness,cooperative_markets,auric_engine,terminal}/`).
- ADRs: 0004 plane graph · 0005 truth envelope · 0006 DKR · 0007 truth reconciliation ·
  0008 Constitution V1 · 0009 Vol 3/8/9 · 0010 Vol 5/6/10 · 0011 Kernel Vol II ·
  0012 Vols III–VII adopted · 0013 Vols VIII–X adopted + spec-program numbering
  (VIII=Execution Engine [new], IX=Connector, X=Object Registry; Cartridge SDK→kernel) ·
  **0014 Volume XI Canonical Ontology** (ontology layer over the Object Registry) ·
  **0015 Vertical scope** (finance/VC/CU/fintech/innovation; Hospitality descoped).
- **Remaining plan of record:** `DISPATCH_OS_REMAINING_ROADMAP.md` (Sprints 1–10 —
  knowledge encoding: ontology, truth models, rule/workflow/agent/connector/KPI/knowledge-pack
  libraries, reports, institution graph). Sprint 1 = Volume XI (in progress).

## Implemented contracts (code + applied Supabase)
Truth (`core/truth` + `0011`), Relationships (`0012`), Intelligence (`0013`),
Personal profiles (`0014`), DKR registry (`0015`). RLS (`0016`) + Object Registry identity
index (`0017`) written + validated (full `0001`–`0017` chain applies on Postgres 16), not yet
applied. Object Registry catalog + loader live in code; **Volume XI ontology** framework
(`core/registry/ontology.ts`) + **8 packs / 181 enriched objects, closed graph** (0
unresolved, 0 collisions): Credit Union (13), Lending & Deposits (30), Capital Markets &
Institutions (54), Innovation Ecosystem (16), Compliance (19), Regulation (15),
Technology/Vendor (24), AI (10). `scripts/ontology-check.mjs` runs the closed-graph check
(strict `tsc` clean over the ontology cone). **Sprint-1 ontology is complete** across the
ADR-0015 in-scope finance/VC/CU/fintech/innovation domains.

## Key reconciliation outcomes
- No code/migration churn from Vol adoption; all volume work is additive-forward.
- **Fact** = projection over verified-tier assertions + `Verification` (ADR-0005/0007
  intact); multi-source materialized fact store on the Volume III roadmap (ADR-0012).
- **Canonical Entity Model + entity resolution** (RFC-3002) is the top build bridge —
  incl. relaxing `entities.workspace_id` to nullable + plane/visibility.
- Kernel direction: unified event bus (RFC-2004) + cost/usage ledger (RFC-2008);
  portable cross-org identity (RFC-2002).
- Vocabulary reconciled onto canonical models (Fact→tier; Tenant→org/workspace/plane;
  RFC visibility→committed enum; Vol 7 UI "Workspace"→rename to avoid collision).

## Repos / backends
- GitHub: `JBTheDispatchCobj/Dispatch-OS` and `-Knowledge-Registry`, both `main`.
- Supabase: `0001`–`0017` **applied 2026-07-21** (truth/relationship/intelligence/profile/
  registry-ops + `0016` RLS + `0017` object-registry identity index; all 14 registry-table
  RLS policies live). The Object Registry live-persistence path is UNBLOCKED.

## Current priority
`0016` + `0017` are **applied** (2026-07-21) — no longer a blocker. Canonical Entity Model / Object Registry index
is built (`0017` + catalog + loader) and the live-persistence adapter (`core/registry/supabase-store.ts`) is
authored behind the seam. **Volume XI Canonical Ontology (roadmap Sprint 1)
is complete** — all 8 in-scope packs authored (Credit Union, Lending & Deposits, Capital
Markets & Institutions, Innovation Ecosystem, Compliance, Regulation, Technology/Vendor, AI;
181 objects, closed graph). **The Cooperative Markets cartridge (first product vertical) is
authored, seeded, and demoable**, and the **Auric executive-lens slice is proven**:
`cartridges/cooperative_markets/seed.ts` runs a full operating loop (5300 intake → agent flag
→ approved pilot), and `auric_lens.ts` + `auric_lens_demo.html` show one sourced insight
rendered base/CEO/CLO from identical `source_refs` (the CEO≠CLO thesis). All `tsc` clean.
Next thread, in order: (1) the **VC deal engine** (automated startup intake → score-against-
market → IC memo) — spec then build on the cartridge's diligence/investment workflows;
(2) wire a **live intake path** (call-report/startup ingestion) so the loop runs on real data,
not seed data; (3) apply `0016` + `0017` in Supabase, then the **Object Registry service**
(RFC-2003) and Identity & Tenancy (RFC-2002).
