// core/profile/freshness.ts
//
// Dispatch OS — Profile FRESHNESS policy (Volume III: Knowledge Graph & Truth,
// RFC-3008 / RFC-3012). The decay-over-freshness driver that turns "how old is
// this fact" into the `ageDays` + `halfLifeDays` the Confidence Engine's
// {@link decay} consumes — so a profile assembled today TRUSTS a stale filing
// less than a fresh one, by an explicit, defensible rule rather than a magic 0.9.
//
// UNIVERSALITY (CLAUDE.md): this file lives in core/ and names NO vertical
// concept. It never mentions credit unions, 5300s, regulators, or any domain
// noun. It reasons purely over a truth {@link TruthTier} and two ISO instants
// the caller injects (`observed_at` and an `as_of`). The same policy ages a
// lender fact, a regulation observation, or a vendor claim without a line
// changing.
//
// TRUTH DISCIPLINE (DOCTRINE): freshness is not a hunch. Age is the exact number
// of days between the two injected instants; the half-life is a stated per-tier
// policy constant (a durable, human-approved conclusion decays far slower than a
// model inference); the freshness scalar is the SAME `decay` curve the engine
// uses everywhere (freshness = decay(1, age, halfLife)), so a field's freshness
// and its post-decay confidence move together and can be recomputed and audited.
//
// PURE + DETERMINISTIC: no Date.now, no Math.random, no I/O. Every instant is
// passed IN. Same inputs → byte-identical output. Freshness is clamped to [0,1].

import type { TruthTier } from "@/core/truth/types";
import { decay } from "@/core/truth/confidence";

// ---------------------------------------------------------------------------
// Per-tier half-life policy
// ---------------------------------------------------------------------------

/**
 * Days after which a fact of a given tier is HALF as trustworthy on age alone.
 *
 * Rationale (durable → volatile): a human-approved conclusion or an institution-
 * verified fact is a signed, durable act and decays over years; a deterministic
 * calculation over a periodic filing goes stale as the next period supersedes it
 * (~a year); a public fact (e.g. published regulation text) is durable but does
 * revise; a private tenant fact ages on the tenant's own cadence; a model
 * inference or an unverified third-party claim goes stale fast (months). These
 * are POLICY constants — auditable, adjustable in one place, never per-call magic.
 */
export const DEFAULT_HALF_LIFE_DAYS: Record<TruthTier, number> = {
  human_approved_conclusion: 3650, // ~10y — a signed conclusion is durable
  institution_verified_fact: 1825, // ~5y — confirmed by the institution of record
  public_fact: 1095, // ~3y — durable but revises (e.g. regulation text)
  private_tenant_fact: 730, // ~2y — the tenant's own recorded fact
  deterministic_calculation: 365, // ~1y — superseded by the next period's filing
  third_party_claim: 180, // ~6mo — unverified outside assertion
  dispatch_inference: 90, // ~3mo — a model/heuristic guess goes stale fastest
};

/** Half-life (days) for a tier, from the policy. Unknown tiers fall back to 365. */
export function halfLifeForTier(tier: TruthTier): number {
  const h = DEFAULT_HALF_LIFE_DAYS[tier];
  return h !== undefined && Number.isFinite(h) && h > 0 ? h : 365;
}

// ---------------------------------------------------------------------------
// Age
// ---------------------------------------------------------------------------

const MS_PER_DAY = 86_400_000;

/**
 * Whole/fractional days from `observedAt` to `asOf` (both ISO instants).
 *
 * Deterministic — both instants are injected, never read from a clock. A future
 * observation (observedAt after asOf) or an unparseable instant yields 0 (no
 * negative age; a not-yet-observed fact is treated as brand new, not aged), so a
 * bad input can never manufacture spurious decay.
 */
export function ageDaysBetween(observedAt: string, asOf: string): number {
  const t0 = Date.parse(observedAt);
  const t1 = Date.parse(asOf);
  if (!Number.isFinite(t0) || !Number.isFinite(t1)) return 0;
  const days = (t1 - t0) / MS_PER_DAY;
  return days > 0 ? days : 0;
}

// ---------------------------------------------------------------------------
// Freshness scalar + band
// ---------------------------------------------------------------------------

/** Coarse freshness label (mirrors the profile health banding style). */
export type FreshnessBand = "fresh" | "aging" | "stale";

/**
 * Band a freshness scalar (0..1) into a coarse label.
 *   fresh — >= 0.66 (younger than ~0.6 half-lives)
 *   aging — >= 0.33 (roughly the first-to-second half-life window)
 *   stale — otherwise (older than ~1.6 half-lives)
 */
export function freshnessBand(freshness: number): FreshnessBand {
  if (!Number.isFinite(freshness)) return "stale";
  if (freshness >= 0.66) return "fresh";
  if (freshness >= 0.33) return "aging";
  return "stale";
}

/** The full freshness read for one fact. */
export interface FreshnessAssessment {
  /** Days from observed_at to as_of (>= 0). */
  age_days: number;
  /** Half-life (days) applied. */
  half_life_days: number;
  /** Freshness scalar in [0,1] = decay(1, age, halfLife). */
  freshness: number;
  /** Coarse band derived from `freshness`. */
  band: FreshnessBand;
}

/**
 * Assess a fact's freshness from its observed instant, an as-of instant, and an
 * explicit half-life. `freshness` reuses the Confidence Engine's {@link decay}
 * on a unit prior, so the same age+half-life that decays a field's confidence
 * also produces its freshness — one curve, one source of truth.
 */
export function assessFreshness(
  observedAt: string,
  asOf: string,
  halfLifeDays: number,
): FreshnessAssessment {
  const age_days = ageDaysBetween(observedAt, asOf);
  const half_life_days =
    Number.isFinite(halfLifeDays) && halfLifeDays > 0 ? halfLifeDays : 365;
  const freshness = decay(1, age_days, half_life_days);
  return { age_days, half_life_days, freshness, band: freshnessBand(freshness) };
}

/**
 * Convenience: assess freshness picking the half-life from the fact's tier
 * policy (the common path — callers that don't override a half-life use this).
 */
export function assessFreshnessForTier(
  observedAt: string,
  asOf: string,
  tier: TruthTier,
): FreshnessAssessment {
  return assessFreshness(observedAt, asOf, halfLifeForTier(tier));
}
