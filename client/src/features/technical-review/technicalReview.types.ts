export type TechnicalDecision =
  | "pending"
  | "approved"
  | "rejected";


export interface TechnicalReview {
  id?: string;

  lead_id: string;

  decision:
    TechnicalDecision;

  review_notes:
    string | null;

  reviewed_by:
    string | null;

  reviewed_at:
    string | null;
}


export interface TechnicalCompany {
  id: string;

  name: string;
}


export interface TechnicalContact {
  id: string;

  first_name: string;

  last_name:
    string | null;

  email:
    string | null;

  phone:
    string | null;
}


export interface TechnicalReviewLead {
  id: string;

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

  created_at?: string;


  companies?:
    TechnicalCompany | null;


  contacts?:
    TechnicalContact | null;


  technical_review:
    TechnicalReview;
}


export interface AvailableTeamMember {
  id: string;

  full_name:
    string | null;

  email: string;

  role: string;

  availability_status:
    string;
}


export interface TechnicalDecisionInput {
  decision:
    "approved" |
    "rejected";

  notes:
    string;
}