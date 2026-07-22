// app/_surfaces/activity_center.ts
//
// Olympic Sprint IV — Wave 3. The PURE view-model builder for the TERMINAL RUNTIME's
// NOTIFICATION + TASK CENTERS (Vol VII), a read-only projection over the LIVE queues.
//
// It composes two attention surfaces the runtime shell (and the Home command center)
// render, both derived ENTIRELY from live objects:
//
//   * NOTIFICATIONS — the things that OWE a human act or flag a truth-state problem,
//     each pointing at the surface that RESOLVES it (never resolved here):
//       - approval  → a `requested` Approval (pending_approval; restricted if the type
//                     is regulated) — decided on /approvals;
//       - conflict  → a blocked / rejected WorkItem (conflicted) — worked on /workflows;
//       - review    → an unreviewed EvidenceItem (pending_approval; stale if aged out)
//                     — reviewed on /evidence.
//   * TASKS — the open work owed to an operator (a WorkItem that is not terminal):
//     status → state (awaiting_* = pending_approval, blocked/rejected = conflicted,
//     else current), sorted attention-first then by priority then recency.
//
// GATE DISCIPLINE. This is a PROJECTION. It NEVER decides, promotes, reviews, or
// transitions anything — every notification carries an `href` to the existing
// permission-engine surface where an authorized human takes the action. The center
// can never be a hidden control: it only reports what is owed and where to go.
//
// GENERIC (no vertical noun; the restricted-type set + freshness window are INJECTED
// config-as-data) + PURE (no store, no clock — `as_of` is injected; age is Date.parse
// over injected ISO strings). ERASABLE-ONLY TS so the debug loop + `node --test`
// import it directly. It reuses the doctrine helpers already proven on /evidence and
// /approvals (single source of truth for staleness + regulated-type detection).

import type { Approval, WorkItem, WorkItemStatus } from "@/core/types";
import { ageDaysBetween } from "@/app/_surfaces/evidence_view";
import { isRestrictedApprovalType } from "@/app/_surfaces/approvals_view";

export type ActivityState = "current" | "stale" | "pending_approval" | "conflicted";
export type NotificationKind = "approval" | "conflict" | "review";

/** Past this age (days) an unreviewed observation reads as STALE (freshness window). */
export const ACTIVITY_STALE_DAYS = 120;

/** A live evidence row, reduced to what an attention projection needs (injected). */
export interface EvidenceLite {
  id: string;
  work_item_id: string;
  label: string;
  captured_by: string;
  created_at: string;
  review_status?: "pending" | "approved" | "rejected";
  workspace_id: string;
  work_item_title?: string;
}

export interface NotificationVM {
  id: string;
  kind: NotificationKind;
  title: string;
  subtitle: string;
  /** The surface where an authorized human RESOLVES this — never resolved here. */
  href: string;
  workspace_id: string;
  workspace_label: string;
  /** Sourced timestamp (created_at of the underlying object) — for recency order. */
  at: string;
  restricted: boolean;
  states: ActivityState[];
}

export interface TaskVM {
  id: string;
  title: string;
  status: WorkItemStatus;
  priority: string;
  assignee_name: string | null;
  workspace_id: string;
  workspace_label: string;
  href: string;
  /** True iff this task owes a human review/approval gate (awaiting_*). */
  awaitingGate: boolean;
  states: ActivityState[];
}

export interface ActivityCenterVM {
  generatedAt: string;
  counts: {
    notifications: number;
    gatesOwed: number;
    conflicts: number;
    reviewsOwed: number;
    stale: number;
    restricted: number;
    tasks: number;
    tasksAwaitingGate: number;
  };
  notifications: NotificationVM[];
  tasks: TaskVM[];
}

/** Work-item statuses that mean a human review/approval gate is still owed. */
const GATE_STATUSES: WorkItemStatus[] = ["awaiting_approval", "awaiting_review"];
/** Work-item statuses that mean the item is stuck (a conflict to surface). */
const CONFLICT_STATUSES: WorkItemStatus[] = ["blocked", "rejected"];
/** Terminal statuses — an item here is NOT open work (excluded from the task center). */
const TERMINAL_STATUSES: WorkItemStatus[] = ["completed", "archived", "canceled"];

/** Priority rank (lower sorts first): high → medium → low → anything else. */
function priorityRank(p: string): number {
  return p === "high" ? 0 : p === "medium" ? 1 : p === "low" ? 2 : 3;
}

/** The doctrine states one open task renders distinctly. */
export function taskStates(status: WorkItemStatus): ActivityState[] {
  const states: ActivityState[] = [];
  if (GATE_STATUSES.includes(status)) states.push("pending_approval");
  if (CONFLICT_STATUSES.includes(status)) states.push("conflicted");
  if (states.length === 0) states.push("current");
  return states;
}

export interface ActivityInput {
  approvals: Approval[];
  workItems: WorkItem[];
  evidence: EvidenceLite[];
  workspaceLabels?: Record<string, string>;
  /** Injected regulated-type override (defaults to the shared /approvals predicate). */
  isRestrictedType?: (approvalType: string) => boolean;
  /** Injected freshness window for unreviewed observations (defaults to 120d). */
  staleDays?: number;
}

