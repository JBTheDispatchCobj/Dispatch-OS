// cartridges/cooperative_markets/pipeline.ts
//
// Cooperative Markets — ORCHESTRATION SPINE (Olympic Sprint, Wave 1).
//
// This is the moment the built modules become a SYSTEM. It chains the whole
// vertical on real inputs:
//
//   ingest(5300) → score (P1) → IC memo (P2) → allocate (P3) → settle (P4)
//     → assembleIO → renderVariants → buildFeed
//
// and returns a single typed {@link DealRun} bundle. Every stage:
//   * is ROUTED through the harness (`core/harness/router`) — deterministic
//     stages land on rung 1 (`deterministic_rule`); the IC memo is a
//     regulated/financial CONCLUSION and therefore always carries the human
//     gate (`escalate_to_human`), and the lens rendering runs at a model rung;
//   * emits a {@link KernelEvent} on the kernel event bus (RFC-2004), correlated
//     by the deal-run id, so the run is one replayable causal chain;
//   * records a {@link CostEntry} on the cost ledger (RFC-2008) for the
//     model / human / tool / connector spend it incurs.
//
// TRUTH DISCIPLINE (DOCTRINE / ADR-0005), load-bearing here:
//   * No regulated conclusion in weights. The IC memo is a `draft` proposal; the
//     router forces the human gate on it; settlement only EXECUTES amounts that
//     allocation already proposed — the spine invents no decision of its own.
//   * A published variant restates the IO's facts, never a superset —
//     `renderVariants` sets each variant's `source_refs` to the IO's own union
//     (enforced by construction in the Auric engine).
//
// PURE + DETERMINISTIC: no Date.now, no Math.random, no I/O. The caller injects
// the run id and a single `startedAt` timestamp; every event/cost/object id is
// derived from the run id and a monotonic sequence, so the SAME input always
// produces a byte-identical DealRun (see `runDealPipeline` called twice in the
// debug loop). Vehicle-agnostic; additive; no vertical noun leaks into `core/`.
//
// isolatedModules-friendly: type-only imports use `import type`; ES2022; "@/*".

import {
  ingest,
  type CallReportInput,
  type CallReportFacts,
} from "@/cartridges/cooperative_markets/ingest_call_report";
import {
  assembleScorecard,
  type StartupProfile,
  type InstitutionReadinessInput,
  type OpportunityContext,
  type DealScorecard,
} from "@/cartridges/cooperative_markets/deal_engine";
import {
  assembleICMemo,
  type DiligenceFinding,
  type ICMemo,
  type ICRecommendation,
} from "@/cartridges/cooperative_markets/ic_memo";
import {
  allocateDeal,
  dealFromMemo,
  type Subscriber,
  type AllocationResult,
} from "@/cartridges/cooperative_markets/allocation";
import {
  settle,
  type VehicleMode,
  type SettlementResult,
} from "@/cartridges/cooperative_markets/settlement";
import {
  assembleIO,
  ioSourceRefs,
  renderVariants,
  buildFeed,
  type LensSpec,
  type FeedContext,
} from "@/core/auric/engine";
import type {
  IntelligenceObject,
  ContentVariant,
} from "@/core/intelligence/types";
import {
  EventBus,
  makeEvent,
  type KernelEvent,
} from "@/core/kernel/event_bus";
import {
  CostLedger,
  type CostEntry,
  type CostCategory,
} from "@/core/kernel/cost_ledger";
import { route, type TaskDescriptor, type RouteDecision } from "@/core/harness/router";
import type { RiskLevel } from "@/core/types";
import type { Plane, Visibility } from "@/core/truth/types";

// ---------------------------------------------------------------------------
// Inputs
// ---------------------------------------------------------------------------

/**
 * A HUMAN disposition of the IC memo — the mandatory gate on a regulated/
 * financial conclusion (DOCTRINE / ADR-0005). The model DRAFTS the memo; a human
 * DISPOSES of it. This is a caller-supplied INPUT (not something the pipeline
 * invents), carrying the truth-object id of the recorded committee decision so
 * the approval is a sourced `human_approved_conclusion`, never a weight.
 *
 * A deal that needs the human gate (`escalate_to_human`) may NOT allocate,
 * settle, or publish until `disposition === "approved"`. Absent/deferred → the
 * run halts `awaiting_approval`; rejected → `declined`.
 */
