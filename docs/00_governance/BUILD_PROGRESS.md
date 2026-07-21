# Build Progress Tracker

**Current build completion: ~33%** &nbsp;·&nbsp; Last updated: 2026-07-21 (OLYMPIC SPRINT WAVE 3 — live data + kernel/truth services: real NCUA **regulatory** ingestion at scale (675 in-force 12 CFR sections + 10 pending amendments → sourced, bi-temporal `public_fact` truth objects), the **Profile Assembly Engine** (RFC-3012) over the confidence engine, the institution **5300 batch path** → assembled profiles (labeled fixture batch, real connector deferred), the **Object Registry service** (RFC-2003) + entity resolution behind the persistence seam (gated on 0016+0017), and a **`/market`** Terminal surface. Debug loop gained a **DATA-INTEGRITY** step (pinned source counts + independent ratio oracle + reconciliation). Gate: `npm run build` exit 0 (/market prerenders) + debug-loop ALL GREEN (6/6) + full-app `tsc` clean.)

> Note: this table tracks the **platform** build. Knowledge-content sprints (Volume XI
> Canonical Ontology and the roadmap's Truth Models / Rule / Workflow / Agent / Connector /
> KPI / Knowledge-Pack libraries) are tracked by `DISPATCH_OS_REMAINING_ROADMAP.md`'s own
> estimates, not this platform %, so encoding domain knowledge doesn't inflate the platform number.

This file tracks how much of the Dispatch OS **build** is done — implementation only
(design/specification work is excluded; the Specification Program Vols I–X is
essentially complete and is NOT counted here). **Every substantive session must update
this file** (see `CLAUDE.md` session-close protocol). Keep the methodology stable so the
number is comparable over time; when a layer's weight changes, note it in the changelog.

## Methodology
Weighted sum of implementation layers. `weight` = share of total build effort;
`built` = how complete that layer is today; `contribution = weight × built`. Total is
shaded down slightly because the schema that exists is not yet exercised by any running
service (types + in-memory store; no service/API/engine/UI layer yet).

| Layer | Weight | Built | Contribution |
|---|---:|---:|---:|
| Data contracts + schema (migrations `0001`–`0017`, `core/` types) | 15% | 82% | 12.3 |
| Kernel services (identity/permissions, event bus, object registry, cost ledger, contracts/API) | 20% | 20% | 4.0 |
| Truth/graph engines (resolver, confidence, entity resolution, assembly, query) | 15% | 17% | 2.55 |
| Agent Harness + Execution Engine (router, planner, runtime, evaluation) | 15% | 13% | 1.95 |
| Publication (Auric) engine | 8% | 20% | 1.6 |
| Connector implementations + ingestion | 7% | 19% | 1.33 |
| Cooperative Markets cartridge (first product) | 8% | 72% | 5.76 |
| Terminal (customer-facing product) | 7% | 30% | 2.1 |
| Tests / observability / productionization | 5% | 20% | 1.0 |
| **Total** | **100%** | — | **~33%** |

> Wave 1 turned the monster-batch libraries into a **running system**: the pipeline spine executes
> the whole vertical end-to-end on injected inputs, the event bus + cost ledger now emit/record on a
> live run, the harness router routes each stage (with a real human gate), and the Auric engine
> assembles + renders + ranks the published feed. The % now reflects code that exists + compiles +
> integrates + **RUNS end-to-end under the debug gate** — still library-grade (no persistence, no UI:
> Waves 2–3), not a hosted service.

## What "built" means per layer (so estimates stay honest)
- **Data contracts + schema** — 82%: the foundation (`0011`–`0016`: truth family,
  relationships, intelligence objects, profiles, registry-ops, RLS) plus `0017` (the
  canonical **object_registry** identity index + `entity_aliases` + `object_external_ids`
  + dedup `object_match_candidates` + append-only `object_merges`, and plane-aware
  `entities`) is live in Supabase. Still a fraction of the eventual schema (no event store,
  no cost ledger, no cartridge entities), but the identity substrate now exists.
