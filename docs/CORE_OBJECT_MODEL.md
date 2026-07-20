# **CORE\_OBJECT\_MODEL.md**

# **Dispatch OS — Core Object Model**

## **1\. Purpose**

This document defines the core primitives of Dispatch OS.

The Core Object Model must remain industry-agnostic.

The system should not be built around any one vertical, customer type, workflow, or domain noun.

The Core Object Model should answer:

What universal objects does every business need in order to convert messy inputs into structured work, evidence, metrics, and improvement?

---

# **2\. Design Principle**

Dispatch OS is generic at the primitive level and specific at the configuration level.

The Core Object Model provides the grammar.

Configuration provides the vocabulary.

Example:

Core primitive:

* Entity

Configured entity types:

* Customer  
* Room  
* Household  
* Asset  
* Job  
* Tenant  
* Account  
* Vendor  
* Employee  
* Document  
* Deal  
* Project

Core primitive:

* Work Item

Configured work item types:

* Follow up  
* Review  
* Clean  
* Approve  
* Reconcile  
* Upload  
* Repair  
* Call  
* Inspect  
* Prepare  
* Escalate  
* Complete

Core primitive:

* Evidence

Configured evidence types:

* Photo  
* File  
* Approval  
* Note  
* Signature  
* Report  
* Timestamp  
* Checklist  
* Source record  
* Exception explanation

---

# **3\. Core Objects**

## **3.1 Organization**

An organization is the top-level customer/account.

It represents the business, fund, property group, operating company, practice, agency, or ownership group using Dispatch OS.

An organization may have multiple workspaces.

Required fields:

* id  
* name  
* status  
* created\_at  
* updated\_at

Optional fields:

* legal\_name  
* industry\_label  
* website  
* billing\_status  
* primary\_contact\_id  
* metadata

Rule:

The organization should not assume one business type.

---

## **3.2 Workspace**

A workspace is an operating environment inside an organization.

Examples:

* one property  
* one business unit  
* one client engagement  
* one acquisition target  
* one department  
* one operating location  
* one project

Required fields:

* id  
* organization\_id  
* name  
* status  
* created\_at  
* updated\_at

Optional fields:

* workspace\_type  
* active\_configuration\_id  
* metadata

Rule:

Most operating data should belong to a workspace.

---

## **3.3 User**

A user is a person with access to Dispatch OS.

Users may be internal operators, managers, staff, clients, reviewers, advisors, admins, agents, or external collaborators.

Required fields:

* id  
* organization\_id  
* email  
* display\_name  
* status  
* created\_at  
* updated\_at

Optional fields:

* phone  
* title  
* default\_workspace\_id  
* metadata

Rule:

Users are not the same as roles. A user may hold different roles in different workspaces.

---

## **3.4 Role**

A role defines what a user is allowed to see, do, approve, assign, edit, or configure.

Examples:

* owner  
* admin  
* manager  
* operator  
* reviewer  
* contributor  
* field user  
* external viewer  
* client  
* agent supervisor

Required fields:

* id  
* organization\_id  
* name  
* description  
* created\_at  
* updated\_at

Role permissions may include:

* view workspace  
* create input  
* review input  
* create work item  
* assign work item  
* complete work item  
* approve evidence  
* run agent  
* approve agent proposal  
* manage configuration  
* view reports  
* export data  
* share market outputs

Rule:

Permissions must be explicit, especially for future finance/wealth/acquisition workflows.

---

## **3.5 Configuration**

A configuration defines how Dispatch OS behaves for a workspace or organization.

It can define entity types, workflows, rules, vocabulary, evidence requirements, dashboards, reports, automation keys, and agent instructions.

Required fields:

* id  
* organization\_id  
* workspace\_id  
* name  
* version  
* status  
* created\_at  
* updated\_at

Optional fields:

* description  
* parent\_configuration\_id  
* metadata

Rule:

Configuration is how the system becomes specific without hardcoding the core.

