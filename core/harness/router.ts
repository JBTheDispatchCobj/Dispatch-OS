// core/harness/router.ts
//
// Dispatch OS — Agent Harness Volume IV, kernel Model Router (RFC-2013).
//
// The routing CORE: given a task descriptor, deterministically pick the
// CHEAPEST rung of intelligence that can plausibly satisfy it, and decide
// whether a human gate is required. This module contains the router/classifier
// logic ONLY — it makes NO model calls. It is the dispatcher that decides which
// tier of intelligence should run; the tiers themselves live elsewhere.
//
// Constitution Art. 18 / DOCTRINE — "cheapest sufficient intelligence":
//   deterministic rules → small open model → strong open model →
//   frontier model → human expert.
// That canonical five-step spine is expanded here into the nine operational
// rungs an orchestrator actually chooses between (see {@link RUNG_LADDER}).
//
// DETERMINISM RULE (CLAUDE.md / RFC-2013, mirrors RFC-2004): this module calls
// neither Date.now() nor Math.random(). The same TaskDescriptor + options always
// yield an identical RouteDecision, so routing is replayable and auditable.
//
// TRUTH DISCIPLINE (DOCTRINE / ADR-0005): a regulated or financial CONCLUSION
// may never *terminate* below the human rung. The router may still route such a
// task to a cheap rung to DRAFT the answer, but when `needs_regulated_conclusion`
// is set the decision always carries `escalate_to_human = true` — the model
// proposes, a human disposes. Evidence, source, confidence, and decision lineage
// are persisted upstream; the router never lets weights or a prompt be the last
// word on a regulated call.

import type { RiskLevel } from "@/core/types";

// ---------------------------------------------------------------------------
// The ladder
// ---------------------------------------------------------------------------

/**
 * A single rung of the "cheapest sufficient intelligence" ladder. Ordered
 * cheapest → most capable/most expensive in {@link RUNG_LADDER}. "Cost" here is
 * a blended relative measure of compute spend AND real-world consequence — a
 * side-effecting tool call and a human expert are "expensive" partly because
 * they are consequential, not only because they burn tokens.
 */
export type Rung =
  | "deterministic_rule"
  | "cached_lookup"
  | "small_open_model"
  | "strong_open_model"
  | "retrieval_augmented"
  | "frontier_model"
  | "multi_agent"
  | "tool_execution"
  | "human_expert";

/**
 * The nine rungs in ascending cost/capability order. Index === ladder position.
 *
 *  0. deterministic_rule  — pure, auditable code rules; no model. Cheapest, most
 *                           trustworthy. Preferred whenever a rule can decide.
 *  1. cached_lookup       — return a previously computed/memoized answer; near
 *                           free, no fresh inference.
 *  2. small_open_model    — small local model: extraction, classification,
 *                           routine summaries, low-risk tool routing.
 *  3. strong_open_model   — strong open coding/reasoning model for multi-step
 *                           implementation and moderate reasoning.
 *  4. retrieval_augmented — a model grounded with retrieval over sources; used
 *                           when the answer must cite context the model lacks.
 *  5. frontier_model      — frontier model for novel reasoning and hard problems.
 *  6. multi_agent         — orchestrated multi-agent collaboration (several
 *                           frontier calls); expensive, for decomposable hard work.
 *  7. tool_execution      — invoking real, side-effecting tools/actions; carries
 *                           real-world consequence, so it sits high on the ladder.
 *  8. human_expert        — a human makes/approves the call. Most expensive, and
 *                           the mandatory final gate for regulated conclusions.
 */
export const RUNG_LADDER: readonly Rung[] = [
  "deterministic_rule",
  "cached_lookup",
  "small_open_model",
  "strong_open_model",
  "retrieval_augmented",
  "frontier_model",
  "multi_agent",
  "tool_execution",
  "human_expert",
] as const;

/** Relative blended cost per rung (compute + consequence). Monotonic ↑ the ladder. */
export const RUNG_COST: Record<Rung, number> = {
  deterministic_rule: 1,
  cached_lookup: 2,
  small_open_model: 5,
  strong_open_model: 15,
  retrieval_augmented: 25,
  frontier_model: 60,
  multi_agent: 140,
  tool_execution: 240,
  human_expert: 1000,
};

/** Ladder position (0-based) for a rung. Kept in sync with {@link RUNG_LADDER}. */
const LADDER_INDEX: Record<Rung, number> = {
  deterministic_rule: 0,
  cached_lookup: 1,
  small_open_model: 2,
  strong_open_model: 3,
  retrieval_augmented: 4,
  frontier_model: 5,
  multi_agent: 6,
  tool_execution: 7,
  human_expert: 8,
};

