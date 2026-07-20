// core/engine/rules.ts
//
// The generic RULES ENGINE — a cartridge-blind replication of the Dispatch beta's
// orchestration architecture (lib/orchestration/rules/index.ts `dispatch` +
// interpret.ts `interpret`), generalized off any vertical.
//
//   beta                         Dispatch OS (generic)
//   ----                         ---------------------
//   InboundEvent.event_type  ->  Input.input_type            (the trigger key)
//   GenerationRule           ->  GenerationRule (config)     (declarative rule)
//   interpret(rule, event)   ->  interpretRule(rule, input)  (rule -> draft|null)
//   dispatch(event)          ->  dispatchInput(input, cfg)   (fan-out + collect)
//   TaskDraft (dry-run)      ->  WorkItemProposal (dry-run)  (human-promote gate)
//
// Rules are DATA authored by a package; this engine reads them and never imports
// a cartridge. A rule produces a Proposal — not truth. Nothing becomes a work
// item without a human promote (CORE_OBJECT_MODEL §5, AGENT_AND_AUTOMATION §2).
//
// Pure: returns records to persist; the store writes them and logs events.

import type {
  AgentAction,
  AgentRun,
  Input,
  RiskLevel,
  WorkItemProposal,
} from "@/core/types";
import type { GenerationRule, PackagedConfiguration } from "@/core/config/types";

const rid = (p: string) => `${p}_${Math.random().toString(36).slice(2, 10)}`;

// ---------------------------------------------------------------------------
// Generic condition evaluation over an input's readable fields
// ---------------------------------------------------------------------------

/**
 * Flatten the input's interpretable surfaces into a single lookup the match
 * grammar reads from. Later spreads win, but all three are usually disjoint:
 * payload (raw signal), extracted_fields (agent-extracted), parsed_content.
 */
function readableFields(input: Input): Record<string, unknown> {
  return {
    input_type: input.input_type,
    source: input.source,
    status: input.status,
    ...(input.parsed_content ?? {}),
    ...(input.extracted_fields ?? {}),
    ...(input.payload ?? {}),
  };
}

function fieldStr(fields: Record<string, unknown>, key: string): string | undefined {
  const v = fields[key];
  if (v === undefined || v === null) return undefined;
  return String(v);
}

/** One clause: `field=v`, `field!=v`, or `field in a|b|c`. Mirrors the widget parser. */
function passesClause(raw: string, fields: Record<string, unknown>): boolean {
  const inMatch = raw.split(/\s+in\s+/i);
  if (inMatch.length === 2) {
    const set = new Set(inMatch[1].split("|").map((s) => s.trim()));
    const v = fieldStr(fields, inMatch[0].trim());
    return v !== undefined && set.has(v);
  }
  if (raw.includes("!=")) {
    const [f, val] = raw.split("!=").map((s) => s.trim());
    return fieldStr(fields, f) !== val;
  }
  if (raw.includes("=")) {
    const [f, val] = raw.split("=").map((s) => s.trim());
    return fieldStr(fields, f) === val;
  }
  // Bare field name = "field is present and truthy".
  const v = fields[raw.trim()];
  return v !== undefined && v !== null && v !== false && v !== "";
}

/** AND-join clauses with "&". Empty/undefined match = always passes. */
export function passesMatch(match: string | undefined, input: Input): boolean {
  if (!match || !match.trim()) return true;
  const fields = readableFields(input);
  return match.split("&").map((c) => c.trim()).filter(Boolean).every((c) => passesClause(c, fields));
}

// ---------------------------------------------------------------------------
// Title templating + priority/risk mapping
// ---------------------------------------------------------------------------

/** Replace `{field}` tokens from the input's readable fields; leave unknowns. */
function renderTitle(template: string, input: Input): string {
  const fields = readableFields(input);
  return template.replace(/\{(\w+)\}/g, (_m, key) => fieldStr(fields, key) ?? `{${key}}`);
}

/** WorkItem priority is low|medium|high; "critical" maps to high (kept in context). */
function toWorkItemPriority(p: GenerationRule["priority"]): "low" | "medium" | "high" {
  return p === "critical" ? "high" : (p ?? "medium");
}

function riskFor(rule: GenerationRule): RiskLevel {
  if (rule.risk_level) return rule.risk_level;
  return rule.priority === "critical" || rule.priority === "high" ? "medium" : "low";
}

// ---------------------------------------------------------------------------
// interpretRule — one rule + one input -> a Proposal, or null
// ---------------------------------------------------------------------------

/**
 * Turn a single generation rule + input into a dry-run WorkItemProposal, or null
 * if the rule doesn't apply. Trigger gate (input_type) first, then the optional
 * generic condition. Doesn't write anything — the caller collects + the store
 * persists.
 */
