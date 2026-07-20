// core/types.ts
//
// Dispatch OS — generic, industry-agnostic object model.
//
// RULE: nothing in /core may name a vertical concept (no "room",
// "reservation", "household", "rent roll"). Verticals live in /cartridges and
// attach their meaning through `entity_type`, `work_item.kind`, and the
// per-cartridge `context` JSON. If you are tempted to add a hotel/finance/
// trades word here, it belongs in a cartridge instead.
//
// The reusable spine:
//   inbound data/events  -> interpreted by rules/agents
//   -> proposals (draft work) -> human review/promote
//   -> work items executed -> evidence logged
//   -> reports/dashboards -> market/outcome outputs

// ---------------------------------------------------------------------------
// Tenancy + identity
// ---------------------------------------------------------------------------

/** Top-level customer boundary. All confidential data is scoped to an org. */
export interface Organization {
  id: string;
  name: string;
  /** Which cartridge keys this org has enabled, e.g. ["wealth"]. */
  enabled_cartridges: string[];
  created_at: string;
}

/** A working context inside an org (a property, a book of business, a region). */
export interface Workspace {
  id: string;
  org_id: string;
  name: string;
  /** The cartridge this workspace operates under. One cartridge per workspace. */
  cartridge_key: string;
  created_at: string;
}

export type RoleKey = "owner" | "admin" | "operator" | "reviewer" | "viewer";

/** A person in an org. Roles are per-workspace via `WorkspaceMembership`. */
export interface UserProfile {
  id: string;
  org_id: string;
  display_name: string;
  email: string;
  created_at: string;
}

export interface WorkspaceMembership {
  id: string;
  workspace_id: string;
  user_id: string;
  role: RoleKey;
}

// ---------------------------------------------------------------------------
// Entities (the nouns a business tracks) — meaning comes from the cartridge
// ---------------------------------------------------------------------------

/** A cartridge-declared entity type, e.g. wealth:"advisory_firm". */
export interface EntityType {
  /** Globally unique: "<cartridge_key>:<slug>", e.g. "wealth:advisory_firm". */
  key: string;
  cartridge_key: string;
  label: string;
  /** Human description of what fields the `context` is expected to carry. */
  context_hint?: string;
}

/** An instance of an entity type. Cartridge-specific fields go in `context`. */
export interface Entity {
  id: string;
  workspace_id: string;
  entity_type_key: string;
  /** Display name shown in generic UI. */
  title: string;
  context: Record<string, unknown>;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Work items (the things to DO) — the universal unit of execution
// ---------------------------------------------------------------------------

/**
 * Work item status set — authoritative per CORE_OBJECT_MODEL §3.13.
 * The proposal gate produces `proposed`; humans drive the rest. `awaiting_review`
 * (was `in_review`) and `completed` (was `done`) replace the older short names.
 */
export type WorkItemStatus =
  | "proposed"
  | "open"
  | "assigned"
  | "in_progress"
  | "blocked"
  | "awaiting_review"
  | "awaiting_approval"
  | "completed"
  | "rejected"
  | "canceled"
  | "reopened"
  | "archived";

export type WorkItemSource = "manual" | "inbound" | "agent" | "system";

/**
 * A hotel room turn, a data-room cleanup, an estimate follow-up, and a rent-
 * roll review are ALL WorkItems. `kind` is a cartridge-declared workflow key
 * (e.g. "wealth:data_room_cleanup"); `context` carries cartridge fields.
 *
 * Required fields mirror the core model; the optional block below is additive
 * (workflow linkage, provenance, value) and defaults to undefined so existing
 * seeds keep working.
 */
export interface WorkItem {
  id: string;
  workspace_id: string;
  /** Cartridge workflow key: "<cartridge_key>:<slug>". Maps to model `work_item_type`. */
  kind: string;
  title: string;
  status: WorkItemStatus;
  priority: "low" | "medium" | "high";
  source: WorkItemSource;
  /** Optional link back to the entity this work is about. */
  entity_id: string | null;
  /** Assigned operator (UserProfile id) or null. */
  assignee_id: string | null;
  assignee_name: string | null;
  context: Record<string, unknown>;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;

