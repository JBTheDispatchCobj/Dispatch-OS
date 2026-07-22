"use client";
//
// components/terminal/InstitutionsDirectoryView.tsx — Olympic Sprint IV Wave 1.
//
// The client "Institutions — Directory" surface. Promoted from a scaffold to a
// REAL directory over the full-market institution profiles. The server page
// builds a fully-shaped, deterministic view-model (every institution itemized);
// this component renders it as a browsable directory — search, filter by
// readiness / asset-band / label, sort — and each row opens that institution's
// Terminal. Scales one → thousands.
//
// TRUTH DISCIPLINE ON SCREEN (doctrine state legend, rendered visibly distinct):
//   * SYNTHETIC — the market is labeled synthetic (a real bulk 5300 feed is
//     Bryan-only); every synthetic row is chipped and can never read as real.
//   * INFERRED  — profile confidence is a Dispatch inference, chipped as such.
//   * MISSING   — REGION is not sourced from a 5300; shown as "missing", never
//     faked. The filter/columns surface it honestly.
// The ratios are deterministic calculations; each row shows its filing source_ref.
//
// Look/feel is DEFERRED (Terminal polish sprint). Reuses the app design tokens +
// the Market/Network visual language so the surfaces read as one product. Pure
// presentational + local query state; no server/engine imports. Filtering/sorting
// uses the SHARED pure `queryDirectory` so the screen matches the tested contract.

import { useMemo, useState } from "react";
import type React from "react";
import {
  queryDirectory,
  type InstitutionsDirectoryVM,
  type InstitutionRow,
  type DirectoryQuery,
  type ReadinessBand,
  type AssetBand,
  type ProvenanceLabel,
} from "@/cartridges/cooperative_markets/run_institutions_directory";

const READINESS_LABEL: Record<ReadinessBand, string> = {
  well_capitalized: "well-capitalized (≥7%)",
  adequate: "adequate (6–7%)",
  undercapitalized: "undercapitalized (<6%)",
};
const READINESS_COLOR: Record<ReadinessBand, string> = {
  well_capitalized: "var(--good)",
  adequate: "var(--warn)",
  undercapitalized: "var(--bad)",
};
const ASSET_LABEL: Record<AssetBand, string> = {
  under_50m: "< $50M",
  "50m_250m": "$50M–$250M",
  "250m_1b": "$250M–$1B",
  over_1b: "> $1B",
};

/** Compact native-dollar formatter (deterministic; no locale surprises). */
function money(n: number): string {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
  return `$${n}`;
}

const DEFAULT_SHOWN = 40;

