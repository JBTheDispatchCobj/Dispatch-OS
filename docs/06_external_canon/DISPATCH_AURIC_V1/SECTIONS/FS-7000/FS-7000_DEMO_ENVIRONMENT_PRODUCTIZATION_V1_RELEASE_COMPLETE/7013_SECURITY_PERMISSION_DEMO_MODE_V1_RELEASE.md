# 7013 — Security, Permission & Demo Mode V1

## Purpose

Define safe operation of demos and pilots across public, synthetic, internal, confidential, restricted, and privileged information.

## Data Classes

- public
- synthetic
- internal
- confidential
- restricted
- privileged
- regulated personal data

## Demo Modes

### Public Demo

- synthetic only
- no connected private data
- no real identities
- no production actions

### Institution Sandbox

- institution-approved sample data
- isolated environment
- limited users
- no external actions

### Controlled Pilot

- approved data
- role permissions
- evidence logging
- human approvals
- monitored connectors

## Roles

- presenter
- executive viewer
- operator
- compliance reviewer
- approver
- administrator
- auditor
- external guest

## Permission Rules

- least privilege
- role-based access
- object-level visibility
- evidence-level access
- download restrictions
- approval separation
- no agent escalation of privilege
- complete audit logging

## Sensitive Demo Controls

- watermark synthetic content
- mask account/customer identifiers
- disable external send
- disable trade/funding/binding actions
- reset credentials
- expire guest access
- preserve presentation audit log

## AI Controls

- approved models/providers
- data-retention settings
- prompt logging
- restricted data rules
- human review
- output labeling
- prohibited actions
- model-change approval

## Incident Scenarios

- unauthorized access attempt
- connector failure
- data leakage risk
- prompt injection
- evidence tampering
- approval bypass
- stale permission
- incorrect entity resolution

## Acceptance Tests

- Public demo contains no private data.
- Restricted evidence is permissioned.
- Agents cannot increase permissions.
- External-send functions are disabled in demo.
- Access and object changes are audited.
