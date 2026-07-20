// core/registry/types.ts
//
// The Dispatch Knowledge Registry (DKR) contracts — the typed manifests the
// kernel loads to know what it can ingest, understand, and manufacture.
//
// Philosophy (DKR, ADR-0006): registries are the source of truth; the kernel
// executes. Nothing here is a vertical fork — industries exist only through
// cartridges. These are CONFIG-AS-DATA manifest shapes: the authoritative
// entries live in the registry store (the Dispatch_Knowledge_Registry_v1
// folder), typed by the interfaces below. Operational STATE (connector runs,
// discovery queue) is persisted separately — see db/migrations/0015.
//
// The five registries (DKR §Registry Components) map to existing structures:
//   Source Registry       -> SourceRegistryEntry (+ core `Source` runtime rows)
//   Connector Registry    -> ConnectorSpec               (NEW first-class layer)
//   Object Registry       -> ObjectRegistryEntry (+ core object model / entity_types)
//   Intelligence Registry -> IntelligenceObjectSpec (+ core/intelligence contracts)
//   Cartridge Registry    -> CartridgeRegistryEntry (+ cartridges/ + core/cartridge)

import type { Plane, Visibility, TruthTier } from "../truth/types";

// ---------------------------------------------------------------------------
// Shared registry-entry envelope
// ---------------------------------------------------------------------------

export type RegistryStatus =
  | "proposed" // discovered/queued, not yet ratified
  | "active" // ratified; the kernel may use it
  | "deprecated"
  | "archived";

/**
 * Trust/authority of a source (DKR §Source Registry). Distinct from a truth
 * TIER: authority describes the SOURCE, tier describes an individual assertion.
 * A high-authority source still produces third_party_claims, not facts, when it
 * is merely reporting.
 */
export type SourceAuthority =
  | "government" // regulators, primary law
  | "regulatory"
  | "official_filing" // SEC/Form D/ADV
  | "institution_official" // the institution's own site/report
  | "trade_association"
  | "press" // news/trade press
  | "community" // network-generated
  | "human_expert";

