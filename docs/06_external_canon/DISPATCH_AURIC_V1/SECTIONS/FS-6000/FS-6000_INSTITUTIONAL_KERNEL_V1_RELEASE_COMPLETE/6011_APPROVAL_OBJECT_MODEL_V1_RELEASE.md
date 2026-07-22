# 6011 — Approval Object Model V1 Complete

## Purpose

Represent human authority, evidence reviewed, conditions, decision, and audit history.

## Canonical Approval Object

- approval ID
- type
- tenant
- institution
- related object
- workflow
- requestor
- approver
- authority basis
- threshold
- requested action
- recommendation
- evidence package
- risks
- conditions
- requested date
- due date
- decision
- decision date
- expiration
- notification status
- audit history

## Decision Values

- approved
- approved with conditions
- rejected
- deferred
- escalated
- withdrawn
- expired

## Authority Types

- executive
- credit
- investment
- compliance
- legal
- board/committee
- vendor risk
- security
- operations
- licensed advisor
- licensed insurance
- regulator/external

## Approval Chains

- sequential
- parallel
- threshold-based
- committee
- delegated
- temporary
- emergency
- dual control

## Conditional Approval

Each condition includes:

- condition
- owner
- due date
- evidence
- status
- closure approver
- effect if unmet

## Validation Rules

- approver must have active authority
- threshold must cover requested action
- evidence package must satisfy workflow requirements
- agent cannot approve
- expired approval cannot authorize action
- changed material facts may invalidate approval
- delegated authority must be active

## Example

```json
{
  "approval_type": "fintech_pilot",
  "decision": "approved_with_conditions",
  "conditions": [
    {
      "condition": "Complete penetration test review",
      "owner": "security",
      "status": "open"
    }
  ]
}
```

## Acceptance Tests

- Validates authority and threshold.
- Links decision to evidence.
- Conditional approval creates tasks.
- Expired/invalid approvals block action.
- Decision history is immutable.
