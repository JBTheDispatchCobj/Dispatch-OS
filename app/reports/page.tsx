// app/reports/page.tsx
//
// Olympic Sprint IV — Wave 3. The "Reports & Builder" surface, PROMOTED from a scaffold
// to a REAL surface over the LIVE report objects. This SERVER component reads the store's
// ReportRun objects and the report_sharing approvals (across the demo workspaces), shapes
// them with the pure `buildReportsView`, and renders the client `ReportsView`. It NEVER
// shares or decides — the editorial gate (a report_sharing Approval) is decided on
// /approvals through the permission engine.
//
// Deterministic read: a fixed `as_of` stamp (no clock); the projection is a pure function
// of the seeded store, so the page prerenders statically.

import { store } from "@/core/data";
import { buildReportsView } from "@/app/_surfaces/reports_view";
import { ReportsView } from "@/components/terminal/ReportsView";
import type { Approval, ReportRun } from "@/core/types";

export const metadata = {
  title: "Reports & Builder",
  description:
    "The live report objects — sections, evidence references, and the report-sharing editorial gate each owes. Sharing decisions route through the permission engine on /approvals.",
};

const AS_OF = "2026-07-22T00:00:00.000Z";

export default function ReportsPage() {
  // NOTE (demo scope): single seeded in-memory store, session is a workspace owner, so
  // this composites across the demo workspaces (each row labeled by workspace). A real
  // multi-tenant store must scope the read to the principal's workspaces (tracked in
  // DEBUG_LOG [DEFERRED], same as /approvals). The share/decision paths are authorize-gated.
  const workspaces = store.listWorkspaces();
  const workspaceLabels: Record<string, string> = {};
  const reports: ReportRun[] = [];
  const approvals: Approval[] = [];

  for (const ws of workspaces) {
    workspaceLabels[ws.id] = ws.name;
    reports.push(...store.listReports(ws.id));
    approvals.push(...store.listApprovals(ws.id));
  }

  const vm = buildReportsView({ reports, approvals, workspaceLabels }, { as_of: AS_OF });
  return <ReportsView vm={vm} />;
}
