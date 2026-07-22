// core/registry/connectors.ts
//
// The CONNECTOR REGISTRY loader (DKR §2; Volume IX Connector Registry). Projects
// the config-as-data connector catalog (core/registry/data/connectors.json) into
// typed {@link ConnectorSpec} + {@link SourceRegistryEntry} views, and runs the
// closed-graph integrity check the debug loop gates on.
//
// CONFIG-AS-DATA (DOCTRINE / DKR / ADR-0006). The JSON governs; this module is the
// typed accessor + validator over it, exactly like core/registry/objects.ts over
// the Financial Services object catalog. Qualifying a placeholder connector is a
// DATA edit (a new manifest entry), never a code fork — the generic runtime
// (core/kernel/connector_runtime.ts) executes any registered ConnectorSpec.
//
// NO VERTICAL NOUNS IN THE LOGIC. The catalog DATA names domain sources (NCUA,
// SEC EDGAR, …) — config-as-data is where domain lives — but this loader is
// generic: it validates shapes + a closed reference graph, and knows no vertical.
//
// RUNTIME-SAFE LOADING. The catalog is read via `fs` from a path relative to this
// module (`import.meta.url`), NOT a static `import ... from "*.json"` — a static
// JSON import needs an import attribute that Node's native TS type-stripping
// rejects at runtime (the demo / debug-loop / tests run that way). `loadConnectorCatalog`
// also accepts already-parsed data, so a test can inject a fixture with no fs.
//
// PURE VALIDATION. `validateConnectorCatalog` is a pure function over parsed data;
// it reads no clock and mutates nothing. Deterministic: every list it returns is
// sorted.
//
// ERASABLE-ONLY TS: no enums, no parameter properties, no namespaces; `import type`
// for type-only imports. Safe under `node` native type-stripping.

import fs from "node:fs";
import path from "node:path";
import type {
  ConnectorSpec,
  SourceRegistryEntry,
  ConnectorType,
  RegistryStatus,
} from "@/core/registry/types";

// ---------------------------------------------------------------------------
// The catalog shape (a typed view over the JSON literal)
// ---------------------------------------------------------------------------

export interface ConnectorCatalog {
  key: string;
  label: string;
  version: number;
  notes?: string;
  sources: SourceRegistryEntry[];
  connectors: ConnectorSpec[];
}

const VALID_CONNECTOR_TYPES: ConnectorType[] = [
  "direct_api",
  "bulk_download",
  "rss_atom",
  "webhook",
  "browser_capture",
  "manual_upload",
  "email_forward",
  "structured_extraction",
  "partner_feed",
  "mcp_server",
];

const VALID_STATUSES: RegistryStatus[] = ["proposed", "active", "deprecated", "archived"];

// ---------------------------------------------------------------------------
// Load (runtime-safe fs read; or inject already-parsed data)
// ---------------------------------------------------------------------------

let CACHE: ConnectorCatalog | null = null;

/**
 * Absolute path to the config-as-data catalog, rooted at `process.cwd()` (the
 * project root in the Next server bundle at build/prerender, the `node` debug
 * loop, and `node --test` alike). A cwd-relative read avoids `fileURLToPath(new
 * URL(...))`, which a bundler can hand a non-node URL — breaking prerender the
 * first time a page (e.g. /network) loads the catalog.
 */
function catalogPath(): string {
  return path.join(process.cwd(), "core/registry/data/connectors.json");
}

/**
 * Load + validate the connector catalog. Reads `data/connectors.json` via fs by
 * default (runtime-safe); pass `raw` to validate an injected object instead (a
 * test fixture). THROWS with the first integrity failure so a malformed catalog
 * fails the gate loudly rather than half-loading.
 */
export function loadConnectorCatalog(raw?: unknown): ConnectorCatalog {
  if (raw === undefined && CACHE) return CACHE;
  const parsed =
    raw !== undefined ? raw : (JSON.parse(fs.readFileSync(catalogPath(), "utf8")) as unknown);
  const report = validateConnectorCatalog(parsed);
  if (!report.ok) {
    throw new Error("connector catalog invalid: " + report.errors.join("; "));
  }
  const catalog = parsed as ConnectorCatalog;
  if (raw === undefined) CACHE = catalog;
  return catalog;
}

// ---------------------------------------------------------------------------
// Typed accessors
// ---------------------------------------------------------------------------

/** All registered source manifests (config-as-data). */
export function connectorSources(): SourceRegistryEntry[] {
  return loadConnectorCatalog().sources.slice();
}

