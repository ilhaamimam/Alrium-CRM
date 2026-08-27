-- =========================================================
-- 007 - TEAMS
-- =========================================================


-- ---------------------------------------------------------
-- TEAMS
-- ---------------------------------------------------------

create table public.teams (
  id uuid primary key
    default gen_random_uuid(),

  name text
    not null
    unique,

  description text,

  created_by uuid
    references public.profiles(id)
    on delete set null,

  created_at timestamptz
    not null
    default now(),

  updated_at timestamptz
    not null
    default now()
);


create trigger teams_set_updated_at
before update on public.teams
for each row
execute function public.set_updated_at();



-- ---------------------------------------------------------
-- TEAM MEMBERS
-- ---------------------------------------------------------

create table public.team_members (
  team_id uuid
    not null
    references public.teams(id)
    on delete cascade,

  user_id uuid
    not null
    references public.profiles(id)
    on delete cascade,

  role_in_team text,

  added_by uuid
    references public.profiles(id)
    on delete set null,

  added_at timestamptz
    not null
    default now(),

  primary key (
    team_id,
    user_id
  )
);



-- ---------------------------------------------------------
-- PROJECT ↔ TEAM ALLOCATION
-- ---------------------------------------------------------

create table public.project_teams (
  project_id uuid
    not null
    references public.projects(id)
    on delete cascade,

  team_id uuid
    not null
    references public.teams(id)
    on delete cascade,

  assigned_by uuid
    references public.profiles(id)
    on delete set null,

  assigned_at timestamptz
    not null
    default now(),

  primary key (
    project_id,
    team_id
  )
);