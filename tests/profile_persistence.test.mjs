// tests/profile_persistence.test.mjs — Profile PERSISTENCE (Wave 4, RFC-3012):
// a LiveAssembledProfile persists + hydrates BYTE-IDENTICALLY through the seam
// (in-memory default; Supabase-backed when a client is configured), keeping its
// confidence / freshness / lineage / outcome-audit intact across a process
// boundary — and PLANE-AWARE (a public shared-market profile and a private tenant
// profile are stored distinctly, never conflated onto the table defaults).
import { test } from "node:test";
import assert from "node:assert/strict";
import { register } from "node:module";
register("../scripts/alias-hook.mjs", import.meta.url);

const { assembleLiveProfile } = await import("@/core/profile/assemble_live");
const {
  InMemoryProfileStore, SupabaseProfileStore, profileStore,
  profileToRow, rowToProfile,
} = await import("@/core/profile/persistence");

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function liveProfile(id = "profile:cu:60441") {
  return assembleLiveProfile({
    id,
    subject_ref: "ncua_charter:60441",
    subject_type: "credit_union",
    display_name: "Summit Ridge FCU",
    as_of: "2026-07-22T00:00:00.000Z",
    fields: [
      {
        key: "net_worth_ratio", label: "Net Worth Ratio", value: 11.2, unit: "%",
        source_ref: "fact:5300:60441:nwr", tier: "deterministic_calculation", confidence: 0.9,
        observed_at: "2026-03-31T00:00:00.000Z",
        outcomes: [{ agreed: true, source_ref: "verification:exam:2026Q2" }],
      },
      {
        key: "roa", label: "Return on Assets", value: 0.85, unit: "%",
        source_ref: "fact:5300:60441:roa", tier: "deterministic_calculation", confidence: 0.8,
        observed_at: "2026-03-31T00:00:00.000Z",
      },
    ],
  });
}
// A shared-market public profile (the reg-env / public-institution case).
const publicScope = { plane: "shared_market", visibility: "public", workspace_id: null, organization_id: null };
// A private tenant profile.
const tenantScope = { plane: "private_terminal", visibility: "tenant_private", workspace_id: "ws1", organization_id: "org1" };
const persisted = (id, scope = publicScope) => ({ profile: liveProfile(id), scope });

function fakeClient() {
  const tables = { profile_snapshots: [] };
  return {
    tables,
    async upsert(table, rows) {
      const t = tables[table];
      for (const row of rows) { const i = t.findIndex((r) => r.id === row.id); if (i >= 0) t[i] = row; else t.push(row); }
      return { error: null };
    },
    async selectAll(table) { return { data: tables[table].slice(), error: null }; },
  };
}

// ---- pure mappers round-trip byte-identically + keep the plane ---------------
test("profileToRow -> rowToProfile round-trips a profile byte-identically + preserves scope", () => {
  const pp = persisted("profile:cu:60441", publicScope);
  const row = profileToRow(pp);
  assert.ok(UUID_RE.test(row.id), "id is remapped to a deterministic uuid");
  assert.equal(typeof row.snapshot, "string", "snapshot is a canonical JSON string (text) for exact-byte round-trip");
  // projection columns are actually the profile's/scope's values (teeth vs a dropped projection)
  assert.equal(row.subject_type, "credit_union");
  assert.equal(row.plane, "shared_market");
  assert.equal(row.visibility, "public");
  assert.equal(row.confidence, pp.profile.confidence);
  assert.equal(row.health, pp.profile.health);
  const back = rowToProfile(row);
  assert.deepEqual(back.profile, pp.profile, "the whole profile round-trips");
  assert.equal(JSON.stringify(back.profile), JSON.stringify(pp.profile), "byte-identical (JSON.stringify)");
  assert.deepEqual(back.scope, publicScope, "the plane-aware scope round-trips");
  assert.deepEqual(back.profile.outcome_adjustments[0].outcome_source_refs, ["verification:exam:2026Q2"], "outcome evidence lineage preserved");
});

test("PLANE NOT CONFLATED: a public and a tenant profile persist with distinct discriminators", () => {
  const pubRow = profileToRow(persisted("profile:pub", publicScope));
  const tenRow = profileToRow(persisted("profile:ten", tenantScope));
  assert.equal(pubRow.plane, "shared_market");
  assert.equal(pubRow.visibility, "public");
  assert.equal(pubRow.workspace_id, null, "a shared-market profile carries no tenant");
  assert.equal(tenRow.plane, "private_terminal");
  assert.equal(tenRow.visibility, "tenant_private");
  assert.ok(UUID_RE.test(tenRow.workspace_id), "a tenant profile carries its remapped workspace id");
  assert.notEqual(pubRow.plane, tenRow.plane, "the two planes are stored distinctly (never conflated)");
});

