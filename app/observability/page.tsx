// app/observability/page.tsx
//
// Olympic Sprint — Wave 4. The "Observability" surface (Vol II / Vol VII): the
// read-side of the kernel spine. This SERVER component runs the Wave-1
// orchestration spine (`runDealPipeline`) on the Halcyon × Summit golden fixture,
// then folds the run's REAL kernel outputs — the cost ledger entries
// (`run.cost.entries`) and the correlated event log (`run.events`) — through the
// PURE `core/kernel/observability` projections (costDashboard / eventTimeline /
// runHealth). The resulting serializable `ObservabilityVM` is handed to the client
// `ObservabilityView`, which does the rendering + the event-type filter toggle.
//
// Determinism: the pipeline is pure and the page uses a FIXED `generatedAt` stamp
// (no clock), so this surface prerenders statically and reproducibly — the same
// deterministic property the observability projection itself guarantees.
//
// The observability module is GENERIC kernel infra (no vertical noun); meaning
// attaches here through the caller's run data, exactly as the contract requires.

import { runDealPipeline } from "@/cartridges/cooperative_markets/pipeline";
import { halcyonSummitRun } from "@/cartridges/cooperative_markets/pipeline_fixtures";
import {
  costDashboard,
  eventTimeline,
  runHealth,
} from "@/core/kernel/observability";
import {
  ObservabilityView,
  type ObservabilityVM,
} from "@/components/terminal/ObservabilityView";

export const metadata = {
  title: "Cooperative Markets — Observability",
  description:
    "The read-side of the kernel spine: a run's cost ledger and correlated event log, folded by the pure observability projection.",
};

// Deterministic stamp (no clock — keeps the prerender reproducible).
const GENERATED_AT = "2026-07-21T17:00:00.000Z";

export default function ObservabilityPage() {
  const { input, ctx } = halcyonSummitRun();
  const run = runDealPipeline(input, ctx);

  // Fold the run's real kernel outputs through the pure projections.
  const dashboard = costDashboard(run.cost.entries);
  const timeline = eventTimeline(run.events);
  const health = runHealth(run.events, run.cost.entries);

  const vm: ObservabilityVM = {
    generatedAt: GENERATED_AT,
    runId: run.run_id,
    correlationId: run.run_id, // the pipeline correlates every event by the run id
    health: {
      event_count: health.event_count,
      distinct_correlations: health.distinct_correlations,
      distinct_event_types: health.distinct_event_types,
      distinct_actors: health.distinct_actors,
      anomaly_count: health.anomaly_count,
      total_usd: health.total_usd,
      human_gate_usd: health.human_gate_usd,
    },
    cost: {
      total_usd: dashboard.total_usd,
      entry_count: dashboard.entry_count,
      // Category map → an ordered, non-zero-first array for the bar chart. Every
      // category with spend is shown; keep zeros out so the chart reads cleanly.
      byCategory: (Object.entries(dashboard.by_category) as [string, number][])
        .filter(([, usd]) => usd > 0)
        .map(([category, usd]) => ({ category, usd }))
        .sort((a, b) => b.usd - a.usd || (a.category < b.category ? -1 : 1)),
      byLabel: dashboard.by_label.map((l) => ({ label: l.label, usd: l.usd, count: l.count })),
    },
    timeline: timeline.map((t) => ({
      seq: t.seq,
      id: t.id,
      type: t.type,
      actor: t.actor,
      plane: t.plane,
      occurred_at: t.occurred_at,
      correlation_id: t.correlation_id,
    })),
  };

  return <ObservabilityView vm={vm} />;
}
