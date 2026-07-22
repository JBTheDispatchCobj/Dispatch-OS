# Session Handoff — OLYMPIC SPRINT III · WAVE 1 COMPLETE — Connector Runtime + SDK (~54%)

## Where we are
Platform build **~54%**. **Sprint III is OPEN** (Connectors & scale, target ~68%). Wave 1 built the
generic **Connector Runtime + SDK** (Kernel RFC-2011; Volume IX): a connector is now an EXECUTABLE
thing — authorized + correlated through a kernel envelope, normalizing external data into
Dispatch-native records, detecting change, scoring quality/health, and emitting a correlated
KernelEvent + CostEntry — not a manifest on paper. Additive, new-files-only, pure/deterministic,
**no vertical noun in `core/`**; the engines are UNCHANGED; the default stays in-memory + creds-free.
All checks green in-cloud: `node scripts/debug-loop.mjs` **ALL GREEN (13/13)**, `npx tsc --noEmit`
clean, `npm run build` exit 0, `npm test` **246/246**.

## Wave 1 completed this session (new files only; nothing rewritten)
- **`core/kernel/connector_sdk.ts`** — the typed **Connector Output Contract** (normalized
  observations, entity/relationship candidates, source artifacts, `change_events`, `quality_report`,
  `connector_health`, run metrics), a pure **parser contract**, deterministic FNV content hashing,
  change detection (new/updated/deleted/unchanged), health-band derivation, and the
  **normalize→truth-`Observation` bridge** (`recordToObservation`) that tiers a record FROM THE
  SOURCE MANIFEST — never connector code. Connectors NORMALIZE only.
- **`core/kernel/connector_runtime.ts`** — the generic executor. **Authorize FIRST** (shared-market
  ingestion = service-role-only), acquire with **retry → circuit-breaker** (deterministic; no
  sleeps), drive the pure parser, detect changes (a rejection is NEVER a deletion), score quality,
  derive health, emit an envelope-**correlated** KernelEvent + CostEntry. A fault is a `failed`
  output, never a throw; a fetch failure never fabricates a deletion.
- **`core/registry/connectors.ts` + `core/registry/data/connectors.json`** — config-as-data catalog
  (**39 sources + 39 connectors** across the SOURCE_CATALOG families) + a generic closed-graph
  loader/validator. Qualifies the DKR placeholders as DATA, not code forks.
- **`cartridges/cooperative_markets/connectors/{ncua_5300_connector,ncua_regulations_connector}.ts`
  + `run_connectors.ts` + `scripts/connector-demo.ts`** — two REAL connectors through the runtime:
  NCUA 5300 → normalized → live institution profiles **PERSISTED** (Wave-4 seam, plane-aware) and
  **reconciling to source**; the **REAL 675-section 12 CFR corpus** normalized at scale.
- **`scripts/debug-loop.mjs`** — new **CONNECTOR** step (now 13 steps).
- **`tests/{connector_sdk,connector_runtime,connectors_catalog,ncua_connectors}.test.mjs`** — +32
  tests (→ **246**), mutation-probed for teeth.
- **Governance flipped:** BUILD_PROGRESS recomputed (~50% → ~54%); CURRENT_STATE / ACTIVE_BUILD /
  DEBUG_LOG updated.

## Validation
- **`node scripts/debug-loop.mjs` → ALL GREEN (13/13)**: TYPECHECK · ONTOLOGY · CARTRIDGE · ENGINE ·
  PIPELINE · DATA · EDITORIAL · PERMISSIONS · PROFILES · CONTRACTS · REGISTRY-PERSISTENCE ·
  **CONNECTOR** · TESTS (246/246).
- **`npx tsc --noEmit` → 0 errors.**  **`npm run build` → exit 0** (all surfaces prerender).
- **Adversarially verified** — a 4-lens fleet (correctness · truth-doctrine/no-core-vertical-leak ·
  purity/determinism · test-teeth). **1 blocker fixed**: a record acquired but failing to NORMALIZE,
  whose ref was in prior state, was fabricated as a `deleted` change event (a deletion invented from
  a failure — the load-bearing rule violation); fixed by carrying the seen-but-unparsed refs into
  change detection. **3 hardened**: a vertical-noun leak (`charter_number`/`cfr_ref`/`section`)
  removed from the core rejection-labeler; the reconcile-to-source gate made non-vacuous; a
  tautological tier-from-source assertion replaced with a differing-source proof. All in `DEBUG_LOG.md`.

## Honest number
Wave 1 lands at **~54%** on recompute of the weighted tracker (connectors 20→45, kernel 55→60,
truth 45→47, cartridge 77→80, tests 54→57; data holds at 88 — no migration this wave). This is the
connector FOUNDATION; the Sprint-III-end ~68% projection needs 2–3 more waves (full-market/bulk 5300
at scale, the startup-intake connector into the deal engine, and qualifying the remaining
placeholders toward the ~93). Honest re-baseline per roadmap caveat #4; no number inflated to a target.

