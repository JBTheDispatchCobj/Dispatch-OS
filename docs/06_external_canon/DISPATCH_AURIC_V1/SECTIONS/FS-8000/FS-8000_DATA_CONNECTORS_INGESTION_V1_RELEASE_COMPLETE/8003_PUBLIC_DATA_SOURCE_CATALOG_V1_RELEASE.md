# 8003 — Public Data Source Catalog V1 Release Complete

## Purpose

Define the public and licensed-public sources used to seed institution, executive, regulatory, market, vendor, fintech, product, and transaction profiles.

## Source Categories

### Credit Unions

- NCUA active institution data
- NCUA call reports
- NCUA merger/liquidation information
- NCUA enforcement and supervisory publications
- state regulator institution lists
- credit-union websites
- league and association directories

### Banks

- FDIC BankFind and institution data
- FFIEC call reports
- Federal Reserve structure data
- OCC institution lists and enforcement actions
- state banking regulators
- bank websites

### Securities and Private Markets

- SEC EDGAR
- Form D
- Investment Adviser Public Disclosure
- BrokerCheck
- public offering documents
- issuer websites
- investor relations pages

### Vendors and Fintechs

- vendor websites
- product documentation
- security and trust centers
- app marketplaces
- public customer references
- public pricing
- status pages
- patent/trademark data where relevant
- company filings and press releases

### Executives

- institution websites
- public biographies
- conference agendas
- association directories
- public professional profiles
- regulatory filings

### Regulations and Standards

- eCFR
- Federal Register
- agency guidance
- supervisory letters
- state statutes and regulations
- official examination manuals
- public standards documentation

## Public Source Object

- source_id
- name
- publisher
- category
- URL or access method
- jurisdiction
- update cadence
- license/terms
- data fields
- stable identifiers
- historical coverage
- reliability
- ingestion method
- last reviewed

## Source Trust Tiers

### Tier 1

Official regulator, government, or legally authoritative source.

### Tier 2

Institution-published or vendor-published primary source.

### Tier 3

Established trade association, standards body, or reputable industry source.

### Tier 4

Secondary aggregation requiring corroboration.

### Tier 5

Unverified discovery source; never sole evidence for material claims.

## Freshness Rules

- Capture source publication date.
- Capture ingestion date.
- Preserve historical versions when possible.
- Set expected refresh cadence.
- Flag overdue refresh.
- Reconcile conflicts using source authority and recency.

## Public Profile Seeding

Minimum CU seed:

- legal name
- charter ID
- type
- headquarters
- assets
- members
- loans
- shares/deposits
- net worth
- website
- branch footprint
- executive names where public
- regulator
- recent financial period

## Data-Use Controls

- terms reviewed
- robots/access restrictions respected
- no circumvention
- citations retained
- copyrighted text summarized rather than republished
- personally sensitive data minimized
- public does not automatically mean unrestricted redistribution

## Outputs

- source catalog
- source trust matrix
- refresh schedule
- field coverage map
- public-profile seed pipeline
- conflict-resolution rules

## Acceptance Tests

- Every public field identifies its source.
- Official sources outrank secondary sources.
- Stale sources are flagged.
- Terms and redistribution constraints are recorded.
- Public profiles distinguish sourced facts from inference.

## V1 Completion Additions

### Source Priority and Conflict Rules

Official regulator or government records outrank verified issuer disclosures for regulated identifiers and filings. Verified issuer disclosures outrank reputable secondary research for institution-controlled facts. Secondary sources may seed candidates but cannot overwrite an approved higher-authority fact without review.

### Licensing and Use Review

Each source record includes terms URL/reference, retrieval method, allowed uses, redistribution limits, attribution requirements, retention limits, automation restrictions, and review owner. A source with unresolved use rights is restricted to research review and may not populate customer-facing canonical fields.

### Population Controls

Public population jobs are versioned by source snapshot and population manifest. Sparse profiles remain visibly sparse. Absence from a public source does not prove nonexistence. Conflicting public records produce parallel claims and a review task rather than silent selection.