- **Kernel services** — 3%: the object-registry *schema* + RLS helpers exist, but no
  object-registry *service*, identity/permission engine, event bus, cost ledger, or
  contracts/API layer. Only an in-memory config/cartridge registry runs.
- **Truth/graph engines** — 2%: assertion tables + the entity-resolution *substrate*
  (match-candidate queue, merge/split lineage) exist; no resolver/confidence/assembly/
  query engine and no automated resolution service populating candidates yet.
- **Harness + Execution Engine** — 1%: only deterministic `GenerationRule` (rung 1) + the
  proposal/approval gate; no router/planner/runtime/scheduler.
- **Publication engine** — 4%: IO/ContentVariant tables exist, and now a concrete, typed
  Auric lens fixture (`cartridges/cooperative_markets/auric_lens.ts`) + a rendered demo
  (`auric_lens_demo.html`) prove the CEO≠CLO mechanic end-to-end on one sourced insight
  (base + role variants sharing identical `source_refs`). Still no running intake/render/feed
  engine — the mechanic is demonstrated, not yet automated.
- **Connectors** — 3%: registry contract + discovery pipeline + ~5 real sources; ~93
  placeholder connectors unqualified; no connector runtime/SDK.
- **Cooperative Markets cartridge** — 45%: the product definition + seed + the P1–P3 deal
  engine. (1) The product *definition* —
  `cartridges/cooperative_markets/cartridge.ts` (registered, strict `tsc` clean): 10 vertical
  entities (9 + reserved vendor) mapped to canonical FS `schema_ref`s, 11 workflows on the
  discovery→…→investment ladder, rules + executable generationRules, evidence/approval rules,
  metrics (readiness/opportunity/innovation as sourced inferences), outcomes, agent
  instructions, reports, dashboards, knowledge. (2) A runnable operating-loop **seed**
  (`seed.ts` — a CU, a fintech, a CUSO, CEO/CLO executives, a 5300 intake → agent flag → match
  proposal → approved pilot with checklist/evidence/decision/approval → metrics/outcomes/
  dashboard) so it's demoable in the app. (3) **VC Deal Engine P1** (`deal_engine.ts`) — a
  vehicle-agnostic, deterministic scoring engine (Innovation / Startup Readiness / Institution
  Readiness / Dispatch Readiness / Opportunity), every score a sourced inference with per-factor
  lineage, the recommendation compliance-gated + human-gated downstream (`scripts/
  deal-engine-demo.ts`: ADVANCE at opportunity 77.9 / 21 sourced facts; BLOCKED at compliance
  0.3 even with opportunity 95). (4) **VC Deal Engine P2** (`ic_memo.ts`) — the IC-memo
  assembler: consumes the P1 scorecard + diligence findings and emits an
  `investment_committee_memo` **from approved evidence only** (unapproved evidence is excluded +
  listed), DD-coverage-gated over a required category set, role-lensed (CEO/CRO/CFO), with the
  recommendation a `draft` proposal (`scripts/ic-memo-demo.ts`: RECOMMEND-WITH-CONDITIONS,
  5/5 DD covered, 1 unapproved item excluded; BLOCKED on a compliance DD blocker). (5) **VC
  Deal Engine P3** (`allocation.ts`) — routes an approved deal to CU + LP subscribers through
  eligibility gates (sanctions/OFAC, KYC/KYB, LP accreditation), pro-rata to capacity, emitting
  `capital_markets:participation`/`:syndication` allocations (each citing its gating facts) +
  the `deal_flow_access` outcome; allocation is a proposal, settlement is P4
  (`scripts/allocation-demo.ts`: $1.75M of $2M allocated across 2 subscribers, 1 non-accredited
  LP rejected). Not higher because no live ingestion feeds it, no engine *executes* the
  workflows end-to-end, and no Terminal UI renders them — engine + fixtures, not a live running
  product.
- **Terminal** — 30%: two real Next.js product surfaces over live pipeline/ingestion output —
  `/terminal` (Wave 2: the deal run, harness rail, scorecards, CEO/CRO/CFO lens toggle, IC memo,
  allocation, settlement, kernel spine) and `/market` (Wave 3: the institution-profile list over the
  5300 batch + the real NCUA regulatory environment + Object-Registry status). Not higher because the
  Terminal runtime (window/layout, command palette, universal search, notification/task centers — Vol
  VII) is still Sprint IV, and both surfaces read computed output, not persisted state.
