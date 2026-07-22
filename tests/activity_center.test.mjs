// tests/activity_center.test.mjs — the Terminal runtime notification + task center
// (Sprint IV Wave 3). A read-only projection over the live approval / work-item /
// evidence queues: notifications (gates owed / conflicts / reviews owed) each link out
// to the surface that resolves them; tasks are open (non-terminal) work. States distinct
// (pending_approval / conflicted / stale / current); never decides; deterministic.
import { test } from "node:test";
import assert from "node:assert/strict";
import { register } from "node:module";
register("../scripts/alias-hook.mjs", import.meta.url);

const ac = await import("@/app/_surfaces/activity_center");
const AS_OF = "2026-07-22T00:00:00.000Z";

const approvals = [
  { id: "a_alloc", workspace_id: "ws1", approval_type: "capital_allocation", status: "requested", requested_by: "user:ops", created_at: "2026-06-10T00:00:00.000Z" },
  { id: "a_share", workspace_id: "ws1", approval_type: "report_sharing", status: "requested", requested_by: "user:ops", created_at: "2026-06-12T00:00:00.000Z", metadata: { report_id: "r1" } },
  { id: "a_promo", workspace_id: "ws1", approval_type: "proposal_promotion", status: "requested", requested_by: "user:ops", created_at: "2026-06-11T00:00:00.000Z" }, // negative control: requested but NOT regulated
  { id: "a_done", workspace_id: "ws1", approval_type: "proposal_promotion", status: "approved", approved_by: "user:ceo", created_at: "2026-04-01T00:00:00.000Z" },
];
const items = [
  { id: "wi1", workspace_id: "ws1", kind: "k:pilot", title: "Halcyon pilot", status: "in_progress", priority: "high", source: "manual", entity_id: null, assignee_id: "u1", assignee_name: "Ops", context: {}, created_at: "2026-06-01T00:00:00.000Z", started_at: null, completed_at: null },
  { id: "wi2", workspace_id: "ws1", kind: "k:pilot", title: "Aurora pilot", status: "blocked", priority: "medium", source: "manual", entity_id: null, assignee_id: null, assignee_name: null, context: {}, created_at: "2026-06-02T00:00:00.000Z", started_at: null, completed_at: null },
  { id: "wi3", workspace_id: "ws1", kind: "k:dil", title: "Cobalt diligence", status: "awaiting_review", priority: "high", source: "manual", entity_id: null, assignee_id: null, assignee_name: null, context: {}, created_at: "2026-06-03T00:00:00.000Z", started_at: null, completed_at: null },
  { id: "wi4", workspace_id: "ws1", kind: "k:pilot", title: "Done pilot", status: "completed", priority: "low", source: "manual", entity_id: null, assignee_id: null, assignee_name: null, context: {}, created_at: "2026-06-04T00:00:00.000Z", started_at: null, completed_at: "2026-06-20T00:00:00.000Z" },
];
const evidence = [
  { id: "e_old", work_item_id: "wi1", label: "Delinquency flag", captured_by: "agent:run", created_at: "2026-02-15T00:00:00.000Z", review_status: undefined, workspace_id: "ws1", work_item_title: "Halcyon pilot" },
  { id: "e_fresh", work_item_id: "wi1", label: "Recent note", captured_by: "user:ops", created_at: "2026-07-15T00:00:00.000Z", review_status: "pending", workspace_id: "ws1", work_item_title: "Halcyon pilot" }, // negative control: pending but NOT stale (fresh)
  { id: "e_ok", work_item_id: "wi1", label: "SOC2", captured_by: "user:ops", created_at: "2026-06-01T00:00:00.000Z", review_status: "approved", workspace_id: "ws1", work_item_title: "Halcyon pilot" },
];
const vm = ac.buildActivityCenter({ approvals, workItems: items, evidence, workspaceLabels: { ws1: "Demo WS" } }, { as_of: AS_OF });

test("notifications over the live queues: gates owed + conflicts + reviews owed", () => {
  assert.equal(vm.counts.notifications, 6);
  assert.equal(vm.counts.gatesOwed, 3);
  assert.equal(vm.counts.conflicts, 1);
  assert.equal(vm.counts.reviewsOwed, 2);
  assert.ok(vm.notifications.every((n) => ["/approvals", "/workflows", "/evidence"].includes(n.href)));
});

test("read-only: a decided approval owes nothing; a requested one stays pending", () => {
  assert.ok(!vm.notifications.some((n) => n.id.includes("a_done")));
  const alloc = vm.notifications.find((n) => n.id.includes("a_alloc"));
  assert.deepEqual(alloc.states, ["pending_approval"]);
});

test("restricted discriminates: regulated approvals restricted, a routine one is NOT", () => {
  assert.equal(vm.counts.restricted, 2); // capital_allocation + report_sharing
  const promo = vm.notifications.find((n) => n.id.includes("a_promo"));
  assert.ok(promo && promo.restricted === false); // negative control: proposal_promotion is routine
  assert.ok(vm.notifications.find((n) => n.id.includes("a_alloc")).restricted === true);
});

test("staleness depends on age: an aged review is stale, a fresh one is not", () => {
  assert.equal(vm.counts.stale, 1);
  const oldReview = vm.notifications.find((n) => n.id.includes("e_old"));
  const freshReview = vm.notifications.find((n) => n.id.includes("e_fresh"));
  assert.ok(oldReview.states.includes("pending_approval") && oldReview.states.includes("stale"));
  assert.ok(freshReview.states.includes("pending_approval") && !freshReview.states.includes("stale")); // negative control
});

test("states distinct: conflicted never current", () => {
  const conflict = vm.notifications.find((n) => n.kind === "conflict");
  assert.ok(conflict.states.includes("conflicted") && !conflict.states.includes("current"));
});

test("task center: open work only; awaiting_* owes a gate; teeth on taskStates", () => {
  assert.equal(vm.counts.tasks, 3);
  assert.ok(!vm.tasks.some((t) => t.id === "wi4")); // completed is terminal
  assert.equal(vm.counts.tasksAwaitingGate, 1);
  assert.ok(vm.tasks.find((t) => t.id === "wi3").awaitingGate);
  assert.deepEqual(ac.taskStates("completed"), ["current"]);
  assert.ok(ac.taskStates("blocked").includes("conflicted") && !ac.taskStates("blocked").includes("current"));
  assert.ok(vm.tasks[0].states.some((s) => s === "pending_approval" || s === "conflicted"));
});

test("deterministic", () => {
  const vm2 = ac.buildActivityCenter({ approvals, workItems: items, evidence, workspaceLabels: { ws1: "Demo WS" } }, { as_of: AS_OF });
  assert.equal(JSON.stringify(vm), JSON.stringify(vm2));
});
