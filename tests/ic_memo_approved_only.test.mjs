// tests/ic_memo_approved_only.test.mjs — Wave 4 hardening of the load-bearing
// "APPROVED EVIDENCE ONLY" invariant. A finding whose evidence is ALL UNAPPROVED
// must be treated as if absent: it cannot COUNT TOWARD DD COVERAGE (not just be
// missing from the citation map). This catches a mutation that admits unapproved
// findings into coverage — which the citation/excluded assertions alone do not.
import { test } from "node:test";
import assert from "node:assert/strict";
import { register } from "node:module";
register("../scripts/alias-hook.mjs", import.meta.url);

const { assembleScorecard } = await import("@/cartridges/cooperative_markets/deal_engine");
const { assembleICMemo, REQUIRED_DD } = await import("@/cartridges/cooperative_markets/ic_memo");

const s = (v) => ({ value: v, source_ref: "fact:x", confidence: 0.8 });
const startup = {
  company: "Halcyon", ref: "co:halcyon", category: "real_time_payments",
  capability_differentiation: s(0.85), competitive_position: s(0.7), innovation_velocity: s(0.8), traction: s(0.72),
  compliance_readiness: s(0.82), security_posture: s(0.78), cu_references: s(0.8), financial_stability: s(0.68), support_model: s(0.65),
  api_maturity: s(0.8), connector_availability: s(0.6), integration_standards: s(0.7),
};
const inst = {
  institution: "Summit", ref: "cu:summit",
  executive_support: s(0.75), budget_capacity: s(0.55), tech_ops_capacity: s(0.7),
  security_compliance_posture: s(0.72), strategic_alignment: s(0.85), digital_ai_maturity: s(0.71),
};
const opp = { strategic_fit: s(0.82), regulatory_fit: s(0.74), timing: s(0.78) };

function findings(cyberEvidenceApproved) {
  // All REQUIRED_DD categories clear + approved, EXCEPT cybersecurity, whose only
  // evidence's approval is the variable under test.
  return [
    { category: "compliance_fit", status: "clear", summary: "SOC2", evidence: [{ ref: "a", label: "SOC2", approved: true }] },
    { category: "regulatory", status: "clear", summary: "controls", evidence: [{ ref: "b", label: "reg", approved: true }] },
    { category: "financial", status: "clear", summary: "runway", evidence: [{ ref: "c", label: "fin", approved: true }] },
    { category: "technology", status: "clear", summary: "api", evidence: [{ ref: "d", label: "api", approved: true }] },
    { category: "cybersecurity", status: "clear", summary: "pentest", evidence: [{ ref: "cyber", label: "pen", approved: cyberEvidenceApproved }] },
  ];
}

test("ic_memo: with all 5 required categories APPROVED-covered, the memo recommends", () => {
  const sc = assembleScorecard(startup, inst, opp);
  const memo = assembleICMemo(sc, findings(true));
  assert.equal(memo.coverage.missing.length, 0);
  assert.equal(memo.recommendation, "recommend");
});

test("ic_memo: an all-UNAPPROVED required finding does NOT count toward coverage → HOLD", () => {
  const sc = assembleScorecard(startup, inst, opp);
  const memo = assembleICMemo(sc, findings(false)); // cybersecurity evidence unapproved
  // The load-bearing invariant: the unapproved cybersecurity finding is inadmissible,
  // so cybersecurity is MISSING coverage and the memo must HOLD (not recommend).
  assert.ok(REQUIRED_DD.includes("cybersecurity"));
  assert.ok(memo.coverage.missing.includes("cybersecurity"), "unapproved-only finding must not cover its category");
  assert.equal(memo.recommendation, "hold");
  // And its ref is excluded + never cited.
  assert.ok(memo.excluded_unapproved.includes("cyber"));
  assert.ok(memo.citation_map.every((c) => c.ref !== "cyber"));
});
