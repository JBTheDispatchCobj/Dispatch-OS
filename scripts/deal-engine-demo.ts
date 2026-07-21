// scripts/deal-engine-demo.ts
//
// Runnable demo for the VC Deal Engine P1 scoring (VC_DEAL_ENGINE_SPEC §5).
// Scores the Halcyon Pay × Summit Ridge FCU scenario (same as the cartridge seed +
// Auric lens) and prints the full scorecard with per-factor lineage, proving the
// scores are sourced inferences (each factor cites a source_ref) and the screening
// recommendation is a deterministic, explainable proposal.
//
//   npx tsc scripts/deal-engine-demo.ts ... && node <out>   (or ts-node)
//
// Deterministic: no I/O, no clock, no randomness — same input, same scorecard.

import {
  assembleScorecard,
  type StartupProfile,
  type InstitutionReadinessInput,
  type OpportunityContext,
} from "@/cartridges/cooperative_markets/deal_engine";

const halcyon: StartupProfile = {
  company: "Halcyon Pay",
  ref: "financial_services:innovation_ecosystem:startup#halcyon_pay",
  category: "real_time_payments",
  capability_differentiation: { value: 0.85, source_ref: "fact:halcyon:capability_review", confidence: 0.8 },
  competitive_position: { value: 0.7, source_ref: "claim:halcyon:market_position", confidence: 0.6 },
  innovation_velocity: { value: 0.8, source_ref: "fact:halcyon:roadmap_cadence", confidence: 0.7 },
  traction: { value: 0.72, source_ref: "fact:halcyon:cu_integrations_count", confidence: 0.85 },
  compliance_readiness: { value: 0.82, source_ref: "claim:halcyon:soc2_type_ii", confidence: 0.9 },
  security_posture: { value: 0.78, source_ref: "claim:halcyon:pentest_2026", confidence: 0.7 },
  cu_references: { value: 0.8, source_ref: "fact:halcyon:cu_references", confidence: 0.8 },
  financial_stability: { value: 0.68, source_ref: "fact:halcyon:series_b_38m", confidence: 0.75 },
  support_model: { value: 0.65, source_ref: "claim:halcyon:support_sla", confidence: 0.6 },
  api_maturity: { value: 0.8, source_ref: "fact:halcyon:api_spec", confidence: 0.8 },
  connector_availability: { value: 0.6, source_ref: "fact:halcyon:connector_status", confidence: 0.7 },
  integration_standards: { value: 0.7, source_ref: "fact:halcyon:integration_docs", confidence: 0.7 },
};

const summit: InstitutionReadinessInput = {
  institution: "Summit Ridge FCU",
  ref: "financial_services:institutions:federal_credit_union#summit_ridge",
  executive_support: { value: 0.75, source_ref: "fact:summit:ceo_sponsor", confidence: 0.7 },
  budget_capacity: { value: 0.55, source_ref: "fact:summit:5300:2026q1:net_worth_ratio", confidence: 0.8 }, // PCA-sensitive → capital-light matters
  tech_ops_capacity: { value: 0.7, source_ref: "fact:summit:core_symitar", confidence: 0.7 },
  security_compliance_posture: { value: 0.72, source_ref: "fact:summit:last_exam", confidence: 0.75 },
  strategic_alignment: { value: 0.85, source_ref: "fact:summit:digital_strategy", confidence: 0.7 },
  digital_ai_maturity: { value: 0.71, source_ref: "fact:summit:digital_adoption_rate", confidence: 0.8 },
};

const opportunity: OpportunityContext = {
  strategic_fit: { value: 0.82, source_ref: "inference:fit:summit_halcyon:strategic", confidence: 0.75 },
  regulatory_fit: { value: 0.74, source_ref: "inference:fit:summit_halcyon:regulatory", confidence: 0.7 },
  timing: { value: 0.78, source_ref: "inference:fit:summit_halcyon:timing", confidence: 0.65 },
};

const card = assembleScorecard(halcyon, summit, opportunity);

function line(label: string, v: number, c: number, refs: number): string {
  return `  ${label.padEnd(30)} ${String(v).padStart(5)} / 100   conf ${c.toFixed(2)}   (${refs} sources)`;
}

console.log(`\n=== VC Deal Engine — Scorecard ===`);
console.log(`${card.company}  ×  ${card.institution}\n`);
for (const s of Object.values(card.scores)) {
  console.log(line(s.label, s.value, s.confidence, s.lineage.length));
}
console.log(`\n  RECOMMENDATION: ${card.recommendation.toUpperCase()}`);
console.log(`  ${card.rationale}`);
console.log(`\n  Scorecard evidence set: ${card.lineage.length} distinct sourced facts.`);
console.log(`  (every factor above is a Dispatch inference over a cited source — no weights-only conclusions)\n`);
