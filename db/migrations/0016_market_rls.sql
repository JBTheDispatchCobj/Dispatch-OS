-- dispatch-os / db/migrations/0016_market_rls.sql
--
-- Shared-market vs tenant visibility — Row-Level Security for the plane-aware
-- truth/relationship/intelligence/profile tables (0011–0014) and the
-- registry-ops tables (0015). FORWARD-ONLY and ADDITIVE: earlier migrations are
-- never rewritten; this file only enables RLS and adds policies.
--
-- Closes the security gap deferred by 0011–0015 headers (ACTIVE_BUILD #2;
-- Constitution Art. 20/23; ADR-0004). Until this lands, tenant-plane rows must
-- not be exposed through PostgREST.
--
-- MODEL (ADR-0004 plane + visibility):
--   * READ is plane/visibility-aware, not workspace-only:
--       - visibility 'public'                          -> any authenticated user
--         (the free Auric / shared market layer)
--       - plane 'shared_market' + visibility 'network' -> any authenticated user
--         (market-network participants)
--       - tenant rows (workspace_id not null)          -> workspace MEMBERS only
--       - anything else (e.g. tenant_private with a null workspace) -> denied to
--         authenticated users; fail-closed (service role only)
--   * WRITE by end users is limited to tenant-plane rows in their own workspace,
--     gated by role. Shared-market ingestion (public facts, the Auric) is written
--     by the platform via the Supabase SERVICE ROLE, which bypasses RLS — so no
--     authenticated write policy is granted for shared-market data.
--   * Event/signal tables are APPEND-ONLY (insert policy only; no update/delete).
--
-- Parent-scoped checks use SECURITY DEFINER helpers (like 0005's
-- app_is_member_via_config) so a child policy does not recurse through the
-- parent table's RLS. Reuses app_is_member()/app_has_role() from 0002/0005.
-- Apply only when hosting a real backend; idea-state runs on the in-memory store.

-- ===========================================================================
-- 0. Predicates
-- ===========================================================================
-- Plane-aware read predicate (invoker context; reads only its own row's columns
-- passed as args, plus app_is_member which is SECURITY DEFINER).
create or replace function app_can_read_plane(
  p_plane text, p_visibility text, p_workspace_id uuid
) returns boolean language sql stable set search_path = public as $$
  select auth.uid() is not null and (
       p_visibility = 'public'                                    -- public market layer
    or (p_plane = 'shared_market' and p_visibility = 'network')   -- market-network participants
    or (p_workspace_id is not null and app_is_member(p_workspace_id))  -- tenant members
  );
$$;

-- Tenant-write predicate: member of the row's workspace holding a writing role.
-- Shared-market rows (workspace_id null) fall through to the service role.
create or replace function app_can_write_tenant(
  p_workspace_id uuid, variadic p_roles text[]
) returns boolean language sql stable set search_path = public as $$
  select p_workspace_id is not null and app_has_role(p_workspace_id, variadic p_roles);
$$;

