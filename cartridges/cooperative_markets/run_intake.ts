// cartridges/cooperative_markets/run_intake.ts
//
// Cooperative Markets — STARTUP INTAKE → DEAL ENGINE wiring (Sprint III Wave 2).
//
// Closes the DEFERRED "live intake path": run the startup-intake connector THROUGH the
// generic Connector Runtime, then materialize its NORMALIZED output into the deal
// engine's sourced inputs so P1 (scoring) and P2 (IC memo) run on REAL normalized
// intake — not seed inputs. This is CARTRIDGE orchestration over the generic kernel
// runtime; no vertical noun leaked into core/.
//
// WHAT IT PROVES (the Sprint-III Wave-2 intake seam, end to end):
//   1. An intake run is AUTHORIZED + CORRELATED through a kernel envelope
//      (service-role shared-market write) and emits a KernelEvent + CostEntry.
//   2. The runtime NORMALIZES (the connector) — the raw submission's self-reported
//      signals become Dispatch-native records; recordToObservation tiers them from the
//      SOURCE manifest as `third_party_claim` (a company's own claim), NEVER a fact and
//      NEVER a score in the connector.
//   3. The normalized intake feeds the EXISTING deal engine: each self-reported signal
//      becomes a `SourcedInput` citing the submission's source_ref, so every score's
//      lineage traces back to the intake. The recommendation stays a PROPOSAL; the human
//      gates (ICApproval on the memo, EditorialDisposition on publication) are UNTOUCHED.
//
// TRUTH DISCIPLINE. Intake is self-reported → the sourced inputs carry a modest,
// documented `INTAKE_CLAIM_CONFIDENCE` (unverified pending diligence), and the scores
// remain `dispatch_inference`s with explicit lineage — no regulated/financial
// conclusion in a weight.
//
// PURE-ish: every id/instant is injected; the only impurity is the catalog fs read
// behind sourceByKey (overridable via opts.source). Materialization is deterministic.
// isolatedModules-friendly: `import type` for types; ES2022; alias "@/*".

import { makeEnvelope, type RequestEnvelope } from "@/core/kernel/envelope";
import { systemPrincipal } from "@/core/kernel/identity";
import { EventBus } from "@/core/kernel/event_bus";
import { CostLedger } from "@/core/kernel/cost_ledger";
import { runConnector, type ConnectorRunResult } from "@/core/kernel/connector_runtime";
import {
  recordToObservation,
  type ConnectorOutputContract,
  type NormalizedRecord,
} from "@/core/kernel/connector_sdk";
import type { Observation } from "@/core/truth/types";
import type { SourceRegistryEntry } from "@/core/registry/types";
import { sourceByKey } from "@/core/registry/connectors";
import {
  makeStartupIntakeConnector,
  STARTUP_INTAKE_SOURCE_KEY,
  type RawStartupIntake,
} from "@/cartridges/cooperative_markets/connectors/startup_intake_connector";
import {
  assembleScorecard,
  type StartupProfile,
  type InstitutionReadinessInput,
  type OpportunityContext,
  type SourcedInput,
  type DealScorecard,
} from "@/cartridges/cooperative_markets/deal_engine";
import {
  assembleICMemo,
  type ICMemo,
  type DiligenceFinding,
} from "@/cartridges/cooperative_markets/ic_memo";

// ---------------------------------------------------------------------------
// Confidence for a self-reported intake claim (unverified pending diligence).
// Distinct from a filed-5300 fact (0.85+): intake is a third_party_claim.
// ---------------------------------------------------------------------------

export const INTAKE_CLAIM_CONFIDENCE = 0.5;

export interface IntakeRunOptions {
  /** The instant the run is stamped (injected). */
  as_of: string;
  correlation_id?: string;
  /** Override the source manifest (default: from the config-as-data catalog). */
  source?: SourceRegistryEntry;
  /** Prior external_ref → hash for change detection (a previous run's state). */
  prior?: Map<string, string>;
  bus?: EventBus;
  ledger?: CostLedger;
}

/** A monotonic, deterministic id generator (no clock, no random). */
function counter(prefix: string): () => string {
  let n = 0;
  return () => `${prefix}:${n++}`;
}

/** The service-role envelope a shared-market ingestion run authorizes through. */
function serviceEnvelope(as_of: string, correlation_id: string): RequestEnvelope {
  return makeEnvelope({
    principal: systemPrincipal(),
    correlation_id,
    plane: "shared_market",
    occurred_at: as_of,
    request_id: `${correlation_id}:req`,
  });
}

function resolveSource(key: string, override?: SourceRegistryEntry): SourceRegistryEntry {
  if (override) return override;
  const s = sourceByKey(key);
  if (!s) throw new Error(`run_intake: source ${key} not found in the connector catalog`);
  return s;
}

// ---------------------------------------------------------------------------
// Normalized intake record → deal-engine sourced inputs
// ---------------------------------------------------------------------------

/** Build a SourcedInput for a signal present on a normalized record, citing its ref. */
function sourced(rec: NormalizedRecord, key: string): SourcedInput | undefined {
  const v = (rec.value as Record<string, unknown>)[key];
  if (typeof v !== "number") return undefined;
  return { value: v, source_ref: rec.external_ref, confidence: INTAKE_CLAIM_CONFIDENCE };
}

/** A conservative sourced default for a REQUIRED opportunity signal that was omitted. */
function sourcedOrDefault(rec: NormalizedRecord, key: string): SourcedInput {
  return sourced(rec, key) ?? { value: 0.4, source_ref: rec.external_ref, confidence: 0.2 };
}

