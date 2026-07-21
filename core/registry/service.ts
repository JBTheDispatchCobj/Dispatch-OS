// core/registry/service.ts
//
// Object Registry SERVICE + entity resolution (Volume X; RFC-2003 — the
// resolution/service half of the RFC-10004 index subset). This is the runtime
// counterpart to db/migrations/0017_object_registry.sql: it indexes CANONICAL
// IDENTITY generically over the typed, plane-aware tables. It does NOT absorb
// data — the typed tables (e.g. `entities`) stay the systems of record, and
// canonical trust stays on the assertion/source layer (0011). The registry only
// indexes identity.
//
// PERSISTENCE SEAM / GATED ON 0016+0017:
//   Migrations 0016 (planes/RLS predicates) and 0017 (object_registry et al.)
//   are NOT yet applied in Supabase (Bryan-only apply). So this ships BEHIND a
//   persistence PORT — RegistryPersistencePort — with an in-memory adapter
//   (InMemoryRegistryStore) today. A Supabase adapter will implement the same
//   port AFTER the apply, with NO change to ObjectRegistryService. Nothing here
//   requires a live database.
//
// PURITY / DETERMINISM:
//   scoreMatch() is a PURE function. The service takes an INJECTED id generator
//   (idGen: () => string) and a fixed `now` string — no Math.random / Date.now.
//   InMemoryRegistryStore is insertion-ordered, so resolve() is deterministic.
//
// TRUST DISCIPLINE — DUPLICATES ARE PROPOSED, NEVER AUTO-MERGED:
//   resolve() only PROPOSES scored match candidates for review. A merge is an
//   explicit, append-only, human/caller action (applyMerge records who + a
//   when-ref). The registry never silently collapses two objects (RFC-10004).
//
// ERASABLE-ONLY TS: no enums, no parameter properties, no namespaces; type-only
// imports use `import type`. Safe under `node` type-stripping.

import type { Plane, Visibility } from "@/core/truth/types";

// ---------------------------------------------------------------------------
// Public contracts
// ---------------------------------------------------------------------------

/** A provider / system identifier for a canonical object, e.g. { system: "ncua_charter", value: "60441" }. */
export interface ExternalId {
  system: string;
  value: string;
  /**
   * Whether this external id actually IDENTIFIES the object (a true key like an
   * NCUA charter), vs. a merely-shared, non-identifying attribute (e.g.
   * { system: "state", value: "CA" }). Defaults to true when omitted — existing
   * callers are unaffected. A non-identifying id ({@link ExternalId} with
   * `is_identifier: false`) never contributes a `shared_external_id` match signal,
   * so it cannot propose a spurious duplicate. (DEBUG_LOG resolver guard.)
   */
  is_identifier?: boolean;
}

/** An external id counts for identity matching unless explicitly flagged otherwise. */
function isIdentifying(e: ExternalId): boolean {
  return e.is_identifier !== false;
}

/** The input to register a canonical object. Identity is assigned by the service. */
export interface CanonicalObjectInput {
  /** "<domain>:<slug>", e.g. "entity:coop_markets:credit_union" | "regulation:ncua:section". */
  object_class: string;
  /** Normalized blocking key (lowercase, no punctuation). */
  canonical_slug: string;
  display_name: string;
  plane: Plane;
  visibility: Visibility;
  /** WHERE the object's data lives (storage-dynamic per class). Defaults to "typed_table". */
  storage?: "typed_table" | "object_store" | "external";
  /** Typed table name when storage = "typed_table" (e.g. "entities"). */
  source_table?: string;
  /** Row id in source_table. */
  object_ref?: string;
  external_ids?: ExternalId[];
  aliases?: string[];
}

/** A registered canonical object — the identity row, once assigned an id + lineage state. */
export interface CanonicalObject extends CanonicalObjectInput {
  id: string;
  status: "active" | "merged";
  /** Survivor pointer once this object has been merged away; null while active. */
  merged_into_id: string | null;
  created_at: string;
}

/** A PROPOSED duplicate pair (the dedup review queue). Never a merge on its own. */
export interface MatchCandidate {
  left_id: string;
  right_id: string;
  /** 0..1 additive score. */
  score: number;
  /** e.g. ["shared_external_id:ncua_charter", "slug_exact", "alias_overlap"]. */
  reasons: string[];
  status: "proposed" | "confirmed" | "rejected";
}

