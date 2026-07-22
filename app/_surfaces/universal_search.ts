// app/_surfaces/universal_search.ts
//
// Olympic Sprint IV — Wave 2. THE TERMINAL RUNTIME · universal search (Vol VII).
//
// The pure, deterministic index + matcher that powers BOTH the registry-driven
// command palette (navigation over the whole product surface area) and the
// `/search` surface (universal search over the live objects). Generic: it names
// no vertical in its body — it indexes whatever rows/surfaces/aliases the caller
// passes (the `/institutions` directory rows, the UI surface registry, and the
// external-canon alias registry).
//
// DOCTRINE STATE LEGEND (kept visibly distinct — never silently normalized):
//   * current    — a live object: a live Terminal surface, a CONFIRMED canon alias;
//   * synthetic  — an institution row whose figures are labeled synthetic/illustrative
//                  (never presentable as real — the directory's own labeling, carried
//                  through so a search hit can never imply a figure is real);
//   * restricted — an object that is framed/proposed but not authoritative: a SCAFFOLD
//                  surface (not built yet), a PROPOSED (unconfirmed) canon alias;
//   * missing    — the honest empty-result state (a query that matches nothing is shown
//                  as missing, never a fabricated hit).
//
// GATE / TRUTH DISCIPLINE. Search NAVIGATES; it never mutates, decides, or advances
// anything. A synthetic institution figure is labeled synthetic on its result row;
// a proposed canon alias is labeled restricted (identity-not-authority — a proposed
// alias is not a confirmed identity). No result is ever fabricated for an empty query.
//
// PURE (no store, no clock, no I/O): it takes already-read arrays + returns a
// serializable result. Ranking is a TOTAL order (score desc, then title, then id) so
// the same query is byte-identical every run. ERASABLE-ONLY TS (no enums / parameter
// properties; `import type` only) so the debug loop + `node --test` import it directly.

import type { InstitutionRow } from "@/cartridges/cooperative_markets/run_institutions_directory";
import type { UiSurface } from "@/core/registry/ui_surfaces";
import type { CanonAlias } from "@/core/registry/canon";

export type SearchKind = "institution" | "surface" | "canon";
export type SearchState = "current" | "synthetic" | "restricted" | "missing";

/** One indexed, navigable object. `keywords` is the lowercased haystack the matcher scans. */
export interface SearchItem {
  id: string;
  kind: SearchKind;
  title: string;
  subtitle: string;
  /** Where selecting this result navigates. */
  href: string;
  state: SearchState;
  /** True iff this row's figures are synthetic/illustrative (never presentable as real). */
  synthetic: boolean;
  /** Lowercased searchable text (title + subtitle + any extra tokens). */
  keywords: string;
}

export interface SearchIndex {
  generatedAt: string;
  counts: {
    total: number;
    institution: number;
    surface: number;
    canon: number;
  };
  items: SearchItem[];
}

export interface SearchGroup {
  kind: SearchKind;
  items: SearchItem[];
}

export interface SearchResult {
  query: string;
  total: number;
  /** True iff a non-blank query matched nothing (the honest "missing" state). */
  missing: boolean;
  groups: SearchGroup[];
}

/** A palette navigation target derived from the UI surface registry (registry-driven). */
export interface PaletteSurface {
  route: string;
  title: string;
  section: string;
  status: "live" | "scaffold";
  commands: string[];
  /** Lowercased haystack (title + section + commands) for the palette filter. */
  keywords: string;
}

// ---------------------------------------------------------------------------
// Index construction (generic — the caller supplies the collections)
// ---------------------------------------------------------------------------

function inst(row: InstitutionRow): SearchItem {
  const readiness = row.readiness.replace(/_/g, " ");
  return {
    id: `institution:${row.charter}`,
    kind: "institution",
    title: row.name,
    subtitle: `charter ${row.charter} · ${readiness} · NW ${row.net_worth_ratio.toFixed(2)}%`,
    href: row.terminal_href,
    // An institution is a real indexed object, but its FIGURES are labeled synthetic/
    // illustrative — so the doctrine state carried to the UI is synthetic, never current.
    state: "synthetic",
    synthetic: true,
    keywords: `${row.name} ${row.charter} ${readiness} ${row.assetBand} ${row.label}`.toLowerCase(),
  };
}

function surface(su: UiSurface): SearchItem {
  return {
    id: `surface:${su.route}`,
    kind: "surface",
    title: su.title,
    subtitle: `${su.section} · ${su.status}`,
    href: su.route,
    // A live surface is a current object; a scaffold is framed but not built → restricted.
    state: su.status === "live" ? "current" : "restricted",
    synthetic: false,
    keywords: `${su.title} ${su.section} ${su.primary_object} ${su.commands.join(" ")} ${su.purpose}`.toLowerCase(),
  };
}

