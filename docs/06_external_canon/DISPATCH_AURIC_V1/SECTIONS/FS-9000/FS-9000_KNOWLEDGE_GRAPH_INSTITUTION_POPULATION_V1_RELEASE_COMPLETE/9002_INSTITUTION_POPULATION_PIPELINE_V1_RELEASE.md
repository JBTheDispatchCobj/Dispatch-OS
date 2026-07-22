# 9002 — Institution Population Pipeline V1 Release Complete

## Purpose

Define how Dispatch seeds, enriches, validates, and maintains institution profiles at scale.

## Population Targets

Initial:

- all U.S. credit unions
- corporate credit unions
- major CUSOs
- community and regional banks relevant to network activity
- public fintechs and vendors serving financial institutions
- regulators
- trade associations
- selected capital partners

## Population Stages

1. Institution universe creation
2. stable identifier assignment
3. public source collection
4. identity resolution
5. financial profile creation
6. geography and branch mapping
7. executive and board seeding
8. product/vendor/system enrichment
9. regulatory profile mapping
10. relationship graph creation
11. readiness baseline
12. opportunity detection
13. confidence and coverage scoring
14. human review
15. refresh scheduling

## Institution Seed Record

Minimum:

- institution ID
- legal name
- display name
- institution type
- charter/certificate ID
- headquarters
- state
- regulator
- asset size
- source period
- primary website
- profile status
- source references

## Population Status

- discovered
- seeded
- identity verified
- financial profile populated
- executive profile populated
- vendor/product enriched
- regulatory profile populated
- readiness scored
- opportunity enabled
- reviewed
- active
- stale
- archived

## Coverage Score

Dimensions:

- identity
- financial
- executive
- board
- products
- vendors
- systems
- regulatory
- strategic
- risk
- readiness
- relationships

## Confidence Rules

- official regulator identifier: high
- institution-published fact: high/medium depending on context
- reputable secondary source: medium
- inferred vendor/product relationship: low until corroborated
- private tenant attestation: high within that tenant
- public profile conflict: route to review

## Enrichment Queue

Priority factors:

- network relevance
- asset size
- strategic target status
- relationship proximity
- opportunity potential
- recent activity
- low coverage
- stale profile
- upcoming outreach or workflow

## Human Review

Required for:

- institution identity conflict
- merger/acquisition ambiguity
- executive identity conflict
- high-value target with low confidence
- vendor relationship inference
- regulator mismatch
- legal entity versus brand ambiguity

## Outputs

- institution universe
- population dashboard
- enrichment queue
- profile coverage report
- stale-profile queue
- unresolved identity queue
- active target list

## Acceptance Tests

- Every institution has a stable canonical ID.
- Official identifiers are preserved.
- Population status is visible.
- Coverage and confidence are separately scored.
- Stale profiles enter refresh workflow.
- Enrichment can prioritize targets without losing the full universe.

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
