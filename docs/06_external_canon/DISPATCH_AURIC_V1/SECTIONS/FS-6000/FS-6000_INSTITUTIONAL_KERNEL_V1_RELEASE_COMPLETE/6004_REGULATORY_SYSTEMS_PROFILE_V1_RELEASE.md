# 6004 — Regulatory & Systems Profile V1 Complete

## Purpose

Define canonical regulatory, obligation, filing, examination, system, data-flow, control, and reporting dependency profiles.

## Regulatory Profile Object

```json
{
  "regulatory_profile_id": "",
  "institution_id": "",
  "charter_or_license": [],
  "regulators": [],
  "jurisdictions": [],
  "activities": [],
  "obligations": [],
  "filings": [],
  "exams": [],
  "findings": [],
  "policies": [],
  "controls": [],
  "evidence": [],
  "change_backlog": []
}
```

## Systems Profile Object

```json
{
  "system_id": "",
  "institution_id": "",
  "name": "",
  "category": "",
  "vendor": "",
  "owner": "",
  "criticality": "",
  "data_classes": [],
  "integrations": [],
  "controls": [],
  "incidents": [],
  "contract": "",
  "health": {},
  "status": ""
}
```

## Applicability Inputs

- institution type
- charter
- asset size
- geography
- licenses
- products
- customers/members
- vendors
- subsidiaries/CUSOs
- data handled
- lending/investment activity
- AI/model use

## Obligation Object

- source rule
- jurisdiction
- requirement summary
- applicability
- frequency
- due date
- owner
- policy
- control
- evidence
- filing
- review date
- confidence

## Filing Object

- filing type
- period
- due date
- source systems
- owner
- reviewer
- submission status
- confirmation
- exceptions
- audit history

## Examination Object

- regulator
- exam type
- scope
- request list
- evidence binder
- findings
- management responses
- remediation
- board reporting
- status

## System Criticality

- critical
- high
- medium
- low

Criticality factors:

- customer/member impact
- regulatory dependency
- financial dependency
- data sensitivity
- recovery requirement
- integration dependency
- operational substitution

## Data Flow

- source system
- target system
- fields/data classes
- purpose
- frequency
- transformation
- owner
- lawful/operational basis
- retention
- security
- reconciliation
- monitoring

## Control Mapping

Every critical system maps to:

- access control
- change control
- backup/recovery
- incident response
- vendor oversight
- data retention
- monitoring
- reconciliation
- evidence
- regulatory obligations

## Decision Rules

- filing due and source stale → block final filing package
- critical system with no owner → critical exception
- AI tool with restricted data and unapproved provider → suspend use
- finding open past due → create remediation escalation
- system incident affects filing source → revalidate report

## Acceptance Tests

- Determines obligations from institution profile.
- Traces filing to source systems and evidence.
- Traces system to vendor, controls, data flows, and risks.
- Tracks exams and findings.
- Flags unsupported AI use and stale filing data.
