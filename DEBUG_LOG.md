# Debug Log — running notes (fix blockers now, circle back on the rest)

Convention: **[BLOCKER]** stops production → fix immediately · **[NON-BLOCKING]** works, revisit
when convenient · **[DEFERRED]** intentional, needs a decision/later phase. Run the review harness
any time with `node scripts/debug-loop.mjs` (after `npm install`).

## Open

### Sprint III Wave 3 — FDIC + Federal Register connectors + connector→registry + catalog 57→73 (2026-07-22)
- **[BLOCKER — FIXED] A previously-seen record that failed validation on a valid key was fabricated as a DELETION**
  (violates the load-bearing RFC-2011 rule "a normalization failure is NEVER a deletion"). Across all real
  throw-path connectors (FDIC CERT / Federal Register document_number / SEC EDGAR accession_number), the raw
  key field is not in the runtime's generic `rawRef` whitelist `{external_ref, source_ref, ref, id}`, so when
  `parse` rejected a record for a blank *secondary* field (e.g. valid CERT + blank name) the rejection's ref
  came back `undefined` — defeating the `alsoPresentRefs` guard — and change detection saw the prior ref as
  absent and emitted `kind:"deleted"`. Confirmed empirically (`deleted === 1`). The Wave-2 reject tests missed
  it by only exercising blank-KEY rejections (never present in `prior`). Surfaced by the 4-lens adversarial
  fleet (correctness + test-teeth lenses), confirmed by a focused re-verify. **Fix:** each throw-path connector
  now tags its acquired records with a generic `external_ref` = the change-key via a `withRef` helper (runtime
  UNCHANGED, no vertical noun in core/), so a seen-but-unparseable record is protected by `alsoPresentRefs`
  instead of fabricated as a deletion; plus a regression test with TEETH on all three connectors (seed `prior`
  with a valid key, feed a blank-secondary-field record → assert `deleted === 0`, `rejected === 1`). Verified:
  removing `withRef` now flips the new test to FAIL (was green before). debug-loop 13/13, 290 tests.
- **[NON-BLOCKING — FIXED] `run_registry_candidates` reconciliation flag was vacuous.** `reconciled` compared
  `registered.length === inputs.length`, structurally always true (Array.map), so it gave no signal. **Fix:**
  `reconciled` now proves a store ROUND-TRIP — `candidate_count` is counted independently from the real
  connector outputs, every registered object must be retrievable from the store by id (and carry a surfaced
  external id), and `merges === 0` — so it flips false if the bridge drops a candidate, a persist fails, or a
  merge fires.
- **[NON-BLOCKING — FIXED] test-teeth hardening.** object_class assertions compared against the same imported
  constant (self-comparison) → now assert against string literals + `notEqual credit_union`; the plane/
  visibility-from-source invariant was untested → added an EDGAR `public` vs startup-intake `network`
  visibility assertion (unit test + debug-loop) that fails if the bridge hardcoded a visibility.
- **[DEFERRED] Real bulk 5300 feed has NOT landed** (Bryan-only). The full-market 5300 path remains proven on
  a clearly-LABELED synthetic market; it drops in with NO code change (only the injected `acquire` batch).
  Wave 3 did not fabricate realness.
- **[DEFERRED] Catalog at 73/~93.** 20 more source/connector manifests remain to reach the ~93; the remaining
  real connectors (FDIC BankFind full-field, SEC full-text, Federal Reserve data, etc.) implement against
  existing manifests with no code fork.

### Sprint III Wave 2 — Full-market scale + startup-intake + catalog growth (2026-07-22)
- **[MAJOR — FIXED] SEC EDGAR rejection test exercised a hand-rolled stub, not the real connector.**
  In `tests/sec_edgar_connector.test.mjs` the "a raw that fails to normalize is a rejection" test built
  `makeSecEdgarConnector(...)` into a `conn` that was never used, then asserted against a fake inline
  `defineConnector` whose parse threw on a sentinel — so it verified only the generic runtime's rejection
  tally, NOT `parseEdgarFiling`. Worse, `parseEdgarFiling` was a TOTAL function with no reject path, so the
  SEC connector had no exercised "fails to normalize" case at all — the doctrine invariant "a rejection is
  never a deletion" was falsely attributed to it. Surfaced by the 4-lens adversarial fleet (test-teeth lens),
  confirmed by an independent verifier. **Fix:** gave `parseEdgarFiling` a real structural-validation reject
  path (blank accession_number or CIK → throw), and rewrote the test to drive the rejection through the REAL
  connector via `runSecEdgar([good, malformed], …)` — asserting a partial run, 1 reported rejection, the good
  filing still normalized, and `deleted === 0` (no fabricated deletion) with change detection still running
  (`updated === 1`). Added a direct `parseEdgarFiling` reject test. debug-loop 13/13 green after the fix.
- **[NON-BLOCKING — FIXED] `marketProvenance.all_labeled` was a hardcoded no-op guard.**
  `cartridges/cooperative_markets/bulk_5300_market.ts` returned `all_labeled: true` unconditionally, and the
  debug-loop asserted it — so the load-bearing "synthetic data must be LABELED, never presentable as real"
  invariant had no real coverage (satisfied only because `syntheticSourceRef` always embeds `:synthetic:`).
  Surfaced by the test-teeth + correctness lenses. **Fix:** `all_labeled` is now computed FROM THE DATA (a
  filing is labeled iff its ref carries `:synthetic:` OR is a known golden fixture ref, derived independently
  via `institutionBatchFixtures()`); an unlabeled/real-looking ref flips it FALSE. Added a negative-control in
  both the unit suite and the debug-loop CONNECTOR step (strip a label → `all_labeled === false`), so the guard
  can actually fail.
