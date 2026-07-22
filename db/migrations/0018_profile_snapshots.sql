-- dispatch-os / db/migrations/0018_profile_snapshots.sql
--
-- Profile persistence — the durable store for LIVE assembled profiles (Volume III:
-- Knowledge Graph & Truth, RFC-3012). FORWARD-ONLY and ADDITIVE: earlier
-- migrations are never rewritten.
--
-- A live profile (core/profile/assemble_live.ts) is a computed projection over
-- sourced, aged truth objects: each field keeps its source_ref + truth tier, and
-- the rollup carries confidence / freshness / lineage / an outcome-adjustment
-- audit surface. This table lets that projection SURVIVE A PROCESS BOUNDARY
-- byte-identically, so a profile does not have to be recomputed from scratch every
-- request and its confidence/freshness/lineage are durable.
--
-- MODEL:
--   * The `snapshot` jsonb is the round-trip SOURCE OF TRUTH — the whole
--     LiveAssembledProfile, restored byte-identically on hydrate.
--   * The scalar columns (subject, confidence, top_tier, completeness, health,
--     as_of) are INDEXABLE PROJECTIONS for query — never the source of truth on
--     the way back.
--   * NO REGULATED CONCLUSION IN A WEIGHT (DOCTRINE): a snapshot stores evidence
--     (source_refs, tiers, confidence, freshness, outcome lineage), not a
--     human-approved conclusion. Regulated conclusions are still produced by the
--     human gate (ICApproval / EditorialDisposition), never persisted as a weight.
--
-- PLANE-AWARE (ADR-0004). A public institution / regulation-environment profile is
-- a shared-market row (workspace_id null, visibility public/network); a tenant
-- profile is private. RLS reuses 0016's app_can_read_plane / app_can_write_tenant.
--
-- Apply only when hosting a real backend; idea-state runs on the in-memory store
-- (core/profile/persistence.ts::InMemoryProfileStore is the default — the Supabase
-- adapter drops in when a client is configured, exactly like the registry seam).

create extension if not exists pgcrypto;

-- ===========================================================================
-- profile_snapshots — one row per persisted live-assembled profile.
--   Nullable workspace_id: a shared-market (public institution / regulation-
--   environment) profile exists with no tenant. Defaults are fail-closed (private).
-- ===========================================================================
create table if not exists profile_snapshots (
  id uuid primary key default gen_random_uuid(),        -- deterministic uuid-v5 of the profile id
  subject_ref text not null,                            -- entity/charter id the profile is about
  subject_type text not null,                           -- e.g. 'credit_union' | 'regulation_environment'
  display_name text,
  workspace_id uuid references workspaces(id) on delete cascade,     -- null = shared-market / no tenant
  organization_id uuid references organizations(id) on delete cascade,
  plane text not null default 'private_terminal'
    check (plane in ('shared_market','private_terminal','control')),
  visibility text not null default 'tenant_private'
    check (visibility in ('public','network','tenant_private','relationship_private','personal')),
  as_of timestamptz not null,                           -- the instant the profile was aged to
  confidence numeric,                                   -- rollup confidence projection (0..1)
  top_tier text,                                        -- most authoritative tier present (projection)
  completeness numeric,                                 -- coverage projection (0..1)
  health text check (health in ('strong','adequate','thin')),
  generated_by text not null default 'profile_assembler:v1',
  -- THE round-trip source of truth (whole LiveAssembledProfile) as a canonical
  -- JSON STRING. text, not jsonb, so a read returns the EXACT bytes written — a
  -- jsonb column may renormalize number formatting / key order, which would break
  -- the byte-identical persist->hydrate guarantee (core/profile/persistence.ts).
  snapshot text not null,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists profile_snapshots_subject_idx   on profile_snapshots (subject_type, subject_ref);
create index if not exists profile_snapshots_plane_idx     on profile_snapshots (plane, visibility);
create index if not exists profile_snapshots_workspace_idx on profile_snapshots (workspace_id);
create index if not exists profile_snapshots_health_idx    on profile_snapshots (health, confidence);

-- ===========================================================================
-- RLS — plane-aware, reusing 0016's predicates. Read plane-aware; tenant members
-- (owner/admin/operator) write private profiles; shared-market profiles are
-- written by the platform service role (shared-market ingestion, 0016 §0).
-- ===========================================================================
alter table profile_snapshots enable row level security;

create policy profile_snapshots_read   on profile_snapshots for select
  using (app_can_read_plane(plane, visibility, workspace_id));
create policy profile_snapshots_write  on profile_snapshots for insert
  with check (app_can_write_tenant(workspace_id, 'owner','admin','operator'));
create policy profile_snapshots_update on profile_snapshots for update
  using (app_can_write_tenant(workspace_id, 'owner','admin'))
  with check (app_can_write_tenant(workspace_id, 'owner','admin'));

-- ===========================================================================
-- TODO (follow-on)
--  * Per-field snapshot projection table if a caller needs to query INTO a
--    profile's fields at the DB layer (today the field detail lives in `snapshot`
--    and is queried in-process via core/profile/query.ts).
--  * Snapshot versioning / history (append-only prior as_of rows) when a profile
--    timeline is surfaced.
--  * anon (logged-out) read of visibility='public' profile rows when the public
--    Auric is exposed without login.
-- ===========================================================================
