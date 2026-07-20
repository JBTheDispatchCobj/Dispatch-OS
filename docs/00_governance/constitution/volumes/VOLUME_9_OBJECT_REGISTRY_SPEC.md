# Volume 9: Object Registry Specification

Status: Implementation Specification
Owner: Auric Works
Constitutional Authority: Dispatch Constitution V1.0
Audience: Claude coding agents, human engineers, architects, reviewers
Implementation Target: Existing Dispatch OS repository with Supabase/Postgres and cartridge-first architecture

This volume is normative. It defines durable subsystem contracts rather than interface styling. UI work is intentionally downstream. All implementations must preserve provenance, tenancy, audit, cost visibility, model replaceability, and cartridge isolation.


# Executive Mandate


Object Registry is the authoritative implementation specification for this subsystem. It translates the Dispatch Constitution into buildable contracts for the existing repository. The subsystem must remain compatible with the shared kernel, bounded context-pack workflow, Supabase/Postgres persistence, and future open-model plus frontier-model routing.


# 1. Registry mandate


## Purpose

This section defines the registry mandate requirements for Object Registry. The implementation must expose explicit contracts, avoid hidden behavior, preserve provenance and tenancy, and remain portable across domains and model providers.

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
export interface RegistrymandateContract {
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


# 2. Object naming


## Purpose

This section defines the object naming requirements for Object Registry. The implementation must expose explicit contracts, avoid hidden behavior, preserve provenance and tenancy, and remain portable across domains and model providers.

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
export interface ObjectnamingContract {
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


# 3. Object identity


## Purpose

This section defines the object identity requirements for Object Registry. The implementation must expose explicit contracts, avoid hidden behavior, preserve provenance and tenancy, and remain portable across domains and model providers.

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
export interface ObjectidentityContract {
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


# 4. Core object contract


## Purpose

This section defines the core object contract requirements for Object Registry. The implementation must expose explicit contracts, avoid hidden behavior, preserve provenance and tenancy, and remain portable across domains and model providers.

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
export interface CoreobjectcontractContract {
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


# 5. Institution objects


## Purpose

This section defines the institution objects requirements for Object Registry. The implementation must expose explicit contracts, avoid hidden behavior, preserve provenance and tenancy, and remain portable across domains and model providers.

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
export interface InstitutionobjectsContract {
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


# 6. Person and role objects


## Purpose

This section defines the person and role objects requirements for Object Registry. The implementation must expose explicit contracts, avoid hidden behavior, preserve provenance and tenancy, and remain portable across domains and model providers.

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
export interface PersonandroleobjectsContract {
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


# 7. Company and startup objects


## Purpose

This section defines the company and startup objects requirements for Object Registry. The implementation must expose explicit contracts, avoid hidden behavior, preserve provenance and tenancy, and remain portable across domains and model providers.

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
export interface CompanyandstartupobjectsContract {
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


# 8. Product and vendor objects


## Purpose

This section defines the product and vendor objects requirements for Object Registry. The implementation must expose explicit contracts, avoid hidden behavior, preserve provenance and tenancy, and remain portable across domains and model providers.

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
export interface ProductandvendorobjectsContract {
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


# 9. Regulatory objects


## Purpose

This section defines the regulatory objects requirements for Object Registry. The implementation must expose explicit contracts, avoid hidden behavior, preserve provenance and tenancy, and remain portable across domains and model providers.

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
export interface RegulatoryobjectsContract {
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


# 10. Financial objects


## Purpose

This section defines the financial objects requirements for Object Registry. The implementation must expose explicit contracts, avoid hidden behavior, preserve provenance and tenancy, and remain portable across domains and model providers.

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
export interface FinancialobjectsContract {
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


# 11. Relationship objects


## Purpose

This section defines the relationship objects requirements for Object Registry. The implementation must expose explicit contracts, avoid hidden behavior, preserve provenance and tenancy, and remain portable across domains and model providers.

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
export interface RelationshipobjectsContract {
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


# 12. Publication objects


## Purpose

This section defines the publication objects requirements for Object Registry. The implementation must expose explicit contracts, avoid hidden behavior, preserve provenance and tenancy, and remain portable across domains and model providers.

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
export interface PublicationobjectsContract {
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


# 13. Workflow objects


## Purpose

This section defines the workflow objects requirements for Object Registry. The implementation must expose explicit contracts, avoid hidden behavior, preserve provenance and tenancy, and remain portable across domains and model providers.

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
export interface WorkflowobjectsContract {
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


# 14. Evidence objects


## Purpose

This section defines the evidence objects requirements for Object Registry. The implementation must expose explicit contracts, avoid hidden behavior, preserve provenance and tenancy, and remain portable across domains and model providers.

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
export interface EvidenceobjectsContract {
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


# 15. Outcome objects


## Purpose

This section defines the outcome objects requirements for Object Registry. The implementation must expose explicit contracts, avoid hidden behavior, preserve provenance and tenancy, and remain portable across domains and model providers.

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
export interface OutcomeobjectsContract {
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


# 16. Lifecycle and versioning


## Purpose

This section defines the lifecycle and versioning requirements for Object Registry. The implementation must expose explicit contracts, avoid hidden behavior, preserve provenance and tenancy, and remain portable across domains and model providers.

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
export interface LifecycleandversioningContract {
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


# 17. Schema registry


## Purpose

This section defines the schema registry requirements for Object Registry. The implementation must expose explicit contracts, avoid hidden behavior, preserve provenance and tenancy, and remain portable across domains and model providers.

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
export interface SchemaregistryContract {
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


# 18. Relationship map


## Purpose

This section defines the relationship map requirements for Object Registry. The implementation must expose explicit contracts, avoid hidden behavior, preserve provenance and tenancy, and remain portable across domains and model providers.

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
export interface RelationshipmapContract {
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


# 19. Governance


## Purpose

This section defines the governance requirements for Object Registry. The implementation must expose explicit contracts, avoid hidden behavior, preserve provenance and tenancy, and remain portable across domains and model providers.

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
export interface GovernanceContract {
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

This section defines the acceptance requirements for Object Registry. The implementation must expose explicit contracts, avoid hidden behavior, preserve provenance and tenancy, and remain portable across domains and model providers.

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


# Canonical Object Families

Institution, Organization, Person, Role, Startup, Vendor, Product, CUSO, Fund, SPV, Investment, Funding Round, Regulation, Policy, Filing, Call Report, Metric, Article, Intelligence Object, Relationship, Pilot, Integration, Partnership, Meeting, Decision, Workflow, Work Item, Evidence, Outcome, Connector, Cartridge, Prompt, Model Run.


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
