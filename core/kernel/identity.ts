// core/kernel/identity.ts
//
// Identity & Tenancy (Kernel Volume II; RFC-2002) — PORTABLE, CROSS-ORG IDENTITY.
//
// One person/agent is ONE identity that can hold membership in many workspaces
// across many organizations, with a per-workspace role. This is the runtime
// counterpart to the SQL tenancy model (organizations → workspaces →
// workspace_memberships → user_profiles, core/types.ts) and the identity half of
// the 0016/0017 RLS predicates: it is the deterministic, in-process mirror of
// `auth.uid()`, `app_is_member(workspace_id)`, and `app_has_role(workspace_id,
// roles…)`. The permission engine (core/kernel/permissions.ts) consumes these
// predicates so the SAME authorization answer is produced in-memory and,
// post-0016/0017-apply, at the database boundary.
//
// GENERIC / NO VERTICAL NOUNS: nothing here names a vertical concept. Identity,
// membership, org, workspace, and role are universal tenancy primitives.
//
// PURITY / DETERMINISM: every function here is pure. A Principal carries its own
// membership facts (the caller resolves them from the membership store /
// SessionUser); no function reads a clock, a database, or Math.random. Ordering
// helpers are stable.
//
// ERASABLE-ONLY TS: no enums, no parameter properties, no namespaces; type-only
// imports use `import type`. Safe under `node` native type-stripping.

import type { RoleKey } from "@/core/types";

// ---------------------------------------------------------------------------
// Principal + membership
// ---------------------------------------------------------------------------

/**
 * What KIND of identity is acting.
 *   - "user"    — an authenticated human (has an `auth.uid()`); the RLS invoker.
 *   - "agent"   — an automation run acting under an explicit, membership-scoped
 *                 identity (still gated exactly like a user).
 *   - "service" — the platform service role. Bypasses RLS (shared-market
 *                 ingestion, the Auric). Mirrors the Supabase service key.
 */
export type PrincipalKind = "user" | "agent" | "service";

/**
 * One membership edge: this identity is a member of `workspace_id` (inside
 * `organization_id`) holding `role`. The unit app_is_member / app_has_role test.
 */
export interface Membership {
  workspace_id: string;
  organization_id: string;
  role: RoleKey;
}

/**
 * A portable identity (RFC-2002). The SAME `id` can appear across organizations
 * via multiple {@link Membership} edges — that portability is the whole point:
 * identity is not scoped to one org/workspace. `memberships` is the complete set
 * of tenancy facts the permission engine reasons over; a `service` principal
 * carries none (it bypasses membership entirely).
 */
export interface Principal {
  id: string;
  kind: PrincipalKind;
  display_name?: string;
  memberships: Membership[];
}

// ---------------------------------------------------------------------------
// Role ranking (privilege ordering — used ONLY to pick the strongest role when
// an identity holds more than one membership in the same workspace). Authorization
// itself uses EXACT role-set membership, mirroring the explicit role lists the
// RLS policies pass (`'owner','admin','operator'`), NOT this ranking.
// ---------------------------------------------------------------------------

export const ROLE_RANK: Record<RoleKey, number> = {
  owner: 5,
  admin: 4,
  operator: 3,
  reviewer: 2,
  viewer: 1,
};

// ---------------------------------------------------------------------------
// Predicates — the in-process mirror of auth.uid() / app_is_member / app_has_role
// ---------------------------------------------------------------------------

/**
 * Is this an AUTHENTICATED identity — i.e. does it have an `auth.uid()`? Only a
 * `user` does (the RLS invoker). `agent` acts under a scoped identity but is not
 * an interactive auth session; `service` bypasses RLS. The permission engine
 * layers the service bypass on top; this predicate is the faithful auth.uid()
 * mirror on its own.
 */
export function isAuthenticated(p: Principal): boolean {
  return p.kind === "user";
}

/** The membership edges an identity holds for a given workspace (usually 0 or 1). */
function membershipsIn(p: Principal, workspaceId: string): Membership[] {
  return p.memberships.filter((m) => m.workspace_id === workspaceId);
}

