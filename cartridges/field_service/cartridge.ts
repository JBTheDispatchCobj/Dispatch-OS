// cartridges/field_service/cartridge.ts
//
// Cartridge 3 — Field Service Ops (FIELD_SERVICE_OPS_CARTRIDGE.md). The first
// "practical business mechanics" package: an owner-operated field-service shop
// (plumbing, HVAC, garage door, pest, pool, restoration, …) runs the same OS
// spine — messy intake -> rules flag gaps -> proposals -> human promote -> jobs
// executed -> evidence/photos logged -> a revenue-leakage / daily-ops report.
//
// Like Hospitality and Wealth, this is a DEMO package: removable, not the
// product. Nothing here leaks into core/ or components/ — meaning attaches only
// via entity_type keys, work-item `kind`, `context`, vocabulary, and
// widget_config. The seed is intentionally shaped to exercise the session-6
// widget actions: an unassigned job (assign), a blocked job + an overdue
// estimate + a completed job missing evidence (exceptions), a staged input
// (input_inbox), pending evidence (approve/reject), a REQUESTED approval
// (approval_queue), outcomes (value category / impact), and a generated report
// (share / archive).

import { registerCartridge, type Cartridge } from "@/core/cartridge";
import { emptyBundle, type SeedBundle } from "@/core/data/store";

const K = "field_service";

function seed(ws: string): SeedBundle {
  const b = emptyBundle();
  const id = (s: string) => `${ws}__${s}`;
  const ts = "2026-06-15T13:00:00.000Z";
  const past = "2026-05-20T09:00:00.000Z"; // for an overdue estimate follow-up

  // --- Entities (the field-service nouns) ----------------------------------
  b.entities.push({
    id: id("cust_acme"), workspace_id: ws, entity_type_key: "field_service:customer",
    title: "Marisol Vega", created_at: ts,
    context: { customer_type: "residential", phone: "555-0142", source: "google", lifetime_value_usd: 4200 },
  });
  b.entities.push({
    id: id("loc_acme"), workspace_id: ws, entity_type_key: "field_service:location",
    title: "1820 Cedar St — Vega residence", created_at: ts,
    context: { location_type: "single_family", access: "gate code 4417; dog in yard", recurring: false },
  });
  b.entities.push({
    id: id("tech_dan"), workspace_id: ws, entity_type_key: "field_service:technician",
    title: "Dan R. (Lead Tech)", created_at: ts,
    context: { skills: ["drain", "sewer", "water_heater"], territory: "North", callback_rate_pct: 4 },
  });

  // --- Work items across the loop (statuses chosen to drive exceptions) -----
  // Unassigned, open intake review — drives the assign action.
  b.workItems.push({
    id: id("wi_intake"), workspace_id: ws, kind: "field_service:intake_review",
    title: "New request: water heater leaking (Vega, 1820 Cedar St)", status: "open",
    priority: "high", source: "inbound", entity_id: id("cust_acme"),
    assignee_id: null, assignee_name: null,
    context: { urgency: "same_day", service: "water_heater", missing: ["preferred_time"] },
    created_at: ts, started_at: null, completed_at: null, source_input_id: id("in_call"),
  });
  // Overdue estimate follow-up — drives the overdue exception.
  b.workItems.push({
    id: id("wi_estimate"), workspace_id: ws, kind: "field_service:estimate_follow_up",
    title: "Follow up: $2,400 sewer line estimate sent, no response", status: "assigned",
    priority: "medium", source: "manual", entity_id: id("cust_acme"),
    assignee_id: "u_angie", assignee_name: "Angie",
    context: { estimate_usd: 2400, sent_days_ago: 12, revenue_at_risk: true },
    created_at: past, started_at: null, completed_at: null, due_at: past,
  });
  // Blocked by parts — drives the blocked exception.
  b.workItems.push({
    id: id("wi_parts"), workspace_id: ws, kind: "field_service:parts_return_visit",
    title: "Return visit blocked — expansion tank on order", status: "blocked",
    priority: "high", source: "manual", entity_id: id("loc_acme"),
    assignee_id: "u_angie", assignee_name: "Angie",
    context: { part: "thermal expansion tank", vendor: "SupplyCo", eta: "2026-06-18" },
    created_at: ts, started_at: ts, completed_at: null,
  });
  // Completed job with NO evidence — drives the missing_evidence exception.
  b.workItems.push({
    id: id("wi_job_done"), workspace_id: ws, kind: "field_service:job_execution",
    title: "Garage door spring replacement (completed, photos missing)", status: "completed",
    priority: "medium", source: "manual", entity_id: id("loc_acme"),
    assignee_id: "u_angie", assignee_name: "Angie",
    context: { job_type: "garage_door_spring", checklist_done: true },
    created_at: ts, started_at: ts, completed_at: ts,
  });

  // --- Checklist for the open job-execution workflow -----------------------
  ["Confirm scope with customer", "Complete safety check", "Capture before photo", "Perform work", "Capture after photo", "Get customer sign-off"].forEach((t, i) => {
    b.checklistItems.push({
      id: id(`ci_${i}`), work_item_id: id("wi_parts"), title: t, sort_order: i + 1,
      done: i < 2, done_at: i < 2 ? ts : null,
    });
  });

  // --- Evidence (some pending review — drives approve/reject) --------------
  b.evidence.push({
    id: id("ev_invoice"), work_item_id: id("wi_estimate"), kind: "attestation",
    label: "Estimate emailed to customer (delivery receipt)",
    value: { channel: "email", to: "marisol@example.com" },
    document_id: null, captured_by: "user:u_angie", created_at: ts, review_status: "pending",
  });
  b.evidence.push({
    id: id("ev_partsnote"), work_item_id: id("wi_parts"), kind: "observation",
    label: "Tech note: expansion tank failed, ordered replacement",
    value: { part: "thermal expansion tank" },
    document_id: null, captured_by: "user:u_angie", created_at: ts,
  });

  // --- Notes ----------------------------------------------------------------
  b.notes.push({
    id: id("n1"), work_item_id: id("wi_intake"), author_id: "u_owner", author_name: "You (Owner)",
    body: "Customer called at 8:42a — water pooling under heater. Flagged same-day.", created_at: ts,
  });

  // --- Source + staged Input (drives input_inbox actions) ------------------
  b.sources.push({
    id: id("src_phone"), workspace_id: ws, name: "Front-desk phone log",
    source_type: "manual_entry", status: "active", reliability_default: 0.8,
    reliability_score: 0.8, created_at: ts,
  } as SeedBundle["sources"][number]);
  b.inboundEvents.push({
    id: id("in_call"), workspace_id: ws, source: "manual", source_id: id("src_phone"),
    external_id: "call_20260615_0842", input_type: "missed_call_log",
    payload: { caller: "Marisol Vega", number: "555-0142", note: "water heater leaking" },
    raw_text: "8:42a missed call — Marisol Vega 555-0142 — water heater leaking, water on floor",
    status: "received", created_at: ts,
  });
  b.inboundEvents.push({
    id: id("in_form"), workspace_id: ws, source: "web_form", source_id: id("src_phone"),
    external_id: "webform_20260615", input_type: "web_form_submission",
    payload: { name: "T. Okafor", service: "annual drain cleaning", address: "" },
    raw_text: "Web form: T. Okafor — annual drain cleaning — (no address provided)",
    status: "classified", created_at: ts,
  });

  // --- Agent run -> proposal (human-in-the-loop intake) --------------------
  b.agentRuns.push({
    id: id("run_intake"), workspace_id: ws, interpreter_key: "field_service:intake_scan",
    agent_name: "Intake Agent", status: "succeeded", dry_run: true,
    summary: "Classified 2 inputs. 1 same-day emergency, 1 recurring-drain lead missing address.",
    source_input_id: id("in_call"), created_at: ts,
  });
  b.agentActions.push({
    id: id("act_intake"), agent_run_id: id("run_intake"), action: "classify_request",
    detail: { urgency: "same_day", service: "water_heater" }, created_at: ts,
  });
  b.proposals.push({
    id: id("p_recurring"), workspace_id: ws, agent_run_id: id("run_intake"),
    proposal_type: "work_item",
    title: "Open a recurring drain-cleaning opportunity (Okafor)",
    proposed: {
      kind: "field_service:recurring_opportunity",
      title: "Recurring drain-cleaning service agreement — Okafor",
      priority: "medium", entity_id: id("cust_acme"),
      context: { suggested_frequency: "annual", est_annual_value_usd: 380 },
    },
    rationale: "Web-form request for ANNUAL drain cleaning implies a recurring service-agreement opportunity; missing address must be collected first.",
    status: "pending", evidence_references: [id("in_form")],
    created_at: ts, reviewed_by: null, reviewed_at: null, promoted_work_item_id: null,
  });

  // --- A REQUESTED approval (drives approval_queue approve/reject) ----------
  b.approvals.push({
    id: id("appr_complete"), workspace_id: ws, approval_type: "work_completion",
    status: "requested", requested_by: "user:u_angie",
    related_work_item_id: id("wi_job_done"),
    approval_notes: "Garage door job marked complete — needs owner sign-off before invoicing.",
    created_at: ts, updated_at: ts,
  });

  // --- Outcomes (drives assign_value_category / estimate_impact) -----------
  // Two DIRECT-dollar/count outcomes — the universal metric family has no dollar
  // metric, so these stay honest manual ESTIMATES (ROI §9) with a baseline; the
  // owner refines them via estimate_impact.
  b.outcomes.push({
    id: id("out_leakage"), workspace_id: ws, outcome_type: "revenue_recovery",
    name: "Recover revenue leaking from stale estimates", status: "active",
    description: "Convert open/stale estimates instead of letting them die silently.",
    target_value: 8000, actual_value: 2400, baseline_value: 0,
    value_category: "revenue_created", confidence: "estimated", created_at: ts,
  });
  b.outcomes.push({
    id: id("out_callbacks"), workspace_id: ws, outcome_type: "quality",
    name: "Reduce callbacks / repeat visits", status: "active",
    description: "Fewer return trips from incomplete work or missing parts.",
    target_value: 3, actual_value: 7, baseline_value: 9, lower_is_better: true,
    value_category: "cost_reduced", confidence: "estimated", created_at: ts,
  });
  // One OBSERVED outcome — linked to a REAL computed metric by name. Its
  // actual_value is derived from the live metric (recomputeOutcomes), and the
  // seeded history below gives a true value-vs-target trend. The cartridge only
  // names the metric; the core stays cartridge-blind.
  b.outcomes.push({
    id: id("out_completion"), workspace_id: ws, outcome_type: "throughput",
    name: "Lift job completion rate", status: "active",
    description: "Close the loop on more started jobs each week.",
    target_value: 80, baseline_value: 10, value_category: "faster_cycle_time",
    related_metric_names: ["work_completion_rate"], created_at: ts,
  });

  // --- Seeded metric history (drives the observed outcome's trend) ----------
  // Append-only history: two prior weekly snapshots of work_completion_rate.
  // The boot recompute appends the CURRENT value (latest by measured_at), so the
  // outcome reads "previous -> current" as a real move toward target.
  [
    { at: "2026-06-01T00:00:00.000Z", v: 10 },
    { at: "2026-06-08T00:00:00.000Z", v: 18 },
  ].forEach((p, i) => {
    b.metrics.push({
      id: id(`m_completion_${i}`), workspace_id: ws,
      metric_name: "work_completion_rate", metric_value: p.v, metric_type: "execution",
      measured_at: p.at, created_at: p.at,
      calculation_method: "completed / total work items (%)",
      metadata: { auto: true, seeded_history: true },
    });
  });

  // --- A generated report (drives report_list share / archive) -------------
  b.reports.push({
    id: id("rpt_leakage"), workspace_id: ws, report_key: "field_service:revenue_leakage",
    title: "Revenue Leakage Report", status: "generated", generated_by: "user:u_owner",
    generated_at: ts,
    sections: [
      { heading: "Stale estimates", body: "1 estimate ($2,400) open 12+ days with no follow-up.", source_references: [id("wi_estimate")] },
      { heading: "Blocked jobs", body: "1 job blocked awaiting parts (expansion tank).", source_references: [id("wi_parts")] },
      { heading: "Missing evidence", body: "1 completed job missing required photos before invoicing.", source_references: [id("wi_job_done")] },
    ],
    source_references: [id("wi_estimate"), id("wi_parts"), id("wi_job_done")],
  });

  // --- Owner dashboard (§12.1) — widget_config drives composeForWorkspace ---
  b.dashboards.push({
    id: id("dash_owner"), workspace_id: ws, name: "Owner Ops", status: "active",
    dashboard_type: "owner",
    widget_config: [
      { type: "metric", label: "Job completion", metric_name: "work_completion_rate" },
      { type: "metric", label: "Evidence coverage", metric_name: "evidence_coverage" },
      { type: "inputs", label: "New requests / intake" },
      { type: "work", label: "Open & stuck work", filter: "status!=completed&status!=archived" },
      { type: "exceptions", label: "Where money is leaking" },
      { type: "approvals", label: "Needs your sign-off" },
      { type: "outcomes", label: "Value at stake" },
      { type: "reports", label: "Reports" },
    ],
    created_at: ts,
  });

  return b;
}

