// core/registry/supabase-store.ts
//
// Supabase adapter for the Object Registry persistence seam (RFC-2003, Volume X).
// Implements the EXISTING `RegistryPersistencePort` (core/registry/service.ts)
// against the 0017 tables — object_registry / object_match_candidates /
// object_merges — with NO change to ObjectRegistryService. Migrations 0016+0017
// are applied in Supabase (2026-07-21), so this is the live-persistence path.
//
// HYBRID (mirrors core/data/supabase-adapter.ts, "graduation from idea state"):
//   * The port is SYNCHRONOUS (put/get/all/…). So reads + writes are served
//     synchronously from an internal InMemoryRegistryStore snapshot; every write
//     also records a PENDING op. The ASYNC edges are hydrate (load the snapshot
//     from Postgres) and flush (persist the pending ops). Determinism is
//     preserved: the service still sees an insertion-ordered in-memory store.
//   * Ids: the service assigns short ids via its injected idGen ("reg:0"); the DB
//     uses uuid columns. `remapId` bridges them with the SAME deterministic
//     uuid-v5 hash core/data/supabase-adapter.ts uses, so the object graph (FKs)
//     stays internally consistent and re-runnable.
//
// DEFAULT STAYS IN-MEMORY. `registryStore()` returns an InMemoryRegistryStore
// unless a client is supplied, so the debug loop + unit tests + `next build` are
// green with no live credentials. The row mappers are PURE and fully unit-tested.
//
// DEPENDENCY-FREE. This file imports no database driver: the async edges take a
// narrow structural {@link RegistryTableClient} (three calls). A real
// @supabase/supabase-js client is adapted to it where clients are constructed
// (core/data), keeping this module importable under `node` type-stripping.
//
// ERASABLE-ONLY TS: no enums, no parameter properties, no namespaces; `import type`
// for type-only imports.

import { createHash } from "node:crypto";
import type {
  CanonicalObject,
  MatchCandidate,
  MergeRecord,
  RegistryPersistencePort,
} from "@/core/registry/service";
import { InMemoryRegistryStore } from "@/core/registry/service";

// ---------------------------------------------------------------------------
// id <-> uuid bridge (identical scheme to core/data/supabase-adapter.ts)
// ---------------------------------------------------------------------------

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Deterministic uuid-v5-style id from an in-memory string id. Stable forever. */
export function idToUuid(value: string): string {
  const h = createHash("sha1").update("dispatch-os:" + value).digest();
  const b = Buffer.from(h.subarray(0, 16));
  b[6] = (b[6] & 0x0f) | 0x50; // version 5
  b[8] = (b[8] & 0x3f) | 0x80; // RFC variant
  const hex = b.toString("hex");
  return hex.slice(0, 8) + "-" + hex.slice(8, 12) + "-" + hex.slice(12, 16) + "-" + hex.slice(16, 20) + "-" + hex.slice(20, 32);
}

/** null/undefined/"" -> null; already-uuid -> itself; else -> deterministic uuid. */
export function remapId(value: string | null | undefined): string | null {
  if (value === null || value === undefined || value === "") return null;
  return UUID_RE.test(value) ? value : idToUuid(value);
}

// ---------------------------------------------------------------------------
// Narrow client seam — the three calls this adapter needs. A real Supabase
// client is trivially wrapped to satisfy it; tests pass a fake.
// ---------------------------------------------------------------------------

export interface RegistryTableClient {
  /** Upsert rows into `table`, conflict-resolving on `onConflict` (comma-separated cols). */
  upsert(table: string, rows: Record<string, unknown>[], onConflict: string): Promise<{ error: unknown }>;
  /** Read every row of `table`. */
  selectAll(table: string): Promise<{ data: Record<string, unknown>[] | null; error: unknown }>;
}

// ---------------------------------------------------------------------------
// Stable-ordering helpers (deterministic hydrate)
// ---------------------------------------------------------------------------

