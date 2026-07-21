"use client";
//
// components/terminal/ObservabilityView.tsx — Olympic Sprint Wave 4.
//
// The client "Observability" surface: the read-side of the kernel spine rendered as a
// real product surface. It shows what a run SPENT (cost dashboard) and what a run DID
// (event replay timeline), folded by the pure `core/kernel/observability` projections
// and shaped into a view-model by the server page (app/observability/page.tsx). Purely
// presentational — it does NO data work and imports NO server/engine modules, so no
// server code is ever pulled into the client bundle. It owns the VM interfaces and
// re-exports them for the page (same pattern as MarketView/TerminalView), and reuses
// the app design tokens (globals.css) so the surface reads as one product.
//
// Client interaction: a dependency-free event-type filter over the replay timeline
// (React useState), mirroring TerminalView's lens toggle.

import { useState } from "react";
import type React from "react";

// ---------------------------------------------------------------------------
// View-model (owned here; the server page builds it and passes `vm`)
// ---------------------------------------------------------------------------

/** One category's rolled-up spend (category is a kernel CostCategory string). */
export interface ObsCategoryVM {
  category: string; // "model" | "human" | "tool" | "storage" | "connector"
  usd: number;
}

/** One label's (stage/operation's) rolled-up spend. */
export interface ObsLabelVM {
  label: string;
  usd: number;
  count: number;
}

/** The cost-side projection (from observability.costDashboard). */
export interface ObsCostVM {
  total_usd: number;
  entry_count: number;
  byCategory: ObsCategoryVM[]; // sorted usd desc, key asc; every category present
  byLabel: ObsLabelVM[]; // sorted usd desc, label asc
}

/** One ordered replay row (from observability.eventTimeline). */
export interface ObsTimelineVM {
  seq: number;
  id: string;
  type: string;
  actor: string;
  plane: string | null;
  occurred_at: string;
  correlation_id: string;
}

/** The health roll-up (from observability.runHealth). */
export interface ObsHealthVM {
  event_count: number;
  distinct_correlations: number;
  distinct_event_types: number;
  distinct_actors: number;
  anomaly_count: number;
  total_usd: number;
  human_gate_usd: number;
}

export interface ObservabilityVM {
  generatedAt: string;
  runId: string;
  /** The single correlation id every event of this run carries. */
  correlationId: string;
  health: ObsHealthVM;
  cost: ObsCostVM;
  timeline: ObsTimelineVM[];
}

// ---------------------------------------------------------------------------
// Small presentational helpers (same discipline as MarketView/TerminalView)
// ---------------------------------------------------------------------------

const money4 = (n: number): string => `$${n.toFixed(4)}`;
const cap = (s: string): string => s.replace(/_/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());

// Per-category accent colors — legible, consistent with the token palette, and
// stable so the same category always reads the same hue across the surface.
const CATEGORY_COLOR: Record<string, string> = {
  model: "var(--accent)",
  human: "var(--review)",
  tool: "var(--good)",
  connector: "var(--warn)",
  storage: "var(--muted)",
};

// Plane accent — mirrors the kernel plane vocabulary (control / private / shared).
const PLANE_COLOR: Record<string, string> = {
  control: "var(--warn)",
  private_terminal: "var(--review)",
  shared_market: "var(--accent)",
};

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

