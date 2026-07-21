# Olympic Sprint Roadmap — 26% → ~100%

**Purpose.** A wave-by-wave path from the platform's current **~26%** (post Wave 1) to a
genuinely finished product, projected against the exact weighted layers in
`BUILD_PROGRESS.md` so every headline number is auditable, not a guess. This is the
*platform* build track. Knowledge-content encoding (ontology / truth models / rule /
workflow / agent / KPI / knowledge-pack libraries) is tracked separately in
`DISPATCH_OS_REMAINING_ROADMAP.md` and is NOT folded into these platform percentages
until the final sprint.

**Method.** `BUILD_PROGRESS.md` scores the build as a weighted sum of nine layers
(`contribution = weight × built`). This roadmap projects each layer's `built %` at the
end of each Olympic Sprint and re-derives the headline. The waves inside a sprint each
end at the debug gate (`node scripts/debug-loop.mjs` green + the wave's own build check).

**Bottom line.** ~**1 sprint** (this one, finishing Waves 2–4) reaches a demoable first
product (~40%). ~**6 Olympic Sprints total** (this one + 5) reaches a finished ~100%
platform — with an honest asterisk that the back half is productionization and
Bryan-only external decisions (investment vehicle, `0016`/`0017` apply, VC/Alloya legal),
not module wiring.

---

## The ladder (headline per sprint)

| Layer (weight) | Now | S-I | S-II | S-III | S-IV | S-V | S-VI |
|---|--:|--:|--:|--:|--:|--:|--:|
| Data contracts + schema (15%) | 82 | 85 | 90 | 92 | 94 | 97 | 100 |
| Kernel services (20%) | 14 | 28 | 55 | 70 | 80 | 92 | 100 |
| Truth / graph engines (15%) | 9 | 18 | 45 | 60 | 72 | 88 | 100 |
| Harness + Execution (15%) | 13 | 25 | 38 | 55 | 70 | 88 | 100 |
| Publication (Auric) (8%) | 20 | 38 | 50 | 62 | 78 | 90 | 100 |
| Connectors + ingestion (7%) | 10 | 20 | 35 | 70 | 82 | 92 | 100 |
| Cooperative Markets cartridge (8%) | 62 | 78 | 85 | 92 | 96 | 98 | 100 |
| Terminal (7%) | 2 | 25 | 35 | 50 | 82 | 92 | 100 |
| Tests / observability (5%) | 14 | 25 | 40 | 55 | 68 | 90 | 100 |
| **Platform headline** | **~26%** | **~40%** | **~55%** | **~68%** | **~80%** | **~92%** | **~100%** |

Each column is the projected state at that sprint's close; the headline is the weighted
sum of that column. The deltas are front-loaded onto whatever layer each sprint targets.

---

## Sprint I — Running vertical slice *(current; Wave 1 done)*
**Target: ~40%.** Turn the running spine into a product a customer can click, on real data,
publishing to a lensed feed. This is the sprint already underway.

- **Wave 1 — Orchestration spine. ✅ DONE (~26%).** `pipeline.ts` chains ingest→score→IC
  memo→[human gate]→allocate→settle→assembleIO→renderVariants→buildFeed into a deterministic
  `DealRun`; kernel events + cost ledger + harness routing; real human gate. Debug gate green.
- **Wave 2 — Terminal UI. ▶ NEXT.** Replace `terminal_demo.html` with the real Next.js surface
  reading `runDealPipeline` output: runtime shell + nav; opportunity feed with the executive-lens
  toggle (CEO/CRO/CFO) over `buildFeed`; institution + deal scorecards (P1); IC memo view (P2);
  allocation view (P3); portfolio/monitoring (P4). Moves Terminal 2→25, cartridge 62→78.
  Gate: `npm run build` + debug-loop green.
- **Wave 3 — Live data + kernel/truth services.** Wire `ingest_call_report` to the real NCUA 5300
  data at scale; stand up the object-registry service + entity resolution (after Bryan applies
  `0016`+`0017`); profile assembly from sourced facts; persist via the supabase adapter. Moves
  kernel 14→28, truth 9→18, connectors 10→20.
- **Wave 4 — Auric distribution + hardening.** Channel variants (brief / market-feed / terminal-feed)
  with the editorial verification gate; unit tests for the engines; wire the debug loop into CI;
  cost-ledger dashboards + event replay. Moves Auric 20→38, harness 13→25, tests 14→25.

## Sprint II — Kernel & Truth platform
**Target: ~55%.** Make the substrate the schema already implies into real services.

Identity & Tenancy (RFC-2002) + permission engine; the object-registry service maturing the
match-candidate → merge pipeline across the shared-market plane; the confidence engine
(decay/propagate/outcome-feedback) driving live profile assembly + query; the kernel request
envelope + contracts/API layer (RFC-2001/2014). Moves kernel 28→55, truth 18→45, harness 25→38.
Gate: debug-loop + service integration checks green. **Prereq:** `0016`+`0017` applied (Bryan).

## Sprint III — Connectors & scale
**Target: ~68%.** Run the network on breadth of real sources, not fixtures.

Connector runtime + SDK (RFC-2011 + Vol IX): typed output contract, parser contract,
change-event / quality-report / health, and qualifying the ~93 placeholder connectors; full-market
NCUA ingestion → institution profiles at scale; startup-intake connector. Moves connectors 20→70,
truth 45→60, kernel 55→70, cartridge 85→92.

## Sprint IV — Terminal & product surface complete
**Target: ~80%.** The Terminal becomes a real operating environment, not just deal views.

Terminal runtime + window/layout (Vol VII); command palette; universal search + navigation;
notification center; task center; dashboard runtime; collaboration; the executive-lens surfaces
generalized beyond the deal slice. Moves Terminal 50→82, Auric 62→78, harness 55→70.

## Sprint V — Productionization & GA
**Target: ~92%.** Cross the line from "runs" to "operable by customers."

Execution Engine (Vol VIII: operational plan graph, scheduler, saga/rollback, live monitoring,
committee approval + delegation); audit + memory services (RFC-2007/2012); live RLS/tenant
isolation enforced; tests/CI/observability at a production bar; **paid billing + freemium**
implementation. Moves tests 68→90, kernel 80→92, all layers toward completion.

## Sprint VI — Deferred items, polish & knowledge-track close
**Target: ~100%.** Burn down everything explicitly deferred.

Securities execution mechanics; production fund/SPV administration (post the vehicle decision);
final UI polish; full multimedia rendering; and folding the knowledge-encoding roadmap
(`DISPATCH_OS_REMAINING_ROADMAP` Sprints 2–10) into the platform. Several items here are gated on
**Bryan-only external decisions** (investment vehicle, VC/Alloya legal + entity), so the calendar
for this sprint is bounded by those, not by build velocity.

---

## Caveats worth keeping in view
1. **The tail is slow and non-linear.** 80→100% is productionization (billing, securities
   mechanics, fund/SPV admin, hardening), which is disproportionately more effort per point than
   the wiring-heavy middle.
2. **Some completion is not a build problem.** The vehicle decision, the `0016`/`0017` apply, and
   VC/Alloya legal gate real product capability and can stretch the schedule independent of code.
3. **Two tracks, one product.** This roadmap is the *platform*. Market-readiness also needs the
   knowledge-encoding track (`DISPATCH_OS_REMAINING_ROADMAP`), which only merges into the platform
   headline in Sprint VI.
4. **Estimates, not commitments.** The per-layer projections are a defensible model against the
   tracker's methodology; each wave's actual delta is recomputed in `BUILD_PROGRESS.md` at session
   close, and this roadmap should be re-baselined against those real numbers as they land.
