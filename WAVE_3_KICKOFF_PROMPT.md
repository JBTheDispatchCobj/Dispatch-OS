# Wave 3 Kickoff — paste this into a fresh chat to resume the Olympic Sprint

> Copy everything in the fenced block below as your first message in the new chat. It is
> self-contained: it points the next session at the operating contract, sets the
> checkpoint + context-budget discipline, and scopes Wave 3. Written 2026-07-21 at the
> Wave 2 checkpoint (platform ~28%).

```
ultracode — Olympic Sprint, Wave 3. The repo folder is connected (Dispatch OS, Cooperative
Markets). Multi-agent orchestration is authorized: fan out agents/workflows per independent
workstream; you integrate and run the debug gate. Adversarially verify before committing.

ORIENT FIRST (read in this order, then confirm you're oriented in one short paragraph):
1. README.md
2. docs/00_governance/DOCTRINE.md
3. docs/00_governance/CURRENT_STATE.md
4. docs/00_governance/ACTIVE_BUILD.md
5. docs/00_governance/BUILD_PROGRESS.md
6. docs/00_governance/OLYMPIC_SPRINT_ROADMAP.md   (the wave schedule, 26%→~100%)
7. HANDOFF.md
8. DEBUG_LOG.md
9. docs/00_governance/SPRINT_PLAN.md

Then skim what Wave 3 builds on: cartridges/cooperative_markets/{pipeline,pipeline_fixtures,
ingest_call_report}.ts, core/truth/{confidence,types}.ts, core/registry/{objects,ontology}.ts,
core/data/{store,supabase-adapter}.ts, app/terminal/page.tsx, scripts/debug-loop.mjs, and the
real 5300 data under docs/04_sources/ncua/.

BEFORE CHANGING ANYTHING — anti-clobber (Bryan's rule): run `git status` in the repo and
confirm the working tree is clean / only what you expect. If Wave 2 (Terminal UI) has not been
pushed yet, its files will show as committed or staged — do not discard them. Never overwrite a
file on disk without first confirming it hasn't changed since you last read it.

EXECUTE WAVE 3 — Live data + kernel/truth services (see ROADMAP + ACTIVE_BUILD):
- Live NCUA ingestion — wire ingest_call_report to the REAL 5300 data in docs/04_sources/ncua/
  at scale (batch → institution profiles). Proceeds now.
- Profile assembly (RFC-3012) using the confidence engine (core/truth/confidence.ts) —
  institution/company profiles from sourced facts, each with lineage. Proceeds now.
- Object Registry service (RFC-2003) + entity resolution + persistence — GATED on Bryan
  applying migrations 0016+0017 in Supabase. Route around: build behind the seam now, wire the
  service/persistence after the apply. Do NOT block the wave on it.
- Extend the pipeline to run on a batch of real institutions (not just the golden fixture) and
  surface it in the Terminal (a market/institution list view over real profiles).

OPERATING RULES (every wave): additive only; config-as-data; no vertical nouns in core/; NEVER a
regulated/financial conclusion in weights (persist evidence/source/confidence/lineage; route
regulated conclusions through the human gate — the pipeline's ICApproval gate is the pattern);
truth tiers/planes not conflated; pure/deterministic modules (caller injects ids/timestamps).

DEBUG AS YOU GO: log to DEBUG_LOG.md tagged [BLOCKER]/[NON-BLOCKING]/[DEFERRED]; fix blockers now.
DEBUG GATE before Wave 3 is done: `npm install` once if needed, then `node scripts/debug-loop.mjs`
ALL GREEN + `npx tsc --noEmit` clean + `npm run build` exit 0. Add a Wave-3 data-integrity check
to the debug loop (profiles reconcile to their source 5300). Adversarially verify findings.

CHECKPOINT + CONTEXT DISCIPLINE (Bryan's rules — important):
- Do NOT sprint through multiple waves burning tokens without checkpoints. Checkpoint at the END
  OF EACH WAVE: update BUILD_PROGRESS (recompute %), CURRENT_STATE, ACTIVE_BUILD, DEBUG_LOG; write
  a fresh HANDOFF.md; append the next wave's kickoff prompt; give Bryan the exact git add/commit/
  push command (git push + migrations + vehicle + legal are Bryan-only — route around, don't block).
- MONITOR YOUR OWN CONTEXT WINDOW. When you reach ~80% capacity, STOP, checkpoint cleanly, hand
  back a fresh first-prompt for the next chat, and do NOT start a new wave you can't finish. A
  half-finished wave that gets truncated is the failure mode to avoid.
- The Dispatch sandbox's git cannot commit/push (it's a restricted VM: .git writes are permission-
  blocked, no identity). Write files to disk, then hand Bryan the exact command to run in his Mac
  terminal himself. Verify state with `git status` first; never assume a push happened.

Go — orient, verify no lost updates, execute Wave 3 with checkpoints, pass the debug gate, hand
back a clean commit command + the Wave 4 kickoff.
```
