// cartridges/cooperative_markets/bulk_5300_market.ts
//
// Cooperative Markets — FULL-MARKET 5300 batch at SCALE (Sprint III Wave 2).
//
// ⚠️ LABELED SYNTHETIC MARKET, NOT REAL FILINGS. A real bulk per-credit-union NCUA
// 5300 Call Report feed is a Bryan-only external item (see HANDOFF / ACTIVE_BUILD).
// Until it lands, this module generates a clearly-labeled, at-SCALE synthetic market
// so the whole-market ingestion path — the connector → runtime → deterministic ratio
// calc → live profile assembly → PERSISTED plane-aware institution profiles that
// reconcile to source — is proven HONESTLY at scale. Every synthetic filing stamps a
// `sourcedoc:ncua:5300:synthetic:<charter>:2026Q1` source_ref (the `synthetic:` segment
// is the load-bearing label) so no synthetic figure can ever be mistaken for a real
// filing. Do NOT cite any figure here as fact about a real institution.
//
// SOURCE-AGNOSTIC BY DESIGN. This is just another injected `Raw5300[]` batch behind the
// UNCHANGED `makeNcua5300Connector` — the connector normalizes it exactly as it would a
// real bulk pull. Swapping to real data changes only the injected array, nothing else.
// The 7 golden `batch_fixtures.ts` institutions are composed in as a labeled subset (so
// the golden Summit Ridge etc. still appear at the head of the market) — `batch_fixtures`
// is thereby RETIRED behind this connector as the scale front door, not deleted.
//
// PURE + DETERMINISTIC (load-bearing). No clock, no `Math.random`. Per-institution
// variety comes from a deterministic index-seeded FNV/LCG hash, so the SAME `count`
// always yields the SAME market → a byte-identical connector run + persisted profiles.
// Figures are native-unit (dollars, member counts) and internally CONSISTENT
// (net_worth < total_assets, delinquent_loans < total_loans, shares < assets), so the
// five downstream ratios (net_worth_ratio / roa / loan_to_share / delinquency /
// member_growth) land in realistic bands and downstream profiles genuinely differ.
//
// ERASABLE-ONLY TS: `import type` for types; ES2022; alias "@/*".

import type { CallReportInput, Raw5300 } from "@/cartridges/cooperative_markets/ingest_call_report";
import { institutionBatchFixtures } from "@/cartridges/cooperative_markets/batch_fixtures";

/** All synthetic filings report the same illustrative quarter (deterministic — no clock). */
const PERIOD = "2026-Q1";

/** The label segment that marks a filing as synthetic (never a real institution). */
export const SYNTHETIC_SOURCE_SEGMENT = "synthetic";

/** Default market size — "at scale" without making the gate slow. */
export const DEFAULT_MARKET_SIZE = 600;

// ---------------------------------------------------------------------------
// Deterministic pseudo-random stream (seeded by index — NO clock, NO Math.random)
// ---------------------------------------------------------------------------

