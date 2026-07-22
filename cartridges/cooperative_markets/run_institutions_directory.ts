// cartridges/cooperative_markets/run_institutions_directory.ts
//
// Cooperative Markets — THE INSTITUTIONS DIRECTORY data (Sprint IV Wave 1).
//
// Assembles the serializable view-model for `/institutions`, a REAL directory
// over the full-market institution profiles. Promoted from a scaffold: it now
// itemizes the whole market (search / filter / sort in the client) and each row
// opens that institution's `/terminal`. It scales from one institution to
// thousands — the same normalize→ratio→assemble path the connector proves at
// scale, itemized for browse.
//
// ⚠️ LABELED SYNTHETIC until a real bulk 5300 feed lands (Bryan-only). Every
// synthetic row carries its `:synthetic:` source label + a `synthetic: true` flag
// so the UI can never present a figure as real; the 7 golden fixtures are labeled
// `illustrative`. `all_labeled` is computed from the data (teeth), never asserted.
//
// TRUTH DISCIPLINE ON SCREEN (doctrine state legend):
//   * synthetic — every non-golden figure is illustrative, never real;
//   * inferred  — profile `confidence` is a Dispatch inference over the filing, not a fact;
//   * missing   — REGION is NOT sourced yet (no 5300 field for it) → surfaced as
//                 `missing`, shown, NEVER faked. This is the doctrine "show missing,
//                 never fabricate" rule made visible on a real surface.
// The five ratios are DETERMINISTIC CALCULATIONS over reported figures (never a
// weight); each row cites its filing `source_ref` for lineage.
//
// PURE / DETERMINISTIC: every id/instant is injected (`as_of`); the market is
// index-seeded (no clock, no random) so the same options → an identical VM. The
// only impurity is the sanctioned catalog read behind the connector path — and the
// directory itself does no I/O. ERASABLE-ONLY TS: `import type` for type-only
// imports; no enums / parameter properties (safe under node type-stripping so the
// debug loop + `node --test` can import it directly).

import { bulkMarket5300, DEFAULT_MARKET_SIZE } from "@/cartridges/cooperative_markets/bulk_5300_market";
import { ingestInstitutionBatch } from "@/cartridges/cooperative_markets/ingest_batch";
import { institutionBatchFixtures } from "@/cartridges/cooperative_markets/batch_fixtures";
import type { CallReportInput } from "@/cartridges/cooperative_markets/ingest_call_report";

const AS_OF_DEFAULT = "2026-07-22T00:00:00.000Z";

/** Directory market size — "at scale" for browse without making prerender/gate slow. */
export const DIRECTORY_MARKET_SIZE = 500;

/** A capitalization readiness band derived from the net-worth ratio (PCA-aligned). */
export type ReadinessBand = "well_capitalized" | "adequate" | "undercapitalized";

/** An asset-size band (bucketed from total assets), for filtering large↔small CUs. */
export type AssetBand = "under_50m" | "50m_250m" | "250m_1b" | "over_1b";

/**
 * How a row's figures are labeled — never presentable as real. `unlabeled` is the
 * HONEST label for a record that is neither `:synthetic:`-tagged nor a known golden
 * illustrative fixture: rather than defaulting an unknown-provenance row to the
 * benign `illustrative`, it is flagged untrusted row-by-row (and flips `all_labeled`
 * false). Not produced by the synthetic generator today — it is the teeth for the
 * "synthetic/unverified data is never presentable as real" invariant.
 */
export type ProvenanceLabel = "illustrative" | "synthetic" | "unlabeled";

export interface InstitutionRow {
  name: string;
  charter: string;
  period: string;
  /** Total assets (native dollars) from the filing — drives the asset band. */
  total_assets: number;
  members: number;
  net_worth_ratio: number;
  roa: number;
  loan_to_share: number;
  delinquency_ratio: number;
  member_growth: number;
  /** Profile confidence — a Dispatch INFERENCE over the filing (state: inferred). */
  profileConfidence: number;
  readiness: ReadinessBand;
  assetBand: AssetBand;
  /** REGION is not sourced from a 5300 → always null here (state: missing). */
  region: string | null;
  /** Provenance label — synthetic (never real) or illustrative golden fixture. */
  label: ProvenanceLabel;
  synthetic: boolean;
  source_ref: string;
  /** The route this row opens — the single-institution Terminal. */
  terminal_href: string;
}

