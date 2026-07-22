# 7008 — Demo Orchestration Runtime V1

## Purpose

Define how demo scenarios are initialized, executed, reset, observed, and narrated.

## Runtime Components

- scenario loader
- fixture loader
- object registry
- workflow router
- agent harness
- evidence service
- approval service
- audit service
- dashboard service
- reset service
- presenter controls

## Scenario State

- not loaded
- loading
- ready
- active
- paused
- completed
- failed
- reset

## Demo Run Object

- run_id
- scenario
- version
- presenter
- audience
- start time
- state
- loaded fixtures
- active workflow
- agent outputs
- approvals
- errors
- audit events
- completion status

## Presenter Controls

- load scenario
- reset
- inject event
- reveal evidence
- approve/reject
- simulate elapsed time
- change persona
- switch dashboard
- replay workflow
- compare outcomes

## Deterministic Versus Live Elements

Deterministic:

- fixture data
- expected objects
- workflow steps
- required evidence
- approval gates

Variable:

- natural-language explanation
- generated memo wording
- query order
- optional scenario branches

## Failure Handling

- missing fixture
- route failure
- agent permission conflict
- evidence mismatch
- approval timeout
- dashboard error
- reset failure

## Observability

Track:

- route
- agents
- evidence accessed
- approvals
- latency
- errors
- object changes
- outputs
- audit events

## Acceptance Tests

- Scenario can load in one command.
- Scenario can reset without residual data.
- Presenter can branch outcomes.
- Every agent action is visible.
- Demo failure produces a controlled fallback.
