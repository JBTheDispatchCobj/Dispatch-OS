# 6008 — Workflow Router V1 Complete

## Purpose

Convert a user request, event, source signal, opportunity, document, or object state into the correct domains, objects, workflow, agents, evidence, approvals, and outputs.

## Router Input

- user request
- user role
- institution context
- object references
- event
- uploaded documents
- domain hints
- urgency
- confidentiality
- requested output
- intended audience
- environment

## Router Output

```json
{
  "route_id": "ROUTE-000001",
  "intent": "",
  "primary_domain": "",
  "supporting_domains": [],
  "objects": [],
  "workflow_id": "",
  "workflow_version": "",
  "steps": [],
  "agents": [],
  "required_evidence": [],
  "approval_gates": [],
  "missing_inputs": [],
  "outputs": [],
  "risk_flags": [],
  "confidence": "",
  "next_action": ""
}
```

## Intent Classes

- understand
- compare
- decide
- execute
- monitor
- prove
- report
- remediate
- discover
- approve
- route

## Routing Stages

1. classify intent
2. resolve institution
3. resolve objects
4. select domains
5. select workflow
6. validate agent permissions
7. identify evidence
8. identify approvals
9. select outputs
10. create audit record

## Decision Table Examples

| Request | Primary Domain | Workflow |
|---|---|---|
| Can this CU pilot this fintech? | Credit Unions | Fintech Pilot Review |
| Prepare exam response | Regulation | Exam Response |
| Find buyers for this loan | Capital Markets | Loan Participation |
| Replace core-adjacent vendor | Banking | Vendor Replacement |
| Detect wealth opportunities | Wealth | Wealth Referral |

## Conflict Resolution

If multiple workflows match:

- prefer explicit object lifecycle
- prefer primary domain workflow
- add supporting domain steps
- compare evidence and approvals
- escalate if materially ambiguous

## Block Conditions

- institution unresolved
- object unresolved
- permission conflict
- workflow unavailable
- prohibited action
- missing required authority
- evidence below minimum
- external release without approval
- stale critical context

## Example Route

```json
{
  "intent": "decide",
  "primary_domain": "Credit Unions",
  "supporting_domains": ["Venture Capital", "Regulation", "Vendor Oversight"],
  "objects": ["CreditUnion", "Startup", "Pilot"],
  "workflow_id": "WF-FINTECH-PILOT",
  "agents": ["Startup Profile Agent", "CU Readiness Agent", "Vendor Risk Agent"],
  "required_evidence": ["SOC2", "data flow", "use case", "integration map"],
  "approval_gates": ["business", "security", "compliance"],
  "outputs": ["pilot memo", "readiness score", "board brief"]
}
```

## Acceptance Tests

- Handles cross-domain requests.
- Does not bypass permissions.
- Exposes missing evidence.
- Adds human approval for regulated/material actions.
- Explains route and confidence.
