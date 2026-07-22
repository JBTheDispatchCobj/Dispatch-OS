# FS-15007 — Terminal Editions & Configuration Model
## Packaging One External Product Without Fragmenting the Platform

**Section:** FS-15000 — The Auric, Named Terminal & Institutional Network Flywheel  
**Document:** 15007  
**Status:** V1 Content-Complete Release Specification  
**Authority:** Controlling doctrine for Named Terminal editions, capability packaging, configuration boundaries, upgrade paths, partner modes, and deployment patterns  
**Applies to:** Network, Studio, Enterprise, Partner, and Developer configurations; commercial packaging; feature enablement; cartridges; user types; hosting; governance; support; pricing inputs; and product expansion

---

# 1. Purpose

This document defines how Auric Works packages and configures the Named Terminal without turning the product into a collection of disconnected offerings.

The Named Terminal is the single external product.

Different customers, partners, institutions, and companies may require different levels of:

- intelligence
- configuration
- workflow depth
- private data
- connectors
- governance
- customization
- development access
- managed service
- network administration
- deployment control

Those differences should be expressed through controlled editions, capability bundles, cartridges, permissions, service levels, and configuration—not separate product identities that obscure the operating model.

The governing doctrine is:

**One external product. Multiple controlled configurations. Shared operating architecture. Different depths of institutional ownership, extensibility, governance, and service.**

---

# 2. Why Editions Are Necessary

A credit union with a small innovation team does not need the same operating depth as:

- a corporate credit union
- a national association
- a large fintech
- an implementation partner
- an enterprise institution
- a developer ecosystem
- a CUSO network

Without editions, the product risks becoming either:

- too simple for advanced users
- too complex for ordinary users
- too expensive for early adoption
- too fragmented for product coherence

Editions allow the Named Terminal to scale across customer types while preserving:

- common objects
- shared workflows
- common security
- public intelligence
- profile identity
- network participation
- common governance
- consistent product logic

---

# 3. Edition Doctrine

Editions should define depth, not identity.

A Named Terminal should still feel like the same product regardless of configuration.

Editions may differ by:

- private data depth
- number of users
- number of cartridges
- connector access
- workflow automation
- custom configuration
- admin controls
- model routing
- hosting
- support
- partner capabilities
- developer access
- analytics
- security
- service level

Editions must not create inconsistent truth, permission, or evidence standards.

---

# 4. Proposed Edition Family

## 4.1 Named Terminal — Network

Designed for:

- public or lightly permissioned participants
- fintechs
- vendors
- CUSOs
- smaller institutions
- association members
- market participants beginning profile and readiness work

Primary value:

- public and claimed profile
- Auric intelligence
- watchlists
- network identity
- basic readiness
- opportunity visibility
- limited evidence
- limited engagement workflows
- relationship participation

Network should be the low-friction entry point into the product.

It should create value before deep integration.

## 4.2 Named Terminal — Studio

Designed for:

- fintechs
- vendors
- CUSOs
- consultants
- small institutional teams
- product teams
- operators configuring repeatable workflows

Primary value:

- richer private profile
- evidence organization
- readiness work
- workflow configuration
- dashboards
- reports
- limited cartridge configuration
- controlled collaboration
- private opportunity management

Studio allows a participant to configure its operating environment without requiring full enterprise deployment.

## 4.3 Named Terminal — Enterprise

Designed for:

- credit unions
- banks
- corporate credit unions
- large CUSOs
- large fintechs
- regulated institutions
- organizations requiring deeper governance

Primary value:

- private institutional profile
- multiple workspaces
- multiple cartridges
- connectors
- advanced workflows
- evidence and approval
- audit
- private reports
- board and executive workspaces
- enterprise security
- managed implementation
- service-level commitments

Enterprise is the primary institutional operating environment.

## 4.4 Named Terminal — Partner

Designed for:

- associations
- corporate credit unions
- implementation firms
- advisory firms
- capital partners
- managed-service providers
- ecosystem operators

Primary value:

- manage multiple organizations
- administer shared programs
- configure permitted workflows
- manage member onboarding
- deliver intelligence
- operate partner cartridges
- support evidence and readiness
- administer governed engagement
- measure network outcomes

Partner must not automatically grant access to member-private data.

## 4.5 Named Terminal — Developer

Designed for:

- technical partners
- enterprise developers
- internal product teams
- approved external developers
- cartridge developers
- connector developers

Primary value:

- SDK access
- sandbox
- schemas
- APIs
- event contracts
- test fixtures
- extension tools
- cartridge development
- connector development
- observability
- deployment controls

Developer is not a separate market-facing product.

It is an extension surface for building inside the Named Terminal and Dispatch architecture.

---

# 5. Editions as Capability Bundles

Each edition should be represented as a capability bundle.

Potential capability families:

- public profile
- claimed profile
- private profile
- Auric feed
- private intelligence
- search
- network relationships
- readiness
- evidence
- opportunities
- workflows
- approvals
- audit
- dashboards
- reports
- connectors
- cartridges
- developer tools
- partner administration
- managed service
- private hosting
- custom branding
- advanced security

The system should know which capabilities are:

- included
- optional
- restricted
- metered
- partner-enabled
- admin-controlled
- contract-controlled
- regulator-sensitive

---

# 6. Edition Configuration Rules

Each Terminal edition should define:

- eligible customer types
- default capabilities
- optional capabilities
- excluded capabilities
- user limits
- storage limits
- workflow limits
- connector limits
- model-use limits
- cartridge limits
- branding depth
- network participation
- support level
- implementation requirement
- governance requirement
- security baseline
- data residency options
- contract type

Configuration should be machine-readable in the 100% pass.

---

# 7. Capability Inheritance

Edition design should use inheritance.

Example:

Network  
→ adds Studio capabilities  
→ adds Enterprise capabilities  
→ Partner and Developer branch from controlled foundations

This reduces duplication.

A higher edition should generally inherit:

- identity
- profiles
- intelligence
- network
- evidence standards
- security
- audit
- core workflows

Higher editions add depth, control, and extensibility.

---

# 8. Cartridges and Editions

Cartridges should be licensed or enabled independently where appropriate.

Examples:

- Credit Union Institutional Core
- Fintech Readiness
- Vendor Oversight
- Exam Response
- Loan Participation
- Wealth
- Insurance
- Mortgage
- Commercial Banking
- Private Credit
- Hospitality
- Board Governance

An edition may determine:

- how many cartridges are available
- whether cartridges are configurable
- whether private cartridges are permitted
- whether custom cartridges are permitted
- whether partner-distributed cartridges are permitted

Cartridges should not become separate product brands unless there is a clear strategic reason.

---

# 9. User and Workspace Depth

Edition differences may affect:

- number of users
- number of roles
- number of workspaces
- board access
- committee access
- guest access
- external reviewer access
- partner access
- multi-entity access
- cross-tenant administration

User limits should not weaken minimum governance.

Even a light edition must preserve:

- identity
- permission
- evidence
- approval
- audit

---

# 10. Data and Connector Depth

Edition differences may affect:

- manual upload
- email ingestion
- calendar ingestion
- SFTP
- public datasets
- API connectors
- database connectors
- webhook access
- real-time sync
- custom connectors
- private hosting

Connector availability must still depend on:

- security review
- tenant authorization
- scope
- data classification
- contractual rights
- operational support

---

# 11. Workflow and Automation Depth

Potential levels:

## Basic

- guided tasks
- manual evidence
- standard templates
- simple approvals

## Advanced

- multi-step workflows
- role routing
- event triggers
- automated evidence collection
- dashboards
- workflow analytics

## Enterprise

- custom workflows
- multi-agent orchestration
- long-running processes
- integration with systems of record
- exception handling
- audit
- complex approval chains

## Partner

- reusable program workflows
- member onboarding
- multi-organization administration
- controlled shared reporting
- partner service delivery

---

# 12. Branding Depth

Branding may range from:

- logo and display name
- custom colors
- custom domain
- custom navigation language
- custom reports
- branded communications
- branded public profile
- full partner presentation

Branding must never obscure:

- legal responsibility
- privacy terms
- commercial disclosure
- editorial identity
- Dispatch-powered governance
- support accountability

---

# 13. Hosting and Deployment Modes

Potential modes:

- multi-tenant SaaS
- dedicated tenant
- private cloud
- institution-managed cloud
- on-premise or hybrid where justified
- partner-hosted controlled deployment

Deployment mode may vary by edition.

The operating model should preserve:

- common schemas
- common security baseline
- update path
- audit
- supportability
- portability
- version control

---

# 14. Support and Managed Service

Support may include:

- self-service
- standard support
- guided onboarding
- managed configuration
- managed operations
- dedicated success
- implementation partner
- enterprise support
- strategic advisory

Managed service is strategically important because many customers do not want to operate the full system themselves.

The Terminal should support a model where Auric Works or a partner:

- configures
- maintains
- monitors
- improves
- supports
- reports

without taking unauthorized institutional decision authority.

---

# 15. Pricing Inputs

Pricing may consider:

- edition
- users
- institutions
- assets
- employees
- cartridges
- connectors
- workflows
- storage
- usage
- model costs
- managed service
- support
- implementation
- partner access
- transaction or execution fees where permitted

Pricing should not require customers to understand internal technical cost structures.

Pricing should align with institutional value and operating depth.

---

# 16. Upgrade Paths

A customer should be able to move naturally from:

Network  
→ Studio  
→ Enterprise  
→ Partner or Developer capabilities where applicable

Upgrade triggers may include:

- profile claim
- readiness work
- increased users
- private data
- active workflows
- additional cartridges
- connectors
- board use
- partner programs
- security requirements
- regulated engagement

The system should preserve:

- identity
- profile
- evidence
- relationships
- workflows
- history
- outcomes

during upgrade.

---

# 17. Downgrade and Termination

Downgrade should define:

- retained capabilities
- disabled capabilities
- data access
- workflow closure
- evidence access
- export
- public profile state
- network state
- support
- retention

Termination should not erase:

- accurate public record
- permitted shared engagement history
- audit required by law or contract
- verified outcomes where publication rights remain

Private data must follow contractual retention and destruction rules.

---

# 18. Partner Edition Governance

Partner Terminals require special controls.

A partner may be allowed to:

- onboard members
- configure permitted workflows
- deliver approved services
- view authorized data
- manage shared programs
- distribute content
- operate partner cartridges

A partner may not automatically:

- access all member-private data
- approve regulated actions
- change core security
- alter public profiles
- override editorial governance
- export network data without authority

Partner authority must be explicit and purpose-bound.

---

# 19. Developer Edition Governance

Developer access should distinguish:

- sandbox
- development
- testing
- production
- tenant-specific extensions
- shared extensions
- public marketplace extensions

Developer capabilities may include:

- schema access
- API access
- event subscriptions
- test fixtures
- local tools
- cartridge packaging
- connector packaging
- validation
- deployment request

Production access requires:

- review
- security approval
- compatibility validation
- permission validation
- rollback
- support owner

---

# 20. Edition Entitlement Model

Every user and tenant should derive access from entitlements.

Entitlements may include:

- capability
- object
- workflow
- connector
- cartridge
- report
- dashboard
- environment
- API
- support level
- usage limit

Entitlements should be versioned and auditable.

Commercial entitlement must never bypass policy or approval controls.

---

# 21. Edition Change Governance

Edition changes may affect:

- data access
- workflows
- integrations
- security
- support
- billing
- network access
- private features

Changes should require:

- request
- eligibility
- commercial approval
- security review where needed
- configuration change
- user communication
- migration
- audit

---

# 22. What Editions Must Never Become

Editions must not become:

- unrelated products
- confusing bundles
- artificial feature fragmentation
- governance tiers where low-paying users receive unsafe controls
- hidden data-use differences
- pay-to-win matching
- pay-to-edit public truth
- arbitrary naming sprawl
- custom deployments that cannot be maintained
- partner authority without accountability

---

# 23. Success Criteria

The edition model succeeds when:

- the Named Terminal remains one coherent product
- customers can start small and expand
- advanced users receive depth without forcing complexity on others
- governance remains consistent
- cartridges extend value
- partners can operate programs safely
- developers can extend the system safely
- commercial packaging aligns with operating value
- upgrades preserve identity and history
- branding does not obscure accountability

---

# 24. Acceptance Criteria

This specification is satisfied when:

1. Every Named Terminal maps to a defined edition.
2. Editions differ by depth and entitlement, not truth or governance.
3. Capabilities are machine-configurable.
4. Upgrade and downgrade paths preserve records.
5. Partner access remains purpose-bound.
6. Developer access remains environment-controlled.
7. Cartridges extend editions without fragmenting the product.
8. Hosting options preserve common standards.
9. Pricing inputs align with capability and service depth.
10. Commercial entitlement cannot bypass institutional controls.
11. Low-friction entry exists for companies and institutions.
12. Enterprise depth exists for regulated institutional operation.
13. Edition changes are versioned and auditable.
14. The market-facing identity remains the Named Terminal.

---

# 25. Cross-Section Integration

This document integrates with:

- **FS-5100:** edition, entitlement, capability, cartridge, connector, and role registries.
- **FS-6000:** profiles, permissions, approvals, evidence, and institutional objects.
- **FS-7000:** demo and pilot configurations.
- **FS-8000:** connector and data-entitlement depth.
- **FS-9000:** network and private graph visibility.
- **FS-10000:** workspace and navigation enablement.
- **FS-11000:** workflow, agent, tool, and model entitlement.
- **FS-12000:** IAM, security, tenant isolation, partner access, and configuration governance.
- **FS-13000:** packaging, pricing, onboarding, support, partners, renewal, and expansion.
- **FS-14000:** deployment, migration, release, and versioning.
- **FS-15006:** Named Terminal product model.

---

# 26. Remaining Work to Reach 100%

The completion pass must add:

- edition registry
- capability catalog
- entitlement schema
- edition manifest schema
- feature inheritance matrix
- cartridge entitlement matrix
- connector entitlement matrix
- user and workspace limits
- hosting matrix
- support-level matrix
- pricing-input model
- upgrade and downgrade workflow
- partner authority matrix
- developer environment matrix
- sample edition manifests
- sample upgrade trace
- API and event contracts
- acceptance-test catalog
- configuration runbook
- entitlement operations runbook
- partner/developer governance runbook
- validation report
- release manifest
- integrity index

---

# 27. Controlling Statement

Auric Works should sell one external product: the Named Terminal.

Network, Studio, Enterprise, Partner, and Developer describe controlled operating depth, not separate product identities.

Every edition should inherit the same institutional truth, evidence, approval, security, and audit principles.

The product wins when participants can enter with low friction, expand without re-platforming, and receive the depth appropriate to their role while Dispatch OS remains the shared operating architecture beneath every experience.

---

# 28. V1 Canonical Edition Registry

The following edition IDs are canonical for V1. Display names may be branded, but IDs are stable and must be used in manifests, contracts, telemetry, billing, and migration records.

| Edition ID | Display Name | Primary Tenant Class | Inheritance Parent | Default Deployment | Canonical Purpose |
|---|---|---|---|---|---|
| `edition.network.v1` | Named Terminal — Network | participant, fintech, vendor, CUSO, small institution | none | multi-tenant SaaS | Low-friction identity, intelligence, readiness, and network participation |
| `edition.studio.v1` | Named Terminal — Studio | company, operator, small team | `edition.network.v1` | multi-tenant SaaS | Private operating configuration, evidence, workflow, and reporting depth |
| `edition.enterprise.v1` | Named Terminal — Enterprise | regulated institution, large company, large CUSO | `edition.studio.v1` | dedicated or multi-tenant | Governed institutional operating environment with connectors, approvals, audit, and managed implementation |
| `edition.partner.v1` | Named Terminal — Partner | association, corporate CU, implementation partner, MSP | `edition.enterprise.v1` capability foundation | dedicated or multi-tenant | Purpose-bound multi-organization program administration without implicit member-private access |
| `edition.developer.v1` | Named Terminal — Developer | approved technical partner or internal development team | controlled extension of Network, Studio, Enterprise, or Partner | sandbox plus approved promotion path | SDK, schemas, APIs, events, fixtures, cartridge and connector development |

Edition identity is independent from tenant branding. A tenant may display “Alloya Terminal” while its active edition remains `edition.partner.v1`.

# 29. Capability Catalog

Every capability has one canonical ID, security classification, enablement owner, and metering rule.

| Capability ID | Family | Minimum Edition | Default State | Metering | Governance Notes |
|---|---|---|---|---|---|
| `cap.profile.public` | profile | Network | included | none | Public fields only; editorial and provenance rules apply |
| `cap.profile.claimed` | profile | Network | included | none | Requires claim verification and audit |
| `cap.profile.private` | profile | Studio | included | storage | Tenant-private, field-level permissions |
| `cap.auric.feed` | intelligence | Network | included | none | Editorial separation applies |
| `cap.intelligence.private` | intelligence | Studio | included | usage | Tenant context and permission controls |
| `cap.search.network` | search | Network | included | fair use | Visibility follows graph policy |
| `cap.relationships.manage` | network | Studio | included | none | Relationship provenance required |
| `cap.readiness.basic` | readiness | Network | included | none | No final regulated determination |
| `cap.readiness.advanced` | readiness | Studio | optional | assessment | Evidence-backed scoring |
| `cap.evidence.workspace` | evidence | Studio | included | storage | Evidence lineage and retention required |
| `cap.opportunity.workspace` | opportunity | Studio | included | none | Eligibility and disclosure rules apply |
| `cap.workflow.standard` | workflow | Studio | included | workflow executions | Standard workflow catalog only |
| `cap.workflow.custom` | workflow | Enterprise | optional | workflow executions | Requires validation and approval |
| `cap.approval.governed` | approval | Enterprise | included | none | Human authority mandatory |
| `cap.audit.enterprise` | audit | Enterprise | included | storage | Immutable audit retention policy |
| `cap.dashboard.builder` | analytics | Studio | optional | none | Data-contract validation required |
| `cap.report.private` | reporting | Studio | included | generated reports | Export controls apply |
| `cap.connector.standard` | connector | Enterprise | optional | connector plus usage | Security review required |
| `cap.connector.custom` | connector | Enterprise | contract-controlled | implementation plus support | Production certification required |
| `cap.cartridge.standard` | cartridge | Studio | optional | cartridge license | Registry validation required |
| `cap.cartridge.custom` | cartridge | Enterprise | contract-controlled | implementation plus license | Compatibility and governance review |
| `cap.partner.admin` | administration | Partner | included | managed organizations | Purpose-bound delegated authority |
| `cap.developer.sdk` | developer | Developer | included | API usage | Sandbox by default |
| `cap.developer.production` | developer | Developer | restricted | deployment | Security, compatibility, and rollback approval |
| `cap.hosting.dedicated` | hosting | Enterprise | optional | infrastructure | Contract and operational controls |
| `cap.hosting.private` | hosting | Enterprise | restricted | infrastructure and support | Architecture review required |
| `cap.branding.advanced` | branding | Partner | optional | setup | Cannot obscure accountability |
| `cap.managed.service` | service | Studio | optional | service retainer | No unauthorized institutional authority |

