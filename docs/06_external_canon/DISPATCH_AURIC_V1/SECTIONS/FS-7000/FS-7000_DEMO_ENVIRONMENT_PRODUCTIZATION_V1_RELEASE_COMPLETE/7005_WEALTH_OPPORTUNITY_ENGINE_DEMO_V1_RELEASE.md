# 7005 — Wealth Opportunity Engine Demo V1

## Purpose

Demonstrate how member or customer context becomes a consented, compliant, attributable wealth-management opportunity.

## Scenario

Use a synthetic credit-union member base with:

- deposit balances
- age bands
- business ownership
- mortgage relationships
- retirement events
- large liquidity events
- business-sale signals
- trust/estate indicators
- no direct brokerage or advisory account data unless supplied
- explicit consent and referral rules

## Required Objects

- Member
- Household
- Account
- LifeEvent
- BusinessOwnership
- Goal
- WealthOpportunity
- Referral
- Advisor
- Consent
- Disclosure
- Outcome
- RevenueAttribution

## Opportunity Signals

Allowed examples:

- high deposit balance
- maturing certificate
- retirement date
- business sale
- inheritance
- home sale
- rollover request
- executive compensation
- trust account
- repeated wire or liquidity event
- member-requested planning help

Signals must not be treated as proof of need without qualification.

## Workflow

1. Ingest member relationship data.
2. resolve household.
3. identify permitted signals.
4. create opportunity candidate.
5. check consent and eligibility.
6. score relevance and urgency.
7. assign institutional owner.
8. route to licensed advisor.
9. record disclosure.
10. track appointment.
11. track outcome.
12. attribute revenue/value.
13. update household profile.
14. monitor service and retention.

## Opportunity Score

Dimensions:

- signal strength
- estimated need
- timing
- relationship depth
- consent readiness
- advisor capacity
- strategic fit
- potential value
- confidence

## Compliance Rules

- no advice from unlicensed agents
- no sensitive inference unsupported by data
- no referral without required consent
- disclosures preserved
- advisor recommendation occurs outside opportunity detection
- outcome data permissioned
- attribution rules documented

## Demo Interactions

- Show highest-priority wealth opportunities.
- Why was this household selected?
- Which signals are direct versus inferred?
- Does the institution have consent?
- Which advisor should receive the referral?
- What disclosures are required?
- What revenue could this create?
- Which opportunities have stalled?

## Outputs

- household opportunity card
- referral brief
- consent/disclosure checklist
- advisor routing
- pipeline dashboard
- outcome report
- revenue attribution
- board/executive summary

## Acceptance Tests

- Opportunity detection does not become advice.
- Consent gates are enforced.
- Direct and inferred signals remain distinct.
- Advisor licensing and capacity are checked.
- Revenue attribution links to referral outcome.
- Member data remains permissioned.
