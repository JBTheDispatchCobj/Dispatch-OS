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
//   ... plus the Sprint-II service steps: PERMISSIONS (authz == the 0016/0017 RLS
//   truth table), PROFILES (live decay + outcome-feedback + query), CONTRACTS
//   (RFC-2001/2014 request envelope + authorize-FIRST service contracts),
//   REGISTRY-PERSISTENCE (governed write-chain + resolver + profile round-trip),
//   the Sprint-III CONNECTOR step (RFC-2011 connector runtime: normalize-only,
//   authorize-first, change detection, failure/health, persisted profiles
//   reconcile to source), and the engine unit-test suite (TESTS).
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

// --- 5. Pipeline spine (Wave 1: run the whole vertical end-to-end) -----------
await step("PIPELINE   (spine: ingest→…→feed)", async () => {
  // Native TS type-stripping + the "@/*" alias hook — run the real modules, no
  // transpile. Register the hook, then import the pipeline + golden fixtures.
  const { register } = await import("node:module");
  register("./alias-hook.mjs", import.meta.url);
  const { runDealPipeline, variantsRestateIO } = await import(
    "@/cartridges/cooperative_markets/pipeline"
  );
  const { halcyonSummitRun, unapprovedRun, blockedRun } = await import(
    "@/cartridges/cooperative_markets/pipeline_fixtures"
  );

  // Golden advancing run: Halcyon × Summit → all the way to a lensed feed.
  const g = halcyonSummitRun();
  const run = runDealPipeline(g.input, g.ctx);

  // DETERMINISM: identical input → byte-identical run (ids/timestamps injected).
  const run2 = runDealPipeline(g.input, g.ctx);
  assert(JSON.stringify(run) === JSON.stringify(run2), "pipeline must be deterministic");

  assert(run.status === "settled", `golden run expected settled, got ${run.status}`);
  assert(run.scorecard.recommendation === "advance", "golden P1 must advance");
  assert(
    ["recommend", "recommend_with_conditions"].includes(run.memo.recommendation),
    "golden memo must be allocatable",
  );

  // KERNEL SPINE: every stage emitted a correlated event; spend was ledgered.
  const types = run.events.map((e) => e.type);
  for (const t of [
    "deal.ingested", "deal.scored", "deal.memo_drafted", "deal.allocated",
    "deal.settled", "io.assembled", "variants.rendered", "feed.built",
  ]) {
    assert(types.includes(t), `missing kernel event ${t}`);
  }
  assert(run.events.every((e) => e.correlation_id === run.run_id), "events must correlate to the run id");
  assert(run.cost.entries.length > 0 && run.cost.total_usd > 0, "cost ledger must record spend");
  assert(run.cost.by_category.human > 0, "the human review gate must be costed");

  // HARNESS: the IC memo (regulated conclusion) carries the human gate; the
  // deterministic stages route to rung 1 (deterministic_rule).
  const memoRoute = run.routes.find((r) => r.stage === "memo");
  assert(memoRoute && memoRoute.decision.escalate_to_human === true, "IC memo must carry the human gate");
  const detStages = run.routes.filter((r) => ["ingest", "score", "allocate", "settle", "feed"].includes(r.stage));
  assert(detStages.length === 5, `expected 5 deterministic stages, got ${detStages.length} (stage renamed?)`);
  assert(detStages.every((r) => r.decision.rung === "deterministic_rule"), "deterministic stages must route to rung 1");

  // HUMAN GATE HAS TEETH (the load-bearing invariant): the SAME advancing deal with
  // NO human approval must NOT allocate, settle, or publish — it halts awaiting approval.
  const u = unapprovedRun();
  const urun = runDealPipeline(u.input, u.ctx);
  assert(urun.status === "awaiting_approval", `unapproved run must await approval, got ${urun.status}`);
  assert(
    urun.allocation === null && urun.settlement === null && urun.io === null && urun.feed.length === 0,
    "unapproved regulated conclusion must not allocate/settle/publish",
  );
  assert(urun.events.some((e) => e.type === "deal.awaiting_approval"), "unapproved run must emit deal.awaiting_approval");
  assert(
    !urun.events.some((e) => ["deal.allocated", "deal.settled", "io.assembled", "feed.built"].includes(e.type)),
    "unapproved run must emit no downstream (allocate/settle/publish) events",
  );
  // The APPROVED golden run recorded the human act and lifted the IO to the human tier.
  assert(run.approval && run.approval.disposition === "approved", "golden run must carry the human approval");
  assert(run.events.some((e) => e.type === "deal.approved"), "approved run must emit deal.approved");
  assert(run.io.top_tier === "human_approved_conclusion", "approved IO top tier must be human_approved_conclusion");

  // TRUTH DISCIPLINE: variants restate the IO's refs exactly (no superset); the memo
  // is a draft proposal; claim-tier evidence is filed under claim_refs, not fact_refs.
  assert(variantsRestateIO(run.io, run.variants), "variants must restate IO refs exactly");
  assert(run.memo.status === "draft", "IC memo object must stay a draft proposal");
  assert((run.io.claim_refs ?? []).length > 0, "claim-tier evidence must be filed under claim_refs");
  assert(run.feed.length > 0, "golden feed must be non-empty");

  // BLOCKED PATH: compliance-gated deal never reaches the human gate; it halts.
  const b = blockedRun();
  const brun = runDealPipeline(b.input, b.ctx);
  assert(brun.status === "blocked", `blocked run expected blocked, got ${brun.status}`);
  assert(brun.allocation === null && brun.settlement === null, "blocked run must not allocate/settle");
  assert(brun.events.some((e) => e.type === "deal.halted"), "blocked run must emit deal.halted");

  return `approved→settled (${run.events.length} evt · $${run.cost.total_usd.toFixed(2)}) · unapproved→awaiting_approval (gate has teeth) · blocked→halt · truth-clean · deterministic`;
});

