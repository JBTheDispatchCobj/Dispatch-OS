// tests/connectors_catalog.test.mjs — the config-as-data connector catalog
// (DKR §2). The real catalog is a closed graph; the validator catches an
// unqualified placeholder (unresolved source_key), dup keys, bad type/status.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { register } from "node:module";
register("../scripts/alias-hook.mjs", import.meta.url);

const {
  validateConnectorCatalog, loadConnectorCatalog, connectorSources, connectorSpecs,
  connectorByKey, sourceForConnector, activeConnectorCount,
} = await import("@/core/registry/connectors");

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const realCatalog = JSON.parse(fs.readFileSync(path.join(root, "core/registry/data/connectors.json"), "utf8"));

// ---- the real catalog is a closed graph -------------------------------------
test("the shipped connector catalog validates as a closed graph", () => {
  const v = validateConnectorCatalog(realCatalog);
  assert.equal(v.ok, true, "catalog invalid:\n" + v.errors.join("\n"));
  assert.ok(v.connector_count >= 30, "a meaningful breadth of connectors is qualified");
  assert.equal(v.connector_count, v.active_count, "every shipped connector is active");
  assert.equal(v.source_count, v.connector_count, "one connector per source (RFC-2011 core principle)");
});

test("loadConnectorCatalog + accessors project the catalog", () => {
  const cat = loadConnectorCatalog();
  assert.equal(cat.sources.length, connectorSources().length);
  assert.ok(connectorSpecs().length >= 30);
  const five = connectorByKey("connector:sec_edgar");
  assert.ok(five, "SEC EDGAR connector present");
  assert.equal(five.source_key, "source:sec_edgar");
  const src = sourceForConnector("connector:ncua_5300_call_report");
  assert.ok(src, "5300 connector resolves its source");
  assert.equal(src.default_tier, "public_fact", "as-reported 5300 figures are public_fact, not a calc");
  assert.equal(activeConnectorCount(), connectorSpecs().length);
});

// ---- the validator has teeth ------------------------------------------------
test("an unresolved source_key is flagged as an unqualified placeholder", () => {
  const bad = { sources: [], connectors: [{ key: "connector:x", label: "X", version: 1, status: "active", connector_type: "direct_api", source_key: "source:missing" }] };
  const v = validateConnectorCatalog(bad);
  assert.equal(v.ok, false);
  assert.ok(v.errors.some((e) => /unresolved source_key.*unqualified placeholder/.test(e)));
});

test("duplicate keys, bad connector_type, and bad status are caught", () => {
  const dup = {
    sources: [
      { key: "source:a", label: "A", version: 1, status: "active", default_plane: "shared_market", default_visibility: "public", default_tier: "public_fact" },
      { key: "source:a", label: "A2", version: 1, status: "active", default_plane: "shared_market", default_visibility: "public", default_tier: "public_fact" },
    ],
    connectors: [
      { key: "connector:a", label: "A", version: 1, status: "bogus", connector_type: "telepathy", source_key: "source:a" },
      { key: "connector:a", label: "A2", version: 1, status: "active", connector_type: "direct_api", source_key: "source:a" },
    ],
  };
  const v = validateConnectorCatalog(dup);
  assert.equal(v.ok, false);
  assert.ok(v.errors.some((e) => /duplicate source key/.test(e)));
  assert.ok(v.errors.some((e) => /duplicate connector key/.test(e)));
  assert.ok(v.errors.some((e) => /bad connector_type/.test(e)));
  assert.ok(v.errors.some((e) => /bad status/.test(e)));
});

test("loadConnectorCatalog throws on an invalid injected catalog", () => {
  assert.throws(() => loadConnectorCatalog({ sources: [], connectors: [{ key: "c", label: "c", version: 1, status: "active", connector_type: "direct_api", source_key: "nope" }] }), /connector catalog invalid/);
});

test("validation is deterministic (sorted errors)", () => {
  const bad = { sources: [], connectors: [{ key: "c2", source_key: "z" }, { key: "c1", source_key: "y" }] };
  assert.deepEqual(validateConnectorCatalog(bad).errors, validateConnectorCatalog(bad).errors);
  const errs = validateConnectorCatalog(bad).errors;
  assert.deepEqual(errs, [...errs].sort(), "errors are sorted");
});
