// app/relationships/page.tsx — SCAFFOLD (framed placeholder; Olympic Sprint III Wave 5)
//
// A wireframe for the "Relationships" surface. Its full contract — primary
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
  title: "Relationships",
  description: "The relationship graph across institutions, companies, and people — stage, evidence, history, opportunity, and next action for each edge.",
};

export default function Page() {
  const surface = surfaceByRoute("/relationships");
  if (!surface) throw new Error("ui surface not registered: /relationships");
  return <ScaffoldView surface={surface} />;
}
