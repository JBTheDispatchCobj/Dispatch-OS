// scripts/ic-memo-demo.ts
//
// Runnable demo for VC Deal Engine P2 — the IC memo (VC_DEAL_ENGINE_SPEC §6).
// Scores Halcyon Pay × Summit Ridge (P1), then assembles the Investment Committee
// memo from diligence findings — proving the approved-evidence-only rule (one
// unapproved item is excluded), the compliance/DD gating, and the role lenses.
//
// Deterministic: no I/O, no clock, no randomness.

import {
  assembleScorecard,
  type StartupProfile,
  type InstitutionReadinessInput,
  type OpportunityContext,
} from "@/cartridges/cooperative_markets/deal_engine";
import {
  assembleICMemo,
  type DiligenceFinding,
} from "@/cartridges/cooperative_markets/ic_memo";

const halcyon: StartupProfile = {
  company: "Halcyon Pay", ref: "startup#halcyon", category: "real_time_payments",
  capability_differentiation: { value: 0.85, source_ref: "fact:cap", confidence: 0.8 },
  competitive_position: { value: 0.7, source_ref: "claim:pos", confidence: 0.6 },
  innovation_velocity: { value: 0.8, source_ref: "fact:vel", confidence: 0.7 },
  traction: { value: 0.72, source_ref: "fact:trac", confidence: 0.85 },
  compliance_readiness: { value: 0.82, source_ref: "claim:soc2", confidence: 0.9 },
  security_posture: { value: 0.78, source_ref: "claim:pen", confidence: 0.7 },
  cu_references: { value: 0.8, source_ref: "fact:ref", confidence: 0.8 },
  financial_stability: { value: 0.68, source_ref: "fact:funding", confidence: 0.75 },
  support_model: { value: 0.65, source_ref: "claim:sla", confidence: 0.6 },
  api_maturity: { value: 0.8, source_ref: "fact:api", confidence: 0.8 },
  connector_availability: { value: 0.6, source_ref: "fact:conn", confidence: 0.7 },
  integration_standards: { value: 0.7, source_ref: "fact:int", confidence: 0.7 },
};
const summit: InstitutionReadinessInput = {
  institution: "Summit Ridge FCU", ref: "cu#summit",
  executive_support: { value: 0.75, source_ref: "fact:ceo", confidence: 0.7 },
  budget_capacity: { value: 0.55, source_ref: "fact:nwr", confidence: 0.8 },
  tech_ops_capacity: { value: 0.7, source_ref: "fact:core", confidence: 0.7 },
  security_compliance_posture: { value: 0.72, source_ref: "fact:exam", confidence: 0.75 },
  strategic_alignment: { value: 0.85, source_ref: "fact:strat", confidence: 0.7 },
  digital_ai_maturity: { value: 0.71, source_ref: "fact:digital", confidence: 0.8 },
};
const opp: OpportunityContext = {
  strategic_fit: { value: 0.82, source_ref: "inf:sf", confidence: 0.75 },
  regulatory_fit: { value: 0.74, source_ref: "inf:rf", confidence: 0.7 },
  timing: { value: 0.78, source_ref: "inf:tm", confidence: 0.65 },
};

const scorecard = assembleScorecard(halcyon, summit, opp);

const findings: DiligenceFinding[] = [
  { category: "compliance_fit", status: "clear", summary: "SOC 2 Type II current; BSA/OFAC/Reg E control map complete for RTP.", evidence: [{ ref: "ev:soc2", label: "SOC 2 Type II report", approved: true, source_ref: "claim:soc2" }] },
  { category: "regulatory", status: "concern", summary: "Real-time OFAC screening + Reg E liability windows need documented controls for the pilot boundary.", mitigation: "Attach the real-time OFAC + Reg E control checklist as a closing condition.", evidence: [{ ref: "ev:reg_map", label: "Regulatory control map", approved: true, source_ref: "doc:reg_map" }] },
  { category: "financial", status: "clear", summary: "Series B, ~24mo runway; unit economics reviewed.", evidence: [{ ref: "ev:financials", label: "Financials + cap table", approved: true, source_ref: "doc:financials" }] },
  { category: "technology", status: "clear", summary: "API maturity strong; connector on the roadmap.", evidence: [{ ref: "ev:api", label: "API spec + integration docs", approved: true, source_ref: "fact:api" }] },
  { category: "cybersecurity", status: "minor", summary: "Recent pentest clean; one low finding remediated.", evidence: [{ ref: "ev:pentest", label: "Pentest report 2026", approved: true, source_ref: "claim:pen" }] },
  { category: "commercial", status: "clear", summary: "14 CU integrations; references positive.", evidence: [{ ref: "ev:refs", label: "CU reference calls", approved: true, source_ref: "fact:ref" }] },
  // Unapproved — must be EXCLUDED from the memo:
  { category: "insurance", status: "clear", summary: "Cyber insurance binder (unverified copy).", evidence: [{ ref: "ev:coi_draft", label: "COI (draft, unapproved)", approved: false }] },
];

const memo = assembleICMemo(scorecard, findings);

console.log(`\n=== Investment Committee Memo (DRAFT — a proposal) ===`);
console.log(`${memo.company}  ×  ${memo.institution}\n`);
console.log(`  Scorecard: ` + memo.scorecard_summary.map((s) => `${s.key}=${s.value}`).join("  "));
console.log(`\n  RECOMMENDATION: ${memo.recommendation.replace(/_/g, " ").toUpperCase()}`);
if (memo.conditions.length) memo.conditions.forEach((c) => console.log(`    condition: ${c}`));
console.log(`\n  Coverage — required covered: ${memo.coverage.covered.length}/${memo.coverage.required.length}` + (memo.coverage.missing.length ? `, missing: ${memo.coverage.missing.join(", ")}` : ", none missing"));
console.log(`  Risks: ${memo.risks.length}  |  Approved citations: ${memo.citation_map.length}  |  Excluded (unapproved): ${memo.excluded_unapproved.length} → ${memo.excluded_unapproved.join(", ") || "none"}`);
console.log(`\n  Lens — CEO: ${memo.lens_summaries.ceo}`);
console.log(`  Lens — CRO: ${memo.lens_summaries.cro}`);
console.log(`  Lens — CFO: ${memo.lens_summaries.cfo}`);
console.log(`\n  Object: ${memo.object}  ·  status: ${memo.status}  ·  ${memo.generated_by}\n`);
