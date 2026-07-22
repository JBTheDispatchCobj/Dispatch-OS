// app/_surfaces/workflows_view.ts
//
// Olympic Sprint IV — Wave 2. The PURE view-model builder for the `/workflows`
// surface (promoted from a scaffold to a REAL surface over the LIVE work-item queue).
//
// It groups the live `WorkItem` objects by their workflow `kind`, joins each group to
// its cartridge WORKFLOW DEFINITION (label / owner role / whether it requires an
// approval), rolls up status, and cross-references the live `Approval` objects (by
// `related_work_item_id`) so a work item awaiting a human decision surfaces its gate.
// The doctrine states it renders distinctly:
//   * pending_approval — a work item is awaiting_approval / awaiting_review, OR a
//                        `requested` Approval is linked to it (a human gate still owes
//                        a decision);
//   * conflicted       — a work item is blocked or rejected (the workflow is stuck);
//   * current          — an active / completed work item with no open gate or conflict.
//
// "Workflow" is a config-as-data DEFINITION (the cartridge's `workflows[]`), not a
// stored per-instance row; the live instances are the work items. This builder is the
// projection that ties the two together for browse — it does NOT execute a workflow.
//
// GATE DISCIPLINE. This builder NEVER decides, promotes, or transitions anything. It
// reports which items owe a human gate; the actual decision routes through the existing
// permission-engine server actions (`/work`, `/proposals`, `/approvals`). The projection
// can never advance a work item or approve a linked approval.
//
// PURE (no store, no clock: `as_of` injected) + GENERIC (the builder body names no
// vertical; the workflow definitions are INJECTED config-as-data). ERASABLE-ONLY TS so
// the debug loop + `node --test` import it directly under native type-stripping.

import type { WorkItem, WorkItemStatus, Approval } from "@/core/types";

export type WorkflowState = "current" | "pending_approval" | "conflicted";

/** A workflow definition, reduced to the fields this projection needs (injected config-as-data). */
export interface WorkflowDefLite {
  kind: string;
  label: string;
  description: string;
  defaultOwnerRole: string;
  defaultPriority: string;
  approvalRequired?: boolean;
}

/** Checklist progress for a work item (the page computes this from the store). */
export interface ChecklistProgress {
  done: number;
  total: number;
}

/** The status values that mean a human review/approval gate is still owed. */
const GATE_STATUSES: WorkItemStatus[] = ["awaiting_approval", "awaiting_review"];
/** The status values that mean the workflow is stuck (a conflict to surface). */
const CONFLICT_STATUSES: WorkItemStatus[] = ["blocked", "rejected"];

export interface WorkItemRowVM {
  id: string;
  title: string;
  status: WorkItemStatus;
  priority: string;
  assignee_name: string | null;
  workspace_id: string;
  workspace_label: string;
  checklist: ChecklistProgress;
  /** A `requested` Approval is linked to this item (a human gate is owed). */
  pendingApproval: boolean;
  linkedApprovalId: string | null;
  states: WorkflowState[];
}

export interface WorkflowGroupVM {
  kind: string;
  label: string;
  description: string;
  ownerRole: string;
  priority: string;
  approvalRequired: boolean;
  /** True iff this kind has NO cartridge definition (shown, never silently mis-attached). */
  unmapped: boolean;
  total: number;
  active: number;
  blocked: number;
  awaiting: number;
  completed: number;
  pendingApprovals: number;
  byStatus: Record<string, number>;
  items: WorkItemRowVM[];
  states: WorkflowState[];
}

export interface WorkflowsVM {
  generatedAt: string;
  counts: {
    workflows: number;
    items: number;
    active: number;
    blocked: number;
    awaiting: number;
    pendingApprovals: number;
  };
  groups: WorkflowGroupVM[];
}

/** The doctrine states one work item renders (pending_approval / conflicted / current). */
export function workItemStates(status: WorkItemStatus, pendingApproval: boolean): WorkflowState[] {
  const states: WorkflowState[] = [];
  if (GATE_STATUSES.includes(status) || pendingApproval) states.push("pending_approval");
  if (CONFLICT_STATUSES.includes(status)) states.push("conflicted");
  if (states.length === 0) states.push("current");
  return states;
}

const ACTIVE_STATUSES: WorkItemStatus[] = ["open", "assigned", "in_progress", "reopened", "proposed"];

export interface WorkflowsInput {
  items: WorkItem[];
  defs: WorkflowDefLite[];
  approvals: Approval[];
  /** work_item_id → checklist progress (optional; defaults to 0/0). */
  checklist?: Record<string, ChecklistProgress>;
  workspaceLabels?: Record<string, string>;
}

