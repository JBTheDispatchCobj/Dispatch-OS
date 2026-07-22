// tests/connector_sdk.test.mjs — Connector SDK + output contract (RFC-2011):
// pure builders with teeth. Deterministic hashing, change detection (new/updated/
// deleted/unchanged), quality report (completeness/dupes/rejections no silent
// drop), health bands, and the normalize→Observation bridge (tier FROM SOURCE).
import { test } from "node:test";
import assert from "node:assert/strict";
import { register } from "node:module";
register("../scripts/alias-hook.mjs", import.meta.url);

const sdk = await import("@/core/kernel/connector_sdk");
const {
  canonicalHash, stableStringify, recordHash, detectChanges, tallyChanges,
  buildQualityReport, deriveHealth, recordToObservation, artifactToSourceDocument,
} = sdk;

const rec = (external_ref, value, extra = {}) => ({ external_ref, value, ...extra });

const SOURCE = {
  key: "source:test", label: "Test source", version: 1, status: "active",
  authority: "regulatory", default_plane: "shared_market", default_visibility: "public",
  default_tier: "public_fact", publisher: "Test Publisher", attribution_required: true,
};

// ---- deterministic hashing --------------------------------------------------
test("canonicalHash is deterministic + key-order independent", () => {
  const a = canonicalHash({ a: 1, b: [2, 3], c: { d: 4 } });
  const b = canonicalHash({ c: { d: 4 }, b: [2, 3], a: 1 });
  assert.equal(a, b, "sorted-key hashing ignores insertion order");
  assert.equal(a, canonicalHash({ a: 1, b: [2, 3], c: { d: 4 } }), "stable across calls");
  assert.notEqual(a, canonicalHash({ a: 1, b: [2, 3], c: { d: 5 } }), "a changed value changes the hash");
  assert.match(a, /^[0-9a-f]{8}$/, "8-hex FNV fingerprint");
});

test("stableStringify sorts nested keys", () => {
  assert.equal(stableStringify({ b: 1, a: 2 }), '{"a":2,"b":1}');
});

test("recordHash ignores metadata but tracks value/validity", () => {
  const base = rec("x", { v: 1 }, { subject_ref: "s", metadata: { note: "one" } });
  const metaOnly = rec("x", { v: 1 }, { subject_ref: "s", metadata: { note: "TWO" } });
  const valueChanged = rec("x", { v: 2 }, { subject_ref: "s" });
  assert.equal(recordHash(base), recordHash(metaOnly), "metadata change is not a content change");
  assert.notEqual(recordHash(base), recordHash(valueChanged), "value change IS a content change");
});

// ---- change detection -------------------------------------------------------
test("detectChanges classifies new/updated/unchanged/deleted", () => {
  const prior = new Map([
    ["keep", recordHash(rec("keep", { v: 1 }))],
    ["change", recordHash(rec("change", { v: 1 }))],
    ["gone", "deadbeef"],
  ]);
  const current = [rec("keep", { v: 1 }), rec("change", { v: 2 }), rec("brand_new", { v: 9 })];
  const events = detectChanges(current, prior);
  const byRef = Object.fromEntries(events.map((e) => [e.external_ref, e.kind]));
  assert.equal(byRef.keep, "unchanged");
  assert.equal(byRef.change, "updated");
  assert.equal(byRef.brand_new, "new");
  assert.equal(byRef.gone, "deleted", "a prior ref absent now is a deletion");
  const deleted = events.find((e) => e.kind === "deleted");
  assert.equal(deleted.content_hash, "", "a deletion has no current hash");
  const t = tallyChanges(events);
  assert.deepEqual(t, { new: 1, updated: 1, deleted: 1, unchanged: 1 });
});

test("detectChanges with no prior state = everything new", () => {
  const events = detectChanges([rec("a", { v: 1 }), rec("b", { v: 2 })], undefined);
  assert.deepEqual(tallyChanges(events), { new: 2, updated: 0, deleted: 0, unchanged: 0 });
});

test("detectChanges never fabricates a deletion for a ref that was SEEN but unparsed", () => {
  const prior = new Map([["a", recordHash(rec("a", { v: 1 }))], ["b", "oldhash"]]);
  // "b" was seen at the source this run but failed to normalize (alsoPresentRefs).
  const events = detectChanges([rec("a", { v: 1 })], prior, ["b"]);
  assert.equal(tallyChanges(events).deleted, 0, "a seen-but-unparsed ref is present, not deleted");
  // Without the guard, "b" WOULD be a deletion — prove the guard is load-bearing.
  assert.equal(tallyChanges(detectChanges([rec("a", { v: 1 })], prior)).deleted, 1, "absent (not seen) → a real deletion");
});

