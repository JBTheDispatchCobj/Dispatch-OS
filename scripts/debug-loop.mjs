// scripts/debug-loop.mjs
//
// Dispatch OS — debug loop harness. One command that runs every automated check we
// have and reports a single PASS/FAIL, so the "loop" is: run → read failures → fix →
// re-run until green.  `node scripts/debug-loop.mjs`  (exit 0 = all green).
//
// There is no UI yet, so this is the review surface. Checks:
//   1. TYPECHECK      — full-app `tsc --noEmit -p tsconfig.json` (types + integration).
//   2. ONTOLOGY       — Volume XI closed-graph (0 unresolved / 0 collisions).
//   3. CARTRIDGE MAP  — every cooperative_markets canonical schema_ref resolves in the catalog.
//   4. ENGINE SMOKE   — transpile + EXECUTE the deal engine (P1 scoring), the IC memo
//                       (P2, approved-evidence-only), and allocation (P3, subscriber
//                       gates); assert the core invariants actually hold at runtime.
//
// Steps are independent: a failure in one does not stop the others, so one run shows
// every problem. Requires only `node` + the repo's `typescript` dep.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const results = [];
async function step(name, fn) {
  process.stdout.write(`\n── ${name} ${"─".repeat(Math.max(0, 46 - name.length))}\n`);
  try {
    const detail = await fn();
    results.push({ name, ok: true, detail });
    console.log(`   ✓ PASS${detail ? ` — ${detail}` : ""}`);
  } catch (e) {
    results.push({ name, ok: false, detail: e.message });
    console.log(`   ✗ FAIL — ${e.message}`);
  }
}
function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

// --- 1. Full-app typecheck ---------------------------------------------------
await step("TYPECHECK  (tsc --noEmit)", () => {
  // A partial checkout / missing deps is an ENVIRONMENT gap, not a code fault — say so
  // instead of drowning the run in module-not-found noise.
  if (!fs.existsSync(path.join(root, "node_modules"))) {
    throw new Error("node_modules missing — run `npm install`, then re-run this loop (env, not code)");
  }
  try {
    execSync("npx tsc --noEmit -p tsconfig.json", { cwd: root, stdio: "pipe" });
    return "0 type errors across the app";
  } catch (e) {
    const out = `${e.stdout ?? ""}${e.stderr ?? ""}`.trim();
    const lines = out.split("\n").filter((l) => /error TS/.test(l)).slice(0, 8);
    throw new Error(`tsc errors:\n     ${lines.join("\n     ") || out.slice(0, 400)}`);
  }
});

// --- 2. Ontology closed-graph ------------------------------------------------
await step("ONTOLOGY   (closed graph)", () => {
  const out = execSync("node scripts/ontology-check.mjs", { cwd: root, stdio: "pipe" }).toString();
  assert(/closed graph OK/.test(out), out.trim());
  const m = out.match(/ontology objects:\s*(\d+)/);
  return `${m ? m[1] : "?"} objects, 0 unresolved, 0 collisions`;
});

// --- 3. Cartridge canonical-map integrity ------------------------------------
await step("CARTRIDGE  (canonical map resolves)", () => {
  const catalog = JSON.parse(fs.readFileSync(path.join(root, "core/registry/data/financial_services_objects.json"), "utf8"));
  const known = new Set([...catalog.objects.map((o) => o.schema_ref), ...catalog.objects.map((o) => o.key)]);
  const src = fs.readFileSync(path.join(root, "cartridges/cooperative_markets/cartridge.ts"), "utf8");
  const refs = [...src.matchAll(/"(financial_services:[a-z_]+:[a-z_]+)"/g)].map((m) => m[1]);
  assert(refs.length > 0, "no canonical schema_refs found in the cartridge");
  const bad = [...new Set(refs)].filter((r) => !known.has(r));
  assert(bad.length === 0, `unresolved canonical refs: ${bad.join(", ")}`);
  return `${new Set(refs).size} canonical refs, all resolve`;
});

