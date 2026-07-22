# Rollback and Recovery Runbook

Triggers include tenant-boundary failure, uncontrolled write, material data corruption, severe security event, failed migration reconciliation, systemic workflow failure, or executive no-go.

1. Declare incident and freeze affected release.
2. Stop new affected workflow and agent execution.
3. Suspend connectors or writes where required.
4. Preserve logs, evidence, and correlation IDs.
5. Select application rollback, configuration rollback, model/prompt rollback, data restore, or forward-fix path.
6. Execute approved recovery.
7. Reconcile data and event replay.
8. Validate permissions, evidence, approvals, and audit continuity.
9. Communicate status to affected stakeholders.
10. Record decision, cause, residual impact, and prevention actions.
