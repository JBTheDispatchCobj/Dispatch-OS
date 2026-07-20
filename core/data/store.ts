// core/data/store.ts
//
// The data boundary. The UI talks ONLY to a DataStore — never to fixtures or
// a DB client directly. Today the default implementation is in-memory
// (zero backend, zero cost). A Supabase-backed implementation drops in later
// behind the same interface (see core/data/supabase-adapter.ts stub).

import type {
  AgentAction,
  AgentRun,
  Approval,
  ChecklistItem,
  Configuration,
  ContextObject,
  Dashboard,
  Decision,
  DocumentRef,
  Entity,
  EvidenceItem,
  EvidenceKind,
  InboundEvent,
  InputStatus,
  Metric,
  Note,
  OperatingEvent,
  Organization,
  Outcome,
  ReportRun,
  ReportRunStatus,
  Source,
  UserProfile,
  WorkItem,
  WorkItemEvent,
  WorkItemEventType,
  WorkItemProposal,
  WorkItemStatus,
  Workspace,
} from "@/core/types";
import { getConfiguration } from "@/core/cartridge";
import { computeMetrics } from "@/core/engine/metrics";
import { buildReportRun } from "@/core/engine/report";
import { interpretCsvUpload } from "@/core/engine/ingest";
import { dispatchInput, type DispatchResult } from "@/core/engine/rules";

/**
 * What a cartridge contributes to a freshly-seeded workspace.
 *
 * The first block is the v0 proven set. The second block is the additive
 * "new primitives" set (CORE_OBJECT_MODEL §3.5/§3.7/§3.10/§3.20/§3.21/§3.24/
 * §3.26/§3.27). All new fields default to [] in {@link emptyBundle}, so a
 * cartridge that only sets the original fields keeps working unchanged.
 */
export interface SeedBundle {
  entities: Entity[];
  workItems: WorkItem[];
  checklistItems: ChecklistItem[];
  notes: Note[];
  evidence: EvidenceItem[];
  documents: DocumentRef[];
  inboundEvents: InboundEvent[];
  agentRuns: AgentRun[];
  agentActions: AgentAction[];
  proposals: WorkItemProposal[];
  // --- New primitives (all additive) --------------------------------------
  sources: Source[];
  contextObjects: ContextObject[];
  decisions: Decision[];
  approvals: Approval[];
  metrics: Metric[];
  dashboards: Dashboard[];
  outcomes: Outcome[];
  reports: ReportRun[];
}

export function emptyBundle(): SeedBundle {
  return {
    entities: [], workItems: [], checklistItems: [], notes: [], evidence: [],
    documents: [], inboundEvents: [], agentRuns: [], agentActions: [], proposals: [],
    sources: [], contextObjects: [], decisions: [], approvals: [], metrics: [],
    dashboards: [], outcomes: [], reports: [],
  };
}

/** The full in-memory database shape. */
export interface Db {
  orgs: Organization[];
  workspaces: Workspace[];
  users: UserProfile[];
  entities: Entity[];
  workItems: WorkItem[];
  events: WorkItemEvent[];
  /** Generic workspace-scoped audit trail for non-work-item actions (§3.16). */
  activity: OperatingEvent[];
  checklistItems: ChecklistItem[];
  notes: Note[];
  evidence: EvidenceItem[];
  documents: DocumentRef[];
  inboundEvents: InboundEvent[];
  agentRuns: AgentRun[];
  agentActions: AgentAction[];
  proposals: WorkItemProposal[];
  // --- New primitives ------------------------------------------------------
  sources: Source[];
  /** Governed configuration envelopes (the active config per workspace). */
  configurations: Configuration[];
  contextObjects: ContextObject[];
  decisions: Decision[];
  approvals: Approval[];
  metrics: Metric[];
  dashboards: Dashboard[];
  outcomes: Outcome[];
  reports: ReportRun[];
}

const now = () => new Date().toISOString();
const rid = (p: string) => `${p}_${Math.random().toString(36).slice(2, 10)}`;

export interface DataStore {
  getOrg(): Organization;
  listWorkspaces(): Workspace[];
  getWorkspace(id: string): Workspace | undefined;
  /** All users in the org (assignment candidates). */
  listUsers(): UserProfile[];

