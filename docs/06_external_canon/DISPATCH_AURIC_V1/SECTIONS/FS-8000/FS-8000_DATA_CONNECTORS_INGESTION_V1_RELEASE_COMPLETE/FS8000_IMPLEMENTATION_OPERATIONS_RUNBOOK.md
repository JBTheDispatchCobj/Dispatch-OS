# FS-8000 Implementation and Operations Runbook

## Build Order
1. Deploy schemas and registries.
2. Provision tenant-isolated raw, parsed, normalized, candidate, and accepted stores.
3. Deploy source and connector services.
4. Deploy file, API, webhook, email/calendar, and batch adapters.
5. Deploy mapping, entity-resolution, quality, reconciliation, lineage, freshness, and retention services.
6. Connect FS-6000 canonical services, FS-9000 population/graph, FS-10000 review queues, and FS-11000 event/runtime consumers.
7. Load synthetic fixture and execute acceptance suite.

## Preconditions
- tenant, service identities, secrets, key management, audit, permission, event, storage, and monitoring services are available;
- FS-5000 registry identifiers and FS-6000 object targets are loaded;
- source terms and connector scopes are approved;
- retention and classification policies are active.

## Standard Job Operation
1. Verify connector health and source authorization.
2. Create job and immutable snapshot.
3. Scan and classify.
4. Parse and profile structure.
5. Map using pinned version.
6. Resolve entities.
7. Run quality and reconciliation gates.
8. Create lineage.
9. Publish accepted candidates and exceptions.
10. Commit watermark after accepted completion.
11. Record metrics and audit events.

## Failure Runbooks

### Authentication Failure
Suspend the tenant connector, preserve job state, alert the tenant administrator, rotate or renew credentials, retest scopes, and replay with the original correlation context.

### Malware or Hostile Content
Quarantine bytes, block parsing and model access, create a security incident when thresholds require, preserve chain of custody, and do not retry automatically.

### Schema Drift
Freeze the affected mapping version, preserve the snapshot, compare structural profiles, create a new mapping version, execute fixture and regression tests, approve, then replay.

### Entity Conflict
Keep candidates separate, preserve matching evidence and negative evidence, assign a data steward, record the decision and undo path, and never auto-merge a protected identity.

### Reconciliation Failure
Block affected publication, calculate variance and scope, identify source or transformation cause, correct or obtain a time-limited authorized waiver, and preserve both measured and waived results.

### Stale Data
Attempt approved refresh, show stale status, enforce downstream use policy, and do not replace a known stale value with an unsupported inferred value.

### Connector Revocation
Stop scheduling and retrieval, invalidate credentials, publish revocation event, apply retention/consent rules, and verify no further calls succeed.

## Operational Metrics
Job success, source latency, connector availability, rows/bytes, exception rate, schema drift, duplicate rate, unresolved identities, reconciliation variance, lineage coverage, freshness compliance, restricted-data detections, replay time, storage growth, token/model cost, and cost per tenant/source/job.

## Release and Rollback
Deploy schemas backward-compatibly, canary connectors by tenant, retain prior mapping versions, stop publication before rollback, replay from immutable snapshots, and reconcile outputs after restoration.
