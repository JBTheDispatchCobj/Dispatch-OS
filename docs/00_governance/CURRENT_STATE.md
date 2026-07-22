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

## Running now (Olympic Sprint II — Wave 2, ~44%, 2026-07-22)
**The Confidence Engine now DRIVES live profile assembly, and profiles are queryable.** Wave 2 turned the
profile layer from a fixed-confidence snapshot into a live, decaying, outcome-aware projection with a real
read surface — additive, new-files-only, pure/deterministic, no vertical nouns in `core/`:
- **`core/profile/freshness.ts`** — a per-truth-tier half-life POLICY (durable→volatile) that turns a fact's
  `observed_at`→`as_of` into the `ageDays`/`halfLifeDays` the engine's `decay` consumes; `assessFreshness`
  computes freshness as `decay(1, age, halfLife)` (the same curve, so freshness and post-decay confidence move
  together) and bands it fresh/aging/stale. Generic; injected instants only.
- **`core/profile/assemble_live.ts`** — an ADDITIVE wrapper over the unchanged `assembleProfile`: each field is
  outcome-adjusted (`reinforce` over observed `OutcomeEvent`s, in order) THEN aged (freshness decay inside
  `combineSources`). Returns a `LiveAssembledProfile` = the base profile + `as_of` + a per-field `field_freshness`
  read + an `outcome_adjustments` audit surface that persists the **outcome evidence source_refs** (lineage, not
  a silent nudge).
- **`core/profile/query.ts`** — a deterministic, generic **query surface** over assembled profiles: filter by
  subject_type / confidence / **tier floor** (via the truth-hierarchy rank) / completeness / health / **field
  predicate** (exists/eq/gte/gt/lte/lt; numeric OR numeric-string thresholds; blank-string-safe) / a combined
  confidence+freshness floor; rank by confidence/completeness/health/field_value/field_confidence with a
  **total-order id tiebreak** and **direction-aware sinking** of field-less profiles; `lookupField`. Every
  applied predicate is reported for explainability.
- **`cartridges/cooperative_markets/profiles_live.ts`** (+ `scripts/profile-query-demo.ts`) — wires it over REAL
  data: a live **regulation-environment profile** over the REAL 675-section 12 CFR corpus (coverage counts aged
  from the eCFR issue date) + **live institution profiles** over the 5300 batch (the five ratios aged from the
  reporting quarter-end; optional per-charter/-ratio outcomes) → `buildLiveProfiles` feeds `queryProfiles`. The
  institution figures remain LABELED FIXTURES (the real per-CU 5300 connector is still deferred); the regulatory
  corpus is REAL at scale; the live-assembly ENGINE is real either way.
Gate: **debug-loop ALL GREEN (10/10)** (new **PROFILES** step: live decay + outcome-feedback + query, deterministic)
+ `tsc` clean + `npm run build` exit 0 + **162 unit tests** (was 123; +39). Adversarially verified (4-lens fleet;
**0 blockers**; outcome-evidence lineage + 3 query edge cases + 3 test-teeth gaps fixed). Profile PERSISTENCE and
the matured entity-resolution pipeline remain (they land with the Supabase registry-client wave), so truth is at
40, short of the Sprint-II-end 45 by design.

## Running now (Olympic Sprint II — Wave 3, ~47%, 2026-07-22)
**The kernel has a request envelope + a contracts/API layer, and authorization routes through it.**
Wave 3 built the RFC-2001/2014 seam — additive, new-files in `core/`, plus call-site wiring at the
surfaces (the sanctioned `canReview` retirement); the engines are UNCHANGED:
- **`core/kernel/envelope.ts`** — a typed **RequestEnvelope** `{ principal, correlation_id, plane,
  occurred_at, request_id, idempotency_key? }` carried THROUGH a call so authorization has a principal
  and every event/cost the call emits correlates to the originating request. Pure/deterministic:
  `makeEnvelope` copies + freezes and mints NOTHING (the caller injects ids/timestamps); `deriveEnvelope`
  keeps the parent `correlation_id` for a child sub-step while taking a fresh injected `request_id`.
- **`core/kernel/contracts.ts`** — the **service contracts** a surface calls THROUGH. `authorizeThrough`
  is the one authorization call: a `service` principal bypasses (like RLS); the domain verbs
  (review/approve/promote/decide) map to the SAME `app_has_role` predicate the permission engine mirrors
  from the 0016/0017 policies, against a verb-specific role set (review = owner/admin/reviewer; approve =
  owner/admin; promote = owner/admin/operator); plain verbs (read/write/update/admin) pass straight to
  `authorize()`. `guard(env, action, resource, delegate)` is the authorize-FIRST combinator: on deny it
  returns a typed **Refusal** carrying the machine-readable engine `reason` (never a throw) and the
  delegate NEVER runs; on allow it runs the delegate exactly once. Generic — no vertical noun.