// --- 6. Data integrity (Wave 3: profiles/regulatory facts reconcile to source) ---
await step("DATA       (regulatory + profiles reconcile to source)", async () => {
  const { register } = await import("node:module");
  register("./alias-hook.mjs", import.meta.url);

  // Real staged NCUA corpus, read via fs (the pure ingestion modules take the
  // parsed records so they stay side-effect-free / importable under Node).
  const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(root, rel), "utf8"));
  const records = readJson("docs/04_sources/ncua/ncua_regulations_clean.json");
  const amendments = readJson("docs/04_sources/ncua/ncua_regulations_future_amendments.json");

  const { ingestRegulatoryCorpus } = await import("@/cartridges/cooperative_markets/ingest_regulations");
  const { institutionBatchFixtures } = await import("@/cartridges/cooperative_markets/batch_fixtures");
  const { ingestInstitutionBatch, factsToProfileFields } = await import("@/cartridges/cooperative_markets/ingest_batch");
  const { computeCallReportFacts } = await import("@/cartridges/cooperative_markets/ingest_call_report");
  const { ObjectRegistryService, InMemoryRegistryStore } = await import("@/core/registry/service");

  // ---- REGULATORY: real corpus → bi-temporal sourced facts -----------------
  const ISSUE = "2026-07-15";
  const regCtx = {
    issue_date: ISSUE, observed_at: "2026-07-21T17:00:00.000Z",
    source_id: "source:ncua_regulations", source_document_id: "sourcedoc:ncua:regulations:2026-07-15",
    id_prefix: "ncua:reg",
  };
  const corpus = ingestRegulatoryCorpus(records, amendments, regCtx);

  // Pin the source shape to the 2026-07-15 eCFR issue (update on a deliberate refresh):
  // catches SILENT source shrinkage/growth that a self-consistency check would miss.
  assert(records.length === 675, `NCUA in-force corpus must have 675 records (2026-07-15 issue), got ${records.length}`);
  assert(amendments.length === 10, `NCUA pending-amendment set must have 10 nodes, got ${amendments.length}`);
  // Every derived truth-object id must be unique (no collision silently dropping a fact).
  const allIds = corpus.observations.map((o) => o.id).concat(corpus.claims.map((c) => c.id));
  assert(new Set(allIds).size === allIds.length, `truth-object ids must be unique; ${allIds.length - new Set(allIds).size} collision(s)`);
  assert(corpus.observations.length + corpus.claims.length === records.length + amendments.length, "one truth object per source record (in-force + amendment)");
  assert(corpus.total_sections === records.length, `regulatory in-force count ${corpus.total_sections} != source records ${records.length}`);
  const inForce = corpus.observations.filter((o) => o.temporal.valid_from === ISSUE);
  assert(inForce.length === corpus.total_sections, "in-force observation count must equal total_sections");
  assert(inForce.every((o) => o.truth_kind === "observation" && o.tier === "public_fact" && o.plane === "shared_market" && o.visibility === "public"),
    "in-force regulatory facts must be public_fact observations on the shared-market plane");
  // Pending amendments with full text are FUTURE-dated observations (bi-temporal).
  const future = corpus.observations.filter((o) => o.temporal.valid_from !== ISSUE);
  assert(future.length === corpus.pending_full_text, "future-amendment observation count must equal pending_full_text");
  assert(future.every((o) => typeof o.temporal.valid_from === "string" && o.temporal.valid_from > ISSUE),
    "pending-amendment observations must carry a FUTURE valid_from (bi-temporal)");
  // Amendatory instructions (no rewrite) are HELD as claims — never auto-merged into in-force text.
  assert(corpus.claims.every((c) => c.truth_kind === "claim" && c.tier === "public_fact"), "held instructions must be public_fact claims");
  assert(corpus.claims.length === corpus.held_instructions, "held_instructions must equal the claim count");
  assert(corpus.pending_full_text + corpus.held_instructions === amendments.length,
    `amendments split ${corpus.pending_full_text}+${corpus.held_instructions} must equal ${amendments.length}`);
  // Determinism: same records + ctx → byte-identical corpus.
  assert(JSON.stringify(ingestRegulatoryCorpus(records, amendments, regCtx)) === JSON.stringify(corpus), "regulatory ingestion must be deterministic");

  // ---- INSTITUTIONS: batch profiles reconcile to their source 5300 ----------
  const batchCtx = { observed_at: "2026-07-21T17:00:00.000Z", id_prefix: "coop:batch" };
  const fixtures = institutionBatchFixtures();
  const batch = ingestInstitutionBatch(fixtures, batchCtx);
  assert(batch.length === fixtures.length && batch.length >= 5, `batch size ${batch.length} unexpected`);
  const RATIOS = ["net_worth_ratio", "roa", "loan_to_share", "delinquency_ratio", "member_growth"];
  for (let i = 0; i < batch.length; i++) {
    const raw = fixtures[i].raw;
    const recomputed = computeCallReportFacts(raw);
    // Facts reconcile EXACTLY to a fresh recompute from the raw filing (deterministic calc).
    assert(JSON.stringify(recomputed) === JSON.stringify(batch[i].facts), `facts for ${raw.institution} must reconcile to a recompute from source`);
    // INDEPENDENT oracle (not via computeCallReportFacts): the ratios must equal the raw
    // figures worked out longhand — a real cross-check that the math is right, not just self-consistent.
    const f = batch[i].facts;
    const near = (a, b) => Math.abs(a - b) < 1e-6;
    const priorOk = raw.members_prior === undefined || raw.members_prior === 0;
    assert(near(f.net_worth_ratio, (raw.net_worth / raw.total_assets) * 100), `net_worth_ratio oracle mismatch for ${raw.institution}`);
    assert(near(f.roa, (raw.net_income / raw.average_assets) * 100), `roa oracle mismatch for ${raw.institution}`);
    assert(near(f.loan_to_share, (raw.total_loans / raw.total_shares) * 100), `loan_to_share oracle mismatch for ${raw.institution}`);
    assert(near(f.delinquency_ratio, (raw.delinquent_loans / raw.total_loans) * 100), `delinquency_ratio oracle mismatch for ${raw.institution}`);
    assert(priorOk ? f.member_growth === 0 : near(f.member_growth, ((raw.members - raw.members_prior) / raw.members_prior) * 100), `member_growth oracle mismatch for ${raw.institution}`);
    const prof = batch[i].profile;
    for (const key of RATIOS) {
      const field = prof.fields.find((f) => f.key === key);
      assert(field, `profile ${raw.institution} missing field ${key}`);
      assert(field.value === batch[i].facts[key], `profile field ${key} (${field.value}) must equal the source ratio (${batch[i].facts[key]})`);
      assert(field.tier === "deterministic_calculation", `ratio ${key} must be tier deterministic_calculation, got ${field.tier}`);
      assert(field.source_ref === batch[i].facts.source_ref, `ratio ${key} must cite the filing source_ref`);
    }
    assert(prof.lineage.every((r) => r === batch[i].facts.source_ref), "every profile field must trace to the one 5300 filing");
    assert(prof.confidence >= 0 && prof.confidence <= 1, "profile confidence must be in [0,1]");
    assert(["strong", "adequate", "thin"].includes(prof.health), "profile health must be a known band");
  }
  // factsToProfileFields is the mapping the reconciliation rests on — must cover all 5 ratios.
  assert(factsToProfileFields(batch[0].facts).length === RATIOS.length, "factsToProfileFields must emit all 5 ratio fields");
  // Determinism: same batch → byte-identical.
  assert(JSON.stringify(ingestInstitutionBatch(fixtures, batchCtx)) === JSON.stringify(batch), "institution batch must be deterministic");

  // ---- REGISTRY: entity resolution proposes, never auto-merges --------------
  let n = 0;
  const svc = new ObjectRegistryService(new InMemoryRegistryStore(), { idGen: () => `reg:obj:${n++}`, now: "2026-07-21T17:00:00.000Z" });
  const cls = "entity:coop_markets:credit_union";
  const a = svc.register({ object_class: cls, canonical_slug: "summit_ridge_fcu", display_name: "Summit Ridge FCU", plane: "shared_market", visibility: "public", external_ids: [{ system: "ncua_charter", value: "60441" }], aliases: ["Summit Ridge FCU"] });
  const b = svc.register({ object_class: cls, canonical_slug: "summit_ridge_federal_credit_union", display_name: "Summit Ridge Federal Credit Union", plane: "shared_market", visibility: "public", external_ids: [{ system: "ncua_charter", value: "60441" }], aliases: ["Summit Ridge Federal Credit Union"] });
  svc.register({ object_class: cls, canonical_slug: "harbor_point_cu", display_name: "Harbor Point CU", plane: "shared_market", visibility: "public", external_ids: [{ system: "ncua_charter", value: "12007" }], aliases: ["Harbor Point CU"] });
  const cands = svc.resolve();
  assert(cands.length === 1, `resolver must propose exactly 1 duplicate candidate (charter-matched), got ${cands.length}`);
  const c0 = cands[0];
  assert([c0.left_id, c0.right_id].sort().join("|") === [a.id, b.id].sort().join("|"), "candidate must pair the two charter-60441 objects");
  assert(c0.reasons.some((r) => r.startsWith("shared_external_id")), "candidate must cite the shared external id");
  assert(c0.status === "proposed", "resolver must only PROPOSE (never auto-merge)");
  assert(svc.objects().every((o) => o.status === "active"), "no object may be merged before an explicit applyMerge");
  const merge = svc.applyMerge(a.id, b.id, "user:test", "decision:test:merge");
  assert(merge && svc.objects().find((o) => o.id === b.id).status === "merged", "applyMerge must mark the merged object");
  assert(svc.objects().find((o) => o.id === b.id).merged_into_id === a.id, "merged object must point at the survivor");
  assert(svc.merges().length >= 1, "merge must be recorded (append-only lineage)");

  return `regulatory ${corpus.total_sections} in-force + ${corpus.pending_full_text} pending + ${corpus.held_instructions} held (bi-temporal, deterministic) · ${batch.length} profiles reconcile to source · registry resolves+merges (proposed→gated)`;
});

// --- 7. Editorial gate (Wave 4: nothing publishes without a human editorial sign-off) ---
await step("EDITORIAL  (publication gate has teeth)", async () => {
  const { register } = await import("node:module");
  register("./alias-hook.mjs", import.meta.url);
  const { runDealPipeline } = await import("@/cartridges/cooperative_markets/pipeline");
  const { halcyonSummitRun } = await import("@/cartridges/cooperative_markets/pipeline_fixtures");
  const { distribute, deliveriesRestateIO, DEFAULT_CHANNELS } = await import("@/core/auric/distribution");

  const g = halcyonSummitRun();
  const run = runDealPipeline(g.input, g.ctx);
  assert(run.io && run.variants.length > 0, "need an assembled IO + variants to test distribution");
  const ctx = { idPrefix: "pub:test", publishedAt: g.ctx.startedAt };

  // GATE HAS TEETH: no editorial disposition → nothing published.
  const held = distribute(run.io, run.variants, DEFAULT_CHANNELS, null, ctx);
  assert(held.status === "held_for_editorial" && held.deliveries.length === 0, "absent editorial disposition must publish nothing");
  // Rejected → nothing published.
  const rejected = distribute(run.io, run.variants, DEFAULT_CHANNELS, { disposition: "rejected", by: "user:editor", decision_ref: "decision:ed:reject" }, ctx);
  assert(rejected.status === "rejected" && rejected.deliveries.length === 0, "rejected editorial disposition must publish nothing");
  // Held → nothing published.
  const held2 = distribute(run.io, run.variants, DEFAULT_CHANNELS, { disposition: "held", by: "user:editor", decision_ref: "decision:ed:hold" }, ctx);
  assert(held2.status === "held_for_editorial" && held2.deliveries.length === 0, "held editorial disposition must publish nothing");

  // APPROVED → publishes, and every delivery is sourced + carries the authorizing decision.
  const ed = { disposition: "approved", by: "user:managing_editor", decision_ref: "decision:ed:summit_halcyon:approved" };
  const pub = distribute(run.io, run.variants, DEFAULT_CHANNELS, ed, ctx);
  assert(pub.status === "published" && pub.deliveries.length > 0, "approved editorial disposition must publish deliveries");
  assert(pub.deliveries.every((d) => d.editorial_decision_ref === ed.decision_ref && d.approved_by === ed.by), "every delivery must carry the authorizing editorial decision (lineage, not a weight)");
  // TRUTH DISCIPLINE: every delivery restates the IO's refs exactly (no superset).
  assert(deliveriesRestateIO(run.io, pub.deliveries), "channel deliveries must restate the IO refs exactly");
  // Channel reach: terminal_feed is network (institution), market_feed is public.
  const term = pub.deliveries.filter((d) => d.channel === "terminal_feed");
  const market = pub.deliveries.filter((d) => d.channel === "market_feed");
  assert(term.length > 0 && term.every((d) => d.visibility === "network"), "terminal_feed deliveries must be network-visibility");
  assert(market.every((d) => d.visibility === "public"), "market_feed deliveries must be public-visibility");
  // Determinism: same inputs → byte-identical publication.
  assert(JSON.stringify(distribute(run.io, run.variants, DEFAULT_CHANNELS, ed, ctx)) === JSON.stringify(pub), "distribution must be deterministic");

  return `held/rejected→0 deliveries (gate has teeth) · approved→${pub.deliveries.length} deliveries across ${pub.channels.length} channels · sourced + restates IO · deterministic`;
});

