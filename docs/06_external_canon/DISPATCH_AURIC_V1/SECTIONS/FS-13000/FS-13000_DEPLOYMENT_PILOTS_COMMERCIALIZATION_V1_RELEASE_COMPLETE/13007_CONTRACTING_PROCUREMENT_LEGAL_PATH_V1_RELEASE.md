# 13007 — Contracting, Procurement & Legal Path V1

## Purpose

Define the contracting and procurement path for institutions, vendors, fintechs, partners, and pilots.

## Contract Types

- NDA
- pilot agreement
- SaaS agreement
- managed-services agreement
- data-processing agreement
- business-associate agreement if applicable
- connector/data access authorization
- partnership agreement
- referral agreement
- marketplace terms
- professional-services SOW
- support/SLA
- security addendum

## Procurement Package

- executive summary
- product description
- scope
- architecture
- data flow
- security questionnaire
- vendor-risk package
- insurance
- business continuity
- privacy
- AI/model governance
- pricing
- implementation plan
- support
- references
- legal terms

## Contract Review Topics

- data ownership
- data use
- model training
- confidentiality
- security
- subcontractors
- audit rights
- regulatory access
- service levels
- liability
- indemnity
- insurance
- IP
- termination
- data return/destruction
- change control
- governing law

## Pilot Contracting

Pilot agreement must define:

- scope
- users
- data
- workflow
- duration
- fees
- success metrics
- support
- approvals
- external actions
- exit
- conversion option
- ownership of outputs

## Procurement Status

- discovery
- NDA
- security review
- vendor risk
- legal review
- pricing approval
- business approval
- signature
- onboarding
- complete
- rejected
- paused

## Acceptance Tests

- Procurement requirements are visible.
- Data and AI terms are explicit.
- Pilot scope appears in contract.
- Security and vendor-risk evidence is reusable.
- Termination and data return are defined.
---

# V1 Release Completion Addendum

## Canonical Scope

This volume is the binding V1 specification for **Contracting, Procurement & Legal Path V1**. It governs internal Auric operators, customers, implementation partners, automated services, and agents. Local statements of work and cartridge configurations may narrow scope or strengthen controls but may not bypass tenant isolation, evidence requirements, human decision authority, pricing approval, security review, or immutable audit history.

## Canonical Object and Field Dictionary

The primary object is `procurement_matter`. Every record MUST include `id`, `tenant_id`, `object_type`, `version`, `status`, `classification`, `owner_id`, `created_at`, `updated_at`, `effective_at`, `expires_at`, `source_refs`, `evidence_refs`, `approval_refs`, `control_refs`, `audit_ref`, `correlation_id`, and `idempotency_key`. Required domain fields are defined in `procurement_matter.schema.json`. Monetary fields MUST identify currency and basis; percentages MUST identify denominator and period; dates MUST use ISO 8601; unknown, stale, inferred, attested, synthetic, and verified values MUST remain distinguishable.

| Field group | Requirement |
|---|---|
| Identity | stable ID, tenant, object type, version |
| Ownership | accountable business owner and operational assignee |
| Scope | included users, workflows, data, environments, exclusions |
| Economics | price, cost, margin, budget, usage basis where applicable |
| Governance | classification, controls, approvals, exceptions |
| Evidence | source, freshness, confidence, integrity and reviewer |
| Operations | status, SLA/milestone, dependencies, next action |
| Audit | actor, timestamp, correlation, prior version and reason |

## Lifecycle and State Model

Canonical states: **intake, diligence, security_review, legal_review, negotiation, approval, signature, active, expired**.

1. Creation begins in `intake` and confers no execution or commercial authority.
2. Transition requires schema validation, owner assignment, required evidence, and any approval specified by the approval matrix.
3. A material scope, price, data, permission, environment, model, legal, partner, or delivery-capacity change creates a new immutable version.
4. Invalid transitions, missing mandatory evidence, expired approval, or unresolved security blockers fail closed.
5. Suspension blocks new execution while preserving the full record, customer obligations, evidence, and audit history.
6. Completion or retirement requires reconciliation of obligations, access, credentials, billing, data disposition, open cases, and known issues.

## Decision Rules

| Decision | Minimum rule | Required approver |
|---|---|---|
| Advance lifecycle state | Required fields and evidence complete | Object owner |
| Introduce restricted data or production write | Security, data-owner and tenant approval | Security + tenant authority |
| Change price, margin or commercial term | Cost model and exception rationale | Deal desk / finance authority |
| Commit launch or delivery date | Capacity and dependency check passes | Delivery owner |
| Accept material risk or exception | Time-bound exception and compensating controls | Named human risk owner |
| External publication, send or binding action | Final human review | Authorized human approver |
| Agent recommendation | Source-grounded and confidence-labeled | No autonomous approval |

## Permissions and Human Authority