/** Common shape every registry entry carries. Versioned; never overwritten. */
export interface RegistryEntryBase {
  /** Stable key, e.g. "source:ncua_call_reports" or "connector:sec_edgar". */
  key: string;
  label: string;
  version: number;
  status: RegistryStatus;
  /** Free-text note on lineage/why this entry exists. */
  notes?: string;
  /** When this entry was last ratified/changed. */
  updated_at?: string;
  metadata?: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// 1. Source Registry
// ---------------------------------------------------------------------------

/**
 * A registered source of knowledge (DKR §1). The runtime counterpart is the
 * core `Source` row; this is the DECLARATION of what the source is, how far to
 * trust it, and what it produces.
 */
export interface SourceRegistryEntry extends RegistryEntryBase {
  authority: SourceAuthority;
  /** 0..1 baseline trust; individual assertions still get their own confidence. */
  trust_score?: number | null;
  /** Where records from this source sit by default. */
  default_plane: Plane;
  default_visibility: Visibility;
  /** Highest tier records from this source may claim by default. */
  default_tier: TruthTier;
  official_url?: string | null;
  publisher?: string | null;
  refresh_cadence?: string | null; // "daily" | "quarterly" | "on_publish" | ...
  authentication?: string | null; // "none" | "api_key" | "oauth" | ...
  cost?: string | null; // "free" | "licensed" | "$/call" | ...
  legal_terms?: string | null;
  attribution_required?: boolean;
  /** Connector that ingests this source. */
  connector_key?: string | null;
  /** Object registry keys this source produces. */
  output_object_keys?: string[];
  /** Cartridge keys this source feeds. */
  applicable_cartridges?: string[];
}

// ---------------------------------------------------------------------------
// 2. Connector Registry (the new first-class layer)
// ---------------------------------------------------------------------------

/** How a connector retrieves (SOURCE_CATALOG connector types). */
export type ConnectorType =
  | "direct_api"
  | "bulk_download"
  | "rss_atom"
  | "webhook"
  | "browser_capture"
  | "manual_upload"
  | "email_forward"
  | "structured_extraction"
  | "partner_feed"
  | "mcp_server";

/**
 * The implementation-layer declaration for a source (DKR §2). Connectors
 * NORMALIZE information — they must contain no business logic. Extraction is
 * declared as references to registry keys, not inline rules.
 */
export interface ConnectorSpec extends RegistryEntryBase {
  source_key: string;
  connector_type: ConnectorType;
  authentication?: string | null;
  rate_limits?: string | null;
  refresh_strategy?: string | null; // "poll" | "bulk" | "webhook" | "on_demand"
  /** Object registry keys this connector extracts (entity extraction). */
  entity_object_keys?: string[];
  /** Relationship types this connector can assert. */
  relationship_types?: string[];
  /** Intelligence Object specs this connector can trigger generation of. */
  intelligence_object_keys?: string[];
  /** Cartridges impacted by this connector's output. */
  cartridges_impacted?: string[];
  /** Raw storage / provenance policy note (feeds SourceDocument). */
  raw_storage_policy?: string | null;
}

// ---------------------------------------------------------------------------
// 3. Object Registry
// ---------------------------------------------------------------------------

/**
 * A registered object type Dispatch understands (DKR §3). For universal
 * primitives this points at a core type; for vertical nouns it points at a
 * cartridge-declared entity_type. Objects own schemas, relationships, versions.
 */
export interface ObjectRegistryEntry extends RegistryEntryBase {
  /** Domain grouping, e.g. "Institutions" | "People" | "Regulations". */
  domain: string;
  /** "core_primitive" | "cartridge_entity" — where the schema is defined. */
  object_class: "core_primitive" | "cartridge_entity";
  /** Core type name (e.g. "Relationship") or cartridge entity_type key. */
  schema_ref: string;
  /** Owning cartridge key when object_class = cartridge_entity. */
  cartridge_key?: string | null;
  /** Object registry keys this object commonly relates to. */
  related_object_keys?: string[];
}

// ---------------------------------------------------------------------------
// 4. Intelligence Registry
// ---------------------------------------------------------------------------

/**
 * A declared kind of intelligence Dispatch can manufacture (DKR §4). Everything
 * Dispatch produces begins as an Intelligence Object; this spec says what a
 * given kind is built from and where it can render.
 */
export interface IntelligenceObjectSpec extends RegistryEntryBase {
  /** e.g. "Executive Brief" | "Market Card" | "Risk Alert". */
  intelligence_type: string;
  /** Object registry keys this IO consumes as inputs. */
  input_object_keys?: string[];
  /** Truth tiers required before this IO may publish (e.g. no inference-only). */
  min_input_tier?: TruthTier | null;
  /** Lenses/channels this IO renders into (mirror core/intelligence types). */
  lenses?: string[];
  channels?: string[];
  default_shelf_life?: string | null;
  cartridges?: string[];
}

// ---------------------------------------------------------------------------
// 5. Cartridge Registry
// ---------------------------------------------------------------------------

/** A registered cartridge (DKR §5) — the index entry; the manifest lives in cartridges/. */
export interface CartridgeRegistryEntry extends RegistryEntryBase {
  object_keys?: string[];
  source_keys?: string[];
  connector_keys?: string[];
  intelligence_object_keys?: string[];
  rule_keys?: string[];
  workflow_keys?: string[];
  widget_keys?: string[];
  permissions?: string[];
  metric_keys?: string[];
}

// ---------------------------------------------------------------------------
// Discovery framework (DKR §Discovery Framework)
// ---------------------------------------------------------------------------

/** Pipeline a candidate moves through: Discover→Qualify→Connector→Parser→Entities→IO→Cartridge. */
export type DiscoveryStage =
  | "discovered"
  | "qualified"
  | "connector_defined"
  | "parser_defined"
  | "entities_mapped"
  | "intelligence_mapped"
  | "cartridge_assigned"
  | "promoted";

/**
 * A candidate knowledge source in the research queue. Persisted (see
 * db/migrations/0015 discovery_candidates); this is the in-memory shape.
 */
export interface DiscoveryCandidate {
  id: string;
  label: string;
  /** What kind of thing: "api" | "publication" | "regulator" | "podcast" | ... */
  candidate_type: string;
  location?: string | null; // url/handle
  stage: DiscoveryStage;
  status: RegistryStatus;
  /** Once promoted, the source registry key it became. */
  promoted_source_key?: string | null;
  rationale?: string | null;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at?: string;
}
