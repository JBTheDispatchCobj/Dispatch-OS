// tests/candidate_bridge.test.mjs — the SECOND live surface (Sprint III Wave 3):
// NORMALIZED connector output feeds the Object Registry. The generic core bridge
// maps a connector EntityCandidate → a CanonicalObjectInput (plane FROM the source,
// never guessed); real connectors (SEC EDGAR × startup intake) surface the SAME
// company from two sources, and the MATURED resolver PROPOSES the cross-source
// duplicate for HUMAN review — it NEVER auto-merges (RFC-10004 propose-only).
import { test } from "node:test";
import assert from "node:assert/strict";
import { register } from "node:module";
register("../scripts/alias-hook.mjs", import.meta.url);

const { candidateToObjectInput, candidatesToObjectInputs, slugify } = await import("@/core/registry/candidate_bridge");
const { runRegistryCandidates, COOP_MARKETS_DESIGNATOR_STOPWORDS } = await import(
  "@/cartridges/cooperative_markets/run_registry_candidates"
);
const { resolveThroughStore } = await import("@/core/registry/resolver");

const AS_OF = "2026-07-22T00:00:00.000Z";

// ---- the GENERIC bridge: EntityCandidate → CanonicalObjectInput --------------
test("candidateToObjectInput maps a candidate under an injected source scope (plane never guessed)", () => {
  const cand = { object_class: "entity:x:thing", display_name: "Acme Data Inc", external_ids: [{ system: "cik", value: "42" }] };
  const input = candidateToObjectInput(cand, { plane: "shared_market", visibility: "public" });
  assert.equal(input.object_class, "entity:x:thing");
  assert.equal(input.plane, "shared_market", "plane comes from the injected source scope, not the connector");
  assert.equal(input.visibility, "public");
  assert.equal(input.canonical_slug, "acme_data_inc", "canonical_slug falls back to a deterministic slug of the display name");
  assert.equal(input.external_ids[0].system, "cik", "surfaced external ids are carried through");
  assert.equal(input.storage, "external", "a connector-surfaced candidate lives external until merged");
});

test("candidateToObjectInput prefers the candidate's own slug; slugify is deterministic", () => {
  const input = candidateToObjectInput(
    { object_class: "entity:x:thing", display_name: "Whatever", canonical_slug: "explicit_slug" },
    { plane: "private_terminal", visibility: "tenant_private" },
  );
  assert.equal(input.canonical_slug, "explicit_slug");
  assert.equal(input.plane, "private_terminal", "a tenant-plane source scope is honored");
  assert.equal(slugify("Summit Ridge FCU!!"), "summit_ridge_fcu");
  assert.equal(candidatesToObjectInputs([], { plane: "shared_market", visibility: "public" }).length, 0, "empty in → empty out");
});

// ---- REAL cross-source wiring: EDGAR × intake → PROPOSED duplicates ----------
test("connector entity candidates feed the registry; cross-source duplicates are PROPOSED, never merged", async () => {
  const r = await runRegistryCandidates({ as_of: AS_OF });
  // 3 EDGAR innovation companies + 3 intake submissions = 6 registered objects.
  assert.equal(r.registered.length, 6, "every surfaced candidate became a registry object");
  assert.ok(r.registered.every((o) => o.status === "active"), "nothing is merged away — all objects stay active");
  // PLANE/VISIBILITY FROM THE SOURCE MANIFEST, never guessed: EDGAR is public, the
  // startup-intake source is `network` — so the two feeds carry DIFFERENT visibility.
  const pub = r.registered.filter((o) => o.visibility === "public");
  const net = r.registered.filter((o) => o.visibility === "network");
  assert.equal(pub.length, 3, "the 3 EDGAR-sourced objects carry visibility 'public' FROM the EDGAR source manifest");
  assert.equal(net.length, 3, "the 3 intake-sourced objects carry visibility 'network' FROM the intake source manifest (differing source, not a hardcoded default)");
  // The SAME three companies appear under a public filing AND a private submission.
  assert.equal(r.proposed.length, 3, "the three cross-source duplicates are PROPOSED for review");
  assert.equal(r.merges.length, 0, "PROPOSE-only: the resolver proposes; a merge is a separate human-gated act");
  assert.equal(r.reconciliation.merged_count, 0, "nothing auto-merged");
  assert.equal(r.reconciliation.reconciled, true);
  // Each proposal carries a name-similarity reason (identity across differing legal names).
  assert.ok(r.proposed.every((c) => c.status === "proposed"), "every candidate is a proposal, not a decision");
  assert.ok(r.cross_source_pairs.every((p) => p.reasons.some((x) => x.startsWith("name_similarity:"))), "each pair is proposed on normalized-name similarity");
  const halcyon = r.cross_source_pairs.find((p) => p.left_name.toLowerCase().includes("halcyon") || p.right_name.toLowerCase().includes("halcyon"));
  assert.ok(halcyon, "the Halcyon Pay cross-source pair is surfaced");
  assert.ok(halcyon.left_name !== halcyon.right_name, "the two sides carry the two different legal names (Halcyon Pay Inc vs Halcyon Pay)");
});

// ---- determinism -------------------------------------------------------------
test("the connector→registry→resolve pass is deterministic", async () => {
  const a = await runRegistryCandidates({ as_of: AS_OF });
  const b = await runRegistryCandidates({ as_of: AS_OF });
  const shape = (r) => JSON.stringify({
    ids: r.registered.map((o) => o.id),
    pairs: r.proposed.map((c) => [c.left_id, c.right_id, c.score, c.reasons]),
  });
  assert.equal(shape(a), shape(b), "same fixtures → identical registry + proposals");
});

// ---- NO-CLOBBER: a human-reviewed pair is sticky (never re-proposed) ----------
test("NO-CLOBBER: a human-confirmed candidate is not re-proposed on a later resolve", async () => {
  const r = await runRegistryCandidates({ as_of: AS_OF });
  const one = r.proposed[0];
  // A human reviews + CONFIRMS the pair (the merge itself is still a separate act).
  r.store.putCandidate({ left_id: one.left_id, right_id: one.right_id, score: one.score, reasons: one.reasons, status: "confirmed" });
  const again = resolveThroughStore(r.store, { stopwords: COOP_MARKETS_DESIGNATOR_STOPWORDS });
  const key = one.left_id < one.right_id ? `${one.left_id}|${one.right_id}` : `${one.right_id}|${one.left_id}`;
  assert.ok(again.skipped_reviewed.includes(key), "the reviewed pair is sticky — skipped, never re-proposed");
  assert.ok(!again.proposed.some((c) => (c.left_id === one.left_id && c.right_id === one.right_id)), "the confirmed pair is not re-proposed (no clobber of the human decision)");
});
