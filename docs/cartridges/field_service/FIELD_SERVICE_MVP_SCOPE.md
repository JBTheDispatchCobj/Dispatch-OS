# FIELD_SERVICE_MVP_SCOPE.md

# Dispatch OS — Field Service Ops MVP Scope

## 1. Purpose

This document defines the first buildable MVP scope for the Field Service Ops Cartridge.

The MVP should prove that Dispatch can listen to field-service business inputs, normalize them into an operating database, trigger work, capture evidence, and connect actions to business impact.

The MVP should not attempt to replace a full field service management platform.

---

## 2. Core MVP Promise

The MVP should help a field-service owner answer:

- What new work came in?
- What have we not responded to?
- What estimates are stale?
- What approved work is not scheduled?
- What jobs are scheduled today?
- What jobs are blocked?
- What jobs are completed but missing evidence?
- What jobs are completed but not invoiced?
- What invoices are unpaid?
- What callbacks or complaints need attention?
- What recurring service or follow-up revenue is being missed?
- What data source is stale or broken?

The MVP is an operating exception and revenue-leakage layer.

---

## 3. MVP Positioning

Do not position the MVP as a full FSM replacement, CRM replacement, dispatch-board replacement, accounting system, payroll, inventory management, price book management, route optimization, or autonomous agent platform.

Position it as:

> A private field-service operating terminal that listens to existing systems and surfaces the moments where revenue, cash, labor, quality, or customer trust can leak.

---

## 4. MVP Inputs

The MVP should support these input rails first.

### 4.1 Email Listener

Accept forwarded emails and scheduled reports.

Examples:

- new lead notification
- estimate approved
- job confirmation
- customer complaint
- invoice/payment notice
- review alert
- daily report
- estimate report
- invoice aging report

### 4.2 Phone/SMS Events

Accept missed call, voicemail, and SMS events where available.

Examples:

- missed call
- voicemail transcript
- inbound text
- callback logged
- call disposition

### 4.3 Calendar / Schedule Sync

Accept schedule events.

Examples:

- scheduled job
- rescheduled job
- canceled job
- technician assignment
- appointment time

### 4.4 Scheduled Report Import

Accept CSV/XLSX/PDF/report exports.

Examples:

- open estimate report
- jobs report
- completed jobs
- invoice aging
- callback report
- recurring service report

### 4.5 Lightweight Field Capture

Allow minimal mobile capture.

Examples:

- job blocked
- parts needed
- job complete
- photo upload
- voice note
- customer unavailable

### 4.6 Manual Input

Exception only.

Examples:

- correction
- approval
- conflict resolution
- one-off context
- data gap repair

---

## 5. MVP Objects

The MVP should configure these entity/object types:

- Customer
- Location
- Request
- Estimate
- Job
- Technician
- Part / Material
- Invoice
- Payment
- Callback
- Complaint / Review
- Service Opportunity
- Evidence
- Source
- Data Gap

These may be implemented using generic OS entities and configured entity types.

---

## 6. MVP Workflows

### 6.1 New Request Intake

Trigger:

- new lead
- missed call
- voicemail
- customer text
- email request

Action:

- create intake work item
- match/create customer
- classify urgency
- assign follow-up

Value:

- revenue creation / revenue protection

---

### 6.2 Missed Call Recovery

Trigger:

- missed call with no callback within configured window

Action:

- urgent callback task
- escalate if emergency/high value
- track callback outcome

Value:

- revenue protection

---

### 6.3 Estimate Follow-Up

Trigger:

- estimate sent and no response after configured window
- high-value estimate created
- estimate lacks follow-up

Action:

- create follow-up task
- assign owner
- track disposition

Value:

- revenue conversion

---

### 6.4 Approved Estimate Scheduling

Trigger:

- estimate approved but not scheduled

Action:

- create scheduling work item
- escalate if not scheduled within threshold

Value:

- revenue capture / customer experience

---

### 6.5 Pre-Dispatch Readiness

Trigger:

- scheduled job missing required info

Action:

- create pre-dispatch blocker
- request missing scope/contact/access/parts/tech assignment

Value:

- labor efficiency / failed appointment prevention

---

### 6.6 Job Execution Visibility

Trigger:

- tech en route/arrived/completed/blocked
- stale job status

Action:

- update operating state
- create status check if stale
- notify dispatcher for blockers

Value:

- visibility / customer experience

---

### 6.7 Job Closeout

Trigger:

- job completed

Action:

- check evidence
- check invoice
- create missing evidence or invoice task
- create review request if eligible

Value:

- cash acceleration / risk reduction / reputation

---

### 6.8 Parts / Return Visit

Trigger:

- parts needed
- return visit required
- part ordered without ETA
- return visit unscheduled

Action:

- create parts workflow
- track vendor/ETA
- create return visit scheduling task

Value:

- cycle time / customer experience / revenue protection

---

