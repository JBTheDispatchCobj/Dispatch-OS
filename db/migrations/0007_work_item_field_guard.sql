-- dispatch-os / db/migrations/0007_work_item_field_guard.sql
--
-- Per-role FIELD guard on work_items (HANDOFF session-6 priority #2), mirroring
-- the Dispatch beta's tasks_staff_field_guard(). 0005 already gates WHO may
-- update a work item (owner/admin/operator); this adds WHICH FIELDS an operator
-- may change: operators execute work, but may NOT reassign it or change its
-- priority (reprice). Owner/admin/reviewer are unrestricted.
--
-- FORWARD-ONLY and ADDITIVE. Idea-state runs on the in-memory store, which is
-- deliberately permissive for the single-owner demo session; this trigger is
-- the real enforcement once a hosted backend with real roles exists. Relies on
-- app_member_role() from 0005.

create or replace function work_items_field_guard()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  caller_role text;
begin
  caller_role := app_member_role(new.workspace_id);

  -- Only constrain operators. Higher roles (owner/admin) and the service role
  -- (caller_role is null when not acting as a workspace member, e.g. migrations
  -- or trusted server code) pass through unchanged.
  if caller_role = 'operator' then
    if new.assignee_id is distinct from old.assignee_id then
      raise exception 'operators may not reassign work items (assignee_id is owner/admin-only)';
    end if;
    if new.priority is distinct from old.priority then
      raise exception 'operators may not change work item priority (reprice is owner/admin-only)';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_work_items_field_guard on work_items;
create trigger trg_work_items_field_guard
  before update on work_items
  for each row execute function work_items_field_guard();
