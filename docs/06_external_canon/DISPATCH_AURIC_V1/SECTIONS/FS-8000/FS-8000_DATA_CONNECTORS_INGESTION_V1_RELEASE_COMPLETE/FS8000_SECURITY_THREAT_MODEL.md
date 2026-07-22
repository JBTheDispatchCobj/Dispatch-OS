# FS-8000 Threat Model

## Protected Assets
Institutional source data, credentials, raw evidence, canonical candidates, lineage, approvals, connector configurations, tenant boundaries, audit records, and retention controls.

## Trust Boundaries
External provider to connector; user upload to staging; raw store to parser; parser to model/tool; candidate store to canonical services; tenant to platform operations; event bus to downstream consumers.

## Primary Threats and Controls
- **Credential theft:** secret references, vault-backed storage, rotation, least scopes, no credential logging.
- **Cross-tenant access:** tenant keys on every object, policy enforcement, isolated credentials/storage, negative tenancy tests.
- **Webhook spoofing/replay:** signatures, timestamp tolerance, nonce/event ID deduplication, allowlists.
- **Malware/archive bombs:** isolated scanning, size/depth/ratio limits, quarantine, no automatic model access.
- **Prompt injection in documents/email:** treat content as untrusted data, tool isolation, instruction stripping/labeling, no authority escalation.
- **Data poisoning:** source authority tiers, reconciliation, anomaly detection, provenance, approval gates.
- **Silent schema drift:** structural fingerprints, pinned mappings, contract tests, hold affected records.
- **False entity merges:** explainable thresholds, cannot-link constraints, protected IDs, review and reversal.
- **Lineage tampering:** append-only edges, hashes, restricted writes, integrity checks.
- **Over-retention or unlawful deletion:** executable retention, legal holds, approvals, deletion certificates.
- **Exfiltration through logs/models/exports:** classification-aware redaction, model-use policy, export permission, logging minimization.
- **Denial of service/cost exhaustion:** quotas, backpressure, partitioning, payload limits, circuit breakers.

## Security Gates
No release passes without parsing all machine-readable files, fixture validation, tenant-isolation tests, malicious-input tests, secret scanning, permission review, retention review, and checksum reconciliation.
