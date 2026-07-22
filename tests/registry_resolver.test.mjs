// tests/registry_resolver.test.mjs — MATURED entity resolution (Wave 4):
// blocking keys + deterministic name/alias/charter similarity, PROPOSE-only, and
// the NO-CLOBBER invariant (a human-reviewed candidate is never re-proposed).
import { test } from "node:test";
import assert from "node:assert/strict";
import { register } from "node:module";
register("../scripts/alias-hook.mjs", import.meta.url);

const { proposeMatches, resolveThroughStore, scoreMatchExtended } = await import("@/core/registry/resolver");
const { ObjectRegistryService, InMemoryRegistryStore } = await import("@/core/registry/service");

const cls = "entity:coop_markets:credit_union";
const STOP = ["fcu", "federal", "credit", "union", "cu"];

function newSvc(store) {
  let n = 0;
  return new ObjectRegistryService(store, { idGen: () => `reg:${n++}`, now: "2026-07-22T00:00:00.000Z" });
}
const shared = (svc, slug, name, ext, aliases) =>
  svc.register({ object_class: cls, canonical_slug: slug, display_name: name, plane: "shared_market", visibility: "public", external_ids: ext, aliases });

// ---- shared external id still proposes (base signal preserved) --------------
test("charter (shared external id) proposes a duplicate", () => {
  const svc = newSvc(new InMemoryRegistryStore());
  const a = shared(svc, "summit_ridge_fcu", "Summit Ridge FCU", [{ system: "ncua_charter", value: "60441" }]);
  const b = shared(svc, "summit_ridge_federal_credit_union", "Summit Ridge Federal Credit Union", [{ system: "ncua_charter", value: "60441" }]);
  shared(svc, "harbor_point_cu", "Harbor Point CU", [{ system: "ncua_charter", value: "12007" }]);
  const r = proposeMatches({ objects: svc.objects() });
  assert.equal(r.proposed.length, 1, "exactly one charter-matched pair proposed");
  assert.equal([r.proposed[0].left_id, r.proposed[0].right_id].sort().join("|"), [a.id, b.id].sort().join("|"));
  assert.ok(r.proposed[0].reasons.some((x) => x.startsWith("shared_external_id")));
  assert.equal(r.proposed[0].status, "proposed", "propose-only, never auto-merge");
});

// ---- NEW: name/alias similarity proposes a CHARTER-LESS duplicate -----------
test("name/alias token similarity proposes a duplicate with NO shared external id", () => {
  const svc = newSvc(new InMemoryRegistryStore());
  // No external ids, different slugs, no full-string alias overlap — only the
  // normalized identifying tokens {summit, ridge} match after stopword removal.
  const a = shared(svc, "summit_ridge_fcu", "Summit Ridge FCU", undefined, undefined);
  const b = shared(svc, "summit_ridge_federal_credit_union", "Summit Ridge Federal Credit Union", undefined, undefined);
  const none = proposeMatches({ objects: svc.objects() }); // no stopwords -> weak Jaccard, no proposal
  assert.equal(none.proposed.length, 0, "without the designator stopwords, name tokens are too weak to propose");
  const r = proposeMatches({ objects: svc.objects(), opts: { stopwords: STOP } });
  assert.equal(r.proposed.length, 1, "with designator stopwords, the identifying tokens match and a duplicate is proposed");
  assert.ok(r.proposed[0].reasons.some((x) => x.startsWith("name_similarity:")), "the proposal cites the name-similarity signal");
  assert.equal([r.proposed[0].left_id, r.proposed[0].right_id].sort().join("|"), [a.id, b.id].sort().join("|"));
});

// ---- different object_class is never paired ---------------------------------
test("blocking never pairs across object_class", () => {
  let n = 0;
  const svc = new ObjectRegistryService(new InMemoryRegistryStore(), { idGen: () => `reg:${n++}`, now: "t" });
  svc.register({ object_class: "entity:coop_markets:credit_union", canonical_slug: "s", display_name: "Acme", plane: "shared_market", visibility: "public", external_ids: [{ system: "x", value: "1" }] });
  svc.register({ object_class: "entity:coop_markets:vendor", canonical_slug: "s", display_name: "Acme", plane: "shared_market", visibility: "public", external_ids: [{ system: "x", value: "1" }] });
  assert.equal(proposeMatches({ objects: svc.objects() }).proposed.length, 0, "same slug + ext id but different class -> not proposed");
});

