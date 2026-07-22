// core/kernel/connector_sdk.ts
//
// Kernel — CONNECTOR SDK + OUTPUT CONTRACT (Kernel Volume II, RFC-2011 Connector
// Runtime; Volume IX Connector Registry). The typed surface a connector AUTHOR
// programs against, and the pure builders the runtime shares.
//
// PHILOSOPHY (RFC-2011). Connectors are TRANSLATORS, not decision engines:
//   "Connectors acquire. The Truth Service validates. The Kernel orchestrates.
//    The Connector Runtime never decides business meaning."
// A connector converts an external representation into Dispatch-native
// {@link NormalizedRecord}s — extracted fields / identifiers / dates /
// relationships / references / metadata, and NOTHING ELSE. It assigns NO truth
// tier, NO plane, NO confidence weight and reaches NO regulated/financial
// conclusion — those belong to the SOURCE config (its default tier/plane/
// visibility) and the truth service. "Normalization never creates Facts."
//
// GENERIC / NO VERTICAL NOUNS (CLAUDE.md). Everything here is a universal kernel
// primitive: record, parser, change event, quality report, health. Meaning
// attaches only through the caller's field data + the source manifest. The same
// SDK carries a 5300 filing, a regulation, a funding announcement, or a vendor
// status page.
//
// PURE / DETERMINISTIC (load-bearing). No file at this layer reads a clock or a
// random source. Content hashes are a deterministic FNV-1a over canonical JSON;
// ids/timestamps are INJECTED by the caller (mirrors envelope.ts / event_bus.ts
// / the truth layer). Same input → byte-identical output → a replayable run.
//
// ERASABLE-ONLY TS: no enums, no parameter properties, no namespaces; type-only
// imports use `import type`. Safe under `node` native type-stripping.

import type {
  Observation,
  Plane,
  Visibility,
  TruthTier,
  SourceDocument,
} from "@/core/truth/types";
import type { SourceRegistryEntry } from "@/core/registry/types";

// ===========================================================================
// 1. What a parser EXTRACTS — the normalized record (no tier, no plane, no weight)
// ===========================================================================

/** A candidate entity a parser surfaced (feeds the Object Registry resolver). */
export interface EntityCandidate {
  /** Object registry / entity_type key this candidate is an instance of. */
  object_class: string;
  display_name: string;
  canonical_slug?: string;
  /** Identifying external ids (e.g. an NCUA charter, an SEC CIK). */
  external_ids?: { system: string; value: string }[];
  aliases?: string[];
}

/** A candidate relationship a parser surfaced (NOT asserted — proposed). */
export interface RelationshipCandidate {
  type: string;
  from_ref: string;
  to_ref: string;
  metadata?: Record<string, unknown>;
}

/**
 * ONE normalized record a parser extracted from raw source content. This is the
 * connector's OUTPUT UNIT: Dispatch-native fields, no interpretation. The runtime
 * turns each into a truth {@link Observation} using the SOURCE's default tier/
 * plane/visibility — the connector never picks those.
 */
export interface NormalizedRecord {
  /** Stable external identifier WITHIN the source — the dedupe + change-detection key. */
  external_ref: string;
  /** What this record is about (entity / relationship / profile ref), when known. */
  subject_ref?: string;
  subject_type?: string;
  /** Machine-readable field being asserted, when this is a field-level record. */
  predicate?: string;
  /** The extracted value, typed by the consumer/cartridge. Never a conclusion. */
  value: Record<string, unknown>;
  /** Publisher's own issue/effective instants (valid-time), when the source carries them. */
  valid_from?: string | null;
  valid_to?: string | null;
  /** Candidates a parser surfaced alongside the record (proposed, never merged). */
  entity_candidates?: EntityCandidate[];
  relationship_candidates?: RelationshipCandidate[];
  metadata?: Record<string, unknown>;
}

// ===========================================================================
// 2. What a connector CAPTURES — the immutable raw artifact (→ SourceDocument)
// ===========================================================================

/**
 * A preserved raw artifact a connector retrieved (the bottom of the provenance
 * chain). The runtime maps it to a truth {@link SourceDocument}; the connector
 * only supplies what it actually captured.
 */