// ---- quality report ---------------------------------------------------------
test("buildQualityReport reports completeness, dupes, rejections (no silent drop)", () => {
  const records = [rec("a", { v: 1 }), rec("b", { v: 2 }), rec("a", { v: 3 })];
  const rejections = [{ external_ref: "c", reason: "malformed" }];
  const q = buildQualityReport(records, rejections, 4);
  assert.equal(q.total_records, 4);
  assert.equal(q.parsed_records, 3);
  assert.equal(q.rejected_records, 1);
  assert.deepEqual(q.duplicate_refs, ["a"], "a repeated external_ref is surfaced");
  assert.equal(q.completeness, 0.75, "parsed/total");
  assert.equal(buildQualityReport([], [], 0).completeness, 1, "nothing to fault → 1");
});

// ---- health bands -----------------------------------------------------------
test("deriveHealth bands by success rate + failure/circuit signals", () => {
  assert.equal(deriveHealth(1, 0, false).state, "healthy");
  assert.equal(deriveHealth(0.95, 0, false).state, "warning");
  assert.equal(deriveHealth(0.5, 0, false).state, "degraded");
  assert.equal(deriveHealth(0, 0, false).state, "offline");
  assert.equal(deriveHealth(1, 1, true).state, "offline", "a run failure is offline regardless of rate");
  assert.equal(deriveHealth(1, 9, false, true).reason, "circuit_open", "an open circuit is reported");
});

// ---- normalize → Observation (tier/plane from SOURCE, not the connector) -----
test("recordToObservation tiers from the source manifest + stamps connector provenance", () => {
  const r = rec("ext:1", { net_worth: 100 }, { subject_ref: "cu:1", subject_type: "credit_union", predicate: "call_report", valid_from: "2026-03-31T00:00:00.000Z" });
  const obs = recordToObservation(r, SOURCE, { id: "obs:1", observed_at: "2026-07-22T00:00:00.000Z", asserted_by: "system", source_document_ids: ["doc:1"] });
  assert.equal(obs.tier, "public_fact", "tier comes from source.default_tier");
  assert.equal(obs.plane, "shared_market");
  assert.equal(obs.visibility, "public");
  assert.equal(obs.truth_kind, "observation");
  assert.equal(obs.provenance.method, "connector_sync", "connector provenance");
  assert.deepEqual(obs.provenance.source_ids, ["source:test"]);
  assert.deepEqual(obs.provenance.source_document_ids, ["doc:1"]);
  assert.equal(obs.temporal.valid_from, "2026-03-31T00:00:00.000Z", "valid-time from the record");
  assert.equal(obs.status, "active");
});

test("tier/plane/visibility are READ FROM the source — a different source yields different values", () => {
  // A second source with a DIFFERENT tier/plane/visibility proves the mapping is
  // not hardcoded: recordToObservation must reflect THIS manifest, not a constant.
  const privateSource = {
    key: "source:tenant", label: "Tenant source", version: 1, status: "active",
    authority: "institution_official", default_plane: "private_terminal",
    default_visibility: "tenant_private", default_tier: "private_tenant_fact", trust_score: 0.7,
  };
  const r = rec("ext:2", { x: 1 });
  const obs = recordToObservation(r, privateSource, { id: "o", observed_at: "2026-07-22T00:00:00.000Z", asserted_by: "system" });
  assert.equal(obs.tier, "private_tenant_fact", "tier flows from THIS source, not a constant");
  assert.equal(obs.plane, "private_terminal");
  assert.equal(obs.visibility, "tenant_private");
  assert.equal(obs.provenance.confidence, 0.7, "the source trust_score flows through");
  // Contrast against the public source to prove the values actually differ.
  const pub = recordToObservation(r, SOURCE, { id: "o2", observed_at: "2026-07-22T00:00:00.000Z", asserted_by: "system" });
  assert.notEqual(obs.tier, pub.tier, "two sources → two tiers (the value is not hardcoded)");
  assert.notEqual(obs.plane, pub.plane);
});

test("artifactToSourceDocument carries attribution when the source requires it", () => {
  const doc = artifactToSourceDocument(
    { external_ref: "a1", title: "T", content_type: "text/xml", raw_text: "hello" },
    SOURCE,
    { id: "doc:1", retrieved_at: "2026-07-22T00:00:00.000Z" },
  );
  assert.equal(doc.attribution, "Test Publisher", "attribution_required → publisher on the doc");
  assert.equal(doc.plane, "shared_market");
  assert.equal(doc.content_hash, canonicalHash("hello"), "inline text is fingerprinted");
});
