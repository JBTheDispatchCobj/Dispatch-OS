// core/widgets/resolve.ts
//
// Per-type widget resolvers. Each turns a WidgetSpec + WidgetContext into a
// view-model payload by reading ONLY through the DataStore interface (the data
// boundary — WIDGET_SYSTEM_RULES never lets a widget reach past the store).
// Pure reads: nothing here mutates or logs events; widget ACTIONS happen in
// app/actions.ts later. Resolvers are cartridge-blind — they consume generic
// primitives and a few core label helpers, never a cartridge.

import type {
  EvidenceItem,
  Metric,
  WorkItem,
} from "@/core/types";
import { computeOutcomeRoi } from "@/core/engine/roi";
import type {
  ExceptionRow,
  InputInboxRow,
  MetricTileData,
  OutcomeRow,
  WidgetContext,
  WidgetState,
} from "@/core/widgets/types";

/** A resolver's output before the composer wraps it in a ResolvedWidget. */
export interface Resolution<T> {
  state: WidgetState;
  emptyMessage?: string;
  data: T;
}

const humanize = (s: string) => s.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());

// ---------------------------------------------------------------------------
// Metrics (§5.11)
// ---------------------------------------------------------------------------

/** Build a tile from a persisted Metric, surfacing target + auditable basis. */
function toTile(m: Metric, title?: string): MetricTileData {
  const md = (m.metadata ?? {}) as Record<string, unknown>;
  const target = typeof md.target === "number" ? md.target : undefined;
  const method = m.calculation_method;
  const unit: "percent" | "count" =
    method?.includes("%") || m.metric_name.endsWith("_rate") ? "percent" : "count";
  let vsTarget: MetricTileData["vsTarget"];
  if (target !== undefined) {
    vsTarget = m.metric_value > target ? "above" : m.metric_value < target ? "below" : "on";
  }
  return {
    metric_name: m.metric_name,
    label: title ?? humanize(m.metric_name),
    value: m.metric_value,
    unit,
    target,
    vsTarget,
    basis: md.basis as Record<string, unknown> | undefined,
    method,
    measured_at: m.measured_at,
  };
}

export function resolveMetricTile(ctx: WidgetContext, metricName?: string, title?: string): Resolution<MetricTileData | null> {
  if (!metricName) {
    return { state: "empty", emptyMessage: "No metric_name configured for this tile.", data: null };
  }
  const m = ctx.store.listLatestMetrics(ctx.workspaceId).find((x) => x.metric_name === metricName);
  if (!m) {
    return { state: "empty", emptyMessage: `Metric "${metricName}" not yet computed.`, data: null };
  }
  return { state: "ok", data: toTile(m, title) };
}

export function resolveMetricsPanel(ctx: WidgetContext): Resolution<MetricTileData[]> {
  const metrics = [...ctx.store.listLatestMetrics(ctx.workspaceId)].sort((a, b) => {
    const ta = a.metric_type ?? "";
    const tb = b.metric_type ?? "";
    return ta === tb ? a.metric_name.localeCompare(b.metric_name) : ta.localeCompare(tb);
  });
  if (metrics.length === 0) {
    return { state: "empty", emptyMessage: "No metrics computed yet — run recomputeMetrics.", data: [] };
  }
  return { state: "ok", data: metrics.map((m) => toTile(m)) };
}

// ---------------------------------------------------------------------------
// Work queue (§5.3) + a tiny generic filter parser
// ---------------------------------------------------------------------------

type Clause = (w: WorkItem) => boolean;

function fieldValue(w: WorkItem, field: string): string | undefined {
  switch (field) {
    case "status": return w.status;
    case "priority": return w.priority;
    case "kind": return w.kind;
    case "source": return w.source;
    default: return undefined;
  }
}

