// components/widgets/WidgetActions.tsx
//
// The declare → wire seam for widget actions. The widget layer DECLARES the
// actions a widget supports (registry defaultActions / authored `actions`); the
// MUTATION + event log lives only in app/actions.ts (WIDGET_SYSTEM_RULES §9).
// This file renders the declared actions the in-memory store now backs as
// server-action forms, and reports any still-unbacked ones honestly as "wiring
// pending" rather than showing dead buttons. Cartridge-blind: it never names a
// vertical. The inline form affordances here are intentionally minimal — see
// the HANDOFF "UI polish to revisit" note.

import {
  setStatusAction,
  promoteProposalAction,
  decideProposalAction,
  generateReportAction,
  recomputeMetricsAction,
  assignWorkItemAction,
  addNoteAction,
  addEvidenceAction,
  reviewEvidenceAction,
  setInputStatusAction,
  runRulesAction,
  createWorkItemFromInputAction,
  requestReportShareAction,
  exportReportAction,
  archiveReportAction,
  decideApprovalAction,
  setOutcomeValueCategoryAction,
  setOutcomeImpactAction,
  escalateWorkItemAction,
  createFollowUpAction,
  dismissExceptionAction,
} from "@/app/actions";
import type { WidgetType } from "@/core/widgets";
import type { UserProfile, WorkItemStatus } from "@/core/types";

/**
 * Which declared actions are backed by a real store mutation today. Anything not
 * listed is declared-but-not-yet-wired and is surfaced as a muted note, keeping
 * the seam transparent. Session 6 closed all but the evidence-panel actions that
 * require a document/file backend (upload/link/request_missing) — those wait for
 * the storage layer (Supabase era) and are honestly reported as pending.
 */
export const WIRED_ACTIONS: Partial<Record<WidgetType, readonly string[]>> = {
  work_queue: ["start", "block", "complete", "request_review", "assign", "add_note", "add_evidence"],
  proposal_queue: ["promote", "reject"],
  report_list: ["generate", "share", "export", "archive"],
  approval_queue: ["approve", "reject", "request_changes"],
  evidence_panel: ["approve", "reject"],
  input_inbox: ["run_rules", "review", "classify", "match", "create_work_item", "archive", "reject"],
  outcome_panel: ["assign_value_category", "estimate_impact"],
  exception_panel: ["assign_owner", "create_work_item", "escalate", "dismiss"],
};

/** Generic ROI value buckets (WIDGET_SYSTEM_RULES §5.13) — not vertical nouns. */
const VALUE_CATEGORIES = [
  "time_saved", "cost_reduced", "revenue_created", "revenue_protected", "risk_reduced",
  "data_quality_improved", "evidence_completeness_improved", "faster_cycle_time",
  "fewer_errors", "improved_transferability", "improved_customer_experience",
];

/** work_queue declared action -> the WorkItem status it transitions to. */
const WORK_STATUS: Record<string, { to: WorkItemStatus; label: string; cls?: string }> = {
  start: { to: "in_progress", label: "Start", cls: "btn--primary" },
  block: { to: "blocked", label: "Block" },
  request_review: { to: "awaiting_review", label: "Request review" },
  complete: { to: "completed", label: "Complete", cls: "btn--good" },
};

/** input_inbox declared action -> the Input status it transitions to. */
const INPUT_STATUS: Record<string, { to: string; label: string }> = {
  review: { to: "interpreted", label: "Review" },
  classify: { to: "classified", label: "Classify" },
  match: { to: "matched", label: "Match" },
  archive: { to: "archived", label: "Archive" },
  reject: { to: "rejected", label: "Reject" },
};

/** True if at least one of a widget's declared actions is store-backed. */
export function hasWiredActions(type: WidgetType, actions: string[]): boolean {
  const wired = WIRED_ACTIONS[type];
  return !!wired && actions.some((a) => wired.includes(a));
}

/** The declared actions for which no store mutation exists yet. */
export function unwiredActions(type: WidgetType, actions: string[]): string[] {
  const wired = WIRED_ACTIONS[type] ?? [];
  return actions.filter((a) => !wired.includes(a));
}

// ---------------------------------------------------------------------------
// work_queue
// ---------------------------------------------------------------------------