/** All registered connector specs (config-as-data). */
export function connectorSpecs(): ConnectorSpec[] {
  return loadConnectorCatalog().connectors.slice();
}

/** Look up one connector spec by key. */
export function connectorByKey(key: string): ConnectorSpec | undefined {
  return loadConnectorCatalog().connectors.find((c) => c.key === key);
}

/** Look up one source manifest by key. */
export function sourceByKey(key: string): SourceRegistryEntry | undefined {
  return loadConnectorCatalog().sources.find((s) => s.key === key);
}

/** The source a connector ingests (its `source_key`), or undefined if unresolved. */
export function sourceForConnector(connectorKey: string): SourceRegistryEntry | undefined {
  const c = connectorByKey(connectorKey);
  if (!c) return undefined;
  return sourceByKey(c.source_key);
}

/** Count of active connectors (a headline for the tracker / a health surface). */
export function activeConnectorCount(): number {
  return loadConnectorCatalog().connectors.filter((c) => c.status === "active").length;
}

// ---------------------------------------------------------------------------
// Pure validation — the closed-graph check the debug loop gates on
// ---------------------------------------------------------------------------

export interface CatalogValidation {
  ok: boolean;
  source_count: number;
  connector_count: number;
  active_count: number;
  errors: string[];
}

/**
 * Validate the catalog as a CLOSED GRAPH (pure; deterministic; sorted errors):
 *   - unique source keys + unique connector keys;
 *   - every connector.source_key resolves to a registered source;
 *   - every source.connector_key (when set) resolves to a registered connector;
 *   - connector_type + status are from the allowed unions;
 *   - required fields present (key/label/source_key/plane/visibility/tier).
 * A connector referencing a missing source is the exact "unqualified placeholder"
 * this check exists to catch.
 */
export function validateConnectorCatalog(raw: unknown): CatalogValidation {
  const errors: string[] = [];
  const cat = (raw ?? {}) as Partial<ConnectorCatalog>;
  const sources = Array.isArray(cat.sources) ? cat.sources : [];
  const connectors = Array.isArray(cat.connectors) ? cat.connectors : [];

  const sourceKeys = new Set<string>();
  for (const s of sources) {
    if (!s || typeof s.key !== "string") { errors.push("source missing key"); continue; }
    if (sourceKeys.has(s.key)) errors.push(`duplicate source key: ${s.key}`);
    sourceKeys.add(s.key);
    if (typeof s.label !== "string") errors.push(`source ${s.key}: missing label`);
    if (!VALID_STATUSES.includes(s.status as RegistryStatus)) errors.push(`source ${s.key}: bad status ${String(s.status)}`);
    if (typeof s.default_plane !== "string") errors.push(`source ${s.key}: missing default_plane`);
    if (typeof s.default_visibility !== "string") errors.push(`source ${s.key}: missing default_visibility`);
    if (typeof s.default_tier !== "string") errors.push(`source ${s.key}: missing default_tier`);
  }

  const connectorKeys = new Set<string>();
  for (const c of connectors) {
    if (!c || typeof c.key !== "string") { errors.push("connector missing key"); continue; }
    if (connectorKeys.has(c.key)) errors.push(`duplicate connector key: ${c.key}`);
    connectorKeys.add(c.key);
    if (typeof c.label !== "string") errors.push(`connector ${c.key}: missing label`);
    if (!VALID_STATUSES.includes(c.status as RegistryStatus)) errors.push(`connector ${c.key}: bad status ${String(c.status)}`);
    if (!VALID_CONNECTOR_TYPES.includes(c.connector_type as ConnectorType)) {
      errors.push(`connector ${c.key}: bad connector_type ${String(c.connector_type)}`);
    }
    if (typeof c.source_key !== "string" || !sourceKeys.has(c.source_key)) {
      errors.push(`connector ${c.key}: unresolved source_key ${String(c.source_key)} (unqualified placeholder)`);
    }
  }

  // Reverse edge: a source that names a connector_key must resolve to one.
  for (const s of sources) {
    if (s && typeof s.connector_key === "string" && s.connector_key.length > 0) {
      if (!connectorKeys.has(s.connector_key)) {
        errors.push(`source ${s.key}: connector_key ${s.connector_key} does not resolve`);
      }
    }
  }

  const active = connectors.filter((c) => c && c.status === "active").length;
  return {
    ok: errors.length === 0,
    source_count: sources.length,
    connector_count: connectors.length,
    active_count: active,
    errors: errors.sort(),
  };
}
