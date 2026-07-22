// app/evidence/page.tsx
//
// Olympic Sprint IV — Wave 1. The "Evidence & Provenance" surface, PROMOTED from a
// scaffold to a REAL surface over LIVE evidence. This SERVER component gathers the
// evidence attached to every work item (across workspaces), enriches each with the
// object it supports + its workspace, shapes it with the pure `buildEvidenceView`,
// and renders the client `EvidenceView`. Reviewing routes through the EXISTING
// permission-engine contract (`reviewEvidenceAction` → `app/contracts.reviewEvidence`).
//
// Deterministic read: a fixed `as_of` (no clock) drives the freshness/age states so
// the page prerenders statically; the projection is a pure function of the store.

import { store } from "@/core/data";
import { buildEvidenceView, type EvidenceInput } from "@/app/_surfaces/evidence_view";
import { EvidenceView } from "@/components/terminal/EvidenceView";

export const metadata = {
  title: "Evidence & Provenance",
  description:
    "Every material claim drills through to source, observation date, confidence, freshness, and review status — over live evidence, gated by the permission engine.",
};

const AS_OF = "2026-07-22T00:00:00.000Z";

export default function EvidencePage() {
  // NOTE (demo scope): see app/approvals/page.tsx — this composites evidence across the demo
  // workspaces (single seeded in-memory store; session is an owner; rows labeled by workspace).
  // A real multi-tenant read must be principal-scoped / permission-gated. DEBUG_LOG [DEFERRED].
  // The WRITE path (review) is already authorize-gated via app/contracts.reviewEvidence.
  const inputs: EvidenceInput[] = [];
  for (const ws of store.listWorkspaces()) {
    for (const wi of store.listWorkItems(ws.id)) {
      for (const item of store.listEvidence(wi.id)) {
        inputs.push({
          item,
          work_item_title: wi.title,
          workspace_id: ws.id,
          workspace_label: ws.name,
        });
      }
    }
  }
  const vm = buildEvidenceView(inputs, { as_of: AS_OF });
  return <EvidenceView vm={vm} />;
}
