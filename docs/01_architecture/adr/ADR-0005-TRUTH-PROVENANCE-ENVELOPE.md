# ADR-0005 — Truth tiers as an assertion family with a provenance envelope

## Status
Accepted — 2026-07-19.

## Context
`DOCTRINE.md` defines a seven-level truth hierarchy and CLAUDE.md forbids
placing regulated/financial conclusions solely in model weights or prompts.
Before this, "truth" existed only as prose (CORE_OBJECT_MODEL §5); there was no
persisted way to keep public fact, third-party claim, deterministic calculation,
inference, verified fact, tenant fact, and human conclusion distinct, or to
record how any of them was produced.

## Decision
Model truth as a **family of assertion objects** — `observations`, `claims`,
`calculations`, `inferences`, `verifications` — sitting above an immutable
`source_documents` record. Every assertion carries a shared **provenance
envelope** as indexed columns (`method`, `asserted_by`, `confidence`,
`source_document_ids`, `source_ids`, `derived_from_ids`, `model_reference`,
`agent_run_id`) plus a **bi-temporal** stamp (`observed_at`, `valid_from`,
`valid_to`, `stale_after`) and an explicit `tier`. A `TruthTier` precedence map
(`core/truth/types.ts`) declares which tier wins on conflict; full resolution is
a later step.

## Consequences
- Assertion is separated from interpretation (observation ≠ inference), and the
  seven tiers can never be silently conflated — the tier is a column.
- Every inference/verification persists its evidence, source, method, and
  lineage, satisfying the "never solely in weights/prompts" rule structurally.
- Bi-temporal fields let a fact be known now and effective later (e.g. an NCUA
  amendment published today, effective on a future `valid_from`).
- Provenance is columns, not a jsonb blob (`provenance_metadata` only extends),
  per `DATA_ARCHITECTURE.md`. Cost: five near-identical tables; accepted for RLS
  and index simplicity over table inheritance.
