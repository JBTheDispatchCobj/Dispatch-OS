// tests/ncua_connectors.test.mjs — the concrete Cooperative Markets connectors
// run THROUGH the runtime: normalize-only (no ratios in the connector), persisted
// 5300 profiles reconcile to source, tier from the source manifest, determinism.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { register } from "node:module";
register("../scripts/alias-hook.mjs", import.meta.url);

const { parse5300, periodValidFrom } = await import("@/cartridges/cooperative_markets/connectors/ncua_5300_connector");
const { parseRegulation } = await import("@/cartridges/cooperative_markets/connectors/ncua_regulations_connector");
const { runNcua5300, runNcuaRegulations } = await import("@/cartridges/cooperative_markets/run_connectors");
const { institutionBatchFixtures } = await import("@/cartridges/cooperative_markets/batch_fixtures");

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const AS_OF = "2026-07-22T00:00:00.000Z";

// ---- the 5300 connector NORMALIZES only (no business logic / no ratios) ------
test("parse5300 normalizes the as-reported figures, not computed ratios", () => {
  const raw = institutionBatchFixtures()[0].raw;
  const rec = parse5300(raw);
  assert.equal(rec.external_ref, raw.source_ref, "the filing ref is the change-detection key");
  assert.equal(rec.subject_type, "credit_union");
  assert.equal(rec.value.total_assets, raw.total_assets, "reports raw figures verbatim");
  assert.equal(rec.value.net_worth_ratio, undefined, "no ratio: that is a downstream calc, not the connector's job");
  assert.equal(rec.entity_candidates[0].external_ids[0].value, raw.charter_number, "charter as an entity id");
  assert.equal(rec.valid_from, "2026-03-31T00:00:00.000Z", "Q1 → quarter-end valid-time");
});

test("periodValidFrom maps quarters to quarter-ends", () => {
  assert.equal(periodValidFrom("2026-Q2"), "2026-06-30T00:00:00.000Z");
  assert.equal(periodValidFrom("garbage"), null);
});

// ---- 5300 through the runtime → persisted profiles reconcile to source -------
test("runNcua5300 persists live profiles that reconcile to the connector source refs", async () => {
  const batch = institutionBatchFixtures().map((i) => i.raw);
  const r = await runNcua5300(batch, { as_of: AS_OF });
  assert.equal(r.output.status, "success");
  assert.equal(r.output.observations.length, batch.length, "one normalized record per institution");
  assert.equal(r.persisted.length, batch.length, "one persisted profile per institution");
  assert.equal(r.reconciliation.reconciled, true, "every persisted profile field traces to a connector source ref");
  assert.ok(r.reconciliation.profile_source_refs.length >= batch.length, "reconciliation is non-vacuous: source refs actually present (not an empty .every())");
  // the persisted scope is plane-aware (shared-market public), never conflated
  assert.equal(r.persisted[0].scope.plane, "shared_market");
  assert.equal(r.persisted[0].scope.visibility, "public");
  // tier comes from the SOURCE manifest, not the connector
  assert.equal(r.observations[0].tier, "public_fact");
  assert.equal(r.observations[0].provenance.method, "connector_sync");
});

test("runNcua5300 is deterministic", async () => {
  const batch = institutionBatchFixtures().map((i) => i.raw);
  const a = await runNcua5300(batch, { as_of: AS_OF });
  const b = await runNcua5300(batch, { as_of: AS_OF });
  assert.equal(JSON.stringify(a.output), JSON.stringify(b.output));
  assert.equal(JSON.stringify(a.persisted), JSON.stringify(b.persisted), "persisted profiles are byte-identical run to run");
});

// ---- the regulations connector over the REAL corpus at scale ----------------
test("parseRegulation normalizes a section with a body fingerprint (not the full text)", () => {
  const rec = parseRegulation({ part: "700", part_title: "Definitions", section: "700.2", title: "Definitions", node_type: "section", cfr_ref: "12 CFR 700.2", body_text: "The terms used..." }, "2026-07-15");
  assert.equal(rec.external_ref, "12 CFR 700.2", "cfr_ref is the key");
  assert.equal(rec.subject_type, "regulation");
  assert.equal(rec.value.body_len, "The terms used...".length, "fingerprints length");
  assert.match(rec.value.body_hash, /^[0-9a-f]{8}$/, "and a content hash for exact change detection");
  assert.equal(rec.value.body_text, undefined, "the full text is not inlined into the record");
  assert.equal(rec.valid_from, "2026-07-15T00:00:00.000Z", "valid-time = eCFR issue date");
});

test("runNcuaRegulations normalizes the REAL 675-section corpus at scale", async () => {
  const regs = JSON.parse(fs.readFileSync(path.join(root, "docs/04_sources/ncua/ncua_regulations_clean.json"), "utf8"));
  const r = await runNcuaRegulations(regs, "2026-07-15", { as_of: AS_OF });
  assert.equal(r.output.status, "success");
  assert.equal(r.output.observations.length, regs.length, "every section normalized");
  assert.ok(regs.length >= 600, "the corpus is genuinely at scale");
  assert.equal(r.output.metrics.artifacts_captured, 1, "one bulk-pull artifact captured");
  assert.equal(r.observations[0].tier, "public_fact", "tier from the source manifest");
});
