// app/page.tsx — home: the command center (notification + task center) over the org and
// its cartridge workspaces.
//
// Olympic Sprint IV — Wave 3. The Home surface now leads with the TERMINAL RUNTIME's
// NOTIFICATION + TASK CENTER (Vol VII): a read-only projection over the LIVE approval,
// work-item, and evidence queues (built by the pure `buildActivityCenter`), each item
// linking to the permission-engine surface that resolves it. Nothing is decided here.
// The existing per-workspace cartridge grid is kept intact below it.
//
// Deterministic read: a fixed `as_of` stamp (no clock); the projection is a pure function
// of the seeded store, so the page prerenders statically.

import Link from "next/link";
import { store } from "@/core/data";
import { getCartridge } from "@/core/cartridge";
import { getActiveConfiguration } from "@/core/config";
import { buildActivityCenter } from "@/app/_surfaces/activity_center";
import type { EvidenceLite } from "@/app/_surfaces/activity_center";
import { ActivityCenterView } from "@/components/terminal/ActivityCenterView";
import type { Approval, WorkItem } from "@/core/types";

const AS_OF = "2026-07-22T00:00:00.000Z";

export default function Home() {
  const org = store.getOrg();
  const workspaces = store.listWorkspaces();

  // Aggregate the live queues across the demo workspaces for the notification + task
  // center (each item labeled by workspace — no plane conflation; read-only projection).
  const workspaceLabels: Record<string, string> = {};
  const approvals: Approval[] = [];
  const workItems: WorkItem[] = [];
  const evidence: EvidenceLite[] = [];
  for (const w of workspaces) {
    workspaceLabels[w.id] = w.name;
    approvals.push(...store.listApprovals(w.id));
    const items = store.listWorkItems(w.id);
    workItems.push(...items);
    for (const it of items) {
      for (const e of store.listEvidence(it.id)) {
        evidence.push({
          id: e.id,
          work_item_id: e.work_item_id,
          label: e.label,
          captured_by: e.captured_by,
          created_at: e.created_at,
          review_status: e.review_status,
          workspace_id: it.workspace_id,
          work_item_title: it.title,
        });
      }
    }
  }
  const activity = buildActivityCenter(
    { approvals, workItems, evidence, workspaceLabels },
    { as_of: AS_OF },
  );

  return (
    <div>
      <div className="eyebrow">{org.name}</div>
      <h1>Operating terminal</h1>
      <p className="banner">
        Dispatch OS core is industry-agnostic. Each workspace below runs a different <b>cartridge</b> on the
        same engine: inbound data → rules/agents interpret → proposals → human promotes → work executed →
        evidence logged → reports. Idea-state demo on an in-memory data layer (no backend).
      </p>

      <ActivityCenterView vm={activity} />

      <div className="eyebrow">Workspaces</div>
      <div className="grid2">
        {workspaces.map((w) => {
          const c = getCartridge(w.cartridge_key);
          const cfg = getActiveConfiguration(w.cartridge_key, w.id)?.configuration;
          const items = store.listWorkItems(w.id);
          const open = items.filter((i) => i.status !== "completed" && i.status !== "archived" && i.status !== "canceled").length;
          const proposals = store.listProposals(w.id).filter((p) => p.status === "pending").length;
          const review = store.reviewQueue(w.id).length;
          return (
            <Link key={w.id} href={`/work?ws=${w.id}`} className="card" style={{ display: "block" }}>
              <div className="eyebrow">{w.cartridge_key}{cfg && ` · config v${cfg.version} · ${cfg.status}`}</div>
              <div className="item__title" style={{ fontSize: 17 }}>{c?.label ?? w.name}</div>
              <p className="muted" style={{ fontSize: 13 }}>{c?.description}</p>
              <div className="item__meta">
                <span className="chip chip--open">{open} open</span>
                {review > 0 && <span className="chip chip--in_review">{review} in review</span>}
                {proposals > 0 && <span className="chip chip--agent">{proposals} proposals</span>}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
