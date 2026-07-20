-- dispatch-os / db/migrations/0008_report_share_guard.sql
--
-- Report-sharing approval (HANDOFF session-6 priority #3). 0006 gave report_runs
-- a status column; this enforces the 0005 closing note: moving a report TO
-- 'shared' is high-risk external output and must be owner/admin only. Other
-- transitions (generated -> under_review, -> archived) are unrestricted for any
-- workspace member who can update the row.
--
-- In the app the loop is: report_list "share" raises a `requested` Approval
-- (requestReportShare), and approval_queue "approve" by an owner/admin flips the
-- report to 'shared'. This trigger is the database backstop for that gate.
--
-- FORWARD-ONLY and ADDITIVE. Idea-state runs on the in-memory store; apply only
-- when hosting. Relies on app_has_role() from 0005.

-- Member read + member-updatable status (the share transition is then narrowed
-- by the trigger below). report_runs had no write policy before; add member
-- insert/update so generation + lifecycle work under RLS.
alter table report_runs enable row level security;
create policy rr_read   on report_runs for select using (app_is_member(workspace_id));
create policy rr_write  on report_runs for insert with check (app_is_member(workspace_id));
create policy rr_update on report_runs for update using (app_is_member(workspace_id))
                                              with check (app_is_member(workspace_id));

create or replace function report_runs_share_guard()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  -- Only constrain the transition INTO 'shared'.
  if new.status = 'shared' and old.status is distinct from 'shared' then
    if not app_has_role(new.workspace_id, 'owner', 'admin') then
      raise exception 'sharing a report requires the owner or admin role';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_report_runs_share_guard on report_runs;
create trigger trg_report_runs_share_guard
  before update on report_runs
  for each row execute function report_runs_share_guard();