# 30. Canonical Edition Manifest Schema

Every tenant edition must be represented by a versioned manifest conforming to the following contract.

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "dispatch://schemas/terminal-edition-manifest/1.0.0",
  "title": "Terminal Edition Manifest",
  "type": "object",
  "required": [
    "manifest_id",
    "tenant_id",
    "edition_id",
    "version",
    "status",
    "effective_at",
    "capabilities",
    "limits",
    "deployment",
    "support",
    "governance"
  ],
  "properties": {
    "manifest_id": {"type": "string", "pattern": "^tem-[a-z0-9-]+$"},
    "tenant_id": {"type": "string", "minLength": 1},
    "edition_id": {
      "type": "string",
      "enum": [
        "edition.network.v1",
        "edition.studio.v1",
        "edition.enterprise.v1",
        "edition.partner.v1",
        "edition.developer.v1"
      ]
    },
    "version": {"type": "string", "pattern": "^[0-9]+\\.[0-9]+\\.[0-9]+$"},
    "status": {"type": "string", "enum": ["draft", "pending_approval", "active", "suspended", "superseded", "terminated"]},
    "effective_at": {"type": "string", "format": "date-time"},
    "expires_at": {"type": ["string", "null"], "format": "date-time"},
    "inherits_from": {"type": ["string", "null"]},
    "capabilities": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["capability_id", "state", "source"],
        "properties": {
          "capability_id": {"type": "string"},
          "state": {"type": "string", "enum": ["included", "optional_enabled", "restricted_enabled", "disabled", "suspended"]},
          "source": {"type": "string", "enum": ["edition_default", "contract", "admin", "partner_program", "migration"]},
          "meter_id": {"type": ["string", "null"]},
          "effective_at": {"type": "string", "format": "date-time"}
        },
        "additionalProperties": false
      }
    },
    "limits": {
      "type": "object",
      "required": ["users", "workspaces", "cartridges", "connectors", "storage_gb", "monthly_workflow_runs", "monthly_model_units"],
      "properties": {
        "users": {"type": ["integer", "string"], "minimum": 1},
        "workspaces": {"type": ["integer", "string"], "minimum": 1},
        "cartridges": {"type": ["integer", "string"], "minimum": 0},
        "connectors": {"type": ["integer", "string"], "minimum": 0},
        "storage_gb": {"type": ["number", "string"], "minimum": 0},
        "monthly_workflow_runs": {"type": ["integer", "string"], "minimum": 0},
        "monthly_model_units": {"type": ["integer", "string"], "minimum": 0}
      },
      "additionalProperties": false
    },
    "deployment": {
      "type": "object",
      "required": ["mode", "region", "data_residency", "environment_class"],
      "properties": {
        "mode": {"type": "string", "enum": ["multi_tenant_saas", "dedicated_tenant", "private_cloud", "institution_managed_cloud", "hybrid", "on_premise"]},
        "region": {"type": "string"},
        "data_residency": {"type": "array", "items": {"type": "string"}},
        "environment_class": {"type": "string", "enum": ["standard", "regulated", "restricted"]}
      },
      "additionalProperties": false
    },
    "support": {
      "type": "object",
      "required": ["level", "managed_service", "response_profile_id"],
      "properties": {
        "level": {"type": "string", "enum": ["self_service", "standard", "guided", "enterprise", "strategic"]},
        "managed_service": {"type": "boolean"},
        "response_profile_id": {"type": "string"}
      },
      "additionalProperties": false
    },
    "governance": {
      "type": "object",
      "required": ["security_baseline_id", "approval_policy_id", "data_policy_id", "authority_profile_id"],
      "properties": {
        "security_baseline_id": {"type": "string"},
        "approval_policy_id": {"type": "string"},
        "data_policy_id": {"type": "string"},
        "authority_profile_id": {"type": "string"}
      },
      "additionalProperties": false
    }
  },
  "additionalProperties": false
}
```

# 31. Entitlement Object Schema

Entitlements are additive only within policy boundaries. A commercial entitlement never overrides a security, classification, approval, or regulatory restriction.

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "dispatch://schemas/terminal-entitlement/1.0.0",
  "type": "object",
  "required": ["entitlement_id", "tenant_id", "subject_type", "subject_id", "resource_type", "resource_id", "action", "decision", "source", "effective_at"],
  "properties": {
    "entitlement_id": {"type": "string", "pattern": "^ent-[a-z0-9-]+$"},
    "tenant_id": {"type": "string"},
    "subject_type": {"type": "string", "enum": ["tenant", "role", "user", "partner", "service_account"]},
    "subject_id": {"type": "string"},
    "resource_type": {"type": "string", "enum": ["capability", "object", "workflow", "connector", "cartridge", "report", "dashboard", "environment", "api", "support_level"]},
    "resource_id": {"type": "string"},
    "action": {"type": "string", "enum": ["view", "use", "configure", "administer", "develop", "deploy", "export"]},
    "decision": {"type": "string", "enum": ["allow", "deny", "conditional"]},
    "conditions": {"type": "array", "items": {"type": "string"}},
    "source": {"type": "string", "enum": ["edition", "contract", "policy", "partner_delegation", "temporary_exception"]},
    "effective_at": {"type": "string", "format": "date-time"},
    "expires_at": {"type": ["string", "null"], "format": "date-time"},
    "approved_by": {"type": ["string", "null"]},
    "audit_event_id": {"type": "string"}
  },
  "additionalProperties": false
}
```

# 32. Edition Inheritance and Override Rules

