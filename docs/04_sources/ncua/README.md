# NCUA Regulations Dataset — 12 CFR Chapter VII (Parts 700–799)

Two datasets built from official U.S. government primary sources, plus the
scripts that generate them.

## Files

| File | What it is |
|------|-----------|
| `ncua_regulations_clean.json` | **Complete current text** — the in-force NCUA regulations |
| `ncua_regulations_future_amendments.json` | **Future-looking** — pending amendments not yet in effect |
| `build_ncua_dataset.py` | Builds the current-text file from the eCFR bulk XML |
| `build_future_amendments.py` | Builds the future file from Federal Register final rules |

---

## 1. `ncua_regulations_clean.json` — current, in-force text

Source: the official **eCFR bulk XML** for Title 12
(`ecfr.gov/api/versioner/v1/full/{date}/title-12.xml`), issue date
**2026-07-15**. One bulk download, parsed locally with `lxml`.

- 675 records covering all 41 NCUA parts present in Chapter VII (700–799).
  Parts 706 and 753 are fully reserved (no sections).
- ~2.4M characters / ~482K words of body text.

Each record:

```json
{
  "part": "745",
  "part_title": "PART 745—SHARE INSURANCE AND APPENDIX",
  "subpart": "A",
  "subpart_title": "Subpart A—Clarification and Definition of Account Insurance Coverage",
  "section": "745.4",
  "title": "§ 745.4 Revocable trust accounts.",
  "node_type": "section",            // "section" or "appendix"
  "cfr_ref": "12 CFR 745.4",
  "body_text": "..."                 // cleaned legal text, paragraph breaks preserved
}
```

Required keys per your spec: `part`, `section`, `title`, `body_text`
(the rest are extra metadata).

**Scope note:** this is the text legally in force as of the 2026-07-15 eCFR
issue. It is text-only — embedded images/forms are not captured; tables are
flattened to pipe-delimited rows.

---

## 2. `ncua_regulations_future_amendments.json` — pending amendments

eCFR flags sections that have a published-but-not-yet-effective amendment with
a "Link to an amendment" note; the new text is **not** merged into the in-force
version. This file resolves those 10 flagged nodes to their governing Federal
Register final rules and captures the pending change.

Three final rules are involved:

| FR document | Citation | Effective | Covers |
|-------------|----------|-----------|--------|
| 2024-21888 — Simplification of Share Insurance Rules | 89 FR 79397 | **2026-12-01** | §§ 745.0, 745.1, 745.2, 745.4, 745.9-1, 745.9-2, 745.13, Appendix to Part 745 |
| 2026-12058 — Records Preservation Program | 91 FR 36073 | **2026-07-16** | § 703.105 |
| 2026-12856 — Prohibition on the Use of Reputation Risk | 91 FR 38270 | **2026-07-27** | § 702.304 |

Each record:

```json
{
  "part": "745",
  "section": "745.4",
  "new_title": "Trust accounts.",
  "amendment_type": "revised_full",
  "effective_on": "2026-12-01",
  "in_force_as_of_base_file": false,
  "fr_citation": "89 FR 79397",
  "fr_document_number": "2024-21888",
  "fr_rule_title": "Simplification of Share Insurance Rules",
  "fr_publication_date": "2024-09-30",
  "fr_url": "https://www.federalregister.gov/d/2024-21888",
  "amendment_instructions": ["8. Revise § 745.4 to read as follows:"],
  "new_text": "..."                  // full/partial new text where the rule supplies it
}
```

### `amendment_type` values

- `revised_full` — the rule replaces the whole section; `new_text` is the
  complete new section (e.g. § 745.1, § 745.4).
- `revised_paragraphs` / `new_text` — specific paragraphs revised; `new_text`
  holds the revised paragraphs (e.g. § 745.2).
- `amended_instruction` — a targeted edit (e.g. remove a word). No full
  replacement text is issued; see `amendment_instructions`.
- `removed_and_reserved` — a paragraph is removed and reserved (§ 703.105(d)).
- `removed` — the node is removed (§ 745.9-1; the Part 745 appendix).
- `redesignated` — the node is renumbered (§ 745.9-2 → § 745.9).

**Important:** for `amended_instruction` / `removed*` / `redesignated` types the
Federal Register issues an *instruction*, not a full rewrite, so `new_text` is
empty by design and the change lives in `amendment_instructions`. These were
deliberately **not** machine-merged into the current text, because
auto-applying amendatory instructions ("remove the word ‘reputational,’") to
legal text risks silent errors. To see the fully merged future text once these
take effect, re-run `build_ncua_dataset.py` on a future eCFR issue date.

---

## Reproducing

```bash
pip install lxml
python3 build_ncua_dataset.py          # -> ncua_regulations_clean.json
python3 build_future_amendments.py     # -> ncua_regulations_future_amendments.json
```

`build_ncua_dataset.py` caches `title-12.xml` and auto-detects the latest eCFR
issue date. `build_future_amendments.py` reads the three Federal Register rule
XMLs (included under `fr_rules/` when generated).

Sources: eCFR (ecfr.gov) and the Federal Register (federalregister.gov), both
official U.S. Government Publishing Office data.
