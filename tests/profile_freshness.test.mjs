// tests/profile_freshness.test.mjs — Profile FRESHNESS policy (RFC-3008/3012).
import { test } from "node:test";
import assert from "node:assert/strict";
import { register } from "node:module";
register("../scripts/alias-hook.mjs", import.meta.url);

const {
  ageDaysBetween,
  halfLifeForTier,
  freshnessBand,
  assessFreshness,
  assessFreshnessForTier,
  DEFAULT_HALF_LIFE_DAYS,
} = await import("@/core/profile/freshness");

test("ageDaysBetween: exact day difference", () => {
  assert.equal(ageDaysBetween("2026-01-01T00:00:00.000Z", "2026-01-11T00:00:00.000Z"), 10);
  assert.equal(ageDaysBetween("2026-01-01T00:00:00.000Z", "2026-01-01T00:00:00.000Z"), 0);
});

test("ageDaysBetween: a future observation and bad input yield 0 (no negative age)", () => {
  assert.equal(ageDaysBetween("2026-02-01T00:00:00.000Z", "2026-01-01T00:00:00.000Z"), 0);
  assert.equal(ageDaysBetween("not-a-date", "2026-01-01T00:00:00.000Z"), 0);
  assert.equal(ageDaysBetween("2026-01-01T00:00:00.000Z", "nope"), 0);
});

test("halfLifeForTier: policy is durable→volatile ordered", () => {
  assert.ok(
    halfLifeForTier("human_approved_conclusion") > halfLifeForTier("institution_verified_fact"),
  );
  assert.ok(halfLifeForTier("institution_verified_fact") > halfLifeForTier("public_fact"));
  assert.ok(halfLifeForTier("public_fact") > halfLifeForTier("deterministic_calculation"));
  assert.ok(halfLifeForTier("deterministic_calculation") > halfLifeForTier("third_party_claim"));
  assert.ok(halfLifeForTier("third_party_claim") > halfLifeForTier("dispatch_inference"));
  // Every declared tier has a positive finite policy.
  for (const h of Object.values(DEFAULT_HALF_LIFE_DAYS)) assert.ok(Number.isFinite(h) && h > 0);
});

test("assessFreshness: halves at exactly one half-life; is 1 at age 0", () => {
  const fresh0 = assessFreshness("2026-01-01T00:00:00.000Z", "2026-01-01T00:00:00.000Z", 10);
  assert.equal(fresh0.freshness, 1);
  assert.equal(fresh0.band, "fresh");
  const half = assessFreshness("2026-01-01T00:00:00.000Z", "2026-01-11T00:00:00.000Z", 10);
  assert.ok(Math.abs(half.freshness - 0.5) < 1e-9, "one half-life halves freshness");
  assert.equal(half.age_days, 10);
  assert.equal(half.half_life_days, 10);
});

test("freshnessBand: boundaries fresh>=0.66, aging>=0.33, else stale", () => {
  assert.equal(freshnessBand(0.9), "fresh");
  assert.equal(freshnessBand(0.66), "fresh");
  assert.equal(freshnessBand(0.5), "aging");
  assert.equal(freshnessBand(0.33), "aging");
  assert.equal(freshnessBand(0.2), "stale");
  assert.equal(freshnessBand(0), "stale");
});

test("assessFreshnessForTier: picks the tier's policy half-life", () => {
  const a = assessFreshnessForTier("2026-01-01T00:00:00.000Z", "2026-07-01T00:00:00.000Z", "dispatch_inference");
  assert.equal(a.half_life_days, halfLifeForTier("dispatch_inference"));
  // A model inference (90d half-life) is materially stale ~6 months out; a public
  // fact (1095d) barely ages over the same span.
  const b = assessFreshnessForTier("2026-01-01T00:00:00.000Z", "2026-07-01T00:00:00.000Z", "public_fact");
  assert.ok(b.freshness > a.freshness, "durable tiers stay fresher over the same span");
});

test("assessFreshness: bad half-life falls back to a positive default (no divide-by-zero)", () => {
  const a = assessFreshness("2026-01-01T00:00:00.000Z", "2026-02-01T00:00:00.000Z", 0);
  assert.ok(a.half_life_days > 0 && Number.isFinite(a.freshness));
});
