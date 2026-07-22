# 7001 — Credit Union Terminal Demo V1

## Purpose

Define the primary executive-facing demonstration of the Dispatch / Auric Institutional Intelligence platform.

The Credit Union Terminal demo must show that the product can ingest fragmented institutional context and produce a coherent, governed, actionable operating profile.

The demo is not a static dashboard. It is a working institutional digital twin.

## Demo Thesis

The Terminal should answer:

- Who is this institution?
- Who runs it?
- What does it offer?
- What systems and vendors does it depend on?
- What is it trying to accomplish?
- What risks and regulatory obligations matter?
- What is it ready to adopt?
- What opportunities should it pursue?
- What should happen next?
- What evidence supports each conclusion?

## Synthetic Institution

Create a fictional federally insured credit union with:

- $1.2–$1.8 billion in assets
- 85,000–125,000 members
- 8–14 branches
- mixed consumer and commercial lending
- active mortgage program
- no mature wealth program
- limited insurance referrals
- multiple legacy vendors
- a strategic priority around AI and operational efficiency
- recent vendor-risk and exam-readiness concerns
- moderate digital maturity
- executive interest in fintech pilots
- board concern about non-interest income and succession

## Required Profile Objects

- CreditUnion
- Executive
- Board
- Committee
- MemberSegment
- Product
- Vendor
- System
- Contract
- RegulatoryProfile
- Risk
- StrategicPriority
- ReadinessScore
- Opportunity
- Workflow
- Evidence
- Approval
- KPI
- Dashboard

## Terminal Views

### Institution Snapshot

Show:

- legal identity
- charter
- field of membership
- headquarters and footprint
- assets
- members
- loans
- deposits
- net worth
- ROA
- product mix
- regulatory profile
- strategic priorities
- current alerts

### Executive Graph

Show:

- CEO
- COO
- CFO
- CIO/CTO
- CLO
- CCO
- business-line leaders
- board officers
- committee roles
- decision authority
- opportunity ownership
- risk ownership
- succession flags

### Vendor and Systems Stack

Show:

- core
- digital banking
- LOS
- mortgage LOS
- CRM
- cards
- payments
- fraud
- BSA/AML
- cybersecurity
- document management
- BI
- AI tools
- contract renewal dates
- spend
- criticality
- integration type
- risk status
- replacement readiness

### Product Stack

Show:

- deposits
- consumer lending
- mortgage
- commercial lending
- treasury
- cards
- payments
- wealth
- insurance
- participations
- CUSO activity
- fintech pilots

Each product must show:

- status
- owner
- provider
- adoption
- economics
- risk
- regulatory burden
- opportunity status

### Regulatory and Risk Profile

Show:

- primary regulator
- exam cadence
- open findings
- policy-review dates
- evidence gaps
- vendor-review status
- cyber posture
- AI governance status
- board reporting obligations

### Strategic Priorities

Include:

- deposit growth
- commercial expansion
- operational efficiency
- AI enablement
- vendor consolidation
- non-interest income
- member experience
- succession planning

### Readiness Scores

Display:

- digital
- product
- compliance
- integration
- adoption
- investment
- AI
- security
- vendor
- governance

Every score requires:

- score
- evidence
- blockers
- confidence
- next action

### Opportunity Queue

Seed at least ten opportunities:

1. Wealth referral program
2. Insurance referral program
3. Treasury management expansion
4. Fintech pilot
5. Vendor consolidation
6. Core-adjacent workflow automation
7. Loan participation sales
8. Member business services
9. Compliance evidence automation
10. Board AI education

Each opportunity must include:

- rationale
- source signal
- estimated value
- readiness
- sponsor
- workflow
- next action
- evidence
- confidence

## Demo Interactions

The presenter should be able to ask:

- Show the top five opportunities.
- Why is wealth management ranked first?
- Which vendors create the greatest risk?
- Which contracts renew within twelve months?
- Which executive should own this fintech pilot?
- What evidence is missing before the next exam?
- What would the board need to approve?
- Which member segments are underserved?
- What can be executed in ninety days?

## Agent Team

- Institution Profile Agent
- Executive Graph Agent
- Vendor Stack Agent
- Product Stack Agent
- Regulatory Readiness Agent
- Opportunity Detection Agent
- Readiness Score Agent
- Board Report Writer
- Audit Trail Agent

## Required Evidence Fixtures

- synthetic call report
- synthetic strategic plan
- vendor inventory
- contract summary
- board minutes
- organizational chart
- product list
- risk assessment
- exam request excerpt
- policy calendar
- executive biographies
- member segment file

## Dashboard Outputs

- Executive Terminal
- Board Dashboard
- Opportunity Dashboard
- Vendor Dashboard
- Regulatory Dashboard
- Readiness Dashboard
- Risk Dashboard
- Relationship Graph

## Executive Memo

Generate a one-page memo containing:

- institution summary
- three strategic observations
- five highest-value opportunities
- three critical risks
- ninety-day action plan
- required decisions

## Acceptance Tests

- The Terminal renders from canonical objects.
- Every material claim links to evidence.
- Missing information is visible.
- Opportunities link to workflows and owners.
- Scores are explainable.
- Board-sensitive outputs require approval.
- The demo can be reset and replayed.
