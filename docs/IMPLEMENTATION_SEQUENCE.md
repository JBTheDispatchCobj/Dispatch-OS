# **IMPLEMENTATION\_SEQUENCE.md**

# **Dispatch OS — Implementation Sequence**

## **1\. Purpose**

This document defines the recommended implementation sequence for building Dispatch OS from the duplicated product.

The goal is to create a clean generalist OS core without breaking or contaminating the existing working hospitality beta.

The existing Dispatch hotel product should remain untouched.

The new project should become the agnostic core.

---

# **2\. Guiding Principle**

Do not start by building every possible vertical.

Do not start by building agents everywhere.

Do not start by building dashboards.

Do not start by rebuilding the hotel app.

Start by proving the universal operating loop:

Input → Context → Interpretation → Decision → Action → Evidence → Value → Feedback → Adaptation

The first implementation should make this loop real in the product.

---

# **3\. Repo Strategy**

## **3.1 Preserve Existing Beta**

The current Dispatch hotel beta is a live implementation.

Do not refactor it in place.

Do not change its database to support speculative generalization.

Do not risk breaking Jennifer’s hotel.

Treat it as:

* working product  
* reference implementation  
* proof of hospitality execution  
* source of reusable patterns  
* Hotel Cartridge v0

## **3.2 Create Sibling Project**

Create a new sibling project:

```shell
dispatch-os
```

This new project should contain:

* clean generic object model  
* generic UI widgets  
* configuration system  
* agent/proposal staging  
* evidence/event architecture  
* no hardcoded hotel assumptions

Rule:

Current Dispatch inspires Dispatch OS. It does not become Dispatch OS through in-place mutation.

---

# **4\. Phase 0 — Doctrine and Guardrails**

Before coding, create the core doctrine files:

* `DISPATCH_OS_MASTER.md`  
* `OPERATING_LOOP_RULES.md`  
* `CORE_OBJECT_MODEL.md`  
* `CONFIGURATION_RULES.md`  
* `AGENT_AND_AUTOMATION_RULES.md`  
* `WIDGET_SYSTEM_RULES.md`  
* `ROI_AND_IMPACT_MODEL.md`  
* `IMPLEMENTATION_SEQUENCE.md`

Purpose:

Make sure Claude/Cursor/developers understand what is being built before they start coding.

Acceptance criteria:

* Docs exist in repo.  
* Docs avoid vertical-specific architecture.  
* Docs define the loop.  
* Docs define core objects.  
* Docs define configuration boundaries.  
* Docs define human-in-the-loop agent rules.

---

# **5\. Phase 1 — Fresh App Scaffold**

Create a clean app shell.

Recommended stack may mirror current Dispatch if useful:

* Next.js  
* React  
* TypeScript  
* Supabase  
* Tailwind or existing design system  
* minimal component library  
* server actions/API routes as appropriate

Build only foundational structure.

Initial routes:

```
/
 /login
 /app
 /app/workspaces
 /app/[workspaceId]/dashboard
 /app/[workspaceId]/inputs
 /app/[workspaceId]/entities
 /app/[workspaceId]/work
 /app/[workspaceId]/review
 /app/[workspaceId]/reports
 /app/[workspaceId]/settings
```

Acceptance criteria:

* app runs locally  
* auth works or is stubbed cleanly  
* route structure exists  
* no hotel-specific routes  
* no vertical-specific assumptions

---

# **6\. Phase 2 — Core Database Schema**

Build the generic schema first.

Minimum tables:

* organizations  
* workspaces  
* profiles/users  
* roles  
* user\_roles  
* configurations  
* entity\_types  
* entities  
* inputs  
* sources  
* context\_objects  
* rules  
* workflows  
* work\_items  
* checklist\_templates  
* checklist\_items  
* events  
* notes  
* evidence\_items  
* documents  
* decisions  
* approvals  
* agent\_runs  
* agent\_proposals  
* metrics  
* reports  
* dashboards  
* outcomes

Important design choices:

* use explicit columns for universal fields  
* use JSONB for configured attributes/context  
* preserve raw input references  
* log events for meaningful state changes  
* include organization\_id and workspace\_id on operating objects  
* design permissions early

Acceptance criteria:

* migrations exist  
* core tables can be created locally  
* seed data creates one organization and workspace  
* no core table is named after a specific industry noun  
* RLS/security approach is considered, even if initially simple

---

# **7\. Phase 3 — Organization, Workspace, User, Role**

Build the access foundation.

Features:

* create/select organization  
* create/select workspace  
* assign user roles  
* basic permissions  
* workspace-aware navigation