export function InstitutionsDirectoryView({ vm }: { vm: InstitutionsDirectoryVM }): React.JSX.Element {
  const [search, setSearch] = useState("");
  const [readiness, setReadiness] = useState<ReadinessBand | "all">("all");
  const [band, setBand] = useState<AssetBand | "all">("all");
  const [label, setLabel] = useState<ProvenanceLabel | "all">("all");
  const [sortBy, setSortBy] = useState<NonNullable<DirectoryQuery["sortBy"]>>("net_worth");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [shown, setShown] = useState(DEFAULT_SHOWN);

  const results = useMemo(
    () => queryDirectory(vm.rows, { search, readiness, assetBand: band, label, sortBy, sortDir }),
    [vm.rows, search, readiness, band, label, sortBy, sortDir],
  );
  const visible = results.slice(0, shown);

  return (
    <div style={{ maxWidth: 1120, margin: "0 auto" }}>
      {/* Header */}
      <div className="eyebrow">Cooperative Markets · Institutions · directory</div>
      <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", margin: "4px 0 6px" }}>
        <h1 style={{ margin: 0, fontSize: 24 }}>Institutions</h1>
        <span className="chip chip--synthetic">market: synthetic</span>
        <span className="chip" style={{ color: "var(--muted)", marginLeft: "auto" }}>generated {vm.generatedAt}</span>
      </div>
      <p className="muted" style={{ fontSize: 13, marginTop: 0, maxWidth: 860 }}>
        The full institution market, itemized — search, filter by readiness / asset band / label, sort, and open any
        institution&apos;s Terminal. Scales from one institution to thousands. Figures are labeled synthetic pending a
        real bulk 5300 feed; profile confidence is a Dispatch inference; region is not sourced and is shown as missing.
      </p>

      {/* Provenance banner (labeled, never presentable as real) */}
      <div className="banner" style={{ borderColor: "var(--review)", color: "var(--ink)", background: "rgba(163,113,247,0.08)" }}>
        <strong style={{ color: "var(--review)" }}>SYNTHETIC MARKET — not real filings.</strong>{" "}
        {vm.market.size} institutions ({vm.market.synthetic} synthetic-labeled · {vm.market.illustrative} illustrative
        golden){vm.market.allLabeled ? " — all labeled ✓" : " — ⚠ UNLABELED RECORD PRESENT"}.{" "}
        {vm.market.regionMissing && (
          <>
            <span className="chip" style={{ color: "var(--muted)", borderColor: "var(--muted)" }}>region: missing</span>{" "}
            region is not sourced from a 5300 — shown as missing, never faked.
          </>
        )}{" "}
        A real bulk 5300 feed is a Bryan-only external item; do not cite any figure here as fact about a real institution.
      </div>

      {/* Controls */}
      <section className="card" style={{ marginBottom: 14 }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <input
            className="input"
            type="text"
            placeholder="Search name or charter…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setShown(DEFAULT_SHOWN); }}
            style={{ flex: "1 1 240px", minWidth: 180, padding: "7px 10px", background: "var(--panel-2)", border: "1px solid var(--line)", borderRadius: 8, color: "var(--ink)" }}
            aria-label="Search institutions by name or charter"
          />
          <Select label="readiness" value={readiness} onChange={(v) => { setReadiness(v as ReadinessBand | "all"); setShown(DEFAULT_SHOWN); }}
            options={[["all", "all readiness"], ...vm.facets.readiness.map((r) => [r, READINESS_LABEL[r]] as [string, string])]} />
          <Select label="assets" value={band} onChange={(v) => { setBand(v as AssetBand | "all"); setShown(DEFAULT_SHOWN); }}
            options={[["all", "all asset bands"], ...vm.facets.assetBand.map((b) => [b, ASSET_LABEL[b]] as [string, string])]} />
          <Select label="label" value={label} onChange={(v) => { setLabel(v as ProvenanceLabel | "all"); setShown(DEFAULT_SHOWN); }}
            options={[["all", "all labels"], ...vm.facets.label.map((l) => [l, l] as [string, string])]} />
          <Select label="sort" value={sortBy} onChange={(v) => setSortBy(v as NonNullable<DirectoryQuery["sortBy"]>)}
            options={[["net_worth", "net-worth ratio"], ["assets", "total assets"], ["roa", "ROA"], ["confidence", "confidence"], ["name", "name"]]} />
          <button type="button" className="btn btn--sm" onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))} aria-label="Toggle sort direction">
            {sortDir === "asc" ? "▲ asc" : "▼ desc"}
          </button>
        </div>
        <div className="muted" style={{ fontSize: 12, marginTop: 10 }}>
          {results.length} of {vm.market.size} institutions match · showing {Math.min(shown, results.length)}
        </div>
      </section>

      {/* Rows */}
      <div className="list">
        {visible.map((inst, i) => (
          <DirectoryRow key={`${inst.charter}-${i}`} inst={inst} />
        ))}
        {results.length === 0 && (
          <div className="muted" style={{ fontSize: 13, padding: 12 }}>No institutions match these filters.</div>
        )}
      </div>

      {shown < results.length && (
        <div style={{ textAlign: "center", marginTop: 12 }}>
          <button type="button" className="btn" onClick={() => setShown((n) => n + 40)}>
            Show 40 more ({results.length - shown} remaining)
          </button>
        </div>
      )}
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: [string, string][];
}): React.JSX.Element {
  return (
    <label style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12 }}>
      <span className="muted" style={{ fontFamily: "var(--mono)" }}>{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ padding: "6px 8px", background: "var(--panel-2)", border: "1px solid var(--line)", borderRadius: 8, color: "var(--ink)", fontSize: 12 }}
      >
        {options.map(([v, l]) => (
          <option key={v} value={v}>{l}</option>
        ))}
      </select>
    </label>
  );
}

