# Active Build

## Active initiative
Cooperative Markets foundation on Dispatch OS. The full Specification Program (Vols
I–X) is reconciled/adopted; forward work is BUILD.

**Olympic Sprint IV (Terminal & product surface complete, target ~80%) — IN PROGRESS, ~61% after Wave 1.**
**Wave 1 (DONE, 2026-07-22) — PROMOTE 3 scaffolds → REAL surfaces over live data.** Turned three of the
highest-value FRAMED scaffolds into real surfaces over live run output, using `ui_surfaces.json` as the contract
(now 13 live / 10 scaffold). Additive; no vertical noun in `core/`; the connector runtime + engines + human-gate
contract layer UNCHANGED; default in-memory; look/feel deferred (reused existing tokens). (1) **`/institutions`** —
a real DIRECTORY over the full-market profiles: `run_institutions_directory.ts` (pure/erasable-only) itemizes the
whole synthetic market (5300 ratios as deterministic calcs citing each filing; asset + PCA readiness bands; confidence
marked **inferred**; **region surfaced as `missing`** — shown, never faked), `InstitutionsDirectoryView.tsx` renders
search/filter/total-order-sort, each row → `/terminal`; scales one→thousands; figures LABELED synthetic (real bulk
5300 Bryan-only). (2) **`/approvals`** — the LIVE human gate: `app/_surfaces/approvals_view.ts` (pure/generic) buckets
store approvals awaiting-vs-decided with lineage + states (pending_approval / **restricted** = regulated owner/admin-only
/ current), deciding routes THROUGH `decideApprovalAction → app/contracts.decideApproval → permission engine`; NEVER
auto-approves. (3) **`/evidence`** — LIVE provenance drill-through: `app/_surfaces/evidence_view.ts` projects evidence
across work items with lineage + states current/**stale**/**inferred**/pending_approval/**restricted** distinct,
review routes THROUGH `reviewEvidenceAction → contracts.reviewEvidence`; NEVER auto-reviews. Additive seed fixtures
(1 pending approval + 1 unreviewed evidence) so the gates show their full legend over real data. Gate: debug-loop
**19/19** (new INSTITUTIONS · APPROVALS · EVIDENCE steps), `tsc` clean, build exit 0 (26/26 prerender; the 3 promoted
surfaces static), **332** tests (+24). Adversarially verified (4-lens). **Next (Wave 2):** the Terminal RUNTIME
(window/layout, command palette, universal search over the directory + registry, notification/task centers — Vol VII);
promote more scaffolds (`/opportunities`, `/workflows`, `/relationships`, `/executives`, `/search`); optionally a real
bulk 5300 feed (Bryan) toward the ~80% Sprint-IV target.

**Prior — Olympic Sprint III (Connectors & scale) — CLOSED at ~60% after Wave 5.**
**Wave 5 (DONE, 2026-07-22) — FRAME THE WHOLE PRODUCT UI + the JOINT /network surface.** Bryan's steer: don't
co-design one polished surface now — frame the ENTIRE product's UI as placeholders/wireframes/scaffolding so the
product is complete end-to-end, and defer look/feel/flow/cadence to a polish sprint. Shipped: a config-as-data **UI
surface registry** (`core/registry/data/ui_surfaces.json` + generic loader `core/registry/ui_surfaces.ts`,
closed-graph) declaring the whole FS-10000 IA as **23 surfaces** (10 live, 13 scaffold); a reusable `ScaffoldView` +
a generated page per scaffold route; registry-driven nav. The ONE real surface: **`/network`** (review-queue-FIRST) —
the PROPOSE-ONLY queue (cross-source entity duplicates + external-canon alias proposals, `merged_count`=0, never
auto-merge) over the LABELED-synthetic full-market list. CANON crosswalk 5→**15** (2 new confirmed FS-8000 sources +
8 proposed FS-5100 registries); CATALOG 73→**93**. New **UI-SURFACES** + **NETWORK** debug steps (**16/16**), **308**
tests, `tsc` clean, `build` exit 0 (all 26 routes prerender). Fixed a latent prerender blocker (registry loaders now
`process.cwd()`-rooted, not `fileURLToPath`; runtime untouched). Adversarially verified (4-lens). **Next (Wave 6):**
begin filling scaffolds into real surfaces (Institutions directory, Approvals/Evidence over the live gates) and/or the
Sprint-III depth targets — a real bulk 5300 feed (Bryan) + more real connectors + harness/truth depth toward ~68%.

**Wave 4 (DONE, 2026-07-22):** wove the external FS / Dispatch-Auric V1 spec package in as a
REFERENCE/operational canon via a generic canon reconciliation seam (`core/registry/canon.ts`
+ config-as-data `canon_aliases.json`) — reconciles FS identifiers to the repo's live canonical
ids, PROPOSE-ONLY, closed-graph, identity-not-authority, authority precedence (`live_code` first);
`ADR-0017` records it (repo wave order leads). Gate 14/14, 297 tests. **Next (Wave 5): the JOINT
Terminal UI** over the full-market profiles + the registry/canon review queue, plus continued
catalog qualification (73→~93) and reconciling more FS-5100 registries.

**Prior — Olympic Sprint III (Connectors & scale) waves 1–3 (~58% after Wave 3).**
Wave 1 shipped the generic Connector Runtime + SDK (RFC-2011). Wave 2 shipped full-market
5300 at scale (labeled synthetic) + the startup-intake → deal-engine path + SEC EDGAR +
catalog 39→57. **Wave 3 (DONE, 2026-07-22):** two more REAL connectors (FDIC BankFind →
`financial_institution`; Federal Register → `regulation`, both `public_fact` from the source
manifest), the SECOND live surface (normalized connector `entity_candidates` → the Object
Registry via a generic core bridge, matured resolver PROPOSE-only across sources, never
auto-merge), and catalog 57→73 toward the ~93. Gate: debug-loop 13/13, `tsc` clean, build
exit 0, 290 tests. Adversarially verified (1 major fixed: rejection≠deletion recovered on all
real connectors). **Next (Wave 4):** the REAL bulk 5300 feed if Bryan stages it (moves truth
to real figures), catalog 73→~93 + more real connectors, and a Terminal surface over the
full-market profiles / intake pipeline. Bryan-only: git push, apply 0018, real 5300, the
investment-vehicle decision, VC/Alloya legal.

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
- **✅ WAVE 2 — Terminal UI (DONE, 2026-07-21).** The real Next.js product surface at `/terminal`
  (`app/terminal/page.tsx` server + `components/terminal/TerminalView.tsx` client) reads the live
  `runDealPipeline` output: run header + harness stage rail (human gate flagged); institution + deal
  scorecards (P1); opportunity feed with the **CEO/CRO/CFO executive-lens toggle** over `buildFeed`
  + the role-lensed memo summary; IC memo (P2); allocation (P3); settlement/monitoring (P4); kernel
  spine (events + cost). One-line `Terminal` nav link added (lead-owned). Gate: **`npm run build`
  exit 0** (`/terminal` prerenders) + **debug-loop green** + **`tsc` clean**; screenshot verified.
- **✅ WAVE 3 — Live data + kernel/truth services (DONE, 2026-07-21).** The staged NCUA data is real
  **regulatory** text (675 in-force 12 CFR sections + 10 pending amendments), **not** 5300 financials,
  so "live NCUA data at scale" landed as **real regulatory ingestion at scale**:
  `cartridges/cooperative_markets/ingest_regulations.ts` (+ `ingest_regulations_data.ts`) → sourced,
  **bi-temporal** truth objects (in-force `public_fact` at the issue date; pending full-text future-dated
  observations; amendatory **instructions** → claims **held pending human merge**). **Profile Assembly
  Engine (RFC-3012)** `core/profile/assemble.ts` over the confidence engine. The **5300 batch path**
  `cartridges/cooperative_markets/{ingest_batch,batch_fixtures}.ts` → facts (`deterministic_calculation`,
  each citing its filing) + assembled institution profiles over a labeled fixture batch (real per-CU 5300
  connector deferred, Bryan-only). **Object Registry service (RFC-2003)** `core/registry/service.ts` +
  entity resolution behind a persistence seam (in-memory; **proposed, never auto-merged**; live persistence
  gated on `0016`+`0017`). Second Terminal surface **`/market`** (`app/market/page.tsx` +
  `components/terminal/MarketView.tsx`). Debug loop gained a **DATA-INTEGRITY** step. Gate: **debug-loop
  ALL GREEN (6/6)** + `tsc` clean + `npm run build` exit 0 (`/market` prerenders). Adversarially verified
  (3 lenses; no blockers; the DATA gate was hardened — pinned source counts + independent ratio oracle —
  in response to the verification).
- **✅ WAVE 4 — Auric distribution + hardening (DONE, 2026-07-21) — Sprint I CLOSED (~38%).**
  - **Editorial gate + distribution:** `core/auric/distribution.ts` — channel variants (brief / market-feed /
    terminal-feed) + the **editorial verification gate**: an IO publishes to a channel ONLY on an approved
    HUMAN `EditorialDisposition` (a second human gate, distinct from the IC deal gate); held/rejected/absent →
    nothing delivered; deliveries carry the editorial `decision_ref` + `approved_by` and restate the IO refs
    exactly. Debug loop **EDITORIAL** step (gate has teeth).
  - **Unit tests + CI:** `tests/*.test.mjs` — **92 tests** across deal_engine / ic_memo (approved-evidence-only
    proven to gate coverage, not just citations) / allocation / settlement / auric engine + distribution /
    confidence / profile-assemble / ingest_regulations / registry-service / harness-router; wired into the
    debug loop as a **TESTS** step and into **GitHub Actions CI** (`.github/workflows/ci.yml`) as the commit
    gate (debug loop + `next build`). `npm test` runs the suite.
  - **Observability:** `core/kernel/observability.ts` (pure, generic — no vertical nouns): cost dashboard
    (category/correlation/label) + event replay over the append-only kernel log + `runHealth`; **`/observability`**
    Terminal surface (cost bars + correlated event-replay timeline).
  - **Distribution surface:** **`/distribution`** renders the HELD-vs-APPROVED gate story + every channel
    delivery with lineage / restated refs / visibility. The **`brief` channel** now delivers (a channel-lens
    variant, appended so pre-existing variant ids are unchanged; dropped by `buildFeed` so the ranked feed is
    unchanged) → an approved publication yields **5 deliveries across 3 channels**.
  - **Cleanup:** registry `is_identifier` (non-identifying shared external id no longer proposes a spurious
    duplicate) + merge-liveness/transitive-survivor guards; a router confidence-escalation floating-point fix;
    a **FinCEN** regulation object added to the catalog with SAR/CTR `filed_with_regulator` repointed
    (closed graph holds).
  - **Gate:** debug-loop **ALL GREEN (8/8)** (TYPECHECK · ONTOLOGY · CARTRIDGE · ENGINE · PIPELINE · DATA ·
    EDITORIAL · **TESTS 92/92**) + `tsc` clean + `npm run build` exit 0. Adversarially verified (no blockers).
  - **Now unblocked:** `0016`+`0017` are **applied** (Bryan, 2026-07-21). Sprint II Wave 1 authored the
    Supabase `RegistryPersistencePort` adapter behind the seam (default in-memory; drops in with a client).
    Remaining NON-BLOCKING `DEBUG_LOG` items: FR per-rule SourceDocument attribution; Volume XI label
    reconciliation; an allocation LP-identity reason-label nicety; the transitive re-merge edge (throws).

## Sprint II — Wave 1 (Kernel & Truth platform; target ~55%)
**✅ WAVE 1 — Identity & Tenancy (RFC-2002) + permission engine + registry live-persistence adapter (DONE,
2026-07-21).** `0016`+`0017` applied → the Object Registry live-persistence path is UNBLOCKED. Additive,
new-files-only, pure/deterministic, no vertical nouns in `core/`:
- **`core/kernel/identity.ts`** — portable cross-org identity: `Principal` + per-workspace `Membership`;
  `isMember`/`roleIn`/`hasRole`/`actorString`/`organizationsOf`/`workspacesOf` — the in-process mirror of
  `auth.uid()`/`app_is_member`/`app_has_role`. `service`/`user`/`agent` principal kinds.
- **`core/kernel/permissions.ts`** — a deterministic, plane+visibility-aware authorization core that is a
  faithful mirror of the `0016`/`0017` RLS predicates (`app_can_read_plane`, `app_can_write_tenant`,
  `app_can_admin_object`); `authorize(principal, action, resource)` is the single call a surface makes;
  service-role bypass modeled; every decision carries a machine-readable `reason` (lineage, not a weight).
  Load-bearing invariant reproduced: a shared-market registry merge is service-role-only.
- **`core/registry/supabase-store.ts`** — Supabase adapter for the EXISTING `RegistryPersistencePort` seam
  over the `0017` tables (hybrid hydrate/write-through; PURE row mappers + deterministic id→uuid bridge;
  `registryStore()` defaults to in-memory so the gate is green with no creds). No change to
  `ObjectRegistryService`.
- **Gate:** debug-loop **ALL GREEN (9/9)** (new **PERMISSIONS** step) + `tsc` clean + `npm run build` exit 0 +
  **123 unit tests** (+31). Adversarially verified.

## Sprint II — Wave 2 (Kernel & Truth platform; target ~55%)
**✅ WAVE 2 — Confidence engine drives LIVE profile assembly + a query surface (DONE, 2026-07-22, ~44%).**
Additive, new-files-only, pure/deterministic, no vertical nouns in `core/`. The Confidence Engine (RFC-3008)
now DRIVES profile assembly instead of a fixed 0.9:
- **`core/profile/freshness.ts`** — per-truth-tier half-life policy (durable→volatile) + deterministic
  `ageDaysBetween`/`assessFreshness` (freshness = `decay(1, age, halfLife)`) + fresh/aging/stale bands.
- **`core/profile/assemble_live.ts`** — ADDITIVE wrapper over `assembleProfile`: outcome-feedback (`reinforce`)
  THEN freshness decay (inside `combineSources`); `LiveAssembledProfile` carries `as_of`, per-field
  `field_freshness`, and an `outcome_adjustments` audit surface that persists the outcome evidence source_refs.
- **`core/profile/query.ts`** — deterministic, generic filter/rank/lookup: subject_type / confidence / tier-floor
  / completeness / health / field predicate (numeric + numeric-string, blank-safe) / combined confidence+freshness
  floor; total-order id tiebreak; direction-aware sinking of field-less profiles; explainable `applied` predicates.
- **`cartridges/cooperative_markets/profiles_live.ts`** (+ `scripts/profile-query-demo.ts`) — live
  regulation-environment profile over the REAL 675-section corpus + live institution profiles over the 5300 batch
  (ratios aged from the reporting quarter-end; optional outcomes) → `buildLiveProfiles` feeds `queryProfiles`.
- **Gate:** debug-loop **ALL GREEN (10/10)** (new **PROFILES** step) + `tsc` clean + `npm run build` exit 0 +
  **162 unit tests** (+39). Adversarially verified (4-lens fleet; **0 blockers**; outcome-evidence lineage +
  3 query edge cases + 3 test-teeth gaps fixed). Layers: truth 22→40, cartridge 75→77, tests 46→49.
- **Sprint II Wave 3 — DONE (2026-07-22, ~47%): kernel request envelope + contracts/API layer (RFC-2001/2014).**
  `core/kernel/envelope.ts` (typed **RequestEnvelope**: principal + correlation_id + plane + caller-injected
  occurred_at/request_id/idempotency_key; pure — mints nothing; `deriveEnvelope` keeps the chain correlation id) +
  `core/kernel/contracts.ts` (the **service contracts** surfaces call THROUGH: `authorizeThrough` maps the domain
  verbs review/approve/promote/decide to the permission engine's `app_has_role` predicate; `guard` authorizes FIRST
  and, on deny, returns a typed **Refusal** with the machine-readable reason while the delegate NEVER runs). The
  ad-hoc `core/auth/session::canReview` is **RETIRED at the call sites**: `core/auth/principal.ts` maps the demo
  session → a `Principal`, `app/contracts.ts` + `app/actions.ts` + `components/ReviewQueue.tsx` route the human-gate
  actions through the contract, and `canReview` survives only as a shim whose boolean comes from the engine.
  `cartridges/cooperative_markets/deal_service.ts` wraps the UNCHANGED `runDealPipeline` behind the contract
  (authorize "promote" FIRST; seed `ctx.runId` from the envelope so the run correlates). Human gates (ICApproval +
  EditorialDisposition) untouched. Gate: debug-loop **ALL GREEN (11/11)** (new **CONTRACTS** step) + `tsc` clean +
  `npm run build` exit 0 + **182 unit tests** (+20). Adversarially verified (4-lens; 0 blockers; evidence-review
  wiring gap + 2 test-teeth gaps fixed). Layers: kernel 34→46, harness 18→22, tests 49→51.
- **✅ Sprint II Wave 4 — DONE (2026-07-22, ~50%, Sprint II CLOSED): Object Registry live-persistence client +
  matured entity resolution + profile PERSISTENCE.** Additive, new-files-only in `core/`, pure/deterministic, no
  vertical nouns; the registry service + engines are UNCHANGED; default stays in-memory (gate green with no creds).
  - **`core/registry/governed_registry.ts`** — `GovernedObjectRegistry` wraps the unchanged `ObjectRegistryService`:
    `registerThrough`/`mergeThrough` authorize FIRST via `guard`; a shared-market registry merge is **service-role-only**
    (workspace-null registry object → `app_can_admin_object` grants no authenticated user); each mutation emits an
    envelope-correlated `KernelEvent` + `CostEntry`; a **serialized write-chain** flushes in call order (a merge's flush
    never races the register before it); `drain()` surfaces a flush failure without poisoning the chain.
  - **`core/data/supabase-table-client.ts`** — the one new file importing `@supabase/supabase-js`; a real client adapted
    to the narrow `{upsert,selectAll}` seam; env-gated to null so the gate stays in-memory with no creds.
  - **`core/registry/resolver.ts`** — matured resolution: blocking keys + deterministic name/alias/charter token
    similarity (caller-injected designator stopwords keep `core/` vertical-free), PROPOSE-only, resolving the DEFERRED
    **NO-CLOBBER** note (a reviewed candidate is sticky, never re-proposed).
  - **`core/profile/persistence.ts`** + **`db/migrations/0018_profile_snapshots.sql`** — a `LiveAssembledProfile`
    persists **byte-identically** (canonical-JSON text snapshot) and **plane-aware** (an explicit `ProfileScope` keeps a
    public shared-market profile and a private tenant profile un-conflated) through a seam (in-memory default; Supabase
    adapter when a client is configured), surviving a process boundary with confidence/freshness/lineage intact.
  - **Gate:** debug-loop **ALL GREEN (12/12)** (new **REGISTRY-PERSISTENCE** step) + `tsc` clean + `npm run build` exit 0
    + **214 unit tests** (+32). Adversarially verified (4-lens + focused re-verify) — 1 blocker fixed (plane conflation on
    persistence) + hardened. Layers: kernel 46→55, truth 40→45, tests 51→54, data 87→88; headline ~47→~50%.
  - **Sprint II CLOSED at ~50%** (honest recompute; roadmap caveat #4). **Next: Sprint III — Connectors & scale**
    (`SPRINT_III_KICKOFF_PROMPT.md`).

## Sprint III — Wave 1 (Connectors & scale; target ~68%)
**✅ WAVE 1 — Connector Runtime + SDK (Kernel RFC-2011; Volume IX) OPENS Sprint III (DONE, 2026-07-22, ~54%).**
Additive, new-files-only, pure/deterministic, **no vertical noun in `core/`**; the engines are UNCHANGED;
default stays in-memory + creds-free. A connector is now EXECUTABLE, not a paper manifest:
- **`core/kernel/connector_sdk.ts`** — the typed **Connector Output Contract** (normalized observations,
  entity/relationship candidates, source artifacts, change_events, quality_report, connector_health, run
  metrics), the pure **parser contract**, deterministic FNV hashing, change detection, health bands, and
  `recordToObservation` — the normalize→truth-Observation bridge that tiers a record FROM THE SOURCE
  MANIFEST (connectors NORMALIZE only; no ratio, no conclusion, no tier in connector code).
- **`core/kernel/connector_runtime.ts`** — the generic executor: **authorize FIRST** (shared-market
  ingestion is service-role-only), acquire with **retry → circuit-breaker**, drive the pure parser,
  detect changes (new/updated/deleted/unchanged; a rejection is NEVER a deletion), score quality, derive
  health, emit an envelope-**correlated** KernelEvent + CostEntry. A fault is a `failed` output, not a throw.
- **`core/registry/connectors.ts` + `core/registry/data/connectors.json`** — config-as-data catalog
  (39 sources + 39 connectors across the SOURCE_CATALOG families) + a generic closed-graph loader/validator,
  qualifying the DKR placeholders as DATA (not code forks).
- **`cartridges/cooperative_markets/connectors/{ncua_5300,ncua_regulations}_connector.ts` + `run_connectors.ts`
  + `scripts/connector-demo.ts`** — two REAL connectors THROUGH the runtime: 5300 → normalized → live
  institution profiles PERSISTED (Wave-4 seam, plane-aware) reconciling to source; the REAL 675-section
  12 CFR corpus normalized at scale.
- **Gate:** debug-loop **ALL GREEN (13/13)** (new **CONNECTOR** step) + `tsc` clean + `npm run build` exit 0 +
  **246 unit tests** (+32). Adversarially verified (4-lens) — **1 blocker fixed** (a normalization failure
  fabricated as a deletion) + 3 hardened (vertical-noun leak removed from core; reconcile gate made
  non-vacuous; tier-from-source proven). Layers: connectors 20→45, kernel 55→60, truth 45→47, cartridge
  77→80, tests 54→57; headline **~50% → ~54%** (honest; Sprint-III-end ~68% needs 2–3 more waves).
  **Next: Sprint III Wave 2** — full-market/bulk 5300 at scale (retire `batch_fixtures.ts`) + the
  startup-intake connector into the deal engine + qualify the remaining placeholders
  (`SPRINT_III_WAVE2_KICKOFF_PROMPT.md`).

## Sprint III — Wave 2 (Connectors & scale; target ~68%)
**✅ WAVE 2 — Full-market ingestion at scale + startup-intake → deal engine + catalog growth (DONE,
2026-07-22, ~56%).** Additive, new-files-only, pure/deterministic, **no vertical noun in `core/`**; the
connector runtime + engines are UNCHANGED; default stays in-memory + creds-free:
- **`cartridges/cooperative_markets/bulk_5300_market.ts` + `run_market_ingest.ts`** — a clearly-LABELED,
  deterministic SYNTHETIC bulk market runs the WHOLE credit-union market through the UNCHANGED NCUA 5300
  connector/runtime → institution profiles PERSISTED at scale (plane-aware, reconciling to source; ratios a
  downstream `deterministic_calculation`, tier `public_fact` from the source manifest). `batch_fixtures.ts`
  retired behind the connector as the golden subset. Real per-CU 5300 is Bryan-only (drops in with no code
  change). `marketProvenance.all_labeled` computed from the data (negative-control-proven).
- **`cartridges/cooperative_markets/connectors/startup_intake_connector.ts` + `intake_fixtures.ts` +
  `run_intake.ts`** — the DEFERRED live-intake path CLOSED: the intake connector normalizes submissions
  (`third_party_claim` from the source manifest — a company's own claim, no score/tier in the connector)
  → sourced readiness inputs → the EXISTING deal engine P1/P2 on REAL normalized intake (advance/block/hold
  exercised; memo a DRAFT proposal). ICApproval + EditorialDisposition UNTOUCHED.
- **`cartridges/cooperative_markets/connectors/sec_edgar_connector.ts` + `run_sec_edgar.ts`** — a THIRD real
  connector: EDGAR filing headers → `public_fact` (tier proven with a DIFFERING source); a real
  structural-validation reject path (rejection never a fabricated deletion).
- **`core/registry/data/connectors.json`** — config-as-data catalog qualified **39→57** pairs toward the ~93
  (closed graph, one-connector-per-source; a DATA edit, not a code fork).
- **Gate:** debug-loop **ALL GREEN (13/13)** (CONNECTOR step gains full-market-scale · intake→engine · SEC
  EDGAR tier-from-source · catalog-growth · label-guard negative-control) + `tsc` clean + `npm run build`
  exit 0 + **272 unit tests** (+26). Adversarially verified (4-lens) — 1 major + 1 minor fixed. Layers:
  truth 47→52, harness 22→26, connectors 45→57, cartridge 80→85, tests 57→60; headline **~54% → ~56%**.
  **Next: Sprint III Wave 3** — a real bulk 5300 feed (Bryan) or continued catalog qualification + more real
  connectors (FDIC/SEC-full-text/Federal-Register) + apply `0018` (`SPRINT_III_WAVE3_KICKOFF_PROMPT.md`).
2. **Live intake path** — call-report/startup ingestion so the loop runs on real data, not the
   seed (a real connector over the `ncua_call_reports` / `startup_intake` source types).
3. **Canonical Entity Model + entity resolution (RFC-3002)** and **Identity & Tenancy
   (RFC-2002)** — gated on Bryan applying `0016` + `0017`; then the Object Registry service
   populates `object_match_candidates` + applies merges.

**Also open (Bryan's library):** fold the Institutional Intelligence Library
("fintech venture vendor side," ~22k lines) into the docs set + cross-check vs the ontology;
reconcile its "Volume XI — Agent Intelligence" label against the repo's Volume XI = Canonical
Ontology (ADR-0014).

**Bryan-only (unblock me):** ~~apply `0016` + `0017` in Supabase~~ (**done 2026-07-21**); `git push`; the
investment-vehicle decision; VC/Alloya legal.

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
