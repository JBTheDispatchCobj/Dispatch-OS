# Dispatch Constitution V1.0

Status: Foundational Specification  
Owner: Auric Works  
Applies To: Dispatch OS, The Auric, all institution Terminals, all cartridges, all profiles, all intelligence objects, all connectors, all model routes, and all domain implementations.

Dispatch is the orchestration and intelligence kernel created by Auric Works. The Auric is the publication and attention layer. A named institutional Terminal is the product environment used by an institution and its people. Cartridges package domain, role, workflow, relationship, and capability logic. Profiles are living operational representations of people, institutions, companies, products, and relationships. Intelligence Objects are the atomic outputs of synthesis. The kernel must remain durable, model-agnostic, industry-agnostic, and auditable.


# 1. Purpose and Scope

The Constitution defines the permanent principles that govern Dispatch OS. It is not a feature backlog, interface specification, or implementation plan. It establishes the constraints under which every implementation decision must be made.

The Constitution exists to prevent architectural drift across code, documents, models, contributors, and future domains. It governs how information becomes knowledge, how knowledge becomes intelligence, how intelligence becomes action, and how action improves the network.

Every subsystem specification must derive from this Constitution. If a lower-level document conflicts with this document, this document controls unless an Architecture Decision Record explicitly amends the Constitution.


# 1. Purpose and Scope — Design Implications

- The concept must be represented through explicit schemas and contracts.
- The implementation must preserve source attribution, permissions, and audit.
- Domain-specific variation must remain in cartridges or configuration.
- Model outputs must remain subordinate to structured truth and workflow state.
- Failure, uncertainty, and conflict must be visible and testable.


# 1. Purpose and Scope — Acceptance Criteria

A conforming implementation:
1. uses canonical terminology,
2. preserves provenance,
3. enforces tenancy and permissions,
4. records relevant events and audit,
5. exposes confidence where applicable,
6. supports cartridge extension,
7. avoids hidden business logic in the interface,
8. includes regression tests,
9. records cost for intelligent execution,
10. updates current-state and handoff documentation.


# 2. The Dispatch Thesis

Organizations rarely fail because information does not exist. They fail because information is fragmented, context is missing, responsibilities are unclear, tools are disconnected, and execution is not orchestrated.

Dispatch converts fragmented facts, context, relationships, rules, and activity into operational capacity.

The constitutional equation is:

Knowledge + Context + Relationships + Execution = Operational Capacity

Dispatch must improve at least one term in this equation. Features that do not increase operational capacity do not belong in the core platform.


# 2. The Dispatch Thesis — Design Implications

- The concept must be represented through explicit schemas and contracts.
- The implementation must preserve source attribution, permissions, and audit.
- Domain-specific variation must remain in cartridges or configuration.
- Model outputs must remain subordinate to structured truth and workflow state.
- Failure, uncertainty, and conflict must be visible and testable.


# 2. The Dispatch Thesis — Acceptance Criteria

A conforming implementation:
1. uses canonical terminology,
2. preserves provenance,
3. enforces tenancy and permissions,
4. records relevant events and audit,
5. exposes confidence where applicable,
6. supports cartridge extension,
7. avoids hidden business logic in the interface,
8. includes regression tests,
9. records cost for intelligent execution,
10. updates current-state and handoff documentation.


# 3. Brand and Product Architecture

Auric Works is the company that builds, owns, operates, partners, advises, invests, and creates.

The Auric is the publication and acquisition layer. It earns attention by producing concise, contextual, role-specific intelligence.

A named Terminal is the product. It is the institution-specific operating environment containing profiles, feeds, knowledge, collaboration, cartridges, workflows, and execution.

Dispatch is the internal orchestration kernel. It may also be exposed as a configurable private intelligence service where a customer purchases its own operating brain.

These names must not be collapsed into one another. The company, publication, product, and kernel have different jobs.


# 3. Brand and Product Architecture — Design Implications

- The concept must be represented through explicit schemas and contracts.
- The implementation must preserve source attribution, permissions, and audit.
- Domain-specific variation must remain in cartridges or configuration.
- Model outputs must remain subordinate to structured truth and workflow state.
- Failure, uncertainty, and conflict must be visible and testable.


# 3. Brand and Product Architecture — Acceptance Criteria

A conforming implementation:
1. uses canonical terminology,
2. preserves provenance,
3. enforces tenancy and permissions,
4. records relevant events and audit,
5. exposes confidence where applicable,
6. supports cartridge extension,
7. avoids hidden business logic in the interface,
8. includes regression tests,
9. records cost for intelligent execution,
10. updates current-state and handoff documentation.


# 4. First Principles

1. Dispatch is an operating system, not a single application.
2. The kernel must remain domain-agnostic.
3. Industries and capabilities are introduced through cartridges.
4. Everything significant is represented as an object.
5. Relationships are first-class objects.
6. Profiles are living graphs, not static records.
7. Truth precedes inference.
8. Every claim requires provenance.
9. Intelligence must be executable.
10. Publication is a rendering of intelligence, not a separate content process.
11. The cheapest sufficient intelligence must be used.
12. Human experts refine truth and judgment, not repetitive production.
13. The interface is a rendering layer and must not own business logic.
14. Public and private knowledge must remain explicitly separated.
15. Every interaction should improve future relevance, confidence, or execution.
16. The system must support manual, imported, connected, and agentically acquired inputs.
17. Models are replaceable. Data, rules, workflows, and institutional memory are durable.
18. Every automated action must be auditable.
19. High-impact decisions require confidence thresholds and escalation.
20. The system should know what it does not know.


# 4. First Principles — Design Implications

- The concept must be represented through explicit schemas and contracts.
- The implementation must preserve source attribution, permissions, and audit.
- Domain-specific variation must remain in cartridges or configuration.
- Model outputs must remain subordinate to structured truth and workflow state.
- Failure, uncertainty, and conflict must be visible and testable.


# 4. First Principles — Acceptance Criteria

A conforming implementation:
1. uses canonical terminology,
2. preserves provenance,
3. enforces tenancy and permissions,
4. records relevant events and audit,
5. exposes confidence where applicable,
6. supports cartridge extension,
7. avoids hidden business logic in the interface,
8. includes regression tests,
9. records cost for intelligent execution,
10. updates current-state and handoff documentation.


# 5. Canonical Language

Object: A canonical entity, event, document, concept, relationship, or operational artifact with identity.

Observation: Raw information captured from a source.

Claim: A structured statement about an object.

Fact: A claim supported by an authoritative or institution-verified source.

Inference: A derived conclusion with confidence and method attribution.

Recommendation: A proposed action derived from facts, rules, inferences, goals, and context.

Source: The origin of an observation or claim.

Provenance: The complete trace from source to observation, claim, transformation, and output.

Profile: A living aggregation of identity, facts, inferences, goals, relationships, permissions, activity, and cartridge state.

Relationship: A first-class object connecting two or more objects over time.

Intelligence Object: The atomic unit of synthesized, lensed, actionable knowledge.

Cartridge: A packaged capability containing schemas, sources, rules, prompts, workflows, permissions, evaluations, and renderers.

Terminal: The operating environment configured for a specific institution.

Harness: The orchestration layer that routes work among rules, tools, models, and humans.

Kernel: The stable core responsible for identity, tenancy, truth, events, orchestration, audit, cartridge execution, cost, and memory.

Workflow: A durable sequence of states, actions, gates, evidence, and outcomes.

Outcome: A recorded result that updates profiles, relationships, rules, or performance.

Market Graph: The shared public and permissioned graph of institutions, companies, people, products, events, and relationships.

Private Graph: Tenant-controlled knowledge, activity, documents, preferences, and decisions.

Lens: A transformation that renders the same intelligence for a specific role, institution, cartridge, channel, or objective.

Signal: A concise item that indicates meaningful change.

Brief: A highly compressed set of signals delivered on a defined cadence.

Feed: A searchable, continuously updated, relevance-ranked collection of intelligence objects.


# 5. Canonical Language — Design Implications

- The concept must be represented through explicit schemas and contracts.
- The implementation must preserve source attribution, permissions, and audit.
- Domain-specific variation must remain in cartridges or configuration.
- Model outputs must remain subordinate to structured truth and workflow state.
- Failure, uncertainty, and conflict must be visible and testable.


# 5. Canonical Language — Acceptance Criteria

A conforming implementation:
1. uses canonical terminology,
2. preserves provenance,
3. enforces tenancy and permissions,
4. records relevant events and audit,
5. exposes confidence where applicable,
6. supports cartridge extension,
7. avoids hidden business logic in the interface,
8. includes regression tests,
9. records cost for intelligent execution,
10. updates current-state and handoff documentation.


# 6. The Kernel Boundary

The kernel owns identity, tenancy, permissions, object identity, source registration, truth states, events, workflows, model routing, costs, audit, memory, cartridge registration, and shared execution primitives.

The kernel does not own credit-union rules, hospitality rules, lending rules, editorial style, portfolio policy, or any domain-specific workflow. Those belong in cartridges or configurations.

A proposed change belongs in the kernel only if it is required across multiple domains and cannot be expressed through cartridges, registries, rules, or configuration.


# 6. The Kernel Boundary — Design Implications

- The concept must be represented through explicit schemas and contracts.
- The implementation must preserve source attribution, permissions, and audit.
- Domain-specific variation must remain in cartridges or configuration.
- Model outputs must remain subordinate to structured truth and workflow state.
- Failure, uncertainty, and conflict must be visible and testable.


# 6. The Kernel Boundary — Acceptance Criteria

A conforming implementation:
1. uses canonical terminology,
2. preserves provenance,
3. enforces tenancy and permissions,
4. records relevant events and audit,
5. exposes confidence where applicable,
6. supports cartridge extension,
7. avoids hidden business logic in the interface,
8. includes regression tests,
9. records cost for intelligent execution,
10. updates current-state and handoff documentation.


# 7. Object Constitution

Every significant concept must have a stable object identity. Objects must be versionable, addressable, permissioned, and auditable.

Objects must not be created merely to mirror interface components. Object boundaries should reflect durable domain meaning.

