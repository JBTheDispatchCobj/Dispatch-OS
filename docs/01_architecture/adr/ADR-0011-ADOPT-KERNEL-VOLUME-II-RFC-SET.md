# ADR-0011 — Adopt Kernel Volume II (RFC-2000…2015) as the kernel specification of record

## Status
Accepted — 2026-07-20.

## Context
The Specification Program's Volume 2 (Kernel) was previously a templated stub. A
real, authored **Kernel Volume II** was supplied as a set of 16 RFCs — RFC-2000
(Canonical Vocabulary & Architectural Lexicon), RFC-2001 (Kernel Philosophy &
Architectural Boundaries), and RFC-2002…RFC-2015 covering Identity & Tenancy,
Object Registry, Event Bus, Workflow Engine, Truth Service, Audit Service, Cost
Ledger, Registry Service, Cartridge Runtime, Connector Runtime, Memory Service,
Model Router & Agent Orchestration, Kernel API & Service Contracts, and Kernel
Acceptance/QA/Operational Readiness.

A full reconciliation (four agents, grouped by subsystem) compared all 16 RFCs
against the committed build (`core/**`, migrations `0001`–`0015`, ADR-0004..0009,
architecture docs). Framing: because this Volume II is **authoritative adopted
intent** (not a stub), an RFC asking for more than the build is an **EXPANSION**
(the kernel must grow), not an erratum; a **CONFLICT** is reserved for an RFC that
contradicts an already-decided live choice such that a human must adjudicate.

## Decision

### 1. Adopt the RFC set as Volume II — kernel spec of record
RFC-2000…2015 **supersede** the filed `VOLUME_2_DISPATCH_KERNEL_SPEC.md` stub and
become the kernel specification of record (Specification Program Volume II). The
RFCs are stored under `docs/00_governance/constitution/volumes/kernel/`; the old
stub is replaced by a pointer to them. Authority order is unchanged: Constitution
(Vol I) → ADRs → subsystem volumes (incl. this RFC set) → committed code.

### 2. The build is strongly aligned on the spine; the rest is EXPANSION
Already built to spec: the truth assertion family + provenance envelope (RFC-2006),
relationships as first-class (RFC-2001 Rule 4), intelligence objects, config-as-data
(RFC-2001 Rule 10 / RFC-2009), the connector + discovery registry (RFC-2011), and
the cartridge-as-configuration model (RFC-2010). Reconciliation surfaced **no
irreconcilable conflicts** — the divergences are either vocabulary (resolved by
§4) or two adjudicated decisions (§5) plus a large additive backlog (§6).

### 3. Two confirmed architectural decisions
- **Unified event store + event bus (RFC-2004).** The kernel adopts a single
  append-only `events` spine plus `event_streams` / `event_subscriptions` /
  `event_offsets` / `dead_letter_events` / `event_versions`, with replay,
  correlation IDs, and a dead-letter queue. The current **federated** per-domain
  event tables (`work_item_events`, `relationship_events`, `OperatingEvent`,
  `profile_signals`) become an interim state, migrated in as typed producers /
  read projections. **Audit (RFC-2007)** is a hash-chained projection *of* this
  spine, not a second write path.
- **Cost + Usage Ledger (RFC-2008).** The kernel builds a first-class ledger
  (`usage_ledger`, `cost_ledger`, `pricing_models`, `resource_types`,
  `budget_policies`, `resource_usage`, `provider_costs`, `workflow_costs`) with
  usage / cost / price kept independent and enforceable budgets. Current per-run
  cost fields (`AgentRun.cost_estimate`, `connector_runs.cost_estimate`) become
  ledger inputs. `currency` is added on the ledger (single platform currency
  default) — additive.

### 4. Vocabulary reconciliation — keep canonical live models, map RFC terms as aliases
Applying the ADR-0007/0008 precedent (map external terms onto the canonical model;
do not fork):
- **"Fact"** (RFC-2000/2003/2006) → the verified `TruthTier` band
  (`institution_verified_fact` / `public_fact` …) reached via a `Verification`;
  "fact versioning" → the existing `superseded_by_id` chain. **No `facts` table**
  unless a future ADR proves a distinct queryable Fact object is required.
- **"Tenant"** (RFC-2000/2002) → the committed `organization_id` + **nullable**
  `workspace_id` + `plane` model (ADR-0004). Global tenant ≡ `plane =
  shared_market` (null workspace). Department / Project / Individual land
  additively as workspace sub-scopes. No competing `tenants` table.
- **RFC-2002 visibility** (Private/Internal/Shared/Public/Restricted) and RFC "privacy
  classes" → the committed `Visibility` enum
  (public/network/tenant_private/relationship_private/personal); "Restricted"
  becomes a policy flag, not a visibility value.
- **Event-naming convention** (RFC-2004 PascalCase verb-first, e.g. `ClaimVerified`)
  is adopted as the canonical event-type vocabulary on the new spine.

