\# RFC-2007  
\# Audit Service

Status: Draft 1.0

Owner

Auric Works

Authority

\- Dispatch Constitution  
\- RFC-2001  
\- RFC-2006

Applies To

Every service, connector, cartridge, workflow, model execution, API request, user action, and system process.

\---

\# Purpose

The Audit Service provides complete operational accountability.

Nothing significant occurs inside Dispatch without leaving a permanent audit record.

Audit exists to answer:

Who?

What?

When?

Where?

Why?

How?

With what evidence?

At what cost?

\---

\# Philosophy

Logs are for operators.

Metrics are for performance.

Audit is for history.

These are different systems.

Audit is permanent.

\---

\# Core Principle

Every meaningful decision must be reproducible.

A reviewer should be able to reconstruct exactly how Dispatch reached any conclusion.

\---

\# Audit Record

Every audit record contains

Audit UUID

Timestamp

Actor

Tenant

Object References

Workflow Reference

Event Reference

Correlation ID

Action

Inputs

Outputs

Execution Path

Rule Versions

Model Versions

Prompt Version

Connector Version

Cost

Latency

Decision

Result

\---

\# Actors

Human

Service Account

Connector

Workflow

Model

Administrator

System

Every actor has identity.

\---

\# Auditable Actions

Authentication

Authorization

Object Creation

Object Mutation

Relationship Changes

Workflow Transitions

Approvals

Model Executions

Connector Executions

Publications

Imports

Exports

Configuration Changes

Policy Changes

Permission Changes

Cost Recording

Nothing bypasses audit.

\---

\# Evidence

Audit stores references.

Not copies.

Evidence may include

Documents

Claims

Facts

Events

Prompts

Responses

Screenshots

Files

APIs

Every reference remains traceable.

\---

\# Decision Trace

Every recommendation records

Facts Used

Inferences Used

Rules Used

Models Used

Prompt Version

Confidence

Alternatives Considered

Human Overrides

Final Outcome

Dispatch explains itself.

\---

\# Human Review

Human intervention records

Reviewer

Decision

Reason

Evidence

Time

Comments

Overrides never erase machine history.

\---

\# Model Audit

Every model execution records

Provider

Model

Version

Temperature

Context Pack Version

Prompt Hash

Retrieved Objects

Execution Cost

Latency

Output Hash

No opaque model behavior.

\---

\# Connector Audit

Connector runs record

Connector Version

Source

Refresh

Records Retrieved

Failures

Retries

Normalization

Changes Produced

\---

\# Configuration Audit

Changes to

Policies

Rules

Prompts

Schemas

Registries

Cartridges

Permissions

Thresholds

must create immutable audit entries.

\---

\# Required Tables

audit\_records

audit\_references

audit\_models

audit\_connectors

audit\_reviews

audit\_exports

audit\_policy\_changes

audit\_config\_changes

\---

\# API Contracts

RecordAudit()

SearchAudit()

ReplayDecision()

ExportAudit()

VerifyIntegrity()

\---

\# Security

Audit records are append-only.

No edits.

No deletes.

Only legal retention policies may archive.

\---

\# Integrity

Every record receives

Hash

Parent Hash

Timestamp

Signature

Optional future cryptographic verification is supported.

\---

\# Metrics

Audit Coverage %

Missing Audit Events

Replay Success

Decision Explainability

Configuration Changes

Human Overrides

\---

\# Acceptance Criteria

Complete when

\- Every protected action generates audit.  
\- Every recommendation is explainable.  
\- Model executions are reproducible.  
\- Human overrides are preserved.  
\- Audit is append-only.  
\- Replay is supported.  
\- Configuration changes are immutable.  
\- APIs are versioned.

\---

\# ADR Candidates

Retention strategy

Hash chain

Export policy

Replay implementation

Legal hold

\---

\# End RFC-2007  
