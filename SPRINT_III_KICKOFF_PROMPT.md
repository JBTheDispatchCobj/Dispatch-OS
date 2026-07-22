ultracode — Olympic Sprint III, Wave 1 (Connectors & scale — OPENS Sprint III). The Dispatch OS /
Cooperative Markets repo folder is connected as context — LIST it and read from it before anything else (do
not assume; verify the files exist). Multi-agent orchestration is authorized: fan out agents/workflows per
independent workstream; you integrate and run the debug gate. Adversarially verify before committing.
ORIENT FIRST — read these in order, then confirm you're oriented in one short paragraph:
1. README.md
2. docs/00_governance/DOCTRINE.md
3. docs/00_governance/CURRENT_STATE.md
4. docs/00_governance/ACTIVE_BUILD.md
5. docs/00_governance/BUILD_PROGRESS.md   (the % tracker — Sprint II closed at ~50%; keep it current)
6. docs/00_governance/OLYMPIC_SPRINT_ROADMAP.md   (Sprint III target ~68% — RE-BASELINE it against the real
   ~50% Sprint-II close per its own caveat #4 before projecting)
7. HANDOFF.md
8. DEBUG_LOG.md
9. docs/00_governance/SPRINT_PLAN.md
Then skim what Sprint III builds on: core/registry/{service,supabase-store,governed_registry,resolver}.ts (the
registry live-persistence + governed-write + matured-resolution stack — Wave 4), core/data/supabase-table-client.ts
(the real @supabase/supabase-js binding for the narrow {upsert,selectAll} seam), core/profile/persistence.ts +
db/migrations/0018 (the profile persistence seam Sprint III POPULATES at scale), core/registry/types.ts
(ConnectorSpec / SourceRegistryEntry — the DKR connector/source manifests), cartridges/cooperative_markets/
{ingest_call_report,ingest_batch,batch_fixtures,ingest_regulations}.ts (the ingestion the connector runtime
replaces the fixtures behind), core/kernel/{envelope,contracts,event_bus,cost_ledger}.ts (route a connector run
through an envelope-correlated contract), scripts/debug-loop.mjs (12 steps), tests/*.test.mjs (214 unit tests),
.github/workflows/ci.yml.
STATE (do not regress): Migrations 0001–0017 APPLIED; 0018 written + additive, Bryan-only apply. Sprint II shipped
identity+permissions (W1), confidence-driven live profile assembly + query (W2), the kernel request envelope +
contracts/API (W3), and the registry live-persistence client + matured entity resolution + profile PERSISTENCE (W4).
debug-loop ALL GREEN (12/12), 214 unit tests. The governance docs are current. Default stays in-memory; the Supabase
adapters drop in when SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY are set + 0018 applied.
ANTI-CLOBBER (Bryan's rule) — BEFORE changing anything: run `git status` in the repo and confirm the working tree is
clean. The last pushed commit should be the Sprint-II-Wave-4 commit. Never overwrite a file on disk without first
confirming it hasn't changed since you last read it.
EXECUTE — Sprint III (Connectors & scale, target ~68%): run the network on breadth of REAL sources, not fixtures.
Additive; config-as-data; no vertical nouns in core/; the connector runtime is generic (verticals declare connectors
as config). Suggested shape (fan out; do a wave per independent workstream, checkpoint each):
* Connector runtime + SDK (RFC-2011 + Vol IX) — a generic connector RUNTIME in core/ that executes a ConnectorSpec:
  typed Connector Output Contract, parser contract, change_event / quality_report / connector_health, failure
  semantics; a connector run is authorized + correlated through a kernel envelope/contract and emits KernelEvent +
  CostEntry. Qualify the ~93 placeholder connectors from the DKR (config-as-data, not code forks). Moves connectors
  20→70, kernel 55→70.
* Full-market NCUA 5300 ingestion — a REAL per-CU 5300 connector (bulk NCUA Call Report data) → institution profiles
  at scale, PERSISTED through the Wave-4 profile seam (core/profile/persistence.ts), retiring batch_fixtures.ts. Keep
  evidence/source/confidence/lineage; NEVER a regulated conclusion in a weight. Moves truth 45→60, cartridge 85→92.
* Startup-intake connector — feed the deal engine (P1/P2) on real intake, not seed inputs (the DEFERRED "live intake
  path" note), through the connector runtime.
* Add a debug-loop CONNECTOR step + unit tests per new connector/runtime (the output-contract shape; change_event/
  quality_report determinism; a connector run correlates to its envelope; persisted profiles reconcile to source).
OPERATING RULES (every wave): additive only; config-as-data; no vertical nouns in core/; NEVER a regulated/financial
conclusion in weights (persist evidence/source/confidence/lineage; route regulated conclusions + publication through
the human gates — ICApproval + EditorialDisposition are the patterns); truth tiers/planes not conflated;
pure/deterministic modules (caller injects ids/timestamps). Connectors NORMALIZE — no business logic in a connector.
DEBUG AS YOU GO: log to DEBUG_LOG.md tagged [BLOCKER]/[NON-BLOCKING]/[DEFERRED]; fix blockers now.
DEBUG GATE before a wave is done: `npm install` once if needed, then `node scripts/debug-loop.mjs` ALL GREEN (now
includes REGISTRY-PERSISTENCE — ADD a new debug-loop check + unit tests for every new engine/service/connector per
wave) + `npx tsc --noEmit` clean + `npm run build` exit 0 + `npm test` green. Adversarially verify findings.
CHECKPOINT + CONTEXT DISCIPLINE (Bryan's rules):
- Checkpoint at the END OF THE WAVE: update BUILD_PROGRESS (recompute % HONESTLY — re-baseline vs the roadmap, don't
  inflate to a target), CURRENT_STATE, ACTIVE_BUILD, DEBUG_LOG; write a fresh HANDOFF.md; append the next kickoff
  prompt; give Bryan the exact git add/commit/push command.
- MONITOR YOUR OWN CONTEXT WINDOW. At ~80% capacity, STOP, checkpoint cleanly, hand back a fresh first-prompt for the
  next chat, and do NOT start work you can't finish. A truncated wave is the failure mode.
- The Dispatch sandbox's git cannot commit/push (restricted VM). Write files to disk, then hand Bryan the exact
  command to run in his Mac terminal. The cloud session moves files onto the Mac via a staging tarball extracted in
  the repo (mount blocks overwrite/unlink, so the handback command should `tar xzf` the staging tarball in the repo,
  then `rm -f` it). Start the command with `rm -f .git/index.lock && rm -rf _to_delete` and remove any
  `_cloudsync_in.tgz` / `_cloudsync_out.tgz` / `_wave*_incoming.tgz` / `_wave*_srcsnapshot.tgz` stragglers. Verify with
  `git status` first; never assume a push happened. git push + apply 0018 + the investment-vehicle decision + VC/Alloya
  legal are Bryan-only — route around, don't block.
Go — orient, verify no lost updates, execute Sprint III with checkpoints, pass the debug gate, and hand back a clean
commit command + the next kickoff.
