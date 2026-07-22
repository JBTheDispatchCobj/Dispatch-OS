"use client";
//
// components/terminal/EvidenceView.tsx — Olympic Sprint IV Wave 1.
//
// The client "Evidence & Provenance" surface, PROMOTED from a scaffold to a REAL
// surface over LIVE evidence. Every material claim drills through to its lineage:
// the object it supports, who captured it, when, the value payload it carries, and
// the doctrine states it renders distinctly (current / stale / inferred /
// pending_approval / restricted). It groups by object and by source, and surfaces
// the unreviewed queue that still owes a human review.
//
// THE REVIEW GATE IS REAL. Approve / reject on an unreviewed item posts to the
// EXISTING server action `reviewEvidenceAction`, which routes THROUGH the
// permission-engine contract (`app/contracts.reviewEvidence` → authorize "review").
// Nothing auto-approves; the projection can never flip an unreviewed item.
//
// Look/feel is DEFERRED. Reuses the app design tokens so the surface reads as one
// product with /approvals, /review, /network.

import { useMemo, useState } from "react";
import type React from "react";
import { reviewEvidenceAction } from "@/app/actions";
import type { EvidenceVM, EvidenceRowVM, EvidenceState } from "@/app/_surfaces/evidence_view";

type Tab = "all" | "unreviewed" | "by_object" | "by_source";

const STATE_COLOR: Record<EvidenceState, string> = {
  current: "var(--good)",
  stale: "var(--warn)",
  inferred: "var(--accent)",
  pending_approval: "var(--review)",
  restricted: "var(--bad)",
};

const REVIEW_COLOR: Record<string, string> = {
  pending: "var(--review)",
  approved: "var(--good)",
  rejected: "var(--bad)",
};

export function EvidenceView({ vm }: { vm: EvidenceVM }): React.JSX.Element {
  const [tab, setTab] = useState<Tab>(vm.counts.unreviewed > 0 ? "unreviewed" : "all");

  const groups = useMemo(() => {
    if (tab === "by_object") return groupBy(vm.rows, (r) => `${r.work_item_title}::${r.work_item_id}`);
    if (tab === "by_source") return groupBy(vm.rows, (r) => r.captured_by);
    const rows = tab === "unreviewed" ? vm.rows.filter((r) => r.decidable) : vm.rows;
    return [{ key: "", rows }];
  }, [tab, vm.rows]);

  return (
    <div style={{ maxWidth: 1120, margin: "0 auto" }}>
      <div className="eyebrow">Evidence &amp; Approvals · Evidence &amp; Provenance · lineage</div>
      <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", margin: "4px 0 6px" }}>
        <h1 style={{ margin: 0, fontSize: 24 }}>Evidence &amp; Provenance</h1>
        {vm.counts.unreviewed > 0 && <span className="chip chip--review">{vm.counts.unreviewed} unreviewed</span>}
        <span className="chip" style={{ color: "var(--muted)", marginLeft: "auto" }}>generated {vm.generatedAt}</span>
      </div>
      <p className="muted" style={{ fontSize: 13, marginTop: 0, maxWidth: 860 }}>
        Every material claim drills through to source, capture, date, and review status. Inferred (agent-captured) values
        are marked as inferences, not facts; stale evidence is flagged past its freshness window; source-document-backed
        items are restricted. Reviewing routes through the permission engine (authorize-first).
      </p>

      <div className="banner">
        Nothing here is auto-approved. Approve / reject records a human review through the permission-engine contract.
        States are rendered <em>visibly distinct</em> — an inference is never shown as a hard fact, missing/stale is never
        silently normalized.
      </div>

      {/* Counters (each state visibly distinct) */}
      <div className="tiles" style={{ marginBottom: 12 }}>
        <Tile value={vm.counts.unreviewed} label="unreviewed" color={vm.counts.unreviewed > 0 ? "var(--review)" : undefined} />
        <Tile value={vm.counts.inferred} label="inferred" color={vm.counts.inferred > 0 ? "var(--accent)" : undefined} />
        <Tile value={vm.counts.stale} label="stale" color={vm.counts.stale > 0 ? "var(--warn)" : undefined} />
        <Tile value={vm.counts.restricted} label="restricted" color={vm.counts.restricted > 0 ? "var(--bad)" : undefined} />
        <Tile value={vm.counts.approved} label="approved" color="var(--good)" />
        <Tile value={vm.counts.total} label="total" />
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
        <TabBtn on={tab === "unreviewed"} onClick={() => setTab("unreviewed")}>Unreviewed ({vm.counts.unreviewed})</TabBtn>
        <TabBtn on={tab === "all"} onClick={() => setTab("all")}>All ({vm.counts.total})</TabBtn>
        <TabBtn on={tab === "by_object"} onClick={() => setTab("by_object")}>By object</TabBtn>
        <TabBtn on={tab === "by_source"} onClick={() => setTab("by_source")}>By source</TabBtn>
      </div>

      {groups.map((g) => (
        <div key={g.key || "flat"} style={{ marginBottom: g.key ? 14 : 0 }}>
          {g.key && (
            <div className="eyebrow" style={{ margin: "6px 0 8px" }}>
              {tab === "by_object" ? g.key.split("::")[0] : g.key} · {g.rows.length}
            </div>
          )}
          <div className="list">
            {g.rows.map((r) => <EvidenceRow key={r.id} row={r} />)}
          </div>
        </div>
      ))}
      {vm.rows.length === 0 && <div className="muted" style={{ fontSize: 13, padding: 12 }}>No evidence captured yet.</div>}
      {tab === "unreviewed" && vm.counts.unreviewed === 0 && (
        <div className="muted" style={{ fontSize: 13, padding: 12 }}>No evidence is awaiting review.</div>
      )}
    </div>
  );
}

