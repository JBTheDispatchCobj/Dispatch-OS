# ADR-0013 — Adopt Volumes VIII–X (Execution Engine, Connector Registry, Object Registry); object-registry identity model; spec-program numbering

## Status
Accepted — 2026-07-20.

## Context
Authored back-half volumes were supplied and reconciled (subagent per volume). The
files were mislabeled on disk (stale "Volume Overview" stubs disagreed with their
bodies); the RFC-numbered **bodies** are authoritative and self-consistent with
Volume X's authority chain. True authored numbering:
- **Volume VIII — Execution Engine** (RFC-8000..8015) — a NEW subsystem; no committed stub.
- **Volume IX — Connector Registry** (RFC-9000..9015) — real body (committed stub was Vol 8).
- **Volume X — Object Registry** (RFC-10000..10015) — real body (committed stub was Vol 9).

Filed under `volumes/{execution_engine,connector_registry,object_registry}/`. Framing:
authored volume = authoritative intent; asks-more = EXPANSION; CONFLICT only vs a
DECIDED live choice.

## Decision

### 1. Spec-program numbering reconcile (closes the roadmap mismatch)
Canonical numbering going forward: **VIII = Execution Engine, IX = Connector
Registry, X = Object Registry.** Consequences:
- Connector Registry moves committed-8 → **IX**; Object Registry moves committed-9 → **X**.
- **Execution Engine (VIII) is net-new** — it had no committed stub.
- The committed "Cartridge SDK" (old Vol 10) has **no authored equivalent**; it folds
  into the kernel **Cartridge Runtime (RFC-2010)**. Volume X's "Object SDK" (RFC-10014)
  is NOT the Cartridge SDK.
- The stale `_RFC-8000/9000` overview stubs are non-normative; the RFC-numbered bodies
  govern. (Prior ADR-0009/0010 reconciled the *committed stubs* at 8/9/10; those
  findings still hold for the connector + object-registry material, now under IX/X.)

### 2. Object Registry (Vol X) — canonical identity index; storage-dynamic (Bryan's call)
RFC-10002 proposes a single universal `objects`/`object_extensions` store; ADR-0004
chose distinct plane-aware tables per type and rejected a single objects table.
**Decision (Bryan): the Object Registry is the canonical per-instance IDENTITY
AUTHORITY — a registry index (canonical id + external ids/aliases + object_class +
classification + capabilities + lifecycle + `plane`/`visibility` + pointers to
state/version/audit/relationships) — layered OVER the existing typed plane-aware
tables, which keep holding state (ADR-0004 preserved).** But the storage backend is
**DYNAMIC and open to more than one model**: per object family, the registry may point
at a dedicated typed table OR a generic `objects`/`object_extensions` store where that
fits better — chosen per `object_class`, governed by the registry. Not a forced single
table; not a hard rejection of RFC-10002. This gives the identity authority ADR-0009
found missing while keeping the committed typed tables. **Add `plane` to the registry
index.** Other Vol X reconciliations:
- **Verticals stay `cartridge_entity`** (Hotel/Room/Institution/Executive are cartridge
  extensions via the extension payload/`context`), never core canonical types — hold to
  the committed `object_class = core_primitive | cartridge_entity` rule.
- **Trust stays on assertions (`TruthTier`) and sources (`trust_score`)**, NOT a scalar
  on object identity (avoid conflating fact tiers).
- **Entity resolution is ONE workstream**, not four: RFC-3002 (Canonical Entity Model,
  ADR-0012) is the model; kernel RFC-2003 is the service; Vol X RFC-10004 and the orphan
  IX-stub RFC-9008 are redundant restatements that defer to those. Do not multi-file.
- Vol X RFC-10003 (Object Registry) defers to the adopted kernel RFC-2003; RFC-2003
  remains the service contract of record.

### 3. Execution Engine (Vol VIII) — new coordination tier; file only the delta
Vol VIII sits ABOVE the Agent Harness ("the Planner decides, the Execution Engine acts,
the Harness performs"). It **consumes**, and must NOT redefine: the kernel durable state
machine (RFC-2005), the event spine (RFC-2004), the Harness node executor + retry/
checkpoint/circuit-breaker (RFC-4009/4012), and model/tool routing (RFC-2013/4005/4006).
Route its **Security (RFC-8012)** and constitutional **Policy hierarchy (RFC-8011)** to
the kernel, not Vol VIII (matches its own Non-Responsibilities). File as EXECUTION-ENGINE
(new) only the genuine delta:
- **`OperationalPlan`** — objective-level plan graph (Mission→Objective→…→Task→Action).
  **Renamed from RFC-8002's `ExecutionPlan`** to resolve the hard collision with Vol IV
  RFC-4004 `ExecutionPlan` (the intelligent-task DAG). An OperationalPlan "Agent Task"
  node compiles down to a Harness `ExecutionPlan`.
- Org-level **Execution Scheduler** (readiness-based, execution windows, resource
  allocation, queues) — genuinely greenfield.
- **Human-Agent Collaboration** runtime (collaboration models, responsibility matrix,
  handoffs, trust) — builds on Harness RFC-4011 escalation.
- **Compensation / rollback (saga)** — new; the retry/checkpoint half is Harness RFC-4012.
- Live **Execution Monitoring** (health, bottleneck, forecasting) — new.
- **Multi-party / committee Approval** + delegation — governance expansion of committed
  `Approval`.
- **Scorecards / benchmarking** — aggregation over committed `Metric`.
- **Automation governance** — over committed `AutomationKey`/`GenerationRule`, not a fork.

### 4. Resolve the ADR-0011 deferred workflow-lifecycle question
Vol VIII adds several more state machines (Plan / Instance / Node) rather than settling
the deferred RFC-2005-vs-RFC-2001-vs-`WorkItemStatus` question — but it supplies the
resolving frame: these are **different levels**. Adopt a **level-stratified lifecycle
registry** — a canonical, named lifecycle per level (OperationalPlan / WorkflowInstance /
Node / WorkItem), each mapped to the committed `WorkItemStatus` at the task level —
rather than one flat status set. Closes the ADR-0011 deferral.

### 5. Connector Registry (Vol IX)
Aligns with the live DKR (`ConnectorSpec`, 8-tier `SourceAuthority`, 8-stage
`DiscoveryStage`, `connector_runs`, seed CSVs). Runtime items (auth, acquisition,
scheduling, change detection, health, credentials, APIs) are the **kernel Connector
Runtime (RFC-2011)** — do not double-file. Vol IX adds the registry/manifest/trust/
discovery/**Connector SDK** layer. Expansions = the ADR-0009 connector gaps (typed
Connector Output Contract, parser contract, `change_event`, `quality_report`, failure
semantics, `connector_health`, coverage matrix, qualify ~93 placeholder connectors) +
Connector SDK.

## Consequences
- The entire Specification Program is reconciled/adopted with a coherent numbering.
- **No `core/` or applied-migration change.** All work additive-forward.
- The Object Registry identity index (with entity resolution) is now the top build
  bridge, unified with kernel RFC-2003 + RFC-3002 (ADR-0011/0012).
- Two build prerequisites recorded: rename+contain `OperationalPlan` vs Harness
  `ExecutionPlan`; the level-stratified lifecycle registry.
- Naming to fix in source docs: the mislabeled Vol 8/9 overview stubs; the Vol IV
  RFC-4009 "Execution Engine" name vs the Vol VIII volume name.