  listWorkItems(workspaceId: string): WorkItem[];
  getWorkItem(id: string): WorkItem | undefined;
  setStatus(id: string, status: WorkItemStatus, actor: string): WorkItem | undefined;
  /** Assign (or reassign) a work item to a user; logs an `assigned` event (§5.3). */
  assignWorkItem(id: string, userId: string, userName: string, actor: string): WorkItem | undefined;
  /** Raise priority to high + log an `escalated` event (exception_panel §5.10). */
  escalateWorkItem(id: string, actor: string): WorkItem | undefined;
  /** Create a follow-up work item linked to a parent (exception_panel §5.10). */
  createFollowUpWorkItem(fromWorkItemId: string, actor: string): WorkItem | undefined;
  /** Suppress a derived exception kind for a work item (exception_panel dismiss). */
  dismissException(workItemId: string, kind: string, actor: string): WorkItem | undefined;

  listChecklist(workItemId: string): ChecklistItem[];
  toggleChecklist(itemId: string, done: boolean, actor: string): void;

  listNotes(workItemId: string): Note[];
  addNote(workItemId: string, authorId: string, authorName: string, body: string): Note;

  listEvidence(workItemId: string): EvidenceItem[];
  getEvidence(id: string): EvidenceItem | undefined;
  /** Add a typed evidence item to a work item; logs `evidence_added` (§5.6). */
  addEvidence(
    workItemId: string,
    input: { kind: EvidenceKind; label: string; value?: Record<string, unknown>; documentId?: string | null },
    capturedBy: string,
  ): EvidenceItem | undefined;
  /** Human review of proof, separate from capture; logs `evidence_reviewed`. */
  reviewEvidence(evidenceId: string, decision: "approved" | "rejected", actor: string): EvidenceItem | undefined;

  listEvents(workItemId: string): WorkItemEvent[];
  /** Generic workspace audit trail (§3.16) for non-work-item actions. */
  listActivity(workspaceId: string): OperatingEvent[];

  reviewQueue(workspaceId: string): WorkItem[];
  listProposals(workspaceId: string): WorkItemProposal[];
  decideProposal(id: string, decision: "approved" | "rejected", reviewer: string): void;
  promoteProposal(id: string, reviewer: string): WorkItem | undefined;

  listInboundEvents(workspaceId: string): InboundEvent[];
  listInputs(workspaceId: string): InboundEvent[];
  getInput(id: string): InboundEvent | undefined;
  /** Transition an input through its staging state machine; logs activity (§3.6). */
  setInputStatus(inputId: string, status: InputStatus, actor: string): InboundEvent | undefined;
  /** Convert a staged input into a real work item; logs `created` + activity. */
  createWorkItemFromInput(inputId: string, actor: string): WorkItem | undefined;
  listAgentRuns(workspaceId: string): AgentRun[];
  listAgentActions(runId: string): AgentAction[];

  // --- New primitives: reads ----------------------------------------------
  getActiveConfigurationRecord(workspaceId: string): Configuration | undefined;
  listSources(workspaceId: string): Source[];
  listContextObjects(workspaceId: string): ContextObject[];
  listDecisions(workspaceId: string): Decision[];
  listApprovals(workspaceId: string): Approval[];
  listMetrics(workspaceId: string): Metric[];
  /** Latest metric row per metric_name (auto rows are append-only history). */
  listLatestMetrics(workspaceId: string): Metric[];
  /** Full append-only history for one metric_name, ascending by measured_at. */
  metricHistory(workspaceId: string, metricName: string): Metric[];
  listDashboards(workspaceId: string): Dashboard[];
  listOutcomes(workspaceId: string): Outcome[];
  listReports(workspaceId: string): ReportRun[];
  getReport(id: string): ReportRun | undefined;

  // --- Build chases: loop mutations ---------------------------------------
  /**
   * Ingest a CSV upload as raw Input (staging), run a dry-run intake AgentRun,
   * and emit human-review Proposals. Generic + config-driven — the engine
   * never names a vertical (see core/engine/ingest.ts).
   */
  ingestCsv(
    workspaceId: string,
    filename: string,
    csvText: string,
    opts?: { inputType?: string; sourceId?: string },
  ): { input: InboundEvent; run: AgentRun; proposals: WorkItemProposal[] };
  /**
   * Run the package's generation rules over a staged Input — the rules SYSTEM
   * (core/engine/rules.ts), replicating the Dispatch beta's dispatch(). Persists
   * one dry-run AgentRun + an action per fired rule + the resulting Proposals,
   * and logs activity. Nothing becomes a work item without a human promote.
   */
  dispatchInput(inputId: string, actor: string): DispatchResult | undefined;
  /** Build a report instance from APPROVED evidence + metrics (§3.25). */
  generateReport(workspaceId: string, reportKey: string, actor: string): ReportRun | undefined;
  /**
   * Recompute universal metrics from real activity. Append-only: a fresh row per
   * metric is inserted with the current `measured_at`, preserving history so a
   * trend is real (CORE_OBJECT_MODEL §3.24, HANDOFF "metrics are append-only").
   */
  recomputeMetrics(workspaceId: string): Metric[];
  /**
   * Recompute outcome `actual_value` from each outcome's linked metric (ROI
   * §8/§9). Metric-linked outcomes become `observed`; unlinked ones are left to
   * the manual estimate path. Logs an activity event per derived outcome.
   */
  recomputeOutcomes(workspaceId: string): Outcome[];

