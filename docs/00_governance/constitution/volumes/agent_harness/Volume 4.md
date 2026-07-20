\# RFC-4000  
\# Volume IV  
\# Agent Harness  
\# Volume Architecture & Dependency Map

Status

Draft 1.0

Owner

Auric Works

Authority

\- Dispatch Constitution  
\- RFC-2000  
\- RFC-2001 through RFC-2015  
\- RFC-3000 through RFC-3015

Applies To

Every model, agent, workflow, reasoning task, tool invocation, publication, recommendation, and intelligent execution inside Dispatch.

\---

\# Purpose

Volume IV defines the Agent Harness.

The Agent Harness is the cognitive operating layer of Dispatch.

It does not store knowledge.

It does not own truth.

It does not own workflows.

It orchestrates intelligence.

The Harness converts operational questions into deterministic execution plans using the Dispatch Kernel.

\---

\# Philosophy

Dispatch is not an AI application.

Dispatch is an orchestration platform.

Models are replaceable.

Reasoning is replaceable.

Providers are replaceable.

The Harness is permanent.

\---

\# Core Principle

The Harness never knows more than the Knowledge Graph.

The Knowledge Graph provides understanding.

The Harness provides execution.

The Kernel provides guarantees.

\---

\# Responsibilities

Volume IV owns

Task Classification

Execution Planning

Context Assembly

Model Routing

Tool Routing

Agent Orchestration

Prompt Selection

Evaluation

Recovery

Human Escalation

Execution Optimization

Nothing else.

\---

\# Non-Responsibilities

Truth

Knowledge

Profiles

Relationships

Workflows

Storage

Authentication

Billing

UI

Publication Rendering

Those belong to previous or future volumes.

\---

\# Canonical Execution Flow

