// core/kernel/observability.ts
//
// Dispatch OS — Kernel Volume II, Observability projections.
//
// A PURE, GENERIC projection library over the two kernel spines: the append-only
// event log (RFC-2004, {@link KernelEvent}) and the append-only cost ledger
// (RFC-2008, {@link CostEntry}). Where the EventBus/CostLedger are the live,
// mutating aggregators, this module is their read-side: a set of stateless,
// deterministic functions that fold plain arrays of events/entries into the
// view-models a dashboard or Terminal surface renders. It holds no state, opens
// no connection, and takes plain arrays (not the class instances) on purpose —
// so it stays decoupled from the bus/ledger and is trivially testable with
// fixtures.
//
// TRUTH + DETERMINISM DISCIPLINE (CLAUDE.md / DOCTRINE / RFC-2004 / RFC-2008),
// load-bearing here:
//   * No wall-clock, no randomness, no I/O. Every timestamp/id is already carried
//     on the caller's events/entries; these functions only read, fold, sort, and
//     round. The SAME input arrays always produce a byte-identical projection, so
//     a rendered dashboard is as replayable as the log it reads.
//   * GENERIC / cartridge-blind. This is kernel infrastructure: it names no
//     vertical concept (no deal, no institution, no 5300). Meaning attaches only
//     through the caller's `type`, `label`, `category`, and correlation data —
//     never through a noun introduced here.
//   * Every derived money figure is clamped/rounded deterministically (bankers'
//     inputs are floats; we round to a fixed 4-dp scale before summing is exposed)
//     and every sort has a STABLE, total tie-break so ordering never depends on
//     input insertion order beyond what we intend to preserve (the event timeline
//     alone preserves log order — it is the replay projection).
//
// isolatedModules-friendly: type-only imports use `import type`; ES2022; "@/*".

import type { KernelEvent } from "@/core/kernel/event_bus";
import type { CostEntry, CostCategory } from "@/core/kernel/cost_ledger";
import type { Plane } from "@/core/truth/types";

// ---------------------------------------------------------------------------
// Deterministic money rounding
// ---------------------------------------------------------------------------

/** Fixed 4-decimal scale — matches the pipeline's `round4` so ledger totals and
 *  dashboard totals agree to the cent-fraction, deterministically. */
const MONEY_SCALE = 10000;

/** Round a dollar figure to a fixed 4-dp scale. Deterministic, no float drift
 *  beyond IEEE-754 (same input → same output). */
function round4(n: number): number {
  return Math.round(n * MONEY_SCALE) / MONEY_SCALE;
}

// ---------------------------------------------------------------------------
// Cost dashboard — the fold over the cost ledger
// ---------------------------------------------------------------------------

/** One correlation id's rolled-up spend. */
export interface CorrelationCost {
  correlation_id: string;
  usd: number;
  count: number;
}

/** One label's (i.e. one stage/operation's) rolled-up spend. */
export interface LabelCost {
  label: string;
  usd: number;
  count: number;
}

/**
 * The full cost-side projection: the grand total, the per-category split (every
 * {@link CostCategory} key present, 0 when unused, so consumers can index without
 * a presence check), the per-correlation roll-up, the per-label roll-up, and the
 * raw entry count. All money rounded to 4 dp; all lists sorted by usd DESC with a
 * stable key-ASC tie-break.
 */
export interface CostDashboard {
  total_usd: number;
  by_category: Record<CostCategory, number>;
  by_correlation: CorrelationCost[];
  by_label: LabelCost[];
  entry_count: number;
}

/** The zeroed category map — every category key present (parity with CostLedger). */
function emptyByCategory(): Record<CostCategory, number> {
  return { model: 0, human: 0, tool: 0, storage: 0, connector: 0 };
}

/** Stable comparator: usd DESC, then key ASC (total order → deterministic). */
function byUsdThenKey<T extends { usd: number }>(
  keyOf: (t: T) => string,
): (a: T, b: T) => number {
  return (a, b) => {
    if (b.usd !== a.usd) return b.usd - a.usd;
    const ka = keyOf(a);
    const kb = keyOf(b);
    return ka < kb ? -1 : ka > kb ? 1 : 0;
  };
}

/**
 * Fold a flat list of cost entries into a {@link CostDashboard}. Pure and
 * deterministic: the same entries (in any order) yield the same totals and the
 * same stably-sorted breakdowns. Entries with no `label` are bucketed under
 * "(unlabeled)" so every dollar is accounted for.
 */
export function costDashboard(entries: CostEntry[]): CostDashboard {
  const by_category = emptyByCategory();
  const correlations = new Map<string, { usd: number; count: number }>();
  const labels = new Map<string, { usd: number; count: number }>();
  let total = 0;

  for (const e of entries) {
    const usd = e.usd;
    total += usd;
    by_category[e.category] += usd;

    const cKey = e.correlation_id;
    const c = correlations.get(cKey);
    if (c) {
      c.usd += usd;
      c.count += 1;
    } else {
      correlations.set(cKey, { usd, count: 1 });
    }

    const lKey = e.label ?? "(unlabeled)";
    const l = labels.get(lKey);
    if (l) {
      l.usd += usd;
      l.count += 1;
    } else {
      labels.set(lKey, { usd, count: 1 });
    }
  }

  // Round the category map deterministically.
  for (const k of Object.keys(by_category) as CostCategory[]) {
    by_category[k] = round4(by_category[k]);
  }

  const by_correlation: CorrelationCost[] = [...correlations.entries()]
    .map(([correlation_id, v]) => ({ correlation_id, usd: round4(v.usd), count: v.count }))
    .sort(byUsdThenKey((t) => t.correlation_id));

  const by_label: LabelCost[] = [...labels.entries()]
    .map(([label, v]) => ({ label, usd: round4(v.usd), count: v.count }))
    .sort(byUsdThenKey((t) => t.label));

  return {
    total_usd: round4(total),
    by_category,
    by_correlation,
    by_label,
    entry_count: entries.length,
  };
}