test("rowToProfile rejects a row with no snapshot", () => {
  assert.throws(() => rowToProfile({ id: "x", plane: "shared_market", visibility: "public" }), /snapshot missing/);
});

// ---- in-memory store: deterministic + defensive clones (both sides) ---------
test("InMemoryProfileStore stores, retrieves, and defends against caller mutation (put + get)", () => {
  const store = new InMemoryProfileStore();
  const pp = persisted("profile:cu:60441");
  store.put(pp);
  // put-side: mutating the caller's object after put must not corrupt the store.
  pp.profile.confidence = -111;
  assert.notEqual(store.get("profile:cu:60441").profile.confidence, -111, "put stores a clone");
  // get-side: mutating the returned copy must not corrupt the store.
  const got = store.get("profile:cu:60441");
  got.profile.confidence = -999;
  assert.notEqual(store.get("profile:cu:60441").profile.confidence, -999, "get returns a clone");
  assert.equal(store.all().length, 1);
});

// ---- Supabase-backed store: queue -> flush -> hydrate (survives a boundary) --
test("SupabaseProfileStore persists then hydrates a profile byte-identically + scope", async () => {
  const s1 = new SupabaseProfileStore();
  const pp = persisted("profile:cu:60441", tenantScope);
  s1.put(pp);
  assert.equal(s1.pendingRows().length, 1, "the write is queued");
  const client = fakeClient();
  await s1.flush(client);
  assert.equal(client.tables.profile_snapshots.length, 1, "flush persists the row");
  assert.equal(s1.pendingRows().length, 0, "flush clears the queue");

  const s2 = new SupabaseProfileStore();
  await s2.hydrateFromSupabase(client);
  const back = s2.get(pp.profile.id);
  assert.equal(JSON.stringify(back.profile), JSON.stringify(pp.profile), "profile survives persist->hydrate byte-identically");
  assert.deepEqual(back.scope, tenantScope, "the plane-aware scope survives the boundary");
});

test("flush clears only the flushed rows, not a put that lands during the await", async () => {
  const s = new SupabaseProfileStore();
  s.put(persisted("profile:a"));
  // A client whose upsert awaits a microtask; we put a NEW profile mid-flight.
  const client = {
    tables: { profile_snapshots: [] },
    async upsert(table, rows) {
      s.put(persisted("profile:b")); // lands DURING the in-flight flush
      await Promise.resolve();
      for (const r of rows) this.tables.profile_snapshots.push(r);
      return { error: null };
    },
    async selectAll() { return { data: [], error: null }; },
  };
  await s.flush(client);
  const pending = s.pendingRows();
  assert.equal(pending.length, 1, "the profile put during the await is NOT silently dropped");
  assert.equal(JSON.parse(pending[0].snapshot).id, "profile:b");
});

test("flush keeps a re-put of the SAME id that lands during the await (no lost update)", async () => {
  const s = new SupabaseProfileStore();
  const v1 = persisted("profile:x");
  v1.profile.display_name = "V1";
  s.put(v1);
  const client = {
    tables: { profile_snapshots: [] },
    async upsert(table, rows) {
      // A newer value for the SAME id lands during the in-flight flush.
      const v2 = persisted("profile:x");
      v2.profile.display_name = "V2";
      s.put(v2);
      await Promise.resolve();
      for (const r of rows) this.tables.profile_snapshots.push(r);
      return { error: null };
    },
    async selectAll() { return { data: [], error: null }; },
  };
  await s.flush(client);
  const pending = s.pendingRows();
  assert.equal(pending.length, 1, "the same-id re-put must remain pending (its newer value is not dropped)");
  assert.equal(JSON.parse(pending[0].snapshot).display_name, "V2", "the retained pending value is the newer one");
  assert.equal(s.get("profile:x").profile.display_name, "V2", "the snapshot reflects the newer value");
});

test("hydrate imposes a stable order regardless of DB row order", async () => {
  const s1 = new SupabaseProfileStore();
  s1.put(persisted("profile:a"));
  s1.put(persisted("profile:b"));
  const client = fakeClient();
  await s1.flush(client);
  const rows = client.tables.profile_snapshots;
  const forward = new SupabaseProfileStore();
  forward.hydrate(rows.slice());
  const reversed = new SupabaseProfileStore();
  reversed.hydrate(rows.slice().reverse());
  assert.deepEqual(reversed.all(), forward.all(), "hydrate order must not depend on DB row order");
});

// ---- factory ----------------------------------------------------------------
test("profileStore() defaults to in-memory; a client yields a hydrated Supabase store", async () => {
  const def = await profileStore();
  assert.ok(def instanceof InMemoryProfileStore, "no client -> in-memory (gate stays green without creds)");
  const client = fakeClient();
  const live = await profileStore({ supabase: client });
  assert.ok(live instanceof SupabaseProfileStore);
});
