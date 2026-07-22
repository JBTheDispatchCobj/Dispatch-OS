// tests/contracts.test.mjs — Kernel service contracts (RFC-2001/2014): the
// authorize-FIRST layer surfaces call THROUGH. Every decision comes from the
// permission engine (RFC-2002); a deny returns a typed refusal (never a throw)
// and the delegate never runs; the canReview retirement is proven here too.
import { test } from "node:test";
import assert from "node:assert/strict";
import { register } from "node:module";
register("../scripts/alias-hook.mjs", import.meta.url);

const {
  REVIEW_ROLES, APPROVE_ROLES, PROMOTE_ROLES,
  authorizeThrough, guard, refusalFrom, isRefused, tenantResource, planeResource,
} = await import("@/core/kernel/contracts");
const { makeEnvelope } = await import("@/core/kernel/envelope");
const { userPrincipal, agentPrincipal, systemPrincipal } = await import("@/core/kernel/identity");
const { canReview } = await import("@/core/auth/session");

const mem = (ws, role) => ({ workspace_id: ws, organization_id: "org", role });
const P = {
  owner: () => userPrincipal("u_owner", [mem("ws1", "owner")]),
  admin: () => userPrincipal("u_admin", [mem("ws1", "admin")]),
  operator: () => userPrincipal("u_op", [mem("ws1", "operator")]),
  reviewer: () => userPrincipal("u_rev", [mem("ws1", "reviewer")]),
  viewer: () => userPrincipal("u_view", [mem("ws1", "viewer")]),
  outsider: () => userPrincipal("u_out", [mem("ws2", "owner")]),
  service: () => systemPrincipal(),
  agent: () => agentPrincipal("run1", [mem("ws1", "owner")]),
};
const env = (principal, cid = "corr:1", rid = "req:1") =>
  makeEnvelope({ principal, correlation_id: cid, plane: "private_terminal", occurred_at: "2026-07-22T00:00:00.000Z", request_id: rid });
const res = tenantResource("ws1");

// ---- role sets --------------------------------------------------------------
test("the domain verbs map to the documented RLS role sets", () => {
  assert.deepEqual(REVIEW_ROLES, ["owner", "admin", "reviewer"]);
  assert.deepEqual(APPROVE_ROLES, ["owner", "admin"]);
  assert.deepEqual(PROMOTE_ROLES, ["owner", "admin", "operator"]);
});

// ---- authorizeThrough: the verb truth table --------------------------------
test("review: owner/admin/reviewer allowed; operator/viewer/outsider refused", () => {
  for (const r of ["owner", "admin", "reviewer"]) {
    assert.equal(authorizeThrough(env(P[r]()), "review", res).allowed, true, `${r} may review`);
  }
  assert.equal(authorizeThrough(env(P.operator()), "review", res).reason, "missing_role", "operator is a member but not review-capable");
  assert.equal(authorizeThrough(env(P.viewer()), "review", res).reason, "missing_role");
  assert.equal(authorizeThrough(env(P.outsider()), "review", res).reason, "not_member", "an outsider is not a member of ws1");
});

test("approve is the governance gate: owner/admin only (operator/reviewer refused)", () => {
  assert.equal(authorizeThrough(env(P.owner()), "approve", res).allowed, true);
  assert.equal(authorizeThrough(env(P.admin()), "approve", res).allowed, true);
  assert.equal(authorizeThrough(env(P.operator()), "approve", res).allowed, false);
  assert.equal(authorizeThrough(env(P.reviewer()), "approve", res).allowed, false);
});

test("promote is the tenant-write set: owner/admin/operator (reviewer/viewer refused)", () => {
  for (const r of ["owner", "admin", "operator"]) {
    assert.equal(authorizeThrough(env(P[r]()), "promote", res).allowed, true, `${r} may promote`);
  }
  assert.equal(authorizeThrough(env(P.reviewer()), "promote", res).allowed, false);
  assert.equal(authorizeThrough(env(P.viewer()), "promote", res).allowed, false);
});

