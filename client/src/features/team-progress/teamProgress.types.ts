export type ProjectProgressStatus =
  | "assigned"
  | "ongoing"
  | "on_hold"
  | "done";


export type TaskProgressStatus =
  | "pending"
  | "ongoing"
  | "on_hold"
  | "done";


export interface ProgressCompany {
  id: string;

  name: string;
}


export interface ProgressContact {
  id: string;

  first_name: string;

  last_name: string | null;

  email: string | null;

  phone?: string | null;
}


export interface ProgressLead {
  id: string;

  title: string;

  temperature: string;

  workflow_stage: string;

  companies?:
    ProgressCompany | null;

  contacts?:
    ProgressContact | null;
}


export interface ProgressTeam {
  id: string;

  name: string;

  description?: string | null;
}


export interface ProjectTeamAllocation {
  project_id: string;

  team_id: string;

  assigned_at: string;

  teams?:
    ProgressTeam | null;
}


export interface TaskSummary {
  total: number;

  pending: number;

  ongoing: number;

  on_hold: number;

  done: number;
}


export interface TeamProgressProject {
  id: string;

  lead_id: string;

  name: string;

  description: string | null;

  status:
    ProjectProgressStatus;

  planned_start_date:
    string | null;

  planned_end_date:
    string | null;

  actual_start_date:
    string | null;

  actual_end_date:
    string | null;

  completion_notes:
    string | null;

  created_at: string;

  updated_at: string;

  leads?:
    ProgressLead | null;

  allocated_teams:
    ProjectTeamAllocation[];

  task_summary:
    TaskSummary;
}


export interface AvailableProjectMember {
  id: string;

  full_name: string | null;

  email: string;

  role_in_team:
    string | null;
}


export interface TaskAssignee {
  id: string;

  full_name: string | null;

  email: string;
}


export interface ProjectTask {
  id: string;

  project_id: string;

  title: string;

  description: string | null;

  assigned_to: string | null;

  status:
    TaskProgressStatus;

  due_date: string | null;

  completed_at:
    string | null;

  created_by:
    string | null;

  created_at: string;

  updated_at: string;

  assignee?:
    TaskAssignee | null;
}


export interface TeamProgressProjectDetails {
  id: string;

  lead_id: string;

  name: string;

  description: string | null;

  status:
    ProjectProgressStatus;

  planned_start_date:
    string | null;

  planned_end_date:
    string | null;

  actual_start_date:
    string | null;

  actual_end_date:
    string | null;

  completion_notes:
    string | null;

  created_at: string;

  updated_at: string;

  leads?:
    ProgressLead | null;

  allocated_teams:
    ProjectTeamAllocation[];

  available_members:
    AvailableProjectMember[];

  tasks:
    ProjectTask[];
}


export interface CreateTaskInput {
  title: string;

  description?: string;

  assignedTo?: string;

  dueDate?: string;
}