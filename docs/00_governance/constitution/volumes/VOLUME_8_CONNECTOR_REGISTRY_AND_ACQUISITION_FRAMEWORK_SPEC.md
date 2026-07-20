# Volume 8: Connector Registry and Acquisition Framework Specification

Status: Implementation Specification
Owner: Auric Works
Constitutional Authority: Dispatch Constitution V1.0
Audience: Claude coding agents, human engineers, architects, reviewers
Implementation Target: Existing Dispatch OS repository with Supabase/Postgres and cartridge-first architecture

This volume is normative. It defines durable subsystem contracts rather than interface styling. UI work is intentionally downstream. All implementations must preserve provenance, tenancy, audit, cost visibility, model replaceability, and cartridge isolation.


# Executive Mandate


Connector Registry and Acquisition Framework is the authoritative implementation specification for this subsystem. It translates the Dispatch Constitution into buildable contracts for the existing repository. The subsystem must remain compatible with the shared kernel, bounded context-pack workflow, Supabase/Postgres persistence, and future open-model plus frontier-model routing.


# 1. Acquisition mandate


## Purpose

This section defines the acquisition mandate requirements for Connector Registry and Acquisition Framework. The implementation must expose explicit contracts, avoid hidden behavior, preserve provenance and tenancy, and remain portable across domains and model providers.

## Required Design

The subsystem must define:

- canonical owner and repository location,
- schemas and typed interfaces,
- lifecycle states and transitions,
- events emitted and consumed,
- permissions and visibility,
- source and provenance behavior,
- deterministic and model-assisted execution boundaries,
- failure, retry, timeout, and recovery behavior,
- observability and cost accounting,
- migrations and backward compatibility,
- regression and evaluation coverage.

## Reference Contract

```typescript
export interface AcquisitionmandateContract {
  id: string;
  version: string;
  tenantId?: string;
  status: "draft" | "active" | "suspended" | "retired";
  sourceRefs: string[];
  confidence?: number;
  createdAt: string;
  updatedAt: string;
  metadata: Record<string, unknown>;
}
```

## Data Rules

1. Structured state belongs in Postgres.
2. Raw or large source artifacts belong in object storage.
3. Semantic indexes supplement structured retrieval and never become the sole system of record.
4. Every material state change emits an immutable event.
5. Every automated decision records the rule, tool, model, prompt version, inputs, output, cost, and confidence.
6. Domain variation belongs in cartridges or configuration.
7. Private data cannot enter the shared graph without explicit authority.

## Failure Rules

The implementation must fail closed on permission uncertainty, fail visibly on source conflicts, and escalate when confidence or stakes exceed configured thresholds. Retries must be idempotent. Partial completion must be recorded without implying success.

## Acceptance Criteria

- typed contract exists,
- database migration exists,
- RLS or permission policy exists,
- API contract exists,
- event coverage exists,
- audit record exists,
- unit and integration tests exist,
- failure fixture exists,
- cost and latency are observable,
- handoff and current-state documentation are updated.


# 2. Source classes


## Purpose

This section defines the source classes requirements for Connector Registry and Acquisition Framework. The implementation must expose explicit contracts, avoid hidden behavior, preserve provenance and tenancy, and remain portable across domains and model providers.

## Required Design

The subsystem must define:

- canonical owner and repository location,
- schemas and typed interfaces,
- lifecycle states and transitions,
- events emitted and consumed,
- permissions and visibility,
- source and provenance behavior,
- deterministic and model-assisted execution boundaries,
- failure, retry, timeout, and recovery behavior,
- observability and cost accounting,
- migrations and backward compatibility,
- regression and evaluation coverage.

## Reference Contract

```typescript
export interface SourceclassesContract {
  id: string;
  version: string;
  tenantId?: string;
  status: "draft" | "active" | "suspended" | "retired";
  sourceRefs: string[];
  confidence?: number;
  createdAt: string;
  updatedAt: string;
  metadata: Record<string, unknown>;
}
```

## Data Rules

1. Structured state belongs in Postgres.
2. Raw or large source artifacts belong in object storage.
3. Semantic indexes supplement structured retrieval and never become the sole system of record.
4. Every material state change emits an immutable event.
5. Every automated decision records the rule, tool, model, prompt version, inputs, output, cost, and confidence.
6. Domain variation belongs in cartridges or configuration.
7. Private data cannot enter the shared graph without explicit authority.

## Failure Rules

The implementation must fail closed on permission uncertainty, fail visibly on source conflicts, and escalate when confidence or stakes exceed configured thresholds. Retries must be idempotent. Partial completion must be recorded without implying success.

## Acceptance Criteria

- typed contract exists,
- database migration exists,
- RLS or permission policy exists,
- API contract exists,
- event coverage exists,
- audit record exists,
- unit and integration tests exist,
- failure fixture exists,
- cost and latency are observable,
- handoff and current-state documentation are updated.


# 3. Connector manifest


## Purpose

This section defines the connector manifest requirements for Connector Registry and Acquisition Framework. The implementation must expose explicit contracts, avoid hidden behavior, preserve provenance and tenancy, and remain portable across domains and model providers.

