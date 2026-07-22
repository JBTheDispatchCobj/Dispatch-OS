// cartridges/cooperative_markets/connectors/ncua_regulations_connector.ts
//
// Cooperative Markets — NCUA REGULATIONS CONNECTOR (Kernel RFC-2011).
//
// A concrete connector over the REAL 12 CFR Chapter VII corpus staged in
// docs/04_sources/ncua/ (675 in-force sections across all 41 NCUA parts). Unlike
// the 5300 batch (labeled illustrative figures), this connector runs on GENUINELY
// REAL public-domain regulatory text at scale — the honest "breadth of real
// sources" the sprint targets.
//
// It NORMALIZES each section record into a Dispatch-native {@link NormalizedRecord}
// (part / section / title / cfr_ref + a body fingerprint), keyed by the eCFR
// entity-resolution key `cfr_ref` (e.g. "12 CFR 745.4"), with valid-time = the
// eCFR issue date. It reaches NO conclusion and assigns NO tier — the runtime
// tiers each record `public_fact` from the SOURCE manifest (recordToObservation).
// The heavier bi-temporal ingestion (in-force vs pending-amendment handling) stays
// in ingest_regulations.ts; this connector is the acquire+normalize front door.
//
// PURE + DETERMINISTIC + SECRET-FREE. `acquire` returns the caller-STAGED records
// (the demo/debug read the JSON via fs and inject it — the connector reads no fs);
// `parse` is a pure map. No clock, no random.
//
// ERASABLE-ONLY TS: `import type` for types; ES2022; alias "@/*".

import {
  defineConnector,
  canonicalHash,
  type ConnectorDefinition,
  type NormalizedRecord,
  type SourceArtifact,
} from "@/core/kernel/connector_sdk";
import type { RegulationRecord } from "@/cartridges/cooperative_markets/ingest_regulations";

export const NCUA_REGULATIONS_CONNECTOR_KEY = "connector:ncua_regulations";
export const NCUA_REGULATIONS_SOURCE_KEY = "source:ncua_regulations";

function slug(cfrRef: string): string {
  return cfrRef.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}

/**
 * NORMALIZE one in-force regulation section → a {@link NormalizedRecord}. The
 * body text is fingerprinted (length + content hash) rather than inlined whole, so
 * the record stays small and change detection is exact: a re-issued section whose
 * text changed produces a different `body_hash` → an "updated" change event. PURE.
 */
export function parseRegulation(rec: RegulationRecord, issueDate: string): NormalizedRecord {
  return {
    external_ref: rec.cfr_ref,
    subject_ref: `cfr:${rec.cfr_ref}`,
    subject_type: "regulation",
    predicate: "in_force_section",
    value: {
      part: rec.part,
      part_title: rec.part_title,
      subpart: rec.subpart ?? null,
      section: rec.section,
      title: rec.title,
      node_type: rec.node_type,
      cfr_ref: rec.cfr_ref,
      body_len: rec.body_text.length,
      body_hash: canonicalHash(rec.body_text),
    },
    valid_from: `${issueDate}T00:00:00.000Z`,
    entity_candidates: [
      {
        object_class: "entity:coop_markets:regulation",
        display_name: `${rec.cfr_ref} — ${rec.title}`,
        canonical_slug: slug(rec.cfr_ref),
      },
    ],
    metadata: { source: "ncua_regulations", part: rec.part },
  };
}

/**
 * Build the NCUA regulations connector over the injected REAL corpus records +
 * the eCFR issue date the sections are valid as of. One captured artifact stands
 * for the bulk eCFR pull (the immutable source_documents row).
 */
export function makeNcuaRegulationsConnector(
  records: RegulationRecord[],
  issueDate: string,
): ConnectorDefinition<RegulationRecord> {
  const corpusArtifact: SourceArtifact = {
    external_ref: `ecfr:title-12:${issueDate}`,
    title: `eCFR Title 12 Chapter VII (issue ${issueDate})`,
    content_type: "text/xml",
    raw_content_reference: "docs/04_sources/ncua/ncua_regulations_clean.json",
    published_at: `${issueDate}T00:00:00.000Z`,
    content_hash: canonicalHash(records.map((r) => r.cfr_ref).sort().join("|")),
  };
  return defineConnector<RegulationRecord>({
    connector_key: NCUA_REGULATIONS_CONNECTOR_KEY,
    source_key: NCUA_REGULATIONS_SOURCE_KEY,
    acquire: () => ({ records: records.slice(), source_artifacts: [corpusArtifact] }),
    parse: (rec, ctx) => {
      void ctx; // source available if needed; parser reads no business rule from it
      return [parseRegulation(rec, issueDate)];
    },
  });
}
