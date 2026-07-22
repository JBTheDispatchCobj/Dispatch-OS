# 6005 — Strategic Priorities & Risk Profile V1 Complete

## Purpose

Represent institutional goals, initiatives, risk appetite, controls, issues, remediation, and board visibility.

## Strategic Priority Object

- priority ID
- institution
- title
- category
- sponsor
- board sponsor
- rationale
- desired outcome
- baseline
- target
- KPIs
- budget
- start/end
- dependencies
- risks
- opportunities
- workflows
- status
- evidence
- confidence

## Priority Lifecycle

- proposed
- approved
- funded
- active
- at risk
- paused
- completed
- cancelled
- superseded

## Risk Object

- risk ID
- institution
- domain
- description
- inherent risk
- controls
- control effectiveness
- residual risk
- likelihood
- impact
- velocity
- trend
- appetite
- owner
- issues
- remediation
- evidence
- review date

## Risk Domains

- credit
- liquidity
- interest-rate
- market
- operational
- compliance
- BSA/AML
- fraud
- cyber
- technology
- vendor
- privacy
- model/AI
- strategic
- reputation
- capital
- concentration
- succession
- legal

## Risk Appetite Object

- metric
- warning threshold
- limit
- breach threshold
- owner
- escalation
- approval
- effective date
- review date

## Priority-Risk Mapping

Each priority identifies:

- risks created
- risks reduced
- controls required
- approvals required
- evidence required
- risk owner
- board reporting
- risk acceptance if any

## Decision Rules

- appetite breach → escalate and block dependent action if configured
- priority with no sponsor → cannot enter active state
- priority with no baseline/KPI → remains proposed
- residual risk high and no mitigation → board visibility required
- opportunity not aligned to priority → lower opportunity score

## Outputs

- strategic roadmap
- risk heatmap
- appetite report
- priority-risk matrix
- board brief
- opportunity alignment report

## Acceptance Tests

- Priorities have owners, metrics, and evidence.
- Risk appetite breaches are visible.
- Priority and opportunity alignment is explicit.
- High residual risk routes to governance.
- Historical priority and risk versions remain accessible.
