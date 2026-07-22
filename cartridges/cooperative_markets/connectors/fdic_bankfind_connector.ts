// cartridges/cooperative_markets/connectors/fdic_bankfind_connector.ts
//
// Cooperative Markets — FDIC BankFind CONNECTOR (Kernel RFC-2011).
//
// A REAL connector authored against the generic Connector SDK, over the
// institution family of the source catalog. It NORMALIZES an FDIC BankFind
// institution record (the public metadata the FDIC publishes for every insured
// depository institution) into a Dispatch-native {@link NormalizedRecord} — the
// FDIC certificate id, name, location, active flag, headline size — and surfaces
// the institution as an entity candidate keyed by its FDIC CERT. Nothing more: no
// interpretation, no financial conclusion, no truth tier.
//
// SCOPE / HONESTY. FDIC BankFind covers FDIC-INSURED depository institutions
// (banks + savings institutions) — NOT NCUA credit unions (those come through the
// NCUA 5300 connector). The entity candidate's object_class is the generic
// `entity:coop_markets:financial_institution`, so a bank is never mislabeled a
// credit union.
//
// TRUTH DISCIPLINE (DOCTRINE / RFC-2011). FDIC institution records are official
// public regulatory data → the runtime tiers each record `public_fact` FROM THE
// SOURCE manifest (`source:fdic_bankfind`), never the connector. The connector
// asserts no Fact — it normalizes the record; the truth service decides meaning.
// "Normalization never creates Facts."
//
// PURE + DETERMINISTIC + SECRET-FREE. `acquire` returns already-STAGED records the
// caller injected (no fs, no network, no credential); `parse` is a pure map. No
// clock, no random. Same records → identical output.
//
// ERASABLE-ONLY TS: `import type` for types; ES2022; alias "@/*".

import {
  defineConnector,
  canonicalHash,
  type ConnectorDefinition,
  type NormalizedRecord,
  type SourceArtifact,
} from "@/core/kernel/connector_sdk";

export const FDIC_BANKFIND_CONNECTOR_KEY = "connector:fdic_bankfind";
export const FDIC_BANKFIND_SOURCE_KEY = "source:fdic_bankfind";
/** The generic institution object class an FDIC candidate is an instance of. */
export const FDIC_INSTITUTION_OBJECT_CLASS = "entity:coop_markets:financial_institution";

// ---------------------------------------------------------------------------
// Raw FDIC BankFind institution record (the public institution metadata).
// The caller stages these from FDIC's public JSON API; the connector reads no
// network. Field names mirror the BankFind `data` object (CERT / NAME / STALP…).
// ---------------------------------------------------------------------------

export interface RawFdicInstitution {
  /** FDIC certificate number — the institution's primary key (identifying id). */
  cert: string;
  /** Legal institution name. */
  name: string;
  city?: string;
  /** Two-letter state/territory abbreviation (BankFind `STALP`). */
  stalp?: string;
  /** 1/true = active, 0/false = inactive (BankFind `ACTIVE`). */
  active?: number | boolean;
  /** Total assets in USD thousands, as reported (BankFind `ASSET`), when present. */
  asset?: number | null;
  /** Established date, when present (BankFind `ESTYMD`). */
  established?: string | null;
  /** The as-of date of the pull (valid-time; caller-supplied, no clock). */
  data_date?: string;
}

/** Deterministic slug (lowercase alnum, "_"-joined). */
function slug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}

/** Normalize the ACTIVE flag (0/1 or bool) to a boolean, when present. */
function normActive(v: number | boolean | undefined): boolean | null {
  if (v === undefined) return null;
  if (typeof v === "boolean") return v;
  return v === 1;
}

