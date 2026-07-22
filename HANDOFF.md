# HANDOFF — Olympic Sprint III, Wave 5 (2026-07-22)

**Build: ~60%** (honest recompute; was ~59% at Wave 4). A BREADTH / framing wave: the whole product UI is now
framed end-to-end and one joint surface (`/network`) is real. Sprint III target ~68% still needs harness/truth/kernel
DEPTH + the real bulk 5300 feed (Bryan-only) + more real connectors.

## The steer (Bryan, this wave)
Wave 5 was scoped as a UI focus group. Bryan reframed it: **frame the ENTIRE product's UI** — placeholders, wireframes,
scaffolding for *everything* — so the product/framing is complete, and **defer all look/feel/flow/cadence** to a later
polish sprint ("we will quarrel on the look feel flow and cadence" later). So: match the existing surfaces, mark
everything scaffold, make the framing complete + coherent, keep marching toward V1.

## What shipped (additive, new-files-only in the engine core; no vertical noun in `core/`)
1. **UI surface registry (config-as-data)** — `core/registry/data/ui_surfaces.json` declares the whole FS-10000 Terminal
   IA as **23 surfaces** (10 live, 13 scaffold) across 11 nav sections; each names its primary object, planned
   tabs/commands, human gates, and the doctrine **state legend** (current/missing/stale/inferred/synthetic/restricted/
   pending_approval/conflicted). Generic loader `core/registry/ui_surfaces.ts` (closed-graph: unique routes · sections
   resolve · state vocab enforced; pure; names no vertical).
2. **ScaffoldView + scaffold pages** — `components/terminal/ScaffoldView.tsx` renders each scaffold route as a framed
   wireframe; a page per scaffold route was generated from the registry (13 routes). `app/layout.tsx` nav renders FROM
   the registry (grouped, scaffolds dimmed + °-tagged) so the whole product is reachable from any page.
3. **The JOINT `/network` surface** — `app/network/page.tsx` + `components/terminal/NetworkView.tsx` over
   `cartridges/cooperative_markets/run_network_surface.ts`. **Review-queue-FIRST** (Bryan's pick): PROPOSE-ONLY queue
   (cross-source entity duplicates + external-canon alias proposals, confirm/reject, **merged_count=0**, never
   auto-merge) above the full-market list (LABELED synthetic; `all_labeled` computed from data + shown). Deterministic.
4. **CANON 5→15 aliases** — +2 confirmed FS-8000 sources (`SRC-CFPB-REGS`, `SRC-FDIC-FAILED-BANKS`, liveness-checked);
   +8 proposed FS-5100 registry ids (workflow/agent/event/evidence/approval/kpi — doc-grade, identity-not-authority,
   surfaced in the /network queue). **CATALOG 73→93** config-as-data source+connector manifests (closed graph).
5. **Gate**: new **UI-SURFACES** + **NETWORK** debug steps → **16/16** green; **308** unit tests (+11:
   `tests/ui_surfaces.test.mjs`, `tests/network_surface.test.mjs`).

## Blocker found + fixed (see DEBUG_LOG)
The three config-as-data loaders (`ui_surfaces.ts`, `connectors.ts`, `canon.ts`) located their JSON via
`fileURLToPath(new URL(...))`, which Turbopack hands a non-node URL → `next build` crashed prerendering `/network`
(the first prerendered page to load the catalog/canon) and `/_not-found` (layout loads the surface registry).
Fixed by rooting all three at `process.cwd()`. The connector RUNTIME is untouched.

## Gate (all green in the cloud)
- `node scripts/debug-loop.mjs` → **ALL GREEN 16/16** (new UI-SURFACES + NETWORK steps)
- `npx tsc --noEmit` → clean · `npm run build` → exit 0 (26/26 routes prerender incl `/network` + 13 scaffolds)
- `npm test` → **308 pass, 0 fail** · Adversarially verified (4-lens)

## New / changed files
- NEW: `core/registry/data/ui_surfaces.json`, `core/registry/ui_surfaces.ts`,
  `components/terminal/ScaffoldView.tsx`, `components/terminal/NetworkView.tsx`, `app/network/page.tsx`,
  `cartridges/cooperative_markets/run_network_surface.ts`, `tests/ui_surfaces.test.mjs`,
  `tests/network_surface.test.mjs`, and 13 scaffold pages `app/{institutions,executives,relationships,opportunities,
  workflows,evidence,approvals,search,reports,collaboration,cartridges,personas,administration}/page.tsx`
- EDITED: `app/layout.tsx` (registry-driven nav), `app/globals.css` (nav + review-queue classes),
  `core/registry/data/canon_aliases.json` (5→15), `core/registry/data/connectors.json` (73→93),
  `core/registry/connectors.ts` + `core/registry/canon.ts` (loader path → process.cwd()),
  `scripts/debug-loop.mjs` (UI-SURFACES + NETWORK steps), docs
  (`BUILD_PROGRESS.md`, `CURRENT_STATE.md`, `ACTIVE_BUILD.md`, `DEBUG_LOG.md`, `HANDOFF.md`),
  `SPRINT_III_WAVE6_KICKOFF_PROMPT.md` (new)

## NEXT — Wave 6 (see SPRINT_III_WAVE6_KICKOFF_PROMPT.md)
Start turning scaffolds into real surfaces (Institutions directory over the full market; Approvals/Evidence over the
live human gates) AND/OR push the Sprint-III depth targets — a real bulk 5300 feed (Bryan), more real connectors,
harness/truth depth — toward ~68%. The UI surface registry is the map to build against; look/feel still deferred.

## Bryan-only (route around, don't block)
git push · apply 0018 · a REAL bulk 5300 feed · investment-vehicle decision · VC/Alloya legal.

## NEXT COMMAND
See the exact `tar xzf` + commit/push command in chat (glob-free — zsh-safe).
