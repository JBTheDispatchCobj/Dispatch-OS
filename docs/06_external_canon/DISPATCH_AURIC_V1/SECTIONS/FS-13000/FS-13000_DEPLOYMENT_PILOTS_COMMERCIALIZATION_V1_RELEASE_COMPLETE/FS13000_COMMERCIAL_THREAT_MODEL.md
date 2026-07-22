# FS-13000 Commercial and Deployment Threat Model

| Threat | Example | Impact | Preventive controls | Detection | Response |
|---|---|---|---|---|---|
| Scope drift | Pilot quietly expands users or production writes | security, cost, delivery failure | charter, change control, approval matrix | scope variance alerts | suspend expansion; re-scope |
| Unauthorized commitment | Agent or operator promises price/date/feature | legal and margin exposure | authority matrix, deal desk | proposal/version audit | withdraw; executive review |
| Cross-tenant exposure | Partner or support user accesses wrong tenant | severe privacy breach | tenant-scoped IAM, least privilege | access anomaly alert | revoke, contain, incident |
| Unsupported claims | Publication or sales material overstates performance/AUM | regulatory and trust risk | source citations, legal review | editorial QA, complaint monitoring | correct, archive, disclose |
| Unlicensed compensation | Fee resembles finder/broker compensation | legal/regulatory risk | legal gate by jurisdiction and activity | contract/payment review | block payment; counsel review |
| Margin erosion | Custom work sold below delivery cost | cash and capacity risk | cost model, margin floor | project actuals vs estimate | reprice, de-scope, escalate |
| Production data in demo | Customer data copied to demo/training | privacy breach | environment policy, data controls | DLP and lineage scan | quarantine, notify, remediate |
| Partner overreach | Partner self-approves or retains access | security and quality risk | certification, tenant authorization, expiration | privileged access review | suspend certification/access |
| Metric manipulation | Pipeline or value metrics lack evidence | bad decisions | stage evidence, calculation lineage | reconciliation tests | restate, corrective action |
| Incomplete offboarding | Credentials or data remain after termination | ongoing exposure | exit checklist, automated revocation | orphan access scan | revoke, delete/retain per policy |
