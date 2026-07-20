// scripts/widgets-demo.ts
//
// Headless verification of the widget system layer (core/widgets) on the
// in-memory store — no UI. Proves the composition seam the eventual UI binds
// to: a Dashboard's `widget_config` -> ResolvedWidget[] driven entirely by
// configuration, cartridge-blind, with role gating and honest skip-reporting.
//
// Run:  npx --yes tsx scripts/widgets-demo.ts
// Exits non-zero if any invariant fails, so it doubles as a smoke test.

import { store } from "@/core/data";
import { composeForWorkspace, composeDashboard } from "@/core/widgets";
import type { Dashboard } from "@/core/types";
import type { MetricTileData, MetricsPanelWidget, WorkQueueWidget } from "@/core/widgets";

let failures = 0;
function check(label: string, cond: boolean) {
  console.log(`${cond ? "  ok  " : " FAIL "} ${label}`);
  if (!cond) failures++;
}
const h = (s: string) => console.log(`\n=== ${s} ===`);

const ws = store.listWorkspaces().find((w) => w.cartridge_key === "wealth");
if (!ws) { console.error("wealth workspace missing"); process.exit(1); }
const wsId = ws.id;
const ctx = { store, workspaceId: wsId, packageKey: ws.cartridge_key, role: "owner" as const };

// ---------------------------------------------------------------------------
h("Compose the seeded wealth dashboard (widget_config-driven)");
const composed = composeForWorkspace(ctx);
console.log(`dashboard "${composed.dashboardName}" -> ${composed.widgets.length} widgets, ${composed.skipped.length} skipped`);
for (const w of composed.widgets) console.log(`  - ${w.type} [${w.loopStage}] "${w.title}" (${w.state})`);

check("Resolved the seeded dashboard, not the default", composed.dashboardName === "Acquisition Readiness");
check("All seeded entries resolved (none skipped)", composed.skipped.length === 0);
check("Seeded widget_config produced 4 widgets", composed.widgets.length === 4);

const tiles = composed.widgets.filter((w) => w.type === "metric_tile");
check("Three metric tiles (alias 'metric' -> metric_tile)", tiles.length === 3);
const completion = tiles.find((t) => t.type === "metric_tile" && t.data?.metric_name === "work_completion_rate");
check("Completion tile resolved with a real value", completion?.type === "metric_tile" && completion.data !== null);
check(
  "Tiles carry auditable basis (not vanity numbers)",
  tiles.every((t) => t.type === "metric_tile" && (t.data === null || t.data.basis !== undefined)),
);

const listWidget = composed.widgets.find((w) => w.type === "work_queue") as WorkQueueWidget | undefined;
check("Alias 'list' -> work_queue", !!listWidget);
check(
  "work_queue filter 'status!=completed' applied",
  !!listWidget && listWidget.data.every((wi) => wi.status !== "completed"),
);

// ---------------------------------------------------------------------------
h("Comprehensive default layout (no role, no authored widget_config)");
const noRoleCtx = { store, workspaceId: wsId, packageKey: ws.cartridge_key };
const def = composeDashboard(noRoleCtx, undefined);
console.log(`default -> ${def.widgets.length} widgets`);
for (const w of def.widgets) console.log(`  - ${w.type} [${w.loopStage}] (${w.state})`);
const panel = def.widgets.find((w) => w.type === "metrics_panel") as MetricsPanelWidget | undefined;
check("Default includes a metrics_panel", !!panel);
check("metrics_panel resolved the universal family", !!panel && panel.data.length >= 5);

// Every one of the 11 widget types is exercised by the comprehensive default.
const ALL_TYPES = [
  "metric_tile", "metrics_panel", "work_queue", "input_inbox", "proposal_queue",
  "approval_queue", "decision_trail", "evidence_panel", "outcome_panel",
  "exception_panel", "report_list",
];
const presentTypes = new Set(def.widgets.map((w) => w.type));
check("Comprehensive default exercises all 11 widget types", ALL_TYPES.every((t) => presentTypes.has(t as typeof def.widgets[number]["type"])));
check("Default covers input + decision + action + value + evidence stages", (() => {
  const stages = new Set(def.widgets.map((w) => w.loopStage));
  return ["input", "decision", "action", "value", "evidence"].every((s) => stages.has(s as typeof def.widgets[number]["loopStage"]));
})());

// Targets surface where a cartridge MetricDefinition matched by type.
const withTarget = (panel?.data ?? []).filter((t: MetricTileData) => t.target !== undefined);
console.log(`tiles carrying a target: ${withTarget.length}`);
check("At least one tile carries a config-supplied target", withTarget.length >= 1);

