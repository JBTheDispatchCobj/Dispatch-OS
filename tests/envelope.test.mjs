// tests/envelope.test.mjs — Kernel request envelope (RFC-2001/2014): the typed
// request context carried through a service contract. Pure/deterministic — the
// caller injects every id/timestamp; the envelope reads no clock and mints no id.
import { test } from "node:test";
import assert from "node:assert/strict";
import { register } from "node:module";
register("../scripts/alias-hook.mjs", import.meta.url);

const { makeEnvelope, deriveEnvelope, envelopeActor } = await import("@/core/kernel/envelope");
const { userPrincipal, agentPrincipal, systemPrincipal } = await import("@/core/kernel/identity");

const owner = () => userPrincipal("u_owner", [{ workspace_id: "ws1", organization_id: "org", role: "owner" }]);
const base = (over = {}) => ({
  principal: owner(),
  correlation_id: "corr:1",
  plane: "private_terminal",
  occurred_at: "2026-07-22T00:00:00.000Z",
  request_id: "req:1",
  ...over,
});

test("makeEnvelope is a pure copy — deterministic and frozen (no clock/id minting)", () => {
  const e1 = makeEnvelope(base());
  const e2 = makeEnvelope(base());
  assert.equal(JSON.stringify(e1), JSON.stringify(e2), "identical init → identical envelope");
  assert.equal(Object.isFrozen(e1), true, "the envelope is frozen");
  assert.equal(e1.correlation_id, "corr:1");
  assert.equal(e1.plane, "private_terminal");
  assert.equal(e1.occurred_at, "2026-07-22T00:00:00.000Z");
  assert.equal(e1.request_id, "req:1");
});

test("idempotency_key is omitted when absent, carried when present (stable serialization)", () => {
  const without = makeEnvelope(base());
  assert.equal("idempotency_key" in without, false, "absent key is not set to undefined");
  const withKey = makeEnvelope(base({ idempotency_key: "idem:9" }));
  assert.equal(withKey.idempotency_key, "idem:9");
  // Two envelopes differing only by an absent key serialize identically to one another's base.
  assert.equal(JSON.stringify(without), JSON.stringify(makeEnvelope(base())));
});

test("deriveEnvelope keeps the correlation id but takes a fresh injected request id", () => {
  const parent = makeEnvelope(base());
  const child = deriveEnvelope(parent, { request_id: "req:2", occurred_at: "2026-07-22T00:00:05.000Z" });
  assert.equal(child.correlation_id, parent.correlation_id, "child stays in the same request chain");
  assert.equal(child.request_id, "req:2");
  assert.notEqual(child.request_id, parent.request_id);
  assert.equal(child.occurred_at, "2026-07-22T00:00:05.000Z");
  assert.equal(child.principal, parent.principal, "principal inherited by default");
  assert.equal(child.plane, parent.plane, "plane inherited by default");
});

test("deriveEnvelope can override the plane (e.g. a shared-market sub-step)", () => {
  const parent = makeEnvelope(base());
  const child = deriveEnvelope(parent, { request_id: "req:3", occurred_at: parent.occurred_at, plane: "shared_market" });
  assert.equal(child.plane, "shared_market");
  assert.equal(child.correlation_id, parent.correlation_id);
});

test("deriveEnvelope threads an injected idempotency_key onto the child", () => {
  const parent = makeEnvelope(base());
  const child = deriveEnvelope(parent, { request_id: "req:9", occurred_at: parent.occurred_at, idempotency_key: "idem:1" });
  assert.equal(child.idempotency_key, "idem:1", "the child carries the caller-injected idempotency key");
});

test("envelopeActor mirrors the principal's actor string (user / agent / service)", () => {
  assert.equal(envelopeActor(makeEnvelope(base())), "user:u_owner");
  assert.equal(envelopeActor(makeEnvelope(base({ principal: agentPrincipal("run7", []) }))), "agent:run7");
  assert.equal(envelopeActor(makeEnvelope(base({ principal: systemPrincipal() }))), "system");
});
