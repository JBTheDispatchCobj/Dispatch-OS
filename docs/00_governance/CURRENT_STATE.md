# Current State

## Existing foundation
- Next.js application
- Supabase/Postgres adapter and migrations (`0001`–`0015`)
- Organization/workspace scaffolding
- Generic entities
- Inputs, work items, evidence, proposals, approvals, reports, metrics, outcomes
- Rules and generation rules
- Agent run/action records
- Widget system
- Hospitality, wealth, and field-service example cartridges

## Newly drafted (contracts/spec only — migrations not yet applied)
- **Truth layer** — `core/truth/types.ts` + migration `0011`: planes, visibility,
  the 7-tier hierarchy + precedence, the provenance/temporal envelope,
  `SourceDocument`, and the assertion family (Observation, Claim, Calculation,
  Inference, Verification). `Source` extended with plane/publisher/precedence.
- **Relationships** — `core/relationships/types.ts` + migration `0012`.
- **Intelligence Objects** — `core/intelligence/types.ts` + migration `0013`.
- **Personal profiles** — `core/profile/types.ts` + migration `0014`.
- **Dispatch Knowledge Registry (DKR)** — `docs/01_architecture/
  DISPATCH_KNOWLEDGE_REGISTRY.md`, `core/registry/types.ts` (SourceRegistryEntry,
  ConnectorSpec, ObjectRegistryEntry, IntelligenceObjectSpec,
  CartridgeRegistryEntry, DiscoveryCandidate) + migration `0015`
  (`connector_runs`, `discovery_candidates`). Registry *store* lives in
  `Dispatch_Knowledge_Registry_v1/`.
- **NCUA source fixtures** — `docs/04_sources/ncua/`.
- ADRs: 0004 (plane graph), 0005 (truth envelope), 0006 (adopt DKR),
  0007 (truth-model reconciliation).

## Architectural strengths
- Industry-neutral kernel; config-as-data; human promotion/review gates
- Evidence/outcome orientation; cartridge registry
- Layered truth with persisted provenance and bi-temporal validity
- Registry-first knowledge acquisition (registries define; kernel executes)

## Major gaps for Cooperative Markets
- Shared-market vs tenant **RLS** enforcement (columns exist; policies deferred)
- Truth resolution/precedence engine (tiers + weights declared; resolver TBD)
- Connector implementations + registry loader (contracts exist; runtime TBD)
- Public CU / company ingestion + deterministic profile calculation
- Intelligence Object factory + lens rendering (contracts exist; engine TBD)
- Model router and usage ledger; publication/engagement loop
- Cooperative Markets cartridge manifest
- Production auth and test coverage

## Current priority
Truth + relationship + profile + DKR contracts are drafted and typecheck clean.
Next: apply migrations, then the shared-market vs tenant visibility model (RLS)
before ingestion (ACTIVE_BUILD #2).
