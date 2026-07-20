# **CONFIGURATION\_RULES.md**

# **Dispatch OS — Configuration Rules**

## **1\. Purpose**

This document defines how Dispatch OS becomes specific to a business without hardcoding industries into the core product.

Configuration is the layer that converts generic primitives into useful operating meaning.

The Core OS provides the grammar.

Configuration provides the vocabulary, rules, standards, workflows, metrics, and outcomes for a specific business.

---

# **2\. Core Principle**

Dispatch OS must be generic at the primitive level and specific at the configuration level.

The core should not know any industry-specific noun by default.

The system should not assume what a customer, room, job, household, tenant, invoice, reservation, account, lead, project, or asset means.

Instead, configuration defines those things.

---

# **3\. What Configuration Does**

Configuration answers:

How does this business work?

It defines:

* what the business calls things  
* what entities exist  
* what inputs matter  
* what sources matter  
* what workflows exist  
* what rules apply  
* what evidence is required  
* what approvals are required  
* what roles exist  
* what metrics matter  
* what dashboards should show  
* what reports should produce  
* what agents are allowed to do  
* what outcomes matter  
* what value means

---

# **4\. Configuration Scope**

Configuration can exist at multiple levels.

## **4.1 System Configuration**

Default global behavior for Dispatch OS.

Examples:

* default input states  
* default work item statuses  
* default event types  
* default permission model  
* default agent safety rules

## **4.2 Organization Configuration**

Settings that apply across an entire customer organization.

Examples:

* company vocabulary  
* user roles  
* approval policies  
* data sharing rules  
* default dashboards  
* operating preferences

## **4.3 Workspace Configuration**

Settings that apply to a specific operating environment.

Examples:

* workflow templates  
* entity types  
* local rules  
* reporting structure  
* evidence requirements  
* source connectors

## **4.4 Packaged Configuration**

A reusable configuration bundle that can be installed into an organization or workspace.

This is what we may later call a cartridge.

A packaged configuration is not the core product.

It is a deployable operating pattern.

---

# **5\. Configuration Components**

## **5.1 Vocabulary**

Vocabulary defines business-specific language.

Examples:

* what the business calls customers  
* what the business calls work  
* what status labels mean  
* what roles are called  
* what outcomes are called  
* what stages exist

Vocabulary should affect UI labels and report language without changing the core object model.

Rule:

Language should be configurable wherever possible.

---

## **5.2 Entity Types**

Entity types define what kinds of things the business tracks.

Each entity type may define:

* label  
* description  
* required fields  
* optional fields  
* display fields  
* validation rules  
* relationship rules  
* default views  
* related workflows  
* related evidence requirements

Example entity type definition:

```json
{
  "name": "customer",
  "label": "Customer",
  "required_fields": ["name", "status"],
  "optional_fields": ["email", "phone", "lifetime_value"],
  "display_fields": ["name", "status", "owner"],
  "relationships": ["work_items", "documents", "notes"]
}
```

Rule:

Entity types should be configuration data, not database tables created for every business noun.

---

## **5.3 Input Types**

Input types define what kinds of inputs matter.

Each input type may define:

* source expectations  
* parsing method  
* classification logic  
* required fields  
* matching logic  
* review requirements  
* possible work item conversions  
* evidence treatment  
* retention rules

Input type examples:

* uploaded file  
* spreadsheet export  
* customer request  
* financial report  
* operational note  
* system alert  
* exception report  
* meeting note  
* email  
* form submission

Rule:

Inputs should enter staging before they update trusted records.

---

## **5.4 Source Types**

Source types define where data comes from.

Examples:

* manual upload  
* email forward  
* API  
* MCP connector  
* CSV export  
* spreadsheet  
* document folder  
* web form  
* mobile entry  
* calendar  
* external system

Source configuration may define:

* sync frequency  
* reliability score  
* access permissions  
* parsing rules  
* matching rules  
* error handling  
* required human review

Rule:

The OS should be useful even when source data arrives manually.

---

## **5.5 Workflows**

A workflow is a repeatable process.

Workflow configuration may define:

* name  
* trigger conditions  
* stages  
* default owner role  
* default checklist  
* default due date logic  
* required evidence  
* approval requirements  
* escalation rules  
* completion criteria  
* related metrics  
* related reports  
* expected outcome

Example workflow stages:

* intake  
* review  
* assignment  
* execution  
* evidence collection  
* approval  
* completion  
* reporting

Rule:

A workflow is a process template. A work item is an instance of that process.

---

## **5.6 Work Item Types**

Work item types define common categories of work.

A work item type may define:

* default title format  
* default description  
* default checklist  
* default priority  
* default role assignment  
* status path  
* evidence requirements  
* approval requirements  
* value category  
* related entity types

Examples:

* review  
* follow\_up  
* reconcile  
* collect\_document  
* approve  
* inspect  
* prepare\_report  
* resolve\_exception  
* update\_record  
* escalate

Rule:

Work item types should remain flexible enough to work across businesses.

---

## **5.7 Checklist Templates**

Checklist templates define steps required to complete work.

Each checklist item may define:

* label  
* description  
* required or optional  
* evidence required  
* role required  
* completion rule  
* sort order

Rule:

Checklists should be linked to workflow and work item configuration, not hardcoded in components.

---

## **5.8 Evidence Requirements**

Evidence requirements define what proof is needed.

Evidence requirements may depend on:

* work item type  
* workflow stage  
* entity type  
* risk level  
* approval requirement  
* report requirement  
* compliance requirement  
* outcome type

Evidence examples:

* document required  
* note required  
* photo required  
* approval required  
* source record required  
* timestamp required  
* manager review required

