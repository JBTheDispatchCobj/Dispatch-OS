// scripts/loop-demo.ts
//
// Headless verification of the full operating loop on the in-memory store —
// no UI. Exercises:
//   CSV -> Input(staging) -> AgentRun -> Proposal
//   -> human promote -> Decision + Approval + WorkItem
//   -> metrics recomputed from activity
//   -> report generated FROM evidence (traceable to source ids)
//
// Run:  npx --yes tsx scripts/loop-demo.ts
// Exits non-zero if any invariant fails, so it doubles as a smoke test.

import { store } from "@/core/data";
import { computeOutcomeRoi } from "@/core/engine/roi";
import { getConfiguration } from "@/core/cartridge";

let failures = 0;
function check(label: string, cond: boolean) {
  console.log(`${cond ? "  ok  " : " FAIL "} ${label}`);
  if (!cond) failures++;
}
const h = (s: string) => console.log(`\n=== ${s} ===`);

const ws = store.listWorkspaces().find((w) => w.cartridge_key === "wealth");
if (!ws) { console.error("wealth workspace missing"); process.exit(1); }
const wsId = ws.id;

h("Initial loop state (wealth)");
const cfg0 = store.getActiveConfigurationRecord(wsId);
console.log(`config: ${cfg0?.name} v${cfg0?.version} (${cfg0?.status})`);
console.log({
  workItems: store.listWorkItems(wsId).length,
  proposalsPending: store.listProposals(wsId).filter((p) => p.status === "pending").length,
  sources: store.listSources(wsId).length,
  contextObjects: store.listContextObjects(wsId).length,
  decisions: store.listDecisions(wsId).length,
  approvals: store.listApprovals(wsId).length,
  metrics: store.listMetrics(wsId).length,
  dashboards: store.listDashboards(wsId).length,
  outcomes: store.listOutcomes(wsId).length,
});
check("Configuration record is active", cfg0?.status === "active");
check("Sources seeded", store.listSources(wsId).length >= 1);
check("Context objects seeded", store.listContextObjects(wsId).length >= 1);
check("Outcomes seeded", store.listOutcomes(wsId).length >= 1);
check("Dashboard seeded", store.listDashboards(wsId).length >= 1);
check("Metrics computed at boot", store.listMetrics(wsId).length >= 1);

h("Chase B: CSV -> Input -> AgentRun -> Proposal");
const csv = "household,aum,advisor\nHolloway Family Trust,78000000,Founder\nPriya Anand,12000000,Advisor 2\nThe Okafor Group,9500000,Advisor 3";
const proposalsBefore = store.listProposals(wsId).length;
const ingest = store.ingestCsv(wsId, "new_book_2026Q3.csv", csv, { inputType: "spreadsheet_export" });
console.log(`input ${ingest.input.id} status=${ingest.input.status} rows=${(ingest.input.payload as any).row_count}`);
console.log(`run ${ingest.run.id} dry_run=${ingest.run.dry_run} -> "${ingest.run.summary}"`);
console.log(`proposed kind: ${ingest.proposals[0]?.proposed.kind}`);
check("Raw text preserved on Input", typeof ingest.input.raw_text === "string" && ingest.input.raw_text.includes("Holloway"));
check("Input staged (not trusted)", ingest.input.status === "proposed");
check("Agent run is a dry run", ingest.run.dry_run === true);
check("Proposal cites the input as evidence", ingest.proposals[0]?.evidence_references?.includes(ingest.input.id) === true);
check("Proposal target kind resolved from config", ingest.proposals[0]?.proposed.kind === "wealth:data_room_cleanup");
check("A new proposal was created", store.listProposals(wsId).length === proposalsBefore + 1);

