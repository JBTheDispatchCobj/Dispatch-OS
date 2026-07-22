// core/profile/assemble_live.ts
//
// Dispatch OS — LIVE Profile Assembly (Volume III: Knowledge Graph & Truth,
// RFC-3008 / RFC-3012). The Confidence Engine now DRIVES profile assembly:
// instead of a fixed per-field confidence, each field's confidence is
//   (1) OUTCOME-ADJUSTED — reinforced/eroded by observed outcomes via the
//       engine's {@link reinforce} (Bayesian-flavored update), then
//   (2) DECAYED BY FRESHNESS — aged from its `observed_at` to an injected
//       `as_of` using the per-tier half-life policy (freshness.ts), so a stale
//       fact contributes less, computed by the engine's {@link decay} inside
//       {@link combineSources}.
//
// This is an ADDITIVE wrapper: it does NOT modify {@link assembleProfile}. It
// derives the `confidence` + `ageDays` + `halfLifeDays` for each field and then
// delegates to the existing engine, so the base assembler stays the single
// roll-up implementation and everything it already guarantees (lineage, top
// tier, completeness, health, determinism) holds unchanged.
//
// UNIVERSALITY (CLAUDE.md): core/, so NO vertical noun. Meaning attaches only
// through the caller's field data + the tiers it carries. The same engine ages a
// lender profile, a regulation-environment profile, or a vendor profile.
//
// TRUTH DISCIPLINE (DOCTRINE): confidence is never a black box and NEVER a
// regulated conclusion baked into a weight. Outcome events and their effect are
// carried as explicit, source-referenced lineage (`outcome_adjustments`);
// freshness is an explicit per-field read (`field_freshness`). A human-approved
// conclusion is still produced by the human gate elsewhere — this only ages and
// corroborates the SOURCED inputs a profile rests on.
//
// PURE + DETERMINISTIC: no clock, no random, no I/O. The caller injects `id`,
// `as_of`, and every field's `observed_at`. Same input → byte-identical output.

import type { TruthTier } from "@/core/truth/types";
import { reinforce, type PropagateMode } from "@/core/truth/confidence";
import {
  assembleProfile,
  type AssembledProfile,
  type ProfileFieldInput,
} from "@/core/profile/assemble";
import {
  assessFreshness,
  halfLifeForTier,
  type FreshnessBand,
} from "@/core/profile/freshness";

// ---------------------------------------------------------------------------
// Clamp helper (mirrors the engine's discipline).
// ---------------------------------------------------------------------------

function clamp01(n: number): number {
  if (!Number.isFinite(n)) return 0;
  if (n < 0) return 0;
  if (n > 1) return 1;
  return n;
}

// ---------------------------------------------------------------------------
// Inputs
// ---------------------------------------------------------------------------

/**
 * One observed OUTCOME bearing on a field: reality agreed with (or contradicted)
 * the asserted value. Applied via the Confidence Engine's {@link reinforce}.
 * Carries a `source_ref` so the adjustment stays attributable (lineage, not a
 * silent nudge).
 */
export interface OutcomeEvent {
  /** True if reality confirmed the field; false if it contradicted it. */
  agreed: boolean;
  /** Learning rate in [0,1] for this event (default 0.2, the engine's default). */
  weight?: number;
  /** Traceable reference to the outcome (evidence / decision / verification id). */
  source_ref: string;
}

/** A sourced field feeding a LIVE profile: base field + freshness + outcomes. */
export interface LiveProfileFieldInput {
  key: string;
  label: string;
  value: number | string;
  unit?: string;
  /** Truth-object id this field rests on. */
  source_ref: string;
  /** Grade of the source. */
  tier: TruthTier;
  /** Prior confidence in [0,1] BEFORE outcome-feedback + freshness decay. */
  confidence: number;
  /** When the underlying fact was observed/valid (ISO). Ages toward `as_of`. */
  observed_at: string;
  /** Optional half-life override (days); default = per-tier policy. */
  half_life_days?: number;
  /** Observed outcomes that reinforce/erode the prior, in application order. */
  outcomes?: OutcomeEvent[];
}

/** Input envelope for {@link assembleLiveProfile}. */
export interface AssembleLiveProfileInput {
  id: string;
  subject_ref: string;
  subject_type: string;
  display_name: string;
  fields: LiveProfileFieldInput[];
  expected_field_keys?: string[];
  /** The instant the profile is assembled AS OF — every field ages toward it. */
  as_of: string;
  /** Roll-up mode; default "weighted" (matches the base assembler). */
  mode?: PropagateMode;
}

// ---------------------------------------------------------------------------
// Outputs
// ---------------------------------------------------------------------------

/** Per-field freshness read carried alongside the assembled profile. */
export interface FieldFreshness {
  key: string;
  source_ref: string;
  age_days: number;
  half_life_days: number;
  freshness: number;
  band: FreshnessBand;
}

