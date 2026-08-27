-- =========================================================
-- 005 - FINANCIAL AND TECHNICAL REVIEWS
-- =========================================================


-- =========================================================
-- FINANCIAL REVIEWS
-- =========================================================

create table public.financial_reviews (
  id uuid primary key
    default gen_random_uuid(),

  lead_id uuid
    not null
    unique
    references public.leads(id)
    on delete cascade,

  submitted_by uuid
    references public.profiles(id)
    on delete set null,

  reviewer_id uuid
    references public.profiles(id)
    on delete set null,

  status public.review_status
    not null
    default 'pending',

  approved_budget numeric(14, 2),

  feedback text,

  requested_at timestamptz
    not null
    default now(),

  reviewed_at timestamptz,

  created_at timestamptz
    not null
    default now(),

  updated_at timestamptz
    not null
    default now(),

  constraint financial_budget_not_negative
  check (
    approved_budget is null
    or approved_budget >= 0
  ),

  constraint financial_approval_requires_budget
  check (
    status <> 'approved'
    or approved_budget is not null
  )
);


-- Automatically update updated_at
create trigger financial_reviews_set_updated_at
before update on public.financial_reviews
for each row
execute function public.set_updated_at();



-- =========================================================
-- TECHNICAL REVIEWS
-- =========================================================

create table public.technical_reviews (
  id uuid primary key
    default gen_random_uuid(),

  lead_id uuid
    not null
    unique
    references public.leads(id)
    on delete cascade,

  submitted_by uuid
    references public.profiles(id)
    on delete set null,

  reviewer_id uuid
    references public.profiles(id)
    on delete set null,

  status public.review_status
    not null
    default 'pending',

  feedback text,

  feasibility_notes text,

  requested_at timestamptz
    not null
    default now(),

  reviewed_at timestamptz,

  created_at timestamptz
    not null
    default now(),

  updated_at timestamptz
    not null
    default now()
);


-- Automatically update updated_at
create trigger technical_reviews_set_updated_at
before update on public.technical_reviews
for each row
execute function public.set_updated_at();