-- dispatch-os / db/migrations/0014_personal_profiles.sql
--
-- Cooperative Markets foundation — Personal operating profiles
-- (PERSONAL_PROFILE_PRD) and their refining objects. FORWARD-ONLY and ADDITIVE.
--
-- Models the person: role, responsibilities, institution, access, preferred
-- channels; refined by profile_signals (reading behavior) into interests and
-- goals. Greater access improves capacity while respecting permissions, so a
-- profile defaults to visibility 'personal'.
--
-- This is the PERSON profile. Institution/company/product public profiles are a
-- computed projection over Entity + truth objects (BUILD_SEQUENCE #8), not here.
-- RLS deferred to ACTIVE_BUILD #2 (see 0011 header).

create table if not exists personal_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references user_profiles(id) on delete set null,  -- null = unclaimed public person
  organization_id uuid references organizations(id) on delete cascade,
  workspace_id uuid references workspaces(id) on delete cascade,
  institution_ref uuid,                      -- entity/workspace the person operates within
  display_name text not null,
  role text,
  responsibilities text[] not null default '{}',
  access_scope jsonb,                        -- decision authority + system access context
  preferred_channels text[] not null default '{}',
  visibility text not null default 'personal'
    check (visibility in ('public','network','tenant_private','relationship_private','personal')),
  status text not null default 'active' check (status in ('active','inactive','archived')),
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists personal_profiles_user_idx on personal_profiles (user_id);
create index if not exists personal_profiles_org_idx on personal_profiles (organization_id, status);

-- Observed behavior signals that refine the profile. Append-only.
create table if not exists profile_signals (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references personal_profiles(id) on delete cascade,
  signal_type text not null,                 -- 'read' | 'save' | 'comment' | 'vote' | 'referral' | 'search' | 'dwell' | ...
  subject_ref uuid,                          -- IO / entity / relationship id
  weight numeric,
  detail jsonb,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index if not exists profile_signals_profile_idx on profile_signals (profile_id, occurred_at);

-- Topics/entities the person cares about — declared or inferred from signals.
create table if not exists interests (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references personal_profiles(id) on delete cascade,
  topic text not null,
  subject_ref uuid,
  strength numeric,                          -- 0..1 derived, or declared weight
  source text not null default 'inferred' check (source in ('declared','inferred')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists interests_profile_idx on interests (profile_id, topic);

-- Objectives the person is operating toward. Links to relationships/workflows.
create table if not exists goals (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references personal_profiles(id) on delete cascade,
  statement text not null,
  goal_type text,                            -- 'project' | 'objective' | 'mandate' | ...
  status text not null default 'open' check (status in ('open','in_progress','achieved','abandoned')),
  target_date timestamptz,
  related_relationship_ids uuid[] not null default '{}',
  related_workflow_ids uuid[] not null default '{}',
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists goals_profile_idx on goals (profile_id, status);