## Required Design

The subsystem must define:

- canonical owner and repository location,
- schemas and typed interfaces,
- lifecycle states and transitions,
- events emitted and consumed,
- permissions and visibility,
- source and provenance behavior,
- deterministic and model-assisted execution boundaries,
- failure, retry, timeout, and recovery behavior,
- observability and cost accounting,
- migrations and backward compatibility,
- regression and evaluation coverage.

## Reference Contract

```typescript
export interface ConnectormanifestContract {
  id: string;
  version: string;
  tenantId?: string;
  status: "draft" | "active" | "suspended" | "retired";
  sourceRefs: string[];
  confidence?: number;
  createdAt: string;
  updatedAt: string;
  metadata: Record<string, unknown>;
}
```

## Data Rules

1. Structured state belongs in Postgres.
2. Raw or large source artifacts belong in object storage.
3. Semantic indexes supplement structured retrieval and never become the sole system of record.
4. Every material state change emits an immutable event.
5. Every automated decision records the rule, tool, model, prompt version, inputs, output, cost, and confidence.
6. Domain variation belongs in cartridges or configuration.
7. Private data cannot enter the shared graph without explicit authority.

## Failure Rules

The implementation must fail closed on permission uncertainty, fail visibly on source conflicts, and escalate when confidence or stakes exceed configured thresholds. Retries must be idempotent. Partial completion must be recorded without implying success.

## Acceptance Criteria

- typed contract exists,
- database migration exists,
- RLS or permission policy exists,
- API contract exists,
- event coverage exists,
- audit record exists,
- unit and integration tests exist,
- failure fixture exists,
- cost and latency are observable,
- handoff and current-state documentation are updated.


# 4. Authentication


## Purpose

This section defines the authentication requirements for Connector Registry and Acquisition Framework. The implementation must expose explicit contracts, avoid hidden behavior, preserve provenance and tenancy, and remain portable across domains and model providers.

## Required Design

The subsystem must define:

- canonical owner and repository location,
- schemas and typed interfaces,
- lifecycle states and transitions,
- events emitted and consumed,
- permissions and visibility,
- source and provenance behavior,
- deterministic and model-assisted execution boundaries,
- failure, retry, timeout, and recovery behavior,
- observability and cost accounting,
- migrations and backward compatibility,
- regression and evaluation coverage.

## Reference Contract

```typescript
export interface AuthenticationContract {
  id: string;
  version: string;
  tenantId?: string;
  status: "draft" | "active" | "suspended" | "retired";
  sourceRefs: string[];
  confidence?: number;
  createdAt: string;
  updatedAt: string;
  metadata: Record<string, unknown>;
}
```

## Data Rules

1. Structured state belongs in Postgres.
2. Raw or large source artifacts belong in object storage.
3. Semantic indexes supplement structured retrieval and never become the sole system of record.
4. Every material state change emits an immutable event.
5. Every automated decision records the rule, tool, model, prompt version, inputs, output, cost, and confidence.
6. Domain variation belongs in cartridges or configuration.
7. Private data cannot enter the shared graph without explicit authority.

## Failure Rules

The implementation must fail closed on permission uncertainty, fail visibly on source conflicts, and escalate when confidence or stakes exceed configured thresholds. Retries must be idempotent. Partial completion must be recorded without implying success.

## Acceptance Criteria

- typed contract exists,
- database migration exists,
- RLS or permission policy exists,
- API contract exists,
- event coverage exists,
- audit record exists,
- unit and integration tests exist,
- failure fixture exists,
- cost and latency are observable,
- handoff and current-state documentation are updated.


# 5. Acquisition methods


## Purpose

This section defines the acquisition methods requirements for Connector Registry and Acquisition Framework. The implementation must expose explicit contracts, avoid hidden behavior, preserve provenance and tenancy, and remain portable across domains and model providers.

## Required Design

The subsystem must define:

- canonical owner and repository location,
- schemas and typed interfaces,
- lifecycle states and transitions,
- events emitted and consumed,
- permissions and visibility,
- source and provenance behavior,
- deterministic and model-assisted execution boundaries,
- failure, retry, timeout, and recovery behavior,
- observability and cost accounting,
- migrations and backward compatibility,
- regression and evaluation coverage.

## Reference Contract

```typescript
export interface AcquisitionmethodsContract {
  id: string;
  version: string;
  tenantId?: string;
  status: "draft" | "active" | "suspended" | "retired";
  sourceRefs: string[];
  confidence?: number;
  createdAt: string;
  updatedAt: string;
  metadata: Record<string, unknown>;
}
```

## Data Rules

1. Structured state belongs in Postgres.
2. Raw or large source artifacts belong in object storage.
3. Semantic indexes supplement structured retrieval and never become the sole system of record.
4. Every material state change emits an immutable event.
5. Every automated decision records the rule, tool, model, prompt version, inputs, output, cost, and confidence.
6. Domain variation belongs in cartridges or configuration.
7. Private data cannot enter the shared graph without explicit authority.

## Failure Rules

