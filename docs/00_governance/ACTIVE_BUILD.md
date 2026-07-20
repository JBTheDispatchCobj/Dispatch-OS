# Active Build

## Active initiative
Cooperative Markets foundation on Dispatch OS.

## Current context pack
`docs/context/packs/cooperative-markets-foundation.md`

## Immediate implementation sequence
1. ~~Reconcile core schemas with Truth, Source, Claim, Observation, Inference,
   Relationship, Intelligence Object, and Personal Profile contracts.~~
   **DONE (contracts + migrations 0011–0014; typecheck clean).**
1b. ~~Adopt the Dispatch Knowledge Registry (DKR) — registry contracts + spec +
   store + ops migration.~~ **DONE (ADR-0006/0007, `core/registry/types.ts`,
   migration `0015`, `Dispatch_Knowledge_Registry_v1/`).**
2. Add shared-market versus tenant visibility model — **RLS policies** for the
   plane-aware tables (truth family, relationships, intelligence, profiles,
   source_documents) + the registry-ops tables. **← NEXT.**
3. Add public CU ingestion fixtures and deterministic profile calculations
   (NCUA datasets staged; source registry seeded).
4. Add Cooperative Markets cartridge manifest (`cartridges/cooperative_markets/`),
   wiring the registry entries seeded in the DKR store.
5. Add model-routing interfaces without binding to a provider.

## Registry-first rule (DKR, ADR-0006)
Before one-off logic, ask: new object / connector / intelligence object /
cartridge, or a registry update? Update the registry first, then implement.

## Open follow-ups
- Apply migrations `0011`–`0015` in Supabase (Bryan pastes SQL).
- Registry loader: read `Dispatch_Knowledge_Registry_v1/` into typed entries.
- Truth-resolution/precedence engine; in-memory store methods + adapter mappings
  for the new objects.

## Explicitly deferred
- Final UI design
- Securities execution mechanics
- Production fund/SPV administration
- Full multimedia rendering
- Paid billing implementation
