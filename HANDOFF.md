# Session Handoff — OLYMPIC SPRINT II · WAVE 4 COMPLETE — **Sprint II CLOSED** (~50%)

## Where we are
Platform build **~50%**. **Sprint II is CLOSED.** Wave 4 gave the Object Registry a live-persistence path onto a
REAL `@supabase/supabase-js` client governed through a kernel contract on a serialized write-chain, matured the
entity-resolution pipeline (blocking keys + deterministic similarity, PROPOSE-only, NO-CLOBBER), and made
live-assembled profiles PERSIST byte-identically + plane-aware. Additive, new-files-only in `core/`; the registry
service + engines are UNCHANGED; the default stays in-memory so the gate is green with no creds. All checks green
in-cloud: `node scripts/debug-loop.mjs` **ALL GREEN (12/12)**, `npx tsc --noEmit` clean, `npm run build` exit 0,
`npm test` **214/214**.

## Wave 4 completed this session (new files in core/ + a migration + tests; nothing rewritten)
- **`core/registry/governed_registry.ts`** — `GovernedObjectRegistry` wraps the unchanged `ObjectRegistryService`.
  `registerThrough`/`mergeThrough` **authorize FIRST** via `guard` (permission engine); a shared-market registry
  merge is **service-role-only** (registry objects are workspace-null → `app_can_admin_object` grants no
  authenticated user); each mutation emits an envelope-**correlated** `KernelEvent` + `CostEntry`; a **serialized
  write-chain** flushes in call order (a merge's flush never races the register before it); `drain()` surfaces a
  flush failure without poisoning the chain.
- **`core/data/supabase-table-client.ts`** — the one new file importing `@supabase/supabase-js`: a real client
  adapted to the narrow `{upsert,selectAll}` seam the registry + profile adapters consume; env-gated (returns null
  with no `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY`). Kept OUT of the debug/test import graph (they use fakes).
- **`core/registry/resolver.ts`** — matured resolution: blocking keys (external id / slug / normalized name-alias
  tokens) + deterministic token-Jaccard similarity (caller-injected designator stopwords keep `core/` vertical-free),
  PROPOSE-only, resolving the DEFERRED **NO-CLOBBER** note (a `confirmed`/`rejected` candidate is sticky, never
  re-proposed). `ObjectRegistryService.resolve()` is untouched (the DATA step still uses it).
- **`core/profile/persistence.ts`** — `ProfilePersistencePort` + `InMemoryProfileStore` (default) +
  `SupabaseProfileStore` (hybrid: sync snapshot + pending + flush/hydrate) + pure mappers. A `LiveAssembledProfile`
  persists as a `PersistedProfile { profile, scope }`: **byte-identical** (canonical-JSON **text** snapshot, so a
  real Postgres backend returns exact bytes) and **plane-aware** (the explicit `ProfileScope` keeps a public
  shared-market profile and a private tenant profile un-conflated). `profileStore()` defaults in-memory.
- **`db/migrations/0018_profile_snapshots.sql`** — additive, plane-aware `profile_snapshots` (RLS reuses 0016).
  **Bryan-only apply** (like 0016/0017); the gate does not require it.
- **`scripts/debug-loop.mjs`** — new **REGISTRY-PERSISTENCE** step (now 12 steps): governed authorize-first +
  service-only merge + correlated event/cost + serialized flush · resolver blocking+similarity charter-less proposal
  + NO-CLOBBER · profile persist→hydrate byte-identical + plane-aware · deterministic.
- **`tests/{registry_governed,registry_resolver,profile_persistence,supabase_table_client}.test.mjs`** — +32 tests
  (→ 214), mutation-probed for teeth.
- **Governance flipped:** BUILD_PROGRESS recomputed (~47% → ~50%); CURRENT_STATE / ACTIVE_BUILD / DEBUG_LOG updated.

## Validation
- **`node scripts/debug-loop.mjs` → ALL GREEN (12/12)**: TYPECHECK · ONTOLOGY · CARTRIDGE · ENGINE · PIPELINE ·
  DATA · EDITORIAL · PERMISSIONS · PROFILES · CONTRACTS · **REGISTRY-PERSISTENCE** · TESTS (214/214).
- **`npx tsc --noEmit` → 0 errors.**  **`npm run build` → exit 0** (all surfaces prerender).
- **Adversarially verified** — a 4-lens fleet (correctness · truth-doctrine · purity/determinism · test-teeth) + a
  focused fresh-eyes re-verify of the two most-changed files. **1 blocker fixed** (profile persistence dropped the
  plane/visibility/tenant discriminator → planes conflated + the plane-aware RLS a dead letter; fixed by carrying an
  explicit plane-aware scope) + hardened (byte-identity vs real Postgres jsonb via the text snapshot; flush
  no-lost-update incl. a same-id re-put; the write-chain no longer poisoned by a single flush failure; test-teeth:
  serialize concurrency guard, cost-shape, register-event, minJ-gate, table-client coverage). All in `DEBUG_LOG.md`.

## Honest number
Sprint II closes at **~50%** on recompute of the weighted tracker (kernel 46→55, truth 40→45, tests 51→54, data
87→88). This is short of the roadmap's Sprint-II-end ~55% projection because that projection also front-loaded
harness/Auric/connector/terminal bumps that the kernel-and-truth waves did not target — those move in Sprint III–IV.
This is the re-baseline the roadmap's own caveat #4 calls for; no numbers were inflated to hit a target.

## State of the world
- **GitHub:** the last pushed commit is the Wave-3 commit `dfedf69`. **This Wave-4 commit is pending** (command below).
- **Supabase:** `0001`–`0017` **applied**. `0018_profile_snapshots.sql` is written + additive, **not yet applied**
  (Bryan-only; profile persistence stays in-memory until then + until a client is configured).

## Next: SPRINT III — Connectors & scale (see `SPRINT_III_KICKOFF_PROMPT.md`)
Paste `SPRINT_III_KICKOFF_PROMPT.md` as the first message of the new chat. Sprint III target ~68%: connector runtime
+ SDK (RFC-2011 + Vol IX) qualifying the ~93 placeholder connectors; full-market NCUA 5300 ingestion → persisted
institution profiles at scale (using the Wave-4 profile seam); a startup-intake connector feeding the deal engine on
real data.

## Bryan-only (route around; don't block)
- `git push` (command below).
- **Apply `0018` in Supabase** when you want the profile-persistence + registry live-flush path exercised against
  Postgres (set `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY`; the Wave-4 adapters drop in with no code change).
- **Decide the investment vehicle** (fund / per-deal SPV / both) — unblocks P4 fund/spv settlement.
- VC/Alloya legal + entity.

## Exact next command (Bryan, Mac terminal)
The Dispatch cloud sandbox cannot `git commit`/`git push` (its git VM blocks `.git` writes and has no identity).
The Wave-4 files were staged onto your disk as `_wave4_sprint2_incoming.tgz` in the repo root. Run this in your Mac
terminal — it clears the git lock + strays, EXTRACTS the tarball over the repo, removes the staging tarballs,
`git status` to confirm no lost updates, then commits + pushes:
```
cd ~/Downloads/Dispatch_OS_Cooperative_Markets_Repo && rm -f .git/index.lock && rm -rf _to_delete && rm -f _cloudsync_in.tgz _cloudsync_out.tgz _wave1_sprint2_incoming.tgz _wave2_sprint2_incoming.tgz _wave3_sprint2_incoming.tgz _wave4_srcsnapshot.tgz && tar xzf _wave4_sprint2_incoming.tgz && rm -f _wave4_sprint2_incoming.tgz && git status && git add -A && git commit -m "Olympic Sprint II Wave 4 — Object Registry live-persistence client + matured entity resolution + profile PERSISTENCE (RFC-2003 x RFC-3012), Sprint II CLOSED ~50%: core/registry/governed_registry.ts (GovernedObjectRegistry wraps the UNCHANGED ObjectRegistryService — authorize-FIRST register/merge via guard; a shared-market registry merge is service-role-only; envelope-correlated KernelEvent + CostEntry; a serialized write-chain so a merge's durable flush never races the register before it; drain surfaces a flush failure without poisoning the chain) + core/data/supabase-table-client.ts (real @supabase/supabase-js client adapted to the narrow {upsert,selectAll} seam; env-gated to null so the gate is green with no creds) + core/registry/resolver.ts (matured resolution: blocking keys + deterministic name/alias/charter token similarity with caller-injected designator stopwords; PROPOSE-only; NO-CLOBBER — a human-reviewed candidate is sticky, never re-proposed) + core/profile/persistence.ts + db/migrations/0018_profile_snapshots.sql (a LiveAssembledProfile persists byte-identically via a canonical-JSON text snapshot AND plane-aware via an explicit ProfileScope so a public shared-market profile and a private tenant profile are never conflated; in-memory default, Supabase adapter + 0018 when configured). Additive, new-files-only in core/; the registry service + engines UNCHANGED; default stays in-memory. debug-loop ALL GREEN (12/12, new REGISTRY-PERSISTENCE step); tsc clean; npm run build exit 0; 214/214 unit tests (+32). Adversarially verified (4-lens fleet + a focused re-verify): 1 blocker fixed (profile persistence had conflated planes + made the plane-aware RLS a dead letter) + hardened (byte-identity vs real Postgres; flush no-lost-update; write-chain not poisoned by a flush failure). kernel 46->55, truth 40->45, tests 51->54, data 87->88; ~47% -> ~50%. Sprint II CLOSED." && git push
```
Always `git status` first (the command above does) to confirm no lost updates before you commit. (`tar xzf` runs in
your native terminal, so it overwrites the changed files in place — the cloud mount can't.)
