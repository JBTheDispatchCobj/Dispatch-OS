// cartridges/cooperative_markets/batch_fixtures.ts
//
// Cooperative Markets — ILLUSTRATIVE 5300 BATCH fixtures for the batch ingest path.
//
// ⚠️ FIXTURES, NOT REAL FILINGS. Every payload below is hand-authored illustrative
// data used to exercise the batch call-report path (`ingest_batch.ts`) end to end.
// The repo carries REGULATORY data (eCFR / Federal Register), but it does NOT carry
// per-institution 5300 financial figures — a real NCUA 5300 connector is a deferred,
// Bryan-only item. Until that connector lands, these numbers stand in for it. They are
// deliberately realistic and internally consistent so downstream profiles differ, but
// NONE of them is a real credit-union filing and none may be presented as one. Do not
// cite these figures as fact about any real institution.
//
// Charter 60441 / "Summit Ridge FCU" mirrors the golden fixture in
// `pipeline_fixtures.ts` (same 5300 shape + source_ref) so the golden institution
// appears in the batch. The other six are additional illustrative credit unions with
// varied capital, earnings, and growth profiles.
//
// PURE DATA. Deterministic. No clock, no randomness, no I/O — a plain static array.
// Each payload stamps its own `period` and `source_ref` (a `sourcedoc:ncua:5300:*`
// truth-object id) so lineage is unbroken once ingested. isolatedModules-friendly:
// type-only import via `import type`; ES2022; alias "@/*".

import type { CallReportInput } from "@/cartridges/cooperative_markets/ingest_call_report";

/** All fixtures report the same illustrative quarter (deterministic — no clock). */
const PERIOD = "2026-Q1";

/** Build the `sourcedoc:ncua:5300:<slug>:2026Q1` truth-object ref for a fixture filing. */
function sourceRef(slug: string): string {
  return `sourcedoc:ncua:5300:${slug}:2026Q1`;
}

/**
 * ILLUSTRATIVE batch of ~7 credit-union 5300 payloads (FIXTURES pending a real NCUA
 * 5300 connector — NOT real filings; see file header). Every figure is native-unit as
 * a real 5300 would report (dollars, member counts) and internally consistent
 * (net_worth < total_assets, delinquent_loans < total_loans, etc.). The derived ratios
 * span a realistic range so downstream assembled profiles differ:
 *   net-worth ratio ~6.2%–12.0% | ROA ~-0.3%–1.2% | loan-to-share ~63%–95%
 *   delinquency ~0.3%–2.5%      | member growth ~-2.0%–8.3%
 */
