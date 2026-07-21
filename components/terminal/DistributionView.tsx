"use client";
//
// components/terminal/DistributionView.tsx — Olympic Sprint Wave 4.
//
// The client "Channel / Distribution" surface — the publication capstone made
// visible. It renders a fully-shaped view-model (built by app/distribution/page.tsx
// from the Auric distribution engine) as a real product surface that tells the
// EDITORIAL-GATE story: an assembled + rendered Intelligence Object reaches a
// channel ONLY after a HUMAN editorial disposition (its `by` + `decision_ref`)
// authorizes it. Held / rejected / absent → NOTHING is delivered.
//
// The GATE panel puts the two states side by side (HELD vs APPROVED) so the "gate
// has teeth" contrast is obvious; the CHANNELS panel groups the approved deliveries
// by whatever channels actually received them (brief / market_feed / terminal_feed —
// rendered generically, never hardcoded to a fixed count), each carrying its lens,
// visibility reach, and a LINEAGE line (editorial_decision_ref + approved_by + the
// source_refs it restates). A truth-discipline note surfaces `deliveriesRestateIO`:
// every delivery restates the IO's refs exactly, never a superset.
//
// Pure presentational — it does NO data work and imports NO server/engine modules,
// so it never pulls a server module into the client bundle. Reuses the app design
// tokens (globals.css) and the TerminalView visual language so the surfaces read as
// one product. Client interaction: a dependency-free view/channel toggle
// (React useState), mirroring TerminalView's lens toggle.

import { useState } from "react";
import type React from "react";

// ---------------------------------------------------------------------------
// View-model (owned here; the server page builds it and passes `vm`)
// ---------------------------------------------------------------------------

/** One published channel delivery, flattened for rendering. */
export interface DistributionDeliveryVM {
  id: string;
  channel: string;
  title: string;
  body: string;
  /** Channel default reach ("public" | "network" | …). */
  visibility: string;
  variant_id: string;
  /** The editorial decision that authorized publication (lineage, not a weight). */
  editorial_decision_ref: string;
  approved_by: string;
  /** Restates the IO's refs exactly (== ioSourceRefs). */
  source_refs: string[];
}

/** A channel from the requested set, and whether it received ≥1 delivery. */
export interface DistributionChannelVM {
  channel: string;
  label: string;
  /** The channel's default reach. */
  visibility: string;
  received: boolean;
}

/** A channel that received deliveries, with those deliveries grouped under it. */
export interface DistributionChannelGroupVM {
  channel: string;
  label: string;
  visibility: string;
  deliveries: DistributionDeliveryVM[];
}

/** One side of the gate story (held or approved). */
export interface DistributionGateStateVM {
  status: string; // "held_for_editorial" | "published" | "rejected"
  reason: string;
  deliveryCount: number;
  /** The editorial disposition that gated this state (null when none supplied). */
  editorial: { disposition: string; by: string; decision_ref: string } | null;
}

/** The Intelligence Object being distributed (id + headline + the delivered refs). */
export interface DistributionIOVM {
  id: string;
  headline: string;
  top_tier: string | null;
  visibility: string;
  /** The refs the deliveries restate (the IO's own source union, as delivered). */
  source_refs: string[];
}

export interface DistributionVM {
  generatedAt: string;
  io: DistributionIOVM;
  /** The full requested channel set (DEFAULT_CHANNELS), each flagged received / not. */
  channelSet: DistributionChannelVM[];
  /** State (a): no editorial disposition → nothing published (the gate has teeth). */
  held: DistributionGateStateVM;
  /** State (b): an editor approved publication → deliveries flowed. */
  approved: DistributionGateStateVM & {
    channels: string[];
    groups: DistributionChannelGroupVM[];
  };
  /** Truth discipline: every delivery restates the IO's refs exactly (no superset). */
  restatesIO: boolean;
}

// ---------------------------------------------------------------------------
// Small presentational helpers (same discipline as TerminalView / MarketView)
// ---------------------------------------------------------------------------

type ViewKey = "gate" | "channels";

const cap = (s: string) => s.replace(/_/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());

