"use server";
//
// Server actions — the only place the UI mutates the DataStore. Each action
// produces an audit event via the store and revalidates the affected paths.
// Human approvals (decide/promote) are deliberately distinct actions from
// anything an agent does.

import { revalidatePath } from "next/cache";
import { store } from "@/core/data";
import { getConfiguration } from "@/core/cartridge";
import { getDemoSession } from "@/core/auth/session";
import * as contracts from "@/app/contracts";
import type { EvidenceKind, InputStatus, ReportRunStatus, WorkItemStatus } from "@/core/types";

export async function setStatusAction(formData: FormData) {
  const id = String(formData.get("id"));
  const status = String(formData.get("status")) as WorkItemStatus;
  const me = getDemoSession();
  store.setStatus(id, status, `user:${me.id}`);
  revalidatePath(`/work/${id}`);
  revalidatePath("/work");
  revalidatePath("/review");
  revalidatePath("/dashboard");
}

/**
 * review_queue · approve/send-back — the human review sign-off. RETIRES the ad-hoc
 * `canReview`: authorization now routes through the kernel contract
 * (authorize "review" via core/kernel/permissions), not a boolean at the call
 * site. Delegates to the same store.setStatus on allow.
 */
export async function reviewWorkItemAction(formData: FormData) {
  const id = String(formData.get("id"));
  const status = String(formData.get("status")) as WorkItemStatus;
  contracts.reviewWorkItem(id, status);
  revalidatePath(`/work/${id}`);
  revalidatePath("/work");
  revalidatePath("/review");
  revalidatePath("/dashboard");
}

export async function toggleChecklistAction(formData: FormData) {
  const itemId = String(formData.get("itemId"));
  const workItemId = String(formData.get("workItemId"));
  const done = String(formData.get("done")) === "true";
  const me = getDemoSession();
  store.toggleChecklist(itemId, done, `user:${me.id}`);
  revalidatePath(`/work/${workItemId}`);
}

export async function addNoteAction(formData: FormData) {
  const workItemId = String(formData.get("workItemId"));
  const body = String(formData.get("body") ?? "").trim();
  if (!body) return;
  const me = getDemoSession();
  store.addNote(workItemId, me.id, me.display_name, body);
  revalidatePath(`/work/${workItemId}`);
  revalidatePath("/dashboard");
}

// ===========================================================================
// Widget-action wiring (HANDOFF session-6: close the wiring gap). Each action
// below is a real store mutation that logs an event/activity record. Per-role
// write guards ship as forward-only migrations (0006–0008); the in-memory store
// stays permissive for the demo, and the demo session is always an owner.
// ===========================================================================

/** work_queue · assign — set/replace the assignee (§5.3). */
export async function assignWorkItemAction(formData: FormData) {
  const id = String(formData.get("id"));
  const userId = String(formData.get("userId"));
  if (!userId) return;
  const user = store.listUsers().find((u) => u.id === userId);
  const me = getDemoSession();
  store.assignWorkItem(id, userId, user?.display_name ?? userId, `user:${me.id}`);
  revalidatePath("/dashboard");
  revalidatePath("/work");
  revalidatePath(`/work/${id}`);
}

/** work_queue / work_item_detail · add_evidence — attach typed proof (§5.6). */
export async function addEvidenceAction(formData: FormData) {
  const workItemId = String(formData.get("workItemId"));
  const label = String(formData.get("label") ?? "").trim();
  if (!label) return;
  const kind = (String(formData.get("kind") || "attestation")) as EvidenceKind;
  const me = getDemoSession();
  store.addEvidence(workItemId, { kind, label }, `user:${me.id}`);
  revalidatePath("/dashboard");
  revalidatePath(`/work/${workItemId}`);
}

/**
 * evidence_panel · approve|reject — human review of proof, separate from capture.
 * Routes through the kernel contract (authorize "review") so evidence sign-off is
 * permission-gated like the other human-review surfaces.
 */
