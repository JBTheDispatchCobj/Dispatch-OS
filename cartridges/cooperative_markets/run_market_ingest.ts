// cartridges/cooperative_markets/run_market_ingest.ts
//
// Cooperative Markets — FULL-MARKET 5300 INGESTION at scale (Sprint III Wave 2).
//
// Runs the WHOLE credit-union market (a labeled synthetic bulk market — see
// bulk_5300_market.ts) through the UNCHANGED NCUA 5300 connector + generic runtime
// (`runNcua5300`), materializing it into PERSISTED, plane-aware live institution
// profiles that RECONCILE to the connector's source refs — the same normalize→
// deterministic-ratio-calc→live-assembly→persist→reconcile path Wave 1 proved on the
// 7-institution golden batch, now exercised at scale.
//
// WHAT IT PROVES:
//   1. The scale path is honest: the connector + runtime are source-agnostic; only the
//      injected batch changed (fixtures → a labeled synthetic market of N). A real bulk
//      per-CU 5300 feed drops in with NO code change (Bryan-only external item).
//   2. Every persisted profile field traces to a connector output source_ref
//      (reconciliation), plane-aware (shared_market / public), tier from the source
//      manifest (public_fact) — no ratio or conclusion invented in a weight.
//   3. Determinism holds at scale: the same market → a byte-identical run + profiles.
//
// This is CARTRIDGE orchestration over the generic kernel runtime — no vertical noun
// leaked into core/. Additive: `run_connectors.ts` is untouched; this wraps its
// `runNcua5300`.
//
// PURE-ish: every id/instant is injected via `ConnectorRunOptions`; the market is
// deterministic. isolatedModules-friendly: `import type` for types; ES2022; alias "@/*".

import { runNcua5300, type Ncua5300RunResult } from "@/cartridges/cooperative_markets/run_connectors";
import {
  bulkMarket5300,
  bulkMarketRaw,
  marketProvenance,
  type BulkMarketOptions,
} from "@/cartridges/cooperative_markets/bulk_5300_market";
import type { ConnectorRunOptions } from "@/cartridges/cooperative_markets/run_connectors";

export interface MarketIngestResult extends Ncua5300RunResult {
  /** Institutions in the market (== observations normalized == profiles persisted). */
  market_size: number;
  /** Provenance: golden-labeled fixtures vs synthetic (all labeled, never real). */
  provenance: { total: number; synthetic: number; golden: number; all_labeled: boolean };
  /** The connector run's post-run health (a scale run should stay healthy). */
  health_state: string;
}

/**
 * Ingest the FULL synthetic market through the 5300 connector at scale. Deterministic
 * given the injected `as_of` / `id_prefix` and the market options. Returns the connector
 * output + persisted profiles + reconciliation, plus scale + provenance metrics.
 */
export async function ingestFullMarket(
  opts: ConnectorRunOptions & { market?: BulkMarketOptions },
): Promise<MarketIngestResult> {
  const marketBatch = bulkMarket5300(opts.market);
  const raw = bulkMarketRaw(opts.market);
  const base = await runNcua5300(raw, opts);
  return {
    ...base,
    market_size: marketBatch.length,
    provenance: marketProvenance(marketBatch),
    health_state: base.output.health.state,
  };
}