function EvidenceRow({ row }: { row: EvidenceRowVM }): React.JSX.Element {
  const rc = REVIEW_COLOR[row.review_status] ?? "var(--muted)";
  return (
    <div className="qrow" style={row.decidable ? { borderLeft: "3px solid var(--review)" } : undefined}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", alignItems: "baseline" }}>
        <div style={{ minWidth: 0 }}>
          <span style={{ fontWeight: 600, fontSize: 14 }}>{row.label}</span>
          <span className="chip chip--kind" style={{ marginLeft: 8 }}>{row.kind}</span>
        </div>
        <span style={{ display: "inline-flex", gap: 6, flexWrap: "wrap" }}>
          {row.states.map((s) => (
            <span key={s} className="chip" style={{ color: STATE_COLOR[s], borderColor: STATE_COLOR[s] }}>{s.replace(/_/g, " ")}</span>
          ))}
          <span className="chip" style={{ color: rc, borderColor: rc, fontWeight: 600 }}>{row.review_status}</span>
        </span>
      </div>

      {/* Lineage / drill-through */}
      <div className="muted" style={{ fontSize: 11.5, fontFamily: "var(--mono)", margin: "6px 0" }}>
        supports {row.work_item_title} ({row.work_item_id}) · {row.workspace_label}
        <br />
        captured by {row.captured_by} · {row.created_at} · age {row.ageDays}d
        {row.document_id ? ` · doc ${row.document_id}` : ""}
        {row.reviewed_by ? ` · reviewed by ${row.reviewed_by}${row.reviewed_at ? ` @ ${row.reviewed_at}` : ""}` : ""}
      </div>
      {row.valueKeys.length > 0 && (
        <div className="muted" style={{ fontSize: 11.5, marginBottom: 8 }}>
          fields: <span style={{ fontFamily: "var(--mono)" }}>{row.valueKeys.join(", ")}</span>
        </div>
      )}

      {/* The review gate — only for an unreviewed item */}
      {row.decidable ? (
        <div className="btnrow" style={{ justifyContent: "flex-end", gap: 6 }}>
          <form action={reviewEvidenceAction} className="inlineform">
            <input type="hidden" name="evidenceId" value={row.id} />
            <input type="hidden" name="decision" value="rejected" />
            <button type="submit" className="btn btn--sm btn--bad">reject</button>
          </form>
          <form action={reviewEvidenceAction} className="inlineform">
            <input type="hidden" name="evidenceId" value={row.id} />
            <input type="hidden" name="decision" value="approved" />
            <button type="submit" className="btn btn--sm btn--good">approve</button>
          </form>
        </div>
      ) : (
        <div className="event" style={{ fontSize: 12 }}>Reviewed — {row.review_status}, a human action, logged.</div>
      )}
    </div>
  );
}

function groupBy(rows: EvidenceRowVM[], keyOf: (r: EvidenceRowVM) => string): { key: string; rows: EvidenceRowVM[] }[] {
  const map = new Map<string, EvidenceRowVM[]>();
  for (const r of rows) {
    const k = keyOf(r);
    const arr = map.get(k);
    if (arr) arr.push(r);
    else map.set(k, [r]);
  }
  return Array.from(map.entries())
    .map(([key, rs]) => ({ key, rows: rs }))
    .sort((a, b) => (a.key < b.key ? -1 : a.key > b.key ? 1 : 0));
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
