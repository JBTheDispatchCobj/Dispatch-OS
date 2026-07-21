// tests/identity.test.mjs — Identity & Tenancy (RFC-2002): portable cross-org identity.
import { test } from "node:test";
import assert from "node:assert/strict";
import { register } from "node:module";
register("../scripts/alias-hook.mjs", import.meta.url);

const {
  isAuthenticated, isMember, roleIn, hasRole,
  organizationsOf, workspacesOf, actorString,
  userPrincipal, agentPrincipal, systemPrincipal, SERVICE_PRINCIPAL, ROLE_RANK,
} = await import("@/core/kernel/identity");

const m = (workspace_id, organization_id, role) => ({ workspace_id, organization_id, role });

// A portable identity: one person, memberships in TWO orgs.
const bryan = () =>
  userPrincipal("u_bryan", [
    m("ws_a", "org_1", "owner"),
    m("ws_b", "org_1", "operator"),
    m("ws_c", "org_2", "reviewer"),
  ], "Bryan");

test("identity: only a user is authenticated (has an auth.uid())", () => {
  assert.equal(isAuthenticated(bryan()), true);
  assert.equal(isAuthenticated(agentPrincipal("run1", [])), false);
  assert.equal(isAuthenticated(systemPrincipal()), false);
});

test("identity: isMember mirrors app_is_member; service is never a member", () => {
  const p = bryan();
  assert.equal(isMember(p, "ws_a"), true);
  assert.equal(isMember(p, "ws_zzz"), false);
  assert.equal(isMember(SERVICE_PRINCIPAL, "ws_a"), false, "service bypasses, it does not join");
});

test("identity: roleIn returns the role, null when not a member, strongest on duplicates", () => {
  assert.equal(roleIn(bryan(), "ws_a"), "owner");
  assert.equal(roleIn(bryan(), "ws_c"), "reviewer");
  assert.equal(roleIn(bryan(), "ws_none"), null);
  // Duplicate membership edges in the same workspace -> strongest role wins.
  const dup = userPrincipal("u", [m("ws", "o", "viewer"), m("ws", "o", "admin")]);
  assert.equal(roleIn(dup, "ws"), "admin");
  assert.ok(ROLE_RANK.owner > ROLE_RANK.admin && ROLE_RANK.admin > ROLE_RANK.operator);
});

test("identity: hasRole is EXACT set membership (no privilege implication)", () => {
  const p = bryan();
  assert.equal(hasRole(p, "ws_a", ["owner", "admin"]), true);
  assert.equal(hasRole(p, "ws_b", ["owner", "admin"]), false, "operator is not owner/admin — exact match");
  assert.equal(hasRole(p, "ws_b", ["owner", "admin", "operator"]), true);
  assert.equal(hasRole(p, "ws_none", ["owner"]), false);
  assert.equal(hasRole(SERVICE_PRINCIPAL, "ws_a", ["owner"]), false);
});

test("identity: portable cross-org reach (distinct, sorted)", () => {
  assert.deepEqual(organizationsOf(bryan()), ["org_1", "org_2"]);
  assert.deepEqual(workspacesOf(bryan()), ["ws_a", "ws_b", "ws_c"]);
});

test("identity: actorString matches the provenance convention", () => {
  assert.equal(actorString(bryan()), "user:u_bryan");
  assert.equal(actorString(agentPrincipal("run7", [])), "agent:run7");
  assert.equal(actorString(systemPrincipal()), "system");
});
