# Dispatch OS — implementation plan

Dispatch OS is the industry-agnostic operating core extracted from the Dispatch
hotel product. The hotel beta is **Hotel Cartridge v0** and a reference
implementation — it is NOT modified or genericized in place. Dispatch OS is a
**sibling project**.

The reusable spine, proven by the hotel beta, now generalized:

> inbound data/events → rules/agents interpret → **proposals** (draft work) →
> **human review/promote** → work items executed → **evidence** logged →
> reports/dashboards → market/outcome outputs

This document is the 7 pre-coding deliverables. The scaffold in this repo
already implements the MVP slice (§4) on an in-memory data layer — no backend,
no cost.

---

## 1. Folder structure

```
dispatch-os/
  core/                      # agnostic engine — NEVER names a vertical concept
    types.ts                 # the generic object model (the contract)
    cartridge.ts             # Cartridge interface + registry
    auth/session.ts          # session/role boundary (stubbed → Supabase later)
    data/
      store.ts               # DataStore interface + InMemoryStore
      index.ts               # builds the in-memory DB, exposes `store` singleton
      supabase-adapter.ts    # stub: implement DataStore vs Postgres later
  cartridges/                # verticals plug meaning in here
    index.ts                 # imports each cartridge (side-effect registration)
    hospitality/cartridge.ts # Cartridge 1 (the hotel app, thin port)
    wealth/cartridge.ts      # Cartridge 2 (RIA acquisition readiness, demo)
  components/                # generic, cartridge-blind UI
    WorkItemList / WorkItemDetail / ChecklistPanel / NotesPanel /
    EvidencePanel / StatusActions / ReviewQueue / ProposalQueue / ...
  app/                       # Next.js App Router
    page.tsx                 # workspace (cartridge) switcher
    work/ , work/[id]/       # generic work list + detail
    review/ , proposals/     # human review queue + agent proposal gate
    actions.ts               # server actions (the only mutation path)
  db/migrations/             # paste-ready Postgres for when hosting begins
    0001_core.sql , 0002_rls.sql
  PLAN.md / README.md / HANDOFF.md
```

Rule of thumb: if a file under `core/` ever needs the word *room*,
*reservation*, *household*, or *rent roll*, it belongs in a cartridge instead.

---

## 2. Database schema (core primitives)

Full DDL in `db/migrations/0001_core.sql`; tenancy/RLS in `0002_rls.sql`.
Generic tables only:

`organizations`, `workspaces`, `user_profiles`, `workspace_memberships`,
`entity_types`, `entities`, `work_items`, `work_item_events`, `checklist_items`,
`notes`, `documents`, `evidence_items`, `inbound_events`, `agent_runs`,
`agent_actions`, `work_item_proposals`, `report_runs`, `outcome_outputs`.

Design rules:
- **Universal primitives are typed columns; cartridge specifics live in
  `context jsonb`** — but each cartridge declares its expected context shape via
  `entity_types.context_hint` and (later) a schema, so context is not a junk
  drawer.
- **Every meaningful action emits a `work_item_events` row** (append-only,
  `schema_version`), and the `actor` field makes **human vs agent explicit**.
- **Tenancy is enforced in the DB** (org → workspace → membership), designed in
  from day one because finance/wealth data is confidential.

Beta → OS mapping: `tasks→work_items`, `task_events→work_item_events`,
`task_checklist_items→checklist_items`, `task_drafts→work_item_proposals`,
`inbound_events→inbound_events`, `notes→notes`,
`maintenance_issues→evidence_items(kind='issue')`, `staff→user_profiles +
workspace_memberships`, hotel `reservations`/`rooms`→hospitality cartridge
entities.

---

## 3. Cartridge architecture

A **Cartridge** (`core/cartridge.ts`) is how a vertical attaches meaning to the
core without the core ever importing it. It declares:

- `entityTypes` — the nouns (`wealth:advisory_firm`, `hospitality:room`)
- `workflows` — the work-item kinds (`wealth:data_room_cleanup`)
- `checklistTemplates` — default checklists per workflow
- `rules` — **declarative** interpretation rules (the "when → produces" the
  rules/agent engine reads to generate proposals). Logic is data, not code.
- `knowledge` — markdown KB objects
- `reports` — report definitions
- `seed(workspaceId)` — optional demo fixtures

