# 6006 — Readiness Scoring Framework V1 Complete

## Purpose

Determine whether an institution can adopt, govern, integrate, operate, fund, and sustain a product, pilot, investment, partnership, or workflow.

## Dimensions

1. Product
2. Compliance
3. Integration
4. Adoption
5. Investment
6. Data
7. Security
8. Governance
9. Operations
10. Vendor
11. Financial
12. Sponsor

## Score Scale

- 0 unknown
- 1 not ready
- 2 materially blocked
- 3 conditionally ready
- 4 ready
- 5 scale ready

Unknown is not equivalent to 1.

## Score Object

- score ID
- institution
- subject
- dimension
- score
- weight
- weighted score
- evidence
- blockers
- assumptions
- confidence
- reviewer
- date
- expiration
- remediation
- next action

## Scoring Criteria

### Product

- problem clarity
- use-case definition
- demand evidence
- operating owner
- measurable outcome
- product fit

### Compliance

- applicability known
- policy coverage
- controls
- vendor review
- disclosures
- complaint path
- board awareness

### Integration

- systems identified
- API/export path
- data owners
- security architecture
- test environment
- support resources

### Adoption

- sponsor
- workflow fit
- users
- training
- change capacity
- operator ownership

### Investment

- authority
- policy permission
- board appetite
- capital
- reporting
- eligibility

### Data

- source fields
- quality
- freshness
- permission
- reconciliation
- lineage

### Security

- review
- access
- data classification
- incident response
- vendor posture
- monitoring

### Governance

- decision rights
- committees
- approvals
- audit
- reporting

### Operations

- staffing
- procedures
- SLA
- exception handling
- continuity

### Vendor

- diligence
- contract
- implementation
- support
- exit
- concentration

### Financial

- budget
- ROI
- operating cost
- payback
- capital impact

### Sponsor

- authority
- urgency
- credibility
- cross-functional support
- decision velocity

## Default Weights

- Product 10
- Compliance 12
- Integration 12
- Adoption 12
- Security 10
- Governance 8
- Operations 8
- Financial 8
- Sponsor 10
- Data 5
- Vendor 3
- Investment 2

## Opportunity-Specific Overrides

Fintech pilot:

- integration/security/compliance increased

Investment:

- investment/governance/financial increased

Exam readiness:

- compliance/data/evidence increased

## Decision Bands

- 0.0–1.4 defer/reject
- 1.5–2.4 discovery required
- 2.5–3.4 conditionally viable
- 3.5–4.2 execute/pilot
- 4.3–5.0 scale ready

## Confidence

Confidence considers:

- evidence authority
- freshness
- completeness
- conflicts
- attestation
- reviewer status

## Example

```json
{
  "dimension": "integration",
  "score": 3,
  "weight": 12,
  "evidence": ["system map", "API documentation"],
  "blockers": ["no test environment"],
  "confidence": "medium"
}
```

## Acceptance Tests

- Scores are explainable.
- Missing data lowers confidence rather than silently lowering readiness.
- Weights vary by use case.
- Readiness can be recalculated after remediation.
- External use requires human review.
