// tests/assemble_live.test.mjs — LIVE profile assembly (decay + outcome-feedback).
import { test } from "node:test";
import assert from "node:assert/strict";
import { register } from "node:module";
register("../scripts/alias-hook.mjs", import.meta.url);

const { assembleLiveProfile, applyOutcomes } = await import("@/core/profile/assemble_live");

const AS_OF = "2026-07-01T00:00:00.000Z";
const liveField = (over = {}) => ({
  key: "nw",
  label: "Net worth",
  value: 9,
  source_ref: "filing:1",
  tier: "deterministic_calculation",
  confidence: 0.9,
  observed_at: AS_OF, // fresh by default (age 0)
  ...over,
});
const base = (fields, over = {}) => ({
  id: "prof:live:1",
  subject_ref: "entity:1",
  subject_type: "credit_union",
  display_name: "Summit Ridge FCU",
  fields,
  as_of: AS_OF,
  ...over,
});

test("live: carries as_of + assembled_live and the audit surfaces", () => {
  const p = assembleLiveProfile(base([liveField()]));
  assert.equal(p.as_of, AS_OF);
  assert.equal(p.assembled_live, true);
  assert.equal(p.generated_by, "profile_assembler:v1"); // delegates to the base engine
  assert.equal(p.field_freshness.length, 1);
  assert.equal(p.outcome_adjustments.length, 1);
  assert.equal(p.field_freshness[0].key, "nw");
});

test("live: freshness DECAYS a stale field's contributed confidence", () => {
  const fresh = assembleLiveProfile(base([liveField({ observed_at: AS_OF })]));
  // Observed one full deterministic_calculation half-life earlier (365d before as_of).
  const stale = assembleLiveProfile(base([liveField({ observed_at: "2025-07-01T00:00:00.000Z" })]));
  assert.ok(fresh.fields[0].confidence > stale.fields[0].confidence, "older field contributes less");
  assert.ok(Math.abs(stale.fields[0].confidence - 0.45) < 1e-6, "0.9 prior halved at one half-life ≈ 0.45");
  assert.ok(fresh.confidence > stale.confidence, "stale profile is less confident overall");
  assert.equal(stale.field_freshness[0].band, "aging");
});

test("live: outcome-feedback raises on agreement, lowers on contradiction", () => {
  const agreed = assembleLiveProfile(base([
    liveField({ outcomes: [{ agreed: true, weight: 0.5, source_ref: "verif:1" }] }),
  ]));
  const disagreed = assembleLiveProfile(base([
    liveField({ outcomes: [{ agreed: false, weight: 0.5, source_ref: "verif:2" }] }),
  ]));
  // adjusted prior vs the raw 0.9 (fields are fresh so decay is a no-op here).
  assert.ok(agreed.outcome_adjustments[0].adjusted_confidence > 0.9, "agreement pulls toward 1");
  assert.ok(disagreed.outcome_adjustments[0].adjusted_confidence < 0.9, "contradiction pulls toward 0");
  assert.equal(agreed.outcome_adjustments[0].prior_confidence, 0.9);
  assert.equal(agreed.outcome_adjustments[0].outcome_count, 1);
  // Evidence lineage: the outcome source_ref that drove the movement is persisted.
  assert.deepEqual(agreed.outcome_adjustments[0].outcome_source_refs, ["verif:1"]);
  assert.deepEqual(disagreed.outcome_adjustments[0].outcome_source_refs, ["verif:2"]);
});

test("live: a field with no outcomes carries an empty outcome lineage", () => {
  const p = assembleLiveProfile(base([liveField()]));
  assert.deepEqual(p.outcome_adjustments[0].outcome_source_refs, []);
  assert.equal(p.outcome_adjustments[0].outcome_count, 0);
});

test("live: applyOutcomes is sequential and matches reinforce math", () => {
  // 0.5 --agree .2--> 0.6 --agree .2--> 0.68
  const c = applyOutcomes(0.5, [
    { agreed: true, source_ref: "a" },
    { agreed: true, source_ref: "b" },
  ]);
  assert.ok(Math.abs(c - 0.68) < 1e-9);
  assert.equal(applyOutcomes(0.5, undefined), 0.5);
  // ORDER-DEPENDENCE is real and must be pinned: [agree,disagree] != [disagree,agree].
  // 0.5 --agree.2--> 0.6 --disagree.2--> 0.48   vs   0.5 --disagree.2--> 0.4 --agree.2--> 0.52
  const ad = applyOutcomes(0.5, [{ agreed: true, source_ref: "a" }, { agreed: false, source_ref: "b" }]);
  const da = applyOutcomes(0.5, [{ agreed: false, source_ref: "b" }, { agreed: true, source_ref: "a" }]);
  assert.ok(Math.abs(ad - 0.48) < 1e-9, "agree-then-disagree lands at 0.48");
  assert.ok(Math.abs(da - 0.52) < 1e-9, "disagree-then-agree lands at 0.52");
  assert.notEqual(ad, da); // a reversed-iteration mutation would break this
});

test("live: outcome-feedback THEN freshness decay compose (both applied)", () => {
  // Agreement lifts the prior above 0.9, then a one-half-life age halves it.
  const p = assembleLiveProfile(base([
    liveField({
      observed_at: "2025-07-01T00:00:00.000Z",
      outcomes: [{ agreed: true, weight: 0.5, source_ref: "verif:1" }],
    }),
  ]));
  const adjusted = p.outcome_adjustments[0].adjusted_confidence; // 0.9 + 0.5*0.1 = 0.95
  assert.ok(Math.abs(adjusted - 0.95) < 1e-9);
  assert.ok(Math.abs(p.fields[0].confidence - adjusted / 2) < 1e-6, "decayed to half the adjusted prior");
});

test("live: empty fields yield a well-formed empty live profile", () => {
  const p = assembleLiveProfile(base([]));
  assert.equal(p.confidence, 0);
  assert.equal(p.top_tier, null);
  assert.equal(p.health, "thin");
  assert.deepEqual(p.field_freshness, []);
  assert.deepEqual(p.outcome_adjustments, []);
  assert.equal(p.assembled_live, true);
});

test("live: deterministic — same input deep-equal", () => {
  const input = base([
    liveField({ key: "a", observed_at: "2026-01-01T00:00:00.000Z" }),
    liveField({ key: "b", observed_at: "2026-03-01T00:00:00.000Z", outcomes: [{ agreed: true, source_ref: "x" }] }),
  ], { expected_field_keys: ["a", "b", "c"] });
  assert.deepEqual(assembleLiveProfile(input), assembleLiveProfile(input));
});
