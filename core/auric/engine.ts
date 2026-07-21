// core/auric/engine.ts
//
// Auric publication engine core (Volume VI, DOCTRINE publication loop).
//
// This is the RUNNING counterpart to the hand-authored fixture in
// cartridges/cooperative_markets/auric_lens.ts. Where that file demonstrates
// "CEO ≠ CLO" by hand, this module GENERATES the same kind of output from
// sourced truth refs:
//
//   market event → assembleIO() → LensSpec → renderVariant() → buildFeed()
//   (Intelligence Object)         (lens)     (ContentVariant)   (ranked feed)
//
// LOAD-BEARING RULE (DOCTRINE / truth discipline — ADR-0005): a rendered
// variant RESTATES the IO's facts, it never invents new ones. Concretely, a
// variant's `source_refs` are EXACTLY the union of the parent IO's
// fact/claim/inference refs — the same evidence, a different hook. Never a
// superset. This module computes `source_refs` FROM the IO (see
// {@link ioSourceRefs} / {@link renderVariant}); a variant can only ever cite
// the IO's evidence, so the rule is enforced by construction, not by comment.
//
// Purity: this module is PURE and DETERMINISTIC. It never reads the clock or a
// random source — the caller supplies every id and timestamp. Given the same
// inputs it returns byte-identical output, which keeps assembly, rendering, and
// ranking reproducible and auditable.

import type {
  IntelligenceObject,
  IntelligenceObjectStatus,
  ContentVariant,
  LensType,
  ChannelType,
} from "@/core/intelligence/types";
import type { Plane, Visibility, TruthTier } from "@/core/truth/types";
import { TRUTH_TIER_PRECEDENCE } from "@/core/truth/types";

// ---------------------------------------------------------------------------
// IO assembly
// ---------------------------------------------------------------------------

/**
 * Everything the caller must supply to assemble one Intelligence Object. The
 * `*_refs` arrays are ids of truth objects the IO is built FROM (see
 * core/truth/types) — the IO points AT its evidence, it does not embed facts.
 * All ids and timestamps are caller-provided so assembly stays deterministic.
 */
export interface IOAssemblyInput {
  id: string;
  plane: Plane;
  visibility: Visibility;
  kind?: string;
  headline: string;
  summary?: string;
  fact_refs?: string[];
  claim_refs?: string[];
  inference_refs?: string[];
  affected_refs?: string[];
  top_tier?: TruthTier;
  confidence?: number;
  recommended_action?: string;
  created_at: string;
  published_at?: string;
}

/** Clamp a value into [0, 1]; undefined/NaN collapse to 0. */
function clamp01(n: number | undefined | null): number {
  if (typeof n !== "number" || Number.isNaN(n)) return 0;
  if (n < 0) return 0;
  if (n > 1) return 1;
  return n;
}

/** Union the string arrays, dropping duplicates while preserving first-seen order. */
function unionRefs(...groups: (string[] | undefined)[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const group of groups) {
    if (!group) continue;
    for (const ref of group) {
      if (!seen.has(ref)) {
        seen.add(ref);
        out.push(ref);
      }
    }
  }
  return out;
}

/**
 * The canonical evidence set for an IO: the ordered union of its
 * fact/claim/inference refs. This is the ONLY thing a variant may cite in its
 * `source_refs` — the truth-discipline invariant that keeps every published
 * hook traceable back to the same sources.
 */
export function ioSourceRefs(io: IntelligenceObject): string[] {
  return unionRefs(io.fact_refs, io.claim_refs, io.inference_refs);
}

/**
 * Assemble a well-formed {@link IntelligenceObject} from sourced truth refs.
 *
 * Status is "published" when `published_at` is provided, otherwise "assembled"
 * (an IO with sourced components but not yet released). `relevance` gets a
 * small deterministic scoring object derived from the confidence, the top tier
 * precedence, and how much evidence the IO rests on — enough for the feed
 * ranker and audiences to reason about it, with no clock or random input.
 */
