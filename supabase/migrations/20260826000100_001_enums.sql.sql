-- =========================================================
-- 001 - COMMON ENUMS AND FUNCTIONS
-- =========================================================


-- ---------------------------------------------------------
-- USER ROLES
-- ---------------------------------------------------------

create type public.app_role as enum (
  'sales_manager',
  'sales_rep',
  'financial_officer',
  'technical_officer',
  'team_member',
  'senior_manager'
);


-- ---------------------------------------------------------
-- LEAD TEMPERATURE
-- ---------------------------------------------------------

create type public.lead_temperature as enum (
  'new',
  'cold',
  'hot'
);


-- ---------------------------------------------------------
-- LEAD WORKFLOW
-- ---------------------------------------------------------

create type public.lead_workflow_stage as enum (
  'new',
  'assigned',
  'financial_review',
  'technical_review',
  'approved',
  'rejected',
  'converted',
  'archived'
);


-- ---------------------------------------------------------
-- REVIEW STATUS
-- ---------------------------------------------------------

create type public.review_status as enum (
  'pending',
  'approved',
  'rejected'
);


-- ---------------------------------------------------------
-- PROJECT STATUS
-- ---------------------------------------------------------

create type public.project_status as enum (
  'pending',
  'planned',
  'assigned',
  'ongoing',
  'on_hold',
  'done'
);


-- ---------------------------------------------------------
-- TASK STATUS
-- ---------------------------------------------------------

create type public.task_status as enum (
  'pending',
  'ongoing',
  'on_hold',
  'done'
);


-- ---------------------------------------------------------
-- ACTIVITY ENTITY TYPES
-- ---------------------------------------------------------

create type public.activity_entity_type as enum (
  'company',
  'contact',
  'lead',
  'project',
  'team',
  'task'
);


-- ---------------------------------------------------------
-- GENERIC UPDATED_AT FUNCTION
-- ---------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;