/** FNV-1a 32-bit hash of a string → a deterministic 32-bit seed. */
function seedOf(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/**
 * A tiny deterministic uniform stream in [0,1) from a numeric seed (a Lehmer /
 * park-miller style LCG). Pure: the same seed always yields the same sequence. Used
 * ONLY to vary synthetic figures — never a security or statistical primitive.
 */
function rng(seed: number): () => number {
  let state = (seed % 2147483646) + 1; // keep in (0, 2^31-1)
  return () => {
    state = (Math.imul(state, 16807) % 2147483647) >>> 0;
    return (state & 0x7fffffff) / 2147483647;
  };
}

/** Deterministic value in [lo, hi] from a unit draw. */
function span(u: number, lo: number, hi: number): number {
  return lo + u * (hi - lo);
}

/** Round to whole dollars/members (5300 figures are integers). */
function whole(n: number): number {
  return Math.round(n);
}

// ---------------------------------------------------------------------------
// One synthetic institution
// ---------------------------------------------------------------------------

/** Build the `sourcedoc:ncua:5300:synthetic:<charter>:2026Q1` labeled source_ref. */
export function syntheticSourceRef(charter: string): string {
  return `sourcedoc:ncua:5300:${SYNTHETIC_SOURCE_SEGMENT}:${charter}:2026Q1`;
}

/**
 * Generate ONE internally-consistent synthetic 5300 payload for a market index.
 * Charter numbers start at 70000 so they never collide with the golden fixtures'
 * charters (12007 / 23418 / …). Figures derive from a single index-seeded stream, so
 * institution i is always identical across runs.
 */
export function syntheticFiling(index: number): Raw5300 {
  const charter = String(70000 + index);
  const draw = rng(seedOf(`ncua:synthetic:${charter}`));

  // Asset scale spans small community CUs → large ones (log-spread for realism).
  const assetsMagnitude = span(draw(), 7.0, 9.6); // 10^7 .. ~10^9.6
  const total_assets = whole(Math.pow(10, assetsMagnitude));

  // Net-worth ratio 6.0%–13.5% (PCA well-capitalized is >= 7%).
  const nwr = span(draw(), 0.06, 0.135);
  const net_worth = whole(total_assets * nwr);

  // Shares are 78%–92% of assets; loans are 60%–96% of shares (loan-to-share band).
  const total_shares = whole(total_assets * span(draw(), 0.78, 0.92));
  const total_loans = whole(total_shares * span(draw(), 0.6, 0.96));

  // ROA -0.4% .. +1.4% on average assets (~= total assets here).
  const average_assets = whole(total_assets * span(draw(), 0.97, 1.0));
  const roa = span(draw(), -0.004, 0.014);
  const net_income = whole(average_assets * roa);

  // Delinquency 0.2%–2.8% of loans.
  const delinquent_loans = whole(total_loans * span(draw(), 0.002, 0.028));

  // Membership scaled to assets (~ one member per ~$14k assets), growth -3% .. +9%.
  const members = Math.max(500, whole(total_assets / span(draw(), 12000, 16000)));
  const growth = span(draw(), -0.03, 0.09);
  const members_prior = Math.max(400, whole(members / (1 + growth)));

  // Digital adoption 0.30–0.88.
  const digital_adoption = Math.round(span(draw(), 0.3, 0.88) * 100) / 100;

  return {
    charter_number: charter,
    institution: `Synthetic Credit Union ${charter}`,
    period: PERIOD,
    total_assets,
    net_worth,
    total_loans,
    total_shares,
    net_income,
    average_assets,
    delinquent_loans,
    members,
    members_prior,
    digital_adoption,
    source_ref: syntheticSourceRef(charter),
  };
}

// ---------------------------------------------------------------------------
// The full market
// ---------------------------------------------------------------------------

export interface BulkMarketOptions {
  /** Total institutions in the market (incl. the composed golden subset). Default 600. */
  size?: number;
  /** Include the 7 golden `batch_fixtures` institutions at the head (default true). */
  include_golden?: boolean;
}

/**
 * Build a full-market batch of 5300 payloads at SCALE: the golden `batch_fixtures`
 * subset (labeled illustrative) at the head, then deterministic synthetic filings to
 * reach `size`. Pure/deterministic — the same options always return the same market.
 * Every non-golden filing carries a `synthetic:` source_ref so it is never mistaken
 * for a real filing.
 */
export function bulkMarket5300(opts?: BulkMarketOptions): CallReportInput[] {
  const size = Math.max(0, opts?.size ?? DEFAULT_MARKET_SIZE);
  const includeGolden = opts?.include_golden ?? true;
  const golden = includeGolden ? institutionBatchFixtures() : [];
  const out: CallReportInput[] = golden.slice(0, size);
  for (let i = out.length; i < size; i++) {
    out.push({ input_type: "ncua_5300_call_report", raw: syntheticFiling(i) });
  }
  return out;
}

/** The raw payloads only (the shape the connector's `acquire` injects). */
export function bulkMarketRaw(opts?: BulkMarketOptions): Raw5300[] {
  return bulkMarket5300(opts).map((i) => i.raw);
}

/**
 * A quick provenance summary of a market batch — how many are golden-labeled fixtures
 * vs synthetic, for the demo / a health surface (never asserts realness).
 *
 * `all_labeled` is computed FROM THE DATA (not hardcoded): a filing is "labeled" iff its
 * source_ref carries the `:synthetic:` segment OR it is one of the known golden illustrative
 * fixtures (whose header labels them non-real). If any OTHER ref appeared — an accidentally
 * injected unlabeled/real-looking filing — `all_labeled` goes FALSE, so the load-bearing
 * "synthetic data must never be presentable as real" invariant has real teeth here.
 */
export function marketProvenance(batch: CallReportInput[]): {
  total: number;
  synthetic: number;
  golden: number;
  all_labeled: boolean;
} {
  const goldenRefs = new Set(institutionBatchFixtures().map((i) => i.raw.source_ref));
  let synthetic = 0;
  let golden = 0;
  let all_labeled = true;
  for (const i of batch) {
    const ref = i.raw.source_ref;
    const isSynthetic = ref.includes(`:${SYNTHETIC_SOURCE_SEGMENT}:`);
    if (isSynthetic) synthetic += 1;
    else if (goldenRefs.has(ref)) golden += 1;
    else all_labeled = false; // neither synthetic-labeled nor a known illustrative fixture
  }
  return { total: batch.length, synthetic, golden, all_labeled };
}
