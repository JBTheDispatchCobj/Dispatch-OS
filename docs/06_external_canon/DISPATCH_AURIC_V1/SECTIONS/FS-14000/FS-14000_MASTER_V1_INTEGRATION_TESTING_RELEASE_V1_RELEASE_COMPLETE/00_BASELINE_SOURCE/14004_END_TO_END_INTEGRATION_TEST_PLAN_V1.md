# 14004 — End-to-End Integration Test Plan V1

## Purpose

Define integration tests that prove the whole product works across data, graph, runtime, UI, security, and commercialization boundaries.

## Test Scenarios

### Scenario 1 — Institution Profile

- ingest public CU data
- resolve identity
- create profile
- populate graph
- render Terminal
- verify source lineage
- update with new period
- validate freshness

### Scenario 2 — Fintech Pilot

- ingest startup documents
- create startup profile
- match CU
- route workflow
- assign agents
- collect evidence
- enforce approvals
- generate pilot memo
- display dashboard
- record outcome

### Scenario 3 — Exam Binder

- ingest exam request
- classify requests
- retrieve evidence
- detect gaps
- create tasks
- draft responses
- approve
- lock binder
- export
- audit

### Scenario 4 — Loan Participation

- ingest package
- validate completeness
- create loan/participation objects
- match buyers
- enforce limits
- route approvals
- allocate
- settle
- monitor

### Scenario 5 — Wealth Referral

- ingest permitted member signal
- create opportunity
- enforce consent
- route advisor referral
- track outcome
- attribute value

## Integration Test Record

- test ID
- scenario
- environment
- component versions
- fixture
- steps
- expected result
- actual result
- evidence
- defect
- owner
- status

## Failure Scenarios

- connector outage
- stale data
- identity conflict
- permission denial
- prompt injection
- missing evidence
- rejected approval
- model outage
- partial report generation
- tenant-boundary attempt

## Acceptance Tests

- All primary scenarios run from clean state.
- Failure scenarios produce controlled behavior.
- Outputs are evidence-backed.
- Approval gates block correctly.
- Audit history reconstructs the test.
