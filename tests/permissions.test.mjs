// tests/permissions.test.mjs — Permission engine (RFC-2002): the in-process mirror
// of the 0016/0017 RLS predicates, with teeth on every row of the truth table.
import { test } from "node:test";
import assert from "node:assert/strict";
import { register } from "node:module";
register("../scripts/alias-hook.mjs", import.meta.url);

const {
  authorize, can, canReadPlane, canWriteTenant,
  readPlaneDecision, writeTenantDecision,
  canReadObject, canWriteObject, canAdminObject, adminObjectDecision, authorizeMerge,
  TENANT_WRITE_ROLES, TENANT_UPDATE_ROLES, IO_WRITE_ROLES, ADMIN_ROLES,
} = await import("@/core/kernel/permissions");
const { userPrincipal, agentPrincipal, systemPrincipal } = await import("@/core/kernel/identity");

const mem = (workspace_id, role) => ({ workspace_id, organization_id: "org", role });
const owner = () => userPrincipal("u_owner", [mem("ws1", "owner")]);
const operator = () => userPrincipal("u_op", [mem("ws1", "operator")]);
const reviewer = () => userPrincipal("u_rev", [mem("ws1", "reviewer")]);
const outsider = () => userPrincipal("u_out", [mem("ws2", "owner")]);
const svc = () => systemPrincipal();

const res = (plane, visibility, workspace_id) => ({ plane, visibility, workspace_id });

// ---- app_can_read_plane truth table ----------------------------------------
test("read: public is readable by any authenticated user, on any plane", () => {
  assert.equal(canReadPlane(operator(), res("private_terminal", "public", null)), true);
  assert.equal(readPlaneDecision(operator(), res("shared_market", "public", null)).reason, "public_read");
});

test("read: shared_market + network is readable by any authenticated user", () => {
  assert.equal(canReadPlane(reviewer(), res("shared_market", "network", null)), true);
  // network on a NON-shared-market plane is NOT the network-market path.
  assert.equal(canReadPlane(reviewer(), res("private_terminal", "network", null)), false);
});

test("read: tenant_private is member-only; non-members and null-workspace denied", () => {
  assert.equal(canReadPlane(operator(), res("private_terminal", "tenant_private", "ws1")), true);
  assert.equal(readPlaneDecision(operator(), res("private_terminal", "tenant_private", "ws1")).reason, "tenant_member");
  assert.equal(canReadPlane(outsider(), res("private_terminal", "tenant_private", "ws1")), false);
  assert.equal(readPlaneDecision(outsider(), res("private_terminal", "tenant_private", "ws1")).reason, "not_member");
  // fail-closed: a tenant-visibility row with no workspace is denied to users.
  assert.equal(readPlaneDecision(operator(), res("private_terminal", "tenant_private", null)).reason, "no_tenant");
});

test("read: an unauthenticated (agent) principal is denied; the service role bypasses", () => {
  assert.equal(readPlaneDecision(agentPrincipal("r", []), res("shared_market", "public", null)).reason, "unauthenticated");
  // service bypass is only via authorize() (the RLS-bypass layer), not the bare predicate.
  assert.equal(authorize(svc(), "read", res("private_terminal", "tenant_private", "ws1")).reason, "service_role_bypass");
  assert.equal(can(svc(), "read", res("private_terminal", "tenant_private", "ws_any")), true);
});

// ---- app_can_write_tenant truth table --------------------------------------
test("write(insert): owner/admin/operator on their workspace; reviewer cannot", () => {
  assert.deepEqual(TENANT_WRITE_ROLES, ["owner", "admin", "operator"]);
  assert.equal(can(operator(), "write", res("private_terminal", "tenant_private", "ws1")), true);
  assert.equal(writeTenantDecision(operator(), "ws1", TENANT_WRITE_ROLES).reason, "tenant_role:operator");
  assert.equal(can(reviewer(), "write", res("private_terminal", "tenant_private", "ws1")), false);
  assert.equal(writeTenantDecision(reviewer(), "ws1", TENANT_WRITE_ROLES).reason, "missing_role");
  assert.equal(writeTenantDecision(outsider(), "ws1", TENANT_WRITE_ROLES).reason, "not_member");
  // shared-market (null workspace) falls through to the service role — no user write.
  assert.equal(writeTenantDecision(owner(), null, TENANT_WRITE_ROLES).reason, "no_tenant");
});

