# HANDOFF — Olympic Sprint IV, Wave 1 (2026-07-22)

**Build: ~61%** (honest recompute; was ~60% at Sprint III Wave 5). Sprint IV opens (**Terminal & product surface
complete, target ~80%**). Wave 1 promoted three of the highest-value FRAMED scaffolds into REAL surfaces over live
run output. Additive; no vertical noun in `core/`; connector runtime + engines + the human-gate contract layer
UNCHANGED; default in-memory; look/feel deferred (reused the existing design tokens).

## What shipped (3 scaffolds → real surfaces, `ui_surfaces.json` the contract → 13 live / 10 scaffold)
1. **`/institutions` — a REAL directory over the full market.** `cartridges/cooperative_markets/run_institutions_directory.ts`
   (pure/deterministic/erasable-only) itemizes the whole synthetic market into browse rows: the five 5300 ratios as
   deterministic calcs each citing its filing; asset-size + PCA readiness bands; profile confidence marked **inferred**;
   **region surfaced as `missing`** (not sourced from a 5300 → shown, NEVER faked); a `buildDirectoryVM` seam +
   `unlabeled` provenance label so an unknown-provenance row is flagged untrusted row-by-row (not defaulted benign).
   `components/terminal/InstitutionsDirectoryView.tsx` renders search / filter (readiness · asset-band · label) /
   total-order sort (charter tiebreak); each row → that institution's `/terminal`. Scales one→thousands. LABELED
   synthetic (`all_labeled` computed from data); real bulk 5300 is Bryan-only.
2. **`/approvals` — the LIVE human approval gate.** `app/_surfaces/approvals_view.ts` (pure, store-free) buckets the
   store's `Approval` objects **awaiting vs decided** with lineage + states pending_approval / **restricted** / current.
   `restricted` prefers a PERSISTED classification (`metadata.restricted`/`risk_class`) and falls back to an INJECTED
   marker set (`DEFAULT_RESTRICTED_MARKERS`, caller-overridable) — no vertical hardcoded in the builder body.
   `components/terminal/ApprovalsView.tsx` renders the queue; approve / request-changes / reject post to the EXISTING
   `decideApprovalAction` → `app/contracts.decideApproval` → `core/kernel/permissions` (authorize-FIRST). The builder
   NEVER decides — only a `requested` approval is `decidable`.
3. **`/evidence` — LIVE provenance with drill-through.** `app/_surfaces/evidence_view.ts` (pure) projects evidence
   across work items into lineage rows with states current / **stale** / **inferred** / pending_approval / **restricted**
   distinct (rejected is never mislabeled "current"). `components/terminal/EvidenceView.tsx` groups by object / by
   source / unreviewed; review routes THROUGH `reviewEvidenceAction` → `contracts.reviewEvidence`. NEVER auto-reviews.

Additive coop-seed fixtures (1 pending high-risk approval `appr_alloc` + 1 unreviewed/old/agent-captured evidence
`ev_delinquency`) so the live gates render their full state legend over REAL store data (no test pins seed counts).
`app/actions.ts` gained `revalidatePath('/approvals')` + `('/evidence')`.

## Design note (why the builders are pure/store-free)
The in-memory `store` uses TS **parameter properties**, which `node`'s strip-only mode rejects — so `node --test` +
the debug loop cannot import the store. The view-model builders are therefore pure, erasable-only, store-free (tests +
debug steps drive them with fixture arrays); the server pages read the store and hand arrays to the builder; the Next
build compiles the store fully so the pages render. See DEBUG_LOG.

## Adversarially verified (4-lens fleet) — all findings fixed
- **purity/determinism: 0 findings.** **correctness: "wave is correct"** (gate wiring reaches `core/kernel/permissions`;
  `queryDirectory` non-mutating total order; batch↔raw order-preserving; seed consistent) — one rejected→"current" nit, fixed.
- **doctrine (1 major + 1 minor + 1 deferred nit):** restricted-classifier de-hardcoded (persisted-supersedes + injected
  markers); `unlabeled` provenance label added; cross-workspace read-authorize noted [DEFERRED] (safe in the single-tenant
  demo; needs principal-scoping on a real multi-tenant store).
- **test-teeth (2 major + 2 minor):** the total-order tiebreak + the `all_labeled=false` branch are now driven through the
  real code (constructed equal-key fixture + `buildDirectoryVM` negative case); tautological assertions replaced with
  meaningful directions; non-empty filter guards added. Mirrored in the debug steps.

## Gate (all green in the cloud)
- `node scripts/debug-loop.mjs` → **ALL GREEN 19/19** (new **INSTITUTIONS · APPROVALS · EVIDENCE** steps: renders over
  real data · human-gate-intact/never-auto-decide · missing/stale/inferred/synthetic/pending states distinct · deterministic)
- `npx tsc --noEmit` → clean · `npm run build` → exit 0 (26/26 routes prerender; the 3 promoted surfaces STATIC `○`)
- `npm test` → **332 pass, 0 fail** (+24)

## New / changed files
- NEW: `cartridges/cooperative_markets/run_institutions_directory.ts`, `app/_surfaces/approvals_view.ts`,
  `app/_surfaces/evidence_view.ts`, `components/terminal/{InstitutionsDirectoryView,ApprovalsView,EvidenceView}.tsx`,
  `tests/{institutions_directory,approvals_view,evidence_view}.test.mjs`
- EDITED: `app/{institutions,approvals,evidence}/page.tsx` (scaffold → real server pages), `app/actions.ts` (revalidate),
  `core/registry/data/ui_surfaces.json` (3 flips scaffold→live + tabs/states), `cartridges/cooperative_markets/seed.ts`
  (2 additive fixtures), `components/terminal/InstitutionsDirectoryView.tsx` (unlabeled chip), `scripts/debug-loop.mjs`
  (3 steps), docs (`CURRENT_STATE`, `ACTIVE_BUILD`, `BUILD_PROGRESS`, `DEBUG_LOG`, `HANDOFF`)

## NEXT — Wave 2 (toward the ~80% Sprint-IV target)
The Terminal RUNTIME (Vol VII): window/layout shell, command palette, universal search over the directory + registry,
notification/task centers. Promote more scaffolds (`/opportunities`, `/workflows`, `/relationships`, `/executives`,
`/search`). Optionally a real bulk 5300 feed (Bryan) → moves the market off labeled-synthetic. The UI surface registry
is the map; look/feel still deferred.

## Bryan-only (route around, don't block)
git push · apply 0018 · a REAL bulk 5300 feed · investment-vehicle decision · VC/Alloya legal.

## NEXT COMMAND
See the exact `tar xzf` + commit/push command in chat (glob-free — zsh-safe).