const HUMAN_RUNG: Rung = "human_expert";

// ---------------------------------------------------------------------------
// Task descriptor + decision contracts
// ---------------------------------------------------------------------------

/** What the router is asked to route. Cartridge-blind; `kind` is a free label. */
export interface TaskDescriptor {
  /** Opaque task kind label, e.g. "classify_input" | "draft_report". */
  kind: string;
  /** Risk of getting it wrong. Raises the minimum rung (see {@link classify}). */
  risk: RiskLevel;
  /** Intrinsic difficulty, 0 (trivial) .. 1 (very hard). Clamped defensively. */
  complexity: number;
  /**
   * True when a regulated/financial CONCLUSION is being produced. Forces the
   * human gate on the resulting decision regardless of rung (TRUTH DISCIPLINE).
   */
  needs_regulated_conclusion?: boolean;
  /** True when a deterministic rule can decide this task outright. */
  deterministic_available?: boolean;
  /** Minimum acceptable confidence (0..1). Below it, {@link route} escalates. */
  min_confidence?: number;
}

/** The router's deterministic verdict. */
export interface RouteDecision {
  /** The compute rung selected to DO the work (may be capped by maxCost). */
  rung: Rung;
  /** True when a human must make/approve the final call before it is truth. */
  escalate_to_human: boolean;
  /** Full, human-readable trace of every rule that fired. */
  rationale: string;
  /** Blended relative cost of executing this decision (incl. any human gate). */
  cost: number;
  /** 0-based ladder position of {@link rung}. */
  ladder_position: number;
}

// ---------------------------------------------------------------------------
// classify — cheapest rung that can plausibly satisfy the task
// ---------------------------------------------------------------------------

function clamp01(n: number): number {
  if (Number.isNaN(n)) return 0;
  if (n < 0) return 0;
  if (n > 1) return 1;
  return n;
}

/** Risk raises a floor under effective complexity so risky work is not underserved. */
function riskFloor(risk: RiskLevel): number {
  switch (risk) {
    case "high":
      return 0.6;
    case "medium":
      return 0.35;
    case "low":
    default:
      return 0;
  }
}

/**
 * Pick the CHEAPEST rung that can plausibly satisfy `task`, ignoring runtime
 * signals (observed confidence, cost caps) — those are applied by {@link route}.
 *
 * Rules, in order:
 *  1. A deterministic rule beats every model — if one is available, use it.
 *  2. Otherwise scale up the "intelligence" rungs by *effective* complexity,
 *     where effective complexity = max(complexity, riskFloor(risk)). This is why
 *     a high-risk task never lands on the very cheapest model rungs.
 *
 * Note: `needs_regulated_conclusion` does NOT change the classified rung here —
 * a rule or model may still DRAFT a regulated answer. The mandatory human gate
 * is applied in {@link route} (see TRUTH DISCIPLINE in the file header).
 */
export function classify(task: TaskDescriptor): Rung {
  if (task.deterministic_available === true) {
    return "deterministic_rule";
  }

  const eff = Math.max(clamp01(task.complexity), riskFloor(task.risk));

  // Thresholds walk the model-bearing rungs (cached_lookup .. multi_agent).
  // tool_execution and human_expert are never chosen by complexity alone; they
  // are reached only via explicit signals in route().
  if (eff < 0.15) return "cached_lookup";
  if (eff < 0.35) return "small_open_model";
  if (eff < 0.55) return "strong_open_model";
  if (eff < 0.7) return "retrieval_augmented";
  if (eff < 0.88) return "frontier_model";
  return "multi_agent";
}

// ---------------------------------------------------------------------------
// route — classify, then apply runtime escalation + cost caps
// ---------------------------------------------------------------------------

/**
 * Produce a full {@link RouteDecision}. Deterministic given identical inputs.
 *
 * Pipeline:
 *  1. Start from {@link classify}.
 *  2. CONFIDENCE ESCALATION — if `observedConfidence < task.min_confidence`,
 *     walk UP the ladder; the shortfall size decides how many rungs (deterministic).
 *  3. HUMAN GATE — `escalate_to_human` becomes true when the task needs a
 *     regulated conclusion (ADR-0005), when escalation has reached the human
 *     rung, or when a high-risk task fell short on confidence.
 *  4. COST CAP — `maxCost` caps only the COMPUTE rung (down to the most
 *     expensive affordable rung); it never removes a required human gate.
 *
 * TRUTH DISCIPLINE: a regulated conclusion always returns `escalate_to_human`,
 * even if the compute rung is a cheap deterministic rule and even if `maxCost`
 * caps the rung — the decision cannot terminate below the human rung.
 */
