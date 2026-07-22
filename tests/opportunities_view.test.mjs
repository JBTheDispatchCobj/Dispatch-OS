// tests/opportunities_view.test.mjs — the /opportunities surface (Sprint IV Wave 2).
// Sourced, scored deal-engine opportunities. Every score is a Dispatch inference; the engine
// only RECOMMENDS — advancing to allocation requires the ICApproval human gate, so a
// recommended-advance opportunity is pending_approval, never auto-advanced to current.
import { test } from "node:test";
import assert from "node:assert/strict";
import { register } from "node:module";
register("../scripts/alias-hook.mjs", import.meta.url);

const ro = await import("@/cartridges/cooperative_markets/run_opportunities");
const ov = await import("@/app/_surfaces/opportunities_view");
const AS_OF = "2026-07-22T00:00:00.000Z";

const vm = await ro.runOpportunities({ as_of: AS_OF });

test("renders the live deal-engine run (advance/hold/block exercised)", () => {
  assert.equal(vm.counts.total, 3);
  assert.equal(vm.counts.advancing, 1);
  assert.equal(vm.counts.blocked, 1);
});

test("human gate intact: nothing auto-advances", () => {
  assert.equal(vm.counts.approved, 0);
  const adv = vm.open.find((r) => r.recommendation === "advance");
  assert.equal(adv.awaitingApproval, true);
  assert.equal(adv.gate, null);
  assert.ok(adv.states.includes("inferred") && adv.states.includes("pending_approval"));
  assert.ok(!adv.states.includes("current"));
  const blk = vm.blocked.find((r) => r.recommendation === "blocked");
  assert.ok(blk.states.includes("conflicted"));
});

test("every opportunity is a sourced Dispatch inference with lineage", () => {
  for (const r of [...vm.open, ...vm.blocked]) {
    assert.equal(r.inferred, true);
    assert.ok(r.hasLineage);
    assert.ok(r.scores.length >= 1);
  }
});

test("state machine teeth: approved→current, rejected→conflicted, no-gate→pending", () => {
  const base = { id: "o", company: "C", institution: "I", category: "x", opportunityScore: 80, confidence: 0.8, tier: "dispatch_inference", rationale: "r", lineage: ["fact:1"], scores: [{ key: "opportunity", label: "Opportunity", value: 80, confidence: 0.8 }] };
  const approved = ov.buildOpportunitiesView([{ ...base, recommendation: "advance", gate: { disposition: "approved", by: "user:ic", decision_ref: "dec:1" } }], { as_of: AS_OF });
  assert.ok(approved.open[0].states.includes("current"));
  assert.ok(!approved.open[0].states.includes("pending_approval"));
  assert.equal(approved.counts.approved, 1);
  const rejected = ov.buildOpportunitiesView([{ ...base, recommendation: "advance", gate: { disposition: "rejected", by: "user:ic", decision_ref: "dec:2" } }], { as_of: AS_OF });
  assert.ok(rejected.open[0].states.includes("conflicted"));
  const pending = ov.buildOpportunitiesView([{ ...base, recommendation: "advance", gate: null }], { as_of: AS_OF });
  assert.ok(pending.open[0].states.includes("pending_approval"));
  assert.ok(!pending.open[0].states.includes("current"));
});

test("deterministic", async () => {
  const vm2 = await ro.runOpportunities({ as_of: AS_OF });
  assert.equal(JSON.stringify(vm), JSON.stringify(vm2));
});
