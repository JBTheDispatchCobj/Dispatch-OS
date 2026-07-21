// tests/harness_router.test.mjs — kernel Model Router + ToolRouter (RFC-2013).
import { test } from "node:test";
import assert from "node:assert/strict";
import { register } from "node:module";
register("../scripts/alias-hook.mjs", import.meta.url);

const { route, classify, RUNG_LADDER, RUNG_COST, ToolRouter } =
  await import("@/core/harness/router");

const task = (over = {}) => ({ kind: "t", risk: "low", complexity: 0, ...over });

test("router: a deterministic rule beats every model rung", () => {
  assert.equal(classify(task({ deterministic_available: true, complexity: 0.99, risk: "high" })), "deterministic_rule");
  const d = route(task({ deterministic_available: true }));
  assert.equal(d.rung, "deterministic_rule");
  assert.equal(d.ladder_position, 0);
});

test("router: needs_regulated_conclusion ALWAYS escalates to human — even at a cheap rung under a cost cap", () => {
  const d = route(task({ deterministic_available: true, needs_regulated_conclusion: true }), { maxCost: 1 });
  assert.equal(d.rung, "deterministic_rule"); // still drafts cheaply
  assert.equal(d.escalate_to_human, true); // but may not terminate below human
  // cost includes the human review step on top of the compute rung
  assert.equal(d.cost, RUNG_COST.deterministic_rule + RUNG_COST.human_expert);
  assert.match(d.rationale, /human gate REQUIRED/);
});

test("router: risk raises the floor under effective complexity", () => {
  assert.equal(classify(task({ risk: "low", complexity: 0 })), "cached_lookup");
  // high risk floors effective complexity at 0.6 -> retrieval_augmented
  assert.equal(classify(task({ risk: "high", complexity: 0 })), "retrieval_augmented");
  assert.equal(classify(task({ risk: "medium", complexity: 0 })), "strong_open_model");
});

test("router: a confidence shortfall escalates UP the ladder (more shortfall -> more rungs)", () => {
  const base = RUNG_LADDER.indexOf(classify(task({ complexity: 0.5 }))); // strong_open_model (idx 3)
  const small = route(task({ complexity: 0.5, min_confidence: 0.9 }), { observedConfidence: 0.8 }); // shortfall 0.1 -> 1 rung
  const big = route(task({ complexity: 0.5, min_confidence: 0.9 }), { observedConfidence: 0.1 }); // shortfall 0.8 -> 4 rungs
  assert.equal(RUNG_LADDER.indexOf(small.rung), base + 1, "a 0.1 shortfall escalates exactly one rung");
  assert.ok(RUNG_LADDER.indexOf(big.rung) > RUNG_LADDER.indexOf(small.rung), "a larger shortfall escalates further");
  assert.match(big.rationale, /escalated \d+ rung/);
  // no shortfall (met confidence) leaves the base rung untouched
  const met = route(task({ complexity: 0.5, min_confidence: 0.9 }), { observedConfidence: 0.9 });
  assert.equal(RUNG_LADDER.indexOf(met.rung), base);
});

test("router: a high-risk confidence shortfall routes to the human gate", () => {
  const d = route(task({ risk: "high", complexity: 0.5, min_confidence: 0.9 }), { observedConfidence: 0.3 });
  assert.equal(d.escalate_to_human, true);
});

test("router: maxCost caps the compute rung but never removes a required human gate", () => {
  const d = route(task({ complexity: 0.95, needs_regulated_conclusion: true }), { maxCost: RUNG_COST.small_open_model });
  assert.ok(RUNG_COST[d.rung] <= RUNG_COST.small_open_model, "compute rung must be capped by maxCost");
  assert.equal(d.escalate_to_human, true, "cost cap must not remove the regulated human gate");
});

test("router: escalation reaching the human rung sets the gate", () => {
  const d = route(task({ complexity: 1, min_confidence: 1 }), { observedConfidence: 0 });
  assert.equal(d.rung, "human_expert");
  assert.equal(d.escalate_to_human, true);
});

test("router: deterministic — same task + opts deep-equal", () => {
  const t = task({ complexity: 0.5, min_confidence: 0.8 });
  const opts = { observedConfidence: 0.5, maxCost: 100 };
  assert.deepEqual(route(t, opts), route(t, opts));
});

test("ToolRouter: resolves matching capability cheapest-first, ties broken by key", () => {
  const tr = new ToolRouter();
  tr.register({ key: "z_cheap", capability: "ocr", cost: 1 });
  tr.register({ key: "expensive", capability: "ocr", cost: 10 });
  tr.register({ key: "a_cheap", capability: "ocr", cost: 1 });
  tr.register({ key: "free", capability: "ocr" }); // undefined cost treated as 0
  tr.register({ key: "other", capability: "web_fetch", cost: 1 });
  const got = tr.resolve("ocr").map((t) => t.key);
  assert.deepEqual(got, ["free", "a_cheap", "z_cheap", "expensive"]);
  assert.deepEqual(tr.resolve("web_fetch").map((t) => t.key), ["other"]);
  assert.deepEqual(tr.resolve("missing"), []);
});
