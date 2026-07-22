# 8012 — Data Freshness & Incremental Synchronization V1 Release Complete

## Purpose

Keep institutional profiles current while controlling connector cost, API load, duplicate processing, and stale-data risk.

## Freshness Metadata

- source as-of date
- received date
- processed date
- expected cadence
- next expected date
- stale threshold
- critical stale threshold
- last successful sync
- last attempted sync
- refresh owner

## Freshness Classes

- real time
- near real time
- daily
- weekly
- monthly
- quarterly
- annual
- event driven
- ad hoc
- static until changed

## Incremental Sync Methods

- updated_since timestamp
- provider cursor
- change token
- sequence ID
- webhook event
- append-only file
- snapshot diff
- hash comparison
- source-defined delta

## Watermark Object

- connector instance
- object type
- last successful cursor
- last event time
- last source record
- sync version
- replay boundary
- status

## Late-Arriving Data

Rules:

- preserve source event time
- process in correct subject context
- update historical period
- recalculate dependent metrics
- flag reports already released
- require reapproval when material

## Deletion and Tombstones

- preserve deletion event
- distinguish source deletion from business closure
- do not hard-delete governed history
- mark canonical status
- evaluate downstream impact
- respect tenant retention

## Freshness UI

Every material field/dashboard should show:

- as-of
- freshness state
- source
- confidence
- last sync result

## Alerts

- source late
- connector stale
- cursor stuck
- repeated full reload
- excessive lag
- failed delta
- historical correction
- material deletion

## Acceptance Tests

- Incremental sync resumes from durable watermark.
- Late data updates the correct period.
- Stale dashboards are visibly labeled.
- Deletions preserve history.
- Material corrections trigger downstream impact review.

## V1 Completion Additions

### Freshness Policy

Freshness is field- and use-case-specific. Each policy declares expected cadence, aging threshold, stale threshold, grace period, owner, and downstream behavior.

### Incremental Safety

Watermarks are committed only after accepted processing. Backfills and late-arriving records use source event time and system processing time. Deletions require explicit tombstones or verified snapshot comparison; absence alone is not deletion.

### Stale-Data Behavior

Stale facts remain visible with labels and lineage. Policy may block scoring, recommendations, or final outputs when required facts exceed freshness thresholds.
