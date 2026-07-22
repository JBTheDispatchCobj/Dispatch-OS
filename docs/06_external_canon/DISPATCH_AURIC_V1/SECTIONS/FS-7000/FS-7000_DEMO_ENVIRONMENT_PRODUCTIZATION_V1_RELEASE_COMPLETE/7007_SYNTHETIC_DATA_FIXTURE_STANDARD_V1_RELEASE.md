# 7007 — Synthetic Data & Fixture Standard V1

## Purpose

Define how realistic demo data is created without exposing real confidential information or misleading users.

## Fixture Principles

- synthetic by default
- internally coherent
- realistic ranges
- explicit fictional labels
- no copied private data
- no accidental real-person identity
- reproducible
- resettable
- scenario-specific
- evidence-backed within the synthetic environment

## Fixture Types

- institution profile
- executive graph
- board graph
- vendor stack
- product stack
- financial statements
- call reports
- contracts
- policies
- exam requests
- loan packages
- startup documents
- member/household data
- emails
- meeting notes
- approvals
- audit events

## Data Provenance Label

Every fixture record includes:

- fixture_id
- scenario
- synthetic=true
- generated date
- generator/version
- source template
- sensitivity
- reset group
- dependencies

## Consistency Rules

Examples:

- assets equal liabilities plus capital
- loan totals reconcile
- member/customer counts align with segments
- contract dates align with renewal alerts
- board minutes align with strategic priorities
- exam requests align with evidence gaps
- loan covenants align with financials
- participation allocations reconcile
- referral outcomes reconcile to attribution

## Error Fixtures

Create controlled defects:

- missing document
- stale policy
- conflicting data
- unapproved vendor
- expired license
- concentration breach
- incomplete evidence
- delayed approval
- failed integration
- low-confidence inference

## Privacy Standard

Do not use:

- real SSNs
- real account numbers
- real patient data
- real member records
- real employee private data
- real confidential contracts

## Fixture Packaging

Each demo fixture pack includes:

- README
- manifest
- seed JSON
- CSV files
- documents
- expected objects
- expected workflows
- expected outputs
- acceptance results
- reset script/specification

## Acceptance Tests

- Fixtures load repeatedly with same IDs.
- Financial and operational records reconcile.
- Synthetic labels remain visible.
- Error cases are intentional and documented.
- No real confidential data is present.
