// cartridges/cooperative_markets/allocation.ts
//
// VC Deal Engine — P3: allocation + subscriber tiers (VC_DEAL_ENGINE_SPEC §7, ADR-0016).
//
// After the committee decision (P2 IC memo → human gate), route an approved deal to
// the two paying subscriber classes — credit unions / FIs and LPs / co-investors —
// through eligibility gates, and emit pro-rata allocation objects
// (`capital_markets:participation` / `:syndication`) plus the monetizable
// `cooperative_markets:deal_flow_access` outcome.
//
// Truth discipline (DOCTRINE / ADR-0005), load-bearing here:
//   * No allocation to an UNGATED subscriber. Each subscriber must clear sanctions
//     (OFAC) and identity (KYC for a natural person / KYB for an entity); LPs must
//     additionally be accredited (co-invest eligibility). Every allocation cites the
//     gating facts; every rejection carries explicit reasons.
//   * Allocation is a PROPOSAL (`status: "proposed"`). Actual capital movement is P4
//     settlement (vehicle-agnostic here — advisory/syndication/fund/spv).
//
// Pure, deterministic module. Consumes P2 (`ic_memo.ts`); vehicle-agnostic.

import type { ICMemo, ICRecommendation } from "@/cartridges/cooperative_markets/ic_memo";

export type SubscriberKind = "credit_union" | "lp";
export type ScreenStatus = "cleared" | "pending" | "failed";
export type Accreditation = "accredited" | "qualified_purchaser" | "none";

export interface Subscriber {
  id: string;
  name: string;
  kind: SubscriberKind;
  /** entity / profile ref (traceability). */
  ref: string;
  /** LP co-invest eligibility (required for kind = "lp"). */
  accreditation?: Accreditation;
  /** Identity screening — natural person. */
  kyc_status?: ScreenStatus;
  /** Identity screening — entity (CUs are entities; entity LPs too). */
  kyb_status?: ScreenStatus;
  /** OFAC / sanctions screening. */
  sanctions_status?: ScreenStatus;
  interest?: { categories: string[]; max_check_usd?: number };
  requested_usd?: number;
}

export interface DealForAllocation {
  company: string;
  ref: string;
  category: string;
  /** From the IC memo — only recommend / recommend_with_conditions are allocatable. */
  recommendation: ICRecommendation;
  capacity_usd: number;
}

export type RejectReason =
  | "deal_not_approved"
  | "no_amount"
  | "no_interest"
  | "category_mismatch"
  | "sanctions_not_cleared"
  | "kyc_incomplete"
  | "kyb_incomplete"
  | "not_accredited"
  | "no_capacity";

export interface Allocation {
  subscriber_id: string;
  subscriber: string;
  kind: SubscriberKind;
  requested_usd: number;
  allocated_usd: number;
  /** capital_markets:participation (CU co-invest) | :syndication (LP). */
  vehicle_object: string;
  /** The gating facts this allocation is grounded in. */
  citations: string[];
  /** True when pro-rata scaling reduced the ask (oversubscribed round). */
  scaled: boolean;
  status: "proposed";
}

export interface Rejection {
  subscriber_id: string;
  subscriber: string;
  reasons: RejectReason[];
}

export interface AllocationResult {
  deal: string;
  category: string;
  capacity_usd: number;
  allocated_usd: number;
  remaining_usd: number;
  allocations: Allocation[];
  rejected: Rejection[];
  /** The monetizable outcome: qualified matches delivered to subscribers. */
  deal_flow_access: { qualified_matches: number; kind: "cooperative_markets:deal_flow_access" };
  status: "proposed";
  generated_by: "allocation:v1";
}

// ---------------------------------------------------------------------------
// Eligibility (gates). Returns the reasons a subscriber is INELIGIBLE (empty = ok).
// ---------------------------------------------------------------------------

const ALLOCATABLE: ICRecommendation[] = ["recommend", "recommend_with_conditions"];

