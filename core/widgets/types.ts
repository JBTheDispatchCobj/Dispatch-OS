// core/widgets/types.ts
//
// The widget system contract (WIDGET_SYSTEM_RULES.md). Dispatch OS is "generic
// at the component level, specific at the configuration level": the UI is
// composed from reusable widgets that are driven by configuration, never by a
// vertical. This file defines the SEAM the eventual UI binds to — the
// normalized widget spec (parsed from a Dashboard's `widget_config`) and the
// resolved view-models the renderer consumes. No React, no CSS, no vertical
// nouns: a widget type maps to a stage of the operating loop, not to a hotel
// room or a household.
//
//   Input -> Context -> Interpretation -> Decision -> Action -> Evidence
//   -> Value -> Feedback -> Adaptation              (WIDGET_SYSTEM_RULES §4)
//
// RULE: anything here must apply across every business. Meaning attaches only
// through configuration (widget_config entries, metric_name, filters, labels).

import type {
  Approval,
  Decision,
  EvidenceItem,
  InboundEvent,
  Outcome,
  ReportRun,
  RoleKey,
  Source,
  AgentRun,
  WorkItem,
  WorkItemProposal,
} from "@/core/types";
import type { DataStore } from "@/core/data/store";
import type { OutcomeRoiView } from "@/core/engine/roi";

// ---------------------------------------------------------------------------
// Loop stages + widget types
// ---------------------------------------------------------------------------

/** The stage of the operating loop a widget surfaces (WIDGET_SYSTEM_RULES §4). */
export type LoopStage =
  | "input"
  | "context"
  | "interpretation"
  | "decision"
  | "action"
  | "evidence"
  | "value"
  | "feedback"
  | "adaptation";

/**
 * Canonical widget types. Each is a generic operating surface mapped to a loop
 * stage — NOT a vertical feature (WIDGET_SYSTEM_RULES §3, §5). Authored
 * `widget_config` entries use friendlier aliases (e.g. "metric", "list") which
 * the registry normalizes onto these (see registry.ts).
 */
export type WidgetType =
  | "metric_tile" // §5.11 single measured value (optionally vs target)
  | "metrics_panel" // §5.11 the universal metric family
  | "work_queue" // §5.3 filtered work items
  | "input_inbox" // §5.1 staged inputs awaiting interpretation
  | "proposal_queue" // §5.8 agent proposals awaiting human promotion
  | "approval_queue" // §5.9 items requiring human authorization
  | "decision_trail" // §3.20 the selected-action audit trail
  | "evidence_panel" // §5.6 proof that exists / is missing
  | "outcome_panel" // §5.13 work-to-value (target vs actual)
  | "exception_panel" // §5.10 abnormal/blocked/overdue/uncovered work
  | "report_list"; // §5.12 generated reports + share state

/** Resolution state for a composed widget. */
export type WidgetState = "ok" | "empty" | "forbidden";

// ---------------------------------------------------------------------------
// Normalized widget spec — parsed from a raw widget_config entry
// ---------------------------------------------------------------------------

/**
 * A widget_config entry after alias-resolution and field normalization. The raw
 * authored shape is loose (`Record<string, unknown>` on `Dashboard.widget_config`
 * / `{ type; label; metric_key?; filter? }` on `DashboardConfig.widgets`); this
 * is the typed form the composer + resolvers consume.
 */