/** Materialize a normalized intake record → a deal-engine {@link StartupProfile}. */
export function recordToStartupProfile(rec: NormalizedRecord): StartupProfile {
  const v = rec.value as Record<string, unknown>;
  return {
    company: String(v.company),
    ref: rec.subject_ref ?? rec.external_ref,
    category: String(v.category),
    capability_differentiation: sourced(rec, "capability_differentiation"),
    competitive_position: sourced(rec, "competitive_position"),
    innovation_velocity: sourced(rec, "innovation_velocity"),
    traction: sourced(rec, "traction"),
    compliance_readiness: sourced(rec, "compliance_readiness"),
    security_posture: sourced(rec, "security_posture"),
    cu_references: sourced(rec, "cu_references"),
    financial_stability: sourced(rec, "financial_stability"),
    support_model: sourced(rec, "support_model"),
    api_maturity: sourced(rec, "api_maturity"),
    connector_availability: sourced(rec, "connector_availability"),
    integration_standards: sourced(rec, "integration_standards"),
  };
}

/** Materialize a normalized intake record → the {@link OpportunityContext} for a pairing. */
export function recordToOpportunity(rec: NormalizedRecord): OpportunityContext {
  return {
    strategic_fit: sourcedOrDefault(rec, "strategic_fit"),
    regulatory_fit: sourcedOrDefault(rec, "regulatory_fit"),
    timing: sourcedOrDefault(rec, "timing"),
  };
}

// ---------------------------------------------------------------------------
// The run
// ---------------------------------------------------------------------------

/** One scored applicant: the normalized record, its P1 scorecard, and (optional) P2 memo. */
export interface ScoredIntake {
  record: NormalizedRecord;
  startup: StartupProfile;
  opportunity: OpportunityContext;
  scorecard: DealScorecard;
}

export interface IntakeRunResult {
  output: ConnectorOutputContract;
  result: ConnectorRunResult;
  /** Truth Observations built from the normalized records via the SOURCE manifest (third_party_claim). */
  observations: Observation[];
  /** Each applicant scored through the EXISTING deal engine on normalized intake. */
  scored: ScoredIntake[];
}

/**
 * Run the startup-intake connector through the runtime, then score each normalized
 * submission against a target institution through the EXISTING deal engine (P1).
 * Deterministic given the injected batch + as_of. The `institution` readiness is
 * injected by the caller (e.g. from the 5300 path); a labeled illustrative default is
 * used when none is supplied so the intake path is demoable standalone.
 */
export async function runStartupIntake(
  submissions: RawStartupIntake[],
  institution: InstitutionReadinessInput,
  opts: IntakeRunOptions,
): Promise<IntakeRunResult> {
  const correlation_id = opts.correlation_id ?? "corr:connector:startup_intake";
  const source = resolveSource(STARTUP_INTAKE_SOURCE_KEY, opts.source);
  const env = serviceEnvelope(opts.as_of, correlation_id);
  const connector = makeStartupIntakeConnector(submissions);

  const result = await runConnector(
    { connector, source, env },
    { idGen: counter("ev:intake"), bus: opts.bus, ledger: opts.ledger, prior: opts.prior, costPerAttempt: 0.001 },
  );
  if (!result.ok) throw new Error(`startup-intake connector refused: ${result.refusal.reason}`);
  const output = result.output;

  // Normalized records → truth Observations (tier/plane FROM THE SOURCE manifest —
  // third_party_claim, the applicant's own claim). NEVER a fact, never a score.
  const obsIds = counter("obs:intake");
  const observations: Observation[] = output.observations.map((rec) =>
    recordToObservation(rec, source, {
      id: obsIds(),
      observed_at: opts.as_of,
      asserted_by: "system",
      source_document_ids: [rec.external_ref],
    }),
  );

  // Normalized intake → the EXISTING deal engine (P1). Each signal cites the submission.
  const scored: ScoredIntake[] = output.observations.map((rec) => {
    const startup = recordToStartupProfile(rec);
    const opportunity = recordToOpportunity(rec);
    const scorecard = assembleScorecard(startup, institution, opportunity);
    return { record: rec, startup, opportunity, scorecard };
  });

  return { output, result, observations, scored };
}

// ---------------------------------------------------------------------------
// P2: an IC memo from normalized intake + diligence findings (human-gated downstream)
// ---------------------------------------------------------------------------

/**
 * Assemble a P2 IC memo for a scored applicant from its P1 scorecard + caller-supplied
 * diligence findings (the memo enforces approved-evidence-only itself). This is the
 * intake path reaching P2; the committee decision remains a separate human gate —
 * `assembleICMemo` returns a DRAFT proposal, never an autonomous decision.
 */
export function intakeICMemo(scored: ScoredIntake, findings: DiligenceFinding[]): ICMemo {
  return assembleICMemo(scored.scorecard, findings);
}

/**
 * A labeled illustrative institution-readiness input for the standalone intake demo
 * (NOT real — the real path injects readiness from the 5300 ingestion). Kept here, out
 * of the intake fixtures, so the connector fixtures stay purely the applicant claims.
 */
export function illustrativeInstitutionReadiness(): InstitutionReadinessInput {
  const src = "sourcedoc:ncua:5300:synthetic:demo:2026Q1";
  const s = (value: number): SourcedInput => ({ value, source_ref: src, confidence: 0.6 });
  return {
    institution: "Summit Ridge FCU (illustrative)",
    ref: "60441",
    executive_support: s(0.72),
    budget_capacity: s(0.68),
    tech_ops_capacity: s(0.66),
    security_compliance_posture: s(0.7),
    strategic_alignment: s(0.64),
    digital_ai_maturity: s(0.71),
  };
}
