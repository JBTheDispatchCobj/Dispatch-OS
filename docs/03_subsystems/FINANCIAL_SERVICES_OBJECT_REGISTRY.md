# Financial Services Object Registry

> Canonical Financial Services object taxonomy for the Dispatch Operating System. Every institution, person, product, process, regulation, document, workflow, and asset becomes a standardized Object; every cartridge extends this registry rather than creating its own schema. Each object inherits the universal Dispatch Object Model and adds domain-specific attributes.

> **Machine-readable catalog (config-as-data):** `core/registry/data/financial_services_objects.json` — shaped to the DKR `ObjectRegistryEntry` contract (`core/registry/types.ts`) and keyed to the `object_registry.object_class` index (migration `0017`). This document is the human-readable projection of that catalog; the JSON governs.

**20 families · 341 object classes · 39 universal fields**

---

## 1000 · Institutions
`fs:institutions`

**Object types (34):** Federal Credit Union, State Credit Union, Corporate Credit Union, Credit Union Service Organization (CUSO), Community Bank, Regional Bank, Money Center Bank, Industrial Bank, Savings Bank, Trust Company, Investment Bank, Merchant Bank, Private Bank, Fintech, Neobank, Payments Company, Mortgage Company, Finance Company, Broker Dealer, Registered Investment Advisor (RIA), Insurance Company, Private Equity Firm, Venture Capital Firm, Private Credit Fund, Family Office, Holding Company, SPV, Fund, Government Agency, Regulator, Trade Association, Foundation, Subsidiary, Affiliate

**Attributes (13):** Institution Type, Charter, Regulator, Assets, Members, Branches, Core Processor, Market, Industry, Ownership, Risk Rating, Innovation Score, Relationships

---

## 1100 · Organizational Structure
`fs:organizational_structure`

**Object types (20):** Board, Board Committee, Executive Committee, Credit Committee, Investment Committee, Audit Committee, Risk Committee, ALCO, Innovation Committee, Executive, Officer, Director, Department, Division, Business Unit, Branch, Region, Operations Center, Call Center, Innovation Lab

**Attributes (8):** Reporting Structure, Responsibilities, Approvals, Delegation, Policies, KPIs, Budget, Personnel

---

## 1200 · People
`fs:people`

**Object types (28):** Member, Customer, Prospect, Borrower, Co-Borrower, Guarantor, Depositor, Investor, LP, GP, Advisor, Employee, Executive, Board Member, Regulator, Examiner, Attorney, CPA, Vendor Contact, Relationship Manager, Loan Officer, Processor, Closer, Servicer, Collector, Portfolio Manager, Financial Advisor, Consultant

**Attributes (11):** Identity, Employer, Licenses, Roles, Relationships, Communication History, Risk, Trust Score, Tasks, Meetings, Permissions

---

## 1300 · Financial Accounts
`fs:financial_accounts`

**Object types (16):** Checking, Savings, Money Market, Certificate, IRA, HSA, Trust Account, Escrow, Settlement Account, Reserve Account, Commercial DDA, Brokerage Account, Investment Account, Loan Account, Credit Card Account, Warehouse Account

**Attributes (9):** Owner, Balance, Rate, Terms, Status, Institution, History, Transactions, Collateral

---

## 1400 · Lending Products
`fs:lending_products`

**Object types (23):** Consumer Loan, Personal Loan, Auto Loan, RV Loan, Boat Loan, Motorcycle Loan, Mortgage, Construction Loan, Bridge Loan, Commercial Mortgage, HELOC, Commercial LOC, Equipment Loan, SBA Loan, USDA Loan, Participation Loan, Syndicated Loan, Warehouse Line, Private Credit Facility, Factoring, Invoice Financing, Lease, Agricultural Loan

**Attributes (14):** Product, Rate, Term, Collateral, LTV, CLTV, DSCR, DTI, Risk Grade, Pricing, Fees, Guarantors, Documents, Status

---

## 1500 · Deposit Products
`fs:deposit_products`

**Object types (11):** Checking, Savings, Money Market, Certificate, IRA, Business Checking, Escrow, Trust, Custodial, Sweep, Brokered Deposit

**Attributes (7):** Yield, Fees, Restrictions, Balance, Ownership, Beneficiaries, Status

---

## 1600 · Capital Markets
`fs:capital_markets`

**Object types (21):** Equity, Preferred Equity, Convertible Note, SAFE, Warrant, Senior Debt, Mezzanine Debt, Subordinated Debt, Private Credit, Warehouse Facility, Participation, Syndication, Fund, SPV, Capital Call, Distribution, Exit, IPO, Recapitalization, Acquisition, Disposition

**Attributes (11):** Issuer, Sponsor, LPs, GP, Valuation, IRR, MOIC, Equity, Debt, Waterfall, Exit Strategy

---

## 1700 · Investments
`fs:investments`

**Object types (14):** Portfolio, Fund, Investment, Holding, Position, Security, Bond, Stock, ETF, Private Equity, VC, Real Estate, Treasury, Alternative Investment

**Attributes (10):** Investment Thesis, Sector, Stage, Valuation, Ownership, Performance, Cash Flow, Exit, Risk, Sponsor

---