export interface ICApproval {
  disposition: "approved" | "rejected" | "deferred";
  /** The human who disposed of the memo — "user:<id>" (never an agent/system). */
  by: string;
  /** Truth-object id of the recorded committee decision (traceability). */
  decision_ref: string;
  note?: string;
}

/**
 * Everything one deal run consumes. The 5300 payload drives ingestion; the
 * startup profile + opportunity context drive scoring; diligence findings drive
 * the memo; subscribers + capacity drive allocation. `institutionExtra` supplies
 * the institution-readiness signals a 5300 cannot honestly source (governance /
 * infosec / strategy) — each still a sourced `SourcedInput` in the caller's data.
 * `approval` is the human disposition of the memo — required for a regulated
 * conclusion to advance past the human gate (see {@link ICApproval}).
 */
export interface DealRunInput {
  raw5300: CallReportInput;
  startup: StartupProfile;
  opportunity: OpportunityContext;
  institutionExtra?: Partial<InstitutionReadinessInput>;
  findings: DiligenceFinding[];
  subscribers: Subscriber[];
  dealCapacityUsd: number;
  /** Allocation category; defaults to the startup's category. */
  category?: string;
  /** Human disposition of the IC memo — gates allocation/settlement/publication. */
  approval?: ICApproval;
}

/**
 * Deterministic run context. The pipeline never invents ids or clocks — the
 * caller supplies them here so a run is reproducible and replayable.
 *   runId      — correlation id for the whole run (events, costs, object ids).
 *   startedAt  — ISO-8601 stamp used for every occurred_at / created_at and as
 *                the feed's reference "now" (so freshly-created variants are live).
 *   actor      — actor string for the run's events; default "agent:deal_pipeline".
 *   settlementMode — vehicle for P4; default "advisory" (ships now, no principal).
 *   feedRole   — role lens the returned feed is built for; default "ceo".
 */
export interface RunContext {
  runId: string;
  startedAt: string;
  actor?: string;
  settlementMode?: VehicleMode;
  feedRole?: string;
}

// ---------------------------------------------------------------------------
// Output bundle
// ---------------------------------------------------------------------------

/** One routed stage: which task was routed and what the router decided. */
export interface StageRoute {
  stage: string;
  task_kind: string;
  decision: RouteDecision;
}

export type DealRunStatus =
  | "settled"
  | "vehicle_pending"
  | "awaiting_approval" // allocatable, but the human gate is open (no approval yet)
  | "declined" // a human rejected the memo at the gate
  | "blocked" // memo blocked (compliance / DD gate) — never reached the human gate
  | "held"
  | "passed";

/** The full, typed result of chaining the vertical end-to-end. */
export interface DealRun {
  run_id: string;
  company: string;
  institution: string;
  // --- stage outputs (post-memo stages are null when the deal did not advance) ---
  facts: CallReportFacts;
  readiness: InstitutionReadinessInput;
  scorecard: DealScorecard;
  memo: ICMemo;
  /** The human disposition that gated advancement (null when none was supplied). */
  approval: ICApproval | null;
  allocation: AllocationResult | null;
  settlement: SettlementResult | null;
  io: IntelligenceObject | null;
  variants: ContentVariant[];
  feed: ContentVariant[];
  // --- harness + kernel spine ---
  routes: StageRoute[];
  events: KernelEvent[];
  cost: {
    entries: CostEntry[];
    total_usd: number;
    by_category: Record<CostCategory, number>;
  };
  status: DealRunStatus;
  generated_by: "pipeline:v1";
}

// ---------------------------------------------------------------------------
// Stage cost + routing tables (declared, deterministic)
// ---------------------------------------------------------------------------

interface StageCost {
  category: CostCategory;
  usd: number;
  label: string;
  model?: string;
  tokens_in?: number;
  tokens_out?: number;
}

