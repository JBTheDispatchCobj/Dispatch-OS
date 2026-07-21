# VC Deal Engine — Specification

Status: Draft (spec-before-build) · Authority: ADR-0016 · Vertical: Cooperative Markets (Vol V,
RFC-5007 Opportunity / RFC-5009 Investment) · Builds on: `cartridges/cooperative_markets/` +
the Volume XI ontology (`core/registry/data/ontology/*`).

## 1. Purpose
The VC Deal Engine is the monetization arm of Cooperative Markets: it automates the path from an
innovation company entering the network to a sourced, diligence-backed, human-approved
investment/partnership decision, then syndicates or allocates that deal to paying subscribers.
It is the operational form of Auric Works filing as a VC — "invest on behalf of both sides of
the market and charge for direct access to deal flow and partnerships."

It does **not** replace the cartridge; it is the pipeline + scoring + memo + allocation layer
that runs on the cartridge's `diligence` / `investment_decision` workflows and readiness/
opportunity metrics.

## 2. Scope (from ADR-0016)
- **Vehicle-agnostic, advisory/syndication-first.** Core = intake → score → diligence → IC memo
  → allocation. The **settlement vehicle is a pluggable adapter**; `advisory`/`syndication` ship
  now, `fund`/`spv` attach later without reworking the core.
- **Subscribers:** credit unions / FIs (curated deal flow + co-invest access) and LPs /
  co-investors (co-invest access). Advisory/syndication deals also earn placement fees + carry.
- **Truth discipline:** scores are sourced inferences; the IC memo draws from approved evidence
  only; the recommendation is a committee-/human-approved proposal with lineage.

## 3. Pipeline (the deal lifecycle)
Grounded in the library's Deal Pipeline + Auric Network deal flow. Each stage is a cartridge
workflow/relationship-stage; each artifact is a canonical object with evidence, source, and
provenance.

```
Intake            innovation company enters (startup_intake / Auric profile / referral)
  ↓  score        Innovation / Institution / Startup / Dispatch readiness + opportunity score
Screening         does it clear category-fit + compliance-readiness thresholds?  (human-gated)
  ↓  match        route to target CU(s) + executive lens  (proposal → match_review)
Diligence         DD categories (below); evidence collected + reviewed
  ↓  IC memo       assembled FROM approved evidence only; recommendation + conditions
Committee         multi-party approval (invest / partner / pass) with rationale + lineage
  ↓  allocate      syndicate/allocate to subscribers (CUs, LPs) per interest + eligibility
Settlement        pluggable vehicle adapter (advisory | syndication | fund | spv)
  ↓  monitor       portfolio monitoring: KPIs, milestones, covenants, follow-on signals
Exit              strategic sale / IPO / recap / secondary  (tracked continuously)
```

Maps to the relationship ladder already on `cooperative_markets:partnership`:
discovery → evaluation → pilot → integration → partnership → **investment** → monitoring.

## 4. Core objects
All map to existing ontology `schema_ref`s / cartridge entities — additive, no new core nouns.

| Engine object | Backing canonical object | Notes |
|---|---|---|
| Deal / Opportunity | `cooperative_markets:innovation_company` + `relationship` | The unit that moves through the pipeline. |
| Startup Profile | `financial_services:innovation_ecosystem:startup` (+ `:startup_readiness`) | Library "Startup Profile" fields. |
| Product | `financial_services:innovation_ecosystem:product` | Capability being evaluated. |
| Diligence | `cooperative_markets:diligence` workflow | DD categories → evidence sets. |
| IC Memo | `financial_services:innovation_ecosystem:investment_committee_memo` | Assembled from approved evidence. |
| Investment Thesis | `financial_services:innovation_ecosystem:investment_thesis` | Frames the opportunity. |
| Investment | `financial_services:investments:investment` | The committed position (post-decision). |
| Settlement vehicle | `capital_markets:fund` / `capital_markets:spv` | **Pluggable**; empty in advisory mode. |
| Allocation | `capital_markets:participation` / `:syndication` | Deal split across subscribers. |
| Subscription | (new cartridge outcome: `deal_flow_access`) | CU + LP paid access tiers. |

## 5. Scoring model (Dispatch inferences)
The library's evaluation triad, computed as sourced inferences with per-factor lineage (never
weights-only). Each score persists inputs, source, freshness, and confidence.

- **Innovation Score** — market-facing capability/innovation signal for a company (public tier).
- **Startup Readiness** — how institution-grade the company is: compliance (SOC 2, policies),
  security, references, integration maturity, financial stability, funding.
