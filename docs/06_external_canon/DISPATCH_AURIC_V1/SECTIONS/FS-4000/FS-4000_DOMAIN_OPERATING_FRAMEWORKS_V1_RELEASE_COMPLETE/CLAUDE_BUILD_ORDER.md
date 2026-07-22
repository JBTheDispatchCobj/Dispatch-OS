# FS-4000 Master Build Order for Claude / Cursor

## Mission

Turn the 15 completed FS-4000 framework volumes into a working Dispatch / Auric Institutional Intelligence product layer.

## Non-Negotiable Product Principle

Every feature must support one of these four actions:

1. Understand
2. Decide
3. Execute
4. Prove

## Build Order

### Phase 1 — Parse and Normalize

Read every included volume. Extract:

- objects
- fields
- relationships
- workflows
- agents
- KPIs
- dashboards
- evidence types
- approval gates
- acceptance tests

Output:

- `/registry/objects.registry.json`
- `/registry/workflows.registry.json`
- `/registry/agents.registry.json`
- `/registry/kpis.registry.json`
- `/registry/dashboards.registry.json`
- `/registry/relationships.registry.json`
- `/registry/evidence.registry.json`
- `/registry/approvals.registry.json`

### Phase 2 — Create Domain Cartridge Manifests

For each domain, create:

- cartridge manifest
- primary objects
- supported workflows
- allowed agents
- required evidence
- dashboard definitions
- router examples

Output:

- `/cartridges/FS-4001_BANKING/manifest.json`
- `/cartridges/FS-4002_CREDIT_UNIONS/manifest.json`
- repeat through FS-4015

### Phase 3 — Build Institution Profile Schema

Create:

- institution.schema.json
- executive.schema.json
- vendor.schema.json
- product.schema.json
- regulatory_profile.schema.json
- readiness_score.schema.json
- opportunity.schema.json

### Phase 4 — Build Workflow Router

Router must accept:

- user request
- institution profile
- uploaded docs
- known domain
- target output

Router must return:

- domains
- workflow
- required objects
- required evidence
- agents
- approvals
- output template
- missing inputs
- next action

### Phase 5 — Build Agent Permission Model

Create a matrix showing:

- agent
- domain
- allowed actions
- prohibited actions
- human approval requirement
- output format
- evidence requirement

### Phase 6 — Build Opportunity Engine

Create scoring model:

- value
- urgency
- feasibility
- readiness
- compliance burden
- integration burden
- sponsor strength
- time to execute
- relationship value

Output:

- opportunity_score.schema.json
- opportunity_detection_rules.md
- opportunity_dashboard.json

### Phase 7 — Build Demo Fixtures

Create sample data and outputs for:

1. Credit Union Terminal
2. Fintech Pilot Readiness
3. Exam Response / Evidence Binder
4. Loan Participation Opportunity

Each demo must include:

- sample institution
- sample source documents/data
- objects created
- workflow run
- agent outputs
- evidence generated
- dashboard output
- board/executive memo

### Phase 8 — Package Product

Create:

- product architecture README
- setup instructions
- pilot onboarding checklist
- sales one-pager
- implementation project plan
- first 30 days checklist
- known gaps
- roadmap

## Definition of Done

This sprint is done when a user can ask:

- “Can this credit union pilot this fintech?”
- “Prepare for this exam request.”
- “Package this loan participation.”
- “Find institutional opportunities in this CU profile.”
- “Map this vendor to risk, compliance, and opportunity.”

And Dispatch can return:

- objects
- workflows
- agents
- evidence
- approvals
- memo/dashboard output
- next actions

## Build Style

Move fast. Use structured JSON and markdown. Avoid over-engineering. Favor explicit registries, fixtures, and working demos over abstract architecture.
