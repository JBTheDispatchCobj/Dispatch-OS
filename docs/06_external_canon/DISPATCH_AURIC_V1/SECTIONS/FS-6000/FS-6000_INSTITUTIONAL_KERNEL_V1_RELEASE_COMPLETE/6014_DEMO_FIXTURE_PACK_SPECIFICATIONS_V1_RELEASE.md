# 6014 — Demo Fixture Pack Specifications V1 Complete

## Purpose

Define reproducible, synthetic, evidence-backed demo packs for the four primary V1 scenarios.

## Common Pack Structure

- README
- manifest
- synthetic institution
- synthetic executives
- synthetic board
- vendors
- products
- systems
- strategic priorities
- risks
- documents
- data files
- expected objects
- expected graph
- expected workflows
- expected agents
- expected approvals
- expected outputs
- acceptance results
- reset specification

## Demo 1 — Credit Union Terminal

Required fixtures:

- institution JSON
- call-report CSV
- org chart
- vendor inventory
- product inventory
- strategic plan
- risk assessment
- board minutes
- executive bios
- member segments

Expected outputs:

- institution profile
- executive graph
- vendor/system stack
- readiness
- opportunities
- board brief

## Demo 2 — Fintech Pilot

Fixtures:

- startup deck
- product documentation
- security documents
- integration map
- data flow
- pricing
- references
- use case
- CU system map

Expected outputs:

- startup profile
- fit score
- readiness
- vendor risk
- pilot plan
- approval path
- board memo

## Demo 3 — Exam Binder

Fixtures:

- regulator request list
- policies
- procedures
- controls
- evidence
- prior findings
- board reporting
- stale evidence
- missing evidence

Expected outputs:

- request tracker
- evidence binder
- draft responses
- exceptions
- remediation
- locked package

## Demo 4 — Loan Participation

Fixtures:

- borrower financials
- credit memo
- collateral
- loan terms
- buyer profiles
- eligibility rules
- participation agreement
- servicing terms

Expected outputs:

- completeness score
- risk memo
- buyer ranking
- allocation
- approval queue
- settlement checklist

## Fixture Rules

- synthetic labels visible
- no real confidential data
- deterministic IDs
- reconciled totals
- intentional defects documented
- resettable
- versioned

## Acceptance Tests

- All packs load from clean state.
- Expected outputs are deterministic enough to test.
- Agents remain permission controlled.
- Approval gates block material actions.
- Evidence links are visible.
