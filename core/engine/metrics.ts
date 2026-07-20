// core/engine/metrics.ts
//
// Build chase (3c): metrics computed from REAL activity, never vanity numbers
// (CORE_OBJECT_MODEL §3.24, ROI_AND_IMPACT_MODEL §12/§16). This engine is
// industry-agnostic: it derives a fixed family of UNIVERSAL operating metrics
// from the core primitives (work items, checklists, evidence, proposals, agent
// runs, inputs). A cartridge's MetricDefinitions are overlaid only as TARGETS
// and labels — meaning stays in configuration, computation stays in core.
//
// Pure: takes data in, returns Metric[]. The store persists them.

import type {
  AgentRun,
  ChecklistItem,
  EvidenceItem,
  InboundEvent,
  Metric,
  MetricType,
  WorkItem,
  WorkItemProposal,
} from "@/core/types";
import type { MetricDefinition } from "@/core/config/types";

const rid = (p: string) => `${p}_${Math.random().toString(36).slice(2, 10)}`;

export interface MetricInputs {
  workItems: WorkItem[];
  checklistItems: ChecklistItem[];
  evidence: EvidenceItem[];
  proposals: WorkItemProposal[];
  agentRuns: AgentRun[];
  inputs: InboundEvent[];
}

/** A computed metric before it becomes a persisted Metric record. */
interface ComputedMetric {
  name: string;
  value: number;
  type: MetricType;
  method: string;
  /** Numerator/denominator (or counts) so the number is auditable. */
  basis: Record<string, unknown>;
}

const pct = (num: number, den: number) => (den === 0 ? 0 : Math.round((num / den) * 1000) / 10);

const ACTIVE_STATUSES = new Set(["open", "assigned", "in_progress", "blocked", "awaiting_review", "awaiting_approval"]);
const PROPOSAL_ACCEPTED = new Set(["accepted", "accepted_with_edits", "converted", "approved", "promoted"]);
const PROPOSAL_DECIDED = new Set([...PROPOSAL_ACCEPTED, "rejected"]);

/**
 * Derive the universal metric family from activity. Every value is grounded in
 * counts that travel in `basis`, so a report can cite exactly how it was
 * computed.
 */
function deriveUniversal(d: MetricInputs): ComputedMetric[] {
  const wi = d.workItems;
  const total = wi.length;
  const completed = wi.filter((w) => w.status === "completed").length;
  const active = wi.filter((w) => ACTIVE_STATUSES.has(w.status)).length;
  const blocked = wi.filter((w) => w.status === "blocked").length;
  const awaitingReview = wi.filter((w) => w.status === "awaiting_review").length;

  const ci = d.checklistItems;
  const ciDone = ci.filter((c) => c.done).length;

  // Evidence coverage: of work that should be provable (completed or in review),
  // how much has at least one evidence item attached.
  const provable = wi.filter((w) => w.status === "completed" || w.status === "awaiting_review");
  const evidenceWorkIds = new Set(d.evidence.map((e) => e.work_item_id));
  const provableWithEvidence = provable.filter((w) => evidenceWorkIds.has(w.id)).length;

  const decided = d.proposals.filter((p) => PROPOSAL_DECIDED.has(p.status)).length;
  const accepted = d.proposals.filter((p) => PROPOSAL_ACCEPTED.has(p.status)).length;

  const inputsTotal = d.inputs.length;
  const inputsConverted = d.inputs.filter((i) => i.status === "converted").length;

  return [
    { name: "work_items_total", value: total, type: "operational", method: "count(work_items)", basis: { total } },
    { name: "work_items_active", value: active, type: "operational", method: "count(status in open..awaiting_approval)", basis: { active, total } },
    { name: "work_items_blocked", value: blocked, type: "risk", method: "count(status = blocked)", basis: { blocked } },
    { name: "work_completion_rate", value: pct(completed, total), type: "execution", method: "completed / total work items (%)", basis: { completed, total } },
    { name: "checklist_completion_rate", value: pct(ciDone, ci.length), type: "execution", method: "checklist items done / total (%)", basis: { done: ciDone, total: ci.length } },
    { name: "evidence_coverage", value: pct(provableWithEvidence, provable.length), type: "evidence", method: "provable work items with >=1 evidence / provable (%)", basis: { with_evidence: provableWithEvidence, provable: provable.length } },
    { name: "evidence_items_total", value: d.evidence.length, type: "evidence", method: "count(evidence_items)", basis: { total: d.evidence.length } },
    { name: "awaiting_review", value: awaitingReview, type: "operational", method: "count(status = awaiting_review)", basis: { awaitingReview } },
    { name: "agent_runs_total", value: d.agentRuns.length, type: "agent", method: "count(agent_runs)", basis: { total: d.agentRuns.length } },
    { name: "proposal_acceptance_rate", value: pct(accepted, decided), type: "agent", method: "accepted proposals / decided (%)", basis: { accepted, decided } },
    { name: "input_conversion_rate", value: pct(inputsConverted, inputsTotal), type: "data_quality", method: "inputs converted / total inputs (%)", basis: { converted: inputsConverted, total: inputsTotal } },
  ];
}

/**
 * Compute persisted Metric records for a workspace. Cartridge MetricDefinitions
 * are matched by metric_type and surfaced as a `target` in metadata so a
 * dashboard can show value-vs-target without the core knowing the vertical.
 */
export function computeMetrics(
  workspaceId: string,
  d: MetricInputs,
  defs: MetricDefinition[],
  measuredAt: string,
): Metric[] {
  const computed = deriveUniversal(d);
  return computed.map((m) => {
    const def = defs.find((x) => x.metric_type === m.type && x.target !== undefined);
    return {
      id: rid("metric"),
      workspace_id: workspaceId,
      metric_name: m.name,
      metric_value: m.value,
      metric_type: m.type,
      measured_at: measuredAt,
      calculation_method: m.method,
      created_at: measuredAt,
      metadata: {
        basis: m.basis,
        auto: true,
        ...(def ? { target: def.target, target_metric: def.key, target_label: def.label } : {}),
      },
    } satisfies Metric;
  });
}
