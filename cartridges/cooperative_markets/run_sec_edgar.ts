// cartridges/cooperative_markets/run_sec_edgar.ts
//
// Cooperative Markets — SEC EDGAR connector WIRING + illustrative filings.
//
// Runs the SEC EDGAR connector THROUGH the generic Connector Runtime and materializes
// its normalized output into truth Observations tiered FROM THE SOURCE manifest
// (`source:sec_edgar` → public_fact). Cartridge orchestration over the generic kernel
// runtime; no vertical noun leaked into core/. Additive, new file.
//
// ⚠️ The staged filings below are ILLUSTRATIVE labeled samples (realistic EDGAR header
// shapes) pending a live EDGAR pull — the connector is source-agnostic and normalizes
// the same way over these or a real bulk pull. Do not cite these as real filings.
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
  makeSecEdgarConnector,
  SEC_EDGAR_SOURCE_KEY,
  type RawEdgarFiling,
} from "@/cartridges/cooperative_markets/connectors/sec_edgar_connector";

const FILED = "2026-06-30";

/** ILLUSTRATIVE labeled EDGAR filing headers (NOT real filings; see file header). */
export function secEdgarFixtures(): RawEdgarFiling[] {
  return [
    {
      cik: "0001900001",
      company: "Halcyon Pay Inc",
      form_type: "D",
      accession_number: "0001900001-26-000042",
      filing_date: FILED,
      period_of_report: "2026-06-01",
      primary_document: "primary_doc.xml",
    },
    {
      cik: "0001900002",
      company: "Meridian Ledger Corp",
      form_type: "D/A",
      accession_number: "0001900002-26-000117",
      filing_date: FILED,
      primary_document: "primary_doc.xml",
    },
    {
      cik: "0001900003",
      company: "Cobalt Rails Inc",
      form_type: "8-K",
      accession_number: "0001900003-26-000009",
      filing_date: FILED,
      primary_document: "cobalt-8k.htm",
    },
  ];
}

export interface SecEdgarRunOptions {
  as_of: string;
  correlation_id?: string;
  source?: SourceRegistryEntry;
  prior?: Map<string, string>;
  bus?: EventBus;
  ledger?: CostLedger;
}

export interface SecEdgarRunResult {
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
  if (!s) throw new Error(`run_sec_edgar: source ${key} not found in the connector catalog`);
  return s;
}

/** Run the SEC EDGAR connector through the runtime; observations tier from the source. */
export async function runSecEdgar(
  filings: RawEdgarFiling[],
  opts: SecEdgarRunOptions,
): Promise<SecEdgarRunResult> {
  const correlation_id = opts.correlation_id ?? "corr:connector:sec_edgar";
  const source = resolveSource(SEC_EDGAR_SOURCE_KEY, opts.source);
  const env = serviceEnvelope(opts.as_of, correlation_id);
  const connector = makeSecEdgarConnector(filings);

  const result = await runConnector(
    { connector, source, env },
    { idGen: counter("ev:edgar"), bus: opts.bus, ledger: opts.ledger, prior: opts.prior, costPerAttempt: 0.003 },
  );
  if (!result.ok) throw new Error(`sec_edgar connector refused: ${result.refusal.reason}`);
  const output = result.output;

  const obsIds = counter("obs:edgar");
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
