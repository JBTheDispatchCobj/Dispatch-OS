// core/profile/types.ts
//
// The PERSONAL operating profile (PERSONAL_PROFILE_PRD) and its refining
// objects: signals, interests, goals.
//
// Models the person through role, responsibilities, institution, goals,
// projects, interests, relationships, decisions, reading behavior, access, and
// preferred channels. Greater system access improves operational capacity while
// respecting permissions — so visibility defaults to `personal` and access is
// scoped explicitly.
//
// Scope note: this file is the PERSON profile. Institution / company / product
// public profiles are a computed projection over Entity + truth objects and are
// built in the CU/company profile-generation step (BUILD_SEQUENCE #8), not here.

import type { Visibility } from "../truth/types";

export type ProfileStatus = "active" | "inactive" | "archived";

/**
 * A person's operating profile. `user_id` is null for a public/unclaimed person
 * profile (e.g. a CU executive surfaced from public sources) until the person
 * claims it (BUILD_SEQUENCE #17 "Claim profile").
 */
export interface PersonalProfile {
  id: string;
  /** UserProfile id; null for an unclaimed public person profile. */
  user_id?: string | null;
  organization_id?: string | null;
  workspace_id?: string | null;
  /** Institution the person operates within (entity/workspace id). */
  institution_ref?: string | null;
  display_name: string;
  role?: string | null;
  responsibilities?: string[];
  /** Decision-authority + system-access context (what they may see/do). */
  access_scope?: Record<string, unknown> | null;
  preferred_channels?: string[];
  visibility: Visibility; // typically "personal"
  status: ProfileStatus;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at?: string;
}

/**
 * An observed behavior signal that refines the profile: reading, saves,
 * comments, votes, referrals, searches, dwell. Interactions update profiles
 * (SYSTEM_ARCHITECTURE step 8). Append-only.
 */
export interface ProfileSignal {
  id: string;
  profile_id: string;
  /** "read" | "save" | "comment" | "vote" | "referral" | "search" | "dwell" | ... */
  signal_type: string;
  /** What the signal was about (IO id, entity id, relationship id). */
  subject_ref?: string | null;
  weight?: number | null;
  detail?: Record<string, unknown> | null;
  occurred_at: string;
  created_at: string;
}

/** A topic/entity the person cares about — declared, or inferred from signals. */
export interface Interest {
  id: string;
  profile_id: string;
  topic: string;
  subject_ref?: string | null;
  /** Derived strength 0..1 (from signals) or the declared weight. */
  strength?: number | null;
  source: "declared" | "inferred";
  created_at: string;
  updated_at?: string;
}

/** An objective the person is operating toward. Links to relationships/workflows. */
export interface Goal {
  id: string;
  profile_id: string;
  statement: string;
  /** "project" | "objective" | "mandate" | ... */
  goal_type?: string | null;
  status: "open" | "in_progress" | "achieved" | "abandoned";
  target_date?: string | null;
  related_relationship_ids?: string[];
  related_workflow_ids?: string[];
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at?: string;
}