function Stat({ label, value, good }: { label: string; value: string; good?: boolean }): React.JSX.Element {
  const color = good === undefined ? "var(--ink)" : good ? "var(--good)" : "var(--bad)";
  return (
    <div className="tile">
      <div className="tile__label">{label}</div>
      <div className="tile__value" style={{ color, fontSize: 16 }}>
        {value}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// The Observability surface
// ---------------------------------------------------------------------------

export function ObservabilityView({ vm }: { vm: ObservabilityVM }): React.JSX.Element {
  // Event-type filter toggle over the replay timeline (dependency-free).
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const eventTypes = [...new Set(vm.timeline.map((t) => t.type))].sort();
  const timeline =
    typeFilter === "all" ? vm.timeline : vm.timeline.filter((t) => t.type === typeFilter);

  // Bar scale: the largest category spend, so bars are comparable within the panel.
  const maxCategoryUsd = vm.cost.byCategory.reduce((m, c) => Math.max(m, c.usd), 0) || 1;
  const maxLabelUsd = vm.cost.byLabel.reduce((m, l) => Math.max(m, l.usd), 0) || 1;

  // Every event correlates to the run — a one-line integrity read for the reader.
  const allCorrelate =
    vm.timeline.length > 0 && vm.timeline.every((t) => t.correlation_id === vm.correlationId);

  return (
    <div style={{ maxWidth: 1120, margin: "0 auto" }}>
      {/* Header */}
      <div className="eyebrow">Cooperative Markets · Observability · run {vm.runId}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", margin: "4px 0 6px" }}>
        <h1 style={{ margin: 0, fontSize: 24 }}>Kernel Observability</h1>
        <span className="chip" style={{ color: "var(--muted)" }}>
          generated {vm.generatedAt}
        </span>
      </div>
      <p className="muted" style={{ fontSize: 13, marginTop: 0 }}>
        The read-side of the kernel spine: what the run SPENT (cost ledger, RFC-2008) and what it DID
        (event log, RFC-2004), folded by the pure <code>observability</code> projection. Deterministic —
        every figure is a replayable fold over the same append-only arrays.
      </p>

      {/* Health / summary strip */}
      <Panel
        title="Run health — summary"
        eyebrow={`${vm.health.event_count} events · ${vm.health.distinct_event_types} types · ${vm.health.distinct_correlations} correlation${vm.health.distinct_correlations === 1 ? "" : "s"}`}
      >
        <div className="tiles">
          <Stat label="Events" value={String(vm.health.event_count)} />
          <Stat label="Distinct types" value={String(vm.health.distinct_event_types)} />
          <Stat label="Distinct actors" value={String(vm.health.distinct_actors)} />
          <Stat
            label="Anomaly events"
            value={String(vm.health.anomaly_count)}
            good={vm.health.anomaly_count === 0}
          />
          <Stat label="Total spend" value={money4(vm.health.total_usd)} />
          <Stat label="Human-gate spend" value={money4(vm.health.human_gate_usd)} />
        </div>
        <div className="banner" style={{ marginTop: 12, marginBottom: 0 }}>
          {allCorrelate
            ? `All ${vm.timeline.length} events correlate to ${vm.correlationId} — one replayable causal chain.`
            : `Timeline spans multiple correlations (${vm.health.distinct_correlations}).`}
        </div>
      </Panel>

      {/* Cost dashboard */}
      <Panel
        title="Cost dashboard — spend by category"
        eyebrow={`${vm.cost.entry_count} ledger entries · ${money4(vm.cost.total_usd)} total`}
      >
        {/* Total */}
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 10,
            marginBottom: 14,
            paddingBottom: 12,
            borderBottom: "1px solid var(--line)",
          }}
        >
          <span style={{ fontSize: 26, fontWeight: 700, fontFamily: "var(--mono)" }}>
            {money4(vm.cost.total_usd)}
          </span>
          <span className="muted" style={{ fontSize: 12 }}>
            ledgered across {vm.cost.entry_count} entries
          </span>
        </div>

        {/* By-category horizontal bars */}
        <div className="eyebrow" style={{ marginBottom: 8 }}>
          By category
        </div>
        {vm.cost.byCategory.map((c) => {
          const color = CATEGORY_COLOR[c.category] ?? "var(--accent)";
          const share = vm.cost.total_usd > 0 ? (c.usd / vm.cost.total_usd) * 100 : 0;
          return (
            <div key={c.category} style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 4 }}>
                <span style={{ fontWeight: 600 }}>{cap(c.category)}</span>
                <span className="muted" style={{ fontFamily: "var(--mono)" }}>
                  {money4(c.usd)} · {share.toFixed(1)}%
                </span>
              </div>
              <div
                style={{
                  height: 10,
                  background: "var(--panel-2)",
                  borderRadius: 6,
                  overflow: "hidden",
                  border: "1px solid var(--line)",
                }}
              >
                <div
                  style={{
                    width: `${Math.max(0, Math.min(100, (c.usd / maxCategoryUsd) * 100))}%`,
                    height: "100%",
                    background: color,
                  }}
                />
              </div>
            </div>
          );
        })}

        {/* By-label / by-stage cost table */}
        <div className="eyebrow" style={{ margin: "18px 0 8px" }}>
          By label (stage / operation)
        </div>
        <div className="list">
          {vm.cost.byLabel.map((l) => (
            <div
              key={l.label}
              className="wrow"
              style={{ padding: "8px 12px" }}
            >
              <div className="wrow__main">
                <div className="wrow__title" style={{ fontSize: 13, fontFamily: "var(--mono)" }}>
                  {l.label}
                </div>
                <div
                  style={{
                    height: 6,
                    background: "var(--panel)",
                    borderRadius: 999,
                    overflow: "hidden",
                    border: "1px solid var(--line)",
                    marginTop: 6,
                    maxWidth: 260,
                  }}
                >
                  <div
                    style={{
                      width: `${Math.max(0, Math.min(100, (l.usd / maxLabelUsd) * 100))}%`,
                      height: "100%",
                      background: "var(--accent)",
                    }}
                  />
                </div>
              </div>
              <div className="wrow__side" style={{ textAlign: "right" }}>
                <span style={{ fontFamily: "var(--mono)", fontSize: 13, fontWeight: 600 }}>{money4(l.usd)}</span>
                <span className="muted" style={{ fontSize: 11 }}>
                  {l.count} {l.count === 1 ? "entry" : "entries"}
                </span>
              </div>
            </div>
          ))}
          {vm.cost.byLabel.length === 0 && (
            <div className="muted" style={{ fontSize: 13 }}>
              No cost entries recorded for this run.
            </div>
          )}
        </div>
      </Panel>

      {/* Event replay timeline */}
      <Panel
        title="Event replay — correlated kernel timeline"
        eyebrow={`RFC-2004 · append-order · correlation ${vm.correlationId}`}
      >
        {/* Type filter toggle (mirrors TerminalView's lens toggle) */}
        <div className="switchrow">
          <span className="switchrow__label">Type</span>
          <button
            type="button"
            onClick={() => setTypeFilter("all")}
            className={`pill${typeFilter === "all" ? " pill--on" : ""}`}
          >
            all ({vm.timeline.length})
          </button>
          {eventTypes.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTypeFilter(t)}
              className={`pill${typeFilter === t ? " pill--on" : ""}`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Vertical timeline */}
        <div style={{ position: "relative", marginTop: 6, paddingLeft: 18 }}>
          {/* the spine */}
          <div
            style={{
              position: "absolute",
              left: 5,
              top: 4,
              bottom: 4,
              width: 2,
              background: "var(--line)",
            }}
          />
          {timeline.map((ev) => {
            const dot = PLANE_COLOR[ev.plane ?? ""] ?? "var(--muted)";
            return (
              <div key={ev.id} style={{ position: "relative", marginBottom: 12 }}>
                {/* node */}
                <div
                  style={{
                    position: "absolute",
                    left: -18,
                    top: 3,
                    width: 12,
                    height: 12,
                    borderRadius: 999,
                    background: dot,
                    border: "2px solid var(--bg)",
                    boxShadow: "0 0 0 1px var(--line)",
                  }}
                />
                <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
                  <span
                    className="muted"
                    style={{ fontFamily: "var(--mono)", fontSize: 11 }}
                  >
                    #{ev.seq}
                  </span>
                  <span style={{ fontWeight: 600, fontSize: 13, fontFamily: "var(--mono)" }}>{ev.type}</span>
                  {ev.plane && (
                    <span
                      className="chip"
                      style={{ color: dot, borderColor: dot }}
                    >
                      {ev.plane}
                    </span>
                  )}
                  <span className="muted" style={{ fontSize: 11, marginLeft: "auto", fontFamily: "var(--mono)" }}>
                    {ev.occurred_at}
                  </span>
                </div>
                <div className="muted" style={{ fontSize: 11.5, marginTop: 2, fontFamily: "var(--mono)" }}>
                  {ev.actor} · corr {ev.correlation_id}
                </div>
              </div>
            );
          })}
          {timeline.length === 0 && (
            <div className="muted" style={{ fontSize: 13 }}>
              No events match this filter.
            </div>
          )}
        </div>
      </Panel>
    </div>
  );
}
