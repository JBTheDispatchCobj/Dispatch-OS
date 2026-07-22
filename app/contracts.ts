// app/contracts.ts
//
// SURFACE ADAPTER (Sprint II Wave 3). The thin binding the server actions call
// THROUGH instead of hitting the store directly. It:
//   1. mints a RequestEnvelope from the demo session (ids/timestamps injected
//      HERE, at the effectful surface — the kernel stays pure),
//   2. authorizes the request via the kernel contracts (authorize-FIRST), and
//   3. only then delegates to the EXISTING store mutation.
//
// This is where the ad-hoc `canReview` retirement actually happens: the human-
// gate actions (review a work item, decide/promote a proposal, decide an
// approval, review evidence) get their yes/no from `core/kernel/permissions`
// via a contract, not from a boolean at the call site. The demo session is a
// workspace owner, so every check ALLOWS and the surfaces behave exactly as
// before — but the plumbing is real, and a non-authorized principal would get a
// typed refusal (proven in the debug loop + unit tests).
//
// Impurity (id/timestamp minting) lives HERE by design: the surface is the
// "caller" the kernel doctrine says injects ids/timestamps into the pure
// envelope. Nothing in core/ reads a clock.

import { randomUUID } from "node:crypto";
import { store } from "@/core/data";
import { getDemoSession } from "@/core/auth/session";
import { sessionEnvelope } from "@/core/auth/principal";
import { envelopeActor } from "@/core/kernel/envelope";
import type { RequestEnvelope } from "@/core/kernel/envelope";
import { guard, tenantResource } from "@/core/kernel/contracts";
import type { ContractResult } from "@/core/kernel/contracts";
import type { Approval, WorkItem, WorkItemStatus } from "@/core/types";

/** The single demo organization every seeded workspace belongs to (core/data). */
const DEMO_ORG = "org_demo";

/** Resolve the workspace a work item lives in (or null if it does not exist). */
function workItemWorkspace(id: string): string | null {
  return store.getWorkItem(id)?.workspace_id ?? null;
}

/** Resolve the workspace a proposal lives in via the existing list methods. */
function proposalWorkspace(id: string): string | null {
  for (const ws of store.listWorkspaces()) {
    if (store.listProposals(ws.id).some((p) => p.id === id)) return ws.id;
  }
  return null;
}

/** Resolve the workspace an approval lives in via the existing list methods. */
function approvalWorkspace(id: string): string | null {
  for (const ws of store.listWorkspaces()) {
    if (store.listApprovals(ws.id).some((a) => a.id === id)) return ws.id;
  }
  return null;
}

/** Resolve the workspace an evidence item lives in via its parent work item. */
function evidenceWorkspace(id: string): string | null {
  const workItemId = store.getEvidence(id)?.work_item_id;
  return workItemId ? workItemWorkspace(workItemId) : null;
}

/**
 * Mint a per-request envelope for the demo session acting in `workspaceId`. The
 * correlation + request ids and the ISO instant are injected here (surface = the
 * caller); the envelope/contracts stay pure.
 */
function envFor(workspaceId: string | null): RequestEnvelope {
  const rid = randomUUID();
  return sessionEnvelope(getDemoSession(), {
    workspaceId: workspaceId ?? "",
    organizationId: DEMO_ORG,
    correlation_id: `corr:${rid}`,
    request_id: `req:${rid}`,
    occurred_at: new Date().toISOString(),
    plane: "private_terminal",
  });
}

/**
 * Log a refusal so a denied human-gate action is auditable at the surface. In the
 * demo (owner) this never fires; it is the observable trace when authorization
 * would deny.
 */
function noteRefusal(where: string, r: ContractResult<unknown>): void {
  if (!r.ok) {
    // eslint-disable-next-line no-console
    console.warn(
      `[contracts] ${where} refused: ${r.refusal.reason} (action=${r.refusal.action}, corr=${r.refusal.correlation_id})`,
    );
  }
}

// ---------------------------------------------------------------------------
// Authorize-first contract calls the server actions delegate to
// ---------------------------------------------------------------------------

/** Review-queue sign-off: authorize "review", then apply the status transition. */
export function reviewWorkItem(
  workItemId: string,
  toStatus: WorkItemStatus,
): ContractResult<WorkItem | undefined> {
  const ws = workItemWorkspace(workItemId);
  const env = envFor(ws);
  const r = guard(env, "review", tenantResource(ws), () =>
    store.setStatus(workItemId, toStatus, envelopeActor(env)),
  );
  noteRefusal("reviewWorkItem", r);
  return r;
}

/** Proposal disposition: authorize "decide", then reject/accept the proposal. */
export function decideProposal(
  proposalId: string,
  decision: "approved" | "rejected",
): ContractResult<void> {
  const ws = proposalWorkspace(proposalId);
  const env = envFor(ws);
  const r = guard(env, "decide", tenantResource(ws), () =>
    store.decideProposal(proposalId, decision, getDemoSession().id),
  );
  noteRefusal("decideProposal", r);
  return r;
}

/** Proposal promotion: authorize "promote", then promote to real work. */
export function promoteProposal(proposalId: string): ContractResult<WorkItem | undefined> {
  const ws = proposalWorkspace(proposalId);
  const env = envFor(ws);
  const r = guard(env, "promote", tenantResource(ws), () =>
    store.promoteProposal(proposalId, getDemoSession().id),
  );
  noteRefusal("promoteProposal", r);
  return r;
}

/** Human approval: authorize "approve", then record the disposition. */
export function decideApproval(
  approvalId: string,
  decision: "approved" | "rejected" | "changes_requested",
  notes?: string,
): ContractResult<Approval | undefined> {
  const ws = approvalWorkspace(approvalId);
  const env = envFor(ws);
  const r = guard(env, "approve", tenantResource(ws), () =>
    store.decideApproval(approvalId, decision, envelopeActor(env), notes),
  );
  noteRefusal("decideApproval", r);
  return r;
}

/** Evidence review: authorize "review", then record the approve/reject decision. */
export function reviewEvidence(
  evidenceId: string,
  decision: "approved" | "rejected",
): ContractResult<unknown> {
  const ws = evidenceWorkspace(evidenceId);
  const env = envFor(ws);
  const r = guard(env, "review", tenantResource(ws), () =>
    store.reviewEvidence(evidenceId, decision, envelopeActor(env)),
  );
  noteRefusal("reviewEvidence", r);
  return r;
}
