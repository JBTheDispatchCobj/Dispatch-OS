# FS-12000 V1 Acceptance Tests

## Required Suites
- IAM: authentication, MFA, RBAC/ABAC, privileged elevation, expiry, revocation, service identity, and separation of duties.
- Tenancy: positive and negative reads/writes across every service, store, queue, cache, search index, graph, log, backup, and model context.
- Data: encryption, key rotation, classification, redaction, export approval, retention, legal hold, and deletion verification.
- Connectors: least scope, secret custody, consent, suspension, webhook verification, and credential rotation.
- AI: approved route, prohibited action, prompt injection, data leakage, citation/evidence, human approval, and evaluation threshold.
- Incident: alert creation, severity, paging, containment, evidence preservation, notification approval, recovery, and postmortem.
- Resilience: backup integrity, point-in-time restore, zone failure, dependency failure, degraded mode, and RTO/RPO measurement.
- Audit: append-only behavior, integrity signatures, access logging, evidence export, and examiner binder reproducibility.

## Exit Criteria
No critical test may be skipped. All mandatory control failures block release. High-severity findings require remediation and retest. Medium findings require an approved time-bound corrective plan. Test evidence must be referenced in the release manifest.
