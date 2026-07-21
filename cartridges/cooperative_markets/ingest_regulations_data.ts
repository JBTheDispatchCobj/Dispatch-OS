// cartridges/cooperative_markets/ingest_regulations_data.ts
//
// Loader companion to `ingest_regulations.ts` — THE ONE ALLOWED IMPURITY,
// isolated in its own tiny module so the pure ingestion module stays
// side-effect-free (and therefore importable under bare Node type-stripping in
// `scripts/debug-loop.mjs`, which supplies the parsed records itself via `fs`).
//
// Next/webpack statically inlines these JSON files at build; `resolveJsonModule`
// types them. The `as unknown as` casts cross the untyped-JSON boundary once,
// here. Nothing else imports the raw JSON.
//
// isolatedModules-friendly: the type-only import uses `import type`; the JSON
// default imports are erased to plain values by the bundler.

import type {
  RegulationRecord,
  AmendmentRecord,
} from "@/cartridges/cooperative_markets/ingest_regulations";
import clean from "@/docs/04_sources/ncua/ncua_regulations_clean.json";
import amendments from "@/docs/04_sources/ncua/ncua_regulations_future_amendments.json";

/** The staged real NCUA corpus as typed arrays (675 in-force records + 10 pending). */
export function loadRegulatoryCorpus(): {
  records: RegulationRecord[];
  amendments: AmendmentRecord[];
} {
  return {
    records: clean as unknown as RegulationRecord[],
    amendments: amendments as unknown as AmendmentRecord[],
  };
}