// ---------------------------------------------------------------------------
// Event timeline — the ordered replay projection
// ---------------------------------------------------------------------------

/** One row of the ordered event timeline. `seq` is the log position (0-based). */
export interface TimelineEntry {
  seq: number;
  id: string;
  type: string;
  actor: string;
  plane: Plane | null;
  occurred_at: string;
  correlation_id: string;
}

/**
 * Project the event log into an ordered timeline. This is the REPLAY projection:
 * it preserves log order EXACTLY (it does not sort by `occurred_at`, because the
 * kernel's truth is causal append-order, and many events in a deterministic run
 * legitimately share one injected timestamp). `seq` is the append index; `plane`
 * is normalized to `null` when absent so the row shape is total.
 */
export function eventTimeline(events: KernelEvent[]): TimelineEntry[] {
  return events.map((e, seq) => ({
    seq,
    id: e.id,
    type: e.type,
    actor: e.actor,
    plane: e.plane ?? null,
    occurred_at: e.occurred_at,
    correlation_id: e.correlation_id,
  }));
}

/**
 * Mirror {@link EventBus.replay} semantics over a plain array: return the slice
 * of `events` AFTER the event whose id is `fromEventId` (exclusive), optionally
 * narrowed to a single `type`. When `fromEventId` is omitted the whole array is
 * considered; when it is not found, an empty array is returned (nothing is known
 * to come "after" an id that isn't in the log). Order is preserved.
 */
export function replayFrom(
  events: KernelEvent[],
  fromEventId?: string,
  type?: string,
): KernelEvent[] {
  let slice: KernelEvent[];
  if (fromEventId === undefined) {
    slice = events.slice();
  } else {
    const idx = events.findIndex((e) => e.id === fromEventId);
    slice = idx === -1 ? [] : events.slice(idx + 1);
  }
  return type === undefined ? slice : slice.filter((e) => e.type === type);
}

// ---------------------------------------------------------------------------
// Run health — a small generic roll-up over events + cost
// ---------------------------------------------------------------------------

/**
 * A generic health/observability roll-up over a set of correlated events and
 * cost entries. Everything here is derivable from the two arrays alone — no
 * vertical noun, no domain judgement. `human_gate_usd` is simply the spend whose
 * category is `human` (the cheapest-sufficient-intelligence ladder costs a human
 * rung in dollars); a caller attaches meaning, this only counts.
 */
export interface RunHealth {
  event_count: number;
  distinct_correlations: number;
  distinct_event_types: number;
  distinct_actors: number;
  /** Count of events whose type suggests a halt/decline/anomaly (see below). */
  anomaly_count: number;
  total_usd: number;
  /** Spend recorded under the `human` category — the human-review rung. */
  human_gate_usd: number;
}

/**
 * Event-type fragments that, by convention, mark a run NOT completing cleanly:
 * a halt, a decline, a block, or a dead-letter/error/anomaly. Matched as a
 * case-insensitive substring so it stays generic across cartridges (which own
 * their own `type` strings) without hard-coding any one vertical's event names.
 */
const ANOMALY_MARKERS = ["halt", "declin", "block", "dead", "error", "anomal", "fail"];

function isAnomalyType(type: string): boolean {
  const t = type.toLowerCase();
  return ANOMALY_MARKERS.some((m) => t.includes(m));
}

/**
 * Roll up event + cost health for a run (or any correlated set). Deterministic:
 * distinct-counts are set cardinalities; the anomaly count is a pure predicate
 * over event types; the money figures are rounded to 4 dp. Pass the already
 * -correlated arrays (e.g. `run.events` + `run.cost.entries`) — this function
 * does not itself filter by correlation id (compose with {@link replayFrom} or a
 * pre-filter when you need a subset).
 */
export function runHealth(events: KernelEvent[], entries: CostEntry[]): RunHealth {
  const correlations = new Set<string>();
  const types = new Set<string>();
  const actors = new Set<string>();
  let anomalies = 0;

  for (const e of events) {
    correlations.add(e.correlation_id);
    types.add(e.type);
    actors.add(e.actor);
    if (isAnomalyType(e.type)) anomalies += 1;
  }

  let total = 0;
  let human = 0;
  for (const c of entries) {
    total += c.usd;
    if (c.category === "human") human += c.usd;
  }

  return {
    event_count: events.length,
    distinct_correlations: correlations.size,
    distinct_event_types: types.size,
    distinct_actors: actors.size,
    anomaly_count: anomalies,
    total_usd: round4(total),
    human_gate_usd: round4(human),
  };
}
