// tests/ui_surfaces.test.mjs — the UI SURFACE REGISTRY (Sprint III Wave 5):
// the WHOLE product surface area is framed as config-as-data and validated as a
// closed graph (unique routes · sections resolve · state vocabulary enforced),
// every declared route has a real page file (liveness), and the registry-driven
// nav covers every surface deterministically. Look/feel is deferred; the framing
// is contract-checked here.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { register } from "node:module";
register("../scripts/alias-hook.mjs", import.meta.url);

const ui = await import("@/core/registry/ui_surfaces");
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const REG = JSON.parse(fs.readFileSync(path.join(root, "core/registry/data/ui_surfaces.json"), "utf8"));

const pagePath = (route) => (route === "/" ? "app/page.tsx" : `app${route}/page.tsx`);

test("the ui surface registry is a closed graph; the whole product is framed", () => {
  const v = ui.validateUiSurfaceRegistry(REG);
  assert.ok(v.ok, "closed graph: " + v.errors.join("; "));
  assert.ok(v.live_count >= 6, "a set of live surfaces exists");
  assert.ok(v.scaffold_count >= 8, "a breadth of scaffolds frames the rest of the product");
  assert.equal(v.surface_count, v.live_count + v.scaffold_count, "every surface is live or scaffold");
});

test("closed-graph checks have teeth: dangling section, duplicate route, bad state all fail", () => {
  const brokenSection = JSON.parse(JSON.stringify(REG));
  brokenSection.surfaces[0].section = "__no_such_section__";
  assert.ok(!ui.validateUiSurfaceRegistry(brokenSection).ok, "a dangling section reference fails");

  const dupRoute = JSON.parse(JSON.stringify(REG));
  dupRoute.surfaces.push({ ...dupRoute.surfaces[0] });
  const dv = ui.validateUiSurfaceRegistry(dupRoute);
  assert.ok(!dv.ok && dv.errors.some((e) => e.includes("duplicate route")), "a duplicate route fails");

  const badState = JSON.parse(JSON.stringify(REG));
  badState.surfaces[0].states = ["__not_a_state__"];
  const sv = ui.validateUiSurfaceRegistry(badState);
  assert.ok(!sv.ok && sv.errors.some((e) => e.includes("vocabulary")), "a state outside the vocabulary fails");
});

test("every declared route (live AND scaffold) has a real page file — the product is reachable", () => {
  for (const route of ui.liveRoutes()) {
    assert.ok(fs.existsSync(path.join(root, pagePath(route))), `live route ${route} → ${pagePath(route)} exists`);
  }
  for (const route of ui.scaffoldRoutes()) {
    assert.ok(fs.existsSync(path.join(root, pagePath(route))), `scaffold route ${route} → ${pagePath(route)} exists`);
  }
  // teeth: the mapping actually points at files (not a vacuous pass) — /network is live.
  assert.ok(ui.liveRoutes().includes("/network"), "the joint /network surface is registered live");
});

test("accessors: surfaceByRoute + section ordering has TEETH (reorders out-of-order input)", () => {
  const net = ui.surfaceByRoute("/network");
  assert.ok(net && net.status === "live" && net.section === "network", "/network resolves as a live network surface");
  assert.equal(ui.surfaceByRoute("/does-not-exist"), null, "an unknown route resolves to null");

  // strictly increasing — a plain equality-to-own-sort would pass even if the sort were dropped.
  const orders = ui.navSections().map((s) => s.order);
  for (let i = 1; i < orders.length; i++) assert.ok(orders[i] > orders[i - 1], "nav sections are strictly increasing by order");

  // teeth: the pure sort MUST reorder a deliberately-shuffled fixture (a dropped .sort() would fail here).
  const shuffled = [
    { id: "z", label: "Z", order: 9 },
    { id: "a", label: "A", order: 1 },
    { id: "m", label: "M", order: 5 },
  ];
  assert.deepEqual(ui.orderSections(shuffled).map((s) => s.id), ["a", "m", "z"], "orderSections reorders shuffled input");
});

test("nav grouping: total coverage + strictly-ordered groups following section order (not a self-compare)", () => {
  const sectionOrder = ui.navSections().map((s) => s.id);
  const groups = ui.surfacesBySection();

  // groups follow section order exactly.
  assert.deepEqual(groups.map((g) => g.section.id), sectionOrder, "groups follow nav-section order");

  // every surface covered exactly once (no drops, no dupes across groups).
  const routes = groups.flatMap((g) => g.surfaces.map((s) => s.route));
  assert.equal(routes.length, REG.surfaces.length, "coverage: every surface appears exactly once");
  assert.equal(new Set(routes).size, routes.length, "no surface appears in two groups");

  // each group is strictly ordered by (order, route) — a reordering regression would break this.
  for (const g of groups) {
    for (let i = 1; i < g.surfaces.length; i++) {
      const a = g.surfaces[i - 1];
      const b = g.surfaces[i];
      assert.ok(a.order < b.order || (a.order === b.order && a.route < b.route), `${g.section.id}: surfaces strictly ordered`);
    }
    for (const s of g.surfaces) assert.equal(s.section, g.section.id, "a surface is grouped under its own section");
  }
});

test("scaffold surfaces declare a real contract (primary object, gates array, non-empty states)", () => {
  for (const s of ui.uiSurfaces()) {
    assert.ok(s.primary_object.length > 0, `${s.route}: has a primary object`);
    assert.ok(Array.isArray(s.gates), `${s.route}: gates is an array`);
    assert.ok(Array.isArray(s.states) && s.states.length > 0, `${s.route}: renders at least one doctrine state`);
  }
});
