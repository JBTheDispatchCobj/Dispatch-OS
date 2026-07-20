#!/usr/bin/env python3
"""
Build a structured dataset of the NCUA Rules and Regulations
(12 CFR Chapter VII, Parts 700-799) from the official eCFR bulk data.

Strategy
--------
Instead of scraping individual web pages or hitting the versioner API hundreds
of times, this downloads ONE bulk XML document for the whole of Title 12 from
the official eCFR versioner "full title" endpoint, then parses Chapter VII out
of it locally.

Output
------
ncua_regulations_clean.json : a JSON array where each element is one section or
appendix, with (at minimum) the keys the product needs:
    - part        e.g. "701"
    - section     e.g. "701.1"   (for appendices: "Appendix A to Part 701")
    - title       the official heading of the node
    - body_text   cleaned legal text, paragraph breaks preserved

plus useful extra metadata: part_title, subpart, subpart_title, node_type,
citation (source note), and cfr_ref.
"""

import json
import re
import sys
import urllib.request
from pathlib import Path

from lxml import etree

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
TITLE = 12
CHAPTER = "VII"              # National Credit Union Administration
PART_MIN, PART_MAX = 700, 799
HERE = Path(__file__).resolve().parent
XML_PATH = HERE / f"title-{TITLE}.xml"
OUT_PATH = HERE / "ncua_regulations_clean.json"

BASE = "https://www.ecfr.gov"
UA = {"User-Agent": "ncua-dataset-builder/1.0 (+local research)"}

# eCFR XML tag families ------------------------------------------------------
# Inline tags: their text belongs to the surrounding paragraph, no line break.
INLINE_TAGS = {"I", "E", "SUP", "SUB", "SU", "FTREF", "PAGE"}
# Tags to drop entirely (layout/printing artifacts, images, page markers).
SKIP_TAGS = {"HEAD", "PRTPAGE", "IMG", "MATH", "BILLING-CODE", "EAR"}
# Table tag handled specially.
TABLE_TAG = "GPOTABLE"

WS = re.compile(r"\s+")


def log(msg: str) -> None:
    print(msg, flush=True)


# ---------------------------------------------------------------------------
# 1. Download the bulk XML
# ---------------------------------------------------------------------------
def latest_issue_date() -> str:
    """Ask the API which date is the most recent issue for Title 12."""
    url = f"{BASE}/api/versioner/v1/titles"
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=120) as r:
        data = json.load(r)
    t = next(x for x in data["titles"] if x["number"] == TITLE)
    # The "full" endpoint accepts up_to_date_as_of; fall back to latest_issue_date.
    return t.get("up_to_date_as_of") or t.get("latest_issue_date")


def download_bulk_xml() -> Path:
    if XML_PATH.exists() and XML_PATH.stat().st_size > 1_000_000:
        log(f"[download] Using cached {XML_PATH.name} "
            f"({XML_PATH.stat().st_size/1e6:.1f} MB)")
        return XML_PATH
    date = latest_issue_date()
    url = f"{BASE}/api/versioner/v1/full/{date}/title-{TITLE}.xml"
    log(f"[download] Fetching bulk XML for Title {TITLE} @ {date}")
    log(f"[download] {url}")
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=600) as r:
        payload = r.read()
    XML_PATH.write_bytes(payload)
    log(f"[download] Saved {XML_PATH.name} ({len(payload)/1e6:.1f} MB)")
    return XML_PATH


# ---------------------------------------------------------------------------
# 2/5. Text cleaning helpers
# ---------------------------------------------------------------------------
def head_text(el) -> str:
    h = el.find("HEAD")
    if h is None:
        return ""
    return WS.sub(" ", "".join(h.itertext())).strip()


def clean_inline(el) -> str:
    """Collapse an element (P, FP, HD...) to a single cleaned line of text,
    keeping the text of inline children (italics, refs) but dropping tags."""
    txt = "".join(el.itertext())
    return WS.sub(" ", txt).strip()


def render_table(tbl) -> str:
    """Flatten a GPOTABLE into readable pipe-delimited rows."""
    rows = []
    for row in tbl.iter("ROW"):
        cells = [WS.sub(" ", "".join(c.itertext())).strip()
                 for c in row.findall("ENT")]
        if any(cells):
            rows.append(" | ".join(cells))
    return "\n".join(rows)