The implementation must fail closed on permission uncertainty, fail visibly on source conflicts, and escalate when confidence or stakes exceed configured thresholds. Retries must be idempotent. Partial completion must be recorded without implying success.

## Acceptance Criteria

- typed contract exists,
- database migration exists,
- RLS or permission policy exists,
- API contract exists,
- event coverage exists,
- audit record exists,
- unit and integration tests exist,
- failure fixture exists,
- cost and latency are observable,
- handoff and current-state documentation are updated.


# 6. Terms and legal controls


## Purpose

This section defines the terms and legal controls requirements for Connector Registry and Acquisition Framework. The implementation must expose explicit contracts, avoid hidden behavior, preserve provenance and tenancy, and remain portable across domains and model providers.

## Required Design

The subsystem must define:

- canonical owner and repository location,
- schemas and typed interfaces,
- lifecycle states and transitions,
- events emitted and consumed,
- permissions and visibility,
- source and provenance behavior,
- deterministic and model-assisted execution boundaries,
- failure, retry, timeout, and recovery behavior,
- observability and cost accounting,
- migrations and backward compatibility,
- regression and evaluation coverage.

## Reference Contract

```typescript
export interface TermsandlegalcontrolsContract {
  id: string;
  version: string;
  tenantId?: string;
  status: "draft" | "active" | "suspended" | "retired";
  sourceRefs: string[];
  confidence?: number;
  createdAt: string;
  updatedAt: string;
  metadata: Record<string, unknown>;
}
```

## Data Rules

1. Structured state belongs in Postgres.
2. Raw or large source artifacts belong in object storage.
3. Semantic indexes supplement structured retrieval and never become the sole system of record.
4. Every material state change emits an immutable event.
5. Every automated decision records the rule, tool, model, prompt version, inputs, output, cost, and confidence.
6. Domain variation belongs in cartridges or configuration.
7. Private data cannot enter the shared graph without explicit authority.

## Failure Rules

The implementation must fail closed on permission uncertainty, fail visibly on source conflicts, and escalate when confidence or stakes exceed configured thresholds. Retries must be idempotent. Partial completion must be recorded without implying success.

## Acceptance Criteria

- typed contract exists,
- database migration exists,
- RLS or permission policy exists,
- API contract exists,
- event coverage exists,
- audit record exists,
- unit and integration tests exist,
- failure fixture exists,
- cost and latency are observable,
- handoff and current-state documentation are updated.


# 7. Refresh cadence


## Purpose

This section defines the refresh cadence requirements for Connector Registry and Acquisition Framework. The implementation must expose explicit contracts, avoid hidden behavior, preserve provenance and tenancy, and remain portable across domains and model providers.

## Required Design

The subsystem must define:

- canonical owner and repository location,
- schemas and typed interfaces,
- lifecycle states and transitions,
- events emitted and consumed,
- permissions and visibility,
- source and provenance behavior,
- deterministic and model-assisted execution boundaries,
- failure, retry, timeout, and recovery behavior,
- observability and cost accounting,
- migrations and backward compatibility,
- regression and evaluation coverage.

## Reference Contract

```typescript
export interface RefreshcadenceContract {
  id: string;
  version: string;
  tenantId?: string;
  status: "draft" | "active" | "suspended" | "retired";
  sourceRefs: string[];
  confidence?: number;
  createdAt: string;
  updatedAt: string;
  metadata: Record<string, unknown>;
}
```

## Data Rules

1. Structured state belongs in Postgres.
2. Raw or large source artifacts belong in object storage.
3. Semantic indexes supplement structured retrieval and never become the sole system of record.
4. Every material state change emits an immutable event.
5. Every automated decision records the rule, tool, model, prompt version, inputs, output, cost, and confidence.
6. Domain variation belongs in cartridges or configuration.
7. Private data cannot enter the shared graph without explicit authority.

## Failure Rules

The implementation must fail closed on permission uncertainty, fail visibly on source conflicts, and escalate when confidence or stakes exceed configured thresholds. Retries must be idempotent. Partial completion must be recorded without implying success.

## Acceptance Criteria

- typed contract exists,
- database migration exists,
- RLS or permission policy exists,
- API contract exists,
- event coverage exists,
- audit record exists,
- unit and integration tests exist,
- failure fixture exists,
- cost and latency are observable,
- handoff and current-state documentation are updated.


# 8. Raw evidence


## Purpose

This section defines the raw evidence requirements for Connector Registry and Acquisition Framework. The implementation must expose explicit contracts, avoid hidden behavior, preserve provenance and tenancy, and remain portable across domains and model providers.

## Required Design

The subsystem must define:

- canonical owner and repository location,
- schemas and typed interfaces,
- lifecycle states and transitions,
- events emitted and consumed,
- permissions and visibility,
- source and provenance behavior,
- deterministic and model-assisted execution boundaries,
- failure, retry, timeout, and recovery behavior,
- observability and cost accounting,
- migrations and backward compatibility,
- regression and evaluation coverage.

## Reference Contract

