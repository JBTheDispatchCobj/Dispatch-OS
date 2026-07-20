\# RFC-2005  
\# Workflow Engine

Status: Draft 1.0

Owner

Auric Works

Authority

\- Dispatch Constitution  
\- RFC-2001  
\- RFC-2002  
\- RFC-2003  
\- RFC-2004

Applies To

Every executable process inside Dispatch.

\---

\# Purpose

The Workflow Engine converts intelligence into execution.

Objects represent knowledge.

Workflows represent work.

Dispatch exists to improve operational capacity.

Operational capacity requires execution.

\---

\# Philosophy

A workflow is a durable state machine.

Not a chat.

Not a prompt.

Not a background job.

Not an automation.

Workflows survive:

Model failures

Browser refreshes

Restarts

User changes

Deployment

Time

\---

\# Core Principle

Knowledge without execution has no operational value.

Every Intelligence Object should be capable of launching one or more workflows.

\---

\# Workflow Definition

A workflow consists of

Trigger

↓

Inputs

↓

Preconditions

↓

States

↓

Transitions

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

Every workflow is an Object.

\---

\# Workflow Types

System

Operational

Approval

Review

Analysis

Publication

Connector

Relationship

Investment

Pilot

Integration

Onboarding

Compliance

Administrative

Custom Cartridge

\---

\# Workflow Lifecycle

\`\`\`text  
Draft

↓

Ready

↓

Running

↓

Waiting

↓

Blocked

↓

Paused

↓

Completed

↓

Cancelled

↓

Archived  
\`\`\`

No workflow skips states.

\---

\# Workflow Components

Every workflow defines

Identity

Owner

Participants

State Machine

Timeouts

Retry Policy

Permissions

Escalation Rules

Required Evidence

Success Criteria

Failure Criteria

Audit Policy

Cost Policy

\---

\# Triggers

A workflow may begin from

Event

User Action

Schedule

Connector

API

Relationship Change

Publication

Recommendation

Manual Launch

Workflow Completion

\---

\# Actions

Actions may include

SQL

API Calls

Connector Execution

Model Invocation

Notification

Approval Request

Document Generation

Object Mutation

Relationship Update

Publication

Human Assignment

Actions remain deterministic where possible.

\---

\# Human Tasks

Humans participate through

Assignment

↓

Review

↓

Decision

↓

Evidence

↓

Completion

Human tasks are workflow nodes.

Not external exceptions.

\---

\# Approval Gates

Approval nodes define

Approver

Authority

Required Evidence

Timeout

Escalation

Delegation

Decision

Every approval emits Events.

\---

\# Workflow Context

Each execution maintains

Workflow UUID

Correlation ID

Objects

Relationships

Tenant

Participants

Memory

Current State

Previous States

Execution Log

No execution depends on chat history.

\---

\# Variables

Workflow variables are immutable unless explicitly updated.

Variable history is preserved.

Examples

Institution

Startup

Executive

Investment

Meeting Date

Risk Score

Recommendation

\---

\# Retry Policy

Every action declares

Retry Count

Retry Delay

Backoff Strategy

Escalation Rule

Dead Letter Policy

Retries are idempotent.

\---

\# Timeouts

Every waiting state defines

Maximum Duration

Reminder Schedule

Escalation

Expiration Behavior

Timeouts emit Events.

\---

\# Escalation

Escalation may target

Manager

Role

Institution

Auric Works

Human Expert

Alternative Workflow

Escalation is configurable.

\---

\# Workflow Memory

Execution remembers

Inputs

Outputs

Evidence

Approvals

Failures

Costs

Recommendations

Memory belongs to execution.

Not the model.

\---

\# Required Tables

workflow\_templates

workflow\_instances

workflow\_states

workflow\_actions

workflow\_variables

workflow\_assignments

workflow\_evidence

workflow\_approvals

workflow\_logs

workflow\_metrics

\---

\# API Contracts

CreateWorkflow()

StartWorkflow()

AdvanceState()

AssignTask()

Approve()

Reject()

Pause()

Resume()

Cancel()

Complete()

Replay()

\---

\# Security

Workflow execution evaluates

Identity

↓

Tenant

↓

Permissions

↓

Current State

↓

Allowed Transition

↓

Execution

Transitions are policy-controlled.

\---

\# Metrics

Track

Completion Rate

Cycle Time

Queue Time

Approval Time

Retry Rate

Failure Rate

Cost

Human Touches

Automation %

Business Outcome

\---

\# Acceptance Criteria

Complete when

\- Every workflow is durable.  
\- State machines are explicit.  
\- Human approvals are modeled.  
\- Retries are idempotent.  
\- Timeouts are enforced.  
\- Escalations are configurable.  
\- Costs are recorded.  
\- Events are emitted.  
\- Audit is complete.  
\- Workflows survive restarts.

\---

\# ADR Candidates

Workflow DSL

State machine engine

Approval model

Retry strategy

Escalation policy

Workflow versioning

\---

\# End RFC-2005  
