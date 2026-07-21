// cartridges/cooperative_markets/ingest_call_report.ts
//
// Cooperative Markets — LIVE INTAKE seam: NCUA 5300 call-report ingestion.
//
// Turns a raw quarterly 5300 payload into (a) sourced institution FACTS/KPIs
// (`CallReportFacts` — the real credit-union ratios, per the credit_union ontology:
// net_worth_ratio, roa, loan_to_share, delinquency_ratio, membership_growth) and
// (b) the `InstitutionReadinessInput` the VC deal engine (`deal_engine.ts`) consumes —
// so the engine can eventually run on LIVE data, not fixtures.
//
// Truth discipline (DOCTRINE / ADR-0005): the ratios are FACTS computed over reported
// figures — not weights, not inferences. Each downstream readiness signal is a
// `SourcedInput` that cites `facts.source_ref` (the truth-object id of the filing), so
// the deal engine's lineage traces every institution factor back to a real 5300 filing.
//
// PURE + DETERMINISTIC: no clock, no random, no I/O. The CALLER supplies the reporting
// period and the source ref (`raw.period`, `raw.source_ref`); given the same payload
// this module always returns the same facts and readiness. Every division is guarded.
//
// isolatedModules-friendly: type-only imports use `import type`; ES2020; alias "@/*".

import type {
  SourcedInput,
  InstitutionReadinessInput,
} from "@/cartridges/cooperative_markets/deal_engine";

// ---------------------------------------------------------------------------
// Raw intake (numbers AS REPORTED on the NCUA 5300, in native units — dollars and
// member counts). The caller is responsible for having pulled these from a real
// filing and for stamping the period + source_ref (traceability).
// ---------------------------------------------------------------------------

export interface Raw5300 {
  /** NCUA charter (RSSD/charter) number — institution primary key. */
  charter_number: string;
  /** Institution legal name. */
  institution: string;
  /** Reporting period, caller-supplied (e.g. "2026-Q1"). Deterministic — no clock. */
  period: string;
  total_assets: number;
  net_worth: number;
  total_loans: number;
  total_shares: number;
  net_income: number;
  /** Average assets for the period (denominator for ROA, per 5300 methodology). */
  average_assets: number;
  delinquent_loans: number;
  members: number;
  /** Prior-period member count for membership growth; optional (0/absent → no growth). */
  members_prior?: number;
  /** Optional 0..1 digital adoption share (e.g. members active on digital channels). */
  digital_adoption?: number;
  /** Truth-object id for this filing — every derived signal cites it. */
  source_ref: string;
}

// ---------------------------------------------------------------------------
// Sourced FACTS: the real computed credit-union ratios (credit_union.json KPIs).
// Units are percentages (see field docs). These are FACTS, not normalized signals.
// ---------------------------------------------------------------------------

export interface CallReportFacts {
  charter_number: string;
  institution: string;
  period: string;
  /** net_worth / total_assets * 100. PCA: >= 7% well-capitalized; < 6% undercapitalized. Unit: %. */
  net_worth_ratio: number;
  /** net_income / average_assets * 100. Return on average assets. Unit: %. */
  roa: number;
  /** total_loans / total_shares * 100. Typical 70-90%. Unit: %. */
  loan_to_share: number;
  /** delinquent_loans / total_loans * 100. < 1% healthy. Unit: %. */
  delinquency_ratio: number;
  /** (members - members_prior) / members_prior * 100. Unit: %. 0 when no prior. */
  member_growth: number;
  /** Truth-object id of the source filing (carried through for lineage). */
  source_ref: string;
}

// ---------------------------------------------------------------------------
// Pure numeric helpers
// ---------------------------------------------------------------------------

/** Clamp to the 0..1 readiness band (NaN → 0). Mirrors the deal engine's own clamp. */
export function clamp01(n: number): number {
  if (Number.isNaN(n)) return 0;
  return n < 0 ? 0 : n > 1 ? 1 : n;
}

/** Guarded division: returns 0 when the denominator is 0, NaN, or non-finite. */
function safeDiv(numerator: number, denominator: number): number {
  if (!Number.isFinite(denominator) || denominator === 0) return 0;
  const q = numerator / denominator;
  return Number.isFinite(q) ? q : 0;
}

// ---------------------------------------------------------------------------
// (2) computeCallReportFacts — raw figures → real ratios (all divisions guarded)
// ---------------------------------------------------------------------------

export function computeCallReportFacts(raw: Raw5300): CallReportFacts {
  const prior = raw.members_prior;
  return {
    charter_number: raw.charter_number,
    institution: raw.institution,
    period: raw.period,
    net_worth_ratio: safeDiv(raw.net_worth, raw.total_assets) * 100,
    roa: safeDiv(raw.net_income, raw.average_assets) * 100,
    loan_to_share: safeDiv(raw.total_loans, raw.total_shares) * 100,
    delinquency_ratio: safeDiv(raw.delinquent_loans, raw.total_loans) * 100,
    // member_growth needs a real prior baseline; absent/zero prior → 0 (no basis, not a spike).
    member_growth:
      prior === undefined || prior === 0
        ? 0
        : safeDiv(raw.members - prior, prior) * 100,
    source_ref: raw.source_ref,
  };
}

