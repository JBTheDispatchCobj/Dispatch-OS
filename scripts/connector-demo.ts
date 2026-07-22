// scripts/connector-demo.ts
//
// Sprint III Wave 1 demo — the generic Connector Runtime (RFC-2011) running the
// Cooperative Markets connectors on REAL + labeled sources, correlated through a
// kernel envelope, emitting events + cost, and persisting 5300 → live profiles.
//
//   node scripts/connector-demo.ts
//
// Runs on plain Node via native TS type-stripping; alias-hook.mjs resolves "@/*".
// The pure connectors take PARSED records, so this script reads the staged JSON
// via fs and injects it (no fs inside the connectors). No build step.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { register } from "node:module";
register("./alias-hook.mjs", import.meta.url);

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const readJson = (rel: string) => JSON.parse(fs.readFileSync(path.join(root, rel), "utf8"));

const { EventBus } = await import("@/core/kernel/event_bus");
const { CostLedger } = await import("@/core/kernel/cost_ledger");
const { runNcua5300, runNcuaRegulations } = await import("@/cartridges/cooperative_markets/run_connectors");
const { stateFromOutput } = await import("@/core/kernel/connector_runtime");
const { institutionBatchFixtures } = await import("@/cartridges/cooperative_markets/batch_fixtures");
const { validateConnectorCatalog } = await import("@/core/registry/connectors");

const AS_OF = "2026-07-22T00:00:00.000Z";
const ISSUE = "2026-07-15";

// ---- Catalog integrity (config-as-data qualifies the placeholders) ----------
const catalog = readJson("core/registry/data/connectors.json");
const val = validateConnectorCatalog(catalog);
console.log(`\n=== Connector catalog =========================================`);
console.log(`  sources: ${val.source_count} · connectors: ${val.connector_count} (active ${val.active_count}) · closed-graph ${val.ok ? "OK" : "INVALID"}`);

// ---- NCUA 5300 connector → persisted live profiles --------------------------
const bus = new EventBus();
const ledger = new CostLedger();
const batch = institutionBatchFixtures().map((i) => i.raw);
const r1 = await runNcua5300(batch, { as_of: AS_OF, bus, ledger });
console.log(`\n=== NCUA 5300 connector (labeled batch) =======================`);
console.log(`  status: ${r1.output.status} · normalized: ${r1.output.observations.length} · health: ${r1.output.health.state} (${r1.output.health.reason})`);
console.log(`  changes: ${JSON.stringify(r1.output.metrics.changes)} · quality completeness: ${r1.output.quality_report.completeness}`);
console.log(`  observations (truth-tiered from source): ${r1.observations.length} · tier[0]: ${r1.observations[0].tier}`);
console.log(`  persisted profiles: ${r1.persisted.length} · reconciled to source: ${r1.reconciliation.reconciled}`);
console.log(`  events: ${bus.history({ correlation_id: "corr:connector:ncua_5300" }).length} · cost: $${ledger.byCorrelation("corr:connector:ncua_5300").usd.toFixed(4)}`);

// ---- Change detection: a second run with prior state → all unchanged --------
const prior = stateFromOutput(r1.output);
const r2 = await runNcua5300(batch, { as_of: AS_OF, prior });
console.log(`\n=== NCUA 5300 re-run (change detection) ========================`);
console.log(`  changes vs prior: ${JSON.stringify(r2.output.metrics.changes)} (expected all unchanged)`);

// ---- NCUA regulations connector over the REAL 675-section corpus ------------
const regs = readJson("docs/04_sources/ncua/ncua_regulations_clean.json");
const rr = await runNcuaRegulations(regs, ISSUE, { as_of: AS_OF, bus, ledger });
console.log(`\n=== NCUA regulations connector (REAL corpus at scale) =========`);
console.log(`  status: ${rr.output.status} · normalized sections: ${rr.output.observations.length} · health: ${rr.output.health.state}`);
console.log(`  new sections detected: ${rr.output.metrics.changes.new} · artifacts captured: ${rr.output.metrics.artifacts_captured}`);
console.log(`  truth observations (public_fact from source): ${rr.observations.length} · tier[0]: ${rr.observations[0].tier}\n`);
