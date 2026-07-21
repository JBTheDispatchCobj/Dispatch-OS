// core/profile/assemble.ts
//
// Dispatch OS — the Profile Assembly Engine (Volume III: Knowledge Graph &
// Truth, RFC-3012).
//
// Assembles an entity / institution / company profile from SOURCED FACTS into a
// single, explainable projection. This is the generic entity-profile object the
// PERSON profile in {@link "@/core/profile/types"} refers to as "a computed
// projection over Entity + truth objects, built elsewhere" — this is elsewhere.
//
// UNIVERSALITY (CLAUDE.md): this file lives in core/ and therefore names NO
// vertical concept. It never mentions credit unions, regulators, net-worth
// ratios, or any domain noun. Meaning attaches entirely through the caller's
// field data — `subject_type`, field `key`/`label`/`value`/`unit` and the
// `tier` each fact carries. The same engine assembles a lender profile, a
// regulation-environment profile, or a vendor profile without a line changing.
//
// TRUTH DISCIPLINE (DOCTRINE): a profile is not a bag of numbers. Every field
// keeps its source_ref and truth tier; the rollup confidence, top tier and
// lineage are computed by the shared Confidence Engine ({@link combineSources},
// RFC-3008) rather than reinvented here — so the profile can be defended field
// by field and recomputed byte-for-byte from the same inputs.
//
// PURE + DETERMINISTIC: no Date.now, no Math.random, no I/O. The caller injects
// `id`, `created_at`, and any `ageDays`/`halfLifeDays`. Same input yields
// byte-identical output. All confidence/ratio outputs are clamped to [0,1].

import type { TruthTier } from "@/core/truth/types";
import { combineSources, type PropagateMode } from "@/core/truth/confidence";

// ---------------------------------------------------------------------------
// Clamp helper (mirrors the Confidence Engine's discipline: bad input can never
// silently escape the [0,1] interval).
// ---------------------------------------------------------------------------

/** Clamp any number into the closed interval [0,1]; non-finite collapses to 0. */
function clamp01(n: number): number {
  if (!Number.isFinite(n)) return 0;
  if (n < 0) return 0;
  if (n > 1) return 1;
  return n;
}

// ---------------------------------------------------------------------------
// Inputs
// ---------------------------------------------------------------------------

/** One sourced field feeding a profile (already normalized by the caller). */
export interface ProfileFieldInput {
  key: string;
  label: string;
  value: number | string; // the fact value (number or short string)
  unit?: string;
  source_ref: string; // truth-object id this field rests on
  tier: TruthTier; // grade of the source
  confidence: number; // 0..1
  ageDays?: number; // optional (for decay via the confidence engine)
  halfLifeDays?: number; // optional (for decay)
}

/** A field as it lands in the assembled profile, with its post-decay weight. */
export interface AssembledProfileField {
  key: string;
  label: string;
  value: number | string;
  unit?: string;
  source_ref: string;
  tier: TruthTier;
  confidence: number; // POST-DECAY contributed confidence for this field
}

/** Banded overall strength of a profile (see {@link assembleProfile}). */
export type ProfileHealth = "strong" | "adequate" | "thin";

/**
 * The assembled entity-profile projection. Beyond the field list it carries the
 * rollup confidence, the top tier present, the ordered lineage of source_refs,
 * a completeness ratio and a banded health — the audit surface that keeps the
 * profile defensible rather than an opaque summary.
 */
export interface AssembledProfile {
  id: string;
  subject_ref: string; // entity/charter id the profile is about
  subject_type: string; // caller-supplied, e.g. "credit_union" | "regulation_environment"
  display_name: string;
  fields: AssembledProfileField[];
  confidence: number; // 0..1 rollup over all field confidences (combineSources)
  top_tier: TruthTier | null; // most authoritative tier present
  lineage: string[]; // ordered distinct source_refs
  completeness: number; // 0..1 = covered expected fields / expected fields
  health: ProfileHealth; // banded from confidence * completeness
  created_at: string;
  generated_by: "profile_assembler:v1";
}

/** Input envelope for {@link assembleProfile}. */
export interface AssembleProfileInput {
  id: string;
  subject_ref: string;
  subject_type: string;
  display_name: string;
  fields: ProfileFieldInput[];
  expected_field_keys?: string[]; // for completeness; defaults to the keys present
  created_at: string;
  mode?: PropagateMode; // rollup mode; DEFAULT "weighted"
}

// ---------------------------------------------------------------------------
// Completeness
// ---------------------------------------------------------------------------

/**
 * Coverage ratio in [0,1]: how many of the expected field keys are actually
 * present. When the caller declares no `expected_field_keys`, completeness is a
 * plain presence signal — 1 when at least one field arrived, else 0.
 *
 * Deterministic and set-based: duplicate expected keys are de-duplicated, and a
 * present key counts once regardless of how many fields carry it.
 */
