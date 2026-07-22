// tests/bulk_5300_market.test.mjs — the FULL-MARKET 5300 scale path (Sprint III Wave 2):
// a labeled synthetic market runs through the UNCHANGED 5300 connector/runtime →
// PERSISTED plane-aware profiles reconcile to source, at scale, deterministically.
import { test } from "node:test";
import assert from "node:assert/strict";
import { register } from "node:module";
register("../scripts/alias-hook.mjs", import.meta.url);

const {
  bulkMarket5300,
  bulkMarketRaw,
  syntheticFiling,
  syntheticSourceRef,
  marketProvenance,
  DEFAULT_MARKET_SIZE,
  SYNTHETIC_SOURCE_SEGMENT,
} = await import("@/cartridges/cooperative_markets/bulk_5300_market");
const { ingestFullMarket } = await import("@/cartridges/cooperative_markets/run_market_ingest");
const { institutionBatchFixtures } = await import("@/cartridges/cooperative_markets/batch_fixtures");

const AS_OF = "2026-07-22T00:00:00.000Z";

// ---- the market is LABELED, deterministic, and internally consistent ----------
test("bulkMarket5300 composes the golden subset + labeled synthetic filings", () => {
  const m = bulkMarket5300({ size: 40 });
  assert.equal(m.length, 40, "market is exactly `size`");
  const golden = institutionBatchFixtures();
  assert.equal(m[0].raw.source_ref, golden[0].raw.source_ref, "the golden subset is composed at the head (batch_fixtures retired behind the connector)");
  const prov = marketProvenance(m);
  assert.equal(prov.golden, golden.length, "the 7 golden fixtures are counted as golden");
  assert.equal(prov.synthetic, 40 - golden.length, "the remainder is labeled synthetic");
  assert.equal(prov.total, 40);
});

test("every synthetic filing is LABELED synthetic and never mistaken for a real filing", () => {
  const f = syntheticFiling(3);
  assert.ok(f.source_ref.includes(`:${SYNTHETIC_SOURCE_SEGMENT}:`), "the source_ref carries the synthetic label segment");
  assert.equal(f.source_ref, syntheticSourceRef(f.charter_number));
  // charters start at 70000 so they never collide with the golden fixtures (12007, ...)
  assert.ok(Number(f.charter_number) >= 70000, "synthetic charters are namespaced away from the fixtures");
});

test("marketProvenance.all_labeled has TEETH — it catches an unlabeled (real-looking) filing", () => {
  const clean = bulkMarket5300({ size: 12 });
  assert.equal(marketProvenance(clean).all_labeled, true, "a clean market is fully labeled");
  const tampered = clean.map((i, idx) =>
    idx === 11 ? { ...i, raw: { ...i.raw, source_ref: "sourcedoc:ncua:5300:UNLABELED:2026Q1" } } : i);
  assert.equal(marketProvenance(tampered).all_labeled, false, "an unlabeled filing (neither :synthetic: nor a known golden fixture) flips all_labeled false");
});

test("synthetic figures are internally consistent (so ratios land in real bands)", () => {
  for (let i = 0; i < 200; i++) {
    const f = syntheticFiling(i);
    assert.ok(f.net_worth < f.total_assets, `nw<assets @${i}`);
    assert.ok(f.total_shares < f.total_assets, `shares<assets @${i}`);
    assert.ok(f.delinquent_loans < f.total_loans, `delinq<loans @${i}`);
    assert.ok(f.members > 0 && f.members_prior > 0, `members>0 @${i}`);
    assert.ok(f.total_assets > 0 && f.net_worth > 0, `positive figures @${i}`);
  }
});

test("the market is deterministic — the same size yields the same filings", () => {
  assert.equal(JSON.stringify(bulkMarket5300({ size: 30 })), JSON.stringify(bulkMarket5300({ size: 30 })), "same size → identical market");
  assert.equal(JSON.stringify(syntheticFiling(7)), JSON.stringify(syntheticFiling(7)), "one synthetic filing is stable");
  assert.notEqual(JSON.stringify(syntheticFiling(7)), JSON.stringify(syntheticFiling(8)), "different index → different filing (real variety)");
});

test("charters are unique across the whole market (no dupes at scale)", () => {
  const raw = bulkMarketRaw({ size: DEFAULT_MARKET_SIZE });
  const charters = raw.map((r) => r.charter_number);
  assert.equal(new Set(charters).size, charters.length, "no duplicate charter across the market");
  const refs = raw.map((r) => r.source_ref);
  assert.equal(new Set(refs).size, refs.length, "no duplicate source_ref across the market");
});

// ---- the whole market ingests at scale → persisted profiles reconcile to source
test("ingestFullMarket runs the WHOLE market through the connector → persisted profiles reconcile", async () => {
  const r = await ingestFullMarket({ as_of: AS_OF, market: { size: 120 } });
  assert.equal(r.market_size, 120);
  assert.equal(r.output.status, "success", "a full-market run normalizes cleanly");
  assert.equal(r.output.observations.length, 120, "one normalized record per institution");
  assert.equal(r.persisted.length, 120, "one persisted profile per institution, at scale");
  assert.equal(r.reconciliation.reconciled, true, "every persisted profile field traces to a connector source ref (at scale)");
  assert.ok(r.reconciliation.profile_source_refs.length >= 120, "reconciliation is non-vacuous (source refs present, not an empty .every())");
  assert.equal(r.persisted[0].scope.plane, "shared_market", "plane-aware persistence, never conflated");
  assert.equal(r.persisted[0].scope.visibility, "public");
  assert.equal(r.observations[0].tier, "public_fact", "tier from the source manifest, not the connector");
  assert.equal(r.health_state, "healthy", "a clean scale run stays healthy");
});

test("full-market ingestion is deterministic", async () => {
  const a = await ingestFullMarket({ as_of: AS_OF, market: { size: 60 } });
  const b = await ingestFullMarket({ as_of: AS_OF, market: { size: 60 } });
  assert.equal(JSON.stringify(a.output), JSON.stringify(b.output), "the wired market run is byte-identical across runs");
});

test("ratios remain a downstream deterministic_calculation, never a conclusion in a weight", async () => {
  const r = await ingestFullMarket({ as_of: AS_OF, market: { size: 20 } });
  // the connector's normalized record carries NO ratio — only as-reported figures
  assert.equal(r.output.observations[0].value.net_worth_ratio, undefined, "the connector never emits a ratio");
  assert.ok("total_assets" in r.output.observations[0].value, "it emits the as-reported figures");
  // the persisted profile's fields are deterministic_calculation, citing the filing
  const f0 = r.persisted[0].profile.fields[0];
  assert.equal(f0.tier, "deterministic_calculation", "the ratio is a downstream deterministic calc");
});
