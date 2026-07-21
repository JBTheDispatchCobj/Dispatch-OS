// tests/allocation.test.mjs — VC Deal Engine P3 (allocation + subscriber gates).
import { test } from "node:test";
import assert from "node:assert/strict";
import { register } from "node:module";
register("../scripts/alias-hook.mjs", import.meta.url);

const { allocateDeal, dealFromMemo } = await import("@/cartridges/cooperative_markets/allocation");

const deal = (recommendation = "recommend", capacity_usd = 1_000_000) => ({
  company: "X", ref: "x", category: "real_time_payments", recommendation, capacity_usd,
});
const cu = (over = {}) => ({
  id: "cu1", name: "CU1", kind: "credit_union", ref: "cu1",
  kyb_status: "cleared", sanctions_status: "cleared",
  interest: { categories: ["real_time_payments"] }, requested_usd: 400_000, ...over,
});
const lp = (over = {}) => ({
  id: "lp1", name: "LP1", kind: "lp", ref: "lp1",
  accreditation: "accredited", kyc_status: "cleared", sanctions_status: "cleared",
  interest: { categories: ["real_time_payments"] }, requested_usd: 400_000, ...over,
});

test("allocation: non-accredited LP is rejected with 'not_accredited'", () => {
  const r = allocateDeal(deal(), [lp({ id: "lp_bad", name: "bad", accreditation: "none" })]);
  assert.equal(r.allocations.length, 0);
  const rej = r.rejected.find((x) => x.subscriber_id === "lp_bad");
  assert.ok(rej.reasons.includes("not_accredited"));
});

test("allocation: sanctions / kyb / kyc gates reject with the correct reasons", () => {
  const r = allocateDeal(deal(), [
    cu({ id: "cu_ofac", sanctions_status: "pending" }),
    cu({ id: "cu_nokyb", kyb_status: "pending" }),
    lp({ id: "lp_noid", kyc_status: "pending", kyb_status: "pending" }),
  ]);
  const reasons = (id) => r.rejected.find((x) => x.subscriber_id === id).reasons;
  assert.ok(reasons("cu_ofac").includes("sanctions_not_cleared"));
  assert.ok(reasons("cu_nokyb").includes("kyb_incomplete"));
  assert.ok(reasons("lp_noid").includes("kyc_incomplete"));
});

test("allocation: category mismatch is rejected", () => {
  const r = allocateDeal(deal(), [cu({ id: "cu_wrong", interest: { categories: ["mortgage_tech"] } })]);
  assert.ok(r.rejected.find((x) => x.subscriber_id === "cu_wrong").reasons.includes("category_mismatch"));
});

test("allocation: only recommend / recommend_with_conditions are allocatable", () => {
  for (const rec of ["hold", "pass", "blocked"]) {
    const r = allocateDeal(deal(rec), [cu()]);
    assert.equal(r.allocations.length, 0);
    assert.ok(r.rejected[0].reasons.includes("deal_not_approved"));
  }
  const okC = allocateDeal(deal("recommend"), [cu()]);
  assert.equal(okC.allocations.length, 1);
  const okW = allocateDeal(deal("recommend_with_conditions"), [cu()]);
  assert.equal(okW.allocations.length, 1);
});

test("allocation: oversubscription scales pro-rata, never exceeding capacity", () => {
  const r = allocateDeal(deal("recommend", 1_000_000), [
    cu({ id: "a", requested_usd: 800_000 }),
    cu({ id: "b", requested_usd: 800_000 }),
  ]);
  assert.equal(r.allocations.length, 2);
  assert.ok(r.allocations.every((a) => a.scaled === true));
  assert.ok(r.allocated_usd <= r.capacity_usd, `allocated ${r.allocated_usd} must be <= capacity ${r.capacity_usd}`);
  // total requested 1.6M vs 1.0M capacity -> factor 0.625 -> each floored to 500,000
  assert.deepEqual(r.allocations.map((a) => a.allocated_usd).sort(), [500_000, 500_000]);
});

test("allocation: undersubscribed round is NOT scaled and fully honored", () => {
  const r = allocateDeal(deal("recommend", 2_000_000), [cu({ requested_usd: 400_000 })]);
  assert.equal(r.allocations[0].scaled, false);
  assert.equal(r.allocations[0].allocated_usd, 400_000);
  assert.equal(r.remaining_usd, 1_600_000);
});

test("allocation: every allocation cites its gating facts and its vehicle object", () => {
  const r = allocateDeal(deal(), [cu(), lp()]);
  assert.ok(r.allocations.every((a) => a.citations.length > 0));
  const cuAlloc = r.allocations.find((a) => a.kind === "credit_union");
  const lpAlloc = r.allocations.find((a) => a.kind === "lp");
  assert.match(cuAlloc.vehicle_object, /participation$/);
  assert.match(lpAlloc.vehicle_object, /syndication$/);
  assert.ok(lpAlloc.citations.some((c) => c.includes("accreditation")));
  assert.equal(r.deal_flow_access.qualified_matches, r.allocations.length);
});

test("allocation: deterministic — same inputs deep-equal", () => {
  const subs = [cu(), lp()];
  assert.deepEqual(allocateDeal(deal(), subs), allocateDeal(deal(), subs));
});

test("allocation: dealFromMemo carries the memo recommendation through", () => {
  const memo = { company: "Acme", recommendation: "recommend_with_conditions" };
  const d = dealFromMemo(memo, "ref:1", "real_time_payments", 500_000);
  assert.equal(d.company, "Acme");
  assert.equal(d.recommendation, "recommend_with_conditions");
  assert.equal(d.capacity_usd, 500_000);
});
