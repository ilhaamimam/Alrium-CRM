export type ApprovedLeadBoardStatus =
  | "pending"
  | "planned"
  | "assigned"
  | "ongoing"
  | "done";


export interface ApprovedLeadCompany {
  id: string;
  name: string;
}


export interface ApprovedLeadContact {
  id: string;

  first_name: string;

  last_name: string | null;

  email: string | null;

  phone: string | null;
}


export interface ApprovedLead {
  id: string;

  title: string;

  description: string | null;

  source: string | null;

  estimated_budget: number | null;

  expected_close_date: string | null;

  temperature: "cold" | "hot";

  workflow_stage: string;

  company_id: string | null;

  contact_id: string | null;

  assigned_sales_rep_id: string | null;

  created_at: string;

  companies?: ApprovedLeadCompany | null;

  contacts?: ApprovedLeadContact | null;
}


export interface ApprovedLeadBoardItem {
  id: string;

  lead_id: string;

  name: string;

  description: string | null;

  status: ApprovedLeadBoardStatus;

  planned_start_date: string | null;

  planned_end_date: string | null;

  actual_start_date: string | null;

  actual_end_date: string | null;

  completion_notes: string | null;

  created_by: string | null;

  created_at: string;

  updated_at: string;

  leads?: ApprovedLead | null;
}


export interface AddApprovedLeadBoardInput {
  leadId: string;

  plannedStartDate?: string;

  plannedEndDate?: string;
}


export interface UpdateApprovedLeadBoardInput {
  name?: string;

  description?: string;

  status?: ApprovedLeadBoardStatus;

  plannedStartDate?: string | null;

  plannedEndDate?: string | null;
}