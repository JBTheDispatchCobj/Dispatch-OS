// core/kernel/permissions.ts
//
// Permission engine (Kernel Volume II; RFC-2002) — a DETERMINISTIC, plane- and
// visibility-aware AUTHORIZATION CORE. Generic: it knows only planes, visibility,
// workspaces, and roles. No vertical nouns.
//
// ONE AUTHORIZATION SEMANTICS. Every predicate here is a faithful, line-for-line
// mirror of the SQL RLS predicates so a surface gets the SAME answer in-process
// as Row-Level Security gives at the database boundary once 0016/0017 are applied:
//
//   canReadPlane   ≙ app_can_read_plane(plane, visibility, workspace_id)   (0016 §0)
//   canWriteTenant ≙ app_can_write_tenant(workspace_id, roles…)            (0016 §0)
//   canAdminObject ≙ app_can_admin_object(...) = app_can_write_tenant(ws,'owner','admin')  (0017 §8)
//
// SERVICE-ROLE BYPASS. The Supabase service role bypasses RLS; shared-market
// ingestion (public facts, the Auric, shared-market registry rows) is written
// that way (0016 §0, 0017 §1/§8). authorize() reproduces this exactly: a
// `service` principal is allowed with reason "service_role_bypass". Every other
// principal is evaluated against the mirror.
//
// LINEAGE, NOT A WEIGHT. A decision is never a bare boolean: {@link PermissionDecision}
// carries a machine-readable `reason` naming the predicate that allowed/denied it,
// so an authorization outcome is auditable evidence — consistent with the doctrine
// that consequential outputs retain provenance.
//
// PURITY / DETERMINISM: pure functions over a {@link Principal} + a plane-aware
// resource. No clock, no I/O, no randomness.
//
// ERASABLE-ONLY TS: no enums, no parameter properties, no namespaces; `import type`
// for type-only imports. Safe under `node` native type-stripping.

import type { Plane, Visibility } from "@/core/truth/types";
import type { RoleKey } from "@/core/types";
import type { Principal } from "@/core/kernel/identity";
import { isAuthenticated, isMember, hasRole } from "@/core/kernel/identity";

// ---------------------------------------------------------------------------
// Role sets — EXACTLY the lists the RLS policies pass. Kept as named constants so
// the mirror and the SQL stay in lockstep and a change is a one-line, auditable edit.
// ---------------------------------------------------------------------------

/**
 * Insert on the COMMON tenant-write tables — source_documents, the assertion
 * family, relationships, sources, and object_registry (0016 §3/§4/§7, 0017 §8
 * app_can_write_object) all use owner/admin/operator. This is the set the generic
 * `authorize("write", …)` verb maps to, and it matches app_can_write_object
 * exactly (the registry write path this wave targets).
 */
export const TENANT_WRITE_ROLES: RoleKey[] = ["owner", "admin", "operator"];
/** Update on tenant truth / registry (0016/0017). Owner/admin. */
export const TENANT_UPDATE_ROLES: RoleKey[] = ["owner", "admin"];
/**
 * Intelligence-object writes are the EXCEPTION: 0016 §5 `io_write`/`io_update`
 * gate inserts AND updates on owner/admin only (publication curation), NOT the
 * common owner/admin/operator insert set. A caller inserting an intelligence
 * object must authorize with THIS set (or action "update"), not the generic
 * "write" verb — else an operator would be granted an IO insert the SQL denies.
 */
export const IO_WRITE_ROLES: RoleKey[] = ["owner", "admin"];
/** Governance: merge/split + duplicate resolution (app_can_admin_object, 0017 §8). */
export const ADMIN_ROLES: RoleKey[] = ["owner", "admin"];

// ---------------------------------------------------------------------------
// Resource shape + decision
// ---------------------------------------------------------------------------

/**
 * The plane/visibility/tenant discriminator every governed row carries (ADR-0004).
 * `workspace_id` is null for a shared-market / no-tenant row (a regulator, a
 * public institution, a shared-market registry object).
 */
export interface PlaneAwareResource {
  plane: Plane;
  visibility: Visibility;
  workspace_id: string | null;
}

/** The verbs the engine authorizes, mapped to the RLS policy shapes. */
export type PermissionAction = "read" | "write" | "update" | "admin";

/**
 * An authorization outcome. `reason` is a stable, machine-readable code (never a
 * free-text sentence that drifts) so the decision is auditable lineage:
 *   allow:  "service_role_bypass" | "public_read" | "shared_market_network" |
 *           "tenant_member" | "tenant_role:<role>"
 *   deny:   "unauthenticated" | "not_member" | "missing_role" | "no_tenant"
 */
export interface PermissionDecision {
  allowed: boolean;
  reason: string;
}

function allow(reason: string): PermissionDecision {
  return { allowed: true, reason };
}
function deny(reason: string): PermissionDecision {
  return { allowed: false, reason };
}

// ---------------------------------------------------------------------------
// Core predicates — the faithful mirrors (returned as decisions so the reason travels)
// ---------------------------------------------------------------------------

/**
 * app_can_read_plane(plane, visibility, workspace_id):
 *   auth.uid() is not null AND (
 *        visibility = 'public'
 *     OR (plane = 'shared_market' AND visibility = 'network')
 *     OR (workspace_id is not null AND app_is_member(workspace_id)) )
 *
 * This is the AUTHENTICATED-user predicate (the service-role bypass is layered in
 * authorize()). A `service`/non-user principal is not an auth.uid() here.
 */
export function readPlaneDecision(p: Principal, res: PlaneAwareResource): PermissionDecision {
  if (!isAuthenticated(p)) return deny("unauthenticated");
  if (res.visibility === "public") return allow("public_read");
  if (res.plane === "shared_market" && res.visibility === "network") {
    return allow("shared_market_network");
  }
  if (res.workspace_id !== null && isMember(p, res.workspace_id)) {
    return allow("tenant_member");
  }
  return deny(res.workspace_id === null ? "no_tenant" : "not_member");
}

