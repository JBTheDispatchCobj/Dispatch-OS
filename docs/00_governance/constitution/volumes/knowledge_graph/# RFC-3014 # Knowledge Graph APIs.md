\# RFC-3014  
\# Knowledge Graph APIs

Status

Draft 1.0

Owner

Auric Works

Authority

\- Dispatch Constitution  
\- RFC-2000  
\- RFC-3013

Applies To

Every service, cartridge, connector, terminal, publication engine, workflow, SDK, and external integration that interacts with the Dispatch Knowledge Graph.

\---

\# Purpose

The Knowledge Graph API is the only supported interface for reading and interacting with operational knowledge.

Nothing accesses the graph directly.

Everything communicates through graph contracts.

The graph is a platform capability.

Not a database.

\---

\# Philosophy

Applications should ask questions.

Never write queries.

Consumers request

Knowledge

Relationships

Profiles

Evidence

Recommendations

The API determines how those requests are fulfilled.

\---

\# Core Principle

The Knowledge Graph is implementation-independent.

Whether backed by PostgreSQL, Neo4j, RDF, vectors, or future technologies, consumers should never know.

Only the API is permanent.

\---

\# API Layers

\`\`\`text  
Client

↓

Terminal

↓

Kernel API

↓

Graph Service

↓

Assembly Engine

↓

Knowledge Graph

↓

Persistence  
\`\`\`

Every request passes through the Kernel.

\---

\# API Categories

Entity APIs

Relationship APIs

Truth APIs

Evidence APIs

Profile APIs

Search APIs

Discovery APIs

Traversal APIs

Recommendation APIs

Administration APIs

Every category follows consistent contracts.

\---

\# Entity APIs

CreateEntity()

GetEntity()

UpdateEntity()

MergeEntities()

SplitEntity()

ArchiveEntity()

RestoreEntity()

ResolveIdentity()

\---

\# Relationship APIs

CreateRelationship()

UpdateRelationship()

SearchRelationships()

TraverseRelationships()

CalculateRelationshipHealth()

RecommendRelationships()

\---

\# Truth APIs

CreateObservation()

CreateClaim()

VerifyClaim()

CreateFact()

CreateInference()

ResolveConflict()

SearchTruth()

\---

\# Evidence APIs

RegisterEvidence()

RetrieveEvidence()

TraceEvidence()

TraceProvenance()

ReviewEvidence()

VerifyIntegrity()

\---

\# Graph APIs

AssembleGraph()

ExpandGraph()

CollapseGraph()

CreateProjection()

CompareGraphs()

CalculateImpact()

\---

\# Search APIs

Lookup()

Search()

SemanticSearch()

HybridSearch()

Discover()

Explain()

Search supports structured and semantic retrieval.

\---

\# Profile APIs

BuildProfile()

RefreshProfile()

ApplyLens()

CompareProfiles()

CalculateProfileHealth()

\---

\# Recommendation APIs

GenerateRecommendations()

ExplainRecommendation()

ReviewRecommendation()

DismissRecommendation()

AcceptRecommendation()

Recommendation generation never bypasses graph assembly.

\---

\# Discovery APIs

FindOpportunities()

FindSharedRelationships()

FindWarmIntroductions()

FindPilotCandidates()

FindTechnologyOverlap()

FindOperationalRisk()

Discovery operates on graph topology.

\---

\# Query Contracts

Every request contains

Identity

Tenant

Purpose

Context

Permissions

Correlation ID

Time Horizon

Budget

Graph queries are never anonymous.

\---

\# Response Contracts

Every response returns

Request ID

Graph Version

Context Version

Objects

Relationships

Supporting Facts

Evidence References

Confidence

Warnings

Next Actions

No UI formatting.

\---

\# Explainability

Every endpoint supporting intelligence also supports

Explain()

Explain returns

Facts

Relationships

Evidence

Policies

Confidence

Reasoning Chain

Dispatch always explains itself.

\---

\# Streaming APIs

Support

Live Graph Updates

Workflow Events

Relationship Changes

Fact Updates

Connector Activity

Publication Events

Streaming is event-driven.

\---

\# Bulk APIs

Support

Imports

Exports

Synchronization

Reindexing

Migration

Replay

Bulk operations remain auditable.

\---

\# SDK Contracts

Official SDKs expose

Graph

Entities

Relationships

Profiles

Search

Recommendations

Evidence

Workflows

Never raw storage.

\---

\# Versioning

Every endpoint is versioned.

Breaking changes require

New API Version

Migration Guide

ADR

Deprecation Schedule

Compatibility Matrix

\---

\# Security

Every request evaluates

Identity

↓

Tenant

↓

Visibility

↓

Ownership

↓

Policy

↓

Purpose

↓

Execution

Authorization precedes graph traversal.

\---

\# Events

Every mutation emits Events.

Every query records metrics.

Every recommendation records provenance.

Every API request is auditable.

\---

\# Required Tables

graph\_api\_usage

graph\_api\_versions

graph\_api\_clients

graph\_api\_tokens

graph\_api\_metrics

graph\_api\_limits

graph\_api\_errors

graph\_api\_events

\---

\# TypeScript Interfaces

GraphRequest

GraphResponse

TraversalRequest

ProfileRequest

RecommendationRequest

DiscoveryRequest

ExplainResponse

GraphProjection

\---

\# Acceptance Criteria

Implementation is complete when

\- All graph access occurs through APIs.  
\- Consumers remain storage-independent.  
\- Search supports hybrid retrieval.  
\- Explainability is available for every intelligent endpoint.  
\- SDKs mirror API contracts.  
\- Bulk operations are supported.  
\- Streaming is event-driven.  
\- APIs remain versioned.  
\- Events are emitted.  
\- Audit is complete.

\---

\# ADR Candidates

API architecture

Streaming protocol

SDK generation

Bulk synchronization

Explainability contract

Graph abstraction

\---

\# End RFC-3014  
