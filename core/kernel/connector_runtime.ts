// core/kernel/connector_runtime.ts
//
// Kernel — CONNECTOR RUNTIME (Kernel Volume II, RFC-2011 Connector Runtime;
// Volume IX Connector Registry). The generic executor that RUNS a connector: it
// authorizes the run, acquires (with retry / backoff / circuit-breaker), drives
// the connector's PURE parser to normalize, detects changes, scores quality,
// derives health, and emits a correlated {@link KernelEvent} + {@link CostEntry}
// for every run — returning the typed {@link ConnectorOutputContract}.
//
// SEPARATION OF POWERS (RFC-2011). "Connectors acquire. The Truth Service
// validates. The Kernel orchestrates. The Connector Runtime never decides
// business meaning." This module is the KERNEL's orchestration: it never parses
// (the connector's job) and never tiers/validates (the truth service's job). It
// only runs the lifecycle and enforces the guarantees — normalize but never
// interpret, no silent failures, health observable, events emitted, audit
// complete (RFC-2011 §Acceptance Criteria).
//
// AUTHORIZED + CORRELATED (RFC-2001/2002/2014). A run takes exactly one
// {@link RequestEnvelope}; it AUTHORIZES FIRST through the permission engine and,
// on deny, returns a typed {@link Refusal} (never a throw). Shared-market
// ingestion writes to the shared_market plane, which is governable by NO
// authenticated user — only the platform SERVICE role — the same load-bearing
// 0017 invariant the governed registry enforces. Every event/cost the run emits
// carries `env.correlation_id`, so the whole run stitches to the originating
// request on the kernel spine.
//
// SECRETS STAY OUT (RFC-2011 §Security). The connector receives only an injected
// {@link AcquireContext}; it holds no credentials. Rate limiting / scheduling /
// retry are the RUNTIME's, never the connector's.
//
// PURE / DETERMINISTIC. No clock, no random, no real sleeps. Ids/instants are
// injected (envelope + idGen); retries are modeled as ATTEMPT COUNTS + emitted
// events, not wall-clock delays (a real scheduler inserts the backoff). Same
// inputs + same injected acquire behavior → byte-identical output + event log.
//
// ERASABLE-ONLY TS: no enums, no parameter properties, no namespaces; `import
// type` for type-only imports. Safe under `node` native type-stripping.

import type { RequestEnvelope } from "@/core/kernel/envelope";
import { envelopeActor } from "@/core/kernel/envelope";
import type { Refusal } from "@/core/kernel/contracts";
import { authorizeThrough, refusalFrom, planeResource } from "@/core/kernel/contracts";
import { EventBus, makeEvent, type KernelEvent } from "@/core/kernel/event_bus";
import { CostLedger, type CostEntry } from "@/core/kernel/cost_ledger";
import type {
  ConnectorDefinition,
  ConnectorOutputContract,
  ConnectorRunStatus,
  NormalizedRecord,
  RecordRejection,
  EntityCandidate,
  RelationshipCandidate,
  SourceArtifact,
  ChangeEvent,
  RunMetrics,
} from "@/core/kernel/connector_sdk";
import {
  buildQualityReport,
  detectChanges,
  tallyChanges,
  deriveHealth,
  recordHash,
} from "@/core/kernel/connector_sdk";
import type { SourceRegistryEntry } from "@/core/registry/types";

// ---------------------------------------------------------------------------
// Event types (RFC-2011 §Runtime Events) — the connector lifecycle on the bus
// ---------------------------------------------------------------------------

export const CONNECTOR_EVENTS = {
  started: "connector.started",
  normalization_completed: "connector.normalization_completed",
  changes_detected: "connector.changes_detected",
  retry_started: "connector.retry_started",
  failed: "connector.failed",
} as const;

// ---------------------------------------------------------------------------
// Retry / circuit-breaker policy (deterministic: counts, not wall-clock delays)
// ---------------------------------------------------------------------------

/**
 * Failure policy for a run (RFC-2011 §Failure Handling). `max_attempts` bounds
 * the acquire retries; `circuit_breaker_threshold` is the consecutive-failure
 * count at/above which the runtime SHORT-CIRCUITS a run to offline WITHOUT
 * attempting acquire (protecting a struggling source). Backoff is a scheduler
 * concern; here we model the schedule as attempt counts + emitted events so the
 * run stays deterministic.
 */
