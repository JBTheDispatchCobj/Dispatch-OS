"use client";
//
// components/terminal/WorkflowsView.tsx — Olympic Sprint IV Wave 2.
//
// The `/workflows` surface, PROMOTED from a scaffold to a REAL surface over the LIVE
// work-item queue. It renders the live work items grouped by workflow (built by the pure
// `buildWorkflowsView`), each group joined to its cartridge workflow DEFINITION (label /
// owner role / whether it requires an approval), with a status rollup and the human gate
// each item owes.
//
// THE GATE IS REAL, NOT A HIDDEN CONTROL. This surface reports which work items owe a
// human review/approval (pending_approval) and which are stuck (conflicted); it does NOT
// decide, promote, or transition anything. The actual decisions route through the existing
// permission-engine surfaces (/work, /proposals, /approvals). Nothing here auto-advances.
//
// Look/feel is DEFERRED (Terminal polish sprint). Reuses the app design tokens.

import { useState } from "react";
import type React from "react";
import type { WorkflowsVM, WorkflowGroupVM, WorkflowState } from "@/app/_surfaces/workflows_view";

const STATE_COLOR: Record<WorkflowState, string> = {
  current: "var(--good)",
  pending_approval: "var(--review)",
  conflicted: "var(--bad)",
};

export function WorkflowsView({ vm }: { vm: WorkflowsVM }): React.JSX.Element {
  return (
    <div style={{ maxWidth: 1120, margin: "0 auto" }}>
      <div className="eyebrow">Work · Workflows &amp; Tasks · live work items</div>
      <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", margin: "4px 0 6px" }}>
        <h1 style={{ margin: 0, fontSize: 24 }}>Workflows &amp; Tasks</h1>
        <span className="chip chip--review">{vm.counts.pendingApprovals} awaiting a gate</span>
        <span className="chip" style={{ color: "var(--muted)", marginLeft: "auto" }}>generated {vm.generatedAt}</span>
      </div>
      <p className="muted" style={{ fontSize: 13, marginTop: 0, maxWidth: 880 }}>
        The live work items grouped by workflow, each joined to its cartridge definition. This surface triages: it shows
        which items owe a human gate (<span style={{ color: "var(--review)" }}>pending approval</span>) or are stuck
        (<span style={{ color: "var(--bad)" }}>conflicted</span>). Decisions are taken on their own surfaces
        (/work, /proposals, /approvals) through the permission engine — nothing here auto-advances.
      </p>

      <div className="tiles" style={{ marginBottom: 12 }}>
        <Tile value={vm.counts.workflows} label="workflows" />
        <Tile value={vm.counts.items} label="work items" />
        <Tile value={vm.counts.awaiting} label="awaiting a gate" color={vm.counts.awaiting > 0 ? "var(--review)" : undefined} />
        <Tile value={vm.counts.blocked} label="blocked / conflicted" color={vm.counts.blocked > 0 ? "var(--bad)" : undefined} />
      </div>

      <div className="list">
        {vm.groups.map((g) => <WorkflowGroup key={g.kind} group={g} />)}
        {vm.groups.length === 0 && (
          <div className="muted" style={{ fontSize: 13, padding: 12 }}>No live work items.</div>
        )}
      </div>
    </div>
  );
}

function WorkflowGroup({ group }: { group: WorkflowGroupVM }): React.JSX.Element {
  const [open, setOpen] = useState(group.awaiting > 0 || group.blocked > 0);
  return (
    <section className="card">
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", alignItems: "baseline" }}>
        <div style={{ minWidth: 0 }}>
          <button type="button" className="pill" onClick={() => setOpen((v) => !v)} style={{ marginRight: 8 }}>
            {open ? "▾" : "▸"}
          </button>
          <span style={{ fontWeight: 600, fontSize: 15 }}>{group.label}</span>
          {group.unmapped && <span className="chip" style={{ marginLeft: 8, color: "var(--warn)", borderColor: "var(--warn)" }}>unmapped</span>}
          <span className="muted" style={{ marginLeft: 8, fontSize: 12, fontFamily: "var(--mono)" }}>{group.kind}</span>
        </div>
        <span style={{ display: "inline-flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
          {group.states.map((s) => (
            <span key={s} className="chip" style={{ color: STATE_COLOR[s], borderColor: STATE_COLOR[s] }}>
              {s.replace(/_/g, " ")}
            </span>
          ))}
          {group.approvalRequired && <span className="chip" style={{ color: "var(--review)", borderColor: "var(--review)" }}>approval required</span>}
        </span>
      </div>

      <div className="muted" style={{ fontSize: 12, margin: "6px 0" }}>{group.description}</div>
      <div className="event" style={{ fontSize: 11.5 }}>
        owner {group.ownerRole} · {group.priority} priority · {group.total} item{group.total === 1 ? "" : "s"} · {group.active} active · {group.awaiting} awaiting · {group.blocked} blocked
      </div>

      {open && (
        <div className="list" style={{ marginTop: 8 }}>
          {group.items.map((it) => (
            <div key={it.id} className="wrow">
              <div className="wrow__main">
                <span className="wrow__title" style={{ fontSize: 13.5 }}>{it.title}</span>
                <span className="muted" style={{ fontSize: 12, display: "block", marginTop: 2 }}>
                  {it.assignee_name ? `assigned ${it.assignee_name}` : "unassigned"} · {it.workspace_label}
                  {it.checklist.total > 0 ? ` · checklist ${it.checklist.done}/${it.checklist.total}` : ""}
                  {it.pendingApproval && it.linkedApprovalId ? ` · approval ${it.linkedApprovalId}` : ""}
                </span>
              </div>
              <div className="wrow__side">
                <span style={{ display: "inline-flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" }}>
                  {it.states.map((s) => (
                    <span key={s} className="chip" style={{ color: STATE_COLOR[s], borderColor: STATE_COLOR[s] }}>
                      {s.replace(/_/g, " ")}
                    </span>
                  ))}
                </span>
                <span className="chip" style={{ color: "var(--muted)" }}>{it.status.replace(/_/g, " ")}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function Tile({ value, label, color }: { value: number; label: string; color?: string }): React.JSX.Element {
  return (
    <div className="tile">
      <div className="tile__value" style={{ fontSize: 20, ...(color ? { color } : {}) }}>{value}</div>
      <div className="tile__label">{label}</div>
    </div>
  );
}
