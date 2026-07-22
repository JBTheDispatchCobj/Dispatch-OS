# HANDOFF — Olympic Sprint IV, Wave 3 (2026-07-22)

**Build: ~63%** (honest recompute; was ~62% after Wave 2). Sprint IV continues (**Terminal & product surface complete,
target ~80%**). Wave 3 finished a missing piece of THE TERMINAL RUNTIME (Vol VII) — the **notification + task center** —
and promoted two more FRAMED scaffolds into REAL surfaces over live run output. Additive; **no vertical noun in `core/`**
(new pure builders in `app/_surfaces/`; only `ui_surfaces.json` config-as-data + the coop `seed.ts` report fixtures +
`app/page.tsx` changed); connector runtime + engines + the human-gate contract layer UNCHANGED; default in-memory;
look/feel deferred.

## What shipped
1. **THE TERMINAL RUNTIME — a NOTIFICATION + TASK CENTER (Vol VII).** `app/_surfaces/activity_center.ts` (pure,
   deterministic, erasable-only) is a READ-ONLY projection over the LIVE queues: **notifications** = acts owed (a
   `requested` Approval → /approvals · a blocked/rejected WorkItem → /workflows · an unreviewed EvidenceItem →
   /evidence) and **tasks** = open (non-terminal) work items. Every notification carries an `href` to the surface that
   RESOLVES it; **nothing is decided/reviewed/shared/transitioned here** (never a hidden control). States distinct:
   pending_approval · conflicted · stale · restricted (on regulated approvals). Wired onto the **Home command center**
   (`app/page.tsx`) via the presentational server component `components/terminal/ActivityCenterView.tsx` (no client
   bundle). Reuses `ageDaysBetween` + `isRestrictedApprovalType` (single source of truth).
2. **`/reports` (scaffold→live)** — `app/_surfaces/reports_view.ts` (pure) over the live `ReportRun` objects, joined to
   the **report-sharing editorial gate** (the report-lifecycle realization of the EditorialDisposition family):
   pending_approval while `under_review` OR while a `requested` `report_sharing` Approval is linked (by
   `metadata.report_id`); stale by age OR missing-data gaps (shown, never hidden); a `draft` is restricted; cleared+fresh
   is current. NEVER auto-shares — the decision is taken on /approvals. `components/terminal/ReportsView.tsx` renders it.
3. **`/cartridges` (scaffold→live)** — `app/_surfaces/cartridges_view.ts` (pure) is the installed-capability manifest
   over the 5 live PackagedConfigurations: per-collection counts + total surface area + which workspaces run each;
   current = operating (status active) / restricted = installed-but-not. Read-only. `components/terminal/CartridgesView.tsx`.

`ui_surfaces.json` flipped the two surfaces scaffold→live (16→**18 live / 5 scaffold**; `/reports` states gained
`pending_approval`, `/cartridges` gained `restricted`). Coop `seed.ts` gained 4 `ReportRun` fixtures + 1 requested
`report_sharing` Approval so /reports renders its full legend over live data. `app/page.tsx` open-count now excludes
`canceled` (matches the center's terminal-status set).

## Design notes
- **Strip-safety.** All three builders are erasable-only (no enums/parameter properties), import `@/core/types` as
  `type` only, no clock/random (`as_of` injected), never mutate input, never import `@/core/data`. The store is read
  ONLY in the server `page.tsx` files (Wave-1 seam). So `node --test` + the debug loop import them directly.
- **The editorial gate on /reports** is represented by the report lifecycle (`under_review` → cleared) + the linked
  `report_sharing` Approval; the projection surfaces it, the decision routes through the permission engine on /approvals
  (`store.requestReportShare → store.setReportStatus`). Nothing auto-shares.
- **Cross-workspace read scope** on the center + /reports is single-tenant-demo-scoped (same [DEFERRED] as
  /approvals//workflows); the WRITE/decision paths are already authorize-gated.

## Adversarially verified — 4-lens, parallel (0 blockers)
purity/determinism/strip-safety · truth-doctrine/no-core-vertical-leak — **NO FINDINGS**. correctness — 1 latent fix
applied (Home open-count now excludes `canceled`). test-teeth — 3 missing negative controls hardened (a requested
non-regulated approval → `restricted===false`; a fresh pending evidence item → not stale; an aged-no-gaps report →
stale by age alone), applied to both the unit tests and the ACTIVITY/REPORTS debug steps.

## Gate (all green in the cloud)
- `node scripts/debug-loop.mjs` → **ALL GREEN 25/25** (new **ACTIVITY · REPORTS · CARTRIDGES** steps)
- `npx tsc --noEmit` → clean · `npm run build` → exit 0 (26/26 routes prerender; the 2 promoted surfaces + Home STATIC `○`)
- `npm test` → **363 pass, 0 fail** (+15)

## New / changed files
- NEW: `app/_surfaces/{activity_center,reports_view,cartridges_view}.ts`,
  `components/terminal/{ActivityCenterView,ReportsView,CartridgesView}.tsx`,
  `tests/{activity_center,reports_view,cartridges_view}.test.mjs`
- EDITED: `app/page.tsx` (mount the notification/task center + open-count fix), `app/reports/page.tsx` +
  `app/cartridges/page.tsx` (scaffold → real server pages), `cartridges/cooperative_markets/seed.ts` (report fixtures +
  share approval), `core/registry/data/ui_surfaces.json` (2 flips + states), `scripts/debug-loop.mjs` (3 steps +
  UI-SURFACES count), docs (`CURRENT_STATE`, `ACTIVE_BUILD`, `BUILD_PROGRESS`, `DEBUG_LOG`, `HANDOFF`)

## NEXT — Wave 4 (toward the ~80% Sprint-IV target)
The rest of the Terminal runtime: a **window/layout shell** and generalizing the **dashboard runtime** beyond the widget
page. Promote the remaining scaffolds — **biggest gap: `/executives` + `/relationships` need a store read + SEED first**
(no `Relationship`/`PersonalProfile` list accessor or seed exists yet — either add a store table + seed or a pure
store-free `run_*` fixture runner), then `/collaboration` (notes/meetings), `/administration` (members/roles/connectors —
SERVER-AUTHORITATIVE; note there is NO membership/role store accessor yet, only `listUsers`), `/personas`. Optionally a
real bulk 5300 feed (Bryan) to move the market off labeled-synthetic. The UI surface registry is the map; look/feel deferred.

## Bryan-only (route around, don't block)
git push · apply 0018 · a REAL bulk 5300 feed · investment-vehicle decision · VC/Alloya legal.

## NEXT COMMAND
See the exact `tar xzf` + commit/push command in chat (glob-free — zsh-safe).