// ---------------------------------------------------------------------------
h("Role-tuned default layouts (§8 — same widgets, composed per role)");
const opLayout = composeDashboard({ ...noRoleCtx, role: "operator" }, undefined);
const ownerLayout = composeDashboard({ ...noRoleCtx, role: "owner" }, undefined);
const opTypes = new Set(opLayout.widgets.map((w) => w.type));
const ownerTypes = new Set(ownerLayout.widgets.map((w) => w.type));
console.log(`operator: [${[...opTypes].join(", ")}]`);
console.log(`owner:    [${[...ownerTypes].join(", ")}]`);
check("Operator layout is the execution cockpit (input + work)", opTypes.has("input_inbox") && opTypes.has("work_queue"));
check("Owner layout is value-oriented (outcomes + reports)", ownerTypes.has("outcome_panel") && ownerTypes.has("report_list"));
check("Operator and owner layouts differ", JSON.stringify([...opTypes]) !== JSON.stringify([...ownerTypes]));

// ---------------------------------------------------------------------------
h("Role gating + unsupported-type reporting");
const synthetic: Dashboard = {
  id: "dash_synthetic", workspace_id: wsId, name: "Synthetic", status: "active",
  widget_config: [
    { type: "metric_tile", metric_name: "work_completion_rate", visibleTo: ["owner"] },
    { type: "metric_tile", metric_name: "evidence_coverage", visibleTo: ["admin"] },
    { type: "crystal_ball" },
  ],
  created_at: new Date().toISOString(),
};
const gated = composeDashboard(ctx, synthetic);
console.log(`gated -> ${gated.widgets.length} widgets, skipped: ${JSON.stringify(gated.skipped)}`);
check("Owner-only widget is visible to owner", gated.widgets.length === 1);
check("Admin-only widget gated out for owner", gated.skipped.some((s) => s.reason.includes('role "owner"')));
check("Unsupported type recorded, not crashed", gated.skipped.some((s) => s.rawType === "crystal_ball"));

// ---------------------------------------------------------------------------
h("Exception dismissal filters the composed exception_panel (session 6)");
// Force an exception (block an active item), confirm it surfaces, then dismiss
// it and confirm the composed panel drops it — the dismissal is store-backed.
const target = store.listWorkItems(wsId).find((w) => w.status === "open" || w.status === "in_progress")!;
store.setStatus(target.id, "blocked", "user:u_owner");
const ownerDefault = () => composeDashboard({ ...noRoleCtx, role: "owner" as const }, undefined);
const exPanelOf = (r: ReturnType<typeof ownerDefault>) =>
  r.widgets.find((w) => w.type === "exception_panel");
const before = exPanelOf(ownerDefault());
const hasBlocked = (w: typeof before) =>
  !!w && w.type === "exception_panel" && w.data.some((ex) => ex.work_item_id === target.id && ex.kind === "blocked");
check("Blocked work item surfaces as an exception", hasBlocked(before));
store.dismissException(target.id, "blocked", "user:u_owner");
check("Dismissed exception is filtered from the composed panel", !hasBlocked(exPanelOf(ownerDefault())));

// ---------------------------------------------------------------------------
h("Wired widget actions are declared on the resolved widgets");
const compForActions = composeDashboard(noRoleCtx, undefined); // comprehensive layout = all 11 types
const reportWidget = compForActions.widgets.find((w) => w.type === "report_list");
const outcomeWidget = compForActions.widgets.find((w) => w.type === "outcome_panel");
const approvalWidget = compForActions.widgets.find((w) => w.type === "approval_queue");
check("report_list declares share/export/archive", !!reportWidget && ["share", "export", "archive"].every((a) => reportWidget.actions.includes(a)));
check("outcome_panel declares assign_value_category/estimate_impact", !!outcomeWidget && ["assign_value_category", "estimate_impact"].every((a) => outcomeWidget.actions.includes(a)));
check("approval_queue declares approve/reject/request_changes", !!approvalWidget && ["approve", "reject", "request_changes"].every((a) => approvalWidget.actions.includes(a)));

// ---------------------------------------------------------------------------
h("Generality: hospitality composes on the same engine");
const hosp = store.listWorkspaces().find((w) => w.cartridge_key === "hospitality");
if (hosp) {
  const hctx = { store, workspaceId: hosp.id, packageKey: hosp.cartridge_key, role: "owner" as const };
  const hc = composeForWorkspace(hctx);
  console.log(`hospitality -> "${hc.dashboardName}" ${hc.widgets.length} widgets, ${hc.skipped.length} skipped`);
  check("Hospitality composes without skips", hc.skipped.length === 0);
  check("Hospitality produced widgets", hc.widgets.length >= 1);
} else {
  console.log("  (no hospitality workspace seeded — skipping generality check)");
}

// ---------------------------------------------------------------------------
console.log(`\n${failures === 0 ? "ALL CHECKS PASSED" : `${failures} CHECK(S) FAILED`}`);
process.exit(failures === 0 ? 0 : 1);
