# 8008 — Schema Mapping & Transformation Engine V1 Release Complete

## Purpose

Map heterogeneous source fields and structures into canonical Dispatch objects without losing source meaning.

## Mapping Profile

- mapping_profile_id
- source
- source version
- target object
- target schema version
- field mappings
- transformations
- lookup tables
- defaults
- validations
- confidence rules
- owner
- status
- tests
- effective date

## Field Mapping Types

- direct
- renamed
- calculated
- concatenated
- split
- lookup
- conditional
- normalized
- reference resolved
- ignored with reason
- unmapped

## Transformation Library

- date normalization
- currency normalization
- percentage normalization
- identifier cleanup
- phone/address normalization
- name parsing
- enum mapping
- boolean mapping
- unit conversion
- balance sign normalization
- period derivation
- text classification
- relationship creation

## Mapping Rules

- Never overwrite raw source.
- Preserve source field name and value.
- Record transformation used.
- Distinguish default from supplied value.
- Do not map ambiguous fields automatically below threshold.
- Make institution-specific overrides explicit.
- Version every mapping profile.
- Test schema changes before activation.

## Derived Fields

Examples:

- total assets
- readiness score input
- contract renewal window
- age of policy
- stale evidence flag
- concentration percentage
- opportunity trigger

Derived fields require:

- formula
- inputs
- source periods
- precision
- confidence
- owner
- version

## Schema Drift

Detect:

- missing column
- new column
- type change
- enum change
- nested structure change
- date format change
- renamed sheet/table
- changed control total

Response:

- pause affected mapping when material
- preserve incoming source
- create drift exception
- run compatibility test
- approve mapping change
- reprocess if needed

## Outputs

- mapping registry
- transformation registry
- drift dashboard
- mapping exceptions
- field lineage
- test results

## Acceptance Tests

- Source values remain recoverable.
- Mapping version is attached to canonical records.
- Ambiguous fields route to review.
- Schema drift is detected.
- Derived fields are explainable.

## V1 Completion Additions

### Mapping Versioning

Mappings are immutable once used in production. Changes create a new semantic version and effective date. Every transformed field records source path, transformation IDs, mapping version, rule results, and output field.

### Safe Transformation

Transformations are deterministic, typed, testable, and side-effect free. Unrecognized values are preserved and routed; they are never silently coerced to a misleading default.

### Approval and Promotion

New or changed mappings move through draft, test, review, approved, active, deprecated, and retired states. Promotion requires fixture tests, backward-compatibility review, owner approval, and rollback instructions.
