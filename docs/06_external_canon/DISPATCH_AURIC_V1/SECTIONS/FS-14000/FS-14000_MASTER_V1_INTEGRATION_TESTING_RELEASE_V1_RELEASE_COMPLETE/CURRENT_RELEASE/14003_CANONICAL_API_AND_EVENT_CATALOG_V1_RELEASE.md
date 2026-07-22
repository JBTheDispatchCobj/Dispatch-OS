# 14003 — Canonical API and Event Catalog V1 Release Complete

## Purpose

Define the master catalog of service APIs, events, schemas, and compatibility expectations.

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

## Contract Governance

The canonical catalog covers internal and external APIs, domain events, administrative events, audit events, connector events, and release events. Every contract is versioned, tenant-aware, authorization-aware, observable, and linked to request/response or payload schemas.

## API Requirements

Each API record defines: contract ID, owning service, operation, method, path, version, request schema, response schema, permission, tenant behavior, idempotency semantics, pagination, filtering, error model, audit event, SLO, data classification, rate limit, deprecation status, and tests.

## Event Requirements

Each event record defines: event type, version, producer, consumers, subject ID, correlation and causation IDs, payload schema, classification, ordering key, delivery guarantee, idempotency key, retention, replay policy, dead-letter behavior, owner, and tests.

## Compatibility Rules

- Additive optional fields are backward compatible.
- Removing or changing required fields is breaking.
- Enum expansion requires tolerant consumers or a new version.
- Meaning changes are breaking even when the schema shape is unchanged.
- Producers must publish one supported version per event emission.
- Consumers must declare accepted versions and reject unsupported versions visibly.
- Deprecated contracts require a replacement, migration date, owner, and removal gate.

## Standard Error Envelope

`error_id`, `code`, `message`, `safe_detail`, `correlation_id`, `retryable`, `field_errors`, `authorization_state`, `evidence_refs`, `next_action`, and `timestamp`.

## Minimum Canonical Contract Set

The package includes representative V1 contracts for institution profiles, ingestion jobs, graph search, workflows, approvals, evidence, reports, and release decisions. Claude Code should expand implementation bindings from these definitions rather than inventing new surface semantics.

## Required Machine-Readable Artifacts

The controls in this volume are implemented by the corresponding JSON, CSV, YAML, fixture, test, gate, template, manifest, checksum, and validation artifacts included in this release folder. Narrative text and machine-readable artifacts are mutually binding; discrepancies are release issues.

## Acceptance Criteria

- Required records are present and use canonical IDs.
- Machine-readable artifacts parse and stable headers are preserved.
- References resolve or explicitly name an external canonical dependency.
- Permissions, evidence, approvals, tenant scope, and audit behavior are explicit.
- Failure, rollback, and exception behavior are documented.
- Validation evidence is included in the release package.
