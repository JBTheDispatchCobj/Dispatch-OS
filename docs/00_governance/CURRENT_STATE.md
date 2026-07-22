# Current State

## Running now (Olympic Sprint IV — Wave 3, ~63%, 2026-07-22) — FINISH THE TERMINAL RUNTIME (notification + task center) + 2 more scaffolds PROMOTED to REAL surfaces
**Sprint IV continues (Terminal & product surface complete, target ~80%).** Wave 3 builds the Terminal-runtime
attention layer that was still missing and promotes two more of the highest-value FRAMED scaffolds to real surfaces.
Additive; **no vertical noun in `core/`** (new pure builders in `app/_surfaces/`; only `ui_surfaces.json` config-as-data
+ the coop `seed.ts` report fixtures + `app/page.tsx` changed); connector runtime + engines + human-gate contract layer
UNCHANGED; default in-memory; look/feel deferred. Shipped:

- **THE TERMINAL RUNTIME — a NOTIFICATION + TASK CENTER (Vol VII).** `app/_surfaces/activity_center.ts` (pure,
  deterministic, erasable-only) is a READ-ONLY projection over the LIVE queues: **notifications** = the acts owed
  (a `requested` Approval → /approvals; a blocked/rejected WorkItem → /workflows; an unreviewed EvidenceItem →
  /evidence) and **tasks** = open (non-terminal) work items. Every notification carries an `href` to the
  permission-engine surface that RESOLVES it; **nothing is decided, reviewed, shared, or transitioned here** — the
  center can never be a hidden control. States kept visibly distinct: **pending_approval** (gate owed) · **conflicted**
  (stuck) · **stale** (an aged unreviewed observation) · with **restricted** carried on regulated approvals. It reuses
  the proven doctrine helpers (`ageDaysBetween`, `isRestrictedApprovalType`) as a single source of truth. Wired onto the
  **Home command center** (`app/page.tsx`) above the existing workspace grid via the presentational
  `components/terminal/ActivityCenterView.tsx` (server component; no client bundle).
- **`/reports` (scaffold→live)** — `app/_surfaces/reports_view.ts` (pure) projects the live `ReportRun` objects and
  joins each to its **report-sharing editorial gate** (the report-lifecycle realization of the EditorialDisposition
  family): a report is **pending_approval** while `under_review` or while a `requested` `report_sharing` Approval is
  linked (by `metadata.report_id`); **stale** by age OR recorded missing-data gaps (shown, never hidden); a `draft` is
  **restricted** (internal-only, not cleared for sharing); cleared+fresh is **current**. It NEVER shares — the decision
  is a `report_sharing` Approval taken on /approvals. Seeded 4 real reports + 1 requested share approval in the coop
  cartridge so the surface renders its full legend over live data.
- **`/cartridges` (scaffold→live)** — `app/_surfaces/cartridges_view.ts` (pure) is the installed-capability manifest
  over the 5 live PackagedConfigurations: per-collection counts (entity types / workflows / rules / metrics / reports /
  checklists / dashboards / knowledge / source types / agent prompts / approval rules), the total surface area, and
  which workspaces run each. **current** = installed + operating (status active); **restricted** = installed but not
  operating. Read-only — it never installs, enables, or edits a configuration. The core primitive is a "packaged
  configuration"; the vertical lives only in the DATA each declares.

`ui_surfaces.json` flipped the two surfaces scaffold→live (16→**18 live / 5 scaffold**; `/reports` states gained
`pending_approval`, `/cartridges` gained `restricted`). New **ACTIVITY + REPORTS + CARTRIDGES** debug steps (**25/25**,
each with negative-control teeth) + 15 unit tests (**363**). Adversarially verified (4-lens, parallel): purity +
truth-doctrine clean; 1 correctness fix (Home open-count excludes `canceled`); 3 test-teeth gaps hardened. Look/feel
deferred (Terminal polish sprint). The **biggest remaining Terminal gap**: `/executives` + `/relationships` need a
store read + SEED first (no `Relationship`/`PersonalProfile` list accessor/seed yet), plus the window/layout shell,
dashboard-runtime generalization, and /collaboration + /administration + /personas.

