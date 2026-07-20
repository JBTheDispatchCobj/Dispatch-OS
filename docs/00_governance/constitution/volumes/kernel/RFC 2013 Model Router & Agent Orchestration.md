\# RFC-2013  
\# Model Router & Agent Orchestration

Status: Draft 1.0

Owner

Auric Works

Authority

\- Dispatch Constitution  
\- RFC-2001  
\- RFC-2012

Applies To

Every AI model, deterministic engine, agent, workflow, and intelligent execution within Dispatch.

\---

\# Purpose

The Model Router is responsible for selecting the cheapest sufficient execution path for every intelligent task.

Dispatch does not have "an AI."

Dispatch has an orchestration layer.

Models are interchangeable execution resources.

\---

\# Philosophy

Dispatch owns intelligence.

Models provide computation.

The Router determines which computational resource should perform a task.

No workflow should know which model executes it.

\---

\# Core Principle

Never optimize for the smartest model.

Optimize for the best operational outcome.

The routing decision balances

Quality

↓

Latency

↓

Privacy

↓

Cost

↓

Availability

↓

Confidence

\---

\# Routing Ladder

\`\`\`text  
Deterministic Rules

↓

SQL

↓

Registered Tool

↓

Connector

↓

Local Open Model

↓

Shared Open Model

↓

Large Open Model

↓

Frontier Model

↓

Human Expert  
\`\`\`

The Router always begins at the top.

It escalates only when necessary.

\---

\# Execution Classes

Extraction

Classification

Entity Resolution

Matching

Summarization

Comparison

Planning

Recommendation

Generation

Evaluation

Conversation

Workflow Assistance

Each class has independent routing policies.

\---

\# Routing Inputs

Task Type

Task Complexity

Required Accuracy

Risk Level

Privacy Level

Tenant Policy

Latency Budget

Cost Budget

Historical Success

Model Availability

Evaluation Score

Context Size

\---

\# Complexity Levels

Level 0

Deterministic

Level 1

Structured Retrieval

Level 2

Small Local Model

Level 3

Large Local/Open Model

Level 4

Frontier Deliberation

Level 5

Human Review

The Router assigns complexity.

Not cartridges.

\---

\# Privacy Classes

Public

Partner

Institution

Confidential

Restricted

Regulated

Top Secret

Privacy constrains routing.

Not vice versa.

\---

\# Routing Policies

Policies are Registry-driven.

Never hardcoded.

Policies define

Allowed Models

Maximum Cost

Maximum Latency

Escalation Rules

Fallback Strategy

Approval Requirements

\---

\# Model Registry

Every model defines

Provider

Name

Version

Capabilities

Latency

Context Window

Cost

Privacy

Supported Tasks

Evaluation Scores

Health

The Router consults the Registry.

\---

\# Open Model Strategy

Dispatch prefers

Open models

for

Routine execution.

Frontier models

for

High-value reasoning.

Humans

for

High-risk judgment.

\---

\# Context Assembly

Before invoking a model

The Router builds

Context Pack

↓

Objects

↓

Relationships

↓

Memory

↓

Workflow

↓

Relevant Claims

↓

Policies

↓

Prompt

Models never search the database directly.

\---

\# Prompt Selection

Prompts belong to the Prompt Registry.

The Router selects

Prompt

↓

Prompt Version

↓

Prompt Variables

↓

Evaluation Set

↓

Execution

Prompt logic remains external to models.

\---

\# Multi-Agent Execution

The Router may decompose work.

\`\`\`text  
Planner

↓

Research

↓

Extraction

↓

Comparison

↓

Reviewer

↓

Aggregator  
\`\`\`

Every agent remains stateless.

Shared context lives in Dispatch.

\---

\# Human Escalation

Escalate when

Confidence too low

Risk too high

Policy requires review

Budget exceeded

Contradictory evidence

Missing context

Human review becomes part of the workflow.

\---

\# Fallback Strategy

If execution fails

↓

Retry

↓

Alternative Model

↓

Alternative Provider

↓

Human

↓

Failure Event

Never silently fail.

\---

\# Evaluation

Every execution records

Expected Outcome

Actual Outcome

Human Rating

Latency

Cost

Confidence

Errors

Evaluation updates routing.

\---

\# Required Tables

model\_registry

routing\_policies

routing\_history

prompt\_registry

prompt\_versions

agent\_executions

model\_evaluations

routing\_metrics

\---

\# API Contracts

RouteTask()

EstimateExecution()

ExecuteModel()

ExecuteAgent()

Escalate()

EvaluateExecution()

RegisterModel()

RegisterPolicy()

\---

\# Metrics

Average Cost

Average Latency

Success Rate

Escalation Rate

Human Review %

Model Accuracy

Provider Health

Routing Efficiency

\---

\# Acceptance Criteria

Complete when

\- Routing is Registry-driven.  
\- Models remain interchangeable.  
\- Context Packs are generated automatically.  
\- Prompt versions are tracked.  
\- Costs are recorded.  
\- Human escalation functions.  
\- Evaluation improves routing.  
\- APIs are versioned.  
\- Audit is complete.

\---

\# ADR Candidates

Routing algorithm

Context Pack generation

Planner architecture

Evaluation framework

Provider abstraction

\---

\# End RFC-2013  
