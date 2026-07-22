# 8007 — Batch, SFTP & Scheduled Export Ingestion V1 Release Complete

## Purpose

Support institutions whose primary integration method is recurring reports, file drops, emailed exports, and batch data.

## Batch Sources

- SFTP folder
- cloud-storage folder
- emailed attachment
- scheduled report portal
- manual export
- secure upload
- database snapshot
- nightly file feed

## Batch Definition

- batch_id
- source
- tenant
- expected cadence
- expected file pattern
- expected schema
- arrival window
- timezone
- completeness rules
- encryption
- mapping profile
- retention
- owner
- escalation

## Arrival Monitoring

States:

- expected
- received
- late
- missing
- duplicate
- invalid
- processing
- complete
- complete with exceptions

## File Controls

- naming convention
- sequence number
- business date
- control total
- row count
- checksum
- encryption
- compression
- delimiter/encoding
- header/trailer records

## Reconciliation

Check:

- file count
- record count
- control total
- balance total
- date range
- duplicates
- missing keys
- prior-period variance
- source-system totals

## Incremental Versus Full Snapshot

Full snapshot:

- mark source period
- compare to prior snapshot
- identify removed records
- do not delete canonical objects without configured rules

Incremental:

- require stable key
- preserve event/action type
- handle late arrivals
- support correction records

## Late and Missing Batch Workflow

- alert owner
- create exception
- prevent stale dashboard from appearing current
- decide whether to use prior period
- document attestation
- record resolution

## Outputs

- batch calendar
- arrival dashboard
- reconciliation report
- exception queue
- source freshness status
- processing audit

## Acceptance Tests

- Late files trigger alerts.
- Control totals reconcile.
- Duplicate files are idempotent.
- Stale data is labeled.
- Full snapshots do not silently delete history.

## V1 Completion Additions

### Batch Control Record

Each batch declares expected filename/pattern, source, schedule, timezone, cutoff, encryption, checksum, row expectations, schema version, full/incremental mode, reconciliation totals, late policy, and owner.

### SFTP Controls

Use tenant-isolated credentials, host-key verification, least-privilege directories, encryption in transit, optional PGP at rest/in transit, atomic arrival conventions, checksum validation, and post-processing disposition.

### Close and Reconciliation

A batch is not complete until control totals, record counts, schema checks, duplicate checks, and applicable financial reconciliations pass or are formally waived by authorized review.
