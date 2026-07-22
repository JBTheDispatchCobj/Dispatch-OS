// cartridges/cooperative_markets/seed.ts
//
// Demo fixtures for the Cooperative Markets cartridge — a realistic operating-loop
// slice so the cartridge is immediately demoable in the running app: a call report
// comes in → an agent flags an innovation opportunity → proposals are drafted → a
// human promotes one into a scoped pilot → evidence + decision + approval are
// recorded → metrics/outcomes/dashboards reflect the real state. It mirrors the
// Auric lens scenario (auric_lens.ts): Summit Ridge FCU × Halcyon Pay.
//
// Truth discipline (DOCTRINE / ADR-0005): the agent DRY-RUNS and proposes; nothing
// regulated auto-promotes. Scores are sourced inferences; the pilot exists because
// a human approved a decision, recorded separately from the work's own completion.

import { emptyBundle, type SeedBundle } from "@/core/data/store";

export function seed(ws: string): SeedBundle {
  const b = emptyBundle();
  const id = (s: string) => `${ws}__${s}`;
  const ts = "2026-07-20T15:00:00.000Z";

  // --- Entities (the nouns) -------------------------------------------------
  b.entities.push({
    id: id("cu_summit"), workspace_id: ws, entity_type_key: "cooperative_markets:credit_union",
    title: "Summit Ridge Federal Credit Union", created_at: ts,
    context: { assets_usd: 842_000_000, members: 61_400, net_worth_ratio: 6.8, member_growth_yoy: 7.2, digital_adoption: 0.71, core_processor: "Symitar", region: "Mountain West", innovation_score: 70 },
  });
  b.entities.push({
    id: id("co_halcyon"), workspace_id: ws, entity_type_key: "cooperative_markets:innovation_company",
    title: "Halcyon Pay", created_at: ts,
    context: { stage: "series_b", category: "real_time_payments", cu_integrations: 14, soc2: "type_ii", funding_usd: 38_000_000, readiness: 0.78 },
  });
  b.entities.push({
    id: id("cuso_ridge"), workspace_id: ws, entity_type_key: "cooperative_markets:cuso",
    title: "Ridgeline CUSO", created_at: ts,
    context: { owners: 6, services: ["payments", "lending_tech"], vendor_risk_rating: "moderate" },
  });
  b.entities.push({
    id: id("exec_ceo"), workspace_id: ws, entity_type_key: "cooperative_markets:executive",
    title: "CEO — Summit Ridge FCU", created_at: ts,
    context: { function: "CEO", institution: id("cu_summit"), incentives: ["growth", "franchise_value", "positioning"], lens: "ceo" },
  });
  b.entities.push({
    id: id("exec_clo"), workspace_id: ws, entity_type_key: "cooperative_markets:executive",
    title: "CLO — Summit Ridge FCU", created_at: ts,
    context: { function: "CLO", institution: id("cu_summit"), incentives: ["risk", "compliance", "defensibility"], lens: "clo" },
  });
  b.entities.push({
    id: id("cr_2026q1"), workspace_id: ws, entity_type_key: "cooperative_markets:call_report",
    title: "Summit Ridge FCU — 5300 (2026 Q1)", created_at: ts,
    context: { period: "2026Q1", net_worth_ratio: 6.8, roa: 0.62, loan_to_share: 84.1, delinquency: 0.71, member_growth_yoy: 7.2 },
  });

  // --- Source + inbound call report -> agent run -> actions -----------------
  b.sources.push({
    id: id("src_ncua"), workspace_id: ws, name: "NCUA Call Report / FPR feed",
    source_type: "api", status: "active", connector_type: "ncua_call_reports",
    reliability_score: 0.98, created_at: ts,
  });
  b.inboundEvents.push({
    id: id("in_5300"), workspace_id: ws, source: "api", source_id: id("src_ncua"),
    external_id: "5300:summit_ridge:2026q1", input_type: "ncua_5300_call_report",
    payload: { institution: "Summit Ridge FCU", period: "2026Q1", net_worth_ratio: 6.8, roa: 0.62, member_growth_yoy: 7.2 },
    status: "converted", created_at: ts,
  });
  b.agentRuns.push({
    id: id("run_scan"), workspace_id: ws, interpreter_key: "cooperative_markets:call_report_analysis",
    agent_name: "Intake Agent", status: "succeeded", dry_run: true,
    prompt_reference: "cooperative_markets/intake@1", source_input_id: id("in_5300"), related_entity_id: id("cu_summit"),
    summary: "Analyzed Summit Ridge 5300 (2026Q1): net worth 6.8% (PCA-sensitive), members +7.2%, high digital adoption. Matched a capital-light real-time-payments capability (Halcyon Pay, opportunity score 78).",
    created_at: ts,
  });
  b.agentActions.push({
    id: id("act_flag"), agent_run_id: id("run_scan"), action: "flag_opportunity",
    detail: { company: "Halcyon Pay", opportunity_score: 78, capital_intensity: "low" }, created_at: ts,
  });
  b.agentActions.push({
    id: id("act_risk"), agent_run_id: id("run_scan"), action: "flag_pca_pressure",
    detail: { net_worth_ratio: 6.8, note: "any initiative must be capital-light" }, created_at: ts,
  });

  // --- Proposals the human reviews (NOT auto-created work) ------------------
  b.proposals.push({
    id: id("prop_match"), workspace_id: ws, agent_run_id: id("run_scan"),
    proposal_type: "work_item", title: "Review CU↔company match: Summit Ridge × Halcyon Pay",
    proposed: {
      kind: "cooperative_markets:match_review",
      title: "Match review — Summit Ridge FCU × Halcyon Pay (RTP)",
      priority: "high", entity_id: id("cu_summit"),
      context: { company: "Halcyon Pay", opportunity_score: 78, strategic_fit: 0.82, regulatory_fit: 0.74 },
    },
    rationale: "Strategic and regulatory fit both above threshold; capital-light capability fits the CU's PCA constraint. Human approval required before outreach.",
    status: "proposed", created_at: ts, reviewed_by: null, reviewed_at: null, promoted_work_item_id: null,
  });

  // --- The promoted work: a scoped pilot (with its checklist) ---------------
  const pilot = id("wi_pilot");
  b.workItems.push({
    id: pilot, workspace_id: ws, kind: "cooperative_markets:pilot_management",
    title: "Scope a capital-light RTP pilot — Summit Ridge × Halcyon Pay", status: "in_progress",
    priority: "high", source: "agent", entity_id: id("cu_summit"),
    assignee_id: id("u_ops"), assignee_name: "Operations Lead",
    context: { company: "Halcyon Pay", success_metrics: ["settlement_time", "member_adoption"], controls: ["real_time_ofac", "reg_e_windows"], go_no_go: "2026-09-15" },
    created_at: ts, started_at: ts, completed_at: null,
  });
  ["Define pilot scope and success metrics", "Confirm compliance guardrails (BSA/AML, OFAC, Reg E)", "Sign pilot agreement / limited MSA", "Provision sandbox / integration access", "Set go/no-go decision date and criteria"].forEach((t, i) => {
    b.checklistItems.push({ id: id(`ci_${i}`), work_item_id: pilot, title: t, sort_order: i + 1, done: i < 2, done_at: i < 2 ? ts : null });
  });
  b.notes.push({
    id: id("n_pilot"), work_item_id: pilot, author_id: id("u_ops"), author_name: "Operations Lead",
    body: "Scoped as capital-light: no core replacement, sandboxed integration. Compliance signed off on the real-time OFAC + Reg E control set for the pilot boundary.", created_at: ts,
  });

  // --- Evidence (reports are generated FROM evidence) -----------------------
  b.documents.push({ id: id("doc_soc2"), workspace_id: ws, filename: "halcyon_pay_soc2_typeii.pdf", uri: "fixture://halcyon_pay_soc2_typeii.pdf", mime: "application/pdf", created_at: ts });
  b.evidence.push({
    id: id("ev_score"), work_item_id: pilot, kind: "measurement", label: "Opportunity score (sourced inference)",
    value: { opportunity_score: 78, strategic_fit: 0.82, regulatory_fit: 0.74, capital_intensity: "low" },
    document_id: null, captured_by: "agent:run_scan", created_at: ts, review_status: "approved", reviewed_by: id("u_ops"), reviewed_at: ts,
  });
  b.evidence.push({
    id: id("ev_soc2"), work_item_id: pilot, kind: "attestation", label: "Vendor SOC 2 Type II on file",
    value: { vendor: "Halcyon Pay", report: "SOC 2 Type II", cu_integrations: 14 },
    document_id: id("doc_soc2"), captured_by: `user:${id("u_ops")}`, created_at: ts, review_status: "approved", reviewed_by: id("u_ops"), reviewed_at: ts,
  });
  // An UNREVIEWED, agent-captured, older observation so `/evidence` shows its full
  // state legend over LIVE data: pending_approval (awaiting human review), inferred
  // (agent-captured — a Dispatch inference, not a fact), and stale (past its
  // freshness window). Reviewing it routes through the permission-engine contract
  // (app/contracts.reviewEvidence) — never auto-approved. Demo fixture.
  b.evidence.push({
    id: id("ev_delinquency"), work_item_id: pilot, kind: "observation", label: "Delinquency trend flag (agent-observed, unreviewed)",
    value: { metric: "delinquency_ratio", trend: "rising", quarters: 2, note: "self-reported; awaiting analyst confirmation" },
    document_id: null, captured_by: "agent:run_scan", created_at: "2026-02-15T00:00:00.000Z",
  });

  // --- Decision + Approval: the pilot exists because a human approved -------
  b.decisions.push({
    id: id("dec_pilot"), workspace_id: ws, decision_type: "advance_stage", status: "executed",
    related_work_item_id: pilot, related_entity_id: id("cu_summit"),
    decision_summary: "Advance Summit Ridge × Halcyon Pay from evaluation to a scoped pilot",
    selected_action: "create_work_item", agent_proposal_id: id("prop_match"),
    rationale: "Fit above threshold, capability is capital-light, compliance controls scoped. Proceed to a bounded pilot.",
    decided_by: id("u_ceo"), created_at: ts, updated_at: ts,
  });
  b.approvals.push({
    id: id("appr_pilot"), workspace_id: ws, approval_type: "proposal_promotion", status: "approved",
    approved_by: id("u_ceo"), related_work_item_id: pilot, related_decision_id: id("dec_pilot"), related_agent_proposal_id: id("prop_match"),
    approval_notes: "Approved — capital-light, exam-defensible control set. Green-light the pilot.", created_at: ts, updated_at: ts,
  });
  // A PENDING, high-risk approval so the live human gate has something awaiting a
  // decision on `/approvals`: a capital-allocation sign-off is regulated + owner/
  // admin-only (restricted). It is NEVER auto-decided — the decision routes through
  // the permission-engine contract (app/contracts.decideApproval). Demo fixture.
  b.approvals.push({
    id: id("appr_alloc"), workspace_id: ws, approval_type: "capital_allocation", status: "requested",
    requested_by: id("u_ops"), related_work_item_id: pilot, related_decision_id: id("dec_pilot"),
    approval_notes: null, created_at: ts, updated_at: ts,
  });
  // A PENDING report_sharing approval — the EDITORIAL/SHARE gate surfaced on `/reports`
  // (the report-lifecycle realization of the EditorialDisposition family). The linked
  // report stays `under_review` until an authorized human clears it; it is NEVER
  // auto-shared — the decision routes through the permission engine on `/approvals`
  // (store.requestReportShare → store.setReportStatus). Demo fixture.
  b.approvals.push({
    id: id("appr_share"), workspace_id: ws, approval_type: "report_sharing", status: "requested",
    requested_by: id("u_ops"), approval_notes: null,
    metadata: { report_id: id("rpt_brief"), report_key: "cooperative_markets:opportunity_brief" },
    created_at: ts, updated_at: ts,
  });

  // --- Context objects (versioned operating memory) ------------------------
  b.contextObjects.push({
    id: id("ctx_thesis"), workspace_id: ws, context_type: "policy", title: "Cooperative Markets thesis",
    body: "Make institutions more innovative and innovation more institutional-grade. Score, match, and move relationships along discovery→…→investment. Scores are sourced inferences; recommendations are human-approved proposals with lineage.",
    status: "active", version: 1, approved_by: id("u_ceo"), created_at: ts,
  });
  b.contextObjects.push({
    id: id("ctx_lens"), workspace_id: ws, context_type: "sop", title: "Executive lenses (CEO ≠ CLO)",
    body: "The same insight lands differently by role: CEO reads growth/positioning, CLO reads risk/defensibility. Author a base intelligence object plus a role-lens variant so the hook matches incentives without changing the facts.",
    status: "active", version: 1, created_at: ts,
  });

  // --- Metrics (sourced inferences) ----------------------------------------
  b.metrics.push({ id: id("m_readiness"), workspace_id: ws, metric_name: "cooperative_markets:institution_readiness", metric_value: 72, metric_type: "readiness", measured_at: ts, related_entity_id: id("cu_summit"), calculation_method: "weighted sourced sub-scores", created_at: ts });
  b.metrics.push({ id: id("m_opp"), workspace_id: ws, metric_name: "cooperative_markets:opportunity_score", metric_value: 78, metric_type: "operational", measured_at: ts, related_entity_id: id("cu_summit"), calculation_method: "strategic_fit × regulatory_fit × timing", created_at: ts });

  // --- Outcomes (what the work is trying to move) --------------------------
  b.outcomes.push({
    id: id("out_pilot"), workspace_id: ws, outcome_type: "activation", name: "Pilots launched", status: "active",
    description: "Move qualified matches into scoped pilots.", target_value: 1, actual_value: 0,
    value_category: "integration", related_metric_ids: ["cooperative_markets:pipeline_velocity"], created_at: ts,
  });
  b.outcomes.push({
    id: id("out_deal"), workspace_id: ws, outcome_type: "subscription", name: "Deal-flow access value", status: "active",
    description: "Qualified matches delivered to subscribers per period.", target_value: 10, actual_value: 3,
    value_category: "deal_velocity", related_metric_ids: ["cooperative_markets:opportunity_score"], created_at: ts,
  });

  // --- Dashboard (widget-composed view of real loop state) -----------------
  b.dashboards.push({
    id: id("dash_pipeline"), workspace_id: ws, name: "Opportunity Pipeline", status: "active", dashboard_type: "pipeline",
    widget_config: [
      { type: "metric", label: "Opportunity score", metric_name: "cooperative_markets:opportunity_score" },
      { type: "metric", label: "Institution readiness", metric_name: "cooperative_markets:institution_readiness" },
      { type: "list", label: "Open opportunities", filter: "status!=completed" },
    ],
    created_at: ts,
  });

  // --- Reports (generated FROM evidence; sharing is a human editorial act) --------
  // Real ReportRun objects so `/reports` renders its full state legend over LIVE data:
  //   current (shared + fresh) · pending_approval (under_review + the requested
  //   report_sharing approval above) · stale (aged out + missing-data gaps, shown never
  //   hidden) · restricted (an internal draft, not cleared for sharing). Sharing is
  //   NEVER auto-decided — it routes through the permission engine on `/approvals`.
  b.reports.push({
    id: id("rpt_scorecard"), workspace_id: ws, report_key: "cooperative_markets:institution_scorecard",
    title: "Summit Ridge FCU — Institution Scorecard", generated_at: ts, status: "shared",
    generated_by: `user:${id("u_ops")}`,
    source_references: [id("ev_score"), id("ev_soc2"), "cooperative_markets:institution_readiness"],
    sections: [
      { heading: "Financial health", body: "Net-worth ratio 6.8%, ROA 0.62%, loan-to-share 84.1% — adequate capitalization.", source_references: [id("ev_score")] },
      { heading: "Innovation readiness", body: "Digital adoption 0.71; core Symitar; readiness inference 0.78.", source_references: [id("ev_soc2")] },
    ],
  });
  b.reports.push({
    id: id("rpt_brief"), workspace_id: ws, report_key: "cooperative_markets:opportunity_brief",
    title: "Summit Ridge × Halcyon Pay — Opportunity Brief (CEO lens)", generated_at: ts, status: "under_review",
    generated_by: `user:${id("u_ops")}`, source_references: [id("ev_score")],
    sections: [{ heading: "Thesis", body: "Capital-light RTP pilot; strategic fit 0.82, regulatory fit 0.74 (sourced inferences).", source_references: [id("ev_score")] }],
  });
  b.reports.push({
    id: id("rpt_icmemo"), workspace_id: ws, report_key: "cooperative_markets:ic_memo",
    title: "Halcyon Pay — Investment Committee Memo (draft snapshot)", generated_at: "2026-03-01T00:00:00.000Z", status: "generated",
    generated_by: "agent:run_scan", source_references: [id("ev_soc2")],
    missing_data_notes: ["Audited FY2025 financials not yet on file", "Third-party pentest attestation pending analyst confirmation"],
    sections: [{ heading: "Recommendation", body: "Recommend-with-conditions, pending the missing diligence items noted below.", source_references: [id("ev_soc2")] }],
  });
  b.reports.push({
    id: id("rpt_draft"), workspace_id: ws, report_key: "cooperative_markets:institution_scorecard",
    title: "Harbor Point CU — Institution Scorecard (internal draft)", generated_at: ts, status: "draft",
    generated_by: `user:${id("u_ops")}`, sections: [{ heading: "Draft", body: "Internal working draft — not cleared for sharing.", source_references: [] }],
  });

  return b;
}

export default seed;
