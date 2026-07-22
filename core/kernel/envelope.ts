// core/kernel/envelope.ts
//
// Kernel REQUEST ENVELOPE (Kernel Volume II; RFC-2001 Kernel API, RFC-2014 Kernel
// API & Service Contracts). The typed context every request carries THROUGH a
// service contract: WHO is acting (a {@link Principal}), the correlation id that
// ties every emitted event/cost back to the originating request, the plane the
// call operates on, and caller-injected ids/timestamps.
//
// WHY IT EXISTS. Before this, a surface imported an engine directly and passed a
// loose bag of args; authorization had no principal, and events/costs correlated
// only by whatever id a caller happened to thread through. The envelope makes the
// request context a FIRST-CLASS, TYPED value: a contract method takes exactly one
// envelope, authorizes the envelope's principal FIRST, then runs the engine with
// the envelope's correlation_id so the kernel spine (event_bus / cost_ledger)
// stitches the whole call together (event.correlation_id == env.correlation_id).
//
// PURITY / DETERMINISM (load-bearing). The envelope reads NO clock and mints NO
// ids. `occurred_at` and `request_id` are INJECTED by the caller — exactly like
// the pipeline's RunContext and the truth layer's injected instants — so a
// contract call is reproducible and testable. `makeEnvelope` only copies/freezes.
//
// GENERIC / NO VERTICAL NOUNS. Principal, correlation, plane, request id — all
// universal kernel primitives. Nothing here names a vertical concept.
//
// ERASABLE-ONLY TS: no enums, no parameter properties, no namespaces; type-only
// imports use `import type`. Safe under `node` native type-stripping.

import type { Principal } from "@/core/kernel/identity";
import { actorString } from "@/core/kernel/identity";
import type { Plane } from "@/core/truth/types";

// ---------------------------------------------------------------------------
// The envelope
// ---------------------------------------------------------------------------

/**
 * The typed context carried THROUGH a service-contract call (RFC-2001/2014).
 *
 *   principal       — WHO is acting; authorization reasons over this (RFC-2002).
 *   correlation_id  — the id every event/cost the call emits must carry, so the
 *                     whole request correlates on the kernel spine. A child call
 *                     KEEPS this id (see {@link deriveEnvelope}).
 *   plane           — which plane (shared_market / private_terminal / control)
 *                     the call operates on.
 *   occurred_at     — caller-injected ISO instant (no clock read here).
 *   request_id      — caller-injected unique id for THIS request (idempotency /
 *                     audit); distinct from correlation_id, which spans a chain.
 *   idempotency_key — optional caller key so a retried write can be de-duped by a
 *                     persistence layer later (Wave 4); carried, never interpreted
 *                     here.
 */
export interface RequestEnvelope {
  principal: Principal;
  correlation_id: string;
  plane: Plane;
  occurred_at: string;
  request_id: string;
  idempotency_key?: string;
}

/** The fields a caller supplies to mint an envelope (all ids/timestamps injected). */
export interface EnvelopeInit {
  principal: Principal;
  correlation_id: string;
  plane: Plane;
  occurred_at: string;
  request_id: string;
  idempotency_key?: string;
}

/**
 * Construct a {@link RequestEnvelope}. Pure: it copies the given fields and
 * freezes the result — it does NOT read a clock or generate ids (the caller
 * injects `occurred_at` / `request_id` / `correlation_id`). `idempotency_key` is
 * omitted from the object when not supplied (kept optional, not set to
 * undefined) so two envelopes that differ only in an absent key serialize
 * identically.
 */
export function makeEnvelope(init: EnvelopeInit): RequestEnvelope {
  const env: RequestEnvelope = {
    principal: init.principal,
    correlation_id: init.correlation_id,
    plane: init.plane,
    occurred_at: init.occurred_at,
    request_id: init.request_id,
  };
  if (init.idempotency_key !== undefined) env.idempotency_key = init.idempotency_key;
  return Object.freeze(env);
}

/**
 * Derive a CHILD envelope for a downstream call in the same request chain. It
 * KEEPS the parent's `correlation_id` (so the child's events/costs still stitch
 * to the originating request) and `principal` + `plane` unless overridden, while
 * taking a FRESH caller-injected `request_id` (+ `occurred_at`). This is how a
 * contract that fans out to sub-steps keeps one correlation id across all of them
 * without a clock or an id generator inside the kernel.
 */
export function deriveEnvelope(
  parent: RequestEnvelope,
  next: { request_id: string; occurred_at: string; plane?: Plane; idempotency_key?: string },
): RequestEnvelope {
  return makeEnvelope({
    principal: parent.principal,
    correlation_id: parent.correlation_id,
    plane: next.plane ?? parent.plane,
    occurred_at: next.occurred_at,
    request_id: next.request_id,
    idempotency_key: next.idempotency_key,
  });
}

/**
 * The canonical actor string for the envelope's principal ("user:<id>" |
 * "agent:<id>" | "system"), for stamping provenance/audit on whatever the call
 * produces. Thin re-export of identity.actorString so a caller holding only an
 * envelope need not import identity.
 */
export function envelopeActor(env: RequestEnvelope): string {
  return actorString(env.principal);
}
