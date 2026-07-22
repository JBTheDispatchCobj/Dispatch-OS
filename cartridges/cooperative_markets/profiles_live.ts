// cartridges/cooperative_markets/profiles_live.ts
//
// Cooperative Markets — LIVE profile assembly over REAL sourced facts.
//
// Wires the two real intake paths into the Confidence-Engine-driven live
// assembler (`core/profile/assemble_live.ts`), so profiles are no longer a fixed
// 0.9 snapshot but AGE from their source date toward an injected `as_of` and can
// absorb observed outcomes:
//
//   (1) REGULATION ENVIRONMENT profile — over the REAL NCUA corpus (675 in-force
//       12 CFR sections + pending amendments; `ingest_regulations.ts`). Its
//       coverage counts are deterministic calculations over the corpus that age
//       from the eCFR issue date, so a year-old regulatory snapshot reads as less
//       current than a fresh one.
//   (2) INSTITUTION profiles — over the 5300 batch (`ingest_batch.ts`). The five
//       call-report ratios age from the reporting quarter-end toward `as_of`, and
//       a caller may attach observed outcomes (e.g. a later verification) per ratio.
//
// Both feed the generic query surface (`core/profile/query.ts`) as plain
// `AssembledProfile`s.
//
// ⚠️ DATA HONESTY (carried from ingest_batch / batch_fixtures headers): the
// REGULATION ENVIRONMENT profile rests on REAL primary-source regulatory text at
// scale. The INSTITUTION profiles rest on `batch_fixtures.ts` — ILLUSTRATIVE
// 5300 payloads, NOT real filings (the real per-CU 5300 connector is a deferred,
// Bryan-only item). The live-assembly ENGINE is real either way; the institution
// FIGURES are labeled fixtures and must never be cited as fact about a real CU.
//
// TRUTH DISCIPLINE (DOCTRINE): no vertical conclusion in a weight. Every field is
// a sourced fact/calculation citing its truth-object id; the regulatory counts are
// `deterministic_calculation`s over `public_fact` observations; nothing here
// produces a regulated conclusion — assembly only ages + corroborates sourced
// inputs.
//
// PURE + DETERMINISTIC: no clock, no random, no I/O. The caller injects `as_of`,
// `id_prefix`, and (for regulation) the corpus whose SourceDocument carries the
// issue date. Same inputs → byte-identical profiles. isolatedModules-friendly.

import type { RegulatoryCorpus } from "@/cartridges/cooperative_markets/ingest_regulations";
import type { InstitutionBatchResult } from "@/cartridges/cooperative_markets/ingest_batch";
import {
  factsToProfileFields,
  CALL_REPORT_RATIO_KEYS,
} from "@/cartridges/cooperative_markets/ingest_batch";
import {
  assembleLiveProfile,
  type LiveAssembledProfile,
  type LiveProfileFieldInput,
  type OutcomeEvent,
} from "@/core/profile/assemble_live";
import type { AssembledProfile } from "@/core/profile/assemble";

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

/** Per-ratio outcomes for one institution, keyed by ratio key. */
export type InstitutionOutcomes = Record<string, OutcomeEvent[]>;

/** Caller-injected, deterministic run context (no clock/I-O). */
export interface LiveProfileContext {
  /** The instant profiles are assembled AS OF — every field ages toward it. */
  as_of: string;
  /** Namespace for deterministic profile ids. */
  id_prefix: string;
  /**
   * Optional observed outcomes per institution charter → per ratio key. Absorbed
   * via the confidence engine's reinforce() before freshness decay.
   */
  institution_outcomes?: Record<string, InstitutionOutcomes>;
}

// ---------------------------------------------------------------------------
// period → quarter-end ISO (the 5300 as-of date the freshness ages from)
// ---------------------------------------------------------------------------

/** Calendar quarter-end (UTC midnight) for a "YYYY-Qn" reporting period. */
const QUARTER_END: Record<string, string> = {
  Q1: "-03-31T00:00:00.000Z",
  Q2: "-06-30T00:00:00.000Z",
  Q3: "-09-30T00:00:00.000Z",
  Q4: "-12-31T00:00:00.000Z",
};

/**
 * Map a 5300 reporting `period` ("2026-Q1") to the quarter-end ISO instant the
 * filing is AS OF — the observed date freshness decays from. A period already in
 * ISO form is returned unchanged; an unrecognized period falls back to the
 * injected `as_of` (age 0 — no spurious decay from a bad label).
 */
export function periodToObservedAt(period: string, fallbackAsOf: string): string {
  const m = /^(\d{4})-(Q[1-4])$/.exec(period.trim());
  if (m) return `${m[1]}${QUARTER_END[m[2]]}`;
  if (/^\d{4}-\d{2}-\d{2}/.test(period.trim())) return period.trim();
  return fallbackAsOf;
}

// ---------------------------------------------------------------------------
// (1) Institution live profiles (over the 5300 batch)
// ---------------------------------------------------------------------------

/**
 * Assemble ONE live institution profile from a batch result: the five call-report
 * ratios, each aged from the reporting quarter-end toward `ctx.as_of`, with any
 * caller-supplied per-ratio outcomes absorbed first. Reuses `factsToProfileFields`
 * (same keys/labels/units/tiers/source_ref) and only layers freshness + outcomes.
 */
