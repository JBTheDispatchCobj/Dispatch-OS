// tests/registry_supabase_store.test.mjs — Supabase adapter for the Object Registry
// persistence seam (RFC-2003): pure row mappers + the hybrid store behind the port.
import { test } from "node:test";
import assert from "node:assert/strict";
import { register } from "node:module";
register("../scripts/alias-hook.mjs", import.meta.url);

const {
  SupabaseRegistryStore, registryStore, remapId, idToUuid,
  objectToRow, rowToObject, candidateToRow, rowToCandidate, mergeToRow, rowToMerge,
} = await import("@/core/registry/supabase-store");
const { ObjectRegistryService, InMemoryRegistryStore } = await import("@/core/registry/service");

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function newSvc(store) {
  let n = 0;
  return new ObjectRegistryService(store, { idGen: () => `reg:${n++}`, now: "2026-07-21T17:00:00.000Z" });
}
const cls = "entity:coop_markets:credit_union";

// A tiny in-memory fake of the narrow RegistryTableClient.
function fakeClient(seed = {}) {
  const tables = {
    object_registry: (seed.object_registry ?? []).slice(),
    object_match_candidates: (seed.object_match_candidates ?? []).slice(),
    object_merges: (seed.object_merges ?? []).slice(),
  };
  const calls = [];
  return {
    tables,
    calls,
    async upsert(table, rows, onConflict) {
      calls.push({ table, count: rows.length, onConflict });
      const t = tables[table];
      for (const row of rows) {
        const i = t.findIndex((r) => r.id === row.id);
        if (i >= 0) t[i] = row; else t.push(row);
      }
      return { error: null };
    },
    async selectAll(table) {
      return { data: tables[table].slice(), error: null };
    },
  };
}

// ---- id bridge --------------------------------------------------------------
test("remapId: uuid passthrough, deterministic hash otherwise, null-safe", () => {
  const u = "11111111-1111-4111-8111-111111111111";
  assert.equal(remapId(u), u, "a real uuid passes through untouched");
  assert.ok(UUID_RE.test(remapId("reg:0")), "a short id maps to a uuid");
  assert.equal(remapId("reg:0"), idToUuid("reg:0"), "deterministic");
  assert.equal(remapId(null), null);
  assert.equal(remapId(undefined), null);
  assert.equal(remapId(""), null);
});

// ---- pure mappers round-trip ------------------------------------------------
test("objectToRow -> rowToObject round-trips a CanonicalObject", () => {
  const svc = newSvc(new InMemoryRegistryStore());
  const o = svc.register({
    object_class: cls, canonical_slug: "summit_ridge_fcu", display_name: "Summit Ridge FCU",
    plane: "shared_market", visibility: "public",
    external_ids: [{ system: "ncua_charter", value: "60441" }], aliases: ["Summit Ridge FCU"],
  });
  const back = rowToObject(objectToRow(o));
  assert.deepEqual(back, o, "identity index must round-trip losslessly (ext ids/aliases carried in metadata)");
});

test("objectToRow -> rowToObject preserves MERGED state (no resurrection on hydrate)", () => {
  // Teeth: a merged object must round-trip as merged, pointing at its survivor —
  // dropping status/merged_into_id would silently resurrect it as active and it
  // would be re-proposed as a duplicate, losing the append-only lineage.
  const store = new SupabaseRegistryStore();
  const svc = newSvc(store);
  const a = svc.register({ object_class: cls, canonical_slug: "s", display_name: "A", plane: "shared_market", visibility: "public" });
  const b = svc.register({ object_class: cls, canonical_slug: "s2", display_name: "B", plane: "shared_market", visibility: "public" });
  svc.applyMerge(a.id, b.id, "user:test", "decision:merge");
  const bObj = svc.objects().find((o) => o.id === b.id);
  const row = objectToRow(bObj);
  assert.equal(row.status, "merged", "a merged object must persist status=merged");
  const back = rowToObject(row);
  assert.equal(back.status, "merged");
  assert.equal(back.merged_into_id, a.id, "merged object must still point at its survivor after round-trip");
  assert.deepEqual(back, bObj);
});

test("objectToRow -> rowToObject round-trips a non-uuid object_ref", () => {
  const svc = newSvc(new InMemoryRegistryStore());
  const o = svc.register({ object_class: cls, canonical_slug: "s", display_name: "A", plane: "private_terminal", visibility: "tenant_private", storage: "typed_table", source_table: "entities", object_ref: "entity-42" });
  const back = rowToObject(objectToRow(o));
  assert.equal(back.object_ref, "entity-42", "a non-uuid object_ref must survive the round-trip (carried in metadata)");
  assert.deepEqual(back, o);
});

test("hydrate imposes a stable order regardless of DB row order (deterministic resolve)", async () => {
  // Flush two objects, then hydrate a fresh store from the SAME rows in REVERSED
  // order — the resolved snapshot + candidate set must be byte-identical.
  const s1 = new SupabaseRegistryStore();
  const svc1 = newSvc(s1);
  svc1.register({ object_class: cls, canonical_slug: "s", display_name: "A", plane: "shared_market", visibility: "public", external_ids: [{ system: "s", value: "1" }] });
  svc1.register({ object_class: cls, canonical_slug: "s2", display_name: "B", plane: "shared_market", visibility: "public", external_ids: [{ system: "s", value: "1" }] });
  const client = fakeClient();
  await s1.flush(client);

  const rows = client.tables.object_registry;
  const forward = new SupabaseRegistryStore();
  forward.hydrate({ objects: rows.slice() });
  const reversed = new SupabaseRegistryStore();
  reversed.hydrate({ objects: rows.slice().reverse() });
  assert.deepEqual(reversed.all(), forward.all(), "hydrate order must not depend on DB row order");
});

