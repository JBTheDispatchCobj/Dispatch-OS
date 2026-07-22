// core/registry/resolver.ts
//
// MATURED entity resolution for the Object Registry (Volume X; RFC-3002 model /
// RFC-2003 service; the RFC-10004 index/resolution subset). This GROWS the
// resolver beyond the service's built-in shared-external-id / exact-slug pass
// (core/registry/service.ts::resolve) with:
//
//   1. BLOCKING KEYS — candidate pairs are generated only from shared blocking
//      buckets (identifying external id, exact canonical slug, and normalized
//      name/alias TOKENS), so we never score the full O(n²) cross-product.
//   2. DETERMINISTIC SIMILARITY — on top of the service's PURE {@link scoreMatch}
//      (external id / slug / alias-overlap), a token-level name/alias similarity
//      (Jaccard over normalized tokens) contributes an additional, bounded,
//      reason-carrying signal. No floats-from-randomness; same input → same score.
//   3. NO-CLOBBER (the DEBUG_LOG DEFERRED resolver note, resolved here) — a
//      re-proposal must NOT overwrite a candidate a human already REVIEWED. A pair
//      whose existing candidate is `confirmed` or `rejected` is STICKY: it is
//      never re-proposed. A pair where either object has been MERGED away is
//      likewise skipped (already resolved). Only genuinely-new pairs (or pairs
//      still `proposed`) are (re-)proposed.
//
// PROPOSE-ONLY (RFC-10004). Like the service, this NEVER auto-merges. It only
// proposes scored match candidates for human review; a merge stays an explicit,
// append-only, authorized action (see core/registry/governed_registry.ts).
//
// ADDITIVE. This does NOT modify ObjectRegistryService or its InMemory store —
// it composes them. `service.resolve()` (the shared-external-id pass the DATA
// step exercises) is unchanged; this is the matured path the REGISTRY-PERSISTENCE
// step + the governed runtime use.
//
// UNIVERSALITY (CLAUDE.md): core/, so NO vertical noun. The corporate-designator
// STOPWORDS a caller wants ignored during token similarity (e.g. "fcu", "credit",
// "union") are INJECTED as config-as-data — this module hardcodes none.
//
// PURE / DETERMINISTIC: no clock, no random, no I/O. `proposeMatches` is a pure
// function of its inputs; `resolveThroughStore` is the thin persistence wrapper.
//
// ERASABLE-ONLY TS: no enums, no parameter properties, no namespaces; `import type`
// for type-only imports. Safe under `node` native type-stripping.

import type {
  CanonicalObject,
  MatchCandidate,
  ExternalId,
  RegistryPersistencePort,
} from "@/core/registry/service";
import { scoreMatch } from "@/core/registry/service";

// ---------------------------------------------------------------------------
// Options + result shapes
// ---------------------------------------------------------------------------

/** Only candidates scoring at or above this threshold are proposed. */
const DEFAULT_PROPOSE_THRESHOLD = 0.5;
/** Max additional score contributed by token-level name/alias similarity. A
 *  perfect normalized-token match (Jaccard 1.0) reaches the propose threshold on
 *  its own — a charter-less duplicate is still surfaced for HUMAN review (never
 *  auto-merged). */
const NAME_SIMILARITY_WEIGHT = 0.5;
/** Minimum Jaccard for the name-similarity signal to fire at all. */
const DEFAULT_MIN_NAME_JACCARD = 0.5;

export interface ResolverOptions {
  /** Minimum additive score to PROPOSE a pair (default 0.5). */
  propose_threshold?: number;
  /**
   * Minimum token Jaccard for the name-similarity signal (default 0.5). Below
   * this, name similarity contributes nothing (avoids weak-token false pairs).
   */
  min_name_jaccard?: number;
  /**
   * Tokens to DROP before computing name/alias token similarity — the caller's
   * config-as-data list of non-identifying designators (e.g. a cooperative-
   * markets cartridge passes ["fcu","federal","credit","union","cu"] so
   * "Summit Ridge FCU" and "Summit Ridge Federal Credit Union" share the
   * identifying tokens {summit, ridge}). Defaults to none so core/ names no
   * vertical concept.
   */
  stopwords?: string[];
}