Minimum roles:

* owner  
* admin  
* manager  
* operator  
* reviewer  
* viewer

Acceptance criteria:

* user can access workspace  
* role controls basic navigation/actions  
* all operating records are scoped to workspace  
* no global leakage between workspaces

---

# **8\. Phase 4 — Configuration System v0**

Build a simple configuration registry.

Configuration should support:

* vocabulary labels  
* entity types  
* input types  
* work item types  
* workflow templates  
* checklist templates  
* evidence requirements  
* dashboard widget config  
* basic automation keys  
* report templates

Do not overbuild a visual configuration builder yet.

Use JSON/YAML/seed files/admin forms where practical.

Acceptance criteria:

* a workspace can load an active configuration  
* entity types are config-defined  
* work item types are config-defined  
* checklist templates are config-defined  
* UI can read labels/fields from config  
* configuration is versioned or at least version-ready

---

# **9\. Phase 5 — Input Intake v0**

Build the intake layer.

Features:

* manual input creation  
* file upload placeholder  
* text paste input  
* CSV/spreadsheet upload placeholder if easy  
* input status lifecycle  
* input detail page  
* basic classification field  
* related entity/work item links

Input statuses:

* received  
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

Acceptance criteria:

* user can create/upload/paste an input  
* raw content is preserved  
* input can be classified manually  
* input can be linked to an entity or work item  
* input status changes create events

---

# **10\. Phase 6 — Entity System v0**

Build generic entities.

Features:

* entity type list from configuration  
* create entity  
* entity profile page  
* configurable fields  
* related inputs  
* related work  
* related notes  
* related evidence  
* event history

Acceptance criteria:

* user can create an entity of a configured type  
* entity fields can be stored in attributes/context  
* entity profile does not assume domain-specific nouns  
* related objects display correctly

---

# **11\. Phase 7 — Work Item System v0**

Build the universal execution object.

Features:

* work item list  
* work item detail  
* create work item  
* assign owner  
* set status  
* set priority  
* due date  
* relate to entity  
* relate to input  
* attach checklist  
* add notes  
* add evidence  
* event history

Statuses:

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

Acceptance criteria:

* work item can be created manually  
* work item can be created from input  
* checklist can be attached  
* status changes create events  
* completion requires configured evidence if applicable  
* work item detail uses generic widgets

---

# **12\. Phase 8 — Evidence and Documents v0**

Build evidence as a first-class object.

Features:

* upload/add document  
* create evidence item  
* classify evidence type  
* relate evidence to work item/entity/input  
* evidence review status  
* missing evidence flag  
* evidence panel widget

Acceptance criteria:

* evidence can be attached to work  
* evidence can be reviewed  
* evidence can be marked missing/required  
* evidence actions create events  
* evidence can be referenced by reports later

---

# **13\. Phase 9 — Notes and Events v0**

Build operating memory.

Features:

* typed notes  
* notes attached to input/entity/work/evidence/report  
* append-only events  
* event timeline widget  
* event creation for major state changes

Event examples:

* input\_created  
* input\_status\_changed  
* entity\_created  
* work\_item\_created  
* work\_item\_status\_changed  
* checklist\_item\_completed  
* note\_added  
* evidence\_added  
* proposal\_created  
* proposal\_approved  
* report\_generated  
* configuration\_changed

Acceptance criteria:

* every important state change logs an event  
* event timeline is visible on work item and entity pages  
* notes are relational, not floating junk

---

# **14\. Phase 10 — Agent Proposal Staging v0**

Build proposal infrastructure before real agents.

Do not start with model complexity.

Start with the object and review flow.

Features:

* create mock/manual agent proposal  
* proposal queue  
* proposal detail  
* accept proposal  
* accept with edits  
* reject proposal  
* convert proposal to work item/entity update/evidence/report draft  
* log review events

Acceptance criteria:

* proposals are staged, not truth  
* human review is required  
* accepted proposals convert into operating objects  
* rejected proposals remain logged  
* review feedback is captured

---

# **15\. Phase 11 — Workflow and Checklist Templates v0**

Build repeatable process support.

Features:

* workflow template definition  
* checklist template definition  
* create work item from workflow  
* attach checklist from template  
* completion rules  
* evidence requirements

Acceptance criteria:

* workflow template can create a work item  
* checklist template can populate checklist items  
* evidence requirements can be enforced or flagged  
* workflow usage creates metrics/events

---

# **16\. Phase 12 — Widgets v0**

Build reusable widgets.

Minimum widgets:

* InputInbox  
* EntityProfile  
* WorkQueue  
* WorkItemDetail  
* ChecklistPanel  
* EvidencePanel  
* NotesPanel  
* EventTimeline  
* AgentProposalQueue  
* ApprovalQueue  
* MetricsCard  
* ReportDraft

Acceptance criteria:

* widgets are generic  
* widgets read from configuration where practical  
* widgets do not contain industry-specific language  
* widgets can be composed into dashboards

---

# **17\. Phase 13 — Reports v0**

Build simple report generation from approved data.

Features:

* report list  
* report detail  
* report status  
* draft report manually  
* generate report from selected work/items/evidence/metrics  
* source/evidence references  
* approval state

Report statuses:

* draft  
* generated  
* under\_review  
* approved  
* shared  
* archived

Acceptance criteria:

* report can cite source objects  
* report can be reviewed/approved  
* report generation creates event  
* report is not just a free-text note

---

# **18\. Phase 14 — Metrics and Impact v0**

Build operating metrics.

Initial metrics:

* open work items  
* completed work items  
* overdue work items  
* average time to completion  
* evidence completeness  
* missing evidence count  
* input conversion count  
* proposal acceptance rate  
* agent proposal rejection rate  
* workflow completion rate

Impact features:

* assign value category to workflow  
* create value hypothesis  
* record estimated impact  
* repeat/deviate/innovate review

Acceptance criteria:

* metrics derive from events/work/evidence  
* impact is separated from activity  
* ROI estimates are clearly labeled as estimates  
* value hypotheses can be attached to workflows

---

# **19\. Phase 15 — First Generic Demo Configuration**

Do not start with a full vertical.

Create a generic business mechanics demo.

Demo configuration should include:

* entity types:  
  * Customer  
  * Employee  
  * Vendor  
  * Asset  
  * Document  
  * Project  
* input types:  
  * Uploaded Document  
  * Email/Message  
  * Spreadsheet Export  
  * Manual Note  
  * Exception  
* workflows:  
  * Intake Review  
  * Data Cleanup  
  * Follow-Up  
  * Evidence Collection  
  * Approval  
  * Report Preparation  
  * Exception Resolution  
* work item types:  
  * Review  
  * Collect  
  * Fix  
  * Approve  
  * Follow Up  
  * Reconcile  
  * Report  
* evidence types:  
  * Document  
  * Note  
  * Approval  
  * Source Record  
  * Explanation

Acceptance criteria:

* generic demo runs without industry assumptions  
* user can ingest input  
* create entity  
* create work  
* attach evidence  
* approve proposal  
* generate simple report  
* see metrics  
* record feedback

---

# **20\. Phase 16 — First Real Configuration**

Only after the generic demo works, choose the first real configuration.

Possible first real configuration:

* Wealth/RIA readiness  
* Hospitality v1 rewrite  
* Generic owner-operator ops  
* CRE asset readiness  
* Trades ops

Selection criteria:

* fastest access to customer/user  
* highest willingness to pay  
* easiest data intake  
* clearest pain  
* clearest ROI  
* repeatable workflows  
* strong market-side outcome

Acceptance criteria:

* real business context can be configured without changing core schema  
* only configuration and widgets are adapted  
* no hardcoded vertical nouns leak into core

---

# **21\. What Not To Build First**

Do not build first:

* full agent autonomy  
* complex MCP integrations  
* full dashboard suite  
* marketplace  
* external sharing portal  
* multi-vertical cartridge library  
* advanced benchmarking  
* billing system  
* mobile app  
* native integrations for every source  
* perfect report generation  
* autonomous configuration builder

Build the loop first.

---

# **22\. Developer Checklist**

Before adding any feature, ask:

1. Which part of the loop does this support?  
2. Is this core or configuration?  
3. Does this require evidence?  
4. Does this need human approval?  
5. Should this create an event?  
6. What object owns this data?  
7. What metric does this affect?  
8. What value hypothesis does it support?  
9. Is this industry-specific?  
10. Could this be a widget instead of a custom page?

---

# **23\. Success Criteria for MVP**

The MVP succeeds if it can:

* ingest messy input  
* preserve raw input  
* apply configured context  
* create entities  
* create work items  
* attach checklists  
* capture evidence  
* log events  
* stage agent/manual proposals  
* require human review  
* generate a basic report  
* show operating metrics  
* connect workflow to value hypothesis  
* support at least one real business configuration without core refactor

---

# **24\. Final Principle**

The first version of Dispatch OS does not need to be powerful everywhere.

It needs to prove the core loop is real.

If the loop works, configurations can specialize later.

If the loop does not work, cartridges will only create vertical confusion.

