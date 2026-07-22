# 11002 — Workflow Engine & State Machine V1

## Purpose

Define how workflow definitions become executable, versioned state machines.

## Workflow Definition

- workflow ID
- name
- domain
- version
- trigger types
- allowed objects
- required inputs
- steps
- branches
- evidence requirements
- approval gates
- outputs
- SLA
- escalation
- completion criteria

## Step Object

- step ID
- type
- owner
- agent
- tool
- input contract
- output contract
- evidence requirements
- approval requirement
- entry condition
- exit condition
- retry policy
- timeout
- next steps

## Step Types

- intake
- classify
- retrieve
- validate
- calculate
- analyze
- draft
- review
- approve
- notify
- execute controlled action
- wait
- branch
- reconcile
- close

## State Machine

Each workflow instance tracks:

- current state
- active steps
- completed steps
- blocked steps
- failed steps
- pending approvals
- pending evidence
- due dates
- escalation state

## Branching

Supports:

- conditional
- score-based
- evidence-based
- approval-based
- role-based
- exception-based
- user-selected
- time-based

## Versioning

- running instances remain on original version unless migrated
- migration requires compatibility review
- step changes are versioned
- output contracts remain explicit
- rollback path preserved

## Completion

A workflow completes only when:

- required steps complete
- required evidence exists
- approvals complete
- outputs generated
- exceptions resolved or accepted
- audit record complete

## Acceptance Tests

- Workflow state survives restart.
- Branches are deterministic from recorded inputs.
- Version changes do not silently alter running work.
- Human approvals remain separate steps.
- Completion cannot occur with unresolved required evidence.

---

# V1 Release Completion Specification

## Release Scope

Executable workflow definitions, instance state, deterministic transitions, branching, migration and completion rules.

## Canonical Runtime Invariants

1. **Human authority is explicit.** No agent, model, workflow, tool, or scheduler may grant itself decision rights, approve its own work, or bypass an approval object.
2. **Execution is reconstructable.** Every material state transition, input, evidence reference, model call, tool call, human edit, approval, exception, and output version is represented by a durable audit event.
3. **Tenant boundaries are enforced before retrieval and before action.** Post-processing filters are not an acceptable substitute for authorization at the query and execution boundary.
4. **Evidence precedes assertion.** Material conclusions expose source, authority, freshness, confidence, transformation history, and review status.
5. **Unknown, stale, inferred, synthetic, public, private, attested, and approved are distinct states.** Runtime contracts must not collapse them.
6. **Definitions are versioned and immutable in use.** Running workflow instances remain pinned to the workflow, agent, tool, policy, schema, and model-route versions recorded at start unless an authorized migration occurs.
7. **Side effects are idempotent or explicitly compensatable.** The runtime records an idempotency key and side-effect receipt for every controlled external action.
8. **Failure preserves truth.** Completed work, evidence, approvals, and outputs are not erased when later steps fail.
9. **Least privilege is continuous.** Permission is checked at request intake, context assembly, tool invocation, output publication, replay, and administrative intervention.
10. **Observability is part of correctness.** A component that cannot expose health, cost, lineage, and failure state is not production ready.

## Required Objects and Contracts

| Object | Minimum purpose | Canonical identifiers |
|---|---|---|
| WorkflowDefinition | Versioned executable process specification | workflow_id, version |
| WorkflowInstance | Durable execution of one definition | execution_id, tenant_id |
| StepDefinition | Contract for one state-machine step | step_id, workflow_version |
| StepInstance | Runtime state and receipts for a step | step_instance_id, execution_id |
| AgentManifest | Permissioned agent capability contract | agent_id, version |
| ToolManifest | Governed tool-operation contract | tool_id, version, operation |
| ContextPackage | Minimal permissioned context supplied to an invocation | context_id, execution_id |
| RuntimeEvent | Durable fact emitted by the runtime | event_id, event_type, occurred_at |
| ApprovalRequest | Human authority gate | approval_id, authority_type |
| EvidenceReference | Pointer to governed evidence | evidence_id, source_snapshot_id |
| ModelRouteDecision | Recorded provider/model choice and rationale | route_decision_id |
| ExecutionTrace | Correlated operational history | trace_id, correlation_id |
| Escalation | Routed request for human or specialist intervention | escalation_id |
| SideEffectReceipt | Proof of an external action and idempotency | receipt_id, idempotency_key |

## Decision and Permission Rules

