# ADR-0009 — Reconcile Specification Program Volumes 3, 8, 9 against the committed build

## Status
Accepted — 2026-07-20.

## Context
Volumes 2–10 of the Specification Program were filed under
`docs/00_governance/constitution/volumes/` (ADR-0008) but not yet reconciled
against the committed build. Volumes **3 (Knowledge Graph & Truth)**,
**8 (Connector Registry & Acquisition)**, and **9 (Object Registry)** are the
priority set because they touch code already applied to Supabase. One
reconciliation agent per volume compared each spec against the committed
contracts, the applied migrations, the governing ADRs, and — for Vol 8/9 — the
live Dispatch Knowledge Registry (DKR) store:

- Vol 3 vs `core/truth/types.ts`, migration `0011`, ADR-0004/0005/0007/0008.
- Vol 8 vs `core/registry/types.ts`, migration `0015`, `DISPATCH_KNOWLEDGE_REGISTRY.md`,
  ADR-0006, and the live DKR (`connectors/`, `sources/`, `discovery/`).
- Vol 9 vs `core/types.ts`, `core/cartridge.ts`, `core/registry/types.ts`,
  ADR-0004, and the live DKR `objects/MASTER_OBJECT_REGISTRY.md`.

## Decision
1. **No genuine conflicts. The committed build governs.** None of the three
   volumes surfaces a principle the committed build violates. Every divergence is
   an **erratum in the volume** — the volume is stale or generic against a build
   that is already decided, richer, and live. Consistent with ADR-0007/0008, no
   `core/` contract or migration changes.

2. **The volumes' per-section "Reference Contracts" are non-normative
   scaffolding.** Vols 3/8/9 each repeat one identical boilerplate contract
   (`{ id, version: string, tenantId?, status: "draft"|"active"|"suspended"|"retired",
   sourceRefs, confidence?, createdAt, updatedAt, metadata }`) across ~20 sections.
   This is template placeholder, not a designed alternative. Where it differs from
   the committed conventions it is superseded by them: numeric `version`;
   `organization_id` + nullable `workspace_id` (ADR-0004), not `tenantId`; the
   committed per-object status enums (`LifecycleStatus`, `RegistryStatus`, …); and
   mandatory `plane`/`visibility` on shared-graph objects (ADR-0004).

3. **Errata are catalogued here and fixed in the source volumes later** (deferred,
   non-blocking), fixed as each volume's build work reaches it — mirroring the
   ADR-0008 "V1.1 errata" treatment. See the errata list below.

4. **Gaps become forward backlog** in `ACTIVE_BUILD.md`, grouped by volume. These
   are net-new build work the reconciliation surfaced, not conflicts.

## Volume errata (fix in the source docs; non-blocking)

**Volume 3 — Knowledge Graph & Truth**
- The "truth state machine" (`observation → claim → corroborated claim → fact`;
  `inference → recommendation`) conflates *kind of assertion* with *grade*. The
  canonical model is a 7-value `TruthTier` grade axis (ADR-0005/0007) on a separate
  `truth_kind` axis. `corroborated claim` → a `Verification` + `derived_from_ids`;
  `fact` → a `*_verified_fact`/`public_fact` tier reached via a `Verification`;
  `recommendation` → **not a tier**, an `IntelligenceObject`/`ContentVariant`.
  (Independently confirmed: `intelligence_objects.top_tier` in migration 0013 uses
  the canonical 7 values.)
- Assertion family omits `calculations` and `verifications`; the committed family
  has all five (0011). Add both to the family and the Minimum Tables list.
- `source_artifacts` → canonical `source_documents` (0011; ADR-0008 §3).
- Generic status enum → committed `status` (`active|inactive|archived`) +
  `superseded_by_id` + `stale_after`. (`disputed`/`withdrawn` are unmodeled — see
  backlog, not an erratum.)

**Volume 8 — Connector Registry & Acquisition**
- Status vocabulary → canonical `RegistryStatus` (`proposed|active|deprecated|archived`).
- Connector run states → `connector_runs.status` (`running|succeeded|failed|partial`)
  with `trigger_type`, `error_message`, `cost_estimate`, `ended_at` (0015).
- Discovery model → the 8-state `DiscoveryStage` pipeline + `discovery_candidates`
  (0015; live in `discovery/RESEARCH_QUEUE.md`).
- Source trust → the 8-tier `SourceAuthority` + `trust_score`/`default_tier`
  (types + live `sources/SOURCE_REGISTRY.csv`). Authority = source; tier = assertion.
- The one net-new contribution — the **Connector Output Contract** — is retained as
  a forward requirement (backlog), not an erratum.

**Volume 9 — Object Registry**
- Highest-impact erratum: Vol 9 lists verticals (Institution, CUSO, Fund, Call
  Report, …) as **core object types** with no `core_primitive | cartridge_entity`
  axis. Implementing it literally would violate the Constitution's "never introduce
  a vertical noun into `core/`" rule. The committed `ObjectRegistryEntry` already
  carries `object_class` + `schema_ref`, and `MASTER_OBJECT_REGISTRY.md` maps every
  vertical to a cartridge entity. Re-tag Vol 9's verticals as cartridge entities.
- Tenancy/versioning/plane errata as in the shared boilerplate (item 2 above).
- Re-express Vol 9's flat "Canonical Object Families" list as the registry's
  `domain` set + explicit `object_class` tags.

## Consequences
- Vols 3/8/9 reconciled: no adjudication needed; the committed contracts remain the
  source of truth; the volume `constitution/README.md` index moves 3/8/9 to
  reconciled. Priority now shifts to Vols 6/10/5, then greenfield 2/4/7, then the
  roadmap planned-vs-delivered reconcile.
- Forward backlog updated in `ACTIVE_BUILD.md` (grouped by volume). Notable items:
  **entity resolution** (`entities`/`entity_aliases` — not built in 0011–0014;
  many `*_ref` uuids point at a not-yet-existent Entity) is a HIGH gap;
  the truth **conflict-resolver** (`truth_conflicts` + deterministic precedence),
  the typed **Connector Output Contract**, and qualifying the ~94 placeholder rows
  in `100_CONNECTORS.csv` are the other headline items. RLS remains tracked as
  ACTIVE_BUILD #2 (not duplicated here).
- Confirmed already built (removed from the agents' provisional gap lists):
  `relationships` (0012, plane-aware, first-class), `personal_profiles` +
  `profile_signals`/`interests`/`goals` (0014), `intelligence_objects` +
  `content_variants` (0013).
