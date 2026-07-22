// tests/fdic_bankfind_connector.test.mjs — a REAL connector (Sprint III Wave 3):
// FDIC BankFind institution records normalize through the runtime, tier public_fact
// FROM THE SOURCE MANIFEST (proven with a DIFFERING source), change-detect
// deterministically, reject malformed records (never a fabricated deletion), and
// surface FDIC-insured banks as financial_institution candidates (NOT credit unions).
import { test } from "node:test";
import assert from "node:assert/strict";
import { register } from "node:module";
register("../scripts/alias-hook.mjs", import.meta.url);

const { parseFdicInstitution, makeFdicBankfindConnector, FDIC_INSTITUTION_OBJECT_CLASS } = await import(
  "@/cartridges/cooperative_markets/connectors/fdic_bankfind_connector"
);
const { runFdicBankfind, fdicBankfindFixtures } = await import("@/cartridges/cooperative_markets/run_fdic_bankfind");
const { stateFromOutput } = await import("@/core/kernel/connector_runtime");
const { recordToObservation } = await import("@/core/kernel/connector_sdk");
const { sourceForConnector } = await import("@/core/registry/connectors");
const { EventBus } = await import("@/core/kernel/event_bus");
const { CostLedger } = await import("@/core/kernel/cost_ledger");

const AS_OF = "2026-07-22T00:00:00.000Z";
const PULLED = "2026-06-30";

// ---- the connector NORMALIZES institution metadata only ----------------------
test("parseFdicInstitution normalizes the record — CERT key, institution entity", () => {
  const raw = fdicBankfindFixtures()[0];
  const rec = parseFdicInstitution(raw);
  assert.equal(rec.external_ref, raw.cert, "the FDIC CERT is the change-detection key");
  assert.equal(rec.subject_ref, `fdic_cert:${raw.cert}`);
  assert.equal(rec.value.name, raw.name, "name carried verbatim");
  assert.equal(rec.value.state, raw.stalp, "state normalized from STALP");
  assert.equal(rec.value.active, true, "ACTIVE=1 normalizes to boolean true");
  assert.equal(rec.entity_candidates[0].object_class, "entity:coop_markets:financial_institution", "FDIC banks surface as financial_institution");
  assert.notEqual(rec.entity_candidates[0].object_class, "entity:coop_markets:credit_union", "an FDIC bank is NEVER mislabeled a credit union");
  assert.equal(FDIC_INSTITUTION_OBJECT_CLASS, "entity:coop_markets:financial_institution", "the exported class constant is the financial_institution key");
  assert.equal(rec.entity_candidates[0].external_ids[0].system, "fdic_cert", "candidate keyed by FDIC CERT");
  assert.equal(rec.valid_from, raw.data_date, "the pull date is the valid-time");
});

// ---- runtime: correlated, public_fact tier FROM THE SOURCE MANIFEST ----------
test("runFdicBankfind tiers institutions public_fact from the source manifest, correlated + costed", async () => {
  const bus = new EventBus();
  const ledger = new CostLedger();
  const r = await runFdicBankfind(fdicBankfindFixtures(), { as_of: AS_OF, bus, ledger });
  assert.equal(r.output.status, "success");
  assert.equal(r.observations.length, 3);
  assert.equal(r.observations[0].tier, "public_fact", "FDIC records are public_fact — tier from the source manifest");
  assert.equal(r.observations[0].plane, "shared_market");
  assert.equal(bus.history({ type: "connector.started" })[0].correlation_id, "corr:connector:fdic_bankfind");
  assert.ok(ledger.byCategory().connector > 0, "a correlated CostEntry is recorded");
});

// ---- TIER FROM SOURCE proven with a DIFFERING source (non-tautological) -------
test("the SAME normalized record tiers differently under a DIFFERING source manifest", () => {
  const rec = parseFdicInstitution(fdicBankfindFixtures()[0]);
  const fdic = sourceForConnector("connector:fdic_bankfind");
  const claimSrc = {
    key: "source:alt", label: "Alt", version: 1, status: "active", authority: "press",
    default_plane: "shared_market", default_visibility: "public", default_tier: "third_party_claim",
  };
  const ctx = { id: "o1", observed_at: AS_OF, asserted_by: "system" };
  const asFact = recordToObservation(rec, fdic, ctx);
  const asClaim = recordToObservation(rec, claimSrc, ctx);
  assert.equal(asFact.tier, "public_fact", "under the FDIC manifest → public_fact");
  assert.equal(asClaim.tier, "third_party_claim", "under a press manifest → third_party_claim (tier is read from the source, not the connector)");
  assert.notEqual(asFact.tier, asClaim.tier, "the connector code is identical — only the source manifest differs");
});

// ---- change detection determinism --------------------------------------------
test("change detection: an updated asset figure updates; the rest unchanged; a rejection is never a deletion", async () => {
  const r = await runFdicBankfind(fdicBankfindFixtures(), { as_of: AS_OF });
  const prior = stateFromOutput(r.output);
  const changed = fdicBankfindFixtures();
  changed[0].asset = 999999; // an updated call figure
  const r2 = await runFdicBankfind(changed, { as_of: AS_OF, prior });
  assert.equal(r2.output.metrics.changes.updated, 1, "the changed institution updates");
  assert.equal(r2.output.metrics.changes.unchanged, 2, "the rest are unchanged");
  assert.equal(r2.output.metrics.changes.deleted, 0, "no fabricated deletion");
  assert.equal(JSON.stringify((await runFdicBankfind(fdicBankfindFixtures(), { as_of: AS_OF })).output), JSON.stringify(r.output), "the run is deterministic");
});

// ---- REAL reject path: a malformed record (blank CERT / name) is rejected -----
test("parseFdicInstitution REJECTS a malformed record (no CERT / no name)", () => {
  assert.throws(() => parseFdicInstitution({ cert: "", name: "X" }), /CERT/, "a blank CERT is rejected (it is the change key)");
  assert.throws(() => parseFdicInstitution({ cert: "57009", name: "" }), /name/, "a blank name is rejected (institution identity)");
  assert.doesNotThrow(() => parseFdicInstitution(fdicBankfindFixtures()[0]));
});

// ---- rejection≠deletion through the REAL connector — with TEETH on the
//      alsoPresentRefs guard: a PREVIOUSLY-SEEN record (valid CERT) that fails
//      validation on a blank name must NOT be fabricated as a deletion. Without the
//      connector's rejection-ref recovery this assertion flips (deleted → 1).
test("a previously-seen record that fails validation is a rejection, NEVER a fabricated deletion (real connector)", async () => {
  const good = fdicBankfindFixtures()[0]; // cert 57001
  const seenButBad = { cert: "57003", name: "", data_date: PULLED }; // VALID key, blank name, WAS seen before
  const prior = new Map([[good.cert, "stale-hash"], ["57003", "prior-hash"]]);
  const r = await runFdicBankfind([good, seenButBad], { as_of: AS_OF, prior });
  assert.equal(r.output.status, "partial", "one good + one rejected → a partial run");
  assert.equal(r.output.quality_report.rejected_records, 1, "the blank-name record is a reported rejection (never a silent drop)");
  assert.equal(r.output.observations.length, 1, "the good record still normalizes");
  assert.equal(r.output.metrics.changes.deleted, 0, "a PREVIOUSLY-SEEN record that fails validation is NEVER fabricated as a deletion");
  assert.equal(r.output.metrics.changes.updated, 1, "the good record's changed hash updates (change detection ran alongside the rejection)");
});
