// tests/deal_engine.test.mjs — VC Deal Engine P1 (scoring + screening recommendation).
import { test } from "node:test";
import assert from "node:assert/strict";
import { register } from "node:module";
register("../scripts/alias-hook.mjs", import.meta.url);

const {
  assembleScorecard,
  scoreOpportunity,
  scoreInnovation,
  DEFAULT_THRESHOLDS,
} = await import("@/cartridges/cooperative_markets/deal_engine");

// --- builders (deterministic; every input sourced) ---------------------------
const si = (value, source_ref = "fact:x", confidence = 0.8) => ({ value, source_ref, confidence });

function startup(compliance, extra = {}) {
  return {
    company: "X",
    ref: "startup#x",
    category: "real_time_payments",
    capability_differentiation: si(0.85),
    competitive_position: si(0.7),
    innovation_velocity: si(0.8),
    traction: si(0.72),
    compliance_readiness: si(compliance, "claim:soc2"),
    security_posture: si(0.78),
    cu_references: si(0.8),
    financial_stability: si(0.68),
    support_model: si(0.65),
    api_maturity: si(0.8),
    connector_availability: si(0.6),
    integration_standards: si(0.7),
    ...extra,
  };
}
const inst = () => ({
  institution: "CU",
  ref: "cu",
  executive_support: si(0.75, "fact:i"),
  budget_capacity: si(0.55, "fact:i"),
  tech_ops_capacity: si(0.7, "fact:i"),
  security_compliance_posture: si(0.72, "fact:i"),
  strategic_alignment: si(0.85, "fact:i"),
  digital_ai_maturity: si(0.71, "fact:i"),
});
const opp = (sf, rf, tm) => ({
  strategic_fit: si(sf, "inf:o", 0.7),
  regulatory_fit: si(rf, "inf:o", 0.7),
  timing: si(tm, "inf:o", 0.7),
});

test("deal_engine: strong compliant deal ADVANCES (opportunity >= advance threshold)", () => {
  const sc = assembleScorecard(startup(0.82), inst(), opp(0.85, 0.85, 0.85));
  assert.equal(sc.recommendation, "advance");
  assert.ok(sc.scores.opportunity.value >= DEFAULT_THRESHOLDS.advance_opportunity);
});

test("deal_engine: mid opportunity HOLDS; low opportunity DECLINES", () => {
  const hold = assembleScorecard(startup(0.82), inst(), opp(0.6, 0.6, 0.6));
  assert.equal(hold.scores.opportunity.value, 60);
  assert.equal(hold.recommendation, "hold");

  const decline = assembleScorecard(startup(0.82), inst(), opp(0.4, 0.4, 0.4));
  assert.equal(decline.scores.opportunity.value, 40);
  assert.equal(decline.recommendation, "decline");
});

test("deal_engine: COMPLIANCE GATE blocks even at opportunity 95", () => {
  const sc = assembleScorecard(startup(0.3), inst(), opp(0.95, 0.95, 0.95));
  assert.equal(sc.scores.opportunity.value, 95); // opportunity is stellar...
  assert.equal(sc.recommendation, "blocked"); // ...but compliance below the gate blocks
  assert.match(sc.rationale, /compliance/i);
});

test("deal_engine: opportunity is a GEOMETRIC MEAN — one low dimension sinks it", () => {
  const s = scoreOpportunity(opp(0.9, 0.9, 0.1));
  // geometric mean cbrt(0.9*0.9*0.1) ~= 0.433 -> 43.3, far below the arithmetic mean (63.3)
  assert.ok(s.value < 50, `expected <50, got ${s.value}`);
  const arithmetic = ((0.9 + 0.9 + 0.1) / 3) * 100;
  assert.ok(s.value < arithmetic - 15, `geo ${s.value} should trail arithmetic ${arithmetic}`);
});

test("deal_engine: every score is a sourced inference (tier + non-empty lineage)", () => {
  const sc = assembleScorecard(startup(0.82), inst(), opp(0.85, 0.85, 0.85));
  for (const s of Object.values(sc.scores)) {
    assert.equal(s.tier, "dispatch_inference");
    assert.ok(s.lineage.length > 0, `${s.key} must carry lineage`);
    assert.ok(s.value >= 0 && s.value <= 100);
    assert.ok(s.confidence >= 0 && s.confidence <= 1);
  }
  assert.ok(sc.lineage.length > 0);
  assert.equal(sc.generated_by, "deal_engine:v1");
});

test("deal_engine: missing inputs are imputed (flagged, low confidence, excluded from lineage)", () => {
  const s = scoreInnovation(startup(0.82, { capability_differentiation: undefined }));
  const f = s.factors.find((x) => x.key === "capability_differentiation");
  assert.equal(f.imputed, true);
  assert.equal(f.source_ref, "unsourced:missing");
  assert.equal(f.value, 0.4);
  assert.equal(f.confidence, 0.2);
  assert.ok(!s.lineage.includes("unsourced:missing"), "imputed ref must not appear in lineage");
});

test("deal_engine: fully-missing score has empty lineage but stays well-formed", () => {
  const bare = { company: "Y", ref: "y", category: "c" };
  const s = scoreInnovation(bare);
  assert.deepEqual(s.lineage, []);
  assert.ok(s.factors.every((f) => f.imputed === true));
  assert.equal(s.tier, "dispatch_inference");
});

test("deal_engine: deterministic — same input yields deep-equal output", () => {
  const a = assembleScorecard(startup(0.82), inst(), opp(0.82, 0.74, 0.78));
  const b = assembleScorecard(startup(0.82), inst(), opp(0.82, 0.74, 0.78));
  assert.deepEqual(a, b);
});
