#!/usr/bin/env python3
"""
Build the "future-looking" companion dataset: the pending, not-yet-effective
amendments to NCUA regulations that eCFR flags with a "Link to an amendment"
note but has NOT yet folded into the in-force text.

Source of truth: the official Federal Register final-rule full-text XML
(federalregister.gov), which contains the amendatory instructions (AMDPAR) and,
where a section is revised in full, the complete new regulatory text (SECTION).

Output: ncua_regulations_future_amendments.json — one object per flagged node,
with the amendment instruction(s), the new text where the rule provides it, the
effective date, and full Federal Register provenance.
"""
import json, re
from pathlib import Path
from lxml import etree

HERE = Path(__file__).resolve().parent
WS = re.compile(r"\s+")
INLINE = {"I", "E", "SUP", "SUB", "SU", "FTREF", "PAGE"}
SKIP = {"SECTNO", "SUBJECT", "PRTPAGE", "IMG", "MATH", "BILLING-CODE", "EAR"}

# Each pending rule, its effective date, and the flagged nodes it governs.
RULES = {
    "2024-21888": {
        "citation": "89 FR 79397", "publication_date": "2024-09-30",
        "effective_on": "2026-12-01",
        "title": "Simplification of Share Insurance Rules",
        "part": "745",
        "nodes": ["745.0", "745.1", "745.2", "745.4",
                  "745.9-1", "745.9-2", "745.13", "Appendix to Part 745"],
    },
    "2026-12058": {
        "citation": "91 FR 36073", "publication_date": "2026-06-16",
        "effective_on": "2026-07-16",
        "title": ("Records Preservation Program and Appendices-Record Retention "
                  "Guidelines; Catastrophic Act Preparedness Guidelines"),
        "part": "703",
        "nodes": ["703.105"],
    },
    "2026-12856": {
        "citation": "91 FR 38270", "publication_date": "2026-06-25",
        "effective_on": "2026-07-27",
        "title": "Prohibition on the Use of Reputation Risk",
        "part": "702",
        "nodes": ["702.304"],
    },
}


def clean(el):
    return WS.sub(" ", "".join(el.itertext())).strip()


def render_table(tbl):
    rows = []
    for row in tbl.iter("ROW"):
        cells = [WS.sub(" ", "".join(c.itertext())).strip()
                 for c in row.findall("ENT")]
        if any(cells):
            rows.append(" | ".join(cells))
    return "\n".join(rows)


def render_block(el, out):
    tag = el.tag
    if not isinstance(tag, str) or tag in SKIP:
        return
    if tag == "GPOTABLE":
        t = render_table(el)
        if t:
            out.append(t)
        return
    kids = [c for c in el if isinstance(c.tag, str)
            and c.tag not in INLINE and c.tag not in SKIP]
    if kids:
        for c in el:
            render_block(c, out)
    else:
        txt = clean(el)
        if txt:
            out.append(txt)


def section_body(sec):
    out = []
    for child in sec:
        if child.tag in ("SECTNO", "SUBJECT"):
            continue
        render_block(child, out)
    return "\n\n".join(p for p in (s.strip() for s in out) if p)


def norm(secno_text):
    """'§ 745.9-1' / '§§ 745.0' -> '745.9-1'"""
    m = re.search(r"(\d+\.[0-9A-Za-z\-]+)", secno_text)
    return m.group(1) if m else secno_text.strip()


def parse_rule(doc):
    """Return dicts: sections{num->{subject,type,body}} and
    amdpars list of (referenced_num_or_None, text)."""
    tree = etree.parse(str(HERE / "fr_rules" / f"{doc}.xml"))
    root = tree.getroot()
    sections = {}
    for sec in root.iter("SECTION"):
        sn = sec.find("SECTNO")
        subj = sec.find("SUBJECT")
        if sn is None:
            continue
        num = norm(clean(sn))
        subj_txt = clean(subj) if subj is not None else ""
        body = section_body(sec)
        entry = {"subject": subj_txt, "body": body}
        # keep the richest entry if a section appears more than once
        prev = sections.get(num)
        if prev is None or len(body) > len(prev["body"]):
            sections[num] = entry
        elif prev and body:  # concatenate partial revisions
            prev["body"] = (prev["body"] + "\n\n" + body).strip()
    amdpars = []
    for a in root.iter("AMDPAR"):
        txt = clean(a)
        refs = re.findall(r"§+\s*(\d+\.[0-9A-Za-z\-]+)", txt)
        # also part-level heading/appendix instructions
        amdpars.append({"refs": refs, "text": txt})
    return sections, amdpars


def classify(node, subject, body, instructions):
    joined = " ".join(instructions).lower()
    if body:
        if "revise" in joined and node in " ".join(
                [i for i in instructions if "revise" in i.lower()]):
            return "revised_full" if node not in ("745.2",) else "revised_paragraphs"
        return "new_text"
    if "removed" in subject.lower() or "remove" in joined and "reserve" not in joined:
        return "removed"
    if "redesignated" in subject.lower() or "redesignate" in joined:
        return "redesignated"
    if "reserve" in joined:
        return "removed_and_reserved"
    return "amended_instruction"


def build():
    records = []
    for doc, meta in RULES.items():
        sections, amdpars = parse_rule(doc)
        for node in meta["nodes"]:
            key = norm(node) if node[0].isdigit() else node
            sec = sections.get(key, {})
            # collect every amendatory instruction that references this node
            instr = [a["text"] for a in amdpars if key in a["refs"]]
            # appendix / heading instructions won't match by number
            if node.lower().startswith("appendix"):
                instr = [a["text"] for a in amdpars
                         if "appendix" in a["text"].lower()]
            body = sec.get("body", "")
            subject = sec.get("subject", "")
            rec = {
                "part": meta["part"],
                "section": node,
                "new_title": subject or None,
                "amendment_type": classify(node, subject, body, instr),
                "effective_on": meta["effective_on"],
                "in_force_as_of_base_file": False,
                "fr_citation": meta["citation"],
                "fr_document_number": doc,
                "fr_rule_title": meta["title"],
                "fr_publication_date": meta["publication_date"],
                "fr_url": f"https://www.federalregister.gov/d/{doc}",
                "amendment_instructions": instr,
                "new_text": body,   # full/partial new text where the rule supplies it
            }
            records.append(rec)

    out = HERE / "ncua_regulations_future_amendments.json"
    out.write_text(json.dumps(records, ensure_ascii=False, indent=2))
    print(f"Wrote {len(records)} future-amendment records -> {out.name}")
    for r in records:
        flag = f"{len(r['new_text'])} chars" if r["new_text"] else "instruction only"
        print(f"  {r['section']:22} eff {r['effective_on']}  "
              f"[{r['amendment_type']:20}] {flag}")
    return records


if __name__ == "__main__":
    build()