/**
 * Per-field outcome-feedback read: prior → adjusted, the event count, AND the
 * ordered evidence `source_ref`s that drove the movement — so a confidence
 * adjustment stays attributable to the exact outcomes (verification/decision
 * ids) behind it (DOCTRINE: persist the lineage of a confidence change, never a
 * silent nudge), not just the field it landed on.
 */
export interface OutcomeAdjustment {
  key: string;
  /** The FIELD's source_ref (the truth object the field rests on). */
  source_ref: string;
  prior_confidence: number;
  adjusted_confidence: number;
  outcome_count: number;
  /** Ordered source_refs of the outcomes applied (the evidence lineage). */
  outcome_source_refs: string[];
}

/**
 * A LIVE assembled profile — the base {@link AssembledProfile} (unchanged
 * shape + guarantees) PLUS the live-assembly audit surface: the `as_of` it was
 * aged to, each field's freshness, and each field's outcome-feedback adjustment.
 */
export interface LiveAssembledProfile extends AssembledProfile {
  as_of: string;
  assembled_live: true;
  field_freshness: FieldFreshness[];
  outcome_adjustments: OutcomeAdjustment[];
}

// ---------------------------------------------------------------------------
// Outcome-feedback
// ---------------------------------------------------------------------------

/**
 * Apply a sequence of outcomes to a prior confidence via {@link reinforce},
 * in array order. Deterministic and monotonic per event. Exposed for testing.
 */
export function applyOutcomes(
  prior: number,
  outcomes: OutcomeEvent[] | undefined,
): number {
  let c = clamp01(prior);
  if (!outcomes) return c;
  for (const o of outcomes) {
    c = reinforce(c, o.agreed, o.weight ?? 0.2);
  }
  return c;
}

// ---------------------------------------------------------------------------
// assembleLiveProfile
// ---------------------------------------------------------------------------

/**
 * Assemble a deterministic, explainable profile whose confidence is DRIVEN by
 * the Confidence Engine: each field is first outcome-adjusted ({@link reinforce})
 * then aged toward `as_of` ({@link decay}, via the base assembler's
 * `ageDays`/`halfLifeDays` path). The rollup, top tier, lineage, completeness and
 * health all come from the unmodified {@link assembleProfile}.
 *
 * Empty `fields` yield a well-formed empty live profile (confidence 0, top_tier
 * null, health "thin", empty freshness/adjustment lists).
 */
export function assembleLiveProfile(
  input: AssembleLiveProfileInput,
): LiveAssembledProfile {
  const fields = input.fields ?? [];

  const field_freshness: FieldFreshness[] = [];
  const outcome_adjustments: OutcomeAdjustment[] = [];

  // Derive each base field: outcome-adjusted confidence + freshness age/half-life.
  const baseFields: ProfileFieldInput[] = fields.map((f) => {
    const prior = clamp01(f.confidence);
    const adjusted = applyOutcomes(prior, f.outcomes);
    const halfLife = f.half_life_days ?? halfLifeForTier(f.tier);
    const fresh = assessFreshness(f.observed_at, input.as_of, halfLife);

    field_freshness.push({
      key: f.key,
      source_ref: f.source_ref,
      age_days: fresh.age_days,
      half_life_days: fresh.half_life_days,
      freshness: fresh.freshness,
      band: fresh.band,
    });
    outcome_adjustments.push({
      key: f.key,
      source_ref: f.source_ref,
      prior_confidence: prior,
      adjusted_confidence: adjusted,
      outcome_count: f.outcomes ? f.outcomes.length : 0,
      // The evidence behind the movement — ordered so the adjustment is auditable.
      outcome_source_refs: f.outcomes ? f.outcomes.map((o) => o.source_ref) : [],
    });

    const out: ProfileFieldInput = {
      key: f.key,
      label: f.label,
      value: f.value,
      source_ref: f.source_ref,
      tier: f.tier,
      // The outcome-adjusted prior becomes the source value; the base assembler
      // then decays it by (ageDays, halfLifeDays) inside combineSources.
      confidence: adjusted,
      ageDays: fresh.age_days,
      halfLifeDays: fresh.half_life_days,
    };
    if (f.unit !== undefined) out.unit = f.unit;
    return out;
  });

  const base = assembleProfile({
    id: input.id,
    subject_ref: input.subject_ref,
    subject_type: input.subject_type,
    display_name: input.display_name,
    fields: baseFields,
    expected_field_keys: input.expected_field_keys,
    created_at: input.as_of,
    mode: input.mode ?? "weighted",
  });

  return {
    ...base,
    as_of: input.as_of,
    assembled_live: true,
    field_freshness,
    outcome_adjustments,
  };
}
