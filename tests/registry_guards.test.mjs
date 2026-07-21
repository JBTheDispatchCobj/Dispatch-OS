// tests/registry_guards.test.mjs — Wave 4 registry hardening (DEBUG_LOG burndown):
// non-identifying external ids never propose a duplicate; the append-only merge
// lineage stays consistent (transitive survivor + contradictory-re-merge guard).
import { test } from "node:test";
import assert from "node:assert/strict";
import { register } from "node:module";
register("../scripts/alias-hook.mjs", import.meta.url);

const { ObjectRegistryService, InMemoryRegistryStore, scoreMatch } = await import(
  "@/core/registry/service"
);

function svc() {
  let n = 0;
  return new ObjectRegistryService(new InMemoryRegistryStore(), {
    idGen: () => `reg:obj:${n++}`,
    now: "2026-07-21T17:00:00.000Z",
  });
}
const cls = "entity:coop_markets:credit_union";
function reg(s, slug, name, external_ids, aliases) {
  return s.register({
    object_class: cls,
    canonical_slug: slug,
    display_name: name,
    plane: "shared_market",
    visibility: "public",
    external_ids,
    aliases: aliases ?? [name],
  });
}

test("registry: a shared NON-identifying external id does NOT propose a duplicate", () => {
  const s = svc();
  // Two different CUs that merely share {system:"state", value:"CA"} — not an identity.
  reg(s, "alpha_fcu", "Alpha FCU", [{ system: "state", value: "CA", is_identifier: false }]);
  reg(s, "beta_fcu", "Beta FCU", [{ system: "state", value: "CA", is_identifier: false }]);
  const cands = s.resolve();
  assert.equal(cands.length, 0, "a non-identifying shared attribute must not propose a match");
});

test("registry: an identifying shared external id STILL proposes (default is_identifier=true)", () => {
  const s = svc();
  const a = reg(s, "summit_ridge_fcu", "Summit Ridge FCU", [{ system: "ncua_charter", value: "60441" }]);
  const b = reg(s, "summit_ridge_federal_credit_union", "Summit Ridge Federal Credit Union", [
    { system: "ncua_charter", value: "60441" },
  ]);
  const cands = s.resolve();
  assert.equal(cands.length, 1);
  assert.ok(cands[0].reasons.some((r) => r.startsWith("shared_external_id")));
  assert.equal([cands[0].left_id, cands[0].right_id].sort().join("|"), [a.id, b.id].sort().join("|"));
});

test("registry: scoreMatch ignores a non-identifying id but counts an identifying one", () => {
  // Distinct slugs/display_names/aliases so ONLY the external-id signal is under test.
  const base = {
    object_class: cls, canonical_slug: "", plane: "shared_market",
    visibility: "public", status: "active", merged_into_id: null, created_at: "t",
  };
  const nonId = scoreMatch(
    { ...base, id: "x", canonical_slug: "alpha", display_name: "Alpha", aliases: [], external_ids: [{ system: "state", value: "CA", is_identifier: false }] },
    { ...base, id: "y", canonical_slug: "beta", display_name: "Beta", aliases: [], external_ids: [{ system: "state", value: "CA", is_identifier: false }] },
  );
  assert.equal(nonId.score, 0, "non-identifying shared id contributes nothing");
  const idMatch = scoreMatch(
    { ...base, id: "x", canonical_slug: "alpha", display_name: "Alpha", aliases: [], external_ids: [{ system: "ncua_charter", value: "1" }] },
    { ...base, id: "y", canonical_slug: "beta", display_name: "Beta", aliases: [], external_ids: [{ system: "ncua_charter", value: "1" }] },
  );
  assert.ok(idMatch.reasons.includes("shared_external_id:ncua_charter"));
  assert.ok(idMatch.score >= 0.6);
});

test("registry: a contradictory re-merge into a different survivor is refused", () => {
  const s = svc();
  const a = reg(s, "a", "A", [{ system: "sys", value: "1" }]);
  const b = reg(s, "b", "B", [{ system: "sys", value: "2" }]);
  const c = reg(s, "c", "C", [{ system: "sys", value: "3" }]);
  s.applyMerge(a.id, b.id, "user:t", "d:1"); // b -> a
  assert.throws(
    () => s.applyMerge(c.id, b.id, "user:t", "d:2"), // b -> c contradicts b -> a
    /already merged into/,
  );
});

test("registry: merging into an already-merged object resolves to the live root (transitive survivor)", () => {
  const s = svc();
  const a = reg(s, "a", "A", [{ system: "sys", value: "1" }]);
  const b = reg(s, "b", "B", [{ system: "sys", value: "2" }]);
  const c = reg(s, "c", "C", [{ system: "sys", value: "3" }]);
  s.applyMerge(a.id, b.id, "user:t", "d:1"); // b -> a (a is the root)
  const rec = s.applyMerge(b.id, c.id, "user:t", "d:2"); // ask to merge c into b; b is merged into a
  assert.equal(rec.surviving_object_id, a.id, "survivor must resolve to the live root a, not the merged b");
  assert.equal(s.objects().find((o) => o.id === c.id).merged_into_id, a.id);
});

test("registry: re-applying the same merge edge is idempotent (append-only, no double-log)", () => {
  const s = svc();
  const a = reg(s, "a", "A", [{ system: "sys", value: "1" }]);
  const b = reg(s, "b", "B", [{ system: "sys", value: "2" }]);
  s.applyMerge(a.id, b.id, "user:t", "d:1");
  s.applyMerge(a.id, b.id, "user:t", "d:1");
  assert.equal(s.merges().length, 1, "the same lineage edge must be recorded once");
});