### Canon adopted this session (reference only — no build change) — FS-15000 market-facing canon (ADR-0018)
The externally-authored **FS-15000 "Market-Facing Institutional Network V1"** package (15 sections: the Auric
publication-of-record, Named Terminals, public/claimed/verified profiles, readiness journeys, governed engagement,
the relationship graph, matching, editorial integrity, the network flywheel, a product charter) was adopted as
**reference/operational canon** at `docs/06_external_canon/FS-15000/` — the market-facing sequel to the FS-4000…14000
operating-system canon (ADR-0017). Section-by-section review: **doctrinal ALIGNMENT, zero contract conflicts**; the FS
brand hierarchy / provenance / human-gate / editorial-separation doctrine restates what the repo already enforces. The
one disposition (ADR-0018 §2): FS-15015 self-declares "Product Constitution / immutable" and omits Vol I from its
hierarchy — adopted as **operational doctrine SUBORDINATE to the Dispatch Constitution (Vol I)**; charter amendments
flow through the repo ADR process. **No code/contract/registry/`ui_surfaces.json` changed** — additive docs + the ADR.
Wave-4 pull-ins: **FS-15005 (profiles) + FS-15011 (relationships)** are the spec for the `/relationships` + `/executives`
store gap. Crosswalk: `docs/06_external_canon/FS-15000/FS-15000_CANON_INTEGRATION.md`. Build % unchanged (~63% — canon
is a map, not shipped product).

## Prior (Olympic Sprint IV — Wave 2, ~62%, 2026-07-22) — THE TERMINAL RUNTIME + 3 more scaffolds PROMOTED to REAL surfaces
**Sprint IV continues (Terminal & product surface complete, target ~80%).** Wave 2 builds the operating-environment
shell the product was missing (Vol VII) and promotes three more of the highest-value FRAMED scaffolds to real surfaces
over live run output. Additive; **no vertical noun in `core/`** (the new pure builders live in `app/_surfaces/`, the
runner in `cartridges/`; only `ui_surfaces.json` config-as-data + `app/layout.tsx` + `app/globals.css` changed); the
connector runtime + engines + human-gate contract layer are UNCHANGED; default in-memory; look/feel deferred. Shipped:

- **THE TERMINAL RUNTIME — a registry-driven COMMAND PALETTE + UNIVERSAL SEARCH.** `app/_surfaces/universal_search.ts`
  (pure, deterministic, erasable-only) builds a universal-search INDEX + a total-order MATCHER over three live
  collections — the `/institutions` directory rows, the UI surface registry, and the external-canon aliases — with the
  doctrine states kept **visibly distinct**: an institution row is **synthetic** (figures never presentable as real), a
  LIVE surface is **current**, a SCAFFOLD surface / a PROPOSED (unconfirmed) canon alias is **restricted** (framed /
  not authoritative), and a no-match query is **missing** (an honest empty state, never a fabricated hit).
  `components/terminal/TerminalShell.tsx` mounts a global **command palette** (⌘K / Ctrl-K) once in `app/layout.tsx`,
  driven ENTIRELY from `ui_surfaces.json` — every surface is a keyboard-navigable jump target, and a new surface appears
  in the palette with NO code change; a free-text query hands off to `/search`. Pure navigation — never mutates/decides.
- **`/search` — the universal-search surface (scaffold→live).** `app/search/page.tsx` builds the index server-side from
  the live collections; `SearchView.tsx` ranks with `searchUniverse` and reads `?q=` client-side so the page stays
  statically prerenderable. Ranked, deterministic; the state legend is intact on every result row.