/** Total-order string compare (stable, locale-independent). */
function cmp(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

/** Unordered-pair key for a candidate (matches the DB pair-uniqueness). */
function pairKeyOf(c: MatchCandidate): string {
  return c.left_id < c.right_id ? c.left_id + "|" + c.right_id : c.right_id + "|" + c.left_id;
}

// ---------------------------------------------------------------------------
// PURE row mappers  (service type  <->  0017 column shape)
// ---------------------------------------------------------------------------

/**
 * object_registry row. `external_ids` + `aliases` are carried in `metadata` for a
 * faithful round-trip through the identity index (a fuller adapter normalizes them
 * into the object_external_ids / entity_aliases child tables — a documented
 * follow-on; nothing is lost here).
 */
export function objectToRow(o: CanonicalObject): Record<string, unknown> {
  return {
    id: remapId(o.id),
    object_class: o.object_class,
    storage: o.storage ?? "typed_table",
    source_table: o.source_table ?? null,
    object_ref: remapId(o.object_ref ?? null),
    workspace_id: null,
    organization_id: null,
    plane: o.plane,
    visibility: o.visibility,
    canonical_slug: o.canonical_slug,
    display_name: o.display_name,
    status: o.status,
    merged_into_id: remapId(o.merged_into_id),
    metadata: {
      registry_id: o.id,
      object_ref: o.object_ref ?? null,
      // null marks "field was undefined on the object" so the round-trip restores
      // undefined vs [] faithfully (the service leaves these undefined when absent).
      external_ids: o.external_ids ?? null,
      aliases: o.aliases ?? null,
      merged_into_registry_id: o.merged_into_id,
    },
    created_at: o.created_at,
    updated_at: o.created_at,
  };
}

/** Reconstruct a CanonicalObject from an object_registry row (identity-index scope). */
export function rowToObject(row: Record<string, unknown>): CanonicalObject {
  const meta = (row.metadata ?? {}) as Record<string, unknown>;
  const status = String(row.status);
  if (status !== "active" && status !== "merged") {
    throw new Error("rowToObject: unsupported status '" + status + "' (identity-index scope is active|merged)");
  }
  // Prefer the original service ids preserved in metadata so a hydrate round-trips
  // exactly; fall back to the uuid columns when metadata is absent.
  const id = (meta.registry_id as string | undefined) ?? String(row.id);
  const mergedInto = (meta.merged_into_registry_id as string | null | undefined);
  return {
    id,
    object_class: String(row.object_class),
    canonical_slug: String(row.canonical_slug ?? ""),
    display_name: String(row.display_name ?? ""),
    plane: row.plane as CanonicalObject["plane"],
    visibility: row.visibility as CanonicalObject["visibility"],
    storage: (row.storage as CanonicalObject["storage"]) ?? "typed_table",
    source_table: (row.source_table as string | null) ?? undefined,
    // Prefer the original (possibly non-uuid) object_ref preserved in metadata so a
    // non-uuid typed-table ref round-trips losslessly; fall back to the uuid column.
    object_ref: (meta.object_ref as string | null | undefined) ?? (row.object_ref as string | null) ?? undefined,
    external_ids: (meta.external_ids as CanonicalObject["external_ids"]) ?? undefined,
    aliases: (meta.aliases as string[]) ?? undefined,
    status,
    merged_into_id: mergedInto === undefined ? (row.merged_into_id as string | null) : (mergedInto ?? null),
    created_at: String(row.created_at),
  };
}

/** Candidate status: service ('proposed'|'confirmed'|'rejected') -> DB column. */
function candStatusToDb(s: MatchCandidate["status"]): string {
  return s === "proposed" ? "pending" : s;
}
/** DB status -> service status (collapses merged->confirmed, expired->rejected). */
function candStatusFromDb(s: string): MatchCandidate["status"] {
  if (s === "pending") return "proposed";
  if (s === "confirmed" || s === "merged") return "confirmed";
  return "rejected";
}

/** object_match_candidates row. Synthetic deterministic id off the unordered pair
 *  so re-proposing a pair UPSERTS (mirrors the InMemory pair-keyed store + the
 *  object_match_candidates_pair_uniq index). */
export function candidateToRow(c: MatchCandidate): Record<string, unknown> {
  const lo = c.left_id < c.right_id ? c.left_id : c.right_id;
  const hi = c.left_id < c.right_id ? c.right_id : c.left_id;
  return {
    id: remapId("cand:" + lo + "|" + hi),
    object_id: remapId(c.left_id),
    candidate_object_id: remapId(c.right_id),
    match_score: c.score,
    match_method: "deterministic",
    match_rules: { reasons: c.reasons, left_registry_id: c.left_id, right_registry_id: c.right_id },
    status: candStatusToDb(c.status),
  };
}

/** Reconstruct a MatchCandidate from an object_match_candidates row. */
export function rowToCandidate(row: Record<string, unknown>): MatchCandidate {
  const rules = (row.match_rules ?? {}) as Record<string, unknown>;
  return {
    left_id: (rules.left_registry_id as string | undefined) ?? String(row.object_id),
    right_id: (rules.right_registry_id as string | undefined) ?? String(row.candidate_object_id),
    score: Number(row.match_score),
    reasons: (rules.reasons as string[]) ?? [],
    status: candStatusFromDb(String(row.status)),
  };
}

/** object_merges row (append-only lineage). Deterministic id so a re-flush is idempotent. */
export function mergeToRow(m: MergeRecord): Record<string, unknown> {
  return {
    id: remapId("merge:" + m.surviving_object_id + "|" + m.merged_object_id),
    operation: "merge",
    surviving_object_id: remapId(m.surviving_object_id),
    merged_object_id: remapId(m.merged_object_id),
    reason: m.decision_ref ?? null,
    actor: m.by,
    metadata: {
      surviving_registry_id: m.surviving_object_id,
      merged_registry_id: m.merged_object_id,
      decision_ref: m.decision_ref ?? null,
    },
    created_at: m.created_at,
  };
}

/** Reconstruct a MergeRecord from an object_merges row. */
export function rowToMerge(row: Record<string, unknown>): MergeRecord {
  const meta = (row.metadata ?? {}) as Record<string, unknown>;
  return {
    surviving_object_id: (meta.surviving_registry_id as string | undefined) ?? String(row.surviving_object_id),
    merged_object_id: (meta.merged_registry_id as string | undefined) ?? String(row.merged_object_id),
    by: String(row.actor),
    decision_ref: (meta.decision_ref as string | null | undefined) ?? (row.reason as string | null) ?? undefined,
    created_at: String(row.created_at),
  };
}

// ---------------------------------------------------------------------------
// The hybrid store — sync port over an in-memory snapshot + a pending write log
// ---------------------------------------------------------------------------

const T_OBJECTS = "object_registry";
const T_CANDIDATES = "object_match_candidates";
const T_MERGES = "object_merges";

/**
 * A Supabase-backed RegistryPersistencePort. Synchronous reads/writes hit the
 * internal snapshot (deterministic, insertion-ordered); each write is also queued
 * for the next {@link flush}. Nothing here dials a database on its own.
 */
export class SupabaseRegistryStore implements RegistryPersistencePort {
  private snapshot: InMemoryRegistryStore;
  private pendingObjects: Map<string, CanonicalObject>;
  private pendingCandidates: Map<string, MatchCandidate>;
  private pendingMerges: MergeRecord[];

  constructor() {
    this.snapshot = new InMemoryRegistryStore();
    this.pendingObjects = new Map<string, CanonicalObject>();
    this.pendingCandidates = new Map<string, MatchCandidate>();
    this.pendingMerges = [];
  }

  // --- RegistryPersistencePort (sync) ---------------------------------------
  put(o: CanonicalObject): void {
    this.snapshot.put(o);
    this.pendingObjects.set(o.id, o);
  }
  get(id: string): CanonicalObject | undefined {
    return this.snapshot.get(id);
  }
  all(): CanonicalObject[] {
    return this.snapshot.all();
  }
  putCandidate(c: MatchCandidate): void {
    this.snapshot.putCandidate(c);
    const lo = c.left_id < c.right_id ? c.left_id : c.right_id;
    const hi = c.left_id < c.right_id ? c.right_id : c.left_id;
    this.pendingCandidates.set(lo + "|" + hi, c);
  }
  candidates(): MatchCandidate[] {
    return this.snapshot.candidates();
  }
  putMerge(m: MergeRecord): void {
    this.snapshot.putMerge(m);
    this.pendingMerges.push(m);
  }
  merges(): MergeRecord[] {
    return this.snapshot.merges();
  }

  // --- Async edges ----------------------------------------------------------

  /**
   * Load a snapshot from already-fetched rows (PURE; no client). Rows arrive from
   * the DB in UNSPECIFIED physical order (no ORDER BY), and a batch can share a
   * created_at, so we impose a STABLE total order before loading — otherwise
   * resolve()'s candidate array would not be reproducible across restarts,
   * breaking the port's insertion-ordered/deterministic contract. Objects sort by
   * (created_at, id); candidates by the unordered pair; merges by (created_at,
   * survivor|merged).
   */
  hydrate(rows: {
    objects?: Record<string, unknown>[];
    candidates?: Record<string, unknown>[];
    merges?: Record<string, unknown>[];
  }): void {
    const objects = (rows.objects ?? []).map(rowToObject);
    objects.sort((a, b) => cmp(a.created_at + "|" + a.id, b.created_at + "|" + b.id));
    for (const o of objects) this.snapshot.put(o);

    const candidates = (rows.candidates ?? []).map(rowToCandidate);
    candidates.sort((a, b) => cmp(pairKeyOf(a), pairKeyOf(b)));
    for (const c of candidates) this.snapshot.putCandidate(c);

    const merges = (rows.merges ?? []).map(rowToMerge);
    merges.sort((a, b) =>
      cmp(a.created_at + "|" + a.surviving_object_id + "|" + a.merged_object_id,
          b.created_at + "|" + b.surviving_object_id + "|" + b.merged_object_id));
    for (const m of merges) this.snapshot.putMerge(m);
  }

  /** Rows currently queued for persistence (exposed for tests / a custom runner). */
  pending(): {
    objects: Record<string, unknown>[];
    candidates: Record<string, unknown>[];
    merges: Record<string, unknown>[];
  } {
    return {
      objects: Array.from(this.pendingObjects.values()).map(objectToRow),
      candidates: Array.from(this.pendingCandidates.values()).map(candidateToRow),
      merges: this.pendingMerges.map(mergeToRow),
    };
  }

  /** Persist queued writes through the narrow client, then clear the queue. */
  async flush(client: RegistryTableClient): Promise<void> {
    const p = this.pending();
    if (p.objects.length > 0) {
      const { error } = await client.upsert(T_OBJECTS, p.objects, "id");
      if (error) throw new Error("registry flush objects failed: " + String(error));
    }
    if (p.candidates.length > 0) {
      const { error } = await client.upsert(T_CANDIDATES, p.candidates, "id");
      if (error) throw new Error("registry flush candidates failed: " + String(error));
    }
    if (p.merges.length > 0) {
      const { error } = await client.upsert(T_MERGES, p.merges, "id");
      if (error) throw new Error("registry flush merges failed: " + String(error));
    }
    this.pendingObjects.clear();
    this.pendingCandidates.clear();
    this.pendingMerges = [];
  }

  /** Fetch all three tables through the client and hydrate the snapshot. */
  async hydrateFromSupabase(client: RegistryTableClient): Promise<void> {
    const [objs, cands, merges] = await Promise.all([
      client.selectAll(T_OBJECTS),
      client.selectAll(T_CANDIDATES),
      client.selectAll(T_MERGES),
    ]);
    for (const r of [objs, cands, merges]) {
      if (r.error) throw new Error("registry hydrate failed: " + String(r.error));
    }
    this.hydrate({
      objects: objs.data ?? [],
      candidates: cands.data ?? [],
      merges: merges.data ?? [],
    });
  }
}

// ---------------------------------------------------------------------------
// Factory — in-memory by default; Supabase-backed only when a client is present
// ---------------------------------------------------------------------------

export interface RegistryStoreOptions {
  /** When present, use the live-persistence store (0016+0017 applied). */
  supabase?: RegistryTableClient;
}

/**
 * Build the persistence store for ObjectRegistryService. Returns an in-memory
 * store by default (so every gate stays green with no credentials); returns a
 * hydrated {@link SupabaseRegistryStore} when a client is supplied.
 */
export async function registryStore(opts?: RegistryStoreOptions): Promise<RegistryPersistencePort> {
  if (!opts || !opts.supabase) return new InMemoryRegistryStore();
  const store = new SupabaseRegistryStore();
  await store.hydrateFromSupabase(opts.supabase);
  return store;
}
