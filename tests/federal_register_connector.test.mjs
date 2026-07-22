// tests/federal_register_connector.test.mjs — a REAL connector (Sprint III Wave 3):
// Federal Register document headers normalize through the runtime, tier public_fact
// FROM THE SOURCE MANIFEST (proven with a DIFFERING source), change-detect
// deterministically, reject malformed headers (never a fabricated deletion), and
// surface each document as a regulation entity candidate. A connector NORMALIZES a
// rule's header — it never draws a regulatory conclusion (that is a human gate).
import { test } from "node:test";
import assert from "node:assert/strict";
import { register } from "node:module";
register("../scripts/alias-hook.mjs", import.meta.url);

const { parseFederalRegisterDoc, makeFederalRegisterConnector, FEDERAL_REGISTER_OBJECT_CLASS } = await import(
  "@/cartridges/cooperative_markets/connectors/federal_register_connector"
);
const { runFederalRegister, federalRegisterFixtures } = await import("@/cartridges/cooperative_markets/run_federal_register");
const { stateFromOutput } = await import("@/core/kernel/connector_runtime");
const { recordToObservation } = await import("@/core/kernel/connector_sdk");
const { sourceForConnector } = await import("@/core/registry/connectors");
const { EventBus } = await import("@/core/kernel/event_bus");
const { CostLedger } = await import("@/core/kernel/cost_ledger");

const AS_OF = "2026-07-22T00:00:00.000Z";
const PUB = "2026-06-18";

// ---- the connector NORMALIZES document-header metadata only ------------------
test("parseFederalRegisterDoc normalizes the header — document number key, regulation entity", () => {
  const raw = federalRegisterFixtures()[1];
  const rec = parseFederalRegisterDoc(raw);
  assert.equal(rec.external_ref, raw.document_number, "the FR document number is the change-detection key");
  assert.equal(rec.subject_ref, `fedreg:${raw.document_number}`);
  assert.equal(rec.value.title, raw.title, "title carried verbatim");
  assert.deepEqual(rec.value.agencies, raw.agencies, "publishing agencies carried");
  assert.equal(rec.entity_candidates[0].object_class, "entity:coop_markets:regulation", "the document surfaces as a regulation candidate");
  assert.equal(FEDERAL_REGISTER_OBJECT_CLASS, "entity:coop_markets:regulation", "the exported class constant is the regulation key");
  assert.equal(rec.entity_candidates[0].external_ids[0].system, "federal_register_document");
  assert.equal(rec.valid_from, raw.publication_date, "the publication date is the valid-time");
});

// ---- runtime: correlated, public_fact tier FROM THE SOURCE MANIFEST ----------
test("runFederalRegister tiers documents public_fact from the source manifest, correlated + costed", async () => {
  const bus = new EventBus();
  const ledger = new CostLedger();
  const r = await runFederalRegister(federalRegisterFixtures(), { as_of: AS_OF, bus, ledger });
  assert.equal(r.output.status, "success");
  assert.equal(r.observations.length, 3);
  assert.equal(r.observations[0].tier, "public_fact", "FR documents are public_fact — tier from the source manifest");
  assert.equal(r.observations[0].plane, "shared_market");
  assert.equal(bus.history({ type: "connector.started" })[0].correlation_id, "corr:connector:federal_register");
  assert.ok(ledger.byCategory().connector > 0, "a correlated CostEntry is recorded");
});

// ---- TIER FROM SOURCE proven with a DIFFERING source (non-tautological) -------
test("the SAME normalized record tiers differently under a DIFFERING source manifest", () => {
  const rec = parseFederalRegisterDoc(federalRegisterFixtures()[0]);
  const fr = sourceForConnector("connector:federal_register");
  const claimSrc = {
    key: "source:alt", label: "Alt", version: 1, status: "active", authority: "press",
    default_plane: "shared_market", default_visibility: "public", default_tier: "third_party_claim",
  };
  const ctx = { id: "o1", observed_at: AS_OF, asserted_by: "system" };
  const asFact = recordToObservation(rec, fr, ctx);
  const asClaim = recordToObservation(rec, claimSrc, ctx);
  assert.equal(asFact.tier, "public_fact", "under the Federal Register manifest → public_fact");
  assert.equal(asClaim.tier, "third_party_claim", "under a press manifest → third_party_claim (tier read from the source)");
  assert.notEqual(asFact.tier, asClaim.tier, "identical connector code — only the source manifest differs");
});

// ---- change detection determinism --------------------------------------------
test("change detection: an amended document updates; the rest unchanged; a rejection is never a deletion", async () => {
  const r = await runFederalRegister(federalRegisterFixtures(), { as_of: AS_OF });
  const prior = stateFromOutput(r.output);
  const changed = federalRegisterFixtures();
  changed[0].effective_on = "2026-09-01"; // the proposed rule acquires an effective date
  const r2 = await runFederalRegister(changed, { as_of: AS_OF, prior });
  assert.equal(r2.output.metrics.changes.updated, 1, "the amended document updates");
  assert.equal(r2.output.metrics.changes.unchanged, 2, "the rest are unchanged");
  assert.equal(r2.output.metrics.changes.deleted, 0, "no fabricated deletion");
  assert.equal(JSON.stringify((await runFederalRegister(federalRegisterFixtures(), { as_of: AS_OF })).output), JSON.stringify(r.output), "the run is deterministic");
});

// ---- REAL reject path: a malformed header (blank document_number / title) -----
test("parseFederalRegisterDoc REJECTS a malformed header (no document_number / no title)", () => {
  assert.throws(() => parseFederalRegisterDoc({ document_number: "", title: "X", publication_date: PUB }), /document_number/, "a blank document number is rejected (it is the change key)");
  assert.throws(() => parseFederalRegisterDoc({ document_number: "2026-1", title: "", publication_date: PUB }), /title/, "a blank title is rejected (document identity)");
  assert.doesNotThrow(() => parseFederalRegisterDoc(federalRegisterFixtures()[0]));
});

// ---- rejection≠deletion through the REAL connector — with TEETH on the
//      alsoPresentRefs guard: a PREVIOUSLY-SEEN document (valid document number) that
//      fails validation on a blank title must NOT be fabricated as a deletion.
test("a previously-seen document that fails validation is a rejection, NEVER a fabricated deletion (real connector)", async () => {
  const good = federalRegisterFixtures()[0];
  const seenButBad = { document_number: "2026-15002", title: "", publication_date: PUB }; // VALID key, blank title, WAS seen
  const prior = new Map([[good.document_number, "stale-hash"], ["2026-15002", "prior-hash"]]);
  const r = await runFederalRegister([good, seenButBad], { as_of: AS_OF, prior });
  assert.equal(r.output.status, "partial", "one good + one rejected → a partial run");
  assert.equal(r.output.quality_report.rejected_records, 1, "the blank-title document is a reported rejection (never a silent drop)");
  assert.equal(r.output.observations.length, 1, "the good document still normalizes");
  assert.equal(r.output.metrics.changes.deleted, 0, "a PREVIOUSLY-SEEN document that fails validation is NEVER fabricated as a deletion");
  assert.equal(r.output.metrics.changes.updated, 1, "the good document's changed hash updates (change detection ran alongside the rejection)");
});
