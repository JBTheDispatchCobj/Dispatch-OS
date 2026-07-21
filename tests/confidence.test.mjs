// tests/confidence.test.mjs — the Confidence Engine (decay / propagate / reinforce / roll-up).
import { test } from "node:test";
import assert from "node:assert/strict";
import { register } from "node:module";
register("../scripts/alias-hook.mjs", import.meta.url);

const { decay, propagate, reinforce, topTier, combineSources, TIER_RANK } =
  await import("@/core/truth/confidence");

const approx = (a, b, eps = 1e-9) => assert.ok(Math.abs(a - b) < eps, `${a} !~= ${b}`);

test("confidence: decay halves at exactly one half-life, quarters at two", () => {
  approx(decay(1, 10, 10), 0.5);
  approx(decay(0.8, 10, 10), 0.4);
  approx(decay(1, 20, 10), 0.25);
  // No decay for non-positive age or half-life (guards divide-by-zero).
  assert.equal(decay(0.8, 0, 10), 0.8);
  assert.equal(decay(0.8, -5, 10), 0.8);
  assert.equal(decay(0.8, 10, 0), 0.8);
});

test("confidence: propagate min / product / weighted behave as documented", () => {
  approx(propagate([0.9, 0.4, 0.6], "min"), 0.4);
  approx(propagate([0.5, 0.5], "product"), 0.25);
  approx(propagate([1, 0], "weighted", [3, 1]), 0.75);
  // default mode is min
  approx(propagate([0.9, 0.3]), 0.3);
  // degenerate weights fall back to an equal-weight average
  approx(propagate([0.2, 0.8], "weighted", [0, 0]), 0.5);
  // empty input -> 0
  assert.equal(propagate([]), 0);
});

test("confidence: reinforce converges monotonically and stays in [0,1]", () => {
  approx(reinforce(0.5, true, 0.2), 0.6);
  approx(reinforce(0.5, false, 0.2), 0.4);
  // repeated agreement rises monotonically toward 1, never past it
  let p = 0.5;
  for (let i = 0; i < 50; i++) {
    const next = reinforce(p, true, 0.3);
    assert.ok(next >= p, "agreement must not decrease confidence");
    assert.ok(next <= 1, "must never exceed 1");
    p = next;
  }
  assert.ok(p > 0.999);
  // boundaries are fixed points
  assert.equal(reinforce(1, true), 1);
  assert.equal(reinforce(0, false), 0);
});

test("confidence: topTier returns the most authoritative tier; TIER_RANK is monotonic", () => {
  assert.equal(topTier(["third_party_claim", "human_approved_conclusion", "public_fact"]), "human_approved_conclusion");
  assert.equal(topTier(["dispatch_inference", "public_fact"]), "public_fact");
  assert.equal(topTier([]), null);
  assert.ok(TIER_RANK.human_approved_conclusion > TIER_RANK.institution_verified_fact);
  assert.ok(TIER_RANK.public_fact > TIER_RANK.dispatch_inference);
  assert.ok(TIER_RANK.third_party_claim < TIER_RANK.dispatch_inference);
});

test("confidence: combineSources reports value, top_tier, lineage, per-source contributions", () => {
  const r = combineSources(
    [
      { value: 0.9, tier: "public_fact", source_ref: "s1" },
      { value: 0.4, tier: "human_approved_conclusion", source_ref: "s2" },
    ],
    "min",
  );
  approx(r.value, 0.4);
  assert.equal(r.top_tier, "human_approved_conclusion");
  assert.deepEqual(r.lineage, ["s1", "s2"]);
  assert.equal(r.factors.length, 2);
  approx(r.factors[0].contributed, 0.9);
  approx(r.factors[1].contributed, 0.4);
});

test("confidence: combineSources decays a source by its own age before combining", () => {
  const r = combineSources(
    [{ value: 1, tier: "public_fact", source_ref: "s1", ageDays: 10, halfLifeDays: 10 }],
    "min",
  );
  approx(r.value, 0.5);
  approx(r.factors[0].contributed, 0.5);
});

test("confidence: NaN / empty inputs clamp to 0", () => {
  assert.equal(decay(NaN, 10, 10), 0);
  assert.equal(propagate([NaN, NaN]), 0);
  const empty = combineSources([]);
  assert.equal(empty.value, 0);
  assert.equal(empty.top_tier, null);
  assert.deepEqual(empty.lineage, []);
  assert.deepEqual(empty.factors, []);
});
