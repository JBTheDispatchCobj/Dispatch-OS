// cartridges/cooperative_markets/ingest_batch.ts
//
// Cooperative Markets — BATCH 5300 intake: run the call-report path over a whole
// batch of institutions and assemble a truth-tiered profile per institution.
//
// For each 5300 payload this: (a) `ingest()`s it into sourced `CallReportFacts` +
// the deal engine's `InstitutionReadinessInput`, and (b) turns the five computed
// call-report ratios into an `AssembledProfile` via the shared profile assembler.
//
// Truth discipline (DOCTRINE / ADR-0005): the five ratios (net_worth_ratio, roa,
// loan_to_share, delinquency_ratio, member_growth) are DETERMINISTIC CALCULATIONS
// over the reported 5300 figures — not weights, not inferences. Every profile field
// is therefore tagged `tier: "deterministic_calculation"` and cites `facts.source_ref`
// (the truth-object id of the filing), so each field traces back to its filing. We do
// NOT invent facts here — we only re-express the ratios `computeCallReportFacts` already
// derived.
//
// NOTE on the underlying data: in the fixture path the payloads come from
// `batch_fixtures.ts`, which are ILLUSTRATIVE fixtures pending a real NCUA 5300
// connector — not real filings. This module is source-agnostic: it computes the same
// way over fixtures or a future live connector; it does not itself assert realness.
//
// PURE + DETERMINISTIC: no clock, no random, no I/O. The caller injects `observed_at`
// (the profile `created_at` stamp) and `id_prefix` (the profile id namespace) via
// `BatchContext`, so given the same inputs this module always returns the same results.
// isolatedModules-friendly: type-only imports use `import type`; values (`ingest`,
// `assembleProfile`) are normal imports; ES2022; alias "@/*".

import {
  ingest,
  type CallReportInput,
  type CallReportFacts,
} from "@/cartridges/cooperative_markets/ingest_call_report";
import type { InstitutionReadinessInput } from "@/cartridges/cooperative_markets/deal_engine";
import {
  assembleProfile,
  type AssembledProfile,
  type ProfileFieldInput,
} from "@/core/profile/assemble";

// ---------------------------------------------------------------------------
// Result + context contracts
// ---------------------------------------------------------------------------

/** One institution's batch output: the sourced facts, deal-engine readiness, and profile. */
export interface InstitutionBatchResult {
  facts: CallReportFacts;
  readiness: InstitutionReadinessInput;
  profile: AssembledProfile;
}

/** Caller-injected, deterministic run context (keeps this module clock- and I/O-free). */
export interface BatchContext {
  /** ISO timestamp stamped as each profile's `created_at` (caller-supplied — no clock). */
  observed_at: string;
  /** Namespace for the deterministic per-institution profile id. */
  id_prefix: string;
}

// ---------------------------------------------------------------------------
// Ratio → profile-field mapping
// ---------------------------------------------------------------------------

/** Confidence for a ratio computed from a filed 5300 (a deterministic calc over reported figures). */
const FILED_5300_CALC_CONFIDENCE = 0.9;

/** The five call-report ratio keys, in profile display order — the expected profile fields. */
export const CALL_REPORT_RATIO_KEYS: string[] = [
  "net_worth_ratio",
  "roa",
  "loan_to_share",
  "delinquency_ratio",
  "member_growth",
];

/** Human-readable label per ratio key (kept alongside the keys so both stay in sync). */
const RATIO_LABELS: Record<string, string> = {
  net_worth_ratio: "Net-worth ratio",
  roa: "Return on average assets (ROA)",
  loan_to_share: "Loan-to-share ratio",
  delinquency_ratio: "Delinquency ratio",
  member_growth: "Member growth",
};

/**
 * Map computed `CallReportFacts` → profile fields. Each of the five ratios becomes a
 * `deterministic_calculation` field, unit "%", citing `facts.source_ref` (the filing).
 * Exposed for the data-integrity gate so it can assert the tiers/units directly.
 */
export function factsToProfileFields(facts: CallReportFacts): ProfileFieldInput[] {
  // Values pulled straight off `facts` — the ratios `computeCallReportFacts` already
  // derived. No new arithmetic here: we re-express existing calculations, never invent.
  const values: Record<string, number> = {
    net_worth_ratio: facts.net_worth_ratio,
    roa: facts.roa,
    loan_to_share: facts.loan_to_share,
    delinquency_ratio: facts.delinquency_ratio,
    member_growth: facts.member_growth,
  };

  return CALL_REPORT_RATIO_KEYS.map((key) => ({
    key,
    label: RATIO_LABELS[key],
    value: values[key],
    unit: "%",
    source_ref: facts.source_ref, // every field traces back to the filing
    tier: "deterministic_calculation", // ratios are calcs over reported figures, not inferences
    confidence: FILED_5300_CALC_CONFIDENCE,
  }));
}

// ---------------------------------------------------------------------------
// Batch runner
// ---------------------------------------------------------------------------

/**
 * Ingest a batch of 5300 payloads → per institution: sourced facts, deal-engine
 * readiness, and an assembled institution profile. Pure/deterministic: the profile id
 * is derived from `ctx.id_prefix` + the charter number, and `created_at` is the
 * caller-injected `ctx.observed_at`, so the same batch always yields the same output.
 */
export function ingestInstitutionBatch(
  inputs: CallReportInput[],
  ctx: BatchContext,
): InstitutionBatchResult[] {
  return inputs.map((input) => {
    const { facts, readiness } = ingest(input);
    const fields = factsToProfileFields(facts);

    const profile = assembleProfile({
      id: `${ctx.id_prefix}:profile:${facts.charter_number}`, // deterministic per charter
      subject_ref: facts.charter_number,
      subject_type: "credit_union",
      display_name: facts.institution,
      fields,
      expected_field_keys: CALL_REPORT_RATIO_KEYS,
      created_at: ctx.observed_at,
      mode: "weighted",
    });

    return { facts, readiness, profile };
  });
}
