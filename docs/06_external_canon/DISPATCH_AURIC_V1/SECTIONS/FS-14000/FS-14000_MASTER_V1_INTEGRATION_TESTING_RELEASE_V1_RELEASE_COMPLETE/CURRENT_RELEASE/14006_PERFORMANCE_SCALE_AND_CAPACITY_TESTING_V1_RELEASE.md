# 14006 — Performance, Scale and Capacity Testing V1 Release Complete

## Purpose

Define performance and scale targets for profiles, graph queries, ingestion, workflows, agents, search, reports, and concurrent tenants.

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

## Performance Objectives

V1 targets are workload classes, not marketing claims. Every target is measured in a controlled environment and labeled by dataset size, concurrency, model route, connector type, and caching state.

| Workload | V1 Target |
|---|---|
| Terminal cached page | p95 ≤ 2.5 s |
| Standard API read | p95 ≤ 500 ms excluding external dependencies |
| Standard API write | p95 ≤ 1.0 s excluding asynchronous completion |
| Graph search over V1 fixture | p95 ≤ 3.0 s |
| Document ingestion acknowledgement | ≤ 5 s |
| Typical document processing | completion within 5 min for fixture class |
| Workflow transition | p95 ≤ 2 s excluding agent/model work |
| Approval action | p95 ≤ 1 s |
| Audit event durability | ≤ 5 s |

## Capacity Dimensions

Tenants, active users, institution profiles, executives, vendors, documents, graph nodes/edges, connector runs, workflows, agent executions, events, evidence objects, reports, and storage growth are measured independently.

## Test Profiles

Baseline, expected pilot, two-times pilot, and failure-threshold profiles must be executed. Tests cover steady state, burst, long-running workflow, bulk import, graph rebuild, concurrent approvals, model throttling, connector backlog, and recovery after outage.

## Cost Controls

Each performance result records compute, model, storage, connector, and operator cost. A faster path that materially violates unit-economics constraints is not automatically acceptable. Model routing and caching must be evaluated against correctness, evidence quality, and total cost.

## Degradation Rules

When targets cannot be met, the system must degrade visibly: queue work, show status, preserve idempotency, provide retry guidance, prevent duplicate execution, and never bypass security or approval controls.

## Required Machine-Readable Artifacts

The controls in this volume are implemented by the corresponding JSON, CSV, YAML, fixture, test, gate, template, manifest, checksum, and validation artifacts included in this release folder. Narrative text and machine-readable artifacts are mutually binding; discrepancies are release issues.

## Acceptance Criteria

- Required records are present and use canonical IDs.
- Machine-readable artifacts parse and stable headers are preserved.
- References resolve or explicitly name an external canonical dependency.
- Permissions, evidence, approvals, tenant scope, and audit behavior are explicit.
- Failure, rollback, and exception behavior are documented.
- Validation evidence is included in the release package.
