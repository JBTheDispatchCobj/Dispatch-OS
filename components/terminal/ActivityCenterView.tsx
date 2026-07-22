//
// components/terminal/ActivityCenterView.tsx — Olympic Sprint IV Wave 3.
//
// The TERMINAL RUNTIME's NOTIFICATION + TASK CENTERS (Vol VII), rendered from the pure
// `buildActivityCenter` projection over the LIVE approval / work-item / evidence queues.
// It is the attention layer of the runtime shell + Home command center: what OWES a
// human act, and where to go to take it.
//
// READ-ONLY BY CONSTRUCTION. Every notification links (`href`) to the existing
// permission-engine surface that RESOLVES it (/approvals, /workflows, /evidence, /work);
// nothing is decided, reviewed, or transitioned here. The center can never be a hidden
// control — it reports what is owed and points at the governed surface.
//
// Pure presentational SERVER component (no hooks, no data/engine imports) — it renders a
// serializable VM the caller passes in, so it prerenders statically and adds no client
// bundle. Look/feel is DEFERRED (Terminal polish sprint); it reuses the app design tokens.

import Link from "next/link";
import type React from "react";
import type { ActivityCenterVM, ActivityState, NotificationVM, TaskVM } from "@/app/_surfaces/activity_center";

const STATE_COLOR: Record<ActivityState, string> = {
  current: "var(--good)",
  stale: "var(--warn)",
  pending_approval: "var(--review)",
  conflicted: "var(--bad)",
};

function StateChips({ states }: { states: ActivityState[] }): React.JSX.Element {
  return (
    <span style={{ display: "inline-flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" }}>
      {states.map((s) => (
        <span key={s} className="chip" style={{ color: STATE_COLOR[s], borderColor: STATE_COLOR[s] }}>
          {s.replace(/_/g, " ")}
        </span>
      ))}
    </span>
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

export function ActivityCenterView({ vm }: { vm: ActivityCenterVM }): React.JSX.Element {
  return (
    <section style={{ margin: "0 0 22px" }}>
      <div className="eyebrow">Terminal runtime · notification &amp; task center · live queues</div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", margin: "4px 0 8px" }}>
        <h2 style={{ margin: 0, fontSize: 18 }}>What needs you</h2>
        <span className="chip chip--review">{vm.counts.gatesOwed + vm.counts.reviewsOwed} gates owed</span>
        <span className="chip" style={{ color: "var(--muted)", marginLeft: "auto" }}>generated {vm.generatedAt}</span>
      </div>
      <p className="muted" style={{ fontSize: 12.5, marginTop: 0, maxWidth: 900 }}>
        A read-only projection over the live approval, work-item, and evidence queues. Every item links to the surface
        where an authorized human takes the action (<span style={{ color: "var(--review)" }}>approvals</span>,
        workflows, evidence) — nothing is decided here.
      </p>

      <div className="tiles" style={{ marginBottom: 12 }}>
        <Tile value={vm.counts.gatesOwed} label="approval gates" color={vm.counts.gatesOwed > 0 ? "var(--review)" : undefined} />
        <Tile value={vm.counts.reviewsOwed} label="reviews owed" color={vm.counts.reviewsOwed > 0 ? "var(--review)" : undefined} />
        <Tile value={vm.counts.conflicts} label="conflicts" color={vm.counts.conflicts > 0 ? "var(--bad)" : undefined} />
        <Tile value={vm.counts.tasks} label="open tasks" />
      </div>

      <div className="grid2">
        {/* Notifications */}
        <section className="card">
          <div className="eyebrow" style={{ marginBottom: 8 }}>
            Notifications {vm.counts.restricted > 0 ? `· ${vm.counts.restricted} restricted` : ""}
          </div>
          <div className="list">
            {vm.notifications.map((n) => <NotificationRow key={n.id} n={n} />)}
            {vm.notifications.length === 0 && (
              <div className="muted" style={{ fontSize: 13, padding: 12 }}>Nothing owes a decision. Queues are clear.</div>
            )}
          </div>
        </section>

        {/* Tasks */}
        <section className="card">
          <div className="eyebrow" style={{ marginBottom: 8 }}>
            Task center · {vm.counts.tasks} open{vm.counts.tasksAwaitingGate > 0 ? ` · ${vm.counts.tasksAwaitingGate} awaiting a gate` : ""}
          </div>
          <div className="list">
            {vm.tasks.map((t) => <TaskRow key={t.id} t={t} />)}
            {vm.tasks.length === 0 && (
              <div className="muted" style={{ fontSize: 13, padding: 12 }}>No open work items.</div>
            )}
          </div>
        </section>
      </div>
    </section>
  );
}

function NotificationRow({ n }: { n: NotificationVM }): React.JSX.Element {
  return (
    <Link href={n.href} className="wrow" style={{ textDecoration: "none", color: "inherit" }}>
      <div className="wrow__main">
        <span className="wrow__title" style={{ fontSize: 13.5 }}>{n.title}</span>
        <span className="muted" style={{ fontSize: 12, display: "block", marginTop: 2 }}>
          {n.subtitle} · {n.workspace_label} · → {n.href}
        </span>
      </div>
      <div className="wrow__side">
        <StateChips states={n.states} />
        {n.restricted && <span className="chip" style={{ color: "var(--bad)", borderColor: "var(--bad)" }}>restricted</span>}
      </div>
    </Link>
  );
}

function TaskRow({ t }: { t: TaskVM }): React.JSX.Element {
  return (
    <Link href={t.href} className="wrow" style={{ textDecoration: "none", color: "inherit" }}>
      <div className="wrow__main">
        <span className="wrow__title" style={{ fontSize: 13.5 }}>{t.title}</span>
        <span className="muted" style={{ fontSize: 12, display: "block", marginTop: 2 }}>
          {t.assignee_name ? `assigned ${t.assignee_name}` : "unassigned"} · {t.priority} priority · {t.workspace_label}
        </span>
      </div>
      <div className="wrow__side">
        <StateChips states={t.states} />
        <span className="chip" style={{ color: "var(--muted)" }}>{t.status.replace(/_/g, " ")}</span>
      </div>
    </Link>
  );
}
