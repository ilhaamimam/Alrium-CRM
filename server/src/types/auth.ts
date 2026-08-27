export type AppRole =
  | "sales_manager"
  | "sales_rep"
  | "financial_officer"
  | "technical_officer"
  | "team_member"
  | "senior_manager";

export interface AuthenticatedUser {
  id: string;
  email?: string;
  role?: AppRole;
}