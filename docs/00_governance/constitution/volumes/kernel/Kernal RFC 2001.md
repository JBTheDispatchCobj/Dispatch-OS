\# RFC-2001  
\# Dispatch Kernel Philosophy & Architectural Boundaries

Status: Draft 1.0  
Owner: Auric Works  
Authority: Dispatch Constitution V1.0  
Applies To:  
\- Dispatch Kernel  
\- Every Cartridge  
\- Every Connector  
\- Every Terminal  
\- Every Profile  
\- Every Intelligence Object  
\- Every Future Domain

\---

\# Purpose

This document defines the permanent architectural boundary of the Dispatch Kernel.

The purpose of the Kernel is not to implement business logic.

The purpose of the Kernel is to provide a stable operating environment in which any business logic, industry, workflow, publication, profile, or AI capability can execute without changing the architecture itself.

Every future capability of Dispatch must first answer a single question:

\> Does this belong in the Kernel?

If the answer is unclear, this document governs that decision.

The Kernel is intended to remain stable over decades.

Industries evolve.

AI models evolve.

Customers evolve.

Products evolve.

The Kernel should rarely change.

\---

\# Philosophy

Dispatch is not software.

Dispatch is an operating system.

An operating system exists to coordinate resources.

Dispatch coordinates:

\- Knowledge  
\- Truth  
\- Relationships  
\- Work  
\- Memory  
\- Models  
\- People  
\- Systems  
\- Time

The Kernel owns coordination.

It does not own industries.

It does not own products.

It does not own customers.

It owns execution.

\---

\# The Dispatch Stack

Auric Works

↓

The Auric

↓

Terminal

↓

Cartridges

↓

Dispatch Kernel

↓

Infrastructure

Each layer has a single responsibility.

Auric Works operates.

The Auric attracts.

Terminal operates institutions.

Cartridges extend capability.

Dispatch coordinates.

Infrastructure stores and executes.

No layer should violate another layer's responsibilities.

\---

\# Why the Kernel Exists

Organizations continuously purchase disconnected software.

CRM

↓

ERP

↓

HR

↓

Accounting

↓

Project Management

↓

AI

↓

Email

↓

Chat

↓

Knowledge Base

↓

BI

↓

Search

↓

Documentation

↓

Automation

Each solves one problem.

None orchestrate the whole.

Dispatch exists because orchestration is missing.

\---

\# Kernel Responsibilities

The Kernel owns only responsibilities that every implementation requires.

These are permanent.

Identity

Tenancy

Permissions

Objects

Relationships

Events

Truth

Audit

Workflow

Memory

Registry

Cost

Routing

Execution

Everything else belongs elsewhere.

\---

\# Kernel Non-Responsibilities

The Kernel never contains:

Hospitality logic

Credit union logic

Mortgage logic

Healthcare logic

Manufacturing logic

Editorial tone

Publication formatting

Investment policies

Regulatory interpretation

Customer-specific workflows

Vendor-specific integrations

Industry-specific calculations

Board reporting templates

Prompt wording

Marketing

Sales

UI

All of these belong to cartridges.

\---

\# Architectural Rule One

Everything significant is an Object.

The Kernel does not know hotels.

It knows Objects.

The Kernel does not know startups.

It knows Objects.

The Kernel does not know credit unions.

It knows Objects.

Objects gain meaning from cartridges.

\---

\# Architectural Rule Two

Everything meaningful emits Events.

Objects never silently change.

Every material transition becomes an immutable Event.

Examples

Profile Updated

Relationship Created

Observation Imported

Claim Verified

Workflow Approved

Recommendation Accepted

Publication Released

Model Executed

Connector Failed

Events are history.

Objects are current state.

\---

\# Architectural Rule Three

Truth precedes Intelligence.

Dispatch must never manufacture intelligence before establishing truth.

Pipeline

Observation

↓

Claim

↓

Verification

↓

