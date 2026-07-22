// core/auth/principal.ts
//
// The bridge from the demo auth boundary (core/auth/session::SessionUser) to a
// kernel {@link Principal} (RFC-2002) + a {@link RequestEnvelope} (RFC-2001).
//
// WHY. The surfaces authenticate as a demo `SessionUser` (a role + id, no
// backend). The kernel contracts authorize a `Principal` (portable identity +
// per-workspace membership) carried in an envelope. This module maps the one to
// the other so the surfaces route through `authorize()` with NO real backend:
// the demo session becomes a Principal holding a single membership in the acting
// workspace with the session's role, and `sessionEnvelope` wraps it with the
// caller-injected correlation/request ids. When real Supabase auth + membership
// lands, only this mapping changes; the contracts and surfaces do not.
//
// PURITY / DETERMINISM: pure — ids/timestamps are injected by the caller, never
// read from a clock here. GENERIC: SessionUser, workspace, org, role are
// universal tenancy primitives; no vertical noun.
//
// ERASABLE-ONLY TS: `import type` for type-only imports; no enums/namespaces.

import type { SessionUser } from "@/core/auth/session";
import type { Principal } from "@/core/kernel/identity";
import { userPrincipal } from "@/core/kernel/identity";
import type { RequestEnvelope } from "@/core/kernel/envelope";
import { makeEnvelope } from "@/core/kernel/envelope";
import type { Plane } from "@/core/truth/types";

/**
 * Map a demo {@link SessionUser} into a {@link Principal} holding a single
 * membership in `workspaceId` (inside `organizationId`) with the session's role.
 * That one membership edge is exactly what the permission engine reasons over for
 * a workspace-scoped action.
 */
export function sessionPrincipal(
  session: SessionUser,
  workspaceId: string,
  organizationId: string,
): Principal {
  return userPrincipal(
    session.id,
    [{ workspace_id: workspaceId, organization_id: organizationId, role: session.role }],
    session.display_name,
  );
}

/**
 * Wrap a demo session into a {@link RequestEnvelope} for a single request. The
 * caller injects the correlation/request ids, the ISO instant, and the plane —
 * nothing is read from a clock here.
 */
export function sessionEnvelope(
  session: SessionUser,
  args: {
    workspaceId: string;
    organizationId: string;
    correlation_id: string;
    request_id: string;
    occurred_at: string;
    plane?: Plane;
    idempotency_key?: string;
  },
): RequestEnvelope {
  return makeEnvelope({
    principal: sessionPrincipal(session, args.workspaceId, args.organizationId),
    correlation_id: args.correlation_id,
    plane: args.plane ?? "private_terminal",
    occurred_at: args.occurred_at,
    request_id: args.request_id,
    idempotency_key: args.idempotency_key,
  });
}