Each object definition must specify:
- canonical name and identifier
- lifecycle states
- required and optional fields
- source and provenance rules
- visibility and tenancy
- relationships
- events emitted
- cartridges that may extend it
- retention rules
- merge and deduplication behavior
- acceptance tests

Objects may be global, tenant-private, shared by consent, or derived. These categories must be explicit.


# 7. Object Constitution — Design Implications

- The concept must be represented through explicit schemas and contracts.
- The implementation must preserve source attribution, permissions, and audit.
- Domain-specific variation must remain in cartridges or configuration.
- Model outputs must remain subordinate to structured truth and workflow state.
- Failure, uncertainty, and conflict must be visible and testable.


# 7. Object Constitution — Acceptance Criteria

A conforming implementation:
1. uses canonical terminology,
2. preserves provenance,
3. enforces tenancy and permissions,
4. records relevant events and audit,
5. exposes confidence where applicable,
6. supports cartridge extension,
7. avoids hidden business logic in the interface,
8. includes regression tests,
9. records cost for intelligent execution,
10. updates current-state and handoff documentation.


# 8. Relationship Constitution

Relationships are not foreign keys alone. They are living objects with type, state, evidence, participants, permissions, history, confidence, value, and next action.

A relationship may represent use, ownership, investment, partnership, employment, integration, pilot, referral, membership, service, governance, interest, or influence.

Relationships must support:
- observed and verified states
- temporal validity
- public and private attributes
- stage progression
- evidence
- confidence
- role participants
- activity history
- outcomes
- relationship-specific workflows
- recommendations

The relationship graph is a primary source of network intelligence and must be preserved independently from CRM-like notes.


# 8. Relationship Constitution — Design Implications

- The concept must be represented through explicit schemas and contracts.
- The implementation must preserve source attribution, permissions, and audit.
- Domain-specific variation must remain in cartridges or configuration.
- Model outputs must remain subordinate to structured truth and workflow state.
- Failure, uncertainty, and conflict must be visible and testable.


# 8. Relationship Constitution — Acceptance Criteria

A conforming implementation:
1. uses canonical terminology,
2. preserves provenance,
3. enforces tenancy and permissions,
4. records relevant events and audit,
5. exposes confidence where applicable,
6. supports cartridge extension,
7. avoids hidden business logic in the interface,
8. includes regression tests,
9. records cost for intelligent execution,
10. updates current-state and handoff documentation.


# 9. Profile Constitution

Profiles are living operational representations. They are not static pages.

A profile combines:
- canonical identity
- public facts
- institution-verified facts
- private context
- derived metrics
- inferences
- goals
- relationships
- role or organizational responsibilities
- activity
- cartridge state
- confidence
- unresolved gaps
- recommendations

Profiles may exist before a user joins. Users claim, correct, enrich, and permission profiles rather than creating them from scratch.

Profile changes must be evented and attributable. Personal profiles must distinguish portable professional context from institution-owned context.


# 9. Profile Constitution — Design Implications

- The concept must be represented through explicit schemas and contracts.
- The implementation must preserve source attribution, permissions, and audit.
- Domain-specific variation must remain in cartridges or configuration.
- Model outputs must remain subordinate to structured truth and workflow state.
- Failure, uncertainty, and conflict must be visible and testable.


# 9. Profile Constitution — Acceptance Criteria

A conforming implementation:
1. uses canonical terminology,
2. preserves provenance,
3. enforces tenancy and permissions,
4. records relevant events and audit,
5. exposes confidence where applicable,
6. supports cartridge extension,
7. avoids hidden business logic in the interface,
8. includes regression tests,
9. records cost for intelligent execution,
10. updates current-state and handoff documentation.


# 10. Truth and Provenance Constitution

Every claim must be classifiable as:
- authoritative public fact
- institution-verified fact
- third-party reported claim
- human opinion
- model inference
- generated recommendation
- unresolved conflict

Every claim must carry:
- source
- observed date
- effective date where relevant
- confidence
- visibility
- verification status
- transformation history
- responsible connector, model, rule, or human
- expiration or refresh policy

Inference must never silently overwrite fact. Conflicting claims must coexist until resolution rules select an active interpretation.

The platform must expose uncertainty where uncertainty matters.


# 10. Truth and Provenance Constitution — Design Implications

- The concept must be represented through explicit schemas and contracts.
- The implementation must preserve source attribution, permissions, and audit.
- Domain-specific variation must remain in cartridges or configuration.
- Model outputs must remain subordinate to structured truth and workflow state.
- Failure, uncertainty, and conflict must be visible and testable.


# 10. Truth and Provenance Constitution — Acceptance Criteria

A conforming implementation:
1. uses canonical terminology,
2. preserves provenance,
3. enforces tenancy and permissions,
4. records relevant events and audit,
5. exposes confidence where applicable,
6. supports cartridge extension,
7. avoids hidden business logic in the interface,
8. includes regression tests,
9. records cost for intelligent execution,
10. updates current-state and handoff documentation.


# 11. Confidence Constitution

Confidence is not a decorative score. It governs routing, presentation, automation, and escalation.

Confidence must consider:
- source authority
- source freshness
- corroboration
- extraction quality
- transformation complexity
- rule determinism
- model consistency
- historical accuracy
- institution verification

Low-confidence information may inform discovery but must not trigger irreversible or regulated actions without review.

Confidence methods must be versioned and testable.


# 11. Confidence Constitution — Design Implications

- The concept must be represented through explicit schemas and contracts.
- The implementation must preserve source attribution, permissions, and audit.
- Domain-specific variation must remain in cartridges or configuration.
- Model outputs must remain subordinate to structured truth and workflow state.
- Failure, uncertainty, and conflict must be visible and testable.


# 11. Confidence Constitution — Acceptance Criteria

A conforming implementation:
1. uses canonical terminology,
2. preserves provenance,
3. enforces tenancy and permissions,
4. records relevant events and audit,
5. exposes confidence where applicable,
6. supports cartridge extension,
7. avoids hidden business logic in the interface,
8. includes regression tests,
9. records cost for intelligent execution,
10. updates current-state and handoff documentation.


# 12. Event Constitution

Every meaningful change enters Dispatch as an event.

Events include:
- source updates
- profile changes
- relationship changes
- document uploads
- user interactions
- model outputs
- rule triggers
- workflow transitions
- approvals
- publications
- external outcomes

Events are immutable records. State is derived from events and current object records.

Events must include actor, timestamp, tenant, source, affected objects, event type, payload version, and correlation identifiers.


# 12. Event Constitution — Design Implications

- The concept must be represented through explicit schemas and contracts.
- The implementation must preserve source attribution, permissions, and audit.
- Domain-specific variation must remain in cartridges or configuration.
- Model outputs must remain subordinate to structured truth and workflow state.
- Failure, uncertainty, and conflict must be visible and testable.


# 12. Event Constitution — Acceptance Criteria

A conforming implementation:
1. uses canonical terminology,
2. preserves provenance,
3. enforces tenancy and permissions,
4. records relevant events and audit,
5. exposes confidence where applicable,
6. supports cartridge extension,
7. avoids hidden business logic in the interface,
8. includes regression tests,
9. records cost for intelligent execution,
10. updates current-state and handoff documentation.


# 13. Workflow Constitution

Workflows convert intelligence into controlled execution.

Every workflow must define:
- trigger
- prerequisites
- states
- transitions
- owners
- automated steps
- human gates
- evidence requirements
- exceptions
- timeout and retry behavior
- cost limits
- outcome recording
- audit requirements

Workflows must be durable and resumable. Long-running institutional processes cannot depend on a single chat session or model invocation.


# 13. Workflow Constitution — Design Implications

- The concept must be represented through explicit schemas and contracts.
- The implementation must preserve source attribution, permissions, and audit.
- Domain-specific variation must remain in cartridges or configuration.
- Model outputs must remain subordinate to structured truth and workflow state.
- Failure, uncertainty, and conflict must be visible and testable.


# 13. Workflow Constitution — Acceptance Criteria

A conforming implementation:
1. uses canonical terminology,
2. preserves provenance,
3. enforces tenancy and permissions,
4. records relevant events and audit,
5. exposes confidence where applicable,
6. supports cartridge extension,
7. avoids hidden business logic in the interface,
8. includes regression tests,
9. records cost for intelligent execution,
10. updates current-state and handoff documentation.


# 14. Intelligence Object Constitution

An Intelligence Object is the canonical synthesized object produced by Dispatch.

It must contain:
- title
- summary
- source claims
- affected objects
- why it matters
- role relevance
- institution relevance
- cartridge relevance
- recommended action
- confidence
- visibility
- freshness and expiration
- available renderings
- workflow links
- discussion and feedback
- outcome attribution

One Intelligence Object may render as a brief item, feed card, email, memo, video script, audio script, board note, search result, alert, or workflow trigger.

Rendering must not mutate the underlying truth.


# 14. Intelligence Object Constitution — Design Implications

- The concept must be represented through explicit schemas and contracts.
- The implementation must preserve source attribution, permissions, and audit.
- Domain-specific variation must remain in cartridges or configuration.
- Model outputs must remain subordinate to structured truth and workflow state.
- Failure, uncertainty, and conflict must be visible and testable.


# 14. Intelligence Object Constitution — Acceptance Criteria

A conforming implementation:
1. uses canonical terminology,
2. preserves provenance,
3. enforces tenancy and permissions,
4. records relevant events and audit,
5. exposes confidence where applicable,
6. supports cartridge extension,
7. avoids hidden business logic in the interface,
8. includes regression tests,
9. records cost for intelligent execution,
10. updates current-state and handoff documentation.


# 15. Publication Constitution

The Auric is the observable publication layer generated from Dispatch intelligence.

Its purpose is not volume. Its purpose is relevance, judgment, and movement.

The publication system must support:
- a timeless bi-daily Brief
- a searchable Market feed
- a Network layer showing relevant activity and interaction
- a small practical innovation format such as the $2 Bill
- role, institution, cartridge, and channel lenses
- multimedia rendering
- source attribution
- direct action paths

