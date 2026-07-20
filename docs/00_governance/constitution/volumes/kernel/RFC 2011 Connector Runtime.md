\# RFC-2011  
\# Connector Runtime

Status: Draft 1.0

Owner

Auric Works

Authority

\- Dispatch Constitution  
\- RFC-2001  
\- RFC-2010

Applies To

Every external system connected to Dispatch.

\---

\# Purpose

The Connector Runtime is responsible for safely acquiring, normalizing, validating, and publishing external information into the Dispatch Knowledge Graph.

Connectors acquire.

The Truth Service validates.

The Kernel orchestrates.

The Connector Runtime never decides business meaning.

\---

\# Philosophy

Connectors are translators.

Not decision engines.

Every connector converts an external representation into Dispatch-native Observations.

Nothing more.

\---

\# Core Principle

One source.

One connector.

One normalization pipeline.

Many downstream consumers.

\---

\# Runtime Responsibilities

Authentication

Scheduling

Polling

Webhook Consumption

Rate Limiting

Retry

Normalization

Observation Creation

Change Detection

Health Monitoring

Metrics

Audit

\---

\# Connector Types

REST API

GraphQL

RSS

Webhook

Database

SFTP

Email

CSV

PDF

Website

Human Upload

Filesystem

Streaming

Future MCP Server

Every connector shares the same lifecycle.

\---

\# Connector Lifecycle

\`\`\`text  
Registered

↓

Configured

↓

Authenticated

↓

Validated

↓

Running

↓

Paused

↓

Retrying

↓

Failed

↓

Retired  
\`\`\`

\---

\# Connector Manifest

Every connector declares

UUID

Version

Source

Authentication

Refresh Strategy

Rate Limits

Expected Objects

Expected Relationships

Expected Claims

Expected Events

Parser

Failure Policy

Terms of Use

\---

\# Authentication

Supported

API Keys

OAuth

OAuth2

OIDC

JWT

Basic Auth

Certificates

Anonymous

Manual Upload

Secrets never live in connector code.

Secrets belong to the Kernel.

\---

\# Acquisition Methods

Scheduled Polling

Webhook

Push

Manual Upload

Batch Import

Streaming

Hybrid

The Runtime abstracts the acquisition method.

\---

\# Refresh Policy

Every connector defines

Interval

Priority

Cost

Freshness Target

Maximum Runtime

Retry Policy

Expiration

\---

\# Rate Limiting

The Runtime enforces

Requests Per Minute

Concurrent Jobs

Burst Limits

Backoff

Vendor Quotas

Connectors never manage their own rate limits.

\---

\# Change Detection

The Runtime identifies

New Records

Updated Records

Deleted Records

No Changes

Change detection creates Events.

\---

\# Normalization Pipeline

\`\`\`text  
Raw Source

↓

Parser

↓

Normalized Observation

↓

Validation

↓

Observation Object

↓

Truth Service

↓

Knowledge Graph  
\`\`\`

Normalization never creates Facts.

\---

\# Parser Responsibilities

Extract

Fields

Identifiers

Dates

Relationships

Documents

References

Metadata

Nothing else.

\---

\# Connector Output

Every successful execution emits

Observation Objects

Relationship Candidates

Entity Candidates

Source Artifacts

Execution Metrics

Health Metrics

Events

\---

\# Failure Handling

Retries

↓

Exponential Backoff

↓

Circuit Breaker

↓

Dead Letter

↓

Operator Notification

No silent failures.

\---

\# Connector Health

Healthy

Warning

Degraded

Offline

Deprecated

Retired

Health affects scheduling.

\---

\# Runtime Events

ConnectorStarted

ConnectorStopped

ConnectorFailed

AuthenticationFailed

RateLimited

RetryStarted

RetrySucceeded

NormalizationCompleted

ConnectorRetired

\---

\# Required Tables

connectors

connector\_versions

connector\_runs

connector\_health

connector\_credentials

connector\_metrics

connector\_failures

connector\_schedules

connector\_outputs

connector\_artifacts

\---

\# API Contracts

RegisterConnector()

RunConnector()

PauseConnector()

ResumeConnector()

ValidateConnector()

RotateCredentials()

TestConnection()

GetHealth()

\---

\# Security

Credentials remain Kernel-managed.

Connectors receive scoped credentials only.

Every outbound request is auditable.

Every inbound payload is attributable.

\---

\# Metrics

Availability

Success Rate

Latency

Records Imported

Observations Created

Retry Count

Failure Rate

Freshness

Cost

\---

\# Acceptance Criteria

Complete when

\- Connectors normalize but never interpret.  
\- Secrets remain outside connector code.  
\- Scheduling is centralized.  
\- Rate limits are enforced.  
\- Retries are idempotent.  
\- Health is observable.  
\- Events are emitted.  
\- Outputs enter the Truth Service.  
\- Audit is complete.  
\- APIs are versioned.

\---

\# ADR Candidates

Connector SDK

Scheduler

Secret management

Retry policy

Parser architecture

\---

\# End RFC-2011  
