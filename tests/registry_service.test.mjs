// tests/registry_service.test.mjs — Object Registry service + entity resolution (RFC-2003).
import { test } from "node:test";
import assert from "node:assert/strict";
import { register } from "node:module";
register("../scripts/alias-hook.mjs", import.meta.url);

const { ObjectRegistryService, InMemoryRegistryStore, scoreMatch } =
  await import("@/core/registry/service");

const obj = (over = {}) => ({
  id: "o1", object_class: "entity:coop_markets:credit_union",
  canonical_slug: "summit_ridge_fcu", display_name: "Summit Ridge FCU",
  plane: "shared_market", visibility: "public", status: "active",
  merged_into_id: null, created_at: "2026-07-21T00:00:00.000Z",
  external_ids: [], aliases: [], ...over,
});

function newSvc() {
  let n = 0;
  return new ObjectRegistryService(new InMemoryRegistryStore(), {
    idGen: () => `reg:${n++}`,
    now: "2026-07-21T17:00:00.000Z",
  });
}

test("registry: scoreMatch sums signals and caps at 1.0", () => {
  const a = obj({ id: "a", external_ids: [{ system: "ncua_charter", value: "60441" }], aliases: ["Summit Ridge FCU"] });
  const b = obj({ id: "b", external_ids: [{ system: "ncua_charter", value: "60441" }], aliases: ["Summit Ridge FCU"] });
  const { score, reasons } = scoreMatch(a, b);
  // 0.6 (external) + 0.5 (slug) + 0.25 (alias) = 1.35 -> capped at 1
  assert.equal(score, 1);
  assert.ok(reasons.some((r) => r.startsWith("shared_external_id")));
  assert.ok(reasons.includes("slug_exact"));
  assert.ok(reasons.includes("alias_overlap"));
});

test("registry: individual signal weights", () => {
  const extOnly = scoreMatch(
    obj({ id: "a", canonical_slug: "x", display_name: "AA", external_ids: [{ system: "s", value: "1" }] }),
    obj({ id: "b", canonical_slug: "y", display_name: "BB", external_ids: [{ system: "s", value: "1" }] }),
  );
  assert.ok(Math.abs(extOnly.score - 0.6) < 1e-9);

  const aliasOnly = scoreMatch(
    obj({ id: "a", canonical_slug: "x", display_name: "Acme Bank" }),
    obj({ id: "b", canonical_slug: "y", display_name: "Acme Bank" }),
  );
  assert.ok(Math.abs(aliasOnly.score - 0.25) < 1e-9);
  assert.deepEqual(aliasOnly.reasons, ["alias_overlap"]);
});

test("registry: resolve() only PROPOSES charter-matched duplicates within a class", () => {
  const svc = newSvc();
  const cls = "entity:coop_markets:credit_union";
  const a = svc.register({ object_class: cls, canonical_slug: "summit_ridge_fcu", display_name: "Summit Ridge FCU", plane: "shared_market", visibility: "public", external_ids: [{ system: "ncua_charter", value: "60441" }] });
  const b = svc.register({ object_class: cls, canonical_slug: "summit_ridge_federal_credit_union", display_name: "Summit Ridge Federal Credit Union", plane: "shared_market", visibility: "public", external_ids: [{ system: "ncua_charter", value: "60441" }] });
  svc.register({ object_class: cls, canonical_slug: "harbor_point_cu", display_name: "Harbor Point CU", plane: "shared_market", visibility: "public", external_ids: [{ system: "ncua_charter", value: "12007" }] });

  const cands = svc.resolve();
  assert.equal(cands.length, 1);
  assert.equal(cands[0].status, "proposed");
  assert.equal([cands[0].left_id, cands[0].right_id].sort().join("|"), [a.id, b.id].sort().join("|"));
  assert.ok(cands[0].reasons.some((r) => r.startsWith("shared_external_id")));
  // No object is merged by resolve() — proposals only.
  assert.ok(svc.objects().every((o) => o.status === "active"));
});

test("registry: different object_classes are NEVER proposed even with a shared external id", () => {
  const svc = newSvc();
  svc.register({ object_class: "entity:coop_markets:credit_union", canonical_slug: "x", display_name: "X", plane: "shared_market", visibility: "public", external_ids: [{ system: "s", value: "1" }] });
  svc.register({ object_class: "regulation:ncua:section", canonical_slug: "x", display_name: "X", plane: "shared_market", visibility: "public", external_ids: [{ system: "s", value: "1" }] });
  assert.equal(svc.resolve().length, 0);
});

test("registry: applyMerge marks merged, points at survivor, records append-only lineage", () => {
  const svc = newSvc();
  const cls = "entity:coop_markets:credit_union";
  const a = svc.register({ object_class: cls, canonical_slug: "s", display_name: "A", plane: "shared_market", visibility: "public", external_ids: [{ system: "s", value: "1" }] });
  const b = svc.register({ object_class: cls, canonical_slug: "s2", display_name: "B", plane: "shared_market", visibility: "public", external_ids: [{ system: "s", value: "1" }] });
  svc.applyMerge(a.id, b.id, "user:test", "decision:merge");
  const merged = svc.objects().find((o) => o.id === b.id);
  assert.equal(merged.status, "merged");
  assert.equal(merged.merged_into_id, a.id);
  assert.equal(svc.merges().length, 1);
  assert.equal(svc.merges()[0].by, "user:test");
});

test("registry: applyMerge is idempotent (no double-logging)", () => {
  const svc = newSvc();
  const cls = "entity:coop_markets:credit_union";
  const a = svc.register({ object_class: cls, canonical_slug: "s", display_name: "A", plane: "shared_market", visibility: "public" });
  const b = svc.register({ object_class: cls, canonical_slug: "s2", display_name: "B", plane: "shared_market", visibility: "public" });
  svc.applyMerge(a.id, b.id, "user:test", "decision:merge");
  svc.applyMerge(a.id, b.id, "user:test", "decision:merge");
  assert.equal(svc.merges().length, 1, "re-applying the same merge must not double-log");
});

test("registry: applyMerge rejects merging an object into itself", () => {
  const svc = newSvc();
  const a = svc.register({ object_class: "entity:coop_markets:credit_union", canonical_slug: "s", display_name: "A", plane: "shared_market", visibility: "public" });
  assert.throws(() => svc.applyMerge(a.id, a.id, "user:test"));
});

test("registry: resolve() is deterministic (stable candidate set)", () => {
  const build = () => {
    const svc = newSvc();
    const cls = "entity:coop_markets:credit_union";
    svc.register({ object_class: cls, canonical_slug: "s", display_name: "A", plane: "shared_market", visibility: "public", external_ids: [{ system: "s", value: "1" }] });
    svc.register({ object_class: cls, canonical_slug: "s2", display_name: "B", plane: "shared_market", visibility: "public", external_ids: [{ system: "s", value: "1" }] });
    return svc.resolve();
  };
  assert.deepEqual(build(), build());
});
