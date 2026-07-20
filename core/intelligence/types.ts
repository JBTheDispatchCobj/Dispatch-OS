// core/intelligence/types.ts
//
// The Intelligence Object factory contract (DOCTRINE #4, INTELLIGENCE_OBJECTS_PRD).
//
// An Intelligence Object is ONE sourced unit of market meaning: facts, claims,
// affected entities, relevance, confidence, shelf life, and a recommended
// action — assembled FROM truth objects, then rendered into many lenses and
// channels via {@link ContentVariant}. The IO never invents facts; it points at
// the truth objects it is built from, so every published variant is traceable.
//
// Publication loop (DOCTRINE): market event → Intelligence Object →
// role/institution/cartridge lens → channel variant → interaction → profile
// refinement → action.

import type { Plane, Visibility, TruthTier } from "../truth/types";

export type IntelligenceObjectStatus =
  | "draft"
  | "assembled"
  | "reviewed"
  | "published"
  | "archived";

/** The lens a variant is shaped for (SYSTEM_ARCHITECTURE step 7). */
export type LensType = "role" | "institution" | "person" | "cartridge" | "channel";

/** Delivery channel for a rendered variant (MASTER_PRODUCT_MAP surfaces). */
export type ChannelType =
  | "brief" // The Auric — Bi-daily Brief
  | "market_feed" // The Auric — Market
  | "network" // The Auric — Network
  | "two_dollar_bill" // The Auric — $2 Bill
  | "terminal_feed" // [Institution] Terminal curated feed
  | "email"
  | "api";

export interface IntelligenceObject {
  id: string;
  /** Null = shared-market IO (the free layer); set = tenant-private IO. */
  workspace_id?: string | null;
  organization_id?: string | null;
  plane: Plane;
  visibility: Visibility;
  /** Cartridge/topic key, "<cartridge>:<slug>" when cartridge-specific. */
  kind?: string | null;
  headline: string;
  summary?: string | null;
  /** Sourced components — the truth-object ids this IO is assembled FROM. */
  fact_refs?: string[]; // observations / calculations (verifiable facts)
  claim_refs?: string[]; // claims (third-party, unverified)
  inference_refs?: string[]; // inferences (model interpretation)
  /** Entities/relationships this IO affects. */
  affected_refs?: string[];
  /** Highest tier among the components — drives the trust badge/precedence. */
  top_tier?: TruthTier | null;
  /** Who/why this is relevant (audience, reason, scoring inputs). */
  relevance?: Record<string, unknown> | null;
  confidence?: number | null;
  /** Shelf life: when the IO goes stale and should drop from feeds. */
  shelf_life_ends_at?: string | null;
  recommended_action?: string | null;
  status: IntelligenceObjectStatus;
  published_at?: string | null;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at?: string;
}

/**
 * A rendered variant of an IO for one lens + channel. Carries its own
 * visibility (a public IO may still have a tenant-only variant). It restates —
 * never extends — the IO's facts; `source_refs` keep it traceable.
 */
export interface ContentVariant {
  id: string;
  intelligence_object_id: string;
  lens_type: LensType;
  /** Lens target: role key, institution/workspace id, person id, or cartridge key. */
  lens_ref?: string | null;
  channel: ChannelType;
  visibility: Visibility;
  title?: string | null;
  body: string;
  /** Structured render payload (blocks, media refs) for non-text channels. */
  render_payload?: Record<string, unknown> | null;
  /** Traceability: the IO component refs this variant is grounded in. */
  source_refs?: string[];
  generated_by?: string; // "user:<id>" | "agent:<run_id>" | "system"
  status: IntelligenceObjectStatus;
  created_at: string;
  updated_at?: string;
}
