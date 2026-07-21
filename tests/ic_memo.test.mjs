// tests/ic_memo.test.mjs — VC Deal Engine P2 (diligence + IC memo, approved-evidence-only).
import { test } from "node:test";
import assert from "node:assert/strict";
import { register } from "node:module";
register("../scripts/alias-hook.mjs", import.meta.url);

const { assembleICMemo, REQUIRED_DD } = await import("@/cartridges/cooperative_markets/ic_memo");
const { assembleScorecard } = await import("@/cartridges/cooperative_markets/deal_engine");

const si = (value, source_ref = "fact:x", confidence = 0.8) => ({ value, source_ref, confidence });
function startup(compliance) {
  return {
    company: "Halcyon", ref: "startup#h", category: "real_time_payments",
    capability_differentiation: si(0.85), competitive_position: si(0.7), innovation_velocity: si(0.8), traction: si(0.72),
    compliance_readiness: si(compliance, "claim:soc2"), security_posture: si(0.78), cu_references: si(0.8), financial_stability: si(0.68), support_model: si(0.65),
    api_maturity: si(0.8), connector_availability: si(0.6), integration_standards: si(0.7),
  };
}
const inst = () => ({
  institution: "Summit", ref: "cu",
  executive_support: si(0.75, "fact:i"), budget_capacity: si(0.55, "fact:i"), tech_ops_capacity: si(0.7, "fact:i"),
  security_compliance_posture: si(0.72, "fact:i"), strategic_alignment: si(0.85, "fact:i"), digital_ai_maturity: si(0.71, "fact:i"),
});
const opp = (sf, rf, tm) => ({ strategic_fit: si(sf, "inf:o", 0.7), regulatory_fit: si(rf, "inf:o", 0.7), timing: si(tm, "inf:o", 0.7) });

// An advancing scorecard (opportunity ~78, compliance clear).
const advancing = () => assembleScorecard(startup(0.82), inst(), opp(0.82, 0.74, 0.78));

const ev = (ref, approved) => ({ ref, label: ref, approved });
const clearAll = () => [
  { category: "compliance_fit", status: "clear", summary: "SOC2", evidence: [ev("a", true)] },
  { category: "regulatory", status: "clear", summary: "controls", evidence: [ev("b", true)] },
  { category: "financial", status: "clear", summary: "runway", evidence: [ev("c", true)] },
  { category: "technology", status: "clear", summary: "api", evidence: [ev("d", true)] },
  { category: "cybersecurity", status: "clear", summary: "pentest", evidence: [ev("e", true)] },
];

test("ic_memo: APPROVED-EVIDENCE-ONLY — unapproved evidence is excluded and never cited", () => {
  const findings = [
    ...clearAll(),
    { category: "insurance", status: "clear", summary: "COI draft", evidence: [ev("f_unapproved", false)] },
  ];
  const memo = assembleICMemo(advancing(), findings);
  assert.ok(memo.excluded_unapproved.includes("f_unapproved"));
  assert.ok(memo.citation_map.every((c) => c.ref !== "f_unapproved"), "citation_map must never carry an unapproved ref");
  // The wholly-unapproved finding is excluded from the risks/diligence body too.
  assert.ok(memo.risks.every((r) => !r.citations.includes("f_unapproved")));
});

test("ic_memo: a finding with a MIX of evidence keeps only the approved refs", () => {
  const findings = [
    ...clearAll(),
    { category: "operational", status: "concern", summary: "mixed", mitigation: "fix", evidence: [ev("ok", true), ev("bad", false)] },
  ];
  const memo = assembleICMemo(advancing(), findings);
  assert.ok(memo.excluded_unapproved.includes("bad"));
  const cited = memo.citation_map.map((c) => c.ref);
  assert.ok(cited.includes("ok"));
  assert.ok(!cited.includes("bad"));
});

test("ic_memo: a REQUIRED_DD blocker forces recommendation 'blocked'", () => {
  const memo = assembleICMemo(advancing(), [
    { category: "compliance_fit", status: "blocker", summary: "no soc2", mitigation: "obtain", evidence: [ev("z", true)] },
  ]);
  assert.equal(memo.recommendation, "blocked");
  assert.ok(REQUIRED_DD.includes("compliance_fit"));
});

test("ic_memo: missing required coverage yields 'hold'", () => {
  // Only compliance_fit covered; regulatory/financial/technology/cybersecurity missing.
  const memo = assembleICMemo(advancing(), [
    { category: "compliance_fit", status: "clear", summary: "ok", evidence: [ev("a", true)] },
  ]);
  assert.equal(memo.recommendation, "hold");
  assert.ok(memo.coverage.missing.length > 0);
  assert.ok(memo.coverage.missing.includes("regulatory"));
});

test("ic_memo: a concern in a covered required set -> recommend_with_conditions + a condition", () => {
  const findings = [
    { category: "compliance_fit", status: "clear", summary: "SOC2", evidence: [ev("a", true)] },
    { category: "regulatory", status: "concern", summary: "OFAC windows", mitigation: "attach checklist", evidence: [ev("b", true)] },
    { category: "financial", status: "clear", summary: "runway", evidence: [ev("c", true)] },
    { category: "technology", status: "clear", summary: "api", evidence: [ev("d", true)] },
    { category: "cybersecurity", status: "clear", summary: "pentest", evidence: [ev("e", true)] },
  ];
  const memo = assembleICMemo(advancing(), findings);
  assert.equal(memo.recommendation, "recommend_with_conditions");
  assert.equal(memo.coverage.missing.length, 0);
  assert.ok(memo.conditions.length >= 1);
  assert.match(memo.conditions[0], /Regulatory/);
});

test("ic_memo: fully clean + fully covered -> recommend; status always draft", () => {
  const memo = assembleICMemo(advancing(), clearAll());
  assert.equal(memo.recommendation, "recommend");
  assert.equal(memo.status, "draft");
  assert.equal(memo.object, "financial_services:innovation_ecosystem:investment_committee_memo");
});

test("ic_memo: a blocked SCORECARD propagates to a blocked memo", () => {
  const blockedSc = assembleScorecard(startup(0.3), inst(), opp(0.9, 0.9, 0.9));
  assert.equal(blockedSc.recommendation, "blocked");
  const memo = assembleICMemo(blockedSc, clearAll());
  assert.equal(memo.recommendation, "blocked");
});

test("ic_memo: deterministic — same inputs deep-equal", () => {
  const sc = advancing();
  const f = clearAll();
  assert.deepEqual(assembleICMemo(sc, f), assembleICMemo(sc, f));
});
