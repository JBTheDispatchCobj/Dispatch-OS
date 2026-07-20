# System Architecture

## Planes
### Shared Market Plane
Public entities, public observations, regulations, market events, derived metrics, Intelligence Objects, public relationships, and public profiles.

### Private Terminal Plane
Tenant documents, verified internal facts, strategic goals, policies, private relationships, private activity, personal profiles, role access, and cartridge configuration.

### Dispatch Control Plane
Identity, permissions, truth resolution, model routing, cost accounting, workflows, audit, cartridges, prompts, evaluations, and human escalation.

## Runtime flow
1. Connector or user submits an input.
2. Ingestion records immutable source metadata.
3. Extractors create observations and claims.
4. Deterministic logic computes metrics and triggers.
5. The harness routes eligible tasks to a model.
6. Intelligence Objects are assembled from sourced components.
7. Lenses create role, institution, person, cartridge, and channel variants.
8. Interactions update profiles and relationship state.
9. Execution cartridges create work, evidence, and outcomes.
