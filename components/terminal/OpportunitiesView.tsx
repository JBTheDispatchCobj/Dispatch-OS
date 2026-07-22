"use client";
//
// components/terminal/OpportunitiesView.tsx — Olympic Sprint IV Wave 2.
//
// The `/opportunities` surface, PROMOTED from a scaffold to a REAL surface over the
// deal-engine output. It renders sourced, scored opportunities (built by the pure
// `buildOpportunitiesView` over the intake → deal-engine run): the opportunity score,
// the advance/hold/decline/blocked recommendation, its lineage, and the ICApproval
// human gate.
//
// THE GATE IS REAL, NOT A HIDDEN CONTROL — and this is a TRIAGE surface, not the
// decision surface, so it exposes NO auto-advance button. A recommended-to-advance
// opportunity is marked pending_approval: advancing it to allocation requires the
// ICApproval human gate (proven by the pipeline — an unapproved deal halts
// awaiting_approval and allocates/settles/publishes nothing). Every score is a Dispatch
// inference (inferred), never a fact; a blocked deal is conflicted. Nothing here decides.
//
// Look/feel is DEFERRED (Terminal polish sprint). Reuses the app design tokens.

import { useState } from "react";
import type React from "react";
import type {
  OpportunitiesVM,
  OpportunityRowVM,
  OpportunityState,
} from "@/app/_surfaces/opportunities_view";

type Tab = "open" | "blocked";

const STATE_COLOR: Record<OpportunityState, string> = {
  current: "var(--good)",
  inferred: "var(--accent)",
  pending_approval: "var(--review)",
  conflicted: "var(--bad)",
};

const REC_COLOR: Record<string, string> = {
  advance: "var(--good)",
  hold: "var(--warn)",
  decline: "var(--muted)",
  blocked: "var(--bad)",
};

export function OpportunitiesView({ vm }: { vm: OpportunitiesVM }): React.JSX.Element {
  const [tab, setTab] = useState<Tab>(vm.open.length > 0 ? "open" : "blocked");
  const rows = tab === "open" ? vm.open : vm.blocked;

  return (
    <div style={{ maxWidth: 1120, margin: "0 auto" }}>
      <div className="eyebrow">Opportunities · deal engine · human-gated</div>
      <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", margin: "4px 0 6px" }}>
        <h1 style={{ margin: 0, fontSize: 24 }}>Opportunities</h1>
        <span className="chip chip--review">{vm.counts.awaitingApproval} awaiting IC approval</span>
        <span className="chip" style={{ color: "var(--muted)", marginLeft: "auto" }}>generated {vm.generatedAt}</span>
      </div>
      <p className="muted" style={{ fontSize: 13, marginTop: 0, maxWidth: 880 }}>
        Sourced, scored opportunities from the deal engine running on normalized startup intake. Every score is a{" "}
        <span style={{ color: "var(--accent)" }}>Dispatch inference</span>, never a fact. The engine only recommends —
        advancing an opportunity to allocation requires the <b>ICApproval</b> human gate; nothing here advances
        automatically, so a recommended-to-advance opportunity is marked{" "}
        <span style={{ color: "var(--review)" }}>pending approval</span>.
      </p>

      <div className="banner">
        This is a triage surface — it has no auto-advance control. The ICApproval decision is the committee&apos;s, taken
        through the pipeline; an unapproved deal allocates, settles, and publishes nothing.
      </div>

      <div className="tiles" style={{ marginBottom: 12 }}>
        <Tile value={vm.counts.total} label="opportunities" />
        <Tile value={vm.counts.advancing} label="recommended advance" color={vm.counts.advancing > 0 ? "var(--good)" : undefined} />
        <Tile value={vm.counts.awaitingApproval} label="awaiting IC approval" color={vm.counts.awaitingApproval > 0 ? "var(--review)" : undefined} />
        <Tile value={vm.counts.blocked} label="blocked / declined" color={vm.counts.blocked > 0 ? "var(--bad)" : undefined} />
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <TabBtn on={tab === "open"} onClick={() => setTab("open")}>Open ({vm.open.length})</TabBtn>
        <TabBtn on={tab === "blocked"} onClick={() => setTab("blocked")}>Blocked / declined ({vm.blocked.length})</TabBtn>
      </div>

      <div className="list">
        {rows.map((r) => <OpportunityRow key={r.id} row={r} />)}
        {rows.length === 0 && (
          <div className="muted" style={{ fontSize: 13, padding: 12 }}>
            {tab === "open" ? "No open opportunities." : "No blocked or declined opportunities."}
          </div>
        )}
      </div>
    </div>
  );
}

function OpportunityRow({ row }: { row: OpportunityRowVM }): React.JSX.Element {
  const recColor = REC_COLOR[row.recommendation] ?? "var(--muted)";
  return (
    <div className="qrow" style={row.awaitingApproval ? { borderLeft: "3px solid var(--review)" } : row.states.includes("conflicted") ? { borderLeft: "3px solid var(--bad)" } : undefined}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", alignItems: "baseline" }}>
        <div style={{ minWidth: 0 }}>
          <span style={{ fontWeight: 600, fontSize: 14 }}>{row.company}</span>
          <span className="muted" style={{ marginLeft: 8, fontSize: 12 }}>→ {row.institution}</span>
          <span className="muted" style={{ marginLeft: 8, fontSize: 12, fontFamily: "var(--mono)" }}>{row.category}</span>
        </div>
        <span style={{ display: "inline-flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
          {row.states.map((s) => (
            <span key={s} className="chip" style={{ color: STATE_COLOR[s], borderColor: STATE_COLOR[s] }}>
              {s.replace(/_/g, " ")}
            </span>
          ))}
          <span className="chip" style={{ color: recColor, borderColor: recColor, fontWeight: 600 }}>{row.recommendation}</span>
        </span>
      </div>

      {/* Scores — the opportunity score + the sourced sub-scores. */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", margin: "8px 0 6px" }}>
        {row.scores.map((s) => (
          <span key={s.key} className="pill" style={{ fontSize: 11.5 }}>
            {s.label}: <b>{s.value.toFixed(1)}</b>
          </span>
        ))}
      </div>

      <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>{row.rationale}</div>

      {/* Lineage — every score traces to a source (the intake submission + sourced facts). */}
      <div className="event" style={{ fontSize: 11.5 }}>
        confidence {(row.confidence * 100).toFixed(0)}% ·{" "}
        {row.hasLineage ? `lineage: ${row.lineage.slice(0, 3).join(" · ")}${row.lineage.length > 3 ? ` · +${row.lineage.length - 3}` : ""}` : "no lineage"}
      </div>

      {row.gate ? (
        <div className="event" style={{ fontSize: 12 }}>
          ICApproval {row.gate.disposition} · {row.gate.by} · {row.gate.decision_ref} — a human act, logged.
        </div>
      ) : row.awaitingApproval ? (
        <div className="event" style={{ fontSize: 12, color: "var(--review)" }}>
          Awaits the ICApproval human gate — recommended to advance, but not advanced. The committee decides.
        </div>
      ) : null}
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
