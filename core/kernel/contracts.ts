// core/kernel/contracts.ts
//
// Kernel SERVICE CONTRACTS (Kernel Volume II; RFC-2001 Kernel API, RFC-2014
// Kernel API & Service Contracts). The typed layer a SURFACE calls THROUGH
// instead of importing an engine directly. Every contract method:
//
//   1. takes exactly one {@link RequestEnvelope} (WHO + correlation + plane),
//   2. AUTHORIZES FIRST — the decision comes from the permission engine
//      (core/kernel/permissions), never an ad-hoc boolean at the call site,
//   3. on DENY returns a typed {@link Refusal} carrying the machine-readable
//      reason (never a bare `throw`), so a refusal is auditable lineage, and
//   4. on ALLOW delegates to the EXISTING engine/store/pipeline — this layer
//      wraps engines, it does not reimplement them.
//
// ONE AUTHORIZATION SEMANTICS. The domain verbs a surface speaks (review /
// approve / promote / decide) map to the SAME `app_has_role` predicate the
// permission engine mirrors from the 0016/0017 RLS policies — just against a
// verb-specific role set declared here. `authorizeThrough` layers the service-
// role bypass exactly as `authorize()` does, so a contract call gets the same
// answer the database boundary would. This is the seam that RETIRES the ad-hoc
// core/auth/session::canReview: the decision is `writeTenantDecision(...)`, an
// engine predicate, not an OR over role strings.
//
// NO REGULATED CONCLUSION IN A WEIGHT. A contract authorizes and delegates; it
// never manufactures a regulated/financial conclusion. The human gates
// (ICApproval + EditorialDisposition) stay exactly where the engines put them —
// a contract's "approve" verb authorizes WHO may record a human disposition, it
// does not stand in for the disposition itself.
//
// PURITY / DETERMINISM. `authorizeThrough` and the guards are pure over the
// envelope + resource (the permission engine is pure). `guard` runs the caller's
// delegate only on allow; the delegate's own effects (a store write) are the
// caller's, kept OUTSIDE core so this module imports no store and stays trivially
// testable.
//
// GENERIC / NO VERTICAL NOUNS. Work items, proposals, approvals, runs — the
// resources these contracts gate — are universal core concepts; nothing here
// names a vertical.
//
// ERASABLE-ONLY TS: no enums, no parameter properties, no namespaces; `import
// type` for type-only imports. Safe under `node` native type-stripping.

import type { Plane, Visibility } from "@/core/truth/types";
import type { RoleKey } from "@/core/types";
import type { RequestEnvelope } from "@/core/kernel/envelope";
import type { PlaneAwareResource, PermissionDecision, PermissionAction } from "@/core/kernel/permissions";
import { authorize, writeTenantDecision } from "@/core/kernel/permissions";

// ---------------------------------------------------------------------------
// Contract actions — domain verbs a surface speaks, mapped to RLS role sets
// ---------------------------------------------------------------------------

/**
 * The verbs a surface authorizes through a contract. The first four are the
 * DOMAIN verbs that replace `canReview`-style checks; the last four pass straight
 * to the permission engine's own action set (so a contract can gate a plain
 * read/write/update/admin too).
 */
export type ContractAction =
  | "review" // act on a human review queue (work item sign-off)
  | "approve" // record a human approval of a regulated/gated conclusion
  | "promote" // turn an agent proposal into real work (tenant write)
  | "decide" // dispose of a proposal (approve/reject at the human gate)
  | PermissionAction; // "read" | "write" | "update" | "admin"

/**
 * REVIEW roles — who may work a review queue. Faithful to the retired
 * `canReview` (owner/admin/reviewer), but now expressed as the role set the
 * engine's `app_has_role` predicate tests, so the decision is the engine's.
 */
export const REVIEW_ROLES: RoleKey[] = ["owner", "admin", "reviewer"];
/**
 * APPROVE roles — who may record the human approval of a gated conclusion
 * (owner/admin). Governance-grade, matching the tenant update/admin role set:
 * approval is the authorship of a human_approved_conclusion's authorizer, not a
 * routine write.
 */
export const APPROVE_ROLES: RoleKey[] = ["owner", "admin"];
/**
 * PROMOTE roles — who may promote a proposal into real work (owner/admin/
 * operator). This is the common tenant-write set: promoting is an insert of new
 * tenant work, mirroring app_can_write_object.
 */
export const PROMOTE_ROLES: RoleKey[] = ["owner", "admin", "operator"];

/** The role set a domain verb authorizes against (null → defer to the engine's own action). */
function rolesForAction(action: ContractAction): RoleKey[] | null {
  if (action === "review") return REVIEW_ROLES;
  if (action === "decide") return REVIEW_ROLES; // disposing of a proposal is a review-grade act
  if (action === "approve") return APPROVE_ROLES;
  if (action === "promote") return PROMOTE_ROLES;
  return null; // read/write/update/admin → the permission engine's authorize()
}

// ---------------------------------------------------------------------------
// The authorize-first entry point
// ---------------------------------------------------------------------------

/**
 * Authorize a contract `action` for the envelope's principal on `resource`,
 * returning the engine's {@link PermissionDecision} (allowed + machine-readable
 * reason). This is THE authorization call a contract makes — the decision always
 * comes from the permission engine:
 *   - a `service` principal bypasses (reason "service_role_bypass"), exactly like
 *     the Supabase service key and `authorize()`;
 *   - a domain verb (review/approve/promote/decide) → `writeTenantDecision`
 *     against the verb's role set (an `app_has_role` mirror);
 *   - a plain verb (read/write/update/admin) → `authorize()` unchanged.
 */
