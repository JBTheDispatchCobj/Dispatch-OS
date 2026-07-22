// app/_surfaces/approvals_view.ts
//
// Olympic Sprint IV — Wave 1. The PURE view-model builder for the `/approvals`
// surface (promoted from a scaffold to a real surface over the LIVE human gate).
//
// It buckets the workspace `Approval` objects into AWAITING (a human still has to
// decide) vs DECIDED, carrying each approval's lineage (the work item / decision /
// proposal / input it governs) and the doctrine states it renders distinctly:
//   * pending_approval — status "requested": a human gate still owes a decision;
//   * restricted       — a regulated / high-risk approval type (lending, invest-
//                        ment, compliance, capital allocation, external sharing):
//                        owner/admin-only, per the 0016/0017 RLS the permission
//                        engine mirrors;
//   * current          — a decided approval (approved/rejected/expired/canceled).
//
// GATE DISCIPLINE. This builder NEVER decides anything — `decidable` is true only
// for a `requested` approval, and the actual decision is taken by the server action
// (`app/actions.decideApprovalAction`) which routes THROUGH the permission-engine
// contract (`app/contracts.decideApproval` → `core/kernel/permissions`). The
// projection can never flip a pending approval to approved.
//
// PURE (no store, no clock, no I/O): it takes already-read `Approval[]` + a
// workspace-label map + an injected `as_of`, and returns a serializable VM.
// ERASABLE-ONLY TS (no enums / parameter properties) so the debug loop and
// `node --test` can import it directly under native type-stripping.
//
// RESTRICTED CLASSIFICATION — not manufactured in code. The `restricted` state is
// an ADVISORY label (the real enforcement is the permission-engine contract behind
// the server action, which authorizes "approve"). It is resolved with a PERSISTED
// signal first — `approval.metadata.restricted === true` or a `metadata.risk_class`
// string carried WITH the approval — and only falls back to an INJECTED keyword
// heuristic (`opts.restrictedMarkers`, defaulting to `DEFAULT_RESTRICTED_MARKERS`)
// when nothing is persisted. The keyword set is caller-injected config-as-data (the
// same pattern the resolver/canon use for designator stopwords), so this generic
// projection names no vertical in its body and a persisted classification always
// supersedes the heuristic. A regulated type that carries a persisted flag can never
// be silently under-flagged.

import type { Approval, ApprovalStatus } from "@/core/types";

export type ApprovalGate = "pending_approval" | "restricted" | "current";

export interface ApprovalLineage {
  work_item_id?: string;
  input_id?: string;
  decision_id?: string;
  agent_proposal_id?: string;
}

export interface ApprovalRowVM {
  id: string;
  workspace_id: string;
  workspace_label: string;
  approval_type: string;
  status: ApprovalStatus;
  bucket: "awaiting" | "decided";
  requested_by: string | null;
  approved_by: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string | null;
  lineage: ApprovalLineage;
  hasLineage: boolean;
  /** A regulated / high-risk type — owner/admin-only (restricted). */
  restricted: boolean;
  /** True iff a human decision is still owed (status "requested"). */
  decidable: boolean;
  /** The doctrine states this row renders distinctly. */
  states: ApprovalGate[];
}

export interface ApprovalsVM {
  generatedAt: string;
  counts: {
    total: number;
    awaiting: number;
    decided: number;
    restrictedAwaiting: number;
    byStatus: Record<string, number>;
  };
  awaiting: ApprovalRowVM[];
  decided: ApprovalRowVM[];
}

/**
 * The DEFAULT injected keyword heuristic for a regulated / high-risk approval type,
 * used ONLY when an approval carries no persisted classification. Caller-injectable
 * (config-as-data) so this generic builder names no vertical in its body — a
 * cooperative-markets surface can pass its own set, and a persisted flag supersedes
 * this entirely. It is a conservative fallback, not a source of truth.
 */
export const DEFAULT_RESTRICTED_MARKERS: string[] = [
  "capital",
  "alloc",
  "invest",
  "lend",
  "loan",
  "credit",
  "complian",
  "shar",
  "settle",
  "disburse",
  "wire",
  "fund",
  "regulat",
  "underwrit",
  "exam",
  "filing",
];

/** True iff the approval carries a PERSISTED restricted/regulated classification. */
export function persistedRestricted(a: Approval): boolean {
  const m = a.metadata;
  if (!m) return false;
  return m.restricted === true || typeof m.risk_class === "string";
}

