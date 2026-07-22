# 6007 — Opportunity Object Model V1 Complete

## Purpose

Represent institutional opportunities that may create revenue, reduce cost, reduce risk, improve readiness, or create strategic value.

## Canonical Object

```json
{
  "opportunity_id": "OPP-000001",
  "institution_id": "",
  "type": "",
  "domains": [],
  "source_signals": [],
  "problem": "",
  "proposed_solution": "",
  "strategic_alignment": [],
  "estimated_value": {},
  "estimated_cost": {},
  "risk": {},
  "readiness": {},
  "sponsor": {},
  "relationships": [],
  "workflow": "",
  "required_evidence": [],
  "approval_path": [],
  "score": {},
  "status": "",
  "next_action": "",
  "outcome": {},
  "audit_history": []
}
```

## Types

- fintech pilot
- vendor replacement
- product expansion
- treasury
- wealth referral
- insurance referral
- participation
- CUSO investment
- venture investment
- private credit
- compliance remediation
- exam readiness
- AI automation
- operational efficiency
- strategic partnership
- M&A
- board education

## Status

- detected
- qualified
- discovery
- scored
- pending approval
- approved
- in workflow
- pilot
- implemented
- realized
- rejected
- deferred
- expired

## Value Model

- revenue
- fee income
- spread
- cost savings
- loss avoidance
- risk reduction
- time savings
- member/customer impact
- strategic option value

Every value estimate includes:

- amount/range
- period
- assumptions
- source
- confidence
- owner

## Qualification Rules

An opportunity becomes qualified when:

- problem is defined
- institution is identified
- sponsor candidate exists
- evidence threshold met
- workflow exists
- prohibited activity absent
- confidence above threshold

## Realized Outcome

- actual value
- period
- attribution level
- evidence
- owner
- variance to estimate
- lessons
- next opportunity

## Acceptance Tests

- Shows why opportunity exists.
- Distinguishes detected from validated.
- Links to readiness, workflow, evidence, and approval.
- Supports realized-value tracking.
- Rejected/deferred state remains auditable.
