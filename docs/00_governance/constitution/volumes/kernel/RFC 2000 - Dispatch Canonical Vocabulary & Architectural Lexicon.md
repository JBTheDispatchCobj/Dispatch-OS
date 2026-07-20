\# RFC-2000  
\# Dispatch Canonical Vocabulary & Architectural Lexicon

Status: Draft 1.0

Owner

Auric Works

Authority

Dispatch Constitution V1.0

Applies To

Every RFC

Every ADR

Every API

Every Database Schema

Every Cartridge

Every Connector

Every Terminal

Every Publication

Every Workflow

Every Source File

\---

\# Purpose

This RFC establishes the permanent language of Dispatch.

Words are architecture.

A word must have exactly one meaning throughout the platform.

If terminology drifts, architecture drifts.

This document is the constitutional dictionary of Dispatch.

\---

\# Constitutional Rules

A term may have only one canonical definition.

New terms require an ADR.

Synonyms are prohibited inside specifications.

Business terminology may differ inside cartridges, but Kernel terminology never changes.

\---

\# Dispatch

The operating system.

Dispatch is the orchestration layer that coordinates knowledge, truth, relationships, workflows, intelligence, memory, and execution.

Dispatch is never a publication.

Dispatch is never a CRM.

Dispatch is never an AI model.

Dispatch is the operating system.

\---

\# Kernel

The permanent execution environment of Dispatch.

Owns universal capabilities.

Never owns domain logic.

\---

\# Terminal

A tenant-specific operating environment built on Dispatch.

A Terminal belongs to an organization.

Not a person.

\---

\# Auric Works

The operating company.

Builds Dispatch.

Operates services.

Publishes The Auric.

Provides professional services.

\---

\# The Auric

The intelligence publication.

Produces institutional-grade intelligence.

Consumes Dispatch.

Never replaces Dispatch.

\---

\# Cartridge

A versioned extension package.

Adds domain capability.

Never modifies the Kernel.

Examples

Cooperative Markets

Hospitality

Mortgage

Healthcare

Manufacturing

\---

\# Connector

A source adapter.

Acquires external information.

Normalizes it into Observations.

Never creates Truth.

\---

\# Runtime

The execution environment responsible for safely loading and operating cartridges or connectors.

\---

\# Registry

A canonical catalog of configuration.

Registries describe behavior.

Code executes behavior.

\---

\# Object

The canonical representation of any meaningful entity.

Everything significant is an Object.

Objects own identity.

Not history.

\---

\# Identity

Permanent uniqueness.

Identity never changes.

Versions change.

\---

\# Observation

Raw evidence acquired from a source.

Observations are immutable.

Observations are not truth.

\---

\# Claim

A structured statement extracted from one or more Observations.

Claims may be correct or incorrect.

\---

\# Verification

The process of confirming a Claim using trusted evidence.

\---

\# Fact

A verified Claim.

Facts remain linked to supporting evidence.

\---

\# Inference

Reasoning derived from Facts.

Inference is never Truth.

\---

\# Recommendation

A suggested action produced from

Facts

Inferences

Policies

Relationships

Goals

Recommendations are actionable.

Not authoritative.

\---

\# Intelligence Object

The canonical unit of synthesized intelligence.

Built from

Facts

Inferences

Relationships

Context

Goals

One Intelligence Object may become

Publication

Workflow

Brief

Alert

Recommendation

Meeting

Presentation

\---

\# Publication

A rendered view of one or more Intelligence Objects.

Never the source of truth.

\---

\# Profile

A continuously assembled operational view of an Object.

Profiles are generated.

Not manually maintained.

\---

\# Relationship

A first-class Object representing interaction between two or more Objects.

Relationships own

History

Confidence

Evidence

State

Recommendations

\---

\# Knowledge Graph

The network of

Objects

Relationships

Facts

Claims

Memory

Workflows

Events

The Graph is the operational memory of Dispatch.

\---

\# Memory

Persistent operational context.

Memory belongs to Dispatch.

Not to models.

\---

\# Workflow

A durable executable state machine.

Turns intelligence into operational work.

\---

\# Event

An immutable record that something occurred.

Objects represent state.

Events represent history.

\---

\# Audit

Permanent explanation of execution.

Audit explains

Who

What

Why

How

When

At what cost

\---

\# Truth

The currently verified understanding of reality.

Truth is explainable.

Versioned.

Auditable.

\---

\# Source

An external origin of information.

Examples

NCUA

SEC

Website

Email

API

Human Upload

\---

\# Evidence

Supporting material that validates Claims.

Evidence is immutable.

\---

\# Tenant

An ownership boundary.

Examples

Institution

Organization

Workspace

Personal

Global

\---

\# Workspace

A collaborative execution boundary inside a Tenant.

\---

\# Organization

A legal or operational entity.

Examples

Credit Union

Startup

Vendor

CUSO

\---

\# Institution

A regulated financial organization.

Implemented as a specialized Organization Object.

\---

\# Capability

Something Dispatch can perform.

Capabilities are model-independent.

Examples

Extraction

Classification

Planning

Comparison

Evaluation

\---

\# Model

A computational implementation of a capability.

Models are replaceable.

Dispatch capabilities are permanent.

\---

\# Harness

The orchestration layer that routes intelligent work.

Determines

Context

Model

Execution

Evaluation

\---

\# Context Pack

The bounded set of information assembled before intelligent execution.

Models never query Dispatch directly.

Dispatch builds Context Packs.

\---

\# Policy

Executable governance.

Policies determine

Permissions

Routing

Budgets

Escalation

Visibility

Retention

\---

\# Rule

Deterministic logic.

Rules execute before models whenever practical.

\---

\# Evaluation

Measurement of execution quality.

Evaluations improve routing.

Not truth.

\---

\# Cost

Measured operational resource consumption.

Independent from pricing.

\---

\# Usage

Consumption of platform capability.

Independent from cost.

\---

\# Public Graph

Knowledge available across tenants.

Never contains unauthorized private information.

\---

\# Private Graph

Tenant-owned operational knowledge.

Never becomes public without explicit authority.

\---

\# Operational Capacity

The measurable ability of an organization to execute better decisions with less friction.

This is the primary outcome Dispatch seeks to improve.

\---

\# Constitutional Test

When introducing a new concept ask:

Is this already defined?

Does it belong in the Kernel?

Can an existing term describe it?

Will another industry understand it?

Will it remain true in ten years?

If not,

create an ADR before adding terminology.

\---

\# End RFC-2000  
\# Canonical Vocabulary  