Truth

↓

Inference

↓

Recommendation

↓

Intelligence Object

↓

Publication

If truth is weak,

confidence must be weak.

\---

\# Architectural Rule Four

Relationships are first-class.

Traditional software stores relationships as foreign keys.

Dispatch stores relationships as living operational entities.

Relationships have:

Identity

Lifecycle

Confidence

Evidence

History

Participants

Permissions

Activity

Recommendations

Outcomes

Relationships generate intelligence.

\---

\# Architectural Rule Five

Profiles are Living Systems.

A profile is not a record.

A profile is continuously assembled from:

Objects

Relationships

Truth

Memory

Activity

Goals

Permissions

Cartridges

Recommendations

A profile never finishes.

It evolves forever.

\---

\# Architectural Rule Six

Knowledge Compounds.

Every interaction should improve Dispatch.

Corrections

Uploads

Approvals

Rejections

Discussions

Pilots

Investments

Integrations

Meetings

All become future context.

Nothing useful is discarded.

\---

\# Architectural Rule Seven

The Kernel never knows AI vendors.

It knows capabilities.

Extraction

Classification

Summarization

Planning

Reasoning

Translation

Comparison

Generation

Evaluation

Different models perform capabilities.

Capabilities belong to Dispatch.

Models are replaceable implementations.

\---

\# Architectural Rule Eight

The cheapest sufficient intelligence always wins.

Execution order:

Deterministic Rules

↓

SQL

↓

Connector Logic

↓

Small Open Model

↓

Large Open Model

↓

Frontier Model

↓

Human Expert

Never spend $1.00 solving a $0.01 problem.

The Kernel owns routing.

Cartridges request capability.

The Harness selects implementation.

\---

\# Architectural Rule Nine

The Kernel never stores opinions as truth.

Every statement carries provenance.

Every inference carries confidence.

Every recommendation carries assumptions.

Every publication references underlying Intelligence Objects.

Every Intelligence Object references supporting claims.

Every claim references observations.

Every observation references sources.

Truth is traceable.

\---

\# Architectural Rule Ten

Configuration exceeds code.

Whenever possible,

behavior should be expressed through:

Registries

Schemas

Rules

Policies

Prompts

Thresholds

Workflows

Permissions

Mappings

rather than compiled logic.

Compiled logic should exist only when absolutely necessary.

\---

\# Kernel Invariants

The following invariants may never be violated.

No object exists without identity.

No truth exists without provenance.

No workflow executes without audit.

No model executes without routing.

No recommendation exists without supporting claims.

No publication exists without Intelligence Objects.

No cartridge bypasses permissions.

No connector bypasses truth.

No UI bypasses the Kernel.

No model becomes the system of record.

\---

\# Kernel Boundary

The Kernel is intentionally small.

Every feature proposed for Dispatch must pass the Kernel Boundary Test.

A capability belongs in the Kernel only if all of the following are true:

1\. Every domain requires it.  
2\. It has no business-specific assumptions.  
3\. It has no editorial assumptions.  
4\. It has no UI assumptions.  
5\. It must remain stable across industries.  
6\. It cannot reasonably be implemented as a cartridge.  
7\. It cannot reasonably be implemented through configuration.

If any answer is "No", the capability belongs outside the Kernel.

\---

\# Kernel Services

The Kernel consists of a finite set of permanent services.

\#\# Identity Service

Purpose

Maintain globally unique identities for every object.

Responsibilities

\- Object identity  
\- Person identity  
\- Organization identity  
\- Workspace identity  
\- Tenant identity  
\- Version identity

Non-Responsibilities

\- Authentication providers  
\- User interface  
\- HR systems  
\- CRM ownership

\---

\#\# Tenancy Service

Purpose

Separate ownership boundaries.

Dispatch supports multiple simultaneous realities.

Examples

Global Market Graph

↓

Institution

↓

Department

↓

Individual

↓

