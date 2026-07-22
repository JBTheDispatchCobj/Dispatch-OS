# FS-13000 Implementation and Operations Runbook

## Deploy
1. Verify approved release manifest and integrity index.
2. Provision target environment using `ENVIRONMENT_MANIFEST.csv`.
3. Apply configuration, schemas, registries, feature flags, and tenant policy.
4. Run smoke, permission, tenant-isolation, API, event, and rollback tests.
5. Record deployment approval, release version, operator, time, and evidence.

## Onboard
1. Confirm executed commercial and data-processing terms.
2. Create tenant in suspended state.
3. Configure identity, roles, approvals, classification, retention, models, connectors, cartridges, and support contacts.
4. Seed only approved data.
5. Complete UAT, training, baseline capture, and activation approval.

## Operate Pilots
1. Use the approved pilot charter and RACI.
2. Monitor scope, milestones, data quality, approvals, support, cost, adoption, and success metrics.
3. Block uncontrolled scope expansion.
4. Maintain weekly status and decision log.
5. Close with value report and scale, extend, or stop decision.

## Commercial Operations
1. Enforce stage evidence and next actions.
2. Route exceptions through deal desk.
3. Reconcile price to cost, margin, delivery capacity, legal path, and security obligations.
4. Convert closed-won opportunities into implementation objects without rekeying canonical data.

## Incident and Exit
1. Suspend affected access, workflow, connector, partner, or environment.
2. Preserve evidence and customer communications.
3. Follow FS-12000 incident controls.
4. On exit, reconcile billing, credentials, data return/destruction, retention, open cases, and audit records.