| Action | Tenant User | Tenant Admin | Auric Operator | Commercial Owner | Security/Legal | Auditor | Agent |
|---|---:|---:|---:|---:|---:|---:|---:|
| View permitted record | Yes | Yes | Scoped | Scoped | Scoped | Read-only | Scoped |
| Create or update draft | Scoped | Yes | Yes | Yes | Scoped | No | Draft-only |
| Change tenant scope | No | Approved | Scoped | No | Review | No | No |
| Approve material decision | No | Scoped | No | Scoped | Scoped | No | No |
| Bind customer or Auric | No | No | No | Authorized only | Review | No | No |
| Export restricted evidence | No | Approved | Break-glass/scoped | No | Approved | Approved subset | No |
| Suspend or retire | No | Scoped | Scoped | Scoped | Security override | No | No |

Agents may retrieve, classify, calculate, compare, draft, recommend, route, monitor, and assemble evidence. Agents may not execute contracts, approve pricing exceptions, accept risk, make final compliance or legal determinations, activate production writes, publish externally, commit capital, or suppress audit records.

## Evidence and Approval Requirements

Minimum evidence includes: NDA, security questionnaire, DPA, insurance evidence, contract redlines, approval record, executed agreement. Evidence MUST identify source, date, owner, classification, freshness, confidence, transformation history, reviewer, approval state, and integrity reference. Material decisions require a recorded rationale, alternatives considered, exceptions, compensating controls, and expiration or review date.

## API Contract

- `POST /v1/commercial/13007/procurement_matters`
- `GET /v1/commercial/13007/procurement_matters/{id}`
- `PATCH /v1/commercial/13007/procurement_matters/{id}`
- `POST /v1/commercial/13007/procurement_matters/{id}/submit`
- `POST /v1/commercial/13007/procurement_matters/{id}/approve`
- `POST /v1/commercial/13007/procurement_matters/{id}/suspend`
- `POST /v1/commercial/13007/procurement_matters/{id}/retire`

All writes require tenant scope, actor identity, expected version, idempotency key, reason, and correlation ID. Responses return validation results, effective status, unresolved blockers, required next approvals, and audit reference.

## Event Contract

Required events: `procurement.started`, `security.review_completed`, `legal.redline_received`, `contract.approved`, and `contract.executed`. Event envelopes include `event_id`, `event_type`, `tenant_id`, `object_id`, `object_version`, `actor`, `occurred_at`, `correlation_id`, `classification`, `evidence_refs`, and `payload_hash`.

## Error and Exception Behavior

- Fail closed for missing tenant, identity, permission, evidence, approval, classification, or required commercial/security review.
- Reject stale-version writes with `409 VERSION_CONFLICT`.
- Quarantine malformed imports or untrusted attachments.
- Do not retry deterministic validation, authorization, pricing-policy, or legal-policy failures.
- Retry transient infrastructure failures with bounded exponential backoff and idempotency.
- Escalate cross-tenant access, secret exposure, unauthorized external action, misleading publication, unapproved price exception, or unsupported regulated claim.
- Preserve denied attempts and reasons without storing prohibited sensitive content in logs.

## Security, Privacy, Legal and Financial Controls

Mandatory controls include least privilege, tenant isolation, encryption, secret redaction, approved model routing, data minimization, retention enforcement, consent and disclosure controls, conflict checks, contract authority, pricing authority, sanctioned transaction-compensation review, and immutable audit logging. Production data may not be used in demo, marketing, training, or partner certification without explicit documented authorization.

## Synthetic Fixture and Sample Output

The package contains `FIXTURE_PROCUREMENT_MATTER.json`, labeled synthetic. The expected user-facing output presents: current state, accountable owner, scope, evidence status, approval status, blockers, economics where applicable, next action, deadline, confidence, and audit reference. Missing or stale information remains visible rather than inferred as complete.

## Acceptance Tests

- Valid fixture passes `procurement_matter.schema.json`.
- Required evidence and approvals block advancement when absent.
- Invalid state transitions are rejected.
- An agent cannot approve its own recommendation or perform a binding action.
- Cross-tenant reads and writes are denied and alerted.
- Restricted fields are redacted in UI, exports, prompts, and logs.
- Material changes create a new immutable version.
- External sends, production writes, price exceptions, and contractual commitments require authorized human approval.
- Every successful and denied material action creates an audit event.
- Suspension propagates to UI, API, runtime, connectors, partner access, and scheduled work.
- Synthetic data remains labeled synthetic in every surface.

## Operational Runbook

1. Confirm tenant, environment, owner, authority, scope, and classification.
2. Validate schema, dependencies, source evidence, economics, delivery capacity, security, and legal constraints.
3. Obtain required human approvals and record expiration/review dates.
4. Execute using least privilege and an idempotency key.
5. Observe events, SLAs, cost, adoption, quality, and exceptions.
6. Reconcile outputs to source evidence and customer commitments.
7. Escalate incidents, blockers, margin erosion, unsupported claims, and scope drift.
8. Close with outcome, lessons, data disposition, access review, and immutable audit linkage.

## Release Gate

This volume is release-eligible only when its schema parses, fixture validates, permission and lifecycle tests pass, required controls have owners and evidence, API/event references reconcile, operational and threat scenarios are tested, and the integrity index matches the released package.