```typescript
export interface RawevidenceContract {
  id: string;
  version: string;
  tenantId?: string;
  status: "draft" | "active" | "suspended" | "retired";
  sourceRefs: string[];
  confidence?: number;
  createdAt: string;
  updatedAt: string;
  metadata: Record<string, unknown>;
}
```

## Data Rules

1. Structured state belongs in Postgres.
2. Raw or large source artifacts belong in object storage.
3. Semantic indexes supplement structured retrieval and never become the sole system of record.
4. Every material state change emits an immutable event.
5. Every automated decision records the rule, tool, model, prompt version, inputs, output, cost, and confidence.
6. Domain variation belongs in cartridges or configuration.
7. Private data cannot enter the shared graph without explicit authority.

## Failure Rules

The implementation must fail closed on permission uncertainty, fail visibly on source conflicts, and escalate when confidence or stakes exceed configured thresholds. Retries must be idempotent. Partial completion must be recorded without implying success.

## Acceptance Criteria

- typed contract exists,
- database migration exists,
- RLS or permission policy exists,
- API contract exists,
- event coverage exists,
- audit record exists,
- unit and integration tests exist,
- failure fixture exists,
- cost and latency are observable,
- handoff and current-state documentation are updated.


# 9. Parsing


## Purpose

This section defines the parsing requirements for Connector Registry and Acquisition Framework. The implementation must expose explicit contracts, avoid hidden behavior, preserve provenance and tenancy, and remain portable across domains and model providers.

## Required Design

The subsystem must define:

- canonical owner and repository location,
- schemas and typed interfaces,
- lifecycle states and transitions,
- events emitted and consumed,
- permissions and visibility,
- source and provenance behavior,
- deterministic and model-assisted execution boundaries,
- failure, retry, timeout, and recovery behavior,
- observability and cost accounting,
- migrations and backward compatibility,
- regression and evaluation coverage.

## Reference Contract

```typescript
export interface ParsingContract {
  id: string;
  version: string;
  tenantId?: string;
  status: "draft" | "active" | "suspended" | "retired";
  sourceRefs: string[];
  confidence?: number;
  createdAt: string;
  updatedAt: string;
  metadata: Record<string, unknown>;
}
```

## Data Rules

1. Structured state belongs in Postgres.
2. Raw or large source artifacts belong in object storage.
3. Semantic indexes supplement structured retrieval and never become the sole system of record.
4. Every material state change emits an immutable event.
5. Every automated decision records the rule, tool, model, prompt version, inputs, output, cost, and confidence.
6. Domain variation belongs in cartridges or configuration.
7. Private data cannot enter the shared graph without explicit authority.

## Failure Rules

The implementation must fail closed on permission uncertainty, fail visibly on source conflicts, and escalate when confidence or stakes exceed configured thresholds. Retries must be idempotent. Partial completion must be recorded without implying success.

## Acceptance Criteria

- typed contract exists,
- database migration exists,
- RLS or permission policy exists,
- API contract exists,
- event coverage exists,
- audit record exists,
- unit and integration tests exist,
- failure fixture exists,
- cost and latency are observable,
- handoff and current-state documentation are updated.


# 10. Normalization


## Purpose

This section defines the normalization requirements for Connector Registry and Acquisition Framework. The implementation must expose explicit contracts, avoid hidden behavior, preserve provenance and tenancy, and remain portable across domains and model providers.

## Required Design

The subsystem must define:

- canonical owner and repository location,
- schemas and typed interfaces,
- lifecycle states and transitions,
- events emitted and consumed,
- permissions and visibility,
- source and provenance behavior,
- deterministic and model-assisted execution boundaries,
- failure, retry, timeout, and recovery behavior,
- observability and cost accounting,
- migrations and backward compatibility,
- regression and evaluation coverage.

## Reference Contract

```typescript
export interface NormalizationContract {
  id: string;
  version: string;
  tenantId?: string;
  status: "draft" | "active" | "suspended" | "retired";
  sourceRefs: string[];
  confidence?: number;
  createdAt: string;
  updatedAt: string;
  metadata: Record<string, unknown>;
}
```

## Data Rules

1. Structured state belongs in Postgres.
2. Raw or large source artifacts belong in object storage.
3. Semantic indexes supplement structured retrieval and never become the sole system of record.
4. Every material state change emits an immutable event.
5. Every automated decision records the rule, tool, model, prompt version, inputs, output, cost, and confidence.
6. Domain variation belongs in cartridges or configuration.
7. Private data cannot enter the shared graph without explicit authority.

## Failure Rules

The implementation must fail closed on permission uncertainty, fail visibly on source conflicts, and escalate when confidence or stakes exceed configured thresholds. Retries must be idempotent. Partial completion must be recorded without implying success.

## Acceptance Criteria

- typed contract exists,
- database migration exists,
- RLS or permission policy exists,
- API contract exists,
- event coverage exists,
- audit record exists,
- unit and integration tests exist,
- failure fixture exists,
- cost and latency are observable,
- handoff and current-state documentation are updated.


# 11. Entity extraction


## Purpose

This section defines the entity extraction requirements for Connector Registry and Acquisition Framework. The implementation must expose explicit contracts, avoid hidden behavior, preserve provenance and tenancy, and remain portable across domains and model providers.