Rule:

Evidence requirements are how the system creates trust.

---

## **5.9 Approval Rules**

Approval rules define when human review is required.

Approval may be required for:

* agent proposals  
* input interpretation  
* record changes  
* workflow completion  
* evidence acceptance  
* report generation  
* external sharing  
* sensitive data use  
* market/outcome outputs  
* configuration changes

Approval rules may define:

* approver role  
* approval threshold  
* expiration time  
* escalation path  
* required notes  
* required evidence

Rule:

Important meaning should be human-approved before becoming trusted operating truth.

---

## **5.10 Automation Keys**

Automation keys define what triggers the operating loop.

An automation key connects input/context to interpretation and action.

Automation key examples:

* new input received  
* field missing  
* status unchanged  
* threshold exceeded  
* due date approaching  
* recurring exception detected  
* evidence missing  
* source mismatch  
* document uploaded  
* agent confidence above threshold  
* user flag added  
* report variance detected

Automation key configuration should define:

* trigger  
* condition  
* action  
* approval requirement  
* event logging  
* fallback behavior

Rule:

Automation keys must be configurable. They are not one-off code paths.

---

## **5.11 Metrics**

Metric configuration defines what the system measures.

Metric types:

* execution  
* evidence  
* data quality  
* workflow  
* financial  
* risk  
* readiness  
* agent  
* ROI  
* outcome

Each metric should define:

* name  
* description  
* calculation method  
* source objects  
* time window  
* owner  
* target  
* display rules  
* report usage

Rule:

Metrics should emerge from real operating activity.

---

## **5.12 Reports**

Report configuration defines structured outputs.

Reports may define:

* title  
* purpose  
* audience  
* sections  
* source data  
* required evidence  
* metric references  
* approval requirement  
* sharing rules  
* export format

Report types may include:

* operating report  
* exception report  
* readiness report  
* performance report  
* evidence report  
* ROI report  
* investor/customer/manager report

Rule:

Reports should be traceable back to source data, evidence, and events.

---

## **5.13 Dashboards**

Dashboard configuration defines visual operating views.

Dashboards are composed of widgets.

Dashboard configuration may define:

* audience  
* widgets  
* filters  
* permissions  
* metric cards  
* work queues  
* exception views  
* evidence completeness views  
* trend views  
* report shortcuts

Rule:

Dashboards should show operating reality, not vanity status.

---

## **5.14 Agent Instructions**

Agent configuration defines what agents are allowed to read, infer, propose, and do.

Agent configuration may define:

* agent purpose  
* allowed sources  
* forbidden sources  
* allowed outputs  
* required citations/evidence  
* confidence thresholds  
* proposal format  
* human review requirements  
* escalation conditions  
* cost limits  
* logging requirements

Rule:

Agents operate inside configured boundaries.

---

## **5.15 Outcome Definitions**

Outcome configuration defines what improvement means.

Outcomes may include:

* faster completion  
* fewer errors  
* more revenue  
* less risk  
* better evidence  
* cleaner data  
* less founder dependency  
* better reporting  
* higher conversion  
* lower cost  
* improved readiness

Each outcome should define:

* value category  
* related workflows  
* related metrics  
* expected impact  
* measurement method  
* review cadence

Rule:

The OS should connect recurring work to business value.

---

# **6\. Configuration Versioning**

Configuration must be versioned.

The system should know:

* which configuration was active when work was created  
* when a rule changed  
* who changed it  
* why it changed  
* what workflows were affected  
* whether historical records should remain under old logic

Rule:

Never overwrite business logic without preserving history.

---

# **7\. Configuration Lifecycle**

Configuration moves through stages:

1. Draft  
2. Review  
3. Active  
4. Deprecated  
5. Archived

Changes to active configuration should create events.

High-impact configuration changes may require approval.

---

# **8\. Configuration Creation**

Configuration can be created from:

* manual setup  
* onboarding wizard  
* imported SOPs  
* uploaded docs  
* existing workflow observation  
* agent-assisted extraction  
* cloned packaged configuration  
* prior customer template  
* repeated usage patterns

Rule:

Agents may help draft configuration, but humans approve configuration.

---

# **9\. Packaged Configurations**

A packaged configuration is a reusable set of operating assumptions.

It may include:

* entity types  
* workflows  
* rules  
* checklists  
* dashboards  
* reports  
* agent instructions  
* vocabulary  
* sample data  
* onboarding questions

Packaged configurations allow Dispatch OS to become useful faster.

But packaged configurations should not pollute the core.

Rule:

Packaged configuration is installed into the core. It does not become the core.

---

# **10\. Business-Specific Overrides**

Every business should be able to override configuration.

Overrides may include:

* terminology  
* thresholds  
* owner roles  
* evidence requirements  
* workflow steps  
* dashboard views  
* report language  
* automation approvals

Rule:

A configuration should provide a starting point, not a prison.

---

# **11\. Configuration Anti-Patterns**

Avoid:

* hardcoding business-specific terms into code  
* creating separate apps for each vertical  
* putting every edge case into the core schema  
* making JSON configuration unreadable and ungoverned  
* letting agents update configuration without review  
* using dashboards as configuration substitutes  
* failing to version configuration  
* failing to record why configuration changed  
* mixing customer-specific rules into packaged rules  
* assuming all businesses in a category work the same way

---

# **12\. Final Principle**

Configuration is the bridge between generic software and specific business reality.

The Core OS should ask:

What objects, loops, evidence, and metrics do all businesses need?

Configuration should answer:

For this business, what do those objects mean, when do they matter, what should happen, and how do we know if it worked?

