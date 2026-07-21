// cartridges/cooperative_markets/deal_engine.ts
//
// VC Deal Engine — P1: intake + scoring (VC_DEAL_ENGINE_SPEC §5, ADR-0016).
//
// Vehicle-agnostic, DETERMINISTIC scoring — the cheapest sufficient intelligence
// (Constitution routing ladder, rung 1). It turns a sourced StartupProfile (and the
// target institution's readiness inputs) into the canonical scoring set — Innovation,
// Startup Readiness, Institution Readiness, Dispatch Readiness, and Opportunity — and
// a screening RECOMMENDATION.
//
// Truth discipline (DOCTRINE / ADR-0005): every score is a calculation over sourced
// facts. Each factor carries its own `source_ref` + `confidence`, and each Score
// exposes its full `lineage` (the source refs it was computed from). Nothing here is
// a conclusion in weights: the numbers are explainable and traceable, and the
// recommendation is a PROPOSAL (`advance` / `hold` / `decline` / `blocked`) that feeds
// the human-gated `match_review` / `diligence` workflows — it is never an autonomous
// decision.
//
// Pure module: no I/O, no side effects, deterministic for a given input. The cartridge
// (startup_screening / opportunity_triage) calls this; the engine stays vehicle-blind.

// ---------------------------------------------------------------------------
// Inputs (sourced facts). Each numeric input is 0..1 unless noted; the caller is
// responsible for having derived it from a real assertion and passing the ref.
// ---------------------------------------------------------------------------

/** A single sourced fact: a normalized value plus where it came from. */
export interface SourcedInput {
  /** Normalized 0..1 (higher = stronger), unless the factor spec says otherwise. */
  value: number;
  /** Truth-object id this value was derived from (traceability). */
  source_ref: string;
  /** 0..1 confidence in the value (freshness/reliability of the source). */
  confidence?: number;
}

export interface StartupProfile {
  company: string;
  /** innovation_ecosystem:startup schema_ref or entity id. */
  ref: string;
  category: string;
  // --- Innovation signals ---
  capability_differentiation?: SourcedInput;
  competitive_position?: SourcedInput;
  innovation_velocity?: SourcedInput; // roadmap cadence / shipping
  traction?: SourcedInput; // ARR / growth / customers
  // --- Startup (institutional) readiness signals ---
  compliance_readiness?: SourcedInput; // SOC 2 / policies — GATING factor
  security_posture?: SourcedInput;
  cu_references?: SourcedInput; // existing CU customers / references
  financial_stability?: SourcedInput; // funding + runway
  support_model?: SourcedInput;
  // --- Dispatch (technical) readiness signals ---
  api_maturity?: SourcedInput;
  connector_availability?: SourcedInput;
  integration_standards?: SourcedInput;
}

export interface InstitutionReadinessInput {
  institution: string;
  ref: string;
  executive_support?: SourcedInput;
  budget_capacity?: SourcedInput;
  tech_ops_capacity?: SourcedInput;
  security_compliance_posture?: SourcedInput;
  strategic_alignment?: SourcedInput;
  digital_ai_maturity?: SourcedInput;
}

/** Timing signal for a specific CU↔company pairing (0..1; higher = more timely). */
export interface OpportunityContext {
  strategic_fit: SourcedInput;
  regulatory_fit: SourcedInput;
  timing: SourcedInput;
}

// ---------------------------------------------------------------------------
// Outputs (sourced inferences). A Score is a weighted roll-up that keeps its
// factors and lineage so it is explainable and traceable — not a black box.
// ---------------------------------------------------------------------------

export interface ScoreFactor {
  key: string;
  label: string;
  value: number; // 0..1
  weight: number; // relative weight within the score
  source_ref: string;
  confidence: number; // 0..1
  /** True when a missing input forced a conservative default (lowers confidence). */
  imputed?: boolean;
}

export interface Score {
  key: string;
  label: string;
  /** 0..100, weighted roll-up of the factors. */
  value: number;
  /** 0..1, the confidence-weighted certainty of this score. */
  confidence: number;
  factors: ScoreFactor[];
  /** All distinct source refs this score was computed from (traceability). */
  lineage: string[];
  /** Marks that this is a Dispatch inference (truth tier), not a fact. */
  tier: "dispatch_inference";
}

export type Recommendation = "advance" | "hold" | "decline" | "blocked";