- **`core/auth/principal.ts`** — maps the demo `SessionUser` → a `Principal` (single membership in the
  acting workspace with the session's role) + a `sessionEnvelope`, so the surfaces authorize through the
  engine with NO backend. When real Supabase auth + membership lands, only this mapping changes.
- **`core/auth/session.ts::canReview`** — RETIRED as a source of truth to a thin back-compat shim whose
  boolean now COMES FROM the permission engine (`writeTenantDecision(..., REVIEW_ROLES)`), not an ad-hoc OR.
- **`app/contracts.ts` + `app/actions.ts` + `components/ReviewQueue.tsx`** — the human-gate server actions
  (review sign-off, decide/promote a proposal, decide an approval, review evidence) now route THROUGH the
  contract adapter (authorize-FIRST, then the existing `store` mutation). The demo session is a workspace
  owner, so every check ALLOWS and the surfaces behave exactly as before — but the plumbing is real and a
  non-authorized principal gets a typed refusal (proven by the tests + the debug step).
- **`cartridges/cooperative_markets/deal_service.ts`** — the **DealService** contract wraps the UNCHANGED
  `runDealPipeline`: authorize "promote" FIRST, then seed the RunContext from the envelope
  (`ctx.runId = env.correlation_id`) so the whole run correlates to the request. The human gates
  (ICApproval on the memo, EditorialDisposition on publication) are untouched.
Gate: **debug-loop ALL GREEN (11/11)** (new **CONTRACTS** step) + `tsc` clean + `npm run build` exit 0 +
**182 unit tests** (was 162; +20 across envelope/contracts). Adversarially verified (4-lens fleet:
correctness · doctrine · purity/determinism · test-teeth) — 0 blockers; 1 wiring gap fixed (evidence
review now actually routes through the contract) + 2 test-teeth gaps closed. Kernel 34→46, harness 18→22,
tests 49→51. Profile PERSISTENCE + the matured entity-resolution pipeline + the live Supabase registry
client remain (Wave 4 — moves kernel 46→55, truth 40→45).

## Running now (Olympic Sprint II — Wave 4, ~50%, Sprint II CLOSED, 2026-07-22)
**The Object Registry has a live-persistence client governed through a kernel contract, a matured
entity-resolution pipeline, and live profiles now PERSIST.** Wave 4 closes Sprint II — additive,
new-files-only in `core/`, pure/deterministic, no vertical nouns; the registry service + engines are
UNCHANGED and the default stays in-memory (gate green with no creds):
- **`core/registry/governed_registry.ts`** — `GovernedObjectRegistry` wraps the unchanged
  `ObjectRegistryService`. `registerThrough`/`mergeThrough` **authorize FIRST** via `guard` (the
  permission engine); a shared-market registry merge is **service-role-only** (registry objects are the
  shared-market identity index with no tenant, so `app_can_admin_object` grants NO authenticated user —
  the load-bearing 0017 §8 invariant). Each governed mutation emits an envelope-**correlated**
  `KernelEvent` + `CostEntry`, and durable flushes run on a **serialized write-chain** so a merge's flush
  never races the register that precedes it; `drain()` surfaces a flush failure without poisoning the chain.
- **`core/data/supabase-table-client.ts`** — the one new file importing `@supabase/supabase-js`: a real
  client adapted to the narrow `{upsert,selectAll}` seam the registry + profile adapters consume;
  env-gated (returns null with no `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY`, so the gate stays in-memory).
- **`core/registry/resolver.ts`** — matured entity resolution: **blocking keys** (identifying external id /
  exact slug / normalized name-alias tokens) + **deterministic similarity** (token Jaccard; the corporate
  designator stopwords are caller-injected config-as-data so `core/` names no vertical), still **PROPOSE-only**.
  Resolves the DEFERRED **NO-CLOBBER** note: a human-reviewed (`confirmed`/`rejected`) candidate is **sticky** and
  never re-proposed; only genuinely-new pairs are proposed.
- **`core/profile/persistence.ts`** — `ProfilePersistencePort` + `InMemoryProfileStore` (default) +
  `SupabaseProfileStore` (hybrid) + pure mappers. A `LiveAssembledProfile` persists **byte-identically** (the
  whole profile is a canonical-JSON **`text`** snapshot, so even a real Postgres backend returns exact bytes)
  and **plane-aware** (an explicit `ProfileScope` keeps a public shared-market profile and a private tenant
  profile un-conflated — the discriminator drives the 0018 RLS), surviving a process boundary with its
  confidence/freshness/lineage/outcome-audit intact. Migration **`0018_profile_snapshots.sql`** (additive,
  plane-aware RLS reusing 0016) lands the table; `profileStore()` stays in-memory unless a client is supplied.
Gate: **debug-loop ALL GREEN (12/12)** (new **REGISTRY-PERSISTENCE** step: governed authorize-first + service-only
merge + correlated event/cost + serialized flush · resolver blocking+similarity charter-less proposal + NO-CLOBBER ·
profile persist→hydrate byte-identical + plane-aware · deterministic) + `tsc` clean + `npm run build` exit 0 +
**214 unit tests** (was 182; +32). Adversarially verified (4-lens fleet + a focused re-verify) — **1 blocker fixed**
(profile persistence had dropped the plane/visibility/tenant discriminator → planes conflated + the plane-aware RLS a
dead letter; fixed by carrying the explicit plane-aware scope) + hardened (byte-identity vs real Postgres jsonb via the
text snapshot; flush no-lost-update incl. a same-id re-put; the write-chain no longer poisoned by a single flush failure;
test-teeth added). Layers: kernel 46→55, truth 40→45, tests 51→54, data 87→88; headline ~47% → **~50%** (honest
recompute; Sprint II's ~55% roadmap projection also assumed harness/Auric/connector/terminal deltas this wave did not
target — those move in Sprint III–IV, per roadmap caveat #4).

## Running now (Olympic Sprint III — Wave 1, ~54%, 2026-07-22)
**Sprint III opens (Connectors & scale, target ~68%). A connector is now an EXECUTABLE thing,
not a manifest on paper.** Wave 1 built the generic Connector Runtime + SDK (Kernel RFC-2011;
Volume IX) — additive, new-files-only, pure/deterministic, **no vertical noun in `core/`**; the
engines are UNCHANGED and the default stays in-memory + creds-free:
- **`core/kernel/connector_sdk.ts`** — the typed **Connector Output Contract** (normalized
  observations, entity/relationship candidates, captured source artifacts, `change_events`,
  `quality_report`, `connector_health`, run metrics), a pure **parser contract**, deterministic
  FNV content hashing, change detection (new/updated/deleted/unchanged), health-band derivation,
  and the **normalize→truth-`Observation` bridge** (`recordToObservation`) that takes tier / plane
  / visibility FROM THE SOURCE MANIFEST — never from connector code. "Normalization never creates
  Facts": a connector emits normalized records, not tiered conclusions.
- **`core/kernel/connector_runtime.ts`** — the generic executor. A run takes one `RequestEnvelope`
  and **AUTHORIZES FIRST** (a shared-market ingestion write is **service-role-only**, the same
  0017 invariant the registry uses; a non-service principal is refused, `acquire` never runs),
  then acquires with **retry → circuit-breaker** (deterministic attempt counts, no wall-clock
  sleeps), drives the connector's PURE parser to normalize, detects changes vs a prior state,
  scores quality, derives health, and emits an envelope-**correlated** `KernelEvent` + `CostEntry`.
  A connector fault is a `failed` output (offline health), never a throw; a fetch failure NEVER
  fabricates a deletion.
- **`core/registry/connectors.ts` + `core/registry/data/connectors.json`** — a config-as-data
  catalog (**39 sources + 39 connectors** across the SOURCE_CATALOG families — regulatory /
  securities / institution / vendor / news / network / intake) qualifying the DKR placeholders as
  DATA, plus a generic loader/validator with a **closed-graph** check (every connector's
  `source_key` resolves; no dup keys; valid type/status).
- **`cartridges/cooperative_markets/connectors/{ncua_5300_connector,ncua_regulations_connector}.ts`
  + `run_connectors.ts`** — two REAL connectors run THROUGH the runtime. The **NCUA 5300** connector
  normalizes the as-reported figures (no ratios — those stay a downstream `deterministic_calculation`)
  → the existing ratio calc + live assembly → **live institution profiles that PERSIST** through the
  Wave-4 profile seam, **plane-aware** (shared_market / public) and **reconciling to the connector
  source refs**. The **NCUA regulations** connector normalizes the **REAL 675-section 12 CFR corpus**
  at scale (genuinely real public-domain text, not fixtures).
Gate: **debug-loop ALL GREEN (13/13)** (new **CONNECTOR** step: catalog closed-graph · authorize-first ·
output-contract + correlated event/cost · change-detect new/updated/deleted/unchanged (incl. a
rejection is never a deletion) · failure→offline + circuit breaker · tier-from-source · 5300→persisted
profiles reconcile to source · REAL 675-section corpus) + `tsc` clean + `npm run build` exit 0 +
**246 unit tests** (was 214; +32). Adversarially verified (4-lens fleet: correctness · truth-doctrine/
no-core-vertical-leak · purity/determinism · test-teeth) — **1 blocker fixed** (a record acquired but
failing to NORMALIZE whose ref was in prior state was fabricated as a `deleted` change event — a
deletion invented from a failure; fixed by carrying seen-but-unparsed refs into change detection) +
**3 hardened** (a vertical-noun leak — `charter_number`/`cfr_ref`/`section` — removed from the core
rejection-labeler; the reconcile-to-source gate made non-vacuous; a tautological tier-from-source
assertion replaced with a differing-source proof). Layers: **connectors 20→45, kernel 55→60,
truth 45→47, cartridge 77→80, tests 54→57**; headline **~50% → ~54%** (honest re-baseline; the
Sprint-III-end ~68% needs 2–3 more waves — full-market/bulk 5300 at scale, startup-intake, and
qualifying the remaining placeholders).

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
