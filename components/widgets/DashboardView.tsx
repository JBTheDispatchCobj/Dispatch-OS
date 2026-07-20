// components/widgets/DashboardView.tsx
//
// The thin render pass over the widget layer (HANDOFF session-5 priority 1).
// It takes a CompositionResult from composeForWorkspace(...) and renders each
// ResolvedWidget by switching on `widget.type` — one renderer per type. The
// renderer NEVER touches the store and NEVER names a vertical: every label and
// number arrives pre-resolved on the view-model, meaning attached only through
// configuration. Declared actions are wired to server actions via WidgetActions.

import Link from "next/link";
import type {
  ApprovalQueueWidget,
  CompositionResult,
  DecisionTrailWidget,
  EvidencePanelWidget,
  ExceptionPanelWidget,
  InputInboxWidget,
  MetricTileData,
  MetricTileWidget,
  MetricsPanelWidget,
  OutcomePanelWidget,
  ProposalQueueWidget,
  ReportListWidget,
  ResolvedWidget,
  WorkQueueWidget,
} from "@/core/widgets";
import type { UserProfile } from "@/core/types";
import { StatusChip, KindChip, fmtTime } from "@/components/ui";
import { workflowLabel } from "@/core/cartridge";
import WidgetCard from "@/components/widgets/WidgetCard";
import {
  WorkItemActions,
  ProposalActions,
  EvidenceActions,
  InputActions,
  ApprovalActions,
  OutcomeActions,
  ExceptionActions,
  ReportActions,
  GenerateReportButton,
  UnwiredNote,
  unwiredActions,
} from "@/components/widgets/WidgetActions";

// --- small presentational helpers ------------------------------------------

function fmtMetric(d: MetricTileData): string {
  const v = Number.isInteger(d.value) ? d.value : Math.round(d.value * 10) / 10;
  return d.unit === "percent" ? `${v}%` : `${v}`;
}

function MetricTile({ d }: { d: MetricTileData }) {
  const arrow = d.vsTarget === "above" ? "▲" : d.vsTarget === "below" ? "▼" : d.vsTarget === "on" ? "●" : "";
  return (
    <div className="tile">
      <div className="tile__value">{fmtMetric(d)}</div>
      <div className="tile__label">{d.label}</div>
      {d.target !== undefined && (
        <div className={`tile__target tile__target--${d.vsTarget ?? "none"}`}>
          {arrow} target {d.unit === "percent" ? `${d.target}%` : d.target}
        </div>
      )}
    </div>
  );
}

// --- one renderer per widget type -------------------------------------------

function MetricTileBody({ w }: { w: MetricTileWidget }) {
  return <div className="tiles">{w.data && <MetricTile d={w.data} />}</div>;
}

function MetricsPanelBody({ w }: { w: MetricsPanelWidget }) {
  return (
    <div className="tiles">
      {w.data.map((d) => <MetricTile key={d.metric_name} d={d} />)}
    </div>
  );
}

function WorkQueueBody({ w, users }: { w: WorkQueueWidget; users: UserProfile[] }) {
  return (
    <div className="list">
      {w.data.map((wi) => (
        <div key={wi.id} className="wrow">
          <div className="wrow__main">
            <Link href={`/work/${wi.id}`} className="wrow__title">{wi.title}</Link>
            <div className="item__meta">
              <StatusChip status={wi.status} />
              {wi.priority === "high" && <span className="chip chip--high">high</span>}
              <KindChip kind={wi.kind} />
              {wi.assignee_name && <span className="chip">{wi.assignee_name}</span>}
              {wi.source === "agent" && <span className="chip chip--agent">from agent</span>}
            </div>
          </div>
          <WorkItemActions id={wi.id} actions={w.actions} users={users} />
        </div>
      ))}
    </div>
  );
}

function InputInboxBody({ w }: { w: InputInboxWidget }) {
  return (
    <div className="list">
      {w.data.map((row) => (
        <div key={row.input.id} className="wrow">
          <div className="wrow__main">
            <div className="wrow__title">{row.source?.name ?? row.input.input_type ?? row.input.source}</div>
            <div className="item__sub">
              {row.input.input_type ?? "input"} · {fmtTime(row.input.created_at)}
            </div>
          </div>
          <div className="wrow__side">
            <div className="item__meta">
              <span className="chip">{row.input.status}</span>
              {row.runs.length > 0 && <span className="chip">{row.runs.length} run{row.runs.length > 1 ? "s" : ""}</span>}
              {row.proposals.length > 0 && <span className="chip chip--agent">{row.proposals.length} proposal{row.proposals.length > 1 ? "s" : ""}</span>}
            </div>
            <InputActions id={row.input.id} actions={w.actions} />
          </div>
        </div>
      ))}
    </div>
  );
}

