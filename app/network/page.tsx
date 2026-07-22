// app/network/page.tsx
//
// Olympic Sprint III — Wave 5. The JOINT "Network" Terminal surface, built over
// REAL run output. This SERVER component runs the network orchestration
// (`runNetworkSurface`) and passes a serializable view-model to the client
// `NetworkView`, which renders REVIEW-QUEUE-FIRST (Bryan's pick):
//
//   * the propose-only review queue — cross-source entity duplicates
//     (`runRegistryCandidates`) + external-canon alias proposals (the canon seam),
//     each awaiting human confirm/reject; NOTHING auto-merges (merged_count = 0);
//   * the full-market institution list — labeled SYNTHETIC (a real bulk 5300 feed
//     is a Bryan-only external item), shown with its synthetic label so it can
//     never be presented as real.
//
// Deterministic: a fixed `as_of` (no clock) so the page prerenders statically and
// reproducibly under `npm run build`.

import { runNetworkSurface } from "@/cartridges/cooperative_markets/run_network_surface";
import { NetworkView } from "@/components/terminal/NetworkView";

export const metadata = {
  title: "Cooperative Markets — Network",
  description:
    "The propose-only review queue (cross-source entity duplicates + external-canon alias proposals) over the full-market institution profiles (labeled synthetic).",
};

const AS_OF = "2026-07-22T00:00:00.000Z";

export default async function NetworkPage() {
  const vm = await runNetworkSurface({ as_of: AS_OF });
  return <NetworkView vm={vm} />;
}