// --- 8. Permission engine (Sprint II: authorization mirrors the RLS predicates) ---
await step("PERMISSIONS(RFC-2002: authz == 0016/0017 RLS)", async () => {
  const { register } = await import("node:module");
  register("./alias-hook.mjs", import.meta.url);
  const id = await import("@/core/kernel/identity");
  const perm = await import("@/core/kernel/permissions");

  const mem = (ws, role) => ({ workspace_id: ws, organization_id: "org", role });
  const owner = id.userPrincipal("u_owner", [mem("ws1", "owner")]);
  const operator = id.userPrincipal("u_op", [mem("ws1", "operator")]);
  const reviewer = id.userPrincipal("u_rev", [mem("ws1", "reviewer")]);
  const outsider = id.userPrincipal("u_out", [mem("ws2", "owner")]);
  const service = id.systemPrincipal();
  const agent = id.agentPrincipal("run1", []);
  const R = (plane, visibility, ws) => ({ plane, visibility, workspace_id: ws });

  // app_can_read_plane: public / shared_market+network / tenant-member / fail-closed.
  assert(perm.canReadPlane(operator, R("private_terminal", "public", null)), "public must be readable by any user");
  assert(perm.canReadPlane(reviewer, R("shared_market", "network", null)), "shared_market+network must be readable");
  assert(!perm.canReadPlane(reviewer, R("private_terminal", "network", null)), "network off the shared plane is NOT the market path");
  assert(perm.canReadPlane(operator, R("private_terminal", "tenant_private", "ws1")), "member reads own tenant row");
  assert(!perm.canReadPlane(outsider, R("private_terminal", "tenant_private", "ws1")), "non-member must be denied");
  assert(perm.readPlaneDecision(operator, R("private_terminal", "tenant_private", null)).reason === "no_tenant", "tenant row with no workspace is fail-closed");
  assert(perm.readPlaneDecision(agent, R("shared_market", "public", null)).reason === "unauthenticated", "an agent has no auth.uid()");
  // Consistency: an agent WITH a membership is denied write too (no write-without-read principal).
  const agentMember = id.agentPrincipal("run2", [mem("ws1", "owner")]);
  assert(!perm.can(agentMember, "write", R("private_terminal", "tenant_private", "ws1")), "an agent must not gain a write it cannot pair with a read");

  // Service role bypasses RLS everywhere (the shared-market ingestion path).
  assert(perm.authorize(service, "read", R("private_terminal", "tenant_private", "wsX")).reason === "service_role_bypass", "service bypass reason");
  assert(perm.can(service, "update", R("private_terminal", "tenant_private", "ws1")), "service bypasses tenant update");

  // app_can_write_tenant: insert = owner/admin/operator; update/admin = owner/admin.
  assert(perm.can(operator, "write", R("private_terminal", "tenant_private", "ws1")), "operator may INSERT tenant rows");
  assert(!perm.can(reviewer, "write", R("private_terminal", "tenant_private", "ws1")), "reviewer may not write");
  assert(!perm.can(operator, "update", R("private_terminal", "tenant_private", "ws1")), "operator may NOT update (owner/admin only)");
  assert(perm.can(owner, "update", R("private_terminal", "tenant_private", "ws1")), "owner may update");
  assert(perm.writeTenantDecision(owner, null, perm.TENANT_WRITE_ROLES).reason === "no_tenant", "shared-market write falls to the service role");

  // Governed merge (0017 §8): owner/admin on a tenant object; a SHARED-MARKET object
  // is governable by NO authenticated user — only the platform service role.
  const tenantObj = { plane: "private_terminal", visibility: "tenant_private", workspace_id: "ws1" };
  const sharedObj = { plane: "shared_market", visibility: "public", workspace_id: null };
  assert(perm.canAdminObject(owner, tenantObj), "owner governs a tenant object");
  assert(!perm.canAdminObject(operator, tenantObj), "operator does NOT govern (merge/split is owner/admin)");
  assert(!perm.authorizeMerge(owner, sharedObj).allowed, "a shared-market merge is NOT authorizable by a tenant owner");
  assert(perm.authorizeMerge(service, sharedObj).allowed, "only the platform service role governs shared-market identity");

  // Purity/determinism: repeated calls are byte-identical (no clock/IO/randomness).
  const d1 = perm.authorize(operator, "read", R("private_terminal", "tenant_private", "ws1"));
  const d2 = perm.authorize(operator, "read", R("private_terminal", "tenant_private", "ws1"));
  assert(JSON.stringify(d1) === JSON.stringify(d2), "authorization must be deterministic");
  assert(typeof d1.reason === "string" && d1.reason.length > 0, "every decision carries an auditable reason");

  return "read plane-aware · write owner/admin/operator vs update owner/admin · service bypass · shared-market merge = service-only · deterministic";
});

// --- 9b. Live profiles + query (Sprint II Wave 2: confidence engine drives assembly) ---
await step("PROFILES   (live decay + outcome-feedback + query)", async () => {
  const { register } = await import("node:module");
  register("./alias-hook.mjs", import.meta.url);

  const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(root, rel), "utf8"));
  const records = readJson("docs/04_sources/ncua/ncua_regulations_clean.json");
  const amendments = readJson("docs/04_sources/ncua/ncua_regulations_future_amendments.json");

  const { ingestRegulatoryCorpus } = await import("@/cartridges/cooperative_markets/ingest_regulations");
  const { institutionBatchFixtures } = await import("@/cartridges/cooperative_markets/batch_fixtures");
  const { ingestInstitutionBatch } = await import("@/cartridges/cooperative_markets/ingest_batch");
  const { buildLiveProfiles } = await import("@/cartridges/cooperative_markets/profiles_live");
  const { assembleLiveProfile } = await import("@/core/profile/assemble_live");
  const { queryProfiles, lookupField, rankProfiles } = await import("@/core/profile/query");
  const { assessFreshness } = await import("@/core/profile/freshness");

  const AS_OF = "2026-07-22T00:00:00.000Z";

  // ---- FRESHNESS DECAY: a stale field contributes strictly less than a fresh one.
  const liveBase = (observed_at, outcomes) => ({
    id: "prof:x", subject_ref: "e:1", subject_type: "credit_union", display_name: "X", as_of: AS_OF,
    fields: [{ key: "nw", label: "nw", value: 9, source_ref: "filing:1", tier: "deterministic_calculation", confidence: 0.9, observed_at, ...(outcomes ? { outcomes } : {}) }],
  });
  const freshP = assembleLiveProfile(liveBase(AS_OF));
  const STALE = "2025-07-22T00:00:00.000Z"; // exactly one 365d half-life before AS_OF
  const staleP = assembleLiveProfile(liveBase(STALE));
  assert(freshP.fields[0].confidence > staleP.fields[0].confidence, "a stale field must contribute less (live decay)");
  assert(Math.abs(staleP.fields[0].confidence - 0.45) < 1e-6, "0.9 prior halves to ~0.45 at one half-life");
  assert(freshP.assembled_live === true && staleP.field_freshness[0].band === "aging", "live audit surface present");
  // freshness scalar is the same decay curve on a unit prior.
  assert(Math.abs(assessFreshness(STALE, AS_OF, 365).freshness - staleP.fields[0].confidence / 0.9) < 1e-6, "freshness == decay(1,age,halfLife)");

  // ---- OUTCOME-FEEDBACK: agreement lifts, contradiction lowers (reinforce).
  const agreed = assembleLiveProfile(liveBase(AS_OF, [{ agreed: true, weight: 0.5, source_ref: "v:1" }]));
  const disagreed = assembleLiveProfile(liveBase(AS_OF, [{ agreed: false, weight: 0.5, source_ref: "v:2" }]));
  assert(agreed.outcome_adjustments[0].adjusted_confidence > 0.9, "agreement must pull confidence toward 1");
  assert(disagreed.outcome_adjustments[0].adjusted_confidence < 0.9, "contradiction must pull confidence toward 0");

  // ---- LIVE over the REAL corpus: regulation-environment counts reconcile to source.
  const corpus = ingestRegulatoryCorpus(records, amendments, {
    issue_date: "2026-07-15", observed_at: "2026-07-21T17:00:00.000Z",
    source_id: "source:ncua_regulations", source_document_id: "sourcedoc:ncua:regulations:2026-07-15", id_prefix: "ncua:reg",
  });
  const batch = ingestInstitutionBatch(institutionBatchFixtures(), { observed_at: AS_OF, id_prefix: "coop:batch" });
  const ctx = { as_of: AS_OF, id_prefix: "coop" };
  const set = buildLiveProfiles({ corpus, batch }, ctx);
  const reg = set.regulation_environment;
  assert(lookupField(reg, "in_force_sections").value === corpus.total_sections && corpus.total_sections === 675, "reg-env in_force_sections must equal the real 675-section corpus");
  assert(reg.fields.every((f) => f.source_ref === corpus.source_document.id && f.tier === "deterministic_calculation"), "reg-env fields must be corpus-sourced deterministic calcs");
  assert(set.all.length === batch.length + 1, "buildLiveProfiles.all = institutions + reg-env");
  // Institution profiles are live-aged below the 0.9 filing prior (2026-Q1 → as_of).
  assert(set.institutions.every((p) => p.confidence < 0.9 && p.assembled_live === true), "institution profiles must be live-aged below the filing prior");

  // ---- QUERY: filter (tier floor + field predicate) + rank + lookup, deterministic.
  const wellCapped = queryProfiles(set.all, { subject_type: "credit_union", field: { key: "net_worth_ratio", op: "gte", value: 7 }, rank_by: "field_value", rank_field_key: "net_worth_ratio", dir: "desc" });
  assert(wellCapped.matched.length > 0 && wellCapped.matched.every((p) => lookupField(p, "net_worth_ratio").value >= 7), "query must keep only net_worth_ratio>=7");
  const nwrs = wellCapped.matched.map((p) => lookupField(p, "net_worth_ratio").value);
  assert(nwrs.every((v, i) => i === 0 || nwrs[i - 1] >= v), "field_value ranking must be non-increasing");
  const graded = queryProfiles(set.all, { tier_floor: "deterministic_calculation", min_confidence: 0.5 });
  assert(graded.total === set.all.length, "all live profiles sit at/above deterministic_calculation with conf>=0.5");
  assert(graded.applied.some((a) => a.startsWith("tier_floor")), "applied predicates are reported (explainable)");
  // Stable tiebreak: equal-confidence institutions rank by id ascending.
  const ranked = rankProfiles(set.institutions, { rank_by: "confidence", dir: "desc" });
  const tied = ranked.map((p) => p.id);
  assert(JSON.stringify(tied) === JSON.stringify([...tied].sort()), "tied confidences must resolve to id-ascending (total order)");

  // END-TO-END: freshness → query. A field-confidence floor filters out a
  // genuinely STALE live-assembled field (the fresh sibling survives).
  const staleFiltered = queryProfiles([freshP, staleP], { min_field_confidence: { key: "nw", min: 0.5 } });
  assert(staleFiltered.matched.length === 1 && staleFiltered.matched[0].fields[0].confidence >= 0.5, "min_field_confidence must drop the stale live field, keep the fresh one");

  // ---- DETERMINISM: identical inputs → byte-identical profile set + query.
  assert(JSON.stringify(buildLiveProfiles({ corpus, batch }, ctx)) === JSON.stringify(set), "live profile assembly must be deterministic");
  assert(JSON.stringify(queryProfiles(set.all, { rank_by: "confidence", dir: "desc", limit: 3 })) === JSON.stringify(queryProfiles(set.all, { rank_by: "confidence", dir: "desc", limit: 3 })), "query must be deterministic");

  return `live decay (stale 0.9→0.45) · outcome-feedback (±) · reg-env over REAL ${corpus.total_sections} sections · ${set.institutions.length} institution profiles live-aged · query filter/rank/lookup · deterministic`;
});

