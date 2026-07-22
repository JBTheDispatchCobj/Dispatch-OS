# FS / Dispatch–Auric V1 Canon — Integration & Where Everything Fits

**Status:** Adopted 2026-07-22 (ADR-0017) · **Kind:** external reference / operational canon (not a build spec) · **Location in repo:** `docs/06_external_canon/DISPATCH_AURIC_V1/`

This document explains how the externally-authored **Dispatch / Auric V1 master release package**
(the "gold" package) integrates into the existing product and build flow, where each piece fits,
and the rules for using it. It is the companion narrative to `ADR-0017-FS-V1-CANON-ADOPTION.md` and
the code seam `core/registry/canon.ts` + `core/registry/data/canon_aliases.json`.

> **Sequel — the market-facing canon.** This package specs the *operating system* (FS-4000…14000). Its
> market-facing companion, **FS-15000** (the Auric, Named Terminals, profiles, journeys, governed
> engagement, the relationship graph, matching, editorial integrity, the network flywheel), was adopted
> on the same reference/operational terms in **ADR-0018**. See `FS-15000/FS-15000_CANON_INTEGRATION.md`
> for its section→repo crosswalk. Same rules: identity reconciled not authority merged; Vol I stays the
> build constitution; pulled in per wave.

---

## 1. What this canon is (and is not)

The package is a **documentation-complete V1 product specification** for Dispatch / Auric: 11 FS
sections (FS-4000 … FS-14000), **636 indexed artifacts** — narrative volumes, machine-readable
schemas, registries, matrices, fixtures, tests, runbooks, and integrity indexes — all
format-validated (every ZIP opens, every JSON parses, CSV headers stable, checksums registered).

It is **not software and not production-ready**, and it says so itself in its control layer:

| Decision | Value |
|---|---|
| Content release | **APPROVE** |
| Implementation readiness | **NOT_ASSESSED** |
| Production readiness | **NOT_APPROVED** |

So the canon is adopted as a **reference / operational layer**, never as a competing build canon.
The repo's Constitution (Vol I) → ADRs → subsystem volumes → live registries remain the authority
for **what is built**. The FS package is the authority for **interpretation and verticalization** —
the lens the running system applies to customer inputs — and the source spec for downstream sections
when their waves arrive.

---

## 2. The shape — a triangle on a base plate

The canon does not slot in as a flat, uniform rectangle (spec-everything-to-the-same-depth). It fits
as an **inverted triangle sitting on a rectangular base plate**:

- **Base plate (rectangular, uniform, must be rock-solid):** tenant isolation, IAM, audit,
  encryption, the API/event contracts, the security release gate. This does not verticalize; it is
  identical for every tenant. Repo home: `core/kernel` + the security/governance sections (FS-12000).
- **Hard apex (narrow, deterministic, code + contract):** the universal spine — the connector
  runtime, truth tiers, permissions, the object registry. Precision is non-negotiable; nothing here
  is "interpreted." This is what the repo actively builds and gates.
- **Soft canopy (wide, per-vertical, configuration + knowledge):** the domain interpretation that
  fans out across verticals and customer contexts. This is where the FS content is disproportionately
  valuable — the operating knowledge, cartridge manifests, and domain frameworks the engine
  interprets inputs through.

The FS package is heaviest at the **canopy** (verticalization) and complements the repo build, which
is heaviest at the **apex** (the spine). They are two axes of the same triangle, not competitors.
Do not let "it's interpretive canon" seep down into the apex, where schemas/matrices/event catalogs
must be implemented exactly, not interpreted.

---

## 3. Section ↔ repo layer map

The FS sections are a decomposition of the same system by layer, so they map onto repo modules
nearly one-to-one:

