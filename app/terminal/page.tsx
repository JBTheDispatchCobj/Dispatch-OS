// app/terminal/page.tsx
//
// Olympic Sprint — Wave 2. The real Terminal product surface (Vol VII), replacing the
// static terminal_demo.html. This SERVER component runs the Wave-1 orchestration spine
// (`runDealPipeline`) on the Halcyon × Summit golden fixture, shapes a compact,
// serializable view-model, and hands it to the client Terminal for rendering + the
// executive-lens toggle. No persistence yet — the surface reads the pipeline output
// directly (live data is Wave 3).

import { runDealPipeline } from "@/cartridges/cooperative_markets/pipeline";
import { halcyonSummitRun } from "@/cartridges/cooperative_markets/pipeline_fixtures";
import { buildFeed, type FeedContext } from "@/core/auric/engine";
import type { LensRole } from "@/cartridges/cooperative_markets/ic_memo";
import { TerminalView, type TerminalVM, type FeedItem } from "@/components/terminal/TerminalView";

const ROLES: LensRole[] = ["ceo", "cro", "cfo"];

export const metadata = {
  title: "Cooperative Markets — Terminal",
  description: "The running deal pipeline, lensed for the executive reader.",
};

export default function TerminalPage() {
  const { input, ctx } = halcyonSummitRun();
  const run = runDealPipeline(input, ctx);

  // Precompute the ranked feed for each executive lens (buildFeed is pure) so the client
  // toggle is a pure selection — same ranking the pipeline uses, one per role.
  const feedsByRole: Record<string, FeedItem[]> = {};
  for (const role of ROLES) {
    const feedCtx: FeedContext = { role, institution: run.readiness.ref, nowIso: ctx.startedAt };
    feedsByRole[role] = buildFeed(run.variants, feedCtx).map((v) => ({
      title: v.title ?? "",
      lens_type: v.lens_type,
      lens_ref: v.lens_ref ?? null,
      channel: v.channel,
      body: v.body,
      source_refs: v.source_refs?.length ?? 0,
    }));
  }

  const vm: TerminalVM = {
    runId: run.run_id,
    company: run.company,
    institution: run.institution,
    status: run.status,
    facts: {
      institution: run.facts.institution,
      charter: run.facts.charter_number,
      period: run.facts.period,
      net_worth_ratio: run.facts.net_worth_ratio,
      roa: run.facts.roa,
      loan_to_share: run.facts.loan_to_share,
      delinquency_ratio: run.facts.delinquency_ratio,
      member_growth: run.facts.member_growth,
      source_ref: run.facts.source_ref,
    },
    scores: Object.values(run.scorecard.scores).map((s) => ({
      key: s.key,
      label: s.label,
      value: s.value,
      confidence: s.confidence,
      lineage: s.lineage.length,
    })),
    scorecardRecommendation: run.scorecard.recommendation,
    routes: run.routes.map((r) => ({
      stage: r.stage,
      task_kind: r.task_kind,
      rung: r.decision.rung,
      ladder_position: r.decision.ladder_position,
      escalate: r.decision.escalate_to_human,
    })),
    memo: {
      recommendation: run.memo.recommendation,
      status: run.memo.status,
      covered: run.memo.coverage.covered.length,
      required: run.memo.coverage.required.length,
      missing: run.memo.coverage.missing,
      risks: run.memo.risks.map((r) => ({ label: r.label, severity: r.severity })),
      conditions: run.memo.conditions,
      citations: run.memo.citation_map.length,
      excluded: run.memo.excluded_unapproved.length,
      lensSummaries: run.memo.lens_summaries,
    },
    approval: run.approval
      ? { disposition: run.approval.disposition, by: run.approval.by, decision_ref: run.approval.decision_ref }
      : null,
    allocation: run.allocation
      ? {
          allocated_usd: run.allocation.allocated_usd,
          capacity_usd: run.allocation.capacity_usd,
          qualified: run.allocation.deal_flow_access.qualified_matches,
          allocations: run.allocation.allocations.map((a) => ({
            subscriber: a.subscriber,
            kind: a.kind,
            allocated_usd: a.allocated_usd,
            scaled: a.scaled,
            vehicle: a.vehicle_object.split(":").pop() ?? a.vehicle_object,
          })),
          rejected: run.allocation.rejected.map((r) => ({ subscriber: r.subscriber, reasons: r.reasons })),
        }
      : null,
    settlement: run.settlement
      ? {
          mode: run.settlement.mode,
          status: run.settlement.status,
          committed_usd: run.settlement.committed_usd,
          called_usd: run.settlement.called_usd,
          distributed_usd: run.settlement.distributed_usd,
          admin_connector: run.settlement.admin_connector,
        }
      : null,
    io: run.io
      ? {
          id: run.io.id,
          top_tier: run.io.top_tier ?? null,
          relevance: typeof run.io.relevance?.score === "number" ? run.io.relevance.score : null,
          evidence_count: typeof run.io.relevance?.evidence_count === "number" ? run.io.relevance.evidence_count : 0,
          headline: run.io.headline,
        }
      : null,
    feedsByRole,
    cost: {
      total_usd: run.cost.total_usd,
      by_category: run.cost.by_category,
      entries: run.cost.entries.map((e) => ({ category: e.category, label: e.label ?? e.category, usd: e.usd })),
    },
    events: run.events.map((e) => ({ type: e.type, plane: e.plane ?? "—" })),
  };

  return <TerminalView vm={vm} />;
}
