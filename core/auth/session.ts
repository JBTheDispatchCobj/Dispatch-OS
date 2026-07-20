// core/auth/session.ts
//
// Auth/session boundary. Pattern borrowed from Dispatch (Supabase magic-link +
// role-gated layouts), but stubbed for idea state: returns a fixed demo owner
// so the OS is explorable with no backend. Replace with real Supabase auth +
// per-workspace role lookup later; keep the same shape so pages don't change.

import type { RoleKey } from "@/core/types";

export interface SessionUser {
  id: string;
  display_name: string;
  email: string;
  role: RoleKey;
}

export function getDemoSession(): SessionUser {
  return { id: "u_owner", display_name: "You (Owner)", email: "owner@demo.test", role: "owner" };
}

export function canReview(role: RoleKey): boolean {
  return role === "owner" || role === "admin" || role === "reviewer";
}
