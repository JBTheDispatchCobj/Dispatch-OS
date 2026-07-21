# Session Handoff — OLYMPIC SPRINT WAVE 2 (Terminal UI, live over the pipeline)

## Where we are
Platform build **~28%** (up from ~26%). Waves 1 **and** 2 of the Olympic Sprint are **DONE**. The
first product vertical runs end-to-end (Wave 1 spine) **and now has a real UI**: `/terminal` renders
the live `runDealPipeline` output as a product surface. Gate is green on all three checks:
`npm run build` (exit 0, `/terminal` prerenders), full-app `tsc --noEmit` clean, and
`node scripts/debug-loop.mjs` **ALL GREEN (5/5)**.

## Completed this session
**Wave 1 — Orchestration spine** (committed + pushed earlier: `6ac6be5..1233d04`): `pipeline.ts`
chains ingest→score→IC memo→[human gate]→allocate→settle→assembleIO→renderVariants→buildFeed into a
deterministic `DealRun`; kernel events + cost ledger + harness routing; real human gate; fixtures +
runnable demo + `@/` alias hook; debug-loop PIPELINE step.

**Wave 2 — Terminal UI** (this commit):
- **`app/terminal/page.tsx`** (server) — runs `runDealPipeline(halcyonSummitRun())`, precomputes the
  per-role feeds via `buildFeed`, and shapes a serializable view-model.
- **`components/terminal/TerminalView.tsx`** (client) — the product surface: run header + status +
  approval line; harness **stage rail** with the IC-memo **human gate flagged**; **institution
  scorecard** (5300 facts) + **deal scorecard** (P1 bars); **opportunity feed** with a working
  **CEO/CRO/CFO lens toggle** over `buildFeed` + the role-lensed memo summary; **IC memo** (P2);
  **allocation** (P3, capacity bar + gated rejections); **settlement/monitoring** (P4 + published IO
  tier); **kernel spine** (events + cost by category). Self-contained VM types (no server module in
  the client bundle); reuses the app design tokens.
- **`app/layout.tsx`** — one-line `Terminal` nav link (lead-owned index edit).
- **`docs/00_governance/OLYMPIC_SPRINT_ROADMAP.md`** — the wave-by-wave 26%→~100% roadmap.

## Validation
- **`npm run build` → exit 0**; `/terminal` prerenders static (○). Full-app **`tsc --noEmit` → 0 errors**.
- **`node scripts/debug-loop.mjs` → ALL GREEN (5/5)** (unchanged by Wave 2 — additive).
- Screenshot captured of the rendered Halcyon × Summit run: SETTLED, lens toggle working, human gate
  visible, nothing regulated shown without lineage.

## State of the world
- **GitHub:** Wave 1 pushed (`1233d04`); **Wave 2 push pending** (command below). **Supabase:**
  `0011`–`0015` applied; **`0016`+`0017` still pending apply** (Bryan-only; gates Wave 3's Object
  Registry service + persistence, not the ingestion path).
- The Terminal reads the golden fixture server-side (no persistence yet) — live NCUA data is Wave 3.

## Next: WAVE 3 — Live data + kernel/truth services
- **Live NCUA ingestion** — wire `cartridges/cooperative_markets/ingest_call_report.ts` to the real
  5300 data in `docs/04_sources/ncua/` at scale (batch → institution profiles). **Proceeds now.**
- **Profile assembly (RFC-3012)** using the confidence engine (`core/truth/confidence.ts`) —
  institution/company profiles from sourced facts. Proceeds now.
- **Object Registry service (RFC-2003) + entity resolution + persistence** — **gated on Bryan
  applying `0016`+`0017`**; build behind the seam, wire after the apply (route around, don't block).
- Gate: debug-loop green + a data-integrity check (profiles reconcile to source). Then Wave 4
  (Auric distribution + tests/CI/observability).

## Bryan-only (route around; don't block the sprint)
- **Decide the investment vehicle** (fund / per-deal SPV / both) — unblocks P4 fund/spv settlement.
- **Apply `0016` + `0017` in Supabase** — unblocks the Object Registry service + persistence (Wave 3).
- `git push`; VC/Alloya legal + entity.

## Exact next command (Bryan, Mac terminal)
```
cd ~/Downloads/Dispatch_OS_Cooperative_Markets_Repo && git add -A && git commit -m "Olympic Sprint Wave 2: real Terminal UI at /terminal — app/terminal/page.tsx (server: runs the pipeline, shapes a view-model) + components/terminal/TerminalView.tsx (client: harness rail with the human gate, institution+deal scorecards, CEO/CRO/CFO lens toggle over buildFeed, IC memo, allocation, settlement, kernel spine); Terminal nav link; wave-by-wave roadmap doc. npm run build exit 0 (/terminal prerenders); tsc clean; debug-loop ALL GREEN (5/5)." && git push
```

## To resume in a fresh chat (Wave 3)
Paste the block in **`WAVE_3_KICKOFF_PROMPT.md`** as the first message of the new chat. It orients
the next session on the operating contract, sets the checkpoint + context-budget discipline
(checkpoint every wave; stop at ~80% context and hand off; never sprint waves without checkpoints),
and scopes Wave 3 (live NCUA data + profile assembly now; Object Registry service + persistence
after Bryan applies 0016+0017).

## Note on committing (read before expecting a push)
The Dispatch cloud sandbox cannot `git commit`/`git push` — its git VM blocks `.git` writes
(permission) and has no identity. Wave 2's files are written to disk and **staged**; run the git
command above yourself in your Mac terminal. Always `git status` first to confirm no lost updates.
