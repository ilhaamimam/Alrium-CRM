export type CompletionReviewStatus =
  | "not_submitted"
  | "pending_review"
  | "changes_requested"
  | "confirmed";


export interface CompletionCompany {
  id: string;

  name: string;
}


export interface CompletionContact {
  id: string;

  first_name: string;

  last_name: string | null;

  email: string | null;

  phone: string | null;
}


export interface CompletionLead {
  id: string;

  title: string;

  temperature: string;

  workflow_stage: string;

  assigned_sales_rep_id:
    string | null;

  created_by:
    string | null;

  companies?:
    CompletionCompany | null;

  contacts?:
    CompletionContact | null;
}


export interface CompletionTeam {
  id: string;

  name: string;
}


export interface CompletionProjectTeam {
  team_id: string;

  teams?:
    CompletionTeam | null;
}


export interface CompletionTask {
  id: string;

  project_id?: string;

  title: string;

  description?: string | null;

  status: string;

  assigned_to:
    string | null;

  due_date:
    string | null;

  completed_at:
    string | null;

  updated_at?: string;
}


export interface ProjectCompletionStatus {
  id: string;

  status: string;

  completion_review_status:
    CompletionReviewStatus;

  completion_notes:
    string | null;

  team_completed_at:
    string | null;

  team_completed_by:
    string | null;

  senior_reviewed_at:
    string | null;

  senior_reviewed_by:
    string | null;

  senior_review_notes:
    string | null;

  final_update_at:
    string | null;
}


export interface CompletionReviewProject {
  id: string;

  lead_id: string;

  name: string;

  description:
    string | null;

  status: string;

  completion_review_status:
    CompletionReviewStatus;

  completion_notes:
    string | null;

  planned_start_date:
    string | null;

  planned_end_date:
    string | null;

  actual_start_date:
    string | null;

  actual_end_date:
    string | null;

  team_completed_at:
    string | null;

  team_completed_by:
    string | null;

  senior_reviewed_at:
    string | null;

  senior_reviewed_by:
    string | null;

  senior_review_notes:
    string | null;

  final_update_at:
    string | null;

  created_at: string;

  updated_at: string;

  leads?:
    CompletionLead | null;

  project_teams?:
    CompletionProjectTeam[];

  tasks?:
    CompletionTask[];
}


export interface FinalProjectUpdate {
  id: string;

  lead_id: string;

  name: string;

  description:
    string | null;

  status: string;

  completion_review_status:
    "confirmed";

  completion_notes:
    string | null;

  senior_review_notes:
    string | null;

  team_completed_at:
    string | null;

  senior_reviewed_at:
    string | null;

  actual_start_date:
    string | null;

  actual_end_date:
    string | null;

  final_update_at:
    string | null;

  planned_start_date:
    string | null;

  planned_end_date:
    string | null;

  leads?:
    CompletionLead | null;

  project_teams?:
    CompletionProjectTeam[];
}