/** The outcome of a matured resolution pass. */
export interface ResolveResult {
  /** Newly-proposed (or re-proposed still-`proposed`) candidates, pair-ordered. */
  proposed: MatchCandidate[];
  /** Pair keys skipped because a human already reviewed them (sticky). A merged
   *  object never seeds a pair at all (it is filtered out before blocking), so
   *  there is no separate merged-skip bucket — the active-only filter enforces it. */
  skipped_reviewed: string[];
}

// ---------------------------------------------------------------------------
// Normalization + blocking helpers
// ---------------------------------------------------------------------------

/** Stable, locale-independent total-order compare. */
function cmp(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

/** Unordered-pair key with a stable ordering (min|max). */
function pairKey(a: string, b: string): string {
  return a < b ? a + "|" + b : b + "|" + a;
}

/** An external id counts for identity matching unless explicitly flagged otherwise. */
function isIdentifying(e: ExternalId): boolean {
  return e.is_identifier !== false;
}

/** Lowercase, split on non-alphanumeric, drop the injected stopwords + blanks. */
function nameTokens(o: CanonicalObject, stop: Set<string>): Set<string> {
  const raw = [o.display_name, ...(o.aliases ?? [])].join(" ").toLowerCase();
  const out = new Set<string>();
  for (const tok of raw.split(/[^a-z0-9]+/)) {
    if (tok.length === 0) continue;
    if (stop.has(tok)) continue;
    out.add(tok);
  }
  return out;
}

/** Deterministic Jaccard over two token sets (0 when both empty). */
function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 && b.size === 0) return 0;
  let inter = 0;
  for (const t of a) if (b.has(t)) inter++;
  const union = a.size + b.size - inter;
  return union === 0 ? 0 : inter / union;
}

/** Integer percent (0..100) of a 0..1 ratio, for a stable reason label. */
function pct(x: number): number {
  return Math.round(x * 100);
}

// ---------------------------------------------------------------------------
// Extended, deterministic scoring
// ---------------------------------------------------------------------------

/**
 * Score a pair by composing the service's PURE {@link scoreMatch} (external id /
 * slug / alias-overlap) with a token-level name/alias similarity signal. The
 * name signal fires only when the normalized-token Jaccard clears
 * `min_name_jaccard`, contributes `NAME_SIMILARITY_WEIGHT × jaccard`, and adds a
 * `name_similarity:<pct>` reason. Additive, capped at 1.0, deterministic.
 */
export function scoreMatchExtended(
  a: CanonicalObject,
  b: CanonicalObject,
  opts?: ResolverOptions,
): { score: number; reasons: string[] } {
  const base = scoreMatch(a, b);
  let score = base.score;
  const reasons = base.reasons.slice();

  const stop = new Set((opts?.stopwords ?? []).map((s) => s.toLowerCase()));
  const minJ = opts?.min_name_jaccard ?? DEFAULT_MIN_NAME_JACCARD;
  const j = jaccard(nameTokens(a, stop), nameTokens(b, stop));
  if (j >= minJ) {
    score += NAME_SIMILARITY_WEIGHT * j;
    reasons.push("name_similarity:" + pct(j));
  }

  if (score > 1) score = 1;
  return { score, reasons };
}

// ---------------------------------------------------------------------------
// Blocking — generate candidate pairs from shared buckets (never full O(n²))
// ---------------------------------------------------------------------------

/**
 * Build the set of unordered candidate pair keys from blocking buckets: each
 * identifying external id (`system=value`), each exact canonical slug, and each
 * normalized name/alias token. Two ACTIVE objects of the SAME object_class that
 * co-occur in any bucket become a candidate pair. Deterministic + de-duped.
 */