\`\`\`text  
Request

↓

Task Classification

↓

Working Graph

↓

Context Pack

↓

Execution Plan

↓

Tool Selection

↓

Model Selection

↓

Agent Execution

↓

Evaluation

↓

Workflow

↓

Outcome

↓

Knowledge Graph Update  
\`\`\`

Every execution returns to the graph.

\---

\# Architectural Layers

Layer 1

Task Classification

↓

Layer 2

Execution Planning

↓

Layer 3

Context Assembly

↓

Layer 4

Routing

↓

Layer 5

Execution

↓

Layer 6

Evaluation

↓

Layer 7

Learning

Each layer is independently replaceable.

\---

\# Design Principles

Kernel First

Truth Before Reasoning

Context Before Models

Rules Before LLMs

Cheapest Sufficient Intelligence

Human Last

Everything Explainable

Everything Auditable

Everything Replaceable

\---

\# Volume Structure

RFC-4000

Volume Architecture

RFC-4001

Harness Philosophy

RFC-4002

Task Classification

RFC-4003

Context Pack Builder

RFC-4004

Planner

RFC-4005

Tool Router

RFC-4006

Model Router

RFC-4007

Multi-Agent Runtime

RFC-4008

Prompt Registry

RFC-4009

Execution Engine

RFC-4010

Evaluation Engine

RFC-4011

Human Escalation

RFC-4012

Failure Recovery

RFC-4013

Cost Optimization

RFC-4014

Harness APIs

RFC-4015

Acceptance & Evaluation

\---

\# Dependency Order

4001

↓

4002

↓

4003

↓

4004

↓

4005

↓

4006

↓

4007

↓

4008

↓

4009

↓

4010

↓

4011

↓

4012

↓

4013

↓

4014

↓

4015

\---

\# Required Dependencies

Kernel (Volume II)

Knowledge Graph (Volume III)

The Harness never bypasses either.

\---

\# Deliverables

At completion Volume IV defines

A model-independent AI orchestration framework

Task planner

Context builder

Agent runtime

Execution planner

Tool routing

Model routing

Evaluation framework

Human review

Cost-aware execution

Complete Harness APIs

\---

\# Success Criteria

Volume IV is complete when

Every intelligent task follows the Harness.

Every model is replaceable.

Every decision is explainable.

Every execution is reproducible.

Every workflow consumes Context Packs.

Every recommendation traces to graph state.

Every execution improves future routing.

\---

\# End RFC-4000

\# RFC-4001  
\# Harness Philosophy

Status

Draft 1.0

Owner

Auric Works

Authority

\- Dispatch Constitution  
\- RFC-2000  
\- RFC-4000

Applies To

Every intelligent execution performed by Dispatch.

\---

\# Purpose

The Agent Harness is the cognitive operating system of Dispatch.

Its responsibility is not intelligence.

Its responsibility is coordinating intelligence.

It decides

What should happen.

Not

What is true.

Truth belongs to the Knowledge Graph.

Execution belongs to the Harness.

\---

\# Philosophy

Dispatch does not have an AI.

Dispatch has an orchestration engine.

Models are computational resources.

The Harness decides

when,

why,

and

how

they are used.

\---

\# Core Principle

The Harness owns execution.

Models own computation.

Tools own capability.

Humans own judgment.

Knowledge owns truth.

Each layer has one responsibility.

\---

\# Canonical Execution Model

\`\`\`text  
Intent

↓

Task Classification

↓

Working Graph

↓

Context Pack

↓

Execution Plan

↓

Capability Selection

↓

Execution

↓

Evaluation

↓

Workflow

↓

Knowledge Update  
\`\`\`

The Harness never skips stages.

\---

\# First Principles

Always solve with

Rules

before

Models.

Always solve with

Small Models

before

Large Models.

Always solve with

Automation

before

Humans.

Always solve with

Knowledge

before

Generation.

\---

\# Execution Hierarchy

Deterministic Logic

↓

Registered Tool

↓

Connector

↓

Local Model

↓

Open Model

↓

Frontier Model

↓

Human Expert

Escalation is earned.

Not assumed.

\---

\# Harness Responsibilities

Interpret intent.

Assemble context.

Choose execution strategy.

Coordinate agents.

Manage retries.

Evaluate outcomes.

Learn from execution.

Improve future routing.

Nothing more.

\---

\# Harness Non-Responsibilities

Truth

Memory

Knowledge

Storage

Relationships

Profiles

Rendering

Authentication

Billing

The Harness consumes these systems.

It never owns them.

\---

\# Context First

No execution begins without a Context Pack.

Models never query databases.

Models never retrieve documents.

Models receive bounded operational context prepared by Dispatch.

\---

\# Execution Plans

Every task becomes a plan.

Plans define

Goal

Inputs

Capabilities

Dependencies

Success Criteria

Failure Criteria

Evaluation

Plans are executable.

Not conversational.

\---

\# Capability-Oriented

The Harness routes capabilities.

Not vendors.

Example

Extract Entity

Compare Documents

Summarize

Evaluate Risk

Generate Publication

Each capability may use different execution resources.

\---

\# Agent Philosophy

Agents are workers.

Not personalities.

Not assistants.

Not memory stores.

Not products.

Agents execute one responsibility.

Then terminate.

State belongs to Dispatch.

\---

\# Stateless Execution

Agents remember nothing.

Every execution receives

Context Pack

↓

Plan

↓

Capabilities

↓

Policies

↓

Budget

↓

Goal

This makes execution reproducible.

\---

\# Explainability

Every execution answers

Why this plan?

Why this tool?

Why this model?

Why this recommendation?

The Harness is explainable by design.

\---

\# Human Philosophy

Humans are execution resources.

Not exception handlers.

The Harness plans for human participation exactly as it plans for tools.

\---

\# Learning

Execution outcomes improve

Routing

Planning

Evaluation

Cost estimation

Capability selection

Learning updates policies.

Not history.

\---

\# Failure Philosophy

Failure is expected.

Recovery is designed.

Retries are intentional.

Escalation is planned.

Nothing fails silently.

\---

\# Constitutional Rules

The Harness never

Creates Truth

Stores Memory

Bypasses Policies

Bypasses Audit

Bypasses Permissions

Bypasses Cost Accounting

Hardcodes Providers

These are constitutional violations.

\---

\# Success Metrics

The Harness succeeds when

Execution becomes cheaper.

Execution becomes faster.

Execution becomes more accurate.

Humans perform less repetitive work.

Knowledge compounds.

Operational capacity increases.

\---

\# Acceptance Criteria

Implementation is complete when

\- Every intelligent task executes through the Harness.  
\- Models remain interchangeable.  
\- Context precedes execution.  
\- Agents remain stateless.  
\- Execution is explainable.  
\- Routing is policy-driven.  
\- Learning improves future execution.  
\- Audit is complete.  
\- No model owns business logic.

\---

\# ADR Candidates

Execution philosophy

Capability abstraction

Stateless agents

Execution planning

Human orchestration

Learning loop

\---

\# End RFC-4001

\# RFC-4002  
\# Task Classification Engine

Status

Draft 1.0

Owner

Auric Works

Authority

\- Dispatch Constitution  
\- RFC-2000  
\- RFC-4001

Applies To

Every request entering the Agent Harness.

\---

\# Purpose

The Task Classification Engine determines what kind of work Dispatch is being asked to perform.

Classification is the first intelligent decision made by the Harness.

Everything downstream depends upon correct classification.

Incorrect classification produces incorrect execution.

\---

\# Philosophy

Dispatch never asks

"What model should I use?"

Dispatch first asks

"What work am I performing?"

Execution follows classification.

Never the reverse.

\---

\# Core Principle

Every request belongs to one primary task.

A request may contain multiple subtasks.

The Planner decomposes.

The Classifier identifies.

\---

\# Canonical Flow

\`\`\`text  
Request

↓

Intent Detection

↓

Task Classification

↓

Complexity Classification

↓

Risk Classification

↓

Capability Selection

↓

Planning

↓

Execution  
\`\`\`

Classification always precedes planning.

\---

\# Task Definition

A Task is the smallest independently executable unit of operational work.

Tasks are capability-oriented.

Never model-oriented.

\---

\# Canonical Task Categories

Extraction

Classification

Matching

Retrieval

Search

Graph Traversal

Comparison

Summarization

Analysis

Reasoning

Recommendation

Planning

Workflow

Generation

Publication

Communication

Evaluation

Monitoring

Administration

Human Review

Every request begins here.

\---

\# Subtasks

One request may generate

many Tasks.

Example

"Evaluate this startup for three credit unions."

↓

Extract

↓

Retrieve Profiles

↓

Build Working Graphs

↓

Reason

↓

Compare

↓

Generate Recommendation

↓

Generate Publication

↓

Create Workflow

One request.

Eight Tasks.

\---

\# Complexity Levels

Level 0

Deterministic

SQL

Rules

No AI

\---

Level 1

Structured Retrieval

Graph Assembly

Search

No reasoning

\---

Level 2

Simple AI

Extraction

Classification

Matching

Summarization

\---

Level 3

Operational Reasoning

Comparison

Planning

Recommendation

\---

Level 4

Strategic Reasoning

Multi-agent

Cross-domain

Executive analysis

\---

Level 5

Human Judgment Required

Legal

Board

Capital Allocation

Ethics

High-risk operations

The Planner escalates.

Not the model.

\---

\# Risk Levels

Minimal

Low

Moderate

High

Critical

Risk influences

Routing

Review

Approval

Audit

Not capability.

\---

\# Capability Mapping

Each Task maps to

one or more Capabilities.

Example

Extraction

↓

NER

OCR

Parser

Connector

Example

Recommendation

↓

Graph

Inference

Planner

Model

Capabilities remain Registry-defined.

\---

\# Task Inputs

Identity

Intent

Working Graph

Policies

Workflow

Context Pack

Budget

Deadline

Risk

Task inputs are standardized.

\---

\# Task Outputs

Result

Confidence

Cost

Latency

Evidence

Evaluation

Events

Next Tasks

Every Task produces structured output.

\---

\# Decomposition Rules

Large Tasks are decomposed by

Planner.

Small Tasks execute directly.

Recursive decomposition is supported.

Infinite recursion is prohibited.

\---

\# Priority

Priority derives from

Workflow

Human Request

Policy

Deadline

Risk

Business Impact

Priority is dynamic.

\---

\# Dependencies

Tasks may depend upon

Other Tasks

Workflows

Approvals

Connectors

External Systems

Dependencies become the execution graph.

\---

\# Task States

Queued

Ready

Running

Waiting

Blocked

Completed

Failed

Cancelled

Archived

The Workflow Engine owns state.

Classification owns identity.

\---

\# Classification Events

TaskClassified

TaskSplit

TaskMerged

ComplexityAssigned

RiskAssigned

CapabilitySelected

ClassificationReviewed

Every classification emits Events.

\---

\# Required Tables

task\_types

task\_classifications

task\_complexity

task\_risk

task\_capabilities

task\_dependencies

task\_metrics

classification\_events

\---

\# TypeScript Interfaces

Task

TaskType

TaskClassification

ComplexityLevel

RiskLevel

CapabilityMap

TaskDependency

\---

\# APIs

ClassifyTask()

SplitTask()

MergeTask()

AssignComplexity()

AssignRisk()

ResolveCapabilities()

SearchTaskTypes()

\---

\# Performance Goals

Support

Real-time classification

Recursive decomposition

Policy-aware classification

Low-latency execution

Deterministic routing

Parallel task generation

\---

\# Acceptance Criteria

Implementation is complete when

\- Every request receives a primary task classification.  
\- Complexity is assigned before routing.  
\- Risk is assigned independently.  
\- Capabilities remain Registry-driven.  
\- Large requests decompose automatically.  
\- Tasks remain model-independent.  
\- Events are emitted.  
\- APIs remain versioned.  
\- Audit is complete.  
\- Planning always follows classification.

\---

\# ADR Candidates

Task taxonomy

Complexity algorithm

Risk model

Decomposition strategy

Capability mapping

Priority engine

\---

\# End RFC-4002

\# RFC-4003  
\# Context Pack Builder

Status

Draft 1.0

Owner

Auric Works

Authority

\- Dispatch Constitution  
\- RFC-2000  
\- RFC-4002

Applies To

Every model execution, agent execution, workflow, recommendation, publication, and intelligent operation within Dispatch.

\---

\# Purpose

The Context Pack Builder constructs the complete operational context required for execution.

No model.

No agent.

No tool.

No human task

receives direct access to the Knowledge Graph.

Everything receives a Context Pack.

\---

\# Philosophy

LLMs should never search.

LLMs should never browse.

LLMs should never assemble context.

Dispatch performs those responsibilities before execution begins.

The model reasons.

Dispatch prepares.

\---

\# Core Principle

Every execution receives exactly the information it needs.

Nothing more.

Nothing less.

Context quality is more important than model quality.

\---

\# Canonical Flow

\`\`\`text  
Request

↓

Task Classification

↓

Working Graph

↓

Assembly Rules

↓

Policy Filters

↓

Memory

↓

Evidence

↓

Goals

↓

Context Pack

↓

Execution  
\`\`\`

Context is assembled before reasoning.

Always.

\---

\# Canonical Definition

A Context Pack is a temporary, immutable execution package containing every object, relationship, fact, memory, policy, workflow state, and execution constraint required for one task.

Context Packs are disposable.

Knowledge is permanent.

\---

\# Context Components

Every Context Pack contains

Request

Goal

Working Graph

Relevant Objects

Relationships

Verified Facts

Supporting Evidence

Memory

Policies

Workflow State

Budget

Constraints

Success Criteria

Failure Criteria

Execution Metadata

\---

\# Object Selection

Objects are selected using

Entry Entity

Relationship Traversal

Task Type

Workflow

Audience

Cartridge

Policy

Only relevant Objects are included.

\---

\# Relationship Selection

Relationships are filtered by

Strength

Confidence

Freshness

Operational Relevance

Distance

Policy

Business Importance

Relationship overload is avoided.

\---

\# Truth Selection

Only verified Facts enter the Context Pack.

Claims remain excluded unless explicitly requested.

Inferences are clearly marked.

Recommendations remain downstream artifacts.

\---

\# Memory Selection

Memory retrieval evaluates

Scope

Tenant

Permissions

Freshness

Reference Frequency

Workflow

Semantic Similarity

Memory is contextual.

Not exhaustive.

\---

\# Policy Selection

Applicable policies include

Security

Routing

Privacy

Budget

Approval

Retention

Visibility

Jurisdiction

Execution never occurs without policy.

\---

\# Goal Definition

Every Context Pack declares

Primary Goal

Secondary Goals

Success Criteria

Failure Conditions

Evaluation Metrics

The model never infers goals.

\---

\# Constraints

Every execution receives

Cost Budget

Latency Budget

Privacy Level

Risk Level

Approval Requirements

Maximum Complexity

Allowed Capabilities

Constraints are executable.

\---

\# Context Windows

The Builder creates bounded windows.

Example

Institution

↓

CEO

↓

Core Provider

↓

Current Initiatives

↓

Open Opportunities

↓

Relevant Facts

↓

Relevant Memory

↓

Recommendations

Everything else remains outside execution.

\---

\# Context Compression

Large graphs compress through

Ranking

Deduplication

Summarization

Aggregation

Relationship pruning

Evidence references

Compression never removes truth.

Only representation.

\---

\# Determinism

Two identical requests

with identical graph state

must produce

identical Context Packs.

Random context assembly is prohibited.

\---

\# Versioning

Every Context Pack records

Assembly Version

Knowledge Graph Version

Policy Version

Prompt Version

Memory Version

Context Version

Execution remains reproducible.

\---

\# Context Lifecycle

\`\`\`text  
Requested

↓

Assembled

↓

Validated

↓

Consumed

↓

Evaluated

↓

Archived  
\`\`\`

Context Packs are immutable after assembly.

\---

\# Context Events

ContextRequested

ContextBuilt

ContextValidated

ContextConsumed

ContextExpired

ContextArchived

AssemblyFailed

Every Context Pack emits Events.

\---

\# Required Tables

context\_packs

context\_versions

context\_objects

context\_relationships

context\_memory

context\_constraints

context\_metrics

context\_events

\---

\# TypeScript Interfaces

ContextPack

ContextObject

ContextRelationship

ContextConstraint

ContextGoal

ContextPolicy

ContextMetadata

\---

\# APIs

BuildContextPack()

ValidateContext()

RetrieveContext()

ArchiveContext()

CompareContexts()

ExplainContext()

InvalidateContext()

\---

\# Performance Goals

Support

Sub-second assembly

Deterministic generation

Large graph compression

Policy-aware filtering

Incremental refresh

Replay compatibility

\---

\# Acceptance Criteria

Implementation is complete when

\- Every intelligent execution consumes a Context Pack.  
\- Models never query the graph directly.  
\- Context Packs remain immutable.  
\- Context assembly is deterministic.  
\- Policies are automatically applied.  
\- Memory is context-aware.  
\- Constraints accompany every execution.  
\- Events are emitted.  
\- APIs remain versioned.  
\- Audit is complete.

\---

\# ADR Candidates

Context schema

Compression strategy

Ranking algorithm

Deterministic assembly

Context versioning

Memory prioritization

\---

\# End RFC-4003

\# RFC-4004  
\# Execution Planner

Status

Draft 1.0

Owner

Auric Works

Authority

\- Dispatch Constitution  
\- RFC-2000  
\- RFC-4003

Applies To

Every intelligent task executed by the Agent Harness.

\---

\# Purpose

The Execution Planner transforms classified work into executable plans.

The Planner does not perform work.

The Planner determines

what work,

in what order,

using which capabilities,

under which constraints,

to achieve an operational objective.

\---

\# Philosophy

Requests are ambiguous.

Execution is not.

The Planner converts ambiguity into deterministic operational plans.

Planning is independent from execution.

Execution engines may change.

Plans remain stable.

\---

\# Core Principle

The Planner creates plans.

Agents execute plans.

Tools perform work.

Models compute.

Humans approve.

No component performs another's responsibility.

\---

\# Canonical Flow

\`\`\`text  
Request

↓

Task Classification

↓

Context Pack

↓

Execution Goals

↓

Plan Generation

↓

Dependency Graph

↓

Capability Assignment

↓

Execution Graph

↓

Runtime  
\`\`\`

Planning always precedes execution.

\---

\# Canonical Definition

An Execution Plan is a directed acyclic graph (DAG) of executable tasks with defined dependencies, constraints, evaluation criteria, and recovery paths.

Execution Plans are immutable once execution begins.

Replanning creates a new version.

\---

\# Planning Components

Every Execution Plan contains

Plan UUID

Request

Primary Goal

Subtasks

Dependencies

Capabilities

Required Tools

Required Models

Required Humans

Policies

Budget

Risk

Expected Outputs

Evaluation Criteria

Recovery Strategy

Version

\---

\# Plan Types

Single Task

Linear Workflow

Parallel Workflow

Multi-Agent

Human Approval

Connector Pipeline

Publication

Continuous Monitoring

Composite Plan

Cartridges may define additional plan templates.

\---

\# Planning Goals

Every plan defines

Primary Objective

Success Criteria

Failure Conditions

Completion Conditions

Escalation Conditions

Timeouts

Goals are explicit.

Never inferred.

\---

\# Task Graph

Execution Plans form a DAG.

\`\`\`text  
Task A

↓

Task B

↓

Task C

↘

Task D

↓

Task E  
\`\`\`

Cycles are prohibited.

\---

\# Parallelism

Independent tasks execute simultaneously.

Examples

Extract

Retrieve

Normalize

Classify

These should execute in parallel whenever dependencies permit.

The Planner maximizes safe concurrency.

\---

\# Dependencies

Dependencies may include

Task completion

Connector availability

Human approval

Policy approval

Workflow state

Time

External event

Dependencies are explicit.

\---

\# Capability Assignment

The Planner assigns

Capabilities.

Not implementations.

Example

Extract Entity

↓

Capability

↓

Tool Router

↓

Implementation

Capability selection precedes routing.

\---

\# Planning Constraints

Plans respect

Budget

Latency

Privacy

Jurisdiction

Policy

Risk

Human availability

Execution environment

Constraints are executable.

\---

\# Replanning

Execution may trigger replanning when

New facts arrive

Dependencies fail

Budgets change

Policies change

Human intervention occurs

Replanning creates

Plan Version N+1

History remains intact.

\---

\# Recovery Planning

Every plan defines

Retry Strategy

Fallback Strategy

Alternative Capability

Alternative Model

Human Escalation

Termination Criteria

Recovery is planned.

Not improvised.

\---

\# Human Participation

Humans are planned resources.

Examples

Approve

Review

Annotate

Interview

Negotiate

Validate

Humans appear as executable nodes.

\---

\# Continuous Plans

Some plans never terminate.

Examples

Market Monitoring

Institution Monitoring

News Monitoring

Relationship Monitoring

Connector Health

These become long-running workflows.

\---

\# Plan Events

PlanCreated

PlanValidated

PlanApproved

PlanStarted

PlanReplanned

PlanCompleted

PlanFailed

PlanArchived

Every plan transition emits Events.

\---

\# Required Tables

execution\_plans

plan\_versions

plan\_nodes

plan\_dependencies

plan\_constraints

plan\_templates

plan\_metrics

plan\_events

\---

\# TypeScript Interfaces

ExecutionPlan

PlanNode

PlanDependency

PlanConstraint

PlanGoal

PlanTemplate

RecoveryStrategy

\---

\# APIs

CreatePlan()

ValidatePlan()

Replan()

CancelPlan()

ArchivePlan()

EstimatePlanCost()

ExplainPlan()

SearchPlans()

\---

\# Performance Goals

Support

Sub-second planning

Large DAGs

Automatic parallelization

Incremental replanning

Deterministic plans

Replay compatibility

\---

\# Acceptance Criteria

Implementation is complete when

\- Every execution begins with a plan.  
\- Plans are DAGs.  
\- Parallel work is identified automatically.  
\- Capabilities remain implementation-independent.  
\- Recovery is preplanned.  
\- Humans are first-class execution nodes.  
\- Replanning creates new versions.  
\- Events are emitted.  
\- APIs remain versioned.  
\- Audit is complete.

\---

\# ADR Candidates

Planning algorithm

DAG representation

Parallel scheduling

Replanning strategy

Recovery model

Constraint solver

\---

\# End RFC-4004

\# RFC-4005  
\# Tool Router

Status

Draft 1.0

Owner

Auric Works

Authority

\- Dispatch Constitution  
\- RFC-2000  
\- RFC-4004

Applies To

Every connector, API, service, model tool, workflow action, SDK, and external capability executed by Dispatch.

\---

\# Purpose

The Tool Router selects the best implementation for an execution capability.

The Planner determines

what needs to happen.

The Tool Router determines

how it happens.

It chooses tools.

Never goals.

\---

\# Philosophy

Capabilities are permanent.

Tools are replaceable.

Dispatch routes to capabilities.

Not vendors.

A capability may have

One

Many

or

Zero

tool implementations.

\---

\# Core Principle

The Tool Router selects the cheapest sufficient capability implementation that satisfies policy, privacy, cost, latency, and quality requirements.

Tool selection is deterministic whenever possible.

\---

\# Canonical Flow

\`\`\`text  
Execution Plan

↓

Capability

↓

Registry Lookup

↓

Candidate Tools

↓

Policy Evaluation

↓

Cost Evaluation

↓

Health Evaluation

↓

Selection

↓

Execution  
\`\`\`

The Tool Router never executes.

It only selects.

\---

\# Canonical Definition

A Tool is any executable capability registered with Dispatch that performs deterministic or bounded work.

Examples include

Internal Services

APIs

Connectors

Search Engines

SQL

OCR

Email

Calendars

File Storage

LLM Functions

SDK Actions

MCP Servers

\---

\# Tool Categories

Kernel

Connector

Internal Service

Third-Party API

Database

Filesystem

Model Tool

Communication

Publication

Analysis

Utility

Human

Every tool belongs to exactly one category.

\---

\# Capability Mapping

Examples

Capability

↓

Search Institution

↓

Possible Tools

SQL

Hybrid Search

Knowledge Graph

NCUA Connector

Capability

↓

Send Email

↓

SMTP

Microsoft

Google

Internal Queue

Capabilities remain stable.

Tools evolve.

\---

\# Tool Registry

Every tool registers

UUID

Name

Version

Capabilities

Inputs

Outputs

Permissions

Latency

Cost

Availability

Health

Dependencies

Supported Tenants

Tool metadata is Registry-driven.

\---

\# Tool Selection Inputs

Capability

Policy

Privacy

Latency Budget

Cost Budget

Tenant

Jurisdiction

Availability

Historical Success

Health

Execution Environment

\---

\# Routing Strategy

Selection evaluates

Capability Match

↓

Policy

↓

Permissions

↓

Health

↓

Cost

↓

Latency

↓

Historical Performance

↓

Selection

No random routing.

\---

\# Tool Health

Healthy

Degraded

Offline

Maintenance

Deprecated

Retired

Health affects routing.

Never registration.

\---

\# Tool Scoring

Every candidate receives

Capability Score

Policy Score

Health Score

Latency Score

Cost Score

Reliability Score

Composite Score

The highest valid score wins.

\---

\# Fallbacks

If execution fails

↓

Retry

↓

Alternative Tool

↓

Alternative Capability

↓

Human

↓

Failure

Fallback chains are precomputed.

\---

\# Tool Chains

A capability may require

multiple tools.

Example

Retrieve

↓

OCR

↓

Entity Extraction

↓

Knowledge Graph

↓

Workflow

Tool chains remain execution graphs.

\---

\# Permissions

Every tool declares

Allowed Tenants

Required Permissions

Required Secrets

Data Residency

Execution Scope

The Router enforces permissions before execution.

\---

\# Human Tools

Humans are tools.

Capabilities include

Review

Approval

Interview

Negotiation

Analysis

Decision

Humans participate through the same routing model.

\---

\# Tool Events

ToolSelected

ToolRejected

ToolExecuted

ToolFailed

FallbackActivated

HealthChanged

ToolDeprecated

Every routing decision emits Events.

\---

\# Required Tables

tools

tool\_versions

tool\_capabilities

tool\_health

tool\_scores

tool\_history

tool\_metrics

tool\_events

\---

\# TypeScript Interfaces

Tool

ToolCapability

ToolSelection

ToolHealth

ToolScore

ToolChain

ToolExecutionContext

\---

\# APIs

RegisterTool()

ResolveCapability()

SelectTool()

EvaluateTool()

SearchTools()

GetToolHealth()

DeprecateTool()

\---

\# Performance Goals

Support

Sub-50ms tool selection

Parallel candidate evaluation

Automatic fallback

Registry-driven routing

Capability abstraction

Deterministic selection

\---

\# Acceptance Criteria

Implementation is complete when

\- Capabilities remain independent of implementations.  
\- Tool selection is Registry-driven.  
\- Routing evaluates policy before cost.  
\- Health influences routing.  
\- Fallback chains exist.  
\- Humans participate as executable resources.  
\- Events are emitted.  
\- APIs remain versioned.  
\- Audit is complete.  
\- Tool implementations remain replaceable.

\---

\# ADR Candidates

Capability abstraction

Routing algorithm

Fallback strategy

Tool scoring

Health model

Execution environments

\---

\# End RFC-4005

\# RFC-4006  
\# Model Router

Status

Draft 1.0

Owner

Auric Works

Authority

\- Dispatch Constitution  
\- RFC-2000  
\- RFC-4005

Applies To

Every AI model executed by Dispatch.

\---

\# Purpose

The Model Router selects the optimal computational resource for a task after the Planner has defined the work and the Tool Router has determined that model execution is required.

The Model Router chooses computation.

It never chooses objectives.

\---

\# Philosophy

Dispatch is model-independent.

Models are infrastructure.

Providers compete.

Dispatch does not.

A model is simply one implementation of an Intelligence Capability.

\---

\# Core Principle

Always execute with the cheapest sufficient intelligence.

Never the smartest.

Never the newest.

Never the most expensive.

The best execution is the one that satisfies quality requirements while minimizing cost, latency, and operational complexity.

\---

\# Canonical Flow

\`\`\`text  
Execution Plan

↓

Capability

↓

Tool Router

↓

Model Required?

↓

Model Registry

↓

Candidate Models

↓

Policy Evaluation

↓

Complexity Match

↓

Selection

↓

Execution  
\`\`\`

Model selection occurs only after planning.

\---

\# Model Definition

A Model is a computational engine capable of performing one or more Intelligence Capabilities.

Models are

Replaceable

Versioned

Measured

Evaluated

Registry-driven

\---

\# Intelligence Capabilities

Extraction

Classification

Matching

Retrieval Assistance

Summarization

Planning

Comparison

Reasoning

Generation

Evaluation

Translation

Vision

Speech

Embeddings

Tool Use

Future capabilities extend through the Registry.

\---

\# Routing Inputs

Capability

Task Complexity

Risk

Privacy

Budget

Latency

Tenant Policy

Context Size

Evaluation History

Provider Health

Model Availability

\---

\# Complexity Mapping

Level 0

Rules

No Model

\---

Level 1

Tiny Local Models

Embedding Models

Extraction Models

\---

Level 2

Open Local Models

Small Frontier Models

Routine reasoning

\---

Level 3

Large Frontier Models

Strategic planning

Complex comparison

\---

Level 4

Multi-Agent Reasoning

Long-horizon planning

Institutional intelligence

\---

Level 5

Human Decision

The Router never escalates beyond policy.

\---

\# Model Registry

Every model defines

UUID

Provider

Version

Capabilities

Context Window

Latency

Cost

Privacy

Supported Modalities

Evaluation Scores

Health

Availability

Licensing

\---

\# Provider Independence

The Router never references

OpenAI

Anthropic

Google

Meta

Mistral

Open-source

directly in execution logic.

Providers are Registry entries.

Nothing more.

\---

\# Selection Criteria

Models are scored using

Capability Match

Evaluation Score

Latency

Cost

Availability

Privacy

Historical Success

Current Load

Context Fit

Composite Score

Highest valid score wins.

\---

\# Routing Policies

Policies may require

Local Only

US Only

No External Models

Maximum Cost

Maximum Latency

Specific Providers

Human Approval

Policies override scoring.

\---

\# Model Chaining

One execution may use multiple models.

Example

Extraction Model

↓

Reasoning Model

↓

Evaluation Model

↓

Summarization Model

Each performs one capability.

\---

\# Context Management

The Router validates

Context Size

↓

Compression

↓

Chunking

↓

Retrieval

↓

Execution

The Router never truncates silently.

\---

\# Evaluation Feedback

Every execution records

Expected Result

Actual Result

Latency

Cost

Human Rating

Success

Failure

Confidence

Routing continuously improves.

\---

\# Fallback Strategy

Primary Model

↓

Retry

↓

Equivalent Model

↓

Alternative Provider

↓

Human

↓

Failure

Fallbacks are deterministic.

\---

\# Model Health

Healthy

Degraded

Unavailable

Maintenance

Deprecated

Retired

Health affects routing.

Never registration.

\---

\# Model Events

ModelSelected

ModelRejected

ModelExecuted

ModelFailed

FallbackActivated

EvaluationCompleted

ProviderUnavailable

Every decision emits Events.

\---

\# Required Tables

models

model\_versions

model\_capabilities

model\_health

model\_scores

model\_history

model\_metrics

model\_events

provider\_registry

\---

\# TypeScript Interfaces

Model

ModelCapability

ModelSelection

ModelEvaluation

Provider

ModelHealth

ExecutionEstimate

\---

\# APIs

RegisterModel()

SelectModel()

EvaluateModel()

EstimateExecution()

SearchModels()

DeprecateModel()

GetProviderHealth()

\---

\# Performance Goals

Support

Sub-25ms routing

Automatic provider failover

Policy-aware execution

Parallel evaluation

Dynamic model replacement

Continuous optimization

\---

\# Acceptance Criteria

Implementation is complete when

\- Models remain completely interchangeable.  
\- Providers are Registry-defined.  
\- Routing follows "cheapest sufficient intelligence."  
\- Policies override scoring.  
\- Evaluation continuously improves routing.  
\- Context limits are enforced safely.  
\- Multi-model execution is supported.  
\- Events are emitted.  
\- APIs remain versioned.  
\- Audit is complete.

\---

\# ADR Candidates

Routing algorithm

Provider abstraction

Context compression

Evaluation framework

Fallback policy

Cost optimization

\---

\# End RFC-4006

\# RFC-4007  
\# Multi-Agent Runtime

Status

Draft 1.0

Owner

Auric Works

Authority

\- Dispatch Constitution  
\- RFC-2000  
\- RFC-4006

Applies To

Every coordinated execution involving more than one agent inside Dispatch.

\---

\# Purpose

The Multi-Agent Runtime coordinates specialized agents to execute complex operational work.

Agents do not collaborate freely.

The Runtime coordinates them.

The Runtime owns

Scheduling

Communication

State

Execution

Evaluation

Recovery

Agents remain workers.

The Runtime remains the foreman.

\---

\# Philosophy

Dispatch does not create "AI employees."

Dispatch creates specialized execution workers.

Every agent has

One responsibility.

One capability.

One output.

Complexity comes from orchestration.

Not smarter agents.

\---

\# Core Principle

Agents are disposable.

The Runtime is permanent.

Knowledge lives in Dispatch.

State lives in Dispatch.

Memory lives in Dispatch.

Agents own nothing.

\---

\# Canonical Flow

\`\`\`text  
Execution Plan

↓

Planner

↓

Agent Graph

↓

Runtime

↓

Agent Execution

↓

Aggregation

↓

Evaluation

↓

Workflow

↓

Knowledge Graph Update  
\`\`\`

Agents never communicate directly.

\---

\# Agent Definition

An Agent is a stateless execution unit responsible for performing one well-defined capability.

Agents receive

Context Pack

Goal

Constraints

Capability

Expected Output

Nothing more.

\---

\# Agent Categories

Planner

Research

Retriever

Extractor

Classifier

Reasoner

Evaluator

Reviewer

Writer

Publisher

Connector

Workflow

Communication

Monitoring

Human Proxy

Cartridges may register additional agents.

\---

\# Agent Lifecycle

\`\`\`text  
Created

↓

Assigned

↓

Executing

↓

Completed

↓

Evaluated

↓

Destroyed  
\`\`\`

Agents never persist beyond execution.

\---

\# Agent Graph

The Runtime builds an execution graph.

Example

Planner

↓

Retriever

↓

Research

↓

Reasoner

↓

Reviewer

↓

Writer

↓

Evaluator

↓

Workflow

Execution follows dependency order.

\---

\# Communication

Agents never exchange messages.

They exchange

Structured Outputs

through

Dispatch Objects.

Communication is mediated by the Runtime.

Never peer-to-peer.

\---

\# Shared State

Shared state exists only inside Dispatch.

Agents may read

Working Graph

Context Pack

Execution Outputs

Policies

Workflow State

Agents may never create hidden memory.

\---

\# Agent Contracts

Every agent declares

Inputs

Outputs

Capabilities

Dependencies

Timeout

Cost Estimate

Evaluation Method

Retry Policy

Agent contracts are Registry-driven.

\---

\# Coordination

The Runtime manages

Scheduling

Parallelization

Synchronization

Retries

Aggregation

Timeouts

Recovery

No agent self-coordinates.

\---

\# Parallel Execution

Independent agents execute simultaneously.

Example

Retrieve

↓

Extract

↓

Search

↓

Normalize

↓

Merge

The Runtime determines concurrency.

\---

\# Aggregation

Multiple outputs become

Structured Objects.

Not conversations.

Aggregation preserves

Evidence

Confidence

Sources

Execution History

No information is discarded.

\---

\# Evaluation

Every agent execution measures

Correctness

Latency

Cost

Confidence

Completeness

Human Rating

Evaluation improves routing.

\---

\# Recovery

Agent failure triggers

Retry

↓

Alternative Agent

↓

Alternative Capability

↓

Human

↓

Workflow Failure

Recovery belongs to the Runtime.

\---

\# Human Agents

Humans participate through

Review

Approval

Negotiation

Decision

Investigation

Interview

Humans follow identical execution contracts.

\---

\# Agent Registry

Every agent registers

UUID

Version

Capability

Inputs

Outputs

Dependencies

Policies

Evaluation

Health

Owner

\---

\# Runtime Events

AgentCreated

AgentAssigned

AgentStarted

AgentCompleted

AgentFailed

AgentRetried

AgentEvaluated

AgentDestroyed

AggregationCompleted

Every execution emits Events.

\---

\# Required Tables

agents

agent\_versions

agent\_runtime

agent\_executions

agent\_outputs

agent\_health

agent\_metrics

agent\_events

agent\_graphs

\---

\# TypeScript Interfaces

Agent

AgentExecution

AgentGraph

AgentOutput

AgentCapability

AgentEvaluation

AgentHealth

\---

\# APIs

RegisterAgent()

CreateAgentGraph()

ExecuteAgent()

ExecuteAgentGraph()

EvaluateAgent()

RetryAgent()

DestroyAgent()

SearchAgents()

\---

\# Performance Goals

Support

Thousands of concurrent agents

Automatic parallelization

Deterministic scheduling

Stateless execution

Replay compatibility

Automatic recovery

Sub-second orchestration overhead

\---

\# Acceptance Criteria

Implementation is complete when

\- Agents remain stateless.  
\- The Runtime owns orchestration.  
\- Communication is mediated by Dispatch.  
\- Shared state never exists inside agents.  
\- Parallel execution functions.  
\- Aggregation preserves provenance.  
\- Recovery is automatic.  
\- Human participants use identical contracts.  
\- Events are emitted.  
\- APIs remain versioned.  
\- Audit is complete.

\---

\# ADR Candidates

Agent lifecycle

Execution graph

Aggregation engine

Concurrency model

Runtime scheduler

Human agent abstraction

\---

\# End RFC-4007

\# RFC-4008  
\# Prompt Registry

Status

Draft 1.0

Owner

Auric Works

Authority

\- Dispatch Constitution  
\- RFC-2000  
\- RFC-4007

Applies To

Every prompt, instruction set, system prompt, cartridge prompt, publication prompt, workflow prompt, and agent prompt executed by Dispatch.

\---

\# Purpose

The Prompt Registry manages prompts as versioned operational assets.

Prompts are not embedded in code.

Prompts are configuration.

Prompt engineering becomes software engineering.

\---

\# Philosophy

Models change.

Prompts evolve.

Business logic must never live inside prompts.

Prompts describe

how to perform work.

The Knowledge Graph describes

what is true.

\---

\# Core Principle

Prompts are replaceable.

Capabilities are permanent.

Agents request prompt templates.

The Registry supplies them.

\---

\# Canonical Flow

\`\`\`text  
Execution Plan

↓

Capability

↓

Agent

↓

Prompt Registry

↓

Prompt Assembly

↓

Context Pack

↓

Execution  
\`\`\`

Prompts are assembled.

Never hardcoded.

\---

\# Canonical Definition

A Prompt is a versioned execution template describing how a capability should be performed under a specific context.

Prompts never contain

Secrets

Business Truth

Persistent Memory

Customer Data

Those arrive through Context Packs.

\---

\# Prompt Components

Every prompt contains

UUID

Name

Capability

Agent

Version

Instructions

Variables

Expected Inputs

Expected Outputs

Constraints

Evaluation Criteria

Owner

Status

\---

\# Prompt Categories

System

Capability

Cartridge

Publication

Evaluation

Workflow

Connector

Reasoning

Extraction

Planning

Communication

Administrative

\---

\# Prompt Variables

Variables are injected from

Context Pack

Workflow

Policies

Execution Plan

Tenant

Cartridge

Runtime

Prompts remain reusable.

\---

\# Prompt Assembly

Final execution prompt equals

Base Prompt

\+

Capability Prompt

\+

Cartridge Prompt

\+

Policy Prompt

\+

Context Pack

\+

Execution Metadata

Assembly is deterministic.

\---

\# Versioning

Every prompt is immutable.

Changes create

New Versions.

Historical executions always reference the version used.

\---

\# Prompt Evaluation

Every execution measures

Correctness

Latency

Cost

Human Rating

Goal Completion

Failure Rate

Prompt quality continuously improves.

\---

\# Prompt Policies

Policies may require

Approved Versions

Human Review

Specific Providers

Restricted Variables

Maximum Context

Jurisdiction

Policy enforcement precedes execution.

\---

\# Prompt Events

PromptRegistered

PromptUpdated

PromptDeprecated

PromptSelected

PromptExecuted

PromptEvaluated

PromptArchived

Every lifecycle event is recorded.

\---

\# Required Tables

prompts

prompt\_versions

prompt\_variables

prompt\_capabilities

prompt\_metrics

prompt\_evaluations

prompt\_events

prompt\_registry

\---

\# TypeScript Interfaces

Prompt

PromptVersion

PromptVariable

PromptTemplate

PromptEvaluation

PromptExecution

PromptMetadata

\---

\# APIs

RegisterPrompt()

ResolvePrompt()

AssemblePrompt()

EvaluatePrompt()

DeprecatePrompt()

SearchPrompts()

ArchivePrompt()

\---

\# Performance Goals

Support

Deterministic assembly

Versioned execution

Prompt reuse

Rapid iteration

Replay compatibility

Evaluation-driven improvement

\---

\# Acceptance Criteria

Implementation is complete when

\- Prompts are Registry-managed.  
\- No prompts are hardcoded.  
\- Context is injected externally.  
\- Business logic remains outside prompts.  
\- Version history is preserved.  
\- Evaluation improves prompt selection.  
\- Events are emitted.  
\- APIs remain versioned.  
\- Audit is complete.  
\- Prompt execution is fully reproducible.

\---

\# ADR Candidates

Prompt composition

Variable injection

Prompt versioning

Evaluation framework

Registry architecture

Prompt lifecycle

\---

\# End RFC-4008

\# RFC-4009  
\# Execution Engine

Status

Draft 1.0

Owner

Auric Works

Authority

\- Dispatch Constitution  
\- RFC-2000  
\- RFC-4008

Applies To

Every task, plan, workflow, agent, tool, connector, and model execution inside Dispatch.

\---

\# Purpose

The Execution Engine is responsible for carrying out approved Execution Plans.

The Planner decides.

The Router selects.

The Runtime coordinates.

The Execution Engine executes.

Execution is deterministic wherever possible and observable everywhere.

\---

\# Philosophy

Execution is not conversation.

Execution is operational work.

Every execution should produce measurable outcomes, update the Knowledge Graph, and improve future execution.

Execution without learning is waste.

\---

\# Core Principle

Execution follows the Plan.

The Engine never invents work.

It executes the approved DAG produced by the Planner.

If the plan changes, a new plan version is created.

\---

\# Canonical Flow

\`\`\`text  
Execution Plan

↓

Execution Graph

↓

Node Scheduler

↓

Capability Execution

↓

Output Validation

↓

Evaluation

↓

Workflow Update

↓

Knowledge Graph Update

↓

Completion  
\`\`\`

Execution is stateful.

Reasoning is stateless.

\---

\# Execution Unit

The smallest executable component is a Node.

A Node represents

One Capability

One Expected Output

One Evaluation Contract

One Completion State

\---

\# Node Lifecycle

Queued

↓

Ready

↓

Running

↓

Completed

↓

Evaluated

↓

Committed

↓

Archived

Failed nodes never silently disappear.

\---

\# Execution Types

Deterministic

Tool

Connector

Model

Human

Hybrid

Workflow

Monitoring

Streaming

Every node declares its execution type.

\---

\# Scheduler

The Scheduler manages

Dependencies

Parallel execution

Priority

Resource limits

Retries

Timeouts

Cancellation

The Scheduler owns execution order.

\---

\# State Management

Execution state records

Current Node

Completed Nodes

Blocked Nodes

Retry Count

Elapsed Time

Cost

Outputs

Events

State belongs to Dispatch.

Not agents.

\---

\# Output Validation

Every completed node validates

Schema

Completeness

Confidence

Policy

Permissions

Expected Output

Invalid outputs never advance the plan.

\---

\# Commit Rules

Successful outputs become

Workflow State

Knowledge Graph Updates

Events

Metrics

Audit Records

Commit occurs only after validation.

\---

\# Timeouts

Every node declares

Maximum Runtime

Retry Window

Escalation Timeout

Termination Timeout

Timeouts are policy-driven.

\---

\# Cancellation

Execution may stop because of

User Request

Policy

Budget

Human Decision

Dependency Failure

System Failure

Cancellation preserves history.

\---

\# Streaming Execution

Long-running execution supports

Progress Events

Partial Results

Checkpointing

Resumption

Streaming nodes remain observable.

\---

\# Resource Management

Track

CPU

Memory

Tokens

API Calls

Storage

Network

Cost

Resource usage becomes operational telemetry.

\---

\# Execution Events

ExecutionStarted

NodeStarted

NodeCompleted

NodeFailed

NodeRetried

ExecutionPaused

ExecutionCancelled

ExecutionCommitted

ExecutionCompleted

Every transition emits Events.

\---

\# Required Tables

executions

execution\_nodes

execution\_state

execution\_outputs

execution\_metrics

execution\_resources

execution\_events

execution\_history

\---

\# TypeScript Interfaces

Execution

ExecutionNode

ExecutionState

ExecutionOutput

ExecutionResult

ExecutionMetrics

ExecutionResources

\---

\# APIs

StartExecution()

PauseExecution()

ResumeExecution()

CancelExecution()

CommitExecution()

GetExecutionStatus()

ReplayExecution()

SearchExecutions()

\---

\# Performance Goals

Support

Millions of executions

Parallel node scheduling

Deterministic replay

Incremental commits

Real-time progress

Checkpoint recovery

Low orchestration overhead

\---

\# Acceptance Criteria

Implementation is complete when

\- Every execution follows an approved plan.  
\- Node execution is independently observable.  
\- Outputs validate before commit.  
\- Execution state survives failures.  
\- Streaming execution is supported.  
\- Resource usage is measured.  
\- Events are emitted.  
\- APIs remain versioned.  
\- Replay reproduces execution.  
\- Audit is complete.

\---

\# ADR Candidates

Execution scheduler

Commit protocol

Checkpoint model

Streaming execution

Replay engine

Resource accounting

\---

\# End RFC-4009

\# RFC-4010  
\# Evaluation Engine

Status

Draft 1.0

Owner

Auric Works

Authority

\- Dispatch Constitution  
\- RFC-2000  
\- RFC-4009

Applies To

Every execution, workflow, agent, tool, model, connector, publication, recommendation, and operational outcome produced by Dispatch.

\---

\# Purpose

The Evaluation Engine determines whether execution accomplished its objective.

Execution answers

"What happened?"

Evaluation answers

"How well did it happen?"

Every execution improves Dispatch.

Nothing executes without evaluation.

\---

\# Philosophy

Execution without measurement creates entropy.

Evaluation creates operational learning.

Learning improves

Routing

Planning

Prompting

Tool Selection

Model Selection

Recommendations

Operational Capacity

\---

\# Core Principle

Every execution receives an evaluation.

No exceptions.

Evaluation is continuous.

Not periodic.

\---

\# Canonical Flow

\`\`\`text  
Execution

↓

Outputs

↓

Validation

↓

Evaluation

↓

Scorecard

↓

Knowledge Graph

↓

Routing Improvement

↓

Future Execution  
\`\`\`

Evaluation always follows execution.

\---

\# Evaluation Definition

An Evaluation is a structured assessment of execution quality against predefined success criteria.

Evaluations are

Versioned

Auditable

Explainable

Comparable

Historical

\---

\# Evaluation Components

Every evaluation contains

UUID

Execution

Plan

Task

Capability

Expected Result

Actual Result

Evaluation Criteria

Score

Confidence

Reviewer

Timestamp

Recommendations

\---

\# Evaluation Categories

Correctness

Completeness

Accuracy

Latency

Cost

Efficiency

Reliability

Consistency

Policy Compliance

Human Satisfaction

Business Outcome

Every execution receives one or more categories.

\---

\# Scoring

Each evaluation produces

Raw Scores

↓

Weighted Scores

↓

Composite Score

↓

Historical Comparison

↓

Routing Feedback

Scoring formulas remain Registry-defined.

\---

\# Human Evaluation

Humans may evaluate

Outputs

Plans

Recommendations

Publications

Agent Behavior

Workflow Results

Human review becomes operational knowledge.

\---

\# Automatic Evaluation

The Engine supports

Schema Validation

Rule Validation

Policy Validation

Regression Testing

Fact Verification

Graph Integrity

Benchmark Comparison

Most evaluations should be automatic.

\---

\# Benchmarking

Execution compares against

Historical Runs

Organization Baselines

Capability Baselines

Model Baselines

Tool Baselines

Institution Benchmarks

Performance compounds over time.

\---

\# Learning Loop

Evaluation updates

Planner

↓

Tool Router

↓

Model Router

↓

Prompt Registry

↓

Policies

↓

Knowledge Graph

Evaluation improves the entire platform.

\---

\# Failure Analysis

Every failure records

Cause

Root Cause

Recovery

Impact

Recommendation

Prevention

Failures improve future planning.

\---

\# Evaluation Lifecycle

\`\`\`text  
Pending

↓

Running

↓

Completed

↓

Reviewed

↓

Committed

↓

Historical  
\`\`\`

Evaluations are immutable after commitment.

\---

\# Evaluation Events

EvaluationStarted

EvaluationCompleted

EvaluationReviewed

BenchmarkUpdated

FailureRecorded

ScoreAdjusted

LearningApplied

Every evaluation emits Events.

\---

\# Required Tables

evaluations

evaluation\_scores

evaluation\_rules

evaluation\_history

evaluation\_reviews

evaluation\_benchmarks

evaluation\_metrics

evaluation\_events

\---

\# TypeScript Interfaces

Evaluation

EvaluationScore

EvaluationRule

EvaluationBenchmark

EvaluationReview

EvaluationResult

LearningUpdate

\---

\# APIs

EvaluateExecution()

ScoreExecution()

ReviewEvaluation()

CompareBenchmarks()

ApplyLearning()

SearchEvaluations()

GenerateScorecard()

\---

\# Performance Goals

Support

Real-time evaluation

Automatic scoring

Historical benchmarking

Continuous learning

Low-latency feedback

Large-scale analytics

\---

\# Acceptance Criteria

Implementation is complete when

\- Every execution receives an evaluation.  
\- Automatic evaluation is the default.  
\- Human review integrates cleanly.  
\- Benchmarking functions across executions.  
\- Learning feeds routing and planning.  
\- Failures become operational knowledge.  
\- Events are emitted.  
\- APIs remain versioned.  
\- Historical comparisons are preserved.  
\- Audit is complete.

\---

\# ADR Candidates

Scoring framework

Learning feedback

Benchmark strategy

Evaluation taxonomy

Human review weighting

Continuous optimization

\---

\# End RFC-4010

\# RFC-4011  
\# Human Escalation Framework

Status

Draft 1.0

Owner

Auric Works

Authority

\- Dispatch Constitution  
\- RFC-2000  
\- RFC-4010

Applies To

Every execution that may require human review, approval, intervention, or decision.

\---

\# Purpose

The Human Escalation Framework integrates humans into Dispatch as first-class execution resources.

Humans are not exceptions.

Humans are planned capabilities.

Dispatch should automate everything that is repeatable and elevate everything requiring judgment.

\---

\# Philosophy

AI should not replace people.

AI should eliminate repetitive work so people spend time making better decisions.

The platform exists to increase operational capacity.

Not eliminate operators.

\---

\# Core Principle

Escalation is intentional.

Not reactive.

The Planner determines when human participation is required before execution begins whenever possible.

Unexpected escalation is treated as recovery.

\---

\# Canonical Flow

\`\`\`text  
Execution Plan

↓

Human Required?

↓

Human Capability

↓

Assignment

↓

Review

↓

Decision

↓

Knowledge Graph

↓

Execution Continues  
\`\`\`

Humans participate as execution nodes.

\---

\# Human Capability Types

Approval

Review

Validation

Decision

Negotiation

Interview

Annotation

Exception Handling

Relationship Building

Creative Judgment

Strategic Judgment

Every human task is Registry-defined.

\---

\# Escalation Levels

Level 0

Fully Autonomous

\---

Level 1

Human Notification

\---

Level 2

Human Review

\---

Level 3

Human Approval Required

\---

Level 4

Human Decision Required

\---

Level 5

Human Ownership

The Planner assigns escalation levels.

\---

\# Escalation Triggers

Policy

Risk Threshold

Confidence Threshold

Budget Threshold

Legal Requirement

Compliance Requirement

Execution Failure

Conflicting Facts

Human Request

Strategic Importance

Triggers remain configurable.

\---

\# Human Assignment

Assignments consider

Role

Expertise

Availability

Authority

Jurisdiction

Workload

Relationship

Assignment is policy-driven.

\---

\# Review Package

Every escalation includes

Execution Plan

Context Pack

Supporting Facts

Evidence

Recommendations

Confidence

Alternatives

Expected Decision

Humans receive operational context.

Not raw system output.

\---

\# Human Decisions

Supported decisions

Approve

Reject

Modify

Request Information

Delegate

Escalate

Terminate

Every decision becomes operational knowledge.

\---

\# Timeouts

Every escalation declares

Response SLA

Reminder Schedule

Escalation Timeout

Fallback Strategy

Human delay should never stall the platform indefinitely.

\---

\# Audit

Every escalation records

Who

When

Why

Decision

Supporting Evidence

Elapsed Time

Outcome

Every decision is permanently auditable.

\---

\# Learning

Human decisions improve

Planner

Policies

Confidence

Prompt Registry

Recommendations

Evaluation

Knowledge Graph

Human judgment compounds.

\---

\# Human Events

HumanAssigned

HumanNotified

HumanReviewed

HumanApproved

HumanRejected

HumanDelegated

HumanEscalated

HumanTimedOut

Every interaction emits Events.

\---

\# Required Tables

human\_tasks

human\_assignments

human\_reviews

human\_decisions

human\_authority

human\_metrics

human\_events

human\_history

\---

\# TypeScript Interfaces

HumanTask

HumanAssignment

HumanDecision

HumanReview

AuthorityLevel

EscalationPolicy

HumanMetrics

\---

\# APIs

CreateHumanTask()

AssignReviewer()

SubmitDecision()

DelegateTask()

EscalateTask()

SearchHumanTasks()

MeasureSLA()

\---

\# Performance Goals

Support

Parallel human reviews

Policy-driven assignment

Decision traceability

SLA monitoring

Knowledge capture

Continuous learning

\---

\# Acceptance Criteria

Implementation is complete when

\- Humans participate as planned execution nodes.  
\- Escalation levels are configurable.  
\- Review packages provide complete context.  
\- Every decision updates operational knowledge.  
\- SLAs are enforced.  
\- Human authority is policy-driven.  
\- Events are emitted.  
\- APIs remain versioned.  
\- Audit is complete.  
\- Human judgment continuously improves Dispatch.

\---

\# ADR Candidates

Escalation policy

Authority hierarchy

Assignment engine

Review package schema

Human learning model

SLA framework

\---

\# End RFC-4011

\# RFC-4012  
\# Failure Recovery Framework

Status

Draft 1.0

Owner

Auric Works

Authority

\- Dispatch Constitution  
\- RFC-2000  
\- RFC-4011

Applies To

Every execution, workflow, plan, agent, tool, connector, model, and human interaction within Dispatch.

\---

\# Purpose

The Failure Recovery Framework ensures that no execution fails silently.

Failure is an expected operational condition.

Recovery is a first-class platform capability.

Dispatch is designed to continue operating despite partial failures.

\---

\# Philosophy

Failure is information.

Not catastrophe.

Every failure improves

Planning

Routing

Policies

Evaluation

Knowledge

Operational Capacity

The platform becomes stronger through controlled failure.

\---

\# Core Principle

Every failure must answer

What failed?

Why?

What was affected?

Can we recover?

Should we retry?

Should we escalate?

Should we terminate?

Every failure becomes operational knowledge.

\---

\# Canonical Flow

\`\`\`text  
Execution

↓

Failure Detection

↓

Classification

↓

Recovery Strategy

↓

Retry

↓

Fallback

↓

Human Escalation

↓

Termination

↓

Learning  
\`\`\`

Recovery is deterministic.

\---

\# Failure Categories

Execution

Planning

Tool

Connector

Model

Network

Policy

Permission

Human

Data

Knowledge

Infrastructure

Unknown

Categories determine recovery behavior.

\---

\# Severity Levels

Informational

Minor

Moderate

Major

Critical

Catastrophic

Severity influences

Recovery

Escalation

Notification

Audit

\---

\# Failure Classification

Every failure records

Component

Capability

Execution Plan

Node

Dependency

Root Cause

Timestamp

Impact

Recovery Strategy

Classification is mandatory.

\---

\# Recovery Strategies

Retry

Alternative Tool

Alternative Model

Alternative Connector

Alternative Plan

Replan

Human Review

Terminate

Recovery strategy is selected before execution whenever possible.

\---

\# Retry Policy

Retry evaluates

Failure Type

Retry Count

Elapsed Time

Backoff

Cost

Business Impact

Retries are policy-driven.

Never infinite.

\---

\# Circuit Breakers

Dispatch supports

Tool Circuit Breakers

Model Circuit Breakers

Connector Circuit Breakers

Provider Circuit Breakers

Tenant Circuit Breakers

Circuit breakers prevent cascading failures.

\---

\# Partial Success

Execution may complete partially.

Completed work remains committed.

Failed work is isolated.

Recovery resumes from checkpoints.

Not from the beginning.

\---

\# Checkpoints

Execution creates checkpoints at

Plan milestones

Workflow boundaries

Human approvals

External commits

Long-running tasks

Recovery resumes from the latest valid checkpoint.

\---

\# Escalation

Recovery escalates when

Confidence falls below policy

Retry budget exhausted

Critical capability unavailable

Human judgment required

Policy requires approval

Escalation follows RFC-4011.

\---

\# Root Cause Analysis

Every unrecovered failure records

Immediate Cause

Underlying Cause

Affected Systems

Business Impact

Recommended Fix

Preventive Action

Root cause becomes graph knowledge.

\---

\# Learning

Recovery updates

Planner

Tool Router

Model Router

Evaluation Engine

Policies

Knowledge Graph

Future executions become more resilient.

\---

\# Failure Events

FailureDetected

FailureClassified

RetryStarted

RetrySucceeded

RetryFailed

FallbackActivated

RecoverySucceeded

RecoveryFailed

CircuitOpened

CircuitClosed

RootCauseRecorded

Every recovery action emits Events.

\---

\# Required Tables

failures

failure\_types

failure\_history

recovery\_plans

retry\_history

circuit\_breakers

failure\_metrics

failure\_events

root\_cause\_analysis

\---

\# TypeScript Interfaces

Failure

FailureType

RecoveryPlan

RetryPolicy

CircuitBreaker

FailureAnalysis

RecoveryResult

\---

\# APIs

ReportFailure()

ClassifyFailure()

RecoverExecution()

RetryExecution()

OpenCircuit()

CloseCircuit()

AnalyzeFailure()

SearchFailures()

\---

\# Performance Goals

Support

Automatic recovery

Checkpoint restart

Deterministic retries

Provider failover

Parallel recovery

Real-time failure detection

\---

\# Acceptance Criteria

Implementation is complete when

\- Every failure is classified.  
\- Recovery strategies are policy-driven.  
\- Retries remain bounded.  
\- Circuit breakers prevent cascading failures.  
\- Partial execution resumes from checkpoints.  
\- Root cause analysis is preserved.  
\- Learning updates future routing.  
\- Events are emitted.  
\- APIs remain versioned.  
\- Audit is complete.

\---

\# ADR Candidates

Recovery framework

Retry algorithm

Checkpoint strategy

Circuit breaker model

Failure taxonomy

Root cause methodology

\---

\# End RFC-4012

\# RFC-4013  
\# Cost Optimization Engine

Status

Draft 1.0

Owner

Auric Works

Authority

\- Dispatch Constitution  
\- RFC-2000  
\- RFC-4012

Applies To

Every execution, workflow, model, tool, connector, publication, terminal, and cartridge executed by Dispatch.

\---

\# Purpose

The Cost Optimization Engine maximizes operational value while minimizing execution cost.

Dispatch is not optimized for intelligence.

Dispatch is optimized for operational return on intelligence.

Every dollar spent should increase operational capacity.

\---

\# Philosophy

Cost is a platform constraint.

Not an accounting exercise.

The cheapest execution is not always the best.

The most expensive execution is rarely the best.

Dispatch seeks the highest operational return per unit of cost.

\---

\# Core Principle

Always execute with the cheapest sufficient capability.

Escalate only when measurable value exceeds incremental cost.

Cost optimization is continuous.

Never periodic.

\---

\# Canonical Flow

\`\`\`text  
Request

↓

Execution Plan

↓

Budget

↓

Capability Selection

↓

Tool Selection

↓

Model Selection

↓

Execution

↓

Evaluation

↓

Cost Feedback

↓

Routing Improvement  
\`\`\`

Every execution has a budget.

\---

\# Cost Categories

Model Cost

Connector Cost

API Cost

Storage Cost

Network Cost

Human Cost

Compute Cost

Token Cost

Publication Cost

Workflow Cost

Every cost is measurable.

\---

\# Cost Objects

Every execution records

Estimated Cost

Actual Cost

Variance

Cost Driver

Cost Center

Tenant

Capability

Provider

ROI

\---

\# Budget Hierarchy

Platform

↓

Tenant

↓

Terminal

↓

Workflow

↓

Execution

↓

Node

Budgets inherit downward.

Limits enforce upward.

\---

\# Optimization Goals

Minimize

Latency

Cost

Retries

Human Time

Token Usage

Duplicate Work

Maximize

Accuracy

Reliability

Reuse

Operational Capacity

\---

\# Cost Policies

Policies define

Maximum Execution Cost

Maximum Daily Spend

Provider Restrictions

Human Approval Thresholds

Emergency Overrides

Cost policies are Registry-driven.

\---

\# Cost Estimation

Estimate before execution using

Historical Runs

Execution Plan

Context Size

Provider Pricing

Tool Pricing

Human Estimates

Execution may not begin without an estimate.

\---

\# Cost Feedback

Actual execution updates

Planner

Model Router

Tool Router

Prompt Registry

Evaluation

Future Estimates

Dispatch continuously improves estimation accuracy.

\---

\# Reuse

The engine prioritizes

Cached Results

Existing Working Graphs

Existing Publications

Existing Intelligence Objects

Existing Context Packs

Never recompute unnecessarily.

\---

\# Optimization Strategies

Rule Instead of Model

Small Model Instead of Large Model

Existing Knowledge Instead of Generation

Cached Result Instead of Execution

Parallel Instead of Sequential

Local Instead of External

Automation Instead of Human

Every strategy is measurable.

\---

\# Cost Metrics

Cost per Execution

Cost per Capability

Cost per Institution

Cost per Publication

Cost per Recommendation

Cost per Workflow

Cost per Outcome

Cost per Operational Hour Saved

The final metric matters most.

\---

\# ROI

Dispatch measures

Execution Cost

↓

Operational Improvement

↓

Time Saved

↓

Revenue Impact

↓

Risk Reduction

↓

Operational Capacity

↓

Return

Optimization serves business outcomes.

\---

\# Cost Events

BudgetCreated

EstimateGenerated

BudgetExceeded

ExecutionApproved

ExecutionRejected

OptimizationApplied

SavingsRecorded

CostReconciled

Every financial decision emits Events.

\---

\# Required Tables

cost\_estimates

cost\_actuals

execution\_budgets

cost\_policies

cost\_metrics

provider\_pricing

optimization\_history

cost\_events

roi\_metrics

\---

\# TypeScript Interfaces

CostEstimate

ExecutionBudget

CostPolicy

OptimizationStrategy

CostMetrics

ROIReport

ProviderPricing

\---

\# APIs

EstimateExecutionCost()

ApproveBudget()

TrackExecutionCost()

OptimizeExecution()

CalculateROI()

SearchCostHistory()

ReconcileCosts()

\---

\# Performance Goals

Support

Real-time estimates

Sub-second budget checks

Provider price updates

Execution optimization

Historical forecasting

Continuous ROI tracking

\---

\# Acceptance Criteria

Implementation is complete when

\- Every execution has a budget.  
\- Cost is estimated before execution.  
\- Actual cost is reconciled afterward.  
\- Optimization favors cheapest sufficient capability.  
\- Cached work is preferred over recomputation.  
\- ROI is measurable.  
\- Routing continuously improves.  
\- Events are emitted.  
\- APIs remain versioned.  
\- Audit is complete.

\---

\# ADR Candidates

Budget hierarchy

ROI calculation

Pricing registry

Optimization heuristics

Forecasting model

Cost governance

\---

\# End RFC-4013

\# RFC-4014  
\# Agent Harness APIs

Status

Draft 1.0

Owner

Auric Works

Authority

\- Dispatch Constitution  
\- RFC-2000  
\- RFC-4013

Applies To

Every internal service, cartridge, terminal, connector, SDK, workflow, and external integration that executes work through the Agent Harness.

\---

\# Purpose

The Agent Harness API is the sole execution interface for intelligent work inside Dispatch.

Nothing invokes models directly.

Nothing invokes agents directly.

Everything executes through the Harness.

The Harness is the operating system.

\---

\# Philosophy

Applications request outcomes.

The Harness determines execution.

Consumers should never know

which model,

which tool,

which agent,

or

which provider

completed the work.

Execution remains abstract.

\---

\# Core Principle

All execution contracts are capability-based.

Never provider-based.

Never model-based.

Never implementation-based.

\---

\# Canonical Flow

\`\`\`text  
Client

↓

Harness API

↓

Task Classification

↓

Planning

↓

Context Assembly

↓

Tool Routing

↓

Model Routing

↓

Execution

↓

Evaluation

↓

Response  
\`\`\`

Every intelligent operation follows the same contract.

\---

\# API Categories

Execution APIs

Planning APIs

Context APIs

Agent APIs

Tool APIs

Model APIs

Evaluation APIs

Administration APIs

Monitoring APIs

Every endpoint follows identical authentication, auditing, and policy rules.

\---

\# Execution APIs

StartExecution()

GetExecution()

PauseExecution()

ResumeExecution()

CancelExecution()

ReplayExecution()

SearchExecutions()

Execution is asynchronous by default.

\---

\# Planning APIs

CreatePlan()

ValidatePlan()

EstimatePlan()

Replan()

ComparePlans()

ExplainPlan()

\---

\# Context APIs

BuildContextPack()

ValidateContext()

RetrieveContext()

CompareContexts()

RefreshContext()

ExplainContext()

\---

\# Agent APIs

ExecuteAgent()

ExecuteAgentGraph()

SearchAgents()

EvaluateAgent()

RetryAgent()

DestroyAgent()

\---

\# Tool APIs

ResolveCapability()

SelectTool()

EvaluateTool()

SearchTools()

RegisterTool()

GetToolHealth()

\---

\# Model APIs

SelectModel()

EstimateExecutionCost()

EvaluateModel()

SearchModels()

RegisterModel()

GetProviderHealth()

\---

\# Evaluation APIs

EvaluateExecution()

GenerateScorecard()

CompareBenchmarks()

SearchEvaluations()

ApplyLearning()

\---

\# Monitoring APIs

GetExecutionStatus()

GetQueueHealth()

GetRuntimeHealth()

GetLatencyMetrics()

GetCostMetrics()

GetFailureMetrics()

\---

\# API Contracts

Every request contains

Request ID

Tenant

Identity

Purpose

Policy Context

Correlation ID

Context Version

Execution Budget

Every response returns

Status

Execution ID

Version

Metrics

Events

Audit Reference

\---

\# Execution Modes

Synchronous

Asynchronous

Streaming

Scheduled

Long Running

Continuous

Mode is selected by the Planner.

\---

\# Explainability

Every intelligent endpoint supports

Explain()

Explain returns

Plan

Context

Capabilities

Tools

Models

Evidence

Evaluation

No execution is opaque.

\---

\# Security

Every request validates

Identity

↓

Tenant

↓

Permissions

↓

Policies

↓

Execution Budget

↓

Capability Access

↓

Audit

Authorization precedes execution.

\---

\# Versioning

All APIs are

Versioned

Backward Compatible

Auditable

Deprecation Managed

Breaking changes require a new major version.

\---

\# Events

Every API emits

RequestReceived

ExecutionStarted

ExecutionCompleted

ExecutionFailed

EvaluationCompleted

LearningApplied

API events become operational telemetry.

\---

\# Required Tables

harness\_api\_versions

harness\_api\_clients

harness\_api\_usage

harness\_api\_limits

harness\_api\_metrics

harness\_api\_events

execution\_queue

runtime\_health

\---

\# TypeScript Interfaces

HarnessRequest

HarnessResponse

ExecutionRequest

ExecutionResponse

ExecutionStatus

RuntimeMetrics

HealthReport

\---

\# APIs

(All endpoints described above comprise the canonical Agent Harness API.)

\---

\# Performance Goals

Support

100,000+ concurrent executions

Streaming execution

Sub-50ms request validation

Horizontal scaling

Provider independence

Replay compatibility

High availability

\---

\# Acceptance Criteria

Implementation is complete when

\- Every intelligent execution flows through the Harness API.  
\- Clients remain provider-independent.  
\- Execution supports synchronous and asynchronous modes.  
\- Explainability is universally available.  
\- Monitoring is built-in.  
\- APIs are fully versioned.  
\- Events are emitted.  
\- Audit is complete.  
\- Execution remains capability-driven.  
\- No client communicates directly with models or agents.

\---

\# ADR Candidates

Harness API contract

Streaming protocol

Execution queue

Capability interface

Versioning policy

Horizontal scaling

\---

\# End RFC-4014

\# RFC-4015  
\# Agent Harness Acceptance, Evaluation & Operational Readiness

Status

Draft 1.0

Owner

Auric Works

Authority

\- Dispatch Constitution  
\- RFC-2000  
\- RFC-4000 through RFC-4014

Applies To

The complete Agent Harness and every execution performed through Dispatch.

\---

\# Purpose

RFC-4015 defines when the Agent Harness is considered production-ready.

The Harness succeeds when intelligent execution is

Deterministic

Explainable

Auditable

Cost Efficient

Recoverable

Continuously Improving

This RFC establishes the operational acceptance criteria for every future cartridge.

\---

\# Philosophy

The Harness is not measured by intelligence.

It is measured by execution.

Operational capacity—not model sophistication—is the success metric.

\---

\# Core Principle

Every execution must answer

Why this plan?

Why this capability?

Why this tool?

Why this model?

Why this outcome?

Why this cost?

If any answer cannot be produced,

the Harness has failed.

\---

\# Acceptance Categories

Planning

Context

Routing

Execution

Evaluation

Recovery

Cost

Security

Observability

Developer Experience

Operational Readiness

\---

\# Planning Acceptance

Validate

Task decomposition

DAG correctness

Dependency resolution

Parallel execution

Replanning

Constraint enforcement

\---

\# Context Acceptance

Validate

Working Graph assembly

Context completeness

Policy enforcement

Memory retrieval

Deterministic assembly

Context versioning

\---

\# Routing Acceptance

Validate

Capability routing

Tool routing

Model routing

Fallback selection

Provider independence

Registry compliance

\---

\# Execution Acceptance

Validate

Execution ordering

Node scheduling

State transitions

Streaming

Checkpoint recovery

Replay accuracy

\---

\# Evaluation Acceptance

Validate

Automatic scoring

Human review

Learning feedback

Benchmarking

Recommendation quality

Execution scorecards

\---

\# Recovery Acceptance

Validate

Retry logic

Circuit breakers

Fallback chains

Checkpoint recovery

Root cause analysis

Recovery metrics

\---

\# Cost Acceptance

Validate

Pre-execution estimates

Budget enforcement

Cost reconciliation

ROI measurement

Optimization

Provider pricing

\---

\# Security Acceptance

Validate

Tenant isolation

Policy enforcement

Permission checks

Secret handling

Provider isolation

Audit integrity

\---

\# Observability

Measure

Execution latency

Queue depth

Agent utilization

Failure rates

Routing accuracy

Model utilization

Tool utilization

Execution cost

Operational capacity gained

\---

\# Operational KPIs

Plan Success Rate

Execution Success Rate

First Pass Success

Retry Rate

Human Escalation Rate

Average Cost

Average Latency

Evaluation Score

Recommendation Adoption

Operational Hours Saved

These become platform KPIs.

\---

\# Regression Suite

Every release validates

Task Classification

Planning

Context Assembly

Tool Routing

Model Routing

Execution

Evaluation

Recovery

Cost Optimization

API Compatibility

Replay

No regression ships unnoticed.

\---

\# Operational Readiness

Production requires

Health dashboards

Execution dashboards

Routing dashboards

Cost dashboards

Failure dashboards

Queue monitoring

Alerting

Runbooks

Disaster recovery

Operational maturity precedes scale.

\---

\# Maturity Levels

Level 0

Prototype

Level 1

Developer

Level 2

Internal Production

Level 3

Pilot Institutions

Level 4

Production Platform

Level 5

Autonomous Operational Network

Every Harness capability declares its maturity.

\---

\# Scorecard

Each release receives scores for

Planning

Routing

Execution

Evaluation

Recovery

Cost

Security

Observability

Developer Experience

Operational Readiness

Overall Harness Readiness

Historical scorecards remain immutable.

\---

\# Required Tables

harness\_scorecards

harness\_acceptance\_runs

harness\_regression\_results

harness\_health

harness\_release\_history

harness\_operational\_reviews

harness\_benchmarks

harness\_readiness

\---

\# APIs

RunHarnessAcceptance()

RunHarnessRegression()

MeasureHarnessHealth()

GenerateHarnessScorecard()

ApproveHarnessRelease()

ArchiveHarnessRelease()

\---

\# Acceptance Criteria

Volume IV is complete when

\- Every request is classified before execution.  
\- Every execution begins with an Execution Plan.  
\- Every execution consumes a Context Pack.  
\- Every capability is provider-independent.  
\- Every tool and model is Registry-managed.  
\- Every execution is evaluated.  
\- Every failure is recoverable or explainable.  
\- Every execution has measurable cost.  
\- Every decision is auditable.  
\- The Agent Harness can reliably orchestrate every intelligent capability within Dispatch.

\---

\# Final Statement

The Knowledge Graph is the brain of Dispatch.

The Agent Harness is its nervous system.

The Kernel provides the laws.

The Graph provides understanding.

The Harness transforms understanding into action.

Everything above this layer exists because of the Harness.

\---

\# End RFC-4015

\# End of Volume IV — Agent Harness  