// ---------------------------------------------------------------------------
// (3) toInstitutionReadiness — facts → deal-engine readiness signals (0..1 SourcedInput)
//
// Mapping (each 5300-derived signal cites facts.source_ref, confidence high for a
// filed 5300 fact). The 5300 covers CAPITAL and MEMBERSHIP, not governance/infosec —
// so only the signals a 5300 can honestly source are derived here; the rest come from
// `extra` (or a documented conservative default) rather than being over-claimed.
// ---------------------------------------------------------------------------

/** Confidence for a signal derived directly from a filed 5300 fact. */
const FACT_CONFIDENCE = 0.85;
/** Confidence for a conservative default NOT sourced from the 5300. */
const DEFAULT_CONFIDENCE = 0.3;
/** Neutral mid value used when a non-5300 signal is neither sourced nor supplied. */
const NEUTRAL_DEFAULT = 0.5;

/**
 * Net-worth ratio (%) → capital-headroom capacity signal (0..1), PCA-aware.
 * Anchors: 7% = well-capitalized baseline (0.5); each point above adds headroom;
 * BELOW 7% the signal falls steeply (PCA restrictions constrain discretionary spend).
 *   17% → 1.0, 12% → 1.0, 7% → 0.5, 6% → ~0.21, <=3.5% → 0.0.
 */
function netWorthCapacity(netWorthRatioPct: number): number {
  const headroom = netWorthRatioPct - 7; // percentage points above the well-capitalized line
  return headroom >= 0
    ? clamp01(0.5 + headroom / 10) // gentle rise above the line
    : clamp01(0.5 + headroom / 3.5); // steep PCA-sensitive drop below the line
}

/** ROA (%) → earnings-based ability-to-fund signal (0..1). 0% → 0.5, +1% → 1.0, negative → below 0.5. */
function roaFundingSignal(roaPct: number): number {
  return clamp01(0.5 + roaPct / 2);
}

export function toInstitutionReadiness(
  facts: CallReportFacts,
  extra?: Partial<InstitutionReadinessInput>,
): InstitutionReadinessInput {
  const src = facts.source_ref;

  // budget_capacity — DERIVED from the 5300: capital cushion (net worth headroom, PCA-aware)
  // blended with profitability (ROA funds initiatives from earnings). Capital-weighted 60/40.
  const budgetValue = clamp01(
    0.6 * netWorthCapacity(facts.net_worth_ratio) + 0.4 * roaFundingSignal(facts.roa),
  );
  const budget_capacity: SourcedInput = {
    value: budgetValue,
    source_ref: src,
    confidence: FACT_CONFIDENCE,
  };

  // digital_ai_maturity — the 5300 does NOT carry digital adoption, so it is supplied via
  // `extra` (ingest() bridges raw.digital_adoption into it, see below); else a conservative
  // low-confidence default. Kept off `facts` so CallReportFacts stays purely the filed ratios.
  const digital_ai_maturity: SourcedInput =
    extra?.digital_ai_maturity ?? { value: NEUTRAL_DEFAULT, source_ref: src, confidence: DEFAULT_CONFIDENCE };

  // The rest are NOT sourced by a 5300 (governance / staffing / infosec / strategy).
  // Prefer caller-supplied `extra`; otherwise emit a documented conservative default
  // that still cites the filing so lineage is unbroken (low confidence flags it as
  // "structural default pending direct evidence").
  const conservative = (supplied?: SourcedInput): SourcedInput =>
    supplied ?? { value: NEUTRAL_DEFAULT, source_ref: src, confidence: DEFAULT_CONFIDENCE };

  return {
    institution: facts.institution,
    ref: facts.charter_number,
    executive_support: conservative(extra?.executive_support),
    budget_capacity: extra?.budget_capacity ?? budget_capacity,
    tech_ops_capacity: conservative(extra?.tech_ops_capacity),
    security_compliance_posture: conservative(extra?.security_compliance_posture),
    strategic_alignment: conservative(extra?.strategic_alignment),
    digital_ai_maturity,
  };
}

// ---------------------------------------------------------------------------
// (4/5) Tagged intake envelope + one-shot ingest
// ---------------------------------------------------------------------------

export interface CallReportInput {
  input_type: "ncua_5300_call_report";
  raw: Raw5300;
}

/** One-shot: raw 5300 payload → { sourced facts, deal-engine readiness }. Pure. */
export function ingest(
  input: CallReportInput,
): { facts: CallReportFacts; readiness: InstitutionReadinessInput } {
  const facts = computeCallReportFacts(input.raw);
  // Bridge the one non-ratio 5300 field: digital_adoption (a reported 0..1 share) →
  // digital_ai_maturity, citing the same filing. Absent → toInstitutionReadiness defaults it.
  const extra: Partial<InstitutionReadinessInput> =
    input.raw.digital_adoption === undefined
      ? {}
      : {
          digital_ai_maturity: {
            value: clamp01(input.raw.digital_adoption),
            source_ref: input.raw.source_ref,
            confidence: FACT_CONFIDENCE,
          },
        };
  const readiness = toInstitutionReadiness(facts, extra);
  return { facts, readiness };
}
