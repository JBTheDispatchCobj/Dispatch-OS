"use client";
//
// components/terminal/TerminalView.tsx — Olympic Sprint Wave 2.
//
// The client Terminal surface. Renders the Wave-1 DealRun (shaped into a view-model by
// app/terminal/page.tsx) as a real product surface: run header, harness stage rail with
// the human gate, institution + deal scorecards (P1), the opportunity feed with the
// executive-lens toggle (CEO/CRO/CFO) over buildFeed output + the role-lensed memo
// summary, the IC memo (P2), allocation (P3), settlement/portfolio (P4), and the kernel
// spine (events + cost). Self-contained types so no server module is pulled into the
// client bundle. Reuses the app design tokens (globals.css).

import { useState } from "react";

// ---------------------------------------------------------------------------
// View-model (owned here; app/terminal/page.tsx builds it from the DealRun)
// ---------------------------------------------------------------------------

export type LensRole = "ceo" | "cro" | "cfo";

export interface FeedItem {
  title: string;
  lens_type: string;
  lens_ref: string | null;
  channel: string;
  body: string;
  source_refs: number;
}

export interface TerminalVM {
  runId: string;
  company: string;
  institution: string;
  status: string;
  facts: {
    institution: string;
    charter: string;
    period: string;
    net_worth_ratio: number;
    roa: number;
    loan_to_share: number;
    delinquency_ratio: number;
    member_growth: number;
    source_ref: string;
  };
  scores: { key: string; label: string; value: number; confidence: number; lineage: number }[];
  scorecardRecommendation: string;
  routes: { stage: string; task_kind: string; rung: string; ladder_position: number; escalate: boolean }[];
  memo: {
    recommendation: string;
    status: string;
    covered: number;
    required: number;
    missing: string[];
    risks: { label: string; severity: string }[];
    conditions: string[];
    citations: number;
    excluded: number;
    lensSummaries: Record<LensRole, string>;
  };
  approval: { disposition: string; by: string; decision_ref: string } | null;
  allocation: {
    allocated_usd: number;
    capacity_usd: number;
    qualified: number;
    allocations: { subscriber: string; kind: string; allocated_usd: number; scaled: boolean; vehicle: string }[];
    rejected: { subscriber: string; reasons: string[] }[];
  } | null;
  settlement: {
    mode: string;
    status: string;
    committed_usd: number;
    called_usd: number;
    distributed_usd: number;
    admin_connector: string;
  } | null;
  io: { id: string; top_tier: string | null; relevance: number | null; evidence_count: number; headline: string } | null;
  feedsByRole: Record<string, FeedItem[]>;
  cost: { total_usd: number; by_category: Record<string, number>; entries: { category: string; label: string; usd: number }[] };
  events: { type: string; plane: string }[];
}

// ---------------------------------------------------------------------------
// Small presentational helpers
// ---------------------------------------------------------------------------

const money = (n: number) => `$${Math.round(n).toLocaleString()}`;
const cap = (s: string) => s.replace(/_/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());

const STATUS_COLOR: Record<string, string> = {
  settled: "var(--good)",
  vehicle_pending: "var(--warn)",
  awaiting_approval: "var(--review)",
  declined: "var(--bad)",
  blocked: "var(--bad)",
  held: "var(--warn)",
  passed: "var(--muted)",
};
const SEV_COLOR: Record<string, string> = { high: "var(--bad)", medium: "var(--warn)", low: "var(--muted)" };

function Panel({ title, eyebrow, children }: { title: string; eyebrow?: string; children: React.ReactNode }) {
  return (
    <section className="card" style={{ marginBottom: 16 }}>
      {eyebrow && <div className="eyebrow">{eyebrow}</div>}
      <div className="item__title" style={{ fontSize: 15, marginBottom: 10 }}>{title}</div>
      {children}
    </section>
  );
}

function ScoreBar({ label, value, confidence, lineage }: { label: string; value: number; confidence: number; lineage: number }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 4 }}>
        <span>{label}</span>
        <span className="muted">{value}/100 · conf {confidence.toFixed(2)} · {lineage} src</span>
      </div>
      <div style={{ height: 8, background: "var(--panel-2)", borderRadius: 6, overflow: "hidden", border: "1px solid var(--line)" }}>
        <div style={{ width: `${Math.min(100, value)}%`, height: "100%", background: value >= 70 ? "var(--good)" : value >= 50 ? "var(--warn)" : "var(--bad)" }} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// The Terminal
// ---------------------------------------------------------------------------