1. Inheritance is deterministic and versioned.
2. Child editions inherit all mandatory governance controls from their parent.
3. A child may add capability depth but may not remove mandatory identity, permission, evidence, approval, audit, or provenance controls.
4. Tenant overrides may narrow access without additional approval.
5. Tenant overrides that broaden access require commercial eligibility, security validation, and policy approval.
6. Contract clauses may enable restricted capabilities only when the relevant technical and governance prerequisites pass.
7. Partner and Developer are controlled branches, not simple “higher tiers.”
8. Conflicts resolve in this order: legal restriction → security policy → data classification → approval policy → edition manifest → contract entitlement → admin preference.

## 32.1 Inheritance Matrix

| Capability Family | Network | Studio | Enterprise | Partner | Developer |
|---|---|---|---|---|---|
| Public/claimed profile | mandatory | inherited | inherited | inherited | inherited from host tenant |
| Private profile | limited | standard | advanced | purpose-bound | test/sandbox only unless approved |
| Evidence | basic | standard | advanced | delegated program scope | fixture/test scope |
| Workflows | guided | standard | custom eligible | reusable program workflows | author/test/deploy by approval |
| Approvals | basic acknowledgments | standard | complex governed chains | delegated but purpose-bound | deployment approvals only |
| Connectors | none/manual | limited | standard/custom eligible | approved shared connectors | connector SDK and sandbox |
| Multi-organization administration | no | no | optional group structure | yes | no implicit tenant access |
| Production deployment tools | no | no | admin only | limited program admin | restricted and approval-gated |

# 33. Default Edition Limits

Default limits are commercial starting points and may be changed only through approved manifest versions.

| Limit | Network | Studio | Enterprise | Partner | Developer |
|---|---:|---:|---:|---:|---:|
| Named users | 5 | 25 | contract | contract | 10 developers per workspace |
| Workspaces | 1 | 5 | contract | contract | 3 environments per project |
| Active cartridges | 1 | 5 | contract | contract | test cartridges unlimited, production by approval |
| Active connectors | 0 | 3 | contract | contract | sandbox connectors unlimited, production by approval |
| Storage | 5 GB | 100 GB | contract | contract | 50 GB sandbox default |
| Monthly workflow runs | 100 | 2,500 | contract | contract | 5,000 test runs |
| Monthly model units | fair-use | metered | metered | metered | metered sandbox |

“Contract” means the limit is explicitly stored, not absent or unlimited by implication.

# 34. Cartridge and Connector Entitlement Matrix

Every enabled cartridge or connector requires a registry record in FS-5100.

| Resource | Network | Studio | Enterprise | Partner | Developer |
|---|---|---|---|---|---|
| Standard public cartridge | view/use | use | use | distribute if authorized | inspect/test |
| Standard private cartridge | no | optional | optional | administer if delegated | develop/test |
| Custom tenant cartridge | no | no | allowed by contract | allowed for managed program | develop; production approval required |
| Partner-distributed cartridge | consume if eligible | consume if eligible | consume if eligible | publish/administer by approval | develop/test |
| Manual upload connector | included | included | included | included | fixture only |
| Standard API connector | no | limited | allowed | allowed by program | sandbox/build |
| Custom connector | no | no | allowed by approval | allowed by approval | build/test/deploy by approval |
| Real-time event connector | no | limited | allowed | allowed by program | event sandbox |

# 35. Hosting and Deployment Decision Table

| Condition | Allowed Mode | Required Reviews | Minimum Edition |
|---|---|---|---|
| Public/light private data, standard controls | multi-tenant SaaS | standard security | Network |
| Moderate private data, standard connectors | multi-tenant SaaS or dedicated tenant | security and privacy | Studio |
| Regulated institutional data and custom connectors | dedicated tenant or approved private cloud | architecture, security, vendor risk, BCP/DR | Enterprise |
| Contractual residency requirement | approved regional dedicated/private deployment | legal, privacy, operations | Enterprise |
| Partner administration across organizations | multi-tenant with strict delegated tenancy or dedicated partner tenant | tenant-isolation and delegation review | Partner |
| Development and extension work | sandbox; isolated test; gated production promotion | application security and compatibility | Developer |
| On-premise or hybrid | only where justified and supportable | executive architecture exception and operations plan | Enterprise |

# 36. Support-Level Matrix

| Support ID | Coverage | Initial Response Target | Named Owner | Managed Operations | Eligible Editions |
|---|---|---|---|---|---|
| `support.self.v1` | documentation and community resources | best effort | customer | no | Network, Developer sandbox |
| `support.standard.v1` | business-hours support | 1 business day | support queue | no | Studio |
| `support.guided.v1` | onboarding and configuration assistance | 8 business hours | success manager | limited | Studio, Enterprise |
| `support.enterprise.v1` | production incidents and operational coordination | severity-based, including 1-hour Sev-1 | named support lead | optional | Enterprise, Partner |
| `support.strategic.v1` | dedicated success, roadmap, governance review | contract | named executive owner | yes | Enterprise, Partner |

Service-level targets must be tied to FS-13000 support contracts and FS-12000 incident classifications.

# 37. Pricing Input Model

Pricing records must distinguish the following components:

- platform fee
- setup and implementation
- managed service
- usage and pass-through model/infrastructure costs
- cartridges
- connectors
- support level
- dedicated or private hosting
- partner administration
- transaction or execution revenue where legally permitted

```json
{
  "pricing_configuration_id": "price-example-enterprise-001",
  "edition_id": "edition.enterprise.v1",
  "currency": "USD",
  "platform_fee": {"cadence": "monthly", "amount": 0, "contract_defined": true},
  "implementation_fee": {"type": "fixed_or_milestone", "contract_defined": true},
  "managed_service_fee": {"cadence": "monthly", "enabled": true, "contract_defined": true},
  "usage": {
    "model_cost_policy": "pass_through_plus_contract_margin",
    "connector_usage_policy": "metered_where_applicable",
    "storage_policy": "included_then_metered"
  },
  "transaction_revenue": {
    "enabled": false,
    "requires_legal_approval": true,
    "requires_separate_schedule": true
  }
}
```

No pricing state may change editorial ranking, public truth, eligibility scoring, or regulated approval outcomes.

# 38. Upgrade State Machine