  // --- Report lifecycle + approvals (report_list §5.12 / approval_queue §5.9) -
  /** Set a report's lifecycle status (e.g. archive); logs activity (§3.25). */
  setReportStatus(reportId: string, status: ReportRunStatus, actor: string): ReportRun | undefined;
  /**
   * Request external sharing of a report. Moves the report to `under_review` and
   * raises a `requested` Approval (§3.21): sharing is high-risk and gated to
   * owner/admin via decideApproval. Logs activity.
   */
  requestReportShare(reportId: string, actor: string): Approval | undefined;
  /** Record that a report was exported (no status change in-memory); logs activity. */
  exportReport(reportId: string, actor: string): ReportRun | undefined;
  /**
   * Decide a pending (`requested`) Approval — the human-in-the-loop gate (§3.21).
   * `changes_requested` keeps it pending but records the ask. When the approval
   * is a report-sharing request, approval flips the report to `shared`.
   */
  decideApproval(
    approvalId: string,
    decision: "approved" | "rejected" | "changes_requested",
    actor: string,
    notes?: string,
  ): Approval | undefined;

  // --- Outcomes (outcome_panel §5.13) -------------------------------------
  getOutcome(id: string): Outcome | undefined;
  /** Assign a value category to an outcome (ROI bucket); logs activity. */
  setOutcomeValueCategory(outcomeId: string, valueCategory: string, actor: string): Outcome | undefined;
  /** Record an estimated/actual impact value for an outcome; logs activity. */
  setOutcomeActual(outcomeId: string, actualValue: number, actor: string): Outcome | undefined;
}

export class InMemoryStore implements DataStore {
  constructor(private db: Db) {}

  private logEvent(workItemId: string, type: WorkItemEventType, actor: string, detail: Record<string, unknown>) {
    this.db.events.push({
      id: rid("evt"), work_item_id: workItemId, type, actor, detail,
      schema_version: 1, created_at: now(),
    });
  }

  /** Append a generic, workspace-scoped audit record (§3.16) for non-work-item
   *  actions. Append-only; mirrors logEvent for the broader object graph. */
  private logActivity(
    workspaceId: string,
    eventType: string,
    actor: string,
    refs: Partial<Omit<OperatingEvent, "id" | "workspace_id" | "event_type" | "actor" | "schema_version" | "occurred_at" | "created_at">> = {},
  ) {
    const ts = now();
    this.db.activity.push({
      id: rid("act"), workspace_id: workspaceId, event_type: eventType, actor,
      schema_version: 1, occurred_at: ts, created_at: ts, ...refs,
    });
  }

  getOrg() { return this.db.orgs[0]; }
  listWorkspaces() { return this.db.workspaces; }
  getWorkspace(id: string) { return this.db.workspaces.find((w) => w.id === id); }
  listUsers() { return this.db.users; }
  listActivity(workspaceId: string) {
    return this.db.activity
      .filter((a) => a.workspace_id === workspaceId)
      .sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
  }

  listWorkItems(workspaceId: string) {
    return this.db.workItems.filter((w) => w.workspace_id === workspaceId);
  }
  getWorkItem(id: string) { return this.db.workItems.find((w) => w.id === id); }

  setStatus(id: string, status: WorkItemStatus, actor: string) {
    const w = this.getWorkItem(id);
    if (!w) return undefined;
    const from = w.status;
    w.status = status;
    if (status === "in_progress" && !w.started_at) w.started_at = now();
    if (status === "completed") w.completed_at = now();
    this.logEvent(id, "status_changed", actor, { from, to: status });
    return w;
  }

