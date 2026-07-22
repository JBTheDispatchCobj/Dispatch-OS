// tests/network_surface.test.mjs — the JOINT NETWORK SURFACE (Sprint III Wave 5).
// The /network view-model is assembled over REAL run output and is REVIEW-QUEUE-
// FIRST: the propose-only human-review queue (cross-source entity duplicates +
// external-canon alias proposals) NEVER auto-merges, and the full-market list is
// LABELED synthetic (computed from the data, not asserted blindly). Deterministic.
import { test } from "node:test";
import assert from "node:assert/strict";
import { register } from "node:module";
register("../scripts/alias-hook.mjs", import.meta.url);

const { runNetworkSurface } = await import("@/cartridges/cooperative_markets/run_network_surface");

const AS_OF = "2026-07-22T00:00:00.000Z";

test("the review queue is PROPOSE-ONLY: nothing auto-merges", async () => {
  const vm = await runNetworkSurface({ as_of: AS_OF, market_size: 120 });
  assert.equal(vm.reviewQueue.mergedCount, 0, "no auto-merge — the merge stays a human-gated act");
  assert.ok(vm.reviewQueue.entityDuplicates.length >= 1, "cross-source duplicates are surfaced for review");
  assert.ok(
    vm.reviewQueue.canonProposals.length >= 1,
    "external-canon alias proposals are surfaced for review",
  );
  assert.ok(
    vm.reviewQueue.canonProposals.every((p) => p.status === "proposed"),
    "every canon proposal is PROPOSED — never a confirmed/auto-applied alias",
  );
  assert.equal(
    vm.reviewQueue.pendingCount,
    vm.reviewQueue.entityDuplicates.length + vm.reviewQueue.canonProposals.length,
    "pending == duplicates + canon proposals (no phantom queue items)",
  );
});

test("the cross-source duplicate carries score + reasons (human-reviewable, not a silent merge)", async () => {
  const vm = await runNetworkSurface({ as_of: AS_OF, market_size: 120 });
  const d = vm.reviewQueue.entityDuplicates[0];
  assert.ok(d.left_name && d.right_name, "the duplicate names both sides");
  assert.ok(typeof d.score === "number" && d.score > 0, "the duplicate carries a similarity score");
  assert.ok(Array.isArray(d.reasons) && d.reasons.length > 0, "the duplicate carries its reasons (lineage)");
});

test("the full-market list is LABELED synthetic — computed from the data, never presented as real", async () => {
  const vm = await runNetworkSurface({ as_of: AS_OF, market_size: 120 });
  assert.equal(vm.market.allLabeledSynthetic, true, "all filings carry a synthetic/illustrative label");
  assert.equal(vm.market.size, 120, "the market ran at the requested scale");
  assert.ok(vm.market.synthetic > 0, "the market includes labeled synthetic filings");
  assert.ok(
    vm.market.sample.length >= 1 && vm.market.sample.every((s) => typeof s.source_ref === "string" && s.source_ref.length > 0),
    "every sample row traces to a source_ref (a claim drills to a filing)",
  );
});

test("the network surface is deterministic (same as_of → identical view-model)", async () => {
  const a = await runNetworkSurface({ as_of: AS_OF, market_size: 120 });
  const b = await runNetworkSurface({ as_of: AS_OF, market_size: 120 });
  assert.equal(JSON.stringify(a), JSON.stringify(b), "byte-identical VM across runs");
});

test("canon proposals include both similarity-fresh and registry-carried origins", async () => {
  const vm = await runNetworkSurface({ as_of: AS_OF, market_size: 120 });
  const origins = new Set(vm.reviewQueue.canonProposals.map((p) => p.origin));
  assert.ok(origins.has("similarity"), "freshly-proposed FS ids appear (deterministic token similarity)");
  assert.ok(origins.has("registry"), "aliases the crosswalk carries as proposed appear (awaiting human review)");
});
