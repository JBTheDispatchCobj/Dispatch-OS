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

// --- 9. Unit tests (Wave 4: the engines have teeth) --------------------------
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
