// cartridges/cooperative_markets/run_connectors.ts
//
// Cooperative Markets — CONNECTOR WIRING: run the vertical's connectors THROUGH
// the generic Connector Runtime and materialize their normalized output into the
// truth + profile layers. This is the CARTRIDGE's orchestration (business meaning
// lives here, in the vertical) over the generic kernel runtime (which only
// acquires + normalizes + emits). No vertical noun leaked into core/.
//
// WHAT IT PROVES (the Sprint-III Wave-1 seam, end to end):
//   1. A connector run is AUTHORIZED + CORRELATED through a kernel envelope
//      (service-role shared-market write) and emits a KernelEvent + CostEntry.
//   2. The runtime NORMALIZES (the connector) — the raw 5300 figures become
//      Dispatch-native records; recordToObservation tiers them from the SOURCE
//      manifest (public_fact), never the connector.
//   3. The normalized 5300 output feeds the EXISTING deterministic ratio calc +
//      live profile assembly, and those profiles PERSIST through the Wave-4
//      profile seam (core/profile/persistence.ts), plane-aware (shared_market /
//      public), and RECONCILE to the connector's source refs.
//
// PURE-ish: every id/instant is injected; the only impurity is the catalog fs read
// behind sourceByKey (overridable via opts.source for a hermetic test). The
// materialization is deterministic given the injected as_of / id_prefix.
//
// ERASABLE-ONLY TS: `import type` for types; ES2022; alias "@/*".

import { makeEnvelope, type RequestEnvelope } from "@/core/kernel/envelope";
import { systemPrincipal } from "@/core/kernel/identity";
import { EventBus } from "@/core/kernel/event_bus";
import { CostLedger } from "@/core/kernel/cost_ledger";
import {
  runConnector,
  type ConnectorRunResult,
} from "@/core/kernel/connector_runtime";
import {
  recordToObservation,
  type ConnectorOutputContract,
  type NormalizedRecord,
} from "@/core/kernel/connector_sdk";
import type { Observation } from "@/core/truth/types";
import type { SourceRegistryEntry } from "@/core/registry/types";
import { sourceByKey } from "@/core/registry/connectors";
import {
  makeNcua5300Connector,
  NCUA_5300_SOURCE_KEY,
} from "@/cartridges/cooperative_markets/connectors/ncua_5300_connector";
import {
  makeNcuaRegulationsConnector,
  NCUA_REGULATIONS_SOURCE_KEY,
} from "@/cartridges/cooperative_markets/connectors/ncua_regulations_connector";
import type { Raw5300, CallReportInput } from "@/cartridges/cooperative_markets/ingest_call_report";
import type { RegulationRecord } from "@/cartridges/cooperative_markets/ingest_regulations";
import { ingestInstitutionBatch } from "@/cartridges/cooperative_markets/ingest_batch";
import { assembleLiveInstitutionProfiles } from "@/cartridges/cooperative_markets/profiles_live";
import type { LiveAssembledProfile } from "@/core/profile/assemble_live";
import {
  InMemoryProfileStore,
  type PersistedProfile,
  type ProfileScope,
} from "@/core/profile/persistence";

// ---------------------------------------------------------------------------
// Shared run options + a deterministic id generator
// ---------------------------------------------------------------------------