export interface RetryPolicy {
  max_attempts: number;
  circuit_breaker_threshold: number;
}

export const DEFAULT_RETRY: RetryPolicy = { max_attempts: 3, circuit_breaker_threshold: 5 };

// ---------------------------------------------------------------------------
// Run dependencies (all effects injected; nothing dialed here)
// ---------------------------------------------------------------------------

/** The kernel spine + injected state a run needs. Everything optional but idGen. */
export interface ConnectorRunDeps {
  /** Deterministic id generator for emitted events (caller-injected). */
  idGen: () => string;
  /** Publish lifecycle events here (also returned on the result). */
  bus?: EventBus;
  /** Record the run's cost here (also returned on the result). */
  ledger?: CostLedger;
  /** Prior external_ref → content_hash map for change detection (last run's state). */
  prior?: Map<string, string> | Record<string, string>;
  /** Consecutive failure count carried ACROSS runs (drives circuit-breaker + health). */
  consecutiveFailures?: number;
  /** Failure policy; defaults to {@link DEFAULT_RETRY}. */
  retry?: RetryPolicy;
  /** USD per connector acquire attempt (a connector-category cost). Default 0.0. */
  costPerAttempt?: number;
}

/** The run request: which connector, its source manifest, and the envelope. */
export interface ConnectorRunRequest<Raw> {
  connector: ConnectorDefinition<Raw>;
  source: SourceRegistryEntry;
  env: RequestEnvelope;
}

/** The result of a run: the output contract + the emitted events/costs, or a refusal. */
export type ConnectorRunResult =
  | { ok: true; output: ConnectorOutputContract; events: KernelEvent[]; cost_entries: CostEntry[] }
  | { ok: false; refusal: Refusal };

// ---------------------------------------------------------------------------
// The executor
// ---------------------------------------------------------------------------

/**
 * Execute a connector run end-to-end. AUTHORIZE FIRST (shared-market write =
 * service-role-only); acquire with retry + circuit-breaker; run the connector's
 * pure parser to normalize; detect changes vs the prior state; score quality;
 * derive health; emit correlated lifecycle events + a connector CostEntry; return
 * the {@link ConnectorOutputContract}. Never throws for a connector fault — a
 * failed acquire yields a `failed` output with offline health, not an exception.
 */