function canon(a: CanonAlias): SearchItem {
  const confirmed = a.status === "confirmed";
  return {
    id: `canon:${a.incoming}`,
    kind: "canon",
    title: a.incoming,
    subtitle: `↦ ${a.canonical} · ${a.status}`,
    href: "/network",
    // A confirmed alias is a current identity; a proposed alias is not authoritative
    // (identity-not-authority) → restricted until a human confirms it.
    state: confirmed ? "current" : "restricted",
    synthetic: false,
    keywords: `${a.incoming} ${a.canonical} ${a.kind} ${a.source} ${a.status}`.toLowerCase(),
  };
}

/**
 * Build the universal search index from the live collections. Deterministic:
 * items are emitted in institution → surface → canon order (input-ordered within
 * each kind), and `searchUniverse` re-ranks per query. Pure — no I/O, no clock.
 */
export function buildSearchIndex(
  input: { institutions: InstitutionRow[]; surfaces: UiSurface[]; canon: CanonAlias[] },
  opts: { as_of: string },
): SearchIndex {
  const items: SearchItem[] = [
    ...input.institutions.map(inst),
    ...input.surfaces.map(surface),
    ...input.canon.map(canon),
  ];
  return {
    generatedAt: opts.as_of,
    counts: {
      total: items.length,
      institution: input.institutions.length,
      surface: input.surfaces.length,
      canon: input.canon.length,
    },
    items,
  };
}

// ---------------------------------------------------------------------------
// Matcher (pure; deterministic total order)
// ---------------------------------------------------------------------------

const KIND_ORDER: Record<SearchKind, number> = { surface: 0, institution: 1, canon: 2 };

/**
 * Deterministic relevance score for `item` against a lowercased, non-empty `q`.
 * Higher is better; 0 means no match. A title prefix beats a title substring beats
 * a keywords substring — enough signal to rank, no fuzzy nondeterminism.
 */
export function scoreItem(item: SearchItem, q: string): number {
  const title = item.title.toLowerCase();
  if (title === q) return 100;
  if (title.startsWith(q)) return 80;
  if (title.includes(q)) return 60;
  if (item.keywords.includes(q)) return 40;
  return 0;
}

/**
 * Rank the index against a query. A blank query returns everything (grouped),
 * `missing: false`. A non-blank query filters to positive scores, ranks by
 * (score desc, title asc, id asc) — a TOTAL order — and reports `missing: true`
 * iff nothing matched (the honest empty state). Never mutates the index; never
 * fabricates a hit. `opts.limit` caps each group deterministically (top-N by rank).
 */
export function searchUniverse(
  index: SearchIndex,
  query: string,
  opts: { limit?: number } = {},
): SearchResult {
  const q = query.trim().toLowerCase();
  const limit = opts.limit ?? 0;

  const scored: { item: SearchItem; score: number }[] = index.items.map((item) => ({
    item,
    score: q === "" ? 1 : scoreItem(item, q),
  }));
  const matched = scored.filter((s) => s.score > 0);
  matched.sort((a, b) => {
    if (a.score !== b.score) return b.score - a.score;
    const ta = a.item.title.toLowerCase();
    const tb = b.item.title.toLowerCase();
    if (ta !== tb) return ta < tb ? -1 : 1;
    return a.item.id < b.item.id ? -1 : a.item.id > b.item.id ? 1 : 0;
  });

  const byKind: Record<SearchKind, SearchItem[]> = { institution: [], surface: [], canon: [] };
  for (const s of matched) byKind[s.item.kind].push(s.item);

  const groups: SearchGroup[] = (["surface", "institution", "canon"] as SearchKind[])
    .map((kind) => ({ kind, items: limit > 0 ? byKind[kind].slice(0, limit) : byKind[kind] }))
    .filter((g) => g.items.length > 0)
    .sort((a, b) => KIND_ORDER[a.kind] - KIND_ORDER[b.kind]);

  return {
    query,
    total: matched.length,
    missing: q !== "" && matched.length === 0,
    groups,
  };
}

// ---------------------------------------------------------------------------
// Command palette (registry-driven navigation over the whole product)
// ---------------------------------------------------------------------------

/**
 * Derive the command-palette navigation targets from the UI surface registry. Every
 * surface (live + scaffold) is a jump target; the palette drives entirely from the
 * config-as-data registry, so a new surface appears in the palette with no code
 * change. Deterministic: input-ordered (the caller passes `surfacesBySection`-ordered
 * surfaces). Pure.
 */
export function paletteSurfaces(surfaces: UiSurface[]): PaletteSurface[] {
  return surfaces.map((su) => ({
    route: su.route,
    title: su.title,
    section: su.section,
    status: su.status,
    commands: su.commands.slice(),
    keywords: `${su.title} ${su.section} ${su.commands.join(" ")}`.toLowerCase(),
  }));
}

/** Filter palette surfaces by a query (title/section/command substring). Pure, order-preserving. */
export function filterPalette(surfaces: PaletteSurface[], query: string): PaletteSurface[] {
  const q = query.trim().toLowerCase();
  if (q === "") return surfaces.slice();
  return surfaces.filter((s) => s.keywords.includes(q));
}
