# ADR-0014 — Adopt Volume XI (Canonical Ontology); ontology layer over the Object Registry

## Status
Accepted — 2026-07-20.

## Context
Volumes I–X establish the constitutional + platform architecture. The supplied
`DISPATCH_OS_REMAINING_ROADMAP.md` reframes the remaining work as **operational
intelligence, not more infrastructure**: a canonical business ontology, industry
truth models, rule/workflow/agent libraries, connectors, knowledge packs, KPIs,
reports, and an institution graph (Sprints 1–10). Sprint 1 — the **Canonical
Ontology (Volume XI)** — is highest priority and the substrate every later sprint
draws on.

We already have the identity substrate: the Object Registry (Vol X, migration
`0017`) with `object_registry.object_class`, and the Financial Services catalog
(`core/registry/data/financial_services_objects.json`, 20 families / 341 classes)
loaded by `core/registry/objects.ts` and installed as `entity_types` by the
`financial_services` base package. What the classes lack is the *operational* layer
the roadmap wants per object: relationships, lifecycle, KPIs, required documents,
and connectors.

## Decision

### 1. Volume XI is the Canonical Ontology layer — additive over the Object Registry
Volume XI does **not** introduce a new store or replace the catalog. It is a
config-as-data **enrichment layer** that attaches, per canonical class (by
`schema_ref`), the operational ontology: `relationships`, `lifecycle`, `kpis`,
`required_documents`, `connectors`. This preserves ADR-0004 (typed plane-aware
tables) and ADR-0013 (the registry indexes; it does not absorb data).

### 2. Shape + placement (config-as-data)
- Types + loader: `core/registry/ontology.ts` (`ObjectOntology`, `OntologyPack`,
  accessors, `getEnrichedObjectClass`, `ontologyReferencedObjects`).
- Data: `core/registry/data/ontology/<domain>.json` packs, each a list of
  `ObjectOntology` records keyed to catalog `schema_ref`s.
- **Closed graph:** every relationship `target` is a catalog `schema_ref` (checked
  at build), so the ontology forms a resolvable object graph, not free text.
- **Connectors** referenced by key (`connector:*`) are forward references into the
  Connector Registry (Vol IX); they need not exist yet.

### 3. Scope of this ADR's first increment
The **Credit Union anchor pack** (`ontology/credit_union.json`) — the Cooperative
Markets first-product domain — is authored in full: institution (federal/state CU,
CUSO), member, share/certificate deposits, auto/mortgage lending, NCUA, the 5300
call report, examinations, and the BSA/AML program. The remaining families/domains
(Sprint 1's Hospitality, Lending, Capital Markets, Compliance, Regulatory,
Technology/Vendor, AI ontologies) are authored iteratively as further packs against
the same schema; some may be model-generated then reviewed.

### 4. Relationship to later sprints
Ontology `kpis` seed the KPI Library (Sprint 8); `lifecycle` seeds the Workflow
Library (Sprint 4); `required_documents` seed Reports/Knowledge Packs (Sprints 7/9);
`relationships` seed the Institution Graph (Sprint 10). Volume XI is the spine those
sprints hang on.

## Consequences
- Additive only: no migration churn, no change to the 341-class catalog or its
  loader; strict `tsc` clean; ontology is opt-in per object.
- The number moves modestly — this is knowledge encoding (Canonical Business
  Ontology was ~10%); the anchor pack advances it, not the platform %.
- Follow-on: a build-time integrity check (every `object`/`target` resolves) should
  run in CI once a test harness exists; for now it is validated at bundle time.

## Authority
Constitution (Vol I) → ADRs → volumes II–X → **Volume XI (this ADR)** → registries →
`ACTIVE_BUILD.md`. Volume XI sits above the registries as the domain-knowledge layer;
it governs ontology content, not platform contracts.
