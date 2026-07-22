// app/executives/page.tsx — SCAFFOLD (framed placeholder; Olympic Sprint III Wave 5)
//
// A wireframe for the "Executives & Boards" surface. Its full contract — primary
// object, planned tabs/commands, human gates, and the doctrine state legend —
// is declared in the UI surface registry (core/registry/data/ui_surfaces.json)
// and rendered through the shared ScaffoldView. Look/feel/flow is deferred to
// the Terminal polish sprint; this exists so the whole product is FRAMED and
// every route is reachable and reviewable against one map.
//
// Server component: reads its surface entry from the registry (config-as-data)
// and prerenders statically. No engine work, no client bundle.

import { surfaceByRoute } from "@/core/registry/ui_surfaces";
import { ScaffoldView } from "@/components/terminal/ScaffoldView";

export const metadata = {
  title: "Executives & Boards",
  description: "Executive and board profiles per institution: role, tenure, committees, sourced from public disclosures. Every claim drills to its source.",
};

export default function Page() {
  const surface = surfaceByRoute("/executives");
  if (!surface) throw new Error("ui surface not registered: /executives");
  return <ScaffoldView surface={surface} />;
}
