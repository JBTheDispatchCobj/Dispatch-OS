# 14008 — Data Migration, Seeding & Validation V1

## Purpose

Define how V1 data, profiles, registries, graph records, fixtures, and tenant configurations are loaded and validated.

## Migration Categories

- schema migration
- registry load
- cartridge load
- institution seed
- graph seed
- connector configuration
- tenant configuration
- demo fixtures
- pilot data
- historical data

## Migration Plan

- source
- target
- scope
- mapping version
- transformation
- validation
- reconciliation
- rollback
- owner
- schedule
- approval

## Validation

Check:

- record counts
- control totals
- canonical IDs
- relationship integrity
- source lineage
- tenant scope
- classification
- freshness
- version
- required fields
- duplicates
- orphan nodes

## Seed Order

1. registries
2. domain cartridges
3. institution types
4. public sources
5. institutions
6. executives/boards
7. vendors/products/systems
8. regulations/obligations
9. graph edges
10. readiness/opportunities
11. demo fixtures
12. tenant overlays

## Rollback

- preserve prior version
- migration checkpoint
- reverse mapping where possible
- quarantine failed data
- restore tenant configuration
- audit rollback

## Acceptance Tests

- Migration is repeatable.
- Counts and totals reconcile.
- Tenant scope is preserved.
- Failed migration can roll back.
- Post-migration Terminal and graph queries pass.
