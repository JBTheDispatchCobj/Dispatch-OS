-- dispatch-os / db/migrations/0013_intelligence_objects.sql
--
-- Cooperative Markets foundation — the Intelligence Object factory
-- (DOCTRINE #4, INTELLIGENCE_OBJECTS_PRD). FORWARD-ONLY and ADDITIVE.
--
-- An Intelligence Object is one sourced unit of market meaning, assembled FROM
-- truth objects (fact/claim/inference refs) and rendered into many lenses and
-- channels via content_variants. The IO never invents facts — it points at the
-- truth objects it is built from, so every published variant stays traceable.
--
-- RLS deferred to ACTIVE_BUILD #2 (see 0011 header). Shared-market IOs are the
-- free publication layer (The Auric); tenant IOs are Terminal-private.

create table if not exists intelligence_objects (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references workspaces(id) on delete cascade,
  organization_id uuid references organizations(id) on delete cascade,
  plane text not null default 'shared_market'
    check (plane in ('shared_market','private_terminal','control')),
  visibility text not null default 'public'
    check (visibility in ('public','network','tenant_private','relationship_private','personal')),
  kind text,                                 -- '<cartridge>:<slug>' when cartridge-specific
  headline text not null,
  summary text,
  fact_refs uuid[] not null default '{}',        -- observations / calculations
  claim_refs uuid[] not null default '{}',       -- claims
  inference_refs uuid[] not null default '{}',   -- inferences
  affected_refs uuid[] not null default '{}',    -- entities / relationships affected
  top_tier text check (top_tier in (
    'public_fact','third_party_claim','deterministic_calculation','dispatch_inference',
    'institution_verified_fact','private_tenant_fact','human_approved_conclusion')),
  relevance jsonb,
  confidence numeric,
  shelf_life_ends_at timestamptz,
  recommended_action text,
  status text not null default 'draft' check (status in
    ('draft','assembled','reviewed','published','archived')),
  published_at timestamptz,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists intelligence_objects_plane_idx on intelligence_objects (plane, visibility, status);
create index if not exists intelligence_objects_kind_idx on intelligence_objects (kind, published_at);

-- A rendered variant for one lens + channel. Carries its own visibility (a
-- public IO may still have a tenant-only variant). Restates, never extends, the
-- IO's facts; source_refs keep it traceable.
create table if not exists content_variants (
  id uuid primary key default gen_random_uuid(),
  intelligence_object_id uuid not null references intelligence_objects(id) on delete cascade,
  lens_type text not null check (lens_type in ('role','institution','person','cartridge','channel')),
  lens_ref text,                             -- role key | workspace id | person id | cartridge key
  channel text not null check (channel in
    ('brief','market_feed','network','two_dollar_bill','terminal_feed','email','api')),
  visibility text not null default 'public'
    check (visibility in ('public','network','tenant_private','relationship_private','personal')),
  title text,
  body text not null default '',
  render_payload jsonb,
  source_refs uuid[] not null default '{}',
  generated_by text,                         -- 'user:<id>' | 'agent:<run_id>' | 'system'
  status text not null default 'draft' check (status in
    ('draft','assembled','reviewed','published','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists content_variants_io_idx on content_variants (intelligence_object_id, lens_type);
create index if not exists content_variants_channel_idx on content_variants (channel, visibility);
