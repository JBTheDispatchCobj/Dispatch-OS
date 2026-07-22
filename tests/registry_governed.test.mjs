// tests/registry_governed.test.mjs — GOVERNED Object Registry (Wave 4):
// authorize-FIRST register/merge through a kernel contract, shared-market merge is
// SERVICE-ROLE-ONLY, envelope-correlated KernelEvent + CostEntry, and the
// SERIALIZED write-chain (a merge never races a register).
import { test } from "node:test";
import assert from "node:assert/strict";
import { register } from "node:module";
register("../scripts/alias-hook.mjs", import.meta.url);

const id = await import("@/core/kernel/identity");
const { makeEnvelope } = await import("@/core/kernel/envelope");
const { EventBus } = await import("@/core/kernel/event_bus");
const { CostLedger } = await import("@/core/kernel/cost_ledger");
const { ObjectRegistryService, InMemoryRegistryStore } = await import("@/core/registry/service");
const { SupabaseRegistryStore } = await import("@/core/registry/supabase-store");
const { GovernedObjectRegistry } = await import("@/core/registry/governed_registry");

const cls = "entity:coop_markets:credit_union";
const mem = (ws, role) => ({ workspace_id: ws, organization_id: "org", role });

function fakeClient() {
  const tables = { object_registry: [], object_match_candidates: [], object_merges: [] };
  const calls = [];
  return {
    tables, calls,
    async upsert(table, rows, onConflict) {
      calls.push({ table, count: rows.length });
      const t = tables[table];
      for (const row of rows) {
        const i = t.findIndex((r) => r.id === row.id);
        if (i >= 0) t[i] = row; else t.push(row);
      }
      return { error: null };
    },
    async selectAll(table) { return { data: tables[table].slice(), error: null }; },
  };
}

function newGov(store, extra = {}) {
  let n = 0;
  const service = new ObjectRegistryService(store, { idGen: () => `reg:${n++}`, now: "2026-07-22T00:00:00.000Z" });
  let e = 0;
  return new GovernedObjectRegistry({ service, store, idGen: () => `ev:${e++}`, ...extra });
}
const env = (principal, cid) =>
  makeEnvelope({ principal, correlation_id: cid ?? "corr:reg", plane: "shared_market", occurred_at: "2026-07-22T00:00:00.000Z", request_id: "req:1" });

const sharedInput = (slug, name, charter) => ({
  object_class: cls, canonical_slug: slug, display_name: name, plane: "shared_market", visibility: "public",
  external_ids: [{ system: "ncua_charter", value: charter }], aliases: [name],
});

// ---- authorize-FIRST: a non-service principal cannot write a shared-market row
test("shared-market register is service-role-only (a user is refused; nothing is written)", () => {
  const store = new InMemoryRegistryStore();
  const gov = newGov(store);
  const user = id.userPrincipal("u1", [mem("ws1", "owner")]);
  const r = gov.registerThrough(env(user), sharedInput("s", "Alpha", "1"));
  assert.equal(r.ok, false, "an authenticated user may NOT register a shared-market object (no tenant)");
  assert.equal(r.refusal.reason, "no_tenant");
  assert.equal(store.all().length, 0, "authorize-FIRST: nothing registered on refusal");
});

test("the platform service role registers a shared-market object", () => {
  const store = new InMemoryRegistryStore();
  const gov = newGov(store);
  const r = gov.registerThrough(env(id.systemPrincipal()), sharedInput("s", "Alpha", "1"));
  assert.equal(r.ok, true);
  assert.equal(r.value.object_class, cls);
  assert.equal(store.all().length, 1);
});

test("a tenant-scoped register is allowed for an owner (generic write path)", () => {
  const store = new InMemoryRegistryStore();
  const gov = newGov(store);
  const owner = id.userPrincipal("u1", [mem("ws1", "owner")]);
  const input = { object_class: cls, canonical_slug: "s", display_name: "Priv", plane: "private_terminal", visibility: "tenant_private" };
  const r = gov.registerThrough(env(owner), input, { workspace_id: "ws1" });
  assert.equal(r.ok, true, "owner/admin/operator may register a tenant-scoped object");
});

// ---- MERGE authorize-FIRST + service-only + correlation ---------------------
test("shared-market merge is service-role-only, authorize-FIRST, and correlated", () => {
  const store = new InMemoryRegistryStore();
  const bus = new EventBus();
  const ledger = new CostLedger();
  const gov = newGov(store, { bus, ledger });
  const svc = env(id.systemPrincipal());
  const a = gov.registerThrough(svc, sharedInput("s", "Alpha", "1")).value;
  const b = gov.registerThrough(svc, sharedInput("s2", "Alpha", "1")).value;

  // A non-service user is REFUSED the merge and the engine never runs.
  const user = id.userPrincipal("u1", [mem("ws1", "owner")]);
  const denied = gov.mergeThrough(env(user, "corr:merge"), a.id, b.id, "decision:x");
  assert.equal(denied.ok, false, "no authenticated user may govern a shared-market merge");
  assert.equal(denied.refusal.reason, "no_tenant");
  assert.equal(gov.merges().length, 0, "authorize-FIRST: no merge recorded on refusal");
  assert.equal(gov.objects().find((o) => o.id === b.id).status, "active", "b stays active — the merge never ran");

  // The service role performs it; the event + cost correlate to the envelope.
  const ok = gov.mergeThrough(env(svc.principal, "corr:merge"), a.id, b.id, "decision:x");
  assert.equal(ok.ok, true);
  assert.equal(gov.objects().find((o) => o.id === b.id).status, "merged");
  const events = bus.history({ type: "registry.objects_merged" });
  assert.equal(events.length, 1);
  assert.equal(events[0].correlation_id, "corr:merge", "the merge event correlates to the request envelope");
  assert.equal(events[0].actor, "system");
  const costs = ledger.entries({ correlation_id: "corr:merge" });
  assert.ok(costs.length >= 1 && costs.every((c) => c.correlation_id === "corr:merge"), "cost entries correlate to the envelope");
});

