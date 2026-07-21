// core/kernel/event_bus.ts
//
// Dispatch OS — Kernel Volume II, RFC-2004 Event Bus.
//
// The in-memory event spine of the kernel. Every meaningful thing that happens
// in the OS can be published here as a {@link KernelEvent}; interpreters,
// automations, ledgers, and dashboards subscribe. This is the generic,
// cartridge-blind nervous system — meaning still attaches through `type`,
// `payload`, and the actor/correlation convention, never through a vertical
// concept named here.
//
// DETERMINISM RULE (CLAUDE.md / RFC-2004): the bus itself calls neither
// Date.now() nor Math.random(). Ids and timestamps are the CALLER's
// responsibility and are carried on the event, so a given input sequence
// always produces an identical, replayable log. The bus only appends, fans
// out, and (on handler failure) captures — it never mutates an event.
//
// Actor convention mirrors core: "user:<id>" | "agent:<run_id>" | "system".

import type { Plane } from "@/core/truth/types";

// ---------------------------------------------------------------------------
// The event envelope
// ---------------------------------------------------------------------------

/**
 * A single thing that happened, in a plane-aware, correlated, attributable
 * envelope. `T` is the shape of the domain-specific `payload`.
 *
 *   id             — caller-supplied, deterministic, unique within a log.
 *   type           — event key, e.g. "work_item.status_changed".
 *   correlation_id — groups events belonging to one causal chain / run.
 *   actor          — "user:<id>" | "agent:<run_id>" | "system".
 *   plane          — which plane this happened on, when meaningful.
 *   occurred_at    — caller-supplied ISO-8601 timestamp (observed-time).
 *   schema_version — envelope version, currently 1.
 *   payload        — the domain payload, typed by the publisher.
 */
export interface KernelEvent<T = Record<string, unknown>> {
  id: string;
  type: string;
  correlation_id: string;
  actor: string;
  plane?: Plane;
  occurred_at: string;
  schema_version: number;
  payload: T;
}

/** A subscriber. Handlers must not throw to signal control flow; a throw is
 *  captured to the dead-letter queue and does not stop other handlers. */
export type EventHandler<T = Record<string, unknown>> = (
  e: KernelEvent<T>,
) => void;

/** A record of a handler that threw while processing an event. */
export interface DeadLetter {
  event: KernelEvent;
  /** The subscribed type, or null for a subscribeAll handler. */
  subscribed_type: string | null;
  /** The thrown value, coerced to Error where possible. */
  error: unknown;
}

/** Optional filter for {@link EventBus.history}. All clauses are ANDed. */
export interface HistoryFilter {
  type?: string;
  correlation_id?: string;
  actor?: string;
  plane?: Plane;
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

/** Fields the caller must supply to {@link makeEvent}; schema_version is filled. */
export type MakeEventFields<T> = Omit<KernelEvent<T>, "schema_version"> & {
  /** Optional explicit override; defaults to 1. */
  schema_version?: number;
};

/**
 * Build a {@link KernelEvent}, defaulting `schema_version` to 1. The caller
 * still supplies `id` and `occurred_at` — the kernel never invents them, so
 * event construction stays deterministic and replayable.
 */
export function makeEvent<T = Record<string, unknown>>(
  fields: MakeEventFields<T>,
): KernelEvent<T> {
  return {
    schema_version: 1,
    ...fields,
  };
}

// ---------------------------------------------------------------------------
// The bus
// ---------------------------------------------------------------------------

/**
 * In-memory, append-only event bus. Not concurrency-safe by design (single
 * runtime, deterministic ordering). Handlers are invoked synchronously in
 * subscription order: type-specific handlers first, then subscribeAll handlers.
 */
export class EventBus {
  private readonly log: KernelEvent[] = [];
  private readonly typeHandlers = new Map<string, Set<EventHandler<never>>>();
  private readonly allHandlers = new Set<EventHandler<never>>();
  private readonly dead: DeadLetter[] = [];

  /**
   * Append `event` to the log and fan it out to matching subscribers. A
   * handler that throws is captured into the dead-letter queue and does NOT
   * prevent remaining handlers from running, nor is the throw re-raised.
   */
  publish<T>(event: KernelEvent<T>): void {
    this.log.push(event as KernelEvent);

    const typed = this.typeHandlers.get(event.type);
    if (typed) {
      for (const handler of typed) {
        this.dispatch(handler, event as KernelEvent, event.type);
      }
    }
    for (const handler of this.allHandlers) {
      this.dispatch(handler, event as KernelEvent, null);
    }
  }

  /**
   * Subscribe to a single event `type`. Returns an unsubscribe function that
   * removes exactly this handler registration.
   */
  subscribe<T = Record<string, unknown>>(
    type: string,
    handler: EventHandler<T>,
  ): () => void {
    let set = this.typeHandlers.get(type);
    if (!set) {
      set = new Set();
      this.typeHandlers.set(type, set);
    }
    const erased = handler as EventHandler<never>;
    set.add(erased);
    return () => {
      const current = this.typeHandlers.get(type);
      if (current) {
        current.delete(erased);
        if (current.size === 0) this.typeHandlers.delete(type);
      }
    };
  }

  /** Subscribe to every event regardless of type. Returns an unsubscribe fn. */
  subscribeAll<T = Record<string, unknown>>(
    handler: EventHandler<T>,
  ): () => void {
    const erased = handler as EventHandler<never>;
    this.allHandlers.add(erased);
    return () => {
      this.allHandlers.delete(erased);
    };
  }

  /**
   * The append-only log, optionally filtered. Returns a shallow copy so callers
   * cannot mutate internal state. All filter clauses are ANDed.
   */
  history(filter?: HistoryFilter): KernelEvent[] {
    if (!filter) return this.log.slice();
    return this.log.filter((e) => {
      if (filter.type !== undefined && e.type !== filter.type) return false;
      if (
        filter.correlation_id !== undefined &&
        e.correlation_id !== filter.correlation_id
      ) {
        return false;
      }
      if (filter.actor !== undefined && e.actor !== filter.actor) return false;
      if (filter.plane !== undefined && e.plane !== filter.plane) return false;
      return true;
    });
  }

  /**
   * Return the slice of the log AFTER the event whose id is `fromEventId`
   * (exclusive), optionally narrowed to a single `type`. When `fromEventId`
   * is omitted the whole log is considered. If `fromEventId` is not found,
   * an empty array is returned (nothing is known to come "after" it).
   */
  replay(fromEventId?: string, type?: string): KernelEvent[] {
    let slice: KernelEvent[];
    if (fromEventId === undefined) {
      slice = this.log.slice();
    } else {
      const idx = this.log.findIndex((e) => e.id === fromEventId);
      slice = idx === -1 ? [] : this.log.slice(idx + 1);
    }
    return type === undefined ? slice : slice.filter((e) => e.type === type);
  }

  /** The dead-letter queue: handler failures captured during publish. Copy. */
  deadLetters(): DeadLetter[] {
    return this.dead.slice();
  }

  private dispatch(
    handler: EventHandler<never>,
    event: KernelEvent,
    subscribedType: string | null,
  ): void {
    try {
      (handler as EventHandler)(event);
    } catch (error) {
      this.dead.push({
        event,
        subscribed_type: subscribedType,
        error,
      });
    }
  }
}