  assignWorkItem(id: string, userId: string, userName: string, actor: string) {
    const w = this.getWorkItem(id);
    if (!w) return undefined;
    const from = w.assignee_id;
    w.assignee_id = userId;
    w.assignee_name = userName;
    // First assignment moves an untouched item into the assigned lane.
    if (w.status === "open" || w.status === "proposed") w.status = "assigned";
    this.logEvent(id, "assigned", actor, { from, to: userId, assignee_name: userName });
    return w;
  }

  escalateWorkItem(id: string, actor: string) {
    const w = this.getWorkItem(id);
    if (!w) return undefined;
    const from = w.priority;
    w.priority = "high";
    this.logEvent(id, "escalated", actor, { from_priority: from, to_priority: "high" });
    return w;
  }

  createFollowUpWorkItem(fromWorkItemId: string, actor: string) {
    const parent = this.getWorkItem(fromWorkItemId);
    if (!parent) return undefined;
    const ts = now();
    const w: WorkItem = {
      id: rid("wi"), workspace_id: parent.workspace_id, kind: parent.kind,
      title: `Follow-up: ${parent.title}`, status: "open", priority: parent.priority,
      source: "manual", entity_id: parent.entity_id, assignee_id: null, assignee_name: null,
      context: {}, created_at: ts, started_at: null, completed_at: null,
      parent_work_item_id: parent.id,
    };
    this.db.workItems.push(w);
    this.logEvent(w.id, "created", actor, { via: "exception_follow_up", parent_work_item_id: parent.id });
    return w;
  }

  dismissException(workItemId: string, kind: string, actor: string) {
    const w = this.getWorkItem(workItemId);
    if (!w) return undefined;
    const md = (w.metadata ?? {}) as Record<string, unknown>;
    const dismissed = new Set([...(Array.isArray(md.dismissed_exceptions) ? (md.dismissed_exceptions as string[]) : []), kind]);
    w.metadata = { ...md, dismissed_exceptions: [...dismissed] };
    this.logEvent(workItemId, "exception_dismissed", actor, { kind });
    return w;
  }

  listChecklist(workItemId: string) {
    return this.db.checklistItems
      .filter((c) => c.work_item_id === workItemId)
      .sort((a, b) => a.sort_order - b.sort_order);
  }
  toggleChecklist(itemId: string, done: boolean, actor: string) {
    const item = this.db.checklistItems.find((c) => c.id === itemId);
    if (!item) return;
    item.done = done;
    item.done_at = done ? now() : null;
    this.logEvent(item.work_item_id, done ? "checklist_checked" : "checklist_unchecked", actor, { title: item.title });
  }

  listNotes(workItemId: string) {
    return this.db.notes
      .filter((n) => n.work_item_id === workItemId)
      .sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
  }
  addNote(workItemId: string, authorId: string, authorName: string, body: string) {
    const n: Note = { id: rid("note"), work_item_id: workItemId, author_id: authorId, author_name: authorName, body, created_at: now() };
    this.db.notes.push(n);
    this.logEvent(workItemId, "note_added", `user:${authorId}`, { body });
    return n;
  }

  listEvidence(workItemId: string) {
    return this.db.evidence.filter((e) => e.work_item_id === workItemId);
  }
  getEvidence(id: string) { return this.db.evidence.find((e) => e.id === id); }

  addEvidence(
    workItemId: string,
    input: { kind: EvidenceKind; label: string; value?: Record<string, unknown>; documentId?: string | null },
    capturedBy: string,
  ) {
    const w = this.getWorkItem(workItemId);
    if (!w) return undefined;
    const e: EvidenceItem = {
      id: rid("ev"), work_item_id: workItemId, kind: input.kind, label: input.label,
      value: input.value ?? {}, document_id: input.documentId ?? null,
      captured_by: capturedBy, created_at: now(), review_status: "pending",
    };
    this.db.evidence.push(e);
    this.logEvent(workItemId, "evidence_added", capturedBy, { evidence_id: e.id, kind: e.kind, label: e.label });
    return e;
  }

  reviewEvidence(evidenceId: string, decision: "approved" | "rejected", actor: string) {
    const e = this.getEvidence(evidenceId);
    if (!e) return undefined;
    e.review_status = decision;
    e.reviewed_by = actor;
    e.reviewed_at = now();
    this.logEvent(e.work_item_id, "evidence_reviewed", actor, { evidence_id: e.id, decision });
    return e;
  }