export async function reviewEvidenceAction(formData: FormData) {
  const evidenceId = String(formData.get("evidenceId"));
  const decision = String(formData.get("decision")) as "approved" | "rejected";
  contracts.reviewEvidence(evidenceId, decision);
  revalidatePath("/dashboard");
}

/** input_inbox · review/classify/match/archive/reject — staging transitions (§3.6). */
export async function setInputStatusAction(formData: FormData) {
  const inputId = String(formData.get("inputId"));
  const status = String(formData.get("status")) as InputStatus;
  const me = getDemoSession();
  store.setInputStatus(inputId, status, `user:${me.id}`);
  revalidatePath("/dashboard");
}

/**
 * input_inbox · run_rules — fan a staged input through the active configuration's
 * generation rules (the rules SYSTEM). dispatchInput logs one dry-run AgentRun +
 * an action per fired rule and persists the resulting Proposals; nothing becomes
 * a work item without a human promote. Cartridge-blind: the engine reads the
 * package's generationRules, never a vertical.
 */
export async function runRulesAction(formData: FormData) {
  const inputId = String(formData.get("inputId"));
  const me = getDemoSession();
  store.dispatchInput(inputId, `user:${me.id}`);
  revalidatePath("/dashboard");
  revalidatePath("/proposals");
}

/** input_inbox · create_work_item — convert a staged input into real work. */
export async function createWorkItemFromInputAction(formData: FormData) {
  const inputId = String(formData.get("inputId"));
  const me = getDemoSession();
  const wi = store.createWorkItemFromInput(inputId, `user:${me.id}`);
  revalidatePath("/dashboard");
  revalidatePath("/work");
  if (wi) revalidatePath(`/work/${wi.id}`);
}

/** report_list · share — request external sharing (raises an owner/admin approval). */
export async function requestReportShareAction(formData: FormData) {
  const reportId = String(formData.get("reportId"));
  const me = getDemoSession();
  store.requestReportShare(reportId, `user:${me.id}`);
  revalidatePath("/dashboard");
}

/** report_list · export — record an export action (no file backend in-memory). */
export async function exportReportAction(formData: FormData) {
  const reportId = String(formData.get("reportId"));
  const me = getDemoSession();
  store.exportReport(reportId, `user:${me.id}`);
  revalidatePath("/dashboard");
}

/** report_list · archive — retire a report. */
export async function archiveReportAction(formData: FormData) {
  const reportId = String(formData.get("reportId"));
  const status = (String(formData.get("status") || "archived")) as ReportRunStatus;
  const me = getDemoSession();
  store.setReportStatus(reportId, status, `user:${me.id}`);
  revalidatePath("/dashboard");
}

/**
 * approval_queue · approve/reject/request_changes — the human authorization gate
 * (§3.21). Routes through the kernel contract (authorize "approve") so the human
 * approval gate is gated by the permission engine, not an ad-hoc check.
 */
export async function decideApprovalAction(formData: FormData) {
  const approvalId = String(formData.get("approvalId"));
  const decision = String(formData.get("decision")) as "approved" | "rejected" | "changes_requested";
  const notes = String(formData.get("notes") ?? "").trim() || undefined;
  contracts.decideApproval(approvalId, decision, notes);
  revalidatePath("/dashboard");
}

/** outcome_panel · assign_value_category — tag the ROI bucket (§5.13). */
export async function setOutcomeValueCategoryAction(formData: FormData) {
  const outcomeId = String(formData.get("outcomeId"));
  const valueCategory = String(formData.get("valueCategory") ?? "").trim();
  if (!valueCategory) return;
  const me = getDemoSession();
  store.setOutcomeValueCategory(outcomeId, valueCategory, `user:${me.id}`);
  revalidatePath("/dashboard");
}

