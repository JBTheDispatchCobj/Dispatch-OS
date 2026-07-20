# Current State

## Existing foundation
- Next.js app; Supabase/Postgres adapter + migrations (`0001`–`0015` applied;
  **`0016_market_rls.sql` written, pending apply**).
- Org/workspace scaffolding; generic entities; work items, evidence, proposals,
  approvals, reports, metrics, outcomes; rules; agent runs; widgets.
- Hospitality, wealth, field-service example cartridges.

## Governance
- **Dispatch Constitution V1** (Volume I); Art. 18 routing ladder amended to the
  canonical 9-rung (V1.1 erratum, ADR-0011).
- **Specification Program fully reconciled/adopted (Vols I–X).** Authored specs of
  record: Kernel Vol II (`volumes/kernel/`, RFC-2000..2015) and Vols III–VII
  (`volumes/{knowledge_graph,agent_harness,cooperative_markets,auric_engine,terminal}/`).
- ADRs: 0004 plane graph · 0005 truth envelope · 0006 DKR · 0007 truth reconciliation ·
  0008 Constitution V1 · 0009 Vol 3/8/9 · 0010 Vol 5/6/10 · 0011 Kernel Vol II ·
  0012 Vols III–VII adopted · **0013 Vols VIII–X adopted + spec-program numbering**
  (VIII=Execution Engine [new], IX=Connector, X=Object Registry; Cartridge SDK→kernel).

## Implemented contracts (code + applied Supabase)
Truth (`core/truth` + `0011`), Relationships (`0012`), Intelligence (`0013`),
Personal profiles (`0014`), DKR registry (`0015`). RLS (`0016`) written, not yet applied.

## Key reconciliation outcomes
- No code/migration churn from Vol adoption; all volume work is additive-forward.
- **Fact** = projection over verified-tier assertions + `Verification` (ADR-0005/0007
  intact); multi-source materialized fact store on the Volume III roadmap (ADR-0012).
- **Canonical Entity Model + entity resolution** (RFC-3002) is the top build bridge —
  incl. relaxing `entities.workspace_id` to nullable + plane/visibility.
- Kernel direction: unified event bus (RFC-2004) + cost/usage ledger (RFC-2008);
  portable cross-org identity (RFC-2002).
- Vocabulary reconciled onto canonical models (Fact→tier; Tenant→org/workspace/plane;
  RFC visibility→committed enum; Vol 7 UI "Workspace"→rename to avoid collision).

## Repos / backends
- GitHub: `JBTheDispatchCobj/Dispatch-OS` and `-Knowledge-Registry`, both `main`.
- Supabase: `0011`–`0015` applied (16 tables). Apply `0016` (RLS) next.

## Current priority
Program reconciled. Apply `0016` RLS in Supabase. Then BUILD, starting with the
Canonical Entity Model + entity resolution (RFC-3002 / kernel Object Registry), then
Identity & Tenancy (RFC-2002), then the Cooperative Markets cartridge.
