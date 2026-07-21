// cartridges/cooperative_markets/ic_memo.ts
//
// VC Deal Engine — P2: diligence + IC memo (VC_DEAL_ENGINE_SPEC §6, ADR-0016).
//
// Assembles an Investment Committee memo from (a) the P1 DealScorecard and (b) a set
// of diligence findings, producing the canonical
// `financial_services:innovation_ecosystem:investment_committee_memo`.
//
// Truth discipline (DOCTRINE / ADR-0005), load-bearing here:
//   * APPROVED EVIDENCE ONLY. A finding is admissible only if it cites at least one
//     APPROVED evidence item; unapproved evidence is excluded from the memo and listed
//     in `excluded_unapproved` for transparency. The memo never asserts what it cannot
//     cite to approved evidence.
//   * The recommendation is a PROPOSAL (`status: "draft"`). The committee decision
//     (invest / partner / pass) is a separate human gate, recorded elsewhere.
//   * Role LENSES restate the same facts for different readers (CEO / CRO / CFO); they
//     never introduce facts the memo body doesn't already cite.
//
// Pure, deterministic module. Consumes P1 (`deal_engine.ts`); vehicle-agnostic.

import type { DealScorecard } from "@/cartridges/cooperative_markets/deal_engine";

// ---------------------------------------------------------------------------
// Diligence inputs
// ---------------------------------------------------------------------------

/** Due-diligence categories (VC_DEAL_ENGINE_SPEC §6; library DD categories). */
export type DDCategory =
  | "corporate"
  | "legal"
  | "financial"
  | "tax"
  | "commercial"
  | "operational"
  | "technology"
  | "cybersecurity"
  | "insurance"
  | "regulatory"
  | "vendor"
  | "compliance_fit"
  | "ai_readiness"
  | "operational_maturity"
  | "innovation_capability";

/** Categories that MUST be covered + non-blocking to recommend (the gating set). */
export const REQUIRED_DD: DDCategory[] = [
  "compliance_fit",
  "regulatory",
  "financial",
  "technology",
  "cybersecurity",
];

export type FindingStatus = "clear" | "minor" | "concern" | "blocker";

export interface EvidenceRef {
  ref: string;
  label: string;
  /** Only approved evidence is admissible to the memo. */
  approved: boolean;
  /** Truth-object id (traceability), if distinct from `ref`. */
  source_ref?: string;
}

export interface DiligenceFinding {
  category: DDCategory;
  summary: string;
  status: FindingStatus;
  evidence: EvidenceRef[];
  /** Required when status is `concern` (becomes a condition) or `blocker`. */
  mitigation?: string;
}

// ---------------------------------------------------------------------------
// Memo output
// ---------------------------------------------------------------------------

export type LensRole = "ceo" | "cro" | "cfo";

export interface ICMemoSection {
  key: string;
  title: string;
  body: string;
  /** Approved evidence refs this section is grounded in. */
  citations: string[];
}

export interface ICRisk {
  label: string;
  severity: "low" | "medium" | "high";
  mitigation?: string;
  citations: string[];
}

export type ICRecommendation =
  | "recommend"
  | "recommend_with_conditions"
  | "hold"
  | "pass"
  | "blocked";

export interface ICMemo {
  object: "financial_services:innovation_ecosystem:investment_committee_memo";
  company: string;
  institution: string;
  scorecard_summary: { key: string; value: number; confidence: number }[];
  sections: ICMemoSection[];
  risks: ICRisk[];
  recommendation: ICRecommendation;
  /** Conditions attached to a `recommend_with_conditions`. */
  conditions: string[];
  /** Same facts, per reader role. */
  lens_summaries: Record<LensRole, string>;
  /** The approved-evidence citation map (deduped). */
  citation_map: { ref: string; label: string; source_ref?: string }[];
  /** Evidence dropped because it was not approved (transparency). */
  excluded_unapproved: string[];
  coverage: { required: DDCategory[]; covered: DDCategory[]; missing: DDCategory[] };
  /** A draft = a proposal. The committee decision is a separate human gate. */
  status: "draft";
  generated_by: "ic_memo:v1";
}

// ---------------------------------------------------------------------------
// Assembly
// ---------------------------------------------------------------------------

const SEVERITY: Record<FindingStatus, "low" | "medium" | "high"> = {
  clear: "low",
  minor: "low",
  concern: "medium",
  blocker: "high",
};

/** Admissible = at least one APPROVED evidence item. */
function admissible(f: DiligenceFinding): boolean {
  return f.evidence.some((e) => e.approved);
}

function approvedCitations(f: DiligenceFinding): string[] {
  return f.evidence.filter((e) => e.approved).map((e) => e.ref);
}