/** Boolean form of {@link readPlaneDecision}. */
export function canReadPlane(p: Principal, res: PlaneAwareResource): boolean {
  return readPlaneDecision(p, res).allowed;
}

/**
 * app_can_write_tenant(workspace_id, roles…):
 *   workspace_id is not null AND app_has_role(workspace_id, roles…)
 *
 * Shared-market rows (workspace_id null) intentionally fall through to NO
 * authenticated write — they are written by the service role.
 */
export function writeTenantDecision(
  p: Principal,
  workspaceId: string | null,
  roles: RoleKey[],
): PermissionDecision {
  // app_can_write_tenant is evaluated in the INVOKER (auth.uid) context — only an
  // authenticated user can hold a role. A non-user principal (agent) has no
  // auth.uid() and is denied here, consistently with readPlaneDecision, so a
  // principal can never write a row it could not read. The service role bypasses
  // RLS entirely at the authorize() layer, ABOVE this predicate (never through it).
  if (!isAuthenticated(p)) return deny("unauthenticated");
  if (workspaceId === null) return deny("no_tenant");
  if (!hasRole(p, workspaceId, roles)) {
    return isMember(p, workspaceId) ? deny("missing_role") : deny("not_member");
  }
  // Name the satisfying role for the audit trail (deterministic: highest held).
  const held = roles.filter((r) => hasRole(p, workspaceId, [r]));
  return allow("tenant_role:" + held[0]);
}

/** Boolean form of {@link writeTenantDecision}. */
export function canWriteTenant(p: Principal, workspaceId: string | null, roles: RoleKey[]): boolean {
  return writeTenantDecision(p, workspaceId, roles).allowed;
}

// ---------------------------------------------------------------------------
// The unified entry point — service bypass + action → predicate
// ---------------------------------------------------------------------------

/**
 * Authorize `action` on a plane-aware `resource` for `principal`. This is the one
 * call a surface makes; it reproduces RLS exactly:
 *   - a `service` principal bypasses (reason "service_role_bypass"), like the
 *     Supabase service key;
 *   - "read"   → app_can_read_plane;
 *   - "write"  → app_can_write_tenant(ws, TENANT_WRITE_ROLES)   (insert);
 *   - "update" → app_can_write_tenant(ws, TENANT_UPDATE_ROLES);
 *   - "admin"  → app_can_write_tenant(ws, ADMIN_ROLES)          (governance).
 */
export function authorize(
  principal: Principal,
  action: PermissionAction,
  resource: PlaneAwareResource,
): PermissionDecision {
  if (principal.kind === "service") return allow("service_role_bypass");
  if (action === "read") return readPlaneDecision(principal, resource);
  if (action === "write") return writeTenantDecision(principal, resource.workspace_id, TENANT_WRITE_ROLES);
  if (action === "update") return writeTenantDecision(principal, resource.workspace_id, TENANT_UPDATE_ROLES);
  return writeTenantDecision(principal, resource.workspace_id, ADMIN_ROLES);
}

/** Boolean convenience over {@link authorize}. */
export function can(
  principal: Principal,
  action: PermissionAction,
  resource: PlaneAwareResource,
): boolean {
  return authorize(principal, action, resource).allowed;
}

// ---------------------------------------------------------------------------
// Object Registry governance — mirrors 0017 §8 (app_can_read/write/admin_object)
// ---------------------------------------------------------------------------

/**
 * The minimal plane-aware shape a registry row exposes for authorization — a
 * structural subset of core/registry/service.ts `CanonicalObject`, so a caller
 * can pass a CanonicalObject directly without importing this type.
 */
export interface RegistryObjectRef {
  plane: Plane;
  visibility: Visibility;
  workspace_id?: string | null;
}

function toResource(o: RegistryObjectRef): PlaneAwareResource {
  return { plane: o.plane, visibility: o.visibility, workspace_id: o.workspace_id ?? null };
}

/** app_can_read_object — read plane-aware. */
export function canReadObject(p: Principal, o: RegistryObjectRef): boolean {
  return can(p, "read", toResource(o));
}

/** app_can_write_object — tenant member (owner/admin/operator) writes the object. */
export function canWriteObject(p: Principal, o: RegistryObjectRef): boolean {
  return can(p, "write", toResource(o));
}

/**
 * app_can_admin_object — owner/admin ONLY governance actions (merge/split,
 * duplicate resolution). Note the load-bearing consequence: a SHARED-MARKET
 * registry object (workspace_id null) can be governed by NO authenticated user —
 * only the platform service role — because app_can_write_tenant requires a
 * workspace. Shared-market identity merges are platform-governed by construction.
 */
export function adminObjectDecision(p: Principal, o: RegistryObjectRef): PermissionDecision {
  return authorize(p, "admin", toResource(o));
}

/** Boolean form of {@link adminObjectDecision}. */
export function canAdminObject(p: Principal, o: RegistryObjectRef): boolean {
  return adminObjectDecision(p, o).allowed;
}

/**
 * Governed-merge authorization. A merge in the Object Registry is an append-only
 * governance action; ObjectRegistryService.applyMerge stays pure, so a caller
 * gates it with THIS on the SURVIVING object first (mirrors 0017's
 * `merge_write … with check (app_can_admin_object(surviving_object_id))`). Returns
 * the decision (with reason) so the refusal is auditable, not silent.
 */
export function authorizeMerge(p: Principal, survivingObject: RegistryObjectRef): PermissionDecision {
  return adminObjectDecision(p, survivingObject);
}