Base content should be generated once, then adapted through lenses. The publication must avoid copying source material and instead summarize, attribute, compare, synthesize, and contextualize.


# 15. Publication Constitution — Design Implications

- The concept must be represented through explicit schemas and contracts.
- The implementation must preserve source attribution, permissions, and audit.
- Domain-specific variation must remain in cartridges or configuration.
- Model outputs must remain subordinate to structured truth and workflow state.
- Failure, uncertainty, and conflict must be visible and testable.


# 15. Publication Constitution — Acceptance Criteria

A conforming implementation:
1. uses canonical terminology,
2. preserves provenance,
3. enforces tenancy and permissions,
4. records relevant events and audit,
5. exposes confidence where applicable,
6. supports cartridge extension,
7. avoids hidden business logic in the interface,
8. includes regression tests,
9. records cost for intelligent execution,
10. updates current-state and handoff documentation.


# 16. Terminal Constitution

A Terminal is a named institution-specific operating environment.

It must unify:
- institution profile
- people and role profiles
- public and private feed
- market search
- cartridges
- workflows
- relationships
- collaboration
- private memory
- documents
- alerts
- outcomes
- cost and usage

The Terminal must operate up and down the organization. Executives, operators, boards, teams, and individuals receive different lenses over the same institutional context.

The Terminal is not a dashboard collection. It is a persistent operating environment.


# 16. Terminal Constitution — Design Implications

- The concept must be represented through explicit schemas and contracts.
- The implementation must preserve source attribution, permissions, and audit.
- Domain-specific variation must remain in cartridges or configuration.
- Model outputs must remain subordinate to structured truth and workflow state.
- Failure, uncertainty, and conflict must be visible and testable.


# 16. Terminal Constitution — Acceptance Criteria

A conforming implementation:
1. uses canonical terminology,
2. preserves provenance,
3. enforces tenancy and permissions,
4. records relevant events and audit,
5. exposes confidence where applicable,
6. supports cartridge extension,
7. avoids hidden business logic in the interface,
8. includes regression tests,
9. records cost for intelligent execution,
10. updates current-state and handoff documentation.


# 17. Cartridge Constitution

Cartridges are the sole mechanism for adding domain or capability logic.

Cartridge categories include:
- domain
- role
- workflow
- relationship
- service
- publication
- integration
- data

Every cartridge must declare:
- dependencies
- objects extended
- connector inputs
- rules
- prompts
- workflows
- permissions
- outputs
- metrics
- usage and cost behavior
- evaluation datasets
- versioning
- installation and removal behavior

Cartridges must not bypass truth, audit, identity, tenancy, or cost controls.


# 17. Cartridge Constitution — Design Implications

- The concept must be represented through explicit schemas and contracts.
- The implementation must preserve source attribution, permissions, and audit.
- Domain-specific variation must remain in cartridges or configuration.
- Model outputs must remain subordinate to structured truth and workflow state.
- Failure, uncertainty, and conflict must be visible and testable.


# 17. Cartridge Constitution — Acceptance Criteria

A conforming implementation:
1. uses canonical terminology,
2. preserves provenance,
3. enforces tenancy and permissions,
4. records relevant events and audit,
5. exposes confidence where applicable,
6. supports cartridge extension,
7. avoids hidden business logic in the interface,
8. includes regression tests,
9. records cost for intelligent execution,
10. updates current-state and handoff documentation.


# 18. Harness Constitution

The Harness determines how work is executed.

Execution order:
1. deterministic rules and SQL
2. retrieval and structured tools
3. small shared open model
4. stronger open model
5. frontier model
6. human expert

Routing must consider complexity, stakes, latency, privacy, cost, confidence, and tenant policy.

Models may deliberate, extract, classify, draft, compare, and plan. They may not become the system of record.

All model outputs must be structured where practical and traced.


# 18. Harness Constitution — Design Implications

- The concept must be represented through explicit schemas and contracts.
- The implementation must preserve source attribution, permissions, and audit.
- Domain-specific variation must remain in cartridges or configuration.
- Model outputs must remain subordinate to structured truth and workflow state.
- Failure, uncertainty, and conflict must be visible and testable.


# 18. Harness Constitution — Acceptance Criteria

A conforming implementation:
1. uses canonical terminology,
2. preserves provenance,
3. enforces tenancy and permissions,
4. records relevant events and audit,
5. exposes confidence where applicable,
6. supports cartridge extension,
7. avoids hidden business logic in the interface,
8. includes regression tests,
9. records cost for intelligent execution,
10. updates current-state and handoff documentation.


# 19. Open Source Constitution

The owned core should use open standards and replaceable components.

Preferred characteristics:
- self-hostable
- permissive licensing
- exportable data
- portable model routing
- standard SQL
- standard object storage
- documented APIs
- no forced dependence on a single model vendor

Frontier models are specialists accessed through the Harness. They must not own business logic, memory, or truth.


# 19. Open Source Constitution — Design Implications

- The concept must be represented through explicit schemas and contracts.
- The implementation must preserve source attribution, permissions, and audit.
- Domain-specific variation must remain in cartridges or configuration.
- Model outputs must remain subordinate to structured truth and workflow state.
- Failure, uncertainty, and conflict must be visible and testable.


# 19. Open Source Constitution — Acceptance Criteria

A conforming implementation:
1. uses canonical terminology,
2. preserves provenance,
3. enforces tenancy and permissions,
4. records relevant events and audit,
5. exposes confidence where applicable,
6. supports cartridge extension,
7. avoids hidden business logic in the interface,
8. includes regression tests,
9. records cost for intelligent execution,
10. updates current-state and handoff documentation.


# 20. Public and Private Graph Constitution

The shared market graph contains public facts, licensed data, permitted network signals, and derived public intelligence.

The private graph contains tenant documents, preferences, policies, conversations, internal activity, private relationships, and decisions.

Data may move from private to shared only through explicit permission, aggregation rules, anonymization, or contractual authority.

The system must support row-level security, object-level visibility, field-level sensitivity, and purpose-based access.


# 20. Public and Private Graph Constitution — Design Implications

- The concept must be represented through explicit schemas and contracts.
- The implementation must preserve source attribution, permissions, and audit.
- Domain-specific variation must remain in cartridges or configuration.
- Model outputs must remain subordinate to structured truth and workflow state.
- Failure, uncertainty, and conflict must be visible and testable.


# 20. Public and Private Graph Constitution — Acceptance Criteria

A conforming implementation:
1. uses canonical terminology,
2. preserves provenance,
3. enforces tenancy and permissions,
4. records relevant events and audit,
5. exposes confidence where applicable,
6. supports cartridge extension,
7. avoids hidden business logic in the interface,
8. includes regression tests,
9. records cost for intelligent execution,
10. updates current-state and handoff documentation.


# 21. Knowledge Acquisition Constitution

Dispatch continuously acquires knowledge through registered sources and connectors.

A connector must:
- identify its source
- respect access terms
- record acquisition method
- normalize observations
- preserve raw evidence where permitted
- emit objects and claims
- detect changes
- assign trust metadata
- avoid embedding business logic

The system should maintain a discovery backlog for new sources, vertical gaps, profile gaps, standards, marketplaces, publications, APIs, and partner systems.


# 21. Knowledge Acquisition Constitution — Design Implications

- The concept must be represented through explicit schemas and contracts.
- The implementation must preserve source attribution, permissions, and audit.
- Domain-specific variation must remain in cartridges or configuration.
- Model outputs must remain subordinate to structured truth and workflow state.
- Failure, uncertainty, and conflict must be visible and testable.


# 21. Knowledge Acquisition Constitution — Acceptance Criteria

A conforming implementation:
1. uses canonical terminology,
2. preserves provenance,
3. enforces tenancy and permissions,
4. records relevant events and audit,
5. exposes confidence where applicable,
6. supports cartridge extension,
7. avoids hidden business logic in the interface,
8. includes regression tests,
9. records cost for intelligent execution,
10. updates current-state and handoff documentation.


# 22. Source Hierarchy

Sources are categorized by authority:
1. authoritative government or regulatory source
2. institution-originated source
3. contractual or licensed data source
4. established market publication
5. community or network contribution
6. model-derived inference

Higher authority does not automatically mean greater relevance, but it controls factual precedence unless contradicted by newer authoritative evidence.


# 22. Source Hierarchy — Design Implications

- The concept must be represented through explicit schemas and contracts.
- The implementation must preserve source attribution, permissions, and audit.
- Domain-specific variation must remain in cartridges or configuration.
- Model outputs must remain subordinate to structured truth and workflow state.
- Failure, uncertainty, and conflict must be visible and testable.


# 22. Source Hierarchy — Acceptance Criteria

A conforming implementation:
1. uses canonical terminology,
2. preserves provenance,
3. enforces tenancy and permissions,
4. records relevant events and audit,
5. exposes confidence where applicable,
6. supports cartridge extension,
7. avoids hidden business logic in the interface,
8. includes regression tests,
9. records cost for intelligent execution,
10. updates current-state and handoff documentation.


# 23. Security Constitution

Security is a kernel responsibility.

Required principles:
- least privilege
- explicit tenancy
- auditable access
- secure defaults
- separation of public and private graphs
- encryption in transit and at rest
- secret isolation
- revocable connector credentials
- model privacy controls
- retention policies
- export and deletion support
- incident traceability

No cartridge may weaken kernel security.


# 23. Security Constitution — Design Implications

- The concept must be represented through explicit schemas and contracts.
- The implementation must preserve source attribution, permissions, and audit.
- Domain-specific variation must remain in cartridges or configuration.
- Model outputs must remain subordinate to structured truth and workflow state.
- Failure, uncertainty, and conflict must be visible and testable.


# 23. Security Constitution — Acceptance Criteria

A conforming implementation:
1. uses canonical terminology,
2. preserves provenance,
3. enforces tenancy and permissions,
4. records relevant events and audit,
5. exposes confidence where applicable,
6. supports cartridge extension,
7. avoids hidden business logic in the interface,
8. includes regression tests,
9. records cost for intelligent execution,
10. updates current-state and handoff documentation.