export async function runConnector<Raw>(
  req: ConnectorRunRequest<Raw>,
  deps: ConnectorRunDeps,
): Promise<ConnectorRunResult> {
  const { connector, source, env } = req;
  const idGen = deps.idGen;
  const retry = deps.retry ?? DEFAULT_RETRY;
  const priorFailures = deps.consecutiveFailures ?? 0;
  const bus = deps.bus;
  const ledger = deps.ledger;
  const emitted: KernelEvent[] = [];
  const costs: CostEntry[] = [];
  const actor = envelopeActor(env);

  const emit = (type: string, payload: Record<string, unknown>): void => {
    const e = makeEvent({
      id: idGen(),
      type,
      correlation_id: env.correlation_id,
      actor,
      plane: env.plane,
      occurred_at: env.occurred_at,
      payload,
    });
    emitted.push(e);
    if (bus) bus.publish(e);
  };

  // ---- 1. AUTHORIZE FIRST. A connector run writes to the SOURCE's plane; a
  //         shared-market write is service-role-only (0017 §8) — a non-service
  //         principal is refused BEFORE anything is acquired.
  const resource = planeResource(source.default_plane, source.default_visibility, null);
  const decision = authorizeThrough(env, "write", resource);
  if (!decision.allowed) {
    return { ok: false, refusal: refusalFrom(env, "write", decision) };
  }

  // ---- 2. CIRCUIT BREAKER. If the source has failed too many times in a row,
  //         short-circuit to offline WITHOUT touching it (protect the source).
  if (priorFailures >= retry.circuit_breaker_threshold) {
    const health = deriveHealth(0, priorFailures, true, true);
    emit(CONNECTOR_EVENTS.failed, {
      connector_key: connector.connector_key,
      source_key: source.key,
      reason: "circuit_open",
      consecutive_failures: priorFailures,
    });
    const output = failedOutput(connector, source, env, health, 0, 0);
    recordCost(costs, ledger, idGen(), env, actor, 0, deps.costPerAttempt ?? 0);
    return { ok: true, output, events: emitted, cost_entries: costs };
  }

  emit(CONNECTOR_EVENTS.started, {
    connector_key: connector.connector_key,
    source_key: source.key,
  });

  // ---- 3. ACQUIRE with retry. Deterministic: each failed attempt emits a
  //         retry_started event; no wall-clock sleeps (the scheduler inserts them).
  let acquired: Awaited<ReturnType<typeof connector.acquire>> | undefined;
  let attempts = 0;
  let retries = 0;
  let lastError: unknown;
  for (let attempt = 1; attempt <= Math.max(1, retry.max_attempts); attempt++) {
    attempts = attempt;
    try {
      acquired = await connector.acquire({ correlation_id: env.correlation_id, occurred_at: env.occurred_at });
      break;
    } catch (err) {
      lastError = err;
      if (attempt < retry.max_attempts) {
        retries += 1;
        emit(CONNECTOR_EVENTS.retry_started, {
          connector_key: connector.connector_key,
          source_key: source.key,
          attempt,
          next_attempt: attempt + 1,
          reason: errString(err),
        });
      }
    }
  }

  // ---- 3b. ACQUIRE FAILED after all attempts → a `failed` output (NOT an
  //          exception, and NO deletions: we cannot tell a fetch failure from a
  //          real deletion, so we never fabricate change events on failure).
  if (acquired === undefined) {
    const health = deriveHealth(0, priorFailures + 1, true);
    emit(CONNECTOR_EVENTS.failed, {
      connector_key: connector.connector_key,
      source_key: source.key,
      reason: errString(lastError),
      attempts,
    });
    const output = failedOutput(connector, source, env, health, attempts, retries);
    recordCost(costs, ledger, idGen(), env, actor, attempts, deps.costPerAttempt ?? 0);
    return { ok: true, output, events: emitted, cost_entries: costs };
  }

  // ---- 4. NORMALIZE. Drive the connector's PURE parser per raw payload; a raw
  //         that throws becomes a REJECTION (no silent drop), never a crash.
  const records: NormalizedRecord[] = [];
  const rejections: RecordRejection[] = [];
  let totalSeen = 0;
  for (let i = 0; i < acquired.records.length; i++) {
    const raw = acquired.records[i];
    try {
      const parsed = connector.parse(raw, { source });
      for (const rec of parsed) {
        totalSeen += 1;
        records.push(rec);
      }
    } catch (err) {
      totalSeen += 1;
      rejections.push({ external_ref: rawRef(raw), reason: errString(err) });
    }
  }

  // ---- 5. AGGREGATE candidates, artifacts, change events, quality, health, metrics.
  const entity_candidates: EntityCandidate[] = [];
  const relationship_candidates: RelationshipCandidate[] = [];
  for (const rec of records) {
    if (rec.entity_candidates) entity_candidates.push(...rec.entity_candidates);
    if (rec.relationship_candidates) relationship_candidates.push(...rec.relationship_candidates);
  }
  const source_artifacts: SourceArtifact[] = (acquired.source_artifacts ?? []).map((a) => ({
    ...a,
    content_hash: a.content_hash ?? (a.raw_text != null ? recordHashOfText(a.raw_text) : undefined),
  }));

  // A rejected ref was SEEN at the source (it just failed to normalize) — pass it
  // as "also present" so a per-record parse failure is NEVER fabricated as a
  // deletion. (The load-bearing "no fabricated deletion from a failure" rule.)
  const rejectedRefs = rejections
    .map((r) => r.external_ref)
    .filter((r): r is string => typeof r === "string");
  const change_events: ChangeEvent[] = detectChanges(records, deps.prior, rejectedRefs);
  const changes = tallyChanges(change_events);
  const quality_report = buildQualityReport(records, rejections, totalSeen);
  const successRate = totalSeen === 0 ? 1 : quality_report.parsed_records / totalSeen;
  const status: ConnectorRunStatus = rejections.length === 0 ? "success" : "partial";
  const health = deriveHealth(successRate, status === "success" ? 0 : priorFailures, false);

  const metrics: RunMetrics = {
    records_in: totalSeen,
    observations_out: records.length,
    artifacts_captured: source_artifacts.length,
    attempts,
    retries,
    changes,
  };

  emit(CONNECTOR_EVENTS.normalization_completed, {
    connector_key: connector.connector_key,
    source_key: source.key,
    observations: records.length,
    rejected: rejections.length,
    completeness: quality_report.completeness,
  });
  if (change_events.length > 0) {
    emit(CONNECTOR_EVENTS.changes_detected, {
      connector_key: connector.connector_key,
      source_key: source.key,
      new: changes.new,
      updated: changes.updated,
      deleted: changes.deleted,
      unchanged: changes.unchanged,
    });
  }
  recordCost(costs, ledger, idGen(), env, actor, attempts, deps.costPerAttempt ?? 0);

  const output: ConnectorOutputContract = {
    connector_key: connector.connector_key,
    source_key: source.key,
    correlation_id: env.correlation_id,
    status,
    observations: records,
    entity_candidates,
    relationship_candidates,
    source_artifacts,
    change_events,
    quality_report,
    health,
    metrics,
  };
  return { ok: true, output, events: emitted, cost_entries: costs };
}

