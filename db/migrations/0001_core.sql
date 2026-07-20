-- dispatch-os / db/migrations/0001_core.sql
--
-- Core, industry-agnostic primitives. Run in a FRESH, SEPARATE Supabase
-- project (never the hotel beta's). Nothing here names a vertical concept —
-- verticals attach meaning via entity_types.key, work_items.kind, and the
-- per-cartridge `context` jsonb. Idea-state runs on the in-memory store; apply
-- this only when you decide to host a real backend.
--
-- Mapping from the Dispatch beta (for reference, not a dependency):
--   tasks               -> work_items
--   task_events         -> work_item_events
--   task_checklist_items-> checklist_items
--   task_drafts         -> work_item_proposals
--   inbound_events      -> inbound_events
--   notes               -> notes
--   maintenance_issues  -> evidence_items (kind='issue')
--   staff               -> user_profiles + workspace_memberships

create extension if not exists pgcrypto;

-- ── Tenancy + identity ────────────────────────────────────────────────────
create table organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  enabled_cartridges text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table workspaces (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  cartridge_key text not null,
  created_at timestamptz not null default now()
);

create table user_profiles (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  auth_user_id uuid unique,           -- maps to auth.users when auth is wired
  display_name text not null,
  email text not null,
  created_at timestamptz not null default now()
);

create table workspace_memberships (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  user_id uuid not null references user_profiles(id) on delete cascade,
  role text not null check (role in ('owner','admin','operator','reviewer','viewer')),
  unique (workspace_id, user_id)
);

-- ── Entities (cartridge nouns) ────────────────────────────────────────────
create table entity_types (
  key text primary key,               -- '<cartridge>:<slug>'
  cartridge_key text not null,
  label text not null,
  context_hint text
);

create table entities (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  entity_type_key text not null references entity_types(key),
  title text not null,
  context jsonb not null default '{}',
  created_at timestamptz not null default now()
);

-- ── Work items (the universal unit of execution) ──────────────────────────
create table work_items (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  kind text not null,                 -- '<cartridge>:<slug>'
  title text not null,
  status text not null default 'open'
    check (status in ('open','in_progress','paused','blocked','in_review','done','archived')),
  priority text not null default 'medium' check (priority in ('low','medium','high')),
  source text not null default 'manual' check (source in ('manual','inbound','agent','system')),
  entity_id uuid references entities(id) on delete set null,
  assignee_id uuid references user_profiles(id) on delete set null,
  assignee_name text,
  context jsonb not null default '{}',
  created_at timestamptz not null default now(),
  started_at timestamptz,
  completed_at timestamptz
);
create index on work_items (workspace_id, status);

-- Append-only audit. Human vs agent actor is explicit in `actor`.
create table work_item_events (
  id uuid primary key default gen_random_uuid(),
  work_item_id uuid not null references work_items(id) on delete cascade,
  type text not null,
  actor text not null,                -- 'user:<id>' | 'agent:<run_id>' | 'system'
  detail jsonb not null default '{}',
  schema_version int not null default 1,
  created_at timestamptz not null default now()
);
create index on work_item_events (work_item_id, created_at);

create table checklist_items (
  id uuid primary key default gen_random_uuid(),
  work_item_id uuid not null references work_items(id) on delete cascade,
  title text not null,
  sort_order int not null default 0,
  detail text,
  done boolean not null default false,
  done_at timestamptz
);

-- ── Notes + evidence + documents ──────────────────────────────────────────
create table notes (
  id uuid primary key default gen_random_uuid(),
  work_item_id uuid not null references work_items(id) on delete cascade,
  author_id uuid references user_profiles(id) on delete set null,
  author_name text not null,
  body text not null,
  created_at timestamptz not null default now()
);

create table documents (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  filename text not null,
  uri text not null,
  mime text not null,
  created_at timestamptz not null default now()
);

-- Structured, typed proof. Reports are generated FROM evidence.
create table evidence_items (
  id uuid primary key default gen_random_uuid(),
  work_item_id uuid not null references work_items(id) on delete cascade,
  kind text not null check (kind in ('observation','issue','measurement','attestation','file_ref')),
  label text not null,
  value jsonb not null default '{}',
  document_id uuid references documents(id) on delete set null,
  captured_by text not null,          -- 'user:<id>' | 'agent:<run_id>'
  created_at timestamptz not null default now()
);

-- ── Ingestion -> interpretation -> proposal -> review ─────────────────────
create table inbound_events (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  source text not null,
  external_id text,
  payload jsonb not null default '{}',
  processed boolean not null default false,
  created_at timestamptz not null default now()
);

create table agent_runs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  interpreter_key text not null,
  status text not null check (status in ('running','succeeded','failed')),
  dry_run boolean not null default true,   -- agents propose; they don't auto-act
  summary text not null default '',
  created_at timestamptz not null default now()
);

create table agent_actions (
  id uuid primary key default gen_random_uuid(),
  agent_run_id uuid not null references agent_runs(id) on delete cascade,
  action text not null,
  detail jsonb not null default '{}',
  created_at timestamptz not null default now()
);

-- Draft work an agent/rule wants created. Human promote is the only path to a
-- real work_item. Approval is logged distinctly from the agent run.
create table work_item_proposals (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  agent_run_id uuid references agent_runs(id) on delete set null,
  proposed jsonb not null,            -- {kind,title,priority,entity_id,context,checklist_template_key?}
  rationale text not null default '',
  status text not null default 'pending' check (status in ('pending','approved','rejected','promoted')),
  created_at timestamptz not null default now(),
  reviewed_by uuid references user_profiles(id) on delete set null,
  reviewed_at timestamptz,
  promoted_work_item_id uuid references work_items(id) on delete set null
);

-- ── Reporting + outcomes ──────────────────────────────────────────────────
create table report_runs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  report_key text not null,
  generated_at timestamptz not null default now(),
  sections jsonb not null default '[]'
);

create table outcome_outputs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  kind text not null,
  label text not null,
  payload jsonb not null default '{}',
  created_at timestamptz not null default now()
);