Temporary Workspace

↓

Partner Workspace

Each tenant owns its own memory while selectively participating in shared knowledge.

\---

\#\# Permission Service

Purpose

Determine visibility.

Permissions exist independently from UI.

Every request evaluates

Actor

↓

Role

↓

Tenant

↓

Object

↓

Requested Action

↓

Policy

↓

Decision

Policies must be deterministic.

Models never decide authorization.

\---

\#\# Registry Service

Purpose

Provide the permanent catalog of Dispatch.

Registries include

Object Registry

Connector Registry

Cartridge Registry

Prompt Registry

Workflow Registry

Model Registry

Policy Registry

Metric Registry

No subsystem should hardcode registry knowledge.

\---

\#\# Object Service

Purpose

Manage canonical objects.

Responsibilities

Creation

Versioning

Identity

Relationships

Lifecycle

Deletion policy

Retention

Merge

Deduplication

Every object enters Dispatch through this service.

\---

\#\# Event Service

Purpose

Record immutable history.

Every meaningful change produces an Event.

Events are append-only.

Objects represent current state.

Events represent history.

Event replay should recreate system state.

\---

\#\# Workflow Service

Purpose

Coordinate execution.

A workflow contains

Trigger

↓

Preconditions

↓

State Machine

↓

Actions

↓

Evidence

↓

Approvals

↓

Outcome

↓

Metrics

Workflow execution must survive restarts.

\---

\#\# Truth Service

Purpose

Manage certainty.

Truth Service owns

Observations

Claims

Facts

Conflicts

Confidence

Verification

Inference registration

The Truth Service never publishes.

It only establishes reality.

\---

\#\# Relationship Service

Purpose

Manage living relationships.

Relationships are objects.

Relationships own

History

Participants

State

Confidence

Evidence

Permissions

Next Actions

Recommendations

Relationships outlive transactions.

\---

\#\# Memory Service

Purpose

Preserve useful context.

Memory types

Public Memory

Institution Memory

Personal Memory

Workflow Memory

Editorial Memory

Relationship Memory

Operational Memory

Memory must remain inspectable.

Models never own memory.

\---

\#\# Audit Service

Purpose

Explain everything.

Every meaningful action records

Who

What

When

Where

Why

How

Inputs

Outputs

Models

Rules

Cost

Latency

Approval

Audit is permanent.

\---

\#\# Cost Service

Purpose

Measure execution.

Every action produces

CPU

Model Cost

API Cost

Storage

Connector Cost

Human Cost

Total Cost

Cost belongs to operations,

not billing.

Billing derives from cost.

\---

\#\# Routing Service

Purpose

Choose execution.

Inputs

Task

↓

Complexity

↓

Risk

↓

Privacy

↓

Latency

↓

Budget

↓

Confidence

↓

Execution Path

The Routing Service selects capability.

It never performs capability.

\---

\# Kernel Dependency Rules

Allowed

Cartridge

↓

Kernel

Allowed

Terminal

↓

Kernel

Allowed

Auric

↓

Kernel

Allowed

Connector

↓

Kernel

Forbidden

Kernel

↓

Cartridge

Forbidden

Kernel

↓

Terminal

Forbidden

Kernel

↓

Auric

Forbidden

Kernel

↓

Specific Industry

Dependency direction is one-way.

\---

\# Service Communication

Kernel services communicate only through

Objects

Events

Contracts

Never through UI state.

Never through prompts.

Never through hidden globals.

Every service publishes a contract.

\---

\# Canonical Request Flow

External Source

↓

Connector

↓

Observation

↓

Truth Service

↓

Object Update

↓

Relationship Update

↓

Event

↓

Workflow

↓

Harness

↓

Intelligence Object

↓

Publication

↓

Terminal

↓

Outcome

↓

Event

↓

Graph Improvement

Every path eventually returns to the graph.

\---

\# Kernel Storage Philosophy

