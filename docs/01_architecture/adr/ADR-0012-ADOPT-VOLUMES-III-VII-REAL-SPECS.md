# ADR-0012 — Adopt authored Volumes III–VII as specs of record; reconcile against the build

## Status
Accepted — 2026-07-20.

## Context
Authored, full versions of **Volumes III–VII** were supplied (as ADR-0011 did for
the Kernel Volume II), superseding the templated stubs:
- **Volume III — Knowledge Graph & Truth** — 16 RFCs (RFC-3000..3015).
- **Volume IV — Agent Harness** — full spec (`Volume 4.md`).
- **Volume V — Cooperative Markets Cartridge** — full spec (`Volume 5.md`).
- **Volume VI — The Auric Engine** — full spec (`Volume 6.md`).
- **Volume VII — Terminal** — full spec (`Volume 7.md`).

Each was reconciled against the committed build (`core/**`, migrations `0011`–`0016`,
ADR-0004..0011). Framing: the authored volume is authoritative intent — RFC-asks-more
= EXPANSION (build must grow → backlog); CONFLICT only where it contradicts an
already-DECIDED live choice. Vols 3/5/6 had stubs previously reconciled (ADR-0009/0010);
these real versions replace them. Vols 4/7 were greenfield.

## Decision

### 1. Adopt Volumes III–VII as specs of record
Stored under `docs/00_governance/constitution/volumes/`: `knowledge_graph/` (16
RFCs), `agent_harness/`, `cooperative_markets/`, `auric_engine/`, `terminal/`. The
old `VOLUME_3/4/5/6/7_*_SPEC.md` stubs are replaced with pointers. Authority order
unchanged. **With Volume II (ADR-0011), the entire Specification Program (Vols I–X)
is now reconciled/adopted.**

### 2. Strongly aligned; overwhelmingly EXPANSION; no code churn
The committed assertion family + provenance/temporal envelope, relationships-as-
first-class, intelligence-object/content-variant contracts, plane/visibility + the
`0016` RLS, and config-as-data all satisfy the specs. No `core/` contract or applied
migration changes as a result of this ADR; all volume work is additive-forward.

### 3. Fact model (RFC-3006 Fact Service) — projection now, fact-ingestion tables later
RFC-3006 asks for Fact as a first-class stored object. **Decision: keep the committed
assertion-family + `TruthTier` model (ADR-0005/0007 intact); expose "Fact" as a
derived projection / materialized view over verified-tier assertions + their
`Verification` objects**, satisfying RFC-3006's fact-versioning / history / dispute
semantics on top of that projection. No `facts` base table now; no re-plumbing.
**Forward architecture directive (Bryan):** design toward relational tables that
**ingest and materialize facts from multiple sources** — i.e. a materialized fact
store fed by the assertion family + external source ingestion — to be built with the
Volume III truth engine. Recorded as a roadmap item, not built now.

### 4. Reconciliations (keep canonical live model; adopt RFC concepts additively)
- **Canonical Entity Model (RFC-3002) — the bridge item.** Build the entity-
  resolution layer (`entities` canonical naming + `entity_aliases` + external ids +
  dedup/merge/split), and **relax `entities.workspace_id` to nullable + add
  `plane`/`visibility`** so canonical shared-market entities (institutions,
  executives) can exist — mirroring how `sources` was relaxed in `0011`; additive,
  consistent with ADR-0004. Closes the ADR-0009 entity-resolution HIGH gap; overlaps
  kernel Object Registry (RFC-2003).
- **Public/Private graph (RFC-3013).** Its per-scope "graph tables" are **logical
  views** over the ADR-0004 unified plane-aware tables (a `visibility` filter), NOT
  physical tables — do not fork the schema. Adds an **ownership** dimension
  (independent of visibility) and a **sharing/promotion** workflow as expansions.
- **"Context Pack" term collision.** RFC-3010's assembled working-graph payload for
  model execution is distinct from the governance "context pack" (docs). Disambiguate
  names before building (e.g. `ExecutionContextPack`).
- **Vol IV routing ladder & risk taxonomy.** Reconcile the harness ladder to the
  **canonical 9-rung** (Constitution Art. 18 / ADR-0011); amend
  `MODEL_HARNESS_ARCHITECTURE.md` (its 5-rung) to match. Keep the committed 3-value
  `RiskLevel` now; map RFC-4002/4012's finer risk/severity levels onto it and revisit
  at harness build (widening `RiskLevel` would break the "high never auto-promoted"
  gate). Model Router / Prompt Registry / cost ledger are **kernel** (RFC-2013/2008) —
  filed there, not double-counted as harness work.
- **Vol V (Cooperative Markets).** Verticals stay **cartridge entities**, never core
  tables (its "Required Tables" are cartridge-scoped `entity_type` + `context` +
  truth objects). Keep `cooperative_markets:credit_union`; "Institution" is a display
  label / possible supertype (charter_type discriminator), not a core noun.
  `executive` = core `PersonalProfile` + `cooperative_markets:executive` extension
  (no parallel person table). Registry gaps to fill: add a reserved
  `cooperative_markets:vendor` entity, and author the `call_report` / `regulation`
  schemas (regulated ingestion must persist evidence/source/lineage — never
  conclusions in model weights).
- **Vol VI (Auric).** No conflicts, no ADR reopens; the `person` lens is vindicated.
  Additive-only: channel-set breadth (Slack/Teams/SMS/…), the surface-vs-transport
  channel modeling question, and any first-class Executive/Industry lens — each its
  own future ADR when the publication engine is built.
- **Vol VII (Terminal).** Rename the UI **"Workspace"** concept (Vol 7's disposable
  per-objective UI context) to avoid collision with the committed durable tenant
  `Workspace` (load-bearing in RLS) — e.g. "Session" / "Objective Space". The Object
  Explorer is a **projection** over existing primitives, not a new universal `objects`
  table (would reopen ADR-0004). All Terminal runtime/UI tables live in a `terminal/`
  layer, **never `core/`**. Terminal API = a facade over kernel RFC-2014; Feed =
  Vol VI; Search/Nav = Vol III — Terminal consumes, does not re-file.

### 5. Doc-map errata (spec cleanup, non-blocking)
Vols VI and VII each carry an internal RFC-map inconsistency (the standalone Volume
Overview numbering differs from the body's section numbering). Reconcile the numbering
in the source docs; non-blocking.

## Consequences
- The Specification Program is fully reconciled/adopted (Vols I–X). The forward work
  is a large, multi-volume **build** backlog (see `ACTIVE_BUILD.md`), not more
  reconciliation.
- **Entity resolution + plane-aware entities** (RFC-3002) is the highest-leverage
  bridge item — it unblocks the truth graph, profiles, and the cooperative_markets
  cartridge, and is shared with the kernel Object Registry (ADR-0011 #4).
- Fact stays a projection; a multi-source materialized fact store is on the Volume III
  roadmap.
- No `core/` or applied-migration change; RLS `0016` remains the enforcement layer.
