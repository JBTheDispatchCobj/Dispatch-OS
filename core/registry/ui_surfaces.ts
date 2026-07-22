// core/registry/ui_surfaces.ts
//
// The UI SURFACE REGISTRY loader (DKR §2; FS-10000 Terminal Information
// Architecture). A generic, deterministic layer over config-as-data
// `data/ui_surfaces.json` that declares the WHOLE product surface area — every
// route, its nav section, primary object, planned tabs/commands/human-gates, and
// the doctrine state legend each surface must render (current / missing / stale /
// inferred / synthetic / restricted / pending_approval / conflicted).
//
// WHY THIS EXISTS. Look-and-feel is deliberately deferred (Sprint IV Terminal
// polish). Before polishing, the product must be FRAMED end-to-end so every
// surface can be built and reviewed against ONE map. A `live` surface is
// implemented; a `scaffold` surface is a framed placeholder/wireframe pending
// build. This registry is that map — and the nav renders from it, so the whole
// product is visible from any page.
//
// UNIVERSALITY (CLAUDE.md): core/, so NO vertical noun and NO engine logic. This
// module parses / validates / accesses UI IA metadata and knows no domain. The
// surface DATA names product routes (config-as-data is where product structure
// lives); this module is generic.
//
// CLOSED-GRAPH (mirrors connectors.ts / canon.ts). Routes are unique; every
// surface's `section` resolves to a declared section; status + declared states
// are from the allowed unions. A `verify`-style liveness check (does a `live`
// route actually have a page file?) is left to the caller/debug-loop, since this
// pure module takes no fs view of the app/ tree.
//
// PURE / DETERMINISTIC: no clock, no random, no I/O except the sanctioned fs read
// in `loadUiSurfaceRegistry` (like connectors.ts). Lists are input-ordered or
// sorted; same inputs → identical output.
//
// ERASABLE-ONLY TS: no enums, no parameter properties, no namespaces; `import
// type` for type-only imports. Safe under `node` native type-stripping.
//
// The registry DATA is read from the filesystem rooted at `process.cwd()` (the
// project root in every context: the Next server bundle at build/prerender, the
// `node` debug loop, and `node --test`). This avoids BOTH a JSON import attribute
// (which native `node` type-stripping requires but the bundler shapes differently)
// and `fileURLToPath(new URL(...))` (which a bundler can hand a non-node URL,
// breaking prerender). Layout imports this loader on every page, so it must work
// everywhere — hence the deliberately boring cwd-relative read.

import fs from "node:fs";
import path from "node:path";

const REGISTRY_REL_PATH = "core/registry/data/ui_surfaces.json";

// ---------------------------------------------------------------------------
// Types (config-as-data view over data/ui_surfaces.json)
// ---------------------------------------------------------------------------

export type SurfaceStatus = "live" | "scaffold";

/** The doctrine truth/coverage states a surface renders as visibly distinct. */
export type SurfaceState =
  | "current"
  | "missing"
  | "stale"
  | "inferred"
  | "synthetic"
  | "restricted"
  | "pending_approval"
  | "conflicted";

export interface NavSection {
  id: string;
  label: string;
  order: number;
}

export interface UiSurface {
  /** Stable route path (e.g. "/network"). Unique across the registry. */
  route: string;
  title: string;
  /** The nav section id this surface belongs to (must resolve to a NavSection). */
  section: string;
  status: SurfaceStatus;
  /** The primary canonical object type this surface is a projection of. */
  primary_object: string;
  /** FS-10000 (or other) reference this surface frames. Documentation aid. */
  fs_ref?: string;
  purpose: string;
  tabs: string[];
  commands: string[];
  /** Human-authority gates that govern this surface's mutating commands. */
  gates: string[];
  /** The doctrine states this surface must render distinctly. */
  states: SurfaceState[];
  /** Sort order within its section. */
  order: number;
}

export interface UiSurfaceRegistry {
  key: string;
  label: string;
  version: number;
  /** The allowed doctrine state vocabulary. */
  states: string[];
  sections: NavSection[];
  surfaces: UiSurface[];
}

const VALID_STATUSES: SurfaceStatus[] = ["live", "scaffold"];

// ---------------------------------------------------------------------------
// Load (runtime-safe fs read; or inject already-parsed data) — mirrors connectors.ts
// ---------------------------------------------------------------------------

let CACHE: UiSurfaceRegistry | null = null;

/** Load + validate the UI surface registry. Pass `raw` to inject a fixture (no fs). */
export function loadUiSurfaceRegistry(raw?: unknown): UiSurfaceRegistry {
  if (raw === undefined && CACHE) return CACHE;
  const parsed =
    raw !== undefined ? raw : (JSON.parse(fs.readFileSync(path.join(process.cwd(), REGISTRY_REL_PATH), "utf8")) as unknown);
  const report = validateUiSurfaceRegistry(parsed);
  if (!report.ok) throw new Error("ui surface registry invalid: " + report.errors.join("; "));
  const reg = parsed as UiSurfaceRegistry;
  if (raw === undefined) CACHE = reg;
  return reg;
}

// ---------------------------------------------------------------------------
// Closed-graph validation (pure; deterministic; sorted errors)
// ---------------------------------------------------------------------------

export interface UiSurfaceValidation {
  ok: boolean;
  surface_count: number;
  live_count: number;
  scaffold_count: number;
  section_count: number;
  errors: string[];
}

