# Dispatch OS — next session kickoff (session 6)

How to start the next Cowork session cleanly. Two parts: (A) connect access,
(B) the first prompt to paste. The prompt in (B) also instructs the assistant to
request folder access itself, so either approach works.

---

## A. Before you type anything — connect access

A new chat starts blank. It does NOT remember past sessions or keep folders
connected. You must reconnect each time. Everything is already saved on disk —
you're just granting the new chat access.

Connect TWO folders (use the folder picker, or paste the paths):
- **`~/Downloads/dispatch-os`** — the project. Work here (read + write).
- **`~/Downloads/dispatch-app`** — the live hotel beta. **READ-ONLY reference.**
  Never modify it.

(If you forget, the first prompt below tells the assistant to request these
folders before doing anything — just approve the access prompt when it appears.)

Everything the session needs is already INSIDE `~/Downloads/dispatch-os`:
- `HANDOFF.md` — current status (through session 5) + the session-6 priority
  list and the "actions wired vs not yet wired" table. **Read first.**
- `PLAN.md` — architecture + the 7 deliverables.
- `docs/` — the product specs; `CORE_OBJECT_MODEL.md` is the authoritative
  schema, `WIDGET_SYSTEM_RULES.md` governs the widget layer.
- Working code: `core/` (incl. `core/config/`, `core/engine/`, `core/widgets/`),
  `cartridges/`, `components/` (incl. the new `components/widgets/`), `app/`
  (incl. the new `app/dashboard/`), `db/migrations/` (`0001`–`0005`),
  `scripts/loop-demo.ts`, `scripts/widgets-demo.ts`.

Run check:
```
cd ~/Downloads/dispatch-os && npm install
npm run typecheck                      # → 0 errors
npx --yes tsx scripts/loop-demo.ts     # → "ALL CHECKS PASSED" (24 checks)
npx --yes tsx scripts/widgets-demo.ts  # → "ALL CHECKS PASSED" (widget layer)
npm run dev                            # http://localhost:3000 → click "Dashboard"
```

(Housekeeping: session 5's build check may have left a stray `~/Downloads/
dispatch-os/.next-verify/` dir. It's gitignored and safe to delete from Finder.)

---

## B. The first prompt to paste

> You're picking up Dispatch OS, an industry-agnostic business "operating
> terminal." Before doing anything else, get file access: request permission to
> connect two folders on my computer —
>   • `~/Downloads/dispatch-os`   (the project — read + write, work here)
>   • `~/Downloads/dispatch-app`  (the live Dispatch hotel beta — READ-ONLY
>     reference, never modify it)
> Use the folder-access tool to request these; don't proceed until both are
> connected. A fresh session starts blank and does NOT remember past sessions or
> keep folders connected — everything is already saved on disk, you're just
> regaining access.
>
> What this project is: Dispatch OS is the generic operating core extracted from
> the Dispatch hotel app. The spine is: inbound data → rules/agents interpret →
> proposals (draft work) → human review/promote → work items executed → evidence
> logged → reports/dashboards → outcomes. It runs entirely on an in-memory data
> layer (no backend, no cost); SQL ships as forward-only migration files only.
>
> Hard invariant: the core is industry-agnostic. Cartridges are REMOVABLE
> plug-ins; Hospitality and Wealth are demo cartridges — neither is the product.
> Do NOT put any vertical concept (hotel/finance nouns) in `core/`,
> `components/`, or the generic `app/` pages. Meaning attaches only through
> configuration: entity_type keys, work-item `kind`, `context` jsonb,
> vocabulary, and `widget_config`.
>
> Read, in order: `HANDOFF.md` (start with "Status at session 5"), then
> `PLAN.md`, then the specs in `docs/` — treat `docs/CORE_OBJECT_MODEL.md` as the
> authoritative schema and `docs/WIDGET_SYSTEM_RULES.md` for the widget layer.
> Before changing anything, confirm the demo is healthy:
>   npm install
>   npm run typecheck                      # → 0 errors
>   npx --yes tsx scripts/loop-demo.ts     # → ALL CHECKS PASSED (24 checks)
>   npx --yes tsx scripts/widgets-demo.ts  # → ALL CHECKS PASSED (widget layer)
>   npm run dev                            # then open /dashboard
>
> Where things stand: sessions 1–3 built the v0 scaffold, two cartridges, the
> full propose→promote→work→evidence loop, the 27-object core model, the
> Configuration layer, and the engine build-chases. Session 4 scaffolded the
> generic widget system under `core/widgets/`. Session 5 applied the UI as a thin
> render pass over it: `components/widgets/` (DashboardView + one renderer per
> widget type + the action-wiring seam) and `app/dashboard/` (with a role
> switcher and a Configured-vs-Role-default toggle). Per my call, session 5 wired
> only the actions the in-memory store already backs and surfaced the rest as a
> visible "wiring pending" note.
>
> This session: close the wiring gap (HANDOFF "Recommended next priority"
> #1) — turn the declared-but-unwired widget actions into real, event-logged
> store mutations so the dashboard is fully operable. Work the HANDOFF "actions
> wired vs not yet wired" table top to bottom: add the matching `DataStore`
> methods + server actions in `app/actions.ts` (each logging an event), and
> update `WIRED_ACTIONS` in `components/widgets/WidgetActions.tsx` as each lands
> so the UI note shrinks. Keep it on the in-memory store (no Supabase yet); add
> any per-role write guards as forward-only migration files only. Don't add a
> paid backend, no new dependencies without asking me, and keep the demo runnable
> at every step. Propose a short plan before cutting code. At ~70% capacity draft
> an updated `HANDOFF.md`; tell me at ~80% so I can switch.

---

## C. Parallel track (hotel beta — unrelated to OS work)
The live beta has its own QA punchlist; keep that work in the `dispatch-app`
repo and OS work in `dispatch-os`. Don't cross the streams.
