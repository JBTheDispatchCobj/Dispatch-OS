// core/auth/session.ts
//
// Auth/session boundary. Pattern borrowed from Dispatch (Supabase magic-link +
// role-gated layouts), but stubbed for idea state: returns a fixed demo owner
// so the OS is explorable with no backend. Replace with real Supabase auth +
// per-workspace role lookup later; keep the same shape so pages don't change.

import type { RoleKey } from "@/core/types";
import { userPrincipal } from "@/core/kernel/identity";
import { writeTenantDecision } from "@/core/kernel/permissions";
import { REVIEW_ROLES } from "@/core/kernel/contracts";

export interface SessionUser {
  id: string;
  display_name: string;
  email: string;
  role: RoleKey;
}

export function getDemoSession(): SessionUser {
  return { id: "u_owner", display_name: "You (Owner)", email: "owner@demo.test", role: "owner" };
}

/**
 * BACK-COMPAT SHIM (Sprint II Wave 3). `canReview` used to be an ad-hoc OR over
 * role strings. It is RETIRED as a source of truth: authorization now routes
 * through the permission engine (core/kernel/permissions::authorize, via the
 * kernel contracts). This shim survives only so any lingering boolean caller
 * keeps working — and its answer now COMES FROM the engine: a synthetic
 * single-workspace principal holding `role` is tested against the REVIEW role
 * set with `writeTenantDecision` (the `app_has_role` mirror), not a local
 * boolean. New call sites must authorize an envelope's principal through a
 * contract instead of calling this.
 */
export function canReview(role: RoleKey): boolean {
  const p = userPrincipal("session:shim", [
    { workspace_id: "ws:shim", organization_id: "org:shim", role },
  ]);
  return writeTenantDecision(p, "ws:shim", REVIEW_ROLES).allowed;
}