/**
 * Whether an approval TYPE matches the injected keyword heuristic (fallback only).
 * The markers are caller-injected config (default `DEFAULT_RESTRICTED_MARKERS`).
 */
export function isRestrictedApprovalType(
  approvalType: string,
  markers: string[] = DEFAULT_RESTRICTED_MARKERS,
): boolean {
  const t = approvalType.toLowerCase();
  return markers.some((m) => t.includes(m));
}

/**
 * Resolve the advisory `restricted` label for an approval: a PERSISTED classification
 * wins; otherwise the injected keyword heuristic. (Enforcement is the permission
 * engine behind the server action — this is display truth, not the gate.)
 */
export function isRestrictedApproval(a: Approval, markers: string[] = DEFAULT_RESTRICTED_MARKERS): boolean {
  return persistedRestricted(a) || isRestrictedApprovalType(a.approval_type, markers);
}

/** The doctrine states an approval renders (pending_approval / restricted / current). */
export function approvalStates(a: Approval, markers: string[] = DEFAULT_RESTRICTED_MARKERS): ApprovalGate[] {
  const states: ApprovalGate[] = [];
  if (a.status === "requested") states.push("pending_approval");
  else states.push("current");
  if (isRestrictedApproval(a, markers)) states.push("restricted");
  return states;
}

function lineageOf(a: Approval): { lineage: ApprovalLineage; hasLineage: boolean } {
  const lineage: ApprovalLineage = {};
  if (a.related_work_item_id) lineage.work_item_id = a.related_work_item_id;
  if (a.related_input_id) lineage.input_id = a.related_input_id;
  if (a.related_decision_id) lineage.decision_id = a.related_decision_id;
  if (a.related_agent_proposal_id) lineage.agent_proposal_id = a.related_agent_proposal_id;
  return { lineage, hasLineage: Object.keys(lineage).length > 0 };
}

function toRow(a: Approval, workspaceLabels: Record<string, string>, markers: string[]): ApprovalRowVM {
  const { lineage, hasLineage } = lineageOf(a);
  const decidable = a.status === "requested";
  return {
    id: a.id,
    workspace_id: a.workspace_id,
    workspace_label: workspaceLabels[a.workspace_id] ?? a.workspace_id,
    approval_type: a.approval_type,
    status: a.status,
    bucket: decidable ? "awaiting" : "decided",
    requested_by: a.requested_by ?? null,
    approved_by: a.approved_by ?? null,
    notes: a.approval_notes ?? null,
    created_at: a.created_at,
    updated_at: a.updated_at ?? null,
    lineage,
    hasLineage,
    restricted: isRestrictedApproval(a, markers),
    decidable,
    states: approvalStates(a, markers),
  };
}

/** Deterministic ascending compare by a primary key then id (total order). */
function byKeyThenId(ka: string, kb: string, ia: string, ib: string): number {
  if (ka < kb) return -1;
  if (ka > kb) return 1;
  return ia < ib ? -1 : ia > ib ? 1 : 0;
}

/**
 * Build the `/approvals` view-model from the LIVE approval objects. Deterministic:
 * awaiting sorted oldest-first (created_at, id), decided newest-first
 * (updated_at||created_at desc, id). NEVER mutates the input; NEVER decides.
 */
export function buildApprovalsView(
  approvals: Approval[],
  opts: { workspaceLabels?: Record<string, string>; as_of: string; restrictedMarkers?: string[] },
): ApprovalsVM {
  const labels = opts.workspaceLabels ?? {};
  const markers = opts.restrictedMarkers ?? DEFAULT_RESTRICTED_MARKERS;
  const rows = approvals.map((a) => toRow(a, labels, markers));

  const awaiting = rows
    .filter((r) => r.bucket === "awaiting")
    .sort((a, b) => byKeyThenId(a.created_at, b.created_at, a.id, b.id));
  const decided = rows
    .filter((r) => r.bucket === "decided")
    .sort((a, b) => byKeyThenId(b.updated_at ?? b.created_at, a.updated_at ?? a.created_at, b.id, a.id));

  const byStatus: Record<string, number> = {};
  for (const r of rows) byStatus[r.status] = (byStatus[r.status] ?? 0) + 1;

  return {
    generatedAt: opts.as_of,
    counts: {
      total: rows.length,
      awaiting: awaiting.length,
      decided: decided.length,
      restrictedAwaiting: awaiting.filter((r) => r.restricted).length,
      byStatus,
    },
    awaiting,
    decided,
  };
}
