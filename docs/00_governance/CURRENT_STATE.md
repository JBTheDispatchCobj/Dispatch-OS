# Current State

## Existing foundation
- Next.js application
- Supabase/Postgres adapter and migrations (`0001`–`0015`, **applied**)
- Organization/workspace scaffolding; generic entities
- Inputs, work items, evidence, proposals, approvals, reports, metrics, outcomes
- Rules and generation rules; agent run/action records; widget system
- Hospitality, wealth, and field-service example cartridges

## Governance
- **Dispatch Constitution V1** adopted as Volume I / top authority
  (`docs/00_governance/constitution/`), with the 10-Volume Specification Program
  roadmap. Adoption + reconciliation in **ADR-0008**. `DOCTRINE.md` is its summary.
- ADRs: 0004 (plane graph), 0005 (truth envelope), 0006 (adopt DKR),
  0007 (truth-model reconciliation), 0008 (Constitution V1 adoption).

## Implemented contracts (in code + applied to Supabase)
- **Truth layer** — `core/truth/` + migration `0011`: planes, visibility, 7-tier
  `TruthTier` + precedence, provenance/temporal envelope, `SourceDocument`, and
  the assertion family (Observation, Claim, Calculation, Inference, Verification).
- **Relationships** — `core/relationships/` + `0012`.
- **Intelligence Objects** — `core/intelligence/` + `0013`.
- **Personal profiles** — `core/profile/` + `0014`.
- **DKR registry** — `core/registry/` + `0015` (`connector_runs`,
  `discovery_candidates`). Registry store: `Dispatch-Knowledge-Registry` repo.
- **NCUA source fixtures** — `docs/04_sources/ncua/`.

## Repos / backends
- GitHub: `JBTheDispatchCobj/Dispatch-OS` (kernel) and
  `JBTheDispatchCobj/Dispatch-Knowledge-Registry` (registry store), both on `main`.
- Supabase: migrations `0011`–`0015` applied (16 new tables live).

## Major gaps (now framed as Volumes II–X — see ACTIVE_BUILD)
- Shared-market vs tenant **RLS** enforcement (columns exist; policies deferred)
- Truth resolution/precedence + confidence-routing engine
- Model harness/router + usage/cost ledger (Vol IV)
- Publication/rendering pipeline + Terminal (Vol V/VI)
- Cartridge SDK/runtime + Cooperative Markets cartridge (Vol VII/VIII)
- Connector implementations against the registry (Vol IX)
- Evaluation/testing harness, context-pack generator (Vol X)
- Production auth

## Current priority
Constitution adopted; contracts implemented and live in Supabase. Next: the
shared-market vs tenant visibility model — **RLS** (`0016`) — which activates the
plane/visibility columns (ACTIVE_BUILD #2, Constitution Art. 20/23).
