// core/truth/confidence.ts
//
// Dispatch OS — the Confidence Engine (Volume III: Knowledge Graph & Truth,
// RFC-3008).
//
// Deterministic, explainable operations over the scalar `confidence` (0..1)
// that rides on every {@link Provenance} envelope, made truth-tier aware.
//
// TRUTH DISCIPLINE (CLAUDE.md / DOCTRINE): confidence is NEVER a black box.
// It is a number the system can defend — traceable to the sources that fed it,
// decayed by explicit age, combined by a stated rule, and annotated with the
// highest truth tier in its lineage. Nothing here reaches for a clock or a
// random source: every time/age is passed IN as a number so the same inputs
// always yield the same output and the result can be recomputed and audited.
//
// Implements:
//   - RFC-3008 Confidence Engine: decay / propagate / reinforce / roll-up.
//   - Truth hierarchy awareness via {@link TruthTier} (a combined confidence
//     always reports the most authoritative tier that contributed to it).
//
// Pure functions only. No external deps. No Date.now / Math.random. All
// outputs are clamped to [0,1].

import type { TruthTier } from "@/core/truth/types";

// ---------------------------------------------------------------------------
// Clamp helper (all public outputs pass through this)
// ---------------------------------------------------------------------------

/**
 * Clamp any number into the closed confidence interval [0,1].
 * NaN and non-finite inputs collapse to 0 so a bad upstream value can never
 * silently poison a roll-up with an out-of-range or undefined confidence.
 */
function clamp01(n: number): number {
  if (!Number.isFinite(n)) return 0;
  if (n < 0) return 0;
  if (n > 1) return 1;
  return n;
}

// ---------------------------------------------------------------------------
// decay
// ---------------------------------------------------------------------------

/**
 * Exponentially decay a confidence toward 0 as it ages, using a half-life.
 *
 * Truth-discipline intent: a fact that was true when observed is not
 * automatically true forever. Rather than hard-expire, we let trust erode
 * smoothly so a stale assertion still contributes, just less. After exactly
 * `halfLifeDays` the confidence is halved; after two half-lives, quartered.
 *
 *   result = confidence * 2^(-ageDays / halfLifeDays)
 *
 * @param confidence  current confidence (clamped to 0..1 on the way in).
 * @param ageDays     age of the assertion in days; <= 0 means no decay.
 * @param halfLifeDays days after which confidence halves; <= 0 disables decay
 *                     (returns the input unchanged) to avoid divide-by-zero.
 * @returns decayed confidence clamped to [0,1].
 */
export function decay(
  confidence: number,
  ageDays: number,
  halfLifeDays: number,
): number {
  const base = clamp01(confidence);
  if (!Number.isFinite(ageDays) || ageDays <= 0) return base;
  if (!Number.isFinite(halfLifeDays) || halfLifeDays <= 0) return base;
  const factor = Math.pow(2, -ageDays / halfLifeDays);
  return clamp01(base * factor);
}

// ---------------------------------------------------------------------------
// propagate
// ---------------------------------------------------------------------------

/** How parent confidences combine into a child confidence. */
export type PropagateMode = "min" | "product" | "weighted";

/**
 * Combine parent confidences into a single derived confidence.
 *
 * Truth-discipline intent: a conclusion is only as trustworthy as the chain
 * that produced it. The default `min` is deliberately conservative — a
 * derivation cannot be more confident than its weakest link. `product` models
 * independent multiplicative risk (each parent must independently hold).
 * `weighted` is an evidence-weighted average for corroborating sources.
 *
 * @param parents  parent confidences (each clamped to 0..1).
 * @param mode     "min" (default), "product", or "weighted".
 * @param weights  weights for "weighted" mode; normalized to sum 1. Missing,
 *                 mismatched-length, or all-zero weights fall back to a plain
 *                 (equal-weight) average so the call still yields a defined,
 *                 in-range number.
 * @returns combined confidence clamped to [0,1]. Empty `parents` => 0.
 */
