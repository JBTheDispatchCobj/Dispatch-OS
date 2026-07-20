\# RFC-3002  
\# Canonical Entity Model

Status

Draft 1.0

Owner

Auric Works

Authority

\- Dispatch Constitution  
\- RFC-2000  
\- RFC-3001

Applies To

Every Object represented in the Dispatch Knowledge Graph.

\---

\# Purpose

The Entity Model defines every "thing" Dispatch can know.

Entities represent existence.

Relationships represent interaction.

Truth represents confidence.

Entities are the atoms of the Dispatch universe.

\---

\# Philosophy

Dispatch does not model tables.

Dispatch models reality.

Reality is composed of entities.

Entities gain meaning through relationships.

No entity exists in isolation.

\---

\# Core Principle

Everything meaningful is an Entity before it becomes anything else.

Profiles are assembled from Entities.

Publications describe Entities.

Workflows operate on Entities.

Relationships connect Entities.

\---

\# Canonical Definition

An Entity is a uniquely identifiable representation of something that exists, existed, or is expected to exist.

Entities may represent

People

Organizations

Products

Places

Documents

Meetings

Events

Policies

Workflows

Investments

Ideas

Software

Services

Concepts

\---

\# Entity Characteristics

Every Entity possesses

Identity

Type

Lifecycle

Relationships

Metadata

Ownership

Visibility

Evidence

History

Time

Nothing else is required.

\---

\# Entity Hierarchy

\`\`\`text  
Entity

↓

Entity Type

↓

Attributes

↓

Relationships

↓

Truth

↓

Profile  
\`\`\`

Profiles are derived.

Entities are canonical.

\---

\# Entity Categories

\#\#\# Human

Person

Executive

Board Member

Employee

Founder

Advisor

Consultant

Investor

Customer

Member

\---

\#\#\# Organization

Credit Union

CUSO

Startup

Vendor

Fund

Association

Corporation

Government Agency

Nonprofit

Community

\---

\#\#\# Financial

Investment

Loan

Fund

Portfolio

Security

Capital Raise

Participation

Grant

Revenue Stream

\---

\#\#\# Operational

Workflow

Task

Project

Decision

Meeting

Initiative

Pilot

Program

Policy

\---

\#\#\# Knowledge

Observation

Claim

Fact

Inference

Recommendation

Publication

Research

Brief

Playbook

\---

\#\#\# Technology

Connector

Cartridge

Prompt

Terminal

API

Service

Model

Registry

SDK

\---

\# Entity Identity

Identity consists of

UUID

Canonical Type

Canonical Name

Version

Creation Timestamp

Identity never changes.

\---

\# Canonical Naming

Each Entity maintains

Canonical Name

Aliases

Abbreviations

External IDs

Search Keys

Normalized Name

Aliases improve discovery.

Canonical names remain stable.

\---

\# External Identity

Entities may reference

NCUA IDs

RSSD IDs

LEIs

CUSO Registry IDs

SEC CIK

Employer IDs

Vendor IDs

CRM IDs

External identities never replace Dispatch identity.

\---

\# Entity State

Unknown

Discovered

Validated

Active

Dormant

Historical

Archived

State is independent of truth.

\---

\# Attributes

Attributes describe an Entity.

Relationships do not.

Example

Institution

Assets

CEO

Headquarters

Charter Number

Core Provider

Fields remain descriptive.

Never relational.

\---

\# Extensions

Cartridges extend Entities.

Example

Institution

↓

Hospitality

↓

Healthcare

↓

Cooperative Markets

↓

Manufacturing

Kernel Entity remains unchanged.

\---

\# Classification

Entities may possess

Tags

Categories

Labels

Scores

Risk

Lifecycle

Capabilities

Classification remains configurable.

\---

\# Ownership

Ownership defines

Who may modify

not

Who may view.

Ownership types

Platform

Institution

Individual

Shared

Derived

\---

\# Visibility

Private

Internal

Shared

Public

Restricted

Visibility follows tenancy.

\---

\# Entity Events

EntityCreated

EntityValidated

EntityMerged

EntitySplit

EntityUpdated

EntityArchived

EntityRestored

Every transition emits Events.

\---

\# Entity Resolution

Potential duplicates evaluate

Identifiers

Names

Relationships

Domains

Addresses

Evidence

Human Review

Identity resolution is deterministic whenever possible.

\---

\# Entity Merge

Merged entities retain

Original UUID

History

Aliases

Relationships

Evidence

Nothing is discarded.

\---

\# Entity Split

If an Entity represents multiple real-world entities

It may split into

Primary Entity

Derived Entity

Historical References

References remain intact.

\---

\# Entity Indexes

Every Entity indexes

UUID

Type

Canonical Name

Aliases

External IDs

Tags

Visibility

Tenant

Relationships

Embeddings

\---

\# Required Tables

entities

entity\_types

entity\_aliases

entity\_versions

entity\_attributes

entity\_external\_ids

entity\_tags

entity\_visibility

entity\_history

entity\_events

\---

\# TypeScript Interfaces

Entity

EntityType

EntityVersion

EntityAlias

EntityAttribute

EntityIdentifier

EntityClassification

EntityVisibility

EntityOwnership

\---

\# APIs

CreateEntity()

UpdateEntity()

SearchEntities()

MergeEntities()

SplitEntity()

ArchiveEntity()

RestoreEntity()

ResolveEntity()

\---

\# Acceptance Criteria

Implementation is complete when

\- Every real-world concept begins as an Entity.  
\- Identity is immutable.  
\- Extensions remain cartridge-based.  
\- Merges preserve history.  
\- Splits preserve references.  
\- Ownership and visibility remain independent.  
\- External identifiers map without replacing UUIDs.  
\- APIs remain versioned.

\---

\# ADR Candidates

Entity taxonomy

Canonical naming

External identifier mapping

Merge policy

Split policy

Extension namespaces

\---

\# End RFC-3002  
