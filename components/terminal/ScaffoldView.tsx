//
// components/terminal/ScaffoldView.tsx — Olympic Sprint III Wave 5.
//
// The reusable WIREFRAME / SCAFFOLD renderer. A `scaffold` surface (see
// core/registry/data/ui_surfaces.json) is a framed placeholder pending build:
// it declares WHAT the surface is, its primary object, planned tabs, planned
// commands, the human-authority gates that will govern it, and the doctrine
// state legend it must render distinctly (current / stale / missing / inferred /
// synthetic / restricted / pending_approval / conflicted).
//
// This wave deliberately DEFERS look-and-feel (Sprint IV Terminal polish). The
// goal is to FRAME the whole product — every route reachable, every surface's
// contract visible — so the skeleton can be reviewed as one map before any
// styling is locked. It reuses the app design tokens (globals.css) so scaffolds
// read as one product with the live surfaces.
//
// Pure presentational SERVER component: no hooks, no data work, no server/engine
// imports — it renders a serializable `surface` view-model the page passes in.

import type React from "react";
import type { UiSurface, SurfaceState } from "@/core/registry/ui_surfaces";

// The state legend — doctrine truth/coverage states rendered visibly distinct.
const STATE_COLOR: Record<SurfaceState, string> = {
  current: "var(--good)",
  missing: "var(--muted)",
  stale: "var(--warn)",
  inferred: "var(--accent)",
  synthetic: "var(--review)",
  restricted: "var(--bad)",
  pending_approval: "var(--review)",
  conflicted: "var(--bad)",
};

const STATE_NOTE: Record<SurfaceState, string> = {
  current: "sourced + fresh",
  missing: "absent — shown, never faked",
  stale: "past its freshness window",
  inferred: "a Dispatch inference, not a fact",
  synthetic: "illustrative — never presentable as real",
  restricted: "hidden or inaccessible by permission",
  pending_approval: "awaits a human gate",
  conflicted: "sources disagree",
};

function Chip({ children, color }: { children: React.ReactNode; color?: string }): React.JSX.Element {
  return (
    <span className="chip" style={color ? { color, borderColor: color } : undefined}>
      {children}
    </span>
  );
}

export function ScaffoldView({ surface }: { surface: UiSurface }): React.JSX.Element {
  return (
    <div style={{ maxWidth: 1120, margin: "0 auto" }}>
      {/* Header — clearly a scaffold */}
      <div className="eyebrow">
        SCAFFOLD · {surface.section}
        {surface.fs_ref ? ` · ${surface.fs_ref}` : ""}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", margin: "4px 0 6px" }}>
        <h1 style={{ margin: 0, fontSize: 24 }}>{surface.title}</h1>
        <Chip color="var(--review)">wireframe · not built</Chip>
        <span className="chip" style={{ color: "var(--muted)", marginLeft: "auto", fontFamily: "var(--mono)" }}>
          {surface.route}
        </span>
      </div>
      <p className="muted" style={{ fontSize: 13, marginTop: 0, maxWidth: 760 }}>
        {surface.purpose}
      </p>

      <div className="banner">
        This route is a framed placeholder. Its contract — primary object, tabs, commands, human gates, and state
        legend — is declared in the UI surface registry (config-as-data). Look, feel, flow and cadence are deferred to
        the Terminal polish sprint; nothing here is styled to final.
      </div>

      <div className="grid2">
        {/* Contract */}
        <section className="card">
          <div className="eyebrow" style={{ marginBottom: 8 }}>Surface contract</div>
          <dl className="kv">
            <dt>primary object</dt>
            <dd style={{ fontFamily: "var(--mono)", fontSize: 12.5 }}>{surface.primary_object}</dd>
            <dt>status</dt>
            <dd>scaffold (placeholder)</dd>
            <dt>human gates</dt>
            <dd>
              {surface.gates.length === 0 ? (
                <span className="muted">none on this surface</span>
              ) : (
                <span style={{ display: "inline-flex", gap: 6, flexWrap: "wrap" }}>
                  {surface.gates.map((g) => (
                    <Chip key={g} color="var(--review)">{g}</Chip>
                  ))}
                </span>
              )}
            </dd>
          </dl>

          <div className="eyebrow" style={{ margin: "14px 0 8px" }}>Planned tabs</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {surface.tabs.map((t) => (
              <span key={t} className="pill">{t}</span>
            ))}
            {surface.tabs.length === 0 && <span className="muted" style={{ fontSize: 13 }}>—</span>}
          </div>

          <div className="eyebrow" style={{ margin: "14px 0 8px" }}>Planned commands</div>
          <div className="list">
            {surface.commands.map((c) => (
              <div key={c} className="event"><b>{c}</b> — versioned · permission-checked · auditable</div>
            ))}
            {surface.commands.length === 0 && <span className="muted" style={{ fontSize: 13 }}>—</span>}
          </div>
        </section>

        {/* State legend */}
        <section className="card">
          <div className="eyebrow" style={{ marginBottom: 8 }}>State legend (doctrine)</div>
          <p className="muted" style={{ fontSize: 12.5, marginTop: 0 }}>
            The states this surface must render <em>visibly distinct</em> — never silently normalized.
          </p>
          <div className="list">
            {surface.states.map((st) => (
              <div key={st} className="wrow" style={{ padding: "8px 12px" }}>
                <div className="wrow__main">
                  <span className="wrow__title" style={{ fontSize: 13 }}>{st}</span>
                  <span className="muted" style={{ fontSize: 12 }}>{STATE_NOTE[st]}</span>
                </div>
                <div className="wrow__side">
                  <Chip color={STATE_COLOR[st]}>{st.replace(/_/g, " ")}</Chip>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
