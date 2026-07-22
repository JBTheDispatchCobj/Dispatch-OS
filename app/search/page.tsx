// app/search/page.tsx
//
// Olympic Sprint IV — Wave 2. The "Search" surface, PROMOTED from a scaffold to a REAL
// universal-search surface over the live objects. This SERVER component builds ONE search
// index from the live collections — the `/institutions` directory rows, the UI surface
// registry, and the external-canon alias registry — with the pure `buildSearchIndex`, and
// renders the client `SearchView` (which ranks with `searchUniverse` and reads `?q=`
// client-side, so the page stays statically prerenderable).
//
// Deterministic read: a fixed `as_of` stamp (no clock) + an index-seeded directory, so the
// index is a pure function of the registries and prerenders statically.

import { runInstitutionsDirectory } from "@/cartridges/cooperative_markets/run_institutions_directory";
import { uiSurfaces } from "@/core/registry/ui_surfaces";
import { canonAliases } from "@/core/registry/canon";
import { buildSearchIndex } from "@/app/_surfaces/universal_search";
import { SearchView } from "@/components/terminal/SearchView";

export const metadata = {
  title: "Search",
  description:
    "Universal search over the live objects — the institution directory, every product surface, and the external-canon aliases. Search and command coexist with structured navigation.",
};

const AS_OF = "2026-07-22T00:00:00.000Z";
/** A bounded institution slice keeps the indexed page payload reasonable at build. */
const SEARCH_MARKET_SIZE = 250;

export default function SearchPage() {
  const directory = runInstitutionsDirectory({ as_of: AS_OF, market_size: SEARCH_MARKET_SIZE });
  const index = buildSearchIndex(
    { institutions: directory.rows, surfaces: uiSurfaces(), canon: canonAliases() },
    { as_of: AS_OF },
  );
  return <SearchView index={index} />;
}
