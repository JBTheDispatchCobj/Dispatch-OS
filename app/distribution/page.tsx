// app/distribution/page.tsx
//
// Olympic Sprint — Wave 4. The Channel / Distribution Terminal surface (Vol VI,
// the DOCTRINE publication loop). This SERVER component runs the Wave-1
// orchestration spine (`runDealPipeline`) on the Halcyon × Summit golden fixture
// to obtain the assembled Intelligence Object + its rendered variants, then drives
// the Auric distribution engine (`distribute`) TWICE to tell the whole EDITORIAL
// GATE story deterministically, and shapes a serializable view-model for the client
// `DistributionView`:
//
//   (a) HELD — `distribute(io, variants, DEFAULT_CHANNELS, null, ctx)`: no editorial
//       disposition → status `held_for_editorial`, ZERO deliveries. This proves the
//       gate has teeth: nothing publishes to a channel without a human sign-off.
//   (b) APPROVED — `distribute(io, variants, DEFAULT_CHANNELS, {approved…}, ctx)`: an
//       editor authorized publication → deliveries flow, each carrying its editorial
//       decision_ref + approved_by (lineage, not a weight).
//
// The two calls feed the IDENTICAL IO + variants; the only difference is the human
// editorial disposition — which is the point.
//
// LOAD-BEARING (DOCTRINE / ADR-0005): a delivery restates the IO's evidence exactly,
// never a superset — surfaced via `deliveriesRestateIO`. The VM handles ANY set of
// channels present in the deliveries generically (group by channel; render whatever
// appears — today the pipeline renders variants only on market_feed + terminal_feed,
// so `brief` yields 0 deliveries, but a lead is adding a `brief` lens upstream and
// this surface must not hardcode a fixed channel count).
//
// Deterministic: FIXED id prefixes + a fixed publishedAt stamp (reused from the run's
// ctx.startedAt, no clock) so the page prerenders statically and reproducibly. The
// client component imports NO server/engine modules (server modules stay out of the
// client bundle).

import { runDealPipeline } from "@/cartridges/cooperative_markets/pipeline";
import { halcyonSummitRun } from "@/cartridges/cooperative_markets/pipeline_fixtures";
import {
  distribute,
  deliveriesRestateIO,
  DEFAULT_CHANNELS,
  type EditorialDisposition,
  type DistributeContext,
  type ChannelDelivery,
} from "@/core/auric/distribution";
import { ioSourceRefs } from "@/core/auric/engine";
import {
  DistributionView,
  type DistributionVM,
  type DistributionChannelVM,
  type DistributionChannelGroupVM,
  type DistributionDeliveryVM,
  type DistributionGateStateVM,
} from "@/components/terminal/DistributionView";

export const metadata = {
  title: "Cooperative Markets — Channel / Distribution",
  description:
    "The Auric distribution engine's editorial publication gate, made visible: nothing publishes to a channel without an approved human editorial disposition.",
};

// The recorded HUMAN editorial disposition — the publication gate. Caller-supplied
// (a sourced act with its decision_ref), never invented by the engine.
const EDITORIAL_APPROVAL: EditorialDisposition = {
  disposition: "approved",
  by: "user:managing_editor",
  decision_ref: "decision:ed:summit_halcyon:approved",
  note: "Managing editor approved publication of the committee-approved IO.",
};

function flattenDelivery(d: ChannelDelivery): DistributionDeliveryVM {
  return {
    id: d.id,
    channel: d.channel,
    title: d.title,
    body: d.body,
    visibility: d.visibility,
    variant_id: d.variant_id,
    editorial_decision_ref: d.editorial_decision_ref,
    approved_by: d.approved_by,
    source_refs: d.source_refs,
  };
}

