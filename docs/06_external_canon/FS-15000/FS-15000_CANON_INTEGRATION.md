# FS-15000 Market-Facing Canon — Integration & Crosswalk

**Status:** Adopted 2026-07-22 (ADR-0018) · **Kind:** external reference / operational canon (not a build spec) · **Location:** `docs/06_external_canon/FS-15000/` (`SECTIONS/` = the 15 volumes; `CONTROL/` = package/manifest/validation/integrity indexes)

Companion narrative to `ADR-0018-FS-15000-MARKET-FACING-CANON-ADOPTION.md`, and the sequel to `../FS_V1_CANON_INTEGRATION.md` (which covers the FS-4000…14000 operating-system canon adopted in ADR-0017). This document says what FS-15000 is, where each of its 15 sections maps in the running product, and the rules for using it.

---

## 1. What this canon is (and is not)

FS-15000 is a **documentation-complete V1 product architecture** for the *market-facing* layer — the Auric, Named Terminals, public/claimed profiles, journeys, governed engagement, the relationship graph, matching, editorial integrity, and the network flywheel — 15 sections (FS-15001…FS-15015), ~700 KB of narrative + JSON schemas + state machines + registries described in prose.

It is **not software and not production-ready**, and says so in its own control layer (`CONTROL/VALIDATION_REPORT.json`): *"Documentation-complete validation only. Software execution, live integrations, penetration testing, and production deployment were not performed."* Its README states it deliberately stops at **~75%** (product architecture, not implementation specs).

So it is adopted as a **reference / operational layer**, never a competing build canon. The repo Constitution (Vol I) → ADRs → subsystem volumes → live registries remain the authority for **what is built**. FS-15000 is the authority for **interpretation and verticalization** of the customer-facing product, and the source spec for those surfaces as their waves arrive.

**Where FS-4000…14000 (ADR-0017) spec the operating system, FS-15000 specs how the market experiences it.** The two are complementary halves of one product.

---

## 2. Alignment — it agrees with what is already built

A section-by-section review found **doctrinal alignment and zero contract conflicts** with the running, tested system. The repeated points of contact:

- **Brand hierarchy** (Auric = publication-of-record · [Institution] Terminal = customer product · Dispatch OS = invisible kernel · cartridges = configuration mechanisms) — the repo brand hierarchy verbatim (`CLAUDE.md` non-negotiables).
- **Provenance + state vocabulary** — FS `{public, private, synthetic, attested, inferred, agent_generated, verified}` × `{current, aging/stale, unknown, disputed, superseded, restricted, pending-review}` map ~1:1 onto the repo truth planes (`shared_market` vs `private_terminal`) and surface states (`current/missing/stale/inferred/synthetic/restricted/pending_approval/conflicted`). Vocabulary reconciliation only (FS `disputed`≈repo `conflicted`; FS `unknown`≈repo `missing`; FS `attested`/`verified` have no exact repo state yet) — **not a contract conflict**.
- **Human authority** — "agents cannot publish / cannot approve," "matching never replaces a human institutional decision," aggregate scores cannot cross a hard gate — the repo ICApproval + EditorialDisposition + permission-engine discipline.
- **Editorial / commercial separation** — "editorial truth is not for sale," sponsorship never touches organic rank, private data stays private — the repo editorial gate on `/distribution` + `/reports`.
- **Relationships are first-class objects; inference ≠ fact; claiming ≠ verifying; payment ≠ verification** — repo doctrine.

The one thing dispositioned in the ADR is **authority framing**: FS-15015 calls itself the "Product Constitution" and self-ranks above everything but law, omitting Vol I. ADR-0018 §2 resolves it — FS-15015 is subordinate operational doctrine; Vol I remains the build constitution; charter amendments flow through the repo ADR process. Substance aligned, precedence corrected.

---

## 3. Section → repo crosswalk

| FS | Section | Maps to (live unless noted) | Status |
|---|---|---|---|
| 15001 | Product Doctrine & Market-Facing Architecture | Whole product; brand hierarchy | ALIGNED — doctrine already in code |
| 15002 | The Auric Publication-of-Record Architecture | `/distribution`, `/proposals`, `/review`, `/evidence` | ALIGNED — editorial gate live |
| 15003 | Canonical Content Object & Editorial Lifecycle | `/proposals`, `/distribution`, `/reports` | ALIGNED — provenance-preserved, inference≠fact |
| 15004 | Omnichannel Publishing & Delivery Engine | `/distribution`, Terminal feed → `/` + `/dashboard` | ALIGNED — extends distribution |
| **15005** | **Public / Claimed / Verified Profile System** | **scaffold `/executives`, `/institutions`; + a new public-profile/claim surface** | **⭐ Wave-4 pull-in (profile store + seed)** |
| 15006 | Named Terminal Product Model | Terminal shell, `/cartridges`, scaffold `/administration` | ALIGNED — "branding cannot override governance" |
| 15007 | Terminal Editions & Configuration Model | `/cartridges`, scaffold `/administration` | ALIGNED — entitlement never overrides a security/approval deny |
| 15008 | Fintech & CUSO Institutional Readiness Journey | `/opportunities`, `/workflows`, `/work`, `/approvals` | ALIGNED — Wave-5 layer over the profile/relationship objects |
| 15009 | Credit Union & Institution Innovation Journey | `/terminal`, `/opportunities`, `/workflows`, `/approvals`, `/reports` | ALIGNED — human authority per material decision |
| 15010 | Governed Engagement & Market Workflow | `/opportunities`, `/workflows`, `/work`, `/approvals`, `/evidence` | ALIGNED — signal≠engagement, agent≠approver |
| **15011** | **Institutional Network & Relationship System** | **scaffold `/relationships` (biggest gap — no store/seed), `/network`** | **⭐ Wave-4 pull-in (relationship store + seed)** |
| 15012 | Matching, Eligibility & Opportunity Distribution | `/opportunities` (ICApproval gate), `/market`, `/search`, `/network` | ALIGNED — hard gates uncrossable by score |
| 15013 | Editorial Integrity, Conflicts & Commercial Separation | `/distribution`, `/reports`, `/approvals` | ALIGNED — editorial/commercial separation live |
| 15014 | Network Flywheel, Growth & Ecosystem Strategy | cross-cutting; `/observability`, `/dashboard`, `/reports`, `/network` | ALIGNED — "growth that weakens truth is not growth" |
| 15015 | Product Constitution & Platform Charter | governs all surfaces | ALIGNED (substance); authority SUBORDINATE to Vol I per ADR-0018 §2 |