| FS section | Territory | Repo home |
|---|---|---|
| FS-4000 Domain Operating Frameworks | Vertical operating knowledge | `cartridges/cooperative_markets` (+ future cartridges) |
| FS-5100 Master Registries & Cartridge Manifests | Canonical registries | `core/registry` (object/connector/ontology catalogs) |
| FS-6000 Institutional Kernel | Institution/kernel object models | `core/kernel` + `core/truth` |
| FS-7000 Demo & Productization | Demos, fixtures, sales surfaces | `cartridges/*` demos, `app/*` surfaces |
| FS-8000 Data, Connectors & Ingestion | Connectors, mapping, lineage, quality | `core/kernel/connector_runtime.ts` + `core/registry/connectors.ts` + `cartridges/*/connectors` |
| FS-9000 Knowledge Graph & Institution Population | Graph, resolution, inference | `core/registry/{service,resolver,candidate_bridge}.ts` + `core/profile` |
| FS-10000 Terminal UI & User Workspaces | Terminal surfaces | `app/{terminal,market,distribution,observability}` + `components/terminal` |
| FS-11000 Runtime, Agents & Orchestration | Workflow engine, agents, routing | `core/kernel` (event bus, cost ledger) + `cartridges` deal engine |
| FS-12000 Security, Governance & Administration | IAM, isolation, governance | the base plate (Sprint V productionization) |
| FS-13000 Deployment, Pilots & Commercialization | GTM, pricing, pilots | Sprint IV–VI product/commercial |
| FS-14000 Master Integration, Testing & Release | Cross-section integration, release | `scripts/debug-loop.mjs` + CI + release process |

Doctrine is aligned across the board — universal spine + cartridges; human authority (agents may
retrieve/draft/recommend but never approve loans, commit capital, or issue final compliance calls);
evidence before assertion; public/private/attested/inferred kept distinct; missing/stale visible;
network as a byproduct of operational value.

---

## 4. How it integrates — the canon reconciliation seam

The package uses different identifier conventions (FS-5100 `OBJ.CREDITUNION` / `SRC-NCUA-CALL`,
FS-8000 `CONN-GMAIL`, vs the repo `entity:coop_markets:…` / `source:…`) and is not even internally
consistent. Left unmanaged that variety becomes drift. The seam makes new inputs **fall into order**:

`core/registry/canon.ts` + config-as-data `core/registry/data/canon_aliases.json`, a generalization
of the entity resolver, running this pipeline — all deterministic, all config-as-data, no vertical
noun in `core/`:

1. **Namespace** — every id normalizes to `<kind>:<domain>:<slug>`; prefix-strip removes the
   convention marker so only identity tokens remain.
2. **Block + score** — token Jaccard proposes `incoming ≈ canonical`, never renames.
3. **Alias memory** — a config-as-data table (`incoming → canonical, status, source`). First
   encounter proposes; a human confirms once; it is sticky forever. Reconciliation quality climbs
   monotonically as inputs flow.
4. **Closed-graph gate** — every reference resolves to a canonical or a confirmed alias; a
   `verify`-flagged alias's canonical must resolve to a **live** repo key; no incoming confirmed to
   two canonicals. Enforced by the debug-loop **CANON** step.
5. **Authority precedence** — `live_code > confirmed_alias > fs_5100 > fs_8000 > fs_section >
   new_input`. Implemented contracts in the running repo outrank any external-canon claim on the same
   id. Resolves the canonical **label** only.

**Load-bearing rule — identity, not authority.** The seam reconciles what two names *refer to*. A
name match never certifies the schema/behavior behind it matches; semantic merges stay explicit
human/ADR acts. (In the seed crosswalk, `SRC-NCUA-CALL`/`SRC-FDIC-BANKFIND`/`SRC-SEC-EDGAR` and
`OBJ.CREDITUNION` are confirmed, while the broader `OBJ.INSTITUTION` is deliberately left *proposed*.)

**Propose-only + no-clobber** mirror the entity resolver: an unseen id is proposed, never
auto-merged; a human-reviewed alias (`confirmed`/`rejected`) is sticky.

---

## 5. The product flow, with the canon in place

