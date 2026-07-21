# Paste this into a fresh chat to start the Olympic Sprint

---

ultracode — Olympic sprint, blaze not burn. The repo folder is connected (Dispatch OS,
Cooperative Markets). Multi-agent orchestration is authorized: fan out agent fleets/workflows,
one agent per independent workstream; you integrate and run the debug gate.

Read in this order first (the operating contract), then confirm you're oriented in one short paragraph:
1. README.md
2. docs/00_governance/DOCTRINE.md
3. docs/00_governance/CURRENT_STATE.md
4. docs/00_governance/ACTIVE_BUILD.md
5. docs/00_governance/BUILD_PROGRESS.md
6. HANDOFF.md (most recent session summary)
7. DEBUG_LOG.md (running debug notes)
8. docs/00_governance/SPRINT_PLAN.md (the sprint — waves, rules, targets)

Then skim so you know the substrate you're wiring together: core/registry/ontology.ts,
cartridges/cooperative_markets/{cartridge,deal_engine,ic_memo,allocation,settlement,ingest_call_report}.ts,
core/kernel/{event_bus,cost_ledger}.ts, core/truth/confidence.ts, core/harness/router.ts,
core/auric/engine.ts, and scripts/debug-loop.mjs.

Mode:
- Execute **Wave 1 (Orchestration spine)** from SPRINT_PLAN.md: build the runnable pipeline that
  chains ingest(5300) → score (P1) → IC memo (P2) → allocate (P3) → settle (P4) → assembleIO →
  renderVariants → buildFeed, emitting kernel events + cost entries, routed through the harness.
  Ship `cartridges/cooperative_markets/pipeline.ts` + `scripts/pipeline-demo.ts`. Fan out agents
  (pipeline composer · kernel wiring · harness integration · golden-path demo/test).
- **Debug as we go:** log findings to DEBUG_LOG.md tagged [BLOCKER]/[NON-BLOCKING]/[DEFERRED];
  fix blockers immediately, keep moving on the rest.
- **Debug gate before you call Wave 1 done:** `npm install` (once), then `node scripts/debug-loop.mjs`
  must be ALL GREEN (extend the ENGINE step with the new pipeline invariants). Also `npx tsc --noEmit`.
- **Session close:** update BUILD_PROGRESS (recompute %), CURRENT_STATE, ACTIVE_BUILD, DEBUG_LOG;
  write a fresh HANDOFF.md; give me the exact `git add/commit/push` command (I run git from my Mac).
- Additive only; config-as-data; no regulated/financial conclusion in weights (persist evidence/
  source/confidence/lineage); truth tiers/planes not conflated; vehicle-agnostic (fund/SPV TBD).

Bryan-only (route around, don't block): apply migrations 0016+0017 in Supabase; decide the
investment vehicle; git push; VC/Alloya legal. When you hit one, note it and keep sprinting.

Go. Fan out Wave 1, integrate, pass the debug gate, and hand back a clean commit + the next command.
