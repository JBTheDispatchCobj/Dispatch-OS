ultracode — Olympic Sprint II, Wave 1 (Kernel & Truth platform). The Dispatch OS / Cooperative Markets repo
folder is connected as context — LIST it and read from it before anything else (do not assume; verify the
files exist). Multi-agent orchestration is authorized: fan out agents/workflows per independent workstream;
you integrate and run the debug gate. Adversarially verify before committing.
ORIENT FIRST — read these in order, then confirm you're oriented in one short paragraph:
1. README.md
2. docs/00_governance/DOCTRINE.md
3. docs/00_governance/CURRENT_STATE.md
4. docs/00_governance/ACTIVE_BUILD.md
5. docs/00_governance/BUILD_PROGRESS.md   (the % tracker — we closed Sprint I at ~38%; keep it current)
6. docs/00_governance/OLYMPIC_SPRINT_ROADMAP.md   (Sprint II target ~55%)
7. HANDOFF.md
8. DEBUG_LOG.md
9. docs/00_governance/SPRINT_PLAN.md
Then skim what Sprint II builds on: core/kernel/{event_bus,cost_ledger,observability}.ts,
core/registry/service.ts (+ the RegistryPersistencePort seam + db/migrations/0016,0017),
core/truth/{confidence,types}.ts, core/profile/assemble.ts, core/data/supabase-adapter.ts,
cartridges/cooperative_markets/pipeline.ts, app/{terminal,market,distribution,observability}/*,
scripts/debug-loop.mjs (8 steps: TYPECHECK·ONTOLOGY·CARTRIDGE·ENGINE·PIPELINE·DATA·EDITORIAL·TESTS),
tests/*.test.mjs (92 unit tests), .github/workflows/ci.yml.
ANTI-CLOBBER (Bryan's rule) — BEFORE changing anything: run `git status` in the repo and confirm the working
tree is clean / only what you expect. The Wave-4-complete commit should be the last pushed commit; verify it.
Never overwrite a file on disk without first confirming it hasn't changed since you last read it.
EXECUTE — Sprint II (Kernel & Truth platform; target ~55%). Suggested waves (each ends at the debug gate):
- **Identity & Tenancy (RFC-2002) + permission engine** — portable cross-org identity; a deterministic
  permission/authorization core in core/ (plane + visibility aware; no vertical nouns). Additive.
- **Object Registry service to live persistence** — IF Bryan has applied 0016+0017: implement a Supabase
  `RegistryPersistencePort` adapter behind the EXISTING seam (no change to ObjectRegistryService) and wire it;
  mature the match-candidate → human-gated merge pipeline across the shared-market plane. ELSE route around,
  keep in-memory, and build the adapter shape so it drops in after the apply.
- **Confidence engine driving LIVE profile assembly + query** — decay/propagate/outcome-feedback over real
  sourced facts (not fixtures); a query surface over assembled profiles.
- **Kernel request envelope + contracts/API layer (RFC-2001/2014)** — a typed request envelope + service
  contracts the surfaces call through (instead of importing engines directly).
OPERATING RULES (every wave): additive only; config-as-data; no vertical nouns in core/; NEVER a
regulated/financial conclusion in weights (persist evidence/source/confidence/lineage; route regulated
conclusions + publication through the human gates — ICApproval + EditorialDisposition are the patterns); truth
tiers/planes not conflated; pure/deterministic modules (caller injects ids/timestamps).
DEBUG AS YOU GO: log to DEBUG_LOG.md tagged [BLOCKER]/[NON-BLOCKING]/[DEFERRED]; fix blockers now.
DEBUG GATE before a wave is done: `npm install` once if needed, then `node scripts/debug-loop.mjs` ALL GREEN
(now includes TESTS 92/92 — ADD new unit tests for every new engine/service and a debug-loop check per wave) +
`npx tsc --noEmit` clean + `npm run build` exit 0 + `npm test` green. Adversarially verify findings.
CHECKPOINT + CONTEXT DISCIPLINE (Bryan's rules):
- Checkpoint at the END OF THE WAVE: update BUILD_PROGRESS (recompute %), CURRENT_STATE, ACTIVE_BUILD,
  DEBUG_LOG; write a fresh HANDOFF.md; append the next kickoff prompt; give Bryan the exact git add/commit/
  push command.
- MONITOR YOUR OWN CONTEXT WINDOW. At ~80% capacity, STOP, checkpoint cleanly, hand back a fresh first-prompt
  for the next chat, and do NOT start work you can't finish. A truncated wave is the failure mode.
- The Dispatch sandbox's git cannot commit/push (restricted VM). Write files to disk, then hand Bryan the
  exact command to run in his Mac terminal. The cloud session moves files onto the Mac via a staging tarball
  extracted in the repo (mount blocks overwrite/unlink, so cat files in place + quarantine strays in
  _to_delete/); the handback command should start with `rm -f .git/index.lock && rm -rf _to_delete` and remove
  any `_cloudsync_out.tgz` / `_wave*_incoming.tgz` stragglers. Verify with `git status` first; never assume a
  push happened. git push + Supabase migrations (0016/0017) + the investment-vehicle decision + VC/Alloya
  legal are Bryan-only — route around, don't block.
Go — orient, verify no lost updates, execute Sprint II with checkpoints, pass the debug gate, and hand back a
clean commit command + the Sprint-III kickoff.
