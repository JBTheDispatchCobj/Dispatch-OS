# HANDOFF — Olympic Sprint III, Wave 4 (2026-07-22)

**Build: ~59%** (honest recompute; was ~58% at Wave 3). This was an architecture/governance wave —
small build delta by design. Sprint III target ~68% still needs the real bulk 5300 feed, catalog
73→~93, and the Terminal surface.

## What shipped this wave — weave the external FS canon in as an operational layer
The `DISPATCH_AURIC_V1_MASTER_RELEASE_COMPLETE` package (11 FS sections FS-4000…FS-14000, 636
artifacts; content APPROVED, implementation NOT_ASSESSED, production NOT_APPROVED) is adopted as a
REFERENCE / operational canon — NOT a competing build spec — via a generic, deterministic seam.
Additive, new-files-only, no vertical noun in `core/`, connector runtime + engines UNCHANGED.

1. **`core/registry/canon.ts`** — reconciles incoming external identifiers to the repo's LIVE
   canonical ids. PROPOSE-ONLY + NO-CLOBBER (mirrors the entity resolver): unseen id proposed by
   deterministic token similarity (prefix-strip + Jaccard), never auto-merged; human-confirmed alias
   sticky. CLOSED-GRAPH validated (a `verify`-flagged alias's canonical must resolve to a live repo
   key; no incoming confirmed to two canonicals). AUTHORITY PRECEDENCE
   `live_code > confirmed_alias > fs_5100 > fs_8000 > fs_section > new_input` — resolves the canonical
   LABEL only. **Identity reconciled, authority not.**
2. **`core/registry/data/canon_aliases.json`** — config-as-data crosswalk grounded in the REAL
   FS-5100/FS-8000 files: `SRC-NCUA-CALL` / `SRC-FDIC-BANKFIND` / `SRC-SEC-EDGAR` confirmed +
   verify-checked to live connector sources; `OBJ.CREDITUNION` confirmed; `OBJ.INSTITUTION` left
   **proposed** on purpose (label ≠ semantic merge). Plus an FS-section → repo-module map.
3. **`docs/01_architecture/adr/ADR-0017-FS-V1-CANON-ADOPTION.md`** — the decision: reference/
   operational canon; identity-not-authority; precedence; repo-wave-order-leads; the guardrails from
   the design review (stricter in name-space; propose-only for authority/evidence contracts;
   per-domain stopword config is a living cost; identity resolution stays deterministic + human-
   confirmed, never in weights).
4. **`tests/canon.test.mjs`** (+7, → **297**) + a debug-loop **CANON** step (14/14).

## Adversarial self-review (findings fixed this wave)
- Stopword over-drop (a body word equal to a convention, e.g. "report", was dropped) → prefix-strip
  instead of global drop; default stopwords now empty.
- A vertical-namespace default (`["coop","markets"]`) in `core/` → pulled out, caller-injected
  (mirrors the resolver). `core/registry/canon.ts` names no vertical.

## Gate (all green in the cloud)
- `node scripts/debug-loop.mjs` → **ALL GREEN 14/14** (new CANON step)
- `npx tsc --noEmit` → clean · `npm run build` → exit 0 · `npm test` → **297 pass, 0 fail**

## New / changed files
- NEW: `core/registry/canon.ts`, `core/registry/data/canon_aliases.json`,
  `tests/canon.test.mjs`, `docs/01_architecture/adr/ADR-0017-FS-V1-CANON-ADOPTION.md`
- EDITED: `scripts/debug-loop.mjs` (CANON step), docs
  (`BUILD_PROGRESS.md`, `CURRENT_STATE.md`, `ACTIVE_BUILD.md`, `DEBUG_LOG.md`, `HANDOFF.md`),
  `SPRINT_III_WAVE5_KICKOFF_PROMPT.md` (new)

## The FS package (context for future waves)
It maps 1:1 onto repo layers (FS-5100↔`core/registry`, FS-6000↔`core/kernel`+`core/truth`,
FS-8000↔connector runtime/catalog, FS-9000↔registry/resolver, FS-10000↔Terminal, FS-11000↔harness).
Doctrine is aligned. Adopt per wave via the canon seam; **repo wave order leads.** Only a few
identifiers are crosswalked so far — the rest grow as inputs flow (propose → confirm → sticky).

## NEXT — the JOINT Terminal UI (Wave 5), with Bryan
Wave 5 is the co-built Terminal surface over the full-market institution profiles + the registry/
canon review queue (the propose-only cross-source duplicates + canon proposals awaiting human
review). I build the surface; Bryan steers look/feel/priority. Also: catalog 73→~93 and reconcile
more FS-5100 registries. See `SPRINT_III_WAVE5_KICKOFF_PROMPT.md`.

## Bryan-only (route around, don't block)
git push · apply 0018 · a REAL bulk 5300 feed · investment-vehicle decision · VC/Alloya legal.

## NEXT COMMAND
See the exact `tar xzf` + commit/push command in chat (glob-free — zsh-safe).
