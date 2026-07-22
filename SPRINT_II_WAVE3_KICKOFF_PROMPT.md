ultracode — Olympic Sprint II, Wave 3 (Kernel & Truth platform). The Dispatch OS / Cooperative Markets repo
folder is connected as context — LIST it and read from it before anything else (do not assume; verify the
files exist). Multi-agent orchestration is authorized: fan out agents/workflows per independent workstream;
you integrate and run the debug gate. Adversarially verify before committing.
ORIENT FIRST — read these in order, then confirm you're oriented in one short paragraph:
1. README.md
2. docs/00_governance/DOCTRINE.md
3. docs/00_governance/CURRENT_STATE.md
4. docs/00_governance/ACTIVE_BUILD.md
5. docs/00_governance/BUILD_PROGRESS.md   (the % tracker — Sprint II Wave 2 closed at ~44%; keep it current)
6. docs/00_governance/OLYMPIC_SPRINT_ROADMAP.md   (Sprint II target ~55%)
7. HANDOFF.md
8. DEBUG_LOG.md
9. docs/00_governance/SPRINT_PLAN.md
Then skim what Wave 3 builds on: core/kernel/{identity,permissions}.ts (RFC-2002 identity + the permission
engine that mirrors the 0016/0017 RLS predicates — authz == the RLS truth table), core/auth/session.ts (the
demo session + canReview — Wave 3 RETIRES canReview at the call sites, routing through
core/kernel/permissions::authorize instead), the app surfaces that gate on it (app/review/*, app/proposals/*,
app/work/*, and any page importing core/auth/session), core/harness/router.ts + core/kernel/{event_bus,
cost_ledger}.ts (RFC-2004/2008 — the envelope's correlation-id + plane + cost spine already exist), core/truth/
{confidence,types}.ts + core/profile/{freshness,assemble_live,query}.ts (NEW Wave 2 — live profiles + query),
cartridges/cooperative_markets/pipeline.ts (the deal spine the surfaces + envelope wrap), core/registry/
{service,supabase-store}.ts (the RegistryPersistencePort seam + its Supabase adapter — Wave 4's target),
scripts/debug-loop.mjs (10 steps incl. PERMISSIONS + PROFILES + TESTS), tests/*.test.mjs (162 unit tests),
.github/workflows/ci.yml.
STATE (do not regress): Migrations 0016+0017 are APPLIED — the full 0001–0017 chain is live. Sprint II Wave 1
shipped the identity + permission substrate; Wave 2 shipped confidence-engine-driven LIVE profile assembly
(freshness decay + outcome-feedback) + a deterministic query surface (core/profile/{freshness,assemble_live,
query}.ts + cartridges/cooperative_markets/profiles_live.ts), debug-loop ALL GREEN (10/10), 162 unit tests.
The governance docs are current.
ANTI-CLOBBER (Bryan's rule) — BEFORE changing anything: run `git status` in the repo and confirm the working
tree is clean. The last pushed commit should be the Sprint-II-Wave-2 commit. Never overwrite a file on disk
without first confirming it hasn't changed since you last read it.
EXECUTE — Sprint II Wave 3: **Kernel request envelope + contracts/API layer (RFC-2001/2014).** A typed request
envelope (principal + correlation id + plane + injected ids/timestamps) + service contracts the surfaces call
THROUGH instead of importing engines directly — and route authorization through core/kernel/permissions::authorize
(retire the ad-hoc core/auth/session::canReview at the call sites; keep a thin back-compat shim if a surface still
needs a boolean, but the decision must come from authorize()). Additive: a new core/kernel/{envelope,contracts}.ts
(or core/contracts/*) + a thin adapter the existing pages call; do NOT rewrite the engines. Moves kernel 34→55,
harness 25→38. Suggested shape:
- **RequestEnvelope** — { principal (from core/kernel/identity), correlation_id, plane, occurred_at, request_id,
  idempotency_key? } — pure/deterministic (caller injects ids/timestamps), carried through a call so events/costs
  correlate and authorization has a principal.
- **Service contracts** — typed interfaces (e.g. ReviewService, ProposalService, DealService) the surfaces call;
  each method takes the envelope, calls authorize(principal, action, resource) FIRST (deny → typed refusal carrying
  the machine-readable reason, never a bare throw), then delegates to the existing engine/pipeline. No regulated
  conclusion in weights; the human gates (ICApproval + EditorialDisposition) stay.
- **Retire canReview at the call sites** — replace `canReview(role)` boolean checks with
  `authorize(principal, "review"/"approve", resource)`; map the demo session (core/auth/session) into a Principal
  so the surfaces keep working with no backend.
- Add a debug-loop **CONTRACTS/ENVELOPE** step + unit tests (every new contract + the authorize-first invariant:
  a denied principal gets the typed refusal + its reason, an allowed one reaches the engine; deterministic).
Then (Wave 4, next chat): wire the Supabase registry adapter onto a real @supabase/supabase-js client on a
serialized write-chain + the matured entity-resolution/match-candidate pipeline + profile PERSISTENCE (moves
truth 40→45). Respect the DEFERRED resolver note (re-proposal must not clobber a reviewed candidate's status).
OPERATING RULES (every wave): additive only; config-as-data; no vertical nouns in core/; NEVER a regulated/
financial conclusion in weights (persist evidence/source/confidence/lineage; route regulated conclusions +
publication through the human gates — ICApproval + EditorialDisposition are the patterns); truth tiers/planes
not conflated; pure/deterministic modules (caller injects ids/timestamps).
DEBUG AS YOU GO: log to DEBUG_LOG.md tagged [BLOCKER]/[NON-BLOCKING]/[DEFERRED]; fix blockers now.
DEBUG GATE before a wave is done: `npm install` once if needed, then `node scripts/debug-loop.mjs` ALL GREEN
(now includes PERMISSIONS + PROFILES + TESTS — ADD a new debug-loop check + unit tests for every new engine/
service/contract per wave) + `npx tsc --noEmit` clean + `npm run build` exit 0 + `npm test` green. Adversarially
verify findings.
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
Go — orient, verify no lost updates, execute Sprint II Wave 3 with checkpoints, pass the debug gate, and hand
back a clean commit command + the next kickoff.
