# Institutional Kernel Implementation Runbook

## Build Order

1. Deploy canonical schemas.
2. Load object, relationship, evidence, approval, workflow, agent, KPI, and dashboard registries.
3. Create transactional object storage.
4. Create provenance and audit storage.
5. Implement institution and executive services.
6. Implement vendor/product, regulatory/system, risk/priority services.
7. Implement evidence, approval, and audit services.
8. Implement readiness and opportunity services.
9. Implement workflow router.
10. Publish events to graph, runtime, and Terminal.
11. Load synthetic fixture.
12. Execute acceptance suite.

## Required Service Owners

- product owner
- schema/data owner
- runtime owner
- security owner
- compliance owner
- graph owner
- UI owner
- test owner

## Deployment Preconditions

- tenant ID and environment configured
- schema registry reachable
- audit service active
- permission service active
- event bus active
- secrets and service identities configured
- monitoring and alerts active

## Smoke Test

- create institution
- create executive
- attach official identifier
- add evidence
- calculate readiness
- create opportunity
- route fintech pilot request
- request approval
- record audit event
- query Terminal context

## Failure Runbooks

### Schema Failure

- quarantine payload
- preserve source
- record validation errors
- notify data owner
- correct mapping or source
- replay idempotently

### Authority Failure

- block decision
- identify missing/expired authority
- route escalation
- preserve requested action
- resume after valid approval

### Evidence Conflict

- preserve both sources
- mark conflict
- lower confidence
- assign reviewer
- prevent regulated final output until resolved

### Router Ambiguity

- preserve candidate routes
- identify missing discriminator
- request narrow human input
- do not launch material workflow

### Opportunity False Positive

- reject with reason
- preserve signals and score
- update rule/evaluation set
- do not delete audit history

## Operational Metrics

- institution coverage
- stale profiles
- unresolved identities
- route confidence
- evidence completeness
- approval cycle time
- opportunity qualification rate
- agent permission violations
- audit completeness
- schema error rate
