// cartridges/cooperative_markets/pipeline_fixtures.ts
//
// Golden-path fixtures for the orchestration spine (Wave 1). Halcyon Pay ×
// Summit Ridge FCU — the same scenario as the cartridge seed, the Auric lens,
// and the P1/P2/P3 demos — expressed as one {@link DealRunInput} + {@link RunContext}
// so BOTH `scripts/pipeline-demo.ts` and the debug-loop PIPELINE gate run the
// identical input (one source of truth; no drift between demo and gate).
//
// Pure data. Deterministic. No clock, no randomness. All numbers are sourced
// (each SourcedInput cites a truth-object ref) so lineage is unbroken through
// the whole run.

import type { DealRunInput, RunContext } from "@/cartridges/cooperative_markets/pipeline";
import type { StartupProfile, OpportunityContext, InstitutionReadinessInput } from "@/cartridges/cooperative_markets/deal_engine";
import type { CallReportInput } from "@/cartridges/cooperative_markets/ingest_call_report";
import type { DiligenceFinding } from "@/cartridges/cooperative_markets/ic_memo";
import type { Subscriber } from "@/cartridges/cooperative_markets/allocation";

const SUMMIT_SOURCE = "sourcedoc:ncua:5300:summit_ridge:2026Q1";

/** A realistic Summit Ridge FCU quarterly 5300 (well-capitalized, growing). */
const summit5300: CallReportInput = {
  input_type: "ncua_5300_call_report",
  raw: {
    charter_number: "60441",
    institution: "Summit Ridge FCU",
    period: "2026-Q1",
    total_assets: 850_000_000,
    net_worth: 76_500_000, // → 9.0% net-worth ratio (well-capitalized)
    total_loans: 520_000_000,
    total_shares: 720_000_000, // → ~72% loan-to-share
    net_income: 6_800_000,
    average_assets: 840_000_000, // → ~0.81% ROA
    delinquent_loans: 2_600_000, // → ~0.5% delinquency
    members: 62_000,
    members_prior: 58_500, // → ~6.0% membership growth
    digital_adoption: 0.71,
    source_ref: SUMMIT_SOURCE,
  },
};

/** Institution-readiness signals a 5300 cannot source (governance / infosec / strategy). */
const summitExtra: Partial<InstitutionReadinessInput> = {
  executive_support: { value: 0.75, source_ref: "fact:summit:ceo_sponsor", confidence: 0.7 },
  tech_ops_capacity: { value: 0.7, source_ref: "fact:summit:core_symitar", confidence: 0.7 },
  security_compliance_posture: { value: 0.72, source_ref: "fact:summit:last_exam", confidence: 0.75 },
  strategic_alignment: { value: 0.85, source_ref: "fact:summit:digital_strategy", confidence: 0.7 },
};

function halcyon(complianceReadiness: number): StartupProfile {
  return {
    company: "Halcyon Pay",
    ref: "financial_services:innovation_ecosystem:startup#halcyon_pay",
    category: "real_time_payments",
    capability_differentiation: { value: 0.85, source_ref: "fact:halcyon:capability_review", confidence: 0.8 },
    competitive_position: { value: 0.7, source_ref: "claim:halcyon:market_position", confidence: 0.6 },
    innovation_velocity: { value: 0.8, source_ref: "fact:halcyon:roadmap_cadence", confidence: 0.7 },
    traction: { value: 0.72, source_ref: "fact:halcyon:cu_integrations_count", confidence: 0.85 },
    compliance_readiness: { value: complianceReadiness, source_ref: "claim:halcyon:soc2_type_ii", confidence: 0.9 },
    security_posture: { value: 0.78, source_ref: "claim:halcyon:pentest_2026", confidence: 0.7 },
    cu_references: { value: 0.8, source_ref: "fact:halcyon:cu_references", confidence: 0.8 },
    financial_stability: { value: 0.68, source_ref: "fact:halcyon:series_b_38m", confidence: 0.75 },
    support_model: { value: 0.65, source_ref: "claim:halcyon:support_sla", confidence: 0.6 },
    api_maturity: { value: 0.8, source_ref: "fact:halcyon:api_spec", confidence: 0.8 },
    connector_availability: { value: 0.6, source_ref: "fact:halcyon:connector_status", confidence: 0.7 },
    integration_standards: { value: 0.7, source_ref: "fact:halcyon:integration_docs", confidence: 0.7 },
  };
}

const opportunity: OpportunityContext = {
  strategic_fit: { value: 0.82, source_ref: "inference:fit:summit_halcyon:strategic", confidence: 0.75 },
  regulatory_fit: { value: 0.74, source_ref: "inference:fit:summit_halcyon:regulatory", confidence: 0.7 },
  timing: { value: 0.78, source_ref: "inference:fit:summit_halcyon:timing", confidence: 0.65 },
};