- Authorization uses deny-by-default evaluation across tenant, institution, workspace, user, role, object, field, workflow, agent, tool operation, environment, and data classification.
- A workflow step may execute only when entry conditions, required inputs, evidence prerequisites, policy checks, and prior approvals are satisfied.
- A model response is advisory until schema validation, grounding checks, policy checks, and required review are complete.
- Material external actions require a distinct approval record issued by an authorized human role after the final action payload is available for review.
- Approval expires when the payload, evidence set, policy version, destination, material amount, or action scope changes.
- Runtime administrators may restore service but may not substitute for business decision authority unless separately assigned that authority.
- Cross-tenant orchestration, global memory, and unrestricted provider retention are prohibited in V1.

## API and Event Expectations

All services use authenticated, tenant-scoped contracts. Mutating endpoints require idempotency keys. List endpoints require pagination, stable ordering, and authorization-aware filtering. Errors return a stable machine code, correlation ID, retryability flag, and safe human message.

Minimum runtime events include:

- `runtime.execution.created`
- `runtime.execution.started`
- `runtime.execution.paused`
- `runtime.execution.resumed`
- `runtime.execution.completed`
- `runtime.execution.failed`
- `runtime.step.started`
- `runtime.step.completed`
- `runtime.step.failed`
- `runtime.agent.invoked`
- `runtime.agent.output_validated`
- `runtime.tool.requested`
- `runtime.tool.executed`
- `runtime.approval.requested`
- `runtime.approval.decided`
- `runtime.evidence.attached`
- `runtime.escalation.created`
- `runtime.policy.denied`
- `runtime.cost.threshold_breached`

## Failure and Exception Behavior

- Validation errors fail before side effects and identify the invalid field and governing schema version.
- Permission failures are non-retryable and create a security-relevant audit event.
- Transient provider, network, and rate-limit failures use bounded exponential backoff with jitter.
- Ambiguous, conflicting, stale, or insufficient evidence creates an escalation or a blocked state rather than a fabricated conclusion.
- A lost worker lease permits another worker to resume only from the last committed checkpoint.
- Duplicate delivery is expected; handlers must be idempotent.
- Dead-lettered work retains the original event, failure history, tenant scope, replay eligibility, and required reviewer.

## Security and Privacy Controls

- Secrets are resolved at execution time from a managed secret store and are never embedded in prompts, manifests, traces, fixtures, or logs.
- Restricted payloads are referenced by opaque IDs; logs contain metadata and hashes rather than full content.
- Untrusted source content is separated from system instructions and cannot alter permissions, tool scope, approval requirements, or model policy.
- Sandboxed execution enforces network, CPU, memory, time, filesystem, package, and output limits.
- Model-provider use is constrained by tenant policy, data classification, retention terms, residency requirements, and approved use cases.
- Administrative replay and debugging use the same authorization checks as normal execution.

## Operational SLOs and Metrics

V1 target objectives, adjustable by tenant and workflow tier:

- runtime control-plane availability: 99.9% monthly
- durable-event acceptance: 99.95% monthly
- state-transition persistence: p95 under 500 ms excluding external dependencies
- queued-step dispatch: p95 under 5 seconds under normal load
- permission-check latency: p95 under 150 ms
- zero tolerated cross-tenant disclosure events
- zero tolerated unauthorized external actions
- 100% of material actions with audit and approval receipts
- 100% of active agents and workflows tied to an evaluation suite

## Implementation Notes for Claude Code

- Treat schemas and registries in this package as source contracts, not illustrative prose.
- Generate typed domain models from schemas where practical, but preserve canonical IDs and enum values.
- Implement state transitions through one guarded transition function rather than ad hoc status mutation.
- Place authorization, idempotency, audit emission, and policy checks in shared middleware that cannot be skipped by individual agents or tools.
- Store large inputs and outputs in governed object storage; store immutable references and content hashes in runtime records.
- Use an outbox pattern for state change plus event publication.
- Use leases and fencing tokens for workers processing long-running work.
- Keep provider adapters behind interfaces so model and tool providers can be changed without changing workflow semantics.

## Release Acceptance Criteria

- All machine-readable artifacts parse.
- Fixtures validate against their declared schemas.
- Every workflow, agent, tool, event, approval, and escalation reference resolves.
- Every external side effect has an idempotency strategy and approval rule.
- State-machine tests cover valid transitions and prohibited transitions.
- Permission tests include cross-tenant, cross-role, field-level, environment, and replay cases.
- Failure tests cover timeout, provider outage, duplicate event, worker loss, stale evidence, rejected approval, and compensation failure.
- Security tests cover prompt injection, secret leakage, unauthorized tool calls, sandbox escape attempts, and audit tampering.
- Validation report contains no critical or high-severity unresolved failures.

## Section-Specific Production Decisions

Workflow definitions use a declarative DSL with guarded transitions. Parallel branches join only after declared completion policies are met. Migration plans identify compatible fields, remapped states, backfill actions, rollback conditions, and approval authority.
