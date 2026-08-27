-- =========================================================
-- 002 - USER PROFILES
-- =========================================================


create table public.profiles (
  id uuid primary key
    references auth.users(id)
    on delete cascade,

  full_name text not null default '',

  email text,

  role public.app_role
    not null
    default 'team_member',

  is_active boolean
    not null
    default true,

  created_at timestamptz
    not null
    default now(),

  updated_at timestamptz
    not null
    default now()
);


-- ---------------------------------------------------------
-- UPDATED_AT TRIGGER
-- ---------------------------------------------------------

create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();


-- ---------------------------------------------------------
-- AUTOMATIC PROFILE CREATION
--
-- Whenever Supabase Auth creates a user,
-- create the matching CRM profile.
-- ---------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin

  insert into public.profiles (
    id,
    full_name,
    email
  )
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      ''
    ),
    new.email
  );

  return new;

end;
$$;


revoke all
on function public.handle_new_user()
from public;


create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();


-- ---------------------------------------------------------
-- BACKFILL EXISTING AUTH USERS
--
-- Useful if you created users before this trigger existed.
-- ---------------------------------------------------------

insert into public.profiles (
  id,
  full_name,
  email
)
select
  u.id,
  coalesce(
    u.raw_user_meta_data ->> 'full_name',
    ''
  ),
  u.email
from auth.users u
where not exists (
  select 1
  from public.profiles p
  where p.id = u.id
);