# 6001 — Institution Profile Schema V1 Complete

## Purpose

The Institution Profile is the canonical root object for every financial institution, CUSO, fintech, vendor, regulated operating company, capital participant, regulator, and network partner represented in Dispatch.

It acts as the permanent institutional digital twin used by the Terminal, knowledge graph, workflow router, agents, opportunity engine, evidence system, approvals, dashboards, reports, search, and commercialization layer.

## Design Principles

- One canonical profile per legal or operational institution.
- Public, tenant-private, uploaded, connected, attested, and inferred facts remain distinguishable.
- Every material field supports source, confidence, freshness, owner, version, and visibility metadata.
- Missing and stale data are explicit.
- The profile stores current and historical state.
- Legal entity, brand, branch, subsidiary, and CUSO relationships remain distinct.
- Profile data never bypasses tenant or object permissions.
- Institution-specific overrides are versioned and auditable.
- Opportunity and readiness outputs link back to source evidence.
- The same schema supports both sparse public profiles and rich private profiles.

## Canonical Institution Object

```json
{
  "institution_id": "ORG-000001",
  "profile_version": "1.0.0",
  "identity": {},
  "legal_structure": {},
  "regulatory_identity": {},
  "geography": {},
  "financial_profile": {},
  "executive_graph": [],
  "board_graph": [],
  "organization_structure": [],
  "member_customer_profile": {},
  "product_stack": [],
  "vendor_stack": [],
  "systems_profile": [],
  "data_profile": {},
  "regulatory_profile": {},
  "strategic_priorities": [],
  "risk_profile": {},
  "readiness_scores": {},
  "opportunities": [],
  "relationships": [],
  "workflows": [],
  "documents": [],
  "evidence": [],
  "approvals": [],
  "dashboards": [],
  "activity_timeline": [],
  "audit_history": [],
  "status": "active"
}
```

## Identity

Required fields:

- institution_id
- legal_name
- display_name
- institution_type
- operating_status
- primary_website
- headquarters
- country
- source_state

Conditional fields:

- DBA
- parent institution
- legal entity identifier
- routing number
- tax identifier reference
- charter number
- FDIC certificate
- NCUA charter ID
- state license
- SEC/FINRA identifier
- insurance license
- NMLS identifier
- entity formation date
- year founded
- fiscal year end

## Institution Types

- Credit Union
- Corporate Credit Union
- Bank
- Bank Holding Company
- CUSO
- Fintech
- Vendor
- RIA
- Broker-Dealer
- Insurance Agency
- Carrier
- Mortgage Lender
- Servicer
- Private Fund
- Venture Fund
- Private Credit Manager
- Private Equity Firm
- Capital Markets Intermediary
- Regulator
- Trade Association
- Government Agency
- Operating Company

## Legal Structure

Fields:

- legal entity name
- entity type
- jurisdiction
- parent
- subsidiaries
- CUSOs
- brands
- affiliates
- ownership structure
- control relationships
- merger/acquisition history
- dissolution/closure status
- effective dates

## Geography

Fields:

- headquarters
- branch locations
- service area
- field of membership
- states/jurisdictions served
- metropolitan areas
- counties
- markets
- digital-only footprint
- geolocation confidence
- branch status

## Financial Profile

Core fields:

- assets
- loans
- deposits/shares
- capital/net worth
- net worth ratio
- revenue
- net income
- ROA
- ROE
- efficiency ratio
- liquidity
- net interest margin
- cost of funds
- loan growth
- deposit growth
- delinquency
- charge-offs
- investment portfolio
- CUSO investments
- fee income
- operating expense
- loan mix
- deposit mix
- concentrations
- trend history

Every metric includes:

```json
{
  "metric_id": "",
  "value": 0,
  "unit": "",
  "period_start": "",
  "period_end": "",
  "as_of": "",
  "source_type": "",
  "source_reference": "",
  "calculation": "",
  "confidence": "high|medium|low",
  "freshness": "current|aging|stale",
  "approved": false
}
```

## Executive Graph

Links to Executive Profile objects:

- CEO
- president
- COO
- CFO
- CIO
- CTO
- CLO
- CRO
- CCO
- chief digital officer
- chief retail officer
- chief commercial officer
- chief experience officer
- department heads
- relationship owners
- approvers
- committee members

Each relationship stores:

- role
- effective dates
- reporting line
- authority scope
- committee membership
- risk ownership
- opportunity ownership
- source
- confidence

## Board Graph

Fields:

- member
- officer role
- term dates
- committee membership
- voting rights
- independence
- background
- board priority ownership
- approvals
- meeting cadence
- governance documents
- succession status
- public/private visibility

## Organization Structure

- division
- department
- cost center
- reporting line
- function
- owner
- headcount
- location
- workflow ownership
- system ownership
- product ownership
- risk ownership

## Member / Customer Profile

Aggregated dimensions:

- total members/customers
- active members/customers
- household count
- age bands
- income bands
- business ownership
- product penetration
- digital adoption
- geography
- underserved segments
- relationship depth
- deposit concentration
- loan concentration
- commercial/member-business segments

No personal member record becomes part of public profile.

## Product Stack

Each product object includes:

- product ID
- category
- name
- status
- owner
- target segment
- provider/vendor
- systems
- channels
- pricing/economics
- adoption
- compliance burden
- risks
- KPIs
- roadmap
- gap/opportunity state

Status values:

- active
- pilot
- planned
- under review
- restricted
- sunset
- absent
- unknown

## Vendor Stack

Each institution-vendor relationship includes:

- vendor
- category
- product/service
- business owner
- technical owner
- contract
- start date
- renewal date
- spend
- pricing model
- criticality
- data access
- system access
- risk tier
- review status
- incidents
- service performance
- integration method
- replacement candidates
- exit plan

## Systems Profile

System categories:

- core
- digital banking
- LOS
- mortgage LOS
- CRM
- payments
- cards
- fraud
- BSA/AML
- cybersecurity
- ERP/GL
- treasury
- wealth
- insurance
- data warehouse
- BI
- document management
- HRIS
- AI/LLM
- workflow automation
- developer platform

Each system includes:

- system ID
- owner
- vendor
- hosting
- data classes
- users
- criticality
- interfaces
- controls
- incidents
- health
- version
- modernization state
- contract
- evidence

## Data Profile

Fields:

- core sources
- authoritative systems
- data warehouse
- report inventory
- connector inventory
- manual exports
- data stewards
- data quality
- data freshness
- classifications
- retention
- model-use restrictions
- known gaps

## Regulatory Profile

Includes:

- primary regulator
- secondary regulators
- charter/license
- jurisdictions
- reporting obligations
- examination cadence
- open findings
- recent exams
- policies
- controls
- evidence readiness
- filings
- remediation
- board reporting obligations
- regulatory change backlog

## Strategic Priorities

Each priority includes:

- priority ID
- category
- title
- sponsor
- board visibility
- rationale
- desired outcome
- baseline
- target
- KPIs
- budget
- target date
- dependencies
- blockers
- risks
- opportunities
- status
- evidence

## Risk Profile

Domains:

- credit
- liquidity
- interest rate
- market
- operational
- compliance
- BSA/AML
- fraud
- cybersecurity
- technology
- vendor
- privacy
- model/AI
- strategic
- reputation
- capital
- concentration
- succession
- legal

Each risk includes:

- inherent risk
- controls
- control effectiveness
- residual risk
- likelihood
- impact
- velocity
- trend
- appetite
- owner
- remediation
- evidence
- last reviewed

## Readiness Scores

Dimensions:

- product
- compliance
- integration
- adoption
- investment
- data
- governance
- vendor
- security
- AI
- operations
- financial
- sponsor

Each score includes:

- score
- scale
- weighting
- evidence
- blockers
- assumptions
- confidence
- reviewer
- last reviewed
- expiration
- next action

## Opportunity Queue

Each opportunity includes:

- type
- source signals
- problem
- proposed solution
- value
- urgency
- feasibility
- readiness
- regulatory burden
- integration burden
- sponsor
- relationship value
- required workflow
- required evidence
- approval path
- next action
- status
- confidence
- realized outcome

## Relationship Graph

Relationship classes:

- executive
- board
- regulator
- vendor
- CUSO
- corporate CU
- league
- trade association
- fintech
- capital partner
- auditor
- law firm
- consultant
- peer institution
- referral
- investment
- lending
- participation

## Profile Lifecycle

- discovered
- seeded
- identity verified
- enriched
- reviewed
- active
- stale
- under remediation
- merged
- archived

## Field Provenance Object

```json
{
  "field_path": "",
  "value": "",
  "source_type": "public|uploaded|connector|attested|inferred",
  "source_reference": "",
  "source_timestamp": "",
  "confidence": "",
  "freshness": "",
  "owner": "",
  "visibility": "",
  "approved": false,
  "version": ""
}
```

## Validation Rules

- legal name required
- institution type required
- official identifier required when available
- financial periods must be explicit
- executive roles require dates or current-state source
- vendor relationship requires source and date
- inferred fields cannot be marked verified
- merged institutions retain historical profile
- private fields cannot appear in public output
- stale data reduces confidence

## Example Minimal CU Record

```json
{
  "institution_id": "CU-100001",
  "identity": {
    "legal_name": "Example Community Credit Union",
    "display_name": "Example Community CU",
    "institution_type": "Credit Union",
    "operating_status": "active",
    "website": "https://example.invalid"
  },
  "regulatory_identity": {
    "charter_type": "federal",
    "primary_regulator": "NCUA",
    "charter_number": "00000"
  },
  "financial_profile": {
    "assets": {
      "value": 1250000000,
      "as_of": "2026-06-30",
      "source_type": "public",
      "confidence": "high"
    }
  },
  "profile_status": "seeded"
}
```

## Outputs

- Institution Terminal
- executive brief
- board brief
- financial summary
- vendor map
- systems map
- regulatory map
- risk dashboard
- readiness dashboard
- opportunity queue
- relationship graph seed
- workflow routing context

## Implementation Notes

- Store canonical objects in transactional store.
- Publish object changes to graph and search indexes.
- Keep raw source and field provenance separately addressable.
- Do not flatten private and public data into one unrestricted document.
- Use deterministic identifiers where official IDs exist.
- Version field mapping and profile schema.
- Expose confidence and freshness in API and UI.

## Acceptance Tests

- Represents CU, bank, fintech, vendor, CUSO, and capital partner.
- Distinguishes public, private, inferred, and attested data.
- Links executives, vendors, products, systems, risks, regulations, and opportunities.
- Preserves field provenance.
- Supports sparse and rich profile states.
- Drives routing, search, readiness, and Terminal views.
