// cartridges/cooperative_markets/connectors/startup_intake_connector.ts
//
// Cooperative Markets — STARTUP INTAKE CONNECTOR (Kernel RFC-2011).
//
// The DEFERRED "live intake path" (ACTIVE_BUILD): a concrete connector authored
// against the generic Connector SDK that NORMALIZES a raw startup-intake submission
// into a Dispatch-native {@link NormalizedRecord} — the applicant's self-reported
// readiness signals + an innovation-company entity candidate — and NOTHING MORE.
//
// TRUTH DISCIPLINE (DOCTRINE / RFC-2011). A submission is a company's OWN claim about
// itself. The connector assigns NO truth tier and reaches NO score: the runtime tiers
// each record from the SOURCE manifest — `source:startup_intake` is
// `third_party_claim` on the shared_market plane at `network` visibility — so an
// intake record becomes a third-party CLAIM observation, never a fact and never a
// deal-engine conclusion. The scoring (P1 `deal_engine.ts` / P2 `ic_memo.ts`) is a
// downstream `dispatch_inference`, human-gated (ICApproval + EditorialDisposition).
// "Normalization never creates Facts" — and intake certainly never creates a Fact.
//
// PURE + DETERMINISTIC + SECRET-FREE. `acquire` returns already-STAGED submissions the
// caller injected (no fs, no network, no credential); `parse` is a pure map. No clock,
// no random. Same submissions → identical output.
//
// ERASABLE-ONLY TS: `import type` for types; ES2022; alias "@/*".

import {
  defineConnector,
  canonicalHash,
  type ConnectorDefinition,
  type NormalizedRecord,
  type SourceArtifact,
} from "@/core/kernel/connector_sdk";

export const STARTUP_INTAKE_CONNECTOR_KEY = "connector:startup_intake";
export const STARTUP_INTAKE_SOURCE_KEY = "source:startup_intake";

// ---------------------------------------------------------------------------
// Raw intake submission — the self-reported form fields (NOT scores, NOT facts).
// Each readiness signal is a self-reported 0..1 value; the connector carries them
// verbatim. The caller stamps the submission id + submitted_at (traceability).
// ---------------------------------------------------------------------------

export interface RawStartupIntake {
  /** Stable submission id within the intake source — the change-detection key. */
  submission_id: string;
  company: string;
  /** Applicant-declared product category (e.g. "real_time_payments"). */
  category: string;
  /** Applicant website/domain (an identifying external id for the company). */
  domain?: string;
  /** Applicant-declared instant the form was submitted (valid-time; no clock here). */
  submitted_at?: string;

  // --- Innovation signals (self-reported 0..1) ---
  capability_differentiation?: number;
  competitive_position?: number;
  innovation_velocity?: number;
  traction?: number;
  // --- Startup (institutional) readiness signals (self-reported 0..1) ---
  compliance_readiness?: number; // SOC 2 / policies — the GATING factor downstream
  security_posture?: number;
  cu_references?: number;
  financial_stability?: number;
  support_model?: number;
  // --- Dispatch (technical) readiness signals (self-reported 0..1) ---
  api_maturity?: number;
  connector_availability?: number;
  integration_standards?: number;
  // --- Opportunity/fit signals for a target pairing (self-reported 0..1) ---
  strategic_fit?: number;
  regulatory_fit?: number;
  timing?: number;
}

/** The intake signal keys carried verbatim into the normalized record's `value`. */
export const INTAKE_SIGNAL_KEYS: (keyof RawStartupIntake)[] = [
  "capability_differentiation",
  "competitive_position",
  "innovation_velocity",
  "traction",
  "compliance_readiness",
  "security_posture",
  "cu_references",
  "financial_stability",
  "support_model",
  "api_maturity",
  "connector_availability",
  "integration_standards",
  "strategic_fit",
  "regulatory_fit",
  "timing",
];

/** Deterministic slug for a company name (lowercase alnum, "_"-joined). */
function slug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}

/**
 * NORMALIZE one raw intake submission → a {@link NormalizedRecord} carrying the
 * self-reported signals verbatim. `external_ref` is the submission id (the change key);
 * `subject_ref` keys the applicant company; it surfaces the company as an entity
 * candidate (innovation_company) keyed by its domain when supplied. PURE — no scoring,
 * no tiering, no gate; the connector just re-expresses the form. Signals absent from
 * the form are simply not carried (the downstream engine imputes conservatively).
 */
export function parseStartupIntake(raw: RawStartupIntake): NormalizedRecord {
  const value: Record<string, unknown> = {
    company: raw.company,
    category: raw.category,
    domain: raw.domain ?? null,
  };
  for (const k of INTAKE_SIGNAL_KEYS) {
    const v = raw[k];
    if (typeof v === "number") value[k as string] = v;
  }
  return {
    external_ref: raw.submission_id,
    subject_ref: `startup_intake:${slug(raw.company)}`,
    subject_type: "innovation_company",
    predicate: "startup_intake_submission",
    value,
    valid_from: raw.submitted_at ?? null,
    entity_candidates: [
      {
        object_class: "entity:coop_markets:innovation_company",
        display_name: raw.company,
        canonical_slug: slug(raw.company),
        external_ids: raw.domain ? [{ system: "domain", value: raw.domain }] : undefined,
      },
    ],
    metadata: { source: "startup_intake", category: raw.category },
  };
}

/** Capture the raw submission as an immutable artifact (→ SourceDocument via the runtime). */
function artifact(raw: RawStartupIntake): SourceArtifact {
  const raw_text = JSON.stringify(raw);
  return {
    external_ref: raw.submission_id,
    title: `${raw.company} intake ${raw.submission_id}`,
    content_type: "application/json",
    raw_text,
    published_at: raw.submitted_at ?? null,
    content_hash: canonicalHash(raw_text),
  };
}

/**
 * Build the startup-intake connector over an injected batch of submissions. The batch
 * is the caller's STAGED intake data — the connector performs no I/O and holds no secret.
 */
export function makeStartupIntakeConnector(
  submissions: RawStartupIntake[],
): ConnectorDefinition<RawStartupIntake> {
  return defineConnector<RawStartupIntake>({
    connector_key: STARTUP_INTAKE_CONNECTOR_KEY,
    source_key: STARTUP_INTAKE_SOURCE_KEY,
    acquire: () => ({
      records: submissions.slice(),
      source_artifacts: submissions.map(artifact),
    }),
    parse: (raw) => [parseStartupIntake(raw)],
  });
}
