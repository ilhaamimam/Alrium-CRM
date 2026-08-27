-- =========================================================
-- 011 - DATABASE INDEXES
-- =========================================================


-- ---------------------------------------------------------
-- PROFILES
-- ---------------------------------------------------------

create index profiles_role_idx
on public.profiles(role);

create index profiles_active_idx
on public.profiles(is_active);



-- ---------------------------------------------------------
-- COMPANIES
-- ---------------------------------------------------------

create index companies_name_idx
on public.companies(name);



-- ---------------------------------------------------------
-- CONTACTS
-- ---------------------------------------------------------

create index contacts_company_id_idx
on public.contacts(company_id);

create index contacts_email_idx
on public.contacts(email);

create index contacts_name_idx
on public.contacts(first_name, last_name);



-- ---------------------------------------------------------
-- LEADS
-- ---------------------------------------------------------

create index leads_company_id_idx
on public.leads(company_id);

create index leads_contact_id_idx
on public.leads(contact_id);

create index leads_assigned_sales_rep_idx
on public.leads(assigned_sales_rep_id);

create index leads_created_by_idx
on public.leads(created_by);

create index leads_temperature_idx
on public.leads(temperature);

create index leads_workflow_stage_idx
on public.leads(workflow_stage);

create index leads_created_at_idx
on public.leads(created_at desc);

create index leads_archived_at_idx
on public.leads(archived_at);



-- ---------------------------------------------------------
-- REVIEWS
-- ---------------------------------------------------------

create index financial_reviews_status_idx
on public.financial_reviews(status);

create index financial_reviews_reviewer_idx
on public.financial_reviews(reviewer_id);

create index technical_reviews_status_idx
on public.technical_reviews(status);

create index technical_reviews_reviewer_idx
on public.technical_reviews(reviewer_id);



-- ---------------------------------------------------------
-- PROJECTS
-- ---------------------------------------------------------

create index projects_status_idx
on public.projects(status);

create index projects_created_at_idx
on public.projects(created_at desc);



-- ---------------------------------------------------------
-- TEAM MEMBERS
-- ---------------------------------------------------------

create index team_members_user_id_idx
on public.team_members(user_id);



-- ---------------------------------------------------------
-- PROJECT TEAMS
-- ---------------------------------------------------------

create index project_teams_team_id_idx
on public.project_teams(team_id);



-- ---------------------------------------------------------
-- TASKS
-- ---------------------------------------------------------

create index tasks_project_id_idx
on public.tasks(project_id);

create index tasks_team_id_idx
on public.tasks(team_id);

create index tasks_assigned_to_idx
on public.tasks(assigned_to);

create index tasks_status_idx
on public.tasks(status);

create index tasks_due_date_idx
on public.tasks(due_date);



-- ---------------------------------------------------------
-- ACTIVITIES
-- ---------------------------------------------------------

create index activities_entity_idx
on public.activities(
  entity_type,
  entity_id
);

create index activities_user_idx
on public.activities(user_id);

create index activities_created_at_idx
on public.activities(created_at desc);