export function assembleLiveInstitutionProfile(
  result: InstitutionBatchResult,
  ctx: LiveProfileContext,
): LiveAssembledProfile {
  const facts = result.facts;
  const observed_at = periodToObservedAt(facts.period, ctx.as_of);
  const outcomes = ctx.institution_outcomes?.[facts.charter_number];

  const fields: LiveProfileFieldInput[] = factsToProfileFields(facts).map((f) => {
    const live: LiveProfileFieldInput = {
      key: f.key,
      label: f.label,
      value: f.value,
      source_ref: f.source_ref,
      tier: f.tier,
      confidence: f.confidence,
      observed_at,
    };
    if (f.unit !== undefined) live.unit = f.unit;
    const fieldOutcomes = outcomes?.[f.key];
    if (fieldOutcomes && fieldOutcomes.length > 0) live.outcomes = fieldOutcomes;
    return live;
  });

  return assembleLiveProfile({
    id: `${ctx.id_prefix}:live:profile:${facts.charter_number}`,
    subject_ref: facts.charter_number,
    subject_type: "credit_union",
    display_name: facts.institution,
    fields,
    expected_field_keys: CALL_REPORT_RATIO_KEYS,
    as_of: ctx.as_of,
    mode: "weighted",
  });
}

/** Assemble live institution profiles for a whole batch (deterministic order). */
export function assembleLiveInstitutionProfiles(
  batch: InstitutionBatchResult[],
  ctx: LiveProfileContext,
): LiveAssembledProfile[] {
  return batch.map((r) => assembleLiveInstitutionProfile(r, ctx));
}

// ---------------------------------------------------------------------------
// (2) Regulation-environment live profile (over the REAL corpus)
// ---------------------------------------------------------------------------

/** The regulation-environment coverage fields, in display order (expected keys). */
export const REGULATION_ENVIRONMENT_FIELD_KEYS: string[] = [
  "in_force_sections",
  "pending_amendments",
  "held_instructions",
  "parts_covered",
  "largest_part_sections",
];

/** Confidence for an exact deterministic count over the corpus (pre-decay). */
const CORPUS_COUNT_CONFIDENCE = 0.95;

/**
 * Assemble ONE live profile describing the REAL regulatory environment from an
 * ingested corpus. Each coverage field is a `deterministic_calculation` (a count
 * over the corpus) citing the corpus SourceDocument, aged from the eCFR ISSUE
 * DATE (`source_document.published_at`) toward `ctx.as_of` — so the profile's
 * confidence reflects how current the snapshot is.
 */
export function assembleRegulationEnvironmentProfile(
  corpus: RegulatoryCorpus,
  ctx: LiveProfileContext,
): LiveAssembledProfile {
  const src = corpus.source_document.id;
  // Issue date (valid-time) is the observed_at freshness ages from; fall back to
  // as_of if the SourceDocument didn't carry a publish date (no spurious decay).
  const observed_at = corpus.source_document.published_at ?? ctx.as_of;
  const largestPart = corpus.parts.reduce((m, p) => (p.count > m ? p.count : m), 0);

  const counts: Record<string, number> = {
    in_force_sections: corpus.total_sections,
    pending_amendments: corpus.pending_full_text,
    held_instructions: corpus.held_instructions,
    parts_covered: corpus.parts.length,
    largest_part_sections: largestPart,
  };
  const labels: Record<string, string> = {
    in_force_sections: "In-force 12 CFR sections",
    pending_amendments: "Pending amendments (full text, future-dated)",
    held_instructions: "Held amendatory instructions (pending merge)",
    parts_covered: "12 CFR parts covered",
    largest_part_sections: "Largest part (section count)",
  };

  const fields: LiveProfileFieldInput[] = REGULATION_ENVIRONMENT_FIELD_KEYS.map(
    (key) => ({
      key,
      label: labels[key],
      value: counts[key],
      unit: "count",
      source_ref: src, // every count traces to the corpus SourceDocument
      tier: "deterministic_calculation", // a count over the corpus, not an inference
      confidence: CORPUS_COUNT_CONFIDENCE,
      observed_at,
    }),
  );

  return assembleLiveProfile({
    id: `${ctx.id_prefix}:live:profile:regulation_environment`,
    subject_ref: "regulation_environment:12_cfr_chapter_vii",
    subject_type: "regulation_environment",
    display_name: "NCUA Regulatory Environment — 12 CFR Chapter VII",
    fields,
    expected_field_keys: REGULATION_ENVIRONMENT_FIELD_KEYS,
    as_of: ctx.as_of,
    mode: "weighted",
  });
}

// ---------------------------------------------------------------------------
// (3) buildLiveProfiles — one call: real corpus + batch → queryable profiles
// ---------------------------------------------------------------------------

export interface LiveProfileSet {
  /** Live institution profiles (over the 5300 batch). */
  institutions: LiveAssembledProfile[];
  /** The live regulation-environment profile (over the REAL corpus). */
  regulation_environment: LiveAssembledProfile;
  /** All profiles as the generic base type, ready for `queryProfiles`. */
  all: AssembledProfile[];
}

/**
 * Assemble the full live profile set: institution profiles + the regulation-
 * environment profile, all aged to `ctx.as_of`. `all` is the flat list to feed
 * the query surface. Deterministic.
 */
export function buildLiveProfiles(
  inputs: { corpus: RegulatoryCorpus; batch: InstitutionBatchResult[] },
  ctx: LiveProfileContext,
): LiveProfileSet {
  const institutions = assembleLiveInstitutionProfiles(inputs.batch, ctx);
  const regulation_environment = assembleRegulationEnvironmentProfile(
    inputs.corpus,
    ctx,
  );
  return {
    institutions,
    regulation_environment,
    all: [...institutions, regulation_environment],
  };
}
