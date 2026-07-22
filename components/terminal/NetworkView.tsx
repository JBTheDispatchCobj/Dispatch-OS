"use client";
//
// components/terminal/NetworkView.tsx — Olympic Sprint III Wave 5 (the JOINT surface).
//
// The client "Network" surface, REVIEW-QUEUE-FIRST (Bryan's pick). Renders a fully
// shaped view-model (built by the server page over real run output) as a product
// surface: the propose-only human-review queue leads (cross-source entity
// duplicates + external-canon alias proposals — confirm/reject, NEVER auto-merge),
// the full-market institution list (LABELED SYNTHETIC) follows.
//
// Truth discipline on screen: the synthetic market is labeled unmistakably; the
// queue states nothing merges automatically and shows the live merge count (0);
// proposals carry their score/reasons/lineage. The confirm/reject buttons are a
// LOCAL decision affordance only — they acknowledge a review in the UI and DO NOT
// persist or merge anything; the governed registry action is the real gate (wired
// in a later wave). Look/feel is deferred to the Terminal polish sprint.
//
// Pure presentational: no data work, no server/engine imports. Reuses the app
// design tokens + the MarketView visual language so the surfaces read as one product.

import { useState } from "react";
import type React from "react";
import type { NetworkVM, NetworkInstitutionVM } from "@/cartridges/cooperative_markets/run_network_surface";

type Decision = "confirm" | "reject";

const HEALTH_COLOR: Record<NetworkInstitutionVM["health"], string> = {
  strong: "var(--good)",
  adequate: "var(--warn)",
  thin: "var(--bad)",
};

function Panel({
  title,
  eyebrow,
  children,
  accent,
}: {
  title: string;
  eyebrow?: string;
  children: React.ReactNode;
  accent?: boolean;
}): React.JSX.Element {
  return (
    <section
      className="card"
      style={{ marginBottom: 16, ...(accent ? { borderColor: "var(--review)", boxShadow: "inset 3px 0 0 var(--review)" } : {}) }}
    >
      {eyebrow && <div className="eyebrow">{eyebrow}</div>}
      <div className="item__title" style={{ fontSize: 15, marginBottom: 10 }}>{title}</div>
      {children}
    </section>
  );
}

function DecisionButtons({
  decision,
  onDecide,
}: {
  decision: Decision | undefined;
  onDecide: (d: Decision) => void;
}): React.JSX.Element {
  return (
    <div className="btnrow" style={{ justifyContent: "flex-end" }}>
      <button
        type="button"
        className={`btn btn--sm${decision === "confirm" ? " btn--good" : ""}`}
        onClick={() => onDecide("confirm")}
        aria-pressed={decision === "confirm"}
      >
        confirm
      </button>
      <button
        type="button"
        className={`btn btn--sm${decision === "reject" ? " btn--bad" : ""}`}
        onClick={() => onDecide("reject")}
        aria-pressed={decision === "reject"}
      >
        reject
      </button>
    </div>
  );
}

