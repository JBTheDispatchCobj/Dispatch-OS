// core/truth/types.ts
//
// Dispatch OS — the shared TRUTH & PROVENANCE layer.
//
// Universal: applies to every derived assertion, on both the shared market
// plane and the private tenant plane. Nothing here names a vertical concept —
// meaning still attaches through configuration, entity_type, `kind`, and the
// per-object `value`/`context` JSON.
//
// Implements:
//   - DOCTRINE "Truth hierarchy" + CORE_OBJECT_MODEL §5 (Truth Model)
//   - DATA_ARCHITECTURE: immutable raw source records; separate assertion from
//     interpretation; valid-time and observed-time; layered visibility.
//   - SYSTEM_ARCHITECTURE: shared_market / private_terminal / control planes.
//
// LOAD-BEARING RULE (CLAUDE.md): regulated/financial conclusions must never
// live solely in model weights or prompts. Every Inference and Verification
// persists evidence, source, method, confidence, and decision lineage through
// the {@link Provenance} envelope below. The envelope is columns, not a comment.

import type { LifecycleStatus } from "../types";

// ---------------------------------------------------------------------------
// Planes, visibility, and the truth hierarchy
// ---------------------------------------------------------------------------

/** Which plane an object physically lives on (SYSTEM_ARCHITECTURE). */
export type Plane = "shared_market" | "private_terminal" | "control";

/**
 * Visibility scope (DATA_ARCHITECTURE). WHO may see an object, independent of
 * which plane it lives on. RLS enforcement is deferred to the shared-market /
 * tenant step (ACTIVE_BUILD #2); the value is recorded now so the policy layer
 * has something to enforce against.
 */
export type Visibility =
  | "public" // anyone; the free market-attention layer
  | "network" // visible across the member network, not the open public
  | "tenant_private" // one institution/tenant only
  | "relationship_private" // only the parties to a relationship
  | "personal"; // one person only

/**
 * Truth hierarchy (DOCTRINE). The GRADE of an assertion. Public/third-party/
 * calc/inference/verified/tenant/human-approved must never be silently
 * conflated — the tier is the field that keeps them distinct.
 */
export type TruthTier =
  | "public_fact"
  | "third_party_claim"
  | "deterministic_calculation"
  | "dispatch_inference"
  | "institution_verified_fact"
  | "private_tenant_fact"
  | "human_approved_conclusion";

/**
 * Precedence weight for a tier (higher = more authoritative) used when
 * assertions about the same subject+predicate conflict. Full conflict
 * resolution is a later step; the weights are declared here so it stays
 * deterministic and cartridge-blind when it lands.
 */
export const TRUTH_TIER_PRECEDENCE: Record<TruthTier, number> = {
  third_party_claim: 10,
  dispatch_inference: 15,
  public_fact: 20,
  deterministic_calculation: 30,
  private_tenant_fact: 35,
  institution_verified_fact: 40,
  human_approved_conclusion: 50,
};

// ---------------------------------------------------------------------------
// Provenance + temporal envelope (carried by every derived truth object)
// ---------------------------------------------------------------------------

/** How an assertion was produced. Human vs machine is explicit. */
export type ProvenanceMethod =
  | "source_extraction" // pulled verbatim/structurally from a source document
  | "connector_sync" // delivered by a connector/API
  | "manual_entry" // a human typed it
  | "deterministic_rule" // computed by deterministic logic
  | "model_inference" // produced by a model
  | "human_judgment"; // a human concluded it

/** Shared actor-string convention: "user:<id>" | "agent:<run_id>" | "system". */
export type Actor = string;

/**
 * The provenance envelope — the persisted lineage the doctrine requires.
 *
 * NOTE on persistence: in the SQL schema these fields are stored as INDEXED
 * COLUMNS (not a single jsonb blob), because DATA_ARCHITECTURE says JSON may
 * extend an object but may not replace core indexed fields. `provenance_metadata`
 * is the jsonb extension slot. The nested shape here is the in-memory/idea-state
 * representation; the adapter flattens it.
 */
export interface Provenance {
  method: ProvenanceMethod;
  /** Who last asserted this: "user:<id>" | "agent:<run_id>" | "system". */
  asserted_by: Actor;
  /** Immutable raw records this rests on. */
  source_document_ids?: string[];
  /** Sources (connectors/publishers) this rests on. */
  source_ids?: string[];
  /** Other truth-object ids this was derived from (claims/observations/calcs). */
  derived_from_ids?: string[];
  /** Model id when method = model_inference. NEVER the only record of the fact. */
  model_reference?: string | null;
  prompt_reference?: string | null;
  agent_run_id?: string | null;
  /** 0..1 confidence in this assertion. */
  confidence?: number | null;
  /** Extension slot; must not replace the columns above. */
  provenance_metadata?: Record<string, unknown>;
}

/**
 * Bi-temporal stamps (DATA_ARCHITECTURE: valid-time and observed-time).
 *   observed_at        — when Dispatch recorded/observed it.
 *   valid_from/valid_to — when the fact is/was true in the world.
 *   stale_after        — explicit freshness horizon; past it the value is stale.
 *
 * This is what lets a fact be KNOWN now but EFFECTIVE later — e.g. an NCUA
 * amendment published today with a future effective date (valid_from) is a
 * legitimate Observation with observed_at=now, valid_from=effective_date.
 */
