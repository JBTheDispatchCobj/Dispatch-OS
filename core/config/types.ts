// core/config/types.ts
//
// The Configuration layer — config-as-data (CONFIGURATION_RULES.md).
//
// Dispatch OS is "generic at the primitive level, specific at the configuration
// level." The runtime primitives live in core/types.ts (the grammar).
// Configuration is the VOCABULARY: what a business calls things, what entities
// exist, what workflows run, what rules apply, what evidence is required, what
// metrics matter, what agents may do, what outcomes count.
//
// A *packaged configuration* is a reusable bundle of these definitions that the
// core installs into a workspace — what we previously hardcoded as a
// "cartridge." Per CONFIGURATION_RULES §9: packaged configuration is installed
// INTO the core; it does not BECOME the core. So these are plain data shapes,
// declared by a package and read by the engine — never imported by core logic.

import type {
  ChecklistTemplate,
  ConfigurationStatus,
  EntityType,
  ReportDefinition,
  RiskLevel,
  RoleKey,
  RuleType,
  MetricType,
} from "@/core/types";

// ---------------------------------------------------------------------------
// §5.1 Vocabulary — business-specific language, applied to UI/report labels
// without changing the core object model.
// ---------------------------------------------------------------------------

export interface Vocabulary {
  /** What this business calls a generic primitive, e.g. work_item -> "turn". */
  terms: Record<string, string>;
  /** Optional status-label overrides, e.g. { completed: "Cleaned" }. */
  statusLabels?: Record<string, string>;
}

// ---------------------------------------------------------------------------
// §5.3 Input Types / §5.4 Source Types
// ---------------------------------------------------------------------------

export interface InputTypeConfig {
  key: string;
  label: string;
  /** How the raw artifact is parsed, e.g. "csv" | "pdf" | "none". */
  parsing_method?: string;
  /** Possible work-item kinds this input can convert into. */
  converts_to?: string[];
  review_required?: boolean;
}

export interface SourceTypeConfig {
  key: string;
  label: string;
  /** "manual_upload" | "email" | "api" | "mcp_connector" | "csv_export" | ... */
  source_type: string;
  sync_frequency?: string;
  reliability_default?: number;
  requires_human_review?: boolean;
}

// ---------------------------------------------------------------------------
// §5.5 Workflows / §5.6 Work Item Types — process templates as data
// ---------------------------------------------------------------------------

export interface WorkflowConfig {
  /** "<package_key>:<slug>" — the work-item `kind` instances carry. */
  kind: string;
  label: string;
  description: string;
  /** Checklist template auto-attached on work-item creation. */
  defaultChecklistKey?: string;
  defaultOwnerRole?: RoleKey;
  defaultPriority?: "low" | "medium" | "high";
  /** Evidence requirement keys that must be satisfied to complete. */
  evidenceRequirements?: string[];
  approvalRequired?: boolean;
  /** Automation maturity 0..5 (AGENT_AND_AUTOMATION_RULES §18). Start low. */
  automationLevel?: 0 | 1 | 2 | 3 | 4 | 5;
  expectedOutcome?: string;
  valueCategory?: string;
}

// ---------------------------------------------------------------------------
// §5.8 Evidence Requirements / §5.9 Approval Rules
// ---------------------------------------------------------------------------

export interface EvidenceRequirement {
  key: string;
  label: string;
  /** "document" | "note" | "photo" | "approval" | "source_record" | ... */
  evidence_type: string;
  required: boolean;
  applies_to_kind?: string;
}

export interface ApprovalRule {
  key: string;
  /** What requires approval, e.g. "proposal" | "report_share" | "config_change". */
  applies_to: string;
  approver_role: RoleKey;
  /** Risk at/above which human approval is mandatory. */
  min_risk_level?: RiskLevel;
  expiration_hours?: number;
}

// ---------------------------------------------------------------------------
// §5.10 Automation Keys — configurable triggers for the operating loop
// ---------------------------------------------------------------------------

export interface AutomationKey {
  key: string;
  label: string;
  /** "new_input" | "field_missing" | "stale_status" | "threshold_exceeded" ... */
  trigger: string;
  condition: string;
  /** What it produces, e.g. a proposal kind or rule reference. */
  action: string;
  /** Which agent/rule may act on it. */
  allowed_agent?: AgentRoleKey;
  confidence_threshold?: number;
  approval_required?: boolean;
  risk_level?: RiskLevel;
  fallback?: string;
}

// ---------------------------------------------------------------------------
// §5.11 Metrics / §5.15 Outcomes — measured from real activity
// ---------------------------------------------------------------------------

export interface MetricDefinition {
  key: string;
  label: string;
  metric_type: MetricType;
  description?: string;
  /** Plain description of how it's computed from events/work/evidence. */
  calculation_method?: string;
  target?: number;
}

export interface OutcomeDefinition {
  key: string;
  label: string;
  outcome_type: string;
  value_category: string;
  related_workflow_kinds?: string[];
  related_metric_keys?: string[];
  measurement_method?: string;
}

// ---------------------------------------------------------------------------
// §5.13 Dashboards
// ---------------------------------------------------------------------------

export interface DashboardConfig {
  key: string;
  label: string;
  audience?: RoleKey;
  /** Widget descriptors — composed views over loop state. */
  widgets: { type: string; label: string; metric_key?: string; filter?: string }[];
}

// ---------------------------------------------------------------------------
// §5.14 Agent Instructions — what agents may read/infer/propose/do
// (AGENT_AND_AUTOMATION_RULES §4 roles, §15 permissions)
// ---------------------------------------------------------------------------

