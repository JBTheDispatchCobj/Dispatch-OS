# FS-11000 Runtime Security Threat Model

## Trust boundaries
User/Terminal, API gateway, orchestration control plane, workers, policy engine, model providers, tool/connector providers, event broker, state store, object store, observability pipeline and administrative plane are separate trust boundaries.

## Highest-severity abuse cases
- Cross-tenant context or output exposure.
- Agent invokes a material tool without payload-bound human approval.
- Untrusted source content modifies system behavior.
- Replay or retry duplicates an external commitment.
- Model fallback sends restricted data to an unapproved provider.
- Privileged operator tampers with audit evidence or approval records.
- Compromised connector returns poisoned content or malicious instructions.

## Mandatory mitigations
Deny-by-default authorization, tenant-scoped storage and indexes, short-lived capability tokens, gateway-only tool access, content/instruction separation, provider allowlists by classification, immutable audit events, idempotency receipts, sandboxing, secret brokering, signed manifests, dependency scanning, anomaly detection and incident kill switches.

## Security release gate
Zero cross-tenant failures, zero unauthorized side effects, no secrets in prompts/logs, successful injection and replay tests, verified environment separation, tested credential revocation and successful audit reconstruction.
