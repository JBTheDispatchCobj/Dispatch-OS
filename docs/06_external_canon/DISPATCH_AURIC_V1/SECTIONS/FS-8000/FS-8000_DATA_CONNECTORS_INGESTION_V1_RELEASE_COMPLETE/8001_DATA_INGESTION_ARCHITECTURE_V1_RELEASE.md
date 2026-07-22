# 8001 — Data Ingestion Architecture V1 Release Complete

## Purpose

Define the universal ingestion layer that converts public data, connected systems, uploaded files, scheduled exports, email, reports, and human attestations into governed Dispatch objects.

The ingestion layer must support institutions that have mature APIs and institutions that operate through spreadsheets, email, reports, shared drives, and manual exports.

## Design Principles

- Accept fragmented data without pretending it is complete.
- Preserve the original source before transformation.
- Separate extraction from interpretation.
- Support live, scheduled, batch, and manual ingestion.
- Use canonical objects as the target.
- Maintain tenant isolation and source permissions.
- Make freshness, lineage, confidence, and reconciliation visible.
- Prefer incremental ingestion over repeated full replacement.
- Support human review where automation is unreliable.
- Never silently discard unrecognized data.

## Ingestion Modes

### Public Data

Examples:

- regulator datasets
- institution directories
- call reports
- SEC filings
- public websites
- press releases
- public executive profiles
- product documentation
- public vendor information

### Connected Data

Examples:

- Gmail
- calendar
- CRM
- core exports
- LOS
- data warehouse
- document store
- project tracker
- GRC system
- accounting system
- cloud storage
- API endpoints

### Uploaded Data

Examples:

- CSV
- XLSX
- PDF
- DOCX
- PPTX
- JSON
- ZIP
- email export
- image
- text/markdown

### Scheduled Export

Examples:

- daily CSV
- weekly report
- monthly financial package
- quarterly call report
- nightly SFTP drop
- emailed spreadsheet
- manually generated system report

### Human Attestation

Used when:

- no API exists
- the source is an executive judgment
- the institution must confirm ownership or status
- external data is incomplete
- a one-time configuration fact is needed

## Ingestion Pipeline

1. Source registration
2. Authentication or upload
3. Source snapshot
4. File/type identification
5. Malware and policy scan
6. Parsing
7. Structural profiling
8. Field extraction
9. Entity resolution
10. Canonical mapping
11. Validation
12. Deduplication
13. Reconciliation
14. Confidence assignment
15. Exception routing
16. Human review where needed
17. Object creation/update
18. Indexing
19. Audit logging
20. downstream event publication

## Ingestion Job Object

```json
{
  "ingestion_job_id": "INGEST-#####",
  "tenant_id": "",
  "source_id": "",
  "mode": "public|connector|upload|scheduled|attested",
  "trigger": "manual|schedule|event|API",
  "started_at": "",
  "completed_at": "",
  "status": "",
  "files_or_records_received": 0,
  "records_parsed": 0,
  "objects_created": 0,
  "objects_updated": 0,
  "exceptions": 0,
  "source_snapshot_id": "",
  "mapping_version": "",
  "audit_events": []
}
```

## Job Status

- queued
- authenticating
- receiving
- scanning
- parsing
- mapping
- validating
- reconciling
- awaiting review
- completed
- completed with exceptions
- failed
- cancelled
- quarantined

## Processing Guarantees

- Idempotent when the same source event is replayed.
- Original source remains recoverable.
- Partial failure does not erase successful records.
- Mapping version is preserved.
- Reprocessing creates an audit event.
- Tenant and object permissions apply immediately.
- Downstream workflows receive only accepted records.

## Data Tiers

### Raw

Immutable source snapshot.

### Parsed

Source structure represented without canonical interpretation.

### Normalized

Dates, numbers, identifiers, names, and field types standardized.

### Canonical

Mapped to Dispatch objects and relationships.

### Derived

Calculated metrics, scores, summaries, and inferred relationships.

### Approved

Human-reviewed facts or outputs ready for governed use.

## Failure Handling

Examples:

- unsupported file
- encrypted file
- corrupt archive
- failed authentication
- schema drift
- missing required fields
- ambiguous institution
- duplicate identity
- inconsistent totals
- stale export
- low-confidence extraction
- restricted data detected
- prompt injection or hostile content

Each failure creates:

- exception
- severity
- affected source
- affected records
- retry state
- owner
- next action
- audit entry

## Outputs

- source snapshot
- parsed dataset
- mapped object candidates
- exception queue
- ingestion report
- reconciliation report
- data-quality score
- published object events

## Acceptance Tests

- Can ingest API data, CSV, spreadsheet, PDF, email, and manual attestation.
- Replaying a source does not duplicate canonical records.
- Original source is preserved.
- Partial failures are visible and recoverable.
- Mapping and confidence are auditable.
- Restricted data can be quarantined.

## V1 Completion Additions

### Canonical Services and Storage Boundaries

The V1 implementation separates source registration, immutable source capture, parsing, mapping, resolution, quality, lineage, publication, and operations. Raw source bytes and source metadata are immutable. Parsed and normalized representations may be regenerated. Canonical object writes occur only after permission, validation, quality, and reconciliation gates pass.

### Transaction and Idempotency Contract

Every ingestion attempt carries `tenant_id`, `source_id`, `ingestion_job_id`, `idempotency_key`, `source_snapshot_id`, and `mapping_version`. Duplicate delivery returns the original processing result when the idempotency key and source fingerprint match. A changed payload with a reused key is rejected and logged as an integrity exception.

### Human Authority Gates

Automation may extract, normalize, compare, recommend, and stage object candidates. It may not silently approve attested facts, resolve material identity conflicts, override retention restrictions, or publish regulated conclusions. Human review is mandatory when confidence is below policy threshold, authoritative sources disagree, restricted data is detected, or a canonical overwrite would materially change an approved field.

### Performance Targets

- 95% of API events acknowledged within 2 seconds.
- 95% of ordinary files under 25 MB accepted or quarantined within 60 seconds.
- Batch ingestion supports at least 1 million rows per job through partitioned processing.
- Replays are deterministic for the same source snapshot, mapping version, and rule set.
- No accepted canonical field lacks field-level lineage.
