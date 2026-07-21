// cartridges/cooperative_markets/ingest_regulations.ts
//
// Cooperative Markets — LIVE INTAKE seam: NCUA regulatory-corpus ingestion.
//
// Turns the REAL NCUA regulatory corpus (12 CFR Chapter VII, Parts 700–799, the
// official eCFR issue dated 2026-07-15) plus the Federal-Register pending
// amendments into sourced TRUTH objects. This is Wave 3's "live NCUA data at
// scale": the data actually staged in `docs/04_sources/ncua/` is regulatory text
// (675 in-force sections + 10 pending amendment nodes), not 5300 financials, so
// this module is the scale intake for the regulatory plane — a sibling of
// `ingest_call_report.ts` (which handles the 5300 financial plane).
//
// TRUTH DISCIPLINE (DOCTRINE / ADR-0005 / NCUA_SOURCE_CONTRACT.md "Mapping into
// the truth layer"):
//   - In-force section text  → `Observation`, tier `public_fact`,
//                              temporal.valid_from = issue date (2026-07-15).
//   - Pending amendment WITH full replacement text (`new_text` non-empty; the
//     `revised_full` / `revised_paragraphs` types) → `Observation`, tier
//     `public_fact`, temporal.valid_from = `effective_on` (a FUTURE date). It is
//     KNOWN now (observed_at) but EFFECTIVE later — the exact bi-temporal case the
//     truth layer exists for — and is flagged not-yet-in-force in
//     provenance_metadata so it never reads as currently in force.
//   - Amendatory INSTRUCTION with empty `new_text` (`amended_instruction` /
//     `removed` / `removed_and_reserved` / `redesignated`) → `Claim`, tier
//     `public_fact`, HELD pending human/deterministic merge. The FR issues an
//     instruction ("remove the word 'reputational'"), NOT a rewrite; auto-applying
//     edits to legal text risks silent errors, so the instruction is carried in
//     provenance_metadata and NEVER auto-merged into in-force text. (Mirrors
//     CLAUDE.md: no regulated conclusion solely in model/machine output.)
//
// PURE + DETERMINISTIC: no clock, no random, no I/O inside the ingestion
// functions. The CALLER injects every id and timestamp via `RegulatoryIngestContext`;
// given the same records + ctx this module always returns the same objects. The
// ONE allowed impurity is `loadRegulatoryCorpus`, a thin loader that `import`s the
// staged JSON (isolatedModules + resolveJsonModule are on) and returns typed arrays.
//
// LEAN OBJECTS: body_text can be large (~2.4M chars across the corpus); the raw
// capture lives in the `SourceDocument`, not in every assertion. Each truth-object
// `value` is a compact { cfr_ref, title, chars } and metadata carries only a short
// excerpt (first ~280 chars) — the objects stay queryable, not bloated.
//
// isolatedModules-friendly: all type-only imports use `import type`; erasable-only
// TypeScript (no enums / parameter-properties / namespaces / import=); target
// ES2022; moduleResolution "bundler"; alias "@/*" = repo root.

import type {
  SourceDocument,
  Observation,
  Claim,
} from "@/core/truth/types";
import type { LifecycleStatus } from "@/core/types";

// ---------------------------------------------------------------------------
// Raw record shapes (the two staged datasets, verbatim). The caller is
// responsible for having parsed the JSON; these are the on-disk schemas.
// ---------------------------------------------------------------------------

/** One in-force section/appendix node from `ncua_regulations_clean.json`. */
export interface RegulationRecord {
  part: string;
  part_title: string;
  subpart?: string;
  subpart_title?: string;
  section: string;
  title: string;
  /** "section" | "appendix". */
  node_type: string;
  /** eCFR entity-resolution key, e.g. "12 CFR 745.4". */
  cfr_ref: string;
  body_text: string;
}

/** One pending-amendment node from `ncua_regulations_future_amendments.json`. */
export interface AmendmentRecord {
  part: string;
  section: string;
  new_title: string;
  /** revised_full | revised_paragraphs | amended_instruction | removed | removed_and_reserved | redesignated. */
  amendment_type: string;
  /** Future effective date; becomes the observation/claim valid_from. */
  effective_on: string;
  in_force_as_of_base_file: boolean;
  fr_citation: string;
  fr_document_number: string;
  fr_rule_title: string;
  fr_publication_date: string;
  fr_url: string;
  amendment_instructions: string[];
  /** Full/partial replacement text where the rule supplies it; empty for instructions. */
  new_text: string;
}

// ---------------------------------------------------------------------------
// Injected context — the caller supplies every id + timestamp (purity).
// ---------------------------------------------------------------------------

