# Volume 10: Cartridge SDK Specification

Status: Implementation Specification
Owner: Auric Works
Constitutional Authority: Dispatch Constitution V1.0
Audience: Claude coding agents, human engineers, architects, reviewers
Implementation Target: Existing Dispatch OS repository with Supabase/Postgres and cartridge-first architecture

This volume is normative. It defines durable subsystem contracts rather than interface styling. UI work is intentionally downstream. All implementations must preserve provenance, tenancy, audit, cost visibility, model replaceability, and cartridge isolation.


# Executive Mandate


Cartridge SDK is the authoritative implementation specification for this subsystem. It translates the Dispatch Constitution into buildable contracts for the existing repository. The subsystem must remain compatible with the shared kernel, bounded context-pack workflow, Supabase/Postgres persistence, and future open-model plus frontier-model routing.


# 1. SDK mandate


## Purpose

This section defines the sdk mandate requirements for Cartridge SDK. The implementation must expose explicit contracts, avoid hidden behavior, preserve provenance and tenancy, and remain portable across domains and model providers.

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
export interface SDKmandateContract {
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


# 2. Cartridge manifest


## Purpose

This section defines the cartridge manifest requirements for Cartridge SDK. The implementation must expose explicit contracts, avoid hidden behavior, preserve provenance and tenancy, and remain portable across domains and model providers.

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
export interface CartridgemanifestContract {
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


# 3. Dependency model


## Purpose

This section defines the dependency model requirements for Cartridge SDK. The implementation must expose explicit contracts, avoid hidden behavior, preserve provenance and tenancy, and remain portable across domains and model providers.

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
export interface DependencymodelContract {
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


# 4. Object extensions


## Purpose

This section defines the object extensions requirements for Cartridge SDK. The implementation must expose explicit contracts, avoid hidden behavior, preserve provenance and tenancy, and remain portable across domains and model providers.

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
export interface ObjectextensionsContract {
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


# 5. Source bindings


## Purpose

This section defines the source bindings requirements for Cartridge SDK. The implementation must expose explicit contracts, avoid hidden behavior, preserve provenance and tenancy, and remain portable across domains and model providers.

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
export interface SourcebindingsContract {
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


# 6. Rules


## Purpose

This section defines the rules requirements for Cartridge SDK. The implementation must expose explicit contracts, avoid hidden behavior, preserve provenance and tenancy, and remain portable across domains and model providers.

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
export interface RulesContract {
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


# 7. Prompt packages


## Purpose

This section defines the prompt packages requirements for Cartridge SDK. The implementation must expose explicit contracts, avoid hidden behavior, preserve provenance and tenancy, and remain portable across domains and model providers.

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
export interface PromptpackagesContract {
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


# 8. Workflow packages


## Purpose

This section defines the workflow packages requirements for Cartridge SDK. The implementation must expose explicit contracts, avoid hidden behavior, preserve provenance and tenancy, and remain portable across domains and model providers.

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
export interface WorkflowpackagesContract {
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


# 9. Permissions


## Purpose

This section defines the permissions requirements for Cartridge SDK. The implementation must expose explicit contracts, avoid hidden behavior, preserve provenance and tenancy, and remain portable across domains and model providers.

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
export interface PermissionsContract {
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


# 10. Renderers


## Purpose

This section defines the renderers requirements for Cartridge SDK. The implementation must expose explicit contracts, avoid hidden behavior, preserve provenance and tenancy, and remain portable across domains and model providers.

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
export interface RenderersContract {
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


# 11. Metrics


## Purpose

This section defines the metrics requirements for Cartridge SDK. The implementation must expose explicit contracts, avoid hidden behavior, preserve provenance and tenancy, and remain portable across domains and model providers.

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
export interface MetricsContract {
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


# 12. Cost model


## Purpose

This section defines the cost model requirements for Cartridge SDK. The implementation must expose explicit contracts, avoid hidden behavior, preserve provenance and tenancy, and remain portable across domains and model providers.

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
export interface CostmodelContract {
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


# 13. Evaluation fixtures


## Purpose

This section defines the evaluation fixtures requirements for Cartridge SDK. The implementation must expose explicit contracts, avoid hidden behavior, preserve provenance and tenancy, and remain portable across domains and model providers.

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
export interface EvaluationfixturesContract {
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


# 14. Versioning


## Purpose

This section defines the versioning requirements for Cartridge SDK. The implementation must expose explicit contracts, avoid hidden behavior, preserve provenance and tenancy, and remain portable across domains and model providers.

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
export interface VersioningContract {
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


# 15. Installation


## Purpose

This section defines the installation requirements for Cartridge SDK. The implementation must expose explicit contracts, avoid hidden behavior, preserve provenance and tenancy, and remain portable across domains and model providers.

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
export interface InstallationContract {
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


# 16. Upgrade and rollback


## Purpose

This section defines the upgrade and rollback requirements for Cartridge SDK. The implementation must expose explicit contracts, avoid hidden behavior, preserve provenance and tenancy, and remain portable across domains and model providers.

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
export interface UpgradeandrollbackContract {
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


# 17. Marketplace behavior


## Purpose

This section defines the marketplace behavior requirements for Cartridge SDK. The implementation must expose explicit contracts, avoid hidden behavior, preserve provenance and tenancy, and remain portable across domains and model providers.

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
export interface MarketplacebehaviorContract {
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


# 18. Developer workflow


## Purpose

This section defines the developer workflow requirements for Cartridge SDK. The implementation must expose explicit contracts, avoid hidden behavior, preserve provenance and tenancy, and remain portable across domains and model providers.

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
export interface DeveloperworkflowContract {
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


# 19. Reference cartridge


## Purpose

This section defines the reference cartridge requirements for Cartridge SDK. The implementation must expose explicit contracts, avoid hidden behavior, preserve provenance and tenancy, and remain portable across domains and model providers.

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
export interface ReferencecartridgeContract {
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

This section defines the acceptance requirements for Cartridge SDK. The implementation must expose explicit contracts, avoid hidden behavior, preserve provenance and tenancy, and remain portable across domains and model providers.

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


# Cartridge Package Shape

```text
cartridge/
  manifest.yaml
  objects/
  rules/
  prompts/
  workflows/
  permissions/
  renderers/
  metrics/
  evaluations/
  migrations/
  docs/
```

A cartridge must be installable, versioned, testable, removable, and unable to bypass kernel controls.


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
