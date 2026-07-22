// tests/startup_intake_connector.test.mjs — the DEFERRED live intake path (Sprint III
// Wave 2): the startup-intake connector NORMALIZES a submission (no scoring), the runtime
// tiers it third_party_claim FROM THE SOURCE MANIFEST, and the EXISTING deal engine runs
// on normalized intake (not seed inputs), citing the submission — human gates untouched.
import { test } from "node:test";
import assert from "node:assert/strict";
import { register } from "node:module";
register("../scripts/alias-hook.mjs", import.meta.url);

const { parseStartupIntake, makeStartupIntakeConnector } = await import(
  "@/cartridges/cooperative_markets/connectors/startup_intake_connector"
);
const {
  runStartupIntake,
  intakeICMemo,
  recordToStartupProfile,
  illustrativeInstitutionReadiness,
  INTAKE_CLAIM_CONFIDENCE,
} = await import("@/cartridges/cooperative_markets/run_intake");
const { startupIntakeFixtures } = await import("@/cartridges/cooperative_markets/intake_fixtures");
const { EventBus } = await import("@/core/kernel/event_bus");
const { CostLedger } = await import("@/core/kernel/cost_ledger");

const AS_OF = "2026-07-22T00:00:00.000Z";

// ---- the connector NORMALIZES only (no scoring, no tier, no gate) -------------
test("parseStartupIntake normalizes the self-reported signals verbatim — no scoring", () => {
  const raw = startupIntakeFixtures()[0];
  const rec = parseStartupIntake(raw);
  assert.equal(rec.external_ref, raw.submission_id, "the submission id is the change-detection key");
  assert.equal(rec.subject_type, "innovation_company");
  assert.equal(rec.predicate, "startup_intake_submission");
  assert.equal(rec.value.capability_differentiation, raw.capability_differentiation, "self-reported signal carried verbatim");
  assert.equal(rec.value.opportunity_score, undefined, "no score: scoring is a downstream engine, not the connector");
  assert.equal(rec.entity_candidates[0].external_ids[0].system, "domain", "company surfaced as an entity candidate keyed by domain");
});

test("a signal absent from the form is simply not carried (engine imputes downstream)", () => {
  const rec = parseStartupIntake({ submission_id: "s:1", company: "Acme", category: "x" });
  assert.equal(rec.value.traction, undefined, "an omitted signal is not fabricated");
  assert.ok(!("traction" in rec.value), "omitted signals are absent, not defaulted in the connector");
});

// ---- runtime: authorize-first, correlated, tier FROM THE SOURCE MANIFEST ------
test("runStartupIntake tiers intake as third_party_claim from the source manifest (never a fact)", async () => {
  const bus = new EventBus();
  const ledger = new CostLedger();
  const r = await runStartupIntake(startupIntakeFixtures(), illustrativeInstitutionReadiness(), { as_of: AS_OF, bus, ledger });
  assert.equal(r.output.status, "success");
  assert.equal(r.observations.length, 3, "one observation per submission");
  assert.equal(r.observations[0].tier, "third_party_claim", "intake is a company's own CLAIM — tier from the source manifest, not the connector");
  assert.equal(r.observations[0].plane, "shared_market");
  assert.equal(bus.history({ type: "connector.started" })[0].correlation_id, "corr:connector:startup_intake", "the run correlates to its envelope");
  assert.ok(ledger.byCategory().connector > 0, "a correlated connector CostEntry is recorded");
});

// ---- the deal engine runs on NORMALIZED intake, citing the submission ---------
test("the deal engine scores each applicant on normalized intake, exercising every gate", async () => {
  const r = await runStartupIntake(startupIntakeFixtures(), illustrativeInstitutionReadiness(), { as_of: AS_OF });
  const byCompany = Object.fromEntries(r.scored.map((s) => [s.startup.company, s.scorecard.recommendation]));
  assert.equal(byCompany["Halcyon Pay"], "advance", "a strong, compliance-ready applicant advances");
  assert.equal(byCompany["Meridian Ledger"], "blocked", "compliance below the gate BLOCKS regardless of opportunity");
  assert.equal(byCompany["Cobalt Rails"], "hold", "a middling-opportunity applicant holds");
});

