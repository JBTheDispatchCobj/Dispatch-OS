-- dispatch-os / db/migrations/0017_object_registry.sql
--
-- Object Registry — canonical identity index + entity resolution (Volume X;
-- RFC-10000/10002/10003, the RFC-10004 index/resolution subset). FORWARD-ONLY
-- and ADDITIVE: earlier migrations are never rewritten.
--
-- This is the "top bridge" of the build (BUILD_PROGRESS / handoff): it gives the
-- OS a single canonical identity authority over the typed, plane-aware tables
-- without collapsing them into a generic blob store.
--
-- MODEL (ADR-0013 + ADR-0004, both preserved):
--   * The typed tables stay the systems of record. Verticals keep living in
--     `entities` (the cartridge-entity store); trust keeps living on the
--     assertion/source layer (0011). The registry INDEXES identity; it does not
--     absorb data.
--   * `object_registry` is the canonical id + plane index. One row per canonical
--     object, carrying the ADR-0004 plane/visibility discriminator so the SAME
--     index serves the shared-market plane and the private-tenant plane.
--   * Storage is DYNAMIC per object_class: `storage` + `source_table` +
--     `object_ref` say WHERE a canonical object's data lives (a typed table like
--     `entities` today; a generic object store or an external system later).
--   * Entity resolution is one workstream (RFC-3002 model + RFC-2003 service):
--     aliases, external ids, reviewable duplicate candidates, and append-only
--     merge/split lineage. Duplicates are never silently merged (RFC-10004).
--   * The full RFC-10004 identity framework (identity_resolution / matches /
--     history / events as separate tables) and RFC-9008 remain DEFERRED
--     (ADR-0013); this migration lands the index + resolution essentials.
--
-- RLS: plane-aware, reusing 0016's app_can_read_plane / app_can_write_tenant and
-- the SECURITY-DEFINER parent-scoping pattern (like relationship_events). Apply
-- only when hosting a real backend; idea-state runs on the in-memory store.

create extension if not exists pgcrypto;

