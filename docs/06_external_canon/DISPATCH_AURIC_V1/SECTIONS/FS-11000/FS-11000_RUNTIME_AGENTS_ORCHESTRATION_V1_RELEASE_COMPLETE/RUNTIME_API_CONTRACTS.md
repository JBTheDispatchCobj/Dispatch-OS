# FS-11000 Runtime API Contracts

## Common requirements
All requests require tenant-scoped authentication, correlation ID, and for mutations an idempotency key. Responses include resource version, audit event reference, and stable error envelope.

## Endpoints

| Method | Path | Purpose | Required authority | Primary events |
|---|---|---|---|---|
| POST | /v1/runtime/executions | Create workflow instance | workflow.start | runtime.execution.created |
| GET | /v1/runtime/executions/{id} | Read authorized instance | workflow.read | none |
| POST | /v1/runtime/executions/{id}/pause | Pause resumable work | workflow.pause | runtime.execution.paused |
| POST | /v1/runtime/executions/{id}/resume | Resume from checkpoint | workflow.resume | runtime.execution.resumed |
| POST | /v1/runtime/executions/{id}/cancel | Cancel future work | workflow.cancel | runtime.execution.cancelled |
| POST | /v1/runtime/executions/{id}/approvals | Submit approval decision | approval.decide plus matching authority | runtime.approval.decided |
| POST | /v1/runtime/executions/{id}/evidence | Attach evidence reference | evidence.attach | runtime.evidence.attached |
| GET | /v1/runtime/executions/{id}/trace | Retrieve reconstructable trace | runtime.audit.read | none |
| POST | /v1/runtime/events/{id}/replay | Governed replay | runtime.replay | runtime.event.replay_requested |

## Error envelope
```json
{"error_code":"RT-PERMISSION-001","message":"Action not authorized.","retryable":false,"correlation_id":"CORR-...","details_ref":"AUDIT-..."}
```