export interface Temporal {
  observed_at: string;
  valid_from?: string | null;
  valid_to?: string | null;
  stale_after?: string | null;
}

// ---------------------------------------------------------------------------
// Source document (immutable raw record)
// ---------------------------------------------------------------------------

/**
 * An immutable raw record retrieved from a {@link Source}. Derived layers
 * reference it; it is NEVER mutated — a new fetch is a new SourceDocument.
 * (Each eCFR regulation record and each Federal Register rule XML lands here.)
 *
 * Distinct from core `DocumentRef`: DocumentRef is a tenant file the business
 * uploaded; a SourceDocument is a preserved capture of an external source, the
 * bottom of the provenance chain.
 */
export interface SourceDocument {
  id: string;
  source_id: string;
  workspace_id?: string | null;
  organization_id?: string | null;
  plane: Plane;
  visibility: Visibility;
  /** Stable publisher identifier, e.g. "12 CFR 745.4" or an FR document number. */
  external_ref?: string | null;
  title?: string | null;
  /** "text/xml" | "application/pdf" | "application/json" | ... */
  content_type?: string | null;
  /** Pointer to the preserved raw artifact (path/uri/object key). */
  raw_content_reference?: string | null;
  /** Inline raw/cleaned text when small enough to persist directly. */
  raw_text?: string | null;
  /** Content hash for dedupe/integrity of the immutable record. */
  content_hash?: string | null;
  retrieved_at: string;
  /** Publisher's own issue/publication date (observed-time vs valid-time). */
  published_at?: string | null;
  attribution?: string | null;
  metadata?: Record<string, unknown>;
  created_at: string;
}

// ---------------------------------------------------------------------------
// The assertion family
// ---------------------------------------------------------------------------

/** Discriminator for the assertion family (mirrors the per-table identity). */
export type TruthKind =
  | "observation"
  | "claim"
  | "calculation"
  | "inference"
  | "verification";

/**
 * Common shape shared by every assertion. Concrete objects extend it and set
 * their own `truth_kind`. `subject_ref`/`predicate`/`value` are the "about
 * what / which field / what value" triple, kept as first-class fields so the
 * graph is queryable rather than buried in JSON.
 */
export interface TruthObjectBase {
  id: string;
  truth_kind: TruthKind;
  /** Null on shared-market rows; set on private-tenant rows. */
  workspace_id?: string | null;
  organization_id?: string | null;
  plane: Plane;
  visibility: Visibility;
  tier: TruthTier;
  /** What this assertion is about (entity / relationship / profile id). */
  subject_ref?: string | null;
  /** "entity" | "relationship" | "profile" | a cartridge entity_type key. */
  subject_type?: string | null;
  /** Machine-readable field being asserted, e.g. "net_worth_ratio". */
  predicate?: string | null;
  /** The asserted value; typed by the cartridge/consumer. */
  value?: Record<string, unknown> | null;
  provenance: Provenance;
  temporal: Temporal;
  status: LifecycleStatus;
  /** Set once superseded by a newer assertion about the same subject+predicate. */
  superseded_by_id?: string | null;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at?: string;
}

/**
 * A faithful record of what a source STATES. Tier is `public_fact` for public
 * sources and `private_tenant_fact` for a tenant document. An observation is
 * not an interpretation — it asserts only what the source said.
 */
export interface Observation extends TruthObjectBase {
  truth_kind: "observation";
}

/**
 * A THIRD-PARTY assertion — a company/press release/person claims X. Unverified
 * by default (`tier = third_party_claim`); promotion happens via Verification.
 */
export interface Claim extends TruthObjectBase {
  truth_kind: "claim";
  /** Who is making the claim (entity/person id, or a freeform name). */
  claimant_ref?: string | null;
  claimant_name?: string | null;
}

/**
 * A DETERMINISTIC derived value (ratios, peer clusters, readiness scores).
 * Must be reproducible from its inputs — hence a named, versioned method.
 */
export interface Calculation extends TruthObjectBase {
  truth_kind: "calculation";
  /** Named method so the number can be recomputed/audited, e.g. "net_worth_ratio.v1". */
  calculation_method: string;
  method_version?: string | null;
}

/**
 * A MODEL / heuristic interpretation (inferred need, fit, risk). Lowest trust
 * among derived facts; never the sole system of record for a regulated call.
 */
export interface Inference extends TruthObjectBase {
  truth_kind: "inference";
  rationale?: string | null;
}

/**
 * An institution- or human-CONFIRMED fact/conclusion. Promotes a lower-tier
 * assertion to `institution_verified_fact` or `human_approved_conclusion` and
 * records who did it — the audited top of the hierarchy.
 */
export interface Verification extends TruthObjectBase {
  truth_kind: "verification";
  /** The truth object being verified. */
  verifies_id?: string | null;
  verified_by: Actor;
  verification_note?: string | null;
}

/** Discriminated union over the whole assertion family. */
export type TruthObject =
  | Observation
  | Claim
  | Calculation
  | Inference
  | Verification;
