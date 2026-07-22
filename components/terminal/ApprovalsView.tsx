"use client";
//
// components/terminal/ApprovalsView.tsx — Olympic Sprint IV Wave 1.
//
// The client "Approvals" surface, PROMOTED from a scaffold to a REAL surface over
// the LIVE human gate. It renders the approval queue built from the store
// (`buildApprovalsView`) — AWAITING (a human still owes a decision) vs DECIDED —
// each row carrying its lineage (the work item / decision / proposal it governs)
// and its doctrine states (pending_approval / restricted / current).
//
// THE GATE IS REAL, NOT A HIDDEN CONTROL. Approve / request-changes / reject post
// to the EXISTING server action `decideApprovalAction`, which routes THROUGH the
// permission-engine contract (`app/contracts.decideApproval` → authorize "approve"
// → the 0016/0017 RLS mirror). A regulated capital/compliance/lending approval is
// owner/admin-only; a non-authorized principal gets a typed refusal. Nothing here
// auto-approves; the projection can never flip a pending approval.
//
// Look/feel is DEFERRED (Terminal polish sprint). Reuses the app design tokens so
// the surface reads as one product with /review, /proposals, /network.

import { useState } from "react";
import type React from "react";
import { decideApprovalAction } from "@/app/actions";
import type { ApprovalsVM, ApprovalRowVM } from "@/app/_surfaces/approvals_view";

type Tab = "awaiting" | "decided";

const STATUS_COLOR: Record<string, string> = {
  requested: "var(--review)",
  approved: "var(--good)",
  rejected: "var(--bad)",
  expired: "var(--muted)",
  canceled: "var(--muted)",
};

export function ApprovalsView({ vm }: { vm: ApprovalsVM }): React.JSX.Element {
  const [tab, setTab] = useState<Tab>(vm.awaiting.length > 0 ? "awaiting" : "decided");
  const rows = tab === "awaiting" ? vm.awaiting : vm.decided;

  return (
    <div style={{ maxWidth: 1120, margin: "0 auto" }}>
      <div className="eyebrow">Evidence &amp; Approvals · Approvals · human gate</div>
      <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", margin: "4px 0 6px" }}>
        <h1 style={{ margin: 0, fontSize: 24 }}>Approvals</h1>
        <span className="chip chip--review">{vm.counts.awaiting} awaiting</span>
        <span className="chip" style={{ color: "var(--muted)", marginLeft: "auto" }}>generated {vm.generatedAt}</span>
      </div>
      <p className="muted" style={{ fontSize: 13, marginTop: 0, maxWidth: 860 }}>
        The live human approval queue. Final lending, investment, compliance, and capital-allocation decisions require an
        authorized human approval — never an automated recommendation. Deciding routes through the permission engine
        (authorize-first); a regulated type is owner/admin-only.
      </p>

      <div className="banner">
        Nothing here is auto-approved. Approve / request changes / reject records a human decision through the
        permission-engine contract (a non-authorized principal is refused). Regulated types are marked{" "}
        <span className="chip" style={{ color: "var(--bad)", borderColor: "var(--bad)" }}>restricted</span>.
      </div>

      {/* Counters */}
      <div className="tiles" style={{ marginBottom: 12 }}>
        <Tile value={vm.counts.awaiting} label="awaiting decision" color={vm.counts.awaiting > 0 ? "var(--review)" : undefined} />
        <Tile value={vm.counts.restrictedAwaiting} label="restricted awaiting" color={vm.counts.restrictedAwaiting > 0 ? "var(--bad)" : undefined} />
        <Tile value={vm.counts.decided} label="decided" />
        <Tile value={vm.counts.total} label="total approvals" />
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <TabBtn on={tab === "awaiting"} onClick={() => setTab("awaiting")}>Awaiting ({vm.counts.awaiting})</TabBtn>
        <TabBtn on={tab === "decided"} onClick={() => setTab("decided")}>Decided ({vm.counts.decided})</TabBtn>
      </div>

      <div className="list">
        {rows.map((r) => <ApprovalRow key={r.id} row={r} />)}
        {rows.length === 0 && (
          <div className="muted" style={{ fontSize: 13, padding: 12 }}>
            {tab === "awaiting" ? "No approvals awaiting a decision." : "No decided approvals yet."}
          </div>
        )}
      </div>
    </div>
  );
}