/** Parse one clause: `field=v`, `field!=v`, or `field in a|b|c`. */
function parseClause(raw: string): Clause | null {
  const inMatch = raw.split(/\s+in\s+/i);
  if (inMatch.length === 2) {
    const field = inMatch[0].trim();
    const set = new Set(inMatch[1].split("|").map((s) => s.trim()));
    return (w) => { const v = fieldValue(w, field); return v !== undefined && set.has(v); };
  }
  if (raw.includes("!=")) {
    const [field, val] = raw.split("!=").map((s) => s.trim());
    return (w) => fieldValue(w, field) !== val;
  }
  if (raw.includes("=")) {
    const [field, val] = raw.split("=").map((s) => s.trim());
    return (w) => fieldValue(w, field) === val;
  }
  return null;
}

/**
 * Build a predicate from a filter expression. Clauses are AND-joined with "&".
 * Supported fields: status, priority, kind, source. Unknown/empty -> match all.
 * Intentionally tiny: richer querying is a configuration concern for later.
 */
export function workItemFilter(expr?: string): Clause {
  if (!expr || !expr.trim()) return () => true;
  const preds = expr.split("&").map((c) => c.trim()).filter(Boolean).map(parseClause)
    .filter((p): p is Clause => p !== null);
  return (w) => preds.every((p) => p(w));
}

export function resolveWorkQueue(ctx: WidgetContext, filter?: string): Resolution<WorkItem[]> {
  const pred = workItemFilter(filter);
  const items = ctx.store.listWorkItems(ctx.workspaceId).filter(pred);
  if (items.length === 0) {
    return { state: "empty", emptyMessage: "No work items match this view.", data: [] };
  }
  return { state: "ok", data: items };
}

// ---------------------------------------------------------------------------
// Input inbox (§5.1): input -> source -> runs -> proposals
// ---------------------------------------------------------------------------

export function resolveInputInbox(ctx: WidgetContext): Resolution<InputInboxRow[]> {
  const inputs = ctx.store.listInputs(ctx.workspaceId);
  if (inputs.length === 0) {
    return { state: "empty", emptyMessage: "No inputs received yet.", data: [] };
  }
  const sources = ctx.store.listSources(ctx.workspaceId);
  const runs = ctx.store.listAgentRuns(ctx.workspaceId);
  const proposals = ctx.store.listProposals(ctx.workspaceId);

  const rows: InputInboxRow[] = inputs.map((input) => {
    const inputRuns = runs.filter((r) => r.source_input_id === input.id);
    const runIds = new Set(inputRuns.map((r) => r.id));
    const inputProposals = proposals.filter((p) => p.agent_run_id !== null && runIds.has(p.agent_run_id));
    return {
      input,
      source: input.source_id ? sources.find((s) => s.id === input.source_id) : undefined,
      runs: inputRuns,
      proposals: inputProposals,
    };
  });
  return { state: "ok", data: rows };
}

// ---------------------------------------------------------------------------
// Proposals / approvals / decisions / reports — direct store reads
// ---------------------------------------------------------------------------

export function resolveProposalQueue(ctx: WidgetContext) {
  const data = ctx.store.listProposals(ctx.workspaceId);
  return data.length === 0
    ? ({ state: "empty", emptyMessage: "No agent proposals.", data } as const)
    : ({ state: "ok", data } as const);
}

export function resolveApprovalQueue(ctx: WidgetContext) {
  const data = ctx.store.listApprovals(ctx.workspaceId);
  return data.length === 0
    ? ({ state: "empty", emptyMessage: "No approvals recorded.", data } as const)
    : ({ state: "ok", data } as const);
}

export function resolveDecisionTrail(ctx: WidgetContext) {
  const data = ctx.store.listDecisions(ctx.workspaceId);
  return data.length === 0
    ? ({ state: "empty", emptyMessage: "No decisions recorded.", data } as const)
    : ({ state: "ok", data } as const);
}

export function resolveReportList(ctx: WidgetContext) {
  const data = ctx.store.listReports(ctx.workspaceId);
  return data.length === 0
    ? ({ state: "empty", emptyMessage: "No reports generated yet.", data } as const)
    : ({ state: "ok", data } as const);
}