### 6.9 Invoice / Payment Follow-Up

Trigger:

- completed not invoiced
- invoice unpaid
- payment received
- dispute detected

Action:

- create invoice/payment/dispute workflow
- close loop when paid
- escalate aging balances

Value:

- cash acceleration

---

### 6.10 Callback / Warranty Review

Trigger:

- callback
- warranty request
- rework
- repeated issue

Action:

- create quality review
- attach original job/evidence
- classify cause
- estimate margin impact

Value:

- margin protection / quality improvement

---

### 6.11 Complaint / Review Rescue

Trigger:

- complaint detected
- bad review posted
- negative customer message

Action:

- create rescue workflow
- notify manager/owner
- attach job/customer history
- track resolution

Value:

- customer retention / reputation / revenue protection

---

### 6.12 Recurring Service Opportunity

Trigger:

- service due
- renewal approaching
- completed job suggests maintenance plan

Action:

- create recurring scheduling or upsell task

Value:

- recurring revenue creation/protection

---

### 6.13 Data Pipeline Health

Trigger:

- expected report not received
- API sync failed
- source stale
- required fields missing
- source conflict detected

Action:

- create data gap or pipeline repair work item
- mark affected metrics/report sections as stale

Value:

- trust / visibility / operating reliability

---

## 7. MVP Widgets

Minimum widgets:

- Input Inbox
- Work Queue
- Today’s Jobs
- Missed Call / New Request Queue
- Open Estimate Queue
- Approved Not Scheduled Queue
- Blocked Jobs Queue
- Missing Evidence Queue
- Completed Not Invoiced Queue
- A/R Follow-Up Queue
- Callback / Complaint Queue
- Recurring Service Opportunity Queue
- Data Gaps / Source Health Queue
- Entity Profile
- Evidence Panel
- Event Timeline
- Daily Exception Report

---

## 8. MVP Metrics

Core metrics:

- new requests
- missed calls
- callback latency
- open estimates
- stale estimates
- approved not scheduled
- scheduled jobs
- blocked jobs
- completed jobs
- completed not invoiced
- jobs missing evidence
- unpaid invoice amount
- callbacks
- complaints
- recurring service opportunities
- data gaps
- source health
- average time to follow-up
- average time to schedule approved work
- closeout completeness
- evidence completeness
- proposal acceptance rate if agents are used

---

## 9. MVP Reports

### Daily Exception Report

Sections:

- New requests not handled
- Missed calls not returned
- Stale estimates
- Approved work not scheduled
- Today’s blocked/stale jobs
- Completed jobs missing evidence
- Completed jobs not invoiced
- Unpaid invoices needing follow-up
- Complaints/callbacks
- Recurring service opportunities
- Data gaps/source issues

### Weekly Impact Report

Sections:

- revenue leakage caught
- estimate follow-ups created
- approved work scheduled
- cash follow-ups created
- callbacks detected
- evidence completeness
- recurring opportunities
- operational bottlenecks
- repeat/deviate/innovate recommendations

---

## 10. MVP Agent Scope

Agents may assist with:

- parsing email notifications
- classifying input type
- matching customer/location
- summarizing voicemail/voice notes
- extracting estimate/job/invoice rows
- proposing work items
- classifying evidence
- drafting daily exception report

Agents should not:

- mark jobs complete without evidence
- approve evidence sufficiency for high-risk items
- write back to source systems without approval
- send customer messages without configuration/approval
- resolve financial conflicts autonomously
- publish reports externally without approval

Rule:

Agents propose. Humans approve. Events preserve.

---

## 11. MVP Exclusions

Do not build in MVP:

- full FSM replacement
- payroll
- inventory management
- full price book
- route optimization
- technician performance coaching engine
- autonomous sales outreach
- native mobile app unless already easy
- multi-vendor deep integrations
- marketplace
- benchmarking across companies
- external investor/acquisition outputs
- complex accounting reconciliation
- unlimited custom dashboards

---

## 12. MVP Acceptance Criteria

The MVP succeeds if:

1. Inputs can arrive from at least two non-manual sources.
2. New requests create work items.
3. Missed calls create urgent follow-up.
4. Estimates can be tracked and stale estimates create follow-up.
5. Jobs can be tracked by status.
6. Completed jobs can be checked for evidence and invoice status.
7. Unpaid invoices create follow-up.
8. Callbacks/complaints create escalation.
9. Data gaps create repair tasks.
10. Events are logged for important actions.
11. Evidence can be attached to work.
12. Daily exception report can be generated.
13. Metrics show operating improvement or leakage captured.
14. Manual entry is exception/correction, not primary flow.

---

## 13. Final Principle

The Field Service MVP should prove one thing:

> Dispatch can listen to the business, catch the moments where money or service quality leaks, create the right work, preserve proof, and show the owner what changed.

If it proves that, deeper integrations and additional workflows can come later.