Structured Truth

↓

PostgreSQL

Large Documents

↓

Object Storage

Search

↓

Embeddings

Relationships

↓

Graph Tables

Analytics

↓

Materialized Views

Logs

↓

Append-only Events

The Kernel does not store duplicate truth.

Everything references canonical objects.

\---

\# API Philosophy

The Kernel exposes capabilities.

Never products.

Examples

CreateObject()

CreateObservation()

VerifyClaim()

EmitEvent()

OpenWorkflow()

RecordOutcome()

RouteTask()

StoreMemory()

RegisterConnector()

RegisterCartridge()

Every API returns structured objects.

Never formatted UI.

Never HTML.

Never presentation.

Presentation belongs elsewhere.

\---

\# Kernel Stability Rule

The Kernel should change slower than every other subsystem.

Expected frequency

Kernel

Rare

Truth

Occasional

Registry

Regular

Cartridge

Frequent

Publication

Daily

UI

Constant

The deeper the layer,

the slower it evolves.

\---

\# Design Review Checklist

Before adding anything to the Kernel ask:

Is this universal?

Can configuration solve this?

Can a cartridge solve this?

Can a registry solve this?

Can an object solve this?

Can a workflow solve this?

Does this violate the Constitution?

Will another industry need it?

Will removing AI still make sense?

If uncertainty exists,

keep it out of the Kernel until proven otherwise.

\---  
\---

\# Kernel Contracts

Every Kernel Service must expose a formal contract.

Contracts exist to make services replaceable, testable, and independently evolvable.

Every contract shall define:

\- Purpose  
\- Inputs  
\- Outputs  
\- Events Produced  
\- Events Consumed  
\- Failure Modes  
\- Retry Behavior  
\- Authorization Requirements  
\- Audit Requirements  
\- Cost Recording  
\- Version History

Contracts are implementation-independent.

A REST API, gRPC service, internal library, or event consumer are all valid implementations of the same contract.

The contract is the permanent artifact.

\---

\# Object Lifecycle

Every object follows a predictable lifecycle.

