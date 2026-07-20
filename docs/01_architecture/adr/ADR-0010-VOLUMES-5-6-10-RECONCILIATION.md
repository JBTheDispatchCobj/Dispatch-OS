# ADR-0010 — Reconcile Specification Program Volumes 5, 6, 10 against the committed build

## Status
Accepted — 2026-07-20.

## Context
Second-tier reconciliation pass (after ADR-0009's priority volumes 3/8/9). One
reconciliation agent per volume compared each spec against the committed
contracts, applied migrations, and the live DKR store:

- Vol 5 (Cooperative Markets Cartridge) vs `core/cartridge.ts`, the example
  cartridges (`cartridges/hospitality`), and the DKR object/cartridge registries.
- Vol 6 (The Auric Engine) vs `core/intelligence/types.ts`, migration `0013`
  (`intelligence_objects` + `content_variants`), `core/profile`, DKR
  `intelligence/INTELLIGENCE_REGISTRY.md`.
- Vol 10 (Cartridge SDK) vs `core/cartridge.ts`, `core/config/types.ts`,
  `core/registry/types.ts`, the example cartridges, DKR `CARTRIDGE_REGISTRY.md`.

(Volume 2 was originally in this tier but is handled separately in **ADR-0011** —
a real Kernel spec, RFC-2000..2015, was supplied and adopted, superseding the
filed stub.)

## Decision
1. **No genuine conflicts. The committed build governs.** Like Vols 3/8/9, Vols
   5/6/10 are templated stubs — each repeats one generic boilerplate "Reference
   Contract" across ~20 sections. Every divergence is a volume **erratum** (string
   `version`, `tenantId`, missing `plane`/`visibility`, generic status enum);
   catalogued below, fixed in the source docs later, non-blocking. No code change.

2. **The volumes' durable value is their scope lists, which become backlog.**
   - **Vol 5** correctly frames Cooperative Markets as the **first cartridge** —
     nothing vertical leaked into `core/`. Its section list + Core Loop are the
     first-cartridge build spine; they align to the committed relationship stage
     ladder (migration `0012`: discovery→evaluation→discussion→pilot→integration→
     partnership→investment→monitoring→dormant→ended).
   - **Vol 6** — the intelligence/publication contracts and tables exist and match
     (lens/channel enums, `two_dollar_bill`, the plane split). The publication
     *engine* is unbuilt.
   - **Vol 10** — the cartridge-as-configuration doctrine is already realized
     (`installConfiguration` + `PackagedConfiguration` + working example
     cartridges). Real gaps are lifecycle (remove/upgrade/rollback/migration
     runner), isolation enforcement, and dependency resolution.

3. **Errata & gaps recorded**; gaps folded into `ACTIVE_BUILD.md` by volume.

## Volume errata (fix in source docs; non-blocking)
- **All three:** generic boilerplate contract superseded by committed conventions
  (numeric `version`; `organization_id` + nullable `workspace_id`, not `tenantId`;
  committed status enums; mandatory `plane`/`visibility`).
- **Vol 5:** entities must be namespaced `cooperative_markets:<slug>` with
  `object_class = cartridge_entity` + `schema_ref` (per ADR-0009 Vol 9 finding);
  state the repo path `cartridges/cooperative_markets/`.
- **Vol 6:** add the `person` lens (build keeps it; ADR-0008); name the
  `terminal_feed`/`email`/`api` channels.
- **Vol 10:** replace the `manifest.yaml` on-disk package tree with the committed
  TS-module + `CartridgeRegistryEntry` model (or file a separate ADR if an on-disk
  marketplace packaging format is genuinely intended).

## Gaps → backlog (detail in ACTIVE_BUILD)
- **Vol 5 (first cartridge):** author `cartridges/cooperative_markets/cartridge.ts`;
  define the 9 reserved cartridge entities (credit_union, call_report, executive,
  innovation_company, cuso, fund, investment, regulation, product); call-report /
  regulatory ingestion persisting evidence+source+lineage; matching/pilot/
  partnership workflows on the relationship stage ladder; flesh out
  `COOPERATIVE_MARKETS_PRD.md` (itself a stub).
- **Vol 6 (publication engine):** IO intake/assembly service; lens renderer +
  base-content generator (restate-not-extend, `source_refs` on every variant);
  channel feeds (brief/market/network/two_dollar_bill); editorial verification
  gate; feedback-loop wiring (signals→interests→relevance); fair-use guardrails.
- **Vol 10 (cartridge lifecycle):** uninstall/remove (HIGH); isolation enforcement
  (HIGH); upgrade/rollback + migration runner; dependency resolution; typed
  permissions contract; per-cartridge evaluation fixtures.

## Consequences
- Vols 5/6/10 reconciled; `constitution/README.md` index updated. No adjudication
  needed. The committed contracts remain the source of truth.
- Vol 6/10 gaps are the publication-engine and cartridge-runtime build surfaces;
  Vol 5 is the first-cartridge build list — all sequenced in `ACTIVE_BUILD.md`.
