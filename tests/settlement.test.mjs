// tests/settlement.test.mjs — VC Deal Engine P4 (pluggable settlement vehicles).
import { test } from "node:test";
import assert from "node:assert/strict";
import { register } from "node:module";
register("../scripts/alias-hook.mjs", import.meta.url);

const { settle } = await import("@/cartridges/cooperative_markets/settlement");

// Minimal AllocationResult — settle only reads deal, allocated_usd, allocations.length.
const alloc = (allocated_usd = 500_000, n = 2) => ({
  deal: "X",
  category: "real_time_payments",
  capacity_usd: 1_000_000,
  allocated_usd,
  remaining_usd: 1_000_000 - allocated_usd,
  allocations: Array.from({ length: n }, (_, i) => ({ subscriber_id: `s${i}`, allocated_usd: allocated_usd / n })),
  rejected: [],
  deal_flow_access: { qualified_matches: n, kind: "cooperative_markets:deal_flow_access" },
  status: "proposed",
  generated_by: "allocation:v1",
});

for (const mode of ["advisory", "syndication"]) {
  test(`settlement: ${mode} produces a CLOSED lifecycle; committed/called set, distributed 0`, () => {
    const r = settle(alloc(500_000), mode);
    assert.equal(r.status, "closed");
    assert.equal(r.committed_usd, 500_000);
    assert.equal(r.called_usd, 500_000);
    assert.equal(r.distributed_usd, 0);
    assert.equal(r.steps.length, 4);
    assert.deepEqual(r.steps.map((s) => s.step), ["open", "allocate", "call_capital", "close"]);
    assert.equal(r.steps[r.steps.length - 1].status, "closed");
    assert.ok(r.vehicle_object, "a shipped vehicle must name a vehicle object");
    assert.equal(r.admin_connector, "connector:fund_admin");
  });
}

for (const mode of ["fund", "spv"]) {
  test(`settlement: ${mode} is vehicle_pending and invents no amounts`, () => {
    const r = settle(alloc(500_000), mode);
    assert.equal(r.status, "vehicle_pending");
    assert.equal(r.committed_usd, 500_000); // mirrors the proposed allocation, does not fabricate
    assert.equal(r.called_usd, 0);
    assert.equal(r.distributed_usd, 0);
    assert.equal(r.vehicle_object, undefined);
    assert.ok(r.note && /pending/i.test(r.note));
    assert.equal(r.steps.length, 1);
    assert.equal(r.steps[0].status, "vehicle_pending");
  });
}

test("settlement: advisory vs syndication pick distinct vehicle objects", () => {
  assert.match(settle(alloc(), "advisory").vehicle_object, /participation$/);
  assert.match(settle(alloc(), "syndication").vehicle_object, /syndication$/);
});

test("settlement: deterministic — same inputs deep-equal for every mode", () => {
  for (const mode of ["advisory", "syndication", "fund", "spv"]) {
    const a = alloc(640_000, 3);
    assert.deepEqual(settle(a, mode), settle(a, mode));
  }
});
