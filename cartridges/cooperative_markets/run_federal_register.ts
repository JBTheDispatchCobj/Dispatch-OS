// cartridges/cooperative_markets/run_federal_register.ts
//
// Cooperative Markets — FEDERAL REGISTER connector WIRING + illustrative documents.
//
// Runs the Federal Register connector THROUGH the generic Connector Runtime and
// materializes its normalized output into truth Observations tiered FROM THE SOURCE
// manifest (`source:federal_register` → public_fact). Cartridge orchestration over
// the generic kernel runtime; no vertical noun leaked into core/. Additive, new file.
//
// ⚠️ The staged documents below are ILLUSTRATIVE labeled samples (realistic FR
// document-header shapes) pending a live FederalRegister.gov pull — the connector is
// source-agnostic and normalizes the same way over these or a real API pull. Do NOT
// cite these as real Federal Register documents.
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
  makeFederalRegisterConnector,
  FEDERAL_REGISTER_SOURCE_KEY,
  type RawFederalRegisterDoc,
} from "@/cartridges/cooperative_markets/connectors/federal_register_connector";

const PUBLISHED = "2026-06-18";

/** ILLUSTRATIVE labeled Federal Register document headers (NOT real docs; see header). */
export function federalRegisterFixtures(): RawFederalRegisterDoc[] {
  return [
    {
      document_number: "2026-14213",
      title: "Fair Credit Reporting; Data Broker Rulemaking",
      type: "Proposed Rule",
      agencies: ["Consumer Financial Protection Bureau"],
      publication_date: PUBLISHED,
      effective_on: null,
      html_url: "https://www.federalregister.gov/documents/2026/06/18/2026-14213",
      abstract: "The Bureau proposes to amend Regulation V to address data broker practices.",
    },
    {
      document_number: "2026-14588",
      title: "Chartering and Field of Membership; Technical Amendments",
      type: "Rule",
      agencies: ["National Credit Union Administration"],
      publication_date: PUBLISHED,
      effective_on: "2026-08-01",
      html_url: "https://www.federalregister.gov/documents/2026/06/18/2026-14588",
      abstract: "NCUA adopts technical amendments to its chartering and field-of-membership rules.",
    },
    {
      document_number: "2026-15002",
      title: "Agency Information Collection Activities; Comment Request",
      type: "Notice",
      agencies: ["Federal Deposit Insurance Corporation"],
      publication_date: PUBLISHED,
      effective_on: null,
      html_url: "https://www.federalregister.gov/documents/2026/06/18/2026-15002",
      abstract: null,
    },
  ];
}

export interface FederalRegisterRunOptions {
  as_of: string;
  correlation_id?: string;
  source?: SourceRegistryEntry;
  prior?: Map<string, string>;
  bus?: EventBus;
  ledger?: CostLedger;
}

export interface FederalRegisterRunResult {
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
  if (!s) throw new Error(`run_federal_register: source ${key} not found in the connector catalog`);
  return s;
}

/** Run the Federal Register connector through the runtime; observations tier from the source. */
export async function runFederalRegister(
  documents: RawFederalRegisterDoc[],
  opts: FederalRegisterRunOptions,
): Promise<FederalRegisterRunResult> {
  const correlation_id = opts.correlation_id ?? "corr:connector:federal_register";
  const source = resolveSource(FEDERAL_REGISTER_SOURCE_KEY, opts.source);
  const env = serviceEnvelope(opts.as_of, correlation_id);
  const connector = makeFederalRegisterConnector(documents);

  const result = await runConnector(
    { connector, source, env },
    { idGen: counter("ev:fedreg"), bus: opts.bus, ledger: opts.ledger, prior: opts.prior, costPerAttempt: 0.002 },
  );
  if (!result.ok) throw new Error(`federal_register connector refused: ${result.refusal.reason}`);
  const output = result.output;

  const obsIds = counter("obs:fedreg");
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