function ProposalQueueBody({ w }: { w: ProposalQueueWidget }) {
  return (
    <div className="list">
      {w.data.map((p) => (
        <div key={p.id} className="wrow">
          <div className="wrow__main">
            <div className="wrow__title">{p.proposed.title}</div>
            <div className="item__sub">Would create: {workflowLabel(p.proposed.kind)} · {p.proposed.priority} priority</div>
            {p.rationale && <p className="muted widget__rationale">{p.rationale}</p>}
          </div>
          <div className="wrow__side">
            <StatusChip status={p.status} />
            {p.status === "pending" && <ProposalActions id={p.id} actions={w.actions} />}
          </div>
        </div>
      ))}
    </div>
  );
}

function ApprovalQueueBody({ w }: { w: ApprovalQueueWidget }) {
  return (
    <div className="list">
      {w.data.map((a) => (
        <div key={a.id} className="wrow">
          <div className="wrow__main">
            <div className="wrow__title">{a.approval_type.replace(/_/g, " ")}</div>
            <div className="item__sub">{a.approved_by ?? a.requested_by ?? "—"} · {fmtTime(a.created_at)}</div>
          </div>
          <div className="wrow__side">
            <span className="chip">{a.status}</span>
            {a.status === "requested" && <ApprovalActions id={a.id} actions={w.actions} />}
          </div>
        </div>
      ))}
    </div>
  );
}

function DecisionTrailBody({ w }: { w: DecisionTrailWidget }) {
  return (
    <div className="list">
      {w.data.map((d) => (
        <div key={d.id} className="drow">
          <div className="wrow__title">{d.decision_summary ?? d.decision_type}</div>
          <div className="item__sub">
            {d.selected_action ? `${d.selected_action} · ` : ""}{d.decided_by ?? "—"} · {fmtTime(d.created_at)}
          </div>
        </div>
      ))}
    </div>
  );
}

function EvidencePanelBody({ w }: { w: EvidencePanelWidget }) {
  return (
    <div className="list">
      {w.data.map((e) => {
        const reviewed = e.review_status === "approved" || e.review_status === "rejected";
        return (
          <div key={e.id} className="wrow">
            <div className="wrow__main">
              <div className="wrow__title">{e.label}</div>
              <div className="item__sub">{e.captured_by}</div>
            </div>
            <div className="wrow__side">
              <span className="chip chip--kind">{e.kind}</span>
              {reviewed
                ? <span className={`chip chip--${e.review_status === "approved" ? "completed" : "rejected"}`}>{e.review_status}</span>
                : <EvidenceActions id={e.id} actions={w.actions} />}
            </div>
          </div>
        );
      })}
    </div>
  );
}

const TREND_GLYPH: Record<string, string> = {
  improving: "▲",
  worsening: "▼",
  flat: "▬",
  unknown: "·",
};

function OutcomeRoiLine({ roi }: { roi: NonNullable<OutcomePanelWidget["data"][number]["roi"]> }) {
  if (!roi.metric_name) return null;
  const fmt = (n: number | null) => (n === null ? "—" : n);
  return (
    <div className="roi" data-confidence={roi.confidence} data-trend={roi.trend}>
      <span className="roi__metric muted">{roi.metric_name.replace(/_/g, " ")}</span>
      <span className="roi__nums">
        {fmt(roi.current)}
        {roi.target !== null && <span className="muted"> / {roi.target} target</span>}
      </span>
      <span className={`roi__trend roi__trend--${roi.trend}`} title={`trend: ${roi.trend}`}>
        {TREND_GLYPH[roi.trend]}
        {roi.previous !== null && roi.current !== null && roi.current !== roi.previous && (
          <span className="muted"> {roi.current > roi.previous ? "+" : ""}{Math.round((roi.current - roi.previous) * 10) / 10}</span>
        )}
      </span>
      <span className={`roi__conf roi__conf--${roi.confidence}`} title="estimation discipline (ROI §9)">
        {roi.confidence}
      </span>
    </div>
  );
}

function OutcomePanelBody({ w }: { w: OutcomePanelWidget }) {
  return (
    <div className="list">
      {w.data.map((row) => (
        <div key={row.outcome.id} className="orow">
          <div className="row">
            <span className="wrow__title">{row.outcome.name}</span>
            {typeof row.outcome.target_value === "number" && (
              <span className="muted widget__nums">
                {row.outcome.actual_value ?? 0} / {row.outcome.target_value}
              </span>
            )}
          </div>
          {row.progress !== undefined && (
            <div className="bar"><div className="bar__fill" style={{ width: `${Math.round(row.progress * 100)}%` }} /></div>
          )}
          {row.roi && <OutcomeRoiLine roi={row.roi} />}
          {row.outcome.value_category && <div className="item__sub">{row.outcome.value_category.replace(/_/g, " ")}</div>}
          <OutcomeActions id={row.outcome.id} actions={w.actions} valueCategory={row.outcome.value_category} />
        </div>
      ))}
    </div>
  );
}

