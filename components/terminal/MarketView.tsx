"use client";
//
// components/terminal/MarketView.tsx — Olympic Sprint Wave 3.
//
// The client "Cooperative Markets — Market" surface. Renders a fully-shaped view-model
// (built by the server page and passed as `vm`) as a real product surface: an institution
// list from the 5300 batch ingestion (illustrative fixture batch, pending a live 5300
// connector), a regulatory-environment summary from REAL NCUA regulatory ingestion, and an
// Object-Registry status panel. Pure presentational — it does NO data work and imports NO
// server/engine modules, so it never pulls a server module into the client bundle. Reuses
// the app design tokens (globals.css) and the TerminalView visual language so the two
// surfaces read as one product.
//
// Client interaction: a sort toggle over the institutions list (React useState), mirroring
// TerminalView's lens toggle. Dependency-free.

import { useState } from "react";
import type React from "react";

// ---------------------------------------------------------------------------
// View-model (owned here; the server page builds it and passes `vm`)
// ---------------------------------------------------------------------------

export interface MarketInstitutionVM {
  name: string;
  charter: string;
  period: string;
  profileConfidence: number; // 0..1
  health: "strong" | "adequate" | "thin";
  completeness: number; // 0..1
  topTier: string | null;
  net_worth_ratio: number;
  roa: number;
  loan_to_share: number;
  delinquency_ratio: number;
  member_growth: number; // percentages
  source_ref: string;
}

export interface MarketRegulatoryVM {
  issueDate: string;
  totalSections: number;
  parts: { part: string; part_title: string; count: number }[]; // already sorted, e.g. top 10 by count
  pendingAmendments: {
    section: string;
    fr_citation: string;
    effective_on: string;
    amendment_type: string;
    inForce: boolean;
  }[];
  heldInstructions: number;
}

export interface MarketRegistryVM {
  canonicalObjects: number;
  matchCandidates: number;
  merges: number;
  note: string; // the gated note about 0016+0017
}

export interface MarketVM {
  generatedAt: string;
  institutionCount: number;
  institutions: MarketInstitutionVM[];
  regulatory: MarketRegulatoryVM;
  registry: MarketRegistryVM;
}

// ---------------------------------------------------------------------------
// Small presentational helpers (same discipline as TerminalView)
// ---------------------------------------------------------------------------

type SortKey = "confidence" | "net_worth" | "delinquency";

const HEALTH_COLOR: Record<MarketInstitutionVM["health"], string> = {
  strong: "var(--good)",
  adequate: "var(--warn)",
  thin: "var(--bad)",
};

const pct = (n: number): string => `${(n * 100).toFixed(0)}%`;

function Panel({
  title,
  eyebrow,
  children,
}: {
  title: string;
  eyebrow?: string;
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <section className="card" style={{ marginBottom: 16 }}>
      {eyebrow && <div className="eyebrow">{eyebrow}</div>}
      <div className="item__title" style={{ fontSize: 15, marginBottom: 10 }}>
        {title}
      </div>
      {children}
    </section>
  );
}

function Meter({
  value,
  good,
}: {
  value: number; // 0..1
  good?: boolean;
}): React.JSX.Element {
  const width = Math.max(0, Math.min(100, value * 100));
  const fill =
    good === undefined
      ? value >= 0.7
        ? "var(--good)"
        : value >= 0.5
          ? "var(--warn)"
          : "var(--bad)"
      : good
        ? "var(--good)"
        : "var(--bad)";
  return (
    <div
      style={{
        height: 8,
        background: "var(--panel-2)",
        borderRadius: 6,
        overflow: "hidden",
        border: "1px solid var(--line)",
      }}
    >
      <div style={{ width: `${width}%`, height: "100%", background: fill }} />
    </div>
  );
}

function Ratio({
  label,
  value,
  good,
}: {
  label: string;
  value: string;
  good?: boolean;
}): React.JSX.Element {
  const color = good === undefined ? "var(--ink)" : good ? "var(--good)" : "var(--bad)";
  return (
    <div style={{ minWidth: 0 }}>
      <div className="muted" style={{ fontSize: 10.5, fontFamily: "var(--mono)", letterSpacing: "0.04em" }}>
        {label}
      </div>
      <div style={{ fontSize: 14, fontWeight: 600, fontFamily: "var(--mono)", color }}>{value}</div>
    </div>
  );
}

