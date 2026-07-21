// core/auric/distribution.ts
//
// Auric distribution — channel variants + the EDITORIAL VERIFICATION GATE
// (Volume VI, DOCTRINE publication loop). This is the publication capstone of
// Sprint I: an assembled + rendered Intelligence Object reaches readers on a
// channel ONLY after a human EDITORIAL disposition approves it.
//
// TWO DISTINCT HUMAN GATES (do not conflate):
//   * the IC gate (pipeline `ICApproval`) authorizes the DEAL DECISION;
//   * the EDITORIAL gate here authorizes PUBLICATION of the intelligence object.
// A run may be IC-approved yet still not be publishable until an editor signs off.
//
// LOAD-BEARING RULE (DOCTRINE / ADR-0005): nothing publishes to a channel without
// an approved editorial disposition carrying its human `by` + `decision_ref` — the
// authorization is a sourced act (lineage), never a weight or an autonomous default.
// Held/rejected/absent → NOTHING is delivered.
//
// TRUTH DISCIPLINE: a channel delivery RESTATES the IO's evidence — its
// `source_refs` are the variant's, which are `ioSourceRefs(io)` by construction
// (the Auric engine sets them). A delivery can never cite a superset of the IO.
//
// PURE + DETERMINISTIC: no clock, no random, no I/O. The caller injects every id
// and timestamp. isolatedModules-friendly: type-only imports use `import type`;
// erasable-only (no enums / parameter-properties / namespaces); ES2022; "@/*".

import type {
  IntelligenceObject,
  ContentVariant,
  ChannelType,
} from "@/core/intelligence/types";
import type { Visibility } from "@/core/truth/types";
import { ioSourceRefs } from "@/core/auric/engine";

// ---------------------------------------------------------------------------
// The editorial gate input (mirrors the pipeline's ICApproval shape)
// ---------------------------------------------------------------------------

/**
 * A HUMAN editorial disposition — the publication gate. The model may assemble
 * and render an IO; a human EDITOR disposes of it for publication. Caller-supplied
 * (never invented by the engine); `decision_ref` is the truth-object id of the
 * recorded editorial decision so an approved publication is traceable.
 */
export interface EditorialDisposition {
  disposition: "approved" | "rejected" | "held";
  /** The human editor — "user:<id>" (never an agent/system). */
  by: string;
  /** Truth-object id of the recorded editorial decision (traceability). */
  decision_ref: string;
  note?: string;
}

// ---------------------------------------------------------------------------
// Channels
// ---------------------------------------------------------------------------

/** A channel to distribute to, with the default reach for deliveries on it. */
export interface ChannelSpec {
  channel: ChannelType;
  /** Default visibility for deliveries on this channel. */
  visibility: Visibility;
  label: string;
}

/**
 * The default Auric channel set for the market layer. `brief` + `market_feed` are
 * the free public-attention surfaces; `terminal_feed` is the institution surface
 * (network reach, not open public).
 */
export const DEFAULT_CHANNELS: ChannelSpec[] = [
  { channel: "brief", visibility: "public", label: "The Auric — Bi-daily Brief" },
  { channel: "market_feed", visibility: "public", label: "The Auric — Market" },
  { channel: "terminal_feed", visibility: "network", label: "[Institution] Terminal feed" },
];

// ---------------------------------------------------------------------------
// Output
// ---------------------------------------------------------------------------

/** One published delivery of a variant to a channel. */
export interface ChannelDelivery {
  id: string;
  channel: ChannelType;
  intelligence_object_id: string;
  variant_id: string;
  title: string;
  body: string;
  /** Channel default reach (a future policy step may narrow this per variant). */
  visibility: Visibility;
  /** Restates the IO's refs exactly (== the variant's source_refs == ioSourceRefs(io)). */
  source_refs: string[];
  /** The editorial decision that authorized publication (lineage, not a weight). */
  editorial_decision_ref: string;
  approved_by: string;
  status: "published";
  published_at: string;
}

