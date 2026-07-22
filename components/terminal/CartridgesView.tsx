//
// components/terminal/CartridgesView.tsx — Olympic Sprint IV Wave 3.
//
// The `/cartridges` surface, PROMOTED from a scaffold to a REAL surface over the LIVE
// installed PackagedConfigurations. It renders the installed-capability manifest (built
// by the pure `buildCartridgesView`): for each cartridge, what it declares (counts of
// each config-as-data collection), which workspaces run it, and the doctrine states.
//
// A cartridge extends capability through CONFIGURATION, not a vertical fork — this
// surface makes that concrete: the core primitive is a "packaged configuration"; the
// vertical (Cooperative Markets, etc.) lives only in the DATA each one declares. This
// view READS ONLY — it never installs, enables, or edits a configuration.
//
// Pure presentational SERVER component (no hooks, no data/engine imports) — renders a
// serializable VM, so it prerenders statically with no client bundle. Look/feel is
// DEFERRED (Terminal polish sprint); reuses the app design tokens.

import type React from "react";
import type { CartridgesVM, CartridgeRowVM, CartridgeState, CartridgeCounts } from "@/app/_surfaces/cartridges_view";

const STATE_COLOR: Record<CartridgeState, string> = {
  current: "var(--good)",
  restricted: "var(--bad)",
};

const COUNT_LABELS: { key: keyof CartridgeCounts; label: string }[] = [
  { key: "entityTypes", label: "entity types" },
  { key: "workflows", label: "workflows" },
  { key: "rules", label: "rules" },
  { key: "metrics", label: "metrics" },
  { key: "reports", label: "reports" },
  { key: "checklistTemplates", label: "checklists" },
  { key: "dashboards", label: "dashboards" },
  { key: "knowledge", label: "knowledge" },
  { key: "sourceTypes", label: "source types" },
  { key: "agentInstructions", label: "agent prompts" },
  { key: "approvalRules", label: "approval rules" },
];

export function CartridgesView({ vm }: { vm: CartridgesVM }): React.JSX.Element {
  return (
    <div style={{ maxWidth: 1120, margin: "0 auto" }}>
      <div className="eyebrow">Platform · Cartridges · installed configurations</div>
      <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", margin: "4px 0 6px" }}>
        <h1 style={{ margin: 0, fontSize: 24 }}>Cartridges</h1>
        <span className="chip chip--kind">{vm.counts.total} installed</span>
        <span className="chip" style={{ color: "var(--muted)", marginLeft: "auto" }}>generated {vm.generatedAt}</span>
      </div>
      <p className="muted" style={{ fontSize: 13, marginTop: 0, maxWidth: 900 }}>
        Installed capability cartridges. Each extends the kernel through <em>configuration</em> — schemas, rules,
        prompts, workflows, metrics, reports, dashboards, knowledge — never a vertical fork. The core primitive is a
        packaged configuration; the vertical lives only in the data each one declares.
      </p>

      <div className="tiles" style={{ marginBottom: 12 }}>
        <Tile value={vm.counts.total} label="installed" />
        <Tile value={vm.counts.active} label="operating" color="var(--good)" />
        <Tile value={vm.counts.workflows} label="workflows declared" />
        <Tile value={vm.counts.reports} label="report templates" />
      </div>

      <div className="list">
        {vm.rows.map((r) => <CartridgeRow key={r.key} r={r} />)}
        {vm.rows.length === 0 && (
          <div className="muted" style={{ fontSize: 13, padding: 12 }}>No cartridges installed.</div>
        )}
      </div>
    </div>
  );
}

function CartridgeRow({ r }: { r: CartridgeRowVM }): React.JSX.Element {
  return (
    <section className="card">
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", alignItems: "baseline" }}>
        <div style={{ minWidth: 0 }}>
          <span style={{ fontWeight: 600, fontSize: 15 }}>{r.label}</span>
          <span className="muted" style={{ marginLeft: 8, fontSize: 12, fontFamily: "var(--mono)" }}>{r.key} · v{r.version}</span>
        </div>
        <span style={{ display: "inline-flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
          {r.states.map((s) => (
            <span key={s} className="chip" style={{ color: STATE_COLOR[s], borderColor: STATE_COLOR[s] }}>
              {s.replace(/_/g, " ")}
            </span>
          ))}
          <span className="chip" style={{ color: "var(--muted)" }}>{r.status}</span>
        </span>
      </div>

      <div className="muted" style={{ fontSize: 12, margin: "6px 0" }}>{r.description}</div>
      <div className="event" style={{ fontSize: 11.5 }}>
        {r.capabilityTotal} declared capability items ·{" "}
        {r.installedCount > 0 ? `running in ${r.workspaceLabels.join(", ")}` : "available — not in use"}
      </div>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
        {COUNT_LABELS.map(({ key, label }) => (
          <span key={key} className="pill" title={label}>
            {r.counts[key]} {label}
          </span>
        ))}
      </div>
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
