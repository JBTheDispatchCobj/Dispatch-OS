# 6003 — Vendor & Product Stack Schema V1 Complete

## Purpose

Define canonical vendor, product, contract, integration, dependency, performance, risk, and replacement objects.

## Vendor Object

```json
{
  "vendor_id": "ORG-000100",
  "identity": {},
  "categories": [],
  "products": [],
  "institution_relationships": [],
  "contracts": [],
  "integrations": [],
  "risk_profile": {},
  "performance": {},
  "incidents": [],
  "security_evidence": [],
  "replacement_options": [],
  "audit_history": []
}
```

## Product Object

```json
{
  "product_id": "PROD-000100",
  "name": "",
  "domain": "",
  "provider": "",
  "institution_owner": "",
  "status": "",
  "target_segments": [],
  "economics": {},
  "regulatory_profile": {},
  "systems": [],
  "vendors": [],
  "workflows": [],
  "KPIs": [],
  "risks": [],
  "evidence": []
}
```

## Contract Object

Required fields:

- contract ID
- institution
- vendor
- covered products
- effective date
- expiration
- renewal mechanism
- notice window
- pricing
- service levels
- data ownership
- audit rights
- subcontractors
- security obligations
- regulatory access
- termination
- exit assistance
- owner
- review status

## Integration Object

- source
- target
- API/file/manual/webhook/SFTP
- authentication
- frequency
- data objects
- owner
- reconciliation
- monitoring
- security classification
- error handling
- version
- status

## Lifecycle States

Vendor relationship:

- candidate
- due diligence
- approved
- contracting
- implementation
- active
- watch
- remediation
- renewal
- replacement
- terminated
- archived

Product:

- absent
- proposed
- evaluating
- pilot
- active
- restricted
- sunset
- retired

## Replacement Readiness Score

Dimensions:

- contract timing
- switching cost
- data portability
- integration complexity
- service pain
- pricing disadvantage
- risk concern
- executive sponsor
- replacement availability
- implementation capacity

## Decision Table

| Condition | Action |
|---|---|
| Renewal < 180 days and service pain high | Create replacement opportunity |
| Critical vendor and evidence stale | Block renewal approval |
| Product absent and strategic priority aligned | Create product-gap opportunity |
| Vendor incident unresolved | Increase risk and notify owner |
| Integration undocumented | Reduce readiness confidence |

## Example Vendor Relationship

```json
{
  "institution_id": "CU-100001",
  "vendor_id": "ORG-200001",
  "category": "digital banking",
  "criticality": "high",
  "renewal_date": "2027-03-31",
  "risk_tier": "critical",
  "status": "active",
  "source_type": "tenant_attested"
}
```

## Implementation Notes

- Vendor identity is global where legally safe.
- Contract and spend remain tenant-private.
- Public customer references need source and date.
- Historical vendor relationships remain queryable.
- Product gaps should not be inferred as current without evidence.
- Contract dates trigger runtime events.

## Acceptance Tests

- Identifies all products supported by a vendor.
- Identifies all vendors supporting a product.
- Maps contracts to renewal and exit conditions.
- Detects replacement opportunities.
- Keeps private commercial terms tenant scoped.
