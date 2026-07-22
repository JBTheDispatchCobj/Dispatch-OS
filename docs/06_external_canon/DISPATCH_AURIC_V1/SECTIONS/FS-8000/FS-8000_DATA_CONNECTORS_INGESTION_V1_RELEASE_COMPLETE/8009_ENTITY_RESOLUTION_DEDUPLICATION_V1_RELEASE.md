# 8009 — Entity Resolution & Deduplication V1 Release Complete

## Purpose

Resolve institutions, people, vendors, products, accounts, loans, documents, and relationships across fragmented sources.

## Resolution Targets

- institution
- executive/person
- vendor
- product
- branch
- account
- loan
- policy
- project
- document
- regulator
- startup
- fund

## Resolution Inputs

- stable identifiers
- legal name
- DBA
- address
- website/domain
- routing/charter/certificate ID
- tax or legal identifiers when permitted
- email
- phone
- title/organization
- product code
- account/source key
- document hash

## Match Levels

- deterministic
- high-confidence probabilistic
- candidate
- unresolved
- conflict

## Entity Resolution Record

- resolution_id
- source records
- candidate canonical object
- match signals
- conflicting signals
- score
- method
- model/rule version
- reviewer
- decision
- date
- audit

## Merge Rules

- preserve all source records
- maintain alias list
- preserve provenance by field
- do not merge separate legal entities solely by similar name
- do not merge people solely by name
- allow tenant-specific identity where global identity is unsafe
- support split/unmerge
- maintain redirect from deprecated IDs

## Deduplication Types

- exact record duplicate
- duplicate file
- duplicate event
- repeated snapshot
- alias institution
- person role duplicate
- vendor/product naming duplicate
- conflicting canonical object

## Human Review Queue

Prioritize:

- high-value institution conflict
- regulator ID mismatch
- person with multiple possible employers
- loan/account collision
- conflicting legal names
- merger/acquisition ambiguity
- low-confidence but high-impact relationship

## Outputs

- canonical identity
- alias index
- merge history
- conflict queue
- resolution confidence
- unmerge record

## Acceptance Tests

- Stable identifiers drive deterministic matches.
- Similar names alone do not force a merge.
- Merge history is reversible.
- Field provenance survives merging.
- Conflicts are visible to downstream workflows.

## V1 Completion Additions

### Match Policy

Exact authoritative identifiers may auto-link when tenant and object-type constraints agree. Probabilistic matches use weighted features, explainable scores, negative evidence, and policy thresholds. High-impact merges always require review.

### Survivorship

Merging identities does not erase claims. The surviving canonical object retains source-specific identifiers, aliases, conflicting attributes, merge rationale, reviewer, effective time, and undo link.

### False-Merge Protection

The system supports cannot-link constraints, protected identifiers, relationship inconsistencies, geographic contradictions, and temporal impossibilities. Ambiguous candidates remain separate until resolved.