export interface DealScorecard {
  company: string;
  institution: string;
  scores: {
    innovation: Score;
    startup_readiness: Score;
    institution_readiness: Score;
    dispatch_readiness: Score;
    opportunity: Score;
  };
  /** Screening recommendation — a PROPOSAL, human-gated downstream. */
  recommendation: Recommendation;
  /** Why: the deterministic rationale + any blocking gate. */
  rationale: string;
  /** All source refs across every score (deduped) — the scorecard's evidence set. */
  lineage: string[];
  generated_by: "deal_engine:v1";
}

// ---------------------------------------------------------------------------
// Scoring primitives
// ---------------------------------------------------------------------------

const DEFAULT_CONF = 0.5;
/** Conservative default for a missing input: mid-low value, low confidence, flagged. */
const MISSING: SourcedInput = { value: 0.4, source_ref: "unsourced:missing", confidence: 0.2 };

function factor(key: string, label: string, weight: number, input: SourcedInput | undefined): ScoreFactor {
  const src = input ?? MISSING;
  const value = clamp01(src.value);
  const confidence = clamp01(src.confidence ?? DEFAULT_CONF);
  return { key, label, value, weight, source_ref: src.source_ref, confidence, imputed: input === undefined };
}

function clamp01(n: number): number {
  if (Number.isNaN(n)) return 0;
  return n < 0 ? 0 : n > 1 ? 1 : n;
}

function round(n: number, dp = 1): number {
  const f = 10 ** dp;
  return Math.round(n * f) / f;
}

/** Weighted roll-up of factors into a 0..100 Score with confidence + lineage. */
function rollup(key: string, label: string, factors: ScoreFactor[]): Score {
  const totalWeight = factors.reduce((s, f) => s + f.weight, 0) || 1;
  const weightedValue = factors.reduce((s, f) => s + f.value * f.weight, 0) / totalWeight;
  // Confidence is weighted by the same factor weights, then damped by coverage
  // (imputed factors erode certainty).
  const weightedConf = factors.reduce((s, f) => s + f.confidence * f.weight, 0) / totalWeight;
  const coverage = factors.filter((f) => !f.imputed).length / factors.length;
  const confidence = clamp01(weightedConf * (0.6 + 0.4 * coverage));
  const lineage = [...new Set(factors.map((f) => f.source_ref).filter((r) => r !== MISSING.source_ref))];
  return { key, label, value: round(weightedValue * 100), confidence: round(confidence, 2), factors, lineage, tier: "dispatch_inference" };
}

// ---------------------------------------------------------------------------
// The five scores (VC_DEAL_ENGINE_SPEC §5)
// ---------------------------------------------------------------------------

export function scoreInnovation(p: StartupProfile): Score {
  return rollup("innovation_score", "Innovation Score", [
    factor("capability_differentiation", "Capability differentiation", 0.35, p.capability_differentiation),
    factor("competitive_position", "Competitive position", 0.25, p.competitive_position),
    factor("innovation_velocity", "Innovation velocity", 0.2, p.innovation_velocity),
    factor("traction", "Market traction", 0.2, p.traction),
  ]);
}

export function scoreStartupReadiness(p: StartupProfile): Score {
  return rollup("startup_readiness", "Startup (institutional) readiness", [
    factor("compliance_readiness", "Compliance readiness (SOC 2 / policies)", 0.3, p.compliance_readiness),
    factor("security_posture", "Security posture", 0.2, p.security_posture),
    factor("cu_references", "CU references / customers", 0.2, p.cu_references),
    factor("financial_stability", "Financial stability", 0.2, p.financial_stability),
    factor("support_model", "Support model", 0.1, p.support_model),
  ]);
}

export function scoreInstitutionReadiness(i: InstitutionReadinessInput): Score {
  return rollup("institution_readiness", "Institution innovation readiness", [
    factor("executive_support", "Executive support", 0.2, i.executive_support),
    factor("budget_capacity", "Budget capacity", 0.15, i.budget_capacity),
    factor("tech_ops_capacity", "Tech / ops capacity", 0.2, i.tech_ops_capacity),
    factor("security_compliance_posture", "Security & compliance posture", 0.2, i.security_compliance_posture),
    factor("strategic_alignment", "Strategic alignment", 0.15, i.strategic_alignment),
    factor("digital_ai_maturity", "Digital / AI maturity", 0.1, i.digital_ai_maturity),
  ]);
}

export function scoreDispatchReadiness(p: StartupProfile): Score {
  return rollup("dispatch_readiness", "Dispatch (technical) readiness", [
    factor("api_maturity", "API maturity", 0.4, p.api_maturity),
    factor("connector_availability", "Connector availability", 0.35, p.connector_availability),
    factor("integration_standards", "Integration standards", 0.25, p.integration_standards),
  ]);
}

