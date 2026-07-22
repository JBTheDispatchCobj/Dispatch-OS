// app/workflows/page.tsx
//
// Olympic Sprint IV — Wave 2. The "Workflows & Tasks" surface, PROMOTED from a scaffold to
// a REAL surface over the LIVE work-item queue. This SERVER component reads the store's work
// items, checklists, and approvals (across the demo workspaces), joins each workflow `kind`
// to its cartridge DEFINITION (config-as-data), shapes them with the pure
// `buildWorkflowsView`, and renders the client `WorkflowsView`. It NEVER decides — the human
// gates route through the existing permission-engine surfaces (/work, /proposals, /approvals).
//
// Deterministic read: a fixed `as_of` stamp (no clock); the projection is a pure function of
// the seeded store, so the page prerenders statically.

import { store } from "@/core/data";
import { getConfiguration } from "@/core/cartridge";
import { buildWorkflowsView } from "@/app/_surfaces/workflows_view";
import type { WorkflowDefLite, ChecklistProgress } from "@/app/_surfaces/workflows_view";
import { WorkflowsView } from "@/components/terminal/WorkflowsView";
import type { Approval, WorkItem } from "@/core/types";

export const metadata = {
  title: "Workflows & Tasks",
  description:
    "The live work items grouped by workflow — status, owner, checklist, and the human gate each owes. Decisions route through the permission engine on their own surfaces.",
};

const AS_OF = "2026-07-22T00:00:00.000Z";

export default function WorkflowsPage() {
  // NOTE (demo scope): single seeded in-memory store, session is a workspace owner, so this
  // composites across the demo workspaces (each row labeled by workspace — no plane conflation).
  // A real multi-tenant store must scope the read to the principal's workspaces (tracked in
  // DEBUG_LOG [DEFERRED], same as /approvals). The WRITE paths are already authorize-gated.
  const workspaces = store.listWorkspaces();
  const workspaceLabels: Record<string, string> = {};
  const items: WorkItem[] = [];
  const approvals: Approval[] = [];
  const checklist: Record<string, ChecklistProgress> = {};
  const defByKind = new Map<string, WorkflowDefLite>();

  for (const ws of workspaces) {
    workspaceLabels[ws.id] = ws.name;
    approvals.push(...store.listApprovals(ws.id));
    const wsItems = store.listWorkItems(ws.id);
    items.push(...wsItems);
    for (const it of wsItems) {
      const cl = store.listChecklist(it.id);
      checklist[it.id] = { done: cl.filter((c) => c.done).length, total: cl.length };
    }
    // Collect the workflow definitions from the workspace's active cartridge (config-as-data).
    const config = getConfiguration(ws.cartridge_key);
    for (const w of config?.workflows ?? []) {
      if (!defByKind.has(w.kind)) {
        defByKind.set(w.kind, {
          kind: w.kind,
          label: w.label,
          description: w.description,
          defaultOwnerRole: w.defaultOwnerRole ?? "operator",
          defaultPriority: w.defaultPriority ?? "medium",
          approvalRequired: w.approvalRequired,
        });
      }
    }
  }

  const vm = buildWorkflowsView(
    { items, defs: [...defByKind.values()], approvals, checklist, workspaceLabels },
    { as_of: AS_OF },
  );
  return <WorkflowsView vm={vm} />;
}
