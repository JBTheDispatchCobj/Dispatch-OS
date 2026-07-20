# FIELD_SERVICE_TRUTH_MODEL.md

# Dispatch OS — Field Service Truth Model

## 1. Purpose

This document defines what Dispatch owns, what it mirrors, what external systems remain authoritative for, and how the Field Service Ops Cartridge should handle missing, stale, or conflicting data.

The goal is to allow Dispatch to become the operational system of record without pretending to replace every source system on day one.

---

## 2. Core Principle

Dispatch is the system of record for the operating loop.

Dispatch owns:

- inputs received
- interpretations
- work items
- follow-ups
- exceptions
- evidence
- approvals
- agent proposals
- human decisions
- operating memory
- metrics
- reports
- ROI/impact
- repeat/deviate/innovate feedback

External systems may remain authoritative for:

- official accounting ledger
- final invoice
- payment processor record
- payroll
- tax
- native field service schedule
- source platform customer record
- official job record in the FSM

Dispatch does not need to replace those systems.

Dispatch needs to normalize their outputs into a private operating database and create the work loops they do not manage well.

---

## 3. Three-Layer Truth Model

### Layer 1 — Raw Source Layer

This layer preserves what came in.

Examples:

- API payload
- webhook event
- email body
- CSV row
- report file
- voicemail transcript
- SMS
- uploaded photo
- calendar event
- exported invoice row
- technician note

Rules:

- Raw source data should be preserved.
- Raw source data should not be edited.
- Raw source data should be traceable to source, timestamp, and ingestion event.
- Raw source data is evidence, not automatically operational truth.

Purpose:

> What did the source actually say?

---

### Layer 2 — Normalized Business Layer

This layer converts raw data into Dispatch’s canonical operating objects.

Examples:

- customer
- location
- request
- estimate
- job
- technician
- invoice
- payment
- callback
- service agreement
- part
- vendor
- complaint
- evidence item

Rules:

- Normalized objects may be created from one or more sources.
- Each normalized object should retain source references.
- Conflicting values should be flagged.
- Human approval may be required for important merges or corrections.
- Source precedence should be configurable.

Purpose:

> What does this mean operationally?

---

### Layer 3 — Action and Evidence Layer

This is Dispatch’s owned system of record.

Examples:

- work item created
- follow-up assigned
- stale estimate flagged
- job blocked
- data gap detected
- evidence missing
- invoice follow-up required
- callback review created
- agent proposal accepted
- manager approval recorded
- daily exception report generated
- value hypothesis updated

Rules:

- This layer belongs to Dispatch.
- Every meaningful action should produce an event.
- Evidence and approvals should be first-class records.
- Agent proposals should not become truth without approval or configured automation.

Purpose:

> What happened, who acted, what proves it, and what should happen next?

---

## 4. Source of Truth by Data Type

| Data Type | Official Source | Dispatch Role |
|---|---|---|
| Customer contact | FSM/CRM/phone/email | Mirror, normalize, detect gaps |
| Service location | FSM/CRM/job record | Mirror, normalize, validate |
| New request | Phone/email/form/FSM | Normalize, create intake work |
| Estimate amount/status | FSM/quote tool | Mirror, trigger follow-up |
| Job schedule | FSM/calendar | Mirror, trigger dispatch visibility |
| Job status | FSM/tech capture | Mirror or own depending setup |
| Technician assignment | FSM/calendar | Mirror, detect gaps |
| Job notes/photos | FSM/tech capture/Dispatch | Mirror or own evidence |
| Invoice | FSM/QuickBooks | Mirror, trigger cash loop |
| Payment | QuickBooks/payment processor | Mirror, close payment loop |
| Callback | FSM/customer message/Dispatch | Normalize, create quality loop |
| Complaint/review | Email/SMS/review platform | Normalize, create rescue loop |
| Work item | Dispatch | System of record |
| Evidence completeness | Dispatch | System of record |
| Agent proposal | Dispatch | System of record |
| Approval | Dispatch | System of record |
| Operating report | Dispatch | System of record |
| ROI/impact | Dispatch | System of record |

---

## 5. Canonical Record Rules

Dispatch may maintain canonical records for operational use.

A canonical record should include:

- canonical ID
- source references
- source priority
- current value
- confidence
- last updated timestamp
- related workspace
- related entities
- conflict status
- approval status where needed

