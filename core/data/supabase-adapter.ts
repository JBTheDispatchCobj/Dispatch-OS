// core/data/supabase-adapter.ts
//
// Supabase-backed DataStore (the "graduation from idea state").
//
// Design — a HYBRID that keeps the synchronous DataStore interface intact:
//   * READS are served synchronously from an in-memory snapshot that is
//     hydrated from Postgres at boot (and re-hydrated right after first-run
//     seeding). This is why core/widgets/* and both demos need ZERO changes.
//   * WRITES go through the exact same InMemoryStore mutators (so all event
//     logging / business logic is unchanged), then a structural DIFF of the
//     in-memory db is persisted to Postgres on a serialized write-chain.
//
// The in-memory store uses short string ids (e.g. "u_owner", "ws_field_service")
// while Postgres uses uuid columns. The adapter bridges that with a DETERMINISTIC
// uuid (uuid-v5-style hash of the string id), applied to every uuid / uuid[]
// column discovered from the live PostgREST schema. Deterministic => the demo
// session's "u_owner" always maps to the same persisted row, and the object
// graph (FKs) stays internally consistent.
//
// Anything that fails falls back to the in-memory store (see createSupabaseStore)
// so a bad connection never bricks the app. Config tables (entity_types,
// configurations, workflows, rules, …) are CARTRIDGE-DERIVED, not persisted:
// configurations are re-derived on load exactly like core/data/index.ts does,
// and entity_types are seeded from the entities present (FK satisfaction only).

import "@/cartridges"; // ensure cartridges are registered before config lookups
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { createHash } from "node:crypto";
import { getActiveConfiguration } from "@/core/config";
import type { Db, DataStore } from "@/core/data/store";
import type { Configuration } from "@/core/types";

