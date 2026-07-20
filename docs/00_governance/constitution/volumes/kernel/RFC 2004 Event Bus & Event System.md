\# RFC-2004  
\# Event Bus & Event System

Status: Draft 1.0

Owner: Auric Works

Authority

\- Dispatch Constitution  
\- RFC-2001  
\- RFC-2002  
\- RFC-2003

Applies To

Every subsystem.

\---

\# Purpose

The Event System is the nervous system of Dispatch.

Objects represent current state.

Events represent everything that happened.

Nothing significant occurs inside Dispatch without producing an Event.

\---

\# Philosophy

Events are immutable.

Objects are mutable.

History is reconstructed from Events.

Current state is reconstructed from Objects.

Both are required.

\---

\# Core Principle

No silent mutation.

Every meaningful state transition produces an Event.

If it didn't emit an Event,

it didn't happen.

\---

\# Event Definition

An Event represents

A completed occurrence

at

a specific point in time

affecting

one or more Objects.

Events never contain business logic.

Events contain evidence.

\---

\# Canonical Event Structure

UUID

Event Type

Timestamp

Actor

Tenant

Correlation ID

Workflow ID

Source

Affected Objects

Payload

Metadata

Version

Visibility

Confidence (optional)

Audit Reference

\---

\# Event Categories

Identity

Object

Relationship

Truth

Workflow

Connector

Publication

Terminal

Model

Security

System

Billing

Administration

Cartridge

Each category owns its event namespace.

\---

\# Event Naming

Verb first.

Examples

ObjectCreated

ObjectMerged

RelationshipActivated

ClaimVerified

WorkflowStarted

WorkflowCompleted

PublicationReleased

ConnectorFailed

ModelExecuted

TerminalProvisioned

Never use ambiguous names.

\---

\# Event Flow

\`\`\`text  
Action

↓

Validation

↓

Event Created

↓

Persisted

↓

Published

↓

Consumed

↓

Side Effects

↓

Audit  
\`\`\`

Persistence occurs before publication.

\---

\# Ordering

Events are ordered within a stream.

Cross-stream ordering is not guaranteed.

Consumers must tolerate eventual consistency.

\---

\# Event Streams

Global

Tenant

Object

Workflow

Connector

Cartridge

User

Publication

Relationship

Consumers subscribe by stream.

\---

\# Correlation IDs

A single business action may generate many Events.

Correlation IDs group them.

Example

Pilot Approved

↓

Relationship Updated

↓

Workflow Completed

↓

Publication Generated

↓

Notification Sent

All share one Correlation ID.

\---

\# Idempotency

Consumers must safely replay Events.

Processing the same Event twice must never corrupt state.

\---

\# Replay

The Event Store supports replay.

Replay rebuilds

Read Models

Caches

Indexes

Analytics

Derived Objects

Replay never changes historical Events.

\---

\# Event Retention

Events are permanent.

Retention policies govern storage tier.

Not deletion.

\---

\# Event Payload Rules

Payloads contain

Identifiers

References

Minimal state

Never duplicate entire Objects.

Consumers retrieve canonical state when needed.

\---

\# Event Versioning

Events are append-only.

Schema evolution uses version numbers.

Consumers support compatible versions.

\---

\# Failure Handling

If publication fails

↓

retry publication

If consumer fails

↓

retry consumer

If retry exhausted

↓

dead-letter queue

Events are never discarded.

\---

\# Dead Letter Queue

Contains

Failed Event

Failure Reason

Retry Count

Last Attempt

Operator Notes

Recovery Action

Dead letters are auditable.

\---

\# Required Tables

events

event\_streams

event\_subscriptions

event\_offsets

dead\_letter\_events

event\_versions

\---

\# API Contracts

EmitEvent()

ReplayEvents()

Subscribe()

Acknowledge()

Retry()

DeadLetter()

SearchEvents()

\---

\# Event Security

Events inherit visibility from affected Objects.

Consumers cannot subscribe beyond authorization.

\---

\# Observability

Track

Publish latency

Consumer latency

Retry count

Failure rate

Queue depth

Replay duration

Subscriber health

\---

\# Acceptance Criteria

Implementation is complete when

\- Every material mutation emits an Event.  
\- Events are immutable.  
\- Replay functions.  
\- Dead-letter queue exists.  
\- Consumers are idempotent.  
\- Correlation IDs are preserved.  
\- Audit references every Event.  
\- Event schemas are versioned.

\---

\# ADR Candidates

Event transport

Delivery guarantees

Replay architecture

Partitioning

Retention policy

\---

\# End RFC-2004  
