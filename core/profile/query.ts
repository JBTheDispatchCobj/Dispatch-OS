// core/profile/query.ts
//
// Dispatch OS — Profile QUERY surface (Volume III: Knowledge Graph & Truth,
// RFC-3011/3012). A deterministic filter / rank / lookup layer over assembled
// profiles: the read side of the profile store. Given a set of
// {@link AssembledProfile}s (or their live superset {@link LiveAssembledProfile})
// it answers "which profiles match these criteria, in this order" — by sourced
// field, truth tier, confidence, completeness, health, and freshness.
//
// UNIVERSALITY (CLAUDE.md): core/, so NO vertical noun. It reasons only over the
// generic profile shape (subject_type, fields with key/value/tier/confidence,
// rollup confidence, top_tier, completeness, health). The same surface queries a
// book of institution profiles, a regulation-environment profile, or vendor
// profiles without a line changing.
//
// TRUTH DISCIPLINE (DOCTRINE): a query result is explainable. Every applied
// predicate is reported in `applied` (lineage, not a black-box filter), and a
// tier floor compares against the SAME truth-hierarchy ranking the Confidence
// Engine uses ({@link TIER_RANK}) so "at least a deterministic calculation"
// means exactly the doctrine's grade.
//
// FRESHNESS: a field's POST-DECAY `confidence` (produced by the live assembler)
// FOLDS IN its freshness, so `min_field_confidence` is a COMBINED
// confidence+freshness floor — it screens out fields that are stale OR weakly
// sourced OR contradicted, but it does NOT isolate freshness alone (a durable,
// high-base field can stay above the floor while genuinely aging). When a caller
// needs to filter on freshness INDEPENDENTLY, the per-field freshness scalar/band
// is carried on `LiveAssembledProfile.field_freshness`; a dedicated
// `min_field_freshness` predicate over it is a documented follow-on.
//
// PURE + DETERMINISTIC: no clock, no random, no I/O. Sorting carries an explicit
// `id` tiebreak so the order is a TOTAL order — reproducible regardless of the
// engine's sort stability. Same inputs → identical result.

import type { TruthTier } from "@/core/truth/types";
import { TIER_RANK } from "@/core/truth/confidence";
import type {
  AssembledProfile,
  AssembledProfileField,
  ProfileHealth,
} from "@/core/profile/assemble";

// ---------------------------------------------------------------------------
// Predicates
// ---------------------------------------------------------------------------

/** Comparison operators for a field predicate. */
export type FieldOp = "exists" | "eq" | "gte" | "lte" | "gt" | "lt";

/** A predicate over one sourced field of a profile (matched by `key`). */
export interface FieldPredicate {
  key: string;
  op: FieldOp;
  /** Compared value; omitted for "exists". Numbers compare numerically. */
  value?: number | string;
}

/** How to order the matched profiles. */
export type RankBy =
  | "confidence"
  | "completeness"
  | "health"
  | "field_value"
  | "field_confidence";

/** A profile query: all filters are ANDed; ranking + limit apply after. */
export interface ProfileQuery {
  /** Keep only profiles of this subject_type. */
  subject_type?: string;
  /** Keep profiles whose rollup confidence >= this. */
  min_confidence?: number;
  /** Keep profiles whose top_tier ranks AT LEAST this tier (per TIER_RANK). */
  tier_floor?: TruthTier;
  /** Keep profiles whose completeness >= this. */
  min_completeness?: number;
  /** Keep profiles whose health is in this set. */
  health_in?: ProfileHealth[];
  /** Field predicate(s); every one must match (AND). */
  field?: FieldPredicate | FieldPredicate[];
  /**
   * Keep profiles whose field `key` has POST-DECAY confidence >= `min` — a
   * COMBINED confidence+freshness floor (post-decay confidence folds in base
   * confidence, outcome adjustment, AND freshness; it is not a pure freshness
   * filter — see the file header).
   */
  min_field_confidence?: { key: string; min: number };
  /** Ordering key (default "confidence"). */
  rank_by?: RankBy;
  /** Field key for "field_value" / "field_confidence" ranking. */
  rank_field_key?: string;
  /** Direction (default "desc"). */
  dir?: "asc" | "desc";
  /** Cap the number of matched profiles returned (applied after ranking). */
  limit?: number;
}