export interface RegulatoryIngestContext {
  /** eCFR issue date of the in-force corpus, e.g. "2026-07-15". */
  issue_date: string;
  /** ISO stamp for when Dispatch observed the corpus (observed-time). Injected. */
  observed_at: string;
  /** Registry source key, e.g. "source:ncua_regulations". */
  source_id: string;
  /** The SourceDocument id these facts cite (bottom of the provenance chain). */
  source_document_id: string;
  /** Deterministic id prefix for derived objects, e.g. "ncua:reg". */
  id_prefix: string;
}

// ---------------------------------------------------------------------------
// Result shapes.
// ---------------------------------------------------------------------------

/** Per-part rollup of in-force sections. */
export interface PartSummary {
  part: string;
  part_title: string;
  count: number;
}

export interface RegulatoryCorpus {
  source_document: SourceDocument;
  /** In-force section observations + pending-full-text amendment observations. */
  observations: Observation[];
  /** Held amendatory-instruction claims (pending human/deterministic merge). */
  claims: Claim[];
  /** Per-part counts of in-force sections, sorted by part asc. */
  parts: PartSummary[];
  /** Observations from the in-force corpus (excludes future amendment observations). */
  total_sections: number;
  /** Amendment observations (future valid_from — pending full replacement text). */
  pending_full_text: number;
  /** Amendment claims (held pending merge). */
  held_instructions: number;
}

// ---------------------------------------------------------------------------
// Shared constants + pure helpers.
// ---------------------------------------------------------------------------

/** Both datasets are public U.S.-government primary sources → shared market, public. */
const PLANE = "shared_market" as const;
const VISIBILITY = "public" as const;
const TIER = "public_fact" as const;
const STATUS: LifecycleStatus = "active";
const ATTRIBUTION =
  "eCFR (ecfr.gov) / Federal Register (federalregister.gov), U.S. Government Publishing Office";

/** Characters of body text kept as a preview in object metadata (objects stay lean). */
const EXCERPT_CHARS = 280;

/**
 * Amendment types whose rule supplies full replacement text — candidates for
 * an Observation (future-dated). All OTHER types are amendatory instructions and
 * become held Claims. Classification also guards on `new_text` being non-empty,
 * so a mislabelled record never yields an empty "revised" observation.
 */
const FULL_TEXT_AMENDMENT_TYPES: ReadonlySet<string> = new Set([
  "revised_full",
  "revised_paragraphs",
]);

/** True when this amendment carries full replacement text → future Observation. */
function isFullTextAmendment(a: AmendmentRecord): boolean {
  return FULL_TEXT_AMENDMENT_TYPES.has(a.amendment_type) && a.new_text.trim().length > 0;
}

/** First ~EXCERPT_CHARS characters of body text, whitespace-normalised. Preview only. */
function excerpt(text: string): string {
  const flat = text.replace(/\s+/g, " ").trim();
  return flat.length > EXCERPT_CHARS ? flat.slice(0, EXCERPT_CHARS) : flat;
}

/** Id-safe slug of a stable key (cfr_ref / section): collapse whitespace, drop unsafe chars. */
function slug(key: string): string {
  return key.trim().replace(/\s+/g, "_").replace(/[^A-Za-z0-9._:-]/g, "");
}

/**
 * Deterministic, collision-free id. Derives from ctx.id_prefix + kind + stable key;
 * on a duplicate key it appends a monotonic counter so ids stay unique AND stable
 * for a given input ordering. `seen` is the caller's dedupe ledger.
 */
function makeId(
  idPrefix: string,
  kind: string,
  key: string,
  seen: Set<string>,
): string {
  const base = `${idPrefix}:${kind}:${slug(key)}`;
  if (!seen.has(base)) {
    seen.add(base);
    return base;
  }
  let n = 2;
  let candidate = `${base}#${n}`;
  while (seen.has(candidate)) {
    n += 1;
    candidate = `${base}#${n}`;
  }
  seen.add(candidate);
  return candidate;
}

/** CFR reference for an amendment record (its dataset carries `section`, not `cfr_ref`). */
function amendmentCfrRef(a: AmendmentRecord): string {
  return `12 CFR ${a.section}`;
}

// ---------------------------------------------------------------------------
// (1) makeRegulatorySourceDocument — the immutable raw capture these facts cite.
//     Bottom of the provenance chain; every observation/claim references its id.
// ---------------------------------------------------------------------------

