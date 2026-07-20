# Source Contract — NCUA Regulations & Federal Credit Union Act

Filed against `docs/04_sources/SOURCE_CONTRACT_TEMPLATE.md`. This covers the
regulatory-text sources staged in this folder for the Cooperative Markets
ingestion workstream (BUILD_SEQUENCE #6+). It is a **contract + fixtures** doc;
no production connector is wired yet.

- **Source name:** NCUA regulations (12 CFR Chapter VII, Parts 700–799) and the
  Federal Credit Union Act.
- **Owner/publisher:** National Credit Union Administration; text published via
  the eCFR and the Federal Register (U.S. Government Publishing Office).
- **Official URL / access method:**
  - Current regulation text — eCFR bulk XML: `ecfr.gov/api/versioner/v1/full/{date}/title-12.xml` (one bulk download, parsed locally).
  - Pending amendments — Federal Register final-rule XML: `federalregister.gov/d/{document_number}`.
  - Federal Credit Union Act — `NCUA_ACT.pdf` (in this folder).
- **Legal/terms constraints:** U.S. Government public-domain primary sources. No
  license restriction; attribution to eCFR / Federal Register is retained on
  derived facts (`attribution_required = true` on the source record).
- **Authentication:** none (public).
- **Rate limits:** eCFR/FR are public; use scheduled **bulk download**, not
  per-section polling. Cache `title-12.xml`; detect the latest issue date.
- **Refresh cadence:** eCFR issue-dated (dataset base = **2026-07-15**); refresh
  on a scheduled bulk pull. Pending amendments re-resolved when new FR rules land.
- **Raw storage policy:** each retrieved artifact becomes an immutable
  `source_documents` row (the XML/PDF/JSON record). Never mutated; a new pull is
  a new row. Bottom of the provenance chain.
- **Schema/version:** dataset shapes documented in `README.md`. Required keys per
  record: `part`, `section`, `title`, `body_text`.
- **Entity resolution keys:** `cfr_ref` (e.g. `12 CFR 745.4`), `part`, `section`,
  and FR `document_number` for amendments.
- **Fields used:** `part`, `part_title`, `subpart`, `section`, `title`,
  `body_text`; for amendments `effective_on`, `amendment_type`, `fr_citation`,
  `fr_document_number`, `new_text`.
- **Confidence and precedence:** in-force eCFR text →
  `tier = public_fact`, high precedence. Pending amendments →
  `tier = public_fact` but with a **future `valid_from` = `effective_on`** so
  they do not read as currently-in-force. This is the concrete case the truth
  layer's bi-temporal fields exist for (see ADR-0005).
- **Failure handling:** amendatory instructions (`amended_instruction`,
  `removed*`, `redesignated`) are **not** machine-merged — the FR issues an
  instruction, not a rewrite, and auto-applying edits to legal text risks silent
  errors. Store them as future-dated observations/claims with the instruction in
  `provenance_metadata`; require human/deterministic merge before treating as
  in-force. (Mirrors CLAUDE.md: no regulated conclusion solely in model output.)
- **Attribution requirements:** cite eCFR issue date and FR citation on any
  published derived fact.
- **Connector implementation:** deferred. Fixtures + build scripts in this folder
  reproduce the datasets (`build_ncua_dataset.py`, `build_future_amendments.py`).
- **Tests and fixtures:**
  - `ncua_regulations_clean.json` — 675 records, all 41 NCUA parts (700–799).
  - `ncua_regulations_future_amendments.json` — 10 flagged pending nodes across 3 FR rules.
  - `fr_rules/*.xml` — the three governing Federal Register final rules.
  - `NCUA_ACT.pdf` — Federal Credit Union Act (statute, 136 pp.).

## Mapping into the truth layer
| Artifact | Object | Tier | Temporal |
|---|---|---|---|
| eCFR/FR XML, PDF (raw capture) | `source_documents` | — | `retrieved_at`, `published_at` |
| In-force section text | `observations` | `public_fact` | `valid_from` = issue date |
| Pending amendment (full new text) | `observations` | `public_fact` | `valid_from` = `effective_on` (future) |
| Amendatory instruction (no rewrite) | `claims` / `observations` | `public_fact` | held pending human/deterministic merge |
