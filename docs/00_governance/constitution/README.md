# Dispatch Constitution + Specification Program

This folder holds the top of the specification hierarchy.

- **`VOLUME_1_DISPATCH_CONSTITUTION_V1.md`** — Dispatch Constitution V1.0 (51
  articles + appendices). The permanent principles, canonical language,
  boundaries, and acceptance rules. **Authoritative**, but read *by section* —
  do not read the whole file every session.
- **`SPECIFICATION_PROGRAM_AND_VOLUME_ROADMAP.md`** — the 10-Volume program.
  Volume I is the Constitution (here). Volumes II–X are the forward spec backlog.

## How this relates to the rest of the repo
- `docs/00_governance/DOCTRINE.md` is the **short summary** of the Constitution;
  the Constitution is the **authority**. When they appear to differ, the
  Constitution governs — except where an ADR amends it.
- **Specification hierarchy:** Constitution (Vol I) → ADRs → subsystem volumes
  (II–X) → registries → `ACTIVE_BUILD.md`. ADRs amend the Constitution
  (Art. 37/38/50). Context packs are generated from these files and are never
  independent sources of truth.

## Adoption + reconciliation
Adopted in **ADR-0008**. That ADR records the one real conflict found against the
committed build (Article 10's truth-tier list vs the canonical 7-value
`TruthTier`, resolved in favor of the committed model) and the minor language
deltas, plus a short **V1.1 errata** list to fix in the source doc. No code
changed on adoption.

## Read policy
Per the program's own rule: a session reads `CLAUDE.md`, the Constitution
*summary or the specific articles a task references*, `CURRENT_STATE.md`,
`ACTIVE_BUILD.md`, and one context pack — not every volume.
