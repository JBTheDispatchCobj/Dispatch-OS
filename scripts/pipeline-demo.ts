// scripts/pipeline-demo.ts
//
// Golden-path demo for the Cooperative Markets ORCHESTRATION SPINE (Wave 1).
// Runs Halcyon Pay × Summit Ridge FCU end-to-end and prints the whole run:
//
//   ingest(5300) → score → IC memo → allocate → settle → assembleIO
//     → renderVariants → buildFeed
//
// showing the kernel events emitted, the cost ledger roll-up, the harness route
// per stage (deterministic rung 1 vs the human-gated memo), and the ranked,
// lensed feed. Deterministic — same input, same output, every run.
//
//   node scripts/pipeline-demo.ts
//
// (Runs on plain Node via native TS type-stripping; `alias-hook.mjs` resolves the
//  "@/*" alias at runtime. No build step.)

import { register } from "node:module";
register("./alias-hook.mjs", import.meta.url);

const { runDealPipeline, variantsRestateIO } = await import("@/cartridges/cooperative_markets/pipeline");
const { halcyonSummitRun, unapprovedRun } = await import("@/cartridges/cooperative_markets/pipeline_fixtures");

const { input, ctx } = halcyonSummitRun();
const run = runDealPipeline(input, ctx);

const money = (n: number) => `$${Math.round(n).toLocaleString()}`;
const bar = (s: string) => console.log(`\n${"─".repeat(4)} ${s} ${"─".repeat(Math.max(0, 60 - s.length))}`);

console.log(`\n═══ Cooperative Markets — Deal Pipeline (run ${run.run_id}) ═══`);
console.log(`${run.company}  ×  ${run.institution}      status: ${run.status.toUpperCase()}`);

bar("STAGES  (harness route per stage)");
for (const r of run.routes) {
  const gate = r.decision.escalate_to_human ? "  ⟶ HUMAN GATE" : "";
  console.log(`  ${r.stage.padEnd(9)} ${r.task_kind.padEnd(20)} rung ${r.decision.ladder_position} ${r.decision.rung.padEnd(20)}${gate}`);
}

bar("1) INGEST — sourced 5300 facts");
console.log(`  ${run.facts.institution} (charter ${run.facts.charter_number}, ${run.facts.period})`);
console.log(`  net worth ${run.facts.net_worth_ratio.toFixed(1)}%  ·  ROA ${run.facts.roa.toFixed(2)}%  ·  loan/share ${run.facts.loan_to_share.toFixed(0)}%  ·  delinquency ${run.facts.delinquency_ratio.toFixed(2)}%  ·  member growth ${run.facts.member_growth.toFixed(1)}%`);
console.log(`  source: ${run.facts.source_ref}`);

bar("2) SCORE — P1 scorecard (sourced inferences)");
for (const s of Object.values(run.scorecard.scores)) {
  console.log(`  ${s.label.padEnd(34)} ${String(s.value).padStart(5)}/100   conf ${s.confidence.toFixed(2)}   (${s.lineage.length} sources)`);
}
console.log(`  recommendation: ${run.scorecard.recommendation.toUpperCase()}`);

bar("3) IC MEMO — P2 (draft = a proposal; human-gated)");
console.log(`  recommendation: ${run.memo.recommendation.replace(/_/g, " ").toUpperCase()}   ·   status: ${run.memo.status}`);
console.log(`  coverage ${run.memo.coverage.covered.length}/${run.memo.coverage.required.length} required  ·  risks ${run.memo.risks.length}  ·  approved citations ${run.memo.citation_map.length}  ·  excluded (unapproved) ${run.memo.excluded_unapproved.length}`);
if (run.memo.conditions.length) run.memo.conditions.forEach((c) => console.log(`    condition: ${c}`));

bar("HUMAN GATE — regulated conclusion may not self-advance");
const memoRoute = run.routes.find((r) => r.stage === "memo");
console.log(`  router: escalate_to_human = ${memoRoute?.decision.escalate_to_human}  (rung ${memoRoute?.decision.ladder_position} ${memoRoute?.decision.rung})`);
console.log(`  approval: ${run.approval ? `${run.approval.disposition} by ${run.approval.by} (decision ${run.approval.decision_ref})` : "none"}`);
const held = runDealPipeline(unapprovedRun().input, unapprovedRun().ctx);
console.log(`  same deal WITHOUT approval → status: ${held.status.toUpperCase()}  ·  allocation ${held.allocation ? "yes" : "none"}  ·  settlement ${held.settlement ? "yes" : "none"}  ·  published ${held.io ? "yes" : "none"}`);
console.log(`  ⟶ the gate has teeth: nothing allocates, settles, or publishes until a human disposes of the memo.`);

if (run.allocation) {
  bar("4) ALLOCATE — P3 (eligibility gates, pro-rata)");
  console.log(`  allocated ${money(run.allocation.allocated_usd)} / ${money(run.allocation.capacity_usd)}  ·  qualified matches ${run.allocation.deal_flow_access.qualified_matches}`);
  for (const a of run.allocation.allocations) console.log(`    ✓ ${a.subscriber.padEnd(24)} ${a.kind.padEnd(13)} ${money(a.allocated_usd).padStart(10)}${a.scaled ? "  (scaled)" : ""}`);
  for (const rj of run.allocation.rejected) console.log(`    ✗ ${rj.subscriber.padEnd(24)} ${" ".repeat(13)} ${rj.reasons.join(", ")}`);
}

if (run.settlement) {
  bar("5) SETTLE — P4 (vehicle-agnostic)");
  console.log(`  mode ${run.settlement.mode}  ·  status ${run.settlement.status}  ·  committed ${money(run.settlement.committed_usd)}  ·  called ${money(run.settlement.called_usd)}  ·  distributed ${money(run.settlement.distributed_usd)}`);
  console.log(`  admin: ${run.settlement.admin_connector}`);
}

if (run.io) {
  bar("6-8) PUBLISH — IO → variants → feed");
  console.log(`  IO ${run.io.id}  ·  tier ${run.io.top_tier}  ·  relevance ${run.io.relevance?.score}  ·  evidence ${run.io.relevance?.evidence_count}`);
  console.log(`  variants: ${run.variants.length}   ·   truth-discipline (variant refs == IO refs): ${variantsRestateIO(run.io, run.variants) ? "OK" : "VIOLATED"}`);
  console.log(`  feed for role "${ctx.feedRole}" (${run.feed.length}):`);
  for (const v of run.feed) console.log(`    • [${v.lens_type}${v.lens_ref ? `:${v.lens_ref}` : ""}] ${v.title}`);
}

bar("KERNEL SPINE — events + cost");
console.log(`  events (correlated to ${run.run_id}): ${run.events.length}`);
for (const e of run.events) console.log(`    · ${e.type.padEnd(20)} [${e.plane}]`);
console.log(`  cost total ${money(run.cost.total_usd * 100) === "$0" ? `$${run.cost.total_usd.toFixed(4)}` : `$${run.cost.total_usd.toFixed(4)}`}  across ${run.cost.entries.length} entries`);
const byCat = run.cost.by_category;
console.log(`    by category:  model $${byCat.model.toFixed(3)}  ·  human $${byCat.human.toFixed(2)}  ·  tool $${byCat.tool.toFixed(4)}  ·  connector $${byCat.connector.toFixed(3)}`);

console.log(`\n═══ deterministic · additive · vehicle-agnostic · no regulated conclusion in weights ═══\n`);
