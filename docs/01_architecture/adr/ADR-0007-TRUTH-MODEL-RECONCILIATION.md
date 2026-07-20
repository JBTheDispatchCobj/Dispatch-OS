# ADR-0007 — Reconcile the DKR truth model with the canonical truth hierarchy

## Status
Accepted — 2026-07-19.

## Context
The DKR states its own truth categories — Public Fact, Institution Verified,
Dispatch Inference, Human Opinion, Third Party Reporting, Generated
Recommendation. These overlap but do not match the canonical seven-tier
hierarchy in `DOCTRINE.md` / ADR-0005 (`core/truth/types.ts` `TruthTier`).
CLAUDE.md forbids silently changing doctrine.

## Decision
Keep the canonical `TruthTier` as the single source of truth. Do **not** fork or
rename it. Map the DKR terms onto it, and treat two DKR "tiers" as category
errors that belong to other objects:

| DKR term | Canonical mapping |
|---|---|
| Public Fact | `public_fact` |
| Third Party Reporting | `third_party_claim` |
| Human Opinion | `third_party_claim` (a claim; `provenance_metadata.claim_subtype = "opinion"`), promoted to `human_approved_conclusion` only when a human endorses it |
| Dispatch Inference | `dispatch_inference` |
| Institution Verified | `institution_verified_fact` |
| Generated Recommendation | **not a tier** — it is an `IntelligenceObject` / `ContentVariant` output, itself grounded in tiered truth objects |
| (canonical, no DKR equivalent) | `deterministic_calculation`, `private_tenant_fact` retained |

## Consequences
- No code churn: `core/truth/types.ts` and migrations `0011`–`0014` are
  unchanged; the mapping is documentation + a `claim_subtype` convention in
  `provenance_metadata` (the extension slot, not a new column).
- "Generated Recommendation never becomes truth without attribution" (DKR) is
  already enforced structurally: a `ContentVariant` carries `source_refs` back to
  the truth objects it restates and never invents facts.
- If "Human Opinion" later needs to be a distinct queryable tier, that is a
  future additive migration + enum extension, proposed as its own ADR.