export function makeRegulatorySourceDocument(
  ctx: RegulatoryIngestContext,
  recordCount: number,
): SourceDocument {
  return {
    id: ctx.source_document_id,
    source_id: ctx.source_id,
    workspace_id: null,
    organization_id: null,
    plane: PLANE,
    visibility: VISIBILITY,
    external_ref: "12 CFR Chapter VII (Parts 700–799)",
    title: "NCUA Regulations — 12 CFR Chapter VII (eCFR bulk corpus)",
    content_type: "application/json",
    // Pointer to the preserved raw artifact; the bulk text is not inlined here.
    raw_content_reference:
      "docs/04_sources/ncua/ncua_regulations_clean.json",
    raw_text: null,
    content_hash: null,
    // observed-time (retrieval) vs valid-time (publisher issue date).
    retrieved_at: ctx.observed_at,
    published_at: ctx.issue_date,
    attribution: ATTRIBUTION,
    metadata: {
      issue_date: ctx.issue_date,
      record_count: recordCount,
      chapter: "12 CFR Chapter VII",
      publisher: "National Credit Union Administration",
      attribution_required: true,
    },
    created_at: ctx.observed_at,
  };
}

// ---------------------------------------------------------------------------
// (2) ingestRegulations — in-force section text → sourced Observations.
//     tier public_fact; valid_from = issue date (2026-07-15); observed_at injected.
// ---------------------------------------------------------------------------

export function ingestRegulations(
  records: RegulationRecord[],
  ctx: RegulatoryIngestContext,
): Observation[] {
  const seen = new Set<string>();
  const out: Observation[] = [];

  for (const r of records) {
    const id = makeId(ctx.id_prefix, "obs", r.cfr_ref, seen);
    out.push({
      id,
      truth_kind: "observation",
      workspace_id: null,
      organization_id: null,
      plane: PLANE,
      visibility: VISIBILITY,
      tier: TIER,
      // subject: this regulation node; predicate: the field being asserted.
      subject_ref: r.cfr_ref,
      subject_type: "regulation_section",
      predicate: "regulation_text",
      // Lean value — the raw body lives in the SourceDocument, not here.
      value: {
        cfr_ref: r.cfr_ref,
        title: r.title,
        chars: r.body_text.length,
      },
      provenance: {
        method: "source_extraction",
        asserted_by: "system",
        source_document_ids: [ctx.source_document_id],
        source_ids: [ctx.source_id],
        provenance_metadata: {
          part: r.part,
          part_title: r.part_title,
          subpart: r.subpart ?? null,
          subpart_title: r.subpart_title ?? null,
          section: r.section,
          node_type: r.node_type,
          in_force: true,
          attribution: ATTRIBUTION,
        },
      },
      temporal: {
        observed_at: ctx.observed_at,
        valid_from: ctx.issue_date, // in force as of the eCFR issue date
        valid_to: null,
      },
      status: STATUS,
      metadata: {
        cfr_ref: r.cfr_ref,
        part: r.part,
        section: r.section,
        node_type: r.node_type,
        excerpt: excerpt(r.body_text),
      },
      created_at: ctx.observed_at,
    });
  }

  return out;
}

// ---------------------------------------------------------------------------
// (3) ingestAmendments — pending amendments → future Observations OR held Claims.
//
//   Full replacement text (revised_full / revised_paragraphs, new_text present)
//     → Observation, valid_from = effective_on (FUTURE), flagged not-yet-in-force.
//   Amendatory instruction (amended_instruction / removed / removed_and_reserved /
//     redesignated, new_text empty)
//     → Claim, HELD pending human/deterministic merge; instruction in metadata.
// ---------------------------------------------------------------------------

