-- dispatch-os / db/migrations/0003_reconcile_core_model.sql
--
-- Reconciles the shipped 0001 schema to CORE_OBJECT_MODEL.md (the authoritative
-- object model). FORWARD-ONLY and ADDITIVE: 0001 is never rewritten. This file
-- (1) creates the nine missing universal primitives and (2) ALTERs the four
-- intake/governance tables to match the model. Nothing here names a vertical
-- concept — meaning still attaches via configuration, entity_type, kind, and
-- context jsonb. Apply only when you decide to host a real backend; idea-state
-- continues to run on the in-memory store.

-- ===========================================================================
-- 1. NEW CORE PRIMITIVES
-- ===========================================================================

-- §3.7 Source — where an input came from. Reliability scored over time.
create table if not exists sources (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  organization_id uuid references organizations(id) on delete cascade,
  name text not null,
  source_type text not null,            -- upload | email | api | mcp_connector | manual_entry | csv_export | crm | pms | ...
  status text not null default 'active' check (status in ('active','inactive','archived')),
  external_account_id text,
  connector_type text,
  sync_frequency text,
  last_sync_at timestamptz,
  reliability_score numeric,            -- 0..1, assigned over time
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on sources (workspace_id, source_type);

-- §3.5 Configuration — the governed, versioned envelope for config-as-data.
-- Component data (entity types, workflows, rules, …) lives in core/config and,
-- when hosted, in their own tables keyed by configuration_id (see below).
create table if not exists configurations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  workspace_id uuid references workspaces(id) on delete cascade,  -- null = org/system scope
  name text not null,
  version int not null default 1,
  status text not null default 'draft'
    check (status in ('draft','review','active','deprecated','archived')),
  description text,
  parent_configuration_id uuid references configurations(id) on delete set null,
  package_key text,                     -- packaged-config key this was installed from, e.g. 'wealth'
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on configurations (workspace_id, status);
-- Only one active configuration per workspace at a time.
create unique index if not exists configurations_one_active_per_workspace
  on configurations (workspace_id) where (status = 'active');

-- Link a workspace to its currently active configuration (CORE_OBJECT_MODEL §3.2).
alter table workspaces
  add column if not exists active_configuration_id uuid references configurations(id) on delete set null;

-- §3.10 Context Object — versioned, reviewable operating memory.
create table if not exists context_objects (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  organization_id uuid references organizations(id) on delete cascade,
  context_type text not null,           -- sop | rule | definition | policy | constraint | exception | ...
  title text not null,
  body text not null,
  status text not null default 'active' check (status in ('active','inactive','archived')),
  version int not null default 1,
  related_entity_ids uuid[] not null default '{}',
  related_workflow_ids uuid[] not null default '{}',
  source_input_id uuid,                 -- FK added after inbound_events is renamed/kept
  approved_by uuid references user_profiles(id) on delete set null,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on context_objects (workspace_id, context_type);

-- §3.11 Rule — deterministic, configurable, auditable interpretation logic.
create table if not exists rules (
  id uuid primary key default gen_random_uuid(),
  configuration_id uuid not null references configurations(id) on delete cascade,
  name text not null,
  description text not null default '',
  rule_type text check (rule_type in
    ('validation','automation','escalation','evidence','assignment','approval','metric','reporting','risk','opportunity')),
  trigger_definition jsonb not null default '{}',
  condition_definition jsonb not null default '{}',
  action_definition jsonb not null default '{}',
  status text not null default 'active' check (status in ('active','inactive','archived')),
  priority int,
  requires_human_approval boolean not null default true,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on rules (configuration_id, status);

-- §3.12 Workflow — a repeatable process TEMPLATE (not a work item instance).
create table if not exists workflows (
  id uuid primary key default gen_random_uuid(),
  configuration_id uuid not null references configurations(id) on delete cascade,
  key text,                             -- '<cartridge>:<slug>'
  name text not null,
  description text not null default '',
  status text not null default 'active' check (status in ('active','inactive','archived')),
  workflow_type text,
  trigger_definitions jsonb not null default '[]',
  default_steps jsonb not null default '[]',
  default_checklist_template_key text,
  default_evidence_requirements jsonb not null default '[]',
  expected_outcome text,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on workflows (configuration_id, status);

-- §3.20 Decision — the selected response to an interpreted condition.
create table if not exists decisions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  organization_id uuid references organizations(id) on delete cascade,
  decision_type text not null,
  status text not null default 'proposed'
    check (status in ('proposed','approved','rejected','executed','superseded','archived')),
  source_input_id uuid,
  related_work_item_id uuid references work_items(id) on delete set null,
  related_entity_id uuid references entities(id) on delete set null,
  decision_summary text,
  selected_action text,
  rationale text,
  decided_by uuid references user_profiles(id) on delete set null,
  agent_proposal_id uuid references work_item_proposals(id) on delete set null,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on decisions (workspace_id, status);

-- §3.21 Approval — human authorization, SEPARATE from task completion.
create table if not exists approvals (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  organization_id uuid references organizations(id) on delete cascade,
  approval_type text not null,
  status text not null default 'requested'
    check (status in ('requested','approved','rejected','expired','canceled')),
  requested_by uuid references user_profiles(id) on delete set null,
  approved_by uuid references user_profiles(id) on delete set null,
  related_input_id uuid,
  related_work_item_id uuid references work_items(id) on delete set null,
  related_decision_id uuid references decisions(id) on delete set null,
  related_agent_proposal_id uuid references work_item_proposals(id) on delete set null,
  approval_notes text,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on approvals (workspace_id, status);

-- §3.24 Metric — measured value derived from real system activity.
create table if not exists metrics (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  organization_id uuid references organizations(id) on delete cascade,
  metric_name text not null,
  metric_value numeric not null,
  metric_type text check (metric_type in
    ('execution','evidence','data_quality','agent','financial','operational','risk','readiness','outcome','roi')),
  measured_at timestamptz not null default now(),
  related_entity_id uuid references entities(id) on delete set null,
  related_workflow_id uuid references workflows(id) on delete set null,
  related_report_id uuid references report_runs(id) on delete set null,
  calculation_method text,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);
create index on metrics (workspace_id, metric_name, measured_at);

-- §3.26 Dashboard — widget-composed operating view.
create table if not exists dashboards (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  organization_id uuid references organizations(id) on delete cascade,
  name text not null,
  status text not null default 'active' check (status in ('active','inactive','archived')),
  dashboard_type text,
  widget_config jsonb not null default '[]',
  visibility_rules jsonb not null default '{}',
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- §3.27 Outcome — the result the system is improving; connects work to value.
-- (Distinct from outcome_outputs, which is an emitted external artifact.)
create table if not exists outcomes (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  organization_id uuid references organizations(id) on delete cascade,
  outcome_type text not null,
  name text not null,
  status text not null default 'active' check (status in ('active','inactive','archived')),
  description text,
  related_workflow_id uuid references workflows(id) on delete set null,
  related_metric_ids uuid[] not null default '{}',
  target_value numeric,
  actual_value numeric,
  value_category text,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ===========================================================================
-- 2. SHAPE DELTAS ON EXISTING TABLES
-- ===========================================================================

-- §3.13 Work Item — expand status set + add workflow/provenance/value columns.
alter table work_items drop constraint if exists work_items_status_check;
alter table work_items add constraint work_items_status_check
  check (status in (
    'proposed','open','assigned','in_progress','blocked','awaiting_review',
    'awaiting_approval','completed','rejected','canceled','reopened','archived'
  ));
alter table work_items
  add column if not exists work_item_type text,            -- mirrors `kind`
  add column if not exists description text,
  add column if not exists due_at timestamptz,
  add column if not exists source_input_id uuid,           -- FK added below
  add column if not exists workflow_id uuid references workflows(id) on delete set null,
  add column if not exists parent_work_item_id uuid references work_items(id) on delete set null,
  add column if not exists related_entity_ids uuid[] not null default '{}',
  add column if not exists related_document_ids uuid[] not null default '{}',
  add column if not exists expected_outcome text,
  add column if not exists value_category text,
  add column if not exists metadata jsonb not null default '{}';

-- §3.6 Input — promote inbound_events into the full Input model.
-- inbound_events is retained as the table name (the app type aliases Input);
-- the `processed` boolean is superseded by the `status` state machine.
alter table inbound_events
  add column if not exists organization_id uuid references organizations(id) on delete cascade,
  add column if not exists source_id uuid references sources(id) on delete set null,
  add column if not exists input_type text,
  add column if not exists raw_content_reference text,
  add column if not exists raw_text text,
  add column if not exists parsed_content jsonb,
  add column if not exists extracted_fields jsonb,
  add column if not exists confidence_score numeric,
  add column if not exists related_entity_ids uuid[] not null default '{}',
  add column if not exists related_work_item_ids uuid[] not null default '{}',
  add column if not exists status text,
  add column if not exists received_at timestamptz,
  add column if not exists updated_at timestamptz not null default now(),
  add column if not exists metadata jsonb not null default '{}';
-- Backfill status from the legacy boolean, then enforce the state machine.
update inbound_events set status = case when processed then 'converted' else 'received' end
  where status is null;
alter table inbound_events alter column status set default 'received';
alter table inbound_events alter column status set not null;
alter table inbound_events drop constraint if exists inbound_events_status_check;
alter table inbound_events add constraint inbound_events_status_check
  check (status in (
    'received','parsing','parsed','classified','matched','interpreted',
    'proposed','approved','converted','archived','rejected','error'
  ));
-- `processed` left in place (nullable) for one release as a compatibility shim.

-- Late-bound FKs that point back at inbound_events (now that columns exist).
alter table context_objects
  add constraint context_objects_source_input_fk
  foreign key (source_input_id) references inbound_events(id) on delete set null;
alter table decisions
  add constraint decisions_source_input_fk
  foreign key (source_input_id) references inbound_events(id) on delete set null;
alter table approvals
  add constraint approvals_related_input_fk
  foreign key (related_input_id) references inbound_events(id) on delete set null;
alter table work_items
  add constraint work_items_source_input_fk
  foreign key (source_input_id) references inbound_events(id) on delete set null;

-- §3.22 Agent Run — cost + quality must be observable.
alter table agent_runs
  add column if not exists organization_id uuid references organizations(id) on delete cascade,
  add column if not exists agent_name text,
  add column if not exists trigger_type text,
  add column if not exists source_input_id uuid references inbound_events(id) on delete set null,
  add column if not exists related_entity_id uuid references entities(id) on delete set null,
  add column if not exists related_work_item_id uuid references work_items(id) on delete set null,
  add column if not exists prompt_reference text,
  add column if not exists model text,
  add column if not exists token_usage int,
  add column if not exists cost_estimate numeric,
  add column if not exists configuration_version int,
  add column if not exists context_version int,
  add column if not exists confidence numeric,
  add column if not exists output_reference text,
  add column if not exists error_message text,
  add column if not exists started_at timestamptz,
  add column if not exists ended_at timestamptz;

-- §3.23 Agent Proposal — governance fields + expanded status set.
alter table work_item_proposals
  add column if not exists organization_id uuid references organizations(id) on delete cascade,
  add column if not exists proposal_type text,
  add column if not exists title text,
  add column if not exists summary text,
  add column if not exists risk_level text check (risk_level in ('low','medium','high')),
  add column if not exists required_review_role text
    check (required_review_role in ('owner','admin','operator','reviewer','viewer')),
  add column if not exists confidence_score numeric,
  add column if not exists evidence_references uuid[] not null default '{}',
  add column if not exists review_notes text;
alter table work_item_proposals drop constraint if exists work_item_proposals_status_check;
alter table work_item_proposals add constraint work_item_proposals_status_check
  check (status in (
    'proposed','accepted','accepted_with_edits','rejected','expired','converted','archived',
    'pending','approved','promoted'   -- back-compat with the v0 flow
  ));
