# **ROI\_AND\_IMPACT\_MODEL.md**

# **Dispatch OS — ROI and Impact Model**

## **1\. Purpose**

This document defines how Dispatch OS connects operating activity to measurable business value.

Dispatch OS should not merely track tasks.

It should help a business understand:

* what work happened  
* why it mattered  
* what proof exists  
* what changed  
* what value was created  
* whether the loop should repeat, deviate, or innovate

The ROI model should be simple enough to implement early and structured enough to become more precise over time.

---

# **2\. Core Principle**

Every recurring workflow should connect to a value hypothesis.

A value hypothesis says:

If this operating loop improves, the business benefits in this way.

Not every work item needs a precise dollar value.

But every workflow should eventually map to one or more value categories.

---

# **3\. Why ROI Matters**

Businesses do not buy AI, workflows, dashboards, or automations for their own sake.

They buy:

* time savings  
* lower cost  
* more revenue  
* less risk  
* better control  
* better reporting  
* higher quality  
* better customer experience  
* less founder dependency  
* improved transferability  
* improved readiness for growth, financing, sale, or succession

Dispatch OS should make those outcomes visible.

---

# **4\. Value Categories**

## **4.1 Time Saved**

The system reduces manual effort.

Examples:

* fewer manual reconciliations  
* faster document review  
* faster report creation  
* faster follow-up  
* faster assignment  
* less searching through email/files  
* fewer meetings required to clarify status

Potential measurements:

* estimated minutes saved per work item  
* number of repeated tasks automated  
* report generation time before/after  
* average cycle time before/after  
* human review time

---

## **4.2 Revenue Created**

The system helps capture new revenue.

Examples:

* faster follow-up creates conversion  
* missed opportunities are surfaced  
* cross-sell/service opportunities are identified  
* stale prospects are reactivated  
* pricing leakage is flagged  
* strategy/service adoption increases

Potential measurements:

* opportunity count  
* conversion rate  
* revenue per customer/entity  
* follow-up latency  
* adopted recommendations  
* pipeline value

---

## **4.3 Revenue Protected**

The system helps prevent revenue loss.

Examples:

* unresolved issues are escalated  
* renewals are not missed  
* customer churn risk is flagged  
* service failures are caught  
* billing gaps are identified  
* contracts/obligations are tracked

Potential measurements:

* at-risk revenue identified  
* issues resolved before customer impact  
* renewal tasks completed  
* billing discrepancies fixed  
* churn-risk items closed

---

## **4.4 Cost Reduced**

The system reduces operating waste.

Examples:

* fewer duplicate efforts  
* fewer unnecessary handoffs  
* fewer manual admin hours  
* fewer avoidable errors  
* better staff utilization  
* less rework  
* fewer outsourced tasks

Potential measurements:

* rework rate  
* duplicate work items  
* manual hours reduced  
* cost per workflow  
* staff capacity recovered  
* vendor spend reduced

---

## **4.5 Risk Reduced**

The system lowers operational, compliance, financial, customer, or execution risk.

Examples:

* required evidence captured  
* approvals documented  
* missing documents identified  
* exceptions escalated  
* sensitive actions reviewed  
* audit trail preserved  
* deadlines tracked

Potential measurements:

* missing evidence rate  
* overdue exceptions  
* approval completeness  
* unresolved risk items  
* audit completeness score  
* policy violations avoided

---

## **4.6 Quality Improved**

The system improves consistency and accuracy.

Examples:

* checklists followed  
* errors reduced  
* reviews completed  
* documentation standardized  
* data fields normalized  
* inconsistent processes corrected

Potential measurements:

* checklist completion rate  
* error rate  
* rejected work rate  
* data quality score  
* evidence completeness  
* review pass rate

---

## **4.7 Speed Improved**

The system shortens cycle time.

Examples:

* faster intake  
* faster assignment  
* faster review  
* faster completion  
* faster report generation  
* faster escalation

Potential measurements:

* time from input to work item  
* time from work item to completion  
* time from completion to review  
* time from report request to draft  
* time blocked  
* time awaiting approval

---

## **4.8 Visibility Improved**

The system makes operating reality easier to see.

Examples:

