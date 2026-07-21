// tests/auric_engine.test.mjs — Auric publication engine (assemble / render / feed).
import { test } from "node:test";
import assert from "node:assert/strict";
import { register } from "node:module";
register("../scripts/alias-hook.mjs", import.meta.url);

const { assembleIO, ioSourceRefs, renderVariant, renderVariants, buildFeed } =
  await import("@/core/auric/engine");

const mkIO = (over = {}) =>
  assembleIO({
    id: "io:1",
    plane: "shared_market",
    visibility: "public",
    headline: "Market event",
    fact_refs: ["f1", "f2"],
    claim_refs: ["c1"],
    inference_refs: ["i1"],
    confidence: 0.8,
    top_tier: "public_fact",
    created_at: "2026-07-20T00:00:00.000Z",
    ...over,
  });

const lens = (lens_type, lens_ref, channel = "market_feed") => ({
  lens_type, lens_ref, channel, title: `${lens_type}:${lens_ref}`, hook: "hook", body: "body",
});

test("auric: assembleIO relevance score is in [0,1]; status derives from published_at", () => {
  const io = mkIO();
  assert.ok(io.relevance.score >= 0 && io.relevance.score <= 1);
  assert.equal(io.status, "assembled"); // no published_at
  assert.equal(io.relevance.evidence_count, 4);
  const pub = mkIO({ published_at: "2026-07-21T00:00:00.000Z" });
  assert.equal(pub.status, "published");
});

test("auric: ioSourceRefs is the ORDERED, DEDUPED union of fact/claim/inference refs", () => {
  const io = mkIO({ fact_refs: ["f1", "f2", "f1"], claim_refs: ["f2", "c1"], inference_refs: ["i1"] });
  assert.deepEqual(ioSourceRefs(io), ["f1", "f2", "c1", "i1"]);
});

test("auric: renderVariant source_refs equal ioSourceRefs EXACTLY (never a superset)", () => {
  const io = mkIO();
  const refs = ioSourceRefs(io);
  const v = renderVariant(io, lens("cartridge", "coop"), "v:0", "2026-07-20T00:00:00.000Z");
  assert.deepEqual(v.source_refs, refs);
  // The variant physically cannot cite evidence the IO lacks.
  assert.ok(v.source_refs.every((r) => refs.includes(r)));
  assert.equal(v.source_refs.length, refs.length);
  assert.equal(v.intelligence_object_id, io.id);
});

test("auric: renderVariants shares the IO refs across every variant with stable ids", () => {
  const io = mkIO();
  const refs = ioSourceRefs(io);
  const vs = renderVariants(io, [lens("role", "ceo"), lens("role", "cfo")], "vp", "2026-07-20T00:00:00.000Z");
  assert.deepEqual(vs.map((v) => v.id), ["vp:0", "vp:1"]);
  assert.ok(vs.every((v) => JSON.stringify(v.source_refs) === JSON.stringify(refs)));
});

test("auric: buildFeed filters by role / institution / cartridge context", () => {
  const io = mkIO();
  const at = "2026-07-20T00:00:00.000Z";
  const variants = renderVariants(
    io,
    [
      lens("cartridge", "coop"),
      lens("role", "ceo"),
      lens("role", "cfo"),
      lens("institution", "summit"),
      lens("person", "p1"),
      lens("channel", "email", "email"),
    ],
    "vp",
    at,
  );
  const feed = buildFeed(variants, { role: "ceo", institution: "summit", nowIso: "2026-07-21T00:00:00.000Z" });
  const kinds = feed.map((v) => `${v.lens_type}:${v.lens_ref}`);
  assert.ok(kinds.includes("cartridge:coop"));
  assert.ok(kinds.includes("role:ceo"));
  assert.ok(kinds.includes("institution:summit"));
  assert.ok(!kinds.includes("role:cfo"), "unmatched role must be dropped");
  assert.ok(!kinds.includes("person:p1"), "person lens must be dropped");
  assert.ok(!kinds.some((k) => k.startsWith("channel")), "channel lens must be dropped");
});

test("auric: buildFeed drops variants past shelf life (ISO string compare)", () => {
  const io = mkIO();
  const v = renderVariants(io, [lens("cartridge", "coop")], "vp", "2026-07-20T00:00:00.000Z");
  const now = "2026-07-21T00:00:00.000Z";
  // shelf life already passed -> dropped
  const expired = buildFeed(v, { nowIso: now }, { "io:1": "2026-07-19T00:00:00.000Z" });
  assert.equal(expired.length, 0);
  // shelf life in the future -> kept
  const live = buildFeed(v, { nowIso: now }, { "io:1": "2026-07-25T00:00:00.000Z" });
  assert.equal(live.length, 1);
  // unmapped IO -> no known expiry -> kept
  assert.equal(buildFeed(v, { nowIso: now }, {}).length, 1);
});

test("auric: buildFeed ranks higher confidence first and is deterministic", () => {
  const at = "2026-07-20T00:00:00.000Z";
  const strong = renderVariant(mkIO({ id: "io:strong", confidence: 0.9 }), lens("cartridge", "coop"), "v:strong", at);
  const weak = renderVariant(mkIO({ id: "io:weak", confidence: 0.2 }), lens("cartridge", "coop"), "v:weak", at);
  const ctx = { nowIso: "2026-07-21T00:00:00.000Z" };
  const feed = buildFeed([weak, strong], ctx);
  assert.deepEqual(feed.map((v) => v.id), ["v:strong", "v:weak"]);
  // determinism (input order independence + stable output)
  assert.deepEqual(buildFeed([strong, weak], ctx), feed);
});

test("auric: a not-yet-live (future) variant sinks below a live one", () => {
  const live = renderVariant(mkIO(), lens("cartridge", "coop"), "v:live", "2026-07-20T00:00:00.000Z");
  const future = renderVariant(mkIO({ id: "io:2" }), lens("cartridge", "coop"), "v:future", "2026-07-30T00:00:00.000Z");
  const feed = buildFeed([future, live], { nowIso: "2026-07-21T00:00:00.000Z" });
  assert.equal(feed[0].id, "v:live");
});