Rule:

The canonical record is Dispatch’s best operational view, not necessarily the legal/accounting source of truth.

---

## 6. Source Precedence

When multiple sources provide the same field, Dispatch needs precedence rules.

Example precedence:

- invoice amount: QuickBooks > FSM > report > manual
- payment status: payment processor/QuickBooks > FSM > email > manual
- job schedule: FSM > calendar > email > manual
- customer phone: FSM/CRM > phone system > email signature > manual
- customer complaint: direct message/review > internal note > agent inference
- evidence: uploaded photo/source file > note > agent summary

Rule:

Precedence should be configurable and visible.

---

## 7. Conflict Handling

A conflict exists when two sources disagree on an important value.

Examples:

- invoice paid in QuickBooks but open in FSM
- job completed in FSM but still scheduled in calendar
- estimate approved by email but open in quote report
- customer phone differs across records
- job amount differs between estimate and invoice

Conflict workflow:

1. Detect conflict.
2. Create source conflict event.
3. Stage proposed canonical value.
4. Create reconciliation work item if needed.
5. Human approves or corrects.
6. Preserve source values and decision.
7. Update precedence if recurring.

Rule:

Do not silently overwrite conflicts in important records.

---

## 8. Stale Data Handling

Data is stale when expected source updates do not arrive or an operating status has not changed within the expected window.

Examples:

- no job report received by 7 AM
- schedule sync failed
- job status unchanged after arrival
- estimate report not received
- invoice report older than one day
- payment sync failed
- source connector expired

Stale data response:

1. Flag source health issue.
2. Mark affected metrics as stale.
3. Create data pipeline repair work item.
4. Use fallback source if configured.
5. Notify responsible role.

Rule:

Stale data should reduce confidence in metrics and reports.

---

## 9. Missing Data Handling

Missing data is an operational issue.

Examples:

- missing customer phone
- missing service address
- missing job scope
- missing estimate amount
- missing assigned tech
- missing completion evidence
- missing invoice status
- missing payment status
- missing callback reason

Missing data response:

1. Create data gap work item.
2. Relate it to source and affected object.
3. Assign owner.
4. Track recurrence.
5. Add required field/checklist rule if repeated.
6. Improve source configuration where possible.

Rule:

Manual fill is allowed, but repeated missing data should become source/process improvement.

---

## 10. Human Approval Rules

Human approval is required for:

- merging duplicate customers
- resolving financial conflicts
- approving agent-generated entity changes
- approving evidence sufficiency for high-risk items
- publishing reports externally
- changing source precedence
- changing active configuration
- marking disputed invoices resolved
- warranty approval/denial
- high-value estimate exceptions
- customer rescue outcomes

Human approval may not be required for:

- low-risk classification
- creating draft/proposed work items
- attaching low-risk source references
- surfacing missing fields
- routine follow-up tasks
- event logging

Rule:

Important meaning should be approved. Low-risk visibility can be automated.

---

## 11. Dispatch-Owned Records

Dispatch should fully own:

- work_items
- work_item_events
- evidence_items
- agent_runs
- agent_proposals
- approvals
- notes
- reports
- metrics
- outcomes
- data_gaps
- source_health
- canonical operating mappings
- feedback decisions

Rule:

These objects should not depend on external systems to be useful.

---

## 12. External Writeback

External writeback is optional and should be delayed until trust is established.

Potential writeback later:

- add note to source job
- update tag/status
- send customer message
- attach report/evidence
- create task in source system
- update closeout field

Writeback should require:

- official API or approved pathway
- customer authorization
- permission checks
- event logging
- error handling
- human approval for high-risk actions

Rule:

Early Dispatch should read, normalize, and act internally before writing back externally.

---

## 13. Reporting Truth

Reports should clearly indicate:

- report date/time
- source data used
- source freshness
- known missing data
- known conflicts
- metrics based on observed facts
- metrics based on estimates
- human approval state

Rule:

Do not create false confidence. If data is stale or incomplete, the report should say so.

---

## 14. Final Principle

Dispatch becomes valuable when it owns the operating truth layer.

It does not need to replace every external system.

It needs to know:

- what came in
- what it means
- what needs action
- what proves completion
- where data is missing
- where money leaks
- what changed
- what should happen next time

That is the system of record Dispatch should own.