- **[NOTE — BY DESIGN] Bulk 5300 market is LABELED SYNTHETIC.** Real per-CU 5300 Call Report data is a
  Bryan-only external item. The SCALE path (whole market → normalize → persist → reconcile at 600) is proven
  HONESTLY on a clearly-labeled synthetic market (`sourcedoc:ncua:5300:synthetic:*`); the connector is
  source-agnostic, so a real bulk feed drops in with NO code change — only the injected `acquire` batch changes.
  The headline truth number (52) is held short of 60 for exactly this reason (no number inflated to a target).
- **[DEFERRED] Catalog is 57/~93.** Wave 2 qualified 18 new source/connector pairs (config-as-data). The
  remaining placeholders toward the DKR ~93 (and more real connector implementations against the SDK —
  FDIC BankFind, SEC full-text, Federal Register are prime next real ones) are a later wave.

### Sprint III Wave 1 — Connector Runtime + SDK (2026-07-22)
- **[BLOCKER — FIXED] Fabricated deletion from a normalization failure.** In
  `core/kernel/connector_runtime.ts`, change detection was run over the successfully-PARSED records
  only; a record that was ACQUIRED but failed to normalize (a rejection) whose `external_ref` was in
  the prior state was treated as ABSENT → emitted as a `deleted` change event. A downstream consumer
  would retire an object that is still present at the source and merely failed to parse — the exact
  "never fabricate a deletion from a failure" rule violation (RFC-2011; DOCTRINE). Surfaced by the
  4-lens adversarial fleet (correctness lens). **Fix:** `detectChanges` now takes `alsoPresentRefs`
  (the seen-but-unparsed rejection refs); a prior ref is a deletion only if absent from BOTH the
  parsed set AND the rejection set. Regression tests added (SDK-level + runtime-level + the CONNECTOR
  debug step). debug-loop 13/13 green after the fix.
- **[NON-BLOCKING — FIXED] Vertical noun leak in core/kernel.** The core rejection-labeler `rawRef`
  hardcoded `charter_number` / `cfr_ref` / `section` (NCUA/regulation nouns) — coupling the generic
  kernel to a vertical (CLAUDE.md: no vertical noun in `core/`). **Fix:** restricted to generic ids
  (`external_ref` / `source_ref` / `ref` / `id`); a connector whose raw keys differ surfaces its own
  ref. A rejection with no derivable ref is still counted + reported, never silently dropped.
- **[NON-BLOCKING — FIXED] Reconcile-to-source gate was vacuous.** `run_connectors.ts` reconciliation
  is an `.every()` over a set that could be empty (→ trivially true if profile lineage vanished). The
  test/debug step now also assert `profile_source_refs.length >= batch.length`, so a dropped-lineage
  regression fails.
- **[NON-BLOCKING — FIXED] Tautological tier-from-source test.** Every test source used
  `default_tier: public_fact`, so a hardcoded tier in `recordToObservation` would have passed. Added a
  second source with a DIFFERENT tier/plane/visibility and asserted the observation reflects THAT
  manifest (proving the value is read from the source, not a constant). Mirrored in the CONNECTOR step.
- **[DEFERRED] Real bulk NCUA 5300 feed.** The 5300 connector runs on the LABELED illustrative batch
  (`batch_fixtures.ts`); a real per-CU bulk 5300 pull is a Bryan-only external item. The runtime +
  the normalize→persist→reconcile path are proven and source-agnostic — Wave 2 swaps the `acquire`
  data source to run the whole market with no code change to the runtime.
- **[DEFERRED] Startup-intake connector.** The "live intake path" into the deal engine (P1/P2) is
  authored as a catalog source (`source:startup_intake`) but not yet wired through the runtime — Wave 2/3.

- **[NON-BLOCKING] Debug harness needs a full checkout to be all-green.** `scripts/debug-loop.mjs`
  TYPECHECK + ENGINE steps require `node_modules` + a local `typescript` dep. Verified in-cloud on a
  partial checkout: ONTOLOGY ✓, CARTRIDGE ✓; code proven green via a consolidated `tsc` over all 18
  session files (exit 0) + a live P1→P2→P3 run. Action: run `npm install` then the harness on the
  Mac / in CI for the real all-green.
- **[DEFERRED] No FinCEN object in the 341-class catalog.** SAR/CTR filing endpoints reference
  `regulation:state_regulators` with a note. Action: consider adding `financial_services:regulation:
  fincen` to the catalog (additive) and repointing SAR/CTR.
- **[DEFERRED] Volume XI label collision.** Bryan's Institutional Intelligence Library labels its
  agent volume "Volume XI — Agent Intelligence"; the repo uses **Volume XI = Canonical Ontology**
  (ADR-0014). Reconcile when the library is folded into the docs set.
- **[DEFERRED] Deal-engine inputs are passed-in / fixtures.** P1 scores + P2 diligence evidence come
  from caller-supplied sourced inputs, not yet derived from live ingestion or the truth store. That
  derivation is the "live intake path" task (before/with P4).
- **[DEFERRED] Investment vehicle TBD (ADR-0016).** P4 settlement `fund`/`spv` adapters wait on
  Bryan's vehicle decision; `advisory`/`syndication` adapters are buildable now (vehicle-agnostic).
