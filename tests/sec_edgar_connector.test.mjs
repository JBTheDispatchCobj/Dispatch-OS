// tests/sec_edgar_connector.test.mjs — a THIRD real connector (Sprint III Wave 2):
// SEC EDGAR filing headers normalize through the runtime, tier public_fact FROM THE
// SOURCE MANIFEST (proven with a DIFFERING source), change-detect deterministically;
// plus the config-as-data catalog grew (toward the ~93) and stays a closed graph.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { register } from "node:module";
register("../scripts/alias-hook.mjs", import.meta.url);

const { parseEdgarFiling, makeSecEdgarConnector } = await import(
  "@/cartridges/cooperative_markets/connectors/sec_edgar_connector"
);
const { runSecEdgar, secEdgarFixtures } = await import("@/cartridges/cooperative_markets/run_sec_edgar");
const { stateFromOutput } = await import("@/core/kernel/connector_runtime");
const { recordToObservation } = await import("@/core/kernel/connector_sdk");
const { validateConnectorCatalog, sourceForConnector, connectorSpecs } = await import(
  "@/core/registry/connectors"
);
const { EventBus } = await import("@/core/kernel/event_bus");
const { CostLedger } = await import("@/core/kernel/cost_ledger");

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const AS_OF = "2026-07-22T00:00:00.000Z";
const FILED_TEST = "2026-06-30";

// ---- the connector NORMALIZES filing-header metadata only --------------------
test("parseEdgarFiling normalizes the filing header — accession key, CIK entity", () => {
  const raw = secEdgarFixtures()[0];
  const rec = parseEdgarFiling(raw);
  assert.equal(rec.external_ref, raw.accession_number, "the accession number is the change-detection key");
  assert.equal(rec.subject_ref, `sec_cik:${raw.cik}`);
  assert.equal(rec.value.form_type, raw.form_type, "form type carried verbatim");
  assert.equal(rec.entity_candidates[0].external_ids[0].system, "sec_cik", "filer surfaced as an entity candidate keyed by CIK");
  assert.equal(rec.valid_from, raw.filing_date, "filing date is the valid-time");
});

// ---- runtime: correlated, public_fact tier FROM THE SOURCE MANIFEST ----------
test("runSecEdgar tiers filings public_fact from the source manifest, correlated + costed", async () => {
  const bus = new EventBus();
  const ledger = new CostLedger();
  const r = await runSecEdgar(secEdgarFixtures(), { as_of: AS_OF, bus, ledger });
  assert.equal(r.output.status, "success");
  assert.equal(r.observations.length, 3);
  assert.equal(r.observations[0].tier, "public_fact", "EDGAR headers are public_fact — tier from the source manifest");
  assert.equal(r.observations[0].plane, "shared_market");
  assert.equal(bus.history({ type: "connector.started" })[0].correlation_id, "corr:connector:sec_edgar");
  assert.ok(ledger.byCategory().connector > 0, "a correlated CostEntry is recorded");
});

// ---- TIER FROM SOURCE proven with a DIFFERING source (non-tautological) -------
test("the SAME normalized record tiers differently under a DIFFERING source manifest", () => {
  const rec = parseEdgarFiling(secEdgarFixtures()[0]);
  const edgar = sourceForConnector("connector:sec_edgar");
  const claimSrc = {
    key: "source:alt", label: "Alt", version: 1, status: "active", authority: "press",
    default_plane: "shared_market", default_visibility: "public", default_tier: "third_party_claim",
  };
  const ctx = { id: "o1", observed_at: AS_OF, asserted_by: "system" };
  const asFact = recordToObservation(rec, edgar, ctx);
  const asClaim = recordToObservation(rec, claimSrc, ctx);
  assert.equal(asFact.tier, "public_fact", "under the EDGAR manifest → public_fact");
  assert.equal(asClaim.tier, "third_party_claim", "under a press manifest → third_party_claim (tier is read from the source, not the connector)");
  assert.notEqual(asFact.tier, asClaim.tier, "the connector code is identical — only the source manifest differs");
});

// ---- change detection determinism (a changed form_type updates) --------------
test("change detection: an amended filing updates; the rest unchanged; a rejection is never a deletion", async () => {
  const r = await runSecEdgar(secEdgarFixtures(), { as_of: AS_OF });
  const prior = stateFromOutput(r.output);
  const changed = secEdgarFixtures();
  changed[0].form_type = "D/A"; // amend the first filing's header
  const r2 = await runSecEdgar(changed, { as_of: AS_OF, prior });
  assert.equal(r2.output.metrics.changes.updated, 1, "the amended filing updates");
  assert.equal(r2.output.metrics.changes.unchanged, 2, "the rest are unchanged");
  assert.equal(r2.output.metrics.changes.deleted, 0, "no fabricated deletion");
  // determinism
  assert.equal(JSON.stringify((await runSecEdgar(secEdgarFixtures(), { as_of: AS_OF })).output), JSON.stringify(r.output), "the run is deterministic");
});

