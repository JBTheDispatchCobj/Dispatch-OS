// cartridges/cooperative_markets/cartridge.ts
//
// Cartridge — Cooperative Markets (Volume V, RFC-5000..5015). The FIRST product
// vertical: the two-sided market that connects credit unions (and other FIs) with
// innovation companies, in both directions — "make institutions innovative, make
// innovation institutional-grade." It is the process/interpretation layer that
// sits ON TOP of the financial_services taxonomy base (341 canonical classes) and
// the Volume XI ontology (core/registry/data/ontology/*), turning that domain
// knowledge into a running Dispatch loop: inputs (call reports, startup profiles,
// NCUA rulings, market signals) -> observe -> interpret -> propose -> approve ->
// execute -> evidence -> outcome -> learn.
//
// Config-as-data (CONFIGURATION_RULES §9): this is a PackagedConfiguration the core
// installs; core logic never imports it. Nothing here is a vertical fork of core —
// the vertical nouns live here, keyed "cooperative_markets:*", each mapped to a
// canonical Financial Services `schema_ref` so its lifecycle / KPIs / relationships /
// required documents come from the ontology (Volume XI) rather than being re-invented.
//
// Truth discipline (DOCTRINE / ADR-0005): the opportunity, readiness, and innovation
// scores below are Dispatch INFERENCES (deterministic calculations over sourced
// facts), never conclusions baked into model weights. Every regulated or financial
// conclusion — a match, a diligence finding, an investment recommendation — is a
// PROPOSAL that persists evidence, source, confidence, and lineage and passes the
// human approval gate before it becomes an action.

import { installConfiguration, type Cartridge } from "@/core/cartridge";
import { seed } from "@/cartridges/cooperative_markets/seed";

const K = "cooperative_markets";

// ---------------------------------------------------------------------------
// The 9 vertical product entities (+ reserved `vendor`). Each vertical noun maps
// to a canonical Financial Services schema_ref; the ontology (Volume XI) supplies
// its lifecycle / KPIs / relationships / required documents. context_hint records
// the canonical class so the engine can join the two.
// ---------------------------------------------------------------------------

const CANONICAL: Record<string, string> = {
  credit_union: "financial_services:institutions:federal_credit_union",
  call_report: "financial_services:regulation:call_reports",
  executive: "financial_services:organizational_structure:executive",
  innovation_company: "financial_services:innovation_ecosystem:startup",
  cuso: "financial_services:institutions:credit_union_service_organization_cuso",
  fund: "financial_services:institutions:fund",
  investment: "financial_services:investments:investment",
  regulation: "financial_services:regulation:ncua",
  product: "financial_services:innovation_ecosystem:product",
  // Reserved vendor entity (RFC-5004) — third-party/CUSO supplier side.
  vendor: "financial_services:vendors_partners:vendor",
};

