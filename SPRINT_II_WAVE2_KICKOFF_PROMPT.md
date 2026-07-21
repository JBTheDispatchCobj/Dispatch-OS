ultracode — Olympic Sprint II, Wave 2 (Kernel & Truth platform). The Dispatch OS / Cooperative Markets repo
folder is connected as context — LIST it and read from it before anything else (do not assume; verify the
files exist). Multi-agent orchestration is authorized: fan out agents/workflows per independent workstream;
you integrate and run the debug gate. Adversarially verify before committing.
ORIENT FIRST — read these in order, then confirm you're oriented in one short paragraph:
1. README.md
2. docs/00_governance/DOCTRINE.md
3. docs/00_governance/CURRENT_STATE.md
4. docs/00_governance/ACTIVE_BUILD.md
5. docs/00_governance/BUILD_PROGRESS.md   (the % tracker — Sprint II Wave 1 closed at ~41%; keep it current)
6. docs/00_governance/OLYMPIC_SPRINT_ROADMAP.md   (Sprint II target ~55%)
7. HANDOFF.md
8. DEBUG_LOG.md
9. docs/00_governance/SPRINT_PLAN.md
Then skim what Wave 2 builds on: core/kernel/{identity,permissions}.ts (NEW — RFC-2002 identity + the
permission engine that mirrors the 0016/0017 RLS predicates), core/registry/{service,supabase-store}.ts
(the RegistryPersistencePort seam + its NEW Supabase adapter), core/truth/{confidence,types}.ts,
core/profile/{assemble,types}.ts, cartridges/cooperative_markets/{ingest_batch,pipeline}.ts,
core/auth/session.ts (the demo session + canReview — Wave 2 should route authorization through
core/kernel/permissions::authorize instead), core/data/supabase-adapter.ts, app/{terminal,market,
distribution,observability}/*, scripts/debug-loop.mjs (9 steps incl. PERMISSIONS + TESTS),
tests/*.test.mjs (123 unit tests), .github/workflows/ci.yml.
STATE (do not regress): Migrations 0016+0017 are APPLIED (Bryan, 2026-07-21) — the full 0001–0017 chain is
live; the Object Registry live-persistence path is UNBLOCKED. Sprint II Wave 1 shipped the deterministic
identity + permission substrate (authz == the RLS truth table) and the Supabase RegistryPersistencePort
adapter behind the existing seam (default in-memory; drops in with a client). The governance docs are current.
ANTI-CLOBBER (Bryan's rule) — BEFORE changing anything: run `git status` in the repo and confirm the working
tree is clean. The last pushed commit should be the Sprint-II-Wave-1 commit. Never overwrite a file on disk
without first confirming it hasn't changed since you last read it.
EXECUTE — Sprint II remaining waves (Kernel & Truth platform; target ~55%). Suggested waves, each ending at the
debug gate:
- **Confidence engine → LIVE profile assembly + query.** Drive core/profile/assemble.ts off the confidence
  engine's decay/propagate/outcome-feedback over REAL sourced facts (the ingest_batch + ingest_regulations
  truth objects), not fixtures; add a deterministic QUERY surface over assembled profiles (filter/rank/lookup
  by sourced field + tier + confidence + freshness). Moves truth 22→45.
- **Kernel request envelope + contracts/API layer (RFC-2001/2014).** A typed request envelope (principal +
  correlation id + plane + injected ids/timestamps) + service contracts the surfaces call THROUGH instead of
  importing engines directly — and route authorization through core/kernel/permissions::authorize (retire the
  ad-hoc core/auth/session::canReview at the call sites). Moves kernel 34→55, harness 25→38.
- **Wire the Supabase registry adapter to a live client.** Construct an @supabase/supabase-js client (reuse
  core/data/supabase-adapter's client + id→uuid bridge), adapt it to the narrow RegistryTableClient, and flush
  on a serialized write-chain; keep the default in-memory so the gate + tests stay green without creds. Respect
  the DEFERRED resolver note (re-proposal must not clobber a reviewed candidate's status).
OPERATING RULES (every wave): additive only; config-as-data; no vertical nouns in core/; NEVER a regulated/
financial conclusion in weights (persist evidence/source/confidence/lineage; route regulated conclusions +
publication through the human gates — ICApproval + EditorialDisposition are the patterns); truth tiers/planes
not conflated; pure/deterministic modules (caller injects ids/timestamps).
DEBUG AS YOU GO: log to DEBUG_LOG.md tagged [BLOCKER]/[NON-BLOCKING]/[DEFERRED]; fix blockers now.
DEBUG GATE before a wave is done: `npm install` once if needed, then `node scripts/debug-loop.mjs` ALL GREEN
(now includes PERMISSIONS + TESTS — ADD new unit tests for every new engine/service + a debug-loop check per
wave) + `npx tsc --noEmit` clean + `npm run build` exit 0 + `npm test` green. Adversarially verify findings.
CHECKPOINT + CONTEXT DISCIPLINE (Bryan's rules):
- Checkpoint at the END OF THE WAVE: update BUILD_PROGRESS (recompute %), CURRENT_STATE, ACTIVE_BUILD,
  DEBUG_LOG; write a fresh HANDOFF.md; append the next kickoff prompt; give Bryan the exact git add/commit/
  push command.
- MONITOR YOUR OWN CONTEXT WINDOW. At ~80% capacity, STOP, checkpoint cleanly, hand back a fresh first-prompt
  for the next chat, and do NOT start work you can't finish. A truncated wave is the failure mode.
- The Dispatch sandbox's git cannot commit/push (restricted VM). Write files to disk, then hand Bryan the exact
  command to run in his Mac terminal. The cloud session moves files onto the Mac via a staging tarball extracted
  in the repo (mount blocks overwrite/unlink, so the handback command should `tar xzf` the staging tarball in
  the repo, then `rm -f` it). Start the command with `rm -f .git/index.lock && rm -rf _to_delete` and remove any
  `_cloudsync_in.tgz` / `_cloudsync_out.tgz` / `_wave*_incoming.tgz` stragglers. Verify with `git status` first;
  never assume a push happened. git push + the investment-vehicle decision + VC/Alloya legal are Bryan-only —
  route around, don't block.
Go — orient, verify no lost updates, execute Sprint II Wave 2 with checkpoints, pass the debug gate, and hand
back a clean commit command + the next kickoff.
