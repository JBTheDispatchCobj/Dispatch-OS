# Dispatch OS

Dispatch OS is an industry-agnostic operating kernel that turns inputs into sourced intelligence, proposals, work, evidence, outcomes, and network learning.

## Brand and product hierarchy
- **Auric Works** — company, operator, manager, partner, investor, and builder.
- **The Auric** — free, personalized publication and market feed.
- **[Institution] Terminal** — paid institutional product.
- **Dispatch** — internal orchestration, knowledge, workflow, model-routing, and cartridge engine.

## First vertical
Cooperative Markets connects credit unions and innovation companies in both directions:
- Make institutions innovative.
- Make innovation institutional-grade.

The system begins with public profiles for the full credit-union market, public and submitted innovation-company profiles, personalized intelligence, and relationship workflows spanning discovery, evaluation, pilot, integration, partnership, investment, and monitoring.

## Start here
- Developer/agent instructions: `CLAUDE.md`, `AGENTS.md`
- Product doctrine: `docs/00_governance/DOCTRINE.md`
- Current implementation status: `docs/00_governance/CURRENT_STATE.md`
- Current work: `docs/00_governance/ACTIVE_BUILD.md`
- Documentation map: `docs/context/CONTEXT_MAP.yaml`
- Master product map: `docs/02_product/MASTER_PRODUCT_MAP.md`

## Context pack usage
```bash
python scripts/build_context_pack.py cooperative-markets
python scripts/build_context_pack.py intelligence
python scripts/build_context_pack.py model-harness
```
Generated packs are written to `.context/` and intentionally excluded from source control.
