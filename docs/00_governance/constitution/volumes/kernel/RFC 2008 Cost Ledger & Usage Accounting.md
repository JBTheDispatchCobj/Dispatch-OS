\# RFC-2008  
\# Cost Ledger & Usage Accounting

Status: Draft 1.0

Owner

Auric Works

Authority

\- Dispatch Constitution  
\- RFC-2001  
\- RFC-2007

Applies To

Every action executed by Dispatch.

\---

\# Purpose

The Cost Ledger is the financial telemetry layer of Dispatch.

Its purpose is not billing.

Its purpose is understanding the economic cost of operating the platform.

Billing is derived from cost.

Architecture decisions are informed by cost.

Routing decisions are informed by cost.

Capacity planning is informed by cost.

\---

\# Philosophy

Every intelligent action has a measurable cost.

Every cost must be attributable.

Every cost must be reproducible.

Dispatch measures operations before it invoices customers.

\---

\# Core Principle

No execution without accounting.

If Dispatch performs work, that work produces a ledger entry.

\---

\# Cost Categories

Model Inference

Connector Execution

Storage

Retrieval

Embedding

Vector Search

SQL

API

Object Storage

Workflow

Publication

Notification

Human Review

Third Party Services

Infrastructure

Every category is independently measurable.

\---

\# Ledger Entry

Every execution records

Ledger UUID

Timestamp

Tenant

Workspace

Workflow

Correlation ID

Actor

Service

Operation

Resource Type

Units

Unit Cost

Extended Cost

Latency

Success

Failure

Currency

Provider

Version

\---

\# Cost Flow

\`\`\`text  
Execution

↓

Resource Consumption

↓

Ledger Entry

↓

Aggregation

↓

Analytics

↓

Billing

↓

Optimization  
\`\`\`

\---

\# Metered Resources

Tokens

Seconds

API Calls

Database Reads

Database Writes

Files

Embeddings

Images

Audio

Video

Connector Runs

Workflow Steps

Notifications

Human Minutes

\---

\# Cost Ownership

Every cost belongs to

Platform

Tenant

Workflow

Object

Correlation ID

Service

Never orphan cost.

\---

\# Usage Ledger

Usage differs from cost.

Example

10 AI requests

↓

Usage

$0.37

↓

Cost

$1.99

↓

Price

These remain independent.

\---

\# Pricing Philosophy

Pricing should evolve independently from infrastructure.

Never hardcode pricing.

Pricing belongs in configuration.

\---

\# Optimization Goals

Reduce

Latency

↓

Cost

↓

Infrastructure

while preserving

Truth

Audit

Quality

Confidence

\---

\# Model Routing Inputs

Routing evaluates

Task Complexity

Privacy

Confidence

Budget

Tenant Policy

Historical Performance

Current Load

Estimated Cost

The cheapest sufficient intelligence wins.

\---

\# Budget Policies

Budgets may exist for

Organization

Department

User

Workflow

Connector

Cartridge

Publication

Budgets never change historical ledger entries.

\---

\# Human Costs

Humans are resources.

Review

Approval

Consulting

Analysis

Support

Human effort should be measurable.

\---

\# Required Tables

usage\_ledger

cost\_ledger

pricing\_models

resource\_types

budget\_policies

resource\_usage

provider\_costs

workflow\_costs

\---

\# API Contracts

RecordUsage()

RecordCost()

EstimateCost()

AggregateUsage()

AggregateCost()

ApplyPricing()

ExportLedger()

\---

\# Reporting

Support

Real-Time

Daily

Weekly

Monthly

Per Workflow

Per Cartridge

Per Connector

Per Model

Per Tenant

Per User

\---

\# Acceptance Criteria

Complete when

\- Every execution creates a ledger entry.  
\- Usage and cost remain separate.  
\- Pricing is configurable.  
\- Budgets are enforceable.  
\- Routing considers estimated cost.  
\- Historical entries never mutate.  
\- Reports reconcile to execution history.  
\- APIs are versioned.

\---

\# ADR Candidates

Ledger schema

Pricing abstraction

Budget engine

Cost attribution

Forecasting

\---

\# End RFC-2008  