export function institutionBatchFixtures(): CallReportInput[] {
  return [
    // 1) Summit Ridge FCU — the GOLDEN institution. Well-capitalized, growing. Mirrors
    //    the `summit5300` fixture in pipeline_fixtures.ts exactly (charter 60441).
    //    → NWR 9.0% | ROA ~0.81% | L/S ~72% | delinq ~0.5% | growth ~6.0%
    {
      input_type: "ncua_5300_call_report",
      raw: {
        charter_number: "60441",
        institution: "Summit Ridge FCU",
        period: PERIOD,
        total_assets: 850_000_000,
        net_worth: 76_500_000,
        total_loans: 520_000_000,
        total_shares: 720_000_000,
        net_income: 6_800_000,
        average_assets: 840_000_000,
        delinquent_loans: 2_600_000,
        members: 62_000,
        members_prior: 58_500,
        digital_adoption: 0.71,
        source_ref: sourceRef("summit_ridge"),
      },
    },

    // 2) Cascade Point CU — large, strongly capitalized, fastest grower in the batch.
    //    → NWR ~11.5% | ROA ~1.2% | L/S ~85% | delinq ~0.4% | growth ~8.25%
    {
      input_type: "ncua_5300_call_report",
      raw: {
        charter_number: "12007",
        institution: "Cascade Point CU",
        period: PERIOD,
        total_assets: 1_400_000_000,
        net_worth: 161_000_000,
        total_loans: 977_500_000,
        total_shares: 1_150_000_000,
        net_income: 16_560_000,
        average_assets: 1_380_000_000,
        delinquent_loans: 3_910_000,
        members: 210_000,
        members_prior: 194_000,
        digital_adoption: 0.8,
        source_ref: sourceRef("cascade_point"),
      },
    },

    // 3) Prairie State CU — mid-size, comfortably capitalized, moderate growth.
    //    → NWR ~10.2% | ROA ~0.95% | L/S ~78% | delinq ~0.6% | growth ~4.5%
    {
      input_type: "ncua_5300_call_report",
      raw: {
        charter_number: "23418",
        institution: "Prairie State CU",
        period: PERIOD,
        total_assets: 500_000_000,
        net_worth: 51_000_000,
        total_loans: 335_400_000,
        total_shares: 430_000_000,
        net_income: 4_702_500,
        average_assets: 495_000_000,
        delinquent_loans: 2_012_400,
        members: 74_000,
        members_prior: 70_800,
        digital_adoption: 0.62,
        source_ref: sourceRef("prairie_state"),
      },
    },

    // 4) Riverbend Community CU — THINNER capital (near the PCA well-capitalized line),
    //    thin earnings, high loan-to-share. A more constrained profile.
    //    → NWR ~6.2% | ROA ~0.15% | L/S ~90% | delinq ~1.4% | growth ~1.0%
    {
      input_type: "ncua_5300_call_report",
      raw: {
        charter_number: "34992",
        institution: "Riverbend Community CU",
        period: PERIOD,
        total_assets: 300_000_000,
        net_worth: 18_600_000,
        total_loans: 234_000_000,
        total_shares: 260_000_000,
        net_income: 447_000,
        average_assets: 298_000_000,
        delinquent_loans: 3_276_000,
        members: 41_000,
        members_prior: 40_600,
        digital_adoption: 0.45,
        source_ref: sourceRef("riverbend_community"),
      },
    },

    // 5) Ironwood Municipal CU — HIGH delinquency, slightly NEGATIVE earnings, shrinking
    //    membership. The stressed profile in the batch.
    //    → NWR ~7.5% | ROA ~-0.3% | L/S ~95% | delinq ~2.5% | growth ~-2.0%
    {
      input_type: "ncua_5300_call_report",
      raw: {
        charter_number: "45120",
        institution: "Ironwood Municipal CU",
        period: PERIOD,
        total_assets: 180_000_000,
        net_worth: 13_500_000,
        total_loans: 142_500_000,
        total_shares: 150_000_000,
        net_income: -543_000,
        average_assets: 181_000_000,
        delinquent_loans: 3_562_500,
        members: 28_500,
        members_prior: 29_080,
        digital_adoption: 0.38,
        source_ref: sourceRef("ironwood_municipal"),
      },
    },

    // 6) Goldenfield National CU — the LARGEST in the batch; very well-capitalized,
    //    conservative loan-to-share, pristine delinquency, steady growth.
    //    → NWR ~12.0% | ROA ~1.1% | L/S ~68% | delinq ~0.3% | growth ~5.5%
    {
      input_type: "ncua_5300_call_report",
      raw: {
        charter_number: "50883",
        institution: "Goldenfield National CU",
        period: PERIOD,
        total_assets: 3_200_000_000,
        net_worth: 384_000_000,
        total_loans: 1_768_000_000,
        total_shares: 2_600_000_000,
        net_income: 34_650_000,
        average_assets: 3_150_000_000,
        delinquent_loans: 5_304_000,
        members: 410_000,
        members_prior: 388_600,
        digital_adoption: 0.83,
        source_ref: sourceRef("goldenfield_national"),
      },
    },

    // 7) Little Harbor CU — the SMALLEST in the batch; solid capital, low loan-to-share,
    //    modest earnings and growth. A community-scale profile.
    //    → NWR ~8.3% | ROA ~0.55% | L/S ~63% | delinq ~0.9% | growth ~2.5%
    {
      input_type: "ncua_5300_call_report",
      raw: {
        charter_number: "61574",
        institution: "Little Harbor CU",
        period: PERIOD,
        total_assets: 45_000_000,
        net_worth: 3_735_000,
        total_loans: 25_200_000,
        total_shares: 40_000_000,
        net_income: 244_750,
        average_assets: 44_500_000,
        delinquent_loans: 226_800,
        members: 6_100,
        members_prior: 5_951,
        digital_adoption: 0.4,
        source_ref: sourceRef("little_harbor"),
      },
    },
  ];
}
