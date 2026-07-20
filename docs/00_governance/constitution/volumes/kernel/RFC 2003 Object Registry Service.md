\# RFC-2003  
\# Object Registry Service

Status: Draft 1.0

Owner: Auric Works

Authority

\- Dispatch Constitution  
\- RFC-2001  
\- RFC-2002

Applies To

Every object inside Dispatch.

\---

\# Purpose

The Object Registry is the canonical source of identity for every meaningful thing known to Dispatch.

The Registry exists so every subsystem references the same object rather than creating local representations.

Every object enters Dispatch exactly once.

Everything else references it.

\---

\# Philosophy

The Registry is not a database table.

It is the canonical namespace of Dispatch.

Objects are permanent.

Schemas evolve.

Identity does not.

\---

\# Object Definition

An object is any entity, concept, event, document, relationship, workflow, person, institution, product, or artifact requiring identity.

Objects may represent

Physical things

Digital things

People

Organizations

Processes

Knowledge

Events

Relationships

Outcomes

Documents

Models

Workflows

\---

\# Core Principles

Every object

Has one UUID.

Has one canonical type.

Owns one lifecycle.

May have many schemas.

May have many relationships.

May exist in multiple tenants.

Never duplicates identity.

\---

\# Canonical Object Structure

Every object contains

UUID

Type

Version

Status

Owner

Tenant Visibility

Created

Updated

Source Count

Relationship Count

Confidence

Metadata

Objects never contain presentation.

\---

\# Object Types

Institution

Person

Role

Startup

Vendor

Product

CUSO

Fund

Investment

Relationship

Workflow

Task

Observation

Claim

Fact

Inference

Recommendation

Intelligence Object

Article

Publication

Meeting

Decision

Policy

Connector

Cartridge

Prompt

Model Run

Document

Media

Metric

Outcome

Event

Additional types may be registered.

\---

\# Object Lifecycle

\`\`\`text  
Discovered

↓

Created

↓

Validated

↓

Active

↓

Extended

↓

Deprecated

↓

Archived  
\`\`\`

Deletion is exceptional.

Archiving is preferred.

\---

\# Object Versioning

Objects never change identity.

Only versions change.

\`\`\`text  
UUID

↓

Version 1

↓

Version 2

↓

Version 3  
\`\`\`

Consumers always know which version they reference.

\---

\# Canonical Naming

Every object receives

Canonical Name

Aliases

External Identifiers

Display Name

Search Name

Normalization Key

The Registry resolves duplicates.

\---

\# Entity Resolution

Potential duplicates are evaluated using

Identifiers

Names

Addresses

Domains

Relationships

Documents

Human review

Models assist.

The Registry decides.

\---

\# Object Ownership

Objects may be

Global

Tenant

Shared

Derived

Ownership governs mutation.

Not visibility.

\---

\# Object Extension

The Kernel defines the base object.

Cartridges extend.

Example

Institution

↓

Cooperative Markets

↓

Hospitality

↓

Manufacturing

↓

Healthcare

The base object remains unchanged.

\---

\# Object Metadata

Metadata must remain extensible.

Metadata is namespaced.

Example

kernel.\*

cooperative.\*

hospitality.\*

wealth.\*

Never flatten cartridge metadata into the Kernel.

\---

\# Relationships

Objects never store relationship logic.

Relationships exist independently.

Objects reference relationships.

Relationships reference objects.

\---

\# Object Events

Created

Validated

Merged

Split

Updated

Archived

Visibility Changed

Owner Changed

Relationship Added

Relationship Removed

Schema Extended

Every event is immutable.

\---

\# Registry Responsibilities

Assign UUIDs

Resolve duplicates

Manage versions

Register schemas

Register ownership

Register visibility

Expose lookup APIs

Expose search APIs

Support migrations

Maintain audit

\---

\# Registry Non-Responsibilities

Business rules

Publication

Recommendations

Prompt execution

Rendering

Reporting

Analytics

Editorial logic

These belong elsewhere.

\---

\# Registry APIs

RegisterObject()

LookupObject()

MergeObject()

SplitObject()

ArchiveObject()

SearchObjects()

ResolveEntity()

RegisterSchema()

RegisterExtension()

Every endpoint returns canonical objects.

\---

\# Required Tables

objects

object\_versions

object\_aliases

object\_types

object\_extensions

object\_visibility

object\_ownership

object\_events

entity\_resolution\_queue

schema\_registry

\---

\# TypeScript Interfaces

BaseObject

ObjectVersion

ObjectAlias

ObjectExtension

ObjectOwner

ObjectVisibility

ObjectSchema

EntityCandidate

MergeDecision

\---

\# Search

Search evaluates

Canonical Name

Aliases

Identifiers

Relationships

Metadata

Object Type

Visibility

Tenant

Confidence

Search never bypasses permissions.

\---

\# Merge Strategy

Duplicates never disappear.

They become

Primary Object

↓

Merged Object

↓

Historical Alias

References remain valid.

\---

\# Extension Strategy

Cartridges register

New fields

Validators

Rules

Workflows

Permissions

Renderers

The Kernel remains unchanged.

\---

\# Performance

Registry lookups must be

Deterministic

Cacheable

Versioned

Permission Aware

Low Latency

\---

\# Acceptance Criteria

Complete when

\- UUIDs are immutable.  
\- Versions are tracked.  
\- Duplicate resolution exists.  
\- Extensions are cartridge-driven.  
\- Search respects permissions.  
\- Merge history is preserved.  
\- Registry APIs are versioned.  
\- Object ownership is explicit.  
\- Events are emitted.  
\- Audit is complete.

\---

\# ADR Candidates

UUID generation

Entity resolution strategy

Version policy

Extension namespaces

Merge semantics

Object search architecture

\---

\# End RFC-2003

