// core/registry/canon.ts
//
// The CANON RECONCILIATION SEAM (DKR §2; Volume X Object Registry × the external
// canon-adoption ADR). A generic, deterministic layer that reconciles IDENTIFIERS
// arriving from an external documentation canon (e.g. the FS / Dispatch-Auric V1
// release package — object / workflow / agent / connector / event / evidence /
// approval names) against the repo's LIVE canonical identifiers, WITHOUT merging
// authority and WITHOUT ever silently renaming anything.
//
// WHY THIS EXISTS. An external spec package names the same concepts with different
// conventions (FS-5100 `OBJ.CREDITUNION`, FS-8000 `SRC-NCUA-CALL`, the repo
// `entity:coop_markets:credit_union` / `source:ncua_5300_call_report`). Left
// unmanaged, that variety becomes drift and "which name is real" confusion. This
// seam lets new inputs FALL INTO ORDER: a name is either resolved deterministically
// (seen before, sticky), or normalized to a shape, or surfaced as ONE proposal for
// a single human decision — after which it is permanent.
//
// IDENTITY, NOT AUTHORITY (load-bearing). This module reconciles what two names
// REFER TO. It does NOT decide which spec GOVERNS a contract — a name match never
// certifies that the schema/behavior behind it matches. Authority precedence
// (which canon wins) is declared config, resolved here only to pick a canonical
// LABEL; the semantic merge stays an explicit human/ADR act.
//
// PROPOSE-ONLY + NO-CLOBBER (mirrors core/registry/resolver.ts). An unknown
// incoming id is PROPOSED against the live canonicals (deterministic token
// similarity), never auto-merged. A human-reviewed alias (`confirmed`/`rejected`)
// is STICKY and never re-proposed.
//
// CLOSED-GRAPH (mirrors core/registry/connectors.ts). A confirmed alias must not
// map one incoming id to two different canonicals, and a `verify`-flagged alias's
// canonical must resolve to a LIVE canonical key — so the crosswalk cannot claim an
// identity that the running system does not actually have.
//
// UNIVERSALITY (CLAUDE.md): core/, so NO vertical noun. The alias DATA names domain
// concepts (config-as-data is where domain lives); this module is generic — it
// parses/normalizes/scores/validates identifiers and knows no vertical. Corporate-
// designator / stopword handling is the caller's injected config, exactly as the
// resolver's.
//
// PURE / DETERMINISTIC: no clock, no random, no I/O except the sanctioned fs read in
// `loadCanonRegistry` (like connectors.ts). Every list returned is sorted or
// input-ordered; same inputs → identical output.
//
// ERASABLE-ONLY TS: no enums, no parameter properties, no namespaces; `import type`
// for type-only imports. Safe under `node` native type-stripping.

import fs from "node:fs";
import { fileURLToPath } from "node:url";

// ---------------------------------------------------------------------------
// Types (config-as-data view over data/canon_aliases.json)
// ---------------------------------------------------------------------------

/** Review status of an alias. Mirrors the resolver's MatchCandidate status. */
export type AliasStatus = "proposed" | "confirmed" | "rejected";

/**
 * One reconciliation edge: an INCOMING external identifier mapped to a CANONICAL
 * repo identifier. `source` records which canon proposed it; `verify` asks the
 * closed-graph check to prove the canonical is a LIVE key (not just a claim).
 */
export interface CanonAlias {
  /** The external identifier as the source canon wrote it (e.g. "SRC-NCUA-CALL"). */
  incoming: string;
  /** The repo's live canonical identifier (e.g. "source:ncua_5300_call_report"). */
  canonical: string;
  /** Generic kind label for grouping (e.g. "source" | "object" | "event"). Not inferred — declared. */
  kind: string;
  /** Which canon asserted this edge (keys of the authority order). */
  source: string;
  status: AliasStatus;
  /** When true, the closed-graph check must find `canonical` in the live key set for this kind. */
  verify?: boolean;
  note?: string;
}

/** A section-level map (FS section → repo module/layer). Documentation aid, not an identity edge. */
export interface CanonSectionMap {
  fs_section: string;
  repo_ref: string;
  status: AliasStatus;
  note?: string;
}

export interface CanonRegistry {
  key: string;
  label: string;
  /**
   * Authority precedence, MOST authoritative first. When two aliases claim the same
   * incoming id, the one whose `source` ranks earliest wins the canonical label.
   * Default order lives in the data; `live_code` should rank above any external canon.
   */
  authority_order: string[];
  aliases: CanonAlias[];
  section_map?: CanonSectionMap[];
}

