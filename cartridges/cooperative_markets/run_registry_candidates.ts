// cartridges/cooperative_markets/run_registry_candidates.ts
//
// Cooperative Markets — CONNECTOR ENTITY CANDIDATES → OBJECT REGISTRY (propose-only).
//
// The SECOND live surface for Sprint III Wave 3: NORMALIZED connector output now
// feeds the shared-market Object Registry. Two REAL connectors run THROUGH the
// generic runtime, the entity candidates each SURFACED are bridged into canonical
// object inputs (generic core seam `candidatesToObjectInputs`), registered into the
// Object Registry, and the MATURED resolver PROPOSES cross-source duplicates for
// HUMAN review — it NEVER auto-merges.
//
// THE STORY (real, cross-source). The SEC EDGAR connector surfaces an innovation
// company from a public filing (keyed by CIK); the startup-intake connector
// surfaces the SAME company from a private submission (keyed by domain). Different
// sources, different identifiers, slightly different legal names ("Halcyon Pay Inc"
// vs "Halcyon Pay"). The registry recognizes they are LIKELY the same entity and
// PROPOSES a merge candidate — but the merge stays a human-gated act. A company is
// never silently collapsed across a public record and a private submission.
//
// TRUTH DISCIPLINE. Candidates carry NO tier and NO plane of their own — the plane/
// visibility come from each candidate's SOURCE manifest (read via sourceByKey),
// exactly as `recordToObservation` reads the tier from the source. The resolver is
// PROPOSE-only (RFC-10004); nothing here merges, and the human review queue (the
// match candidates) is the gate.
//
// PURE-ish / DETERMINISTIC: ids/instants injected; the only impurity is the catalog
// fs read behind sourceByKey (the connectors themselves acquire injected data). Same
// fixtures → identical registry + proposals.
//
// ERASABLE-ONLY TS: `import type` for type-only imports. Safe under native
// type-stripping.

import { makeEnvelope, type RequestEnvelope } from "@/core/kernel/envelope";
import { systemPrincipal } from "@/core/kernel/identity";
import { runConnector } from "@/core/kernel/connector_runtime";
import type { EntityCandidate } from "@/core/kernel/connector_sdk";
import type { SourceRegistryEntry } from "@/core/registry/types";
import { sourceByKey } from "@/core/registry/connectors";
import {
  ObjectRegistryService,
  InMemoryRegistryStore,
  type CanonicalObject,
  type MatchCandidate,
  type MergeRecord,
} from "@/core/registry/service";
import { resolveThroughStore } from "@/core/registry/resolver";
import { candidatesToObjectInputs, type CandidateScope } from "@/core/registry/candidate_bridge";
import {
  makeSecEdgarConnector,
  SEC_EDGAR_SOURCE_KEY,
} from "@/cartridges/cooperative_markets/connectors/sec_edgar_connector";
import { secEdgarFixtures } from "@/cartridges/cooperative_markets/run_sec_edgar";
import {
  makeStartupIntakeConnector,
  STARTUP_INTAKE_SOURCE_KEY,
} from "@/cartridges/cooperative_markets/connectors/startup_intake_connector";
import { startupIntakeFixtures } from "@/cartridges/cooperative_markets/intake_fixtures";

/**
 * Corporate-designator stopwords the resolver drops before token similarity —
 * CONFIG-AS-DATA the cartridge injects so core/ names no vertical concept. With
 * these, "Halcyon Pay Inc" (EDGAR) and "Halcyon Pay" (intake) share the
 * identifying tokens {halcyon, pay} and are proposed as the same entity.
 */
export const COOP_MARKETS_DESIGNATOR_STOPWORDS: string[] = [
  "inc", "corp", "corporation", "co", "company", "llc", "ltd", "lp", "plc", "the",
  "fcu", "federal", "credit", "union", "cu", "bank",
];

const AS_OF_DEFAULT = "2026-07-22T00:00:00.000Z";

export interface RegistryCandidateOptions {
  as_of?: string;
  correlation_id?: string;
  /** Override the resolver propose threshold (default: the resolver's 0.5). */
  propose_threshold?: number;
}

export interface CrossSourcePair {
  left_id: string;
  right_id: string;
  score: number;
  reasons: string[];
  left_name: string;
  right_name: string;
}

export interface RegistryCandidateResult {
  registered: CanonicalObject[];
  proposed: MatchCandidate[];
  merges: MergeRecord[];
  cross_source_pairs: CrossSourcePair[];
  service: ObjectRegistryService;
  store: InMemoryRegistryStore;
  reconciliation: {
    registered_count: number;
    candidate_count: number;
    proposed_count: number;
    merged_count: number;
    /** true iff every surfaced candidate became a registry object AND nothing merged. */
    reconciled: boolean;
  };
}

function counter(prefix: string): () => string {
  let n = 0;
  return () => `${prefix}:${n++}`;
}

function serviceEnvelope(as_of: string, correlation_id: string): RequestEnvelope {
  return makeEnvelope({
    principal: systemPrincipal(),
    correlation_id,
    plane: "shared_market",
    occurred_at: as_of,
    request_id: `${correlation_id}:req`,
  });
}

