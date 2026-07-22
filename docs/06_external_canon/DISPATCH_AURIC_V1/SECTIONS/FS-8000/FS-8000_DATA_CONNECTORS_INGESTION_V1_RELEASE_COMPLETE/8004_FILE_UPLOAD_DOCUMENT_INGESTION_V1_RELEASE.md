# 8004 — File Upload & Document Ingestion V1 Release Complete

## Purpose

Define safe, accurate ingestion of documents, spreadsheets, archives, images, and exported reports.

## Supported Inputs

- PDF
- DOCX
- XLSX
- CSV
- JSON
- TXT
- Markdown
- PPTX
- EML/MBOX where supported
- PNG/JPG
- ZIP
- XML
- HTML export

## Upload Workflow

1. Upload authorization
2. file fingerprint/hash
3. malware/policy scan
4. tenant and visibility assignment
5. file-type validation
6. archive expansion in quarantine
7. metadata extraction
8. text/table/image parsing
9. document classification
10. field/entity extraction
11. evidence-object creation
12. object mapping
13. exception review
14. indexing
15. audit event

## Document Object

- document_id
- file name
- MIME type
- size
- hash
- uploader
- upload date
- source date
- document type
- institution
- related objects
- confidentiality
- privilege
- version
- language
- page/sheet count
- parsing status
- evidence links
- retention
- access permissions

## Document Classification

Examples:

- policy
- procedure
- contract
- board packet
- minutes
- financial statement
- call report
- credit memo
- loan document
- vendor review
- exam request
- regulatory response
- startup deck
- data export
- org chart
- strategic plan

## Spreadsheet Processing

Required:

- preserve workbook
- identify sheets
- detect headers
- infer tables
- preserve formulas when available
- distinguish values from formulas
- flag hidden sheets/rows
- identify totals
- reconcile expected balances
- map rows/columns to canonical fields
- preserve unmapped columns

## PDF Processing

- preserve original
- parse embedded text
- inspect tables
- identify scanned pages
- use visual extraction where required
- preserve page references
- extract attachments when available
- do not rely on OCR when native text exists

## Archive Processing

- protect against zip bombs
- limit recursion
- preserve folder structure
- hash files
- identify duplicates
- quarantine unsupported content
- create archive manifest

## Human Review

Required when:

- low-confidence extraction
- ambiguous table headers
- conflicting values
- handwritten content
- poor scan
- unknown document type
- material regulated conclusion
- source contains multiple institutions

## Outputs

- document record
- evidence record
- parsed sections/tables
- extracted entities
- mapping candidates
- exception queue
- ingestion summary

## Acceptance Tests

- Original file remains intact.
- Page/sheet references are preserved.
- Spreadsheet formulas are not silently treated as source values without labeling.
- Unsupported files are quarantined.
- Low-confidence extraction routes to review.

## V1 Completion Additions

### Secure File Pipeline

Uploads are staged outside canonical storage, fingerprinted, malware-scanned, content-type verified, classified, decompressed under archive-bomb limits, and parsed in an isolated worker. Password-protected or encrypted files require an approved secure handling path and are never sent to a model by default.

### Extraction and Evidence Rules

The original file is preserved as evidence. Extracted text, tables, images, metadata, and candidate claims retain page, sheet, slide, cell, paragraph, or attachment coordinates. OCR or model-derived extraction is labeled inferred until reviewed or corroborated.

### Document Integrity

The system stores cryptographic hash, byte size, declared and detected MIME type, uploader, upload time, tenant, source, version, and chain-of-custody events. Replaced files create a new version; they do not overwrite the prior evidence object.