function DirectoryRow({ inst }: { inst: InstitutionRow }): React.JSX.Element {
  return (
    <a href={inst.terminal_href} className="orow" style={{ display: "block", textDecoration: "none", color: "inherit" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap", marginBottom: 8 }}>
        <span style={{ fontWeight: 600, fontSize: 14 }}>{inst.name}</span>
        <span className="chip" style={{ color: READINESS_COLOR[inst.readiness], borderColor: READINESS_COLOR[inst.readiness], fontWeight: 600 }}>
          {READINESS_LABEL[inst.readiness]}
        </span>
        <span className="muted" style={{ fontSize: 12, fontFamily: "var(--mono)" }}>
          charter {inst.charter} · {inst.period} · {ASSET_LABEL[inst.assetBand]}
        </span>
        <span className="chip" style={{ color: "var(--muted)", borderColor: "var(--muted)" }}>region: missing</span>
        {inst.label === "unlabeled" ? (
          <span className="chip" style={{ color: "var(--bad)", borderColor: "var(--bad)", fontWeight: 600, marginLeft: "auto" }}>
            ⚠ unlabeled
          </span>
        ) : (
          <span className={`chip ${inst.synthetic ? "chip--synthetic" : "chip--kind"}`} style={{ marginLeft: "auto" }}>
            {inst.label}
          </span>
        )}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(92px, 1fr))", gap: 8 }}>
        <Metric label="assets" value={money(inst.total_assets)} />
        <Metric label="net worth" value={`${inst.net_worth_ratio.toFixed(1)}%`} color={inst.net_worth_ratio >= 7 ? "var(--good)" : "var(--bad)"} />
        <Metric label="ROA" value={`${inst.roa.toFixed(2)}%`} color={inst.roa > 0 ? "var(--good)" : "var(--bad)"} />
        <Metric label="delinquency" value={`${inst.delinquency_ratio.toFixed(2)}%`} color={inst.delinquency_ratio < 1 ? "var(--good)" : "var(--bad)"} />
        <Metric label="loan/share" value={`${inst.loan_to_share.toFixed(0)}%`} />
        <Metric label="members" value={inst.members.toLocaleString("en-US")} />
        <MetricInferred label="confidence" value={inst.profileConfidence.toFixed(2)} />
      </div>
      <div className="muted" style={{ fontSize: 11, marginTop: 6, fontFamily: "var(--mono)" }}>source: {inst.source_ref} · open Terminal →</div>
    </a>
  );
}

function Metric({ label, value, color }: { label: string; value: string; color?: string }): React.JSX.Element {
  return (
    <div>
      <div className="muted" style={{ fontSize: 10.5, fontFamily: "var(--mono)" }}>{label}</div>
      <div style={{ fontFamily: "var(--mono)", fontWeight: 600, ...(color ? { color } : {}) }}>{value}</div>
    </div>
  );
}

/** A metric that is an INFERENCE, chipped so it never reads as a hard fact. */
function MetricInferred({ label, value }: { label: string; value: string }): React.JSX.Element {
  return (
    <div>
      <div className="muted" style={{ fontSize: 10.5, fontFamily: "var(--mono)" }}>
        {label} <span className="chip" style={{ color: "var(--accent)", borderColor: "var(--accent)", fontSize: 9, padding: "0 4px" }}>inferred</span>
      </div>
      <div style={{ fontFamily: "var(--mono)", fontWeight: 600, color: "var(--accent)" }}>{value}</div>
    </div>
  );
}
