// tests/workflows_view.test.mjs — the /workflows surface (Sprint IV Wave 2).
// Live work items grouped by workflow, joined to the cartridge definition, with the human
// gate each owes. States distinct (pending_approval / conflicted / current); an unmapped
// kind is flagged; the builder never decides a gate; deterministic.
import { test } from "node:test";
import assert from "node:assert/strict";
import { register } from "node:module";
register("../scripts/alias-hook.mjs", import.meta.url);

const wf = await import("@/app/_surfaces/workflows_view");
const AS_OF = "2026-07-22T00:00:00.000Z";

const items = [
  { id: "wi1", workspace_id: "ws1", kind: "cooperative_markets:pilot_management", title: "Halcyon pilot", status: "in_progress", priority: "high", source: "manual", entity_id: null, assignee_id: "u1", assignee_name: "Ops", context: {}, created_at: "2026-06-01T00:00:00.000Z", started_at: null, completed_at: null },
  { id: "wi2", workspace_id: "ws1", kind: "cooperative_markets:diligence", title: "Cobalt diligence", status: "awaiting_review", priority: "high", source: "manual", entity_id: null, assignee_id: null, assignee_name: null, context: {}, created_at: "2026-06-02T00:00:00.000Z", started_at: null, completed_at: null },
  { id: "wi3", workspace_id: "ws1", kind: "cooperative_markets:pilot_management", title: "Aurora pilot", status: "blocked", priority: "medium", source: "manual", entity_id: null, assignee_id: null, assignee_name: null, context: {}, created_at: "2026-06-03T00:00:00.000Z", started_at: null, completed_at: null },
  { id: "wi4", workspace_id: "ws1", kind: "unknown:mystery", title: "Orphan task", status: "open", priority: "low", source: "manual", entity_id: null, assignee_id: null, assignee_name: null, context: {}, created_at: "2026-06-04T00:00:00.000Z", started_at: null, completed_at: null },
];
const defs = [
  { kind: "cooperative_markets:pilot_management", label: "Pilot Management", description: "run a pilot", defaultOwnerRole: "operator", defaultPriority: "high", approvalRequired: false },
  { kind: "cooperative_markets:diligence", label: "Investment Diligence", description: "diligence", defaultOwnerRole: "reviewer", defaultPriority: "high", approvalRequired: true },
];
const approvals = [
  { id: "appr1", workspace_id: "ws1", approval_type: "capital_allocation", status: "requested", related_work_item_id: "wi1", created_at: "2026-06-05T00:00:00.000Z" },
];
const checklist = { wi1: { done: 2, total: 5 } };
const vm = wf.buildWorkflowsView({ items, defs, approvals, checklist, workspaceLabels: { ws1: "Demo WS" } }, { as_of: AS_OF });

test("grouped by workflow, joined to the cartridge definition", () => {
  assert.equal(vm.counts.workflows, 3);
  assert.equal(vm.counts.items, 4);
  const pilot = vm.groups.find((g) => g.kind === "cooperative_markets:pilot_management");
  const dil = vm.groups.find((g) => g.kind === "cooperative_markets:diligence");
  assert.equal(pilot.label, "Pilot Management");
  assert.equal(dil.approvalRequired, true);
});

test("an unmapped kind is flagged, never mis-attached", () => {
  const orphan = vm.groups.find((g) => g.kind === "unknown:mystery");
  assert.equal(orphan.unmapped, true);
  assert.equal(orphan.label, "unknown:mystery");
});

test("states distinct: pending_approval (gate) / conflicted (blocked) / current", () => {
  const pilot = vm.groups.find((g) => g.kind === "cooperative_markets:pilot_management");
  const dil = vm.groups.find((g) => g.kind === "cooperative_markets:diligence");
  const wi1 = pilot.items.find((r) => r.id === "wi1");
  const wi2 = dil.items.find((r) => r.id === "wi2");
  const wi3 = pilot.items.find((r) => r.id === "wi3");
  assert.equal(wi1.pendingApproval, true);
  assert.equal(wi1.linkedApprovalId, "appr1");
  assert.ok(wi1.states.includes("pending_approval"));
  assert.ok(wi2.states.includes("pending_approval"));
  assert.ok(wi3.states.includes("conflicted") && !wi3.states.includes("current"));
  assert.ok(wf.workItemStates("completed", false).includes("current"));
  assert.ok(!wf.workItemStates("blocked", false).includes("current"));
});

test("never auto-decides; owed gates are surfaced", () => {
  assert.equal(vm.counts.pendingApprovals, 1);
  assert.ok(vm.counts.awaiting >= 2);
});

test("attention items sort to the top; deterministic", () => {
  const pilot = vm.groups.find((g) => g.kind === "cooperative_markets:pilot_management");
  assert.ok(pilot.items[0].states.some((s) => s === "pending_approval" || s === "conflicted"));
  const vm2 = wf.buildWorkflowsView({ items, defs, approvals, checklist, workspaceLabels: { ws1: "Demo WS" } }, { as_of: AS_OF });
  assert.equal(JSON.stringify(vm), JSON.stringify(vm2));
});
