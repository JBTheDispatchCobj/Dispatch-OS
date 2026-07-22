// app/_surfaces/opportunities_view.ts
//
// Olympic Sprint IV — Wave 2. The PURE view-model builder for the `/opportunities`
// surface (promoted from a scaffold to a REAL surface over the deal-engine output).
//
// Each opportunity is a scored, sourced deal-engine result: the opportunity score,
// the advance/hold/decline/blocked RECOMMENDATION, its per-factor lineage, and the
// ICApproval human gate that governs whether it may advance to allocation. The
// doctrine states it renders distinctly:
//   * inferred         — the score/recommendation is a DISPATCH INFERENCE over sourced
//                        signals (tier `dispatch_inference`), never a fact and never a
//                        regulated conclusion in a weight;
//   * pending_approval — a recommended-to-advance opportunity still owes the ICApproval
//                        human gate (nothing advances to allocation automatically —
//                        proven by the pipeline: an unapproved deal halts awaiting_approval,
//                        allocating/settling/publishing nothing);
//   * conflicted       — a BLOCKED opportunity (a compliance/eligibility gate stopped it)
//                        or a rejected ICApproval;
//   * current          — an opportunity whose ICApproval was human-APPROVED (advanced).
//
// GATE DISCIPLINE. This builder NEVER decides and NEVER advances. `advancing` means
// "recommended to advance AND awaiting the human gate" — not "advanced". The ICApproval
// gate is a human act taken through the pipeline (`runDealPipeline` requires an approved
// `ICApproval` before it allocates); this surface triages, it is not the decision surface,
// so it exposes no auto-advance control. The projection can never flip a pending gate.
//
// PURE (no store, no clock: `as_of` injected) + GENERIC (the builder names no vertical;
// it consumes already-scored inputs). ERASABLE-ONLY TS so the debug loop + `node --test`
// import it directly under native type-stripping.

export type OpportunityRecommendation = "advance" | "hold" | "decline" | "blocked";
export type OpportunityGateDisposition = "approved" | "rejected" | "deferred";
export type OpportunityState = "current" | "inferred" | "pending_approval" | "conflicted";

/** A compact, sourced sub-score carried for the scorecard drill-through. */
export interface OpportunityScoreVM {
  key: string;
  label: string;
  value: number;
  confidence: number;
}

/**
 * One deal-engine opportunity, pre-scored by the caller (the runner maps a
 * `DealScorecard` → this shape). `gate` is the ICApproval disposition IF a human has
 * acted; null means the gate is still owed. `tier` is carried so the "inferred"
 * doctrine state is asserted from the real engine tier, not assumed.
 */
export interface OpportunityInput {
  id: string;
  company: string;
  institution: string;
  category: string;
  /** 0..100 opportunity score (a dispatch inference). */
  opportunityScore: number;
  confidence: number;
  recommendation: OpportunityRecommendation;
  /** The truth tier of the recommendation — must be `dispatch_inference` (never a fact). */
  tier: string;
  rationale: string;
  /** Source refs every score traces to (lineage — the intake submission, sourced facts). */
  lineage: string[];
  scores: OpportunityScoreVM[];
  /** The ICApproval human-gate disposition, or null if a human has not acted. */
  gate: { disposition: OpportunityGateDisposition; by: string; decision_ref: string } | null;
}

export interface OpportunityRowVM {
  id: string;
  company: string;
  institution: string;
  category: string;
  opportunityScore: number;
  confidence: number;
  recommendation: OpportunityRecommendation;
  rationale: string;
  lineage: string[];
  hasLineage: boolean;
  scores: OpportunityScoreVM[];
  gate: { disposition: OpportunityGateDisposition; by: string; decision_ref: string } | null;
  /** A recommended-to-advance opportunity awaiting the ICApproval human gate. */
  awaitingApproval: boolean;
  /** True iff the recommendation is an inference (tier `dispatch_inference`). */
  inferred: boolean;
  /** Bucket: open (advance/hold) vs blocked (blocked/decline). */
  bucket: "open" | "blocked";
  states: OpportunityState[];
}

export interface OpportunitiesVM {
  generatedAt: string;
  counts: {
    total: number;
    advancing: number;
    awaitingApproval: number;
    blocked: number;
    approved: number;
    byRecommendation: Record<string, number>;
  };
  open: OpportunityRowVM[];
  blocked: OpportunityRowVM[];
}

/** The doctrine states one opportunity renders distinctly. */
export function opportunityStates(o: OpportunityInput): OpportunityState[] {
  const states: OpportunityState[] = [];
  // The engine recommendation is always a Dispatch inference over sourced signals.
  if (o.tier === "dispatch_inference") states.push("inferred");
  if (o.gate && o.gate.disposition === "approved") {
    states.push("current");
  } else if (o.recommendation === "blocked" || (o.gate && o.gate.disposition === "rejected")) {
    states.push("conflicted");
  } else if (o.recommendation === "advance") {
    // recommended to advance, but the ICApproval human gate is still owed
    states.push("pending_approval");
  }
  return states;
}

function toRow(o: OpportunityInput): OpportunityRowVM {
  const inferred = o.tier === "dispatch_inference";
  const approved = o.gate != null && o.gate.disposition === "approved";
  const awaitingApproval = !approved && o.recommendation === "advance" && (o.gate == null || o.gate.disposition === "deferred");
  const bucket: "open" | "blocked" =
    o.recommendation === "blocked" || o.recommendation === "decline" ? "blocked" : "open";
  return {
    id: o.id,
    company: o.company,
    institution: o.institution,
    category: o.category,
    opportunityScore: o.opportunityScore,
    confidence: o.confidence,
    recommendation: o.recommendation,
    rationale: o.rationale,
    lineage: o.lineage.slice(),
    hasLineage: o.lineage.length > 0,
    scores: o.scores.slice(),
    gate: o.gate,
    awaitingApproval,
    inferred,
    bucket,
    states: opportunityStates(o),
  };
}

/** Deterministic descending compare by a numeric key then id (total order). */
function byScoreThenId(a: OpportunityRowVM, b: OpportunityRowVM): number {
  if (a.opportunityScore !== b.opportunityScore) return b.opportunityScore - a.opportunityScore;
  return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
}

/**
 * Build the `/opportunities` view-model from the deal-engine outputs. Deterministic:
 * open opportunities ranked by opportunity score (desc, id tiebreak); blocked ones
 * likewise. NEVER mutates the input; NEVER decides or advances.
 */
export function buildOpportunitiesView(inputs: OpportunityInput[], opts: { as_of: string }): OpportunitiesVM {
  const rows = inputs.map(toRow);
  const open = rows.filter((r) => r.bucket === "open").sort(byScoreThenId);
  const blocked = rows.filter((r) => r.bucket === "blocked").sort(byScoreThenId);

  const byRecommendation: Record<string, number> = {};
  for (const r of rows) byRecommendation[r.recommendation] = (byRecommendation[r.recommendation] ?? 0) + 1;

  return {
    generatedAt: opts.as_of,
    counts: {
      total: rows.length,
      advancing: rows.filter((r) => r.recommendation === "advance").length,
      awaitingApproval: rows.filter((r) => r.awaitingApproval).length,
      blocked: rows.filter((r) => r.bucket === "blocked").length,
      approved: rows.filter((r) => r.gate != null && r.gate.disposition === "approved").length,
      byRecommendation,
    },
    open,
    blocked,
  };
}