const cartridge: Cartridge = {
  key: K,
  label: "Cooperative Markets",
  description:
    "The first product vertical: a two-sided market connecting credit unions / FIs with innovation companies across the discovery → evaluation → pilot → integration → partnership → investment → monitoring ladder. Installs on the financial_services taxonomy base and the Volume XI ontology; scores are Dispatch inferences, recommendations are human-approved proposals with evidence and lineage.",
  version: 1,
  status: "active",

  // --- §5.1 Vocabulary — how this market names the primitives ---------------
  vocabulary: {
    terms: {
      entity: "Institution / Company",
      work_item: "Opportunity Task",
      relationship: "Market Relationship",
      evidence: "Sourced Proof",
      input: "Market Signal",
      report: "Intelligence Brief",
    },
    statusLabels: {
      awaiting_review: "Analyst review",
      completed: "Actioned",
    },
  },

  // --- §5.3/§5.4 Inputs & Sources — the market signals that drive the loop ---
  inputTypes: [
    { key: "ncua_5300_call_report", label: "NCUA 5300 Call Report", parsing_method: "structured", converts_to: ["cooperative_markets:call_report_analysis"], review_required: true },
    { key: "startup_profile", label: "Innovation Company Profile", parsing_method: "structured", converts_to: ["cooperative_markets:startup_screening"], review_required: true },
    { key: "ncua_rule_or_ruling", label: "NCUA Rule / Ruling / Guidance", parsing_method: "pdf", converts_to: ["cooperative_markets:regulatory_impact_review"], review_required: true },
    { key: "market_news", label: "Market News / Industry Signal", parsing_method: "none", converts_to: ["cooperative_markets:opportunity_triage"], review_required: true },
    { key: "pilot_result", label: "Pilot Result / Metrics", parsing_method: "structured", converts_to: ["cooperative_markets:pilot_review"], review_required: true },
  ],
  sourceTypes: [
    { key: "ncua_call_reports", label: "NCUA Call Report / FPR feed", source_type: "api", sync_frequency: "quarterly", reliability_default: 0.98, requires_human_review: false },
    { key: "auric_profile", label: "The Auric public profile", source_type: "api", sync_frequency: "continuous", reliability_default: 0.8, requires_human_review: true },
    { key: "startup_intake", label: "Startup intake submission", source_type: "manual_upload", reliability_default: 0.6, requires_human_review: true },
    { key: "ncua_rules_feed", label: "NCUA rules / Federal Register", source_type: "api", sync_frequency: "daily", reliability_default: 0.98, requires_human_review: true },
  ],

  // --- Entity types (the 9 product nouns + reserved vendor) ------------------
  entityTypes: [
    { key: "cooperative_markets:credit_union", cartridge_key: K, label: "Credit Union", context_hint: `canonical=${CANONICAL.credit_union}; assets, members, net_worth_ratio, charter, core_processor, innovation_score, region` },
    { key: "cooperative_markets:call_report", cartridge_key: K, label: "Call Report (5300)", context_hint: `canonical=${CANONICAL.call_report}; period, net_worth_ratio, roa, loan_to_share, delinquency, member_growth` },
    { key: "cooperative_markets:executive", cartridge_key: K, label: "Executive", context_hint: `canonical=${CANONICAL.executive}; PersonalProfile ext — title, function (CEO|CLO|CFO|CTO|CInnO), institution, incentives, lens` },
    { key: "cooperative_markets:innovation_company", cartridge_key: K, label: "Innovation Company", context_hint: `canonical=${CANONICAL.innovation_company}; stage, category, cu_customers, integrations, funding, readiness, strategic_fit` },
    { key: "cooperative_markets:cuso", cartridge_key: K, label: "CUSO", context_hint: `canonical=${CANONICAL.cuso}; owners, services, aggregate_investment, vendor_risk_rating` },
    { key: "cooperative_markets:fund", cartridge_key: K, label: "Fund", context_hint: `canonical=${CANONICAL.fund}; vehicle, LPs, GP, committed, deployed, IRR, MOIC, thesis` },
    { key: "cooperative_markets:investment", cartridge_key: K, label: "Investment", context_hint: `canonical=${CANONICAL.investment}; instrument, stage, amount, ownership, valuation, performance, exit` },
    { key: "cooperative_markets:regulation", cartridge_key: K, label: "Regulation", context_hint: `canonical=${CANONICAL.regulation}; regulator, citation, applicability, deadlines, controls (draws from the regulation + compliance ontology packs)` },
    { key: "cooperative_markets:product", cartridge_key: K, label: "Product", context_hint: `canonical=${CANONICAL.product}; the innovation company's product — category, capabilities, integrations, compliance_fit` },
    { key: "cooperative_markets:vendor", cartridge_key: K, label: "Vendor (reserved)", context_hint: `canonical=${CANONICAL.vendor}; RFC-5004 — third-party supplier; MSA/SLA, risk_assessment, criticality` },
  ],

  // --- §5.5 Workflows — the relationship stage ladder + engines -------------
  // The market ladder (RFC-5008): discovery → evaluation → pilot → integration →
  // partnership → investment → monitoring. Plus ingestion & intelligence work.
  workflows: [
    { kind: "cooperative_markets:call_report_analysis", label: "Call Report Analysis", description: "Ingest and interpret an NCUA 5300; compute health KPIs and surface innovation-capacity signals. Evidence + source persisted; no conclusion in weights.", defaultOwnerRole: "operator", defaultPriority: "medium", automationLevel: 2, expectedOutcome: "Institution profile refreshed with sourced KPIs", valueCategory: "market_intelligence" },
    { kind: "cooperative_markets:startup_screening", label: "Startup Screening", description: "Intake and evaluate an innovation company relative to its target CU market: stage, category fit, compliance readiness, references.", defaultOwnerRole: "operator", defaultPriority: "medium", evidenceRequirements: ["startup_reference", "compliance_readiness_doc"], approvalRequired: true, automationLevel: 1, expectedOutcome: "Screened company with readiness score", valueCategory: "deal_flow" },
    { kind: "cooperative_markets:opportunity_triage", label: "Opportunity Triage", description: "Turn a market signal into a scored, routed opportunity for the right institution and the right executive lens (CEO vs CLO).", defaultOwnerRole: "operator", defaultPriority: "high", automationLevel: 2, expectedOutcome: "Routed opportunity brief", valueCategory: "market_intelligence" },
    { kind: "cooperative_markets:match_review", label: "Match Review", description: "Review a proposed CU↔company match: strategic fit, regulatory fit, timing. A match is a proposal, human-approved before outreach.", defaultOwnerRole: "reviewer", defaultPriority: "high", approvalRequired: true, automationLevel: 1, expectedOutcome: "Approved / declined match", valueCategory: "deal_flow" },
    { kind: "cooperative_markets:pilot_management", label: "Pilot Management", description: "Stand up and run a pilot: scope, success metrics, compliance guardrails, and go/no-go criteria.", defaultOwnerRole: "operator", defaultPriority: "high", defaultChecklistKey: "cooperative_markets:pilot_readiness", automationLevel: 1, expectedOutcome: "Pilot executed with measured results", valueCategory: "integration" },
    { kind: "cooperative_markets:pilot_review", label: "Pilot Review", description: "Assess pilot results against success criteria; recommend integration, iterate, or stop.", defaultOwnerRole: "reviewer", defaultPriority: "medium", approvalRequired: true, expectedOutcome: "Go / no-go decision with evidence", valueCategory: "integration" },
    { kind: "cooperative_markets:partnership_formation", label: "Partnership Formation", description: "Formalize an ongoing partnership: contract, integration, joint value plan, and the monitoring cadence.", defaultOwnerRole: "operator", defaultPriority: "medium", defaultChecklistKey: "cooperative_markets:partnership_formation", approvalRequired: true, expectedOutcome: "Live partnership", valueCategory: "partnership" },
    { kind: "cooperative_markets:diligence", label: "Investment Diligence", description: "Run diligence on an innovation company for an investment decision: market, product, compliance, financials, references. Assembles the IC memo from APPROVED evidence only.", defaultOwnerRole: "reviewer", defaultPriority: "high", defaultChecklistKey: "cooperative_markets:diligence", evidenceRequirements: ["financials", "compliance_readiness_doc", "customer_reference"], approvalRequired: true, automationLevel: 1, expectedOutcome: "IC memo with recommendation", valueCategory: "investment" },
    { kind: "cooperative_markets:investment_decision", label: "Investment Decision", description: "Investment committee decision on a diligenced opportunity; multi-party approval, terms, and lineage recorded.", defaultOwnerRole: "owner", defaultPriority: "high", approvalRequired: true, expectedOutcome: "Committed / passed with rationale", valueCategory: "investment" },
    { kind: "cooperative_markets:portfolio_monitoring", label: "Portfolio Monitoring", description: "Monitor active partnerships and portfolio companies: KPIs, milestones, risk flags, follow-on signals.", defaultOwnerRole: "operator", defaultPriority: "medium", automationLevel: 2, expectedOutcome: "Current portfolio health with flags", valueCategory: "monitoring" },
    { kind: "cooperative_markets:regulatory_impact_review", label: "Regulatory Impact Review", description: "Interpret an NCUA rule/ruling for who it affects and what changes; produce sourced impact notes, never a conclusion in weights.", defaultOwnerRole: "reviewer", defaultPriority: "medium", approvalRequired: true, expectedOutcome: "Sourced regulatory impact brief", valueCategory: "market_intelligence" },
  ],

  // --- Checklist templates ---------------------------------------------------
  checklistTemplates: [
    { key: "cooperative_markets:pilot_readiness", cartridge_key: K, label: "Pilot Readiness", items: [
      { title: "Define pilot scope and success metrics", sort_order: 1 },
      { title: "Confirm compliance guardrails (BSA/AML, GLBA, UDAAP as applicable)", sort_order: 2, detail: "Draw required controls from the compliance ontology pack for the product's category." },
      { title: "Sign pilot agreement / limited MSA", sort_order: 3 },
      { title: "Provision sandbox / integration access", sort_order: 4 },
      { title: "Set go/no-go decision date and criteria", sort_order: 5 },
    ] },
    { key: "cooperative_markets:diligence", cartridge_key: K, label: "Investment Diligence", items: [
      { title: "Validate market and target-CU demand", sort_order: 1 },
      { title: "Product & integration technical review", sort_order: 2 },
      { title: "Compliance & regulatory-fit assessment", sort_order: 3, detail: "Map the product to applicable regulation/compliance objects; persist evidence + source." },
      { title: "Financials, cap table, and funding review", sort_order: 4 },
      { title: "Customer / CU reference checks", sort_order: 5 },
      { title: "Assemble IC memo from approved evidence", sort_order: 6 },
    ] },
    { key: "cooperative_markets:partnership_formation", cartridge_key: K, label: "Partnership Formation", items: [
      { title: "Execute partnership agreement / contract", sort_order: 1 },
      { title: "Complete third-party (vendor) risk assessment", sort_order: 2, detail: "NCUA third-party due-diligence; residual-risk rating persists evidence + lineage." },
      { title: "Deliver production integration", sort_order: 3 },
      { title: "Agree joint value plan and KPIs", sort_order: 4 },
      { title: "Establish monitoring cadence", sort_order: 5 },
    ] },
  ],

  // --- §5.7 Interpretation rules (description-level) -------------------------
  rules: [
    { key: "cooperative_markets:pca_watch", label: "PCA / net-worth watch", rule_type: "risk", when: "call report net_worth_ratio < 7% (or declining trend)", produces: "regulatory_impact_review + risk flag on the institution profile", severity: "warn", requires_human_approval: false },
    { key: "cooperative_markets:innovation_capacity", label: "Innovation-capacity signal", rule_type: "opportunity", when: "institution shows capacity signals (ROA, membership growth, digital adoption, prior CUSO/fintech activity)", produces: "opportunity_triage for matched innovation categories", severity: "info", requires_human_approval: true },
    { key: "cooperative_markets:strong_match", label: "Strong CU↔company match", rule_type: "opportunity", when: "strategic_fit and regulatory_fit both above threshold for an active company", produces: "match_review proposal routed to the institution + executive lens", severity: "info", requires_human_approval: true },
    { key: "cooperative_markets:compliance_gap", label: "Company compliance gap", rule_type: "validation", when: "innovation company missing SOC 2 / required compliance readiness for its product category", produces: "startup_screening flag; blocks match until resolved", severity: "warn", requires_human_approval: true },
    { key: "cooperative_markets:pilot_success", label: "Pilot success", rule_type: "opportunity", when: "pilot metrics meet success criteria", produces: "partnership_formation proposal", severity: "info", requires_human_approval: true },
    { key: "cooperative_markets:regulatory_change", label: "Regulatory change impact", rule_type: "escalation", when: "new NCUA rule/ruling affects a tracked institution or product category", produces: "regulatory_impact_review routed to affected profiles", severity: "critical", requires_human_approval: true },
  ],

  // --- Executable generation rules (the rules SYSTEM the engine runs) --------
  generationRules: [
    { id: "CM-001", description: "New 5300 call report → analyze and refresh the institution profile.", trigger: { input_type: "ncua_5300_call_report" }, output: { work_item_kind: "cooperative_markets:call_report_analysis", title: "Analyze 5300 — {institution} {period}", proposal_type: "work_item" }, priority: "medium", impact_area: "Market Intelligence", value_category: "market_intelligence", metric_updated: ["cooperative_markets:institution_readiness"], evidence_required: ["source_record"], review_role: "operator", context_to_attach: ["institution", "period", "net_worth_ratio", "roa"], automation_key: "cooperative_markets:on_call_report", risk_level: "low", requires_human_approval: false, feedback: "Repeat: same-shape 5300 auto-analyzes. Deviate: flag anomalies for review. Innovate: learn new capacity signals." },
    { id: "CM-002", description: "New startup profile → screen against target CU market.", trigger: { input_type: "startup_profile" }, output: { work_item_kind: "cooperative_markets:startup_screening", title: "Screen {company} for CU-market fit", proposal_type: "work_item" }, priority: "medium", impact_area: "Deal Flow", value_category: "deal_flow", metric_updated: ["cooperative_markets:startup_readiness"], evidence_required: ["startup_reference"], review_role: "operator", context_to_attach: ["company", "stage", "category"], automation_key: "cooperative_markets:on_startup_intake", risk_level: "low", requires_human_approval: true, feedback: "Repeat: known categories auto-screen. Deviate: novel category → analyst. Innovate: expand the category map." },
    { id: "CM-003", description: "New NCUA rule/ruling → route an impact review to affected profiles.", trigger: { input_type: "ncua_rule_or_ruling" }, output: { work_item_kind: "cooperative_markets:regulatory_impact_review", title: "Regulatory impact — {citation}", proposal_type: "work_item" }, priority: "high", impact_area: "Compliance", value_category: "market_intelligence", evidence_required: ["source_record"], review_role: "reviewer", context_to_attach: ["citation", "regulator", "effective_date"], risk_level: "medium", requires_human_approval: true, feedback: "Repeat: map citation → affected categories. Deviate: ambiguous scope → legal. Innovate: refine applicability model." },
  ],

  // --- §5.8/§5.9 Evidence & approval ----------------------------------------
  evidenceRequirements: [
    { key: "startup_reference", label: "CU / customer reference", evidence_type: "source_record", required: true, applies_to_kind: "cooperative_markets:startup_screening" },
    { key: "compliance_readiness_doc", label: "Compliance readiness (SOC 2, policies)", evidence_type: "document", required: true, applies_to_kind: "cooperative_markets:diligence" },
    { key: "financials", label: "Financials / cap table", evidence_type: "document", required: true, applies_to_kind: "cooperative_markets:diligence" },
    { key: "customer_reference", label: "Customer reference check", evidence_type: "note", required: true, applies_to_kind: "cooperative_markets:diligence" },
  ],
  approvalRules: [
    { key: "cooperative_markets:match_approval", applies_to: "proposal", approver_role: "reviewer", min_risk_level: "medium" },
    { key: "cooperative_markets:investment_approval", applies_to: "proposal", approver_role: "owner", min_risk_level: "high" },
    { key: "cooperative_markets:brief_share", applies_to: "report_share", approver_role: "reviewer", min_risk_level: "low" },
  ],

  // --- §5.10 Automation keys -------------------------------------------------
  automationKeys: [
    { key: "cooperative_markets:on_call_report", label: "Call report received", trigger: "new_input", condition: "input_type = ncua_5300_call_report", action: "run cooperative_markets:call_report_analysis", allowed_agent: "intake", confidence_threshold: 0.7, approval_required: false, risk_level: "low", fallback: "queue for operator review" },
    { key: "cooperative_markets:on_startup_intake", label: "Startup intake received", trigger: "new_input", condition: "input_type = startup_profile", action: "run cooperative_markets:startup_screening", allowed_agent: "intake", confidence_threshold: 0.6, approval_required: true, risk_level: "medium", fallback: "queue for analyst review" },
    { key: "cooperative_markets:on_match_signal", label: "Strong match detected", trigger: "threshold_exceeded", condition: "strategic_fit and regulatory_fit above threshold", action: "propose cooperative_markets:match_review", allowed_agent: "context", approval_required: true, risk_level: "medium", fallback: "hold for analyst" },
  ],

  // --- §5.11 Metrics (Dispatch inferences over sourced facts) ----------------
  metrics: [
    { key: "cooperative_markets:institution_readiness", label: "Institution innovation readiness", metric_type: "readiness", description: "Composite of financial capacity, digital maturity, strategic fit, and regulatory standing from sourced facts — an inference, not weights.", calculation_method: "weighted, sourced sub-scores; each factor traceable to an assertion", target: 75 },
    { key: "cooperative_markets:startup_readiness", label: "Company institutional readiness", metric_type: "readiness", description: "How institution-grade an innovation company is: compliance, security, references, integration maturity.", calculation_method: "weighted readiness factors from evidence", target: 75 },
    { key: "cooperative_markets:innovation_score", label: "Innovation score", metric_type: "operational", description: "Market-facing innovation-capacity signal for an institution (public tier).", calculation_method: "sourced signals; documented methodology; recomputed on new facts", target: 70 },
    { key: "cooperative_markets:opportunity_score", label: "Opportunity score", metric_type: "operational", description: "Strength of a specific CU↔company opportunity: strategic fit × regulatory fit × timing.", calculation_method: "product of sourced fit sub-scores", target: 70 },
    { key: "cooperative_markets:pipeline_velocity", label: "Pipeline velocity", metric_type: "execution", description: "Movement of relationships along discovery→…→investment.", calculation_method: "avg stage advances per period", target: 0 },
    { key: "cooperative_markets:portfolio_irr", label: "Portfolio IRR", metric_type: "financial", description: "Realized + unrealized IRR across investments.", calculation_method: "cash-flow IRR over the investment set", target: 0 },
  ],

  // --- §5.15 Outcomes --------------------------------------------------------
  outcomes: [
    { key: "cooperative_markets:pilots_launched", label: "Pilots launched", outcome_type: "activation", value_category: "integration", related_workflow_kinds: ["cooperative_markets:pilot_management"], related_metric_keys: ["cooperative_markets:pipeline_velocity"], measurement_method: "count of pilots reaching execution" },
    { key: "cooperative_markets:partnerships_formed", label: "Partnerships formed", outcome_type: "partnership", value_category: "partnership", related_workflow_kinds: ["cooperative_markets:partnership_formation"], related_metric_keys: ["cooperative_markets:pipeline_velocity"], measurement_method: "count of live partnerships" },
    { key: "cooperative_markets:investments_made", label: "Investments made", outcome_type: "investment", value_category: "investment", related_workflow_kinds: ["cooperative_markets:investment_decision"], related_metric_keys: ["cooperative_markets:portfolio_irr"], measurement_method: "committed capital + portfolio performance" },
    { key: "cooperative_markets:deal_flow_access", label: "Deal-flow access value", outcome_type: "subscription", value_category: "deal_velocity", related_workflow_kinds: ["cooperative_markets:opportunity_triage", "cooperative_markets:match_review"], related_metric_keys: ["cooperative_markets:opportunity_score"], measurement_method: "qualified matches delivered to subscribers per period" },
  ],

  // --- §5.14 Agent instructions (permissioned; report from approved evidence) -
  agentInstructions: [
    { role: "intake", purpose: "Classify inbound signals (call reports, startup profiles, rulings), extract fields, flag uncertainty. Never conclude — propose.", prompt_reference: "cooperative_markets/intake@1", allowed_outputs: ["classification", "proposed_work_item", "review_flag"], confidence_threshold: 0.6, human_review_required: true },
    { role: "context", purpose: "Assemble/refresh institution & company profiles from sourced facts; compute readiness/opportunity inferences with lineage.", prompt_reference: "cooperative_markets/context@1", allowed_sources: ["ncua_call_reports", "auric_profile", "startup_intake", "ncua_rules_feed"], allowed_outputs: ["profile_update", "score_with_lineage", "match_proposal"], confidence_threshold: 0.65, human_review_required: true },
    { role: "report", purpose: "Draft intelligence briefs and IC memos from APPROVED evidence only, lensed to the reader's executive role, with source citations.", prompt_reference: "cooperative_markets/report@1", allowed_outputs: ["report_draft", "ic_memo", "source_citation_map"], human_review_required: true, max_cost_estimate: 2.0 },
  ],

  // --- §3.25 Reports (RFC-5012 scoring, RFC-5006 portfolio, RFC-5009 IC) -----
  reports: [
    { key: "cooperative_markets:institution_scorecard", cartridge_key: K, label: "Institution Scorecard", description: "Sourced financial + innovation-readiness scorecard for a credit union / FI." },
    { key: "cooperative_markets:opportunity_brief", cartridge_key: K, label: "Opportunity Brief", description: "A scored CU↔company opportunity, lensed to the target executive role." },
    { key: "cooperative_markets:ic_memo", cartridge_key: K, label: "Investment Committee Memo", description: "Diligence-backed investment recommendation assembled from approved evidence." },
    { key: "cooperative_markets:portfolio_report", cartridge_key: K, label: "Portfolio Report", description: "Portfolio health: KPIs, milestones, risk flags, follow-on signals." },
    { key: "cooperative_markets:regulatory_brief", cartridge_key: K, label: "Regulatory Impact Brief", description: "Sourced interpretation of an NCUA rule/ruling and who it affects." },
  ],

  // --- §3.26 Dashboards ------------------------------------------------------
  dashboards: [
    { key: "cooperative_markets:opportunity_pipeline", label: "Opportunity Pipeline", audience: "operator", widgets: [
      { type: "metric", label: "Pipeline velocity", metric_key: "cooperative_markets:pipeline_velocity" },
      { type: "metric", label: "Opportunity score (avg)", metric_key: "cooperative_markets:opportunity_score" },
      { type: "list", label: "Open opportunities", filter: "status!=completed" },
    ] },
    { key: "cooperative_markets:portfolio", label: "Portfolio", audience: "owner", widgets: [
      { type: "metric", label: "Portfolio IRR", metric_key: "cooperative_markets:portfolio_irr" },
      { type: "list", label: "Active partnerships & investments", filter: "kind=cooperative_markets:portfolio_monitoring" },
    ] },
    { key: "cooperative_markets:institution_readiness", label: "Institution Readiness", audience: "operator", widgets: [
      { type: "metric", label: "Institution readiness", metric_key: "cooperative_markets:institution_readiness" },
      { type: "metric", label: "Innovation score", metric_key: "cooperative_markets:innovation_score" },
    ] },
  ],

  // --- Knowledge (seeds versioned ContextObjects on install) -----------------
  knowledge: [
    { key: "cooperative_markets:thesis", title: "The Cooperative Markets thesis", context_type: "policy", body: "# Cooperative Markets\n\nTwo directions, one market: make institutions more innovative, and make innovation institutional-grade. Credit unions and FIs bring members, trust, and regulatory standing; innovation companies bring speed and new capability. Dispatch scores, matches, and moves relationships along discovery → evaluation → pilot → integration → partnership → investment → monitoring. Every score is a sourced inference; every recommendation is a human-approved proposal with evidence and lineage." },
    { key: "cooperative_markets:executive_lenses", title: "Executive lenses (why CEO ≠ CLO)", context_type: "sop", body: "# Executive lenses\n\nThe same insight lands differently by role. A CEO reads an opportunity through growth, positioning, and franchise value; a CLO through risk, compliance, and defensibility; a CFO through yield, cost, and capital; a CTO/CInnO through integration and capability. Content is authored as a base intelligence object plus a role-lens variant (the cartridge branch), so the hook matches the reader's incentives without changing the underlying facts." },
    { key: "cooperative_markets:scoring_methodology", title: "Scoring methodology & truth discipline", context_type: "policy", body: "# Scoring & truth\n\nInstitution readiness, company readiness, innovation score, and opportunity score are deterministic calculations over sourced facts, with each factor traceable to an assertion, source, freshness, and confidence. Scores are never conclusions baked into model weights. Regulated or financial conclusions (matches, diligence findings, investment recommendations) are proposals that pass the human approval gate before becoming actions." },
  ],

  // --- Demo fixtures (installed when a workspace adopts this package) --------
  seed,
};

installConfiguration(cartridge);
export default cartridge;