const STATUS_COLOR: Record<string, string> = {
  published: "var(--good)",
  held_for_editorial: "var(--warn)",
  rejected: "var(--bad)",
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

/** A visibility reach badge: public (open) vs network (institution reach). */
function VisibilityBadge({ visibility }: { visibility: string }): React.JSX.Element {
  const isPublic = visibility === "public";
  const color = isPublic ? "var(--accent)" : "var(--review)";
  return (
    <span className="chip" style={{ color, borderColor: color, fontWeight: 600 }}>
      {isPublic ? "public" : visibility === "network" ? "network reach" : visibility}
    </span>
  );
}

function StatusChip({ status }: { status: string }): React.JSX.Element {
  const color = STATUS_COLOR[status] ?? "var(--muted)";
  return (
    <span
      className="chip"
      style={{
        background: `color-mix(in srgb, ${color} 18%, transparent)`,
        color,
        borderColor: "transparent",
        fontWeight: 600,
      }}
    >
      {cap(status)}
    </span>
  );
}

/** One side of the side-by-side gate contrast. */
function GateCard({
  heading,
  state,
  hasTeeth,
}: {
  heading: string;
  state: DistributionGateStateVM;
  hasTeeth?: boolean;
}): React.JSX.Element {
  const accent = state.deliveryCount > 0 ? "var(--good)" : "var(--warn)";
  return (
    <div className="orow" style={{ borderColor: accent }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
        <span style={{ fontWeight: 600, fontSize: 14 }}>{heading}</span>
        <StatusChip status={state.status} />
      </div>

      <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 8 }}>
        <span
          className="tile__value"
          style={{ fontSize: 26, color: state.deliveryCount > 0 ? "var(--good)" : "var(--bad)" }}
        >
          {state.deliveryCount}
        </span>
        <span className="muted" style={{ fontSize: 12 }}>
          {state.deliveryCount === 1 ? "delivery published" : "deliveries published"}
        </span>
      </div>

      {state.editorial ? (
        <div className="note" style={{ marginBottom: 0 }}>
          <div className="note__head">
            <span className="note__author">
              editor {state.editorial.by} · {state.editorial.disposition}
            </span>
          </div>
          <div className="muted" style={{ fontSize: 11.5, fontFamily: "var(--mono)" }}>
            decision {state.editorial.decision_ref}
          </div>
        </div>
      ) : (
        <div className="banner" style={{ marginBottom: 0 }}>
          No editorial disposition supplied.
          {hasTeeth ? " The gate has teeth: nothing publishes without a human sign-off." : ""}
        </div>
      )}

      <div className="muted" style={{ fontSize: 12, marginTop: 8 }}>
        {state.reason}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// The Distribution surface
// ---------------------------------------------------------------------------

export function DistributionView({ vm }: { vm: DistributionVM }): React.JSX.Element {
  const [view, setView] = useState<ViewKey>("gate");
  // Channel filter over the approved delivery groups (null = all). Generic over
  // whatever channels are present — never assumes an exact set.
  const [channelFilter, setChannelFilter] = useState<string | null>(null);

  const groups =
    channelFilter === null
      ? vm.approved.groups
      : vm.approved.groups.filter((g) => g.channel === channelFilter);

  const publishedChannels = vm.channelSet.filter((c) => c.received).length;

  return (
    <div style={{ maxWidth: 1120, margin: "0 auto" }}>
      {/* Header */}
      <div className="eyebrow">
        Auric · Channel / Distribution · editorial publication gate
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", margin: "4px 0 6px" }}>
        <h1 style={{ margin: 0, fontSize: 24 }}>Channel / Distribution</h1>
        <span className="chip" style={{ color: "var(--muted)" }}>
          generated {vm.generatedAt}
        </span>
      </div>
      <p className="muted" style={{ fontSize: 13, marginTop: 0 }}>
        An assembled, rendered Intelligence Object reaches a channel ONLY after a human editorial
        disposition (its editor + decision_ref) authorizes it. Held, rejected, or absent → nothing is
        delivered. This is the editorial gate, with teeth, made visible.
      </p>

      {/* The IO being distributed */}
      <Panel
        title={vm.io.headline}
        eyebrow={`intelligence object · ${vm.io.id} · top tier ${vm.io.top_tier ?? "—"}`}
      >
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
          <VisibilityBadge visibility={vm.io.visibility} />
          <span className="chip chip--kind">{vm.io.source_refs.length} source refs</span>
        </div>
        <div className="muted" style={{ fontSize: 11.5, fontFamily: "var(--mono)", wordBreak: "break-word" }}>
          refs: {vm.io.source_refs.length > 0 ? vm.io.source_refs.join(" · ") : "—"}
        </div>
      </Panel>

      {/* View toggle */}
      <div className="switchrow">
        <span className="switchrow__label">View</span>
        {(
          [
            ["gate", "editorial gate"],
            ["channels", "channels"],
          ] as [ViewKey, string][]
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setView(key)}
            className={`pill${view === key ? " pill--on" : ""}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* GATE — the two states side by side */}
      {view === "gate" && (
        <Panel
          title="The editorial gate — held vs approved"
          eyebrow="same IO + same variants · the only difference is a human editorial disposition"
        >
          <div className="grid2">
            <GateCard heading="(a) HELD — no editor sign-off" state={vm.held} hasTeeth />
            <GateCard heading="(b) APPROVED — editor authorized" state={vm.approved} />
          </div>
          <div className="banner" style={{ marginTop: 12 }}>
            The gate has teeth: the HELD path fed the identical IO and variants into the distributor,
            but with no approved editorial disposition it published {vm.held.deliveryCount}. Publication is
            a sourced human act (a decision_ref), never a model weight or an autonomous default.
          </div>
        </Panel>
      )}

      {/* CHANNELS — grouped by whatever channels received deliveries */}
      {view === "channels" && (
        <>
          {/* Requested channel set — which received ≥1 delivery */}
          <Panel
            title="Requested channels"
            eyebrow={`${publishedChannels} of ${vm.channelSet.length} channels received a delivery`}
          >
            <div className="switchrow">
              <span className="switchrow__label">Filter</span>
              <button
                type="button"
                onClick={() => setChannelFilter(null)}
                className={`pill${channelFilter === null ? " pill--on" : ""}`}
              >
                all
              </button>
              {vm.channelSet.map((c) => (
                <button
                  key={c.channel}
                  type="button"
                  onClick={() => setChannelFilter(c.channel)}
                  disabled={!c.received}
                  className={`pill${channelFilter === c.channel ? " pill--on" : ""}`}
                  style={!c.received ? { opacity: 0.45, cursor: "default" } : undefined}
                  title={c.received ? undefined : "no deliveries on this channel"}
                >
                  {c.channel}
                </button>
              ))}
            </div>

            <div className="list">
              {vm.channelSet.map((c) => (
                <div key={c.channel} className="wrow">
                  <div className="wrow__main">
                    <div className="wrow__title">{c.label}</div>
                    <div className="muted" style={{ fontSize: 12, fontFamily: "var(--mono)" }}>
                      {c.channel}
                    </div>
                  </div>
                  <div className="wrow__side" style={{ textAlign: "right" }}>
                    <VisibilityBadge visibility={c.visibility} />
                    <span
                      className="chip"
                      style={{
                        color: c.received ? "var(--good)" : "var(--muted)",
                        borderColor: c.received ? "var(--good)" : "var(--line)",
                        fontWeight: 600,
                      }}
                    >
                      {c.received ? "delivered" : "no delivery"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          {/* Delivery groups — one card per channel that received deliveries */}
          {groups.map((g) => (
            <Panel
              key={g.channel}
              title={g.label}
              eyebrow={`${g.channel} · ${g.visibility === "public" ? "public (open)" : g.visibility === "network" ? "network reach (institution)" : g.visibility} · ${g.deliveries.length} ${g.deliveries.length === 1 ? "delivery" : "deliveries"}`}
            >
              <div style={{ marginBottom: 8 }}>
                <VisibilityBadge visibility={g.visibility} />
              </div>
              <div className="list">
                {g.deliveries.map((d) => (
                  <div key={d.id} className="orow">
                    <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
                      <span style={{ fontWeight: 600, fontSize: 14 }}>{d.title}</span>
                      <span className="chip chip--kind" style={{ marginLeft: "auto" }}>
                        variant {d.variant_id.split(":").pop() ?? d.variant_id}
                      </span>
                    </div>
                    <div style={{ fontSize: 13, marginBottom: 8 }}>{d.body}</div>

                    {/* Lineage line — the authorization + the restated evidence */}
                    <div className="note" style={{ marginBottom: 0 }}>
                      <div className="note__head">
                        <span className="note__author">authorized by {d.approved_by}</span>
                      </div>
                      <div className="muted" style={{ fontSize: 11.5, fontFamily: "var(--mono)", wordBreak: "break-word" }}>
                        decision {d.editorial_decision_ref}
                      </div>
                      <div className="muted" style={{ fontSize: 11.5, fontFamily: "var(--mono)", wordBreak: "break-word", marginTop: 2 }}>
                        restates {d.source_refs.length} ref{d.source_refs.length === 1 ? "" : "s"}: {d.source_refs.join(" · ")}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          ))}

          {groups.length === 0 && (
            <div className="banner">No deliveries on the selected channel.</div>
          )}
        </>
      )}

      {/* Truth discipline */}
      <Panel title="Truth discipline" eyebrow="every delivery restates the IO's refs exactly — no superset">
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <span
            className="chip"
            style={{
              color: vm.restatesIO ? "var(--good)" : "var(--bad)",
              borderColor: vm.restatesIO ? "var(--good)" : "var(--bad)",
              fontWeight: 600,
            }}
          >
            {vm.restatesIO ? "invariant holds" : "invariant VIOLATED"}
          </span>
          <span className="muted" style={{ fontSize: 12.5 }}>
            {vm.restatesIO
              ? "Every published delivery cites exactly the IO's source refs — a delivery can never cite a superset of the object it restates."
              : "A delivery cited refs the IO does not carry — this must never ship."}
          </span>
        </div>
      </Panel>
    </div>
  );
}
