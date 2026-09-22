-- =========================================================
-- FINANCIAL REVIEW UPGRADE
-- =========================================================

-- The financial_reviews table already exists from an older
-- migration, so this migration upgrades the existing table
-- instead of trying to recreate it.


-- =========================================================
-- 1. ADD DECISION COLUMN
-- =========================================================

alter table public.financial_reviews
add column if not exists decision text;


-- Set existing rows to pending if they do not yet have
-- a decision.

update public.financial_reviews
set decision = 'pending'
where decision is null;


-- Add default for future rows.

alter table public.financial_reviews
alter column decision
set default 'pending';


-- Make decision required.

alter table public.financial_reviews
alter column decision
set not null;


-- =========================================================
-- 2. ADD REVIEW NOTES
-- =========================================================

alter table public.financial_reviews
add column if not exists review_notes text;


-- =========================================================
-- 3. ADD REVIEWED BY
-- =========================================================

alter table public.financial_reviews
add column if not exists reviewed_by uuid;


-- Add FK only if it does not already exist.

do $$
begin

    if not exists (
        select 1
        from pg_constraint
        where conname = 'financial_reviews_reviewed_by_fkey'
    ) then

        alter table public.financial_reviews
        add constraint financial_reviews_reviewed_by_fkey
        foreign key (reviewed_by)
        references public.profiles(id)
        on delete set null;

    end if;

end
$$;


-- =========================================================
-- 4. ADD REVIEWED AT
-- =========================================================

alter table public.financial_reviews
add column if not exists reviewed_at timestamptz;


-- =========================================================
-- 5. ADD UPDATED AT
-- =========================================================

alter table public.financial_reviews
add column if not exists updated_at timestamptz
default now();


update public.financial_reviews
set updated_at = now()
where updated_at is null;


-- =========================================================
-- 6. ADD CREATED AT IF MISSING
-- =========================================================

alter table public.financial_reviews
add column if not exists created_at timestamptz
default now();


-- =========================================================
-- 7. DECISION VALIDATION
-- =========================================================

-- Remove our constraint first if this migration is retried.

alter table public.financial_reviews
drop constraint if exists financial_reviews_decision_check;


alter table public.financial_reviews
add constraint financial_reviews_decision_check
check (
    decision in (
        'pending',
        'approved',
        'rejected'
    )
);


-- =========================================================
-- 8. INDEXES
-- =========================================================

create index if not exists
idx_financial_reviews_decision
on public.financial_reviews(decision);


create index if not exists
idx_financial_reviews_reviewed_by
on public.financial_reviews(reviewed_by);


-- Create lead_id index only if the old table already has
-- the lead_id column.

do $$
begin

    if exists (
        select 1
        from information_schema.columns
        where table_schema = 'public'
          and table_name = 'financial_reviews'
          and column_name = 'lead_id'
    ) then

        execute '
            create index if not exists
            idx_financial_reviews_lead_id
            on public.financial_reviews(lead_id)
        ';

    end if;

end
$$;


-- =========================================================
-- 9. ENABLE RLS
-- =========================================================

alter table public.financial_reviews
enable row level security;