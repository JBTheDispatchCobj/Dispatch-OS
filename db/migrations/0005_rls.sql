-- dispatch-os / db/migrations/0005_rls.sql
--
-- Per-role row-level security for the primitives added in 0003/0004, plus the
-- loop-authorization refinements that 0002 left as TODOs. FORWARD-ONLY and
-- ADDITIVE: 0002 is not rewritten; this file adds role-aware predicates and
-- write policies on top of the member-only reads already in place.
--
-- Model (CORE_OBJECT_MODEL §3.4, AGENT_AND_AUTOMATION_RULES §9/§15):
--   * read  = any workspace member
--   * write = gated by the caller's role IN that workspace
--   * events + metrics are APPEND-ONLY (no update/delete policy = denied)
--   * the human-in-the-loop gate is enforced in the DB: only reviewer/admin/
--     owner may decide/approve/promote; agents (service role) only INSERT
--     proposals and never approve their own output.
--
-- Roles: owner, admin, operator, reviewer, viewer (RoleKey in core/types.ts).
-- Apply only when hosting a real backend; idea-state runs on the in-memory store.

-- ===========================================================================
-- 1. ROLE-AWARE PREDICATES (SECURITY DEFINER — avoid recursing through RLS)
-- ===========================================================================

-- The caller's role within a workspace, or null if not a member. Mirrors the
-- Dispatch beta's auth_profile_role() pattern.
create or replace function app_member_role(p_workspace_id uuid)
returns text language sql security definer stable set search_path = public as $$
  select m.role
  from workspace_memberships m
  join user_profiles u on u.id = m.user_id
  where m.workspace_id = p_workspace_id
    and u.auth_user_id = auth.uid()
  limit 1;
$$;

-- True when the caller is a member of the workspace AND holds one of the roles.
create or replace function app_has_role(p_workspace_id uuid, variadic p_roles text[])
returns boolean language sql security definer stable set search_path = public as $$
  select app_member_role(p_workspace_id) = any(p_roles);
$$;

-- Resolve the workspace that owns a configuration, then answer membership /
-- manage-rights for configuration-scoped component tables.
create or replace function app_is_member_via_config(p_configuration_id uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from configurations c
    where c.id = p_configuration_id and app_is_member(c.workspace_id)
  );
$$;

create or replace function app_can_manage_config(p_configuration_id uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from configurations c
    where c.id = p_configuration_id
      and app_has_role(c.workspace_id, 'owner', 'admin')
  );
$$;

-- ===========================================================================
-- 2. ENABLE RLS ON THE NEW TABLES
-- ===========================================================================

alter table sources                enable row level security;
alter table configurations         enable row level security;
alter table context_objects        enable row level security;
alter table rules                  enable row level security;
alter table workflows              enable row level security;
alter table decisions              enable row level security;
alter table approvals              enable row level security;
alter table metrics                enable row level security;
alter table dashboards             enable row level security;
alter table outcomes               enable row level security;

-- Configuration component tables (0004), all keyed by configuration_id.
alter table config_vocabulary      enable row level security;
alter table input_types            enable row level security;
alter table entity_type_configs    enable row level security;
alter table checklist_templates    enable row level security;
alter table evidence_requirements  enable row level security;
alter table approval_rules         enable row level security;
alter table automation_keys        enable row level security;
alter table metric_definitions     enable row level security;
alter table report_definitions     enable row level security;
alter table dashboard_definitions  enable row level security;
alter table agent_instructions     enable row level security;
alter table outcome_definitions    enable row level security;
alter table agent_prompts          enable row level security;

-- ===========================================================================
-- 3. WORKSPACE-SCOPED TABLES — member read + per-role write
-- ===========================================================================

-- Sources: any member reads; only owner/admin manage connectors.
create policy src_read   on sources for select using (app_is_member(workspace_id));
create policy src_write  on sources for insert with check (app_has_role(workspace_id, 'owner', 'admin'));
create policy src_update on sources for update using (app_has_role(workspace_id, 'owner', 'admin'))
                                            with check (app_has_role(workspace_id, 'owner', 'admin'));

