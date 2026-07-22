# 6009 — Agent Permission Matrix V1 Complete

## Purpose

Define what every agent can read, analyze, draft, recommend, route, execute, and never do.

## Permission Record

- agent ID
- domain
- class
- object scope
- field scope
- allowed actions
- prohibited actions
- tools
- evidence
- confidence threshold
- approval gates
- output schema
- visibility
- escalation
- audit
- version

## Permission Levels

- P0 public read
- P1 internal read
- P2 analyze/draft
- P3 workflow action
- P4 controlled execution
- P5 human-only authority

## Universal Allowed

- summarize
- classify
- extract
- compare
- calculate
- draft
- recommend
- route
- detect gaps
- create checklist
- monitor
- prepare internal brief

## Universal Prohibited

- approve credit
- approve investment
- commit capital
- execute trade
- bind insurance
- deny claim
- file regulatory report
- send regulator response
- issue legal opinion
- issue final compliance conclusion
- waive evidence
- override policy
- approve vendor
- make final suitability decision
- send external commitment

## Matrix Example

| Agent | Domain | Allowed | Prohibited | Approval |
|---|---|---|---|---|
| Credit Memo Writer | Commercial Banking | draft memo, summarize risks | approve credit | credit authority |
| Vendor Risk Agent | Regulation | review evidence, score risk | approve vendor | vendor-risk owner |
| Pilot Plan Agent | Credit Unions | draft pilot plan | commit institution | business/security/compliance |
| Board Report Agent | Governance | draft board report | publish externally | executive/board owner |

## Evidence Rules

Each action specifies:

- minimum evidence type
- freshness
- source authority
- required attestation
- confidence
- use limitations

## Escalation Triggers

- low confidence
- conflicting authoritative sources
- requested prohibited action
- unclear authority
- privacy/security concern
- regulated communication
- stale critical evidence
- legal privilege

## Output Contract

Every output includes:

- task
- objects
- evidence
- analysis
- assumptions
- missing information
- confidence
- next action
- approval requirement
- audit reference

## Acceptance Tests

- Router can query permissions.
- Agent cannot exceed object or action scope.
- Prohibited action always blocks/escalates.
- Output includes evidence/confidence.
- Tenant can narrow permissions.