- **`/opportunities` — REAL over the deal engine (scaffold→live).** `app/_surfaces/opportunities_view.ts` (pure) +
  `cartridges/cooperative_markets/run_opportunities.ts` run the UNCHANGED intake → deal-engine path over labeled intake
  fixtures. Every score is a **Dispatch inference** (tier `dispatch_inference`), NEVER a fact and never a regulated
  conclusion in a weight; the engine only RECOMMENDS — advancing an opportunity to allocation requires the **ICApproval
  human gate** (proven by the pipeline: an unapproved deal halts `awaiting_approval`, allocating/settling/publishing
  nothing), so a recommended-advance opportunity is **pending_approval**, NEVER auto-advanced to **current**; a blocked
  deal is **conflicted**. A triage surface with NO auto-advance control (the decision is the committee's).
- **`/workflows` — REAL over the live work-item queue (scaffold→live).** `app/_surfaces/workflows_view.ts` (pure)
  groups the store's `WorkItem` objects by workflow `kind`, joins each group to its cartridge WORKFLOW DEFINITION
  (config-as-data — label / owner / whether it requires an approval), rolls up status, and cross-references the live
  `Approval` objects by `related_work_item_id`. States distinct: **pending_approval** (a human gate owed) /
  **conflicted** (blocked/rejected) / **current**; a kind with NO definition is flagged **unmapped** (never silently
  mis-attached); the builder NEVER decides a gate — decisions route through the existing permission-engine surfaces.
- **Gate**: `node scripts/debug-loop.mjs` **ALL GREEN 22/22** (new **SEARCH · OPPORTUNITIES · WORKFLOWS** steps — each
  asserts renders-over-real-data · states distinct · human-gate-never-auto-decide · deterministic, with negative-control
  teeth) · `tsc --noEmit` clean · `npm run build` exit 0 (26/26 routes prerender; the 3 promoted surfaces STATIC) ·
  **348 unit tests** (+16). Adversarially self-reviewed (4-lens; 0 blockers). There are now **16 REAL Terminal surfaces**
  (adds `/search`, `/opportunities`, `/workflows`) + a registry-driven command palette + **7 framed scaffolds**.
**Bryan-only (route around):** git push · apply 0018 · a real bulk 5300 feed · investment-vehicle decision · VC/Alloya legal.

## Running now (Olympic Sprint IV — Wave 1, ~61%, 2026-07-22) — 3 scaffolds PROMOTED to REAL surfaces over live data
**Sprint IV opens (Terminal & product surface complete, target ~80%).** Wave 1 turns three of the highest-value
FRAMED scaffolds into REAL surfaces over live run output, using `ui_surfaces.json` as the contract. Additive,
new-files-mostly, no vertical noun in `core/`; the connector runtime + engines + the human-gate contract layer are
UNCHANGED; default in-memory. Look/feel still deferred (reused the existing design tokens). What shipped:

- **`/institutions` — a REAL directory over the full market.** `cartridges/cooperative_markets/run_institutions_directory.ts`
  (pure, deterministic, erasable-only) itemizes the whole synthetic market into browse rows — the five 5300 ratios
  (deterministic calcs citing each filing), an asset band + PCA readiness band, profile confidence marked **inferred**,
  and **REGION surfaced as `missing`** (not sourced from a 5300 → shown, NEVER faked — the doctrine "show missing,
  never fabricate" rule made visible on a real surface). `components/terminal/InstitutionsDirectoryView.tsx` renders
  search / filter (readiness · asset-band · label) / total-order sort; each row opens that institution's `/terminal`.
  Scales one→thousands. Figures stay **LABELED synthetic** (`all_labeled` computed from data); a real bulk 5300 feed is
  Bryan-only. The shared pure `queryDirectory` (filter+sort) is what both the screen and the tests run.
- **`/approvals` — the LIVE human approval gate.** `app/_surfaces/approvals_view.ts` (pure, generic, store-free) buckets
  the store's `Approval` objects into **awaiting vs decided** with lineage (the work item / decision / proposal each
  governs) and the doctrine states pending_approval / **restricted** (regulated capital/compliance/lending/sharing
  types — owner/admin-only) / current. `components/terminal/ApprovalsView.tsx` renders the queue; approve / request-
  changes / reject post to the EXISTING `decideApprovalAction`, which routes THROUGH `app/contracts.decideApproval` →
  `core/kernel/permissions` (authorize-FIRST). The builder NEVER decides — only a `requested` approval is `decidable`.
- **`/evidence` — LIVE provenance with drill-through.** `app/_surfaces/evidence_view.ts` (pure, generic) projects the
  evidence attached to every work item into lineage rows (the object it supports, who captured it, when, the value
  keys) with the states current / **stale** (past its freshness window, aged from `created_at`→`as_of`) / **inferred**
  (agent-captured — a Dispatch inference, not a fact) / pending_approval / **restricted** (source-document-backed),
  each visibly distinct. `components/terminal/EvidenceView.tsx` groups by object / by source / unreviewed; approve /
  reject routes THROUGH `app/contracts.reviewEvidence` (authorize "review"). NEVER auto-reviews.
- **Additive demo fixtures.** The coop seed gained ONE pending high-risk approval + ONE unreviewed/old/agent-captured
  evidence item so the live gates render their full state legend over REAL store data (no test pins seed counts).
- **Gate**: `node scripts/debug-loop.mjs` **ALL GREEN 19/19** (new **INSTITUTIONS · APPROVALS · EVIDENCE** steps —
  each asserts renders-over-real-data · human-gate-intact/never-auto-decide · missing/stale/inferred/synthetic/pending
  states distinct · deterministic) · `tsc --noEmit` clean · `npm run build` exit 0 (26/26 routes prerender; the 3
  promoted surfaces are STATIC) · **332 unit tests** (+24). Real bulk 5300 NOT staged → the full market stays LABELED
  synthetic (stated on-surface). Adversarially verified (4-lens fleet). There are now **13 REAL Terminal surfaces**
  (`/`, `/terminal`, `/institutions`, `/market`, `/work`, `/proposals`, `/approvals`, `/evidence`, `/review`,
  `/network`, `/dashboard`, `/observability`, `/distribution`) + **10 framed scaffolds**.
**Bryan-only (route around):** git push · apply 0018 · a real bulk 5300 feed · investment-vehicle decision · VC/Alloya legal.

## Running now (Olympic Sprint III — Wave 5, ~60%, 2026-07-22) — the WHOLE product UI FRAMED + the JOINT /network surface
Wave 5 reframed (Bryan's steer): rather than co-designing one polished Terminal surface, **frame the ENTIRE product's UI**
as placeholders/wireframes/scaffolding so the product is complete end-to-end, and defer all look/feel/flow/cadence to a
later polish sprint (aligns with CLAUDE.md: "UI follows the domain and data contracts — do not optimize visual design
before core contracts stabilize"). What shipped, additive + new-files-only, no vertical noun in `core/`:

- **UI surface registry (config-as-data)** — `core/registry/data/ui_surfaces.json` declares the whole FS-10000 Terminal
  IA as **23 surfaces** (10 live, 13 scaffold) across 11 nav sections; each surface names its primary object, planned
  tabs/commands, human gates, and the doctrine **state legend** it must render distinctly (current/missing/stale/
  inferred/synthetic/restricted/pending_approval/conflicted). Generic loader `core/registry/ui_surfaces.ts`
  (closed-graph validated: unique routes · sections resolve · state vocabulary enforced; pure; names no vertical).
- **ScaffoldView + scaffold pages** — a reusable `components/terminal/ScaffoldView.tsx` renders each `scaffold` route as
  a framed wireframe; a page per scaffold route (`app/{institutions,executives,relationships,opportunities,workflows,
  evidence,approvals,search,reports,collaboration,cartridges,personas,administration}/page.tsx`) was generated from the
  registry. `app/layout.tsx` renders the nav FROM the registry (grouped by section; scaffolds dimmed + tagged), so the
  whole product is reachable from any page.
- **The JOINT `/network` surface (the one real surface)** — `app/network/page.tsx` + `components/terminal/NetworkView.tsx`
  over `cartridges/cooperative_markets/run_network_surface.ts`, **review-queue-FIRST** (Bryan's pick): the PROPOSE-ONLY
  review queue leads — cross-source entity duplicates (`run_registry_candidates`) + external-canon alias proposals (the
  canon seam), each confirm/reject, **`merged_count` = 0**, NEVER an auto-merge — above the full-market institution list
  (LABELED synthetic; `all_labeled` computed from the data and shown; a real bulk 5300 feed stays a Bryan-only item).
- **CANON grown 5→15 aliases** (`canon_aliases.json`): +2 confirmed FS-8000 sources (`SRC-CFPB-REGS`,
  `SRC-FDIC-FAILED-BANKS`) liveness-checked to live connector sources; +8 FS-5100 registry ids
  (workflow/agent/event/evidence/approval/kpi) left **proposed** (doc-grade, identity-not-authority — surfaced in the
  /network queue). **CATALOG grown 73→93** config-as-data source+connector manifests (closed graph).
- **Gate**: `node scripts/debug-loop.mjs` **ALL GREEN 16/16** (new **UI-SURFACES** + **NETWORK** steps) · `tsc --noEmit`
  clean · `npm run build` exit 0 (all 26 routes prerender incl `/network` + 13 scaffolds) · **308 unit tests** (+10).
  Adversarially verified (4-lens). A latent prerender blocker was caught + fixed: the registry loaders located their JSON
  via `fileURLToPath(new URL(...))`, which a bundler hands a non-node URL — `/network` was the first prerendered page to
  load the catalog/canon; the three loaders now read via `process.cwd()`. The connector RUNTIME is untouched.

There are now **6 real Terminal surfaces** (`/terminal`, `/market`, `/network`, `/distribution`, `/observability`,
`/dashboard`) plus **13 framed scaffolds** and the live human-gate surfaces (`/work`, `/proposals`, `/review`).
**Bryan-only (route around):** git push · apply 0018 · a real bulk 5300 feed · investment-vehicle decision · VC/Alloya legal.

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

## Running now (Olympic Sprint III — Wave 2, ~56%, 2026-07-22)
**The network runs on BREADTH + SCALE: the whole market ingests at scale, the deal engine runs
on live intake, and the catalog is qualified toward the ~93.** Wave 2 is additive, new-files-only,
pure/deterministic, **no vertical noun in `core/`**; the connector runtime + engines are UNCHANGED;
the default stays in-memory + creds-free:
- **Full-market NCUA 5300 at scale.** `cartridges/cooperative_markets/bulk_5300_market.ts` generates a
  clearly-LABELED, deterministic (index-seeded; no clock/random) SYNTHETIC bulk market
  (`sourcedoc:ncua:5300:synthetic:*`), composing the 7 golden `batch_fixtures` as a labeled subset
  (`batch_fixtures.ts` RETIRED behind the connector). `run_market_ingest.ts` runs the WHOLE market
  through the UNCHANGED `runNcua5300` → institution profiles PERSISTED at scale through the profile seam,
  plane-aware (shared_market/public), reconciling to the connector source refs; the five ratios stay a
  downstream `deterministic_calculation` (never a weight), tier `public_fact` FROM THE SOURCE MANIFEST.
  Real per-CU 5300 data is Bryan-only — it drops in with NO code change (only the injected `acquire`
  batch changes); the SCALE path is proven HONESTLY on labeled synthetic data (`marketProvenance.all_labeled`
  is computed from the data with a negative-control guard, so the synthetic-label invariant has teeth).
- **Startup-intake → the deal engine (the DEFERRED live-intake path, CLOSED).**
  `connectors/startup_intake_connector.ts` NORMALIZES a submission (self-reported signals verbatim; no
  score, no tier, no gate) through the runtime; `recordToObservation` tiers it `third_party_claim` from the
  source manifest — a company's OWN claim, never a fact and never a score in the connector. `run_intake.ts`
  materializes the normalized intake into the deal engine's `SourcedInput`s (each citing the submission) →
  the EXISTING P1 scoring + P2 IC memo run on REAL normalized intake (advance / block / hold all exercised;
  the memo stays a DRAFT proposal). The human gates (ICApproval + EditorialDisposition) are UNTOUCHED.
- **SEC EDGAR — a THIRD real connector.** `connectors/sec_edgar_connector.ts` + `run_sec_edgar.ts` normalize
  EDGAR filing headers (accession key, CIK entity) → `public_fact` (tier proven with a DIFFERING source, not
  a tautology); `parseEdgarFiling` has a real structural-validation reject path (blank accession/CIK → a
  reported rejection, NEVER a fabricated deletion).
- **Catalog qualified 39→57 (config-as-data).** `core/registry/data/connectors.json` grew by 18
  source/connector pairs toward the ~93 (CFPB, FDIC, Federal Reserve, OFAC, FinCEN, Federal Register,
  CA/TX/NY CU regulators, SEC full-text/FINRA, IRS 990, USPTO trademarks, G2, SOC2/trust, status pages,
  Crunchbase) — closed graph, one-connector-per-source; a DATA edit, not a code fork.
Gate: **debug-loop ALL GREEN (13/13)** (CONNECTOR step gains full-market-scale · intake→engine · SEC EDGAR
tier-from-source · catalog-growth · label-guard negative-control) + `tsc` clean + `npm run build` exit 0 +
**272 unit tests** (was 246; +26). Adversarially verified (4-lens) — **1 major fixed** (the SEC EDGAR
rejection test drove a hand-rolled stub, not the real connector; `parseEdgarFiling` given a genuine reject
path + the test driven through the real connector) + **1 minor fixed** (`all_labeled` computed from data +
a negative control). Layers: **truth 47→52, harness 22→26, connectors 45→57, cartridge 80→85, tests
57→60**; headline **~54% → ~56%** (honest re-baseline; the Sprint-III-end ~68% still needs the real bulk
5300 feed, full catalog qualification 57→~93, and more — the SCALE + intake MECHANISMS are proven, the
5300 figures are labeled synthetic).

## Running now (Olympic Sprint III — Wave 3, ~58%, 2026-07-22)
**Two more REAL connectors + normalized connector output now feeds the Object Registry
(propose-only) + the catalog is qualified 57→73.** Wave 3 is additive, new-files-only,
pure/deterministic, **no vertical noun in `core/`**; the connector runtime + engines are
UNCHANGED; the default stays in-memory + creds-free:
- **FDIC BankFind — a real connector.** `connectors/fdic_bankfind_connector.ts` +
  `run_fdic_bankfind.ts` normalize FDIC-insured **institution** metadata (CERT, name,
  location, active flag, assets) → `public_fact` FROM THE SOURCE MANIFEST (tier proven with
  a DIFFERING source). FDIC banks are classed **`entity:coop_markets:financial_institution`**
  — a bank is NEVER mislabeled a credit union (the catalog manifest was corrected to match).
  A real structural reject path (blank CERT/name → a reported rejection, never a fabricated
  deletion).
- **Federal Register — a real connector.** `connectors/federal_register_connector.ts` +
  `run_federal_register.ts` normalize rule/proposed-rule/notice **headers** (document number,
  title, agencies, dates) → `public_fact` from the source; each surfaces as a **regulation**
  candidate. The connector draws NO regulatory conclusion (that stays a human-gated act).
- **Connector candidates → the Object Registry (the SECOND live surface, propose-only).**
  A GENERIC core seam `core/registry/candidate_bridge.ts` (`candidatesToObjectInputs` — no
  vertical noun; plane/visibility taken FROM the injected source scope, never guessed) maps a
  connector `EntityCandidate` → a `CanonicalObjectInput`. `run_registry_candidates.ts` runs
  the SEC EDGAR connector (a company in a **public** filing) and the startup-intake connector
  (the SAME company in a **private** submission) through the runtime, bridges the surfaced
  candidates into the registry, and the matured resolver **PROPOSES the 3 cross-source
  duplicates** (Halcyon/Meridian/Cobalt — differing legal names, matched on normalized-name
  similarity after injected corporate-designator stopwords) for HUMAN review. Nothing
  auto-merges; the review queue is the gate; the no-clobber rule holds (a reviewed pair is
  sticky). Objects carry their source's plane/visibility (EDGAR `public` vs intake `network`).
- **Catalog qualified 57→73 (config-as-data).** `core/registry/data/connectors.json` grew by
  16 real public source/connector pairs toward the ~93 (NMLS, FFIEC CDR, GLEIF LEI, Fed NIC,
  FDIC failed-bank list, USAspending, Congress.gov, Regulations.gov, GovInfo, OCC, FTC,
  Treasury FiscalData, ProPublica Nonprofit, Product Hunt, StackShare, BuiltWith) — closed
  graph, one-connector-per-source, honest authority→tier mappings; a DATA edit, not a fork.
Gate: **debug-loop ALL GREEN (13/13)** (the CONNECTOR step gains FDIC · Federal Register ·
connector-candidates→registry propose-only · catalog-73 · plane/visibility-from-source) +
`tsc` clean + `npm run build` exit 0 + **290 unit tests** (was 272; +18). Adversarially
verified (4-lens fleet + a focused re-verify) — **1 MAJOR fixed** (a previously-seen record
that failed validation on a valid key was fabricated as a **deletion** across all real
connectors — the load-bearing "a rejection is never a deletion" rule; fixed by recovering the
change-key on rejection so the runtime's `alsoPresentRefs` guard protects it, + regression
tests with teeth on all three throw-path connectors) + **1 minor** (a vacuous reconciliation
flag given store-round-trip teeth) + test-teeth hardening. Layers: connectors 57→64, truth
52→55, harness 26→28, kernel 60→61, cartridge 85→86, tests 60→63; headline **~56% → ~58%**
(HONEST: the Sprint-III-end ~68% still needs the REAL bulk 5300 feed — Bryan-only, NOT landed,
so full-market 5300 stays LABELED synthetic — full catalog qualification 73→~93, and a
Terminal surface).

## Running now (Olympic Sprint III — Wave 4, ~59%, 2026-07-22)
**The external FS / Dispatch-Auric V1 canon is woven in as an operational layer — a
canon reconciliation seam that reconciles IDENTITY, never authority.** An externally-
authored, documentation-complete V1 product spec (11 FS sections FS-4000…FS-14000, 636
artifacts; the package itself marks content APPROVED, implementation NOT_ASSESSED,
production NOT_APPROVED) is adopted as a REFERENCE / operational canon rather than a
competing build spec. Additive, new-files-only, pure/deterministic, **no vertical noun in
`core/`**; the connector runtime + engines are UNCHANGED:
- **`core/registry/canon.ts`** — a generic seam that reconciles incoming external
  identifiers (FS `OBJ.CREDITUNION`, `SRC-NCUA-CALL`) to the repo's LIVE canonical ids
  (`entity:coop_markets:credit_union`, `source:ncua_5300_call_report`). PROPOSE-ONLY +
  NO-CLOBBER (mirrors the entity resolver): an unseen id is proposed by deterministic
  token similarity (prefix-strip + Jaccard), never auto-merged; a human-confirmed alias is
  sticky. CLOSED-GRAPH validated (a `verify`-flagged alias's canonical must resolve to a
  live repo key; no incoming confirmed to two canonicals). AUTHORITY PRECEDENCE
  `live_code > confirmed_alias > fs_5100 > fs_8000 > fs_section > new_input` resolves the
  canonical LABEL only — **identity is reconciled, authority is not.**
- **`core/registry/data/canon_aliases.json`** — config-as-data crosswalk grounded in the
  REAL FS-5100/FS-8000 identifiers: `SRC-NCUA-CALL`/`SRC-FDIC-BANKFIND`/`SRC-SEC-EDGAR`
  confirmed (and `verify`-checked) to the live connector sources; `OBJ.CREDITUNION`
  confirmed; the broader `OBJ.INSTITUTION` left **proposed** on purpose (a label match is
  not a semantic merge). Section map FS-####→repo module for the doc crosswalk.
- **`ADR-0017`** records the adoption: reference/operational canon, identity-not-authority,
  the precedence order, and the rule that **repo wave order leads** (the FS section is
  pulled in per wave as reference; the package's "document everything first" order does not
  drive the build).
Gate: **debug-loop ALL GREEN (14/14)** (new **CANON** step: closed-graph + verified-alias-
live · confirmed-alias memory · unseen id PROPOSED not merged · no-clobber · authority
precedence · identity-not-authority) + `tsc` clean + `npm run build` exit 0 + **297 unit
tests** (was 290; +7). Adversarially self-reviewed — a stopword over-drop (dropping body
words like "report") caught + fixed (prefix-strip, not global drop) + a vertical-namespace
default pulled out of `core/` (caller-injected, like the resolver). Layers: kernel 61→62,
truth 55→57, tests 63→65; headline **~58% → ~59%** (an architecture/governance wave — small
build delta by design; the FS canon is now weave-able per wave, and the **Terminal UI is the
next, JOINT build**).

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