export interface WidgetSpec {
  /** Canonical type after alias resolution. */
  type: WidgetType;
  /** The original `type` string as authored, kept for round-trip/debugging. */
  rawType: string;
  title?: string;
  description?: string;
  /** metric_tile: which `metric_name` to display. */
  metricName?: string;
  /** work_queue / exception_panel: a simple filter expression (see resolve.ts). */
  filter?: string;
  /**
   * Actions the UI may render for this widget. Declared here; the actual
   * mutation + event log happens in app/actions.ts later (WIDGET_SYSTEM_RULES
   * §9). Defaults come from the registry; an authored entry may override.
   */
  actions?: string[];
  /** Role allowlist for viewing. Empty/undefined = visible to all (§8). */
  visibleTo?: RoleKey[];
  /** Declared per-action role permissions, enforced at mutation time later (§6). */
  permissions?: Record<string, RoleKey[]>;
  /** Any extra authored fields, preserved verbatim. */
  raw?: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Resolution context
// ---------------------------------------------------------------------------

/**
 * Everything a resolver needs. The store is the ONLY data boundary. `packageKey`
 * is the workspace's cartridge/configuration key, used solely for cartridge-
 * blind vocabulary/label lookups (core helpers, never a cartridge import).
 */
export interface WidgetContext {
  store: DataStore;
  workspaceId: string;
  /** Active configuration/package key (workspace `cartridge_key`). */
  packageKey?: string;
  /** Viewer role, for visibility gating. */
  role?: RoleKey;
}

// ---------------------------------------------------------------------------
// Resolved payload shapes
// ---------------------------------------------------------------------------

/** A metric rendered as a tile: value, optional target, auditable basis. */
export interface MetricTileData {
  metric_name: string;
  label: string;
  value: number;
  unit: "percent" | "count";
  target?: number;
  /** Numeric relation to target (semantics — good/bad — left to config/UI). */
  vsTarget?: "above" | "below" | "on";
  /** Numerator/denominator (or counts) the value was derived from (§3.24). */
  basis?: Record<string, unknown>;
  method?: string;
  measured_at?: string;
}

/** An input plus the front-of-loop trail it produced (source -> run -> proposals). */
export interface InputInboxRow {
  input: InboundEvent;
  source?: Source;
  /** Agent runs whose `source_input_id` points at this input. */
  runs: AgentRun[];
  /** Proposals produced by those runs (the human-promote queue for this input). */
  proposals: WorkItemProposal[];
}

/** An outcome with computed progress toward its target, when computable. */
export interface OutcomeRow {
  outcome: Outcome;
  /** 0..1 toward target (baseline→target when computable, else actual/target). */
  progress?: number;
  /** Value-vs-target view derived from the linked metric's history (§5.13/ROI). */
  roi?: OutcomeRoiView;
}

/** A derived exception (WIDGET_SYSTEM_RULES §5.10). Generic, work-item-grounded. */
export interface ExceptionRow {
  kind: "blocked" | "overdue" | "missing_evidence" | "stale_review";
  label: string;
  work_item_id: string;
  detail?: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Resolved widget view-models (discriminated by `type`)
// ---------------------------------------------------------------------------

interface ResolvedBase {
  /** Stable per-composition id. */
  id: string;
  type: WidgetType;
  loopStage: LoopStage;
  title: string;
  spec: WidgetSpec;
  state: WidgetState;
  emptyMessage?: string;
  /** Declared actions the UI may render (permission-checked at mutation time). */
  actions: string[];
}

export interface MetricTileWidget extends ResolvedBase {
  type: "metric_tile";
  data: MetricTileData | null;
}
export interface MetricsPanelWidget extends ResolvedBase {
  type: "metrics_panel";
  data: MetricTileData[];
}
export interface WorkQueueWidget extends ResolvedBase {
  type: "work_queue";
  data: WorkItem[];
}
export interface InputInboxWidget extends ResolvedBase {
  type: "input_inbox";
  data: InputInboxRow[];
}
export interface ProposalQueueWidget extends ResolvedBase {
  type: "proposal_queue";
  data: WorkItemProposal[];
}
export interface ApprovalQueueWidget extends ResolvedBase {
  type: "approval_queue";
  data: Approval[];
}
export interface DecisionTrailWidget extends ResolvedBase {
  type: "decision_trail";
  data: Decision[];
}
export interface EvidencePanelWidget extends ResolvedBase {
  type: "evidence_panel";
  data: EvidenceItem[];
}
export interface OutcomePanelWidget extends ResolvedBase {
  type: "outcome_panel";
  data: OutcomeRow[];
}
export interface ExceptionPanelWidget extends ResolvedBase {
  type: "exception_panel";
  data: ExceptionRow[];
}
export interface ReportListWidget extends ResolvedBase {
  type: "report_list";
  data: ReportRun[];
}

/** The view-model the UI renders. Discriminated on `type`. */
export type ResolvedWidget =
  | MetricTileWidget
  | MetricsPanelWidget
  | WorkQueueWidget
  | InputInboxWidget
  | ProposalQueueWidget
  | ApprovalQueueWidget
  | DecisionTrailWidget
  | EvidencePanelWidget
  | OutcomePanelWidget
  | ExceptionPanelWidget
  | ReportListWidget;

// ---------------------------------------------------------------------------
// Composition result
// ---------------------------------------------------------------------------

/** A widget_config entry the composer could not render, with the reason why. */
export interface SkippedWidget {
  rawType: string;
  reason: string;
}

/**
 * The output of composing a dashboard: the resolved widgets the UI renders, plus
 * an honest record of anything skipped (unsupported type, role-gated). Nothing
 * is silently dropped.
 */
export interface CompositionResult {
  workspaceId: string;
  /** Source dashboard id, or undefined when the default layout was used. */
  dashboardId?: string;
  dashboardName?: string;
  widgets: ResolvedWidget[];
  skipped: SkippedWidget[];
}