// --- 9c. Contracts + request envelope (Sprint II Wave 3: authorize-FIRST) -----
await step("CONTRACTS  (RFC-2001/2014: envelope + authorize-first)", async () => {
  const { register } = await import("node:module");
  register("./alias-hook.mjs", import.meta.url);
  const id = await import("@/core/kernel/identity");
  const env = await import("@/core/kernel/envelope");
  const con = await import("@/core/kernel/contracts");
  const session = await import("@/core/auth/session");
  const dealsvc = await import("@/cartridges/cooperative_markets/deal_service");
  const { halcyonSummitRun } = await import("@/cartridges/cooperative_markets/pipeline_fixtures");

  const mem = (ws, role) => ({ workspace_id: ws, organization_id: "org", role });
  const owner = id.userPrincipal("u_owner", [mem("ws1", "owner")]);
  const operator = id.userPrincipal("u_op", [mem("ws1", "operator")]);
  const reviewer = id.userPrincipal("u_rev", [mem("ws1", "reviewer")]);
  const outsider = id.userPrincipal("u_out", [mem("ws2", "owner")]);
  const service = id.systemPrincipal();

  const mk = (principal, cid) =>
    env.makeEnvelope({ principal, correlation_id: cid ?? "corr:1", plane: "private_terminal", occurred_at: "2026-07-22T00:00:00.000Z", request_id: "req:1" });
  const res = con.tenantResource("ws1");

  // ---- ENVELOPE: pure/deterministic; a derived child keeps the correlation id.
  const e1 = mk(owner);
  const e2 = mk(owner);
  assert(JSON.stringify(e1) === JSON.stringify(e2), "makeEnvelope must be deterministic (no clock/id minting inside)");
  assert(env.envelopeActor(e1) === "user:u_owner", "envelopeActor mirrors the principal actor string");
  const child = env.deriveEnvelope(e1, { request_id: "req:2", occurred_at: "2026-07-22T00:00:01.000Z" });
  assert(child.correlation_id === e1.correlation_id, "a derived child envelope KEEPS the parent correlation id");
  assert(child.request_id === "req:2" && child.request_id !== e1.request_id, "the child takes a fresh injected request id");

  // ---- AUTHORIZE-FIRST: on deny the delegate NEVER runs; on allow it runs once.
  let ran = 0;
  const denied = con.guard(mk(reviewer), "promote", res, () => { ran++; return "did"; });
  assert(denied.ok === false, "reviewer must be REFUSED 'promote' (not in owner/admin/operator)");
  assert(denied.refusal.reason === "missing_role" && denied.refusal.action === "promote", "refusal carries the machine-readable engine reason + action");
  assert(denied.refusal.correlation_id === "corr:1", "refusal carries the request correlation id (auditable lineage)");
  assert(ran === 0, "authorize-FIRST: a denied delegate must NOT run");
  const allowed = con.guard(mk(operator), "promote", res, () => { ran++; return "did"; });
  assert(allowed.ok === true && allowed.value === "did" && ran === 1, "an allowed 'promote' reaches the engine exactly once");

  // ---- VERB TRUTH TABLE: review = owner/admin/reviewer; approve = owner/admin.
  assert(con.authorizeThrough(mk(reviewer), "review", res).allowed, "reviewer may REVIEW");
  assert(!con.authorizeThrough(mk(reviewer), "approve", res).allowed, "reviewer may NOT approve (owner/admin gate)");
  assert(con.authorizeThrough(mk(owner), "approve", res).allowed, "owner may approve");
  assert(!con.authorizeThrough(mk(operator), "approve", res).allowed, "operator may NOT approve");
  assert(!con.authorizeThrough(mk(outsider), "review", res).allowed, "a non-member is refused (not_member)");
  assert(con.authorizeThrough(mk(outsider), "review", res).reason === "not_member", "refusal reason names the predicate");

  // ---- SERVICE BYPASS: the platform service role bypasses, exactly like RLS.
  assert(con.authorizeThrough(mk(service), "approve", res).reason === "service_role_bypass", "service role bypasses the contract too");

  // ---- DETERMINISM: repeated authorization is byte-identical.
  assert(JSON.stringify(con.authorizeThrough(mk(operator), "promote", res)) === JSON.stringify(con.authorizeThrough(mk(operator), "promote", res)), "authorization must be deterministic");

  // ---- canReview SHIM: its boolean now COMES FROM the engine (retired as source of truth).
  assert(session.canReview("reviewer") === true && session.canReview("owner") === true, "shim: owner/reviewer review");
  assert(session.canReview("operator") === false && session.canReview("viewer") === false, "shim: operator/viewer do NOT review (engine decision)");

  // ---- HARNESS: the envelope carried through the deal pipeline correlates the whole run.
  const g = halcyonSummitRun();
  const denyRun = dealsvc.runDealThroughContract(mk(reviewer, "corr:deal"), res, g.input);
  assert(denyRun.ok === false && denyRun.refusal.reason === "missing_role", "a denied principal gets a typed refusal, NOT a deal run");
  const okRun = dealsvc.runDealThroughContract(mk(operator, "corr:deal"), res, g.input);
  assert(okRun.ok === true, "an authorized operator runs the deal through the contract");
  const run = okRun.value;
  assert(run.run_id === "corr:deal", "the run id is seeded from the envelope correlation id");
  assert(run.events.length > 0 && run.events.every((ev) => ev.correlation_id === "corr:deal"), "every kernel event correlates to the envelope");
  assert(run.cost.entries.every((c) => c.correlation_id === "corr:deal"), "every cost entry correlates to the envelope");
  assert(run.status === "settled", "the human-gated golden run still settles (contract wraps, does not rewrite, the engine)");

  return "envelope pure+derives · authorize-FIRST (deny→refusal, delegate unrun) · review/approve/promote truth table · service bypass · canReview shim = engine · deal run correlates to the envelope";
});

