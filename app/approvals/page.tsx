// app/approvals/page.tsx
//
// Olympic Sprint IV — Wave 1. The "Approvals" surface, PROMOTED from a scaffold to
// a REAL surface over the LIVE human gate. This SERVER component reads the approval
// objects from the store (across every workspace), shapes them with the pure
// `buildApprovalsView`, and renders the client `ApprovalsView`. Deciding routes
// through the EXISTING permission-engine contract (`decideApprovalAction` →
// `app/contracts.decideApproval`) — never an auto-approval, never a hidden control.
//
// Deterministic read: a fixed `as_of` stamp (no clock) so the page prerenders
// statically; the projection is a pure function of the seeded store.

import { store } from "@/core/data";
import { buildApprovalsView } from "@/app/_surfaces/approvals_view";
import { ApprovalsView } from "@/components/terminal/ApprovalsView";
import type { Approval } from "@/core/types";

export const metadata = {
  title: "Approvals",
  description:
    "The live human approval queue — final lending, investment, compliance, and capital-allocation decisions require an authorized human approval, routed through the permission engine.",
};

const AS_OF = "2026-07-22T00:00:00.000Z";

export default function ApprovalsPage() {
  // NOTE (demo scope): the demo is a single seeded in-memory store and the session is a
  // workspace owner, so this composites approvals across the demo workspaces (each row is
  // labeled by workspace — no truth-tier/plane conflation). When this surface reads a real
  // MULTI-TENANT store, the read must be scoped to the principal's workspaces (or routed
  // through the same permission-engine guard as the write path). Tracked in DEBUG_LOG
  // [DEFERRED]. The WRITE path (decide) is already authorize-gated via app/contracts.
  const workspaces = store.listWorkspaces();
  const workspaceLabels: Record<string, string> = {};
  const approvals: Approval[] = [];
  for (const ws of workspaces) {
    workspaceLabels[ws.id] = ws.name;
    approvals.push(...store.listApprovals(ws.id));
  }
  const vm = buildApprovalsView(approvals, { workspaceLabels, as_of: AS_OF });
  return <ApprovalsView vm={vm} />;
}
