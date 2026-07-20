// cartridges/wealth/cartridge.ts
//
// Cartridge 2 — Wealth / RIA Acquisition Readiness. This exists to PROVE the
// core is not a hotel app. An RIA owner preparing to be acquired runs the same
// OS spine: messy book/data comes in -> rules flag gaps -> proposals drafted ->
// human promotes -> readiness work executed -> evidence logged -> a diligence/
// readiness report is generated.

import { registerCartridge, type Cartridge } from "@/core/cartridge";
import { emptyBundle, type SeedBundle } from "@/core/data/store";

const K = "wealth";

function seed(ws: string): SeedBundle {
  const b = emptyBundle();
  const id = (s: string) => `${ws}__${s}`;
  const ts = "2026-06-10T14:00:00.000Z";

  // --- Entities (the nouns) -------------------------------------------------
  b.entities.push({
    id: id("firm"), workspace_id: ws, entity_type_key: "wealth:advisory_firm",
    title: "Cedar Ridge Wealth Advisors", created_at: ts,
    context: { aum_usd: 480_000_000, households: 312, advisors: 4, founder_book_pct: 61, recurring_rev_pct: 88 },
  });
  b.entities.push({
    id: id("hh_acme"), workspace_id: ws, entity_type_key: "wealth:household",
    title: "Holloway Family Trust", created_at: ts,
    context: { aum_usd: 78_000_000, pct_of_firm_aum: 16.3, primary_advisor: "Founder" },
  });

  // --- Work items (things to DO) -------------------------------------------
  b.workItems.push({
    id: id("wi_dataroom"), workspace_id: ws, kind: "wealth:data_room_cleanup",
    title: "Build & clean the acquisition data room", status: "in_progress",
    priority: "high", source: "manual", entity_id: id("firm"),
    assignee_id: id("u_owner"), assignee_name: "You (Owner)",
    context: { target_close: "2026-Q4", completeness_pct: 40 },
    created_at: ts, started_at: ts, completed_at: null,
  });
  b.workItems.push({
    id: id("wi_concentration"), workspace_id: ws, kind: "wealth:client_concentration_review",
    title: "Review client concentration risk (Holloway 16% of AUM)", status: "awaiting_review",
    priority: "high", source: "agent", entity_id: id("hh_acme"),
    assignee_id: null, assignee_name: null,
    context: { household: "Holloway Family Trust", pct_of_firm_aum: 16.3, threshold_pct: 10 },
    created_at: ts, started_at: ts, completed_at: null,
  });
  b.workItems.push({
    id: id("wi_docs"), workspace_id: ws, kind: "wealth:document_completeness_check",
    title: "Document completeness — ADV, comp agreements, client contracts", status: "open",
    priority: "medium", source: "manual", entity_id: id("firm"),
    assignee_id: id("u_owner"), assignee_name: "You (Owner)",
    context: { missing: ["Form ADV Part 2B (2 advisors)", "Signed IMA (14 households)"] },
    created_at: ts, started_at: null, completed_at: null,
  });

  // --- Checklist for the data-room work item -------------------------------
  const dr = id("wi_dataroom");
  ["Inventory every client agreement", "Reconcile AUM to custodian statements", "Redact PII for buyer review tier", "Tag revenue by recurring vs one-time", "Map founder-serviced households"].forEach((t, i) => {
    b.checklistItems.push({
      id: id(`ci_${i}`), work_item_id: dr, title: t, sort_order: i + 1,
      done: i < 2, done_at: i < 2 ? ts : null,
      detail: i === 4 ? "Founder dependency is the #1 buyer discount driver — see KB." : undefined,
    });
  });

  // --- Notes + evidence (reports are generated from evidence) ---------------
  b.notes.push({
    id: id("n1"), work_item_id: dr, author_id: id("u_owner"), author_name: "You (Owner)",
    body: "Custodian export reconciles to within $1.2M — variance is a pending fee accrual, documented.", created_at: ts,
  });
  b.evidence.push({
    id: id("ev1"), work_item_id: dr, kind: "measurement", label: "AUM reconciliation variance",
    value: { reported_usd: 480_000_000, custodian_usd: 481_200_000, variance_pct: 0.25 },
    document_id: id("doc_custody"), captured_by: `user:${id("u_owner")}`, created_at: ts,
  });
  b.evidence.push({
    id: id("ev2"), work_item_id: id("wi_concentration"), kind: "issue", label: "Single-household concentration above buyer threshold",
    value: { household: "Holloway Family Trust", pct_of_firm_aum: 16.3, buyer_threshold_pct: 10 },
    document_id: null, captured_by: "agent:run_readiness_1", created_at: ts,
  });

  // --- Documents ------------------------------------------------------------
  b.documents.push({ id: id("doc_custody"), workspace_id: ws, filename: "custodian_positions_2026Q2.csv", uri: "fixture://custodian_positions_2026Q2.csv", mime: "text/csv", created_at: ts });

  // --- Source (§3.7): where the book export came from ----------------------
  b.sources.push({
    id: id("src_custodian"), workspace_id: ws, name: "Custodian portal export",
    source_type: "csv_export", status: "active", connector_type: "manual_upload",
    reliability_score: 0.9, created_at: ts,
  });

  // --- Context objects (§3.10): versioned operating memory (SOPs/policies) --
  b.contextObjects.push({
    id: id("ctx_readiness"), workspace_id: ws, context_type: "sop",
    title: "Buyer readiness standard",
    body: "Acquirers discount for founder dependency, client concentration, missing client agreements, non-recurring revenue, and weak compliance evidence. A clean data room with reconciled AUM and complete IMAs is table stakes.",
    status: "active", version: 1, approved_by: id("u_owner"), created_at: ts,
  });
  b.contextObjects.push({
    id: id("ctx_concentration"), workspace_id: ws, context_type: "policy",
    title: "Concentration thresholds",
    body: "A single household above ~10% of firm AUM, or a single advisor above ~40% of the book, materially raises transition risk and must be flagged in diligence.",
    status: "active", version: 1, created_at: ts,
  });

  // --- Inbound -> agent run -> actions -> proposals (human-in-the-loop) -----
  b.inboundEvents.push({
    id: id("in1"), workspace_id: ws, source: "csv_upload", source_id: id("src_custodian"),
    external_id: "client_book_2026Q2", input_type: "spreadsheet_export",
    payload: { rows: 312, columns: ["household", "aum", "advisor", "recurring_fee", "inception"] },
    status: "converted", created_at: ts,
  });
  b.agentRuns.push({
    id: id("run1"), workspace_id: ws, interpreter_key: "wealth:readiness_scan",
    status: "succeeded", dry_run: true,
    summary: "Scanned 312-household book. Flagged 1 concentration risk, 16 missing IMAs, founder book at 61%.",
    created_at: ts,
  });
  b.agentActions.push({
    id: id("act1"), agent_run_id: id("run1"), action: "flag_concentration",
    detail: { household: "Holloway Family Trust", pct: 16.3 }, created_at: ts,
  });
  b.agentActions.push({
    id: id("act2"), agent_run_id: id("run1"), action: "flag_founder_dependency",
    detail: { founder_book_pct: 61, buyer_discount_risk: "high" }, created_at: ts,
  });

  // Proposals the human reviews (NOT auto-created work):
  b.proposals.push({
    id: id("p1"), workspace_id: ws, agent_run_id: id("run1"),
    proposed: {
      kind: "wealth:founder_dependency_assessment",
      title: "Reduce founder dependency — 61% of AUM is founder-serviced",
      priority: "high", entity_id: id("firm"),
      context: { founder_book_pct: 61, target_pct: 40 },
      checklist_template_key: "wealth:founder_dependency_assessment",
    },
    rationale: "Founder book at 61% is the largest single driver of buyer discount and transition risk. Propose a re-papering / advisor-transition plan.",
    status: "pending", created_at: ts, reviewed_by: null, reviewed_at: null, promoted_work_item_id: null,
  });
  b.proposals.push({
    id: id("p2"), workspace_id: ws, agent_run_id: id("run1"),
    proposed: {
      kind: "wealth:document_completeness_check",
      title: "Collect 16 missing signed IMAs before data-room open",
      priority: "medium", entity_id: id("firm"),
      context: { missing_imas: 16 },
    },
    rationale: "16 households lack a signed Investment Management Agreement on file — a hard diligence blocker.",
    status: "pending", created_at: ts, reviewed_by: null, reviewed_at: null, promoted_work_item_id: null,
  });

  // --- Decision + Approval (§3.20/§3.21): a PRIOR promote, shown explicitly --
  // The concentration review work item is the result of a human accepting an
  // agent flag — recorded as a Decision (selected action) and an Approval
  // (authorization), kept separate from the work item's own completion.
  b.decisions.push({
    id: id("dec_concentration"), workspace_id: ws, decision_type: "open_review",
    status: "executed", related_work_item_id: id("wi_concentration"), related_entity_id: id("hh_acme"),
    decision_summary: "Open a client-concentration review on Holloway Family Trust (16.3% of AUM)",
    selected_action: "create_work_item",
    rationale: "Single-household concentration exceeds the 10% buyer threshold; diligence will flag it, so address proactively.",
    decided_by: id("u_owner"), created_at: ts, updated_at: ts,
  });
  b.approvals.push({
    id: id("appr_concentration"), workspace_id: ws, approval_type: "proposal_promotion",
    status: "approved", approved_by: id("u_owner"), related_work_item_id: id("wi_concentration"),
    related_decision_id: id("dec_concentration"),
    approval_notes: "Approved — concentration is a known buyer-discount driver.", created_at: ts, updated_at: ts,
  });

  // --- Outcomes (§3.27): what the work is trying to move, with target/actual -
  b.outcomes.push({
    id: id("out_founder"), workspace_id: ws, outcome_type: "risk_reduction",
    name: "Reduce founder dependency", status: "active",
    description: "Bring founder-serviced book from 61% toward the 40% buyer-comfort line.",
    target_value: 40, actual_value: 61, value_category: "valuation_uplift", created_at: ts,
  });
  b.outcomes.push({
    id: id("out_readiness"), workspace_id: ws, outcome_type: "readiness",
    name: "Improve acquisition readiness", status: "active",
    description: "Raise composite readiness score ahead of the 2026-Q4 target close.",
    target_value: 90, actual_value: 52, value_category: "deal_velocity", created_at: ts,
  });

  // --- Dashboard (§3.26): a widget-composed view of the loop's real state ---
  b.dashboards.push({
    id: id("dash_readiness"), workspace_id: ws, name: "Acquisition Readiness", status: "active",
    dashboard_type: "readiness",
    widget_config: [
      { type: "metric", label: "Work completion", metric_name: "work_completion_rate" },
      { type: "metric", label: "Evidence coverage", metric_name: "evidence_coverage" },
      { type: "metric", label: "Proposal acceptance", metric_name: "proposal_acceptance_rate" },
      { type: "list", label: "Open gaps", filter: "status!=completed" },
    ],
    created_at: ts,
  });

  return b;
}

