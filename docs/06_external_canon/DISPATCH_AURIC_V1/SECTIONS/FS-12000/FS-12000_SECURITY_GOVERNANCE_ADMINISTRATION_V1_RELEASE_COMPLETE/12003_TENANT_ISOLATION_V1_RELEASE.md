# 12003 — Tenant Isolation & Data Boundaries V1

## Purpose

Define hard boundaries between tenants while supporting controlled shared-network functions.

## Tenant Boundary

Every tenant-owned object must include:

- tenant ID
- visibility
- workspace
- institution scope
- owner
- classification
- retention
- sharing policy

## Isolation Requirements

- separate tenant authorization
- tenant-aware storage keys
- tenant-aware cache
- tenant-aware search
- tenant-aware graph queries
- tenant-aware logging
- tenant-aware backups
- tenant-aware runtime context
- tenant-aware connector secrets

## Shared Network Layer

May include:

- public institution data
- public executive data
- opted-in profiles
- marketplace listings
- permissioned opportunities
- benchmark aggregates
- shared documents
- approved relationship introductions

## Cross-Tenant Sharing

Requires:

- source tenant
- recipient tenant
- object/field scope
- purpose
- effective date
- expiration
- export rights
- revocation
- audit

## Data Boundary Failure Controls

- deny by default
- detect cross-tenant references
- quarantine improper edge
- suspend affected query
- alert security owner
- preserve audit
- review downstream exposure

## Acceptance Tests

- Tenant-private data cannot appear in another tenant search.
- Shared data is field-specific.
- Revocation prevents future access.
- Caches and exports respect tenant boundary.
- Cross-tenant incidents are detectable.

---

# V1 Release Completion Addendum

## Canonical Scope

This volume is the binding V1 specification for tenant boundaries, data-plane isolation, control-plane isolation, and cross-tenant prevention. It applies to every tenant, institution, environment, connector, workflow, agent, evidence object, approval object, and operator unless a stricter cartridge or contractual control applies. A local configuration may strengthen a control but may not weaken a mandatory platform control without a recorded exception, compensating controls, an accountable approver, and an expiration date.

## Required Object Model

Every governed record defined by this volume MUST include: `id`, `tenant_id`, `object_type`, `version`, `status`, `classification`, `owner_id`, `created_at`, `updated_at`, `effective_at`, `expires_at`, `source_refs`, `evidence_refs`, `approval_refs`, `control_refs`, and `audit_ref`. Unknown, stale, inferred, attested, synthetic, and verified values remain explicitly distinguishable.

## Lifecycle and Decision Rules

1. Creation begins in `draft` and does not confer authority.
2. Activation requires schema validation, owner assignment, required evidence, and approval when the action is material.
3. Any failed mandatory control blocks execution; advisory controls may warn but cannot silently pass.
4. A material permission, policy, model, connector, or configuration change creates a new immutable version.
5. Suspension immediately prevents new use while preserving history and evidence.
6. Retirement revokes active authority, rotates or destroys applicable credentials, and preserves the retention-required audit record.
7. Emergency overrides are time-bound, dual-controlled, logged, and reviewed after use.

## Permissions and Human Authority

| Action | Tenant User | Tenant Admin | Security Admin | Platform Operator | Auditor | Agent |
|---|---:|---:|---:|---:|---:|---:|
| View permitted records | Yes | Yes | Yes | Scoped | Read-only | Scoped |
| Create draft | Scoped | Yes | Yes | Scoped | No | Draft-only |
| Approve material action | No | Scoped | Scoped | No | No | No |
| Change platform control | No | No | Dual-control | Dual-control | No | No |
| Export restricted data | No | Approved | Approved | Break-glass only | Approved evidence only | No |
| Delete or retire | No | Scoped | Dual-control | Dual-control | No | No |

Agents may retrieve, classify, compare, calculate, draft, recommend, route, and assemble evidence. Agents may not independently grant access, waive policy, approve vendors, accept risk, communicate final regulatory positions, commit capital, or suppress an audit record.

## Evidence and Approval Requirements

A material decision requires: authoritative source evidence; freshness status; decision owner; risk classification; applicable control IDs; reviewer identity; approval timestamp; decision rationale; exceptions; compensating controls; and immutable audit linkage. Evidence must be content-addressed or otherwise integrity-verifiable.

