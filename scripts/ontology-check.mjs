// scripts/ontology-check.mjs
//
// Volume XI closed-graph integrity check (ADR-0014). Verifies that every
// ontology `object` and every relationship `target` across all packs in
// core/registry/data/ontology/*.json resolves to a real class in the Object
// Registry catalog (core/registry/data/financial_services_objects.json) — the
// runtime analogue of ontologyReferencedObjects() all resolving. Plain Node,
// no build step:  `node scripts/ontology-check.mjs`  (exit 0 = closed graph).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dataDir = path.join(root, "core/registry/data");
const catalog = JSON.parse(fs.readFileSync(path.join(dataDir, "financial_services_objects.json"), "utf8"));
const bySchema = new Set(catalog.objects.map((o) => o.schema_ref));
const byKey = new Set(catalog.objects.map((o) => o.key));
const resolves = (r) => bySchema.has(r) || byKey.has(r);

const ontDir = path.join(dataDir, "ontology");
const packs = fs.readdirSync(ontDir).filter((f) => f.endsWith(".json")).sort();

const byObject = new Map();
const collisions = [];
for (const f of packs) {
  const pack = JSON.parse(fs.readFileSync(path.join(ontDir, f), "utf8"));
  for (const o of pack.ontologies) {
    if (byObject.has(o.object)) collisions.push(`${o.object} (redefined by ${f})`);
    byObject.set(o.object, o);
  }
}
const refs = new Set();
for (const o of byObject.values()) {
  refs.add(o.object);
  for (const r of o.relationships ?? []) refs.add(r.target);
}
const unresolved = [...refs].filter((r) => !resolves(r)).sort();

console.log(`packs: ${packs.join(", ")}`);
console.log(`ontology objects: ${byObject.size}`);
console.log(`distinct referenced objects: ${refs.size}`);
console.log(`unresolved references: ${unresolved.length}`);
for (const u of unresolved) console.log(`  UNRESOLVED  ${u}`);
for (const c of collisions) console.log(`  COLLISION   ${c}`);
if (unresolved.length || collisions.length) process.exit(1);
console.log("closed graph OK");