The running loop is unchanged; the canon plugs in at the **identity/interpretation seam**, not the
spine:

```
customer / public input
        │
        ▼
[connector]  NORMALIZE only — no tier, no conclusion            (FS-8000 · core/kernel/connector_runtime)
        │      entity_candidates surfaced alongside records
        ▼
[truth]      tier / plane / visibility FROM THE SOURCE MANIFEST  (FS-6000 · core/truth)
        │
        ▼
[object registry]  identity index                               (FS-5100/9000 · core/registry)
        │      ← CANON SEAM reconciles incoming identifiers to live canonical ids
        │        (propose → human-confirm → sticky; identity not authority)
        ▼
[profile]    confidence · freshness · lineage                   (FS-9000 · core/profile)
        │
        ▼
[deal engine / workflows]  scores = sourced inferences          (FS-11000 · cartridges)
        │      regulated conclusions routed to…
        ▼
[human gates]  ICApproval · EditorialDisposition                (never in weights)
        │
        ▼
[terminal / publication]  lensed, evidence-linked outputs       (FS-10000/Auric · app + components)
```

The canon is the **interpretation layer**: when a new source, object, workflow, or agent name arrives
(from the FS package, a new connector, or a customer's taxonomy), the seam resolves it to the repo's
live identity — deterministically if seen before, otherwise as a single human-review proposal.

---

## 6. Operating rules

- **Repo wave order leads.** The package's own "document every section to 100% first" sequence does
  NOT drive the build. Each wave pulls its matching FS section as *reference*, reconciles names into
  the registry, and tightens any adopted schema from doc-grade to contract-grade as normal work.
- **Stricter in name-space than entity-space.** A false name-merge corrupts a contract (worse than a
  false entity split). Anything touching a human-authority or evidence contract stays propose-only.
- **Per-domain stopword config is a living cost.** The domain-namespace stopwords are caller-injected
  (config-as-data); each new vertical needs its own set. Wrong sets produce wrong matches.
- **Identity resolution stays deterministic + human-confirmed** — never in model weights. A model may
  sit at the propose edge; the canonical decision is deterministic and persisted with lineage.
- **Identity reconciled ≠ contract reconciled.** Matching labels do not mean the specs are merged.

---

## 7. Status, provenance & what's here

- **Provenance:** the content under `DISPATCH_AURIC_V1/SECTIONS/` was extracted from the *canonical
  release-complete* section ZIPs; `MASTER_CONTROL/` preserves the manifest, artifact register, and
  checksum registry for integrity. Historical baselines are noncanonical and must not be used as
  implementation specs.
- **Reconciled so far:** only the connector sources + a couple of object identifiers are crosswalked
  in `canon_aliases.json`. The remaining FS-5100 registries (workflow/agent/event/evidence/approval/
  KPI/dashboard/relationship) and FS-8000 transport connectors grow as inputs flow (propose → confirm
  → sticky). This is a fan-out-friendly follow-on for future waves.
- **Honesty boundary:** documentation-complete ≠ built. Adopting the canon does not advance the
  platform build number; it makes the FS material weave-able per wave.

### Folder index (`docs/06_external_canon/DISPATCH_AURIC_V1/`)
- `MASTER_CONTROL/` — release manifest, artifact register (636), checksum registry, reconciliation,
  validation report, release notes, known issues.
- `SUPPORTING_DOCUMENT_CONTROL/` — `ADDENDUM.md`, `DISPATCH _ AURIC V1.md` (the master continuation
  brief), and the extracted `POST_VOLUME_10` document-control package.
- `SECTIONS/FS-4000 … FS-14000/` — each section's extracted volumes, schemas, registries, fixtures,
  tests, and validation.

**See also:** `docs/01_architecture/adr/ADR-0017-FS-V1-CANON-ADOPTION.md`, `core/registry/canon.ts`,
`core/registry/data/canon_aliases.json`, and the **CANON** step in `scripts/debug-loop.mjs`.