/** Relative, deterministic per-stage spend. Numbers are illustrative but fixed. */
const STAGE_COST: Record<string, StageCost> = {
  ingest: { category: "connector", usd: 0.02, label: "ncua_5300_pull" },
  score: { category: "tool", usd: 0.001, label: "deterministic_scoring" },
  memo: { category: "model", usd: 0.12, label: "ic_memo_generation", model: "strong_open", tokens_in: 4200, tokens_out: 1400 },
  memo_review: { category: "human", usd: 2.5, label: "ic_review_human_gate" },
  allocate: { category: "tool", usd: 0.002, label: "eligibility_gates" },
  settle: { category: "connector", usd: 0.05, label: "fund_admin_settlement" },
  io: { category: "tool", usd: 0.001, label: "io_assembly" },
  variants: { category: "model", usd: 0.08, label: "lens_rendering", model: "strong_open", tokens_in: 2600, tokens_out: 1800 },
  feed: { category: "tool", usd: 0.0005, label: "feed_ranking" },
};

/** Per-stage task descriptors handed to the harness router. */
function stageTask(stage: string): TaskDescriptor {
  const t = (
    kind: string,
    risk: RiskLevel,
    complexity: number,
    extra?: Partial<TaskDescriptor>,
  ): TaskDescriptor => ({ kind, risk, complexity, ...extra });

  switch (stage) {
    case "ingest":
      return t("ingest_call_report", "low", 0.1, { deterministic_available: true });
    case "score":
      return t("score_deal", "medium", 0.2, { deterministic_available: true });
    case "memo":
      // A regulated/financial CONCLUSION: model may DRAFT it, but the decision
      // may never terminate below the human rung (ADR-0005). Router forces the gate.
      return t("draft_ic_memo", "high", 0.75, { needs_regulated_conclusion: true, min_confidence: 0.7 });
    case "allocate":
      // Eligibility (sanctions / KYC-KYB / accreditation) is deterministic code.
      return t("allocate_deal", "high", 0.3, { deterministic_available: true });
    case "settle":
      return t("settle_deal", "high", 0.4, { deterministic_available: true });
    case "io":
      return t("assemble_io", "low", 0.15, { deterministic_available: true });
    case "variants":
      // Lens copy is model-generated (not a regulated conclusion) — a model rung, no gate.
      return t("render_lens_variants", "medium", 0.5);
    case "feed":
      return t("build_feed", "low", 0.1, { deterministic_available: true });
    default:
      return t(stage, "low", 0.1, { deterministic_available: true });
  }
}

// ---------------------------------------------------------------------------
// Run recorder — the event bus + cost ledger + route log for one run
// ---------------------------------------------------------------------------

const ALLOCATABLE: ICRecommendation[] = ["recommend", "recommend_with_conditions"];

class RunRecorder {
  readonly bus = new EventBus();
  readonly ledger = new CostLedger();
  readonly routes: StageRoute[] = [];
  private seq = 0;
  private readonly runId: string;
  private readonly startedAt: string;
  private readonly actor: string;

  // NOTE: explicit field assignment (not constructor parameter properties) so the
  // module runs under Node's erasable-only TS type-stripping (`node file.ts`).
  constructor(runId: string, startedAt: string, actor: string) {
    this.runId = runId;
    this.startedAt = startedAt;
    this.actor = actor;
  }

  /** Route a stage through the harness and record the decision. */
  routeStage(stage: string): RouteDecision {
    const task = stageTask(stage);
    const decision = route(task);
    this.routes.push({ stage, task_kind: task.kind, decision });
    return decision;
  }

  /** Publish a correlated kernel event for a stage. */
  emit(type: string, plane: Plane, payload: Record<string, unknown>): void {
    this.bus.publish(
      makeEvent({
        id: `${this.runId}:evt:${this.seq++}`,
        type,
        correlation_id: this.runId,
        actor: this.actor,
        plane,
        occurred_at: this.startedAt,
        payload,
      }),
    );
  }

  /** Record a stage's spend on the ledger. */
  spend(key: string, actor?: string): void {
    const c = STAGE_COST[key];
    if (!c) return;
    this.ledger.record({
      id: `${this.runId}:cost:${this.seq++}`,
      correlation_id: this.runId,
      category: c.category,
      label: c.label,
      model: c.model,
      tokens_in: c.tokens_in,
      tokens_out: c.tokens_out,
      usd: c.usd,
      actor: actor ?? this.actor,
      occurred_at: this.startedAt,
    });
  }
}

// ---------------------------------------------------------------------------
// The pipeline
// ---------------------------------------------------------------------------

function statusFromMemo(rec: ICRecommendation): DealRunStatus {
  if (rec === "blocked") return "blocked";
  if (rec === "pass") return "passed";
  return "held"; // "hold"
}

