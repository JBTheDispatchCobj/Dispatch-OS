-- dispatch-os / db/migrations/0015_registry_ops.sql
--
-- Dispatch Knowledge Registry — operational state (ADR-0006). FORWARD-ONLY and
-- ADDITIVE. The registry DECLARATIONS are config-as-data files in the registry
-- store; these two tables persist the RUNTIME state the DKR flow produces:
--   * connector_runs      — an execution ledger (cost + quality observable),
--                           the connector analogue of agent_runs.
--   * discovery_candidates — the research queue (Discover→…→Cartridge pipeline).
--
-- Control-plane operational data: workspace_id is nullable (most runs are
-- system/shared). Nothing here names a vertical. RLS deferred to ACTIVE_BUILD #2
-- (see 0011 header); these are operator/system tables, not tenant-exposed.

create extension if not exists pgcrypto;

-- Connector execution ledger. One row per connector run; mirrors agent_runs so
-- ingestion cost and reliability are observable and auditable.
create table if not exists connector_runs (
  id uuid primary key default gen_random_uuid(),
  connector_key text not null,               -- registry key, e.g. 'connector:sec_edgar'
  source_key text,                           -- registry key of the source ingested
  workspace_id uuid references workspaces(id) on delete cascade,
  organization_id uuid references organizations(id) on delete cascade,
  status text not null default 'running' check (status in ('running','succeeded','failed','partial')),
  trigger_type text,                         -- 'schedule' | 'manual' | 'webhook' | 'discovery'
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  -- observability
  source_documents_written int not null default 0,
  observations_written int not null default 0,
  entities_touched int not null default 0,
  cost_estimate numeric,
  error_message text,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);
create index if not exists connector_runs_connector_idx on connector_runs (connector_key, started_at);
create index if not exists connector_runs_status_idx on connector_runs (status);

-- Research queue. A candidate knowledge source moving through the discovery
-- pipeline; on promotion it becomes a Source (+ Connector) registry entry.
create table if not exists discovery_candidates (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  candidate_type text,                       -- 'api' | 'publication' | 'regulator' | 'podcast' | ...
  location text,                             -- url/handle
  stage text not null default 'discovered' check (stage in (
    'discovered','qualified','connector_defined','parser_defined',
    'entities_mapped','intelligence_mapped','cartridge_assigned','promoted')),
  status text not null default 'proposed' check (status in ('proposed','active','deprecated','archived')),
  promoted_source_key text,                  -- set once promoted into the source registry
  rationale text,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists discovery_candidates_stage_idx on discovery_candidates (stage, status);