export default function DistributionPage() {
  // --- Run the spine → assembled IO + rendered variants ----------------------
  const { input, ctx } = halcyonSummitRun();
  const run = runDealPipeline(input, ctx);

  // The golden advancing run always assembles + publishes an IO past the human IC
  // gate; guard defensively so the type narrows and the page never renders a
  // half-run (a non-advancing fixture would have io === null).
  if (!run.io) {
    throw new Error("distribution surface expects an advancing run with an assembled IO");
  }
  const io = run.io;

  // Fixed distribute contexts — deterministic ids + a fixed publishedAt (reuse the
  // run's startedAt so freshly-published deliveries carry a stable stamp).
  const heldCtx: DistributeContext = {
    idPrefix: "auric:dist:held",
    publishedAt: ctx.startedAt,
  };
  const approvedCtx: DistributeContext = {
    idPrefix: "auric:dist:approved",
    publishedAt: ctx.startedAt,
  };

  // (a) HELD — no editorial disposition → the gate holds everything.
  const held = distribute(io, run.variants, DEFAULT_CHANNELS, null, heldCtx);

  // (b) APPROVED — an editor authorized publication → deliveries flow.
  const approved = distribute(io, run.variants, DEFAULT_CHANNELS, EDITORIAL_APPROVAL, approvedCtx);

  // Truth discipline: every approved delivery restates the IO's refs exactly.
  const restatesIO = deliveriesRestateIO(io, approved.deliveries);

  // --- Shape the serializable VM --------------------------------------------

  // Which channels received ≥1 delivery on the approved path.
  const receivedChannels = new Set<string>(approved.channels);

  // The full requested channel set (DEFAULT_CHANNELS), each flagged received / not.
  const channelSet: DistributionChannelVM[] = DEFAULT_CHANNELS.map((c) => ({
    channel: c.channel,
    label: c.label,
    visibility: c.visibility,
    received: receivedChannels.has(c.channel),
  }));

  // Group the approved deliveries by whatever channels actually appear (generic —
  // never assumes a fixed set). Preserve DEFAULT_CHANNELS order, then append any
  // channel that appears in the deliveries but is not in the default set (defensive:
  // an upstream lens could introduce a new channel).
  const byChannel = new Map<string, ChannelDelivery[]>();
  for (const d of approved.deliveries) {
    const list = byChannel.get(d.channel) ?? [];
    list.push(d);
    byChannel.set(d.channel, list);
  }
  const orderedChannels: string[] = [
    ...DEFAULT_CHANNELS.map((c) => c.channel).filter((ch) => byChannel.has(ch)),
    ...[...byChannel.keys()].filter(
      (ch) => !DEFAULT_CHANNELS.some((c) => c.channel === ch),
    ),
  ];
  const labelFor = (ch: string) =>
    DEFAULT_CHANNELS.find((c) => c.channel === ch)?.label ?? ch;
  const groups: DistributionChannelGroupVM[] = orderedChannels.map((ch) => {
    const deliveries = byChannel.get(ch) ?? [];
    return {
      channel: ch,
      label: labelFor(ch),
      // Reach comes from the deliveries themselves (channel default reach).
      visibility: deliveries[0]?.visibility ?? "public",
      deliveries: deliveries.map(flattenDelivery),
    };
  });

  const heldState: DistributionGateStateVM = {
    status: held.status,
    reason: held.reason,
    deliveryCount: held.deliveries.length,
    editorial: held.editorial
      ? {
          disposition: held.editorial.disposition,
          by: held.editorial.by,
          decision_ref: held.editorial.decision_ref,
        }
      : null,
  };

  // The IO's source refs "as delivered": the union the deliveries restate (they
  // equal ioSourceRefs(io) by construction; fall back to the IO's own union when no
  // delivery published, e.g. before the `brief` lens exists on some channel).
  const deliveredRefs =
    approved.deliveries.length > 0
      ? [...new Set(approved.deliveries.flatMap((d) => d.source_refs))]
      : ioSourceRefs(io);

  const vm: DistributionVM = {
    generatedAt: ctx.startedAt,
    io: {
      id: io.id,
      headline: io.headline,
      top_tier: io.top_tier ?? null,
      visibility: io.visibility,
      source_refs: deliveredRefs,
    },
    channelSet,
    held: heldState,
    approved: {
      status: approved.status,
      reason: approved.reason,
      deliveryCount: approved.deliveries.length,
      editorial: approved.editorial
        ? {
            disposition: approved.editorial.disposition,
            by: approved.editorial.by,
            decision_ref: approved.editorial.decision_ref,
          }
        : null,
      channels: approved.channels,
      groups,
    },
    restatesIO,
  };

  return <DistributionView vm={vm} />;
}