const cartridge: Cartridge = {
  key: K,
  label: "Field Service Ops",
  description: "Owner-operated field-service shop (plumbing/HVAC/garage door/pest/pool/restoration): stop losing money between request, estimate, schedule, execution, evidence, invoice, and follow-up.",
  version: 1,
  status: "active",
  vocabulary: {
    terms: { entity: "Customer / Job", work_item: "Job / Task", evidence: "Proof of work", input: "Incoming request" },
    statusLabels: { awaiting_review: "Needs owner review", completed: "Done", blocked: "Stuck" },
  },
  inputTypes: [
    { key: "missed_call_log", label: "Missed call / phone note", parsing_method: "none", converts_to: ["field_service:intake_review"], review_required: true },
    { key: "web_form_submission", label: "Website request form", parsing_method: "none", converts_to: ["field_service:intake_review"], review_required: true },
    { key: "voicemail_transcript", label: "Voicemail transcript", parsing_method: "none", converts_to: ["field_service:intake_review"], review_required: true },
    { key: "customer_sms", label: "Customer text / SMS", parsing_method: "none", converts_to: ["field_service:intake_review"], review_required: true },
    { key: "marketplace_lead", label: "Marketplace / paid lead", parsing_method: "none", converts_to: ["field_service:intake_review"], review_required: true },
    { key: "estimate_export", label: "Estimate / quote export", parsing_method: "csv", converts_to: ["field_service:estimate_follow_up"], review_required: true },
    { key: "technician_note", label: "Technician note", parsing_method: "none", converts_to: ["field_service:job_execution"], review_required: true },
    { key: "job_completed_event", label: "Job completion event", parsing_method: "none", converts_to: ["field_service:job_execution"], review_required: true },
    { key: "invoice_export", label: "Accounting / invoice export (CSV)", parsing_method: "csv", converts_to: ["field_service:invoice_followup"], review_required: true },
    { key: "ar_aging_report", label: "A/R aging report", parsing_method: "csv", converts_to: ["field_service:invoice_followup"], review_required: true },
    { key: "callback_report", label: "Callback / rework report", parsing_method: "csv", converts_to: ["field_service:callback_resolution"], review_required: true },
    { key: "recurring_due_report", label: "Recurring service due report", parsing_method: "csv", converts_to: ["field_service:recurring_opportunity"], review_required: true },
    // Added for the full FSR-006..060 rule set.
    { key: "email_request", label: "Inbound email request", parsing_method: "none", converts_to: ["field_service:intake_review"], review_required: true },
    { key: "customer_record_import", label: "Customer/location record import", parsing_method: "csv", converts_to: ["field_service:data_cleanup"], review_required: true },
    { key: "job_scheduled_event", label: "Job scheduled event", parsing_method: "none", converts_to: ["field_service:schedule_dispatch"], review_required: true },
    { key: "schedule_change_event", label: "Schedule change (reschedule/cancel)", parsing_method: "none", converts_to: ["field_service:schedule_change_review"], review_required: true },
    { key: "technician_schedule", label: "Technician route / schedule", parsing_method: "none", converts_to: ["field_service:capacity_review"], review_required: true },
    { key: "job_status_event", label: "Job status change (en route / arrived / stale)", parsing_method: "none", converts_to: ["field_service:status_check"], review_required: true },
    { key: "parts_status", label: "Parts order / return-visit status", parsing_method: "none", converts_to: ["field_service:parts_follow_up"], review_required: true },
    { key: "payment_event", label: "Payment / dispute / refund event", parsing_method: "none", converts_to: ["field_service:closeout_update"], review_required: true },
    { key: "warranty_claim", label: "Warranty claim", parsing_method: "none", converts_to: ["field_service:warranty_review"], review_required: true },
    { key: "customer_complaint", label: "Customer complaint", parsing_method: "none", converts_to: ["field_service:customer_rescue"], review_required: true },
    { key: "review_posted", label: "Public review posted", parsing_method: "none", converts_to: ["field_service:review_rescue"], review_required: true },
    { key: "emergency_request", label: "After-hours / emergency request", parsing_method: "none", converts_to: ["field_service:emergency_intake"], review_required: true },
    { key: "source_health_event", label: "Source sync / conflict event", parsing_method: "none", converts_to: ["field_service:data_pipeline_repair"], review_required: true },
    { key: "appointment_reminder", label: "Appointment confirmation status", parsing_method: "none", converts_to: ["field_service:customer_update"], review_required: true },
    { key: "field_access_event", label: "No-show / failed access event", parsing_method: "none", converts_to: ["field_service:access_follow_up"], review_required: true },
    { key: "technician_voice_note", label: "Technician voice note", parsing_method: "none", converts_to: ["field_service:field_note_review"], review_required: true },
    { key: "job_photos", label: "Job photos uploaded", parsing_method: "none", converts_to: ["field_service:evidence_classification"], review_required: true },
    { key: "job_blocked_event", label: "One-tap job blocked", parsing_method: "none", converts_to: ["field_service:blocker_resolution"], review_required: true },
    { key: "daily_ops_report", label: "Daily job export / report", parsing_method: "csv", converts_to: ["field_service:daily_ops_review"], review_required: true },
    { key: "estimate_pipeline_report", label: "Open estimate pipeline report", parsing_method: "csv", converts_to: ["field_service:pipeline_review"], review_required: true },
    { key: "technician_performance_report", label: "Technician performance report", parsing_method: "csv", converts_to: ["field_service:performance_review"], review_required: true },
    { key: "dormant_customer_report", label: "Dormant customer list", parsing_method: "csv", converts_to: ["field_service:customer_reactivation"], review_required: true },
    { key: "job_cost_report", label: "Job cost / margin report", parsing_method: "csv", converts_to: ["field_service:margin_review"], review_required: true },
  ],
  sourceTypes: [
    { key: "phone_log", label: "Front-desk phone log", source_type: "manual_entry", reliability_default: 0.8, requires_human_review: true },
    { key: "web_form", label: "Website request form", source_type: "api", reliability_default: 0.7, requires_human_review: true },
    { key: "fsm_export", label: "Field-service software export", source_type: "csv_export", reliability_default: 0.9, requires_human_review: true },
  ],
  entityTypes: [
    { key: "field_service:customer", cartridge_key: K, label: "Customer", context_hint: "customer_type, phone, email, source, lifetime_value_usd, tags" },
    { key: "field_service:location", cartridge_key: K, label: "Location / Site", context_hint: "location_type, access, recurring, equipment" },
    { key: "field_service:request", cartridge_key: K, label: "Request / Lead", context_hint: "source, urgency, problem_summary, requested_service" },
    { key: "field_service:estimate", cartridge_key: K, label: "Estimate / Quote", context_hint: "scope, price, margin, status, sent_date, follow_up_date" },
    { key: "field_service:job", cartridge_key: K, label: "Job / Work Order", context_hint: "job_type, scheduled_time, technician, checklist, callback_flag" },
    { key: "field_service:technician", cartridge_key: K, label: "Technician / Crew", context_hint: "skills, territory, workload, callback_rate_pct" },
    { key: "field_service:material", cartridge_key: K, label: "Material / Part", context_hint: "part_number, vendor, status, needed_by" },
    { key: "field_service:invoice", cartridge_key: K, label: "Invoice / Payment", context_hint: "amount, status, due_date, aging, payment_method" },
    { key: "field_service:callback", cartridge_key: K, label: "Callback / Warranty Issue", context_hint: "original_job, severity, root_cause, cost_impact" },
    { key: "field_service:service_agreement", cartridge_key: K, label: "Recurring Opportunity", context_hint: "opportunity_type, frequency, est_annual_value, next_follow_up" },
  ],
  workflows: [
    { kind: "field_service:intake_review", label: "Intake Review", description: "Turn raw demand into a usable, qualified request.", defaultChecklistKey: "field_service:job_execution", defaultPriority: "high" },
    { kind: "field_service:estimate_follow_up", label: "Estimate Follow-Up", description: "Prevent open estimates from dying silently.", valueCategory: "revenue_created" },
    { kind: "field_service:schedule_dispatch", label: "Schedule / Dispatch", description: "Move approved work into a scheduled, assigned visit." },
    { kind: "field_service:job_execution", label: "Job Execution", description: "Guide field execution and capture proof.", defaultChecklistKey: "field_service:job_execution" },
    { kind: "field_service:parts_return_visit", label: "Parts / Return Visit", description: "Keep incomplete jobs from getting lost." },
    { kind: "field_service:invoice_followup", label: "Invoice / Payment Follow-Up", description: "Reduce cash leakage after work is done.", valueCategory: "revenue_protected" },
    { kind: "field_service:callback_resolution", label: "Callback / Warranty Resolution", description: "Capture quality failures and resolve customer issues." },
    { kind: "field_service:recurring_opportunity", label: "Recurring Service Opportunity", description: "Convert one-time jobs into recurring value.", valueCategory: "revenue_created" },
    // Added so every FSR rule's output.work_item_kind is a declared workflow.
    { kind: "field_service:data_cleanup", label: "Data Cleanup", description: "Repair missing/duplicate customer & location records before they break the loop." },
    { kind: "field_service:sales_review", label: "Sales Review", description: "Capture lost-deal reasons to sharpen pricing and source quality.", valueCategory: "operating_maturity" },
    { kind: "field_service:pre_dispatch_review", label: "Pre-Dispatch Review", description: "Clear missing scope/contact/access before a tech is sent.", valueCategory: "cost_reduced" },
    { kind: "field_service:schedule_change_review", label: "Schedule Change Review", description: "Confirm customer/tech notification on same-day schedule changes." },
    { kind: "field_service:capacity_review", label: "Capacity Review", description: "Surface technician schedule gaps and overloads.", valueCategory: "cost_reduced" },
    { kind: "field_service:customer_update", label: "Customer Update", description: "Proactive ETA / appointment confirmation to the customer.", valueCategory: "improved_customer_experience" },
    { kind: "field_service:status_check", label: "Status Check", description: "Resolve stale job state that blocks dispatch visibility.", valueCategory: "visibility_improved" },
    { kind: "field_service:job_closeout", label: "Job Closeout", description: "Drive invoice, evidence, follow-up, and review at completion.", valueCategory: "cash_accelerated" },
    { kind: "field_service:service_opportunity", label: "Service Opportunity", description: "Convert technician observations into follow-on revenue.", valueCategory: "revenue_created" },
    { kind: "field_service:parts_follow_up", label: "Parts Follow-Up", description: "Track part ETAs and vendor selection so jobs don't disappear.", valueCategory: "faster_cycle_time" },
    { kind: "field_service:invoice_cleanup", label: "Invoice Cleanup", description: "Fix missing billing fields before an invoice is sent.", valueCategory: "cash_accelerated" },
    { kind: "field_service:closeout_update", label: "Closeout Update", description: "Close the cash loop when payment lands.", valueCategory: "cash_accelerated" },
    { kind: "field_service:dispute_review", label: "Dispute Review", description: "Assemble an evidence packet to defend a disputed charge.", valueCategory: "risk_reduced" },
    { kind: "field_service:warranty_review", label: "Warranty Review", description: "Validate warranty eligibility before scheduling unpaid work.", valueCategory: "margin_protected" },
    { kind: "field_service:customer_rescue", label: "Customer Rescue", description: "Escalate and resolve a customer complaint fast.", valueCategory: "improved_customer_experience" },
    { kind: "field_service:review_rescue", label: "Review Rescue", description: "Owner response workflow for a bad public review.", valueCategory: "revenue_protected" },
    { kind: "field_service:renewal_follow_up", label: "Renewal Follow-Up", description: "Protect recurring revenue as agreements expire.", valueCategory: "revenue_protected" },
    { kind: "field_service:margin_review", label: "Margin Review", description: "Review underpriced quotes and job-cost margin variance.", valueCategory: "margin_protected" },
    { kind: "field_service:emergency_intake", label: "Emergency Intake", description: "Route after-hours / emergency demand above the normal queue.", valueCategory: "revenue_created" },
    { kind: "field_service:data_pipeline_repair", label: "Data Pipeline Repair", description: "Repair a broken/stale source feed and flag affected metrics.", valueCategory: "visibility_improved" },
    { kind: "field_service:reconciliation", label: "Reconciliation", description: "Resolve conflicting values across sources via precedence + human review.", valueCategory: "data_quality" },
    { kind: "field_service:access_follow_up", label: "Reschedule / Access Follow-Up", description: "Recover a failed-access / no-show trip and reschedule.", valueCategory: "cost_reduced" },
    { kind: "field_service:field_note_review", label: "Field Note Review", description: "Turn a technician voice note into a usable note/opportunity/blocker.", valueCategory: "quality_improved" },
    { kind: "field_service:evidence_classification", label: "Evidence Classification", description: "Classify and attach job photos as proof.", valueCategory: "risk_reduced" },
    { kind: "field_service:blocker_resolution", label: "Blocker Resolution", description: "Resolve a one-tap technician blocker by reason.", valueCategory: "faster_cycle_time" },
    { kind: "field_service:daily_ops_review", label: "Daily Ops Review", description: "Daily exception sweep across closeout/evidence/invoice gaps.", valueCategory: "visibility_improved" },
    { kind: "field_service:pipeline_review", label: "Pipeline Review", description: "Refresh the open-estimate queue and pipeline metrics.", valueCategory: "revenue_protected" },
    { kind: "field_service:ar_review", label: "A/R Review", description: "Refresh unpaid-invoice queue and collection tasks.", valueCategory: "cash_accelerated" },
    { kind: "field_service:quality_review", label: "Quality Review", description: "Root-cause review when callback/rework trends up.", valueCategory: "margin_protected" },
    { kind: "field_service:performance_review", label: "Performance Review", description: "Coach a technician metric outlier.", valueCategory: "quality_improved" },
    { kind: "field_service:review_request", label: "Review Request", description: "Request a review from an eligible, satisfied customer.", valueCategory: "revenue_created" },
    { kind: "field_service:customer_reactivation", label: "Customer Reactivation", description: "Re-engage dormant customers.", valueCategory: "revenue_created" },
    { kind: "field_service:discount_review", label: "Discount Review", description: "Approve/review discounts above threshold or lacking a reason.", valueCategory: "margin_protected" },
    { kind: "field_service:refund_review", label: "Refund Review", description: "Review refund/credit reasons and link to root cause.", valueCategory: "margin_protected" },
  ],
  checklistTemplates: [
    {
      key: "field_service:job_execution", cartridge_key: K, label: "Job Execution",
      items: [
        { title: "Confirm scope with customer", sort_order: 1 },
        { title: "Complete safety check", sort_order: 2 },
        { title: "Capture before photo", sort_order: 3 },
        { title: "Perform work", sort_order: 4 },
        { title: "Capture after photo", sort_order: 5 },
        { title: "Get customer sign-off", sort_order: 6 },
      ],
    },
  ],
  evidenceRequirements: [
    { key: "fs:completion_note", label: "Completion note", evidence_type: "note", required: true, applies_to_kind: "field_service:job_execution" },
    { key: "fs:after_photo", label: "After photo", evidence_type: "photo", required: true, applies_to_kind: "field_service:job_execution" },
    { key: "fs:blocker_reason", label: "Blocker reason", evidence_type: "note", required: true, applies_to_kind: "field_service:parts_return_visit" },
    { key: "fs:contact_attempt", label: "Contact attempt note", evidence_type: "note", required: true, applies_to_kind: "field_service:invoice_followup" },
  ],
  approvalRules: [
    { key: "fs:job_completion", applies_to: "work_completion", approver_role: "owner" },
    { key: "fs:report_share", applies_to: "report_share", approver_role: "owner" },
  ],
  automationKeys: [
    { key: "fs:new_request", label: "New request received", trigger: "new_input", condition: "input_type in (missed_call_log, web_form_submission)", action: "propose intake_review", allowed_agent: "intake", approval_required: true, risk_level: "low", fallback: "queue for manual review" },
    { key: "fs:stale_estimate", label: "Estimate sent, no follow-up", trigger: "stale_status", condition: "estimate open > 7 days", action: "propose estimate_follow_up", allowed_agent: "work", approval_required: true, risk_level: "medium" },
    { key: "fs:missing_evidence", label: "Job completed without evidence", trigger: "field_missing", condition: "job completed and required photo/note missing", action: "create evidence-gap work item", allowed_agent: "evidence", approval_required: true, risk_level: "medium" },
    { key: "fs:unpaid_invoice", label: "Invoice unpaid after threshold", trigger: "threshold_exceeded", condition: "invoice unpaid > 30 days", action: "propose invoice_followup", allowed_agent: "work", approval_required: true, risk_level: "medium" },
    { key: "fs:recurring_opportunity", label: "Recurring opportunity detected", trigger: "new_input", condition: "completed job implies recurring service", action: "propose recurring_opportunity", allowed_agent: "roi", approval_required: true, risk_level: "low" },
  ],
  rules: [
    { key: "fs:new_request", label: "New request received", rule_type: "automation", when: "a new call/form/message arrives", produces: "intake_review work item", severity: "info" },
    { key: "fs:missing_info", label: "Request missing required info", rule_type: "validation", when: "request lacks address, contact, or service type", produces: "missing-info work item; block scheduling", severity: "warn" },
    { key: "fs:stale_estimate", label: "Estimate sent with no follow-up", rule_type: "opportunity", when: "estimate status sent/open after N days", produces: "estimate_follow_up work item; revenue-leakage flag", severity: "warn" },
    { key: "fs:missing_evidence", label: "Job completed without evidence", rule_type: "evidence", when: "job moved to completed but required evidence missing", produces: "evidence-gap task; proof-risk flag", severity: "critical" },
    { key: "fs:unpaid_invoice", label: "Invoice unpaid after threshold", rule_type: "escalation", when: "invoice unpaid after configured days", produces: "payment follow-up work item; cash-leakage flag", severity: "warn" },
    { key: "fs:callback", label: "Callback / warranty issue", rule_type: "risk", when: "customer reports same issue after completion", produces: "callback_resolution workflow; technician/job-type pattern flag", severity: "critical" },
    { key: "fs:recurring", label: "Recurring service opportunity", rule_type: "opportunity", when: "completed job implies recurring maintenance/treatment", produces: "recurring_opportunity proposal", severity: "info" },
  ],
  // The executable rules SYSTEM (FIELD_SERVICE_OPS rules table, FSR-001..). Each
  // entry listens for an input type, optionally guards on the payload, and emits
  // a dry-run proposal. The engine (core/engine/rules.ts) runs these and stays
  // cartridge-blind; everything specific to field service lives here as data.
  // The full FSR-001..060 set from field_service_ops_rules_system.csv. Each entry
  // listens for an input type, optionally guards on a generic payload condition,
  // and emits a dry-run proposal. The engine (core/engine/rules.ts) runs these and
  // stays cartridge-blind; everything specific to field service lives here as data.
  // CSV "Human Review Level" maps to RoleKey (dispatcher/CSR->operator,
  // bookkeeper/admin/manager->admin, owner->owner, none->reviewer default);
  // "Critical" priority maps to high at the work-item level but keeps its label.
  generationRules: [
    // --- Lead / demand intake (FSR-001..006) ---------------------------------
    {
      id: "FSR-001", description: "New website/form lead — create intake review and prevent missed revenue",
      trigger: { input_type: "web_form_submission" },
      output: { work_item_kind: "field_service:intake_review", title: "New web lead: {service} ({name})" },
      priority: "high", impact_area: "Revenue Creation", value_category: "revenue_created",
      metric_updated: ["work_items_active", "input_conversion_rate"], evidence_required: ["fs:contact_attempt"],
      review_role: "operator", automation_key: "fs:new_request", context_to_attach: ["name", "service", "address"],
      feedback: "Repeat if converted; deviate if unqualified; innovate if source quality is poor.",
    },
    {
      id: "FSR-002", description: "Missed call with no return within window — urgent callback to protect revenue",
      trigger: { input_type: "missed_call_log" },
      output: { work_item_kind: "field_service:intake_review", title: "Urgent callback: {caller}" },
      priority: "critical", impact_area: "Revenue Protection", value_category: "revenue_protected",
      metric_updated: ["work_items_active"], evidence_required: ["fs:contact_attempt"],
      review_role: "operator", automation_key: "fs:new_request", context_to_attach: ["caller", "number", "note"],
      feedback: "Repeat for all missed calls; deviate for spam; innovate if missed-call volume is systemic.",
    },
    {
      id: "FSR-003", description: "Voicemail transcript contains a service request — stage intake",
      trigger: { input_type: "voicemail_transcript" },
      output: { work_item_kind: "field_service:intake_review", title: "Voicemail request" },
      priority: "high", impact_area: "Revenue Creation", value_category: "revenue_created",
      review_role: "operator", automation_key: "fs:new_request",
      feedback: "Repeat if parse accepted; deviate if transcript weak; innovate on common request types.",
    },
    {
      id: "FSR-004", description: "Inbound customer SMS — classify and route follow-up",
      trigger: { input_type: "customer_sms" },
      output: { work_item_kind: "field_service:intake_review", title: "Customer message" },
      priority: "high", impact_area: "Customer Experience", value_category: "improved_customer_experience",
      review_role: "operator",
      feedback: "Repeat known classifications; deviate when ambiguous; innovate response templates.",
    },
    {
      id: "FSR-005", description: "Marketplace/paid lead — intake + source ROI tracking",
      trigger: { input_type: "marketplace_lead" },
      output: { work_item_kind: "field_service:intake_review", title: "Marketplace lead" },
      priority: "high", impact_area: "Revenue Creation", value_category: "revenue_created",
      metric_updated: ["input_conversion_rate"], review_role: "operator", automation_key: "fs:new_request",
      feedback: "Repeat high-quality sources; deviate low-quality; innovate spend allocation.",
    },
    {
      id: "FSR-006", description: "Inbound email request — parse, match customer, create intake/follow-up",
      trigger: { input_type: "email_request" },
      output: { work_item_kind: "field_service:intake_review", title: "Email request: {subject}" },
      priority: "high", impact_area: "Revenue Creation", value_category: "revenue_created",
      metric_updated: ["input_conversion_rate"], review_role: "operator", automation_key: "fs:new_request",
      context_to_attach: ["sender", "subject"],
      feedback: "Repeat accepted parsing; deviate for non-service email; innovate inbox routing rules.",
    },
    // --- Customer / location data quality (FSR-007..008) ---------------------
    {
      id: "FSR-007", description: "New customer record missing required contact/location fields — data cleanup before scheduling",
      trigger: { input_type: "customer_record_import", match: "data_gap=true" },
      output: { work_item_kind: "field_service:data_cleanup", title: "Customer data gap: {customer}" },
      priority: "medium", impact_area: "Data Quality", value_category: "data_quality",
      review_role: "admin", context_to_attach: ["customer", "missing_fields"],
      feedback: "Repeat cleanup; deviate if source missing fields; innovate intake requirements.",
    },
    {
      id: "FSR-008", description: "Duplicate customer/location across records — merge/review proposal",
      trigger: { input_type: "customer_record_import", match: "duplicate=true" },
      output: { work_item_kind: "field_service:data_cleanup", title: "Possible duplicate: {customer}" },
      priority: "medium", impact_area: "Data Quality", value_category: "data_quality",
      review_role: "admin", context_to_attach: ["customer", "match_field", "confidence"],
      feedback: "Repeat merge rules if accepted; deviate if false matches; innovate matching logic.",
    },
    // --- Estimate / quote (FSR-009..013) -------------------------------------
    {
      id: "FSR-009", description: "Estimate created — open a tracking record and follow-up schedule",
      trigger: { input_type: "estimate_export", match: "status=created" },
      output: { work_item_kind: "field_service:estimate_follow_up", title: "Track estimate {estimate_id}" },
      priority: "medium", impact_area: "Revenue Creation", value_category: "revenue_created",
      metric_updated: ["work_items_active"], review_role: "reviewer", context_to_attach: ["estimate_id", "amount", "customer"],
      feedback: "Repeat for all estimates; deviate if missing amount/status; innovate quoting workflow.",
    },
    {
      id: "FSR-010", description: "Estimate sent with no response — stale-estimate follow-up (revenue leakage)",
      trigger: { input_type: "estimate_export", match: "status=sent" },
      output: { work_item_kind: "field_service:estimate_follow_up", title: "Follow up: estimate {estimate_id}" },
      priority: "high", impact_area: "Revenue Protection", value_category: "revenue_created",
      metric_updated: ["work_items_active"], review_role: "operator", automation_key: "fs:stale_estimate",
      context_to_attach: ["estimate_id", "amount", "customer"],
      feedback: "Repeat if follow-up converts; deviate timing by customer cycle; innovate templates.",
    },
    {
      id: "FSR-011", description: "High-value estimate stuck — escalate owner/manager follow-up",
      trigger: { input_type: "estimate_export", match: "tier=high" },
      output: { work_item_kind: "field_service:estimate_follow_up", title: "High-value quote follow-up: {estimate_id}" },
      priority: "high", impact_area: "Revenue Creation", value_category: "revenue_created",
      review_role: "admin", automation_key: "fs:stale_estimate", requires_human_approval: true,
      feedback: "Repeat if close rate improves; deviate threshold; innovate high-ticket playbook.",
    },
    {
      id: "FSR-012", description: "Estimate approved but not scheduled within window — scheduling escalation",
      trigger: { input_type: "estimate_export", match: "status=approved" },
      output: { work_item_kind: "field_service:schedule_dispatch", title: "Schedule approved work: {estimate_id}" },
      priority: "critical", impact_area: "Revenue Capture", value_category: "revenue_created",
      metric_updated: ["work_items_active"], review_role: "admin", context_to_attach: ["estimate_id", "customer"],
      feedback: "Repeat schedule escalation; deviate if capacity-constrained; innovate capacity planning.",
    },
    {
      id: "FSR-013", description: "Estimate declined/lost without a reason code — lost-reason review",
      trigger: { input_type: "estimate_export", match: "status=lost" },
      output: { work_item_kind: "field_service:sales_review", title: "Lost-reason review: {estimate_id}" },
      priority: "low", impact_area: "Operating Maturity", value_category: "operating_maturity",
      review_role: "admin", context_to_attach: ["estimate_id", "amount", "customer"],
      feedback: "Repeat reason capture; deviate options if vague; innovate pricing/source strategy.",
    },
    // --- Schedule / dispatch (FSR-014..017) ----------------------------------
    {
      id: "FSR-014", description: "Scheduled job lacks an assigned technician/crew — dispatch assignment",
      trigger: { input_type: "job_scheduled_event", match: "technician_assigned!=true" },
      output: { work_item_kind: "field_service:schedule_dispatch", title: "Assign technician: job {job_id}" },
      priority: "high", impact_area: "Labor Efficiency", value_category: "cost_reduced",
      metric_updated: ["work_items_active"], review_role: "operator", context_to_attach: ["job_id", "scheduled_time", "service_type"],
      feedback: "Repeat assignment workflow; deviate if skill mismatch; innovate dispatch rules.",
    },
    {
      id: "FSR-015", description: "Scheduled job missing address/contact/scope/access — pre-dispatch blocker",
      trigger: { input_type: "job_scheduled_event", match: "data_gap=true" },
      output: { work_item_kind: "field_service:pre_dispatch_review", title: "Pre-dispatch gap: job {job_id}" },
      priority: "high", impact_area: "Cost Reduction", value_category: "cost_reduced",
      review_role: "operator", context_to_attach: ["job_id", "missing_fields", "scheduled_time"],
      feedback: "Repeat blocker checks; deviate thresholds; innovate intake completeness rules.",
    },
    {
      id: "FSR-016", description: "Job rescheduled/cancelled/moved same day — customer/tech notification check",
      trigger: { input_type: "schedule_change_event" },
      output: { work_item_kind: "field_service:schedule_change_review", title: "Schedule change: job {job_id}" },
      priority: "high", impact_area: "Customer Experience", value_category: "improved_customer_experience",
      review_role: "operator", context_to_attach: ["job_id", "change_reason"],
      feedback: "Repeat notifications; deviate if change types differ; innovate schedule-change template.",
    },
    {
      id: "FSR-017", description: "Technician schedule gap or overload — dispatch optimization suggestion",
      trigger: { input_type: "technician_schedule", match: "utilization_flag=true" },
      output: { work_item_kind: "field_service:capacity_review", title: "Capacity review: {technician}" },
      priority: "medium", impact_area: "Cost Reduction", value_category: "cost_reduced",
      review_role: "operator", context_to_attach: ["technician", "gap_or_overload"],
      feedback: "Repeat suggestions if accepted; deviate if drive-time data poor; innovate routing rules.",
    },
    // --- Job / work order (FSR-018..023) -------------------------------------
    {
      id: "FSR-018", description: "Technician en route without a customer ETA notification — customer update",
      trigger: { input_type: "job_status_event", match: "status=en_route" },
      output: { work_item_kind: "field_service:customer_update", title: "Send ETA update: job {job_id}" },
      priority: "medium", impact_area: "Customer Experience", value_category: "improved_customer_experience",
      review_role: "operator", context_to_attach: ["job_id"],
      feedback: "Repeat if update lowers complaints; deviate messaging if ineffective; innovate update automation.",
    },
    {
      id: "FSR-019", description: "Arrival not followed by started/completed/blocked within window — stale status check",
      trigger: { input_type: "job_status_event", match: "status=arrived" },
      output: { work_item_kind: "field_service:status_check", title: "Stale job status: job {job_id}" },
      priority: "medium", impact_area: "Visibility Improved", value_category: "visibility_improved",
      review_role: "operator", context_to_attach: ["job_id"],
      feedback: "Repeat status checks; deviate if job type takes longer; innovate status-timer rules.",
    },
    {
      id: "FSR-020", description: "Job marked complete — start closeout (invoice, evidence, follow-up, review)",
      trigger: { input_type: "job_completed_event" },
      output: { work_item_kind: "field_service:job_closeout", title: "Closeout: job {job_id}" },
      priority: "high", impact_area: "Cash Acceleration", value_category: "cash_accelerated",
      metric_updated: ["work_completion_rate"], review_role: "operator", context_to_attach: ["job_id"],
      feedback: "Repeat if complete; deviate if closeout missing; innovate closeout automation.",
    },
    {
      id: "FSR-021", description: "Job completed without technician notes/work summary — missing-summary task",
      trigger: { input_type: "job_completed_event", match: "summary_present!=true" },
      output: { work_item_kind: "field_service:job_execution", title: "Missing work summary: job {job_id}" },
      priority: "medium", impact_area: "Quality Improved", value_category: "quality_improved",
      evidence_required: ["fs:completion_note"], review_role: "operator", context_to_attach: ["job_id"],
      feedback: "Repeat prompt; deviate capture method; innovate voice-to-summary workflow.",
    },
    {
      id: "FSR-022", description: "Job completed without required photos/signature — evidence gap before closeout",
      trigger: { input_type: "job_completed_event", match: "evidence_complete!=true" },
      output: { work_item_kind: "field_service:job_execution", title: "Missing completion evidence: job {job_id}" },
      priority: "high", impact_area: "Risk Reduction", value_category: "risk_reduced",
      metric_updated: ["evidence_coverage"], evidence_required: ["fs:after_photo"],
      review_role: "admin", automation_key: "fs:missing_evidence", context_to_attach: ["job_id", "job_type"],
      feedback: "Repeat evidence requirement; deviate by job type; innovate tech capture UI.",
    },
    {
      id: "FSR-023", description: "Tech note mentions additional issue/recommended repair — service opportunity",
      trigger: { input_type: "technician_note", match: "upsell=true" },
      output: { work_item_kind: "field_service:service_opportunity", title: "Service opportunity: {recommended_work}" },
      priority: "medium", impact_area: "Revenue Creation", value_category: "revenue_created",
      review_role: "admin", context_to_attach: ["recommended_work", "customer"],
      feedback: "Repeat if opportunity converts; deviate if low quality; innovate tech prompt language.",
    },
    // --- Parts / materials (FSR-024..026) ------------------------------------
    {
      id: "FSR-024", description: "Technician note flags a needed/ordered part — parts + return-visit workflow",
      trigger: { input_type: "technician_note", match: "part_needed=true" },
      output: { work_item_kind: "field_service:parts_return_visit", title: "Parts / return visit: {part}" },
      priority: "high", impact_area: "Speed Improved", value_category: "faster_cycle_time",
      metric_updated: ["work_items_blocked"], evidence_required: ["fs:blocker_reason"],
      review_role: "operator", context_to_attach: ["part", "vendor"],
      feedback: "Repeat parts workflow; deviate vendor/timing; innovate truck-stock rules.",
    },
    {
      id: "FSR-025", description: "Part ordered with no ETA or return visit scheduled — parts follow-up",
      trigger: { input_type: "parts_status", match: "eta_missing=true" },
      output: { work_item_kind: "field_service:parts_follow_up", title: "Parts ETA follow-up: {part}" },
      priority: "medium", impact_area: "Customer Experience", value_category: "improved_customer_experience",
      review_role: "operator", context_to_attach: ["part", "vendor", "job_id"],
      feedback: "Repeat daily follow-up; deviate cadence by vendor; innovate vendor integration.",
    },
    {
      id: "FSR-026", description: "Return visit required but not scheduled within window — scheduling escalation",
      trigger: { input_type: "parts_status", match: "return_visit=true" },
      output: { work_item_kind: "field_service:parts_return_visit", title: "Schedule return visit: job {job_id}" },
      priority: "high", impact_area: "Revenue Protection", value_category: "revenue_protected",
      review_role: "operator", context_to_attach: ["job_id", "reason"],
      feedback: "Repeat scheduling; deviate if waiting on part/customer; innovate blocker classification.",
    },
    // --- Invoice / payment (FSR-027..031) ------------------------------------
    {
      id: "FSR-027", description: "Completed job not invoiced by EOD — billing follow-up (cash leakage)",
      trigger: { input_type: "invoice_export", match: "status=uninvoiced" },
      output: { work_item_kind: "field_service:invoice_followup", title: "Invoice follow-up: job {job_id}" },
      priority: "high", impact_area: "Cash Acceleration", value_category: "cash_accelerated",
      review_role: "admin", automation_key: "fs:unpaid_invoice", context_to_attach: ["job_id", "amount"],
      feedback: "Repeat invoice check; deviate if warranty/no-charge; innovate closeout-to-invoice automation.",
    },
    {
      id: "FSR-028", description: "Invoice created but missing email/payment link/terms — invoice cleanup before send",
      trigger: { input_type: "invoice_export", match: "data_gap=true" },
      output: { work_item_kind: "field_service:invoice_cleanup", title: "Invoice cleanup: {invoice_id}" },
      priority: "medium", impact_area: "Cash Acceleration", value_category: "cash_accelerated",
      review_role: "admin", context_to_attach: ["invoice_id", "missing_fields"],
      feedback: "Repeat cleanup; deviate if source limitation; innovate invoice template rules.",
    },
    {
      id: "FSR-029", description: "Invoice unpaid past threshold — collection follow-up",
      trigger: { input_type: "ar_aging_report", match: "days_overdue in 7|14|30|60" },
      output: { work_item_kind: "field_service:invoice_followup", title: "Collections: invoice {invoice_id}" },
      priority: "medium", impact_area: "Cash Acceleration", value_category: "cash_accelerated",
      review_role: "admin", automation_key: "fs:unpaid_invoice", context_to_attach: ["invoice_id", "amount", "customer"],
      feedback: "Repeat collection cadence; deviate for disputed/VIP; innovate payment reminders.",
    },
    {
      id: "FSR-030", description: "Payment received — close the cash loop and update revenue/cash metrics",
      trigger: { input_type: "payment_event", match: "type=payment" },
      output: { work_item_kind: "field_service:closeout_update", title: "Cash loop closed: invoice {invoice_id}" },
      priority: "low", impact_area: "Cash Acceleration", value_category: "cash_accelerated",
      review_role: "reviewer", context_to_attach: ["invoice_id", "amount"],
      feedback: "Repeat; deviate if partial/mismatch; innovate payment reconciliation rules.",
    },
    {
      id: "FSR-031", description: "Customer disputes invoice/charge/scope — dispute review + evidence packet",
      trigger: { input_type: "payment_event", match: "type=dispute" },
      output: { work_item_kind: "field_service:dispute_review", title: "Dispute review: invoice {invoice_id}" },
      priority: "high", impact_area: "Risk Reduction", value_category: "risk_reduced",
      evidence_required: ["fs:after_photo", "fs:completion_note"], review_role: "admin", context_to_attach: ["invoice_id", "customer"],
      feedback: "Repeat evidence packet; deviate if evidence missing; innovate completion-proof requirements.",
    },
    // --- Quality / callback (FSR-032..035) -----------------------------------
    {
      id: "FSR-032", description: "Callback/rework tied to a prior job — quality review + margin impact",
      trigger: { input_type: "callback_report" },
      output: { work_item_kind: "field_service:callback_resolution", title: "Callback review: {original_job}" },
      priority: "high", impact_area: "Margin Protection", value_category: "margin_protected",
      metric_updated: ["work_items_active"], review_role: "admin", context_to_attach: ["original_job", "reason"],
      feedback: "Repeat review; deviate if customer-caused; innovate training/checklist/pricing.",
    },
    {
      id: "FSR-033", description: "Warranty work requested within window — validate eligibility before unpaid work",
      trigger: { input_type: "warranty_claim" },
      output: { work_item_kind: "field_service:warranty_review", title: "Warranty validation: {original_job}" },
      priority: "medium", impact_area: "Margin Protection", value_category: "margin_protected",
      review_role: "admin", context_to_attach: ["original_job", "warranty_terms"],
      feedback: "Repeat validation; deviate policy; innovate warranty documentation.",
    },
    {
      id: "FSR-034", description: "Customer complaint detected — rescue escalation",
      trigger: { input_type: "customer_complaint" },
      output: { work_item_kind: "field_service:customer_rescue", title: "Customer rescue: {customer}" },
      priority: "critical", impact_area: "Customer Experience", value_category: "improved_customer_experience",
      review_role: "admin", context_to_attach: ["customer", "complaint"],
      feedback: "Repeat escalation; deviate by severity; innovate service-recovery playbook.",
    },
    {
      id: "FSR-035", description: "New public review below threshold — owner review-rescue workflow",
      trigger: { input_type: "review_posted", match: "below_threshold=true" },
      output: { work_item_kind: "field_service:review_rescue", title: "Review rescue: {rating}★ {platform}" },
      priority: "critical", impact_area: "Revenue Protection", value_category: "revenue_protected",
      review_role: "owner", context_to_attach: ["rating", "platform", "customer"],
      feedback: "Repeat rescue; deviate if spam/unmatched; innovate review request and recovery process.",
    },
    // --- Recurring service (FSR-036..038) ------------------------------------
    {
      id: "FSR-036", description: "Recurring/maintenance service due — scheduling opportunity",
      trigger: { input_type: "recurring_due_report", match: "type!=renewal" },
      output: { work_item_kind: "field_service:recurring_opportunity", title: "Recurring service due: {customer}" },
      priority: "medium", impact_area: "Revenue Creation", value_category: "revenue_created",
      review_role: "operator", automation_key: "fs:recurring_opportunity", context_to_attach: ["customer", "due_date"],
      feedback: "Repeat if scheduled; deviate if declined; innovate renewal workflow.",
    },
    {
      id: "FSR-037", description: "Service agreement expiring within window — renewal follow-up",
      trigger: { input_type: "recurring_due_report", match: "type=renewal" },
      output: { work_item_kind: "field_service:renewal_follow_up", title: "Renewal follow-up: {customer}" },
      priority: "medium", impact_area: "Revenue Protection", value_category: "revenue_protected",
      review_role: "operator", automation_key: "fs:recurring_opportunity", context_to_attach: ["customer", "expiration_date"],
      feedback: "Repeat successful cadence; deviate if decline; innovate renewal messaging.",
    },
    {
      id: "FSR-038", description: "Tech note suggests maintenance-plan eligibility — recurring opportunity",
      trigger: { input_type: "technician_note", match: "recommends_plan=true" },
      output: { work_item_kind: "field_service:recurring_opportunity", title: "Maintenance plan opportunity" },
      priority: "low", impact_area: "Revenue Creation", value_category: "revenue_created",
      review_role: "operator", automation_key: "fs:recurring_opportunity",
      feedback: "Repeat if accepted; deviate targeting; innovate service-plan rules.",
    },
    // --- Admin / operating context (FSR-039..042) ----------------------------
    {
      id: "FSR-039", description: "Job assigned to a tech without configured skill match — dispatcher review",
      trigger: { input_type: "job_scheduled_event", match: "skill_match=false" },
      output: { work_item_kind: "field_service:schedule_dispatch", title: "Skill mismatch: job {job_id}" },
      priority: "medium", impact_area: "Quality Improved", value_category: "quality_improved",
      review_role: "operator", context_to_attach: ["job_id", "required_skill", "technician"],
      feedback: "Repeat if accepted; deviate if context wrong; innovate skill matrix.",
    },
    {
      id: "FSR-040", description: "Estimate/job below configured margin threshold — pricing/margin review",
      trigger: { input_type: "estimate_export", match: "below_margin=true" },
      output: { work_item_kind: "field_service:margin_review", title: "Margin review: {estimate_id}" },
      priority: "medium", impact_area: "Margin Protection", value_category: "margin_protected",
      review_role: "admin", context_to_attach: ["estimate_id", "amount"],
      feedback: "Repeat review; deviate thresholds; innovate pricing rules.",
    },
    {
      id: "FSR-041", description: "Request received after hours or marked emergency — emergency routing/escalation",
      trigger: { input_type: "emergency_request" },
      output: { work_item_kind: "field_service:emergency_intake", title: "Emergency intake: {service}" },
      priority: "critical", impact_area: "Revenue Creation", value_category: "revenue_created",
      review_role: "owner", context_to_attach: ["service", "customer", "received_at"],
      feedback: "Repeat if successful; deviate if false emergency; innovate emergency triage.",
    },
    {
      id: "FSR-042", description: "Part needed lacks an assigned vendor/source — vendor selection task",
      trigger: { input_type: "parts_status", match: "vendor_missing=true" },
      output: { work_item_kind: "field_service:parts_follow_up", title: "Select vendor: {part}" },
      priority: "medium", impact_area: "Speed Improved", value_category: "faster_cycle_time",
      review_role: "admin", context_to_attach: ["part", "job_id"],
      feedback: "Repeat preferred vendor; deviate if unavailable; innovate vendor scoring.",
    },
    // --- Data quality (FSR-043..045) -----------------------------------------
    {
      id: "FSR-043", description: "Expected sync/export/report didn't arrive on cadence — data pipeline repair + stale flag",
      trigger: { input_type: "source_health_event", match: "status=missing" },
      output: { work_item_kind: "field_service:data_pipeline_repair", title: "Source health: {source}" },
      priority: "high", impact_area: "Visibility Improved", value_category: "visibility_improved",
      metric_updated: ["source_health"], review_role: "admin", context_to_attach: ["source", "last_successful_sync"],
      feedback: "Repeat monitoring; deviate cadence; innovate source fallback.",
    },
    {
      id: "FSR-044", description: "Same record has conflicting status/amount/date across sources — reconciliation",
      trigger: { input_type: "source_health_event", match: "conflict=true" },
      output: { work_item_kind: "field_service:reconciliation", title: "Source conflict: {field}" },
      priority: "medium", impact_area: "Data Quality", value_category: "data_quality",
      review_role: "admin", context_to_attach: ["field", "proposed_value"],
      feedback: "Repeat source precedence; deviate when wrong; innovate truth rules.",
    },
    {
      id: "FSR-045", description: "Job status unchanged beyond expected stage duration — status verification",
      trigger: { input_type: "job_status_event", match: "stale=true" },
      output: { work_item_kind: "field_service:status_check", title: "Verify status: job {job_id}" },
      priority: "medium", impact_area: "Visibility Improved", value_category: "visibility_improved",
      review_role: "operator", context_to_attach: ["job_id", "last_update"],
      feedback: "Repeat; deviate expected timing; innovate stage definitions.",
    },
    // --- Customer experience (FSR-046..047) ----------------------------------
    {
      id: "FSR-046", description: "Upcoming appointment lacks a confirmation/reminder — send confirmation",
      trigger: { input_type: "appointment_reminder", match: "confirmed!=true" },
      output: { work_item_kind: "field_service:customer_update", title: "Confirm appointment: job {job_id}" },
      priority: "medium", impact_area: "Customer Experience", value_category: "improved_customer_experience",
      review_role: "operator", context_to_attach: ["job_id", "scheduled_time"],
      feedback: "Repeat if access improves; deviate timing; innovate reminder templates.",
    },
    {
      id: "FSR-047", description: "Technician marks customer unavailable/access blocked — reschedule + wasted-trip tracking",
      trigger: { input_type: "field_access_event" },
      output: { work_item_kind: "field_service:access_follow_up", title: "Failed access: job {job_id}" },
      priority: "high", impact_area: "Cost Reduction", value_category: "cost_reduced",
      review_role: "operator", context_to_attach: ["job_id", "customer"],
      feedback: "Repeat access follow-up; deviate reminder rules; innovate confirmation workflow.",
    },
    // --- Technician capture (FSR-048..050) -----------------------------------
    {
      id: "FSR-048", description: "Technician voice note submitted — transcribe/summarize and propose note/opportunity/blocker",
      trigger: { input_type: "technician_voice_note" },
      output: { work_item_kind: "field_service:field_note_review", title: "Field note review: job {job_id}" },
      priority: "medium", impact_area: "Quality Improved", value_category: "quality_improved",
      review_role: "operator", context_to_attach: ["job_id"],
      feedback: "Repeat accepted summaries; deviate prompt; innovate capture fields.",
    },
    {
      id: "FSR-049", description: "Photos uploaded for a job — classify before/after/issue/part/proof and attach as evidence",
      trigger: { input_type: "job_photos" },
      output: { work_item_kind: "field_service:evidence_classification", title: "Classify photos: job {job_id}" },
      priority: "low", impact_area: "Risk Reduction", value_category: "risk_reduced",
      metric_updated: ["evidence_coverage"], review_role: "operator", context_to_attach: ["job_id", "photo_count"],
      feedback: "Repeat classification; deviate if misclassified; innovate photo prompt UX.",
    },
    {
      id: "FSR-050", description: "Technician marks job blocked — blocker resolution workflow by reason",
      trigger: { input_type: "job_blocked_event" },
      output: { work_item_kind: "field_service:blocker_resolution", title: "Blocked job: {blocker_reason}" },
      priority: "high", impact_area: "Speed Improved", value_category: "faster_cycle_time",
      metric_updated: ["work_items_blocked"], evidence_required: ["fs:blocker_reason"],
      review_role: "operator", context_to_attach: ["job_id", "blocker_reason"],
      feedback: "Repeat blocker workflow; deviate by blocker type; innovate common-blocker prevention.",
    },
    // --- Reporting / management (FSR-051..055) -------------------------------
    {
      id: "FSR-051", description: "Daily job report arrives — mirror status, detect closeout/evidence/invoice gaps, generate exceptions",
      trigger: { input_type: "daily_ops_report" },
      output: { work_item_kind: "field_service:daily_ops_review", title: "Daily ops review" },
      priority: "medium", impact_area: "Visibility Improved", value_category: "visibility_improved",
      review_role: "admin", context_to_attach: ["report_date"],
      feedback: "Repeat daily report; deviate parsing; innovate direct API if valuable.",
    },
    {
      id: "FSR-052", description: "Open estimate report arrives — refresh stale quote queue and pipeline metrics",
      trigger: { input_type: "estimate_pipeline_report" },
      output: { work_item_kind: "field_service:pipeline_review", title: "Pipeline review" },
      priority: "medium", impact_area: "Revenue Protection", value_category: "revenue_protected",
      review_role: "admin", context_to_attach: ["report_date"],
      feedback: "Repeat; deviate follow-up thresholds; innovate pipeline dashboard.",
    },
    {
      id: "FSR-053", description: "A/R aging report arrives — refresh unpaid queue and create/escalate collection tasks",
      trigger: { input_type: "ar_aging_report", match: "report=true" },
      output: { work_item_kind: "field_service:ar_review", title: "A/R review" },
      priority: "medium", impact_area: "Cash Acceleration", value_category: "cash_accelerated",
      review_role: "admin", context_to_attach: ["report_date"],
      feedback: "Repeat; deviate collection cadence; innovate payment process.",
    },
    {
      id: "FSR-054", description: "Callback/rework report shows rate above threshold — quality trend + root-cause review",
      trigger: { input_type: "callback_report", match: "above_threshold=true" },
      output: { work_item_kind: "field_service:quality_review", title: "Quality trend review" },
      priority: "medium", impact_area: "Margin Protection", value_category: "margin_protected",
      review_role: "admin", context_to_attach: ["trend_category"],
      feedback: "Repeat if trend lowers; deviate training/rules; innovate SOP.",
    },
    {
      id: "FSR-055", description: "Technician metrics show an outlier — manager review + coaching recommendation",
      trigger: { input_type: "technician_performance_report", match: "outlier=true" },
      output: { work_item_kind: "field_service:performance_review", title: "Performance review: {technician}" },
      priority: "low", impact_area: "Quality Improved", value_category: "quality_improved",
      review_role: "admin", context_to_attach: ["technician", "metric"],
      feedback: "Repeat coaching if improves; deviate if context explains; innovate training.",
    },
    // --- Marketing / reputation (FSR-056..057) -------------------------------
    {
      id: "FSR-056", description: "Job completed with no complaint/callback and customer eligible — review request",
      trigger: { input_type: "job_completed_event", match: "review_eligible=true" },
      output: { work_item_kind: "field_service:review_request", title: "Review request: {customer}" },
      priority: "low", impact_area: "Revenue Creation", value_category: "revenue_created",
      review_role: "operator", context_to_attach: ["customer", "job_id"],
      feedback: "Repeat if reviews improve; deviate if complaints; innovate request timing.",
    },
    {
      id: "FSR-057", description: "Customer with no job within reactivation window — reactivation follow-up list",
      trigger: { input_type: "dormant_customer_report" },
      output: { work_item_kind: "field_service:customer_reactivation", title: "Reactivation: {customer}" },
      priority: "low", impact_area: "Revenue Creation", value_category: "revenue_created",
      review_role: "admin", context_to_attach: ["customer", "last_service_date"],
      feedback: "Repeat if converts; deviate segment; innovate offer.",
    },
    // --- Financial / margin (FSR-058..060) -----------------------------------
    {
      id: "FSR-058", description: "Actual labor/material cost exceeds estimate/target margin — margin variance review",
      trigger: { input_type: "job_cost_report", match: "margin_variance=true" },
      output: { work_item_kind: "field_service:margin_review", title: "Margin variance: job {job_id}" },
      priority: "medium", impact_area: "Margin Protection", value_category: "margin_protected",
      review_role: "admin", context_to_attach: ["job_id", "variance"],
      feedback: "Repeat review; deviate thresholds; innovate pricing or scope rules.",
    },
    {
      id: "FSR-059", description: "Discount exceeds threshold or lacks a reason — discount approval/review",
      trigger: { input_type: "invoice_export", match: "discount_exception=true" },
      output: { work_item_kind: "field_service:discount_review", title: "Discount review: invoice {invoice_id}" },
      priority: "low", impact_area: "Margin Protection", value_category: "margin_protected",
      review_role: "admin", context_to_attach: ["invoice_id", "discount_amount"],
      feedback: "Repeat review; deviate threshold; innovate discount policy.",
    },
    {
      id: "FSR-060", description: "Refund or credit issued — refund reason review linked to job/customer/complaint",
      trigger: { input_type: "payment_event", match: "type=refund" },
      output: { work_item_kind: "field_service:refund_review", title: "Refund review: {invoice_id}" },
      priority: "medium", impact_area: "Margin Protection", value_category: "margin_protected",
      review_role: "admin", context_to_attach: ["invoice_id", "reason"],
      feedback: "Repeat reason capture; deviate if customer goodwill; innovate root cause.",
    },
  ],
  metrics: [
    { key: "fs:unreviewed_requests", label: "Unreviewed requests", metric_type: "operational", calculation_method: "inputs in received/classified not yet converted", target: 0 },
    { key: "fs:stale_estimates", label: "Stale estimates", metric_type: "operational", calculation_method: "open estimate_follow_up work items past follow-up window", target: 0 },
    { key: "fs:jobs_blocked", label: "Jobs blocked", metric_type: "execution", calculation_method: "work items in blocked status", target: 0 },
    { key: "fs:callback_rate", label: "Callback rate", metric_type: "risk", calculation_method: "callbacks / completed jobs", target: 5 },
    { key: "fs:evidence_completeness", label: "Evidence completeness", metric_type: "evidence", calculation_method: "completed jobs with required evidence / completed jobs", target: 100 },
  ],
  reports: [
    { key: "field_service:daily_ops", cartridge_key: K, label: "Daily Ops Report", description: "New requests, scheduled/completed jobs, blocked jobs, callbacks, unpaid invoices, urgent follow-ups." },
    { key: "field_service:revenue_leakage", cartridge_key: K, label: "Revenue Leakage Report", description: "Stale estimates, unassigned requests, unpaid invoices, missed recurring opportunities, jobs blocked by parts/info." },
    { key: "field_service:quality_callback", cartridge_key: K, label: "Quality / Callback Report", description: "Callbacks, warranty issues, complaints, reopened jobs, missing-evidence patterns, recurring root causes." },
    { key: "field_service:recurring_revenue", cartridge_key: K, label: "Recurring Revenue Opportunity Report", description: "Completed jobs with recurring potential, candidates, follow-up status, estimated annual value." },
    { key: "field_service:owner_weekly", cartridge_key: K, label: "Owner Weekly Report", description: "What came in, what got done, what is stuck, where money is leaking, what needs owner decision." },
  ],
  outcomes: [
    { key: "fs:reduce_leakage", label: "Recover revenue leakage", outcome_type: "revenue_recovery", value_category: "revenue_created", related_workflow_kinds: ["field_service:estimate_follow_up", "field_service:recurring_opportunity"], related_metric_keys: ["fs:stale_estimates"], measurement_method: "recovered estimate value over follow-up window" },
    { key: "fs:reduce_callbacks", label: "Reduce callbacks / repeat visits", outcome_type: "quality", value_category: "cost_reduced", related_workflow_kinds: ["field_service:callback_resolution", "field_service:parts_return_visit"], related_metric_keys: ["fs:callback_rate"], measurement_method: "callback rate trend" },
  ],
  agentInstructions: [
    { role: "intake", purpose: "Classify inbound calls/forms/messages, match customer/location, flag missing info and urgency.", prompt_reference: "field_service/intake@1", allowed_outputs: ["classification", "proposed_work_item", "review_flag"], confidence_threshold: 0.6, human_review_required: true },
    { role: "evidence", purpose: "Detect completed jobs missing required photos/notes and propose evidence-gap tasks.", prompt_reference: "field_service/evidence@1", allowed_outputs: ["evidence_gap_task", "review_blocker"], human_review_required: true },
    { role: "roi", purpose: "Spot completed jobs that imply recurring service and propose opportunities with annual value.", prompt_reference: "field_service/roi@1", allowed_outputs: ["recurring_opportunity", "value_estimate"], human_review_required: true, max_cost_estimate: 1.0 },
  ],
  knowledge: [
    { key: "field_service:wedge", title: "The operating wedge", body: "# The wedge\n\nField-service businesses rarely fail for lack of software. They struggle because the operating loop is scattered across calls, texts, invoices, photos, and the owner's head. Dispatch OS is the operating layer that makes the business visible, executable, provable, and improvable: stop losing money between request, estimate, schedule, execution, evidence, invoice, and follow-up." },
    { key: "field_service:evidence_defaults", title: "Default evidence rules", body: "# Evidence\n\nCompleted jobs require a completion note; higher-risk jobs require photo evidence; callbacks require a root-cause note; unpaid-invoice follow-up requires a contact-attempt note; blocked jobs require a blocker reason." },
  ],
  seed,
};

registerCartridge(cartridge);
export default cartridge;