function resolveSource(key: string): SourceRegistryEntry {
  const s = sourceByKey(key);
  if (!s) throw new Error(`run_registry_candidates: source ${key} not found in the connector catalog`);
  return s;
}

/** The plane/visibility a source declares — a candidate NEVER guesses its own. */
function scopeFromSource(s: SourceRegistryEntry): CandidateScope {
  return { plane: s.default_plane, visibility: s.default_visibility };
}

/**
 * Run two real connectors, bridge the entity candidates each surfaced into the
 * Object Registry, and PROPOSE cross-source duplicates for human review. Deterministic.
 */
export async function runRegistryCandidates(
  opts: RegistryCandidateOptions = {},
): Promise<RegistryCandidateResult> {
  const as_of = opts.as_of ?? AS_OF_DEFAULT;
  const correlation_id = opts.correlation_id ?? "corr:connector:registry_candidates";

  const edgarSource = resolveSource(SEC_EDGAR_SOURCE_KEY);
  const intakeSource = resolveSource(STARTUP_INTAKE_SOURCE_KEY);

  // 1) Run each connector THROUGH the runtime → real normalized output + candidates.
  const edgarRun = await runConnector(
    { connector: makeSecEdgarConnector(secEdgarFixtures()), source: edgarSource, env: serviceEnvelope(as_of, `${correlation_id}:edgar`) },
    { idGen: counter("ev:rc:edgar") },
  );
  const intakeRun = await runConnector(
    { connector: makeStartupIntakeConnector(startupIntakeFixtures()), source: intakeSource, env: serviceEnvelope(as_of, `${correlation_id}:intake`) },
    { idGen: counter("ev:rc:intake") },
  );
  if (!edgarRun.ok) throw new Error(`sec_edgar refused: ${edgarRun.refusal.reason}`);
  if (!intakeRun.ok) throw new Error(`startup_intake refused: ${intakeRun.refusal.reason}`);

  const edgarCandidates: EntityCandidate[] = edgarRun.output.entity_candidates;
  const intakeCandidates: EntityCandidate[] = intakeRun.output.entity_candidates;

  // 2) Bridge each feed's candidates → canonical object inputs (plane FROM the source).
  const inputs = [
    ...candidatesToObjectInputs(edgarCandidates, scopeFromSource(edgarSource)),
    ...candidatesToObjectInputs(intakeCandidates, scopeFromSource(intakeSource)),
  ];

  // 3) Register into the Object Registry (injected ids/clock — pure/deterministic).
  const store = new InMemoryRegistryStore();
  const objectIds = counter("obj:rc");
  const service = new ObjectRegistryService(store, { idGen: objectIds, now: as_of });
  const registered = inputs.map((i) => service.register(i));

  // 4) Resolve — PROPOSE-only. The matured resolver proposes cross-source duplicates
  //    for human review; it NEVER merges. Corporate designators injected as config.
  const result = resolveThroughStore(store, {
    stopwords: COOP_MARKETS_DESIGNATOR_STOPWORDS,
    ...(opts.propose_threshold !== undefined ? { propose_threshold: opts.propose_threshold } : {}),
  });

  // 5) Label the cross-source pairs with the object display names for the surface.
  const byId = new Map(registered.map((o) => [o.id, o] as const));
  const cross_source_pairs: CrossSourcePair[] = result.proposed.map((c) => ({
    left_id: c.left_id,
    right_id: c.right_id,
    score: c.score,
    reasons: c.reasons,
    left_name: byId.get(c.left_id)?.display_name ?? c.left_id,
    right_name: byId.get(c.right_id)?.display_name ?? c.right_id,
  }));

  // Reconciliation with TEETH (not a tautology): `candidate_count` is counted from
  // the REAL connector outputs (independent of `inputs`), and `reconciled` proves the
  // registry actually ROUND-TRIPPED every surfaced candidate — each registered object
  // is retrievable from the store BY ID and carries its surfaced external ids — and
  // that NOTHING merged (propose-only). If the bridge dropped a candidate, or a
  // register failed to persist, or a merge fired, `reconciled` flips false.
  const candidate_count = edgarCandidates.length + intakeCandidates.length;
  const store_count = store.all().length;
  const surfacedIdSystems = new Set(
    [...edgarCandidates, ...intakeCandidates].flatMap((c) => (c.external_ids ?? []).map((e) => e.system)),
  );
  const round_tripped = registered.every((o) => {
    const back = store.get(o.id);
    if (!back) return false;
    // an object whose candidate carried external ids must carry at least one back.
    const hadIds = (back.external_ids ?? []).length > 0;
    return hadIds ? (back.external_ids ?? []).some((e) => surfacedIdSystems.has(e.system)) : true;
  });
  const merges = store.merges();
  const reconciliation = {
    registered_count: registered.length,
    candidate_count,
    proposed_count: result.proposed.length,
    merged_count: merges.length,
    reconciled:
      store_count === candidate_count &&
      registered.length === candidate_count &&
      round_tripped &&
      merges.length === 0,
  };

  return { registered, proposed: result.proposed, merges, cross_source_pairs, service, store, reconciliation };
}
