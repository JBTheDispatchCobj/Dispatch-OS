// tests/profile_query.test.mjs — the Profile QUERY surface (RFC-3011/3012).
import { test } from "node:test";
import assert from "node:assert/strict";
import { register } from "node:module";
register("../scripts/alias-hook.mjs", import.meta.url);

const { queryProfiles, rankProfiles, lookupField, matchesFieldPredicate } = await import(
  "@/core/profile/query"
);
const { assembleLiveProfile } = await import("@/core/profile/assemble_live");

// Synthetic assembled profiles (the generic base shape) so the query logic is
// tested in isolation from the assembler.
const fld = (key, value, confidence = 0.9, tier = "deterministic_calculation") => ({
  key, label: key, value, source_ref: `s:${key}`, tier, confidence,
});
const prof = (id, over = {}) => ({
  id,
  subject_ref: `entity:${id}`,
  subject_type: "credit_union",
  display_name: id,
  fields: [fld("net_worth_ratio", 9.0), fld("roa", 0.8)],
  confidence: 0.8,
  top_tier: "deterministic_calculation",
  lineage: ["s:net_worth_ratio", "s:roa"],
  completeness: 1,
  health: "strong",
  created_at: "2026-07-01T00:00:00.000Z",
  generated_by: "profile_assembler:v1",
  ...over,
});

const book = [
  prof("a", { confidence: 0.9, fields: [fld("net_worth_ratio", 12.0)], completeness: 1, health: "strong" }),
  prof("b", { confidence: 0.7, fields: [fld("net_worth_ratio", 6.0)], completeness: 0.5, health: "adequate" }),
  prof("c", { confidence: 0.5, fields: [fld("net_worth_ratio", 9.0)], completeness: 0.4, health: "adequate", top_tier: "dispatch_inference" }),
  prof("d", { subject_type: "regulation_environment", confidence: 0.95, fields: [fld("in_force_sections", 675)], health: "strong" }),
];

test("query: subject_type filter", () => {
  const r = queryProfiles(book, { subject_type: "regulation_environment" });
  assert.equal(r.total, 1);
  assert.equal(r.matched[0].id, "d");
  assert.ok(r.applied.includes("subject_type=regulation_environment"));
});

test("query: min_confidence + min_completeness filters", () => {
  assert.equal(queryProfiles(book, { min_confidence: 0.8 }).total, 2); // a, d
  assert.equal(queryProfiles(book, { min_completeness: 0.5 }).total, 3); // a, b, d (c=0.4 out)
});

test("query: tier_floor compares by the truth-hierarchy rank", () => {
  // deterministic_calculation (rank 4) floor excludes c (dispatch_inference rank 2).
  const r = queryProfiles(book, { tier_floor: "deterministic_calculation" });
  assert.ok(!r.matched.some((p) => p.id === "c"));
  assert.equal(r.total, 3);
  // A public_fact floor (rank 3) still excludes the inference-only profile.
  assert.ok(!queryProfiles(book, { tier_floor: "public_fact" }).matched.some((p) => p.id === "c"));
});

test("query: health_in filter", () => {
  const r = queryProfiles(book, { health_in: ["strong"] });
  assert.deepEqual(r.matched.map((p) => p.id).sort(), ["a", "d"]);
});

test("query: field predicate ops (gte/lte/gt/lt/eq/exists)", () => {
  assert.equal(queryProfiles(book, { field: { key: "net_worth_ratio", op: "gte", value: 9 } }).total, 2); // a=12,c=9; d has no nwr field → excluded
  assert.equal(queryProfiles(book, { field: { key: "net_worth_ratio", op: "lt", value: 9 } }).total, 1); // b6
  assert.equal(queryProfiles(book, { field: { key: "net_worth_ratio", op: "eq", value: 9 } }).total, 1); // c
  assert.equal(queryProfiles(book, { field: { key: "in_force_sections", op: "exists" } }).total, 1); // d
  // A missing field fails every predicate.
  assert.ok(!matchesFieldPredicate(book[3], { key: "roa", op: "gte", value: 0 }));
});

test("query: multiple field predicates are ANDed", () => {
  const r = queryProfiles(book, {
    field: [
      { key: "net_worth_ratio", op: "gte", value: 7 },
      { key: "net_worth_ratio", op: "lte", value: 12 },
    ],
  });
  assert.deepEqual(r.matched.map((p) => p.id).sort(), ["a", "c"]); // 12 and 9; b=6 out
});

test("query: min_field_confidence is the freshness floor", () => {
  const fresh = prof("f1", { fields: [fld("nw", 9, 0.9)] });
  const stale = prof("f2", { fields: [fld("nw", 9, 0.2)] });
  const r = queryProfiles([fresh, stale], { min_field_confidence: { key: "nw", min: 0.5 } });
  assert.deepEqual(r.matched.map((p) => p.id), ["f1"]);
});

test("query: rank by confidence desc/asc", () => {
  assert.deepEqual(queryProfiles(book, { rank_by: "confidence", dir: "desc" }).matched.map((p) => p.id), ["d", "a", "b", "c"]);
  assert.deepEqual(queryProfiles(book, { rank_by: "confidence", dir: "asc" }).matched.map((p) => p.id), ["c", "b", "a", "d"]);
});

test("query: rank by field_value (desc + asc)", () => {
  const cus = book.filter((p) => p.subject_type === "credit_union");
  assert.deepEqual(queryProfiles(cus, { rank_by: "field_value", rank_field_key: "net_worth_ratio", dir: "desc" }).matched.map((p) => p.id), ["a", "c", "b"]); // 12,9,6
  assert.deepEqual(queryProfiles(cus, { rank_by: "field_value", rank_field_key: "net_worth_ratio", dir: "asc" }).matched.map((p) => p.id), ["b", "c", "a"]); // 6,9,12
});