export interface SourceArtifact {
  /** Stable publisher identifier for the artifact (e.g. a filing id, a CFR ref). */
  external_ref: string;
  title?: string | null;
  content_type?: string | null;
  /** Inline raw/cleaned text when small enough to persist directly. */
  raw_text?: string | null;
  /** Pointer to the preserved raw artifact when not inlined (path/uri/object key). */
  raw_content_reference?: string | null;
  /** Publisher's own issue/publication date (observed-time vs valid-time). */
  published_at?: string | null;
  /** Deterministic integrity hash of the captured content. */
  content_hash?: string;
}

// ===========================================================================
// 3. Change detection, quality, health, metrics — the run's observability spine
// ===========================================================================

/** The four change outcomes the runtime identifies (RFC-2011 §Change Detection). */
export type ChangeKind = "new" | "updated" | "deleted" | "unchanged";

/** A single detected change. Change detection creates Events (RFC-2011). */
export interface ChangeEvent {
  external_ref: string;
  kind: ChangeKind;
  /** Content hash of the current record ("" for a deletion — nothing current). */
  content_hash: string;
  /** The prior hash this was compared against, when one existed. */
  prior_hash?: string;
}

/** One rejected record: what could not be normalized, and why (no silent drops). */
export interface RecordRejection {
  external_ref?: string;
  reason: string;
}

/**
 * The QUALITY of a run — a report, not a gate. Records that fail to normalize are
 * REPORTED (never silently dropped), duplicate external_refs are surfaced, and
 * completeness = parsed / total. Deterministic given the parser output.
 */
export interface QualityReport {
  total_records: number;
  parsed_records: number;
  rejected_records: number;
  rejections: RecordRejection[];
  duplicate_refs: string[];
  /** parsed_records / total_records in [0,1]; 1 when total is 0 (nothing to fault). */
  completeness: number;
}

/** Connector health states (RFC-2011 §Connector Health). Health affects scheduling. */
export type HealthState = "healthy" | "warning" | "degraded" | "offline";

/**
 * A connector's health after a run — derived DETERMINISTICALLY from the run's
 * success signal + the consecutive-failure count the caller carries across runs.
 */
export interface ConnectorHealth {
  state: HealthState;
  /** Records parsed / records seen in [0,1] (this run's normalization success). */
  success_rate: number;
  consecutive_failures: number;
  /** Machine-readable code, e.g. "ok" | "partial_normalization" | "run_failed" | "circuit_open". */
  reason: string;
}

/** Countable run metrics (RFC-2011 §Metrics). No wall-clock — counts only, deterministic. */
export interface RunMetrics {
  records_in: number;
  observations_out: number;
  artifacts_captured: number;
  attempts: number;
  retries: number;
  changes: Record<ChangeKind, number>;
}

/** Terminal status of a connector run. */
export type ConnectorRunStatus = "success" | "partial" | "failed";

// ===========================================================================
// 4. The CONNECTOR OUTPUT CONTRACT — every run emits exactly this
// ===========================================================================

/**
 * The typed contract EVERY connector run returns (RFC-2011 §Connector Output).
 * Normalized observations, entity/relationship candidates, captured source
 * artifacts, the change events, the quality report, the post-run health, run
 * metrics — plus the correlation id every emitted event/cost carries. It contains
 * NO truth Facts and NO regulated conclusion: normalized records only.
 */
export interface ConnectorOutputContract {
  connector_key: string;
  source_key: string;
  /** The kernel correlation id this run belongs to (== the run's envelope). */
  correlation_id: string;
  status: ConnectorRunStatus;
  /** Normalized records — the connector's output unit; NOT truth-tiered here. */
  observations: NormalizedRecord[];
  entity_candidates: EntityCandidate[];
  relationship_candidates: RelationshipCandidate[];
  source_artifacts: SourceArtifact[];
  change_events: ChangeEvent[];
  quality_report: QualityReport;
  health: ConnectorHealth;
  metrics: RunMetrics;
}

// ===========================================================================
// 5. What a connector AUTHOR writes — the ConnectorDefinition (the SDK seam)
// ===========================================================================

