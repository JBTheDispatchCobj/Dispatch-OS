# FS-10000 UI Security Threat Model

## Protected Assets
Tenant context, institutional data, board materials, regulatory evidence, approvals, audit history, relationship intelligence, exports, tokens and administrative configuration.

## Principal Threats and Controls
- Cross-tenant data exposure: server-side tenant filters, cache partitioning and isolation tests.
- Broken object-level authorization: capability checks on every loader and command.
- Sensitive data in browser logs: structured redaction and prohibited-field tests.
- XSS and unsafe rich text: output encoding, sanitization and CSP.
- CSRF and command replay: same-site cookies, CSRF token and idempotency key.
- Approval spoofing: step-up authentication, signed approval object and immutable event.
- Export leakage: short-lived signed URL, watermark, classification and download audit.
- Search side channel: permission filtering before ranking and count aggregation.
- Stale or inferred data presented as fact: mandatory provenance and freshness badges.
- Malicious connector content: untrusted-content rendering boundary and no instruction execution.

## Release Gate
Critical or high findings affecting tenant isolation, authorization, approval integrity, secrets, exports or protected data block release.
