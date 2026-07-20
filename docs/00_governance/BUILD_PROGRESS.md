# Build Progress Tracker

**Current build completion: ~12%** &nbsp;·&nbsp; Last updated: 2026-07-20 (post ADR-0013)

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
| Data contracts + schema (migrations `0001`–`0016`, `core/` types) | 15% | 80% | 12.0 |
| Kernel services (identity/permissions, event bus, object registry, cost ledger, contracts/API) | 20% | 2% | 0.4 |
| Truth/graph engines (resolver, confidence, entity resolution, assembly, query) | 15% | 1% | 0.15 |
| Agent Harness + Execution Engine (router, planner, runtime, evaluation) | 15% | 1% | 0.15 |
| Publication (Auric) engine | 8% | 1% | 0.08 |
| Connector implementations + ingestion | 7% | 3% | 0.21 |
| Cooperative Markets cartridge (first product) | 8% | 0% | 0.0 |
| Terminal (customer-facing product) | 7% | 0% | 0.0 |
| Tests / observability / productionization | 5% | 1% | 0.05 |
| **Total** | **100%** | — | **~13 → 12%** |

## What "built" means per layer (so estimates stay honest)
- **Data contracts + schema** — 80%: the foundation (`0011`–`0016`: truth family,
  relationships, intelligence objects, profiles, registry-ops, RLS) is live in Supabase,
  but it is a fraction of the eventual schema (no entity/identity tables, no event store,
  no ledger, no cartridge entities). "80% of the foundation" ≈ 15% of the eventual schema.
- **Kernel services** — 2%: only an in-memory config/cartridge registry + the RLS helpers
  exist; no identity/permission engine, event bus, object-registry service, cost ledger,
  or contracts/API layer.
- **Truth/graph engines** — 1%: assertion tables exist; no resolver/confidence/entity-
  resolution/assembly/query engine.
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
1. Apply `0016` RLS in Supabase (data layer → live enforcement).
2. `0017` Object Registry identity index + entity resolution (kernel services + truth engines).
3. Identity & Tenancy (RFC-2002) + permission engine (kernel services).
4. Cooperative Markets cartridge package + 9 entities + call-report ingestion (first product).

## Changelog
- 2026-07-20 — Baseline established at **~12%** after the full Vols I–X reconciliation
  (ADRs 0009–0013) + `0016` RLS written. Foundation schema live; engines/services/UI unbuilt.