# 24. Identity and Role Constitution

A person may hold multiple roles across multiple organizations.

Identity, role, permission, responsibility, and lens are separate concepts.

A role determines:
- accessible objects
- relevant cartridges
- feed lenses
- workflow authority
- approval rights
- notifications
- private context boundaries

Personal profiles must preserve portability without exposing institution-owned information.


# 24. Identity and Role Constitution — Design Implications

- The concept must be represented through explicit schemas and contracts.
- The implementation must preserve source attribution, permissions, and audit.
- Domain-specific variation must remain in cartridges or configuration.
- Model outputs must remain subordinate to structured truth and workflow state.
- Failure, uncertainty, and conflict must be visible and testable.


# 24. Identity and Role Constitution — Acceptance Criteria

A conforming implementation:
1. uses canonical terminology,
2. preserves provenance,
3. enforces tenancy and permissions,
4. records relevant events and audit,
5. exposes confidence where applicable,
6. supports cartridge extension,
7. avoids hidden business logic in the interface,
8. includes regression tests,
9. records cost for intelligent execution,
10. updates current-state and handoff documentation.


# 25. Cost Constitution

The platform must record cost at the action level.

Cost categories include:
- model inference
- storage
- retrieval
- external APIs
- connector operations
- human review
- partner services
- workflow execution

The entry layer may be free forever. The first paid layer should be low enough for individual or departmental adoption without committee approval. Heavy usage and execution should be metered or priced by outcome.

Customers buy capacity and progress, not tokens.


# 25. Cost Constitution — Design Implications

- The concept must be represented through explicit schemas and contracts.
- The implementation must preserve source attribution, permissions, and audit.
- Domain-specific variation must remain in cartridges or configuration.
- Model outputs must remain subordinate to structured truth and workflow state.
- Failure, uncertainty, and conflict must be visible and testable.


# 25. Cost Constitution — Acceptance Criteria

A conforming implementation:
1. uses canonical terminology,
2. preserves provenance,
3. enforces tenancy and permissions,
4. records relevant events and audit,
5. exposes confidence where applicable,
6. supports cartridge extension,
7. avoids hidden business logic in the interface,
8. includes regression tests,
9. records cost for intelligent execution,
10. updates current-state and handoff documentation.


# 26. Audit Constitution

Every material automated or human action must be auditable.

Audit records must show:
- actor
- input
- rules
- model and version
- prompt or instruction version
- retrieved sources
- output
- approval
- state changes
- cost
- affected objects
- outcome

Audit records must be durable and queryable.


# 26. Audit Constitution — Design Implications

- The concept must be represented through explicit schemas and contracts.
- The implementation must preserve source attribution, permissions, and audit.
- Domain-specific variation must remain in cartridges or configuration.
- Model outputs must remain subordinate to structured truth and workflow state.
- Failure, uncertainty, and conflict must be visible and testable.


# 26. Audit Constitution — Acceptance Criteria

A conforming implementation:
1. uses canonical terminology,
2. preserves provenance,
3. enforces tenancy and permissions,
4. records relevant events and audit,
5. exposes confidence where applicable,
6. supports cartridge extension,
7. avoids hidden business logic in the interface,
8. includes regression tests,
9. records cost for intelligent execution,
10. updates current-state and handoff documentation.


# 27. Human Expert Constitution

Experts are editors of truth, interpretation, and judgment.

Experts should:
- resolve conflicts
- annotate claims
- approve high-stakes outputs
- define rules
- calibrate models
- improve evaluation sets
- provide domain commentary

Experts should not be required to reproduce routine summaries or repetitive packages.


# 27. Human Expert Constitution — Design Implications

- The concept must be represented through explicit schemas and contracts.
- The implementation must preserve source attribution, permissions, and audit.
- Domain-specific variation must remain in cartridges or configuration.
- Model outputs must remain subordinate to structured truth and workflow state.
- Failure, uncertainty, and conflict must be visible and testable.


# 27. Human Expert Constitution — Acceptance Criteria

A conforming implementation:
1. uses canonical terminology,
2. preserves provenance,
3. enforces tenancy and permissions,
4. records relevant events and audit,
5. exposes confidence where applicable,
6. supports cartridge extension,
7. avoids hidden business logic in the interface,
8. includes regression tests,
9. records cost for intelligent execution,
10. updates current-state and handoff documentation.


# 28. Personalization Constitution

Personalization is derived from explicit and observed context.

Relevant factors include:
- role
- institution
- goals
- responsibilities
- active cartridges
- relationships
- decisions
- reading behavior
- saved items
- feedback
- current workflows
- preferred channels and formats

Personalization must not conceal important facts or create unsupported certainty.


# 28. Personalization Constitution — Design Implications

- The concept must be represented through explicit schemas and contracts.
- The implementation must preserve source attribution, permissions, and audit.
- Domain-specific variation must remain in cartridges or configuration.
- Model outputs must remain subordinate to structured truth and workflow state.
- Failure, uncertainty, and conflict must be visible and testable.


# 28. Personalization Constitution — Acceptance Criteria

A conforming implementation:
1. uses canonical terminology,
2. preserves provenance,
3. enforces tenancy and permissions,
4. records relevant events and audit,
5. exposes confidence where applicable,
6. supports cartridge extension,
7. avoids hidden business logic in the interface,
8. includes regression tests,
9. records cost for intelligent execution,
10. updates current-state and handoff documentation.


# 29. Network Constitution

The network is a consequence of connected profiles, relationships, and activity.

Network effects arise when:
- profile corrections improve matching
- outcomes improve recommendations
- integrations become reusable
- relationship patterns become visible
- peer activity informs decisions
- expert annotations improve future outputs
- shared workflows reduce repeated work

Private activity must not be exposed without permission.


# 29. Network Constitution — Design Implications

- The concept must be represented through explicit schemas and contracts.
- The implementation must preserve source attribution, permissions, and audit.
- Domain-specific variation must remain in cartridges or configuration.
- Model outputs must remain subordinate to structured truth and workflow state.
- Failure, uncertainty, and conflict must be visible and testable.


# 29. Network Constitution — Acceptance Criteria

A conforming implementation:
1. uses canonical terminology,
2. preserves provenance,
3. enforces tenancy and permissions,
4. records relevant events and audit,
5. exposes confidence where applicable,
6. supports cartridge extension,
7. avoids hidden business logic in the interface,
8. includes regression tests,
9. records cost for intelligent execution,
10. updates current-state and handoff documentation.


# 30. Recommendation Constitution

Recommendations must identify:
- objective
- supporting facts
- assumptions
- confidence
- expected value
- risks
- required participants
- next step
- available cartridge or workflow
- expiration or review date

Recommendations are proposals, not truth.


# 30. Recommendation Constitution — Design Implications

- The concept must be represented through explicit schemas and contracts.
- The implementation must preserve source attribution, permissions, and audit.
- Domain-specific variation must remain in cartridges or configuration.
- Model outputs must remain subordinate to structured truth and workflow state.
- Failure, uncertainty, and conflict must be visible and testable.


# 30. Recommendation Constitution — Acceptance Criteria

A conforming implementation:
1. uses canonical terminology,
2. preserves provenance,
3. enforces tenancy and permissions,
4. records relevant events and audit,
5. exposes confidence where applicable,
6. supports cartridge extension,
7. avoids hidden business logic in the interface,
8. includes regression tests,
9. records cost for intelligent execution,
10. updates current-state and handoff documentation.


# 31. Actionability Constitution

Every meaningful Intelligence Object should support at least one action:
- save
- discuss
- share
- compare
- correct
- request analysis
- open workflow
- invite participant
- launch pilot
- evaluate vendor
- create memo
- approve
- invest
- integrate
- monitor

Action paths must preserve permissions and evidence.


# 31. Actionability Constitution — Design Implications

- The concept must be represented through explicit schemas and contracts.
- The implementation must preserve source attribution, permissions, and audit.
- Domain-specific variation must remain in cartridges or configuration.
- Model outputs must remain subordinate to structured truth and workflow state.
- Failure, uncertainty, and conflict must be visible and testable.


# 31. Actionability Constitution — Acceptance Criteria

A conforming implementation:
1. uses canonical terminology,
2. preserves provenance,
3. enforces tenancy and permissions,
4. records relevant events and audit,
5. exposes confidence where applicable,
6. supports cartridge extension,
7. avoids hidden business logic in the interface,
8. includes regression tests,
9. records cost for intelligent execution,
10. updates current-state and handoff documentation.


# 32. Search Constitution

Search must operate across objects, claims, relationships, intelligence, sources, workflows, and outcomes.

Search results must be:
- permission-aware
- source-aware
- freshness-aware
- confidence-aware
- role-aware
- explainable

Semantic retrieval may supplement but not replace structured filtering.


# 32. Search Constitution — Design Implications

- The concept must be represented through explicit schemas and contracts.
- The implementation must preserve source attribution, permissions, and audit.
- Domain-specific variation must remain in cartridges or configuration.
- Model outputs must remain subordinate to structured truth and workflow state.
- Failure, uncertainty, and conflict must be visible and testable.


# 32. Search Constitution — Acceptance Criteria

A conforming implementation:
1. uses canonical terminology,
2. preserves provenance,
3. enforces tenancy and permissions,
4. records relevant events and audit,
5. exposes confidence where applicable,
6. supports cartridge extension,
7. avoids hidden business logic in the interface,
8. includes regression tests,
9. records cost for intelligent execution,
10. updates current-state and handoff documentation.


# 33. Memory Constitution

Memory is stored context, not model recollection.

Memory types:
- public market memory
- institution memory
- personal memory
- relationship memory
- workflow memory
- editorial memory
- model evaluation memory

Memory must be inspectable, permissioned, and correctable.


# 33. Memory Constitution — Design Implications

- The concept must be represented through explicit schemas and contracts.
- The implementation must preserve source attribution, permissions, and audit.
- Domain-specific variation must remain in cartridges or configuration.
- Model outputs must remain subordinate to structured truth and workflow state.
- Failure, uncertainty, and conflict must be visible and testable.