function computeCompleteness(
  fields: ProfileFieldInput[],
  expectedFieldKeys: string[] | undefined,
): number {
  if (expectedFieldKeys === undefined) {
    return fields.length > 0 ? 1 : 0;
  }

  const expected: string[] = [];
  const seenExpected = new Set<string>();
  for (const k of expectedFieldKeys) {
    if (!seenExpected.has(k)) {
      seenExpected.add(k);
      expected.push(k);
    }
  }
  if (expected.length === 0) return 0;

  const present = new Set<string>();
  for (const f of fields) present.add(f.key);

  let covered = 0;
  for (const k of expected) {
    if (present.has(k)) covered += 1;
  }
  return clamp01(covered / expected.length);
}

// ---------------------------------------------------------------------------
// Health banding
// ---------------------------------------------------------------------------

/**
 * Band the combined strength of a profile into a coarse label.
 *
 * strength = confidence * completeness — a profile is only as healthy as the
 * product of HOW SURE we are of its fields and HOW MANY of the expected fields
 * we actually have. A confident-but-sparse profile and a complete-but-shaky one
 * are both penalized.
 *
 *   strong   — strength >= 0.66
 *   adequate — strength >= 0.40
 *   thin     — otherwise (includes the empty profile)
 */
function bandHealth(strength: number): ProfileHealth {
  if (strength >= 0.66) return "strong";
  if (strength >= 0.4) return "adequate";
  return "thin";
}

// ---------------------------------------------------------------------------
// assembleProfile
// ---------------------------------------------------------------------------

/**
 * Assemble a deterministic, explainable entity/institution/company profile from
 * sourced fields.
 *
 * Each field is turned into a {@link "@/core/truth/confidence".ConfidenceInput}
 * (its `confidence` becomes the source value; its `tier`, `source_ref`,
 * `ageDays` and `halfLifeDays` pass straight through) and the whole set is
 * rolled up by {@link combineSources} using `mode` (default "weighted"). The
 * roll-up's `.value` becomes the profile confidence, `.top_tier` the top tier,
 * `.lineage` the lineage, and each source's `.factors[].contributed` becomes
 * that field's POST-DECAY confidence.
 *
 * Because `combineSources` builds its `factors` array positionally from the
 * inputs (same length, same order), we map factor i back to field i by index —
 * a direct 1:1 correspondence, no lookup or de-dup that could misattribute a
 * decayed weight across fields that happen to share a source_ref.
 *
 * Empty `fields` yield a well-formed empty profile: confidence 0, top_tier null,
 * empty lineage, completeness 0, health "thin".
 *
 * @param input the profile assembly request.
 * @returns the assembled profile; same input always produces identical output.
 */
export function assembleProfile(input: AssembleProfileInput): AssembledProfile {
  const mode: PropagateMode = input.mode ?? "weighted";
  const fields = input.fields ?? [];

  // Build the sourced-confidence inputs, preserving field order 1:1 so the
  // returned factors align by index with `fields`.
  const confidenceInputs = fields.map((f) => ({
    value: f.confidence,
    tier: f.tier,
    source_ref: f.source_ref,
    ageDays: f.ageDays,
    halfLifeDays: f.halfLifeDays,
  }));

  const rollup = combineSources(confidenceInputs, mode);

  // Project each field, adopting its post-decay contribution from the aligned
  // factor. `factors[i]` corresponds to `fields[i]` by construction.
  const assembledFields: AssembledProfileField[] = fields.map((f, i) => {
    const factor = rollup.factors[i];
    const contributed = factor !== undefined ? factor.contributed : clamp01(f.confidence);
    const out: AssembledProfileField = {
      key: f.key,
      label: f.label,
      value: f.value,
      source_ref: f.source_ref,
      tier: f.tier,
      confidence: clamp01(contributed),
    };
    if (f.unit !== undefined) out.unit = f.unit;
    return out;
  });

  // Lineage is the DISTINCT source_refs in first-seen order. `combineSources`
  // returns a positional lineage (one entry per source, duplicates possible
  // when several fields rest on the same truth object); we de-duplicate here so
  // the profile's provenance chain lists each source exactly once.
  const lineage: string[] = [];
  const seenRefs = new Set<string>();
  for (const ref of rollup.lineage) {
    if (!seenRefs.has(ref)) {
      seenRefs.add(ref);
      lineage.push(ref);
    }
  }

  const completeness = computeCompleteness(fields, input.expected_field_keys);
  const confidence = clamp01(rollup.value);
  const strength = clamp01(confidence * completeness);

  return {
    id: input.id,
    subject_ref: input.subject_ref,
    subject_type: input.subject_type,
    display_name: input.display_name,
    fields: assembledFields,
    confidence,
    top_tier: rollup.top_tier,
    lineage,
    completeness,
    health: bandHealth(strength),
    created_at: input.created_at,
    generated_by: "profile_assembler:v1",
  };
}