/** Context handed to a parser. Kept minimal + injected so parsing stays pure. */
export interface ParseContext {
  /** The source manifest, so a parser can read its declared keys — never its own logic. */
  source: SourceRegistryEntry;
}

/**
 * A PARSER is a pure function raw → normalized records (RFC-2011 §Parser
 * Responsibilities: extract fields/ids/dates/relationships/references/metadata,
 * "Nothing else."). No clock, no I/O, no business rule.
 */
export type ParserContract<Raw> = (raw: Raw, ctx: ParseContext) => NormalizedRecord[];

/** The result of ACQUIRE: the raw payloads + the immutable artifacts captured. */
export interface AcquireResult<Raw> {
  records: Raw[];
  source_artifacts?: SourceArtifact[];
}

/** Context handed to acquire (injected — the runtime never lets a connector hold secrets). */
export interface AcquireContext {
  correlation_id: string;
  /** Caller-injected instant the acquisition is stamped with (no clock in the connector). */
  occurred_at: string;
}

/**
 * A CONNECTOR DEFINITION — what an author writes against the SDK. It declares the
 * config keys it implements (`connector_key`/`source_key`, tying code to the
 * config-as-data manifest) and provides two pure/injected steps:
 *   - `acquire`  — return the raw payloads (+ captured artifacts). May be async
 *     (network), but is handed already-staged raw data in the deterministic path.
 *   - `parse`    — normalize raw → records. PURE.
 * Secrets never live here (RFC-2011 §Security): the runtime injects scoped context.
 */
export interface ConnectorDefinition<Raw> {
  connector_key: string;
  source_key: string;
  acquire: (ctx: AcquireContext) => AcquireResult<Raw> | Promise<AcquireResult<Raw>>;
  parse: ParserContract<Raw>;
}

/** Identity helper: freeze a definition so the registered connector can't mutate. */
export function defineConnector<Raw>(def: ConnectorDefinition<Raw>): ConnectorDefinition<Raw> {
  return Object.freeze({ ...def });
}

// ===========================================================================
// 6. PURE BUILDERS the runtime + connectors share (deterministic, testable)
// ===========================================================================

/** Stable, sorted-key JSON so two equal values serialize identically (hash input). */
export function stableStringify(value: unknown): string {
  return JSON.stringify(sortKeys(value));
}

function sortKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const k of Object.keys(value as Record<string, unknown>).sort()) {
      out[k] = sortKeys((value as Record<string, unknown>)[k]);
    }
    return out;
  }
  return value;
}

/**
 * A DETERMINISTIC content hash (FNV-1a, 32-bit, hex). No crypto/random — the same
 * value always hashes the same, so change detection + artifact integrity are
 * reproducible across processes. Not a security primitive; a stable fingerprint.
 */
export function canonicalHash(value: unknown): string {
  const s = typeof value === "string" ? value : stableStringify(value);
  let h = 0x811c9dc5; // FNV offset basis
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    // FNV prime multiply, kept in 32-bit via Math.imul.
    h = Math.imul(h, 0x01000193);
  }
  // Unsigned 32-bit, zero-padded hex.
  return (h >>> 0).toString(16).padStart(8, "0");
}

/** The content hash used for a record's change detection (its value, canonicalized). */
export function recordHash(rec: NormalizedRecord): string {
  // Hash the semantically meaningful payload (subject/predicate/value/validity),
  // NOT transient metadata, so an unchanged fact with new metadata reads unchanged.
  return canonicalHash({
    external_ref: rec.external_ref,
    subject_ref: rec.subject_ref ?? null,
    predicate: rec.predicate ?? null,
    value: rec.value,
    valid_from: rec.valid_from ?? null,
    valid_to: rec.valid_to ?? null,
  });
}

/**
 * Build the {@link QualityReport} for a run from the parsed records + any
 * rejections the parser surfaced. Duplicate external_refs are detected and
 * reported (a source that emits the same ref twice is a data-quality signal).
 */