test("update: owner/admin only — operator is refused (teeth vs insert)", () => {
  assert.deepEqual(TENANT_UPDATE_ROLES, ["owner", "admin"]);
  assert.equal(can(owner(), "update", res("private_terminal", "tenant_private", "ws1")), true);
  assert.equal(can(operator(), "update", res("private_terminal", "tenant_private", "ws1")), false,
    "operator may INSERT but not UPDATE — the engine must distinguish the two role sets");
});

test("write: an agent principal (no auth.uid) is denied write EVEN with a membership", () => {
  // Consistency invariant: an agent is unauthenticated for READS, so it must also be
  // unauthenticated for WRITES — a principal must never be able to write a row it
  // cannot read. Agents needing platform reach run as the service role; agents acting
  // for a user carry that user's Principal.
  const agentMember = agentPrincipal("run1", [mem("ws1", "owner")]);
  assert.equal(readPlaneDecision(agentMember, res("private_terminal", "tenant_private", "ws1")).reason, "unauthenticated");
  assert.equal(writeTenantDecision(agentMember, "ws1", TENANT_WRITE_ROLES).reason, "unauthenticated",
    "an agent must not gain a write it cannot pair with a read");
  assert.equal(can(agentMember, "write", res("private_terminal", "tenant_private", "ws1")), false);
});

test("write verb models the COMMON set; intelligence-object inserts are owner/admin (IO exception)", () => {
  // The generic authorize("write") uses owner/admin/operator (matches app_can_write_object).
  assert.deepEqual(TENANT_WRITE_ROLES, ["owner", "admin", "operator"]);
  assert.equal(can(operator(), "write", res("private_terminal", "tenant_private", "ws1")), true);
  // The IO exception (0016 io_write) is owner/admin only — operator excluded.
  assert.deepEqual(IO_WRITE_ROLES, ["owner", "admin"]);
  assert.equal(writeTenantDecision(operator(), "ws1", IO_WRITE_ROLES).reason, "missing_role",
    "IO inserts (0016 io_write) are owner/admin — operator is not eligible");
});

test("write: the service role bypasses tenant write everywhere", () => {
  assert.equal(can(svc(), "write", res("shared_market", "public", null)), true);
  assert.equal(can(svc(), "update", res("private_terminal", "tenant_private", "ws1")), true);
  assert.equal(can(svc(), "admin", res("private_terminal", "tenant_private", "ws1")), true);
});

// ---- app_can_admin_object / governed merge (0017 §8) -----------------------
test("admin(merge/split): owner/admin only; operator refused", () => {
  assert.deepEqual(ADMIN_ROLES, ["owner", "admin"]);
  const tenantObj = { plane: "private_terminal", visibility: "tenant_private", workspace_id: "ws1" };
  assert.equal(canAdminObject(owner(), tenantObj), true);
  assert.equal(canAdminObject(operator(), tenantObj), false, "governance is owner/admin, not operator");
  assert.equal(adminObjectDecision(operator(), tenantObj).reason, "missing_role");
});

test("admin: a SHARED-MARKET object is governable by NO authenticated user — only the service role", () => {
  // The load-bearing 0017 invariant: app_can_admin_object needs a workspace, so a
  // shared-market registry object (workspace_id null) can be merged only by the platform.
  const sharedObj = { plane: "shared_market", visibility: "public", workspace_id: null };
  assert.equal(canAdminObject(owner(), sharedObj), false);
  assert.equal(authorizeMerge(owner(), sharedObj).reason, "no_tenant");
  assert.equal(authorizeMerge(svc(), sharedObj).allowed, true);
  assert.equal(authorizeMerge(svc(), sharedObj).reason, "service_role_bypass");
});

test("registry read/write helpers mirror app_can_read_object / app_can_write_object", () => {
  const sharedObj = { plane: "shared_market", visibility: "public", workspace_id: null };
  assert.equal(canReadObject(reviewer(), sharedObj), true, "public shared-market object is readable");
  assert.equal(canWriteObject(operator(), { plane: "private_terminal", visibility: "tenant_private", workspace_id: "ws1" }), true);
  assert.equal(canWriteObject(operator(), sharedObj), false, "shared-market write is service-role only");
});

test("every decision carries a machine-readable reason (lineage, not a bare boolean)", () => {
  const d = authorize(operator(), "read", res("private_terminal", "tenant_private", "ws1"));
  assert.equal(typeof d.reason, "string");
  assert.ok(d.reason.length > 0);
  assert.equal(typeof d.allowed, "boolean");
});