export function assembleIO(input: IOAssemblyInput): IntelligenceObject {
  const fact_refs = input.fact_refs ?? [];
  const claim_refs = input.claim_refs ?? [];
  const inference_refs = input.inference_refs ?? [];
  const affected_refs = input.affected_refs ?? [];

  const evidenceCount = fact_refs.length + claim_refs.length + inference_refs.length;
  const confidence = input.confidence ?? null;

  // Deterministic relevance score in [0, 1]: blend confidence (how sure) with a
  // normalized tier precedence (how authoritative the top component is). Both
  // are already declared, cartridge-blind signals.
  const tierWeight = input.top_tier ? TRUTH_TIER_PRECEDENCE[input.top_tier] : 0;
  const tierNorm = tierWeight / 50; // 50 = human_approved_conclusion, the ceiling
  const relevanceScore =
    Math.round((0.6 * clamp01(confidence) + 0.4 * clamp01(tierNorm)) * 1000) / 1000;

  const status: IntelligenceObjectStatus = input.published_at ? "published" : "assembled";

  return {
    id: input.id,
    workspace_id: null, // shared-market IO by default; callers on the private plane override upstream
    plane: input.plane,
    visibility: input.visibility,
    kind: input.kind ?? null,
    headline: input.headline,
    summary: input.summary ?? null,
    fact_refs,
    claim_refs,
    inference_refs,
    affected_refs,
    top_tier: input.top_tier ?? null,
    relevance: {
      score: relevanceScore,
      reason: "computed from component confidence and top-tier precedence",
      evidence_count: evidenceCount,
      top_tier: input.top_tier ?? null,
      confidence,
    },
    confidence,
    recommended_action: input.recommended_action ?? null,
    status,
    published_at: input.published_at ?? null,
    metadata: {},
    created_at: input.created_at,
    updated_at: input.created_at,
  };
}

// ---------------------------------------------------------------------------
// Variant rendering
// ---------------------------------------------------------------------------

/**
 * A lens instruction: HOW to restate the IO for one audience + channel. The
 * caller authors the hook/title/body copy; the engine attaches traceability and
 * the render payload. A LensSpec never carries facts of its own.
 */
export interface LensSpec {
  lens_type: LensType;
  lens_ref?: string;
  channel: ChannelType;
  title: string;
  hook: string;
  body: string;
}

/**
 * Render ONE {@link ContentVariant} from an IO and a lens.
 *
 * TRUTH DISCIPLINE (enforced here, not merely documented): `source_refs` is set
 * to {@link ioSourceRefs}(io) — exactly the IO's fact/claim/inference union.
 * The caller cannot widen it; a variant physically cannot cite evidence the IO
 * does not. Same facts, different hook — never a superset.
 *
 * The variant inherits the IO's visibility and status, and carries the lens
 * metadata plus the IO's confidence/top_tier in `render_payload` so downstream
 * ranking ({@link buildFeed}) can score it without re-reading the IO.
 */
export function renderVariant(
  io: IntelligenceObject,
  lens: LensSpec,
  id: string,
  created_at: string,
): ContentVariant {
  const source_refs = ioSourceRefs(io); // == IO refs, by construction — the load-bearing invariant

  return {
    id,
    intelligence_object_id: io.id,
    lens_type: lens.lens_type,
    lens_ref: lens.lens_ref ?? null,
    channel: lens.channel,
    visibility: io.visibility,
    title: lens.title,
    body: lens.body,
    render_payload: {
      hook: lens.hook,
      lens_type: lens.lens_type,
      lens_ref: lens.lens_ref ?? null,
      // Ranking inputs mirrored from the IO so the feed is a pure function of variants.
      confidence: io.confidence ?? null,
      top_tier: io.top_tier ?? null,
    },
    source_refs,
    generated_by: "system",
    status: io.status,
    created_at,
    updated_at: created_at,
  };
}

/**
 * Render many variants for one IO. `idPrefix` is suffixed with the lens index
 * ("<idPrefix>:0", "<idPrefix>:1", …) so ids stay stable and deterministic for
 * a given lens ordering. Every returned variant shares the IO's `source_refs`.
 */
export function renderVariants(
  io: IntelligenceObject,
  lenses: LensSpec[],
  idPrefix: string,
  created_at: string,
): ContentVariant[] {
  return lenses.map((lens, i) => renderVariant(io, lens, `${idPrefix}:${i}`, created_at));
}

// ---------------------------------------------------------------------------
// Feed ranking
// ---------------------------------------------------------------------------

/**
 * The reader's context for a feed query. `role` selects role-lensed variants;
 * `institution` selects institution-lensed variants; `nowIso` is the reference
 * "now" used for freshness/staleness — compared to timestamps by ISO STRING
 * comparison (ISO-8601 UTC sorts lexicographically), never by parsing a clock.
 */
export interface FeedContext {
  role?: string;
  institution?: string;
  nowIso: string;
}

/**
 * Lens specificity — how narrowly a variant is targeted. More specific lenses
 * win ties because a person/role-tailored restatement beats a generic one for a
 * matched reader. Values are in [0, 1] and feed directly into the score.
 */