const EXCEPTION_LABEL: Record<string, string> = {
  blocked: "Blocked",
  overdue: "Overdue",
  missing_evidence: "Missing evidence",
  stale_review: "Stale review",
};

function ExceptionPanelBody({ w, users }: { w: ExceptionPanelWidget; users: UserProfile[] }) {
  return (
    <div className="list">
      {w.data.map((ex, i) => (
        <div key={`${ex.work_item_id}_${ex.kind}_${i}`} className="wrow">
          <div className="wrow__main">
            <Link href={`/work/${ex.work_item_id}`} className="wrow__title">{ex.label}</Link>
          </div>
          <div className="wrow__side">
            <span className="chip chip--warn">{EXCEPTION_LABEL[ex.kind] ?? ex.kind}</span>
            <ExceptionActions workItemId={ex.work_item_id} kind={ex.kind} actions={w.actions} users={users} />
          </div>
        </div>
      ))}
    </div>
  );
}

function ReportListBody({ w }: { w: ReportListWidget }) {
  return (
    <div className="list">
      {w.data.map((r) => (
        <div key={r.id} className="wrow">
          <div className="wrow__main">
            <div className="wrow__title">{r.title ?? r.report_key}</div>
            <div className="item__sub">
              {r.sections.length} section{r.sections.length === 1 ? "" : "s"}
              {r.source_references?.length ? ` · ${r.source_references.length} sources` : ""} · {fmtTime(r.generated_at)}
            </div>
          </div>
          <div className="wrow__side">
            <span className="chip">{r.status ?? "generated"}</span>
            <ReportActions id={r.id} status={r.status} actions={w.actions} />
          </div>
        </div>
      ))}
    </div>
  );
}

/** The per-type switch. Exhaustive over the ResolvedWidget union. */
function WidgetBody({ widget, users }: { widget: ResolvedWidget; users: UserProfile[] }) {
  switch (widget.type) {
    case "metric_tile": return <MetricTileBody w={widget} />;
    case "metrics_panel": return <MetricsPanelBody w={widget} />;
    case "work_queue": return <WorkQueueBody w={widget} users={users} />;
    case "input_inbox": return <InputInboxBody w={widget} />;
    case "proposal_queue": return <ProposalQueueBody w={widget} />;
    case "approval_queue": return <ApprovalQueueBody w={widget} />;
    case "decision_trail": return <DecisionTrailBody w={widget} />;
    case "evidence_panel": return <EvidencePanelBody w={widget} />;
    case "outcome_panel": return <OutcomePanelBody w={widget} />;
    case "exception_panel": return <ExceptionPanelBody w={widget} users={users} />;
    case "report_list": return <ReportListBody w={widget} />;
  }
}

/** Widget-level toolbar (store-backed actions that act on the widget as a whole). */
function WidgetToolbar({ widget, workspaceId }: { widget: ResolvedWidget; workspaceId: string }) {
  if (widget.type === "report_list" && widget.actions.includes("generate")) {
    return <GenerateReportButton workspaceId={workspaceId} />;
  }
  return null;
}

export default function DashboardView({
  result,
  users = [],
}: {
  result: CompositionResult;
  users?: UserProfile[];
}) {
  const { widgets, skipped, workspaceId } = result;
  if (widgets.length === 0) {
    return <p className="muted">This dashboard has no renderable widgets.</p>;
  }
  return (
    <div className="dash">
      {widgets.map((widget) => {
        // Per-row actions (work_queue/proposal_queue) are rendered inside the
        // body next to each item; the footer reports only the still-unwired
        // declared actions so the declare→wire seam stays transparent.
        const unwired = unwiredActions(widget.type, widget.actions);
        return (
          <WidgetCard
            key={widget.id}
            widget={widget}
            toolbar={<WidgetToolbar widget={widget} workspaceId={workspaceId} />}
            footer={<UnwiredNote actions={unwired} />}
          >
            <WidgetBody widget={widget} users={users} />
          </WidgetCard>
        );
      })}
      {skipped.length > 0 && (
        <p className="muted widget__skipped">
          Skipped {skipped.length}: {skipped.map((s) => `${s.rawType} (${s.reason})`).join("; ")}
        </p>
      )}
    </div>
  );
}
