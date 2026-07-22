// tests/supabase_table_client.test.mjs — the REAL @supabase/supabase-js binding
// for the narrow table-client seam (Wave 4). Driven with a FAKE SupabaseClient
// stub so no live backend/credentials are needed — asserts the adapter delegates
// upsert/select to the right table with the right conflict key and passes errors
// through, and that the env factory fails safe to null with no creds.
import { test } from "node:test";
import assert from "node:assert/strict";
import { register } from "node:module";
register("../scripts/alias-hook.mjs", import.meta.url);

const { makeTableClient, registryTableClientFromEnv } = await import("@/core/data/supabase-table-client");

/** A minimal fake @supabase/supabase-js client: records the calls it receives. */
function fakeSupabase(behavior = {}) {
  const calls = [];
  return {
    calls,
    from(table) {
      return {
        upsert(rows, opts) {
          calls.push({ op: "upsert", table, rows, onConflict: opts?.onConflict });
          return Promise.resolve({ error: behavior.upsertError ?? null });
        },
        select(cols) {
          calls.push({ op: "select", table, cols });
          const data = "selectData" in behavior ? behavior.selectData : [];
          return Promise.resolve({ data, error: behavior.selectError ?? null });
        },
      };
    },
  };
}

test("makeTableClient.upsert delegates to from(table).upsert(rows, {onConflict}) and returns {error}", async () => {
  const fake = fakeSupabase();
  const client = makeTableClient(fake);
  const rows = [{ id: "u1", x: 1 }];
  const res = await client.upsert("object_registry", rows, "id");
  assert.deepEqual(res, { error: null });
  assert.equal(fake.calls.length, 1);
  assert.deepEqual(fake.calls[0], { op: "upsert", table: "object_registry", rows, onConflict: "id" });
});

test("makeTableClient.upsert passes a driver error through (no swallow)", async () => {
  const client = makeTableClient(fakeSupabase({ upsertError: { message: "boom" } }));
  const res = await client.upsert("profile_snapshots", [{ id: "p1" }], "id");
  assert.deepEqual(res.error, { message: "boom" }, "the error must propagate so flush() can throw");
});

test("makeTableClient.selectAll delegates to from(table).select('*') and returns {data,error}", async () => {
  const fake = fakeSupabase({ selectData: [{ id: "a" }, { id: "b" }] });
  const client = makeTableClient(fake);
  const res = await client.selectAll("object_merges");
  assert.deepEqual(res.data, [{ id: "a" }, { id: "b" }]);
  assert.equal(res.error, null);
  assert.deepEqual(fake.calls[0], { op: "select", table: "object_merges", cols: "*" });
});

test("selectAll normalizes a null data payload to null (not undefined)", async () => {
  const client = makeTableClient(fakeSupabase({ selectData: null }));
  const res = await client.selectAll("object_registry");
  assert.equal(res.data, null);
});

test("registryTableClientFromEnv returns null with no credentials (gate stays in-memory)", () => {
  const savedUrl = process.env.SUPABASE_URL;
  const savedKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  delete process.env.SUPABASE_URL;
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  try {
    assert.equal(registryTableClientFromEnv(), null, "no creds -> null -> caller falls back to in-memory");
  } finally {
    if (savedUrl !== undefined) process.env.SUPABASE_URL = savedUrl;
    if (savedKey !== undefined) process.env.SUPABASE_SERVICE_ROLE_KEY = savedKey;
  }
});
