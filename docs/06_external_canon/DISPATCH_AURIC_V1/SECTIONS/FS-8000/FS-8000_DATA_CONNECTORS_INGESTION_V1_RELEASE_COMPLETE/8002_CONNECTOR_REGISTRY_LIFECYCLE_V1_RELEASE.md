# 8002 — Connector Registry & Lifecycle V1 Release Complete

## Purpose

Define how every connector is discovered, configured, authorized, monitored, versioned, suspended, and retired.

## Connector Object

```json
{
  "connector_id": "CONN-#####",
  "name": "",
  "provider": "",
  "category": "",
  "supported_domains": [],
  "supported_objects": [],
  "connection_modes": [],
  "authentication": [],
  "permissions": [],
  "sync_patterns": [],
  "mapping_profiles": [],
  "health": {},
  "version": "",
  "status": ""
}
```

## Connector Categories

- public dataset
- regulator
- email
- calendar
- cloud storage
- document management
- CRM
- core banking
- LOS
- mortgage
- payments
- accounting/ERP
- GRC/compliance
- ticketing
- project management
- data warehouse
- collaboration
- HRIS
- wealth
- insurance
- custom API
- SFTP/file drop

## Connection Modes

- OAuth
- API key
- service account
- database read replica
- webhook
- polling
- SFTP
- secure file upload
- emailed report
- manual export
- public download
- browser automation only when approved

## Connector Lifecycle

1. Discovered
2. Evaluated
3. Approved for development
4. Implemented
5. Tested
6. Security reviewed
7. Published
8. Configured by tenant
9. Active
10. Degraded
11. Suspended
12. Deprecated
13. Retired

## Connector Manifest

Required:

- connector identity
- provider
- use cases
- supported objects
- operations
- required scopes
- sensitive data categories
- auth method
- rate limits
- incremental sync method
- pagination
- cursor model
- deletion behavior
- error model
- retry behavior
- mapping profiles
- health checks
- test fixtures
- version history

## Capability Types

- read
- write
- create
- update
- delete
- subscribe
- search
- export
- attachment read
- metadata only

V1 should prefer read-only capabilities unless a governed workflow requires writing.

## Tenant Configuration

Each tenant connector instance stores:

- tenant
- connector
- account/workspace
- authorized user
- scopes
- secrets reference
- enabled objects
- sync cadence
- filters
- mapping profile
- retention
- last successful sync
- health
- owner
- approval

## Connector Health

Metrics:

- authentication status
- last successful call
- latency
- rate-limit status
- records received
- error rate
- schema drift
- mapping exceptions
- stale duration
- backlog
- webhook delivery status

## Security Requirements

- secrets in managed secret store
- least-privilege scopes
- token rotation
- tenant isolation
- revocation support
- no secrets in logs
- encryption in transit and at rest
- access audit
- provider terms review
- data-use documentation

## Connector Versioning

Breaking changes require:

- new version
- migration plan
- compatibility period
- mapping review
- regression tests
- tenant notification
- rollback path

## Outputs

- connector registry
- connector catalog
- tenant connection inventory
- health dashboard
- scope/permission report
- deprecation queue
- connector test report

## Acceptance Tests

- Connector capabilities are machine readable.
- Tenant scopes remain separate.
- Health failures create alerts.
- Revocation stops new access.
- Connector upgrades preserve version history.

## V1 Completion Additions

### Connector Contract

Each connector manifest declares authentication method, least-privilege scopes, supported objects, operations, pagination, rate limits, retry behavior, webhook capabilities, incremental-sync method, deletion semantics, data classifications, model-use restrictions, health checks, and owner.

### Tenant Authorization

A connector definition is global; a tenant connector instance is tenant-specific. Credentials, consent, selected scopes, schedules, filters, field mappings, and revocation state never cross tenants. Activation requires an authorized tenant administrator and creates an approval and audit record.

### Lifecycle Gates

`draft → reviewed → approved → available → configured → active → degraded → suspended → revoked → retired`.

A connector may enter `active` only after manifest validation, credential test, permission test, sample pull, schema compatibility check, and audit registration. Revocation stops new retrieval immediately and schedules credential destruction according to policy.

### Certification

V1 connector certification includes contract tests for authentication, pagination, rate limits, duplicate delivery, schema drift, permission denial, retry behavior, and revocation.
