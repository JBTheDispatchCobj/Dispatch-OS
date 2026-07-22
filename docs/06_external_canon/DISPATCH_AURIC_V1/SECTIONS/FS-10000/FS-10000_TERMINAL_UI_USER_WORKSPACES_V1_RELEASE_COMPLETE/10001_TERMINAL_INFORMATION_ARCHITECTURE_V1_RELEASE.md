# 10001 — Terminal Information Architecture V1

## Purpose

Define the primary navigation, object hierarchy, workspace model, and interaction patterns for the Dispatch / Auric Terminal.

The Terminal is the user-facing operating surface for institutional profiles, opportunities, workflows, evidence, approvals, dashboards, relationships, and domain cartridges.

## Design Principles

- Institution first, but not institution only.
- Every view must connect data to action.
- Every material claim should drill to evidence.
- Every opportunity should drill to workflow.
- Every workflow should expose approvals and audit history.
- Role-specific complexity should be reduced without hiding governance.
- Search and command should coexist with structured navigation.
- Users should know what is current, missing, inferred, restricted, and pending approval.
- The UI should scale from one institution to thousands.
- The same canonical objects power dashboards, search, and reports.

## Primary Navigation

- Home
- Institutions
- Executives
- Opportunities
- Workflows
- Evidence
- Approvals
- Dashboards
- Network
- Cartridges
- Reports
- Administration

## Home

Default content:

- priority alerts
- assigned tasks
- approval queue
- active workflows
- top opportunities
- stale data
- upcoming meetings
- recent institutional activity
- quick search
- command bar

## Institution Terminal

Primary tabs:

1. Overview
2. Executives
3. Board
4. Financials
5. Products
6. Vendors
7. Systems
8. Regulatory
9. Risk
10. Readiness
11. Opportunities
12. Workflows
13. Evidence
14. Relationships
15. Documents
16. Activity

## Global Object Pages

Every canonical object page should include:

- identity/header
- status
- owner
- source confidence
- last updated
- related objects
- related workflows
- evidence
- approvals
- audit history
- actions
- permissions

## Command Bar

Supports:

- search institutions
- open object
- launch workflow
- create opportunity
- upload document
- request approval
- generate report
- ask institutional question
- switch workspace
- navigate history

## Workspace Context

The header should identify:

- current tenant
- current workspace
- current institution
- user role
- permission context
- data freshness
- environment: demo, sandbox, pilot, production

## Responsive Behavior

Desktop:

- left navigation
- persistent context header
- multi-panel detail
- side evidence drawer

Tablet:

- collapsible navigation
- stacked panels
- simplified graph

Mobile:

- alerts
- tasks
- approvals
- meeting briefs
- quick object lookup
- restricted editing

## Information Density

Three density modes:

- Executive
- Operator
- Analyst

Executive:

- summaries
- decisions
- exceptions
- opportunities
- evidence confidence

Operator:

- tasks
- workflow status
- source detail
- dependencies
- approvals

Analyst:

- fields
- lineage
- graph
- mapping
- confidence
- comparisons

## Acceptance Tests

- User can reach any primary object within three navigation steps.
- Institution context remains visible.
- Every material KPI drills to source.
- Every opportunity links to workflow and owner.
- Restricted objects are hidden or clearly inaccessible.
- Executive and analyst views use the same underlying objects.

## V1 Release-Complete Implementation Specification

### Governing Contract

This workspace is a governed projection of canonical objects. It must never create an alternate source of truth. Mutations are submitted through typed commands, evaluated against tenant, role, object, field, workflow and approval policy, and recorded as auditable events. Public, private, attested, inferred and synthetic data remain visibly distinct. Unknown, stale, conflicted and restricted values are rendered explicitly rather than silently normalized.

### Required Page Contract

Every route in this volume declares:

