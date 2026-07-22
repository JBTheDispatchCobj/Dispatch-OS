# 7014 — Demo Acceptance Testing & QA V1

## Purpose

Define the quality gate for every demo scenario, fixture pack, workflow, dashboard, and generated output.

## Test Layers

1. Fixture integrity
2. Object creation
3. Relationship graph
4. Routing
5. Agent permissions
6. Evidence
7. Approvals
8. Dashboards
9. Outputs
10. Reset/replay
11. Security
12. Narrative

## Fixture Tests

- required files present
- IDs unique
- totals reconcile
- dates coherent
- synthetic labels visible
- expected errors documented
- no private data

## Object Tests

- canonical IDs
- required fields
- source metadata
- confidence
- relationships
- audit creation

## Routing Tests

- correct primary domain
- supporting domains
- workflow
- agents
- evidence
- approvals
- output
- missing-input behavior

## Permission Tests

- allowed actions succeed
- prohibited actions block
- escalation occurs
- human approval required
- role visibility works

## Evidence Tests

- source preserved
- versions tracked
- stale evidence flagged
- claims link to evidence
- board/exam lock works

## Dashboard Tests

- KPI source drill-through
- stale/missing labels
- filter behavior
- role visibility
- export
- board mode
- responsive layout

## Output Tests

- memo content grounded
- no fabricated facts
- assumptions visible
- confidence visible
- approval status visible
- audit trail complete

## Performance Targets

Initial baseline:

- scenario load under 60 seconds
- standard route under 10 seconds
- dashboard load under 5 seconds
- reset under 60 seconds

These targets are implementation goals, not guaranteed product claims.

## Defect Severity

- critical: security, privacy, approval bypass
- high: wrong route, fabricated evidence, incorrect totals
- medium: missing field, stale dashboard, incomplete output
- low: formatting, wording, visual polish

## Release Gate

A demo cannot be released with:

- critical defects
- unresolved high defects
- missing audit trail
- broken reset
- private data
- untested approval gates

## Acceptance Tests

- Every scenario has automated and manual tests.
- Expected outputs are versioned.
- Defects map to owner and release decision.
- Demo can be reproduced from clean state.
