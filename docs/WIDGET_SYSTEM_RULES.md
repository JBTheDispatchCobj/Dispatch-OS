# **WIDGET\_SYSTEM\_RULES.md**

# **Dispatch OS — Widget System Rules**

## **1\. Purpose**

This document defines how Dispatch OS should use reusable widgets to keep the product generic at the core layer while still allowing each business configuration to feel specific, useful, and operational.

Dispatch OS should not become a separate custom app for every business type.

The interface should be composed from configurable widgets.

A widget is a reusable operating component that can be driven by configuration, context, permissions, workflow state, and data.

---

# **2\. Core Principle**

The UI should be generic at the component level and specific at the configuration level.

The same widget should be able to support different business use cases because configuration controls:

* labels  
* fields  
* filters  
* entity types  
* workflows  
* checklist templates  
* evidence requirements  
* actions  
* permissions  
* display logic  
* report outputs  
* metrics

The widget does not need to know the industry.

The configuration tells the widget what to show and how to behave.

---

# **3\. What a Widget Is**

A widget is a reusable interface unit that helps a user operate part of the business loop.

A widget may support:

* input intake  
* work execution  
* review  
* approval  
* evidence collection  
* entity management  
* metrics  
* dashboards  
* reports  
* agent proposals  
* exceptions  
* feedback  
* ROI tracking

A widget is not a vertical feature.

A widget is a generic operating surface.

---

# **4\. Widget Design Rule**

Every widget should map to at least one part of the Dispatch OS loop:

Input → Context → Interpretation → Decision → Action → Evidence → Value → Feedback → Adaptation

If a widget does not support the loop, question whether it belongs.

---

# **5\. Core Widget Types**

## **5.1 Input Inbox Widget**

Purpose:

Show newly received inputs that need parsing, classification, matching, review, or conversion.

Supports:

* uploaded documents  
* forwarded emails  
* manual entries  
* CSV imports  
* system alerts  
* connector events  
* notes  
* screenshots  
* reports

Configurable fields:

* input type  
* source  
* status  
* confidence  
* related entity  
* received time  
* review owner  
* proposed action

Primary actions:

* review input  
* classify input  
* match to entity  
* create work item  
* create evidence item  
* archive  
* reject  
* request more information

Rule:

Inputs should be staged before they mutate trusted records.

---

## **5.2 Entity Profile Widget**

Purpose:

Show the operating record for any configured entity type.

The widget should not assume what the entity is.

Examples of configured entity types:

* customer  
* vendor  
* asset  
* employee  
* location  
* project  
* account  
* document  
* deal  
* job  
* client  
* tenant

Configurable sections:

* summary fields  
* related work  
* related inputs  
* related evidence  
* related documents  
* related notes  
* related metrics  
* relationship map  
* history/events

Primary actions:

* edit entity  
* attach input  
* attach evidence  
* create work item  
* add note  
* run configured agent  
* generate report section

Rule:

Entity profiles should become the living context page for important business objects.

---

## **5.3 Work Queue Widget**

Purpose:

Show work items that need action, review, assignment, or completion.

Configurable fields:

* work item type  
* owner  
* priority  
* due date  
* status  
* related entity  
* workflow  
* evidence status  
* value category  
* escalation status

Views:

* my work  
* team work  
* overdue  
* blocked  
* awaiting review  
* awaiting approval  
* high priority  
* by workflow  
* by entity  
* by role

Primary actions:

* assign  
* start  
* pause  
* block  
* escalate  
* add note  
* add evidence  
* complete  
* request review

Rule:

The work queue is the execution cockpit of the business.

---

## **5.4 Work Item Detail Widget**

Purpose:

Show everything needed to understand, execute, and prove a specific work item.

Sections:

* title  
* status  
* owner  
* priority  
* due date  
* source input  
* related entities  
* checklist  
* notes  
* evidence  
* agent suggestions  
* approval state  
* event history  
* expected outcome  
* value category

Primary actions:

* update status  
* complete checklist  
* upload evidence  
* add note  
* request help  
* escalate  
* approve  
* reject  
* complete  
* reopen

Rule:

A work item should answer:

* What is this?  
* Why does it matter?  
* Who owns it?  
* What needs to happen?  
* What proves it happened?  
* What changed?

---

## **5.5 Checklist Widget**

Purpose:

Represent structured steps required to complete work.

Configurable behavior:

* required steps  
* optional steps  
* evidence-required steps  
* role-specific steps  
* conditional steps  
* completion rules  
* blocked state  
* review requirement

Primary actions:

* mark step complete  
* add note to step  
* attach evidence to step  
* flag blocker  
* request review

Rule:

Checklist completion should create events.

---

## **5.6 Evidence Panel Widget**

Purpose:

Show what proof exists and what proof is missing.

Evidence types:

* document  
* photo  
* note  
* approval  
* timestamp  
* source record  
* checklist completion  
* signature  
* report  
* exception explanation  
* agent output  
* human review

Configurable fields:

* evidence type  
* evidence requirement  
* source  
* related work item  
* related entity  
* review status  
* reviewer  
* created time  
* confidence

Primary actions:

* upload evidence  
* link existing evidence  
* classify evidence  
* approve evidence  
* reject evidence  
* request missing evidence

Rule:

Evidence is not an attachment afterthought. It is a first-class operating object.

---

## **5.7 Notes Widget**

Purpose:

Capture human and system commentary in structured relation to operating objects.

Notes may relate to:

* input  
* entity  
* work item  
* evidence  
* report  
* decision  
* approval  
* workflow  
* context

Configurable note types:

* general  
* internal  
* customer-facing  
* exception  
* review  
* approval  
* blocker  
* explanation  
* follow-up  
* system-generated

Rule:

Notes should be typed and related. Avoid creating an unsearchable dumping ground.

---

## **5.8 Agent Proposal Queue Widget**

Purpose:

Show agent-created suggestions awaiting review.

Proposal types:

* input classification  
* entity match  
* work item proposal  
* checklist proposal  
* evidence match  
* report section  
* configuration suggestion  
* ROI estimate  
* escalation  
* context update

Primary actions:

* accept  
* accept with edits  
* reject  
* request more evidence  
* convert to work item  
* convert to evidence  
* convert to context  
* convert to report  
* archive

Display requirements:

* agent name  
* source inputs  
* confidence  
* summary  
* proposed payload  
* evidence references  
* risk level  
* review requirement

Rule:

Agent proposals are not truth until approved or converted under configured automation rules.

---

## **5.9 Approval Queue Widget**

Purpose:

Show items requiring human approval.

Approval items may include:

* agent proposal  
* evidence acceptance  
* work completion  
* report sharing  
* configuration change  
* entity update  
* sensitive action  
* external output

Configurable fields:

* approval type  
* requested by  
* approver role  
* due time  
* risk level  
* source evidence  
* related object  
* status

Primary actions:

* approve  
* reject  
* request changes  
* escalate  
* add approval note

Rule:

Approvals should be separate from work completion.

---

## **5.10 Exception Dashboard Widget**

Purpose:

Show items that are abnormal, blocked, overdue, risky, incomplete, or outside configured expectations.

Exception types:

* overdue work  
* missing evidence  
* conflicting data  
* unmatched input  
* stale status  
* failed automation  
* rejected agent proposal  
* high-risk item  
* repeated issue  
* incomplete workflow  
* threshold breach

Primary actions:

* assign owner  
* create work item  
* escalate  
* dismiss with reason  
* update rule  
* request review

Rule:

Exceptions are where the OS reveals business friction.

---

## **5.11 Metrics Widget**

Purpose:

Show operating measurements derived from actual system activity.

Metric categories:

* execution  
* evidence  
* data quality  
* workflow  
* agent  
* risk  
* readiness  
* ROI  
* outcome

Configurable display:

* current value  
* trend  
* target  
* comparison  
* time period  
* related workflow  
* related entity  
* related report  
* drill-down

Rule:

Metrics should emerge from inputs, work, events, evidence, and outcomes.

---

## **5.12 Report Builder Widget**

Purpose:

Generate structured reports from approved inputs, evidence, metrics, notes, and events.

Report sections may be configured.

Report builder should support:

* source references  
* evidence references  
* metric inclusion  
* human review  
* draft generation  
* approval state  
* export/share controls