export function propagate(
  parents: number[],
  mode: PropagateMode = "min",
  weights?: number[],
): number {
  if (!parents || parents.length === 0) return 0;
  const vals = parents.map(clamp01);

  switch (mode) {
    case "product": {
      const p = vals.reduce((acc, v) => acc * v, 1);
      return clamp01(p);
    }
    case "weighted": {
      const usable =
        weights && weights.length === vals.length
          ? weights.map((w) => (Number.isFinite(w) && w > 0 ? w : 0))
          : vals.map(() => 1);
      const total = usable.reduce((acc, w) => acc + w, 0);
      if (total <= 0) {
        // degenerate weights -> equal-weight average
        const avg = vals.reduce((acc, v) => acc + v, 0) / vals.length;
        return clamp01(avg);
      }
      const sum = vals.reduce((acc, v, i) => acc + v * usable[i], 0);
      return clamp01(sum / total);
    }
    case "min":
    default:
      return clamp01(Math.min(...vals));
  }
}

// ---------------------------------------------------------------------------
// reinforce
// ---------------------------------------------------------------------------

/**
 * Nudge a prior confidence toward certainty (1) or disproof (0) after an
 * observed outcome — a lightweight, Bayesian-flavored update.
 *
 * Truth-discipline intent: confidence should learn from what actually
 * happened, but transparently. Agreement pulls the prior a fraction `weight`
 * of the remaining distance toward 1; disagreement pulls it toward 0. The step
 * is bounded by the gap so it never overshoots, and repeated updates converge
 * monotonically — no hidden momentum, no surprises.
 *
 *   agreed:    prior + weight * (1 - prior)
 *   disagreed: prior - weight * prior
 *
 * @param prior         current confidence (clamped to 0..1).
 * @param outcomeAgreed true if reality confirmed the assertion.
 * @param weight        learning rate in [0,1] (default 0.2); clamped.
 * @returns updated confidence clamped to [0,1].
 */
export function reinforce(
  prior: number,
  outcomeAgreed: boolean,
  weight: number = 0.2,
): number {
  const p = clamp01(prior);
  const w = clamp01(weight);
  const next = outcomeAgreed ? p + w * (1 - p) : p - w * p;
  return clamp01(next);
}

// ---------------------------------------------------------------------------
// Truth-tier precedence
// ---------------------------------------------------------------------------

/**
 * Monotonic authority ranking of the 7 truth tiers (higher = more
 * authoritative). This mirrors {@link TRUTH_TIER_PRECEDENCE} in
 * {@link "@/core/truth/types"} but as a dense 1..7 scale for confidence
 * reporting.
 *
 * Ordering rationale (low -> high):
 *   1 third_party_claim         — an unverified outside assertion; trust least.
 *   2 dispatch_inference        — our own model/heuristic guess; not a fact.
 *   3 public_fact               — faithfully observed from a public source.
 *   4 deterministic_calculation — reproducible from named inputs/method.
 *   5 private_tenant_fact       — a tenant's own recorded fact (scoped truth).
 *   6 institution_verified_fact — confirmed by the institution of record.
 *   7 human_approved_conclusion — a human signed off; the audited top.
 *
 * A combined confidence always advertises the top tier that fed it, so a
 * consumer can see "this rolled-up number was ultimately human-approved" vs
 * "this rests only on a third-party claim."
 */
export const TIER_RANK: Record<TruthTier, number> = {
  third_party_claim: 1,
  dispatch_inference: 2,
  public_fact: 3,
  deterministic_calculation: 4,
  private_tenant_fact: 5,
  institution_verified_fact: 6,
  human_approved_conclusion: 7,
};

/**
 * Return the most authoritative tier in a set per {@link TIER_RANK}.
 *
 * Truth-discipline intent: when many assertions of different grades combine,
 * the result should surface the strongest grade present so downstream callers
 * never under-state the pedigree of a conclusion. Ties resolve to the first
 * seen (all equal-rank tiers are, by construction, the same tier).
 *
 * @param tiers list of contributing tiers.
 * @returns the top tier, or null if the list is empty.
 */