/** Build the current external_ref → content_hash map from a run's output (feed the next run's `prior`). */
export function stateFromOutput(output: ConnectorOutputContract): Map<string, string> {
  const m = new Map<string, string>();
  for (const rec of output.observations) m.set(rec.external_ref, recordHash(rec));
  return m;
}

// ---------------------------------------------------------------------------
// internals
// ---------------------------------------------------------------------------

function failedOutput<Raw>(
  connector: ConnectorDefinition<Raw>,
  source: SourceRegistryEntry,
  env: RequestEnvelope,
  health: ReturnType<typeof deriveHealth>,
  attempts: number,
  retries: number,
): ConnectorOutputContract {
  return {
    connector_key: connector.connector_key,
    source_key: source.key,
    correlation_id: env.correlation_id,
    status: "failed",
    observations: [],
    entity_candidates: [],
    relationship_candidates: [],
    source_artifacts: [],
    change_events: [], // never fabricate deletions on failure
    quality_report: {
      total_records: 0,
      parsed_records: 0,
      rejected_records: 0,
      rejections: [],
      duplicate_refs: [],
      completeness: 1,
    },
    health,
    metrics: {
      records_in: 0,
      observations_out: 0,
      artifacts_captured: 0,
      attempts,
      retries,
      changes: { new: 0, updated: 0, deleted: 0, unchanged: 0 },
    },
  };
}

function recordCost(
  costs: CostEntry[],
  ledger: CostLedger | undefined,
  id: string,
  env: RequestEnvelope,
  actor: string,
  units: number,
  usdPerUnit: number,
): void {
  const entry: CostEntry = {
    id,
    correlation_id: env.correlation_id,
    category: "connector",
    label: "connector_run",
    units,
    usd: units * usdPerUnit,
    actor,
    occurred_at: env.occurred_at,
  };
  costs.push(entry);
  if (ledger) ledger.record(entry);
}

function errString(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}

/**
 * Best-effort stable external ref for a raw payload that failed to parse — used
 * only to LABEL a rejection. Reads GENERIC identifiers only: core/ names no
 * vertical noun (a connector whose raw keys its ref differently should surface it
 * from the parser). A rejection with no derivable ref is still counted + reported
 * (its `external_ref` is simply undefined) — never silently dropped.
 */
function rawRef(raw: unknown): string | undefined {
  if (raw && typeof raw === "object") {
    const r = raw as Record<string, unknown>;
    for (const k of ["external_ref", "source_ref", "ref", "id"]) {
      const v = r[k];
      if (typeof v === "string") return v;
    }
  }
  return undefined;
}

function recordHashOfText(text: string): string {
  // Reuse the SDK's deterministic hash for artifact integrity of inline text.
  return recordHash({ external_ref: "artifact", value: { text } });
}
