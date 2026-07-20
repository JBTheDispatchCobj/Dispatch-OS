// core/registry/objects.ts
//
// The Object Registry loader — projects the Financial Services object catalog
// (config-as-data, core/registry/data/financial_services_objects.json) into the
// running system. The JSON governs; this module is the typed accessor over it.
//
// Two projections matter:
//   * financialServicesEntityTypes()  -> EntityType[] a package installs, so the
//     341 canonical classes become live entity_types (entity_type_key = schema_ref).
//   * financialServicesObjectRegistryEntries() -> ObjectRegistryEntry[] the DKR
//     reads (the Object Registry manifest, DKR / core/registry/types.ts).
//
// Nothing here is a vertical fork: it is the shared Financial Services taxonomy
// that cartridges (e.g. cooperative_markets) install on top of and extend. The
// per-object `registry_object_class` in metadata is the exact value migration
// `0017` registers into object_registry.object_class.

import type { EntityType } from "@/core/types";
import type { ObjectRegistryEntry } from "@/core/registry/types";
import catalog from "@/core/registry/data/financial_services_objects.json";

// ---------------------------------------------------------------------------
// Typed view over the JSON (resolveJsonModule gives an untyped literal).
// ---------------------------------------------------------------------------

export interface ObjectFamily {
  code: string;
  key: string;
  name: string;
  slug: string;
  attributes: string[];
  class_count: number;
}

export interface ObjectClassMetadata {
  family_code: string;
  family_key: string;
  /** The value migration 0017 registers into object_registry.object_class. */
  registry_object_class: string;
  attributes: string[];
  shared_label?: boolean;
}

export interface ObjectClassEntry {
  key: string;
  label: string;
  version: number;
  status: string;
  domain: string;
  object_class: string;
  schema_ref: string;
  cartridge_key: string;
  metadata: ObjectClassMetadata;
}

export interface ObjectCatalog {
  key: string;
  label: string;
  version: number;
  status: string;
  domain_of: string;
  notes: string;
  universal_fields: string[];
  families: ObjectFamily[];
  objects: ObjectClassEntry[];
}

const CATALOG = catalog as unknown as ObjectCatalog;

/** Package key the Financial Services taxonomy installs under ("financial_services"). */
export const FINANCIAL_SERVICES_CARTRIDGE_KEY: string = CATALOG.domain_of;

const BY_KEY = new Map(CATALOG.objects.map((o) => [o.key, o]));
const BY_SCHEMA = new Map(CATALOG.objects.map((o) => [o.schema_ref, o]));

// ---------------------------------------------------------------------------
// Read accessors
// ---------------------------------------------------------------------------

export function objectCatalog(): ObjectCatalog {
  return CATALOG;
}
export function listObjectFamilies(): ObjectFamily[] {
  return CATALOG.families;
}
export function listObjectClasses(): ObjectClassEntry[] {
  return CATALOG.objects;
}
export function universalObjectFields(): string[] {
  return CATALOG.universal_fields;
}
/** Look up a class by its registry key or its entity_type schema_ref. */
export function getObjectClass(keyOrSchemaRef: string): ObjectClassEntry | undefined {
  return BY_KEY.get(keyOrSchemaRef) ?? BY_SCHEMA.get(keyOrSchemaRef);
}

// ---------------------------------------------------------------------------
// Projections into the running system
// ---------------------------------------------------------------------------

/**
 * The 341 canonical classes as EntityType[] the engine installs. entity_type_key
 * = schema_ref ("financial_services:<family>:<slug>"); the family attribute list
 * becomes the context_hint (the fields each object's `context` is expected to carry).
 */
export function financialServicesEntityTypes(): EntityType[] {
  return CATALOG.objects.map((o) => ({
    key: o.schema_ref,
    cartridge_key: o.cartridge_key,
    label: o.label,
    context_hint: o.metadata.attributes.join(", "),
  }));
}

/** The Object Registry manifest entries (DKR ObjectRegistryEntry-shaped). */
export function financialServicesObjectRegistryEntries(): ObjectRegistryEntry[] {
  return CATALOG.objects.map((o) => ({
    key: o.key,
    label: o.label,
    version: o.version,
    status: o.status as ObjectRegistryEntry["status"],
    domain: o.domain,
    object_class: o.object_class as ObjectRegistryEntry["object_class"],
    schema_ref: o.schema_ref,
    cartridge_key: o.cartridge_key,
    metadata: o.metadata as unknown as Record<string, unknown>,
  }));
}
