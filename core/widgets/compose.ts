// core/widgets/compose.ts
//
// Composition: turn a Dashboard's `widget_config` (or the default layout) into
// resolved, UI-ready widgets. "A dashboard is not a custom page; it is a
// configured set of widgets" (WIDGET_SYSTEM_RULES §7). This is the entry point
// the eventual UI calls — it hands back a CompositionResult the renderer maps
// over, with nothing silently dropped (unsupported/role-gated entries are
// reported in `skipped`).

import type { Dashboard, RoleKey } from "@/core/types";
import {
  WIDGET_DEFINITIONS,
  defaultDashboardSpecs,
  normalizeSpec,
  type RawWidgetEntry,
} from "@/core/widgets/registry";
import {
  resolveApprovalQueue,
  resolveDecisionTrail,
  resolveEvidencePanel,
  resolveExceptionPanel,
  resolveInputInbox,
  resolveMetricTile,
  resolveMetricsPanel,
  resolveOutcomePanel,
  resolveProposalQueue,
  resolveReportList,
  resolveWorkQueue,
} from "@/core/widgets/resolve";
import type {
  CompositionResult,
  ResolvedWidget,
  SkippedWidget,
  WidgetContext,
  WidgetSpec,
} from "@/core/widgets/types";

/** Is this widget visible to the viewer role? Empty allowlist = visible to all. */
function canView(spec: WidgetSpec, role?: RoleKey): boolean {
  if (!spec.visibleTo || spec.visibleTo.length === 0) return true;
  if (!role) return true; // no role context -> do not gate
  return spec.visibleTo.includes(role);
}

/** Resolve one normalized spec into a fully-typed ResolvedWidget. */
function resolveWidget(ctx: WidgetContext, spec: WidgetSpec, id: string): ResolvedWidget {
  const def = WIDGET_DEFINITIONS[spec.type];
  const base = {
    id,
    loopStage: def.loopStage,
    title: spec.title ?? def.defaultTitle,
    spec,
    actions: spec.actions ?? def.defaultActions,
  };

  switch (spec.type) {
    case "metric_tile": {
      const r = resolveMetricTile(ctx, spec.metricName, spec.title);
      return { ...base, type: "metric_tile", state: r.state, emptyMessage: r.emptyMessage, data: r.data };
    }
    case "metrics_panel": {
      const r = resolveMetricsPanel(ctx);
      return { ...base, type: "metrics_panel", state: r.state, emptyMessage: r.emptyMessage, data: r.data };
    }
    case "work_queue": {
      const r = resolveWorkQueue(ctx, spec.filter);
      return { ...base, type: "work_queue", state: r.state, emptyMessage: r.emptyMessage, data: r.data };
    }
    case "input_inbox": {
      const r = resolveInputInbox(ctx);
      return { ...base, type: "input_inbox", state: r.state, emptyMessage: r.emptyMessage, data: r.data };
    }
    case "proposal_queue": {
      const r = resolveProposalQueue(ctx);
      return { ...base, type: "proposal_queue", state: r.state, emptyMessage: r.emptyMessage, data: r.data };
    }
    case "approval_queue": {
      const r = resolveApprovalQueue(ctx);
      return { ...base, type: "approval_queue", state: r.state, emptyMessage: r.emptyMessage, data: r.data };
    }
    case "decision_trail": {
      const r = resolveDecisionTrail(ctx);
      return { ...base, type: "decision_trail", state: r.state, emptyMessage: r.emptyMessage, data: r.data };
    }
    case "evidence_panel": {
      const r = resolveEvidencePanel(ctx);
      return { ...base, type: "evidence_panel", state: r.state, emptyMessage: r.emptyMessage, data: r.data };
    }
    case "outcome_panel": {
      const r = resolveOutcomePanel(ctx);
      return { ...base, type: "outcome_panel", state: r.state, emptyMessage: r.emptyMessage, data: r.data };
    }
    case "exception_panel": {
      const r = resolveExceptionPanel(ctx);
      return { ...base, type: "exception_panel", state: r.state, emptyMessage: r.emptyMessage, data: r.data };
    }
    case "report_list": {
      const r = resolveReportList(ctx);
      return { ...base, type: "report_list", state: r.state, emptyMessage: r.emptyMessage, data: r.data };
    }
  }
}

/** Shared core: normalize + gate + resolve a list of raw entries. */
function composeFromEntries(
  ctx: WidgetContext,
  entries: RawWidgetEntry[],
  idPrefix: string,
): { widgets: ResolvedWidget[]; skipped: SkippedWidget[] } {
  const widgets: ResolvedWidget[] = [];
  const skipped: SkippedWidget[] = [];

  entries.forEach((entry, i) => {
    const spec = normalizeSpec(entry);
    if (!spec) {
      skipped.push({ rawType: String(entry.type ?? "(missing)"), reason: "unsupported widget type" });
      return;
    }
    if (!canView(spec, ctx.role)) {
      skipped.push({ rawType: spec.rawType, reason: `not visible to role "${ctx.role}"` });
      return;
    }
    widgets.push(resolveWidget(ctx, spec, `${idPrefix}_${i}_${spec.type}`));
  });

  return { widgets, skipped };
}

/**
 * Compose a specific dashboard. When `dashboard` is omitted or carries no
 * `widget_config`, the cartridge-blind default layout is used so a workspace is
 * always legible (registry.defaultDashboardSpecs).
 */
export function composeDashboard(ctx: WidgetContext, dashboard?: Dashboard): CompositionResult {
  const authored = dashboard?.widget_config;
  if (authored && authored.length > 0) {
    const { widgets, skipped } = composeFromEntries(ctx, authored as RawWidgetEntry[], dashboard!.id);
    return { workspaceId: ctx.workspaceId, dashboardId: dashboard!.id, dashboardName: dashboard!.name, widgets, skipped };
  }

  // Default layout: role-tuned when a viewer role is known, else comprehensive.
  // Feed the pre-normalized specs back through the same compose path.
  const defaults = defaultDashboardSpecs(ctx.role).map((s) => (s.raw ?? { type: s.rawType }) as RawWidgetEntry);
  const { widgets, skipped } = composeFromEntries(ctx, defaults, "default");
  return {
    workspaceId: ctx.workspaceId,
    dashboardId: dashboard?.id,
    dashboardName: dashboard?.name ?? (ctx.role ? `${ctx.role} overview` : "Operating overview"),
    widgets,
    skipped,
  };
}

/**
 * Compose the workspace's primary dashboard: the first ACTIVE dashboard that
 * authors a `widget_config`, else the default layout. This is the convenience
 * the UI will call for a workspace landing view.
 */
export function composeForWorkspace(ctx: WidgetContext): CompositionResult {
  const dashboards = ctx.store.listDashboards(ctx.workspaceId);
  const primary =
    dashboards.find((d) => d.status === "active" && (d.widget_config?.length ?? 0) > 0) ??
    dashboards.find((d) => (d.widget_config?.length ?? 0) > 0);
  return composeDashboard(ctx, primary);
}
