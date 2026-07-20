// core/relationships/types.ts
//
// Relationships are FIRST-CLASS operating objects (DOCTRINE #3, RELATIONSHIPS_PRD):
// type, parties, stage, visibility, evidence, activity, opportunity, risks,
// participants, next actions, workflows, and outcomes. A relationship is the
// spine of Cooperative Markets — discovery → … → monitoring between a credit
// union and an innovation company, on either plane.
//
// Universal: lives in /core. The relationship *type* is cartridge-declared
// ("<cartridge>:<slug>"); the core stays vertical-blind.

import type { Plane, Visibility } from "../truth/types";

/**
 * Stage machine spanning the full Cooperative Markets lifecycle plus terminal
 * states. The stages are ordered for progress display; moving between them
 * emits a {@link RelationshipEvent}.
 */
export type RelationshipStage =
  | "discovery"
  | "evaluation"
  | "discussion"
  | "pilot"
  | "integration"
  | "partnership"
  | "investment"
  | "monitoring"
  | "dormant"
  | "ended";

export type RelationshipStatus = "active" | "paused" | "archived";

/** A party to a relationship — an entity on either plane, or a person. */
export interface RelationshipParty {
  /** entity / profile id. */
  ref: string;
  /** "entity" | "person" | a cartridge entity_type key. */
  party_type: string;
  /** Party's role in this relationship, e.g. "institution" | "innovator" | "investor". */
  role?: string;
}

/** A structured risk on a relationship (kept typed, not a note junk-drawer). */
export interface RelationshipRisk {
  label: string;
  severity?: "low" | "medium" | "high";
  detail?: string;
  /** Truth-object ids that evidence the risk. */
  evidence_refs?: string[];
}

export interface Relationship {
  id: string;
  /** Null on shared/public relationships; set on private ones. */
  workspace_id?: string | null;
  organization_id?: string | null;
  plane: Plane;
  visibility: Visibility;
  /** Cartridge-declared type, "<cartridge>:<slug>". */
  relationship_type: string;
  parties: RelationshipParty[];
  stage: RelationshipStage;
  status: RelationshipStatus;
  /** Truth-object ids that evidence the relationship and its current stage. */
  evidence_refs?: string[];
  /** Opportunity hypothesis (value, fit, mutual benefit). Structured. */
  opportunity?: Record<string, unknown> | null;
  risks?: RelationshipRisk[] | null;
  /** People participating (personal_profile ids). */
  participant_ids?: string[];
  next_action?: string | null;
  next_action_due_at?: string | null;
  /** Owning workflow/outcome linkage (both exist in core). */
  related_workflow_id?: string | null;
  related_outcome_id?: string | null;
  last_activity_at?: string | null;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at?: string;
}

/**
 * Append-only history for a relationship: stage moves, activity, evidence adds.
 * Every relationship has evidence and history (DATA_ARCHITECTURE). Never
 * updated, never deleted; `actor` keeps human vs agent explicit.
 */
export interface RelationshipEvent {
  id: string;
  relationship_id: string;
  /** "stage_changed" | "activity" | "evidence_added" | "participant_added" | ... */
  type: string;
  actor: string; // "user:<id>" | "agent:<run_id>" | "system"
  from_stage?: RelationshipStage | null;
  to_stage?: RelationshipStage | null;
  detail: Record<string, unknown>;
  schema_version: 1;
  occurred_at: string;
  created_at: string;
}
