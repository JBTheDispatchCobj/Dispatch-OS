\# RFC-3010  
\# Graph Assembly Engine

Status

Draft 1.0

Owner

Auric Works

Authority

\- Dispatch Constitution  
\- RFC-2000  
\- RFC-3009

Applies To

Every Profile, Intelligence Object, Recommendation, Workflow, Publication, Context Pack, and Model Execution.

\---

\# Purpose

The Graph Assembly Engine constructs the operational view of reality required for a specific task.

The Knowledge Graph stores everything.

The Assembly Engine determines what matters now.

It converts the complete graph into a bounded, explainable working graph.

\---

\# Philosophy

No model should ever search the Knowledge Graph directly.

No workflow should manually assemble context.

Every consumer receives a purpose-built graph assembled by Dispatch.

Assembly is deterministic.

Reasoning is optional.

\---

\# Core Principle

The graph is infinite.

Execution context is finite.

Assembly determines relevance.

Not intelligence.

\---

\# Canonical Flow

\`\`\`text  
Knowledge Graph

↓

Entry Object

↓

Relationship Expansion

↓

Policy Filters

↓

Permission Filters

↓

Temporal Filters

↓

Confidence Filters

↓

Assembly Rules

↓

Working Graph

↓

Context Pack

↓

Execution  
\`\`\`

The Working Graph is temporary.

The Knowledge Graph is permanent.

\---

\# Canonical Definition

A Working Graph is a temporary, task-specific projection of the Knowledge Graph containing only the entities, relationships, evidence, memory, and intelligence required for execution.

Working Graphs are disposable.

Knowledge is not.

\---

\# Assembly Inputs

Entry Object

Workflow

Tenant

Identity

Goal

Task Type

Cartridge

Time Horizon

Budget

Maximum Complexity

Everything begins from intent.

\---

\# Assembly Layers

Layer 1

Canonical Object

↓

Layer 2

Immediate Relationships

↓

Layer 3

Relevant Facts

↓

Layer 4

Memory

↓

Layer 5

Operational Context

↓

Layer 6

Policies

↓

Layer 7

Supporting Intelligence

↓

Layer 8

Execution Context

Each layer is optional.

\---

\# Expansion Rules

Expansion evaluates

Relationship Type

Relationship Strength

Confidence

Freshness

Business Importance

Distance

Policy

Budget

Expansion is configurable.

Never hardcoded.

\---

\# Traversal Strategy

The engine supports

Breadth-first

Depth-first

Weighted

Relationship-first

Evidence-first

Policy-first

Cartridge-defined

Traversal strategy is Registry-driven.

\---

\# Assembly Policies

Policies may limit

Maximum Nodes

Maximum Relationships

Maximum Cost

Maximum Time

Privacy

Data Residency

Context Size

Policies prevent runaway graph expansion.

\---

\# Graph Windows

Every Working Graph exists inside a window.

Example

Institution

↓

Executive

↓

Core Provider

↓

Open Initiatives

↓

Relevant Vendors

↓

Current Pilots

↓

Current Recommendations

Everything outside the window remains accessible.

Not loaded.

\---

\# Context Packs

The Assembly Engine produces Context Packs.

A Context Pack contains

Objects

Relationships

Facts

Evidence References

Memory

Policies

Goals

Workflow State

Execution Constraints

Models consume Context Packs.

Never databases.

\---

\# Profile Assembly

Profiles are assembled by

Entry Entity

↓

Graph Expansion

↓

Relationship Ranking

↓

Operational Context

↓

Current State

↓

Recommendations

Profiles are projections.

Not stored objects.

\---

\# Recommendation Assembly

Recommendations require

Facts

Relationships

Memory

Goals

Policies

Historical Outcomes

Confidence

Nothing else.

\---

\# Publication Assembly

Publications consume

Intelligence Objects

↓

Working Graph

↓

Audience Lens

↓

Publication Renderer

Publications never assemble directly from raw Facts.

\---

\# Caching

Working Graphs may be cached.

Cache invalidates on

Fact Changes

Relationship Changes

Permission Changes

Policy Changes

Workflow State

Time Expiration

Caches are disposable.

\---

\# Assembly Events

GraphAssemblyStarted

GraphExpanded

ContextPackCreated

ProfileAssembled

RecommendationContextBuilt

PublicationContextBuilt

AssemblyCompleted

AssemblyFailed

Every assembly emits Events.

\---

\# Required Tables

working\_graphs

assembly\_requests

assembly\_rules

assembly\_cache

context\_packs

graph\_expansions

assembly\_events

assembly\_metrics

\---

\# TypeScript Interfaces

WorkingGraph

AssemblyRequest

AssemblyRule

ContextPack

ExpansionRule

TraversalPolicy

AssemblyMetrics

\---

\# APIs

AssembleGraph()

CreateContextPack()

ExpandGraph()

BuildProfile()

BuildRecommendationContext()

BuildPublicationContext()

InvalidateCache()

\---

\# Performance Goals

Support

Sub-second profile assembly

Incremental graph expansion

Context-aware caching

Permission-aware traversal

Large graph scalability

Deterministic context generation

\---

\# Acceptance Criteria

Implementation is complete when

\- Every execution consumes a Working Graph.  
\- Models never query the graph directly.  
\- Context Packs are deterministic.  
\- Traversal is Registry-driven.  
\- Policies constrain expansion.  
\- Profiles assemble dynamically.  
\- Recommendations use Working Graphs.  
\- Events are emitted.  
\- APIs remain versioned.  
\- Audit is complete.

\---

\# ADR Candidates

Traversal algorithms

Context Pack schema

Expansion heuristics

Caching strategy

Assembly policies

Graph windowing

\---

\# End RFC-3010  