// --- 4. Engine smoke (transpile + execute P1/P2/P3) --------------------------
await step("ENGINE     (P1 score · P2 memo · P3 allocate)", async () => {
  let tsmod;
  try { tsmod = await import("typescript"); }
  catch { tsmod = await import("typescript/lib/typescript.js"); }
  const ts = tsmod.default ?? tsmod;
  const tmp = path.join(root, ".debug-tmp");
  fs.mkdirSync(tmp, { recursive: true });
  const mods = ["deal_engine", "ic_memo", "allocation"];
  for (const m of mods) {
    const srcPath = path.join(root, "cartridges/cooperative_markets", `${m}.ts`);
    const js = ts.transpileModule(fs.readFileSync(srcPath, "utf8"), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    }).outputText.replace(/@\/cartridges\/cooperative_markets\//g, "./");
    fs.writeFileSync(path.join(tmp, `${m}.js`), js);
  }
  const E = await import(path.join(tmp, "deal_engine.js"));
  const M = await import(path.join(tmp, "ic_memo.js"));
  const A = await import(path.join(tmp, "allocation.js"));

  // P1: a strong, compliance-clear deal ADVANCEs; every score cites sources.
  const startup = mkStartup(0.82);
  const inst = mkInst();
  const opp = mkOpp();
  const sc = E.assembleScorecard(startup, inst, opp);
  assert(sc.recommendation === "advance", `P1 expected advance, got ${sc.recommendation}`);
  assert(Object.values(sc.scores).every((s) => s.tier === "dispatch_inference" && s.lineage.length > 0), "P1 scores must be sourced inferences with lineage");
  // P1 gate: compliance below the gate BLOCKS even at high opportunity.
  const scBlocked = E.assembleScorecard(mkStartup(0.3), inst, mkOpp(0.95, 0.95, 0.95));
  assert(scBlocked.recommendation === "blocked", "P1 compliance gate must block");

  // P2: memo excludes unapproved evidence; blocker forces blocked.
  const findings = [
    { category: "compliance_fit", status: "clear", summary: "SOC2", evidence: [{ ref: "a", label: "SOC2", approved: true }] },
    { category: "regulatory", status: "clear", summary: "controls", evidence: [{ ref: "b", label: "reg", approved: true }] },
    { category: "financial", status: "clear", summary: "runway", evidence: [{ ref: "c", label: "fin", approved: true }] },
    { category: "technology", status: "clear", summary: "api", evidence: [{ ref: "d", label: "api", approved: true }] },
    { category: "cybersecurity", status: "clear", summary: "pentest", evidence: [{ ref: "e", label: "pen", approved: true }] },
    { category: "insurance", status: "clear", summary: "coi", evidence: [{ ref: "f", label: "coi", approved: false }] },
  ];
  const memo = M.assembleICMemo(sc, findings);
  assert(memo.recommendation === "recommend", `P2 expected recommend, got ${memo.recommendation}`);
  assert(memo.excluded_unapproved.includes("f"), "P2 must exclude unapproved evidence");
  assert(memo.citation_map.every((c) => c.ref !== "f"), "P2 must not cite unapproved evidence");
  const memoBlocked = M.assembleICMemo(sc, [{ category: "compliance_fit", status: "blocker", summary: "no soc2", evidence: [{ ref: "z", label: "gap", approved: true }] }]);
  assert(memoBlocked.recommendation === "blocked", "P2 blocker gate must block");

  // P3: gates reject non-accredited LP / unscreened / mismatched; eligible get allocated.
  const deal = { company: "X", ref: "x", category: "real_time_payments", recommendation: "recommend", capacity_usd: 1_000_000 };
  const subs = [
    { id: "cu1", name: "CU1", kind: "credit_union", ref: "cu1", kyb_status: "cleared", sanctions_status: "cleared", interest: { categories: ["real_time_payments"] }, requested_usd: 400_000 },
    { id: "lp_bad", name: "LP-bad", kind: "lp", ref: "lpb", accreditation: "none", kyc_status: "cleared", sanctions_status: "cleared", interest: { categories: ["real_time_payments"] }, requested_usd: 400_000 },
    { id: "lp_ok", name: "LP-ok", kind: "lp", ref: "lpo", accreditation: "accredited", kyb_status: "cleared", sanctions_status: "cleared", interest: { categories: ["real_time_payments"] }, requested_usd: 400_000 },
  ];
  const alloc = A.allocateDeal(deal, subs);
  assert(alloc.allocations.length === 2, `P3 expected 2 allocations, got ${alloc.allocations.length}`);
  assert(alloc.rejected.some((r) => r.subscriber_id === "lp_bad" && r.reasons.includes("not_accredited")), "P3 must reject the non-accredited LP");
  assert(alloc.allocations.every((a) => a.citations.length > 0), "P3 allocations must cite gating facts");

  fs.rmSync(tmp, { recursive: true, force: true });
  return "P1 advance+block · P2 recommend+exclude+block · P3 gates ok";
});

function mkStartup(compliance) {
  const s = (v) => ({ value: v, source_ref: "fact:x", confidence: 0.8 });
  return {
    company: "X", ref: "x", category: "real_time_payments",
    capability_differentiation: s(0.85), competitive_position: s(0.7), innovation_velocity: s(0.8), traction: s(0.72),
    compliance_readiness: s(compliance), security_posture: s(0.78), cu_references: s(0.8), financial_stability: s(0.68), support_model: s(0.65),
    api_maturity: s(0.8), connector_availability: s(0.6), integration_standards: s(0.7),
  };
}
function mkInst() {
  const s = (v) => ({ value: v, source_ref: "fact:i", confidence: 0.75 });
  return { institution: "CU", ref: "cu", executive_support: s(0.75), budget_capacity: s(0.55), tech_ops_capacity: s(0.7), security_compliance_posture: s(0.72), strategic_alignment: s(0.85), digital_ai_maturity: s(0.71) };
}
function mkOpp(sf = 0.82, rf = 0.74, tm = 0.78) {
  const s = (v) => ({ value: v, source_ref: "inf:o", confidence: 0.7 });
  return { strategic_fit: s(sf), regulatory_fit: s(rf), timing: s(tm) };
}

// --- Summary -----------------------------------------------------------------
const failed = results.filter((r) => !r.ok);
console.log(`\n${"═".repeat(52)}`);
console.log(`  ${failed.length === 0 ? "ALL GREEN" : `${failed.length} FAILING`}  ·  ${results.filter((r) => r.ok).length}/${results.length} checks passed`);
if (failed.length) console.log(`  failing: ${failed.map((r) => r.name.split(" ")[0]).join(", ")}`);
console.log(`${"═".repeat(52)}\n`);
process.exit(failed.length ? 1 : 0);