/** Deterministic ascending compare by a key then id (total order). */
function byKeyThenId(ka: string, kb: string, ia: string, ib: string): number {
  if (ka < kb) return -1;
  if (ka > kb) return 1;
  return ia < ib ? -1 : ia > ib ? 1 : 0;
}

/**
 * Build the `/workflows` view-model. Deterministic: groups are ordered by kind; items
 * within a group sink gate/conflict items to the top, then order by title, then id.
 * NEVER mutates the input; NEVER decides or transitions.
 */
export function buildWorkflowsView(input: WorkflowsInput, opts: { as_of: string }): WorkflowsVM {
  const labels = input.workspaceLabels ?? {};
  const checklist = input.checklist ?? {};
  const defByKind = new Map<string, WorkflowDefLite>();
  for (const d of input.defs) defByKind.set(d.kind, d);

  // Map each item's linked `requested` approval (by related_work_item_id).
  const requestedApprovalByItem = new Map<string, string>();
  for (const a of input.approvals) {
    if (a.status === "requested" && a.related_work_item_id) {
      if (!requestedApprovalByItem.has(a.related_work_item_id)) {
        requestedApprovalByItem.set(a.related_work_item_id, a.id);
      }
    }
  }

  // Group items by kind (input-ordered kinds; deterministic).
  const kinds: string[] = [];
  const itemsByKind = new Map<string, WorkItem[]>();
  for (const it of input.items) {
    if (!itemsByKind.has(it.kind)) {
      itemsByKind.set(it.kind, []);
      kinds.push(it.kind);
    }
    itemsByKind.get(it.kind)!.push(it);
  }
  kinds.sort();

  const groups: WorkflowGroupVM[] = kinds.map((kind) => {
    const def = defByKind.get(kind);
    const items = itemsByKind.get(kind)!;
    const byStatus: Record<string, number> = {};
    let active = 0;
    let blocked = 0;
    let awaiting = 0;
    let completed = 0;
    let pendingApprovals = 0;

    const rows: WorkItemRowVM[] = items.map((it) => {
      const linkedApprovalId = requestedApprovalByItem.get(it.id) ?? null;
      const pendingApproval = linkedApprovalId != null;
      byStatus[it.status] = (byStatus[it.status] ?? 0) + 1;
      if (ACTIVE_STATUSES.includes(it.status)) active += 1;
      if (CONFLICT_STATUSES.includes(it.status)) blocked += 1;
      if (GATE_STATUSES.includes(it.status) || pendingApproval) awaiting += 1;
      if (it.status === "completed") completed += 1;
      if (pendingApproval) pendingApprovals += 1;
      return {
        id: it.id,
        title: it.title,
        status: it.status,
        priority: it.priority,
        assignee_name: it.assignee_name ?? null,
        workspace_id: it.workspace_id,
        workspace_label: labels[it.workspace_id] ?? it.workspace_id,
        checklist: checklist[it.id] ?? { done: 0, total: 0 },
        pendingApproval,
        linkedApprovalId,
        states: workItemStates(it.status, pendingApproval),
      };
    });

    rows.sort((a, b) => {
      // gate/conflict items sink to the top (attention owed), then title, then id
      const rank = (r: WorkItemRowVM) => (r.states.includes("pending_approval") || r.states.includes("conflicted") ? 0 : 1);
      const ra = rank(a);
      const rb = rank(b);
      if (ra !== rb) return ra - rb;
      return byKeyThenId(a.title, b.title, a.id, b.id);
    });

    const groupStates: WorkflowState[] = [];
    if (awaiting > 0) groupStates.push("pending_approval");
    if (blocked > 0) groupStates.push("conflicted");
    if (groupStates.length === 0) groupStates.push("current");

    return {
      kind,
      label: def?.label ?? kind,
      description: def?.description ?? "",
      ownerRole: def?.defaultOwnerRole ?? "operator",
      priority: def?.defaultPriority ?? "medium",
      approvalRequired: def?.approvalRequired === true,
      unmapped: def === undefined,
      total: items.length,
      active,
      blocked,
      awaiting,
      completed,
      pendingApprovals,
      byStatus,
      items: rows,
      states: groupStates,
    };
  });

  return {
    generatedAt: opts.as_of,
    counts: {
      workflows: groups.length,
      items: input.items.length,
      active: groups.reduce((n, g) => n + g.active, 0),
      blocked: groups.reduce((n, g) => n + g.blocked, 0),
      awaiting: groups.reduce((n, g) => n + g.awaiting, 0),
      pendingApprovals: groups.reduce((n, g) => n + g.pendingApprovals, 0),
    },
    groups,
  };
}
