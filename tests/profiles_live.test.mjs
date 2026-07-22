// tests/profiles_live.test.mjs — LIVE profiles over real intake (Cooperative Markets).
import { test } from "node:test";
import assert from "node:assert/strict";
import { register } from "node:module";
register("../scripts/alias-hook.mjs", import.meta.url);

const { ingestRegulatoryCorpus } = await import("@/cartridges/cooperative_markets/ingest_regulations");
const { institutionBatchFixtures } = await import("@/cartridges/cooperative_markets/batch_fixtures");
const { ingestInstitutionBatch } = await import("@/cartridges/cooperative_markets/ingest_batch");
const {
  buildLiveProfiles,
  assembleRegulationEnvironmentProfile,
  periodToObservedAt,
  REGULATION_ENVIRONMENT_FIELD_KEYS,
} = await import("@/cartridges/cooperative_markets/profiles_live");

const AS_OF = "2026-07-22T00:00:00.000Z";
const ISSUE = "2026-07-15";

// A tiny but real-shaped regulatory corpus (2 in-force sections, 1 full-text
// amendment, 1 held instruction) — exercises the same ingest path as the 675.
const records = [
  { part: "701", part_title: "Organization", section: "701.1", title: "Fields of membership", node_type: "section", cfr_ref: "12 CFR 701.1", body_text: "x".repeat(400) },
  { part: "701", part_title: "Organization", section: "701.2", title: "Federal credit union bylaws", node_type: "section", cfr_ref: "12 CFR 701.2", body_text: "y".repeat(200) },
  { part: "702", part_title: "Capital adequacy", section: "702.1", title: "Authority", node_type: "section", cfr_ref: "12 CFR 702.1", body_text: "z".repeat(150) },
];
const amendments = [
  { part: "701", section: "701.1", new_title: "Fields of membership", amendment_type: "revised_full", effective_on: "2026-10-01", in_force_as_of_base_file: false, fr_citation: "91 FR 1", fr_document_number: "2026-1", fr_rule_title: "R", fr_publication_date: "2026-06-01", fr_url: "http://x", amendment_instructions: ["revise"], new_text: "n".repeat(120) },
  { part: "702", section: "702.1", new_title: "Authority", amendment_type: "amended_instruction", effective_on: "2026-11-01", in_force_as_of_base_file: false, fr_citation: "91 FR 2", fr_document_number: "2026-2", fr_rule_title: "R2", fr_publication_date: "2026-06-02", fr_url: "http://y", amendment_instructions: ["remove word"], new_text: "" },
];
const regCtx = {
  issue_date: ISSUE, observed_at: "2026-07-21T17:00:00.000Z",
  source_id: "source:ncua_regulations", source_document_id: "sourcedoc:ncua:regulations:test",
  id_prefix: "ncua:reg",
};

test("periodToObservedAt maps a 5300 quarter to its quarter-end", () => {
  assert.equal(periodToObservedAt("2026-Q1", AS_OF), "2026-03-31T00:00:00.000Z");
  assert.equal(periodToObservedAt("2026-Q4", AS_OF), "2026-12-31T00:00:00.000Z");
  assert.equal(periodToObservedAt("garbage", AS_OF), AS_OF); // fallback, no spurious decay
});

test("regulation-environment profile: counts reconcile to the corpus", () => {
  const corpus = ingestRegulatoryCorpus(records, amendments, regCtx);
  const p = assembleRegulationEnvironmentProfile(corpus, { as_of: AS_OF, id_prefix: "coop" });
  const val = (k) => p.fields.find((f) => f.key === k).value;
  assert.equal(val("in_force_sections"), corpus.total_sections); // 3
  assert.equal(val("pending_amendments"), corpus.pending_full_text); // 1
  assert.equal(val("held_instructions"), corpus.held_instructions); // 1
  assert.equal(val("parts_covered"), corpus.parts.length); // 2 (701, 702)
  assert.equal(val("largest_part_sections"), 2); // 701 has 2 sections
  assert.equal(p.subject_type, "regulation_environment");
  // Every field cites the corpus SourceDocument (lineage), tier is a calc.
  for (const f of p.fields) {
    assert.equal(f.source_ref, corpus.source_document.id);
    assert.equal(f.tier, "deterministic_calculation");
  }
  assert.deepEqual(p.field_freshness.map((f) => f.key), REGULATION_ENVIRONMENT_FIELD_KEYS);
});

test("regulation-environment profile ages from the eCFR issue date", () => {
  const corpus = ingestRegulatoryCorpus(records, amendments, regCtx);
  const p = assembleRegulationEnvironmentProfile(corpus, { as_of: AS_OF, id_prefix: "coop" });
  // Issue 2026-07-15 → as_of 2026-07-22 is 7 days; freshness < 1 but still fresh.
  assert.ok(p.field_freshness[0].age_days === 7, "aged from the issue date, not as_of");
  assert.ok(p.confidence < 0.95 && p.confidence > 0.9, "slight decay off the 0.95 prior");
});

test("institution live profiles decay from the reporting quarter-end", () => {
  const batch = ingestInstitutionBatch(institutionBatchFixtures(), { observed_at: AS_OF, id_prefix: "coop:batch" });
  const set = buildLiveProfiles({ corpus: ingestRegulatoryCorpus(records, amendments, regCtx), batch }, { as_of: AS_OF, id_prefix: "coop" });
  assert.equal(set.institutions.length, batch.length);
  assert.equal(set.all.length, batch.length + 1); // + regulation environment
  const summit = set.institutions.find((p) => p.subject_ref === "60441");
  // 2026-Q1 filing (as-of 2026-03-31) aged to 2026-07-22 → ~113 days on a 365d
  // half-life ⇒ the 0.9 filing confidence decays below 0.9.
  assert.ok(summit.confidence < 0.9 && summit.confidence > 0.6, "live-aged below the 0.9 prior");
  assert.ok(summit.field_freshness.every((f) => f.age_days > 100 && f.age_days < 130));
});

test("institution outcomes flow through per charter/ratio", () => {
  const batch = ingestInstitutionBatch(institutionBatchFixtures(), { observed_at: AS_OF, id_prefix: "coop:batch" });
  const withOutcome = buildLiveProfiles(
    { corpus: ingestRegulatoryCorpus(records, amendments, regCtx), batch },
    {
      as_of: AS_OF, id_prefix: "coop",
      institution_outcomes: { "60441": { net_worth_ratio: [{ agreed: true, weight: 0.5, source_ref: "verif:nw" }] } },
    },
  );
  const summit = withOutcome.institutions.find((p) => p.subject_ref === "60441");
  const adj = summit.outcome_adjustments.find((a) => a.key === "net_worth_ratio");
  assert.equal(adj.outcome_count, 1);
  assert.ok(adj.adjusted_confidence > adj.prior_confidence, "agreement lifts the prior");
  // Other ratios carry no outcome.
  assert.equal(summit.outcome_adjustments.find((a) => a.key === "roa").outcome_count, 0);
});

test("buildLiveProfiles is deterministic", () => {
  const batch = ingestInstitutionBatch(institutionBatchFixtures(), { observed_at: AS_OF, id_prefix: "coop:batch" });
  const corpus = ingestRegulatoryCorpus(records, amendments, regCtx);
  const ctx = { as_of: AS_OF, id_prefix: "coop" };
  assert.deepEqual(buildLiveProfiles({ corpus, batch }, ctx), buildLiveProfiles({ corpus, batch }, ctx));
});