# 33. Memory Constitution — Acceptance Criteria

A conforming implementation:
1. uses canonical terminology,
2. preserves provenance,
3. enforces tenancy and permissions,
4. records relevant events and audit,
5. exposes confidence where applicable,
6. supports cartridge extension,
7. avoids hidden business logic in the interface,
8. includes regression tests,
9. records cost for intelligent execution,
10. updates current-state and handoff documentation.


# 34. Configuration Constitution

Configuration must be preferred over one-off code where behavior is expected to vary by domain, tenant, role, or cartridge.

Configuration includes:
- schemas
- source mappings
- rules
- prompts
- routing
- thresholds
- permissions
- workflows
- rendering
- pricing

Configuration must be versioned, validated, and testable.


# 34. Configuration Constitution — Design Implications

- The concept must be represented through explicit schemas and contracts.
- The implementation must preserve source attribution, permissions, and audit.
- Domain-specific variation must remain in cartridges or configuration.
- Model outputs must remain subordinate to structured truth and workflow state.
- Failure, uncertainty, and conflict must be visible and testable.


# 34. Configuration Constitution — Acceptance Criteria

A conforming implementation:
1. uses canonical terminology,
2. preserves provenance,
3. enforces tenancy and permissions,
4. records relevant events and audit,
5. exposes confidence where applicable,
6. supports cartridge extension,
7. avoids hidden business logic in the interface,
8. includes regression tests,
9. records cost for intelligent execution,
10. updates current-state and handoff documentation.


# 35. Engineering Constitution

Engineering must favor:
- explicit contracts
- typed interfaces
- migrations
- deterministic tests
- idempotent jobs
- observable workflows
- bounded model calls
- configuration validation
- modular cartridges
- reversible changes
- small context packs
- ADRs for permanent decisions

Generated code is held to the same standards as human-written code.


# 35. Engineering Constitution — Design Implications

- The concept must be represented through explicit schemas and contracts.
- The implementation must preserve source attribution, permissions, and audit.
- Domain-specific variation must remain in cartridges or configuration.
- Model outputs must remain subordinate to structured truth and workflow state.
- Failure, uncertainty, and conflict must be visible and testable.


# 35. Engineering Constitution — Acceptance Criteria

A conforming implementation:
1. uses canonical terminology,
2. preserves provenance,
3. enforces tenancy and permissions,
4. records relevant events and audit,
5. exposes confidence where applicable,
6. supports cartridge extension,
7. avoids hidden business logic in the interface,
8. includes regression tests,
9. records cost for intelligent execution,
10. updates current-state and handoff documentation.


# 36. Repository Constitution

The repository must contain:
- root instructions
- Constitution
- canonical language
- current state
- active build
- subsystem specifications
- registries
- ADRs
- evaluation fixtures
- context-pack generator
- handoff
- session kickoff

A new coding session should read only the root instructions, current state, active build, and relevant context pack.


# 36. Repository Constitution — Design Implications

- The concept must be represented through explicit schemas and contracts.
- The implementation must preserve source attribution, permissions, and audit.
- Domain-specific variation must remain in cartridges or configuration.
- Model outputs must remain subordinate to structured truth and workflow state.
- Failure, uncertainty, and conflict must be visible and testable.


# 36. Repository Constitution — Acceptance Criteria

A conforming implementation:
1. uses canonical terminology,
2. preserves provenance,
3. enforces tenancy and permissions,
4. records relevant events and audit,
5. exposes confidence where applicable,
6. supports cartridge extension,
7. avoids hidden business logic in the interface,
8. includes regression tests,
9. records cost for intelligent execution,
10. updates current-state and handoff documentation.


# 37. Specification Hierarchy

Authority order:
1. Constitution
2. approved ADRs amending constitutional interpretation
3. canonical language and core subsystem specifications
4. registries and SDKs
5. domain PRDs
6. active build plans
7. implementation notes
8. interface designs

Lower documents may specialize but not contradict higher documents.


# 37. Specification Hierarchy — Design Implications

- The concept must be represented through explicit schemas and contracts.
- The implementation must preserve source attribution, permissions, and audit.
- Domain-specific variation must remain in cartridges or configuration.
- Model outputs must remain subordinate to structured truth and workflow state.
- Failure, uncertainty, and conflict must be visible and testable.


# 37. Specification Hierarchy — Acceptance Criteria

A conforming implementation:
1. uses canonical terminology,
2. preserves provenance,
3. enforces tenancy and permissions,
4. records relevant events and audit,
5. exposes confidence where applicable,
6. supports cartridge extension,
7. avoids hidden business logic in the interface,
8. includes regression tests,
9. records cost for intelligent execution,
10. updates current-state and handoff documentation.


# 38. ADR Constitution

An ADR is required for:
- kernel boundary changes
- object identity changes
- truth-state changes
- tenancy changes
- model-routing policy changes
- irreversible schema decisions
- public/private graph movement
- cartridge contract changes

ADRs must state context, decision, alternatives, consequences, and migration.


# 38. ADR Constitution — Design Implications

- The concept must be represented through explicit schemas and contracts.
- The implementation must preserve source attribution, permissions, and audit.
- Domain-specific variation must remain in cartridges or configuration.
- Model outputs must remain subordinate to structured truth and workflow state.
- Failure, uncertainty, and conflict must be visible and testable.


# 38. ADR Constitution — Acceptance Criteria

A conforming implementation:
1. uses canonical terminology,
2. preserves provenance,
3. enforces tenancy and permissions,
4. records relevant events and audit,
5. exposes confidence where applicable,
6. supports cartridge extension,
7. avoids hidden business logic in the interface,
8. includes regression tests,
9. records cost for intelligent execution,
10. updates current-state and handoff documentation.


# 39. Evaluation Constitution

Every intelligent subsystem requires evaluation.

Evaluation categories:
- factual accuracy
- source fidelity
- extraction quality
- matching relevance
- recommendation usefulness
- calibration
- routing efficiency
- cost
- latency
- safety
- privacy
- workflow completion

Cartridges must ship with representative fixtures and regression tests.


# 39. Evaluation Constitution — Design Implications

- The concept must be represented through explicit schemas and contracts.
- The implementation must preserve source attribution, permissions, and audit.
- Domain-specific variation must remain in cartridges or configuration.
- Model outputs must remain subordinate to structured truth and workflow state.
- Failure, uncertainty, and conflict must be visible and testable.


# 39. Evaluation Constitution — Acceptance Criteria

A conforming implementation:
1. uses canonical terminology,
2. preserves provenance,
3. enforces tenancy and permissions,
4. records relevant events and audit,
5. exposes confidence where applicable,
6. supports cartridge extension,
7. avoids hidden business logic in the interface,
8. includes regression tests,
9. records cost for intelligent execution,
10. updates current-state and handoff documentation.


# 40. Acceptance Constitution

A subsystem is not complete until:
- contracts are documented
- schemas are migrated
- permissions are enforced
- audit is present
- failure states are handled
- evaluation fixtures exist
- costs are recorded
- outputs are explainable
- handoff is updated
- relevant ADRs are committed


# 40. Acceptance Constitution — Design Implications

- The concept must be represented through explicit schemas and contracts.
- The implementation must preserve source attribution, permissions, and audit.
- Domain-specific variation must remain in cartridges or configuration.
- Model outputs must remain subordinate to structured truth and workflow state.
- Failure, uncertainty, and conflict must be visible and testable.


# 40. Acceptance Constitution — Acceptance Criteria

A conforming implementation:
1. uses canonical terminology,
2. preserves provenance,
3. enforces tenancy and permissions,
4. records relevant events and audit,
5. exposes confidence where applicable,
6. supports cartridge extension,
7. avoids hidden business logic in the interface,
8. includes regression tests,
9. records cost for intelligent execution,
10. updates current-state and handoff documentation.


# 41. UI Constitution

The UI is intentionally downstream of architecture.

The UI must render:
- profiles
- intelligence objects
- relationships
- workflows
- cartridges
- feed
- search
- collaboration

It must not become the source of domain rules or hidden state.

Multiple interfaces may exist over the same kernel: email, platform, mobile, API, video, audio, and manual delivery.


# 41. UI Constitution — Design Implications

- The concept must be represented through explicit schemas and contracts.
- The implementation must preserve source attribution, permissions, and audit.
- Domain-specific variation must remain in cartridges or configuration.
- Model outputs must remain subordinate to structured truth and workflow state.
- Failure, uncertainty, and conflict must be visible and testable.


# 41. UI Constitution — Acceptance Criteria

A conforming implementation:
1. uses canonical terminology,
2. preserves provenance,
3. enforces tenancy and permissions,
4. records relevant events and audit,
5. exposes confidence where applicable,
6. supports cartridge extension,
7. avoids hidden business logic in the interface,
8. includes regression tests,
9. records cost for intelligent execution,
10. updates current-state and handoff documentation.


# 42. Editorial Constitution

Editorial quality requires brevity, relevance, and judgment.

Every item should answer:
- what changed
- why it matters
- who should care
- what to do
- what tool or cartridge supports action

The same base object may be lensed for different roles without changing the underlying facts.


# 42. Editorial Constitution — Design Implications

- The concept must be represented through explicit schemas and contracts.
- The implementation must preserve source attribution, permissions, and audit.
- Domain-specific variation must remain in cartridges or configuration.
- Model outputs must remain subordinate to structured truth and workflow state.
- Failure, uncertainty, and conflict must be visible and testable.


# 42. Editorial Constitution — Acceptance Criteria

A conforming implementation:
1. uses canonical terminology,
2. preserves provenance,
3. enforces tenancy and permissions,
4. records relevant events and audit,
5. exposes confidence where applicable,
6. supports cartridge extension,
7. avoids hidden business logic in the interface,
8. includes regression tests,
9. records cost for intelligent execution,
10. updates current-state and handoff documentation.


# 43. Freemium Constitution

Free access should create real value and network density.

