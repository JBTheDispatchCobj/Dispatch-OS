// cartridges/cooperative_markets/connectors/sec_edgar_connector.ts
//
// Cooperative Markets — SEC EDGAR CONNECTOR (Kernel RFC-2011).
//
// A THIRD real connector authored against the generic Connector SDK, over the
// securities/private-markets family of the source catalog. It NORMALIZES an SEC EDGAR
// filing header (the submissions metadata a filer/company publishes) into a
// Dispatch-native {@link NormalizedRecord} — form type / accession / dates / CIK — and
// surfaces the filer as an innovation-company entity candidate keyed by CIK. Nothing
// more: no interpretation of the filing's contents, no financial conclusion.
//
// TRUTH DISCIPLINE (DOCTRINE / RFC-2011). EDGAR filing headers are official public
// records → the runtime tiers each record `public_fact` from the SOURCE manifest
// (`source:sec_edgar`), never the connector. The connector still asserts no Fact — it
// normalizes the header; the truth service decides meaning. "Normalization never
// creates Facts."
//
// PURE + DETERMINISTIC + SECRET-FREE. `acquire` returns already-STAGED filing headers
// the caller injected (no fs, no network, no credential); `parse` is a pure map. No
// clock, no random. Same filings → identical output.
//
// ERASABLE-ONLY TS: `import type` for types; ES2022; alias "@/*".

import {
  defineConnector,
  canonicalHash,
  type ConnectorDefinition,
  type NormalizedRecord,
  type SourceArtifact,
} from "@/core/kernel/connector_sdk";

export const SEC_EDGAR_CONNECTOR_KEY = "connector:sec_edgar";
export const SEC_EDGAR_SOURCE_KEY = "source:sec_edgar";

// ---------------------------------------------------------------------------
// Raw EDGAR filing header (the submissions metadata — NOT the filing contents).
// The caller stages these from EDGAR's public JSON; the connector reads no network.
// ---------------------------------------------------------------------------

export interface RawEdgarFiling {
  /** SEC Central Index Key — the filer's primary key (identifying external id). */
  cik: string;
  company: string;
  /** e.g. "D" | "10-K" | "8-K" | "ADV". */
  form_type: string;
  /** EDGAR accession number, e.g. "0001234567-26-000123" — unique per filing. */
  accession_number: string;
  /** Filing date (observed/publication instant; caller-supplied, no clock). */
  filing_date: string;
  /** Reporting period the filing covers, when applicable. */
  period_of_report?: string;
  /** The primary document filename within the accession, when known. */
  primary_document?: string;
}

/** Deterministic slug for a company name (lowercase alnum, "_"-joined). */
function slug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}

/**
 * NORMALIZE one EDGAR filing header → a {@link NormalizedRecord}. `external_ref` is the
 * accession number (unique per filing — the change-detection key); `subject_ref` keys
 * the filer by CIK; it surfaces the company as an innovation-company entity candidate
 * keyed by CIK. PURE — filing metadata only, no tier, no conclusion.
 *
 * VALIDATION (normalize-honestly): a filing with no usable accession number or CIK
 * cannot be keyed or attributed, so it is REJECTED by throwing — the runtime records a
 * quality-report rejection (never a silent drop, never a fabricated placeholder record,
 * never a deletion). A well-formed header never throws. This is structural validation
 * (is the change-key present?), NOT business interpretation of the filing's contents.
 */
export function parseEdgarFiling(raw: RawEdgarFiling): NormalizedRecord {
  if (raw == null || typeof raw !== "object") {
    throw new Error("sec_edgar: filing is empty/malformed (no header to normalize)");
  }
  const accession = typeof raw.accession_number === "string" ? raw.accession_number.trim() : "";
  const cik = typeof raw.cik === "string" ? raw.cik.trim() : "";
  if (accession === "") {
    throw new Error("sec_edgar: filing has no accession_number (the per-filing change key) — cannot normalize");
  }
  if (cik === "") {
    throw new Error("sec_edgar: filing has no CIK (the filer identity) — cannot normalize");
  }
  return {
    external_ref: raw.accession_number,
    subject_ref: `sec_cik:${raw.cik}`,
    subject_type: "innovation_company",
    predicate: "sec_edgar_filing",
    value: {
      cik: raw.cik,
      company: raw.company,
      form_type: raw.form_type,
      accession_number: raw.accession_number,
      period_of_report: raw.period_of_report ?? null,
      primary_document: raw.primary_document ?? null,
    },
    valid_from: raw.filing_date,
    entity_candidates: [
      {
        object_class: "entity:coop_markets:innovation_company",
        display_name: raw.company,
        canonical_slug: slug(raw.company),
        external_ids: [{ system: "sec_cik", value: raw.cik }],
      },
    ],
    metadata: { source: "sec_edgar", form_type: raw.form_type },
  };
}

/**
 * Tag an acquired filing with a generic `external_ref` = its change-key (the
 * accession number), so that if `parse` REJECTS this filing (e.g. a valid accession
 * but a blank CIK), the runtime can still recover the ref and treat it as
 * "seen-but-unparseable" — NEVER a fabricated deletion of a previously-seen ref
 * (RFC-2011 load-bearing rule). Filings with no usable accession are left untouched
 * (they were never in prior state either way).
 */
function withRef(raw: RawEdgarFiling): RawEdgarFiling & { external_ref?: string } {
  const key = typeof raw.accession_number === "string" ? raw.accession_number.trim() : "";
  return key === "" ? raw : { ...raw, external_ref: key };
}

/** Capture the raw filing header as an immutable artifact (→ SourceDocument via the runtime). */
function artifact(raw: RawEdgarFiling): SourceArtifact {
  const raw_text = JSON.stringify(raw);
  return {
    external_ref: raw.accession_number,
    title: `${raw.company} ${raw.form_type} ${raw.accession_number}`,
    content_type: "application/json",
    raw_text,
    published_at: raw.filing_date,
    content_hash: canonicalHash(raw_text),
  };
}

/**
 * Build the SEC EDGAR connector over an injected batch of filing headers. The batch is
 * the caller's STAGED EDGAR data — the connector performs no I/O and holds no secret.
 */
export function makeSecEdgarConnector(
  filings: RawEdgarFiling[],
): ConnectorDefinition<RawEdgarFiling> {
  return defineConnector<RawEdgarFiling>({
    connector_key: SEC_EDGAR_CONNECTOR_KEY,
    source_key: SEC_EDGAR_SOURCE_KEY,
    acquire: () => ({
      records: filings.map(withRef),
      source_artifacts: filings.map(artifact),
    }),
    parse: (raw) => [parseEdgarFiling(raw)],
  });
}