\`\`\`text  
Discovered  
        ↓  
Created  
        ↓  
Validated  
        ↓  
Active  
        ↓  
Extended  
        ↓  
Superseded  
        ↓  
Archived  
\`\`\`

Objects are never physically deleted unless legally required.

Historical references must remain valid.

Identity survives revisions.

\---

\# Relationship Lifecycle

Relationships evolve independently of objects.

\`\`\`text  
Observed

↓

Potential

↓

Validated

↓

Active

↓

Dormant

↓

Closed

↓

Historical  
\`\`\`

Relationship history is immutable.

Relationship recommendations derive from state transitions.

\---

\# Claim Lifecycle

\`\`\`text  
Observed

↓

Parsed

↓

Claim Created

↓

Verified

↓

Fact

↓

Superseded

↓

Archived  
\`\`\`

Claims never become facts automatically.

Verification is explicit.

\---

\# Workflow Lifecycle

\`\`\`text  
Draft

↓

Ready

↓

Executing

↓

Waiting

↓

Blocked

↓

Approved

↓

Completed

↓

Archived  
\`\`\`

Every transition emits an Event.

\---

\# Event Lifecycle

\`\`\`text  
Generated

↓

Recorded

↓

Distributed

↓

Consumed

↓

Archived  
\`\`\`

Events never change.

Consumers maintain state.

\---

\# Kernel Data Ownership

The Kernel owns:

Identity

Objects

Relationships

Claims

Events

Workflows

Audit

Registries

Permissions

Usage

Cost

Memory Metadata

The Kernel references:

Documents

Embeddings

Media

External APIs

Large language models

The Kernel does not own rendered content.

\---

\# Kernel Extension Model

Nothing extends the Kernel directly.

Everything extends through contracts.

\`\`\`text  
Kernel

↓

Contract

↓

Registry

↓

Cartridge

↓

Implementation  
\`\`\`

This guarantees stability.

\---

\# Repository Placement

\`\`\`text  
kernel/

identity/

tenancy/

objects/

relationships/

truth/

events/

workflow/

audit/

permissions/

registries/

routing/

cost/

memory/

contracts/

types/

migrations/

tests/  
\`\`\`

Every Kernel directory must contain:

README

Interfaces

Implementation

Tests

Fixtures

ADR References

\---

\# Required Database Domains

The Kernel database is organized into bounded contexts.

Identity

Objects

Relationships

Truth

Workflow

Events

Audit

Registries

Usage

Permissions

Memory

Every context owns its tables.

Cross-context access occurs through contracts.

\---

\# Error Philosophy

Errors are first-class.

Every failure records:

Failure Type

Origin

Correlation ID

Object IDs

Workflow ID

Connector ID

Model ID

Retry Policy

Operator Visibility

Suggested Recovery

Failures are observable.

Never swallowed.

\---

\# Logging Philosophy

Logs are operational.

Audit is historical.

Metrics are analytical.

These are different systems.

Do not combine them.

\---

\# Performance Philosophy

Optimize in this order.

Correctness

↓

Auditability

↓

Determinism

↓

Latency

↓

Cost

↓

Scale

Incorrect fast software is failure.

\---

\# Security Philosophy

Every request evaluates:

Identity

↓

Authentication

↓

Authorization

↓

Tenant

↓

Object Visibility

↓

Action

↓

Policy

↓

Execution

Security is enforced before business logic.

Never afterward.

\---

\# Migration Philosophy

Schema changes require migrations.

Behavior changes require ADRs.

Breaking contracts require versioning.

No direct production mutation.

\---

\# Testing Philosophy

Every Kernel subsystem must have:

Unit Tests

Integration Tests

Migration Tests

Permission Tests

Replay Tests

Failure Tests

Performance Tests

Regression Tests

Evaluation Fixtures

Kernel correctness is measurable.

\---

\# Required Engineering Artifacts

Every Kernel feature requires:

Architecture Decision Record

Migration

Typed Interfaces

Tests

Documentation

Acceptance Criteria

Observability

Rollback Strategy

No exceptions.

\---

\# Acceptance Criteria

RFC-2001 is successfully implemented when:

\- Kernel boundaries are explicitly enforced.  
\- Domain logic exists only in cartridges.  
\- Every service publishes contracts.  
\- Object identity is immutable.  
\- Events are append-only.  
\- Workflows are durable.  
\- Truth is traceable.  
\- Relationships are first-class.  
\- Routing is model-agnostic.  
\- Audit is complete.  
\- Cost is measurable.  
\- Permissions are deterministic.  
\- Public and private graphs remain isolated.  
\- The UI depends on the Kernel and never the reverse.

\---

\# Architectural Decision Rules

Future architectural decisions should be evaluated against this RFC.

Questions:

1\. Does this belong in the Kernel?  
2\. Can configuration solve it?  
3\. Can a cartridge solve it?  
4\. Can a registry solve it?  
5\. Does it preserve constitutional invariants?  
6\. Does it improve operational capacity?  
7\. Can another domain reuse it?  
8\. Is it model-independent?  
9\. Is it auditable?  
10\. Is it reversible?

If any answer is "no," reconsider the design.

\---

\# Closing Statement

The Dispatch Kernel exists to provide a permanent, stable execution environment for intelligence.

It does not own industries.

It does not own interfaces.

It does not own products.

It owns identity, truth, relationships, execution, memory, and orchestration.

Everything else is built on top of it.

The quality of Dispatch is determined not by how many features it contains, but by how little the Kernel must change as those features evolve.

A successful implementation of Dispatch is one in which entirely new industries, products, cartridges, publications, and AI models can be introduced without requiring fundamental changes to the Kernel itself.

\---

\# End of RFC-2001  
