// core/widgets/index.ts
//
// The widget system: the generic, cartridge-blind seam between the DataStore
// and the eventual UI (WIDGET_SYSTEM_RULES.md). The UI composes a workspace's
// dashboard into ResolvedWidget[] and renders each by `type` — meaning attaches
// only through configuration (widget_config entries, metric_name, filters,
// labels). No React/CSS lives here; this is the data + contract layer.
//
//   const result = composeForWorkspace({ store, workspaceId, role });
//   result.widgets.forEach(renderByType);   // <- the later UI session

export * from "@/core/widgets/types";
export {
  WIDGET_DEFINITIONS,
  resolveWidgetType,
  normalizeSpec,
  defaultDashboardSpecs,
  type WidgetDefinition,
  type RawWidgetEntry,
} from "@/core/widgets/registry";
export { workItemFilter } from "@/core/widgets/resolve";
export { composeDashboard, composeForWorkspace } from "@/core/widgets/compose";