// ---------------------------------------------------------------------------
// Evidence (§5.6): all proof in the workspace, derived via work items
// ---------------------------------------------------------------------------

function workspaceEvidence(ctx: WidgetContext): EvidenceItem[] {
  return ctx.store
    .listWorkItems(ctx.workspaceId)
    .flatMap((w) => ctx.store.listEvidence(w.id));
}

export function resolveEvidencePanel(ctx: WidgetContext): Resolution<EvidenceItem[]> {
  const data = workspaceEvidence(ctx);
  return data.length === 0
    ? { state: "empty", emptyMessage: "No evidence captured yet.", data }
    : { state: "ok", data };
}

// ---------------------------------------------------------------------------
// Outcomes (§5.13): target vs actual, with computed progress
// ---------------------------------------------------------------------------

export function resolveOutcomePanel(ctx: WidgetContext): Resolution<OutcomeRow[]> {
  const outcomes = ctx.store.listOutcomes(ctx.workspaceId);
  if (outcomes.length === 0) {
    return { state: "empty", emptyMessage: "No outcomes defined.", data: [] };
  }
  const rows: OutcomeRow[] = outcomes.map((o) => {
    // ROI view: links the outcome to its computed metric's history for a real
    // value-vs-target trend + honest confidence (ROI_AND_IMPACT_MODEL §8/§9).
    const primary = o.related_metric_names?.[0];
    const history = primary ? ctx.store.metricHistory(ctx.workspaceId, primary) : [];
    const roi = computeOutcomeRoi(o, history);
    // Keep the legacy 0..1 progress for back-compat; prefer the ROI baseline→
    // target progress when computable, else fall back to actual/target.
    let progress = roi.progress;
    if (progress === undefined && typeof o.target_value === "number" && typeof o.actual_value === "number" && o.target_value !== 0) {
      progress = Math.max(0, Math.min(1, o.actual_value / o.target_value));
    }
    return { outcome: o, progress, roi };
  });
  return { state: "ok", data: rows };
}

// ---------------------------------------------------------------------------
// Exceptions (§5.10): generic, work-item-grounded friction
// ---------------------------------------------------------------------------

export function resolveExceptionPanel(ctx: WidgetContext): Resolution<ExceptionRow[]> {
  const items = ctx.store.listWorkItems(ctx.workspaceId);
  const evidenceWorkIds = new Set(workspaceEvidence(ctx).map((e) => e.work_item_id));
  const nowMs = Date.now();
  const TERMINAL = new Set(["completed", "archived", "canceled", "rejected"]);
  const rows: ExceptionRow[] = [];

  for (const w of items) {
    // Exceptions the user has explicitly dismissed are suppressed but logged
    // (see store.dismissException — the dismissal itself is an audited event).
    const md = (w.metadata ?? {}) as Record<string, unknown>;
    const dismissed = new Set(Array.isArray(md.dismissed_exceptions) ? (md.dismissed_exceptions as string[]) : []);
    if (w.status === "blocked" && !dismissed.has("blocked")) {
      rows.push({ kind: "blocked", label: w.title, work_item_id: w.id, detail: { status: w.status } });
    }
    if (w.due_at && !TERMINAL.has(w.status) && !dismissed.has("overdue")) {
      const due = Date.parse(w.due_at);
      if (!Number.isNaN(due) && due < nowMs) {
        rows.push({ kind: "overdue", label: w.title, work_item_id: w.id, detail: { due_at: w.due_at } });
      }
    }
    if ((w.status === "completed" || w.status === "awaiting_review") && !evidenceWorkIds.has(w.id) && !dismissed.has("missing_evidence")) {
      rows.push({ kind: "missing_evidence", label: w.title, work_item_id: w.id, detail: { status: w.status } });
    }
  }
  return rows.length === 0
    ? { state: "empty", emptyMessage: "No exceptions — work is on track.", data: rows }
    : { state: "ok", data: rows };
}
