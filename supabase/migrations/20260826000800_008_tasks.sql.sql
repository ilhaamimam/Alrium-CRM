-- =========================================================
-- 008 - PROJECT TASKS
-- =========================================================


create table public.tasks (
  id uuid primary key
    default gen_random_uuid(),

  project_id uuid
    not null
    references public.projects(id)
    on delete cascade,

  team_id uuid
    references public.teams(id)
    on delete set null,

  assigned_to uuid
    references public.profiles(id)
    on delete set null,

  title text
    not null,

  description text,

  status public.task_status
    not null
    default 'pending',

  start_date date,

  due_date date,

  completed_at timestamptz,

  created_by uuid
    references public.profiles(id)
    on delete set null,

  created_at timestamptz
    not null
    default now(),

  updated_at timestamptz
    not null
    default now(),


  constraint valid_task_dates
  check (
    start_date is null
    or due_date is null
    or due_date >= start_date
  )
);


create trigger tasks_set_updated_at
before update on public.tasks
for each row
execute function public.set_updated_at();