-- Context objects (SOPs/policies): operators may draft; owner/admin curate.
create policy ctx_read   on context_objects for select using (app_is_member(workspace_id));
create policy ctx_write  on context_objects for insert with check (app_has_role(workspace_id, 'owner', 'admin', 'operator'));
create policy ctx_update on context_objects for update using (app_has_role(workspace_id, 'owner', 'admin'))
                                                    with check (app_has_role(workspace_id, 'owner', 'admin'));

-- Decisions (§3.20): a human selection. Created by anyone who can act on work;
-- only owner/admin may supersede/edit a recorded decision.
create policy dec_read   on decisions for select using (app_is_member(workspace_id));
create policy dec_write  on decisions for insert with check (app_has_role(workspace_id, 'owner', 'admin', 'operator', 'reviewer'));
create policy dec_update on decisions for update using (app_has_role(workspace_id, 'owner', 'admin'))
                                              with check (app_has_role(workspace_id, 'owner', 'admin'));

-- Approvals (§3.21): human AUTHORIZATION — the loop gate. Only reviewer/admin/
-- owner may record one (agents never approve their own output). Updatable to
-- move requested -> approved/rejected by the same authorizing roles.
create policy appr_read   on approvals for select using (app_is_member(workspace_id));
create policy appr_write  on approvals for insert with check (app_has_role(workspace_id, 'owner', 'admin', 'reviewer'));
create policy appr_update on approvals for update using (app_has_role(workspace_id, 'owner', 'admin', 'reviewer'))
                                               with check (app_has_role(workspace_id, 'owner', 'admin', 'reviewer'));

-- Metrics (§3.24): measured values. APPEND-ONLY — recomputation inserts fresh
-- rows; rows are never mutated. Insert by operator+ (or the service role that
-- runs metric computation). No update/delete policy => denied.
create policy metric_read  on metrics for select using (app_is_member(workspace_id));
create policy metric_write on metrics for insert with check (app_has_role(workspace_id, 'owner', 'admin', 'operator'));

-- Dashboards / Outcomes: member read; owner/admin manage definitions + targets.
create policy dash_read   on dashboards for select using (app_is_member(workspace_id));
create policy dash_write  on dashboards for insert with check (app_has_role(workspace_id, 'owner', 'admin'));
create policy dash_update on dashboards for update using (app_has_role(workspace_id, 'owner', 'admin'))
                                                 with check (app_has_role(workspace_id, 'owner', 'admin'));

create policy out_read    on outcomes for select using (app_is_member(workspace_id));
create policy out_write   on outcomes for insert with check (app_has_role(workspace_id, 'owner', 'admin'));
create policy out_update  on outcomes for update using (app_has_role(workspace_id, 'owner', 'admin'))
                                               with check (app_has_role(workspace_id, 'owner', 'admin'));

-- ===========================================================================
-- 4. CONFIGURATION + COMPONENT TABLES — member read, owner/admin manage
-- ===========================================================================
-- Configuration is high-risk (AGENT_AND_AUTOMATION_RULES §9): changing it is
-- owner/admin only. Reads are member-wide so the engine can resolve behavior.

create policy cfg_read   on configurations for select using (app_is_member(workspace_id));
create policy cfg_write  on configurations for insert with check (app_has_role(workspace_id, 'owner', 'admin'));
create policy cfg_update on configurations for update using (app_has_role(workspace_id, 'owner', 'admin'))
                                                   with check (app_has_role(workspace_id, 'owner', 'admin'));

-- Rules + Workflows are configuration-scoped (FK configuration_id).
create policy rule_read  on rules for select using (app_is_member_via_config(configuration_id));
create policy rule_write on rules for all using (app_can_manage_config(configuration_id))
                                       with check (app_can_manage_config(configuration_id));
create policy wf_read    on workflows for select using (app_is_member_via_config(configuration_id));
create policy wf_write   on workflows for all using (app_can_manage_config(configuration_id))
                                          with check (app_can_manage_config(configuration_id));