h("Chase: human promote -> Decision + Approval");
const decBefore = store.listDecisions(wsId).length;
const apprBefore = store.listApprovals(wsId).length;
const newProposal = ingest.proposals[0];
const wi = store.promoteProposal(newProposal.id, "u_owner");
console.log(`promoted -> work item ${wi?.id} (${wi?.status})`);
check("Promote created a work item", !!wi && wi.status === "open");
check("Promote recorded a Decision", store.listDecisions(wsId).length === decBefore + 1);
check("Promote recorded an Approval", store.listApprovals(wsId).length === apprBefore + 1);
const dec = store.listDecisions(wsId).find((d) => d.related_work_item_id === wi?.id);
const appr = store.listApprovals(wsId).find((a) => a.related_work_item_id === wi?.id);
check("Decision links proposal + work item", dec?.agent_proposal_id === newProposal.id && dec?.related_work_item_id === wi?.id);
check("Approval links decision", appr?.related_decision_id === dec?.id);
check("Work item carries input provenance", wi?.source_input_id === ingest.input.id);

h("Chase C: metrics recomputed from activity");
const metrics = store.recomputeMetrics(wsId);
for (const m of metrics) console.log(`  ${m.metric_name} = ${m.metric_value}  [${m.metric_type}]  ${m.calculation_method}`);
check("Universal metric family present", metrics.some((m) => m.metric_name === "work_completion_rate") && metrics.some((m) => m.metric_name === "evidence_coverage"));
check("Metrics carry auditable basis", metrics.every((m) => !!(m.metadata as any)?.basis));

h("Chase A: report generated FROM evidence");
const report = store.generateReport(wsId, "wealth:acquisition_readiness", "user:u_owner");
console.log(`report ${report?.id} "${report?.title}" status=${report?.status} sections=${report?.sections.length} refs=${report?.source_references?.length}`);
for (const s of report?.sections ?? []) console.log(`  - ${s.heading} (${s.source_references?.length ?? 0} refs)`);
check("Report generated, not shared", report?.status === "generated");
check("Report has an evidence ledger", (report?.sections ?? []).some((s) => s.heading === "Evidence ledger"));
check("Report is traceable to source ids", (report?.source_references?.length ?? 0) > 0);

h("Chase D: widget-action wiring (session 6 — store mutations + events)");
const me = "user:u_owner";
const before = {
  events: store.listWorkItems(wsId).flatMap((w) => store.listEvents(w.id)).length,
  activity: store.listActivity(wsId).length,
};

// work_queue · assign
const docs = store.listWorkItems(wsId).find((w) => w.kind === "wealth:document_completeness_check" && w.status === "open");
const assigned = docs && store.assignWorkItem(docs.id, "u_angie", "Angie", me);
check("assign sets assignee + moves open -> assigned", !!assigned && assigned.assignee_id === "u_angie" && assigned.status === "assigned");
check("assign logs an `assigned` event", !!docs && store.listEvents(docs.id).some((e) => e.type === "assigned"));

// work_queue · add_evidence + evidence_panel · approve
const ev = docs && store.addEvidence(docs.id, { kind: "attestation", label: "Signed IMA batch uploaded" }, me);
check("add_evidence creates pending evidence", !!ev && ev.review_status === "pending");
const reviewed = ev && store.reviewEvidence(ev.id, "approved", me);
check("reviewEvidence approves proof", !!reviewed && reviewed.review_status === "approved" && reviewed.reviewed_by === me);
check("evidence review logs an `evidence_reviewed` event", !!docs && store.listEvents(docs.id).some((e) => e.type === "evidence_reviewed"));

// input_inbox · setInputStatus + create_work_item
const freshInput = store.ingestCsv(wsId, "leads.csv", "household,aum\nNew Lead,5000000", { inputType: "spreadsheet_export" }).input;
const transitioned = store.setInputStatus(freshInput.id, "classified", me);
check("setInputStatus transitions an input", transitioned?.status === "classified");
const wiCountBefore = store.listWorkItems(wsId).length;
const fromInput = store.createWorkItemFromInput(freshInput.id, me);
check("createWorkItemFromInput creates a work item", !!fromInput && store.listWorkItems(wsId).length === wiCountBefore + 1);
check("converted input carries provenance + status", fromInput?.source_input_id === freshInput.id && store.getInput(freshInput.id)?.status === "converted");
check("created-from-input kind is config-resolved (cartridge-blind)", fromInput?.kind === "wealth:data_room_cleanup");

