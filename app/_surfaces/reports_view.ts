// app/_surfaces/reports_view.ts
//
// Olympic Sprint IV — Wave 3. The PURE view-model builder for the `/reports` surface
// (promoted from a scaffold to a REAL surface over the LIVE report objects).
//
// It projects the store's `ReportRun` objects into a browse/triage view and joins each
// to its editorial gate — the `report_sharing` Approval (the report-lifecycle
// realization of the EditorialDisposition family). A report is not shareable until an
// authorized human clears it; this builder REPORTS which reports owe that gate and
// which are cleared, and renders the doctrine states distinctly:
//   * pending_approval — status `under_review`, OR a linked `requested` report_sharing
//                        Approval (the editorial/share gate still owes a decision);
//   * stale            — generated past its freshness window (age from generated_at),
//                        OR generated with recorded missing-data gaps;
//   * restricted       — a `draft` (internal-only — not yet cleared for sharing);
//   * current          — cleared (approved / shared) and fresh.
//
// GATE DISCIPLINE. This builder NEVER shares, approves, or transitions a report. The
// actual editorial decision is a `report_sharing` Approval taken on /approvals through
// the permission engine (store.requestReportShare → store.setReportStatus on an
// authorized decision). The projection can never flip a report to shared.
//
// GENERIC (no vertical noun; the freshness window is INJECTED config-as-data) + PURE
// (no store, no clock — `as_of` injected; age via Date.parse over injected ISO
// strings). ERASABLE-ONLY TS so the debug loop + `node --test` import it directly.

import type { Approval, ReportRun, ReportRunStatus } from "@/core/types";
import { ageDaysBetween } from "@/app/_surfaces/evidence_view";

export type ReportState = "current" | "stale" | "pending_approval" | "restricted";

/** Past this age (days), a report reads as STALE (its evidence snapshot has aged). */
export const REPORT_STALE_DAYS = 90;

/** The report_sharing approval type — the report-lifecycle editorial/share gate. */
export const REPORT_SHARING_APPROVAL_TYPE = "report_sharing";

export interface ReportRowVM {
  id: string;
  report_key: string;
  title: string;
  status: ReportRunStatus;
  workspace_id: string;
  workspace_label: string;
  generated_at: string;
  generated_by: string | null;
  ageDays: number;
  sectionCount: number;
  sourceRefCount: number;
  /** Plain-language notes about data missing at generation (never hidden). */
  missingDataNotes: string[];
  /** A linked `requested` report_sharing Approval owes the editorial gate. */
  pendingShare: boolean;
  linkedShareApprovalId: string | null;
  states: ReportState[];
}

export interface ReportsVM {
  generatedAt: string;
  counts: {
    total: number;
    pendingApproval: number;
    stale: number;
    restricted: number;
    shared: number;
    withGaps: number;
  };
  rows: ReportRowVM[];
}

/** Lifecycle statuses that are cleared-for-sharing (no share gate owed). */
const CLEARED_STATUSES: ReportRunStatus[] = ["approved", "shared"];

/** The doctrine states one report row renders distinctly. */
export function reportStates(row: {
  status: ReportRunStatus;
  stale: boolean;
  pendingShare: boolean;
  hasGaps: boolean;
}): ReportState[] {
  const states: ReportState[] = [];
  const pending = row.status === "under_review" || row.pendingShare;
  if (pending) states.push("pending_approval");
  if (row.status === "draft") states.push("restricted");
  if (row.stale || row.hasGaps) states.push("stale");
  // `current` means cleared (approved/shared) AND fresh AND not otherwise flagged.
  if (
    states.length === 0 &&
    CLEARED_STATUSES.includes(row.status) &&
    !row.stale &&
    !row.hasGaps
  ) {
    states.push("current");
  }
  // A generated-but-not-yet-submitted report with no gaps and fresh is still current
  // (it exists and is accurate) — but never one that is pending/draft/stale.
  if (states.length === 0) states.push("current");
  return states;
}

export interface ReportsInput {
  reports: ReportRun[];
  /** All approvals in scope; the builder filters to report_sharing itself. */
  approvals: Approval[];
  workspaceLabels?: Record<string, string>;
  /** Injected freshness window (defaults to 90d). */
  staleDays?: number;
}

/** Deterministic ascending compare by a key then id (total order). */
function byKeyThenId(ka: string, kb: string, ia: string, ib: string): number {
  if (ka < kb) return -1;
  if (ka > kb) return 1;
  return ia < ib ? -1 : ia > ib ? 1 : 0;
}

/**
 * Build the `/reports` view-model from LIVE report objects. Deterministic: reports
 * that owe the editorial gate sink to the top (attention owed), then most-recent by
 * generated_at, then id. NEVER mutates the input; NEVER shares or decides.
 */
export function buildReportsView(input: ReportsInput, opts: { as_of: string }): ReportsVM {
  const labels = input.workspaceLabels ?? {};
  const staleDays = input.staleDays ?? REPORT_STALE_DAYS;

  // Map each report to its linked `requested` report_sharing approval (by metadata).
  const shareApprovalByReport = new Map<string, string>();
  for (const a of input.approvals) {
    if (a.status !== "requested" || a.approval_type !== REPORT_SHARING_APPROVAL_TYPE) continue;
    const reportId = typeof a.metadata?.report_id === "string" ? a.metadata.report_id : null;
    if (reportId && !shareApprovalByReport.has(reportId)) {
      shareApprovalByReport.set(reportId, a.id);
    }
  }

  const rows: ReportRowVM[] = input.reports.map((r) => {
    const status: ReportRunStatus = r.status ?? "generated";
    const ageDays = ageDaysBetween(r.generated_at, opts.as_of);
    const stale = ageDays > staleDays;
    const missingDataNotes = r.missing_data_notes ?? [];
    const hasGaps = missingDataNotes.length > 0;
    const linkedShareApprovalId = shareApprovalByReport.get(r.id) ?? null;
    const pendingShare = linkedShareApprovalId != null;
    return {
      id: r.id,
      report_key: r.report_key,
      title: r.title ?? r.report_key,
      status,
      workspace_id: r.workspace_id,
      workspace_label: labels[r.workspace_id] ?? r.workspace_id,
      generated_at: r.generated_at,
      generated_by: r.generated_by ?? null,
      ageDays,
      sectionCount: r.sections?.length ?? 0,
      sourceRefCount: r.source_references?.length ?? 0,
      missingDataNotes,
      pendingShare,
      linkedShareApprovalId,
      states: reportStates({ status, stale, pendingShare, hasGaps }),
    };
  });

  rows.sort((a, b) => {
    const rank = (r: ReportRowVM) => (r.states.includes("pending_approval") ? 0 : 1);
    const ra = rank(a);
    const rb = rank(b);
    if (ra !== rb) return ra - rb;
    if (a.generated_at !== b.generated_at) return a.generated_at < b.generated_at ? 1 : -1; // newest first
    return byKeyThenId(a.title, b.title, a.id, b.id);
  });

  const counts = {
    total: rows.length,
    pendingApproval: rows.filter((r) => r.states.includes("pending_approval")).length,
    stale: rows.filter((r) => r.states.includes("stale")).length,
    restricted: rows.filter((r) => r.states.includes("restricted")).length,
    shared: rows.filter((r) => r.status === "shared").length,
    withGaps: rows.filter((r) => r.missingDataNotes.length > 0).length,
  };

  return { generatedAt: opts.as_of, counts, rows };
}
