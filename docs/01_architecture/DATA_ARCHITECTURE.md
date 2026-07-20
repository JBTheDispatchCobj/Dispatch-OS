# Data Architecture

## Universal tables/domains
- organizations
- workspaces
- people
- roles
- entities
- entity_types
- relationships
- relationship_events
- sources
- source_documents
- observations
- claims
- calculations
- inferences
- verifications
- intelligence_objects
- content_variants
- personal_profiles
- profile_signals
- interests
- goals
- cartridges
- cartridge_installations
- cartridge_runs
- work_items
- evidence
- approvals
- outcomes
- model_runs
- usage_ledger
- audit_events

## Data design rules
- Immutable raw source records; derived layers reference them.
- Separate assertion from interpretation.
- Valid-time and observed-time where practical.
- Public, network-restricted, tenant-private, relationship-private, and personal visibility.
- Every relationship has evidence and history.
- JSON may extend objects but may not replace core indexed fields.
