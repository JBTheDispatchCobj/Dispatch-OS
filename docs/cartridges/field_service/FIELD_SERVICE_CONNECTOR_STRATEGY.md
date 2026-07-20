# FIELD_SERVICE_CONNECTOR_STRATEGY.md

# Dispatch OS — Field Service Connector Strategy

## 1. Purpose

This document defines how the Field Service Ops Cartridge should receive data without making manual entry the default operating mode.

Manual entry is a product failure if it becomes the primary data pathway.

Manual input should exist only for setup, exception handling, correction, approval, lightweight field capture, and human judgment.

The cartridge should be designed around automatic or semi-automatic data rails that listen to the systems the business already uses.

---

## 2. Core Principle

Dispatch should listen first, ask second.

The product promise is not:

> “Enter your business into Dispatch.”

The product promise is:

> “Dispatch listens to the systems, files, messages, reports, and field activity your business already creates, then turns the important moments into work, evidence, metrics, and improvement loops.”

---

## 3. Connector Ladder

The Field Service Ops Cartridge should support multiple data access modes.

The system should always prefer the highest-trust, lowest-friction pathway available.

### Mode 1 — Official API / OAuth / Webhook

Best mode.

Use when a source platform provides an approved integration path.

Ideal for field service management systems, phone/SMS platforms, calendars, accounting systems, payment processors, review/reputation platforms, and CRM systems.

Examples of data:

- new lead
- new job
- estimate created
- estimate approved
- job scheduled
- job completed
- invoice created
- payment received
- customer message
- missed call
- review posted

Cadence:

- real time to 15 minutes for operating events
- hourly/daily for management data

Rule:

Use official integration pathways first wherever possible.

---

### Mode 2 — Webhook/Event Listener

Use for live operating triggers.

Best for new requests, missed calls, customer texts, emergency requests, schedule changes, job status updates, blocked jobs, complaints, and payment events.

Cadence:

- real time to 5 minutes

Rule:

If money, labor, or customer trust can leak quickly, webhook/event intake is preferred.

---

### Mode 3 — API Polling

Use when webhooks are not available.

Polling cadence should depend on business urgency.

Recommended cadence:

- leads/messages: every 1–5 minutes
- job/schedule/status: every 5–15 minutes
- estimates: hourly to daily
- invoices/payments: daily
- recurring service: daily/weekly
- performance reports: weekly/monthly

Rule:

Do not poll everything in real time. Poll according to decision urgency.

---

### Mode 4 — Email Listener / Forwarding Inbox

Highly important for MVP.

Many field service systems send email notifications even when APIs are limited.

A customer can forward notifications or scheduled reports to a Dispatch inbox, such as:

`dispatch+client@yourdomain.com`

Useful for new lead alerts, contact form submissions, estimate approvals, job confirmations, schedule changes, payment notices, invoice aging reports, customer complaints, review alerts, parts/vendor updates, and daily reports.

Cadence:

- near real time for notifications
- daily/weekly for scheduled reports

Rule:

Email parsing is a first-class data rail, not a hack.

---

### Mode 5 — Phone / SMS Connector

Critical for field service.

Phone is often the actual front door of the business.

Sources may include RingCentral, OpenPhone, Dialpad, Twilio, CallRail, Google Voice, ServiceTitan Phones, missed call emails, and voicemail transcripts.

Data captured:

- inbound call
- missed call
- voicemail
- transcript
- SMS
- call disposition
- callback status

Cadence:

- real time

Rule:

Missed calls and unanswered texts are revenue leakage events.

---

### Mode 6 — Calendar / Schedule Sync

Useful when job schedule data is available through calendar feeds even if the FSM integration is weak.

Sources:

- Google Calendar
- Outlook Calendar
- iCal feed
- FSM calendar export

Data captured:

- scheduled job
- appointment changes
- technician assignment
- time slot
- cancellations
- reschedules

Cadence:

- every 5–15 minutes

Rule:

Calendar sync can provide operational visibility before deep FSM integration exists.

---

### Mode 7 — Scheduled Report Import

Use for daily/weekly management loops.

Sources:

- FSM reports
- QuickBooks reports
- spreadsheet exports
- invoice aging reports
- estimate pipeline reports
- callback/rework reports
- technician performance reports
- recurring service reports

Cadence:

- daily
- weekly
- monthly

Rule:

Scheduled reports are acceptable for management and improvement loops, not urgent dispatch loops.

---

### Mode 8 — Local / Folder Sync

The system should support a local-first posture.

A customer may maintain a Dispatch folder:

`Dispatch Inbox/`

- `Leads/`
- `Jobs/`
- `Invoices/`
- `Photos/`
- `Exports/`
- `Reports/`
- `Customer Notes/`
- `Parts/`

A local connector or cloud folder sync can monitor approved folders.

Sources:

- local desktop folder
- Google Drive
- Dropbox
- OneDrive
- SharePoint
- iCloud Drive

Cadence:

- near real time to daily

Rule:

Folder sync is a clean way to ingest files the customer owns without forcing manual form entry.

---

### Mode 9 — Lightweight Field Capture

Technician capture should be minimal.

Do not make technicians complete long forms.

Accept:

- one-tap status
- photo upload
- voice note
- parts-needed button
- customer-not-home button
- callback-risk button
- job-complete button
- signature capture where needed

Cadence:

- real time

Rule:

Field capture must be faster than texting the owner.

---

### Mode 10 — Manual Input

Manual input is allowed only as exception mode.

Use for correcting bad data, approving proposals, resolving data conflicts, adding missing context, one-off edge cases, setup/onboarding, and human judgment.

Rule:

Manual entry should not be the default way Dispatch learns the business.

If data is missing, create a data-gap workflow and ask:

> Why was this missing and how do we avoid asking again?

---

## 4. Input Cadence Rules

The faster the business can lose money, waste labor, disappoint a customer, or miss work, the closer to real time the data must be.

### Real Time to 5 Minutes

Use for new leads, missed calls, voicemails, texts, emergency requests, customer complaints, bad reviews, schedule changes, job blocked, and technician status changes.

### 5 to 15 Minutes

Use for schedule board updates, dispatch changes, tech en route/arrived/completed, calendar sync, and job status updates.

### Hourly

Use for estimate status, approved but unscheduled work, stale job status, missing evidence, incomplete closeout, and schedule gaps.

### Daily

Use for invoice status, payment status, completed-not-invoiced, recurring service due, service agreement renewals, review requests, and data quality checks.

### Weekly / Monthly

Use for technician performance, callback trends, margin leakage, source ROI, reactivation campaigns, operating maturity, and ROI reporting.

---

## 5. Source Health

Every source should have health tracking.

Track:

- last successful sync
- expected cadence
- failure count
- stale data flag
- missing required fields
- source reliability
- affected workflows
- fallback path

If a source misses its expected cadence, create a data pipeline repair work item.

Rule:

Missing source data is an operational exception, not an invitation for routine manual entry.

---

## 6. Data Gap Handling

Data gaps should become work.

Data gap examples:

- missing customer phone
- missing service address
- missing estimate amount
- missing invoice status
- missing technician assignment
- missing completion evidence
- missing job status
- missing payment status
- report not received
- source sync failed

Data gap response:

1. Create data gap work item.
2. Identify affected workflow.
3. Identify source system.
4. Request correction or fallback.
5. Track recurrence.
6. Update configuration if recurring.

Rule:

The product should measure data gaps and reduce them over time.

---

## 7. Integration Priority for MVP

The MVP should prioritize universal rails before deep vendor-specific integrations.

Priority order:

1. Phone/SMS/missed call intake
2. Email forwarding / notification parsing
3. Calendar or schedule sync
4. Scheduled report import
5. File/folder sync
6. Lightweight technician capture
7. Official API integrations where available
8. Vendor-specific webhooks where available

Rule:

Do not wait for perfect APIs to create value, but do not let manual input become the workaround.

---

## 8. Writeback Strategy

Avoid writeback early.

Read and normalize first.

Writeback may be added later for notes, status updates, customer messages, task completion, tags, and report attachments.

Writeback should require customer authorization, source system permissions, event logging, error handling, rollback or correction path, and human approval for high-risk actions.

Rule:

Dispatch should become trustworthy before it becomes authoritative in external systems.

---

## 9. Final Principle

The Field Service Ops Cartridge should be API/webhook-first, email/report-compatible, folder-sync-capable, and manual-only-by-exception.

The goal is a private operational database that stays current enough to trigger work, protect money, capture evidence, and improve the business without forcing the team to re-enter what already exists elsewhere.