export interface InstitutionsDirectoryVM {
  generatedAt: string;
  market: {
    size: number;
    synthetic: number;
    illustrative: number;
    /** Rows of unknown provenance (neither synthetic- nor golden-labeled) — untrusted. */
    unlabeled: number;
    /** Computed from the data: true iff every row is synthetic- or illustrative-labeled. */
    allLabeled: boolean;
    /** True iff NO row carries a sourced region (the honest "region is missing" banner). */
    regionMissing: boolean;
  };
  /** The facet option lists the client filters over (stable, deterministic order). */
  facets: {
    readiness: ReadinessBand[];
    assetBand: AssetBand[];
    label: ProvenanceLabel[];
  };
  rows: InstitutionRow[];
}

/** PCA-aligned readiness band from the net-worth ratio (%). */
export function readinessBand(netWorthRatioPct: number): ReadinessBand {
  if (netWorthRatioPct >= 7) return "well_capitalized";
  if (netWorthRatioPct >= 6) return "adequate";
  return "undercapitalized";
}

/** Asset-size band from total assets (native dollars). */
export function assetBand(totalAssets: number): AssetBand {
  if (totalAssets < 50_000_000) return "under_50m";
  if (totalAssets < 250_000_000) return "50m_250m";
  if (totalAssets < 1_000_000_000) return "250m_1b";
  return "over_1b";
}

/** Charter → the single-institution Terminal route (real navigation target). */
export function terminalHref(charter: string): string {
  return `/terminal?charter=${encodeURIComponent(charter)}`;
}

/**
 * Build the `/institutions` directory view-model over the full synthetic market.
 * Deterministic given `as_of` + `size`. Itemizes every institution (golden
 * illustrative head + synthetic-labeled body) into a browse row: the five ratios
 * (deterministic calcs citing the filing), the profile confidence (an inference),
 * an asset band + readiness band for filtering, and REGION as null (missing —
 * shown, never faked). The client applies search / filter / sort over `rows`.
 */
export function runInstitutionsDirectory(
  opts: { as_of?: string; market_size?: number } = {},
): InstitutionsDirectoryVM {
  const as_of = opts.as_of ?? AS_OF_DEFAULT;
  const size = opts.market_size ?? DIRECTORY_MARKET_SIZE;
  return buildDirectoryVM(bulkMarket5300({ size }), { as_of });
}

/**
 * Build the directory VM from an EXPLICIT batch of 5300 inputs. The `runInstitutions
 * Directory` front door calls this with the labeled synthetic market; exposing the
 * seam lets a test drive the NEGATIVE provenance case — an unlabeled/real-looking
 * record — through the real labeling code path (not an inline re-implementation), so
 * the "never presentable as real" invariant has teeth. Deterministic given `inputs`
 * + `as_of`; pure (no I/O beyond the caller's batch).
 */
