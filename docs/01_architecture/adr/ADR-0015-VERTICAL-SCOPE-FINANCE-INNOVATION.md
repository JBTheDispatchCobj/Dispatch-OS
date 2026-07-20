# ADR-0015 — Vertical scope: the finance / VC / CU / fintech / innovation stack; Hospitality descoped from Volume XI

## Status
Accepted — 2026-07-20.

## Context
The supplied `DISPATCH_OS_REMAINING_ROADMAP.md` (Sprints 1–10) listed a
**Hospitality Ontology** among the Volume XI Sprint-1 deliverables and
"Hospitality" among the Sprint-2 truth models — carried over from an earlier,
broader multi-industry framing. The kickoff for this session likewise named a
Hospitality pack as "the second vertical."

The product is a **market-intelligence terminal for the finance /
venture-capital / credit-union / fintech / innovation stack** — a "Bloomberg"
for that world (Cooperative Markets: institutions ↔ innovation companies).
Hospitality is not one of its verticals. Authoring a Hospitality ontology would
have anchored objects on the `real_estate` family (hotel/room/FF&E) and pulled
the canonical object graph away from the intended domain.

## Decision
1. **In scope for Volume XI:** the finance/innovation stack — credit unions and
   other depositories, fintech/neobank, VC/PE/private-credit and investment/
   merchant banking, lending and deposits, capital markets, compliance and
   regulation of both sides, and the innovation ecosystem (startups, pilots,
   partnerships, investment theses).
2. **Hospitality is descoped** as a Dispatch vertical. The Hospitality Ontology
   (Sprint 1) and Hospitality truth model (Sprint 2) are struck from the plan of
   record. The pre-existing `cartridges/hospitality/` example cartridge is left
   untouched as a generic cartridge-SDK demonstration, not a product vertical.
3. This is a **scope decision, not a platform change**: no code, migration, or
   catalog churn. The 341-class Financial Services catalog and its `real_estate`
   family are unchanged and remain available; they are simply not the anchor of a
   hospitality product ontology.

## Consequences
- `DISPATCH_OS_REMAINING_ROADMAP.md` Sprint 1/2 updated to remove Hospitality and
  reflect the finance/innovation scope (this ADR is the authority for that edit).
- Volume XI Sprint-1 packs proceed on the in-scope domains. This session added
  three packs on the existing `core/registry/ontology.ts` schema:
  **Lending & Deposits** (30 objects), **Capital Markets & Institutions**
  (54 objects), and **Innovation Ecosystem** (16 objects) — alongside the Credit
  Union anchor pack (13). Closed graph, 0 unresolved references, `tsc` clean.
- Remaining Sprint-1 ontology packs: Compliance, Regulation, Technology/Vendor,
  and AI (all finance-native families already in the catalog).

## Authority
Constitution (Vol I) → ADRs → volumes II–XI → registries → `ACTIVE_BUILD.md`.
This ADR governs vertical scope for the ontology program; it does not amend any
platform contract.
