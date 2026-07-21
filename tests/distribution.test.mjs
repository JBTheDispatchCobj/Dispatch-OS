// tests/distribution.test.mjs — Auric distribution + the editorial verification gate.
import { test } from "node:test";
import assert from "node:assert/strict";
import { register } from "node:module";
register("../scripts/alias-hook.mjs", import.meta.url);

const { assembleIO, renderVariants } = await import("@/core/auric/engine");
const { distribute, deliveriesRestateIO, DEFAULT_CHANNELS } = await import("@/core/auric/distribution");

const io = assembleIO({
  id: "io:pub",
  plane: "shared_market",
  visibility: "public",
  headline: "Halcyon x Summit",
  fact_refs: ["f1", "f2"],
  claim_refs: ["c1"],
  inference_refs: ["i1"],
  confidence: 0.8,
  top_tier: "public_fact",
  created_at: "2026-07-20T00:00:00.000Z",
});
const lens = (channel) => ({ lens_type: "cartridge", lens_ref: "coop", channel, title: channel, hook: "h", body: "b" });
const variants = renderVariants(
  io,
  [lens("terminal_feed"), lens("market_feed"), lens("brief")],
  "v",
  "2026-07-20T00:00:00.000Z",
);
const ctx = { idPrefix: "pub:test", publishedAt: "2026-07-21T00:00:00.000Z" };
const approved = { disposition: "approved", by: "user:managing_editor", decision_ref: "decision:ed:approved" };

test("distribution: absent editorial disposition publishes NOTHING", () => {
  const r = distribute(io, variants, DEFAULT_CHANNELS, null, ctx);
  assert.equal(r.status, "held_for_editorial");
  assert.equal(r.deliveries.length, 0);
  assert.deepEqual(r.channels, []);
});

test("distribution: 'held' publishes nothing; 'rejected' publishes nothing", () => {
  const held = distribute(io, variants, DEFAULT_CHANNELS, { disposition: "held", by: "user:e", decision_ref: "d:h" }, ctx);
  assert.equal(held.status, "held_for_editorial");
  assert.equal(held.deliveries.length, 0);

  const rej = distribute(io, variants, DEFAULT_CHANNELS, { disposition: "rejected", by: "user:e", decision_ref: "d:r" }, ctx);
  assert.equal(rej.status, "rejected");
  assert.equal(rej.deliveries.length, 0);
});

test("distribution: APPROVED publishes deliveries that each carry the authorizing decision", () => {
  const r = distribute(io, variants, DEFAULT_CHANNELS, approved, ctx);
  assert.equal(r.status, "published");
  assert.ok(r.deliveries.length > 0);
  assert.ok(r.deliveries.every((d) => d.editorial_decision_ref === approved.decision_ref));
  assert.ok(r.deliveries.every((d) => d.approved_by === approved.by));
  assert.ok(r.deliveries.every((d) => d.status === "published"));
});

test("distribution: every delivery RESTATES the IO refs exactly (no superset)", () => {
  const r = distribute(io, variants, DEFAULT_CHANNELS, approved, ctx);
  assert.equal(deliveriesRestateIO(io, r.deliveries), true);
});

test("distribution: channel reach — terminal_feed is network, market_feed is public", () => {
  const r = distribute(io, variants, DEFAULT_CHANNELS, approved, ctx);
  const term = r.deliveries.filter((d) => d.channel === "terminal_feed");
  const market = r.deliveries.filter((d) => d.channel === "market_feed");
  assert.ok(term.length > 0 && term.every((d) => d.visibility === "network"));
  assert.ok(market.length > 0 && market.every((d) => d.visibility === "public"));
});

test("distribution: deterministic — same inputs deep-equal", () => {
  assert.deepEqual(
    distribute(io, variants, DEFAULT_CHANNELS, approved, ctx),
    distribute(io, variants, DEFAULT_CHANNELS, approved, ctx),
  );
});