export function ingestAmendments(
  amendments: AmendmentRecord[],
  ctx: RegulatoryIngestContext,
): { observations: Observation[]; claims: Claim[] } {
  const seen = new Set<string>();
  const observations: Observation[] = [];
  const claims: Claim[] = [];

  for (const a of amendments) {
    const cfrRef = amendmentCfrRef(a);
    // Shared FR provenance for both branches — the governing final rule.
    const frMeta = {
      part: a.part,
      section: a.section,
      amendment_type: a.amendment_type,
      effective_on: a.effective_on,
      in_force: false, // NOT yet in force — future valid_from
      in_force_as_of_base_file: a.in_force_as_of_base_file,
      fr_citation: a.fr_citation,
      fr_document_number: a.fr_document_number,
      fr_rule_title: a.fr_rule_title,
      fr_publication_date: a.fr_publication_date,
      fr_url: a.fr_url,
      attribution: ATTRIBUTION,
    };

    if (isFullTextAmendment(a)) {
      // ---- Future-dated Observation: the rule supplies the full new text. ----
      const id = makeId(ctx.id_prefix, "amd:obs", cfrRef, seen);
      observations.push({
        id,
        truth_kind: "observation",
        workspace_id: null,
        organization_id: null,
        plane: PLANE,
        visibility: VISIBILITY,
        tier: TIER,
        subject_ref: cfrRef,
        subject_type: "regulation_section",
        predicate: "regulation_text",
        value: {
          cfr_ref: cfrRef,
          title: a.new_title,
          chars: a.new_text.length,
        },
        provenance: {
          method: "source_extraction",
          asserted_by: "system",
          source_document_ids: [ctx.source_document_id],
          source_ids: [ctx.source_id],
          provenance_metadata: {
            ...frMeta,
            // Full replacement text present — but published-not-yet-effective.
            not_yet_in_force: true,
            amendment_instructions: a.amendment_instructions,
          },
        },
        temporal: {
          observed_at: ctx.observed_at,
          valid_from: a.effective_on, // FUTURE effective date
          valid_to: null,
        },
        status: STATUS,
        metadata: {
          cfr_ref: cfrRef,
          part: a.part,
          section: a.section,
          amendment_type: a.amendment_type,
          fr_citation: a.fr_citation,
          not_yet_in_force: true,
          excerpt: excerpt(a.new_text),
        },
        created_at: ctx.observed_at,
      });
    } else {
      // ---- Held Claim: an amendatory instruction, NOT a rewrite. Never merged. ----
      const id = makeId(ctx.id_prefix, "amd:claim", cfrRef, seen);
      claims.push({
        id,
        truth_kind: "claim",
        workspace_id: null,
        organization_id: null,
        plane: PLANE,
        visibility: VISIBILITY,
        tier: TIER,
        subject_ref: cfrRef,
        subject_type: "regulation_section",
        predicate: "amendatory_instruction",
        // The instruction itself is the claimant's assertion — the FR final rule.
        claimant_ref: `fr:${a.fr_document_number}`,
        claimant_name: `Federal Register — ${a.fr_rule_title}`,
        value: {
          cfr_ref: cfrRef,
          title: a.new_title,
          chars: 0, // no replacement text; the change lives in the instruction
        },
        provenance: {
          method: "source_extraction",
          asserted_by: "system",
          source_document_ids: [ctx.source_document_id],
          source_ids: [ctx.source_id],
          provenance_metadata: {
            ...frMeta,
            // Load-bearing: held pending human/deterministic merge; NEVER auto-applied.
            held_pending_merge: true,
            amendment_instructions: a.amendment_instructions,
          },
        },
        temporal: {
          observed_at: ctx.observed_at,
          valid_from: a.effective_on, // FUTURE effective date
          valid_to: null,
        },
        status: STATUS,
        metadata: {
          cfr_ref: cfrRef,
          part: a.part,
          section: a.section,
          amendment_type: a.amendment_type,
          fr_citation: a.fr_citation,
          held_pending_merge: true,
          instruction_count: a.amendment_instructions.length,
        },
        created_at: ctx.observed_at,
      });
    }
  }

  return { observations, claims };
}

// ---------------------------------------------------------------------------
// (4) ingestRegulatoryCorpus — one-shot: records + amendments + ctx → full corpus.
//     Deterministic; assembles the source document, all observations/claims, and
//     the rollups the downstream index/consumers report against.
// ---------------------------------------------------------------------------

export function ingestRegulatoryCorpus(
  records: RegulationRecord[],
  amendments: AmendmentRecord[],
  ctx: RegulatoryIngestContext,
): RegulatoryCorpus {
  const source_document = makeRegulatorySourceDocument(ctx, records.length);
  const inForce = ingestRegulations(records, ctx);
  const amended = ingestAmendments(amendments, ctx);

  // Per-part rollup of IN-FORCE sections only (amendments are future/held).
  const partIndex = new Map<string, PartSummary>();
  for (const r of records) {
    const existing = partIndex.get(r.part);
    if (existing) {
      existing.count += 1;
    } else {
      partIndex.set(r.part, {
        part: r.part,
        part_title: r.part_title,
        count: 1,
      });
    }
  }
  const parts = Array.from(partIndex.values()).sort((a, b) => {
    // Numeric part order when both parse as numbers, else lexicographic fallback.
    const na = Number(a.part);
    const nb = Number(b.part);
    if (Number.isFinite(na) && Number.isFinite(nb) && na !== nb) return na - nb;
    return a.part < b.part ? -1 : a.part > b.part ? 1 : 0;
  });

  return {
    source_document,
    observations: [...inForce, ...amended.observations],
    claims: amended.claims,
    parts,
    total_sections: inForce.length,
    pending_full_text: amended.observations.length,
    held_instructions: amended.claims.length,
  };
}

// ---------------------------------------------------------------------------
// (5) loadRegulatoryCorpus — THE ONE ALLOWED IMPURITY — lives in the companion
//     file `ingest_regulations_data.ts`, which statically `import`s the staged
//     JSON (resolveJsonModule; Next/webpack inlines it). It is deliberately kept
//     OUT of this module so THIS file stays side-effect-free and importable under
//     bare Node type-stripping (the debug loop imports the pure functions here and
//     supplies the parsed records itself via fs). Import the loader from:
//         "@/cartridges/cooperative_markets/ingest_regulations_data"
// ---------------------------------------------------------------------------
