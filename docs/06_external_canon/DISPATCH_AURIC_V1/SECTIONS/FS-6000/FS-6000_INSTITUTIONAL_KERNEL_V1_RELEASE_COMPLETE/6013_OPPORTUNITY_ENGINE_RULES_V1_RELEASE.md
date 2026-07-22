# 6013 — Opportunity Engine Rules V1 Complete

## Purpose

Detect, qualify, score, rank, route, and measure institutional opportunities.

## Detection Sources

- institution profile
- financial trends
- product gaps
- vendor contracts
- complaints
- exam findings
- regulatory changes
- executive priorities
- member/customer behavior
- startup capabilities
- public data
- relationship notes
- system events
- peer cohorts

## Detection Rule Object

- rule ID
- type
- required signals
- disqualifiers
- evidence minimum
- score weights
- workflow
- owner
- review date
- version

## Rules

### Fintech Pilot

Required:

- institutional pain
- startup capability fit
- sponsor
- minimum readiness
- no critical blocker

### Vendor Replacement

Required:

- contract window or service/risk trigger
- identified pain
- viable alternatives
- owner

### Loan Participation

Required:

- asset/package
- eligibility
- risk fit
- buyer profile
- servicing terms

### Wealth Referral

Required:

- permitted signal
- consent path
- licensed partner
- qualification

### Compliance Remediation

Required:

- obligation/control/evidence gap
- owner
- due date
- remediation workflow

### Startup-to-CU Match

Required:

- capability-pain fit
- integration plausibility
- compliance plausibility
- sponsor/readiness

## Score Model

- value 20%
- urgency 12%
- feasibility 10%
- readiness 12%
- regulatory burden 8%
- integration burden 8%
- sponsor strength 10%
- time to execute 8%
- relationship value 7%
- confidence 5%

## Penalties

- missing evidence
- no sponsor
- unresolved authority
- high security risk
- stale data
- prohibited activity
- low confidence

## Bonuses

- board priority
- contract deadline
- repeat pain
- direct revenue
- risk reduction
- peer adoption
- warm relationship

## Lifecycle

- detected
- qualified
- scored
- routed
- approved
- executed
- measured
- closed

## Acceptance Tests

- Rule rationale is transparent.
- Missing evidence lowers confidence.
- Scores are recalculable.
- Opportunity routes to workflow.
- Realized outcome updates future ranking.
