// core/profile/persistence.ts
//
// Profile PERSISTENCE (Volume III: Knowledge Graph & Truth, RFC-3012). A live
// profile assembled by core/profile/assemble_live.ts is, until now, computed in
// memory each call — it does not survive a process boundary. This lands the seam
// that persists a {@link LiveAssembledProfile} and hydrates it back
// BYTE-IDENTICALLY, so a profile's confidence / freshness / lineage / outcome
// audit surface survive a restart intact.
//
// PLANE-AWARE (ADR-0004; DOCTRINE: truth planes are NEVER conflated). A
// LiveAssembledProfile is a projection and carries NO plane of its own, so a
// caller persists it WITH an explicit {@link ProfileScope} (plane / visibility /
// workspace / org). A shared-market public-institution profile (plane
// shared_market, visibility public) and a private tenant profile (private_terminal,
// tenant_private) are therefore stored DISTINCTLY — never collapsed onto the
// table's fail-closed defaults — and the 0018 plane-aware RLS gates against the
// real discriminator. The unit stored/retrieved is a {@link PersistedProfile}
// (profile + scope).
//
// SEAM (mirrors core/registry/supabase-store.ts). A synchronous
// {@link ProfilePersistencePort} — InMemory today, Supabase-backed when a client
// is configured. `profileStore()` returns the in-memory store unless a client is
// supplied, so the debug loop + unit tests + `next build` are green with no creds.
//
// LINEAGE, NOT A CONCLUSION (DOCTRINE). A persisted profile stores EVIDENCE: the
// whole assembled projection (every field's source_ref + truth tier, the rollup
// confidence, the freshness read, the outcome-adjustment audit with its evidence
// refs) as an opaque `snapshot`, plus indexable projections (subject, plane,
// confidence, top_tier, health) for query. No regulated/financial conclusion is
// baked into a stored weight — a human_approved_conclusion is still produced by
// the human gate (ICApproval / EditorialDisposition), never persisted as a weight.
//
// BYTE-IDENTICAL ROUND-TRIP. The profile is carried in the `snapshot` column as a
// canonical JSON STRING (text), so `rowToProfile(profileToRow(x)).profile`
// deep-equals `x.profile` AND JSON.stringify is identical — even across a real
// Postgres backend, because a text column returns the exact bytes stored (a jsonb
// column could renormalize number formatting / key order, which would break the
// byte-identity guarantee). The scalar columns are derived projections, never the
// source of truth on the way back.
//
// PURE / DETERMINISTIC. The mappers are pure; the store is insertion-ordered;
// hydrate imposes a stable total order (by id) so a reload is reproducible
// regardless of DB row order. No clock, no random — ids/timestamps live on the
// profile the caller already injected.
//
// ERASABLE-ONLY TS: no enums, no parameter properties, no namespaces; `import type`
// for type-only imports. Safe under `node` native type-stripping.

import type { Plane, Visibility } from "@/core/truth/types";
import type { LiveAssembledProfile } from "@/core/profile/assemble_live";
import { remapId } from "@/core/registry/supabase-store";

// ---------------------------------------------------------------------------
// The plane-aware persist unit
// ---------------------------------------------------------------------------

/**
 * The plane/visibility/tenant discriminator a profile is persisted under
 * (ADR-0004). A LiveAssembledProfile is a projection and carries none of these,
 * so the caller — which knows whether the profile is a shared-market public
 * projection or a private tenant one — supplies them. `workspace_id`/
 * `organization_id` are null for a shared-market profile.
 */
export interface ProfileScope {
  plane: Plane;
  visibility: Visibility;
  workspace_id?: string | null;
  organization_id?: string | null;
}

/** The unit stored/retrieved: an assembled profile + the plane-aware scope it
 *  lives under. Persisting without a scope would conflate planes (DOCTRINE). */
export interface PersistedProfile {
  profile: LiveAssembledProfile;
  scope: ProfileScope;
}

// ---------------------------------------------------------------------------
// The persistence port
// ---------------------------------------------------------------------------

/**
 * The profile persistence seam. Synchronous (like the registry port), so the
 * live-assembly + query surfaces stay unchanged; the async edges (flush / hydrate)
 * live on the Supabase-backed implementation. Keyed by profile id.
 */
export interface ProfilePersistencePort {
  put(p: PersistedProfile): void;
  get(id: string): PersistedProfile | undefined;
  all(): PersistedProfile[];
}