export function interpretRule(rule: GenerationRule, input: Input, ts: string): WorkItemProposal | null {
  // Trigger gate: input_type is the OS analogue of the beta's event_type.
  if (rule.trigger.input_type && rule.trigger.input_type !== input.input_type) return null;
  // Condition gate.
  if (!passesMatch(rule.trigger.match, input)) return null;

  const proposedPriority = toWorkItemPriority(rule.priority);
  const title = rule.output.title ? renderTitle(rule.output.title, input) : rule.description;

  const context: Record<string, unknown> = {
    rule_id: rule.id,
    source_input_id: input.id,
    ...(rule.automation_key ? { automation_key: rule.automation_key } : {}),
    ...(rule.impact_area ? { impact_area: rule.impact_area } : {}),
    ...(rule.value_category ? { value_category: rule.value_category } : {}),
    ...(rule.evidence_required?.length ? { evidence_required: rule.evidence_required } : {}),
    ...(rule.metric_updated?.length ? { metric_updated: rule.metric_updated } : {}),
    ...(rule.priority === "critical" ? { priority_label: "critical" } : {}),
    ...(rule.feedback ? { feedback: rule.feedback } : {}),
  };
  // Honor explicit context_to_attach field paths from the rule (beta parity).
  const fields = readableFields(input);
  for (const path of rule.context_to_attach ?? []) {
    if (fields[path] !== undefined) context[path] = fields[path];
  }

  return {
    id: rid("p"),
    workspace_id: input.workspace_id,
    agent_run_id: null, // set by dispatchInput when it builds the run
    proposal_type: rule.output.proposal_type ?? "work_item",
    title,
    summary: rule.description,
    proposed: {
      kind: rule.output.work_item_kind,
      title,
      priority: proposedPriority,
      entity_id: null,
      context,
    },
    rationale: `Rule ${rule.id} fired on input ${input.id} (${input.input_type ?? "unknown type"}). Per the truth model this is a dry-run proposal — a human promote turns it into real work.`,
    status: "proposed",
    risk_level: riskFor(rule),
    required_review_role: rule.review_role ?? "reviewer",
    confidence_score: input.confidence_score ?? null,
    evidence_references: [input.id],
    created_at: ts,
    reviewed_by: null,
    reviewed_at: null,
    promoted_work_item_id: null,
  };
}

// ---------------------------------------------------------------------------
// Rules registry helpers + dispatch
// ---------------------------------------------------------------------------

/** All generation rules whose trigger matches this input's type (+ untyped rules). */
export function getRulesForInput(cfg: PackagedConfiguration | undefined, input: Input): GenerationRule[] {
  const rules = cfg?.generationRules ?? [];
  return rules.filter((r) => !r.trigger.input_type || r.trigger.input_type === input.input_type);
}

export interface DispatchResult {
  run: AgentRun;
  actions: AgentAction[];
  proposals: WorkItemProposal[];
  /** Rule ids that matched the input type but failed their condition guard. */
  skipped: { rule_id: string; reason: string }[];
}

/**
 * dispatchInput — fan a staged input through the package's generation rules and
 * collect dry-run proposals. Produces one logged AgentRun (the rules pass) with
 * an AgentAction per fired rule. Mirrors the beta's dispatch(): filter by
 * trigger, interpret each, collect. The store persists the result.
 */
export function dispatchInput(
  input: Input,
  cfg: PackagedConfiguration | undefined,
  ts: string,
): DispatchResult {
  const candidates = getRulesForInput(cfg, input);
  const proposals: WorkItemProposal[] = [];
  const skipped: { rule_id: string; reason: string }[] = [];

  const run: AgentRun = {
    id: rid("run"),
    workspace_id: input.workspace_id,
    agent_name: "Rules Engine",
    interpreter_key: `${cfg?.key ?? "core"}:rules`,
    status: "succeeded",
    dry_run: true,
    summary: "", // filled in after we know the counts
    trigger_type: "new_input",
    source_input_id: input.id,
    prompt_reference: `${cfg?.key ?? "core"}/rules@1`,
    model: "rules/v0",
    confidence: input.confidence_score ?? null,
    started_at: ts,
    ended_at: ts,
    created_at: ts,
  };

  const actions: AgentAction[] = [];
  for (const rule of candidates) {
    const proposal = interpretRule(rule, input, ts);
    if (!proposal) {
      skipped.push({ rule_id: rule.id, reason: "condition not met" });
      continue;
    }
    proposal.agent_run_id = run.id;
    proposals.push(proposal);
    actions.push({
      id: rid("act"),
      agent_run_id: run.id,
      action: "rule_fired",
      detail: { rule_id: rule.id, work_item_kind: rule.output.work_item_kind, priority: rule.priority ?? "medium" },
      created_at: ts,
    });
  }

  run.summary =
    `Evaluated ${candidates.length} rule(s) for input ${input.id} (${input.input_type ?? "unknown"}). ` +
    `Fired ${proposals.length}, skipped ${skipped.length}. No records trusted until promoted.`;

  return { run, actions, proposals, skipped };
}