export function buildDirectoryVM(
  inputs: CallReportInput[],
  opts: { as_of: string },
): InstitutionsDirectoryVM {
  const as_of = opts.as_of;
  const goldenRefs = new Set(institutionBatchFixtures().map((i) => i.raw.source_ref));
  const batch = ingestInstitutionBatch(inputs, { observed_at: as_of, id_prefix: "dir:5300" });

  let synthetic = 0;
  let illustrative = 0;
  let unlabeled = 0;
  let allLabeled = true;

  const rows: InstitutionRow[] = batch.map((b, i) => {
    const raw = inputs[i].raw;
    const isSynthetic = b.facts.source_ref.includes(":synthetic:");
    const isGolden = goldenRefs.has(b.facts.source_ref);
    let label: ProvenanceLabel;
    if (isSynthetic) {
      label = "synthetic";
      synthetic += 1;
    } else if (isGolden) {
      label = "illustrative";
      illustrative += 1;
    } else {
      // neither synthetic-labeled nor a known illustrative fixture → flag it untrusted
      // row-by-row (never a benign default), and flip all_labeled false (teeth).
      label = "unlabeled";
      unlabeled += 1;
      allLabeled = false;
    }

    return {
      name: b.facts.institution,
      charter: b.facts.charter_number,
      period: b.facts.period,
      total_assets: raw.total_assets,
      members: raw.members,
      net_worth_ratio: b.facts.net_worth_ratio,
      roa: b.facts.roa,
      loan_to_share: b.facts.loan_to_share,
      delinquency_ratio: b.facts.delinquency_ratio,
      member_growth: b.facts.member_growth,
      profileConfidence: b.profile.confidence,
      readiness: readinessBand(b.facts.net_worth_ratio),
      assetBand: assetBand(raw.total_assets),
      region: null, // not sourced from a 5300 — state: missing (shown, never faked)
      label,
      synthetic: isSynthetic,
      source_ref: b.facts.source_ref,
      terminal_href: terminalHref(b.facts.charter_number),
    };
  });

  return {
    generatedAt: as_of,
    market: {
      size: rows.length,
      synthetic,
      illustrative,
      unlabeled,
      allLabeled,
      regionMissing: rows.every((r) => r.region === null),
    },
    facets: {
      readiness: ["well_capitalized", "adequate", "undercapitalized"],
      assetBand: ["under_50m", "50m_250m", "250m_1b", "over_1b"],
      label: ["illustrative", "synthetic", "unlabeled"],
    },
    rows,
  };
}

// ---------------------------------------------------------------------------
// Pure filter / sort helpers (exported so the client + tests share one impl)
// ---------------------------------------------------------------------------

export interface DirectoryQuery {
  /** Case-insensitive substring over name OR charter (trimmed; blank = no filter). */
  search?: string;
  readiness?: ReadinessBand | "all";
  assetBand?: AssetBand | "all";
  label?: ProvenanceLabel | "all";
  sortBy?: "name" | "assets" | "net_worth" | "roa" | "confidence";
  sortDir?: "asc" | "desc";
}

const SORT_KEYS = {
  name: (r: InstitutionRow) => r.name.toLowerCase(),
  assets: (r: InstitutionRow) => r.total_assets,
  net_worth: (r: InstitutionRow) => r.net_worth_ratio,
  roa: (r: InstitutionRow) => r.roa,
  confidence: (r: InstitutionRow) => r.profileConfidence,
} as const;

/**
 * Deterministic filter + sort over directory rows. Pure: no clock, no mutation of
 * the input array. The sort is a TOTAL order (charter tiebreak) so equal keys never
 * reorder between runs. Shared by the client view and the unit tests.
 */
export function queryDirectory(rows: InstitutionRow[], q: DirectoryQuery = {}): InstitutionRow[] {
  const search = (q.search ?? "").trim().toLowerCase();
  const filtered = rows.filter((r) => {
    if (search && !(`${r.name}`.toLowerCase().includes(search) || r.charter.toLowerCase().includes(search))) return false;
    if (q.readiness && q.readiness !== "all" && r.readiness !== q.readiness) return false;
    if (q.assetBand && q.assetBand !== "all" && r.assetBand !== q.assetBand) return false;
    if (q.label && q.label !== "all" && r.label !== q.label) return false;
    return true;
  });

  const key = SORT_KEYS[q.sortBy ?? "net_worth"];
  const dir = (q.sortDir ?? "desc") === "asc" ? 1 : -1;
  return filtered.slice().sort((a, b) => {
    const ka = key(a);
    const kb = key(b);
    if (ka < kb) return -1 * dir;
    if (ka > kb) return 1 * dir;
    // total-order tiebreak on charter so equal keys are stable + deterministic
    return a.charter < b.charter ? -1 : a.charter > b.charter ? 1 : 0;
  });
}

/** Referenced so `DEFAULT_MARKET_SIZE` stays imported/meaningful to readers. */
export const DIRECTORY_MARKET_DEFAULTS = { DEFAULT_MARKET_SIZE, DIRECTORY_MARKET_SIZE };
