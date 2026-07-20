# ADR-0008 — Adopt Dispatch Constitution V1; reconcile truth-tier and language deltas

## Status
Accepted — 2026-07-20.

## Context
A formal **Dispatch Constitution V1.0** (51 articles + appendices) and a
**10-Volume Specification Program** roadmap were authored. The Constitution
restates and extends existing doctrine and defines the specification hierarchy:
ADRs amend the Constitution (Art. 37/38/50). A reconciliation pass against the
committed build (core/ contracts, migrations 0011–0015 applied to Supabase,
ADR-0004..0007) found alignment nearly everywhere, with **one genuine conflict**
and a handful of vocabulary deltas.

## Decision
1. **Adopt Constitution V1 as Volume I** — the top of the spec hierarchy —
   stored under `docs/00_governance/constitution/`. `DOCTRINE.md` remains the
   short readable summary; the Constitution is the authority, read by section
   (not in full every session). Volumes II–X are the forward spec backlog
   (`ACTIVE_BUILD.md`).

2. **Truth tiers (conflict C-1).** Article 10 enumerates a different 7-member
   list (adds *human opinion, generated recommendation, unresolved conflict*;
   omits *deterministic_calculation, private_tenant_fact, human_approved_conclusion*).
   The committed 7-value `TruthTier` (ADR-0005/0007) **governs** — it is richer
   and already implemented + applied to Supabase. Article 10's extra terms
   reconcile as (per ADR-0007):
   - *human opinion* → `third_party_claim` with `provenance_metadata.claim_subtype = "opinion"`.
   - *generated recommendation* → **not a tier**; an `IntelligenceObject`/`ContentVariant` output.
   - *unresolved conflict* → **not a tier**; a coexistence/resolution state (assertions coexist; `superseded_by_id` + the future truth-resolver).
   Article 10's list is logged as a **V1.1 erratum** (below).

3. **Language deltas (N-1..N-5).** Adopt the committed enums as canonical:
   - `plane` (shared_market | private_terminal | control) + `visibility`
     (public | network | tenant_private | relationship_private | personal)
     supersede the informal "Market Graph / Private Graph" (Art. 5/20).
   - The assertion family (observations, claims, calculations, inferences,
     verifications) + `source_documents` are canonical truth vocabulary.
   - Lens taxonomy is role | institution | person | cartridge | channel (repo
     "person"); the Constitution's "objective" lens is **not adopted now**
     (possible future addition).
   - "$2 Bill" channel slug = `two_dollar_bill`; `terminal_feed`/`api` added.
   - "Cooperative Markets domain" = the Cooperative Markets **cartridge** package.

4. **No code churn.** Nothing in `core/` or migrations 0011–0015 changes. The
   reconciliation is documentation; the deltas are recorded as V1.1 errata.

## Consequences
- One spec hierarchy: Constitution (Vol I) → ADRs → subsystem volumes (II–X) →
  registries → `ACTIVE_BUILD`. Context packs are generated from these and are
  never independent sources of truth.
- Forward backlog = Volumes II–X (kernel; truth/graph engine incl. RLS;
  harness; publication; terminal; cartridge SDK; Cooperative Markets; connector
  registry; dev/repo SDK). Mirrored into `ACTIVE_BUILD.md`.

## Constitution V1.1 errata (to fix in the source doc, non-blocking)
- **Art. 10** — replace the tier list with the canonical `TruthTier` (7 values);
  move recommendation/opinion/conflict out of the tier enum.
- **Art. 5** — add canonical terms: `calculations`, `verification`,
  `source_documents`, and the `plane`/`visibility` enums.
- **Art. 5/Appendix E** — lens dimension "objective" → "person" (or add person).