const VALID_STATUSES: AliasStatus[] = ["proposed", "confirmed", "rejected"];

// ---------------------------------------------------------------------------
// Load (runtime-safe fs read; or inject already-parsed data) — mirrors connectors.ts
// ---------------------------------------------------------------------------

let CACHE: CanonRegistry | null = null;

function registryPath(): string {
  return fileURLToPath(new URL("./data/canon_aliases.json", import.meta.url));
}

/** Load + validate the canon alias registry. Pass `raw` to inject a fixture (no fs). */
export function loadCanonRegistry(raw?: unknown): CanonRegistry {
  if (raw === undefined && CACHE) return CACHE;
  const parsed = raw !== undefined ? raw : (JSON.parse(fs.readFileSync(registryPath(), "utf8")) as unknown);
  const report = validateCanonRegistry(parsed);
  if (!report.ok) throw new Error("canon alias registry invalid: " + report.errors.join("; "));
  const reg = parsed as CanonRegistry;
  if (raw === undefined) CACHE = reg;
  return reg;
}

// ---------------------------------------------------------------------------
// Pure identifier normalization (handles heterogeneous conventions)
// ---------------------------------------------------------------------------

/** The leading segment before the first `.`, `-`, or `:` separator, lowercased. */
export function prefixOf(id: string): string {
  const m = /^[^.\-:]+/.exec(id);
  return (m ? m[0] : id).toLowerCase();
}

/**
 * Normalize an identifier to comparable tokens: STRIP the leading convention prefix
 * segment (`SRC-`, `OBJ.`, `source:`, `entity:` …) — a prefix, NOT a global drop, so
 * a body word that happens to equal a convention (e.g. "report", "event") is
 * preserved — then lowercase, split on non-alphanumeric, and drop the caller's
 * injected stopwords (the domain-namespace noise only). So "SRC-NCUA-CALL" →
 * {ncua, call} and "source:ncua_5300_call_report" → {ncua, 5300, call, report}, while
 * "entity:coop_markets:credit_union" → {credit, union} (coop/markets are namespace).
 */
export function normalizeTokens(id: string, stop?: Set<string>): Set<string> {
  const body = id.replace(/^[^.\-:]+[.\-:]/, ""); // drop the leading "<prefix><sep>"
  const out = new Set<string>();
  for (const tok of body.toLowerCase().split(/[^a-z0-9]+/)) {
    if (tok.length === 0) continue;
    if (stop && stop.has(tok)) continue;
    out.add(tok);
  }
  return out;
}

/** Deterministic Jaccard over two token sets (0 when both empty). */
export function tokenJaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 && b.size === 0) return 0;
  let inter = 0;
  for (const t of a) if (b.has(t)) inter++;
  const union = a.size + b.size - inter;
  return union === 0 ? 0 : inter / union;
}

// ---------------------------------------------------------------------------
// Resolution — deterministic, propose-only
// ---------------------------------------------------------------------------

export type ResolveVia = "canonical" | "confirmed_alias" | "proposed" | "unresolved";

export interface CanonResolution {
  incoming: string;
  /** The resolved canonical label, or null when unresolved. */
  canonical: string | null;
  via: ResolveVia;
  /** Score when the resolution is a proposal (0..1). */
  score?: number;
  reasons: string[];
}

/**
 * Default stopwords: NONE — `core/` names no vertical. Convention prefixes are
 * already handled by prefix-strip in normalizeTokens, so the default needs nothing.
 * The DOMAIN-NAMESPACE tokens a caller wants dropped during similarity (e.g. the
 * cartridge's "coop"/"markets" so "OBJ.LOAN" and "entity:coop_markets:loan" share
 * {loan}) are INJECTED as config-as-data, exactly like the resolver's designator
 * stopwords — this module hardcodes no vertical noun.
 */
export const DEFAULT_CANON_STOPWORDS: string[] = [];

/** Minimum token Jaccard to PROPOSE an incoming↔canonical pair. */
const DEFAULT_PROPOSE_THRESHOLD = 0.5;

export interface ResolveOptions {
  stopwords?: string[];
  propose_threshold?: number;
}

