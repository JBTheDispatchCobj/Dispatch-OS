\# RFC-2012  
\# Memory Service

Status: Draft 1.0

Owner

Auric Works

Authority

\- Dispatch Constitution  
\- RFC-2001  
\- RFC-2011

Applies To

Every persistent context retained by Dispatch.

\---

\# Purpose

The Memory Service preserves operational context beyond a single execution, workflow, model invocation, or user session.

Models reason.

Memory persists.

The Memory Service is the long-term institutional memory of Dispatch.

\---

\# Philosophy

Models should never "remember."

Dispatch remembers.

Models consume memory.

The Kernel owns memory.

\---

\# Core Principle

Every useful interaction should improve future execution.

Memory exists to reduce repeated work, improve recommendations, increase relevance, and compound institutional knowledge.

\---

\# Memory Types

Global Memory

Institution Memory

Personal Memory

Relationship Memory

Workflow Memory

Operational Memory

Editorial Memory

Model Evaluation Memory

Connector Memory

Each memory type has different ownership and visibility.

\---

\# Memory Hierarchy

\`\`\`text  
Global

↓

Institution

↓

Department

↓

Workspace

↓

Workflow

↓

Relationship

↓

Individual  
\`\`\`

Higher layers inform lower layers.

Lower layers never automatically modify higher layers.

\---

\# Memory Definition

Every memory record contains

UUID

Memory Type

Owner

Tenant

Scope

Object References

Relationship References

Source References

Confidence

Visibility

Created

Updated

Expiration

Version

Metadata

\---

\# Memory Sources

Workflow Outcomes

User Corrections

Uploaded Documents

Relationship Activity

Public Facts

Recommendations

Model Evaluations

Operational Metrics

Published Intelligence

Manual Notes

Memory is never created directly by hallucination.

\---

\# Memory Lifecycle

\`\`\`text  
Observed

↓

Captured

↓

Validated

↓

Active

↓

Referenced

↓

Updated

↓

Archived  
\`\`\`

Deletion is exceptional.

\---

\# Memory Scope

A memory may belong to

One Person

One Organization

One Workflow

One Relationship

One Cartridge

The Global Graph

Scope is explicit.

\---

\# Memory Ownership

Ownership remains separate from visibility.

Examples

A credit union owns

Internal operating notes.

Auric Works owns

Editorial guidance.

A person owns

Personal preferences.

The Global Graph owns

Public facts.

\---

\# Memory Retrieval

Retrieval evaluates

Tenant

↓

Permissions

↓

Scope

↓

Relevance

↓

Freshness

↓

Confidence

↓

Semantic Similarity

↓

Business Rules

Retrieval is deterministic before semantic ranking.

\---

\# Semantic Retrieval

Embeddings assist retrieval.

Embeddings never become memory.

The canonical record remains structured.

Embeddings are indexes.

Not truth.

\---

\# Memory Consolidation

Repeated observations strengthen memory.

Conflicting memories create review tasks.

Memory quality improves over time.

Never silently overwrite.

\---

\# Memory Expiration

Every memory defines

Review Date

Expiration Policy

Refresh Strategy

Retention Policy

Some memories never expire.

Others decay.

\---

\# Memory Events

MemoryCreated

MemoryUpdated

MemoryReferenced

MemoryExpired

MemoryArchived

MemoryCorrected

MemoryMerged

Every memory event is auditable.

\---

\# Memory Categories

Preference

Policy

Decision

Context

Relationship

Evidence

Procedure

Lesson

Outcome

Pattern

Each category has different retention behavior.

\---

\# Required Tables

memory\_records

memory\_versions

memory\_links

memory\_embeddings

memory\_events

memory\_reviews

memory\_retention

memory\_feedback

\---

\# API Contracts

CreateMemory()

UpdateMemory()

RetrieveMemory()

SearchMemory()

ArchiveMemory()

MergeMemory()

ReviewMemory()

\---

\# Security

Memory follows

Tenant

↓

Scope

↓

Visibility

↓

Permissions

↓

Purpose

Private memories never become public through retrieval.

\---

\# Metrics

Retrieval Accuracy

Memory Reuse

Correction Rate

Staleness

Coverage

Reference Frequency

Review Backlog

\---

\# Acceptance Criteria

Complete when

\- Memory is independent of model providers.  
\- Retrieval respects permissions.  
\- Embeddings remain secondary indexes.  
\- Memory ownership is explicit.  
\- Memory expires according to policy.  
\- Conflicts create review.  
\- Events are emitted.  
\- Audit is complete.  
\- APIs are versioned.

\---

\# ADR Candidates

Memory hierarchy

Embedding strategy

Retention policy

Review policy

Semantic ranking

\---

\# End RFC-2012  