## State of the world
- **GitHub:** the last pushed commit is the Sprint-II-Wave-4 commit `080a2de`. **This Wave-1 commit is
  pending** (command below).
- **Supabase:** `0001`–`0017` **applied**. `0018_profile_snapshots.sql` is written + additive, **not
  yet applied** (Bryan-only). No new migration this wave; nothing new to apply.

## Next: SPRINT III — Wave 2 (see `SPRINT_III_WAVE2_KICKOFF_PROMPT.md`)
Paste `SPRINT_III_WAVE2_KICKOFF_PROMPT.md` as the first message of the new chat. Wave 2: run the 5300
connector at FULL market scale (swap the `acquire` data source to a bulk pull — the runtime is
source-agnostic; retire `batch_fixtures.ts`), wire the **startup-intake** connector into the deal
engine (P1/P2), and qualify the remaining catalog placeholders toward the ~93 — each new connector
adds a debug-loop assertion + unit tests, gate stays green.

## Bryan-only (route around; don't block)
- `git push` (command below).
- **A real bulk NCUA 5300 feed** (per-CU Call Report data) — unblocks full-market ingestion at scale
  (the runtime + normalize→persist→reconcile path already run it; only the `acquire` data source changes).
- **Apply `0018`** in Supabase when you want the profile-persistence path exercised against Postgres.
- **Decide the investment vehicle** (fund / per-deal SPV / both) — unblocks P4 fund/spv settlement.
- VC/Alloya legal + entity.

## Exact next command (Bryan, Mac terminal)
The Dispatch cloud sandbox cannot `git commit`/`git push` (its git VM blocks `.git` writes and has no
identity). The Wave-1 files were staged onto your disk as `_wave1_sprint3_incoming.tgz` in the repo
root. Run this in your Mac terminal — it clears the git lock + strays, EXTRACTS the tarball over the
repo, removes the staging tarballs, `git status` to confirm no lost updates, then commits + pushes:
```
cd ~/Downloads/Dispatch_OS_Cooperative_Markets_Repo && rm -f .git/index.lock && rm -rf _to_delete && rm -f _cloudsync_in.tgz _cloudsync_out.tgz _wave1_srcsnapshot.tgz _wave4_sprint2_incoming.tgz && tar xzf _wave1_sprint3_incoming.tgz && rm -f _wave1_sprint3_incoming.tgz && git status && git add -A && git commit -m "Olympic Sprint III Wave 1 — Connector Runtime + SDK (Kernel RFC-2011; Vol IX) OPENS Sprint III, ~54%: core/kernel/connector_sdk.ts (typed Connector Output Contract — normalized observations, entity/relationship candidates, source artifacts, change_events, quality_report, connector_health, run metrics; a pure parser contract; deterministic FNV content hashing; change detection new/updated/deleted/unchanged; health bands; and recordToObservation — the normalize→truth-Observation bridge that tiers a record FROM THE SOURCE MANIFEST, never connector code) + core/kernel/connector_runtime.ts (the generic executor: authorize FIRST — a shared-market ingestion write is service-role-only; acquire with retry→circuit-breaker, deterministic, no sleeps; drive the connector's PURE parser to normalize; detect changes; score quality; derive health; emit an envelope-correlated KernelEvent + CostEntry; a fault is a failed output, never a throw; a fetch failure never fabricates a deletion) + core/registry/connectors.ts + core/registry/data/connectors.json (config-as-data catalog of 39 sources + 39 connectors across the SOURCE_CATALOG families + a generic closed-graph loader/validator, qualifying the DKR placeholders as DATA not code forks) + cartridges/cooperative_markets/connectors/{ncua_5300_connector,ncua_regulations_connector}.ts + run_connectors.ts + scripts/connector-demo.ts (two REAL connectors through the runtime: NCUA 5300 → normalized → live institution profiles PERSISTED plane-aware reconciling to source; the REAL 675-section 12 CFR corpus normalized at scale). Connectors NORMALIZE only; tier/plane/visibility from the source manifest. Additive, new-files-only, no vertical noun in core/; engines UNCHANGED; default in-memory + creds-free. debug-loop ALL GREEN (13/13, new CONNECTOR step); tsc clean; npm run build exit 0; 246/246 unit tests (+32). Adversarially verified (4-lens): 1 blocker fixed (a record acquired but failing to NORMALIZE, whose ref was in prior state, was fabricated as a deleted change event — a deletion invented from a failure; fixed by carrying seen-but-unparsed refs into change detection so a rejection is never a deletion) + 3 hardened (a vertical-noun leak charter_number/cfr_ref/section removed from the core rejection-labeler; the reconcile-to-source gate made non-vacuous; a tautological tier-from-source assertion replaced with a differing-source proof). connectors 20->45, kernel 55->60, truth 45->47, cartridge 77->80, tests 54->57; ~50% -> ~54% (honest re-baseline; Sprint-III-end ~68% needs 2-3 more waves)." && git push
```
Always `git status` first (the command above does) to confirm no lost updates before you commit.
(`tar xzf` runs in your native terminal, so it overwrites the changed files in place — the cloud
mount can't.)
