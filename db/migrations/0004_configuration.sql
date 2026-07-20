-- dispatch-os / db/migrations/0004_configuration.sql
--
-- The Configuration layer as data (CONFIGURATION_RULES.md). Forward-only and
-- additive. 0003 already created `configurations`, `rules`, and `workflows`.
-- This file adds the remaining configuration COMPONENT tables, all keyed by
-- configuration_id so a workspace's behavior is described by versioned data
-- rather than hardcoded TypeScript. A "packaged configuration" (cartridge) is
-- a seed of these rows installed into the core — it never becomes the core.

-- Business vocabulary: maps a core primitive (or status) to a business term.
create table if not exists config_vocabulary (
  id uuid primary key default gen_random_uuid(),
  configuration_id uuid not null references configurations(id) on delete cascade,
  scope text not null default 'term' check (scope in ('term','status_label')),
  key text not null,                    -- primitive name or status key
  label text not null,                  -- business-facing term
  unique (configuration_id, scope, key)
);

-- Configured input types (parsing/classification/conversion expectations).
create table if not exists input_types (
  id uuid primary key default gen_random_uuid(),
  configuration_id uuid not null references configurations(id) on delete cascade,
  key text not null,
  label text not null,
  parsing_method text,
  converts_to text[] not null default '{}',
  review_required boolean not null default true,
  metadata jsonb not null default '{}',
  unique (configuration_id, key)
);

-- Configured entity types (the §3.9 record; 0001 had a flat entity_types table
-- keyed by string — this is the configuration-scoped, versionable form).
create table if not exists entity_type_configs (
  id uuid primary key default gen_random_uuid(),
  configuration_id uuid not null references configurations(id) on delete cascade,
  key text not null,                    -- '<package>:<slug>'
  label text not null,
  description text,
  schema jsonb not null default '{}',
  required_fields text[] not null default '{}',
  display_fields text[] not null default '{}',
  relationship_rules jsonb not null default '{}',
  validation_rules jsonb not null default '{}',
  metadata jsonb not null default '{}',
  unique (configuration_id, key)
);

-- Checklist templates as configuration (CORE_OBJECT_MODEL §3.14).
create table if not exists checklist_templates (
  id uuid primary key default gen_random_uuid(),
  configuration_id uuid not null references configurations(id) on delete cascade,
  key text not null,
  name text not null,
  description text,
  workflow_id uuid references workflows(id) on delete set null,
  items jsonb not null default '[]',    -- [{label, sort_order, required, evidence_required, detail}]
  completion_rules jsonb not null default '{}',
  metadata jsonb not null default '{}',
  unique (configuration_id, key)
);

-- Evidence requirements (§5.8).
create table if not exists evidence_requirements (
  id uuid primary key default gen_random_uuid(),
  configuration_id uuid not null references configurations(id) on delete cascade,
  key text not null,
  label text not null,
  evidence_type text not null,
  required boolean not null default true,
  applies_to_kind text,
  metadata jsonb not null default '{}',
  unique (configuration_id, key)
);

-- Approval rules (§5.9): when human authorization is required.
create table if not exists approval_rules (
  id uuid primary key default gen_random_uuid(),
  configuration_id uuid not null references configurations(id) on delete cascade,
  key text not null,
  applies_to text not null,             -- proposal | report_share | config_change | ...
  approver_role text not null check (approver_role in ('owner','admin','operator','reviewer','viewer')),
  min_risk_level text check (min_risk_level in ('low','medium','high')),
  expiration_hours int,
  metadata jsonb not null default '{}',
  unique (configuration_id, key)
);

-- Automation keys (§5.10 / AGENT_AND_AUTOMATION_RULES §8): configured triggers.
create table if not exists automation_keys (
  id uuid primary key default gen_random_uuid(),
  configuration_id uuid not null references configurations(id) on delete cascade,
  key text not null,
  label text not null,
  trigger text not null,
  condition text not null default '',
  action text not null,
  allowed_agent text check (allowed_agent in ('intake','context','work','evidence','report','roi')),
  confidence_threshold numeric,
  approval_required boolean not null default true,
  risk_level text check (risk_level in ('low','medium','high')),
  fallback text,
  metadata jsonb not null default '{}',
  unique (configuration_id, key)
);

-- Metric definitions (§5.11): what the system measures, from real activity.
create table if not exists metric_definitions (
  id uuid primary key default gen_random_uuid(),
  configuration_id uuid not null references configurations(id) on delete cascade,
  key text not null,
  label text not null,
  metric_type text not null check (metric_type in
    ('execution','evidence','data_quality','agent','financial','operational','risk','readiness','outcome','roi')),
  description text,
  calculation_method text,
  target numeric,
  metadata jsonb not null default '{}',
  unique (configuration_id, key)
);

-- Report definitions (§5.12): structured outputs traceable to evidence.
create table if not exists report_definitions (
  id uuid primary key default gen_random_uuid(),
  configuration_id uuid not null references configurations(id) on delete cascade,
  key text not null,
  label text not null,
  description text,
  audience text,
  sections jsonb not null default '[]',
  required_evidence text[] not null default '{}',
  metric_refs text[] not null default '{}',
  approval_required boolean not null default true,
  metadata jsonb not null default '{}',
  unique (configuration_id, key)
);

-- Dashboard definitions (§5.13): widget-composed operating views.
create table if not exists dashboard_definitions (
  id uuid primary key default gen_random_uuid(),
  configuration_id uuid not null references configurations(id) on delete cascade,
  key text not null,
  label text not null,
  audience text,
  widgets jsonb not null default '[]',
  metadata jsonb not null default '{}',
  unique (configuration_id, key)
);

-- Agent instructions (§5.14): what each agent role may read/infer/propose/do.
create table if not exists agent_instructions (
  id uuid primary key default gen_random_uuid(),
  configuration_id uuid not null references configurations(id) on delete cascade,
  role text not null check (role in ('intake','context','work','evidence','report','roi')),
  purpose text not null,
  prompt_reference text not null,       -- named, versioned prompt; never inline
  allowed_sources text[] not null default '{}',
  forbidden_sources text[] not null default '{}',
  allowed_outputs text[] not null default '{}',
  confidence_threshold numeric,
  human_review_required boolean not null default true,
  max_cost_estimate numeric,
  metadata jsonb not null default '{}',
  unique (configuration_id, role)
);

-- Outcome definitions (§5.15): what improvement means; connects work to value.
create table if not exists outcome_definitions (
  id uuid primary key default gen_random_uuid(),
  configuration_id uuid not null references configurations(id) on delete cascade,
  key text not null,
  label text not null,
  outcome_type text not null,
  value_category text not null,
  related_workflow_kinds text[] not null default '{}',
  related_metric_keys text[] not null default '{}',
  measurement_method text,
  metadata jsonb not null default '{}',
  unique (configuration_id, key)
);

-- Prompt registry (AGENT_AND_AUTOMATION_RULES §14): named, versioned prompts.
create table if not exists agent_prompts (
  id uuid primary key default gen_random_uuid(),
  configuration_id uuid references configurations(id) on delete cascade,
  name text not null,                   -- referenced by automation_keys/agent_instructions
  version int not null default 1,
  purpose text,
  input_requirements text,
  output_schema jsonb not null default '{}',
  safety_instructions text,
  review_required boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (name, version)
);