- **Tests/observability/productionization** — 8%: `scripts/debug-loop.mjs` — a repeatable
  debug harness (there is no UI yet, so this is the review surface): full-app typecheck +
  ontology closed-graph + cartridge canonical-map integrity + an **engine smoke that transpiles
  and EXECUTES** P1/P2/P3 asserting the core invariants (advance/block, approved-evidence-only,
  subscriber gates). Single PASS/FAIL, non-zero exit on any failure — run → fix → re-run. Still
  no CI wiring or unit-test framework.

## Next bricks (each moves the number)
1. Apply `0016` **and** `0017` in Supabase (data layer → live enforcement; tenant isolation
   + canonical identity index go live only after apply).
2. Object Registry **service** (RFC-2003) + resolution: populate `object_match_candidates`
   from blocking keys + scoring; apply merges via `object_merges` (kernel + truth engines).
3. Identity & Tenancy (RFC-2002) + permission engine (kernel services).
4. Cooperative Markets cartridge package + 9 entities + call-report ingestion (first product) —
   now seedable from the Financial Services object catalog (`core/registry/data/`).

## Changelog
- 2026-07-21 — **OLYMPIC SPRINT WAVE 3 — live data + kernel/truth services (the vertical runs on REAL data at scale).**
  Fanned out 5 workstream agents (new files only), integrated + gated by the lead; 3-lens adversarial
  verification before commit. **Reality-check that shaped the wave:** the data staged in
  `docs/04_sources/ncua/` is real NCUA **regulatory** text (675 in-force 12 CFR sections + 10 pending
  amendments + the FCU Act), **not** institution-level 5300 financials — so "live NCUA data at scale" was
  executed honestly against what is real. New:
  (1) **`cartridges/cooperative_markets/ingest_regulations.ts`** (+ `ingest_regulations_data.ts` loader split) —
  pure/deterministic batch ingestion of the REAL corpus into sourced truth objects: in-force sections →
  `Observation`/`public_fact`/`valid_from`=issue date; pending amendments **with full text** → future-dated
  `Observation` (bi-temporal, flagged not-yet-in-force); amendatory **instructions** (no rewrite) → `Claim`
  **held pending human/deterministic merge** (never auto-applied to legal text).
  (2) **`core/profile/assemble.ts`** — the Profile Assembly Engine (RFC-3012): generic, pure, core (no vertical
  nouns); rolls sourced fields up through `combineSources` (confidence engine) into a profile with
  confidence / top_tier / lineage / completeness / a data-quality health band.
  (3) **`cartridges/cooperative_markets/{ingest_batch,batch_fixtures}.ts`** — the 5300 batch path → call-report
  facts (`deterministic_calculation`, each citing its filing) + an assembled institution profile each, over a
  clearly-labeled 7-CU illustrative fixture batch (real per-CU 5300 connector deferred, Bryan-only).
  (4) **`core/registry/service.ts`** — the Object Registry service (RFC-2003): entity resolution (blocking keys →
  scored match candidates → append-only merge lineage) behind a `RegistryPersistencePort` seam with an in-memory
  adapter; duplicates are **proposed, never auto-merged**. Live persistence + shared-market resolution gated on
  Bryan applying `0016`+`0017`.
  (5) **`app/market/page.tsx` + `components/terminal/MarketView.tsx`** — a second real Terminal surface at
  **`/market`**: the institution-profile list (over the batch) + the real regulatory environment (part counts,
  pending amendments, held instructions) + the Object-Registry status. One lead-owned nav link.
  **Debug gate:** extended `scripts/debug-loop.mjs` with a **DATA-INTEGRITY** step — pins the source shape
  (675/10), asserts unique truth-object ids, bi-temporal correctness, an **independent ratio oracle** (raw figures
  worked out longhand vs the profile), profile→source reconciliation, and registry propose/merge invariants; plus
  determinism re-runs. Validation: **`node scripts/debug-loop.mjs` ALL GREEN (6/6)**, full-app **`tsc` clean**,
  **`npm run build` exit 0** (`/market` prerenders static). Layers: kernel **14→20** (registry service behind seam,
  gated), truth **9→17** (profile assembly on the confidence engine), connectors **10→19** (real regulatory
  ingestion at scale + batch path), cartridge **66→72**, terminal **22→30** (`/market`), tests **14→20**
  (data-integrity gate); headline **~28% → ~33%**. Additive (only the root nav link + the debug loop edited);
  no core/pipeline churn; vehicle-agnostic; no regulated conclusion in weights. Next: Wave 4 (Auric distribution +
  tests/CI/observability).
