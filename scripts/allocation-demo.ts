// scripts/allocation-demo.ts
//
// Runnable demo for VC Deal Engine P3 — allocation + subscriber tiers
// (VC_DEAL_ENGINE_SPEC §7). Allocates an approved deal to a mixed set of CU + LP
// subscribers, proving the eligibility gates (sanctions / KYC-KYB / LP accreditation)
// and pro-rata scaling on oversubscription. Deterministic.

import {
  allocateDeal,
  type DealForAllocation,
  type Subscriber,
} from "@/cartridges/cooperative_markets/allocation";

const deal: DealForAllocation = {
  company: "Halcyon Pay",
  ref: "financial_services:innovation_ecosystem:startup#halcyon_pay",
  category: "real_time_payments",
  recommendation: "recommend_with_conditions", // from the P2 IC memo
  capacity_usd: 2_000_000,
};

const subscribers: Subscriber[] = [
  { id: "cu_summit", name: "Summit Ridge FCU", kind: "credit_union", ref: "cu#summit",
    kyb_status: "cleared", sanctions_status: "cleared",
    interest: { categories: ["real_time_payments", "fraud"], max_check_usd: 750_000 }, requested_usd: 750_000 },
  { id: "cu_harbor", name: "Harbor Point CU", kind: "credit_union", ref: "cu#harbor",
    kyb_status: "pending", sanctions_status: "cleared", // KYB not cleared → rejected
    interest: { categories: ["real_time_payments"] }, requested_usd: 500_000 },
  { id: "lp_meridian", name: "Meridian Family Office", kind: "lp", ref: "lp#meridian",
    accreditation: "qualified_purchaser", kyb_status: "cleared", sanctions_status: "cleared",
    interest: { categories: ["real_time_payments", "lending_tech"] }, requested_usd: 1_000_000 },
  { id: "lp_novus", name: "Novus Angels", kind: "lp", ref: "lp#novus",
    accreditation: "none", kyc_status: "cleared", sanctions_status: "cleared", // not accredited → rejected
    interest: { categories: ["real_time_payments"] }, requested_usd: 400_000 },
  { id: "cu_delta", name: "Delta Community CU", kind: "credit_union", ref: "cu#delta",
    kyb_status: "cleared", sanctions_status: "cleared",
    interest: { categories: ["mortgage_tech"] }, requested_usd: 300_000 }, // category mismatch → rejected
];

const result = allocateDeal(deal, subscribers);

console.log(`\n=== Deal Allocation (PROPOSED) ===`);
console.log(`${result.deal}  ·  ${result.category}  ·  capacity $${result.capacity_usd.toLocaleString()}\n`);
console.log(`  Allocated $${result.allocated_usd.toLocaleString()} / $${result.capacity_usd.toLocaleString()}  (remaining $${result.remaining_usd.toLocaleString()})`);
console.log(`  Qualified matches (deal_flow_access): ${result.deal_flow_access.qualified_matches}\n`);
for (const a of result.allocations) {
  console.log(`  ✓ ${a.subscriber.padEnd(24)} ${a.kind.padEnd(13)} $${a.allocated_usd.toLocaleString().padStart(9)}  via ${a.vehicle_object.split(":").pop()}${a.scaled ? "  (scaled)" : ""}`);
}
for (const r of result.rejected) {
  console.log(`  ✗ ${r.subscriber.padEnd(24)} ${" ".repeat(13)} rejected: ${r.reasons.join(", ")}`);
}
console.log(`\n  status: ${result.status}  ·  ${result.generated_by}  (settlement is P4 — vehicle-agnostic)\n`);