// ---------------------------------------------------------------------------
// Stable helpers
// ---------------------------------------------------------------------------

/** JSON deep-clone (normalizes to plain JSON — the byte-identity guarantee). */
function clone<T>(x: T): T {
  return JSON.parse(JSON.stringify(x)) as T;
}

/** Total-order string compare (stable, locale-independent). */
function cmp(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

/** Normalize a scope to fully-populated (null) tenant fields for a faithful row. */
function normScope(s: ProfileScope): Required<ProfileScope> {
  return {
    plane: s.plane,
    visibility: s.visibility,
    workspace_id: s.workspace_id ?? null,
    organization_id: s.organization_id ?? null,
  };
}

// ---------------------------------------------------------------------------
// In-memory adapter (deterministic, insertion-ordered)
// ---------------------------------------------------------------------------

/** Deterministic in-memory profile store: keyed by id, insertion-ordered iteration. */
export class InMemoryProfileStore implements ProfilePersistencePort {
  private byId: Map<string, PersistedProfile>;
  constructor() {
    this.byId = new Map<string, PersistedProfile>();
  }
  put(p: PersistedProfile): void {
    // Store a defensive clone so a later caller mutation cannot reach the snapshot.
    this.byId.set(p.profile.id, clone(p));
  }
  get(id: string): PersistedProfile | undefined {
    const p = this.byId.get(id);
    return p ? clone(p) : undefined;
  }
  all(): PersistedProfile[] {
    return Array.from(this.byId.values()).map(clone);
  }
}

// ---------------------------------------------------------------------------
// PURE row mappers  (PersistedProfile <-> profile_snapshots column shape)
// ---------------------------------------------------------------------------

const T_PROFILES = "profile_snapshots";

/**
 * Map a persisted profile to a `profile_snapshots` row. The profile is carried in
 * the `snapshot` column as a canonical JSON STRING (the round-trip source of
 * truth); the scalar columns (including the plane/visibility/tenant discriminator
 * from the scope) are indexable projections for query + the RLS predicate. `id`/
 * `subject_ref` remap through the SAME deterministic uuid bridge the registry uses;
 * the original ids are preserved in metadata so a hydrate restores them exactly.
 */
export function profileToRow(pp: PersistedProfile): Record<string, unknown> {
  const p = pp.profile;
  const s = normScope(pp.scope);
  return {
    id: remapId(p.id),
    subject_ref: p.subject_ref,
    subject_type: p.subject_type,
    display_name: p.display_name,
    workspace_id: remapId(s.workspace_id),
    organization_id: remapId(s.organization_id),
    plane: s.plane,
    visibility: s.visibility,
    as_of: p.as_of,
    confidence: p.confidence,
    top_tier: p.top_tier,
    completeness: p.completeness,
    health: p.health,
    generated_by: p.generated_by,
    // The whole profile as a canonical JSON string — the round-trip source of
    // truth (text, so a real Postgres backend returns the exact bytes; a jsonb
    // column could renormalize numbers/key order and break byte-identity).
    snapshot: JSON.stringify(p),
    // The scope's original (possibly non-uuid) ids, preserved for a faithful
    // round-trip alongside the uuid columns.
    metadata: {
      profile_id: p.id,
      workspace_id: s.workspace_id,
      organization_id: s.organization_id,
    },
    created_at: p.created_at,
    updated_at: p.as_of,
  };
}

/** Reconstruct a persisted profile from a `profile_snapshots` row (byte-identical
 *  profile; plane-aware scope from the discriminator columns + metadata). */
export function rowToProfile(row: Record<string, unknown>): PersistedProfile {
  const snap = row.snapshot;
  if (snap === null || snap === undefined) {
    throw new Error("rowToProfile: row.snapshot missing — cannot reconstruct the profile");
  }
  // Accept either the canonical JSON string (text column) or an already-parsed
  // object (a jsonb column / an in-memory fake), so the mapper is robust.
  const profile: LiveAssembledProfile =
    typeof snap === "string" ? (JSON.parse(snap) as LiveAssembledProfile) : clone(snap as LiveAssembledProfile);
  const meta = (row.metadata ?? {}) as Record<string, unknown>;
  const scope: ProfileScope = {
    plane: row.plane as Plane,
    visibility: row.visibility as Visibility,
    // Prefer the original ids preserved in metadata; fall back to the uuid columns.
    workspace_id:
      (meta.workspace_id as string | null | undefined) ?? (row.workspace_id as string | null) ?? null,
    organization_id:
      (meta.organization_id as string | null | undefined) ?? (row.organization_id as string | null) ?? null,
  };
  return { profile, scope };
}

// ---------------------------------------------------------------------------
// Narrow client seam — the two calls this adapter needs (a real Supabase client
// is adapted to it in core/data/supabase-table-client.ts; tests pass a fake).
// ---------------------------------------------------------------------------

export interface ProfileTableClient {
  upsert(table: string, rows: Record<string, unknown>[], onConflict: string): Promise<{ error: unknown }>;
  selectAll(table: string): Promise<{ data: Record<string, unknown>[] | null; error: unknown }>;
}

// ---------------------------------------------------------------------------
// Supabase-backed hybrid store (sync port over a snapshot + a pending write log)
// ---------------------------------------------------------------------------

/**
 * A Supabase-backed ProfilePersistencePort. Synchronous reads/writes hit an
 * internal in-memory snapshot (deterministic, insertion-ordered); each write is
 * queued for the next {@link flush}. `hydrate` imposes a stable total order (by id)
 * so a reload is reproducible regardless of DB row order. Nothing dials a database
 * on its own.
 */
export class SupabaseProfileStore implements ProfilePersistencePort {
  private snapshot: InMemoryProfileStore;
  private pending: Map<string, PersistedProfile>;
  constructor() {
    this.snapshot = new InMemoryProfileStore();
    this.pending = new Map<string, PersistedProfile>();
  }

  put(p: PersistedProfile): void {
    this.snapshot.put(p);
    this.pending.set(p.profile.id, clone(p));
  }
  get(id: string): PersistedProfile | undefined {
    return this.snapshot.get(id);
  }
  all(): PersistedProfile[] {
    return this.snapshot.all();
  }

  /** Rows currently queued for persistence (exposed for tests / a custom runner). */
  pendingRows(): Record<string, unknown>[] {
    return Array.from(this.pending.values()).map(profileToRow);
  }

  /** Load a snapshot from already-fetched rows (PURE; no client), stable-ordered. */
  hydrate(rows: Record<string, unknown>[]): void {
    const items = rows.map(rowToProfile);
    items.sort((a, b) => cmp(a.profile.id, b.profile.id));
    for (const p of items) this.snapshot.put(p);
  }

  /**
   * Persist queued writes through the narrow client, then drop EXACTLY the entries
   * that were flushed. A put() that lands during the in-flight await keeps its
   * pending entry — even a re-put of the SAME id: we key the drop on the exact
   * queued object reference, so a newer value that replaced it mid-flush survives
   * to the next flush (no silent write loss).
   */
  async flush(client: ProfileTableClient): Promise<void> {
    const flushing = new Map(this.pending); // id -> the exact reference queued now
    if (flushing.size === 0) return;
    const rows = Array.from(flushing.values()).map(profileToRow);
    const { error } = await client.upsert(T_PROFILES, rows, "id");
    if (error) throw new Error("profile flush failed: " + String(error));
    for (const [id, ref] of flushing) {
      if (this.pending.get(id) === ref) this.pending.delete(id);
    }
  }

  /** Fetch the table through the client and hydrate the snapshot. */
  async hydrateFromSupabase(client: ProfileTableClient): Promise<void> {
    const res = await client.selectAll(T_PROFILES);
    if (res.error) throw new Error("profile hydrate failed: " + String(res.error));
    this.hydrate(res.data ?? []);
  }
}

// ---------------------------------------------------------------------------
// Factory — in-memory by default; Supabase-backed only when a client is present
// ---------------------------------------------------------------------------

export interface ProfileStoreOptions {
  /** When present, use the live-persistence store (0018 applied). */
  supabase?: ProfileTableClient;
}

/**
 * Build the profile persistence store. Returns an in-memory store by default (so
 * every gate stays green with no credentials); returns a hydrated
 * {@link SupabaseProfileStore} when a client is supplied.
 */
export async function profileStore(opts?: ProfileStoreOptions): Promise<ProfilePersistencePort> {
  if (!opts || !opts.supabase) return new InMemoryProfileStore();
  const store = new SupabaseProfileStore();
  await store.hydrateFromSupabase(opts.supabase);
  return store;
}
