ultracode — Olympic Sprint, Wave 4. The repo folder is connected (Dispatch OS, Cooperative
Markets). Multi-agent orchestration is authorized: fan out agents/workflows per independent
workstream; you integrate and run the debug gate. Adversarially verify before committing.
ORIENT FIRST (read in this order, then confirm you're oriented in one short paragraph):
1. README.md
2. docs/00_governance/DOCTRINE.md
3. docs/00_governance/CURRENT_STATE.md
4. docs/00_governance/ACTIVE_BUILD.md
5. docs/00_governance/BUILD_PROGRESS.md
6. docs/00_governance/OLYMPIC_SPRINT_ROADMAP.md   (the wave schedule; we are ~33%, ending Sprint I)
7. HANDOFF.md
8. DEBUG_LOG.md
9. docs/00_governance/SPRINT_PLAN.md
Then skim what Wave 4 builds on: core/auric/engine.ts (assembleIO/renderVariants/buildFeed),
cartridges/cooperative_markets/{pipeline,ingest_regulations,ingest_batch,batch_fixtures}.ts,
core/profile/assemble.ts, core/registry/service.ts, core/kernel/{event_bus,cost_ledger}.ts,
app/{terminal,market}/*, components/terminal/*, scripts/debug-loop.mjs (6 steps).
BEFORE CHANGING ANYTHING — anti-clobber (Bryan's rule): run `git status` in the repo and confirm
the working tree is clean / only what you expect. If Wave 3 has not been pushed yet, its files will
show committed or staged — do not discard them. Never overwrite a file on disk without first
confirming it hasn't changed since you last read it.
EXECUTE WAVE 4 — Auric distribution + hardening (see ROADMAP + ACTIVE_BUILD):
- Distribution / channels — brief / market-feed / terminal-feed channel variants over the Auric
  engine, each restating the IO's refs exactly (no superset). Proceeds now.
- Editorial verification gate — human-approved before publish (the pattern is the pipeline's
  ICApproval human gate; nothing regulated/published without a human disposition + lineage).
- Tests + CI — unit tests for the engines (deal engine, ic_memo, allocation, settlement, auric,
  confidence, profile/assemble, ingest_regulations, registry/service); wire scripts/debug-loop.mjs
  into CI as the commit gate.
- Observability — cost-ledger dashboards; event replay; health — over the kernel event bus + cost
  ledger already emitted per run.
- Cleanup — burn down DEBUG_LOG [NON-BLOCKING]/[DEFERRED] items where cheap (FinCEN object; the FR
  per-rule SourceDocument attribution; registry resolver external-id/merge guards; Volume XI label).
- Object Registry persistence — IF Bryan has applied 0016+0017, wire core/registry/service.ts to the
  supabase adapter behind the existing seam (else route around, keep in-memory).
OPERATING RULES (every wave): additive only; config-as-data; no vertical nouns in core/; NEVER a
regulated/financial conclusion in weights (persist evidence/source/confidence/lineage; route
regulated conclusions through the human gate — the pipeline's ICApproval gate is the pattern);
truth tiers/planes not conflated; pure/deterministic modules (caller injects ids/timestamps).
DEBUG AS YOU GO: log to DEBUG_LOG.md tagged [BLOCKER]/[NON-BLOCKING]/[DEFERRED]; fix blockers now.
DEBUG GATE before Wave 4 is done: `npm install` once if needed, then `node scripts/debug-loop.mjs`
ALL GREEN + `npx tsc --noEmit` clean + `npm run build` exit 0. Add a Wave-4 check to the debug loop
(e.g. the editorial gate has teeth: nothing publishes to a channel without an approved disposition).
Adversarially verify findings.
CHECKPOINT + CONTEXT DISCIPLINE (Bryan's rules — important):
- Checkpoint at the END OF EACH WAVE: update BUILD_PROGRESS (recompute %), CURRENT_STATE, ACTIVE_BUILD,
  DEBUG_LOG; write a fresh HANDOFF.md; append the next kickoff prompt; give Bryan the exact git add/
  commit/push command (git push + migrations + vehicle + legal are Bryan-only — route around, don't block).
- MONITOR YOUR OWN CONTEXT WINDOW. At ~80% capacity, STOP, checkpoint cleanly, hand back a fresh
  first-prompt for the next chat, and do NOT start a wave you can't finish.
- The Dispatch sandbox's git cannot commit/push (restricted VM: .git writes blocked, no identity). Write
  files to disk, then hand Bryan the exact command to run in his Mac terminal himself. Verify state with
  `git status` first; never assume a push happened. (The cloud session moves files onto the Mac via a
  staging tarball extracted in the repo — tell Bryan to `rm -f _wave*_incoming.tgz _stage_repo.tgz` before commit.)
Wave 4 closes Sprint I (~40% target — a demoable first product on real data, publishing to a lensed
feed). Go — orient, verify no lost updates, execute Wave 4 with checkpoints, pass the debug gate, hand
back a clean commit command + the Sprint-II kickoff.