/** Deterministic ascending compare by a key then id (total order). */
function byKeyThenId(ka: string, kb: string, ia: string, ib: string): number {
  if (ka < kb) return -1;
  if (ka > kb) return 1;
  return ia < ib ? -1 : ia > ib ? 1 : 0;
}

/**
 * Build the notification + task center view-model from the LIVE queues. Deterministic:
 * notifications sort attention-first (gate/conflict) then most-recent then id; tasks
 * sort gate/conflict-first then priority then recency then id. NEVER mutates its input;
 * NEVER decides, reviews, or transitions anything.
 */
export function buildActivityCenter(input: ActivityInput, opts: { as_of: string }): ActivityCenterVM {
  const labels = input.workspaceLabels ?? {};
  const isRestricted = input.isRestrictedType ?? isRestrictedApprovalType;
  const staleDays = input.staleDays ?? ACTIVITY_STALE_DAYS;
  const label = (ws: string) => labels[ws] ?? ws;

  const notifications: NotificationVM[] = [];

  // (a) APPROVAL gates — every requested approval owes a human decision on /approvals.
  for (const a of input.approvals) {
    if (a.status !== "requested") continue;
    const restricted = isRestricted(a.approval_type);
    notifications.push({
      id: `notif:approval:${a.id}`,
      kind: "approval",
      title: `Approval owed — ${a.approval_type.replace(/_/g, " ")}`,
      subtitle: restricted ? "regulated · owner/admin only" : "awaiting an authorized decision",
      href: "/approvals",
      workspace_id: a.workspace_id,
      workspace_label: label(a.workspace_id),
      at: a.created_at,
      restricted,
      states: ["pending_approval"],
    });
  }

  // (b) CONFLICTS — a blocked / rejected work item is stuck; worked on /workflows.
  for (const w of input.workItems) {
    if (!CONFLICT_STATUSES.includes(w.status)) continue;
    notifications.push({
      id: `notif:conflict:${w.id}`,
      kind: "conflict",
      title: `Stuck — ${w.title}`,
      subtitle: `work item ${w.status.replace(/_/g, " ")}`,
      href: "/workflows",
      workspace_id: w.workspace_id,
      workspace_label: label(w.workspace_id),
      at: w.created_at,
      restricted: false,
      states: ["conflicted"],
    });
  }

  // (c) REVIEWS — an unreviewed evidence item owes a review on /evidence (stale if aged).
  for (const e of input.evidence) {
    const status = e.review_status ?? "pending";
    if (status !== "pending") continue;
    const stale = ageDaysBetween(e.created_at, opts.as_of) > staleDays;
    const states: ActivityState[] = ["pending_approval"];
    if (stale) states.push("stale");
    notifications.push({
      id: `notif:review:${e.id}`,
      kind: "review",
      title: `Review owed — ${e.label}`,
      subtitle: e.work_item_title ? `evidence on ${e.work_item_title}` : "unreviewed evidence",
      href: "/evidence",
      workspace_id: e.workspace_id,
      workspace_label: label(e.workspace_id),
      at: e.created_at,
      restricted: false,
      states,
    });
  }

  // Attention-first (gate/conflict rank is uniform here), then MOST-RECENT, then id.
  notifications.sort((a, b) => {
    if (a.at !== b.at) return a.at < b.at ? 1 : -1; // newest first
    return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
  });

  // TASKS — open (non-terminal) work items owed to an operator.
  const tasks: TaskVM[] = input.workItems
    .filter((w) => !TERMINAL_STATUSES.includes(w.status))
    .map((w) => {
      const states = taskStates(w.status);
      return {
        id: w.id,
        title: w.title,
        status: w.status,
        priority: w.priority,
        assignee_name: w.assignee_name ?? null,
        workspace_id: w.workspace_id,
        workspace_label: label(w.workspace_id),
        href: "/work",
        awaitingGate: GATE_STATUSES.includes(w.status),
        states,
      };
    })
    .sort((a, b) => {
      const rank = (t: TaskVM) => (t.states.includes("pending_approval") || t.states.includes("conflicted") ? 0 : 1);
      const ra = rank(a);
      const rb = rank(b);
      if (ra !== rb) return ra - rb;
      const pa = priorityRank(a.priority);
      const pb = priorityRank(b.priority);
      if (pa !== pb) return pa - pb;
      return byKeyThenId(a.title, b.title, a.id, b.id);
    });

  const counts = {
    notifications: notifications.length,
    gatesOwed: notifications.filter((n) => n.kind === "approval").length,
    conflicts: notifications.filter((n) => n.kind === "conflict").length,
    reviewsOwed: notifications.filter((n) => n.kind === "review").length,
    stale: notifications.filter((n) => n.states.includes("stale")).length,
    restricted: notifications.filter((n) => n.restricted).length,
    tasks: tasks.length,
    tasksAwaitingGate: tasks.filter((t) => t.awaitingGate).length,
  };

  return { generatedAt: opts.as_of, counts, notifications, tasks };
}
