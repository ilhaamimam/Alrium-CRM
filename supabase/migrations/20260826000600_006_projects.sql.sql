-- =========================================================
-- 006 - PROJECTS
-- =========================================================


create table public.projects (
  id uuid primary key
    default gen_random_uuid(),

  lead_id uuid
    not null
    unique
    references public.leads(id)
    on delete restrict,

  name text
    not null,

  description text,

  status public.project_status
    not null
    default 'pending',

  planned_start_date date,

  planned_end_date date,

  actual_start_date date,

  actual_end_date date,

  completion_notes text,

  created_by uuid
    references public.profiles(id)
    on delete set null,

  created_at timestamptz
    not null
    default now(),

  updated_at timestamptz
    not null
    default now(),


  constraint valid_planned_project_dates
  check (
    planned_start_date is null
    or planned_end_date is null
    or planned_end_date >= planned_start_date
  ),


  constraint valid_actual_project_dates
  check (
    actual_start_date is null
    or actual_end_date is null
    or actual_end_date >= actual_start_date
  )
);


create trigger projects_set_updated_at
before update on public.projects
for each row
execute function public.set_updated_at();