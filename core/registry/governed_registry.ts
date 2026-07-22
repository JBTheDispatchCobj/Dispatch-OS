// core/registry/governed_registry.ts
//
// GOVERNED Object Registry (Kernel Volume II RFC-2001/2014 × Volume X RFC-2003).
// The seam that routes a registry WRITE or MERGE THROUGH a kernel contract so it
// is authorized, correlated, and observable — without rewriting the pure
// ObjectRegistryService or its persistence port.
//
// AUTHORIZE-FIRST (the contract discipline). Every governed mutation goes through
// {@link guard}: authorization is evaluated FIRST from the permission engine; on
// DENY a typed {@link Refusal} is returned (never a throw) and the service
// mutation NEVER runs; on ALLOW the mutation runs exactly once. A MERGE is an
// `admin` action on the SURVIVING object — and because registry objects are the
// SHARED-MARKET identity index (workspace_id null), app_can_admin_object grants it
// to NO authenticated user: a shared-market registry merge is SERVICE-ROLE-ONLY,
// exactly as 0017 §8 + core/kernel/permissions.authorizeMerge require.
//
// CORRELATED + OBSERVABLE. The call carries a {@link RequestEnvelope}; every
// KernelEvent + CostEntry the governed mutation emits carries the envelope's
// correlation_id + actor, so a registry write stitches onto the kernel spine like
// any other request.
//
// SERIALIZED WRITE-CHAIN. When a live persistence client is present, each governed
// mutation's flush is appended to a single promise chain, so writes persist in
// CALL ORDER — a merge's flush can never race the register that precedes it. The
// synchronous return value (the CanonicalObject / MergeRecord) is available
// immediately from the in-memory snapshot; {@link drain} awaits the durable flush.
//
// DEFAULT STAYS IN-MEMORY. With no client, nothing dials a database — the write-
// chain is a no-op and the gate is green with no creds. This module imports NO
// database driver: it takes the narrow {@link RegistryTableClient} seam (a real
// @supabase/supabase-js client is adapted to it in core/data/supabase-table-client.ts).
//
// PURE-ADJACENT / DETERMINISM. Authorization is pure. Event + cost IDS are minted
// by an INJECTED idGen and timestamps come from the envelope — no Date.now / random —
// so a given call sequence yields an identical event/cost log.
//
// GENERIC / NO VERTICAL NOUNS. Canonical object, merge, plane, envelope — all
// universal. Nothing here names a vertical.
//
// ERASABLE-ONLY TS: no enums, no parameter properties, no namespaces; `import type`
// for type-only imports. Safe under `node` native type-stripping.

import type {
  CanonicalObject,
  CanonicalObjectInput,
  MergeRecord,
  RegistryPersistencePort,
} from "@/core/registry/service";
import { ObjectRegistryService } from "@/core/registry/service";
import type { RegistryTableClient } from "@/core/registry/supabase-store";
import { SupabaseRegistryStore } from "@/core/registry/supabase-store";
import type { RequestEnvelope } from "@/core/kernel/envelope";
import { envelopeActor } from "@/core/kernel/envelope";
import type { ContractResult } from "@/core/kernel/contracts";
import { guard, planeResource } from "@/core/kernel/contracts";
import { EventBus, makeEvent } from "@/core/kernel/event_bus";
import { CostLedger } from "@/core/kernel/cost_ledger";

// ---------------------------------------------------------------------------
// Construction
// ---------------------------------------------------------------------------

export interface GovernedRegistryOptions {
  /** The pure resolution/merge engine (unchanged). */
  service: ObjectRegistryService;
  /** The persistence port the service writes through (InMemory or Supabase-backed). */
  store: RegistryPersistencePort;
  /** Live persistence client. When present (and the store is Supabase-backed),
   *  governed writes are flushed on the serialized write-chain. */
  client?: RegistryTableClient;
  /** Optional kernel spine — the write correlates onto it. */
  bus?: EventBus;
  ledger?: CostLedger;
  /** Injected id generator for emitted events/costs (no Math.random). */
  idGen: () => string;
  /** Injected instant fallback for a cost/event when the envelope lacks one (unused today). */
  now?: string;
}

/** The plane-aware resource a registry object presents for authorization. Registry
 *  objects are the shared-market identity index and carry no tenant workspace. */
function objectResource(o: {
  plane: CanonicalObject["plane"];
  visibility: CanonicalObject["visibility"];
}) {
  return planeResource(o.plane, o.visibility, null);
}

// ---------------------------------------------------------------------------
// GovernedObjectRegistry
// ---------------------------------------------------------------------------

export class GovernedObjectRegistry {
  private service: ObjectRegistryService;
  private store: RegistryPersistencePort;
  private client?: RegistryTableClient;
  private bus?: EventBus;
  private ledger?: CostLedger;
  private idGen: () => string;
  /** The serialized write-chain — governed flushes run in call order. */
  private chain: Promise<void>;
  /** The first durable-flush error seen, if any (surfaced by drain). */
  private flushError?: unknown;