/** outcome_panel · estimate_impact — record an estimated/actual value (§5.13). */
export async function setOutcomeImpactAction(formData: FormData) {
  const outcomeId = String(formData.get("outcomeId"));
  const raw = String(formData.get("actualValue") ?? "").trim();
  const value = Number(raw);
  if (raw === "" || Number.isNaN(value)) return;
  const me = getDemoSession();
  store.setOutcomeActual(outcomeId, value, `user:${me.id}`);
  revalidatePath("/dashboard");
}

/** exception_panel · assign_owner — assign the underlying work item. */
export async function assignExceptionOwnerAction(formData: FormData) {
  return assignWorkItemAction(formData);
}

/** exception_panel · escalate — raise the underlying work item to high priority. */
export async function escalateWorkItemAction(formData: FormData) {
  const id = String(formData.get("id"));
  const me = getDemoSession();
  store.escalateWorkItem(id, `user:${me.id}`);
  revalidatePath("/dashboard");
  revalidatePath(`/work/${id}`);
}

/** exception_panel · create_work_item — spin up a linked follow-up. */
export async function createFollowUpAction(formData: FormData) {
  const id = String(formData.get("id"));
  const me = getDemoSession();
  const wi = store.createFollowUpWorkItem(id, `user:${me.id}`);
  revalidatePath("/dashboard");
  revalidatePath("/work");
  if (wi) revalidatePath(`/work/${wi.id}`);
}

/** exception_panel · dismiss — suppress a derived exception kind with an audit trail. */
export async function dismissExceptionAction(formData: FormData) {
  const id = String(formData.get("id"));
  const kind = String(formData.get("kind"));
  const me = getDemoSession();
  store.dismissException(id, kind, `user:${me.id}`);
  revalidatePath("/dashboard");
}

export async function decideProposalAction(formData: FormData) {
  const id = String(formData.get("id"));
  const decision = String(formData.get("decision")) as "approved" | "rejected";
  // Routes through the kernel contract (authorize "decide") — the human-in-the-
  // loop gate is now permission-gated, not ad-hoc.
  contracts.decideProposal(id, decision);
  revalidatePath("/proposals");
  revalidatePath("/dashboard");
}

export async function promoteProposalAction(formData: FormData) {
  const id = String(formData.get("id"));
  // Routes through the kernel contract (authorize "promote"): promoting agent
  // output into real work is a tenant-write the permission engine gates.
  const res = contracts.promoteProposal(id);
  const wi = res.ok ? res.value : undefined;
  revalidatePath("/proposals");
  revalidatePath("/work");
  revalidatePath("/dashboard");
  if (wi) revalidatePath(`/work/${wi.id}`);
}

/**
 * Recompute the workspace's universal metrics from real activity (§3.24). A
 * widget action declared on the value-stage widgets; cartridge-blind — the
 * engine reads metric definitions from configuration, never a vertical.
 */
export async function recomputeMetricsAction(formData: FormData) {
  const workspaceId = String(formData.get("workspaceId"));
  if (!store.getWorkspace(workspaceId)) return;
  store.recomputeMetrics(workspaceId);
  // Refresh metric-linked outcomes so the value end of the loop tracks the fresh
  // metric (observed actuals + trend); unlinked outcomes keep their estimates.
  store.recomputeOutcomes(workspaceId);
  revalidatePath("/dashboard");
}

/**
 * Generate a report instance from current evidence + metrics (§3.25). The
 * report_list widget declares a `generate` action. The report key is resolved
 * from the workspace's active configuration when not supplied, keeping the
 * renderer cartridge-blind: the UI passes only the workspaceId, the config
 * supplies the available report definitions.
 */
export async function generateReportAction(formData: FormData) {
  const workspaceId = String(formData.get("workspaceId"));
  const ws = store.getWorkspace(workspaceId);
  if (!ws) return;
  const requested = formData.get("reportKey");
  const reportKey =
    (typeof requested === "string" && requested) ||
    getConfiguration(ws.cartridge_key)?.reports[0]?.key;
  if (!reportKey) return;
  const me = getDemoSession();
  store.generateReport(workspaceId, reportKey, `user:${me.id}`);
  revalidatePath("/dashboard");
}