test("rowToObject rejects an out-of-scope status", () => {
  const svc = newSvc(new InMemoryRegistryStore());
  const o = svc.register({ object_class: cls, canonical_slug: "x", display_name: "X", plane: "shared_market", visibility: "public" });
  const row = objectToRow(o);
  row.status = "archived";
  assert.throws(() => rowToObject(row), /unsupported status/);
});

test("candidateToRow maps proposed<->pending and round-trips", () => {
  const c = { left_id: "reg:1", right_id: "reg:0", score: 0.6, reasons: ["shared_external_id:ncua_charter"], status: "proposed" };
  const row = candidateToRow(c);
  assert.equal(row.status, "pending", "service 'proposed' persists as DB 'pending'");
  assert.ok(UUID_RE.test(row.object_id) && UUID_RE.test(row.candidate_object_id));
  const back = rowToCandidate(row);
  assert.deepEqual(back, c);
});

test("mergeToRow -> rowToMerge round-trips the append-only lineage", () => {
  const mr = { surviving_object_id: "reg:0", merged_object_id: "reg:1", by: "user:test", decision_ref: "decision:merge", created_at: "2026-07-21T17:00:00.000Z" };
  const back = rowToMerge(mergeToRow(mr));
  assert.deepEqual(back, mr);
  assert.equal(mergeToRow(mr).operation, "merge");
});

// ---- the store behaves as the port + queues writes --------------------------
test("SupabaseRegistryStore drives ObjectRegistryService identically to in-memory", () => {
  const run = (store) => {
    const svc = newSvc(store);
    const a = svc.register({ object_class: cls, canonical_slug: "s", display_name: "A", plane: "shared_market", visibility: "public", external_ids: [{ system: "s", value: "1" }] });
    const b = svc.register({ object_class: cls, canonical_slug: "s2", display_name: "B", plane: "shared_market", visibility: "public", external_ids: [{ system: "s", value: "1" }] });
    const cands = svc.resolve();
    svc.applyMerge(a.id, b.id, "user:test", "decision:merge");
    return { objects: svc.objects(), cands, merges: svc.merges() };
  };
  const inMem = run(new InMemoryRegistryStore());
  const supa = run(new SupabaseRegistryStore());
  assert.deepEqual(supa, inMem, "the Supabase-backed snapshot must be byte-identical to in-memory");
});

test("writes are queued and flush persists exactly the pending rows, then clears", async () => {
  const store = new SupabaseRegistryStore();
  const svc = newSvc(store);
  const a = svc.register({ object_class: cls, canonical_slug: "s", display_name: "A", plane: "shared_market", visibility: "public", external_ids: [{ system: "s", value: "1" }] });
  const b = svc.register({ object_class: cls, canonical_slug: "s2", display_name: "B", plane: "shared_market", visibility: "public", external_ids: [{ system: "s", value: "1" }] });
  svc.resolve();
  svc.applyMerge(a.id, b.id, "user:test", "decision:merge");

  const pending = store.pending();
  assert.equal(pending.objects.length, 2, "both registered objects queued (b re-put on merge upserts)");
  assert.equal(pending.candidates.length, 1);
  assert.equal(pending.merges.length, 1);

  const client = fakeClient();
  await store.flush(client);
  assert.equal(client.tables.object_registry.length, 2);
  assert.equal(client.tables.object_match_candidates.length, 1);
  assert.equal(client.tables.object_merges.length, 1);
  // queue cleared after flush
  const after = store.pending();
  assert.equal(after.objects.length + after.candidates.length + after.merges.length, 0, "flush must clear the queue");
});

test("hydrateFromSupabase reloads a snapshot that resolves the same candidate", async () => {
  // Seed a client from a first store's flush, then hydrate a fresh store from it.
  const s1 = new SupabaseRegistryStore();
  const svc1 = newSvc(s1);
  const a = svc1.register({ object_class: cls, canonical_slug: "s", display_name: "A", plane: "shared_market", visibility: "public", external_ids: [{ system: "s", value: "1" }] });
  const b = svc1.register({ object_class: cls, canonical_slug: "s2", display_name: "B", plane: "shared_market", visibility: "public", external_ids: [{ system: "s", value: "1" }] });
  const client = fakeClient();
  await s1.flush(client);

  const s2 = new SupabaseRegistryStore();
  await s2.hydrateFromSupabase(client);
  assert.equal(s2.all().length, 2, "hydrate loads the persisted objects");
  // A fresh service over the hydrated store proposes the duplicate from persisted state.
  const svc2 = new ObjectRegistryService(s2, { idGen: () => "reg:new", now: "2026-07-21T17:00:00.000Z" });
  const cands = svc2.resolve();
  assert.equal(cands.length, 1, "resolution works over a hydrated snapshot");
  assert.equal([cands[0].left_id, cands[0].right_id].sort().join("|"), [a.id, b.id].sort().join("|"));
});

test("registryStore() defaults to in-memory; a client yields a hydrated Supabase store", async () => {
  const def = await registryStore();
  assert.ok(def instanceof InMemoryRegistryStore, "no client -> in-memory (gate stays green without creds)");
  const client = fakeClient();
  const live = await registryStore({ supabase: client });
  assert.ok(live instanceof SupabaseRegistryStore);
});