## Required Design

The subsystem must define:

- canonical owner and repository location,
- schemas and typed interfaces,
- lifecycle states and transitions,
- events emitted and consumed,
- permissions and visibility,
- source and provenance behavior,
- deterministic and model-assisted execution boundaries,
- failure, retry, timeout, and recovery behavior,
- observability and cost accounting,
- migrations and backward compatibility,
- regression and evaluation coverage.

## Reference Contract

```typescript
export interface EntityextractionContract {
  id: string;
  version: string;
  tenantId?: string;
  status: "draft" | "active" | "suspended" | "retired";
  sourceRefs: string[];
  confidence?: number;
  createdAt: string;
  updatedAt: string;
  metadata: Record<string, unknown>;
}
```

## Data Rules

1. Structured state belongs in Postgres.
2. Raw or large source artifacts belong in object storage.
3. Semantic indexes supplement structured retrieval and never become the sole system of record.
4. Every material state change emits an immutable event.
5. Every automated decision records the rule, tool, model, prompt version, inputs, output, cost, and confidence.
6. Domain variation belongs in cartridges or configuration.
7. Private data cannot enter the shared graph without explicit authority.

## Failure Rules

The implementation must fail closed on permission uncertainty, fail visibly on source conflicts, and escalate when confidence or stakes exceed configured thresholds. Retries must be idempotent. Partial completion must be recorded without implying success.

## Acceptance Criteria

- typed contract exists,
- database migration exists,
- RLS or permission policy exists,
- API contract exists,
- event coverage exists,
- audit record exists,
- unit and integration tests exist,
- failure fixture exists,
- cost and latency are observable,
- handoff and current-state documentation are updated.


# 12. Relationship extraction


## Purpose

This section defines the relationship extraction requirements for Connector Registry and Acquisition Framework. The implementation must expose explicit contracts, avoid hidden behavior, preserve provenance and tenancy, and remain portable across domains and model providers.

## Required Design

The subsystem must define:

- canonical owner and repository location,
- schemas and typed interfaces,
- lifecycle states and transitions,
- events emitted and consumed,
- permissions and visibility,
- source and provenance behavior,
- deterministic and model-assisted execution boundaries,
- failure, retry, timeout, and recovery behavior,
- observability and cost accounting,
- migrations and backward compatibility,
- regression and evaluation coverage.

## Reference Contract

```typescript
export interface RelationshipextractionContract {
  id: string;
  version: string;
  tenantId?: string;
  status: "draft" | "active" | "suspended" | "retired";
  sourceRefs: string[];
  confidence?: number;
  createdAt: string;
  updatedAt: string;
  metadata: Record<string, unknown>;
}
```

## Data Rules

1. Structured state belongs in Postgres.
2. Raw or large source artifacts belong in object storage.
3. Semantic indexes supplement structured retrieval and never become the sole system of record.
4. Every material state change emits an immutable event.
5. Every automated decision records the rule, tool, model, prompt version, inputs, output, cost, and confidence.
6. Domain variation belongs in cartridges or configuration.
7. Private data cannot enter the shared graph without explicit authority.

## Failure Rules

The implementation must fail closed on permission uncertainty, fail visibly on source conflicts, and escalate when confidence or stakes exceed configured thresholds. Retries must be idempotent. Partial completion must be recorded without implying success.

## Acceptance Criteria

- typed contract exists,
- database migration exists,
- RLS or permission policy exists,
- API contract exists,
- event coverage exists,
- audit record exists,
- unit and integration tests exist,
- failure fixture exists,
- cost and latency are observable,
- handoff and current-state documentation are updated.


# 13. Change detection


## Purpose

This section defines the change detection requirements for Connector Registry and Acquisition Framework. The implementation must expose explicit contracts, avoid hidden behavior, preserve provenance and tenancy, and remain portable across domains and model providers.

## Required Design

The subsystem must define:

- canonical owner and repository location,
- schemas and typed interfaces,
- lifecycle states and transitions,
- events emitted and consumed,
- permissions and visibility,
- source and provenance behavior,
- deterministic and model-assisted execution boundaries,
- failure, retry, timeout, and recovery behavior,
- observability and cost accounting,
- migrations and backward compatibility,
- regression and evaluation coverage.

## Reference Contract

```typescript
export interface ChangedetectionContract {
  id: string;
  version: string;
  tenantId?: string;
  status: "draft" | "active" | "suspended" | "retired";
  sourceRefs: string[];
  confidence?: number;
  createdAt: string;
  updatedAt: string;
  metadata: Record<string, unknown>;
}
```

## Data Rules

1. Structured state belongs in Postgres.
2. Raw or large source artifacts belong in object storage.
3. Semantic indexes supplement structured retrieval and never become the sole system of record.
4. Every material state change emits an immutable event.
5. Every automated decision records the rule, tool, model, prompt version, inputs, output, cost, and confidence.
6. Domain variation belongs in cartridges or configuration.
7. Private data cannot enter the shared graph without explicit authority.

