# Context Pack: Cooperative Markets Foundation

Read these documents only:
- `docs/00_governance/DOCTRINE.md`
- `docs/00_governance/CURRENT_STATE.md`
- `docs/01_architecture/SYSTEM_ARCHITECTURE.md`
- `docs/01_architecture/DATA_ARCHITECTURE.md`
- `docs/01_architecture/DISPATCH_KNOWLEDGE_REGISTRY.md`
- `docs/01_architecture/adr/ADR-0004-PLANE-AWARE-GRAPH.md`
- `docs/01_architecture/adr/ADR-0005-TRUTH-PROVENANCE-ENVELOPE.md`
- `docs/01_architecture/adr/ADR-0006-DISPATCH-KNOWLEDGE-REGISTRY.md`
- `docs/01_architecture/adr/ADR-0007-TRUTH-MODEL-RECONCILIATION.md`
- `docs/02_product/MASTER_PRODUCT_MAP.md`
- `docs/03_subsystems/COOPERATIVE_MARKETS_PRD.md`
- `docs/04_sources/SOURCE_CATALOG.md`
- `docs/04_sources/ncua/NCUA_SOURCE_CONTRACT.md`
- `docs/05_build/BUILD_SEQUENCE.md`

Implemented contracts (read the source when touching them):
- `core/truth/types.ts` · `core/relationships/types.ts` ·
  `core/intelligence/types.ts` · `core/profile/types.ts` · `core/registry/types.ts`
- Migrations `db/migrations/0011`–`0015` (forward-only, additive).

Registry store (separate folder, authoritative for registry data):
- `Dispatch_Knowledge_Registry_v1/` — sources, connectors, objects, intelligence,
  cartridges, discovery.

Current objective: truth/relationship/profile/registry contracts implemented.
Next is the shared-market vs tenant visibility model (RLS) before ingestion.