export function buildQualityReport(
  records: NormalizedRecord[],
  rejections: RecordRejection[],
  totalSeen: number,
): QualityReport {
  const seen = new Set<string>();
  const dupes = new Set<string>();
  for (const r of records) {
    if (seen.has(r.external_ref)) dupes.add(r.external_ref);
    else seen.add(r.external_ref);
  }
  const total = totalSeen;
  const parsed = records.length;
  return {
    total_records: total,
    parsed_records: parsed,
    rejected_records: rejections.length,
    rejections: rejections.slice(),
    duplicate_refs: Array.from(dupes).sort(),
    completeness: total === 0 ? 1 : clamp01(parsed / total),
  };
}

/**
 * Detect changes by comparing the CURRENT records' hashes against a PRIOR
 * external_ref → hash map (RFC-2011 §Change Detection: New / Updated / Deleted /
 * No Changes). A ref present before but absent now is a DELETION. Deterministic:
 * emitted new/updated/unchanged in current order, then deletions in sorted order.
 *
 * `alsoPresentRefs` is the LOAD-BEARING guard against a fabricated deletion: refs
 * that WERE SEEN at the source this run but produced no current record (a record
 * that failed to NORMALIZE — a rejection). Such a ref is "seen but unparseable",
 * NOT "absent", so it must NEVER be treated as a deletion. Only a prior ref that
 * is in neither `records` NOR `alsoPresentRefs` is a genuine deletion.
 */
export function detectChanges(
  records: NormalizedRecord[],
  prior: Map<string, string> | Record<string, string> | undefined,
  alsoPresentRefs?: Iterable<string>,
): ChangeEvent[] {
  const priorMap =
    prior instanceof Map
      ? prior
      : new Map<string, string>(Object.entries(prior ?? {}));
  const events: ChangeEvent[] = [];
  const currentRefs = new Set<string>();
  for (const rec of records) {
    const hash = recordHash(rec);
    currentRefs.add(rec.external_ref);
    const priorHash = priorMap.get(rec.external_ref);
    if (priorHash === undefined) {
      events.push({ external_ref: rec.external_ref, kind: "new", content_hash: hash });
    } else if (priorHash !== hash) {
      events.push({ external_ref: rec.external_ref, kind: "updated", content_hash: hash, prior_hash: priorHash });
    } else {
      events.push({ external_ref: rec.external_ref, kind: "unchanged", content_hash: hash, prior_hash: priorHash });
    }
  }
  // Refs seen this run but not normalized (rejections) are PRESENT, not absent —
  // they can never be a deletion (never fabricate a deletion from a failure).
  const seen = new Set<string>(currentRefs);
  if (alsoPresentRefs) for (const ref of alsoPresentRefs) seen.add(ref);
  // Deletions: a prior ref present in NEITHER set. Sorted for a deterministic tail.
  const deleted = Array.from(priorMap.keys()).filter((ref) => !seen.has(ref)).sort();
  for (const ref of deleted) {
    events.push({ external_ref: ref, kind: "deleted", content_hash: "", prior_hash: priorMap.get(ref) });
  }
  return events;
}

/** Tally change events by kind (every kind key present, so consumers index safely). */
export function tallyChanges(events: ChangeEvent[]): Record<ChangeKind, number> {
  const t: Record<ChangeKind, number> = { new: 0, updated: 0, deleted: 0, unchanged: 0 };
  for (const e of events) t[e.kind] += 1;
  return t;
}

/**
 * Derive {@link ConnectorHealth} DETERMINISTICALLY from a run's success rate +
 * the consecutive-failure count carried across runs. A hard run failure is
 * "offline"; otherwise health degrades as normalization success drops:
 *   >= 0.99 → healthy · >= 0.9 → warning · > 0 → degraded · 0 → offline.
 */