  // --- Optional, per CORE_OBJECT_MODEL §3.13 (all additive) ----------------
  description?: string;
  due_at?: string | null;
  /** The Input this work originated from, if any (provenance). */
  source_input_id?: string | null;
  /** The Workflow (process template) this work instantiates. */
  workflow_id?: string | null;
  parent_work_item_id?: string | null;
  related_entity_ids?: string[];
  related_document_ids?: string[];
  /** Value hypothesis: what good outcome this work is meant to produce. */
  expected_outcome?: string;
  /** Value bucket, e.g. "risk_reduction" | "time_saved" | "revenue". */
  value_category?: string;
  metadata?: Record<string, unknown>;
}

/** Append-only audit trail. Never updated, never deleted. */
export type WorkItemEventType =
  | "created"
  | "status_changed"
  | "assigned"
  | "checklist_checked"
  | "checklist_unchecked"
  | "note_added"
  | "evidence_added"
  | "evidence_reviewed"
  | "escalated"
  | "exception_dismissed"
  | "needs_review"
  | "review_approved"
  | "review_rejected"
  | "proposal_promoted"
  | "agent_action";

export interface WorkItemEvent {
  id: string;
  work_item_id: string;
  type: WorkItemEventType;
  /** "user:<id>", "agent:<run_id>", or "system". Human vs agent is explicit. */
  actor: string;
  detail: Record<string, unknown>;
  schema_version: 1;
  created_at: string;
}

/**
 * Generic, workspace-scoped audit record (CORE_OBJECT_MODEL §3.16). The
 * append-only trail for actions that are NOT scoped to a single work item —
 * input status transitions, approval decisions, report sharing/archiving,
 * outcome value assignment. (Work-item actions keep using {@link WorkItemEvent}
 * so the per-item timeline stays rich.) Like work-item events, this is never
 * updated or deleted; `actor` keeps human vs agent explicit.
 */
export interface OperatingEvent {
  id: string;
  workspace_id: string;
  organization_id?: string;
  event_type: string;
  /** "user:<id>", "agent:<run_id>", or "system". */
  actor: string;
  related_input_id?: string | null;
  related_entity_id?: string | null;
  related_work_item_id?: string | null;
  related_evidence_id?: string | null;
  related_report_id?: string | null;
  related_approval_id?: string | null;
  related_outcome_id?: string | null;
  payload?: Record<string, unknown>;
  schema_version: 1;
  occurred_at: string;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Checklists
// ---------------------------------------------------------------------------

export interface ChecklistTemplate {
  key: string; // "<cartridge_key>:<slug>"
  cartridge_key: string;
  label: string;
  items: { title: string; sort_order: number; detail?: string }[];
}

export interface ChecklistItem {
  id: string;
  work_item_id: string;
  title: string;
  sort_order: number;
  done: boolean;
  detail?: string;
  done_at: string | null;
}

// ---------------------------------------------------------------------------
// Notes + evidence + documents
// ---------------------------------------------------------------------------

export interface Note {
  id: string;
  work_item_id: string;
  author_id: string;
  author_name: string;
  body: string;
  created_at: string;
}

/**
 * Structured proof that something was true/done. Distinct from a free-text
 * note: reports are generated FROM evidence, so it is typed + attributable.
 */
export type EvidenceKind = "observation" | "issue" | "measurement" | "attestation" | "file_ref";

/** Review state of an evidence item (§3.18 reviewed_by/reviewed_at). */
export type EvidenceReviewStatus = "pending" | "approved" | "rejected";

export interface EvidenceItem {
  id: string;
  work_item_id: string;
  kind: EvidenceKind;
  label: string;
  value: Record<string, unknown>;
  document_id: string | null;
  captured_by: string; // "user:<id>" | "agent:<run_id>"
  created_at: string;
  // --- Additive (§3.18): human review of proof, separate from capture --------
  /** Undefined on legacy seeds = treated as unreviewed/pending by the UI. */
  review_status?: EvidenceReviewStatus;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
}

export interface DocumentRef {
  id: string;
  workspace_id: string;
  filename: string;
  /** In idea state this is a fixture path; later a storage URL. */
  uri: string;
  mime: string;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Ingestion -> interpretation -> proposal -> review
// ---------------------------------------------------------------------------

/**
 * Input staging state machine — CORE_OBJECT_MODEL §3.6.
 * Raw input is preserved; extracted meaning is NOT truth until `approved`
 * (human) or system-confirmed under configuration.
 */
export type InputStatus =
  | "received"
  | "parsing"
  | "parsed"
  | "classified"
  | "matched"
  | "interpreted"
  | "proposed"
  | "approved"
  | "converted"
  | "archived"
  | "rejected"
  | "error";

/**
 * Input — anything the business receives/observes/uploads/forwards/exports/
 * connects/manually enters (CORE_OBJECT_MODEL §3.6). Append-only raw material.
 * Carries raw vs parsed vs extracted separately so trust stays layered.
 *
 * `InboundEvent` is retained as an alias for back-compat with existing code.
 */
export interface Input {
  id: string;
  workspace_id: string;
  /** Optional org scope (set when promoted to a hosted backend). */
  organization_id?: string;
  /** FK to Source (§3.7). In-memory seeds may use a plain string. */
  source_id?: string | null;
  /** Legacy/quick source label: "csv_upload" | "manual" | "<connector>". */
  source: string;
  /** Configured input type key, e.g. "spreadsheet_export". */
  input_type?: string;
  external_id: string | null;
  /** Pointer to the preserved raw artifact (path/uri). */
  raw_content_reference?: string | null;
  raw_text?: string | null;
  /** The original signal payload (kept as raw evidence). */
  payload: Record<string, unknown>;
  /** Parsed/normalized form (not yet trusted). */
  parsed_content?: Record<string, unknown> | null;
  /** Fields an agent/rule extracted (not yet trusted). */
  extracted_fields?: Record<string, unknown> | null;
  confidence_score?: number | null;
  related_entity_ids?: string[];
  related_work_item_ids?: string[];
  /** Staging state. Replaces the old `processed` boolean. */
  status: InputStatus;
  received_at?: string;
  created_at: string;
  updated_at?: string;
  metadata?: Record<string, unknown>;
  /**
   * @deprecated Use `status` (received…converted). Kept optional so older
   * fixtures that set `processed` still typecheck during migration.
   */
  processed?: boolean;
}

/** @deprecated Renamed to {@link Input} per CORE_OBJECT_MODEL §3.6. */
export type InboundEvent = Input;

/**
 * Agent Run — a logged execution of an AI/automation process
 * (CORE_OBJECT_MODEL §3.22, AGENT_AND_AUTOMATION_RULES §6). Cost and output
 * quality must be observable. Agent output is not truth by default.
 */
export interface AgentRun {
  id: string;
  workspace_id: string;
  organization_id?: string;
  /** Human/configured name of the agent, e.g. "Intake Agent". */
  agent_name?: string;
  /** Which interpreter/role ran, e.g. "wealth:readiness_scan". */
  interpreter_key: string;
  status: "running" | "succeeded" | "failed";
  /** Dry-run by default — agents propose, they do not auto-promote. */
  dry_run: boolean;
  summary: string;
  // --- Governance / observability (AGENT_AND_AUTOMATION_RULES §6) ----------
  trigger_type?: string;
  source_input_id?: string | null;
  related_entity_id?: string | null;
  related_work_item_id?: string | null;
  /** Named, versioned prompt reference (not an inline string). */
  prompt_reference?: string | null;
  model?: string | null;
  token_usage?: number | null;
  cost_estimate?: number | null;
  /** Configuration + context versions this run executed under. */
  configuration_version?: number | null;
  context_version?: number | null;
  confidence?: number | null;
  output_reference?: string | null;
  error_message?: string | null;
  started_at?: string;
  ended_at?: string | null;
  created_at: string;
}

export interface AgentAction {
  id: string;
  agent_run_id: string;
  /** What the agent did/decided. Logged separately from human approvals. */
  action: string;
  detail: Record<string, unknown>;
  created_at: string;
}

/**
 * Proposal status — CORE_OBJECT_MODEL §3.23 + AGENT_AND_AUTOMATION_RULES §7.
 * `pending`/`promoted` are kept as back-compat aliases for the existing flow
 * (`pending`≈proposed, `promoted`≈converted).
 */
export type ProposalStatus =
  | "proposed"
  | "accepted"
  | "accepted_with_edits"
  | "rejected"
  | "expired"
  | "converted"
  | "archived"
  // back-compat with the v0 flow:
  | "pending"
  | "approved"
  | "promoted";

export type RiskLevel = "low" | "medium" | "high";

/**
 * Agent Proposal — a suggested interpretation/action/work item/report/decision
 * (CORE_OBJECT_MODEL §3.23). A human reviews it; on approval it is promoted
 * into a real WorkItem (or other object). This is the human-in-the-loop gate —
 * nothing an agent proposes becomes truth without a human promote.
 *
 * Named `WorkItemProposal` for back-compat; `AgentProposal` is an alias.
 */
export interface WorkItemProposal {
  id: string;
  workspace_id: string;
  organization_id?: string;
  agent_run_id: string | null;
  /** What kind of thing is being proposed (work item, evidence, decision…). */
  proposal_type?: string;
  /** Human-facing title/summary of the proposal. */
  title?: string;
  summary?: string;
  /** The shape of the WorkItem that would be created on promote. */
  proposed: {
    kind: string;
    title: string;
    priority: "low" | "medium" | "high";
    entity_id: string | null;
    context: Record<string, unknown>;
    checklist_template_key?: string;
  };
  rationale: string;
  status: ProposalStatus;
  // --- Governance (AGENT_AND_AUTOMATION_RULES §7, §9) ----------------------
  /** Risk gate: `high` is never auto-promoted. */
  risk_level?: RiskLevel;
  /** Which role must review before promotion, e.g. "reviewer" | "owner". */
  required_review_role?: RoleKey;
  confidence_score?: number | null;
  /** Evidence/source ids this proposal cites. */
  evidence_references?: string[];
  review_notes?: string | null;
  created_at: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  promoted_work_item_id: string | null;
}

/** Alias per CORE_OBJECT_MODEL §3.23. */
export type AgentProposal = WorkItemProposal;

// ---------------------------------------------------------------------------
// Reporting + outcomes
// ---------------------------------------------------------------------------

export interface ReportDefinition {
  key: string; // "<cartridge_key>:<slug>"
  cartridge_key: string;
  label: string;
  description: string;
}

/**
 * A generated report instance, built from structured evidence (§3.25). Reports
 * MUST be traceable back to the evidence/metrics/inputs they cite
 * (AGENT_AND_AUTOMATION_RULES §17), so sections and the run carry explicit
 * reference id lists. Generation is logged; sharing requires human approval.
 */
export type ReportRunStatus = "draft" | "generated" | "under_review" | "approved" | "shared" | "archived";

export interface ReportSection {
  heading: string;
  body: string;
  /** Evidence/metric/input ids this section is grounded in. */
  source_references?: string[];
}

export interface ReportRun {
  id: string;
  workspace_id: string;
  report_key: string;
  generated_at: string;
  sections: ReportSection[];
  // --- Additive (§3.25): traceability + lifecycle -------------------------
  title?: string;
  status?: ReportRunStatus;
  /** "agent:<run_id>" | "user:<id>" | "system". */
  generated_by?: string;
  /** All evidence/metric/input ids cited anywhere in the report. */
  source_references?: string[];
  /** Plain-language notes about data that was missing at generation time. */
  missing_data_notes?: string[];
}

/**
 * A market/outcome output: the OS can emit an external-facing artifact when
 * appropriate (a diligence package, a buyer one-pager, a readiness score feed).
 * Kept generic; cartridges define what they emit.
 */
export interface OutcomeOutput {
  id: string;
  workspace_id: string;
  kind: string; // "<cartridge_key>:<slug>"
  label: string;
  payload: Record<string, unknown>;
  created_at: string;
}

// ===========================================================================
// Core primitives added to reconcile with CORE_OBJECT_MODEL.md (the schema
// source of truth). All are universal — they apply across most businesses —
// so they belong in /core, never in a cartridge. Vertical meaning still
// attaches only through configuration (keys, types, context, vocabulary).
// ===========================================================================

export type LifecycleStatus = "active" | "inactive" | "archived";

// --- §3.7 Source -----------------------------------------------------------

/** Where an input came from. Reliability is scored later. */
export interface Source {
  id: string;
  workspace_id: string;
  organization_id?: string;
  name: string;
  /** "upload" | "email" | "api" | "mcp_connector" | "manual_entry" | "csv_export" | "crm" | "pms" | ... */
  source_type: string;
  status: LifecycleStatus;
  external_account_id?: string | null;
  connector_type?: string | null;
  sync_frequency?: string | null;
  last_sync_at?: string | null;
  /** 0..1 reliability score, assigned over time. */
  reliability_score?: number | null;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at?: string;

