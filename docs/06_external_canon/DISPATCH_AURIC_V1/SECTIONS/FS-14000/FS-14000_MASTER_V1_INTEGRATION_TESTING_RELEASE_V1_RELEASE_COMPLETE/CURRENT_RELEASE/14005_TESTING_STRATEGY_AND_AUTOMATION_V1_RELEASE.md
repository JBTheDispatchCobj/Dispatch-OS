# 14005 — Testing Strategy and Automation V1 Release Complete

## Purpose

Define automated and manual testing across schemas, services, agents, workflows, security, UI, connectors, and deployments.

## Status and Authority

This document is the V1 content-complete control specification for FS-14000. It governs release integration across FS-4000 through FS-13000 without replacing the canonical source material in those sections. Where a downstream section conflicts with a canonical registry, schema, permission, evidence, approval, or security rule, the conflict must be recorded and resolved before release; it may not be silently normalized.

## Global Control Invariants

1. Every operation is tenant-scoped, actor-attributed, permission-checked, versioned, and auditable.
2. Public, private, attested, inferred, synthetic, stale, missing, and disputed data remain distinguishable.
3. Human authority remains explicit for regulated, financial, legal, compliance, vendor, policy, and capital decisions.
4. Material claims require source lineage, freshness, confidence, and evidence references.
5. Schemas, APIs, events, workflows, agents, connectors, reports, dashboards, and releases use stable canonical IDs.
6. Breaking changes require version increments, migration instructions, compatibility tests, rollback, and approval.
7. No release may claim validation without machine-readable evidence produced by the validation process.

## Test Pyramid and Ownership

Unit and schema tests run on every change; contract and component tests run on pull requests; workflow, agent, UI, security, and integration suites run on release candidates; performance, resilience, migration, and production-readiness tests run before pilot or production promotion.

## Required Suites

- **Schema:** parse, required fields, enums, references, backward compatibility, fixture validation.
- **Contract:** auth, permissions, idempotency, pagination, errors, version negotiation, audit behavior.
- **Workflow:** state transitions, branches, evidence gates, approval gates, retries, compensation, cancellation, resume.
- **Agent:** tool allowlist, data access, evidence use, unsupported claims, structured output, escalation, model fallback, prompt injection resistance.
- **UI:** navigation, role visibility, missing/stale/inferred states, approval interactions, accessibility, export controls, performance.
- **Security:** tenant isolation, privilege escalation, secret leakage, connector revocation, injection, export restriction, audit tampering.
- **Resilience:** dependency outage, queue delay, replay, partial failure, failover, recovery-point and recovery-time behavior.

## Test Evidence Standard

Automated runs produce immutable result records with test ID, suite version, code/artifact version, environment, fixture hash, timestamps, status, evidence path, defect IDs, and approver where manual review is required.

## Release Policy

Severity 1 and 2 defects block release. Severity 3 defects require explicit risk acceptance and documented workaround. Flaky tests are failures until quarantined with an owner, reason, expiration, and compensating control.

## Required Machine-Readable Artifacts

The controls in this volume are implemented by the corresponding JSON, CSV, YAML, fixture, test, gate, template, manifest, checksum, and validation artifacts included in this release folder. Narrative text and machine-readable artifacts are mutually binding; discrepancies are release issues.

## Acceptance Criteria

- Required records are present and use canonical IDs.
- Machine-readable artifacts parse and stable headers are preserved.
- References resolve or explicitly name an external canonical dependency.
- Permissions, evidence, approvals, tenant scope, and audit behavior are explicit.
- Failure, rollback, and exception behavior are documented.
- Validation evidence is included in the release package.
