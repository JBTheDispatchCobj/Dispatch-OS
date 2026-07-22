# 7004 — Loan Participation Opportunity Demo V1

## Purpose

Demonstrate how Dispatch standardizes a loan package, evaluates risk, matches eligible buyers, manages approvals, and supports settlement and reporting.

## Scenario

A credit union originates a $12 million commercial real-estate or operating-company loan and seeks to sell $7 million in participations.

Use synthetic data with:

- strong but not perfect borrower
- complete underwriting package
- defined collateral
- meaningful concentration considerations
- servicing retained by originator
- multiple potential credit-union buyers
- different policy and concentration constraints
- a realistic pricing and allocation process

## Required Objects

- OriginatingInstitution
- BuyerInstitution
- Borrower
- Guarantor
- Loan
- Collateral
- CreditMemo
- RiskRating
- Participation
- Offering
- InvestorProfile
- EligibilityRule
- Allocation
- Settlement
- ServicingAgreement
- ReportingPackage
- Evidence
- Approval

## Standardized Participation Package

Include:

- transaction summary
- borrower profile
- ownership/guarantors
- purpose
- sources and uses
- loan structure
- pricing
- term and amortization
- collateral
- repayment sources
- financial analysis
- covenants
- risk rating
- policy exceptions
- payment history if seasoned
- concentration analysis
- servicing terms
- participation agreement
- reporting expectations
- legal/compliance checklist

## Buyer Profile

Each synthetic buyer includes:

- asset size
- charter
- investment/loan authority
- target yield
- risk appetite
- geography
- industry preference
- concentration limits
- maximum hold
- liquidity
- policy constraints
- approval process
- reporting needs

## Matching Logic

Match on:

- asset class
- geography
- industry
- risk rating
- yield
- duration
- collateral
- concentration
- maximum hold
- regulatory eligibility
- relationship strength
- settlement timing

## Workflow

1. Ingest package.
2. create canonical loan objects.
3. verify evidence completeness.
4. create risk summary.
5. standardize participation terms.
6. identify buyer universe.
7. rank buyers.
8. prepare buyer briefs.
9. receive indications.
10. route internal approvals.
11. allocate.
12. execute participation agreement.
13. settle.
14. onboard reporting and servicing.
15. monitor performance.

## Demo Interactions

- Is this package complete?
- What are the key risks?
- Which buyers fit?
- Why is buyer A ranked above buyer B?
- What is each buyer’s maximum hold?
- Which buyers have concentration conflicts?
- Draft the buyer memo.
- Create an allocation.
- What approvals remain?
- Prepare the closing and settlement checklist.

## Agent Team

- Participation Package Agent
- Commercial Credit Analyst
- Collateral Analyst
- Investor Matching Agent
- Compliance Review Agent
- Allocation Agent
- Settlement Agent
- Monitoring Agent

## Approval Gates

- originating credit authority
- buyer credit/investment authority
- legal
- compliance
- settlement operations
- valuation/pricing owner

## Outputs

- standardized participation package
- completeness score
- risk memo
- buyer ranking
- indication tracker
- allocation
- settlement checklist
- servicing/reporting calendar
- monitoring dashboard

## Acceptance Tests

- Buyer matching uses explicit policy and risk constraints.
- Risk summary links to source evidence.
- Allocation cannot exceed buyer limits.
- Settlement requires approved documents.
- Originator and buyer roles remain distinct.
- Servicing and reporting obligations are tracked after closing.