function ineligibilityReasons(s: Subscriber, deal: DealForAllocation): RejectReason[] {
  const reasons: RejectReason[] = [];
  if (!ALLOCATABLE.includes(deal.recommendation)) reasons.push("deal_not_approved");
  const requested = s.requested_usd ?? 0;
  if (requested <= 0) reasons.push("no_amount");
  if (!s.interest || s.interest.categories.length === 0) reasons.push("no_interest");
  else if (!s.interest.categories.includes(deal.category)) reasons.push("category_mismatch");
  if (s.sanctions_status !== "cleared") reasons.push("sanctions_not_cleared");
  // Identity: an entity needs KYB; a natural-person subscriber needs KYC. We accept
  // either cleared as satisfying identity, and require the relevant one per kind.
  const kybOk = s.kyb_status === "cleared";
  const kycOk = s.kyc_status === "cleared";
  if (s.kind === "credit_union") {
    if (!kybOk) reasons.push("kyb_incomplete");
  } else {
    // LP: identity (KYC or KYB) + accreditation.
    if (!kybOk && !kycOk) reasons.push(kycOk ? "kyb_incomplete" : "kyc_incomplete");
    if (!s.accreditation || s.accreditation === "none") reasons.push("not_accredited");
  }
  return reasons;
}

function vehicleFor(kind: SubscriberKind): string {
  return kind === "credit_union"
    ? "financial_services:capital_markets:participation"
    : "financial_services:capital_markets:syndication";
}

function gatingCitations(s: Subscriber): string[] {
  const c: string[] = [];
  if (s.sanctions_status) c.push(`${s.ref}#ofac:${s.sanctions_status}`);
  if (s.kyb_status) c.push(`${s.ref}#kyb:${s.kyb_status}`);
  if (s.kyc_status) c.push(`${s.ref}#kyc:${s.kyc_status}`);
  if (s.kind === "lp" && s.accreditation) c.push(`${s.ref}#accreditation:${s.accreditation}`);
  return c;
}

function floorTo(n: number, step = 1000): number {
  return Math.floor(n / step) * step;
}

// ---------------------------------------------------------------------------
// Allocation — pro-rata to capacity, deterministic (sorted by subscriber id).
// ---------------------------------------------------------------------------

export function allocateDeal(
  deal: DealForAllocation,
  subscribers: Subscriber[],
): AllocationResult {
  const sorted = [...subscribers].sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));

  const eligible: Subscriber[] = [];
  const rejected: Rejection[] = [];
  for (const s of sorted) {
    const reasons = ineligibilityReasons(s, deal);
    if (reasons.length) rejected.push({ subscriber_id: s.id, subscriber: s.name, reasons });
    else eligible.push(s);
  }

  const totalRequested = eligible.reduce((sum, s) => sum + (s.requested_usd ?? 0), 0);
  const oversubscribed = totalRequested > deal.capacity_usd && totalRequested > 0;
  const scaleFactor = oversubscribed ? deal.capacity_usd / totalRequested : 1;

  const allocations: Allocation[] = eligible.map((s) => {
    const requested = s.requested_usd ?? 0;
    const capped = Math.min(requested, s.interest?.max_check_usd ?? requested);
    const allocated = oversubscribed ? floorTo(capped * scaleFactor) : capped;
    return {
      subscriber_id: s.id,
      subscriber: s.name,
      kind: s.kind,
      requested_usd: requested,
      allocated_usd: allocated,
      vehicle_object: vehicleFor(s.kind),
      citations: gatingCitations(s),
      scaled: oversubscribed,
      status: "proposed",
    };
  });

  const allocated_usd = allocations.reduce((sum, a) => sum + a.allocated_usd, 0);

  return {
    deal: deal.company,
    category: deal.category,
    capacity_usd: deal.capacity_usd,
    allocated_usd,
    remaining_usd: Math.max(0, deal.capacity_usd - allocated_usd),
    allocations,
    rejected,
    deal_flow_access: { qualified_matches: allocations.length, kind: "cooperative_markets:deal_flow_access" },
    status: "proposed",
    generated_by: "allocation:v1",
  };
}

/** Convenience: build a DealForAllocation from an IC memo + a capacity. */
export function dealFromMemo(memo: ICMemo, ref: string, category: string, capacity_usd: number): DealForAllocation {
  return { company: memo.company, ref, category, recommendation: memo.recommendation, capacity_usd };
}