def render_block(el, out: list) -> None:
    """Recursively turn a block element into paragraph strings appended to
    `out`. Preserves paragraph breaks; unwraps inline formatting."""
    tag = el.tag
    if not isinstance(tag, str):        # comments / processing instructions
        return
    if tag in SKIP_TAGS:
        return
    if tag == TABLE_TAG:
        t = render_table(el)
        if t:
            out.append(t)
        return

    # Does this element contain block-level children (i.e. is it a container
    # such as EXTRACT, NOTE, APP)? If so, recurse; otherwise emit its own text.
    child_blocks = [c for c in el
                    if isinstance(c.tag, str)
                    and c.tag not in INLINE_TAGS
                    and c.tag not in SKIP_TAGS]
    if child_blocks:
        for c in el:
            render_block(c, out)
    else:
        txt = clean_inline(el)
        if txt:
            out.append(txt)


def body_of(node) -> str:
    """Full cleaned body text of a section/appendix, minus its HEAD title."""
    out: list = []
    for child in node:
        if child.tag == "HEAD":
            continue
        render_block(child, out)
    # de-dupe consecutive blank artifacts, join with blank lines
    paras = [p for p in (s.strip() for s in out) if p]
    return "\n\n".join(paras)


# ---------------------------------------------------------------------------
# 3/4. Locate Chapter VII and walk Parts 700-799
# ---------------------------------------------------------------------------
def part_number(div5) -> int | None:
    n = div5.get("N", "")
    return int(n) if n.isdigit() else None


def make_record(node, node_type, part_n, part_title, subpart, subpart_title):
    title = head_text(node)
    n = node.get("N", "")
    if node_type == "section":
        section = n
        cfr_ref = f"{TITLE} CFR {n}"
    else:  # appendix
        section = n                      # e.g. "Appendix A to Part 701"
        cfr_ref = f"{TITLE} CFR Part {part_n}, {n}"
    return {
        "part": str(part_n),
        "part_title": part_title,
        "subpart": subpart,
        "subpart_title": subpart_title,
        "section": section,
        "title": title,
        "node_type": node_type,
        "cfr_ref": cfr_ref,
        "body_text": body_of(node),
    }


def walk_part(el, part_n, part_title, subpart, subpart_title, records):
    """Depth-first walk of a PART subtree, tracking subpart context and
    emitting a record for every SECTION (DIV8) and APPENDIX (DIV9)."""
    for child in el:
        tag = child.tag
        if not isinstance(tag, str):
            continue
        if tag == "DIV6":                                   # SUBPART
            walk_part(child, part_n, part_title,
                      child.get("N"), head_text(child), records)
        elif tag == "DIV7":                                 # SUBJECT GROUP
            # keep the current subpart context, just descend
            walk_part(child, part_n, part_title,
                      subpart, subpart_title, records)
        elif tag == "DIV8":                                 # SECTION
            records.append(make_record(child, "section", part_n, part_title,
                                       subpart, subpart_title))
        elif tag == "DIV9":                                 # APPENDIX
            records.append(make_record(child, "appendix", part_n, part_title,
                                       subpart, subpart_title))
        # other tags (HEAD, AUTH, SOURCE, P, ...) carry no nested sections


def build():
    xml_path = download_bulk_xml()
    log("[parse] Parsing XML with lxml ...")
    tree = etree.parse(str(xml_path))
    root = tree.getroot()

    chapter = None
    for ch in root.iter("DIV3"):
        if ch.get("N") == CHAPTER and ch.get("TYPE") == "CHAPTER":
            chapter = ch
            break
    if chapter is None:
        sys.exit(f"[parse] ERROR: Chapter {CHAPTER} not found in Title {TITLE}")
    log(f"[parse] Found Chapter {CHAPTER}: {head_text(chapter)}")

    records: list = []
    parts_seen = []
    for div5 in chapter.iter("DIV5"):
        pn = part_number(div5)
        if pn is None or not (PART_MIN <= pn <= PART_MAX):
            continue
        parts_seen.append(pn)
        walk_part(div5, pn, head_text(div5), None, None, records)

    OUT_PATH.write_text(json.dumps(records, ensure_ascii=False, indent=2))
    log(f"[write] Wrote {len(records)} records -> {OUT_PATH.name} "
        f"({OUT_PATH.stat().st_size/1e6:.2f} MB)")
    log(f"[write] Covered {len(set(parts_seen))} parts: "
        f"{sorted(set(parts_seen))}")
    return records


if __name__ == "__main__":
    build()
