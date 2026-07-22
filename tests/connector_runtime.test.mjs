// tests/connector_runtime.test.mjs — Connector Runtime (RFC-2011): authorize-
// FIRST (shared-market = service-only), correlated event/cost, change detection,
// failure semantics (retry → failed, NO fabricated deletions), circuit breaker,
// partial normalization, determinism.
import { test } from "node:test";
import assert from "node:assert/strict";
import { register } from "node:module";
register("../scripts/alias-hook.mjs", import.meta.url);

const { runConnector, stateFromOutput, CONNECTOR_EVENTS } = await import("@/core/kernel/connector_runtime");
const { defineConnector } = await import("@/core/kernel/connector_sdk");
const { makeEnvelope } = await import("@/core/kernel/envelope");
const { systemPrincipal, userPrincipal } = await import("@/core/kernel/identity");
const { EventBus } = await import("@/core/kernel/event_bus");
const { CostLedger } = await import("@/core/kernel/cost_ledger");

const SOURCE = {
  key: "source:test", label: "Test", version: 1, status: "active", authority: "regulatory",
  default_plane: "shared_market", default_visibility: "public", default_tier: "public_fact",
};
const mem = (ws, role) => ({ workspace_id: ws, organization_id: "org", role });
const env = (principal, cid = "corr:run") =>
  makeEnvelope({ principal, correlation_id: cid, plane: "shared_market", occurred_at: "2026-07-22T00:00:00.000Z", request_id: "req:1" });

const okConnector = (records) =>
  defineConnector({
    connector_key: "connector:test", source_key: "source:test",
    acquire: () => ({ records }),
    parse: (raw) => [{ external_ref: raw.ref, value: { v: raw.v } }],
  });
const counter = (p) => { let n = 0; return () => `${p}:${n++}`; };

// ---- authorize FIRST --------------------------------------------------------
test("a non-service principal is REFUSED a shared-market ingestion run", async () => {
  const user = userPrincipal("u1", [mem("ws1", "owner")]);
  let acquired = false;
  const conn = defineConnector({
    connector_key: "c", source_key: "source:test",
    acquire: () => { acquired = true; return { records: [] }; },
    parse: () => [],
  });
  const res = await runConnector({ connector: conn, source: SOURCE, env: env(user) }, { idGen: counter("ev") });
  assert.equal(res.ok, false, "refused");
  assert.equal(res.refusal.reason, "no_tenant", "shared-market write is governable by no authenticated user");
  assert.equal(acquired, false, "authorize FIRST: acquire never ran");
});

test("the service role is allowed + the run correlates event + cost to the envelope", async () => {
  const bus = new EventBus();
  const ledger = new CostLedger();
  const res = await runConnector(
    { connector: okConnector([{ ref: "a", v: 1 }, { ref: "b", v: 2 }]), source: SOURCE, env: env(systemPrincipal(), "corr:x") },
    { idGen: counter("ev"), bus, ledger, costPerAttempt: 0.01 },
  );
  assert.equal(res.ok, true);
  assert.equal(res.output.status, "success");
  assert.equal(res.output.observations.length, 2);
  const started = bus.history({ type: CONNECTOR_EVENTS.started });
  assert.equal(started.length, 1);
  assert.equal(started[0].correlation_id, "corr:x", "events correlate to the envelope");
  assert.equal(ledger.byCorrelation("corr:x").entries.length, 1, "a connector CostEntry is recorded");
  assert.equal(ledger.byCategory().connector, 0.01, "cost = attempts × costPerAttempt");
});

// ---- change detection through the runtime -----------------------------------
test("a second run with prior state detects unchanged, then updated", async () => {
  const first = await runConnector({ connector: okConnector([{ ref: "a", v: 1 }]), source: SOURCE, env: env(systemPrincipal()) }, { idGen: counter("e1") });
  const prior = stateFromOutput(first.output);
  const same = await runConnector({ connector: okConnector([{ ref: "a", v: 1 }]), source: SOURCE, env: env(systemPrincipal()) }, { idGen: counter("e2"), prior });
  assert.deepEqual(same.output.metrics.changes, { new: 0, updated: 0, deleted: 0, unchanged: 1 });
  const changed = await runConnector({ connector: okConnector([{ ref: "a", v: 2 }]), source: SOURCE, env: env(systemPrincipal()) }, { idGen: counter("e3"), prior });
  assert.equal(changed.output.metrics.changes.updated, 1, "a changed value is an update");
});

