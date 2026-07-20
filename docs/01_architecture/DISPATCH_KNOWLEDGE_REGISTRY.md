# Dispatch Knowledge Registry (DKR)

Canonical spec. Reconciles the external DKAF draft with the kernel as it exists.
Adopted in ADR-0006; truth reconciliation in ADR-0007.

## What it is
The DKR is the specification for how Dispatch discovers, understands, stores,
verifies, enriches, and distributes knowledge. It is not a database, a scraper,
or documentation — it is the set of registries that define what the kernel can
do. The kernel executes; the registries decide. Everything entering Dispatch
flows through the DKR.

## Where it lives
- **Contracts (this repo):** `core/registry/types.ts` — the typed manifest
  shapes for every registry entry.
- **Spec (this repo):** this file + ADR-0006 / ADR-0007.
- **Store (separate):** `Dispatch_Knowledge_Registry_v1/` — the authoritative
  registry *data* (source/connector/object/intelligence/cartridge entries and
  the discovery queue). It grows large and is versioned independently.
- **Operational state (this repo):** `db/migrations/0015` — `connector_runs`
  (execution ledger) and `discovery_candidates` (research queue).

## The five registries
1. **Source Registry** — every source, its authority, trust score, refresh
   cadence, auth, cost, and output objects. Runtime rows are core `Source`;
   declarations are `SourceRegistryEntry`. Backed by `SOURCE_CATALOG.md`.
2. **Connector Registry** — the implementation layer (`ConnectorSpec`). One per
   source. Connectors NORMALIZE; they carry no business logic. This is the piece
   the DKR adds that the kernel lacked.
3. **Object Registry** — every object type (`ObjectRegistryEntry`), pointing at a
   core primitive (`CORE_OBJECT_MODEL.md`) or a cartridge entity_type. Objects
   own schemas, relationships, versions.
4. **Intelligence Registry** — every kind of intelligence Dispatch can
   manufacture (`IntelligenceObjectSpec`). Everything Dispatch produces begins as
   an Intelligence Object (`core/intelligence/`).
5. **Cartridge Registry** — platform capability (`CartridgeRegistryEntry`):
   objects, sources, rules, prompts, workflows, widgets, permissions, metrics.
   The kernel never knows industries; cartridges do.

## Knowledge flow
Source → Connector → Normalized Object → **Truth layer** (SourceDocument →
Observation/Claim/Calculation/Inference/Verification) → Relationship graph →
Inference → Intelligence Object → Publication → Terminal → Workflow → Outcome →
Graph improvement.

This is the existing operating loop (DOCTRINE) with the `core/truth/` layer as
the "Truth Engine" stage and `core/relationships/` as the graph.

## Truth model
Governed by the canonical `TruthTier` (DOCTRINE, ADR-0005). DKR terms map onto it
per ADR-0007; no generated output becomes truth without attribution, which
`ContentVariant.source_refs` enforces.

## Discovery framework
Discover → Qualify → Connector → Parser → Entities → Intelligence Objects →
Cartridges. Candidates live in the research queue (`DiscoveryCandidate` /
`discovery_candidates`) and are promoted into the Source + Connector registries.
Dispatch should get better at finding knowledge over time.

## Registry-first rule (for humans and agents)
Before writing one-off logic, ask: does this need a new object, connector,
intelligence object, or cartridge — or a registry update? If yes, update the
registry first, then implement. Registries are the source of truth.

## Long-term target
500+ connectors, 500+ object types, 250+ intelligence objects, 100+ cartridges —
letting Dispatch expand into any industry without changing the kernel.
Cooperative Markets is simply the first cartridge.

## Origin
Reconciled from the external draft "DISPATCH KNOWLEDGE GRAPH / ACQUISITION
FRAMEWORK (DKAF)" v1.0. That draft is superseded by this spec; retained for lineage.