---

## 4. Wave-4 pull-in — the profile + relationship store (the biggest gap)

`/relationships` and `/executives` are scaffolds because the store has **no `Relationship`/`PersonalProfile` list accessor or seed** (executives exist only as seed `Entity` rows). FS-15005 + FS-15011 are the spec for exactly that store. A Wave-4 additive store table + seed (a pure store-free `run_*` fixture runner also works, per the strip-safety seam) would carry:

**From 15005 → a profile/`PersonalProfile` contract** (serves `/executives`, `/institutions`): root `profile_record` with `subject_type ∈ {institution, company, executive, board, committee, product, relationship, market_theme}`; layered `public` / `claimed` / `tenant_private` projections + `profile_share_grant`; `profile_field` carrying `verification_state`, `visibility`, `source_type`, `freshness_state` (these map onto the repo's existing surface states); a claim lifecycle state machine (`UNCLAIMED → … → APPROVED → ACTIVE`, `+ SUSPENDED/REVOKED/EXPIRED/FRAUD_HOLD`).

**From 15011 → a `Relationship` contract** (serves `/relationships`, `/network`): canonical `relationship` (`REL-…`) with `parties[]` (`party_type ∈ {institution, company, person, group, event, opportunity}`, `role`, `authority_scope`), `status`, `verification_state`, `visibility ∈ {public, network, tenant, group, private, restricted}`, `confidence`, `strength_score`, `freshness_status`, `owner`/`steward`, `permitted_uses`/`prohibited_uses`, `consent_record_ids`, `evidence_ids`; a Relationship Type Registry (18 `RELTYPE-*`: employment, board-service, committee, membership, ownership, investment, vendor, customer, partnership, pilot, implementation, referral, introduction, peer, expertise, professional, event, follow/watch). Invariant to preserve: **ownership = stewardship only, grants no transaction authority.**

Both are additive and consistent with "relationships are first-class objects" — new contracts, no amendment to a tested one. Promote each scaffold the Wave-2/3 way: pure store-free view-model builder in `app/_surfaces/`, server page reads the store, states rendered visibly distinct, human gates routed through the permission engine, a debug-loop step + unit tests with negative-control teeth.

---

## 5. New surfaces implied (recorded, not created)

Per ADR-0018 §5, surfaces are added to `ui_surfaces.json` only when built. FS-15000 implies three market-facing surfaces the 23-surface registry does not yet carry:

1. **Public profile / claimed-profile surface + claim workspace** (15005) — the *public published profile view* + the *claim/verify/dispute* workspace, distinct from the internal `/institutions` directory and `/executives`. Candidate registry home: a market-facing (`shared_market`) surface paired with `/institutions` + `/executives`.
2. **Named-Terminal editions / entitlement admin** (15006 + 15007) — Terminal manifest + edition/entitlement + provisioning, distinct from `/cartridges` (installed-config manifest). Candidate home: the admin/platform section, adjacent to `/administration` + `/cartridges`.
3. **Public Auric publication reader surface** (15002/15004) — public article/feed/market-map pages; partially covered by `/distribution` (the editorial gate) but not the public reader surface itself. May be dispositioned as "covered by `/distribution`" or added as a distinct `shared_market` surface later.

---

## 6. Rules for using this canon (arm's length)

- It is a **map you consult, not a to-do list you obey.** A section is integrated only when a wave needs it and it passes the repo's own gate (contracts + tests + debug-loop).
- The package's "expand every section to 100%" README plan **does not drive the build order** — the running-slice discipline does.
- Its "constitutional / immutable" tone (esp. 15015) never overrides Vol I or the gate. Authority precedence: **Constitution Vol I → ADRs → subsystem volumes → registries → `ACTIVE_BUILD.md`** (`CLAUDE.md`).
- When a wave builds a live registry against an FS-15000 section, reconcile its identifiers the ADR-0017 way: propose by deterministic similarity, never auto-merge, human-confirm, closed-graph-validate, gate with the debug-loop CANON step.
- The test for the *next* dump: does it contradict a contract already shipped and tested? If no (as here), it is optional reference material adopted only when a wave needs it.
