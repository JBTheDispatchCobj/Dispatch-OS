# Session Handoff — OLYMPIC SPRINT WAVE 3 (live data + kernel/truth services)

## Where we are
Platform build **~33%** (up from ~28%). Waves 1, 2 **and** 3 of the Olympic Sprint are **DONE**. The
Cooperative Markets vertical now runs **on real data at scale** and has its first kernel/truth services.
Gate is green on all three checks: `npm run build` (exit 0, `/market` **and** `/terminal` prerender),
full-app `tsc --noEmit` clean, and `node scripts/debug-loop.mjs` **ALL GREEN (6/6)**.

## The reality-check that shaped Wave 3 (read this)
The kickoff said to wire `ingest_call_report` to "the real 5300 data in `docs/04_sources/ncua/`." That
folder actually holds real NCUA **regulatory** data — **675 in-force 12 CFR sections + 10 pending
amendments + the FCU Act** — **not** institution-level 5300 financials (which are nowhere in the repo).
Per truth discipline I did **not** fabricate CU financials or fetch external data. So "live NCUA data at
scale" was executed honestly as **real regulatory ingestion at scale**, and the institution 5300 path runs
on a **clearly-labeled fixture batch** with the real per-CU connector deferred (a Sprint-III / Bryan-only task).

## Completed this session (Wave 3) — all NEW files except two lead-owned edits
- **`cartridges/cooperative_markets/ingest_regulations.ts`** + **`ingest_regulations_data.ts`** — pure/
  deterministic batch ingestion of the REAL corpus into sourced, **bi-temporal** truth objects: in-force
  sections → `Observation`/`public_fact`/`valid_from`=2026-07-15; pending amendments **with full text** →
  future-dated `Observation` (flagged not-yet-in-force); amendatory **instructions** (no rewrite) → `Claim`
  **held pending human/deterministic merge** (never auto-applied to legal text). Loader split so the pure
  module stays importable under bare Node.
- **`core/profile/assemble.ts`** — Profile Assembly Engine (RFC-3012): generic, pure, core (no vertical
  nouns); rolls sourced fields up through `combineSources` (the confidence engine) → profile with
  confidence / top_tier / lineage / completeness / a data-quality health band.
- **`cartridges/cooperative_markets/ingest_batch.ts`** + **`batch_fixtures.ts`** — the 5300 batch path →
  facts (`deterministic_calculation`, each citing its filing) + an assembled institution profile each, over
  a labeled 7-CU illustrative fixture batch.
- **`core/registry/service.ts`** — Object Registry service (RFC-2003) + entity resolution (blocking keys →
  scored match candidates → append-only merge lineage) behind a `RegistryPersistencePort` seam with an
  in-memory adapter. Duplicates are **proposed, never auto-merged**. Gated on `0016`+`0017` for live persistence.
- **`app/market/page.tsx`** (server, wires the real ingestion + profiles + registry into a VM) +
  **`components/terminal/MarketView.tsx`** (client surface) — the **`/market`** Terminal surface: institution
  profile list + real regulatory environment + registry status.
- **`scripts/wave3-demo.ts`** — `node scripts/wave3-demo.ts` runs all three paths on the real data and prints a summary.
- **Lead-owned edits:** `app/layout.tsx` (one `Market` nav link); `scripts/debug-loop.mjs` (new **DATA-INTEGRITY** step).

## Validation
- **`node scripts/debug-loop.mjs` → ALL GREEN (6/6)**: TYPECHECK · ONTOLOGY · CARTRIDGE · ENGINE · PIPELINE ·
  **DATA** (regulatory 675 in-force + 2 pending + 8 held, bi-temporal + deterministic · 7 profiles reconcile to
  source via an independent ratio oracle · registry resolves+merges proposed→gated).
- **`npx tsc --noEmit` → 0 errors.**  **`npm run build` → exit 0**, `/market` prerenders static (○).
- **Adversarially verified by a 3-lens agent fleet** (truth discipline · resolver/purity/gate · integration/
  client-server). **No blockers.** The DATA gate was hardened in response (pinned source counts + an independent
  ratio oracle) so silent source-corpus shrinkage can no longer pass green. NON-BLOCKING items logged in `DEBUG_LOG.md`.

## State of the world
- **GitHub:** Wave 2 pushed (`a6073f3`); **Wave 3 push pending** (command below). **Supabase:** `0011`–`0015`
  applied; **`0016`+`0017` still pending apply** (Bryan-only) — gates the Object Registry service's *live
  persistence* + shared-market resolution + RLS, NOT the ingestion/profile/resolution logic, which runs in-memory now.
- Both Terminal surfaces read computed output server-side (no persistence yet) — persistence is post-`0016`/`0017`.

## Next: WAVE 4 — Auric distribution + hardening
Paste **`WAVE_4_KICKOFF_PROMPT.md`** as the first message of the new chat. Scope: channel variants
(brief / market-feed / terminal-feed) over the Auric engine + the editorial verification gate (human-approved
before publish); unit tests for the engines; wire `scripts/debug-loop.mjs` into CI as the gate; cost-ledger
dashboards + event replay; burn down `DEBUG_LOG` [DEFERRED]/[NON-BLOCKING] items.

## Bryan-only (route around; don't block the sprint)
- **Apply `0016` + `0017` in Supabase** — unblocks the Object Registry service's live persistence + shared-market
  resolution + RLS (Wave 3 built the service behind the seam; wiring is a short follow-up after the apply).
- **Decide the investment vehicle** (fund / per-deal SPV / both) — unblocks P4 fund/spv settlement.
- `git push`; VC/Alloya legal + entity.

## Exact next command (Bryan, Mac terminal)
The Dispatch cloud sandbox cannot `git commit`/`git push` (its git VM blocks `.git` writes and has no
identity). The Wave-3 files were written to your repo on disk. Run this in your Mac terminal (it first removes
the two staging tarballs the cloud session used to move files, then commits):
```
cd ~/Downloads/Dispatch_OS_Cooperative_Markets_Repo && rm -f .git/index.lock && rm -rf _to_delete && git status && git add -A && git commit -m "Olympic Sprint Wave 3: live data + kernel/truth services — real NCUA regulatory ingestion at scale (ingest_regulations.ts: 675 in-force 12 CFR sections + 10 pending amendments -> sourced bi-temporal public_fact truth objects; instructions held pending human merge), Profile Assembly Engine (core/profile/assemble.ts, RFC-3012) over the confidence engine, 5300 batch path -> assembled institution profiles (labeled fixture batch), Object Registry service (core/registry/service.ts, RFC-2003) + entity resolution behind the 0016/0017 seam, and a /market Terminal surface. Debug loop gains a DATA-INTEGRITY step (pinned source counts + independent ratio oracle + reconciliation). npm run build exit 0 (/market prerenders); tsc clean; debug-loop ALL GREEN (6/6)." && git push
```
Always `git status` first (the command above does) to confirm no lost updates before you commit.
