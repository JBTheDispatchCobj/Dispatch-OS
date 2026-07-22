// cartridges/cooperative_markets/connectors/federal_register_connector.ts
//
// Cooperative Markets — FEDERAL REGISTER CONNECTOR (Kernel RFC-2011).
//
// A REAL connector authored against the generic Connector SDK, over the
// regulatory family of the source catalog. It NORMALIZES a Federal Register
// document header (the public metadata the GPO/OFR publishes for every rule,
// proposed rule, and notice) into a Dispatch-native {@link NormalizedRecord} —
// the document number, title, type, agencies, publication date — and surfaces the
// document as a regulation entity candidate keyed by its document number. Nothing
// more: no interpretation of the rule's meaning, no compliance conclusion.
//
// TRUTH DISCIPLINE (DOCTRINE / RFC-2011). Federal Register documents are official
// public records → the runtime tiers each record `public_fact` FROM THE SOURCE
// manifest (`source:federal_register`), never the connector. The connector asserts
// no Fact — it normalizes the header; the truth service decides meaning, and any
// regulatory CONCLUSION drawn from a rule is a downstream human-gated act, never a
// connector output. "Normalization never creates Facts."
//
// PURE + DETERMINISTIC + SECRET-FREE. `acquire` returns already-STAGED document
// headers the caller injected (no fs, no network, no credential); `parse` is a
// pure map. No clock, no random. Same documents → identical output.
//
// ERASABLE-ONLY TS: `import type` for types; ES2022; alias "@/*".

import {
  defineConnector,
  canonicalHash,
  type ConnectorDefinition,
  type NormalizedRecord,
  type SourceArtifact,
} from "@/core/kernel/connector_sdk";

export const FEDERAL_REGISTER_CONNECTOR_KEY = "connector:federal_register";
export const FEDERAL_REGISTER_SOURCE_KEY = "source:federal_register";
/** The regulation object class a Federal Register candidate is an instance of. */
export const FEDERAL_REGISTER_OBJECT_CLASS = "entity:coop_markets:regulation";

// ---------------------------------------------------------------------------
// Raw Federal Register document header (the document metadata — NOT the full
// rule text). The caller stages these from the public FederalRegister.gov JSON
// API; the connector reads no network.
// ---------------------------------------------------------------------------

export interface RawFederalRegisterDoc {
  /** FR document number, e.g. "2026-14213" — unique per document (the change key). */
  document_number: string;
  title: string;
  /** "Rule" | "Proposed Rule" | "Notice" | "Presidential Document". */
  type?: string;
  /** Publishing agencies (raw names as the FR lists them). */
  agencies?: string[];
  /** Publication date (observed/publication instant; caller-supplied, no clock). */
  publication_date: string;
  /** Effective date, when the document carries one. */
  effective_on?: string | null;
  /** The document's canonical html_url on federalregister.gov, when known. */
  html_url?: string | null;
  /** The FR abstract, when present. */
  abstract?: string | null;
}

/** Deterministic slug (lowercase alnum, "_"-joined). */
function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}

/**
 * NORMALIZE one Federal Register document header → a {@link NormalizedRecord}.
 * `external_ref` is the document number (unique per document — the change key);
 * `subject_ref` keys the regulation by document number; it surfaces the document
 * as a regulation entity candidate. PURE — header metadata only, no tier, no
 * conclusion.
 *
 * VALIDATION (normalize-honestly): a document with no usable document_number or no
 * title cannot be keyed or attributed, so it is REJECTED by throwing — the runtime
 * records a quality-report rejection (never a silent drop, never a fabricated
 * placeholder, never a deletion). Structural validation, NOT interpretation of the
 * rule.
 */
export function parseFederalRegisterDoc(raw: RawFederalRegisterDoc): NormalizedRecord {
  if (raw == null || typeof raw !== "object") {
    throw new Error("federal_register: document is empty/malformed (no header to normalize)");
  }
  const docNo = typeof raw.document_number === "string" ? raw.document_number.trim() : "";
  const title = typeof raw.title === "string" ? raw.title.trim() : "";
  if (docNo === "") {
    throw new Error("federal_register: document has no document_number (the per-document change key) — cannot normalize");
  }
  if (title === "") {
    throw new Error("federal_register: document has no title (document identity) — cannot normalize");
  }
  const agencies = Array.isArray(raw.agencies) ? raw.agencies.slice() : [];
  return {
    external_ref: docNo,
    subject_ref: `fedreg:${docNo}`,
    subject_type: "regulation",
    predicate: "federal_register_document",
    value: {
      document_number: docNo,
      title,
      type: raw.type ?? null,
      agencies,
      publication_date: raw.publication_date,
      effective_on: raw.effective_on ?? null,
      html_url: raw.html_url ?? null,
      abstract: raw.abstract ?? null,
    },
    valid_from: raw.publication_date,
    entity_candidates: [
      {
        object_class: FEDERAL_REGISTER_OBJECT_CLASS,
        display_name: title,
        canonical_slug: `fedreg_${slug(docNo)}`,
        external_ids: [{ system: "federal_register_document", value: docNo }],
      },
    ],
    metadata: { source: "federal_register", type: raw.type ?? null },
  };
}

/**
 * Tag an acquired record with a generic `external_ref` = its change-key (the FR
 * document number), so that if `parse` REJECTS this record (e.g. a valid document
 * number but a blank title), the runtime can still recover the ref and treat it as
 * "seen-but-unparseable" — NEVER a fabricated deletion of a previously-seen ref
 * (RFC-2011 load-bearing rule). Records with no usable document number are left
 * untouched (they were never in prior state either way).
 */
function withRef(raw: RawFederalRegisterDoc): RawFederalRegisterDoc & { external_ref?: string } {
  const key = typeof raw.document_number === "string" ? raw.document_number.trim() : "";
  return key === "" ? raw : { ...raw, external_ref: key };
}

/** Capture the raw document header as an immutable artifact (→ SourceDocument). */
function artifact(raw: RawFederalRegisterDoc): SourceArtifact {
  const raw_text = JSON.stringify(raw);
  return {
    external_ref: typeof raw.document_number === "string" ? raw.document_number : "fedreg:unknown",
    title: raw.title ?? null,
    content_type: "application/json",
    raw_text,
    published_at: raw.publication_date ?? null,
    content_hash: canonicalHash(raw_text),
  };
}

/**
 * Build the Federal Register connector over an injected batch of document headers.
 * The batch is the caller's STAGED FR data — the connector performs no I/O and
 * holds no secret.
 */
export function makeFederalRegisterConnector(
  documents: RawFederalRegisterDoc[],
): ConnectorDefinition<RawFederalRegisterDoc> {
  return defineConnector<RawFederalRegisterDoc>({
    connector_key: FEDERAL_REGISTER_CONNECTOR_KEY,
    source_key: FEDERAL_REGISTER_SOURCE_KEY,
    acquire: () => ({
      records: documents.map(withRef),
      source_artifacts: documents.map(artifact),
    }),
    parse: (raw) => [parseFederalRegisterDoc(raw)],
  });
}
