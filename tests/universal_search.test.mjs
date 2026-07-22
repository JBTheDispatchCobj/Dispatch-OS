// tests/universal_search.test.mjs — THE TERMINAL RUNTIME · universal search (Sprint IV Wave 2).
// The pure index + matcher that powers the command palette + the /search surface: it indexes
// the institution directory, the UI surface registry, and the canon aliases; ranks with a
// deterministic total order; keeps doctrine states distinct (synthetic/current/restricted/
// missing); never fabricates a hit. The palette is derived from the same registry.
import { test } from "node:test";
import assert from "node:assert/strict";
import { register } from "node:module";
register("../scripts/alias-hook.mjs", import.meta.url);

const us = await import("@/app/_surfaces/universal_search");
const dir = await import("@/cartridges/cooperative_markets/run_institutions_directory");
const ui = await import("@/core/registry/ui_surfaces");
const canon = await import("@/core/registry/canon");

const AS_OF = "2026-07-22T00:00:00.000Z";
const directory = dir.runInstitutionsDirectory({ as_of: AS_OF, market_size: 20 });
const surfaces = ui.uiSurfaces();
const aliases = canon.canonAliases();
const index = us.buildSearchIndex({ institutions: directory.rows, surfaces, canon: aliases }, { as_of: AS_OF });

test("index covers the union of the three live collections", () => {
  assert.equal(index.counts.institution, 20);
  assert.equal(index.counts.surface, surfaces.length);
  assert.equal(index.counts.canon, aliases.length);
  assert.equal(index.items.length, 20 + surfaces.length + aliases.length);
});

test("doctrine states are distinct: institution=synthetic, live=current, scaffold=restricted", () => {
  assert.equal(index.items.find((i) => i.kind === "institution").state, "synthetic");
  assert.equal(index.items.find((i) => i.href === "/approvals").state, "current");
  assert.equal(index.items.find((i) => i.href === "/executives").state, "restricted");
  const confirmed = index.items.find((i) => i.kind === "canon" && i.subtitle.includes("confirmed"));
  const proposed = index.items.find((i) => i.kind === "canon" && i.subtitle.includes("proposed"));
  assert.equal(confirmed.state, "current");
  assert.equal(proposed.state, "restricted");
});

test("matcher: ranked hits, honest missing state, blank returns all", () => {
  const s = us.searchUniverse(index, "approvals");
  assert.ok(s.groups.some((g) => g.kind === "surface" && g.items.some((i) => i.title === "Approvals")));
  const inst = us.searchUniverse(index, directory.rows[0].charter);
  assert.ok(inst.groups[0].items.every((i) => i.kind === "institution"));
  const empty = us.searchUniverse(index, "zzz_no_such_object_zzz");
  assert.equal(empty.total, 0);
  assert.equal(empty.missing, true);
  const blank = us.searchUniverse(index, "  ");
  assert.equal(blank.missing, false);
  assert.equal(blank.total, index.items.length);
});

test("scoring: a title match outranks a keyword-only match", () => {
  const titleHit = { title: "Approvals", keywords: "approvals evidence", state: "current", synthetic: false, id: "x", kind: "surface", subtitle: "", href: "/x" };
  const kwHit = { title: "Evidence", keywords: "approvals", state: "current", synthetic: false, id: "y", kind: "surface", subtitle: "", href: "/y" };
  assert.ok(us.scoreItem(titleHit, "approvals") > us.scoreItem(kwHit, "approvals"));
  assert.equal(us.scoreItem(kwHit, "nomatch"), 0);
});

test("palette is registry-driven and filterable", () => {
  const pal = us.paletteSurfaces(surfaces);
  assert.equal(pal.length, surfaces.length);
  assert.ok(pal.every((p) => p.route.startsWith("/")));
  assert.ok(us.filterPalette(pal, "approvals").some((p) => p.route === "/approvals"));
  assert.equal(us.filterPalette(pal, "   ").length, pal.length);
});

test("deterministic index + matcher", () => {
  const index2 = us.buildSearchIndex({ institutions: directory.rows, surfaces, canon: aliases }, { as_of: AS_OF });
  assert.equal(JSON.stringify(index), JSON.stringify(index2));
  assert.equal(JSON.stringify(us.searchUniverse(index, "cu")), JSON.stringify(us.searchUniverse(index, "cu")));
});