export function route(
  task: TaskDescriptor,
  opts?: { maxCost?: number; observedConfidence?: number },
): RouteDecision {
  const reasons: string[] = [];

  const base = classify(task);
  let idx = LADDER_INDEX[base];
  reasons.push(
    `classified ${base} (kind="${task.kind}", complexity=${clamp01(task.complexity)}, risk=${task.risk})`,
  );

  // 2. Confidence escalation.
  let confidenceShortfall = false;
  const minC = task.min_confidence;
  const obs = opts?.observedConfidence;
  if (minC !== undefined && obs !== undefined && obs < minC) {
    confidenceShortfall = true;
    const shortfall = minC - obs;
    // Deterministic: one rung per 0.2 of shortfall, at least one rung.
    const steps = Math.max(1, Math.ceil(shortfall / 0.2));
    const before = RUNG_LADDER[idx];
    idx = Math.min(idx + steps, RUNG_LADDER.length - 1);
    reasons.push(
      `observed confidence ${obs} < required ${minC}; escalated ${steps} rung(s) ${before} -> ${RUNG_LADDER[idx]}`,
    );
  }

  let rung = RUNG_LADDER[idx];

  // 3. Human gate.
  let escalateToHuman =
    task.needs_regulated_conclusion === true ||
    rung === HUMAN_RUNG ||
    (confidenceShortfall && task.risk === "high");
  if (task.needs_regulated_conclusion === true) {
    reasons.push(
      "regulated/financial conclusion: human gate REQUIRED (ADR-0005) — may not terminate below human_expert",
    );
  } else if (rung === HUMAN_RUNG) {
    reasons.push("escalation reached the human rung");
  } else if (confidenceShortfall && task.risk === "high") {
    reasons.push("high-risk task fell short on confidence: routing to human gate");
  }

  // 4. Cost cap on the compute rung (human gate is preserved separately).
  const maxCost = opts?.maxCost;
  if (maxCost !== undefined && RUNG_COST[rung] > maxCost) {
    let capped: Rung = RUNG_LADDER[0];
    for (const r of RUNG_LADDER) {
      if (RUNG_COST[r] <= maxCost) capped = r;
      else break;
    }
    // If cost caps away a human compute rung, keep the human gate flagged.
    if (rung === HUMAN_RUNG) escalateToHuman = true;
    reasons.push(`maxCost ${maxCost} caps compute rung ${rung} -> ${capped}`);
    rung = capped;
  }

  // Total cost = compute rung + a human review step when gated onto a model rung.
  const humanGateCost =
    escalateToHuman && rung !== HUMAN_RUNG ? RUNG_COST[HUMAN_RUNG] : 0;

  return {
    rung,
    escalate_to_human: escalateToHuman,
    rationale: reasons.join("; "),
    cost: RUNG_COST[rung] + humanGateCost,
    ladder_position: LADDER_INDEX[rung],
  };
}

// ---------------------------------------------------------------------------
// Tool router — deterministic capability → tool resolution
// ---------------------------------------------------------------------------

/** A registerable tool the harness can dispatch to. */
export interface ToolSpec {
  /** Stable unique tool key. */
  key: string;
  /** The capability this tool provides, e.g. "ocr" | "web_fetch". */
  capability: string;
  /** Relative cost; undefined is treated as 0 (cheapest) when ranking. */
  cost?: number;
}

/**
 * A tiny deterministic registry: register tools, then resolve all tools for a
 * capability, cheapest first (ties broken by key). No clock, no randomness —
 * the same registration order + query always yields the same ordering.
 */
export class ToolRouter {
  private readonly tools: ToolSpec[] = [];

  /** Register a tool. Duplicate keys are allowed; callers dedupe if they need to. */
  register(t: ToolSpec): void {
    this.tools.push(t);
  }

  /** All tools providing `capability`, sorted by cost (undefined = 0) then key. */
  resolve(capability: string): ToolSpec[] {
    return this.tools
      .filter((t) => t.capability === capability)
      .slice()
      .sort((a, b) => {
        const ca = a.cost ?? 0;
        const cb = b.cost ?? 0;
        if (ca !== cb) return ca - cb;
        return a.key < b.key ? -1 : a.key > b.key ? 1 : 0;
      });
  }
}