Free may include:
- public profiles
- public market search
- concise personalized briefs
- basic feed
- basic matching
- profile claiming and correction
- limited participation

Paid adoption should begin with private context, memory, deeper feeds, role cartridges, collaboration, and limited usage.

Execution, integration, premium analysis, human review, and transaction administration may be separately priced.


# 43. Freemium Constitution — Design Implications

- The concept must be represented through explicit schemas and contracts.
- The implementation must preserve source attribution, permissions, and audit.
- Domain-specific variation must remain in cartridges or configuration.
- Model outputs must remain subordinate to structured truth and workflow state.
- Failure, uncertainty, and conflict must be visible and testable.


# 43. Freemium Constitution — Acceptance Criteria

A conforming implementation:
1. uses canonical terminology,
2. preserves provenance,
3. enforces tenancy and permissions,
4. records relevant events and audit,
5. exposes confidence where applicable,
6. supports cartridge extension,
7. avoids hidden business logic in the interface,
8. includes regression tests,
9. records cost for intelligent execution,
10. updates current-state and handoff documentation.


# 44. Domain Expansion Constitution

A new domain must be introduced by:
- domain object extensions
- connector mappings
- truth rules
- cartridge package
- evaluation fixtures
- role lenses
- workflows
- publication lenses

The kernel must not be rewritten for each industry.


# 44. Domain Expansion Constitution — Design Implications

- The concept must be represented through explicit schemas and contracts.
- The implementation must preserve source attribution, permissions, and audit.
- Domain-specific variation must remain in cartridges or configuration.
- Model outputs must remain subordinate to structured truth and workflow state.
- Failure, uncertainty, and conflict must be visible and testable.


# 44. Domain Expansion Constitution — Acceptance Criteria

A conforming implementation:
1. uses canonical terminology,
2. preserves provenance,
3. enforces tenancy and permissions,
4. records relevant events and audit,
5. exposes confidence where applicable,
6. supports cartridge extension,
7. avoids hidden business logic in the interface,
8. includes regression tests,
9. records cost for intelligent execution,
10. updates current-state and handoff documentation.


# 45. Cooperative Markets Interpretation

The Cooperative Markets domain begins with credit unions and innovation companies.

The domain objective is to make institutions innovative and innovation institutional-grade.

The shared market graph includes all credit unions, relevant startups, vendors, CUSOs, executives, regulations, products, funding events, integrations, and public relationships.

The Terminal enables institutions and individuals to discover, understand, discuss, partner, pilot, integrate, invest, and monitor.

Capital is one workflow, not the platform's sole purpose.


# 45. Cooperative Markets Interpretation — Design Implications

- The concept must be represented through explicit schemas and contracts.
- The implementation must preserve source attribution, permissions, and audit.
- Domain-specific variation must remain in cartridges or configuration.
- Model outputs must remain subordinate to structured truth and workflow state.
- Failure, uncertainty, and conflict must be visible and testable.


# 45. Cooperative Markets Interpretation — Acceptance Criteria

A conforming implementation:
1. uses canonical terminology,
2. preserves provenance,
3. enforces tenancy and permissions,
4. records relevant events and audit,
5. exposes confidence where applicable,
6. supports cartridge extension,
7. avoids hidden business logic in the interface,
8. includes regression tests,
9. records cost for intelligent execution,
10. updates current-state and handoff documentation.


# 46. Auric Works Interpretation

Auric Works operates the system and may also participate through advisory, management, partnerships, investment vehicles, CUSOs, services, or execution.

Company economics must remain separable from platform truth. Recommendations must disclose relevant conflicts or economic interests.


# 46. Auric Works Interpretation — Design Implications

- The concept must be represented through explicit schemas and contracts.
- The implementation must preserve source attribution, permissions, and audit.
- Domain-specific variation must remain in cartridges or configuration.
- Model outputs must remain subordinate to structured truth and workflow state.
- Failure, uncertainty, and conflict must be visible and testable.


# 46. Auric Works Interpretation — Acceptance Criteria

A conforming implementation:
1. uses canonical terminology,
2. preserves provenance,
3. enforces tenancy and permissions,
4. records relevant events and audit,
5. exposes confidence where applicable,
6. supports cartridge extension,
7. avoids hidden business logic in the interface,
8. includes regression tests,
9. records cost for intelligent execution,
10. updates current-state and handoff documentation.


# 47. The Auric Interpretation

The Auric earns attention through concise institutional intelligence.

Core formats:
- bi-daily Brief
- Market
- Network
- $2 Bill
- deeper memos
- multimedia renderings

The publication is free or broadly accessible where useful. It feeds profile refinement, relationship activity, and Terminal adoption.


# 47. The Auric Interpretation — Design Implications

- The concept must be represented through explicit schemas and contracts.
- The implementation must preserve source attribution, permissions, and audit.
- Domain-specific variation must remain in cartridges or configuration.
- Model outputs must remain subordinate to structured truth and workflow state.
- Failure, uncertainty, and conflict must be visible and testable.


# 47. The Auric Interpretation — Acceptance Criteria

A conforming implementation:
1. uses canonical terminology,
2. preserves provenance,
3. enforces tenancy and permissions,
4. records relevant events and audit,
5. exposes confidence where applicable,
6. supports cartridge extension,
7. avoids hidden business logic in the interface,
8. includes regression tests,
9. records cost for intelligent execution,
10. updates current-state and handoff documentation.


# 48. Terminal Interpretation

A named Terminal is configured from the institution profile, people profiles, goals, cartridges, private data, market graph, and relationship graph.

The Terminal must support both organization-wide and individual operating capacity.

Its intelligence improves as access, corrections, interactions, documents, workflows, and outcomes increase.


# 48. Terminal Interpretation — Design Implications

- The concept must be represented through explicit schemas and contracts.
- The implementation must preserve source attribution, permissions, and audit.
- Domain-specific variation must remain in cartridges or configuration.
- Model outputs must remain subordinate to structured truth and workflow state.
- Failure, uncertainty, and conflict must be visible and testable.


# 48. Terminal Interpretation — Acceptance Criteria

A conforming implementation:
1. uses canonical terminology,
2. preserves provenance,
3. enforces tenancy and permissions,
4. records relevant events and audit,
5. exposes confidence where applicable,
6. supports cartridge extension,
7. avoids hidden business logic in the interface,
8. includes regression tests,
9. records cost for intelligent execution,
10. updates current-state and handoff documentation.


# 49. Dispatch as a Service

Dispatch may be configured as a private operating brain for a customer.

Dispatch as a Service includes:
- private knowledge graph
- model harness
- cartridge configuration
- workflow orchestration
- profile management
- intelligence generation
- communications between Auric Works and the customer
- metered cost and usage
- controlled frontier escalation

The service must retain the same constitutional boundaries.


# 49. Dispatch as a Service — Design Implications

- The concept must be represented through explicit schemas and contracts.
- The implementation must preserve source attribution, permissions, and audit.
- Domain-specific variation must remain in cartridges or configuration.
- Model outputs must remain subordinate to structured truth and workflow state.
- Failure, uncertainty, and conflict must be visible and testable.


# 49. Dispatch as a Service — Acceptance Criteria

A conforming implementation:
1. uses canonical terminology,
2. preserves provenance,
3. enforces tenancy and permissions,
4. records relevant events and audit,
5. exposes confidence where applicable,
6. supports cartridge extension,
7. avoids hidden business logic in the interface,
8. includes regression tests,
9. records cost for intelligent execution,
10. updates current-state and handoff documentation.


# 50. Constitutional Change

The Constitution should change rarely.

A change requires:
- documented problem
- proposed amendment
- impact analysis
- migration implications
- approval by Auric Works architecture owner
- ADR
- version increment
- repository-wide reference update

Routine features must not amend the Constitution.


# 50. Constitutional Change — Design Implications

- The concept must be represented through explicit schemas and contracts.
- The implementation must preserve source attribution, permissions, and audit.
- Domain-specific variation must remain in cartridges or configuration.
- Model outputs must remain subordinate to structured truth and workflow state.
- Failure, uncertainty, and conflict must be visible and testable.


# 50. Constitutional Change — Acceptance Criteria

A conforming implementation:
1. uses canonical terminology,
2. preserves provenance,
3. enforces tenancy and permissions,
4. records relevant events and audit,
5. exposes confidence where applicable,
6. supports cartridge extension,
7. avoids hidden business logic in the interface,
8. includes regression tests,
9. records cost for intelligent execution,
10. updates current-state and handoff documentation.


# 51. Final Operating Rule

Dispatch must continuously increase the ability of a person, institution, company, or relationship to understand its environment and execute the next valuable action with greater confidence, lower friction, and better memory.

When uncertain where a feature belongs, ask:
- Is it truth?
- Is it an object?
- Is it a relationship?
- Is it a profile?
- Is it intelligence?
- Is it a cartridge?
- Is it a workflow?
- Is it a rendering?
- Is it domain-specific?
- Is it truly kernel-level?

Place it at the lowest correct layer.


# 51. Final Operating Rule — Design Implications

- The concept must be represented through explicit schemas and contracts.
- The implementation must preserve source attribution, permissions, and audit.
- Domain-specific variation must remain in cartridges or configuration.
- Model outputs must remain subordinate to structured truth and workflow state.
- Failure, uncertainty, and conflict must be visible and testable.


# 51. Final Operating Rule — Acceptance Criteria

A conforming implementation:
1. uses canonical terminology,
2. preserves provenance,
3. enforces tenancy and permissions,
4. records relevant events and audit,
5. exposes confidence where applicable,
6. supports cartridge extension,
7. avoids hidden business logic in the interface,
8. includes regression tests,
9. records cost for intelligent execution,
10. updates current-state and handoff documentation.

# Appendix A. Constitutional Compliance Review

This appendix converts constitutional principles into mandatory review criteria. It is normative unless a later approved specification narrows the requirement without contradicting the Constitution.

## 1. Kernel Boundary

A conforming implementation must define the kernel boundary contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when kernel boundary is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the kernel boundary implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.

## 2. Truth And Provenance

