# 7009 — Terminal UI & Dashboard Specification V1

## Purpose

Define the user experience for viewing institutional profiles, opportunities, workflows, evidence, approvals, risks, and relationships.

## Navigation

Primary:

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
- Administration

## Institution Terminal Layout

### Header

- institution name
- type
- assets/size
- location
- status
- profile confidence
- last refreshed
- primary alerts

### Main Tabs

- Overview
- Executives
- Board
- Products
- Vendors
- Systems
- Regulatory
- Risk
- Readiness
- Opportunities
- Workflows
- Evidence
- Relationships
- Documents

## Opportunity Card

Show:

- title
- type
- score
- value
- readiness
- sponsor
- confidence
- blockers
- next action
- workflow status

## Workflow View

Show:

- trigger
- steps
- owners
- agents
- evidence
- approvals
- blockers
- due dates
- output
- audit trail

## Evidence Panel

Show:

- source
- type
- owner
- period
- version
- confidence
- freshness
- related claims
- approval status
- access controls

## Approval Queue

Show:

- action
- requestor
- authority
- evidence package
- conditions
- due date
- decision
- audit history

## Dashboard Rules

- source links on every KPI
- visible stale-data flags
- no hidden estimated values
- configurable thresholds
- role-based visibility
- drill-through to objects
- exportable board view
- responsive layout

## Personas

- CEO
- COO
- CFO
- CIO
- CLO
- compliance
- board member
- relationship manager
- investor
- startup
- administrator

## Accessibility

- keyboard navigation
- readable contrast
- text alternatives
- scalable text
- status not communicated by color alone
- exportable accessible reports

## Acceptance Tests

- User can move from KPI to evidence.
- User can move from opportunity to workflow.
- User can see why an approval is required.
- Role permissions hide restricted data.
- Board view is simplified but evidence-backed.