export function deriveHealth(
  successRate: number,
  consecutiveFailures: number,
  runFailed: boolean,
  circuitOpen?: boolean,
): ConnectorHealth {
  const rate = clamp01(successRate);
  if (circuitOpen) {
    return { state: "offline", success_rate: rate, consecutive_failures: consecutiveFailures, reason: "circuit_open" };
  }
  if (runFailed) {
    return { state: "offline", success_rate: rate, consecutive_failures: consecutiveFailures, reason: "run_failed" };
  }
  let state: HealthState;
  let reason: string;
  if (rate >= 0.99) {
    state = "healthy";
    reason = "ok";
  } else if (rate >= 0.9) {
    state = "warning";
    reason = "partial_normalization";
  } else if (rate > 0) {
    state = "degraded";
    reason = "low_normalization_rate";
  } else {
    state = "offline";
    reason = "no_records_normalized";
  }
  return { state, success_rate: rate, consecutive_failures: consecutiveFailures, reason };
}

// ---------------------------------------------------------------------------
// Normalized record  →  truth Observation  (the bridge INTO the truth layer)
// ---------------------------------------------------------------------------

/** Injected identity/instant for building an Observation (no clock in the SDK). */
export interface ObservationBuildContext {
  /** Deterministic id for the observation (caller-injected). */
  id: string;
  /** When Dispatch observed/recorded it (caller-injected ISO). */
  observed_at: string;
  /** Who is asserting: "user:<id>" | "agent:<run_id>" | "system". */
  asserted_by: string;
  /** The immutable raw record id(s) this observation rests on, when captured. */
  source_document_ids?: string[];
}

/**
 * Map a {@link NormalizedRecord} → a truth {@link Observation}, taking the TIER /
 * PLANE / VISIBILITY from the SOURCE manifest (never from the connector). Method
 * is `connector_sync`; the source id + any captured document ids are carried as
 * provenance; valid-time comes from the record, observed-time is injected. This is
 * the load-bearing seam: a connector NORMALIZES, and only here — driven by source
 * config, not connector code — does a record become a tiered, sourced Observation.
 * Still NOT a Fact: an Observation asserts only what the source stated.
 */
export function recordToObservation(
  rec: NormalizedRecord,
  source: SourceRegistryEntry,
  ctx: ObservationBuildContext,
): Observation {
  const plane: Plane = source.default_plane;
  const visibility: Visibility = source.default_visibility;
  const tier: TruthTier = source.default_tier;
  const obs: Observation = {
    id: ctx.id,
    truth_kind: "observation",
    plane,
    visibility,
    tier,
    subject_ref: rec.subject_ref ?? null,
    subject_type: rec.subject_type ?? null,
    predicate: rec.predicate ?? null,
    value: rec.value,
    provenance: {
      method: "connector_sync",
      asserted_by: ctx.asserted_by,
      source_ids: [source.key],
      source_document_ids: ctx.source_document_ids,
      confidence: source.trust_score ?? null,
    },
    temporal: {
      observed_at: ctx.observed_at,
      valid_from: rec.valid_from ?? null,
      valid_to: rec.valid_to ?? null,
    },
    status: "active",
    created_at: ctx.observed_at,
  };
  return obs;
}

/** Injected identity/instant for building a SourceDocument from a captured artifact. */
export interface ArtifactBuildContext {
  id: string;
  retrieved_at: string;
}

/** Map a captured {@link SourceArtifact} → a truth {@link SourceDocument} (plane from the source). */
export function artifactToSourceDocument(
  art: SourceArtifact,
  source: SourceRegistryEntry,
  ctx: ArtifactBuildContext,
): SourceDocument {
  return {
    id: ctx.id,
    source_id: source.key,
    plane: source.default_plane,
    visibility: source.default_visibility,
    external_ref: art.external_ref,
    title: art.title ?? null,
    content_type: art.content_type ?? null,
    raw_content_reference: art.raw_content_reference ?? null,
    raw_text: art.raw_text ?? null,
    content_hash: art.content_hash ?? (art.raw_text != null ? canonicalHash(art.raw_text) : null),
    retrieved_at: ctx.retrieved_at,
    published_at: art.published_at ?? null,
    attribution: source.attribution_required ? (source.publisher ?? source.label) : null,
    created_at: ctx.retrieved_at,
  };
}

// ---------------------------------------------------------------------------
// small shared clamp
// ---------------------------------------------------------------------------

function clamp01(n: number): number {
  if (!Number.isFinite(n)) return 0;
  if (n < 0) return 0;
  if (n > 1) return 1;
  return n;
}
