\# RFC-3011  
\# Graph Query Engine

Status

Draft 1.0

Owner

Auric Works

Authority

\- Dispatch Constitution  
\- RFC-2000  
\- RFC-3010

Applies To

Every search, retrieval, recommendation, profile, workflow, publication, and model execution performed by Dispatch.

\---

\# Purpose

The Graph Query Engine is responsible for answering questions against the Knowledge Graph.

It retrieves.

It does not reason.

It does not generate.

It does not infer.

Its responsibility is finding the correct operational context as efficiently and accurately as possible.

\---

\# Philosophy

Traditional databases answer

"What rows match?"

Dispatch answers

"What knowledge is operationally relevant?"

Retrieval is graph-aware.

Not document-aware.

\---

\# Core Principle

Queries retrieve knowledge.

They never manufacture knowledge.

Reasoning belongs to the Inference Engine.

Generation belongs to the Agent Harness.

Execution belongs to Workflows.

\---

\# Canonical Query Flow

\`\`\`text  
Request

↓

Identity

↓

Permissions

↓

Tenant

↓

Assembly Policy

↓

Graph Traversal

↓

Ranking

↓

Working Graph

↓

Context Pack

↓

Consumer  
\`\`\`

Every query is permission-aware.

\---

\# Query Types

Lookup

Search

Traversal

Similarity

Recommendation Context

Profile Context

Relationship Expansion

Timeline

Evidence Trace

Knowledge Discovery

Operational Context

Every query type follows the same execution contract.

\---

\# Lookup

Returns one canonical object.

Lookup uses

UUID

Canonical Identifier

External Identifier

Alias

Normalized Name

Lookup is deterministic.

\---

\# Search

Search combines

Structured Filters

Semantic Search

Graph Traversal

Ranking

Search is not keyword-only.

\---

\# Traversal

Traversal discovers connected knowledge.

Supported strategies

Breadth First

Depth First

Weighted

Shortest Path

Relationship Priority

Policy Constrained

Temporal

Traversal is Registry-driven.

\---

\# Semantic Search

Semantic retrieval searches

Concepts

Meaning

Intent

Embeddings accelerate retrieval.

Embeddings never replace canonical graph queries.

\---

\# Hybrid Retrieval

Dispatch defaults to

Structured Retrieval

\+

Graph Traversal

\+

Semantic Ranking

Hybrid retrieval consistently outperforms any single method.

\---

\# Ranking

Results are ranked using

Permission

Confidence

Relationship Strength

Freshness

Authority

Business Relevance

Workflow Context

Historical Success

Distance

Ranking policies remain configurable.

\---

\# Query Context

Every query receives

Identity

Tenant

Goal

Workflow

Cartridge

Budget

Time Horizon

Maximum Depth

Privacy Level

Queries never execute without context.

\---

\# Temporal Queries

Support

Current State

Historical State

Future Projection

Effective Date

Point-in-Time

Trend

Dispatch reasons across time.

\---

\# Relationship Queries

Examples

Show all executive relationships.

Find indirect introductions.

Locate pilot institutions.

Identify portfolio overlap.

Surface shared vendors.

Relationship traversal is a first-class capability.

\---

\# Evidence Queries

Support

Trace recommendation

Show supporting facts

Retrieve evidence

Display provenance

Inspect confidence

Explain recommendation

Explainability is built into retrieval.

\---

\# Discovery Queries

Discovery finds

Unknown opportunities.

Examples

Potential partnerships

Investment candidates

Shared relationships

Technology overlap

Executive movement

Operational risk

Discovery powers innovation.

\---

\# Query Optimization

Optimize using

Indexes

Traversal limits

Context windows

Materialized views

Caching

Graph projections

Embeddings

Cost-aware planning

Optimization never changes results.

\---

\# Caching

Cache

Working Graphs

Search Results

Profile Projections

Relationship Expansions

Evidence Chains

Invalidate when

Truth changes.

\---

\# Query Events

QueryStarted

TraversalExpanded

WorkingGraphBuilt

SearchCompleted

CacheHit

CacheMiss

TraversalLimited

QueryFailed

Every query emits Events.

\---

\# Required Tables

query\_history

query\_cache

query\_metrics

query\_rankings

query\_context

graph\_indexes

semantic\_indexes

traversal\_history

\---

\# TypeScript Interfaces

QueryRequest

QueryContext

QueryResult

TraversalResult

RankingPolicy

SearchFilter

WorkingGraphReference

\---

\# APIs

Lookup()

Search()

Traverse()

Discover()

RetrieveEvidence()

Explain()

BuildWorkingGraph()

InvalidateQueryCache()

\---

\# Performance Goals

Support

Sub-250ms lookup

Sub-1s search

Incremental traversal

Million-node graphs

Permission-aware caching

Hybrid retrieval

Deterministic execution

\---

\# Acceptance Criteria

Implementation is complete when

\- Every query is permission-aware.  
\- Hybrid retrieval functions.  
\- Traversal is configurable.  
\- Ranking is Registry-driven.  
\- Evidence is explainable.  
\- Discovery queries operate on graph topology.  
\- Working Graphs are returned.  
\- Events are emitted.  
\- APIs remain versioned.  
\- Audit is complete.

\---

\# ADR Candidates

Traversal engine

Hybrid search

Ranking algorithm

Embedding strategy

Caching

Discovery framework

\---

\# End RFC-3011  