-- Parent-scoped helpers (SECURITY DEFINER — resolve the parent without RLS recursion).
create or replace function app_can_read_relationship(p_rel_id uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select exists (select 1 from relationships r
                 where r.id = p_rel_id
                   and app_can_read_plane(r.plane, r.visibility, r.workspace_id));
$$;
create or replace function app_can_write_relationship(p_rel_id uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select exists (select 1 from relationships r
                 where r.id = p_rel_id
                   and app_can_write_tenant(r.workspace_id, 'owner','admin','operator'));
$$;
create or replace function app_can_read_io(p_io_id uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select exists (select 1 from intelligence_objects io
                 where io.id = p_io_id
                   and app_can_read_plane(io.plane, io.visibility, io.workspace_id));
$$;
create or replace function app_can_write_io(p_io_id uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select exists (select 1 from intelligence_objects io
                 where io.id = p_io_id
                   and app_can_write_tenant(io.workspace_id, 'owner','admin'));
$$;
create or replace function app_can_read_profile(p_profile_id uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from personal_profiles pp
    where pp.id = p_profile_id and (
      pp.visibility = 'public'
      or (pp.user_id is not null and exists (
            select 1 from user_profiles u
            where u.id = pp.user_id and u.auth_user_id = auth.uid()))
      or (pp.workspace_id is not null and app_is_member(pp.workspace_id))
    )
  );
$$;

-- ===========================================================================
-- 1. ENABLE RLS
-- ===========================================================================
alter table source_documents      enable row level security;
alter table observations          enable row level security;
alter table claims                enable row level security;
alter table calculations          enable row level security;
alter table inferences            enable row level security;
alter table verifications         enable row level security;
alter table relationships         enable row level security;
alter table relationship_events   enable row level security;
alter table intelligence_objects  enable row level security;
alter table content_variants      enable row level security;
alter table personal_profiles     enable row level security;
alter table profile_signals       enable row level security;
alter table interests             enable row level security;
alter table goals                 enable row level security;
alter table connector_runs        enable row level security;
alter table discovery_candidates  enable row level security;
-- sources already has RLS (0005); it became plane-aware in 0011 (workspace_id
-- relaxed to nullable). Add a shared-market read path below.

-- ===========================================================================
-- 2. sources — add the shared-market read path (tenant read/write stay as 0005)
-- ===========================================================================
create policy src_shared_read on sources for select
  using (app_can_read_plane(plane, visibility, workspace_id));

-- ===========================================================================
-- 3. TRUTH LAYER (0011) — plane-aware read; tenant member write; shared via svc role
-- ===========================================================================
-- source_documents: immutable raw records. Read plane-aware; insert-only.
create policy sd_read  on source_documents for select
  using (app_can_read_plane(plane, visibility, workspace_id));
create policy sd_write on source_documents for insert
  with check (app_can_write_tenant(workspace_id, 'owner','admin','operator'));

-- Assertion family (observations/claims/calculations/inferences/verifications):
-- same envelope, same policy shape. Read plane-aware; tenant members
-- (owner/admin/operator) may assert PRIVATE (tenant-plane) truth; shared-market
-- assertions are written by the platform service role. Updates (supersede / mark
-- stale) are owner/admin on tenant rows.
do $$
declare t text;
begin
  foreach t in array array[
    'observations','claims','calculations','inferences','verifications'
  ] loop
    execute format(
      'create policy %1$s_read on %1$s for select using (app_can_read_plane(plane, visibility, workspace_id));', t);
    execute format(
      'create policy %1$s_write on %1$s for insert with check (app_can_write_tenant(workspace_id, ''owner'',''admin'',''operator''));', t);
    execute format(
      'create policy %1$s_update on %1$s for update using (app_can_write_tenant(workspace_id, ''owner'',''admin'')) with check (app_can_write_tenant(workspace_id, ''owner'',''admin''));', t);
  end loop;
end $$;

-- ===========================================================================
-- 4. RELATIONSHIPS (0012)
-- ===========================================================================
create policy rel_read   on relationships for select
  using (app_can_read_plane(plane, visibility, workspace_id));
create policy rel_write  on relationships for insert
  with check (app_can_write_tenant(workspace_id, 'owner','admin','operator'));
create policy rel_update on relationships for update
  using (app_can_write_tenant(workspace_id, 'owner','admin','operator'))
  with check (app_can_write_tenant(workspace_id, 'owner','admin','operator'));

-- relationship_events: APPEND-ONLY history, scoped through the parent relationship.
create policy relev_read  on relationship_events for select
  using (app_can_read_relationship(relationship_id));
create policy relev_write on relationship_events for insert
  with check (app_can_write_relationship(relationship_id));

-- ===========================================================================
-- 5. INTELLIGENCE OBJECTS (0013)
-- ===========================================================================
-- Shared-market IOs are the free Auric layer (public); tenant IOs are Terminal-
-- private. Read plane-aware. Publication curation (owner/admin) writes tenant IOs;
-- the Auric's shared-market IOs are produced by the platform service role.
create policy io_read   on intelligence_objects for select
  using (app_can_read_plane(plane, visibility, workspace_id));
create policy io_write  on intelligence_objects for insert
  with check (app_can_write_tenant(workspace_id, 'owner','admin'));
create policy io_update on intelligence_objects for update
  using (app_can_write_tenant(workspace_id, 'owner','admin'))
  with check (app_can_write_tenant(workspace_id, 'owner','admin'));

-- content_variants: carry their own visibility (a public IO may have a tenant-only
-- variant). Readable when the variant is public OR the parent IO is readable.
create policy cv_read  on content_variants for select using (
  (auth.uid() is not null and visibility = 'public')
  or app_can_read_io(intelligence_object_id));
create policy cv_write on content_variants for insert
  with check (app_can_write_io(intelligence_object_id));

-- ===========================================================================
-- 6. PERSONAL PROFILES (0014) — owner + workspace + public; no plane column
-- ===========================================================================
create policy pp_read on personal_profiles for select using (
  auth.uid() is not null and (
    visibility = 'public'
    or (user_id is not null and exists (
          select 1 from user_profiles u
          where u.id = personal_profiles.user_id and u.auth_user_id = auth.uid()))
    or (workspace_id is not null and app_is_member(workspace_id))
  ));
create policy pp_write on personal_profiles for insert with check (
  (user_id is not null and exists (
      select 1 from user_profiles u
      where u.id = user_id and u.auth_user_id = auth.uid()))
  or app_can_write_tenant(workspace_id, 'owner','admin'));
create policy pp_update on personal_profiles for update using (
  (user_id is not null and exists (
      select 1 from user_profiles u
      where u.id = personal_profiles.user_id and u.auth_user_id = auth.uid()))
  or app_can_write_tenant(workspace_id, 'owner','admin'))
  with check (
  (user_id is not null and exists (
      select 1 from user_profiles u
      where u.id = personal_profiles.user_id and u.auth_user_id = auth.uid()))
  or app_can_write_tenant(workspace_id, 'owner','admin'));

-- Profile children — scoped through the parent profile's readability.
-- profile_signals is APPEND-ONLY (behavioral signals).
create policy sig_read   on profile_signals for select using (app_can_read_profile(profile_id));
create policy sig_write  on profile_signals for insert with check (app_can_read_profile(profile_id));

create policy int_read   on interests for select using (app_can_read_profile(profile_id));
create policy int_write  on interests for insert with check (app_can_read_profile(profile_id));
create policy int_update on interests for update using (app_can_read_profile(profile_id))
                                              with check (app_can_read_profile(profile_id));

create policy goal_read   on goals for select using (app_can_read_profile(profile_id));
create policy goal_write  on goals for insert with check (app_can_read_profile(profile_id));
create policy goal_update on goals for update using (app_can_read_profile(profile_id))
                                             with check (app_can_read_profile(profile_id));

-- ===========================================================================
-- 7. REGISTRY-OPS (0015) — control-plane / operator data
-- ===========================================================================
-- connector_runs: workspace-scoped runs readable by that workspace's members;
-- system runs (workspace_id null) are service-role only. Runs are written by the
-- platform service role (no authenticated write policy).
create policy cr_read on connector_runs for select
  using (workspace_id is not null and app_is_member(workspace_id));

-- discovery_candidates: pure control-plane R&D (no workspace_id). RLS is enabled
-- with NO authenticated policy, so only the service role can read/write it.
-- (Intentional: the research queue is not tenant-exposed.)

-- ===========================================================================
-- TODO (follow-on hardening)
--  * Anonymous (anon role) read of visibility='public' data when the public Auric
--    is exposed without login — a deliberate later step (currently authenticated-only).
--  * Org-level admin read across a whole organization's workspaces.
--  * Field-level guards (no re-planing a row; no visibility downgrade of a
--    published public fact) via BEFORE UPDATE triggers.
--  * Supersede/withdraw transitions on truth objects via a status-transition guard.
-- ===========================================================================