/** An append-only merge lineage record — who merged what, and when-ref. */
export interface MergeRecord {
  surviving_object_id: string;
  merged_object_id: string;
  /** "user:<id>". */
  by: string;
  decision_ref?: string;
  created_at: string;
}

/**
 * The persistence seam. InMemory today; a Supabase adapter implements this port
 * post 0016+0017 with no change to ObjectRegistryService.
 */
export interface RegistryPersistencePort {
  put(o: CanonicalObject): void;
  get(id: string): CanonicalObject | undefined;
  all(): CanonicalObject[];
  putCandidate(c: MatchCandidate): void;
  candidates(): MatchCandidate[];
  putMerge(m: MergeRecord): void;
  merges(): MergeRecord[];
}

// ---------------------------------------------------------------------------
// In-memory adapter (deterministic, insertion-ordered)
// ---------------------------------------------------------------------------

/**
 * Deterministic in-memory implementation of the persistence port. Objects are
 * keyed by id but iteration preserves INSERTION ORDER so resolve() output is
 * stable. Candidates are keyed by the unordered pair so re-proposing a pair
 * upserts rather than duplicating (mirrors object_match_candidates_pair_uniq).
 */
export class InMemoryRegistryStore implements RegistryPersistencePort {
  private objectsById: Map<string, CanonicalObject>;
  private candidatesByPair: Map<string, MatchCandidate>;
  private mergeLog: MergeRecord[];

  constructor() {
    this.objectsById = new Map<string, CanonicalObject>();
    this.candidatesByPair = new Map<string, MatchCandidate>();
    this.mergeLog = [];
  }

  put(o: CanonicalObject): void {
    this.objectsById.set(o.id, o);
  }

  get(id: string): CanonicalObject | undefined {
    return this.objectsById.get(id);
  }

  all(): CanonicalObject[] {
    return Array.from(this.objectsById.values());
  }

  putCandidate(c: MatchCandidate): void {
    this.candidatesByPair.set(pairKey(c.left_id, c.right_id), c);
  }

  candidates(): MatchCandidate[] {
    return Array.from(this.candidatesByPair.values());
  }

  putMerge(m: MergeRecord): void {
    this.mergeLog.push(m);
  }

  merges(): MergeRecord[] {
    return this.mergeLog.slice();
  }
}

// ---------------------------------------------------------------------------
// Pure scoring
// ---------------------------------------------------------------------------

/** Unordered-pair key with a stable ordering (left_id < right_id). */
function pairKey(a: string, b: string): string {
  return a < b ? a + "|" + b : b + "|" + a;
}