  listEvents(workItemId: string) {
    return this.db.events
      .filter((e) => e.work_item_id === workItemId)
      .sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
  }

  reviewQueue(workspaceId: string) {
    return this.db.workItems.filter((w) => w.workspace_id === workspaceId && w.status === "awaiting_review");
  }

  listProposals(workspaceId: string) {
    return this.db.proposals.filter((p) => p.workspace_id === workspaceId);
  }
  decideProposal(id: string, decision: "approved" | "rejected", reviewer: string) {
    const p = this.db.proposals.find((x) => x.id === id);
    if (!p || p.status !== "pending") return;
    p.status = decision;
    p.reviewed_by = reviewer;
    p.reviewed_at = now();
  }
  /**
   * The human-in-the-loop gate. Promoting a proposal is a HUMAN action that
   * makes agent output real. Per CORE_OBJECT_MODEL §3.20/§3.21 this records
   * BOTH a Decision (the selected action + rationale) and an Approval (the
   * human authorization), kept separate from work completion, so the loop
   * reads: propose -> decide -> approve -> work.
   */
  promoteProposal(id: string, reviewer: string) {
    const p = this.db.proposals.find((x) => x.id === id);
    if (!p) return undefined;
    if (p.status === "pending") this.decideProposal(id, "approved", reviewer);
    if (p.status === "promoted") return this.getWorkItem(p.promoted_work_item_id ?? "");
    const ts = now();
    const w: WorkItem = {
      id: rid("wi"), workspace_id: p.workspace_id, kind: p.proposed.kind,
      title: p.proposed.title, status: "open", priority: p.proposed.priority,
      source: "agent", entity_id: p.proposed.entity_id, assignee_id: null,
      assignee_name: null, context: p.proposed.context, created_at: ts,
      started_at: null, completed_at: null,
      source_input_id: (p.proposed.context?.source_input_id as string | undefined) ?? null,
    };
    this.db.workItems.push(w);
    p.status = "promoted";
    p.promoted_work_item_id = w.id;

    // Auto-attach evidence requirements (HANDOFF 1c): a rule-fired proposal carries
    // context.evidence_required (set by core/engine/rules.ts). On promote, resolve
    // those keys against the package's evidenceRequirements and seed concrete
    // checklist items on the new work item so the required proof is actionable at
    // closeout. Cartridge-blind: keys + labels come from configuration, never
    // hardcoded here. Unknown keys fall back to the raw key as the label.
    const seededRequirements: string[] = [];
    const evReqKeys = Array.isArray(w.context?.evidence_required)
      ? (w.context!.evidence_required as unknown[]).filter((k): k is string => typeof k === "string")
      : [];
    if (evReqKeys.length) {
      const ws = this.getWorkspace(w.workspace_id);
      const cfg = ws ? getConfiguration(ws.cartridge_key) : undefined;
      const reqs = cfg?.evidenceRequirements ?? [];
      let order = this.listChecklist(w.id).length;
      for (const key of evReqKeys) {
        const def = reqs.find((r) => r.key === key);
        this.db.checklistItems.push({
          id: rid("ci"), work_item_id: w.id,
          title: `Provide ${(def?.label ?? key).toLowerCase()}`, sort_order: ++order,
          done: false, done_at: null,
        });
        seededRequirements.push(key);
      }
    }

    // Decision (§3.20): the selected response, with rationale + provenance.
    const decision: Decision = {
      id: rid("dec"), workspace_id: p.workspace_id, decision_type: "promote_proposal",
      status: "executed", related_work_item_id: w.id, agent_proposal_id: p.id,
      source_input_id: w.source_input_id ?? null,
      decision_summary: `Promote proposal "${p.title ?? p.proposed.title}" into a work item`,
      selected_action: "create_work_item", rationale: p.rationale,
      decided_by: `user:${reviewer}`, created_at: ts, updated_at: ts,
    };
    this.db.decisions.push(decision);

    // Approval (§3.21): human authorization, separate from task completion.
    const approval: Approval = {
      id: rid("appr"), workspace_id: p.workspace_id, approval_type: "proposal_promotion",
      status: "approved", approved_by: `user:${reviewer}`, related_work_item_id: w.id,
      related_decision_id: decision.id, related_agent_proposal_id: p.id,
      approval_notes: p.review_notes ?? null, created_at: ts, updated_at: ts,
    };
    this.db.approvals.push(approval);

    this.logEvent(w.id, "created", `user:${reviewer}`, { via: "proposal_promote", proposal_id: p.id });
    this.logEvent(w.id, "proposal_promoted", `user:${reviewer}`, {
      proposal_id: p.id, decision_id: decision.id, approval_id: approval.id,
      ...(seededRequirements.length ? { seeded_evidence_requirements: seededRequirements } : {}),
    });
    return w;
  }