-- All remaining 0004 component tables: identical member-read / owner-admin-write
-- shape, scoped through their configuration_id.
do $$
declare t text;
begin
  foreach t in array array[
    'config_vocabulary','input_types','entity_type_configs','checklist_templates',
    'evidence_requirements','approval_rules','automation_keys','metric_definitions',
    'report_definitions','dashboard_definitions','agent_instructions','outcome_definitions'
  ] loop
    execute format(
      'create policy %1$s_read on %1$s for select using (app_is_member_via_config(configuration_id));',
      t);
    execute format(
      'create policy %1$s_write on %1$s for all using (app_can_manage_config(configuration_id)) with check (app_can_manage_config(configuration_id));',
      t);
  end loop;
end $$;

-- agent_prompts.configuration_id is nullable (some prompts are org/system level).
-- Member-read when scoped to a config; manage requires owner/admin on that config.
create policy prompt_read  on agent_prompts for select
  using (configuration_id is null or app_is_member_via_config(configuration_id));
create policy prompt_write on agent_prompts for all
  using (configuration_id is not null and app_can_manage_config(configuration_id))
  with check (configuration_id is not null and app_can_manage_config(configuration_id));

-- ===========================================================================
-- 5. LOOP-AUTHORIZATION REFINEMENTS (the 0002 TODOs)
-- ===========================================================================
-- 0002 created member-only SELECT on these; here we add the per-role writes
-- that make the human-in-the-loop gate real at the database layer.

-- Work items: operators execute (create/update); viewers/reviewers cannot edit.
-- Field-level guards (no reassigning/repricing by operators) belong in a
-- BEFORE UPDATE trigger, mirroring the beta's tasks_staff_field_guard().
create policy wi_write  on work_items for insert with check (app_has_role(workspace_id, 'owner', 'admin', 'operator'));
create policy wi_update on work_items for update using (app_has_role(workspace_id, 'owner', 'admin', 'operator'))
                                              with check (app_has_role(workspace_id, 'owner', 'admin', 'operator'));

-- Proposals: agents/operators may INSERT a proposal; the decision to promote
-- (status -> accepted/converted) is reserved for reviewer/admin/owner.
create policy prop_write  on work_item_proposals for insert
  with check (app_has_role(workspace_id, 'owner', 'admin', 'operator', 'reviewer'));
create policy prop_update on work_item_proposals for update
  using (app_has_role(workspace_id, 'owner', 'admin', 'reviewer'))
  with check (app_has_role(workspace_id, 'owner', 'admin', 'reviewer'));

-- Events: APPEND-ONLY. Any member who can touch the parent work item may insert
-- an event; NO update/delete policy exists, so the audit trail is immutable
-- (the task_events contract, generalized).
create policy wi_event_write on work_item_events for insert with check (
  exists (select 1 from work_items w where w.id = work_item_id and app_is_member(w.workspace_id)));

-- Child execution tables: members of the parent work item's workspace may write.
create policy ci_write on checklist_items for insert with check (
  exists (select 1 from work_items w where w.id = work_item_id and app_is_member(w.workspace_id)));
create policy ci_update on checklist_items for update using (
  exists (select 1 from work_items w where w.id = work_item_id and app_has_role(w.workspace_id, 'owner', 'admin', 'operator')))
  with check (
  exists (select 1 from work_items w where w.id = work_item_id and app_has_role(w.workspace_id, 'owner', 'admin', 'operator')));
create policy note_write on notes for insert with check (
  exists (select 1 from work_items w where w.id = work_item_id and app_is_member(w.workspace_id)));
create policy ev_write on evidence_items for insert with check (
  exists (select 1 from work_items w where w.id = work_item_id and app_is_member(w.workspace_id)));

-- NOTE: reports (report_runs) generation may be operator+, but external SHARING
-- (status -> shared) is high-risk and should require owner/admin — enforce that
-- with a status-transition trigger when report_runs gains a status column.
