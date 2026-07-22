# FS-9000 Security, Privacy, and Graph Threat Model

## Protected Assets
Tenant-private relationships, network-shared connections, executive and board data, contracts, vendor and system dependencies, regulatory obligations, opportunity signals, inferred paths, evidence references, graph exports, query history, and identity mappings.

## Primary Threats and Required Controls

| Threat | Risk | Required Controls |
|---|---|---|
| Cross-tenant traversal | Hidden private relationships leak through paths or counts | tenant predicate on every query, negative isolation tests, cache partitioning, no existence leakage |
| Inference presented as fact | Users or agents act on unverified claims | source-state labels, confidence, method/version, expiry, review workflow |
| Graph poisoning | Malicious or low-quality sources create false nodes/edges | source allowlists, snapshots, signatures, quality rules, quarantine, conflict records |
| Identity collision | Separate institutions or people are merged | deterministic keys, thresholds, human review, reversible merge history |
| Relationship re-identification | Aggregates expose restricted parties | minimum cohort sizes, query-purpose controls, export restrictions, privacy review |
| Privilege escalation | Agent or user accesses broader graph | scoped tokens, least privilege, ABAC/RBAC, purpose binding, audit |
| Stale operational decision | outdated data drives recommendations | TTL, stale status, query disclosure, refresh alerts, blocked high-risk automation |
| Deletion failure | deleted source persists in indexes/derived edges | tombstones, propagation jobs, index rebuild, verification report |
| Model extraction or prompt leakage | agent context reveals graph data | context minimization, tool gateway, output filtering, tenant isolation |
| Availability attack | expensive traversals exhaust graph service | depth/limit caps, quotas, timeouts, cost budgets, circuit breakers |

## Human Authority Boundary
Graph outputs are intelligence and routing inputs. They do not constitute approval, suitability, compliance determination, legal opinion, investment authority, lending authority, or regulatory communication.

## Required Security Tests
Cross-tenant path tests, restricted-count leakage tests, cache-key isolation, export filtering, deletion propagation, inference-label persistence, malicious-source quarantine, graph-query denial logging, and break-glass review.