// --- 10. Registry persistence + matured resolution + profile persistence -----
await step("REGISTRY-PERSISTENCE(governed write-chain · resolver no-clobber · profile round-trip)", async () => {
  const { register } = await import("node:module");
  register("./alias-hook.mjs", import.meta.url);
  const idm = await import("@/core/kernel/identity");
  const { makeEnvelope } = await import("@/core/kernel/envelope");
  const { EventBus } = await import("@/core/kernel/event_bus");
  const { CostLedger } = await import("@/core/kernel/cost_ledger");
  const { ObjectRegistryService, InMemoryRegistryStore } = await import("@/core/registry/service");
  const { SupabaseRegistryStore } = await import("@/core/registry/supabase-store");
  const { GovernedObjectRegistry } = await import("@/core/registry/governed_registry");
  const { proposeMatches, resolveThroughStore } = await import("@/core/registry/resolver");
  const { assembleLiveProfile } = await import("@/core/profile/assemble_live");
  const { SupabaseProfileStore, profileToRow, rowToProfile, InMemoryProfileStore } =
    await import("@/core/profile/persistence");

  const cls = "entity:coop_markets:credit_union";
  const STOP = ["fcu", "federal", "credit", "union", "cu"];
  const mem = (ws, role) => ({ workspace_id: ws, organization_id: "org", role });
  const envOf = (principal, cid) => makeEnvelope({ principal, correlation_id: cid ?? "corr:reg", plane: "shared_market", occurred_at: "2026-07-22T00:00:00.000Z", request_id: "req:1" });
  const sharedInput = (slug, name, charter, aliases) => ({ object_class: cls, canonical_slug: slug, display_name: name, plane: "shared_market", visibility: "public", external_ids: charter ? [{ system: "ncua_charter", value: charter }] : undefined, aliases });

  // A tiny in-memory fake of the narrow table client (records call order).
  const fakeClient = () => {
    const tables = { object_registry: [], object_match_candidates: [], object_merges: [], profile_snapshots: [] };
    const calls = [];
    return {
      tables, calls,
      async upsert(table, rows) { calls.push(table); const t = tables[table]; for (const row of rows) { const i = t.findIndex((r) => r.id === row.id); if (i >= 0) t[i] = row; else t.push(row); } return { error: null }; },
      async selectAll(table) { return { data: tables[table].slice(), error: null }; },
    };
  };

  // ---- GOVERNED WRITE-CHAIN: authorize-FIRST + service-only merge + serialized flush.
  {
    const store = new SupabaseRegistryStore();
    const client = fakeClient();
    const bus = new EventBus();
    const ledger = new CostLedger();
    let n = 0, e = 0;
    const service = new ObjectRegistryService(store, { idGen: () => `reg:${n++}`, now: "2026-07-22T00:00:00.000Z" });
    const gov = new GovernedObjectRegistry({ service, store, client, bus, ledger, idGen: () => `ev:${e++}` });
    const svc = envOf(idm.systemPrincipal(), "corr:persist");
    const a = gov.registerThrough(svc, sharedInput("s", "Alpha", "1")).value;
    const b = gov.registerThrough(svc, sharedInput("s2", "Alpha", "1")).value;

    // A non-service user is REFUSED the shared-market merge; the engine never runs.
    const user = idm.userPrincipal("u1", [mem("ws1", "owner")]);
    const denied = gov.mergeThrough(envOf(user, "corr:persist"), a.id, b.id, "decision:x");
    assert(denied.ok === false && denied.refusal.reason === "no_tenant", "a shared-market registry merge is governable by NO authenticated user (service-role-only)");
    assert(gov.merges().length === 0, "authorize-FIRST: a refused merge never runs the engine");

    const ok = gov.mergeThrough(svc, a.id, b.id, "decision:x");
    assert(ok.ok === true && gov.objects().find((o) => o.id === b.id).status === "merged", "the service role performs the merge");
    const evts = bus.history({ type: "registry.objects_merged" });
    assert(evts.length === 1 && evts[0].correlation_id === "corr:persist", "the merge emits a KernelEvent correlated to the request envelope");
    assert(ledger.entries({ correlation_id: "corr:persist" }).length >= 1, "the governed write emits a correlated CostEntry");

    await gov.drain(); // await the serialized durable flush
    assert(client.tables.object_registry.length === 2 && client.tables.object_merges.length === 1, "the write-chain persisted both objects + the merge");
    const firstObj = client.calls.indexOf("object_registry");
    const firstMerge = client.calls.indexOf("object_merges");
    assert(firstObj >= 0 && firstMerge > firstObj, "serialized write-chain: a merge flush never precedes the register flush (no race)");
  }

  // ---- RESOLVER NO-CLOBBER: a human-reviewed candidate is never re-proposed.
  {
    const store = new InMemoryRegistryStore();
    let n = 0;
    const service = new ObjectRegistryService(store, { idGen: () => `reg:${n++}`, now: "2026-07-22T00:00:00.000Z" });
    // Charter-less near-duplicate proposed purely on name/alias token similarity.
    service.register(sharedInput("summit_ridge_fcu", "Summit Ridge FCU", undefined, undefined));
    service.register(sharedInput("summit_ridge_federal_credit_union", "Summit Ridge Federal Credit Union", undefined, undefined));
    const first = resolveThroughStore(store, { stopwords: STOP });
    assert(first.proposed.length === 1 && first.proposed[0].reasons.some((r) => r.startsWith("name_similarity:")), "matured resolver proposes a charter-less duplicate on name/alias similarity (blocking + similarity)");
    assert(first.proposed[0].status === "proposed", "propose-only (never auto-merge)");
    // A human REJECTS it, then a re-run must NOT clobber that decision.
    const c = store.candidates()[0];
    store.putCandidate({ ...c, status: "rejected" });
    const second = resolveThroughStore(store, { stopwords: STOP });
    assert(second.proposed.length === 0 && second.skipped_reviewed.length === 1, "NO-CLOBBER: a reviewed (rejected) candidate is not re-proposed");
    assert(store.candidates()[0].status === "rejected", "the human review decision is sticky across re-resolution");
    // Determinism.
    const j = JSON.stringify(proposeMatches({ objects: store.all(), existing: store.candidates(), opts: { stopwords: STOP } }));
    assert(j === JSON.stringify(proposeMatches({ objects: store.all(), existing: store.candidates(), opts: { stopwords: STOP } })), "matured resolution is deterministic");
  }

  // ---- PROFILE PERSISTENCE: persist -> hydrate round-trips a profile byte-
  //      identically AND plane-aware (planes never conflated on persistence).
  {
    const p = assembleLiveProfile({
      id: "profile:cu:60441", subject_ref: "ncua_charter:60441", subject_type: "credit_union", display_name: "Summit Ridge FCU",
      as_of: "2026-07-22T00:00:00.000Z",
      fields: [
        { key: "net_worth_ratio", label: "Net Worth Ratio", value: 11.2, unit: "%", source_ref: "fact:5300:60441:nwr", tier: "deterministic_calculation", confidence: 0.9, observed_at: "2026-03-31T00:00:00.000Z", outcomes: [{ agreed: true, source_ref: "verification:exam:2026Q2" }] },
        { key: "roa", label: "Return on Assets", value: 0.85, unit: "%", source_ref: "fact:5300:60441:roa", tier: "deterministic_calculation", confidence: 0.8, observed_at: "2026-03-31T00:00:00.000Z" },
      ],
    });
    // A shared-market public profile; the scope keeps the plane un-conflated.
    const pp = { profile: p, scope: { plane: "shared_market", visibility: "public", workspace_id: null, organization_id: null } };
    // Pure mapper round-trip: profile byte-identical + plane preserved.
    const row = profileToRow(pp);
    assert(typeof row.snapshot === "string" && row.plane === "shared_market" && row.visibility === "public", "the row carries the plane-aware discriminator (planes not conflated)");
    const back0 = rowToProfile(row);
    assert(JSON.stringify(back0.profile) === JSON.stringify(p), "profileToRow -> rowToProfile is byte-identical");
    assert(back0.scope.plane === "shared_market" && back0.scope.visibility === "public", "the plane-aware scope round-trips");
    // Persist through a fake client, hydrate a FRESH store (a process boundary).
    const client = fakeClient();
    const s1 = new SupabaseProfileStore();
    s1.put(pp);
    await s1.flush(client);
    assert(client.tables.profile_snapshots.length === 1 && s1.pendingRows().length === 0, "flush persists the profile then clears the queue");
    const s2 = new SupabaseProfileStore();
    await s2.hydrateFromSupabase(client);
    const back = s2.get(p.id);
    assert(JSON.stringify(back.profile) === JSON.stringify(p), "a profile survives persist->hydrate byte-identically (confidence/freshness/lineage intact)");
    assert(back.scope.plane === "shared_market", "the plane survives the process boundary");
    assert(back.profile.outcome_adjustments[0].outcome_source_refs.length === 1, "outcome evidence lineage survives persistence");
    // Default seam stays in-memory (gate green with no creds).
    assert(new InMemoryProfileStore().all().length === 0, "in-memory default constructs without a client");
  }

  return "governed write-chain (authorize-FIRST · shared-market merge service-only · correlated event+cost · serialized flush) · resolver blocking+similarity (charter-less proposal) + NO-CLOBBER (reviewed candidate sticky) · profile persist→hydrate byte-identical · deterministic";
});

