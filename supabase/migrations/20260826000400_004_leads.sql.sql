-- =========================================================
-- 004 - LEADS
-- =========================================================


create table public.leads (
  id uuid primary key
    default gen_random_uuid(),

  company_id uuid
    references public.companies(id)
    on delete set null,

  contact_id uuid
    references public.contacts(id)
    on delete set null,


  -- Opportunity / lead information
  title text
    not null,

  description text,

  source text,

  estimated_budget numeric(14,2),

  expected_close_date date,


  -- Hot / Cold / New
  temperature public.lead_temperature
    not null
    default 'new',


  -- Actual CRM workflow
  workflow_stage public.lead_workflow_stage
    not null
    default 'new',


  -- Assigned sales person
  assigned_sales_rep_id uuid
    references public.profiles(id)
    on delete set null,


  -- Person who created lead
  created_by uuid
    references public.profiles(id)
    on delete set null,


  -- Workflow timestamps
  submitted_financial_at timestamptz,

  submitted_technical_at timestamptz,

  approved_at timestamptz,


  -- Archiving
  archived_at timestamptz,

  archived_by uuid
    references public.profiles(id)
    on delete set null,

  archive_reason text,


  created_at timestamptz
    not null
    default now(),

  updated_at timestamptz
    not null
    default now(),


  constraint leads_budget_not_negative
  check (
    estimated_budget is null
    or estimated_budget >= 0
  )
);


create trigger leads_set_updated_at
before update on public.leads
for each row
execute function public.set_updated_at();