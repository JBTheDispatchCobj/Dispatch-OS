\# RFC-2002  
\# Identity & Tenancy

Status: Draft 1.0

Owner: Auric Works

Authority:  
\- Dispatch Constitution  
\- RFC-2001

Applies To

\- Every User  
\- Every Organization  
\- Every Terminal  
\- Every Profile  
\- Every Cartridge  
\- Every Connector  
\- Every API  
\- Every Intelligence Object

\---

\# Purpose

Identity is the foundation of Dispatch.

Every action taken by the platform must answer three questions.

Who?

Where?

Under what authority?

Identity answers who.

Tenancy answers where.

Permissions answer authority.

These three systems are independent.

They must never be merged.

\---

\# Philosophy

Authentication proves identity.

Authorization proves permission.

Tenancy defines ownership.

Identity never changes because someone changes employers.

Permissions change frequently.

Tenancy changes occasionally.

These are different concepts.

\---

\# Core Principle

One person.

Many roles.

Many organizations.

Many permissions.

One identity.

Dispatch must support the same person simultaneously existing as

CEO

↓

Board Member

↓

Startup Founder

↓

LP

↓

Advisor

↓

Consultant

↓

Investor

↓

Guest

↓

Customer

↓

Vendor

without duplicating identity.

\---

\# Identity Hierarchy

\`\`\`text  
Person

↓

Identity

↓

Membership

↓

Role

↓

Permissions

↓

Session  
\`\`\`

Identity owns the person.

Membership owns participation.

Role owns responsibility.

Permissions own capability.

\---

\# Tenant Hierarchy

\`\`\`text  
Global Graph

↓

Organization

↓

Workspace

↓

Department

↓

Project

↓

Individual Workspace  
\`\`\`

Every object belongs to one or more tenants.

No object exists outside a tenancy.

\---

\# Tenant Types

Global

Public information.

Institution

A credit union.

Startup

A startup.

Vendor

A company.

Partner

Shared environments.

Project

Temporary collaboration.

Personal

Individual work.

Sandbox

Experimental.

Each has independent policy.

\---

\# Identity Object

Every identity contains

UUID

Legal Name

Preferred Name

Status

Authentication Methods

Public Profile

Private Profile

Relationships

Memberships

Audit History

Identity never contains permissions.

\---

\# Membership Object

Membership connects

Identity

↓

Organization

Membership contains

Join Date

Exit Date

Status

Role Assignments

Visibility

Approvals

Membership is historical.

\---

\# Role Object

Role defines

Responsibility

not

Authority.

Examples

CEO

CIO

Board Member

Examiner

Vendor

Founder

Operations

Analyst

Administrator

Roles remain portable.

Permissions do not.

\---

\# Permission Model

Dispatch supports hybrid

RBAC

\+

ABAC

RBAC

Defines broad capability.

ABAC

Refines capability using

Tenant

Object

Relationship

Classification

Purpose

Sensitivity

Workflow State

Time

\---

\# Permission Evaluation

Every request evaluates

Identity

↓

Membership

↓

Role

↓

Tenant

↓

Object

↓

Action

↓

Policy

↓

Decision

No model participates.

Permission is deterministic.

\---

\# Ownership

Ownership exists separately from visibility.

Example

Auric owns publication.

Institution owns notes.

Founder owns startup profile edits.

Global Graph owns public facts.

Ownership governs mutation.

Visibility governs reading.

\---

\# Shared Objects

Objects may exist in

Public

↓

Private

↓

Shared

↓

Derived

Shared objects require

Explicit policy.

Never inference.

\---

\# Personal Identity

Personal identity belongs to the individual.

Employer identity belongs to the organization.

Dispatch must separate

Portable experience

from

Institution-owned knowledge.

Changing employers should not destroy identity.

\---

\# Organization Identity

Organizations own

Policies

Private workflows

Private memory

Private relationships

Private documents

Institutional preferences

Organizations do not own people.

\---

\# Terminal Identity

A Terminal represents

an organization.

Not a user.

Users enter

through

identity.

Terminals never authenticate.

People authenticate.

\---

\# Authentication

Supported providers

OIDC

OAuth

SAML

Passkeys

Password

API Keys

Service Accounts

Authentication providers remain replaceable.

\---

\# Service Accounts

Connectors

Agents

Automation

Integrations

must authenticate independently.

Never impersonate humans unless explicitly delegated.

\---

\# Delegation

Users may delegate authority.

Delegation defines

Scope

Duration

Objects

Workflows

Approvals

Audit

Delegation expires.

\---

\# Multi-Organization Participation

One identity may belong to

Five credit unions.

Two startups.

One advisory board.

One investment committee.

One consulting engagement.

Simultaneously.

Dispatch must support this natively.

\---

\# Row Level Security

Every table evaluates

Tenant

↓

Role

↓

Policy

↓

Object Visibility

↓

Decision

No application code should bypass RLS.

\---

\# Object Visibility

Private

Internal

Shared

Public

Restricted

Visibility changes.

Identity does not.

\---

\# Identity Events

Identity Created

Membership Added

Role Assigned

Permission Changed

Authentication Added

Delegation Granted

Delegation Revoked

Organization Joined

Organization Left

Session Started

Session Ended

Every event is immutable.

\---

\# Session Model

Identity

↓

Authentication

↓

Session

↓

Requests

↓

Audit

Sessions never own permissions.

Permissions are evaluated continuously.

\---

\# Trust Levels

Anonymous

Authenticated

Verified

Institution Verified

Privileged

Administrator

System

Trust affects workflow.

Not identity.

\---

\# Identity Lifecycle

Invited

↓

Registered

↓

Verified

↓

Active

↓

Suspended

↓

Archived

Identity UUID never changes.

\---

\# Membership Lifecycle

Invited

↓

Pending

↓

Active

↓

Suspended

↓

Ended

↓

Historical

History remains permanent.

\---

\# Security Principles

Least Privilege

Default Deny

Explicit Grant

Auditable Access

Time Limited Delegation

Purpose Based Access

Revocable Sessions

Immutable Audit

\---

\# Required Tables

identities

organizations

memberships

roles

permissions

delegations

sessions

authentication\_methods

tenant\_policies

visibility\_rules

service\_accounts

api\_keys

\---

\# TypeScript Interfaces

Identity

Organization

Membership

Role

Permission

Tenant

Delegation

Session

ServiceAccount

Each interface is versioned.

\---

\# Acceptance Criteria

Implementation is complete when

\- One identity can belong to many organizations.  
\- Organizations cannot access each other's private graphs.  
\- RLS protects every tenant-owned table.  
\- Delegation is auditable.  
\- Sessions never contain authorization logic.  
\- Permissions are deterministic.  
\- Identity remains portable.  
\- Public and private ownership are separated.  
\- Authentication providers are replaceable.  
\- Every identity event is recorded.

\---

\# ADR Candidates

Identity UUID strategy

Tenant hierarchy

Permission engine

Delegation model

Service account policy

Authentication abstraction

RLS strategy

Organization ownership

\---

\# End RFC-2002  