const LENS_SPECIFICITY: Record<LensType, number> = {
  person: 1.0,
  role: 0.8,
  institution: 0.6,
  cartridge: 0.4,
  channel: 0.2,
};

// Score weights (documented, sum = 1.0). Confidence dominates (is it true and
// sure?), then freshness (is it live?), then specificity (is it tailored?).
const W_CONFIDENCE = 0.5;
const W_FRESHNESS = 0.3;
const W_SPECIFICITY = 0.2;

/** Read the confidence-ish signal a variant carries in its render_payload. */
function variantConfidence(v: ContentVariant): number {
  const c = v.render_payload?.confidence;
  return typeof c === "number" ? clamp01(c) : 0;
}

/**
 * Does this variant belong in a feed for `ctx`? Keep it when:
 *   - it is a base/cartridge variant (audience-neutral — always eligible), or
 *   - it is role-lensed and its lens_ref matches ctx.role, or
 *   - it is institution-lensed and its lens_ref matches ctx.institution.
 * Person/channel-lensed variants are dropped unless a future ctx targets them.
 */
function matchesContext(v: ContentVariant, ctx: FeedContext): boolean {
  if (v.lens_type === "cartridge") return true;
  if (v.lens_type === "role") return ctx.role != null && v.lens_ref === ctx.role;
  if (v.lens_type === "institution") return ctx.institution != null && v.lens_ref === ctx.institution;
  return false;
}

/**
 * Deterministic feed score in [0, 1] for a variant.
 *
 *   score = 0.5·confidence + 0.3·freshness + 0.2·specificity
 *
 * - confidence: the IO confidence mirrored onto the variant (0 if absent).
 * - freshness: 1.0 when the variant is already live (created_at <= nowIso by
 *   ISO string compare), else 0.0 — future/embargoed variants sink but are not
 *   discarded here (staleness is handled separately). Fine-grained recency
 *   among live variants is applied as a tiebreak in {@link buildFeed}.
 * - specificity: {@link LENS_SPECIFICITY} for the lens.
 */
function scoreVariant(v: ContentVariant, ctx: FeedContext): number {
  const confidence = variantConfidence(v);
  const freshness = v.created_at <= ctx.nowIso ? 1 : 0;
  const specificity = LENS_SPECIFICITY[v.lens_type] ?? 0;
  return W_CONFIDENCE * confidence + W_FRESHNESS * freshness + W_SPECIFICITY * specificity;
}

/**
 * Rank a set of variants into a reader feed for `ctx`. Pure and deterministic.
 *
 * Pipeline:
 *   1. FILTER to variants that match `ctx` ({@link matchesContext}) — base/
 *      cartridge always, plus the reader's role/institution lens.
 *   2. DROP STALE: if `shelfLifeByIoId` maps the variant's parent IO id to a
 *      shelf-life timestamp and that timestamp is <= ctx.nowIso (ISO string
 *      compare), the variant is expired and removed. Unknown/absent shelf life
 *      means "no known expiry" and the variant is kept.
 *   3. SORT by {@link scoreVariant} descending, then by these deterministic
 *      tiebreaks so equal scores never reorder unpredictably:
 *        a. created_at DESCENDING (more recent first — recency via ISO string
 *           compare, per FeedContext), then
 *        b. id ASCENDING (final total order for stability).
 *
 * @param variants  the candidate variants (typically renderVariants output).
 * @param ctx       the reader context (role/institution/now).
 * @param shelfLifeByIoId optional map of IO id → shelf_life_ends_at. Omit it (or
 *   leave an IO unmapped) to skip the staleness check for that IO.
 */
export function buildFeed(
  variants: ContentVariant[],
  ctx: FeedContext,
  shelfLifeByIoId?: Record<string, string | null | undefined>,
): ContentVariant[] {
  const eligible = variants.filter((v) => {
    if (!matchesContext(v, ctx)) return false;
    if (shelfLifeByIoId) {
      const shelf = shelfLifeByIoId[v.intelligence_object_id];
      // Stale when a known shelf life has reached/passed now (ISO string compare).
      if (typeof shelf === "string" && shelf <= ctx.nowIso) return false;
    }
    return true;
  });

  // Copy before sort — never mutate the caller's array (purity).
  return [...eligible].sort((a, b) => {
    const sa = scoreVariant(a, ctx);
    const sb = scoreVariant(b, ctx);
    if (sb !== sa) return sb - sa; // higher score first
    if (a.created_at !== b.created_at) return a.created_at < b.created_at ? 1 : -1; // recent first
    return a.id < b.id ? -1 : a.id > b.id ? 1 : 0; // stable total order
  });
}
