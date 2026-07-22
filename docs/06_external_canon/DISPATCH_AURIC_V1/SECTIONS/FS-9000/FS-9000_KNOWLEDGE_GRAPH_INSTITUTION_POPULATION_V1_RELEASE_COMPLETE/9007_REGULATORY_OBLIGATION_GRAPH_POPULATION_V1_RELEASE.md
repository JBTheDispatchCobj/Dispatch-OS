# 9007 — Regulatory & Obligation Graph Population V1 Release Complete

## Purpose

Populate the graph connecting institutions, regulators, rules, obligations, policies, controls, evidence, filings, examinations, findings, and remediation.

## Node Classes

- Regulator
- Jurisdiction
- Rule
- Guidance
- Obligation
- Institution
- Product
- Activity
- Policy
- Procedure
- Control
- Evidence
- Filing
- Examination
- Finding
- RemediationPlan
- Owner

## Applicability Flow

Institution attributes  
→ regulated activity  
→ jurisdiction  
→ rule/guidance  
→ obligation  
→ policy/control  
→ evidence/reporting

## Source Hierarchy

1. official law/regulation
2. official agency guidance
3. official examination manual
4. official enforcement or supervisory publication
5. state regulator source
6. authoritative standards
7. secondary interpretation

Secondary interpretation does not replace primary authority.

## Obligation Object Population

Required:

- obligation ID
- source rule
- jurisdiction
- affected institution/activity
- requirement summary
- effective date
- reporting frequency
- owner
- related controls
- evidence expectations
- confidence
- last reviewed

## Regulatory Change

Track:

- publication
- proposal/final status
- effective date
- affected entities
- impacted policies
- impacted products
- impacted systems
- required workflows
- implementation status

## Exam and Finding Population

Private tenant layer:

- exam
- requests
- responses
- findings
- severity
- owner
- remediation
- evidence
- status
- closure approval

## Outputs

- applicability graph
- obligation inventory
- policy/control map
- filing calendar
- exam evidence map
- regulatory change impact
- remediation graph

## Acceptance Tests

- Obligations link to primary authority.
- Applicability is explainable.
- Policy/control mappings preserve source.
- Regulatory changes identify impacted objects.
- Private exam data remains tenant scoped.

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