// --- 11b. Connector runtime (Sprint III Wave 1: RFC-2011) --------------------
await step("CONNECTOR  (runtime: normalize · authorize · change · persist)", async () => {
  const { register } = await import("node:module");
  register("./alias-hook.mjs", import.meta.url);
  const { runConnector, stateFromOutput } = await import("@/core/kernel/connector_runtime");
  const { defineConnector, detectChanges, tallyChanges, deriveHealth, recordToObservation } = await import("@/core/kernel/connector_sdk");
  const { makeEnvelope } = await import("@/core/kernel/envelope");
  const idm = await import("@/core/kernel/identity");
  const { EventBus } = await import("@/core/kernel/event_bus");
  const { CostLedger } = await import("@/core/kernel/cost_ledger");
  const { validateConnectorCatalog, connectorSpecs, sourceForConnector } = await import("@/core/registry/connectors");
  const { runNcua5300, runNcuaRegulations } = await import("@/cartridges/cooperative_markets/run_connectors");
  const { institutionBatchFixtures } = await import("@/cartridges/cooperative_markets/batch_fixtures");
  // Sprint III Wave 2: full-market scale · startup-intake → deal engine · SEC EDGAR.
  const { ingestFullMarket } = await import("@/cartridges/cooperative_markets/run_market_ingest");
  const { bulkMarketRaw, marketProvenance, bulkMarket5300 } = await import("@/cartridges/cooperative_markets/bulk_5300_market");
  const { runStartupIntake, intakeICMemo, illustrativeInstitutionReadiness } = await import("@/cartridges/cooperative_markets/run_intake");
  const { startupIntakeFixtures } = await import("@/cartridges/cooperative_markets/intake_fixtures");
  const { runSecEdgar, secEdgarFixtures } = await import("@/cartridges/cooperative_markets/run_sec_edgar");
  // Sprint III Wave 3: two MORE real connectors (FDIC BankFind · Federal Register) +
  // connector entity-candidates → the Object Registry (propose-only).
  const { runFdicBankfind, fdicBankfindFixtures } = await import("@/cartridges/cooperative_markets/run_fdic_bankfind");
  const { runFederalRegister, federalRegisterFixtures } = await import("@/cartridges/cooperative_markets/run_federal_register");
  const { runRegistryCandidates } = await import("@/cartridges/cooperative_markets/run_registry_candidates");

  const AS_OF = "2026-07-22T00:00:00.000Z";
  const SRC = { key: "source:test", label: "T", version: 1, status: "active", authority: "regulatory", default_plane: "shared_market", default_visibility: "public", default_tier: "public_fact" };
  const mem = (ws, role) => ({ workspace_id: ws, organization_id: "org", role });
  const env = (p, cid) => makeEnvelope({ principal: p, correlation_id: cid ?? "corr:c", plane: "shared_market", occurred_at: AS_OF, request_id: "req:1" });
  const cnt = (p) => { let n = 0; return () => `${p}:${n++}`; };
  const okConn = (records) => defineConnector({ connector_key: "connector:test", source_key: "source:test", acquire: () => ({ records }), parse: (raw) => [{ external_ref: raw.ref, value: { v: raw.v } }] });

  // ---- CONFIG-AS-DATA CATALOG: the placeholders are qualified as a closed graph.
  const catalog = JSON.parse(fs.readFileSync(path.join(root, "core/registry/data/connectors.json"), "utf8"));
  const v = validateConnectorCatalog(catalog);
  assert(v.ok, "connector catalog is a closed graph: " + v.errors.join("; "));
  assert(v.connector_count >= 30 && v.connector_count === v.active_count, "a breadth of connectors is qualified + active");
  assert(sourceForConnector("connector:ncua_5300_call_report").default_tier === "public_fact", "5300 as-reported figures are public_fact (tier from source, not connector)");

  // ---- AUTHORIZE FIRST: a shared-market ingestion run is service-role-only.
  {
    let acquired = false;
    const conn = defineConnector({ connector_key: "c", source_key: "source:test", acquire: () => { acquired = true; return { records: [] }; }, parse: () => [] });
    const denied = await runConnector({ connector: conn, source: SRC, env: env(idm.userPrincipal("u1", [mem("ws1", "owner")])) }, { idGen: cnt("ev") });
    assert(denied.ok === false && denied.refusal.reason === "no_tenant", "a non-service principal is refused the shared-market run");
    assert(acquired === false, "authorize FIRST: acquire never ran on a refused run");
  }

  // ---- OUTPUT CONTRACT + CORRELATION: a service run emits correlated event+cost.
  {
    const bus = new EventBus(); const ledger = new CostLedger();
    const res = await runConnector({ connector: okConn([{ ref: "a", v: 1 }, { ref: "b", v: 2 }]), source: SRC, env: env(idm.systemPrincipal(), "corr:run") }, { idGen: cnt("ev"), bus, ledger, costPerAttempt: 0.01 });
    assert(res.ok && res.output.status === "success" && res.output.observations.length === 2, "the service role runs + normalizes");
    for (const k of ["quality_report", "health", "metrics", "change_events", "entity_candidates", "source_artifacts"]) assert(k in res.output, "output contract carries " + k);
    assert(bus.history({ type: "connector.started" })[0].correlation_id === "corr:run", "events correlate to the envelope");
    assert(ledger.byCategory().connector === 0.01, "a correlated connector CostEntry is recorded");
  }

  // ---- CHANGE DETECTION determinism: unchanged, updated, deleted.
  {
    const first = await runConnector({ connector: okConn([{ ref: "a", v: 1 }, { ref: "gone", v: 9 }]), source: SRC, env: env(idm.systemPrincipal()) }, { idGen: cnt("e1") });
    const prior = stateFromOutput(first.output);
    const second = await runConnector({ connector: okConn([{ ref: "a", v: 2 }]), source: SRC, env: env(idm.systemPrincipal()) }, { idGen: cnt("e2"), prior });
    assert(second.output.metrics.changes.updated === 1 && second.output.metrics.changes.deleted === 1, "a changed value updates; a dropped ref deletes");
    const same = await runConnector({ connector: okConn([{ ref: "a", v: 1 }, { ref: "gone", v: 9 }]), source: SRC, env: env(idm.systemPrincipal()) }, { idGen: cnt("e3"), prior });
    assert(same.output.metrics.changes.unchanged === 2 && same.output.metrics.changes.updated === 0, "re-running identical data detects only 'unchanged'");
    const pureA = tallyChanges(detectChanges([{ external_ref: "a", value: { v: 1 } }], undefined));
    assert(pureA.new === 1, "no prior state → everything new");
    // A ref that was SEEN but failed to normalize (a rejection) is NEVER a deletion.
    const rejConn = defineConnector({ connector_key: "c", source_key: "source:test", acquire: () => ({ records: [{ ref: "ok", v: 1 }, { ref: "bad", v: 2 }] }), parse: (raw) => { if (raw.ref === "bad") throw new Error("x"); return [{ external_ref: raw.ref, value: { v: raw.v } }]; } });
    const rej = await runConnector({ connector: rejConn, source: SRC, env: env(idm.systemPrincipal()) }, { idGen: cnt("e4"), prior: new Map([["ok", "h"], ["bad", "h"]]) });
    assert(rej.output.metrics.changes.deleted === 0 && rej.output.quality_report.rejected_records === 1, "a normalization failure is a rejection, NEVER a fabricated deletion");
  }

  // ---- TIER FROM SOURCE (not the connector): two sources → two tiers/planes.
  {
    const pub = recordToObservation({ external_ref: "e", value: { v: 1 } }, SRC, { id: "o1", observed_at: AS_OF, asserted_by: "system" });
    const tenantSrc = { key: "source:t", label: "T", version: 1, status: "active", authority: "institution_official", default_plane: "private_terminal", default_visibility: "tenant_private", default_tier: "private_tenant_fact" };
    const priv = recordToObservation({ external_ref: "e", value: { v: 1 } }, tenantSrc, { id: "o2", observed_at: AS_OF, asserted_by: "system" });
    assert(pub.tier === "public_fact" && priv.tier === "private_tenant_fact" && pub.plane !== priv.plane, "tier/plane are READ FROM the source manifest, not hardcoded in the connector");
  }

  // ---- FAILURE SEMANTICS: retry → failed (offline), and NEVER a fabricated deletion.
  {
    let calls = 0;
    const flaky = defineConnector({ connector_key: "c", source_key: "source:test", acquire: () => { calls++; throw new Error("down"); }, parse: () => [] });
    const res = await runConnector({ connector: flaky, source: SRC, env: env(idm.systemPrincipal()) }, { idGen: cnt("ev"), prior: new Map([["x", "h"]]), retry: { max_attempts: 3, circuit_breaker_threshold: 5 } });
    assert(res.ok && res.output.status === "failed" && res.output.health.state === "offline", "an exhausted acquire is a failed/offline output, not a throw");
    assert(calls === 3 && res.output.change_events.length === 0, "retried to the budget · a fetch failure NEVER fabricates a deletion");
    const circuit = await runConnector({ connector: flaky, source: SRC, env: env(idm.systemPrincipal()) }, { idGen: cnt("ev"), consecutiveFailures: 5, retry: { max_attempts: 3, circuit_breaker_threshold: 5 } });
    assert(circuit.output.health.reason === "circuit_open", "the circuit breaker short-circuits a struggling source");
    assert(deriveHealth(1, 0, false).state === "healthy" && deriveHealth(0.5, 0, false).state === "degraded", "health bands by normalization rate");
  }

  // ---- REAL WIRING: 5300 → normalized → PERSISTED profiles reconcile to source.
  const batch = institutionBatchFixtures().map((i) => i.raw);
  const r5300 = await runNcua5300(batch, { as_of: AS_OF });
  assert(r5300.output.status === "success" && r5300.output.observations.length === batch.length, "5300 connector normalizes every filing");
  assert(r5300.persisted.length === batch.length && r5300.reconciliation.reconciled === true, "persisted live profiles reconcile to the connector source refs");
  assert(r5300.reconciliation.profile_source_refs.length >= batch.length, "reconciliation is non-vacuous (source refs actually present, not an empty .every())");
  assert(r5300.persisted[0].scope.plane === "shared_market" && r5300.observations[0].tier === "public_fact", "plane-aware persistence · tier from the source manifest, not the connector");
  const r5300b = await runNcua5300(batch, { as_of: AS_OF });
  assert(JSON.stringify(r5300.output) === JSON.stringify(r5300b.output), "the wired connector run is deterministic");

  // ---- REAL CORPUS AT SCALE: the 675-section 12 CFR corpus normalizes.
  const regs = JSON.parse(fs.readFileSync(path.join(root, "docs/04_sources/ncua/ncua_regulations_clean.json"), "utf8"));
  const rReg = await runNcuaRegulations(regs, "2026-07-15", { as_of: AS_OF });
  assert(rReg.output.status === "success" && rReg.output.observations.length === regs.length && regs.length >= 600, "the REAL 675-section corpus normalizes at scale");

  // ---- WAVE 2 · FULL-MARKET 5300 AT SCALE: a LABELED synthetic market runs the WHOLE
  //      market through the UNCHANGED connector → PERSISTED profiles reconcile at scale.
  const MARKET = 300;
  const market = bulkMarket5300({ size: MARKET });
  const prov = marketProvenance(market);
  assert(prov.total === MARKET && prov.all_labeled && prov.golden >= 5 && prov.synthetic === MARKET - prov.golden, "the bulk market is fully labeled (golden subset + synthetic; NEVER presented as real filings)");
  const marketRaw = bulkMarketRaw({ size: MARKET });
  assert(new Set(marketRaw.map((r) => r.charter_number)).size === MARKET, "charters are unique across the whole market (no dupes at scale)");
  // NEGATIVE CONTROL — the label guard has TEETH: strip a filing's synthetic label and
  // marketProvenance must report all_labeled=false (it is computed from the data, not
  // hardcoded, so a regression that dropped the label would fail the gate, not ship green).
  const tampered = bulkMarket5300({ size: 12 }).map((i, idx) =>
    idx === 11 ? { ...i, raw: { ...i.raw, source_ref: "sourcedoc:ncua:5300:UNLABELED:2026Q1" } } : i);
  assert(marketProvenance(tampered).all_labeled === false, "all_labeled catches an unlabeled (real-looking) filing — the labeling invariant is enforced, not assumed");
  const rMarket = await ingestFullMarket({ as_of: AS_OF, market: { size: MARKET } });
  assert(rMarket.market_size === MARKET && rMarket.output.observations.length === MARKET, "the WHOLE market normalizes through the connector at scale");
  assert(rMarket.persisted.length === MARKET && rMarket.reconciliation.reconciled === true, "every persisted profile (at scale) reconciles to a connector source ref");
  assert(rMarket.reconciliation.profile_source_refs.length >= MARKET, "at-scale reconciliation is non-vacuous (source refs present, not an empty .every())");
  assert(rMarket.persisted[0].scope.plane === "shared_market" && rMarket.observations[0].tier === "public_fact", "plane-aware persistence · tier from the source manifest at scale");
  assert(rMarket.output.observations[0].value.net_worth_ratio === undefined, "the connector emits as-reported figures only — the ratio stays a downstream deterministic_calculation, never a weight");
  const rMarket2 = await ingestFullMarket({ as_of: AS_OF, market: { size: MARKET } });
  assert(JSON.stringify(rMarket.output) === JSON.stringify(rMarket2.output), "full-market ingestion is deterministic at scale");

  // ---- WAVE 2 · STARTUP INTAKE → DEAL ENGINE: the deferred live intake path. The
  //      runtime tiers intake third_party_claim; the EXISTING deal engine runs on
  //      NORMALIZED intake (not seed), citing the submission; human gates untouched.
  const intakeBus = new EventBus();
  const rIntake = await runStartupIntake(startupIntakeFixtures(), illustrativeInstitutionReadiness(), { as_of: AS_OF, bus: intakeBus });
  assert(rIntake.output.status === "success" && rIntake.observations.length === 3, "intake normalizes every submission through the runtime");
  assert(rIntake.observations[0].tier === "third_party_claim" && rIntake.observations[0].plane === "shared_market", "intake is a company's own CLAIM — tier from the source manifest, never a fact or a score in the connector");
  assert(intakeBus.history({ type: "connector.started" })[0].correlation_id === "corr:connector:startup_intake", "the intake run correlates to its envelope");
  const recs = Object.fromEntries(rIntake.scored.map((s) => [s.startup.company, s.scorecard.recommendation]));
  assert(recs["Halcyon Pay"] === "advance" && recs["Meridian Ledger"] === "blocked" && recs["Cobalt Rails"] === "hold", "the deal engine runs on normalized intake, exercising the advance/block/hold gates");
  assert(rIntake.scored.every((s) => s.scorecard.lineage.includes(s.record.external_ref) && s.scorecard.scores.innovation.tier === "dispatch_inference"), "every score cites the intake submission (real intake) + is a dispatch inference, not a fact");
  const advance = rIntake.scored.find((s) => s.scorecard.recommendation === "advance");
  const memo = intakeICMemo(advance, ["compliance_fit", "regulatory", "financial", "technology", "cybersecurity"].map((c) => ({ category: c, summary: "clear", status: "clear", evidence: [{ ref: `ev:${c}`, label: c, approved: true }] })));
  assert(memo.status === "draft" && memo.coverage.covered.length === 5, "the P2 IC memo from intake stays a DRAFT proposal (the committee decision is a separate human gate)");
  const rIntake2 = await runStartupIntake(startupIntakeFixtures(), illustrativeInstitutionReadiness(), { as_of: AS_OF });
  assert(JSON.stringify(rIntake.scored.map((s) => s.scorecard)) === JSON.stringify(rIntake2.scored.map((s) => s.scorecard)), "the intake→deal-engine path is deterministic");

  // ---- WAVE 2 · SEC EDGAR (a third real connector): normalizes filing headers,
  //      tiers public_fact FROM THE SOURCE MANIFEST — proven with a DIFFERING source.
  const rEdgar = await runSecEdgar(secEdgarFixtures(), { as_of: AS_OF });
  assert(rEdgar.output.status === "success" && rEdgar.observations.length === 3 && rEdgar.observations[0].tier === "public_fact", "SEC EDGAR headers normalize + tier public_fact from the source manifest");
  const edgarSrc = sourceForConnector("connector:sec_edgar");
  const claimSrc = { key: "source:alt", label: "Alt", version: 1, status: "active", authority: "press", default_plane: "shared_market", default_visibility: "public", default_tier: "third_party_claim" };
  const rec0 = rEdgar.output.observations[0];
  const asFact = recordToObservation(rec0, edgarSrc, { id: "o1", observed_at: AS_OF, asserted_by: "system" });
  const asClaim = recordToObservation(rec0, claimSrc, { id: "o2", observed_at: AS_OF, asserted_by: "system" });
  assert(asFact.tier === "public_fact" && asClaim.tier === "third_party_claim" && asFact.tier !== asClaim.tier, "identical connector code · tier read FROM the source manifest (differing-source proof, not a tautology)");

  // ---- WAVE 3 · FDIC BANKFIND (a real connector): normalizes FDIC-insured banks →
  //      public_fact FROM THE SOURCE, differing-source proof, financial_institution
  //      candidates (NOT credit unions), deterministic.
  const rFdic = await runFdicBankfind(fdicBankfindFixtures(), { as_of: AS_OF });
  assert(rFdic.output.status === "success" && rFdic.observations.length === 3 && rFdic.observations[0].tier === "public_fact", "FDIC BankFind records normalize + tier public_fact from the source manifest");
  assert(rFdic.output.entity_candidates[0].object_class === "entity:coop_markets:financial_institution", "FDIC banks surface as financial_institution — never mislabeled a credit union");
  const fdicSrc = sourceForConnector("connector:fdic_bankfind");
  const fFact = recordToObservation(rFdic.output.observations[0], fdicSrc, { id: "o1", observed_at: AS_OF, asserted_by: "system" });
  const fClaim = recordToObservation(rFdic.output.observations[0], claimSrc, { id: "o2", observed_at: AS_OF, asserted_by: "system" });
  assert(fFact.tier === "public_fact" && fClaim.tier === "third_party_claim" && fFact.tier !== fClaim.tier, "FDIC: identical connector code · tier read FROM the source manifest (differing-source proof)");
  const rFdic2 = await runFdicBankfind(fdicBankfindFixtures(), { as_of: AS_OF });
  assert(JSON.stringify(rFdic.output) === JSON.stringify(rFdic2.output), "the FDIC connector run is deterministic");

  // ---- WAVE 3 · FEDERAL REGISTER (a real connector): normalizes rule/notice headers →
  //      public_fact FROM THE SOURCE, regulation candidates, a real reject path.
  const rFR = await runFederalRegister(federalRegisterFixtures(), { as_of: AS_OF });
  assert(rFR.output.status === "success" && rFR.observations.length === 3 && rFR.observations[0].tier === "public_fact", "Federal Register documents normalize + tier public_fact from the source manifest");
  assert(rFR.output.entity_candidates[0].object_class === "entity:coop_markets:regulation", "an FR document surfaces as a regulation candidate (the connector draws NO regulatory conclusion)");
  // TEETH: a PREVIOUSLY-SEEN document (valid document_number) that fails validation on
  // a blank title must NOT be fabricated as a deletion (exercises the withRef ref-recovery).
  const frBad = await runFederalRegister([federalRegisterFixtures()[0], { document_number: "2026-15002", title: "", publication_date: "2026-06-18" }], { as_of: AS_OF, prior: new Map([[federalRegisterFixtures()[0].document_number, "stale"], ["2026-15002", "prior-hash"]]) });
  assert(frBad.output.status === "partial" && frBad.output.quality_report.rejected_records === 1 && frBad.output.metrics.changes.deleted === 0, "a previously-seen FR header that fails validation is a reported rejection, NEVER a fabricated deletion");
  const rFR2 = await runFederalRegister(federalRegisterFixtures(), { as_of: AS_OF });
  assert(JSON.stringify(rFR.output) === JSON.stringify(rFR2.output), "the Federal Register connector run is deterministic");

  // ---- WAVE 3 · CONNECTOR CANDIDATES → OBJECT REGISTRY (propose-only): normalized
  //      connector output feeds the shared-market identity index; a cross-source
  //      duplicate (SEC EDGAR public filing × private startup submission) is PROPOSED
  //      for human review — NEVER auto-merged.
  const rCand = await runRegistryCandidates({ as_of: AS_OF });
  assert(rCand.registered.length === 6 && rCand.reconciliation.reconciled === true, "every surfaced connector candidate becomes a registry object (reconciled)");
  assert(rCand.proposed.length === 3 && rCand.merges.length === 0 && rCand.reconciliation.merged_count === 0, "the three cross-source duplicates are PROPOSED; nothing auto-merges (propose-only)");
  assert(rCand.registered.every((o) => o.status === "active"), "no object is merged away — the human review gate stands");
  assert(rCand.cross_source_pairs.every((p) => p.reasons.some((x) => x.startsWith("name_similarity:")) && p.left_name !== p.right_name), "each proposal spans two sources on normalized-name similarity (differing legal names)");
  assert(rCand.registered.filter((o) => o.visibility === "public").length === 3 && rCand.registered.filter((o) => o.visibility === "network").length === 3, "registry objects carry plane/visibility FROM the source manifest (EDGAR public vs startup-intake network), never a hardcoded default");
  const rCand2 = await runRegistryCandidates({ as_of: AS_OF });
  assert(JSON.stringify(rCand.proposed) === JSON.stringify(rCand2.proposed), "the connector→registry→resolve pass is deterministic");

  // ---- WAVE 3 · CATALOG GROWTH toward the ~93 (config-as-data, closed graph holds).
  assert(v.connector_count >= 73 && v.source_count === v.connector_count, `catalog grew toward the ~93 (one connector per source; got ${v.connector_count})`);

  return `catalog ${v.connector_count} connectors (closed graph, toward ~93) · authorize-first (service-only) · output-contract + correlated event/cost · change-detect n/u/d/unchanged · failure→offline (no fabricated deletion) + circuit breaker · FULL-MARKET 5300 → ${rMarket.persisted.length} persisted profiles reconcile at scale (labeled synthetic) · startup-intake → deal engine (advance/block/hold, third_party_claim, human gates intact) · SEC EDGAR + FDIC BankFind + Federal Register (6 real connectors; tier-from-source, differing-source proof) · connector candidates → Object Registry (${rCand.proposed.length} cross-source dupes PROPOSED, 0 merged) · REAL ${regs.length}-section corpus · deterministic`;
});

