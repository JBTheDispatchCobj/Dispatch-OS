// cartridges/cooperative_markets/run_opportunities.ts
//
// Cooperative Markets — THE OPPORTUNITIES data (Sprint IV Wave 2).
//
// Assembles the serializable view-model for `/opportunities`, a REAL surface over the
// deal-engine output. It runs the EXISTING startup-intake → deal-engine path
// (`runStartupIntake`, unchanged) over the labeled intake fixtures, then maps each
// scored applicant → an `OpportunityInput` the pure `buildOpportunitiesView` shapes.
//
// TRUTH / GATE DISCIPLINE:
//   * every score is a DISPATCH INFERENCE (tier `dispatch_inference`) over sourced
//     signals — never a fact, never a regulated conclusion in a weight;
//   * the intake connector normalizes a company's OWN claim (third_party_claim FROM THE
//     SOURCE manifest) — no score, no tier in the connector;
//   * NOTHING is advanced here. The deal engine RECOMMENDS advance/hold/decline/blocked;
//     advancing a recommended opportunity to allocation requires the ICApproval HUMAN
//     gate (proven by the pipeline: an unapproved deal halts awaiting_approval and
//     allocates/settles/publishes nothing). The intake path takes no approval, so a
//     recommended-to-advance opportunity surfaces as `pending_approval`, never `current`.
//
// PURE-ISH / DETERMINISTIC: async only because the connector runtime is async; every
// id/instant is injected (`as_of`), no clock/random, so the same `as_of` → an identical
// VM. `opportunityInputsFromScored` is a pure, synchronous mapper (testable without the
// runtime). ERASABLE-ONLY TS (no enums / parameter properties) so the debug loop +
// `node --test` import it directly under native type-stripping.

import { runStartupIntake, illustrativeInstitutionReadiness } from "@/cartridges/cooperative_markets/run_intake";
import type { ScoredIntake } from "@/cartridges/cooperative_markets/run_intake";
import { startupIntakeFixtures } from "@/cartridges/cooperative_markets/intake_fixtures";
import { buildOpportunitiesView } from "@/app/_surfaces/opportunities_view";
import type {
  OpportunitiesVM,
  OpportunityInput,
  OpportunityRecommendation,
} from "@/app/_surfaces/opportunities_view";

const AS_OF_DEFAULT = "2026-07-22T00:00:00.000Z";

/**
 * Map the deal-engine scored intake → the pure builder's `OpportunityInput`. Synchronous
 * + pure (no I/O), so a test can drive it directly. Every field traces to the scorecard;
 * `gate` is null because the intake path takes no ICApproval (the human gate is owed).
 */
export function opportunityInputsFromScored(scored: ScoredIntake[]): OpportunityInput[] {
  return scored.map((s) => {
    const sc = s.scorecard;
    const scores = [
      sc.scores.opportunity,
      sc.scores.innovation,
      sc.scores.startup_readiness,
      sc.scores.institution_readiness,
      sc.scores.dispatch_readiness,
    ].map((x) => ({ key: x.key, label: x.label, value: x.value, confidence: x.confidence }));
    return {
      id: `opp:${s.record.external_ref}`,
      company: sc.company,
      institution: sc.institution,
      category: s.startup.category,
      opportunityScore: sc.scores.opportunity.value,
      confidence: sc.scores.opportunity.confidence,
      recommendation: sc.recommendation as OpportunityRecommendation,
      tier: sc.scores.opportunity.tier,
      rationale: sc.rationale,
      lineage: sc.lineage.slice(),
      scores,
      gate: null,
    };
  });
}

/**
 * Build the `/opportunities` view-model over the live deal-engine run. Deterministic
 * given `as_of`. Runs the unchanged intake → deal engine, maps the scored applicants,
 * and hands them to the pure builder. The human gates (ICApproval + EditorialDisposition)
 * are UNTOUCHED — the engine only recommends.
 */
export async function runOpportunities(opts: { as_of?: string } = {}): Promise<OpportunitiesVM> {
  const as_of = opts.as_of ?? AS_OF_DEFAULT;
  const run = await runStartupIntake(startupIntakeFixtures(), illustrativeInstitutionReadiness(), { as_of });
  return buildOpportunitiesView(opportunityInputsFromScored(run.scored), { as_of });
}
