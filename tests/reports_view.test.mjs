// tests/reports_view.test.mjs — the /reports surface (Sprint IV Wave 3).
// Live report objects joined to the report_sharing editorial gate. States distinct
// (current / pending_approval / stale / restricted); a decided share approval never
// re-opens the gate; the builder never shares; deterministic.
import { test } from "node:test";
import assert from "node:assert/strict";
import { register } from "node:module";
register("../scripts/alias-hook.mjs", import.meta.url);

const rv = await import("@/app/_surfaces/reports_view");
const AS_OF = "2026-07-22T00:00:00.000Z";

const reports = [
  { id: "r_shared", workspace_id: "ws1", report_key: "k:scorecard", title: "Scorecard", generated_at: "2026-07-20T00:00:00.000Z", status: "shared", generated_by: "user:ops", source_references: ["e1", "e2"], sections: [{ heading: "H", body: "B" }] },
  { id: "r_review", workspace_id: "ws1", report_key: "k:brief", title: "Brief", generated_at: "2026-07-20T00:00:00.000Z", status: "under_review", generated_by: "user:ops", source_references: ["e1"], sections: [{ heading: "H", body: "B" }] },
  { id: "r_old", workspace_id: "ws1", report_key: "k:memo", title: "Memo", generated_at: "2026-03-01T00:00:00.000Z", status: "generated", generated_by: "agent:run", source_references: ["e2"], missing_data_notes: ["audited financials pending"], sections: [{ heading: "H", body: "B" }] },
  { id: "r_aged", workspace_id: "ws1", report_key: "k:memo", title: "Aged approved", generated_at: "2026-01-10T00:00:00.000Z", status: "approved", generated_by: "user:ops", source_references: ["e2"], sections: [{ heading: "H", body: "B" }] }, // negative control: stale by AGE alone, no gaps
  { id: "r_draft", workspace_id: "ws1", report_key: "k:scorecard", title: "Draft", generated_at: "2026-07-20T00:00:00.000Z", status: "draft", generated_by: "user:ops", sections: [{ heading: "H", body: "B" }] },
];
const approvals = [
  { id: "appr_share", workspace_id: "ws1", approval_type: "report_sharing", status: "requested", requested_by: "user:ops", metadata: { report_id: "r_review", report_key: "k:brief" }, created_at: "2026-07-20T00:00:00.000Z" },
  { id: "appr_done", workspace_id: "ws1", approval_type: "report_sharing", status: "approved", metadata: { report_id: "r_shared" }, created_at: "2026-07-19T00:00:00.000Z" },
];
const vm = rv.buildReportsView({ reports, approvals, workspaceLabels: { ws1: "Demo WS" } }, { as_of: AS_OF });

test("renders live report objects with lineage", () => {
  assert.equal(vm.counts.total, 5);
  assert.equal(vm.rows.find((r) => r.id === "r_shared").sourceRefCount, 2);
});

test("editorial gate distinct: under_review + requested share approval owes it", () => {
  const rev = vm.rows.find((r) => r.id === "r_review");
  assert.ok(rev.pendingShare);
  assert.equal(rev.linkedShareApprovalId, "appr_share");
  assert.ok(rev.states.includes("pending_approval"));
  assert.equal(vm.counts.pendingApproval, 1);
});

test("never auto-shares: a decided share approval never re-opens the gate", () => {
  const shared = vm.rows.find((r) => r.id === "r_shared");
  assert.equal(shared.pendingShare, false);
  assert.ok(shared.states.includes("current"));
});

test("states distinct: stale (gaps/age) + restricted (draft); freshness has teeth", () => {
  const old = vm.rows.find((r) => r.id === "r_old");
  assert.ok(old.states.includes("stale"));
  assert.equal(old.missingDataNotes.length, 1);
  // negative control: an aged report with NO gaps is stale by AGE alone (isolates the age trigger).
  const aged = vm.rows.find((r) => r.id === "r_aged");
  assert.equal(aged.missingDataNotes.length, 0);
  assert.ok(aged.states.includes("stale") && !aged.states.includes("current"));
  assert.equal(vm.counts.stale, 2);
  assert.ok(vm.rows.find((r) => r.id === "r_draft").states.includes("restricted"));
  assert.ok(!rv.reportStates({ status: "shared", stale: true, pendingShare: false, hasGaps: false }).includes("current"));
  assert.ok(rv.reportStates({ status: "under_review", stale: false, pendingShare: false, hasGaps: false }).includes("pending_approval"));
});

test("gate-first ordering; deterministic", () => {
  assert.ok(vm.rows[0].states.includes("pending_approval"));
  const vm2 = rv.buildReportsView({ reports, approvals, workspaceLabels: { ws1: "Demo WS" } }, { as_of: AS_OF });
  assert.equal(JSON.stringify(vm), JSON.stringify(vm2));
});