  // --- Additive (Cooperative Markets): plane + market-source metadata --------
  // A source can live on the shared market plane (public regulators, filings,
  // company sites) or a tenant plane (an org's CRM/PMS). These optional fields
  // default to undefined so existing tenant sources are unaffected. The string
  // unions are inlined (not imported from core/truth) to keep core/types.ts
  // dependency-free; they mirror Plane/Visibility in core/truth/types.ts.
  /** "shared_market" | "private_terminal" | "control". Undefined = tenant. */
  plane?: "shared_market" | "private_terminal" | "control";
  /** Visibility of records produced from this source (see core/truth Visibility). */
  visibility?:
    | "public"
    | "network"
    | "tenant_private"
    | "relationship_private"
    | "personal";
  /** Publisher/owner of a public source, e.g. "NCUA", "SEC EDGAR". */
  publisher?: string | null;
  /** Canonical URL / access point for the source. */
  official_url?: string | null;
  /** Legal/terms constraints on use (SOURCE_CONTRACT_TEMPLATE). */
  legal_terms?: string | null;
  /** True when attribution is required when publishing derived facts. */
  attribution_required?: boolean;
  /** Precedence weight when this source conflicts with another (higher wins). */
  precedence?: number | null;
}

// --- §3.5 Configuration ----------------------------------------------------

/** Lifecycle for configuration records (CONFIGURATION_RULES §7). */
export type ConfigurationStatus =
  | "draft"
  | "review"
  | "active"
  | "deprecated"
  | "archived";

/**
 * A Configuration defines how Dispatch OS behaves for a workspace/org: entity
 * types, workflows, rules, vocabulary, evidence requirements, dashboards,
 * reports, automation keys, agent instructions. Versioned; never overwritten
 * in place (CONFIGURATION_RULES §6). The actual component data is modeled in
 * core/config/types.ts; this record is the governed envelope.
 */
export interface Configuration {
  id: string;
  organization_id?: string;
  /** Null for org/system-level configuration. */
  workspace_id: string | null;
  name: string;
  version: number;
  status: ConfigurationStatus;
  description?: string;
  /** Lineage for overrides/clones of a packaged configuration. */
  parent_configuration_id?: string | null;
  /** Packaged-configuration key this was installed from, e.g. "wealth". */
  package_key?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at?: string;
}

// --- §3.10 Context Object --------------------------------------------------

/** Versioned, reviewable business operating memory (SOPs, policies, criteria). */
export interface ContextObject {
  id: string;
  workspace_id: string;
  organization_id?: string;
  /** "sop" | "rule" | "definition" | "policy" | "constraint" | "exception" | ... */
  context_type: string;
  title: string;
  body: string;
  status: LifecycleStatus;
  version: number;
  related_entity_ids?: string[];
  related_workflow_ids?: string[];
  source_input_id?: string | null;
  approved_by?: string | null;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at?: string;
}

// --- §3.11 Rule ------------------------------------------------------------

export type RuleType =
  | "validation"
  | "automation"
  | "escalation"
  | "evidence"
  | "assignment"
  | "approval"
  | "metric"
  | "reporting"
  | "risk"
  | "opportunity";

/**
 * Deterministic, configurable, auditable logic used to interpret inputs,
 * trigger work, require evidence, escalate, or compute metrics. Distinct from
 * the cartridge `RuleDef` description metadata — this is the config-level
 * record with structured trigger/condition/action definitions.
 */
export interface Rule {
  id: string;
  configuration_id: string;
  name: string;
  description: string;
  rule_type?: RuleType;
  /** What event/automation key fires this rule. */
  trigger_definition: Record<string, unknown>;
  /** Predicate that must hold for the action to run. */
  condition_definition: Record<string, unknown>;
  /** What the rule does/proposes when it fires. */
  action_definition: Record<string, unknown>;
  status: LifecycleStatus;
  priority?: number;
  requires_human_approval?: boolean;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at?: string;
}

// --- §3.12 Workflow --------------------------------------------------------

/**
 * A repeatable operating process TEMPLATE. A Workflow is not a WorkItem — the
 * WorkItem is an instance of the process (CORE_OBJECT_MODEL §3.12).
 */
export interface Workflow {
  id: string;
  configuration_id: string;
  /** Stable key, e.g. "wealth:data_room_cleanup". */
  key?: string;
  name: string;
  description: string;
  status: LifecycleStatus;
  workflow_type?: string;
  trigger_definitions?: Record<string, unknown>[];
  default_steps?: { label: string; sort_order: number }[];
  default_checklist_template_key?: string | null;
  default_evidence_requirements?: string[];
  /** Value hypothesis the workflow is meant to improve. */
  expected_outcome?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at?: string;
}

// --- §3.20 Decision --------------------------------------------------------

export type DecisionStatus =
  | "proposed"
  | "approved"
  | "rejected"
  | "executed"
  | "superseded"
  | "archived";

/** The selected response to an interpreted input or operating condition. */
export interface Decision {
  id: string;
  workspace_id: string;
  organization_id?: string;
  decision_type: string;
  status: DecisionStatus;
  source_input_id?: string | null;
  related_work_item_id?: string | null;
  related_entity_id?: string | null;
  decision_summary?: string;
  selected_action?: string;
  rationale?: string;
  decided_by?: string | null;
  agent_proposal_id?: string | null;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at?: string;
}

// --- §3.21 Approval --------------------------------------------------------

export type ApprovalStatus =
  | "requested"
  | "approved"
  | "rejected"
  | "expired"
  | "canceled";

/**
 * Human authorization, recorded separately from task completion
 * (CORE_OBJECT_MODEL §3.21). Promoting a proposal, sharing a report, or
 * changing configuration each produce an Approval.
 */
export interface Approval {
  id: string;
  workspace_id: string;
  organization_id?: string;
  approval_type: string;
  status: ApprovalStatus;
  requested_by?: string | null;
  approved_by?: string | null;
  related_input_id?: string | null;
  related_work_item_id?: string | null;
  related_decision_id?: string | null;
  related_agent_proposal_id?: string | null;
  approval_notes?: string | null;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at?: string;
}

// --- §3.24 Metric ----------------------------------------------------------

export type MetricType =
  | "execution"
  | "evidence"
  | "data_quality"
  | "agent"
  | "financial"
  | "operational"
  | "risk"
  | "readiness"
  | "outcome"
  | "roi";

/**
 * A measured value derived from real system activity (work, inputs, evidence,
 * events, entities, outcomes). Tied to activity, never a vanity dashboard.
 */
export interface Metric {
  id: string;
  workspace_id: string;
  organization_id?: string;
  metric_name: string;
  metric_value: number;
  metric_type?: MetricType;
  measured_at: string;
  related_entity_id?: string | null;
  related_workflow_id?: string | null;
  related_report_id?: string | null;
  calculation_method?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

// --- §3.26 Dashboard -------------------------------------------------------

/** A visual operating view composed of widgets; shows the loop's real state. */
export interface Dashboard {
  id: string;
  workspace_id: string;
  organization_id?: string;
  name: string;
  status: LifecycleStatus;
  dashboard_type?: string;
  widget_config?: Record<string, unknown>[];
  visibility_rules?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at?: string;
}

// --- §3.27 Outcome ---------------------------------------------------------

/**
 * The result the system is trying to improve/measure — connects work to value.
 * Distinct from {@link OutcomeOutput}, which is an emitted external artifact.
 */
export interface Outcome {
  id: string;
  workspace_id: string;
  organization_id?: string;
  outcome_type: string;
  name: string;
  status: LifecycleStatus;
  description?: string;
  related_workflow_id?: string | null;
  related_metric_ids?: string[];
  target_value?: number | null;
  actual_value?: number | null;
  value_category?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at?: string;

  // --- ROI linkage (ROI_AND_IMPACT_MODEL §5, §8, §9) — all additive ---------
  /**
   * Stable join to computed Metrics by `metric_name` (NOT id: auto metric rows
   * are regenerated on every recompute, so names are the durable key). When set,
   * the outcome's `actual_value` can be DERIVED from the linked metric's latest
   * value (observed), and the outcome panel shows value-vs-target with a trend.
   * The first name is treated as the outcome's primary metric. Cartridges supply
   * these names via configuration; the core stays cartridge-blind.
   */
  related_metric_names?: string[];
  /**
   * Baseline measurement (§8). The "before" the loop is improving against, so
   * progress reads from baseline → target rather than 0 → target.
   */
  baseline_value?: number | null;
  /**
   * Estimation discipline (§9): how the `actual_value` was established.
   * `observed` = derived directly from system metrics; `estimated` = computed
   * from assumptions (manual estimate_impact); `hypothesized` = expected but not
   * yet measured. Never present hypothesized value as observed ROI.
   */
  confidence?: "observed" | "estimated" | "hypothesized";
  /** True when lower metric values are better (e.g. callbacks, blocked jobs). */
  lower_is_better?: boolean;
}