```text
REQUESTED
  -> ELIGIBILITY_REVIEW
  -> COMMERCIAL_REVIEW
  -> SECURITY_REVIEW (conditional)
  -> CONFIGURATION_PLAN
  -> CUSTOMER_APPROVAL
  -> MIGRATION_READY
  -> ACTIVATING
  -> ACTIVE

Any state -> REJECTED
Any state -> CANCELLED
ACTIVATING -> ROLLBACK_REQUIRED -> PRIOR_EDITION_RESTORED
```

## 38.1 Upgrade Preconditions

- current manifest is active and valid
- target edition exists in the edition registry
- required security baseline is met
- required connectors and cartridges are approved
- data migration plan exists where needed
- billing and contract changes are approved
- tenant administrator acknowledges changed capabilities
- rollback path is documented

## 38.2 Preservation Requirements

The upgrade must preserve tenant identity, profile records, evidence lineage, relationship history, workflow history, approvals, audit records, and verified outcomes. No object ID may be reissued solely due to an edition change.

# 39. Downgrade and Termination State Machine

```text
REQUESTED
  -> IMPACT_ASSESSMENT
  -> DATA_AND_WORKFLOW_PLAN
  -> CUSTOMER_CONFIRMATION
  -> EXPORT_WINDOW
  -> CAPABILITY_REDUCTION
  -> RETENTION_ENFORCEMENT
  -> DOWNGRADED

TERMINATION_REQUESTED
  -> LEGAL_AND_RETENTION_REVIEW
  -> EXPORT_WINDOW
  -> ACCESS_REVOCATION
  -> DATA_DISPOSITION
  -> TERMINATED
```

Open regulated workflows must be completed, transferred, or formally closed before disabling required approval and evidence capabilities.

# 40. Partner Authority Matrix

| Partner Action | Default | Conditions |
|---|---|---|
| Invite an organization to a program | allowed | program authority and invitation scope |
| Configure approved program workflow | conditional | workflow registry and tenant consent |
| View member-private data | denied | explicit tenant delegation, purpose, fields, duration |
| Approve regulated action | denied | cannot be enabled by edition entitlement alone |
| Submit evidence for a tenant | conditional | evidence source and attestation captured |
| Export multi-tenant data | denied | explicit legal basis, tenant scope, export policy |
| Publish or alter public profile facts | denied | profile owner or editorial process required |
| Operate shared reports | conditional | aggregation and privacy rules |
| Suspend a member tenant | denied | Auric Works platform authority only unless contract explicitly delegates limited program access |

Delegations must be represented as expiring, revocable entitlement objects with an auditable purpose.

# 41. Developer Environment Matrix

| Environment | Data | Permitted Actions | Prohibited Actions | Promotion Requirement |
|---|---|---|---|---|
| local | synthetic only | build, unit test, schema validation | live credentials, production data | none |
| sandbox | synthetic or approved masked data | integration test, event test, fixture validation | regulated final action, unrestricted export | sandbox approval |
| test | masked or approved test tenant data | end-to-end and compatibility testing | production traffic | QA and security checks |
| staging | production-like controlled data | release candidate validation | unapproved external access | release approval |
| production | tenant-authorized data | approved runtime operations only | ad hoc debugging, uncontrolled schema change | change approval and rollback plan |

# 42. API Contracts

## 42.1 Edition Manifest

- `GET /v1/tenants/{tenant_id}/edition-manifest`
- `POST /v1/tenants/{tenant_id}/edition-change-requests`
- `GET /v1/edition-change-requests/{request_id}`
- `POST /v1/edition-change-requests/{request_id}/approve`
- `POST /v1/edition-change-requests/{request_id}/cancel`

## 42.2 Entitlements

- `GET /v1/tenants/{tenant_id}/entitlements`
- `POST /v1/tenants/{tenant_id}/entitlements/evaluate`
- `POST /v1/tenants/{tenant_id}/delegations`
- `DELETE /v1/tenants/{tenant_id}/delegations/{delegation_id}`

## 42.3 Configuration

- `GET /v1/editions`
- `GET /v1/editions/{edition_id}/capabilities`
- `GET /v1/tenants/{tenant_id}/configuration-diff`
- `POST /v1/tenants/{tenant_id}/configuration/validate`

Every write endpoint requires idempotency, actor identity, reason, and audit event creation.

# 43. Event Contracts

| Event Type | Producer | Required Payload | Consumers |
|---|---|---|---|
| `terminal.edition_change.requested.v1` | commercial/admin service | request ID, tenant, current edition, target edition, actor | workflow engine, billing, security |
| `terminal.edition_change.approved.v1` | approval service | request ID, approvals, effective date | configuration service |
| `terminal.edition_change.activated.v1` | configuration service | old/new manifest IDs, migration result | audit, billing, analytics |
| `terminal.edition_change.failed.v1` | configuration service | failure code, rollback status | operations, support |
| `terminal.entitlement.changed.v1` | entitlement service | entitlement ID, before/after, actor | IAM, UI, audit |
| `terminal.delegation.granted.v1` | partner governance | delegation, scope, expiry | IAM, audit, notifications |
| `terminal.delegation.revoked.v1` | partner governance | delegation ID, reason, actor | IAM, audit, notifications |
| `terminal.limit.threshold_reached.v1` | metering service | meter, current value, threshold | tenant admin, billing, support |

# 44. Decision Tables

## 44.1 Capability Enablement

| Condition | Decision |
|---|---|
| Capability included by edition and no policy denial | enable |
| Capability optional, contract present, prerequisites pass | enable |
| Capability restricted and security/legal approval missing | deny |
| Capability commercially purchased but classification policy denies | deny |
| Partner delegation expired | deny and revoke active access |
| Developer production deployment lacks rollback owner | deny |
| Tenant limit exceeded | block new use or meter according to contract; never silently discard data |

## 44.2 Edition Eligibility

| Target | Minimum Conditions |
|---|---|
| Network | verified identity or approved participant account |
| Studio | claimed profile, tenant admin, private-data terms |
| Enterprise | institutional sponsor, security baseline, implementation owner, contract |
| Partner | program authority, delegated-governance design, tenant-isolation review |
| Developer | approved developer identity, agreement, environment controls |

# 45. Analytics and Telemetry

Required metrics:

- tenants by edition and status
- edition conversion rate
- upgrade and downgrade cycle time
- failed configuration changes
- entitlement-denial reasons
- capability adoption by edition
- active cartridges and connectors
- limit-threshold events
- managed-service utilization
- partner delegation count and expiry rate
- developer promotion success rate
- edition-level gross margin inputs
- support load by edition
- downgrade and termination reasons

Telemetry must not expose tenant-private data across tenants. Commercial analytics must remain separate from editorial ranking and public truth.

# 46. Sample Enterprise Manifest

```json
{
  "manifest_id": "tem-example-cu-001",
  "tenant_id": "tenant-example-cu",
  "edition_id": "edition.enterprise.v1",
  "version": "1.0.0",
  "status": "active",
  "effective_at": "2026-07-22T00:00:00Z",
  "expires_at": null,
  "inherits_from": "edition.studio.v1",
  "capabilities": [
    {"capability_id": "cap.profile.private", "state": "included", "source": "edition_default", "meter_id": null, "effective_at": "2026-07-22T00:00:00Z"},
    {"capability_id": "cap.workflow.custom", "state": "optional_enabled", "source": "contract", "meter_id": "meter.workflow.enterprise", "effective_at": "2026-07-22T00:00:00Z"},
    {"capability_id": "cap.approval.governed", "state": "included", "source": "edition_default", "meter_id": null, "effective_at": "2026-07-22T00:00:00Z"}
  ],
  "limits": {
    "users": 250,
    "workspaces": 20,
    "cartridges": 12,
    "connectors": 25,
    "storage_gb": 1000,
    "monthly_workflow_runs": 50000,
    "monthly_model_units": 1000000
  },
  "deployment": {
    "mode": "dedicated_tenant",
    "region": "us-central",
    "data_residency": ["US"],
    "environment_class": "regulated"
  },
  "support": {
    "level": "enterprise",
    "managed_service": true,
    "response_profile_id": "support.enterprise.v1"
  },
  "governance": {
    "security_baseline_id": "security.regulated.v1",
    "approval_policy_id": "approval.institutional.v1",
    "data_policy_id": "data.regulated-us.v1",
    "authority_profile_id": "authority.human-final.v1"
  }
}
```

# 47. Sample Upgrade Trace

```json
{
  "request_id": "ecr-example-001",
  "tenant_id": "tenant-example-fintech",
  "from_edition": "edition.studio.v1",
  "to_edition": "edition.enterprise.v1",
  "states": [
    {"state": "requested", "at": "2026-07-22T14:00:00Z", "actor": "user-tenant-admin"},
    {"state": "eligibility_review", "at": "2026-07-22T14:05:00Z", "result": "pass"},
    {"state": "commercial_review", "at": "2026-07-22T16:00:00Z", "result": "pass"},
    {"state": "security_review", "at": "2026-07-23T15:00:00Z", "result": "pass"},
    {"state": "configuration_plan", "at": "2026-07-24T10:00:00Z", "result": "approved"},
    {"state": "activating", "at": "2026-07-25T02:00:00Z"},
    {"state": "active", "at": "2026-07-25T02:11:00Z", "manifest_id": "tem-example-fintech-002"}
  ],
  "preservation_checks": {
    "object_ids_preserved": true,
    "evidence_lineage_preserved": true,
    "workflow_history_preserved": true,
    "relationships_preserved": true,
    "audit_history_preserved": true
  }
}
```

# 48. Validation Rules

A release validator must confirm:

1. Every manifest references a canonical edition ID.
2. Every capability exists in the FS-5100 capability registry.
3. Every cartridge, connector, workflow, report, dashboard, and API entitlement resolves to FS-5100.
4. Every role and permission resolves to FS-6000 and FS-12000.
5. Every UI capability maps to a valid FS-10000 route or workspace.
6. Every workflow and agent entitlement resolves to FS-11000.
7. Every deployment mode maps to FS-13000 and FS-14000 controls.
8. No commercial entitlement overrides a deny decision from policy.
9. Partner access is tenant-, purpose-, object-, field-, and time-bounded.
10. Developer production access requires approved environment promotion.
11. Upgrade and downgrade traces preserve immutable IDs and audit history.
12. Termination applies retention and export rules before destruction.
13. Public, private, synthetic, attested, inferred, and agent-generated data classes remain distinct.
14. Unknown and stale data remain visible after edition changes.

# 49. Failure and Exception Matrix

| Failure | Required Behavior |
|---|---|
| Unknown edition ID | reject manifest; do not activate |
| Missing capability registry entry | reject capability and manifest validation |
| Circular edition inheritance | reject release |
| Conflicting entitlement decisions | apply precedence rules and log conflict |
| Failed connector prerequisite | leave connector disabled; preserve prior state |
| Partial upgrade | rollback or enter explicit degraded state; never silently mark active |
| Expired partner delegation | revoke access immediately and notify owners |
| Metering outage | continue according to contract grace policy; do not lose usage records |
| Billing failure | do not disable safety, evidence, approval, or audit controls |
| Downgrade with open regulated workflow | block downgrade until closure or transfer plan |
| Termination export failure | extend controlled export window and escalate |

# 50. Acceptance Test Catalog

| Test ID | Scenario | Expected Result |
|---|---|---|
| `FS15007-T001` | Create valid Network manifest | validates and activates |
| `FS15007-T002` | Enable Enterprise-only capability on Network without approval | rejected |
| `FS15007-T003` | Commercial entitlement conflicts with security deny | deny wins |
| `FS15007-T004` | Upgrade Studio to Enterprise | identity, evidence, workflows, and history preserved |
| `FS15007-T005` | Downgrade with open regulated workflow | blocked pending closure plan |
| `FS15007-T006` | Partner requests undelegated member-private field | denied and audited |
| `FS15007-T007` | Developer promotes connector without rollback owner | denied |
| `FS15007-T008` | Edition inheritance loop | release validation fails |
| `FS15007-T009` | Unknown capability ID | manifest validation fails |
| `FS15007-T010` | Termination with retention obligation | obligated records retained, private data disposition tracked |
| `FS15007-T011` | Limit reached | contract behavior applied without data loss |
| `FS15007-T012` | Branding removes legal attribution | configuration rejected |
| `FS15007-T013` | Partner delegation expires | access revoked automatically |
| `FS15007-T014` | Upgrade activation fails | rollback completes and prior manifest remains authoritative |
| `FS15007-T015` | Provenance classes after migration | classes remain distinguishable |