  listInboundEvents(workspaceId: string) {
    return this.db.inboundEvents.filter((e) => e.workspace_id === workspaceId);
  }
  /** Alias — Inputs are the §3.6 name for inbound events. */
  listInputs(workspaceId: string) { return this.listInboundEvents(workspaceId); }
  getInput(id: string) { return this.db.inboundEvents.find((e) => e.id === id); }

  setInputStatus(inputId: string, status: InputStatus, actor: string) {
    const input = this.getInput(inputId);
    if (!input) return undefined;
    const from = input.status;
    input.status = status;
    input.updated_at = now();
    this.logActivity(input.workspace_id, "input_status_changed", actor, {
      related_input_id: input.id, payload: { from, to: status },
    });
    return input;
  }

  createWorkItemFromInput(inputId: string, actor: string) {
    const input = this.getInput(inputId);
    if (!input) return undefined;
    const ws = this.getWorkspace(input.workspace_id);
    const cfg = ws ? getConfiguration(ws.cartridge_key) : undefined;
    // Cartridge-blind kind: prefer what this input is configured to convert to,
    // else the configuration's first workflow, else a generic intake kind.
    const inputTypeDef = cfg?.inputTypes?.find((t) => t.key === input.input_type);
    const kind =
      inputTypeDef?.converts_to?.[0] ??
      cfg?.workflows?.[0]?.kind ??
      `${ws?.cartridge_key ?? "core"}:intake_review`;
    const ts = now();
    const w: WorkItem = {
      id: rid("wi"), workspace_id: input.workspace_id, kind,
      title: `Review input: ${input.input_type ?? input.source}`, status: "open",
      priority: "medium", source: "inbound", entity_id: null, assignee_id: null,
      assignee_name: null, context: {}, created_at: ts, started_at: null,
      completed_at: null, source_input_id: input.id,
    };
    this.db.workItems.push(w);
    input.status = "converted";
    input.updated_at = ts;
    this.logEvent(w.id, "created", actor, { via: "input_conversion", source_input_id: input.id });
    this.logActivity(input.workspace_id, "input_converted", actor, {
      related_input_id: input.id, related_work_item_id: w.id,
    });
    return w;
  }

  listAgentRuns(workspaceId: string) {
    return this.db.agentRuns.filter((r) => r.workspace_id === workspaceId);
  }
  listAgentActions(runId: string) {
    return this.db.agentActions.filter((a) => a.agent_run_id === runId);
  }

  // --- New primitives: reads ----------------------------------------------
  getActiveConfigurationRecord(workspaceId: string) {
    return this.db.configurations.find((c) => c.workspace_id === workspaceId && c.status === "active");
  }
  listSources(workspaceId: string) { return this.db.sources.filter((s) => s.workspace_id === workspaceId); }
  listContextObjects(workspaceId: string) { return this.db.contextObjects.filter((c) => c.workspace_id === workspaceId); }
  listDecisions(workspaceId: string) {
    return this.db.decisions.filter((d) => d.workspace_id === workspaceId).sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
  }
  listApprovals(workspaceId: string) {
    return this.db.approvals.filter((a) => a.workspace_id === workspaceId).sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
  }
  listMetrics(workspaceId: string) {
    return this.db.metrics.filter((m) => m.workspace_id === workspaceId);
  }
  /**
   * Collapse the append-only metric history to the latest row per metric_name.
   * Tiles, panels, and reports read "current" through here; ROI trend reads the
   * full history via {@link metricHistory}.
   */
  listLatestMetrics(workspaceId: string) {
    const latest = new Map<string, Metric>();
    for (const m of this.listMetrics(workspaceId)) {
      const prev = latest.get(m.metric_name);
      if (!prev || prev.measured_at < m.measured_at) latest.set(m.metric_name, m);
    }
    return [...latest.values()];
  }
  metricHistory(workspaceId: string, metricName: string) {
    return this.listMetrics(workspaceId)
      .filter((m) => m.metric_name === metricName)
      .sort((a, b) => (a.measured_at < b.measured_at ? -1 : a.measured_at > b.measured_at ? 1 : 0));
  }
  listDashboards(workspaceId: string) { return this.db.dashboards.filter((d) => d.workspace_id === workspaceId); }
  listOutcomes(workspaceId: string) { return this.db.outcomes.filter((o) => o.workspace_id === workspaceId); }
  listReports(workspaceId: string) {
    return this.db.reports.filter((r) => r.workspace_id === workspaceId).sort((a, b) => (a.generated_at < b.generated_at ? 1 : -1));
  }
  getReport(id: string) { return this.db.reports.find((r) => r.id === id); }

