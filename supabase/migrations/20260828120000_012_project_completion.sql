-- =========================================================
-- PROJECT COMPLETION REVIEW WORKFLOW
-- =========================================================


-- ---------------------------------------------------------
-- 1. Completion review enum
-- ---------------------------------------------------------

do $$
begin

  if not exists (
    select 1
    from pg_type
    where typname = 'project_completion_review_status'
  ) then

    create type public.project_completion_review_status
    as enum (
      'not_submitted',
      'pending_review',
      'changes_requested',
      'confirmed'
    );

  end if;

end
$$;


-- ---------------------------------------------------------
-- 2. Add completion review fields to projects
-- ---------------------------------------------------------

alter table public.projects
add column if not exists completion_review_status
  public.project_completion_review_status
  not null
  default 'not_submitted';


alter table public.projects
add column if not exists team_completed_at
  timestamptz;


alter table public.projects
add column if not exists team_completed_by
  uuid
  references public.profiles(id)
  on delete set null;


alter table public.projects
add column if not exists senior_reviewed_at
  timestamptz;


alter table public.projects
add column if not exists senior_reviewed_by
  uuid
  references public.profiles(id)
  on delete set null;


alter table public.projects
add column if not exists senior_review_notes
  text;


alter table public.projects
add column if not exists final_update_at
  timestamptz;


-- ---------------------------------------------------------
-- 3. Helpful indexes
-- ---------------------------------------------------------

create index if not exists
idx_projects_completion_review_status
on public.projects (
  completion_review_status
);


create index if not exists
idx_projects_senior_reviewed_at
on public.projects (
  senior_reviewed_at
);


create index if not exists
idx_projects_final_update_at
on public.projects (
  final_update_at
);