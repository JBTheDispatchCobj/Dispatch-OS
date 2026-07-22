# 9009 — Institution Similarity & Peer Cohorts V1 Release Complete

## Purpose

Create explainable peer groups and similarity rankings for benchmarking, targeting, opportunity detection, and product matching.

## Peer Dimensions

- institution type
- charter
- asset size
- geography
- membership/customer size
- financial performance
- loan mix
- deposit mix
- product breadth
- vendor stack
- digital maturity
- commercial activity
- regulatory profile
- strategic priorities
- readiness
- relationship profile

## Cohort Types

- regulatory peer
- financial peer
- product peer
- technology peer
- strategic peer
- geographic peer
- opportunity peer
- custom user-defined cohort

## Similarity Object

- source institution
- candidate institution
- similarity type
- score
- matched features
- unmatched features
- unknown features
- weight profile
- data period
- confidence
- evidence

## Weighting

Weights must be configurable.

Example:

- asset size 10%
- geography 5%
- product mix 15%
- financial profile 15%
- vendor/system stack 15%
- strategic priorities 15%
- readiness 15%
- regulatory profile 5%
- relationship context 5%

## Unknown Data

Unknown fields:

- do not count as match
- do not count as mismatch
- reduce confidence
- may trigger enrichment

## Benchmarking

Outputs may compare:

- growth
- ROA
- efficiency
- capital
- product adoption
- vendor footprint
- readiness
- opportunities
- risk indicators

## Peer-Informed Opportunity

Example:

- peer adoption signal
- institution gap
- strategic alignment
- readiness
- value potential
- regulatory/integration burden

Peer adoption is not proof of suitability.

## Outputs

- peer cohort
- similarity ranking
- benchmark dashboard
- peer gap analysis
- enrichment targets
- opportunity suggestions

## Acceptance Tests

- Similarity is explainable.
- Unknown data reduces confidence.
- User can change weights.
- Peer comparison uses aligned periods.
- Peer behavior does not automatically create a recommendation.

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
