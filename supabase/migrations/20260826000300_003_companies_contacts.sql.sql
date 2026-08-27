-- =========================================================
-- 003 - COMPANIES AND CONTACTS
-- =========================================================


-- ---------------------------------------------------------
-- COMPANIES
-- ---------------------------------------------------------

create table public.companies (
  id uuid primary key
    default gen_random_uuid(),

  name text
    not null,

  industry text,

  website text,

  phone text,

  address text,

  notes text,

  created_by uuid
    references public.profiles(id)
    on delete set null,

  archived_at timestamptz,

  created_at timestamptz
    not null
    default now(),

  updated_at timestamptz
    not null
    default now()
);


create trigger companies_set_updated_at
before update on public.companies
for each row
execute function public.set_updated_at();


-- ---------------------------------------------------------
-- CONTACTS
-- ---------------------------------------------------------

create table public.contacts (
  id uuid primary key
    default gen_random_uuid(),

  company_id uuid
    references public.companies(id)
    on delete set null,

  first_name text
    not null,

  last_name text,

  email text,

  phone text,

  job_title text,

  notes text,

  created_by uuid
    references public.profiles(id)
    on delete set null,

  archived_at timestamptz,

  created_at timestamptz
    not null
    default now(),

  updated_at timestamptz
    not null
    default now()
);


create trigger contacts_set_updated_at
before update on public.contacts
for each row
execute function public.set_updated_at();