Cartridges self-register on import (`registerCartridge`). The core renders any
work item generically: the cartridge only supplies labels and `context`. One
workspace runs exactly one cartridge; an org can run several.

This is why the same screens render a hotel room turn and an RIA data-room
cleanup with zero conditional hotel/finance code in `core/` or `components/`.

---

## 4. MVP scope (what this scaffold proves)

Implemented and typechecking green:
- Core object model + in-memory `DataStore` (Supabase swap is one line later).
- Cartridge registry with **two** cartridges (Wealth demo + Hospitality stub) —
  proving the core is multi-vertical, not a hotel app.
- Generic UI: workspace switcher, `WorkItemList`, `WorkItemDetail` (answers the
  six questions: what / who / status / evidence / review / next), `Checklist`,
  `Notes`, `Evidence`, `StatusActions`, `ReviewQueue`, `ProposalQueue`.
- The full human-in-the-loop loop is clickable: an **agent proposal** →
  **human promote** → a real **work item** appears, with the promotion logged as
  a human action in the audit trail.
- Wealth demo seeded with a real-feeling scenario (Cedar Ridge Wealth Advisors:
  concentration flag, founder-dependency proposal, data-room checklist,
  reconciliation evidence).

Explicitly **out of scope** for this first build: connectors/integrations,
report generation engine, real auth, dashboards, the other cartridges
(trades/CRE), and any persistence beyond the in-memory store.

---

## 5. Patterns to copy from the Dispatch beta (and why)

Borrow the *pattern*, re-typed to the generic model — do not copy hotel files:
- **Supabase auth/session + role-gated layouts** → `core/auth/session.ts` (the
  `resolveAuthUser` + `fetchProfile` + role-gate shape).
- **task/event/audit model** → `work_items` + `work_item_events`
  (`schema_version`, append-only, actor).
- **orchestration boundary** (beta's `lib/orchestration`) → `app/actions.ts` +
  `DataStore` methods (all mutations in one place, each logging an event).
- **checklist execution** → `ChecklistPanel` + `checklist_items`.
- **notes/maintenance** → `NotesPanel` (notes) + `evidence_items` (the
  maintenance-issue shape generalizes to typed evidence).
- **inbound → draft → review → promote** (beta's `task_drafts` /
  `promote_drafts_to_tasks`) → `work_item_proposals` + `ProposalQueue`.
- **RLS-by-role, SECURITY DEFINER predicate** (beta's `auth_profile_role()`) →
  `app_is_member()` in `0002_rls.sql`.
- **mobile-first, flat, plain-CSS operational UI** → `app/globals.css`.

---

## 6. Hotel-specific things to NOT copy into core

Never let these into `core/` or `components/` — they are Hospitality cartridge
content only: rooms, reservations, guests, arrivals, departures, stayovers,
housekeeping turns, deep cleans, EOD/SOD buckets, the daily reservation batch,
ResNexus/channel-manager logic, Forrest-Inn / Jennifer-specific rules, the six
neon bucket palettes, staff_home_bucket, the X-430 card variants.

---

## 7. First-pass implementation steps (status)

1. ✅ Scaffold `dispatch-os` (Next 16 / React 19 / TS strict / plain CSS).
2. ✅ Core schema/migrations for primitives (`0001_core.sql`, `0002_rls.sql`).
3. ◻ Auth/org/workspace/role model — **stubbed** (demo session); wire Supabase
   when hosting.
4. ✅ `WorkItemList`  5. ✅ `WorkItemDetail`  6. ✅ `ChecklistPanel`
   7. ✅ `NotesPanel`  8. ✅ `EvidencePanel`  9. ✅ `StatusActions`
   10. ✅ `ReviewQueue`  11. ✅ `ProposalQueue`.
12. ✅ Cartridge registry/config.
13. ✅ One minimal demo cartridge (Wealth) proving it is not a hotel app.

Next session candidates (see `HANDOFF.md`): a report-generation step that builds
the Acquisition Readiness Report from evidence; a CSV-upload → inbound_event →
agent_run → proposal flow; per-role write policies; then the Supabase adapter.

---

## Product philosophy (load-bearing)

Not a chatbot, not free-roaming agents. Operating infrastructure where agents
**propose** and humans **promote**; execution is logged; evidence is preserved;
reports are generated from structured evidence. Manual ingestion first
(uploads/CSV/XLSX/docs/manual entry), connectors later.