/**
 * Opportunity Score = geometric mean of strategic_fit × regulatory_fit × timing
 * (VC_DEAL_ENGINE_SPEC §5). The geometric mean is the normalized product: a hard
 * miss on ANY dimension sinks the pairing (unlike a weighted sum), while the result
 * stays on the same 0..100 scale as the sub-scores so it's comparable and legible.
 */
export function scoreOpportunity(o: OpportunityContext): Score {
  const sf = factor("strategic_fit", "Strategic fit", 1, o.strategic_fit);
  const rf = factor("regulatory_fit", "Regulatory fit", 1, o.regulatory_fit);
  const tm = factor("timing", "Timing", 1, o.timing);
  const factors = [sf, rf, tm];
  const geomean = Math.cbrt(sf.value * rf.value * tm.value); // 0..1
  const confidence = clamp01((sf.confidence + rf.confidence + tm.confidence) / 3);
  const lineage = [...new Set(factors.map((f) => f.source_ref).filter((r) => r !== MISSING.source_ref))];
  return { key: "opportunity_score", label: "Opportunity Score", value: round(geomean * 100), confidence: round(confidence, 2), factors, lineage, tier: "dispatch_inference" };
}

// ---------------------------------------------------------------------------
// Screening recommendation (a proposal, human-gated downstream)
// ---------------------------------------------------------------------------

/** Thresholds are configurable defaults; the recommendation is advisory only. */
export interface ScreenThresholds {
  advance_opportunity: number; // >= → advance to diligence
  hold_opportunity: number; // >= → hold/gather; below → decline
  compliance_gate: number; // startup compliance_readiness below this BLOCKS
}

export const DEFAULT_THRESHOLDS: ScreenThresholds = {
  advance_opportunity: 70,
  hold_opportunity: 50,
  compliance_gate: 0.5,
};

export function assembleScorecard(
  p: StartupProfile,
  i: InstitutionReadinessInput,
  o: OpportunityContext,
  thresholds: ScreenThresholds = DEFAULT_THRESHOLDS,
): DealScorecard {
  const scores = {
    innovation: scoreInnovation(p),
    startup_readiness: scoreStartupReadiness(p),
    institution_readiness: scoreInstitutionReadiness(i),
    dispatch_readiness: scoreDispatchReadiness(p),
    opportunity: scoreOpportunity(o),
  };

  // Compliance is a GATING factor: a company that isn't compliance-ready cannot be
  // advanced regardless of how attractive it looks (VC_DEAL_ENGINE_SPEC §6/§9).
  const complianceFactor = scores.startup_readiness.factors.find((f) => f.key === "compliance_readiness");
  const complianceBlocked = (complianceFactor?.value ?? 0) < thresholds.compliance_gate;

  let recommendation: Recommendation;
  let rationale: string;
  if (complianceBlocked) {
    recommendation = "blocked";
    rationale = `Blocked: compliance readiness ${pct(complianceFactor?.value)} is below the ${pct(thresholds.compliance_gate)} gate. Resolve compliance (SOC 2 / required policies for the ${p.category} category) before any match or diligence.`;
  } else if (scores.opportunity.value >= thresholds.advance_opportunity) {
    recommendation = "advance";
    rationale = `Advance to match/diligence: opportunity score ${scores.opportunity.value} ≥ ${thresholds.advance_opportunity}, compliance gate cleared. Route to the target institution + executive lens as a match proposal.`;
  } else if (scores.opportunity.value >= thresholds.hold_opportunity) {
    recommendation = "hold";
    rationale = `Hold / gather: opportunity score ${scores.opportunity.value} is between ${thresholds.hold_opportunity} and ${thresholds.advance_opportunity}. Strengthen the weakest sourced factor before advancing.`;
  } else {
    recommendation = "decline";
    rationale = `Decline (for now): opportunity score ${scores.opportunity.value} < ${thresholds.hold_opportunity}. Re-evaluate on new sourced signals.`;
  }

  const lineage = [
    ...new Set(
      Object.values(scores).flatMap((s) => s.lineage),
    ),
  ];

  return {
    company: p.company,
    institution: i.institution,
    scores,
    recommendation,
    rationale,
    lineage,
    generated_by: "deal_engine:v1",
  };
}

function pct(n?: number): string {
  return n === undefined ? "n/a" : `${Math.round(n * 100)}%`;
}
