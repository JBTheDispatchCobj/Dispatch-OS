// cartridges/cooperative_markets/run_network_surface.ts
//
// Cooperative Markets — THE JOINT NETWORK SURFACE data (Sprint III Wave 5).
//
// Assembles the serializable view-model for `/network`, the co-built Terminal
// surface. It is REVIEW-QUEUE-FIRST (Bryan's pick): the propose-only human-review
// queue leads, the full-market institution list follows.
//
// TWO PROPOSE-ONLY QUEUES, NEVER AN AUTO-MERGE:
//   1. Cross-source ENTITY duplicates — the matured resolver PROPOSES likely
//      duplicate objects surfaced across real connectors (SEC EDGAR × startup
//      intake), for human confirm/reject. `merged_count` is asserted 0.
//   2. External-canon ALIAS proposals — the canon seam PROPOSES FS / Dispatch-Auric
//      identifiers against the repo's LIVE canonical ids (identity, not authority),
//      plus any alias the crosswalk already carries as `proposed` (awaiting review).
//
// THE MARKET (labeled synthetic). The full-market 5300 ingestion runs at scale
// through the UNCHANGED connector; every figure is LABELED SYNTHETIC (a real bulk
// 5300 feed is a Bryan-only external item). `all_labeled` is computed from the data
// and surfaced — the UI must never present it as real.
//
// PURE-ish / DETERMINISTIC: every id/instant is injected (`as_of`); same inputs →
// identical VM. The only impurity is the sanctioned catalog fs read behind the
// connector + canon loaders. ERASABLE-ONLY TS: `import type` for type-only imports.

import { ingestFullMarket } from "@/cartridges/cooperative_markets/run_market_ingest";
import { institutionBatchFixtures } from "@/cartridges/cooperative_markets/batch_fixtures";
import { ingestInstitutionBatch } from "@/cartridges/cooperative_markets/ingest_batch";
import {
  runRegistryCandidates,
  type CrossSourcePair,
} from "@/cartridges/cooperative_markets/run_registry_candidates";
import { connectorSources } from "@/core/registry/connectors";
import {
  loadCanonRegistry,
  proposeAliases,
  type CanonAlias,
} from "@/core/registry/canon";

// A modest market size — "at scale" without making the page/gate slow. Deterministic.
export const NETWORK_MARKET_SIZE = 240;

const AS_OF_DEFAULT = "2026-07-22T00:00:00.000Z";

/**
 * A batch of external-canon identifiers (FS / Dispatch-Auric transport-source
 * conventions) not yet in the confirmed crosswalk. The seam PROPOSES each against
 * the live source keys for a single human decision — the crosswalk grows
 * monotonically as these are confirmed. Config-as-data lives in the JSON registry;
 * this small demo batch drives the review queue's canon lane.
 */
export const CANON_PROPOSAL_INCOMING: string[] = [
  "SRC-FEDERAL-REGISTER",
  "SRC-OCC-BULLETINS",
  "SRC-GLEIF-LEI",
  "SRC-FINRA-BROKERCHECK",
  "SRC-CONGRESS-GOV",
];

export interface NetworkInstitutionVM {
  name: string;
  charter: string;
  period: string;
  net_worth_ratio: number;
  roa: number;
  delinquency_ratio: number;
  profileConfidence: number;
  health: "strong" | "adequate" | "thin";
  synthetic: boolean;
  source_ref: string;
}

export interface CanonProposalVM {
  incoming: string;
  canonical: string;
  kind: string;
  source: string;
  /** "proposed" here always — the queue is propose-only. */
  status: string;
  note: string;
  /** How it entered the queue: "similarity" (freshly proposed) or "registry" (already carried proposed). */
  origin: "similarity" | "registry";
}

export interface NetworkVM {
  generatedAt: string;
  market: {
    size: number;
    synthetic: number;
    golden: number;
    allLabeledSynthetic: boolean;
    healthState: string;
    sample: NetworkInstitutionVM[];
  };
  reviewQueue: {
    entityDuplicates: CrossSourcePair[];
    canonProposals: CanonProposalVM[];
    /** MUST be 0 — the queue is propose-only; nothing auto-merges. */
    mergedCount: number;
    pendingCount: number;
  };
}