  // --- Build chases: loop mutations ---------------------------------------
  ingestCsv(workspaceId: string, filename: string, csvText: string, opts?: { inputType?: string; sourceId?: string }) {
    const ws = this.getWorkspace(workspaceId);
    const cfg = ws ? getConfiguration(ws.cartridge_key) : undefined;
    const result = interpretCsvUpload(workspaceId, filename, csvText, cfg, opts, now());
    this.db.inboundEvents.push(result.input);
    this.db.agentRuns.push(result.run);
    this.db.agentActions.push(...result.actions);
    this.db.proposals.push(...result.proposals);
    return { input: result.input, run: result.run, proposals: result.proposals };
  }

  dispatchInput(inputId: string, actor: string) {
    const input = this.getInput(inputId);
    if (!input) return undefined;
    const ws = this.getWorkspace(input.workspace_id);
    const cfg = ws ? getConfiguration(ws.cartridge_key) : undefined;
    const result = dispatchInput(input, cfg, now());
    this.db.agentRuns.push(result.run);
    this.db.agentActions.push(...result.actions);
    this.db.proposals.push(...result.proposals);
    // Staged input has now been interpreted into draft work (still untrusted).
    if (input.status === "received" || input.status === "classified") {
      input.status = "proposed";
      input.updated_at = now();
    }
    this.logActivity(input.workspace_id, "rules_dispatched", actor, {
      related_input_id: input.id,
      payload: {
        rules_fired: result.proposals.length,
        rules_skipped: result.skipped.length,
        run_id: result.run.id,
      },
    });
    return result;
  }

  generateReport(workspaceId: string, reportKey: string, actor: string) {
    const ws = this.getWorkspace(workspaceId);
    const cfg = ws ? getConfiguration(ws.cartridge_key) : undefined;
    const def = cfg?.reports.find((r) => r.key === reportKey)
      ?? { key: reportKey, label: reportKey, description: "Operating report generated from current evidence." };
    const report = buildReportRun(
      workspaceId,
      { key: def.key, label: def.label, description: def.description },
      {
        workItems: this.listWorkItems(workspaceId),
        evidence: this.db.evidence.filter((e) => this.getWorkItem(e.work_item_id)?.workspace_id === workspaceId),
        metrics: this.listLatestMetrics(workspaceId),
        inputs: this.listInputs(workspaceId),
        notes: this.db.notes.filter((n) => this.getWorkItem(n.work_item_id)?.workspace_id === workspaceId),
      },
      actor,
      now(),
    );
    this.db.reports.push(report);
    return report;
  }

  recomputeMetrics(workspaceId: string) {
    const ws = this.getWorkspace(workspaceId);
    const cfg = ws ? getConfiguration(ws.cartridge_key) : undefined;
    const fresh = computeMetrics(
      workspaceId,
      {
        workItems: this.listWorkItems(workspaceId),
        checklistItems: this.db.checklistItems.filter((c) => this.getWorkItem(c.work_item_id)?.workspace_id === workspaceId),
        evidence: this.db.evidence.filter((e) => this.getWorkItem(e.work_item_id)?.workspace_id === workspaceId),
        proposals: this.listProposals(workspaceId),
        agentRuns: this.listAgentRuns(workspaceId),
        inputs: this.listInputs(workspaceId),
      },
      cfg?.metrics ?? [],
      now(),
    );
    // Append-only: insert fresh rows, preserving prior auto + seeded history so a
    // value-vs-target TREND is real (HANDOFF: "metrics are append-only. Recompute
    // inserts fresh metric rows."). Readers collapse to current via
    // listLatestMetrics; ROI reads the full series via metricHistory.
    this.db.metrics.push(...fresh);
    return fresh;
  }

