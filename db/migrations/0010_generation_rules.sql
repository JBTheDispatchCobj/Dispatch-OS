-- dispatch-os / db/migrations/0010_generation_rules.sql
--
-- The executable rules SYSTEM (HANDOFF session-7; replicates the Dispatch beta's
-- lib/orchestration/rules architecture, generalized). In idea-state the rules
-- live as package CONFIG data (PackagedConfiguration.generationRules) and the
-- engine (core/engine/rules.ts) runs them in-memory. This table is the hosted
-- home for the same shape, so a configuration's rules can be authored, versioned,
-- and audited in Postgres once the Supabase adapter lands.
--
-- A generation rule listens for an input trigger, optionally guards on a generic
-- condition over the input payload, and emits a dry-run work_item_proposal (the
-- human-promote gate). Rules are DATA, scoped to a configuration; the engine
-- stays industry-agnostic. Mirrors core/config/types.ts `GenerationRule`.
--
-- FORWARD-ONLY and ADDITIVE. Apply only when hosting. References configurations
-- (0004) and work-item kinds resolved from configuration (no FK — kinds are
-- config strings, not a table).

create table if not exists generation_rules (
  id uuid primary key default gen_random_uuid(),
  configuration_id uuid not null references configurations(id) on delete cascade,
  -- Stable authored id, e.g. 'FSR-001' (unique within a configuration).
  rule_key text not null,
  description text not null,
  -- Trigger: the input type this rule listens for (OS analogue of event_type)
  -- plus an optional generic match expression over the input payload.
  trigger_input_type text,
  trigger_match text,
  -- Output: the work-item kind + optional title template the draft instantiates.
  output_work_item_kind text not null,
  output_title text,
  output_proposal_type text not null default 'work_item',
  priority text check (priority is null or priority in ('low','medium','high','critical')),
  impact_area text,
  value_category text,
  metric_updated text[] not null default '{}',
  evidence_required text[] not null default '{}',
  review_role text,
  context_to_attach text[] not null default '{}',
  automation_key text,
  risk_level text check (risk_level is null or risk_level in ('low','medium','high')),
  requires_human_approval boolean not null default false,
  feedback text,
  status text not null default 'active' check (status in ('active','inactive','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (configuration_id, rule_key)
);

create index if not exists generation_rules_cfg_idx on generation_rules (configuration_id);
create index if not exists generation_rules_trigger_idx on generation_rules (trigger_input_type);

comment on table generation_rules is
  'Executable generation rules (the rules system). A rule fires on an input trigger and emits a dry-run work_item_proposal; the engine stays industry-agnostic. Mirrors core/config/types.ts GenerationRule.';
comment on column generation_rules.trigger_match is
  'Optional generic guard over the input payload, e.g. "status=sent" or "days_overdue in 7|14|30". AND-joined with "&".';