- stable route ID and version;
- tenant and workspace context;
- primary object type and object identifier;
- permitted personas and required capabilities;
- loader contract, query contract and cache policy;
- visible fields and field-level masking rules;
- available commands and required approvals;
- evidence, lineage and freshness affordances;
- loading, empty, stale, partial, restricted, conflict and error states;
- analytics, audit and accessibility events;
- performance budget and graceful-degradation behavior.

### Canonical UI State Model

`uninitialized -> loading -> ready | empty | partial | stale | restricted | conflicted | failed`

A ready view may enter `submitting`, `awaiting_approval`, `refreshing`, `exporting` or `offline_degraded`. Mutating commands must be idempotent, expose progress, preserve user input on recoverable failure and provide a trace ID on terminal failure.

### Permissions and Human Authority

The UI may retrieve, classify, summarize, compare, calculate, draft, recommend, route and assemble evidence. It may not imply that an automated recommendation is an approval. Final lending, investment, compliance, legal, vendor, policy-waiver, regulatory-communication and capital-allocation decisions require an authorized human approval object. Hidden controls are not a substitute for server-side enforcement.

### Evidence and Provenance

Every material claim, score, KPI or recommendation provides a drill-through to source, observation date, owner, transformation, confidence, freshness, review status and approval status. Derived values expose their formula and input set. Report exports preserve evidence references and a snapshot timestamp.

### Telemetry

Required events include `page_viewed`, `object_opened`, `filter_applied`, `search_executed`, `command_started`, `command_completed`, `command_failed`, `approval_requested`, `evidence_opened`, `report_exported`, `access_denied` and `stale_data_acknowledged`. Events exclude protected field values and inherit tenant retention policy.

### Security and Privacy Controls

- server-authoritative authorization on every read and command;
- tenant isolation in route loaders, search, exports and caches;
- field masking and purpose-based access;
- signed export URLs with short expiration;
- anti-CSRF, content-security policy and output encoding;
- no secrets or regulated data in client logs;
- step-up authentication for privileged actions;
- immutable audit event for administrative and approval mutations;
- watermarking for restricted board, regulatory and transaction materials.

### Performance Budgets

- shell interactive: p75 <= 2.5 seconds on supported desktop broadband;
- primary route data: p95 <= 3.0 seconds, excluding declared long-running reports;
- command acknowledgement: <= 500 ms;
- search first results: p95 <= 2.0 seconds;
- visual response to input: <= 100 ms;
- large lists use pagination or virtualization;
- long-running work returns a durable job object and progress state.

### Required Test Families

1. route and deep-link tests;
2. tenant and role authorization tests;
3. field-mask and restricted-state tests;
4. state-transition and optimistic-update tests;
5. evidence, lineage and freshness drill-through tests;
6. keyboard, focus, screen-reader and contrast tests;
7. responsive layout tests;
8. API-contract and schema tests;
9. telemetry and audit-event tests;
10. failure, retry, timeout and offline-degradation tests;
11. export and report snapshot tests;
12. performance-budget tests.

### Definition of Done

The volume is complete only when its routes, pages, components, states, visibility rules, commands, events, fixtures, sample outputs, acceptance tests and operational dependencies are represented in the package registries and pass package validation.


## Volume-Specific Production Contract

**Scope:** routes, global navigation, context, breadcrumbs, object drilldowns and workspace composition.

### Required Primary Objects

The page contract must reference only registered objects and relationships from FS-5000/FS-6000/FS-9000. The primary object, related-object collections, evidence links, approval links and activity stream are loaded independently so partial availability is visible.

### Required Commands

Commands are versioned, permission-checked and auditable. Each command declares input schema, idempotency key, actor, reason, evidence dependencies, approval requirement, success event, failure event and compensating behavior.

### Exception Behavior

The workspace must distinguish no data, unavailable source, stale source, insufficient permission, unresolved identity, policy conflict, failed dependency and system error. Each state provides a safe next action without fabricating completeness.

### Release Acceptance

A synthetic executive, operator, analyst, administrator and auditor can complete the principal journeys for Terminal Information Architecture using the fixture tenant without bypassing evidence, permission or approval controls.