/**
 * Run the full Cooperative Markets deal pipeline end-to-end. Deterministic given
 * `input` + `ctx`. Advancing deals flow all the way to a ranked, lensed feed;
 * non-advancing deals (blocked / hold / pass at the memo gate) stop after the
 * memo with the post-memo stages null, and the run records why.
 */
export function runDealPipeline(input: DealRunInput, ctx: RunContext): DealRun {
  const actor = ctx.actor ?? "agent:deal_pipeline";
  const rec = new RunRecorder(ctx.runId, ctx.startedAt, actor);
  const category = input.category ?? input.startup.category;
  const settlementMode: VehicleMode = ctx.settlementMode ?? "advisory";

  // --- Stage 1: INGEST (deterministic 5300 → sourced facts + readiness) ------
  rec.routeStage("ingest");
  const ingested = ingest(input.raw5300);
  const facts = ingested.facts;
  const readiness: InstitutionReadinessInput = {
    ...ingested.readiness,
    ...(input.institutionExtra ?? {}),
  };
  rec.spend("ingest");
  rec.emit("deal.ingested", "control", {
    charter_number: facts.charter_number,
    institution: facts.institution,
    net_worth_ratio: facts.net_worth_ratio,
    source_ref: facts.source_ref,
  });

  // --- Stage 2: SCORE (P1 deterministic scoring) -----------------------------
  rec.routeStage("score");
  const scorecard = assembleScorecard(input.startup, readiness, input.opportunity);
  rec.spend("score");
  rec.emit("deal.scored", "private_terminal", {
    company: scorecard.company,
    institution: scorecard.institution,
    opportunity: scorecard.scores.opportunity.value,
    recommendation: scorecard.recommendation,
  });

  // --- Stage 3: IC MEMO (P2, approved-evidence-only, regulated conclusion) ----
  const memoDecision = rec.routeStage("memo");
  const memo = assembleICMemo(scorecard, input.findings);
  rec.spend("memo");
  if (memoDecision.escalate_to_human) rec.spend("memo_review", "user:investment_committee");
  rec.emit("deal.memo_drafted", "private_terminal", {
    company: memo.company,
    recommendation: memo.recommendation,
    human_gate: memoDecision.escalate_to_human,
    excluded_unapproved: memo.excluded_unapproved.length,
    status: memo.status,
  });

  const approval = input.approval ?? null;
  const requiresHumanGate = memoDecision.escalate_to_human;
  const allocatable = ALLOCATABLE.includes(memo.recommendation);
  const approved = approval?.disposition === "approved";

  const base = {
    run_id: ctx.runId,
    company: scorecard.company,
    institution: scorecard.institution,
    facts,
    readiness,
    scorecard,
    memo,
    approval,
    routes: rec.routes,
    generated_by: "pipeline:v1" as const,
  };

  const haltedRun = (status: DealRunStatus): DealRun =>
    finalize({ ...base, allocation: null, settlement: null, io: null, variants: [], feed: [], status }, rec);

  // GATE 1 — the memo itself is not allocatable (compliance / DD gate). Halt at the
  // memo; nothing is allocated, settled, or published.
  if (!allocatable) {
    rec.emit("deal.halted", "private_terminal", { company: memo.company, reason: memo.recommendation });
    return haltedRun(statusFromMemo(memo.recommendation));
  }

  // GATE 2 — the HUMAN GATE (ADR-0005), with teeth. A regulated/financial conclusion
  // may NOT allocate, settle, or publish until a HUMAN has disposed of the memo. The
  // model proposed the recommendation; the router flagged `escalate_to_human`; here
  // that flag GATES CONTROL FLOW. Without a caller-supplied `approved` disposition the
  // run terminates at the human rung — no autonomous advance on a draft. (allocation.ts
  // and settlement.ts both assume an APPROVED deal; this is where that approval is required.)
  if (requiresHumanGate && !approved) {
    const declined = approval?.disposition === "rejected";
    rec.emit("deal.awaiting_approval", "private_terminal", {
      company: memo.company,
      recommendation: memo.recommendation,
      disposition: approval?.disposition ?? "none",
      note: "regulated conclusion held at the human rung; not allocated/settled/published",
    });
    return haltedRun(declined ? "declined" : "awaiting_approval");
  }

  // A human APPROVED the memo (or the stage did not require the gate). Record the
  // authorizing human act before any capital movement or publication — the approval
  // is a sourced `human_approved_conclusion` (its decision_ref), not a weight.
  if (approved && approval) {
    rec.emit("deal.approved", "private_terminal", {
      company: memo.company,
      approved_by: approval.by,
      decision_ref: approval.decision_ref,
    });
  }
  const humanApproved = approved && approval !== null;

  // --- Stage 4: ALLOCATE (P3, eligibility gates, pro-rata) -------------------
  rec.routeStage("allocate");
  const dealForAlloc = dealFromMemo(memo, input.startup.ref, category, input.dealCapacityUsd);
  const allocation = allocateDeal(dealForAlloc, input.subscribers);
  rec.spend("allocate");
  rec.emit("deal.allocated", "private_terminal", {
    deal: allocation.deal,
    allocated_usd: allocation.allocated_usd,
    qualified_matches: allocation.deal_flow_access.qualified_matches,
    rejected: allocation.rejected.length,
  });

  // --- Stage 5: SETTLE (P4, pluggable vehicle) -------------------------------
  rec.routeStage("settle");
  const settlement = settle(allocation, settlementMode);
  rec.spend("settle");
  rec.emit("deal.settled", "private_terminal", {
    deal: settlement.deal,
    mode: settlement.mode,
    status: settlement.status,
    committed_usd: settlement.committed_usd,
  });

  // --- Stage 6: ASSEMBLE IO (sourced market-intelligence object) -------------
  // Publication happens ONLY on the approved path (below the human gate above), so a
  // network-visible IO never carries an unapproved regulated recommendation. Evidence
  // refs are the real truth-object ids (memo `source_ref`, the 5300 filing, the scores'
  // sourced inputs, and the human decision), partitioned by TIER so claim-tier evidence
  // does not masquerade as fact and the three ref sets stay honest (intelligence/types).
  rec.routeStage("io");
  const evidence = partitionRefs([
    facts.source_ref,
    ...memo.citation_map.map((c) => c.source_ref ?? c.ref),
    ...scorecard.lineage,
    ...(approval ? [approval.decision_ref] : []),
  ]);
  const plane: Plane = "shared_market";
  const visibility: Visibility = "network";
  const recommendedAction =
    humanApproved && approval
      ? `Committee-approved by ${approval.by}; allocation + settlement authorized (decision ${approval.decision_ref}).`
      : `IC proposal: ${labelRec(memo.recommendation)} (a proposal, not a decision)`;
  const io = assembleIO({
    id: `${ctx.runId}:io`,
    plane,
    visibility,
    kind: "cooperative_markets:deal",
    headline: `${memo.company} × ${memo.institution}: ${labelRec(memo.recommendation)} (opportunity ${scorecard.scores.opportunity.value})`,
    summary: memo.sections.find((s) => s.key === "thesis")?.body,
    fact_refs: evidence.fact,
    claim_refs: evidence.claim,
    inference_refs: evidence.inference,
    affected_refs: [input.startup.ref, readiness.ref],
    // A human approved the memo → the IO's top tier is the human-approved conclusion,
    // not merely a Dispatch inference. (Absent the gate it would stay dispatch_inference.)
    top_tier: humanApproved ? "human_approved_conclusion" : "dispatch_inference",
    confidence: scorecard.scores.opportunity.confidence,
    recommended_action: recommendedAction,
    created_at: ctx.startedAt,
    published_at: ctx.startedAt,
  });
  rec.spend("io");
  rec.emit("io.assembled", "shared_market", {
    io_id: io.id,
    evidence_count: io.relevance?.evidence_count ?? 0,
    top_tier: io.top_tier,
    relevance: io.relevance?.score ?? null,
  });

  // --- Stage 7: RENDER VARIANTS (base + role lenses; source_refs == IO refs) --
  rec.routeStage("variants");
  const lenses: LensSpec[] = [
    {
      lens_type: "cartridge",
      lens_ref: "cooperative_markets",
      channel: "market_feed",
      title: io.headline,
      hook: `A sourced ${category} match, scored and diligenced.`,
      body: io.summary ?? io.headline,
    },
    {
      lens_type: "role",
      lens_ref: "ceo",
      channel: "terminal_feed",
      title: `CEO view — ${memo.company}`,
      hook: "Strategic franchise fit.",
      body: memo.lens_summaries.ceo,
    },
    {
      lens_type: "role",
      lens_ref: "cro",
      channel: "terminal_feed",
      title: `CRO view — ${memo.company}`,
      hook: "Risk & regulatory posture.",
      body: memo.lens_summaries.cro,
    },
    {
      lens_type: "role",
      lens_ref: "cfo",
      channel: "terminal_feed",
      title: `CFO view — ${memo.company}`,
      hook: "Returns & capital path.",
      body: memo.lens_summaries.cfo,
    },
  ];
  const variants = renderVariants(io, lenses, `${ctx.runId}:variant`, ctx.startedAt);
  rec.spend("variants");
  rec.emit("variants.rendered", "shared_market", {
    io_id: io.id,
    count: variants.length,
    lenses: lenses.map((l) => l.lens_ref ?? l.lens_type),
  });

  // --- Stage 8: BUILD FEED (ranked, lensed for the reader) -------------------
  rec.routeStage("feed");
  const feedCtx: FeedContext = {
    role: ctx.feedRole ?? "ceo",
    institution: readiness.ref,
    nowIso: ctx.startedAt,
  };
  const shelf: Record<string, string | null | undefined> = {
    [io.id]: io.shelf_life_ends_at ?? null,
  };
  const feed = buildFeed(variants, feedCtx, shelf);
  rec.spend("feed");
  rec.emit("feed.built", "shared_market", {
    io_id: io.id,
    feed_size: feed.length,
    role: feedCtx.role,
  });

  // settle() returns only "closed" (advisory/syndication) or "vehicle_pending" (fund/spv TBD).
  const status: DealRunStatus =
    settlement.status === "vehicle_pending" ? "vehicle_pending" : "settled";

  return finalize({
    ...base,
    allocation,
    settlement,
    io,
    variants,
    feed,
    status,
  }, rec);
}