// ---- the register path also emits a correlated event + cost -----------------
test("registerThrough emits a correlated registry.object_registered event + CostEntry", () => {
  const store = new InMemoryRegistryStore();
  const bus = new EventBus();
  const ledger = new CostLedger();
  const gov = newGov(store, { bus, ledger });
  gov.registerThrough(env(id.systemPrincipal(), "corr:reg"), sharedInput("s", "Alpha", "1"));
  const evts = bus.history({ type: "registry.object_registered" });
  assert.equal(evts.length, 1);
  assert.equal(evts[0].correlation_id, "corr:reg", "the register event correlates to the envelope");
  assert.equal(evts[0].actor, "system");
  const costs = ledger.entries({ correlation_id: "corr:reg" });
  assert.equal(costs.length, 1);
  // teeth on the cost SHAPE, not just its correlation id.
  assert.equal(costs[0].category, "tool");
  assert.equal(costs[0].usd, 0, "a registry write records no external spend");
  assert.equal(costs[0].label, "registry.object_registered");
  assert.equal(costs[0].actor, "system");
});

// ---- SERIALIZED write-chain: flushes never overlap; merge after the objects --
test("serialized write-chain: flushes never overlap and a merge persists after the objects", async () => {
  const store = new SupabaseRegistryStore();
  // A client whose upsert AWAITS a real microtask + tracks max concurrency, so a
  // non-serialized (Promise.all) implementation would show overlap > 1.
  let inFlight = 0, maxInFlight = 0;
  const calls = [];
  const client = {
    tables: { object_registry: [], object_match_candidates: [], object_merges: [] },
    async upsert(table, rows) {
      inFlight++; maxInFlight = Math.max(maxInFlight, inFlight);
      calls.push(table);
      await Promise.resolve(); await Promise.resolve();
      const t = this.tables[table];
      for (const row of rows) { const i = t.findIndex((r) => r.id === row.id); if (i >= 0) t[i] = row; else t.push(row); }
      inFlight--;
      return { error: null };
    },
    async selectAll(table) { return { data: this.tables[table].slice(), error: null }; },
  };
  const gov = newGov(store, { client });
  const svc = env(id.systemPrincipal());
  const a = gov.registerThrough(svc, sharedInput("s", "Alpha", "1")).value;
  const b = gov.registerThrough(svc, sharedInput("s2", "Alpha", "1")).value;
  gov.mergeThrough(svc, a.id, b.id, "decision:x");

  await gov.drain(); // await the serialized durable flush

  assert.equal(maxInFlight, 1, "the write-chain serializes: never two flushes in flight at once (no race)");
  assert.equal(client.tables.object_registry.length, 2, "both objects persisted");
  assert.equal(client.tables.object_merges.length, 1, "the merge persisted");
  const firstMergeCall = calls.indexOf("object_merges");
  const firstObjCall = calls.indexOf("object_registry");
  assert.ok(firstObjCall >= 0 && firstMergeCall > firstObjCall, "a merge flush never precedes the register flush (serialized order)");
});

test("drain rejects when a queued flush fails (the durable error is surfaced)", async () => {
  const store = new SupabaseRegistryStore();
  const client = {
    async upsert() { return { error: "db down" }; },
    async selectAll() { return { data: [], error: null }; },
  };
  const gov = newGov(store, { client });
  gov.registerThrough(env(id.systemPrincipal()), sharedInput("s", "Alpha", "1"));
  await assert.rejects(() => gov.drain(), /registry flush objects failed/);
});

test("no client -> in-memory default: drain resolves and nothing is dialed", async () => {
  const store = new InMemoryRegistryStore();
  const gov = newGov(store);
  gov.registerThrough(env(id.systemPrincipal()), sharedInput("s", "Alpha", "1"));
  await gov.drain(); // resolves immediately, no throw
  assert.equal(store.all().length, 1);
});

// ---- determinism ------------------------------------------------------------
test("governed registration is deterministic (byte-identical objects over two runs)", () => {
  const run = () => {
    const store = new InMemoryRegistryStore();
    const gov = newGov(store);
    gov.registerThrough(env(id.systemPrincipal()), sharedInput("s", "Alpha", "1"));
    gov.registerThrough(env(id.systemPrincipal()), sharedInput("s2", "Beta", "2"));
    return JSON.stringify(gov.objects());
  };
  assert.equal(run(), run());
});