/**
 * Validate the UI surface registry as a CLOSED GRAPH:
 *   - shape: every surface has route/title/section/status/primary_object/purpose;
 *   - UNIQUE routes; a route begins with "/";
 *   - status in the allowed union; every declared state in the registry vocabulary;
 *   - every surface.section resolves to a declared NavSection;
 *   - tabs/commands/states/gates are string arrays (gates may be empty).
 * Pure — takes no fs view of app/, so the "a live route has a page file" liveness
 * check is the caller's (the debug-loop UI-SURFACES step performs it).
 */
export function validateUiSurfaceRegistry(raw: unknown): UiSurfaceValidation {
  const errors: string[] = [];
  const reg = (raw ?? {}) as Partial<UiSurfaceRegistry>;
  const sections = Array.isArray(reg.sections) ? reg.sections : [];
  const surfaces = Array.isArray(reg.surfaces) ? reg.surfaces : [];
  const stateVocab = new Set(Array.isArray(reg.states) ? reg.states : []);
  if (stateVocab.size === 0) errors.push("states vocabulary missing/empty");

  const sectionIds = new Set<string>();
  for (const s of sections) {
    if (!s || typeof s.id !== "string" || s.id.length === 0) { errors.push("section missing id"); continue; }
    if (sectionIds.has(s.id)) errors.push(`duplicate section id: ${s.id}`);
    sectionIds.add(s.id);
    if (typeof s.label !== "string" || s.label.length === 0) errors.push(`section ${s.id}: missing label`);
  }

  const routes = new Set<string>();
  let live = 0;
  let scaffold = 0;
  for (const su of surfaces) {
    if (!su || typeof su.route !== "string" || su.route.length === 0) { errors.push("surface missing route"); continue; }
    if (!su.route.startsWith("/")) errors.push(`surface ${su.route}: route must start with "/"`);
    if (routes.has(su.route)) errors.push(`duplicate route: ${su.route}`);
    routes.add(su.route);
    if (typeof su.title !== "string" || su.title.length === 0) errors.push(`surface ${su.route}: missing title`);
    if (typeof su.primary_object !== "string" || su.primary_object.length === 0) errors.push(`surface ${su.route}: missing primary_object`);
    if (typeof su.purpose !== "string" || su.purpose.length === 0) errors.push(`surface ${su.route}: missing purpose`);
    if (!VALID_STATUSES.includes(su.status)) errors.push(`surface ${su.route}: bad status ${String(su.status)}`);
    else if (su.status === "live") live++;
    else scaffold++;
    if (typeof su.section !== "string" || !sectionIds.has(su.section)) {
      errors.push(`surface ${su.route}: section ${String(su.section)} does not resolve`);
    }
    for (const arr of [["tabs", su.tabs], ["commands", su.commands], ["gates", su.gates]] as [string, unknown][]) {
      if (!Array.isArray(arr[1])) errors.push(`surface ${su.route}: ${arr[0]} must be an array`);
    }
    if (!Array.isArray(su.states) || su.states.length === 0) {
      errors.push(`surface ${su.route}: states must be a non-empty array`);
    } else {
      for (const st of su.states) if (!stateVocab.has(st)) errors.push(`surface ${su.route}: state ${String(st)} not in the registry vocabulary`);
    }
  }

  return {
    ok: errors.length === 0,
    surface_count: surfaces.length,
    live_count: live,
    scaffold_count: scaffold,
    section_count: sections.length,
    errors: errors.sort(),
  };
}

// ---------------------------------------------------------------------------
// Typed accessors (deterministic ordering)
// ---------------------------------------------------------------------------

/** All surfaces (input-ordered copy). */
export function uiSurfaces(): UiSurface[] {
  return loadUiSurfaceRegistry().surfaces.slice();
}

/** Pure total-order sort of nav sections by `order` then `id`. Exported so a test
 *  can prove the sort actually reorders out-of-order input (teeth). */
export function orderSections(sections: NavSection[]): NavSection[] {
  return sections.slice().sort((a, b) => a.order - b.order || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
}

/** All nav sections, ordered by `order` then id (total order). */
export function navSections(): NavSection[] {
  return orderSections(loadUiSurfaceRegistry().sections);
}

/** One surface by route, or null. */
export function surfaceByRoute(route: string): UiSurface | null {
  return loadUiSurfaceRegistry().surfaces.find((s) => s.route === route) ?? null;
}

/**
 * Surfaces grouped by section, in section order, each group ordered by the
 * surface `order` then route. The exact shape the nav renders from.
 */
export interface SurfaceGroup {
  section: NavSection;
  surfaces: UiSurface[];
}

export function surfacesBySection(): SurfaceGroup[] {
  const reg = loadUiSurfaceRegistry();
  return navSections().map((section) => ({
    section,
    surfaces: reg.surfaces
      .filter((s) => s.section === section.id)
      .sort((a, b) => a.order - b.order || (a.route < b.route ? -1 : a.route > b.route ? 1 : 0)),
  }));
}

/** Routes that declare `status: live` — the surfaces the debug-loop expects to find a page for. */
export function liveRoutes(): string[] {
  return loadUiSurfaceRegistry()
    .surfaces.filter((s) => s.status === "live")
    .map((s) => s.route)
    .sort();
}

/** Routes that declare `status: scaffold`. */
export function scaffoldRoutes(): string[] {
  return loadUiSurfaceRegistry()
    .surfaces.filter((s) => s.status === "scaffold")
    .map((s) => s.route)
    .sort();
}