// --- 11. Unit tests (Wave 4: the engines have teeth) -------------------------
await step("CANON      (external-canon → repo identity: propose-only · closed-graph)", async () => {
  const { register } = await import("node:module");
  register("./alias-hook.mjs", import.meta.url);
  const canon = await import("@/core/registry/canon");
  const { connectorSources } = await import("@/core/registry/connectors");

  const REG = JSON.parse(fs.readFileSync(path.join(root, "core/registry/data/canon_aliases.json"), "utf8"));
  const live = connectorSources().map((s) => s.key);
  const liveSourceKeys = new Set(live);

  // ---- CLOSED GRAPH + verified aliases resolve to LIVE keys (teeth).
  const v = canon.validateCanonRegistry(REG, { source: liveSourceKeys });
  assert(v.ok, "canon crosswalk is a closed graph + verified aliases live: " + v.errors.join("; "));
  assert(v.confirmed_count >= 4, "the confirmed FS↔repo crosswalk is seeded");
  const broken = JSON.parse(JSON.stringify(REG));
  broken.aliases.find((a) => a.incoming === "SRC-NCUA-CALL").canonical = "source:__dead__";
  assert(canon.validateCanonRegistry(broken, { source: liveSourceKeys }).ok === false, "a verified alias to a dead canonical FAILS the closed-graph check (non-vacuous)");

  // ---- RESOLUTION: confirmed-alias memory · similarity proposal · unresolved.
  const reg = canon.loadCanonRegistry(REG);
  assert(canon.resolveCanon("SRC-NCUA-CALL", live, reg).canonical === "source:ncua_5300_call_report", "a confirmed external alias resolves via sticky memory");
  const prop = canon.resolveCanon("SRC-FEDERAL-REGISTER", live, reg);
  assert(prop.via === "proposed" && prop.canonical === "source:federal_register", "an UNSEEN id is PROPOSED (never auto-confirmed) to the best live canonical");
  assert(canon.resolveCanon("SRC-ZZZ-NOTHING", live, reg).via === "unresolved", "no plausible match → unresolved, never force-mapped");

  // ---- PROPOSE-ONLY + NO-CLOBBER + authority precedence.
  const out = canon.proposeAliases(["SRC-NCUA-CALL", "SRC-FEDERAL-REGISTER"], live, reg, { kind: "source", source: "fs_8000" });
  assert(out.already_resolved.includes("SRC-NCUA-CALL") && out.proposed.length === 1 && out.proposed[0].status === "proposed", "propose-only + no-clobber: a confirmed id is not re-proposed; a new id yields a PROPOSAL");
  const pick = canon.pickByAuthority([
    { incoming: "X", canonical: "repo:live", kind: "k", source: "live_code", status: "confirmed" },
    { incoming: "X", canonical: "fs:claim", kind: "k", source: "fs_5100", status: "confirmed" },
  ], REG.authority_order);
  assert(pick.canonical === "repo:live", "authority precedence: live code outranks an external-canon claim on the same id");

  // ---- IDENTITY not AUTHORITY: the ambiguous object stays PROPOSED.
  assert(REG.aliases.find((a) => a.incoming === "OBJ.INSTITUTION").status === "proposed", "a label match that is not a semantic merge stays proposed (identity ≠ authority)");

  return `crosswalk ${v.alias_count} aliases (${v.confirmed_count} confirmed, closed graph) · verified FS sources resolve to LIVE keys · confirmed-alias memory · unseen id PROPOSED (never auto-merged) · no-clobber · authority precedence (live_code > FS) · identity-not-authority (OBJ.INSTITUTION proposed) · deterministic`;
});

