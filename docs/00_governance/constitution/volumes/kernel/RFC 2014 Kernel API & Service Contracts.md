\# RFC-2014  
\# Kernel API & Service Contracts

Status: Draft 1.0

Owner

Auric Works

Authority

\- Dispatch Constitution  
\- RFC-2001 through RFC-2013

Applies To

Every API, internal service, connector, cartridge, workflow, and client interacting with the Dispatch Kernel.

\---

\# Purpose

The Kernel API defines the only supported method for interacting with Dispatch.

Everything talks to the Kernel.

Nothing talks around it.

The API is a contract.

Not an implementation.

\---

\# Philosophy

Objects.

Events.

Workflows.

Everything else derives from them.

Clients should never know database structure.

Services should never know UI.

The API is stable.

Implementations evolve.

\---

\# Core Principle

Every API should expose capability.

Never implementation.

Good

CreateObservation()

Bad

InsertObservationRow()

\---

\# API Layers

Public API

↓

Internal Service API

↓

Kernel Contracts

↓

Persistence

↓

Infrastructure

Each layer depends downward only.

\---

\# Resource Categories

Identity

Organization

Tenant

Object

Relationship

Observation

Claim

Fact

Inference

Memory

Workflow

Event

Audit

Connector

Cartridge

Registry

Publication

Usage

Configuration

\---

\# Canonical Operations

Create

Read

Search

Update

Archive

Restore

Link

Unlink

Execute

Approve

Reject

Replay

Evaluate

Every resource supports only the operations that make semantic sense.

\---

\# Object API

CreateObject()

GetObject()

SearchObjects()

MergeObjects()

SplitObjects()

ArchiveObject()

RegisterExtension()

\---

\# Truth API

CreateObservation()

CreateClaim()

VerifyClaim()

CreateInference()

ResolveConflict()

SearchTruth()

ReviewTruth()

\---

\# Relationship API

CreateRelationship()

UpdateRelationship()

SearchRelationships()

MergeRelationship()

ArchiveRelationship()

RecommendRelationship()

\---

\# Workflow API

CreateWorkflow()

StartWorkflow()

AdvanceWorkflow()

PauseWorkflow()

CancelWorkflow()

AssignTask()

ApproveTask()

CompleteWorkflow()

\---

\# Event API

EmitEvent()

ReplayEvents()

Subscribe()

SearchEvents()

RetryDeadLetter()

\---

\# Memory API

CreateMemory()

RetrieveMemory()

SearchMemory()

ReviewMemory()

ArchiveMemory()

\---

\# Registry API

Register()

Validate()

Activate()

Resolve()

Deprecate()

Archive()

\---

\# Connector API

RegisterConnector()

ExecuteConnector()

PauseConnector()

RotateCredentials()

GetConnectorHealth()

\---

\# Cartridge API

InstallCartridge()

ActivateCartridge()

SuspendCartridge()

UpdateCartridge()

RemoveCartridge()

\---

\# Routing API

EstimateExecution()

RouteTask()

ExecuteAgent()

EvaluateExecution()

Escalate()

\---

\# Audit API

RecordAudit()

SearchAudit()

ReplayDecision()

ExportAudit()

\---

\# Usage API

RecordUsage()

RecordCost()

AggregateUsage()

EstimateCost()

ForecastUsage()

\---

\# Response Contract

Every API returns

Request ID

Correlation ID

Status

Version

Timestamp

Payload

Warnings

Errors

Links

No endpoint returns presentation-specific formatting.

\---

\# Error Contract

Every error includes

Code

Category

Message

Recoverable

Retryable

Correlation ID

Documentation Link

Suggested Action

Errors are machine-readable.

\---

\# Pagination

Every collection endpoint supports

Cursor

Limit

Sort

Filter

Search

Visibility

Tenant

Pagination is cursor-based.

Not offset-based.

\---

\# Filtering

Support

Object Type

Relationship

Date

Owner

Visibility

Status

Workflow

Confidence

Tags

Custom Cartridge Fields

\---

\# Versioning

Every API is versioned.

Breaking changes require

New version

Migration

Deprecation schedule

ADR

\---

\# Idempotency

All mutation endpoints support

Idempotency Key

Repeated requests produce one outcome.

\---

\# Security

Every request evaluates

Identity

↓

Tenant

↓

Permission

↓

Policy

↓

Execution

Authorization precedes execution.

Always.

\---

\# Events

Successful mutations emit Events.

Failures emit Events.

Security violations emit Events.

Audit references every Event.

\---

\# Required Headers

Correlation ID

Tenant ID

Identity

Session

API Version

Idempotency Key

Trace ID

\---

\# Required Tables

api\_keys

api\_clients

api\_versions

api\_usage

api\_limits

api\_errors

api\_tokens

\---

\# SDK Philosophy

Official SDKs should expose

Objects

Workflows

Relationships

Truth

Memory

Connectors

Cartridges

Never raw database access.

\---

\# Acceptance Criteria

Complete when

\- Every Kernel capability is API-first.  
\- APIs are versioned.  
\- Contracts are typed.  
\- Idempotency exists.  
\- Errors are standardized.  
\- Security is centralized.  
\- Events are emitted.  
\- Audit is complete.  
\- SDKs follow Kernel contracts.

\---

\# ADR Candidates

API versioning

Authentication abstraction

SDK generation

Pagination

Error taxonomy

\---

\# End RFC-2014  
