ultracode — Olympic Sprint II, Wave 4 (Kernel & Truth platform — CLOSES Sprint II). The Dispatch OS /
Cooperative Markets repo folder is connected as context — LIST it and read from it before anything else (do
not assume; verify the files exist). Multi-agent orchestration is authorized: fan out agents/workflows per
independent workstream; you integrate and run the debug gate. Adversarially verify before committing.
ORIENT FIRST — read these in order, then confirm you're oriented in one short paragraph:
1. README.md
2. docs/00_governance/DOCTRINE.md
3. docs/00_governance/CURRENT_STATE.md
4. docs/00_governance/ACTIVE_BUILD.md
5. docs/00_governance/BUILD_PROGRESS.md   (the % tracker — Sprint II Wave 3 closed at ~47%; keep it current)
6. docs/00_governance/OLYMPIC_SPRINT_ROADMAP.md   (Sprint II target ~55%)
7. HANDOFF.md
8. DEBUG_LOG.md
9. docs/00_governance/SPRINT_PLAN.md
Then skim what Wave 4 builds on: core/registry/{service,supabase-store,types}.ts (the ObjectRegistryService +
the RegistryPersistencePort seam + its Supabase adapter — Wave 4's TARGET), core/data/supabase-adapter.ts (the
existing hybrid hydrate/write-through pattern + the deterministic id→uuid bridge to MIRROR), db/migrations/0017
(object_registry / object_match_candidates / object_merges / entity_aliases / object_external_ids), core/kernel/
{envelope,contracts}.ts (NEW Wave 3 — the request envelope + service contracts; a persistence write can now be
authorized + correlated through an envelope), core/kernel/{identity,permissions}.ts (authz == the RLS truth
table; a shared-market registry merge is service-role-only), core/profile/{assemble_live,query}.ts +
cartridges/cooperative_markets/profiles_live.ts (live profiles — Wave 4 PERSISTS them), scripts/debug-loop.mjs
(11 steps incl. PERMISSIONS + PROFILES + CONTRACTS + TESTS), tests/*.test.mjs (182 unit tests), .github/
workflows/ci.yml.
STATE (do not regress): Migrations 0016+0017 APPLIED — full 0001–0017 chain live. Wave 1 shipped identity +
permission substrate; Wave 2 shipped confidence-driven LIVE profile assembly + query; Wave 3 shipped the kernel
request envelope + contracts/API layer (authorize-FIRST; canReview retired at the call sites). debug-loop ALL
GREEN (11/11), 182 unit tests. The governance docs are current.
ANTI-CLOBBER (Bryan's rule) — BEFORE changing anything: run `git status` in the repo and confirm the working
tree is clean. The last pushed commit should be the Sprint-II-Wave-3 commit. Never overwrite a file on disk
without first confirming it hasn't changed since you last read it.
EXECUTE — Sprint II Wave 4 (CLOSES Sprint II, target ~55%): **wire the Supabase registry adapter onto a REAL
`@supabase/supabase-js` client + the matured entity-resolution/match-candidate pipeline + profile PERSISTENCE.**
Additive; default stays in-memory so the gate is green with no creds; the registry service + engines are NOT
rewritten. Moves truth 40→45, kernel 46→55. Suggested shape:
- **Real Supabase registry client** — wire `core/registry/supabase-store.ts` onto an actual `@supabase/supabase-js`
  client behind the EXISTING `RegistryPersistencePort` seam, on a **serialized write-chain** (registry writes
  queue so a merge never races a register). Mirror `core/data/supabase-adapter.ts` (hybrid hydrate/write-through,
  the deterministic id→uuid bridge, PURE row mappers). `registryStore()` still defaults to InMemory unless a
  client is supplied — the gate must be green with no creds. Route a governed write/merge THROUGH a kernel
  contract (authorize-FIRST on the surviving object; a shared-market merge is service-role-only) + carry the
  request envelope so the write correlates + emits a KernelEvent + CostEntry.
- **Matured entity-resolution / match-candidate pipeline** — grow the resolver beyond shared-external-id: blocking
  keys + deterministic similarity (name/alias/charter), still PROPOSE-only (never auto-merge). Respect the
  **DEFERRED resolver note**: a re-proposal must NOT clobber a candidate a human already reviewed
  (reviewed/merged/rejected status is sticky; only genuinely-new pairs are proposed).
- **Profile PERSISTENCE** — persist the live-assembled profiles (core/profile/assemble_live.ts output) through a
  persistence seam (in-memory default; Supabase adapter when a client is configured), so a profile survives a
  process boundary with its confidence/freshness/lineage intact. No regulated conclusion in a weight; persist
  evidence/source/confidence/lineage.
- Add a debug-loop **REGISTRY-PERSISTENCE** step + unit tests (the serialized write-chain ordering; the resolver
  no-clobber invariant: a reviewed candidate is not re-proposed; persist→hydrate round-trips a profile
  byte-identically; all deterministic).
OPERATING RULES (every wave): additive only; config-as-data; no vertical nouns in core/; NEVER a regulated/
financial conclusion in weights (persist evidence/source/confidence/lineage; route regulated conclusions +
publication through the human gates — ICApproval + EditorialDisposition are the patterns); truth tiers/planes
not conflated; pure/deterministic modules (caller injects ids/timestamps).
DEBUG AS YOU GO: log to DEBUG_LOG.md tagged [BLOCKER]/[NON-BLOCKING]/[DEFERRED]; fix blockers now.
DEBUG GATE before a wave is done: `npm install` once if needed, then `node scripts/debug-loop.mjs` ALL GREEN
(now includes PERMISSIONS + PROFILES + CONTRACTS + TESTS — ADD a new debug-loop check + unit tests for every new
engine/service/adapter per wave) + `npx tsc --noEmit` clean + `npm run build` exit 0 + `npm test` green.
Adversarially verify findings.
CHECKPOINT + CONTEXT DISCIPLINE (Bryan's rules):
- Checkpoint at the END OF THE WAVE: update BUILD_PROGRESS (recompute %), CURRENT_STATE, ACTIVE_BUILD,
  DEBUG_LOG; write a fresh HANDOFF.md; append the next kickoff prompt (Sprint III — Connectors & scale); give
  Bryan the exact git add/commit/push command.
- MONITOR YOUR OWN CONTEXT WINDOW. At ~80% capacity, STOP, checkpoint cleanly, hand back a fresh first-prompt
  for the next chat, and do NOT start work you can't finish. A truncated wave is the failure mode.
- The Dispatch sandbox's git cannot commit/push (restricted VM). Write files to disk, then hand Bryan the exact
  command to run in his Mac terminal. The cloud session moves files onto the Mac via a staging tarball extracted
  in the repo (mount blocks overwrite/unlink, so the handback command should `tar xzf` the staging tarball in
  the repo, then `rm -f` it). Start the command with `rm -f .git/index.lock && rm -rf _to_delete` and remove any
  `_cloudsync_in.tgz` / `_cloudsync_out.tgz` / `_wave*_incoming.tgz` stragglers. Verify with `git status` first;
  never assume a push happened. git push + the investment-vehicle decision + VC/Alloya legal are Bryan-only —
  route around, don't block.
Go — orient, verify no lost updates, execute Sprint II Wave 4 with checkpoints, pass the debug gate, close
Sprint II (~55%), and hand back a clean commit command + the Sprint III kickoff.