// ---- failure semantics: retry → failed, no fabricated deletions -------------
test("acquire failure retries then yields a failed output (offline), no deletions", async () => {
  const bus = new EventBus();
  let calls = 0;
  const flaky = defineConnector({
    connector_key: "c", source_key: "source:test",
    acquire: () => { calls++; throw new Error("network down"); },
    parse: () => [],
  });
  const prior = new Map([["was_here", "abc123"]]);
  const res = await runConnector({ connector: flaky, source: SOURCE, env: env(systemPrincipal()) }, { idGen: counter("ev"), bus, prior, retry: { max_attempts: 3, circuit_breaker_threshold: 5 } });
  assert.equal(res.ok, true, "a connector fault is a value, not a throw");
  assert.equal(res.output.status, "failed");
  assert.equal(res.output.health.state, "offline");
  assert.equal(calls, 3, "retried up to max_attempts");
  assert.equal(res.output.metrics.retries, 2, "2 retries between 3 attempts");
  assert.equal(res.output.change_events.length, 0, "NEVER fabricate a deletion from a fetch failure");
  assert.equal(bus.history({ type: CONNECTOR_EVENTS.failed }).length, 1, "a failure event is emitted (no silent failure)");
});

test("succeeds on a later attempt within the retry budget", async () => {
  let calls = 0;
  const recovering = defineConnector({
    connector_key: "c", source_key: "source:test",
    acquire: () => { calls++; if (calls < 2) throw new Error("temporary"); return { records: [{ ref: "a", v: 1 }] }; },
    parse: (raw) => [{ external_ref: raw.ref, value: { v: raw.v } }],
  });
  const res = await runConnector({ connector: recovering, source: SOURCE, env: env(systemPrincipal()) }, { idGen: counter("ev") });
  assert.equal(res.output.status, "success");
  assert.equal(res.output.metrics.attempts, 2, "second attempt succeeded");
});

// ---- circuit breaker --------------------------------------------------------
test("the circuit breaker short-circuits without touching the source", async () => {
  let acquired = false;
  const conn = defineConnector({
    connector_key: "c", source_key: "source:test",
    acquire: () => { acquired = true; return { records: [] }; },
    parse: () => [],
  });
  const res = await runConnector(
    { connector: conn, source: SOURCE, env: env(systemPrincipal()) },
    { idGen: counter("ev"), consecutiveFailures: 5, retry: { max_attempts: 3, circuit_breaker_threshold: 5 } },
  );
  assert.equal(res.output.status, "failed");
  assert.equal(res.output.health.reason, "circuit_open");
  assert.equal(acquired, false, "an open circuit protects the source — acquire never runs");
});

// ---- partial normalization (a raw throws → rejection, not a crash) ----------
test("a record that fails to parse is a reported rejection (partial), never silent", async () => {
  const conn = defineConnector({
    connector_key: "c", source_key: "source:test",
    acquire: () => ({ records: [{ ref: "good", v: 1 }, { ref: "bad", v: 2 }] }),
    parse: (raw) => { if (raw.ref === "bad") throw new Error("cannot parse"); return [{ external_ref: raw.ref, value: { v: raw.v } }]; },
  });
  const res = await runConnector({ connector: conn, source: SOURCE, env: env(systemPrincipal()) }, { idGen: counter("ev") });
  assert.equal(res.output.status, "partial");
  assert.equal(res.output.observations.length, 1);
  assert.equal(res.output.quality_report.rejected_records, 1);
  assert.equal(res.output.quality_report.rejections[0].external_ref, "bad", "the rejected ref is surfaced");
  assert.equal(res.output.health.state, "degraded", "1/2 normalized = 0.5 success → degraded, not healthy");
});

test("a rejection whose ref is in prior state is NEVER fabricated as a deletion", async () => {
  // prior knows "bad"; this run acquires it but the parser throws on it → rejection.
  // A naive deletion computation over parsed records only would emit deleted:bad.
  const conn = defineConnector({
    connector_key: "c", source_key: "source:test",
    acquire: () => ({ records: [{ ref: "good", v: 1 }, { ref: "bad", v: 2 }] }),
    parse: (raw) => { if (raw.ref === "bad") throw new Error("cannot parse"); return [{ external_ref: raw.ref, value: { v: raw.v } }]; },
  });
  const prior = new Map([["good", "oldhash"], ["bad", "oldhash"]]);
  const res = await runConnector({ connector: conn, source: SOURCE, env: env(systemPrincipal()) }, { idGen: counter("ev"), prior });
  assert.equal(res.output.metrics.changes.deleted, 0, "a record that was SEEN but failed to normalize is not a deletion");
  assert.ok(!res.output.change_events.some((e) => e.kind === "deleted" && e.external_ref === "bad"), "'bad' must not appear as a deletion");
  assert.equal(res.output.quality_report.rejections[0].external_ref, "bad", "'bad' is reported as a rejection instead");
});

// ---- determinism ------------------------------------------------------------
test("the runtime is deterministic given the same inputs", async () => {
  const run = () => runConnector({ connector: okConnector([{ ref: "a", v: 1 }, { ref: "b", v: 2 }]), source: SOURCE, env: env(systemPrincipal(), "corr:d") }, { idGen: counter("ev") });
  const a = await run();
  const b = await run();
  assert.equal(JSON.stringify(a.output), JSON.stringify(b.output), "identical output contract");
});
