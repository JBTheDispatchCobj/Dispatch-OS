ultracode — Olympic Sprint III, Wave 6. Fill scaffolds into real surfaces + push Sprint-III depth toward ~68%.
The Dispatch OS / Cooperative Markets repo folder is connected as context — LIST it and read from it before anything
else (verify files exist; do not assume). The FS / Dispatch-Auric V1 canon lives IN-REPO at
docs/06_external_canon/ (adopted in ADR-0017 — reference/operational canon, identity not authority).

ORIENT FIRST — read in order, then confirm orientation in one short paragraph:
1. README.md
2. docs/00_governance/DOCTRINE.md
3. docs/00_governance/CURRENT_STATE.md
4. docs/00_governance/ACTIVE_BUILD.md
5. docs/00_governance/BUILD_PROGRESS.md   (the % tracker — Wave 5 closed at ~60%; keep it current, recompute HONESTLY)
6. docs/00_governance/OLYMPIC_SPRINT_ROADMAP.md   (Sprint III target ~68%)
7. HANDOFF.md
8. DEBUG_LOG.md
9. docs/01_architecture/adr/ADR-0017-FS-V1-CANON-ADOPTION.md
Then skim: core/registry/ui_surfaces.ts + core/registry/data/ui_surfaces.json (the UI surface registry — the MAP of
the whole product, 23 surfaces 10 live/13 scaffold), components/terminal/{ScaffoldView,NetworkView}.tsx,
cartridges/cooperative_markets/run_network_surface.ts, core/registry/{canon,connectors}.ts + data/*.json,
scripts/debug-loop.mjs (16 steps), tests/*.test.mjs (307 unit tests).

STATE (do not regress): Migrations 0001–0017 APPLIED; 0018 additive, Bryan-only. Sprint III shipped W1 connector
runtime+SDK; W2 full-market 5300 at scale (LABELED synthetic) + intake→deal engine + SEC EDGAR + catalog 39→57;
W3 FDIC BankFind + Federal Register + connector candidates→Object Registry (propose-only) + catalog 57→73; W4 the
FS canon reconciliation seam + ADR-0017; **W5 framed the WHOLE product UI (23 surfaces) + the JOINT /network
surface (review-queue-first, propose-only) + canon 5→15 + catalog 73→93**. debug-loop ALL GREEN (16/16), 307 tests.
Default in-memory; Supabase drops in when creds + 0018 set. Real bulk 5300 NOT landed → full-market stays LABELED
synthetic. **Look/feel is STILL deferred** (Bryan will steer cadence later) — build against the data contracts, keep
scaffolds visually consistent, do not lock styling.

ANTI-CLOBBER (Bryan's rule) — BEFORE changing anything: `git status` in the repo, confirm clean; the last pushed
commit should be the Sprint-III-Wave-5 commit. If a `_wave*_incoming.tgz` staging tarball is present + uncommitted,
APPLY it first (extract) before building — never build on a stale HEAD.

EXECUTE — Wave 6 (additive; config-as-data; no vertical noun in core/; connector runtime UNCHANGED; regulated
conclusions + publication stay behind ICApproval + EditorialDisposition). Pick the highest-value slice(s):
* FILL SCAFFOLDS → REAL SURFACES using the UI surface registry as the contract. Best candidates:
  - `/institutions` — a real directory over the full-market profiles (search/filter/sort; open → /terminal); flip its
    ui_surfaces status live once built.
  - `/approvals` + `/evidence` — real surfaces over the LIVE human gates (the contract layer already routes
    review/decide through the permission engine); render pending/decided with lineage + evidence drill.
  When a scaffold becomes live: flip `status` in ui_surfaces.json, add a page over real run output, and the
  UI-SURFACES debug step's liveness check keeps it honest.
* DEPTH toward ~68% (Sprint III targets): more real connectors (SEC full-text, Federal Reserve data, FFIEC CDR) and/or
  harness/truth depth. Grow the canon crosswalk (confirm the unambiguous proposed FS-5100 registry aliases as their
  live registries get built; propose new ones).
* REAL bulk 5300 IF Bryan staged it (check docs/04_sources/ncua/ for real per-CU 5300 financials) — swap the synthetic
  market's injected batch behind the SAME connector; move truth to real figures HONESTLY. Else keep labeled synthetic.
* Add a debug-loop assertion + unit tests for every new surface/service/connector.

OPERATING RULES (every wave): additive only; config-as-data; no vertical nouns in core/; NEVER a regulated/financial
conclusion in weights; truth tiers/planes not conflated; pure/deterministic modules (caller injects ids/timestamps);
connectors NORMALIZE only; synthetic/illustrative data CLEARLY LABELED, never presentable as real; the canon seam
reconciles IDENTITY not AUTHORITY (a label match is not a semantic merge). Registry loaders read config-as-data via
`process.cwd()` (NOT `fileURLToPath(new URL(...))` — it breaks prerender; see DEBUG_LOG W5).

DEBUG AS YOU GO: log to DEBUG_LOG.md tagged [BLOCKER]/[NON-BLOCKING]/[DEFERRED]; fix blockers now.
DEBUG GATE before the wave is done: `npm install` once if needed, then `node scripts/debug-loop.mjs` ALL GREEN (ADD a
new assertion + unit tests for every new surface/service/connector) + `npx tsc --noEmit` clean + `npm run build`
exit 0 (every route prerenders) + `npm test` green. Adversarially verify (4-lens) before committing.

CHECKPOINT + CONTEXT DISCIPLINE: checkpoint at wave end (recompute % HONESTLY; update CURRENT_STATE, ACTIVE_BUILD,
BUILD_PROGRESS, DEBUG_LOG; fresh HANDOFF; next kickoff; exact git command). MONITOR CONTEXT — at ~80%, STOP,
checkpoint cleanly, hand back a fresh first-prompt. The Dispatch sandbox git cannot push — write files, hand Bryan
the exact Mac command: a GLOB-FREE (zsh-safe), explicit-filename command that starts
`rm -f .git/index.lock && rm -rf _to_delete`, removes any `_cloudsync_in.tgz`/`_cloudsync_out.tgz`/
`_repo_snapshot.tgz`/`_freshsnap.tgz`/`_wave*_incoming.tgz` stragglers by EXPLICIT name (no `*` globs), `tar xzf` the
staging tarball, `rm -f` it, then `git status` → `git add -A` → `git commit` → `git push`. Verify with `git status`
first; never assume a push happened. git push + apply 0018 + real bulk 5300 + investment-vehicle + VC/Alloya legal
are Bryan-only.
Go — orient, verify no lost updates, fill a scaffold or two into real surfaces + push depth, pass the debug gate,
hand back a clean commit command + the next kickoff.
