// core/widgets/registry.ts
//
// The widget registry: the single place that knows the canonical widget types,
// what loop stage each serves, its default title + default actions, and how to
// normalize a loosely-authored `widget_config` entry onto a typed WidgetSpec.
//
// "Build reusable widgets first; compose dashboards from widgets"
// (WIDGET_SYSTEM_RULES §7). The registry is cartridge-blind — it never names a
// vertical. Authoring uses friendly aliases ("metric", "list", "approvals");
// the registry maps them to canonical types so the seeded dashboards keep
// working and new ones stay terse.

import type { RoleKey } from "@/core/types";
import type { LoopStage, WidgetSpec, WidgetType } from "@/core/widgets/types";

export interface WidgetDefinition {
  type: WidgetType;
  loopStage: LoopStage;
  /** Title used when an entry does not author its own. */
  defaultTitle: string;
  /**
   * Actions the UI may render by default (WIDGET_SYSTEM_RULES §5 "primary
   * actions"). The mutation + event log lives in app/actions.ts later; here we
   * only DECLARE them. An authored entry's `actions` overrides this list.
   */
  defaultActions: string[];
}

/** Canonical definitions, keyed by canonical type. */
export const WIDGET_DEFINITIONS: Record<WidgetType, WidgetDefinition> = {
  metric_tile: {
    type: "metric_tile",
    loopStage: "value",
    defaultTitle: "Metric",
    defaultActions: [],
  },
  metrics_panel: {
    type: "metrics_panel",
    loopStage: "value",
    defaultTitle: "Operating metrics",
    defaultActions: [],
  },
  work_queue: {
    type: "work_queue",
    loopStage: "action",
    defaultTitle: "Work",
    defaultActions: ["assign", "start", "block", "complete", "add_note", "add_evidence", "request_review"],
  },
  input_inbox: {
    type: "input_inbox",
    loopStage: "input",
    defaultTitle: "Inputs",
    defaultActions: ["run_rules", "review", "classify", "match", "create_work_item", "archive", "reject"],
  },
  proposal_queue: {
    type: "proposal_queue",
    loopStage: "interpretation",
    defaultTitle: "Agent proposals",
    defaultActions: ["promote", "reject"],
  },
  approval_queue: {
    type: "approval_queue",
    loopStage: "decision",
    defaultTitle: "Approvals",
    defaultActions: ["approve", "reject", "request_changes"],
  },
  decision_trail: {
    type: "decision_trail",
    loopStage: "decision",
    defaultTitle: "Decisions",
    defaultActions: [],
  },
  evidence_panel: {
    type: "evidence_panel",
    loopStage: "evidence",
    defaultTitle: "Evidence",
    defaultActions: ["upload", "link", "approve", "reject", "request_missing"],
  },
  outcome_panel: {
    type: "outcome_panel",
    loopStage: "value",
    defaultTitle: "Outcomes",
    defaultActions: ["assign_value_category", "estimate_impact"],
  },
  exception_panel: {
    type: "exception_panel",
    loopStage: "feedback",
    defaultTitle: "Exceptions",
    defaultActions: ["assign_owner", "create_work_item", "escalate", "dismiss"],
  },
  report_list: {
    type: "report_list",
    loopStage: "value",
    defaultTitle: "Reports",
    defaultActions: ["generate", "share", "export", "archive"],
  },
};

/**
 * Authoring aliases -> canonical type. Lets seeded dashboards write terse types
 * ("metric", "list") and lets the WIDGET_SYSTEM_RULES §5 names ("metrics",
 * "agent_proposal_queue", "exception_dashboard") resolve too.
 */
const ALIASES: Record<string, WidgetType> = {
  // metric_tile
  metric: "metric_tile",
  metric_tile: "metric_tile",
  kpi: "metric_tile",
  // metrics_panel
  metrics: "metrics_panel",
  metrics_panel: "metrics_panel",
  metric_family: "metrics_panel",
  // work_queue
  list: "work_queue",
  work: "work_queue",
  work_list: "work_queue",
  work_queue: "work_queue",
  // input_inbox
  input: "input_inbox",
  inputs: "input_inbox",
  input_inbox: "input_inbox",
  inbox: "input_inbox",
  // proposal_queue
  proposals: "proposal_queue",
  proposal_queue: "proposal_queue",
  agent_proposal_queue: "proposal_queue",
  // approval_queue
  approvals: "approval_queue",
  approval_queue: "approval_queue",
  // decision_trail
  decisions: "decision_trail",
  decision_trail: "decision_trail",
  audit: "decision_trail",
  // evidence_panel
  evidence: "evidence_panel",
  evidence_panel: "evidence_panel",
  // outcome_panel
  outcomes: "outcome_panel",
  outcome_panel: "outcome_panel",
  roi: "outcome_panel",
  roi_impact: "outcome_panel",
  impact: "outcome_panel",
  // exception_panel
  exceptions: "exception_panel",
  exception_panel: "exception_panel",
  exception_dashboard: "exception_panel",
  // report_list
  reports: "report_list",
  report_list: "report_list",
  report_builder: "report_list",
};

/** Resolve an authored type string to a canonical WidgetType, or undefined. */
export function resolveWidgetType(raw: string): WidgetType | undefined {
  return ALIASES[raw.trim().toLowerCase()];
}

/** A raw, loosely-typed widget_config entry as authored on a Dashboard/config. */
export type RawWidgetEntry = Record<string, unknown>;