/** The explainable result of a query. */
export interface ProfileQueryResult {
  /** Matched profiles, ranked + limited. */
  matched: AssembledProfile[];
  /** How many matched BEFORE `limit` (so a caller sees a truncation happened). */
  total: number;
  /** Human-readable list of the predicates actually applied (lineage). */
  applied: string[];
}

// ---------------------------------------------------------------------------
// Lookup
// ---------------------------------------------------------------------------

/** Find a profile field by key; null if absent. First match wins (keys unique). */
export function lookupField(
  profile: AssembledProfile,
  key: string,
): AssembledProfileField | null {
  for (const f of profile.fields) {
    if (f.key === key) return f;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Field predicate evaluation
// ---------------------------------------------------------------------------

function compareNumeric(a: number, b: number, op: FieldOp): boolean {
  switch (op) {
    case "eq":
      return a === b;
    case "gte":
      return a >= b;
    case "lte":
      return a <= b;
    case "gt":
      return a > b;
    case "lt":
      return a < b;
    default:
      return false;
  }
}

/**
 * Coerce a field/predicate value to a finite number, or NaN if it isn't one.
 * A blank/whitespace-only string is NaN (NOT 0 — `Number("")` is a footgun that
 * would let an empty field spuriously satisfy `>= 0`), and a non-numeric string
 * is NaN. This is the single numeric-intent gate the predicate + ranker share.
 */
function toNum(v: number | string): number {
  if (typeof v === "number") return Number.isFinite(v) ? v : NaN;
  const t = v.trim();
  if (t === "") return NaN;
  const n = Number(t);
  return Number.isFinite(n) ? n : NaN;
}

/**
 * Evaluate one field predicate against a profile. "exists" is true when the
 * field is present. Numeric intent is chosen by the OPERATOR, not by the target's
 * JS type: ordering ops (gte/gt/lte/lt) always compare numerically — a numeric
 * STRING threshold (e.g. `{op:"gte", value:"7"}`, as query params arrive) works —
 * and fail closed when either side isn't a finite number. "eq" compares
 * numerically when BOTH sides are numeric, else falls back to string equality
 * (so a status field like "clear" still matches). A missing field matches nothing.
 */
export function matchesFieldPredicate(
  profile: AssembledProfile,
  pred: FieldPredicate,
): boolean {
  const f = lookupField(profile, pred.key);
  if (f === null) return false;
  if (pred.op === "exists") return true;
  if (pred.value === undefined) return false;

  // Ordering ops are numeric by definition — coerce both sides, fail closed.
  if (pred.op === "gte" || pred.op === "gt" || pred.op === "lte" || pred.op === "lt") {
    const fv = toNum(f.value);
    const pv = toNum(pred.value);
    if (!Number.isFinite(fv) || !Number.isFinite(pv)) return false;
    return compareNumeric(fv, pv, pred.op);
  }
  // eq: numeric when both coerce cleanly, else exact string equality.
  const fvn = toNum(f.value);
  const pvn = toNum(pred.value);
  if (Number.isFinite(fvn) && Number.isFinite(pvn)) return fvn === pvn;
  return String(f.value) === String(pred.value);
}

// ---------------------------------------------------------------------------
// Ranking
// ---------------------------------------------------------------------------

const HEALTH_RANK: Record<ProfileHealth, number> = {
  thin: 1,
  adequate: 2,
  strong: 3,
};

/**
 * The scalar a profile is ranked by, per the query. Returns `null` when the
 * ranked FIELD is absent or non-numeric (field_value / field_confidence with no
 * such field, or no rank_field_key) — the ranker then sinks it to the losing end
 * for BOTH directions, rather than letting a sentinel float to the top on `asc`.
 * The non-field ranks always yield a number.
 */
function rankScalar(p: AssembledProfile, q: ProfileQuery): number | null {
  switch (q.rank_by) {
    case "completeness":
      return p.completeness;
    case "health":
      return HEALTH_RANK[p.health];
    case "field_value": {
      if (!q.rank_field_key) return null;
      const f = lookupField(p, q.rank_field_key);
      if (!f) return null;
      const v = toNum(f.value);
      return Number.isFinite(v) ? v : null;
    }
    case "field_confidence": {
      if (!q.rank_field_key) return null;
      const f = lookupField(p, q.rank_field_key);
      return f ? f.confidence : null;
    }
    case "confidence":
    default:
      return p.confidence;
  }
}

/**
 * Rank profiles by the query's `rank_by` (default "confidence") and `dir`
 * (default "desc"), with a TOTAL-ORDER tiebreak on `id` ascending so the result
 * is deterministic regardless of the sort engine's stability. Profiles missing
 * the ranked field are pushed to the LOSING end in both directions (never floated
 * to the top on `asc`). Does not mutate the input (sorts a copy).
 */
export function rankProfiles(
  profiles: AssembledProfile[],
  q: ProfileQuery,
): AssembledProfile[] {
  const dir = q.dir === "asc" ? 1 : -1;
  const idTie = (a: AssembledProfile, b: AssembledProfile) =>
    a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
  return [...profiles].sort((a, b) => {
    const sa = rankScalar(a, q);
    const sb = rankScalar(b, q);
    const am = sa === null;
    const bm = sb === null;
    if (am && bm) return idTie(a, b);
    if (am) return 1; // a is missing the rank field → after b, regardless of dir
    if (bm) return -1; // b is missing → after a
    if (sa !== sb) return sa < sb ? -dir : dir;
    return idTie(a, b); // total-order tiebreak, id ascending (independent of dir)
  });
}

// ---------------------------------------------------------------------------
// queryProfiles
// ---------------------------------------------------------------------------

function tierMeetsFloor(top: TruthTier | null, floor: TruthTier): boolean {
  if (top === null) return false;
  const tr = TIER_RANK[top];
  const fr = TIER_RANK[floor];
  if (tr === undefined || fr === undefined) return false;
  return tr >= fr;
}

/**
 * Filter → rank → limit a set of assembled profiles. Every active predicate is
 * recorded in `applied` for explainability; `total` is the match count before
 * `limit`. Pure/deterministic.
 */
export function queryProfiles(
  profiles: AssembledProfile[],
  q: ProfileQuery,
): ProfileQueryResult {
  const applied: string[] = [];
  const preds = q.field
    ? Array.isArray(q.field)
      ? q.field
      : [q.field]
    : [];

  const filtered = (profiles ?? []).filter((p) => {
    if (q.subject_type !== undefined && p.subject_type !== q.subject_type) return false;
    if (q.min_confidence !== undefined && p.confidence < q.min_confidence) return false;
    if (q.tier_floor !== undefined && !tierMeetsFloor(p.top_tier, q.tier_floor)) return false;
    if (q.min_completeness !== undefined && p.completeness < q.min_completeness) return false;
    if (q.health_in !== undefined && !q.health_in.includes(p.health)) return false;
    if (q.min_field_confidence !== undefined) {
      const f = lookupField(p, q.min_field_confidence.key);
      if (!f || f.confidence < q.min_field_confidence.min) return false;
    }
    for (const pred of preds) {
      if (!matchesFieldPredicate(p, pred)) return false;
    }
    return true;
  });

  // Record applied predicates (deterministic order).
  if (q.subject_type !== undefined) applied.push(`subject_type=${q.subject_type}`);
  if (q.min_confidence !== undefined) applied.push(`min_confidence>=${q.min_confidence}`);
  if (q.tier_floor !== undefined) applied.push(`tier_floor>=${q.tier_floor}`);
  if (q.min_completeness !== undefined) applied.push(`min_completeness>=${q.min_completeness}`);
  if (q.health_in !== undefined) applied.push(`health_in=[${q.health_in.join(",")}]`);
  if (q.min_field_confidence !== undefined)
    applied.push(`field_confidence(${q.min_field_confidence.key})>=${q.min_field_confidence.min}`);
  for (const pred of preds)
    applied.push(`field ${pred.key} ${pred.op}${pred.value !== undefined ? ` ${pred.value}` : ""}`);
  applied.push(`rank ${q.rank_by ?? "confidence"} ${q.dir ?? "desc"}`);

  const ranked = rankProfiles(filtered, q);
  const total = ranked.length;
  const matched =
    q.limit !== undefined && q.limit >= 0 ? ranked.slice(0, q.limit) : ranked;

  return { matched, total, applied };
}