/**
 * `app_is_member(workspace_id)` — does this identity belong to the workspace?
 * A `service` principal is NOT a member (it bypasses, it does not join).
 */
export function isMember(p: Principal, workspaceId: string): boolean {
  if (p.kind === "service") return false;
  return membershipsIn(p, workspaceId).length > 0;
}

/**
 * The identity's role in a workspace, or null if not a member. When more than one
 * membership edge exists for the workspace, the STRONGEST role wins (deterministic
 * via ROLE_RANK) so a stray duplicate never silently downgrades authority.
 */
export function roleIn(p: Principal, workspaceId: string): RoleKey | null {
  const ms = membershipsIn(p, workspaceId);
  if (ms.length === 0) return null;
  let best = ms[0].role;
  for (const m of ms) {
    if (ROLE_RANK[m.role] > ROLE_RANK[best]) best = m.role;
  }
  return best;
}

/**
 * `app_has_role(workspace_id, roles…)` — is this identity a member of the
 * workspace holding one of the named roles? EXACT set membership against the
 * provided list (faithful to the explicit role lists in the RLS policies); the
 * privilege ranking is NOT used to imply a higher role satisfies a lower one.
 * A `service` principal is not a member, so it never satisfies this on its own.
 */
export function hasRole(p: Principal, workspaceId: string, roles: RoleKey[]): boolean {
  if (p.kind === "service") return false;
  const held = new Set(membershipsIn(p, workspaceId).map((m) => m.role));
  return roles.some((r) => held.has(r));
}

// ---------------------------------------------------------------------------
// Portable-identity surface (cross-org reach)
// ---------------------------------------------------------------------------

/** Distinct organizations this identity reaches, sorted (stable, de-duped). */
export function organizationsOf(p: Principal): string[] {
  return Array.from(new Set(p.memberships.map((m) => m.organization_id))).sort();
}

/** Distinct workspaces this identity reaches, sorted (stable, de-duped). */
export function workspacesOf(p: Principal): string[] {
  return Array.from(new Set(p.memberships.map((m) => m.workspace_id))).sort();
}

/**
 * The canonical actor string for provenance/audit: "user:<id>" | "agent:<id>" |
 * "system" (the service role). Matches the Actor convention in core/truth/types
 * and core/types (WorkItemEvent/OperatingEvent actors).
 */
export function actorString(p: Principal): string {
  if (p.kind === "user") return "user:" + p.id;
  if (p.kind === "agent") return "agent:" + p.id;
  return "system";
}

// ---------------------------------------------------------------------------
// Constructors (thin, additive helpers — the app resolves memberships elsewhere)
// ---------------------------------------------------------------------------

/** A human identity with an explicit membership set. */
export function userPrincipal(
  id: string,
  memberships: Membership[],
  displayName?: string,
): Principal {
  return { id, kind: "user", display_name: displayName, memberships: memberships.slice() };
}

/** An automation-run identity scoped to an explicit membership set. */
export function agentPrincipal(runId: string, memberships: Membership[]): Principal {
  return { id: runId, kind: "agent", memberships: memberships.slice() };
}

/**
 * The platform service-role identity. Holds no memberships and bypasses RLS in
 * the permission engine (shared-market ingestion / the Auric are written this
 * way). Frozen so it cannot accrue memberships by accident.
 */
export const SERVICE_PRINCIPAL: Principal = Object.freeze({
  id: "system",
  kind: "service",
  display_name: "Platform (service role)",
  // Frozen (object + array) so the shared singleton returned by systemPrincipal()
  // can never accrue memberships by accident — a push would throw in strict mode
  // and be a no-op otherwise. Service never uses memberships anyway (it bypasses).
  memberships: Object.freeze([] as Membership[]) as unknown as Membership[],
}) as Principal;

/** Convenience: the platform service-role identity. */
export function systemPrincipal(): Principal {
  return SERVICE_PRINCIPAL;
}
