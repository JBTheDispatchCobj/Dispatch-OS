# HANDOFF — Olympic Sprint IV, Wave 2 (2026-07-22)

**Build: ~62%** (honest recompute; was ~61% after Wave 1). Sprint IV continues (**Terminal & product surface complete,
target ~80%**). Wave 2 built THE TERMINAL RUNTIME (Vol VII) and promoted three more of the highest-value FRAMED scaffolds
into REAL surfaces over live run output. Additive; **no vertical noun in `core/`** (new pure builders in `app/_surfaces/`,
the runner in `cartridges/`; only `ui_surfaces.json` config-as-data + `app/layout.tsx` + `app/globals.css` changed);
connector runtime + engines + the human-gate contract layer UNCHANGED; default in-memory; look/feel deferred.

## What shipped
1. **THE TERMINAL RUNTIME — a registry-driven command palette + universal search.** `app/_surfaces/universal_search.ts`
   (pure, deterministic, erasable-only) is a universal-search INDEX + total-order MATCHER over three live collections —
   the `/institutions` directory rows, the UI surface registry, and the external-canon aliases — with the doctrine states
   kept visibly distinct (institution=**synthetic** · live surface=**current** · scaffold surface / proposed alias=**restricted**
   · no-match=**missing**). `components/terminal/TerminalShell.tsx` mounts a global **command palette** (⌘K / Ctrl-K) once
   in `app/layout.tsx`, driven ENTIRELY from `ui_surfaces.json` (every surface a keyboard-navigable jump target; a new
   surface appears with NO code change; a free-text query hands off to `/search`). Pure navigation — never mutates/decides.
2. **`/search` (scaffold→live)** — the universal-search surface. `app/search/page.tsx` builds the index server-side;
   `components/terminal/SearchView.tsx` ranks with `searchUniverse` and reads `?q=` client-side (page stays static).
3. **`/opportunities` (scaffold→live)** — `app/_surfaces/opportunities_view.ts` (pure) + `cartridges/cooperative_markets/
   run_opportunities.ts` (runs the UNCHANGED intake → deal engine over labeled intake fixtures). Every score is a
   **Dispatch inference** (never a fact, never a regulated conclusion in a weight); the engine only RECOMMENDS —
   advancing requires the **ICApproval** human gate, so a recommended-advance opportunity is **pending_approval**, NEVER
   auto-advanced to **current**; a blocked deal is **conflicted**. A triage surface with NO auto-advance control.
4. **`/workflows` (scaffold→live)** — `app/_surfaces/workflows_view.ts` (pure) groups the LIVE `WorkItem` objects by
   workflow `kind`, joins each to its cartridge WORKFLOW DEFINITION (config-as-data), rolls up status, and
   cross-references the live `Approval` objects (by `related_work_item_id`). States distinct: **pending_approval** /
   **conflicted** / **current**; an unmapped kind is flagged; the builder NEVER decides a gate.

`ui_surfaces.json` flipped the three surfaces scaffold→live (13→**16 live / 7 scaffold**; `/search` states gained
`synthetic`). `app/globals.css` gained a command-palette overlay. Look/feel deferred (Terminal polish sprint).

## Design notes
- **Strip-safety.** The pure builders + `run_opportunities.ts` are erasable-only (no enums / parameter properties),
  import-type only, no clock/random — so `node --test` + the debug loop import them directly. The store (`@/core/data`)
  is read ONLY in the server `page.tsx` files (Wave-1 seam). `/opportunities` is async only because the connector
  runtime is async; deterministic given `as_of`.
- **The ICApproval gate on `/opportunities` is read-only** (it is a pipeline INPUT, not a store `Approval` + action). The
  step/test prove the state machine (approved→current, rejected→conflicted, advance+no-gate→pending_approval). Nothing
  auto-advances.
- **Cross-workspace read scope** on `/workflows` is single-tenant-demo-scoped (same [DEFERRED] as `/approvals`/`/evidence`).

## Adversarially self-reviewed (4-lens) — 0 blockers
correctness · truth-doctrine/no-core-vertical-leak · purity/determinism/strip-safety · test-teeth. Verified: no
clock/random, no enums/parameter-properties, no `@/core/data` import in any gate-imported module, no `core/*.ts` changed;
states distinct; human gates never auto-decide; every new step/test has negative-control teeth.

## Gate (all green in the cloud)
- `node scripts/debug-loop.mjs` → **ALL GREEN 22/22** (new **SEARCH · OPPORTUNITIES · WORKFLOWS** steps)
- `npx tsc --noEmit` → clean · `npm run build` → exit 0 (26/26 routes prerender; the 3 promoted surfaces STATIC `○`)
- `npm test` → **348 pass, 0 fail** (+16)

## New / changed files
- NEW: `app/_surfaces/{universal_search,opportunities_view,workflows_view}.ts`,
  `cartridges/cooperative_markets/run_opportunities.ts`,
  `components/terminal/{TerminalShell,SearchView,OpportunitiesView,WorkflowsView}.tsx`,
  `tests/{universal_search,opportunities_view,workflows_view}.test.mjs`
- EDITED: `app/{search,opportunities,workflows}/page.tsx` (scaffold → real server pages), `app/layout.tsx` (mount the
  command palette), `app/globals.css` (palette overlay), `core/registry/data/ui_surfaces.json` (3 flips + `/search`
  states), `scripts/debug-loop.mjs` (3 steps + UI-SURFACES count), `tests/ui_surfaces.test.mjs` (count),
  docs (`CURRENT_STATE`, `ACTIVE_BUILD`, `BUILD_PROGRESS`, `DEBUG_LOG`, `HANDOFF`)

## NEXT — Wave 3 (toward the ~80% Sprint-IV target)
The rest of the Terminal runtime: **notification + task centers** over the live approval/work-item queues, a
**window/layout shell**, and generalizing the **dashboard runtime**. Promote more scaffolds — `/reports`,
`/collaboration`, `/cartridges`, `/administration` (each has a live-ish data source); `/executives` + `/relationships`
need a store read + seed first (no `Relationship`/`PersonalProfile` list accessor or seed exists yet — biggest gap).
Optionally a real bulk 5300 feed (Bryan) to move the market off labeled-synthetic. The UI surface registry is the map;
look/feel still deferred.

## Bryan-only (route around, don't block)
git push · apply 0018 · a REAL bulk 5300 feed · investment-vehicle decision · VC/Alloya legal.

## NEXT COMMAND
See the exact `tar xzf` + commit/push command in chat (glob-free — zsh-safe).
