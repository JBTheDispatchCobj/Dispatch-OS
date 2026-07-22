# ADR-0017 — Adopt the FS / Dispatch-Auric V1 release package as a reference/operational canon (identity-reconciled, not authority-merged)

- **Status:** Accepted (2026-07-22)
- **Deciders:** Bryan
- **Context sources:** the `DISPATCH_AURIC_V1_MASTER_RELEASE_COMPLETE` package (11 canonical FS sections FS-4000…FS-14000, 636 indexed artifacts, doc-validated); `CLAUDE.md` change policy; `core/registry/{connectors,resolver,service,candidate_bridge}.ts`.

## Context

An externally-authored, documentation-complete V1 product specification for Dispatch / Auric
arrived as the FS release package. Its own control layer is explicit that it is documentation,
not software: content release **APPROVED**, implementation **NOT_ASSESSED**, production
**NOT_APPROVED**. It declares FS-5100 the canonical registry authority and ships real machine-readable
registries (object/workflow/agent/connector/event/evidence/approval/KPI/dashboard/relationship/
report/knowledge-pack) plus manifest schemas.

Two facts shape the decision:

1. **It is the same product, fuller.** The FS sections map cleanly onto repo layers
   (FS-5100 ↔ `core/registry`; FS-6000 ↔ `core/kernel`+`core/truth`; FS-8000 ↔ the connector
   runtime + catalog; FS-9000 ↔ registry/resolver/candidate-bridge; FS-10000 ↔ Terminal;
   FS-11000 ↔ harness). The doctrine is aligned (universal spine + cartridges; human authority;
   evidence before assertion; public/private/attested/inferred kept distinct; missing/stale
   visible; network as byproduct).
2. **It uses different identifier conventions**, and is not even internally consistent
   (FS-5100 `OBJ.CREDITUNION` / `SRC-…`, FS-8000 `CONN-GMAIL`, vs the repo `entity:coop_markets:…`
   / `source:…`). Its evidence/approval IDs are doc-grade compound strings, not contract-grade.

Treating the package as a *competing canon* to retrofit the repo to would create drift and a
"which name is real" problem. Ignoring it would waste a strong blueprint for the downstream
(security, deployment, commercialization, terminal) sections the repo has not specced.

## Decision

1. **Adopt the FS V1 package as a REFERENCE / OPERATIONAL canon, not a build canon.** The repo's
   Constitution (Vol I) → ADRs → subsystem volumes → registries remain the authority for what is
   **built**. The FS package is the authority for **interpretation and verticalization** (the wide
   end of the triangle) and the source spec for downstream sections when their waves arrive.
2. **Reconcile IDENTITY, never AUTHORITY.** A generic seam — `core/registry/canon.ts` +
   config-as-data `core/registry/data/canon_aliases.json` — maps incoming FS identifiers to the
   repo's **live** canonical identifiers. A name match resolves a *label*; it never certifies that
   the schema/behavior behind the name matches. Semantic merges stay explicit human/ADR acts.
3. **Propose-only + no-clobber**, mirroring the entity resolver: an unknown incoming id is
   *proposed* against the live canonicals by deterministic token similarity, never auto-merged; a
   human-reviewed alias (`confirmed`/`rejected`) is sticky.
4. **Authority precedence** (declared config, resolves the canonical LABEL only):
   `live_code` > `confirmed_alias` > `fs_5100` > `fs_8000` > `fs_section` > `new_input`.
   Implemented contracts in the running repo outrank any external-canon claim on the same id.
5. **Closed-graph validated.** A confirmed alias may not map one incoming id to two canonicals, and
   a `verify`-flagged alias's canonical must resolve to a live repo key — so the crosswalk cannot
   assert an identity the running system does not have. Gated by the debug-loop **CANON** step.
6. **Repo wave order leads; the FS section is pulled in per wave as reference.** The package's own
   "document every section to 100% first" sequence does **not** drive the build order (that would
   invert the repo's build-the-running-slice discipline).

## Consequences

- New inputs "fall into order": first encounter proposes, one human confirmation makes it sticky,
  every later occurrence auto-resolves — reconciliation quality climbs monotonically as inputs flow.
- The seam is additive, generic (no vertical noun in `core/`), pure/deterministic, and reuses the
  existing resolver + closed-graph machinery; no engine or contract changed.
- **Guardrails (from the design review):** name-space reconciliation runs *stricter* than
  entity-space because a false merge corrupts a contract; anything touching human-authority or
  evidence contracts stays propose-only; the per-domain stopword config is a living curation cost;
  identity resolution stays deterministic + human-confirmed (never in model weights).
- Seeded crosswalk (grounded in the real FS files): `SRC-NCUA-CALL`, `SRC-FDIC-BANKFIND`,
  `SRC-SEC-EDGAR` confirmed to the live connector sources; `OBJ.CREDITUNION` confirmed; the broader
  `OBJ.INSTITUTION` left **proposed** on purpose (label ≠ semantic merge).
- Follow-on (future waves, fan-out friendly): reconcile the remaining FS-5100 registries
  (workflow/agent/event/evidence/approval/KPI) and adopt FS-12000/13000/14000 as downstream spec.
