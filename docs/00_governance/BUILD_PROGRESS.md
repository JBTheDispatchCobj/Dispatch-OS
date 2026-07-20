# Build Progress Tracker

**Current build completion: ~13%** &nbsp;·&nbsp; Last updated: 2026-07-20 (post FS Object Registry catalog)

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
| Kernel services (identity/permissions, event bus, object registry, cost ledger, contracts/API) | 20% | 3% | 0.6 |
| Truth/graph engines (resolver, confidence, entity resolution, assembly, query) | 15% | 2% | 0.30 |
| Agent Harness + Execution Engine (router, planner, runtime, evaluation) | 15% | 1% | 0.15 |
| Publication (Auric) engine | 8% | 1% | 0.08 |
| Connector implementations + ingestion | 7% | 3% | 0.21 |
| Cooperative Markets cartridge (first product) | 8% | 0% | 0.0 |
| Terminal (customer-facing product) | 7% | 0% | 0.0 |
| Tests / observability / productionization | 5% | 1% | 0.05 |
| **Total** | **100%** | — | **~14 → 13%** |

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
- **Publication engine** — 1%: IO/ContentVariant tables exist; no intake/render/feed engine.
- **Connectors** — 3%: registry contract + discovery pipeline + ~5 real sources; ~93
  placeholder connectors unqualified; no connector runtime/SDK.
- **Cooperative Markets cartridge** — 0%: not authored (`cartridges/cooperative_markets/`
  does not exist).
- **Terminal** — 0%: no UI/runtime (deliberately UI-last).
- **Tests/observability/productionization** — 1%: `tsc` strict only; no test harness/CI.

## Next bricks (each moves the number)
1. Apply `0016` **and** `0017` in Supabase (data layer → live enforcement; tenant isolation
   + canonical identity index go live only after apply).
2. Object Registry **service** (RFC-2003) + resolution: populate `object_match_candidates`
   from blocking keys + scoring; apply merges via `object_merges` (kernel + truth engines).
3. Identity & Tenancy (RFC-2002) + permission engine (kernel services).
4. Cooperative Markets cartridge package + 9 entities + call-report ingestion (first product) —
   now seedable from the Financial Services object catalog (`core/registry/data/`).

## Changelog
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