export function TerminalView({ vm }: { vm: TerminalVM }) {
  const [lens, setLens] = useState<LensRole>("ceo");
  const feed = vm.feedsByRole[lens] ?? [];
  const capacityPct = vm.allocation ? Math.min(100, (vm.allocation.allocated_usd / vm.allocation.capacity_usd) * 100) : 0;

  return (
    <div style={{ maxWidth: 1120, margin: "0 auto" }}>
      {/* Run header */}
      <div className="eyebrow">Cooperative Markets · Terminal · run {vm.runId}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", margin: "4px 0 6px" }}>
        <h1 style={{ margin: 0, fontSize: 24 }}>{vm.company} <span className="muted" style={{ fontWeight: 400 }}>×</span> {vm.institution}</h1>
        <span className="chip" style={{ background: "color-mix(in srgb, " + (STATUS_COLOR[vm.status] ?? "var(--muted)") + " 18%, transparent)", color: STATUS_COLOR[vm.status] ?? "var(--muted)", borderColor: "transparent", fontWeight: 600 }}>
          {cap(vm.status)}
        </span>
      </div>
      <p className="muted" style={{ fontSize: 13, marginTop: 0 }}>
        {vm.approval
          ? `IC ${vm.approval.disposition} by ${vm.approval.by} — allocation + settlement authorized (${vm.approval.decision_ref}).`
          : "Regulated conclusion held at the human rung — nothing allocates, settles, or publishes until a human disposes of the memo."}
      </p>

      {/* Harness stage rail */}
      <Panel title="Pipeline — harness route per stage" eyebrow="ingest → score → IC memo → [human gate] → allocate → settle → publish">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {vm.routes.map((r) => (
            <div key={r.stage} className="tile" style={{ minWidth: 116, borderColor: r.escalate ? "var(--review)" : "var(--line)" }}>
              <div className="tile__label">{r.stage}{r.escalate ? " · human gate" : ""}</div>
              <div className="tile__value" style={{ fontSize: 13 }}>rung {r.ladder_position}</div>
              <div className="muted" style={{ fontSize: 11 }}>{cap(r.rung)}</div>
            </div>
          ))}
        </div>
      </Panel>

      <div className="grid2">
        {/* Institution scorecard */}
        <Panel title={`Institution scorecard — ${vm.facts.institution}`} eyebrow={`NCUA 5300 · charter ${vm.facts.charter} · ${vm.facts.period}`}>
          <div className="tiles">
            <Stat label="Net worth" value={`${vm.facts.net_worth_ratio.toFixed(1)}%`} good={vm.facts.net_worth_ratio >= 7} />
            <Stat label="ROA" value={`${vm.facts.roa.toFixed(2)}%`} good={vm.facts.roa > 0} />
            <Stat label="Loan / share" value={`${vm.facts.loan_to_share.toFixed(0)}%`} />
            <Stat label="Delinquency" value={`${vm.facts.delinquency_ratio.toFixed(2)}%`} good={vm.facts.delinquency_ratio < 1} />
            <Stat label="Member growth" value={`${vm.facts.member_growth.toFixed(1)}%`} good={vm.facts.member_growth >= 0} />
          </div>
          <div className="muted" style={{ fontSize: 11, marginTop: 8 }}>source: {vm.facts.source_ref}</div>
        </Panel>

        {/* Deal scorecard (P1) */}
        <Panel title="Deal scorecard — P1" eyebrow={`recommendation: ${cap(vm.scorecardRecommendation)} · sourced inferences`}>
          {vm.scores.map((s) => (
            <ScoreBar key={s.key} label={s.label} value={s.value} confidence={s.confidence} lineage={s.lineage} />
          ))}
        </Panel>
      </div>

      {/* Opportunity feed + lens toggle */}
      <Panel title="Opportunity feed — executive lens" eyebrow="The Auric · same facts, different reader (variants restate the IO's refs exactly)">
        <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
          {(["ceo", "cro", "cfo"] as LensRole[]).map((r) => (
            <button
              key={r}
              onClick={() => setLens(r)}
              className="btn btn--sm"
              style={{
                background: lens === r ? "var(--accent)" : "var(--panel-2)",
                color: lens === r ? "#0e1116" : "var(--ink)",
                borderColor: lens === r ? "var(--accent)" : "var(--line)",
                fontWeight: 600,
                textTransform: "uppercase",
              }}
            >
              {r}
            </button>
          ))}
        </div>

        <div className="note" style={{ marginBottom: 12 }}>
          <div className="note__head"><span className="note__author">Memo lens — {lens.toUpperCase()}</span></div>
          <div style={{ fontSize: 13 }}>{vm.memo.lensSummaries[lens]}</div>
        </div>

        {feed.length === 0 && <div className="muted" style={{ fontSize: 13 }}>No published variants (deal did not clear the human gate).</div>}
        {feed.map((f, i) => (
          <div key={i} className="wrow" style={{ marginBottom: 8 }}>
            <div className="wrow__main">
              <div className="wrow__title">{f.title}</div>
              <div className="muted" style={{ fontSize: 12 }}>{f.body}</div>
            </div>
            <div className="wrow__side" style={{ textAlign: "right" }}>
              <span className="chip chip--kind">{f.lens_type}{f.lens_ref ? `:${f.lens_ref}` : ""}</span>
              <div className="muted" style={{ fontSize: 11, marginTop: 4 }}>{f.channel} · {f.source_refs} refs</div>
            </div>
          </div>
        ))}
      </Panel>

      {/* IC memo (P2) */}
      <Panel title="Investment Committee memo — P2" eyebrow={`${cap(vm.memo.recommendation)} · status: ${vm.memo.status} (a proposal; the decision is the committee's)`}>
        <div className="tiles" style={{ marginBottom: 10 }}>
          <Stat label="DD coverage" value={`${vm.memo.covered}/${vm.memo.required}`} good={vm.memo.missing.length === 0} />
          <Stat label="Approved citations" value={String(vm.memo.citations)} />
          <Stat label="Excluded (unapproved)" value={String(vm.memo.excluded)} good={vm.memo.excluded === 0 ? undefined : false} />
          <Stat label="Open risks" value={String(vm.memo.risks.length)} />
        </div>
        {vm.memo.risks.length > 0 && (
          <div style={{ marginBottom: 8 }}>
            {vm.memo.risks.map((r, i) => (
              <div key={i} style={{ fontSize: 12.5, marginBottom: 3 }}>
                <span style={{ color: SEV_COLOR[r.severity] ?? "var(--muted)", fontWeight: 600 }}>[{r.severity}]</span> {r.label}
              </div>
            ))}
          </div>
        )}
        {vm.memo.conditions.map((c, i) => (
          <div key={i} className="muted" style={{ fontSize: 12.5 }}>condition: {c}</div>
        ))}
      </Panel>

      {/* Allocation (P3) */}
      {vm.allocation && (
        <Panel title="Allocation — P3" eyebrow={`${vm.allocation.qualified} qualified matches · eligibility-gated · pro-rata`}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 4 }}>
            <span>{money(vm.allocation.allocated_usd)} allocated</span>
            <span className="muted">of {money(vm.allocation.capacity_usd)} capacity</span>
          </div>
          <div style={{ height: 8, background: "var(--panel-2)", borderRadius: 6, overflow: "hidden", border: "1px solid var(--line)", marginBottom: 12 }}>
            <div style={{ width: `${capacityPct}%`, height: "100%", background: "var(--accent)" }} />
          </div>
          {vm.allocation.allocations.map((a, i) => (
            <div key={i} className="orow" style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "4px 0" }}>
              <span>✓ {a.subscriber} <span className="muted">· {a.kind} · {a.vehicle}{a.scaled ? " · scaled" : ""}</span></span>
              <span>{money(a.allocated_usd)}</span>
            </div>
          ))}
          {vm.allocation.rejected.map((r, i) => (
            <div key={i} className="orow" style={{ fontSize: 12.5, padding: "3px 0", color: "var(--muted)" }}>
              ✗ {r.subscriber} — {r.reasons.join(", ")}
            </div>
          ))}
        </Panel>
      )}

      {/* Settlement / portfolio (P4) */}
      {vm.settlement && (
        <Panel title="Settlement & monitoring — P4" eyebrow={`vehicle: ${vm.settlement.mode} · ${vm.settlement.admin_connector}`}>
          <div className="tiles">
            <Stat label="Status" value={cap(vm.settlement.status)} good={vm.settlement.status === "closed"} />
            <Stat label="Committed" value={money(vm.settlement.committed_usd)} />
            <Stat label="Called" value={money(vm.settlement.called_usd)} />
            <Stat label="Distributed" value={money(vm.settlement.distributed_usd)} />
          </div>
          {vm.io && (
            <div className="muted" style={{ fontSize: 12, marginTop: 8 }}>
              Published IO {vm.io.id} · tier {vm.io.top_tier} · relevance {vm.io.relevance} · {vm.io.evidence_count} evidence refs
            </div>
          )}
        </Panel>
      )}

      {/* Kernel spine */}
      <Panel title="Kernel spine — events + cost" eyebrow={`${vm.events.length} correlated events · $${vm.cost.total_usd.toFixed(4)} ledgered`}>
        <div className="grid2">
          <div>
            <div className="eyebrow">Events</div>
            {vm.events.map((e, i) => (
              <div key={i} style={{ fontSize: 12.5, padding: "2px 0" }}>
                · {e.type} <span className="muted">[{e.plane}]</span>
              </div>
            ))}
          </div>
          <div>
            <div className="eyebrow">Cost by category</div>
            {Object.entries(vm.cost.by_category).filter(([, v]) => v > 0).map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, padding: "2px 0" }}>
                <span>{cap(k)}</span><span className="muted">${v.toFixed(4)}</span>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "4px 0", borderTop: "1px solid var(--line)", marginTop: 4, fontWeight: 600 }}>
              <span>Total</span><span>${vm.cost.total_usd.toFixed(4)}</span>
            </div>
          </div>
        </div>
      </Panel>
    </div>
  );
}

function Stat({ label, value, good }: { label: string; value: string; good?: boolean }) {
  const color = good === undefined ? "var(--ink)" : good ? "var(--good)" : "var(--bad)";
  return (
    <div className="tile">
      <div className="tile__label">{label}</div>
      <div className="tile__value" style={{ color, fontSize: 16 }}>{value}</div>
    </div>
  );
}
