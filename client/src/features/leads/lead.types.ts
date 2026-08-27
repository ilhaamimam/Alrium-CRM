export type LeadTemperature =
  | "cold"
  | "hot";


export type LeadWorkflowStage =
  | "new"
  | "assigned"
  | "financial_review"
  | "technical_review"
  | "approved"
  | "rejected"
  | "converted"
  | "archived";


export interface LeadCompany {
  id: string;
  name: string;
}


export interface LeadContact {
  id: string;

  first_name: string;

  last_name: string | null;

  email: string | null;

  phone: string | null;
}


export interface Lead {
  id: string;

  company_id: string | null;

  contact_id: string | null;

  title: string;

  description: string | null;

  source: string | null;

  estimated_budget: number | null;

  expected_close_date: string | null;

  temperature: LeadTemperature;

  workflow_stage: LeadWorkflowStage;

  assigned_sales_rep_id: string | null;

  created_by: string | null;

  archived_at: string | null;

  created_at: string;

  updated_at: string;

  companies?: LeadCompany | null;

  contacts?: LeadContact | null;
}


export interface CreateLeadInput {
  companyId?: string;

  contactId?: string;

  title: string;

  description?: string;

  source?: string;

  estimatedBudget?: number | null;

  expectedCloseDate?: string;

  assignedSalesRepId?: string;
}


export interface UpdateLeadInput {
  companyId?: string | null;

  contactId?: string | null;

  title?: string;

  description?: string;

  source?: string;

  estimatedBudget?: number | null;

  expectedCloseDate?: string | null;

  assignedSalesRepId?: string | null;
}


export interface SalesRepresentative {
  id: string;

  full_name: string;

  email: string;

  role: "sales_rep";
}