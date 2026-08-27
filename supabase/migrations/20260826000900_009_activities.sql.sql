-- =========================================================
-- 009 - ACTIVITY / AUDIT HISTORY
-- =========================================================


create table public.activities (
  id uuid primary key
    default gen_random_uuid(),

  user_id uuid
    references public.profiles(id)
    on delete set null,

  entity_type public.activity_entity_type
    not null,

  entity_id uuid
    not null,

  action text
    not null,

  description text,

  metadata jsonb
    not null
    default '{}'::jsonb,

  created_at timestamptz
    not null
    default now()
);