/**
 * Resolve ONE incoming identifier against the registry + a set of live canonical
 * ids. Deterministic. Order: (1) exact hit on a live canonical → `canonical`;
 * (2) a CONFIRMED alias whose incoming matches → `confirmed_alias` (sticky memory);
 * (3) otherwise PROPOSE the best-scoring live canonical above threshold →
 * `proposed` (NEVER written back here — proposing is not merging); (4) else
 * `unresolved`. A `rejected` alias suppresses proposing that exact pair again.
 */
export function resolveCanon(
  incoming: string,
  liveCanonicals: string[],
  registry: CanonRegistry,
  opts?: ResolveOptions,
): CanonResolution {
  const stop = new Set((opts?.stopwords ?? DEFAULT_CANON_STOPWORDS).map((s) => s.toLowerCase()));
  const threshold = opts?.propose_threshold ?? DEFAULT_PROPOSE_THRESHOLD;

  // (1) incoming IS already a live canonical.
  if (liveCanonicals.includes(incoming)) {
    return { incoming, canonical: incoming, via: "canonical", reasons: ["exact_canonical"] };
  }

  // (2) a confirmed alias remembers this incoming (authority-ranked if several).
  const confirmed = registry.aliases.filter((a) => a.incoming === incoming && a.status === "confirmed");
  if (confirmed.length > 0) {
    const pick = pickByAuthority(confirmed, registry.authority_order);
    return { incoming, canonical: pick.canonical, via: "confirmed_alias", reasons: ["confirmed_alias:" + pick.source] };
  }

  // rejected pairs are sticky: never propose that exact canonical for this incoming.
  const rejectedCanonicals = new Set(
    registry.aliases.filter((a) => a.incoming === incoming && a.status === "rejected").map((a) => a.canonical),
  );

  // (3) propose the best live canonical by normalized-token similarity.
  const inTok = normalizeTokens(incoming, stop);
  let best: { canonical: string; score: number } | null = null;
  for (const cand of liveCanonicals) {
    if (rejectedCanonicals.has(cand)) continue;
    const j = tokenJaccard(inTok, normalizeTokens(cand, stop));
    if (j >= threshold && (best === null || j > best.score || (j === best.score && cand < best.canonical))) {
      best = { canonical: cand, score: j };
    }
  }
  if (best) {
    return { incoming, canonical: best.canonical, via: "proposed", score: best.score, reasons: ["name_similarity:" + Math.round(best.score * 100)] };
  }
  return { incoming, canonical: null, via: "unresolved", reasons: ["no_match_above_threshold"] };
}

/**
 * Propose alias edges for a batch of incoming ids against live canonicals,
 * honoring NO-CLOBBER: an incoming with a confirmed/rejected alias is left alone
 * (a confirmed one is reported as already-resolved; a rejected pair is not
 * re-proposed). Pure + deterministic; proposals are input-ordered.
 */
export interface ProposeResult {
  proposed: CanonAlias[];
  already_resolved: string[];
  unresolved: string[];
}

export function proposeAliases(
  incomingIds: string[],
  liveCanonicals: string[],
  registry: CanonRegistry,
  opts?: ResolveOptions & { kind?: string; source?: string },
): ProposeResult {
  const proposed: CanonAlias[] = [];
  const already_resolved: string[] = [];
  const unresolved: string[] = [];
  const confirmedIncoming = new Set(
    registry.aliases.filter((a) => a.status === "confirmed").map((a) => a.incoming),
  );
  for (const incoming of incomingIds) {
    if (confirmedIncoming.has(incoming)) {
      already_resolved.push(incoming);
      continue;
    }
    const r = resolveCanon(incoming, liveCanonicals, registry, opts);
    if (r.via === "canonical" || r.via === "confirmed_alias") {
      already_resolved.push(incoming);
    } else if (r.via === "proposed" && r.canonical) {
      proposed.push({
        incoming,
        canonical: r.canonical,
        kind: opts?.kind ?? "unknown",
        source: opts?.source ?? "new_input",
        status: "proposed",
        note: r.reasons.join(","),
      });
    } else {
      unresolved.push(incoming);
    }
  }
  return { proposed, already_resolved, unresolved };
}

// ---------------------------------------------------------------------------
// Authority precedence — pick the canonical label when several aliases claim one id
// ---------------------------------------------------------------------------