// ---- NO-CLOBBER: a reviewed candidate is never re-proposed -------------------
test("NO-CLOBBER: a human-rejected candidate is not re-proposed", () => {
  const svc = newSvc(new InMemoryRegistryStore());
  const a = shared(svc, "s", "Alpha One", [{ system: "x", value: "1" }]);
  const b = shared(svc, "s2", "Alpha One", [{ system: "x", value: "1" }]);
  const first = proposeMatches({ objects: svc.objects() });
  assert.equal(first.proposed.length, 1, "first pass proposes the pair");
  // A human reviews it and REJECTS it (not a duplicate). Feed that back as existing.
  const reviewed = { ...first.proposed[0], status: "rejected" };
  const second = proposeMatches({ objects: svc.objects(), existing: [reviewed] });
  assert.equal(second.proposed.length, 0, "a rejected pair must NOT be re-proposed");
  assert.equal(second.skipped_reviewed.length, 1, "the rejected pair is reported as skipped-reviewed");
  // A confirmed pair is likewise sticky.
  const confirmed = { ...first.proposed[0], status: "confirmed" };
  assert.equal(proposeMatches({ objects: svc.objects(), existing: [confirmed] }).proposed.length, 0, "a confirmed pair is also sticky");
});

test("resolveThroughStore persists new proposals but leaves a reviewed candidate untouched", () => {
  const store = new InMemoryRegistryStore();
  const svc = newSvc(store);
  shared(svc, "s", "Alpha One", [{ system: "x", value: "1" }]);
  shared(svc, "s2", "Alpha One", [{ system: "x", value: "1" }]);
  const first = resolveThroughStore(store);
  assert.equal(first.proposed.length, 1);
  assert.equal(store.candidates().length, 1);
  // Human rejects it in the store, then a re-run must NOT flip it back to proposed.
  const c = store.candidates()[0];
  store.putCandidate({ ...c, status: "rejected" });
  const second = resolveThroughStore(store);
  assert.equal(second.proposed.length, 0, "re-run proposes nothing new");
  assert.equal(store.candidates()[0].status, "rejected", "the reviewed candidate stays rejected (no clobber)");
});

// ---- a merged object never seeds a new pair ---------------------------------
test("a merged object is skipped (already resolved)", () => {
  const store = new InMemoryRegistryStore();
  const svc = newSvc(store);
  const a = shared(svc, "s", "Alpha One", [{ system: "x", value: "1" }]);
  const b = shared(svc, "s2", "Alpha One", [{ system: "x", value: "1" }]);
  svc.applyMerge(a.id, b.id, "user:test", "decision:merge");
  const r = proposeMatches({ objects: svc.objects() });
  assert.equal(r.proposed.length, 0, "the merged pair is not re-proposed (b is inactive)");
});

// ---- determinism ------------------------------------------------------------
test("proposeMatches is deterministic (byte-identical over two runs)", () => {
  const svc = newSvc(new InMemoryRegistryStore());
  shared(svc, "s", "Alpha One", [{ system: "x", value: "1" }]);
  shared(svc, "s2", "Alpha Two", [{ system: "x", value: "1" }]);
  shared(svc, "s3", "Beta", [{ system: "y", value: "9" }]);
  const one = JSON.stringify(proposeMatches({ objects: svc.objects(), opts: { stopwords: STOP } }));
  const two = JSON.stringify(proposeMatches({ objects: svc.objects(), opts: { stopwords: STOP } }));
  assert.equal(one, two);
});

// ---- the minimum-Jaccard gate has teeth -------------------------------------
test("name-similarity fires ONLY above the min-Jaccard gate", () => {
  const svc = newSvc(new InMemoryRegistryStore());
  // Share exactly one identifying token out of many -> Jaccard well below 0.5.
  const a = shared(svc, "alpha_holdings_group", "Alpha Holdings Group Trust", undefined, undefined);
  const b = shared(svc, "alpha_beacon_partners_llc", "Alpha Beacon Partners", undefined, undefined);
  const s = scoreMatchExtended(a, b, { stopwords: STOP });
  assert.ok(!s.reasons.some((r) => r.startsWith("name_similarity:")), "a weak token overlap (below min Jaccard) must NOT contribute a name-similarity signal");
  // A strong overlap DOES fire (guards against the gate being always-off).
  const c = shared(svc, "alpha_one", "Alpha One", undefined, undefined);
  const d = shared(svc, "alpha_one_holdings", "Alpha One", undefined, undefined);
  assert.ok(scoreMatchExtended(c, d, { stopwords: STOP }).reasons.some((r) => r.startsWith("name_similarity:")), "a strong token overlap DOES fire the signal");
});

// ---- scoreMatchExtended composes the base + name signal ---------------------
test("scoreMatchExtended >= base scoreMatch and caps at 1.0", async () => {
  const { scoreMatch } = await import("@/core/registry/service");
  const svc = newSvc(new InMemoryRegistryStore());
  const a = shared(svc, "summit_ridge_fcu", "Summit Ridge FCU", [{ system: "ncua_charter", value: "60441" }], ["Summit Ridge FCU"]);
  const b = shared(svc, "summit_ridge_fcu", "Summit Ridge FCU", [{ system: "ncua_charter", value: "60441" }], ["Summit Ridge FCU"]);
  const base = scoreMatch(a, b).score;
  const ext = scoreMatchExtended(a, b, { stopwords: STOP }).score;
  assert.ok(ext >= base, "extended score never below the base");
  assert.ok(ext <= 1, "score capped at 1.0");
});
