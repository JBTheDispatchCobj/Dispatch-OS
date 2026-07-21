# Olympic Sprint — Dispatch OS / Cooperative Markets to a running, demoable product

Purpose: turn the built *intelligence* (ontology + cartridge + P1–P4 deal engine + kernel/truth/
harness/auric cores) into a **running, demoable vertical slice with a real UI**. This is a
multi-agent **blaze**: each wave fans out parallel agents, then a debug gate, then commit. Set to
run across fresh chats — read `HANDOFF.md` + this file to resume.

## Operating rules (every wave)
- **Additive only**; config-as-data; no vertical nouns in `core/`; never a regulated/financial
  conclusion in weights (persist evidence/source/confidence/lineage); truth tiers/planes not conflated.
- **Debug as we go** (Bryan's cadence): log findings to `DEBUG_LOG.md` tagged
  [BLOCKER]/[NON-BLOCKING]/[DEFERRED]; **fix blockers immediately, keep moving on the rest.**
- **Debug gate at each wave boundary:** `npm install` once, then `node scripts/debug-loop.mjs`
  must be **ALL GREEN** to advance (typecheck + ontology + cartridge + engine smoke). Extend the
  harness with each wave's new checks.
- **Session close every wave:** update `BUILD_PROGRESS` (recompute %), `CURRENT_STATE`,
  `ACTIVE_BUILD`, `DEBUG_LOG`, write a fresh `HANDOFF.md`, give the exact git add/commit/push.
- **Fan out**: use multi-agent orchestration (Agent fleets / Workflow) — one agent per independent
  workstream; the lead integrates + runs the debug gate. Agents create NEW files only (no edits to
  shared files) to avoid conflicts; the lead owns indexes/trackers.

## Where we start (post-monster-batch)
Built + tsc-clean: 8 ontology packs (181 objects) · cooperative_markets cartridge + seed + Auric
lens · deal engine P1 scoring / P2 IC memo / P3 allocation / P4 settlement · kernel event bus +
cost ledger · truth confidence engine · harness 9-rung router · Auric publication engine ·
call-report ingestion · debug-loop harness · Terminal HTML mock. Platform ~19%.

Bryan-only unblocks (do NOT block the sprint on these — route around): apply migrations `0016`+
`0017` in Supabase; **decide the investment vehicle** (unblocks P4 fund/spv); `git push`; VC/Alloya
legal. Everything vehicle-agnostic and pre-persistence proceeds now.

---

## Wave 1 — Orchestration spine (make it RUN end-to-end)
Goal: one runnable pipeline that chains the modules on real inputs, emitting kernel events + cost
entries, routed through the harness. This is the moment the parts become a system.
Parallel workstreams:
- **Pipeline composer** — `cartridges/cooperative_markets/pipeline.ts`: ingest(5300) → score →
  IC memo → allocate → settle → assembleIO → renderVariants → buildFeed. Returns a typed
  `DealRun` bundle. Pure/deterministic (ids/timestamps injected).
- **Kernel wiring** — emit a `KernelEvent` at each stage (correlation_id = deal run id) and a
  `CostEntry` per model/human/tool step; expose the event log + cost totals on the `DealRun`.
- **Harness integration** — route each stage through `core/harness/router` (deterministic stages
  = rung 1; the memo/lens generation = higher rung with the human gate on regulated conclusions).
- **Golden-path demo + test** — `scripts/pipeline-demo.ts` runs Halcyon × Summit end-to-end and
  prints the run; add the run's invariants to the debug-loop ENGINE step.
Debug gate: debug-loop green incl. the new pipeline smoke. Done: `node scripts/pipeline-demo.ts`
shows ingest→…→feed with events + cost, deterministic.

## Wave 2 — Terminal UI (something real to click)
Goal: replace `terminal_demo.html` with the real Next.js product surface reading the pipeline
output. Parallel workstreams (each a page/component, new files only):
- Terminal **runtime shell** + navigation + command surface (Vol VII; `app/terminal/*`).
- **Opportunity feed** with the executive-lens toggle (CEO/CRO/CFO) over `buildFeed` output.
- **Institution scorecard** + **deal scorecard** views (P1).
- **IC memo** view (P2, approved-evidence + citations + role lenses) and **allocation** view (P3).
- **Portfolio / monitoring** view (P4 settlement + outcomes).
Debug gate: `npm run build` (Next) + debug-loop green. Done: the terminal renders the Halcyon ×
Summit run; lens toggle works; nothing regulated shown without lineage.

## Wave 3 — Live data + kernel/truth services
Goal: run on real data + stand up the services the schema already supports.
Parallel workstreams:
- **Live NCUA ingestion** — wire `ingest_call_report` to the real 5300 data in
  `docs/04_sources/ncua/` at scale; batch → institution profiles.
- **Object Registry service (RFC-2003)** — populate `object_match_candidates` + apply merges
  (AFTER Bryan applies `0016`+`0017`). Entity resolution over the shared-market plane.
- **Truth/profile assembly** — profile assembly engine (RFC-3012) using the confidence engine;
  institution + company profiles from sourced facts.
- **Persistence** — wire the supabase-adapter for the new objects (post-migration).
Debug gate: debug-loop green + a data-integrity check (profiles reconcile to source). Done: the
pipeline runs on real institutions; profiles persist.

## Wave 4 — Auric distribution + hardening
Goal: the publication loop out to channels, plus productionization.
Parallel workstreams:
- **Distribution/channels** — brief / market-feed / terminal-feed channel variants over the Auric
  engine; editorial verification gate (human-approved before publish).
- **Tests + CI** — unit tests for the engines; wire `scripts/debug-loop.mjs` into CI as the gate.
- **Observability** — cost-ledger dashboards; event replay; health.
- **Cleanup** — burn down `DEBUG_LOG` [DEFERRED] items (FinCEN object, Volume XI label collision).
Debug gate: debug-loop + tests green in CI. Done: a market event renders to a channel, lensed,
with provenance; the loop gates commits.

---

## Target
End of sprint: a **running Cooperative Markets vertical slice** — real 5300 in → scored,
diligenced, allocated, settled → published to a lensed feed → rendered in a Terminal UI — with
the debug loop gating every step. Platform build target ~35–45% (kernel/truth/harness/auric/
connectors/terminal all off zero; first product demoable end-to-end).
