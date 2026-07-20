# **AGENT\_AND\_AUTOMATION\_RULES.md**

# **Dispatch OS — Agent and Automation Rules**

## **1\. Purpose**

This document defines how agents and automation should operate inside Dispatch OS.

Dispatch OS is not a chatbot.

Dispatch OS is operating infrastructure where agents can safely interpret inputs, propose actions, draft outputs, and improve business loops under human supervision.

The goal is not autonomous chaos.

The goal is trusted leverage.

---

# **2\. Core Principle**

Agents propose.

Humans approve.

Events preserve.

The system must distinguish between:

* raw source data  
* agent interpretation  
* rule-generated action  
* human-approved truth  
* executed work  
* measured outcome

Agent outputs should not silently mutate trusted business records unless configuration explicitly allows it.

---

# **3\. Automation Philosophy**

Automation should be earned.

The system should begin with human-in-the-loop review.

As patterns repeat and confidence improves, specific actions can become more automated.

Automation progression:

1. Human does manually.  
2. Agent drafts.  
3. Human edits/approves.  
4. Agent proposes consistently.  
5. Rules validate agent output.  
6. Human spot-checks.  
7. Low-risk automation is allowed.  
8. Exceptions still route to humans.

Rule:

Do not automate important meaning before the system has evidence that the loop is reliable.

---

# **4\. Agent Roles**

Agents in Dispatch OS may perform different roles.

## **4.1 Intake Agent**

Purpose:

* read new inputs  
* classify input type  
* identify source  
* extract likely fields  
* identify related entities  
* flag uncertainty  
* propose next step

Allowed outputs:

* parsed input  
* classification  
* related entity match  
* proposed work item  
* proposed evidence item  
* review flag

Not allowed:

* mutate trusted records without approval  
* delete source input  
* approve its own output

---

## **4.2 Context Agent**

Purpose:

* summarize business documents  
* extract operating rules  
* identify workflow patterns  
* draft configuration suggestions  
* identify vocabulary  
* identify standards and exceptions

Allowed outputs:

* proposed context object  
* proposed rule  
* proposed workflow  
* proposed checklist  
* proposed configuration update

Not allowed:

* change active configuration without human approval

---

## **4.3 Work Agent**

Purpose:

* propose work items  
* suggest owners  
* suggest priority  
* generate checklists  
* detect blockers  
* identify overdue or stale work  
* suggest escalations

Allowed outputs:

* work item proposal  
* checklist proposal  
* escalation proposal  
* assignment suggestion  
* status suggestion

Not allowed:

* complete work without evidence  
* override human status  
* bypass required approval

---

## **4.4 Evidence Agent**

Purpose:

* classify evidence  
* match evidence to work items  
* detect missing evidence  
* summarize documents  
* identify source support  
* flag weak proof

Allowed outputs:

* evidence classification  
* evidence completeness score  
* missing evidence task  
* proposed evidence link  
* document summary

Not allowed:

* certify evidence as sufficient unless configuration allows and risk is low

---

## **4.5 Report Agent**

Purpose:

* draft reports from approved data  
* cite source evidence  
* summarize metrics  
* identify gaps  
* create management updates  
* produce output drafts

Allowed outputs:

* report draft  
* report section  
* gap list  
* source citation map  
* executive summary

Not allowed:

* publish/share externally without approval  
* invent unsupported claims  
* hide uncertainty

---

## **4.6 ROI Agent**

Purpose:

* connect activity to value hypotheses  
* estimate time saved  
* identify repeated loops  
* compare before/after metrics  
* suggest ROI categories  
* flag value leakage

Allowed outputs:

* ROI estimate  
* value category  
* impact note  
* repeat/deviate/innovate recommendation

Not allowed:

* present estimates as audited financial truth

---

# **5\. Agent Run Lifecycle**

Every agent run should follow a controlled lifecycle.

1. Triggered  
2. Scoped  
3. Source data gathered  
4. Prompt/instructions loaded  
5. Output generated  
6. Evidence references attached  
7. Confidence assigned  
8. Proposal created  
9. Human review requested if required  
10. Accepted, edited, rejected, or archived  
11. Event logged  
12. Feedback stored

Rule:

Every agent run must be logged.

---

# **6\. Agent Run Record**

Each agent run should capture:

* agent name  
* purpose  
* triggering event  
* source inputs  
* configuration version  
* context version  
* model used  
* prompt reference  
* token usage  
* estimated cost  
* output reference  
* confidence  
* status  
* error state  
* human reviewer  
* outcome

Rule:

Agent cost and output quality should be observable.

---

# **7\. Agent Proposal Record**

Agent outputs should become proposals.

A proposal may be:

* input classification  
* entity update  
* work item  
* checklist  
* evidence match  
* decision  
* report section  
* rule suggestion  
* configuration update  
* ROI estimate  
* escalation  
* summary

Proposal statuses:

* proposed  
* accepted  
* accepted\_with\_edits  
* rejected  
* expired  
* converted  
* archived

Each proposal should include:

* title  
* summary  
* proposed payload  
* source references  
* confidence  
* reasoning summary  
* risk level  
* required review role  
* reviewer decision  
* reviewer notes

Rule:

A proposal is not truth until accepted or converted under configured automation rules.

---

# **8\. Automation Keys**

Automation keys are triggers that start agent or rule activity.

Examples:

* new input received  
* missing required field  
* document uploaded  
* deadline approaching  
* stale status  
* unresolved exception  
* metric threshold exceeded  
* repeated pattern detected  
* human request  
* scheduled review  
* source sync completed  
* evidence missing  
* approval needed

Each automation key should define:

* trigger  
* scope  
* required context  
* allowed agent/rule  
* output type  
* confidence threshold  
* approval requirement  
* fallback behavior  
* event logging

Rule:

Automation keys should live in configuration, not scattered code.

---

# **9\. Risk Levels**

Every agent action or automation should have a risk level.

## **Low Risk**

Examples:

* summarize document  
* classify input  
* suggest tag  
* draft work item  
* identify missing field  
* generate internal note

Possible automation:

* may be auto-created as proposal  
* may be auto-linked if reversible

## **Medium Risk**

Examples:

* update entity field  
* assign work  
* escalate issue  
* draft report section  
* mark evidence as related  
* calculate score

Possible automation:

* human review usually required  
* auto-action only after confidence and repeated success

## **High Risk**

Examples:

* approve evidence  
* mark work complete  
* change configuration  
* share externally  
* make financial/legal/compliance representation  
* create market-facing output  
* alter permissions  
* delete/archive trusted data

Possible automation:

* human approval required

Rule:

High-risk actions should never be silently automated.

---

# **10\. Human Review**

Human review is a core feature, not a temporary training wheel.

Review types:

* approve  
* reject  
* edit  
* request more evidence  
* assign to another user  
* escalate  
* convert to work  
* convert to context  
* convert to report  
* archive

Review should capture:

* reviewer  
* timestamp  
* decision  
* notes  
* changes made  
* reason for rejection  
* confidence feedback  
* future automation preference

Rule:

Human feedback should improve future agent behavior.

---

# **11\. Agent Memory and Learning**

Agents should learn from structured feedback, not uncontrolled memory.

Useful learning signals:

* accepted proposals  
* rejected proposals  
* edited fields  
* repeated human corrections  
* missing evidence patterns  
* override frequency  
* workflow bottlenecks  
* configuration changes  
* report edits  
* recurring exceptions

Rule:

Learning should update prompts, rules, configuration suggestions, or workflow recommendations only through governed processes.

---

# **12\. Cost Controls**

Agent work has cost.

The system should track:

* token usage  
* cost per run  
* cost per workspace  
* cost per workflow  
* cost per accepted proposal  
* cost per generated report  
* estimated time saved  
* estimated value created

Rule:

Every agent feature should eventually justify cost through value, time saved, risk reduced, or revenue impact.

---

# **13\. Agent Output Standards**

Agent outputs should be:

* structured  
* source-linked  
* confidence-scored  
* reviewable  
* reversible where possible  
* tied to configuration  
* tied to evidence  
* logged as events

Agent outputs should not:

* invent facts  
* hide uncertainty  
* overwrite human decisions  
* bypass permissions  
* create untraceable changes  
* make unsupported claims  
* become truth without approval

---

# **14\. Prompt and Instruction Management**

Agent prompts should not be random strings buried in components.

Prompts should be:

* named  
* versioned  
* scoped  
* tied to agent role  
* tied to configuration  
* tested  
* reviewed  
* auditable

Prompt records should include:

* name  
* version  
* purpose  
* input requirements  
* output schema  
* safety instructions  
* review requirements  
* created\_at  
* updated\_at

Rule:

Changing a production prompt should be treated like changing operating logic.

---

# **15\. Agent Permissions**

Agents should have explicit permissions.

Agent permissions may define:

* what sources can be read  
* what objects can be read  
* what proposals can be created  
* whether it can create work items  
* whether it can update fields  
* whether it can trigger reports  
* whether it can notify users  
* whether it can access sensitive data

Rule:

Agents should follow the same permission discipline as users, with stricter defaults.

---

# **16\. Exception Handling**

Agents should fail safely.

If an agent is uncertain, it should:

* flag uncertainty  
* request human review  
* ask for missing input  
* create a review task  
* avoid making final claims  
* preserve raw source data

If an agent errors, the system should log:

* run id  
* source  
* error type  
* error message  
* affected object  
* retry status  
* human notification

Rule:

Agent failure should never corrupt trusted operating data.

---

# **17\. Reporting Agent Requirements**

Reports must be grounded.

Any agent-generated report should include:

* source references  
* evidence references  
* missing data notes  
* confidence indicators  
* human approval status  
* report generation timestamp  
* configuration version

Rule:

No market-facing or external report should be shared without human approval.

---

# **18\. Automation Maturity Levels**

Each workflow can have an automation maturity level.

## **Level 0 — Manual**

No agent or automation.

## **Level 1 — Assisted**

Agent drafts or suggests.

## **Level 2 — Reviewed**

Agent creates proposals for human approval.

## **Level 3 — Semi-Automated**

Low-risk actions auto-create, medium/high-risk actions require review.

## **Level 4 — Automated With Exceptions**

Routine actions proceed automatically; exceptions route to humans.

## **Level 5 — Autonomous**

Only for low-risk, well-proven, reversible workflows.

Rule:

Most early Dispatch OS workflows should start at Level 1 or Level 2\.

---

# **19\. Final Principle**

AI should not be the product.

AI should make the operating loop faster, clearer, cheaper, and more complete.

The product is the loop:

Input → Context → Interpretation → Decision → Action → Evidence → Value → Feedback → Adaptation

Agents are workers inside the loop.

They are not the loop itself.