- **[RESOLVED 2026-07-21] Migrations `0016` + `0017` APPLIED in Supabase (Bryan).** The full `0001`–`0017`
  chain is live; all 14 registry-table RLS policies confirmed. Unblocks the Object Registry live-persistence
  path + RLS/identity enforcement. Sprint II Wave 1 built the `RegistryPersistencePort` Supabase adapter
  behind the existing seam (default in-memory; drops in when a client is configured) + the RFC-2002
  identity/permission substrate that mirrors the now-live RLS predicates.

## Sprint II Wave 4 — Registry live-persistence + matured resolution + profile persistence (2026-07-22, Sprint II CLOSED)

Additive, new-files-only in `core/`; the registry service + engines UNCHANGED; default stays in-memory.
Adversarially verified by a 4-lens skeptic fleet (correctness · truth-doctrine · purity/determinism ·
test-teeth) + a focused fresh-eyes re-verify of the two most-changed files. Fixes applied before commit:

- **[was BLOCKER → FIXED] Profile persistence conflated planes.** `profileToRow` dropped the
  plane/visibility/workspace_id/organization_id discriminator, so EVERY persisted profile landed on the
  0018 table's fail-closed defaults (`private_terminal`/`tenant_private`/null) regardless of its true plane
  — a shared-market PUBLIC institution/regulation-environment profile and a private tenant profile became
  indistinguishable on persistence (violates DOCTRINE "truth planes never conflated"), and the plane-aware
  RLS I shipped in 0018 could never gate correctly (it always ran against the wrong constants — a dead
  letter). Root cause: `LiveAssembledProfile` carries no plane of its own. **Fix:** the persist unit is now
  a `PersistedProfile { profile, scope }` where `ProfileScope` = {plane, visibility, workspace_id?,
  organization_id?}; the caller (who knows the plane) supplies it, `profileToRow` writes the real
  discriminator columns, and `rowToProfile` restores the scope (original non-uuid ids preserved in
  metadata). Covered by `tests/profile_persistence.test.mjs` (a public and a tenant profile persist with
  distinct discriminators) + a REGISTRY-PERSISTENCE debug assertion.
- **[was NON-BLOCKING → FIXED] "Byte-identical" did not hold against a real Postgres backend.** The first
  cut stored the profile in a `jsonb` snapshot column; Postgres jsonb may renormalize number formatting +
  key order, so `JSON.stringify(hydrated) === JSON.stringify(original)` would break against the real DB even
  though it passed through the in-memory fake. **Fix:** the snapshot is a canonical JSON **string** in a
  `text` column (0018 updated), so a read returns the exact bytes written — the guarantee now holds end to
  end. `rowToProfile` accepts either a text snapshot (real Postgres) or an already-parsed object (a jsonb
  column / an in-memory fake).
- **[was NON-BLOCKING → FIXED] `flush()` could silently drop a write that landed during the await.** The
  first cut cleared the entire pending map after the upsert; a `put()` during the in-flight flush (including
  a re-`put()` of the SAME id) was lost. **Fix:** `flush` captures the exact queued object references, and
  after success deletes an entry ONLY if `pending.get(id)` is still that same reference — a newer value that
  replaced it mid-flush survives to the next flush. Covered by a new-key AND a same-id-re-put test.
- **[was DESIGN GAP → FIXED] The governed write-chain was poisoned by a single flush failure.** A rejected
  `store.flush` left `this.chain` a rejected promise, so every later governed write's flush silently never
  ran while callers still got `ok:true`. **Fix:** `enqueueFlush` catches (first-error-wins into
  `flushError`) so the chain stays alive and later writes still attempt to persist (mirrors the
  catch-and-continue write-through in `core/data/supabase-adapter.ts`); `drain()` surfaces the first error
  (sticky — a failed durable write means persisted state is inconsistent until reconciled). Covered by a
  drain-rejects-on-failure test.
- **[was TEST-TEETH gaps → CLOSED]** serialize concurrency guard (a fake client tracks max in-flight == 1,
  so a non-serialized `Promise.all` impl would be caught); the register-path event/cost emission + the
  CostEntry SHAPE (category/usd/label, not just correlation_id); the resolver min-Jaccard gate (a below-gate
  weak name overlap emits NO `name_similarity` reason); and `core/data/supabase-table-client.ts` coverage
  (driven with a fake SupabaseClient stub — delegation, onConflict, error passthrough, env→null).
- **[RESOLVED — the DEFERRED resolver note]** The Wave-1 "[DEFERRED — resolver-level] Re-proposal does not
  respect a prior human review status" item is closed by `core/registry/resolver.ts`: `proposeMatches`
  reads the store's existing candidates and treats a `confirmed`/`rejected` pair as **sticky** (skipped,
  reported in `skipped_reviewed`) — only genuinely-new pairs are proposed. `ObjectRegistryService.resolve()`
  (the shared-external-id pass the DATA step exercises) is left UNCHANGED per the additive/new-files rule;
  the matured resolver is the new path the REGISTRY-PERSISTENCE step + governed runtime use.
- **[DESIGN NOTE — not a defect] `objectResource` fixes `workspace_id: null`.** Registry objects are the
  shared-market identity index and carry no tenant (`objectToRow` always writes `workspace_id: null`), so a
  governed registry merge authorizes against a null-workspace resource → service-role-only by construction,
  faithfully reproducing the 0017 §8 invariant. Intentional.
- **[NON-BLOCKING — carried] `SupabaseRegistryStore.flush` clears its pending map after the await** (the
  same shape as the profile pre-fix). Benign in practice: governed flushes are serialized by the write-chain
  (each awaited before the next is enqueued) and the registry port is driven only through the governed layer,
  so a put never lands mid-flush there. Left unchanged to honor "don't rewrite the registry adapter"; noted
  so a future direct-caller path applies the same delete-what-you-flushed guard.
