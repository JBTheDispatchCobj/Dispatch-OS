# Active Build

## Active initiative
Cooperative Markets foundation on Dispatch OS, under the Dispatch Constitution V1.

## Current context pack
`docs/context/packs/cooperative-markets-foundation.md`

## Done
1. Core contracts — Truth, Source, Claim, Observation, Inference, Relationship,
   Intelligence Object, Personal Profile (migrations `0011`–`0014`).
1b. Dispatch Knowledge Registry adopted (ADR-0006; contracts + store + `0015`).
1c. Dispatch Constitution V1 adopted as Volume I (ADR-0008); deltas reconciled.
    Migrations `0011`–`0015` applied to Supabase; both repos on GitHub.

## Immediate next
2. **Shared-market vs tenant visibility — RLS** (`0016_market_rls.sql`) for the
   plane-aware tables (truth family, relationships, intelligence, profiles,
   source_documents) + registry-ops tables. Activates plane/visibility columns.
   (Constitution Art. 20/23.) **← NEXT.**
3. Public CU ingestion fixtures + deterministic profile calculations (NCUA data staged).
4. Cooperative Markets cartridge manifest (`cartridges/cooperative_markets/`).
5. Model-routing interfaces without binding to a provider.

## Forward backlog — Specification Program Volumes II–X
(The roadmap's volumes are the durable backlog; build order per the roadmap.)
- **Vol II Kernel** — kernel boundary; general event store + derived state;
  identity/role/tenancy service; memory subsystem; action-level cost metering;
  audit-log subsystem; configuration/versioning framework.
- **Vol III Knowledge Graph / Truth** — RLS (#2); confidence-routing engine;
  source-authority precedence; conflict coexistence/resolution (truth resolver).
- **Vol IV Harness** — rules→small→strong→frontier→human router; human-review
  workflow over `verifications`; model-route + review-packet standards.
- **Vol V Intelligence / Publication** — rendering/lensing pipeline; Recommendation
  object; actionability paths; search; editorial brevity rules.
- **Vol VI Terminal** — Terminal environment; institution profile; org lensing.
- **Vol VII Cartridge SDK** — cartridge runtime, manifest, install/remove,
  dependency + isolation enforcement.
- **Vol VIII Cooperative Markets** — cartridge objects (credit union, startup,
  vendor, CUSO, executive, regulation, investment), rules, fixtures, workflows.
- **Vol IX Connector Registry** — connector implementations; change-detection/
  refresh/failure handling; discovery-pipeline promotion.
- **Vol X Developer / Repo SDK** — evaluation + regression harness; context-pack
  generator; workflow engine; security controls; freemium/pricing; UI (last).

## Explicitly deferred
Final UI design; securities execution mechanics; production fund/SPV
administration; full multimedia rendering; paid billing implementation.
