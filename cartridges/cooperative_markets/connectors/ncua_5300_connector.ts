// cartridges/cooperative_markets/connectors/ncua_5300_connector.ts
//
// Cooperative Markets — NCUA 5300 Call Report CONNECTOR (Kernel RFC-2011).
//
// A concrete connector authored against the generic Connector SDK
// (core/kernel/connector_sdk.ts) and executed by the generic runtime
// (core/kernel/connector_runtime.ts). It NORMALIZES a quarterly 5300 payload into
// a Dispatch-native {@link NormalizedRecord} of the AS-REPORTED figures + an
// entity candidate for the credit union — and NOTHING MORE.
//
// TRUTH DISCIPLINE (DOCTRINE / RFC-2011). The connector does NOT compute the
// PCA / ROA / loan-to-share ratios: those are a downstream
// `deterministic_calculation` (cartridges/.../ingest_call_report.ts +
// ingest_batch.ts), not a connector's business. "Normalization never creates
// Facts." The record's truth TIER / plane / visibility are taken from the SOURCE
// manifest by the runtime (recordToObservation), never chosen here.
//
// PURE + DETERMINISTIC + SECRET-FREE. `acquire` returns already-STAGED raw
// payloads the caller injected (the connector reads no fs, holds no credential);
// `parse` is a pure map. No clock, no random. Same batch → identical output.
//
// NOTE ON DATA: the staged batch is the LABELED illustrative 5300 set
// (batch_fixtures.ts) pending a bulk NCUA feed — a Bryan-only external item. The
// connector is source-agnostic: it normalizes the same way over the fixtures or a
// future live bulk pull; it asserts no realness about the figures.
//
// ERASABLE-ONLY TS: `import type` for types; ES2022; alias "@/*".

import {
  defineConnector,
  canonicalHash,
  type ConnectorDefinition,
  type NormalizedRecord,
  type SourceArtifact,
} from "@/core/kernel/connector_sdk";
import type { Raw5300 } from "@/cartridges/cooperative_markets/ingest_call_report";

export const NCUA_5300_CONNECTOR_KEY = "connector:ncua_5300_call_report";
export const NCUA_5300_SOURCE_KEY = "source:ncua_5300_call_report";

/** "2026-Q1" → the quarter-end UTC instant the filing is valid as of (or null). */
export function periodValidFrom(period: string): string | null {
  const m = /^(\d{4})-Q([1-4])$/.exec(period.trim());
  if (!m) return null;
  const end = { "1": "03-31", "2": "06-30", "3": "09-30", "4": "12-31" }[m[2]];
  return `${m[1]}-${end}T00:00:00.000Z`;
}

/** Deterministic slug for an institution name (lowercase alnum, "_"-joined). */
function slug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}

/**
 * NORMALIZE one raw 5300 payload → a {@link NormalizedRecord} of the as-reported
 * figures. The record's `value` is the reported numbers verbatim (no ratios); its
 * `external_ref` is the filing's `source_ref` (the change-detection key); it
 * surfaces the credit union as an entity candidate keyed by NCUA charter. PURE.
 */
export function parse5300(raw: Raw5300): NormalizedRecord {
  return {
    external_ref: raw.source_ref,
    subject_ref: `ncua_charter:${raw.charter_number}`,
    subject_type: "credit_union",
    predicate: "call_report_5300",
    value: {
      charter_number: raw.charter_number,
      institution: raw.institution,
      period: raw.period,
      total_assets: raw.total_assets,
      net_worth: raw.net_worth,
      total_loans: raw.total_loans,
      total_shares: raw.total_shares,
      net_income: raw.net_income,
      average_assets: raw.average_assets,
      delinquent_loans: raw.delinquent_loans,
      members: raw.members,
      members_prior: raw.members_prior ?? null,
      digital_adoption: raw.digital_adoption ?? null,
    },
    valid_from: periodValidFrom(raw.period),
    entity_candidates: [
      {
        object_class: "entity:coop_markets:credit_union",
        display_name: raw.institution,
        canonical_slug: slug(raw.institution),
        external_ids: [{ system: "ncua_charter", value: raw.charter_number }],
      },
    ],
    metadata: { source: "ncua_5300", period: raw.period },
  };
}

/** Capture the raw filing as an immutable artifact (→ SourceDocument via the runtime). */
function artifact(raw: Raw5300): SourceArtifact {
  const raw_text = JSON.stringify(raw);
  return {
    external_ref: raw.source_ref,
    title: `${raw.institution} 5300 ${raw.period}`,
    content_type: "application/json",
    raw_text,
    published_at: periodValidFrom(raw.period),
    content_hash: canonicalHash(raw_text),
  };
}

/**
 * Build the NCUA 5300 connector over an injected batch of raw payloads. The batch
 * is the caller's STAGED data (fixtures today, a bulk pull later) — the connector
 * itself performs no I/O and holds no secret.
 */
export function makeNcua5300Connector(rawBatch: Raw5300[]): ConnectorDefinition<Raw5300> {
  return defineConnector<Raw5300>({
    connector_key: NCUA_5300_CONNECTOR_KEY,
    source_key: NCUA_5300_SOURCE_KEY,
    acquire: () => ({
      records: rawBatch.slice(),
      source_artifacts: rawBatch.map(artifact),
    }),
    parse: (raw) => [parse5300(raw)],
  });
}
