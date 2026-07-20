// core/engine/report.ts
//
// Build chase (3a): generate a report instance FROM structured evidence
// (CORE_OBJECT_MODEL §3.25, AGENT_AND_AUTOMATION_RULES §17). Every section is
// grounded in the ids of the evidence / metrics / inputs it cites, missing
// data is named rather than invented, and the run starts as `generated`
// (NOT shared) — external sharing is a separate human approval.
//
// Industry-agnostic: the engine reads generic primitives and the report's
// definition (label/description) from configuration. It never names a vertical.
//
// Pure: takes data in, returns a ReportRun. The store persists + logs it.

import type {
  EvidenceItem,
  InboundEvent,
  Metric,
  Note,
  ReportRun,
  ReportSection,
  WorkItem,
} from "@/core/types";
import type { ReportDefinition } from "@/core/types";

const rid = (p: string) => `${p}_${Math.random().toString(36).slice(2, 10)}`;

export interface ReportInputs {
  workItems: WorkItem[];
  evidence: EvidenceItem[];
  metrics: Metric[];
  inputs: InboundEvent[];
  notes: Note[];
}

const fmtVal = (v: Record<string, unknown>) =>
  Object.entries(v)
    .map(([k, val]) => `${k}: ${typeof val === "number" ? val : JSON.stringify(val)}`)
    .join(", ");

/**
 * Assemble a report from a workspace's current evidence and metrics. The result
 * cites the exact evidence/metric ids backing each section, so it is fully
 * traceable (the §3.25 rule). Nothing is asserted that is not backed by a row.
 */
export function buildReportRun(
  workspaceId: string,
  def: Pick<ReportDefinition, "key" | "label" | "description">,
  d: ReportInputs,
  generatedBy: string,
  generatedAt: string,
): ReportRun {
  const sections: ReportSection[] = [];
  const allRefs = new Set<string>();
  const missing: string[] = [];

  // --- 1. Executive summary (counts only — all derived, no claims) ----------
  const total = d.workItems.length;
  const completed = d.workItems.filter((w) => w.status === "completed").length;
  const open = total - completed;
  const summaryMetricRefs = d.metrics
    .filter((m) => ["work_completion_rate", "evidence_coverage"].includes(m.metric_name))
    .map((m) => m.id);
  summaryMetricRefs.forEach((r) => allRefs.add(r));
  sections.push({
    heading: "Executive summary",
    body:
      `${def.description}\n\n` +
      `Work items: ${total} total, ${completed} completed, ${open} open. ` +
      `Evidence on file: ${d.evidence.length} item(s). ` +
      `Inputs ingested: ${d.inputs.length}. ` +
      `Generated ${generatedAt} from current operating data.`,
    source_references: summaryMetricRefs,
  });

  // --- 2. Evidence ledger (the spine — report is built FROM this) -----------
  if (d.evidence.length === 0) {
    missing.push("No evidence items captured yet — report is structural only.");
  } else {
    const lines = d.evidence.map((e) => {
      allRefs.add(e.id);
      const wi = d.workItems.find((w) => w.id === e.work_item_id);
      return `- [${e.kind}] ${e.label}${wi ? ` (work: ${wi.title})` : ""} — ${fmtVal(e.value)} · captured by ${e.captured_by} · ref ${e.id}`;
    });
    sections.push({
      heading: "Evidence ledger",
      body: lines.join("\n"),
      source_references: d.evidence.map((e) => e.id),
    });
  }

  // --- 3. Metrics (value-vs-target where a target is configured) ------------
  if (d.metrics.length > 0) {
    const lines = d.metrics.map((m) => {
      allRefs.add(m.id);
      const target = (m.metadata as Record<string, unknown> | undefined)?.target;
      return `- ${m.metric_name}: ${m.metric_value}${target !== undefined ? ` (target ${target})` : ""} — ${m.calculation_method ?? ""} · ref ${m.id}`;
    });
    sections.push({
      heading: "Metrics",
      body: lines.join("\n"),
      source_references: d.metrics.map((m) => m.id),
    });
  } else {
    missing.push("No metrics computed yet — run metric computation before relying on figures.");
  }

  // --- 4. Open gaps (work that is not yet complete / not yet proven) --------
  const gaps = d.workItems.filter((w) => w.status !== "completed" && w.status !== "archived" && w.status !== "canceled");
  if (gaps.length > 0) {
    const evidenceWorkIds = new Set(d.evidence.map((e) => e.work_item_id));
    const lines = gaps.map((w) => {
      allRefs.add(w.id);
      const proven = evidenceWorkIds.has(w.id) ? "has evidence" : "NO evidence";
      return `- ${w.title} — status ${w.status}, ${w.priority} priority, ${proven} · ref ${w.id}`;
    });
    sections.push({
      heading: "Open gaps",
      body: lines.join("\n"),
      source_references: gaps.map((w) => w.id),
    });
  }

  return {
    id: rid("rpt"),
    workspace_id: workspaceId,
    report_key: def.key,
    generated_at: generatedAt,
    sections,
    title: def.label,
    status: "generated",
    generated_by: generatedBy,
    source_references: [...allRefs],
    missing_data_notes: missing,
  };
}