A conforming implementation must define the truth and provenance contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when truth and provenance is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the truth and provenance implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.

## 3. Tenancy

A conforming implementation must define the tenancy contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when tenancy is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the tenancy implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.

## 4. Audit

A conforming implementation must define the audit contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when audit is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the audit implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.

## 5. Cartridge Isolation

A conforming implementation must define the cartridge isolation contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when cartridge isolation is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the cartridge isolation implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.

## 6. Model Routing

A conforming implementation must define the model routing contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when model routing is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the model routing implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.

## 7. Cost Controls

A conforming implementation must define the cost controls contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when cost controls is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the cost controls implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.

## 8. Evaluation

A conforming implementation must define the evaluation contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when evaluation is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the evaluation implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.


# Appendix B. Object Design Standard

This appendix converts constitutional principles into mandatory review criteria. It is normative unless a later approved specification narrows the requirement without contradicting the Constitution.

## 1. Identity

A conforming implementation must define the identity contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when identity is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the identity implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.

## 2. Lifecycle

A conforming implementation must define the lifecycle contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when lifecycle is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the lifecycle implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.

## 3. Schema

A conforming implementation must define the schema contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when schema is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the schema implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.

## 4. Relationships

A conforming implementation must define the relationships contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when relationships is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the relationships implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.

## 5. Events

A conforming implementation must define the events contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when events is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the events implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.

## 6. Permissions

A conforming implementation must define the permissions contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when permissions is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the permissions implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.

## 7. Retention

A conforming implementation must define the retention contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when retention is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the retention implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.

## 8. Deduplication

A conforming implementation must define the deduplication contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when deduplication is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the deduplication implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.


# Appendix C. Relationship Design Standard

This appendix converts constitutional principles into mandatory review criteria. It is normative unless a later approved specification narrows the requirement without contradicting the Constitution.

## 1. Participants

A conforming implementation must define the participants contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when participants is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the participants implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.

## 2. Relationship Type

A conforming implementation must define the relationship type contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when relationship type is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the relationship type implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.

## 3. Stage

A conforming implementation must define the stage contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when stage is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the stage implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.

## 4. Evidence

A conforming implementation must define the evidence contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when evidence is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the evidence implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.

## 5. Confidence

A conforming implementation must define the confidence contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when confidence is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the confidence implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.

## 6. Activity

A conforming implementation must define the activity contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when activity is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the activity implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.

## 7. Next Action

A conforming implementation must define the next action contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when next action is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the next action implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.

## 8. Outcome

A conforming implementation must define the outcome contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when outcome is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the outcome implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.


# Appendix D. Profile Design Standard

This appendix converts constitutional principles into mandatory review criteria. It is normative unless a later approved specification narrows the requirement without contradicting the Constitution.

## 1. Public Facts

A conforming implementation must define the public facts contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when public facts is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the public facts implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.

## 2. Private Context

A conforming implementation must define the private context contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when private context is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the private context implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.

## 3. Goals

A conforming implementation must define the goals contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when goals is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the goals implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.

## 4. Roles

A conforming implementation must define the roles contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when roles is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the roles implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.

## 5. Cartridge State

A conforming implementation must define the cartridge state contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when cartridge state is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the cartridge state implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.

## 6. Activity

A conforming implementation must define the activity contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when activity is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the activity implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.

## 7. Gaps

A conforming implementation must define the gaps contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when gaps is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the gaps implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.

## 8. Recommendations

A conforming implementation must define the recommendations contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when recommendations is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the recommendations implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.


# Appendix E. Intelligence Object Standard

This appendix converts constitutional principles into mandatory review criteria. It is normative unless a later approved specification narrows the requirement without contradicting the Constitution.

## 1. Source Claims

A conforming implementation must define the source claims contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when source claims is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the source claims implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.

## 2. Affected Entities

A conforming implementation must define the affected entities contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when affected entities is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the affected entities implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.

## 3. Importance

A conforming implementation must define the importance contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when importance is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the importance implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.

## 4. Lens

A conforming implementation must define the lens contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when lens is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the lens implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.

## 5. Action

A conforming implementation must define the action contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when action is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the action implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.

## 6. Confidence

A conforming implementation must define the confidence contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when confidence is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the confidence implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.

## 7. Expiration

A conforming implementation must define the expiration contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when expiration is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the expiration implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.

## 8. Renderings

A conforming implementation must define the renderings contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when renderings is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the renderings implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.


# Appendix F. Connector Constitutional Standard

This appendix converts constitutional principles into mandatory review criteria. It is normative unless a later approved specification narrows the requirement without contradicting the Constitution.

## 1. Source Identity

A conforming implementation must define the source identity contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when source identity is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the source identity implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.

## 2. Access Method

A conforming implementation must define the access method contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when access method is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the access method implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.

## 3. Terms

A conforming implementation must define the terms contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when terms is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the terms implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.

## 4. Refresh

A conforming implementation must define the refresh contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when refresh is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the refresh implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.

## 5. Normalization

A conforming implementation must define the normalization contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when normalization is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the normalization implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.

## 6. Raw Evidence

A conforming implementation must define the raw evidence contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when raw evidence is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the raw evidence implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.

## 7. Change Detection

A conforming implementation must define the change detection contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when change detection is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the change detection implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.

## 8. Failure Handling

A conforming implementation must define the failure handling contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when failure handling is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the failure handling implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.


# Appendix G. Cartridge Constitutional Standard

This appendix converts constitutional principles into mandatory review criteria. It is normative unless a later approved specification narrows the requirement without contradicting the Constitution.

## 1. Manifest

A conforming implementation must define the manifest contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when manifest is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the manifest implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.

## 2. Dependencies

A conforming implementation must define the dependencies contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when dependencies is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the dependencies implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.

## 3. Objects

A conforming implementation must define the objects contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when objects is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the objects implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.

## 4. Rules

A conforming implementation must define the rules contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when rules is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the rules implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.

## 5. Prompts

A conforming implementation must define the prompts contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when prompts is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the prompts implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.

## 6. Workflows

A conforming implementation must define the workflows contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when workflows is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the workflows implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.

## 7. Permissions

A conforming implementation must define the permissions contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when permissions is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the permissions implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.

## 8. Evaluations

A conforming implementation must define the evaluations contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when evaluations is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the evaluations implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.


# Appendix H. Workflow Constitutional Standard

This appendix converts constitutional principles into mandatory review criteria. It is normative unless a later approved specification narrows the requirement without contradicting the Constitution.

## 1. Trigger

A conforming implementation must define the trigger contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when trigger is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the trigger implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.

## 2. State Machine

A conforming implementation must define the state machine contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when state machine is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the state machine implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.

## 3. Owners

A conforming implementation must define the owners contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when owners is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the owners implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.

## 4. Gates

A conforming implementation must define the gates contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when gates is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the gates implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.

## 5. Evidence

A conforming implementation must define the evidence contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when evidence is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the evidence implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.

## 6. Exceptions

A conforming implementation must define the exceptions contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when exceptions is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the exceptions implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.

## 7. Retry

A conforming implementation must define the retry contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when retry is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the retry implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.

## 8. Outcome

A conforming implementation must define the outcome contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when outcome is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the outcome implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.


# Appendix I. Model Route Standard

This appendix converts constitutional principles into mandatory review criteria. It is normative unless a later approved specification narrows the requirement without contradicting the Constitution.

## 1. Task Class

A conforming implementation must define the task class contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when task class is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the task class implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.

## 2. Stakes

A conforming implementation must define the stakes contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when stakes is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the stakes implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.

## 3. Privacy

A conforming implementation must define the privacy contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when privacy is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the privacy implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.

## 4. Complexity

A conforming implementation must define the complexity contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when complexity is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the complexity implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.

## 5. Latency

A conforming implementation must define the latency contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when latency is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the latency implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.

## 6. Cost

A conforming implementation must define the cost contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when cost is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the cost implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.

## 7. Confidence

A conforming implementation must define the confidence contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when confidence is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the confidence implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.

## 8. Escalation

A conforming implementation must define the escalation contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when escalation is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the escalation implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.


# Appendix J. Human Review Standard

This appendix converts constitutional principles into mandatory review criteria. It is normative unless a later approved specification narrows the requirement without contradicting the Constitution.

## 1. Review Reason

A conforming implementation must define the review reason contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when review reason is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the review reason implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.

## 2. Expert Role

A conforming implementation must define the expert role contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when expert role is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the expert role implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.

## 3. Evidence Packet

A conforming implementation must define the evidence packet contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when evidence packet is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the evidence packet implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.

## 4. Decision

A conforming implementation must define the decision contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when decision is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the decision implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.

## 5. Annotation

A conforming implementation must define the annotation contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when annotation is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the annotation implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.

## 6. Override

A conforming implementation must define the override contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when override is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the override implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.

## 7. Audit

A conforming implementation must define the audit contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when audit is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the audit implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.

## 8. Calibration

A conforming implementation must define the calibration contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when calibration is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the calibration implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.


# Appendix K. Publication Standard

This appendix converts constitutional principles into mandatory review criteria. It is normative unless a later approved specification narrows the requirement without contradicting the Constitution.

## 1. Base Object

A conforming implementation must define the base object contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when base object is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the base object implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.

## 2. Role Lens

A conforming implementation must define the role lens contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when role lens is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the role lens implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.

## 3. Institution Lens

A conforming implementation must define the institution lens contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when institution lens is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the institution lens implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.

## 4. Channel Lens

A conforming implementation must define the channel lens contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when channel lens is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the channel lens implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.

## 5. Brevity

A conforming implementation must define the brevity contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when brevity is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the brevity implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.

## 6. Attribution

