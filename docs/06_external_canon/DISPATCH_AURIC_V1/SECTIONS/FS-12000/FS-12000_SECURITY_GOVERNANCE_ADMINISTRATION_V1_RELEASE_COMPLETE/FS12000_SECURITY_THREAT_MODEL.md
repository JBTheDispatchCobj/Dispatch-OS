# FS-12000 Security Threat Model

## Method
Threats are evaluated across identity, tenant, data, connector, runtime, AI/model, application, infrastructure, administration, audit, and recovery boundaries. Each threat is tied to preventive, detective, and corrective controls.

| Threat | Attack path | Required controls | Detection | Response | Release test |
|---|---|---|---|---|---|
| Cross-tenant access | Broken authorization or query scoping | tenant claims, row/object policy, service enforcement | denied-access correlation | suspend route and investigate | negative tenant suite |
| Privileged takeover | credential theft/session hijack | MFA, conditional access, PAM, short sessions | impossible travel and privilege anomaly | revoke sessions and rotate credentials | privileged-access tests |
| Secret exposure | prompt, log, source, CI artifact | vault, redaction, scanning, scoped tokens | secret scanner and egress alert | revoke, rotate, assess access | seeded-secret test |
| Prompt injection | untrusted document or external content | content trust labels, tool policy, context isolation | instruction-conflict telemetry | quarantine source and halt tool use | adversarial corpus |
| Data exfiltration | export, model, connector, support access | DLP, export approval, egress allowlist | volume and destination anomaly | block, preserve evidence, incident | export-policy tests |
| Audit tampering | log deletion or event manipulation | append-only store, signatures, segregation | integrity verification | isolate account and reconstruct | checksum verification |
| Supply-chain compromise | dependency, image, integration | pinning, SBOM, signing, scanning | artifact verification | stop release and revoke artifact | provenance gate |
| Model misuse | unapproved route or autonomous decision | use-case registry, model gateway, human approval | route-policy event | suspend use case | prohibited-action test |
| Recovery failure | corrupted or unusable backups | immutable backups and restore exercises | restore validation | invoke DR and corrective plan | scheduled restore test |

## Residual-Risk Rule
Critical residual risk requires named executive acceptance with expiration and compensating controls. Cross-tenant disclosure, audit compromise, and uncontrolled material AI decision cannot be accepted as ordinary residual risk for V1.
