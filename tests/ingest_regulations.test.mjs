// tests/ingest_regulations.test.mjs — NCUA regulatory corpus -> bi-temporal truth objects.
import { test } from "node:test";
import assert from "node:assert/strict";
import { register } from "node:module";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
register("../scripts/alias-hook.mjs", import.meta.url);

const { ingestRegulatoryCorpus } = await import("@/cartridges/cooperative_markets/ingest_regulations");

const ISSUE = "2026-07-15";
const ctx = {
  issue_date: ISSUE,
  observed_at: "2026-07-21T17:00:00.000Z",
  source_id: "source:ncua_regulations",
  source_document_id: "sourcedoc:ncua:2026-07-15",
  id_prefix: "ncua:reg",
};

const record = (section, over = {}) => ({
  part: "701", part_title: "Organization and Operations", section,
  title: `Section ${section}`, node_type: "section", cfr_ref: `12 CFR ${section}`,
  body_text: `Body text for ${section}.`, ...over,
});
const amendment = (amendment_type, new_text, over = {}) => ({
  part: "701", section: "701.21", new_title: "Loans", amendment_type,
  effective_on: "2027-01-01", in_force_as_of_base_file: false,
  fr_citation: "91 FR 1234", fr_document_number: "2026-00001",
  fr_rule_title: "Final Rule", fr_publication_date: "2026-06-01",
  fr_url: "https://federalregister.gov/x", amendment_instructions: ["do the thing"],
  new_text, ...over,
});

test("ingest_regulations: in-force sections -> public_fact observations valid at the issue date", () => {
  const corpus = ingestRegulatoryCorpus([record("701.1"), record("701.2")], [], ctx);
  assert.equal(corpus.total_sections, 2);
  assert.equal(corpus.observations.length, 2);
  for (const o of corpus.observations) {
    assert.equal(o.truth_kind, "observation");
    assert.equal(o.tier, "public_fact");
    assert.equal(o.plane, "shared_market");
    assert.equal(o.visibility, "public");
    assert.equal(o.temporal.valid_from, ISSUE);
    assert.equal(o.provenance.provenance_metadata.in_force, true);
  }
});

test("ingest_regulations: pending FULL-TEXT amendment -> a FUTURE-dated observation (bi-temporal)", () => {
  const corpus = ingestRegulatoryCorpus([], [amendment("revised_full", "The new full replacement text.")], ctx);
  assert.equal(corpus.pending_full_text, 1);
  assert.equal(corpus.held_instructions, 0);
  const o = corpus.observations[0];
  assert.equal(o.truth_kind, "observation");
  assert.equal(o.tier, "public_fact");
  assert.equal(o.temporal.valid_from, "2027-01-01");
  assert.ok(o.temporal.valid_from > ISSUE, "future amendment must carry a valid_from AFTER the issue date");
  assert.equal(o.temporal.observed_at, ctx.observed_at); // known now, effective later
  assert.equal(o.metadata.not_yet_in_force, true);
});

test("ingest_regulations: amendatory INSTRUCTION -> a HELD claim (never auto-applied)", () => {
  const corpus = ingestRegulatoryCorpus([], [amendment("amended_instruction", "")], ctx);
  assert.equal(corpus.held_instructions, 1);
  assert.equal(corpus.pending_full_text, 0);
  const c = corpus.claims[0];
  assert.equal(c.truth_kind, "claim");
  assert.equal(c.tier, "public_fact");
  assert.equal(c.provenance.provenance_metadata.held_pending_merge, true);
  assert.equal(c.metadata.held_pending_merge, true);
});

test("ingest_regulations: a mislabeled 'revised' with EMPTY new_text falls back to a held claim", () => {
  const corpus = ingestRegulatoryCorpus([], [amendment("revised_full", "   ")], ctx);
  assert.equal(corpus.pending_full_text, 0);
  assert.equal(corpus.held_instructions, 1);
});

test("ingest_regulations: exactly one truth object per source record; ids are unique", () => {
  const records = [record("701.1"), record("701.2"), record("701.3")];
  const amendments = [amendment("revised_full", "new text"), amendment("removed", "")];
  const corpus = ingestRegulatoryCorpus(records, amendments, ctx);
  assert.equal(
    corpus.observations.length + corpus.claims.length,
    records.length + amendments.length,
  );
  const ids = [...corpus.observations.map((o) => o.id), ...corpus.claims.map((c) => c.id)];
  assert.equal(new Set(ids).size, ids.length, "all derived ids must be unique");
});

test("ingest_regulations: deterministic — same records + ctx yield byte-identical corpus", () => {
  const records = [record("701.1"), record("701.2")];
  const amendments = [amendment("revised_paragraphs", "partial text"), amendment("redesignated", "")];
  assert.equal(
    JSON.stringify(ingestRegulatoryCorpus(records, amendments, ctx)),
    JSON.stringify(ingestRegulatoryCorpus(records, amendments, ctx)),
  );
});

test("ingest_regulations: the REAL staged NCUA corpus reconciles at scale (675 + 10)", () => {
  const root = fileURLToPath(new URL("../", import.meta.url));
  const readJson = (rel) => JSON.parse(fs.readFileSync(root + rel, "utf8"));
  const records = readJson("docs/04_sources/ncua/ncua_regulations_clean.json");
  const amendments = readJson("docs/04_sources/ncua/ncua_regulations_future_amendments.json");
  const corpus = ingestRegulatoryCorpus(records, amendments, ctx);

  assert.equal(records.length, 675);
  assert.equal(amendments.length, 10);
  assert.equal(corpus.total_sections, records.length);
  assert.equal(corpus.pending_full_text + corpus.held_instructions, amendments.length);
  const ids = [...corpus.observations.map((o) => o.id), ...corpus.claims.map((c) => c.id)];
  assert.equal(new Set(ids).size, ids.length, "no id collisions across the full corpus");
  // Every future observation carries a valid_from strictly after the issue date.
  const future = corpus.observations.filter((o) => o.temporal.valid_from !== ISSUE);
  assert.equal(future.length, corpus.pending_full_text);
  assert.ok(future.every((o) => o.temporal.valid_from > ISSUE));
});
