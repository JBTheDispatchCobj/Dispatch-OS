// cartridges/cooperative_markets/auric_lens.ts
//
// Auric publication slice (Volume VI, DOCTRINE publication loop) — the concrete
// proof that ONE sourced insight renders differently by executive lens without
// changing the underlying facts. This is the "CEO ≠ CLO" thesis made real:
//
//   market event → Intelligence Object → role lens → channel variant → action
//
// It is a DEMONSTRATIVE, TYPED FIXTURE (not yet wired to a running Auric engine):
// a real Cooperative Markets scenario expressed as one public IntelligenceObject
// assembled FROM sourced truth objects, a Relationship on the discovery→…→
// investment ladder, and three ContentVariants (base + CEO + CLO) that share the
// SAME `source_refs` — the hook changes, the facts do not. Truth discipline
// (DOCTRINE / ADR-0005): the IO points at the truth objects it is built from;
// the opportunity score is a `dispatch_inference`, never a weights-only claim;
// nothing here is a conclusion the reader can't trace back to a source.
//
// Types come from /core (vertical-blind). The lens_ref values ("ceo"/"clo") are
// the executive-function role keys the cooperative_markets:executive entity
// carries; the core RoleKey enum is unaffected.

import type {
  IntelligenceObject,
  ContentVariant,
} from "@/core/intelligence/types";
import type { Relationship } from "@/core/relationships/types";

const TS = "2026-07-20T15:00:00.000Z";

// ---------------------------------------------------------------------------
// Sourced truth-object ids this IO is assembled FROM (traceability). In the
// running system these resolve to real observations / calculations / claims /
// inferences in the truth store; here they are stable placeholder refs so the
// variants below can cite the exact same evidence.
// ---------------------------------------------------------------------------

export const SOURCE_REFS = {
  net_worth_ratio: "fact:summit_ridge:5300:2026q1:net_worth_ratio", // deterministic_calculation from the 5300
  member_growth: "fact:summit_ridge:5300:2026q1:member_growth", // public_fact
  digital_adoption: "fact:summit_ridge:digital_adoption_rate", // public_fact
  vendor_soc2: "claim:halcyon_pay:soc2_type_ii", // third_party_claim (attestation on file)
  vendor_cu_installs: "fact:halcyon_pay:cu_integrations_count", // public_fact (14 CU integrations)
  opportunity_score: "inference:opp:summit_ridge__halcyon_pay:78", // dispatch_inference (sourced calc)
} as const;

const ALL_REFS = Object.values(SOURCE_REFS);

// ---------------------------------------------------------------------------
// The Relationship — CU ↔ innovation company on the market ladder.
// ---------------------------------------------------------------------------

export const relationship: Relationship = {
  id: "rel:summit_ridge__halcyon_pay",
  workspace_id: null, // shared-market relationship (the free layer)
  plane: "shared_market",
  visibility: "network",
  relationship_type: "cooperative_markets:partnership",
  parties: [
    { ref: "entity:summit_ridge_fcu", party_type: "cooperative_markets:credit_union", role: "institution" },
    { ref: "entity:halcyon_pay", party_type: "cooperative_markets:innovation_company", role: "innovator" },
  ],
  stage: "evaluation", // discovery → [evaluation] → pilot → …
  status: "active",
  evidence_refs: [SOURCE_REFS.vendor_soc2, SOURCE_REFS.vendor_cu_installs, SOURCE_REFS.opportunity_score],
  opportunity: {
    thesis: "Real-time payments as a member-retention and deposit-growth lever for a digitally-adopting, capital-constrained CU.",
    opportunity_score: 78,
    strategic_fit: 0.82,
    regulatory_fit: 0.74,
    capital_intensity: "low",
  },
  risks: [
    { label: "Net-worth headroom", severity: "medium", detail: "PCA pressure at 6.8% net worth ratio — any initiative must be capital-light.", evidence_refs: [SOURCE_REFS.net_worth_ratio] },
    { label: "Instant-settlement compliance exposure", severity: "medium", detail: "Real-time rails raise BSA/AML, OFAC, and Reg E timing risk; controls must be evidenced.", evidence_refs: [SOURCE_REFS.vendor_soc2] },
  ],
  next_action: "Scope a capital-light pilot with a real-time OFAC screening + Reg E control checklist.",
  next_action_due_at: "2026-08-15T00:00:00.000Z",
  last_activity_at: TS,
  metadata: { cartridge: "cooperative_markets", ladder: "discovery→evaluation→pilot→integration→partnership→investment→monitoring" },
  created_at: TS,
  updated_at: TS,
};

// ---------------------------------------------------------------------------
// The Intelligence Object — one sourced unit of market meaning (public plane).
// ---------------------------------------------------------------------------

