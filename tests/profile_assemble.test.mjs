// tests/profile_assemble.test.mjs — the Profile Assembly Engine (RFC-3012).
import { test } from "node:test";
import assert from "node:assert/strict";
import { register } from "node:module";
register("../scripts/alias-hook.mjs", import.meta.url);

const { assembleProfile } = await import("@/core/profile/assemble");

const field = (key, value, tier, confidence, over = {}) => ({
  key, label: key, value, source_ref: "filing:1", tier, confidence, ...over,
});
const base = (fields, over = {}) => ({
  id: "prof:1",
  subject_ref: "entity:1",
  subject_type: "credit_union",
  display_name: "Summit Ridge FCU",
  fields,
  created_at: "2026-07-21T00:00:00.000Z",
  ...over,
});

test("profile: every field keeps its source_ref and truth tier", () => {
  const p = assembleProfile(base([
    field("net_worth_ratio", 9.0, "deterministic_calculation", 0.95),
    field("roa", 0.81, "deterministic_calculation", 0.95),
  ]));
  for (const f of p.fields) {
    assert.equal(f.source_ref, "filing:1");
    assert.equal(f.tier, "deterministic_calculation");
    assert.ok(f.confidence >= 0 && f.confidence <= 1);
  }
  assert.equal(p.generated_by, "profile_assembler:v1");
});

test("profile: rollup confidence in [0,1]; top_tier is the most authoritative present", () => {
  const p = assembleProfile(base([
    field("a", 1, "public_fact", 0.9),
    field("b", 2, "deterministic_calculation", 0.9),
  ]));
  assert.ok(p.confidence >= 0 && p.confidence <= 1);
  assert.equal(p.top_tier, "deterministic_calculation"); // rank 4 > public_fact rank 3
});

test("profile: completeness measured against expected_field_keys", () => {
  const fields = [field("a", 1, "public_fact", 0.9), field("b", 2, "public_fact", 0.9)];
  const p = assembleProfile(base(fields, { expected_field_keys: ["a", "b", "c", "d"] }));
  assert.equal(p.completeness, 0.5); // 2 of 4 present
  const full = assembleProfile(base(fields, { expected_field_keys: ["a", "b"] }));
  assert.equal(full.completeness, 1);
});

test("profile: health bands strong / adequate / thin from confidence * completeness", () => {
  const two = [field("a", 1, "public_fact", 0.9), field("b", 2, "public_fact", 0.9)];
  const strong = assembleProfile(base(two, { expected_field_keys: ["a", "b"] })); // 0.9 * 1.0
  assert.equal(strong.health, "strong");
  const adequate = assembleProfile(base(two, { expected_field_keys: ["a", "b", "c", "d"] })); // 0.9 * 0.5 = 0.45
  assert.equal(adequate.health, "adequate");
  const thin = assembleProfile(base([field("a", 1, "public_fact", 0.3)], { expected_field_keys: ["a"] })); // 0.3 * 1
  assert.equal(thin.health, "thin");
});

test("profile: lineage lists each distinct source_ref once", () => {
  const p = assembleProfile(base([
    field("a", 1, "public_fact", 0.9, { source_ref: "s1" }),
    field("b", 2, "public_fact", 0.9, { source_ref: "s1" }),
    field("c", 3, "public_fact", 0.9, { source_ref: "s2" }),
  ]));
  assert.deepEqual(p.lineage, ["s1", "s2"]);
});

test("profile: empty fields yield a well-formed empty profile", () => {
  const p = assembleProfile(base([]));
  assert.equal(p.confidence, 0);
  assert.equal(p.top_tier, null);
  assert.deepEqual(p.lineage, []);
  assert.equal(p.completeness, 0);
  assert.equal(p.health, "thin");
  assert.deepEqual(p.fields, []);
});

test("profile: a field carries its unit through; age decays its contributed confidence", () => {
  const p = assembleProfile(base([
    field("nw", 9.0, "deterministic_calculation", 1, { unit: "%", ageDays: 10, halfLifeDays: 10 }),
  ]));
  const f = p.fields[0];
  assert.equal(f.unit, "%");
  assert.ok(Math.abs(f.confidence - 0.5) < 1e-9, "post-decay contribution should halve at one half-life");
});

test("profile: deterministic — same input deep-equal", () => {
  const input = base([field("a", 1, "public_fact", 0.9), field("b", 2, "deterministic_calculation", 0.8)]);
  assert.deepEqual(assembleProfile(input), assembleProfile(input));
});