function healthBand(v: number): "strong" | "adequate" | "thin" {
  return v >= 0.7 ? "strong" : v >= 0.5 ? "adequate" : "thin";
}

/**
 * Build the /network view-model. Deterministic given `as_of`. Runs the full-market
 * ingestion (labeled synthetic) for scale + provenance + health, derives a labeled
 * illustrative sample (the golden head of the market), and assembles the two
 * propose-only review lanes (entity duplicates + canon alias proposals).
 */
export async function runNetworkSurface(opts: { as_of?: string; market_size?: number } = {}): Promise<NetworkVM> {
  const as_of = opts.as_of ?? AS_OF_DEFAULT;
  const size = opts.market_size ?? NETWORK_MARKET_SIZE;

  // --- MARKET (labeled synthetic, at scale) ---------------------------------
  const market = await ingestFullMarket({ as_of, id_prefix: "net:5300", market: { size } });

  // Display sample = the labeled illustrative golden head (named CUs), top by
  // net-worth ratio. The synthetic bulk is aggregated, never itemized as "real".
  const goldenBatch = ingestInstitutionBatch(institutionBatchFixtures(), { observed_at: as_of, id_prefix: "net:batch" });
  const sample: NetworkInstitutionVM[] = goldenBatch
    .map((b) => ({
      name: b.facts.institution,
      charter: b.facts.charter_number,
      period: b.facts.period,
      net_worth_ratio: b.facts.net_worth_ratio,
      roa: b.facts.roa,
      delinquency_ratio: b.facts.delinquency_ratio,
      profileConfidence: b.profile.confidence,
      health: healthBand(b.profile.confidence),
      synthetic: b.facts.source_ref.includes(":synthetic:"),
      source_ref: b.facts.source_ref,
    }))
    .sort((a, b) => b.net_worth_ratio - a.net_worth_ratio)
    .slice(0, 8);

  // --- REVIEW LANE 1: cross-source entity duplicates (propose-only) ---------
  const candidates = await runRegistryCandidates({ as_of });
  const entityDuplicates = candidates.cross_source_pairs;
  const mergedCount = candidates.reconciliation.merged_count; // asserted 0 downstream

  // --- REVIEW LANE 2: external-canon alias proposals (propose-only) ---------
  const registry = loadCanonRegistry();
  const liveSourceKeys = connectorSources().map((s) => s.key);

  // Freshly proposed FS transport ids → live sources (similarity, never auto-confirm).
  const fresh = proposeAliases(CANON_PROPOSAL_INCOMING, liveSourceKeys, registry, { kind: "source", source: "fs_8000" });
  const similarityProposals: CanonProposalVM[] = fresh.proposed.map((a: CanonAlias) => ({
    incoming: a.incoming,
    canonical: a.canonical,
    kind: a.kind,
    source: a.source,
    status: a.status,
    note: a.note ?? "",
    origin: "similarity",
  }));

  // Aliases the crosswalk already carries as `proposed` (awaiting a human decision).
  const carriedProposals: CanonProposalVM[] = registry.aliases
    .filter((a) => a.status === "proposed")
    .map((a) => ({
      incoming: a.incoming,
      canonical: a.canonical,
      kind: a.kind,
      source: a.source,
      status: a.status,
      note: a.note ?? "",
      origin: "registry" as const,
    }));

  // Dedup by incoming (carried takes precedence over a fresh similarity proposal).
  const byIncoming = new Map<string, CanonProposalVM>();
  for (const p of similarityProposals) byIncoming.set(p.incoming, p);
  for (const p of carriedProposals) byIncoming.set(p.incoming, p);
  const canonProposals = Array.from(byIncoming.values()).sort((a, b) =>
    a.incoming < b.incoming ? -1 : a.incoming > b.incoming ? 1 : 0,
  );

  return {
    generatedAt: as_of,
    market: {
      size: market.market_size,
      synthetic: market.provenance.synthetic,
      golden: market.provenance.golden,
      allLabeledSynthetic: market.provenance.all_labeled,
      healthState: market.health_state,
      sample,
    },
    reviewQueue: {
      entityDuplicates,
      canonProposals,
      mergedCount,
      pendingCount: entityDuplicates.length + canonProposals.length,
    },
  };
}
