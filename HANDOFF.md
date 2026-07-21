# Session Handoff — OLYMPIC SPRINT II · WAVE 1 COMPLETE (Kernel & Truth platform opens, ~41%)

## Where we are
Platform build **~41%**. **Sprint II is OPEN** (target ~55%). Migrations `0016`+`0017` are **applied** in
Supabase (Bryan, 2026-07-21) — the full `0001`–`0017` chain is live and the Object Registry live-persistence
path is UNBLOCKED. Wave 1 built the deterministic **Identity & Tenancy + permission substrate (RFC-2002)** and
the **Supabase live-persistence adapter** for the Object Registry seam. All checks green:
`node scripts/debug-loop.mjs` **ALL GREEN (9/9)**, `npx tsc --noEmit` clean, `npm run build` exit 0,
`npm test` **123/123**.

## Wave 1 completed this session (Identity & Tenancy + permission engine + registry adapter)
New files (additive, new-files-only, pure/deterministic, no vertical nouns in `core/`):
- **`core/kernel/identity.ts`** — RFC-2002 portable cross-org identity. A `Principal` (`user`/`agent`/`service`)
  holds membership across many orgs/workspaces with a per-workspace `RoleKey`. `isMember`/`roleIn`/`hasRole`/
  `actorString`/`organizationsOf`/`workspacesOf` are the in-process mirror of `auth.uid()`/`app_is_member`/
  `app_has_role`. `SERVICE_PRINCIPAL` is frozen.
- **`core/kernel/permissions.ts`** — a deterministic, plane+visibility-aware authorization core that is a
  FAITHFUL mirror of the `0016`/`0017` RLS predicates (`app_can_read_plane`, `app_can_write_tenant`,
  `app_can_admin_object`). `authorize(principal, action, resource)` is the one call a surface makes; the
  service role is an explicit RLS bypass; every `PermissionDecision` carries a machine-readable `reason`
  (lineage, not a weight). Load-bearing invariant reproduced: a shared-market registry merge is service-role-only.
- **`core/registry/supabase-store.ts`** — Supabase adapter for the EXISTING `RegistryPersistencePort` seam over
  the `0017` tables; hybrid hydrate/write-through; PURE row mappers + the same deterministic id→uuid bridge as
  `core/data/supabase-adapter.ts`; `registryStore()` defaults to in-memory (gate green with no creds); NO change
  to `ObjectRegistryService`.
- **`scripts/debug-loop.mjs`** — new **PERMISSIONS** step (now 9 steps): asserts authz == the RLS truth table.
- **`tests/identity.test.mjs`, `tests/permissions.test.mjs`, `tests/registry_supabase_store.test.mjs`** — +31
  tests (→ 123), mutation-probed for teeth.
- **Governance flipped:** CURRENT_STATE / ACTIVE_BUILD / DEBUG_LOG "0016/0017 pending apply" → **applied
  2026-07-21**; BUILD_PROGRESS recomputed (~38% → ~41%).

## Validation
- **`node scripts/debug-loop.mjs` → ALL GREEN (9/9)**: TYPECHECK · ONTOLOGY (181/0/0) · CARTRIDGE · ENGINE ·
  PIPELINE · DATA · EDITORIAL · **PERMISSIONS** (authz == RLS truth table) · **TESTS (123/123)**.
- **`npx tsc --noEmit` → 0 errors.**  **`npm run build` → exit 0** (all surfaces prerender).
- **Adversarially verified** — a 4-lens skeptic fleet (RLS fidelity · purity/vertical/erasable · adapter
  fidelity · test teeth). One **blocker** fixed (an `agent` principal could WRITE a row it could not READ —
  `writeTenantDecision` now requires an authenticated user); two non-blocking fixed (a missing `Object.freeze`
  on `SERVICE_PRINCIPAL`; the intelligence-object write-set exception documented with `IO_WRITE_ROLES` + a test).
  All logged in `DEBUG_LOG.md`.

## State of the world
- **GitHub:** the Wave-4-complete commit `1834e29` is the last pushed commit; **this Wave-1 commit is pending**
  (command below).
- **Supabase:** `0001`–`0017` **applied** (2026-07-21). The registry adapter is authored behind the seam;
  wiring it onto a live `@supabase/supabase-js` client on a write-chain is a short Sprint-II follow-on (the
  adapter + mappers + hydrate/flush are done and tested).

## Next: SPRINT II — Wave 2 (see `SPRINT_II_WAVE2_KICKOFF_PROMPT.md`)
Paste `SPRINT_II_WAVE2_KICKOFF_PROMPT.md` as the first message of the new chat. Remaining Sprint II scope:
the **confidence engine driving LIVE profile assembly + query** (decay/propagate/outcome-feedback over real
sourced facts, not fixtures; a query surface over assembled profiles); the **kernel request envelope +
contracts/API layer (RFC-2001/2014)** (a typed envelope + service contracts the surfaces call through — and
route authorization through `authorize()` instead of `core/auth/session.ts::canReview`); wire the Supabase
registry adapter onto a real client on a write-chain.

## Bryan-only (route around; don't block)
- `git push` (command below).
- **Decide the investment vehicle** (fund / per-deal SPV / both) — unblocks P4 fund/spv settlement.
- VC/Alloya legal + entity.
- (`0016`+`0017` apply is **DONE** — no longer blocking.)

## Exact next command (Bryan, Mac terminal)
The Dispatch cloud sandbox cannot `git commit`/`git push` (its git VM blocks `.git` writes and has no
identity). The Wave-1 files were staged onto your disk as `_wave1_sprint2_incoming.tgz` in the repo root. Run
this in your Mac terminal — it clears the git lock + strays, EXTRACTS the tarball over the repo, removes the
staging tarballs, `git status` to confirm no lost updates, then commits + pushes:
```
cd ~/Downloads/Dispatch_OS_Cooperative_Markets_Repo && rm -f .git/index.lock && rm -rf _to_delete && rm -f _cloudsync_in.tgz _wtest && tar xzf _wave1_sprint2_incoming.tgz && rm -f _wave1_sprint2_incoming.tgz _cloudsync_out.tgz && git status && git add -A && git commit -m "Olympic Sprint II Wave 1 — Identity & Tenancy (RFC-2002) + permission engine + registry live-persistence adapter (~41%): core/kernel/identity.ts (portable cross-org identity mirroring auth.uid/app_is_member/app_has_role) + core/kernel/permissions.ts (a deterministic plane+visibility-aware authorization core that faithfully mirrors the 0016/0017 RLS predicates; service-role bypass; decisions carry a reason; shared-market registry merges are service-role-only) + core/registry/supabase-store.ts (Supabase adapter for the existing RegistryPersistencePort seam over the 0017 tables; hybrid hydrate/write-through; pure row mappers; default in-memory; no change to ObjectRegistryService). 0016+0017 applied (governance flipped). debug-loop ALL GREEN (9/9, new PERMISSIONS step); tsc clean; npm run build exit 0; 123/123 unit tests. Adversarially verified — 1 blocker fixed (agent could write what it could not read), 2 non-blocking." && git push
```
Always `git status` first (the command above does) to confirm no lost updates before you commit. (`tar xzf`
runs in your native terminal, so it overwrites the changed files in place — the cloud mount can't.)