## 1800 · Credit
`fs:credit`

**Object types (15):** Credit Report, Credit Bureau, Credit Score, Trade Line, Collateral, Lien, Guarantee, Cash Flow, Financial Statements, DSCR, LTV, DTI, Risk Rating, Credit Memo, Credit Policy

**Attributes (7):** Scores, Collateral, History, Underwriting, Risk, Approval, Exceptions

---

## 1900 · Compliance
`fs:compliance`

**Object types (20):** KYC, KYB, AML, BSA, OFAC, CDD, EDD, SAR, CTR, TRID, RESPA, TILA, HMDA, CRA, GLBA, UDAAP, Privacy, Consent, Audit, Compliance Review

**Attributes (8):** Requirement, Evidence, Status, Owner, Due Date, Regulator, Findings, Exceptions

---

## 2000 · Regulation
`fs:regulation`

**Object types (18):** NCUA, FDIC, Federal Reserve, OCC, CFPB, SEC, FINRA, FHA, VA, USDA, FHFA, Fannie Mae, Freddie Mac, Ginnie Mae, State Regulators, Call Reports, Examinations, Consent Orders

**Attributes (7):** Citation, Jurisdiction, Applicability, Requirements, Deadlines, Controls, Findings

---

## 2100 · Operations
`fs:operations`

**Object types (15):** Workflow, Task, Queue, Case, Approval, Review, Incident, Exception, Escalation, Runbook, SOP, Automation, Execution, Batch Job, Notification

**Attributes (7):** Owner, Priority, Status, Dependencies, Automation, Metrics, Completion

---

## 2200 · Risk
`fs:risk`

**Object types (12):** Operational Risk, Credit Risk, Liquidity Risk, Market Risk, Interest Rate Risk, Compliance Risk, Vendor Risk, Cyber Risk, Fraud Risk, Model Risk, Strategic Risk, Enterprise Risk

**Attributes (7):** Probability, Impact, Controls, Mitigation, Owner, Residual Risk, Review Date

---

## 2300 · Finance & Accounting
`fs:finance_accounting`

**Object types (14):** GL Account, Journal Entry, Invoice, Expense, Revenue, Budget, Forecast, Variance, Cash Flow, Balance Sheet, Income Statement, Trial Balance, Cost Center, Profit Center

**Attributes (6):** Amounts, Period, Department, Owner, Approval, Supporting Documents

---

## 2400 · Vendors & Partners
`fs:vendors_partners`

**Object types (11):** Vendor, Partner, MSA, SLA, Contract, Implementation, Renewal, Support Ticket, API, Connector, Risk Assessment

**Attributes (7):** Owner, Term, Renewal, Performance, Risk, Invoices, Contacts

---

## 2500 · Technology
`fs:technology`

**Object types (13):** Core Processor, LOS, CRM, ERP, Accounting, Data Warehouse, Identity Provider, API, Connector, Webhook, Marketplace Package, SDK, AI Model

**Attributes (7):** Version, Vendor, Authentication, Capabilities, Dependencies, Health, Usage

---

## 2600 · AI
`fs:ai`

**Object types (10):** Agent, Prompt, Model, Reasoning Session, Execution, Tool, Memory, Knowledge Pack, Capability, Workflow

**Attributes (8):** Purpose, Context, Model, Performance, Cost, Latency, Quality, Owner

---

## 2700 · Documents
`fs:documents`

**Object types (17):** Application, Loan File, Disclosure, Statement, Tax Return, Financial Statement, Operating Agreement, Articles, Bylaws, Presentation, Research, Board Packet, Investment Memo, Policy, Procedure, Email, Meeting Minutes

**Attributes (6):** Author, Version, Approval, Classification, Tags, Relationships

---

## 2800 · Real Estate
`fs:real_estate`

**Object types (13):** Property, Building, Parcel, Hotel, Room, Unit, Lease, Tenant, Appraisal, Inspection, Survey, FFE, Capital Project

**Attributes (8):** Address, Owner, Valuation, Occupancy, NOI, Cap Rate, Condition, History

---

## 2900 · Innovation Ecosystem
`fs:innovation_ecosystem`

**Object types (16):** Startup, Founder, Product, Technology, Pilot, Proof of Concept, Integration, Partnership, Capability, Market Category, Vendor Evaluation, Innovation Score, Institution Readiness, Startup Readiness, Investment Thesis, Investment Committee Memo

**Attributes (10):** Stage, Customers, Integrations, Funding, Readiness, Strategic Fit, Regulatory Fit, Champion, Probability, Recommendation

---

## Universal Object Fields
_Inherited by every object; structurally encoded by the Dispatch Object Model (`object_registry` in migration `0017` + `CORE_OBJECT_MODEL`)._

Object ID, Object Type, Canonical Name, Display Name, Aliases, Description, Owner, Institution, Workspace, Lifecycle, Version, Created, Modified, Status, Relationships, Knowledge Links, Documents, Tasks, Meetings, Communications, Policies, Security Classification, Permissions, Trust Score, Risk Score, Compliance Status, Telemetry, Audit History, Connectors, Tags, Labels, Capabilities, AI Context, Operational History, Search Index, Embeddings, Notes, Attachments, Custom Extension Fields
