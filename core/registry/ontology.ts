// core/registry/ontology.ts
//
// Volume XI — Canonical Ontology (ADR-0014). The ontology layer enriches the
// Object Registry's canonical classes (core/registry/objects.ts) with the
// operational knowledge the roadmap calls for: relationships, lifecycle,
// KPIs, required documents, and connectors — per object.
//
// It is ADDITIVE config-as-data: ontology packs (core/registry/data/ontology/*)
// attach to catalog classes by `schema_ref`; the 341-class catalog and its loader
// are untouched. Nothing here is a vertical fork — packs are domain knowledge the
// engine reads as data. Relationship targets are catalog schema_refs, so the graph
// is closed and checkable.

import { getObjectClass, type ObjectClassEntry } from "@/core/registry/objects";
import creditUnion from "@/core/registry/data/ontology/credit_union.json";
import lendingDeposits from "@/core/registry/data/ontology/lending_deposits.json";
import capitalMarkets from "@/core/registry/data/ontology/capital_markets.json";
import innovationEcosystem from "@/core/registry/data/ontology/innovation_ecosystem.json";
import compliance from "@/core/registry/data/ontology/compliance.json";
import regulation from "@/core/registry/data/ontology/regulation.json";
import technologyVendor from "@/core/registry/data/ontology/technology_vendor.json";
import ai from "@/core/registry/data/ontology/ai.json";

// ---------------------------------------------------------------------------
// Ontology shape (the per-object knowledge record)
// ---------------------------------------------------------------------------

export interface ObjectRelationship {
  /** e.g. "regulated_by" | "serves" | "offers" | "files" | "employs". */
  predicate: string;
  /** schema_ref of the related canonical class (a closed reference). */
  target: string;
  cardinality?: "one" | "many";
  description?: string;
}

export interface LifecycleState {
  key: string;
  label: string;
  terminal?: boolean;
}
export interface LifecycleTransition {
  from: string;
  to: string;
  /** The event/condition that drives the transition. */
  on?: string;
}
export interface ObjectLifecycle {
  initial: string;
  states: LifecycleState[];
  transitions: LifecycleTransition[];
}

export interface ObjectKPI {
  key: string;
  label: string;
  /** Plain-language or symbolic formula. */
  formula?: string;
  unit?: string;
  /** Threshold/benchmark note, e.g. ">= 7% well-capitalized". */
  threshold?: string;
}

export interface RequiredDocument {
  key: string;
  label: string;
  required?: boolean;
}

export interface ObjectConnectorRef {
  /** Connector registry key, e.g. "connector:core_banking". */
  key: string;
  label?: string;
  role?: "system_of_record" | "ingest" | "enrichment";
}

export interface ObjectOntology {
  /** schema_ref of the canonical class this enriches. */
  object: string;
  label?: string;
  relationships?: ObjectRelationship[];
  lifecycle?: ObjectLifecycle;
  kpis?: ObjectKPI[];
  required_documents?: RequiredDocument[];
  connectors?: ObjectConnectorRef[];
  notes?: string;
}

export interface OntologyPack {
  key: string;
  label: string;
  version: number;
  domain: string;
  ontologies: ObjectOntology[];
}

// ---------------------------------------------------------------------------
// Loaded packs (add new domain packs here as they are authored)
// ---------------------------------------------------------------------------

const PACKS: OntologyPack[] = [
  creditUnion as unknown as OntologyPack,
  lendingDeposits as unknown as OntologyPack,
  capitalMarkets as unknown as OntologyPack,
  innovationEcosystem as unknown as OntologyPack,
  compliance as unknown as OntologyPack,
  regulation as unknown as OntologyPack,
  technologyVendor as unknown as OntologyPack,
  ai as unknown as OntologyPack,
];

const BY_OBJECT = new Map<string, ObjectOntology>();
for (const p of PACKS) for (const o of p.ontologies) BY_OBJECT.set(o.object, o);

export function ontologyPacks(): OntologyPack[] {
  return PACKS;
}
export function listOntologies(): ObjectOntology[] {
  return [...BY_OBJECT.values()];
}
export function getObjectOntology(schemaRef: string): ObjectOntology | undefined {
  return BY_OBJECT.get(schemaRef);
}

/** A catalog class joined with its ontology enrichment (if any). */
export interface EnrichedObjectClass extends ObjectClassEntry {
  ontology?: ObjectOntology;
}
export function getEnrichedObjectClass(schemaRef: string): EnrichedObjectClass | undefined {
  const cls = getObjectClass(schemaRef);
  if (!cls) return undefined;
  return { ...cls, ontology: BY_OBJECT.get(schemaRef) };
}

/**
 * Every object referenced by a loaded ontology — the enriched object itself plus
 * all relationship targets. Used for closed-graph integrity checks (every entry
 * should resolve via getObjectClass).
 */
export function ontologyReferencedObjects(): string[] {
  const refs = new Set<string>();
  for (const o of BY_OBJECT.values()) {
    refs.add(o.object);
    for (const r of o.relationships ?? []) refs.add(r.target);
  }
  return [...refs];
}
