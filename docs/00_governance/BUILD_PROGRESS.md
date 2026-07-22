# Build Progress Tracker

**Current build completion: ~58%** &nbsp;·&nbsp; Last updated: 2026-07-22 (OLYMPIC SPRINT III — WAVE 3 · **Two more real connectors (FDIC BankFind + Federal Register) + connector candidates → the Object Registry (propose-only) + catalog 57→73**: two REAL connectors normalize public metadata through the UNCHANGED runtime → tiered `public_fact` FROM THE SOURCE MANIFEST (FDIC banks classed `financial_institution`, never a credit union; FR rules/notices classed `regulation`; differing-source proofs, real reject paths); the SECOND live surface — normalized connector `entity_candidates` bridged through a GENERIC core seam (`core/registry/candidate_bridge.ts`, no vertical noun; plane/visibility FROM the source scope) into the Object Registry, where the matured resolver PROPOSES cross-source duplicates (a company in a public SEC filing × a private startup submission, differing legal names) for HUMAN review and NEVER auto-merges; config-as-data catalog qualified 57→73 toward the ~93 (closed graph, one-connector-per-source). Additive, new-files-only; connector runtime UNCHANGED; default in-memory + creds-free. Gate: debug-loop **ALL GREEN (13/13)** + `tsc` clean + `npm run build` exit 0 + **290 unit tests (+18)**. Adversarially verified (4-lens fleet + focused re-verify) — **1 MAJOR fixed** (a previously-SEEN record that failed validation on a valid key with a blank secondary field was fabricated as a DELETION across ALL real connectors — the load-bearing "a rejection is NEVER a deletion" rule; fixed by recovering the change-key on rejection so the `alsoPresentRefs` guard protects it, with regression tests that have TEETH on all three throw-path connectors) + **1 minor** (a vacuous reconciliation flag given store-round-trip teeth) + test-teeth hardening (object_class asserted against literals not a self-comparison; plane/visibility-from-source proven with EDGAR `public` vs intake `network`). Layers: **connectors 57→64, truth 52→55, harness 26→28, kernel 60→61, cartridge 85→86, tests 60→63**; headline **~56% → ~58%** (HONEST re-baseline per roadmap caveat #4: the Sprint-III-end ~68% still needs the REAL bulk 5300 feed — Bryan-only, NOT landed, so the full-market 5300 stays LABELED synthetic — plus full catalog qualification 73→~93 and a Terminal surface). PREVIOUS — OLYMPIC SPRINT III — WAVE 2 · **Full-market ingestion at scale + startup-intake → deal engine + catalog growth (config-as-data)**: the WHOLE credit-union market — a clearly-LABELED synthetic bulk market (real per-CU 5300 is Bryan-only) — runs through the UNCHANGED NCUA 5300 connector/runtime → institution profiles PERSISTED at scale, plane-aware, reconciling to source (ratios stay a downstream `deterministic_calculation`, never a weight); `batch_fixtures.ts` retired behind the connector as the golden subset. The DEFERRED live-intake path is CLOSED: a new startup-intake connector normalizes submissions (`third_party_claim` from the source manifest — a company's own claim, never a fact/score) through the runtime → sourced readiness inputs → the EXISTING deal engine P1/P2 (advance/block/hold exercised), human gates (ICApproval + EditorialDisposition) UNTOUCHED. A THIRD real connector (SEC EDGAR) normalizes filing headers → `public_fact` (tier proven with a DIFFERING source). Config-as-data catalog qualified 39→57 connectors/sources toward the ~93 (closed graph, one-connector-per-source). New CONNECTOR sub-assertions (full-market scale · intake→engine · SEC EDGAR tier-from-source · catalog growth · label-guard negative control) + 26 tests (272). Adversarially verified (4-lens): 1 major fixed (the SEC EDGAR rejection test exercised a hand-rolled stub, not the real connector — `parseEdgarFiling` given a real validation reject path + the test driven through the real connector) + 1 minor (`marketProvenance.all_labeled` computed from data + a negative control, so the synthetic-label invariant has teeth). Additive, new-files-only; **no vertical noun in `core/`**; the connector runtime UNCHANGED; default in-memory + creds-free. Layers truth 47→52, harness 22→26, connectors 45→57, cartridge 80→85, tests 57→60; **~54%→~56%** (HONEST re-baseline per roadmap caveat #4: the SCALE + intake mechanisms are proven, but the 5300 figures are labeled SYNTHETIC and the catalog is 57/~93, so the Sprint-III-end ~68% still needs the real bulk feed + full catalog qualification + more). PREVIOUS — OLYMPIC SPRINT III — WAVE 1 · **Connector Runtime + SDK (RFC-2011) OPENS Sprint III**: a generic connector runtime executes a ConnectorSpec — authorize-first (shared-market service-only), acquire+retry+circuit-breaker, PURE-parser normalize, change detection, quality/health, envelope-correlated KernelEvent+CostEntry; config-as-data catalog of 39 sources/connectors + a closed-graph loader; two REAL connectors run through it (NCUA 5300 → persisted plane-aware live profiles reconciling to source; the REAL 675-section 12 CFR corpus at scale). Connectors NORMALIZE only; tier/plane from the source manifest. New CONNECTOR debug step (13) + 35 tests (246). Adversarially verified: 1 blocker fixed (a normalization failure was fabricated as a deletion) + 3 hardened. Layers connectors 20→45, kernel 55→60, truth 45→47, cartridge 77→80, tests 54→57; ~50%→~54% (honest; Sprint-III-end ~68% needs 2–3 more waves). PREVIOUS — OLYMPIC SPRINT II — WAVE 4 · **Sprint II CLOSED**: **Object Registry live-persistence client + matured entity resolution + profile PERSISTENCE (Kernel RFC-2003 × Truth RFC-3012).** Wired the registry Supabase adapter onto a REAL `@supabase/supabase-js` client behind the EXISTING `RegistryPersistencePort` seam, and routed a governed write/merge THROUGH a kernel contract: new `core/registry/governed_registry.ts` (`GovernedObjectRegistry` — authorize-FIRST via `guard`; a shared-market registry merge is **service-role-only** because registry objects are the shared-market identity index with no tenant; each mutation emits an envelope-**correlated** KernelEvent + CostEntry; a **serialized write-chain** so a merge's durable flush never races the register that precedes it — `drain()` surfaces a flush failure without poisoning the chain), `core/data/supabase-table-client.ts` (the ONE new file importing the driver — a real client adapted to the narrow `{upsert,selectAll}` seam, env-gated to null so the gate is green with no creds). Matured entity resolution `core/registry/resolver.ts` GROWS the resolver beyond shared-external-id with **blocking keys** (external id / slug / normalized name-alias tokens) + **deterministic similarity** (token Jaccard, caller-injected designator stopwords so core/ names no vertical), still **PROPOSE-only**, and resolves the DEFERRED **NO-CLOBBER** note: a human-reviewed (confirmed/rejected) candidate is **sticky** and never re-proposed. Profile PERSISTENCE `core/profile/persistence.ts` (`ProfilePersistencePort` + `InMemoryProfileStore` default + `SupabaseProfileStore` hybrid + pure mappers) persists a `LiveAssembledProfile` **byte-identically** (canonical-JSON `text` snapshot so even a real Postgres backend returns exact bytes) and **plane-aware** (an explicit `ProfileScope` keeps a public shared-market profile and a private tenant profile un-conflated) with confidence/freshness/lineage intact across a process boundary; migration **`0018_profile_snapshots.sql`** (additive, plane-aware RLS reusing 0016). The registry service + engines are UNCHANGED (additive, new-files-only in `core/`); default stays in-memory. Gate: debug-loop **ALL GREEN (12/12)** (new **REGISTRY-PERSISTENCE** step: governed authorize-first + service-only merge + correlated event/cost + serialized flush · resolver blocking+similarity charter-less proposal + NO-CLOBBER · profile persist→hydrate byte-identical + plane-aware · deterministic) + `tsc` clean + `npm run build` exit 0 + **214 unit tests** (was 182; +32 across resolver/governed/persistence/table-client). Adversarially verified (4-lens fleet + a focused fresh-eyes re-verify) — **1 blocker fixed** (profile persistence dropped the plane/visibility/tenant discriminator → planes conflated + the plane-aware RLS a dead letter; fixed by carrying an explicit plane-aware scope) + hardened: byte-identity now holds against real Postgres jsonb (text snapshot), flush clears only the flushed entries incl. a same-id re-put (no lost update), the write-chain is no longer poisoned by a single flush failure, + test-teeth added (serialize concurrency guard, cost-shape, register-event, minJ-gate, table-client coverage). Layers: **kernel 46→55** (registry live-persistence client + governed contract + serialized write-chain), **truth 40→45** (matured entity resolution + profile persistence), **tests 51→54**, **data 87→88** (migration 0018); headline **~47% → ~50%**. HONEST RE-BASELINE (roadmap caveat #4): Sprint II applied the named kernel/truth deltas and closes at **~50%**, short of the roadmap's ~55% projection because that projection also front-loaded harness/Auric/connector/terminal bumps the kernel-and-truth waves did not target — those move in Sprint III–IV. Previous — WAVE 3: **Kernel request envelope + contracts/API layer (RFC-2001/2014).** A typed **RequestEnvelope** (`core/kernel/envelope.ts` — principal + correlation_id + plane + caller-injected occurred_at/request_id/idempotency_key; pure, minting nothing) and a **service-contracts** layer (`core/kernel/contracts.ts`) the surfaces call THROUGH instead of importing engines directly: every contract call AUTHORIZES FIRST via the permission engine (`authorizeThrough` → `writeTenantDecision`/`authorize`) and, on deny, returns a typed **Refusal** carrying the machine-readable reason (never a bare throw), then delegates to the UNCHANGED engine/store. The ad-hoc `core/auth/session::canReview` is **RETIRED at the call sites**: the human-gate server actions (review a work item, decide/promote a proposal, decide an approval, review evidence) now route through the contract adapter (`app/contracts.ts`) which maps the demo session → a `Principal` (`core/auth/principal.ts`) and authorizes; `canReview` survives only as a back-compat shim whose boolean now COMES FROM the engine. The **DealService** (`cartridges/cooperative_markets/deal_service.ts`) wraps `runDealPipeline` behind the contract: authorize "promote" FIRST, then seed the RunContext from the envelope so the whole run correlates to the request (every KernelEvent + CostEntry carries `env.correlation_id`). No regulated conclusion in a weight; the human gates (ICApproval + EditorialDisposition) are untouched. Gate: debug-loop **ALL GREEN (11/11)** (new **CONTRACTS** step: envelope pure+derives · authorize-FIRST deny→refusal with the delegate un-run · review/approve/promote truth table · service bypass · canReview shim = engine · deal run correlates to the envelope) + `tsc` clean + `npm run build` exit 0 + **182 unit tests** (was 162; +20 across envelope/contracts). Adversarially verified (4-lens fleet: correctness · doctrine · purity/determinism · test-teeth) — 0 blockers; 1 wiring gap fixed (evidence review now actually routes through the contract) + 2 test-teeth gaps closed (deriveEnvelope idempotency-key threading; the agent-actor branch). Layers: **kernel 34→46** (request envelope + contracts/API + authorize-first routing), **harness 18→22** (the envelope correlates the run spine end-to-end through the DealService contract), **tests 49→51** (CONTRACTS gate step + 20 tests); headline **~44% → ~47%**. Previous — WAVE 2: **Confidence engine drives LIVE profile assembly + a query surface.** The Confidence Engine (RFC-3008) now DRIVES profile assembly instead of a fixed 0.9: new `core/profile/freshness.ts` (a per-truth-tier half-life policy — durable→volatile — turning `observed_at`→`as_of` into the `ageDays`/`halfLifeDays` the engine's `decay` consumes), `core/profile/assemble_live.ts` (an ADDITIVE wrapper over `assembleProfile`: outcome-feedback via `reinforce` THEN freshness decay, carrying a per-field freshness + outcome-lineage audit surface — `LiveAssembledProfile`), and `core/profile/query.ts` (a deterministic, generic filter/rank/lookup surface over assembled profiles — by subject_type / confidence / tier-floor / completeness / health / field predicate / combined confidence+freshness floor; total-order id tiebreak; explainable `applied` predicates). Wired over REAL data in `cartridges/cooperative_markets/profiles_live.ts`: a live **regulation-environment profile** over the REAL 675-section 12 CFR corpus (coverage counts aged from the eCFR issue date) + **live institution profiles** over the 5300 batch (ratios aged from the reporting quarter-end, optional per-ratio outcomes) — all fed to `queryProfiles`. Gate: debug-loop **ALL GREEN (10/10)** (new **PROFILES** step: live decay + outcome-feedback + query, deterministic) + `tsc` clean + `npm run build` exit 0 + **162 unit tests** (was 123; +39 across freshness/assemble_live/query/profiles_live). Adversarially verified (4-lens fleet) — 0 blockers; 8 real findings fixed (outcome-evidence lineage now persisted; 3 query coercion/ordering edge cases hardened; 3 mutation-survivor test gaps closed). Layers: **truth 22→40** (confidence-driven live assembly + freshness + outcome-feedback + query engine + real-corpus profile at scale), **cartridge 75→77** (profiles_live wiring), **tests 46→49** (PROFILES gate step + 39 tests); headline **~41% → ~44%**. Previous — WAVE 1: **Kernel & Truth platform opens.** Migrations `0016`+`0017` **applied** (Bryan) → the Object Registry live-persistence path is UNBLOCKED. Built the deterministic **Identity & Tenancy + permission substrate (RFC-2002)** — `core/kernel/identity.ts` (portable cross-org identity: `Principal` + per-workspace `Membership`; the in-process mirror of `auth.uid()`/`app_is_member`/`app_has_role`) and `core/kernel/permissions.ts` (a plane+visibility-aware authorization core that is a FAITHFUL mirror of the `0016`/`0017` RLS predicates — same answer in-process as RLS at the DB boundary; service-role bypass; decisions carry a machine-readable reason; shared-market registry merges are service-role-only) — plus `core/registry/supabase-store.ts` (a Supabase adapter for the EXISTING `RegistryPersistencePort` seam over the `0017` tables; hybrid hydrate/write-through; PURE row mappers; `registryStore()` defaults to in-memory so the gate is green with no creds; no change to `ObjectRegistryService`). Gate: debug-loop **ALL GREEN (9/9)** (new **PERMISSIONS** step: authz == the RLS truth table) + `tsc` clean + `npm run build` exit 0 + **123 unit tests** (was 92; +31 across identity/permissions/adapter). Adversarially verified — one blocker fixed (an agent principal could write a row it could not read) + two non-blocking (a missing `Object.freeze`; the IO write-set exception documented). Previous: OLYMPIC SPRINT WAVE 4 COMPLETE — Sprint I closed: Auric distribution + hardening. Engine **unit-test suite** (92 tests across deal_engine/ic_memo/allocation/settlement/auric engine + distribution/confidence/profile-assemble/ingest_regulations/registry-service/harness-router) wired into the debug loop as a **TESTS** step + a **GitHub Actions CI** workflow running the whole debug loop as the commit gate; **observability** (`core/kernel/observability.ts` cost-dashboard + event-replay projection) with an **`/observability`** Terminal surface; a **`/distribution`** Terminal surface rendering the editorial-gated channel deliveries; the **`brief` channel** now carries a delivery (a channel-lens variant); registry `is_identifier` + merge-liveness/transitive-survivor guards; a router confidence-escalation FP fix; a **FinCEN** regulation object (SAR/CTR repointed). Gate: `npm run build` exit 0 (`/distribution` + `/observability` prerender) + debug-loop **ALL GREEN (8/8)** + full-app `tsc` clean. Adversarially verified (no blockers).)

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
| Data contracts + schema (migrations `0001`–`0018`, `core/` types) | 15% | 88% | 13.2 |
| Kernel services (**identity/permissions**, event bus, object registry live-persistence + governed contract, cost ledger, observability, request envelope + contracts/API, connector runtime + SDK, **generic connector→registry candidate bridge**) | 20% | 61% | 12.2 |
| Truth/graph engines (resolver, confidence, live assembly, query, matured entity resolution, profile persistence, connector→observation bridge, at-scale persisted profiles, third_party_claim intake path, **normalized connector output → Object Registry (cross-source propose-only)**) | 15% | 55% | 8.25 |
| Agent Harness + Execution Engine (router, planner, request-envelope run spine, runtime, evaluation, deal engine on live normalized intake P1/P2, **connector→registry→resolve orchestration**) | 15% | 28% | 4.2 |
| Publication (Auric) engine | 8% | 36% | 2.88 |
| Connector implementations + ingestion (**generic runtime + SDK, config-as-data catalog 39→57→73, 6 real connectors live (NCUA 5300 + regs, SEC EDGAR, FDIC BankFind, Federal Register), full-market 5300 at scale, startup-intake, connector candidates → Object Registry**) | 7% | 64% | 4.48 |
| Cooperative Markets cartridge (first product) | 8% | 86% | 6.88 |
| Terminal (customer-facing product) | 7% | 40% | 2.8 |
| Tests / observability / productionization | 5% | 63% | 3.15 |
| **Total** | **100%** | — | **~58%** |

> **Sprint III Wave 1 — OPENS Sprint III (Connectors & scale): the generic Connector
> Runtime + SDK (Kernel RFC-2011; Volume IX).** A connector is now an executable thing,
> not a manifest on paper. New `core/kernel/connector_sdk.ts` (the typed **Connector
> Output Contract** — normalized observations, entity/relationship candidates, source
> artifacts, change_events, quality_report, connector_health, run metrics — a pure
> **parser contract**, deterministic FNV content hashing, change detection, health-band
> derivation, and the normalize→truth-**Observation** bridge that tiers a record FROM THE
> SOURCE MANIFEST, never from connector code) + `core/kernel/connector_runtime.ts` (the
> generic executor: **authorize FIRST** — a shared-market ingestion write is
> service-role-only — then acquire with **retry / circuit-breaker**, drive the connector's
> PURE parser to normalize, detect changes new/updated/deleted/unchanged, score quality,
> derive health, and emit an envelope-**correlated** KernelEvent + CostEntry). Connectors
> NORMALIZE only — no ratios, no conclusion, no tier in connector code. Config-as-data
> `core/registry/data/connectors.json` (**39 sources + 39 connectors** across the
> SOURCE_CATALOG families) + a generic `core/registry/connectors.ts` loader/validator
> (closed-graph check) qualify the DKR placeholders as DATA, not code forks. Two REAL
> connectors run THROUGH the runtime (`cartridges/cooperative_markets/connectors/*` +
> `run_connectors.ts`): the **NCUA 5300** connector → normalized → the existing
> deterministic ratio calc → **live institution profiles that PERSIST** (Wave-4 profile
> seam, plane-aware) and **reconcile to the connector source refs**, and the **NCUA
> regulations** connector over the **REAL 675-section 12 CFR corpus** at scale. New
> **CONNECTOR** debug-loop step (now 13) + 35 unit tests (→ **246**). Layers: **connectors
> 20→45** (a real executable runtime + SDK + 39-manifest catalog + 2 live connectors;
> Sprint-III-end target 70 needs the remaining catalog qualification + a real bulk-5300
> feed + startup-intake), **kernel 55→60** (the connector runtime is a new kernel service,
> authorized+correlated), **truth 45→47** (the connector→observation bridge; the
> at-scale-persisted-5300 that moves truth toward 60 still rides labeled figures until a
> bulk feed lands), **cartridge 77→80**, **tests 54→57**; headline **~50% → ~54%**.
> Additive, new-files-only; the engines are UNCHANGED; default stays in-memory + creds-free.
> Adversarially verified (4-lens fleet: correctness · truth-doctrine/no-core-vertical-leak ·
> purity/determinism · test-teeth) — **1 blocker fixed** (a record acquired but failing to
> NORMALIZE, whose ref was in prior state, was fabricated as a `deleted` change event — a
> deletion invented from a failure, the exact load-bearing rule violation; fixed by carrying
> the seen-but-unparsed refs into change detection so a rejection is NEVER a deletion) +
> 3 hardened (a vertical-noun leak — `charter_number`/`cfr_ref`/`section` — removed from the
> core rejection-labeler; the reconcile-to-source gate made non-vacuous; a tautological
> tier-from-source assertion replaced with a differing-source proof). HONEST re-baseline
> (roadmap caveat #4): Wave 1 lands the connector FOUNDATION at ~54%, short of the
> Sprint-III-end ~68% because that is the full sprint (2–3 more waves: full-market/bulk 5300
> at scale, startup-intake into the deal engine, and qualifying the remaining placeholders).
> No number inflated to a target.

> Sprint II Wave 4 **CLOSES Sprint II** and lifts **kernel 46→55**: the Object Registry
> now has a live-persistence path onto a REAL `@supabase/supabase-js` client behind the
> unchanged `RegistryPersistencePort` seam, and a governed write/merge routes THROUGH a
> kernel contract (authorize-FIRST; a shared-market registry merge is service-role-only)
> on a **serialized write-chain** (a merge's flush never races the register that precedes
> it), emitting an envelope-correlated KernelEvent + CostEntry. **Truth 40→45**: the
> resolver is matured (blocking keys + deterministic name/alias/charter similarity,
> PROPOSE-only, and the NO-CLOBBER invariant — a human-reviewed candidate is never
> re-proposed), and a live-assembled profile now PERSISTS byte-identically + plane-aware
> through a seam (in-memory default; Supabase adapter + migration `0018` when configured).
> **Tests 51→54** (REGISTRY-PERSISTENCE gate step + 32 unit tests → 214), **data 87→88**
> (migration 0018). Additive, new-files-only in `core/`; the registry service + engines
> are unchanged; default stays in-memory so the gate is green with no creds. Sprint II
> closes at **~50%** on honest recompute (roadmap caveat #4: the ~55% projection also
> assumed harness/Auric/connector/terminal bumps that the kernel-and-truth waves did not
> target — those land in Sprint III–IV).

> Sprint II Wave 3 lifted **kernel 34→46**: the kernel now has a typed **request
> envelope** (RFC-2001) + a **service-contracts/API layer** (RFC-2014) the surfaces
> call THROUGH — authorize-FIRST (the decision comes from the permission engine, a
> deny returns a typed refusal carrying the machine-readable reason), then delegate to
> the unchanged engine. The ad-hoc `canReview` is retired at the call sites (routed
> through the contract; the shim's boolean now comes from the engine). **Harness 18→22**:
> the envelope carries `correlation_id` + `principal` + `plane` THROUGH a call, and the
> DealService contract seeds the pipeline RunContext from it so every KernelEvent +
> CostEntry correlates to the originating request. **Tests 49→51** (CONTRACTS gate step
> + 20 unit tests). It is short of the roadmap's Sprint-II-end kernel target (55) by
> design: wiring the Supabase registry adapter onto a real client + the matured
> entity-resolution pipeline + profile PERSISTENCE remain (Wave 4 — moves kernel 46→55,
> truth 40→45).

> Sprint II Wave 2 lifted **truth 22→40**: the Confidence Engine now DRIVES profile
> assembly (freshness decay + outcome-feedback over real sourced facts, not a fixed
> 0.9) and a real, generic **query engine** (filter/rank/lookup) exists over assembled
> profiles, exercised over the REAL 675-section regulatory corpus at scale under the
> debug gate. It is short of the roadmap's Sprint-II-end truth target (45) by design:
> profile PERSISTENCE and the matured entity-resolution/match-candidate pipeline remain
> (they land with the Supabase registry-client wave). Cartridge 75→77 (profiles_live
> wiring), tests 46→49 (PROFILES gate step + 39 unit tests).

> Wave 4 closed Sprint I. The vertical's engines are now UNIT-TESTED (92 tests) with the
> whole debug loop wired into a CI commit gate, the kernel emits observability (cost
> dashboards + event replay) surfaced at `/observability`, and the editorial-gated
> publication loop is rendered at `/distribution` (with the `brief` channel now carrying a
> delivery). ~38% lands just under the roadmap's ~40% Sprint-I target; the residual gap is
> kernel identity/permissions + the Execution Engine, both Sprint II. Layers moved: kernel
> 20→26 (observability service + event replay), truth 17→19 (registry guards; profile/
> confidence under test), harness 13→18 (router tested + FP fix + ToolRouter), Auric 26→36
> (distribution surface + brief channel + fully-tested editorial gate), terminal 30→40 (two
> new real surfaces), tests 22→42 (unit suite + TESTS gate step + CI), data 82→83 (FinCEN).

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

## Next bricks (each moves the number) — Sprint III (Connectors & scale, target ~68%)
1. ✅ **Connector runtime + SDK** (RFC-2011 + Vol IX) — DONE (Wave 1): the generic executable
   runtime + typed output contract + parser contract + change-event/quality-report/health, a
   config-as-data catalog (39 sources/connectors) + closed-graph loader, and 2 real connectors
   live through it. Connectors 20→45, kernel 55→60.
2. ✅ **Full-market NCUA ingestion at scale** — DONE (Wave 2): the WHOLE market runs through the
   UNCHANGED connector → institution profiles PERSISTED at scale, reconciling to source. Proven on a
   LABELED synthetic market (real bulk 5300 is Bryan-only — drops in with NO code change; only the
   injected `acquire` batch changes). Connectors 45→57, truth 47→52 (short of 60 until the real feed lands).
3. ✅ **Startup-intake connector → deal engine** — DONE (Wave 2): the DEFERRED "live intake path" is
   closed; the deal engine P1/P2 runs on normalized intake, human gates untouched. Harness 22→26.
4. **Real bulk NCUA 5300 feed** (Bryan-only) — swap the synthetic market for a real per-CU bulk pull
   behind the same connector → truth toward 60, connectors toward ~65. No code change; only the data.
5. **Continue qualifying the catalog** toward the ~93 (57 today) + more real connectors against the SDK
   (FDIC BankFind, SEC full-text, Federal Register are prime next real implementations). Connectors up.
6. **Apply migration `0018`** in Supabase, then run a real registry live-flush + profile persist
   end-to-end against Postgres (the Wave-4 adapters drop in when `SUPABASE_URL` /
   `SUPABASE_SERVICE_ROLE_KEY` are set). Kernel 60→70.

## Changelog
- 2026-07-22 — **OLYMPIC SPRINT III — WAVE 2: Full-market ingestion at scale + startup-intake → deal engine + catalog growth.**
  Additive, new-files-only, pure/deterministic, **no vertical noun in `core/`**; the connector runtime + engines are
  UNCHANGED; default stays in-memory + creds-free. New:
  (1) **`cartridges/cooperative_markets/bulk_5300_market.ts`** — a clearly-LABELED, deterministic (index-seeded, no clock/
  random) SYNTHETIC bulk market at scale (`sourcedoc:ncua:5300:synthetic:*`; the golden `batch_fixtures` composed in as a
  labeled subset — RETIRED behind the connector). Internally-consistent figures so the five downstream ratios land in real
  bands. `marketProvenance().all_labeled` is computed FROM THE DATA (a negative-control-proven guard: an unlabeled/real-looking
  filing flips it false). Real per-CU 5300 is Bryan-only; the SCALE path is proven HONESTLY on labeled synthetic data.
  (2) **`cartridges/cooperative_markets/run_market_ingest.ts`** — runs the WHOLE market through the UNCHANGED `runNcua5300`
  (connector → runtime → deterministic ratio calc → live assembly) → institution profiles PERSISTED at scale, plane-aware
  (shared_market/public), reconciling to the connector source refs; tier `public_fact` from the source manifest. Deterministic
  at scale (600 default; the gate runs 300).
  (3) **`cartridges/cooperative_markets/connectors/startup_intake_connector.ts` + `intake_fixtures.ts` + `run_intake.ts`** —
  the DEFERRED "live intake path" CLOSED: the startup-intake connector NORMALIZES a submission (self-reported signals verbatim,
  no scoring, no tier) through the runtime; `recordToObservation` tiers it `third_party_claim` FROM THE SOURCE MANIFEST (a
  company's own claim — never a fact, never a score in the connector); the normalized intake materializes into the deal engine's
  `SourcedInput`s (each citing the submission) → the EXISTING P1 scoring + P2 IC memo run on REAL normalized intake (advance /
  block / hold all exercised; the memo stays a DRAFT proposal). Human gates (ICApproval + EditorialDisposition) UNTOUCHED.
  (4) **`cartridges/cooperative_markets/connectors/sec_edgar_connector.ts` + `run_sec_edgar.ts`** — a THIRD real connector:
  normalizes EDGAR filing headers (accession key, CIK entity) → `public_fact` (tier proven with a DIFFERING source, not a
  tautology); `parseEdgarFiling` has a real structural-validation reject path (blank accession/CIK → a reported rejection,
  NEVER a fabricated deletion).
  (5) **Config-as-data catalog** `core/registry/data/connectors.json` qualified **39→57** source/connector pairs toward the
  ~93 (CFPB, FDIC, Federal Reserve, OFAC, FinCEN, Federal Register, CA/TX/NY CU regulators, SEC full-text/FINRA, IRS 990,
  USPTO trademarks, G2, SOC2/trust, status pages, Crunchbase) — closed graph, one-connector-per-source; a DATA edit, not a
  code fork. (6) Debug loop CONNECTOR step gains full-market-scale · intake→engine · SEC EDGAR tier-from-source · catalog-growth
  · label-guard negative-control assertions; **+26 unit tests** (`bulk_5300_market`, `startup_intake_connector`,
  `sec_edgar_connector`) → **272**. Gate: debug-loop **ALL GREEN (13/13)** + `tsc` clean + `npm run build` exit 0 + 272/272.
  **Adversarially verified** (4-lens fleet: correctness · truth-doctrine/no-core-vertical-leak · purity/determinism · test-teeth):
  **1 major fixed** (the SEC EDGAR rejection test drove a hand-rolled stub, not the real connector — `parseEdgarFiling` given a
  genuine validation reject path + the test now driven through the real connector via `runSecEdgar`) + **1 minor fixed**
  (`marketProvenance.all_labeled` was hardcoded `true` → now computed from the data with a negative-control test, so the
  synthetic-label invariant has real teeth). Layers: **truth 47→52** (at-scale persisted profiles + third_party_claim intake
  path — short of 60: figures are labeled SYNTHETIC until a real bulk feed), **harness 22→26** (deal engine on live normalized
  intake P1/P2), **connectors 45→57** (full-market scale + 2 new real connectors + catalog 39→57), **cartridge 80→85**, **tests
  57→60**; headline **~54% → ~56%**. HONEST re-baseline (roadmap caveat #4): the SCALE + intake MECHANISMS are proven, but the
  bulk 5300 data is synthetic and the catalog is 57/~93, so the Sprint-III-end ~68% needs the real bulk feed + full catalog
  qualification + more. No regulated conclusion in weights; truth tiers/planes not conflated; no core vertical leak.
- 2026-07-22 — **OLYMPIC SPRINT II — WAVE 4 (Sprint II CLOSED): Object Registry live-persistence client + matured
  entity resolution + profile PERSISTENCE.** Additive, new-files-only in `core/`, pure/deterministic, no vertical
  nouns; the registry service + engines are UNCHANGED; default stays in-memory (gate green with no creds). New:
  (1) **`core/registry/governed_registry.ts`** — `GovernedObjectRegistry` wraps the unchanged `ObjectRegistryService`:
  `registerThrough`/`mergeThrough` authorize FIRST via `guard` (permission engine); a shared-market registry merge
  is **service-role-only** (registry objects are the shared-market identity index, workspace-null → `app_can_admin_object`
  grants NO authenticated user); each mutation emits an envelope-**correlated** KernelEvent + CostEntry; a **serialized
  write-chain** flushes in call order (a merge's durable flush never races the register before it); `drain()` surfaces a
  flush failure without poisoning the chain. (2) **`core/data/supabase-table-client.ts`** — the one new file importing
  `@supabase/supabase-js`, adapting a real client to the narrow `{upsert,selectAll}` seam; env-gated (null without creds).
  (3) **`core/registry/resolver.ts`** — matured resolution: blocking keys (external id / slug / normalized name-alias
  tokens) + deterministic token-Jaccard similarity (caller-injected designator stopwords keep core/ vertical-free), still
  PROPOSE-only, resolving the DEFERRED **NO-CLOBBER** note (a confirmed/rejected candidate is sticky, never re-proposed).
  (4) **`core/profile/persistence.ts`** — `ProfilePersistencePort` + `InMemoryProfileStore` default + `SupabaseProfileStore`
  hybrid + pure mappers: a `LiveAssembledProfile` persists **byte-identically** (canonical-JSON `text` snapshot) and
  **plane-aware** (an explicit `ProfileScope` keeps a public shared-market profile and a private tenant profile
  un-conflated), surviving a process boundary with confidence/freshness/lineage intact. (5) **`db/migrations/0018_profile_snapshots.sql`**
  — additive, plane-aware RLS reusing 0016. Debug loop gains a **REGISTRY-PERSISTENCE** step; **+32 unit tests** (→ 214)
  across resolver/governed/persistence/table-client. Gate: debug-loop **ALL GREEN (12/12)** + `tsc` clean + `npm run build`
  exit 0 + 214/214. Adversarially verified (4-lens fleet + a focused re-verify): **1 blocker fixed** (profile persistence had
  dropped the plane/visibility/tenant discriminator → planes conflated + the plane-aware RLS a dead letter; fixed by
  carrying an explicit plane-aware scope) + hardened (byte-identity vs real Postgres jsonb; flush no-lost-update incl.
  same-id re-put; write-chain not poisoned by a flush failure; test-teeth: serialize concurrency guard, cost-shape,
  register-event, minJ-gate, table-client coverage). Layers: **kernel 46→55, truth 40→45, tests 51→54, data 87→88**;
  headline **~47% → ~50%**. Honest re-baseline (roadmap caveat #4): Sprint II closes at ~50%, short of the ~55% projection
  because that also assumed harness/Auric/connector/terminal bumps this wave did not target (Sprint III–IV). No regulated
  conclusion in weights; truth tiers/planes not conflated; no core vertical leak.
- 2026-07-22 — **OLYMPIC SPRINT II — WAVE 2: Confidence engine drives LIVE profile assembly + a query surface.**
  Additive, new-files-only, pure/deterministic, no vertical nouns in `core/`. The Confidence Engine (RFC-3008)
  now DRIVES profile assembly instead of a fixed per-field 0.9. New:
  (1) **`core/profile/freshness.ts`** — a per-truth-tier half-life POLICY (`DEFAULT_HALF_LIFE_DAYS`,
  durable→volatile: human_approved 10y … dispatch_inference 90d) + deterministic `ageDaysBetween` (future/bad
  dates → 0, no negative age) + `assessFreshness` (freshness = `decay(1, age, halfLife)` — the SAME curve the
  engine uses, so freshness and post-decay confidence move together) + `freshnessBand` (fresh/aging/stale).
  Generic/core; injected instants only (Date.parse on injected strings, never a clock).
  (2) **`core/profile/assemble_live.ts`** — an ADDITIVE wrapper over `assembleProfile`: for each field, apply
  outcome-feedback (`reinforce` over `OutcomeEvent[]`, in order) THEN age it (freshness → `ageDays`/`halfLifeDays`
  passed to the base assembler, so decay happens once, inside `combineSources`). Returns `LiveAssembledProfile`
  = the base profile + `as_of` + a per-field `field_freshness` read + an `outcome_adjustments` audit surface that
  **persists the outcome evidence source_refs** (lineage, not a silent nudge). Base assembler unchanged.
  (3) **`core/profile/query.ts`** — a deterministic, generic **query surface**: `queryProfiles` filters by
  subject_type / min_confidence / **tier_floor** (via `TIER_RANK`) / min_completeness / health / **field predicate**
  (exists/eq/gte/gt/lte/lt, numeric OR numeric-string threshold, blank-string-safe) / a combined confidence+freshness
  floor; `rankProfiles` by confidence/completeness/health/field_value/field_confidence with a **total-order id
  tiebreak** and **direction-aware sinking** of field-less profiles; `lookupField`. Every applied predicate is
  reported (`applied`) for explainability.
  (4) **`cartridges/cooperative_markets/profiles_live.ts`** (+ `scripts/profile-query-demo.ts`) — wires the two
  real intake paths into live assembly: a **regulation-environment profile** over the REAL 675-section 12 CFR
  corpus (coverage counts = `deterministic_calculation`s citing the corpus SourceDocument, aged from the eCFR
  issue date) + **live institution profiles** over the 5300 batch (the five ratios aged from the reporting
  quarter-end via `periodToObservedAt`, optional per-charter/-ratio outcomes) → `buildLiveProfiles` feeds
  `queryProfiles`. (Institution FIGURES remain labeled fixtures; the regulatory corpus is REAL at scale; the
  live-assembly ENGINE is real either way.)
  (5) **Debug loop gained a PROFILES step** (now 10 steps): asserts live freshness decay (a stale field
  contributes strictly less; 0.9 prior halves at one half-life), outcome-feedback (±), the reg-env profile over
  the REAL 675 sections (pinned), query filter/rank/lookup with teeth + the freshness→`min_field_confidence`
  composition end-to-end, all deterministic. **+39 unit tests** (`tests/profile_freshness.test.mjs`,
  `assemble_live.test.mjs`, `profile_query.test.mjs`, `profiles_live.test.mjs`) → **162** total.
  **Adversarially verified** (4-lens skeptic fleet: truth-doctrine · purity/determinism · correctness/edge ·
  test-teeth). **0 blockers.** Fixed: outcome-evidence lineage now persisted (`outcome_source_refs`); 3 query
  coercion/ordering edge cases hardened (numeric-string thresholds compare numerically; blank/whitespace field
  values are NOT numeric 0; field-less profiles sink in BOTH sort directions); 3 mutation-survivor test gaps
  closed (all rank_by branches; outcome ORDER-dependence pinned to 0.48≠0.52; freshness→query composed end-to-end).
  Purity lens found nothing. **Gate:** `node scripts/debug-loop.mjs` **ALL GREEN (10/10)**, `tsc` clean,
  `npm run build` exit 0, **162/162** unit tests. Layers: **truth 22→40**, **cartridge 75→77**, **tests 46→49**;
  headline **~41% → ~44%**. Additive; config-as-data; no regulated conclusion in weights; no core vertical leak.
- 2026-07-21 — **OLYMPIC SPRINT II — WAVE 1: Identity & Tenancy + permission engine + registry live-persistence
  adapter (Kernel & Truth platform opens).** Migrations `0016`+`0017` **applied** by Bryan → the Object Registry
  live-persistence path is unblocked (governance docs flipped from "pending"). Additive, new-files-only, pure/
  deterministic, no vertical nouns in `core/`. New:
  (1) **`core/kernel/identity.ts`** — RFC-2002 portable cross-org identity: a `Principal` (`user`/`agent`/
  `service`) holds membership across many orgs/workspaces with a per-workspace `RoleKey`; `isMember`/`roleIn`/
  `hasRole`/`actorString`/`organizationsOf`/`workspacesOf` are the in-process mirror of `auth.uid()`/
  `app_is_member`/`app_has_role`. `SERVICE_PRINCIPAL` frozen.
  (2) **`core/kernel/permissions.ts`** — a deterministic, plane+visibility-aware authorization core that is a
  FAITHFUL, line-for-line mirror of the `0016`/`0017` RLS predicates (`app_can_read_plane`, `app_can_write_tenant`,
  `app_can_admin_object`), so a surface gets the SAME answer in-process as RLS gives at the database boundary.
  `authorize(principal, action, resource)` is the single call; the Supabase service role is modeled as an explicit
  bypass (shared-market ingestion); every `PermissionDecision` carries a machine-readable `reason` (lineage, not a
  weight). Load-bearing invariant reproduced: a **shared-market registry merge is governable by NO authenticated
  user — only the platform service role**.
  (3) **`core/registry/supabase-store.ts`** — a Supabase adapter implementing the EXISTING `RegistryPersistencePort`
  seam over the `0017` tables (`object_registry`/`object_match_candidates`/`object_merges`); hybrid hydrate/write-
  through (mirrors `core/data/supabase-adapter.ts`) with PURE, unit-tested row mappers + the same deterministic
  id→uuid bridge; `registryStore()` defaults to in-memory (gate green with no creds); NO change to
  `ObjectRegistryService`.
  (4) **Debug loop gained a PERMISSIONS step** (step 8 of 9) asserting authz == the RLS truth table (read plane-
  aware; insert owner/admin/operator vs update owner/admin; service bypass; shared-market merge = service-only;
  deterministic). **+31 unit tests** (`tests/identity.test.mjs`, `permissions.test.mjs`,
  `registry_supabase_store.test.mjs`) → **120** total.
  **Adversarially verified** (4-lens skeptic fleet): one **blocker** fixed (an `agent` principal could WRITE a row
  it could not READ — `writeTenantDecision` now requires an authenticated user, consistent with the read path) +
  two non-blocking (a missing `Object.freeze` on `SERVICE_PRINCIPAL`; the intelligence-object write-set exception
  documented with an `IO_WRITE_ROLES` constant + test).
  **Gate:** `node scripts/debug-loop.mjs` **ALL GREEN (9/9)**, `tsc` clean, `npm run build` exit 0, **123/123**
  unit tests. Layers: **data 83→87** (`0016`+`0017` applied — schema now live/enforced), **kernel 26→34**
  (identity + permission engine + registry persistence adapter), **truth 19→22** (entity-resolution persistence),
  **tests 42→46** (permissions suite + PERMISSIONS gate step); headline **~38% → ~41%**. Additive; config-as-data;
  no regulated conclusion in weights; no core vertical leak.
- 2026-07-21 — **OLYMPIC SPRINT WAVE 4 COMPLETE — Auric distribution + hardening (Sprint I closed).**
  Built on the Wave-4 editorial-gate slice. Fanned out 3 workstream agents (new files only), integrated +
  gated by the lead, then adversarially verified (no blockers; one test-coverage gap the verifier surfaced
  was closed with a mutation-proven test). New:
  (1) **Engine unit-test suite** — `tests/*.test.mjs` (**92 tests**) covering deal_engine (thresholds +
  compliance gate + geometric-mean opportunity + sourced-inference lineage + determinism), ic_memo
  (**approved-evidence-only, now proven to gate COVERAGE not just citations** — mutation-tested), allocation
  (accreditation/sanctions/KYC-KYB gates + pro-rata + citations), settlement (advisory/syndication closed;
  fund/spv vehicle_pending), auric engine (variant `source_refs` == IO refs, feed filter/stale/rank),
  distribution (**editorial gate has teeth** — held/rejected/absent → 0 deliveries), confidence (decay/
  propagate/reinforce/topTier/combineSources), profile-assemble, ingest_regulations (bi-temporal, held
  claims), registry-service (propose-not-merge; **new is_identifier + merge-liveness guards**), harness
  router. Run: `npm test` (or the debug loop's new TESTS step). Each test self-registers the `@/*` alias
  hook + dynamically imports its target (native TS type-stripping) — no build step.
  (2) **CI commit gate** — `.github/workflows/ci.yml` runs `node scripts/debug-loop.mjs` (now 8 steps incl.
  TESTS) + `npm run build` on every push/PR to main. The green Bryan sees locally is the green that gates a push.
  (3) **Observability** — `core/kernel/observability.ts` (pure, generic, no vertical nouns): `costDashboard`
  (by category/correlation/label), `eventTimeline` + `replayFrom` (event replay over the append-only log),
  `runHealth`. Surfaced at **`/observability`** (`app/observability/page.tsx` + `components/terminal/
  ObservabilityView.tsx`): cost-by-category bars + a correlated event-replay timeline over the golden run's
  kernel spine.
  (4) **Distribution surface** — **`/distribution`** (`app/distribution/page.tsx` + `components/terminal/
  DistributionView.tsx`): renders the editorial gate's HELD-vs-APPROVED contrast and every channel delivery
  with its lineage (editorial `decision_ref` + `approved_by`), restated `source_refs`, and visibility
  (terminal_feed=network, market_feed/brief=public).
  (5) **`brief` channel now delivers** — the pipeline renders a `brief` channel-lens variant (appended, so
  pre-existing variant ids are byte-identical), so an approved publication yields **5 deliveries across 3
  channels**. A channel lens is dropped by `buildFeed` (matchesContext), so the ranked feed is unchanged.
  (6) **Cleanup** — registry `is_identifier` (a non-identifying shared external id no longer proposes a
  spurious duplicate) + merge-liveness/transitive-survivor guards; a router confidence-escalation
  floating-point fix (a "round" shortfall escalates the intuitive rung count); a **FinCEN** regulation object
  added to the catalog with SAR/CTR `filed_with_regulator` repointed (closed graph holds).
  **Gate:** `node scripts/debug-loop.mjs` **ALL GREEN (8/8)** (TYPECHECK · ONTOLOGY · CARTRIDGE · ENGINE ·
  PIPELINE · DATA · EDITORIAL · **TESTS 92/92**), full-app **`tsc` clean**, **`npm run build` exit 0**
  (`/distribution` + `/observability` prerender static). Layers: kernel 20→26, truth 17→19, harness 13→18,
  Auric 26→36, connectors 19→20, cartridge 72→75, terminal 30→40, tests 22→42, data 82→83; headline
  **~33% → ~38%**. Additive; vehicle-agnostic; no regulated conclusion in weights; no core vertical leak.
  0016+0017 still pending Bryan's Supabase apply — registry persistence stays in-memory behind the seam.
- 2026-07-21 — **OLYMPIC SPRINT WAVE 4 (slice) — Auric distribution + the editorial verification gate.**
  New: `core/auric/distribution.ts` — channel variants (brief / market-feed / terminal-feed) + the **editorial
  verification gate**: an assembled + rendered IntelligenceObject reaches a channel ONLY on an approved HUMAN
  editorial disposition (`EditorialDisposition`, mirroring the pipeline's `ICApproval` pattern) — a SECOND, distinct
  human gate governing PUBLICATION (the IC gate governs the deal decision). Held/rejected/absent → nothing is
  delivered; every delivery carries the editorial `decision_ref` + `approved_by` (lineage, never a weight) and
  restates the IO's refs exactly (no superset). `terminal_feed` deliveries are network-reach, `market_feed`/`brief`
  public. Pure/deterministic. Debug loop gained an **EDITORIAL** step (gate has teeth: held/rejected→0 deliveries;
  approved→sourced deliveries that restate the IO; deterministic). Gate: **debug-loop ALL GREEN (7/7)** + `tsc`
  clean + `npm run build` exit 0. Layers: Auric **20→26**, tests **20→22**; headline holds **~33%** (this is the
  first slice of Wave 4). **Remaining Wave 4** (next chat): unit tests for the engines + wire debug-loop into CI;
  cost-ledger dashboards + event replay (observability); a channel/distribution Terminal surface; burn down
  `DEBUG_LOG` [NON-BLOCKING]/[DEFERRED]. Additive; no core vertical leak.
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
