// tests/institutions_directory.test.mjs — the INSTITUTIONS DIRECTORY (Sprint IV Wave 1).
// The /institutions view-model itemizes the full-market profiles into a browsable
// directory (search / filter / sort in the client). Every figure is LABELED synthetic
// (computed from the data, not asserted), profile confidence is an INFERENCE, and
// REGION is MISSING (shown, never faked). Deterministic given as_of + size.
import { test } from "node:test";
import assert from "node:assert/strict";
import { register } from "node:module";
register("../scripts/alias-hook.mjs", import.meta.url);

const {
  runInstitutionsDirectory,
  buildDirectoryVM,
  queryDirectory,
  readinessBand,
  assetBand,
  terminalHref,
} = await import("@/cartridges/cooperative_markets/run_institutions_directory");
const { bulkMarket5300 } = await import("@/cartridges/cooperative_markets/bulk_5300_market");

const AS_OF = "2026-07-22T00:00:00.000Z";

test("itemizes the FULL market (one row per institution) with the row contract", () => {
  const vm = runInstitutionsDirectory({ as_of: AS_OF, market_size: 120 });
  assert.equal(vm.rows.length, 120, "every institution is itemized (scales one→thousands)");
  assert.equal(vm.market.size, 120);
  const r = vm.rows[0];
  for (const k of ["name", "charter", "net_worth_ratio", "roa", "profileConfidence", "readiness", "assetBand", "source_ref", "terminal_href"]) {
    assert.ok(k in r, `row carries ${k}`);
  }
  assert.equal(r.terminal_href, terminalHref(r.charter), "each row opens its institution Terminal");
});

test("every figure is LABELED synthetic/illustrative (meaningful direction, not a tautology)", () => {
  const vm = runInstitutionsDirectory({ as_of: AS_OF, market_size: 120 });
  assert.equal(vm.market.allLabeled, true, "no unlabeled/real-looking record present");
  assert.equal(vm.market.synthetic + vm.market.illustrative, vm.rows.length, "every row is labeled one or the other");
  // meaningful direction: the :synthetic: refs count EQUALS market.synthetic, and golden rows do NOT carry the segment
  assert.equal(vm.rows.filter((r) => r.source_ref.includes(":synthetic:")).length, vm.market.synthetic, ":synthetic: ref count == market.synthetic");
  const golden = vm.rows.filter((r) => r.label === "illustrative");
  assert.ok(golden.length === vm.market.illustrative && golden.every((r) => !r.source_ref.includes(":synthetic:")), "illustrative golden rows never carry the :synthetic: segment");
});

test("NEGATIVE labeling driven through the REAL builder: an unlabeled record flips all_labeled + is flagged row-by-row", () => {
  // Take a real synthetic filing and strip its label to a real-looking ref, then run
  // it through the ACTUAL labeling path (buildDirectoryVM), not an inline re-impl.
  const synth = bulkMarket5300({ size: 8 }).find((i) => i.raw.source_ref.includes(":synthetic:"));
  const smuggled = { input_type: synth.input_type, raw: { ...synth.raw, charter_number: "999999", source_ref: "sourcedoc:real:leak:2026Q1" } };
  const vm = buildDirectoryVM([smuggled], { as_of: AS_OF });
  assert.equal(vm.market.allLabeled, false, "a non-synthetic, non-golden record flips all_labeled FALSE");
  assert.equal(vm.market.unlabeled, 1, "the unknown-provenance record is counted unlabeled");
  assert.equal(vm.rows[0].label, "unlabeled", "the row is flagged untrusted row-by-row (never a benign 'illustrative')");
  assert.equal(vm.rows[0].synthetic, false);
});

test("REGION is MISSING (shown, never faked) and confidence is an inference", () => {
  const vm = runInstitutionsDirectory({ as_of: AS_OF, market_size: 60 });
  assert.equal(vm.market.regionMissing, true, "no row carries a sourced region");
  assert.ok(vm.rows.every((r) => r.region === null), "region is null (missing), never fabricated");
  assert.ok(vm.rows.every((r) => typeof r.profileConfidence === "number" && r.profileConfidence >= 0 && r.profileConfidence <= 1), "confidence is a bounded inference");
});

