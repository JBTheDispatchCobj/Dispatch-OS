# ADR-0006 — Adopt the Dispatch Knowledge Registry (DKR)

## Status
Accepted — 2026-07-19.

## Context
A knowledge-acquisition framework (the DKR / DKAF, authored externally) proposes
that everything entering Dispatch flow through five permanent registries —
Source, Connector, Object, Intelligence, Cartridge — plus a discovery framework,
so the kernel never hardcodes industries, sources, or prompts. Much of this
already exists in the repo under other names; the framework's value is naming
the missing seam (a first-class **Connector Registry**) and the operating
principle: *registries are the source of truth; the kernel executes.*

## Decision
Adopt the DKR as the knowledge-acquisition architecture. Map its registries onto
existing structures rather than duplicating them:

| DKR registry | Existing home | Action |
|---|---|---|
| Source | `sources` table, `SOURCE_CATALOG.md` | add typed `SourceRegistryEntry` |
| Connector | — (gap) | **new** `ConnectorSpec` (first-class) |
| Object | `core/` object model, `entity_types`, `CORE_OBJECT_MODEL.md` | `ObjectRegistryEntry` points at these |
| Intelligence | `core/intelligence/` | `IntelligenceObjectSpec` |
| Cartridge | `cartridges/`, `core/cartridge.ts` | `CartridgeRegistryEntry` index |

The registry **store** lives in its own top-level location
(`Dispatch_Knowledge_Registry_v1/`), because it grows to hundreds of connectors
and object types and should not bloat the kernel repo. The **canonical spec and
typed contracts** live in the kernel repo (`docs/01_architecture/
DISPATCH_KNOWLEDGE_REGISTRY.md`, `core/registry/types.ts`) so the kernel treats
the store as authoritative. Operational state (connector runs, discovery queue)
is persisted via `db/migrations/0015`.

## Consequences
- Registry-first workflow: before one-off logic, ask whether it needs a new
  object/connector/intelligence/cartridge or a registry update — update the
  registry first, then implement (DKR §Claude Instructions).
- Connectors normalize; they carry no business logic (extraction is declared as
  registry-key references).
- Two-location architecture: contracts in kernel, data in the store. The store
  must be reachable at load time; a missing/stale store degrades ingestion, not
  the kernel.
- The DKAF origin doc is superseded by the reconciled spec; kept for lineage.
