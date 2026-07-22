// cartridges/cooperative_markets/intake_fixtures.ts
//
// Cooperative Markets — ILLUSTRATIVE STARTUP-INTAKE submissions for the live intake path.
//
// ⚠️ FIXTURES, NOT REAL SUBMISSIONS. Every submission below is hand-authored
// illustrative data used to exercise the startup-intake connector → deal engine path
// (startup_intake_connector.ts → run_intake.ts) end to end. None is a real company or a
// real intake form; do not present any figure as fact about a real company. The values
// are the company's SELF-REPORTED signals (third-party claims), deliberately spanning
// advance / hold / compliance-blocked outcomes so the downstream P1/P2 gates are exercised.
//
// PURE DATA. Deterministic. No clock, no randomness, no I/O — a plain static array. Each
// submission stamps its own `submission_id` and `submitted_at` so intake lineage is
// unbroken once normalized. isolatedModules-friendly: `import type`; ES2022; alias "@/*".

import type { RawStartupIntake } from "@/cartridges/cooperative_markets/connectors/startup_intake_connector";

const SUBMITTED = "2026-07-10T00:00:00.000Z";

/**
 * ILLUSTRATIVE batch of startup-intake submissions (FIXTURES — NOT real; see header).
 * Three applicants with distinct profiles:
 *   1. Halcyon Pay — strong across the board, compliance-ready → should ADVANCE.
 *   2. Meridian Ledger — solid product but NOT compliance-ready → should BLOCK.
 *   3. Cobalt Rails — middling opportunity, compliance cleared → should HOLD.
 */
export function startupIntakeFixtures(): RawStartupIntake[] {
  return [
    {
      submission_id: "intake:halcyon_pay:2026-07-10",
      company: "Halcyon Pay",
      category: "real_time_payments",
      domain: "halcyonpay.example",
      submitted_at: SUBMITTED,
      capability_differentiation: 0.86,
      competitive_position: 0.78,
      innovation_velocity: 0.82,
      traction: 0.74,
      compliance_readiness: 0.9,
      security_posture: 0.85,
      cu_references: 0.7,
      financial_stability: 0.8,
      support_model: 0.72,
      api_maturity: 0.88,
      connector_availability: 0.8,
      integration_standards: 0.82,
      strategic_fit: 0.85,
      regulatory_fit: 0.8,
      timing: 0.82,
    },
    {
      submission_id: "intake:meridian_ledger:2026-07-10",
      company: "Meridian Ledger",
      category: "core_banking",
      domain: "meridianledger.example",
      submitted_at: SUBMITTED,
      capability_differentiation: 0.8,
      competitive_position: 0.7,
      innovation_velocity: 0.75,
      traction: 0.62,
      compliance_readiness: 0.3, // BELOW the 0.5 compliance gate → blocks downstream
      security_posture: 0.5,
      cu_references: 0.4,
      financial_stability: 0.68,
      support_model: 0.6,
      api_maturity: 0.72,
      connector_availability: 0.65,
      integration_standards: 0.7,
      strategic_fit: 0.78,
      regulatory_fit: 0.7,
      timing: 0.75,
    },
    {
      submission_id: "intake:cobalt_rails:2026-07-10",
      company: "Cobalt Rails",
      category: "fraud_detection",
      domain: "cobaltrails.example",
      submitted_at: SUBMITTED,
      capability_differentiation: 0.6,
      competitive_position: 0.55,
      innovation_velocity: 0.6,
      traction: 0.5,
      compliance_readiness: 0.6, // clears the gate
      security_posture: 0.62,
      cu_references: 0.45,
      financial_stability: 0.58,
      support_model: 0.55,
      api_maturity: 0.6,
      connector_availability: 0.55,
      integration_standards: 0.58,
      strategic_fit: 0.6, // middling fit → HOLD band
      regulatory_fit: 0.62,
      timing: 0.6,
    },
  ];
}
