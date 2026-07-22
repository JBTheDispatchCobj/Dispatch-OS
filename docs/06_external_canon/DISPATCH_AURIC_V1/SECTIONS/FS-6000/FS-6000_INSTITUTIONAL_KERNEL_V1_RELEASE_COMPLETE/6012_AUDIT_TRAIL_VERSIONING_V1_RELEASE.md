# 6012 — Audit Trail & Versioning V1 Complete

## Purpose

Reconstruct who did what, when, using what evidence, under what authority, and what changed.

## Audit Event

- event ID
- timestamp
- tenant
- actor
- actor type
- institution
- object
- workflow
- action
- prior value/version
- new value/version
- evidence
- approval
- source system
- reason
- confidence
- environment
- retention category

## Actor Types

- user
- agent
- system
- connector
- regulator
- vendor
- external party

## Required Events

- object create/update/archive
- evidence upload/review/lock
- workflow start/block/complete
- agent output
- tool call
- approval request/decision
- external release
- policy change
- filing
- exam response
- finding closure
- permission change
- connector change
- model/prompt change

## Versioning

- immutable prior versions
- schema semantic version
- record sequential version
- effective date
- superseded by
- change summary
- approver
- rollback reference

## Audit Modes

- standard
- board
- exam
- legal hold
- regulator
- incident
- AI/model review

## Retention

Configured by:

- object
- jurisdiction
- obligation
- contract
- legal hold
- institution policy

## Acceptance Tests

- Reconstructs decision end to end.
- Identifies agent, tool, evidence, and approver.
- Compares versions.
- Locks records for exam/legal hold.
- Distinguishes human and automated actions.