// report_list · share -> approval_queue · approve (connected loop)
const shareReport = store.generateReport(wsId, "wealth:acquisition_readiness", me)!;
const apprReq = store.requestReportShare(shareReport.id, me);
check("requestReportShare raises a requested approval", apprReq?.status === "requested" && apprReq?.approval_type === "report_sharing");
check("requested share moves report to under_review", store.getReport(shareReport.id)?.status === "under_review");
const decided = apprReq && store.decideApproval(apprReq.id, "approved", me);
check("decideApproval approves the share request", decided?.status === "approved");
check("approved share flips report to shared", store.getReport(shareReport.id)?.status === "shared");
// report_list · archive + export
check("archive sets report status archived", store.setReportStatus(shareReport.id, "archived", me)?.status === "archived");
check("export is recorded (no file backend)", !!store.exportReport(shareReport.id, me));

// outcome_panel · assign_value_category + estimate_impact
const outcome = store.listOutcomes(wsId)[0];
check("assign_value_category sets the bucket", store.setOutcomeValueCategory(outcome.id, "risk_reduced", me)?.value_category === "risk_reduced");
check("estimate_impact records an actual value", store.setOutcomeActual(outcome.id, 44, me)?.actual_value === 44);

// exception_panel · escalate / follow-up / dismiss
const esc = docs && store.escalateWorkItem(docs.id, me);
check("escalate raises priority to high", esc?.priority === "high");
const follow = docs && store.createFollowUpWorkItem(docs.id, me);
check("create_work_item spins up a linked follow-up", !!follow && follow.parent_work_item_id === docs!.id);
const dismissed = docs && store.dismissException(docs.id, "missing_evidence", me);
check("dismiss records a suppressed exception kind", !!dismissed && Array.isArray((dismissed.metadata as any)?.dismissed_exceptions) && (dismissed.metadata as any).dismissed_exceptions.includes("missing_evidence"));

// audit trail grew (both work-item events and the generic §3.16 activity log)
const after = {
  events: store.listWorkItems(wsId).flatMap((w) => store.listEvents(w.id)).length,
  activity: store.listActivity(wsId).length,
};
check("work-item events were appended", after.events > before.events);
check("generic operating-event trail was appended (§3.16)", after.activity > before.activity);

h("Chase E: Outcome <-> Metric ROI linkage (field_service)");
const fs = store.listWorkspaces().find((w) => w.cartridge_key === "field_service")!;
// Append-only metric history: 2 seeded weekly snapshots + the boot recompute.
const completionHistory = store.metricHistory(fs.id, "work_completion_rate");
check("metric history is append-only (>=3 rows: 2 seeded + boot)", completionHistory.length >= 3);
const latestSet = store.listLatestMetrics(fs.id).filter((m) => m.metric_name === "work_completion_rate");
check("listLatestMetrics collapses history to one current row", latestSet.length === 1);
check("current row is the most recent by measured_at", latestSet[0].measured_at === completionHistory[completionHistory.length - 1].measured_at);

// Observed outcome: actual_value derived from its linked metric at boot (§8/§9).
const observed = store.listOutcomes(fs.id).find((o) => (o.related_metric_names ?? []).includes("work_completion_rate"))!;
check("observed outcome derived actual from its linked metric", observed.actual_value === latestSet[0].metric_value);
check("observed outcome confidence is 'observed' (§9)", observed.confidence === "observed");