test("every score's lineage cites the intake submission (real intake, not seed inputs)", async () => {
  const r = await runStartupIntake(startupIntakeFixtures(), illustrativeInstitutionReadiness(), { as_of: AS_OF });
  for (const s of r.scored) {
    assert.ok(s.scorecard.lineage.includes(s.record.external_ref), `${s.startup.company} scorecard cites its submission id`);
    assert.equal(s.scorecard.scores.innovation.tier, "dispatch_inference", "a score is a dispatch inference, not a fact");
  }
});

test("intake-derived sourced inputs carry the self-reported (unverified) confidence", () => {
  const rec = parseStartupIntake(startupIntakeFixtures()[0]);
  const p = recordToStartupProfile(rec);
  assert.equal(p.capability_differentiation.confidence, INTAKE_CLAIM_CONFIDENCE, "a self-reported claim is modest confidence, not a filed-fact confidence");
  assert.equal(p.capability_differentiation.source_ref, rec.external_ref, "the sourced input cites the submission (lineage)");
});

// ---- P2: the memo stays a DRAFT proposal — human gates untouched --------------
test("intakeICMemo produces a DRAFT proposal (the committee decision is a separate human gate)", async () => {
  const r = await runStartupIntake(startupIntakeFixtures(), illustrativeInstitutionReadiness(), { as_of: AS_OF });
  const advance = r.scored.find((s) => s.scorecard.recommendation === "advance");
  const memo = intakeICMemo(advance, [
    { category: "compliance_fit", summary: "SOC2 in place", status: "clear", evidence: [{ ref: "ev:soc2", label: "SOC2", approved: true }] },
    { category: "regulatory", summary: "clear", status: "clear", evidence: [{ ref: "ev:reg", label: "reg", approved: true }] },
    { category: "financial", summary: "24mo runway", status: "clear", evidence: [{ ref: "ev:fin", label: "fin", approved: true }] },
    { category: "technology", summary: "mature api", status: "clear", evidence: [{ ref: "ev:tech", label: "tech", approved: true }] },
    { category: "cybersecurity", summary: "pen tested", status: "clear", evidence: [{ ref: "ev:cyber", label: "cyber", approved: true }] },
  ]);
  assert.equal(memo.status, "draft", "the memo is a proposal, never an autonomous decision");
  assert.equal(memo.coverage.covered.length, 5, "all required DD categories covered");
  assert.ok(["recommend", "recommend_with_conditions"].includes(memo.recommendation), "a covered, unblocked memo recommends (a proposal)");
});

test("unapproved diligence evidence is excluded from the memo (approved-evidence-only)", async () => {
  const r = await runStartupIntake(startupIntakeFixtures(), illustrativeInstitutionReadiness(), { as_of: AS_OF });
  const advance = r.scored.find((s) => s.scorecard.recommendation === "advance");
  const memo = intakeICMemo(advance, [
    { category: "compliance_fit", summary: "unverified claim", status: "clear", evidence: [{ ref: "ev:unapp", label: "unapproved", approved: false }] },
  ]);
  assert.ok(memo.excluded_unapproved.includes("ev:unapp"), "unapproved evidence is excluded + listed");
  assert.ok(!memo.coverage.covered.includes("compliance_fit"), "an unapproved-only finding does not count as coverage");
});

// ---- determinism -------------------------------------------------------------
test("the intake run is deterministic", async () => {
  const a = await runStartupIntake(startupIntakeFixtures(), illustrativeInstitutionReadiness(), { as_of: AS_OF });
  const b = await runStartupIntake(startupIntakeFixtures(), illustrativeInstitutionReadiness(), { as_of: AS_OF });
  assert.equal(JSON.stringify(a.output), JSON.stringify(b.output), "connector output is byte-identical");
  assert.equal(JSON.stringify(a.scored.map((s) => s.scorecard)), JSON.stringify(b.scored.map((s) => s.scorecard)), "the scorecards are byte-identical");
});