### 5. Two adjudicated decisions (human calls)
- **Portable cross-org identity — ADOPT RFC-2002 (overrides the live stub).** The
  live `user_profiles.org_id NOT NULL` (one person = one org) is replaced by the
  RFC-2002 model: **one identity, many memberships**. A `Membership` connects an
  `Identity` to an `Organization` and carries: a **specific title** (e.g. CEO), a
  **function category** (e.g. lending team), and an **org-defined, open role
  structure** — role taxonomy is per-organization and evolves (some orgs have a
  CIO, some don't), NOT a fixed global role enum. Authority (permissions) is a
  separate layer from role/title (RFC-2002: "Roles remain portable. Permissions do
  not."). Migration is **additive-forward**: add `identities` + `memberships` (+
  `roles`/`permissions`/`delegations`/`sessions`), and demote `user_profiles.org_id`
  to a membership (retain `user_profiles` as a view during transition). Sequenced
  in the backlog under Identity & Tenancy.
- **Routing ladder — ADOPT RFC-2013's 8-rung as canonical.** RFC-2013 (Rules → SQL
  → Registered Tool → Connector → Local/Small Open → Shared/Large Open → Frontier →
  Human) is finer than the Constitution's Rule Eight (7 rungs) and the
  `MODEL_HARNESS_ARCHITECTURE.md` doc (5 rungs). RFC-2013 becomes canonical;
  `MODEL_HARNESS_ARCHITECTURE.md` is amended to match, and **Constitution Art.
  (Rule Eight) is logged as a V1.1 erratum / amendment** (per Art. 37/38/50) — the
  refined ladder does not change the "cheapest sufficient intelligence" principle.

### 6. Kernel build backlog (EXPANSIONS), sequenced
Folded into `ACTIVE_BUILD.md`. Highest-value first:
1. **Identity & Tenancy (RFC-2002)** — `identities`/`memberships`(title+function+
   org-open-role)/`roles`/`permissions`/`delegations`/`sessions`/`service_accounts`/
   `api_keys`; RBAC+ABAC permission engine; **RLS** (already #2). HIGH.
2. **Unified event spine + correlation IDs (RFC-2004)**, then bus (streams/subs/
   offsets), dead-letter queue, replay; emit truth/workflow/identity events. HIGH.
3. **Cost + Usage Ledger (RFC-2008)** — the 8 tables + write path + budget engine. HIGH.
4. **Object Registry runtime service (RFC-2003)** — per-instance object identity,
   entity resolution/merge (closes the ADR-0009 `entities`/entity-resolution gap),
   object versioning/aliases. HIGH.
5. **`contracts/` layer + kernel API surface + request envelope (RFC-2001/2014)** —
   formal per-service contracts (incl. correlation/idempotency); unblocks the rest. HIGH.
6. **Audit projection (RFC-2007)** — hash-chained `audit_records` derived from the
   event spine; config/policy-change audit. MED.
7. **Memory Service (RFC-2012)** — greenfield kernel service (records/versions/
   embeddings/retention), reusing the `plane`/`visibility` isolation model. MED.
8. **Model / Prompt / Policy / Evaluation registries (RFC-2009/2013)** — kernel owns
   the *registries + contracts*; the **router executor + context assembler + model
   serving path are Volume IV (Agent Harness)**, filed there to avoid double-counting.
9. **Cartridge lifecycle + isolation enforcement (RFC-2010)** and **connector
   scheduler + retry + credential vault + health (RFC-2011)**. MED.
10. **Acceptance/QA/ops harness (RFC-2015)** — test suites (unit/integration/
    migration/permission/replay/failure/perf/regression) + evaluation fixtures. HIGH
    for build discipline, phaseable.

### 7. Deferred adjudication (decide at build time, not now)
- **Workflow lifecycle canonicalization.** RFC-2005 (Draft→Ready→Running→Waiting→
  Blocked→Paused→Completed→Cancelled→Archived) and RFC-2001 (…Executing→…Approved…)
  **disagree with each other**, and neither maps 1:1 to committed `WorkItemStatus`.
  Also open: whether a `workflow_instances` table wraps `WorkItem` or `WorkItem`
  *is* the instance. Decide when the durable workflow engine (RFC-2005) is built;
  recorded as an open item in the backlog.

## Consequences
- Volume II is now a real, adopted kernel spec; `constitution/README.md` moves Vol 2
  to reconciled (ADR-0011); `CURRENT_STATE.md` notes the kernel spec-of-record and
  the identity/event/ledger direction.
- Identity & Tenancy (with RLS) is the top kernel build item and also the standing
  security risk; the unified event spine + cost/usage ledger are the next kernel
  migrations after the current foundation.
- The Constitution takes a Rule Eight amendment (routing ladder); logged as a V1.1
  erratum alongside the ADR-0008 errata.
- No existing `core/` contract or applied migration (`0011`–`0015`) changes as a
  result of this ADR; all kernel work is additive-forward.