* manager knows what is open  
* owner knows what is blocked  
* evidence gaps are visible  
* reports are traceable  
* responsibilities are clear  
* status no longer lives in someone’s head

Potential measurements:

* unknown status count  
* unassigned work count  
* stale work count  
* dashboard usage  
* report completeness  
* reduction in status-check meetings

---

## **4.9 Transferability Improved**

The system makes the business less dependent on one person.

Examples:

* workflows documented  
* evidence preserved  
* context captured  
* customer/entity history structured  
* decisions logged  
* recurring processes standardized  
* operating memory retained

Potential measurements:

* documented workflow count  
* entity completeness score  
* founder/manager dependency score  
* SOP coverage  
* repeatable workflow count  
* staff handoff success

---

## **4.10 Readiness Improved**

The system makes the business more ready for a market outcome.

Market outcomes may include:

* financing  
* sale  
* acquisition  
* succession  
* investor reporting  
* audit  
* insurance  
* expansion  
* strategic partnership

Potential measurements:

* report completeness  
* data room completeness  
* evidence map completeness  
* financial/operational data completeness  
* unresolved diligence gaps  
* readiness score  
* external sharing readiness

---

# **5\. Value Hypothesis Model**

Every recurring workflow should have a value hypothesis.

Fields:

* workflow\_id  
* value\_category  
* hypothesis\_statement  
* baseline\_metric  
* target\_metric  
* measurement\_method  
* expected\_impact  
* confidence\_level  
* review\_cadence  
* owner

Example:

```json
{
  "workflow": "document_review",
  "value_category": "time_saved",
  "hypothesis_statement": "If document intake is parsed and routed automatically, manager review time decreases.",
  "baseline_metric": "average_review_time_minutes",
  "target_metric": "average_review_time_minutes",
  "measurement_method": "compare before/after workflow cycle time",
  "expected_impact": "reduce review time by 30%",
  "confidence_level": "medium",
  "review_cadence": "monthly"
}
```

Rule:

The system should capture expected value before claiming actual value.

---

# **6\. ROI Object Model**

ROI should be represented as structured records.

## **6.1 Value Category**

Defines the type of value.

Fields:

* id  
* name  
* description  
* measurement\_methods  
* examples

## **6.2 Value Hypothesis**

Defines expected impact.

Fields:

* id  
* workflow\_id  
* value\_category\_id  
* hypothesis  
* baseline\_metric\_id  
* target\_metric\_id  
* expected\_impact  
* confidence  
* status

## **6.3 Impact Measurement**

Records actual observed impact.

Fields:

* id  
* value\_hypothesis\_id  
* period\_start  
* period\_end  
* measured\_value  
* baseline\_value  
* delta  
* confidence  
* notes  
* evidence\_references

## **6.4 ROI Estimate**

Converts impact into estimated financial value when appropriate.

Fields:

* id  
* impact\_measurement\_id  
* estimate\_type  
* amount  
* calculation\_method  
* assumptions  
* confidence  
* reviewed\_by  
* approved\_at

Rule:

ROI estimates should clearly distinguish measured facts from assumptions.

---

# **7\. Direct vs Indirect ROI**

## **Direct ROI**

Direct ROI can be tied more closely to dollars.

Examples:

* hours saved × labor cost  
* revenue captured  
* invoices recovered  
* cost avoided  
* vendor spend reduced  
* churn prevented  
* conversion improved

## **Indirect ROI**

Indirect ROI improves business quality but may not immediately convert to dollars.

Examples:

* cleaner data  
* better evidence  
* reduced dependency  
* improved reporting  
* stronger audit trail  
* better readiness  
* improved customer experience  
* less operational chaos

Rule:

Do not ignore indirect ROI. In many businesses, indirect ROI is the path to enterprise value.

---

# **8\. Baseline and Before/After**

To measure value, the system should capture baselines where possible.

Baseline examples:

* average completion time before Dispatch OS  
* number of missing fields before cleanup  
* number of overdue tasks before workflow  
* report creation time before automation  
* evidence completeness before implementation  
* rework rate before checklist  
* status unknown count before work queue

Rule:

When no baseline exists, establish one during the first operating period.

---

# **9\. Estimation Discipline**

Dispatch OS should be honest about ROI.

Three levels of confidence:

## **9.1 Observed**

Directly measured from system data.

Example:

* average completion time decreased from 4 days to 2 days

## **9.2 Estimated**

Calculated using reasonable assumptions.

Example:

* 10 hours saved × $50/hour \= $500 estimated savings

## **9.3 Hypothesized**

Likely but not yet measured.

Example:

* improved evidence completeness may reduce audit risk

Rule:

Never present hypothesized value as observed ROI.

---

# **10\. Workflow Impact Review**

Every recurring workflow should periodically be reviewed.

Review questions:

* Is this workflow being used?  
* Is it completed on time?  
* Is evidence complete?  
* Are users bypassing it?  
* Are agent proposals accepted?  
* Is it saving time?  
* Is it reducing risk?  
* Is it creating value?  
* Should it repeat, deviate, or innovate?

Possible decisions:

* repeat  
* deviate  
* innovate  
* retire

Rule:

A workflow that does not create value should be changed or removed.

---

# **11\. Repeat / Deviate / Innovate**

## **Repeat**

Use when the workflow works.

Signals:

* high completion rate  
* low rework  
* strong evidence  
* accepted agent proposals  
* measurable value  
* user adoption

Next action:

* standardize  
* make easier  
* automate more  
* include in reports

## **Deviate**

Use when the workflow partly works.

Signals:

* frequent edits  
* recurring blockers  
* missing evidence  
* unclear owner  
* slow completion  
* inconsistent output

Next action:

* change owner  
* change checklist  
* change evidence requirement  
* change trigger  
* change timing  
* change agent prompt

## **Innovate**

Use when the workflow is insufficient.

Signals:

* recurring exceptions  
* no measurable value  
* manual workaround persists  
* users ignore workflow  
* new business problem appears  
* new outcome needed

Next action:

* create new workflow  
* create new input source  
* create new metric  
* create new widget  
* create new report  
* create new configuration pattern

Rule:

The system should not simply preserve workflows. It should improve them.

---

# **12\. Impact Dashboard**

An impact dashboard should show:

* workflows by value category  
* time saved estimates  
* risk items reduced  
* evidence completeness  
* data quality improvement  
* work completion trends  
* agent acceptance rate  
* cost of agent runs  
* estimated ROI  
* high-impact loops  
* low-value loops  
* repeat/deviate/innovate recommendations

Rule:

Impact dashboards should be grounded in real operating data.

---

# **13\. Agent ROI**

Agents should be measured.

Agent metrics:

* proposals created  
* proposals accepted  
* proposals rejected  
* accepted with edits  
* time to review  
* estimated time saved  
* cost per run  
* token cost  
* cost per accepted proposal  
* error rate  
* human override rate  
* value category supported

Rule:

An agent is only useful if it improves the loop.

---

# **14\. Implementation ROI**

For early cost-plus deployments, Dispatch OS should track implementation value.

Implementation metrics:

* inputs ingested  
* entities created  
* workflows configured  
* evidence items organized  
* reports generated  
* manual processes documented  
* data gaps identified  
* automation candidates found  
* time to first useful output  
* first value hypothesis proven

Rule:

Early services work should feed product learning.

---

# **15\. Pricing Connection**

The ROI model should eventually support pricing.

Possible pricing models:

* implementation fee  
* monthly platform fee  
* cost-plus agent/token fee  
* workflow module fee  
* report/output fee  
* usage-based fee  
* managed service fee  
* success/impact fee where appropriate

Rule:

Pricing should be tied to value created, but early pricing can be cost-plus while workflows are still being discovered.

---

# **16\. Anti-Patterns**

Avoid:

* claiming fake ROI  
* treating all value as dollars  
* ignoring indirect value  
* building ROI dashboards without event data  
* measuring agent usage instead of agent impact  
* valuing automation without adoption  
* confusing activity with business improvement  
* ignoring implementation cost  
* failing to distinguish observed vs estimated value  
* continuing workflows that users bypass

---

# **17\. Final Principle**

Dispatch OS should make businesses better, not merely busier.

The ROI layer exists to prove that the operating loop is creating value.

The product should always be able to answer:

* What changed?  
* Why did it matter?  
* How do we know?  
* What should we repeat, deviate, or innovate?