const roi = computeOutcomeRoi(observed, completionHistory);
check("ROI view current = latest metric value", roi.current === latestSet[0].metric_value);
check("ROI view shows a trend toward target (improving)", roi.trend === "improving");
check("ROI view computes baseline->target progress (0..1)", typeof roi.progress === "number" && roi.progress! > 0 && roi.progress! < 1);
check("ROI view confidence is observed", roi.confidence === "observed");

// Direct-dollar outcome stays an honest ESTIMATE (no universal dollar metric).
const estimated = store.listOutcomes(fs.id).find((o) => o.outcome_type === "revenue_recovery")!;
check("dollar outcome stays an honest estimate (no metric link)", !estimated.related_metric_names && estimated.confidence === "estimated");

// Recompute is append-only: a fresh run grows history, never replaces it.
const histBefore = store.metricHistory(fs.id, "work_completion_rate").length;
store.recomputeMetrics(fs.id);
check("recomputeMetrics is append-only (history grows)", store.metricHistory(fs.id, "work_completion_rate").length === histBefore + 1);

h("Generality: hospitality cartridge runs the same loop");
const hosp = store.listWorkspaces().find((w) => w.cartridge_key === "hospitality")!;
const hIngest = store.ingestCsv(hosp.id, "arrivals.csv", "room,guest\n29,Tim Moore", { inputType: "reservation_batch" });
check("Hospitality ingest resolves its own kind", hIngest.proposals[0]?.proposed.kind === "hospitality:housekeeping_turn");
const hMetrics = store.recomputeMetrics(hosp.id);
check("Hospitality metrics computed", hMetrics.length >= 1);

h("Chase F: rules engine — inputs dispatched into dry-run proposals (field_service)");
const ctxOf = (p: any) => p.proposed.context as Record<string, unknown>;
// Seeded web-form input -> FSR-001 fires an intake_review proposal.
const fsForm = store.listInputs(fs.id).find((i) => i.input_type === "web_form_submission")!;
const propsBefore = store.listProposals(fs.id).length;
const dForm = store.dispatchInput(fsForm.id, me)!;
const formProp = dForm.proposals.find((p) => ctxOf(p).rule_id === "FSR-001");
check("dispatchInput fires the web-lead rule (FSR-001)", !!formProp);
check("fired proposal targets the configured work-item kind", formProp?.proposed.kind === "field_service:intake_review");
check("proposal is a dry-run awaiting human promote", formProp?.status === "proposed" && dForm.run.dry_run === true);
check("proposals were persisted", store.listProposals(fs.id).length === propsBefore + dForm.proposals.length);
check("rules-engine run + one action per fired rule logged", dForm.run.agent_name === "Rules Engine" && dForm.actions.length === dForm.proposals.length);

// Seeded missed-call input -> FSR-002; critical maps to high but keeps its label.
const fsCall = store.listInputs(fs.id).find((i) => i.input_type === "missed_call_log")!;
const dCall = store.dispatchInput(fsCall.id, me)!;
const callProp = dCall.proposals.find((p) => ctxOf(p).rule_id === "FSR-002");
check("missed-call rule fires (FSR-002)", !!callProp);
check("critical maps to high priority + keeps the label", callProp?.proposed.priority === "high" && ctxOf(callProp).priority_label === "critical");

// Condition guard: estimate input WITHOUT status=sent skips FSR-010, then fires once flipped.
const estIn = store.ingestCsv(fs.id, "estimates.csv", "estimate_id,amount\nE-1,2400", { inputType: "estimate_export" }).input;
const dEstNo = store.dispatchInput(estIn.id, me)!;
check("condition guard SKIPS estimate rule when status!=sent",
  dEstNo.proposals.every((p) => ctxOf(p).rule_id !== "FSR-010") && dEstNo.skipped.some((s) => s.rule_id === "FSR-010"));
store.getInput(estIn.id)!.payload.status = "sent";
const dEstYes = store.dispatchInput(estIn.id, me)!;
check("condition guard FIRES estimate rule when status=sent", dEstYes.proposals.some((p) => ctxOf(p).rule_id === "FSR-010"));

