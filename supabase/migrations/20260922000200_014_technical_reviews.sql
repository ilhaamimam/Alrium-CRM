-- =========================================================
-- TECHNICAL REVIEW UPGRADE
-- =========================================================
--
-- This migration supports BOTH:
--
-- 1. A project where technical_reviews already exists
-- 2. A fresh project where it does not exist
--
-- =========================================================


-- =========================================================
-- 1. TEAM MEMBER AVAILABILITY
-- =========================================================

alter table public.profiles
add column if not exists availability_status text;


update public.profiles
set availability_status = 'available'
where availability_status is null;


alter table public.profiles
alter column availability_status
set default 'available';


alter table public.profiles
drop constraint if exists profiles_availability_status_check;


alter table public.profiles
add constraint profiles_availability_status_check
check (
    availability_status in (
        'available',
        'busy',
        'unavailable'
    )
);


-- =========================================================
-- 2. CREATE TECHNICAL REVIEWS TABLE IF IT DOES NOT EXIST
-- =========================================================

create table if not exists public.technical_reviews (
    id uuid primary key default gen_random_uuid(),

    lead_id uuid,

    decision text,

    review_notes text,

    reviewed_by uuid,

    reviewed_at timestamptz,

    created_at timestamptz default now(),

    updated_at timestamptz default now()
);


-- =========================================================
-- 3. ADD MISSING COLUMNS TO OLD TABLE
-- =========================================================

alter table public.technical_reviews
add column if not exists lead_id uuid;


alter table public.technical_reviews
add column if not exists decision text;


alter table public.technical_reviews
add column if not exists review_notes text;


alter table public.technical_reviews
add column if not exists reviewed_by uuid;


alter table public.technical_reviews
add column if not exists reviewed_at timestamptz;


alter table public.technical_reviews
add column if not exists created_at timestamptz;


alter table public.technical_reviews
add column if not exists updated_at timestamptz;


-- =========================================================
-- 4. DEFAULT EXISTING TECHNICAL REVIEWS TO PENDING
-- =========================================================

update public.technical_reviews
set decision = 'pending'
where decision is null;


alter table public.technical_reviews
alter column decision
set default 'pending';


alter table public.technical_reviews
alter column decision
set not null;


-- =========================================================
-- 5. TIMESTAMPS
-- =========================================================

update public.technical_reviews
set created_at = now()
where created_at is null;


update public.technical_reviews
set updated_at = now()
where updated_at is null;


alter table public.technical_reviews
alter column created_at
set default now();


alter table public.technical_reviews
alter column updated_at
set default now();


-- =========================================================
-- 6. DECISION CONSTRAINT
-- =========================================================

alter table public.technical_reviews
drop constraint if exists technical_reviews_decision_check;


alter table public.technical_reviews
add constraint technical_reviews_decision_check
check (
    decision in (
        'pending',
        'approved',
        'rejected'
    )
);


-- =========================================================
-- 7. LEAD FOREIGN KEY
-- =========================================================

do $$
begin

    if not exists (
        select 1
        from pg_constraint
        where conname =
            'technical_reviews_lead_id_fkey'
    ) then

        alter table public.technical_reviews
        add constraint technical_reviews_lead_id_fkey
        foreign key (lead_id)
        references public.leads(id)
        on delete cascade;

    end if;

end
$$;


-- =========================================================
-- 8. REVIEWED BY FOREIGN KEY
-- =========================================================

do $$
begin

    if not exists (
        select 1
        from pg_constraint
        where conname =
            'technical_reviews_reviewed_by_fkey'
    ) then

        alter table public.technical_reviews
        add constraint technical_reviews_reviewed_by_fkey
        foreign key (reviewed_by)
        references public.profiles(id)
        on delete set null;

    end if;

end
$$;


-- =========================================================
-- 9. ONE TECHNICAL REVIEW PER LEAD
-- =========================================================
--
-- Required because our Node service uses:
--
-- upsert(..., { onConflict: "lead_id" })
--
-- =========================================================

create unique index if not exists
idx_technical_reviews_unique_lead
on public.technical_reviews(lead_id);


-- =========================================================
-- 10. OTHER INDEXES
-- =========================================================

create index if not exists
idx_technical_reviews_decision
on public.technical_reviews(decision);


create index if not exists
idx_technical_reviews_reviewed_by
on public.technical_reviews(reviewed_by);


create index if not exists
idx_profiles_availability_status
on public.profiles(availability_status);


-- =========================================================
-- 11. ROW LEVEL SECURITY
-- =========================================================

alter table public.technical_reviews
enable row level security;