// ---- the REAL connector surfaces a duplicate accession as a data-quality signal
test("runSecEdgar surfaces a duplicate accession_number in the quality report (data-quality, not a gate)", async () => {
  // Two filings sharing an accession number — EDGAR's per-filing unique key. The REAL
  // connector (makeSecEdgarConnector → parseEdgarFiling) keys external_ref on the
  // accession, so the runtime's quality report must report the collision (never a
  // silent drop) while the run still succeeds (a report, not a gate).
  const dup = "0001900001-26-000042";
  const filings = [
    { cik: "0001900001", company: "Halcyon Pay Inc", form_type: "D", accession_number: dup, filing_date: FILED_TEST },
    { cik: "0001900001", company: "Halcyon Pay Inc", form_type: "D", accession_number: dup, filing_date: FILED_TEST },
  ];
  const r = await runSecEdgar(filings, { as_of: AS_OF });
  assert.equal(r.output.status, "success", "a duplicate is a data-quality REPORT, not a run failure");
  assert.ok(r.output.quality_report.duplicate_refs.includes(dup), "the duplicate accession is surfaced, never silently dropped");
  // sanity: the two records are both present (normalize-only; dedup/merge is downstream)
  assert.equal(r.output.observations.length, 2, "the connector normalizes both; identity resolution is a downstream concern");
});

// ---- parseEdgarFiling has a REAL reject path: a malformed header (blank accession/CIK)
//      throws, so the REAL connector rejects it rather than emitting a bad/empty record.
test("parseEdgarFiling REJECTS a malformed filing header (no accession / no CIK)", () => {
  assert.throws(() => parseEdgarFiling({ cik: "0001", company: "X", form_type: "D", accession_number: "", filing_date: FILED_TEST }), /accession_number/, "a blank accession is rejected (it is the change key)");
  assert.throws(() => parseEdgarFiling({ cik: "", company: "X", form_type: "D", accession_number: "0001-26-1", filing_date: FILED_TEST }), /CIK/, "a blank CIK is rejected (the filer identity)");
  // a well-formed header never throws
  assert.doesNotThrow(() => parseEdgarFiling(secEdgarFixtures()[0]));
});

// ---- rejection≠deletion through the REAL connector: a malformed filing in the batch is
//      a REJECTION, never a fabricated deletion (load-bearing rule), and the good one
//      still normalizes. Driven entirely through makeSecEdgarConnector/runSecEdgar.
test("a malformed filing in the batch is a rejection, never a fabricated deletion (real connector)", async () => {
  const good = secEdgarFixtures()[0];
  const malformed = { cik: "0009", company: "Malformed Co", form_type: "D", accession_number: "", filing_date: FILED_TEST };
  // Seed prior state with the good ref (a stale hash), so change detection genuinely runs
  // alongside the rejection. The malformed record is rejected — it must NOT fabricate a
  // deletion, and the good filing (present this run) must NOT be deleted.
  const prior = new Map([[good.accession_number, "stale-hash"]]);
  const r = await runSecEdgar([good, malformed], { as_of: AS_OF, prior });
  assert.equal(r.output.status, "partial", "one good + one malformed → a partial run (rejections present)");
  assert.equal(r.output.quality_report.rejected_records, 1, "the malformed filing is a reported rejection (never a silent drop)");
  assert.equal(r.output.observations.length, 1, "the good filing still normalizes");
  assert.equal(r.output.metrics.changes.deleted, 0, "a normalization failure is NEVER fabricated as a deletion");
  assert.equal(r.output.metrics.changes.updated, 1, "the good filing's changed hash updates (proves change detection still ran alongside the rejection)");
});

// ---- rejection≠deletion with TEETH: a PREVIOUSLY-SEEN filing (valid accession)
//      that fails validation on a blank CIK must NOT be fabricated as a deletion.
//      Without the connector's rejection-ref recovery this assertion flips (deleted→1).
test("a previously-seen filing that fails validation is a rejection, NEVER a fabricated deletion (real connector)", async () => {
  const good = secEdgarFixtures()[0];
  const seenButBad = { cik: "", company: "Blank CIK Co", form_type: "D", accession_number: "0009-26-777", filing_date: FILED_TEST }; // VALID accession, blank CIK, WAS seen
  const prior = new Map([[good.accession_number, "stale-hash"], ["0009-26-777", "prior-hash"]]);
  const r = await runSecEdgar([good, seenButBad], { as_of: AS_OF, prior });
  assert.equal(r.output.status, "partial", "one good + one rejected → a partial run");
  assert.equal(r.output.quality_report.rejected_records, 1, "the blank-CIK filing is a reported rejection (never a silent drop)");
  assert.equal(r.output.observations.length, 1, "the good filing still normalizes");
  assert.equal(r.output.metrics.changes.deleted, 0, "a PREVIOUSLY-SEEN filing that fails validation is NEVER fabricated as a deletion");
  assert.equal(r.output.metrics.changes.updated, 1, "the good filing's changed hash updates (change detection ran alongside the rejection)");
});

// ---- the catalog grew toward the ~93 and stays a closed graph -----------------
test("the config-as-data catalog grew (toward ~93) and remains a closed graph", () => {
  const cat = JSON.parse(fs.readFileSync(path.join(root, "core/registry/data/connectors.json"), "utf8"));
  const v = validateConnectorCatalog(cat);
  assert.ok(v.ok, "catalog is a closed graph: " + v.errors.join("; "));
  assert.ok(v.connector_count >= 55, `catalog grew toward the ~93 target (got ${v.connector_count})`);
  assert.equal(v.connector_count, v.active_count, "every shipped connector is active");
  assert.equal(v.source_count, v.connector_count, "one connector per source (RFC-2011 core principle) holds after growth");
  // the SEC EDGAR source resolves and tiers as an official filing (public_fact)
  assert.equal(sourceForConnector("connector:sec_edgar").default_tier, "public_fact");
  // a newly-qualified source resolves cleanly (no unqualified placeholder left dangling)
  assert.ok(connectorSpecs().some((c) => c.key === "connector:fdic_bankfind"), "a newly-added connector is present + active");
});
