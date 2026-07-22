// tests/canon.test.mjs — the CANON RECONCILIATION SEAM (Sprint III Wave 4):
// external-canon identifiers (FS / Dispatch-Auric V1) reconcile to the repo's LIVE
// canonical ids, deterministically, PROPOSE-ONLY, NO-CLOBBER, closed-graph, with
// authority precedence — IDENTITY not authority. The seeded crosswalk is grounded in
// the real FS-5100/FS-8000 identifiers and its verified aliases must resolve to live
// connector source keys.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { register } from "node:module";
register("../scripts/alias-hook.mjs", import.meta.url);

const canon = await import("@/core/registry/canon");
const { connectorSources } = await import("@/core/registry/connectors");

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const REG = JSON.parse(fs.readFileSync(path.join(root, "core/registry/data/canon_aliases.json"), "utf8"));
const liveSourceKeys = new Set(connectorSources().map((s) => s.key));

// ---- normalization is deterministic + stopword-aware -------------------------
test("normalizeTokens drops convention prefixes; prefixOf reads the leading segment", () => {
  const stop = new Set(canon.DEFAULT_CANON_STOPWORDS);
  assert.deepEqual([...canon.normalizeTokens("SRC-NCUA-CALL", stop)].sort(), ["call", "ncua"]);
  assert.deepEqual([...canon.normalizeTokens("source:ncua_5300_call_report", stop)].sort(), ["5300", "call", "ncua", "report"]);
  assert.equal(canon.prefixOf("SRC-NCUA-CALL"), "src");
  assert.equal(canon.prefixOf("source:ncua_5300_call_report"), "source");
  assert.equal(canon.prefixOf("OBJ.CREDITUNION"), "obj");
});

// ---- the real registry is a closed graph AND its verified aliases resolve live
test("the seeded canon registry is a closed graph; verified source aliases resolve to LIVE keys", () => {
  const v = canon.validateCanonRegistry(REG, { source: liveSourceKeys });
  assert.ok(v.ok, "closed graph + verified aliases live: " + v.errors.join("; "));
  assert.ok(v.confirmed_count >= 4, "the confirmed crosswalk is seeded");
  // teeth: if a verified alias pointed at a non-existent source, validation must FAIL.
  const broken = JSON.parse(JSON.stringify(REG));
  broken.aliases.find((a) => a.incoming === "SRC-NCUA-CALL").canonical = "source:does_not_exist";
  const vb = canon.validateCanonRegistry(broken, { source: liveSourceKeys });
  assert.ok(!vb.ok && vb.errors.some((e) => e.includes("not a live source key")), "a verified alias to a dead canonical fails the closed-graph check");
});

// ---- resolution: exact · confirmed-alias memory · propose · unresolved --------
test("resolveCanon: live canonical, confirmed-alias memory, similarity proposal, and unresolved", () => {
  const live = connectorSources().map((s) => s.key);
  const reg = canon.loadCanonRegistry(REG);
  // (1) an id that IS a live canonical resolves to itself
  const r1 = canon.resolveCanon("source:sec_edgar", live, reg);
  assert.equal(r1.via, "canonical");
  // (2) a CONFIRMED external alias resolves via sticky memory (not similarity)
  const r2 = canon.resolveCanon("SRC-NCUA-CALL", live, reg);
  assert.equal(r2.via, "confirmed_alias");
  assert.equal(r2.canonical, "source:ncua_5300_call_report");
  // (3) an UNKNOWN incoming proposes the best live canonical by token similarity
  const r3 = canon.resolveCanon("SRC-FEDERAL-REGISTER", live, reg);
  assert.equal(r3.via, "proposed", "an unseen id is proposed, never auto-confirmed");
  assert.equal(r3.canonical, "source:federal_register");
  assert.ok(r3.score >= 0.5 && r3.reasons.some((x) => x.startsWith("name_similarity:")));
  // (4) an incoming with no plausible match is unresolved (never force-mapped)
  const r4 = canon.resolveCanon("SRC-ZZZ-NOTHING-LIKE-ANY-SOURCE", live, reg);
  assert.equal(r4.via, "unresolved");
  assert.equal(r4.canonical, null);
});

// ---- PROPOSE-ONLY + NO-CLOBBER ------------------------------------------------
test("proposeAliases is propose-only and honors NO-CLOBBER (confirmed stays sticky)", () => {
  const live = connectorSources().map((s) => s.key);
  const reg = canon.loadCanonRegistry(REG);
  const incoming = ["SRC-NCUA-CALL", "SRC-FEDERAL-REGISTER"]; // one confirmed, one new
  const out = canon.proposeAliases(incoming, live, reg, { kind: "source", source: "fs_8000" });
  assert.ok(out.already_resolved.includes("SRC-NCUA-CALL"), "a confirmed incoming is not re-proposed (no clobber)");
  assert.equal(out.proposed.length, 1, "only the genuinely-new incoming is proposed");
  assert.equal(out.proposed[0].incoming, "SRC-FEDERAL-REGISTER");
  assert.equal(out.proposed[0].status, "proposed", "the output is a PROPOSAL, not a confirmed merge");
  assert.equal(out.proposed[0].canonical, "source:federal_register");
});

test("a REJECTED pair is sticky: that exact canonical is never re-proposed for the incoming", () => {
  const live = ["source:federal_register", "source:sec_edgar"];
  const reg = canon.loadCanonRegistry({
    key: "t", label: "t", authority_order: ["live_code", "fs_8000", "new_input"],
    aliases: [{ incoming: "SRC-FEDERAL-REGISTER", canonical: "source:federal_register", kind: "source", source: "fs_8000", status: "rejected" }],
  });
  const r = canon.resolveCanon("SRC-FEDERAL-REGISTER", live, reg);
  assert.notEqual(r.canonical, "source:federal_register", "a human-rejected mapping is never re-proposed");
});

// ---- authority precedence: live_code beats an external canon ------------------
test("pickByAuthority resolves the canonical LABEL by declared precedence", () => {
  const order = ["live_code", "confirmed_alias", "fs_5100", "fs_8000", "new_input"];
  const pick = canon.pickByAuthority([
    { incoming: "X", canonical: "repo:live", kind: "k", source: "live_code", status: "confirmed" },
    { incoming: "X", canonical: "fs:claim", kind: "k", source: "fs_5100", status: "confirmed" },
  ], order);
  assert.equal(pick.canonical, "repo:live", "live code outranks an external-canon claim on the same id");
});

// ---- IDENTITY not authority: OBJ.INSTITUTION stays PROPOSED (semantic ambiguity)
test("an ambiguous object mapping stays proposed — a label match is not a semantic merge", () => {
  const inst = REG.aliases.find((a) => a.incoming === "OBJ.INSTITUTION");
  assert.equal(inst.status, "proposed", "OBJ.INSTITUTION is broader than financial_institution → human review, not auto-merge");
  const cu = REG.aliases.find((a) => a.incoming === "OBJ.CREDITUNION");
  assert.equal(cu.status, "confirmed", "the unambiguous credit-union mapping is confirmed");
});
