// scripts/profile-query-demo.ts
//
// Demo for Sprint II Wave 2 — LIVE profile assembly + query. Builds live profiles
// over the REAL NCUA regulatory corpus + the illustrative 5300 batch (each field
// aged by the confidence engine from its source date toward an injected `as_of`),
// then runs the query surface: filter by tier/confidence/completeness/field,
// rank, and look up a sourced field.
//
//   node scripts/profile-query-demo.ts
//
// (Runs on plain Node via native TS type-stripping; `alias-hook.mjs` resolves the
//  "@/*" alias at runtime. The pure ingestion modules take PARSED records, so this
//  script reads the staged JSON via fs and passes it in. No build step.)

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { register } from "node:module";
register("./alias-hook.mjs", import.meta.url);

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const readJson = (rel: string) => JSON.parse(fs.readFileSync(path.join(root, rel), "utf8"));

const { ingestRegulatoryCorpus } = await import("@/cartridges/cooperative_markets/ingest_regulations");
const { institutionBatchFixtures } = await import("@/cartridges/cooperative_markets/batch_fixtures");
const { ingestInstitutionBatch } = await import("@/cartridges/cooperative_markets/ingest_batch");
const { buildLiveProfiles } = await import("@/cartridges/cooperative_markets/profiles_live");
const { queryProfiles, lookupField } = await import("@/core/profile/query");

// ---- Real regulatory corpus + illustrative institution batch -----------------
const records = readJson("docs/04_sources/ncua/ncua_regulations_clean.json");
const amendments = readJson("docs/04_sources/ncua/ncua_regulations_future_amendments.json");

const ISSUE = "2026-07-15";
const AS_OF = "2026-07-22T00:00:00.000Z"; // assemble the profiles as of today (injected)

const corpus = ingestRegulatoryCorpus(records, amendments, {
  issue_date: ISSUE,
  observed_at: "2026-07-21T17:00:00.000Z",
  source_id: "source:ncua_regulations",
  source_document_id: "sourcedoc:ncua:regulations:2026-07-15",
  id_prefix: "ncua:reg",
});
const batch = ingestInstitutionBatch(institutionBatchFixtures(), {
  observed_at: AS_OF,
  id_prefix: "coop:batch",
});

const profiles = buildLiveProfiles({ corpus, batch }, { as_of: AS_OF, id_prefix: "coop" });

const bar = (s: string) => console.log(`\n${"─".repeat(4)} ${s} ${"─".repeat(Math.max(0, 60 - s.length))}`);
const pct = (n: number) => `${(n * 100).toFixed(1)}%`;

console.log(`\n═══ Cooperative Markets — LIVE profiles + query (as of ${AS_OF}) ═══`);
console.log(`  ${profiles.institutions.length} institution profiles + 1 regulation-environment profile`);

bar("REGULATION ENVIRONMENT (real corpus, aged from issue date)");
const reg = profiles.regulation_environment;
console.log(`  ${reg.display_name}`);
console.log(`  confidence ${pct(reg.confidence)} · top_tier ${reg.top_tier} · health ${reg.health}`);
for (const ff of reg.field_freshness) {
  const f = lookupField(reg, ff.key);
  console.log(`    ${ff.key.padEnd(24)} = ${String(f?.value).padStart(4)}  (freshness ${pct(ff.freshness)} ${ff.band}, ${Math.round(ff.age_days)}d)`);
}

bar("QUERY 1 — institutions, rank by net-worth ratio (desc)");
const byCapital = queryProfiles(profiles.all, {
  subject_type: "credit_union",
  rank_by: "field_value",
  rank_field_key: "net_worth_ratio",
  dir: "desc",
});
console.log(`  applied: ${byCapital.applied.join(" · ")}`);
for (const p of byCapital.matched) {
  const nw = lookupField(p, "net_worth_ratio");
  console.log(`    ${p.display_name.padEnd(26)} NWR ${String(nw?.value).padStart(6)}%  · profile conf ${pct(p.confidence)} (${p.health})`);
}

bar("QUERY 2 — well-capitalized only (net_worth_ratio >= 7), top 3 by confidence");
const wellCapped = queryProfiles(profiles.all, {
  subject_type: "credit_union",
  field: { key: "net_worth_ratio", op: "gte", value: 7 },
  rank_by: "confidence",
  dir: "desc",
  limit: 3,
});
console.log(`  applied: ${wellCapped.applied.join(" · ")}`);
console.log(`  matched ${wellCapped.total} (showing ${wellCapped.matched.length})`);
for (const p of wellCapped.matched) console.log(`    ${p.display_name}`);

bar("QUERY 3 — tier floor deterministic_calculation + min confidence 0.5");
const graded = queryProfiles(profiles.all, {
  tier_floor: "deterministic_calculation",
  min_confidence: 0.5,
  rank_by: "confidence",
  dir: "desc",
});
console.log(`  applied: ${graded.applied.join(" · ")}`);
console.log(`  matched ${graded.total} profiles at/above deterministic_calculation with conf >= 0.5`);
for (const p of graded.matched) console.log(`    ${p.subject_type.padEnd(24)} ${p.display_name.padEnd(40)} conf ${pct(p.confidence)}`);

console.log("\n(deterministic — identical output every run)\n");