- 2026-07-21 — **OLYMPIC SPRINT WAVE 2 — the real Terminal UI (something to click).**
  New: `app/terminal/page.tsx` (server — runs `runDealPipeline` on the Halcyon × Summit golden
  fixture, precomputes the per-role feeds, shapes a serializable view-model) +
  `components/terminal/TerminalView.tsx` (client — the product surface). It renders the live run:
  a **run header** (status badge + the human-approval line), the **harness stage rail** (rung per
  stage, the IC-memo human gate visibly flagged), the **institution scorecard** (5300 facts) and
  **deal scorecard** (P1 score bars), the **opportunity feed** with a working **CEO/CRO/CFO
  executive-lens toggle** over `buildFeed` output + the role-lensed memo summary, the **IC memo**
  (P2 — coverage/citations/excluded/risks/conditions), **allocation** (P3 — capacity bar +
  allocations + gated rejections), **settlement/monitoring** (P4 — committed/called/distributed +
  the published IO tier `human_approved_conclusion`), and the **kernel spine** (9 correlated events
  + cost by category). Reuses the app design tokens; self-contained VM types so no server module
  enters the client bundle; a one-line `Terminal` nav link added to the root layout (lead-owned).
  Validation: **`npm run build` exit 0** (`/terminal` prerenders static) + full-app **`tsc` clean**
  + **debug-loop ALL GREEN (5/5)**; screenshot captured of the rendered Halcyon × Summit run with a
  working lens toggle and nothing regulated shown without lineage. Layers: Terminal **2→22%**,
  cartridge **62→66%**; headline **~26% → ~28%**. Additive (only the root nav link edited); no
  core/pipeline churn. Next: Wave 3 (live NCUA data + kernel/truth services).
- 2026-07-21 — **OLYMPIC SPRINT WAVE 1 — orchestration spine (the parts become a system).**
  New: `cartridges/cooperative_markets/pipeline.ts` — `runDealPipeline(input, ctx)` chains
  **ingest(5300) → score (P1) → IC memo (P2) → allocate (P3) → settle (P4) → assembleIO →
  renderVariants → buildFeed** into one typed, deterministic `DealRun`. Each stage is **routed
  through the harness** (`core/harness/router`: deterministic stages land on rung 1; the IC memo is
  a regulated conclusion → human gate), **emits a correlated `KernelEvent`** (RFC-2004, correlation
  = run id) and **records a `CostEntry`** (RFC-2008: model/human/tool/connector). Plus
  `pipeline_fixtures.ts` (Halcyon × Summit golden + unapproved + blocked fixtures), `scripts/
  pipeline-demo.ts` (runnable end-to-end demo — `node scripts/pipeline-demo.ts`), and `scripts/
  alias-hook.mjs` (a runtime `@/*` resolver so the demo/gate run on plain Node type-stripping).
  **Real human gate (load-bearing, ADR-0005):** a regulated conclusion may not allocate/settle/
  publish until a caller-supplied `ICApproval` disposes the memo `approved` — otherwise the run halts
  `awaiting_approval` and publishes nothing; on approval the IO is lifted to `human_approved_conclusion`
  and the decision_ref enters the evidence set. **Truth discipline:** IO evidence refs partitioned by
  tier (fact/claim/inference); variants restate the IO's refs exactly (no superset). The debug loop
  gained a **PIPELINE step** asserting determinism (byte-identical re-run), the full kernel spine, the
  human gate has teeth (unapproved → no downstream), and the blocked halt. Validation: **`node
  scripts/debug-loop.mjs` ALL GREEN (5/5)** + full-app **`tsc --noEmit` exit 0**; golden run settles
  with 9 correlated events, $2.77 ledgered incl. the human-review gate. **Verified by a 4-lens
  adversarial agent fleet** (one blocker — a decorative gate — found and fixed before commit).
  Layers off the monster-batch baseline: kernel 10→14%, truth 8→9%, harness 7→13%, Auric 14→20%,
  connectors 8→10%, cartridge 52→62%, tests 8→14%; headline **~22% → ~26%**. Additive; vehicle-
  agnostic; no core vertical leak.
