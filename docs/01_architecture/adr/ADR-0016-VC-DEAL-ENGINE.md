# ADR-0016 — VC Deal Engine: vehicle-agnostic, advisory/syndication-first; CU + LP subscriptions

## Status
Accepted — 2026-07-20.

## Context
The Cooperative Markets cartridge (ADR-0014/0015 + the Volume XI ontology) turns the CU ↔
innovation-company market into a running loop. Its monetization arm — the way Auric Works
makes money on top of that intelligence — is the **VC Deal Engine**: automated startup intake
→ score-against-target-market → diligence → IC memo → committee decision → syndication /
allocation → portfolio monitoring. This ADR records the two business-model decisions that
shape the engine's core objects, so the spec (`docs/03_subsystems/VC_DEAL_ENGINE_SPEC.md`)
can be built without guessing.

Grounding: Bryan's Institutional Intelligence Library ("fintech venture vendor side") supplies
the canonical vendor/venture framing this engine consumes — the FinTech Evaluation Framework,
the Startup Profile, the **Institution Readiness / Startup Readiness / Innovation Score /
Dispatch Readiness** scoring set, the Deal Pipeline (Lead → Opportunity → Screening → … → IC →
Closing → Portfolio → Exit), the Investment-Committee objects, the Due-Diligence categories,
and the Auric Network deal flow (DISCOVERS → MATCHES → PROVIDES → VALIDATES → IMPLEMENTS →
MEASURES → INVESTS → BECOMES STANDARD).

## Decision

### 1. Capital model: advisory / syndication-first, vehicle-agnostic (vehicle TBD)
Auric Works will file as a VC, but the **investment vehicle (fund vs. per-deal SPV) is not yet
decided.** Therefore the engine is designed **vehicle-agnostic**: intake → scoring → diligence
→ IC memo → allocation are built as the stable core, and the **settlement vehicle is a
pluggable adapter** (`advisory` / `syndication` now; `fund` and `spv` adapters added later
without reworking the core). The default operating mode is **advisory/syndication**: Auric
Works matches, diligences, and syndicates deals to CUs and LPs, earning subscription + placement
fees and carry — no balance-sheet principal assumed. A fund or SPV attaches later as a settlement
adapter over the same objects (the ontology already carries `capital_markets:fund`,
`capital_markets:spv`, `investments:investment`, `capital_markets:capital_call/distribution` as
the future settlement targets).

### 2. Monetization: CU/FI and LP subscriptions, plus placement fees + carry
Two paying subscriber classes (per Bryan): **credit unions / FIs** (monthly access to curated,
diligence-backed innovation deal flow + first look at co-invest) and **LPs / co-investors**
(access to co-invest alongside Auric Works' deals). Both are subscription tiers over the same
deal pipeline; advisory/syndication deals additionally earn placement fees and carry. Innovation
companies and CUSOs are **not** subscription subjects in this increment (deferred, not denied —
their terminals can add paid tiers later).

### 3. Truth discipline (unchanged, load-bearing here)
Scores (opportunity, institution/startup/innovation/Dispatch readiness) are **Dispatch
inferences** — deterministic calculations over sourced facts, each factor traceable to an
assertion/source/confidence. The IC memo is assembled **from approved evidence only**. An
investment recommendation is a **committee-/human-approved proposal** with lineage, never a
conclusion in model weights (DOCTRINE; ADR-0005). Every deal artifact identifies its source
objects and model/human provenance (CLAUDE.md change policy).

## Consequences
- The engine builds additively on the existing cartridge (`diligence` / `investment_decision`
  workflows, opportunity/readiness metrics) and ontology — no core/migration churn.
- The vehicle decision can be deferred without blocking the build: everything up to allocation
  is vehicle-agnostic; only the settlement adapter waits on the fund/SPV choice.
- Alloya (fund/deal administration) is a settlement-layer connector (`connector:fund_admin`)
  that works regardless of the vehicle chosen.
- Deferred: actual fund/SPV formation mechanics, securities-law execution, and carry/waterfall
  accounting — these attach when the vehicle is chosen (a follow-on ADR will record it).

## Authority
Constitution (Vol I) → ADRs → volumes II–XI → registries → `ACTIVE_BUILD.md`. This ADR governs
the VC Deal Engine's business model and object scope within the Cooperative Markets vertical; it
amends no platform contract.

## Note (for a later cleanup, non-blocking)
The supplied library labels its agent volume "Volume XI — Agent Intelligence," which collides
with the repo's **Volume XI = Canonical Ontology** (ADR-0014). Flagging for reconciliation when
the library is folded into the docs set; it does not affect this ADR.