test("readiness + asset bands are PCA/size aligned (deterministic buckets)", () => {
  assert.equal(readinessBand(9), "well_capitalized");
  assert.equal(readinessBand(6.5), "adequate");
  assert.equal(readinessBand(5), "undercapitalized");
  assert.equal(assetBand(10_000_000), "under_50m");
  assert.equal(assetBand(100_000_000), "50m_250m");
  assert.equal(assetBand(500_000_000), "250m_1b");
  assert.equal(assetBand(2_000_000_000), "over_1b");
});

test("queryDirectory filters by search / readiness / asset-band / label", () => {
  const vm = runInstitutionsDirectory({ as_of: AS_OF, market_size: 200 });
  const well = queryDirectory(vm.rows, { readiness: "well_capitalized" });
  assert.ok(well.length > 0 && well.every((r) => r.readiness === "well_capitalized"), "readiness filter keeps only matches");
  const big = queryDirectory(vm.rows, { assetBand: "over_1b" });
  assert.ok(big.length > 0 && big.every((r) => r.assetBand === "over_1b"), "asset-band filter keeps only (some) matches");
  const syn = queryDirectory(vm.rows, { label: "synthetic" });
  assert.ok(syn.length > 0 && syn.every((r) => r.label === "synthetic"), "label filter keeps only (some) matches");
  // search on a golden fixture name (golden head is always present)
  const golden = vm.rows.find((r) => r.label === "illustrative");
  const hit = queryDirectory(vm.rows, { search: golden.name.slice(0, 4) });
  assert.ok(hit.some((r) => r.charter === golden.charter), "search matches by name substring");
  const byCharter = queryDirectory(vm.rows, { search: golden.charter });
  assert.ok(byCharter.some((r) => r.charter === golden.charter), "search matches by charter");
});

test("sort is a TOTAL order (charter tiebreak) and direction-aware", () => {
  const vm = runInstitutionsDirectory({ as_of: AS_OF, market_size: 200 });
  const desc = queryDirectory(vm.rows, { sortBy: "net_worth", sortDir: "desc" });
  for (let i = 1; i < desc.length; i++) {
    assert.ok(
      desc[i - 1].net_worth_ratio > desc[i].net_worth_ratio ||
        (desc[i - 1].net_worth_ratio === desc[i].net_worth_ratio && desc[i - 1].charter <= desc[i].charter),
      "descending net-worth with charter tiebreak",
    );
  }
  const asc = queryDirectory(vm.rows, { sortBy: "assets", sortDir: "asc" });
  for (let i = 1; i < asc.length; i++) assert.ok(asc[i - 1].total_assets <= asc[i].total_assets, "ascending assets");
  // teeth: sort does not mutate the input
  const before = vm.rows.map((r) => r.charter).join(",");
  queryDirectory(vm.rows, { sortBy: "roa", sortDir: "asc" });
  assert.equal(vm.rows.map((r) => r.charter).join(","), before, "queryDirectory does not mutate its input");
});

test("the charter tiebreak is EXERCISED: rows with equal sort keys order by charter (total order)", () => {
  // Construct rows with DELIBERATELY equal net_worth_ratio so the tiebreak branch runs
  // (the synthetic market has no ratio ties, so this forces the equal-key comparator).
  const row = (charter, nwr) => ({
    name: `CU ${charter}`, charter, period: "2026-Q1", total_assets: 1e8, members: 1000,
    net_worth_ratio: nwr, roa: 0.5, loan_to_share: 70, delinquency_ratio: 0.4, member_growth: 1,
    profileConfidence: 0.9, readiness: "well_capitalized", assetBand: "50m_250m", region: null,
    label: "synthetic", synthetic: true, source_ref: `s:${charter}`, terminal_href: `/terminal?charter=${charter}`,
  });
  const rows = [row("300", 8), row("100", 8), row("200", 8)];
  const desc = queryDirectory(rows, { sortBy: "net_worth", sortDir: "desc" });
  assert.deepEqual(desc.map((r) => r.charter), ["100", "200", "300"], "equal keys break ties by ascending charter (desc)");
  const asc = queryDirectory(rows, { sortBy: "net_worth", sortDir: "asc" });
  assert.deepEqual(asc.map((r) => r.charter), ["100", "200", "300"], "tiebreak is charter-ascending regardless of direction (stable total order)");
});

test("DETERMINISTIC: same as_of + size → byte-identical VM", () => {
  const a = runInstitutionsDirectory({ as_of: AS_OF, market_size: 150 });
  const b = runInstitutionsDirectory({ as_of: AS_OF, market_size: 150 });
  assert.equal(JSON.stringify(a), JSON.stringify(b), "the directory is deterministic");
});
