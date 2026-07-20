// core/engine/roi.ts
//
// Outcome ↔ Metric ROI linkage (ROI_AND_IMPACT_MODEL §5 value hypothesis,
// §8 baseline/before-after, §9 estimation discipline, §12 impact dashboard).
//
// This engine connects the loop's VALUE end to real operating activity: given an
// Outcome and the history of the Metric it is linked to, it derives a value-vs-
// target view with a trend and an honest confidence level. It is industry-
// agnostic and pure — it reads only the generic Outcome + Metric primitives and
// returns plain data. Cartridges attach meaning solely by naming which metric an
// outcome tracks (Outcome.related_metric_names); the core never learns the
// vertical. Nothing here mutates or logs; the store persists, resolvers read.

import type { Metric, Outcome } from "@/core/types";

/** A single point in a metric's history (for a sparkline / before-after read). */
export interface RoiPoint {
  value: number;
  measured_at: string;
}

/** Direction of travel relative to the outcome's target. */
export type RoiTrend = "improving" | "worsening" | "flat" | "unknown";

/**
 * The computed value-vs-target view for one outcome. Every field is derived from
 * the outcome's own target/baseline and the linked metric's real history, so the
 * number can always be traced back to system activity (never a vanity figure).
 */
export interface OutcomeRoiView {
  /** The primary metric this outcome tracks, if any is linked. */
  metric_name: string | null;
  /** Latest measured value of the linked metric (or the manual actual_value). */
  current: number | null;
  /** Prior-period value, when history has ≥2 points. */
  previous: number | null;
  target: number | null;
  baseline: number | null;
  /** Signed gap: current − target. Sign read against `lower_is_better`. */
  delta: number | null;
  /** True once the outcome has reached or passed its target. */
  at_or_past_target: boolean;
  /** 0..1 progress from baseline → target (clamped). Undefined if not computable. */
  progress?: number;
  /** Direction of the latest move, relative to the target. */
  trend: RoiTrend;
  /** §9: observed (metric-derived) > estimated (assumptions) > hypothesized. */
  confidence: "observed" | "estimated" | "hypothesized";
  /** True when a smaller metric value is the better outcome. */
  lower_is_better: boolean;
  /** Full value series (ascending by time) for a sparkline / before-after view. */
  points: RoiPoint[];
}

const EPS = 1e-9;

/** Chronological metric history for one metric_name (ascending by measured_at). */
function sortedHistory(history: Metric[]): RoiPoint[] {
  return history
    .map((m) => ({ value: m.metric_value, measured_at: m.measured_at }))
    .sort((a, b) => (a.measured_at < b.measured_at ? -1 : a.measured_at > b.measured_at ? 1 : 0));
}

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}

/**
 * Compute the ROI view for a single outcome.
 *
 * @param outcome        the generic Outcome record
 * @param metricHistory  ALL metric rows whose metric_name === the outcome's
 *                       primary linked name (any order). Empty when the outcome
 *                       has no metric link or the metric hasn't been computed.
 */
export function computeOutcomeRoi(outcome: Outcome, metricHistory: Metric[]): OutcomeRoiView {
  const metric_name = outcome.related_metric_names?.[0] ?? null;
  const lower_is_better = outcome.lower_is_better ?? false;
  const points = metric_name ? sortedHistory(metricHistory) : [];

  // Current/previous: prefer the live metric series; fall back to the manual
  // actual_value when no metric is linked (so manual outcomes still render).
  const metricCurrent = points.length > 0 ? points[points.length - 1].value : null;
  const current = metricCurrent ?? outcome.actual_value ?? null;
  const previous = points.length >= 2 ? points[points.length - 2].value : null;

  const target = outcome.target_value ?? null;
  // Baseline: explicit > first historical point. Anchors before-after progress.
  const baseline =
    outcome.baseline_value ?? (points.length > 0 ? points[0].value : null);

  const delta = current !== null && target !== null ? current - target : null;
  const at_or_past_target =
    current !== null && target !== null
      ? lower_is_better
        ? current <= target
        : current >= target
      : false;

  // Progress from baseline → target (clamped). Needs all three and a non-zero
  // baseline→target span; otherwise undefined (the UI shows "—").
  let progress: number | undefined;
  if (current !== null && target !== null && baseline !== null) {
    const span = target - baseline;
    if (Math.abs(span) > EPS) {
      progress = clamp01((current - baseline) / span);
    } else {
      progress = at_or_past_target ? 1 : 0;
    }
  }

  // Trend: classify the latest move relative to the target direction.
  let trend: RoiTrend = "unknown";
  if (current !== null && previous !== null) {
    const move = current - previous;
    if (Math.abs(move) < EPS) trend = "flat";
    else if (lower_is_better) trend = move < 0 ? "improving" : "worsening";
    else trend = move > 0 ? "improving" : "worsening";
  }

  // Confidence (§9): explicit wins; else infer from how `current` was obtained.
  const confidence: OutcomeRoiView["confidence"] =
    outcome.confidence ??
    (metricCurrent !== null
      ? "observed"
      : outcome.actual_value !== null && outcome.actual_value !== undefined
        ? "estimated"
        : "hypothesized");

  return {
    metric_name,
    current,
    previous,
    target,
    baseline,
    delta,
    at_or_past_target,
    progress,
    trend,
    confidence,
    lower_is_better,
    points,
  };
}
