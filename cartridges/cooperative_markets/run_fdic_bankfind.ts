// cartridges/cooperative_markets/run_fdic_bankfind.ts
//
// Cooperative Markets — FDIC BankFind connector WIRING + illustrative records.
//
// Runs the FDIC BankFind connector THROUGH the generic Connector Runtime and
// materializes its normalized output into truth Observations tiered FROM THE SOURCE
// manifest (`source:fdic_bankfind` → public_fact). Cartridge orchestration over the
// generic kernel runtime; no vertical noun leaked into core/. Additive, new file.
//
// ⚠️ The staged records below are ILLUSTRATIVE labeled samples (realistic FDIC
// BankFind institution shapes) pending a live FDIC pull — the connector is
// source-agnostic and normalizes the same way over these or a real API pull. Do NOT
// cite these as real institutions.
//
// PURE-ish: ids/instants injected; the only impurity is the catalog fs read behind
// sourceByKey (overridable via opts.source). isolatedModules-friendly: `import type`.

import { makeEnvelope, type RequestEnvelope } from "@/core/kernel/envelope";
import { systemPrincipal } from "@/core/kernel/identity";
import { EventBus } from "@/core/kernel/event_bus";
import { CostLedger } from "@/core/kernel/cost_ledger";
import { runConnector, type ConnectorRunResult } from "@/core/kernel/connector_runtime";
import { recordToObservation, type ConnectorOutputContract } from "@/core/kernel/connector_sdk";
import type { Observation } from "@/core/truth/types";
import type { SourceRegistryEntry } from "@/core/registry/types";
import { sourceByKey } from "@/core/registry/connectors";
import {
  makeFdicBankfindConnector,
  FDIC_BANKFIND_SOURCE_KEY,
  type RawFdicInstitution,
} from "@/cartridges/cooperative_markets/connectors/fdic_bankfind_connector";

const PULLED = "2026-06-30";

/** ILLUSTRATIVE labeled FDIC institution records (NOT real institutions; see header). */
export function fdicBankfindFixtures(): RawFdicInstitution[] {
  return [
    { cert: "57001", name: "Cascade Community Bank", city: "Bellingham", stalp: "WA", active: 1, asset: 842000, established: "1998-04-01", data_date: PULLED },
    { cert: "57002", name: "Prairie State Savings Bank", city: "Peoria", stalp: "IL", active: 1, asset: 1290000, established: "1987-09-15", data_date: PULLED },
    { cert: "57003", name: "Gulf Harbor Trust Company", city: "Mobile", stalp: "AL", active: 0, asset: 305000, established: "1975-01-20", data_date: PULLED },
  ];
}

export interface FdicRunOptions {
  as_of: string;
  correlation_id?: string;
  source?: SourceRegistryEntry;
  prior?: Map<string, string>;
  bus?: EventBus;
  ledger?: CostLedger;
}

export interface FdicRunResult {
  output: ConnectorOutputContract;
  result: ConnectorRunResult;
  observations: Observation[];
}

function counter(prefix: string): () => string {
  let n = 0;
  return () => `${prefix}:${n++}`;
}

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
  if (!s) throw new Error(`run_fdic_bankfind: source ${key} not found in the connector catalog`);
  return s;
}

/** Run the FDIC BankFind connector through the runtime; observations tier from the source. */
export async function runFdicBankfind(
  institutions: RawFdicInstitution[],
  opts: FdicRunOptions,
): Promise<FdicRunResult> {
  const correlation_id = opts.correlation_id ?? "corr:connector:fdic_bankfind";
  const source = resolveSource(FDIC_BANKFIND_SOURCE_KEY, opts.source);
  const env = serviceEnvelope(opts.as_of, correlation_id);
  const connector = makeFdicBankfindConnector(institutions);

  const result = await runConnector(
    { connector, source, env },
    { idGen: counter("ev:fdic"), bus: opts.bus, ledger: opts.ledger, prior: opts.prior, costPerAttempt: 0.002 },
  );
  if (!result.ok) throw new Error(`fdic_bankfind connector refused: ${result.refusal.reason}`);
  const output = result.output;

  const obsIds = counter("obs:fdic");
  const observations: Observation[] = output.observations.map((rec) =>
    recordToObservation(rec, source, {
      id: obsIds(),
      observed_at: opts.as_of,
      asserted_by: "system",
      source_document_ids: [rec.external_ref],
    }),
  );
  return { output, result, observations };
}