  recomputeOutcomes(workspaceId: string) {
    const updated: Outcome[] = [];
    for (const o of this.listOutcomes(workspaceId)) {
      const name = o.related_metric_names?.[0];
      if (!name) continue; // unlinked outcomes keep the manual estimate path
      const history = this.metricHistory(workspaceId, name);
      if (history.length === 0) continue; // metric not computed yet
      const latest = history[history.length - 1];
      const from = o.actual_value ?? null;
      o.actual_value = latest.metric_value;
      o.confidence = "observed"; // derived directly from a system metric (§9)
      o.updated_at = now();
      this.logActivity(workspaceId, "outcome_actual_recomputed", "system", {
        related_outcome_id: o.id,
        payload: { metric_name: name, from, to: latest.metric_value, measured_at: latest.measured_at },
      });
      updated.push(o);
    }
    return updated;
  }

  // --- Report lifecycle + approvals ---------------------------------------
  setReportStatus(reportId: string, status: ReportRunStatus, actor: string) {
    const r = this.getReport(reportId);
    if (!r) return undefined;
    const from = r.status;
    r.status = status;
    this.logActivity(r.workspace_id, "report_status_changed", actor, {
      related_report_id: r.id, payload: { from, to: status },
    });
    return r;
  }

  requestReportShare(reportId: string, actor: string) {
    const r = this.getReport(reportId);
    if (!r) return undefined;
    r.status = "under_review";
    const ts = now();
    const approval: Approval = {
      id: rid("appr"), workspace_id: r.workspace_id, approval_type: "report_sharing",
      status: "requested", requested_by: actor, approval_notes: null,
      metadata: { report_id: r.id, report_key: r.report_key },
      created_at: ts, updated_at: ts,
    };
    this.db.approvals.push(approval);
    this.logActivity(r.workspace_id, "report_share_requested", actor, {
      related_report_id: r.id, related_approval_id: approval.id,
    });
    return approval;
  }

  exportReport(reportId: string, actor: string) {
    const r = this.getReport(reportId);
    if (!r) return undefined;
    // In-memory has no file backend; record the export as an auditable action.
    this.logActivity(r.workspace_id, "report_exported", actor, { related_report_id: r.id });
    return r;
  }

  decideApproval(
    approvalId: string,
    decision: "approved" | "rejected" | "changes_requested",
    actor: string,
    notes?: string,
  ) {
    const a = this.db.approvals.find((x) => x.id === approvalId);
    if (!a || a.status !== "requested") return undefined;
    const ts = now();
    if (notes) a.approval_notes = notes;
    a.updated_at = ts;
    if (decision === "changes_requested") {
      // Stays in the queue; the ask is recorded as activity (no ApprovalStatus
      // value for "changes" — keep it pending so it remains actionable).
      this.logActivity(a.workspace_id, "approval_changes_requested", actor, {
        related_approval_id: a.id, payload: { notes: notes ?? null },
      });
      return a;
    }
    a.status = decision; // "approved" | "rejected"
    a.approved_by = actor;
    // Tie report-sharing approvals back to the report lifecycle (§3.25).
    const reportId = (a.metadata as Record<string, unknown> | undefined)?.report_id;
    if (a.approval_type === "report_sharing" && typeof reportId === "string") {
      const r = this.getReport(reportId);
      if (r) r.status = decision === "approved" ? "shared" : "generated";
    }
    this.logActivity(a.workspace_id, "approval_decided", actor, {
      related_approval_id: a.id, payload: { decision },
    });
    return a;
  }

  // --- Outcomes ------------------------------------------------------------
  getOutcome(id: string) { return this.db.outcomes.find((o) => o.id === id); }

  setOutcomeValueCategory(outcomeId: string, valueCategory: string, actor: string) {
    const o = this.getOutcome(outcomeId);
    if (!o) return undefined;
    const from = o.value_category;
    o.value_category = valueCategory;
    o.updated_at = now();
    this.logActivity(o.workspace_id, "outcome_value_category_set", actor, {
      related_outcome_id: o.id, payload: { from, to: valueCategory },
    });
    return o;
  }

  setOutcomeActual(outcomeId: string, actualValue: number, actor: string) {
    const o = this.getOutcome(outcomeId);
    if (!o) return undefined;
    const from = o.actual_value ?? null;
    o.actual_value = actualValue;
    o.updated_at = now();
    this.logActivity(o.workspace_id, "outcome_impact_estimated", actor, {
      related_outcome_id: o.id, payload: { from, to: actualValue },
    });
    return o;
  }
}

export { rid as makeId, now as nowIso };