## Failure Rules

The implementation must fail closed on permission uncertainty, fail visibly on source conflicts, and escalate when confidence or stakes exceed configured thresholds. Retries must be idempotent. Partial completion must be recorded without implying success.

## Acceptance Criteria

- typed contract exists,
- database migration exists,
- RLS or permission policy exists,
- API contract exists,
- event coverage exists,
- audit record exists,
- unit and integration tests exist,
- failure fixture exists,
- cost and latency are observable,
- handoff and current-state documentation are updated.


# 14. Failure handling


## Purpose

This section defines the failure handling requirements for Connector Registry and Acquisition Framework. The implementation must expose explicit contracts, avoid hidden behavior, preserve provenance and tenancy, and remain portable across domains and model providers.

## Required Design

The subsystem must define:

- canonical owner and repository location,
- schemas and typed interfaces,
- lifecycle states and transitions,
- events emitted and consumed,
- permissions and visibility,
- source and provenance behavior,
- deterministic and model-assisted execution boundaries,
- failure, retry, timeout, and recovery behavior,
- observability and cost accounting,
- migrations and backward compatibility,
- regression and evaluation coverage.

## Reference Contract

```typescript
export interface FailurehandlingContract {
  id: string;
  version: string;
  tenantId?: string;
  status: "draft" | "active" | "suspended" | "retired";
  sourceRefs: string[];
  confidence?: number;
  createdAt: string;
  updatedAt: string;
  metadata: Record<string, unknown>;
}
```

## Data Rules

1. Structured state belongs in Postgres.
2. Raw or large source artifacts belong in object storage.
3. Semantic indexes supplement structured retrieval and never become the sole system of record.
4. Every material state change emits an immutable event.
5. Every automated decision records the rule, tool, model, prompt version, inputs, output, cost, and confidence.
6. Domain variation belongs in cartridges or configuration.
7. Private data cannot enter the shared graph without explicit authority.

## Failure Rules

The implementation must fail closed on permission uncertainty, fail visibly on source conflicts, and escalate when confidence or stakes exceed configured thresholds. Retries must be idempotent. Partial completion must be recorded without implying success.

## Acceptance Criteria

- typed contract exists,
- database migration exists,
- RLS or permission policy exists,
- API contract exists,
- event coverage exists,
- audit record exists,
- unit and integration tests exist,
- failure fixture exists,
- cost and latency are observable,
- handoff and current-state documentation are updated.


# 15. Source trust


## Purpose

This section defines the source trust requirements for Connector Registry and Acquisition Framework. The implementation must expose explicit contracts, avoid hidden behavior, preserve provenance and tenancy, and remain portable across domains and model providers.

## Required Design

The subsystem must define:

- canonical owner and repository location,
- schemas and typed interfaces,
- lifecycle states and transitions,
- events emitted and consumed,
- permissions and visibility,
- source and provenance behavior,
- deterministic and model-assisted execution boundaries,
- failure, retry, timeout, and recovery behavior,
- observability and cost accounting,
- migrations and backward compatibility,
- regression and evaluation coverage.

## Reference Contract

```typescript
export interface SourcetrustContract {
  id: string;
  version: string;
  tenantId?: string;
  status: "draft" | "active" | "suspended" | "retired";
  sourceRefs: string[];
  confidence?: number;
  createdAt: string;
  updatedAt: string;
  metadata: Record<string, unknown>;
}
```

## Data Rules

1. Structured state belongs in Postgres.
2. Raw or large source artifacts belong in object storage.
3. Semantic indexes supplement structured retrieval and never become the sole system of record.
4. Every material state change emits an immutable event.
5. Every automated decision records the rule, tool, model, prompt version, inputs, output, cost, and confidence.
6. Domain variation belongs in cartridges or configuration.
7. Private data cannot enter the shared graph without explicit authority.

## Failure Rules

The implementation must fail closed on permission uncertainty, fail visibly on source conflicts, and escalate when confidence or stakes exceed configured thresholds. Retries must be idempotent. Partial completion must be recorded without implying success.

## Acceptance Criteria

- typed contract exists,
- database migration exists,
- RLS or permission policy exists,
- API contract exists,
- event coverage exists,
- audit record exists,
- unit and integration tests exist,
- failure fixture exists,
- cost and latency are observable,
- handoff and current-state documentation are updated.


# 16. Discovery R&D


## Purpose

This section defines the discovery r&d requirements for Connector Registry and Acquisition Framework. The implementation must expose explicit contracts, avoid hidden behavior, preserve provenance and tenancy, and remain portable across domains and model providers.

## Required Design

The subsystem must define:

- canonical owner and repository location,
- schemas and typed interfaces,
- lifecycle states and transitions,
- events emitted and consumed,
- permissions and visibility,
- source and provenance behavior,
- deterministic and model-assisted execution boundaries,
- failure, retry, timeout, and recovery behavior,
- observability and cost accounting,
- migrations and backward compatibility,
- regression and evaluation coverage.

## Reference Contract