const asString = (v: unknown): string | undefined => (typeof v === "string" ? v : undefined);
const asStringArray = (v: unknown): string[] | undefined =>
  Array.isArray(v) && v.every((x) => typeof x === "string") ? (v as string[]) : undefined;
const asRoleArray = (v: unknown): RoleKey[] | undefined => asStringArray(v) as RoleKey[] | undefined;

/**
 * Normalize one authored entry to a typed WidgetSpec. Returns null when the
 * `type` is missing or unknown — the composer records that as a skipped widget
 * rather than guessing. Accepts both the runtime `Dashboard.widget_config`
 * shape (`metric_name`) and the config `DashboardConfig.widgets` shape
 * (`metric_key`, `label`).
 */
export function normalizeSpec(entry: RawWidgetEntry): WidgetSpec | null {
  const rawType = asString(entry.type);
  if (!rawType) return null;
  const type = resolveWidgetType(rawType);
  if (!type) return null;

  const permissionsRaw = entry.permissions;
  let permissions: Record<string, RoleKey[]> | undefined;
  if (permissionsRaw && typeof permissionsRaw === "object" && !Array.isArray(permissionsRaw)) {
    permissions = {};
    for (const [k, v] of Object.entries(permissionsRaw as Record<string, unknown>)) {
      const roles = asRoleArray(v);
      if (roles) permissions[k] = roles;
    }
  }

  return {
    type,
    rawType,
    title: asString(entry.title) ?? asString(entry.label),
    description: asString(entry.description),
    metricName: asString(entry.metric_name) ?? asString(entry.metricName) ?? asString(entry.metric_key),
    filter: asString(entry.filter),
    actions: asStringArray(entry.actions),
    visibleTo: asRoleArray(entry.visibleTo) ?? asRoleArray(entry.role_visibility),
    permissions,
    raw: entry,
  };
}

/**
 * Default, cartridge-blind dashboard layouts used when a workspace has no
 * dashboard with an authored `widget_config`. The OS must be legible from first
 * load (CORE_OBJECT_MODEL §3.26: a dashboard shows the state of the operating
 * loop).
 *
 * Layouts are ROLE-TUNED, not role-specific widgets: the same reusable widgets
 * are composed differently per role (WIDGET_SYSTEM_RULES §8). An operator sees
 * the execution cockpit; a reviewer sees the human-in-the-loop gates; an owner/
 * executive sees value + exceptions. With no role context, a comprehensive
 * layout covers the full loop (every widget type).
 */
const DEFAULT_LAYOUTS: Record<RoleKey, RawWidgetEntry[]> = {
  operator: [
    { type: "input_inbox", label: "Inputs awaiting review" },
    { type: "work_queue", label: "Open work", filter: "status!=completed&status!=archived" },
    { type: "proposal_queue", label: "Agent proposals" },
    { type: "evidence_panel", label: "Evidence" },
    { type: "exception_panel", label: "Exceptions" },
  ],
  reviewer: [
    { type: "proposal_queue", label: "Proposals to review" },
    { type: "work_queue", label: "Awaiting review", filter: "status=awaiting_review" },
    { type: "approval_queue", label: "Approvals" },
    { type: "evidence_panel", label: "Evidence" },
    { type: "decision_trail", label: "Recent decisions" },
  ],
  admin: [
    { type: "metrics_panel", label: "Operating metrics" },
    { type: "work_queue", label: "Open work", filter: "status!=completed&status!=archived" },
    { type: "proposal_queue", label: "Agent proposals" },
    { type: "approval_queue", label: "Approvals" },
    { type: "exception_panel", label: "Exceptions" },
    { type: "decision_trail", label: "Recent decisions" },
  ],
  owner: [
    { type: "metrics_panel", label: "Operating metrics" },
    { type: "outcome_panel", label: "Outcomes" },
    { type: "exception_panel", label: "Exceptions" },
    { type: "report_list", label: "Reports" },
    { type: "decision_trail", label: "Recent decisions" },
  ],
  viewer: [
    { type: "metrics_panel", label: "Operating metrics" },
    { type: "outcome_panel", label: "Outcomes" },
    { type: "report_list", label: "Reports" },
  ],
};

/** Comprehensive layout (no role): a cross-section that touches every widget type. */
const COMPREHENSIVE_LAYOUT: RawWidgetEntry[] = [
  { type: "metrics_panel", label: "Operating metrics" },
  { type: "metric_tile", label: "Work completion", metric_name: "work_completion_rate" },
  { type: "input_inbox", label: "Inputs awaiting review" },
  { type: "proposal_queue", label: "Agent proposals" },
  { type: "work_queue", label: "Open work", filter: "status!=completed&status!=archived" },
  { type: "approval_queue", label: "Approvals" },
  { type: "decision_trail", label: "Recent decisions" },
  { type: "evidence_panel", label: "Evidence" },
  { type: "outcome_panel", label: "Outcomes" },
  { type: "exception_panel", label: "Exceptions" },
  { type: "report_list", label: "Reports" },
];

export function defaultDashboardSpecs(role?: RoleKey): WidgetSpec[] {
  const entries = role ? DEFAULT_LAYOUTS[role] : COMPREHENSIVE_LAYOUT;
  // Every entry above uses a known type, so the cast-through-normalize is safe.
  return entries.map((e) => normalizeSpec(e)).filter((s): s is WidgetSpec => s !== null);
}