- **[DEFERRED] Migration `0018_profile_snapshots.sql` not yet applied in Supabase** (Bryan-only apply, like
  0016/0017). The profile-persistence default is in-memory; the Supabase adapter drops in when a client is
  configured + 0018 is applied. No gate impact.
- **Gate:** debug-loop **ALL GREEN (12/12)** (new **REGISTRY-PERSISTENCE** step) · `tsc --noEmit` exit 0 ·
  `npm run build` exit 0 · **214/214** unit tests (+32). Layers: kernel 46→55, truth 40→45, tests 51→54,
  data 87→88; headline ~47→~50%. Sprint II CLOSED at ~50% (honest recompute; roadmap caveat #4).

## Sprint II Wave 3 — Kernel request envelope + contracts/API (2026-07-22)

- **[was NON-BLOCKING → FIXED] Evidence review bypassed the contract.** The first cut wired the
  proposal/approval/review-queue human gates through `app/contracts.ts` but left
  `reviewEvidenceAction` calling `store.reviewEvidence` DIRECTLY — the adapter's own header claimed
  evidence review was gated, so the claim was false and the authorize-first invariant did not hold for
  that action (harmless in the owner-only demo; a real regression once real auth lands). Surfaced by the
  correctness verifier. **Fix:** `contracts.reviewEvidence(evidenceId, decision)` resolves the evidence's
  workspace via `store.getEvidence(id).work_item_id → getWorkItem`, authorizes "review", then delegates;
  `reviewEvidenceAction` now routes through it (no UI change — the existing form already carries the ids).
- **[was NON-BLOCKING → FIXED] Two test-teeth gaps.** The test-teeth (mutation) verifier confirmed all 8
  probed mutations were caught but found `deriveEnvelope`'s `idempotency_key` threading and the `agent:`
  branch of `envelopeActor` unasserted. **Fix:** added both assertions to `tests/envelope.test.mjs`.
- **[NON-BLOCKING] `MODULE_TYPELESS_PACKAGE_JSON` warning on the PIPELINE/CONTRACTS steps.** Node prints a
  perf warning when it reparses `pipeline.ts` as ESM (no `"type": "module"` in package.json). Pre-existing
  (present since Wave 1's PIPELINE step); cosmetic, does not affect the gate. Action: could add
  `"type": "module"` later, but it risks the Next build's CJS assumptions — left as-is deliberately.
- **[DEFERRED] Demo-session authorization is a tautology by construction.** `app/contracts.ts::envFor`
  synthesizes the principal's membership from the resolved resource workspace with the demo session's role
  (owner), so the live surfaces ALWAYS allow — there is no real membership backend to deny against yet. The
  authorize-first PLUMBING is real and the engine has teeth (proven by `tests/contracts.test.mjs` +
  the CONTRACTS debug step, which exercise reviewer/operator/outsider/agent principals that ARE denied).
  Action: when real Supabase auth + `workspace_memberships` land (Wave 5+/productionization), `sessionPrincipal`
  carries the session's ACTUAL memberships and `envFor` stops fabricating one — the contracts + surfaces
  do not change. Flagged by the correctness verifier as the load-bearing seam to get right later.
- **Gate:** debug-loop **ALL GREEN (11/11)** (new **CONTRACTS** step) · `tsc --noEmit` exit 0 ·
  `npm run build` exit 0 · **182/182** unit tests. Adversarially verified — 4-lens fleet (correctness ·
  doctrine · purity/determinism · test-teeth), 0 blockers.

## Wave 1 — Orchestration spine (2026-07-21)

- **[was BLOCKER → FIXED] Human gate was decorative.** The first cut of `pipeline.ts`
  routed the IC memo with `needs_regulated_conclusion` (router returns `escalate_to_human`),
  but the flag only added a cost entry — the pipeline auto-advanced to allocate/settle/publish
  on the DRAFT memo. That is an autonomous decision on a regulated/financial conclusion (violates
  DOCTRINE/ADR-0005). **Fix:** `ICApproval` is now a caller-supplied INPUT on `DealRunInput`
  (disposition + human `by` + `decision_ref`); GATE 2 halts the run `awaiting_approval` (or
  `declined`) and allocates/settles/publishes NOTHING unless a human disposition is `approved`.
  On approval the IO's `top_tier` becomes `human_approved_conclusion` and the decision_ref enters
  the evidence set. Proven in the debug loop: unapproved golden input → `awaiting_approval`, no
  downstream events; approved → settled. (Found by the Wave-1 adversarial verification fleet.)
- **[was NON-BLOCKING → FIXED] IO ref-partition conflation.** IO `fact_refs` had been built from
  memo-local `ev:*` handles (so claim-tier evidence masqueraded as fact) and `inference_refs` from
  raw score inputs. **Fix:** `partitionRefs()` buckets the real truth-object ids (memo `source_ref`,
  the 5300 filing, score lineage, the human decision) by tier prefix (`claim:`→claim_refs,
  `inference:`/`inf:`→inference_refs, else fact_refs); `claim_refs` is now populated and passed to
  `assembleIO`.
- **[DEFERRED] Per-variant visibility override.** Role-lens variants (CEO/CRO/CFO) inherit the IO's
  `network` visibility from the Auric engine (`renderVariant` copies `io.visibility`). Publication
  now only happens on the APPROVED path (so nothing unapproved is ever published), but a future
  engine enhancement should let a Terminal-channel role variant carry a narrower visibility than the
  market IO. Wave 2/4; engine-side, additive. No truth leak today (variants restate the IO's refs
  exactly — no superset).
- **[NON-BLOCKING] `node file.ts` alias resolution.** Node 22 strips TS types natively but does not
  read tsconfig `paths`, so bare `node scripts/pipeline-demo.ts` needs `@/*` mapped at runtime.
  `scripts/alias-hook.mjs` (a resolve hook, registered before the dynamic import) handles it; it is a
  scripts/ runtime shim only, never imported by `app/` or `core/`, and does not affect `next build`.
  Also: the pipeline avoids TS parameter-properties/enums (erasable-only) so type-stripping runs it.

## Sprint II — Wave 2: Confidence engine → LIVE profile assembly + query (2026-07-22)

Adversarially verified by a 4-lens skeptic fleet (truth-doctrine · purity/determinism · correctness/edge ·
test-teeth). **0 blockers.** Purity/determinism found nothing (clock/random/IO-free; total-order id tiebreak;
no input mutation; erasable-TS clean). Fixes applied before commit:

- **[was NON-BLOCKING → FIXED] Outcome-feedback dropped its evidence lineage.** `assemble_live.ts` promised
  "source-referenced lineage" but the `outcome_adjustments` record stored only the field's source_ref + a bare
  `outcome_count` — a consumer could see "confidence rose 0.90→0.95 over 2 outcomes" but not WHICH verification
  objects drove it (violates DOCTRINE "persist evidence/source/lineage" for a confidence change on financial-ratio
  fields). **Fix:** `OutcomeAdjustment` now carries `outcome_source_refs: string[]` (the ordered evidence refs);
  covered by `tests/assemble_live.test.mjs` (asserts the refs + an empty-lineage case).
- **[was NON-BLOCKING → FIXED] Query field predicate ignored numeric-STRING thresholds.** `matchesFieldPredicate`
  chose numeric vs string mode by `typeof pred.value`, so `{op:"gte", value:"7"}` (as query params arrive) fell to
  the string branch (eq-only) and silently returned false for EVERY profile. **Fix:** ordering ops (gte/gt/lte/lt)
  now coerce both sides via a shared `toNum` and compare numerically, failing closed on a non-finite side; `eq` is
  numeric when both coerce, else exact string equality. Covered by a numeric-string-threshold test.
- **[was NON-BLOCKING → FIXED] Blank/whitespace field value coerced to numeric 0.** `Number("")===0`, so a present
  blank string spuriously satisfied `>= 0` / `== 0` (and ranked as 0). **Fix:** `toNum` maps blank/whitespace and
  non-numeric strings to NaN; the predicate + `rankScalar` fail closed. Covered by a blank-value test.
- **[was NIT → FIXED] Missing rank-field floated to the TOP on `dir:"asc"`.** `rankScalar` returned `-Infinity`
  for a field-less profile, which sorts FIRST ascending (wrong "smallest-N"). **Fix:** `rankScalar` returns
  `number | null`; the comparator sinks `null` to the LOSING end in BOTH directions. Covered by an asc/desc
  field-less-sinking test.
- **[was TEST GAP → FIXED] 3 mutation-survivors closed.** (a) `rank_by` health/completeness/field_confidence
  branches were wholly untested — added per-branch ordering assertions. (b) Outcome ORDER-dependence was not
  pinned (`[agree,disagree]`=0.48 vs reversed 0.52 both passed the old loose bound) — now asserts the exact 0.48
  and `notEqual` to the reversed order. (c) The freshness→`min_field_confidence` filter was never composed
  end-to-end — added a test (+ a debug-loop PROFILES assertion) that a genuinely STALE live-assembled field falls
  below the floor and is filtered out while its fresh sibling survives.
- **[NON-BLOCKING] `min_field_confidence` is a combined confidence+freshness floor, not a pure freshness filter.**
  Post-decay confidence folds in base confidence + outcome adjustment + freshness, so a durable high-base field can
  clear the floor while genuinely aging. The comment was corrected to say so; the per-field freshness scalar/band is
  already carried on `LiveAssembledProfile.field_freshness`. **Action (follow-on):** add a dedicated
  `min_field_freshness` predicate over `field_freshness` when a caller needs to filter freshness INDEPENDENTLY.
- **[DEFERRED] Live profiles are computed, not PERSISTED.** `buildLiveProfiles` assembles + queries in-memory each
  call; a persisted profile store (+ the matured entity-resolution pipeline populating it) lands with the Supabase
  registry-client wave (truth 40→45). The institution 5300 figures remain LABELED FIXTURES (real per-CU connector
  deferred, Bryan-only); the regulatory corpus is REAL at scale.

## Sprint II — Wave 1: Identity & Tenancy + permission engine + registry live-persistence adapter (2026-07-21)

- **[was BLOCKER → FIXED] Agent principal could WRITE a row it could not READ.** The adversarial fleet found
  `readPlaneDecision` gated on `isAuthenticated` (agent → denied) but `writeTenantDecision` did not, so an
  `agent` principal holding a membership was granted writes while denied all reads — an inconsistent,
  half-authenticated citizen the SQL (which knows only `auth.uid()` + service role) has no equivalent for.
  **Fix:** `writeTenantDecision` now returns `deny("unauthenticated")` for a non-user principal first, exactly
  mirroring that `app_can_write_tenant` is evaluated in the invoker (auth.uid) context; the service role bypasses
  ABOVE the predicate in `authorize()`. Agents needing platform reach run as the service role; agents acting for
  a user carry that user's Principal. Covered by a new `tests/permissions.test.mjs` case + the debug-loop
  PERMISSIONS step (agent-with-membership denied write).
- **[was NON-BLOCKING → FIXED] `SERVICE_PRINCIPAL` "Frozen" comment had no `Object.freeze`.** The singleton
  returned by `systemPrincipal()` was a shared mutable reference — `systemPrincipal().memberships.push(...)`
  would have mutated the platform identity globally. **Fix:** `Object.freeze` on both the object and its
  memberships array (a push now throws in strict mode / no-ops otherwise). Service never uses memberships
  anyway (isMember short-circuits), so this is purely defensive — but the comment is now true.
- **[was NON-BLOCKING → CLARIFIED] Generic `authorize("write")` set vs the intelligence-object exception.** The
  fleet noted the generic "write" verb maps to owner/admin/operator (matches `app_can_write_object` + the truth/
  relationship/registry insert policies), but 0016 §5 `io_write` gates intelligence-object INSERTS on owner/admin
  only. No caller routes an IO insert through the generic verb today, so this is latent, not live. **Resolution:**
  added an explicit `IO_WRITE_ROLES = ["owner","admin"]` constant + a doc comment on `authorize` documenting that
  an IO insert must use that set (or action "update"), with a test asserting operator is excluded from it. The
  generic verb stays correct for the common tables + the registry path this wave targets.
- **[RESOLVED] Permission engine is a faithful mirror of the RLS predicates.** `core/kernel/permissions.ts`
  reproduces `app_can_read_plane` / `app_can_write_tenant` (0016 §0) + `app_can_admin_object` (0017 §8)
  line-for-line: public read, shared_market+network read, tenant-member read, fail-closed on a tenant-visibility
  row with a null workspace; insert = owner/admin/operator, update/IO/admin = owner/admin. Verified against the
  SQL by the adversarial fleet + a debug-loop **PERMISSIONS** step (authz == the RLS truth table) + 
  `tests/permissions.test.mjs` (mutation-probed: operator-insert-not-update, shared-market-merge-service-only,
  agent-unauthenticated, fail-closed null workspace).
- **[DESIGN NOTE — not a defect] `agent` principals are unauthenticated in the RLS mirror.** `isAuthenticated`
  is true only for `kind:"user"` (the `auth.uid()` invoker). An automation that needs platform reach runs as the
  **service** principal (RLS bypass, matching how shared-market ingestion is written per 0016 §0); an agent acting
  for a user carries that user's Principal. This keeps the mirror exact rather than inventing an auth path the SQL
  does not have.
- **[DESIGN NOTE — not a defect] Registry adapter carries `external_ids`/`aliases` in `metadata`.** The
  identity-index round-trip (`objectToRow`/`rowToObject`) preserves provider ids + aliases in the
  `object_registry.metadata` jsonb rather than the dedicated `object_external_ids`/`entity_aliases` child tables.
  Nothing is lost (round-trip proven by `tests/registry_supabase_store.test.mjs`); normalizing into the child
  tables is a documented follow-on when the resolver writes those tables directly.
- **[was NON-BLOCKING → FIXED] Hydrate order was DB-order-dependent (non-deterministic).** The fleet noted
  `selectAll` has no ORDER BY and a batch shares `created_at`, so `resolve()`'s candidate array was not
  reproducible across a restart. **Fix:** `hydrate()` now imposes a STABLE total order before loading (objects
  by `(created_at, id)`, candidates by the unordered pair, merges by `(created_at, survivor|merged)`), so the
  port's insertion-ordered/deterministic contract holds regardless of DB return order. Covered by a new
  reversed-row-order test.
- **[was NIT → FIXED] Non-uuid `object_ref` did not round-trip.** `objectToRow` remaps a non-uuid `object_ref`
  to a uuid; the original is now also preserved in `metadata.object_ref` and restored by `rowToObject`
  (typed-table PKs are uuids in practice, so this only bit a synthetic ref — closed anyway for no-data-loss).
  Covered by a new round-trip test.
- **[was TEST GAP → FIXED] Merged-object row fidelity was untested.** The fleet mutation-verified that
  `objectToRow` could drop `status`/`merged_into_id` and stay green (a merged object would resurrect as active
  on hydrate). `objectToRow` was already correct; the gap was coverage. **Fix:** added a merged-object
  round-trip test asserting `status=merged` + the survivor pointer survive.
- **[DEFERRED — resolver-level, not adapter] Re-proposal does not respect a prior human review status.**
  `ObjectRegistryService.resolve()` re-proposes a still-active pair every run (the in-memory store resets it to
  `proposed` on re-put); persisting a candidate then re-flushing would reset a DB row's status from
  `rejected`/`confirmed` back to `pending`. This is a property of the EXISTING resolver (identical in the
  in-memory store — the adapter mirrors it faithfully, not a regression), and fixing it means the resolver
  skipping already-reviewed pairs — a `service.ts` change for when the review/merge workflow lands. Left to that
  wave to respect the additive/new-files-only rule; noted so persistence wiring gates candidate upserts on it.
- **[NON-BLOCKING] Registry adapter port is sync; live persistence is hybrid.** `RegistryPersistencePort` is
  synchronous, so `SupabaseRegistryStore` serves reads/writes from an insertion-ordered in-memory snapshot and
  queues writes; the async edges are `hydrateFromSupabase(client)` + `flush(client)` (mirrors
  `core/data/supabase-adapter.ts`). A thin runner that constructs the `@supabase/supabase-js` client and calls
  `flush` on a write-chain is the remaining wiring (Sprint II follow-on) — the adapter + mappers are done + tested.

## Wave 4 — Auric distribution + hardening (2026-07-21, COMPLETE — Sprint I closed)

- **[RESOLVED] `brief` channel now carries a delivery.** The pipeline renders a `brief` **channel-lens**
  variant (appended LAST so the pre-existing market/role variant ids stay byte-identical). A `channel` lens is
  dropped by `buildFeed` (`matchesContext`), so the ranked feed is unchanged, but `distribute()` filters by
  `v.channel` so the brief variant lands on the `brief` channel — an approved publication now delivers **5
  across 3 channels** (brief/market_feed public, terminal_feed network). Verified by the debug-loop EDITORIAL
  step + `tests/distribution.test.mjs`.
- **[RESOLVED] Engine unit tests + CI.** `tests/*.test.mjs` (92 tests) wired into the debug loop (TESTS step)
  + GitHub Actions (`.github/workflows/ci.yml`). Mutation-tested for teeth: breaking the editorial gate → 2
  failures; breaking approved-evidence-only → caught by `tests/ic_memo_approved_only.test.mjs` (added after the
  first probe found the original citation/excluded assertions did NOT cover the COVERAGE path).
- **[RESOLVED] Registry resolver + merge guards.** `is_identifier` on `ExternalId` (default true — a
  non-identifying shared external id like `{system:"state"}` no longer proposes a spurious duplicate) +
  `applyMerge` liveness (contradictory re-merge into a different survivor throws) + `ultimateSurvivor`
  transitive-survivor resolution (with a cycle guard). Covered by `tests/registry_guards.test.mjs`. This burns
  down the Wave-3 "[NON-BLOCKING / DEFERRED] Object Registry resolver + merge lack defensive guards" item.
- **[RESOLVED] FinCEN object.** Added `financial_services:regulation:fincen` to the 341-class catalog and
  repointed the compliance ontology's SAR + CTR `filed_with_regulator` targets from `state_regulators` to it.
  Closed graph holds (181 objects, 0 unresolved). Burns down the Wave-0 "[DEFERRED] No FinCEN object" item.
- **[was NON-BLOCKING → FIXED] Router confidence-escalation floating-point drift.** `route()` computed
  `steps = ceil(shortfall / 0.2)`; a "round" shortfall like `0.9 - 0.3 = 0.6000000000000001` ceils to 4 rungs
  instead of the intended 3. **Fix:** `ceil(shortfall / 0.2 - 1e-9)`. Deterministic; the router unit tests
  (0.1→1 rung, 0.8→4 rungs) still hold. (Found by the unit-test agent.)
- **[DEFERRED] Distribution not yet surfaced → RESOLVED.** `/distribution` (`app/distribution/page.tsx` +
  `components/terminal/DistributionView.tsx`) renders the HELD-vs-APPROVED gate story + every delivery's
  lineage. Observability likewise surfaced at `/observability`.
- **[NON-BLOCKING] Allocation LP-identity reason label.** `allocation.ts:122` — for an LP missing BOTH KYC
  and KYB, the reason is always `kyc_incomplete` (the `kyb_incomplete` arm of the ternary is unreachable inside
  `!kycOk`). Harmless (identity is correctly gated; only the label is imprecise). Action: report both missing
  identity docs, or the kind-appropriate one. Left untouched to avoid churn on a heavily-tested engine.
- **[NON-BLOCKING] Transitive re-merge conservatively throws.** Re-applying `applyMerge(A,B)` AFTER A has
  itself been merged into C resolves the survivor to C and the liveness guard throws (B still points at A).
  This is intentional-conservative: it refuses an ambiguous re-merge rather than silently forking/flattening
  the append-only lineage. Real-world merges are single-level today (the DATA step + tests exercise only direct
  merges). Action (post 0016+0017): if path-compression is wanted, treat B→A→C as consistent and no-op.
- **[DEFERRED] FR per-rule SourceDocument attribution (carried from Wave 3).** Amendment truth objects still
  cite the eCFR bulk corpus `source_document_id`, not a per-FR-rule SourceDocument (full FR provenance is
  retained in `provenance_metadata` + `claimant_ref`, so nothing is lost — the indexed chain is imprecise).
  Cheap-but-not-trivial (touches provenance + would shift byte output); deferred to the real FR connector.
- **[DEFERRED] Volume XI label collision (carried).** Doc reconciliation pending Bryan folding his
  Institutional Intelligence Library into the docs set; not a code change.
- **[NON-BLOCKING] Per-delivery visibility is the channel default.** `distribute()` sets each delivery's
  visibility from its `ChannelSpec` (terminal_feed→network, market_feed/brief→public). A future policy step could
  narrow an individual variant below its channel default (the Wave-1 per-variant-visibility carry-over). No leak
  today — deliveries restate the IO refs exactly and only publish on the approved editorial path.
- **[DEFERRED] Distribution not yet surfaced in the Terminal.** `core/auric/distribution.ts` runs + is gated in
  the debug loop, but no UI renders the channel deliveries. A channel/distribution Terminal surface is a Wave-4
  continuation item.

## Wave 3 — Live data + kernel/truth services (2026-07-21)

- **[was ENV RISK → RESOLVED] JSON import under bare-Node type-stripping.** `ingest_regulations.ts`
  originally `import`ed the 2.7 MB corpus JSON at module top level; the debug loop imports the module
  under Node native type-stripping, where a bare `import x from "*.json"` throws (missing import
  attribute). **Fix:** split the loader into `ingest_regulations_data.ts` (static JSON import — Next/webpack
  inlines it) so the pure ingestion module stays side-effect-free; the debug loop reads the JSON via `fs`
  and passes parsed records in. tsc + build + debug-loop all green after the split.
- **[was WEAK-GATE → FIXED] DATA-INTEGRITY step had too many construction-identity asserts.** The Wave-3
  adversarial fleet flagged that several DATA-step assertions restated module constants and no source count
  was pinned, so silent source-corpus shrinkage could pass green. **Fix:** pinned the source shape
  (`records.length === 675`, `amendments.length === 10`), added a unique-truth-object-id check, a
  one-object-per-source-record check, and an **independent ratio oracle** (raw 5300 figures worked out
  longhand vs the assembled profile — a real cross-check, not `computeCallReportFacts` compared to itself).
  Re-ran: ALL GREEN (6/6).
- **[NON-BLOCKING] FR-amendment truth objects cite the eCFR-corpus SourceDocument, not a per-rule one.**
  Amendment observations/claims set `source_document_ids: [ctx.source_document_id]` (the eCFR bulk corpus),
  though the governing Federal Register rule is their real raw source. Full FR provenance is retained in
  `provenance_metadata` (`fr_url` / `fr_document_number` / `fr_citation` / `fr_rule_title`) and the claim's
  `claimant_ref`, so nothing is lost — but the indexed `source_document_ids` chain is imprecise. Action:
  when the real FR connector lands, emit a dedicated `source_documents` row per FR rule XML (`fr_rules/*.xml`)
  and repoint. Additive.
- **[NON-BLOCKING / DEFERRED] Object Registry resolver + merge lack defensive guards (behind the seam).**
  (a) `resolve()` trusts every `external_id` to be a true identifier — a shared *non-identifying* external id
  (e.g. `{system:"state"}`) would propose a spurious candidate. (b) `applyMerge()` has no liveness guard:
  contradictory caller merges (re-merge to a different survivor; merge into an already-merged object) can make
  the append-only lineage self-inconsistent. Neither affects the gate or the `/market` surface (the batch uses
  `ncua_charter` as the sole external id, and the service is exercised only with well-formed merges). Action:
  add an `is_identifier` flag on external-id systems + transitive-survivor resolution + already-merged guards
  when the service is wired to live persistence (post `0016`+`0017`, RFC-2003). Registry runs in-memory until then.
- **[DEFERRED] Institution 5300 batch is a labeled fixture batch, not real filings.** The real NCUA data
  present is regulatory, not per-institution 5300 financials, and none were fabricated/fetched.
  `batch_fixtures.ts` is explicitly labeled illustrative. The real per-CU 5300 connector (bulk NCUA Call
  Report data → institution profiles at scale) is a Sprint-III / Bryan-only connector task. The regulatory
  ingestion IS real and at scale (675 + 10).

## Wave 2 — Terminal UI (2026-07-21)

- **[was BUG → FIXED] IO `relevance` is `Record<string, unknown>`.** The Terminal view-model read
  `run.io.relevance?.score` / `.evidence_count`, which typed as `unknown` and failed the Next build's
  TypeScript pass. **Fix:** coerce with `typeof x === "number" ? x : fallback` in `app/terminal/page.tsx`.
  (Caught by `npm run build`'s type step, not `tsc --noEmit` alone — both are now part of the Wave 2 gate.)
- **[NON-BLOCKING] Terminal reads the golden fixture, not persisted/live data.** `app/terminal/page.tsx`
  runs `runDealPipeline(halcyonSummitRun())` server-side each render. Live NCUA data at scale +
  persistence is Wave 3 (gated on `0016`/`0017` for the registry service).
- **[DEFERRED] Per-variant visibility (carried from Wave 1).** Role-lens variants still inherit the IO's
  `network` visibility; the Terminal renders them on the `terminal_feed` channel, which is correct for
  the institution surface, but the engine-level per-variant visibility override remains a Wave 2/4 item.

## Notes / design choices (not issues)

- Opportunity Score uses a **geometric mean** of strategic × regulatory × timing (keeps 0–100 scale
  while letting any weak dimension sink the pairing) — VC_DEAL_ENGINE_SPEC §5.
- Local validation uses a **faithful `SeedBundle` shim** for `@/core/data/store` (the real store
  pulls the whole engine cone, irrelevant to type-checking config/engine literals). The full-app
  `tsc` in the harness is the real gate; the shim never ships.

## Monster batch (2026-07-20)

- **[NON-BLOCKING] 7 new subsystem modules are not yet wired into a running pipeline.** kernel
  (event_bus, cost_ledger), truth (confidence), harness (router), auric (engine), settlement,
  ingest_call_report — all strict-`tsc` clean and integration-clean (25-file consolidated
  typecheck exit 0), but they're libraries, not a running system. Wiring = Sprint Wave 1
  (`docs/00_governance/SPRINT_PLAN.md`).
- **[NON-BLOCKING] `terminal_demo.html` is a static mock**, not the Next.js Terminal. Real UI =
  Sprint Wave 2.

## Resolved

- **[was risk] Parallel-agent integration.** 6 agents wrote 7 modules concurrently; verified they
  compile TOGETHER (not just individually) via a consolidated strict `tsc` over all 25 session
  files → exit 0. No cross-module type drift. (2026-07-20)

- **[was BLOCKER] Debug harness false-green.** The ENGINE step was async but not awaited, so its
  assertions ran after the summary and never gated the result. Fixed: `step()` awaits async checks;
  re-verified the engine invariants actually assert. (2026-07-20)
- **[was BUG] `MetricType "opportunity"` invalid** in the cartridge (it's a `RuleType`, not a
  `MetricType`). Fixed → `operational`. (2026-07-20)