export function NetworkView({ vm }: { vm: NetworkVM }): React.JSX.Element {
  // Local-only review acknowledgements (NOT persisted — the governed action is the real gate).
  const [decisions, setDecisions] = useState<Record<string, Decision>>({});
  const decide = (id: string, d: Decision) =>
    setDecisions((prev) => ({ ...prev, [id]: prev[id] === d ? (undefined as unknown as Decision) : d }));

  const q = vm.reviewQueue;
  const decidedCount = Object.values(decisions).filter(Boolean).length;

  return (
    <div style={{ maxWidth: 1120, margin: "0 auto" }}>
      {/* Header */}
      <div className="eyebrow">Cooperative Markets · Network · review queue + market</div>
      <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", margin: "4px 0 6px" }}>
        <h1 style={{ margin: 0, fontSize: 24 }}>Network</h1>
        <span className="chip chip--synthetic">market: synthetic</span>
        <span className="chip" style={{ color: "var(--muted)", marginLeft: "auto" }}>generated {vm.generatedAt}</span>
      </div>
      <p className="muted" style={{ fontSize: 13, marginTop: 0, maxWidth: 820 }}>
        The propose-only review queue leads: likely-duplicate entities found across sources and external-canon alias
        proposals, each awaiting your confirm or reject. Nothing is merged or renamed automatically. The market below is
        a labeled synthetic full-market run pending a real bulk 5300 feed.
      </p>

      {/* ============================ REVIEW QUEUE (hero) ============================ */}
      <Panel
        title="Review queue — propose-only"
        eyebrow={`${q.pendingCount} pending · ${q.mergedCount} merged · human-gated`}
        accent
      >
        <div className="tiles" style={{ marginBottom: 12 }}>
          <div className="tile">
            <div className="tile__value" style={{ fontSize: 20 }}>{q.pendingCount}</div>
            <div className="tile__label">pending review</div>
          </div>
          <div className="tile">
            <div className="tile__value" style={{ fontSize: 20 }}>{q.entityDuplicates.length}</div>
            <div className="tile__label">entity duplicates</div>
          </div>
          <div className="tile">
            <div className="tile__value" style={{ fontSize: 20 }}>{q.canonProposals.length}</div>
            <div className="tile__label">canon proposals</div>
          </div>
          <div className="tile">
            <div className="tile__value" style={{ fontSize: 20, color: q.mergedCount === 0 ? "var(--good)" : "var(--bad)" }}>
              {q.mergedCount}
            </div>
            <div className="tile__label">auto-merges (must be 0)</div>
          </div>
        </div>

        <div className="banner">
          Nothing here is merged, renamed, or applied automatically. Confirm/reject records your review; the governed
          registry action is the real gate. A label match is never a semantic merge (identity, not authority).
          {decidedCount > 0 ? ` · ${decidedCount} reviewed this session (not persisted)` : ""}
        </div>

        {/* Lane 1 — cross-source entity duplicates */}
        <div className="eyebrow" style={{ margin: "14px 0 8px" }}>Cross-source entity duplicates</div>
        {q.entityDuplicates.map((d, i) => {
          const id = `dupe:${d.left_id}:${d.right_id}:${i}`;
          const dec = decisions[id];
          return (
            <div key={id} className="qrow qrow--dupe">
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", alignItems: "baseline" }}>
                <div style={{ minWidth: 0 }}>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{d.left_name}</span>
                  <span className="muted" style={{ margin: "0 8px", fontFamily: "var(--mono)" }}>≈</span>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{d.right_name}</span>
                </div>
                <span className="chip chip--review">score {d.score.toFixed(2)}</span>
              </div>
              <div className="muted" style={{ fontSize: 11.5, fontFamily: "var(--mono)", margin: "6px 0 8px" }}>
                {d.reasons.join(" · ")} · propose-only
              </div>
              <DecisionButtons decision={dec} onDecide={(x) => decide(id, x)} />
            </div>
          );
        })}
        {q.entityDuplicates.length === 0 && (
          <div className="muted" style={{ fontSize: 13 }}>No cross-source duplicate candidates in this run.</div>
        )}

        {/* Lane 2 — external-canon alias proposals */}
        <div className="eyebrow" style={{ margin: "18px 0 8px" }}>External-canon alias proposals</div>
        {q.canonProposals.map((p, i) => {
          const id = `canon:${p.incoming}:${i}`;
          const dec = decisions[id];
          return (
            <div key={id} className="qrow qrow--canon">
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", alignItems: "baseline" }}>
                <div style={{ minWidth: 0, fontFamily: "var(--mono)", fontSize: 13 }}>
                  <span style={{ fontWeight: 600 }}>{p.incoming}</span>
                  <span className="muted" style={{ margin: "0 8px" }}>→</span>
                  <span>{p.canonical}</span>
                </div>
                <span style={{ display: "inline-flex", gap: 6 }}>
                  <span className="chip chip--kind">{p.kind}</span>
                  <span className="chip">{p.source}</span>
                  <span className="chip chip--review">{p.origin}</span>
                </span>
              </div>
              {p.note && (
                <div className="muted" style={{ fontSize: 11.5, margin: "6px 0 8px" }}>{p.note}</div>
              )}
              <DecisionButtons decision={dec} onDecide={(x) => decide(id, x)} />
            </div>
          );
        })}
        {q.canonProposals.length === 0 && (
          <div className="muted" style={{ fontSize: 13 }}>No canon alias proposals pending.</div>
        )}
      </Panel>

      {/* ============================ MARKET (labeled synthetic) ============================ */}
      <Panel
        title="Full-market institutions — 5300 at scale"
        eyebrow={`${vm.market.size} institutions · connector health: ${vm.market.healthState}`}
      >
        <div
          className="banner"
          style={{ borderColor: "var(--review)", color: "var(--ink)", background: "rgba(163,113,247,0.08)" }}
        >
          <strong style={{ color: "var(--review)" }}>SYNTHETIC MARKET — not real filings.</strong>{" "}
          {vm.market.size} institutions ran through the unchanged NCUA 5300 connector at scale ({vm.market.synthetic}{" "}
          synthetic-labeled · {vm.market.golden} illustrative golden). Every figure carries a{" "}
          <code style={{ fontFamily: "var(--mono)" }}>:synthetic:</code> source label
          {vm.market.allLabeledSynthetic ? " (all labeled ✓)" : " — ⚠ UNLABELED RECORD PRESENT"}. A real bulk 5300 feed
          is a Bryan-only external item; do not cite any figure here as fact about a real institution.
        </div>

        <div className="eyebrow" style={{ margin: "12px 0 8px" }}>
          Sample — illustrative golden head (top by net-worth ratio)
        </div>
        <div className="list">
          {vm.market.sample.map((inst, i) => (
            <div key={`${inst.charter}-${i}`} className="orow">
              <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap", marginBottom: 8 }}>
                <span style={{ fontWeight: 600, fontSize: 14 }}>{inst.name}</span>
                <span className="chip" style={{ color: HEALTH_COLOR[inst.health], borderColor: HEALTH_COLOR[inst.health], fontWeight: 600 }}>
                  {inst.health}
                </span>
                <span className="muted" style={{ fontSize: 12, fontFamily: "var(--mono)" }}>
                  charter {inst.charter} · {inst.period}
                </span>
                <span className={`chip ${inst.synthetic ? "chip--synthetic" : "chip--kind"}`} style={{ marginLeft: "auto" }}>
                  {inst.synthetic ? "synthetic" : "illustrative"}
                </span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(96px, 1fr))", gap: 8 }}>
                <div>
                  <div className="muted" style={{ fontSize: 10.5, fontFamily: "var(--mono)" }}>net worth</div>
                  <div style={{ fontFamily: "var(--mono)", fontWeight: 600, color: inst.net_worth_ratio >= 7 ? "var(--good)" : "var(--bad)" }}>
                    {inst.net_worth_ratio.toFixed(1)}%
                  </div>
                </div>
                <div>
                  <div className="muted" style={{ fontSize: 10.5, fontFamily: "var(--mono)" }}>ROA</div>
                  <div style={{ fontFamily: "var(--mono)", fontWeight: 600, color: inst.roa > 0 ? "var(--good)" : "var(--bad)" }}>
                    {inst.roa.toFixed(2)}%
                  </div>
                </div>
                <div>
                  <div className="muted" style={{ fontSize: 10.5, fontFamily: "var(--mono)" }}>delinquency</div>
                  <div style={{ fontFamily: "var(--mono)", fontWeight: 600, color: inst.delinquency_ratio < 1 ? "var(--good)" : "var(--bad)" }}>
                    {inst.delinquency_ratio.toFixed(2)}%
                  </div>
                </div>
                <div>
                  <div className="muted" style={{ fontSize: 10.5, fontFamily: "var(--mono)" }}>confidence</div>
                  <div style={{ fontFamily: "var(--mono)", fontWeight: 600 }}>{inst.profileConfidence.toFixed(2)}</div>
                </div>
              </div>
              <div className="muted" style={{ fontSize: 11, marginTop: 6, fontFamily: "var(--mono)" }}>source: {inst.source_ref}</div>
            </div>
          ))}
        </div>
        <div className="muted" style={{ fontSize: 12, marginTop: 10 }}>
          The remaining {Math.max(0, vm.market.size - vm.market.sample.length)} institutions are synthetic-labeled and
          aggregated above — never itemized as real.
        </div>
      </Panel>
    </div>
  );
}
