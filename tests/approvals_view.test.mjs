// tests/approvals_view.test.mjs — the APPROVALS surface builder (Sprint IV Wave 1).
// Projects the LIVE approval objects into AWAITING vs DECIDED with lineage + the
// doctrine states (pending_approval / restricted / current). The builder NEVER
// decides — it is a pure projection; the real gate is the permission-engine
// contract behind the server action. Deterministic.
import { test } from "node:test";
import assert from "node:assert/strict";
import { register } from "node:module";
register("../scripts/alias-hook.mjs", import.meta.url);

const {
  buildApprovalsView,
  isRestrictedApprovalType,
  isRestrictedApproval,
  persistedRestricted,
  approvalStates,
} = await import("@/app/_surfaces/approvals_view");

const AS_OF = "2026-07-22T00:00:00.000Z";

const fixture = () => [
  { id: "a_pending", workspace_id: "ws1", approval_type: "capital_allocation", status: "requested",
    requested_by: "user:ops", related_work_item_id: "wi_1", related_decision_id: "dec_1", created_at: "2026-06-01T00:00:00.000Z", updated_at: "2026-06-01T00:00:00.000Z" },
  { id: "a_share", workspace_id: "ws1", approval_type: "report_sharing", status: "requested",
    requested_by: "user:ops", created_at: "2026-05-01T00:00:00.000Z", updated_at: "2026-05-01T00:00:00.000Z" },
  { id: "a_done", workspace_id: "ws1", approval_type: "proposal_promotion", status: "approved",
    approved_by: "user:ceo", related_work_item_id: "wi_1", approval_notes: "green-light", created_at: "2026-04-01T00:00:00.000Z", updated_at: "2026-04-02T00:00:00.000Z" },
];

test("buckets AWAITING vs DECIDED; awaiting never includes a decided approval", () => {
  const vm = buildApprovalsView(fixture(), { workspaceLabels: { ws1: "Demo WS" }, as_of: AS_OF });
  assert.equal(vm.counts.awaiting, 2);
  assert.equal(vm.counts.decided, 1);
  // independent of the bucket derivation: NO decided row is a still-requested approval
  // (an auto-approve mutation that flipped a requested → decided would surface here).
  assert.ok(vm.decided.every((r) => r.status !== "requested"), "no decided row is a still-requested approval");
  assert.ok(vm.awaiting.every((r) => r.status === "requested"), "every awaiting row is a requested approval");
  assert.equal(vm.awaiting.length + vm.decided.length, vm.counts.total, "every approval lands in exactly one bucket");
});

test("the builder NEVER decides — a pending approval stays pending in the projection", () => {
  const input = fixture();
  const vm = buildApprovalsView(input, { as_of: AS_OF });
  const pending = vm.awaiting.find((r) => r.id === "a_pending");
  assert.equal(pending.status, "requested", "projection does not flip a pending approval to approved");
  // teeth: the builder does not mutate the input objects
  assert.equal(input.find((a) => a.id === "a_pending").status, "requested");
});

test("regulated/high-risk types are RESTRICTED (owner/admin-only)", () => {
  assert.equal(isRestrictedApprovalType("capital_allocation"), true);
  assert.equal(isRestrictedApprovalType("report_sharing"), true);
  assert.equal(isRestrictedApprovalType("lending_decision"), true);
  assert.equal(isRestrictedApprovalType("proposal_promotion"), false);
  const vm = buildApprovalsView(fixture(), { as_of: AS_OF });
  assert.equal(vm.counts.restrictedAwaiting, 2, "both awaiting (capital + share) are restricted");
});

test("a PERSISTED classification supersedes the keyword heuristic (never silently under-flagged)", () => {
  // A regulated type the default markers do NOT catch, but carrying a persisted flag.
  const a = { id: "x", workspace_id: "ws1", approval_type: "board_ratification", status: "requested", metadata: { restricted: true }, created_at: "2026-06-01T00:00:00.000Z" };
  assert.equal(isRestrictedApprovalType("board_ratification"), false, "the keyword heuristic alone would miss it");
  assert.equal(persistedRestricted(a), true, "the persisted flag is honored");
  assert.equal(isRestrictedApproval(a), true, "a persisted classification supersedes the heuristic");
  const b = { ...a, metadata: { risk_class: "high" } };
  assert.equal(isRestrictedApproval(b), true, "a persisted risk_class also marks restricted");
});

test("the restricted keyword set is INJECTED config (generic builder names no vertical in its body)", () => {
  // With an empty injected marker set + no persisted flag, a financial type is NOT restricted.
  assert.equal(isRestrictedApprovalType("capital_allocation", []), false, "no markers → no keyword match");
  const approvals = [{ id: "c", workspace_id: "ws1", approval_type: "capital_allocation", status: "requested", created_at: "2026-06-01T00:00:00.000Z" }];
  assert.equal(buildApprovalsView(approvals, { as_of: AS_OF, restrictedMarkers: [] }).counts.restrictedAwaiting, 0, "an empty injected marker set flags nothing by keyword");
  assert.equal(buildApprovalsView(approvals, { as_of: AS_OF, restrictedMarkers: ["capital"] }).counts.restrictedAwaiting, 1, "the caller-injected marker set drives the label");
});

test("doctrine states render distinctly: pending_approval vs current, restricted flagged", () => {
  const s1 = approvalStates({ approval_type: "capital_allocation", status: "requested" });
  assert.ok(s1.includes("pending_approval") && s1.includes("restricted") && !s1.includes("current"));
  const s2 = approvalStates({ approval_type: "proposal_promotion", status: "approved" });
  assert.ok(s2.includes("current") && !s2.includes("pending_approval") && !s2.includes("restricted"));
});

test("lineage is carried (only present refs) for the drill-through", () => {
  const vm = buildApprovalsView(fixture(), { as_of: AS_OF });
  const p = vm.awaiting.find((r) => r.id === "a_pending");
  assert.deepEqual(p.lineage, { work_item_id: "wi_1", decision_id: "dec_1" }, "only the present refs are included");
  assert.equal(p.hasLineage, true);
  const share = vm.awaiting.find((r) => r.id === "a_share");
  assert.equal(share.hasLineage, false, "an approval with no linked object reports no lineage (never fabricated)");
});

test("DETERMINISTIC + ordered: awaiting oldest-first, decided newest-first, identical VM on repeat", () => {
  const vm1 = buildApprovalsView(fixture(), { as_of: AS_OF });
  const vm2 = buildApprovalsView(fixture(), { as_of: AS_OF });
  assert.equal(JSON.stringify(vm1), JSON.stringify(vm2), "same input → identical VM");
  assert.deepEqual(vm1.awaiting.map((r) => r.id), ["a_share", "a_pending"], "awaiting is oldest-first by created_at");
});
