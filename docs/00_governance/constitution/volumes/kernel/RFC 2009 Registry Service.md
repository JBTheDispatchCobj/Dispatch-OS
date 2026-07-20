\# RFC-2009  
\# Registry Service

Status: Draft 1.0

Owner

Auric Works

Authority

\- Dispatch Constitution  
\- RFC-2001  
\- RFC-2008

Applies To

Every configurable subsystem in Dispatch.

\---

\# Purpose

The Registry Service is the canonical configuration layer of Dispatch.

Nothing permanent should be hardcoded if it can be expressed as a Registry.

Registries define how Dispatch behaves.

The Kernel executes those definitions.

\---

\# Philosophy

Code should execute.

Registries should describe.

The Registry Service is the source of operational configuration.

Not application logic.

\---

\# Core Principle

Behavior belongs in registries.

Execution belongs in services.

\---

\# Registry Types

Object Registry

Connector Registry

Cartridge Registry

Workflow Registry

Prompt Registry

Policy Registry

Schema Registry

Model Registry

Role Registry

Metric Registry

Evaluation Registry

Notification Registry

Publication Registry

Every registry follows the same contract.

\---

\# Registry Contract

Every registry entry contains

UUID

Registry Type

Key

Version

Status

Owner

Created

Updated

Dependencies

Schema

Metadata

Visibility

\---

\# Registry Lifecycle

Draft

↓

Review

↓

Approved

↓

Active

↓

Deprecated

↓

Archived

No active registry entry is edited in place.

Version it.

\---

\# Registry Versioning

Registries are immutable.

Changes create new versions.

Consumers explicitly reference versions or use the latest approved release.

\---

\# Dependency Resolution

Registries may depend upon

Objects

Policies

Prompts

Schemas

Models

Other Registries

Circular dependencies are prohibited.

\---

\# Registry Validation

Every registry validates

Schema

Dependencies

References

Permissions

Naming

Version

before activation.

Invalid registries cannot execute.

\---

\# Dynamic Loading

The Kernel discovers capabilities through registries.

Not source code.

Adding a cartridge should require

Registration

↓

Validation

↓

Activation

No kernel modification.

\---

\# Prompt Registry

Prompts are configuration.

Every prompt records

Purpose

Version

Owner

Supported Models

Expected Inputs

Expected Outputs

Evaluation Set

Prompt history is permanent.

\---

\# Policy Registry

Policies include

Security

Routing

Visibility

Retention

Approval

Budget

Escalation

Policies are executable configuration.

\---

\# Schema Registry

Every object schema

Every event schema

Every workflow schema

Every connector schema

Every cartridge schema

is registered.

Schemas are versioned independently.

\---

\# Model Registry

Defines

Provider

Model

Capabilities

Latency

Cost

Context Window

Privacy

Routing Class

Evaluation Score

The Harness queries the Model Registry.

Not hardcoded providers.

\---

\# Evaluation Registry

Stores

Benchmarks

Regression Suites

Golden Outputs

Acceptance Fixtures

Human Ratings

Every intelligent subsystem references evaluation assets.

\---

\# Registry Events

RegistryCreated

RegistryUpdated

RegistryApproved

RegistryActivated

RegistryDeprecated

RegistryArchived

DependencyChanged

ValidationFailed

\---

\# Required Tables

registries

registry\_versions

registry\_dependencies

registry\_events

registry\_validations

registry\_permissions

registry\_metadata

\---

\# API Contracts

Register()

Validate()

Approve()

Activate()

Archive()

Lookup()

ResolveDependencies()

SearchRegistry()

\---

\# Security

Registry mutation requires

Explicit authority.

Registry reads follow tenancy and visibility rules.

Kernel registries remain platform-controlled.

\---

\# Acceptance Criteria

Complete when

\- Every configurable behavior originates from a registry.  
\- Registry validation is enforced.  
\- Dependencies are resolved.  
\- Registries are versioned.  
\- Activation is auditable.  
\- Prompts, policies, schemas, and models are registered.  
\- Kernel code does not hardcode registry data.

\---

\# ADR Candidates

Registry hierarchy

Validation engine

Dependency resolver

Version policy

Approval workflow

\---

\# End RFC-2009  
