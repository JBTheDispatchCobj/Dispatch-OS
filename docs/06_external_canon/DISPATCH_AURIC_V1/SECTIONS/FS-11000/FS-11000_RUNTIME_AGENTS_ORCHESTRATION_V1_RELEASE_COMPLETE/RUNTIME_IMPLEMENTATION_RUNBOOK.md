# FS-11000 Runtime Implementation and Operations Runbook

## Build sequence
1. Implement canonical schemas and generated types.
2. Implement guarded state-transition service and append-only audit events.
3. Add transactional outbox and idempotent event consumers.
4. Implement policy decision point and capability tokens.
5. Add agent and tool registries with version pinning.
6. Implement context builder, model router, scheduler, retry service, approval bridge and escalation service.
7. Add traces, metrics, budgets and security controls.
8. Load synthetic fixture and run the acceptance suite.

## Deployment topology
Separate API/control plane, worker pools, event broker, relational state store, governed object storage, cache, secret manager, policy engine and observability pipeline. Production and pilot use separate credentials and data planes.

## Daily operations
Review failed and blocked executions, dead-letter queue, approval SLA breaches, provider health, cost anomalies, suspended agents, policy denials and security alerts. Replay only after root cause and scope are recorded.

## Incident actions
Stop affected executions; revoke capability tokens and connector credentials; suspend agent/tool/model route; quarantine outputs; preserve audit and payload hashes; notify security and tenant owner; remediate; run regression; require release approval before restoration.

## Recovery
Restore durable state and event broker from tested backups, verify checksums, reconcile outbox against broker offsets, rebuild projections, confirm tenant isolation, and resume only from committed checkpoints. Never recreate approvals or side-effect receipts from inference.

## Release gate
All critical tests pass, no unresolved high findings, manifests and schema refs resolve, fixture is accepted, cost and security dashboards are live, on-call ownership is assigned, and rollback is rehearsed.
