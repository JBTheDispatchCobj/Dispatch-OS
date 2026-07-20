# Context Pack: Cooperative Markets Foundation

Read these documents only:
- `docs/00_governance/DOCTRINE.md` (summary of the Constitution)
- `docs/00_governance/constitution/README.md` (+ referenced Constitution articles only)
- `docs/00_governance/CURRENT_STATE.md`
- `docs/01_architecture/SYSTEM_ARCHITECTURE.md`
- `docs/01_architecture/DATA_ARCHITECTURE.md`
- `docs/01_architecture/DISPATCH_KNOWLEDGE_REGISTRY.md`
- `docs/01_architecture/adr/ADR-0004`..`ADR-0008`
- `docs/02_product/MASTER_PRODUCT_MAP.md`
- `docs/03_subsystems/COOPERATIVE_MARKETS_PRD.md`
- `docs/04_sources/SOURCE_CATALOG.md` + `docs/04_sources/ncua/NCUA_SOURCE_CONTRACT.md`
- `docs/05_build/BUILD_SEQUENCE.md`

Constitution (read only the articles a task references — never the whole file):
- `docs/00_governance/constitution/VOLUME_1_DISPATCH_CONSTITUTION_V1.md`
- `docs/00_governance/constitution/SPECIFICATION_PROGRAM_AND_VOLUME_ROADMAP.md`

Implemented contracts (read the source when touching them):
- `core/truth/` · `core/relationships/` · `core/intelligence/` · `core/profile/` ·
  `core/registry/`; migrations `db/migrations/0011`–`0015` (applied); `0016`/`0017` written,
  pending apply.
- **Volume XI ontology (ADR-0014):** `core/registry/ontology.ts` + packs under
  `core/registry/data/ontology/` (credit_union, lending_deposits, capital_markets,
  innovation_ecosystem — 113 objects, closed graph). Scope = finance/VC/CU/fintech/innovation
  (ADR-0015). Check: `node scripts/ontology-check.mjs`.

Registry store (separate repo): `Dispatch-Knowledge-Registry`.

Current objective: Constitution adopted; contracts live in Supabase. Next is the
shared-market vs tenant visibility model — RLS (`0016`) — Constitution Art. 20/23.
