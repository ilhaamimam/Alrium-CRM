export interface TeamMemberProfile {
  id: string;

  full_name: string;

  email: string;

  role: "team_member";

  is_active: boolean;
}


export interface TeamMembership {
  team_id: string;

  user_id: string;

  role_in_team: string | null;

  added_at: string;

  profiles?:
    TeamMemberProfile | null;
}


export interface Team {
  id: string;

  name: string;

  description: string | null;

  created_by: string | null;

  created_at: string;

  updated_at: string;

  team_members?:
    TeamMembership[];
}


export interface TeamAllocationLeadCompany {
  id: string;

  name: string;
}


export interface TeamAllocationLeadContact {
  id: string;

  first_name: string;

  last_name: string | null;

  email: string | null;
}


export interface TeamAllocationLead {
  id: string;

  title: string;

  temperature: string;

  workflow_stage: string;

  estimated_budget: number | null;

  companies?:
    TeamAllocationLeadCompany | null;

  contacts?:
    TeamAllocationLeadContact | null;
}


export interface ExistingProjectTeam {
  team_id: string;

  assigned_at: string;

  teams?: {
    id: string;
    name: string;
  } | null;
}


export interface AllocationProject {
  id: string;

  lead_id: string;

  name: string;

  description: string | null;

  status: string;

  planned_start_date:
    string | null;

  planned_end_date:
    string | null;

  actual_start_date:
    string | null;

  actual_end_date:
    string | null;

  created_at: string;

  updated_at: string;

  leads?:
    TeamAllocationLead | null;

  project_teams?:
    ExistingProjectTeam[];
}


export interface AssignedTeam {
  id: string;

  name: string;

  description: string | null;
}


export interface AssignedProject {
  id: string;

  lead_id: string;

  name: string;

  description: string | null;

  status: string;

  planned_start_date:
    string | null;

  planned_end_date:
    string | null;

  actual_start_date:
    string | null;

  actual_end_date:
    string | null;

  updated_at: string;

  leads?:
    TeamAllocationLead | null;
}


export interface TeamAssignedProject {
  project_id: string;

  team_id: string;

  assigned_by:
    string | null;

  assigned_at: string;

  teams?:
    AssignedTeam | null;

  projects?:
    AssignedProject | null;
}


export interface CreateTeamInput {
  name: string;

  description?: string;
}


export interface AddTeamMemberInput {
  userId: string;

  roleInTeam?: string;
}


export interface AssignTeamInput {
  teamId: string;

  plannedStartDate?:
    string | null;

  plannedEndDate?:
    string | null;
}