# 51. Configuration Runbook

1. Identify tenant class and use case.
2. Select the lowest edition that safely supports the required operating depth.
3. Generate a draft edition manifest.
4. Resolve all capabilities against FS-5100.
5. Map roles, approvals, and permissions to FS-6000 and FS-12000.
6. Validate routes and workspaces against FS-10000.
7. Validate runtime resources against FS-11000.
8. Review connectors and data classes under FS-8000.
9. Select deployment and support profiles from FS-13000 and FS-14000.
10. Run schema, dependency, entitlement, and migration validation.
11. Obtain required commercial, security, and tenant approvals.
12. Activate through the edition-change workflow.
13. Verify telemetry, audit events, billing, and access behavior.
14. Store the superseded manifest as historical and noncanonical.

# 52. Entitlement Operations Runbook

- Evaluate entitlements at request time and material workflow transitions.
- Cache only with bounded time-to-live and policy invalidation.
- Record the policy version used in every decision.
- Revoke expired or terminated delegations automatically.
- Reconcile entitlements daily against edition, contract, policy, and user status.
- Escalate orphaned, conflicting, or nonresolving entitlements.
- Never resolve ambiguity in favor of broader access.
- Retain entitlement decision evidence according to audit policy.

# 53. Partner and Developer Governance Runbook

## Partner

- create program scope
- define participating tenants
- obtain tenant delegations
- define permitted objects, fields, workflows, reports, and exports
- configure expiry and revocation
- test tenant isolation
- activate with named partner owner and Auric Works owner
- review quarterly or on material change

## Developer

- verify developer identity and agreement
- issue sandbox credentials
- provide synthetic fixtures
- validate schemas and dependencies
- run security and compatibility checks
- approve staging promotion
- approve production promotion with rollback owner
- monitor deployment and revoke credentials when no longer required

# 54. Migration Guidance

Legacy commercial plans must be translated into edition manifests without changing customer rights silently.

Migration steps:

1. Inventory legacy features, users, connectors, cartridges, support, hosting, and contractual rights.
2. Map each feature to a canonical capability ID.
3. Identify rights that are narrower or broader than edition defaults.
4. Create explicit contract entitlements for valid deviations.
5. Reject legacy deviations that violate current security, authority, or data policy.
6. Generate a dry-run configuration diff.
7. Obtain tenant acknowledgment for material changes.
8. Activate with rollback.
9. Preserve legacy plan name as an alias, not a second product identity.

# 55. Operational Readiness Checklist

- edition registry version approved
- capability catalog approved
- manifest and entitlement schemas parse
- no circular inheritance
- default limits configured
- support profiles configured
- pricing components separated
- entitlement policy precedence tested
- partner isolation tested
- developer promotion controls tested
- upgrade and downgrade traces validated
- billing and metering events validated
- audit events validated
- rollback tested
- runbooks assigned to owners

# 56. V1 Release Manifest

```json
{
  "document_id": "FS-15007",
  "title": "Terminal Editions & Configuration Model",
  "version": "1.0.0",
  "status": "v1_content_complete",
  "canonical": true,
  "supersedes": "15007_TERMINAL_EDITIONS_CONFIGURATION_MODEL_75_PERCENT.md",
  "required_dependencies": [
    "FS-5100",
    "FS-6000",
    "FS-7000",
    "FS-8000",
    "FS-9000",
    "FS-10000",
    "FS-11000",
    "FS-12000",
    "FS-13000",
    "FS-14000",
    "FS-15006"
  ],
  "implementation_artifacts_included": [
    "edition registry",
    "capability catalog",
    "manifest schema",
    "entitlement schema",
    "inheritance matrix",
    "limit matrix",
    "cartridge and connector matrix",
    "hosting matrix",
    "support matrix",
    "pricing input model",
    "upgrade and downgrade state machines",
    "partner authority matrix",
    "developer environment matrix",
    "API contracts",
    "event contracts",
    "decision tables",
    "fixtures",
    "acceptance tests",
    "runbooks",
    "migration guidance"
  ],
  "validation_status": "documentation_complete_pending_software_execution"
}
```

# 57. Validation Report

```json
{
  "document_id": "FS-15007",
  "version": "1.0.0",
  "validation": {
    "baseline_doctrine_preserved": true,
    "edition_registry_defined": true,
    "capability_catalog_defined": true,
    "manifest_schema_defined": true,
    "entitlement_schema_defined": true,
    "inheritance_rules_defined": true,
    "upgrade_downgrade_defined": true,
    "partner_governance_defined": true,
    "developer_governance_defined": true,
    "api_and_events_defined": true,
    "fixtures_defined": true,
    "acceptance_tests_defined": true,
    "runbooks_defined": true,
    "cross_section_dependencies_declared": true
  },
  "documentation_status": "pass",
  "software_tests_executed": false,
  "live_integrations_tested": false,
  "production_readiness_approved": false
}
```

# 58. Integrity Index

| Artifact | Version | Canonical Status |
|---|---|---|
| FS-15007 narrative and doctrine | 1.0.0 | canonical |
| Edition registry | 1.0.0 | canonical |
| Capability catalog | 1.0.0 | canonical |
| Terminal edition manifest schema | 1.0.0 | canonical |
| Entitlement schema | 1.0.0 | canonical |
| Inheritance and limits matrices | 1.0.0 | canonical |
| Partner and developer governance controls | 1.0.0 | canonical |
| API and event contracts | 1.0.0 | canonical |
| Acceptance test catalog | 1.0.0 | canonical specification, not executed software test |
| Configuration and governance runbooks | 1.0.0 | canonical |
| 75% baseline | historical | superseded, noncanonical |

# 59. Final V1 Certification

FS-15007 is content-complete for V1 when used as the controlling specification for Named Terminal edition packaging and configuration.

It certifies one coherent external product with controlled depth across Network, Studio, Enterprise, Partner, and Developer configurations. It does not permit commercial packaging to weaken truth, evidence, approval, security, audit, provenance, or human decision authority.

This certification is documentation completion. Software implementation, live entitlement enforcement, billing integration, deployment promotion, penetration testing, and production readiness require execution under FS-11000, FS-12000, FS-13000, and FS-14000.