test("query: rank by health / completeness / field_confidence branches", () => {
  // health: strong>adequate>thin. a,d strong; b,c adequate → desc [a,d,b,c] (id tiebreak).
  assert.deepEqual(rankProfiles(book, { rank_by: "health", dir: "desc" }).map((p) => p.id), ["a", "d", "b", "c"]);
  // completeness: a=1,d=1,b=0.5,c=0.4 → desc [a,d,b,c].
  assert.deepEqual(rankProfiles(book, { rank_by: "completeness", dir: "desc" }).map((p) => p.id), ["a", "d", "b", "c"]);
  // field_confidence: rank by a field's post-decay confidence.
  const set = [
    prof("hi", { fields: [fld("nw", 9, 0.9)] }),
    prof("lo", { fields: [fld("nw", 9, 0.3)] }),
    prof("none", { fields: [fld("other", 1, 0.99)] }), // missing the ranked field → sinks
  ];
  assert.deepEqual(rankProfiles(set, { rank_by: "field_confidence", rank_field_key: "nw", dir: "desc" }).map((p) => p.id), ["hi", "lo", "none"]);
});

test("query: field predicate accepts a NUMERIC-STRING threshold", () => {
  // A gte with a string "7" must still compare numerically (query params are strings).
  assert.equal(queryProfiles(book, { field: { key: "net_worth_ratio", op: "gte", value: "7" } }).total, 2); // a=12,c=9
  assert.equal(queryProfiles(book, { field: { key: "net_worth_ratio", op: "lt", value: "9" } }).total, 1); // b=6
});

test("query: a blank/whitespace field value is NOT numeric 0", () => {
  const blank = prof("blank", { fields: [fld("x", "  ")] }); // present but blank
  // Must NOT satisfy >=0 / ==0 (the Number('')===0 footgun).
  assert.ok(!matchesFieldPredicate(blank, { key: "x", op: "gte", value: 0 }));
  assert.ok(!matchesFieldPredicate(blank, { key: "x", op: "eq", value: 0 }));
  // And it sinks (not floats to 0) when ranking by field_value asc.
  const set = [prof("real", { fields: [fld("x", 5) ] }), blank];
  assert.deepEqual(rankProfiles(set, { rank_by: "field_value", rank_field_key: "x", dir: "asc" }).map((p) => p.id), ["real", "blank"]);
});

test("query: field-less profiles sink to the losing end in BOTH directions", () => {
  const withF = prof("withF", { fields: [fld("nw", 5)] });
  const noF = prof("noF", { fields: [fld("other", 1)] });
  // desc: withF first, noF last. asc: withF still first (noF must not float to top).
  assert.deepEqual(rankProfiles([noF, withF], { rank_by: "field_value", rank_field_key: "nw", dir: "desc" }).map((p) => p.id), ["withF", "noF"]);
  assert.deepEqual(rankProfiles([noF, withF], { rank_by: "field_value", rank_field_key: "nw", dir: "asc" }).map((p) => p.id), ["withF", "noF"]);
});

test("query: min_field_confidence filters a genuinely STALE live-assembled field (end-to-end)", () => {
  const AS_OF = "2026-07-22T00:00:00.000Z";
  const mk = (id, observed_at) => assembleLiveProfile({
    id, subject_ref: id, subject_type: "credit_union", display_name: id, as_of: AS_OF,
    fields: [{ key: "nw", label: "nw", value: 9, source_ref: "f:1", tier: "deterministic_calculation", confidence: 0.9, observed_at }],
  });
  const fresh = mk("fresh", AS_OF); // age 0 → conf ~0.9
  const stale = mk("stale", "2024-07-22T00:00:00.000Z"); // ~2 half-lives → conf ~0.225
  const r = queryProfiles([fresh, stale], { min_field_confidence: { key: "nw", min: 0.5 } });
  assert.deepEqual(r.matched.map((p) => p.id), ["fresh"], "the stale live field must fall below the floor and be filtered out");
});

test("query: stable total-order tiebreak on id when scores tie", () => {
  const tied = [prof("z", { confidence: 0.5 }), prof("m", { confidence: 0.5 }), prof("a", { confidence: 0.5 })];
  // desc: equal scores → id ascending regardless of direction.
  assert.deepEqual(rankProfiles(tied, { rank_by: "confidence", dir: "desc" }).map((p) => p.id), ["a", "m", "z"]);
  assert.deepEqual(rankProfiles(tied, { rank_by: "confidence", dir: "asc" }).map((p) => p.id), ["a", "m", "z"]);
});

test("query: limit caps matched but total reports the full count", () => {
  const r = queryProfiles(book, { rank_by: "confidence", dir: "desc", limit: 2 });
  assert.equal(r.matched.length, 2);
  assert.equal(r.total, 4);
  assert.deepEqual(r.matched.map((p) => p.id), ["d", "a"]);
});

test("query: lookupField finds a field or returns null", () => {
  assert.equal(lookupField(book[0], "net_worth_ratio").value, 12.0);
  assert.equal(lookupField(book[0], "nonexistent"), null);
});

test("query: empty input and deterministic", () => {
  assert.deepEqual(queryProfiles([], { min_confidence: 0.5 }).matched, []);
  const q = { subject_type: "credit_union", field: { key: "net_worth_ratio", op: "gte", value: 7 }, rank_by: "field_value", rank_field_key: "net_worth_ratio", dir: "desc" };
  assert.deepEqual(queryProfiles(book, q), queryProfiles(book, q));
});