  constructor(opts: GovernedRegistryOptions) {
    this.service = opts.service;
    this.store = opts.store;
    this.client = opts.client;
    this.bus = opts.bus;
    this.ledger = opts.ledger;
    this.idGen = opts.idGen;
    this.chain = Promise.resolve();
  }

  /**
   * Register a canonical object THROUGH the contract. Authorizes "write" on the
   * object's plane/visibility resource FIRST (a shared-market registry write is
   * service-role; a tenant-scoped write needs owner/admin/operator on the
   * workspace), then registers, emits a correlated event + cost, and enqueues a
   * durable flush. On deny: a typed refusal, and nothing is written.
   */
  registerThrough(
    env: RequestEnvelope,
    input: CanonicalObjectInput,
    opts?: { workspace_id?: string | null },
  ): ContractResult<CanonicalObject> {
    const resource = planeResource(input.plane, input.visibility, opts?.workspace_id ?? null);
    const result = guard(env, "write", resource, () => {
      const obj = this.service.register(input);
      this.emit(env, "registry.object_registered", {
        object_id: obj.id,
        object_class: obj.object_class,
        canonical_slug: obj.canonical_slug,
        plane: obj.plane,
      });
      this.enqueueFlush();
      return obj;
    });
    return result;
  }

  /**
   * Apply an explicit merge THROUGH the contract. Authorizes "admin" on the
   * SURVIVING object FIRST (a shared-market registry object → service-role-only,
   * the load-bearing invariant), then applies the append-only merge via the
   * unchanged engine, emits a correlated event + cost, and enqueues a durable
   * flush. On deny: a typed refusal, and nothing is merged.
   */
  mergeThrough(
    env: RequestEnvelope,
    survivingId: string,
    mergedId: string,
    decisionRef?: string,
  ): ContractResult<MergeRecord> {
    const survivor = this.service.objects().find((o) => o.id === survivingId);
    // Authorize against the survivor's actual plane/visibility when known; else a
    // shared-market default (service-only), and let the engine surface an
    // unknown-id error to the (authorized) caller.
    const resource = survivor
      ? objectResource(survivor)
      : planeResource("shared_market", "public", null);
    return guard(env, "admin", resource, () => {
      const record = this.service.applyMerge(
        survivingId,
        mergedId,
        envelopeActor(env),
        decisionRef,
      );
      this.emit(env, "registry.objects_merged", {
        surviving_object_id: record.surviving_object_id,
        merged_object_id: record.merged_object_id,
        decision_ref: record.decision_ref ?? null,
      });
      this.enqueueFlush();
      return record;
    });
  }

  /**
   * Await every durable flush queued so far (the serialized write-chain). Resolves
   * immediately in the no-client / in-memory default. If ANY queued flush failed,
   * this rejects with the FIRST error so a caller/runner can surface it (the sync
   * return already succeeded) — while the chain itself is NOT poisoned: a failed
   * flush is caught so later governed writes still attempt to persist (mirrors the
   * catch-and-continue write-through in core/data/supabase-adapter.ts). The error
   * is sticky: once a durable write has failed, persisted state is known
   * inconsistent, so drain keeps surfacing it until the process is reconciled.
   */
  drain(): Promise<void> {
    return this.chain.then(() => {
      if (this.flushError !== undefined) throw this.flushError;
    });
  }

  // Convenience read-through to the underlying engine.
  objects(): CanonicalObject[] {
    return this.service.objects();
  }
  candidates() {
    return this.service.candidates();
  }
  merges(): MergeRecord[] {
    return this.service.merges();
  }

  // --- internals ------------------------------------------------------------

  /** Append this mutation's durable flush to the serialized write-chain. A flush
   *  error is captured (first-wins) rather than poisoning the chain, so later
   *  governed writes still attempt to persist; drain() surfaces the error. */
  private enqueueFlush(): void {
    if (!this.client) return;
    if (!(this.store instanceof SupabaseRegistryStore)) return;
    const store = this.store;
    const client = this.client;
    this.chain = this.chain
      .then(() => store.flush(client))
      .catch((e) => {
        if (this.flushError === undefined) this.flushError = e;
      });
  }

  /** Emit a correlated KernelEvent (if a bus is wired) + a CostEntry (if a ledger
   *  is wired). Both carry the envelope's correlation_id + actor. */
  private emit(env: RequestEnvelope, type: string, payload: Record<string, unknown>): void {
    const actor = envelopeActor(env);
    if (this.bus) {
      this.bus.publish(
        makeEvent({
          id: this.idGen(),
          type,
          correlation_id: env.correlation_id,
          actor,
          plane: env.plane,
          occurred_at: env.occurred_at,
          payload,
        }),
      );
    }
    if (this.ledger) {
      this.ledger.record({
        id: this.idGen(),
        correlation_id: env.correlation_id,
        category: "tool",
        label: type,
        units: 1,
        usd: 0,
        actor,
        occurred_at: env.occurred_at,
      });
    }
  }
}