export interface ConnectorRunOptions {
  /** The instant the run is stamped + profiles are aged toward (injected). */
  as_of: string;
  /** Correlation id for the run (defaults to a stable derived id). */
  correlation_id?: string;
  /** Namespace for deterministic profile ids. */
  id_prefix?: string;
  /** Override the source manifest (default: from the config-as-data catalog). */
  source?: SourceRegistryEntry;
  /** Prior external_ref → hash for change detection (a previous run's state). */
  prior?: Map<string, string>;
  /** Reuse a bus/ledger to observe events + cost (default: fresh ones). */
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

/** Resolve the source manifest for a key: injected override, else the catalog. */
function resolveSource(key: string, override?: SourceRegistryEntry): SourceRegistryEntry {
  if (override) return override;
  const s = sourceByKey(key);
  if (!s) throw new Error(`run_connectors: source ${key} not found in the connector catalog`);
  return s;
}

// ---------------------------------------------------------------------------
// 1) NCUA 5300 → normalized → persisted live institution profiles
// ---------------------------------------------------------------------------

export interface Ncua5300RunResult {
  output: ConnectorOutputContract;
  result: ConnectorRunResult;
  /** Truth Observations built from the normalized records via the SOURCE manifest. */
  observations: Observation[];
  /** Live institution profiles assembled from the normalized 5300 output. */
  profiles: LiveAssembledProfile[];
  /** The plane-aware persisted profiles (read back from the store). */
  persisted: PersistedProfile[];
  /** Reconciliation: every persisted profile field traces to a connector source ref. */
  reconciliation: { reconciled: boolean; profile_source_refs: string[]; connector_refs: string[] };
}

/** Reconstruct a raw 5300 payload from a normalized record's `value` (round-trip). */
function recordToRaw5300(rec: NormalizedRecord): Raw5300 {
  const v = rec.value as Record<string, unknown>;
  const num = (x: unknown): number => (typeof x === "number" ? x : Number(x));
  const optNum = (x: unknown): number | undefined => (x === null || x === undefined ? undefined : num(x));
  return {
    charter_number: String(v.charter_number),
    institution: String(v.institution),
    period: String(v.period),
    total_assets: num(v.total_assets),
    net_worth: num(v.net_worth),
    total_loans: num(v.total_loans),
    total_shares: num(v.total_shares),
    net_income: num(v.net_income),
    average_assets: num(v.average_assets),
    delinquent_loans: num(v.delinquent_loans),
    members: num(v.members),
    members_prior: optNum(v.members_prior),
    digital_adoption: optNum(v.digital_adoption),
    source_ref: rec.external_ref,
  };
}

/**
 * Run the NCUA 5300 connector through the runtime, then materialize its normalized
 * output into truth observations + persisted, plane-aware live institution
 * profiles. Deterministic given the injected batch + as_of + id_prefix.
 */
export async function runNcua5300(
  rawBatch: Raw5300[],
  opts: ConnectorRunOptions,
): Promise<Ncua5300RunResult> {
  const correlation_id = opts.correlation_id ?? "corr:connector:ncua_5300";
  const id_prefix = opts.id_prefix ?? "coop:5300";
  const source = resolveSource(NCUA_5300_SOURCE_KEY, opts.source);
  const env = serviceEnvelope(opts.as_of, correlation_id);
  const connector = makeNcua5300Connector(rawBatch);

  const result = await runConnector(
    { connector, source, env },
    { idGen: counter("ev:5300"), bus: opts.bus, ledger: opts.ledger, prior: opts.prior, costPerAttempt: 0.002 },
  );
  if (!result.ok) throw new Error(`5300 connector refused: ${result.refusal.reason}`);
  const output = result.output;

  // Normalized records → truth Observations (tier/plane FROM THE SOURCE manifest).
  const obsIds = counter("obs:5300");
  const observations: Observation[] = output.observations.map((rec) =>
    recordToObservation(rec, source, {
      id: obsIds(),
      observed_at: opts.as_of,
      asserted_by: "system",
      source_document_ids: [rec.external_ref],
    }),
  );

  // Normalized 5300 → the EXISTING deterministic ratio calc + live profile assembly.
  const inputs: CallReportInput[] = output.observations.map((rec) => ({
    input_type: "ncua_5300_call_report",
    raw: recordToRaw5300(rec),
  }));
  const batch = ingestInstitutionBatch(inputs, { observed_at: opts.as_of, id_prefix });
  const profiles = assembleLiveInstitutionProfiles(batch, { as_of: opts.as_of, id_prefix });

  // PERSIST plane-aware (a shared-market public institution projection).
  const scope: ProfileScope = { plane: "shared_market", visibility: "public", workspace_id: null, organization_id: null };
  const store = new InMemoryProfileStore();
  for (const profile of profiles) store.put({ profile, scope });
  const persisted = store.all();

  // Reconcile: every persisted profile field's source_ref is a connector output ref.
  const connectorRefs = new Set(output.observations.map((r) => r.external_ref));
  const profileSourceRefs = new Set<string>();
  for (const p of persisted) for (const f of p.profile.field_freshness) profileSourceRefs.add(f.source_ref);
  const reconciled = Array.from(profileSourceRefs).every((r) => connectorRefs.has(r));

  return {
    output,
    result,
    observations,
    profiles,
    persisted,
    reconciliation: {
      reconciled,
      profile_source_refs: Array.from(profileSourceRefs).sort(),
      connector_refs: Array.from(connectorRefs).sort(),
    },
  };
}

// ---------------------------------------------------------------------------
// 2) NCUA regulations → normalized (REAL corpus at scale)
// ---------------------------------------------------------------------------

export interface RegulationsRunResult {
  output: ConnectorOutputContract;
  result: ConnectorRunResult;
  observations: Observation[];
}

/** Run the NCUA regulations connector over the REAL corpus through the runtime. */
export async function runNcuaRegulations(
  records: RegulationRecord[],
  issueDate: string,
  opts: ConnectorRunOptions,
): Promise<RegulationsRunResult> {
  const correlation_id = opts.correlation_id ?? "corr:connector:ncua_regulations";
  const source = resolveSource(NCUA_REGULATIONS_SOURCE_KEY, opts.source);
  const env = serviceEnvelope(opts.as_of, correlation_id);
  const connector = makeNcuaRegulationsConnector(records, issueDate);

  const result = await runConnector(
    { connector, source, env },
    { idGen: counter("ev:reg"), bus: opts.bus, ledger: opts.ledger, prior: opts.prior, costPerAttempt: 0.005 },
  );
  if (!result.ok) throw new Error(`regulations connector refused: ${result.refusal.reason}`);
  const output = result.output;

  const obsIds = counter("obs:reg");
  const observations: Observation[] = output.observations.map((rec) =>
    recordToObservation(rec, source, {
      id: obsIds(),
      observed_at: opts.as_of,
      asserted_by: "system",
      source_document_ids: [`ecfr:title-12:${issueDate}`],
    }),
  );
  return { output, result, observations };
}