-- ===========================================================================
-- 1. object_registry — the canonical identity authority / index.
--    Nullable workspace_id: a shared-market object (a regulator, a public
--    institution) exists with no tenant. Defaults are fail-closed (private).
-- ===========================================================================
create table if not exists object_registry (
  id uuid primary key default gen_random_uuid(),        -- THE canonical object id
  object_class text not null,                           -- '<domain>:<slug>', e.g. 'entity:coop_markets:institution'
  storage text not null default 'typed_table'
    check (storage in ('typed_table','object_store','external')),   -- storage-DYNAMIC per class
  source_table text,                                    -- typed table name when storage='typed_table' (e.g. 'entities')
  object_ref uuid,                                      -- row id in source_table; null for object_store/external
  workspace_id uuid references workspaces(id) on delete cascade,     -- null = shared-market / no tenant
  organization_id uuid references organizations(id) on delete cascade,
  plane text not null default 'private_terminal'
    check (plane in ('shared_market','private_terminal','control')),
  visibility text not null default 'tenant_private'
    check (visibility in ('public','network','tenant_private','relationship_private','personal')),
  canonical_slug text,
  display_name text,
  trust_score numeric,                                  -- cached rollup only; canonical trust stays on the assertion/source layer
  status text not null default 'active'
    check (status in ('active','merged','split','archived')),
  merged_into_id uuid references object_registry(id) on delete set null,  -- survivor pointer after a merge
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists object_registry_class_idx     on object_registry (object_class, status);
create index if not exists object_registry_plane_idx     on object_registry (plane, visibility);
create index if not exists object_registry_workspace_idx on object_registry (workspace_id);
create index if not exists object_registry_merged_idx    on object_registry (merged_into_id);
create index if not exists object_registry_slug_idx      on object_registry (lower(canonical_slug));
-- one registry row per typed object
create unique index if not exists object_registry_ref_uniq
  on object_registry (source_table, object_ref) where object_ref is not null;

-- ===========================================================================
-- 2. entity_aliases — human/provider alternate names for a canonical object.
--    Aliases improve discovery; identity (the canonical id) never changes.
-- ===========================================================================
create table if not exists entity_aliases (
  id uuid primary key default gen_random_uuid(),
  object_id uuid not null references object_registry(id) on delete cascade,
  alias text not null,
  alias_type text not null default 'alternate'
    check (alias_type in ('legal','common','brand','abbreviation','former','translation','provider','alternate')),
  language text,
  source_id uuid references sources(id) on delete set null,   -- where the alias was seen
  is_primary boolean not null default false,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);
create index if not exists entity_aliases_object_idx on entity_aliases (object_id);
create index if not exists entity_aliases_alias_idx  on entity_aliases (lower(alias));
create unique index if not exists entity_aliases_uniq
  on entity_aliases (object_id, lower(alias), alias_type);

-- ===========================================================================
-- 3. object_external_ids — provider / system identifiers.
--    Provider identity becomes metadata; operational identity stays canonical.
-- ===========================================================================
create table if not exists object_external_ids (
  id uuid primary key default gen_random_uuid(),
  object_id uuid not null references object_registry(id) on delete cascade,
  system text not null,                                 -- 'salesforce' | 'hubspot' | 'sec_edgar' | 'ncua' | 'pms' | ...
  external_id text not null,
  source_id uuid references sources(id) on delete set null,
  confidence numeric,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);
create index if not exists object_external_ids_object_idx on object_external_ids (object_id);
create index if not exists object_external_ids_lookup_idx on object_external_ids (system, external_id);
create unique index if not exists object_external_ids_uniq
  on object_external_ids (system, external_id, object_id);

-- ===========================================================================
-- 4. object_match_candidates — the dedup review queue. A proposed duplicate
--    pair; NEVER silently merged (RFC-10004). Resolution is a governed action.
-- ===========================================================================
create table if not exists object_match_candidates (
  id uuid primary key default gen_random_uuid(),
  object_id uuid not null references object_registry(id) on delete cascade,           -- record under review
  candidate_object_id uuid not null references object_registry(id) on delete cascade, -- proposed duplicate
  match_score numeric,
  match_method text,                                    -- 'deterministic' | 'blocking_key' | 'model' | 'manual'
  match_rules jsonb not null default '{}',
  evidence jsonb not null default '{}',
  status text not null default 'pending'
    check (status in ('pending','confirmed','rejected','merged','expired')),
  reviewed_by uuid references user_profiles(id) on delete set null,
  reviewed_at timestamptz,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint object_match_candidates_distinct check (object_id <> candidate_object_id)
);
create index if not exists object_match_candidates_object_idx    on object_match_candidates (object_id, status);
create index if not exists object_match_candidates_candidate_idx on object_match_candidates (candidate_object_id);
-- one open row per unordered pair (prevents A↔B and B↔A duplicates)
create unique index if not exists object_match_candidates_pair_uniq
  on object_match_candidates (least(object_id, candidate_object_id), greatest(object_id, candidate_object_id));

-- ===========================================================================
-- 5. object_merges — APPEND-ONLY merge/split lineage. Identity merges preserve
--    history; splits preserve lineage (RFC-10004). Never updated or deleted.
-- ===========================================================================
create table if not exists object_merges (
  id uuid primary key default gen_random_uuid(),
  operation text not null check (operation in ('merge','split')),
  surviving_object_id uuid not null references object_registry(id) on delete cascade, -- canonical survivor (merge) / origin (split)
  merged_object_id    uuid not null references object_registry(id) on delete cascade, -- absorbed (merge) / newly separated (split)
  match_candidate_id  uuid references object_match_candidates(id) on delete set null,
  reason text,
  performed_by uuid references user_profiles(id) on delete set null,
  actor text not null default 'system',                 -- 'user:<id>' | 'agent:<run_id>' | 'system'
  evidence jsonb not null default '{}',
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  constraint object_merges_distinct check (surviving_object_id <> merged_object_id)
);
create index if not exists object_merges_surviving_idx on object_merges (surviving_object_id, created_at);
create index if not exists object_merges_merged_idx    on object_merges (merged_object_id);

-- ===========================================================================
-- 6. Make `entities` registry-ready and plane-aware (ADR-0004).
--    workspace_id relaxed to nullable so a shared-market entity can exist with
--    no tenant; existing tenant entities default to the private plane.
-- ===========================================================================
alter table entities alter column workspace_id drop not null;
alter table entities
  add column if not exists organization_id uuid references organizations(id) on delete cascade,
  add column if not exists plane text not null default 'private_terminal'
    check (plane in ('shared_market','private_terminal','control')),
  add column if not exists visibility text not null default 'tenant_private'
    check (visibility in ('public','network','tenant_private','relationship_private','personal')),
  add column if not exists canonical_object_id uuid references object_registry(id) on delete set null;
create index if not exists entities_plane_idx     on entities (plane, visibility);
create index if not exists entities_canonical_idx on entities (canonical_object_id);

-- ===========================================================================
-- 7. Backfill — register existing entities into the canonical index and link
--    them back. Idempotent; a no-op on a fresh/empty schema.
-- ===========================================================================
insert into object_registry (object_class, storage, source_table, object_ref,
                             workspace_id, organization_id, plane, visibility, display_name)
select 'entity:' || e.entity_type_key, 'typed_table', 'entities', e.id,
       e.workspace_id, e.organization_id, e.plane, e.visibility, e.title
from entities e
where e.canonical_object_id is null
  and not exists (
    select 1 from object_registry o
    where o.source_table = 'entities' and o.object_ref = e.id
  );

update entities e
set canonical_object_id = o.id
from object_registry o
where o.source_table = 'entities' and o.object_ref = e.id
  and e.canonical_object_id is null;

-- ===========================================================================
-- 8. RLS — plane-aware, reusing 0016's predicates.
-- ===========================================================================

-- Parent-scoping helpers (SECURITY DEFINER — resolve the registry row without
-- recursing through its own RLS), mirroring app_can_read_relationship (0016).
create or replace function app_can_read_object(p_object_id uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select exists (select 1 from object_registry o
                 where o.id = p_object_id
                   and app_can_read_plane(o.plane, o.visibility, o.workspace_id));
$$;
create or replace function app_can_write_object(p_object_id uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select exists (select 1 from object_registry o
                 where o.id = p_object_id
                   and app_can_write_tenant(o.workspace_id, 'owner','admin','operator'));
$$;
-- Governance actions (merge/split, duplicate resolution) are owner/admin only.
create or replace function app_can_admin_object(p_object_id uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select exists (select 1 from object_registry o
                 where o.id = p_object_id
                   and app_can_write_tenant(o.workspace_id, 'owner','admin'));
$$;

alter table object_registry        enable row level security;
alter table entity_aliases         enable row level security;
alter table object_external_ids    enable row level security;
alter table object_match_candidates enable row level security;
alter table object_merges          enable row level security;

-- object_registry: read plane-aware; tenant members write private objects;
-- shared-market objects are registered by the platform service role.
create policy objreg_read   on object_registry for select
  using (app_can_read_plane(plane, visibility, workspace_id));
create policy objreg_write  on object_registry for insert
  with check (app_can_write_tenant(workspace_id, 'owner','admin','operator'));
create policy objreg_update on object_registry for update
  using (app_can_write_tenant(workspace_id, 'owner','admin'))
  with check (app_can_write_tenant(workspace_id, 'owner','admin'));

-- entities: add the shared-market read path now that workspace_id may be null.
-- (The 0002 member-only `ws_read` stays; SELECT policies OR together.)
create policy entities_plane_read on entities for select
  using (app_can_read_plane(plane, visibility, workspace_id));

-- Children scoped through the parent object's readability/writability.
create policy alias_read   on entity_aliases for select using (app_can_read_object(object_id));
create policy alias_write  on entity_aliases for insert with check (app_can_write_object(object_id));
create policy alias_update on entity_aliases for update using (app_can_write_object(object_id))
                                                    with check (app_can_write_object(object_id));

create policy extid_read   on object_external_ids for select using (app_can_read_object(object_id));
create policy extid_write  on object_external_ids for insert with check (app_can_write_object(object_id));
create policy extid_update on object_external_ids for update using (app_can_write_object(object_id))
                                                       with check (app_can_write_object(object_id));

-- match candidates: detection may be operator/agent; the RESOLUTION decision is
-- owner/admin (a duplicate is never silently merged).
create policy match_read   on object_match_candidates for select using (app_can_read_object(object_id));
create policy match_write  on object_match_candidates for insert with check (app_can_write_object(object_id));
create policy match_update on object_match_candidates for update using (app_can_admin_object(object_id))
                                                             with check (app_can_admin_object(object_id));

-- merges: APPEND-ONLY lineage (insert + read only), owner/admin-authored.
create policy merge_read  on object_merges for select using (app_can_read_object(surviving_object_id));
create policy merge_write on object_merges for insert with check (app_can_admin_object(surviving_object_id));

-- ===========================================================================
-- TODO (follow-on)
--  * Register non-entity families (documents, agents, workflows, connectors)
--    into object_registry as they gain typed tables — one class at a time.
--  * A per-object_class storage policy table if/when a generic object store or
--    external-system family is added (storage='object_store'/'external').
--  * Resolution service (RFC-2003): populate object_match_candidates from
--    blocking keys + model scoring; apply merges via object_merges.
--  * Full RFC-10004 identity framework (identity_resolution / matches / history
--    / events tables) + RFC-9008 — deferred (ADR-0013).
--  * Field-level guards (BEFORE UPDATE): no re-planing a registered object; no
--    visibility downgrade of a published public object; merged/archived rows are
--    terminal.
--  * anon (logged-out) read of visibility='public' registry rows when the public
--    Auric is exposed without login.
-- ===========================================================================
