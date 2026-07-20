-- dispatch-os / db/migrations/0002_rls.sql
--
-- Tenancy isolation sketch. Designed EARLY on purpose: wealth/RIA, CRE, and
-- finance cartridges carry confidential data, so org/workspace boundaries must
-- be enforced in the database, not just the UI. This is a starting skeleton —
-- tighten per-role (operator vs reviewer vs viewer) before any real data lands.
--
-- Model: a user sees a row only if they are a member of that row's workspace.
-- `app_is_member(workspace_id)` is the single membership predicate (mirrors the
-- Dispatch beta's auth_profile_role() SECURITY DEFINER pattern to avoid policy
-- recursion).

alter table organizations          enable row level security;
alter table workspaces             enable row level security;
alter table user_profiles          enable row level security;
alter table workspace_memberships  enable row level security;
alter table entities               enable row level security;
alter table work_items             enable row level security;
alter table work_item_events       enable row level security;
alter table checklist_items        enable row level security;
alter table notes                  enable row level security;
alter table documents              enable row level security;
alter table evidence_items         enable row level security;
alter table inbound_events         enable row level security;
alter table agent_runs             enable row level security;
alter table agent_actions          enable row level security;
alter table work_item_proposals    enable row level security;
alter table report_runs            enable row level security;
alter table outcome_outputs        enable row level security;

-- Membership predicate (SECURITY DEFINER avoids recursing through RLS).
create or replace function app_is_member(p_workspace_id uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select exists (
    select 1
    from workspace_memberships m
    join user_profiles u on u.id = m.user_id
    where m.workspace_id = p_workspace_id
      and u.auth_user_id = auth.uid()
  );
$$;

-- Workspace-scoped tables: member-only read; refine write policies per role.
create policy ws_read on work_items        for select using (app_is_member(workspace_id));
create policy ws_read on entities          for select using (app_is_member(workspace_id));
create policy ws_read on inbound_events    for select using (app_is_member(workspace_id));
create policy ws_read on agent_runs        for select using (app_is_member(workspace_id));
create policy ws_read on work_item_proposals for select using (app_is_member(workspace_id));
create policy ws_read on documents         for select using (app_is_member(workspace_id));
create policy ws_read on report_runs       for select using (app_is_member(workspace_id));
create policy ws_read on outcome_outputs   for select using (app_is_member(workspace_id));

-- Child tables inherit scope through their parent work item.
create policy wi_child_read on work_item_events for select using (
  exists (select 1 from work_items w where w.id = work_item_id and app_is_member(w.workspace_id)));
create policy wi_child_read on checklist_items for select using (
  exists (select 1 from work_items w where w.id = work_item_id and app_is_member(w.workspace_id)));
create policy wi_child_read on notes for select using (
  exists (select 1 from work_items w where w.id = work_item_id and app_is_member(w.workspace_id)));
create policy wi_child_read on evidence_items for select using (
  exists (select 1 from work_items w where w.id = work_item_id and app_is_member(w.workspace_id)));

-- TODO before real data:
--  * write policies split by role (operator may update status/checklist;
--    only reviewer/owner may approve reviews or promote proposals)
--  * work_item_events INSERT-only (append-only; no update/delete) like the
--    beta's task_events contract
--  * org-level admin read across workspaces