export function topTier(tiers: TruthTier[]): TruthTier | null {
  if (!tiers || tiers.length === 0) return null;
  let best: TruthTier | null = null;
  let bestRank = -Infinity;
  for (const t of tiers) {
    const r = TIER_RANK[t];
    if (r !== undefined && r > bestRank) {
      bestRank = r;
      best = t;
    }
  }
  return best;
}

// ---------------------------------------------------------------------------
// Sourced roll-up (combineSources)
// ---------------------------------------------------------------------------

/**
 * One source feeding a confidence roll-up. Carries its own tier and a
 * `source_ref` so every contribution stays attributable (lineage, not a blob).
 */
export interface ConfidenceInput {
  /** Raw confidence of this source (clamped to 0..1). */
  value: number;
  /** Truth grade of this source. */
  tier: TruthTier;
  /** Traceable reference to the source (source_id / document id / URI). */
  source_ref: string;
  /** Age in days; when set (with a half-life), this source is decayed first. */
  ageDays?: number;
  /** Half-life in days for this source's decay; required for age to apply. */
  halfLifeDays?: number;
}

/**
 * Explainable output of a confidence roll-up. Beyond the scalar `value` it
 * carries the top tier, an ordered lineage of source_refs, and the exact
 * post-decay contribution of every source — the audit trail that keeps the
 * number defensible.
 */
export interface ConfidenceResult {
  /** Final combined confidence, clamped to [0,1]. */
  value: number;
  /** Most authoritative tier that contributed (null if no sources). */
  top_tier: TruthTier | null;
  /** Ordered source_refs that fed the result (provenance chain). */
  lineage: string[];
  /** Per-source breakdown: what each source actually contributed post-decay. */
  factors: { source_ref: string; contributed: number; tier: TruthTier }[];
}

/**
 * Roll up many sourced confidences into one explainable {@link ConfidenceResult}.
 *
 * Truth-discipline intent: this is the sourced-inference roll-up the deal
 * engine and IO layer reuse instead of inventing ad-hoc confidence math. Each
 * source is first decayed by its own age (if `ageDays` + `halfLifeDays` are
 * given), then combined per `mode` via {@link propagate}. The result reports
 * the top contributing tier, the ordered lineage of source_refs, and each
 * source's post-decay contribution — so any consumer can explain precisely
 * where the number came from and how heavily each source weighed.
 *
 * For "weighted" mode, each source's post-decay confidence is used as its own
 * weight (self-weighting): stronger evidence pulls the average toward itself,
 * keeping the roll-up deterministic without an extra weights argument.
 *
 * @param sources the contributing sourced confidences.
 * @param mode    combination rule; "min" (default), "product", or "weighted".
 * @returns an explainable, clamped confidence result. Empty input => value 0,
 *          null top_tier, empty lineage and factors.
 */
export function combineSources(
  sources: ConfidenceInput[],
  mode: PropagateMode = "min",
): ConfidenceResult {
  if (!sources || sources.length === 0) {
    return { value: 0, top_tier: null, lineage: [], factors: [] };
  }

  const factors = sources.map((s) => {
    const decayed =
      s.ageDays !== undefined && s.halfLifeDays !== undefined
        ? decay(s.value, s.ageDays, s.halfLifeDays)
        : clamp01(s.value);
    return { source_ref: s.source_ref, contributed: decayed, tier: s.tier };
  });

  const decayedValues = factors.map((f) => f.contributed);
  const value =
    mode === "weighted"
      ? propagate(decayedValues, "weighted", decayedValues)
      : propagate(decayedValues, mode);

  return {
    value,
    top_tier: topTier(sources.map((s) => s.tier)),
    lineage: sources.map((s) => s.source_ref),
    factors,
  };
}