---

## **3.6 Input**

An input is anything the business receives, observes, uploads, forwards, exports, connects, or manually enters.

Inputs are raw material.

Examples:

* email  
* CSV  
* PDF  
* screenshot  
* system alert  
* transaction  
* note  
* form  
* message  
* report  
* calendar event  
* API event  
* manual observation

Required fields:

* id  
* organization\_id  
* workspace\_id  
* source\_id  
* input\_type  
* raw\_content\_reference  
* status  
* received\_at  
* created\_at  
* updated\_at

Optional fields:

* raw\_text  
* parsed\_content  
* extracted\_fields  
* confidence\_score  
* related\_entity\_ids  
* related\_work\_item\_ids  
* metadata

Input statuses:

* received  
* parsing  
* parsed  
* classified  
* matched  
* interpreted  
* proposed  
* approved  
* converted  
* archived  
* rejected  
* error

Rule:

Raw input must be preserved. Extracted meaning is not truth until approved or system-confirmed under configuration.

---

## **3.7 Source**

A source is where an input came from.

Examples:

* upload  
* email  
* API  
* MCP connector  
* manual entry  
* CSV export  
* spreadsheet  
* calendar  
* CRM  
* PMS  
* accounting system  
* document folder  
* chat  
* human observation

Required fields:

* id  
* organization\_id  
* workspace\_id  
* name  
* source\_type  
* status  
* created\_at  
* updated\_at

Optional fields:

* external\_account\_id  
* connector\_type  
* sync\_frequency  
* last\_sync\_at  
* metadata

Rule:

Source reliability should eventually be scored.

---

## **3.8 Entity**

An entity is anything the business needs to track.

The core does not know what the entity means.

Configuration defines entity types.

Examples:

* customer  
* employee  
* vendor  
* asset  
* household  
* room  
* account  
* job  
* project  
* tenant  
* document  
* deal  
* task group  
* location

Required fields:

* id  
* organization\_id  
* workspace\_id  
* entity\_type  
* name  
* status  
* created\_at  
* updated\_at

Optional fields:

* external\_id  
* source\_id  
* parent\_entity\_id  
* attributes  
* metadata

Rule:

Entities are the backbone of context. Work, evidence, inputs, and reports should relate back to entities whenever possible.

---

## **3.9 Entity Type**

An entity type is a configured class of entity.

Entity types are not hardcoded in the core.

Required fields:

* id  
* configuration\_id  
* name  
* label  
* description  
* schema  
* created\_at  
* updated\_at

Optional fields:

* required\_fields  
* display\_fields  
* relationship\_rules  
* validation\_rules  
* metadata

Rule:

Entity types should be defined by configuration and capable of versioning.

---

## **3.10 Context Object**

A context object stores business-specific operating memory.

Context objects may include:

* SOPs  
* rules  
* definitions  
* preferences  
* policies  
* constraints  
* standards  
* operating assumptions  
* historical summaries  
* known exceptions  
* decision criteria

Required fields:

* id  
* organization\_id  
* workspace\_id  
* context\_type  
* title  
* body  
* status  
* version  
* created\_at  
* updated\_at

Optional fields:

* related\_entity\_ids  
* related\_workflow\_ids  
* source\_input\_id  
* approved\_by  
* metadata

Rule:

Context should be versioned and reviewable.

---

## **3.11 Rule**

A rule is deterministic logic used to interpret inputs, trigger work, require evidence, escalate issues, or calculate metrics.

Required fields:

* id  
* configuration\_id  
* name  
* description  
* trigger\_definition  
* condition\_definition  
* action\_definition  
* status  
* created\_at  
* updated\_at

Optional fields:

* priority  
* requires\_human\_approval  
* metadata

Rule types:

* validation  
* automation  
* escalation  
* evidence  
* assignment  
* approval  
* metric  
* reporting  
* risk  
* opportunity

Rule:

Rules should be configurable and auditable.

---

