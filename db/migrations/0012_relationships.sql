-- dispatch-os / db/migrations/0012_relationships.sql
--
-- Cooperative Markets foundation — Relationships as first-class objects
-- (DOCTRINE #3, RELATIONSHIPS_PRD). FORWARD-ONLY and ADDITIVE.
--
-- One plane-aware relationships table (ADR-0004): shared/public relationships
-- have workspace_id null / plane 'shared_market'; private ones are tenant-scoped.
-- relationship_events is the append-only history — every relationship has
-- evidence and history (DATA_ARCHITECTURE).
--
-- RLS deferred to ACTIVE_BUILD #2 (see 0011 header). relationship_type is
-- cartridge-declared ("<cartridge>:<slug>"); nothing here names a vertical.

create table if not exists relationships (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references workspaces(id) on delete cascade,
  organization_id uuid references organizations(id) on delete cascade,
  plane text not null default 'private_terminal'
    check (plane in ('shared_market','private_terminal','control')),
  visibility text not null default 'tenant_private'
    check (visibility in ('public','network','tenant_private','relationship_private','personal')),
  relationship_type text not null,          -- '<cartridge>:<slug>'
  parties jsonb not null default '[]',       -- [{ref, party_type, role?}]
  stage text not null default 'discovery' check (stage in (
    'discovery','evaluation','discussion','pilot','integration',
    'partnership','investment','monitoring','dormant','ended')),
  status text not null default 'active' check (status in ('active','paused','archived')),
  evidence_refs uuid[] not null default '{}',   -- truth-object ids
  opportunity jsonb,
  risks jsonb,                                   -- [{label, severity?, detail?, evidence_refs?}]
  participant_ids uuid[] not null default '{}',  -- personal_profile ids
  next_action text,
  next_action_due_at timestamptz,
  related_workflow_id uuid references workflows(id) on delete set null,
  related_outcome_id uuid references outcomes(id) on delete set null,
  last_activity_at timestamptz,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists relationships_plane_idx on relationships (plane, visibility, stage);
create index if not exists relationships_workspace_idx on relationships (workspace_id, status);
create index if not exists relationships_type_idx on relationships (relationship_type);

-- Append-only history. Never updated, never deleted; actor keeps human vs agent
-- explicit. Stage moves record from_stage/to_stage.
create table if not exists relationship_events (
  id uuid primary key default gen_random_uuid(),
  relationship_id uuid not null references relationships(id) on delete cascade,
  type text not null,                       -- 'stage_changed' | 'activity' | 'evidence_added' | ...
  actor text not null,                      -- 'user:<id>' | 'agent:<run_id>' | 'system'
  from_stage text,
  to_stage text,
  detail jsonb not null default '{}',
  schema_version int not null default 1,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index if not exists relationship_events_rel_idx on relationship_events (relationship_id, occurred_at);
