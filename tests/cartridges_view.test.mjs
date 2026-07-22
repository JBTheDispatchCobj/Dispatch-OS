// tests/cartridges_view.test.mjs — the /cartridges surface (Sprint IV Wave 3).
// The installed-capability manifest over live packaged configurations. States distinct
// (current = operating / restricted = installed-but-not); capability counts roll up;
// deterministic order (surface area desc, then key); read-only.
import { test } from "node:test";
import assert from "node:assert/strict";
import { register } from "node:module";
register("../scripts/alias-hook.mjs", import.meta.url);

const cv = await import("@/app/_surfaces/cartridges_view");
const AS_OF = "2026-07-22T00:00:00.000Z";

const mk = (key, status, wf, rules, wsl) => ({
  key, label: key.toUpperCase(), description: `${key} cartridge`, version: 1, status,
  counts: { entityTypes: 3, workflows: wf, rules, metrics: 2, reports: 2, checklistTemplates: 1, dashboards: 1, knowledge: 4, sourceTypes: 1, agentInstructions: 1, approvalRules: 1 },
  workspaceLabels: wsl,
});
const manifests = [
  mk("cooperative_markets", "active", 6, 8, ["Cooperative Markets — Demo"]),
  mk("wealth", "active", 3, 4, ["Wealth — Demo"]),
  mk("legacy", "deprecated", 1, 1, []),
];
const vm = cv.buildCartridgesView({ manifests }, { as_of: AS_OF });

test("renders the installed-capability manifest with rollups", () => {
  assert.equal(vm.counts.total, 3);
  assert.equal(vm.counts.active, 2);
  assert.equal(vm.counts.restricted, 1);
  assert.equal(vm.counts.workflows, 10);
  assert.equal(vm.counts.reports, 6);
});

test("states distinct: current (operating) vs restricted (installed, not operating)", () => {
  const coop = vm.rows.find((r) => r.key === "cooperative_markets");
  const legacy = vm.rows.find((r) => r.key === "legacy");
  assert.deepEqual(coop.states, ["current"]);
  assert.ok(coop.active);
  assert.deepEqual(legacy.states, ["restricted"]);
  assert.ok(!legacy.active);
  assert.equal(legacy.installedCount, 0);
  assert.deepEqual(cv.cartridgeStates("active"), ["current"]);
  assert.deepEqual(cv.cartridgeStates("draft"), ["restricted"]);
});

test("capabilityTotal sums every collection; richest sorts first; deterministic", () => {
  const coop = vm.rows.find((r) => r.key === "cooperative_markets");
  assert.equal(coop.capabilityTotal, 3 + 6 + 8 + 2 + 2 + 1 + 1 + 4 + 1 + 1 + 1);
  assert.equal(vm.rows[0].key, "cooperative_markets");
  const vm2 = cv.buildCartridgesView({ manifests }, { as_of: AS_OF });
  assert.equal(JSON.stringify(vm), JSON.stringify(vm2));
});
