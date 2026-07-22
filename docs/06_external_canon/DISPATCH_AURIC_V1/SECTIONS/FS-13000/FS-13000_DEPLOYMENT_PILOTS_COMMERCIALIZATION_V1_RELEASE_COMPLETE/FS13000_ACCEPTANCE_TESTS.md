# FS-13000 Acceptance Tests

## Mandatory Suite

1. All JSON schemas parse.
2. Every synthetic fixture validates structurally and remains labeled synthetic.
3. Lifecycle transitions reject missing evidence, owner, approval, or invalid prior state.
4. Tenant isolation blocks cross-tenant reads, writes, exports, and partner access.
5. Agents cannot approve, bind, publish, accept risk, change price, or activate production writes.
6. Pilot launch requires charter, RACI, security review, data scope, UAT, training, support owner, and launch approval.
7. Commercial commitments fail when delivery capacity or margin controls fail.
8. Pricing exceptions require documented rationale, approver, term, and expiration.
9. Deal stages cannot advance without the evidence in `SALES_STAGE_EVIDENCE.csv`.
10. Critical support cases trigger the critical escalation path.
11. Partner permissions expire or suspend with certification or tenant authorization.
12. Renewal and expansion records disclose unresolved incidents and open obligations.
13. Publication facts require citations and confidential tenant data is rejected.
14. Transaction compensation is blocked absent legal/compliance approval.
15. Every material action emits an auditable event with correlation and integrity references.

## Release Result

A release passes only when every mandatory test is PASS or has a documented, time-bound, approved exception in the known-issues register.
