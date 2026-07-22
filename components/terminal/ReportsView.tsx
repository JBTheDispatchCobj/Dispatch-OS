//
// components/terminal/ReportsView.tsx — Olympic Sprint IV Wave 3.
//
// The `/reports` surface, PROMOTED from a scaffold to a REAL surface over the LIVE
// report objects. It renders the store's ReportRun objects (built by the pure
// `buildReportsView`), each joined to its editorial gate — the `report_sharing`
// Approval — with the doctrine states rendered distinctly.
//
// THE EDITORIAL GATE IS REAL, NOT A HIDDEN CONTROL. This surface reports which reports
// owe the share/editorial decision (pending_approval), which have data gaps or have
// aged (stale), and which are internal-only drafts (restricted). It does NOT share,
// approve, or transition anything — the decision is a `report_sharing` Approval taken
// on /approvals through the permission engine. Missing-data notes are shown, never
// hidden. Look/feel is DEFERRED (Terminal polish sprint); reuses the app design tokens.
//
// Pure presentational SERVER component (no hooks, no data/engine imports) — renders a
// serializable VM, so it prerenders statically with no client bundle.

import Link from "next/link";
import type React from "react";
import type { ReportsVM, ReportRowVM, ReportState } from "@/app/_surfaces/reports_view";

const STATE_COLOR: Record<ReportState, string> = {
  current: "var(--good)",
  stale: "var(--warn)",
  pending_approval: "var(--review)",
  restricted: "var(--bad)",
};

export function ReportsView({ vm }: { vm: ReportsVM }): React.JSX.Element {
  return (
    <div style={{ maxWidth: 1120, margin: "0 auto" }}>
      <div className="eyebrow">Dashboards &amp; Reports · Reports &amp; Builder · live report objects</div>
      <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", margin: "4px 0 6px" }}>
        <h1 style={{ margin: 0, fontSize: 24 }}>Reports &amp; Builder</h1>
        <span className="chip chip--review">{vm.counts.pendingApproval} awaiting the editorial gate</span>
        <span className="chip" style={{ color: "var(--muted)", marginLeft: "auto" }}>generated {vm.generatedAt}</span>
      </div>
      <p className="muted" style={{ fontSize: 13, marginTop: 0, maxWidth: 900 }}>
        The live report objects. Exports preserve their evidence references and generation timestamp; a report is not
        shareable until an authorized human clears it — the <span style={{ color: "var(--review)" }}>report-sharing</span>{" "}
        editorial gate is decided on /approvals, never here. Data missing at generation is shown, never hidden.
      </p>

      <div className="tiles" style={{ marginBottom: 12 }}>
        <Tile value={vm.counts.total} label="reports" />
        <Tile value={vm.counts.pendingApproval} label="awaiting the gate" color={vm.counts.pendingApproval > 0 ? "var(--review)" : undefined} />
        <Tile value={vm.counts.stale} label="stale / with gaps" color={vm.counts.stale > 0 ? "var(--warn)" : undefined} />
        <Tile value={vm.counts.shared} label="shared" />
      </div>

      <div className="list">
        {vm.rows.map((r) => <ReportRow key={r.id} r={r} />)}
        {vm.rows.length === 0 && (
          <div className="muted" style={{ fontSize: 13, padding: 12 }}>No reports generated yet.</div>
        )}
      </div>
    </div>
  );
}

function ReportRow({ r }: { r: ReportRowVM }): React.JSX.Element {
  return (
    <section className="card">
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", alignItems: "baseline" }}>
        <div style={{ minWidth: 0 }}>
          <span style={{ fontWeight: 600, fontSize: 15 }}>{r.title}</span>
          <span className="muted" style={{ marginLeft: 8, fontSize: 12, fontFamily: "var(--mono)" }}>{r.report_key}</span>
        </div>
        <span style={{ display: "inline-flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
          {r.states.map((s) => (
            <span key={s} className="chip" style={{ color: STATE_COLOR[s], borderColor: STATE_COLOR[s] }}>
              {s.replace(/_/g, " ")}
            </span>
          ))}
          <span className="chip" style={{ color: "var(--muted)" }}>{r.status.replace(/_/g, " ")}</span>
        </span>
      </div>

      <div className="event" style={{ fontSize: 11.5, marginTop: 6 }}>
        {r.sectionCount} section{r.sectionCount === 1 ? "" : "s"} · {r.sourceRefCount} evidence reference{r.sourceRefCount === 1 ? "" : "s"} · generated {r.generated_at}
        {r.generated_by ? ` · by ${r.generated_by}` : ""} · {r.ageDays}d old · {r.workspace_label}
      </div>

      {r.pendingShare && r.linkedShareApprovalId && (
        <div style={{ marginTop: 6, fontSize: 12 }}>
          <Link href="/approvals" style={{ color: "var(--review)" }}>
            → editorial gate: report-sharing approval {r.linkedShareApprovalId} awaiting a decision on /approvals
          </Link>
        </div>
      )}

      {r.missingDataNotes.length > 0 && (
        <div style={{ marginTop: 6 }}>
          <div className="eyebrow" style={{ color: "var(--warn)", marginBottom: 4 }}>Data missing at generation</div>
          <div className="list">
            {r.missingDataNotes.map((note, i) => (
              <div key={i} className="event" style={{ fontSize: 11.5, color: "var(--warn)" }}>{note}</div>
            ))}
          </div>
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