test("decide is review-grade (owner/admin/reviewer), matching the proposal gate", () => {
  assert.equal(authorizeThrough(env(P.reviewer()), "decide", res).allowed, true);
  assert.equal(authorizeThrough(env(P.operator()), "decide", res).allowed, false);
});

test("plain verbs (read/write/update/admin) pass straight to the permission engine", () => {
  // operator may INSERT (write) but not UPDATE — the engine's owner/admin split.
  assert.equal(authorizeThrough(env(P.operator()), "write", res).allowed, true);
  assert.equal(authorizeThrough(env(P.operator()), "update", res).allowed, false);
  assert.equal(authorizeThrough(env(P.operator()), "admin", res).allowed, false);
  assert.equal(authorizeThrough(env(P.owner()), "admin", res).allowed, true);
});

test("the service role bypasses the contract everywhere (like RLS)", () => {
  assert.equal(authorizeThrough(env(P.service()), "approve", res).reason, "service_role_bypass");
  assert.equal(authorizeThrough(env(P.service()), "promote", planeResource("shared_market", "public", null)).allowed, true);
});

test("an agent principal (no auth.uid) is refused a domain verb — no write it cannot read", () => {
  assert.equal(authorizeThrough(env(P.agent()), "promote", res).reason, "unauthenticated");
  assert.equal(authorizeThrough(env(P.agent()), "review", res).reason, "unauthenticated");
});

test("authorization is deterministic (byte-identical repeats)", () => {
  const a = authorizeThrough(env(P.operator()), "promote", res);
  const b = authorizeThrough(env(P.operator()), "promote", res);
  assert.equal(JSON.stringify(a), JSON.stringify(b));
});

// ---- guard: authorize FIRST, then delegate ---------------------------------
test("guard on DENY returns a typed refusal and NEVER runs the delegate", () => {
  let ran = 0;
  const r = guard(env(P.reviewer(), "corr:9", "req:9"), "promote", res, () => { ran++; return "did"; });
  assert.equal(r.ok, false);
  assert.equal(isRefused(r), true);
  assert.equal(r.refusal.refused, true);
  assert.equal(r.refusal.action, "promote");
  assert.equal(r.refusal.reason, "missing_role");
  assert.equal(r.refusal.correlation_id, "corr:9", "refusal carries the request correlation id");
  assert.equal(r.refusal.request_id, "req:9");
  assert.equal(ran, 0, "authorize-FIRST: the delegate must not run on deny");
});

test("guard on ALLOW runs the delegate exactly once and wraps its value", () => {
  let ran = 0;
  const r = guard(env(P.operator()), "promote", res, () => { ran++; return { id: "wi_1" }; });
  assert.equal(r.ok, true);
  assert.deepEqual(r.value, { id: "wi_1" });
  assert.equal(ran, 1);
});

test("refusalFrom builds an auditable refusal from a denied decision + envelope", () => {
  const e = env(P.outsider(), "corr:x", "req:x");
  const decision = authorizeThrough(e, "review", res);
  const refusal = refusalFrom(e, "review", decision);
  assert.equal(refusal.refused, true);
  assert.equal(refusal.action, "review");
  assert.equal(refusal.reason, "not_member");
  assert.equal(refusal.correlation_id, "corr:x");
  assert.equal(refusal.request_id, "req:x");
});

// ---- resource helpers -------------------------------------------------------
test("tenantResource / planeResource build the plane-aware shape the engine keys off", () => {
  assert.deepEqual(tenantResource("ws1"), { plane: "private_terminal", visibility: "tenant_private", workspace_id: "ws1" });
  assert.deepEqual(planeResource("shared_market", "public", null), { plane: "shared_market", visibility: "public", workspace_id: null });
});

// ---- canReview retirement: the shim's boolean now COMES FROM the engine ------
test("canReview is retired to a shim whose decision comes from the permission engine", () => {
  // Matches the REVIEW role set exactly (owner/admin/reviewer), decided by writeTenantDecision.
  assert.equal(canReview("owner"), true);
  assert.equal(canReview("admin"), true);
  assert.equal(canReview("reviewer"), true);
  assert.equal(canReview("operator"), false, "operator is not review-capable — the engine says so, not an OR");
  assert.equal(canReview("viewer"), false);
});