Primary actions:

* generate draft  
* edit section  
* attach evidence  
* approve report  
* export  
* share  
* archive

Rule:

Reports should be traceable back to source data and evidence.

---

## **5.13 ROI / Impact Widget**

Purpose:

Connect work and workflows to value.

Value categories:

* time saved  
* cost reduced  
* revenue created  
* revenue protected  
* risk reduced  
* data quality improved  
* evidence completeness improved  
* faster cycle time  
* fewer errors  
* improved transferability  
* improved customer experience

Primary actions:

* assign value category  
* estimate impact  
* compare before/after  
* mark recurring workflow  
* recommend repeat/deviate/innovate

Rule:

ROI does not have to be perfectly financial at first, but every recurring workflow should have a value hypothesis.

---

## **5.14 Feedback / Adaptation Widget**

Purpose:

Capture whether a loop worked and what should happen next.

Feedback decisions:

* repeat  
* deviate  
* innovate

Repeat means the loop worked and should become easier or more automated.

Deviate means the loop mostly worked but needs adjustment.

Innovate means the current loop is insufficient and a new workflow, rule, metric, source, or report is needed.

Primary actions:

* repeat workflow  
* edit workflow  
* adjust rule  
* update checklist  
* change evidence requirement  
* suggest automation  
* create new workflow  
* create configuration update proposal

Rule:

The OS should improve as the business uses it.

---

# **6\. Widget Configuration Schema**

Every widget should eventually support configuration for:

* widget type  
* title  
* description  
* data source  
* filters  
* visible fields  
* actions  
* permissions  
* role visibility  
* empty state  
* sort order  
* status logic  
* related object types  
* display labels  
* automation hooks  
* agent hooks  
* event logging  
* report usage

Example:

```json
{
  "widget_type": "work_queue",
  "title": "Open Work",
  "filters": {
    "status": ["open", "assigned", "in_progress", "blocked"]
  },
  "visible_fields": ["title", "owner", "priority", "due_at", "evidence_status"],
  "actions": ["assign", "start", "block", "complete"],
  "permissions": {
    "view": ["admin", "manager", "operator"],
    "complete": ["owner", "manager"]
  }
}
```

---

# **7\. Widget Composition**

Dashboards should be composed from widgets.

A dashboard is not a custom page.

A dashboard is a configured set of widgets for a role, workspace, workflow, entity, or outcome.

Dashboard examples:

* operator dashboard  
* manager dashboard  
* executive dashboard  
* exception dashboard  
* evidence dashboard  
* agent review dashboard  
* ROI dashboard  
* report dashboard

Rule:

Build reusable widgets first. Compose dashboards from widgets.

---

# **8\. Role-Based Widget Behavior**

The same widget may behave differently based on role.

Example:

A work queue for an operator may show:

* my assigned work  
* simple actions  
* required checklist  
* evidence upload

A work queue for a manager may show:

* team workload  
* blockers  
* overdue items  
* reassignment controls  
* approvals

A work queue for an executive may show:

* volume  
* completion  
* exceptions  
* impact metrics

Rule:

Do not create separate widgets for each role when configuration can handle the difference.

---

# **9\. Widget Event Logging**

Important widget actions should create events.

Examples:

* input reviewed  
* entity updated  
* work item started  
* checklist item completed  
* evidence uploaded  
* proposal accepted  
* approval granted  
* report generated  
* metric reviewed  
* configuration changed

Rule:

If the action changes operating reality, log an event.

---

# **10\. Widget Anti-Patterns**

Avoid:

* hardcoding vertical-specific UI into core widgets  
* building one-off pages before reusable widgets exist  
* hiding important actions without event logs  
* showing dashboards disconnected from real work  
* letting widgets mutate truth without permission checks  
* building agent UI without proposal/review states  
* treating evidence as normal file upload only  
* creating separate components for every business noun  
* over-designing executive dashboards before execution works

---

# **11\. Final Principle**

Dispatch OS should feel specific to each business without being custom-built each time.

Widgets make that possible.

The core widget system should allow the same primitives — input, entity, work, evidence, approval, metric, report, feedback — to become useful in many operating contexts through configuration.