/** Case-insensitive, punctuation/whitespace-insensitive normalizer for aliases. */
function normalizeAlias(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

/**
 * PURE scoring helper, exported for tests/gate. Additive, capped at 1.0. Emits a
 * reason per signal. `object_class` equality is a PREREQUISITE handled by the
 * caller (resolve); scoreMatch only combines the identity signals:
 *   - shared external id (same system + value) => +0.6, "shared_external_id:<system>"
 *   - exact canonical_slug match               => +0.5, "slug_exact"
 *   - alias overlap (case-insensitive)         => +0.25, "alias_overlap"
 */
export function scoreMatch(
  a: CanonicalObject,
  b: CanonicalObject,
): { score: number; reasons: string[] } {
  const reasons: string[] = [];
  let score = 0;

  // Shared external ids — strong signal, but ONLY for IDENTIFYING ids (a shared
  // non-identifying attribute like {system:"state"} must not propose a duplicate).
  // Deterministic order: scan a's ids and emit one reason per matching system.
  const bIds = (b.external_ids ?? []).filter(isIdentifying);
  const sharedSystems: string[] = [];
  for (const ext of (a.external_ids ?? []).filter(isIdentifying)) {
    const hit = bIds.some(
      (o) => o.system === ext.system && o.value === ext.value,
    );
    if (hit && !sharedSystems.includes(ext.system)) {
      sharedSystems.push(ext.system);
    }
  }
  for (const system of sharedSystems.slice().sort()) {
    score += 0.6;
    reasons.push("shared_external_id:" + system);
  }

  // Exact canonical slug match.
  if (a.canonical_slug.length > 0 && a.canonical_slug === b.canonical_slug) {
    score += 0.5;
    reasons.push("slug_exact");
  }

  // Alias overlap (case-insensitive). display_name participates as an implicit
  // alias so two rows naming the same thing can overlap even without explicit aliases.
  const aAliases = new Set<string>(
    [a.display_name, ...(a.aliases ?? [])].map(normalizeAlias),
  );
  const bAliases = new Set<string>(
    [b.display_name, ...(b.aliases ?? [])].map(normalizeAlias),
  );
  let aliasOverlap = false;
  for (const alias of aAliases) {
    if (alias.length > 0 && bAliases.has(alias)) {
      aliasOverlap = true;
      break;
    }
  }
  if (aliasOverlap) {
    score += 0.25;
    reasons.push("alias_overlap");
  }

  if (score > 1) score = 1;
  return { score, reasons };
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

/** Only candidates scoring at or above this threshold are proposed. */
const PROPOSE_THRESHOLD = 0.5;

export interface RegistryServiceOptions {
  /** Injected id generator — no Math.random. */
  idGen: () => string;
  /** Fixed clock reference — no Date.now. */
  now: string;
}

/**
 * The Object Registry service. Registers canonical objects, PROPOSES scored
 * duplicate candidates (never merges), and applies explicit append-only merges.
 */
export class ObjectRegistryService {
  private store: RegistryPersistencePort;
  private idGen: () => string;
  private now: string;

  constructor(store: RegistryPersistencePort, opts: RegistryServiceOptions) {
    this.store = store;
    this.idGen = opts.idGen;
    this.now = opts.now;
  }

  /**
   * Register a canonical object. Assigns id via idGen, defaults storage to
   * "typed_table", stamps created_at = opts.now, and starts life active.
   */
  register(input: CanonicalObjectInput): CanonicalObject {
    const object: CanonicalObject = {
      object_class: input.object_class,
      canonical_slug: input.canonical_slug,
      display_name: input.display_name,
      plane: input.plane,
      visibility: input.visibility,
      storage: input.storage ?? "typed_table",
      source_table: input.source_table,
      object_ref: input.object_ref,
      external_ids: input.external_ids ? input.external_ids.slice() : undefined,
      aliases: input.aliases ? input.aliases.slice() : undefined,
      id: this.idGen(),
      status: "active",
      merged_into_id: null,
      created_at: this.now,
    };
    this.store.put(object);
    return object;
  }

  /**
   * Scan ACTIVE objects and propose scored match candidates for likely
   * duplicates. Blocking: only pairs sharing an external id OR an exact slug are
   * scored (and only within the SAME object_class — different classes never
   * proposed). Deterministic pair ordering (left_id < right_id), de-duped.
   * Persists proposed candidates and returns them. NEVER merges.
   */
  resolve(): MatchCandidate[] {
    const active = this.store.all().filter((o) => o.status === "active");
    const proposed: MatchCandidate[] = [];
    const seen = new Set<string>();

    for (let i = 0; i < active.length; i++) {
      for (let j = i + 1; j < active.length; j++) {
        const a = active[i];
        const b = active[j];

        // object_class equality is a prerequisite.
        if (a.object_class !== b.object_class) continue;

        // Blocking: a shared external id OR an exact canonical slug.
        if (!sharesExternalId(a, b) && !sharesSlug(a, b)) continue;

        const { score, reasons } = scoreMatch(a, b);
        if (score < PROPOSE_THRESHOLD) continue;

        // Deterministic ordering + de-dup by unordered pair.
        const left = a.id < b.id ? a.id : b.id;
        const right = a.id < b.id ? b.id : a.id;
        const key = pairKey(left, right);
        if (seen.has(key)) continue;
        seen.add(key);

        const candidate: MatchCandidate = {
          left_id: left,
          right_id: right,
          score,
          reasons,
          status: "proposed",
        };
        this.store.putCandidate(candidate);
        proposed.push(candidate);
      }
    }

    return proposed;
  }

  /**
   * Apply an EXPLICIT merge (human/caller decision). Marks the merged object
   * status "merged" + merged_into_id = survivor, and appends a MergeRecord.
   * Idempotent-safe: re-applying an already-recorded merge does not double-log
   * and does not re-mutate.
   */
  applyMerge(
    survivingId: string,
    mergedId: string,
    by: string,
    decisionRef?: string,
  ): MergeRecord {
    if (survivingId === mergedId) {
      throw new Error("applyMerge: survivor and merged object must differ");
    }
    const survivor = this.store.get(survivingId);
    if (!survivor) {
      throw new Error("applyMerge: unknown surviving object " + survivingId);
    }
    const merged = this.store.get(mergedId);
    if (!merged) {
      throw new Error("applyMerge: unknown merged object " + mergedId);
    }

    // LIVENESS GUARD (DEBUG_LOG): the append-only lineage must stay consistent.
    //  (a) A survivor that is ITSELF merged is not a live root — resolve to its
    //      ultimate active survivor so a chain never records a stale survivor.
    //  (b) A merged object may not be re-merged into a DIFFERENT survivor
    //      (contradictory), which would fork its lineage. (Re-merging into the
    //      SAME survivor is idempotent — handled below.)
    const root = this.ultimateSurvivor(survivingId);
    if (root.id === mergedId) {
      throw new Error("applyMerge: cannot merge an object into itself (transitively)");
    }
    if (
      merged.status === "merged" &&
      merged.merged_into_id !== null &&
      merged.merged_into_id !== root.id
    ) {
      throw new Error(
        "applyMerge: " + mergedId + " is already merged into " + merged.merged_into_id +
          "; refusing a contradictory re-merge into " + root.id,
      );
    }
    const effectiveSurvivorId = root.id;

    // Idempotent-safe: if this exact lineage edge already exists, return it.
    const existing = this.store
      .merges()
      .find(
        (m) =>
          m.surviving_object_id === effectiveSurvivorId &&
          m.merged_object_id === mergedId,
      );
    if (existing) return existing;

    if (merged.status !== "merged" || merged.merged_into_id !== effectiveSurvivorId) {
      const updated: CanonicalObject = {
        ...merged,
        status: "merged",
        merged_into_id: effectiveSurvivorId,
      };
      this.store.put(updated);
    }

    const record: MergeRecord = {
      surviving_object_id: effectiveSurvivorId,
      merged_object_id: mergedId,
      by,
      decision_ref: decisionRef,
      created_at: this.now,
    };
    this.store.putMerge(record);
    return record;
  }

  /**
   * Walk an object's merge chain to its ultimate ACTIVE survivor (the live root).
   * Returns the object itself when it is active. Guards against a cycle in the
   * append-only lineage (which the contradictory-re-merge guard prevents, but we
   * fail loudly rather than loop if the store is ever inconsistent).
   */
  private ultimateSurvivor(id: string): CanonicalObject {
    const seen = new Set<string>();
    let cur = this.store.get(id);
    if (!cur) throw new Error("ultimateSurvivor: unknown object " + id);
    while (cur.status === "merged" && cur.merged_into_id !== null) {
      if (seen.has(cur.id)) {
        throw new Error("ultimateSurvivor: merge cycle detected at " + cur.id);
      }
      seen.add(cur.id);
      const next = this.store.get(cur.merged_into_id);
      if (!next) break;
      cur = next;
    }
    return cur;
  }

  objects(): CanonicalObject[] {
    return this.store.all();
  }

  candidates(): MatchCandidate[] {
    return this.store.candidates();
  }

  merges(): MergeRecord[] {
    return this.store.merges();
  }
}

// ---------------------------------------------------------------------------
// Blocking predicates (module-private)
// ---------------------------------------------------------------------------

function sharesExternalId(a: CanonicalObject, b: CanonicalObject): boolean {
  // Only IDENTIFYING external ids block a pair for scoring (mirrors scoreMatch).
  const bIds = (b.external_ids ?? []).filter(isIdentifying);
  for (const ext of (a.external_ids ?? []).filter(isIdentifying)) {
    if (bIds.some((o) => o.system === ext.system && o.value === ext.value)) {
      return true;
    }
  }
  return false;
}

function sharesSlug(a: CanonicalObject, b: CanonicalObject): boolean {
  return a.canonical_slug.length > 0 && a.canonical_slug === b.canonical_slug;
}