export type AgentRoleKey =
  | "intake"
  | "context"
  | "work"
  | "evidence"
  | "report"
  | "roi";

export interface AgentInstruction {
  role: AgentRoleKey;
  purpose: string;
  /** Named, versioned prompt reference — never an inline string. */
  prompt_reference: string;
  allowed_sources?: string[];
  forbidden_sources?: string[];
  allowed_outputs?: string[];
  confidence_threshold?: number;
  human_review_required?: boolean;
  max_cost_estimate?: number;
}

// ---------------------------------------------------------------------------
// Declarative interpretation rule (description-level). The structured Rule
// runtime record lives in core/types.ts; this is the package-authored seed.
// ---------------------------------------------------------------------------

export interface RuleConfig {
  key: string;
  label: string;
  rule_type?: RuleType;
  /** Plain-language trigger condition. */
  when: string;
  /** What the rule proposes when it fires. */
  produces: string;
  severity: "info" | "warn" | "critical";
  requires_human_approval?: boolean;
}

// ---------------------------------------------------------------------------
// EXECUTABLE generation rules — the rules SYSTEM (replicates the Dispatch beta's
// lib/orchestration/rules + interpret + dispatch architecture, generalized).
//
// `RuleConfig` above is description-level metadata. A `GenerationRule` is the
// executable form the engine RUNS: it listens for an input trigger, optionally
// guards on a generic condition over the input payload, and emits a dry-run
// WorkItemProposal (the OS analogue of the beta's TaskDraft). Rules are data,
// authored by a package; core/engine/rules.ts evaluates them and stays blind to
// the vertical. Columns mirror the field-service rules table (trigger ->
// automation key -> action -> work-item type -> priority -> impact -> evidence
// -> review -> metric -> feedback), but every field here is industry-agnostic.
// ---------------------------------------------------------------------------

export interface GenerationRule {
  /** Stable rule id, e.g. "FSR-001" or "<pkg>:new_web_lead". */
  id: string;
  /** Human-readable summary (the rules-table "Trigger Condition"/intent). */
  description: string;
  trigger: {
    /** Input type this rule listens for — the OS analogue of event_type. */
    input_type?: string;
    /**
     * Optional generic guard over the input's payload/extracted_fields/parsed
     * content, e.g. "urgency=same_day" or "tier in high|critical". AND-joined
     * with "&". Same mini-grammar the widget filter parser uses. Omitted = always.
     */
    match?: string;
  };
  output: {
    /** The work-item `kind` the proposed draft would instantiate. */
    work_item_kind: string;
    /** Optional title template; `{field}` tokens read from the input payload. */
    title?: string;
    /** Proposal type (default "work_item"). */
    proposal_type?: string;
  };
  /** Beta priority + the rules-table "Critical"; mapped to low/medium/high downstream. */
  priority?: "low" | "medium" | "high" | "critical";
  /** Rules-table "Impact Area" (e.g. "Revenue Protection", "Cash Acceleration"). */
  impact_area?: string;
  /** ROI value bucket the produced work serves (links to OutcomeDefinition). */
  value_category?: string;
  /** Metric names this rule's work moves (rules-table "Metric Updated"). */
  metric_updated?: string[];
  /** Evidence the produced work expects (rules-table "Evidence Required"). */
  evidence_required?: string[];
  /** Who must review before promotion (rules-table "Human Review Level"). */
  review_role?: RoleKey;
  /** Payload field paths copied onto the proposal context (beta context_to_attach). */
  context_to_attach?: string[];
  /** Links to a configured AutomationKey (rules-table "Automation Key"). */
  automation_key?: string;
  risk_level?: RiskLevel;
  requires_human_approval?: boolean;
  /** Repeat/Deviate/Innovate guidance (rules-table feedback loop). */
  feedback?: string;
}

export interface KnowledgeObject {
  key: string;
  title: string;
  /** Markdown body — seeds a versioned ContextObject when installed. */
  body: string;
  context_type?: string;
}

// ---------------------------------------------------------------------------
// The packaged configuration itself (CONFIGURATION_RULES §4.4, §9).
// ---------------------------------------------------------------------------

import type { SeedBundle } from "@/core/data/store";

export interface PackagedConfiguration {
  /** Stable package key, e.g. "wealth". Becomes the workspace cartridge_key. */
  key: string;
  label: string;
  description: string;
  /** Versioned; never overwritten in place (CONFIGURATION_RULES §6). */
  version: number;
  status: ConfigurationStatus;

  // --- Configuration components (all optional except the proven core ones) --
  vocabulary?: Vocabulary;
  entityTypes: EntityType[];
  inputTypes?: InputTypeConfig[];
  sourceTypes?: SourceTypeConfig[];
  workflows: WorkflowConfig[];
  checklistTemplates: ChecklistTemplate[];
  evidenceRequirements?: EvidenceRequirement[];
  approvalRules?: ApprovalRule[];
  automationKeys?: AutomationKey[];
  rules: RuleConfig[];
  /** Executable generation rules — the rules SYSTEM the engine runs on inputs. */
  generationRules?: GenerationRule[];
  metrics?: MetricDefinition[];
  reports: ReportDefinition[];
  dashboards?: DashboardConfig[];
  agentInstructions?: AgentInstruction[];
  outcomes?: OutcomeDefinition[];
  knowledge: KnowledgeObject[];

  /** Optional demo fixtures installed when a workspace adopts this package. */
  seed?: (workspaceId: string) => SeedBundle;
}
