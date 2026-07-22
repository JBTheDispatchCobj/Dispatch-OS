# 9003 — Credit Union Universe Population V1 Release Complete

## Purpose

Define the credit-union-specific population model for all U.S. credit unions and related cooperative institutions.

## Seed Sources

Primary:

- NCUA institution data
- NCUA call reports
- NCUA merger and liquidation records
- NCUA charter and insurance identifiers
- state regulator listings
- institution websites

Secondary:

- leagues
- associations
- corporate credit unions
- CUSO directories
- public vendor references
- conference and event data

## CU Profile Minimum

- legal name
- charter number
- charter type
- insurance status
- state
- headquarters
- assets
- members
- loans
- shares/deposits
- net worth
- branches
- employees where available
- field of membership summary
- primary regulator
- website
- reporting period

## CU Financial Profile

Include:

- asset growth
- loan growth
- deposit/share growth
- net worth ratio
- ROA
- delinquency
- charge-offs
- liquidity
- loan mix
- investment mix
- member growth
- operating expense
- fee income
- commercial/business lending
- mortgage
- indirect lending
- concentration indicators

## CU Organization Profile

- CEO/president
- executive team
- board officers
- committees
- supervisory committee where applicable
- CUSO relationships
- corporate CU relationship
- league/association relationships

## CU Product Profile

- consumer lending
- mortgage
- business lending
- commercial services
- treasury
- cards
- payments
- wealth
- insurance
- investments
- participations
- digital banking
- fintech pilots

## CU Readiness Baseline

Use public evidence only for initial score.

Public baseline dimensions:

- digital maturity
- product breadth
- commercial activity
- vendor visibility
- innovation signals
- governance visibility
- financial capacity
- partnership signals

Public readiness must be labeled preliminary.

## CU Opportunity Baseline

Potential categories:

- fintech pilot
- vendor replacement
- treasury
- wealth
- insurance
- participation
- CUSO investment
- AI enablement
- regulatory evidence
- board education

## Merger and Charter Events

Track:

- surviving institution
- merged institution
- effective date
- charter changes
- asset/member transfer
- historical profile link
- executive changes
- vendor/system implications

## Outputs

- CU universe
- peer cohorts
- financial trends
- executive graph
- CUSO graph
- readiness baseline
- opportunity baseline
- merger history

## Acceptance Tests

- CU records reconcile to official identifiers.
- Call-report periods remain historical.
- Merged institutions remain accessible.
- Public readiness is not represented as verified internal readiness.
- CUSO and corporate-CU relationships are source labeled.

## Canonical V1 Contract

This volume is binding for FS-9000. Canonical objects originate in FS-5000 and FS-6000; graph representations may enrich, index, and connect those objects but may not silently redefine their identity, authority, source state, or approval status.

All material nodes and edges MUST expose provenance, confidence, freshness, visibility, tenancy, lifecycle status, and version. Public, private, attested, inferred, synthetic, and derived data remain distinguishable in storage, query responses, user interfaces, exports, and downstream agent context.

## Required Operational Behavior

1. Accept canonical object and ingestion events from FS-6000 and FS-8000.
2. Resolve stable node identity before mutation.
3. preserve source snapshots and evidence links.
4. Apply tenant, role, object, field, relationship, and purpose restrictions before traversal.
5. Prevent inferred relationships from overwriting verified facts.
6. Record conflicts, stale facts, missing attributes, and unresolved identity explicitly.
7. Emit versioned graph events for downstream Terminal, workflow, agent, and reporting services.
8. Support replay, reconciliation, rollback, quarantine, and human review.

## Data and Interface Requirements

Every implementation of this volume MUST reconcile to the machine-readable artifacts in this release package, including node and edge schemas, population manifests, query contracts, confidence rules, visibility policies, fixtures, tests, runbooks, release manifest, and integrity index.

## Failure and Exception Handling

- Unresolved identity is quarantined rather than guessed.
- Conflicting authoritative sources create a conflict record and review task.
- Missing evidence lowers confidence and blocks verified status.
- Stale relationships remain visible as stale until refreshed or superseded.
- Unauthorized traversal returns a filtered result without disclosing hidden node or edge existence.
- Population failures are retryable, idempotent, observable, and auditable.
- Derived outputs expire according to policy and are recomputed after material source changes.

## Security and Human Authority

Graph services never grant business authority. They may retrieve, rank, infer, recommend, and route; final regulatory, credit, investment, vendor, legal, compliance, and capital decisions remain with authorized humans and recorded approval objects.

## Release Acceptance Criteria

- All referenced object, relationship, source, and event identifiers resolve.
- Node and edge fixtures validate against schemas.
- Public, tenant-private, network-shared, and derived layers remain isolated.
- Query responses include matched criteria, missing criteria, confidence, evidence, freshness, and visibility metadata.
- Inference can be reproduced from recorded inputs and rule/model version.
- Population jobs are idempotent and reconciliation-safe.
- Deletion, retention, legal-hold, and suppression policies propagate to indexes and derived material.
- Validation report passes with no unresolved package references.
