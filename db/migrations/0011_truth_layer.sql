-- dispatch-os / db/migrations/0011_truth_layer.sql
--
-- Cooperative Markets foundation, step 1 of the truth architecture.
-- FORWARD-ONLY and ADDITIVE: earlier migrations are never rewritten.
--
-- Adds the shared TRUTH layer: an immutable source_documents record plus the
-- assertion family (observations, claims, calculations, inferences,
-- verifications). Each row carries the provenance + bi-temporal envelope as
-- INDEXED COLUMNS (DATA_ARCHITECTURE: JSON may extend an object but not replace
-- core indexed fields), and a plane + visibility discriminator so the SAME
-- tables serve the shared market plane and the private tenant plane
-- (ADR-0004). Nothing here names a vertical concept.
--
-- RLS: policies for these tables are DEFERRED to the shared-market/tenant
-- visibility step (ACTIVE_BUILD #2). Until that migration lands, do NOT expose
-- tenant-plane rows (workspace_id is not null / visibility <> 'public') through
-- PostgREST. Idea-state continues to run on the in-memory store; apply this
-- only when hosting a real backend.

create extension if not exists pgcrypto;

-- ===========================================================================
-- 0. Extend sources (§3.7) with plane + market-source metadata.
--    workspace_id is relaxed to nullable so a public/shared source (a
--    regulator, a filing system) can exist with no tenant. Existing tenant
--    sources keep their workspace_id and default to the private plane.
-- ===========================================================================
alter table sources alter column workspace_id drop not null;
alter table sources
  add column if not exists plane text not null default 'private_terminal'
    check (plane in ('shared_market','private_terminal','control')),
  add column if not exists visibility text not null default 'tenant_private'
    check (visibility in ('public','network','tenant_private','relationship_private','personal')),
  add column if not exists publisher text,
  add column if not exists official_url text,
  add column if not exists legal_terms text,
  add column if not exists attribution_required boolean not null default false,
  add column if not exists precedence numeric;
create index if not exists sources_plane_idx on sources (plane, visibility);

-- ===========================================================================
-- 1. source_documents — immutable raw records. Never mutated; a new fetch is a
--    new row. The bottom of every provenance chain.
-- ===========================================================================
create table if not exists source_documents (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references sources(id) on delete cascade,
  workspace_id uuid references workspaces(id) on delete cascade,
  organization_id uuid references organizations(id) on delete cascade,
  plane text not null default 'shared_market'
    check (plane in ('shared_market','private_terminal','control')),
  visibility text not null default 'public'
    check (visibility in ('public','network','tenant_private','relationship_private','personal')),
  external_ref text,                     -- e.g. "12 CFR 745.4" or an FR document number
  title text,
  content_type text,                     -- text/xml | application/pdf | application/json | ...
  raw_content_reference text,            -- pointer to the preserved raw artifact
  raw_text text,                         -- inline text when small enough
  content_hash text,                     -- integrity/dedupe of the immutable record
  retrieved_at timestamptz not null default now(),
  published_at timestamptz,              -- publisher's own issue date
  attribution text,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);
create index if not exists source_documents_source_idx on source_documents (source_id, retrieved_at);
create index if not exists source_documents_plane_idx on source_documents (plane, visibility);
create unique index if not exists source_documents_hash_uniq
  on source_documents (source_id, content_hash) where content_hash is not null;

-- ===========================================================================
-- 2. Assertion family. Every table shares the same envelope of columns:
--
--    identity/plane : workspace_id, organization_id, plane, visibility, tier
--    subject triple : subject_ref, subject_type, predicate, value
--    provenance     : method, asserted_by, confidence, source_document_ids,
--                     source_ids, derived_from_ids, model_reference,
--                     prompt_reference, agent_run_id, provenance_metadata
--    temporal       : observed_at, valid_from, valid_to, stale_after
--    lifecycle      : status, superseded_by_id, metadata, created_at, updated_at
--
-- Columns are repeated per table (rather than table inheritance) so RLS and
-- indexes stay simple and portable.
-- ===========================================================================

-- 2a. observations — a faithful record of what a source STATES.
create table if not exists observations (
  id uuid primary key default gen_random_uuid(),
  truth_kind text not null default 'observation',
  workspace_id uuid references workspaces(id) on delete cascade,
  organization_id uuid references organizations(id) on delete cascade,
  plane text not null default 'shared_market'
    check (plane in ('shared_market','private_terminal','control')),
  visibility text not null default 'public'
    check (visibility in ('public','network','tenant_private','relationship_private','personal')),
  tier text not null default 'public_fact' check (tier in (
    'public_fact','third_party_claim','deterministic_calculation','dispatch_inference',
    'institution_verified_fact','private_tenant_fact','human_approved_conclusion')),
  subject_ref uuid,
  subject_type text,
  predicate text,
  value jsonb not null default '{}',
  method text not null check (method in
    ('source_extraction','connector_sync','manual_entry','deterministic_rule','model_inference','human_judgment')),
  asserted_by text not null,
  confidence numeric,
  source_document_ids uuid[] not null default '{}',
  source_ids uuid[] not null default '{}',
  derived_from_ids uuid[] not null default '{}',
  model_reference text,
  prompt_reference text,
  agent_run_id uuid references agent_runs(id) on delete set null,
  provenance_metadata jsonb not null default '{}',
  observed_at timestamptz not null default now(),
  valid_from timestamptz,
  valid_to timestamptz,
  stale_after timestamptz,
  status text not null default 'active' check (status in ('active','inactive','archived')),
  superseded_by_id uuid references observations(id) on delete set null,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists observations_subject_idx on observations (subject_ref, predicate);
create index if not exists observations_plane_idx on observations (plane, visibility);
create index if not exists observations_tier_idx on observations (tier);

-- 2b. claims — a third-party assertion. Unverified by default.
create table if not exists claims (
  id uuid primary key default gen_random_uuid(),
  truth_kind text not null default 'claim',
  workspace_id uuid references workspaces(id) on delete cascade,
  organization_id uuid references organizations(id) on delete cascade,
  plane text not null default 'shared_market'
    check (plane in ('shared_market','private_terminal','control')),
  visibility text not null default 'public'
    check (visibility in ('public','network','tenant_private','relationship_private','personal')),
  tier text not null default 'third_party_claim' check (tier in (
    'public_fact','third_party_claim','deterministic_calculation','dispatch_inference',
    'institution_verified_fact','private_tenant_fact','human_approved_conclusion')),
  subject_ref uuid,
  subject_type text,
  predicate text,
  value jsonb not null default '{}',
  claimant_ref uuid,
  claimant_name text,
  method text not null check (method in
    ('source_extraction','connector_sync','manual_entry','deterministic_rule','model_inference','human_judgment')),
  asserted_by text not null,
  confidence numeric,
  source_document_ids uuid[] not null default '{}',
  source_ids uuid[] not null default '{}',
  derived_from_ids uuid[] not null default '{}',
  model_reference text,
  prompt_reference text,
  agent_run_id uuid references agent_runs(id) on delete set null,
  provenance_metadata jsonb not null default '{}',
  observed_at timestamptz not null default now(),
  valid_from timestamptz,
  valid_to timestamptz,
  stale_after timestamptz,
  status text not null default 'active' check (status in ('active','inactive','archived')),
  superseded_by_id uuid references claims(id) on delete set null,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists claims_subject_idx on claims (subject_ref, predicate);
create index if not exists claims_plane_idx on claims (plane, visibility);
create index if not exists claims_claimant_idx on claims (claimant_ref);

-- 2c. calculations — a deterministic derived value. Reproducible by method.
create table if not exists calculations (
  id uuid primary key default gen_random_uuid(),
  truth_kind text not null default 'calculation',
  workspace_id uuid references workspaces(id) on delete cascade,
  organization_id uuid references organizations(id) on delete cascade,
  plane text not null default 'shared_market'
    check (plane in ('shared_market','private_terminal','control')),
  visibility text not null default 'public'
    check (visibility in ('public','network','tenant_private','relationship_private','personal')),
  tier text not null default 'deterministic_calculation' check (tier in (
    'public_fact','third_party_claim','deterministic_calculation','dispatch_inference',
    'institution_verified_fact','private_tenant_fact','human_approved_conclusion')),
  subject_ref uuid,
  subject_type text,
  predicate text,
  value jsonb not null default '{}',
  calculation_method text not null,
  method_version text,
  method text not null default 'deterministic_rule' check (method in
    ('source_extraction','connector_sync','manual_entry','deterministic_rule','model_inference','human_judgment')),
  asserted_by text not null,
  confidence numeric,
  source_document_ids uuid[] not null default '{}',
  source_ids uuid[] not null default '{}',
  derived_from_ids uuid[] not null default '{}',
  model_reference text,
  prompt_reference text,
  agent_run_id uuid references agent_runs(id) on delete set null,
  provenance_metadata jsonb not null default '{}',
  observed_at timestamptz not null default now(),
  valid_from timestamptz,
  valid_to timestamptz,
  stale_after timestamptz,
  status text not null default 'active' check (status in ('active','inactive','archived')),
  superseded_by_id uuid references calculations(id) on delete set null,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists calculations_subject_idx on calculations (subject_ref, predicate);
create index if not exists calculations_plane_idx on calculations (plane, visibility);
create index if not exists calculations_method_idx on calculations (calculation_method);

-- 2d. inferences — a model/heuristic interpretation. Lowest trust; never sole
--     system of record for a regulated conclusion.
create table if not exists inferences (
  id uuid primary key default gen_random_uuid(),
  truth_kind text not null default 'inference',
  workspace_id uuid references workspaces(id) on delete cascade,
  organization_id uuid references organizations(id) on delete cascade,
  plane text not null default 'shared_market'
    check (plane in ('shared_market','private_terminal','control')),
  visibility text not null default 'public'
    check (visibility in ('public','network','tenant_private','relationship_private','personal')),
  tier text not null default 'dispatch_inference' check (tier in (
    'public_fact','third_party_claim','deterministic_calculation','dispatch_inference',
    'institution_verified_fact','private_tenant_fact','human_approved_conclusion')),
  subject_ref uuid,
  subject_type text,
  predicate text,
  value jsonb not null default '{}',
  rationale text,
  method text not null default 'model_inference' check (method in
    ('source_extraction','connector_sync','manual_entry','deterministic_rule','model_inference','human_judgment')),
  asserted_by text not null,
  confidence numeric,
  source_document_ids uuid[] not null default '{}',
  source_ids uuid[] not null default '{}',
  derived_from_ids uuid[] not null default '{}',
  model_reference text,
  prompt_reference text,
  agent_run_id uuid references agent_runs(id) on delete set null,
  provenance_metadata jsonb not null default '{}',
  observed_at timestamptz not null default now(),
  valid_from timestamptz,
  valid_to timestamptz,
  stale_after timestamptz,
  status text not null default 'active' check (status in ('active','inactive','archived')),
  superseded_by_id uuid references inferences(id) on delete set null,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists inferences_subject_idx on inferences (subject_ref, predicate);
create index if not exists inferences_plane_idx on inferences (plane, visibility);

-- 2e. verifications — institution- or human-confirmed fact/conclusion. The
--     audited top of the hierarchy; promotes a lower-tier assertion.
create table if not exists verifications (
  id uuid primary key default gen_random_uuid(),
  truth_kind text not null default 'verification',
  workspace_id uuid references workspaces(id) on delete cascade,
  organization_id uuid references organizations(id) on delete cascade,
  plane text not null default 'private_terminal'
    check (plane in ('shared_market','private_terminal','control')),
  visibility text not null default 'tenant_private'
    check (visibility in ('public','network','tenant_private','relationship_private','personal')),
  tier text not null default 'institution_verified_fact' check (tier in (
    'public_fact','third_party_claim','deterministic_calculation','dispatch_inference',
    'institution_verified_fact','private_tenant_fact','human_approved_conclusion')),
  subject_ref uuid,
  subject_type text,
  predicate text,
  value jsonb not null default '{}',
  verifies_id uuid,
  verified_by text not null,
  verification_note text,
  method text not null default 'human_judgment' check (method in
    ('source_extraction','connector_sync','manual_entry','deterministic_rule','model_inference','human_judgment')),
  asserted_by text not null,
  confidence numeric,
  source_document_ids uuid[] not null default '{}',
  source_ids uuid[] not null default '{}',
  derived_from_ids uuid[] not null default '{}',
  model_reference text,
  prompt_reference text,
  agent_run_id uuid references agent_runs(id) on delete set null,
  provenance_metadata jsonb not null default '{}',
  observed_at timestamptz not null default now(),
  valid_from timestamptz,
  valid_to timestamptz,
  stale_after timestamptz,
  status text not null default 'active' check (status in ('active','inactive','archived')),
  superseded_by_id uuid references verifications(id) on delete set null,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists verifications_subject_idx on verifications (subject_ref, predicate);
create index if not exists verifications_verifies_idx on verifications (verifies_id);
create index if not exists verifications_plane_idx on verifications (plane, visibility);