export const intelligenceObject: IntelligenceObject = {
  id: "io:summit_ridge__halcyon_pay__rtp",
  workspace_id: null, // shared-market IO — The Auric free layer
  plane: "shared_market",
  visibility: "public",
  kind: "cooperative_markets:opportunity",
  headline: "Real-time payments: a capital-light growth lever for Summit Ridge FCU",
  summary:
    "Summit Ridge FCU is growing members (+7.2% YoY) and digitally engaged, but net worth sits at 6.8% (PCA-sensitive). Halcyon Pay's instant-settlement capability — 14 live CU integrations, SOC 2 Type II — is a low-capital way to defend the primary-payments relationship. Opportunity score 78.",
  fact_refs: [SOURCE_REFS.net_worth_ratio, SOURCE_REFS.member_growth, SOURCE_REFS.digital_adoption, SOURCE_REFS.vendor_cu_installs],
  claim_refs: [SOURCE_REFS.vendor_soc2],
  inference_refs: [SOURCE_REFS.opportunity_score],
  affected_refs: [relationship.id, "entity:summit_ridge_fcu", "entity:halcyon_pay"],
  top_tier: "dispatch_inference",
  relevance: {
    audience: ["cooperative_markets:credit_union", "cooperative_markets:executive"],
    reason: "Matched innovation-capacity signals to a compliant, low-capital capability.",
    opportunity_score: 78,
  },
  confidence: 0.79,
  shelf_life_ends_at: "2026-10-20T00:00:00.000Z",
  recommended_action: "Open a scoped, capital-light pilot with real-time OFAC + Reg E controls.",
  status: "published",
  published_at: TS,
  metadata: { cartridge: "cooperative_markets", relationship_ref: relationship.id },
  created_at: TS,
  updated_at: TS,
};

// ---------------------------------------------------------------------------
// The variants — SAME facts (identical source_refs), DIFFERENT hook per lens.
// This is the whole thesis: base content + role-lens branches.
// ---------------------------------------------------------------------------

export const variants: ContentVariant[] = [
  {
    id: "cv:io_rtp:base",
    intelligence_object_id: intelligenceObject.id,
    lens_type: "cartridge",
    lens_ref: "cooperative_markets",
    channel: "brief",
    visibility: "public",
    title: "Real-time payments opportunity — Summit Ridge FCU × Halcyon Pay",
    body:
      "Summit Ridge FCU (net worth 6.8%, members +7.2% YoY, high digital adoption) is a strong fit for Halcyon Pay's instant-settlement capability (14 CU integrations, SOC 2 Type II). Opportunity score 78. Recommended next step: a scoped, capital-light pilot with real-time OFAC screening and Reg E controls.",
    source_refs: ALL_REFS,
    generated_by: "system",
    status: "published",
    created_at: TS,
    updated_at: TS,
  },
  {
    id: "cv:io_rtp:ceo",
    intelligence_object_id: intelligenceObject.id,
    lens_type: "role",
    lens_ref: "ceo",
    channel: "terminal_feed",
    visibility: "network",
    title: "Own the primary-payments relationship before someone else does",
    body:
      "Real-time payments is becoming table stakes for member retention and deposit growth. Summit Ridge is already winning members (+7.2%) and they're digital — this is how you convert that momentum into the primary-payments relationship and position the CU as the digital leader in your field of membership. It's capital-light, so it doesn't touch your net-worth story. The window is now, while the capability is still a differentiator rather than a catch-up.",
    render_payload: { hook: "growth / franchise value / positioning", cta: "Green-light a pilot", lens: "CEO" },
    source_refs: ALL_REFS,
    generated_by: "system",
    status: "published",
    created_at: TS,
    updated_at: TS,
  },
  {
    id: "cv:io_rtp:clo",
    intelligence_object_id: intelligenceObject.id,
    lens_type: "role",
    lens_ref: "clo",
    channel: "terminal_feed",
    visibility: "network",
    title: "The same move, made defensible in your next exam",
    body:
      "Instant settlement raises BSA/AML, OFAC, and Reg E exposure — so the question isn't whether it's attractive, it's whether it's defensible. Halcyon Pay carries a current SOC 2 Type II and 14 CU integrations, and the pilot is scoped with real-time OFAC screening and documented Reg E liability windows, so the control story is exam-ready. With net worth at 6.8%, the fact that this is capital-light matters: you get the capability without spending PCA headroom. Same opportunity the CEO sees — here's why it holds up under scrutiny.",
    render_payload: { hook: "risk / compliance / defensibility", cta: "Approve pilot controls", lens: "CLO" },
    source_refs: ALL_REFS,
    generated_by: "system",
    status: "published",
    created_at: TS,
    updated_at: TS,
  },
];

/** The complete Auric lens fixture (one IO, one relationship, three variants). */
export const auricLensDemo = { relationship, intelligenceObject, variants, sourceRefs: SOURCE_REFS };
export default auricLensDemo;