/** Store-backed status transitions + assign / note / evidence for one item. */
export function WorkItemActions({
  id,
  actions,
  users = [],
}: {
  id: string;
  actions: string[];
  users?: UserProfile[];
}) {
  const statusOpts = actions.map((a) => WORK_STATUS[a]).filter(Boolean);
  return (
    <div className="actionstack">
      {statusOpts.length > 0 && (
        <div className="btnrow">
          {statusOpts.map((o) => (
            <form key={o.to} action={setStatusAction} className="inlineform">
              <input type="hidden" name="id" value={id} />
              <input type="hidden" name="status" value={o.to} />
              <button className={`btn btn--sm ${o.cls ?? ""}`} type="submit">{o.label}</button>
            </form>
          ))}
        </div>
      )}
      {actions.includes("assign") && users.length > 0 && (
        <form action={assignWorkItemAction} className="inlineform inlineform--row">
          <input type="hidden" name="id" value={id} />
          <select name="userId" className="input input--sm" defaultValue="" aria-label="Assignee">
            <option value="" disabled>Assign to…</option>
            {users.map((u) => <option key={u.id} value={u.id}>{u.display_name}</option>)}
          </select>
          <button className="btn btn--sm" type="submit">Assign</button>
        </form>
      )}
      {actions.includes("add_note") && (
        <form action={addNoteAction} className="inlineform inlineform--row">
          <input type="hidden" name="workItemId" value={id} />
          <input name="body" className="input input--sm" placeholder="Add a note…" aria-label="Note" />
          <button className="btn btn--sm" type="submit">Note</button>
        </form>
      )}
      {actions.includes("add_evidence") && (
        <form action={addEvidenceAction} className="inlineform inlineform--row">
          <input type="hidden" name="workItemId" value={id} />
          <input type="hidden" name="kind" value="attestation" />
          <input name="label" className="input input--sm" placeholder="Add evidence…" aria-label="Evidence" />
          <button className="btn btn--sm" type="submit">Evidence</button>
        </form>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// proposal_queue
// ---------------------------------------------------------------------------

/** Promote / reject for a single pending proposal (proposal_queue). */
export function ProposalActions({ id, actions }: { id: string; actions: string[] }) {
  return (
    <div className="btnrow">
      {actions.includes("promote") && (
        <form action={promoteProposalAction} className="inlineform">
          <input type="hidden" name="id" value={id} />
          <button className="btn btn--sm btn--primary" type="submit">Promote</button>
        </form>
      )}
      {actions.includes("reject") && (
        <form action={decideProposalAction} className="inlineform">
          <input type="hidden" name="id" value={id} />
          <input type="hidden" name="decision" value="rejected" />
          <button className="btn btn--sm btn--bad" type="submit">Reject</button>
        </form>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// evidence_panel
// ---------------------------------------------------------------------------

/** Approve / reject one evidence item once captured (evidence_panel §5.6). */
export function EvidenceActions({ id, actions }: { id: string; actions: string[] }) {
  return (
    <div className="btnrow">
      {actions.includes("approve") && (
        <form action={reviewEvidenceAction} className="inlineform">
          <input type="hidden" name="evidenceId" value={id} />
          <input type="hidden" name="decision" value="approved" />
          <button className="btn btn--sm btn--good" type="submit">Approve</button>
        </form>
      )}
      {actions.includes("reject") && (
        <form action={reviewEvidenceAction} className="inlineform">
          <input type="hidden" name="evidenceId" value={id} />
          <input type="hidden" name="decision" value="rejected" />
          <button className="btn btn--sm btn--bad" type="submit">Reject</button>
        </form>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// input_inbox
// ---------------------------------------------------------------------------

/** Staging transitions + convert-to-work-item for one input (input_inbox §5.1). */
export function InputActions({ id, actions }: { id: string; actions: string[] }) {
  const statusOpts = actions.map((a) => ({ a, def: INPUT_STATUS[a] })).filter((x) => x.def);
  return (
    <div className="btnrow">
      {actions.includes("run_rules") && (
        <form action={runRulesAction} className="inlineform">
          <input type="hidden" name="inputId" value={id} />
          <button className="btn btn--sm btn--primary" type="submit">Run rules</button>
        </form>
      )}
      {statusOpts.map(({ a, def }) => (
        <form key={a} action={setInputStatusAction} className="inlineform">
          <input type="hidden" name="inputId" value={id} />
          <input type="hidden" name="status" value={def.to} />
          <button className={`btn btn--sm ${a === "reject" ? "btn--bad" : ""}`} type="submit">{def.label}</button>
        </form>
      ))}
      {actions.includes("create_work_item") && (
        <form action={createWorkItemFromInputAction} className="inlineform">
          <input type="hidden" name="inputId" value={id} />
          <button className="btn btn--sm btn--primary" type="submit">Create work item</button>
        </form>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// approval_queue
// ---------------------------------------------------------------------------

/** Approve / reject / request changes for a pending (requested) approval (§3.21). */
export function ApprovalActions({ id, actions }: { id: string; actions: string[] }) {
  return (
    <div className="btnrow">
      {actions.includes("approve") && (
        <form action={decideApprovalAction} className="inlineform">
          <input type="hidden" name="approvalId" value={id} />
          <input type="hidden" name="decision" value="approved" />
          <button className="btn btn--sm btn--good" type="submit">Approve</button>
        </form>
      )}
      {actions.includes("reject") && (
        <form action={decideApprovalAction} className="inlineform">
          <input type="hidden" name="approvalId" value={id} />
          <input type="hidden" name="decision" value="rejected" />
          <button className="btn btn--sm btn--bad" type="submit">Reject</button>
        </form>
      )}
      {actions.includes("request_changes") && (
        <form action={decideApprovalAction} className="inlineform">
          <input type="hidden" name="approvalId" value={id} />
          <input type="hidden" name="decision" value="changes_requested" />
          <button className="btn btn--sm" type="submit">Request changes</button>
        </form>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// outcome_panel
// ---------------------------------------------------------------------------

/** Assign a value category + estimate impact for one outcome (outcome_panel §5.13). */
export function OutcomeActions({
  id,
  actions,
  valueCategory,
}: {
  id: string;
  actions: string[];
  valueCategory?: string;
}) {
  return (
    <div className="actionstack">
      {actions.includes("assign_value_category") && (
        <form action={setOutcomeValueCategoryAction} className="inlineform inlineform--row">
          <input type="hidden" name="outcomeId" value={id} />
          <select name="valueCategory" className="input input--sm" defaultValue={valueCategory ?? ""} aria-label="Value category">
            <option value="" disabled>Value category…</option>
            {VALUE_CATEGORIES.map((v) => <option key={v} value={v}>{v.replace(/_/g, " ")}</option>)}
          </select>
          <button className="btn btn--sm" type="submit">Set</button>
        </form>
      )}
      {actions.includes("estimate_impact") && (
        <form action={setOutcomeImpactAction} className="inlineform inlineform--row">
          <input type="hidden" name="outcomeId" value={id} />
          <input name="actualValue" type="number" step="any" className="input input--sm input--num" placeholder="Impact" aria-label="Estimated impact" />
          <button className="btn btn--sm" type="submit">Estimate</button>
        </form>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// exception_panel
// ---------------------------------------------------------------------------

/** Assign / escalate / follow-up / dismiss for one derived exception (§5.10). */
export function ExceptionActions({
  workItemId,
  kind,
  actions,
  users = [],
}: {
  workItemId: string;
  kind: string;
  actions: string[];
  users?: UserProfile[];
}) {
  return (
    <div className="actionstack">
      <div className="btnrow">
        {actions.includes("escalate") && (
          <form action={escalateWorkItemAction} className="inlineform">
            <input type="hidden" name="id" value={workItemId} />
            <button className="btn btn--sm" type="submit">Escalate</button>
          </form>
        )}
        {actions.includes("create_work_item") && (
          <form action={createFollowUpAction} className="inlineform">
            <input type="hidden" name="id" value={workItemId} />
            <button className="btn btn--sm" type="submit">Follow-up</button>
          </form>
        )}
        {actions.includes("dismiss") && (
          <form action={dismissExceptionAction} className="inlineform">
            <input type="hidden" name="id" value={workItemId} />
            <input type="hidden" name="kind" value={kind} />
            <button className="btn btn--sm" type="submit">Dismiss</button>
          </form>
        )}
      </div>
      {actions.includes("assign_owner") && users.length > 0 && (
        <form action={assignWorkItemAction} className="inlineform inlineform--row">
          <input type="hidden" name="id" value={workItemId} />
          <select name="userId" className="input input--sm" defaultValue="" aria-label="Assign owner">
            <option value="" disabled>Assign owner…</option>
            {users.map((u) => <option key={u.id} value={u.id}>{u.display_name}</option>)}
          </select>
          <button className="btn btn--sm" type="submit">Assign</button>
        </form>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// report_list
// ---------------------------------------------------------------------------

/** Per-report share / export / archive (report_list §5.12). */
export function ReportActions({
  id,
  status,
  actions,
}: {
  id: string;
  status?: string;
  actions: string[];
}) {
  const shared = status === "shared";
  const archived = status === "archived";
  return (
    <div className="btnrow">
      {actions.includes("share") && !shared && !archived && (
        <form action={requestReportShareAction} className="inlineform">
          <input type="hidden" name="reportId" value={id} />
          <button className="btn btn--sm" type="submit">Request share</button>
        </form>
      )}
      {actions.includes("export") && !archived && (
        <form action={exportReportAction} className="inlineform">
          <input type="hidden" name="reportId" value={id} />
          <button className="btn btn--sm" type="submit">Export</button>
        </form>
      )}
      {actions.includes("archive") && !archived && (
        <form action={archiveReportAction} className="inlineform">
          <input type="hidden" name="reportId" value={id} />
          <button className="btn btn--sm" type="submit">Archive</button>
        </form>
      )}
    </div>
  );
}

/** Generate a new report instance from current evidence + metrics (report_list). */
export function GenerateReportButton({ workspaceId }: { workspaceId: string }) {
  return (
    <form action={generateReportAction} className="inlineform">
      <input type="hidden" name="workspaceId" value={workspaceId} />
      <button className="btn btn--sm btn--primary" type="submit">Generate report</button>
    </form>
  );
}

/** Recompute metrics for the workspace (dashboard toolbar / value widgets). */
export function RecomputeMetricsButton({ workspaceId }: { workspaceId: string }) {
  return (
    <form action={recomputeMetricsAction} className="inlineform">
      <input type="hidden" name="workspaceId" value={workspaceId} />
      <button className="btn btn--sm" type="submit">Recompute metrics</button>
    </form>
  );
}

/** A muted, non-interactive note listing declared actions not yet wired. */
export function UnwiredNote({ actions }: { actions: string[] }) {
  if (actions.length === 0) return null;
  return (
    <p className="widget__declared">Declared: {actions.join(", ")} · wiring pending</p>
  );
}