await step("TESTS      (node --test: engine unit suite)", () => {
  if (!fs.existsSync(path.join(root, "node_modules"))) {
    throw new Error("node_modules missing — run `npm install`, then re-run this loop (env, not code)");
  }
  // node --test discovers each tests/*.test.mjs; each self-registers the @/* alias
  // hook and dynamically imports its target module (native TS type-stripping). This
  // Node build rejects the bare-directory form, so we pass the explicit glob.
  try {
    const out = execSync("node --test tests/*.test.mjs", { cwd: root, stdio: "pipe" }).toString();
    const pass = out.match(/#\s*pass\s+(\d+)/);
    const fail = out.match(/#\s*fail\s+(\d+)/);
    const total = out.match(/#\s*tests\s+(\d+)/);
    if (fail && Number(fail[1]) > 0) throw new Error(`${fail[1]} unit test(s) failing`);
    return `${total ? total[1] : "?"} unit tests across the engines, ${pass ? pass[1] : "?"} pass, 0 fail`;
  } catch (e) {
    if (e.stdout || e.stderr) {
      const out = `${e.stdout ?? ""}${e.stderr ?? ""}`;
      const fails = [...out.matchAll(/^not ok .*$/gm)].map((m) => m[0]).slice(0, 8);
      throw new Error(`unit tests failed:\n     ${fails.join("\n     ") || out.slice(-400)}`);
    }
    throw e;
  }
});

// --- Summary -----------------------------------------------------------------
const failed = results.filter((r) => !r.ok);
console.log(`\n${"═".repeat(52)}`);
console.log(`  ${failed.length === 0 ? "ALL GREEN" : `${failed.length} FAILING`}  ·  ${results.filter((r) => r.ok).length}/${results.length} checks passed`);
if (failed.length) console.log(`  failing: ${failed.map((r) => r.name.split(" ")[0]).join(", ")}`);
console.log(`${"═".repeat(52)}\n`);
process.exit(failed.length ? 1 : 0);