export function authorizeThrough(
  env: RequestEnvelope,
  action: ContractAction,
  resource: PlaneAwareResource,
): PermissionDecision {
  if (env.principal.kind === "service") {
    return { allowed: true, reason: "service_role_bypass" };
  }
  const roles = rolesForAction(action);
  if (roles === null) {
    // read | write | update | admin — hand straight to the engine.
    return authorize(env.principal, action as PermissionAction, resource);
  }
  return writeTenantDecision(env.principal, resource.workspace_id, roles);
}

// ---------------------------------------------------------------------------
// Typed refusal + result (deny → a value, never a throw)
// ---------------------------------------------------------------------------

/**
 * A typed authorization refusal. Carries the machine-readable engine `reason`
 * (e.g. "missing_role" | "not_member" | "unauthenticated" | "no_tenant") plus the
 * envelope's correlation/request ids, so a denied call is auditable lineage the
 * caller can log or surface — not an exception that unwinds the stack.
 */
export interface Refusal {
  refused: true;
  action: ContractAction;
  reason: string;
  correlation_id: string;
  request_id: string;
}

/** The outcome of a contract call: a value on allow, a {@link Refusal} on deny. */
export type ContractResult<T> =
  | { ok: true; value: T }
  | { ok: false; refusal: Refusal };

/** Build a {@link Refusal} from a denied decision + the envelope context. */
export function refusalFrom(
  env: RequestEnvelope,
  action: ContractAction,
  decision: PermissionDecision,
): Refusal {
  return {
    refused: true,
    action,
    reason: decision.reason,
    correlation_id: env.correlation_id,
    request_id: env.request_id,
  };
}

/**
 * The authorize-first combinator every contract method is built from: authorize
 * `action` on `resource`; on DENY return a typed refusal and DO NOT run the
 * delegate; on ALLOW run the delegate (the existing engine/store call) and wrap
 * its return. The delegate is invoked at most once, and never before the
 * decision — the load-bearing "authorize FIRST, then delegate" invariant.
 */
export function guard<T>(
  env: RequestEnvelope,
  action: ContractAction,
  resource: PlaneAwareResource,
  delegate: () => T,
): ContractResult<T> {
  const decision = authorizeThrough(env, action, resource);
  if (!decision.allowed) return { ok: false, refusal: refusalFrom(env, action, decision) };
  return { ok: true, value: delegate() };
}

/** Convenience: did a result allow? (Narrows nothing; use `.ok` for narrowing.) */
export function isRefused<T>(r: ContractResult<T>): r is { ok: false; refusal: Refusal } {
  return r.ok === false;
}

// ---------------------------------------------------------------------------
// Plane-aware resource helpers (surfaces gate generic objects that carry no plane)
// ---------------------------------------------------------------------------

/**
 * The tenant-plane resource a workspace-scoped object (a work item, a proposal,
 * an approval) presents for authorization. These objects live on the private
 * terminal plane with tenant_private visibility inside their workspace; the
 * permission engine's `app_can_write_tenant`/`app_has_role` predicates key off
 * `workspace_id`, which is all the resource needs to carry.
 */
export function tenantResource(workspaceId: string | null): PlaneAwareResource {
  return { plane: "private_terminal", visibility: "tenant_private", workspace_id: workspaceId };
}

/** A plane-aware resource with an explicit plane/visibility (e.g. a shared-market run). */
export function planeResource(
  plane: Plane,
  visibility: Visibility,
  workspaceId: string | null,
): PlaneAwareResource {
  return { plane, visibility, workspace_id: workspaceId };
}

// ---------------------------------------------------------------------------
// Service contract shapes (the typed interfaces a surface programs against)
// ---------------------------------------------------------------------------

/**
 * A contract method is ALWAYS `(envelope, resource, args) → ContractResult`. The
 * concrete bindings (which call the store / pipeline) live at the SURFACE layer
 * so core imports no store; these interfaces name the shape a surface programs
 * against. Each is a documentation contract — the surface adapter implements it
 * with {@link guard}.
 */

/** Review a work item awaiting sign-off (the human review queue). */
export interface ReviewService<TWorkItem> {
  /** Authorize "review", then apply the status transition via the store. */
  setStatus(
    env: RequestEnvelope,
    resource: PlaneAwareResource,
    args: { work_item_id: string; to_status: string },
  ): ContractResult<TWorkItem | undefined>;
}

/** Dispose of / promote an agent proposal (the human-in-the-loop gate). */
export interface ProposalService<TWorkItem> {
  /** Authorize "decide", then reject/accept the proposal via the store. */
  decide(
    env: RequestEnvelope,
    resource: PlaneAwareResource,
    args: { proposal_id: string; decision: "approved" | "rejected" },
  ): ContractResult<void>;
  /** Authorize "promote", then promote the proposal to real work via the store. */
  promote(
    env: RequestEnvelope,
    resource: PlaneAwareResource,
    args: { proposal_id: string },
  ): ContractResult<TWorkItem | undefined>;
}

/** Record a human approval decision (the authorization gate). */
export interface ApprovalService<TApproval> {
  /** Authorize "approve", then record the disposition via the store. */
  decide(
    env: RequestEnvelope,
    resource: PlaneAwareResource,
    args: {
      approval_id: string;
      decision: "approved" | "rejected" | "changes_requested";
      notes?: string;
    },
  ): ContractResult<TApproval | undefined>;
}
