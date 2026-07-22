# 7006 — Institutional Intelligence Search Demo V1

## Purpose

Demonstrate graph-based discovery across institutions, executives, vendors, products, regulations, fintechs, relationships, risks, readiness, and opportunities.

## Demo Thesis

The user should be able to ask complex institutional questions in natural language and receive a structured, explainable, evidence-backed result set.

## Example Query

“Show me every credit union in Illinois larger than $750 million using Corelation, without a mature wealth program, with high digital readiness, commercial lending growth, and a board-level AI priority.”

## Search Dimensions

- institution type
- charter
- geography
- asset size
- membership/customer size
- financial metrics
- product stack
- vendor stack
- systems
- executives
- board
- strategic priorities
- risks
- readiness
- regulatory profile
- opportunities
- relationships
- recent activity
- data confidence

## Query Processing

1. Parse criteria.
2. identify canonical fields.
3. resolve entities.
4. classify hard filters.
5. classify soft preferences.
6. identify unavailable data.
7. execute graph and profile query.
8. rank results.
9. explain ranking.
10. generate next actions.

## Result Object

- institution
- match score
- matched criteria
- unmatched criteria
- unknown criteria
- supporting evidence
- freshness
- confidence
- relevant executives
- vendor/product gaps
- readiness
- opportunity
- recommended outreach

## Search Modes

- exact filter
- ranked discovery
- peer comparison
- relationship path
- opportunity search
- vendor footprint
- executive target
- regulatory/risk search
- market map

## Demo Interactions

- Which institutions are most ready for this fintech?
- Which CUs use vendor X?
- Find institutions with a contract renewal in twelve months.
- Who owns commercial strategy at each institution?
- Which institutions lack wealth or insurance?
- Which institutions have open vendor-risk findings?
- Show the warmest relationship path.
- Generate an executive target brief.

## Outputs

- result list
- comparison matrix
- relationship graph
- readiness ranking
- executive targets
- market map
- outreach brief
- evidence panel

## Acceptance Tests

- Unknown data is not treated as a failed criterion.
- Ranking logic is explainable.
- Search results cite evidence and freshness.
- Public and internal relationship data remain permissioned.
- The system can export a structured target list.
