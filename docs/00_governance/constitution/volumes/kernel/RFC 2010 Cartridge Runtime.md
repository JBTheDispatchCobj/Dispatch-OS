\# RFC-2010  
\# Cartridge Runtime

Status: Draft 1.0

Owner

Auric Works

Authority

\- Dispatch Constitution  
\- RFC-2001  
\- RFC-2009

Applies To

Every cartridge installed within Dispatch.

\---

\# Purpose

The Cartridge Runtime is the execution environment for all domain-specific capability.

The Runtime exists so the Kernel never requires modification when supporting a new industry, customer, workflow, or product.

A cartridge extends Dispatch.

It never changes Dispatch.

\---

\# Philosophy

The Kernel provides primitives.

Cartridges provide behavior.

The Runtime binds them together.

The Runtime is responsible for safely loading, validating, executing, monitoring, and unloading cartridges.

\---

\# Core Principle

Every domain belongs in a cartridge.

Never in the Kernel.

\---

\# Cartridge Definition

A cartridge is a versioned package that extends Dispatch through configuration, contracts, workflows, schemas, prompts, policies, and renderers.

Cartridges are isolated.

Composable.

Replaceable.

Upgradeable.

\---

\# Cartridge Types

Domain

Role

Workflow

Connector

Publication

Analysis

Integration

Utility

System

Multiple cartridge types may coexist.

\---

\# Runtime Responsibilities

Load cartridges

Resolve dependencies

Validate compatibility

Register extensions

Initialize services

Expose capabilities

Enforce isolation

Unload safely

Record usage

Emit events

\---

\# Cartridge Manifest

Every cartridge contains

UUID

Name

Version

Author

Owner

Dependencies

Supported Kernel Version

Supported Runtime Version

Object Extensions

Workflow Extensions

Connector Bindings

Prompt Packages

Policy Packages

Evaluation Fixtures

Migration Scripts

\---

\# Runtime Lifecycle

\`\`\`text  
Discovered

↓

Validated

↓

Installed

↓

Registered

↓

Initialized

↓

Active

↓

Suspended

↓

Updated

↓

Retired

↓

Removed  
\`\`\`

The Runtime owns lifecycle.

Not the cartridge.

\---

\# Dependency Resolution

Dependencies may include

Objects

Schemas

Policies

Connectors

Prompts

Other Cartridges

Models

Circular dependencies are prohibited.

Missing dependencies prevent activation.

\---

\# Extension Points

A cartridge may extend

Objects

Profiles

Relationships

Workflows

Policies

Prompts

Renderers

Publications

Evaluations

Metrics

Nothing else.

Kernel services remain immutable.

\---

\# Isolation

A cartridge cannot

Modify Kernel code

Modify another cartridge

Bypass permissions

Bypass audit

Bypass truth

Bypass cost accounting

Access unauthorized tenants

Isolation is enforced by the Runtime.

\---

\# Execution Model

\`\`\`text  
Kernel

↓

Runtime

↓

Manifest

↓

Registry

↓

Initialization

↓

Execution

↓

Events

↓

Metrics

↓

Audit  
\`\`\`

\---

\# Registration

During installation the Runtime registers

Objects

Schemas

Workflows

Prompts

Policies

Permissions

Metrics

Evaluations

Failures abort installation.

\---

\# Configuration

Every cartridge exposes

Settings

Feature Flags

Thresholds

Visibility

Routing

Budgets

Notifications

Configuration is versioned.

\---

\# Migration

Every cartridge ships

Schema migrations

Data migrations

Rollback strategy

Compatibility matrix

Migration failures trigger rollback.

\---

\# Runtime Events

CartridgeDiscovered

CartridgeValidated

CartridgeInstalled

CartridgeActivated

CartridgeSuspended

CartridgeUpdated

CartridgeRemoved

ExtensionRegistered

DependencyResolved

ValidationFailed

\---

\# Required Tables

cartridges

cartridge\_versions

cartridge\_dependencies

cartridge\_extensions

cartridge\_settings

cartridge\_events

cartridge\_usage

cartridge\_metrics

\---

\# API Contracts

InstallCartridge()

ValidateCartridge()

ActivateCartridge()

SuspendCartridge()

UpdateCartridge()

RemoveCartridge()

ResolveDependencies()

ListCapabilities()

\---

\# Metrics

Activation Time

Load Time

Execution Time

Failure Rate

Usage

Memory

CPU

Model Cost

Connector Usage

Workflow Count

\---

\# Security

Every cartridge executes

Within tenant boundaries.

Within permission boundaries.

Within audit boundaries.

Within budget boundaries.

No cartridge may elevate privileges.

\---

\# Acceptance Criteria

Complete when

\- Cartridges install without Kernel changes.  
\- Dependencies resolve automatically.  
\- Extensions register successfully.  
\- Runtime enforces isolation.  
\- Rollback functions.  
\- Usage is recorded.  
\- Events are emitted.  
\- Audit is complete.  
\- Metrics are exposed.  
\- APIs are versioned.

\---

\# ADR Candidates

Runtime architecture

Sandbox strategy

Extension API

Migration policy

Compatibility matrix

\---

\# End RFC-2010  
