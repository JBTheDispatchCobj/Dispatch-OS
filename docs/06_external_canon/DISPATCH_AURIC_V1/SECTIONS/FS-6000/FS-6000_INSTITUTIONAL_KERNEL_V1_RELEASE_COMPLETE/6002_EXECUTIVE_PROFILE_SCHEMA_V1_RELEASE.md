# 6002 — Executive Profile Schema V1 Complete

## Purpose

Define the canonical person and role object for executives, board members, committee members, regulators, advisors, investors, relationship owners, and institutional decision-makers.

## Canonical Object

```json
{
  "executive_id": "PER-000001",
  "identity": {},
  "role_history": [],
  "current_roles": [],
  "authority": [],
  "responsibilities": [],
  "committees": [],
  "strategic_priorities": [],
  "risk_ownership": [],
  "opportunity_ownership": [],
  "relationships": [],
  "communication_profile": {},
  "decision_history": [],
  "activity_timeline": [],
  "documents": [],
  "visibility": {},
  "audit_history": []
}
```

## Identity

- full name
- preferred name
- pronouns if self-declared and permitted
- public biography
- professional credentials
- location
- public email
- public phone
- institution
- profile links
- source
- confidence
- last verified

## Role History

Each role includes:

- institution
- title
- department
- start date
- end date
- current status
- reporting line
- responsibilities
- source
- confidence

## Current Role Types

- executive
- officer
- board member
- committee member
- project sponsor
- relationship owner
- approver
- regulator
- advisor
- investor
- partner
- subject-matter expert

## Authority Model

Each authority record includes:

- category
- scope
- threshold
- delegated authority
- institution
- effective date
- expiration
- approval chain
- evidence
- source
- confidence

Authority categories:

- budget
- credit
- investment
- vendor
- technology
- data
- security
- compliance
- policy
- hiring
- external communication
- board recommendation
- AI
- strategic partnership
- contract
- workflow approval

## Responsibility Map

- operations
- finance
- technology
- lending
- mortgage
- treasury
- payments
- compliance
- risk
- audit
- cybersecurity
- data
- vendor management
- innovation
- AI
- customer/member experience
- capital
- strategy
- board reporting

## Committee Membership

Each membership includes:

- committee
- role
- voting status
- mandate
- start/end dates
- authority
- meeting cadence
- decisions
- actions

## Strategic Priority Ownership

- priority
- sponsor level
- influence
- budget ownership
- success metrics
- blockers
- current status
- board visibility

## Risk Ownership

- risk domain
- accountability
- control ownership
- escalation threshold
- reporting duty
- open issues
- remediation

## Opportunity Ownership

- opportunity
- ownership role
- influence
- sponsor strength
- next action
- blockers
- target outcome
- decision date

## Communication Profile

- preferred channel
- meeting preference
- executive-summary preference
- document preference
- response cadence
- decision style
- escalation preference
- risk tolerance
- dashboard preference
- AI interaction preference

Communication profile is tenant-private unless explicitly shared.

## Decision History

Each decision includes:

- request
- date
- authority basis
- evidence reviewed
- alternatives
- decision
- conditions
- dissent
- follow-up
- related workflow
- approval object

## Relationship Graph

Relationship types:

- reports to
- manages
- serves with
- approves
- advises
- introduced by
- prior colleague
- vendor contact
- regulator contact
- board relationship
- peer relationship
- investor relationship
- association relationship

## Warm Path

A warm path includes:

- target executive
- path
- relationship owners
- source
- strength
- recency
- permission
- recommended introducer
- confidence

## Visibility

Fields/notes may be:

- public
- tenant internal
- confidential
- relationship-owner only
- board only
- compliance only
- audit only

## Validation Rules

- person identity cannot merge solely on name
- current role requires source or tenant attestation
- authority thresholds require internal verification
- public bio remains separate from internal notes
- private relationship notes cannot appear in public search
- expired authority cannot approve action
- board-only content must be permissioned

## Example

```json
{
  "executive_id": "PER-100001",
  "identity": {
    "full_name": "Jordan Example",
    "public_biography": "Chief Executive Officer of Example Community CU",
    "source": "institution website",
    "confidence": "high"
  },
  "current_roles": [
    {
      "institution_id": "CU-100001",
      "title": "Chief Executive Officer",
      "start_date": "2022-01-01",
      "status": "active"
    }
  ]
}
```

## Outputs

- executive brief
- meeting preparation
- authority map
- relationship map
- decision timeline
- opportunity ownership report
- committee profile
- risk ownership report
- succession alert

## Acceptance Tests

- Supports concurrent roles across institutions.
- Preserves role history.
- Routes approvals using verified authority.
- Separates public facts from private notes.
- Identifies sponsors and relationship paths.
- Prevents expired or inferred authority from authorizing action.
