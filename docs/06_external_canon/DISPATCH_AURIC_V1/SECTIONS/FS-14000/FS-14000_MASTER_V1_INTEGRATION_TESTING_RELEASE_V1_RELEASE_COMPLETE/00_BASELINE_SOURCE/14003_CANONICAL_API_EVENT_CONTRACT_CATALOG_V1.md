# 14003 — Canonical API & Event Contract Catalog V1

## Purpose

Define the master catalog of service APIs, events, schemas, and compatibility expectations.

## API Categories

- identity
- tenant
- institution profile
- executive profile
- vendor/product
- object registry
- graph
- search
- ingestion
- connector
- workflow
- agent
- evidence
- approval
- audit
- dashboard/reporting
- notification
- administration

## API Contract Fields

- API ID
- service
- operation
- version
- method
- path/action
- request schema
- response schema
- permissions
- tenant scope
- idempotency
- error model
- audit behavior
- SLO
- status

## Event Contract Fields

- event type
- version
- producer
- consumer
- subject
- payload schema
- classification
- ordering requirement
- idempotency
- retention
- replay support
- owner

## Core Events

- institution.created
- institution.updated
- executive.updated
- document.ingested
- evidence.approved
- approval.requested
- approval.decided
- workflow.started
- workflow.blocked
- workflow.completed
- opportunity.detected
- readiness.changed
- connector.failed
- graph.edge.created
- report.published
- incident.declared

## Compatibility Rules

- additive fields preferred
- breaking change requires new version
- consumers tolerate unknown optional fields
- required-field change is breaking
- enum changes require review
- event producer and consumer versions tracked
- migration and rollback documented

## Error Contract

Include:

- code
- message
- user-safe detail
- correlation ID
- retryable
- field errors
- permission state
- next action

## Acceptance Tests

- Services use versioned contracts.
- Events are replayable where required.
- Errors include correlation IDs.
- Permissions are part of the contract.
- Breaking changes trigger compatibility review.
