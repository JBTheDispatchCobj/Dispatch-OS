// app/market/page.tsx
//
// Olympic Sprint — Wave 3. The Cooperative Markets "market / institution list"
// surface (Vol VII), the second real Terminal surface after `/terminal`. This
// SERVER component runs the Wave-3 LIVE-DATA path and shapes a serializable
// view-model for the client `MarketView`:
//
//   * REGULATORY (real): `ingestRegulatoryCorpus` over the REAL staged NCUA corpus
//     (675 in-force 12 CFR sections + 10 pending amendments) → sourced, bi-temporal
//     `public_fact` truth objects. This is the honest "live NCUA data at scale":
//     the data staged in docs/04_sources/ncua/ is regulatory text, not 5300s.
//   * INSTITUTIONS (fixture batch): `ingestInstitutionBatch` over a clearly-labeled
//     illustrative 5300 batch → computed call-report facts + an assembled
//     institution profile each (RFC-3012, confidence engine). The real per-CU 5300
//     connector is a deferred Bryan-only item — these are fixtures, not real filings.
//   * REGISTRY (behind the seam): the Object Registry service resolves the batch's
//     canonical institution objects; persistence + live resolution are gated on
//     migrations 0016+0017 (route around — build now, wire after the apply).
//
// Deterministic: a fixed `generatedAt`/`observedAt` stamp (no clock) so the page
// prerenders statically and reproducibly.

import {
  ingestRegulatoryCorpus,
  makeRegulatorySourceDocument,
  type RegulatoryIngestContext,
} from "@/cartridges/cooperative_markets/ingest_regulations";
import { loadRegulatoryCorpus } from "@/cartridges/cooperative_markets/ingest_regulations_data";
import { institutionBatchFixtures } from "@/cartridges/cooperative_markets/batch_fixtures";
import {
  ingestInstitutionBatch,
  type BatchContext,
} from "@/cartridges/cooperative_markets/ingest_batch";
import {
  ObjectRegistryService,
  InMemoryRegistryStore,
} from "@/core/registry/service";
import {
  MarketView,
  type MarketVM,
  type MarketInstitutionVM,
} from "@/components/terminal/MarketView";

export const metadata = {
  title: "Cooperative Markets — Market",
  description:
    "The live NCUA regulatory corpus + institution profiles, assembled from sourced facts.",
};

// Deterministic stamps (no clock — keeps the prerender reproducible).
const GENERATED_AT = "2026-07-21T17:00:00.000Z";
const NCUA_ISSUE_DATE = "2026-07-15";

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}

export default function MarketPage() {
  // --- REGULATORY (real corpus) ---------------------------------------------
  const { records, amendments } = loadRegulatoryCorpus();
  const regCtx: RegulatoryIngestContext = {
    issue_date: NCUA_ISSUE_DATE,
    observed_at: GENERATED_AT,
    source_id: "source:ncua_regulations",
    source_document_id: "sourcedoc:ncua:regulations:2026-07-15",
    id_prefix: "ncua:reg",
  };
  // makeRegulatorySourceDocument is exercised for the provenance chain; the corpus
  // carries its own source_document, so we just run the full corpus ingestion.
  void makeRegulatorySourceDocument;
  const corpus = ingestRegulatoryCorpus(records, amendments, regCtx);

  const topParts = [...corpus.parts]
    .sort((a, b) => b.count - a.count || (a.part < b.part ? -1 : 1))
    .slice(0, 10)
    .map((p) => ({ part: p.part, part_title: p.part_title, count: p.count }));

  const pendingAmendments = amendments.map((a) => ({
    section: a.section,
    fr_citation: a.fr_citation,
    effective_on: a.effective_on,
    amendment_type: a.amendment_type,
    inForce: a.in_force_as_of_base_file,
  }));

  // --- INSTITUTIONS (fixture batch → profiles) ------------------------------
  const batchCtx: BatchContext = { observed_at: GENERATED_AT, id_prefix: "coop:batch" };
  const batch = ingestInstitutionBatch(institutionBatchFixtures(), batchCtx);

  const institutions: MarketInstitutionVM[] = batch.map((b) => ({
    name: b.facts.institution,
    charter: b.facts.charter_number,
    period: b.facts.period,
    profileConfidence: b.profile.confidence,
    health: b.profile.health,
    completeness: b.profile.completeness,
    topTier: b.profile.top_tier,
    net_worth_ratio: b.facts.net_worth_ratio,
    roa: b.facts.roa,
    loan_to_share: b.facts.loan_to_share,
    delinquency_ratio: b.facts.delinquency_ratio,
    member_growth: b.facts.member_growth,
    source_ref: b.facts.source_ref,
  }));

  // --- REGISTRY (behind the seam; gated on 0016+0017) -----------------------
  // Register each batch institution as a canonical object and run resolution.
  // The resolver only PROPOSES scored duplicate candidates; nothing is merged
  // (truth discipline). Persistence is in-memory until Bryan applies 0016+0017.
  let idN = 0;
  const registry = new ObjectRegistryService(new InMemoryRegistryStore(), {
    idGen: () => `reg:obj:${idN++}`,
    now: GENERATED_AT,
  });
  for (const b of batch) {
    registry.register({
      object_class: "entity:coop_markets:credit_union",
      canonical_slug: slugify(b.facts.institution),
      display_name: b.facts.institution,
      plane: "shared_market",
      visibility: "public",
      source_table: "entities",
      external_ids: [{ system: "ncua_charter", value: b.facts.charter_number }],
      aliases: [b.facts.institution],
    });
  }
  const candidates = registry.resolve();

  const vm: MarketVM = {
    generatedAt: GENERATED_AT,
    institutionCount: institutions.length,
    institutions,
    regulatory: {
      issueDate: NCUA_ISSUE_DATE,
      totalSections: corpus.total_sections,
      parts: topParts,
      pendingAmendments,
      heldInstructions: corpus.held_instructions,
    },
    registry: {
      canonicalObjects: registry.objects().length,
      matchCandidates: candidates.length,
      merges: registry.merges().length,
      note: "Object Registry service runs behind the persistence seam; identity resolution proposes duplicate candidates (human-gated — never auto-merged). Live persistence + shared-market resolution go live once migrations 0016+0017 are applied.",
    },
  };

  return <MarketView vm={vm} />;
}
