// app/institutions/page.tsx
//
// Olympic Sprint IV — Wave 1. The "Institutions — Directory" surface, PROMOTED
// from a scaffold to a REAL directory over the full-market institution profiles.
// This SERVER component builds the directory view-model (`runInstitutionsDirectory`)
// over the labeled-synthetic full market and passes a serializable VM to the client
// `InstitutionsDirectoryView`, which renders search / filter / sort and opens any
// institution's Terminal.
//
// Deterministic: a fixed `as_of` (no clock) so the page prerenders statically and
// reproducibly under `npm run build`. Figures stay labeled synthetic (a real bulk
// 5300 feed is a Bryan-only external item).

import { runInstitutionsDirectory } from "@/cartridges/cooperative_markets/run_institutions_directory";
import { InstitutionsDirectoryView } from "@/components/terminal/InstitutionsDirectoryView";

export const metadata = {
  title: "Cooperative Markets — Institutions",
  description:
    "Search + browse the full institution market, filter by asset band / readiness, sort, and open any institution's Terminal (labeled synthetic).",
};

const AS_OF = "2026-07-22T00:00:00.000Z";

export default function InstitutionsPage() {
  const vm = runInstitutionsDirectory({ as_of: AS_OF });
  return <InstitutionsDirectoryView vm={vm} />;
}