/**
 * Given several alias edges for the SAME incoming id, pick the one whose `source`
 * ranks earliest in `authority_order` (a source absent from the order sorts last).
 * Ties break on the canonical string for total-order determinism. This resolves the
 * canonical LABEL only — never which spec governs the contract.
 */
export function pickByAuthority(aliases: CanonAlias[], authority_order: string[]): CanonAlias {
  const rank = (s: string): number => {
    const i = authority_order.indexOf(s);
    return i === -1 ? authority_order.length : i;
  };
  return aliases.slice().sort((a, b) => {
    const ra = rank(a.source), rb = rank(b.source);
    if (ra !== rb) return ra - rb;
    return a.canonical < b.canonical ? -1 : a.canonical > b.canonical ? 1 : 0;
  })[0];
}

// ---------------------------------------------------------------------------
// Closed-graph validation (pure; deterministic; sorted errors) — mirrors connectors.ts
// ---------------------------------------------------------------------------

export interface CanonValidation {
  ok: boolean;
  alias_count: number;
  confirmed_count: number;
  errors: string[];
}

/**
 * Validate the canon registry as a CLOSED GRAPH:
 *   - shape: every alias has incoming/canonical/kind/source; status in the union;
 *   - authority_order present and every alias `source` appears in it;
 *   - NO CONFLICT: an incoming id is never CONFIRMED to two different canonicals;
 *   - LIVE-CANONICAL: a `verify`-flagged alias's `canonical` must appear in
 *     `liveKeysByKind[kind]` (identity actually resolves to a running canonical) —
 *     so the crosswalk cannot assert an identity the system does not have.
 * `liveKeysByKind` is optional so the pure shape check runs with no repo access.
 */
export function validateCanonRegistry(
  raw: unknown,
  liveKeysByKind?: Record<string, Set<string>>,
): CanonValidation {
  const errors: string[] = [];
  const reg = (raw ?? {}) as Partial<CanonRegistry>;
  const aliases = Array.isArray(reg.aliases) ? reg.aliases : [];
  const order = Array.isArray(reg.authority_order) ? reg.authority_order : [];
  if (order.length === 0) errors.push("authority_order missing/empty");

  const confirmedByIncoming = new Map<string, Set<string>>();
  let confirmed = 0;
  for (const a of aliases) {
    if (!a || typeof a.incoming !== "string" || a.incoming.length === 0) { errors.push("alias missing incoming"); continue; }
    if (typeof a.canonical !== "string" || a.canonical.length === 0) errors.push(`alias ${a.incoming}: missing canonical`);
    if (typeof a.kind !== "string" || a.kind.length === 0) errors.push(`alias ${a.incoming}: missing kind`);
    if (!VALID_STATUSES.includes(a.status)) errors.push(`alias ${a.incoming}: bad status ${String(a.status)}`);
    if (typeof a.source !== "string" || (order.length > 0 && !order.includes(a.source))) {
      errors.push(`alias ${a.incoming}: source ${String(a.source)} not in authority_order`);
    }
    if (a.status === "confirmed") {
      confirmed++;
      const set = confirmedByIncoming.get(a.incoming) ?? new Set<string>();
      set.add(a.canonical);
      confirmedByIncoming.set(a.incoming, set);
      if (a.verify === true && liveKeysByKind) {
        const live = liveKeysByKind[a.kind];
        if (!live || !live.has(a.canonical)) {
          errors.push(`alias ${a.incoming}: verified canonical ${a.canonical} is not a live ${a.kind} key`);
        }
      }
    }
  }
  for (const [incoming, canonicals] of confirmedByIncoming) {
    if (canonicals.size > 1) {
      errors.push(`incoming ${incoming} confirmed to ${canonicals.size} different canonicals: ${Array.from(canonicals).sort().join(", ")}`);
    }
  }

  return { ok: errors.length === 0, alias_count: aliases.length, confirmed_count: confirmed, errors: errors.sort() };
}

// ---------------------------------------------------------------------------
// Typed accessors
// ---------------------------------------------------------------------------

/** All alias edges (config-as-data). */
export function canonAliases(): CanonAlias[] {
  return loadCanonRegistry().aliases.slice();
}

/** Resolve an incoming id against the loaded registry + a caller-supplied live key set. */
export function resolveThroughRegistry(incoming: string, liveCanonicals: string[], opts?: ResolveOptions): CanonResolution {
  return resolveCanon(incoming, liveCanonicals, loadCanonRegistry(), opts);
}