/**
 * NORMALIZE one FDIC institution record → a {@link NormalizedRecord}.
 * `external_ref` is the FDIC CERT (unique per institution — the change-detection
 * key); `subject_ref` keys the institution by CERT; it surfaces the institution as
 * a financial-institution entity candidate keyed by CERT. PURE — metadata only, no
 * tier, no conclusion.
 *
 * VALIDATION (normalize-honestly): a record with no usable CERT or no name cannot
 * be keyed or attributed, so it is REJECTED by throwing — the runtime records a
 * quality-report rejection (never a silent drop, never a fabricated placeholder,
 * never a deletion). This is STRUCTURAL validation (is the change-key present?),
 * NOT business interpretation of the institution's condition.
 */
export function parseFdicInstitution(raw: RawFdicInstitution): NormalizedRecord {
  if (raw == null || typeof raw !== "object") {
    throw new Error("fdic_bankfind: record is empty/malformed (nothing to normalize)");
  }
  const cert = typeof raw.cert === "string" ? raw.cert.trim() : "";
  const name = typeof raw.name === "string" ? raw.name.trim() : "";
  if (cert === "") {
    throw new Error("fdic_bankfind: record has no CERT (the per-institution change key) — cannot normalize");
  }
  if (name === "") {
    throw new Error("fdic_bankfind: record has no name (institution identity) — cannot normalize");
  }
  return {
    external_ref: cert,
    subject_ref: `fdic_cert:${cert}`,
    subject_type: "financial_institution",
    predicate: "fdic_institution",
    value: {
      cert,
      name,
      city: raw.city ?? null,
      state: raw.stalp ?? null,
      active: normActive(raw.active),
      asset: raw.asset ?? null,
      established: raw.established ?? null,
    },
    valid_from: raw.data_date ?? null,
    entity_candidates: [
      {
        object_class: FDIC_INSTITUTION_OBJECT_CLASS,
        display_name: name,
        canonical_slug: slug(name),
        external_ids: [{ system: "fdic_cert", value: cert }],
      },
    ],
    metadata: { source: "fdic_bankfind", state: raw.stalp ?? null },
  };
}

/**
 * Tag an acquired record with a generic `external_ref` = its change-key (the CERT),
 * so that if `parse` REJECTS this record (e.g. a valid CERT but a blank name), the
 * runtime can still recover the ref and treat it as "seen-but-unparseable" — NEVER
 * a fabricated deletion of a previously-seen ref (RFC-2011 load-bearing rule). The
 * parser still reads `raw.cert`; this only aids rejection-ref recovery. Records with
 * no usable CERT are left untouched (they were never in prior state either way).
 */
function withRef(raw: RawFdicInstitution): RawFdicInstitution & { external_ref?: string } {
  const key = typeof raw.cert === "string" ? raw.cert.trim() : "";
  return key === "" ? raw : { ...raw, external_ref: key };
}

/** Capture the raw institution record as an immutable artifact (→ SourceDocument). */
function artifact(raw: RawFdicInstitution): SourceArtifact {
  const raw_text = JSON.stringify(raw);
  return {
    external_ref: typeof raw.cert === "string" ? raw.cert : "fdic:unknown",
    title: `FDIC ${raw.name} (CERT ${raw.cert})`,
    content_type: "application/json",
    raw_text,
    published_at: raw.data_date ?? null,
    content_hash: canonicalHash(raw_text),
  };
}

/**
 * Build the FDIC BankFind connector over an injected batch of institution records.
 * The batch is the caller's STAGED FDIC data — the connector performs no I/O and
 * holds no secret.
 */
export function makeFdicBankfindConnector(
  institutions: RawFdicInstitution[],
): ConnectorDefinition<RawFdicInstitution> {
  return defineConnector<RawFdicInstitution>({
    connector_key: FDIC_BANKFIND_CONNECTOR_KEY,
    source_key: FDIC_BANKFIND_SOURCE_KEY,
    acquire: () => ({
      records: institutions.map(withRef),
      source_artifacts: institutions.map(artifact),
    }),
    parse: (raw) => [parseFdicInstitution(raw)],
  });
}