const cartridge: Cartridge = {
  key: K,
  label: "Wealth / RIA Acquisition Readiness",
  description: "Prepare an independent advisory firm to be acquired: data-room hygiene, concentration & founder-dependency risk, document completeness, and a diligence/readiness report.",
  version: 1,
  status: "active",
  vocabulary: {
    terms: { entity: "Firm / Household", work_item: "Readiness Task", evidence: "Diligence Proof", input: "Book Export" },
    statusLabels: { awaiting_review: "Owner review", completed: "Diligence-ready" },
  },
  inputTypes: [
    { key: "spreadsheet_export", label: "Book / positions export (CSV)", parsing_method: "csv", converts_to: ["wealth:data_room_cleanup"], review_required: true },
    { key: "compliance_doc", label: "Compliance document", parsing_method: "pdf", converts_to: ["wealth:compliance_evidence_gather"], review_required: true },
  ],
  sourceTypes: [
    { key: "custodian_export", label: "Custodian portal export", source_type: "csv_export", reliability_default: 0.9, requires_human_review: true },
  ],
  entityTypes: [
    { key: "wealth:advisory_firm", cartridge_key: K, label: "Advisory Firm", context_hint: "aum_usd, households, advisors, founder_book_pct, recurring_rev_pct" },
    { key: "wealth:advisor", cartridge_key: K, label: "Advisor", context_hint: "book_usd, households, tenure_years" },
    { key: "wealth:household", cartridge_key: K, label: "Household / Client", context_hint: "aum_usd, pct_of_firm_aum, primary_advisor" },
    { key: "wealth:revenue_stream", cartridge_key: K, label: "Revenue Stream", context_hint: "type (recurring|one_time), annual_usd" },
    { key: "wealth:document", cartridge_key: K, label: "Document", context_hint: "doc_type, status" },
  ],
  workflows: [
    { kind: "wealth:data_room_cleanup", label: "Data Room Cleanup", description: "Stand up and clean the buyer data room.", defaultChecklistKey: "wealth:data_room_cleanup" },
    { kind: "wealth:client_concentration_review", label: "Client Concentration Review", description: "Assess single-client / single-advisor concentration vs buyer thresholds." },
    { kind: "wealth:founder_dependency_assessment", label: "Founder Dependency Assessment", description: "Quantify and plan down founder-serviced book." },
    { kind: "wealth:document_completeness_check", label: "Document Completeness Check", description: "Verify ADV, comp agreements, IMAs, client contracts." },
    { kind: "wealth:compliance_evidence_gather", label: "Compliance Evidence Gather", description: "Collect compliance attestations and exam history." },
  ],
  checklistTemplates: [
    {
      key: "wealth:data_room_cleanup", cartridge_key: K, label: "Data Room Cleanup",
      items: [
        { title: "Inventory every client agreement", sort_order: 1 },
        { title: "Reconcile AUM to custodian statements", sort_order: 2 },
        { title: "Redact PII for buyer review tier", sort_order: 3 },
        { title: "Tag revenue by recurring vs one-time", sort_order: 4 },
        { title: "Map founder-serviced households", sort_order: 5 },
      ],
    },
    {
      key: "wealth:founder_dependency_assessment", cartridge_key: K, label: "Founder Dependency Assessment",
      items: [
        { title: "List households serviced primarily by the founder", sort_order: 1 },
        { title: "Identify transition advisor for each", sort_order: 2 },
        { title: "Draft client re-introduction plan", sort_order: 3 },
      ],
    },
  ],
  rules: [
    { key: "wealth:concentration", label: "Client concentration", when: "any household > 10% of firm AUM", produces: "client_concentration_review work item", severity: "warn" },
    { key: "wealth:founder_dependency", label: "Founder dependency", when: "founder-serviced book > 40% of AUM", produces: "founder_dependency_assessment proposal", severity: "critical" },
    { key: "wealth:doc_completeness", label: "Document completeness", when: "household missing signed IMA or ADV 2B missing for an advisor", produces: "document_completeness_check work item", severity: "warn" },
    { key: "wealth:revenue_quality", label: "Revenue quality", when: "recurring revenue < 80% of total", produces: "revenue_quality flag in readiness report", severity: "info" },
  ],
  knowledge: [
    { key: "wealth:buyer_readiness", title: "What buyers actually diligence", body: "# Buyer readiness\n\nAcquirers of RIAs discount for: founder dependency, client concentration, missing client agreements, non-recurring revenue, and weak compliance evidence. A clean data room with reconciled AUM and complete IMAs is table stakes." },
    { key: "wealth:concentration_thresholds", title: "Concentration thresholds", body: "# Concentration\n\nRule of thumb: a single household above ~10% of firm AUM, or a single advisor above ~40% of the book, materially raises transition risk and is flagged in diligence." },
  ],
  reports: [
    { key: "wealth:acquisition_readiness", cartridge_key: K, label: "Acquisition Readiness Report", description: "Composite readiness score with gaps and evidence." },
    { key: "wealth:diligence_package", cartridge_key: K, label: "Diligence Package", description: "Assembled, evidence-backed data-room index for a buyer." },
    { key: "wealth:transition_risk", cartridge_key: K, label: "Transition Risk Report", description: "Founder/advisor/client transition risk summary." },
  ],
  // --- config-as-data: automation, metrics, outcomes, agent boundaries ------
  automationKeys: [
    { key: "wealth:on_book_upload", label: "Book export uploaded", trigger: "new_input", condition: "input_type = spreadsheet_export", action: "run wealth:readiness_scan", allowed_agent: "intake", confidence_threshold: 0.6, approval_required: true, risk_level: "low", fallback: "queue for manual review" },
    { key: "wealth:on_missing_ima", label: "Missing IMA detected", trigger: "field_missing", condition: "household has no signed IMA", action: "propose document_completeness_check", allowed_agent: "work", approval_required: true, risk_level: "medium" },
  ],
  metrics: [
    { key: "wealth:readiness_score", label: "Acquisition readiness score", metric_type: "readiness", description: "Composite of data-room completeness, concentration, founder dependency, doc completeness.", calculation_method: "weighted gaps closed / total gaps", target: 90 },
    { key: "wealth:founder_book_pct", label: "Founder-serviced book %", metric_type: "risk", calculation_method: "founder AUM / total AUM", target: 40 },
    { key: "wealth:evidence_completeness", label: "Evidence completeness", metric_type: "evidence", calculation_method: "evidence items present / required across open work", target: 100 },
  ],
  outcomes: [
    { key: "wealth:reduce_founder_dependency", label: "Reduce founder dependency", outcome_type: "risk_reduction", value_category: "valuation_uplift", related_workflow_kinds: ["wealth:founder_dependency_assessment"], related_metric_keys: ["wealth:founder_book_pct"], measurement_method: "founder book % trend over readiness window" },
    { key: "wealth:improve_readiness", label: "Improve acquisition readiness", outcome_type: "readiness", value_category: "deal_velocity", related_workflow_kinds: ["wealth:data_room_cleanup", "wealth:document_completeness_check"], related_metric_keys: ["wealth:readiness_score"], measurement_method: "readiness score vs target close date" },
  ],
  agentInstructions: [
    { role: "intake", purpose: "Classify uploaded book/exports, extract household fields, flag uncertainty.", prompt_reference: "wealth/intake@1", allowed_outputs: ["classification", "proposed_work_item", "review_flag"], confidence_threshold: 0.6, human_review_required: true },
    { role: "report", purpose: "Draft the Acquisition Readiness Report from APPROVED evidence only, citing sources.", prompt_reference: "wealth/report@1", allowed_outputs: ["report_draft", "gap_list", "source_citation_map"], human_review_required: true, max_cost_estimate: 1.5 },
  ],
  seed,
};

registerCartridge(cartridge);
export default cartridge;
