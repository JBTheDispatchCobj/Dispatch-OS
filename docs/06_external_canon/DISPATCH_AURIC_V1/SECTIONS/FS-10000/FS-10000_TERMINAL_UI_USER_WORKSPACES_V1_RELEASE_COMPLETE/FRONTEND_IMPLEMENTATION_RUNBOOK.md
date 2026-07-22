# FS-10000 Frontend Implementation Runbook

## Build Order
1. Implement terminal shell, context provider and server-authoritative session.
2. Generate typed clients from canonical API contracts.
3. Implement route registry and page loader boundary.
4. Implement design-system primitives and accessibility harness.
5. Implement evidence, approval, activity and data-quality shared components.
6. Implement workspaces in volume order.
7. Add telemetry with protected-value filtering.
8. Run contract, authorization, accessibility, responsive and performance suites.

## Environment Gates
Demo may use synthetic fixtures only. Pilot requires tenant isolation, identity federation or approved identity controls, encryption, audit logging, backup and incident routing. Production additionally requires security release approval, capacity sign-off, rollback rehearsal and monitoring.

## Deployment
Use immutable frontend artifacts, versioned configuration, feature flags, CSP nonces and signed source maps restricted to operations. Deploy canary, verify synthetic journeys, then promote.

## Rollback
Disable affected feature flag or revert immutable artifact. Do not roll back schema assumptions without compatibility confirmation. Preserve audit and command-job continuity.

## Operations
Monitor route error rate, loader latency, command failure, denied-access anomalies, stale-data prevalence, export failures, accessibility regressions and client-version skew.