function HealthBadge({ health }: { health: MarketInstitutionVM["health"] }): React.JSX.Element {
  const color = HEALTH_COLOR[health];
  return (
    <span
      className="chip"
      style={{
        color,
        borderColor: color,
        fontWeight: 600,
      }}
    >
      {health}
    </span>
  );
}

// ---------------------------------------------------------------------------
// The Market surface
// ---------------------------------------------------------------------------

export function MarketView({ vm }: { vm: MarketVM }): React.JSX.Element {
  const [sort, setSort] = useState<SortKey>("confidence");

  const sorted = [...vm.institutions].sort((a, b) => {
    switch (sort) {
      case "net_worth":
        return b.net_worth_ratio - a.net_worth_ratio;
      case "delinquency":
        return a.delinquency_ratio - b.delinquency_ratio; // lower is better → ascending
      case "confidence":
      default:
        return b.profileConfidence - a.profileConfidence;
    }
  });

  const reg = vm.regulatory;
  const maxPartCount = reg.parts.reduce((m, p) => Math.max(m, p.count), 1);

  return (
    <div style={{ maxWidth: 1120, margin: "0 auto" }}>
      {/* Header */}
      <div className="eyebrow">Cooperative Markets · Market · {vm.institutionCount} institutions</div>
      <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", margin: "4px 0 6px" }}>
        <h1 style={{ margin: 0, fontSize: 24 }}>Cooperative Markets — Market</h1>
        <span className="chip" style={{ color: "var(--muted)" }}>
          generated {vm.generatedAt}
        </span>
      </div>
      <p className="muted" style={{ fontSize: 13, marginTop: 0 }}>
        Institution financials are an illustrative fixture batch pending a live 5300 connector; the regulatory
        corpus below is real NCUA data.
      </p>

      {/* Institutions */}
      <Panel
        title="Institution profiles — 5300 batch"
        eyebrow={`${vm.institutionCount} profiles · net-worth ratio ≥ 7% = well-capitalized`}
      >
        <div className="switchrow">
          <span className="switchrow__label">Sort</span>
          {(
            [
              ["confidence", "profile confidence"],
              ["net_worth", "net-worth ratio"],
              ["delinquency", "delinquency"],
            ] as [SortKey, string][]
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setSort(key)}
              className={`pill${sort === key ? " pill--on" : ""}`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="list">
          {sorted.map((inst, i) => (
            <div key={`${inst.charter}-${inst.period}-${i}`} className="orow">
              {/* top line: name + health + charter/period */}
              <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap", marginBottom: 8 }}>
                <span style={{ fontWeight: 600, fontSize: 14 }}>{inst.name}</span>
                <HealthBadge health={inst.health} />
                <span className="muted" style={{ fontSize: 12, fontFamily: "var(--mono)" }}>
                  charter {inst.charter} · {inst.period}
                </span>
                {inst.topTier && (
                  <span className="chip chip--kind" style={{ marginLeft: "auto" }}>
                    tier {inst.topTier}
                  </span>
                )}
              </div>

              {/* the 5 ratios */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(96px, 1fr))",
                  gap: 8,
                  marginBottom: 10,
                }}
              >
                <Ratio label="net worth" value={`${inst.net_worth_ratio.toFixed(1)}%`} good={inst.net_worth_ratio >= 7} />
                <Ratio label="ROA" value={`${inst.roa.toFixed(2)}%`} good={inst.roa > 0} />
                <Ratio label="loan / share" value={`${inst.loan_to_share.toFixed(0)}%`} />
                <Ratio label="delinquency" value={`${inst.delinquency_ratio.toFixed(2)}%`} good={inst.delinquency_ratio < 1} />
                <Ratio label="member growth" value={`${inst.member_growth.toFixed(1)}%`} good={inst.member_growth >= 0} />
              </div>

              {/* profile confidence meter + completeness */}
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                <span className="muted">profile confidence</span>
                <span className="muted" style={{ fontFamily: "var(--mono)" }}>
                  {inst.profileConfidence.toFixed(2)} · {pct(inst.completeness)} complete
                </span>
              </div>
              <Meter value={inst.profileConfidence} />

              <div className="muted" style={{ fontSize: 11, marginTop: 6, fontFamily: "var(--mono)" }}>
                source: {inst.source_ref}
              </div>
            </div>
          ))}
          {sorted.length === 0 && (
            <div className="muted" style={{ fontSize: 13 }}>
              No institution profiles in this batch.
            </div>
          )}
        </div>
      </Panel>

      {/* Regulatory environment */}
      <Panel
        title="Regulatory environment — NCUA corpus"
        eyebrow={`real NCUA data · issued ${reg.issueDate} · ${reg.totalSections} sections`}
      >
        <div className="tiles" style={{ marginBottom: 12 }}>
          <div className="tile">
            <div className="tile__value" style={{ fontSize: 20 }}>
              {reg.totalSections}
            </div>
            <div className="tile__label">sections ingested</div>
          </div>
          <div className="tile">
            <div className="tile__value" style={{ fontSize: 20 }}>
              {reg.parts.length}
            </div>
            <div className="tile__label">parts (top by section count)</div>
          </div>
          <div className="tile">
            <div className="tile__value" style={{ fontSize: 20 }}>
              {reg.pendingAmendments.length}
            </div>
            <div className="tile__label">pending amendments</div>
          </div>
        </div>

        {/* parts → count bars */}
        <div className="eyebrow" style={{ marginBottom: 8 }}>
          Parts by section count
        </div>
        {reg.parts.map((p) => (
          <div key={p.part} style={{ marginBottom: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 4 }}>
              <span>
                <span style={{ fontFamily: "var(--mono)", fontWeight: 600 }}>Part {p.part}</span>{" "}
                <span className="muted">{p.part_title}</span>
              </span>
              <span className="muted" style={{ fontFamily: "var(--mono)" }}>
                {p.count}
              </span>
            </div>
            <div
              style={{
                height: 8,
                background: "var(--panel-2)",
                borderRadius: 6,
                overflow: "hidden",
                border: "1px solid var(--line)",
              }}
            >
              <div style={{ width: `${(p.count / maxPartCount) * 100}%`, height: "100%", background: "var(--accent)" }} />
            </div>
          </div>
        ))}
        {reg.parts.length === 0 && (
          <div className="muted" style={{ fontSize: 13 }}>
            No parts indexed.
          </div>
        )}

        {/* pending amendments */}
        <div className="eyebrow" style={{ margin: "16px 0 8px" }}>
          Pending amendments
        </div>
        {reg.pendingAmendments.map((a, i) => (
          <div key={`${a.section}-${i}`} className="wrow" style={{ marginBottom: 8 }}>
            <div className="wrow__main">
              <div className="wrow__title">§ {a.section}</div>
              <div className="muted" style={{ fontSize: 12, fontFamily: "var(--mono)" }}>
                {a.fr_citation} · {a.amendment_type} · effective {a.effective_on}
              </div>
            </div>
            <div className="wrow__side" style={{ textAlign: "right" }}>
              <span
                className="chip"
                style={{
                  color: a.inForce ? "var(--good)" : "var(--warn)",
                  borderColor: a.inForce ? "var(--good)" : "var(--warn)",
                  fontWeight: 600,
                }}
              >
                {a.inForce ? "in force" : "pending"}
              </span>
            </div>
          </div>
        ))}
        {reg.pendingAmendments.length === 0 && (
          <div className="muted" style={{ fontSize: 13 }}>
            No pending amendments in this corpus.
          </div>
        )}

        {/* held instructions */}
        <div className="note" style={{ marginTop: 12 }}>
          <div className="note__head">
            <span className="note__author">{reg.heldInstructions} regulatory instructions held</span>
          </div>
          <div className="muted" style={{ fontSize: 12.5 }}>
            Held pending human merge — not auto-applied.
          </div>
        </div>
      </Panel>

      {/* Object Registry */}
      <Panel title="Object Registry — status" eyebrow="canonical objects · match candidates · merges">
        <div className="tiles" style={{ marginBottom: 10 }}>
          <div className="tile">
            <div className="tile__value" style={{ fontSize: 20 }}>
              {vm.registry.canonicalObjects}
            </div>
            <div className="tile__label">canonical objects</div>
          </div>
          <div className="tile">
            <div className="tile__value" style={{ fontSize: 20 }}>
              {vm.registry.matchCandidates}
            </div>
            <div className="tile__label">match candidates</div>
          </div>
          <div className="tile">
            <div className="tile__value" style={{ fontSize: 20 }}>
              {vm.registry.merges}
            </div>
            <div className="tile__label">merges</div>
          </div>
        </div>
        <div className="banner">{vm.registry.note}</div>
      </Panel>
    </div>
  );
}