- **Institution Readiness** — the target CU's capacity to adopt: executive support, budget,
  tech/ops capacity, security/compliance, strategic alignment, digital/AI maturity.
- **Dispatch Readiness** — how cleanly the company integrates with Dispatch (API maturity,
  connector availability) — the technical adoption signal.
- **Opportunity Score** — `strategic_fit × regulatory_fit × timing` for a specific CU↔company
  pairing; the routing/prioritization signal.

Cartridge metrics already declared: `institution_readiness`, `startup_readiness`,
`innovation_score`, `opportunity_score`. This spec adds `dispatch_readiness` as a sibling.

## 6. Diligence + IC memo
Due-diligence categories (from the library): corporate, legal, financial, tax, commercial,
operational, technology, cybersecurity, insurance, regulatory, vendor, **compliance-fit**, **AI
readiness**, **operational maturity**, **innovation capability**. Each category yields evidence,
findings, risks, open items, owners, deadlines.

The **IC memo** (`investment_committee_memo`) is assembled by the cartridge `report` agent
**from approved evidence only**, lensed by reader role (a CEO reads strategic fit + franchise
value; a CRO/CLO reads risk + regulatory fit; a CFO reads returns + capital). It carries:
thesis, market/competitive analysis, financial model summary, DD findings, risks + mitigations,
scenario/sensitivity, **recommendation**, conditions, and a source-citation map. The
recommendation is a **proposal**; the committee decision (invest / partner / pass) is the
human-approved gate, recorded with rationale and lineage.

## 7. Allocation, subscribers & monetization
- **Credit unions / FIs** — subscription for curated, diligence-backed deal flow + first look at
  co-invest; delivered through the Institution Terminal feed, lensed by executive role.
- **LPs / co-investors** — subscription for access to co-invest alongside Auric Works' deals.
- **Allocation** splits an approved deal across interested, eligible subscribers
  (`participation`/`syndication` objects), respecting accreditation/eligibility gates
  (KYC/KYB/accreditation from the compliance ontology).
- **Fees:** subscription (recurring) + placement fee (per syndicated deal) + carry (on
  advisory/syndication economics). Vehicle-mode economics (management fee/waterfall) attach with
  the fund/SPV adapter.

## 8. Settlement vehicle (pluggable)
A `SettlementVehicle` adapter interface with a stable contract (open → allocate → call capital →
close → distribute), implemented per mode:
- `advisory` (default) — no capital held; Auric Works arranges + earns fees/carry.
- `syndication` — allocate to CUs/LPs directly; `participation`/`syndication` objects.
- `fund` — *(future)* `capital_markets:fund` + `capital_call`/`distribution`; Alloya fund-admin.
- `spv` — *(future)* `capital_markets:spv` per deal; Alloya deal-admin.

The core pipeline is identical across modes; only settlement differs. **Alloya** is the
fund/deal-administration connector (`connector:fund_admin`) at this layer, vehicle-agnostic.

## 9. Truth & governance
- Scores are calculations over sourced facts with lineage; no regulated/financial conclusion in
  weights or prompts alone (DOCTRINE; ADR-0005).
- The IC memo cites only approved evidence; the recommendation is a proposal; the committee
  decision is the human gate (`operations:approval`, multi-party per ADR-0016).
- Every deal artifact identifies source objects + model/human provenance (CLAUDE.md).
- Accreditation/eligibility and KYC/KYB gates (compliance ontology) precede any allocation to a
  subscriber.

## 10. Build plan (phased, additive)
1. **P1 — Intake + scoring (vehicle-agnostic).** Startup intake → profile assembly → the
   readiness triad + opportunity score as sourced inferences, on the cartridge. Extends
   `startup_screening` / `opportunity_triage`. *(First build after this spec.)*
2. **P2 — Diligence + IC memo.** DD category checklists + evidence gating + IC-memo assembly
   from approved evidence (the `report` agent), role-lensed.
3. **P3 — Allocation + subscriber tiers.** Match/route to CU + LP subscribers; allocation
   objects; eligibility/accreditation gates; deal-flow-access outcome + metrics.
4. **P4 — Settlement adapters.** `advisory`/`syndication` first; `fund`/`spv` when the vehicle is
   decided (follow-on ADR) + the Alloya fund-admin connector.

## 11. Deferred
Actual fund/SPV formation + securities-law execution; carry/waterfall accounting; secondary-
market mechanics. Innovation-company and CUSO paid tiers (subscription subjects deferred per
ADR-0016). These attach as later increments without reworking the core pipeline.