A conforming implementation must define the attribution contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when attribution is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the attribution implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.

## 7. Action

A conforming implementation must define the action contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when action is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the action implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.

## 8. Feedback

A conforming implementation must define the feedback contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when feedback is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the feedback implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.


# Appendix L. Terminal Standard

This appendix converts constitutional principles into mandatory review criteria. It is normative unless a later approved specification narrows the requirement without contradicting the Constitution.

## 1. Institution Config

A conforming implementation must define the institution config contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when institution config is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the institution config implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.

## 2. People

A conforming implementation must define the people contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when people is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the people implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.

## 3. Roles

A conforming implementation must define the roles contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when roles is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the roles implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.

## 4. Private Graph

A conforming implementation must define the private graph contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when private graph is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the private graph implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.

## 5. Feed

A conforming implementation must define the feed contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when feed is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the feed implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.

## 6. Search

A conforming implementation must define the search contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when search is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the search implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.

## 7. Cartridges

A conforming implementation must define the cartridges contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when cartridges is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the cartridges implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.

## 8. Workflows

A conforming implementation must define the workflows contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when workflows is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the workflows implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.


# Appendix M. Public Graph Standard

This appendix converts constitutional principles into mandatory review criteria. It is normative unless a later approved specification narrows the requirement without contradicting the Constitution.

## 1. Public Entity

A conforming implementation must define the public entity contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when public entity is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the public entity implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.

## 2. Public Claim

A conforming implementation must define the public claim contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when public claim is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the public claim implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.

## 3. Licensed Field

A conforming implementation must define the licensed field contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when licensed field is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the licensed field implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.

## 4. Derived Metric

A conforming implementation must define the derived metric contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when derived metric is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the derived metric implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.

## 5. Public Relationship

A conforming implementation must define the public relationship contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when public relationship is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the public relationship implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.

## 6. Freshness

A conforming implementation must define the freshness contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when freshness is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the freshness implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.

## 7. Visibility

A conforming implementation must define the visibility contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when visibility is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the visibility implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.

## 8. Correction

A conforming implementation must define the correction contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when correction is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the correction implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.


# Appendix N. Private Graph Standard

This appendix converts constitutional principles into mandatory review criteria. It is normative unless a later approved specification narrows the requirement without contradicting the Constitution.

## 1. Tenant Ownership

A conforming implementation must define the tenant ownership contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when tenant ownership is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the tenant ownership implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.

## 2. Purpose Limitation

A conforming implementation must define the purpose limitation contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when purpose limitation is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the purpose limitation implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.

## 3. Role Access

A conforming implementation must define the role access contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when role access is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the role access implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.

## 4. Field Sensitivity

A conforming implementation must define the field sensitivity contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when field sensitivity is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the field sensitivity implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.

## 5. Retention

A conforming implementation must define the retention contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when retention is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the retention implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.

## 6. Export

A conforming implementation must define the export contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when export is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the export implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.

## 7. Deletion

A conforming implementation must define the deletion contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when deletion is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the deletion implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.

## 8. Sharing

A conforming implementation must define the sharing contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when sharing is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the sharing implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.


# Appendix O. Evaluation Standard

This appendix converts constitutional principles into mandatory review criteria. It is normative unless a later approved specification narrows the requirement without contradicting the Constitution.

## 1. Fixture

A conforming implementation must define the fixture contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when fixture is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the fixture implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.

## 2. Expected Output

A conforming implementation must define the expected output contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when expected output is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the expected output implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.

## 3. Source Fidelity

A conforming implementation must define the source fidelity contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when source fidelity is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the source fidelity implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.

## 4. Calibration

A conforming implementation must define the calibration contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when calibration is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the calibration implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.

## 5. Regression

A conforming implementation must define the regression contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when regression is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the regression implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.

## 6. Cost

A conforming implementation must define the cost contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when cost is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the cost implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.

## 7. Latency

A conforming implementation must define the latency contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when latency is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the latency implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.

## 8. Human Rating

A conforming implementation must define the human rating contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when human rating is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the human rating implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.


# Appendix P. Repository Standard

This appendix converts constitutional principles into mandatory review criteria. It is normative unless a later approved specification narrows the requirement without contradicting the Constitution.

## 1. Root Instructions

A conforming implementation must define the root instructions contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when root instructions is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the root instructions implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.

## 2. Current State

A conforming implementation must define the current state contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when current state is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the current state implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.

## 3. Active Build

A conforming implementation must define the active build contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when active build is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the active build implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.

## 4. Context Pack

A conforming implementation must define the context pack contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when context pack is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the context pack implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.

## 5. Adr

A conforming implementation must define the ADR contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when ADR is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the ADR implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.

## 6. Registry

A conforming implementation must define the registry contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when registry is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the registry implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.

## 7. Tests

A conforming implementation must define the tests contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when tests is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the tests implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.

## 8. Handoff

A conforming implementation must define the handoff contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when handoff is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the handoff implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.


# Appendix Q. Cooperative Markets Constitutional Mapping

This appendix converts constitutional principles into mandatory review criteria. It is normative unless a later approved specification narrows the requirement without contradicting the Constitution.

## 1. Credit Union

A conforming implementation must define the credit union contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when credit union is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the credit union implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.

## 2. Startup

A conforming implementation must define the startup contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when startup is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the startup implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.

## 3. Vendor

A conforming implementation must define the vendor contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when vendor is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the vendor implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.

## 4. Cuso

A conforming implementation must define the CUSO contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when CUSO is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the CUSO implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.

## 5. Executive

A conforming implementation must define the executive contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when executive is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the executive implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.

## 6. Regulation

A conforming implementation must define the regulation contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when regulation is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the regulation implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.

## 7. Investment

A conforming implementation must define the investment contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when investment is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the investment implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.

## 8. Relationship

A conforming implementation must define the relationship contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when relationship is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the relationship implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.


# Appendix R. Failure and Recovery Standard

This appendix converts constitutional principles into mandatory review criteria. It is normative unless a later approved specification narrows the requirement without contradicting the Constitution.

## 1. Source Unavailable

A conforming implementation must define the source unavailable contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when source unavailable is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the source unavailable implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.

## 2. Parser Failure

A conforming implementation must define the parser failure contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when parser failure is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the parser failure implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.

## 3. Model Failure

A conforming implementation must define the model failure contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when model failure is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the model failure implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.

## 4. Conflict

A conforming implementation must define the conflict contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when conflict is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the conflict implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.

## 5. Workflow Timeout

A conforming implementation must define the workflow timeout contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when workflow timeout is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the workflow timeout implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.

## 6. Permission Denial

A conforming implementation must define the permission denial contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when permission denial is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the permission denial implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.

## 7. Cost Limit

A conforming implementation must define the cost limit contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when cost limit is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the cost limit implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.

## 8. Human Escalation

A conforming implementation must define the human escalation contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when human escalation is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the human escalation implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.


# Appendix S. Data Lifecycle Standard

This appendix converts constitutional principles into mandatory review criteria. It is normative unless a later approved specification narrows the requirement without contradicting the Constitution.

## 1. Acquire

A conforming implementation must define the acquire contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when acquire is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the acquire implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.

## 2. Normalize

A conforming implementation must define the normalize contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when normalize is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the normalize implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.

## 3. Verify

A conforming implementation must define the verify contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when verify is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the verify implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.

## 4. Enrich

A conforming implementation must define the enrich contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when enrich is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the enrich implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.

## 5. Publish

A conforming implementation must define the publish contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when publish is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the publish implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.

## 6. Execute

A conforming implementation must define the execute contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when execute is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the execute implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.

## 7. Retain

A conforming implementation must define the retain contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when retain is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the retain implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.

## 8. Expire

A conforming implementation must define the expire contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when expire is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the expire implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.


# Appendix T. Constitutional Review Checklist

This appendix converts constitutional principles into mandatory review criteria. It is normative unless a later approved specification narrows the requirement without contradicting the Constitution.

## 1. Purpose

A conforming implementation must define the purpose contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when purpose is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the purpose implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.

## 2. Correct Layer

A conforming implementation must define the correct layer contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when correct layer is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the correct layer implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.

## 3. Canonical Language

A conforming implementation must define the canonical language contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when canonical language is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the canonical language implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.

## 4. Provenance

A conforming implementation must define the provenance contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when provenance is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the provenance implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.

## 5. Security

A conforming implementation must define the security contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when security is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the security implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.

## 6. Audit

A conforming implementation must define the audit contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when audit is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the audit implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.

## 7. Cost

A conforming implementation must define the cost contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when cost is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the cost implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.

## 8. Evaluation

A conforming implementation must define the evaluation contract explicitly rather than relying on convention or interface behavior. The contract must identify ownership, inputs, outputs, lifecycle, permissions, provenance, events, failure states, observability, cost implications, and acceptance tests.

The implementation must answer:

- What canonical object or subsystem owns this concern?
- Which facts, claims, rules, or configurations control behavior?
- Which events are emitted when state changes?
- Which actors, roles, tenants, or cartridges may read or modify it?
- What happens when required data is missing, stale, contradictory, unauthorized, or too expensive to process?
- What evidence allows a reviewer to reproduce the result?
- Which automated tests and evaluation fixtures prove conformance?
- Which ADR governs any irreversible choice?

The implementation is nonconforming when evaluation is hidden in presentation code, embedded only in prompts, inferred from undocumented conventions, or dependent on one model provider. It is also nonconforming when a result cannot be traced to its inputs or when a private fact can enter the shared graph without explicit authority.

For Cooperative Markets, the evaluation implementation must support both sides of the market: institutions becoming more innovative and innovation becoming institutional-grade. For other domains, the same constitutional mechanics apply through different cartridges. The kernel contract remains unchanged.
