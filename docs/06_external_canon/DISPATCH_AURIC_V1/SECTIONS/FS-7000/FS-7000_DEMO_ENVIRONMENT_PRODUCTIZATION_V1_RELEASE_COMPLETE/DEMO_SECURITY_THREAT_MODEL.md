# Demo Environment Security Threat Model

## Assets

- synthetic fixtures
- demo credentials
- workflow configuration
- agent manifests
- public presentation outputs
- audit logs
- presenter controls

## Threats

- accidental production data use
- unauthorized guest access
- private data pasted into demo
- prompt injection from fixture content
- external action enabled accidentally
- reset failure
- stale credentials
- disclosure through logs or exports
- cross-tenant query
- manipulated evidence

## Controls

- dedicated synthetic tenant
- environment banner
- deterministic fixture labels
- connector allowlist
- outbound action disablement
- role-based presenter/admin access
- prompt-injection controls
- reset validation
- export restrictions
- audit logging
- security incident stop switch

## Release Blockers

- production connector enabled
- real customer/member data present
- external send available
- agent permission bypass
- reset failure
- private tenant data visible