function blockingPairs(active: CanonicalObject[], stop: Set<string>): string[] {
  const byId = new Map<string, CanonicalObject>();
  for (const o of active) byId.set(o.id, o);

  const buckets = new Map<string, string[]>();
  const add = (key: string, id: string) => {
    const g = buckets.get(key);
    if (g) {
      if (!g.includes(id)) g.push(id);
    } else {
      buckets.set(key, [id]);
    }
  };

  for (const o of active) {
    for (const e of (o.external_ids ?? []).filter(isIdentifying)) {
      add("x:" + e.system + "=" + e.value, o.id);
    }
    if (o.canonical_slug.length > 0) add("s:" + o.canonical_slug, o.id);
    for (const tok of nameTokens(o, stop)) add("t:" + tok, o.id);
  }

  const pairs = new Set<string>();
  for (const ids of buckets.values()) {
    if (ids.length < 2) continue;
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        const a = byId.get(ids[i]);
        const b = byId.get(ids[j]);
        if (!a || !b) continue;
        if (a.object_class !== b.object_class) continue; // class equality is a prerequisite
        pairs.add(pairKey(a.id, b.id));
      }
    }
  }
  return Array.from(pairs).sort(cmp);
}

// ---------------------------------------------------------------------------
// proposeMatches — the pure matured resolution
// ---------------------------------------------------------------------------

/**
 * Propose scored duplicate candidates over `objects`, honoring `existing` review
 * status (NO-CLOBBER). Pure + deterministic. Merged/inactive objects never seed
 * a pair; a pair already reviewed (confirmed/rejected) is left untouched.
 */
export function proposeMatches(input: {
  objects: CanonicalObject[];
  existing?: MatchCandidate[];
  opts?: ResolverOptions;
}): ResolveResult {
  const opts = input.opts;
  const threshold = opts?.propose_threshold ?? DEFAULT_PROPOSE_THRESHOLD;
  const stop = new Set((opts?.stopwords ?? []).map((s) => s.toLowerCase()));

  const active = input.objects.filter((o) => o.status === "active");
  const byId = new Map<string, CanonicalObject>();
  for (const o of active) byId.set(o.id, o);

  // Existing candidate status, keyed by unordered pair (the review memory).
  const existingByPair = new Map<string, MatchCandidate>();
  for (const c of input.existing ?? []) existingByPair.set(pairKey(c.left_id, c.right_id), c);

  const proposed: MatchCandidate[] = [];
  const skipped_reviewed: string[] = [];

  // blockingPairs only ranges over ACTIVE objects, so a merged object never seeds
  // a pair here — the active-only filter above is what enforces "a merged object
  // is already resolved", not a separate skip bucket.
  for (const key of blockingPairs(active, stop)) {
    const [x, y] = key.split("|");
    const a = byId.get(x);
    const b = byId.get(y);
    if (!a || !b) continue;

    // NO-CLOBBER: a human-reviewed pair (confirmed | rejected) is sticky.
    const prior = existingByPair.get(key);
    if (prior && (prior.status === "confirmed" || prior.status === "rejected")) {
      skipped_reviewed.push(key);
      continue;
    }

    const { score, reasons } = scoreMatchExtended(a, b, opts);
    if (score < threshold) continue;

    const left = a.id < b.id ? a.id : b.id;
    const right = a.id < b.id ? b.id : a.id;
    proposed.push({ left_id: left, right_id: right, score, reasons, status: "proposed" });
  }

  return { proposed, skipped_reviewed };
}

// ---------------------------------------------------------------------------
// resolveThroughStore — the thin persistence wrapper (still PROPOSE-only)
// ---------------------------------------------------------------------------

/**
 * Run the matured resolution against a persistence port: read the port's ACTIVE
 * objects + its EXISTING candidates (the review memory), then persist only the
 * genuinely-new / still-proposed candidates (no-clobber). Returns the full
 * {@link ResolveResult}. Never merges.
 */
export function resolveThroughStore(
  store: RegistryPersistencePort,
  opts?: ResolverOptions,
): ResolveResult {
  const result = proposeMatches({
    objects: store.all(),
    existing: store.candidates(),
    opts,
  });
  for (const c of result.proposed) store.putCandidate(c);
  return result;
}