- 2026-07-20 — **MONSTER BATCH: 7 subsystem modules (parallel agent fleet) + Terminal + sprint plan.**
  Fanned out 6 agents; all landed integration-clean (**consolidated strict `tsc` over 25 files →
  exit 0**). New: `core/kernel/event_bus.ts` (RFC-2004 — plane-aware correlated events, DLQ,
  replay) + `core/kernel/cost_ledger.ts` (RFC-2008 — cost/usage by category + correlation);
  `core/truth/confidence.ts` (RFC-3008 — decay/propagate/reinforce + tier-aware `combineSources`);
  `core/harness/router.ts` (Art. 18 9-rung ladder + classify/route with the human gate forced on
  regulated conclusions + tool router); `core/auric/engine.ts` (Vol VI — assembleIO / renderVariant
  [enforces variant source_refs = IO refs] / buildFeed); `cartridges/cooperative_markets/
  settlement.ts` (P4 — pluggable `SettlementVehicle`; advisory/syndication ship, fund/spv pending
  the vehicle decision); `cartridges/cooperative_markets/ingest_call_report.ts` (5300 → sourced
  facts + `InstitutionReadinessInput`, the live-intake seam). Plus `terminal_demo.html` (a real
  product surface: institution scorecard + CEO/CLO lens toggle + P1 scorecard + P2 memo + P3
  allocation, all computed numbers) and `docs/00_governance/SPRINT_PLAN.md` +
  `SPRINT_KICKOFF_PROMPT.md` (the Olympic sprint + paste-ready first prompt). Layers off zero:
  kernel 3→10%, truth 2→8%, harness 1→7%, Auric 4→14%, connectors 3→8%, cartridge 45→52%,
  terminal 0→2%; headline **~18% → ~22%**. Additive; vehicle-agnostic; not yet wired into a
  running pipeline (that's Sprint Wave 1).
- 2026-07-20 — **VC Deal Engine P3 (allocation + subscriber tiers) + debug-loop harness.**
  (1) `cartridges/cooperative_markets/allocation.ts` — routes an approved deal to the two paying
  subscriber classes (CUs/FIs + LPs) through eligibility gates (sanctions/OFAC, KYC/KYB, LP
  accreditation), pro-rata to capacity, emitting `capital_markets:participation`/`:syndication`
  allocation objects (each citing its gating facts) + the `cooperative_markets:deal_flow_access`
  outcome. Allocation is a **proposal**; settlement is P4 (vehicle-agnostic). No allocation to an
  ungated subscriber; every rejection carries explicit reasons. (2) **`scripts/debug-loop.mjs`** —
  a repeatable debug harness (there's no UI, so this is the review surface): full-app typecheck +
  ontology closed-graph + cartridge canonical-map integrity + an **engine smoke that transpiles
  and executes** P1/P2/P3 asserting the invariants; single PASS/FAIL + non-zero exit.
  Validation: consolidated strict `tsc` over **all 18 session files** → exit 0; the P1→P2→P3
  chain executed → ADVANCE → RECOMMEND-WITH-CONDITIONS → **2 allocated / 1 rejected**
  ($1.75M of $2M; non-accredited LP rejected `not_accredited`), deterministic, unapproved
  evidence never cited; harness ONTOLOGY (181/0/0) + CARTRIDGE (10 refs) green. Cartridge
  **40→45%**, tests **1→8%**; headline **~17% → ~18%**. Additive; vehicle-agnostic.
- 2026-07-20 — **VC Deal Engine P2 built — diligence + IC memo.**
  `cartridges/cooperative_markets/ic_memo.ts` — a pure, deterministic assembler that consumes the
  P1 `DealScorecard` + `DiligenceFinding[]` and emits the canonical
  `financial_services:innovation_ecosystem:investment_committee_memo`. Truth discipline enforced
  in code: **approved evidence only** (a finding is admissible only if it cites ≥1 approved
  evidence item; unapproved evidence is excluded and surfaced in `excluded_unapproved`),
  **DD-coverage gating** over a required category set (compliance_fit/regulatory/financial/
  technology/cybersecurity), a **compliance/DD blocker gate**, and a recommendation that is a
  `draft` **proposal** (`recommend` / `recommend_with_conditions` / `hold` / `pass` / `blocked`)
  — the committee decision stays a separate human gate. Role **lenses** (CEO/CRO/CFO) restate the
  same cited facts per reader. `scripts/ic-memo-demo.ts` runs it. Validation: strict `tsc --noEmit`
  exit 0; transpiled + executed → **RECOMMEND-WITH-CONDITIONS** (regulatory concern → closing
  condition), **5/5** required DD covered, **1 unapproved item excluded** (`ev:coi`), 6 approved
  citations, **deterministic**; blocker path → **BLOCKED**. Cartridge **35→40%**; headline
  **~16% → ~17%**. Additive; no core churn; vehicle-agnostic.
- 2026-07-20 — **VC Deal Engine P1 built — intake + scoring (vehicle-agnostic).**
  `cartridges/cooperative_markets/deal_engine.ts` — a pure, deterministic scoring engine
  (Constitution routing ladder rung 1). Five scores — Innovation, Startup Readiness, Institution
  Readiness, **Dispatch Readiness** (new), and Opportunity (geometric mean of strategic×
  regulatory×timing) — each a **sourced inference**: every factor carries a `source_ref` +
  `confidence`, and every `Score` exposes its full `lineage` and `tier: dispatch_inference`.
  The screening recommendation (`advance`/`hold`/`decline`/`blocked`) is a **proposal**, with a
  hard **compliance gate** (a company below the compliance-readiness threshold is `blocked`
  regardless of opportunity). `scripts/deal-engine-demo.ts` runs the Halcyon Pay × Summit Ridge
  scenario end-to-end. Validation: strict `tsc --noEmit` exit 0; transpiled + executed →
  Opportunity **77.9** (matches the seed/lens's illustrative ~78), recommendation **ADVANCE**,
  21 distinct sourced facts, **deterministic** (identical output on re-run); compliance-gate path
  → **BLOCKED** at compliance 0.3 even with opportunity 95. Cartridge **30→35%**; headline
  **~15% → ~16%**. Additive; no core/migration churn; vehicle-agnostic (no fund/SPV dependency).
- 2026-07-20 — **VC Deal Engine spec (ADR-0016 + `docs/03_subsystems/VC_DEAL_ENGINE_SPEC.md`).**
  Spec-before-build for the Cooperative Markets monetization arm: automated startup intake →
  score-against-target-market → diligence → IC memo → committee decision → syndication/allocation
  → monitoring. Decisions recorded (ADR-0016): **vehicle-agnostic, advisory/syndication-first**
  (fund/SPV are pluggable settlement adapters; vehicle TBD), **subscribers = CUs/FIs + LPs**,
  truth discipline load-bearing (scores are sourced inferences, IC memo from approved evidence,
  recommendation is a committee-approved proposal). Grounded in Bryan's Institutional
  Intelligence Library (FinTech Evaluation Framework, Startup Profile, the Innovation/Startup/
  Institution/Dispatch readiness triad, the Deal Pipeline, IC + Due-Diligence objects, the Auric
  Network deal flow). Maps entirely onto the existing ontology + cartridge — additive, no core/
  migration churn. **Platform headline holds at ~15%** (design/spec is excluded from the build %
  per this file's methodology); the build starts with P1 (intake + scoring) next.
- 2026-07-20 — **Cooperative Markets seed + Auric executive-lens slice (CEO≠CLO proof).**
  (1) `cartridges/cooperative_markets/seed.ts` — a full operating-loop demo fixture (Summit
  Ridge FCU × Halcyon Pay): a 5300 call-report intake → dry-run agent flag → match proposal →
  human-approved scoped pilot (checklist, evidence, decision, approval) → metrics/outcomes/
  dashboard. Wired into the cartridge's `seed`. Validated against the REAL core record types
  via a faithful `SeedBundle` shim → strict `tsc` clean. (2) `cartridges/cooperative_markets/
  auric_lens.ts` — the publication slice: one public `IntelligenceObject` assembled from sourced
  truth refs, one `Relationship` on the ladder, and three `ContentVariant`s (base + CEO + CLO)
  that share **identical `source_refs`** — same facts, different hook. `tsc` clean against
  core/intelligence + core/relationships types. (3) `auric_lens_demo.html` — a self-contained
  rendered demo (The Auric styling) showing the insight + shared evidence strip + the three
  lenses side by side, for the Alloya GTM conversation. Cartridge **20→30%**, publication (Auric)
  **1→4%**; headline **~14% → ~15%**. Additive only; truth discipline held (scores are sourced
  inferences, variants restate facts and never invent them, the pilot exists via an approved
  decision recorded separately from completion).
- 2026-07-20 — **Cooperative Markets cartridge authored (first product vertical).**
  `cartridges/cooperative_markets/cartridge.ts` — a full config-as-data `PackagedConfiguration`
  installed on the `financial_services` taxonomy base and the Volume XI ontology. **10 vertical
  entities** (credit_union, call_report, executive, innovation_company, cuso, fund, investment,
  regulation, product + reserved vendor), each mapped to a canonical FS `schema_ref` so
  lifecycle/KPIs/relationships come from the ontology, not a fork. **11 workflows** on the
  discovery→evaluation→pilot→integration→partnership→investment→monitoring ladder + call-report
  ingestion + regulatory-impact review; 6 interpretation rules + 3 executable `generationRules`;
  evidence/approval rules; 6 metrics (institution/company readiness, innovation & opportunity
  scores as **sourced Dispatch inferences**, portfolio IRR, pipeline velocity); 4 outcomes;
  3 agent instructions (report drafts IC memos from **approved evidence only**, lensed by
  executive role); 5 reports; 3 dashboards; 3 knowledge objects (thesis, CEO≠CLO lenses, scoring
  methodology). Registered in `cartridges/index.ts`; strict `tsc --noEmit` clean over the config
  cone; all internal references (workflow kinds, checklist keys, metric keys) resolve. Cartridge
  layer **0→20%**; headline **~13% → ~14%**. Additive only. Truth discipline held: scores are
  calculations over sourced facts, recommendations are human-approved proposals with lineage —
  nothing regulated in weights.
- 2026-07-20 — **Volume XI ontology Sprint 1 COMPLETE (+4 packs, 68 objects).** Authored
  the four remaining finance-native packs on the existing `core/registry/ontology.ts`
  schema: `ontology/compliance.json` (**19** — KYC/KYB/CDD/EDD, AML/OFAC/SAR/CTR,
  TILA/RESPA/TRID/HMDA/CRA/GLBA/UDAAP, privacy/consent/audit/compliance_review; bsa stays
  in the CU anchor pack), `ontology/regulation.json` (**15** — FDIC/Federal Reserve/OCC/CFPB/
  SEC/FINRA, FHA/VA/USDA/FHFA + Fannie/Freddie/Ginnie GSEs, state regulators, consent_orders;
  ncua/call_reports/examinations stay in the CU pack), `ontology/technology_vendor.json`
  (**24** — core/LOS/CRM/ERP/accounting/warehouse/IdP, API/connector/webhook/marketplace/SDK/
  ai_model, and the vendor lifecycle vendor/partner/MSA/SLA/contract/implementation/renewal/
  support_ticket/api/connector/risk_assessment), and `ontology/ai.json` (**10** — agent/prompt/
  model/reasoning_session/execution/tool/memory/knowledge_pack/capability/workflow, encoding
  the routing ladder + propose→approve→execute→evidence gate; no regulated conclusion in
  weights alone). Ontology now enriches **181 objects across 8 packs**; closed graph **0
  unresolved** (256 distinct referenced objects), **0 cross-pack collisions**, strict `tsc
  --noEmit` clean over the ontology cone. All Sprint-1 in-scope domains (ADR-0015) are now
  authored. Knowledge encoding (roadmap Sprint 1), tracked in the roadmap's own %; platform
  headline holds at ~13%.
- 2026-07-20 — **Volume XI ontology packs +3 (Sprint 1 continued).** Authored three
  finance-native packs on the existing `core/registry/ontology.ts` schema:
  `ontology/lending_deposits.json` (**30** objects — full lending-products +
  deposit-products breadth beyond the CU anchor), `ontology/capital_markets.json`
  (**54** — VC/PE/private-credit/investment-merchant banks, fintech/neobank/broker-dealer/
  RIA, funds/SPVs, capital-markets instruments + events, investments family, investor
  people), `ontology/innovation_ecosystem.json` (**16** — the CU↔innovation-company
  graph: startup/founder/pilot/partnership/thesis, with the discovery→…→investment
  relationship ladder on `partnership`). Ontology now enriches **113 objects across 4
  packs**; closed graph **0 unresolved** (176 distinct referenced objects), strict `tsc
  --noEmit` clean. Added `scripts/ontology-check.mjs` (repeatable closed-graph check).
  **Hospitality descoped** as a vertical (ADR-0015). Knowledge encoding (roadmap Sprint 1),
  tracked in the roadmap's own %; platform headline holds at ~13%.
- 2026-07-20 — **Volume XI Canonical Ontology framework** started (ADR-0014).
  `core/registry/ontology.ts` enriches Object Registry classes (by `schema_ref`) with
  relationships / lifecycle / KPIs / required documents / connectors; first pack
  `core/registry/data/ontology/credit_union.json` authored in full for the credit-union core
  (**13 objects**, closed graph — 0 unresolved references, `tsc` clean). Knowledge encoding
  (roadmap Sprint 1), tracked in the roadmap's own %; platform headline holds at ~13%.
- 2026-07-20 — **Object Registry loader wired.** `core/registry/objects.ts` projects the FS
  catalog into `EntityType[]` + `ObjectRegistryEntry[]`; `cartridges/financial_services/`
  installs all **341 classes as live entity_types** (registered via `cartridges/index.ts`).
  Strict `tsc --noEmit` clean; runtime smoke test confirms 341 unique entity_types install.
  Vertical cartridges (cooperative_markets) can now inherit them. First running code over the
  catalog — headline holds at ~13% (no engine consumes the types at scale yet).
- 2026-07-20 — **Financial Services Object Registry** landed as config-as-data:
  `core/registry/data/financial_services_objects.json` (20 families, 341 object classes, 39
  universal fields; DKR `ObjectRegistryEntry` shape, keyed to `0017`'s `object_class`) +
  human-readable projection `docs/03_subsystems/FINANCIAL_SERVICES_OBJECT_REGISTRY.md`.
  Domain taxonomy only (no loader wired yet), so the headline holds at ~13%.
- 2026-07-20 — `0017` Object Registry identity index + entity resolution **written and
  validated** (full `0001`–`0017` chain applies cleanly on Postgres 16 with an `auth.uid()`
  stub; backfill registers + links existing entities; reverse-pair and self-pair dedup
  constraints and merge lineage tested). Pending Supabase apply. Nudged data-contracts
  80→82%, kernel 2→3%, truth 1→2%: **~12% → ~13%**.
- 2026-07-20 — Baseline established at **~12%** after the full Vols I–X reconciliation
  (ADRs 0009–0013) + `0016` RLS written. Foundation schema live; engines/services/UI unbuilt.