export type PublicationStatus = "published" | "held_for_editorial" | "rejected";

export interface PublicationResult {
  io_id: string;
  status: PublicationStatus;
  /** The disposition that gated this result (null when none was supplied). */
  editorial: EditorialDisposition | null;
  /** Empty unless the editorial disposition is `approved`. */
  deliveries: ChannelDelivery[];
  /** Which channels received at least one delivery. */
  channels: ChannelType[];
  /** Why, when nothing published (or a summary when it did). */
  reason: string;
  generated_by: "auric_distribution:v1";
}

export interface DistributeContext {
  idPrefix: string;
  publishedAt: string;
}

// ---------------------------------------------------------------------------
// distribute
// ---------------------------------------------------------------------------

/**
 * Distribute an IO's rendered variants to the requested channels — ONLY on an
 * approved editorial disposition. A variant lands on a channel when its own
 * `channel` is in the requested set. Held / rejected / absent disposition →
 * nothing is delivered and the reason says so (the gate has teeth).
 *
 * Deterministic: delivery ids derive from `ctx.idPrefix` + a stable sequence over
 * (channel order, variant order).
 */
export function distribute(
  io: IntelligenceObject,
  variants: ContentVariant[],
  channels: ChannelSpec[],
  editorial: EditorialDisposition | null | undefined,
  ctx: DistributeContext,
): PublicationResult {
  const base = {
    io_id: io.id,
    editorial: editorial ?? null,
    generated_by: "auric_distribution:v1" as const,
  };

  // EDITORIAL GATE — with teeth. No approved human disposition → publish nothing.
  if (!editorial || editorial.disposition !== "approved") {
    const status: PublicationStatus =
      editorial?.disposition === "rejected" ? "rejected" : "held_for_editorial";
    return {
      ...base,
      status,
      deliveries: [],
      channels: [],
      reason:
        status === "rejected"
          ? `editor ${editorial?.by ?? "?"} rejected publication (${editorial?.decision_ref ?? "no decision_ref"})`
          : "held: no approved editorial disposition — nothing published",
    };
  }

  const ioRefs = ioSourceRefs(io);
  const deliveries: ChannelDelivery[] = [];
  const usedChannels = new Set<ChannelType>();
  let seq = 0;

  for (const spec of channels) {
    const matching = variants.filter((v) => v.channel === spec.channel);
    for (const v of matching) {
      // A variant's source_refs are ioSourceRefs(io) by construction; fall back to
      // the IO refs defensively so a delivery can never cite a superset of the IO.
      const source_refs = v.source_refs ?? ioRefs;
      deliveries.push({
        id: `${ctx.idPrefix}:delivery:${seq++}`,
        channel: spec.channel,
        intelligence_object_id: io.id,
        variant_id: v.id,
        title: v.title ?? io.headline,
        body: v.body,
        visibility: spec.visibility,
        source_refs,
        editorial_decision_ref: editorial.decision_ref,
        approved_by: editorial.by,
        status: "published",
        published_at: ctx.publishedAt,
      });
      usedChannels.add(spec.channel);
    }
  }

  return {
    ...base,
    status: "published",
    deliveries,
    channels: [...usedChannels],
    reason: `published ${deliveries.length} deliveries across ${usedChannels.size} channel(s), authorized by ${editorial.by}`,
  };
}

// ---------------------------------------------------------------------------
// Gate invariant
// ---------------------------------------------------------------------------

/**
 * Truth-discipline invariant for tests/gates: every channel delivery restates the
 * IO's refs exactly (no superset). Exposed so the debug loop can assert it.
 */
export function deliveriesRestateIO(
  io: IntelligenceObject,
  deliveries: ChannelDelivery[],
): boolean {
  const key = (a: string[]) => [...a].sort().join("|");
  const target = key(ioSourceRefs(io));
  return deliveries.every((d) => key(d.source_refs) === target);
}
