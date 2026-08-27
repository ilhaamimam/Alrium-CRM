-- =========================================================
-- 010 - ROW LEVEL SECURITY
-- =========================================================

-- The frontend will use Supabase primarily for authentication.
-- CRM database reads/writes will go through the Node/Express API.
--
-- The Node backend uses the server-side Supabase secret key
-- for authorized database operations.
--
-- Therefore direct browser access to CRM tables is blocked
-- for now.


-- =========================================================
-- ENABLE ROW LEVEL SECURITY
-- =========================================================

alter table public.profiles
enable row level security;

alter table public.companies
enable row level security;

alter table public.contacts
enable row level security;

alter table public.leads
enable row level security;

alter table public.financial_reviews
enable row level security;

alter table public.technical_reviews
enable row level security;

alter table public.projects
enable row level security;

alter table public.teams
enable row level security;

alter table public.team_members
enable row level security;

alter table public.project_teams
enable row level security;

alter table public.tasks
enable row level security;

alter table public.activities
enable row level security;


-- =========================================================
-- REMOVE DIRECT ACCESS FROM ANONYMOUS USERS
-- =========================================================

revoke all on table public.profiles
from anon;

revoke all on table public.companies
from anon;

revoke all on table public.contacts
from anon;

revoke all on table public.leads
from anon;

revoke all on table public.financial_reviews
from anon;

revoke all on table public.technical_reviews
from anon;

revoke all on table public.projects
from anon;

revoke all on table public.teams
from anon;

revoke all on table public.team_members
from anon;

revoke all on table public.project_teams
from anon;

revoke all on table public.tasks
from anon;

revoke all on table public.activities
from anon;


-- =========================================================
-- REMOVE DIRECT CRM TABLE ACCESS FROM AUTHENTICATED CLIENTS
-- =========================================================

revoke all on table public.profiles
from authenticated;

revoke all on table public.companies
from authenticated;

revoke all on table public.contacts
from authenticated;

revoke all on table public.leads
from authenticated;

revoke all on table public.financial_reviews
from authenticated;

revoke all on table public.technical_reviews
from authenticated;

revoke all on table public.projects
from authenticated;

revoke all on table public.teams
from authenticated;

revoke all on table public.team_members
from authenticated;

revoke all on table public.project_teams
from authenticated;

revoke all on table public.tasks
from authenticated;

revoke all on table public.activities
from authenticated;


-- =========================================================
-- PROFILE POLICY
--
-- Allow a logged-in user to read only their own profile.
-- This will be useful for checking their role after login.
-- =========================================================

grant select on table public.profiles
to authenticated;


create policy "Users can view own profile"
on public.profiles
for select
to authenticated
using (
  id = auth.uid()
);