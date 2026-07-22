// tests/evidence_view.test.mjs — the EVIDENCE surface builder (Sprint IV Wave 1).
// Projects LIVE evidence into lineage rows with the doctrine states rendered
// distinctly (current / stale / inferred / pending_approval / restricted). The
// builder NEVER reviews — it is a pure projection; the real gate is the
// permission-engine contract behind the server action. Deterministic.
import { test } from "node:test";
import assert from "node:assert/strict";
import { register } from "node:module";
register("../scripts/alias-hook.mjs", import.meta.url);

const {
  buildEvidenceView,
  evidenceStates,
  ageDaysBetween,
  effectiveReviewStatus,
  EVIDENCE_STALE_DAYS,
} = await import("@/app/_surfaces/evidence_view");

const AS_OF = "2026-07-22T00:00:00.000Z";

const ev = (over) => ({
  item: {
    id: "e1", work_item_id: "wi1", kind: "measurement", label: "score", value: { a: 1, b: 2 },
    document_id: null, captured_by: "user:ops", created_at: "2026-06-01T00:00:00.000Z", review_status: "approved",
    ...over.item,
  },
  work_item_title: over.work_item_title ?? "Pilot", workspace_id: "ws1", workspace_label: "Demo WS",
});

const fixture = () => [
  ev({ item: { id: "e_pending", captured_by: "agent:run", created_at: "2026-02-15T00:00:00.000Z", review_status: undefined } }),
  ev({ item: { id: "e_soc2", kind: "attestation", document_id: "doc1", captured_by: "user:ops", review_status: "approved" } }),
  ev({ item: { id: "e_score", kind: "measurement", captured_by: "agent:run", review_status: "approved" } }),
];

test("age is whole-day, future/bad → 0 (no negative age, no clock)", () => {
  assert.equal(ageDaysBetween("2026-06-01T00:00:00.000Z", "2026-07-01T00:00:00.000Z"), 30);
  assert.equal(ageDaysBetween("2026-08-01T00:00:00.000Z", AS_OF), 0, "future created_at → 0");
  assert.equal(ageDaysBetween("nonsense", AS_OF), 0);
});

test("effective review status treats a legacy/absent status as pending (a review is owed)", () => {
  assert.equal(effectiveReviewStatus({ review_status: undefined }), "pending");
  assert.equal(effectiveReviewStatus({ review_status: "approved" }), "approved");
});

test("states render distinctly: pending / inferred / stale / restricted / current", () => {
  assert.deepEqual(evidenceStates({ review_status: "pending", inferred: true, stale: true, restricted: false }).sort(), ["inferred", "pending_approval", "stale"]);
  assert.deepEqual(evidenceStates({ review_status: "approved", inferred: false, stale: false, restricted: true }).sort(), ["current", "restricted"]);
  assert.deepEqual(evidenceStates({ review_status: "approved", inferred: false, stale: false, restricted: false }), ["current"]);
  // a stale approved item is NOT current (freshness has teeth)
  assert.ok(!evidenceStates({ review_status: "approved", inferred: false, stale: true, restricted: false }).includes("current"));
  // a REJECTED fresh/plain item is NEVER "current" (the fallback is approved-only — teeth for the correctness fix)
  assert.ok(!evidenceStates({ review_status: "rejected", inferred: false, stale: false, restricted: false }).includes("current"), "a rejected item is never labeled the approved-only 'current' state");
  assert.deepEqual(evidenceStates({ review_status: "rejected", inferred: false, stale: false, restricted: false }), [], "a plain rejected item emits no positive state (its rejected status is carried separately)");
});

test("the builder NEVER reviews — an unreviewed item stays unreviewed + decidable", () => {
  const input = fixture();
  const vm = buildEvidenceView(input, { as_of: AS_OF });
  const p = vm.rows.find((r) => r.id === "e_pending");
  assert.equal(p.review_status, "pending", "projection does not flip an unreviewed item");
  assert.equal(p.decidable, true, "an unreviewed item is the only decidable kind");
  assert.ok(vm.rows.filter((r) => r.review_status === "approved").every((r) => r.decidable === false), "reviewed items are not decidable");
  // teeth: does not mutate input
  assert.equal(input[0].item.review_status, undefined);
});

test("derives inferred (agent) / stale (old) / restricted (doc) distinctly", () => {
  const vm = buildEvidenceView(fixture(), { as_of: AS_OF });
  const p = vm.rows.find((r) => r.id === "e_pending");
  assert.ok(p.inferred, "agent-captured is inferred");
  assert.ok(p.stale && p.ageDays > EVIDENCE_STALE_DAYS, "an old item is stale");
  assert.ok(p.states.includes("pending_approval") && p.states.includes("inferred") && p.states.includes("stale"));
  const soc2 = vm.rows.find((r) => r.id === "e_soc2");
  assert.ok(soc2.restricted, "a document-backed item is restricted");
  assert.equal(soc2.inferred, false, "a user-captured item is not an inference");
});

test("counts + unreviewed-first ordering; deterministic on repeat", () => {
  const vm1 = buildEvidenceView(fixture(), { as_of: AS_OF });
  const vm2 = buildEvidenceView(fixture(), { as_of: AS_OF });
  assert.equal(JSON.stringify(vm1), JSON.stringify(vm2), "same input → identical VM");
  assert.equal(vm1.counts.total, 3);
  assert.equal(vm1.counts.unreviewed, 1);
  assert.equal(vm1.counts.inferred, 2);
  assert.equal(vm1.rows[0].id, "e_pending", "the unreviewed item sinks to the top (review owed)");
});

test("valueKeys carry the lineage of the payload for drill-through", () => {
  const vm = buildEvidenceView(fixture(), { as_of: AS_OF });
  assert.deepEqual(vm.rows.find((r) => r.id === "e_score").valueKeys, ["a", "b"]);
});
