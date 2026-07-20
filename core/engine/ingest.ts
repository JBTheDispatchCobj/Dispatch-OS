// core/engine/ingest.ts
//
// Build chase (3b): the ingestion pipeline CSV -> Input(staging) -> AgentRun ->
// Proposal. This is the front of the operating loop (inbound data is
// interpreted into draft work, which a human must promote).
//
// Truth model (CORE_OBJECT_MODEL §5, AGENT_AND_AUTOMATION_RULES §2): raw input
// is PRESERVED, the agent run is a DRY RUN, and its output is a PROPOSAL — not
// truth. Nothing here becomes a work item without a human promote.
//
// Industry-agnostic + config-driven: the target work-item kind comes from the
// installed configuration (input type `converts_to`, else first workflow). The
// engine never names a vertical.
//
// Pure: returns records to persist; the store writes them and logs events.

import type {
  AgentAction,
  AgentRun,
  InboundEvent,
  WorkItemProposal,
} from "@/core/types";
import type { PackagedConfiguration } from "@/core/config/types";

const rid = (p: string) => `${p}_${Math.random().toString(36).slice(2, 10)}`;

export interface ParsedCsv {
  headers: string[];
  rows: string[][];
}

/** Minimal, dependency-free CSV parse (no quoted-comma handling — idea state). */
export function parseCsv(text: string): ParsedCsv {
  const lines = text.replace(/\r\n/g, "\n").split("\n").filter((l) => l.trim().length > 0);
  if (lines.length === 0) return { headers: [], rows: [] };
  const split = (l: string) => l.split(",").map((c) => c.trim());
  const [head, ...rest] = lines;
  return { headers: split(head), rows: rest.map(split) };
}

export interface IngestResult {
  input: InboundEvent;
  run: AgentRun;
  actions: AgentAction[];
  proposals: WorkItemProposal[];
}

/** Resolve the work-item kind a CSV of this input type should convert into. */
function resolveTargetKind(cfg: PackagedConfiguration | undefined, inputType: string): string {
  const it = cfg?.inputTypes?.find((t) => t.key === inputType);
  if (it?.converts_to?.length) return it.converts_to[0];
  if (cfg?.workflows?.length) return cfg.workflows[0].kind;
  return `${cfg?.key ?? "core"}:review_import`;
}

/**
 * Interpret a CSV upload into staged Input + a dry-run intake AgentRun + a
 * human-review Proposal. The Input ends at `proposed` (raw text preserved); the
 * proposal must be promoted by a human before any record becomes a work item.
 */
export function interpretCsvUpload(
  workspaceId: string,
  filename: string,
  csvText: string,
  cfg: PackagedConfiguration | undefined,
  opts: { inputType?: string; sourceId?: string } | undefined,
  ts: string,
): IngestResult {
  const parsed = parseCsv(csvText);
  const inputType = opts?.inputType ?? cfg?.inputTypes?.[0]?.key ?? "spreadsheet_export";
  const rowCount = parsed.rows.length;

  const input: InboundEvent = {
    id: rid("in"),
    workspace_id: workspaceId,
    source: "csv_upload",
    source_id: opts?.sourceId ?? null,
    input_type: inputType,
    external_id: filename,
    raw_content_reference: `upload://${filename}`,
    raw_text: csvText,
    payload: { filename, row_count: rowCount, columns: parsed.headers },
    parsed_content: { headers: parsed.headers, row_count: rowCount },
    extracted_fields: { detected_columns: parsed.headers },
    confidence_score: parsed.headers.length > 0 ? 0.8 : 0.3,
    status: "proposed", // raw preserved; meaning not trusted until promoted
    received_at: ts,
    created_at: ts,
    updated_at: ts,
  };

  const run: AgentRun = {
    id: rid("run"),
    workspace_id: workspaceId,
    agent_name: "Intake Agent",
    interpreter_key: `${cfg?.key ?? "core"}:intake`,
    status: "succeeded",
    dry_run: true,
    summary: `Parsed ${rowCount} row(s) / ${parsed.headers.length} column(s) from ${filename}. Proposed 1 review work item; no records trusted until promoted.`,
    trigger_type: "new_input",
    source_input_id: input.id,
    prompt_reference: `${cfg?.key ?? "core"}/intake@1`,
    model: "rules/v0",
    confidence: input.confidence_score ?? null,
    started_at: ts,
    ended_at: ts,
    created_at: ts,
  };

  const actions: AgentAction[] = [
    { id: rid("act"), agent_run_id: run.id, action: "classify_input", detail: { input_type: inputType, columns: parsed.headers }, created_at: ts },
    { id: rid("act"), agent_run_id: run.id, action: "propose_work_item", detail: { row_count: rowCount }, created_at: ts },
  ];

  const targetKind = resolveTargetKind(cfg, inputType);
  const proposals: WorkItemProposal[] = [
    {
      id: rid("p"),
      workspace_id: workspaceId,
      agent_run_id: run.id,
      proposal_type: "work_item",
      title: `Review ${rowCount} imported ${inputType} record(s)`,
      summary: `CSV "${filename}" was parsed into ${rowCount} row(s). Review before the data is trusted.`,
      proposed: {
        kind: targetKind,
        title: `Review imported ${inputType} (${filename})`,
        priority: "medium",
        entity_id: null,
        context: { filename, row_count: rowCount, columns: parsed.headers, source_input_id: input.id },
      },
      rationale: `Intake agent (dry run) parsed ${rowCount} row(s) from ${filename}. Per the truth model, the upload is staged input — promoting this proposal is the human gate that turns it into real work.`,
      status: "proposed",
      risk_level: "low",
      required_review_role: "reviewer",
      confidence_score: input.confidence_score ?? null,
      evidence_references: [input.id],
      created_at: ts,
      reviewed_by: null,
      reviewed_at: null,
      promoted_work_item_id: null,
    },
  ];

  return { input, run, actions, proposals };
}
