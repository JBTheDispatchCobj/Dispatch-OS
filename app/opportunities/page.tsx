// app/opportunities/page.tsx
//
// Olympic Sprint IV — Wave 2. The "Opportunities" surface, PROMOTED from a scaffold to a
// REAL surface over the deal-engine output. This SERVER component runs the EXISTING intake
// → deal-engine path (`runOpportunities`, deterministic) and renders the client
// `OpportunitiesView`. The engine only RECOMMENDS; advancing an opportunity to allocation
// requires the ICApproval human gate — this triage surface exposes no auto-advance control.
//
// Deterministic read: a fixed `as_of` stamp (no clock) so the page prerenders statically;
// the run is a pure function of the labeled intake fixtures.

import { runOpportunities } from "@/cartridges/cooperative_markets/run_opportunities";
import { OpportunitiesView } from "@/components/terminal/OpportunitiesView";

export const metadata = {
  title: "Opportunities",
  description:
    "Sourced opportunities from the deal engine: each carries a score, a recommendation, its lineage, and the ICApproval human gate. Nothing advances automatically.",
};

const AS_OF = "2026-07-22T00:00:00.000Z";

export default async function OpportunitiesPage() {
  const vm = await runOpportunities({ as_of: AS_OF });
  return <OpportunitiesView vm={vm} />;
}
