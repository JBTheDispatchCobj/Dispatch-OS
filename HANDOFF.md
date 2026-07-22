# HANDOFF — Olympic Sprint III, Wave 3 (2026-07-22)

**Build: ~58%** (honest recompute; was ~56% at Wave 2). Sprint III target ~68% still needs the
REAL bulk 5300 feed + full catalog qualification + a Terminal surface.

## What shipped this wave (additive, config-as-data, no vertical noun in `core/`, runtime UNCHANGED)
1. **FDIC BankFind — a real connector** (`cartridges/cooperative_markets/connectors/fdic_bankfind_connector.ts`
   + `run_fdic_bankfind.ts`). Normalizes FDIC-insured **institution** metadata → `public_fact` FROM THE
   SOURCE MANIFEST (differing-source proof). Banks are classed `entity:coop_markets:financial_institution`
   — never a credit union. Real reject path (blank CERT/name).
2. **Federal Register — a real connector** (`connectors/federal_register_connector.ts` + `run_federal_register.ts`).
   Normalizes rule/notice **headers** → `public_fact`; surfaces each as a `regulation` candidate; draws NO
   regulatory conclusion. Real reject path (blank document_number/title).
3. **Second live surface — connector candidates → the Object Registry (propose-only)**:
   - `core/registry/candidate_bridge.ts` — GENERIC core seam mapping a connector `EntityCandidate` →
     `CanonicalObjectInput` (plane/visibility FROM the injected source scope; no vertical noun).
   - `cartridges/cooperative_markets/run_registry_candidates.ts` — runs SEC EDGAR (public filing) + startup
     intake (private submission) through the runtime, bridges the surfaced candidates into the registry, and
     the matured resolver **PROPOSES the 3 cross-source duplicates** (Halcyon/Meridian/Cobalt, differing legal
     names) for HUMAN review. Never auto-merges; no-clobber holds.
4. **Catalog 57→73** (`core/registry/data/connectors.json`) — 16 real public source/connector pairs toward
   the ~93 (closed graph, one-connector-per-source, honest authority→tier mappings). FDIC output key corrected
   to `financial_institution`.
5. **Tests + gate**: `tests/{fdic_bankfind_connector,federal_register_connector,candidate_bridge}.test.mjs`
   (+18, → **290**); the debug-loop CONNECTOR step gained FDIC · Federal Register · connector-candidates→registry
   propose-only · catalog-73 · plane/visibility-from-source assertions.

## Adversarial verification (4-lens fleet + focused re-verify)
- **1 MAJOR fixed (blocker):** a previously-seen record failing validation on a valid key was fabricated as a
  DELETION across ALL real connectors (rejection ref unrecoverable → `alsoPresentRefs` guard defeated). Fixed
  by tagging acquired records with a generic `external_ref` change-key (`withRef`) on FDIC, Federal Register,
  and SEC EDGAR; regression tests with TEETH on all three (removing `withRef` now fails the test).
- **1 minor fixed:** vacuous reconciliation flag → store-round-trip teeth.
- **test-teeth hardening:** object_class literals (not self-comparison); plane/visibility-from-source proof
  (EDGAR `public` vs intake `network`).

## Gate (all green in the cloud)
- `node scripts/debug-loop.mjs` → **ALL GREEN 13/13**
- `npx tsc --noEmit` → clean
- `npm run build` → exit 0 (all Terminal surfaces prerender)
- `npm test` → **290 pass, 0 fail**

## Changed / new files
- NEW: `cartridges/cooperative_markets/connectors/fdic_bankfind_connector.ts`,
  `cartridges/cooperative_markets/connectors/federal_register_connector.ts`,
  `cartridges/cooperative_markets/run_fdic_bankfind.ts`,
  `cartridges/cooperative_markets/run_federal_register.ts`,
  `cartridges/cooperative_markets/run_registry_candidates.ts`,
  `core/registry/candidate_bridge.ts`,
  `tests/fdic_bankfind_connector.test.mjs`, `tests/federal_register_connector.test.mjs`,
  `tests/candidate_bridge.test.mjs`
- EDITED: `core/registry/data/connectors.json` (57→73 + FDIC key fix),
  `scripts/debug-loop.mjs` (Wave 3 CONNECTOR assertions),
  `cartridges/cooperative_markets/connectors/sec_edgar_connector.ts` (withRef deletion-guard fix),
  docs (`BUILD_PROGRESS.md`, `CURRENT_STATE.md`, `ACTIVE_BUILD.md`, `DEBUG_LOG.md`, `HANDOFF.md`),
  `SPRINT_III_WAVE4_KICKOFF_PROMPT.md` (new)

## IMPORTANT — this wave includes Wave 2's uncommitted work too
The repo HEAD on `main` was still the **Sprint III Wave 1** commit; Wave 2 was staged in
`_wave2_sprint3_incoming.tgz` but never extracted/committed. This session applied Wave 2 first, then built
Wave 3 on top. The staging tarball for this handback therefore contains **Wave 2 + Wave 3** — one commit brings
both onto `main`.

## State / invariants preserved
- Migrations 0001–0017 applied; 0018 written + additive (Bryan-only apply). Default in-memory + creds-free.
- Connectors NORMALIZE only; tier/plane FROM the source manifest; no regulated conclusion in weights; human
  gates (ICApproval + EditorialDisposition) untouched; propose-only registry (no auto-merge).

## Bryan-only (route around, do not block)
git push · apply 0018 · a REAL bulk 5300 feed · the investment-vehicle decision · VC/Alloya legal.

## NEXT COMMAND
See the exact `tar xzf` + commit/push command handed back in chat. Next chat: paste
`SPRINT_III_WAVE4_KICKOFF_PROMPT.md`.