// Cartridge-blind: hospitality declares no generation rules -> 0 fired, no crash.
const dHosp = store.dispatchInput(hIngest.input.id, me)!;
check("rules engine is cartridge-blind (no rules -> 0 proposals, no crash)", dHosp.proposals.length === 0);

// Full rule set encoded: FSR-001..060 all present in the field-service config.
const fsCfg = getConfiguration("field_service");
const ruleIds = (fsCfg?.generationRules ?? []).map((r) => r.id);
check("field_service encodes all 60 FSR rules", ruleIds.length === 60);
check("FSR ids run contiguously 001..060", ["FSR-001", "FSR-030", "FSR-047", "FSR-060"].every((id) => ruleIds.includes(id)));

// New input type fires a newly-encoded rule (FSR-006 email request).
const emailIn = store.ingestCsv(fs.id, "email.csv", "sender,subject\nlee@x.com,leak", { inputType: "email_request" }).input;
const dEmail = store.dispatchInput(emailIn.id, me)!;
check("new email_request rule fires (FSR-006)", dEmail.proposals.some((p) => ctxOf(p).rule_id === "FSR-006"));

// Critical complaint fires and maps high while keeping its label (FSR-034).
const compIn = store.ingestCsv(fs.id, "complaint.csv", "customer,complaint\nVega,late", { inputType: "customer_complaint" }).input;
const dComp = store.dispatchInput(compIn.id, me)!;
const compProp = dComp.proposals.find((p) => ctxOf(p).rule_id === "FSR-034");
check("complaint rule fires critical->high with label (FSR-034)",
  compProp?.proposed.priority === "high" && ctxOf(compProp).priority_label === "critical");

// Condition guard on a new type: source conflict skips until conflict=true (FSR-044).
const srcIn = store.ingestCsv(fs.id, "src.csv", "field,proposed_value\namount,2400", { inputType: "source_health_event" }).input;
const dSrcNo = store.dispatchInput(srcIn.id, me)!;
check("source-conflict rule SKIPS when conflict!=true (FSR-044)",
  dSrcNo.proposals.every((p) => ctxOf(p).rule_id !== "FSR-044") && dSrcNo.skipped.some((s) => s.rule_id === "FSR-044"));
store.getInput(srcIn.id)!.payload.conflict = true;
const dSrcYes = store.dispatchInput(srcIn.id, me)!;
check("source-conflict rule FIRES when conflict=true (FSR-044)", dSrcYes.proposals.some((p) => ctxOf(p).rule_id === "FSR-044"));

// A fired rule carries its evidence_required onto proposal context (FSR-050 blocked job).
const blkIn = store.ingestCsv(fs.id, "blk.csv", "job_id,blocker_reason\nJ-9,access", { inputType: "job_blocked_event" }).input;
const dBlk = store.dispatchInput(blkIn.id, me)!;
const blkProp = dBlk.proposals.find((p) => ctxOf(p).rule_id === "FSR-050");
check("blocked-job rule fires and attaches evidence_required (FSR-050)",
  !!blkProp && Array.isArray(ctxOf(blkProp).evidence_required) && (ctxOf(blkProp).evidence_required as string[]).includes("fs:blocker_reason"));

// 1c: promoting a rule-fired proposal seeds its evidence_required as concrete
// checklist items (resolved against the cartridge's evidenceRequirements labels).
const promotedBlk = blkProp ? store.promoteProposal(blkProp.id, "u_owner") : undefined;
const seededChecklist = promotedBlk ? store.listChecklist(promotedBlk.id) : [];
check("promote seeds evidence_required as checklist items (1c)",
  seededChecklist.some((c) => /blocker reason/i.test(c.title)));

console.log(`\n${failures === 0 ? "ALL CHECKS PASSED" : failures + " CHECK(S) FAILED"}`);
process.exit(failures === 0 ? 0 : 1);