```typescript
export interface DiscoveryRDContract {
  id: string;
  version: string;
  tenantId?: string;
  status: "draft" | "active" | "suspended" | "retired";
  sourceRefs: string[];
  confidence?: number;
  createdAt: string;
  updatedAt: string;
  metadata: Record<string, unknown>;
}
```

## Data Rules

1. Structured state belongs in Postgres.
2. Raw or large source artifacts belong in object storage.
3. Semantic indexes supplement structured retrieval and never become the sole system of record.
4. Every material state change emits an immutable event.
5. Every automated decision records the rule, tool, model, prompt version, inputs, output, cost, and confidence.
6. Domain variation belongs in cartridges or configuration.
7. Private data cannot enter the shared graph without explicit authority.

## Failure Rules

The implementation must fail closed on permission uncertainty, fail visibly on source conflicts, and escalate when confidence or stakes exceed configured thresholds. Retries must be idempotent. Partial completion must be recorded without implying success.

## Acceptance Criteria

- typed contract exists,
- database migration exists,
- RLS or permission policy exists,
- API contract exists,
- event coverage exists,
- audit record exists,
- unit and integration tests exist,
- failure fixture exists,
- cost and latency are observable,
- handoff and current-state documentation are updated.


# 17. Connector SDK contracts


## Purpose

This section defines the connector sdk contracts requirements for Connector Registry and Acquisition Framework. The implementation must expose explicit contracts, avoid hidden behavior, preserve provenance and tenancy, and remain portable across domains and model providers.

## Required Design

The subsystem must define:

- canonical owner and repository location,
- schemas and typed interfaces,
- lifecycle states and transitions,
- events emitted and consumed,
- permissions and visibility,
- source and provenance behavior,
- deterministic and model-assisted execution boundaries,
- failure, retry, timeout, and recovery behavior,
- observability and cost accounting,
- migrations and backward compatibility,
- regression and evaluation coverage.

## Reference Contract

```typescript
export interface ConnectorSDKcontractsContract {
  id: string;
  version: string;
  tenantId?: string;
  status: "draft" | "active" | "suspended" | "retired";
  sourceRefs: string[];
  confidence?: number;
  createdAt: string;
  updatedAt: string;
  metadata: Record<string, unknown>;
}
```

## Data Rules

1. Structured state belongs in Postgres.
2. Raw or large source artifacts belong in object storage.
3. Semantic indexes supplement structured retrieval and never become the sole system of record.
4. Every material state change emits an immutable event.
5. Every automated decision records the rule, tool, model, prompt version, inputs, output, cost, and confidence.
6. Domain variation belongs in cartridges or configuration.
7. Private data cannot enter the shared graph without explicit authority.

## Failure Rules

The implementation must fail closed on permission uncertainty, fail visibly on source conflicts, and escalate when confidence or stakes exceed configured thresholds. Retries must be idempotent. Partial completion must be recorded without implying success.

## Acceptance Criteria

- typed contract exists,
- database migration exists,
- RLS or permission policy exists,
- API contract exists,
- event coverage exists,
- audit record exists,
- unit and integration tests exist,
- failure fixture exists,
- cost and latency are observable,
- handoff and current-state documentation are updated.


# 18. Coverage matrix


## Purpose

This section defines the coverage matrix requirements for Connector Registry and Acquisition Framework. The implementation must expose explicit contracts, avoid hidden behavior, preserve provenance and tenancy, and remain portable across domains and model providers.

## Required Design

The subsystem must define:

- canonical owner and repository location,
- schemas and typed interfaces,
- lifecycle states and transitions,
- events emitted and consumed,
- permissions and visibility,
- source and provenance behavior,
- deterministic and model-assisted execution boundaries,
- failure, retry, timeout, and recovery behavior,
- observability and cost accounting,
- migrations and backward compatibility,
- regression and evaluation coverage.

## Reference Contract

```typescript
export interface CoveragematrixContract {
  id: string;
  version: string;
  tenantId?: string;
  status: "draft" | "active" | "suspended" | "retired";
  sourceRefs: string[];
  confidence?: number;
  createdAt: string;
  updatedAt: string;
  metadata: Record<string, unknown>;
}
```

## Data Rules

1. Structured state belongs in Postgres.
2. Raw or large source artifacts belong in object storage.
3. Semantic indexes supplement structured retrieval and never become the sole system of record.
4. Every material state change emits an immutable event.
5. Every automated decision records the rule, tool, model, prompt version, inputs, output, cost, and confidence.
6. Domain variation belongs in cartridges or configuration.
7. Private data cannot enter the shared graph without explicit authority.

## Failure Rules

The implementation must fail closed on permission uncertainty, fail visibly on source conflicts, and escalate when confidence or stakes exceed configured thresholds. Retries must be idempotent. Partial completion must be recorded without implying success.

## Acceptance Criteria

- typed contract exists,
- database migration exists,
- RLS or permission policy exists,
- API contract exists,
- event coverage exists,
- audit record exists,
- unit and integration tests exist,
- failure fixture exists,
- cost and latency are observable,
- handoff and current-state documentation are updated.


# 19. Initial 100 connectors


## Purpose