## **3.12 Workflow**

A workflow is a repeatable operating process.

Examples:

* intake review  
* follow-up  
* document collection  
* issue resolution  
* approval  
* reconciliation  
* onboarding  
* report preparation  
* exception handling

Required fields:

* id  
* configuration\_id  
* name  
* description  
* status  
* created\_at  
* updated\_at

Optional fields:

* workflow\_type  
* trigger\_definitions  
* default\_steps  
* default\_checklist\_template\_id  
* default\_evidence\_requirements  
* metadata

Rule:

A workflow is not the same as a work item. A workflow is the template/process. A work item is an instance of work.

---

## **3.13 Work Item**

A work item is the universal execution object.

A work item represents something the business needs to do, review, prove, fix, decide, monitor, approve, or complete.

Required fields:

* id  
* organization\_id  
* workspace\_id  
* title  
* status  
* created\_at  
* updated\_at

Optional fields:

* work\_item\_type  
* description  
* priority  
* owner\_user\_id  
* assigned\_role\_id  
* due\_at  
* source\_input\_id  
* workflow\_id  
* parent\_work\_item\_id  
* related\_entity\_ids  
* related\_document\_ids  
* expected\_outcome  
* value\_category  
* context  
* metadata

Work item statuses:

* proposed  
* open  
* assigned  
* in\_progress  
* blocked  
* awaiting\_review  
* awaiting\_approval  
* completed  
* rejected  
* canceled  
* reopened  
* archived

Rule:

If the system interprets something as needing action, it should become a work item or an explicit non-action disposition.

---

## **3.14 Checklist Template**

A checklist template defines expected steps for a type of work.

Required fields:

* id  
* configuration\_id  
* name  
* description  
* items  
* created\_at  
* updated\_at

Optional fields:

* workflow\_id  
* evidence\_requirements  
* completion\_rules  
* metadata

Rule:

Checklist templates should be configured, not hardcoded.

---

## **3.15 Checklist Item**

A checklist item is an execution step inside a work item.

Required fields:

* id  
* work\_item\_id  
* label  
* status  
* created\_at  
* updated\_at

Optional fields:

* description  
* sort\_order  
* required  
* completed\_by  
* completed\_at  
* evidence\_required  
* evidence\_item\_id  
* metadata

Rule:

Checklist completion should create events.

---

## **3.16 Event**

An event is an append-only record of something that happened.

Events are the audit trail of the business.

Required fields:

* id  
* organization\_id  
* workspace\_id  
* event\_type  
* occurred\_at  
* created\_at

Optional fields:

* actor\_user\_id  
* actor\_type  
* related\_input\_id  
* related\_entity\_id  
* related\_work\_item\_id  
* related\_evidence\_id  
* payload  
* metadata

Event examples:

* input\_received  
* input\_parsed  
* entity\_created  
* work\_item\_created  
* work\_item\_assigned  
* work\_item\_started  
* work\_item\_blocked  
* checklist\_item\_completed  
* evidence\_added  
* note\_added  
* agent\_run\_started  
* agent\_proposal\_created  
* proposal\_approved  
* proposal\_rejected  
* report\_generated  
* configuration\_changed  
* work\_item\_completed

Rule:

Important state changes must create events.

---

## **3.17 Note**

A note is human or system commentary attached to an input, entity, work item, evidence item, report, or context object.

Required fields:

* id  
* organization\_id  
* workspace\_id  
* body  
* created\_at  
* updated\_at

Optional fields:

* author\_user\_id  
* note\_type  
* related\_input\_id  
* related\_entity\_id  
* related\_work\_item\_id  
* related\_evidence\_id  
* visibility  
* metadata

Rule:

Notes should not become an unstructured junk drawer. Note types and relationships matter.

---

## **3.18 Evidence Item**

An evidence item is proof.

Evidence supports work completion, decisions, approvals, reports, compliance, auditability, transferability, and trust.

Required fields:

* id  
* organization\_id  
* workspace\_id  
* evidence\_type  
* title  
* status  
* created\_at  
* updated\_at

Optional fields:

* description  
* file\_id  
* source\_input\_id  
* related\_entity\_id  
* related\_work\_item\_id  
* reviewed\_by  
* reviewed\_at  
* confidence\_score  
* metadata

Evidence types:

* document  
* photo  
* note  
* checklist  
* approval  
* source\_record  
* timestamp  
* signature  
* report  
* exception\_explanation  
* agent\_output  
* human\_review

Rule:

Evidence is a core object, not merely a file attachment.

---

## **3.19 Document**

A document is a stored file or file reference.

Required fields:

* id  
* organization\_id  
* workspace\_id  
* file\_name  
* file\_type  
* storage\_path  
* status  
* created\_at  
* updated\_at

Optional fields:

* source\_input\_id  
* parsed\_text  
* extracted\_fields  
* related\_entity\_ids  
* related\_work\_item\_ids  
* document\_category  
* metadata

Rule:

Documents may become evidence, inputs, context, or report sources.

---

## **3.20 Decision**

A decision is the selected response to an interpreted input or operating condition.

Required fields:

* id  
* organization\_id  
* workspace\_id  
* decision\_type  
* status  
* created\_at  
* updated\_at

Optional fields:

* source\_input\_id  
* related\_work\_item\_id  
* related\_entity\_id  
* decision\_summary  
* selected\_action  
* rationale  
* decided\_by  
* agent\_proposal\_id  
* metadata

Decision statuses:

* proposed  
* approved  
* rejected  
* executed  
* superseded  
* archived

Rule:

Important decisions should have rationale and evidence.

---

## **3.21 Approval**

An approval records human authorization.

Required fields:

* id  
* organization\_id  
* workspace\_id  
* approval\_type  
* status  
* created\_at  
* updated\_at

Optional fields:

* requested\_by  
* approved\_by  
* related\_input\_id  
* related\_work\_item\_id  
* related\_decision\_id  
* related\_agent\_proposal\_id  
* approval\_notes  
* metadata

Approval statuses:

* requested  
* approved  
* rejected  
* expired  
* canceled

Rule:

Approvals should be separate from task completion.

---

## **3.22 Agent Run**

An agent run is a logged execution of an AI/automation process.

Required fields:

* id  
* organization\_id  
* workspace\_id  
* agent\_name  
* status  
* started\_at  
* created\_at  
* updated\_at

Optional fields:

* ended\_at  
* trigger\_type  
* source\_input\_id  
* related\_entity\_id  
* related\_work\_item\_id  
* prompt\_reference  
* model  
* token\_usage  
* cost\_estimate  
* output\_reference  
* error\_message  
* metadata

Rule:

Every agent run must be logged. Agent output is not truth by default.

---

## **3.23 Agent Proposal**

An agent proposal is a suggested interpretation, action, update, work item, report section, or decision.

Required fields:

* id  
* organization\_id  
* workspace\_id  
* agent\_run\_id  
* proposal\_type  
* status  
* created\_at  
* updated\_at

Optional fields:

* title  
* summary  
* proposed\_payload  
* confidence\_score  
* evidence\_references  
* reviewed\_by  
* reviewed\_at  
* review\_notes  
* metadata

Proposal statuses:

* proposed  
* accepted  
* edited  
* rejected  
* expired  
* converted

Rule:

Agents propose. Humans approve. Events preserve.

---

## **3.24 Metric**

A metric is a measured value derived from work, inputs, evidence, events, entities, or outcomes.

Required fields:

* id  
* organization\_id  
* workspace\_id  
* metric\_name  
* metric\_value  
* measured\_at  
* created\_at

Optional fields:

* metric\_type  
* related\_entity\_id  
* related\_workflow\_id  
* related\_report\_id  
* calculation\_method  
* metadata

Metric types:

* execution  
* evidence  
* data\_quality  
* agent  
* financial  
* operational  
* risk  
* readiness  
* outcome  
* ROI

Rule:

Metrics should be tied to real system activity, not vanity dashboards.

---

## **3.25 Report**

A report is a structured output generated from system data, evidence, metrics, or context.

Required fields:

* id  
* organization\_id  
* workspace\_id  
* report\_type  
* title  
* status  
* created\_at  
* updated\_at

Optional fields:

* generated\_by  
* approved\_by  
* report\_period\_start  
* report\_period\_end  
* content  
* source\_references  
* metadata

Report statuses:

* draft  
* generated  
* under\_review  
* approved  
* shared  
* archived

Rule:

Reports should be traceable back to evidence and source data.

---

## **3.26 Dashboard**

A dashboard is a visual operating view.

Dashboards are composed of widgets.

Required fields:

* id  
* organization\_id  
* workspace\_id  
* name  
* status  
* created\_at  
* updated\_at

Optional fields:

* dashboard\_type  
* widget\_config  
* visibility\_rules  
* metadata

Rule:

Dashboards should show the state of the operating loop.

---

## **3.27 Outcome**

An outcome is the result the system is trying to improve or measure.

Outcomes connect work to value.

Required fields:

* id  
* organization\_id  
* workspace\_id  
* outcome\_type  
* name  
* status  
* created\_at  
* updated\_at

Optional fields:

* description  
* related\_workflow\_id  
* related\_metric\_ids  
* target\_value  
* actual\_value  
* value\_category  
* metadata

Outcome examples:

* reduce time to completion  
* improve revenue conversion  
* reduce missing evidence  
* reduce rework  
* improve data completeness  
* increase customer retention  
* reduce dependency risk  
* improve readiness  
* reduce cost  
* increase throughput

Rule:

Every recurring workflow should eventually map to an outcome or value hypothesis.

---

# **4\. Object Relationships**

The most important relationships:

* Organization has many Workspaces.  
* Workspace has many Users, Entities, Inputs, Work Items, Events, Evidence Items, Documents, Reports, Dashboards.  
* Configuration defines Entity Types, Workflows, Rules, Metrics, Reports, and Widgets.  
* Input may create Agent Runs.  
* Agent Runs may create Agent Proposals.  
* Agent Proposals may create Work Items, Evidence Items, Decisions, Context updates, or Reports after approval.  
* Work Items may relate to Entities, Inputs, Documents, Evidence Items, Notes, Checklists, Events, Decisions, and Outcomes.  
* Evidence Items may support Work Items, Decisions, Reports, Approvals, and Outcomes.  
* Events record state changes across all important objects.  
* Reports should cite Evidence, Metrics, Inputs, and Events.  
* Outcomes should connect to Metrics and Workflows.

---

# **5\. Truth Model**

Dispatch OS must distinguish between:

1. Raw input  
2. Parsed data  
3. Agent interpretation  
4. Rule-generated proposal  
5. Human-approved truth  
6. System-confirmed operating record

Truth should not be silently mutated.

Any change to trusted operating records should be traceable.

---

# **6\. Core Object Rule**

Before adding a new core object, ask:

Does this object apply across most businesses?

If not, it likely belongs in configuration, not core.

---

# **7\. Anti-Patterns**

Avoid:

* hardcoding industry nouns into core  
* treating documents as passive storage  
* treating notes as junk  
* letting agent outputs become truth without approval  
* creating dashboards before events/evidence exist  
* making work items too domain-specific  
* ignoring permissions early  
* hiding state changes without events  
* building reports that cannot trace back to evidence  
* creating one-off schemas for each customer before defining generic primitives

---

# **8\. Final Principle**

The Core Object Model should make any business legible.

It should answer:

* What exists?  
* What came in?  
* What does it relate to?  
* What needs to happen?  
* Who owns it?  
* What happened?  
* What proves it?  
* What changed?  
* What value did it create?  
* What should happen next time?

