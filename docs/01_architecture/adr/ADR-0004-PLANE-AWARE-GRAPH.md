# ADR-0004 — Plane-aware unified graph (shared market vs private tenant)

## Status
Accepted — 2026-07-19.

## Context
The Dispatch kernel is entirely tenant-scoped (`workspace_id NOT NULL` on every
operating table). Cooperative Markets requires a shared **public** market plane
(regulators, filings, public CU/company facts, Intelligence Objects) to coexist
with **private** per-institution tenants, and `DATA_ARCHITECTURE.md` models each
concept as a single table (one `relationships`, one `observations`, …), not a
public/private fork.

## Decision
New market objects (the assertion family, `relationships`, `intelligence_objects`,
`content_variants`) use **one plane-aware table each**, discriminated by three
columns: `plane` (`shared_market` | `private_terminal` | `control`),
`visibility` (`public` | `network` | `tenant_private` | `relationship_private` |
`personal`), and a **nullable** `workspace_id` (null = shared/public row).
`sources.workspace_id` is relaxed to nullable for the same reason. The graph is
unified; access is a visibility filter, not a separate schema.

## Consequences
- One graph to query, join, and reason about; no mirrored public/private tables.
- Visibility/plane are load-bearing from day one, but **enforcement** (RLS) is
  deferred to ACTIVE_BUILD #2. Until then, tenant-plane rows must not be exposed
  through PostGREST. This is the one real risk and is called out in every
  migration header.
- Nullable `workspace_id` means tenant-scoping is a predicate, not a NOT NULL
  guarantee; the forthcoming RLS policies must assert it per plane.
- Rejected: separate shared/tenant tables (doubles schema, splits the graph,
  diverges from `DATA_ARCHITECTURE.md`).
