# 9004 — Bank, Fintech & Vendor Population V1 Release Complete

## Purpose

Define the population strategy for banks, fintechs, vendors, and service providers relevant to the institutional network.

## Bank Population

Priority:

- community banks
- regional banks
- sponsor banks
- banks active in fintech partnerships
- banks active in participations
- banks relevant to CU competitive analysis
- banks sharing vendors or markets with target CUs

Minimum bank profile:

- legal identity
- FDIC certificate
- charter
- headquarters
- assets
- deposits
- loans
- branches
- regulator
- website
- executive names
- product signals
- vendor signals
- financial period

## Fintech Population

Minimum fintech profile:

- legal/display name
- founders
- headquarters
- website
- founding year
- product category
- target institution type
- use cases
- integration methods
- security evidence
- funding history where public
- customers/references where public
- partnership signals
- readiness baseline

## Vendor Population

Minimum vendor profile:

- legal/display name
- category
- products
- institution types served
- public customers
- integration methods
- security/trust-center evidence
- pricing model if public
- implementation model
- support model
- ownership/acquisition history
- replacement/competitor relationships

## Vendor-to-Institution Evidence

Evidence types:

- institution website
- vendor case study
- press release
- public procurement record
- job description
- integration documentation
- institution posting
- private tenant attestation

Public references must not be treated as current indefinitely.

## Product Taxonomy

- core
- digital banking
- lending
- mortgage
- cards
- payments
- treasury
- fraud
- BSA/AML
- cybersecurity
- compliance
- CRM
- data
- AI
- wealth
- insurance
- back office
- member/customer engagement

## Competitive Graph

Edges:

- competes with
- integrates with
- replaces
- partners with
- resells
- acquired by
- uses
- recommended for
- similar to

## Outputs

- bank universe
- fintech catalog
- vendor catalog
- product taxonomy
- vendor footprint
- competitive graph
- target institution matches
- integration compatibility map

## Acceptance Tests

- Bank identities use official identifiers.
- Fintech marketing claims remain source labeled.
- Vendor/customer references include dates.
- Product categories use canonical taxonomy.
- Competitive edges distinguish sourced versus inferred.

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
