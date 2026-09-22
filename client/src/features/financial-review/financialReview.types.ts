export type FinancialDecision =
  | "pending"
  | "approved"
  | "rejected";


export interface FinancialReview {
  id?: string;

  lead_id: string;

  decision:
    FinancialDecision;

  review_notes:
    string | null;

  reviewed_by:
    string | null;

  reviewed_at:
    string | null;
}


export interface LeadCompany {
  id: string;

  name: string;
}


export interface LeadContact {
  id: string;

  first_name: string;

  last_name:
    string | null;

  email:
    string | null;

  phone:
    string | null;
}


export interface FinancialReviewLead {
  id: string;

  /*
   * Always the actual leads.id
   */
  lead_id?: string;

  title?: string;

  name?: string;

  description?:
    string | null;

  status?: string;

  estimated_value?:
    number | null;

  value?:
    number | null;

  budget?:
    number | null;

  company_id?:
    string | null;

  contact_id?:
    string | null;

  created_at?: string;

  updated_at?: string;

  companies?:
    LeadCompany | null;

  contacts?:
    LeadContact | null;

  financial_review:
    FinancialReview;
}


export interface ReviewDecisionInput {
  decision:
    "approved" |
    "rejected";

  notes:
    string;
}