// scripts/wave3-demo.ts
//
// Wave 3 demo — LIVE DATA at scale. Runs the three Wave-3 paths on the REAL
// staged data and prints a summary:
//
//   1) REGULATORY  — ingest the real NCUA corpus (675 in-force 12 CFR sections +
//      10 pending amendments) → sourced, bi-temporal public_fact truth objects.
//   2) INSTITUTIONS — ingest the labeled 5300 fixture batch → call-report facts +
//      an assembled institution profile each (RFC-3012, confidence engine).
//   3) REGISTRY    — resolve canonical institution objects (proposes duplicate
//      candidates; merges are human-gated — behind the seam, gated on 0016+0017).
//
// Deterministic (all ids/timestamps injected). Runs on plain Node via native TS
// type-stripping; `alias-hook.mjs` resolves "@/*", and the JSON corpus is read
// via fs (so the pure ingestion modules stay side-effect-free).
//
//   node scripts/wave3-demo.ts

import { register } from "node:module";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
register("./alias-hook.mjs", import.meta.url);

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const readJson = (rel: string) => JSON.parse(readFileSync(path.join(root, rel), "utf8"));

const { ingestRegulatoryCorpus } = await import(
  "@/cartridges/cooperative_markets/ingest_regulations"
);
const { institutionBatchFixtures } = await import(
  "@/cartridges/cooperative_markets/batch_fixtures"
);
const { ingestInstitutionBatch } = await import(
  "@/cartridges/cooperative_markets/ingest_batch"
);
const { ObjectRegistryService, InMemoryRegistryStore } = await import(
  "@/core/registry/service"
);

const bar = (s: string) =>
  console.log(`\n${"─".repeat(4)} ${s} ${"─".repeat(Math.max(0, 58 - s.length))}`);

// --- 1) REGULATORY -----------------------------------------------------------
const records = readJson("docs/04_sources/ncua/ncua_regulations_clean.json");
const amendments = readJson("docs/04_sources/ncua/ncua_regulations_future_amendments.json");
const corpus = ingestRegulatoryCorpus(records, amendments, {
  issue_date: "2026-07-15",
  observed_at: "2026-07-21T17:00:00.000Z",
  source_id: "source:ncua_regulations",
  source_document_id: "sourcedoc:ncua:regulations:2026-07-15",
  id_prefix: "ncua:reg",
});

console.log("\n═══ Wave 3 — Live NCUA data at scale ═══");
bar("1) REGULATORY  (real 12 CFR corpus)");
console.log(`  in-force sections (public_fact, valid_from 2026-07-15): ${corpus.total_sections}`);
console.log(`  pending amendments w/ full text (future valid_from):    ${corpus.pending_full_text}`);
console.log(`  held amendatory instructions (claims, human-merge):     ${corpus.held_instructions}`);
console.log(`  top parts by section count:`);
for (const p of [...corpus.parts].sort((a, b) => b.count - a.count).slice(0, 6)) {
  console.log(`    Part ${p.part.padEnd(4)} ${String(p.count).padStart(3)}  ${p.part_title.slice(0, 52)}`);
}

// --- 2) INSTITUTIONS ---------------------------------------------------------
const batch = ingestInstitutionBatch(institutionBatchFixtures(), {
  observed_at: "2026-07-21T17:00:00.000Z",
  id_prefix: "coop:batch",
});
bar("2) INSTITUTIONS  (5300 fixture batch → profiles)");
console.log(`  ${"institution".padEnd(26)} nw%   roa%  l/s%  del%  growth%  conf  health`);
for (const b of batch) {
  const f = b.facts;
  const n = (x: number) => x.toFixed(1).padStart(5);
  console.log(
    `  ${f.institution.padEnd(26)} ${n(f.net_worth_ratio)} ${n(f.roa)} ${n(f.loan_to_share)} ${n(f.delinquency_ratio)} ${n(f.member_growth)}   ${b.profile.confidence.toFixed(2)}  ${b.profile.health}`,
  );
}

// --- 3) REGISTRY -------------------------------------------------------------
let idN = 0;
const registry = new ObjectRegistryService(new InMemoryRegistryStore(), {
  idGen: () => `reg:obj:${idN++}`,
  now: "2026-07-21T17:00:00.000Z",
});
for (const b of batch) {
  registry.register({
    object_class: "entity:coop_markets:credit_union",
    canonical_slug: b.facts.institution.toLowerCase().replace(/[^a-z0-9]+/g, "_"),
    display_name: b.facts.institution,
    plane: "shared_market",
    visibility: "public",
    external_ids: [{ system: "ncua_charter", value: b.facts.charter_number }],
    aliases: [b.facts.institution],
  });
}
const candidates = registry.resolve();
bar("3) REGISTRY  (entity resolution, behind the seam)");
console.log(`  canonical objects registered: ${registry.objects().length}`);
console.log(`  proposed match candidates:    ${candidates.length}  (merges are human-gated; 0 auto-merged)`);
console.log(`  persistence: in-memory — live resolution gated on migrations 0016+0017 (Bryan)\n`);