// --- id <-> uuid bridge -----------------------------------------------------

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Deterministic uuid-v5-style id from an in-memory string id. Stable forever. */
function idToUuid(value: string): string {
  const h = createHash("sha1").update(`dispatch-os:${value}`).digest();
  const b = Buffer.from(h.subarray(0, 16));
  b[6] = (b[6] & 0x0f) | 0x50; // version 5
  b[8] = (b[8] & 0x3f) | 0x80; // RFC variant
  const hex = b.toString("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

/** null/undefined -> null; already-uuid -> itself; else -> deterministic uuid. */
function remapId(value: unknown): string | null {
  if (value === null || value === undefined || value === "") return null;
  const s = String(value);
  return UUID_RE.test(s) ? s : idToUuid(s);
}

// --- collection <-> table registry ------------------------------------------
//
// Ordered so a full seed satisfies FK constraints (parents before children).
// `key` is the Db field; `table` is the Postgres table. `configurations` is
// intentionally absent — it is re-derived from cartridges, never persisted.

interface RegistryEntry {
  key: keyof Db;
  table: string;
}

const REGISTRY: RegistryEntry[] = [
  { key: "orgs", table: "organizations" },
  { key: "workspaces", table: "workspaces" },
  { key: "users", table: "user_profiles" },
  { key: "sources", table: "sources" },
  { key: "inboundEvents", table: "inbound_events" },
  { key: "entities", table: "entities" },
  { key: "documents", table: "documents" },
  { key: "workItems", table: "work_items" },
  { key: "events", table: "work_item_events" },
  { key: "checklistItems", table: "checklist_items" },
  { key: "notes", table: "notes" },
  { key: "evidence", table: "evidence_items" },
  { key: "agentRuns", table: "agent_runs" },
  { key: "agentActions", table: "agent_actions" },
  { key: "proposals", table: "work_item_proposals" },
  { key: "contextObjects", table: "context_objects" },
  { key: "decisions", table: "decisions" },
  { key: "approvals", table: "approvals" },
  { key: "reports", table: "report_runs" },
  { key: "metrics", table: "metrics" },
  { key: "dashboards", table: "dashboards" },
  { key: "outcomes", table: "outcomes" },
  { key: "activity", table: "operating_events" },
];

/** uuid columns whose FK target is a config table we don't seed -> store null. */
const NULL_OUT_COLUMNS = new Set(["workflow_id", "related_workflow_id"]);

/** Read-only DataStore methods — these never trigger a persist diff. */
const READ_METHODS = new Set<string>([
  "getOrg", "listWorkspaces", "getWorkspace", "listUsers", "listWorkItems",
  "getWorkItem", "listChecklist", "listNotes", "listEvidence", "getEvidence",
  "listEvents", "listActivity", "reviewQueue", "listProposals",
  "listInboundEvents", "listInputs", "getInput", "listAgentRuns",
  "listAgentActions", "getActiveConfigurationRecord", "listSources",
  "listContextObjects", "listDecisions", "listApprovals", "listMetrics",
  "listLatestMetrics", "metricHistory", "listDashboards", "listOutcomes",
  "listReports", "getReport", "getOutcome",
]);

// --- live schema introspection ----------------------------------------------

interface TableMeta {
  columns: string[];
  uuidCols: Set<string>;
  uuidArrayCols: Set<string>;
  arrayCols: Set<string>;
  numericCols: Set<string>;
  required: Set<string>;
}
type Schema = Map<string, TableMeta>;

async function introspectSchema(url: string, key: string): Promise<Schema> {
  const res = await fetch(`${url}/rest/v1/`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  if (!res.ok) throw new Error(`schema introspection failed: HTTP ${res.status}`);
  const spec = (await res.json()) as { definitions?: Record<string, { required?: string[]; properties?: Record<string, { format?: string }> }> };
  const defs = spec.definitions ?? {};
  const schema: Schema = new Map();
  for (const [table, def] of Object.entries(defs)) {
    const props = def.properties ?? {};
    const meta: TableMeta = {
      columns: Object.keys(props),
      uuidCols: new Set(),
      uuidArrayCols: new Set(),
      arrayCols: new Set(),
      numericCols: new Set(),
      required: new Set(def.required ?? []),
    };
    for (const [col, p] of Object.entries(props)) {
      const fmt = p.format ?? "";
      if (fmt.endsWith("[]")) meta.arrayCols.add(col);
      if (fmt === "uuid") meta.uuidCols.add(col);
      else if (fmt === "uuid[]") meta.uuidArrayCols.add(col);
      else if (fmt === "numeric" || fmt === "integer" || fmt === "bigint" || fmt === "real" || fmt === "double precision") meta.numericCols.add(col);
    }
    schema.set(table, meta);
  }
  return schema;
}

// --- object <-> row mapping -------------------------------------------------

/**
 * Map an in-memory object to a Postgres row: pick real columns, remap ids.
 * `liveIds` is the set of all remapped ids that exist in this persist pass; a
 * NULLABLE scalar-uuid FK whose target isn't present (a dangling seed reference,
 * e.g. an assignee id with no matching user) is set to null rather than break
 * the insert. Required FKs are never nulled (they always resolve in practice).
 */
function toRow(obj: Record<string, unknown>, meta: TableMeta, liveIds: Set<string>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  for (const col of meta.columns) {
    if (!(col in obj)) continue;
    let v = obj[col];
    if (v === undefined) continue;
    if (NULL_OUT_COLUMNS.has(col)) { row[col] = null; continue; }
    if (meta.arrayCols.has(col)) {
      // Non-array (null/undefined/garbage) -> omit so the column default ('{}')
      // applies; sending null would violate the NOT NULL array constraints.
      if (!Array.isArray(v)) continue;
      // uuid[] element FKs aren't enforced by Postgres; just remap to uuids.
      if (meta.uuidArrayCols.has(col)) v = v.map(remapId).filter((x) => x !== null);
    } else if (meta.uuidCols.has(col)) {
      v = remapId(v);
      if (col !== "id" && !meta.required.has(col) && v !== null && !liveIds.has(v as string)) v = null;
    }
    // Never send explicit null to a NOT NULL column — omit it so the column
    // default (e.g. '{}', now()) applies instead of violating the constraint.
    if (v === null && meta.required.has(col)) continue;
    row[col] = v;
  }
  return row;
}

/** Every remapped id present across all persisted collections in a db. */
function collectLiveIds(db: Db): Set<string> {
  const ids = new Set<string>();
  for (const { key } of REGISTRY) {
    for (const o of (db[key] ?? []) as unknown as Record<string, unknown>[]) {
      const u = remapId(o.id);
      if (u) ids.add(u);
    }
  }
  return ids;
}

/** Coerce a loaded Postgres row back toward the in-memory shape (numerics). */
function fromRow(row: Record<string, unknown>, meta: TableMeta): Record<string, unknown> {
  for (const col of meta.numericCols) {
    const v = row[col];
    if (typeof v === "string" && v !== "") row[col] = Number(v);
  }
  return row;
}

// --- persistence primitives -------------------------------------------------

async function upsertRows(client: SupabaseClient, table: string, rows: Record<string, unknown>[]) {
  if (rows.length === 0) return;
  // PostgREST bulk insert aligns every row in a request to the UNION of keys,
  // filling any key a row omits with null — which violates NOT NULL columns that
  // were meant to take their default (e.g. uuid[]/text[] '{}' columns). Group by
  // exact key-set so each request is uniform and omitted columns truly default.
  const groups = new Map<string, Record<string, unknown>[]>();
  for (const r of rows) {
    const sig = Object.keys(r).sort().join("|");
    const g = groups.get(sig);
    if (g) g.push(r); else groups.set(sig, [r]);
  }
  for (const group of groups.values()) {
    for (let i = 0; i < group.length; i += 500) {
      const chunk = group.slice(i, i + 500);
      const { error } = await client.from(table).upsert(chunk, { onConflict: "id" });
      if (error) throw new Error(`upsert ${table}: ${error.message}`);
    }
  }
}

async function deleteIds(client: SupabaseClient, table: string, ids: string[]) {
  if (ids.length === 0) return;
  const { error } = await client.from(table).delete().in("id", ids.map((x) => remapId(x) as string));
  if (error) throw new Error(`delete ${table}: ${error.message}`);
}

/** Seed entity_types from the entities present (FK satisfaction only). */
async function seedEntityTypes(client: SupabaseClient, db: Db) {
  const seen = new Map<string, { key: string; cartridge_key: string; label: string }>();
  for (const e of db.entities) {
    const k = e.entity_type_key;
    if (!seen.has(k)) seen.set(k, { key: k, cartridge_key: k.split(":")[0] ?? "core", label: k });
  }
  const rows = [...seen.values()];
  if (rows.length === 0) return;
  const { error } = await client.from("entity_types").upsert(rows, { onConflict: "key" });
  if (error) throw new Error(`upsert entity_types: ${error.message}`);
}

/** Write the entire in-memory db to Postgres in FK-safe order (first-run seed). */
async function persistFullDb(client: SupabaseClient, db: Db, schema: Schema) {
  await seedEntityTypes(client, db);
  const liveIds = collectLiveIds(db);
  for (const { key, table } of REGISTRY) {
    const meta = schema.get(table);
    if (!meta) continue;
    const items = (db[key] ?? []) as unknown as Record<string, unknown>[];
    await upsertRows(client, table, items.map((o) => toRow(o, meta, liveIds)));
  }
}

/** Read every persisted table into a fresh Db; re-derive configurations. */
async function loadDb(client: SupabaseClient, schema: Schema): Promise<Db> {
  const db = {
    orgs: [], workspaces: [], users: [], entities: [], workItems: [], events: [],
    activity: [], checklistItems: [], notes: [], evidence: [], documents: [],
    inboundEvents: [], agentRuns: [], agentActions: [], proposals: [], sources: [],
    configurations: [], contextObjects: [], decisions: [], approvals: [], metrics: [],
    dashboards: [], outcomes: [], reports: [],
  } as unknown as Db;

  for (const { key, table } of REGISTRY) {
    const meta = schema.get(table);
    if (!meta) continue;
    const { data, error } = await client.from(table).select("*");
    if (error) throw new Error(`select ${table}: ${error.message}`);
    (db[key] as unknown as Record<string, unknown>[]) = (data ?? []).map((r) => fromRow(r as Record<string, unknown>, meta));
  }

  // Configurations are derived, not stored — mirror core/data/index.ts.
  for (const ws of db.workspaces) {
    const resolved = getActiveConfiguration(ws.cartridge_key, ws.id);
    if (resolved) db.configurations.push(resolved.configuration as Configuration);
  }
  return db;
}

// --- structural diff (snapshot before/after a mutator) ----------------------

type Snapshot = Map<keyof Db, Map<string, { obj: Record<string, unknown>; json: string }>>;

function snapshot(db: Db): Snapshot {
  const snap: Snapshot = new Map();
  for (const { key } of REGISTRY) {
    const m = new Map<string, { obj: Record<string, unknown>; json: string }>();
    for (const o of (db[key] ?? []) as unknown as Record<string, unknown>[]) {
      m.set(String(o.id), { obj: o, json: JSON.stringify(o) });
    }
    snap.set(key, m);
  }
  return snap;
}

async function persistDiff(client: SupabaseClient, schema: Schema, before: Snapshot, after: Snapshot) {
  // All ids present after the mutation, for dangling-FK pruning.
  const liveIds = new Set<string>();
  for (const m of after.values()) for (const id of m.keys()) { const u = remapId(id); if (u) liveIds.add(u); }
  // Upserts in registry order (FK-safe); deletes in reverse.
  for (const { key, table } of REGISTRY) {
    const meta = schema.get(table);
    if (!meta) continue;
    const b = before.get(key)!;
    const a = after.get(key)!;
    const changed: Record<string, unknown>[] = [];
    for (const [id, { obj, json }] of a) {
      const prev = b.get(id);
      if (!prev || prev.json !== json) changed.push(toRow(obj, meta, liveIds));
    }
    await upsertRows(client, table, changed);
  }
  for (let i = REGISTRY.length - 1; i >= 0; i--) {
    const { key, table } = REGISTRY[i];
    const b = before.get(key)!;
    const a = after.get(key)!;
    const removed: string[] = [];
    for (const id of b.keys()) if (!a.has(id)) removed.push(id);
    await deleteIds(client, table, removed);
  }
}

// --- write-through patching -------------------------------------------------
//
// The store stays a synchronous InMemoryStore (so `store` can be a sync export
// and both demos are untouched). Once Postgres is reconciled, we patch the
// instance's MUTATOR methods in place: each runs the original logic, then
// queues a structural diff-persist on a serialized write-chain. Reads are
// never patched, so they cost nothing.

function reachDb(store: DataStore): Db {
  return (store as unknown as { db: Db }).db;
}

/** Refill the existing Db arrays in place so all holders see the new state. */
function replaceDbInPlace(target: Db, source: Db) {
  for (const k of Object.keys(target) as (keyof Db)[]) {
    const arr = target[k] as unknown[];
    arr.length = 0;
    arr.push(...((source[k] ?? []) as unknown[]));
  }
}

function patchWriteThrough(store: DataStore, client: SupabaseClient, schema: Schema) {
  const db = reachDb(store);
  let chain: Promise<void> = Promise.resolve();
  const proto = Object.getPrototypeOf(store) as Record<string, unknown>;
  for (const name of Object.getOwnPropertyNames(proto)) {
    if (name === "constructor" || READ_METHODS.has(name)) continue;
    const original = proto[name];
    if (typeof original !== "function") continue;
    const fn = original as (...a: unknown[]) => unknown;
    (store as unknown as Record<string, unknown>)[name] = (...args: unknown[]) => {
      const before = snapshot(db);
      const result = fn.apply(store, args);
      const after = snapshot(db);
      chain = chain
        .then(() => persistDiff(client, schema, before, after))
        .catch((e) => console.error(`[supabase-adapter] persist failed in ${name}:`, e instanceof Error ? e.message : e));
      return result;
    };
  }
}

// --- attach -----------------------------------------------------------------

/**
 * Reconcile a synchronous in-memory `store` with Postgres, then enable
 * write-through. On first run (empty `organizations`) it SEEDS Postgres from
 * the store's freshly-built fixtures (metrics/outcomes already recomputed) and
 * keeps serving them. On later runs it LOADS persisted state into the store's
 * Db in place (so prior mutations survive restart). Any failure leaves the
 * store as a working in-memory fallback. Fire-and-forget from index.ts.
 */
export async function attachSupabase(store: DataStore): Promise<void> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.warn("[supabase-adapter] SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY missing — staying in-memory.");
    return;
  }
  try {
    const client = createClient(url, key, { auth: { persistSession: false } });
    const schema = await introspectSchema(url, key);

    const { count, error: countErr } = await client
      .from("organizations")
      .select("id", { count: "exact", head: true });
    if (countErr) throw new Error(`probe organizations: ${countErr.message}`);

    if ((count ?? 0) === 0) {
      await persistFullDb(client, reachDb(store), schema);
      console.warn("[supabase-adapter] seeded Postgres from cartridge fixtures.");
    } else {
      const loaded = await loadDb(client, schema);
      replaceDbInPlace(reachDb(store), loaded);
      console.warn("[supabase-adapter] hydrated store from Postgres.");
    }

    patchWriteThrough(store, client, schema);
    console.warn("[supabase-adapter] backend live — writes now persist to Postgres.");
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error(`[supabase-adapter] attach failed (${msg}) — staying in-memory.`);
  }
}