const findings: DiligenceFinding[] = [
  { category: "compliance_fit", status: "clear", summary: "SOC 2 Type II current; BSA/OFAC/Reg E control map complete for RTP.", evidence: [{ ref: "ev:soc2", label: "SOC 2 Type II report", approved: true, source_ref: "claim:halcyon:soc2_type_ii" }] },
  { category: "regulatory", status: "concern", summary: "Real-time OFAC screening + Reg E liability windows need documented controls for the pilot boundary.", mitigation: "Attach the real-time OFAC + Reg E control checklist as a closing condition.", evidence: [{ ref: "ev:reg_map", label: "Regulatory control map", approved: true, source_ref: "doc:halcyon:reg_map" }] },
  { category: "financial", status: "clear", summary: "Series B, ~24mo runway; unit economics reviewed.", evidence: [{ ref: "ev:financials", label: "Financials + cap table", approved: true, source_ref: "doc:halcyon:financials" }] },
  { category: "technology", status: "clear", summary: "API maturity strong; connector on the roadmap.", evidence: [{ ref: "ev:api", label: "API spec + integration docs", approved: true, source_ref: "fact:halcyon:api_spec" }] },
  { category: "cybersecurity", status: "minor", summary: "Recent pentest clean; one low finding remediated.", evidence: [{ ref: "ev:pentest", label: "Pentest report 2026", approved: true, source_ref: "claim:halcyon:pentest_2026" }] },
  { category: "commercial", status: "clear", summary: "14 CU integrations; references positive.", evidence: [{ ref: "ev:refs", label: "CU reference calls", approved: true, source_ref: "fact:halcyon:cu_references" }] },
  // Unapproved — MUST be excluded from the memo:
  { category: "insurance", status: "clear", summary: "Cyber insurance binder (unverified copy).", evidence: [{ ref: "ev:coi_draft", label: "COI (draft, unapproved)", approved: false }] },
];

const subscribers: Subscriber[] = [
  { id: "cu_summit", name: "Summit Ridge FCU", kind: "credit_union", ref: "cu#summit", kyb_status: "cleared", sanctions_status: "cleared", interest: { categories: ["real_time_payments", "fraud"], max_check_usd: 750_000 }, requested_usd: 750_000 },
  { id: "cu_harbor", name: "Harbor Point CU", kind: "credit_union", ref: "cu#harbor", kyb_status: "pending", sanctions_status: "cleared", interest: { categories: ["real_time_payments"] }, requested_usd: 500_000 },
  { id: "lp_meridian", name: "Meridian Family Office", kind: "lp", ref: "lp#meridian", accreditation: "qualified_purchaser", kyb_status: "cleared", sanctions_status: "cleared", interest: { categories: ["real_time_payments", "lending_tech"] }, requested_usd: 1_000_000 },
  { id: "lp_novus", name: "Novus Angels", kind: "lp", ref: "lp#novus", accreditation: "none", kyc_status: "cleared", sanctions_status: "cleared", interest: { categories: ["real_time_payments"] }, requested_usd: 400_000 },
  { id: "cu_delta", name: "Delta Community CU", kind: "credit_union", ref: "cu#delta", kyb_status: "cleared", sanctions_status: "cleared", interest: { categories: ["mortgage_tech"] }, requested_usd: 300_000 },
];

/**
 * The recorded HUMAN disposition of the IC memo — the committee's approval. This is
 * a caller-supplied human act (a `human_approved_conclusion`), NOT something the
 * pipeline invents; its decision_ref is the truth-object id of the recorded decision.
 */
const committeeApproval = {
  disposition: "approved" as const,
  by: "user:ic_chair",
  decision_ref: "decision:ic:summit_halcyon:2026q1:approved",
  note: "IC approved with the regulatory closing condition attached.",
};

/**
 * The golden advancing run: Halcyon (compliance-ready) × Summit, advisory settlement,
 * WITH the committee's human approval so it clears the human gate all the way to settle.
 */
export function halcyonSummitRun(): { input: DealRunInput; ctx: RunContext } {
  return {
    input: {
      raw5300: summit5300,
      startup: halcyon(0.82),
      opportunity,
      institutionExtra: summitExtra,
      findings,
      subscribers,
      dealCapacityUsd: 2_000_000,
      approval: committeeApproval,
    },
    ctx: {
      runId: "run:halcyon_summit:2026q1",
      startedAt: "2026-07-21T15:00:00.000Z",
      actor: "agent:deal_pipeline",
      settlementMode: "advisory",
      feedRole: "ceo",
    },
  };
}

/**
 * The SAME advancing deal with NO human approval — proves the human gate has teeth:
 * a regulated conclusion that would otherwise allocate/settle instead halts
 * `awaiting_approval`, publishing nothing, until a human disposes of the memo.
 */
export function unapprovedRun(): { input: DealRunInput; ctx: RunContext } {
  const g = halcyonSummitRun();
  const input = { ...g.input };
  delete input.approval;
  return { input, ctx: { ...g.ctx, runId: "run:halcyon_summit:awaiting" } };
}

/** A blocked run: Halcyon with compliance readiness below the gate — never advances. */
export function blockedRun(): { input: DealRunInput; ctx: RunContext } {
  const g = halcyonSummitRun();
  const input = { ...g.input, startup: halcyon(0.3) };
  delete input.approval;
  return { input, ctx: { ...g.ctx, runId: "run:halcyon_summit:blocked" } };
}
