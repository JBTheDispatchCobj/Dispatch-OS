// core/registry/candidate_bridge.ts
//
// The CONNECTOR → OBJECT REGISTRY bridge (Volume IX Connector Registry × Volume X
// Object Registry; RFC-2011 × RFC-3002). A generic, pure mapping from the
// connector SDK's {@link EntityCandidate} (what a parser SURFACED alongside a
// normalized record) into a {@link CanonicalObjectInput} the Object Registry
// service can register. This is the seam by which NORMALIZED connector output
// feeds the shared-market identity index — still PROPOSE-ONLY downstream (the
// resolver proposes duplicates; a human merges; nothing auto-merges here).
//
// SEPARATION OF POWERS (RFC-2011). A connector NORMALIZES and SURFACES candidates;
// it never registers, resolves, or merges. This bridge is the caller's (cartridge/
// runtime orchestration) explicit step to hand a surfaced candidate to the
// registry — the connector stays a translator.
//
// UNIVERSALITY (CLAUDE.md): core/, so NO vertical noun. An `EntityCandidate` is a
// generic SDK primitive (object_class + name + external ids); a
// `CanonicalObjectInput` is a generic registry primitive. Meaning attaches only
// through the caller's field data. The same bridge carries a credit union, a bank,
// an innovation company, or a regulation.
//
// PLANE FROM THE CALLER, NEVER GUESSED. A candidate carries no plane/visibility
// (those belong to the SOURCE manifest, not the parser). The caller injects the
// plane/visibility the candidate's source declares — mirroring how
// `recordToObservation` reads them from the source manifest, never the connector.
//
// PURE / DETERMINISTIC: no clock, no random, no I/O. `candidateToObjectInput` is a
// pure function of its inputs; identity (id/created_at) is assigned later by the
// registry service (which the caller injects ids into).
//
// ERASABLE-ONLY TS: no enums, no parameter properties, no namespaces; `import type`
// for type-only imports. Safe under `node` native type-stripping.

import type { EntityCandidate } from "@/core/kernel/connector_sdk";
import type { CanonicalObjectInput, ExternalId } from "@/core/registry/service";
import type { Plane, Visibility } from "@/core/truth/types";

/** The plane/visibility a candidate's SOURCE declares (injected by the caller). */
export interface CandidateScope {
  plane: Plane;
  visibility: Visibility;
}

/** Deterministic blocking slug: lowercase, non-alphanumeric → "_", trimmed. */
export function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}

/**
 * Map ONE connector {@link EntityCandidate} → a {@link CanonicalObjectInput}. The
 * canonical_slug is the candidate's own slug when present, else a deterministic
 * slug of the display name (the registry's blocking key). Every external id a
 * candidate surfaced is carried through as an IDENTIFYING id (a candidate's surfaced
 * id — a CIK, an NCUA charter, an FDIC CERT — is a real identity key; the SDK
 * EntityCandidate carries no non-identifying flag). Aliases are carried through.
 * Plane/visibility come from the injected scope (the source manifest), never
 * invented here. PURE.
 */
export function candidateToObjectInput(
  candidate: EntityCandidate,
  scope: CandidateScope,
): CanonicalObjectInput {
  const canonical_slug =
    candidate.canonical_slug && candidate.canonical_slug.length > 0
      ? candidate.canonical_slug
      : slugify(candidate.display_name);
  const external_ids: ExternalId[] = (candidate.external_ids ?? []).map((e) => ({
    system: e.system,
    value: e.value,
  }));
  return {
    object_class: candidate.object_class,
    canonical_slug,
    display_name: candidate.display_name,
    plane: scope.plane,
    visibility: scope.visibility,
    storage: "external", // a connector-surfaced candidate lives at its external source until merged
    external_ids: external_ids.length > 0 ? external_ids : undefined,
    aliases: candidate.aliases && candidate.aliases.length > 0 ? candidate.aliases.slice() : undefined,
  };
}

/**
 * Map a batch of {@link EntityCandidate}s → {@link CanonicalObjectInput}s under one
 * source scope, preserving order (deterministic). No dedup/merge here — that is the
 * resolver's PROPOSE-only job. Pure.
 */
export function candidatesToObjectInputs(
  candidates: EntityCandidate[],
  scope: CandidateScope,
): CanonicalObjectInput[] {
  return candidates.map((c) => candidateToObjectInput(c, scope));
}
