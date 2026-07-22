# Release Execution Runbook

1. Freeze candidate artifact versions and canonical registries.
2. Generate manifest and checksums.
3. Validate JSON, CSV headers, fixture/schema alignment, and references.
4. Run contract, integration, security, performance, migration, and readiness suites.
5. Triage defects and update known-issues register.
6. Obtain security/privacy and production-readiness decisions.
7. Approve deployment scope, window, communications, and rollback.
8. Deploy using immutable candidate.
9. Verify health, data integrity, tenant boundaries, workflows, approvals, and audit.
10. Observe for declared period; rollback on trigger.
11. Record value acceptance and final release decision.
12. Close release with evidence and archive immutable package.
