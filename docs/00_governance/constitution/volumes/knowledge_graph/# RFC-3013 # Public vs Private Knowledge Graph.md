\# RFC-3013  
\# Public vs Private Knowledge Graph

Status

Draft 1.0

Owner

Auric Works

Authority

\- Dispatch Constitution  
\- RFC-2000  
\- RFC-3012

Applies To

Every Entity, Relationship, Fact, Memory, Profile, Workflow, Recommendation, Intelligence Object, Publication, and Terminal.

\---

\# Purpose

Dispatch operates one Knowledge Graph composed of multiple visibility domains.

The platform must allow organizations to benefit from collective intelligence without exposing private operational knowledge.

Public intelligence compounds.

Private intelligence differentiates.

\---

\# Philosophy

This is not multi-tenancy.

This is knowledge partitioning.

Every piece of knowledge answers three questions.

Who owns it?

Who can see it?

Who can benefit from it?

Ownership and visibility are independent.

\---

\# Core Principle

There is one graph.

There are many views.

The graph is universal.

Visibility is contextual.

\---

\# Canonical Layers

\`\`\`text  
Global Knowledge

↓

Market Knowledge

↓

Network Knowledge

↓

Institution Knowledge

↓

Department Knowledge

↓

Workspace Knowledge

↓

Personal Knowledge  
\`\`\`

Every lower layer inherits from higher layers.

Higher layers never inherit upward automatically.

\---

\# Public Graph

Contains knowledge intended for broad reuse.

Examples

NCUA Call Reports

SEC Filings

Public Websites

Industry Publications

Public Relationships

Public Companies

Industry Metrics

Public News

Open APIs

Public Intelligence Objects

No institution owns the Public Graph.

Dispatch curates it.

\---

\# Network Graph

Contains knowledge intentionally shared between participating organizations.

Examples

Pilot Programs

Shared Best Practices

Anonymous Benchmarks

Collaborative Research

Innovation Requests

Partner Introductions

Approved Publications

Participation is explicit.

Never inferred.

\---

\# Institution Graph

Contains institution-owned operational knowledge.

Examples

Internal Workflows

Private Documents

Operational Metrics

Customer Intelligence

Private Relationships

Private Notes

Internal Strategy

Recommendations

Institutional Memory

Ownership remains with the institution.

\---

\# Workspace Graph

Temporary collaboration space.

Examples

Projects

Due Diligence

Pilots

Working Groups

Board Committees

Cross-Institution Initiatives

Workspace knowledge expires or graduates.

\---

\# Personal Graph

Belongs to one identity.

Contains

Preferences

Personal Notes

Working Context

Career Memory

Learning

Private Drafts

Task Context

Personal knowledge is portable.

Employer knowledge is not.

\---

\# Graph Inheritance

Knowledge flows downward.

Example

Public Fact

↓

Institution

↓

Department

↓

User

Automatic.

Private knowledge requires explicit sharing.

\---

\# Sharing Model

Knowledge may be

Private

↓

Shared

↓

Network

↓

Public

Promotion requires policy.

Never automation.

\---

\# Ownership

Ownership types

Platform

Institution

Workspace

Individual

Shared

Derived

Ownership governs mutation.

Visibility governs retrieval.

\---

\# Derived Knowledge

Recommendations

Profiles

Briefings

Publications

Working Graphs

Context Packs

are derived.

They inherit visibility from supporting knowledge.

The most restrictive dependency wins.

\---

\# Cross-Tenant Intelligence

Dispatch may discover

patterns

across institutions.

Only aggregated intelligence may cross tenant boundaries.

Institution-specific information never leaks.

\---

\# Anonymous Intelligence

Dispatch may publish

Benchmarking

Trends

Adoption

Market Movement

Technology Usage

Risk Patterns

No institution is identifiable without permission.

\---

\# Promotion Workflow

Knowledge promotion follows

Private

↓

Review

↓

Approval

↓

Shared

↓

Review

↓

Public

Every promotion is auditable.

\---

\# Permission Resolution

Every query evaluates

Identity

↓

Tenant

↓

Ownership

↓

Visibility

↓

Purpose

↓

Policy

↓

Working Graph

No exceptions.

\---

\# Data Residency

Knowledge may include

Jurisdiction

Retention

Regulatory Scope

Geographic Restrictions

Policies may prevent movement between jurisdictions.

\---

\# Graph Events

KnowledgeShared

KnowledgeRevoked

KnowledgePromoted

KnowledgeDemoted

WorkspaceCreated

WorkspaceClosed

VisibilityChanged

OwnershipTransferred

Every change emits Events.

\---

\# Required Tables

knowledge\_visibility

knowledge\_sharing

knowledge\_ownership

workspace\_graphs

public\_graph

network\_graph

institution\_graph

personal\_graph

sharing\_requests

sharing\_history

\---

\# TypeScript Interfaces

KnowledgeScope

VisibilityPolicy

OwnershipPolicy

SharingRule

WorkspaceGraph

PromotionRequest

KnowledgeProjection

\---

\# APIs

ShareKnowledge()

PromoteKnowledge()

DemoteKnowledge()

TransferOwnership()

CreateWorkspace()

ResolveVisibility()

SearchVisibleKnowledge()

\---

\# Performance Goals

Support

Millions of institutions

Fine-grained visibility

Cross-tenant aggregation

Permission-aware graph traversal

Anonymous benchmarking

Instant sharing revocation

\---

\# Acceptance Criteria

Implementation is complete when

\- One graph supports multiple visibility domains.  
\- Ownership remains independent from visibility.  
\- Public knowledge compounds globally.  
\- Private knowledge never leaks.  
\- Anonymous aggregation functions.  
\- Promotion workflows require approval.  
\- Derived intelligence inherits the strictest visibility.  
\- Events are emitted.  
\- APIs remain versioned.  
\- Audit is complete.

\---

\# ADR Candidates

Visibility hierarchy

Cross-tenant aggregation

Promotion workflow

Anonymous benchmarking

Knowledge inheritance

Workspace lifecycle

\---

\# End RFC-3013  