This section defines the initial 100 connectors requirements for Connector Registry and Acquisition Framework. The implementation must expose explicit contracts, avoid hidden behavior, preserve provenance and tenancy, and remain portable across domains and model providers.

## Required Design

The subsystem must define:

- canonical owner and repository location,
- schemas and typed interfaces,
- lifecycle states and transitions,
- events emitted and consumed,
- permissions and visibility,
- source and provenance behavior,
- deterministic and model-assisted execution boundaries,
- failure, retry, timeout, and recovery behavior,
- observability and cost accounting,
- migrations and backward compatibility,
- regression and evaluation coverage.

## Reference Contract

```typescript
export interface Initial100connectorsContract {
  id: string;
  version: string;
  tenantId?: string;
  status: "draft" | "active" | "suspended" | "retired";
  sourceRefs: string[];
  confidence?: number;
  createdAt: string;
  updatedAt: string;
  metadata: Record<string, unknown>;
}
```

## Data Rules

1. Structured state belongs in Postgres.
2. Raw or large source artifacts belong in object storage.
3. Semantic indexes supplement structured retrieval and never become the sole system of record.
4. Every material state change emits an immutable event.
5. Every automated decision records the rule, tool, model, prompt version, inputs, output, cost, and confidence.
6. Domain variation belongs in cartridges or configuration.
7. Private data cannot enter the shared graph without explicit authority.

## Failure Rules

The implementation must fail closed on permission uncertainty, fail visibly on source conflicts, and escalate when confidence or stakes exceed configured thresholds. Retries must be idempotent. Partial completion must be recorded without implying success.

## Acceptance Criteria

- typed contract exists,
- database migration exists,
- RLS or permission policy exists,
- API contract exists,
- event coverage exists,
- audit record exists,
- unit and integration tests exist,
- failure fixture exists,
- cost and latency are observable,
- handoff and current-state documentation are updated.


# 20. Acceptance


## Purpose

This section defines the acceptance requirements for Connector Registry and Acquisition Framework. The implementation must expose explicit contracts, avoid hidden behavior, preserve provenance and tenancy, and remain portable across domains and model providers.

## Required Design

The subsystem must define:

- canonical owner and repository location,
- schemas and typed interfaces,
- lifecycle states and transitions,
- events emitted and consumed,
- permissions and visibility,
- source and provenance behavior,
- deterministic and model-assisted execution boundaries,
- failure, retry, timeout, and recovery behavior,
- observability and cost accounting,
- migrations and backward compatibility,
- regression and evaluation coverage.

## Reference Contract

```typescript
export interface AcceptanceContract {
  id: string;
  version: string;
  tenantId?: string;
  status: "draft" | "active" | "suspended" | "retired";
  sourceRefs: string[];
  confidence?: number;
  createdAt: string;
  updatedAt: string;
  metadata: Record<string, unknown>;
}
```

## Data Rules

1. Structured state belongs in Postgres.
2. Raw or large source artifacts belong in object storage.
3. Semantic indexes supplement structured retrieval and never become the sole system of record.
4. Every material state change emits an immutable event.
5. Every automated decision records the rule, tool, model, prompt version, inputs, output, cost, and confidence.
6. Domain variation belongs in cartridges or configuration.
7. Private data cannot enter the shared graph without explicit authority.

## Failure Rules

The implementation must fail closed on permission uncertainty, fail visibly on source conflicts, and escalate when confidence or stakes exceed configured thresholds. Retries must be idempotent. Partial completion must be recorded without implying success.

## Acceptance Criteria

- typed contract exists,
- database migration exists,
- RLS or permission policy exists,
- API contract exists,
- event coverage exists,
- audit record exists,
- unit and integration tests exist,
- failure fixture exists,
- cost and latency are observable,
- handoff and current-state documentation are updated.


# Connector Output Contract

Every connector emits:

`source_artifact`, `observation[]`, `entity_candidate[]`, `relationship_candidate[]`, `change_event[]`, `quality_report`.

Connectors normalize. They do not decide commercial fit, eligibility, or recommendations.

## Initial Connector Families

NCUA, FFIEC, CFPB, SEC EDGAR, Federal Register, state regulators, credit-union sites, company sites, CUSO sources, core marketplaces, vendor documentation, trade publications, economic sources, conferences, podcasts, job sources, GitHub, patents, procurement systems, partner uploads.


# Implementation Sequence

1. Inventory existing repository code and map reusable primitives.
2. Write or update ADRs before irreversible changes.
3. Add schemas and migrations.
4. Add typed domain contracts.
5. Implement services behind interfaces.
6. Add RLS and permission tests.
7. Add deterministic fixtures.
8. Add model or connector evaluations where relevant.
9. Add observability and usage accounting.
10. Update `CURRENT_STATE.md`, `ACTIVE_BUILD.md`, `HANDOFF.md`, and the subsystem context pack.

# Claude Build Instruction

Do not read the entire documentation library. Read the Constitution, current state, active build, this volume's context pack, and only the referenced registry files. Implement one bounded milestone at a time. Never invent missing permanent architecture silently; create an ADR or record an explicit open decision.
