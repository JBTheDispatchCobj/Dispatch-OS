-- dispatch-os / db/migrations/0006_action_surface.sql
--
-- Session 6: schema to back the widget-action wiring closed this session
-- (HANDOFF "close the wiring gap"). FORWARD-ONLY and ADDITIVE — no prior file
-- is rewritten. Idea-state still runs entirely on the in-memory store; this
-- file is the Postgres truth for when hosting begins. Nothing here names a
-- vertical: meaning still attaches via configuration, kind, and context jsonb.
--
-- Adds:
--   1. operating_events       — the generic, workspace-scoped audit trail (§3.16)
--                               for actions NOT scoped to a single work item
--                               (input transitions, approvals, report lifecycle,
--                               outcome value assignment).
--   2. evidence_items review  — human review of proof, separate from capture
--                               (§3.18 reviewed_by / reviewed_at).
--   3. report_runs lifecycle  — status + traceability columns (§3.25), so a
--                               report can move generated -> under_review ->
--                               shared / archived (guarded in 0008).

-- ===========================================================================
-- 1. §3.16 Operating Event — generic append-only audit trail
-- ===========================================================================
create table if not exists operating_events (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  organization_id uuid references organizations(id) on delete cascade,
  event_type text not null,             -- 'input_status_changed' | 'approval_decided' | 'report_share_requested' | ...
  actor text not null,                  -- 'user:<id>' | 'agent:<run_id>' | 'system'
  related_input_id uuid references inbound_events(id) on delete set null,
  related_entity_id uuid references entities(id) on delete set null,
  related_work_item_id uuid references work_items(id) on delete set null,
  related_evidence_id uuid references evidence_items(id) on delete set null,
  related_report_id uuid references report_runs(id) on delete set null,
  related_approval_id uuid references approvals(id) on delete set null,
  related_outcome_id uuid references outcomes(id) on delete set null,
  payload jsonb not null default '{}',
  schema_version int not null default 1,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index on operating_events (workspace_id, created_at);
create index on operating_events (workspace_id, event_type);

-- ===========================================================================
-- 2. §3.18 Evidence review — proof gets reviewed, separate from capture
-- ===========================================================================
alter table evidence_items
  add column if not exists review_status text
    check (review_status in ('pending','approved','rejected')),
  add column if not exists reviewed_by text,
  add column if not exists reviewed_at timestamptz;

-- ===========================================================================
-- 3. §3.25 Report lifecycle + traceability
-- ===========================================================================
alter table report_runs
  add column if not exists title text,
  add column if not exists status text not null default 'generated'
    check (status in ('draft','generated','under_review','approved','shared','archived')),
  add column if not exists generated_by text,        -- 'user:<id>' | 'agent:<run_id>'
  add column if not exists source_references uuid[] not null default '{}',
  add column if not exists missing_data_notes text[] not null default '{}';

-- ===========================================================================
-- 4. RLS — operating_events: member read, member insert, APPEND-ONLY
-- ===========================================================================
-- Mirrors work_item_events (0005): any workspace member may insert; no update
-- or delete policy exists, so the trail is immutable. Apply only when hosting.
alter table operating_events enable row level security;
create policy oe_read  on operating_events for select using (app_is_member(workspace_id));
create policy oe_write on operating_events for insert with check (app_is_member(workspace_id));
