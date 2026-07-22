// app/_surfaces/evidence_view.ts
//
// Olympic Sprint IV — Wave 1. The PURE view-model builder for the `/evidence`
// surface (promoted from a scaffold to a real surface over LIVE evidence).
//
// Every material claim drills through to its lineage: the object it supports (the
// work item), who captured it, when, its review status, and the doctrine states it
// renders distinctly:
//   * pending_approval — unreviewed: a human review gate still owes a decision;
//   * inferred         — agent-captured: a Dispatch inference, not a hard fact;
//   * stale            — past its freshness window (age from created_at → as_of);
//   * restricted       — backed by an access-controlled source document;
//   * current          — reviewed (approved) + fresh.
//
// GATE DISCIPLINE. This builder NEVER reviews anything — `decidable` is true only
// for a `pending` item, and the actual approve/reject is taken by the server action
// (`app/actions.reviewEvidenceAction`) routing THROUGH the permission-engine
// contract (`app/contracts.reviewEvidence` → authorize "review"). The projection
// can never flip an unreviewed item to approved.
//
// GENERIC (no vertical noun) + PURE (no store, no clock: `as_of` is injected, age is
// Date.parse over injected ISO strings — the same pattern as core/profile/freshness).
// ERASABLE-ONLY TS so the debug loop + `node --test` can import it directly.

import type { EvidenceItem, EvidenceReviewStatus } from "@/core/types";

export type EvidenceState = "current" | "stale" | "inferred" | "pending_approval" | "restricted";

/** Past this age (days), a piece of evidence is STALE (past its freshness window). */
export const EVIDENCE_STALE_DAYS = 120;

/** One evidence item enriched with the object it supports + its workspace. */
export interface EvidenceInput {
  item: EvidenceItem;
  work_item_title: string;
  workspace_id: string;
  workspace_label: string;
}

export interface EvidenceRowVM {
  id: string;
  work_item_id: string;
  work_item_title: string;
  workspace_id: string;
  workspace_label: string;
  kind: string;
  label: string;
  captured_by: string;
  /** "agent" | "user" | other — the source class, for the "by source" grouping. */
  source_class: string;
  created_at: string;
  review_status: EvidenceReviewStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  ageDays: number;
  inferred: boolean;
  stale: boolean;
  restricted: boolean;
  document_id: string | null;
  /** Compact drill-through of the value payload (the keys carried), for lineage. */
  valueKeys: string[];
  /** True iff a human review is still owed (review_status pending/undefined). */
  decidable: boolean;
  states: EvidenceState[];
}

export interface EvidenceVM {
  generatedAt: string;
  counts: {
    total: number;
    unreviewed: number;
    approved: number;
    rejected: number;
    inferred: number;
    stale: number;
    restricted: number;
  };
  rows: EvidenceRowVM[];
}

/** Whole-day age from `created_at` → `as_of` (0 for future/bad dates; no clock). */
export function ageDaysBetween(createdAt: string, asOf: string): number {
  const a = Date.parse(createdAt);
  const b = Date.parse(asOf);
  if (Number.isNaN(a) || Number.isNaN(b) || b <= a) return 0;
  return Math.floor((b - a) / 86_400_000);
}

/** The effective review status (a legacy/absent status is treated as pending). */
export function effectiveReviewStatus(item: EvidenceItem): EvidenceReviewStatus {
  return item.review_status ?? "pending";
}

/** The doctrine states one evidence row renders distinctly. */
export function evidenceStates(row: {
  review_status: EvidenceReviewStatus;
  inferred: boolean;
  stale: boolean;
  restricted: boolean;
}): EvidenceState[] {
  const states: EvidenceState[] = [];
  if (row.review_status === "pending") states.push("pending_approval");
  if (row.review_status === "approved" && !row.stale) states.push("current");
  if (row.inferred) states.push("inferred");
  if (row.stale) states.push("stale");
  if (row.restricted) states.push("restricted");
  // Fallback ONLY for an approved item with no other applicable state — a rejected
  // (or expired) item is NEVER labeled "current" (that state means reviewed-approved
  // + fresh); its rejected review_status is carried separately on the row.
  if (states.length === 0 && row.review_status === "approved") states.push("current");
  return states;
}

function sourceClass(capturedBy: string): string {
  const i = capturedBy.indexOf(":");
  return i > 0 ? capturedBy.slice(0, i) : capturedBy;
}

function toRow(input: EvidenceInput, asOf: string): EvidenceRowVM {
  const it = input.item;
  const review_status = effectiveReviewStatus(it);
  const ageDays = ageDaysBetween(it.created_at, asOf);
  const inferred = it.captured_by.startsWith("agent:");
  const stale = ageDays > EVIDENCE_STALE_DAYS;
  const restricted = it.document_id != null;
  return {
    id: it.id,
    work_item_id: it.work_item_id,
    work_item_title: input.work_item_title,
    workspace_id: input.workspace_id,
    workspace_label: input.workspace_label,
    kind: it.kind,
    label: it.label,
    captured_by: it.captured_by,
    source_class: sourceClass(it.captured_by),
    created_at: it.created_at,
    review_status,
    reviewed_by: it.reviewed_by ?? null,
    reviewed_at: it.reviewed_at ?? null,
    ageDays,
    inferred,
    stale,
    restricted,
    document_id: it.document_id ?? null,
    valueKeys: it.value ? Object.keys(it.value) : [],
    decidable: review_status === "pending",
    states: evidenceStates({ review_status, inferred, stale, restricted }),
  };
}

/** Deterministic ascending compare by a key then id (total order). */
function byKeyThenId(ka: string, kb: string, ia: string, ib: string): number {
  if (ka < kb) return -1;
  if (ka > kb) return 1;
  return ia < ib ? -1 : ia > ib ? 1 : 0;
}

/**
 * Build the `/evidence` view-model from LIVE evidence. Deterministic: unreviewed
 * first (a review is owed), then by object title, then id — the same order every
 * run. NEVER mutates the input; NEVER reviews.
 */
export function buildEvidenceView(inputs: EvidenceInput[], opts: { as_of: string }): EvidenceVM {
  const rows = inputs
    .map((i) => toRow(i, opts.as_of))
    .sort((a, b) => {
      // unreviewed sinks to the top (review owed), then object, then id
      const ra = a.decidable ? 0 : 1;
      const rb = b.decidable ? 0 : 1;
      if (ra !== rb) return ra - rb;
      return byKeyThenId(a.work_item_title, b.work_item_title, a.id, b.id);
    });

  const counts = {
    total: rows.length,
    unreviewed: rows.filter((r) => r.review_status === "pending").length,
    approved: rows.filter((r) => r.review_status === "approved").length,
    rejected: rows.filter((r) => r.review_status === "rejected").length,
    inferred: rows.filter((r) => r.inferred).length,
    stale: rows.filter((r) => r.stale).length,
    restricted: rows.filter((r) => r.restricted).length,
  };

  return { generatedAt: opts.as_of, counts, rows };
}