// ---------------------------------------------------------------------------
// Finalize — attach the kernel spine (events + cost roll-up) to the run
// ---------------------------------------------------------------------------

type PreRun = Omit<DealRun, "events" | "cost">;

function finalize(pre: PreRun, rec: RunRecorder): DealRun {
  return {
    ...pre,
    events: rec.bus.history({ correlation_id: pre.run_id }),
    cost: {
      entries: rec.ledger.entries({ correlation_id: pre.run_id }),
      total_usd: round4(rec.ledger.totalUsd({ correlation_id: pre.run_id })),
      by_category: rec.ledger.byCategory(),
    },
  };
}

// ---------------------------------------------------------------------------
// Small pure helpers
// ---------------------------------------------------------------------------

/**
 * Partition sourced refs into the IO's three tier buckets by their id prefix
 * convention (DOCTRINE truth hierarchy; kept distinct per intelligence/types):
 *   "claim:"                → claim_refs  (third-party, unverified)
 *   "inference:" | "inf:"   → inference_refs (model interpretation)
 *   everything else         → fact_refs (fact:/doc:/sourcedoc:/decision: — verifiable)
 * This keeps claim-tier evidence from masquerading as fact and populates all three.
 */
function partitionRefs(refs: string[]): { fact: string[]; claim: string[]; inference: string[] } {
  const fact = new Set<string>();
  const claim = new Set<string>();
  const inference = new Set<string>();
  for (const r of refs) {
    if (!r || r.length === 0) continue;
    if (r.startsWith("claim:")) claim.add(r);
    else if (r.startsWith("inference:") || r.startsWith("inf:")) inference.add(r);
    else fact.add(r);
  }
  return { fact: [...fact], claim: [...claim], inference: [...inference] };
}

function round4(n: number): number {
  return Math.round(n * 10000) / 10000;
}

function labelRec(rec: ICRecommendation): string {
  return rec.replace(/_/g, " ");
}

/**
 * The variant truth-discipline invariant, exposed for tests/gates: a variant's
 * `source_refs` are EXACTLY the IO's fact/claim/inference union — same evidence,
 * different hook, never a superset.
 */
export function variantsRestateIO(io: IntelligenceObject, variants: ContentVariant[]): boolean {
  const io_refs = ioSourceRefs(io);
  const key = (a: string[]) => [...a].sort().join("|");
  const target = key(io_refs);
  return variants.every((v) => key(v.source_refs ?? []) === target);
}
