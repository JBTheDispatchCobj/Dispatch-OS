# 6010 — Evidence Object Model V1 Complete

## Purpose

Define proof objects supporting facts, controls, decisions, reports, exams, workflows, approvals, and board outputs.

## Canonical Evidence Object

- evidence ID
- title
- type
- source type
- source reference
- source owner
- source timestamp
- collection timestamp
- related objects
- related claims
- related obligations
- related controls
- related workflows
- period
- version
- hash
- classification
- retention
- freshness
- confidence
- review status
- approval status
- chain of custody
- audit history

## Evidence Types

- document
- system record
- data export
- screenshot
- email
- meeting note
- attestation
- calculation
- policy
- procedure
- control test
- filing confirmation
- board minutes
- contract
- report
- public source

## Source Types

- public
- uploaded
- connector
- system-generated
- manually attested
- inferred
- agent-generated

Agent-generated content is not source evidence unless specifically approved as an artifact.

## State Machine

- requested
- collected
- parsing
- under review
- approved
- rejected
- stale
- superseded
- archived
- locked

## Freshness

- current
- aging
- stale
- expired
- historical

## Evidence Package

Use cases:

- credit
- investment
- exam
- vendor review
- pilot
- board
- filing
- policy
- remediation
- trade
- insurance
- opportunity

## Chain of Custody

- source received
- file hash
- collector
- transformations
- reviewers
- approvals
- exports
- lock state
- retention events

## Decision Rules

- stale evidence cannot satisfy time-bound requirement
- agent-generated draft cannot satisfy source requirement
- superseded evidence remains historical
- exam submission locks version
- conflicting evidence creates exception
- privileged evidence limits output

## Acceptance Tests

- Every material claim can link to evidence.
- Original source is preserved.
- Agent output and source evidence remain distinct.
- Stale evidence is visible.
- Board/exam packages can lock versions.