function ApprovalRow({ row }: { row: ApprovalRowVM }): React.JSX.Element {
  const color = STATUS_COLOR[row.status] ?? "var(--muted)";
  return (
    <div className="qrow" style={row.restricted ? { borderLeft: "3px solid var(--bad)" } : undefined}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", alignItems: "baseline" }}>
        <div style={{ minWidth: 0 }}>
          <span style={{ fontWeight: 600, fontSize: 14 }}>{row.approval_type.replace(/_/g, " ")}</span>
          <span className="muted" style={{ marginLeft: 8, fontSize: 12, fontFamily: "var(--mono)" }}>{row.workspace_label}</span>
        </div>
        <span style={{ display: "inline-flex", gap: 6, flexWrap: "wrap" }}>
          {row.states.map((s) => (
            <span key={s} className="chip" style={{ color: s === "restricted" ? "var(--bad)" : s === "pending_approval" ? "var(--review)" : "var(--good)", borderColor: s === "restricted" ? "var(--bad)" : s === "pending_approval" ? "var(--review)" : "var(--good)" }}>
              {s.replace(/_/g, " ")}
            </span>
          ))}
          <span className="chip" style={{ color, borderColor: color, fontWeight: 600 }}>{row.status}</span>
        </span>
      </div>

      {/* Lineage — what this approval governs */}
      <div className="muted" style={{ fontSize: 11.5, fontFamily: "var(--mono)", margin: "6px 0" }}>
        {row.hasLineage ? (
          <>
            {row.lineage.work_item_id && <>work item {row.lineage.work_item_id} · </>}
            {row.lineage.decision_id && <>decision {row.lineage.decision_id} · </>}
            {row.lineage.agent_proposal_id && <>proposal {row.lineage.agent_proposal_id} · </>}
            {row.lineage.input_id && <>input {row.lineage.input_id} · </>}
            {row.requested_by ? `requested by ${row.requested_by}` : ""}{row.approved_by ? ` · by ${row.approved_by}` : ""}
          </>
        ) : (
          <>no linked object · {row.requested_by ?? "—"}</>
        )}
      </div>
      {row.notes && <div className="muted" style={{ fontSize: 12, marginBottom: 8 }}>“{row.notes}”</div>}

      {/* The human gate — only for an awaiting approval */}
      {row.decidable ? (
        <div className="btnrow" style={{ justifyContent: "flex-end", gap: 6 }}>
          <form action={decideApprovalAction} className="inlineform">
            <input type="hidden" name="approvalId" value={row.id} />
            <input type="hidden" name="decision" value="changes_requested" />
            <button type="submit" className="btn btn--sm">request changes</button>
          </form>
          <form action={decideApprovalAction} className="inlineform">
            <input type="hidden" name="approvalId" value={row.id} />
            <input type="hidden" name="decision" value="rejected" />
            <button type="submit" className="btn btn--sm btn--bad">reject</button>
          </form>
          <form action={decideApprovalAction} className="inlineform">
            <input type="hidden" name="approvalId" value={row.id} />
            <input type="hidden" name="decision" value="approved" />
            <button type="submit" className="btn btn--sm btn--good">approve</button>
          </form>
        </div>
      ) : (
        <div className="event" style={{ fontSize: 12 }}>
          Decided{row.updated_at ? ` · ${row.updated_at}` : ""}{row.approved_by ? ` · by ${row.approved_by}` : ""} — a human action, logged.
        </div>
      )}
    </div>
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

function TabBtn({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }): React.JSX.Element {
  return (
    <button type="button" className={`pill${on ? " pill--on" : ""}`} onClick={onClick} aria-pressed={on}>
      {children}
    </button>
  );
}