## API and Event Contract

Canonical operations: `POST /v1/security/12003/records`, `GET /v1/security/12003/records/{id}`, `POST /v1/security/12003/records/{id}/submit`, `POST /v1/security/12003/records/{id}/approve`, `POST /v1/security/12003/records/{id}/suspend`, and `POST /v1/security/12003/records/{id}/retire`.

Required events: `12003.record.created`, `12003.record.submitted`, `12003.record.approved`, `12003.control.failed`, `12003.record.suspended`, `12003.exception.opened`, and `12003.record.retired`. Events include event ID, tenant, actor, object version, correlation ID, timestamp, classification, and evidence references.

## Error and Exception Behavior

- Fail closed for missing tenant, identity, permission, classification, encryption, required evidence, or required approval.
- Quarantine malformed, untrusted, or policy-violating payloads.
- Do not retry authorization failures or deterministic validation failures.
- Retry transient infrastructure failures using bounded exponential backoff and idempotency keys.
- Escalate suspected cross-tenant access, secret exposure, audit tampering, or model-policy violation as security incidents.
- Preserve the attempted action and reason for denial without storing prohibited sensitive content in logs.

## Security and Privacy Controls

Mandatory controls include least privilege, MFA for privileged roles, tenant-scoped authorization, encryption in transit and at rest, secret redaction, immutable security logging, data minimization, retention enforcement, environment separation, approved model routing, and break-glass governance. Production data may not be copied into demo or development environments.

## Acceptance Tests

- Valid records pass the published schema.
- Invalid state transitions are rejected.
- An agent cannot approve its own recommendation.
- Cross-tenant reads and writes are denied and alerted.
- Restricted fields are redacted from unauthorized users and logs.
- Approval evidence is required before material activation.
- Suspension takes effect immediately across API, UI, runtime, and connectors.
- Every successful and denied material action creates an audit event.
- Expired exceptions automatically block or revert the affected authority.
- Synthetic fixtures remain labeled synthetic in storage, UI, reports, and exports.

## Operational Runbook

1. Confirm tenant, environment, owner, classification, and authority.
2. Validate schema, dependencies, evidence, and approval requirements.
3. Execute in the least-privileged context using an idempotency key.
4. Observe control results and halt on mandatory failures.
5. Record outcome, lineage, evidence, approvals, latency, and cost.
6. Escalate security-relevant anomalies using the incident severity matrix.
7. Review exceptions, stale records, failed controls, and privileged activity on the defined cadence.

## Release Gate

This volume is release-eligible only when its schema parses, fixtures validate, permission tests pass, cross-references resolve, required controls map to owners and evidence, threat scenarios are tested, and the package integrity index matches the released files.

---

## Release-Candidate Tenant-Isolation Coverage Matrix

| Surface | Required Isolation Test | Expected Result | Evidence |
|---|---|---|---|
| Objects | Cross-tenant object ID retrieval, mutation, and enumeration | Denied without existence leakage | authorization trace and audit event |
| Fields | Field-level restricted attribute read/export | Redacted or denied per classification and role | policy decision record |
| Search | Keyword, filter, autocomplete, and saved-query cross-tenant probes | Zero unauthorized results and no facet leakage | search test output |
| Graph | Node, edge, traversal, similarity, and inference cross-tenant probes | Unauthorized nodes/edges excluded before traversal and ranking | graph authorization trace |
| Documents | File metadata, preview, download, extracted text, and derived chunk probes | Denied or redacted consistently | document access log |
| Evidence | Evidence metadata, source links, attachments, binder membership, and export probes | Denied unless evidence-class permission is present | evidence authorization record |
| Agent context | Context assembly, retrieval augmentation, tool result, memory, and execution-trace probes | No unauthorized tenant or field content enters context | context manifest and trace |
| Exports | UI, API, report, bulk, scheduled, and connector export probes | Export blocked or scoped; approval and watermark applied where required | export approval and audit record |

A release gate fails if any isolation control is enforced only in the user interface rather than at the service, query, graph, document, evidence, context-assembly, and export boundaries.