export function assembleICMemo(
  scorecard: DealScorecard,
  findings: DiligenceFinding[],
): ICMemo {
  // 1. Split admissible vs excluded (unapproved) evidence — approved-only rule.
  const admissibleFindings = findings.filter(admissible);
  const excluded_unapproved = [
    ...new Set(
      findings.flatMap((f) => f.evidence.filter((e) => !e.approved).map((e) => e.ref)),
    ),
  ];

  // 2. Coverage over the required DD set (a category counts only if it has an
  //    admissible, non-blocking finding).
  const coveredCats = new Set(
    admissibleFindings.filter((f) => f.status !== "blocker").map((f) => f.category),
  );
  const covered = REQUIRED_DD.filter((c) => coveredCats.has(c));
  const missing = REQUIRED_DD.filter((c) => !coveredCats.has(c));

  // 3. Risks — every non-clear admissible finding, grounded in approved evidence.
  const risks: ICRisk[] = admissibleFindings
    .filter((f) => f.status !== "clear")
    .map((f) => ({
      label: `${labelCat(f.category)}: ${f.summary}`,
      severity: SEVERITY[f.status],
      mitigation: f.mitigation,
      citations: approvedCitations(f),
    }));

  // 4. Recommendation (a proposal). Gates, in order:
  const scorecardBlocked = scorecard.recommendation === "blocked";
  const blockers = admissibleFindings.filter(
    (f) => f.status === "blocker" && REQUIRED_DD.includes(f.category),
  );
  const concerns = admissibleFindings.filter(
    (f) => f.status === "concern" && REQUIRED_DD.includes(f.category),
  );

  let recommendation: ICRecommendation;
  const conditions: string[] = [];
  if (scorecardBlocked || blockers.length) {
    recommendation = "blocked";
  } else if (missing.length) {
    recommendation = "hold";
  } else if (scorecard.scores.opportunity.value < 50) {
    recommendation = "pass";
  } else if (concerns.length) {
    recommendation = "recommend_with_conditions";
    for (const c of concerns) {
      conditions.push(
        `${labelCat(c.category)}: ${c.mitigation ?? "resolve before close"} (re: ${c.summary})`,
      );
    }
  } else {
    recommendation = "recommend";
  }

  // 5. Sections (each grounded in approved citations).
  const sections: ICMemoSection[] = [
    {
      key: "thesis",
      title: "Investment Thesis",
      body: `${scorecard.company} (${describeOpportunity(scorecard)}) is a fit for ${scorecard.institution}: opportunity ${scorecard.scores.opportunity.value}, institution readiness ${scorecard.scores.institution_readiness.value}. ${scorecard.rationale}`,
      citations: scorecard.scores.opportunity.lineage,
    },
    {
      key: "diligence",
      title: "Diligence Findings",
      body: admissibleFindings
        .map((f) => `• [${f.status.toUpperCase()}] ${labelCat(f.category)}: ${f.summary}`)
        .join("\n"),
      citations: [...new Set(admissibleFindings.flatMap(approvedCitations))],
    },
    {
      key: "coverage",
      title: "Diligence Coverage",
      body: `Required covered: ${covered.map(labelCat).join(", ") || "none"}. Missing: ${missing.map(labelCat).join(", ") || "none"}.${excluded_unapproved.length ? ` Excluded (unapproved) evidence: ${excluded_unapproved.length} item(s) — not cited in this memo.` : ""}`,
      citations: [],
    },
    {
      key: "recommendation",
      title: "Recommendation",
      body: `${recommendation.replace(/_/g, " ").toUpperCase()}${conditions.length ? ` — conditions: ${conditions.join("; ")}` : ""}. This is a proposal for the investment committee; the decision is the committee's.`,
      citations: [],
    },
  ];

  // 6. Role lenses — same facts, different reader.
  const lens_summaries: Record<LensRole, string> = {
    ceo: `Strategic: ${scorecard.company} advances ${scorecard.institution}'s franchise — opportunity ${scorecard.scores.opportunity.value}, innovation ${scorecard.scores.innovation.value}. Recommendation: ${recommendation.replace(/_/g, " ")}.`,
    cro: `Risk/regulatory: ${risks.length} open finding(s)${blockers.length ? `, ${blockers.length} blocking` : ""}; regulatory + compliance-fit ${covered.includes("regulatory") && covered.includes("compliance_fit") ? "covered" : "INCOMPLETE"}. ${conditions.length ? `Conditions: ${conditions.length}.` : "No conditions."}`,
    cfo: `Returns/capital: startup financial stability + opportunity ${scorecard.scores.opportunity.value}; capital-light vehicle-agnostic path. Institution readiness ${scorecard.scores.institution_readiness.value}.`,
  };

  // 7. Citation map (approved only, deduped).
  const seen = new Map<string, { ref: string; label: string; source_ref?: string }>();
  for (const f of admissibleFindings) {
    for (const e of f.evidence.filter((x) => x.approved)) {
      if (!seen.has(e.ref)) seen.set(e.ref, { ref: e.ref, label: e.label, source_ref: e.source_ref });
    }
  }

  return {
    object: "financial_services:innovation_ecosystem:investment_committee_memo",
    company: scorecard.company,
    institution: scorecard.institution,
    scorecard_summary: Object.values(scorecard.scores).map((s) => ({ key: s.key, value: s.value, confidence: s.confidence })),
    sections,
    risks,
    recommendation,
    conditions,
    lens_summaries,
    citation_map: [...seen.values()],
    excluded_unapproved,
    coverage: { required: REQUIRED_DD, covered, missing },
    status: "draft",
    generated_by: "ic_memo:v1",
  };
}

function labelCat(c: DDCategory): string {
  return c.replace(/_/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
}

function describeOpportunity(sc: DealScorecard): string {
  return `startup readiness ${sc.scores.startup_readiness.value}, dispatch readiness ${sc.scores.dispatch_readiness.value}`;
}
