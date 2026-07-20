\# RFC-3003  
\# Relationship Graph

Status

Draft 1.0

Owner

Auric Works

Authority

\- Dispatch Constitution  
\- RFC-2000  
\- RFC-3002

Applies To

Every relationship between every Entity inside Dispatch.

\---

\# Purpose

The Relationship Graph is the most valuable asset in Dispatch.

Objects tell Dispatch what exists.

Relationships tell Dispatch why it matters.

Most operational intelligence comes from relationships, not entities.

\---

\# Philosophy

Traditional software stores relationships as foreign keys.

Dispatch stores relationships as living operational assets.

Relationships have identity.

Relationships evolve.

Relationships create opportunity.

\---

\# Core Principle

Nothing valuable exists in isolation.

Operational intelligence emerges from interactions.

The graph becomes exponentially more valuable as relationships increase.

\---

\# Canonical Definition

A Relationship is a first-class Object representing a meaningful connection between two or more Entities across time.

Relationships possess

Identity

Lifecycle

Evidence

Confidence

History

Memory

State

Recommendations

Ownership

Visibility

\---

\# Relationship Structure

\`\`\`text  
Relationship

↓

Source Entity

↓

Target Entity

↓

Relationship Type

↓

Evidence

↓

Confidence

↓

History

↓

Current State

↓

Recommendations  
\`\`\`

\---

\# Relationship Categories

Organizational

Financial

Operational

Strategic

Social

Regulatory

Commercial

Technical

Editorial

Knowledge

Relationships may belong to multiple categories.

\---

\# Canonical Relationship Types

Owns

Operates

Works For

Reports To

Invested In

Introduced By

Uses

Partners With

Competes With

Piloting

Evaluating

Member Of

Advises

Acquired

Built

Implements

Funds

Attended

Communicated With

Published

Mentions

Supports

Supersedes

Depends On

Every cartridge may register additional relationship types.

\---

\# Relationship Direction

Relationships are directional unless declared symmetric.

Examples

Institution

↓

Uses

↓

Core Provider

Symmetric Example

Institution

↓

Collaborates With

↓

Institution

Direction matters.

\---

\# Relationship Strength

Every relationship contains

Strength

Confidence

Recency

Frequency

Importance

Operational Impact

Strength evolves through evidence.

\---

\# Relationship Confidence

Confidence derives from

Evidence Quality

Verification

Observation Count

Freshness

Human Confirmation

Historical Accuracy

Confidence is calculated.

Never guessed.

\---

\# Relationship Lifecycle

\`\`\`text  
Observed

↓

Candidate

↓

Verified

↓

Active

↓

Dormant

↓

Historical

↓

Archived  
\`\`\`

Relationships mature.

They do not appear fully formed.

\---

\# Relationship History

Every relationship preserves

Creation

Changes

Evidence

Conversations

Workflow Outcomes

Meetings

Recommendations

Investment Activity

History is immutable.

\---

\# Temporal Relationships

Relationships exist through time.

Support

Effective Date

Expiration

Review Date

Historical State

Projected State

Dispatch understands evolution.

Not snapshots.

\---

\# Multi-Entity Relationships

Some relationships involve

More than two entities.

Example

Credit Union

↓

Startup

↓

CUSO

↓

Pilot

↓

Vendor

↓

Executive Sponsor

Represent as one relationship object with multiple participants.

Never duplicate.

\---

\# Relationship Metadata

Metadata may include

Contract Value

Ownership %

Role

Priority

Status

Region

Industry

Tags

Notes

Metadata is cartridge-extensible.

\---

\# Relationship Memory

Relationships accumulate

Meetings

Emails

Notes

Workflow Outcomes

Publications

Recommendations

Corrections

Relationship memory improves intelligence.

\---

\# Relationship Health

Healthy

Growing

Stable

Weakening

Dormant

Broken

Archived

Health is inferred.

Not manually maintained.

\---

\# Opportunity Detection

Relationships drive opportunity.

Examples

Executive moved institutions.

Startup shares investor.

CUSO already integrated vendor.

Board member introduced founder.

Partner uses competing solution.

Dispatch identifies opportunity from graph topology.

\---

\# Relationship Scoring

Every relationship may calculate

Influence

Trust

Activity

Reach

Opportunity

Operational Capacity

Relationship scores remain cartridge-specific.

\---

\# Relationship Events

RelationshipCreated

RelationshipValidated

RelationshipStrengthened

RelationshipWeakened

RelationshipMerged

RelationshipSplit

RelationshipArchived

RelationshipRecommended

Every change emits Events.

\---

\# Required Tables

relationships

relationship\_types

relationship\_states

relationship\_history

relationship\_strength

relationship\_scores

relationship\_evidence

relationship\_memory

relationship\_events

relationship\_participants

\---

\# TypeScript Interfaces

Relationship

RelationshipType

RelationshipState

RelationshipEvidence

RelationshipHistory

RelationshipParticipant

RelationshipScore

RelationshipHealth

\---

\# APIs

CreateRelationship()

UpdateRelationship()

MergeRelationship()

ArchiveRelationship()

SearchRelationships()

CalculateStrength()

RecommendRelationships()

GetRelationshipHistory()

\---

\# Acceptance Criteria

Complete when

\- Relationships are first-class Objects.  
\- Relationship identity is immutable.  
\- Evidence determines confidence.  
\- History is preserved.  
\- Multi-party relationships are supported.  
\- Opportunity detection operates on graph topology.  
\- Health evolves automatically.  
\- APIs remain versioned.  
\- Events are emitted.  
\- Audit is complete.

\---

\# ADR Candidates

Relationship taxonomy

Strength algorithm

Opportunity engine

Temporal model

Multi-party relationships

Graph traversal strategy

\---

\# End RFC-3003  
